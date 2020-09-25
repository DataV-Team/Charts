import { StyleConfig } from '@jiaminghi/c-render/es/types/core/style'
import { RgbaValue } from '@jiaminghi/color/types/types'

export type GraphStyleConfig = StyleConfig<string | RgbaValue>

export type LiteralUnion<T extends U, U> = T | (U & {})

export type PointCoordinate = [number, number]

export type LineCoordinate = [PointCoordinate, PointCoordinate]
