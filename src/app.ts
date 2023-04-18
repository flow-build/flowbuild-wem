import Fastify, { FastifyServerOptions } from 'fastify'
import fastifyCors from '@fastify/cors'
import { swagger } from './swagger'
import { router as tps_router } from '@routes'
import { StreamInterface } from './stream'

const app = async (opts: FastifyServerOptions, stream: StreamInterface) => {
  const fastify = Fastify(opts)
  swagger(fastify)

  await fastify.register(fastifyCors, {
    origin: '*',
  })

  fastify.get('/health', { schema: { tags: ['Health'] } }, (request, reply) => {
    return reply.send('OK')
  })

  fastify.register(tps_router, { prefix: '/topics', stream })

  return fastify
}

export { app }
