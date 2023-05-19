import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const controllers = (fastify: FastifyInstance) => {
  const { redis } = fastify

  const mountResponse = (
    topics: Array<string | null>,
    keys: Array<string | null>
  ) => {
    return topics.map((t: string | null, i: number) => {
      if (t) {
        const tData = JSON.parse(t)
        return {
          topic: keys[i],
          ...tData,
        }
      }
    })
  }

  return {
    read: async (_request: FastifyRequest, reply: FastifyReply) => {
      const [startKeys, continueKeys] = await Promise.all([
        redis.keys(`start-topics:*`),
        redis.keys(`continue-topics:*`),
      ])
      const [startTopics, continueTopics] = await Promise.all([
        startKeys.length ? redis.mget(startKeys) : [],
        continueKeys.length ? redis.mget(continueKeys) : [],
      ])
      return reply.code(200).send({
        startTopics: mountResponse(startTopics, startKeys),
        continueTopics: mountResponse(continueTopics, continueKeys),
      })
    },
    readRelations: async (request: FastifyRequest, reply: FastifyReply) => {
      const { process_id, definition } = request.params as {
        process_id: string
        definition: string
      }
      const response = (await redis.get(
        `resolved_triggers:WORKFLOW_EVENT-${definition}:${process_id}`
      )) as string
      if (response) {
        return reply.code(200).send(JSON.parse(response))
      }
    },
  }
}

export { controllers }
