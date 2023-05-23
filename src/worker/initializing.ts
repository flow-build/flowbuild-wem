import { envs } from '@/configs/env'
import { Requester } from './requester'
import { Workflow, Node, LooseObject } from '@/types'

async function fetchTargetTopics(wemId: string) {
  const requester = new Requester(wemId)

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
            const topics = acc.startTopics[`start-topics:${definition}`]
            const topicConfig = {
              topic: topicName,
              workflow_id: workflow.id,
              workflow_name: workflow.name,
              event,
              workflow_version: workflow.version,
            }
            if (topics && topics.length) {
              acc.startTopics[`start-topics:${definition}`].push(topicConfig)
            } else {
              acc.startTopics[`start-topics:${definition}`] = [topicConfig]
            }
            return
          }
          if (event.family === 'target') {
            acc.continueTopics[`continue-topics:${definition}`] = {
              topic: topicName,
              workflow_id: workflow.id,
              workflow_name: workflow.name,
              event,
              workflow_version: workflow.version,
            }
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
