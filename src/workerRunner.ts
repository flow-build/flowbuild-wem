import { StreamInterface } from '@stream'
import { createLogger } from '@utils'
import { envs } from '@configs/env'
import { EventManager, fetchTargetTopics } from '@event-manager'

async function runWorker() {
  createLogger('info')

  const { topicConfig, startTopicMap, continueTopicMap } =
    await fetchTargetTopics()

  let streamConfig = envs.STREAM_CONFIG
  if (Object.keys(topicConfig).length) {
    streamConfig = { topics: { ...topicConfig, ...envs.STREAM_CONFIG.topics } }
  }

  const streamInterface = new StreamInterface(streamConfig)
  const eventManager = new EventManager(startTopicMap, continueTopicMap)

  EventManager.stream = streamInterface

  await streamInterface.connect(eventManager)
  streamInterface.setConsumer(eventManager)

  return { stream: streamInterface, eventManager }
}

export { runWorker }
