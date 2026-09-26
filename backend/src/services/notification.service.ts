import { prisma } from '../config/db';

export class NotificationService {
 static async getUserNotifications(userId: string) {
 return prisma.notification.findMany({
 where: { userId },
 orderBy: { createdAt: 'desc' },
 take: 20,
 });
 }

 static async markAsRead(notificationId: string, userId: string) {
 return prisma.notification.updateMany({
 where: { id: notificationId, userId },
 data: { isRead: true },
 });
 }

 static async markAllAsRead(userId: string) {
 return prisma.notification.updateMany({
 where: { userId, isRead: false },
 data: { isRead: true },
 });
 }
}
