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

import { Project } from './models/Project';

app.get('/api/profile/:profileId/projects', async (req, res) => {
    try {
        const projects = await Project.findAll({ where: { profileId: req.params.profileId } });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении проектов' });
    }
});

app.post('/api/profile/:profileId/projects', async (req, res) => {
    const { id, name, startDate, endDate, description, tags } = req.body;
    try {
        const [project, created] = await Project.upsert({
            id: id || undefined, // Если ID нет, Sequelize создаст новый UUID
            profileId: req.params.profileId,
            name,
            startDate,
            endDate,
            description,
            tags
        });
        res.json({ message: 'Проект сохранен', project });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при сохранении проекта' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Проект успешно удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении проекта' });
    }
});

import { AttributeLibrary, ProfileAttributeValue } from './models/Attribute';
import { Op } from 'sequelize';

app.get('/api/attributes', async (req, res) => {
    const { prefix, category } = req.query;
    const whereClause: any = {};

    if (category) {
        whereClause.category = category;
    }
    if (prefix) {
        whereClause.name = { [Op.iLike]: `${prefix}%` };
    }

    try {
        const attributes = await AttributeLibrary.findAll({ where: whereClause });
        res.json(attributes);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения библиотеки атрибутов' });
    }
});

app.post('/api/attributes', async (req, res) => {
    const { category, name, description, type, options } = req.body;
    try {
        const attribute = await AttributeLibrary.create({ category, name, description, type, options });
        res.status(201).json(attribute);
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Атрибут с таким именем уже существует' });
        }
        res.status(500).json({ error: 'Ошибка создания атрибута' });
    }
});

app.get('/api/profile/:profileId/attributes', async (req, res) => {
    try {
        const values = await ProfileAttributeValue.findAll({
            where: { profileId: req.params.profileId },
            include: [{ model: AttributeLibrary, as: 'attribute' }]
        });
        res.json(values);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения значений профиля' });
    }
});

app.post('/api/profile/:profileId/attributes', async (req, res) => {
    const { attributeId, value } = req.body;
    try {
        const [attributeValue, created] = await ProfileAttributeValue.upsert({
            profileId: req.params.profileId,
            attributeId,
            value: String(value)
        });
        res.json({ message: 'Значение атрибута сохранено', attributeValue });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения значения атрибута' });
    }
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