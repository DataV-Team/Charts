import { extendNewGraph } from '@jiaminghi/c-render'

import { getCircleRadianPoint } from '@jiaminghi/c-render/lib/util'

const pie = {
  shape: {
    rx: 0,
    ry: 0,
    ir: 0,
    or: 0,
    startAngle: 0,
    endAngle: 0,
    clockWise: true
  },

  validator ({ shape }) {
    const keys = ['rx', 'ry', 'ir', 'or', 'startAngle', 'endAngle']

    if (keys.find(key => typeof shape[key] !== 'number')) {
      console.error('Shape configuration is abnormal!')

      return false
    }

    return true
  },

  draw ({ ctx }, { shape }) {
    ctx.beginPath()

    let { rx, ry, ir, or, startAngle, endAngle, clockWise } = shape

    rx = parseInt(rx) + 0.5
    ry = parseInt(ry) + 0.5

    ctx.arc(rx, ry, ir > 0 ? ir : 0, startAngle, endAngle, !clockWise)

    const connectPoint1 = getCircleRadianPoint(rx, ry, or, endAngle).map(p => parseInt(p) + 0.5)
    const connectPoint2 = getCircleRadianPoint(rx, ry, ir, startAngle).map(p => parseInt(p) + 0.5)

    ctx.lineTo(...connectPoint1)

    ctx.arc(rx, ry, or > 0 ? or : 0, endAngle, startAngle, clockWise)

    ctx.lineTo(...connectPoint2)

    ctx.closePath()

    ctx.stroke()
    ctx.fill()
  }
}

extendNewGraph('pie', pie)