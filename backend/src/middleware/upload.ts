import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan folder uploads/foto/ ada
const fotoDir = 'uploads/foto/';
if (!fs.existsSync(fotoDir)) {
    fs.mkdirSync(fotoDir, { recursive: true });
}

// Pastikan folder uploads/dokumen/ ada
const dokumenDir = 'uploads/dokumen/';
if (!fs.existsSync(dokumenDir)) {
    fs.mkdirSync(dokumenDir, { recursive: true });
}

// Storage untuk Foto Karyawan
const fotoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, fotoDir);
    },
    filename: (req, _file, cb) => {
        // id dari params (jika update) atau 'temp'
        const id = req.params.id || 'temp';
        const ext = path.extname(_file.originalname);
        cb(null, `${id}-${Date.now()}${ext}`);
    }
});

// Storage untuk Excel Import (Memory Storage)
const excelStorage = multer.memoryStorage();

// Middleware upload foto
export const uploadFoto = multer({
    storage: fotoStorage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan!'));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Middleware upload excel
export const uploadExcel = multer({
    storage: excelStorage,
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file .xlsx yang diperbolehkan!'));
        }
    }
});

// Middleware upload dokumen (PDF, Docx, Images)
const dokumenStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, dokumenDir);
    },
    filename: (req, _file, cb) => {
        const id = req.params.id || 'temp';
        const ext = path.extname(_file.originalname);
        cb(null, `doc-${id}-${Date.now()}${ext}`);
    }
});

export const uploadDokumen = multer({
    storage: dokumenStorage,
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung (Gunakan PDF, Word, atau Gambar)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
