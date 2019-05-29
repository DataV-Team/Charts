export const barConfig = {
  show: true,
  shapeType: 'normal',
  echelonOffset: 10,
  barWidth: 'auto',
  barGap: '30%',
  barCategoryGap: '20%',
  xAxisIndex: 0,
  yAxisIndex: 0,
  backgroundBar: {
    show: false,
    width: 'auto',
    style: {
      fill: 'rgba(200, 200, 200, .4)'
    }
  },
  label: {
    show: false,
    position: 'top',
    offset: [0, -10],
    formatter: null,
    style: {
      fontSize: 10
    }
  },
  gradient: {
    color: [],
    local: true
  },
  barStyle: {},
  animationCurve: 'easeOutCubic',
  animationFrame: 50
}