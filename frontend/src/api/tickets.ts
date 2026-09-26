import { api } from './axios';
import { Ticket, TicketCategory, TicketPagination, TicketPriority, TicketStatus } from '../types/ticket';

export interface CreateTicketParams {
 subject: string;
 description: string;
 categoryId: string;
 priority: TicketPriority;
}

export interface GetTicketsQueryParams {
 q?: string;
 status?: TicketStatus;
 priority?: TicketPriority;
 categoryId?: string;
 page?: number;
 limit?: number;
 sortBy?: string;
 sortOrder?: 'asc' | 'desc';
}

export interface GetTicketsResponse {
 tickets: Ticket[];
 pagination: TicketPagination;
}

export const ticketApi = {
 createTicket: async (data: CreateTicketParams): Promise<Ticket> => {
 const res = await api.post('/tickets', data);
 return res.data.data;
 },

 getTickets: async (params?: GetTicketsQueryParams): Promise<GetTicketsResponse> => {
 const res = await api.get('/tickets', { params });
 return res.data.data;
 },

 getTicketById: async (id: string): Promise<Ticket> => {
 const res = await api.get(`/tickets/${id}`);
 return res.data.data;
 },

 getCategories: async (): Promise<TicketCategory[]> => {
 const res = await api.get('/categories');
 return res.data.data;
 },
};
