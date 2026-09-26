import { api } from './axios';

export interface ReportFilterParams {
 startDate?: string;
 endDate?: string;
 priority?: string;
 status?: string;
 categoryId?: string;
}

export const reportApi = {
 getExportData: async (params?: ReportFilterParams): Promise<any[]> => {
 const res = await api.get('/reports/export', { params });
 return res.data.data;
 },
};
