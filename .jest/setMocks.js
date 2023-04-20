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

module.exports = {
  axiosMock
}