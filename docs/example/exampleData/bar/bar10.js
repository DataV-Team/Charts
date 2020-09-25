const option1 = {
  title: {
    text: '气温与降雨量走势图'
  },
  legend: {
    data: ['降雨量', '气温'],
    bottom: 10
  },
  xAxis: {
    data: [
    '一月份', '二月份', '三月份', '四月份', '五月份', '六月份',
    '七月份', '八月份', '九月份', '十月份', '十一月份', '十二月份'
    ],
    axisLabel: {
      style: {
        rotate: 20,
        textAlign: 'left',
        textBaseline: 'top'
      }
    },
    axisTick: {
      show: false
    }
  },
  yAxis: [
    {
      name: '降雨量',
      data: 'value',
      min: 0,
      max: 300,
      interval: 50,
      splitLine: {
        style: {
          lineDash: [3,3]
        }
      },
      axisLabel: {
        formatter: '{value} ml'
      },
      axisTick: {
        show: false
      }
    },
    {
      name: '气温',
      data: 'value',
      position: 'right',
      min: 0,
      max: 30,
      interval: 5,
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: '{value} °C',
      },
      axisTick: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '降雨量',
      data: [
        175, 125, 90, 130, 45, 65,
        65, 47, 50, 52, 45, 37
      ],
      type: 'bar',
      gradient: {
        color: ['#37a2da', '#67e0e3']
      },
      animationCurve: 'easeOutBounce'
    },
    {
      name: '气温',
      data: [
      23, 18, 16, 14, 10, 8,
      6, 6, 6, 6, 6, 5
      ],
      type: 'line',
      yAxisIndex: 1,
      animationCurve: 'easeOutBounce'
    }
  ]
}

const option2 = {
  title: {
    text: '气温与降雨量走势图'
  },
  legend: {
    data: ['降雨量', '气温'],
    bottom: 10
  },
  xAxis: {
    data: [
      '一月份', '二月份', '三月份', '四月份', '五月份', '六月份',
      '七月份', '八月份', '九月份', '十月份', '十一月份', '十二月份'
    ],
    axisLabel: {
      style: {
        rotate: 20,
        textAlign: 'left',
        textBaseline: 'top'
      }
    },
    axisTick: {
      show: false
    }
  },
  yAxis: [
    {
      name: '降雨量',
      data: 'value',
      min: 0,
      max: 300,
      interval: 50,
      splitLine: {
        style: {
          lineDash: [3,3]
        }
      },
      axisLabel: {
        formatter: '{value} ml'
      },
      axisTick: {
        show: false
      }
    },
    {
      name: '气温',
      data: 'value',
      position: 'right',
      min: 0,
      max: 30,
      interval: 5,
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: '{value} °C',
      },
      axisTick: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '降雨量',
      data: [
        155, 135, 100, 120, 40, 55,
        70, 50, 45, 55, 40, 37
      ],
      type: 'bar',
      gradient: {
        color: ['#37a2da', '#67e0e3']
      },
      animationCurve: 'easeOutBounce'
    },
    {
      name: '气温',
      data: [
        22, 18, 15, 14, 11, 9,
        5, 5, 5, 5, 5, 4
      ],
      type: 'line',
      yAxisIndex: 1,
      animationCurve: 'easeOutBounce'
    }
  ]
}

export default [option1, option2]