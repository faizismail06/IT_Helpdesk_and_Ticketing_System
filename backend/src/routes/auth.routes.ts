import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticateJWT } from '../middlewares/auth';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticateJWT, AuthController.me);
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), AuthController.changePassword);
router.post('/logout', authenticateJWT, AuthController.logout);

export default router;
