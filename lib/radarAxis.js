import { radarAxisConfig } from '../config/index'

import { deepClone, getCircleRadianPoint } from '@jiaminghi/c-render/lib/util'

import { deepMerge, getPointToLineDistance } from '../util'

export function radarAxis (chart, option = {}) {
  let { radar } = option

  if (!radar) return removeRadarAxis(chart)

  initChartRadarAxis(chart)

  let radarAxis = mergeRadarAxisDefaultConfig(radar)

  radarAxis = calcRadarAxisCenter(radarAxis, chart)

  radarAxis = calcRadarAxisRingRadius(radarAxis, chart)

  radarAxis = calcRadarAxisLinePosition(radarAxis)

  radarAxis = calcRadarAxisAreaRadius(radarAxis)

  radarAxis = calcRadarAxisNamePosition(radarAxis)

  updateSplitArea(radarAxis, chart)

  updateSplitLine(radarAxis, chart)
  
  updateAxisLine(radarAxis, chart)

  updateName(radarAxis, chart)

  chart.radarAxis = radarAxis
}

function removeRadarAxis (chart) {
  const { radarAxisLine, radarAxisSplitLine, radarAxisSplitArea, radarAxisName, render  } = chart

  if  (radarAxisLine) radarAxisLine.forEach(g => render.delGraph(g))
  if  (radarAxisSplitLine) radarAxisSplitLine.forEach(g => render.delGraph(g))
  if  (radarAxisSplitArea) radarAxisSplitArea.forEach(g => render.delGraph(g))
  if  (radarAxisName) radarAxisName.forEach(g => render.delGraph(g))

  chart.radarAxisLine = null
  chart.radarAxisSplitLine = null
  chart.radarAxisSplitArea = null
  chart.radarAxisName = null
}

function initChartRadarAxis (chart) {
  const { radarAxisLine, radarAxisSplitLine, radarAxisSplitArea, radarAxisName  } = chart

  if (!radarAxisLine) chart.radarAxisLine = []
  if (!radarAxisSplitLine) chart.radarAxisSplitLine = []
  if (!radarAxisSplitArea) chart.radarAxisSplitArea = []
  if (!radarAxisName) chart.radarAxisName = []
}

function mergeRadarAxisDefaultConfig (radar) {
  return deepMerge(deepClone(radarAxisConfig), radar)
}

function calcRadarAxisCenter (radarAxis, chart) {
  const { area } = chart.render

  const { center } = radarAxis

  radarAxis.centerPos = center.map((v, i) => {
    if (typeof v === 'number') return v

    return parseInt(v) / 100 * area[i]
  })

  return radarAxis
}

function calcRadarAxisRingRadius (radarAxis, chart) {
  const { area } = chart.render

  let { splitNum, radius } = radarAxis

  const maxRadius = Math.min(...area) / 2

  if (typeof radius !== 'number') radius = parseInt(radius) / 100 * maxRadius

  const splitGap = radius / splitNum

  radarAxis.ringRadius = new Array(splitNum).fill(0)
    .map((foo, i) => splitGap * (i + 1))

  radarAxis.radius = radius

  return radarAxis
}

function calcRadarAxisLinePosition (radarAxis) {
  const { indicator, centerPos, radius, startAngle } = radarAxis

  const fullAngle = Math.PI * 2

  const indicatorNum = indicator.length

  const indicatorGap = fullAngle / indicatorNum

  const angles = new Array(indicatorNum).fill(0)
    .map((foo, i) => indicatorGap * i + startAngle)
  
  radarAxis.axisLineAngles = angles

  radarAxis.axisLinePosition = angles.map(g => {
    return getCircleRadianPoint(...centerPos, radius, g)
  })

  return radarAxis
}

function calcRadarAxisAreaRadius (radarAxis) {
  const { ringRadius } = radarAxis

  const subRadius = ringRadius[0] / 2

  radarAxis.areaRadius = ringRadius.map(r => r - subRadius)

  return radarAxis
}

function calcRadarAxisNamePosition (radarAxis) {
  let { axisLineAngles, centerPos, radius, name } = radarAxis

  radius += name.nameGap

  radarAxis.namePosition = axisLineAngles.map(angle => 
    getCircleRadianPoint(...centerPos, radius, angle))

  return radarAxis
}

function updateSplitArea (radarAxis, chart) {
  const { radarAxisSplitArea: cache } = chart

  if (cache.length) keepSplitAreaShapeSame(radarAxis, cache, chart)

  if (cache.length) {
    changeSplitArea(radarAxis, cache, chart)
  } else {
    addNewSplitArea(radarAxis, chart)
  }
}

function keepSplitAreaShapeSame (radarAxis, cache, chart) {
  const { render } = chart

  const { polygon } = radarAxis

  const { name } = cache[0]

  const currenName = polygon ? 'regPolygon' : 'ring'

  const delAll = currenName !== name

  if (delAll) {
    cache.forEach(g => render.delGraph(g))

    cache.splice(0)
  }
}

function changeSplitArea (radarAxis, cache, chart) {
  const { animationCurve, animationFrame } = radarAxis

  balanceSplitAreaNum(radarAxis, cache, chart)

  cache.forEach((graph, i) => {
    const shape = getSplitLineShape(radarAxis, i)
    if (shape.side) graph.shape.side = shape.side
    graph.visible = radarAxis.splitArea.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', shape, true)
    graph.animation('style', getSplitAreaStyle(radarAxis, i), true)
  })
}

function balanceSplitAreaNum (radarAxis, cache, chart) {
  const { render } = chart

  const { areaRadius } = radarAxis

  const cacheNum = cache.length
  const needNum = areaRadius.length

  if (needNum > cacheNum) {
    const lastCache = cache.slice(-1)[0]
    const needAdd = new Array(needNum - cacheNum).fill(0)
      .map(foo => render.add({
        name: lastCache.name,
        visible: lastCache.visible,
        animationCurve: lastCache.animationCurve,
        animationFrame: lastCache.animationFrame,
        shape: deepClone(lastCache.shape, true),
        style: getSplitAreaStyle(radarAxis, cacheNum)
      }))

    cache.push(...needAdd)
  } else if (needNum < cacheNum) {
    cache.splice(needNum).forEach(g => render.delGraph(g))
  }
}

function addNewSplitArea (radarAxis, chart) {
  const { render } = chart

  let { areaRadius, polygon, animationCurve, animationFrame } = radarAxis

  const name = polygon ? 'regPolygon' : 'ring'

  chart.radarAxisSplitArea = areaRadius.map((foo, i) => render.add({
    name,
    visible: radarAxis.splitArea.show,
    animationCurve,
    animationFrame,
    shape: getSplitAreaShape(radarAxis, i),
    style: getSplitAreaStyle(radarAxis, i)
  }))
}

function getSplitAreaShape (radarAxis, i) {
  const { polygon, areaRadius, indicator, centerPos } = radarAxis

  const indicatorNum = indicator.length

  let shape = {
    rx: centerPos[0],
    ry: centerPos[1],
    r: areaRadius[i]
  }

  if (polygon) shape.side = indicatorNum

  return shape
}

function getSplitAreaStyle (radarAxis, i) {
  const { splitArea, ringRadius, axisLineAngles, polygon, centerPos } = radarAxis

  let { color, style } = splitArea

  style = {
    ...style,
    fill: 'rgba(0, 0, 0, 0)'
  }

  let lineWidth = ringRadius[0] - 0

  if (polygon) {
    const point1 = getCircleRadianPoint(...centerPos, ringRadius[0], axisLineAngles[0])
    const point2 = getCircleRadianPoint(...centerPos, ringRadius[0], axisLineAngles[1])

    lineWidth = getPointToLineDistance(centerPos, point1, point2)
  }

  style = deepMerge(deepClone(style, true), { lineWidth })

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { stroke: color[i % colorNum] })
}

function updateSplitLine (radarAxis, chart) {
  const { radarAxisSplitLine: cache } = chart

  if (cache.length) keepSplitLineShapeSame(radarAxis, cache, chart)

  if (cache.length) {
    changeSplitLine(radarAxis, cache, chart)
  } else {
    addNewSplitLine(radarAxis, chart)
  }
}

function keepSplitLineShapeSame (radarAxis, cache, chart) {
  const { render } = chart

  const { polygon } = radarAxis

  const { name } = cache[0]

  const currenName = polygon ? 'regPolygon' : 'ring'

  const delAll = currenName !== name

  if (delAll) {
    cache.forEach(g => render.delGraph(g))

    cache.splice(0)
  }
}

function changeSplitLine (radarAxis, cache, chart) {
  const { animationCurve, animationFrame } = radarAxis

  balanceSplitLineNum(radarAxis, cache, chart)

  cache.forEach((graph, i) => {
    const shape = getSplitLineShape(radarAxis, i)
    if (shape.side) graph.shape.side = shape.side
    graph.visible = radarAxis.splitLine.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', shape, true)
    graph.animation('style', getSplitLineStyle(radarAxis, i), true)
  })
}

function balanceSplitLineNum (radarAxis, cache, chart) {
  const { render } = chart

  const { ringRadius } = radarAxis

  const cacheNum = cache.length
  const needNum = ringRadius.length

  if (needNum > cacheNum) {
    const lastCache = cache.slice(-1)[0]
    const needAdd = new Array(needNum - cacheNum).fill(0)
      .map(foo => render.add({
        name: lastCache.name,
        visible: lastCache.visible,
        animationCurve: lastCache.animationCurve,
        animationFrame: lastCache.animationFrame,
        shape: deepClone(lastCache.shape, true),
        style: getSplitLineStyle(radarAxis, cacheNum)
      }))

    cache.push(...needAdd)
  } else if (needNum < cacheNum) {
    cache.splice(needNum).forEach(g => render.delGraph(g))
  }
}

function addNewSplitLine (radarAxis, chart) {
  const { render } = chart

  const { ringRadius, animationCurve, animationFrame, polygon } = radarAxis

  const name = polygon ? 'regPolygon' : 'ring'

  const graphs = ringRadius.map((foo, i) => render.add({
    name,
    visible: radarAxis.splitLine.show,
    animationCurve,
    animationFrame,
    shape: getSplitLineShape(radarAxis, i),
    style: getSplitLineStyle(radarAxis, i)
  }))

  chart.radarAxisSplitLine = graphs
}

function getSplitLineShape (radarAxis, i) {
  const { ringRadius, centerPos, indicator, polygon } = radarAxis

  const shape = {
    rx: centerPos[0],
    ry: centerPos[1],
    r: ringRadius[i]
  }

  const indicatorNum = indicator.length

  if (polygon) shape.side = indicatorNum

  return shape
}

function getSplitLineStyle (radarAxis, i) {
  const { splitLine } = radarAxis

  let { color, style } = splitLine

  style = {
    ...style,
    fill: 'rgba(0, 0, 0, 0)'
  }

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { stroke: color[i % colorNum] })
}

function updateAxisLine (radarAxis, chart) {
  const { radarAxisLine: cache } = chart

  if (cache.length) {
    changeAxisLine(radarAxis, cache, chart)
  } else {
    addNewAxisLine(radarAxis, chart)
  }
}

function changeAxisLine (radarAxis, cache, chart) {
  const { animationCurve, animationFrame } = radarAxis

  balanceAxisLineNum(radarAxis, cache, chart)

  cache.forEach((graph, i) => {
    graph.visible = radarAxis.axisLine.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getAxisLineShape(radarAxis, i), true)
    graph.animation('style', getAxisLineStyle(radarAxis, i), true)
  })
}

function balanceAxisLineNum (radarAxis, cache, chart) {
  const { render } = chart

  const { axisLinePosition } = radarAxis

  const cacheNum = cache.length
  const needNum = axisLinePosition.length

  if (needNum > cacheNum) {
    const lastCache = cache.slice(-1)[0]
    const needAdd = new Array(needNum - cacheNum).fill(0)
      .map(foo => render.add({
        name: 'polyline',
        visible: lastCache.visible,
        animationCurve: lastCache.animationCurve,
        animationFrame: lastCache.animationFrame,
        shape: deepClone(lastCache.shape, true),
        style: getAxisLineStyle(radarAxis, cacheNum)
      }))
    
    cache.push(...needAdd)
  } else if (needNum < cacheNum) {
    cache.splice(needNum).forEach(g => render.delGraph(g))
  }
}

function addNewAxisLine (radarAxis, chart) {
  const { render } = chart

  const { axisLinePosition, animationCurve, animationFrame } = radarAxis

  const graphs = axisLinePosition.map((foo, i) => render.add({
    name: 'polyline',
    visible: radarAxis.axisLine.show,
    animationCurve,
    animationFrame,
    shape: getAxisLineShape(radarAxis, i),
    style: getAxisLineStyle(radarAxis, i)
  }))

  chart.radarAxisLine = graphs
}

function getAxisLineShape (radarAxis, i) {
  const { centerPos, axisLinePosition } = radarAxis

  const points = [centerPos, axisLinePosition[i]]

  return { points }
}

function getAxisLineStyle (radarAxis, i) {
  const { axisLine } = radarAxis

  const { color, style } = axisLine

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { stroke: color[i % colorNum] })
}

function updateName (radarAxis, chart) {
  const { radarAxisName: cache } = chart

  if (cache.length) {
    changeName(radarAxis, cache, chart)
  } else {
    addNewName(radarAxis, chart)
  }
}

function changeName (radarAxis, cache, chart) {
  const { animationCurve, animationFrame } = radarAxis

  balanceNameNum(radarAxis, cache, chart)

  cache.forEach((graph, i) => {
    graph.visible = radarAxis.name.show
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getNameShape(radarAxis, i), true)
    graph.animation('style', getNameStyle(radarAxis, i), true)
  })
}

function balanceNameNum (radarAxis, cache, chart) {
  const { render } = chart

  const { indicator } = radarAxis

  const cacheNum = cache.length
  const needNum = indicator.length

  if (needNum > cacheNum) {
    const lastCache = cache.slice(-1)[0]
    const needAdd = new Array(needNum - cacheNum).fill(0)
      .map(foo => render.add({
        name: 'text',
        visible: lastCache.visible,
        animationCurve: lastCache.animationCurve,
        animationFrame: lastCache.animationFrame,
        shape: deepClone(lastCache.shape, true),
        style: getNameStyle(radarAxis, cacheNum)
      }))
    
    cache.push(...needAdd)
  } else if (needNum < cacheNum) {
    cache.splice(needNum).forEach(g => render.delGraph(g))
  }
}

function addNewName (radarAxis, chart) {
  const { render } = chart

  const { namePosition, animationCurve, animationFrame } = radarAxis

  const graphs = namePosition.map((foo, i) => render.add({
    name: 'text',
    visible: radarAxis.name.show,
    animationCurve,
    animationFrame,
    shape: getNameShape(radarAxis, i),
    style: getNameStyle(radarAxis, i)
  }))

  chart.radarAxisName = graphs
}

function getNameShape (radarAxis, i) {
  const { namePosition, indicator } = radarAxis

  return {
    content: indicator[i].name,
    position: namePosition[i]
  }
}

function getNameStyle (radarAxis, i) {
  const { name, centerPos: [x, y], namePosition } = radarAxis

  let { color, style } = name

  const [nameXpos, nameYPos] = namePosition[i]

  const textAlign = nameXpos > x ? 'left' : 'right'
  const textBaseline = nameYPos > y ? 'top' : 'bottom'

  style = deepMerge({
    textAlign,
    textBaseline
  }, style)

  if (!color.length) return style

  const colorNum = color.length

  return deepMerge(style, { fill: color[i % colorNum] })
}