import { doUpdate } from '../utils/updater'
import { deepClone, deepMerge } from '../utils/common'
import { getDefaultConfig } from '../config'
import { initNeedSeries, mergeSameStackData } from '../utils/core'
import Charts from '..'
import { _Option, _OptionSeriesItem } from '../types/class/charts'
import { BarConfig, _BarConfig } from '../types/config/bar'
import { PointCoordinate } from '../types/common'
import { _AxisConfig } from '../types/config/axis'
import { BarKey } from '../types/core/bar'
import { Graph, Polyline, Rect, Text } from '@jiaminghi/c-render'
import { PolylineShape, RectShape } from '@jiaminghi/c-render/es/types/graphs/shape'
import { Updater } from '../class/updater.class'
import { GraphConfig } from '@jiaminghi/c-render/es/types/core/graph'

function setBarAxis(bars: _OptionSeriesItem<BarConfig>[], chart: Charts): _BarConfig[] {
  const { axisData } = chart

  return bars.map<_BarConfig>(bar => {
    let { xAxisIndex, yAxisIndex } = bar

    if (typeof xAxisIndex !== 'number') xAxisIndex = 0
    if (typeof yAxisIndex !== 'number') yAxisIndex = 0

    const xAxis = axisData!.find(({ axis, index }) => `${axis}${index}` === `x${xAxisIndex}`)!
    const yAxis = axisData!.find(({ axis, index }) => `${axis}${index}` === `y${yAxisIndex}`)!

    const axis = [xAxis, yAxis]

    const valueAxisIndex = axis.findIndex(({ data }) => data === 'value')

    return ({
      ...bar,
      valueAxis: axis[valueAxisIndex]!,
      labelAxis: axis[1 - valueAxisIndex]!,
    } as unknown) as _BarConfig
  })
}

function groupBarByLabelAxis(bars: _BarConfig[]): _BarConfig[][] {
  let labelAxis = bars.map(({ labelAxis: { axis, index } }) => axis + index)

  labelAxis = [...new Set(labelAxis)]

  return labelAxis.map(axisIndex => {
    return bars.filter(({ labelAxis: { axis, index } }) => axis + index === axisIndex)
  })
}

function getBarStack(bars: _BarConfig[]): string[] {
  const stacks: string[] = []

  bars.forEach(({ stack }) => {
    if (stack) stacks.push(stack)
  })

  // @ts-ignore
  return [...new Set(stacks)]
}

function setBarIndex(bars: _BarConfig[]): void {
  const stacks = getBarStack(bars)

  const stackWithIndex: { stack: string; index: number }[] = stacks.map(stack => ({
    stack,
    index: -1,
  }))

  let currentIndex = 0

  bars.forEach(bar => {
    const { stack } = bar

    if (!stack) {
      bar.barIndex = currentIndex

      currentIndex++
    } else {
      const stackData = stackWithIndex.find(({ stack: s }) => s === stack)

      if (stackData!.index === -1) {
        stackData!.index = currentIndex

        currentIndex++
      }

      bar.barIndex = stackData!.index
    }
  })
}

function setBarNum(bars: _BarConfig[]): void {
  // @ts-ignore
  const barNum = [...new Set(bars.map(({ barIndex }) => barIndex))].length

  bars.forEach(bar => (bar.barNum = barNum))
}

function setBarCategoryWidth(bars: _BarConfig[]): void {
  const lastBar = bars.slice(-1)[0]

  const {
    barCategoryGap,
    labelAxis: { tickGap },
  } = lastBar

  let barCategoryWidth = 0

  if (typeof barCategoryGap === 'number') {
    barCategoryWidth = barCategoryGap
  } else {
    barCategoryWidth = (1 - parseInt(barCategoryGap) / 100) * tickGap
  }

  bars.forEach(bar => (bar.barCategoryWidth = barCategoryWidth))
}

function getBarWidthAndGapWithPercentOrNumber(
  barCategoryWidth: number,
  barWidth: number | string,
  barGap: number | string
): [number, number] {
  let [width, gap] = [0, 0]

  if (typeof barWidth === 'number') {
    width = barWidth
  } else {
    width = (parseInt(barWidth) / 100) * barCategoryWidth
  }

  if (typeof barGap === 'number') {
    gap = barGap
  } else {
    gap = (parseInt(barGap) / 100) * width
  }

  return [width, gap]
}

function getBarWidthAndGapWidthAuto(
  barCategoryWidth: number,
  barGap: string | number,
  barNum: number
) {
  let [width, gap] = [0, 0]

  const barItemWidth = barCategoryWidth / barNum

  if (typeof barGap === 'number') {
    gap = barGap
    width = barItemWidth - gap
  } else {
    const percent = 10 + parseInt(barGap) / 10

    if (percent === 0) {
      width = barItemWidth * 2
      gap = -width
    } else {
      width = (barItemWidth / percent) * 10
      gap = barItemWidth - width
    }
  }

  return [width, gap]
}

function setBarWidthAndGap(bars: _BarConfig[]): void {
  const { barCategoryWidth, barWidth, barGap, barNum } = bars.slice(-1)[0]

  let widthAndGap: number[] = []

  if (typeof barWidth === 'number' || barWidth !== 'auto') {
    widthAndGap = getBarWidthAndGapWithPercentOrNumber(barCategoryWidth, barWidth, barGap)
  } else if (barWidth === 'auto') {
    widthAndGap = getBarWidthAndGapWidthAuto(barCategoryWidth, barGap, barNum)
  }

  const [width, gap] = widthAndGap

  bars.forEach(bar => {
    bar.barWidth = width
    bar.barGap = gap
  })
}

function setBarAllWidthAndGap(bars: _BarConfig[]) {
  const { barGap, barWidth, barNum } = bars.slice(-1)[0]

  const barAllWidthAndGap =
    ((barGap as number) + (barWidth as number)) * barNum - (barGap as number)

  bars.forEach(bar => (bar.barAllWidthAndGap = barAllWidthAndGap))
}

function setBarPositionData(bars: _BarConfig[]) {
  const labelBarGroup = groupBarByLabelAxis(bars)

  labelBarGroup.forEach(group => {
    setBarIndex(group)
    setBarNum(group)
    setBarCategoryWidth(group)
    setBarWidthAndGap(group)
    setBarAllWidthAndGap(group)
  })

  return bars
}

function eliminateNonNumberData(bar: _BarConfig, barData: number[]) {
  const { data } = bar

  return barData.map((v, i) => (typeof data[i] === 'number' ? v : null)).filter(d => d !== null)
}

function getValuePos(
  min: number,
  max: number,
  value: number | null,
  linePosition: PointCoordinate[],
  axis: 'x' | 'y'
) {
  if (typeof value !== 'number') return null

  const valueMinus = max - min

  const coordinateIndex = axis === 'x' ? 0 : 1

  const posMinus = linePosition[1][coordinateIndex] - linePosition[0][coordinateIndex]

  let percent = (value - min) / valueMinus

  if (valueMinus === 0) percent = 0

  const pos = percent * posMinus

  return pos + linePosition[0][coordinateIndex]
}

function calcBarValueAxisCoordinate(bars: _BarConfig[]) {
  return bars.map((bar, i) => {
    const data = mergeSameStackData(bars, i)

    const dataEliminated = eliminateNonNumberData(bar, data)

    const { axis, minValue, maxValue, linePosition } = bar.valueAxis

    const startPos = getValuePos(
      minValue,
      maxValue,
      minValue < 0 ? 0 : minValue,
      linePosition,
      axis
    )

    const endPos = dataEliminated.map(v => getValuePos(minValue, maxValue, v, linePosition, axis))

    const barValueAxisPos = (endPos.map(p => [startPos, p]) as unknown) as PointCoordinate[]

    return {
      ...bar,
      barValueAxisPos: barValueAxisPos,
    }
  })
}

function calcBarLabelAxisCoordinate(bars: _BarConfig[]): _BarConfig[] {
  return bars.map(bar => {
    const { labelAxis, barAllWidthAndGap, barGap, barWidth, barIndex } = bar

    const { tickGap, tickPosition, axis } = labelAxis

    const coordinateIndex = axis === 'x' ? 0 : 1

    const barLabelAxisPos = tickPosition.map((_, i) => {
      const barCategoryStartPos = tickPosition[i][coordinateIndex] - tickGap / 2

      const barItemsStartPos = barCategoryStartPos + (tickGap - barAllWidthAndGap) / 2

      return (
        barItemsStartPos + (barIndex + 0.5) * (barWidth as number) + barIndex * (barGap as number)
      )
    })

    return {
      ...bar,
      barLabelAxisPos,
    }
  })
}

function eliminateNullBarLabelAxis(bars: _BarConfig[]) {
  return bars.map(bar => {
    const { barLabelAxisPos, data } = bar

    return {
      ...bar,
      barLabelAxisPos: barLabelAxisPos.filter((_, i) => typeof data[i] === 'number'),
    }
  })
}

function keepSameNumBetweenBarAndData(bars: _BarConfig[]) {
  bars.forEach(bar => {
    const { data, barLabelAxisPos, barValueAxisPos } = bar

    const dataNum = data.filter(d => typeof d === 'number').length
    const axisPosNum = barLabelAxisPos.length

    if (axisPosNum > dataNum) {
      barLabelAxisPos.splice(dataNum)
      barValueAxisPos.splice(dataNum)
    }
  })

  return bars
}

function calcBarsPosition(bars: _BarConfig[]) {
  bars = calcBarValueAxisCoordinate(bars)
  bars = calcBarLabelAxisCoordinate(bars)
  bars = eliminateNullBarLabelAxis(bars)
  bars = keepSameNumBetweenBarAndData(bars)

  return bars
}

function getBackgroundBarWidth(barItem: _BarConfig) {
  const { barAllWidthAndGap, barCategoryWidth, backgroundBar } = barItem

  const { width } = backgroundBar

  if (typeof width === 'number') return width as number

  if (width === 'auto') return barAllWidthAndGap

  return (parseInt(width) / 100) * barCategoryWidth
}

function getBackgroundBarShapes(barItem: _BarConfig) {
  const { labelAxis, valueAxis } = barItem

  const { tickPosition } = labelAxis

  const { axis, linePosition } = valueAxis

  const width = getBackgroundBarWidth(barItem)

  const haltWidth = width / 2

  const posIndex = axis === 'x' ? 0 : 1

  const centerPos = tickPosition.map(p => p[1 - posIndex])

  const [start, end] = [linePosition[0][posIndex], linePosition[1][posIndex]]

  return centerPos.map(center => {
    if (axis === 'x') {
      return { x: start, y: center - haltWidth, w: end - start, h: width }
    } else {
      return { x: center - haltWidth, y: end, w: width, h: start - end }
    }
  })
}

function getBackgroundBarStyle(barItem: _BarConfig) {
  return barItem.backgroundBar.style
}

function getBackgroundBarConfig(barItem: _BarConfig) {
  const { animationCurve, animationFrame, rLevel } = barItem

  const shapes = getBackgroundBarShapes(barItem)
  const style = getBackgroundBarStyle(barItem)

  return shapes.map(shape => ({
    name: 'rect',
    index: rLevel,
    visible: barItem.backgroundBar.show,
    animationCurve,
    animationFrame,
    shape,
    style,
  }))
}

function getBarName(barItem: _BarConfig) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon' || shapeType === 'rightEchelon') return 'polyline'

  return 'rect'
}

function getLeftEchelonShape(barItem: _BarConfig, i: number): PolylineShape {
  const { barValueAxisPos, barLabelAxisPos, barWidth, echelonOffset } = barItem

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]
  const halfWidth = (barWidth as number) / 2

  const valueAxis = barItem.valueAxis.axis

  const points: PointCoordinate[] = []

  if (valueAxis === 'x') {
    points[0] = [end, labelAxisPos - halfWidth]
    points[1] = [end, labelAxisPos + halfWidth]
    points[2] = [start, labelAxisPos + halfWidth]
    points[3] = [start + echelonOffset, labelAxisPos - halfWidth]

    if (end - start < echelonOffset) points.splice(3, 1)
  } else {
    points[0] = [labelAxisPos - halfWidth, end]
    points[1] = [labelAxisPos + halfWidth, end]
    points[2] = [labelAxisPos + halfWidth, start]
    points[3] = [labelAxisPos - halfWidth, start - echelonOffset]

    if (start - end < echelonOffset) points.splice(3, 1)
  }

  return { points, close: true }
}

function getRightEchelonShape(barItem: _BarConfig, i: number): PolylineShape {
  const { barValueAxisPos, barLabelAxisPos, barWidth, echelonOffset } = barItem

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]
  const halfWidth = (barWidth as number) / 2

  const valueAxis = barItem.valueAxis.axis

  const points: PointCoordinate[] = []

  if (valueAxis === 'x') {
    points[0] = [end, labelAxisPos + halfWidth]
    points[1] = [end, labelAxisPos - halfWidth]
    points[2] = [start, labelAxisPos - halfWidth]
    points[3] = [start + echelonOffset, labelAxisPos + halfWidth]

    if (end - start < echelonOffset) points.splice(2, 1)
  } else {
    points[0] = [labelAxisPos + halfWidth, end]
    points[1] = [labelAxisPos - halfWidth, end]
    points[2] = [labelAxisPos - halfWidth, start]
    points[3] = [labelAxisPos + halfWidth, start - echelonOffset]

    if (start - end < echelonOffset) points.splice(2, 1)
  }

  return { points, close: true }
}

function getNormalBarShape(barItem: _BarConfig, i: number) {
  const { barValueAxisPos, barLabelAxisPos, barWidth } = barItem

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]

  const valueAxis = barItem.valueAxis.axis

  const shape: RectShape = { x: 0, y: 0, w: 0, h: 0 }

  if (valueAxis === 'x') {
    shape.x = start
    shape.y = labelAxisPos - (barWidth as number) / 2
    shape.w = end - start
    shape.h = barWidth as number
  } else {
    shape.x = labelAxisPos - (barWidth as number) / 2
    shape.y = end
    shape.w = barWidth as number
    shape.h = start - end
  }

  return shape
}

function getBarShape(barItem: _BarConfig, i: number) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon') {
    return getLeftEchelonShape(barItem, i)
  } else if (shapeType === 'rightEchelon') {
    return getRightEchelonShape(barItem, i)
  } else {
    return getNormalBarShape(barItem, i)
  }
}

function getGradientParams(barItem: _BarConfig, i: number) {
  const { barValueAxisPos, barLabelAxisPos, data } = barItem

  const { linePosition, axis } = barItem.valueAxis

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]
  const value = data[i]

  const [lineStart, lineEnd] = linePosition

  const valueAxisIndex = axis === 'x' ? 0 : 1

  let endPos = end

  if (!barItem.gradient.local) {
    endPos = value < 0 ? lineStart[valueAxisIndex] : lineEnd[valueAxisIndex]
  }

  if (axis === 'y') {
    return [labelAxisPos, endPos, labelAxisPos, start]
  } else {
    return [endPos, labelAxisPos, start, labelAxisPos]
  }
}

function getBarStyle(barItem: _BarConfig, i: number) {
  const { barStyle, gradient, color, independentColor, independentColors } = barItem

  const fillColor = [barStyle.fill || color]

  let gradientColor = deepMerge(fillColor, gradient.color)

  if (independentColor) {
    const idtColor = independentColors[i % independentColors.length]

    gradientColor = idtColor instanceof Array ? idtColor : [idtColor]
  }

  if (gradientColor.length === 1) gradientColor.push(gradientColor[0])

  const gradientParams = getGradientParams(barItem, i)

  return deepMerge(
    {
      gradientColor,
      gradientParams,
      gradientType: 'linear',
      gradientWith: 'fill',
    },
    barStyle
  )
}

function getBarConfig(barItem: _BarConfig) {
  const { barLabelAxisPos, animationCurve, animationFrame, rLevel } = barItem

  const name = getBarName(barItem)

  return barLabelAxisPos.map((_, i) => ({
    name,
    index: rLevel,
    animationCurve,
    animationFrame,
    shape: getBarShape(barItem, i),
    style: getBarStyle(barItem, i),
  }))
}

function getStartLeftEchelonShape(shape: PolylineShape, barItem: _BarConfig) {
  const axis = barItem.valueAxis.axis

  shape = deepClone(shape)

  const { points } = shape

  const index = axis === 'x' ? 0 : 1

  const start = points[2][index]

  points.forEach(point => (point[index] = start))

  return shape
}

function getStartRightEchelonShape(shape: PolylineShape, barItem: _BarConfig) {
  const axis = barItem.valueAxis.axis

  shape = deepClone(shape)

  const { points } = shape

  const index = axis === 'x' ? 0 : 1

  const start = points[2][index]

  points.forEach(point => (point[index] = start))

  return shape
}

function getStartNormalBarShape(shape: RectShape, barItem: _BarConfig) {
  const axis = barItem.valueAxis.axis

  let { x, y, w, h } = shape

  if (axis === 'x') {
    w = 0
  } else {
    y = y + h
    h = 0
  }

  return { x, y, w, h }
}

function getStartBarConfig(barItem: _BarConfig) {
  const configs = getBarConfig(barItem)

  const { shapeType } = barItem

  configs.forEach(config => {
    let { shape } = config

    if (shapeType === 'leftEchelon') {
      shape = getStartLeftEchelonShape(shape as PolylineShape, barItem)
    } else if (shapeType === 'rightEchelon') {
      shape = getStartRightEchelonShape(shape as PolylineShape, barItem)
    } else {
      shape = getStartNormalBarShape(shape as RectShape, barItem)
    }

    config.shape = shape
  })

  return configs
}

function beforeUpdateBar(graphs: Graph[], barItem: _BarConfig, i: number, updater: Updater) {
  const { render } = updater.charts

  const name = getBarName(barItem)

  if (!graphs[i] || graphs[i].name === name) return

  render.delGraph(graphs)

  graphs.splice(0)
}

function getBarGraphConstructor(barItem: _BarConfig) {
  const name = getBarName(barItem)

  return name === 'polyline' ? Polyline : Rect
}

function getFormatterLabels(barItem: _BarConfig): string[] {
  let { data, label } = barItem

  let { formatter } = label

  const dataStr = data.map(_ => _.toString())

  if (!formatter) return dataStr

  const type = typeof formatter

  if (type === 'string') return dataStr.map(_ => (formatter as string).replace('{value}', _))

  if (type === 'function')
    return data.map((d, i) => (formatter as Function)({ value: d, index: i }))

  return dataStr
}

function getOffsetedPoint([x, y]: PointCoordinate, [ox, oy]: PointCoordinate) {
  return [x + ox, y + oy]
}

function getLabelsPosition(barItem: _BarConfig) {
  const { label, barValueAxisPos, barLabelAxisPos } = barItem

  const { position, offset } = label

  const axis = barItem.valueAxis.axis

  return barValueAxisPos.map(([start, end], i) => {
    const labelAxisPos = barLabelAxisPos[i]
    let pos = [end, labelAxisPos]

    if (position === 'bottom') {
      pos = [start, labelAxisPos]
    }

    if (position === 'center') {
      pos = [(start + end) / 2, labelAxisPos]
    }

    if (axis === 'y') pos.reverse()

    return getOffsetedPoint(pos as PointCoordinate, offset)
  })
}

function getLabelShapes(barItem: _BarConfig) {
  const contents = getFormatterLabels(barItem)
  const position = getLabelsPosition(barItem)

  return position.map((pos, i) => ({
    position: pos,
    content: contents[i],
  }))
}

function getLabelStyle(barItem: _BarConfig) {
  let {
    color,
    label: { style },
    gradient: { color: gc },
  } = barItem

  if (gc.length) color = gc[0]

  style = deepMerge({ fill: color }, style)

  return style
}

function getLabelConfig(barItem: _BarConfig) {
  let { animationCurve, animationFrame, rLevel } = barItem

  const shapes = getLabelShapes(barItem)
  const style = getLabelStyle(barItem)

  return shapes.map(shape => ({
    name: 'text',
    index: rLevel,
    visible: barItem.label.show,
    animationCurve,
    animationFrame,
    shape,
    style,
  }))
}

export default function bar(charts: Charts, option: _Option): void {
  const { xAxis, yAxis, series } = option

  let bars: _BarConfig[] = []

  if (xAxis && yAxis && series) {
    const needBars = initNeedSeries(series, getDefaultConfig('bar'), 'bar') as _OptionSeriesItem<
      BarConfig
    >[]

    bars = setBarAxis(needBars, charts)

    bars = setBarPositionData(bars)

    bars = calcBarsPosition(bars)
  }

  doUpdate({
    charts,
    seriesConfig: bars.slice(-1),
    key: BarKey.BackgroundBar,
    getGraphConfig: getBackgroundBarConfig,
    getGraphConstructor: () => Rect,
  })

  bars.reverse()

  doUpdate({
    charts,
    seriesConfig: bars,
    key: BarKey.Bar,
    getGraphConfig: getBarConfig,
    getStartGraphConfig: getStartBarConfig,
    beforeUpdate: beforeUpdateBar,
    getGraphConstructor: getBarGraphConstructor,
  })

  doUpdate({
    charts,
    seriesConfig: bars,
    key: BarKey.BarLabel,
    getGraphConfig: getLabelConfig,
    getGraphConstructor: () => Text,
  })
}
