import '../extend/index'

import CRender from '@jiaminghi/c-render'

import { deepClone } from '@jiaminghi/c-render/lib/util'

import { mergeColor, title, grid, axis, radarAxis } from '../lib'

import { pie, line, bar, radar } from '../lib'

export default class Charts {
  constructor (dom) {
    if (!dom) {
      console.error('Charts Missing parameters!')

      return false
    }

    const { clientWidth, clientHeight } = dom

    const canvas = document.createElement('canvas')

    canvas.setAttribute('width', clientWidth)
    canvas.setAttribute('height', clientHeight)

    dom.appendChild(canvas)

    const attribute = {
      container: dom,
      canvas,
      render: new CRender(canvas),
      option: null
    }

    Object.assign(this, attribute)
  }
}

Charts.prototype.setOption = function (option) {
  if (!option || typeof option !== 'object') {
    console.error('setOption Missing parameters!')

    return false
  }

  const optionCloned = deepClone(option, true)

  mergeColor(this, optionCloned)

  grid(this, optionCloned)

  axis(this, optionCloned)

  radarAxis(this, optionCloned)

  title(this, optionCloned)

  bar(this, optionCloned)

  line(this, optionCloned)

  pie(this, optionCloned)

  radar(this, optionCloned)

  this.option = option

  this.render.launchAnimation()

  // console.warn(this)
}

Charts.prototype.resize = function () {
  const { container, canvas, render, option } = this

  const { clientWidth, clientHeight } = container

  canvas.setAttribute('width', clientWidth)
  canvas.setAttribute('height', clientHeight)

  render.area = [clientWidth, clientHeight]

  this.setOption(option)
}