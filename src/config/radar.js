export const radarConfig = {
  /**
   * @description Whether to display this radar
   * @type {Boolean}
   * @default show = true
   */
  show: true,
  /**
   * @description Radar default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  radarStyle: {
    lineWidth: 1
  },
  /**
   * @description Radar point configuration
   * @type {Object}
   */
  point: {
    /**
     * @description Whether to display radar point
     * @type {Boolean}
     * @default show = true
     */
    show: true,
    /**
     * @description Point radius
     * @type {Number}
     * @default radius = 2
     */
    radius: 2,
    /**
     * @description Radar point default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: '#fff'
    }
  },
  /**
   * @description Radar label configuration
   * @type {Object}
   */
  label: {
    /**
     * @description Whether to display radar label
     * @type {Boolean}
     * @default show = true
     */
    show: true,
    /**
     * @description Label position offset
     * @type {Array}
     * @default offset = [0, 0]
     */
    offset: [0, 0],
    /**
     * @description Label gap between label and radar
     * @type {Number}
     * @default labelGap = 5
     */
    labelGap: 5,
    /**
     * @description Label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = 'Score-{value}'
     * @example formatter = (label) => (label)
     */
    formatter: null,
    /**
     * @description Radar label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 10
    }
  },
  /**
   * @description Radar animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description Radar animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrane: 50
}