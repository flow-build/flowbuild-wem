jest.mock('kafkajs', () => {
  return {}
})

jest.mock('bullmq', () => {
  return {
    Queue: class TestQueue { },
    Worker: class TestWorker { },
  }
})

jest.mock('@fastify/redis', () => {
  return (_f, _o, done) => {
    done()
  }
})

const axiosMock = jest.fn(({ url }) => {
  if (url.includes('/token')) {
    return { data: { jwtToken: 'testToken' } }
  }
  if (url.includes('/start')) {
    return {
      data: {
        process_id: 'TEST_PROCESS_ID'
      }
    }
  }
  if (url.includes('/workflows/name/TEST_TARGET')) {
    return {
      data: {
        blueprint_spec: {
          nodes: [{
            type: 'start',
            parameters: {
              events: [{
                category: 'signal',
                family: 'target'
              }]
            }
          }]
        }
      }
    }
  }
  return { data: {} }
})
jest.mock('axios', () => {
  return axiosMock
})

jest.mock('@utils/logger', () => {
  return {
    createLogger: () => { return },
    log: () => { return }
  }
})

let redisMap = {}

const mockRedis = {
  get: jest.fn(async (key) => redisMap[key]),
  mget: jest.fn(async (key) => Object.values(redisMap)),
  keys: jest.fn(async (key) => Object.keys(redisMap)),
  set: jest.fn(async (key, value, opts) => {
    redisMap[key] = value
    return 'OK'
  }),
  del: jest.fn(async (key) => delete redisMap[key]),
  delAll: jest.fn(async () => redisMap = {}),
}

module.exports = {
  axiosMock,
  mockRedis
}