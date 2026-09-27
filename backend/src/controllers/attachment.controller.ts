import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AttachmentService } from '../services/attachment.service';
import { sendSuccess } from '../utils/response';

export class AttachmentController {
 static async uploadToTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { sendSuccess(res, 'Attachment uploaded', await AttachmentService.upload(String(req.params.id), req.user!, req.file), 201); } catch (err) { next(err); } }
 static async download(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { const file = await AttachmentService.get(String(req.params.id), req.user!); res.download(file.filePath, file.originalFilename); } catch (err) { next(err); } }
 static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { await AttachmentService.remove(String(req.params.id), req.user!); sendSuccess(res, 'Attachment deleted'); } catch (err) { next(err); } }
}
