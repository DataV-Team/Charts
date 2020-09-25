const option1 = {
  legend: {
    data: ['同比', '环比']
  },
  radar: {
    polygon: true,
    indicator: [
      { name: '西峡', max: 300 },
      { name: '周口', max: 300 },
      { name: '南阳', max: 300 },
      { name: '驻马店', max: 300 },
      { name: '郑州', max: 300 },
      { name: '洛阳', max: 300 }
    ]
  },
  series: [
    {
      name: '同比',
      type: 'radar',
      data: [111, 256, 178, 152, 266, 132],
      label: {
        show: false
      },
      animationCurve: 'easeOutBounce'
    },
    {
      name: '环比',
      type: 'radar',
      data: [222, 245, 220, 130, 240, 100],
      label: {
        show: false
      },
      animationCurve: 'easeOutBounce'
    }
  ]
}

const option2 = {
  legend: {
    data: ['同比', '环比']
  },
  radar: {
    polygon: true,
    indicator: [
      { name: '西峡', max: 300 },
      { name: '周口', max: 300 },
      { name: '南阳', max: 300 },
      { name: '驻马店', max: 300 },
      { name: '郑州', max: 300 },
      { name: '洛阳', max: 300 }
    ]
  },
  series: [
    {
      name: '同比',
      type: 'radar',
      data: [223, 189, 214, 265, 178, 155],
      label: {
        show: false
      },
      animationCurve: 'easeOutBounce'
    },
    {
      name: '环比',
      type: 'radar',
      data: [116, 256, 280, 244, 240, 255],
      label: {
        show: false
      },
      animationCurve: 'easeOutBounce'
    }
  ]
}

export default [option1, option2]