import { StreamInterface } from '@stream'
import { NodeResultMessage } from '@/stream/types'
// import { LooseObject } from '@common-types'

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

  constructor() {
    if (EventManager.instance) {
      return EventManager.instance
    }
    EventManager.instance = this
    return this
  }

  async runAction(topic: string, inputMessage: NodeResultMessage) {
    console.log(topic, ': ', inputMessage)
  }
}

export { EventManager }
