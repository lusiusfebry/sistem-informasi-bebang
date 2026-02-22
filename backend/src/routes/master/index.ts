import { Router } from 'express';
import divisiRoutes from './divisi';
import departmentRoutes from './department';
import posisiJabatanRoutes from './posisiJabatan';
import kategoriPangkatRoutes from './kategoriPangkat';
import golonganRoutes from './golongan';
import subGolonganRoutes from './subGolongan';
import jenisHubunganKerjaRoutes from './jenisHubunganKerja';
import tagRoutes from './tag';
import lokasiKerjaRoutes from './lokasiKerja';
import statusKaryawanRoutes from './statusKaryawan';

const router = Router();

router.use('/divisi', divisiRoutes);
router.use('/department', departmentRoutes);
router.use('/posisi-jabatan', posisiJabatanRoutes);
router.use('/kategori-pangkat', kategoriPangkatRoutes);
router.use('/golongan', golonganRoutes);
router.use('/sub-golongan', subGolonganRoutes);
router.use('/jenis-hubungan-kerja', jenisHubunganKerjaRoutes);
router.use('/tag', tagRoutes);
router.use('/lokasi-kerja', lokasiKerjaRoutes);
router.use('/status-karyawan', statusKaryawanRoutes);

export default router;
