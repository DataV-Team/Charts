const option1 = {
  title: {
    text: '周销售额趋势'
  },
  legend: {
    data: [
      {
        name: '销售额',
        color: '#aeeff0'
      },
      {
        name: '人流量',
        color: '#f1829f'
      }
    ]
  },
  xAxis: {
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: [
    {
      name: '销售额',
      data: 'value'
    },
    {
      name: '人流量',
      data: 'value',
      position: 'right',
      max: 2000,
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '人流量',
      data: [1000, 1200, 900, 1500, 900, 1200, 1000],
      type: 'line',
      smooth: true,
      lineArea: {
        show: true,
        gradient: ['rgba(251, 114, 147, 1)', 'rgba(251, 114, 147, 0)']
      },
      lineStyle: {
        stroke: 'rgba(251, 114, 147, 1)',
        lineDash: [3, 3]
      },
      linePoint: {
        style: {
          stroke: 'rgba(251, 114, 147, 1)'
        }
      },
      yAxisIndex: 1
    },
    {
      name: '销售额',
      data: [1500, 1700, 1400, 2000, 1400, 1700, 1500],
      type: 'bar',
      gradient: {
        color: ['rgba(103, 224, 227, .6)', 'rgba(103, 224, 227, .1)']
      },
      barStyle: {
        stroke: 'rgba(103, 224, 227, 1)'
      }
    }
  ]
}

const option2 = {
  title: {
    text: '周销售额趋势'
  },
  legend: {
    data: [
      {
        name: '销售额',
        color: '#aeeff0'
      },
      {
        name: '人流量',
        color: '#f1829f'
      }
    ]
  },
  xAxis: {
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: [
    {
      name: '销售额',
      data: 'value'
    },
    {
      name: '人流量',
      data: 'value',
      position: 'right',
      max: 2000,
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '人流量',
      data: [1200, 1000, 1500, 900, 1500, 1000, 1200],
      type: 'line',
      smooth: true,
      lineArea: {
        show: true,
        gradient: ['rgba(251, 114, 147, 1)', 'rgba(251, 114, 147, 0)']
      },
      lineStyle: {
        stroke: 'rgba(251, 114, 147, 1)'
      },
      linePoint: {
        style: {
          stroke: 'rgba(251, 114, 147, 1)'
        }
      },
      yAxisIndex: 1
    },
    {
      name: '销售额',
      data: [1700, 1500, 2000, 1400, 2000, 1500, 1700],
      type: 'bar',
      gradient: {
        color: ['rgba(103, 224, 227, .6)', 'rgba(103, 224, 227, .1)']
      },
      barStyle: {
        stroke: 'rgba(103, 224, 227, 1)'
      }
    }
  ]
}

export default [option1, option2]