import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Keypair } from '@stellar/stellar-sdk'
import { prisma } from '../utils/db.js'
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js'
import { authMiddleware } from '../middleware/auth.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { logger } from '../utils/logger.js'

const signupSchema = z.object({
  email: z.string().email().endsWith('.edu', { message: 'Must be a .edu email' }),
  password: z.string().min(8),
  name: z.string().min(1),
  university: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

// In-memory OTP store — replace with Redis in production
const otpStore = new Map<string, { otp: string; expires: number }>()

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/signup
  app.post('/signup', { preHandler: [validate(signupSchema)] }, async (req, reply) => {
    const { email, password, name, university } = req.body as z.infer<typeof signupSchema>

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return reply.code(409).send({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const keypair = Keypair.random()

    const user = await prisma.user.create({
      data: { email, passwordHash, name, university, stellarPubkey: keypair.publicKey() },
    })

    const otp = generateOtp()
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 })

    // Dev: print OTP to console; swap for nodemailer in production
    logger.info({ email, otp }, 'Verification OTP')

    return reply.code(201).send({ message: 'Registered. Check console for OTP.', userId: user.id })
  })

  // POST /api/auth/verify-email
  app.post('/verify-email', { preHandler: [validate(verifySchema)] }, async (req, reply) => {
    const { email, otp } = req.body as z.infer<typeof verifySchema>

    const stored = otpStore.get(email)
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return reply.code(400).send({ error: 'Invalid or expired OTP' })
    }

    otpStore.delete(email)
    await prisma.user.update({ where: { email }, data: { emailVerified: true } })

    return reply.send({ message: 'Email verified' })
  })

  // POST /api/auth/login
  app.post('/login', { preHandler: [validate(loginSchema)] }, async (req, reply) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return reply.code(401).send({ error: 'Invalid credentials' })
    }
    if (!user.emailVerified) {
      return reply.code(403).send({ error: 'Email not verified' })
    }

    const payload = { userId: user.id, email: user.email, role: user.role }
    return reply.send({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    })
  })

  // POST /api/auth/refresh
  app.post('/refresh', async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken?: string }
    if (!refreshToken) return reply.code(400).send({ error: 'Missing refresh token' })

    try {
      const payload = verifyToken(refreshToken)
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) return reply.code(401).send({ error: 'User not found' })

      const newPayload = { userId: user.id, email: user.email, role: user.role }
      return reply.send({
        accessToken: signAccessToken(newPayload),
        refreshToken: signRefreshToken(newPayload),
      })
    } catch {
      return reply.code(401).send({ error: 'Invalid refresh token' })
    }
  })

  // GET /api/auth/me
  app.get('/me', { preHandler: [authMiddleware, rateLimitMiddleware] }, async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, university: true, role: true,
                trustScore: true, ratingAvg: true, completionRate: true, stellarPubkey: true,
                emailVerified: true, createdAt: true },
    })
    if (!user) return reply.code(404).send({ error: 'User not found' })
    return reply.send(user)
  })
}
