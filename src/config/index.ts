import { ConfigKey } from '../types/config'
import { GridConfig } from '../types/config/grid'
import { XAxisConfig, YAxisConfig } from '../types/config/axis'
import { LineConfig } from '../types/config/line'
import { BarConfig } from '../types/config/bar'
import { GaugeConfig } from '../types/config/gauge'
import { ColorConfig } from '../types/config/color'

import { deepMerge, deepClone } from '../utils/common'
import { gridDefaultConfig } from './grid'
import { xAxisDefaultConfig, yAxisDefaultConfig } from './axis'
import { lineDefaultConfig } from './line'
import { barDefaultConfig } from './bar'
import { gaugeDefaultConfig } from './gauge'
import { colorDefaultConfig } from './color'

const defaultConfig = {
  grid: gridDefaultConfig,
  xAxis: xAxisDefaultConfig,
  yAxis: yAxisDefaultConfig,
  line: lineDefaultConfig,
  bar: barDefaultConfig,
  gauge: gaugeDefaultConfig,
  color: colorDefaultConfig,
}

/**
 * @description Change default configuration
 */
export function changeDefaultConfig(key: ConfigKey, config: typeof defaultConfig[ConfigKey]): void {
  if (!defaultConfig[key])
    throw new Error('Charts - changeDefaultConfig: Change default config Error - Invalid key!')

  deepMerge(defaultConfig[key], config)
}

/**
 * @description Get default configuration
 */
export function getDefaultConfig(key: 'grid'): GridConfig
export function getDefaultConfig(key: 'xAxis'): XAxisConfig
export function getDefaultConfig(key: 'yAxis'): YAxisConfig
export function getDefaultConfig(key: 'line'): LineConfig
export function getDefaultConfig(key: 'bar'): BarConfig
export function getDefaultConfig(key: 'gauge'): GaugeConfig
export function getDefaultConfig(key: 'color'): ColorConfig
export function getDefaultConfig(key: ConfigKey): typeof defaultConfig[ConfigKey] {
  return deepClone(defaultConfig[key])
}
