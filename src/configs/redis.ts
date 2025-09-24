import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (!redisClient) {
        const redis_env = process.env.REDIS_URL || '';
        if (!redis_env) {
            throw new Error('Redis URL is not defined');
        }
        redisClient = new Redis(redis_env);
        redisClient.on('connect', () => console.log('Redis Ready!'));
        redisClient.on('error', (err) => console.error('Redis error:', err));
    }

    return redisClient;
};
