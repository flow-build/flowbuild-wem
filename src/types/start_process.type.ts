import { LooseObject } from './LooseObject.type'

export type TopicMap = {
  workflow_name: string
  version: number
}

export type BaseMessage = {
  process_input: LooseObject
  process_id?: string
  workflow_name?: string
}

export type StartProcessMessage = {
  workflow_name: string
  process_input: LooseObject
}

export type ContinueProcessMessage = {
  process_id?: string
  process_input: LooseObject
  workflow_name?: string
}
