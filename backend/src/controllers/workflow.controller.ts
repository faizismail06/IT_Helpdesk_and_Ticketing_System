import { Response, NextFunction } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class WorkflowController {
 static async changeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const ticketId = String(req.params.id);
 const updated = await WorkflowService.changeStatus(ticketId, req.user!, req.body);
 sendSuccess(res, `Ticket status updated to ${updated.status}`, updated);
 } catch (err) {
 next(err);
 }
 }

 static async assignTechnician(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const ticketId = String(req.params.id);
 const assignment = await WorkflowService.assignTechnician(ticketId, req.user!, req.body);
 sendSuccess(res, 'Technician assigned successfully', assignment);
 } catch (err) {
 next(err);
 }
 }

 static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const ticketId = String(req.params.id);
 const comment = await WorkflowService.addComment(ticketId, req.user!, req.body);
 sendSuccess(res, 'Comment posted successfully', comment, 201);
 } catch (err) {
 next(err);
 }
 }
}
