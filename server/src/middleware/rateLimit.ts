import type { FastifyRequest, FastifyReply } from 'fastify';
import { Redis } from 'ioredis';
import { config } from '../config.js';

const redis = new Redis(config.redis.url);
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

export async function rateLimitMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const key = `rl:${req.user?.userId ?? req.ip}`;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, '-inf', windowStart);
  pipe.zadd(key, now, `${now}`);
  pipe.zcard(key);
  pipe.expire(key, 60);

  const results = await pipe.exec();
  const count = results?.[2]?.[1] as number;

  if (count > MAX_REQUESTS) {
    return reply.code(429).send({ error: 'Too many requests' });
  }
}
