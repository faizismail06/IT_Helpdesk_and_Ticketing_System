import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { env } from '../config/env';
import { prisma } from '../config/db';

let io: SocketIOServer | null = null;

export const initSocketIO = (httpServer: HttpServer): SocketIOServer => {
 io = new SocketIOServer(httpServer, {
 cors: {
 origin: env.CORS_ORIGIN,
 credentials: true,
 },
 });

 // Socket Authentication Middleware
 io.use((socket: Socket, next) => {
 const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
 if (!token) {
 return next(new Error('Authentication token required for Socket connection'));
 }

 try {
 const decoded = verifyToken(token);
 (socket as any).user = decoded;
 next();
 } catch (err) {
 next(new Error('Invalid socket authentication token'));
 }
 });

 io.on('connection', (socket: Socket) => {
 const user = (socket as any).user;
 if (!user) return;

 const userRoom = `user_${user.userId}`;
 const roleRoom = `role_${user.role.toLowerCase()}`;

 socket.join(userRoom);
 socket.join(roleRoom);

 console.log(` Socket Connected: User ${user.userId} (${user.role}) joined rooms: ${userRoom}, ${roleRoom}`);

 // Detail page room joining
 socket.on('join:ticket', (ticketId: string) => {
 const ticketRoom = `ticket_${ticketId}`;
 socket.join(ticketRoom);
 });

 socket.on('leave:ticket', (ticketId: string) => {
 const ticketRoom = `ticket_${ticketId}`;
 socket.leave(ticketRoom);
 });

 socket.on('disconnect', () => {
 console.log(` Socket Disconnected: User ${user.userId}`);
 });
 });

 return io;
};

export const getIO = (): SocketIOServer => {
 if (!io) {
 throw new Error('Socket.IO is not initialized!');
 }
 return io;
};

export const emitToRoom = (room: string, event: string, payload: any) => {
 if (io) {
 io.to(room).emit(event, payload);
 }
};

export const createAndEmitNotification = async (
 userId: string,
 title: string,
 message: string,
 ticketId?: string
) => {
 try {
 // 1. Save to Database
 const notification = await prisma.notification.create({
 data: {
 userId,
 title,
 message,
 ticketId,
 },
 });

 // 2. Emit Realtime Event to User's Personal Room
 emitToRoom(`user_${userId}`, 'notification:new', notification);
 return notification;
 } catch (err) {
 console.error('Failed to create and emit notification:', err);
 }
};
