export const pieConfig = {
  show: true,
  radius: '50%',
  center: ['50%', '50%'],
  startAngle: -Math.PI / 2,
  roseType: false,
  roseIncrement: '15%',
  insideLabel: {
    show: false,
    formatter: '{percent}%',
    style: {
      fontSize: 10,
      fill: '#fff'
    }
  },
  outsideLabel: {
    show: true,
    formatter: '{name}',
    style: {
      fontSize: 11,
    },
    labelLineStyle: {
    },
    labelLineBendGap: '20%',
    labelLineEndLength: 50
  },
  pieStyle: {
    shadowColor: '#888',
    shadowBlur: 5
  },
  percentToFixed: 0,
  animationDelayGap: 60,
  animationCurve: 'easeOutCubic',
  startAnimationCurve: 'easeOutBack',
  animationFrame: 50,
}