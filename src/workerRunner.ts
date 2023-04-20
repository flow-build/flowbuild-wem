import { StreamInterface } from '@stream'
import { createLogger } from '@utils'
import { envs } from '@configs/env'
import { EventManager, fetchTargetTopics } from '@event-manager'
import { RedisClient } from './redis'

async function runWorker() {
  createLogger('info')

  const { topicConfig, startTopics, continueTopics } = await fetchTargetTopics()

  const redis = new RedisClient()
  await redis.mSet(startTopics)
  await redis.mSet(continueTopics)

  let streamConfig = envs.STREAM_CONFIG
  if (Object.keys(topicConfig).length) {
    streamConfig = { topics: { ...topicConfig, ...envs.STREAM_CONFIG.topics } }
  }

  const streamInterface = new StreamInterface(streamConfig)
  const eventManager = new EventManager()

  EventManager.stream = streamInterface

  await streamInterface.connect(eventManager)
  streamInterface.setConsumer(eventManager)

  return { stream: streamInterface, eventManager }
}

export { runWorker }
