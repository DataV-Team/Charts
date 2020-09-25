import { UpdaterConfig } from '../types/class/updater'
import { Updater } from '../class/updater.class'

export function doUpdate(config: UpdaterConfig): void {
  const { charts, key, seriesConfig } = config

  const updater = charts.series.find(({ key: _ }) => key === _)

  if (updater) {
    updater.updater.update(seriesConfig)
  } else {
    new Updater(config)
  }
}
