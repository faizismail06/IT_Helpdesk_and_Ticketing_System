# REST API

Base URL lokal:

```text
http://localhost:5002/api/v1
```

## Format Response

Berhasil:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Gagal:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "subject", "message": "..." }]
}
```

Endpoint privat membutuhkan:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Auth

### `POST /auth/login`

Public. Menghasilkan token dan profile.

```json
{
  "email": "budi.employee@company.com",
  "password": "User123!"
}
```

### `GET /auth/me`

Semua authenticated user. Mengambil profile dari token aktif.

### `POST /auth/change-password`

Semua authenticated user.

### `POST /auth/logout`

Semua authenticated user. Client tetap harus menghapus token lokal.

## Ticket

### `GET /categories`

Semua authenticated user. Mengambil category aktif.

### `POST /tickets`

Employee only.

```json
{
  "subject": "Laptop tidak menyala",
  "description": "Lampu charging aktif tetapi tombol power tidak merespons.",
  "categoryId": "uuid",
  "impact": "INDIVIDUAL",
  "urgency": "HIGH"
}
```

`priority` dari client tidak diterima. Backend menghitung `suggestedPriority`.

### `GET /tickets`

Query:

| Parameter | Nilai/default |
|---|---|
| `q` | Ticket number, subject, description, requester |
| `status` | TicketStatus |
| `priority` | LOW, MEDIUM, HIGH, CRITICAL |
| `categoryId` | UUID category |
| `page` | Default `1` |
| `limit` | Default `10`, maksimum `100` |
| `sortBy` | `createdAt`, `updatedAt`, `priority`, `slaDeadline` |
| `sortOrder` | `asc` atau `desc` |

Visibility otomatis mengikuti role.

### `GET /tickets/:id`

Menerima UUID atau ticket number. Employee hanya tiket sendiri. Technician hanya tiket sendiri atau assignment aktif. Internal comments tidak dikirim kepada Employee. Rating yang sudah dikirim ikut dalam response dan dapat dilihat oleh requester serta staf yang memang memiliki akses ke tiket tersebut.

### `PATCH /tickets/:id`

Employee requester dapat mengubah subject, description, category, impact, atau urgency selama tiket masih `NEW`.

### `POST /tickets/:id/cancel`

Employee requester dapat membatalkan tiket selama masih `NEW`.

### Attachment

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/tickets/:id/attachments` | Upload multipart field `file` |
| GET | `/attachments/:id/download` | Download setelah verifikasi akses tiket |
| DELETE | `/attachments/:id` | Hapus milik sendiri atau oleh Helpdesk/Admin |

## Workflow

### `POST /tickets/:id/assign`

Helpdesk/Admin only.

```json
{
  "technicianId": "uuid",
  "priority": "HIGH"
}
```

Technician harus aktif dan memiliki role Technician.

### `PATCH /tickets/:id/status`

```json
{
  "status": "RESOLVED",
  "reason": "Driver diperbarui dan koneksi berhasil diuji.",
  "workTimeMins": 30
}
```

`reason` wajib saat target `RESOLVED`. Akses ticket dan transisi diverifikasi backend.

### `POST /tickets/:id/comments`

```json
{
  "message": "Mohon kirim screenshot error terbaru.",
  "isInternal": false
}
```

Employee selalu dipaksa menjadi public comment walaupun mengirim `isInternal: true`.

### `POST /tickets/:id/rating`

Employee requester only; status harus `RESOLVED` atau `CLOSED`.

```json
{
  "score": 5,
  "feedback": "Masalah selesai dengan cepat."
}
```

## Dashboard

### `GET /dashboard/stats`

Semua role. Bentuk `data` berbeda menurut role:

- Employee: total, open, inProgress, resolved, closed, recentTickets.
- Helpdesk: queue totals, overdue, unassigned, category/priority/status distribution.
- Technician: assigned, inProgress, pending, resolved, overdue, urgentTickets.
- Admin: user/ticket totals, SLA compliance, ratings, technician performance.

## Notification

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/notifications` | 20 notification terbaru milik user |
| PUT | `/notifications/read-all` | Tandai semua sudah dibaca |
| PUT | `/notifications/:id/read` | Tandai satu notification |

## Knowledge Base

Employee dapat membaca. Admin dapat membaca dan mengelola.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/knowledge-base?q=&category=` | List/search artikel terbit |
| GET | `/knowledge-base/:slug` | Detail dan increment view count |
| POST | `/knowledge-base` | Admin membuat artikel |
| PATCH | `/knowledge-base/:id` | Admin mengubah/publish artikel |
| DELETE | `/knowledge-base/:id` | Admin menghapus artikel |

## User dan Department

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/users?role=TECHNICIAN` | Helpdesk/Admin | Directory user |
| PATCH | `/users/:id/status` | Admin | Aktif/nonaktif akun |
| GET | `/departments` | Authenticated | List department |

## Admin dan SLA

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/admin/audit-logs` | List audit logs |
| POST | `/admin/users` | Buat user |
| PUT | `/admin/users/:id` | Update user |
| POST | `/admin/users/:id/reset-password` | Reset password |
| GET | `/sla-rules` | List SLA rule |
| PUT | `/sla-rules/:id` | Update resolution hours |
| GET | `/admin/categories` | List seluruh category |
| POST | `/admin/categories` | Buat category |
| PATCH | `/admin/categories/:id` | Ubah/nonaktifkan category |

Semua endpoint pada bagian ini Admin only.

## Report

### `GET /reports/export`

Helpdesk/Admin only. Menghasilkan JSON dataset; frontend mengubahnya menjadi workbook `.xlsx`.

Query opsional:

- `startDate`
- `endDate`
- `priority`
- `status`
- `categoryId`

Dataset memuat ticket number, subject, category, impact, urgency, suggested/final priority, review flag, status, requester, department, technician, SLA, overdue, work time, rating, dan created date.

## Health Check

### `GET /health`

Public.

```json
{
  "status": "ok",
  "service": "IT Helpdesk Backend",
  "timestamp": "2026-09-27T00:00:00.000Z"
}
```

## HTTP Status Umum

| Status | Arti |
|---:|---|
| 200 | Berhasil |
| 201 | Resource dibuat |
| 400 | Business rule/transisi invalid |
| 401 | Token tidak ada/invalid atau login gagal |
| 403 | Role atau ownership tidak sesuai |
| 404 | Resource tidak ditemukan |
| 422 | Validasi request gagal |
| 500 | Error server yang tidak tertangani |
