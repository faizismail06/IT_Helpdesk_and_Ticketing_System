import { api } from './axios';

export interface KnowledgeArticle {
 id: string;
 title: string;
 slug: string;
 content: string;
 category: string;
 tags: string[];
 viewsCount: number;
 createdAt: string;
 author: {
 id: string;
 fullName: string;
 };
}

export interface CreateArticleParams {
 title: string;
 content: string;
 category: string;
 tags?: string[];
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

 createArticle: async (data: CreateArticleParams): Promise<KnowledgeArticle> => {
 const res = await api.post('/knowledge-base', data);
 return res.data.data;
 },
};
