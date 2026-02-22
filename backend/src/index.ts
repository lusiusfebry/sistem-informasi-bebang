import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: "ok",
        message: "Bebang Sistem Informasi API"
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
