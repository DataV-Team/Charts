import CRender from '@jiaminghi/c-render'
import { deepClone } from '../utils/common'
import { Option, GraphSeriesItem } from '../types/class/charts'

import grid from '../core/grid'
import { RectShape } from '@jiaminghi/c-render/es/types/graphs/shape'
import { _AxisConfig } from '../types/config/axis'
import { axis } from '../core/axis'
import { initOption } from '../utils/core'

export default class Charts {
  /**
   * @description Chart Container
   */
  container!: HTMLDivElement

  /**
   * @description Chart Canvas
   */
  canvas!: HTMLCanvasElement

  /**
   * @description CRender Instance
   */
  render!: CRender

  /**
   * @description Chart Option
   */
  option: Option | null = null

  /**
   * @description Chart graphs series
   */
  series: GraphSeriesItem[] = []

  /**
   * @description Chart grid area
   */
  gridArea?: RectShape

  /**
   * @description Chart Axis data
   */
  axisData?: _AxisConfig[]

  constructor(container: HTMLDivElement) {
    if (!container) throw new Error('Charts: Missing parameters of container!')

    const { clientWidth, clientHeight } = container

    const canvas = document.createElement('canvas')
    canvas.setAttribute('style', `width: ${clientWidth}px;height:${clientHeight}px`)

    container.appendChild(canvas)

    Object.assign(this, {
      container,
      canvas,
      render: new CRender(canvas, true),
      option: null,
    })
  }

  setOption(option: Option, merge: boolean = false): void {
    if (!option || typeof option !== 'object')
      throw new Error('Charts setOption: option must be an object!')

    if (merge) {
      this.render.delAllGraph()
    } else {
      this.render.graphs.forEach(graph => graph.animationEnd())
    }

    const optionCloned = initOption(deepClone(option))

    grid(this, optionCloned)

    axis(this, optionCloned)

    this.option = option

    const { render } = this

    if (render.animateAble()) {
      render.launchAnimation()
    } else {
      render.drawAllGraph()
    }
  }
}
