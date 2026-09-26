import { prisma } from '../config/db';
import { JwtPayload } from '../types';

export class RatingService {
 static async submitRating(
 ticketId: string,
 user: JwtPayload,
 score: number,
 feedback?: string
 ) {
 const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
 if (!ticket) {
 throw { statusCode: 404, message: 'Ticket not found' };
 }

 if (ticket.requesterId !== user.userId) {
 throw { statusCode: 403, message: 'Only the ticket requester can submit rating' };
 }

 if (!['RESOLVED', 'CLOSED'].includes(ticket.status)) {
 throw { statusCode: 400, message: 'Rating can only be submitted for RESOLVED or CLOSED tickets' };
 }

 const existing = await prisma.ticketRating.findUnique({ where: { ticketId } });
 if (existing) {
 throw { statusCode: 400, message: 'Rating has already been submitted for this ticket' };
 }

 return prisma.ticketRating.create({
 data: {
 ticketId,
 userId: user.userId,
 score: Math.min(5, Math.max(1, score)),
 feedback,
 },
 });
 }
}
