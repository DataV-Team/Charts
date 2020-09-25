import { GraphStyleConfig, PointCoordinate } from '../common'
import { EaseCurve } from '@jiaminghi/transition/types/types/core'

export type LineLabelPosition = 'top' | 'center' | 'bottom'

export type LineConfig = {
  /**
   * @description Type
   */
  type: 'line'
  /**
   * @description Whether to display this line chart
   */
  show: boolean
  /**
   * @description Legend name
   */
  name: string
  /**
   * @description Data stacking
   * The data value of the series element of the same stack
   * will be superimposed (the latter value will be superimposed on the previous value)
   */
  stack: string
  /**
   * @description Smooth line
   */
  smooth: boolean
  /**
   * @description Line x axis index
   */
  xAxisIndex: 0 | 1
  /**
   * @description Line y axis index
   */
  yAxisIndex: 0 | 1
  /**
   * @description Line chart data
   */
  data: number[]
  /**
   * @description Line default style configuration
   */
  lineStyle: GraphStyleConfig
  /**
   * @description Line point configuration
   */
  linePoint: {
    /**
     * @description Whether to display line point
     */
    show: boolean
    /**
     * @description Line point radius
     */
    radius: number
    /**
     * @description Line point default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Line area configuration
   */
  lineArea: {
    /**
     * @description Whether to display line area
     */
    show: boolean
    /**
     * @description Line area gradient color (Hex|rgb|rgba)
     */
    gradient: string[]
    /**
     * @description Line area style default configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Line label configuration
   */
  label: {
    /**
     * @description Whether to display line label
     */
    show: boolean
    /**
     * @description Line label position
     */
    position: LineLabelPosition
    /**
     * @description Line label offset
     */
    offset: number[]
    /**
     * @description Line label formatter
     */
    formatter?: string | Function
    /**
     * @description Line label default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Line chart render level
   * Priority rendering high level
   */
  rLevel: number
  /**
   * @description Line animation curve
   */
  animationCurve: EaseCurve
  /**
   * @description Line animation frame
   */
  animationFrame: number
}

export type LineFillBottomPos = {
  changeIndex: number
  changeValue: number
}

export type _LineConfig = LineConfig & {
  linePosition: PointCoordinate[]
  lineFillBottomPos: LineFillBottomPos
  color: string
}
