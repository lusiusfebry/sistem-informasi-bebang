import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        const where: any = {};
        if (search) {
            where.OR = [
                { nik: { contains: String(search), mode: 'insensitive' } },
                { nama: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const users = await prisma.users.findMany({
            where,
            include: {
                karyawan: {
                    select: {
                        nama_lengkap: true,
                        nomor_induk_karyawan: true,
                        foto_karyawan: true,
                        posisi_jabatan: {
                            select: { nama: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.json(users);
    } catch (error) {
        console.error('Get all users error', error);
        res.status(500).json({ message: 'Terjadi kesalahan sistem' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const { nik, password, nama, role } = req.body;

        // Cek apakah NIK sudah digunakan
        const existingUser = await prisma.users.findUnique({
            where: { nik }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'NIK sudah digunakan oleh akun lain' });
        }

        // Cari karyawan_id berdasarkan NIK (sinkronisasi otomatis)
        const karyawan = await prisma.karyawan.findUnique({
            where: { nomor_induk_karyawan: nik }
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: {
                nik,
                nama: nama || (karyawan ? karyawan.nama_lengkap : 'User'),
                password: hashedPassword,
                role: role || 'user',
                karyawan_id: karyawan ? karyawan.id : null
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error', error);
        res.status(500).json({ message: 'Gagal membuat user' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, role, password } = req.body;

        const updateData: any = {
            nama,
            role,
            updated_at: new Date()
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.users.update({
            where: { id: Number(id) },
            data: updateData
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update user error', error);
        res.status(500).json({ message: 'Gagal memperbarui user' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Jangan biarkan admin menghapus dirinya sendiri
        // (Bisa ditambahkan pengecekan req.user.id jika perlu)

        await prisma.users.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error('Delete user error', error);
        res.status(500).json({ message: 'Gagal menghapus user' });
    }
};

export const sync = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.users.findUnique({
            where: { id: Number(id) }
        });

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const karyawan = await prisma.karyawan.findUnique({
            where: { nomor_induk_karyawan: user.nik }
        });

        if (!karyawan) {
            return res.status(400).json({ message: 'Karyawan dengan NIK tersebut tidak ditemukan' });
        }

        const updatedUser = await prisma.users.update({
            where: { id: Number(id) },
            data: {
                karyawan_id: karyawan.id,
                nama: karyawan.nama_lengkap
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Sync user error', error);
        res.status(500).json({ message: 'Gagal sinkronisasi user' });
    }
};
