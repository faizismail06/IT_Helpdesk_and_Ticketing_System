import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
 PORT: process.env.PORT || '5002',
 DATABASE_URL: process.env.DATABASE_URL || '',
 JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-key-2026',
 JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
 CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5175',
 FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5175',
 MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE) || 5242880,
};
