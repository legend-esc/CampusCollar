import { FastifyInstance } from 'fastify'
import { prisma } from '../utils/db.js'
import { notificationService } from '../services/notification.js'

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.post('/api/webhooks/stellar', async (request, reply) => {
    const { type, data } = request.body as any
    
    // Logic to handle Stellar events (e.g., job funded on-chain)
    fastify.log.info({ type, data }, 'Stellar webhook received')

    if (type === 'payment_received') {
       // logic for payment
    }

    return { received: true }
  })
}
