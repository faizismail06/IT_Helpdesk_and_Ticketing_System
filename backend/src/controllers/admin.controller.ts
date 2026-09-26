import { Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { AdminService } from '../services/admin.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AdminController {
 static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const moduleFilter = req.query.module as string | undefined;
 const page = Number(req.query.page) || 1;
 const limit = Number(req.query.limit) || 20;

 const result = await AuditLogService.getAuditLogs(moduleFilter, page, limit);
 sendSuccess(res, 'Audit logs retrieved', result);
 } catch (err) {
 next(err);
 }
 }

 static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const user = await AdminService.createUser(req.user!, req.body);
 sendSuccess(res, 'User created successfully', user, 201);
 } catch (err) {
 next(err);
 }
 }

 static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const { id } = req.params;
 const user = await AdminService.updateUser(req.user!, String(id), req.body);
 sendSuccess(res, 'User updated successfully', user);
 } catch (err) {
 next(err);
 }
 }

 static async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const { id } = req.params;
 const result = await AdminService.resetUserPassword(req.user!, String(id));
 sendSuccess(res, `Password reset to default for ${result.email}`, result);
 } catch (err) {
 next(err);
 }
 }

 static async getSlaRules(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const rules = await AdminService.getSlaRules();
 sendSuccess(res, 'SLA rules retrieved', rules);
 } catch (err) {
 next(err);
 }
 }

 static async updateSlaRule(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const { id } = req.params;
 const { resolutionHours } = req.body;
 const rule = await AdminService.updateSlaRule(req.user!, String(id), Number(resolutionHours));
 sendSuccess(res, 'SLA rule updated successfully', rule);
 } catch (err) {
 next(err);
 }
 }
}
