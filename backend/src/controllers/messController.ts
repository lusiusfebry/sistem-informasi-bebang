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
                lokasi_kerja: true,
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
        const { code, nama, lokasi_kerja_id, blok, lantai, keterangan, status } = req.body;
        const data = await prisma.mess.create({
            data: {
                code,
                nama,
                lokasi_kerja_id: lokasi_kerja_id ? Number(lokasi_kerja_id) : null,
                blok,
                lantai,
                keterangan,
                status
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat mess', error });
    }
};

export const updateMess = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, nama, lokasi_kerja_id, blok, lantai, keterangan, status } = req.body;
        const data = await prisma.mess.update({
            where: { id: Number(id) },
            data: {
                code,
                nama,
                lokasi_kerja_id: lokasi_kerja_id ? Number(lokasi_kerja_id) : null,
                blok,
                lantai,
                keterangan,
                status
            }
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
export const getAllRooms = async (_req: Request, res: Response) => {
    try {
        const data = await prisma.mess_room.findMany({
            include: {
                mess: true,
                penghuni: {
                    select: { id: true, nama_lengkap: true }
                }
            }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil seluruh data kamar', error });
    }
};

export const getRoomsByMess = async (req: Request, res: Response) => {
    try {
        const { messId } = req.params;
        const data = await prisma.mess_room.findMany({
            where: { mess_id: Number(messId) },
            include: {
                facilities: {
                    include: { facility: true }
                },
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
        const { nomor_kamar, kapasitas, tipe, status } = req.body;
        const data = await prisma.mess_room.create({
            data: {
                mess_id: Number(messId),
                nomor_kamar,
                kapasitas: Number(kapasitas),
                tipe,
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
        const { nomor_kamar, kapasitas, tipe, status } = req.body;
        const data = await prisma.mess_room.update({
            where: { id: Number(id) },
            data: {
                nomor_kamar,
                kapasitas: Number(kapasitas),
                tipe,
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
        const { roomId, karyawanId, tanggal_masuk, keterangan } = req.body;

        const room = await prisma.mess_room.findUnique({
            where: { id: Number(roomId) },
            include: {
                _count: { select: { penghuni: true } }
            }
        });

        if (!room) return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        if (room._count.penghuni >= room.kapasitas) {
            return res.status(400).json({ message: 'Kamar sudah penuh' });
        }

        // Use transaction to ensure data consistency
        const result = await prisma.$transaction([
            // Update current occupant
            prisma.karyawan.update({
                where: { id: Number(karyawanId) },
                data: { mess_room_id: Number(roomId) }
            }),
            // Create assignment record
            prisma.mess_assignment.create({
                data: {
                    room_id: Number(roomId),
                    karyawan_id: Number(karyawanId),
                    tanggal_masuk: tanggal_masuk ? new Date(tanggal_masuk) : new Date(),
                    keterangan,
                    status: 'Aktif'
                }
            })
        ]);

        res.json({ message: 'Karyawan berhasil ditempatkan', data: result[0] });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menempatkan karyawan', error });
    }
};

export const unassignKaryawan = async (req: Request, res: Response) => {
    try {
        const { karyawanId, tanggal_keluar } = req.body;

        // Use transaction
        await prisma.$transaction([
            // Clear current room
            prisma.karyawan.update({
                where: { id: Number(karyawanId) },
                data: { mess_room_id: null }
            }),
            // Close active assignment
            prisma.mess_assignment.updateMany({
                where: {
                    karyawan_id: Number(karyawanId),
                    status: 'Aktif'
                },
                data: {
                    tanggal_keluar: tanggal_keluar ? new Date(tanggal_keluar) : new Date(),
                    status: 'Selesai'
                }
            })
        ]);

        res.json({ message: 'Karyawan berhasil dikeluarkan dari mess' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengeluarkan karyawan', error });
    }
};

// HISTORY
export const getAssignmentHistory = async (req: Request, res: Response) => {
    try {
        const { room_id, karyawan_id } = req.query;
        const where: any = {};
        if (room_id) where.room_id = Number(room_id);
        if (karyawan_id) where.karyawan_id = Number(karyawan_id);

        const data = await prisma.mess_assignment.findMany({
            where,
            include: {
                room: {
                    include: { mess: true }
                },
                karyawan: {
                    select: { nama_lengkap: true, nomor_induk_karyawan: true }
                }
            },
            orderBy: { tanggal_masuk: 'desc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil riwayat penempatan', error });
    }
};
