import { envs } from '@/configs/env'
import { Requester } from './requester'
import { Workflow, Node, LooseObject } from '@/types'

async function fetchTargetTopics() {
  const requester = new Requester()

  const workflows = await requester.makeAuthenticatedRequest({
    url: `${envs.FLOWBUILD_SERVER_URL}/workflows`,
  })

  const detailedWorkflows = await Promise.all(
    workflows.map((workflow: Workflow) => {
      return requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow.name}`,
      })
    })
  )

  return detailedWorkflows.reduce(
    (acc: LooseObject, workflow: Workflow) => {
      const {
        blueprint_spec: { nodes },
      } = workflow
      nodes.forEach((node: Node) => {
        const events = node?.parameters?.events || []
        if (events.length) {
          const targetEvent = events.find(
            (e: LooseObject) => e.category === 'signal' && e.family === 'target'
          )
          if (targetEvent) {
            const { definition } = targetEvent
            const topicName = `WORKFLOW_EVENT-${definition}`
            acc.topicConfig[topicName] = {
              consumesFrom: [envs.STREAM_INTERFACE],
            }
            if (node.type.toLowerCase() === 'start') {
              acc.startTopicMap[topicName] = {
                workflow_name: workflow.name,
                version: workflow.version,
              }
            }
            acc.continueTopicMap[topicName] = {
              workflow_name: workflow.name,
              version: workflow.version,
            }
          }
        }
      })
      return acc
    },
    {
      startTopicMap: {},
      continueTopicMap: {},
      topicConfig: {},
    }
  )
}

export { fetchTargetTopics }
