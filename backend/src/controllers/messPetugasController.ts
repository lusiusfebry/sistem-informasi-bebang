import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllPetugas = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where = search ? {
            OR: [
                { karyawan: { nama_lengkap: { contains: String(search), mode: 'insensitive' as const } } },
                { mess: { nama: { contains: String(search), mode: 'insensitive' as const } } }
            ]
        } : {};

        const data = await prisma.mess_petugas.findMany({
            where,
            include: {
                mess: { select: { nama: true } },
                karyawan: { select: { nama_lengkap: true, nomor_induk_karyawan: true } }
            },
            orderBy: { id: 'desc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data petugas', error });
    }
};

export const createPetugas = async (req: Request, res: Response) => {
    try {
        const { mess_id, karyawan_id, shift } = req.body;
        const data = await prisma.mess_petugas.create({
            data: {
                mess_id: Number(mess_id),
                karyawan_id: Number(karyawan_id),
                shift
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan petugas', error });
    }
};

export const updatePetugas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { mess_id, karyawan_id, shift } = req.body;
        const data = await prisma.mess_petugas.update({
            where: { id: Number(id) },
            data: {
                mess_id: Number(mess_id),
                karyawan_id: Number(karyawan_id),
                shift
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui data petugas', error });
    }
};

export const deletePetugas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mess_petugas.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Petugas berhasil dihapus dari penugasan' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus petugas', error });
    }
};
