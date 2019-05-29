export const radarAxisConfig = {
  center: ['50%', '50%'],
  radius: '65%',
  startAngle: -Math.PI / 2,
  splitNum: 5,
  polygon: false,
  name: {
    show: true,
    nameGap: 15,
    color: [],
    style: {
      fill: '#333'
    }
  },
  axisLine: {
    show: true,
    color: [],
    style: {
      stroke: '#999',
      lineWidth: 1
    }
  },
  splitLine: {
    show: true,
    color: [],
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1
    }
  },
  splitArea: {
    show: false,
    color: ['#f5f5f5', '#e6e6e6'],
    style: {}
  },
  animationCurve: 'easeOutCubic',
  animationFrane: 50
}