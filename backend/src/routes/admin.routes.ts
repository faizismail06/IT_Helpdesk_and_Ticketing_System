import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';

const router = Router();

const adminOnly = [authenticateJWT, authorizeRoles(RoleName.ADMIN)];

router.get('/admin/audit-logs', ...adminOnly, AdminController.getAuditLogs);
router.post('/admin/users', ...adminOnly, AdminController.createUser);
router.put('/admin/users/:id', ...adminOnly, AdminController.updateUser);
router.post('/admin/users/:id/reset-password', ...adminOnly, AdminController.resetPassword);

router.get('/sla-rules', ...adminOnly, AdminController.getSlaRules);
router.put('/sla-rules/:id', ...adminOnly, AdminController.updateSlaRule);
router.get('/admin/categories', ...adminOnly, AdminController.getCategories);
router.post('/admin/categories', ...adminOnly, AdminController.createCategory);
router.patch('/admin/categories/:id', ...adminOnly, AdminController.updateCategory);

export default router;
