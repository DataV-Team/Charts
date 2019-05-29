import { pieConfig } from '../config/pie'

import { deepClone, getCircleRadianPoint } from '@jiaminghi/c-render/lib/util'

import { deepMerge, mulAdd, getPolylineLength } from '../util'

export function pie (chart, option = {}) {
  const { series } = option

  if (!series) return removePies(chart)

  initChartPie(chart)

  let pies = series.filter(({ type }) => type === 'pie')

  if (!pies.length) return removePies(chart)

  pies = mergePieDefaultConfig(pies)

  pies = filterShowPies(pies)

  pies = calcPiesCenter(pies, chart)

  pies = calcPiesRadius(pies, chart)

  pies = calcRosePiesRadius(pies, chart)

  pies = calcPiesPercent(pies)

  pies = calcPiesAngle(pies, chart)

  pies = calcPiesInsideLabelPos(pies)

  pies = calcPiesEdgeCenterPos(pies)

  pies = calcPiesOutSideLabelPos(pies)

  delRedundancePies(pies, chart)

  updatePies(pies, chart)

  updateInsideLabel(pies, chart)

  updateOutsideLabelLine(pies, chart)

  updateOutsideLabel(pies, chart)
}

function removePies (chart) {
  const { pie, pieInsideLabel, pieOutsideLabelLine, pieOutsideLabel, render } = chart

  if (pie) pie.forEach(pieItem => pieItem.forEach(g => render.delGraph(g)))
  if (pieInsideLabel) pieInsideLabel.forEach(il => il.forEach(g => render.delGraph(g)))
  if (pieOutsideLabelLine) pieOutsideLabelLine.forEach(oll => oll.forEach(g => render.delGraph(g)))
  if (pieOutsideLabel) pieOutsideLabel.forEach(ol => ol.forEach(g => render.delGraph(g)))
}

function initChartPie (chart) {
  const { pie, pieInsideLabel, pieOutsideLabelLine, pieOutsideLabel } = chart

  if (!pie) chart.pie = []
  if (!pieInsideLabel) chart.pieInsideLabel = []
  if (!pieOutsideLabelLine) chart.pieOutsideLabelLine = []
  if (!pieOutsideLabel) chart.pieOutsideLabel = []
}

function mergePieDefaultConfig (pies) {
  return pies.map(pieItem => deepMerge(deepClone(pieConfig, true), pieItem))
}

function filterShowPies (pies) {
  return pies.filter(({ show }) => show)
}

function calcPiesCenter(pies, chart) {
  const { area } = chart.render

  pies.forEach(pie => {
    let { center } = pie

    center = center.map((pos, i) => {
      if (typeof pos === 'number') return pos

      return parseInt(pos) / 100 * area[i]
    })

    pie.center = center
  })

  return pies
}

function calcPiesRadius (pies, chart) {
  const maxRadius = Math.min(...chart.render.area) / 2

  pies.forEach(pie => {
    let { radius, data } = pie

    radius = getNumberRadius(radius, maxRadius)

    data.forEach(item => {
      let { radius: itemRadius } = item

      if (!itemRadius) itemRadius = radius

      itemRadius = getNumberRadius(itemRadius, maxRadius)

      item.radius = itemRadius
    })

    pie.radius = radius
  })

  return pies
}

function getNumberRadius (radius, maxRadius) {
  if (!(radius instanceof Array)) radius = [0, radius]

  radius = radius.map(r => {
    if (typeof r === 'number') return r

    return parseInt(r) / 100 * maxRadius
  })

  return radius
}

function calcRosePiesRadius (pies, chart) {
  const rosePie = pies.filter(({ roseType }) => roseType)

  rosePie.forEach(pie => {
    let { radius, data } = pie

    const roseIncrement = getRoseIncrement(pie)

    data = sortData(data)

    data.forEach((item, i) => {
      item.radius[1] = radius[1] - roseIncrement * i
    })

    data.reverse()

    pie.roseIncrement = roseIncrement
  })

  return pies
}

function sortData (data) {
  return data.sort(({ value: a }, { value: b }) => {
    if (a === b) return 0
    if (a > b) return -1
    if (a < b) return 1
  })
}

function getRoseIncrement (pie) {
  const { radius, roseIncrement } = pie

  if (typeof roseIncrement === 'number') return roseIncrement

  return parseInt(roseIncrement) / 100 * radius[1]
}

function calcPiesPercent (pies) {
  pies.forEach(pie => {
    const { data, percentToFixed } = pie

    const sum = getDataSum(data)

    data.forEach(item => {
      const { value } = item

      item.percent = parseFloat((value / sum * 100).toFixed(percentToFixed))
    })

    const percentSumNoLast = mulAdd(data.slice(0, -1).map(({ percent }) => percent))

    data.slice(-1)[0].percent = 100 - percentSumNoLast
  })

  return pies
}

function getDataSum (data) {
  return mulAdd(data.map(({ value }) => value))
}

function calcPiesAngle (pies) {
  pies.forEach(pie => {
    const { startAngle: start, data } = pie

    data.forEach((item, i) => {
      const [startAngle, endAngle] = getDataAngle(data, i)

      item.startAngle = start + startAngle
      item.endAngle = start + endAngle
    })
  })

  return pies
}

function getDataAngle (data, i) {
  const fullAngle = Math.PI * 2

  const needAddData = data.slice(0, i + 1)

  const percentSum = mulAdd(needAddData.map(({ percent }) => percent))

  const { percent } = data[i]

  const startPercent = percentSum - percent

  return [fullAngle * startPercent / 100, fullAngle * percentSum / 100]
}

function calcPiesInsideLabelPos (pies) {
  pies.forEach(pieItem => {
    const { data } = pieItem

    data.forEach(item => {
      item.insideLabelPos = getPieInsideLabelPos(pieItem, item)
    })
  })

  return pies
}

function getPieInsideLabelPos (pieItem, dataItem) {
  const { center } = pieItem

  const { startAngle, endAngle, radius: [ir, or] } = dataItem

  const radius = (ir + or) / 2
  const angle = (startAngle + endAngle) / 2

  return getCircleRadianPoint(...center, radius, angle)
}

function calcPiesEdgeCenterPos(pies) {
  pies.forEach(pie => {
    const { data, center } = pie

    data.forEach(item => {
      const { startAngle, endAngle, radius } = item

      const centerAngle = (startAngle + endAngle) / 2

      const pos = getCircleRadianPoint(...center, radius[1], centerAngle)

      item.edgeCenterPos = pos
    })
  })

  return pies
}

function calcPiesOutSideLabelPos (pies) {
  pies.forEach(pieItem => {
    let leftPieDataItems = getLeftOrRightPieDataItems(pieItem)
    let rightPieDataItems = getLeftOrRightPieDataItems(pieItem, false)

    leftPieDataItems = sortPiesFromTopToBottom(leftPieDataItems)
    rightPieDataItems = sortPiesFromTopToBottom(rightPieDataItems)

    addLabelLineAndAlign(leftPieDataItems, pieItem)
    addLabelLineAndAlign(rightPieDataItems, pieItem, false)
  })

  return pies
}

function getLabelLineBendRadius (pieItem) {
  let { labelLineBendGap } = pieItem.outsideLabel

  const maxRadius = getPieMaxRadius(pieItem)

  if (typeof labelLineBendGap !== 'number') {
    labelLineBendGap = parseInt(labelLineBendGap) / 100 * maxRadius
  }

  return labelLineBendGap + maxRadius
}

function getPieMaxRadius(pieItem) {
  const { data } = pieItem

  const radius = data.map(({ radius: [foo, r] }) => r)

  return Math.max(...radius)
}

function getLeftOrRightPieDataItems (pieItem, left = true) {
  const { data, center } = pieItem

  const centerXPos = center[0]

  return data.filter(({ edgeCenterPos }) => {
    const xPos = edgeCenterPos[0]

    if (left) return xPos < centerXPos

    return xPos > centerXPos
  })
}

function sortPiesFromTopToBottom (dataItem) {
  dataItem.sort(({ edgeCenterPos: [t, ay] }, { edgeCenterPos: [tt, by] }) => {
    if (ay > by) return 1
    if (ay < by) return -1
    if (ay === by) return 0
  })

  return dataItem
}

function addLabelLineAndAlign (dataItem, pieItem, left = true) {
  const { center, outsideLabel } = pieItem

  const radius = getLabelLineBendRadius(pieItem)

  dataItem.forEach(item => {
    const { edgeCenterPos, startAngle, endAngle } = item

    const { labelLineEndLength } = outsideLabel

    const angle = (startAngle + endAngle) / 2

    const bendPoint = getCircleRadianPoint(...center, radius, angle)

    let endPoint = [...bendPoint]
    endPoint[0] += labelLineEndLength * (left ? -1 : 1)

    item.labelLine = [edgeCenterPos, bendPoint, endPoint]
    item.labelLineLength = getPolylineLength(item.labelLine)
    item.align = { textAlign: 'left', textBaseline: 'middle' }
    if (left) item.align.textAlign = 'right'
  })
}

function getCirclePointByYPos (rx, ry, r, y, left = true) {
  const { pow, sqrt } = Math

  const sub = sqrt(pow(r, 2) - pow(y - ry, 2))

  let xPos = sub + a

  if (left && xPos > rx) xPos = -sub + a

  return [xPos, y]
}

function delRedundancePies (pies, chart) {
  const { pie, pieInsideLabel, pieOutsideLabelLine, pieOutsideLabel, render } = chart

  const PiesNum = pies.length
  const cacheNum = pie.length

  if (cacheNum > PiesNum) {
    const needDelPies = pie.splice(PiesNum)
    const needDelPieInsideLabels = pieInsideLabel.splice(PiesNum)
    const needDelPieOutsideLabelLines = pieOutsideLabelLine.splice(PiesNum)
    const needDelPieOutsideLabels = pieOutsideLabel.splice(PiesNum)

    needDelPies.forEach(pieItem => pieItem.forEach(g => render.delGraph(g)))
    needDelPieInsideLabels.forEach(labelItem => labelItem.forEach(g => render.delGraph(g)))
    needDelPieOutsideLabelLines.forEach(labelLines => labelLines.forEach(g => render.delGraph(g)))
    needDelPieOutsideLabels.forEach(labelItem => labelItem.forEach(g => render.delGraph(g)))
  }
}

function updatePies (pies, chart) {
  const { render, pie: pieCache } = chart

  pies.forEach((pieItem, i) => {
    let cache = pieCache[i]

    if (cache) {
      changePies(cache, pieItem, render)
    } else {
      addNewPies(pieCache, pieItem, i, render)
    }
  })
}

function changePies (cache, pieItem, render) {
  const { animationCurve, animationFrame } = pieItem

  balancePieNum(cache, pieItem, render)

  cache.forEach((graph, i) => {
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animationDelay = 0
    graph.animation('shape', getPieShape(pieItem, i), true)
    graph.animation('style', mergePieColor(pieItem, i), true)
  })
}

function balancePieNum (cache, pieItem, render) {
  const cacheGraphNum = cache.length
  const pieNum = pieItem.data.length

  if (pieNum > cacheGraphNum) {
    const lastCachePie = cache.slice(-1)[0]
    const needAddPies = new Array(pieNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'pie',
        animationCurve: lastCachePie.animationCurve,
        animationFrame: lastCachePie.animationFrame,
        shape: deepClone(lastCachePie.shape, true),
        style: mergePieColor(pieItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddPies)
  } else if (pieNum < cacheGraphNum) {
    const needDelCache = cache.splice(pieNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewPies (pieCache, pieItem, i, render) {
  const { startAnimationCurve, animationFrame, animationDelayGap, data } = pieItem

  const graphs = data.map((item, i) => {
    const shape = getPieShape(pieItem, i)
    const style = mergePieColor(pieItem, i)

    const startShape = getPieStartShape(shape)

    return render.add({
      name: 'pie',
      animationCurve: startAnimationCurve,
      animationFrame,
      animationDelay: i * animationDelayGap,
      shape: startShape,
      style
    })
  })

  graphs.forEach((graph, i) => {
    graph.animation('shape', getPieShape(pieItem, i), true)
  })

  pieCache[i] = graphs
}

function getPieShape (pieItem, i) {
  const { center, data } = pieItem

  const dataItem = data[i]

  const { radius, startAngle, endAngle } = dataItem

  return {
    startAngle,
    endAngle,
    ir: radius[0],
    or: radius[1],
    rx: center[0],
    ry: center[1]
  }
}

function getPieStartShape (shape) {
  shape.or = shape.ir

  return shape
}

function mergePieColor (pieItem, i) {
  const { pieStyle, data } = pieItem

  const dataItem = data[i]

  const { color } = dataItem

  return deepMerge({ fill: color }, pieStyle)
}

function updateInsideLabel (pies, chart) {
  const { render, pieInsideLabel: labelCache } = chart

  pies.forEach((pieItem, i) => {
    let cache = labelCache[i]

    if (cache) {
      changePieInsideLabels(cache, pieItem, render)
    } else {
      addNewPieInsideLabels(labelCache, pieItem, i, render)
    }
  })
}

function changePieInsideLabels (cache, pieItem, render) {
  const { animationCurve, animationFrame } = pieItem

  balancePieInsideLabelNum(cache, pieItem, render)

  cache.forEach((graph, i) => {
    graph.visible = pieItem.insideLabel.show,
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getPieInsideLabelShape(pieItem, i), true)
    graph.animation('style', mergePieStyleAndAlign(pieItem, i), true)
  })
}

function balancePieInsideLabelNum (cache, pieItem, render) {
  const cacheGraphNum = cache.length
  const pieNum = pieItem.data.length

  if (pieNum > cacheGraphNum) {
    const lastCachePieInsideLabel = cache.slice(-1)[0]
    const needAddPieInsideLabels = new Array(pieNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'text',
        visible: lastCachePieInsideLabel.visible,
        animationCurve: lastCachePieInsideLabel.animationCurve,
        animationFrame: lastCachePieInsideLabel.animationFrame,
        shape: deepClone(lastCachePieInsideLabel.shape, true),
        style: mergePieStyleAndAlign(pieItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddPieInsideLabels)
  } else if (pieNum < cacheGraphNum) {
    const needDelCache = cache.splice(pieNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewPieInsideLabels (labelCache, pieItem, i, render) {
  const { animationCurve, animationFrame, data } = pieItem

  const graphs = data.map((item, i) => {
    const shape = getPieInsideLabelShape(pieItem, i)
    const style = mergePieStyleAndAlign(pieItem, i)

    return render.add({
      name: 'text',
      visible: pieItem.insideLabel.show,
      animationCurve,
      animationFrame,
      shape,
      style
    })
  })

  labelCache[i] = graphs
}

function getPieInsideLabelShape (pieItem, i) {
  const { insideLabel, data } = pieItem

  const { formatter } = insideLabel

  const dataItem = data[i]

  const formatterType = typeof formatter

  let label = ''

  if (formatterType === 'string') {
    label = formatter.replace('{name}', dataItem.name)
    label = label.replace('{percent}', dataItem.percent)
  }

  if (formatterType === 'function') {
    label = formatter(dataItem)
  }

  return {
    content: label,
    position: dataItem.insideLabelPos
  }
}

function mergePieStyleAndAlign (pieItem, i) {
  const { insideLabel: { style } } = pieItem

  return deepMerge({
    textAlign: 'center',
    textBaseline: 'middle'
  }, style)
}

function updateOutsideLabelLine (pies, chart) {
  const { render, pieOutsideLabelLine: labelLineCache } = chart

  pies.forEach((pieItem, i) => {
    let cache = labelLineCache[i]

    if (cache) {
      changePieOutsideLabelLines(cache, pieItem, render)
    } else {
      addNewPieOutsideLabelLines(labelLineCache, pieItem, i, render)
    }
  })
}

function changePieOutsideLabelLines (cache, pieItem, render) {
  const { animationCurve, animationFrame } = pieItem

  balancePieOutsideLabelLineNum(cache, pieItem, render)

  cache.forEach((graph, i) => {
    graph.visible = pieItem.outsideLabel.show,
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.style.lineDash = [999, 0]
    graph.animation('shape', getPieOutsideLabelLineShape(pieItem, i), true)
    graph.animation('style', mergePieLabelLineColor(pieItem, i), true)
  })
}

function balancePieOutsideLabelLineNum (cache, pieItem, render) {
  const cacheGraphNum = cache.length
  const pieNum = pieItem.data.length

  if (pieNum > cacheGraphNum) {
    const lastCachePieOutsideLabelLine = cache.slice(-1)[0]
    const needAddPieOutsideLabelLines = new Array(pieNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'polyline',
        visible: lastCachePieOutsideLabelLine.visible,
        animationCurve: lastCachePieOutsideLabelLine.animationCurve,
        animationFrame: lastCachePieOutsideLabelLine.animationFrame,
        shape: deepClone(lastCachePieOutsideLabelLine.shape, true),
        style: mergePieLabelLineColor(pieItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddPieOutsideLabelLines)
  } else if (pieNum < cacheGraphNum) {
    const needDelCache = cache.splice(pieNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function addNewPieOutsideLabelLines (labelLineCache, pieItem, i, render) {
  const { animationCurve, animationFrame, data } = pieItem

  const graphs = data.map((item, i) => {
    const shape = getPieOutsideLabelLineShape(pieItem, i)
    const style = mergePieLabelLineColor(pieItem, i)

    return render.add({
      name: 'polyline',
      visible: pieItem.outsideLabel.show,
      animationCurve,
      animationFrame,
      shape,
      style: {
        ...style,
        lineDash: [0, item.labelLineLength]
      }
    })
  })

  graphs.forEach((graph, i) => {
    graph.animation('style', { lineDash: [data[i].labelLineLength, 0] }, true)
  })

  labelLineCache[i] = graphs
}

function getPieOutsideLabelLineShape (pieItem, i) {
  const { data } = pieItem
  
  const dataItem = data[i]

  return {
    points: dataItem.labelLine
  }
}

function mergePieLabelLineColor (pieItem, i) {
  const { outsideLabel, data } = pieItem

  const { labelLineStyle } = outsideLabel

  const { color } = data[i]

  return deepMerge({ stroke: color }, labelLineStyle)
}

function updateOutsideLabel (pies, chart) {
  const { render, pieOutsideLabel: labelCache } = chart

  pies.forEach((pieItem, i) => {
    let cache = labelCache[i]

    if (cache) {
      changePieOutsideLabels(cache, pieItem, render)
    } else {
      addNewPieOutsideLabels(labelCache, pieItem, i, render)
    }
  })
}

function changePieOutsideLabels (cache, pieItem, render) {
  const { animationCurve, animationFrame } = pieItem

  balancePieOutsideLabelNum(cache, pieItem, render)

  cache.forEach((graph, i) => {
    graph.visible = pieItem.outsideLabel.show,
    graph.animationCurve = animationCurve
    graph.animationFrame = animationFrame
    graph.animation('shape', getPieOutsideLabelShape(pieItem, i), true)
    graph.animation('style', mergeOutsideLabelStyleAndAlign(pieItem, i), true)
  })
}

function balancePieOutsideLabelNum (cache, pieItem, render) {
  const cacheGraphNum = cache.length
  const pieNum = pieItem.data.length

  if (pieNum > cacheGraphNum) {
    const lastCachePieOutsideLabel = cache.slice(-1)[0]
    const needAddPieOutsideLabels = new Array(pieNum - cacheGraphNum).fill(0)
      .map(foo => render.add({
        name: 'text',
        visible: lastCachePieOutsideLabel.visible,
        animationCurve: lastCachePieOutsideLabel.animationCurve,
        animationFrame: lastCachePieOutsideLabel.animationFrame,
        shape: deepClone(lastCachePieOutsideLabel.shape, true),
        style: mergeOutsideLabelStyleAndAlign(pieItem, cacheGraphNum - 1)
      }))

    cache.push(...needAddPieOutsideLabels)
  } else if (pieNum < cacheGraphNum) {
    const needDelCache = cache.splice(pieNum)

    needDelCache.forEach(g => render.delGraph(g))
  }
}

function mergeOutsideLabelStyleAndAlign (pieItem, i) {
  const { outsideLabel, data } = pieItem

  const { color, align } = data[i]

  const { style } = outsideLabel

  return deepMerge({ fill: color, ...align }, style)
}

function getPieOutsideLabelShape (pieItem, i) {
  const { outsideLabel, data } = pieItem

  const { formatter } = outsideLabel

  const { labelLine, name, percent } = data[i]

  const formatterType = typeof formatter

  let label = ''

  if (formatterType === 'string') {
    label = formatter.replace('{name}', name)
    label = label.replace('{percent}', percent)
  }

  if (formatterType === 'function') {
    label = formatter(data[i])
  }

  return {
    content: label,
    position: labelLine[2]
  }
}

function addNewPieOutsideLabels (labelCache, pieItem, i, render) {
  const { animationCurve, animationFrame, data } = pieItem

  const graphs = data.map((item, i) => {
    const shape = getPieOutsideLabelShape(pieItem, i)
    const style = mergeOutsideLabelStyleAndAlign(pieItem, i)

    const startShape = getPieOutsideLabelStartShape(shape, pieItem, i)

    return render.add({
      name: 'text',
      visible: pieItem.outsideLabel.show,
      animationCurve,
      animationFrame,
      shape: startShape,
      style
    })
  })

  graphs.forEach((graph, i) => {
    graph.animation('shape', getPieOutsideLabelShape(pieItem, i), true)
  })

  labelCache[i] = graphs
}

function getPieOutsideLabelStartShape (shape, pieItem, i) {
  const { labelLine } = pieItem.data[i]

  shape.position = labelLine[1]

  return shape
}