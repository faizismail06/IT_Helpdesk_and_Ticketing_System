import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class NotificationController {
 static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const notifications = await NotificationService.getUserNotifications(req.user!.userId);
 sendSuccess(res, 'Notifications retrieved successfully', notifications);
 } catch (err) {
 next(err);
 }
 }

 static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const { id } = req.params;
 await NotificationService.markAsRead(String(id), req.user!.userId);
 sendSuccess(res, 'Notification marked as read');
 } catch (err) {
 next(err);
 }
 }

 static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 await NotificationService.markAllAsRead(req.user!.userId);
 sendSuccess(res, 'All notifications marked as read');
 } catch (err) {
 next(err);
 }
 }
}
