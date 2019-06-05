import { extendNewGraph } from '@jiaminghi/c-render'

import { getCircleRadianPoint } from '@jiaminghi/c-render/lib/util'

import { getColorFromRgbValue } from '@jiaminghi/color'

import { getLinearGradientColor } from '../util/index'

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
      console.error('Pie shape configuration is abnormal!')

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

const agArc = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    startAngle: 0,
    endAngle: 0,
    gradientStartAngle: null,
    gradientEndAngle: null
  },

  validator ({ shape }) {
    const keys = ['rx', 'ry', 'r', 'startAngle', 'endAngle']

    if (keys.find(key => typeof shape[key] !== 'number')) {
      console.error('AgArc shape configuration is abnormal!')

      return false
    }

    return true
  },

  draw ({ ctx }, { shape, style }) {
    let { gradient } = style

    gradient = gradient.map(cv => getColorFromRgbValue(cv))

    if (gradient.length === 1) {
      gradient = [gradient[0], gradient[0]]
    }

    const gradientArcNum = gradient.length - 1

    let { gradientStartAngle, gradientEndAngle, startAngle, endAngle, r, rx, ry } = shape

    if (gradientStartAngle === null) gradientStartAngle = startAngle
    if (gradientEndAngle === null) gradientEndAngle = endAngle

    let angleGap = (gradientEndAngle - gradientStartAngle) / gradientArcNum

    if (angleGap === Math.PI * 2) angleGap = Math.PI * 2 - 0.001

    for (let i = 0; i < gradientArcNum; i++) {
      ctx.beginPath()

      const startPoint = getCircleRadianPoint(rx, ry, r, startAngle + angleGap * i)
      const endPoint = getCircleRadianPoint(rx, ry, r, startAngle + angleGap * (i + 1))

      const color = getLinearGradientColor(ctx, startPoint, endPoint, [gradient[i], gradient[i + 1]])

      const arcStartAngle = startAngle + angleGap * i
      let arcEndAngle = startAngle + angleGap * (i + 1)

      let doBreak = false

      if (arcEndAngle > endAngle) {
        arcEndAngle = endAngle

        doBreak = true
      }

      ctx.arc(rx, ry, r, arcStartAngle, arcEndAngle)

      ctx.strokeStyle = color

      ctx.stroke()

      if (doBreak) break
    }
  }
}

const numberText = {
  shape: {
    number: [],
    content: '',
    position: [0, 0],
    toFixed: 0
  },

  validator ({ shape }) {
    const { number, content, position } = shape

    if (!(number instanceof Array) || typeof content !== 'string' || !(position instanceof Array)) {

      console.error('NumberText shape configuration is abnormal!')

      return false
    }

    return true
  },

  draw ({ ctx }, { shape }) {
    ctx.beginPath()

    const { number, content, position, toFixed } = shape

    const textSegments = content.split('{nt}')

    const lastSegmentIndex = textSegments.length - 1

    let textString = ''

    textSegments.forEach((t, i) => {
      let currentNumber = number[i]

      if (i === lastSegmentIndex) currentNumber = ''

      if (typeof currentNumber === 'number') currentNumber = currentNumber.toFixed(toFixed)

      textString += t + (currentNumber || '')
    })

    ctx.closePath()

    ctx.strokeText(textString, ...position)
    ctx.fillText(textString, ...position)
  }
}

extendNewGraph('pie', pie)
extendNewGraph('agArc', agArc)
extendNewGraph('numberText', numberText)