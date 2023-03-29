import { LooseObject } from './LooseObject.type'

export type StartProcessMessage = {
  workflow_name: string
  process_input: LooseObject
}
