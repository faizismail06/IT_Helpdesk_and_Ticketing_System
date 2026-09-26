import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(RoleName.HELPDESK, RoleName.ADMIN));

router.get('/reports/export', ReportController.exportReports);

export default router;
