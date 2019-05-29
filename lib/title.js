import { deepClone } from '@jiaminghi/c-render/lib/util'

import { titleConfig } from '../config'

import { deepMerge } from '../util'

export function title (chart, option = {}) {
  let { title } = option

  if (!title) return removeTitle(chart)

  title = deepMerge(deepClone(titleConfig, true), title)

  const titleCache = chart.title

  if (titleCache) {
    changeTitle(titleCache, title, chart)
  } else {
    addTitle(title, chart)
  }
}

function removeTitle (chart) {
  const { title, render } = chart

  if (!title) return

  render.delGraph(title)

  chart.title = null
}

function changeTitle (titleGraph, title, chart) {
  const { show, text, textStyle } = title

  const { animationCurve, animationFrame } = title

  const position = getTitlePosition(title, chart)

  titleGraph.visible = show
  titleGraph.animationCurve = animationCurve
  titleGraph.animationFrame = animationFrame
  titleGraph.shape.content = text
  titleGraph.animation('shape', { position }, true)
  titleGraph.animation('style', { ...textStyle }, true)
}

function getTitlePosition (title, chart) {
  const { offset } = title
  const { grid } = chart

  const [ox, oy] = offset

  const { x, y, w } = grid.area

  return [x + (w / 2) + ox, y + oy]
}

function addTitle (title, chart) {
  const { show, text, textStyle } = title

  const { animationCurve, animationFrame } = title

  const position = getTitlePosition(title, chart)

  const { render } = chart

  chart.title = render.add({
    name: 'text',
    animationCurve,
    animationFrame,
    visible: show,
    shape: {
      content: text,
      position
    },
    style: {
      ...textStyle
    }
  })
}