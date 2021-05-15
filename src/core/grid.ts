import { deepMerge } from '../utils/common'
import Charts from '../class/charts.class'
import { Option } from '../types/class/charts'
import { getDefaultConfig } from '../config'
import { doUpdate } from '../utils/updater'
import { Rect } from '@jiaminghi/c-render'
import { GraphConfig } from '@jiaminghi/c-render/es/types/core/graph'
import { Updater } from '../class/updater.class'
import { GridConfig } from '../types/config/grid'
import { RectShape } from '@jiaminghi/c-render/es/types/graphs/shape'
import { GraphStyleConfig } from '../types/common'
import { GridKey } from '../types/core/grid'

function getNumberValue(val: number | string, all: number): number {
  if (typeof val === 'number') return val
  if (typeof val !== 'string') return 0

  return (all * parseInt(val)) / 100
}

function getGridShape(config: GridConfig, updater: Updater): RectShape {
  const [w, h] = updater.charts.render.area

  const left = getNumberValue(config.left, w)
  const right = getNumberValue(config.right, w)
  const top = getNumberValue(config.top, h)
  const bottom = getNumberValue(config.bottom, h)

  const width = w - left - right
  const height = h - top - bottom

  return { x: left, y: top, w: width, h: height }
}

function getGridStyle(config: GridConfig): GraphStyleConfig {
  return config.style
}

function getGridConfig(config: GridConfig, updater: Updater): GraphConfig[] {
  const { animationCurve, animationFrame, rLevel } = config

  const shape = getGridShape(config, updater)
  const style = getGridStyle(config)

  updater.charts.gridArea = { ...shape }

  return [
    {
      index: rLevel,
      animationCurve,
      animationFrame,
      shape,
      style,
    },
  ]
}

export default function grid(charts: Charts, option: Option): void {
  const grid = deepMerge(getDefaultConfig('grid'), option.grid || {})

  doUpdate({
    charts,
    seriesConfig: [grid],
    key: GridKey.Grid,
    getGraphConfig: getGridConfig,
    getGraphConstructor: _ => Rect,
  })
}
