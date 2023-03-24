/* eslint-disable @typescript-eslint/no-explicit-any */
import { LooseObject } from '@common-types'

const set = (obj: LooseObject, path: any, value: any) => {
  if (Object(obj) !== obj) return obj
  if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
  path
    .slice(0, -1)
    .reduce(
      (a: LooseObject, c: string, i: number) =>
        Object(a[c]) === a[c]
          ? a[c]
          : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
      obj
    )[path[path.length - 1]] = value
  return obj
}

export { set }
