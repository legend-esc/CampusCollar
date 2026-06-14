import Fastify from 'fastify'
import cors from '@fastify/cors'
import { ApolloServer } from '@apollo/server'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'
import { typeDefs } from './graphql/schema/index.js'
import { resolvers } from './graphql/resolvers/index.js'
import { createLoaders, GraphQLContext } from './graphql/context.js'
import { prisma } from './utils/db.js'
import { config } from './config.js'
import { verifyToken } from './utils/jwt.js'
import { webhookRoutes } from './rest/webhook.js'

const fastify = Fastify({
  logger: true,
})

const apollo = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [fastifyApolloDrainPlugin(fastify)],
})

await apollo.start()

await fastify.register(cors, {
  origin: config.clientUrl,
  credentials: true,
})

await fastify.register(webhookRoutes)

await fastify.register(fastifyApollo(apollo), {
  context: async (request) => {
    let userId: string | undefined
    const header = request.headers.authorization
    if (header?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(header.slice(7))
        userId = (decoded as any).userId
      } catch (err) {
        // Token invalid, proceed as guest
      }
    }

    return {
      userId,
      prisma,
      loaders: createLoaders(),
    }
  },
})

fastify.get('/health', async () => ({ status: 'ok' }))

const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
