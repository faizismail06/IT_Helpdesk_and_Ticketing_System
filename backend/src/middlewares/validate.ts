import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, source: ValidationSource = 'body') => {
 return (req: Request, res: Response, next: NextFunction): void => {
 try {
 const parsed = schema.parse(req[source]);

 if (source === 'body') {
 req.body = parsed;
 } else if (source === 'query') {
 Object.keys(req.query).forEach((key) => delete req.query[key]);
 Object.assign(req.query, parsed);
 } else {
 Object.assign(req.params, parsed);
 }
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
