import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
    try {
        const [totalMemes, totalTags, totalCategories, recentMemes] = await Promise.all([
            prisma.meme.count(),
            prisma.tag.count(),
            prisma.category.count(),
            prisma.meme.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { tags: true }
            })
        ]);

        res.json({
            totalMemes,
            totalTags,
            totalCategories,
            recentMemes
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
