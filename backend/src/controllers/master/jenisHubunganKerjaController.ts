import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { generateCode, ensureUniqueCode } from '../../utils/codeGenerator';

const PREFIX = 'jhk';

export const getAll = async (req: Request, res: Response) => {
    const { search } = req.query;
    try {
        const data = await prisma.jenis_hubungan_kerja.findMany({
            where: search ? {
                nama: { contains: String(search), mode: 'insensitive' }
            } : {},
            orderBy: { nama: 'asc' }
        });
        return res.json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const getAktif = async (req: Request, res: Response) => {
    try {
        const data = await prisma.jenis_hubungan_kerja.findMany({
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
        const data = await prisma.jenis_hubungan_kerja.findUnique({
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
            const existing = await prisma.jenis_hubungan_kerja.findUnique({ where: { code: c } });
            return !existing;
        });

        const data = await prisma.jenis_hubungan_kerja.create({
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
        const data = await prisma.jenis_hubungan_kerja.update({
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
        await prisma.jenis_hubungan_kerja.delete({
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
