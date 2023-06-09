import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { ps } from '@controllers'

async function router(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  _done: (err?: Error) => void
) {
  const { readRelationsByTrigger, readRelationsByTarget, processTree } =
    ps(fastify)

  fastify.route({
    method: 'GET',
    url: '/trigger_process/:process_id/event/:definition',
    schema: {
      tags: ['Relations'],
      params: {
        type: 'object',
        properties: {
          process_id: { type: 'string' },
          definition: { type: 'string' },
        },
      },
    },
    handler: readRelationsByTrigger,
  })

  fastify.route({
    method: 'GET',
    url: '/target_process/:process_id/event/:definition',
    schema: {
      tags: ['Relations'],
      params: {
        type: 'object',
        properties: {
          process_id: { type: 'string' },
          definition: { type: 'string' },
        },
      },
    },
    handler: readRelationsByTarget,
  })

  fastify.route({
    method: 'GET',
    url: '/process_tree/:process_id',
    schema: {
      tags: ['Relations'],
      params: {
        type: 'object',
        properties: {
          process_id: { type: 'string' },
        },
      },
    },
    handler: processTree,
  })
}

export { router as relationsRouter }
