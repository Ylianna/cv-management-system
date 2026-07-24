import { Request, Response } from 'express';
import { Profile } from '../models/Profile';

export const autoSaveProfile = async (req: Request, res: Response): Promise<void> => {
    const { profileId, firstName, lastName, location, photoUrl, version } = req.body;

    try {
        const profile = await Profile.findByPk(profileId);

        if (!profile) {
            const newProfile = await Profile.create({
                id: profileId,
                firstName: firstName || '',
                lastName: lastName || '',
                location: location || '',
                photoUrl: photoUrl || '',
                version: 1
            });

            res.status(200).json({
                message: 'The profile has been successfully initialized in the database',
                newVersion: newProfile.version
            });
            return;
        }

        if (profile.version !== version) {
            res.status(409).json({
                error: 'Version conflict',
                message: 'The data has been modified. Please refresh the page.'
            });
            return;
        }

        profile.firstName = firstName || '';
        profile.lastName = lastName || '';
        profile.location = location || '';
        profile.photoUrl = photoUrl || '';

        await profile.save();

        res.status(200).json({
            message: 'Successfully saved via Sequelize.',
            newVersion: profile.version
        });

    } catch (error: any) {
        if (error.name === 'SequelizeOptimisticLockError') {
            res.status(409).json({ error: 'Version conflict (Database-level locking)' });
            return;
        }
        console.error("Backend autosave error:", error);
        res.status(500).json({ error: 'Internal server error while saving' });
    }
};