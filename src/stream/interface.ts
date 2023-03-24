import { Consumer, EachMessagePayload, Producer } from 'kafkajs'
import { LooseObject } from '@/types'
import { EventManager } from '@/worker'
import { log } from '@/utils'
import { connectKafka, setClient } from '@stream/kafka'
import { flowbuildQueues, setFlowbuildWorkers, setQueues } from './bullmq'
import { Job } from 'bullmq'

class StreamInterface {
  private _topics: LooseObject
  private _streams: LooseObject
  private _producer?: Producer
  private _consumer?: Consumer

  constructor(configs: LooseObject) {
    const { topics } = configs
    this._topics = topics
    this._streams = Object.entries(topics).reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: LooseObject, [topic, value]: [topic: string, value: any]) => {
        let relation: string, streams: Array<string>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for ([relation, streams] of Object.entries(value) as unknown as any) {
          for (const stream of streams) {
            acc[stream][relation].push(topic)
          }
        }
        return acc
      },
      {
        kafka: {
          consumesFrom: [],
          producesTo: [],
        },
        bullmq: {
          consumesFrom: [],
          producesTo: [],
        },
      }
    )
  }

  async connect(orchestrator: EventManager) {
    const kafkaTopics = this._streams['kafka']
    if (kafkaTopics.consumesFrom.length || kafkaTopics.producesTo.length) {
      setClient()
      const { consumer, producer } = await connectKafka(kafkaTopics)
      this._producer = producer
      this._consumer = consumer
    }

    const bullmqTopics = this._streams['bullmq']
    if (bullmqTopics) {
      const { consumesFrom, producesTo } = bullmqTopics
      if (consumesFrom.length) {
        for (const topic of bullmqTopics.consumesFrom)
          setFlowbuildWorkers(topic, this.bullCB(orchestrator))
      }

      if (producesTo.length) {
        setQueues(bullmqTopics.producesTo)
      }
    }

    return this
  }

  async produce({ topic, message }: { topic: string; message: LooseObject }) {
    const topicConfig = this._topics[topic]
    const { producesTo } = topicConfig

    if (producesTo.includes('kafka')) {
      await this._producer?.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      })
      return true
    }

    if (producesTo.includes('bullmq')) {
      const queue = flowbuildQueues[topic]
      if (queue) {
        await queue.add(topic, JSON.stringify(message), {
          removeOnComplete: true,
        })
        return true
      }
      return false
    }
  }

  async setConsumer(orchestrator: EventManager) {
    const kafkaTopics = this._streams['kafka']
    if (kafkaTopics && kafkaTopics.consumesFrom) {
      await this._consumer?.run({
        eachMessage: this.eachMessage(orchestrator),
      })
    }

    // BullMQ unecessary here
    // const bullmqTopics = this._streams['bullmq']
    // if (bullmqTopics && bullmqTopics.consumesFrom) {
    // }
  }

  // Kafka consumer cb
  eachMessage(orchestrator: EventManager) {
    return async ({ topic, partition, message }: EachMessagePayload) => {
      const receivedMessage = message.value?.toString() || ''

      log({
        level: 'info',
        message: `Message received on EventManager.connect -> ${JSON.stringify({
          partition,
          offset: message.offset,
          value: receivedMessage,
        })}`,
      })

      try {
        const inputMessage = JSON.parse(receivedMessage)
        orchestrator.runAction(topic, inputMessage)
      } catch (err) {
        console.error(err)
      }
    }
  }

  // BullMQ consumer cb
  bullCB(orchestrator: EventManager) {
    return async (job: Job) => {
      const receivedMessage = job.data
      console.log('job.name: ', job.name)

      log({
        level: 'info',
        message: `Message received on EventManager.connect -> ${JSON.stringify({
          value: receivedMessage,
        })}`,
      })

      try {
        const inputMessage = JSON.parse(receivedMessage)
        orchestrator.runAction(job.name, inputMessage)
      } catch (err) {
        console.error(err)
      }
    }
  }
}

export { StreamInterface }
