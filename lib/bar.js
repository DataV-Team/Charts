import { barConfig } from '../config'

import { deepClone } from '@jiaminghi/c-render/lib/util'

import { getColorFromRgbValue, getRgbaValue } from '@jiaminghi/color'

import { deepMerge, mergeSameStackData, getLinearGradientColor } from '../util'

export function bar (chart, option = {}) {
  const { xAxis, yAxis, series } = option

  if (!xAxis || !yAxis || !series) removeBars(chart)

  initChartBar(chart)

  let bars = series.filter(({ type }) => type === 'bar')

  if (!bars.length) return removeBars(chart)

  bars = mergeBarDefaultConfig(bars)

  bars = filterShowBars(bars)

  bars = setBarAxis(bars, chart)

  bars = setBarPositionData(bars, chart)

  bars = calcBarsPosition(bars, chart)

  delRedundanceBars(bars, chart)

  updateBackgroundBars(bars, chart)

  bars.reverse()

  updateBars(bars, chart)

  updateBarLabels(bars, chart)
}

function removeBars (chart) {
  const { bar, barLabels, backgroundBars, render } = chart

  if (bar) bar.forEach(barItem => barItem.forEach(l => render.delGraph(l)))
  if (barLabels) barLabels.forEach(labelItem => labelItem.forEach(l => render.delGraph(l)))
  if (backgroundBars) backgroundBars.forEach(b => render.delGraph(b))

  chart.bar = null
  chart.barLabels = null
  chart.backgroundBars = null
}

function initChartBar (chart) {
  if (!chart.bar) chart.bar = []
  if (!chart.barLabels) chart.barLabels = []
  if (!chart.backgroundBars) chart.backgroundBars = []
}

function mergeBarDefaultConfig (bars) {
  return bars.map(barItem => deepMerge(deepClone(barConfig, true), barItem))
}

function filterShowBars (bars) {
  return bars.filter(({ show }) => show === true)
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

  const pos = (value - min) / valueMinus * posMinus

  return pos + linePosition[0][coordinateIndex]
}

function delRedundanceBars (bars, chart) {
  const { bar, barLabels, render } = chart

  const barsNum = bars.length
  const cacheNum = bar.length

  if (cacheNum > barsNum) {
    const needDelBars = bar.splice(barsNum)
    const needDelBarLabels = barLabels.splice(linesNum)

    needDelBars.forEach(barItem => barItem.forEach(l => render.delGraph(l)))
    needDelBarLabels.forEach(labelItem => labelItem.forEach(l => render.delGraph(l)))
  }
}

function updateBackgroundBars (bars, chart) {
  const { backgroundBars, render } = chart

  const lastBar = bars.slice(-1)[0]

  if (backgroundBars.length) {
    changeBackgroundBar(backgroundBars, lastBar, render)
  } else {
    addBackgroundBar(lastBar, backgroundBars, render)
  }
}

function changeBackgroundBar (cache, lastBar, render) {
  const { animationCurve, animationFrame, backgroundBar } = lastBar

  const { show, style } = backgroundBar

  const width = getBackgroundBarWidth(lastBar)
  const shapes = getBackgroundBarsShapes(lastBar, width)

  balanceBackgroundBarNum(cache, shapes.length, lastBar, render)

  cache.forEach((graph, i) => {
    graph.visible = show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame

    graph.animation('shape', shapes[i], true)
    graph.animation('style', style, true)
  })
}

function balanceBackgroundBarNum (cache, num, lastBar, render) {
  const cacheNum = cache.length

  const { style } = lastBar.backgroundBar

  if (num > cacheNum) {
    const lastCacheBar = cache.slice(-1)[0]
    const needAddBars = new Array(num - cacheNum).fill(0)
      .map(foo => render.add({
        name: 'rect',
        animationCurve: lastCacheBar.animationCurve,
        animationFrame: lastCacheBar.animationFrame,
        shape: deepClone(lastCacheBar.shape, true),
        style
      }))

    cache.push(...needAddBars)
  } else if (num < cacheNum) {
    const needDelCache = cache.splice(num)

    needDelCache.forEach(b => render.delGraph(b))
  }
}

function addBackgroundBar (lastBar, backgroundBars, render) {
  const { animationCurve, animationFrame, backgroundBar } = lastBar

  const { show, style } = backgroundBar

  const width = getBackgroundBarWidth(lastBar)

  const shapes = getBackgroundBarsShapes(lastBar, width)

  backgroundBars.push(...shapes.map(shape => render.add({
    name: 'rect',
    visible: show,
    animationCurve,
    animationFrame,
    shape,
    style
  })))
}

function getBackgroundBarWidth (lastBar) {
  const { barAllWidthAndGap, barCategoryWidth, backgroundBar } = lastBar

  const { width } = backgroundBar

  if (typeof width === 'number') return width

  if (width === 'auto') return barAllWidthAndGap

  return parseInt(width) / 100 * barCategoryWidth
}

function getBackgroundBarsShapes (lastBar, width) {
  const { labelAxis, valueAxis } = lastBar

  const { tickPosition } = labelAxis

  const { axis, linePosition } = valueAxis

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

function updateBars (bars, chart) {
  const { render, bar: barCache } = chart

  bars.forEach((barItem, i) => {
    const { shapeType } = barItem

    let cache = barCache[i]

    if (cache && cache[0].shapeType !== shapeType) {
      cache.forEach(g => render.delGraph(g))

      cache = null
    }

    if (cache) {
      changeBars(cache, barItem, render)
    } else {
      addNewBars(barCache, barItem, i, render)
    }
  })
}

function changeBars (cache, barItem, render) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon' || shapeType === 'rightEchelon') {
    changeEchelonBar(cache, barItem, render)
  } else {
    changeNormalBar(cache, barItem, render)
  }
}

function changeEchelonBar (cache, barItem, render) {
  const { animationCurve, animationFrame } = barItem

  balanceBarNum(cache, barItem, render)

  const style = mergeColorAndGradient(barItem)

  cache.forEach((graph, i) => {
    const { points } = getEchelonBarShape(barItem, i)

    const gradientPos = getGradientPos(barItem, i)

    const pointsNum = points.length
    const cacheGraphPointsNum = graph.shape.points.length

    if (pointsNum > cacheGraphPointsNum) {
      graph.shape.points[3] = graph.shape.points[2]
    } else if (pointsNum < cacheGraphPointsNum) {
      graph.shape.points.splice(-1)
    }

    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', { points }, true)
    graph.animation('style', {
      ...style,
      gradientPos
    }, true)
  })
}

function changeNormalBar (cache, barItem, render) {
  const { animationCurve, animationFrame } = barItem

  balanceBarNum(cache, barItem, render)

  const style = mergeColorAndGradient(barItem)

  cache.forEach((graph, i) => {
    const shape = getNormalBarShape(barItem, i)

    const gradientPos = getGradientPos(barItem, i)

    mergeGradientColorNum(graph, style)
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', shape, true)
    graph.animation('style', {
      ...style,
      gradientPos
    }, true)
  })
}

function mergeGradientColorNum (graph, style) {
  const gradientColorNum = style.gradient.length
  const graphGradientColorNum = graph.style.gradient.length

  if (gradientColorNum > graphGradientColorNum) {
    const needAddGradientColor = new Array(gradientColorNum - graphGradientColorNum).fill(0)
      .map(foo => [0, 0, 0, 0])

    graph.style.gradient.push(...needAddGradientColor)
  } else {
    graph.style.gradient.splice(gradientColorNum)
  }
}

function balanceBarNum (cache, barItem, render) {
  const cacheGraphNum = cache.length
  const barNum = barItem.barLabelAxisPos.length

  const style = mergeColorAndGradient(barItem)

  if (barNum > cacheGraphNum) {
    const lastCacheBar = cache.slice(-1)[0]
    const needAddBars = new Array(barNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: lastCacheBar.name,
        shapeType: lastCacheBar.shapeType,
        animationCurve: lastCacheBar.animationCurve,
        animationFrame: lastCacheBar.animationFrame,
        shape: deepClone(lastCacheBar.shape, true),
        style: {
          ...style,
          gradientPos: deepClone(lastCacheBar.style.gradientPos)
        },
        beforeDraw: lastCacheBar.beforeDraw
      }))
    cache.push(...needAddBars)
  } else if (barNum < cacheGraphNum) {
    const needDelCache = cache.splice(barNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewBars (barCache, barItem, i, render) {
  const { shapeType } = barItem

  const graphs = []

  if (shapeType === 'leftEchelon' || shapeType === 'rightEchelon') {
    graphs.push(...addNewEchelonBar(barItem, render))
  } else {
    graphs.push(...addNewNormalBar(barItem, render))
  }

  barCache[i] = graphs
}

function addNewEchelonBar(barItem, render) {
  const { shapeType, animationCurve, animationFrame } = barItem

  const graphNum = barItem.barLabelAxisPos.length

  const style = mergeColorAndGradient(barItem)

  return new Array(graphNum).fill(0).map((foo, i) => {
    const shape = getEchelonBarShape(barItem, i)

    const gradientPos = getGradientPos(barItem, i)

    const startShape = getEchelonBarStartShape(shape, barItem)

    const graph = render.add({
      name: 'polyline',
      shapeType,
      animationCurve,
      animationFrame,
      shape: startShape,
      style: {
        ...style,
        gradientPos
      },
      beforeDraw: barBeforeDraw
    })

    graph.animation('shape', shape, true)
    return graph
  })
}

function getEchelonBarShape (barItem, i) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon') return getLeftEchelonShape (barItem, i)
  if (shapeType === 'rightEchelon') return getRightEchelonShape (barItem, i)
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

function getEchelonBarStartShape (shape, barItem) {
  const { shapeType } = barItem

  if (shapeType === 'leftEchelon') return getLeftEchelonShapeBarStartShape (shape, barItem)
  if (shapeType === 'rightEchelon') return getRightEchelonShapeBarStartShape (shape, barItem)
}

function getLeftEchelonShapeBarStartShape (shape, barItem) {
  const axis = barItem.valueAxis.axis

  shape = deepClone(shape)

  const { points } = shape

  const index = axis === 'x' ? 0 : 1

  const start = points[2][index]

  points.forEach(point => (point[index] = start))

  return shape
}

function getRightEchelonShapeBarStartShape (shape, barItem) {
  const axis = barItem.valueAxis.axis

  shape = deepClone(shape)

  const { points } = shape

  const index = axis === 'x' ? 0 : 1

  const start = points[2][index]

  points.forEach(point => (point[index] = start))

  return shape
}

function addNewNormalBar(barItem, render) {
  const { shapeType, animationCurve, animationFrame } = barItem

  const graphNum = barItem.barLabelAxisPos.length

  const style = mergeColorAndGradient(barItem)

  return new Array(graphNum).fill(0).map((foo, j) => {
    const shape = getNormalBarShape(barItem, j)

    const gradientPos = getGradientPos(barItem, j)

    const startShape = getNormalBarStartShape(shape, barItem)

    const graph = render.add({
      name: 'rect',
      shapeType,
      animationCurve,
      animationFrame,
      shape: startShape,
      style: {
        ...style,
        gradientPos
      },
      beforeDraw: barBeforeDraw
    })

    graph.animation('shape', shape, true)

    return graph
  })
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

function mergeColorAndGradient (barItem) {
  const { barStyle, gradient, color } = barItem

  let style = deepMerge({ fill: color }, barStyle)

  style = {
    ...style,
    gradient: gradient.color.map(c => getRgbaValue(c))
  }

  return style
}

function getGradientPos (barItem, i) {
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

  const position = [[endPos, labelAxisPos], [start, labelAxisPos]]

  if (axis === 'y') position.forEach(p => p.reverse())

  return position
}

function getNormalBarStartShape(shape, barItem) {
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

function barBeforeDraw ({ style }, { ctx }) {
  const { gradient, gradientPos } = style

  if (!gradient.length) return

  const [begin, end] = gradientPos

  const color = gradient.map(cv => getColorFromRgbValue(cv))

  ctx.fillStyle = getLinearGradientColor(ctx, begin, end, color)
}

function updateBarLabels(bars, chart) {
  const { render, barLabels: barLabelsCache } = chart

  bars.forEach((barItem, i) => {
    const cache = barLabelsCache[i]

    if (cache) {
      changeBarLabels(cache, barItem, render)
    } else {
      addNewBarLabels(barLabelsCache, barItem, i, render)
    }
  })
}

function changeBarLabels (cache, barItem, render) {
  let { data, label, animationCurve, animationFrame } = barItem

  let { show, formatter } = label

  balanceBarLabelsNum(cache, barItem, render)

  data = formatterData (data, formatter)
  const style = mergeLabelColor(barItem)
  const labelPosition = getLabelPosition(barItem)

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

function balanceBarLabelsNum (cache, barItem, render) {
  let { barLabelAxisPos } = barItem

  const style = mergeLabelColor(barItem)

  const labelsNum = barLabelAxisPos.length
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

function addNewBarLabels (barLabelsCache, barItem, i, render) {
  let { data, label, animationCurve, animationFrame } = barItem

  let { show, formatter } = label

  data = formatterData (data, formatter)

  const style = mergeLabelColor(barItem)

  const labelPosition = getLabelPosition(barItem)

  barLabelsCache[i] = labelPosition.map((pos, j) => render.add({
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

function mergeLabelColor (barItem) {
  let { color, label: { style }, gradient: { color: gc } } = barItem

  if (gc.length) color = gc[0]

  style = deepMerge({ fill: color }, style)

  return style
}

function getLabelPosition (barItem) {
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