import { TicketStatus } from '@prisma/client';
import { prisma } from '../config/db';
import { createAndEmitNotification, emitToRoom } from '../socket';
import { AuditLogService } from './auditLog.service';

const ACTIVE_STATUSES: TicketStatus[] = [
 TicketStatus.NEW,
 TicketStatus.OPEN,
 TicketStatus.IN_PROGRESS,
 TicketStatus.PENDING,
 TicketStatus.REOPENED,
 TicketStatus.OVERDUE,
];

export class SlaService {
 static async syncOverdueTickets(now = new Date()) {
 const newlyOverdue = await prisma.ticket.findMany({
 where: {
 isOverdue: false,
 slaDeadline: { lt: now },
 status: { in: ACTIVE_STATUSES },
 },
 select: { id: true, ticketNumber: true, requesterId: true },
 });

 if (newlyOverdue.length === 0) return 0;

 await prisma.ticket.updateMany({
 where: { id: { in: newlyOverdue.map((ticket) => ticket.id) } },
 data: { isOverdue: true },
 });

 await Promise.all(
 newlyOverdue.flatMap((ticket) => [
 createAndEmitNotification(
 ticket.requesterId,
 'Ticket SLA Overdue',
 `Ticket ${ticket.ticketNumber} has passed its SLA deadline.`,
 ticket.id
 ),
 AuditLogService.logAction(null, 'Ticket passed its SLA deadline', 'SLA', ticket.id, {
 ticketNumber: ticket.ticketNumber,
 }),
 ])
 );

 emitToRoom('role_helpdesk', 'sla:overdue', { ticketIds: newlyOverdue.map((ticket) => ticket.id) });
 emitToRoom('role_admin', 'sla:overdue', { ticketIds: newlyOverdue.map((ticket) => ticket.id) });
 return newlyOverdue.length;
 }
}

export const startSlaMonitor = () => {
 const intervalMs = Number(process.env.SLA_CHECK_INTERVAL_MS || 60_000);
 void SlaService.syncOverdueTickets();
 const timer = setInterval(() => void SlaService.syncOverdueTickets(), intervalMs);
 timer.unref();
 return timer;
};
