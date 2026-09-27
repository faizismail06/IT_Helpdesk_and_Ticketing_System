import request from 'supertest';
import app from '../app';
import { prisma } from '../config/db';

const credentials = {
 employee: { email: 'budi.employee@company.com', password: 'User123!' },
 helpdesk: { email: 'helpdesk@company.com', password: 'Helpdesk123!' },
 technician: { email: 'technician.ahmad@company.com', password: 'Tech123!' },
 otherTechnician: { email: 'technician.siti@company.com', password: 'Tech123!' },
};

const login = async (account: keyof typeof credentials) => {
 const response = await request(app).post('/api/v1/auth/login').send(credentials[account]);
 expect(response.status).toBe(200);
 return response.body.data;
};

describe('IT Helpdesk API', () => {
 let createdTicketId: string | undefined;

 afterEach(async () => {
 if (!createdTicketId) return;
 await prisma.notification.deleteMany({ where: { ticketId: createdTicketId } });
 await prisma.ticket.deleteMany({ where: { id: createdTicketId } });
 createdTicketId = undefined;
 });

 afterAll(async () => {
 await prisma.$disconnect();
 });

 it('returns the service health status', async () => {
 const response = await request(app).get('/api/v1/health');
 expect(response.status).toBe(200);
 expect(response.body).toMatchObject({ status: 'ok', service: 'IT Helpdesk Backend' });
 });

 it('rejects invalid credentials', async () => {
 const response = await request(app).post('/api/v1/auth/login').send({
 email: 'invalid@company.com',
 password: 'wrongpassword',
 });
 expect(response.status).toBe(401);
 expect(response.body.success).toBe(false);
 });

 it('completes the ticket lifecycle from submission through rating', async () => {
 const employee = await login('employee');
 const helpdesk = await login('helpdesk');
 const technician = await login('technician');
 const otherTechnician = await login('otherTechnician');
 const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

 const technicianCreateAttempt = await request(app)
 .post('/api/v1/tickets')
 .set(auth(technician.token))
 .send({
 subject: 'Technician should not submit',
 description: 'This request must be rejected by role authorization.',
 categoryId: '00000000-0000-0000-0000-000000000000',
 impact: 'INDIVIDUAL',
 urgency: 'LOW',
 });
 expect(technicianCreateAttempt.status).toBe(403);

 const employeeKnowledgeBase = await request(app)
 .get('/api/v1/knowledge-base')
 .set(auth(employee.token));
 expect(employeeKnowledgeBase.status).toBe(200);

 const technicianKnowledgeBase = await request(app)
 .get('/api/v1/knowledge-base')
 .set(auth(technician.token));
 expect(technicianKnowledgeBase.status).toBe(403);

 const categoriesResponse = await request(app)
 .get('/api/v1/categories')
 .set(auth(employee.token));
 expect(categoriesResponse.status).toBe(200);
 const categoryId = categoriesResponse.body.data[0].id;

 const beforeStats = await request(app)
 .get('/api/v1/dashboard/stats')
 .set(auth(helpdesk.token));
 expect(beforeStats.status).toBe(200);

 const createResponse = await request(app)
 .post('/api/v1/tickets')
 .set(auth(employee.token))
 .send({
 subject: `Lifecycle test ${Date.now()}`,
 description: 'Integration test ticket covering the complete support workflow.',
 categoryId,
 impact: 'DEPARTMENT',
 urgency: 'CRITICAL',
 });
 expect(createResponse.status).toBe(201);
 expect(createResponse.body.data.status).toBe('NEW');
 expect(createResponse.body.data.suggestedPriority).toBe('CRITICAL');
 expect(createResponse.body.data.isPriorityReviewed).toBe(false);
 createdTicketId = createResponse.body.data.id;

 const editResponse = await request(app)
 .patch(`/api/v1/tickets/${createdTicketId}`)
 .set(auth(employee.token))
 .send({ subject: `Updated lifecycle test ${Date.now()}`, description: 'Updated details before the helpdesk starts triage and assignment.' });
 expect(editResponse.status).toBe(200);
 expect(editResponse.body.data.subject).toContain('Updated lifecycle test');

 const attachmentResponse = await request(app)
 .post(`/api/v1/tickets/${createdTicketId}/attachments`)
 .set(auth(employee.token))
 .attach('file', Buffer.from('%PDF-1.4 test attachment'), { filename: 'evidence.pdf', contentType: 'application/pdf' });
 expect(attachmentResponse.status).toBe(201);
 expect(attachmentResponse.body.data.originalFilename).toBe('evidence.pdf');

 const deleteAttachmentResponse = await request(app)
 .delete(`/api/v1/attachments/${attachmentResponse.body.data.id}`)
 .set(auth(employee.token));
 expect(deleteAttachmentResponse.status).toBe(200);

 const queueResponse = await request(app)
 .get('/api/v1/tickets')
 .set(auth(helpdesk.token));
 expect(queueResponse.status).toBe(200);
 expect(queueResponse.body.data.tickets.some((ticket: any) => ticket.id === createdTicketId)).toBe(true);
 expect(queueResponse.body.data.pagination).toMatchObject({ page: 1, limit: 10 });

 const afterStats = await request(app)
 .get('/api/v1/dashboard/stats')
 .set(auth(helpdesk.token));
 expect(afterStats.status).toBe(200);
 expect(afterStats.body.data.total).toBe(beforeStats.body.data.total + 1);
 expect(afterStats.body.data.unassigned).toBeGreaterThanOrEqual(1);

 const assignResponse = await request(app)
 .post(`/api/v1/tickets/${createdTicketId}/assign`)
 .set(auth(helpdesk.token))
 .send({ technicianId: technician.user.id, priority: 'HIGH' });
 expect(assignResponse.status).toBe(200);

 const assignedTicket = await request(app)
 .get(`/api/v1/tickets/${createdTicketId}`)
 .set(auth(technician.token));
 expect(assignedTicket.status).toBe(200);
 expect(assignedTicket.body.data.status).toBe('OPEN');
 expect(assignedTicket.body.data.priority).toBe('HIGH');
 expect(assignedTicket.body.data.isPriorityReviewed).toBe(true);

 const unauthorizedTicket = await request(app)
 .get(`/api/v1/tickets/${createdTicketId}`)
 .set(auth(otherTechnician.token));
 expect(unauthorizedTicket.status).toBe(403);

 const startResponse = await request(app)
 .patch(`/api/v1/tickets/${createdTicketId}/status`)
 .set(auth(technician.token))
 .send({ status: 'IN_PROGRESS', workTimeMins: 10 });
 expect(startResponse.status).toBe(200);
 expect(startResponse.body.data.status).toBe('IN_PROGRESS');

 const internalComment = await request(app)
 .post(`/api/v1/tickets/${createdTicketId}/comments`)
 .set(auth(technician.token))
 .send({ message: 'Internal diagnostic notes', isInternal: true });
 expect(internalComment.status).toBe(201);

 const employeeView = await request(app)
 .get(`/api/v1/tickets/${createdTicketId}`)
 .set(auth(employee.token));
 expect(employeeView.status).toBe(200);
 expect(employeeView.body.data.comments.some((comment: any) => comment.isInternal)).toBe(false);

 const resolveResponse = await request(app)
 .patch(`/api/v1/tickets/${createdTicketId}/status`)
 .set(auth(technician.token))
 .send({ status: 'RESOLVED', reason: 'Issue fixed and verified by the technician.', workTimeMins: 20 });
 expect(resolveResponse.status).toBe(200);
 expect(resolveResponse.body.data.status).toBe('RESOLVED');
 expect(resolveResponse.body.data.workTimeMins).toBe(30);

 const technicianRatingAttempt = await request(app)
 .post(`/api/v1/tickets/${createdTicketId}/rating`)
 .set(auth(technician.token))
 .send({ score: 5, feedback: 'Self rating must be rejected.' });
 expect(technicianRatingAttempt.status).toBe(403);

 const closeResponse = await request(app)
 .patch(`/api/v1/tickets/${createdTicketId}/status`)
 .set(auth(employee.token))
 .send({ status: 'CLOSED', reason: 'Resolution confirmed.' });
 expect(closeResponse.status).toBe(200);
 expect(closeResponse.body.data.status).toBe('CLOSED');

 const ratingResponse = await request(app)
 .post(`/api/v1/tickets/${createdTicketId}/rating`)
 .set(auth(employee.token))
 .send({ score: 5, feedback: 'Resolved successfully.' });
 expect(ratingResponse.status).toBe(201);
 expect(ratingResponse.body.data.score).toBe(5);
 });
});
