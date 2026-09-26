import { Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class TicketController {
 static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const ticket = await TicketService.createTicket(req.user!, req.body);
 sendSuccess(res, 'Ticket submitted successfully', ticket, 201);
 } catch (err) {
 next(err);
 }
 }

 static async getTickets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const result = await TicketService.getTickets(req.user!, req.query as any);
 sendSuccess(res, 'Tickets retrieved successfully', result);
 } catch (err) {
 next(err);
 }
 }

 static async getTicketById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const ticket = await TicketService.getTicketById(String(req.params.id), req.user!);
 sendSuccess(res, 'Ticket details retrieved successfully', ticket);
 } catch (err) {
 next(err);
 }
 }

 static async getCategories(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
 try {
 const categories = await TicketService.getCategories();
 sendSuccess(res, 'Categories retrieved successfully', categories);
 } catch (err) {
 next(err);
 }
 }
}
