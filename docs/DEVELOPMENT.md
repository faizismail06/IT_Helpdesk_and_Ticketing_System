# Development Guide

## Port Lokal

| Service | Port |
|---|---:|
| Frontend Vite | 5175 |
| Backend Express/Socket.IO | 5002 |
| PostgreSQL | 5432 |

## Environment Backend

Salin `.env.example` menjadi `.env` di folder backend.

| Variable | Wajib | Keterangan |
|---|:---:|---|
| `PORT` | Tidak | Default `5002` |
| `DATABASE_URL` | Ya | PostgreSQL connection string |
| `JWT_SECRET` | Ya | Secret penandatanganan JWT |
| `JWT_EXPIRES_IN` | Tidak | Default `24h` |
| `CORS_ORIGIN` | Tidak | Default `http://localhost:5175` |
| `FRONTEND_URL` | Tidak | Default `http://localhost:5175` |
| `MAX_FILE_SIZE` | Tidak | Default 5 MB |

## Environment Frontend

Frontend dapat berjalan tanpa `.env` menggunakan fallback lokal.

| Variable | Default |
|---|---|
| `VITE_API_URL` | `http://localhost:5002/api/v1` |
| `VITE_SOCKET_URL` | `http://localhost:5002` |

## Database Setup

Development baru:

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Saat mengubah schema:

```powershell
npx prisma migrate dev --name descriptive_migration_name
npx prisma generate
```

Jangan mengedit migration yang sudah diterapkan. Buat migration baru.

## Menjalankan Project

Terminal backend:

```powershell
cd backend
npm run dev
```

Terminal frontend:

```powershell
cd frontend
npm run dev
```

Urutan login untuk menguji lifecycle:

1. Login Employee dan submit tiket.
2. Login Helpdesk dan assign final priority serta technician.
3. Login Technician dan proses sampai resolved.
4. Login Employee dan close/reopen serta rating.

Role switcher demo sengaja tidak tersedia. Gunakan logout dan login dengan akun role lain.

## Build

```powershell
cd backend
npm run build

cd ..\frontend
npm run build
```

Output backend berada di `backend/dist`. Output frontend berada di `frontend/dist`.

## Test

```powershell
cd backend
npm test
```

Test menggunakan database dari `DATABASE_URL`. Test lifecycle membuat data sementara lalu menghapus ticket dan notification terkait setelah selesai. Jalankan migrasi dan seed sebelum test.

## Prisma di Windows

Prisma generate dapat gagal dengan `EPERM ... query_engine-windows.dll.node` jika backend masih memakai engine tersebut.

1. Hentikan `npm run dev` backend.
2. Pastikan port `5002` tidak listening.
3. Jalankan `npx prisma generate`.
4. Jalankan backend kembali.

Pemeriksaan port:

```powershell
Get-NetTCPConnection -LocalPort 5002 -State Listen
```

## EADDRINUSE

Error berarti ada proses lain pada port yang sama.

```powershell
$connection = Get-NetTCPConnection -LocalPort 5002 -State Listen
Get-Process -Id $connection.OwningProcess
```

Hentikan hanya proses backend yang benar, lalu jalankan ulang. Jangan menghentikan semua proses Node secara massal bila project lain sedang aktif.

## Error Database

### `P1001` atau connection refused

- Pastikan PostgreSQL hidup.
- Periksa host, port, user, password, dan database pada `DATABASE_URL`.
- Jika memakai Docker, gunakan hostname service `postgres` dari container backend, bukan `localhost`.

### Table/column tidak ditemukan

```powershell
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
```

## Dashboard Nol atau Request 403

- Periksa Network tab browser.
- Pastikan role akun sesuai route.
- Logout/login ulang bila token berasal dari role lain.
- Pastikan frontend mengarah ke API `5002`.
- Pastikan migration dan seed selesai.

Dashboard menampilkan error API secara eksplisit; nilai nol hanya berarti query berhasil dan memang tidak ada data.

## Export Excel

Export dilakukan client-side dengan dynamic import ExcelJS. Paket ExcelJS dimuat ketika tombol export ditekan, lalu browser mengunduh `.xlsx`.

Jika file tidak terunduh:

- Pastikan report memiliki minimal satu record.
- Izinkan download dari `localhost` di browser.
- Periksa error JavaScript pada DevTools.
- Jangan mengganti ekstensi file secara manual menjadi `.csv`.

## Socket.IO

Socket menggunakan JWT yang sama dengan REST API dan bergabung ke:

- `user_<userId>`
- `role_<role-name-lowercase>`
- `ticket_<ticketId>` ketika detail ticket diikuti client

REST authorization tetap wajib. Socket digunakan untuk notifikasi dan cache invalidation, bukan sebagai sumber data utama.

## Docker Compose

```powershell
docker compose up --build
```

Compose menyediakan PostgreSQL, backend, dan frontend. Catatan:

- Frontend container dipetakan ke host port `80`, berbeda dengan Vite development `5175`.
- CORS backend pada compose saat ini menggunakan `http://localhost:5175`; sesuaikan menjadi origin frontend deployment jika menjalankan seluruh stack melalui container.
- Jalankan migration/seed terhadap database container sesuai kebutuhan deployment.

## Checklist Sebelum Commit

```powershell
cd backend
npm test
npm run build

cd ..\frontend
npm run build
```

Periksa juga:

- Tidak ada `.env` yang ter-stage.
- Migration baru ikut ter-stage bila schema berubah.
- Menu frontend dan backend authorization memiliki role yang sama.
- Dokumentasi endpoint diperbarui jika route/payload berubah.
- Tidak ada data dashboard hard-coded.

## Known Limitations

- Belum ada test frontend otomatis.
- Belum ada scheduled overdue worker.
- Attachment belum end-to-end.
- Knowledge Base management belum tersedia.
- Belum ada refresh token/revocation store; logout terutama membersihkan token client.
- Bundle utama dan chunk ExcelJS masih besar dan menghasilkan Vite chunk-size warning.
