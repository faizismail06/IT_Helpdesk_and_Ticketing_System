import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
 return (req: Request, res: Response, next: NextFunction): void => {
 try {
 req.body = schema.parse(req.body);
 next();
 } catch (err) {
 if (err instanceof ZodError) {
 const formattedErrors = err.errors.map((e) => ({
 field: e.path.join('.'),
 message: e.message,
 }));
 sendError(res, 'Validation failed', 422, formattedErrors);
 return;
 }
 next(err);
 }
 };
};
