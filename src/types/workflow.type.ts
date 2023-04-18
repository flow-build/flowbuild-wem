/* eslint-disable @typescript-eslint/no-explicit-any */
export type WfEvent = {
  category: string
  family: string
  definition: string
}

export type Lane = {
  id: string
  roles: Array<string>
  visibility?: Array<string>
}

export type Expire = {
  timeout: number
}

export type Node = {
  id: string
  name: string
  next: string
  type: string
  category: string
  lane_id: string
  extract: Array<string>
  parameters: {
    [key: string]: any
    events: Array<WfEvent>
  }
}

export type Blueprint = {
  nodes: Array<Node>
  lanes: Array<Lane>
  expire?: Expire
  environment: { [key: string]: string }
}

export type HistoryCache = {
  ttl: number
}

export type WorkflowSchedule = {
  enabled: boolean
  required_roles: Array<string>
}

export type Workflow = {
  name: string
  version: number
  description: string
  blueprint_spec: Blueprint
  history_cache?: HistoryCache
  schedule?: WorkflowSchedule
}
