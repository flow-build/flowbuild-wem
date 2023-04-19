import { createClient, RedisClientType, SetOptions } from 'redis'
import { envs } from '@configs/env'
import { LooseObject } from '@common-types'

class RedisClient {
  static _instance: RedisClient

  static get instance(): RedisClient {
    return RedisClient._instance
  }

  static set instance(instance: RedisClient) {
    RedisClient._instance = instance
  }

  private _client: RedisClientType = createClient({
    socket: {
      host: `${envs.REDIS_HOST || 'localhost'}`,
      port: parseInt(envs.REDIS_PORT || '6379', 10),
    },
    password: envs.REDIS_PASSWORD,
  })

  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance
    }

    this._client.connect()
    this._client.on('error', (err) => console.error('Redis Client Error', err))

    this.setClients()

    // for reference:
    // await client.disconnect()

    RedisClient.instance = this
    return this
  }

  async setClients() {
    await this._client.select(7)
  }

  async get(key: string): Promise<LooseObject | string> {
    const data = (await this._client.get(key)) as string
    try {
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  }

  async set(key: string, value: string, options?: SetOptions) {
    if (options?.EX) {
      return await this._client.setEx(key, options.EX, value)
    }
    return await this._client.set(key, value)
  }

  async mSet(values: LooseObject) {
    const array = []
    for (const [key, value] of Object.entries(values)) {
      array.push(key)
      array.push(value)
      await this._client.set(key, JSON.stringify(value))
    }
  }

  async del(key: string) {
    return await this._client.del(key)
  }
}

export { RedisClient }
