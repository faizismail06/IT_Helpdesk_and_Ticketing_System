import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
 err: any,
 req: Request,
 res: Response,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 next: NextFunction
): void => {
 console.error('[Unhandled Error]:', err);

 const statusCode = err.statusCode || err.status || 500;
 const message = err.message || 'Internal Server Error';

 sendError(res, message, statusCode);
};
