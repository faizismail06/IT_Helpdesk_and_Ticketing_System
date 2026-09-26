import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ReportController {
 static async exportReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const data = await ReportService.getReportData(req.query as any);
 sendSuccess(res, 'Report dataset generated successfully', data);
 } catch (err) {
 next(err);
 }
 }
}
