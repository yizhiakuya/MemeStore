// 为 JavaScript 服务提供类型声明

declare module '../services/imageService.js' {
    interface ImageMetadata {
        width: number;
        height: number;
        format: string;
    }

    interface Thumbnail {
        filename: string;
        buffer: Buffer;
    }

    interface Thumbnails {
        small: Thumbnail;
        medium: Thumbnail;
        large: Thumbnail;
    }

    const imageService: {
        getMetadata(buffer: Buffer): Promise<ImageMetadata>;
        generateFilename(originalName: string): string;
        generateThumbnails(buffer: Buffer, originalName: string): Promise<Thumbnails>;
        compressImage(buffer: Buffer): Promise<Buffer>;
    };

    export default imageService;
}

declare module '../services/minioService.js' {
    type BucketType = 'original' | 'thumbnails' | 'compressed';

    interface DeleteFilePromise {
        bucketType: BucketType;
        fileName: string;
    }

    const minioService: {
        uploadFile(
            bucketType: BucketType,
            fileName: string,
            buffer: Buffer,
            metadata?: Record<string, string>
        ): Promise<string>;
        deleteFile(bucketType: BucketType, fileName: string): Promise<void>;
        deleteFiles(files: DeleteFilePromise[]): Promise<void>;
        getFileUrl(bucketType: BucketType, fileName: string): Promise<string>;
    };

    export default minioService;
}

declare module '../services/cacheService.js' {
    const cacheService: {
        get(key: string): Promise<any>;
        set(key: string, value: any, ttl?: number): Promise<void>;
        del(key: string): Promise<void>;
        delPattern(pattern: string): Promise<void>;
        close(): Promise<void>;
    };

    export default cacheService;
}
