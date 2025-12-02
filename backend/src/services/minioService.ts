import * as Minio from 'minio';

type BucketType = 'original' | 'thumbnails' | 'compressed';

interface DeleteFileRequest {
    bucketType: BucketType;
    fileName: string;
}

class MinioService {
    private client: Minio.Client;
    private buckets: Record<BucketType, string>;

    constructor() {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });

        this.buckets = {
            original: 'memes-original',
            thumbnails: 'memes-thumbnails',
            compressed: 'memes-compressed'
        };
    }

    async initBuckets(): Promise<void> {
        for (const bucket of Object.values(this.buckets)) {
            try {
                const exists = await this.client.bucketExists(bucket);
                if (!exists) {
                    await this.client.makeBucket(bucket, 'us-east-1');
                    console.log(`✅ Created bucket: ${bucket}`);

                    const policy = {
                        Version: '2012-10-17',
                        Statement: [{
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${bucket}/*`]
                        }]
                    };
                    await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
                } else {
                    console.log(`ℹ️  Bucket already exists: ${bucket}`);
                }
            } catch (err) {
                console.error(`Error creating bucket ${bucket}:`, err);
            }
        }
    }

    async uploadFile(
        bucketType: BucketType,
        fileName: string,
        buffer: Buffer,
        metadata: Record<string, string> = {}
    ): Promise<string> {
        const bucket = this.buckets[bucketType];
        if (!bucket) {
            throw new Error(`Invalid bucket type: ${bucketType}`);
        }

        try {
            await this.client.putObject(bucket, fileName, buffer, buffer.length, metadata);
            return this.getFileUrl(bucketType, fileName);
        } catch (err) {
            console.error('MinIO upload error:', err);
            throw err;
        }
    }

    getFileUrl(bucketType: BucketType, fileName: string): string {
        const bucket = this.buckets[bucketType];
        const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
        const port = process.env.MINIO_PORT || '9000';
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';

        return `${protocol}://${endpoint}:${port}/${bucket}/${fileName}`;
    }

    async deleteFile(bucketType: BucketType, fileName: string): Promise<void> {
        const bucket = this.buckets[bucketType];
        try {
            await this.client.removeObject(bucket, fileName);
        } catch (err) {
            console.error('MinIO delete error:', err);
            throw err;
        }
    }

    async deleteFiles(files: DeleteFileRequest[]): Promise<void> {
        const promises = files.map(({ bucketType, fileName }) =>
            this.deleteFile(bucketType, fileName).catch(err => console.error(err))
        );
        await Promise.all(promises);
    }
}

export default new MinioService();
