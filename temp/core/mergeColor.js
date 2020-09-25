import { colorConfig } from '../config'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import { deepMerge } from '../util'

export function mergeColor (chart, option = {}) {
  const defaultColor = deepClone(colorConfig, true)

  let { color, series } = option

  if (!series) series = []

  if (!color) color = []

  option.color = color = deepMerge(defaultColor, color)

  if (!series.length) return

  const colorNum = color.length

  series.forEach((item, i) => {
    if (item.color) return

    item.color = color[i % colorNum]
  })

  const pies = series.filter(({ type }) => type === 'pie')

  pies.forEach(pie => pie.data.forEach((di, i) => (di.color = color[i % colorNum])))

  const gauges = series.filter(({ type }) => type === 'gauge')

  gauges.forEach(gauge => gauge.data.forEach((di, i) => (di.color = color[i % colorNum])))

  const barWithIndependentColor = series
    .filter(({ type, independentColor }) => type === 'bar' && independentColor)

  barWithIndependentColor.forEach(bar => {
    if (bar.independentColors) return

    bar.independentColors = color
  })
}
