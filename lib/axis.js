const { min, max, abs, pow, ceil, floor } = Math

import { axisConfig } from '../config'

import { filterNonNumber, deepMerge, mergeSameStackData } from '../util'

import { deepClone } from '@jiaminghi/c-render/lib/util'

const { xAxisConfig, yAxisConfig } = axisConfig

export function axis (chart, option = {}) {
  let { xAxis, yAxis, series } = option

  if (!xAxis || !yAxis || !series) return removeAxis(chart)

  initChartAxis(chart)

  let allAxis = getAllAxis(xAxis, yAxis)

  allAxis = mergeDefaultAxisConfig(allAxis)

  allAxis = mergeDefaultBoundaryGap(allAxis)

  allAxis = calcAxisLabelData(allAxis, series)

  allAxis = setAxisPosition(allAxis)

  allAxis = calcAxisLinePosition(allAxis, chart)

  allAxis = calcAxisTickPosition(allAxis, chart)

  allAxis = calcAxisNamePosition(allAxis, chart)

  allAxis = calcSplitLinePosition(allAxis, chart)

  delRedundanceAxisGraph(allAxis, chart)

  updateAxisLine(allAxis, chart)

  updateAxisTick(allAxis, chart)

  updateAxisLabel(allAxis, chart)
  
  updateAxisName(allAxis, chart)

  updateSplitLine(allAxis, chart)

  chart.axisData = allAxis
}

function removeAxis (chart) {
  const { axisLabel, axisLine, axisName, axisTick, splitLine, render } = chart

  if (axisLabel) {
    axisLabel.map(({ graphs }) => graphs.forEach(g => render.delGraph(g)))

    chart.axisLabel = []
  }

  if (axisLine) {
    axisLine.forEach(g => render.delGraph(g))

    chart.axisLine = []
  }

  if (axisName) {
    axisName.forEach(g => render.delGraph(g))

    chart.axisName = []
  }

  if (axisTick) {
    axisTick.map(({ graphs }) => graphs.forEach(g => render.delGraph(g)))

    chart.axisTick = []
  }

  if (splitLine) {
    axisTick.map(({ graphs }) => graphs.forEach(g => render.delGraph(g)))

    chart.splitLine = []
  }
}

function initChartAxis (chart) {
  if (!chart.axisLine) chart.axisLine = []
  if (!chart.axisTick) chart.axisTick = []
  if (!chart.axisLabel) chart.axisLabel = []
  if (!chart.axisName) chart.axisName = []
  if (!chart.splitLine) chart.splitLine = []
}

function mergeDefaultAxisConfig (allAxis) {
  let xAxis = allAxis.filter(({ axis }) => axis === 'x')
  let yAxis = allAxis.filter(({ axis }) => axis === 'y')

  xAxis = xAxis.map(axis => deepMerge(deepClone(xAxisConfig), axis))
  yAxis = yAxis.map(axis => deepMerge(deepClone(yAxisConfig), axis))

  return [...xAxis, ...yAxis]
}

function delRedundanceAxisGraph (allAxis, chart) {
  const { axisLabel, axisLine, axisName, axisTick, splitLine, render } = chart

  const axis = allAxis.map(({ axis, index }) => axis + index)

  const needDelAxisLabels = axisLabel.filter(({ axisIndex }) => !axis.find(ai => ai === axisIndex))

  if (needDelAxisLabels.length) {
    needDelAxisLabels.forEach(item => {
      item.graphs.forEach(g => render.delGraph(g))
      item.graphs = null
    })

    chart.axisLabel = axisLabel.filter(item => item.graphs)
  }

  const needDelAxisLines = axisLine.filter(({ axisIndex }) => !axis.find(ai => ai === axisIndex))

  if (needDelAxisLines.length) {
    needDelAxisLines.forEach(g => {
      render.delGraph(g)
      g.needDel = true
    })

    chart.axisLine = axisLine.filter(({ needDel }) => !needDel)
  }

  const needDelAxisNames = axisName.filter(({ axisIndex }) => !axis.find(ai => ai === axisIndex))

  if (needDelAxisNames.length) {
    needDelAxisNames.forEach(g => {
      render.delGraph(g)
      g.needDel = true
    })

    chart.axisName = axisName.filter(({ needDel }) => !needDel)
  }

  const needDelAxisTicks = axisTick.filter(({ axisIndex }) => !axis.find(ai => ai === axisIndex))

  if (needDelAxisTicks.length) {
    needDelAxisTicks.forEach(item => {
      item.graphs.forEach(g => render.delGraph(g))
      item.graphs = null
    })

    chart.axisTick = axisTick.filter(item => item.graphs)
  }

  const needDelSplitLine = splitLine.filter(({ axisIndex }) => !axis.find(ai => ai === axisIndex))

  if (needDelSplitLine.length) {
    needDelSplitLine.forEach(item => {
      item.graphs.forEach(g => render.delGraph(g))
      item.graphs = null
    })

    chart.splitLine = splitLine.filter(item => item.graphs)
  }
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

  const minValue = min(
    ...series
      .map(({ data }) => min(...filterNonNumber(data)))
  )

  const maxValue = max(
    ...series
      .map(({ data }) => max(...filterNonNumber(data)))
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
  if (typeof formatter === 'function') label = label.map(l => formatter(l))

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
  const { x, y, w, h } = chart.grid.area

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
  const { w, h } = chart.grid.area

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

function updateAxisLine (allAxis, chart) {
  const { axisLine: axisLineCache } = chart

  allAxis.forEach(axisItem => {
    const { axis: axisType, index } = axisItem

    const axisIndex = axisType + index

    let graph = axisLineCache.find(({ axisIndex: ai }) => axisIndex === ai)

    if (graph) {
      changeAxisLine(graph, axisItem)
    } else {
      addAxisLine(axisLineCache, axisItem, chart, axisIndex)
    }
  })
}

function changeAxisLine (axisLineGraph, axisItem) {
  const { linePosition, axisLine, animationCurve, animationFrame } = axisItem

  const { show, style } = axisLine

  axisLineGraph.visible = show
  axisLineGraph.animationCurve = animationCurve
  axisLineGraph.animationFrame = animationFrame
  axisLineGraph.animation('shape', { points: linePosition }, true)
  axisLineGraph.animation('style', style, true)
}

function addAxisLine (axisLineCache, axisItem, chart, axisIndex) {
  const { render } = chart

  const { linePosition, axisLine, animationCurve, animationFrame } = axisItem

  const { show, style } = axisLine

  axisLineCache.push(render.add({
    axisIndex,
    name: 'polyline',
    animationCurve,
    animationFrame,
    visible: show,
    shape: {
      points: linePosition
    },
    style: style
  }))
}

function updateAxisTick (allAxis, chart) {
  const { axisTick: axisTickCache } = chart

  allAxis.forEach(axisItem => {
    const { axis: axisType, index } = axisItem

    const axisIndex = axisType + index

    let ticks = axisTickCache.find(({ axisIndex: ai }) => axisIndex === ai)

    if (ticks) {
      changeAxisTick(ticks, axisItem, chart)
    } else {
      addAxisTick(axisTickCache, axisItem, chart, axisIndex)
    }
  })
}

function changeAxisTick (ticks, axisItem, chart) {
  const { render } = chart

  const { graphs } = ticks

  const { tickLinePosition, axisTick, animationCurve, animationFrame } = axisItem

  const { show, style } = axisTick

  const graphsNum = graphs.length
  const ticksNum = tickLinePosition.length

  if (graphsNum > ticksNum) {
    graphs.splice(ticksNum).forEach(t => render.delGraph(t))
  } else if (graphsNum < ticksNum) {
    const lastTickGraphShape = graphs[graphsNum - 1].shape

    graphs.push(...new Array(ticksNum - graphsNum)
      .fill(0)
      .map(foo => render.add({
        name: 'polyline',
        animationCurve,
        animationFrame,
        visible: show,
        shape: lastTickGraphShape,
        style
      })))
  }

  graphs.forEach((tick, i) => {
    tick.visible = show
    tick.animationCurve = animationCurve
    tick.animationFrame = animationFrame
    tick.animation('shape', { points: tickLinePosition[i] }, true)
    tick.animation('style', style, true)
  })
}

function addAxisTick (axisTickCache, axisItem, chart, axisIndex) {
  const { render } = chart

  const { tickLinePosition, axisTick, animationCurve, animationFrame } = axisItem

  const { show, style } = axisTick

  const graphs = tickLinePosition.map(points => render.add({
    name: 'polyline',
    visible: show,
    animationCurve,
    animationFrame,
    shape: {
      points
    },
    style
  }))

  axisTickCache.push({
    axisIndex,
    graphs
  })
}

function updateAxisLabel (allAxis, chart) {
  const { axisLabel: axisLabelCache } = chart

  allAxis.forEach(axisItem => {
    const { axis: axisType, index } = axisItem

    const axisIndex = axisType + index

    let labels = axisLabelCache.find(({ axisIndex: ai }) => axisIndex === ai)

    if (labels) {
      changeAxisLabel(labels, axisItem, chart)
    } else {
      addAxisLabel(axisLabelCache, axisItem, chart, axisIndex)
    }
  })
}

function changeAxisLabel (labels, axisItem, chart) {
  const { render } = chart

  const { graphs } = labels

  const { tickPosition, label, axisLabel, position, animationCurve, animationFrame } = axisItem

  let { show, style } = axisLabel

  style = mergeAxisLabelAlign(style, position)

  const graphsNum = graphs.length
  const labelsNum = tickPosition.length

  if (graphsNum > labelsNum) {
    graphs.splice(labelsNum).forEach(l => render.delGraph(l))
  } else if (graphsNum < labelsNum) {
    const lastAxisLabelShape = graphs[graphsNum - 1].shape

    graphs.push(...new Array(labelsNum - graphsNum)
      .fill(0)
      .map(foo => render.add({
        name: 'text',
        visible: show,
        animationCurve,
        animationFrame,
        shape: lastAxisLabelShape,
        style
      })))
  }

  graphs.forEach((labelItem, i) => {
    const shapePosition = getAxisLabelRealPosition(tickPosition[i], position)
    labelItem.visible = show
    labelItem.animationCurve = animationCurve
    labelItem.animationFrame = animationFrame
    labelItem.shape.content = label[i].toString()
    labelItem.animation('shape', { position: shapePosition }, true)
    labelItem.animation('style', { ...style, graphCenter: shapePosition }, true)
  })
}

function addAxisLabel (axisLabelCache, axisItem, chart, axisIndex) {
  const { render } = chart

  const { tickPosition, label, axisLabel, position, animationCurve, animationFrame } = axisItem

  let { show, style } = axisLabel

  style = mergeAxisLabelAlign(style, position)

  const graphs = tickPosition.map((labelPosition, i) => render.add({
    name: 'text',
    visible: show,
    animationCurve,
    animationFrame,
    position,
    shape: {
      content: label[i].toString(),
      position: getAxisLabelRealPosition(labelPosition, position)
    },
    style
  }))

  axisLabelCache.push({
    axisIndex,
    graphs
  })
}

function mergeAxisLabelAlign (style, position) {
  const align = getAxisLabelRealAlign(position)

  return deepMerge(align, style)
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

function getAxisLabelRealPosition (points, position) {
  let [index, plus] = [0, 10]

  if (position === 'top' || position === 'bottom') index = 1
  if (position === 'top' || position === 'left') plus = -10

  points = deepClone(points)
  points[index] += plus

  return points
}

function updateAxisName (allAxis, chart) {
  const { axisName: axisNameCache } = chart

  allAxis.forEach(axisItem => {
    const { axis: axisType, index } = axisItem

    const axisIndex = axisType + index

    let graph = axisNameCache.find(({ axisIndex: ai }) => axisIndex === ai)

    if (graph) {
      changeAxisName(graph, axisItem)
    } else {
      addAxisName(axisNameCache, chart, axisItem, axisIndex)
    }
  })
}

function changeAxisName (graph, axisItem) {
  const { position, name, namePosition, nameTextStyle, nameLocation } = axisItem

  const { animationCurve, animationFrame } = axisItem

  const style = mergeAxisNameAlign(nameTextStyle, position, nameLocation)

  graph.shape.content = name
  graph.animationCurve = animationCurve
  graph.animationFrame = animationFrame
  graph.animation('shape', { position: namePosition }, true)
  graph.animation('style', style, true)
}

function addAxisName (axisNameCache, chart, axisItem, axisIndex) {
  const { render } = chart

  const { position, name, namePosition, nameTextStyle, nameLocation } = axisItem

  const { animationCurve, animationFrame } = axisItem

  const style = mergeAxisNameAlign(nameTextStyle, position, nameLocation)

  axisNameCache.push(render.add({
    axisIndex,
    name: 'text',
    animationCurve,
    animationFrame,
    shape: {
      content: name,
      position: namePosition
    },
    style
  }))
}

function mergeAxisNameAlign (style, position, nameLocation) {
  const align = getAxisNameRealAlign(position, nameLocation)

  return deepMerge(align, style)
}

function getAxisNameRealAlign (position, location) {
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

function updateSplitLine (allAxis, chart) {
  const { splitLine: splitLineCache } = chart

  allAxis.forEach(axisItem => {
    const { axis, index } = axisItem

    const axisIndex = axis + index

    let splitLines = splitLineCache.find(({ axisIndex: ai }) => axisIndex === ai)

    if (splitLines) {
      changeSplitLine(splitLines, axisItem, chart)
    } else {
      addSplitLine(splitLineCache, axisItem, chart, axisIndex)
    }
  })
}

function changeSplitLine (splitLines, axisItem, chart) {
  const { render } = chart

  let { splitLinePosition, splitLine, animationCurve, animationFrame } = axisItem

  let { show, style } = splitLine

  const { graphs } = splitLines

  const graphsNum = graphs.length
  const splitLinesNum = splitLinePosition.length

  if (graphsNum > splitLinesNum) {
    graphs.splice(splitLinesNum).forEach(t => render.delGraph(t))
  } else if (graphsNum < splitLinesNum) {
    const lastSplitLineShape = graphs[graphsNum - 1].shape

    graphs.push(...new Array(splitLinesNum - graphsNum)
      .fill(0)
      .map(foo => render.add({
        name: 'polyline',
        animationCurve,
        animationFrame,
        visible: show,
        shape: lastSplitLineShape,
        style
      })))
  }

  graphs.forEach((tick, i) => {
    tick.visible = show
    tick.animationCurve = animationCurve
    tick.animationFrame = animationFrame
    tick.animation('shape', { points: splitLinePosition[i] }, true)
    tick.animation('style', style, true)
  })
}

function addSplitLine (splitLineCache, axisItem, chart, axisIndex) {
  const { render } = chart

  let { splitLinePosition, splitLine, animationCurve, animationFrame } = axisItem

  let { show, style } = splitLine

  const graphs = splitLinePosition.map(points => render.add({
    name: 'polyline',
    visible: show,
    animationCurve,
    animationFrame,
    shape: {
      points
    },
    style
  }))

  splitLineCache.push({
    axisIndex,
    graphs
  })
}
