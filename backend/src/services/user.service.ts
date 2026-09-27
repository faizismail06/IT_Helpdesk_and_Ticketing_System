import { prisma } from '../config/db';
import { RoleName } from '@prisma/client';
import { AuditLogService } from './auditLog.service';

export class UserService {
 static async listUsers(role?: RoleName, departmentId?: string) {
 return prisma.user.findMany({
 where: {
 ...(role && { role }),
 ...(departmentId && { departmentId }),
 },
 select: {
 id: true,
 email: true,
 fullName: true,
 avatarUrl: true,
 role: true,
 isActive: true,
 department: {
 select: { id: true, name: true, code: true },
 },
 createdAt: true,
 },
 orderBy: { createdAt: 'desc' },
 });
 }

 static async listDepartments() {
 return prisma.department.findMany({
 orderBy: { name: 'asc' },
 });
 }

 static async updateUserStatus(userId: string, isActive: boolean, actorId?: string) {
 const user = await prisma.user.findUnique({ where: { id: userId } });
 if (!user) {
 throw { statusCode: 404, message: 'User not found' };
 }

 const updated = await prisma.user.update({
 where: { id: userId },
 data: { isActive },
 select: {
 id: true,
 email: true,
 fullName: true,
 role: true,
 isActive: true,
 },
 });
 await AuditLogService.logAction(actorId || null, `User account ${isActive ? 'activated' : 'deactivated'}`, 'USER_MGMT', userId);
 return updated;
 }
}
