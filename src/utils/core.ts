import { LineConfig } from '../types/config/line'
import { BarConfig } from '../types/config/bar'
import { mulAdd, deepMerge, deepClone } from './common'
import { OptionSeriesItem, Option, _Option, _OptionSeriesItem } from '../types/class/charts'
import { ConfigKey } from '../types/config'

export function initOption(option: Option): _Option {
  const { series } = option

  return {
    ...option,
    series: series?.map((_, i) => ({ ..._, seriesIndex: i })),
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
  series: Partial<_OptionSeriesItem>[],
  config: OptionSeriesItem,
  type: ConfigKey
): _OptionSeriesItem[] {
  return series
    .filter(({ type: _, show }) => _ === type && show)
    .map(item => deepMerge(deepClone(config), item) as _OptionSeriesItem)
}
