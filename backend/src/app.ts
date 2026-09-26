import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { globalRateLimiter, authRateLimiter } from './middlewares/rateLimiter';

const app = express();

app.use(helmet());
app.use(
 cors({
 origin: env.CORS_ORIGIN,
 credentials: true,
 })
);

// Apply rate limiting in non-test environment
if (process.env.NODE_ENV !== 'test') {
 app.use('/api/v1/auth', authRateLimiter);
 app.use('/api/v1', globalRateLimiter);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
 res.status(200).json({ status: 'ok', service: 'IT Helpdesk Backend', timestamp: new Date() });
});

// API Routes
app.use('/api/v1', routes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
