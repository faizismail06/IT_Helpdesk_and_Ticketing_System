import { Response, NextFunction } from 'express';
import { RoleName } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const authenticateJWT = (
 req: AuthenticatedRequest,
 res: Response,
 next: NextFunction
): void => {
 const authHeader = req.headers.authorization;

 if (!authHeader || !authHeader.startsWith('Bearer ')) {
 sendError(res, 'Authentication token required.', 401);
 return;
 }

 const token = authHeader.split(' ')[1];

 try {
 const decoded = verifyToken(token);
 req.user = decoded;
 next();
 } catch (err) {
 sendError(res, 'Invalid or expired authentication token.', 401);
 }
};

export const authorizeRoles = (...allowedRoles: RoleName[]) => {
 return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
 if (!req.user) {
 sendError(res, 'Unauthorized access.', 401);
 return;
 }

 if (!allowedRoles.includes(req.user.role)) {
 sendError(
 res,
 `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
 403
 );
 return;
 }

 next();
 };
};
