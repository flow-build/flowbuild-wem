import { EachMessagePayload } from 'kafkajs'
import { EventManager } from '@event-manager'
import { StreamInterface } from '@/stream'
import { createLogger } from '@utils'
import { envs } from '@configs/env'

const consumerMock = {
  connect: jest.fn(() => {
    return
  }),
  run: jest.fn(() => {
    return
  }),
  subscribe: jest.fn(() => {
    return
  }),
}
const producerMock = {
  connect: jest.fn(() => {
    return
  }),
  send: jest.fn(() => {
    return
  }),
}

jest.mock('@stream/kafka', () => {
  const testClient = class TestClient {}
  return {
    client: new testClient(),
    setClient: jest.fn(() => {
      return
    }),
    connectKafka: () => {
      return {
        consumer: consumerMock,
        producer: producerMock,
      }
    },
  }
})

const makeAuthenticatedRequestMock = jest.fn(() => {
  return
})
jest.mock('@event-manager/requester', () => {
  return {
    Requester: class Requester {
      async makeAuthenticatedRequest() {
        makeAuthenticatedRequestMock()
        return
      }
    },
  }
})

let stream: StreamInterface
let worker: EventManager

beforeAll(async () => {
  createLogger('test')
  worker = new EventManager()
  stream = new StreamInterface(envs.STREAM_CONFIG)
  EventManager.stream = stream
  await stream.connect(worker)
})

it('should correctly RUN consumer connection', async () => {
  await stream.setConsumer(worker)
  expect(consumerMock.run).toHaveBeenCalledTimes(1)
})

it('should correctly run EventManager', async () => {
  const eachMessage = stream.eachMessage(worker)
  eachMessage({
    topic: 'wem-start-process',
    partition: 1,
    message: {
      value:
        '{"process_name": "TEST_PROCESS", "process_input": {"TEST": "DATA"} }',
    },
  } as unknown as EachMessagePayload)
  expect(makeAuthenticatedRequestMock).toHaveBeenCalledTimes(1)
})
