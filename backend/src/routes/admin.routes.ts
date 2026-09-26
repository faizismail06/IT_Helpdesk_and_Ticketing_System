import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(RoleName.ADMIN));

router.get('/admin/audit-logs', AdminController.getAuditLogs);
router.post('/admin/users', AdminController.createUser);
router.put('/admin/users/:id', AdminController.updateUser);
router.post('/admin/users/:id/reset-password', AdminController.resetPassword);

router.get('/sla-rules', AdminController.getSlaRules);
router.put('/sla-rules/:id', AdminController.updateSlaRule);

export default router;
