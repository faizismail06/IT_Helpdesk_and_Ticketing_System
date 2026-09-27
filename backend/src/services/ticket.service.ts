import { prisma } from '../config/db';
import { generateTicketNumber } from '../utils/ticketNumber';
import { CreateTicketInput, TicketQueryInput, UpdateTicketInput } from '../validators/ticket.validator';
import { JwtPayload } from '../types';
import { TicketStatus, RoleName } from '@prisma/client';
import { createAndEmitNotification, emitToRoom } from '../socket';
import { calculateSuggestedPriority } from '../utils/ticketPriority';
import { AuditLogService } from './auditLog.service';

export class TicketService {
 static async createTicket(requester: JwtPayload, input: CreateTicketInput) {
 const suggestedPriority = calculateSuggestedPriority(input.impact, input.urgency);

 // 1. Fetch SLA Rule for the system-suggested priority.
 const slaRule = await prisma.slaRule.findUnique({
 where: { priority: suggestedPriority },
 });

 const resolutionHours = slaRule ? slaRule.resolutionHours : 24; // Default fallback 24h
 const now = new Date();
 const slaDeadline = new Date(now.getTime() + resolutionHours * 60 * 60 * 1000);

 // 2. Generate unique ticket number (e.g., IT-2026-000001)
 const ticketNumber = await generateTicketNumber();

 // 3. Create Ticket and initial History entry in a transaction
 const ticket = await prisma.$transaction(async (tx) => {
 const newTicket = await tx.ticket.create({
 data: {
 ticketNumber,
 subject: input.subject,
 description: input.description,
 categoryId: input.categoryId,
 impact: input.impact,
 urgency: input.urgency,
 suggestedPriority,
 priority: suggestedPriority,
 status: TicketStatus.NEW,
 requesterId: requester.userId,
 slaDeadline,
 },
 include: {
 category: true,
 requester: {
 select: {
 id: true,
 fullName: true,
 email: true,
 department: { select: { name: true, code: true } },
 },
 },
 },
 });

 // Record initial history
 await tx.ticketHistory.create({
 data: {
 ticketId: newTicket.id,
 actorId: requester.userId,
 action: 'CREATED',
 oldValue: null,
 newValue: `Ticket created as NEW; suggested priority ${suggestedPriority} from ${input.impact} impact and ${input.urgency} urgency`,
 },
 });

 return newTicket;
 });

 // 4. Realtime Notifications & Sockets
 createAndEmitNotification(
 requester.userId,
 'Ticket Created',
 `Ticket ${ticket.ticketNumber} created successfully.`,
 ticket.id
 );
 await AuditLogService.logAction(requester.userId, 'Ticket created', 'TICKET', ticket.id, { ticketNumber: ticket.ticketNumber });

 // Notify Helpdesk team room
 emitToRoom(
 'role_helpdesk',
 'ticket:created',
 {
 message: `New ticket ${ticket.ticketNumber} requires triage.`,
 ticketNumber: ticket.ticketNumber,
 ticketId: ticket.id,
 }
 );

 return ticket;
 }

 static async updateTicket(ticketId: string, requester: JwtPayload, input: UpdateTicketInput) {
 const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
 if (!ticket) throw { statusCode: 404, message: 'Ticket not found' };
 if (requester.role !== RoleName.EMPLOYEE || ticket.requesterId !== requester.userId) throw { statusCode: 403, message: 'Only the requester can edit this ticket' };
 if (ticket.status !== TicketStatus.NEW) throw { statusCode: 400, message: 'Only NEW tickets can be edited' };
 const impact = input.impact ?? ticket.impact;
 const urgency = input.urgency ?? ticket.urgency;
 const suggestedPriority = calculateSuggestedPriority(impact, urgency);
 const slaRule = await prisma.slaRule.findUnique({ where: { priority: suggestedPriority } });
 const updated = await prisma.ticket.update({
 where: { id: ticketId },
 data: { ...input, impact, urgency, suggestedPriority, priority: suggestedPriority, slaDeadline: new Date(ticket.createdAt.getTime() + (slaRule?.resolutionHours ?? 24) * 3_600_000) },
 });
 await prisma.ticketHistory.create({ data: { ticketId, actorId: requester.userId, action: 'UPDATED', newValue: 'Requester updated ticket details' } });
 await AuditLogService.logAction(requester.userId, 'Ticket updated by requester', 'TICKET', ticketId);
 emitToRoom('role_helpdesk', 'ticket:updated', { ticketId });
 return updated;
 }

 static async cancelTicket(ticketId: string, requester: JwtPayload) {
 const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
 if (!ticket) throw { statusCode: 404, message: 'Ticket not found' };
 if (requester.role !== RoleName.EMPLOYEE || ticket.requesterId !== requester.userId) throw { statusCode: 403, message: 'Only the requester can cancel this ticket' };
 if (ticket.status !== TicketStatus.NEW) throw { statusCode: 400, message: 'Only NEW tickets can be cancelled' };
 const updated = await prisma.ticket.update({ where: { id: ticketId }, data: { status: TicketStatus.CLOSED } });
 await prisma.ticketHistory.create({ data: { ticketId, actorId: requester.userId, action: 'CANCELLED', oldValue: TicketStatus.NEW, newValue: TicketStatus.CLOSED } });
 await AuditLogService.logAction(requester.userId, 'Ticket cancelled by requester', 'TICKET', ticketId);
 emitToRoom('role_helpdesk', 'ticket:status_changed', { ticketId, oldStatus: TicketStatus.NEW, newStatus: TicketStatus.CLOSED });
 return updated;
 }

 static async getTickets(currentUser: JwtPayload, query: TicketQueryInput) {
 const { q, status, priority, categoryId, page, limit, sortBy, sortOrder } = query;
 const skip = (page - 1) * limit;

 // Role-based visibility scoping
 const roleWhere: any = {};
 if (currentUser.role === RoleName.EMPLOYEE) {
 roleWhere.requesterId = currentUser.userId;
 } else if (currentUser.role === RoleName.TECHNICIAN) {
 roleWhere.OR = [
 { requesterId: currentUser.userId },
 { assignments: { some: { technicianId: currentUser.userId } } },
 ];
 }

 // Search and filter conditions
 const searchWhere: any = {};
 if (q) {
 searchWhere.OR = [
 { ticketNumber: { contains: q, mode: 'insensitive' } },
 { subject: { contains: q, mode: 'insensitive' } },
 { description: { contains: q, mode: 'insensitive' } },
 { requester: { fullName: { contains: q, mode: 'insensitive' } } },
 ];
 }

 const where = {
 AND: [
 roleWhere,
 searchWhere,
 ...(status ? [{ status }] : []),
 ...(priority ? [{ priority }] : []),
 ...(categoryId ? [{ categoryId }] : []),
 ],
 };

 const [total, tickets] = await Promise.all([
 prisma.ticket.count({ where }),
 prisma.ticket.findMany({
 where,
 skip,
 take: limit,
 orderBy: { [sortBy]: sortOrder },
 include: {
 category: { select: { id: true, name: true } },
 requester: {
 select: {
 id: true,
 fullName: true,
 email: true,
 department: { select: { name: true, code: true } },
 },
 },
 assignments: {
 take: 1,
 orderBy: { assignedAt: 'desc' },
 select: {
 technician: {
 select: { id: true, fullName: true, email: true },
 },
 assignedAt: true,
 },
 },
 },
 }),
 ]);

 return {
 tickets,
 pagination: {
 total,
 page,
 limit,
 totalPages: Math.ceil(total / limit),
 },
 };
 }

 static async getTicketById(ticketIdOrNumber: string, currentUser: JwtPayload) {
 const ticket = await prisma.ticket.findFirst({
 where: {
 OR: [{ id: ticketIdOrNumber }, { ticketNumber: ticketIdOrNumber }],
 },
 include: {
 category: true,
 requester: {
 select: {
 id: true,
 fullName: true,
 email: true,
 avatarUrl: true,
 department: { select: { id: true, name: true, code: true } },
 },
 },
 assignments: {
 orderBy: { assignedAt: 'desc' },
 include: {
 technician: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
 assignedBy: { select: { id: true, fullName: true } },
 },
 },
 comments: {
 where: currentUser.role === RoleName.EMPLOYEE ? { isInternal: false } : undefined,
 orderBy: { createdAt: 'asc' },
 include: {
 user: { select: { id: true, fullName: true, role: true, avatarUrl: true } },
 attachments: true,
 },
 },
 attachments: true,
 history: {
 orderBy: { timestamp: 'desc' },
 include: {
 actor: { select: { id: true, fullName: true, role: true } },
 },
 },
 rating: true,
 },
 });

 if (!ticket) {
 throw { statusCode: 404, message: 'Ticket not found' };
 }

 // Enforce the same visibility rules used by the ticket list.
 if (currentUser.role === RoleName.EMPLOYEE && ticket.requesterId !== currentUser.userId) {
 throw { statusCode: 403, message: 'Access denied to this ticket' };
 }

 if (currentUser.role === RoleName.TECHNICIAN) {
 const isRequester = ticket.requesterId === currentUser.userId;
 const latestAssignment = ticket.assignments[0];
 const isAssignedTechnician = latestAssignment?.technician.id === currentUser.userId;

 if (!isRequester && !isAssignedTechnician) {
 throw { statusCode: 403, message: 'This ticket is not assigned to you' };
 }
 }

 return ticket;
 }

 static async getCategories() {
 return prisma.ticketCategory.findMany({
 where: { isActive: true },
 orderBy: { name: 'asc' },
 });
 }
}
