import { deepClone } from '@jiaminghi/c-render/lib/util'

import { gridConfig } from '../config'

import { deepMerge } from '../util'

export function grid (chart, option = {}) {
  let { grid } = option

  grid = deepMerge(deepClone(gridConfig, true), grid || {})

  const gridCache = chart.grid

  if (gridCache) {
    changeGrid(gridCache, grid, chart)
  } else {
    addGrid(grid, chart)
  }
}

function changeGrid (gridCache, grid, chart) {
  const gridGraph = gridCache.graph

  const { animationCurve, animationFrame, style } = grid

  const shape = getGridShape(grid, chart)

  grid.animationCurve = animationCurve
  grid.animationFrame = animationFrame
  gridGraph.animation('shape', { ...shape }, true)
  gridGraph.animation('style', { ...style }, true)

  gridCache.area = { ...shape }
}

function getGridShape (grid, chart) {
  const [w, h] = chart.render.area

  const left = getNumberValue(grid.left, w)
  const right = getNumberValue(grid.right, w)
  const top = getNumberValue(grid.top, h)
  const bottom = getNumberValue(grid.bottom, h)

  const width = w - left - right
  const height = h - top - bottom

  return { x: left, y: top, w: width, h: height }
}

function getNumberValue (val, all) {
  if (typeof val === 'number') return val

  if (typeof val !== 'string') return 0

  return all * parseInt(val) / 100
}

function addGrid (grid, chart) {
  const { render } = chart

  const { animationCurve, animationFrame, style } = grid

  const shape = getGridShape(grid, chart)

  const graph = render.add({
    name: 'rect',
    animationCurve,
    animationFrame,
    shape,
    style: { ...style }
  })

  chart.grid = {
    graph,
    area: {
      ...shape
    }
  }
}