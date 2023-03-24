jest.mock('@redis', () => {
  const redisMap = {}
  return {
    RedisClient: class RedisClient {
      get(key) {
        return redisMap[key]
      }
      set(key, value, opts) {
        redisMap[key] = value
        return 1
      }
    }
  }
})

jest.mock('redis', () => {
  return {}
})

jest.mock('kafkajs', () => {
  return {}
})

jest.mock('bullmq', () => {
  return {
    Queue: class TestQueue { },
    Worker: class TestWorker { },
  }
})

jest.mock('@utils/logger', () => {
  return {
    createLogger: () => { return },
    log: () => { return }
  }
})