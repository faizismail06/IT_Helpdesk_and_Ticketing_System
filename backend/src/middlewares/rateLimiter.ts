import rateLimit from 'express-rate-limit';

// Global API rate limiter (100 requests per 15 minutes)
export const globalRateLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 100,
 standardHeaders: true,
 legacyHeaders: false,
 message: {
 status: 'error',
 message: 'Too many requests from this IP, please try again after 15 minutes.',
 },
});

// Strict auth route rate limiter (10 requests per 15 minutes to prevent brute-force attacks)
export const authRateLimiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 15,
 standardHeaders: true,
 legacyHeaders: false,
 message: {
 status: 'error',
 message: 'Too many login attempts from this IP, please try again after 15 minutes.',
 },
});
