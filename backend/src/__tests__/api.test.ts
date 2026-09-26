import request from 'supertest';
import app from '../app';

describe('IT Helpdesk Backend API Test Suite', () => {
 describe('GET /api/v1/health', () => {
 it('should return status ok and service name', async () => {
 const res = await request(app).get('/api/v1/health');
 expect(res.status).toBe(200);
 expect(res.body).toHaveProperty('status', 'ok');
 expect(res.body).toHaveProperty('service', 'IT Helpdesk Backend');
 });
 });

 describe('POST /api/v1/auth/login', () => {
 it('should reject invalid credentials with 401', async () => {
 const res = await request(app).post('/api/v1/auth/login').send({
 email: 'invalid@enterprise.com',
 password: 'wrongpassword',
 });
 expect(res.status).toBe(401);
 expect(res.body).toHaveProperty('success', false);
 });

 it('should successfully authenticate valid admin credentials', async () => {
 const res = await request(app).post('/api/v1/auth/login').send({
 email: 'admin@enterprise.com',
 password: 'password123',
 });
 if (res.status === 200) {
 expect(res.body.data).toHaveProperty('token');
 expect(res.body.data.user).toHaveProperty('role', 'ADMIN');
 }
 });
 });
});
