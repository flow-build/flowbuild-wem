import { StreamInterface } from '@stream'
import { Requester } from './requester'
import { envs } from '@/configs/env'
import {
  BaseMessage,
  ContinueProcessMessage,
  LooseObject,
  StartProcessMessage,
  StartProcessResponse,
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
      let targets: Array<LooseObject> = [
        {
          topic: topicName,
          workflow_name: input.name,
          version: input.version,
        },
      ]
      const registeredTarget = (await this.redis.get(
        `start-topics:${definition}`
      )) as Array<LooseObject>
      if (registeredTarget) {
        targets = targets.concat(registeredTarget)
      }
      await this.redis.set(
        `start-topics:${definition}`,
        JSON.stringify(targets)
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
        `continue-topics:${definition}`,
        JSON.stringify({
          ...input,
          topic: topicName,
        })
      )
    }
  }

  async registerTriggerTargetRelation({
    trigger_process_id,
    target_processes,
    definition,
  }: {
    trigger_process_id?: string
    target_processes: Array<string>
    definition: string
  }) {
    const resolvedTargets = target_processes.map((process_id) => {
      return {
        process_id,
      }
    })
    let targets = resolvedTargets
    const registeredData = (await this.redis.get(
      `resolved_triggers:${definition}:${trigger_process_id}`
    )) as LooseObject
    if (registeredData) {
      targets = registeredData.targets.concat(resolvedTargets)
    }
    await this.redis.set(
      `resolved_triggers:${definition}:${trigger_process_id}`,
      JSON.stringify({
        trigger_process_id,
        definition,
        targets,
      })
    )

    await Promise.all(
      targets.map(async (target) => {
        await this.redis.set(
          `resolved_targets:${definition}:${target.process_id}`,
          JSON.stringify({
            trigger_process_id,
            definition,
          })
        )
      })
    )
  }

  async continueFSProcess(input: ContinueProcessMessage) {
    const { target_process_id, process_input } = input
    if (target_process_id) {
      try {
        const processData = await this.requester.makeAuthenticatedRequest({
          url: `${envs.FLOWBUILD_SERVER_URL}/cockpit/processes/${target_process_id}/state/run`,
          method: 'POST',
          body: process_input,
        })
        console.info(
          `[PROCESS CONTINUE RESPONSE] | [PID] ${target_process_id} | ${JSON.stringify(
            processData
          )}`
        )
        return processData
      } catch (e) {
        console.info(`[PID] ${target_process_id} | ERROR: ${e}`)
      }
    }
  }

  async startFSProcess(
    input: StartProcessMessage
  ): Promise<StartProcessResponse | undefined> {
    const { workflow_name, workflow_version, process_input } = input
    try {
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
    } catch (e) {
      console.info(`[WF] ${workflow_name}@v${workflow_version} | ERROR: ${e}`)
    }
  }

  async runProcessByTopic(topic: string, input: BaseMessage) {
    const { trigger_process_id } = input

    const start = (await this.redis.get(`start-topics:${topic}`)) as LooseObject
    if (start && start.length) {
      const startInput = start.map((s: LooseObject) => {
        return { ...s, ...input }
      })
      const responses = await Promise.all(
        startInput.map((input: StartProcessMessage) =>
          this.startFSProcess(input)
        )
      )
      if (responses.length) {
        await this.registerTriggerTargetRelation({
          definition: topic,
          trigger_process_id,
          target_processes: responses.map((response) => response.process_id),
        })
      }
    }

    const _continue = (await this.redis.get(
      `continue-topics:${topic}`
    )) as LooseObject
    const { target_process_id } = input
    if (_continue && target_process_id) {
      this.continueFSProcess(input)
      await this.registerTriggerTargetRelation({
        definition: topic,
        trigger_process_id,
        target_processes: [target_process_id],
      })
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
        const parsedTopic = topic.replace('WORKFLOW_EVENT-', '')
        await this.runProcessByTopic(parsedTopic, inputMessage as BaseMessage)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export { EventManager }
