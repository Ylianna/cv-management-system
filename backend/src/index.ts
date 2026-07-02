import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

app.use(cors());
app.use(express.json());

sequelize.authenticate()
    .then(() => console.log('Успешное подключение к PostgreSQL через Sequelize!'))
    .catch((err) => console.error('Ошибка подключения к СУБД:', err));

app.get('/', (req, res) => {
    res.json({ message: "CV Management API на Sequelize работает!" });
});

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на порту ${PORT}`);
});