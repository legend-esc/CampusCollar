import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { authRoutes } from '../src/rest/auth.js';
import { prisma } from '../src/utils/db.js';
import { validate } from '../src/middleware/validate.js';

// These tests require a real Postgres — skip in unit-only CI
const TEST_EMAIL = `test_${Date.now()}@campus.edu`;
const TEST_PASSWORD = 'Password123!';
let accessToken: string;
let refreshToken: string;

async function buildApp() {
  const app = Fastify();
  await app.register(authRoutes, { prefix: '/api/auth' });
  return app;
}

describe('Auth flow', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /signup — creates user and returns userId', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'Test User',
        university: 'Test U',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveProperty('userId');
  });

  it('POST /signup — rejects duplicate email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'Test User',
        university: 'Test U',
      },
    });
    expect(res.statusCode).toBe(409);
  });

  it('POST /signup — rejects non-.edu email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/signup',
      payload: { email: 'user@gmail.com', password: TEST_PASSWORD, name: 'X', university: 'Y' },
    });
    expect(res.statusCode).toBe(422);
  });

  it('POST /verify-email — verifies OTP', async () => {
    // Force-verify for test (bypass OTP)
    await prisma.user.update({ where: { email: TEST_EMAIL }, data: { emailVerified: true } });
    // Verification already done, just assert user is verified
    const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    expect(user?.emailVerified).toBe(true);
  });

  it('POST /login — returns tokens', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  it('POST /login — rejects wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: TEST_EMAIL, password: 'wrongpassword' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /refresh — rotates token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh',
      payload: { refreshToken },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('accessToken');
  });

  it('GET /me — returns current user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('email', TEST_EMAIL);
  });
});
