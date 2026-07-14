import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
    };
}

export const requireRole = (allowedRoles: ('CANDIDATE' | 'RECRUITER' | 'ADMIN')[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const userRole = req.headers['x-user-role'] as 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
        const userId = req.headers['x-user-id'] as string;

        if (!userRole || !userId) {
            res.status(401).json({ error: 'Не авторизован' });
            return;
        }

        if (userRole === 'ADMIN') {
            req.user = { id: userId, role: userRole };
            next();
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ error: 'Доступ запрещен для вашей роли' });
            return;
        }

        req.user = { id: userId, role: userRole };
        next();
    };
};