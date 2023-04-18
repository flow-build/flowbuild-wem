import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { tps } from '@controllers'

async function router(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  _done: (err?: Error) => void
) {
  const { stream } = options

  const { read } = tps(fastify, stream)

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Topics'],
    },
    handler: read,
  })
}

export { router }
