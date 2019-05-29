import { lineConfig } from '../config'

import { deepClone } from '@jiaminghi/c-render/lib/util'

import bezierCurve from '@jiaminghi/bezier-curve'

import { getColorFromRgbValue, getRgbaValue } from '@jiaminghi/color'

import { deepMerge, mergeSameStackData, getPolylineLength, getLinearGradientColor } from '../util'

const { polylineToBezierCurve, getBezierCurveLength } = bezierCurve

export function line (chart, option = {}) {
  const { xAxis, yAxis, series } = option

  if (!xAxis || !yAxis || !series) removeLines(chart)

  initChartLine(chart)

  let lines = series.filter(({ type }) => type === 'line')

  if (!lines.length) return removeLines(chart)

  lines = mergeLineDefaultConfig(lines)

  lines = filterShowLines(lines)

  lines = calcLinesPosition(lines, chart)

  delRedundanceLines(lines, chart)

  updateLines(lines, chart)

  updatePoints(lines, chart)

  updateLabels(lines, chart)
}

function removeLines (chart) {
  const { line, linePoints, lineLabels, render } = chart

  if (line) line.forEach(lineItem => lineItem.forEach(l => render.delGraph(l)))
  if (linePoints) linePoints.forEach(pointItem => pointItem.forEach(l => render.delGraph(l)))
  if (lineLabels) lineLabels.forEach(labelItem => labelItem.forEach(l => render.delGraph(l)))

  chart.line = null
  chart.linePoints = null
  chart.lineLabels = null
}

function initChartLine (chart) {
  if (!chart.line) chart.line = []
  if (!chart.linePoints) chart.linePoints = []
  if (!chart.lineLabels) chart.lineLabels = []
}

function mergeLineDefaultConfig (lines) {
  return lines.map(lineItem => deepMerge(deepClone(lineConfig, true), lineItem))
}

function delRedundanceLines (lines, chart) {
  const { line, linePoints, lineLabels, render } = chart

  const linesNum = lines.length
  const cacheNum = line.length

  if (cacheNum > linesNum) {
    const needDelLines = line.splice(linesNum)
    const needDelLinePoints = linePoints.splice(linesNum)
    const needDelLineLabels = lineLabels.splice(linesNum)

    needDelLines.forEach(item => item.forEach(g => render.delGraph(g)))
    needDelLinePoints.forEach(item => item.forEach(g => render.delGraph(g)))
    needDelLineLabels.forEach(item => item.forEach(g => render.delGraph(g)))
  }
}

function filterShowLines (lines) {
  return lines.filter(({ show }) => show === true)
}

function calcLinesPosition (lines, chart) {
  const { axisData, grid } = chart

  return lines.map(lineItem => {
    let lineData = mergeSameStackData(lineItem, lines)

    lineData = mergeNonNumber(lineItem, lineData)

    const lineAxis = getLineAxis(lineItem, axisData)

    const linePosition = getLinePosition(lineData, lineAxis, grid)

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

      return (v - minValue) / valueMinus * valueAxisPosMinus + valueAxisStartPos
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

function updateLines (lines, chart) {
  const { render, line: lineCache } = chart

  lines.forEach((lineItem, i) => {
    let { smooth } = lineItem

    const graphName = smooth ? 'smoothline' : 'polyline'

    let cache = lineCache[i]

    if (cache && cache[0].name !== graphName) {
      cache.forEach(g => render.delGraph(g))

      cache = null
    }

    if (cache) {
      changeLineFill(cache[0], lineItem)
      changeLine(cache[1], lineItem)
    } else {
      addNewLineFill(lineCache, lineItem, i, render, graphName)
      addNewLine(lineCache, lineItem, i, render, graphName)
    }
  })
}

function changeLineFill (graph, lineItem) {
  const { lineFillBottomPos, linePosition, animationCurve, animationFrame } = lineItem

  const style = mergeLineFillStyle(lineItem)

  mergePointsNum(graph, linePosition)

  graph.visible = lineItem.fill.show
  graph.animationCurve = animationCurve
  graph.animationFrame = animationFrame
  graph.lineFillBottomPos = lineFillBottomPos
  graph.animation('shape', { points: linePosition }, true)
  graph.animation('style', { ...style }, true)
}

function mergeLineFillStyle (lineItem) {
  const { fill, color } = lineItem

  let { gradient, style } = fill

  style = deepMerge({ fill: color }, style)

  return {
    gradient: gradient.map(c => getRgbaValue(c)),
    ...style
  }
}

function mergePointsNum (graph, points) {
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

function changeLine (graph, lineItem) {
  let { show, linePosition, animationCurve, animationFrame } = lineItem

  const style = mergeLineColor(lineItem)

  mergePointsNum(graph, linePosition)

  graph.visible = show
  graph.animationCurve = animationCurve
  graph.animationFrame = animationFrame
  graph.animation('shape', { points: linePosition }, true)
  graph.animation('style', style, true)
}

function mergeLineColor (lineItem) {
  const { lineStyle, color } = lineItem

  return deepMerge({ stroke: color }, lineStyle)
}

function addNewLine (lineCache, lineItem, i, render, graphName) {
  let { show, lineStyle, linePosition, smooth, animationCurve, animationFrame } = lineItem

  lineStyle = mergeLineColor(lineItem)

  const lineLength = getLineLength(linePosition, smooth)

  const { lineDash } = lineStyle

  const lineGraph = render.add({
    name: graphName,
    visible: show,
    animationCurve,
    animationFrame,
    shape: {
      points: linePosition
    },
    style: {
      ...lineStyle,
      lineDash: lineDash ? [0, 0] : [0, lineLength]
    }
  })

  lineGraph.animation('style', {
    lineDash: lineDash || [lineLength, 0]
  }, true)

  if (!(lineCache[i] instanceof Array)) lineCache[i] = []
  lineCache[i][1] = lineGraph
}

function addNewLineFill (lineCache, lineItem, i, render, graphName) {
  const { linePosition, lineFillBottomPos, animationCurve, animationFrame } = lineItem

  const lineFillStyle = mergeLineFillStyle(lineItem)

  const { opacity, gradient: gradientColor } = lineFillStyle

  let startGradientColor = deepClone(gradientColor)
  startGradientColor.forEach(c => (c[3] = 0))

  const lineFillGraph = render.add({
    name: graphName,
    visible: lineItem.fill.show,
    animationCurve,
    animationFrame,
    lineFillBottomPos,
    shape: {
      points: linePosition
    },
    style: {
      ...lineFillStyle,
      opacity: 0,
      gradient: startGradientColor
    },
    beforeDraw: lineFillBeforeDraw,
    drawed: lineFillDrawed
  })

  lineFillGraph.animation('style', {
    opacity,
    gradient: gradientColor
  }, true)

  if (!(lineCache[i] instanceof Array)) lineCache[i] = []
  lineCache[i][0] = lineFillGraph
}

function lineFillBeforeDraw ({ lineFillBottomPos, shape, style }, { ctx }) {
  const { max, min } = Math

  ctx.strokeStyle = 'transparent'

  const { changeIndex, changeValue } = lineFillBottomPos
  let { gradient } = style
  const { points } = shape

  if (!gradient.length) return

  gradient = gradient.map(v => getColorFromRgbValue(v))

  const mainPos = points.map(p => p[changeIndex])
  const maxPos = max(...mainPos)
  const minPos = min(...mainPos)

  let beginPos = maxPos
  if (changeIndex === 1) beginPos = minPos

  const begin = [beginPos, 0]
  const end = [changeValue, 0]

  if (changeIndex === 1) {
    begin.reverse()
    end.reverse()
  }

  ctx.fillStyle = getLinearGradientColor(ctx, begin, end, gradient)
}

function lineFillDrawed ({ lineFillBottomPos, shape }, { ctx }) {
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

function getLineLength (points, smooth = false) {
  if (!smooth) return getPolylineLength(points)

  const curve = polylineToBezierCurve(points)
  
  return getBezierCurveLength(curve)
}

function updatePoints (lines, chart) {
  const { render, linePoints: linePointsCache } = chart

  lines.forEach((lineItem, i) => {
    const cache = linePointsCache[i]

    if (cache) {
      changeLinePoints(cache, lineItem, render)
    } else {
      addNewLinePoints(linePointsCache, lineItem, i, render)
    }
  })
}

function changeLinePoints (cache, lineItem, render) {
  const { linePoint, linePosition, animationCurve, animationFrame } = lineItem

  let { show, radius } = linePoint

  balanceLinePointsNum(cache, lineItem, render)

  const style = mergePointColor(lineItem)

  cache.forEach((g, i) => {
    g.visible = show
    g.animationCurve = animationCurve
    g.animationFrame = animationFrame
    g.animation('shape', {
      r: radius,
      rx: linePosition[i][0],
      ry: linePosition[i][1]
    }, true)
    g.animation('style', style, true)
  })
}

function balanceLinePointsNum (cache, lineItem, render) {
  const style = mergePointColor(lineItem)

  const pointsNum = lineItem.linePosition.length
  const cacheNum = cache.length

  if (cacheNum > pointsNum) {
    cache.splice(pointsNum).forEach(g => render.delGraph(g))
  } else if (cacheNum < pointsNum) {
    const lastPointGraph = cache[cacheNum - 1]

    const needAddGraphs = new Array(pointsNum - cacheNum)
      .fill(0)
      .map(foo => render.add({
        name: 'circle',
        visible: lastPointGraph.visible,
        animationCurve: lastPointGraph.animationCurve,
        animationFrame: lastPointGraph.animationFrame,
        shape: deepClone(lastPointGraph.shape, true),
        style
      }))

    cache.push(...needAddGraphs)
  }
}

function addNewLinePoints (linePointsCache, lineItem, i, render) {
  let { linePoint, linePosition, animationCurve, animationFrame } = lineItem

  let { show, radius } = linePoint

  const style = mergePointColor(lineItem)

  linePointsCache[i] = linePosition.map(pos => render.add({
    name: 'circle',
    visible: show,
    animationCurve,
    animationFrame,
    shape: {
      r: 1,
      rx: pos[0],
      ry: pos[1]
    },
    style
  }))

  linePointsCache[i].forEach(g => {
    g.animation('shape', { r: radius }, true)
  })
}

function mergePointColor (lineItem) {
  let { color, linePoint: { style } } = lineItem

  return deepMerge({ stroke: color }, style)
}

function updateLabels (lines, chart) {
  const { render, lineLabels: lineLabelsCache } = chart

  lines.forEach((lineItem, i) => {
    const cache = lineLabelsCache[i]

    if (cache) {
      changeLineLabels(cache, lineItem, render)
    } else {
      addNewLineLabels(lineLabelsCache, lineItem, i, render)
    }
  })
}

function changeLineLabels (cache, lineItem, render) {
  let { data, label, linePosition, lineFillBottomPos, animationCurve, animationFrame } = lineItem

  let { show, position, offset, formatter } = label

  balanceLineLabelsNum(cache, lineItem, render)

  data = formatterData (data, formatter)
  const style = mergeLabelColor(lineItem)
  const labelPosition = getLabelPosition(linePosition, lineFillBottomPos, position, offset)

  cache.forEach((g, j) => {
    g.visible = show
    g.animationCurve = animationCurve
    g.animationFrame = animationFrame
    g.animation('shape', {
      content: data[j],
      position: labelPosition[j]
    }, true)
    g.animation('style', style, true)
  })
}

function balanceLineLabelsNum (cache, lineItem, render) {
  const style = mergeLabelColor(lineItem)

  const labelsNum = lineItem.linePosition.length
  const cacheNum = cache.length

  if (cacheNum > labelsNum) {
    cache.splice(labelsNum).forEach(g => render.delGraph(g))
  } else if (cacheNum < labelsNum) {
    const lastLabelGraph = cache[cacheNum - 1]

    const needAddGraphs = new Array(labelsNum - cacheNum)
      .fill(0)
      .map(foo => render.add({
        name: 'text',
        visible: lastLabelGraph.visible,
        animationCurve: lastLabelGraph.animationCurve,
        animationFrame: lastLabelGraph.animationFrame,
        shape: deepClone(lastLabelGraph.shape, true),
        style
      }))

    cache.push(...needAddGraphs)
  }
}

function addNewLineLabels (lineLabelsCache, lineItem, i, render) {
  let { data, label, linePosition, lineFillBottomPos, animationCurve, animationFrame } = lineItem

  let { show, position, offset, formatter } = label

  data = formatterData (data, formatter)

  const style = mergeLabelColor(lineItem)

  const labelPosition = getLabelPosition(linePosition, lineFillBottomPos, position, offset)

  lineLabelsCache[i] = labelPosition.map((pos, j) => render.add({
    name: 'text',
    visible: show,
    animationCurve,
    animationFrame,
    shape: {
      content: data[j],
      position: pos
    },
    style
  }))
}

function formatterData (data, formatter) {
  data = data.filter(d => typeof d === 'number').map(d => d.toString())

  if (!formatter) return data

  const type = typeof formatter

  if (type === 'string') return data.map(d => formatter.replace('{value}', d))

  if (type === 'function') return data.map(d => formatter(d))

  return data
}

function mergeLabelColor (lineItem) {
  const { color, label: { style } } = lineItem

  return deepMerge({ fill: color }, style)
}

function getLabelPosition (linePosition, lineFillBottomPos, position, offset) {
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