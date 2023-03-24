/* eslint-disable @typescript-eslint/no-explicit-any */
import { LooseObject } from '@common-types'

const get = (object: LooseObject, path: string | Array<string>): any => {
  const _path = Array.isArray(path) ? path : path.split('.')
  if (object && _path.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return get(object[_path.shift()!], _path)
  }
  return object
}

export { get }
