import { api } from './axios';
import { Ticket, TicketAssignment, TicketComment, TicketStatus } from '../types/ticket';

export interface ChangeStatusParams {
 status: TicketStatus;
 reason?: string;
 workTimeMins?: number;
}

export interface AssignTechnicianParams {
 technicianId: string;
}

export interface AddCommentParams {
 message: string;
 isInternal?: boolean;
}

export const workflowApi = {
 changeStatus: async (ticketId: string, data: ChangeStatusParams): Promise<Ticket> => {
 const res = await api.patch(`/tickets/${ticketId}/status`, data);
 return res.data.data;
 },

 assignTechnician: async (ticketId: string, data: AssignTechnicianParams): Promise<TicketAssignment> => {
 const res = await api.post(`/tickets/${ticketId}/assign`, data);
 return res.data.data;
 },

 addComment: async (ticketId: string, data: AddCommentParams): Promise<TicketComment> => {
 const res = await api.post(`/tickets/${ticketId}/comments`, data);
 return res.data.data;
 },

 getTechnicians: async () => {
 const res = await api.get('/users?role=TECHNICIAN');
 return res.data.data;
 },
};
