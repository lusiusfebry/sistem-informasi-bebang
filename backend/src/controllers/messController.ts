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
        const { nomor_kamar, kapasitas, tipe, status, facility_ids } = req.body;
        const data = await prisma.mess_room.create({
            data: {
                mess_id: Number(messId),
                nomor_kamar,
                kapasitas: Number(kapasitas),
                tipe,
                status,
                facilities: facility_ids && Array.isArray(facility_ids) ? {
                    create: facility_ids.map((fid: number) => ({ facility_id: fid }))
                } : undefined
            },
            include: {
                facilities: { include: { facility: true } }
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
        const { nomor_kamar, kapasitas, tipe, status, facility_ids } = req.body;

        // Use transaction to update room and facilities
        const data = await prisma.$transaction(async (tx) => {
            // Update room basic info
            await tx.mess_room.update({
                where: { id: Number(id) },
                data: {
                    nomor_kamar,
                    kapasitas: Number(kapasitas),
                    tipe,
                    status
                }
            });

            // If facility_ids is provided, update facilities
            if (facility_ids && Array.isArray(facility_ids)) {
                // Delete existing facilities
                await tx.mess_facility_on_room.deleteMany({
                    where: { room_id: Number(id) }
                });

                // Create new facilities
                if (facility_ids.length > 0) {
                    await tx.mess_facility_on_room.createMany({
                        data: facility_ids.map((fid: number) => ({
                            room_id: Number(id),
                            facility_id: fid
                        }))
                    });
                }
            }

            return tx.mess_room.findUnique({
                where: { id: Number(id) },
                include: {
                    facilities: { include: { facility: true } }
                }
            });
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
        const result = await prisma.$transaction(async (tx) => {
            // 1. Close active assignment if exists
            await tx.mess_assignment.updateMany({
                where: {
                    karyawan_id: Number(karyawanId),
                    status: 'Aktif'
                },
                data: {
                    tanggal_keluar: tanggal_masuk ? new Date(tanggal_masuk) : new Date(),
                    status: 'Selesai'
                }
            });

            // 2. Update current room in karyawan record
            const updatedKaryawan = await tx.karyawan.update({
                where: { id: Number(karyawanId) },
                data: { mess_room_id: Number(roomId) }
            });

            // 3. Create new assignment record
            await tx.mess_assignment.create({
                data: {
                    room_id: Number(roomId),
                    karyawan_id: Number(karyawanId),
                    tanggal_masuk: tanggal_masuk ? new Date(tanggal_masuk) : new Date(),
                    keterangan,
                    status: 'Aktif'
                }
            });

            return updatedKaryawan;
        });

        res.json({ message: 'Karyawan berhasil ditempatkan', data: result });
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
        const { room_id, karyawan_id, status } = req.query;
        const where: any = {};
        if (room_id) where.room_id = Number(room_id);
        if (karyawan_id) where.karyawan_id = Number(karyawan_id);
        if (status) where.status = String(status);

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

export const getCurrentResidents = async (req: Request, res: Response) => {
    try {
        const { search, mess_id } = req.query;
        const where: any = {
            mess_room_id: { not: null }
        };

        if (mess_id) {
            where.mess_room = { mess_id: Number(mess_id) };
        }

        if (search) {
            where.OR = [
                { nama_lengkap: { contains: String(search), mode: 'insensitive' as const } },
                { nomor_induk_karyawan: { contains: String(search), mode: 'insensitive' as const } },
                { mess_room: { nomor_kamar: { contains: String(search), mode: 'insensitive' as const } } }
            ];
        }

        const data = await prisma.karyawan.findMany({
            where,
            include: {
                mess_room: {
                    include: { mess: true }
                }
            },
            orderBy: { nama_lengkap: 'asc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data penghuni saat ini', error });
    }
};

// REPORTS
export const getOccupancyReport = async (req: Request, res: Response) => {
    try {
        const messList = await prisma.mess.findMany({
            include: {
                rooms: {
                    include: {
                        _count: { select: { penghuni: true } }
                    }
                }
            }
        });

        const report = messList.map(m => {
            const totalCapacity = m.rooms.reduce((acc, r) => acc + r.kapasitas, 0);
            const currentOccupants = m.rooms.reduce((acc, r) => acc + r._count.penghuni, 0);
            const totalRooms = m.rooms.length;
            const fullRooms = m.rooms.filter(r => r._count.penghuni >= r.kapasitas).length;
            const availableRooms = m.rooms.filter(r => r.status === 'Tersedia' && r._count.penghuni < r.kapasitas).length;

            return {
                id: m.id,
                nama: m.nama,
                totalCapacity,
                currentOccupants,
                occupancyRate: totalCapacity > 0 ? (currentOccupants / totalCapacity) * 100 : 0,
                totalRooms,
                fullRooms,
                availableRooms
            };
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil laporan okupansi', error });
    }
};

export const getMaintenanceReport = async (req: Request, res: Response) => {
    try {
        const damageReports = await prisma.mess_damage_report.findMany({
            include: {
                room: {
                    include: { mess: true }
                }
            },
            orderBy: { tanggal_laporan: 'desc' }
        });

        const stats = {
            total: damageReports.length,
            dilaporkan: damageReports.filter(r => r.status === 'Dilaporkan').length,
            proses: damageReports.filter(r => r.status === 'Proses').length,
            selesai: damageReports.filter(r => r.status === 'Selesai').length,
        };

        res.json({ stats, details: damageReports });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil laporan pemeliharaan', error });
    }
};
