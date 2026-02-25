import { Router } from 'express';
import * as karyawanController from '../controllers/karyawanController';
import * as onboardingController from '../controllers/onboardingController';
import * as offboardingController from '../controllers/offboardingController';
import { authMiddleware } from '../middleware/auth';
import { uploadFoto, uploadExcel, uploadDokumen } from '../middleware/upload';

const router = Router();

// Semua route karyawan memerlukan autentikasi
router.use(authMiddleware);

router.get('/', karyawanController.getAll);
router.get('/stats', karyawanController.getDashboardStats);
router.post('/import', uploadExcel.single('file'), karyawanController.importExcel);
router.post('/preview', uploadExcel.single('file'), karyawanController.previewImport);
router.get('/export', karyawanController.exportExcel);
router.get('/template', karyawanController.downloadTemplate);
router.post('/', karyawanController.create);
router.get('/:id', karyawanController.getById);
router.put('/:id', karyawanController.update);
router.post('/:id/foto', uploadFoto.single('foto'), karyawanController.uploadFoto);
router.get('/:id/qrcode', karyawanController.getQrCode);
router.delete('/:id', karyawanController.remove);

// Dokumen Karyawan
router.post('/:id/dokumen', uploadDokumen.single('file'), karyawanController.uploadDokumen);
router.delete('/dokumen/:docId', karyawanController.deleteDokumen);

// Onboarding & Offboarding
router.get('/onboarding/list', onboardingController.getOnboardingList);
router.get('/onboarding/checklist/:id', onboardingController.getEmployeeChecklist);
router.put('/onboarding/checklist/:id/toggle', onboardingController.updateChecklistItem);
router.post('/onboarding/init/:id', onboardingController.initOnboarding);
router.post('/onboarding/finalize/:id', onboardingController.finalizeOnboarding);

router.get('/offboarding/list', offboardingController.getOffboardingList);
router.post('/offboarding/init/:id', offboardingController.initOffboarding);
router.post('/offboarding/finalize/:id', offboardingController.finalizeOffboarding);

export default router;
