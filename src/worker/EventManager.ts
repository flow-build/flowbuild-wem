import { StreamInterface } from '@stream'
import { Requester } from './requester'
import { envs } from '@/configs/env'
import { LooseObject } from '@common-types'

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

  async startFSProcess(input: LooseObject) {
    const { process_name, process_input } = input
    await this.requester.makeAuthenticatedRequest({
      url: `${envs.FLOWBUILD_SERVER_URL}/workflows/name/${process_name}/start`,
      body: process_input,
    })
  }

  async runAction(topic: string, inputMessage: LooseObject) {
    if (topic === 'wem-start-process') {
      this.startFSProcess(inputMessage)
    }
  }
}

export { EventManager }
