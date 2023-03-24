export enum States {
  UNSTARTED = 'unstarted',
  RUNNING = 'running',
  EXPIRED = 'expired',
  WAITING = 'waiting',
  PENDING = 'pending',
  FINISHED = 'finished',
  ERROR = 'error',
}

export type ProcessState = {
  node_id: string
  bag: { [key: string]: string }
  external_input: { [key: string]: string }
  result: { [key: string]: string }
  error: { [key: string]: string } | string
  status: States
  next_node_id: string
  time_elapsed: number
}
