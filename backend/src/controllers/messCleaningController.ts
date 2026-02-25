import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getCleaningSchedules = async (req: Request, res: Response) => {
    try {
        const { room_id } = req.query;
        const where: any = {};
        if (room_id) where.room_id = Number(room_id);

        const data = await prisma.mess_cleaning_schedule.findMany({
            where,
            include: {
                room: {
                    include: { mess: true }
                }
            },
            orderBy: { tanggal_jadwal: 'desc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil jadwal kebersihan', error });
    }
};

export const createCleaningSchedule = async (req: Request, res: Response) => {
    try {
        const { room_id, tanggal_jadwal, catatan } = req.body;
        const data = await prisma.mess_cleaning_schedule.create({
            data: {
                room_id: Number(room_id),
                tanggal_jadwal: new Date(tanggal_jadwal),
                catatan,
                status: 'Terjadwal'
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat jadwal kebersihan', error });
    }
};

export const updateCleaningStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, catatan } = req.body;
        const data = await prisma.mess_cleaning_schedule.update({
            where: { id: Number(id) },
            data: { status, catatan }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui status kebersihan', error });
    }
};
