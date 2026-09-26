import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class DashboardController {
 static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const stats = await DashboardService.getStats(req.user!);
 sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
 } catch (err) {
 next(err);
 }
 }
}
