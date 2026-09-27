import { Router } from 'express';
import { KbController } from '../controllers/kb.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.get('/knowledge-base', authorizeRoles(RoleName.EMPLOYEE, RoleName.ADMIN), KbController.listArticles);
router.post('/knowledge-base', authorizeRoles(RoleName.ADMIN), KbController.createArticle);
router.patch('/knowledge-base/:id', authorizeRoles(RoleName.ADMIN), KbController.updateArticle);
router.delete('/knowledge-base/:id', authorizeRoles(RoleName.ADMIN), KbController.deleteArticle);
router.get('/knowledge-base/:slug', authorizeRoles(RoleName.EMPLOYEE, RoleName.ADMIN), KbController.getArticleBySlug);

export default router;
