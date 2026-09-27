import fs from 'fs';
import { prisma } from '../config/db';
import { JwtPayload } from '../types';
import { TicketService } from './ticket.service';
import { AuditLogService } from './auditLog.service';

export class AttachmentService {
 static async upload(ticketId: string, actor: JwtPayload, file?: Express.Multer.File) {
 if (!file) throw { statusCode: 400, message: 'A file is required' };
 await TicketService.getTicketById(ticketId, actor);
 const attachment = await prisma.ticketAttachment.create({ data: { ticketId, filename: file.filename, originalFilename: file.originalname, mimeType: file.mimetype, fileSize: file.size, filePath: file.path, uploadedById: actor.userId } });
 await prisma.ticketHistory.create({ data: { ticketId, actorId: actor.userId, action: 'ATTACHMENT_ADDED', newValue: file.originalname } });
 await AuditLogService.logAction(actor.userId, 'Ticket attachment uploaded', 'TICKET', ticketId, { attachmentId: attachment.id, filename: file.originalname });
 return attachment;
 }

 static async get(id: string, actor: JwtPayload) {
 const attachment = await prisma.ticketAttachment.findUnique({ where: { id } });
 if (!attachment || !attachment.ticketId) throw { statusCode: 404, message: 'Attachment not found' };
 await TicketService.getTicketById(attachment.ticketId, actor);
 return attachment;
 }

 static async remove(id: string, actor: JwtPayload) {
 const attachment = await this.get(id, actor);
 if (attachment.uploadedById !== actor.userId && actor.role !== 'ADMIN' && actor.role !== 'HELPDESK') throw { statusCode: 403, message: 'You cannot delete this attachment' };
 await prisma.ticketAttachment.delete({ where: { id } });
 if (fs.existsSync(attachment.filePath)) fs.unlinkSync(attachment.filePath);
 await AuditLogService.logAction(actor.userId, 'Ticket attachment deleted', 'TICKET', attachment.ticketId!, { filename: attachment.originalFilename });
 return true;
 }
}
