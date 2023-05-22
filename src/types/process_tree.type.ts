import { LooseObject } from './LooseObject.type'

export type TreeItem = {
  process_id: string
  wasStartedBy?: Array<LooseObject>
  started?: Array<LooseObject>
  continued?: Array<LooseObject>
}
