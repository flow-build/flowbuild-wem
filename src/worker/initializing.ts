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

  const targets = detailedWorkflows.map((workflow: Workflow) => {
    const {
      blueprint_spec: { nodes },
    } = workflow
    return nodes.reduce(
      (acc: LooseObject, node: Node) => {
        const events = node?.parameters?.events || []
        if (events.length) {
          const targetEvent = events.find(
            (e: LooseObject) => e.category === 'signal' && e.family === 'target'
          )
          if (targetEvent) {
            if (node.type === 'start') {
              acc.startEvents.push(targetEvent.definition)
              return acc
            }
            acc.continueEvents.push(targetEvent.definition)
            return acc
          }
        }
        return acc
      },
      {
        startEvents: [],
        continueEvents: [],
      }
    )
  })
  // Done like this in case it's necessary to separate topics by 'start' or 'continue' later

  return targets.reduce((acc: LooseObject, target: LooseObject) => {
    for (const startEvent of target.startEvents) {
      acc[startEvent] = {
        consumesFrom: [envs.STREAM_INTERFACE],
      }
    }
    for (const continueEvent of target.continueEvents) {
      acc[continueEvent] = {
        consumesFrom: [envs.STREAM_INTERFACE],
      }
    }
    return acc
  }, {})
}

export { fetchTargetTopics }
