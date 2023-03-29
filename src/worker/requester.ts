import axios from 'axios'
import NodeCache from 'node-cache'
import { envs } from '@/configs/env'
import { LooseObject } from '@/types'

const in_memory_cache = new NodeCache()

class Requester {
  async getToken() {
    const cachedToken = await in_memory_cache.get('FS_TOKEN')
    if (!cachedToken) {
      const { data } = await axios({
        url: `${envs.FLOWBUILD_SERVER_URL}/token`,
        method: 'POST',
        headers: {
          'x-duration': envs.FS_TOKEN_EXPIRE,
        },
      })
      const { jwtToken } = data as LooseObject
      in_memory_cache.set('FS_TOKEN', jwtToken, envs.FS_TOKEN_EXPIRE - 30)
      return jwtToken
    }

    return cachedToken
  }

  async makeRequest({
    url,
    body,
    headers,
    method,
  }: {
    url: string
    body?: LooseObject
    headers?: LooseObject
    method?: string
  }) {
    const { data } = await axios({
      url,
      data: body,
      headers: headers,
      method,
    })
    return data
  }

  async makeAuthenticatedRequest({
    url,
    body,
    headers,
    method,
  }: {
    url: string
    body?: LooseObject
    headers?: LooseObject
    method?: string
  }) {
    const token = await this.getToken()

    return await this.makeRequest({
      url,
      body,
      method,
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    })
  }
}

export { Requester }
