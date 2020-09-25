const option1 = {
  title: {
    text: '畅销饮料占比饼状图'
  },
  legend: {
    data: ['同比', '环比'],
    orient: 'vertical'
  },
  series: [
    {
      name: '同比',
      type: 'pie',
      data: [
        { name: '可口可乐', value: 93 },
        { name: '百事可乐', value: 32 },
        { name: '哇哈哈', value: 65 },
        { name: '康师傅', value: 44 },
        { name: '统一', value: 52 },
      ],
      radius: '30%',
      outsideLabel: {
        show: false
      },
      insideLabel: {
        show: true
      }
    },
    {
      name: '环比',
      type: 'pie',
      data: [
        { name: '可口可乐', value: 93 },
        { name: '百事可乐', value: 32 },
        { name: '哇哈哈', value: 65 },
        { name: '康师傅', value: 44 },
        { name: '统一', value: 52 },
      ],
      radius: ['40%', '50%']
    }
  ]
}

const option2 = {
  title: {
    text: '畅销饮料占比饼状图'
  },
  legend: {
    data: ['同比', '环比']
  },
  series: [
    {
      name: '同比',
      type: 'pie',
      data: [
        { name: '可口可乐', value: 93 },
        { name: '百事可乐', value: 32 },
        { name: '哇哈哈', value: 65 },
        { name: '康师傅', value: 44 }
      ],
      radius: '30%',
      outsideLabel: {
        show: false
      },
      insideLabel: {
        show: true
      }
    },
    {
      name: '环比',
      type: 'pie',
      data: [
        { name: '可口可乐', value: 93 },
        { name: '百事可乐', value: 32 },
        { name: '哇哈哈', value: 65 },
        { name: '康师傅', value: 44 }
      ],
      radius: ['40%', '50%']
    }
  ]
}

export default [option1, option2]