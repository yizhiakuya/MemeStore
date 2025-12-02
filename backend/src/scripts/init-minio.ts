import minioService from '../services/minioService.js';

async function initMinIO(): Promise<void> {
    console.log('🚀 Initializing MinIO buckets...');

    try {
        await minioService.initBuckets();
        console.log('✅ MinIO initialization completed');
        process.exit(0);
    } catch (err) {
        console.error('❌ MinIO initialization failed:', err);
        process.exit(1);
    }
}

initMinIO();
