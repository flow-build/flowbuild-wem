import { StreamInterface } from '@stream'
import { createLogger } from '@utils'
import { EventManager } from '@/worker'
import { envs } from '@configs/env'
// import { publishPrompt } from '.@utils'

async function main() {
  createLogger('info')
  const streamInterface = new StreamInterface(envs.STREAM_CONFIG)
  const eventManager = new EventManager()

  EventManager.stream = streamInterface

  await streamInterface.connect(eventManager)
  streamInterface.setConsumer(eventManager)

  // Prompt for manual testing:
  // publishPrompt(orchestrator_consumed_topics[1], producer)
}

main()
