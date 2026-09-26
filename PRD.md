# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Enterprise IT Helpdesk & Ticketing System

---

| Document Attribute | Value |
| :--- | :--- |
| **Project Title** | Enterprise IT Helpdesk & Ticketing System |
| **Document Version** | 1.0.0 |
| **Status** | Approved for Development |
| **Author** | Full-Stack Software Engineer |
| **Target Platform** | Web (Desktop-first Responsive Enterprise Web App) |
| **Tech Stack** | React (Vite + TS) + Express.js (TS) + PostgreSQL (Prisma) + Socket.IO |

---

## 1. Executive Summary & Project Objectives

### 1.1 Business Purpose
In modern enterprise environments, managing IT issues (hardware failures, software glitches, network downtime, access requests) via email or informal chat leads to untracked issues, breached SLAs, frustrated employees, and overloaded IT staff. 

The **Enterprise IT Helpdesk & Ticketing System** is a robust, production-grade internal service management platform designed to automate ticket lifecycle management, streamline technician assignments, enforce Service Level Agreements (SLAs), enable real-time communication, and provide actionable performance metrics to IT leadership.

### 1.2 Core Objectives
- **Systematic Ticket Triage & Resolution**: Standardized lifecycle workflow with strict state transitions preventing invalid status jumps.
- **SLA Tracking & Breach Prevention**: Dynamic SLA calculation engines (Low, Medium, High, Critical) with realtime countdowns and automated breach flags.
- **Multi-Role RBAC**: 4 granular user roles (Employee, Helpdesk, Technician, Admin) with enforced server-side authorization.
- **Realtime Incident Communication**: Instant notification dispatch using Socket.IO alongside persisted in-app notifications and detailed ticket activity logs.
- **Knowledge Base Integration**: Self-service deflection to reduce redundant IT ticket creation.
- **Data-Driven Performance Analytics**: Comprehensive dashboards for each role and exportable reports (PDF/Excel) for IT management.

---

## 2. User Roles & RBAC Matrix

### 2.1 Role Definitions

1. **Employee / Requester**: Internal company staff needing IT assistance.
2. **Helpdesk / Tier 1 Support**: Front-line IT triage staff responsible for reviewing incoming tickets, assigning priorities, categorizing, and routing tickets to specialized technicians.
3. **Technician / Tier 2 & 3 Support**: Specialized IT engineers responsible for diagnosing, working on, providing technical resolutions, and logging work effort for assigned tickets.
4. **Admin**: IT System Administrator responsible for user management, role assignments, SLA rules configuration, master category management, audit log inspection, and system reports.

### 2.2 Permissions Matrix (RBAC)

| Feature / Action | Employee | Helpdesk | Technician | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Create Ticket** | [x] | [x] | [x] | [x] |
| **View Own Tickets** | [x] | [x] | [x] | [x] |
| **View All Tickets** | [ ] | [x] | [ ] (Only Assigned/Allowed) | [x] |
| **Triage & Assign Ticket** | [ ] | [x] | [ ] | [x] |
| **Change Priority & Category** | [ ] | [x] | [ ] | [x] |
| **Execute Ticket Status Transition** | Restricted (Reopen) | [x] | Allowed (Assigned) | [x] |
| **Post Public Comments** | [x] | [x] | [x] | [x] |
| **Log Resolution & Work Effort** | [ ] | [ ] | [x] | [x] |
| **Upload Attachments** | [x] | [x] | [x] | [x] |
| **Submit Ticket Rating & Feedback** | [x] (Own Ticket) | [ ] | [ ] | [ ] |
| **Manage Knowledge Base (Create/Edit)** | [ ] | [x] | [x] | [x] |
| **View Knowledge Base** | [x] | [x] | [x] | [x] |
| **View SLA Deadlines & Breach Status** | [x] (View) | [x] | [x] | [x] |
| **Manage SLA Rules & Categories** | [ ] | [ ] | [ ] | [x] |
| **User & Role Management** | [ ] | [ ] | [ ] | [x] |
| **View Audit Logs** | [ ] | [ ] | [ ] | [x] |
| **View System Analytics & Export Reports** | [ ] | [x] | [ ] (Own metrics) | [x] |

---

## 3. High-Level Architecture & System Design

```
+-------------------------------------------------------------------------+
| CLIENT LAYER |
| React (Vite + TS) + Tailwind CSS + TanStack Query + Socket.IO Client |
+------------------------------------+------------------------------------+
 |
 | REST API (HTTP/HTTPS) & WebSockets
 v
+-------------------------------------------------------------------------+
| SERVER LAYER |
| Node.js + Express.js + TypeScript (Modular Architecture) |
| +-------------------+ +--------------------+ +--------------------+ |
| | Controllers & Routers| | Business Services | | Auth (JWT/bcrypt) | |
| +-------------------+ +--------------------+ +--------------------+ |
| | Socket.IO Gateway | | SLA Engine / Worker| | Audit Log Interceptor |
| +-------------------+ +--------------------+ +--------------------+ |
+------------------------------------+------------------------------------+
 |
 | Prisma ORM
 v
+-------------------------------------------------------------------------+
| DATABASE LAYER |
| PostgreSQL (Relational Database) |
+-------------------------------------------------------------------------+
```

---

## 4. Database Architecture & Schema (Prisma Schema Specification)

```prisma
datasource db {
 provider = "postgresql"
 url = env("DATABASE_URL")
}

generator client {
 provider = "prisma-client-js"
}

enum RoleName {
 EMPLOYEE
 HELPDESK
 TECHNICIAN
 ADMIN
}

enum TicketPriority {
 LOW
 MEDIUM
 HIGH
 CRITICAL
}

enum TicketStatus {
 NEW
 OPEN
 IN_PROGRESS
 PENDING
 RESOLVED
 CLOSED
 REOPENED
 OVERDUE
}

model Department {
 id String @id @default(uuid())
 name String @unique
 code String @unique
 users User[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}

model User {
 id String @id @default(uuid())
 email String @unique
 passwordHash String
 fullName String
 avatarUrl String?
 role RoleName @default(EMPLOYEE)
 departmentId String
 department Department @relation(fields: [departmentId], references: [id])
 isActive Boolean @default(true)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 createdTickets Ticket[] @relation("TicketRequester")
 assignedTickets TicketAssignment[] @relation("AssignedTechnician")
 assignedByTickets TicketAssignment[] @relation("AssignedByHelpdesk")
 comments TicketComment[]
 attachments TicketAttachment[]
 historyEntries TicketHistory[]
 notifications Notification[]
 articles KnowledgeArticle[]
 ratings TicketRating[]
 auditLogs AuditLog[]

 @@index([email])
 @@index([role])
}

model TicketCategory {
 id String @id @default(uuid())
 name String @unique // e.g., Hardware, Software, Network, Account
 description String?
 isActive Boolean @default(true)
 tickets Ticket[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}

model SlaRule {
 id String @id @default(uuid())
 priority TicketPriority @unique
 resolutionHours Int // e.g., LOW=72, MEDIUM=24, HIGH=8, CRITICAL=4
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}

model Ticket {
 id String @id @default(uuid())
 ticketNumber String @unique // e.g., IT-2026-000001
 subject String
 description String
 categoryId String
 category TicketCategory @relation(fields: [categoryId], references: [id])
 priority TicketPriority @default(MEDIUM)
 status TicketStatus @default(NEW)
 requesterId String
 requester User @relation("TicketRequester", fields: [requesterId], references: [id])
 slaDeadline DateTime
 isOverdue Boolean @default(false)
 workTimeMins Int @default(0)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 assignments TicketAssignment[]
 comments TicketComment[]
 attachments TicketAttachment[]
 history TicketHistory[]
 rating TicketRating?

 @@index([ticketNumber])
 @@index([status])
 @@index([priority])
 @@index([requesterId])
 @@index([categoryId])
 @@index([slaDeadline])
}

model TicketAssignment {
 id String @id @default(uuid())
 ticketId String
 ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
 technicianId String
 technician User @relation("AssignedTechnician", fields: [technicianId], references: [id])
 assignedById String
 assignedBy User @relation("AssignedByHelpdesk", fields: [assignedById], references: [id])
 assignedAt DateTime @default(now())

 @@index([ticketId])
 @@index([technicianId])
}

model TicketComment {
 id String @id @default(uuid())
 ticketId String
 ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
 userId String
 user User @relation(fields: [userId], references: [id])
 message String
 isInternal Boolean @default(false) // For technician internal notes
 attachments TicketAttachment[]
 createdAt DateTime @default(now())

 @@index([ticketId])
}

model TicketAttachment {
 id String @id @default(uuid())
 ticketId String?
 ticket Ticket? @relation(fields: [ticketId], references: [id], onDelete: Cascade)
 commentId String?
 comment TicketComment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
 filename String
 originalFilename String
 mimeType String
 fileSize Int
 filePath String
 uploadedById String
 uploadedBy User @relation(fields: [uploadedById], references: [id])
 uploadedAt DateTime @default(now())

 @@index([ticketId])
 @@index([commentId])
}

model TicketHistory {
 id String @id @default(uuid())
 ticketId String
 ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
 actorId String
 actor User @relation(fields: [actorId], references: [id])
 action String // e.g., CREATED, STATUS_CHANGED, ASSIGNED, PRIORITY_UPDATED
 oldValue String?
 newValue String?
 timestamp DateTime @default(now())

 @@index([ticketId])
}

model TicketRating {
 id String @id @default(uuid())
 ticketId String @unique
 ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
 userId String
 user User @relation(fields: [userId], references: [id])
 score Int // 1 to 5
 feedback String?
 createdAt DateTime @default(now())
}

model KnowledgeArticle {
 id String @id @default(uuid())
 title String
 slug String @unique
 content String
 category String
 tags String[]
 authorId String
 author User @relation(fields: [authorId], references: [id])
 isPublished Boolean @default(true)
 viewsCount Int @default(0)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@index([category])
}

model Notification {
 id String @id @default(uuid())
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 title String
 message String
 ticketId String?
 isRead Boolean @default(false)
 createdAt DateTime @default(now())

 @@index([userId, isRead])
}

model AuditLog {
 id String @id @default(uuid())
 userId String?
 user User? @relation(fields: [userId], references: [id])
 action String
 module String // e.g., AUTH, TICKET, USER_MGMT, SLA
 recordId String?
 metadata Json?
 timestamp DateTime @default(now())

 @@index([module])
 @@index([timestamp])
}
```

---

## 5. Detailed Feature Specifications & Workflows

### 5.1 Ticket Lifecycle & State Machine Workflow
The ticket status workflow enforces deterministic status transitions. Invalid transitions are blocked on both frontend and backend APIs.

```
 [ NEW ] (Initial state upon employee creation)
 |
 v (Helpdesk triage & priority confirmation)
 [ OPEN ]
 |
 v (Assigned to Technician & work started)
 [ IN_PROGRESS ] <=========> [ PENDING ] (Awaiting customer input/vendor)
 |
 v (Technician provides resolution)
 [ RESOLVED ]
 / \
(Confirm) (Issue persists - Employee Reopen)
 / \
 v v
[ CLOSED ] [ REOPENED ] ===> [ IN_PROGRESS ]
```

#### Valid Transition Matrix

| Current Status | Allowed Next Statuses | Trigger Role | Condition / Required Input |
| :--- | :--- | :--- | :--- |
| `NEW` | `OPEN`, `IN_PROGRESS` | Helpdesk, Admin | Priority & Category verified, Technician assigned |
| `OPEN` | `IN_PROGRESS`, `PENDING` | Technician, Helpdesk, Admin | Technician accepts task |
| `IN_PROGRESS` | `PENDING`, `RESOLVED` | Technician, Helpdesk, Admin | Resolution comment mandatory for `RESOLVED` |
| `PENDING` | `IN_PROGRESS`, `RESOLVED` | Technician, Helpdesk, Admin | Resume work or resolve |
| `RESOLVED` | `CLOSED`, `REOPENED` | Employee (Owner), Admin | Rating modal on `CLOSED`; Reason required for `REOPENED` |
| `CLOSED` | `REOPENED` | Employee (Owner), Admin | Reopen window active |
| `REOPENED` | `IN_PROGRESS` | Technician, Helpdesk, Admin | Technician resumes investigation |

---

### 5.2 SLA Management Engine
1. **Rule Configuration**: SLA resolution hours configured per Priority level in `SlaRule`:
 - `CRITICAL`: **4 Hours**
 - `HIGH`: **8 Hours**
 - `MEDIUM`: **24 Hours**
 - `LOW`: **72 Hours**
2. **Deadline Calculation**: When a ticket is created:
 $$\text{slaDeadline} = \text{createdAt} + \text{SlaRule.resolutionHours}$$
3. **Breach Monitoring & Visual Indicators**:
 - Live dynamic countdown rendered on UI: `[ 03h 42m 12s remaining ]` with dynamic color tokens:
 - > 50% SLA remaining: Emerald green badge
 - 20%–50% SLA remaining: Amber badge
 - < 20% SLA remaining: Pulsing Rose badge
 - Time expired & status != `RESOLVED`/`CLOSED`: **OVERDUE** (Ruby Red alert badge + system notifications).
4. **Background SLA Evaluator**: Server cron job periodically checks non-closed tickets where `slaDeadline < NOW()` and updates `isOverdue = true` while logging SLA Breach in `AuditLog`.

---

### 5.3 Ticket Creation & Auto-Numbering
- **Format**: `IT-YYYY-XXXXXX` (e.g., `IT-2026-000001`, `IT-2026-000002`).
- **Generation Logic**: Atomically calculated sequence combined with calendar year to prevent duplicate key race conditions under concurrent submissions.
- **Knowledge Base Deflection**: As employee types the ticket Subject/Description, fuzzy match queries run against `KnowledgeArticle` database and suggest top 3 relevant KB articles in an accordian sidepanel ("Did this article solve your issue?").

---

### 5.4 Communication, Conversation & File Attachments
- **Timeline Thread**: Chronological display of requester notes, support replies, internal technician notes (private viewable only by Helpdesk/Technician/Admin), system audit logs, and file uploads.
- **Multer Upload Engine**:
 - Max File Size: **5MB**
 - Allowed MIME Types: `pdf`, `png`, `jpeg`, `jpg`, `docx`, `xlsx`.
 - Prohibited Extensions: Executable binaries (`.exe`, `.bat`, `.sh`, `.cmd`, `.js`, `.vbs`, `.msi`).
 - Storage & Security: Files sanitized and stored with generated UUIDs; metadata stored in DB `TicketAttachment`.

---

### 5.5 Realtime Socket.IO Gateway Architecture
- **Room Strategy**:
 - `user_{userId}`: Personal notification channel.
 - `ticket_{ticketId}`: Realtime thread updates for viewers active on the detail page.
 - `role_helpdesk`: Emergency alert room for unassigned incoming tickets.
- **Sockets Events Table**:

| Event Name | Trigger Context | Payload | Recipient Room |
| :--- | :--- | :--- | :--- |
| `ticket:created` | Employee submits new ticket | Ticket summary, Ticket Number | `role_helpdesk` |
| `ticket:assigned` | Helpdesk assigns technician | Ticket ID, Technician Name, SLA Deadline | `user_{technicianId}` |
| `ticket:status_changed` | Any role updates status | Ticket ID, Old Status, New Status | `ticket_{ticketId}`, `user_{requesterId}` |
| `ticket:comment_added` | New comment posted | Comment metadata, Author avatar, Message | `ticket_{ticketId}` |
| `ticket:resolved` | Technician marks resolved | Ticket ID, Resolution summary | `user_{requesterId}` |

---

### 5.6 Rating & Feedback Loop
- Once a ticket moves to `RESOLVED`, the requester receives a prominent banner: **"Rate your IT support experience"**.
- Star Rating Scale: **1 to 5 Stars**.
- Optional Feedback Comment box.
- Enforced single submission per resolution cycle.
- Technician performance analytics aggregate score averages across date ranges.

---

### 5.7 Audit Logging & Non-Editable History
- All state changes, user role updates, SLA rule adjustments, assignments, and ticket deletions generate immutable entries in `AuditLog` and `TicketHistory`.
- Includes timestamp, actor ID, action verb, target module, and JSON diff payload.
- No direct edit or delete routes exposed in application API.

---

## 6. Anti-AI-Slop UI/UX & Design System Architecture

> **Design Core Philosophy**: The interface MUST look like an enterprise operational software tool (inspired by Linear.app, Datadog, Jira Service Management, and Vercel dashboard). It must avoid simplistic Tailwind visual cliches (e.g., standard bright indigo buttons on white cards with standard rounded borders, huge empty white space, and low-density layouts).

### 6.1 Color System & Tokens (CSS Variables)

```css
:root {
 /* Dark Enterprise Canvas Palette */
 --bg-app: #090d16; /* Ultra-deep dark slate background */
 --bg-surface-1: #111726; /* Primary surface container */
 --bg-surface-2: #1a2236; /* Secondary hover/active card surface */
 --bg-surface-glass: rgba(17, 23, 38, 0.75);
 
 --border-subtle: rgba(255, 255, 255, 0.08);
 --border-strong: rgba(255, 255, 255, 0.18);
 
 --text-primary: #f1f5f9;
 --text-secondary: #94a3b8;
 --text-muted: #64748b;
 
 /* Brand Accents */
 --accent-blue: #3b82f6;
 --accent-cyan: #06b6d4;
 --accent-blue-glow: rgba(59, 130, 246, 0.25);
 
 /* Priority & Status Tokens */
 --status-new: #38bdf8; /* Sky blue */
 --status-open: #818cf8; /* Indigo */
 --status-progress: #f59e0b; /* Amber */
 --status-pending: #a855f7; /* Purple */
 --status-resolved: #10b981; /* Emerald */
 --status-closed: #64748b; /* Slate */
 --status-reopened: #ec4899; /* Pink */
 --priority-critical: #ef4444; /* Rose Red */
 --priority-high: #f97316; /* Orange */
 --priority-medium: #eab308; /* Yellow */
 --priority-low: #10b981; /* Green */
}
```

### 6.2 Key Interface Layout Components
1. **Header & Command Bar**: High density bar featuring live system health indicator, socket connection pulse, instant search modal trigger (`Cmd+K / Ctrl+K`), role badge, notification bell popover with unread counter.
2. **Sidebar Navigation**: Sleek collapsed/expanded navigation displaying role-based menu items, unassigned ticket counts, quick view filters (e.g. "Assigned to Me", "Overdue", "Awaiting Input").
3. **Data Tables & Filters**: Dense data grid featuring sortable column headers, status badge dots, SLA countdown meters, inline technician quick assign dropdowns, bulk actions, and pagination metrics.
4. **Ticket Detail Page (The Flagship View)**:
 - **Top Control Header**: Ticket ID breadcrumb, quick status transition buttons (e.g., `Mark In Progress`, `Resolve`), SLA indicator bar, action overflow menu.
 - **Left Canvas (Main Thread)**: Requester problem statement, attached file cards with preview thumbnails, rich comment timeline editor with toggleable `Public Comment` vs `Internal IT Note` tabs.
 - **Right Sidebar (Metadata Panel)**: Collapsible sidebar detailing Requester Profile, Assigned Technician info, Category, Priority selector, Work Time logger, Knowledge Base suggested links, and Audit History timeline.

---

## 7. Complete REST API Specification

### 7.1 Authentication Endpoints
- `POST /api/v1/auth/login`: Authenticate user and issue JWT token (Body: `email`, `password`).
- `POST /api/v1/auth/logout`: Invalidate session / clear client cookie.
- `GET /api/v1/auth/me`: Get current authenticated user profile and roles.
- `POST /api/v1/auth/change-password`: Update authenticated user password.

### 7.2 Ticket Endpoints
- `GET /api/v1/tickets`: Paginated ticket query with search (`q`), status filter (`status`), priority (`priority`), category (`categoryId`), technician (`technicianId`), date range (`startDate`, `endDate`), and sorting.
- `POST /api/v1/tickets`: Create new ticket (Body: `subject`, `description`, `categoryId`, `priority`, `attachments`).
- `GET /api/v1/tickets/:id`: Fetch single ticket with complete history, comments, assignments, attachments, and SLA status.
- `PUT /api/v1/tickets/:id`: Update ticket core fields (Helpdesk/Admin).
- `PATCH /api/v1/tickets/:id/status`: Transition ticket status (Body: `status`, `reason`, `workTimeMins`).
- `POST /api/v1/tickets/:id/assign`: Assign/reassign ticket to technician (Body: `technicianId`).
- `POST /api/v1/tickets/:id/comments`: Add comment or internal note (Body: `message`, `isInternal`, `attachmentIds`).
- `POST /api/v1/tickets/:id/rating`: Submit requester feedback (Body: `score`, `feedback`).

### 7.3 File Upload & Attachments
- `POST /api/v1/attachments`: Upload single/multiple attachments via Multer multipart form data.
- `GET /api/v1/attachments/:id/download`: Securely download stored attachment.

### 7.4 Dashboard & Analytics Endpoints
- `GET /api/v1/dashboard/employee`: Employee specific ticket counters and active items.
- `GET /api/v1/dashboard/helpdesk`: Operational queues, category breakdowns, urgent tickets, unassigned queue.
- `GET /api/v1/dashboard/technician`: Assigned tickets, SLA urgent items, average resolution times.
- `GET /api/v1/dashboard/admin`: System-wide metrics, SLA breach rates, department volumes.
- `GET /api/v1/reports/export`: Export filtered tickets report (Format: `pdf` or `xlsx`).

### 7.5 Knowledge Base & Master Data
- `GET /api/v1/knowledge-base`: Search and browse published KB articles.
- `POST /api/v1/knowledge-base`: Create new KB article (Helpdesk/Admin).
- `PUT /api/v1/knowledge-base/:id`: Edit KB article.
- `GET /api/v1/categories`: List active ticket categories.
- `POST /api/v1/categories`: Create category (Admin).
- `GET /api/v1/sla-rules`: List SLA rules.
- `PUT /api/v1/sla-rules/:id`: Modify priority SLA resolution hours (Admin).

### 7.6 Administration & Audit Logs
- `GET /api/v1/admin/users`: List users with role filter and status.
- `POST /api/v1/admin/users`: Create user account.
- `PATCH /api/v1/admin/users/:id/status`: Activate / Deactivate user account.
- `GET /api/v1/admin/audit-logs`: Query filterable audit log timeline.

---

## 8. Security, Validation & Architecture Rules

1. **Password Hashing**: Mandatory `bcrypt` hashing (min salt rounds = 10). Zero plaintext password persistence.
2. **Stateless JWT Authorization**: JWT payload includes `userId`, `role`, and `departmentId`. Tokens verified via server middleware `authenticateJWT` and `authorizeRoles([...roles])`.
3. **Strict Validation Schemas**:
 - Frontend validation via `React Hook Form` + `Zod`.
 - Backend validation via `Zod` schemas executed in Express validation middlewares before controllers are invoked.
4. **Rate Limiting**: Express rate limiter applied to `/api/v1/auth/login` (max 5 requests per minute per IP) to block brute force attempts.
5. **CORS & HTTP Security**: Configured `cors` origin restricting requests to client domain, `helmet` security headers enabled, sanitized file download streams.
6. **Centralized Error Handling**: Structured JSON error format without stack traces in production:
 ```json
 {
 "success": false,
 "statusCode": 400,
 "message": "Invalid ticket status transition from NEW to CLOSED",
 "errors": []
 }
 ```

---

## 9. Modular Codebase Architecture

```
/IT Helpdesk & Ticketing System
│
├── /backend
│ ├── /prisma
│ │ ├── schema.prisma
│ │ └── seed.ts
│ ├── /src
│ │ ├── /config # Environment, Database & Socket configs
│ │ ├── /controllers # HTTP request handlers
│ │ ├── /middlewares # Auth, RBAC, Validation, Error Handler, Multer
│ │ ├── /routes # Express API Route definitions
│ │ ├── /services # Business logic (SLA Engine, Ticket Workflow, etc.)
│ │ ├── /repositories # Prisma DB queries / abstractions
│ │ ├── /socket # Socket.IO event handlers and rooms
│ │ ├── /types # TypeScript interfaces & Enums
│ │ ├── /utils # Logger, Formatters, JWT helper, File Helpers
│ │ ├── /validators # Zod schemas for incoming requests
│ │ ├── app.ts # Express app configuration
│ │ └── server.ts # HTTP Server & Socket initializer
│ ├── package.json
│ └── tsconfig.json
│
└── /frontend
 ├── /src
 │ ├── /api # Axios client & API endpoints
 │ ├── /components # Reusable UI components (Badges, Tables, Cards, Modals)
 │ ├── /contexts # AuthContext, SocketContext, ThemeContext
 │ ├── /hooks # Custom hooks (useTickets, useSocket, useAuth)
 │ ├── /layouts # AppLayout, AuthLayout, DashboardLayout
 │ ├── /pages # Role Dashboards, Ticket List, Ticket Detail, Admin, KB
 │ ├── /routes # ProtectedRoutes & Router config
 │ ├── /types # Shared TS interfaces
 │ ├── /utils # Date formatters, SLA calculators, Classnames utility
 │ ├── App.tsx
 │ ├── main.tsx
 │ └── index.css # Core Design System & CSS Variables
 ├── package.json
 ├── tailwind.config.js
 └── tsconfig.json
```

---

## 10. Development Roadmap & Phased Execution Plan

The development process is structured into **10 sequential phases**. Each phase contains strict entry and exit criteria.

### Phase 1: Project Foundation & Authentication Setup
- **Goal**: Initialize repositories, database connections, environment variables, authentication API, and baseline JWT protection.
- **Tasks**:
 1. Initialize `/backend` (Express, TS, Prisma, PostgreSQL) and `/frontend` (Vite, React, TS, Tailwind CSS).
 2. Implement Prisma Schema models for `User`, `Role`, `Department`.
 3. Create auth routes (`/login`, `/me`, `/change-password`).
 4. Build JWT auth middleware and bcrypt password hashing.
 5. Build React Auth Context, Login page, and protected route wrapper.
- **Acceptance Criteria**: Users can register/seed login, receive JWT token, access protected routes, and view basic user info.

---

### Phase 2: Role-Based Access Control (RBAC) & Navigation Framework
- **Goal**: Establish the role-based UI container layout and backend authorization matrix.
- **Tasks**:
 1. Implement `authorizeRoles` middleware on Express endpoints.
 2. Build enterprise dark-theme App Shell (Sidebar, Header, Command Bar).
 3. Implement dynamic role-based menu filtering on frontend.
 4. Build role switcher simulation for demo presentation.
- **Acceptance Criteria**: Employee, Helpdesk, Technician, and Admin roles see strictly customized navigation bars and routes.

---

### Phase 3: Core Ticket Engine & Auto-Numbering
- **Goal**: Build ticket creation, auto-number generation, query listing, and basic detail views.
- **Tasks**:
 1. Implement Prisma `Ticket`, `TicketCategory`, and sequence generator.
 2. Build `POST /api/v1/tickets` with Zod validation.
 3. Build Ticket List component with data density table, basic search, and status badges.
 4. Create initial Ticket Detail view.
- **Acceptance Criteria**: Employee can submit ticket, system generates unique ID (`IT-2026-000001`), and ticket appears in list.

---

### Phase 4: Workflow Engine, Triage, SLA & Assignment
- **Goal**: Implement deterministic status state machine, technician assignment, SLA calculations, and activity history.
- **Tasks**:
 1. Build status transition validator service in backend.
 2. Implement SLA deadline calculation logic upon ticket creation.
 3. Build Triage Modal & Technician Assignment endpoint for Helpdesk role.
 4. Implement `TicketHistory` logger service.
 5. Render SLA countdown meters on detail and list views.
- **Acceptance Criteria**: Status cannot bypass state machine rules; Helpdesk can assign technician; SLA countdown displays accurately; changes generate history log.

---

### Phase 5: Realtime Communications & Socket.IO Engine
- **Goal**: Enable instant notifications and ticket detail realtime updates without page reloads.
- **Tasks**:
 1. Set up Socket.IO server on Express backend and Socket context on React frontend.
 2. Implement user rooms and broadcast triggers on creation, assignment, comment, and status update.
 3. Build in-app toast notification popups and persisted notification bell dropdown.
- **Acceptance Criteria**: Assigning a ticket instantly triggers popup on assigned technician's browser without manually refreshing.

---

### Phase 6: Advanced Modules (Attachments, Knowledge Base, Rating & Audit Log)
- **Goal**: Add complete file management, knowledge base deflection, feedback rating, and audit logging.
- **Tasks**:
 1. Set up Multer file upload service with file type/size validation.
 2. Implement Knowledge Base CRUD endpoints and KB deflection widget on ticket creation page.
 3. Build 5-star rating feedback modal for resolved tickets.
 4. Implement system-wide Audit Log recording and Admin viewing table.
- **Acceptance Criteria**: Attachments uploaded securely; KB articles suggest solutions; Requester can submit rating once; Audit log records key actions.

---

### Phase 7: Role Dashboards, Analytics & Exportable Reports
- **Goal**: Build role-tailored metrics dashboards and PDF/Excel report generator.
- **Tasks**:
 1. Build Employee, Helpdesk, Technician, and Admin dashboards with Recharts integration.
 2. Build filtering controls (date, priority, department, technician).
 3. Implement export endpoints generating Excel files and formatted PDF reports.
- **Acceptance Criteria**: Charts dynamically reflect live database records; reports export cleanly with matching filters.

---

### Phase 8: Testing, Validation & Security Hardening
- **Goal**: Comprehensive automated testing, security audit, and edge case coverage.
- **Tasks**:
 1. Write backend API unit/integration tests (Jest / Supertest) covering Auth, Ticket Workflow, SLA Math, and RBAC.
 2. Write frontend component testing (React Testing Library).
 3. Configure rate limiting, CORS policies, helmet headers, and error handling.
- **Acceptance Criteria**: All automated test suites pass; invalid API calls yield uniform structured error responses.

---

### Phase 9: UI/UX Enterprise Polish & Micro-Interactions
- **Goal**: Eliminate visual flaws, enhance visual density, add smooth micro-animations, loading skeletons, and empty states.
- **Tasks**:
 1. Refine high-density data tables, monospaced typography for IDs, and badge glows.
 2. Add skeleton loaders for dashboard charts and detail views.
 3. Implement keyboard shortcuts (`Cmd+K` command search modal).
- **Acceptance Criteria**: UI feels responsive, crisp, and indistinguishable from production enterprise SaaS applications.

---

### Phase 10: Seed Data, Documentation & Portfolio Packaging
- **Goal**: Prepare production-ready GitHub repository with comprehensive README, architectural diagrams, ERD, and automated seed script.
- **Tasks**:
 1. Write database seed script populated with 10 users, 4 roles, 3 departments, 10 categories, 50 Realistic tickets, history, comments, and ratings.
 2. Prepare demo login credentials for all 4 roles.
 3. Create GitHub README documentation with architecture diagrams and API docs.
- **Acceptance Criteria**: Fresh clone and `npm run seed` sets up fully functional demo environment within minutes.

---

## 11. Seed Data & Demo Credentials Specification

To ensure effortless evaluation for technical recruiters and portfolio reviewers, the application includes pre-configured demo accounts:

| Role | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Admin123!` | System control, user management, SLA config, audit logs |
| **Helpdesk** | `helpdesk@company.com` | `Helpdesk123!` | Ticket triage, queue management, technician assignment |
| **Technician** | `technician.ahmad@company.com` | `Tech123!` | Ticket resolution, work logging, technician dashboard |
| **Technician** | `technician.siti@company.com` | `Tech123!` | Secondary technician testing multi-assignee flows |
| **Employee** | `budi.employee@company.com` | `User123!` | Ticket submission, KB deflection, rating & comments |

---

## 12. Verification & Acceptance Criteria Summary

The system is declared fully compliant and complete when:
1. [x] **Auth & RBAC**: Users log in securely; routes and endpoints enforce role authorization without permission bypasses.
2. [x] **Deterministic Workflow**: Tickets transition strictly according to state machine logic (`NEW` -> `OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`).
3. [x] **Automatic SLA Engine**: SLA deadlines auto-calculate upon creation and overdue tickets are flagged dynamically.
4. [x] **Realtime Socket Sync**: Status updates, comments, and assignments propagate instantly to active client browsers.
5. [x] **Non-Editable History & Audit Trail**: Every change creates immutable audit records with timestamps and actor metadata.
6. [x] **Enterprise Design**: The UI features dark mode slate typography, crisp monospaced IDs, micro-indicators, and responsive density without "AI-slop" visual elements.
