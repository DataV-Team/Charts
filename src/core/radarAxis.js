import { doUpdate } from '../class/updater.class'

import { radarAxisConfig } from '../config/index'

import { deepClone, getCircleRadianPoint } from '@jiaminghi/c-render/lib/plugin/util'

import { deepMerge, getPointToLineDistance } from '../util'

export function radarAxis (chart, option = {}) {
  let { radar } = option

  let radarAxis = []

  if (radar) {
    radarAxis = mergeRadarAxisDefaultConfig(radar)
  
    radarAxis = calcRadarAxisCenter(radarAxis, chart)
  
    radarAxis = calcRadarAxisRingRadius(radarAxis, chart)
  
    radarAxis = calcRadarAxisLinePosition(radarAxis)
  
    radarAxis = calcRadarAxisAreaRadius(radarAxis)
  
    radarAxis = calcRadarAxisLabelPosition(radarAxis)

    radarAxis = [radarAxis]
  }

  let radarAxisForUpdate = radarAxis

  if (radarAxis.length && !radarAxis[0].show) radarAxisForUpdate = []

  doUpdate({
    chart,
    series: radarAxisForUpdate,
    key: 'radarAxisSplitArea',
    getGraphConfig: getSplitAreaConfig,
    beforeUpdate: beforeUpdateSplitArea,
    beforeChange: beforeChangeSplitArea
  })

  doUpdate({
    chart,
    series: radarAxisForUpdate,
    key: 'radarAxisSplitLine',
    getGraphConfig: getSplitLineConfig,
    beforeUpdate: beforeUpdateSplitLine,
    beforeChange: beforeChangeSplitLine
  })

  doUpdate({
    chart,
    series: radarAxisForUpdate,
    key: 'radarAxisLine',
    getGraphConfig: getAxisLineConfig,
  })

  doUpdate({
    chart,
    series: radarAxisForUpdate,
    key: 'radarAxisLable',
    getGraphConfig: getAxisLabelConfig,
  })

  chart.radarAxis = radarAxis[0]
}

function mergeRadarAxisDefaultConfig (radar) {
  return deepMerge(deepClone(radarAxisConfig), radar)
}

function calcRadarAxisCenter (radarAxis, chart) {
  const { area } = chart.render

  const { center } = radarAxis

  radarAxis.centerPos = center.map((v, i) => {
    if (typeof v === 'number') return v

    return parseInt(v) / 100 * area[i]
  })

  return radarAxis
}

function calcRadarAxisRingRadius (radarAxis, chart) {
  const { area } = chart.render

  let { splitNum, radius } = radarAxis

  const maxRadius = Math.min(...area) / 2

  if (typeof radius !== 'number') radius = parseInt(radius) / 100 * maxRadius

  const splitGap = radius / splitNum

  radarAxis.ringRadius = new Array(splitNum).fill(0)
    .map((foo, i) => splitGap * (i + 1))

  radarAxis.radius = radius

  return radarAxis
}

function calcRadarAxisLinePosition (radarAxis) {
  const { indicator, centerPos, radius, startAngle } = radarAxis

  const fullAngle = Math.PI * 2

  const indicatorNum = indicator.length

  const indicatorGap = fullAngle / indicatorNum

  const angles = new Array(indicatorNum).fill(0)
    .map((foo, i) => indicatorGap * i + startAngle)
  
  radarAxis.axisLineAngles = angles

  radarAxis.axisLinePosition = angles.map(g => {
    return getCircleRadianPoint(...centerPos, radius, g)
  })

  return radarAxis
}

function calcRadarAxisAreaRadius (radarAxis) {
  const { ringRadius } = radarAxis

  const subRadius = ringRadius[0] / 2

  radarAxis.areaRadius = ringRadius.map(r => r - subRadius)

  return radarAxis
}

function calcRadarAxisLabelPosition (radarAxis) {
  let { axisLineAngles, centerPos, radius, axisLabel } = radarAxis

  radius += axisLabel.labelGap

  radarAxis.axisLabelPosition = axisLineAngles.map(angle => 
    getCircleRadianPoint(...centerPos, radius, angle))

  return radarAxis
}

function getSplitAreaConfig (radarAxis) {
  const { areaRadius, polygon, animationCurve, animationFrame, rLevel } = radarAxis

  const name = polygon ? 'regPolygon' : 'ring'

  return areaRadius.map((foo, i) => ({
    name,
    index: rLevel,
    visible: radarAxis.splitArea.show,
    animationCurve,
    animationFrame,
    shape: getSplitAreaShape(radarAxis, i),
    style: getSplitAreaStyle(radarAxis, i)
  }))
}

function getSplitAreaShape (radarAxis, i) {
  const { polygon, areaRadius, indicator, centerPos } = radarAxis

  const indicatorNum = indicator.length

  let shape = {
    rx: centerPos[0],
    ry: centerPos[1],
    r: areaRadius[i]
  }

  if (polygon) shape.side = indicatorNum

  return shape
}

function getSplitAreaStyle (radarAxis, i) {
  const { splitArea, ringRadius, axisLineAngles, polygon, centerPos } = radarAxis

  let { color, style } = splitArea

  style = {
    fill: 'rgba(0, 0, 0, 0)',
    ...style
  }

  let lineWidth = ringRadius[0] - 0

  if (polygon) {
    const point1 = getCircleRadianPoint(...centerPos, ringRadius[0], axisLineAngles[0])
    const point2 = getCircleRadianPoint(...centerPos, ringRadius[0], axisLineAngles[1])

    lineWidth = getPointToLineDistance(centerPos, point1, point2)
  }

  style = deepMerge(deepClone(style, true), { lineWidth })

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { stroke: color[i % colorNum] })
}

function beforeUpdateSplitArea (graphs, radarAxis, i, updater) {
  const cache = graphs[i]

  if (!cache) return

  const { render } = updater.chart

  const { polygon } = radarAxis

  const { name } = cache[0]

  const currentName = polygon ? 'regPolygon' : 'ring'

  const delAll = currentName !== name

  if (!delAll) return

  cache.forEach(g => render.delGraph(g))

  graphs[i] = null
}

function beforeChangeSplitArea (graph, config) {
  const side = config.shape.side

  if (typeof side !== 'number') return

  graph.shape.side = side
}

function getSplitLineConfig (radarAxis) {
  const { ringRadius, polygon, animationCurve, animationFrame, rLevel } = radarAxis

  const name = polygon ? 'regPolygon' : 'ring'

  return ringRadius.map((foo, i) => ({
    name,
    index: rLevel,
    animationCurve,
    animationFrame,
    visible: radarAxis.splitLine.show,
    shape: getSplitLineShape(radarAxis, i),
    style: getSplitLineStyle(radarAxis, i)
  }))
}

function getSplitLineShape (radarAxis, i) {
  const { ringRadius, centerPos, indicator, polygon } = radarAxis

  const shape = {
    rx: centerPos[0],
    ry: centerPos[1],
    r: ringRadius[i]
  }

  const indicatorNum = indicator.length

  if (polygon) shape.side = indicatorNum

  return shape
}

function getSplitLineStyle (radarAxis, i) {
  const { splitLine } = radarAxis

  let { color, style } = splitLine

  style = {
    fill: 'rgba(0, 0, 0, 0)',
    ...style
  }

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { stroke: color[i % colorNum] })
}

function beforeUpdateSplitLine (graphs, radarAxis, i, updater) {
  const cache = graphs[i]

  if (!cache) return

  const { render } = updater.chart

  const { polygon } = radarAxis

  const { name } = cache[0]

  const currenName = polygon ? 'regPolygon' : 'ring'

  const delAll = currenName !== name

  if (!delAll) return

  cache.forEach(g => render.delGraph(g))

  graphs[i] = null
}

function beforeChangeSplitLine (graph, config) {
  const side = config.shape.side

  if (typeof side !== 'number') return

  graph.shape.side = side
}

function getAxisLineConfig (radarAxis) {
  const { axisLinePosition, animationCurve, animationFrame, rLevel } = radarAxis

  return axisLinePosition.map((foo, i) => ({
    name: 'polyline',
    index: rLevel,
    visible: radarAxis.axisLine.show,
    animationCurve,
    animationFrame,
    shape: getAxisLineShape(radarAxis, i),
    style: getAxisLineStyle(radarAxis, i)
  }))
}

function getAxisLineShape (radarAxis, i) {
  const { centerPos, axisLinePosition } = radarAxis

  const points = [centerPos, axisLinePosition[i]]

  return { points }
}

function getAxisLineStyle (radarAxis, i) {
  const { axisLine } = radarAxis

  const { color, style } = axisLine

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { stroke: color[i % colorNum] })
}

function getAxisLabelConfig (radarAxis) {
  const { axisLabelPosition, animationCurve, animationFrame, rLevel } = radarAxis
  
  return axisLabelPosition.map((foo, i) => ({
    name: 'text',
    index: rLevel,
    visible: radarAxis.axisLabel.show,
    animationCurve,
    animationFrame,
    shape: getAxisLableShape(radarAxis, i),
    style: getAxisLableStyle(radarAxis, i)
  }))
}

function getAxisLableShape (radarAxis, i) {
  const { axisLabelPosition, indicator } = radarAxis

  return {
    content: indicator[i].name,
    position: axisLabelPosition[i]
  }
}

function getAxisLableStyle (radarAxis, i) {
  const { axisLabel, centerPos: [x, y], axisLabelPosition } = radarAxis

  let { color, style } = axisLabel

  const [labelXpos, labelYPos] = axisLabelPosition[i]

  const textAlign = labelXpos > x ? 'left' : 'right'
  const textBaseline = labelYPos > y ? 'top' : 'bottom'

  style = deepMerge({
    textAlign,
    textBaseline
  }, style)

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { fill: color[i % colorNum] })
}