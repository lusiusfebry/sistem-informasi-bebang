# Bebang Sistem Informasi - Project Context

## Project Overview

**Bebang Sistem Informasi** is an enterprise web application being implemented for PT Prima Sarana Gemilang, site Taliabu. The system serves as a central data service platform for employees, supporting 500+ users.

### Architecture
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Radix UI (shadcn/ui)
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
├── directives/       # (Empty - for future SOPs)
├── execution/        # (Empty - for future scripts)
└── .tmp/             # Temporary files (gitignored)
```

## Key Modules (Planned)

1. **Human Resources** (Primary focus - detailed spec in `planning/02_modul_hr_v2.md`)
2. Inventory
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

### Prerequisites
- Node.js v18 or newer
- PostgreSQL

### Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed initial data
npm run dev               # Development with nodemon (port 3000)
npm run build             # TypeScript compilation
npm run start             # Production start
npm run lint              # ESLint check
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev               # Vite development server (port 5173)
npm run build             # Production build
npm run lint              # ESLint check
npm run preview           # Preview production build
```

### Database Setup
**Database Credentials (Development):**
- User: `postgres`
- Password: `123456789`
- Database: `bebang-sistem-informasi`
- Connection string stored in `backend/.env` as `DATABASE_URL`

## Development Conventions

### Language
- **Application UI/UX**: Indonesian (Bahasa Indonesia)
- **Code comments and documentation**: English
- **No hardcoded/mock data**: All data from database (seed data allowed for development)

### Code Style
- **TypeScript** for both frontend and backend
- **Strict typing** enforced
- **ESLint** configured for both frontend and backend
- Use **shadcn/ui** components for UI consistency

### Project Organization
- Separate `frontend/` and `backend/` folders
- Modules organized in separate folders within `planning/`
- Support for QR Code generation (from `nomor_induk_karyawan`)
- File upload support for photos and documents (`backend/uploads/`)

### Key Requirements
- Employee ID format: `xx-xxxxx`
- Password managed by Access Management module (seed data for dev: `admin` / `admin123`)
- UI must be professional, clean, modern
- Support for 500+ concurrent employees
- QR Code support
- File upload support for photos and documents

## HR Module Details

### Master Data Entities
All master data use auto-generated codes (e.g., `div-xxxx` for divisions) that cannot be changed after generation:

| Entity | Code Format | Description |
|--------|-------------|-------------|
| Divisi | `div-xxxx` | Division |
| Department | `dep-xxxx` | Department |
| Posisi Jabatan | `pos-xxxx` | Position |
| Kategori Pangkat | `kpk-xxxx` | Rank Category |
| Golongan | `gol-x` | Group |
| Sub Golongan | `sgol-xx` | Sub Group |
| Jenis Hubungan Kerja | `jhk-xxxx` | Employment Type |
| Tag | `tag-xxx` | Tag with color |
| Lokasi Kerja | `lok-xxxx` | Work Location |
| Status Karyawan | `stk-xxxx` | Employee Status |

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
| `backend/src/index.ts` | Express server entry point |
| `frontend/src/App.tsx` | Main React application |
| `backend/prisma/seed.ts` | Database seed data |

## Environment Variables

### Backend (.env)
```env
PORT=3000
DATABASE_URL="postgresql://postgres:123456789@localhost:5432/bebang-sistem-informasi"
JWT_SECRET=bebang_jwt_secret_key_2024
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
- Default admin credentials (development): `admin` / `admin` or `00-00001` / `admin123`

## Database Schema Overview

The Prisma schema (`backend/prisma/schema.prisma`) defines the following main entities:

### Core HR Tables
- `karyawan` - Main employee table
- `karyawan_personal` - Personal information
- `karyawan_hr` - HR-specific information
- `karyawan_keluarga` - Family information
- `karyawan_anak` - Children (repeatable)
- `karyawan_saudara` - Siblings (repeatable)
- `karyawan_dokumen` - Employee documents
- `karyawan_tag` - Employee tags (many-to-many)

### Master Data Tables
- `divisi`, `department`, `posisi_jabatan`
- `kategori_pangkat`, `golongan`, `sub_golongan`
- `jenis_hubungan_kerja`, `tag`, `lokasi_kerja`, `status_karyawan`

### Other Tables
- `users` - User authentication
- `mess`, `mess_room` - Mess/accommodation management

## API Routes

| Route | Description |
|-------|-------------|
| `/api/auth` | Authentication endpoints |
| `/api/master` | Master data CRUD operations |
| `/api/karyawan` | Employee management |
| `/api/users` | User management |
| `/api/mess` | Mess management |
| `/api/health` | Health check endpoint |
| `/uploads` | Static file serving |

## Frontend Pages

| Path | Component |
|------|-----------|
| `/login` | LoginPage |
| `/welcome` | WelcomePage |
| `/hr` | HRDashboard |
| `/hr/master/*` | Master data pages |
| `/hr/karyawan` | Employee directory |
| `/hr/karyawan/:id` | Employee profile |
| `/hr/users` | User management |
| `/hr/mess` | Mess management |

## General Rules

1. **Language**: Application uses Indonesian; documentation uses English
2. **No Mock Data**: All data must come from database (seed allowed for dev)
3. **Lint-Free**: Ensure 100% free from lint errors before commit
4. **TypeScript**: Strict typing enforced throughout the project
5. **UI Components**: Use shadcn/ui components for consistency
6. **File Organization**: Keep frontend and backend separate; organize by module
