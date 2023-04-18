import Fastify, { FastifyServerOptions } from 'fastify'
import fastifyCors from '@fastify/cors'
import { swagger } from './swagger'
import { runWorker } from './index'
import { router as tps_router } from '@routes'

const app = async (opts?: FastifyServerOptions) => {
  const stream = await runWorker()

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
