import Charts from '../../class/charts.class'
import { Graph } from '@jiaminghi/c-render'
import { GraphConfig } from '@jiaminghi/c-render/es/types/core/graph'
import { Updater } from '../../class/updater.class'

export type UpdaterConfig = {
  /**
   * @description Charts instance
   */
  charts: Charts

  /**
   * @description Graph Constructor
   */
  GraphConstructor: new (config: GraphConfig) => Graph

  /**
   * @description Updater target key
   */
  key: string

  /**
   * @description Series Config
   */
  // eslint-disable-next-line
  seriesConfig: any[]

  /**
   * @description Get graph config
   */
  // eslint-disable-next-line
  getGraphConfig: GetGraphConfig

  /**
   * @description Get graph start config
   */
  // eslint-disable-next-line
  getStartGraphConfig?: GetGraphConfig

  /**
   * @description Before change hook
   */
  // eslint-disable-next-line
  beforeChange?: BeforeChange

  /**
   * @description Before update hook
   */
  // eslint-disable-next-line
  beforeUpdate?: BeforeUpdate

  /**
   * @description After add hook
   */
  // eslint-disable-next-line
  afterAddGraph?: AfterAddGraph
}

// eslint-disable-next-line
export type BeforeChange = (graph: Graph, graphConfig: any, updater: Updater) => any

// eslint-disable-next-line
export type BeforeUpdate = (graph: Graph[], seriesConfigItem: any, updater: Updater) => any

// eslint-disable-next-line
export type AfterAddGraph = (graph: Graph[], seriesConfigItem: any, updater: Updater) => any

// eslint-disable-next-line
export type GetGraphConfig = (data: any, updater: Updater) => GraphConfig[]
