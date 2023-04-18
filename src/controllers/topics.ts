import { StreamInterface } from '@/stream'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const controllers = (_fastify: FastifyInstance, stream: StreamInterface) => {
  return {
    read: async (_request: FastifyRequest, reply: FastifyReply) => {
      const topics = await stream.readTopics()
      const workflowEventsTopics = topics?.filter((topic: string) =>
        topic.includes('WORKFLOW_EVENT-')
      )
      return reply.code(200).send(workflowEventsTopics)
    },
  }
}

export { controllers }
