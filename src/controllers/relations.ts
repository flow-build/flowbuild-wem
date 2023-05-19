import { FastifyRedis } from '@fastify/redis'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const controllers = (fastify: FastifyInstance) => {
  const { redis } = fastify as { redis: FastifyRedis }

  return {
    readRelationsByTrigger: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      const { process_id, definition } = request.params as {
        process_id: string
        definition: string
      }
      const response = (await redis.get(
        `resolved_triggers:${definition}:${process_id}`
      )) as string
      if (response) {
        return reply.code(200).send(JSON.parse(response))
      }
    },
    readRelationsByTarget: async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      const { process_id, definition } = request.params as {
        process_id: string
        definition: string
      }
      const response = (await redis.get(
        `resolved_targets:${definition}:${process_id}`
      )) as string
      if (response) {
        return reply.code(200).send(JSON.parse(response))
      }
    },
  }
}

export { controllers }
