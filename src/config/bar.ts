import { BarConfig } from '../types/config/bar'

export const barDefaultConfig: BarConfig = {
  /**
   * @description Type
   */
  type: 'bar',
  /**
   * @description Whether to display this bar chart
   */
  show: true,
  /**
   * @description Legend name
   */
  name: '',
  /**
   * @description Data stacking
   * The data value of the series element of the same stack
   * will be superimposed (the latter value will be superimposed on the previous value)
   */
  stack: '',
  /**
   * @description Bar shape type
   */
  shapeType: 'normal',
  /**
   * @description Echelon bar sharpness offset
   */
  echelonOffset: 10,
  /**
   * @description Bar width
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   */
  barWidth: 'auto',
  /**
   * @description Bar gap
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   */
  barGap: '30%',
  /**
   * @description Bar category gap
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   */
  barCategoryGap: '20%',
  /**
   * @description Bar x axis index
   */
  xAxisIndex: 0,
  /**
   * @description Bar y axis index
   */
  yAxisIndex: 0,
  /**
   * @description Bar chart data
   */
  data: [],
  /**
   * @description Background bar configuration
   */
  backgroundBar: {
    /**
     * @description Whether to display background bar
     */
    show: false,
    /**
     * @description Background bar width
     * @example width = 'auto' | '30%' | 30
     */
    width: 'auto',
    /**
     * @description Background bar default style configuration
     */
    style: {
      fill: 'rgba(200, 200, 200, .4)',
    },
  },
  /**
   * @description Bar label configuration
   */
  label: {
    /**
     * @description Whether to display bar label
     */
    show: false,
    /**
     * @description Bar label position
     */
    position: 'top',
    /**
     * @description Bar label offset
     */
    offset: [0, -10],
    /**
     * @description Bar label formatter
     */
    formatter: undefined,
    /**
     * @description Bar label default style configuration
     */
    style: {
      fontSize: 10,
    },
  },
  /**
   * @description Bar gradient configuration
   */
  gradient: {
    /**
     * @description Gradient color (Hex|rgb|rgba)
     */
    color: [],
    /**
     * @description Local gradient
     */
    local: true,
  },
  /**
   * @description Bar style default configuration
   */
  barStyle: {},
  /**
   * @description Independent color mode
   * When set to true, independent color mode is enabled
   */
  independentColor: false,
  /**
   * @description Independent colors
   * Only effective when independent color mode is enabled
   * Default value is the same as the color in the root configuration
   * Two-dimensional color array can produce gradient colors
   * @example independentColor = ['#fff', '#000']
   * @example independentColor = [['#fff', '#000'], '#000']
   */
  independentColors: [],
  /**
   * @description Bar chart render level
   * Priority rendering high level
   */
  rLevel: 0,
  /**
   * @description Bar animation curve
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description Bar animation frame
   */
  animationFrame: 50,
}
