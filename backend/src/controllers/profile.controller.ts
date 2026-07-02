import { Request, Response } from 'express';
import { Profile } from '../models/Profile';

export const autoSaveProfile = async (req: Request, res: Response): Promise<void> => {
    const { profileId, firstName, lastName, location, photoUrl, version } = req.body;

    try {
        const profile = await Profile.findByPk(profileId);

        if (!profile) {
            res.status(404).json({ error: 'Профиль не найден' });
            return;
        }

        if (profile.version !== version) {
            res.status(409).json({
                error: 'Конфликт версий',
                message: 'Данные были изменены. Обновите страницу.'
            });
            return;
        }

        profile.firstName = firstName;
        profile.lastName = lastName;
        profile.location = location;
        profile.photoUrl = photoUrl;

        await profile.save();

        res.status(200).json({
            message: 'Успешно сохранено через Sequelize',
            newVersion: profile.version
        });

    } catch (error: any) {
        if (error.name === 'SequelizeOptimisticLockError') {
            res.status(409).json({ error: 'Конфликт версий (Блокировка уровня БД)' });
            return;
        }
        res.status(500).json({ error: 'Внутренняя ошибка сервера при сохранении' });
    }
};