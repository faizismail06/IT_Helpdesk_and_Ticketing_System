import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
 res: Response,
 message: string,
 data?: T,
 statusCode = 200
): Response => {
 const payload: ApiResponse<T> = {
 success: true,
 message,
 ...(data !== undefined && { data }),
 };
 return res.status(statusCode).json(payload);
};

export const sendError = (
 res: Response,
 message: string,
 statusCode = 400,
 errors: any = null
): Response => {
 const payload: ApiResponse = {
 success: false,
 message,
 ...(errors && { errors }),
 };
 return res.status(statusCode).json(payload);
};
