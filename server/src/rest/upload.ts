import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { extname, join } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { config } from '../config.js'
import { authMiddleware } from '../middleware/auth.js'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/api/upload', { preHandler: [authMiddleware] }, async (req, reply) => {
    const file = await req.file()
    if (!file) {
      return reply.code(400).send({ error: 'No file provided' })
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return reply.code(422).send({ error: 'Invalid file type. Allowed: jpeg, png, webp' })
    }

    const ext = extname(file.filename) || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const filepath = join(config.upload.dir, filename)

    await pipeline(file.file, createWriteStream(filepath))

    const url = `/uploads/${filename}`
    return reply.send({ url, filename })
  })
}
