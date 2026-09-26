import { Request } from 'express';
import { RoleName } from '@prisma/client';

export interface JwtPayload {
 userId: string;
 email: string;
 role: RoleName;
 departmentId: string;
}

export interface AuthenticatedRequest extends Request {
 user?: JwtPayload;
}

export interface ApiResponse<T = any> {
 success: boolean;
 message: string;
 data?: T;
 errors?: any;
}
