import { LooseObject } from './LooseObject.type'

export type BaseMessage = {
  process_input: LooseObject
  target_process_id?: string
  trigger_process_id?: string
  workflow_name?: string
}

export type StartProcessMessage = {
  target_process_id?: string
  trigger_process_id?: string
  workflow_name: string
  workflow_version: number
  process_input: LooseObject
}

export type ContinueProcessMessage = {
  target_process_id?: string
  trigger_process_id?: string
  process_input: LooseObject
  workflow_name?: string
}

export type StartProcessResponse = {
  process_id: string
}
