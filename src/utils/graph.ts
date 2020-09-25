import { PointCoordinate } from '../types/common'
import { mulAdd } from './common'

export function getTwoPointDistance(pointOne: PointCoordinate, pointTwo: PointCoordinate): number {
  const minusX = Math.abs(pointOne[0] - pointTwo[0])

  const minusY = Math.abs(pointOne[1] - pointTwo[1])

  return Math.sqrt(minusX * minusX + minusY * minusY)
}

export function getPolylineLength(points: PointCoordinate[]): number {
  const lineSegments = new Array(points.length - 1)
    .fill(null)
    .map((_, i) => [points[i], points[i + 1]])

  const lengths = lineSegments.map(([p1, p2]) => getTwoPointDistance(p1, p2))

  return mulAdd(lengths)
}
