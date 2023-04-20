import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { envs } from './configs/env'

export const swagger = async (fastify: FastifyInstance) => {
  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Flowbuild WEM Swagger',
        description: 'Workflow Event Manager',
        version: '0.1.0',
      },
      host: `${
        envs.SERVER_HOST === 'localhost'
          ? `${envs.SERVER_HOST}:${envs.SERVER_PORT}`
          : envs.SERVER_HOST
      }`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'Health', description: 'Health Check' },
        { name: 'Topics', description: 'Flowbuild WEM available topics' },
      ],
      definitions: {
        StartInput: {
          type: 'object',
          properties: {
            workflow_name: { type: 'string' },
            process_input: { type: 'object' },
          },
          required: ['process_input'],
        },
      },
      // securityDefinitions: {
      //   BearerToken: {
      //     description: 'Authorization header token, sample: "Bearer #TOKEN#"',
      //     type: 'apiKey',
      //     name: 'Authorization',
      //     in: 'header',
      //   },
      // },
    },
  })

  await fastify.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  })
}
