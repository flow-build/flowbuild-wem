import { StreamInterface } from '@/stream'
import { EventManager } from '@/worker'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const controllers = (
  _fastify: FastifyInstance,
  workerEntities: { eventManager: EventManager; stream: StreamInterface }
) => {
  const { stream, eventManager } = workerEntities
  return {
    read: async (_request: FastifyRequest, reply: FastifyReply) => {
      const topics = await stream.readTopics()
      const workflowEventsTopics = topics
        ?.filter((topic: string) => topic.includes('WORKFLOW_EVENT-'))
        .map((topic: string) => {
          const data = eventManager.startTopicMap[topic]
          return {
            topic,
            ...data,
          }
        })

      return reply.code(200).send(workflowEventsTopics)
    },
  }
}

export { controllers }
