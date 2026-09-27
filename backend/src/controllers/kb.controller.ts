import { Response, NextFunction } from 'express';
import { KbService } from '../services/kb.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class KbController {
 static async listArticles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const q = req.query.q as string | undefined;
 const category = req.query.category as string | undefined;
 const articles = await KbService.listArticles(q, category, req.user?.role === 'ADMIN');
 sendSuccess(res, 'Knowledge Base articles retrieved', articles);
 } catch (err) {
 next(err);
 }
 }

 static async getArticleBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const slug = String(req.params.slug);
 const article = await KbService.getArticleBySlug(slug);
 sendSuccess(res, 'Article retrieved successfully', article);
 } catch (err) {
 next(err);
 }
 }

 static async createArticle(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { sendSuccess(res, 'Article created', await KbService.createArticle(req.user!, req.body), 201); } catch (err) { next(err); } }
 static async updateArticle(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { sendSuccess(res, 'Article updated', await KbService.updateArticle(req.user!, String(req.params.id), req.body)); } catch (err) { next(err); } }
 static async deleteArticle(req: AuthenticatedRequest, res: Response, next: NextFunction) { try { await KbService.deleteArticle(req.user!, String(req.params.id)); sendSuccess(res, 'Article deleted'); } catch (err) { next(err); } }
}
