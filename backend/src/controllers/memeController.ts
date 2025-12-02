import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import imageService from '../services/imageService.js';
import minioService from '../services/minioService.js';
import cacheService from '../services/cacheService.js';
import type {
    UploadMemeRequest,
    UpdateMemeRequest,
    DeleteMemeRequest,
    GetMemeRequest,
    DeleteFilePromise
} from '../types/index.js';

const prisma = new PrismaClient();

// 获取 Meme 列表
export const getMemes = async (req: any, res: Response): Promise<Response | void> => {
    try {
        const {
            page = '1',
            limit = '20',
            categoryId,
            tags,
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        // 构建缓存键
        const cacheKey = `memes:${page}:${limit}:${categoryId || 'all'}:${tags || 'all'}:${search || ''}:${sortBy}:${order}`;

        // 检查缓存
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // 构建查询条件
        const where: Prisma.MemeWhereInput = {};
        
        if (categoryId) {
            where.categoryId = categoryId as string;
        }
        
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }
        
        if (tags) {
            const tagArray = (tags as string).split(',');
            where.tags = {
                some: {
                    name: { in: tagArray }
                }
            };
        }

        // 查询数据
        const [memes, total] = await Promise.all([
            prisma.meme.findMany({
                where,
                skip,
                take,
                include: {
                    tags: true,
                    category: true
                },
                orderBy: {
                    [sortBy as string]: order
                }
            }),
            prisma.meme.count({ where })
        ]);

        const result = {
            data: memes,
            pagination: {
                page: parseInt(page as string),
                limit: take,
                total,
                pages: Math.ceil(total / take)
            }
        };

        // 缓存结果
        await cacheService.set(cacheKey, result, 300);

        res.json(result);
    } catch (err) {
        console.error('Get memes error:', err);
        res.status(500).json({ error: 'Failed to fetch memes' });
    }
};

// 获取单个 Meme
export const getMemeById = async (req: GetMemeRequest, res: Response): Promise<Response | void> => {
    try {
        const { id } = req.params;

        const meme = await prisma.meme.findUnique({
            where: { id },
            include: {
                tags: true,
                category: true
            }
        });

        if (!meme) {
            return res.status(404).json({ error: 'Meme not found' });
        }

        // 增加浏览量
        await prisma.meme.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        });

        res.json(meme);
    } catch (err) {
        console.error('Get meme error:', err);
        res.status(500).json({ error: 'Failed to fetch meme' });
    }
};

// 创建 Meme（图片或文字）
export const uploadMeme = async (req: UploadMemeRequest, res: Response): Promise<Response | void> => {
    try {
        const { title, description, categoryId, tags, type, textContent } = req.body;
        
        // 处理标签
        let tagObjects: Array<{ id: string }> = [];
        if (tags) {
            const tagArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
            tagObjects = await Promise.all(
                tagArray.map(async (tagName: string) => {
                    const tag = await prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName }
                    });
                    return { id: tag.id };
                })
            );
        }

        // 如果是文字梗
        if (type === 'text') {
            if (!textContent) {
                return res.status(400).json({ error: 'Text content is required for text meme' });
            }

            const meme = await prisma.meme.create({
                data: {
                    type: 'text',
                    title: title || undefined,
                    description: description || undefined,
                    textContent,
                    categoryId: categoryId || null,
                    tags: {
                        connect: tagObjects
                    }
                },
                include: {
                    tags: true,
                    category: true
                }
            });

            await cacheService.delPattern('memes:*');
            return res.status(201).json(meme);
        }

        // 如果是图片梗
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;

        // 获取图片元数据
        const metadata = await imageService.getMetadata(file.buffer);

        // 生成文件名
        const filename = imageService.generateFilename(file.originalname);

        // 上传原图到 MinIO
        const originalUrl = await minioService.uploadFile('original', filename, file.buffer, {
            'Content-Type': file.mimetype
        });

        // 生成并上传缩略图
        const thumbnails = await imageService.generateThumbnails(file.buffer, file.originalname);
        const thumbnailUrl = await minioService.uploadFile(
            'thumbnails',
            thumbnails.medium.filename,
            thumbnails.medium.buffer,
            { 'Content-Type': 'image/webp' }
        );

        // 压缩并上传压缩图
        const compressed = await imageService.compressImage(file.buffer);
        const compressedUrl = await minioService.uploadFile(
            'compressed',
            `compressed-${filename}`,
            compressed,
            { 'Content-Type': 'image/webp' }
        );

        // 创建 Meme 记录
        const meme = await prisma.meme.create({
            data: {
                type: 'image',
                title: title || undefined,
                description: description || undefined,
                originalUrl,
                thumbnailUrl,
                compressedUrl,
                filename,
                fileSize: file.size,
                mimeType: file.mimetype,
                width: metadata.width,
                height: metadata.height,
                categoryId: categoryId || null,
                tags: {
                    connect: tagObjects
                }
            },
            include: {
                tags: true,
                category: true
            }
        });

        // 清除相关缓存
        await cacheService.delPattern('memes:*');

        res.status(201).json(meme);
    } catch (err) {
        console.error('Upload meme error:', err);
        res.status(500).json({ error: 'Failed to upload meme' });
    }
};

// 更新 Meme
export const updateMeme = async (req: UpdateMemeRequest, res: Response): Promise<Response | void> => {
    try {
        const { id } = req.params;
        const { title, description, categoryId, tags } = req.body;

        // 处理标签
        let tagObjects: Array<{ id: string }> | undefined;
        if (tags) {
            const tagArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
            tagObjects = await Promise.all(
                tagArray.map(async (tagName: string) => {
                    const tag = await prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName }
                    });
                    return { id: tag.id };
                })
            );
        }

        const meme = await prisma.meme.update({
            where: { id },
            data: {
                title: title || undefined,
                description: description || undefined,
                categoryId: categoryId || undefined,
                tags: tags ? {
                    set: tagObjects
                } : undefined
            },
            include: {
                tags: true,
                category: true
            }
        });

        // 清除缓存
        await cacheService.delPattern('memes:*');

        res.json(meme);
    } catch (err) {
        console.error('Update meme error:', err);
        res.status(500).json({ error: 'Failed to update meme' });
    }
};

// 删除 Meme
export const deleteMeme = async (req: DeleteMemeRequest, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        // 获取 Meme 信息（包含标签）
        const meme = await prisma.meme.findUnique({ 
            where: { id },
            include: { tags: true }
        });
        
        if (!meme) {
            return res.status(404).json({ error: 'Meme not found' });
        }

        // 保存标签 ID 列表，用于后续清理
        const tagIds = meme.tags.map(tag => tag.id);

        // 从 MinIO 删除文件（仅图片梗）
        if (meme.type === 'image' && meme.filename) {
            const deletePromises: DeleteFilePromise[] = [
                { bucketType: 'original', fileName: meme.filename }
            ];
            
            if (meme.thumbnailUrl) {
                deletePromises.push({ 
                    bucketType: 'thumbnails', 
                    fileName: meme.thumbnailUrl.split('/').pop()! 
                });
            }
            
            if (meme.compressedUrl) {
                deletePromises.push({
                    bucketType: 'compressed',
                    fileName: meme.compressedUrl.split('/').pop()!
                });
            }
            
            await minioService.deleteFiles(deletePromises);
        }

        // 删除数据库记录
        await prisma.meme.delete({ where: { id } });

        // 清理孤立标签（没有关联任何 meme 的标签）
        for (const tagId of tagIds) {
            const tagUsageCount = await prisma.tag.findUnique({
                where: { id: tagId },
                include: { _count: { select: { memes: true } } }
            });
            
            // 如果标签没有被任何 meme 使用，则删除
            if (tagUsageCount && tagUsageCount._count.memes === 0) {
                await prisma.tag.delete({ where: { id: tagId } });
                console.log(`Deleted orphaned tag: ${tagId}`);
            }
        }

        // 清除缓存
        await cacheService.delPattern('memes:*');
        await cacheService.delPattern('tags:*');

        return res.json({ message: 'Meme deleted successfully' });
    } catch (err) {
        console.error('Delete meme error:', err);
        return res.status(500).json({ error: 'Failed to delete meme' });
    }
};
