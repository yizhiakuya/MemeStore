import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { memes: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(tags);
    } catch (err) {
        console.error('Get tags error:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

export default router;
