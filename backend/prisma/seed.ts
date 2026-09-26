import { PrismaClient, RoleName, TicketPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
 console.log(' Starting database seeding...');

 // 1. Create Departments
 const deptIT = await prisma.department.upsert({
 where: { code: 'DEPT-IT' },
 update: {},
 create: { name: 'Information Technology', code: 'DEPT-IT' },
 });

 const deptHR = await prisma.department.upsert({
 where: { code: 'DEPT-HR' },
 update: {},
 create: { name: 'Human Resources', code: 'DEPT-HR' },
 });

 const deptFIN = await prisma.department.upsert({
 where: { code: 'DEPT-FIN' },
 update: {},
 create: { name: 'Finance & Operations', code: 'DEPT-FIN' },
 });

 console.log('[x] Departments created');

 // 2. Hash default passwords
 const adminPassword = await bcrypt.hash('Admin123!', 10);
 const helpdeskPassword = await bcrypt.hash('Helpdesk123!', 10);
 const techPassword = await bcrypt.hash('Tech123!', 10);
 const userPassword = await bcrypt.hash('User123!', 10);

 // 3. Create Users
 const admin = await prisma.user.upsert({
 where: { email: 'admin@company.com' },
 update: {},
 create: {
 email: 'admin@company.com',
 passwordHash: adminPassword,
 fullName: 'System Administrator',
 role: RoleName.ADMIN,
 departmentId: deptIT.id,
 },
 });

 const helpdesk = await prisma.user.upsert({
 where: { email: 'helpdesk@company.com' },
 update: {},
 create: {
 email: 'helpdesk@company.com',
 passwordHash: helpdeskPassword,
 fullName: 'Helpdesk Officer (Triage)',
 role: RoleName.HELPDESK,
 departmentId: deptIT.id,
 },
 });

 const techAhmad = await prisma.user.upsert({
 where: { email: 'technician.ahmad@company.com' },
 update: {},
 create: {
 email: 'technician.ahmad@company.com',
 passwordHash: techPassword,
 fullName: 'Ahmad Subagja (Network Engineer)',
 role: RoleName.TECHNICIAN,
 departmentId: deptIT.id,
 },
 });

 const techSiti = await prisma.user.upsert({
 where: { email: 'technician.siti@company.com' },
 update: {},
 create: {
 email: 'technician.siti@company.com',
 passwordHash: techPassword,
 fullName: 'Siti Rahma (Hardware Specialist)',
 role: RoleName.TECHNICIAN,
 departmentId: deptIT.id,
 },
 });

 const employee = await prisma.user.upsert({
 where: { email: 'budi.employee@company.com' },
 update: {},
 create: {
 email: 'budi.employee@company.com',
 passwordHash: userPassword,
 fullName: 'Budi Santoso',
 role: RoleName.EMPLOYEE,
 departmentId: deptFIN.id,
 },
 });

 console.log('[x] Demo Users created (Admin, Helpdesk, Technicians, Employee)');

 // 4. Create SLA Rules
 const slaRules = [
 { priority: TicketPriority.CRITICAL, resolutionHours: 4 },
 { priority: TicketPriority.HIGH, resolutionHours: 8 },
 { priority: TicketPriority.MEDIUM, resolutionHours: 24 },
 { priority: TicketPriority.LOW, resolutionHours: 72 },
 ];

 for (const rule of slaRules) {
 await prisma.slaRule.upsert({
 where: { priority: rule.priority },
 update: { resolutionHours: rule.resolutionHours },
 create: rule,
 });
 }

 console.log('[x] SLA Rules created');

 // 5. Create Ticket Categories
 const categories = [
 { name: 'Hardware Issue', description: 'Laptop, desktop, monitor, keyboard, mouse problems' },
 { name: 'Software Bug & License', description: 'Application crashes, MS Office, OS activation' },
 { name: 'Network & VPN', description: 'WiFi connection, VPN access, firewall issues' },
 { name: 'Account & Access', description: 'Password reset, SAP account access, Active Directory' },
 { name: 'Printer & Scanner', description: 'Office printer connectivity and paper jam' },
 { name: 'Email & Communication', description: 'Outlook configuration, Teams issues' },
 ];

 for (const cat of categories) {
 await prisma.ticketCategory.upsert({
 where: { name: cat.name },
 update: {},
 create: cat,
 });
 }

 console.log('[x] Ticket Categories created');

 // 6. Create Knowledge Base Articles
 const articles = [
 {
 title: 'How to Reset Corporate Email & Outlook Password',
 slug: 'how-to-reset-corporate-email-password',
 category: 'Account & Access',
 tags: ['password', 'outlook', 'email', 'account'],
 content:
 'Step 1: Navigate to password.company.com.\nStep 2: Enter your employee ID and MFA OTP code.\nStep 3: Choose a strong password containing uppercase, lowercase, numbers, and symbols.\nStep 4: Update credentials in your Outlook desktop app.',
 authorId: admin.id,
 viewsCount: 42,
 },
 {
 title: 'Connecting to Enterprise Office WiFi & VPN',
 slug: 'connecting-to-enterprise-wifi-and-vpn',
 category: 'Network & VPN',
 tags: ['wifi', 'vpn', 'network', 'connect'],
 content:
 'Step 1: Select "Company-Secure-WiFi" from network settings.\nStep 2: Use WPA3-Enterprise credentials with your Domain\\username.\nStep 3: Launch FortiClient/GlobalProtect VPN when working remotely.',
 authorId: techAhmad.id,
 viewsCount: 28,
 },
 {
 title: 'Printer Troubleshooting & Paper Jam Clearance',
 slug: 'printer-troubleshooting-and-paper-jam',
 category: 'Printer & Scanner',
 tags: ['printer', 'paper jam', 'spooler'],
 content:
 'Step 1: Turn off printer power switch before clearing paper jams.\nStep 2: Gently pull paper in the direction of the paper path.\nStep 3: Restart Print Spooler service from Windows Services console if print jobs queue is frozen.',
 authorId: techSiti.id,
 viewsCount: 19,
 },
 ];

 for (const art of articles) {
 await prisma.knowledgeArticle.upsert({
 where: { slug: art.slug },
 update: {},
 create: art,
 });
 }

 console.log('[x] Knowledge Base articles created');
 console.log(' Seeding completed successfully!');
}

main()
 .catch((e) => {
 console.error('[ ] Seeding failed:', e);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
