const option1 = {
  grid: {
    left: 20,
    right: 20,
    top: '5%',
    bottom: '5%'
  },
  xAxis: {
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false
    }
  },
  yAxis: {
    data: 'value',
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  series: [
    {
      type: 'bar',
      data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
      label: {
        show: true,
        position: 'center',
        offset: [0, 0],
        style: {
          fill: '#fff'
        }
      },
      backgroundBar: {
        show: true
      },
      animationCurve: 'easeOutBounce'
    }
  ]
}

const option2 = {
  xAxis: {
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false
    }
  },
  yAxis: {
    data: 'value',
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  series: [
    {
      type: 'bar',
      data: [2339, 1899, 2118, 1790, 3265, 4465, 3996],
      label: {
        show: true,
        position: 'center',
        offset: [0, 0],
        style: {
          fill: '#fff'
        }
      },
      backgroundBar: {
        show: true
      },
      animationCurve: 'easeOutBounce'
    }
  ]
}

export default [option1, option2]