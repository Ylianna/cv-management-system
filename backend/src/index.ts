import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { autoSaveProfile } from './controllers/profile.controller';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "CV Management API работает!" });
});

app.post('/api/profile/autosave', autoSaveProfile);

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});