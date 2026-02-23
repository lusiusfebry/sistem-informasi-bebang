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

        // 5. Generate Token
        const token = jwt.sign(
            {
                id: user.id,
                nik: user.nik,
                nama: user.nama,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 6. Return Response
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                nik: user.nik,
                nama: user.nama,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};
