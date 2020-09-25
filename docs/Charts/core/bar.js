import { doUpdate } from '../class/updater.class'

import { barConfig } from '../config'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import { deepMerge, initNeedSeries, mergeSameStackData } from '../util'

export function bar (chart, option = {}) {
  const { xAxis, yAxis, series } = option

  let bars = []

  if (xAxis && yAxis && series) {
    bars = initNeedSeries(series, barConfig, 'bar')

    bars = setBarAxis(bars, chart)

    bars = setBarPositionData(bars, chart)
  
    bars = calcBarsPosition(bars, chart)
  }

  doUpdate({
    chart,
    series: bars.slice(-1),
    key: 'backgroundBar',
    getGraphConfig: getBackgroundBarConfig
  })

  bars.reverse()

  doUpdate({
    chart,
    series: bars,
    key: 'bar',
    getGraphConfig: getBarConfig,
    getStartGraphConfig: getStartBarConfig,
    beforeUpdate: beforeUpdateBar
  })

  doUpdate({
    chart,
    series: bars,
    key: 'barLabel',
    getGraphConfig: getLabelConfig
  })
}

function setBarAxis (bars, chart) {
  const { axisData } = chart

  bars.forEach(bar => {
    let { xAxisIndex, yAxisIndex } = bar

    if (typeof xAxisIndex !== 'number') xAxisIndex = 0
    if (typeof yAxisIndex !== 'number') yAxisIndex = 0

    const xAxis = axisData.find(({ axis, index }) => `${axis}${index}` === `x${xAxisIndex}`)
    const yAxis = axisData.find(({ axis, index }) => `${axis}${index}` === `y${yAxisIndex}`)

    const axis = [xAxis, yAxis]

    const valueAxisIndex = axis.findIndex(({ data }) => data === 'value')

    bar.valueAxis = axis[valueAxisIndex]
    bar.labelAxis = axis[1 - valueAxisIndex]
  })

  return bars
}

function setBarPositionData (bars, chart) {
  const labelBarGroup = groupBarByLabelAxis(bars)

  labelBarGroup.forEach(group => {
    setBarIndex(group)
    setBarNum(group)
    setBarCategoryWidth(group, chart)
    setBarWidthAndGap(group)
    setBarAllWidthAndGap(group)
  })

  return bars
}

function setBarIndex (bars) {
  let stacks = getBarStack(bars)
  
  stacks = stacks.map(stack => ({ stack, index: -1 }))

  let currentIndex = 0

  bars.forEach(bar => {
    const { stack } = bar

    if (!stack) {
      bar.barIndex = currentIndex

      currentIndex++
    } else {
      const stackData = stacks.find(({ stack:s }) => s === stack)

      if (stackData.index === -1) {
        stackData.index = currentIndex

        currentIndex++
      }

      bar.barIndex = stackData.index
    }
  })
}

function groupBarByLabelAxis (bars) {
  let labelAxis = bars.map(({ labelAxis: { axis, index } }) => (axis + index))

  labelAxis = [...new Set(labelAxis)]

  return labelAxis.map(axisIndex => {
    return bars.filter(({ labelAxis: { axis, index } }) => (axis + index) === axisIndex)
  })
}

function getBarStack (bars) {
  const stacks = []

  bars.forEach(({ stack }) => {
    if (stack) stacks.push(stack)
  })

  return [...new Set(stacks)]
}

function setBarNum (bars) {
  const barNum = [...new Set(bars.map(({ barIndex}) => barIndex))].length

  bars.forEach(bar => (bar.barNum = barNum))
}

function setBarCategoryWidth (bars) {
  const lastBar = bars.slice(-1)[0]

  const { barCategoryGap, labelAxis: { tickGap } } = lastBar

  let barCategoryWidth = 0

  if (typeof barCategoryGap === 'number') {
    barCategoryWidth = barCategoryGap
  } else {
    barCategoryWidth = (1 - (parseInt(barCategoryGap) / 100)) * tickGap
  }

  bars.forEach(bar => (bar.barCategoryWidth = barCategoryWidth))
}

function setBarWidthAndGap (bars) {
  const { barCategoryWidth, barWidth, barGap, barNum } = bars.slice(-1)[0]

  let widthAndGap = []

  if (typeof barWidth === 'number' || barWidth !== 'auto') {
    widthAndGap = getBarWidthAndGapWithPercentOrNumber(barCategoryWidth, barWidth, barGap, barNum)
  } else if (barWidth === 'auto') {
    widthAndGap = getBarWidthAndGapWidthAuto(barCategoryWidth, barWidth, barGap, barNum)
  }

  const [width, gap] = widthAndGap

  bars.forEach(bar => {
    bar.barWidth = width
    bar.barGap = gap
  })
}

function getBarWidthAndGapWithPercentOrNumber (barCategoryWidth, barWidth, barGap) {
  let [width, gap] = [0, 0]

  if (typeof barWidth === 'number') {
    width = barWidth
  } else {
    width = parseInt(barWidth) / 100 * barCategoryWidth
  }

  if (typeof barGap === 'number') {
    gap = barGap
  } else {
    gap = parseInt(barGap) / 100 * width
  }

  return [width, gap]
}

function getBarWidthAndGapWidthAuto (barCategoryWidth, barWidth, barGap, barNum) {
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
      width = barItemWidth / percent * 10
      gap = barItemWidth - width
    }
  }

  return [width, gap]
}

function setBarAllWidthAndGap (bars) {
  const { barGap, barWidth, barNum } = bars.slice(-1)[0]

  const barAllWidthAndGap = (barGap + barWidth) * barNum - barGap

  bars.forEach(bar => (bar.barAllWidthAndGap = barAllWidthAndGap))
}

function calcBarsPosition (bars, chart) {
  bars = calcBarValueAxisCoordinate(bars)
  bars = calcBarLabelAxisCoordinate(bars)
  bars = eliminateNullBarLabelAxis(bars)
  bars = keepSameNumBetweenBarAndData(bars)

  return bars
}

function calcBarLabelAxisCoordinate (bars) {
  return bars.map(bar => {
    const { labelAxis, barAllWidthAndGap, barGap, barWidth, barIndex } = bar

    const { tickGap, tickPosition, axis } = labelAxis

    const coordinateIndex = axis === 'x' ? 0 : 1

    const barLabelAxisPos = tickPosition.map((tick, i) => {
      const barCategoryStartPos = tickPosition[i][coordinateIndex] - tickGap / 2

      const barItemsStartPos = barCategoryStartPos + (tickGap - barAllWidthAndGap) / 2

      return barItemsStartPos + (barIndex + 0.5) * barWidth + barIndex * barGap
    })

    return {
      ...bar,
      barLabelAxisPos
    }
  })
}

function calcBarValueAxisCoordinate (bars) {
  return bars.map(bar => {
    let data = mergeSameStackData(bar, bars)

    data = eliminateNonNumberData(bar, data)

    const { axis, minValue, maxValue, linePosition } = bar.valueAxis

    const startPos = getValuePos(
      minValue,
      maxValue,
      minValue < 0 ? 0 : minValue,
      linePosition,
      axis
    )

    const endPos = data.map(v => getValuePos(
      minValue,
      maxValue,
      v,
      linePosition,
      axis
    ))

    const barValueAxisPos = endPos.map(p => ([startPos, p]))

    return {
      ...bar,
      barValueAxisPos: barValueAxisPos
    }
  })
}

function eliminateNonNumberData (barItem, barData) {
  const { data } = barItem

  return barData
    .map((v, i) => typeof data[i] === 'number' ? v : null)
    .filter(d => d !== null)
}

function eliminateNullBarLabelAxis (bars) {
  return bars.map(bar => {
    const { barLabelAxisPos, data } = bar

    data.forEach((d, i) => {
      if (typeof d === 'number') return

      barLabelAxisPos[i] = null
    })

    return {
      ...bar,
      barLabelAxisPos: barLabelAxisPos.filter(p => p !== null)
    }
  })
}

function keepSameNumBetweenBarAndData (bars) {
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

function getValuePos (min, max, value, linePosition, axis) {
  if (typeof value !== 'number') return null

  const valueMinus = max - min

  const coordinateIndex = axis === 'x' ? 0 : 1

  const posMinus = linePosition[1][coordinateIndex] - linePosition[0][coordinateIndex]

  let percent = (value - min) / valueMinus

  if (valueMinus === 0) percent = 0

  const pos = percent * posMinus

  return pos + linePosition[0][coordinateIndex]
}

function getBackgroundBarConfig (barItem) {
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
    style
  }))
}

function getBackgroundBarShapes (barItem) {
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

function getBackgroundBarWidth (barItem) {
  const { barAllWidthAndGap, barCategoryWidth, backgroundBar } = barItem

  const { width } = backgroundBar

  if (typeof width === 'number') return width

  if (width === 'auto') return barAllWidthAndGap

  return parseInt(width) / 100 * barCategoryWidth
}

function getBackgroundBarStyle (barItem) {
  return barItem.backgroundBar.style
}

function getBarConfig (barItem) {
  const { barLabelAxisPos, animationCurve, animationFrame, rLevel } = barItem

  const name = getBarName(barItem)

  return barLabelAxisPos.map((foo, i) => ({
    name,
    index: rLevel,
    animationCurve,
    animationFrame,
    shape: getBarShape(barItem, i),
    style: getBarStyle(barItem, i)
  }))
}

function getBarName (barItem) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon' || shapeType === 'rightEchelon') return 'polyline'

  return 'rect'
}

function getBarShape (barItem, i) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon') {
    return getLeftEchelonShape(barItem, i)
  } else if (shapeType === 'rightEchelon') {
    return getRightEchelonShape(barItem, i)
  } else {
    return getNormalBarShape(barItem, i)
  }
}

function getLeftEchelonShape (barItem, i) {
  const { barValueAxisPos, barLabelAxisPos, barWidth, echelonOffset } = barItem

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]
  const halfWidth = barWidth / 2

  const valueAxis = barItem.valueAxis.axis

  const points = []

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

function getRightEchelonShape (barItem, i) {
  const { barValueAxisPos, barLabelAxisPos, barWidth, echelonOffset } = barItem

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]
  const halfWidth = barWidth / 2

  const valueAxis = barItem.valueAxis.axis

  const points = []

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

function getNormalBarShape (barItem, i) {
  const { barValueAxisPos, barLabelAxisPos, barWidth } = barItem

  const [start, end] = barValueAxisPos[i]
  const labelAxisPos = barLabelAxisPos[i]

  const valueAxis = barItem.valueAxis.axis

  const shape = {}

  if (valueAxis === 'x') {
    shape.x = start
    shape.y = labelAxisPos - barWidth / 2
    shape.w = end - start
    shape.h = barWidth
  } else {
    shape.x = labelAxisPos - barWidth / 2
    shape.y = end
    shape.w = barWidth
    shape.h = start - end
  }

  return shape
}

function getBarStyle (barItem, i) {
  const { barStyle, gradient, color, independentColor, independentColors } = barItem

  const fillColor = [barStyle.fill || color]

  let gradientColor = deepMerge(fillColor, gradient.color)

  if (independentColor) {
    const idtColor = independentColors[i % independentColors.length]

    gradientColor = idtColor instanceof Array ? idtColor : [idtColor]
  }

  if (gradientColor.length === 1) gradientColor.push(gradientColor[0])

  const gradientParams = getGradientParams(barItem, i)

  return deepMerge({
    gradientColor,
    gradientParams,
    gradientType: 'linear',
    gradientWith: 'fill'
  }, barStyle)
}

function getGradientParams (barItem, i) {
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

function getStartBarConfig (barItem) {
  const configs = getBarConfig(barItem)

  const { shapeType } = barItem

  configs.forEach(config => {
    let { shape } = config

    if (shapeType === 'leftEchelon') {
      shape = getStartLeftEchelonShape(shape, barItem)
    } else if (shapeType === 'rightEchelon') {
      shape = getStartRightEchelonShape(shape, barItem)
    } else {
      shape = getStartNormalBarShape(shape, barItem)
    }

    config.shape = shape
  })

  return configs
}

function getStartLeftEchelonShape (shape, barItem) {
  const axis = barItem.valueAxis.axis

  shape = deepClone(shape)

  const { points } = shape

  const index = axis === 'x' ? 0 : 1

  const start = points[2][index]

  points.forEach(point => (point[index] = start))

  return shape
}

function getStartRightEchelonShape (shape, barItem) {
  const axis = barItem.valueAxis.axis

  shape = deepClone(shape)

  const { points } = shape

  const index = axis === 'x' ? 0 : 1

  const start = points[2][index]

  points.forEach(point => (point[index] = start))

  return shape
}

function getStartNormalBarShape(shape, barItem) {
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

function beforeUpdateBar (graphs, barItem, i, updater) {
  const { render } = updater.chart

  const name = getBarName(barItem)

  if (graphs[i] && graphs[i][0].name !== name) {
    graphs[i].forEach(g => render.delGraph(g))

    graphs[i] = null
  }
}

function getLabelConfig (barItem) {
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
    style
  }))
}

function getLabelShapes (barItem) {
  const contents = getFormatterLabels (barItem)
  const position = getLabelsPosition(barItem)

  return position.map((pos, i) => ({
    position: pos,
    content: contents[i]
  }))
}

function getFormatterLabels (barItem) {
  let { data, label} = barItem

  let { formatter } = label

  data = data.filter(d => typeof d === 'number').map(d => d.toString())

  if (!formatter) return data

  const type = typeof formatter

  if (type === 'string') return data.map(d => formatter.replace('{value}', d))

  if (type === 'function') return data.map((d, i) => formatter({ value:d, index: i }))

  return data
}

function getLabelsPosition (barItem) {
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

    return getOffsetedPoint(pos, offset)
  })
}

function getOffsetedPoint ([x, y], [ox, oy]) {
  return [x + ox, y + oy]
}

function getLabelStyle (barItem) {
  let { color, label: { style }, gradient: { color: gc } } = barItem

  if (gc.length) color = gc[0]

  style = deepMerge({ fill: color }, style)

  return style
}
