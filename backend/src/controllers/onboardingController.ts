import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getOnboardingList = async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const p = Number(page);
        const l = Number(limit);

        const where: any = {
            status_proses: 'Onboarding'
        };

        if (search) {
            where.OR = [
                { nama_lengkap: { contains: String(search), mode: 'insensitive' } },
                { nomor_induk_karyawan: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const [data, total] = await Promise.all([
            prisma.karyawan.findMany({
                where,
                include: {
                    divisi: true,
                    department: true,
                    posisi_jabatan: true,
                    _count: {
                        select: {
                            checklists: true
                        }
                    },
                    checklists: {
                        where: { is_selesai: true },
                        select: { id: true }
                    }
                },
                skip: (p - 1) * l,
                take: l,
                orderBy: { created_at: 'desc' }
            }),
            prisma.karyawan.count({ where })
        ]);

        // Calculate progress percentage
        const result = data.map(k => {
            const totalChecklist = k._count.checklists;
            const completedChecklist = k.checklists.length;
            const progress = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

            return {
                ...k,
                progress
            };
        });

        return res.json({
            data: result,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil list onboarding' });
    }
};

export const getEmployeeChecklist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const checklists = await prisma.karyawan_checklist.findMany({
            where: { karyawan_id: Number(id) },
            include: { template: true },
            orderBy: { template: { urutan: 'asc' } }
        });

        return res.json(checklists);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil checklist' });
    }
};

export const toggleChecklistItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // karyawan_checklist.id

        const current = await prisma.karyawan_checklist.findUnique({
            where: { id: Number(id) }
        });

        if (!current) return res.status(404).json({ message: 'Item checklist tidak ditemukan' });

        const is_selesai = !current.is_selesai;

        const result = await prisma.karyawan_checklist.update({
            where: { id: Number(id) },
            data: {
                is_selesai,
                tanggal_selesai: is_selesai ? new Date() : null,
                user_pemeriksa_id: req.user?.id
            }
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat toggle item checklist' });
    }
};

export const updateChecklistItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // karyawan_checklist.id
        const { is_selesai, catatan } = req.body;

        const result = await prisma.karyawan_checklist.update({
            where: { id: Number(id) },
            data: {
                is_selesai,
                catatan,
                tanggal_selesai: is_selesai ? new Date() : null,
                user_pemeriksa_id: req.user?.id // Assuming req.user is populated by auth middleware
            }
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat update item checklist' });
    }
};

export const initOnboarding = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // karyawan_id

        // Check if already has checklist
        const existing = await prisma.karyawan_checklist.count({
            where: { karyawan_id: Number(id) }
        });

        if (existing > 0) {
            return res.status(400).json({ message: 'Onboarding sudah diinisialisasi' });
        }

        // Get templates
        const templates = await prisma.checklist_template.findMany({
            where: { kategori: 'Onboarding' },
            orderBy: { urutan: 'asc' }
        });

        // Create checklist items
        await prisma.karyawan_checklist.createMany({
            data: templates.map(t => ({
                karyawan_id: Number(id),
                template_id: t.id,
                is_selesai: false
            }))
        });

        // Ensure status_proses is Onboarding
        await prisma.karyawan.update({
            where: { id: Number(id) },
            data: { status_proses: 'Onboarding' }
        });

        return res.json({ message: 'Onboarding berhasil diinisialisasi' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat inisialisasi onboarding' });
    }
};

export const finalizeOnboarding = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // karyawan_id

        // Check if all mandatory checklists are completed (optional strict rule)
        const incompleteWajib = await prisma.karyawan_checklist.count({
            where: {
                karyawan_id: Number(id),
                is_selesai: false,
                template: { is_wajib: true }
            }
        });

        if (incompleteWajib > 0) {
            return res.status(400).json({ message: `Masih ada ${incompleteWajib} tugas wajib yang belum selesai` });
        }

        await prisma.karyawan.update({
            where: { id: Number(id) },
            data: { status_proses: 'Aktif' }
        });

        return res.json({ message: 'Onboarding selesai, status karyawan kini Aktif' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat finalisasi onboarding' });
    }
};
