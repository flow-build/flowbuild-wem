import Fastify, { FastifyServerOptions } from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyRedis from '@fastify/redis'
import { swagger } from './swagger'
import { router as tps_router } from '@routes'
import { envs } from './configs/env'

const app = async (opts: FastifyServerOptions) => {
  const fastify = Fastify(opts)
  swagger(fastify)

  await fastify.register(fastifyCors, {
    origin: '*',
  })

  await fastify.register(fastifyRedis, {
    host: envs.REDIS_HOST,
    port: parseInt(envs.REDIS_PORT, 10),
    password: envs.REDIS_PASSWORD || '',
    db: parseInt(envs.REDIS_WEM_EVENTS_DB, 10),
  })

  fastify.get('/health', { schema: { tags: ['Health'] } }, (request, reply) => {
    return reply.send('OK')
  })

  fastify.register(tps_router, { prefix: '/topics' })

  return fastify
}

export { app }
