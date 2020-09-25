const option1 = {
  radar: {
    indicator: [
      { name: '西峡', max: 300 },
      { name: '周口', max: 300 },
      { name: '南阳', max: 300 },
      { name: '驻马店', max: 300 },
      { name: '郑州', max: 300 },
      { name: '洛阳', max: 300 }
    ],
    polygon: true,
    splitLine: {
      style: {
        stroke: 'rgba(159, 230, 184, 1)'
      }
    },
    axisLine: {
      style: {
        stroke: 'rgba(159, 230, 184, 1)'
      }
    },
    splitArea: {
      show: true,
      color: ['rgba(159, 230, 184, .2)', 'rgba(251, 114, 147, .2)']
    }
  },
  series: [
    {
      type: 'radar',
      data: [111, 256, 178, 152, 266, 132],
      animationCurve: 'easeInOutBack'
    }
  ]
}

const option2 = {
  radar: {
    indicator: [
      { name: '西峡', max: 300 },
      { name: '周口', max: 300 },
      { name: '南阳', max: 300 },
      { name: '驻马店', max: 300 },
      { name: '郑州', max: 300 },
      { name: '洛阳', max: 300 }
    ],
    polygon: true,
    splitLine: {
      style: {
        stroke: 'rgba(159, 230, 184, 1)'
      }
    },
    axisLine: {
      style: {
        stroke: 'rgba(159, 230, 184, 1)'
      }
    },
    splitArea: {
      show: true,
      color: ['rgba(251, 114, 147, .2)', 'rgba(159, 230, 184, .2)']
    }
  },
  series: [
    {
      type: 'radar',
      data: [223, 189, 214, 265, 178, 155],
      animationCurve: 'easeInOutBack'
    }
  ]
}

export default [option1, option2]