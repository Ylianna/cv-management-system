import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { autoSaveProfile } from "./controllers/profile.controller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/profile/autosave', autoSaveProfile);

app.get('/', (req, res) => {
    res.json({ message: "CV Management API на Sequelize работает стабильно!" });
});

sequelize.authenticate()
    .then(() => {
        console.log('Успешное подключение к PostgreSQL!');
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Таблицы базы данных успешно синхронизированы.');
        app.listen(PORT, () => {
            console.log(`Сервер успешно запущен на порту ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Критическая ошибка при запуске сервера:', err);
    });