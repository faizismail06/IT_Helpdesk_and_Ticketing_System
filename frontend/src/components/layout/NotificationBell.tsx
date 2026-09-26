import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notifications';
import { Bell, Ticket, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [isOpen, setIsOpen] = useState(false);

 const { data: notifications = [] } = useQuery({
 queryKey: ['notifications'],
 queryFn: notificationApi.getNotifications,
 refetchInterval: 15000,
 });

 const markAllMutation = useMutation({
 mutationFn: notificationApi.markAllAsRead,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['notifications'] });
 },
 });

 const markReadMutation = useMutation({
 mutationFn: notificationApi.markAsRead,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['notifications'] });
 },
 });

 const unreadCount = notifications.filter((n) => !n.isRead).length;

 const handleNotificationClick = (id: string, ticketId?: string | null) => {
 markReadMutation.mutate(id);
 setIsOpen(false);
 if (ticketId) {
 navigate(`/tickets/${ticketId}`);
 }
 };

 return (
 <div className="relative">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none"
 >
 <Bell className="w-5 h-5" />
 {unreadCount > 0 && (
 <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
 )}
 </button>

 {isOpen && (
 <div className="absolute right-0 mt-2 w-80 bg-[#111726] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
 <div className="p-3 border-b border-slate-800 flex items-center justify-between">
 <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
 Notifications {unreadCount > 0 && `(${unreadCount})`}
 </span>
 {unreadCount > 0 && (
 <button
 onClick={() => markAllMutation.mutate()}
 className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
 >
 <CheckCheck className="w-3.5 h-3.5" /> Mark all read
 </button>
 )}
 </div>

 <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
 {notifications.length === 0 ? (
 <div className="p-6 text-center text-xs text-slate-500">No in-app notifications</div>
 ) : (
 notifications.map((item) => (
 <div
 key={item.id}
 onClick={() => handleNotificationClick(item.id, item.ticketId)}
 className={`p-3 text-xs space-y-1 transition-colors cursor-pointer hover:bg-slate-800/60 ${
 item.isRead ? 'bg-transparent opacity-75' : 'bg-blue-500/5'
 }`}
 >
 <div className="flex items-center justify-between font-semibold text-slate-200">
 <span className="flex items-center gap-1.5">
 <Ticket className="w-3.5 h-3.5 text-blue-400" />
 {item.title}
 </span>
 <span className="text-[10px] text-slate-500 font-mono">
 {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 <p className="text-slate-400 leading-snug">{item.message}</p>
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 );
};
