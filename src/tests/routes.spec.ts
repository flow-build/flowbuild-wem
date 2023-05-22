/* eslint-disable @typescript-eslint/no-empty-function */

import { FastifyInstance } from 'fastify'
import { app } from '@/app'
import { StreamInterface } from '@/stream'

const tpsReadMock = jest.fn(async () => {
  return
})
const readRelationsByTrigger = jest.fn(async () => {
  return
})
const readRelationsByTarget = jest.fn(async () => {
  return
})
jest.mock('@controllers', () => {
  return {
    tps: (_fastify: FastifyInstance, _stream: StreamInterface) => {
      return {
        read: tpsReadMock,
      }
    },
    ps: (_fastify: FastifyInstance, _stream: StreamInterface) => {
      return {
        readRelationsByTrigger,
        readRelationsByTarget,
      }
    },
  }
})

let server: FastifyInstance
const PORT = 3002
beforeAll(async () => {
  server = await app({
    logger: false,
  })
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

it('should call readRelationsByTrigger', async () => {
  await fetch(
    `http://0.0.0.0:${PORT}/relations/trigger_process/<process_id>/event/<definition>`,
    {
      method: 'get',
    }
  )

  expect(readRelationsByTrigger).toHaveBeenCalledTimes(1)
})

it('should call readRelationsByTarget', async () => {
  await fetch(
    `http://0.0.0.0:${PORT}/relations/target_process/<process_id>/event/<definition>`,
    {
      method: 'get',
    }
  )

  expect(readRelationsByTarget).toHaveBeenCalledTimes(1)
})
