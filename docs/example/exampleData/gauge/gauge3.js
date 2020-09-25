const option1 = {
  title: {
    text: '剩余油量表'
  },
  series: [
    {
      type: 'gauge',
      data: [
        { name: 'itemA', value: 55, gradient: ['#e7bcf3', '#e690d1', '#fb7293'] }
      ],
      axisLabel: {
        formatter: '{value}%'
      },
      animationCurve: 'easeOutBounce'
    }
  ]
}

const option2 = {
  title: {
    text: '剩余油量表'
  },
  series: [
    {
      type: 'gauge',
      data: [ { name: 'itemA', value: 89, gradient: ['#e7bcf3', '#e690d1', '#fb7293'] } ],
      axisLabel: {
        formatter: '{value}%'
      },
      animationCurve: 'easeOutBounce'
    }
  ]
}

export default [option1, option2]