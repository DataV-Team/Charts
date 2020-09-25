import { doUpdate } from '../class/updater.class'

import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import { titleConfig } from '../config'

import { deepMerge } from '../util'

export function title (chart, option = {}) {
  let title = []

  if (option.title) {
    title[0] = deepMerge(deepClone(titleConfig, true), option.title)
  }

  doUpdate({
    chart,
    series: title,
    key: 'title',
    getGraphConfig: getTitleConfig
  })
}

function getTitleConfig (titleItem, updater) {
  const { animationCurve, animationFrame, rLevel } = titleConfig

  const shape = getTitleShape(titleItem, updater)
  const style = getTitleStyle(titleItem)

  return [{
    name: 'text',
    index: rLevel,
    visible: titleItem.show,
    animationCurve,
    animationFrame,
    shape,
    style
  }]
}

function getTitleShape (titleItem, updater) {
  const { offset, text } = titleItem
  const { x, y, w } = updater.chart.gridArea

  const [ox, oy] = offset

  return {
    content: text,
    position: [x + (w / 2) + ox, y + oy]
  }
}

function getTitleStyle (titleItem) {
  const { style } = titleItem
  
  return style
}
