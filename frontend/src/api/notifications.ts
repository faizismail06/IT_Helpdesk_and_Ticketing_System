import { api } from './axios';

export interface NotificationItem {
 id: string;
 title: string;
 message: string;
 ticketId?: string | null;
 isRead: boolean;
 createdAt: string;
}

export const notificationApi = {
 getNotifications: async (): Promise<NotificationItem[]> => {
 const res = await api.get('/notifications');
 return res.data.data;
 },

 markAsRead: async (id: string): Promise<void> => {
 await api.put(`/notifications/${id}/read`);
 },

 markAllAsRead: async (): Promise<void> => {
 await api.put('/notifications/read-all');
 },
};
