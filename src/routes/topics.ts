import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { tps } from '@controllers'

async function router(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  _done: (err?: Error) => void
) {
  const { read } = tps(fastify)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Topics'],
    },
    handler: read,
  })
}

export { router as topicsRouter }
