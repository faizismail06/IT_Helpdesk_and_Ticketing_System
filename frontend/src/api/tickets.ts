import { api } from './axios';
import { Ticket, TicketCategory, TicketImpact, TicketPagination, TicketPriority, TicketStatus, TicketUrgency } from '../types/ticket';

export interface CreateTicketParams {
 subject: string;
 description: string;
 categoryId: string;
 impact: TicketImpact;
 urgency: TicketUrgency;
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

 updateTicket: async (id: string, data: Partial<CreateTicketParams>): Promise<Ticket> => {
 const res = await api.patch(`/tickets/${id}`, data);
 return res.data.data;
 },

 cancelTicket: async (id: string): Promise<Ticket> => {
 const res = await api.post(`/tickets/${id}/cancel`);
 return res.data.data;
 },

 uploadAttachment: async (ticketId: string, file: File) => {
 const body = new FormData();
 body.append('file', file);
 const res = await api.post(`/tickets/${ticketId}/attachments`, body);
 return res.data.data;
 },

 downloadAttachment: async (id: string, filename: string) => {
 const res = await api.get(`/attachments/${id}/download`, { responseType: 'blob' });
 const url = URL.createObjectURL(res.data);
 const link = document.createElement('a');
 link.href = url;
 link.download = filename;
 link.click();
 URL.revokeObjectURL(url);
 },
};
