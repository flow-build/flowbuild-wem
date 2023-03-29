import { StreamInterface } from '@stream'
import { Requester } from './requester'
import { envs } from '@/configs/env'
import { LooseObject, StartProcessMessage, Workflow, Node } from '@common-types'

class EventManager {
  static _instance: EventManager
  static _stream: StreamInterface

  static get instance(): EventManager {
    return EventManager._instance
  }

  static set instance(instance: EventManager) {
    EventManager._instance = instance
  }

  static get stream(): StreamInterface {
    return EventManager._stream
  }

  static set stream(producer: StreamInterface) {
    EventManager._stream = producer
  }

  private requester: Requester

  constructor() {
    this.requester = new Requester()
    if (EventManager.instance) {
      return EventManager.instance
    }
    EventManager.instance = this
    return this
  }

  async validateWorkflowTarget(workflow_name: string) {
    const workflow = (await this.requester.makeAuthenticatedRequest({
      url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow_name}`,
      method: 'GET',
    })) as Workflow
    const {
      blueprint_spec: { nodes },
    } = workflow
    const startTargetNode = nodes.find(
      (node: Node) =>
        node.type.toLowerCase() === 'start' &&
        node.category &&
        node.category === 'signal'
    )
    if (startTargetNode) {
      return true
    }
    return false
  }

  async startFSProcess(input: StartProcessMessage) {
    const { workflow_name, process_input } = input
    const isValidTarget = await this.validateWorkflowTarget(workflow_name)
    if (isValidTarget) {
      const processData = await this.requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow_name}/start`,
        method: 'POST',
        body: process_input,
      })
      console.info('PROCESS CREATION RESPONSE => ', processData)
      return processData
    }
    console.info('PROCESS NOT SET AS VALID TARGET => ', workflow_name)
  }

  async runAction(topic: string, inputMessage: LooseObject) {
    console.info('inputMessage at EM: ', inputMessage)

    try {
      if (topic === 'wem-start-process') {
        this.startFSProcess(inputMessage as StartProcessMessage)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export { EventManager }
