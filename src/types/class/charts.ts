import { GridConfig } from '../config/grid'
import { Updater } from '../../class/updater.class'
import { XAxisConfig, YAxisConfig } from '../config/axis'
import { BarConfig } from '../config/bar'
import { GaugeConfig } from '../config/gauge'
import { LineConfig } from '../config/line'
import { Color } from '../config/color'
import { DeepPartial } from '../common'

export type OptionSeriesItem = LineConfig | BarConfig | GaugeConfig

export type _OptionSeriesItem<T = OptionSeriesItem> = T & {
  seriesIndex: number
  color: Color
}

export type Option = {
  grid?: DeepPartial<GridConfig>
  xAxis?: DeepPartial<XAxisConfig> | DeepPartial<XAxisConfig>[]
  yAxis?: DeepPartial<YAxisConfig> | DeepPartial<YAxisConfig>[]
  series?: DeepPartial<OptionSeriesItem>[]
  color?: string[]
}

export type _Option = Option & {
  color: string[]
  series?: DeepPartial<_OptionSeriesItem>[]
}

export type GraphSeriesItem = {
  key: string
  updater: Updater
}
