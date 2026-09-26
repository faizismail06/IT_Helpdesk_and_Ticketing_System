import { prisma } from '../config/db';
import { JwtPayload } from '../types';
import { RoleName, TicketStatus } from '@prisma/client';

export class DashboardService {
 static async getStats(user: JwtPayload) {
 const { userId, role } = user;

 if (role === RoleName.EMPLOYEE) {
 return this.getEmployeeStats(userId);
 } else if (role === RoleName.HELPDESK) {
 return this.getHelpdeskStats();
 } else if (role === RoleName.TECHNICIAN) {
 return this.getTechnicianStats(userId);
 } else {
 return this.getAdminStats();
 }
 }

 private static async getEmployeeStats(userId: string) {
 const [total, open, inProgress, resolved, closed] = await Promise.all([
 prisma.ticket.count({ where: { requesterId: userId } }),
 prisma.ticket.count({ where: { requesterId: userId, status: TicketStatus.OPEN } }),
 prisma.ticket.count({ where: { requesterId: userId, status: TicketStatus.IN_PROGRESS } }),
 prisma.ticket.count({ where: { requesterId: userId, status: TicketStatus.RESOLVED } }),
 prisma.ticket.count({ where: { requesterId: userId, status: TicketStatus.CLOSED } }),
 ]);

 const recentTickets = await prisma.ticket.findMany({
 where: { requesterId: userId },
 take: 5,
 orderBy: { updatedAt: 'desc' },
 include: {
 category: { select: { name: true } },
 },
 });

 return {
 total,
 open,
 inProgress,
 resolved,
 closed,
 recentTickets,
 };
 }

 private static async getHelpdeskStats() {
 const [
 total,
 open,
 inProgress,
 pending,
 resolved,
 closed,
 overdue,
 unassigned,
 byCategory,
 byPriority,
 byStatus,
 ] = await Promise.all([
 prisma.ticket.count(),
 prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
 prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
 prisma.ticket.count({ where: { status: TicketStatus.PENDING } }),
 prisma.ticket.count({ where: { status: TicketStatus.RESOLVED } }),
 prisma.ticket.count({ where: { status: TicketStatus.CLOSED } }),
 prisma.ticket.count({ where: { isOverdue: true, status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] } } }),
 prisma.ticket.count({ where: { assignments: { none: {} }, status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] } } }),
 prisma.ticket.groupBy({
 by: ['categoryId'],
 _count: { _all: true },
 }),
 prisma.ticket.groupBy({
 by: ['priority'],
 _count: { _all: true },
 }),
 prisma.ticket.groupBy({
 by: ['status'],
 _count: { _all: true },
 }),
 ]);

 // Populate category names
 const categories = await prisma.ticketCategory.findMany();
 const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

 const formattedByCategory = byCategory.map((item) => ({
 name: categoryMap.get(item.categoryId) || 'Other',
 count: item._count._all,
 }));

 const formattedByPriority = byPriority.map((item) => ({
 priority: item.priority,
 count: item._count._all,
 }));

 const formattedByStatus = byStatus.map((item) => ({
 status: item.status,
 count: item._count._all,
 }));

 // Mock trend for last 7 days chart
 const volumeTrend = [
 { day: 'Mon', tickets: 6 },
 { day: 'Tue', tickets: 12 },
 { day: 'Wed', tickets: 9 },
 { day: 'Thu', tickets: 15 },
 { day: 'Fri', tickets: 11 },
 { day: 'Sat', tickets: 4 },
 { day: 'Sun', tickets: 2 },
 ];

 return {
 total,
 open,
 inProgress,
 pending,
 resolved,
 closed,
 overdue,
 unassigned,
 byCategory: formattedByCategory,
 byPriority: formattedByPriority,
 byStatus: formattedByStatus,
 volumeTrend,
 };
 }

 private static async getTechnicianStats(userId: string) {
 const [assigned, inProgress, pending, resolved, overdue, workTimeAgg] = await Promise.all([
 prisma.ticket.count({
 where: { assignments: { some: { technicianId: userId } } },
 }),
 prisma.ticket.count({
 where: {
 assignments: { some: { technicianId: userId } },
 status: TicketStatus.IN_PROGRESS,
 },
 }),
 prisma.ticket.count({
 where: {
 assignments: { some: { technicianId: userId } },
 status: TicketStatus.PENDING,
 },
 }),
 prisma.ticket.count({
 where: {
 assignments: { some: { technicianId: userId } },
 status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
 },
 }),
 prisma.ticket.count({
 where: {
 assignments: { some: { technicianId: userId } },
 isOverdue: true,
 status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
 },
 }),
 prisma.ticket.aggregate({
 where: { assignments: { some: { technicianId: userId } } },
 _avg: { workTimeMins: true },
 }),
 ]);

 const urgentTickets = await prisma.ticket.findMany({
 where: {
 assignments: { some: { technicianId: userId } },
 status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
 },
 orderBy: { slaDeadline: 'asc' },
 take: 5,
 include: {
 category: { select: { name: true } },
 requester: { select: { fullName: true } },
 },
 });

 return {
 assigned,
 inProgress,
 pending,
 resolved,
 overdue,
 avgResolutionMins: Math.round(workTimeAgg._avg.workTimeMins || 0),
 urgentTickets,
 };
 }

 private static async getAdminStats() {
 const [totalUsers, totalTickets, overdueTickets, slaRulesCount, auditLogsCount, ratingsAgg] =
 await Promise.all([
 prisma.user.count(),
 prisma.ticket.count(),
 prisma.ticket.count({ where: { isOverdue: true } }),
 prisma.slaRule.count(),
 prisma.auditLog.count(),
 prisma.ticketRating.aggregate({
 _avg: { score: true },
 _count: { score: true },
 }),
 ]);

 const slaComplianceRate =
 totalTickets > 0 ? (((totalTickets - overdueTickets) / totalTickets) * 100).toFixed(1) : '100.0';

 // Technicians performance summary
 const technicians = await prisma.user.findMany({
 where: { role: RoleName.TECHNICIAN },
 select: {
 id: true,
 fullName: true,
 email: true,
 assignedTickets: {
 select: {
 ticket: {
 select: { status: true, workTimeMins: true, rating: { select: { score: true } } },
 },
 },
 },
 },
 });

 const techPerformance = technicians.map((tech) => {
 const assignedCount = tech.assignedTickets.length;
 const resolvedCount = tech.assignedTickets.filter((t) =>
 ['RESOLVED', 'CLOSED'].includes(t.ticket.status)
 ).length;

 const totalMins = tech.assignedTickets.reduce((acc, curr) => acc + (curr.ticket.workTimeMins || 0), 0);
 const avgMins = assignedCount > 0 ? Math.round(totalMins / assignedCount) : 0;

 const ratings = tech.assignedTickets
 .map((t) => t.ticket.rating?.score)
 .filter((s): s is number => s !== undefined && s !== null);

 const avgRating =
 ratings.length > 0
 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
 : 'N/A';

 return {
 id: tech.id,
 name: tech.fullName,
 email: tech.email,
 assignedCount,
 resolvedCount,
 avgMins,
 avgRating,
 };
 });

 return {
 totalUsers,
 totalTickets,
 overdueTickets,
 slaRulesCount,
 auditLogsCount,
 slaComplianceRate,
 avgSystemRating: (ratingsAgg._avg.score || 5).toFixed(1),
 totalRatings: ratingsAgg._count.score,
 techPerformance,
 };
 }
}
