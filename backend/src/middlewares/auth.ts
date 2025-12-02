import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient, RedisClientType } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
}) as RedisClientType;

redisClient.on('error', (err) => console.error('Redis Client Error', err));
await redisClient.connect();

interface JWTPayload {
    id: string;
    username: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
        res.status(401).json({ error: 'Token has been revoked' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const blacklistToken = async (token: string, expiresIn: number = 3600): Promise<void> => {
    await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
};
