# Bebang Sistem Informasi

Sistem Informasi Terintegrasi untuk pengelolaan data dan operasional.

## 🏗️ Struktur Proyek

Proyek ini dibagi menjadi dua bagian utama:
- `frontend/`: Antarmuka pengguna berbasis React dan Vite.
- `backend/`: Server API berbasis Express dan Prisma ORM.

## 🚀 Teknologi yang Digunakan

### Frontend
- **Framework**: React 18 dengan Vite
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Routing**: React Router Dom
- **HTTP Client**: Axios

### Backend
- **Framework**: Express.js
- **Bahasa**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Environment**: dotenv, CORS

## 🛠️ Cara Memulai

### Prasyarat
- Node.js (v18 atau lebih baru)
- PostgreSQL

### Inisialisasi

1. Clone repositori ini.
2. Setup Backend:
   ```bash
   cd backend
   npm install
   # Sesuaikan DATABASE_URL di file .env
   # Jalankan migrasi prisma (setelah schema didefinisikan)
   # npx prisma migrate dev
   ```
3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   ```

### Menjalankan Aplikasi

1. Jalankan Backend (dari folder `backend`):
   ```bash
   npm run dev
   ```
2. Jalankan Frontend (dari folder `frontend`):
   ```bash
   npm run dev
   ```

## 📝 Catatan Pengembangan
- Gunakan standar penulisan kode TypeScript yang ketat.
- Komponen UI baru harus ditambahkan melalui shadcn CLI jika memungkinkan.
- Pastikan aplikasi bebas dari error lint sebelum melakukan commit.
