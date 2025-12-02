import sharp from 'sharp';
import { randomUUID } from 'crypto';

interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size?: number;
}

interface Thumbnail {
    buffer: Buffer;
    filename: string;
}

interface Thumbnails {
    small: Thumbnail;
    medium: Thumbnail;
    large: Thumbnail;
}

class ImageService {
    async generateThumbnails(buffer: Buffer, _originalName: string): Promise<Thumbnails> {
        const baseName = randomUUID();

        // GIF处理：只取第一帧
        const sharpInstance = sharp(buffer, { animated: false });

        const [small, medium, large] = await Promise.all([
            sharpInstance.clone().resize(200, 200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
            sharpInstance.clone().resize(400, 400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
            sharpInstance.clone().resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
        ]);

        return {
            small: { buffer: small, filename: `${baseName}-small.webp` },
            medium: { buffer: medium, filename: `${baseName}-medium.webp` },
            large: { buffer: large, filename: `${baseName}-large.webp` }
        };
    }

    async compressImage(buffer: Buffer): Promise<Buffer> {
        return await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();
    }

    async getMetadata(buffer: Buffer): Promise<ImageMetadata> {
        const metadata = await sharp(buffer).metadata();
        return {
            width: metadata.width!,
            height: metadata.height!,
            format: metadata.format!,
            size: metadata.size
        };
    }

    generateFilename(originalName: string): string {
        const ext = originalName.split('.').pop();
        return `${randomUUID()}.${ext}`;
    }
}

export default new ImageService();
