import { prisma } from '../config/db';
import { JwtPayload } from '../types';
import { AuditLogService } from './auditLog.service';

export class KbService {
 static async listArticles(q?: string, category?: string, includeUnpublished = false) {
 const where: any = includeUnpublished ? {} : { isPublished: true };

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

 static async createArticle(actor: JwtPayload, input: { title: string; content: string; category: string; tags?: string[]; isPublished?: boolean }) {
 const baseSlug = input.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
 const slug = `${baseSlug}-${Date.now().toString(36)}`;
 const article = await prisma.knowledgeArticle.create({ data: { ...input, tags: input.tags ?? [], slug, authorId: actor.userId } });
 await AuditLogService.logAction(actor.userId, 'Knowledge article created', 'KNOWLEDGE_BASE', article.id, { title: article.title });
 return article;
 }

 static async updateArticle(actor: JwtPayload, id: string, input: { title?: string; content?: string; category?: string; tags?: string[]; isPublished?: boolean }) {
 const article = await prisma.knowledgeArticle.update({ where: { id }, data: input });
 await AuditLogService.logAction(actor.userId, 'Knowledge article updated', 'KNOWLEDGE_BASE', id, { title: article.title });
 return article;
 }

 static async deleteArticle(actor: JwtPayload, id: string) {
 const article = await prisma.knowledgeArticle.delete({ where: { id } });
 await AuditLogService.logAction(actor.userId, 'Knowledge article deleted', 'KNOWLEDGE_BASE', id, { title: article.title });
 return true;
 }
}
