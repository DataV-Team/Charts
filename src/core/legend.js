import { doUpdate } from '../class/updater.class'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import { legendConfig } from '../config'

import { deepMerge, mulAdd } from '../util'

export function legend (chart, option = {}) {
  let { legend } = option

  if (legend) {
    legend = deepMerge(deepClone(legendConfig, true), legend)

    legend = initLegendData(legend)
  
    legend = filterInvalidData(legend, option, chart)
  
    legend = calcLegendTextWidth(legend, chart)
  
    legend = calcLegendPosition(legend, chart)

    legend = [legend]
  } else {
    legend = []
  }

  doUpdate({
    chart,
    series: legend,
    key: 'legendIcon',
    getGraphConfig: getIconConfig
  })

  doUpdate({
    chart,
    series: legend,
    key: 'legendText',
    getGraphConfig: getTextConfig
  })
}

function initLegendData (legend) {
  const { data } = legend

  legend.data = data.map(item => {
    const itemType = typeof item

    if (itemType === 'string') {
      return { name: item }
    } else if (itemType === 'object') {
      return item
    }

    return { name: '' }
  })

  return legend
}

function filterInvalidData (legend, option, chart) {
  const { series } = option

  let { legendStatus } = chart

  const data = legend.data.filter(item => {
    const { name } = item

    const result = series.find(({ name: sn }) => name === sn)

    if (!result) return false

    if (!item.color) item.color = result.color

    if (!item.icon) item.icon = result.type

    return item
  })

  if (!legendStatus || legendStatus.length !== legend.data.length) legendStatus = new Array(legend.data.length).fill(true)

  data.forEach((item, i) => (item.status = legendStatus[i]))

  legend.data = data

  chart.legendStatus = legendStatus

  return legend
}

function calcLegendTextWidth (legend, chart) {
  const { ctx } = chart.render

  const { data, textStyle, textUnselectedStyle } = legend

  data.forEach(item => {
    const { status, name } = item

    item.textWidth = getTextWidth(ctx, name, status ? textStyle : textUnselectedStyle)
  })

  return legend
}

function getTextWidth (ctx, text, style) {
  ctx.font = getFontConfig(style)

  return ctx.measureText(text).width
}

function getFontConfig (style) {
  const { fontFamily, fontSize } = style

  return `${fontSize}px ${fontFamily}`
}

function calcLegendPosition (legend, chart) {
  const { orient } = legend

  if (orient === 'vertical') {
    calcVerticalPosition(legend, chart)
  } else {
    calcHorizontalPosition(legend, chart)
  }
  
  return legend
}

function calcHorizontalPosition (legend, chart) {
  const { iconHeight, itemGap } = legend

  const lines = calcDefaultHorizontalPosition(legend, chart)

  const xOffsets = lines.map(line => getHorizontalXOffset(line, legend, chart))
  const yOffset = getHorizontalYOffset(legend, chart)

  const align = { textAlign: 'left', textBaseline: 'middle' }

  lines.forEach((line, i) => line.forEach(item => {
      const { iconPosition, textPosition } = item

      let xOffset = xOffsets[i]
      const realYOffset = yOffset + i * (itemGap + iconHeight)

      item.iconPosition = mergeOffset(iconPosition, [xOffset, realYOffset])
      item.textPosition = mergeOffset(textPosition, [xOffset, realYOffset])
      item.align = align
    })
  )
}

function calcDefaultHorizontalPosition (legend, chart) {
  const { data, iconWidth } = legend

  const w = chart.render.area[0]

  let startIndex = 0

  const lines = [[]]

  data.forEach((item, i) => {
    let beforeWidth = getBeforeWidth(startIndex, i, legend)

    const endXPos = beforeWidth + iconWidth + 5 + item.textWidth

    if (endXPos >= w) {
      startIndex = i
      beforeWidth = getBeforeWidth(startIndex, i, legend)

      lines.push([])
    }

    item.iconPosition = [beforeWidth, 0]
    item.textPosition = [beforeWidth + iconWidth + 5, 0]

    lines.slice(-1)[0].push(item)
  })

  return lines
}

function getBeforeWidth (startIndex, currentIndex, legend) {
  const { data, iconWidth, itemGap } = legend

  const beforeItem = data.slice(startIndex, currentIndex)

  return mulAdd(beforeItem.map(({ textWidth }) => textWidth)) + (currentIndex - startIndex) * (itemGap + 5 + iconWidth)
}

function getHorizontalXOffset (data, legend, chart) {
  let { left, right, iconWidth, itemGap } = legend

  const w = chart.render.area[0]

  const dataNum = data.length

  const allWidth = mulAdd(data.map(({ textWidth }) => textWidth)) + dataNum * (5 + iconWidth) + (dataNum - 1) * itemGap 

  const horizontal = [left, right].findIndex(pos => pos !== 'auto')

  if (horizontal === -1) {
    return (w - allWidth) / 2
  } else if (horizontal === 0) {
    if (typeof left === 'number') return left

    return parseInt(left) / 100 * w
  } else {
    if (typeof right !== 'number') right = parseInt(right) / 100 * w

    return w - (allWidth + right)
  }
}

function getHorizontalYOffset (legend, chart) {
  let { top, bottom, iconHeight } = legend

  const h = chart.render.area[1]

  const vertical = [top, bottom].findIndex(pos => pos !== 'auto')

  const halfIconHeight = iconHeight / 2

  if (vertical === -1) {
    const { y, h: height } = chart.gridArea

    return y + height + 45 - halfIconHeight
  } else if (vertical === 0) {
    if (typeof top === 'number') return top - halfIconHeight

    return parseInt(top) / 100 * h - halfIconHeight
  } else {
    if (typeof bottom !== 'number') bottom = parseInt(bottom) / 100 * h

    return h - bottom - halfIconHeight
  }
}

function mergeOffset ([x, y], [ox, oy]) {
  return [x + ox, y + oy]
}

function calcVerticalPosition (legend, chart) {
  const [isRight, xOffset] = getVerticalXOffset(legend, chart)
  const yOffset = getVerticalYOffset(legend, chart)

  calcDefaultVerticalPosition(legend, isRight)

  let align = { textAlign: 'left', textBaseline: 'middle' }

  legend.data.forEach(item => {
    const { textPosition, iconPosition } = item

    item.textPosition = mergeOffset(textPosition, [xOffset, yOffset])
    item.iconPosition = mergeOffset(iconPosition, [xOffset, yOffset])
    item.align = align
  })
}

function getVerticalXOffset (legend, chart) {
  const { left, right } = legend

  const w = chart.render.area[0]

  const horizontal = [left, right].findIndex(pos => pos !== 'auto')

  if (horizontal === -1) {
    return [
      true,
      w - 10
    ]
  } else {
    let offset = [left, right][horizontal]

    if (typeof offset !== 'number') offset = parseInt(offset) / 100 * w

    return [
      Boolean(horizontal),
      offset
    ]
  }
}

function getVerticalYOffset (legend, chart) {
  const { iconHeight, itemGap, data, top, bottom } = legend

  const h = chart.render.area[1]

  const dataNum = data.length

  const allHeight = dataNum * iconHeight + (dataNum - 1) * itemGap

  const vertical = [top, bottom].findIndex(pos => pos !== 'auto')

  if (vertical === -1) {
    return (h - allHeight) / 2
  } else {
    let offset = [top, bottom][vertical]

    if (typeof offset !== 'number') offset = parseInt(offset) / 100 * h

    if (vertical === 1) offset = h - offset - allHeight

    return offset
  }
}

function calcDefaultVerticalPosition (legend, isRight) {
  const { data, iconWidth, iconHeight, itemGap } = legend

  const halfIconHeight = iconHeight / 2

  data.forEach((item, i) => {
    const { textWidth } = item

    const yPos = (iconHeight + itemGap) * i + halfIconHeight

    const iconXPos = isRight ? (0 - iconWidth) : 0
    const textXpos = isRight ? (iconXPos - 5 - textWidth) : (iconWidth + 5)

    item.iconPosition = [iconXPos, yPos]
    item.textPosition = [textXpos, yPos]
  })
}

function getIconConfig (legendItem, updater) {
  const { data, selectAble, animationCurve, animationFrame, rLevel } = legendItem

  return data.map((item, i) => ({
    name: item.icon === 'line' ? 'lineIcon' : 'rect',
    index: rLevel,
    visible: legendItem.show,
    hover: selectAble,
    click: selectAble,
    animationCurve,
    animationFrame,
    shape: getIconShape(legendItem, i),
    style: getIconStyle(legendItem, i),
    click: createClickCallBack(legendItem, i, updater)
  }))
}

function getIconShape (legendItem, i) {
  const { data, iconWidth, iconHeight } = legendItem

  const [x, y] = data[i].iconPosition

  const halfIconHeight = iconHeight / 2

  return {
    x,
    y: y - halfIconHeight,
    w: iconWidth,
    h: iconHeight
  }
}

function getIconStyle (legendItem, i) {
  const { data, iconStyle, iconUnselectedStyle } = legendItem

  const { status, color } = data[i]

  const style = status ? iconStyle : iconUnselectedStyle

  return deepMerge({ fill: color }, style)
}

function getTextConfig (legendItem, updater) {
  const { data, selectAble, animationCurve, animationFrame, rLevel } = legendItem

  return data.map((foo, i) => ({
    name: 'text',
    index: rLevel,
    visible: legendItem.show,
    hover: selectAble,
    animationCurve,
    animationFrame,
    hoverRect: getTextHoverRect(legendItem, i),
    shape: getTextShape(legendItem, i),
    style: getTextStyle(legendItem, i),
    click: createClickCallBack(legendItem, i, updater)
  }))
}

function getTextShape (legendItem, i) {
  const { textPosition, name } = legendItem.data[i]

  return {
    content: name,
    position: textPosition
  }
}

function getTextStyle (legendItem, i) {
  const { textStyle, textUnselectedStyle } = legendItem

  const { status, align } = legendItem.data[i]

  const style = status ? textStyle : textUnselectedStyle

  return deepMerge(deepClone(style, true), align)
}

function getTextHoverRect (legendItem, i) {
  const { textStyle, textUnselectedStyle } = legendItem

  const { status, textPosition: [x, y], textWidth } = legendItem.data[i]

  const style = status ? textStyle : textUnselectedStyle

  const { fontSize } = style

  return [x, y - (fontSize / 2), textWidth, fontSize]
}

function createClickCallBack (legendItem, index, updater) {
  const { name } = legendItem.data[index]

  return () => {
    const { legendStatus, option } = updater.chart

    const status = !legendStatus[index]

    const change = option.series.find(({ name: sn }) => sn === name)

    change.show = status

    legendStatus[index] = status

    updater.chart.setOption(option)
  }
}