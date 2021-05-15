import Charts from './charts.class'
import {
  UpdaterConfig,
  GetGraphConfig,
  BeforeChange,
  BeforeUpdate,
  AfterAddGraph,
  GetGraphConstructor,
} from '../types/class/updater'
import { Graph } from '@jiaminghi/c-render'
import { GraphConfig } from '@jiaminghi/c-render/es/types/core/graph'

export class Updater {
  /**
   * @description Charts instance
   */
  charts!: Charts

  /**
   * @description Get Graph Constructor
   */
  getGraphConstructor!: GetGraphConstructor

  /**
   * @description Updater target key
   */
  key!: string

  /**
   * @description Updater target graphs
   */
  graphs: Graph[][] = []

  /**
   * @description Get graph config
   */
  // eslint-disable-next-line
  getGraphConfig!: GetGraphConfig

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

  // eslint-disable-next-line
  constructor(config: UpdaterConfig) {
    const { getGraphConfig, charts, key, seriesConfig } = config

    if (typeof getGraphConfig !== 'function')
      throw new Error('Charts - Updater: Need function getGraphConfig!')

    charts.series.push({
      key,
      updater: this,
    })

    Object.assign(this, config)

    this.update(seriesConfig)
  }

  // eslint-disable-next-line
  update(seriesConfig: any[]): void {
    const { graphs, beforeUpdate } = this

    this.delRedundanceGraph(seriesConfig)
    if (!seriesConfig.length) return

    seriesConfig.forEach((seriesConfigItem, i) => {
      beforeUpdate?.(graphs[i] || [], seriesConfigItem, i, this)

      const cacheGraphs = graphs[i]

      if (cacheGraphs?.length) {
        this.changeGraphs(cacheGraphs, seriesConfigItem)
      } else {
        this.addGraphs(seriesConfigItem, i)
      }
    })
  }

  // eslint-disable-next-line
  delRedundanceGraph(seriesConfig: any[]): void {
    const {
      graphs,
      charts: { render },
    } = this

    const cacheGraphNum = graphs.length
    const needGraphNum = seriesConfig.length

    if (cacheGraphNum > needGraphNum) {
      const needDelGraphs = graphs.splice(needGraphNum)

      needDelGraphs.forEach(_ => render.delGraph(_, true))
    }
  }

  // eslint-disable-next-line
  changeGraphs(cacheGraphs: Graph[], seriesConfigItem: any): void {
    const { getGraphConfig, beforeChange } = this

    const graphConfigs = getGraphConfig(seriesConfigItem, this)

    this.balanceGraphsNum(cacheGraphs, graphConfigs)

    cacheGraphs.forEach((graph, i) => {
      const graphConfig = graphConfigs[i]

      beforeChange?.(graph, graphConfig, this)

      this.updateGraphConfigByKey(graph, graphConfig)
    })
  }

  balanceGraphsNum(cacheGraphs: Graph[], graphConfigs: GraphConfig[]): void {
    const {
      charts: { render },
    } = this

    const cacheGraphNum = cacheGraphs.length
    const needGraphNum = graphConfigs.length

    if (needGraphNum > cacheGraphNum) {
      const lastCacheGraph = [...cacheGraphs].pop()

      const needAddGraphNum = needGraphNum - cacheGraphNum

      const needAddGraphs = new Array(needAddGraphNum).fill(null).map(_ => lastCacheGraph!.clone())

      render.add(needAddGraphs, true)

      cacheGraphs.push(...needAddGraphs)
    } else if (needGraphNum < cacheGraphNum) {
      const needDelCache = cacheGraphs.splice(needGraphNum)

      needDelCache.forEach(_ => render.delGraph(_, true))
    }
  }

  updateGraphConfigByKey(graph: Graph, graphConfig: GraphConfig): void {
    const keys = Object.keys(graphConfig) as (keyof GraphConfig)[]

    keys.forEach(key => {
      const configValueOfKey = graphConfig[key]

      if (key === 'shape') {
        graph.animation(key, configValueOfKey, true)
      } else if (key === 'style') {
        graph.animation(key, configValueOfKey!, true)
      } else {
        graph.attr(key, configValueOfKey)
      }
    })
  }

  // eslint-disable-next-line
  addGraphs(seriesConfigItem: any, index: number): void {
    const {
      getGraphConfig,
      getStartGraphConfig,
      charts: { render },
      graphs,
      getGraphConstructor,
      afterAddGraph,
    } = this

    const Constructor = getGraphConstructor(seriesConfigItem)

    const startConfigs = getStartGraphConfig?.(seriesConfigItem, this)
    const configs = getGraphConfig(seriesConfigItem, this)
    if (!configs.length) return

    if (startConfigs) {
      const willAddGraphs = startConfigs.map(_ => new Constructor(_))

      graphs[index] = willAddGraphs
      render.add(willAddGraphs, true)

      willAddGraphs.forEach((graph, i) => this.updateGraphConfigByKey(graph, configs[i]))
    } else {
      const willAddGraphs = configs.map(_ => new Constructor(_))

      graphs[index] = willAddGraphs
      render.add(willAddGraphs, true)
    }

    afterAddGraph?.(graphs[index], seriesConfigItem, this)
  }
}
