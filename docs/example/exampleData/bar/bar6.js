const option1 = {
  title: {
    text: '周销售额趋势'
  },
  xAxis: {
    name: '第一周',
    data: 'value'
  },
  yAxis: {
    name: '销售额',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  series: [
    {
      data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
      type: 'bar',
      animationCurve: 'easeOutBack'
    }
  ]
}

const option2 = {
  title: {
    text: '周销售额趋势'
  },
  xAxis: {
    name: '第一周',
    data: 'value'
  },
  yAxis: {
    name: '销售额',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  series: [
    {
      data: [2339, 1899, 2118, 1790, 3265, 4465, 3996],
      type: 'bar',
      animationCurve: 'easeOutBack'
    }
  ]
}

export default [option1, option2]