// @ts-nocheck
import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * 获取前端配置
 * 返回当前部署支持的功能
 */
router.get('/features', async (req: Request, res: Response) => {
    try {
        // 从数据库读取 OAuth 配置
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: {
                    in: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
                }
            }
        });

        const settingsMap: Record<string, string> = {};
        settings.forEach(s => {
            if (s.value) settingsMap[s.key] = s.value;
        });

        // 优先使用数据库配置，否则使用环境变量
        const githubClientId = settingsMap.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
        const githubClientSecret = settingsMap.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;
        const googleClientId = settingsMap.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
        const googleClientSecret = settingsMap.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

        const features = {
            oauth: {
                github: {
                    enabled: !!(githubClientId && githubClientSecret),
                    clientId: githubClientId || null
                },
                google: {
                    enabled: !!(googleClientId && googleClientSecret),
                    clientId: googleClientId || null
                }
            }
        };

        res.json(features);
    } catch (err) {
        console.error('Get features error:', err);
        // 如果数据库查询失败，降级到环境变量
        const features = {
            oauth: {
                github: {
                    enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
                    clientId: process.env.GITHUB_CLIENT_ID || null
                },
                google: {
                    enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
                    clientId: process.env.GOOGLE_CLIENT_ID || null
                }
            }
        };
        res.json(features);
    }
});

export default router;
