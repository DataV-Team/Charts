export const gaugeConfig = {
  show: true,
  center: ['50%', '50%'],
  radius: '60%',
  startAngle: -(Math.PI / 4) * 5,
  endAngle: Math.PI / 4,
  min: 0,
  max: 100,
  splitNum: 5,
  arcLineWidth: 15,
  arcItemStyle: {
  },
  axisLabel: {
    show: true,
    data: [],
    formatter: null,
    labelGap: 5,
    style: {}
  },
  axisTick: {
    show: true,
    tickLength: 6,
    style: {
        stroke: '#999',
        lineWidth: 1
    }
  },
  details: {
    show: true,
    formatter: null,
    offset: [0, 0],
    position: 'center',
    style: {}
  },
  backgroundArc: {
    show: true,
    style: {
        stroke: '#e0e0e0'
    }
  },
  animationCurve: 'easeOutCubic',
  animationFrame: 50,
}