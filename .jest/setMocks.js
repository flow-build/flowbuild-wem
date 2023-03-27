jest.mock('kafkajs', () => {
  return {}
})

jest.mock('bullmq', () => {
  return {
    Queue: class TestQueue { },
    Worker: class TestWorker { },
  }
})

const axiosMock = jest.fn(({ url }) => {
  if (url.includes('/token')) {
    return { data: { jwtToken: 'testToken' } }
  }
  return {
    data: {
      process_id: 'TEST_PROCESS_ID'
    }
  }
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

module.exports = {
  axiosMock
}