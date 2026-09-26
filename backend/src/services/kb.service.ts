import { prisma } from '../config/db';
import { JwtPayload } from '../types';

export interface CreateArticleInput {
 title: string;
 content: string;
 category: string;
 tags?: string[];
}

export class KbService {
 static async listArticles(q?: string, category?: string) {
 const where: any = { isPublished: true };

 if (category) {
 where.category = category;
 }

 if (q) {
 where.OR = [
 { title: { contains: q, mode: 'insensitive' } },
 { content: { contains: q, mode: 'insensitive' } },
 { category: { contains: q, mode: 'insensitive' } },
 ];
 }

 return prisma.knowledgeArticle.findMany({
 where,
 orderBy: { viewsCount: 'desc' },
 include: {
 author: { select: { id: true, fullName: true } },
 },
 });
 }

 static async createArticle(author: JwtPayload, input: CreateArticleInput) {
 const slug = input.title
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/(^-|-$)+/g, '');

 const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

 return prisma.knowledgeArticle.create({
 data: {
 title: input.title,
 slug: uniqueSlug,
 content: input.content,
 category: input.category,
 tags: input.tags || [],
 authorId: author.userId,
 },
 });
 }

 static async getArticleBySlug(slug: string) {
 const article = await prisma.knowledgeArticle.findUnique({
 where: { slug },
 include: {
 author: { select: { id: true, fullName: true } },
 },
 });

 if (!article) {
 throw { statusCode: 404, message: 'Article not found' };
 }

 // Increment views count
 await prisma.knowledgeArticle.update({
 where: { id: article.id },
 data: { viewsCount: { increment: 1 } },
 });

 return article;
 }
}
