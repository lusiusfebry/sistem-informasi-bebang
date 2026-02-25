import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getOffboardingList = async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const p = Number(page);
        const l = Number(limit);

        const where: any = {
            status_proses: 'Offboarding'
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
                orderBy: { updated_at: 'desc' }
            }),
            prisma.karyawan.count({ where })
        ]);

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
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil list offboarding' });
    }
};

export const initOffboarding = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // karyawan_id

        // Check if already offboarding
        const karyawan = await prisma.karyawan.findUnique({
            where: { id: Number(id) }
        });

        if (!karyawan) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
        if (karyawan.status_proses === 'Offboarding') {
            return res.status(400).json({ message: 'Karyawan sudah dalam proses offboarding' });
        }

        // Get templates
        const templates = await prisma.checklist_template.findMany({
            where: { kategori: 'Offboarding' },
            orderBy: { urutan: 'asc' }
        });

        await prisma.$transaction([
            // Delete old checklists if any (e.g. from onboarding) or keep them?
            // Usually, we keep history. So we just add new ones for offboarding.
            prisma.karyawan_checklist.createMany({
                data: templates.map(t => ({
                    karyawan_id: Number(id),
                    template_id: t.id,
                    is_selesai: false
                }))
            }),
            prisma.karyawan.update({
                where: { id: Number(id) },
                data: { status_proses: 'Offboarding' }
            })
        ]);

        return res.json({ message: 'Offboarding berhasil diinisialisasi' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat inisialisasi offboarding' });
    }
};

export const finalizeOffboarding = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // karyawan_id

        const karyawan = await prisma.karyawan.findUnique({
            where: { id: Number(id) },
            include: { users: true }
        });

        if (!karyawan) return res.status(404).json({ message: 'Karyawan tidak ditemukan' });

        await prisma.$transaction(async (tx) => {
            // 1. Update status karyawan
            await tx.karyawan.update({
                where: { id: Number(id) },
                data: {
                    status_proses: 'Selesai',
                    mess_room_id: null // Otomatis kosongkan mess
                }
            });

            // 2. Deaktivasi user accounts
            if (karyawan.users.length > 0) {
                await tx.users.updateMany({
                    where: { karyawan_id: Number(id) },
                    data: { role: 'inactive' } // Assuming inactive role exists or handled by frontend/auth
                });
            }

            // 3. Mark HR stop date if not set
            await tx.karyawan_hr.updateMany({
                where: { karyawan_id: Number(id), tanggal_berhenti: null },
                data: { tanggal_berhenti: new Date() }
            });
        });

        return res.json({ message: 'Offboarding selesai. Akses dicabut dan fasilitas mess dibebaskan.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat finalisasi offboarding' });
    }
};
