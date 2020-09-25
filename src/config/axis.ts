import { XAxisConfig, YAxisConfig } from '../types/config/axis'

export const xAxisDefaultConfig: XAxisConfig = {
  /**
   * @description Axis name
   */
  name: '',
  /**
   * @description Whether to display this axis
   */
  show: true,
  /**
   * @description Axis position
   */
  position: 'bottom',
  /**
   * @description Name gap
   */
  nameGap: 15,
  /**
   * @description Name location
   */
  nameLocation: 'end',
  /**
   * @description Name default style configuration
   */
  nameTextStyle: {
    fill: '#333',
    fontSize: 10,
  },
  /**
   * @description Axis min value
   */
  min: '20%',
  /**
   * @description Axis max value
   */
  max: '20%',
  /**
   * @description Axis value interval
   */
  interval: undefined,
  /**
   * @description Min interval
   */
  minInterval: undefined,
  /**
   * @description Max interval
   */
  maxInterval: undefined,
  /**
   * @description Boundary gap
   */
  boundaryGap: undefined,
  /**
   * @description Axis split number
   */
  splitNumber: 5,
  /**
   * @description Axis line configuration
   */
  axisLine: {
    /**
     * @description Whether to display axis line
     */
    show: true,
    /**
     * @description Axis line default style configuration
     */
    style: {
      stroke: '#333',
      lineWidth: 1,
    },
  },
  /**
   * @description Axis tick configuration
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     */
    show: true,
    /**
     * @description Axis tick default style configuration
     */
    style: {
      stroke: '#333',
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
     * @description Axis label formatter
     */
    formatter: undefined,
    /**
     * @description Axis label default style configuration
     */
    style: {
      fill: '#333',
      fontSize: 10,
      rotate: 0,
    },
  },
  /**
   * @description Axis split line configuration
   */
  splitLine: {
    /**
     * @description Whether to display axis split line
     */
    show: false,
    /**
     * @description Axis split line default style configuration
     */
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1,
    },
  },
  /**
   * @description X axis render level
   * Priority rendering high level
   */
  rLevel: -20,
  /**
   * @description X axis animation curve
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description X axis animation frame
   */
  animationFrame: 50,
}

export const yAxisDefaultConfig: YAxisConfig = {
  /**
   * @description Axis name
   */
  name: '',
  /**
   * @description Whether to display this axis
   */
  show: true,
  /**
   * @description Axis position
   */
  position: 'left',
  /**
   * @description Name gap
   */
  nameGap: 15,
  /**
   * @description Name location
   */
  nameLocation: 'end',
  /**
   * @description name default style configuration
   */
  nameTextStyle: {
    fill: '#333',
    fontSize: 10,
  },
  /**
   * @description Axis min value
   */
  min: '20%',
  /**
   * @description Axis max value
   */
  max: '20%',
  /**
   * @description Axis value interval
   */
  interval: undefined,
  /**
   * @description Min interval
   */
  minInterval: undefined,
  /**
   * @description Max interval
   */
  maxInterval: undefined,
  /**
   * @description Boundary gap
   */
  boundaryGap: undefined,
  /**
   * @description Axis split number
   */
  splitNumber: 5,
  /**
   * @description Axis line configuration
   */
  axisLine: {
    /**
     * @description Whether to display axis line
     */
    show: true,
    /**
     * @description Axis line default style configuration
     */
    style: {
      stroke: '#333',
      lineWidth: 1,
    },
  },
  /**
   * @description Axis tick configuration
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     */
    show: true,
    /**
     * @description Axis tick default style configuration
     */
    style: {
      stroke: '#333',
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
     * @description Axis label formatter
     */
    formatter: undefined,
    /**
     * @description Axis label default style configuration
     */
    style: {
      fill: '#333',
      fontSize: 10,
      rotate: 0,
    },
  },
  /**
   * @description Axis split line configuration
   */
  splitLine: {
    /**
     * @description Whether to display axis split line
     */
    show: true,
    /**
     * @description Axis split line default style configuration
     */
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1,
    },
  },
  /**
   * @description Y axis render level
   * Priority rendering high level
   */
  rLevel: -20,
  /**
   * @description Y axis animation curve
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description Y axis animation frame
   */
  animationFrame: 50,
}
