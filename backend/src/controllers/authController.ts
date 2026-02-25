import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { JWT_SECRET, isJwtSecretValid } from '../config/jwt';

export const login = async (req: Request, res: Response) => {
    const { nik, password } = req.body;

    // 1. Validasi Input
    if (!nik || !password) {
        return res.status(400).json({ message: 'NIK dan password wajib diisi' });
    }

    // 2. Validasi Format NIK (xx-xxxxx atau admin)
    const nikRegex = /^(\d{2}-\d{5}|admin)$/;
    if (!nikRegex.test(nik)) {
        return res.status(400).json({ message: 'Format NIK tidak valid (contoh: 01-00001 atau admin)' });
    }

    if (!isJwtSecretValid) {
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is missing' });
    }

    try {
        // 3. Cari User
        const user = await prisma.users.findUnique({
            where: { nik },
        });

        if (!user) {
            return res.status(401).json({ message: 'NIK atau password salah' });
        }

        // 4. Verifikasi Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'NIK atau password salah' });
        }

        // 5. Fetch Roles and Permissions
        const userWithDetails = await prisma.users.findUnique({
            where: { id: user.id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const roles = userWithDetails?.roles.map(ur => ur.role.nama) || [];
        const permissions = userWithDetails?.roles.flatMap(ur =>
            ur.role.permissions.map(rp => ({
                module: rp.permission.module,
                feature: rp.permission.feature,
                action: rp.permission.action,
                field: rp.permission.field
            }))
        ) || [];

        // 6. Generate Token
        const token = jwt.sign(
            {
                id: user.id,
                nik: user.nik,
                nama: user.nama,
                roles,
                permissions,
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 7. Audit Log
        await prisma.security_audit_log.create({
            data: {
                user_id: user.id,
                action: 'LOGIN',
                details: { ip: req.ip }
            }
        });

        // 8. Return Response
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                nik: user.nik,
                nama: user.nama,
                roles,
                permissions,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};
