import { EaseCurve } from '@jiaminghi/transition/types/types/core'
import { GraphStyleConfig } from '../common'

export type GridConfig = {
  /**
   * @description Grid left margin
   */
  left: string | number
  /**
   * @description Grid right margin
   */
  right: string | number
  /**
   * @description Grid top margin
   */
  top: string | number
  /**
   * @description Grid bottom margin
   */
  bottom: string | number
  /**
   * @description Grid default style configuration
   */
  style: GraphStyleConfig
  /**
   * @description Grid render level
   * Priority rendering high level
   */
  rLevel: number
  /**
   * @description Grid animation curve
   */
  animationCurve: EaseCurve
  /**
   * @description Grid animation frame
   */
  animationFrame: number
}
