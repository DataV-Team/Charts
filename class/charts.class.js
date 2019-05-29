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

  option = deepClone(option, true)

  mergeColor(this, option)

  grid(this, option)

  axis(this, option)

  // radarAxis(this, option)

  title(this, option)

  bar(this, option)

  line(this, option)

  pie(this, option)

  // radar(this, option)

  this.option = option

  this.render.launchAnimation()

  // console.warn(this)
}