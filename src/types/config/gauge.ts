import { GraphStyleConfig } from '../common'
import { EaseCurve } from '@jiaminghi/transition/types/types/core'

export type GaugeDetailsPosition = 'start' | 'center' | 'end'

export type GaugeConfig = {
  /**
   * @description Type
   */
  type: 'gauge'
  /**
   * @description Whether to display this gauge
   */
  show: boolean
  /**
   * @description Legend name
   */
  name: string
  /**
   * @description Radius of gauge
   * @example radius = '60%' | 100
   */
  radius: string | number
  /**
   * @description Center point of gauge
   * @example center = ['50%','50%'] | [100, 100]
   */
  center: [string | number, string | number]
  /**
   * @description Gauge start angle
   * @example startAngle = -Math.PI
   */
  startAngle: number
  /**
   * @description Gauge end angle
   * @example endAngle = 0
   */
  endAngle: number
  /**
   * @description Gauge min value
   */
  min: number
  /**
   * @description Gauge max value
   */
  max: number
  /**
   * @description Gauge split number
   */
  splitNum: number
  /**
   * @description Gauge arc line width
   */
  arcLineWidth: number
  /**
   * @description Gauge chart data
   */
  data: number[]
  /**
   * @description Data item arc default style configuration
   */
  dataItemStyle: GraphStyleConfig
  /**
   * @description Axis tick configuration
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     */
    show: boolean
    /**
     * @description Axis tick length
     */
    tickLength: number
    /**
     * @description Axis tick default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Axis label configuration
   */
  axisLabel: {
    /**
     * @description Whether to display axis label
     */
    show: boolean
    /**
     * @description Axis label data (Can be calculated automatically)
     */
    data: string[]
    /**
     * @description Axis label formatter
     */
    formatter?: string | Function
    /**
     * @description Axis label gap between label and axis tick
     */
    labelGap: number
    /**
     * @description Axis label default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Gauge pointer configuration
   */
  pointer: {
    /**
     * @description Whether to display pointer
     */
    show: boolean
    /**
     * @description Pointer value index of data
     * @default valueIndex = 0 (pointer.value = data[0].value)
     */
    valueIndex: number
    /**
     * @description Pointer default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Data item arc detail configuration
   */
  details: {
    /**
     * @description Whether to display details
     */
    show: boolean
    /**
     * @description Details formatter
     */
    formatter?: string | Function
    /**
     * @description Details position offset
     */
    offset: number[]
    /**
     * @description Value fractional precision
     */
    valueToFixed: number
    /**
     * @description Details position
     */
    position: GaugeDetailsPosition
    /**
     * @description Details default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Gauge background arc configuration
   */
  backgroundArc: {
    /**
     * @description Whether to display background arc
     */
    show: boolean
    /**
     * @description Background arc default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Gauge chart render level
   * Priority rendering high level
   */
  rLevel: number
  /**
   * @description Gauge animation curve
   */
  animationCurve: EaseCurve
  /**
   * @description Gauge animation frame
   */
  animationFrame: number
}
