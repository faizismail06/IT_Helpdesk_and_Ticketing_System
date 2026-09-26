import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { validate } from '../middlewares/validate';
import { authenticateJWT } from '../middlewares/auth';
import { createTicketSchema, ticketQuerySchema } from '../validators/ticket.validator';

const router = Router();

router.use(authenticateJWT);

router.get('/categories', TicketController.getCategories);
router.get('/tickets', validate(ticketQuerySchema), TicketController.getTickets);
router.post('/tickets', validate(createTicketSchema), TicketController.createTicket);
router.get('/tickets/:id', TicketController.getTicketById);

export default router;
