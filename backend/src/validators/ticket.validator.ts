import { z } from 'zod';
import { TicketPriority, TicketStatus } from '@prisma/client';

export const createTicketSchema = z.object({
 subject: z.string().min(5, 'Subject must be at least 5 characters long').max(200),
 description: z.string().min(10, 'Description must be at least 10 characters long'),
 categoryId: z.string().uuid('Invalid ticket category selection'),
 priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
});

export const ticketQuerySchema = z.object({
 q: z.string().optional(),
 status: z.nativeEnum(TicketStatus).optional(),
 priority: z.nativeEnum(TicketPriority).optional(),
 categoryId: z.string().optional(),
 page: z.coerce.number().min(1).default(1),
 limit: z.coerce.number().min(1).max(100).default(10),
 sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'slaDeadline']).default('createdAt'),
 sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
