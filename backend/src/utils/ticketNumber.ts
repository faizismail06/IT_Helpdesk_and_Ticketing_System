import { prisma } from '../config/db';

export const generateTicketNumber = async (): Promise<string> => {
 const currentYear = new Date().getFullYear();
 const prefix = `IT-${currentYear}-`;

 // Find the latest ticket for the current year
 const latestTicket = await prisma.ticket.findFirst({
 where: {
 ticketNumber: {
 startsWith: prefix,
 },
 },
 orderBy: {
 ticketNumber: 'desc',
 },
 select: {
 ticketNumber: true,
 },
 });

 let nextSequence = 1;
 if (latestTicket && latestTicket.ticketNumber) {
 const parts = latestTicket.ticketNumber.split('-');
 if (parts.length === 3) {
 const lastSeq = parseInt(parts[2], 10);
 if (!isNaN(lastSeq)) {
 nextSequence = lastSeq + 1;
 }
 }
 }

 const paddedSequence = String(nextSequence).padStart(6, '0');
 return `${prefix}${paddedSequence}`;
};
