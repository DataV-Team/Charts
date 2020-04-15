import { doUpdate } from '../class/updater.class'

import { xAxisConfig, yAxisConfig } from '../config'

import { filterNonNumber, deepMerge, mergeSameStackData } from '../util'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

const axisConfig = { xAxisConfig, yAxisConfig }

const { min, max, abs, pow } = Math

export function axis (chart, option = {}) {
  let { xAxis, yAxis, series } = option

  let allAxis = []

  if (xAxis && yAxis && series) {
    allAxis = getAllAxis(xAxis, yAxis)

    allAxis = mergeDefaultAxisConfig(allAxis)

    allAxis = allAxis.filter(({ show }) => show)
  
    allAxis = mergeDefaultBoundaryGap(allAxis)
  
    allAxis = calcAxisLabelData(allAxis, series)
  
    allAxis = setAxisPosition(allAxis)
  
    allAxis = calcAxisLinePosition(allAxis, chart)
  
    allAxis = calcAxisTickPosition(allAxis, chart)
  
    allAxis = calcAxisNamePosition(allAxis, chart)
  
    allAxis = calcSplitLinePosition(allAxis, chart)
  }

  doUpdate({
    chart,
    series: allAxis,
    key: 'axisLine',
    getGraphConfig: getLineConfig
  })

  doUpdate({
    chart,
    series: allAxis,
    key: 'axisTick',
    getGraphConfig: getTickConfig
  })

  doUpdate({
    chart,
    series: allAxis,
    key: 'axisLabel',
    getGraphConfig: getLabelConfig
  })

  doUpdate({
    chart,
    series: allAxis,
    key: 'axisName',
    getGraphConfig: getNameConfig
  })

  doUpdate({
    chart,
    series: allAxis,
    key: 'splitLine',
    getGraphConfig: getSplitLineConfig
  })

  chart.axisData = allAxis
}

function getAllAxis (xAxis, yAxis) {
  let [allXAxis, allYAxis] = [[], []]

  if (xAxis instanceof Array) {
    allXAxis.push(...xAxis)
  } else {
    allXAxis.push(xAxis)
  }

  if (yAxis instanceof Array) {
    allYAxis.push(...yAxis)
  } else {
    allYAxis.push(yAxis)
  }

  allXAxis.splice(2)
  allYAxis.splice(2)

  allXAxis = allXAxis.map((axis, i) => ({ ...axis, index: i, axis: 'x' }))
  allYAxis = allYAxis.map((axis, i) => ({ ...axis, index: i, axis: 'y' }))

  return [...allXAxis, ...allYAxis]
}

function mergeDefaultAxisConfig (allAxis) {
  let xAxis = allAxis.filter(({ axis }) => axis === 'x')
  let yAxis = allAxis.filter(({ axis }) => axis === 'y')

  xAxis = xAxis.map(axis => deepMerge(deepClone(xAxisConfig), axis))
  yAxis = yAxis.map(axis => deepMerge(deepClone(yAxisConfig), axis))

  return [...xAxis, ...yAxis]
}

function mergeDefaultBoundaryGap (allAxis) {
  const valueAxis = allAxis.filter(({ data }) => data === 'value')
  const labelAxis = allAxis.filter(({ data }) => data !== 'value')

  valueAxis.forEach(axis => {
    if (typeof axis.boundaryGap === 'boolean') return

    axis.boundaryGap = false
  })
  labelAxis.forEach(axis => {
    if (typeof axis.boundaryGap === 'boolean') return

    axis.boundaryGap = true
  })

  return [...valueAxis, ...labelAxis]
}

function calcAxisLabelData (allAxis, series) {
  let valueAxis = allAxis.filter(({ data }) => data === 'value')
  let labelAxis = allAxis.filter(({ data }) => data instanceof Array)

  valueAxis = calcValueAxisLabelData(valueAxis, series)
  labelAxis = calcLabelAxisLabelData(labelAxis)

  return [...valueAxis, ...labelAxis]
}

function calcValueAxisLabelData (valueAxis, series) {
  return valueAxis.map(axis => {
    const minMaxValue = getValueAxisMaxMinValue(axis, series)

    const [min, max] = getTrueMinMax(axis, minMaxValue)

    const interval = getValueInterval(min, max, axis)

    const { axisLabel: { formatter } } = axis

    let label = []

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
      label: getAfterFormatterLabel(label, formatter)
    }
  })
}

function getValueAxisMaxMinValue (axis, series) {
  series = series.filter(({ show, type }) => {
    if (show === false) return false

    if (type === 'pie') return false

    return true
  })

  if (series.length === 0) return [0, 0]
  
  const { index, axis: axisType } = axis

  series = mergeStackData(series)

  const axisName = axisType + 'Axis'

  let valueSeries = series.filter(s => s[axisName] === index)

  if (!valueSeries.length) valueSeries = series

  return getSeriesMinMaxValue(valueSeries)
}

function getSeriesMinMaxValue (series) {
  if (!series) return

  const minValue = Math.min(
    ...series
      .map(({ data }) => Math.min(...filterNonNumber(data)))
  )

  const maxValue = Math.max(
    ...series
      .map(({ data }) => Math.max(...filterNonNumber(data)))
  )

  return [minValue, maxValue]
}

function mergeStackData (series) {
  const seriesCloned = deepClone(series, true)

  series.forEach((item, i) => {
    const data = mergeSameStackData(item, series)

    seriesCloned[i].data = data
  })

  return seriesCloned
}

function getTrueMinMax ({ min, max, axis }, [minValue, maxValue]) {
  let [minType, maxType] = [typeof min, typeof max]

  if (!testMinMaxType(min)) {
    min = axisConfig[axis + 'AxisConfig'].min
    minType = 'string'
  }

  if (!testMinMaxType(max)) {
    max = axisConfig[axis + 'AxisConfig'].max
    maxType = 'string'
  }

  if (minType === 'string') {
    min = parseInt(minValue - abs(minValue * parseFloat(min) / 100))

    const lever = getValueLever(min)

    min = parseFloat((min / lever - 0.1).toFixed(1)) * lever
  }

  if (maxType === 'string') {
    max = parseInt(maxValue + abs(maxValue * parseFloat(max) / 100))

    const lever = getValueLever(max)

    max = parseFloat((max / lever + 0.1).toFixed(1)) * lever
  }

  return [min, max]
}

function getValueLever (value) {
  const valueString = abs(value).toString()

  const valueLength = valueString.length

  const firstZeroIndex = valueString.replace(/0*$/g, '').indexOf('0')

  let pow10Num = valueLength - 1

  if (firstZeroIndex !== -1) pow10Num -= firstZeroIndex

  return pow(10, pow10Num)
}

function testMinMaxType (val) {
  const valType = typeof val

  const isValidString = (valType === 'string' && /^\d+%$/.test(val))
  const isValidNumber = valType === 'number'

  return isValidString || isValidNumber
}

function getValueAxisLabelFromZero (min, max, interval) {
  let [negative, positive] = [[], []]
  let [currentNegative, currentPositive] = [0, 0]

  do {
    negative.push(currentNegative -= interval)
  } while (currentNegative > min)

  do {
    positive.push(currentPositive += interval)
  } while (currentPositive < max)

  return [...negative.reverse(), 0, ...positive]
}

function getValueAxisLabelFromMin (min, max, interval) {
  let [label, currentValue] = [[min], min]

  do {
    label.push(currentValue += interval)
  } while (currentValue < max)

  return label
}

function getAfterFormatterLabel (label, formatter) {
  if (!formatter) return label

  if (typeof formatter === 'string') label = label.map(l => formatter.replace('{value}', l))
  if (typeof formatter === 'function') label = label.map((value, index) => formatter({ value, index }))

  return label
}

function calcLabelAxisLabelData (labelAxis) {
  return labelAxis.map(axis => {
    const { data, axisLabel: { formatter } } = axis

    return { ...axis, label: getAfterFormatterLabel(data, formatter) }
  })
}

function getValueInterval (min, max, axis) {
  let { interval, minInterval, maxInterval, splitNumber, axis: axisType } = axis

  const config = axisConfig[axisType + 'AxisConfig']

  if (typeof interval !== 'number') interval = config.interval
  if (typeof minInterval !== 'number') minInterval = config.minInterval
  if (typeof maxInterval !== 'number') maxInterval = config.maxInterval
  if (typeof splitNumber !== 'number') splitNumber = config.splitNumber

  if (typeof interval === 'number') return interval

  let valueInterval = parseInt((max - min) / (splitNumber - 1))

  if (valueInterval.toString().length > 1) valueInterval = parseInt(valueInterval.toString().replace(/\d$/, '0'))

  if (valueInterval === 0) valueInterval = 1

  if (typeof minInterval === 'number' && valueInterval < minInterval) return minInterval

  if (typeof maxInterval === 'number' && valueInterval > maxInterval) return maxInterval

  return valueInterval
}

function setAxisPosition (allAxis) {
  const xAxis = allAxis.filter(({ axis }) => axis === 'x')
  const yAxis = allAxis.filter(({ axis }) => axis === 'y')

  if (xAxis[0] && !xAxis[0].position) xAxis[0].position = xAxisConfig.position
  if (xAxis[1] && !xAxis[1].position) {
    xAxis[1].position = xAxis[0].position === 'bottom' ? 'top' : 'bottom'
  }

  if (yAxis[0] && !yAxis[0].position) yAxis[0].position = yAxisConfig.position
  if (yAxis[1] && !yAxis[1].position) {
    yAxis[1].position = yAxis[0].position === 'left' ? 'right' : 'left'
  }

  return [...xAxis, ...yAxis]
}

function calcAxisLinePosition (allAxis, chart) {
  const { x, y, w, h } = chart.gridArea

  allAxis = allAxis.map(axis => {
    const { position } = axis

    let linePosition = []

    if (position === 'left') {
      linePosition = [[x, y], [x, y + h]].reverse()
    } else if (position === 'right') {
      linePosition = [[x + w, y], [x + w, y + h]].reverse()
    } else if (position === 'top') {
      linePosition = [[x, y], [x + w, y]]
    } else if (position === 'bottom') {
      linePosition = [[x, y + h], [x + w, y + h]]
    }

    return {
      ...axis,
      linePosition
    }
  })

  return allAxis
}

function calcAxisTickPosition (allAxis, chart) {
  return allAxis.map(axisItem => {
    let { axis, linePosition, position, label, boundaryGap } = axisItem

    if (typeof boundaryGap !== 'boolean') boundaryGap = axisConfig[axis + 'AxisConfig'].boundaryGap

    const labelNum = label.length

    const [[startX, startY], [endX, endY]] = linePosition

    const gapLength = axis === 'x' ? endX - startX : endY - startY

    const gap = gapLength / (boundaryGap ? labelNum : labelNum - 1)

    const tickPosition = new Array(labelNum)
      .fill(0)
      .map((foo, i) => {
        if (axis === 'x') {
          return [startX + gap * (boundaryGap ? (i + 0.5) : i), startY]
        }

        return [startX, startY + gap * (boundaryGap ? (i + 0.5) : i)]
      })

    const tickLinePosition = getTickLinePosition(axis, boundaryGap, position, tickPosition, gap)

    return {
      ...axisItem,
      tickPosition,
      tickLinePosition,
      tickGap: gap
    }
  })
}

function getTickLinePosition (axisType, boundaryGap, position, tickPosition, gap) {
  let index = axisType === 'x' ? 1 : 0
  let plus = 5

  if (axisType === 'x' && position === 'top') plus = -5
  if (axisType === 'y' && position === 'left') plus = -5

  let tickLinePosition = tickPosition.map(lineStart => {
    const lineEnd = deepClone(lineStart)

    lineEnd[index] += plus

    return [deepClone(lineStart), lineEnd]
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

function calcAxisNamePosition (allAxis, chart) {
  return allAxis.map(axisItem => {
    let { nameGap, nameLocation, position, linePosition } = axisItem

    const [lineStart, lineEnd] = linePosition

    let namePosition = [...lineStart]

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
      ...axisItem,
      namePosition
    }
  })
}

function calcSplitLinePosition (allAxis, chart) {
  const { w, h } = chart.gridArea

  return allAxis.map(axisItem => {
    const { tickLinePosition, position, boundaryGap } = axisItem

    let [index, plus] = [0, w]

    if (position === 'top' || position === 'bottom') index = 1

    if (position === 'top' || position === 'bottom') plus = h

    if (position === 'right' || position === 'bottom') plus *= -1

    const splitLinePosition = tickLinePosition.map(([startPoint]) => {
      const endPoint = [...startPoint]
      endPoint[index] += plus

      return [[...startPoint], endPoint]
    })

    if (!boundaryGap) splitLinePosition.shift()

    return {
      ...axisItem,
      splitLinePosition
    }
  })
}

function getLineConfig (axisItem) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  return [{
    name: 'polyline',
    index: rLevel,
    visible: axisItem.axisLine.show,
    animationCurve,
    animationFrame,
    shape: getLineShape(axisItem),
    style: getLineStyle(axisItem)
  }]
}

function getLineShape (axisItem) {
  const { linePosition } = axisItem

  return {
    points: linePosition
  }
}

function getLineStyle (axisItem) {
  return axisItem.axisLine.style
}

function getTickConfig (axisItem) {
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
    style
  }))
}

function getTickShapes (axisItem) {
  const { tickLinePosition } = axisItem

  return tickLinePosition.map(points => ({ points }))
}

function getTickStyle (axisItem) {
  return axisItem.axisTick.style
}

function getLabelConfig (axisItem) {
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
    setGraphCenter: () => (void 0)
  }))
}

function getLabelShapes (axisItem) {
  const { label, tickPosition, position } = axisItem

  return tickPosition.map((point, i) => ({
    position: getLabelRealPosition(point, position),
    content: label[i].toString(),
  }))
}

function getLabelRealPosition (points, position) {
  let [index, plus] = [0, 10]

  if (position === 'top' || position === 'bottom') index = 1
  if (position === 'top' || position === 'left') plus = -10

  points = deepClone(points)
  points[index] += plus

  return points
}

function getLabelStyle (axisItem, shapes) {
  const { position } = axisItem

  let { style } = axisItem.axisLabel

  const align = getAxisLabelRealAlign(position)

  style = deepMerge(align, style)

  const styles = shapes.map(({ position }) => ({
    ...style,
    graphCenter: position
  }))

  return styles
}

function getAxisLabelRealAlign (position) {
  if (position === 'left') return {
    textAlign: 'right',
    textBaseline: 'middle'
  }

  if (position === 'right') return {
    textAlign: 'left',
    textBaseline: 'middle'
  }

  if (position === 'top') return {
    textAlign: 'center',
    textBaseline: 'bottom'
  }

  if (position === 'bottom') return {
    textAlign: 'center',
    textBaseline: 'top'
  }
}

function getNameConfig (axisItem) {
  const { animationCurve, animationFrame, rLevel } = axisItem

  return [{
    name: 'text',
    index: rLevel,
    animationCurve,
    animationFrame,
    shape: getNameShape(axisItem),
    style: getNameStyle(axisItem)
  }]
}

function getNameShape (axisItem) {
  const { name, namePosition } = axisItem

  return {
    content: name,
    position: namePosition
  }
}

function getNameStyle (axisItem) {
  const { nameLocation, position, nameTextStyle: style } = axisItem

  const align = getNameRealAlign(position, nameLocation)

  return deepMerge(align, style)
}

function getNameRealAlign (position, location) {
  if (
    (position === 'top' && location === 'start') ||
    (position === 'bottom' && location === 'start') ||
    (position === 'left' && location === 'center')
  ) return {
    textAlign: 'right',
    textBaseline: 'middle'
  }

  if (
    (position === 'top' && location === 'end') ||
    (position === 'bottom' && location === 'end') ||
    (position === 'right' && location === 'center')
  ) return {
    textAlign: 'left',
    textBaseline: 'middle'
  }

  if (
    (position === 'top' && location === 'center') ||
    (position === 'left' && location === 'end') ||
    (position === 'right' && location === 'end')
  ) return {
    textAlign: 'center',
    textBaseline: 'bottom'
  }

  if (
    (position === 'bottom' && location === 'center') ||
    (position === 'left' && location === 'start') ||
    (position === 'right' && location === 'start')
  ) return {
    textAlign: 'center',
    textBaseline: 'top'
  }
}

function getSplitLineConfig (axisItem) {
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
    style
  }))
}

function getSplitLineShapes (axisItem) {
  const { splitLinePosition } = axisItem

  return splitLinePosition.map(points => ({ points }))
}

function getSplitLineStyle (axisItem) {
  return axisItem.splitLine.style
}
