import { StreamInterface } from '@stream'
import { createLogger } from '@utils'
import { EventManager, fetchTargetTopics } from '@event-manager'
import { envs } from '@configs/env'

async function main() {
  createLogger('info')

  const topics = await fetchTargetTopics()

  let streamConfig = envs.STREAM_CONFIG
  if (Object.keys(topics).length) {
    streamConfig = { topics }
  }

  const streamInterface = new StreamInterface(streamConfig)
  const eventManager = new EventManager()

  EventManager.stream = streamInterface

  await streamInterface.connect(eventManager)
  streamInterface.setConsumer(eventManager)
}

main()
