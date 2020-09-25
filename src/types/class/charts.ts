import { GridConfig } from '../config/grid'
import { Updater } from '../../class/updater.class'
import { XAxisConfig, YAxisConfig } from '../config/axis'
import { BarConfig } from '../config/bar'
import { GaugeConfig } from '../config/gauge'
import { LineConfig } from '../config/line'

export type OptionSeriesItem = LineConfig | BarConfig | GaugeConfig

export type _OptionSeriesItem<T = OptionSeriesItem> = T & {
  seriesIndex: number
}

export type Option = {
  grid?: Partial<GridConfig>
  xAxis?: Partial<XAxisConfig> | Partial<XAxisConfig>[]
  yAxis?: Partial<YAxisConfig> | Partial<YAxisConfig>[]
  series?: Partial<OptionSeriesItem>[]
  color?: string[]
}

export type _Option = Option & {
  color: string[]
  series?: Partial<_OptionSeriesItem>[]
}

export type GraphSeriesItem = {
  key: string
  updater: Updater
}
