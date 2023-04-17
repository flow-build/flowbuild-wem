import { StreamInterface } from '@stream'
import { Requester } from './requester'
import { envs } from '@/configs/env'
import {
  BaseMessage,
  ContinueProcessMessage,
  LooseObject,
  StartProcessMessage,
  TopicCreationInput,
  TopicMap,
  Workflow,
} from '@common-types'
import { identifyTarget } from '@/utils'

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
  private startTopicMap: { [key: string]: TopicMap }
  private continueTopicMap: { [key: string]: TopicMap }

  constructor(startTopicMap: LooseObject, continueTopicMap: LooseObject) {
    this.startTopicMap = startTopicMap
    this.continueTopicMap = continueTopicMap
    this.requester = new Requester()
    if (EventManager.instance) {
      return EventManager.instance
    }
    EventManager.instance = this
    return this
  }

  async connectToTopic(input: TopicCreationInput) {
    const {
      name: workflow_name,
      event: { definition },
    } = input
    await EventManager.stream.shutDown()
    await EventManager.stream.connect(this)
    await EventManager.stream.subscribe([definition])
    EventManager.stream.setConsumer(this)
    this.startTopicMap[definition] = {
      workflow_name,
    }
  }

  async continueFSProcess(input: ContinueProcessMessage) {
    const { process_id, process_input } = input
    if (process_id) {
      const processData = await this.requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/processes/${process_id}/run`,
        method: 'POST',
        body: process_input,
      })
      console.info('PROCESS CONTINUE RESPONSE => ', processData)
      return processData
    }
  }

  async startFSProcess(input: StartProcessMessage) {
    const { workflow_name, process_input } = input

    const workflow = (await this.requester.makeAuthenticatedRequest({
      url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow_name}`,
    })) as Workflow
    const { blueprint_spec } = workflow
    const [hasTarget] = identifyTarget(blueprint_spec)
    if (hasTarget) {
      const processData = await this.requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow_name}/start`,
        method: 'POST',
        body: process_input,
      })
      console.info('PROCESS CREATION RESPONSE => ', processData)
      return processData
    }
  }

  async startProcessByTopic(topic: string, input: BaseMessage) {
    const start = this.startTopicMap[topic]
    if (start && start.workflow_name) {
      this.startFSProcess({ ...input, workflow_name: start.workflow_name })
    }

    const _continue = this.continueTopicMap[topic]
    if (_continue && _continue.workflow_name) {
      this.continueFSProcess({
        ...input,
        workflow_name: _continue.workflow_name,
      })
    }
  }

  async runAction(topic: string, inputMessage: LooseObject) {
    console.info('inputMessage at EM: ', inputMessage)

    try {
      if (topic === 'wem-start-process') {
        this.startFSProcess(inputMessage as StartProcessMessage)
      } else if (topic.includes('workflow.create')) {
        this.connectToTopic(inputMessage as TopicCreationInput)
      } else {
        this.startProcessByTopic(topic, inputMessage as BaseMessage)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export { EventManager }
