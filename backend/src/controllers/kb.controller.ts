import { Response, NextFunction } from 'express';
import { KbService } from '../services/kb.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class KbController {
 static async listArticles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const q = req.query.q as string | undefined;
 const category = req.query.category as string | undefined;
 const articles = await KbService.listArticles(q, category);
 sendSuccess(res, 'Knowledge Base articles retrieved', articles);
 } catch (err) {
 next(err);
 }
 }

 static async createArticle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const article = await KbService.createArticle(req.user!, req.body);
 sendSuccess(res, 'Article created successfully', article, 201);
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
}
