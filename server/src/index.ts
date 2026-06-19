import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import multipart from '@fastify/multipart';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import { typeDefs } from './graphql/schema/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import { createLoaders, GraphQLContext } from './graphql/context.js';
import { prisma } from './utils/db.js';
import { config } from './config.js';
import { verifyToken } from './utils/jwt.js';
import { webhookRoutes } from './rest/webhook.js';
import { authRoutes } from './rest/auth.js';
import { uploadRoutes } from './rest/upload.js';
import { websocketRoutes } from './websocket/handler.js';
import { scheduleExpiryCheck } from './jobs/expiry.js';
import { scheduleDisputeCheck } from './jobs/dispute.js';
import { logger } from './utils/logger.js';

const fastify = Fastify({
  logger: true,
});

const apollo = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [fastifyApolloDrainPlugin(fastify)],
});

await apollo.start();

await fastify.register(cors, {
  origin: config.clientUrl,
  credentials: true,
});

await fastify.register(multipart, {
  limits: { fileSize: config.upload.maxFileSize },
});

await fastify.register(fastifyWebsocket);

await fastify.register(webhookRoutes);
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(uploadRoutes);
await fastify.register(websocketRoutes);

await fastify.register(fastifyApollo(apollo), {
  context: async (request) => {
    let userId: string | undefined;
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(header.slice(7));
        userId = (decoded as any).userId;
      } catch (err) {
        // Token invalid, proceed as guest
      }
    }

    return {
      userId,
      prisma,
      loaders: createLoaders(),
    };
  },
});

fastify.get('/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await scheduleExpiryCheck();
    await scheduleDisputeCheck();
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
