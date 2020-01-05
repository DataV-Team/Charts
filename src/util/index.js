import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

export function filterNonNumber (array) {
  return array.filter(n => typeof n === 'number')
}

export function deepMerge (target, merged) {
  for (var key in merged) {
    if (target[key] && typeof target[key] === 'object') {
      deepMerge(target[key], merged[key])

      continue
    }

    if (typeof merged[key] === 'object') {
      target[key] = deepClone(merged[key], true)

      continue
    }

    target[key] = merged[key]
  }

  return target
}

export function mulAdd (nums) {
  nums = filterNonNumber(nums)

  return nums.reduce((all, num) => all + num, 0)
}

export function mergeSameStackData (item, series) {
  const stack = item.stack

  if (!stack) return [...item.data]

  const stacks = series.filter(({ stack: s }) => s === stack)

  const index = stacks.findIndex(({ data: d }) => d === item.data)

  const datas = stacks.splice(0, index + 1).map(({ data }) => data)

  const dataLength = datas[0].length

  return new Array(dataLength)
    .fill(0)
    .map((foo, i) => mulAdd(datas.map(d => d[i])))
}

export function getTwoPointDistance (pointOne, pointTwo) {
  const minusX = Math.abs(pointOne[0] - pointTwo[0])

  const minusY = Math.abs(pointOne[1] - pointTwo[1])

  return Math.sqrt(minusX * minusX + minusY * minusY)
}

export function getLinearGradientColor (ctx, begin, end, color) {
  if (!ctx || !begin || !end || !color.length) return

  let colors = color

  typeof colors === 'string' && (colors = [color, color])

  const linearGradientColor = ctx.createLinearGradient(...begin, ...end)

  const colorGap = 1 / (colors.length - 1)

  colors.forEach((c, i) => linearGradientColor.addColorStop(colorGap * i, c))

  return linearGradientColor
}

export function getPolylineLength (points) {
  const lineSegments = new Array(points.length - 1)
    .fill(0)
    .map((foo, i) => [points[i], points[i + 1]])

  const lengths = lineSegments.map(item => getTwoPointDistance(...item))

  return mulAdd(lengths)
}

export function getPointToLineDistance (point, linePointOne, linePointTwo) {
  const a = getTwoPointDistance(point, linePointOne)
  const b = getTwoPointDistance(point, linePointTwo)
  const c = getTwoPointDistance(linePointOne, linePointTwo)

  return 0.5 * Math.sqrt((a + b + c) * (a + b - c) * (a + c - b) * (b + c - a)) / c
}

export function initNeedSeries (series, config, type) {
  series = series.filter(({ type: st }) => st === type)

  series = series.map(item => deepMerge(deepClone(config, true), item))

  return series.filter(({ show }) => show)
}

export function radianToAngle (radian) {
  return radian / Math.PI * 180
}