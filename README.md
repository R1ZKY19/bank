# Professional Bank Management System V2.0

Aplikasi Dashboard Manajemen Data Bank Enterprise dengan tampilan modern bergaya SaaS (Stripe, Vercel, Linear, Notion, Supabase).
100% GRATIS tanpa biaya langganan, menggunakan **GitHub Pages** sebagai Frontend, **Google Apps Script** sebagai Backend REST API, dan **Google Sheets** sebagai Database.

---

## 🌟 Fitur Utama

- **SaaS Modern UI/UX**: Design system Glassmorphism, Dark Mode & Light Mode toggle, Soft Shadows, Rounded 16px, Skeleton Loading, Chart Visualizations, dan responsive layout.
- **Role-Based Access Control (RBAC)**:
  - **LEADER**: Akses penuh (CRUD, Manage User, Import, Export, Audit Log, Setup).
  - **KAPTEN**: Tambah, Edit, Approve, Export, Audit Log.
  - **CS**: Tambah, Edit umum, Catatan, Upload Screenshot.
  - **KASIR**: View Data, Copy Rekening/HP, Update Status & Catatan.
- **Keamanan & Validasi Backend**:
  - Enkripsi password menggunakan **SHA-256**.
  - Token-based Session Authentication dengan **Auto Logout 30 Menit**.
  - Verifikasi hak akses langsung di Google Apps Script.
- **Data Table Canggih**:
  - Realtime Search & Multi-Filter (Bank, Group, Status).
  - Server-side Pagination (`LIMIT` 50, 100, 200).
  - Sticky Table Header & Sticky First Column.
  - Slide-over Drawer untuk Detail Rekening & Quick Copy.
  - Popup Modal Input dengan auto-validation.
- **Export & Import**:
  - Export ke Excel (.xlsx) dengan **SheetJS**, CSV, Print & PDF.
  - Bulk Import dari file Excel / CSV dengan Preview Data.
- **Audit Activity Log**: Mencatat seluruh aktivitas user (Login, Logout, Add, Edit, Delete, Import, Export).

---

## 📁 Struktur Folder Project

```text
/
├── index.html            # Landing / Redirect Handler
├── login.html            # halaman Login Modern
├── dashboard.html        # Dashboard Utama Single Page Application (SPA)
├── Code.gs               # Backend Google Apps Script (REST API RESTful)
├── README.md             # Panduan Instalasi & Dokumentasi
└── assets/
    ├── css/
    │   └── styles.css    # Modern Styling System (Glassmorphism & Themes)
    └── js/
        ├── config.js     # Konfigurasi Global & URL API
        ├── api.js        # REST API Wrapper Fetch Handler
        ├── auth.js       # Autentikasi, Session & Auto Logout Timer
        ├── export.js     # Export Excel/CSV/Print Engine
        └── dashboard.js  # Dashboard Interactivity, Charts, Drawer & Modals
```

---

## 🚀 Panduan Instalasi Lengkap

### Langkah 1: Setup Database Google Sheets & Backend Apps Script

1. Buka [Google Sheets](https://sheets.google.com) dan buat Spreadsheet Baru. Beri nama **"Database Bank Admin V2"**.
2. Klik menu **Ekstensi (Extensions)** -> **Apps Script**.
3. Hapus seluruh isi file `Kode.gs`, lalu salin seluruh kode dari file **`Code.gs`** di project ini dan paste ke dalam editor Apps Script.
4. Simpan project (ctrl+s).
5. Pada menu fungsi teratas, pilih fungsi `setupDatabase` lalu klik tombol **Jalankan (Run)**.
   - Izinkan otorisasi akses spreadsheet jika diminta.
   - Fungsi ini otomatis membuat 10 Sheet yang diperlukan (`USERS`, `ROLE`, `BANK`, `ACTIVITY_LOG`, `LOGIN_LOG`, `SETTING`, `MASTER_BANK`, `MASTER_GROUP`, `MASTER_STATUS`, `BACKUP`) beserta header dan akun default!

### Langkah 2: Deploy Web App Google Apps Script

1. Di editor Apps Script, klik tombol **Terapkan (Deploy)** -> **Penerapan baru (New deployment)**.
2. Pilih jenis penerapan: **Aplikasi Web (Web App)**.
3. Isikan konfigurasi berikut:
   - **Deskripsi**: `Bank Management API V2.0`
   - **Jalankan sebagai (Execute as)**: `Saya (Me)`
   - **Siapa yang memiliki akses (Who has access)**: `Siapa saja (Anyone)` *(Sangat penting agar Frontend dari GitHub Pages dapat mengakses API)*.
4. Klik **Terapkan (Deploy)** dan berikan izin otorisasi.
5. Salin **URL Aplikasi Web (Web App URL)** yang dihasilkan (berawalan `https://script.google.com/macros/s/.../exec`).

### Langkah 3: Konfigurasi Frontend & Deploy ke GitHub Pages

1. Buka file `assets/js/config.js` atau tempelkan URL API di popup Pengaturan pada aplikasi.
2. Push seluruh folder project ini ke repository **GitHub** Anda.
3. Buka repository di GitHub -> **Settings** -> **Pages**.
4. Pilih Source **`Deploy from a branch`**, pilih branch **`main`** / **`root`**, lalu klik **Save**.
5. Aplikasi Anda kini live 100% GRATIS di URL GitHub Pages Anda (misal: `https://username.github.io/repository/`).

---

## 🔑 Akun Default & Credentials

Setelah menjalankan `setupDatabase`, akun berikut otomatis dibuat:

| Username | Password | Role | Hak Akses |
| :--- | :--- | :--- | :--- |
| **leader** | `admin123` | **LEADER** | Akses Penuh (CRUD, User, Log, Backup, Import, Export) |
| **kapten** | `kapten123` | **KAPTEN** | Add, Edit, Approve, Export, Log |
| **cs_staff** | `cs123456` | **CS** | Add, Edit Umum, Catatan, Upload Screenshot |
| **kasir_staff** | `kasir123` | **KASIR** | View Data, Copy Rekening/HP, Update Status/Catatan |

---

## 📷 Cloudinary / Drive Integration untuk Screenshot

Untuk fitur screenshot bukti transfer/rekening:
- Unggah file gambar ke **Cloudinary Free** atau **Google Drive (Public Link)**.
- Salin URL gambar dan paste ke kolom **URL Screenshot** pada modal form.
- Gambar otomatis ditampilkan secara estetik pada slide-over Drawer Detail Rekening.

---

## 🛡️ Fitur Keamanan Included

1. **Anti Direct Sheet Access**: Frontend sama sekali tidak menyimpan API Key Google Sheets. Seluruh transaksi melewati Apps Script middleware.
2. **SHA-256 Hashing**: Password pengguna disimpan dalam bentuk hash SHA-256 yang tidak dapat dibalikkan.
3. **Server-Side RBAC**: Pengecekan role tidak hanya di UI JavaScript, melainkan diotentikasi ulang di Google Apps Script pada setiap request.
4. **Auto Expire Session**: Sesi login otomatis hangus jika tidak ada aktivitas pengguna dalam 30 menit.
