import { prisma } from '../config/db';
import { TicketPriority, TicketStatus } from '@prisma/client';

export interface ReportFilterInput {
 startDate?: string;
 endDate?: string;
 priority?: TicketPriority;
 status?: TicketStatus;
 categoryId?: string;
}

export class ReportService {
 static async getReportData(filters: ReportFilterInput) {
 const { startDate, endDate, priority, status, categoryId } = filters;

 const where: any = {};

 if (priority) where.priority = priority;
 if (status) where.status = status;
 if (categoryId) where.categoryId = categoryId;

 if (startDate || endDate) {
 where.createdAt = {};
 if (startDate) where.createdAt.gte = new Date(startDate);
 if (endDate) where.createdAt.lte = new Date(endDate);
 }

 const tickets = await prisma.ticket.findMany({
 where,
 orderBy: { createdAt: 'desc' },
 include: {
 category: { select: { name: true } },
 requester: { select: { fullName: true, email: true, department: { select: { name: true } } } },
 assignments: {
 take: 1,
 orderBy: { assignedAt: 'desc' },
 include: { technician: { select: { fullName: true } } },
 },
 rating: true,
 },
 });

 const formatted = tickets.map((t) => ({
 ticketNumber: t.ticketNumber,
 subject: t.subject,
 category: t.category?.name || 'Uncategorized',
 priority: t.priority,
 status: t.status,
 requester: t.requester.fullName,
 department: t.requester.department?.name || 'N/A',
 technician: t.assignments?.[0]?.technician.fullName || 'Unassigned',
 slaDeadline: t.slaDeadline.toISOString(),
 isOverdue: t.isOverdue ? 'YES' : 'NO',
 workTimeMins: t.workTimeMins,
 ratingScore: t.rating?.score || 'N/A',
 ratingFeedback: t.rating?.feedback || '',
 createdDate: t.createdAt.toISOString(),
 }));

 return formatted;
 }
}
