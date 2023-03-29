jest.mock('kafkajs', () => {
  return {}
})

jest.mock('bullmq', () => {
  return {
    Queue: class TestQueue { },
    Worker: class TestWorker { },
  }
})

const axiosMock = jest.fn(async ({ url }) => {
  if (url.includes('/token')) {
    return { data: { jwtToken: 'TEST_TOKEN' } }
  }
  if (url.includes('/start')) {
    return { data: { process_id: 'TEST_PROCESS_ID' } }
  }
  return {
    data: {
      "workflow_id": "TEST_WORKFLOW_ID",
      "name": "TEST BP",
      "description": "blueprint for testing",
      "blueprint_spec": {
        "lanes": [
          {
            "id": "1",
            "name": "the_only_lane",
            "rule": [
              "fn",
              [
                "&",
                "args"
              ],
              true
            ]
          }
        ],
        "nodes": [
          {
            "id": "START",
            "name": "Start node",
            "next": "END",
            "type": "Start",
            "category": "signal",
            "lane_id": "1",
            "parameters": {
              "signal": "TEST_DEFINITION",
              "input_schema": {}
            }
          },
          {
            "id": "END",
            "name": "Finish node",
            "next": null,
            "type": "Finish",
            "lane_id": "1"
          }
        ],
        "prepare": [],
        "environment": {},
        "requirements": [
          "core"
        ]
      }
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