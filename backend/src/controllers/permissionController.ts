import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.permissions.findMany({
            include: { group: true },
            orderBy: [{ module: 'asc' }, { feature: 'asc' }, { action: 'asc' }]
        });
        res.json(permissions);
    } catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ message: 'Gagal mengambil data permission' });
    }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
        const groups = await prisma.permission_group.findMany({
            include: { permissions: true }
        });
        res.json(groups);
    } catch (error) {
        console.error('Get permission groups error:', error);
        res.status(500).json({ message: 'Gagal mengambil data group permission' });
    }
};
