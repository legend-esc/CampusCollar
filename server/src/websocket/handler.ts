import type { FastifyInstance } from 'fastify'
import type { WebSocket } from 'ws'
import { verifyToken } from '../utils/jwt.js'
import { prisma } from '../utils/db.js'
import { logger } from '../utils/logger.js'

interface WSMessage {
  type: string
  payload: Record<string, unknown>
}

interface WSClient {
  ws: WebSocket
  userId: string
  jobIds: Set<string>
}

const clients = new Map<string, WSClient>()
const jobRooms = new Map<string, Set<string>>()

function broadcastToJob(jobId: string, event: string, data: unknown) {
  const room = jobRooms.get(jobId)
  if (!room) return
  for (const clientId of room) {
    const client = clients.get(clientId)
    if (client?.ws.readyState === 1) {
      client.ws.send(JSON.stringify({ event, data }))
    }
  }
}

export { broadcastToJob }

export async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const token = url.searchParams.get('token')
    if (!token) {
      socket.close(4001, 'Authentication required')
      return
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      socket.close(4001, 'Invalid token')
      return
    }

    const clientId = payload.userId
    const client: WSClient = { ws: socket, userId: clientId, jobIds: new Set() }
    clients.set(clientId, client)

    logger.info({ userId: clientId }, 'WebSocket connected')

    socket.on('message', async (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as WSMessage
        const payload = msg.payload as Record<string, string>
        switch (msg.type) {
          case 'JOIN_JOB': {
            const jobId = payload.jobId
            if (!jobId) return
            client.jobIds.add(jobId)
            if (!jobRooms.has(jobId)) jobRooms.set(jobId, new Set())
            jobRooms.get(jobId)!.add(clientId)
            socket.send(JSON.stringify({ event: 'JOINED', data: { jobId } }))
            break
          }
          case 'LEAVE_JOB': {
            const jobId = payload.jobId
            if (!jobId) return
            client.jobIds.delete(jobId)
            jobRooms.get(jobId)?.delete(clientId)
            break
          }
          case 'NEW_MESSAGE': {
            const jobId = payload.jobId
            const content = payload.content
            if (!jobId || !content) return
            const message = await prisma.message.create({
              data: { jobId, senderId: clientId, content },
            })
            broadcastToJob(jobId, 'NEW_MESSAGE', message)
            break
          }
          case 'TYPING': {
            const jobId = payload.jobId
            if (!jobId) return
            socket.send(JSON.stringify({ event: 'TYPING', data: { jobId, userId: clientId } }))
            break
          }
          default:
            break
        }
      } catch (err) {
        logger.error({ err }, 'WebSocket message error')
      }
    })

    socket.on('close', () => {
      for (const jobId of client.jobIds) {
        jobRooms.get(jobId)?.delete(clientId)
      }
      clients.delete(clientId)
      logger.info({ userId: clientId }, 'WebSocket disconnected')
    })
  })
}
