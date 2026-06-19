import type { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return reply.code(422).send({ error: 'Validation failed', issues: result.error.issues });
    }
    req.body = result.data;
  };
}
