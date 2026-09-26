import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { RatingController } from '../controllers/rating.controller';
import { validate } from '../middlewares/validate';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';
import {
 statusTransitionSchema,
 assignTicketSchema,
 addCommentSchema,
} from '../validators/workflow.validator';

const router = Router();

router.use(authenticateJWT);

router.patch('/tickets/:id/status', validate(statusTransitionSchema), WorkflowController.changeStatus);
router.post(
 '/tickets/:id/assign',
 authorizeRoles(RoleName.HELPDESK, RoleName.ADMIN),
 validate(assignTicketSchema),
 WorkflowController.assignTechnician
);
router.post('/tickets/:id/comments', validate(addCommentSchema), WorkflowController.addComment);
router.post('/tickets/:id/rating', RatingController.submitRating);

export default router;
