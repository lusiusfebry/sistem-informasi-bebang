import { Router } from 'express';
import * as karyawanController from '../controllers/karyawanController';
import { authMiddleware } from '../middleware/auth';
import { uploadFoto, uploadExcel, uploadDokumen } from '../middleware/upload';

const router = Router();

// Semua route karyawan memerlukan autentikasi
router.use(authMiddleware);

router.get('/', karyawanController.getAll);
router.get('/stats', karyawanController.getDashboardStats);
router.post('/import', uploadExcel.single('file'), karyawanController.importExcel);
router.get('/export', karyawanController.exportExcel);
router.post('/', karyawanController.create);
router.get('/:id', karyawanController.getById);
router.put('/:id', karyawanController.update);
router.post('/:id/foto', uploadFoto.single('foto'), karyawanController.uploadFoto);
router.get('/:id/qrcode', karyawanController.getQrCode);

// Dokumen Karyawan
router.post('/:id/dokumen', uploadDokumen.single('file'), karyawanController.uploadDokumen);
router.delete('/dokumen/:docId', karyawanController.deleteDokumen);

export default router;
