"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient = null;
const getRedisClient = () => {
    if (!redisClient) {
        const redis_env = process.env.REDIS_URL || '';
        if (!redis_env) {
            throw new Error('Redis URL is not defined');
        }
        redisClient = new ioredis_1.default(redis_env);
        redisClient.on('connect', () => console.log('Redis Ready!'));
        redisClient.on('error', (err) => console.error('Redis error:', err));
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
