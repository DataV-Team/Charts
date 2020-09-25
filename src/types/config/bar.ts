import { GraphStyleConfig } from '../common'
import { LiteralUnion } from '@jiaminghi/c-render/es/types/common'
import { EaseCurve } from '@jiaminghi/transition/types/types/core'

export type BarShapeType = 'normal' | 'round' | 'leftEchelon' | 'rightEchelon'

export type BarLabelPosition = 'top' | 'center' | 'bottom'

export type BarConfig = {
  /**
   * @description Type
   */
  type: 'bar'
  /**
   * @description Whether to display this bar chart
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
   * @description Bar shape type
   */
  shapeType: BarShapeType
  /**
   * @description Echelon bar sharpness offset
   */
  echelonOffset: number
  /**
   * @description Bar width
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   * @example width = 'auto' | '30%' | 30
   */
  barWidth: LiteralUnion<'auto', string> | number
  /**
   * @description Bar gap
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   */
  barGap: string | number
  /**
   * @description Bar category gap
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   */
  barCategoryGap: string | number
  /**
   * @description Bar x axis index
   */
  xAxisIndex: 0 | 1
  /**
   * @description Bar y axis index
   */
  yAxisIndex: 0 | 1
  /**
   * @description Bar chart data
   */
  data: number[]
  /**
   * @description Background bar configuration
   */
  backgroundBar: {
    /**
     * @description Whether to display background bar
     */
    show: boolean
    /**
     * @description Background bar width
     * @example width = 'auto' | '30%' | 30
     */
    width: LiteralUnion<'auto', string> | number
    /**
     * @description Background bar default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Bar label configuration
   */
  label: {
    /**
     * @description Whether to display bar label
     */
    show: boolean
    /**
     * @description Bar label position
     * @type {String}
     * @default position = 'top'
     * @example position = 'top' | 'center' | 'bottom'
     */
    position: BarLabelPosition
    /**
     * @description Bar label offset
     */
    offset: [number, number]
    /**
     * @description Bar label formatter
     * @type {String|Function}
     */
    formatter?: string | Function
    /**
     * @description Bar label default style configuration
     */
    style: GraphStyleConfig
  }
  /**
   * @description Bar gradient configuration
   */
  gradient: {
    /**
     * @description Gradient color (Hex|rgb|rgba)
     */
    color: string[]
    /**
     * @description Local gradient
     */
    local: boolean
  }
  /**
   * @description Bar style default configuration
   */
  barStyle: GraphStyleConfig
  /**
   * @description Independent color mode
   * When set to true, independent color mode is enabled
   */
  independentColor: boolean
  /**
   * @description Independent colors
   * Only effective when independent color mode is enabled
   * Default value is the same as the color in the root configuration
   * Two-dimensional color array can produce gradient colors
   * @example independentColor = ['#fff', '#000']
   * @example independentColor = [['#fff', '#000'], '#000']
   */
  independentColors: (string | string[])[]
  /**
   * @description Bar chart render level
   * Priority rendering high level
   */
  rLevel: number
  /**
   * @description Bar animation curve
   */
  animationCurve: EaseCurve
  /**
   * @description Bar animation frame
   */
  animationFrame: number
}
