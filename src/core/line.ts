import { doUpdate } from '../utils/updater'
import bezierCurve from '@jiaminghi/bezier-curve'
import { deepMerge, isNumber } from '../utils/common'
import { initNeedSeries, mergeSameStackData } from '../utils/core'
import { getPolylineLength } from '../utils/graph'
import Charts from '..'
import { _Option, _OptionSeriesItem } from '../types/class/charts'
import { getDefaultConfig } from '../config'
import { LineConfig, _LineConfig, LineFillBottomPos } from '../types/config/line'
import { _AxisConfig } from '../types/config/axis'
import { PointCoordinate } from '../types/common'
import { Polyline, Graph } from '@jiaminghi/c-render'
import { Point, GraphConfig } from '@jiaminghi/c-render/es/types/core/graph'
import { Updater } from '../class/updater.class'
import { PolylineShape } from '@jiaminghi/c-render/es/types/graphs/shape'

const { polylineToBezierCurve, getBezierCurveLength } = bezierCurve

function initLines(lines: _OptionSeriesItem<LineConfig>[], { color }: _Option): _LineConfig[] {
  return lines.map(_ => ({
    ..._,
    linePosition: [],
    lineFillBottomPos: { changeIndex: 0, changeValue: 0 },
    color: color[_.seriesIndex % color.length],
  }))
}

function mergeNonNumber(line: LineConfig, lineData: number[]): (number | undefined)[] {
  const { data } = line

  return lineData.map((v, i) => (isNumber(data[i]) ? v : undefined))
}

function getLineAxis(line: LineConfig, axisData: _AxisConfig[]): [_AxisConfig, _AxisConfig] {
  const { xAxisIndex, yAxisIndex } = line

  const xAxis = axisData.find(({ axis, index }) => axis === 'x' && index === xAxisIndex)
  const yAxis = axisData.find(({ axis, index }) => axis === 'y' && index === yAxisIndex)

  return [xAxis!, yAxis!]
}

function getLinePosition(
  lineData: (number | undefined)[],
  lineAxis: [_AxisConfig, _AxisConfig]
): (PointCoordinate | undefined)[] {
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

  const position = new Array(tickNum).fill(0).map((foo, i) => {
    const v = lineData[i]
    if (isNumber(v)) return undefined

    let valuePercent = (v! - minValue) / valueMinus

    if (valueMinus === 0) valuePercent = 0

    return valuePercent * valueAxisPosMinus + valueAxisStartPos
  })

  return position.map((vPos, i) => {
    if (i >= tickNum || !isNumber(vPos)) return undefined

    const pos: PointCoordinate = [vPos!, tickPosition[i][1 - valueAxisPosIndex]]

    if (valueAxisPosIndex === 0) return pos

    pos.reverse()

    return pos
  })
}

function getLineFillBottomPos(lineAxis: [_AxisConfig, _AxisConfig]): LineFillBottomPos {
  const valueAxis = lineAxis.find(({ data }) => data === 'value')!

  const { axis, linePosition, minValue, maxValue } = valueAxis

  const changeIndex = axis === 'x' ? 0 : 1

  let changeValue = linePosition[0][changeIndex]

  if (minValue < 0 && maxValue > 0) {
    const valueMinus = maxValue - minValue
    const posMinus = Math.abs(linePosition[0][changeIndex] - linePosition[1][changeIndex])
    let offset = (Math.abs(minValue) / valueMinus) * posMinus
    if (axis === 'y') offset *= -1
    changeValue += offset
  }

  return {
    changeIndex,
    changeValue,
  }
}

function calcLinesPosition(lines: _LineConfig[], charts: Charts): _LineConfig[] {
  const { axisData } = charts

  return lines.map((lineItem, i) => {
    const lineData = mergeNonNumber(lineItem, mergeSameStackData(lines, i))

    const lineAxis = getLineAxis(lineItem, axisData!)

    const linePosition = getLinePosition(lineData, lineAxis).filter(_ => _) as PointCoordinate[]

    const lineFillBottomPos = getLineFillBottomPos(lineAxis)

    return {
      ...lineItem,
      linePosition,
      lineFillBottomPos,
    }
  })
}

function getLineGraphName(lineItem: _LineConfig) {
  const { smooth } = lineItem

  return smooth ? 'smoothline' : 'polyline'
}

function getLineAndAreaShape(lineItem: _LineConfig) {
  const { linePosition } = lineItem

  return {
    points: linePosition,
  }
}

function getLineAreaStyle(lineItem: _LineConfig) {
  const { lineArea, color } = lineItem

  let { gradient, style } = lineArea

  const fillColor = [style.fill || color]

  const gradientColor = deepMerge(fillColor, gradient)

  if (gradientColor.length === 1) gradientColor.push(gradientColor[0])

  const gradientParams = getGradientParams(lineItem)

  style = { ...style, stroke: 'rgba(0, 0, 0, 0)' }

  return deepMerge(
    {
      gradientColor,
      gradientParams,
      gradientType: 'linear',
      gradientWith: 'fill',
    },
    style
  )
}

function lineAreaDrawed({ lineFillBottomPos }: _LineConfig, graph: Polyline) {
  const {
    shape,
    render: { ctx },
  } = graph
  const { points } = shape

  const { changeIndex, changeValue } = lineFillBottomPos

  const linePoint1 = [...points[points.length - 1]] as Point
  const linePoint2 = [...points[0]] as Point

  linePoint1[changeIndex] = changeValue
  linePoint2[changeIndex] = changeValue

  ctx.lineTo(...linePoint1)
  ctx.lineTo(...linePoint2)

  ctx.closePath()

  ctx.fill()
}

function getLineAreaConfig(lineItem: _LineConfig) {
  const { animationCurve, animationFrame, lineFillBottomPos, rLevel } = lineItem

  return [
    {
      name: getLineGraphName(lineItem),
      index: rLevel,
      animationCurve,
      animationFrame,
      visible: lineItem.lineArea.show,
      lineFillBottomPos,
      shape: getLineAndAreaShape(lineItem),
      style: getLineAreaStyle(lineItem),
      drawed(graph: Graph) {
        lineAreaDrawed(lineItem, graph as Polyline)
      },
    },
  ]
}

function getStartLineAreaConfig(lineItem: _LineConfig) {
  const config = getLineAreaConfig(lineItem)[0]

  const style = { ...config.style }

  style.opacity = 0

  config.style = style

  return [config]
}

function beforeUpdateLineAndArea(graphs: Graph[], lineItem: _LineConfig, updater: Updater) {
  if (!graphs.length) return
  const { render } = updater.charts

  const delAll = (graphs[0] as Polyline).name !== getLineGraphName(lineItem)
  if (!delAll) return

  graphs.forEach(_ => render.delGraph(_, true))
  graphs.splice(0)
}

function beforeChangeLineAndArea(graph: Graph, graphConfig: GraphConfig) {
  const { points } = graphConfig.shape as PolylineShape
  const graphPoints = (graph as Polyline).shape.points

  const graphPointsNum = graphPoints.length
  const pointsNum = points.length

  if (pointsNum > graphPointsNum) {
    const lastPoint = graphPoints.slice(-1)[0]

    const newAddPoints = new Array(pointsNum - graphPointsNum)
      .fill(0)
      .map(_ => [...lastPoint] as Point)

    graphPoints.push(...newAddPoints)
  } else if (pointsNum < graphPointsNum) {
    graphPoints.splice(pointsNum)
  }
}

function getLineConfig(lineItem: _LineConfig) {
  const { animationCurve, animationFrame, rLevel } = lineItem

  return [
    {
      name: getLineGraphName(lineItem),
      index: rLevel + 1,
      animationCurve,
      animationFrame,
      shape: getLineAndAreaShape(lineItem),
      style: getLineStyle(lineItem),
    },
  ]
}

export function line(charts: Charts, option: _Option): void {
  const { xAxis, yAxis, series } = option

  let lines: _LineConfig[] = []

  if (xAxis && yAxis && series) {
    const needLines = initNeedSeries(series, getDefaultConfig('line'), 'line') as _OptionSeriesItem<
      LineConfig
    >[]

    lines = initLines(needLines, option)

    lines = calcLinesPosition(lines, charts)
  }

  doUpdate({
    charts,
    seriesConfig: lines,
    key: 'lineArea',
    getGraphConfig: getLineAreaConfig,
    getStartGraphConfig: getStartLineAreaConfig,
    beforeUpdate: beforeUpdateLineAndArea,
    beforeChange: beforeChangeLineAndArea,
    GraphConstructor: Polyline,
  })

  doUpdate({
    charts,
    seriesConfig: lines,
    key: 'line',
    getGraphConfig: getLineConfig,
    getStartGraphConfig: getStartLineConfig,
    beforeUpdate: beforeUpdateLineAndArea,
    beforeChange: beforeChangeLineAndArea,
    GraphConstructor: Polyline,
  })

  doUpdate({
    chart,
    series: lines,
    key: 'linePoint',
    getGraphConfig: getPointConfig,
    getStartGraphConfig: getStartPointConfig,
  })

  doUpdate({
    chart,
    series: lines,
    key: 'lineLabel',
    getGraphConfig: getLabelConfig,
  })
}

function getGradientParams(lineItem) {
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

function getLineStyle(lineItem) {
  const { lineStyle, color, smooth, linePosition } = lineItem

  const lineLength = getLineLength(linePosition, smooth)

  return deepMerge(
    {
      stroke: color,
      lineDash: [lineLength, 0],
    },
    lineStyle
  )
}

function getLineLength(points, smooth = false) {
  if (!smooth) return getPolylineLength(points)

  const curve = polylineToBezierCurve(points)

  return getBezierCurveLength(curve)
}

function getStartLineConfig(lineItem) {
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

function getPointConfig(lineItem) {
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
    style,
  }))
}

function getPointShapes(lineItem) {
  const {
    linePosition,
    linePoint: { radius },
  } = lineItem

  return linePosition.map(([rx, ry]) => ({
    r: radius,
    rx,
    ry,
  }))
}

function getPointStyle(lineItem) {
  let {
    color,
    linePoint: { style },
  } = lineItem

  return deepMerge({ stroke: color }, style)
}

function getStartPointConfig(lineItem) {
  const configs = getPointConfig(lineItem)

  configs.forEach(config => {
    config.shape.r = 0.1
  })

  return configs
}

function getLabelConfig(lineItem) {
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
    style,
  }))
}

function getLabelShapes(lineItem) {
  const contents = formatterLabel(lineItem)
  const position = getLabelPosition(lineItem)

  return contents.map((content, i) => ({
    content,
    position: position[i],
  }))
}

function getLabelPosition(lineItem) {
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

function getOffsetedPoint([x, y], [ox, oy]) {
  return [x + ox, y + oy]
}

function getCenterLabelPoint([ax, ay], [bx, by]) {
  return [(ax + bx) / 2, (ay + by) / 2]
}

function formatterLabel(lineItem) {
  let {
    data,
    label: { formatter },
  } = lineItem

  data = data.filter(d => typeof d === 'number').map(d => d.toString())

  if (!formatter) return data

  const type = typeof formatter

  if (type === 'string') return data.map(d => formatter.replace('{value}', d))

  if (type === 'function') return data.map((value, index) => formatter({ value, index }))

  return data
}

function getLabelStyle(lineItem) {
  const {
    color,
    label: { style },
  } = lineItem

  return deepMerge({ fill: color }, style)
}
