import { GraphStyleConfig, LineCoordinate, PointCoordinate } from '../common'
import { EaseCurve } from '@jiaminghi/transition/types/types/core'

export type XAxisPosition = 'bottom' | 'top'

export type YAxisPosition = 'left' | 'right'

export type AxisPosition = XAxisPosition | YAxisPosition

export type AxisNameLocation = 'end' | 'center' | 'start'

export type AxisConfig<AxisPosition = XAxisPosition | YAxisPosition> = {
  /**
   * @description Axis name
   */
  name: string
  /**
   * @description Whether to display this axis
   */
  show: boolean
  /**
   * @description Axis Data
   */
  data?: 'value' | string[]
  /**
   * @description Axis position
   */
  position: AxisPosition
  /**
   * @description Name gap
   */
  nameGap: 15
  /**
   * @description Name location
   */
  nameLocation: AxisNameLocation
  /**
   * @description Name default style configuration
   */
  nameTextStyle: GraphStyleConfig
  /**
   * @description Axis min value
   */
  min: string | number
  /**
   * @description Axis max value
   */
  max: string | number
  /**
   * @description Axis value interval
   */
  interval?: number
  /**
   * @description Min interval
   */
  minInterval?: number
  /**
   * @description Max interval
   */
  maxInterval?: number
  /**
   * @description Boundary gap
   */
  boundaryGap?: boolean
  /**
   * @description Axis split number
   */
  splitNumber: number
  /**
   * @description Axis line configuration
   */
  axisLine: {
    /**
     * @description Whether to display axis line
     */
    show: boolean
    /**
     * @description Axis line default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Axis tick configuration
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     */
    show: boolean
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
     * @description Axis label formatter
     */
    formatter?: string | Function
    /**
     * @description Axis label default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Axis split line configuration
   */
  splitLine: {
    /**
     * @description Whether to display axis split line
     */
    show: boolean
    /**
     * @description Axis split line default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Axis render level
   * Priority rendering high level
   */
  rLevel: number
  /**
   * @description Axis animation curve
   */
  animationCurve: EaseCurve
  /**
   * @description Axis animation frame
   */
  animationFrame: number
}

export type XAxisConfig = AxisConfig<XAxisPosition>

export type YAxisConfig = AxisConfig<YAxisPosition>

export type AxisType = 'x' | 'y'

export type _AxisConfig = AxisConfig & {
  axis: AxisType
  index: number
  linePosition: LineCoordinate
  label: string[]
  minValue: number
  maxValue: number
  tickPosition: PointCoordinate[]
  tickLinePosition: LineCoordinate[]
  splitLinePosition: LineCoordinate[]
  namePosition: PointCoordinate
}
