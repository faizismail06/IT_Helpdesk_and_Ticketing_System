import { prisma } from '../config/db';
import { generateTicketNumber } from '../utils/ticketNumber';
import { CreateTicketInput, TicketQueryInput } from '../validators/ticket.validator';
import { JwtPayload } from '../types';
import { TicketStatus, RoleName } from '@prisma/client';
import { createAndEmitNotification, emitToRoom } from '../socket';

export class TicketService {
 static async createTicket(requester: JwtPayload, input: CreateTicketInput) {
 // 1. Fetch SLA Rule for selected priority
 const slaRule = await prisma.slaRule.findUnique({
 where: { priority: input.priority },
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
 priority: input.priority,
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
 newValue: `Ticket created with status NEW and priority ${input.priority}`,
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
 ...roleWhere,
 ...searchWhere,
 ...(status && { status }),
 ...(priority && { priority }),
 ...(categoryId && { categoryId }),
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

 // Role authorization check for Employee
 if (currentUser.role === RoleName.EMPLOYEE && ticket.requesterId !== currentUser.userId) {
 throw { statusCode: 403, message: 'Access denied to this ticket' };
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
