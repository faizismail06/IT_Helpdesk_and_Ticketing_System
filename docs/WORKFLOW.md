# Workflow dan RBAC

## Role

### Employee

- Membuat tiket untuk dirinya sendiri.
- Mengisi category, impact, urgency, subject, dan description.
- Melihat serta berkomentar pada tiket sendiri.
- Membaca Knowledge Base.
- Menutup atau membuka kembali tiket yang sudah resolved.
- Memberi satu rating pada tiket sendiri yang resolved/closed.

### Helpdesk

- Melihat seluruh antrean.
- Melakukan triage.
- Mengonfirmasi final priority.
- Menetapkan atau mengganti technician.
- Melihat dan menulis public reply maupun internal note.
- Mengakses report dan export Excel.

### Technician

- Melihat tiket yang ditugaskan kepadanya.
- Memulai pekerjaan, menunda, melanjutkan, dan menyelesaikan tiket.
- Menulis public reply dan internal note.
- Mencatat work time.
- Tidak dapat submit tiket, memberi rating, membuka Knowledge Base, atau report.

### Admin

- Melihat seluruh tiket dan membantu workflow operasional.
- Mengelola user, status akun, reset password, SLA rules, dan audit log.
- Mengakses report dan export Excel.
- Tidak submit tiket atau memberi rating.

## Matriks Akses

| Action | Employee | Helpdesk | Technician | Admin |
|---|:---:|:---:|:---:|:---:|
| Create ticket | Own | - | - | - |
| List ticket | Own | All | Assigned/own | All |
| View detail | Own | All | Current assignment/own | All |
| Assign technician | - | All active | - | All active |
| Confirm priority | - | During assignment | - | During assignment |
| Public comment | Own | All | Assigned | All |
| Internal note | - | All | Assigned | All |
| Start/resolve work | - | Allowed | Assigned | Allowed |
| Close/reopen | Own | Allowed | - | Allowed |
| Rate support | Own resolved/closed | - | - | - |
| Knowledge Base | Read | - | - | - |
| Reports | - | Read/export | - | Read/export |

UI menyembunyikan fitur yang tidak tersedia, tetapi backend tetap menjadi sumber authorization utama.

## Alur Utama

### 1. Submit

Employee mengirim:

```json
{
  "subject": "VPN tidak dapat terhubung",
  "description": "VPN gagal setelah pergantian password dan menampilkan timeout.",
  "categoryId": "uuid-category",
  "impact": "INDIVIDUAL",
  "urgency": "HIGH"
}
```

Backend membuat nomor tiket, menghitung suggested priority, mengambil SLA awal, menyimpan status `NEW`, dan memberi notifikasi ke Helpdesk room.

### 2. Priority Recommendation

| Impact / Urgency | LOW | MEDIUM | HIGH | CRITICAL |
|---|---|---|---|---|
| `INDIVIDUAL` | LOW | LOW | MEDIUM | HIGH |
| `TEAM` | LOW | MEDIUM | HIGH | HIGH |
| `DEPARTMENT` | MEDIUM | HIGH | HIGH | CRITICAL |
| `ORGANIZATION` | HIGH | HIGH | CRITICAL | CRITICAL |

Impact:

- `INDIVIDUAL`: satu user.
- `TEAM`: beberapa user atau satu tim.
- `DEPARTMENT`: satu departemen.
- `ORGANIZATION`: seluruh organisasi.

Urgency:

- `LOW`: pekerjaan tetap berjalan normal.
- `MEDIUM`: terganggu tetapi ada workaround.
- `HIGH`: pekerjaan utama terhenti.
- `CRITICAL`: layanan kritis atau keamanan terdampak.

### 3. Triage dan Assignment

Helpdesk memilih technician aktif dan final priority. Sistem:

1. Menghapus assignment aktif sebelumnya jika reassign.
2. Membuat assignment baru.
3. Menandai priority sudah direview.
4. Menghitung ulang SLA dari `createdAt` berdasarkan final priority.
5. Mengubah `NEW` menjadi `OPEN`.
6. Menulis TicketHistory.
7. Memberi notifikasi kepada technician.

Riwayat reassignment tetap tersedia di TicketHistory meskipun hanya satu assignment aktif disimpan.

### 4. Pengerjaan

Technician mengubah `OPEN -> IN_PROGRESS`. Work time dapat ditambahkan saat mulai atau resolve.

Jika membutuhkan input:

```text
IN_PROGRESS -> PENDING -> IN_PROGRESS
```

Internal note hanya terlihat staf IT. Backend tidak mengirim internal note dalam detail tiket Employee.

### 5. Resolusi

Technician mengubah tiket menjadi `RESOLVED`. Resolution reason wajib diisi. Requester mendapat notifikasi.

### 6. Konfirmasi Requester

```text
RESOLVED -> CLOSED
RESOLVED -> REOPENED -> IN_PROGRESS
```

Employee dapat memberi rating setelah `RESOLVED` atau `CLOSED`. Hanya satu rating per tiket.

Rating dan feedback dapat dilihat pada detail tiket oleh:

- Employee requester sebagai konfirmasi feedback yang dikirim.
- Technician yang sedang ditugaskan sebagai evaluasi layanan.
- Helpdesk dan Admin untuk quality control.

Rating tidak dapat dilihat user yang tidak memiliki akses ke detail tiket. Rekap rating juga tersedia pada dashboard Admin serta report Helpdesk/Admin.

## State Machine

| Current | Target yang diizinkan |
|---|---|
| `NEW` | `OPEN` |
| `OPEN` | `IN_PROGRESS`, `PENDING` |
| `IN_PROGRESS` | `PENDING`, `RESOLVED` |
| `PENDING` | `IN_PROGRESS`, `RESOLVED` |
| `RESOLVED` | `CLOSED`, `REOPENED` |
| `CLOSED` | `REOPENED` |
| `REOPENED` | `IN_PROGRESS` |
| `OVERDUE` | `IN_PROGRESS`, `RESOLVED` |

Role restriction diterapkan di atas state machine. Contohnya Technician tidak dapat melakukan `RESOLVED -> CLOSED` walaupun transisi tersebut valid untuk Employee/Helpdesk/Admin.

## SLA

| Priority | Default |
|---|---:|
| CRITICAL | 4 jam |
| HIGH | 8 jam |
| MEDIUM | 24 jam |
| LOW | 72 jam |

Deadline final dihitung dari waktu tiket dibuat, bukan waktu assignment. Triage yang terlambat tetap mengurangi waktu SLA yang tersisa.

## Komunikasi dan Notifikasi

- Ticket created: event ke room `role_helpdesk`.
- Assignment: notification tersimpan untuk technician.
- Status update: notification untuk requester dan event ke room detail tiket.
- Public staff reply: notification untuk requester.
- Internal note: tidak mengirim notification kepada requester.
- Client menginvalidasi cache notification, dashboard, ticket list, atau detail sesuai event.
