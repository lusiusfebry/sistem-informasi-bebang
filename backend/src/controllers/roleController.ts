import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.roles.findMany({
            include: {
                permissions: {
                    include: { permission: true }
                },
                _count: {
                    select: { users: true }
                }
            }
        });
        res.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ message: 'Gagal mengambil data role' });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const { nama, deskripsi, permissionIds } = req.body;

        const role = await prisma.roles.create({
            data: {
                nama,
                deskripsi,
                permissions: {
                    create: (permissionIds || []).map((id: number) => ({
                        permission: { connect: { id } }
                    }))
                }
            },
            include: { permissions: true }
        });

        await prisma.security_audit_log.create({
            data: {
                user_id: (req as any).user?.id,
                action: 'ROLE_CREATE',
                resource: `Role:${role.id}`,
                details: { nama, permissionCount: permissionIds?.length }
            }
        });

        res.status(201).json(role);
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({ message: 'Gagal membuat role' });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, deskripsi, status, permissionIds } = req.body;

        const role = await prisma.roles.update({
            where: { id: Number(id) },
            data: {
                nama,
                deskripsi,
                status,
                permissions: permissionIds ? {
                    deleteMany: {},
                    create: permissionIds.map((pid: number) => ({
                        permission: { connect: { id: pid } }
                    }))
                } : undefined
            },
            include: { permissions: true }
        });

        await prisma.security_audit_log.create({
            data: {
                user_id: (req as any).user?.id,
                action: 'ROLE_UPDATE',
                resource: `Role:${id}`,
                details: { nama, status, permissionsUpdated: !!permissionIds }
            }
        });

        res.json(role);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Gagal memperbarui role' });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if role is in use
        const userCount = await prisma.user_roles.count({ where: { role_id: Number(id) } });
        if (userCount > 0) {
            return res.status(400).json({ message: 'Role tidak dapat dihapus karena masih digunakan oleh user' });
        }

        const deletedRole = await prisma.roles.delete({
            where: { id: Number(id) }
        });

        await prisma.security_audit_log.create({
            data: {
                user_id: (req as any).user?.id,
                action: 'ROLE_DELETE',
                resource: `Role:${id}`,
                details: { nama: deletedRole.nama }
            }
        });

        res.json({ message: 'Role berhasil dihapus' });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({ message: 'Gagal menghapus role' });
    }
};
