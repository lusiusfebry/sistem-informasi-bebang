import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { generateCode, ensureUniqueCode } from '../../utils/codeGenerator';

const PREFIX = 'div';

export const getAll = async (req: Request, res: Response) => {
    const { search, page = 1, limit = 10 } = req.query;
    const p = Number(page);
    const l = Number(limit);

    try {
        const where = search ? {
            nama: { contains: String(search), mode: 'insensitive' as const }
        } : {};

        const [data, total] = await Promise.all([
            prisma.divisi.findMany({
                where,
                skip: (p - 1) * l,
                take: l,
                orderBy: { nama: 'asc' }
            }),
            prisma.divisi.count({ where })
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
        const data = await prisma.divisi.findMany({
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
        const data = await prisma.divisi.findUnique({
            where: { id: Number(id) }
        });
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        return res.json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const create = async (req: Request, res: Response) => {
    const { nama, keterangan, status } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama wajib diisi' });

    try {
        const baseCode = generateCode(PREFIX, nama);
        const code = await ensureUniqueCode(baseCode, async (c) => {
            const existing = await prisma.divisi.findUnique({ where: { code: c } });
            return !existing;
        });

        const data = await prisma.divisi.create({
            data: { code, nama, keterangan, status }
        });
        return res.status(201).json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat data' });
    }
};

export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, keterangan, status } = req.body;

    try {
        const data = await prisma.divisi.update({
            where: { id: Number(id) },
            data: { nama, keterangan, status }
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
        await prisma.divisi.delete({
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
