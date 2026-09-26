import { z } from 'zod';
import { TicketStatus } from '@prisma/client';

export const statusTransitionSchema = z.object({
 status: z.nativeEnum(TicketStatus),
 reason: z.string().optional(),
 workTimeMins: z.coerce.number().min(0).optional().default(0),
});

export const assignTicketSchema = z.object({
 technicianId: z.string().uuid('Invalid technician ID'),
});

export const addCommentSchema = z.object({
 message: z.string().min(1, 'Comment message cannot be empty'),
 isInternal: z.boolean().optional().default(false),
});

export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
