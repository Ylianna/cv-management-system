import { Request, Response } from 'express';
import { prisma } from '../index';

export const autoSaveProfile = async (req: Request, res: Response): Promise<void> => {
    const { profileId, firstName, lastName, location, photoUrl, version } = req.body;

    try {
        const currentProfile = await prisma.profile.findUnique({
            where: { id: profileId },
            select: { version: true }
        });

        if (!currentProfile) {
            res.status(404).json({ error: 'Профиль не найден' });
            return;
        }

        if (currentProfile.version !== version) {
            res.status(409).json({
                error: 'Конфликт версий',
                message: 'Данные были изменены администратором или на другом устройстве. Обновите страницу.'
            });
            return;
        }

        const updatedProfile = await prisma.profile.update({
            where: {
                id: profileId,
                version: version
            },
            data: {
                firstName,
                lastName,
                location,
                photoUrl,
                version: { increment: 1 }
            }
        });

        res.status(200).json({
            message: 'Успешно сохранено',
            newVersion: updatedProfile.version
        });

    } catch (error) {
        res.status(500).json({ error: 'Внутренняя ошибка сервера при сохранении' });
    }
};