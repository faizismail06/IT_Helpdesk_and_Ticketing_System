# Enterprise IT Helpdesk & Ticketing System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

> An enterprise-grade, real-time IT Service Desk & Ticket Management platform engineered with strict TypeScript typing, state-machine ticket workflows, live Socket.IO notification engines, SLA countdown enforcement, Knowledge Base deflection, and complete audit logging.

---

## Key Features & Technical Highlights

- ⏱ **Realtime SLA Countdown & Overdue Engine**: Dynamic SLA deadline calculations based on ticket priority (`CRITICAL`: 2h, `HIGH`: 4h, `MEDIUM`: 24h, `LOW`: 48h) with live ticking countdown meters and auto-overdue flag detection.
- **Strict Ticket State-Machine Workflow**: Enforces invalid transition prevention (`NEW` -> `OPEN` -> `IN_PROGRESS` -> `PENDING` -> `RESOLVED` -> `CLOSED` / `REOPENED`).
- **Real-Time Websocket Notifications**: Socket.IO connection with JWT handshake and targeted room delivery (`user_{id}`, `ticket_{id}`, `role_helpdesk`) for immediate assignment & status updates.
- **Enterprise Auto-Numbering**: Transaction-safe unique ticket format (`IT-YYYY-XXXXXX`) generated automatically on submission.
- **Role-Based Access Control (RBAC)**: 4 specialized user roles (*Employee*, *Helpdesk*, *Technician*, *Admin*) with distinct interfaces, actions, and data visibility rules.
- **Smart Knowledge Base Deflection**: Auto-suggests relevant KB articles during ticket creation to reduce helpdesk volume before submission.
- **Role-Protected Thread & Internal Notes**: Support for public requester communication alongside IT-restricted internal notes.
- **Visual Analytics & Data Exporter**: Recharts integration for priority/category distribution charts and 1-click CSV/Excel report exporter.
- **Full Audit Logging**: Automated tracking of all system actions (status updates, assignments, user creations, SLA rule changes) with requester IP and metadata payload.

---

## System Architecture

```mermaid
graph TD
 User([User Browser]) <--> ReactApp[Vite React + TS Single-Page App]
 
 subgraph REST & Websocket API Layer
 ReactApp <-->|HTTP REST / API v1| ExpressServer[Express.js Node.js Server]
 ReactApp <-->|Websocket WS| SocketEngine[Socket.IO Gateway Engine]
 end

 subgraph Security & Middleware
 ExpressServer --> AuthGuard[JWT Authentication Guard]
 ExpressServer --> RoleGuard[RBAC Permission Guard]
 ExpressServer --> UploadGuard[Multer Attachment Validator]
 end

 subgraph Business Logic Core
 ExpressServer --> TicketEngine[Ticket & Workflow Service]
 ExpressServer --> SLAEngine[SLA Rules Engine]
 ExpressServer --> KBEngine[Knowledge Base & Deflection Service]
 ExpressServer --> AuditEngine[Audit Log Service]
 end

 subgraph Persistence Layer
 TicketEngine <--> PrismaORM[Prisma ORM]
 SLAEngine <--> PrismaORM
 KBEngine <--> PrismaORM
 AuditEngine <--> PrismaORM
 PrismaORM <--> Database[(PostgreSQL Database)]
 end
```

---

## Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
 User ||--o{ Ticket : "creates (requester)"
 User ||--o{ Ticket : "assigned (technician)"
 User ||--o{ TicketComment : "authors"
 User ||--o{ TicketHistory : "triggers"
 User ||--o{ Notification : "receives"
 User ||--o{ AuditLog : "executes"
 Department ||--o{ User : "belongs to"
 Category ||--o{ Ticket : "categorizes"
 Category ||--o{ KnowledgeBase : "groups"
 Ticket ||--o{ TicketComment : "contains"
 Ticket ||--o{ TicketHistory : "logs transition"
 Ticket ||--o{ Attachment : "includes"
 Ticket ||--o{ Rating : "receives feedback"
 SlaRule ||--o{ Ticket : "applies SLA"

 User {
 string id PK
 string email UK
 string password
 string fullName
 string role "EMPLOYEE | HELPDESK | TECHNICIAN | ADMIN"
 boolean isActive
 }

 Ticket {
 string id PK
 string ticketNumber UK "IT-YYYY-XXXXXX"
 string subject
 string description
 string status "NEW | OPEN | IN_PROGRESS | PENDING | RESOLVED | CLOSED | REOPENED"
 string priority "LOW | MEDIUM | HIGH | CRITICAL"
 datetime slaDueDate
 boolean isOverdue
 }

 SlaRule {
 string id PK
 string priority UK
 int resolutionHours
 }

 KnowledgeBase {
 string id PK
 string title
 string content
 int helpfulCount
 }
```

---

## Demo Access Credentials

The database comes pre-seeded with ready-to-use role credentials for immediate evaluation:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@enterprise.com` | `password123` | Full access: User management, SLA rule editor, audit logs, reports & system configuration. |
| **Helpdesk Agent** | `helpdesk@enterprise.com` | `password123` | Triage queue, ticket assignment, status updates, reports, internal notes. |
| **Technician** | `technician@enterprise.com` | `password123` | Workstation queue, ticket resolution, customer comments, internal technical notes. |
| **Employee** | `employee@enterprise.com` | `password123` | Ticket creation with KB deflection, ticket tracking, 5-star resolution rating. |

---

## API Endpoint Documentation Summary

### Auth Module (`/api/v1/auth`)
- `POST /login` - Authenticate user credentials and return JWT token + profile info.
- `GET /me` - Retrieve current authenticated user profile.

### Tickets Core (`/api/v1/tickets`)
- `GET /` - List tickets with filtering (search, status, priority, category, pagination).
- `POST /` - Create a new ticket (auto-generates `IT-YYYY-XXXXXX` number & SLA deadline).
- `GET /:id` - Get ticket details including comments, history, attachments, and ratings.
- `POST /:id/comments` - Post public comment or IT internal note.
- `PATCH /:id/status` - Transition ticket status (validates state machine rules).
- `PATCH /:id/assign` - Assign or re-assign ticket to a technician.

### Knowledge Base (`/api/v1/kb`)
- `GET /` - List published KB articles or search by keyword.
- `GET /deflect?query=...` - Auto-suggest relevant KB articles for title keywords.

### Admin & SLA Engine (`/api/v1/admin` & `/api/v1/sla-rules`)
- `GET /admin/users` - Fetch user directory.
- `POST /admin/users` - Create a new user account.
- `PATCH /users/:id/status` - Activate or deactivate user access.
- `GET /sla-rules` - Retrieve SLA resolution hours per priority.
- `PUT /sla-rules/:id` - Update SLA target resolution hours.
- `GET /admin/audit-logs` - Retrieve detailed audit trail entries.

---

## Quickstart Local Installation Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **PostgreSQL**: Local instance running on port `5432`

### 1. Clone & Configure Environment

```bash
git clone https://github.com/your-username/IT_Helpdesk_and_Ticketing_System.git
cd IT_Helpdesk_and_Ticketing_System
```

Configure `backend/.env`:
```env
PORT=5002
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/it_helpdesk_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5175"
```

### 2. Setup Backend Database & Run

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```
*Backend will start on `http://localhost:5002`*

### 3. Setup Frontend & Run

In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will start on `http://localhost:5175`*

---

## Tech Stack Summary

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS / Vanilla CSS, Lucide Icons, Recharts, React Query, Socket.IO Client.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Socket.IO, JWT, BcryptJS, Zod Validation, Multer.
