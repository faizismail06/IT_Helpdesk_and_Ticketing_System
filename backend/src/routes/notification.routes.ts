import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/notifications', NotificationController.getNotifications);
router.put('/notifications/read-all', NotificationController.markAllAsRead);
router.put('/notifications/:id/read', NotificationController.markAsRead);

export default router;
