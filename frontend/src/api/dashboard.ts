import { api } from './axios';

export const dashboardApi = {
 getStats: async (): Promise<any> => {
 const res = await api.get('/dashboard/stats');
 return res.data.data;
 },
};
