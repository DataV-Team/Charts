import { LineConfig } from '../types/config/line'

export const lineDefaultConfig: LineConfig = {
  /**
   * @description Type
   */
  type: 'line',
  /**
   * @description Whether to display this line chart
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
   * @description Smooth line
   */
  smooth: false,
  /**
   * @description Line x axis index
   */
  xAxisIndex: 0,
  /**
   * @description Line y axis index
   */
  yAxisIndex: 0,
  /**
   * @description Line chart data
   */
  data: [],
  /**
   * @description Line default style configuration
   */
  lineStyle: {
    lineWidth: 1,
  },
  /**
   * @description Line point configuration
   */
  linePoint: {
    /**
     * @description Whether to display line point
     */
    show: true,
    /**
     * @description Line point radius
     */
    radius: 2,
    /**
     * @description Line point default style configuration
     */
    style: {
      fill: '#fff',
      lineWidth: 1,
    },
  },
  /**
   * @description Line area configuration
   */
  lineArea: {
    /**
     * @description Whether to display line area
     */
    show: false,
    /**
     * @description Line area gradient color (Hex|rgb|rgba)
     */
    gradient: [],
    /**
     * @description Line area style default configuration
     */
    style: {
      opacity: 0.5,
    },
  },
  /**
   * @description Line label configuration
   */
  label: {
    /**
     * @description Whether to display line label
     */
    show: false,
    /**
     * @description Line label position
     */
    position: 'top',
    /**
     * @description Line label offset
     */
    offset: [0, -10],
    /**
     * @description Line label formatter
     */
    formatter: undefined,
    /**
     * @description Line label default style configuration
     */
    style: {
      fontSize: 10,
    },
  },
  /**
   * @description Line chart render level
   * Priority rendering high level
   */
  rLevel: 10,
  /**
   * @description Line animation curve
   * @type {String}
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description Line animation frame
   */
  animationFrame: 50,
}
