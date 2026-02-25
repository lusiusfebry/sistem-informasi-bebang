import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllDamageReports = async (req: Request, res: Response) => {
    try {
        const { status, room_id } = req.query;
        const where: any = {};
        if (status) where.status = String(status);
        if (room_id) where.room_id = Number(room_id);

        const data = await prisma.mess_damage_report.findMany({
            where,
            include: {
                room: {
                    include: { mess: true }
                }
            },
            orderBy: { tanggal_laporan: 'desc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil laporan kerusakan', error });
    }
};

export const createDamageReport = async (req: Request, res: Response) => {
    try {
        const { room_id, kategori, deskripsi, foto_kerusakan } = req.body;
        const data = await prisma.mess_damage_report.create({
            data: {
                room_id: Number(room_id),
                kategori,
                deskripsi,
                foto_kerusakan,
                status: 'Dilaporkan'
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat laporan kerusakan', error });
    }
};

export const updateDamageReportStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const data = await prisma.mess_damage_report.update({
            where: { id: Number(id) },
            data: {
                status,
                tanggal_selesai: status === 'Selesai' ? new Date() : null
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui status laporan', error });
    }
};

export const deleteDamageReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mess_damage_report.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Laporan kerusakan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus laporan kerusakan', error });
    }
};
