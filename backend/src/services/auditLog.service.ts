import { prisma } from '../config/db';

export class AuditLogService {
 static async logAction(
 userId: string | null,
 action: string,
 module: string,
 recordId?: string,
 metadata?: any
 ) {
 try {
 return await prisma.auditLog.create({
 data: {
 userId,
 action,
 module,
 recordId,
 metadata: metadata || undefined,
 },
 });
 } catch (err) {
 console.error('Failed to write audit log:', err);
 }
 }

 static async getAuditLogs(moduleFilter?: string, page = 1, limit = 20) {
 const skip = (page - 1) * limit;
 const where = moduleFilter ? { module: moduleFilter } : {};

 const [total, logs] = await Promise.all([
 prisma.auditLog.count({ where }),
 prisma.auditLog.findMany({
 where,
 skip,
 take: limit,
 orderBy: { timestamp: 'desc' },
 include: {
 user: {
 select: { id: true, fullName: true, email: true, role: true },
 },
 },
 }),
 ]);

 return {
 logs,
 pagination: {
 total,
 page,
 limit,
 totalPages: Math.ceil(total / limit),
 },
 };
 }
}
