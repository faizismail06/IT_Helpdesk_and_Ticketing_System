# IT Helpdesk and Ticketing System

Aplikasi internal untuk menerima laporan masalah IT, melakukan triage, mendistribusikan tiket kepada teknisi, mencatat komunikasi dan waktu kerja, mengonfirmasi resolusi, serta mengekspor laporan operasional.

Project ini menggunakan frontend dan backend terpisah. Ini bukan Next.js.

## Dokumentasi

- [Workflow dan RBAC](docs/WORKFLOW.md)
- [Referensi REST API](docs/API.md)
- [Setup, testing, dan troubleshooting](docs/DEVELOPMENT.md)
- [Product Requirements Document](PRD.md)

## Fitur Utama

- Autentikasi JWT dengan role Employee, Helpdesk, Technician, dan Admin.
- Lifecycle tiket dengan transisi status yang divalidasi backend.
- Nomor tiket otomatis dengan format `IT-YYYY-XXXXXX`.
- Impact dan urgency diisi Employee; suggested priority dihitung sistem.
- Final priority, SLA, dan technician ditentukan Helpdesk saat triage.
- Public reply, internal IT note, history, dan work time.
- Notifikasi tersimpan dan pembaruan real-time melalui Socket.IO.
- Dashboard khusus setiap role.
- Knowledge Base untuk Employee dengan pencarian kontekstual; kontennya dikelola Admin.
- Attachment tiket tervalidasi dengan kontrol akses upload, download, dan delete.
- Employee dapat mengedit atau membatalkan tiket selama masih berstatus `NEW`.
- SLA overdue diperbarui otomatis oleh monitor backend.
- Rating 1-5 khusus requester Employee setelah resolved/closed.
- Rating terlihat pada detail bagi requester, assigned technician, Helpdesk, dan Admin yang memiliki akses tiket.
- Report Helpdesk/Admin dengan ekspor `.xlsx` sebagai Excel Table.
- Administrasi user, aturan SLA, dan audit log.

## Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, React Router, TanStack Query |
| UI/data | Tailwind CSS, Lucide, Recharts, React Hook Form, Zod, Axios |
| Excel | ExcelJS |
| Backend | Node.js, Express 4, TypeScript, Socket.IO |
| Data | PostgreSQL, Prisma ORM 6 |
| Security | JWT, bcryptjs, Helmet, CORS, rate limiter |
| Test | Jest, Supertest |

## Arsitektur

```text
Browser
  | HTTP/JSON + Socket.IO
  v
React + Vite (localhost:5175)
  |
  v
Express REST API (localhost:5002/api/v1)
  |
  v
Prisma ORM -> PostgreSQL (localhost:5432)
```

Backend:

```text
routes -> middleware -> controllers -> services -> Prisma -> PostgreSQL
```

Frontend:

```text
pages/components -> API modules -> Axios -> REST API
                 -> TanStack Query cache
                 -> Socket.IO invalidation
```

## Struktur Project

```text
IT_Helpdesk_and_Ticketing_System/
|-- backend/
|   |-- prisma/                 # schema, migration, seed
|   `-- src/
|       |-- controllers/
|       |-- middlewares/
|       |-- routes/
|       |-- services/
|       |-- socket/
|       |-- utils/
|       |-- validators/
|       `-- __tests__/
|-- frontend/
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- contexts/
|       |-- layouts/
|       |-- pages/
|       |-- routes/
|       `-- types/
|-- docs/
|-- docker-compose.yml
|-- PRD.md
`-- README.md
```

## Role dan Akses Ringkas

| Fitur | Employee | Helpdesk | Technician | Admin |
|---|:---:|:---:|:---:|:---:|
| Submit tiket | Ya | Tidak | Tidak | Tidak |
| Melihat tiket | Milik sendiri | Semua | Ditugaskan/milik sendiri | Semua |
| Triage dan assignment | Tidak | Ya | Tidak | Ya |
| Mengerjakan tiket | Tidak | Ya | Ditugaskan | Ya |
| Public reply | Tiket sendiri | Ya | Ditugaskan | Ya |
| Internal note | Tidak | Ya | Ditugaskan | Ya |
| Close/reopen | Tiket sendiri | Ya | Tidak | Ya |
| Rating | Tiket sendiri | Tidak | Tidak | Tidak |
| Knowledge Base | Baca | Tidak | Tidak | Tidak |
| Report dan Excel | Tidak | Ya | Tidak | Ya |
| Administrasi | Tidak | Tidak | Tidak | Ya |

Admin mengelola kategori dan artikel Knowledge Base melalui menu `Categories & Knowledge`.

Rincian lengkap terdapat di [docs/WORKFLOW.md](docs/WORKFLOW.md).

## Quick Start

### Prasyarat

- Node.js 18 atau lebih baru.
- npm.
- PostgreSQL 15 atau versi kompatibel.
- Database `it_helpdesk_db`.

### Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

Sesuaikan `backend/.env`:

```env
PORT=5002
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/it_helpdesk_db?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="http://localhost:5175"
FRONTEND_URL="http://localhost:5175"
MAX_FILE_SIZE=5242880
```

Backend tersedia di `http://localhost:5002`.

### Frontend

Buka terminal baru:

```powershell
cd frontend
npm install
npm run dev
```

Frontend tersedia di `http://localhost:5175`.

Konfigurasi frontend opsional (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5002/api/v1
VITE_SOCKET_URL=http://localhost:5002
```

## Akun Seed

| Role | Email | Password |
|---|---|---|
| Admin | `admin@company.com` | `Admin123!` |
| Helpdesk | `helpdesk@company.com` | `Helpdesk123!` |
| Technician | `technician.ahmad@company.com` | `Tech123!` |
| Technician | `technician.siti@company.com` | `Tech123!` |
| Employee | `budi.employee@company.com` | `User123!` |

Kredensial ini hanya untuk development/demo.

## Lifecycle Tiket

```text
Employee submit -> NEW
Helpdesk triage + priority + assignment -> OPEN
Technician mulai bekerja -> IN_PROGRESS
Menunggu input -> PENDING -> IN_PROGRESS
Technician mengirim solusi -> RESOLVED
Employee menerima solusi -> CLOSED
Employee menolak solusi -> REOPENED -> IN_PROGRESS
```

Employee tidak menentukan final priority. Employee mengisi `impact` dan `urgency`; sistem menghasilkan `suggestedPriority`. Helpdesk menerima atau mengubah rekomendasi saat assignment. SLA dihitung ulang dari waktu tiket dibuat menggunakan final priority.

## SLA Default

| Priority | Target resolusi |
|---|---:|
| `CRITICAL` | 4 jam |
| `HIGH` | 8 jam |
| `MEDIUM` | 24 jam |
| `LOW` | 72 jam |

Nilai dibuat oleh seed dan dapat diubah Admin.

## Script

### Backend

| Command | Fungsi |
|---|---|
| `npm run dev` | API dengan reload otomatis |
| `npm run build` | Compile TypeScript ke `dist/` |
| `npm start` | Menjalankan build production |
| `npm test` | Jest integration tests |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Migration development |
| `npm run seed` | Seed akun, kategori, SLA, dan artikel |

### Frontend

| Command | Fungsi |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check dan production build |
| `npm run preview` | Preview hasil build |

## Testing

Integration test mencakup login, RBAC negatif, submit, suggested priority, queue Helpdesk, triage, assignment, pembatasan technician, internal note, resolution, close, dan rating.

```powershell
cd backend
npm test
```

## Export Excel

Helpdesk dan Admin dapat mengekspor `.xlsx` asli yang berisi Excel Table `HelpdeskTickets`, header filter, frozen header, alternating rows, text wrapping, serta data impact, urgency, priority, SLA, work time, dan rating.

## Catatan Operasional

- Monitor SLA berjalan setiap 60 detik secara default; atur `SLA_CHECK_INTERVAL_MS` bila diperlukan.
- Report Excel dibuat di browser dan tidak disimpan server.
- Attachment disimpan di direktori lokal `backend/uploads`; production sebaiknya memakai object storage dan antivirus scanning.

## Keamanan

- Password di-hash dengan bcryptjs.
- Endpoint privat membutuhkan bearer token JWT.
- Authorization role diterapkan di backend dan route frontend.
- Internal notes difilter backend dari Employee.
- Technician hanya dapat mengakses tiket aktif yang ditugaskan kepadanya.
- Ganti JWT secret, password database, dan akun seed sebelum deployment.

## Troubleshooting Singkat

Port `5002` digunakan:

```powershell
Get-NetTCPConnection -LocalPort 5002 -State Listen
```

Prisma Client terkunci di Windows: hentikan backend sebelum menjalankan `npx prisma generate`.

Dashboard kosong: periksa backend, migration, seed, token, dan URL API frontend.

Panduan rinci terdapat di [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
