const option1 = {
  title: {
    text: '剩余油量表'
  },
  series: [
    {
      type: 'gauge',
      data: [
        { name: '油箱A', value: 59 },
        { name: '油箱B', value: 78, radius: '40%' },
        { name: '油箱C', value: 45, radius: '20%' }
      ],
      axisLabel: {
        formatter: '{value}%'
      },
      pointer: {
        valueIndex: 2,
        style: {
          scale: [.6, .6]
        }
      },
      details: {
        show: true,
        formatter: '{name}剩余{value}%',
        position: 'start',
        offset: [10, 0],
        style: {
          fontSize: 13,
          textAlign: 'left'
        }
      }
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
      data: [
        { name: '油箱A', value: 78 },
        { name: '油箱B', value: 65, radius: '40%' },
        { name: '油箱C', value: 55, radius: '20%' }
      ],
      axisLabel: {
        formatter: '{value}%'
      },
      pointer: {
        valueIndex: 2,
        style: {
          scale: [.6, .6]
        }
      },
      details: {
        show: true,
        formatter: '{name}剩余{value}%',
        position: 'start',
        offset: [10, 0],
        style: {
          fontSize: 13,
          textAlign: 'left'
        }
      }
    }
  ]
}

export default [option1, option2]