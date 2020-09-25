import { doUpdate } from '../class/updater.class'

import { pieConfig } from '../config/pie'

import { getCircleRadianPoint } from '@jiaminghi/c-render/lib/plugin/util'

import { deepMerge, initNeedSeries, mulAdd, getPolylineLength } from '../util'

export function pie (chart, option = {}) {
  let { series } = option

  if (!series) series = []

  let pies = initNeedSeries(series, pieConfig, 'pie')

  pies = calcPiesCenter(pies, chart)

  pies = calcPiesRadius(pies, chart)

  pies = calcRosePiesRadius(pies, chart)

  pies = calcPiesPercent(pies)

  pies = calcPiesAngle(pies, chart)

  pies = calcPiesInsideLabelPos(pies)

  pies = calcPiesEdgeCenterPos(pies)

  pies = calcPiesOutSideLabelPos(pies)

  doUpdate({
    chart,
    series: pies,
    key: 'pie',
    getGraphConfig: getPieConfig,
    getStartGraphConfig: getStartPieConfig,
    beforeChange: beforeChangePie
  })

  doUpdate({
    chart,
    series: pies,
    key: 'pieInsideLabel',
    getGraphConfig: getInsideLabelConfig
  })

  doUpdate({
    chart,
    series: pies,
    key: 'pieOutsideLabelLine',
    getGraphConfig: getOutsideLabelLineConfig,
    getStartGraphConfig: getStartOutsideLabelLineConfig
  })

  doUpdate({
    chart,
    series: pies,
    key: 'pieOutsideLabel',
    getGraphConfig: getOutsideLabelConfig,
    getStartGraphConfig: getStartOutsideLabelConfig
  })
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
    let { radius, data, roseSort } = pie

    const roseIncrement = getRoseIncrement(pie)

    const dataCopy = [...data]

    data = sortData(data)

    data.forEach((item, i) => {
      item.radius[1] = radius[1] - roseIncrement * i
    })

    if (roseSort) {
      data.reverse()
    } else {
      pie.data = dataCopy
    }

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

  if (roseIncrement === 'auto') {
    const { data } = pie

    const allRadius = data.reduce((all, { radius }) => [...all, ...radius], [])

    const minRadius = Math.min(...allRadius)
    const maxRadius = Math.max(...allRadius)

    return (maxRadius - minRadius)  * 0.6 / (data.length - 1 || 1)
  }

  return parseInt(roseIncrement) / 100 * radius[1]
}

function calcPiesPercent (pies) {
  pies.forEach(pie => {
    const { data, percentToFixed } = pie

    const sum = getDataSum(data)

    data.forEach(item => {
      const { value } = item

      item.percent = value / sum * 100
      item.percentForLabel = toFixedNoCeil(value / sum * 100, percentToFixed)
    })

    const percentSumNoLast = mulAdd(data.slice(0, -1).map(({ percent }) => percent))

    data.slice(-1)[0].percent = 100 - percentSumNoLast
    data.slice(-1)[0].percentForLabel = toFixedNoCeil(100 - percentSumNoLast, percentToFixed)
  })

  return pies
}

function toFixedNoCeil (number, toFixed = 0) {
  const stringNumber = number.toString()

  const splitedNumber = stringNumber.split('.')
  const decimal = splitedNumber[1] || '0'
  const fixedDecimal = decimal.slice(0, toFixed)

  splitedNumber[1] = fixedDecimal

  return parseFloat(splitedNumber.join('.'))
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

    if (left) return xPos <= centerXPos

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

function getPieConfig (pieItem) {
  const { data, animationCurve, animationFrame, rLevel } = pieItem

  return data.map((foo, i) => ({
    name: 'pie',
    index: rLevel,
    animationCurve,
    animationFrame,
    shape: getPieShape(pieItem, i),
    style: getPieStyle(pieItem, i)
  }))
}

function getStartPieConfig (pieItem) {
  const { animationDelayGap, startAnimationCurve } = pieItem

  const configs = getPieConfig(pieItem)

  configs.forEach((config, i) => {
    config.animationCurve = startAnimationCurve
    config.animationDelay = i * animationDelayGap

    config.shape.or = config.shape.ir
  })

  return configs
}

function beforeChangePie (graph) {
  graph.animationDelay = 0
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

function getPieStyle (pieItem, i) {
  const { pieStyle, data } = pieItem

  const dataItem = data[i]

  const { color } = dataItem

  return deepMerge({ fill: color }, pieStyle)
}

function getInsideLabelConfig (pieItem) {
  const { animationCurve, animationFrame, data, rLevel } = pieItem

  return data.map((foo, i) => ({
    name: 'text',
    index: rLevel,
    visible: pieItem.insideLabel.show,
    animationCurve,
    animationFrame,
    shape: getInsideLabelShape(pieItem, i),
    style: getInsideLabelStyle(pieItem, i)
  }))
}

function getInsideLabelShape (pieItem, i) {
  const { insideLabel, data } = pieItem

  const { formatter } = insideLabel

  const dataItem = data[i]

  const formatterType = typeof formatter

  let label = ''

  if (formatterType === 'string') {
    label = formatter.replace('{name}', dataItem.name)
    label = label.replace('{percent}', dataItem.percentForLabel)
    label = label.replace('{value}', dataItem.value)
  }

  if (formatterType === 'function') {
    label = formatter(dataItem)
  }

  return {
    content: label,
    position: dataItem.insideLabelPos
  }
}

function getInsideLabelStyle (pieItem, i) {
  const { insideLabel: { style } } = pieItem

  return style
}

function getOutsideLabelLineConfig (pieItem) {
  const { animationCurve, animationFrame, data, rLevel } = pieItem

  return data.map((foo, i) => ({
    name: 'polyline',
    index: rLevel,
    visible: pieItem.outsideLabel.show,
    animationCurve,
    animationFrame,
    shape: getOutsideLabelLineShape(pieItem, i),
    style: getOutsideLabelLineStyle(pieItem, i)
  }))
}

function getStartOutsideLabelLineConfig (pieItem) {
  const { data } = pieItem

  const configs = getOutsideLabelLineConfig(pieItem)

  configs.forEach((config, i) => {
    config.style.lineDash = [0, data[i].labelLineLength]
  })

  return configs
}

function getOutsideLabelLineShape (pieItem, i) {
  const { data } = pieItem

  const dataItem = data[i]

  return {
    points: dataItem.labelLine
  }
}

function getOutsideLabelLineStyle (pieItem, i) {
  const { outsideLabel, data } = pieItem

  const { labelLineStyle } = outsideLabel

  const { color } = data[i]

  return deepMerge({ stroke: color, lineDash: [data[i].labelLineLength, 0] }, labelLineStyle)
}

function getOutsideLabelConfig (pieItem) {
  const { animationCurve, animationFrame, data, rLevel } = pieItem

  return data.map((foo, i) => ({
    name: 'text',
    index: rLevel,
    visible: pieItem.outsideLabel.show,
    animationCurve,
    animationFrame,
    shape: getOutsideLabelShape(pieItem, i),
    style: getOutsideLabelStyle(pieItem, i)
  }))
}

function getStartOutsideLabelConfig (pieItem) {
  const { data } = pieItem

  const configs = getOutsideLabelConfig(pieItem)

  configs.forEach((config, i) => {
    config.shape.position = data[i].labelLine[1]
  })

  return configs
}

function getOutsideLabelShape (pieItem, i) {
  const { outsideLabel, data } = pieItem

  const { formatter } = outsideLabel

  const { labelLine, name, percentForLabel, value } = data[i]

  const formatterType = typeof formatter

  let label = ''

  if (formatterType === 'string') {
    label = formatter.replace('{name}', name)
    label = label.replace('{percent}', percentForLabel)
    label = label.replace('{value}', value)
  }

  if (formatterType === 'function') {
    label = formatter(data[i])
  }

  return {
    content: label,
    position: labelLine[2],
  }
}

function getOutsideLabelStyle (pieItem, i) {
  const { outsideLabel, data } = pieItem

  const { color, align } = data[i]

  const { style } = outsideLabel

  return deepMerge({ fill: color, ...align }, style)
}
