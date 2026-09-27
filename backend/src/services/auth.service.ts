import { prisma } from '../config/db';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { LoginInput, ChangePasswordInput } from '../validators/auth.validator';
import { AuditLogService } from './auditLog.service';

export class AuthService {
 static async login(input: LoginInput) {
 const user = await prisma.user.findUnique({
 where: { email: input.email },
 include: { department: true },
 });

 if (!user || !user.isActive) {
 throw { statusCode: 401, message: 'Invalid credentials or inactive account' };
 }

 const isPasswordValid = await comparePassword(input.password, user.passwordHash);
 if (!isPasswordValid) {
 throw { statusCode: 401, message: 'Invalid credentials' };
 }

 const token = generateToken({
 userId: user.id,
 email: user.email,
 role: user.role,
 departmentId: user.departmentId,
 });

 // Exclude passwordHash from returned user object
 const { passwordHash, ...userWithoutPassword } = user;

 await AuditLogService.logAction(user.id, 'User logged in', 'AUTH', user.id);

 return {
 token,
 user: userWithoutPassword,
 };
 }

 static async getCurrentUser(userId: string) {
 const user = await prisma.user.findUnique({
 where: { id: userId },
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
 });

 if (!user) {
 throw { statusCode: 404, message: 'User not found' };
 }

 return user;
 }

 static async changePassword(userId: string, input: ChangePasswordInput) {
 const user = await prisma.user.findUnique({
 where: { id: userId },
 });

 if (!user) {
 throw { statusCode: 404, message: 'User not found' };
 }

 const isValid = await comparePassword(input.currentPassword, user.passwordHash);
 if (!isValid) {
 throw { statusCode: 400, message: 'Current password is incorrect' };
 }

 const newHash = await hashPassword(input.newPassword);
 await prisma.user.update({
 where: { id: userId },
 data: { passwordHash: newHash },
 });

 await AuditLogService.logAction(userId, 'User changed password', 'AUTH', userId);

 return true;
 }
}
