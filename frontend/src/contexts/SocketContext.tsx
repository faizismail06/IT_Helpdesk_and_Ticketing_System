import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
 socket: Socket | null;
 isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
 socket: null,
 isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { token, isAuthenticated } = useAuth();
 const [socket, setSocket] = useState<Socket | null>(null);
 const [isConnected, setIsConnected] = useState(false);
 const queryClient = useQueryClient();

 useEffect(() => {
 if (!isAuthenticated || !token) {
 if (socket) {
 socket.disconnect();
 setSocket(null);
 setIsConnected(false);
 }
 return;
 }

 const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
 const newSocket = io(socketUrl, {
 auth: { token },
 transports: ['websocket', 'polling'],
 });

 newSocket.on('connect', () => {
 setIsConnected(true);
 console.log('Socket.IO Client Connected');
 });

 newSocket.on('disconnect', () => {
 setIsConnected(false);
 console.log('Socket.IO Client Disconnected');
 });

 // Realtime Events
 newSocket.on('notification:new', () => {
 queryClient.invalidateQueries({ queryKey: ['notifications'] });
 });

 newSocket.on('ticket:status_changed', () => {
 queryClient.invalidateQueries({ queryKey: ['tickets'] });
 queryClient.invalidateQueries({ queryKey: ['ticket'] });
 });

 newSocket.on('ticket:comment_added', () => {
 queryClient.invalidateQueries({ queryKey: ['ticket'] });
 });

 setSocket(newSocket);

 return () => {
 newSocket.disconnect();
 };
 }, [isAuthenticated, token, queryClient]);

 return (
 <SocketContext.Provider value={{ socket, isConnected }}>
 {children}
 </SocketContext.Provider>
 );
};

export const useSocket = () => useContext(SocketContext);
