import { FastifyRedis } from '@fastify/redis'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { buildTreeFromProcessId } from './utils/process_tree_builder'

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
        `resolved_triggers:${process_id}:${definition}`
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
        `resolved_targets:${process_id}:${definition}`
      )) as string
      if (response) {
        return reply.code(200).send(JSON.parse(response))
      }
    },
    processTree: async (request: FastifyRequest, reply: FastifyReply) => {
      const { process_id } = request.params as {
        process_id: string
      }

      const response = await buildTreeFromProcessId(redis, process_id)

      return reply.code(200).send(response)
    },
  }
}

export { controllers }
