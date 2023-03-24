import { LooseObject, Workflow } from '@common-types'
import { ProcessState } from './process_state.type'

export type ProcessHistory = {
  workflow_name: string
  executing: string
  bag: { [key: string]: string }
  states: Array<ProcessState>
  status: string
}

export type ProcessData = {
  process_id?: string
  workflow: Workflow
  history?: ProcessHistory
  bag?: LooseObject
}
