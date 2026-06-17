import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { websocketRoutes } from '../src/websocket/handler.js';
import WebSocket from 'ws';
import { prisma } from '../src/utils/db.js';
import { signAccessToken } from '../src/utils/jwt.js';

let userId: string;
let jobId: string;
let token: string;
let serverUrl: string;
let app: ReturnType<typeof Fastify>;

describe('WebSocket handler', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: { email: `ws_${Date.now()}@campus.edu`, passwordHash: 'x', name: 'WS', university: 'U', emailVerified: true },
    });
    userId = user.id;
    token = signAccessToken({ userId, email: user.email, role: user.role });

    const job = await prisma.job.create({
      data: { title: 'WS test', description: 'x', amount: 10, customerId: userId, status: 'ACCEPTED' },
    });
    jobId = job.id;

    app = Fastify();
    await app.register(fastifyWebsocket);
    await app.register(websocketRoutes);
    await app.listen({ port: 0 });
    const addr = app.server.address() as { port: number };
    serverUrl = `ws://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { jobId } });
    await prisma.job.deleteMany({ where: { id: jobId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
    await prisma.$disconnect();
  });

  it('connects with valid token and receives CONNECTED event', async () => {
    const ws = new WebSocket(`${serverUrl}/ws?token=${token}&jobId=${jobId}`);
    await new Promise<void>((resolve, reject) => {
      ws.once('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        expect(msg.type).toBe('CONNECTED');
        ws.close();
        resolve();
      });
      ws.once('error', reject);
    });
  });

  it('rejects connection without token', async () => {
    const ws = new WebSocket(`${serverUrl}/ws?jobId=${jobId}`);
    await new Promise<void>((resolve) => {
      ws.once('close', (code) => {
        expect(code).toBeGreaterThanOrEqual(1000);
        resolve();
      });
      ws.once('error', () => resolve());
    });
  });
});
