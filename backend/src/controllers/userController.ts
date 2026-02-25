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
                },
                roles: {
                    include: {
                        role: {
                            select: { id: true, nama: true }
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
        const { nik, password, nama, roleIds } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { nik }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'NIK sudah digunakan oleh akun lain' });
        }

        const karyawan = await prisma.karyawan.findUnique({
            where: { nomor_induk_karyawan: nik }
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: {
                nik,
                nama: nama || (karyawan ? karyawan.nama_lengkap : 'User'),
                password: hashedPassword,
                karyawan_id: karyawan ? karyawan.id : null,
                roles: {
                    create: (roleIds || []).map((id: number) => ({
                        role: { connect: { id } }
                    }))
                }
            },
            include: { roles: true }
        });

        // Audit Log
        await prisma.security_audit_log.create({
            data: {
                user_id: (req as any).user?.id,
                action: 'USER_CREATE',
                resource: `User:${newUser.id}`,
                details: { nik: newUser.nik, roles: roleIds }
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
        const { nama, roleIds, password } = req.body;

        const updateData: any = {
            nama,
            updated_at: new Date()
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update roles if provided
        if (roleIds) {
            updateData.roles = {
                deleteMany: {}, // Remove all current roles
                create: roleIds.map((rid: number) => ({
                    role: { connect: { id: rid } }
                }))
            };
        }

        const updatedUser = await prisma.users.update({
            where: { id: Number(id) },
            data: updateData,
            include: { roles: true }
        });

        // Audit Log
        await prisma.security_audit_log.create({
            data: {
                user_id: (req as any).user?.id,
                action: 'USER_UPDATE',
                resource: `User:${id}`,
                details: { roles_updated: !!roleIds }
            }
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

        // Prevent self-deletion
        if (Number(id) === (req as any).user?.id) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri' });
        }

        const deletedUser = await prisma.users.delete({
            where: { id: Number(id) }
        });

        // Audit Log
        await prisma.security_audit_log.create({
            data: {
                user_id: (req as any).user?.id,
                action: 'USER_DELETE',
                resource: `User:${id}`,
                details: { nik: deletedUser.nik }
            }
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
