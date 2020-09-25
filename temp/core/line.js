import { doUpdate } from '../class/updater.class'

import { lineConfig } from '../config'

import bezierCurve from '@jiaminghi/bezier-curve'

import { deepMerge, initNeedSeries, mergeSameStackData, getPolylineLength } from '../util'

const { polylineToBezierCurve, getBezierCurveLength } = bezierCurve

export function line (chart, option = {}) {
  const { xAxis, yAxis, series } = option

  let lines = []

  if (xAxis && yAxis && series) {
    lines = initNeedSeries(series, lineConfig, 'line')

    lines = calcLinesPosition(lines, chart)
  }

  doUpdate({
    chart,
    series: lines,
    key: 'lineArea',
    getGraphConfig: getLineAreaConfig,
    getStartGraphConfig: getStartLineAreaConfig,
    beforeUpdate: beforeUpdateLineAndArea,
    beforeChange: beforeChangeLineAndArea
  })

  doUpdate({
    chart,
    series: lines,
    key: 'line',
    getGraphConfig: getLineConfig,
    getStartGraphConfig: getStartLineConfig,
    beforeUpdate: beforeUpdateLineAndArea,
    beforeChange: beforeChangeLineAndArea
  })

  doUpdate({
    chart,
    series: lines,
    key: 'linePoint',
    getGraphConfig: getPointConfig,
    getStartGraphConfig: getStartPointConfig
  })

  doUpdate({
    chart,
    series: lines,
    key: 'lineLabel',
    getGraphConfig: getLabelConfig
  })
}

function calcLinesPosition (lines, chart) {
  const { axisData } = chart

  return lines.map(lineItem => {
    let lineData = mergeSameStackData(lineItem, lines)

    lineData = mergeNonNumber(lineItem, lineData)

    const lineAxis = getLineAxis(lineItem, axisData)

    const linePosition = getLinePosition(lineData, lineAxis)

    const lineFillBottomPos = getLineFillBottomPos(lineAxis)

    return {
      ...lineItem,
      linePosition: linePosition.filter(p => p),
      lineFillBottomPos
    }
  })
}

function mergeNonNumber (lineItem, lineData) {
  const { data } = lineItem

  return lineData.map((v, i) => typeof data[i] === 'number' ? v : null)
}

function getLineAxis (line, axisData) {
  const { xAxisIndex, yAxisIndex } = line

  const xAxis = axisData.find(({ axis, index }) => axis === 'x' && index === xAxisIndex)
  const yAxis = axisData.find(({ axis, index }) => axis === 'y' && index === yAxisIndex)

  return [xAxis, yAxis]
}

function getLinePosition (lineData, lineAxis) {
  const valueAxisIndex = lineAxis.findIndex(({ data }) => data === 'value')

  const valueAxis = lineAxis[valueAxisIndex]
  const labelAxis = lineAxis[1 - valueAxisIndex]

  const { linePosition, axis } = valueAxis
  const { tickPosition } = labelAxis
  const tickNum = tickPosition.length

  const valueAxisPosIndex = axis === 'x' ? 0 : 1

  const valueAxisStartPos = linePosition[0][valueAxisPosIndex]
  const valueAxisEndPos = linePosition[1][valueAxisPosIndex]
  const valueAxisPosMinus = valueAxisEndPos - valueAxisStartPos
  const { maxValue, minValue } = valueAxis
  const valueMinus = maxValue - minValue

  const position = new Array(tickNum).fill(0)
    .map((foo, i) => {
      const v = lineData[i]
      if (typeof v !== 'number') return null

      let valuePercent = (v - minValue) / valueMinus

      if (valueMinus === 0) valuePercent = 0

      return valuePercent * valueAxisPosMinus + valueAxisStartPos
    })

  return position.map((vPos, i) => {
    if (i >= tickNum || typeof vPos !== 'number') return null

    const pos = [vPos, tickPosition[i][1 - valueAxisPosIndex]]

    if (valueAxisPosIndex === 0) return pos

    pos.reverse()

    return pos
  })
}

function getLineFillBottomPos (lineAxis) {
  const valueAxis = lineAxis.find(({ data }) => data === 'value')

  const { axis, linePosition, minValue, maxValue } = valueAxis

  const changeIndex = axis === 'x' ? 0 : 1

  let changeValue = linePosition[0][changeIndex]

  if (minValue < 0 && maxValue > 0) {
    const valueMinus = maxValue - minValue
    const posMinus = Math.abs(linePosition[0][changeIndex] - linePosition[1][changeIndex])
    let offset = Math.abs(minValue) / valueMinus * posMinus
    if (axis === 'y') offset *= -1
    changeValue += offset
  }

  return {
    changeIndex,
    changeValue
  }
}

function getLineAreaConfig (lineItem) {
  const { animationCurve, animationFrame, lineFillBottomPos, rLevel } = lineItem

  return [{
    name: getLineGraphName(lineItem),
    index: rLevel,
    animationCurve,
    animationFrame,
    visible: lineItem.lineArea.show,
    lineFillBottomPos,
    shape: getLineAndAreaShape(lineItem),
    style: getLineAreaStyle(lineItem),
    drawed: lineAreaDrawed
  }]
}

function getLineAndAreaShape (lineItem) {
  const { linePosition } = lineItem

  return {
    points: linePosition
  }
}

function getLineAreaStyle (lineItem) {
  const { lineArea, color } = lineItem

  let { gradient, style } = lineArea

  const fillColor = [style.fill || color]

  const gradientColor = deepMerge(fillColor, gradient)

  if (gradientColor.length === 1) gradientColor.push(gradientColor[0])

  const gradientParams = getGradientParams(lineItem)

  style = { ...style, stroke: 'rgba(0, 0, 0, 0)' }

  return deepMerge({
    gradientColor,
    gradientParams,
    gradientType: 'linear',
    gradientWith: 'fill',
  }, style)
}

function getGradientParams (lineItem) {
  const { lineFillBottomPos, linePosition } = lineItem

  const { changeIndex, changeValue } = lineFillBottomPos

  const mainPos = linePosition.map(p => p[changeIndex])
  const maxPos = Math.max(...mainPos)
  const minPos = Math.min(...mainPos)

  let beginPos = maxPos
  if (changeIndex === 1) beginPos = minPos

  if (changeIndex === 1) {
    return [0, beginPos, 0, changeValue]
  } else {
    return [beginPos, 0, changeValue, 0]
  }
}

function lineAreaDrawed ({ lineFillBottomPos, shape }, { ctx }) {
  const { points } = shape

  const { changeIndex, changeValue } = lineFillBottomPos

  const linePoint1 = [...points[points.length - 1]]
  const linePoint2 = [...points[0]]

  linePoint1[changeIndex] = changeValue
  linePoint2[changeIndex] = changeValue

  ctx.lineTo(...linePoint1)
  ctx.lineTo(...linePoint2)

  ctx.closePath()

  ctx.fill()
}

function getStartLineAreaConfig (lineItem) {
  const config = getLineAreaConfig(lineItem)[0]

  const style = { ...config.style }

  style.opacity = 0

  config.style = style

  return [config]
}

function beforeUpdateLineAndArea (graphs, lineItem, i, updater) {
  const cache = graphs[i]

  if (!cache) return

  const currentName = getLineGraphName(lineItem)

  const { render } = updater.chart

  const { name } = cache[0]

  const delAll = currentName !== name

  if (!delAll) return

  cache.forEach(g => render.delGraph(g))

  graphs[i] = null
}

function beforeChangeLineAndArea (graph, config) {
  const { points } = config.shape

  const graphPoints = graph.shape.points

  const graphPointsNum = graphPoints.length
  const pointsNum = points.length

  if (pointsNum > graphPointsNum) {
    const lastPoint = graphPoints.slice(-1)[0]

    const newAddPoints = new Array(pointsNum - graphPointsNum)
    .fill(0).map(foo => ([...lastPoint]))

    graphPoints.push(...newAddPoints)
  } else if (pointsNum < graphPointsNum) {
    graphPoints.splice(pointsNum)
  }
}

function getLineConfig (lineItem) {
  const { animationCurve, animationFrame, rLevel } = lineItem

  return [{
    name: getLineGraphName(lineItem),
    index: rLevel + 1,
    animationCurve,
    animationFrame,
    shape: getLineAndAreaShape(lineItem),
    style: getLineStyle(lineItem)
  }]
}

function getLineGraphName (lineItem) {
  const { smooth } = lineItem

  return smooth ? 'smoothline' : 'polyline'
}

function getLineStyle (lineItem) {
  const { lineStyle, color, smooth, linePosition } = lineItem

  const lineLength = getLineLength(linePosition, smooth)

  return deepMerge({
    stroke: color,
    lineDash: [lineLength, 0]
  }, lineStyle)
}

function getLineLength (points, smooth = false) {
  if (!smooth) return getPolylineLength(points)

  const curve = polylineToBezierCurve(points)
  
  return getBezierCurveLength(curve)
}

function getStartLineConfig (lineItem) {
  const { lineDash } = lineItem.lineStyle

  const config = getLineConfig(lineItem)[0]

  let realLineDash = config.style.lineDash

  if (lineDash) {
    realLineDash = [0, 0]
  } else {
    realLineDash = [...realLineDash].reverse()
  }

  config.style.lineDash = realLineDash

  return [config]
}

function getPointConfig (lineItem) {
  const { animationCurve, animationFrame, rLevel } = lineItem

  const shapes = getPointShapes(lineItem)

  const style = getPointStyle(lineItem)

  return shapes.map(shape => ({
    name: 'circle',
    index: rLevel + 2,
    visible: lineItem.linePoint.show,
    animationCurve,
    animationFrame,
    shape,
    style
  }))
}

function getPointShapes (lineItem) {
  const { linePosition, linePoint: { radius } } = lineItem

  return linePosition.map(([rx, ry]) => ({
    r: radius,
    rx,
    ry
  }))
}

function getPointStyle (lineItem) {
  let { color, linePoint: { style } } = lineItem

  return deepMerge({ stroke: color }, style)
}

function getStartPointConfig (lineItem) {
  const configs = getPointConfig(lineItem)

  configs.forEach(config => {
    config.shape.r = 0.1
  })

  return configs
}

function getLabelConfig (lineItem) {
  const { animationCurve, animationFrame, rLevel } = lineItem

  const shapes = getLabelShapes(lineItem)
  const style = getLabelStyle(lineItem)

  return shapes.map((shape, i) => ({
    name: 'text',
    index: rLevel + 3,
    visible: lineItem.label.show,
    animationCurve,
    animationFrame,
    shape,
    style
  }))
}

function getLabelShapes (lineItem) {
  const contents = formatterLabel(lineItem)
  const position = getLabelPosition(lineItem)

  return contents.map((content, i) => ({
    content,
    position: position[i]
  }))
}

function getLabelPosition (lineItem) {
  const { linePosition, lineFillBottomPos, label } = lineItem

  let { position, offset } = label

  let { changeIndex, changeValue } = lineFillBottomPos

  return linePosition.map(pos => {
    if (position === 'bottom') {
      pos = [...pos]
      pos[changeIndex] = changeValue
    }

    if (position === 'center') {
      const bottom = [...pos]
      bottom[changeIndex] = changeValue

      pos = getCenterLabelPoint(pos, bottom)
    }

    return getOffsetedPoint(pos, offset)
  })
}

function getOffsetedPoint ([x, y], [ox, oy]) {
  return [x + ox, y + oy]
}

function getCenterLabelPoint([ax, ay], [bx, by]) {
  return [
    (ax + bx) / 2,
    (ay + by) / 2
  ]
}

function formatterLabel (lineItem) {
  let { data, label: { formatter } } = lineItem

  data = data.filter(d => typeof d === 'number').map(d => d.toString())

  if (!formatter) return data

  const type = typeof formatter

  if (type === 'string') return data.map(d => formatter.replace('{value}', d))

  if (type === 'function') return data.map((value, index) => formatter({ value, index }))

  return data
}

function getLabelStyle (lineItem) {
  const { color, label: { style } } = lineItem

  return deepMerge({ fill: color }, style)
}
