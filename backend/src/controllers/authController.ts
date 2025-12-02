import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { blacklistToken } from '../middlewares/auth.js';

const prisma = new PrismaClient();

interface RegisterBody {
    username: string;
    password: string;
    email?: string;
}

interface LoginBody {
    username: string;
    password: string;
}

interface RefreshBody {
    refreshToken: string;
}

interface JWTPayload {
    id: string;
    username?: string;
    role?: string;
}

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<Response | void> => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: '密码长度至少6位' });
        }

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(409).json({ error: '用户名已存在' });
        }

        if (email) {
            const existingEmail = await prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                return res.status(409).json({ error: '邮箱已存在' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email: email || null,
                role: 'user'
            }
        });

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: '注册失败' });
    }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<Response | void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: '登录失败' });
    }
};

export const refresh = async (req: Request<{}, {}, RefreshBody>, res: Response): Promise<Response | void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: '刷新令牌不能为空' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as JWTPayload;
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ error: '刷新令牌无效' });
    }
};

export const logout = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            await blacklistToken(token, 3600);
        }

        res.json({ message: '登出成功' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: '登出失败' });
    }
};
