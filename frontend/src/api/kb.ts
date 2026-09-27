import { api } from './axios';

export interface KnowledgeArticle {
 id: string;
 title: string;
 slug: string;
 content: string;
 category: string;
 tags: string[];
 viewsCount: number;
 isPublished: boolean;
 createdAt: string;
 author: {
 id: string;
 fullName: string;
 };
}

export const kbApi = {
 getArticles: async (q?: string, category?: string): Promise<KnowledgeArticle[]> => {
 const res = await api.get('/knowledge-base', { params: { q, category } });
 return res.data.data;
 },

 getArticleBySlug: async (slug: string): Promise<KnowledgeArticle> => {
 const res = await api.get(`/knowledge-base/${slug}`);
 return res.data.data;
 },
 createArticle: async (data: { title: string; content: string; category: string; tags: string[]; isPublished: boolean }) => (await api.post('/knowledge-base', data)).data.data,
 updateArticle: async (id: string, data: Partial<{ title: string; content: string; category: string; tags: string[]; isPublished: boolean }>) => (await api.patch(`/knowledge-base/${id}`, data)).data.data,
 deleteArticle: async (id: string) => (await api.delete(`/knowledge-base/${id}`)).data.data,
};
