import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { generateCode, ensureUniqueCode } from '../../utils/codeGenerator';

const PREFIX = 'dep';

export const getAll = async (req: Request, res: Response) => {
    const { search, page = 1, limit = 10 } = req.query;
    const p = Number(page);
    const l = Number(limit);

    try {
        const where = search ? {
            nama: { contains: String(search), mode: 'insensitive' as const }
        } : {};

        const [data, total] = await Promise.all([
            prisma.department.findMany({
                where,
                include: {
                    divisi: { select: { nama: true } }
                },
                skip: (p - 1) * l,
                take: l,
                orderBy: { nama: 'asc' }
            }),
            prisma.department.count({ where })
        ]);

        return res.json({
            data,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const getAktif = async (req: Request, res: Response) => {
    try {
        const data = await prisma.department.findMany({
            where: { status: 'Aktif' },
            orderBy: { nama: 'asc' }
        });
        return res.json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const data = await prisma.department.findUnique({
            where: { id: Number(id) },
            include: {
                divisi: { select: { nama: true } }
            }
        });
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        return res.json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const create = async (req: Request, res: Response) => {
    const { nama, divisi_id, manager_id, keterangan, status } = req.body;
    if (!nama || !divisi_id) return res.status(400).json({ message: 'Nama dan Divisi wajib diisi' });

    try {
        const baseCode = generateCode(PREFIX, nama);
        const code = await ensureUniqueCode(baseCode, async (c) => {
            const existing = await prisma.department.findUnique({ where: { code: c } });
            return !existing;
        });

        const data = await prisma.department.create({
            data: { code, nama, divisi_id: Number(divisi_id), manager_id: manager_id ? Number(manager_id) : null, keterangan, status }
        });
        return res.status(201).json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat data' });
    }
};

export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, divisi_id, manager_id, keterangan, status } = req.body;

    try {
        const data = await prisma.department.update({
            where: { id: Number(id) },
            data: {
                nama,
                divisi_id: divisi_id ? Number(divisi_id) : undefined,
                manager_id: manager_id !== undefined ? (manager_id ? Number(manager_id) : null) : undefined,
                keterangan,
                status
            }
        });
        return res.json(data);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data' });
    }
};

export const remove = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.department.delete({
            where: { id: Number(id) }
        });
        return res.json({ message: 'Data berhasil dihapus' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ message: 'Data tidak dapat dihapus karena masih digunakan oleh data lain' });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data' });
    }
};
