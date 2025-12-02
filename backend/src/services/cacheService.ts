import { createClient, RedisClientType } from 'redis';

class CacheService {
    private client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        }) as RedisClientType;

        this.client.on('error', (err) => console.error('Redis Error:', err));
        this.client.connect();
    }

    async get<T = any>(key: string): Promise<T | null> {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (err) {
            console.error('Cache get error:', err);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            await this.client.setEx(key, ttl, JSON.stringify(value));
        } catch (err) {
            console.error('Cache set error:', err);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Cache delete error:', err);
        }
    }

    async delPattern(pattern: string): Promise<void> {
        try {
            let cursor = 0;
            do {
                const reply = await this.client.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100
                });
                cursor = reply.cursor;
                if (reply.keys.length > 0) {
                    await this.client.del(reply.keys);
                }
            } while (cursor !== 0);
        } catch (err) {
            console.error('Cache pattern delete error:', err);
        }
    }

    async close(): Promise<void> {
        await this.client.quit();
    }
}

export default new CacheService();
