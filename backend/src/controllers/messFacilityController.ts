import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllFacilities = async (req: Request, res: Response) => {
    try {
        const data = await prisma.mess_facility.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data fasilitas', error });
    }
};

export const createFacility = async (req: Request, res: Response) => {
    try {
        const { nama, keterangan } = req.body;
        const data = await prisma.mess_facility.create({
            data: { nama, keterangan }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat fasilitas', error });
    }
};

export const updateFacility = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, keterangan } = req.body;
        const data = await prisma.mess_facility.update({
            where: { id: Number(id) },
            data: { nama, keterangan }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui fasilitas', error });
    }
};

export const deleteFacility = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.mess_facility.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Fasilitas berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus fasilitas', error });
    }
};

export const assignFacilityToRoom = async (req: Request, res: Response) => {
    try {
        const { room_id, facility_id } = req.body;
        const data = await prisma.mess_facility_on_room.create({
            data: { room_id: Number(room_id), facility_id: Number(facility_id) }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan fasilitas ke kamar', error });
    }
};

export const removeFacilityFromRoom = async (req: Request, res: Response) => {
    try {
        const { room_id, facility_id } = req.body;
        await prisma.mess_facility_on_room.delete({
            where: {
                room_id_facility_id: {
                    room_id: Number(room_id),
                    facility_id: Number(facility_id)
                }
            }
        });
        res.json({ message: 'Fasilitas berhasil dihapus dari kamar' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus fasilitas dari kamar', error });
    }
};
