import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllMess = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where = search ? {
            OR: [
                { nama: { contains: String(search), mode: 'insensitive' as const } },
                { code: { contains: String(search), mode: 'insensitive' as const } },
                { lokasi: { contains: String(search), mode: 'insensitive' as const } }
            ]
        } : {};

        const data = await prisma.mess.findMany({
            where,
            include: {
                _count: {
                    select: { rooms: true }
                }
            },
            orderBy: { nama: 'asc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data mess', error });
    }
};

export const createMess = async (req: Request, res: Response) => {
    try {
        const { code, nama, lokasi, keterangan, status } = req.body;
        const data = await prisma.mess.create({
            data: { code, nama, lokasi, keterangan, status }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat mess', error });
    }
};

export const updateMess = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, nama, lokasi, keterangan, status } = req.body;
        const data = await prisma.mess.update({
            where: { id: Number(id) },
            data: { code, nama, lokasi, keterangan, status }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui mess', error });
    }
};

export const deleteMess = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mess.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Mess berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus mess', error });
    }
};

// ROOMS
export const getRoomsByMess = async (req: Request, res: Response) => {
    try {
        const { messId } = req.params;
        const data = await prisma.mess_room.findMany({
            where: { mess_id: Number(messId) },
            include: {
                penghuni: {
                    select: {
                        id: true,
                        nama_lengkap: true,
                        nomor_induk_karyawan: true,
                        foto_karyawan: true
                    }
                }
            },
            orderBy: { nomor_kamar: 'asc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data kamar', error });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const { messId } = req.params;
        const { nomor_kamar, kapasitas, fasilitas, status } = req.body;
        const data = await prisma.mess_room.create({
            data: {
                mess_id: Number(messId),
                nomor_kamar,
                kapasitas: Number(kapasitas),
                fasilitas,
                status
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat kamar', error });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nomor_kamar, kapasitas, fasilitas, status } = req.body;
        const data = await prisma.mess_room.update({
            where: { id: Number(id) },
            data: {
                nomor_kamar,
                kapasitas: Number(kapasitas),
                fasilitas,
                status
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui kamar', error });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mess_room.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Kamar berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus kamar', error });
    }
};

// ASSIGNMENT
export const assignKaryawan = async (req: Request, res: Response) => {
    try {
        const { roomId, karyawanId } = req.body;

        // Check capacity
        const room = await prisma.mess_room.findUnique({
            where: { id: Number(roomId) },
            include: {
                _count: {
                    select: { penghuni: true }
                }
            }
        });

        if (!room) return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        if (room._count.penghuni >= room.kapasitas) {
            return res.status(400).json({ message: 'Kamar sudah penuh' });
        }

        const data = await prisma.karyawan.update({
            where: { id: Number(karyawanId) },
            data: { mess_room_id: Number(roomId) }
        });

        res.json({ message: 'Karyawan berhasil ditempatkan', data });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menempatkan karyawan', error });
    }
};

export const unassignKaryawan = async (req: Request, res: Response) => {
    try {
        const { karyawanId } = req.body;
        const data = await prisma.karyawan.update({
            where: { id: Number(karyawanId) },
            data: { mess_room_id: null }
        });
        res.json({ message: 'Karyawan berhasil dikeluarkan dari mess', data });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengeluarkan karyawan', error });
    }
};
