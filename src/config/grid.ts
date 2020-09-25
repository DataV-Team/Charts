import { GridConfig } from '../types/config/grid'

export const gridDefaultConfig: GridConfig = {
  /**
   * @description Grid left margin
   */
  left: '10%',
  /**
   * @description Grid right margin
   */
  right: '10%',
  /**
   * @description Grid top margin
   */
  top: 60,
  /**
   * @description Grid bottom margin
   */
  bottom: 60,
  /**
   * @description Grid default style configuration
   */
  style: {
    fill: 'rgba(0, 0, 0, 0)',
  },
  /**
   * @description Grid render level
   * Priority rendering high level
   */
  rLevel: -30,
  /**
   * @description Grid animation curve
   */
  animationCurve: 'easeOutCubic',
  /**
   * @description Grid animation frame
   */
  animationFrame: 30,
}
