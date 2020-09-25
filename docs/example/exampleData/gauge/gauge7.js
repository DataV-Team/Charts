const option1 = {
  series: [
    {
      type: 'gauge',
      startAngle: -Math.PI / 2,
      endAngle: Math.PI * 1.5,
      arcLineWidth: 10,
      data: [
        { name: 'A', value: 25, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'] },
        { name: 'B', value: 45, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '53%' },
        { name: 'C', value: 65, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '46%' },
        { name: 'D', value: 35, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '39%' },
        { name: 'E', value: 25, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '32%' }
      ],
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      pointer: {
        show: false
      },
      dataItemStyle: {
        lineCap: 'round'
      },
      backgroundArc: {
        show: false
      },
      details: {
        show: true,
        formatter: '{name}占比{value}%',
        position: 'start',
        offset: [-10, 0],
        style: {
            fill: '#1ed3e5',
            fontSize: 13,
            textAlign: 'right',
        }
      }
    }
  ]
}

const option2 = {
  series: [
    {
      type: 'gauge',
      startAngle: -Math.PI / 2,
      endAngle: Math.PI * 1.5,
      arcLineWidth: 10,
      data: [
        { name: 'A', value: 32, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'] },
        { name: 'B', value: 78, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '53%' },
        { name: 'C', value: 55, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '46%' },
        { name: 'D', value: 65, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '39%' },
        { name: 'E', value: 45, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'], radius: '32%' }
      ],
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      pointer: {
        show: false
      },
      dataItemStyle: {
        lineCap: 'round'
      },
      backgroundArc: {
        show: false
      },
      details: {
        show: true,
        formatter: '{name}占比{value}%',
        position: 'start',
        offset: [-10, 0],
        style: {
            fill: '#1ed3e5',
            fontSize: 13,
            textAlign: 'right',
        }
      }
    }
  ]
}

export default [option1, option2]