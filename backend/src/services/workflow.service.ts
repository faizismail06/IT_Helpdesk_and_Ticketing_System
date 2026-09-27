import { prisma } from '../config/db';
import { TicketStatus, RoleName } from '@prisma/client';
import { JwtPayload } from '../types';
import { StatusTransitionInput, AssignTicketInput, AddCommentInput } from '../validators/workflow.validator';
import { createAndEmitNotification, emitToRoom } from '../socket';
import { AuditLogService } from './auditLog.service';

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
 NEW: [TicketStatus.OPEN],
 OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.PENDING],
 IN_PROGRESS: [TicketStatus.PENDING, TicketStatus.RESOLVED],
 PENDING: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
 RESOLVED: [TicketStatus.CLOSED, TicketStatus.REOPENED],
 CLOSED: [TicketStatus.REOPENED],
 REOPENED: [TicketStatus.IN_PROGRESS],
 OVERDUE: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
};

export class WorkflowService {
 private static async getTicketForAction(ticketId: string, actor: JwtPayload) {
 const ticket = await prisma.ticket.findUnique({
 where: { id: ticketId },
 include: {
 assignments: {
 orderBy: { assignedAt: 'desc' },
 take: 1,
 select: { technicianId: true },
 },
 },
 });

 if (!ticket) {
 throw { statusCode: 404, message: 'Ticket not found' };
 }

 if (actor.role === RoleName.EMPLOYEE && ticket.requesterId !== actor.userId) {
 throw { statusCode: 403, message: 'Access denied to this ticket' };
 }

 if (actor.role === RoleName.TECHNICIAN) {
 const isRequester = ticket.requesterId === actor.userId;
 const isAssignedTechnician = ticket.assignments[0]?.technicianId === actor.userId;
 if (!isRequester && !isAssignedTechnician) {
 throw { statusCode: 403, message: 'This ticket is not assigned to you' };
 }
 }

 return ticket;
 }

 static validateStatusTransition(
 currentStatus: TicketStatus,
 targetStatus: TicketStatus,
 role: RoleName
 ): boolean {
 if (currentStatus === targetStatus) return false;

 const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
 if (!allowed.includes(targetStatus)) {
 return false;
 }

 // Role specific restrictions
 if (role === RoleName.EMPLOYEE) {
 // Employee can only REOPEN or CLOSE resolved tickets
 if (currentStatus === TicketStatus.RESOLVED) {
 return (targetStatus as TicketStatus) === TicketStatus.CLOSED || (targetStatus as TicketStatus) === TicketStatus.REOPENED;
 }
 if (currentStatus === TicketStatus.CLOSED) {
 return (targetStatus as TicketStatus) === TicketStatus.REOPENED;
 }
 return false;
 }

 if (role === RoleName.TECHNICIAN) {
 const technicianTransitions: Partial<Record<TicketStatus, TicketStatus[]>> = {
 OPEN: [TicketStatus.IN_PROGRESS],
 IN_PROGRESS: [TicketStatus.PENDING, TicketStatus.RESOLVED],
 PENDING: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
 REOPENED: [TicketStatus.IN_PROGRESS],
 OVERDUE: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
 };
 return technicianTransitions[currentStatus]?.includes(targetStatus) ?? false;
 }

 return true;
 }

 static async changeStatus(ticketId: string, actor: JwtPayload, input: StatusTransitionInput) {
 const ticket = await this.getTicketForAction(ticketId, actor);

 const isValid = this.validateStatusTransition(ticket.status, input.status, actor.role);
 if (!isValid) {
 throw {
 statusCode: 400,
 message: `Invalid status transition from ${ticket.status} to ${input.status} for role ${actor.role}`,
 };
 }

 const result = await prisma.$transaction(async (tx) => {
 const updatedTicket = await tx.ticket.update({
 where: { id: ticketId },
 data: {
 status: input.status,
 ...(input.workTimeMins && { workTimeMins: ticket.workTimeMins + input.workTimeMins }),
 },
 });

 // Log history
 await tx.ticketHistory.create({
 data: {
 ticketId,
 actorId: actor.userId,
 action: 'STATUS_CHANGED',
 oldValue: ticket.status,
 newValue: input.status,
 },
 });

 // If a reason/comment was provided during status change
 if (input.reason && input.reason.trim()) {
 await tx.ticketComment.create({
 data: {
 ticketId,
 userId: actor.userId,
 message: `[Status changed to ${input.status}] ${input.reason}`,
 isInternal: false,
 },
 });
 }

 // Notify Requester
 if (ticket.requesterId !== actor.userId) {
 createAndEmitNotification(
 ticket.requesterId,
 `Ticket Status Updated`,
 `Ticket ${ticket.ticketNumber} status changed to ${input.status}.`,
 ticketId
 );
 }

 // Emit to active detail viewers
 emitToRoom(`ticket_${ticketId}`, 'ticket:status_changed', {
 ticketId,
 oldStatus: ticket.status,
 newStatus: input.status,
 updatedAt: updatedTicket.updatedAt,
 });

 return updatedTicket;
 });
 await AuditLogService.logAction(actor.userId, 'Ticket status changed', 'TICKET', ticketId, { from: ticket.status, to: input.status });
 return result;
 }

 static async assignTechnician(ticketId: string, helpdeskUser: JwtPayload, input: AssignTicketInput) {
 const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
 if (!ticket) {
 throw { statusCode: 404, message: 'Ticket not found' };
 }

 const tech = await prisma.user.findUnique({ where: { id: input.technicianId } });
 if (!tech || tech.role !== RoleName.TECHNICIAN || !tech.isActive) {
 throw { statusCode: 400, message: 'Assigned user must be an active technician' };
 }

 if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
 throw { statusCode: 400, message: 'Resolved or closed tickets cannot be assigned' };
 }

 const result = await prisma.$transaction(async (tx) => {
 const slaRule = await tx.slaRule.findUnique({ where: { priority: input.priority } });
 const resolutionHours = slaRule?.resolutionHours ?? 24;
 const slaDeadline = new Date(ticket.createdAt.getTime() + resolutionHours * 60 * 60 * 1000);

 // Keep one active assignment. Reassignment history remains in TicketHistory.
 await tx.ticketAssignment.deleteMany({ where: { ticketId } });

 // 1. Create assignment record
 const assignment = await tx.ticketAssignment.create({
 data: {
 ticketId,
 technicianId: input.technicianId,
 assignedById: helpdeskUser.userId,
 },
 include: {
 technician: { select: { id: true, fullName: true, email: true } },
 },
 });

 // 2. Assignment completes triage. The technician starts work separately.
 let newStatus = ticket.status;
 if (ticket.status === TicketStatus.NEW) {
 newStatus = TicketStatus.OPEN;
 }

 await tx.ticket.update({
 where: { id: ticketId },
 data: {
 status: newStatus,
 priority: input.priority,
 isPriorityReviewed: true,
 slaDeadline,
 isOverdue: slaDeadline.getTime() < Date.now(),
 },
 });

 // 3. History record
 await tx.ticketHistory.create({
 data: {
 ticketId,
 actorId: helpdeskUser.userId,
 action: 'ASSIGNED',
 oldValue: ticket.status,
 newValue: `Assigned to ${tech.fullName}; priority confirmed as ${input.priority} (Status: ${newStatus})`,
 },
 });

 // Notify Assigned Technician
 createAndEmitNotification(
 input.technicianId,
 'New Ticket Assigned',
 `You have been assigned ticket ${ticket.ticketNumber}.`,
 ticketId
 );

 return assignment;
 });
 await AuditLogService.logAction(helpdeskUser.userId, 'Ticket assigned', 'TICKET', ticketId, { technicianId: input.technicianId, priority: input.priority });
 return result;
 }

 static async addComment(ticketId: string, actor: JwtPayload, input: AddCommentInput) {
 const ticket = await this.getTicketForAction(ticketId, actor);

 // Employee cannot post internal IT notes
 let isInternal = input.isInternal;
 if (actor.role === RoleName.EMPLOYEE) {
 isInternal = false;
 }

 const comment = await prisma.ticketComment.create({
 data: {
 ticketId,
 userId: actor.userId,
 message: input.message,
 isInternal,
 },
 include: {
 user: {
 select: { id: true, fullName: true, role: true, avatarUrl: true },
 },
 },
 });

 // Emit comment event to ticket detail room
 emitToRoom(`ticket_${ticketId}`, 'ticket:comment_added', comment);

 // Notify requester if comment posted by staff
 if (actor.userId !== ticket.requesterId && !isInternal) {
 createAndEmitNotification(
 ticket.requesterId,
 'New Comment on Ticket',
 `A support reply was posted on ticket ${ticket.ticketNumber}.`,
 ticketId
 );
 }

 await AuditLogService.logAction(actor.userId, isInternal ? 'Internal note added' : 'Ticket comment added', 'TICKET', ticketId, { commentId: comment.id });

 return comment;
 }
}
