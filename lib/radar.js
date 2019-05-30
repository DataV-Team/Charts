import { radarConfig } from '../config/index'

import { deepClone, getCircleRadianPoint } from '@jiaminghi/c-render/lib/util'

import { getColorFromRgbValue, getRgbaValue } from '@jiaminghi/color'

import { deepMerge } from '../util'

export function radar (chart, option = {}) {
  const { series } = option

  if (!series) return removeRadars(chart)

  initChartRadar(chart)

  let radars = series.filter(({ type }) => type === 'radar')

  if (!radars.length) return removeRadars(chart)

  radars = mergePieDefaultConfig(radars)

  radars = filterShowRadars(radars)

  radars = calcRadarPosition(radars, chart)

  radars = calcRadarLabelPosition(radars, chart)

  radars = calcRadarLabelAlign(radars, chart)

  delRedundanceRadars(radars, chart)

  updateRadars(radars, chart)

  updatePoints(radars, chart)

  updateLabels(radars, chart)
}

function removeRadars (chart) {
  const { radar, radarPoint, radarLabel, render } = chart

  if (radar) radar.forEach(g => render.delGraph(g))
  if (radarPoint) radarPoint.forEach(item => item.forEach(g => render.delGraph(g)))
  if (radarLabel) radarLabel.forEach(item => item.forEach(g => render.delGraph(g)))
}

function initChartRadar (chart) {
  const { radar, radarPoint, radarLabel } = chart

  if (!radar) chart.radar = []
  if (!radarPoint) chart.radarPoint = []
  if (!radarLabel) chart.radarLabel = []
}

function mergePieDefaultConfig (radars) {
  return radars.map(radar => deepMerge(deepClone(radarConfig, true), radar))
}

function filterShowRadars (radars) {
  return radars.filter(({ show }) => show)
}

function calcRadarPosition (radars, chart) {
  const { radarAxis } = chart

  const { indicator, axisLineAngles, radius, centerPos } = radarAxis

  radars.forEach(radarItem => {
    const { data } = radarItem

    radarItem.dataRadius = []

    radarItem.radarPosition = indicator.map(({ max, min }, i) => {
      let v = data[i]

      if (typeof max !== 'number') max = v
      if (typeof min !== 'number') min = 0
      if (typeof v !== 'number') v = min

      const dataRadius = (v - min) / (max - min) * radius

      radarItem.dataRadius[i] = dataRadius

      return getCircleRadianPoint(...centerPos, dataRadius, axisLineAngles[i])
    })
  })

  return radars
}

function calcRadarLabelPosition (radars, chart) {
  const { centerPos, axisLineAngles } = chart.radarAxis

  radars.forEach(radarItem => {
    const { dataRadius, label } = radarItem

    const { labelGap } = label

    radarItem.labelPosition = dataRadius.map((r, i) => {
      return getCircleRadianPoint(...centerPos, r + labelGap, axisLineAngles[i])
    })
  })

  return radars
}

function calcRadarLabelAlign (radars, chart) {
  const { centerPos: [x, y] } = chart.radarAxis

  radars.forEach(radarItem => {
    const { labelPosition } = radarItem

    const labelAlign = labelPosition.map(([lx, ly]) => {
      const textAlign = lx > x ? 'left' : 'right'
      const textBaseline = ly > y ? 'top' : 'bottom'
      
      return {
        textAlign,
        textBaseline
      }
    })

    radarItem.labelAlign = labelAlign
  })

  return radars
}

function delRedundanceRadars (radars, chart) {
  const { radar, radarPoint, radarLabel, render } = chart

  const radarsNum = radars.length
  const cacheNum = radar.length

  if (cacheNum > radarsNum) {
    const needDelRadars = radar.splice(linesNum)
    const needDelRadarPoints = radarPoint.splice(linesNum)
    const needDelRadarLabels = radarLabel.splice(linesNum)

    needDelRadars.forEach(g => render.delGraph(g))
    needDelRadarPoints.forEach(item => item.forEach(g => render.delGraph(g)))
    needDelRadarLabels.forEach(item => item.forEach(g => render.delGraph(g)))
  }
}

function updateRadars (radars, chart) {
  const { radar: radarCache } = chart

  radars.forEach((radarItem, i) => {
    const cache = radarCache[i]

    if (cache) {
      changeRadar(radarItem, cache, i, chart)
    } else {
      addNewRadar(radarItem, radarCache, i, chart)
    }
  })
}

function changeRadar (radarItem, graph, i, chart) {
  const { animationCurve, animationFrame } = radarItem

  const shape = getRadarShape(radarItem)

  mergeRadarShapePointsNum(graph, shape)

  graph.animationCurve = animationCurve
  graph.animationFrame = animationFrame
  graph.animation('shape', shape, true)
  graph.animation('style', getRadarStyle(radarItem), true)
}

function mergeRadarShapePointsNum (graph, shape) {
  const graphPoints = graph.shape.points

  const graphPointsNum = graphPoints.length
  const pointsNum = shape.points.length

  if (pointsNum > graphPointsNum) {
    const lastPoint = graphPoints.slice(-1)[0]

    const newAddPoints = new Array(pointsNum - graphPointsNum)
    .fill(0).map(foo => ([...lastPoint]))

    graphPoints.push(...newAddPoints)
  } else if (pointsNum < graphPointsNum) {
    graphPoints.splice(pointsNum)
  }
}

function addNewRadar (radarItem, radarCache, i, chart) {
  const { render, radarAxis: { centerPos } } = chart

  const { animationCurve, animationFrame } = radarItem

  const shape = getRadarShape(radarItem)
  const style = getRadarStyle(radarItem)

  const startShape = { ...shape }
  startShape.points = shape.points.map(foo => [...centerPos])

  const graph = render.add({
    name: 'polyline',
    animationCurve,
    animationFrame,
    shape: startShape,
    style
  })

  graph.animation('shape', shape, true)

  radarCache[i] = graph
}

function getRadarShape (radarItem) {
  const { radarPosition } = radarItem

  return {
    points: radarPosition,
    close: true
  }
}

function getRadarStyle(radarItem) {
  const { radarStyle, color } = radarItem

  const colorRgbaValue = getRgbaValue(color)
  colorRgbaValue[3] = 0.5

  const radarDefaultColor = {
    stroke: color,
    fill: getColorFromRgbValue(colorRgbaValue)
  }

  return deepMerge(radarDefaultColor, radarStyle)
}

function updatePoints (radars, chart) {
  const { radarPoint: radarPointCache } = chart

  radars.forEach((radarItem, i) => {
    const cache = radarPointCache[i]

    if (cache) {
      changeRadarPoints(radarItem, cache, i, chart)
    } else {
      addNewRadarPoints(radarItem, radarPointCache, i, chart)
    }
  })
}

function changeRadarPoints (radarItem, cache, i, chart) {
  const { animationCurve, animationFrame } = radarItem

  balanceRadarPointsNum(radarItem, cache, chart)

  cache.forEach((graph, j) => {
    graph.visible = radarItem.point.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getRadarPointShape(radarItem, j), true)
    graph.animation('style', getRadarPointStyle(radarItem, j), true)
  })
}

function balanceRadarPointsNum (radarItem, cache, chart) {
  const { render } = chart

  const cacheGraphNum = cache.length
  const pointsNum = radarItem.radarPosition.length

  if (pointsNum > cacheGraphNum) {
    const lastCacheGraph = cache.slice(-1)[0]
    const needAddGraphs = new Array(pointsNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'circle',
        visible: lastCacheGraph.visible,
        animationCurve: lastCacheGraph.animationCurve,
        animationFrame: lastCacheGraph.animationFrame,
        shape: deepClone(lastCacheGraph.shape, true),
        style: getRadarPointStyle(radarItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddGraphs)
  } else if (pointsNum < cacheGraphNum) {
    const needDelCache = cache.splice(pointsNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewRadarPoints (radarItem, radarPointsCache, i, chart) {
  const { render } = chart

  const { animationCurve, animationFrame, radarPosition } = radarItem

  const graphs = radarPosition.map((point, i) => {
    const shape = getRadarPointShape(radarItem, i)

    const startShape = { ...shape }
    startShape.r = 0.1

    const graph = render.add({
      name: 'circle',
      visible: radarItem.point.show,
      animationCurve,
      animationFrame,
      shape: startShape,
      style: getRadarPointStyle(radarItem, i)
    })

    graph.animation('shape', shape, true)

    return graph
  })

  radarPointsCache[i] = graphs
}

function getRadarPointShape (radarItem, i) {
  const { radarPosition, point } = radarItem

  const { radius } = point

  const position = radarPosition[i]

  return {
    rx: position[0],
    ry: position[1],
    r: radius
  }
}

function getRadarPointStyle (radarItem, i) {
  const { point, color } = radarItem

  const { style } = point

  return deepMerge({ stroke: color }, style)
}

function updateLabels (radars, chart) {
  const { radarLabel: radarLabelCache } = chart

  radars.forEach((radarItem, i) => {
    const cache = radarLabelCache[i]

    if (cache) {
      changeRadarLabels(radarItem, cache, i, chart)
    } else {
      addNewRadarLabels(radarItem, radarLabelCache, i, chart)
    }
  })
}

function changeRadarLabels (radarItem, cache, i, chart) {
  const { animationCurve, animationFrame } = radarItem

  balanceRadarLabelsNum(radarItem, cache, chart)

  cache.forEach((graph, j) => {
    graph.visible = radarItem.label.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getRadarLabelShape(radarItem, j), true)
    graph.animation('style', getRadarLabelStyle(radarItem, j), true)
  })
}

function balanceRadarLabelsNum (radarItem, cache, chart) {
  const { render } = chart

  const cacheGraphNum = cache.length
  const labelsNum = radarItem.labelPosition.length

  if (labelsNum > cacheGraphNum) {
    const lastCacheGraph = cache.slice(-1)[0]
    const needAddGraphs = new Array(labelsNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'text',
        visible: lastCacheGraph.visible,
        animationCurve: lastCacheGraph.animationCurve,
        animationFrame: lastCacheGraph.animationFrame,
        shape: deepClone(lastCacheGraph.shape, true),
        style: getRadarLabelStyle(radarItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddGraphs)
  } else if (labelsNum < cacheGraphNum) {
    const needDelCache = cache.splice(labelsNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewRadarLabels (radarItem, radarLabelCache, i, chart) {
  const { render } = chart

  const { animationCurve, animationFrame, labelPosition } = radarItem

  const graphs = labelPosition.map((foo, i) => render.add({
    name: 'text',
    visible: radarItem.label.show,
    animationCurve,
    animationFrame,
    shape: getRadarLabelShape(radarItem, i),
    style: getRadarLabelStyle(radarItem, i, chart)
  }))

  radarLabelCache[i] = graphs
}

function getRadarLabelShape (radarItem, i) {
  const { labelPosition, label, data } = radarItem

  const { offset, formatter } = label

  const position = mergePointOffset(labelPosition[i], offset)

  let labelText = data[i].toString()

  const formatterType = typeof formatter

  if (formatterType === 'string') labelText = formatter.replace('{value}', labelText)

  if (formatterType === 'function') labelText = formatter(labelText)

  return {
    content: labelText,
    position
  }
}

function mergePointOffset ([x, y], [ox, oy]) {
  return [x + ox, y + oy]
}

function getRadarLabelStyle (radarItem, i) {
  const { label, color, labelAlign } = radarItem

  const { style } = label

  const defaultColorAndAlign = {
    fill: color,
    ...labelAlign[i]
  }

  return deepMerge(defaultColorAndAlign, style)
}