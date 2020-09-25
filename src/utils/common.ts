export { deepClone } from '@jiaminghi/c-render/es/utils/common'

import { deepClone } from '@jiaminghi/c-render/es/utils/common'

export function deepMerge<T1, T2>(target: T1, merged: T2): T1 & T2 {
  for (const key in merged) {
    // eslint-disable-next-line
    if ((target as any)[key] && typeof (target as any)[key] === 'object') {
      // eslint-disable-next-line
      deepMerge((target as any)[key], merged[key]!)

      continue
    }

    if (typeof merged[key] === 'object') {
      // eslint-disable-next-line
      ;(target as any)[key] = deepClone(merged[key])!

      continue
    }

    // eslint-disable-next-line
    ;(target as any)[key] = merged[key]!
  }

  return target as T1 & T2
}

// eslint-disable-next-line
export function isBoolean(_: any): boolean {
  return typeof _ === 'boolean'
}

// eslint-disable-next-line
export function isNumber(_: any): boolean {
  return typeof _ === 'number'
}

// eslint-disable-next-line
export function filterNonNumber(array: any[]): number[] {
  return array.filter(n => typeof n === 'number') as number[]
}

// eslint-disable-next-line
export function mulAdd(nums: any[]): number {
  nums = filterNonNumber(nums)

  return nums.reduce((all, num) => all + num, 0)
}
