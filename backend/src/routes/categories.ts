import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { memes: true }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
