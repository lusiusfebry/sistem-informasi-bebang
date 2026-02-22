import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import masterRouter from './routes/master/index';
import path from 'path';
import karyawanRouter from './routes/karyawan';

dotenv.config();

import { isJwtSecretValid } from './config/jwt';

if (!isJwtSecretValid) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/master', masterRouter);
app.use('/api/karyawan', karyawanRouter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
    res.json({
        status: "ok",
        message: "Bebang Sistem Informasi API"
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
