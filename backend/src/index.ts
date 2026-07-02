import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;


export const prisma = new PrismaClient({
    __internal: {
        configOverride: () => ({
            datasource: {
                url: process.env.DATABASE_URL,
            },
        }),
    },
} as any);

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