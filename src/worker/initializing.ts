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
        const event = node?.parameters || {}
        const startTarget = event.target
        if ((event.family && event.definition) || startTarget) {
          const definition = event.definition || startTarget.definition
          const topicName = `WORKFLOW_EVENT-${definition}`
          acc.topicConfig[topicName] = {
            consumesFrom: [envs.STREAM_INTERFACE],
          }
          if (node.type.toLowerCase() === 'start') {
            acc.startTopics[`start-topics:${topicName}`] = {
              topic: topicName,
              workflow_id: workflow.id,
              name: workflow.name,
              event,
              version: workflow.version,
            }
            return
          }
          acc.continueTopics[`continue-topics:${topicName}`] = {
            topic: topicName,
            workflow_id: workflow.id,
            name: workflow.name,
            event,
            version: workflow.version,
          }
          return
        }
      })
      return acc
    },
    {
      startTopics: {},
      continueTopics: {},
      topicConfig: {},
    }
  )
}

export { fetchTargetTopics }
