const option1 = {
  title: {
    text: '周销售额趋势'
  },
  legend: {
    data: ['系列A', '系列B', '系列C']
  },
  xAxis: {
    name: '第一周',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    name: '销售额',
    data: 'value'
  },
  series: [
    {
      name: '系列A',
      data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
      type: 'line',
      stack: 'a',
      fill: {
        show: true
      }
    },
    {
      name: '系列B',
      data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
      type: 'line',
      stack: 'a',
      smooth: true
    },
    {
      name: '系列C',
      data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
      type: 'line',
      stack: 'a',
      lineStyle: {
        lineDash: [5, 5]
      }
    }
  ]
}

const option2 = {
  title: {
    text: '周销售额趋势'
  },
  legend: {
    data: ['系列A', '系列B', '系列C']
  },
  xAxis: {
    name: '第二周',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    name: '销售额',
    data: 'value'
  },
  series: [
    {
      name: '系列A',
      data: [2339, 1899, 2118, 1790, 3265, 4465, 3996],
      type: 'line',
      stack: 'a',
      fill: {
        show: true
      }
    },
    {
      name: '系列B',
      data: [2339, 1899, 2118, 1790, 3265, 4465, 3996],
      type: 'line',
      stack: 'a',
      smooth: true
    },
    {
      name: '系列C',
      data: [2339, 1899, 2118, 1790, 3265, 4465, 3996],
      type: 'line',
      stack: 'a',
      lineStyle: {
        lineDash: [5, 5]
      }
    }
  ]
}

export default [option1, option2]