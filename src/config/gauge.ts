import { GaugeConfig } from '../types/config/gauge'

export const gaugeDefaultConfig: GaugeConfig = {
  /**
   * @description Type
   */
  type: 'gauge',
  /**
   * @description Whether to display this gauge
   */
  show: true,
  /**
   * @description Legend name
   */
  name: '',
  /**
   * @description Radius of gauge
   */
  radius: '60%',
  /**
   * @description Center point of gauge
   */
  center: ['50%', '50%'],
  /**
   * @description Gauge start angle
   */
  startAngle: -(Math.PI / 4) * 5,
  /**
   * @description Gauge end angle
   */
  endAngle: Math.PI / 4,
  /**
   * @description Gauge min value
   */
  min: 0,
  /**
   * @description Gauge max value
   */
  max: 100,
  /**
   * @description Gauge split number
   */
  splitNum: 5,
  /**
   * @description Gauge arc line width
   */
  arcLineWidth: 15,
  /**
   * @description Gauge chart data
   */
  data: [],
  /**
   * @description Data item arc default style configuration
   */
  dataItemStyle: {},
  /**
   * @description Axis tick configuration
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     */
    show: true,
    /**
     * @description Axis tick length
     */
    tickLength: 6,
    /**
     * @description Axis tick default style configuration
     */
    style: {
      stroke: '#999',
      lineWidth: 1,
    },
  },
  /**
   * @description Axis label configuration
   */
  axisLabel: {
    /**
     * @description Whether to display axis label
     */
    show: true,
    /**
     * @description Axis label data (Can be calculated automatically)
     */
    data: [],
    /**
     * @description Axis label formatter
     */
    formatter: undefined,
    /**
     * @description Axis label gap between label and axis tick
     */
    labelGap: 5,
    /**
     * @description Axis label default style configuration
     */
    style: {},
  },
  /**
   * @description Gauge pointer configuration
   */
  pointer: {
    /**
     * @description Whether to display pointer
     */
    show: true,
    /**
     * @description Pointer value index of data
     * @default valueIndex = 0 (pointer.value = data[0].value)
     */
    valueIndex: 0,
    /**
     * @description Pointer default style configuration
     */
    style: {
      scale: [1, 1],
      fill: '#fb7293',
    },
  },
  /**
   * @description Data item arc detail configuration
   */
  details: {
    /**
     * @description Whether to display details
     */
    show: false,
    /**
     * @description Details formatter
     */
    formatter: undefined,
    /**
     * @description Details position offset
     */
    offset: [0, 0],
    /**
     * @description Value fractional precision
     */
    valueToFixed: 0,
    /**
     * @description Details position
     */
    position: 'center',
    /**
     * @description Details default style configuration
     */
    style: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  },
  /**
   * @description Gauge background arc configuration
   */
  backgroundArc: {
    /**
     * @description Whether to display background arc
     */
    show: true,
    /**
     * @description Background arc default style configuration
     */
    style: {
      stroke: '#e0e0e0',
    },
  },
  /**
   * @description Gauge chart render level
   * Priority rendering high level
   */
  rLevel: 10,
  /**
   * @description Gauge animation curve
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description Gauge animation frame
   */
  animationFrame: 50,
}
