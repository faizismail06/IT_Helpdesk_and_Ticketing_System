import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';

const router = Router();

router.use(authenticateJWT);

router.get('/users', authorizeRoles(RoleName.ADMIN, RoleName.HELPDESK), UserController.getUsers);
router.patch('/users/:id/status', authorizeRoles(RoleName.ADMIN), UserController.toggleUserStatus);
router.get('/departments', UserController.getDepartments);

export default router;
