/* eslint-disable @typescript-eslint/no-empty-function */

import { FastifyInstance } from 'fastify'
import { app } from '@/app'
import { StreamInterface } from '@/stream'

const tpsReadMock = jest.fn(async () => {
  return
})
jest.mock('@controllers', () => {
  return {
    tps: (_fastify: FastifyInstance, _stream: StreamInterface) => {
      return {
        read: tpsReadMock,
      }
    },
  }
})

let server: FastifyInstance
const PORT = 3002
beforeAll(async () => {
  server = await app(
    {
      logger: false,
    },
    {} as StreamInterface
  )
  await server.listen({ port: PORT, host: '0.0.0.0' })
  await server.ready()
})

beforeEach(async () => {
  jest.clearAllMocks()
})

afterAll(async () => {
  await server.close()
})

it('should healthCheck', async () => {
  const response = await fetch(`http://0.0.0.0:${PORT}/health`, {
    method: 'get',
  })

  expect(response.status).toBe(200)
})

it('should call READ Topics', async () => {
  await fetch(`http://0.0.0.0:${PORT}/topics`, {
    method: 'get',
  })

  expect(tpsReadMock).toHaveBeenCalledTimes(1)
})
