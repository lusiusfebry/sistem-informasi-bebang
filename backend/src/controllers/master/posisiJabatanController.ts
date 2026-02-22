import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { generateCode, ensureUniqueCode } from '../../utils/codeGenerator';

const PREFIX = 'pjb';

export const getAll = async (req: Request, res: Response) => {
    const { search } = req.query;
    try {
        const data = await prisma.posisi_jabatan.findMany({
            where: search ? {
                nama: { contains: String(search), mode: 'insensitive' }
            } : {},
            include: {
                department: {
                    select: {
                        nama: true,
                        divisi: { select: { nama: true } }
                    }
                }
            },
            orderBy: { nama: 'asc' }
        });
        return res.json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const getAktif = async (req: Request, res: Response) => {
    try {
        const data = await prisma.posisi_jabatan.findMany({
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
        const data = await prisma.posisi_jabatan.findUnique({
            where: { id: Number(id) },
            include: {
                department: {
                    select: {
                        nama: true,
                        divisi: { select: { nama: true } }
                    }
                }
            }
        });
        if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
        return res.json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data' });
    }
};

export const create = async (req: Request, res: Response) => {
    const { nama, department_id, keterangan, status } = req.body;
    if (!nama || !department_id) return res.status(400).json({ message: 'Nama dan Departemen wajib diisi' });

    try {
        const baseCode = generateCode(PREFIX, nama);
        const code = await ensureUniqueCode(baseCode, async (c) => {
            const existing = await prisma.posisi_jabatan.findUnique({ where: { code: c } });
            return !existing;
        });

        const data = await prisma.posisi_jabatan.create({
            data: { code, nama, department_id: Number(department_id), keterangan, status }
        });
        return res.status(201).json(data);
    } catch {
        return res.status(500).json({ message: 'Terjadi kesalahan saat membuat data' });
    }
};

export const update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, department_id, keterangan, status } = req.body;

    try {
        const data = await prisma.posisi_jabatan.update({
            where: { id: Number(id) },
            data: {
                nama,
                department_id: department_id ? Number(department_id) : undefined,
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
        await prisma.posisi_jabatan.delete({
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
