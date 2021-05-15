import { LineConfig } from '../types/config/line'
import { BarConfig } from '../types/config/bar'
import { mulAdd, deepMerge, deepClone } from './common'
import { OptionSeriesItem, Option, _Option, _OptionSeriesItem } from '../types/class/charts'
import { ConfigKey } from '../types/config'
import { colorDefaultConfig } from '../config/color'
import { ColorConfig } from '../types/config/color'
import { DeepPartial } from '../types/common'

export function mergeColor(
  series: DeepPartial<_OptionSeriesItem>[],
  color: ColorConfig
): DeepPartial<_OptionSeriesItem>[] {
  if (!series.length) return series

  const colorNum = color.length

  series.forEach((item, i) => {
    if (!item.color) item.color = color[i % colorNum]
  })

  return series

  // const pies = series.filter(({ type }) => type === 'pie')

  // pies.forEach(pie => pie.data.forEach((di, i) => (di.color = color[i % colorNum])))

  // const gauges = series.filter(({ type }) => type === 'gauge')

  // gauges.forEach(gauge => gauge.data.forEach((di, i) => (di.color = color[i % colorNum])))

  // const barWithIndependentColor = series.filter(
  //   ({ type, independentColor }) => type === 'bar' && independentColor
  // )

  // barWithIndependentColor.forEach(bar => {
  //   if (bar.independentColors) return

  //   bar.independentColors = color
  // })
}

export function initOption(option: Option): _Option {
  const { series: _series, color: _color } = option

  const color = deepMerge(deepClone(colorDefaultConfig), _color || [])
  const series = mergeColor(_series?.map((_, i) => ({ ..._, seriesIndex: i })) || [], color)

  return {
    ...option,
    series,
    color,
  }
}

export function mergeSameStackData(series: (LineConfig | BarConfig)[], index: number): number[] {
  const target = series[index]
  const { stack, data } = target

  if (!stack) return [...target.data]

  const stacks = series.filter(({ stack: _ }) => _ === stack)

  const stackIndex = stacks.findIndex(({ data: _ }) => _ === data)

  const datas = stacks.splice(0, stackIndex + 1).map(({ data }) => data)

  return new Array(data.length).fill(0).map((_, i) => mulAdd(datas.map(_ => _[i])))
}

export function initNeedSeries(
  series: DeepPartial<_OptionSeriesItem>[],
  config: OptionSeriesItem,
  type: ConfigKey
): _OptionSeriesItem[] {
  return series
    .map(item => deepMerge(deepClone(config), item) as _OptionSeriesItem)
    .filter(({ type: _, show }) => _ === type && show)
}
