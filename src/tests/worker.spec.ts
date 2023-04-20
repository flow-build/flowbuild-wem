/* eslint-disable @typescript-eslint/no-var-requires*/
import { EventManager } from '@event-manager'
import { StreamInterface } from '@/stream'
import { createLogger } from '@utils'
import { envs } from '@configs/env'

const { axiosMock } = require('../../.jest/setMocks')

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

let stream: StreamInterface
let worker: EventManager

beforeAll(async () => {
  createLogger('test')
  worker = new EventManager({}, {})
  stream = new StreamInterface(envs.STREAM_CONFIG)
  EventManager.stream = stream
  await stream.connect(worker)
})

it('should correctly RUN consumer connection', async () => {
  await stream.setConsumer(worker)
  expect(consumerMock.run).toHaveBeenCalledTimes(1)
})

it('should correctly run EventManager', async () => {
  await worker.runAction('wem-start-process', {
    workflow_name: 'TEST_TARGET',
    process_input: { TEST: 'DATA' },
  })
  expect(axiosMock).toHaveBeenCalled()
})
