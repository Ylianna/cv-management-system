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
            id: id || undefined,
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
import { Position, PositionAttribute } from './models/Position';
import { Op } from 'sequelize';
import { CV } from './models/CV';
import { Profile } from './models/Profile';

app.get('/api/positions/:positionId/generate/:profileId', async (req, res) => {
    const { positionId, profileId } = req.params;
    try {
        const position = await Position.findByPk(positionId, {
            include: [{ model: AttributeLibrary, as: 'requiredAttributes' }]
        });
        if (!position) return res.status(404).json({ error: 'Позиция не найдена' });

        const profile = await Profile.findByPk(profileId);
        if (!profile) return res.status(404).json({ error: 'Профиль кандидата не найден' });

        const filledAttributes = await ProfileAttributeValue.findAll({
            where: { profileId }
        });

        const projects = await Project.findAll({
            where: { profileId },
            limit: (position as any).maxProjects || 3
        });

        const [cv, created] = await CV.findOrCreate({
            where: { profileId, positionId },
            defaults: { isPublished: false }
        });

        res.json({
            cv,
            position,
            profile,
            filledAttributes,
            projects
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка автогенерации CV' });
    }
});

app.post('/api/cv/:id/publish', async (req, res) => {
    const { version } = req.body;
    try {
        const cv = await CV.findByPk(req.params.id);
        if (!cv) return res.status(404).json({ error: 'CV не найдено' });

        if (cv.version !== version) {
            return res.status(409).json({ error: 'Конфликт версий при публикации' });
        }

        cv.isPublished = true;
        await cv.save();

        res.json({ message: 'Резюме успешно опубликовано и доступно рекрутерам!', cv });
    } catch (error: any) {
        if (error.name === 'SequelizeOptimisticLockError') {
            return res.status(409).json({ error: 'Конфликт версий на уровне БД' });
        }
        res.status(500).json({ error: 'Ошибка публикации' });
    }
});

app.get('/api/positions', async (req, res) => {
    try {
        const positions = await Position.findAll({
            include: [{ model: AttributeLibrary, as: 'requiredAttributes', through: { attributes: ['isRequired'] } }]
        });
        res.json(positions);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения списка вакансий' });
    }
});

app.post('/api/positions', async (req, res) => {
    const { id, title, description, accessRules, maxProjects, attributes, version } = req.body;

    try {
        if (id) {
            const existing = await Position.findByPk(id);
            if (!existing) return res.status(404).json({ error: 'Вакансия не найдена' });

            if (existing.version !== version) {
                return res.status(409).json({ error: 'Конфликт версий', message: 'Шаблон вакансии был изменен другим рекрутером.' });
            }

            existing.title = title;
            existing.description = description;
            existing.accessRules = accessRules;
            existing.maxProjects = maxProjects;
            await existing.save();

            await PositionAttribute.destroy({ where: { positionId: id } });
            if (attributes && Array.isArray(attributes)) {
                await PositionAttribute.bulkCreate(attributes.map((a: any) => ({ positionId: id, attributeId: a.id, isRequired: a.isRequired })));
            }

            return res.json({ message: 'Вакансия обновлена', position: existing });
        } else {
            const newPos = await Position.create({ title, description, accessRules, maxProjects });
            if (attributes && Array.isArray(attributes)) {
                await PositionAttribute.bulkCreate(attributes.map((a: any) => ({ positionId: newPos.id, attributeId: a.id, isRequired: a.isRequired })));
            }
            return res.status(201).json({ message: 'Вакансия создана', position: newPos });
        }
    } catch (error: any) {
        if (error.name === 'SequelizeOptimisticLockError') {
            return res.status(409).json({ error: 'Конфликт версий на уровне БД' });
        }
        res.status(500).json({ error: 'Серверная ошибка при сохранении вакансии' });
    }
});

app.post('/api/positions/:id/duplicate', async (req, res) => {
    try {
        const original = await Position.findByPk(req.params.id, {
            include: [{ model: AttributeLibrary, as: 'requiredAttributes' }]
        });
        if (!original) return res.status(404).json({ error: 'Оригинал не найден' });

        const clone = await Position.create({
            title: `${original.title} (Copy)`,
            description: original.description,
            accessRules: original.accessRules,
            maxProjects: original.maxProjects
        });

        const originalAttrs = (original as any).requiredAttributes || [];
        if (originalAttrs.length > 0) {
            await PositionAttribute.bulkCreate(originalAttrs.map((a: any) => ({
                positionId: clone.id,
                attributeId: a.id,
                isRequired: a.PositionAttribute.isRequired
            })));
        }

        res.status(201).json({ message: 'Вакансия успешно дублирована', position: clone });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка дублирования вакансии' });
    }
});

app.delete('/api/positions/:id', async (req, res) => {
    try {
        await Position.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Вакансия удалена' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении вакансии' });
    }
});


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