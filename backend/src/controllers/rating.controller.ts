import { Response, NextFunction } from 'express';
import { RatingService } from '../services/rating.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class RatingController {
 static async submitRating(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const ticketId = String(req.params.id);
 const { score, feedback } = req.body;
 const rating = await RatingService.submitRating(ticketId, req.user!, Number(score), feedback);
 sendSuccess(res, 'Feedback & rating submitted successfully', rating, 201);
 } catch (err) {
 next(err);
 }
 }
}
