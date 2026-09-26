import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuthController {
 static async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const result = await AuthService.login(req.body);
 sendSuccess(res, 'Login successful', result);
 } catch (err) {
 next(err);
 }
 }

 static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const userId = req.user!.userId;
 const user = await AuthService.getCurrentUser(userId);
 sendSuccess(res, 'User profile retrieved successfully', user);
 } catch (err) {
 next(err);
 }
 }

 static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const userId = req.user!.userId;
 await AuthService.changePassword(userId, req.body);
 sendSuccess(res, 'Password updated successfully');
 } catch (err) {
 next(err);
 }
 }

 static async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
 sendSuccess(res, 'Logout successful');
 }
}
