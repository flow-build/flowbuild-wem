import { LooseObject, TreeItem } from '@/types'
import { FastifyRedis } from '@fastify/redis'

const buildFromTrigger = async (
  redis: FastifyRedis,
  process_id: string
): Promise<TreeItem> => {
  const triggerKeys = (await redis.keys(
    `resolved_triggers:${process_id}:*`
  )) as Array<string>
  if (triggerKeys.length) {
    const stringTargets = (await redis.mget(triggerKeys)) as Array<string>
    const targets = stringTargets.reduce(
      (acc: LooseObject, stringTarget: string) => {
        const target = JSON.parse(stringTarget)
        if (target.category === 'start') {
          for (const eventTarget of target.targets) {
            acc.started.push({
              definition: target.definition,
              process_id: eventTarget.process_id,
            })
          }
          return acc
        }
        for (const eventTarget of target.targets) {
          acc.continued.push({
            definition: target.definition,
            process_id: eventTarget.process_id,
          })
        }
        return acc
      },
      {
        started: [],
        continued: [],
      }
    )
    return {
      ...targets,
      process_id,
    } as TreeItem
  }
  return { process_id, started: [], continued: [] }
}

const buildFromTarget = async (
  redis: FastifyRedis,
  process_id: string
): Promise<TreeItem> => {
  const targetKeys = (await redis.keys(
    `resolved_targets:${process_id}:*`
  )) as Array<string>
  if (targetKeys.length) {
    const stringTriggers = (await redis.mget(targetKeys)) as Array<string>
    const triggers = stringTriggers.reduce(
      (acc: LooseObject, stringTrigger: string) => {
        const trigger = JSON.parse(stringTrigger)
        if (trigger.category === 'start') {
          acc.wasStartedBy.push({
            process_id: trigger.trigger_process_id,
            definition: trigger.definition,
          })
          return acc
        }
        return acc
      },
      { wasStartedBy: [], wasContinuedBy: [] }
    )
    return {
      ...triggers,
      process_id,
    } as TreeItem
  }
  return { process_id, wasStartedBy: [] }
}

export const buildTreeFromProcessId = async (
  redis: FastifyRedis,
  process_id: string
) => {
  const buildUp = await buildFromTarget(redis, process_id)
  const buildDown = await buildFromTrigger(redis, process_id)
  const response = {
    ...buildUp,
    ...buildDown,
    process_id,
  } as TreeItem
  const { started } = response
  if (started && started.length) {
    const downTree = await Promise.all(
      started.map((st) => {
        return buildTreeFromProcessId(redis, st.process_id)
      })
    )
    response.started = downTree
  }
  return response
}
