import { deepClone, deepMerge, isBoolean, filterNonNumber } from '../utils/common'
import { mergeSameStackData } from '../utils/core'
import {
  XAxisConfig,
  YAxisConfig,
  _AxisConfig,
  AxisConfig,
  AxisType,
  AxisPosition,
  AxisNameLocation,
} from '../types/config/axis'
import Charts from '..'
import { Option, OptionSeriesItem } from '../types/class/charts'
import { getDefaultConfig } from '../config'
import { LineConfig } from '../types/config/line'
import { BarConfig } from '../types/config/bar'
import { LineCoordinate, PointCoordinate, GraphStyleConfig } from '../types/common'
import { doUpdate } from '../utils/updater'
import { Polyline, Text } from '@jiaminghi/c-render'
import { TextShape } from '@jiaminghi/c-render/es/types/graphs/shape'

const axisDefaultConfig = {
  x: getDefaultConfig('xAxis'),
  y: getDefaultConfig('yAxis'),
}

function getAllAxis(
  xAxis: Partial<XAxisConfig> | Partial<XAxisConfig>[],
  yAxis: Partial<YAxisConfig> | Partial<YAxisConfig>[]
): Partial<_AxisConfig>[] {
  const [allXAxis, allYAxis]: [Partial<XAxisConfig>[], Partial<YAxisConfig>[]] = [[], []]

  if (Array.isArray(xAxis)) {
    allXAxis.push(...xAxis)
  } else {
    allXAxis.push(xAxis)
  }

  if (Array.isArray(yAxis)) {
    allYAxis.push(...yAxis)
  } else {
    allYAxis.push(yAxis)
  }

  allXAxis.splice(2)
  allYAxis.splice(2)

  const addAxisExtendAttr = (
    axis: Partial<AxisConfig>,
    index: number,
    axisType: AxisType
  ): Partial<_AxisConfig> => ({
    ...axis,
    index,
    axis: axisType,
    linePosition: [
      [0, 0],
      [0, 0],
    ],
    label: [],
    minValue: NaN,
    maxValue: NaN,
    tickPosition: [],
    tickLinePosition: [],
    splitLinePosition: [],
    namePosition: [0, 0],
  })

  return [
    ...allXAxis.map<Partial<_AxisConfig>>((axis, i) => addAxisExtendAttr(axis, i, 'x')),
    ...allYAxis.map<Partial<_AxisConfig>>((axis, i) => addAxisExtendAttr(axis, i, 'y')),
  ]
}

function mergeDefaultAxisConfig(allAxis: Partial<_AxisConfig>[]): _AxisConfig[] {
  const xAxis = allAxis.filter(({ axis }) => axis === 'x')
  const yAxis = allAxis.filter(({ axis }) => axis === 'y')

  return [
    ...xAxis.map(_ => deepMerge(getDefaultConfig('xAxis') as _AxisConfig, _)),
    ...yAxis.map(_ => deepMerge(getDefaultConfig('yAxis') as _AxisConfig, _)),
  ]
}

function filterShowAxis(allAxis: _AxisConfig[]): _AxisConfig[] {
  return allAxis.filter(({ show }) => show)
}

function mergeDefaultBoundaryGap(allAxis: _AxisConfig[]): _AxisConfig[] {
  const valueAxis = allAxis.filter(({ data }) => data === 'value')
  const labelAxis = allAxis.filter(({ data }) => data !== 'value')

  return [
    ...valueAxis.map(_ => ({
      ..._,
      boundaryGap: isBoolean(_.boundaryGap) ? _.boundaryGap : false,
    })),
    ...labelAxis.map(_ => ({
      ..._,
      boundaryGap: isBoolean(_.boundaryGap) ? _.boundaryGap : true,
    })),
  ]
}

function mergeStackData(series: Partial<OptionSeriesItem>[]): Partial<OptionSeriesItem>[] {
  const seriesCloned = deepClone(series)

  const lineAndBarSeries = seriesCloned.filter(({ type }) => {
    return type === 'line' || type === 'bar'
  }) as (LineConfig | BarConfig)[]

  lineAndBarSeries.forEach((_, i) => {
    _.data = mergeSameStackData(lineAndBarSeries, i)
  })

  return seriesCloned
}

function getSeriesMinMaxValue(series: Partial<OptionSeriesItem>[]): [number, number] {
  const minValue = Math.min(...series.map(({ data }) => Math.min(...filterNonNumber(data!))))

  const maxValue = Math.max(...series.map(({ data }) => Math.max(...filterNonNumber(data!))))

  return [minValue, maxValue]
}

function getValueAxisMaxMinValue(
  axis: _AxisConfig,
  series: Partial<OptionSeriesItem>[]
): [number, number] {
  series = series.filter(({ show, type }) => {
    return (show = true && (type === 'line' || type === 'bar'))
  })

  if (series.length === 0) return [0, 0]

  const { index, axis: axisType } = axis

  series = mergeStackData(series)

  const axisName = (axisType + 'AxisIndex') as 'xAxisIndex' | 'yAxisIndex'

  let valueSeries = series.filter(_ => (_ as LineConfig | BarConfig)[axisName] === index)

  if (!valueSeries.length) valueSeries = series

  return getSeriesMinMaxValue(valueSeries)
}

function testMinMaxType(val: string | number): boolean {
  const valType = typeof val

  const isValidString = valType === 'string' && /^\d+%$/.test(val as string)
  const isValidNumber = valType === 'number'

  return isValidString || isValidNumber
}

function getValueLever(value: number) {
  const valueString = Math.abs(value).toString()

  const valueLength = valueString.length

  const firstZeroIndex = valueString.replace(/0*$/g, '').indexOf('0')

  let pow10Num = valueLength - 1

  if (firstZeroIndex !== -1) pow10Num -= firstZeroIndex

  return Math.pow(10, pow10Num)
}

function getTrueMinMax(
  { min, max, axis }: _AxisConfig,
  [minValue, maxValue]: [number, number]
): [number, number] {
  let [minType, maxType] = [typeof min, typeof max]

  if (!testMinMaxType(min)) {
    min = axisDefaultConfig[axis].min
    minType = 'string'
  }

  if (!testMinMaxType(max)) {
    max = axisDefaultConfig[axis].max
    maxType = 'string'
  }

  if (minType === 'string') {
    min = parseInt(minValue - Math.abs((minValue * parseFloat(min + '')) / 100) + '')

    const lever = getValueLever(min)

    min = parseFloat((min / lever - 0.1).toFixed(1)) * lever
  }

  if (maxType === 'string') {
    max = parseInt(maxValue + Math.abs((maxValue * parseFloat(max + '')) / 100) + '')

    const lever = getValueLever(max)

    max = parseFloat((max / lever + 0.1).toFixed(1)) * lever
  }

  return [min as number, max as number]
}

function getValueInterval(min: number, max: number, axis: _AxisConfig) {
  let { interval, minInterval, maxInterval, splitNumber, axis: axisType } = axis

  const config = axisDefaultConfig[axisType]

  if (typeof interval !== 'number') interval = config.interval
  if (typeof minInterval !== 'number') minInterval = config.minInterval
  if (typeof maxInterval !== 'number') maxInterval = config.maxInterval
  if (typeof splitNumber !== 'number') splitNumber = config.splitNumber

  if (typeof interval === 'number') return interval

  let valueInterval = parseInt((max - min) / (splitNumber - 1) + '')

  if (valueInterval.toString().length > 1)
    valueInterval = parseInt(valueInterval.toString().replace(/\d$/, '0'))

  if (valueInterval === 0) valueInterval = 1

  if (typeof minInterval === 'number' && valueInterval < minInterval) return minInterval

  if (typeof maxInterval === 'number' && valueInterval > maxInterval) return maxInterval

  return valueInterval
}

function getValueAxisLabelFromZero(min: number, max: number, interval: number): number[] {
  let [negative, positive]: [number[], number[]] = [[], []]
  let [currentNegative, currentPositive] = [0, 0]

  do {
    negative.push((currentNegative -= interval))
  } while (currentNegative > min)

  do {
    positive.push((currentPositive += interval))
  } while (currentPositive < max)

  return [...negative.reverse(), 0, ...positive]
}

function getValueAxisLabelFromMin(min: number, max: number, interval: number): number[] {
  let [label, currentValue] = [[min], min]

  do {
    label.push((currentValue += interval))
  } while (currentValue < max)

  return label
}

function getAfterFormatterLabel(
  labelValue: string[] | number[],
  formatter?: Function | string
): string[] {
  const defaultLabel = (labelValue as (string | number)[]).map(_ => _ + '')

  if (!formatter) return defaultLabel

  if (typeof formatter === 'string')
    return defaultLabel.map(_ => formatter.replace('{value}', _ + ''))

  if (typeof formatter === 'function')
    return defaultLabel.map((value, index) => formatter({ value, index }))

  return defaultLabel
}

function calcValueAxisLabelData(
  valueAxis: _AxisConfig[],
  series: Partial<OptionSeriesItem>[]
): _AxisConfig[] {
  return valueAxis.map(axis => {
    const minMaxValue = getValueAxisMaxMinValue(axis, series)

    const [min, max] = getTrueMinMax(axis, minMaxValue)

    const interval = getValueInterval(min, max, axis)

    const {
      axisLabel: { formatter },
    } = axis

    let label: number[] = []

    if (min < 0 && max > 0) {
      label = getValueAxisLabelFromZero(min, max, interval)
    } else {
      label = getValueAxisLabelFromMin(min, max, interval)
    }

    label = label.map(l => parseFloat(l.toFixed(2)))

    return {
      ...axis,
      maxValue: label.slice(-1)[0],
      minValue: label[0],
      label: getAfterFormatterLabel(label, formatter),
    }
  })
}

function calcLabelAxisLabelData(labelAxis: _AxisConfig[]) {
  return labelAxis.map(axis => {
    const {
      data,
      axisLabel: { formatter },
    } = axis

    return {
      ...axis,
      label: getAfterFormatterLabel(data as string[], formatter),
    }
  })
}

function calcAxisLabelData(
  allAxis: _AxisConfig[],
  series: Partial<OptionSeriesItem>[]
): _AxisConfig[] {
  let valueAxis = allAxis.filter(({ data }) => data === 'value')
  let labelAxis = allAxis.filter(({ data }) => Array.isArray(data))

  valueAxis = calcValueAxisLabelData(valueAxis, series)
  labelAxis = calcLabelAxisLabelData(labelAxis)

  return [...valueAxis, ...labelAxis]
}

function setAxisPosition(allAxis: _AxisConfig[]): _AxisConfig[] {
  const xAxis = allAxis.filter(({ axis }) => axis === 'x')
  const yAxis = allAxis.filter(({ axis }) => axis === 'y')

  if (xAxis[0] && !xAxis[0].position) xAxis[0].position = axisDefaultConfig.x.position
  if (xAxis[1] && !xAxis[1].position) {
    xAxis[1].position = xAxis[0].position === 'bottom' ? 'top' : 'bottom'
  }

  if (yAxis[0] && !yAxis[0].position) yAxis[0].position = axisDefaultConfig.y.position
  if (yAxis[1] && !yAxis[1].position) {
    yAxis[1].position = yAxis[0].position === 'left' ? 'right' : 'left'
  }

  return [...xAxis, ...yAxis]
}

function calcAxisLinePosition(allAxis: _AxisConfig[], charts: Charts): _AxisConfig[] {
  const { x, y, w, h } = charts.gridArea!

  allAxis = allAxis.map(axis => {
    const { position } = axis

    let linePosition!: LineCoordinate

    if (position === 'left') {
      linePosition = [
        [x, y],
        [x, y + h],
      ].reverse() as LineCoordinate
    } else if (position === 'right') {
      linePosition = [
        [x + w, y],
        [x + w, y + h],
      ].reverse() as LineCoordinate
    } else if (position === 'top') {
      linePosition = [
        [x, y],
        [x + w, y],
      ]
    } else if (position === 'bottom') {
      linePosition = [
        [x, y + h],
        [x + w, y + h],
      ]
    }

    return {
      ...axis,
      linePosition,
    }
  })

  return allAxis
}

function getTickLinePosition(
  axisType: AxisType,
  boundaryGap: boolean,
  position: AxisPosition,
  tickPosition: PointCoordinate[],
  gap: number
): LineCoordinate[] {
  let index = axisType === 'x' ? 1 : 0
  let plus = 5

  if (axisType === 'x' && position === 'top') plus = -5
  if (axisType === 'y' && position === 'left') plus = -5

  let tickLinePosition = tickPosition.map(lineStart => {
    const lineEnd = deepClone(lineStart)

    lineEnd[index] += plus

    return [deepClone(lineStart), lineEnd] as LineCoordinate
  })

  if (!boundaryGap) return tickLinePosition

  index = axisType === 'x' ? 0 : 1
  plus = gap / 2

  tickLinePosition.forEach(([lineStart, lineEnd]) => {
    lineStart[index] += plus
    lineEnd[index] += plus
  })

  return tickLinePosition
}

function calcAxisTickPosition(allAxis: _AxisConfig[], _charts: Charts): _AxisConfig[] {
  return allAxis.map(_ => {
    let { axis, linePosition, position, label, boundaryGap } = _

    const labelNum = label.length

    const [[startX, startY], [endX, endY]] = linePosition

    const gapLength = axis === 'x' ? endX - startX : endY - startY

    const gap = gapLength / (boundaryGap ? labelNum : labelNum - 1)

    const tickPosition = new Array(labelNum).fill(0).map<PointCoordinate>((_, i) => {
      if (axis === 'x') {
        return [startX + gap * (boundaryGap ? i + 0.5 : i), startY]
      }

      return [startX, startY + gap * (boundaryGap ? i + 0.5 : i)]
    })

    const tickLinePosition = getTickLinePosition(axis, boundaryGap!, position, tickPosition, gap)

    return {
      ..._,
      tickPosition,
      tickLinePosition,
      tickGap: gap,
    }
  })
}

function calcAxisNamePosition(allAxis: _AxisConfig[], _charts: Charts): _AxisConfig[] {
  return allAxis.map(_ => {
    let { nameGap, nameLocation, position, linePosition } = _

    const [lineStart, lineEnd] = linePosition

    let namePosition: PointCoordinate = [...lineStart]

    if (nameLocation === 'end') namePosition = [...lineEnd]

    if (nameLocation === 'center') {
      namePosition[0] = (lineStart[0] + lineEnd[0]) / 2
      namePosition[1] = (lineStart[1] + lineEnd[1]) / 2
    }

    let index = 0

    if (position === 'top' && nameLocation === 'center') index = 1
    if (position === 'bottom' && nameLocation === 'center') index = 1
    if (position === 'left' && nameLocation !== 'center') index = 1
    if (position === 'right' && nameLocation !== 'center') index = 1

    let plus = nameGap

    if (position === 'top' && nameLocation !== 'end') plus *= -1
    if (position === 'left' && nameLocation !== 'start') plus *= -1
    if (position === 'bottom' && nameLocation === 'start') plus *= -1
    if (position === 'right' && nameLocation === 'end') plus *= -1

    namePosition[index] += plus

    return {
      ..._,
      namePosition,
    }
  })
}

function calcSplitLinePosition(allAxis: _AxisConfig[], charts: Charts): _AxisConfig[] {
  const { w, h } = charts.gridArea!

  return allAxis.map(_ => {
    const { tickLinePosition, position, boundaryGap } = _

    let [index, plus] = [0, w]

    if (position === 'top' || position === 'bottom') index = 1

    if (position === 'top' || position === 'bottom') plus = h

    if (position === 'right' || position === 'bottom') plus *= -1

    const splitLinePosition = tickLinePosition.map(([startPoint]) => {
      const endPoint = [...startPoint]
      endPoint[index] += plus

      return [[...startPoint], endPoint] as LineCoordinate
    })

    if (!boundaryGap) splitLinePosition.shift()

    return {
      ..._,
      splitLinePosition,
    }
  })
}

function getLineShape(axisItem: _AxisConfig) {
  const { linePosition } = axisItem

  return {
    points: linePosition,
  }
}

function getLineStyle(axisItem: _AxisConfig) {
  return axisItem.axisLine.style
}

function getLineConfig(axisItem: _AxisConfig) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  return [
    {
      name: 'polyline',
      index: rLevel,
      visible: axisItem.axisLine.show,
      animationCurve,
      animationFrame,
      shape: getLineShape(axisItem),
      style: getLineStyle(axisItem),
    },
  ]
}

function getTickShapes(axisItem: _AxisConfig) {
  const { tickLinePosition } = axisItem

  return tickLinePosition.map(points => ({ points }))
}

function getTickStyle(axisItem: _AxisConfig) {
  return axisItem.axisTick.style
}

function getTickConfig(axisItem: _AxisConfig) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  const shapes = getTickShapes(axisItem)
  const style = getTickStyle(axisItem)

  return shapes.map(shape => ({
    name: 'polyline',
    index: rLevel,
    visible: axisItem.axisTick.show,
    animationCurve,
    animationFrame,
    shape,
    style,
  }))
}

function getLabelRealPosition(points: PointCoordinate, position: AxisPosition) {
  let [index, plus] = [0, 10]

  if (position === 'top' || position === 'bottom') index = 1
  if (position === 'top' || position === 'left') plus = -10

  points = deepClone(points)
  points[index] += plus

  return points
}

function getLabelShapes(axisItem: _AxisConfig) {
  const { label, tickPosition, position } = axisItem

  return tickPosition.map((point, i) => ({
    position: getLabelRealPosition(point, position),
    content: label[i].toString(),
  }))
}

function getAxisLabelRealAlign(position: AxisPosition) {
  if (position === 'left')
    return {
      textAlign: 'right',
      textBaseline: 'middle',
    }

  if (position === 'right')
    return {
      textAlign: 'left',
      textBaseline: 'middle',
    }

  if (position === 'top')
    return {
      textAlign: 'center',
      textBaseline: 'bottom',
    }

  if (position === 'bottom')
    return {
      textAlign: 'center',
      textBaseline: 'top',
    }

  return {
    textAlign: 'center',
    textBaseline: 'middle',
  }
}

function getLabelStyle(axisItem: _AxisConfig, shapes: Partial<TextShape>[]) {
  const { position } = axisItem

  let { style } = axisItem.axisLabel

  const align = getAxisLabelRealAlign(position)

  style = deepMerge(align, style) as GraphStyleConfig

  const styles = shapes.map(({ position }) => ({
    ...style,
    graphCenter: position,
  }))

  return styles
}

function getLabelConfig(axisItem: _AxisConfig) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  const shapes = getLabelShapes(axisItem)
  const styles = getLabelStyle(axisItem, shapes)

  return shapes.map((shape, i) => ({
    name: 'text',
    index: rLevel,
    visible: axisItem.axisLabel.show,
    animationCurve,
    animationFrame,
    shape,
    style: styles[i],
    setGraphCenter: () => void 0,
  }))
}

function getNameShape(axisItem: _AxisConfig) {
  const { name, namePosition } = axisItem

  return {
    content: name,
    position: namePosition,
  }
}

function getNameRealAlign(position: AxisPosition, location: AxisNameLocation) {
  if (
    (position === 'top' && location === 'start') ||
    (position === 'bottom' && location === 'start') ||
    (position === 'left' && location === 'center')
  )
    return {
      textAlign: 'right',
      textBaseline: 'middle',
    }

  if (
    (position === 'top' && location === 'end') ||
    (position === 'bottom' && location === 'end') ||
    (position === 'right' && location === 'center')
  )
    return {
      textAlign: 'left',
      textBaseline: 'middle',
    }

  if (
    (position === 'top' && location === 'center') ||
    (position === 'left' && location === 'end') ||
    (position === 'right' && location === 'end')
  )
    return {
      textAlign: 'center',
      textBaseline: 'bottom',
    }

  if (
    (position === 'bottom' && location === 'center') ||
    (position === 'left' && location === 'start') ||
    (position === 'right' && location === 'start')
  )
    return {
      textAlign: 'center',
      textBaseline: 'top',
    }

  return {
    textAlign: 'center',
    textBaseline: 'middle',
  }
}

function getNameStyle(axisItem: _AxisConfig) {
  const { nameLocation, position, nameTextStyle: style } = axisItem

  const align = getNameRealAlign(position, nameLocation)

  return deepMerge(align, style)
}

function getNameConfig(axisItem: _AxisConfig) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  return [
    {
      name: 'text',
      index: rLevel,
      animationCurve,
      animationFrame,
      shape: getNameShape(axisItem),
      style: getNameStyle(axisItem) as GraphStyleConfig,
    },
  ]
}

function getSplitLineShapes(axisItem: _AxisConfig) {
  const { splitLinePosition } = axisItem

  return splitLinePosition.map(points => ({ points }))
}

function getSplitLineStyle(axisItem: _AxisConfig) {
  return axisItem.splitLine.style
}

function getSplitLineConfig(axisItem: _AxisConfig) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  const shapes = getSplitLineShapes(axisItem)
  const style = getSplitLineStyle(axisItem)

  return shapes.map(shape => ({
    name: 'polyline',
    index: rLevel,
    visible: axisItem.splitLine.show,
    animationCurve,
    animationFrame,
    shape,
    style,
  }))
}

export function axis(charts: Charts, option: Option): void {
  let { xAxis, yAxis, series } = option

  let allAxis: _AxisConfig[] = []

  if (xAxis && yAxis && series) {
    const allPartialAxis = getAllAxis(xAxis, yAxis)

    allAxis = mergeDefaultAxisConfig(allPartialAxis)

    allAxis = filterShowAxis(allAxis)

    allAxis = mergeDefaultBoundaryGap(allAxis)

    allAxis = calcAxisLabelData(allAxis, series)

    allAxis = setAxisPosition(allAxis)

    allAxis = calcAxisLinePosition(allAxis, charts)

    allAxis = calcAxisTickPosition(allAxis, charts)

    allAxis = calcAxisNamePosition(allAxis, charts)

    allAxis = calcSplitLinePosition(allAxis, charts)
  }

  doUpdate({
    charts,
    seriesConfig: allAxis,
    key: 'axisLine',
    getGraphConfig: getLineConfig,
    GraphConstructor: Polyline,
  })

  doUpdate({
    charts,
    seriesConfig: allAxis,
    key: 'axisTick',
    getGraphConfig: getTickConfig,
    GraphConstructor: Polyline,
  })

  doUpdate({
    charts,
    seriesConfig: allAxis,
    key: 'axisLabel',
    getGraphConfig: getLabelConfig,
    GraphConstructor: Text,
  })

  doUpdate({
    charts,
    seriesConfig: allAxis,
    key: 'axisName',
    getGraphConfig: getNameConfig,
    GraphConstructor: Text,
  })

  doUpdate({
    charts,
    seriesConfig: allAxis,
    key: 'splitLine',
    getGraphConfig: getSplitLineConfig,
    GraphConstructor: Polyline,
  })

  charts.axisData = allAxis
}
