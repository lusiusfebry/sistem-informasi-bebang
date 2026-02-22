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

## General Rules 1

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- Basically just SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution. E.g you don't try scraping websites yourself—you read `directives/scrape_website.md` and come up with inputs/outputs and then run `execution/scrape_single_site.py`

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Environment variables, api tokens, etc are stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## File Organization

**Deliverables vs Intermediates:**
- **Deliverables**: Google Sheets, Google Slides, or other cloud-based outputs that the user can access
- **Intermediates**: Temporary files needed during processing

**Directory structure:**
- `.tmp/` - All intermediate files (dossiers, scraped data, temp exports). Never commit, always regenerated.
- `execution/` - Python scripts (the deterministic tools)
- `directives/` - SOPs in Markdown (the instruction set)
- `.env` - Environment variables and API keys
- `credentials.json`, `token.json` - Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.

## General rules 2
1. aplikasi ini menggunakan bahasa indonesia
2. dokumentasi menggunakan bahasa indonesia
3. setelah selesai menyelesaikan task, cek error script atau lint error. dan pastikan aplikasi ini 100% free lint error dan script error