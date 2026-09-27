import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { validate } from '../middlewares/validate';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth';
import { RoleName } from '@prisma/client';
import { createTicketSchema, ticketQuerySchema, updateTicketSchema } from '../validators/ticket.validator';
import { upload } from '../middlewares/multerUpload';
import { AttachmentController } from '../controllers/attachment.controller';

const router = Router();

router.use(authenticateJWT);

router.get('/categories', TicketController.getCategories);
router.get('/tickets', validate(ticketQuerySchema, 'query'), TicketController.getTickets);
router.post('/tickets', authorizeRoles(RoleName.EMPLOYEE), validate(createTicketSchema), TicketController.createTicket);
router.get('/tickets/:id', TicketController.getTicketById);
router.patch('/tickets/:id', authorizeRoles(RoleName.EMPLOYEE), validate(updateTicketSchema), TicketController.updateTicket);
router.post('/tickets/:id/cancel', authorizeRoles(RoleName.EMPLOYEE), TicketController.cancelTicket);
router.post('/tickets/:id/attachments', upload.single('file'), AttachmentController.uploadToTicket);
router.get('/attachments/:id/download', AttachmentController.download);
router.delete('/attachments/:id', AttachmentController.remove);

export default router;
