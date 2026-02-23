import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, isJwtSecretValid } from '../config/jwt';

interface JwtPayload {
    id: number;
    nik: string;
    nama: string;
    role: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    if (!isJwtSecretValid) {
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).user = decoded; // force sync
        next();
    } catch {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }
};
