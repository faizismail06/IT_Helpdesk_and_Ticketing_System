import { Router } from 'express';
import { KbController } from '../controllers/kb.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.get('/knowledge-base', KbController.listArticles);
router.post(
 '/knowledge-base',
 authorizeRoles(RoleName.HELPDESK, RoleName.TECHNICIAN, RoleName.ADMIN),
 KbController.createArticle
);
router.get('/knowledge-base/:slug', KbController.getArticleBySlug);

export default router;
