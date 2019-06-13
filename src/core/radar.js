import { doUpdate } from '../class/updater.class'

import { radarConfig } from '../config/index'

import { getCircleRadianPoint } from '@jiaminghi/c-render/lib/plugin/util'

import { getColorFromRgbValue, getRgbaValue } from '@jiaminghi/color'

import { deepMerge, initNeedSeries } from '../util'

export function radar (chart, option = {}) {
  let { series } = option

  if (!series) series = []

  let radars = initNeedSeries(series, radarConfig, 'radar')

  radars = calcRadarPosition(radars, chart)

  radars = calcRadarLabelPosition(radars, chart)

  radars = calcRadarLabelAlign(radars, chart)

  doUpdate({
    chart,
    series: radars,
    key: 'radar',
    getGraphConfig: getRadarConfig,
    getStartGraphConfig: getStartRadarConfig,
    beforeChange: beforeChangeRadar
  })

  doUpdate({
    chart,
    series: radars,
    key: 'radarPoint',
    getGraphConfig: getPointConfig,
    getStartGraphConfig: getStartPointConfig,
  })

  doUpdate({
    chart,
    series: radars,
    key: 'radarLabel',
    getGraphConfig: getLabelConfig
  })
}

function calcRadarPosition (radars, chart) {
  const { radarAxis } = chart

  if (!radarAxis) return []

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
  const { radarAxis } = chart

  if (!radarAxis) return []

  const { centerPos, axisLineAngles } = radarAxis

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
  const { radarAxis } = chart

  if (!radarAxis) return []

  const { centerPos: [x, y] } = radarAxis

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

function getRadarConfig (radarItem) {
  const { animationCurve, animationFrame, rLevel } = radarItem

  return [{
    name: 'polyline',
    index: rLevel,
    animationCurve,
    animationFrame,
    shape: getRadarShape(radarItem),
    style: getRadarStyle(radarItem)
  }]
}

function getStartRadarConfig (radarItem, updater) {
  const { radarAxis: { centerPos } } = updater.chart

  const config = getRadarConfig(radarItem)[0]

  const pointNum = config.shape.points.length

  const points = new Array(pointNum).fill(0).map(foo => [...centerPos])

  config.shape.points = points

  return [config]
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

function beforeChangeRadar (graph, { shape }) {
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

function getPointConfig (radarItem) {
  const { radarPosition, animationCurve, animationFrame, rLevel } = radarItem

  return radarPosition.map((foo, i) => ({
    name: 'circle',
    index: rLevel,
    animationCurve,
    animationFrame,
    visible: radarItem.point.show,
    shape: getPointShape(radarItem, i),
    style: getPointStyle(radarItem, i),
  }))
}

function getStartPointConfig (radarItem) {
  const configs = getPointConfig(radarItem)

  configs.forEach(config => config.shape.r = 0.01)

  return configs
}

function getPointShape (radarItem, i) {
  const { radarPosition, point } = radarItem

  const { radius } = point

  const position = radarPosition[i]

  return {
    rx: position[0],
    ry: position[1],
    r: radius
  }
}

function getPointStyle (radarItem, i) {
  const { point, color } = radarItem

  const { style } = point

  return deepMerge({ stroke: color }, style)
}

function getLabelConfig (radarItem) {
  const { labelPosition, animationCurve, animationFrame, rLevel } = radarItem

  return labelPosition.map((foo, i) => ({
    name: 'text',
    index: rLevel,
    visible: radarItem.label.show,
    animationCurve,
    animationFrame,
    shape: getLabelShape(radarItem, i),
    style: getLabelStyle(radarItem, i)
  }))
}

function getLabelShape (radarItem, i) {
  const { labelPosition, label, data } = radarItem

  const { offset, formatter } = label

  const position = mergePointOffset(labelPosition[i], offset)

  let labelText = data[i] ? data[i].toString() : '0'

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

function getLabelStyle (radarItem, i) {
  const { label, color, labelAlign } = radarItem

  const { style } = label

  const defaultColorAndAlign = {
    fill: color,
    ...labelAlign[i]
  }

  return deepMerge(defaultColorAndAlign, style)
}