import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


import { autoSaveProfile } from './controllers/profile.controller';
app.post('/api/profile/autosave', autoSaveProfile);

app.get('/', (req, res) => {
    res.json({ message: "CV Management API работает!" });
});

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});