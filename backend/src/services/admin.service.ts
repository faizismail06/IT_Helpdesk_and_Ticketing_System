import { prisma } from '../config/db';
import { hashPassword } from '../utils/password';
import { RoleName, TicketPriority } from '@prisma/client';
import { AuditLogService } from './auditLog.service';
import { JwtPayload } from '../types';

export interface CreateUserInput {
 email: string;
 fullName: string;
 password: string;
 role: RoleName;
 departmentId: string;
}

export interface UpdateUserInput {
 fullName?: string;
 role?: RoleName;
 departmentId?: string;
}

export class AdminService {
 private static generateTemporaryPassword() {
 const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
 return Array.from({ length: 14 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
 }
 static async createUser(adminUser: JwtPayload, input: CreateUserInput) {
 const existing = await prisma.user.findUnique({ where: { email: input.email } });
 if (existing) {
 throw { statusCode: 400, message: 'Email address is already registered' };
 }

 const passwordHash = await hashPassword(input.password);
 const user = await prisma.user.create({
 data: {
 email: input.email,
 fullName: input.fullName,
 passwordHash,
 role: input.role,
 departmentId: input.departmentId,
 },
 select: {
 id: true,
 email: true,
 fullName: true,
 role: true,
 isActive: true,
 department: { select: { name: true } },
 },
 });

 await AuditLogService.logAction(
 adminUser.userId,
 `Admin created user account for ${user.email} (${user.role})`,
 'USER_MGMT',
 user.id
 );

 return user;
 }

 static async updateUser(adminUser: JwtPayload, targetUserId: string, input: UpdateUserInput) {
 const user = await prisma.user.update({
 where: { id: targetUserId },
 data: {
 ...(input.fullName && { fullName: input.fullName }),
 ...(input.role && { role: input.role }),
 ...(input.departmentId && { departmentId: input.departmentId }),
 },
 select: {
 id: true,
 email: true,
 fullName: true,
 role: true,
 isActive: true,
 },
 });

 await AuditLogService.logAction(
 adminUser.userId,
 `Admin updated profile/role for ${user.email}`,
 'USER_MGMT',
 user.id
 );

 return user;
 }

 static async resetUserPassword(adminUser: JwtPayload, targetUserId: string, newPassword = AdminService.generateTemporaryPassword()) {
 const passwordHash = await hashPassword(newPassword);
 const user = await prisma.user.update({
 where: { id: targetUserId },
 data: { passwordHash },
 });

 await AuditLogService.logAction(
 adminUser.userId,
 `Admin reset password for user ${user.email}`,
 'USER_MGMT',
 user.id
 );

 return { email: user.email, defaultPassword: newPassword };
 }

 static async listCategories(includeInactive = true) {
 return prisma.ticketCategory.findMany({ where: includeInactive ? undefined : { isActive: true }, orderBy: { name: 'asc' }, include: { _count: { select: { tickets: true } } } });
 }

 static async createCategory(admin: JwtPayload, input: { name: string; description?: string }) {
 const category = await prisma.ticketCategory.create({ data: input });
 await AuditLogService.logAction(admin.userId, 'Ticket category created', 'CATEGORY', category.id, { name: category.name });
 return category;
 }

 static async updateCategory(admin: JwtPayload, id: string, input: { name?: string; description?: string; isActive?: boolean }) {
 const category = await prisma.ticketCategory.update({ where: { id }, data: input });
 await AuditLogService.logAction(admin.userId, 'Ticket category updated', 'CATEGORY', id, input);
 return category;
 }

 static async getSlaRules() {
 return prisma.slaRule.findMany({
 orderBy: { resolutionHours: 'asc' },
 });
 }

 static async updateSlaRule(adminUser: JwtPayload, id: string, resolutionHours: number) {
 const rule = await prisma.slaRule.update({
 where: { id },
 data: { resolutionHours },
 });

 await AuditLogService.logAction(
 adminUser.userId,
 `Admin updated SLA resolution target for priority ${rule.priority} to ${resolutionHours}h`,
 'SLA',
 rule.id
 );

 return rule;
 }
}
