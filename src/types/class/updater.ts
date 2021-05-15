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
  getGraphConstructor: GetGraphConstructor

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
  getGraphConfig: GetGraphConfig

  /**
   * @description Get graph start config
   */
  getStartGraphConfig?: GetGraphConfig

  /**
   * @description Before change hook
   */
  beforeChange?: BeforeChange

  /**
   * @description Before update hook
   */
  beforeUpdate?: BeforeUpdate

  /**
   * @description After add hook
   */
  afterAddGraph?: AfterAddGraph
}

// eslint-disable-next-line
export type BeforeChange = (graph: Graph, graphConfig: any, updater: Updater) => any

// eslint-disable-next-line
export type BeforeUpdate = (
  graph: Graph[],
  // eslint-disable-next-line
  seriesConfigItem: any,
  i: number,
  updater: Updater
  // eslint-disable-next-line
) => any

// eslint-disable-next-line
export type AfterAddGraph = (graph: Graph[], seriesConfigItem: any, updater: Updater) => any

// eslint-disable-next-line
export type GetGraphConfig = (data: any, updater: Updater) => GraphConfig[]

// eslint-disable-next-line
export type GetGraphConstructor = (seriesConfigItem: any) => new (config: GraphConfig) => Graph
