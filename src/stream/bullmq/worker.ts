import { Job, Queue, Worker } from 'bullmq'
import { envs } from '@configs/env'

const connection = {
  host: envs.REDIS_HOST || 'localhost',
  port: parseInt(envs.REDIS_PORT || '6379', 10),
  password: envs.REDIS_PASSWORD || 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
  db: 4,
}

const flowbuildQueues: { [key: string]: Queue } = {}
const setQueues = (queues: string) => {
  for (const queue of queues) {
    flowbuildQueues[queue] = new Queue(queue, {
      connection,
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setFlowbuildWorkers = (queue: string, cb: (job: Job) => Promise<any>) => {
  new Worker(queue, cb, { connection })
}

export { connection, flowbuildQueues, setQueues, setFlowbuildWorkers }
