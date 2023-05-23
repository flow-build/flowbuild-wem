/* eslint-disable @typescript-eslint/no-var-requires */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { tps } from '@controllers'
const { mockRedis } = require('../../.jest/setMocks')

const sendMock = jest.fn((_resp) => {
  return
})
const reply = {
  code: jest.fn((_code) => {
    return {
      send: sendMock,
    }
  }),
} as unknown as FastifyReply

let read: (request: FastifyRequest, reply: FastifyReply) => Promise<void>

beforeAll(async () => {
  ;({ read } = tps({
    redis: mockRedis,
  } as unknown as FastifyInstance))
})

beforeEach(async () => {
  jest.clearAllMocks()
})

it('should run READ Topics', async () => {
  const topicData = {
    name: 'TEST',
    topic: 'WORKFLOW_EVENT-topic-2',
    version: 2,
  }
  mockRedis.set('WORKFLOW_EVENT-topic-2', JSON.stringify(topicData))

  await read({} as FastifyRequest, reply)

  expect(mockRedis.mget).toHaveBeenCalled()
  expect(reply.code).toHaveBeenCalledTimes(1)
  expect(reply.code).toHaveBeenCalledWith(200)
  expect(sendMock).toHaveBeenCalledTimes(1)
  expect(sendMock).toHaveBeenCalledWith({
    continueTopics: [topicData],
    startTopics: [topicData],
  })
})
