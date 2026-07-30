import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
});

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

export default redisClient;
