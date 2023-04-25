import { StreamInterface } from '@stream'
import { Requester } from './requester'
import { envs } from '@/configs/env'
import {
  BaseMessage,
  ContinueProcessMessage,
  LooseObject,
  StartProcessMessage,
  TopicCreationInput,
  Workflow,
} from '@common-types'
import { identifyTarget } from '@/utils'
import { RedisClient } from '@/redis'

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

  private wemId: string
  private requester: Requester
  private redis: RedisClient

  constructor(wemId: string) {
    this.wemId = wemId
    this.redis = new RedisClient()
    this.requester = new Requester(this.wemId)
    if (EventManager.instance) {
      return EventManager.instance
    }
    EventManager.instance = this
    return this
  }

  async connectToStartTopic(input: TopicCreationInput) {
    const definition = input.event?.definition || ''
    if (definition) {
      const topicName = `WORKFLOW_EVENT-${definition}`
      const topics = await EventManager.stream.readTopics()
      await EventManager.stream.shutDown()
      await EventManager.stream.connect(this)
      const workflowEventsTopics = topics?.filter((t: string) =>
        t.includes('WORKFLOW_EVENT-')
      )
      await EventManager.stream.subscribe([
        ...(workflowEventsTopics || []),
        topicName,
      ])
      EventManager.stream.setConsumer(this)
      await this.redis.set(
        `start-topics:${topicName}`,
        JSON.stringify({
          ...input,
          topic: topicName,
        })
      )
    }
  }

  async connectToContinueTopic(input: TopicCreationInput) {
    const definition = input.event?.definition || ''
    if (definition) {
      const topicName = `WORKFLOW_EVENT-${definition}`
      const topics = await EventManager.stream.readTopics()
      await EventManager.stream.shutDown()
      await EventManager.stream.connect(this)
      const workflowEventsTopics = topics?.filter((t: string) =>
        t.includes('WORKFLOW_EVENT-')
      )
      await EventManager.stream.subscribe([
        ...(workflowEventsTopics || []),
        topicName,
      ])
      EventManager.stream.setConsumer(this)
      await this.redis.set(
        `continue-topics:${topicName}`,
        JSON.stringify({
          ...input,
          topic: topicName,
        })
      )
    }
  }

  async continueFSProcess(input: ContinueProcessMessage) {
    const { process_id, process_input } = input
    if (process_id) {
      const processData = await this.requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/cockpit/processes/${process_id}/state/run`,
        method: 'POST',
        body: process_input,
      })
      console.info(
        `[PROCESS CONTINUE RESPONSE] | [PID] ${process_id} | ${JSON.stringify(
          processData
        )}`
      )
      return processData
    }
  }

  async startFSProcess(input: StartProcessMessage) {
    const { workflow_name, workflow_version, process_input } = input

    let workflow = (await this.redis.get(
      `workflows:${workflow_name}:${workflow_version}`
    )) as Workflow
    if (!workflow) {
      workflow = (await this.requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow_name}`,
      })) as Workflow
      this.redis.set(
        `workflows:${workflow_name}:${workflow_version}`,
        JSON.stringify(workflow),
        { EX: 3600 }
      )
    }

    const { blueprint_spec } = workflow
    const [hasTarget] = identifyTarget(blueprint_spec)
    if (hasTarget) {
      const processData = await this.requester.makeAuthenticatedRequest({
        url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${workflow_name}/start`,
        method: 'POST',
        body: process_input,
      })
      console.info(
        `[PROCESS CREATION RESPONSE] | ${JSON.stringify(processData)}`
      )
      return processData
    }
  }

  async runProcessByTopic(topic: string, input: BaseMessage) {
    const start = (await this.redis.get(`start-topics:${topic}`)) as LooseObject
    if (start && start.name) {
      this.startFSProcess({
        ...input,
        workflow_name: start.name,
        workflow_version: start.version,
      })
    }

    const _continue = (await this.redis.get(
      `continue-topics:${topic}`
    )) as LooseObject
    if (_continue && input.process_id) {
      this.continueFSProcess(input)
    }
  }

  async runAction(topic: string, inputMessage: LooseObject) {
    console.info(
      `[EM-inputMessage] | TOPIC: ${topic} | INPUT: ${JSON.stringify(
        inputMessage
      )}`
    )

    try {
      if (topic.includes('wem.process.start')) {
        await this.startFSProcess(inputMessage as StartProcessMessage)
      } else if (topic.includes('wem.workflow.target.create')) {
        await this.connectToStartTopic(inputMessage as TopicCreationInput)
      } else if (topic.includes('wem.process.target.create')) {
        await this.connectToContinueTopic(inputMessage as TopicCreationInput)
      } else if (topic.includes('WORKFLOW_EVENT-')) {
        await this.runProcessByTopic(topic, inputMessage as BaseMessage)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export { EventManager }
