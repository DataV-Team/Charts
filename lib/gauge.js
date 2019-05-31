import { gaugeConfig } from '../config/gauge'

import { deepClone, getCircleRadianPoint } from '@jiaminghi/c-render/lib/util'

import { deepMerge } from '../util'

import { getRgbaValue } from '@jiaminghi/color'

export function gauge (chart, option = {}) {
  const { series } = option

  if (!series) return removeGauges(chart)
  
  initChartGauge(chart)

  let gauges = series.filter(({ type }) => type === 'gauge')

  if (!gauges.length) return removeGauges(chart)

  gauges = mergeGaugeDefaultConfig(gauges)

  gauges = filterShowGauges(gauges)

  gauges = calcGaugesCenter(gauges, chart)

  gauges = calcGaugesRadius(gauges, chart)

  gauges = calcGaugesDataRadiusAndLineWidth(gauges, chart)

  gauges = calcGaugesDataAngles(gauges, chart)

  gauges = calcGaugesDataGradient(gauges, chart)

  gauges = calcGaugesAxisTickPosition(gauges, chart)

  gauges = calcGaugesLabelPositionAndAlign(gauges, chart)

  gauges = calcGaugesLabelData(gauges, chart)

  delRedundanceGauges(gauges, chart)

  updateGaugesAxisTick(gauges, chart)

  updateGaugesAxisLabel(gauges, chart)

  updateGaugesBackgroundArc(gauges, chart)

  updateGaugesArc(gauges, chart)

  console.warn(gauges)
}

function removeGauges (chart) {

}

function initChartGauge (chart) {
  const { gaugeAxisTick, gaugeLabel, gaugeBackgroundArc, gaugeArc } = chart

  if (!gaugeAxisTick) chart.gaugeAxisTick = []
  if (!gaugeLabel) chart.gaugeLabel = []
  if (!gaugeBackgroundArc) chart.gaugeBackgroundArc = []
  if (!gaugeArc) chart.gaugeArc = []
}

function mergeGaugeDefaultConfig (gauges) {
  return gauges.map(gaugeItem => deepMerge(deepClone(gaugeConfig, true), gaugeItem))
}

function filterShowGauges (gauges) {
  return gauges.filter(({ show }) => show)
}

function calcGaugesCenter (gauges, chart) {
  const { area } = chart.render

  gauges.forEach(gaugeItem => {
    let { center } = gaugeItem

    center = center.map((pos, i) => {
      if (typeof pos === 'number') return pos

      return parseInt(pos) / 100 * area[i]
    })

    gaugeItem.center = center
  })

  return gauges
}

function calcGaugesRadius (gauges, chart) {
  const { area } = chart.render

  const maxRadius = Math.min(...area) / 2

  gauges.forEach(gaugeItem => {
    let { radius } = gaugeItem

    if (typeof radius !== 'number') {
      radius = parseInt(radius) / 100 * maxRadius
    }

    gaugeItem.radius = radius
  })

  return gauges
}

function calcGaugesDataRadiusAndLineWidth (gauges, chart) {
  const { area } = chart.render

  const maxRadius = Math.min(...area)

  gauges.forEach(gaugeItem => {
    const { radius, data, arcLineWidth } = gaugeItem

    data.forEach(item => {
      let { radius: arcRadius, lineWidth } = item

      if (!arcRadius) arcRadius = radius

      if (typeof arcRadius !== 'number') arcRadius = parseInt(arcRadius) / 100 * maxRadius

      item.radius = arcRadius

      if (!lineWidth) lineWidth = arcLineWidth

      item.lineWidth = lineWidth
    })
  })

  return gauges
}

function calcGaugesDataAngles (gauges, chart) {
  gauges.forEach(gaugeItem => {
    const { startAngle, endAngle, data, min, max } = gaugeItem
    
    const angleMinus = startAngle - endAngle
    const valueMinus = max - min

    data.forEach(item => {
      const { value } = item

      const itemAngle = Math.abs((value - min) / valueMinus * angleMinus)

      item.startAngle = startAngle
      item.endAngle = startAngle + itemAngle
    })
  })

  return gauges
}

function calcGaugesDataGradient (gauges, chart) {
  gauges.forEach(gaugeItem => {
    const { data } = gaugeItem

    data.forEach(item => {
      let { color, gradient } = item

      if (!gradient) gradient = color

      if (!(gradient instanceof Array)) gradient = [gradient]

      item.gradient = gradient
    })
  })

  return gauges
}

function calcGaugesAxisTickPosition (gauges, chart) {
  gauges.forEach(gaugeItem => {
    const { startAngle, endAngle, splitNum, center, radius, arcLineWidth, axisTick } = gaugeItem

    const { tickLength, style: { lineWidth } } = axisTick

    const angles = endAngle - startAngle

    const outerRadius = radius - (arcLineWidth / 2)
    const innerRadius = outerRadius - tickLength

    const angleGap = angles / (splitNum - 1)

    const arcLength = 2 * Math.PI * radius * angles / (Math.PI * 2)

    const offset = Math.ceil(lineWidth / 2) / arcLength * angles

    gaugeItem.tickAngles = []
    gaugeItem.tickInnerRadius = []

    gaugeItem.tickPosition = new Array(splitNum).fill(0)
      .map((foo, i) => {
        let angle = startAngle + angleGap * i

        if (i === 0) angle += offset
        if (i === splitNum - 1) angle -= offset

        gaugeItem.tickAngles[i] = angle
        gaugeItem.tickInnerRadius[i] = innerRadius

        return [
          getCircleRadianPoint(...center, outerRadius, angle),
          getCircleRadianPoint(...center, innerRadius, angle)
        ]
      })
  })

  return gauges
}

function calcGaugesLabelPositionAndAlign (gauges, chart) {
  gauges.forEach(gaugeItem => {
    const { center, tickInnerRadius, tickAngles, axisLabel: { labelGap } } = gaugeItem

    const position = tickAngles.map((angle, i) => getCircleRadianPoint(
      ...center,
      tickInnerRadius[i] - labelGap,
      tickAngles[i]
    ))

    const align = position.map(([x, y]) => ({
      textAlign: x > center[0] ? 'right' : 'left',
      textBaseline: y > center[1] ? 'bottom' : 'top'
    }))

    gaugeItem.labelPosition = position
    gaugeItem.labelAlign = align
  })

  return gauges
}

function calcGaugesLabelData (gauges, chart) {
  gauges.forEach(gaugeItem => {
    const { axisLabel, min, max, splitNum } = gaugeItem

    let { data, formatter } = axisLabel

    const valueGap = (max - min) / (splitNum - 1)

    const value = new Array(splitNum).fill(0).map((foo, i) => parseInt(min + valueGap * i))

    const formatterType = typeof formatter

    data = deepMerge(value, data).map((v, i) => {
      const label = v

      if (formatterType === 'string') {
        label = formatter.replace('{value}', v)
      }

      if (formatterType === 'function') {
        label = formatter({ value: v, index: i })
      }

      return label
    })

    axisLabel.data = data
  })

  return gauges
}

function delRedundanceGauges (gauges, chart) {
  const { gaugeAxisTick, gaugeLabel, gaugeBackgroundArc, render } = chart

  const gaugesNum = gauges.length
  const cacheNum = gaugeBackgroundArc.length

  if (cacheNum > gaugesNum) {
    const needDelGaugeAxisTicks = gaugeAxisTick.splice(gaugesNum)
    const needDelGaugeBackgroundArcs = gaugeBackgroundArc.splice(gaugesNum)
    const needDelGaugeLabels = gaugeLabel.splice(gaugesNum)

    needDelGaugeAxisTicks.forEach(items => items.forEach(g => render.delGraph(g)))
    needDelGaugeBackgroundArcs.forEach(g => render.delGraph(g))
    needDelGaugeLabels.forEach(item => item.forEach(g => render.delGraph(g)))
  }
}

function updateGaugesAxisTick (gauges, chart) {
  const { gaugeAxisTick: allCache } = chart

  gauges.forEach((gaugeItem, i) => {
    const cache = allCache[i]

    if (cache) {
      changeAxisTick(cache, gaugeItem, i, chart)
    } else {
      addNewAxisTick(allCache, gaugeItem, i, chart)
    }
  })
}

function changeAxisTick (cache, gaugeItem, i, chart) {
  const { animationCurve, animationFrame } = gaugeItem

  balanceAxisTickNum(cache, gaugeItem, i, chart)

  cache.forEach((graph, i) => {
    graph.visible = gaugeItem.axisTick.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getAxisTickShape(gaugeItem, i), true)
    graph.animation('style', getAxisTickStyle(gaugeItem, i), true)
  })
}

function balanceAxisTickNum (cache, gaugeItem, i, chart) {
  const cacheGraphNum = cache.length
  const tickNum = gaugeItem.tickPosition.length

  if (tickNum > cacheGraphNum) {
    const lastCacheAxisTick = cache.slice(-1)[0]
    const needAddAxisTicks = new Array(tickNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'polyline',
        animationCurve: lastCacheAxisTick.animationCurve,
        animationFrame: lastCacheAxisTick.animationFrame,
        shape: deepClone(lastCacheAxisTick.shape, true),
        style: getAxisTickStyle(gaugeItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddAxisTicks)
  } else if (tickNum < cacheGraphNum) {
    const needDelCache = cache.splice(tickNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewAxisTick (allCache, gaugeItem, i, chart) {
  const { render } = chart

  const { tickPosition, animationCurve, animationFrame } = gaugeItem

  const graphs = tickPosition.map((foo, j) => render.add({
    name: 'polyline',
    visible: gaugeItem.axisTick.show,
    animationCurve,
    animationFrame,
    shape: getAxisTickShape(gaugeItem, j),
    style: getAxisTickStyle(gaugeItem, j)
  }))

  allCache[i] = graphs
}

function getAxisTickShape (gaugeItem, i) {
  const { tickPosition } = gaugeItem

  return { points: tickPosition[i] }
}

function getAxisTickStyle (gaugeItem, i) {
  const { axisTick: { style } } = gaugeItem

  return style
}

function updateGaugesAxisLabel (gauges, chart) {
  const { gaugeLabel: allCache } = chart

  gauges.forEach((gaugeItem, i) => {
    const cache = allCache[i]

    if (cache) {
      changeGaugeAxisLabel(cache, gaugeItem, i, chart)
    } else {
      addNewGaugeAxisLabel(allCache, gaugeItem, i, chart)
    }
  })
}

function changeGaugeAxisLabel (cache, gaugeItem, i, chart) {
  const { animationCurve, animationFrame } = gaugeItem

  balanceAxisLabelNum(cache, gaugeItem, i, chart)

  cache.forEach((graph, j) => {
    graph.visible = gaugeItem.axisLabel.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getAxisLabelShape(gaugeItem, j), true)
    graph.animation('style', getAxisLabelStyle(gaugeItem, j), true)
  })
}

function balanceAxisLabelNum (cache, gaugeItem, i, chart) {
  const cacheGraphNum = cache.length
  const labelNum = gaugeItem.labelPosition.length

  if (labelNum > cacheGraphNum) {
    const lastCacheAxisLabel = cache.slice(-1)[0]
    const needAddAxisLabels = new Array(labelNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'text',
        animationCurve: lastCacheAxisLabel.animationCurve,
        animationFrame: lastCacheAxisLabel.animationFrame,
        shape: deepClone(lastCacheAxisLabel.shape, true),
        style: getAxisLabelStyle(gaugeItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddAxisLabels)
  } else if (labelNum < cacheGraphNum) {
    const needDelCache = cache.splice(labelNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewGaugeAxisLabel (allCache, gaugeItem, i, chart) {
  const { render } = chart

  const { animationCurve, animationFrame, labelPosition } = gaugeItem

  const graphs = labelPosition.map((foo, j) => render.add({
    name: 'text',
    visible: gaugeItem.axisLabel.show,
    animationCurve,
    animationFrame,
    shape: getAxisLabelShape(gaugeItem, j),
    style: getAxisLabelStyle(gaugeItem, j)
  }))

  allCache[i] = graphs
}

function getAxisLabelShape (gaugeItem, i) {
  const { labelPosition, axisLabel: { data } } = gaugeItem

  return {
    content: data[i].toString(),
    position: labelPosition[i]
  }
}

function getAxisLabelStyle (gaugeItem, i) {
  const { labelAlign, axisLabel } = gaugeItem

  const { style } = axisLabel

  return deepMerge({ ...labelAlign[i] }, style)
}

function updateGaugesBackgroundArc (gauges, chart) {
  const { gaugeBackgroundArc: allCache } = chart

  gauges.forEach((gaugeItem, i) => {
    const cache = allCache[i]

    if (cache) {
      changeBackgroundArc(cache, gaugeItem, i, chart)
    } else {
      addNewBackgroundArc(allCache, gaugeItem, i, chart)
    }
  })
}

function changeBackgroundArc (cache, gaugeItem, i, chart) {
  const { animationCurve, animationFrame } = gaugeItem

  cache.animationCurve = animationCurve
  cache.animationFrame = animationFrame
  cache.visible = gaugeItem.backgroundArc.show

  cache.animation('shape', getGaugeBackgroundArcShape(gaugeItem), true)
  cache.animation('style', getGaugeBackgroundArcStyle(gaugeItem), true)
}

function addNewBackgroundArc (allCache, gaugeItem, i, chart) {
  const { render } = chart

  const { animationCurve, animationFrame } = gaugeItem

  const shape = getGaugeBackgroundArcShape(gaugeItem)
  const style = getGaugeBackgroundArcStyle(gaugeItem)

  const startShape = { ...shape }
  startShape.endAngle = shape.startAngle

  const graph = render.add({
    name: 'arc',
    animationCurve,
    animationFrame,
    visible: gaugeItem.backgroundArc.show,
    shape: startShape,
    style
  })

  graph.animation('shape', shape, true)

  allCache[i] = graph
}

function getGaugeBackgroundArcShape (gaugeItem) {
  let { startAngle, endAngle, center, radius } = gaugeItem

  return {
    rx: center[0],
    ry: center[1],
    r: radius,
    startAngle,
    endAngle
  }
}

function getGaugeBackgroundArcStyle (gaugeItem) {
  const { backgroundArc, arcLineWidth } = gaugeItem

  const { style } = backgroundArc

  return deepMerge({ lineWidth: arcLineWidth }, style)
}

function updateGaugesArc (gauges, chart) {
  const { gaugeArc: allCache } = chart

  gauges.forEach((gaugeItem, i) => {
    const cache = allCache[i]

    if (cache) {
      changeGaugeArc(cache, gaugeItem, i, chart)
    } else {
      addNewGaugeArc(allCache, gaugeItem, i, chart)
    }
  })
}

function changeGaugeArc (cache, gaugeItem, i, chart) {
  const { animationCurve, animationFrame } = gaugeItem

  balanceArcNum(cache, gaugeItem, i, chart)

  cache.forEach((graph, j) => {
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getGaugeArcShape(gaugeItem, j), true)
    graph.animation('style', getGaugeArcStyle(gaugeItem, j), true)
  })
}

function balanceArcNum (cache, gaugeItem, i, chart) {
  const cacheGraphNum = cache.length
  const arcNum = gaugeItem.data.length

  if (arcNum > cacheGraphNum) {
    const lastCacheArc = cache.slice(-1)[0]
    const needAddArcs = new Array(arcNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'agArc',
        animationCurve: lastCacheArc.animationCurve,
        animationFrame: lastCacheArc.animationFrame,
        shape: deepClone(lastCacheArc.shape, true),
        style: getAxisLabelStyle(gaugeItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddArcs)
  } else if (arcNum < cacheGraphNum) {
    const needDelCache = cache.splice(arcNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewGaugeArc (allCache, gaugeItem, i, chart) {
  const { render } = chart

  const { data, animationCurve, animationFrame } = gaugeItem

  const graphs = data.map((foo, j) => render.add({
    name: 'agArc',
    animationCurve,
    animationFrame,
    shape: getGaugeArcStartShape(gaugeItem, j),
    style: getGaugeArcStyle(gaugeItem, j)
  }))

  graphs.forEach((graph, j) => {
    graph.animation('shape', getGaugeArcShape(gaugeItem, j), true)
  })

  allCache[i] = graphs
}

function getGaugeArcStartShape (gaugeItem, i) {
  const shape = getGaugeArcShape(gaugeItem, i)

  const startShape = { ...shape }

  startShape.endAngle = shape.startAngle

  return startShape
}

function getGaugeArcShape (gaugeItem, i) {
  const { data, center } = gaugeItem

  const { radius, startAngle, endAngle } = data[i]

  return {
    rx: center[0],
    ry: center[1],
    r: radius,
    startAngle,
    endAngle
  }
}

function getGaugeArcStyle (gaugeItem, i) {
  const { data, arcItemStyle } = gaugeItem

  let { lineWidth, gradient } = data[i]

  gradient = gradient.map(c => getRgbaValue(c))

  return deepMerge({ lineWidth, gradient }, arcItemStyle)
}