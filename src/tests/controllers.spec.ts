import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { StreamInterface } from '@stream'
import { tps } from '@controllers'

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

const streamMock = {
  readTopics: jest.fn(() => {
    return ['topic-1', 'WORKFLOW_EVENT-topic-2']
  }),
} as unknown as StreamInterface

let read: (request: FastifyRequest, reply: FastifyReply) => Promise<void>

beforeAll(async () => {
  ;({ read } = tps({} as FastifyInstance, streamMock))
})

beforeEach(async () => {
  jest.clearAllMocks()
})

it('should run READ Topics', async () => {
  await read({} as FastifyRequest, reply)

  expect(reply.code).toHaveBeenCalledTimes(1)
  expect(reply.code).toHaveBeenCalledWith(200)
  expect(sendMock).toHaveBeenCalledTimes(1)
  expect(sendMock).toHaveBeenCalledWith(['WORKFLOW_EVENT-topic-2'])
})
