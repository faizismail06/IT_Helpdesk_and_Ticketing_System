import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { RoleName } from '@prisma/client';

export class UserController {
 static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const roleFilter = req.query.role as RoleName | undefined;
 const deptFilter = req.query.departmentId as string | undefined;

 const users = await UserService.listUsers(roleFilter, deptFilter);
 sendSuccess(res, 'Users retrieved successfully', users);
 } catch (err) {
 next(err);
 }
 }

 static async getDepartments(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const departments = await UserService.listDepartments();
 sendSuccess(res, 'Departments retrieved successfully', departments);
 } catch (err) {
 next(err);
 }
 }

 static async toggleUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const id = String(req.params.id);
 const { isActive } = req.body;
 const updatedUser = await UserService.updateUserStatus(id, Boolean(isActive));
 sendSuccess(res, `User status updated to ${isActive ? 'active' : 'inactive'}`, updatedUser);
 } catch (err) {
 next(err);
 }
 }
}
