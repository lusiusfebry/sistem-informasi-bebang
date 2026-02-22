# Bebang Sistem Informasi - Project Context

## Project Overview

**Bebang Sistem Informasi** is an enterprise web application being implemented for PT Prima Sarana Gemilang, site Taliabu. The system serves as a central data service platform for employees, supporting 500+ users.

### Architecture
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Radix UI
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Design**: Modern, professional UI with Indonesian language support

### Project Structure
```
sistem-informasi-bebang/
├── backend/          # Express.js API server with Prisma
├── frontend/         # React + TypeScript + Vite SPA
├── planning/         # Requirements and module specifications
├── desain-ui-ux/     # UI/UX design variants and mockups
├── directives/       # (Empty - for future directives)
├── execution/        # (Empty - for future execution docs)
└── .tmp/             # Temporary files (gitignored)
```

## Key Modules (Planned)

1. **Human Resources** (Primary focus - detailed spec in `planning/02_modul_hr_v2.md`)
2. Inventory (spec in `.qwen/skills/03_modul_inventory.md`)
3. Mess Management
4. Building Management
5. User Access Right Management

### User Flow
```
Login Page → Welcome Page → Module Selection
```
- Login uses employee ID format: `xx-xxxxx` (e.g., `02-03827`)
- Welcome page provides shortcuts to modules
- Professional, clean, modern UI in Indonesian

## Building and Running

### Backend
```bash
cd backend
npm install
npm run dev        # Development with nodemon
npm run build      # TypeScript compilation
npm run start      # Production start
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite development server
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

### Database Setup
```bash
cd backend
npx prisma migrate dev    # Run migrations
npx prisma studio         # Open Prisma Studio
```

**Database Credentials (Development):**
- User: `postgres`
- Password: `123456789`
- Connection string stored in `backend/.env` as `DATABASE_URL`

## Development Conventions

### Language
- Application UI/UX: **Indonesian (Bahasa Indonesia)**
- Code comments and documentation: **English**
- No hardcoded/mock data allowed (use seed data for development)

### Code Style
- **TypeScript** for both frontend and backend
- **ESLint** configured for frontend
- Strict typing enforced

### Project Organization
- Separate frontend/backend folders
- Modules organized in separate folders
- No static/hardcoded data - all data from database
- Support for QR Code generation, file uploads, photo/document handling

### Key Requirements
- Employee ID format: `xx-xxxxx`
- Password managed by Access Management module (seed data for dev)
- UI must be professional, clean, modern
- Support for 500+ concurrent employees
- QR Code support (generated from `nomor_induk_karyawan`)
- File upload support for photos and documents

## HR Module Details

### Master Data Entities
- Divisi (Division) - auto-generated code: `div-xxxx`
- Department
- Posisi Jabatan (Position)
- Kategori Pangkat (Rank Category)
- Golongan / Sub Golongan
- Jenis Hubungan Kerja
- Tag (with color)
- Lokasi Kerja
- Status Karyawan

### Employee Profile Sections
1. **Head Section**: Photo, NIK, Division, Department, Position, Contact
2. **Personal Information**: Biodata, ID, Address, Contact, Marriage, Bank
3. **Informasi HR**: Employment, Contract, Education, Rank, Emergency Contact
4. **Informasi Keluarga**: Spouse, Children, Siblings, Parents-in-law

### Data Import
- Excel import supported via mapping (see `planning/08_relasi_dengan_sheet_excel.md`)
- Reference file: `BMI.xlsx` for column mapping

## Important Files

| File | Purpose |
|------|---------|
| `planning/01_rencana_sistem.md` | System overview and requirements |
| `planning/02_modul_hr_v2.md` | HR module detailed specification |
| `planning/08_relasi_dengan_sheet_excel.md` | Excel data mapping |
| `backend/prisma/schema.prisma` | Database schema |
| `backend/prisma.config.ts` | Prisma configuration |
| `frontend/src/App.tsx` | Main React application |

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:123456789@localhost:5432/bebang_db"
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Git Ignore Patterns
- `.env` files (frontend & backend)
- `node_modules/`
- `dist/`, `build/`
- `backend/uploads/`
- `.tmp/`
- `credentials.json`, `token.json`

## Design Assets
UI/UX design variants located in `desain-ui-ux/`:
- `login-page-welcome-page/` - Login and dashboard variants
- `master-data/` - Master data screen designs
- `profil-karyawan/` - Employee profile designs

## Notes
- All master data entities use auto-generated codes (e.g., `div-xxxx` for divisions)
- Codes include abbreviations and cannot be changed after generation
- Search functionality required for dropdown/selection fields
- Family information sections are repeatable based on counts
