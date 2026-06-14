import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt.js'

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing token' })
  }
  try {
    req.user = verifyToken(header.slice(7))
  } catch {
    return reply.code(401).send({ error: 'Invalid token' })
  }
}
