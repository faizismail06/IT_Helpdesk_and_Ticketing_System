import { api } from './axios';

export interface ReportFilterParams {
 startDate?: string;
 endDate?: string;
 priority?: string;
 status?: string;
 categoryId?: string;
}

export interface ReportRow {
 ticketNumber: string;
 subject: string;
 category: string;
 impact: string;
 urgency: string;
 suggestedPriority: string;
 priority: string;
 priorityReviewed: string;
 status: string;
 requester: string;
 department: string;
 technician: string;
 slaDeadline: string;
 isOverdue: string;
 workTimeMins: number;
 ratingScore: number | string;
 ratingFeedback: string;
 createdDate: string;
}

export const reportApi = {
 getExportData: async (params?: ReportFilterParams): Promise<ReportRow[]> => {
 const res = await api.get('/reports/export', { params });
 return res.data.data;
 },
};
