import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import ticketRoutes from './ticket.routes';
import workflowRoutes from './workflow.routes';
import notificationRoutes from './notification.routes';
import kbRoutes from './kb.routes';
import adminRoutes from './admin.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', userRoutes);
router.use('/', ticketRoutes);
router.use('/', workflowRoutes);
router.use('/', notificationRoutes);
router.use('/', kbRoutes);
router.use('/', adminRoutes);
router.use('/', dashboardRoutes);
router.use('/', reportRoutes);

export default router;
