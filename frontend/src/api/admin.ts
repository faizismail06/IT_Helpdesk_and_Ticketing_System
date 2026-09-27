import { api } from './axios';

export interface AuditLogItem {
 id: string;
 userId?: string | null;
 action: string;
 module: string;
 recordId?: string | null;
 metadata?: any;
 timestamp: string;
 user?: {
 id: string;
 fullName: string;
 email: string;
 role: string;
 } | null;
}

export interface GetAuditLogsResponse {
 logs: AuditLogItem[];
 pagination: {
 total: number;
 page: number;
 limit: number;
 totalPages: number;
 };
}

export interface CreateUserParams {
 email: string;
 fullName: string;
 password: string;
 role: string;
 departmentId: string;
}

export interface SlaRule {
 id: string;
 priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 resolutionHours: number;
}

export const adminApi = {
 getAuditLogs: async (moduleFilter?: string, page = 1): Promise<GetAuditLogsResponse> => {
 const res = await api.get('/admin/audit-logs', { params: { module: moduleFilter, page } });
 return res.data.data;
 },

 getUsers: async (): Promise<any[]> => {
 const res = await api.get('/users');
 return res.data.data;
 },

 createUser: async (data: CreateUserParams): Promise<any> => {
 const res = await api.post('/admin/users', data);
 return res.data.data;
 },

 toggleUserStatus: async (userId: string, isActive: boolean): Promise<any> => {
 const res = await api.patch(`/users/${userId}/status`, { isActive });
 return res.data.data;
 },

 resetPassword: async (userId: string): Promise<any> => {
 const res = await api.post(`/admin/users/${userId}/reset-password`);
 return res.data.data;
 },

 getSlaRules: async (): Promise<SlaRule[]> => {
 const res = await api.get('/sla-rules');
 return res.data.data;
 },

 updateSlaRule: async (id: string, resolutionHours: number): Promise<SlaRule> => {
 const res = await api.put(`/sla-rules/${id}`, { resolutionHours });
 return res.data.data;
 },

 getDepartments: async (): Promise<any[]> => {
 const res = await api.get('/departments');
 return res.data.data;
 },
 getCategories: async (): Promise<any[]> => (await api.get('/admin/categories')).data.data,
 createCategory: async (data: { name: string; description?: string }) => (await api.post('/admin/categories', data)).data.data,
 updateCategory: async (id: string, data: { name?: string; description?: string; isActive?: boolean }) => (await api.patch(`/admin/categories/${id}`, data)).data.data,
};
