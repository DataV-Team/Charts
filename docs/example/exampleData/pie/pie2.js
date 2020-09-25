const option1 = {
  title: {
    text: '畅销饮料占比饼状图'
  },
  series: [
    {
      type: 'pie',
      data: [
        { name: '可口可乐', value: 93 },
        { name: '百事可乐', value: 32 },
        { name: '哇哈哈', value: 65 },
        { name: '康师傅', value: 44 },
        { name: '统一', value: 52 },
      ],
      insideLabel: {
        show: true
      },
      roseType: true
    }
  ]
}

const option2 = {
  title: {
    text: '畅销饮料占比饼状图'
  },
  series: [
    {
      type: 'pie',
      data: [
        { name: '可口可乐', value: 93 },
        { name: '百事可乐', value: 32 },
        { name: '哇哈哈', value: 65 },
        { name: '康师傅', value: 44 }
      ],
      insideLabel: {
        show: true
      }
    }
  ]
}

export default [option1, option2]