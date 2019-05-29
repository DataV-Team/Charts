const xAxisConfig = {
  name: '',
  show: true,
  position: 'bottom',
  nameGap: 15,
  nameLocation: 'end',
  nameTextStyle: {
    fill: '#333',
    fontSize: 10
  },
  min: '20%',
  max: '20%',
  interval: null,
  minInterval: null,
  maxInterval: null,
  boundaryGap: null,
  splitNumber: 5,
  axisLine: {
    show: true,
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },
  axisTick: {
    show: true,
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },
  axisLabel: {
    show: true,
    formatter: null,
    style: {
      fill: '#333',
      fontSize: 10,
      rotate: 0
    }
  },
  splitLine: {
    show: false,
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1
    }
  },
  animationCurve: 'easeOutCubic',
  animationFrame: 30
}

const yAxisConfig = {
  name: '',
  show: true,
  position: 'left',
  nameGap: 15,
  nameLocation: 'end',
  nameTextStyle: {
    fill: '#333',
    fontSize: 10
  },
  min: '20%',
  max: '20%',
  interval: null,
  minInterval: null,
  maxInterval: null,
  boundaryGap: null,
  splitNumber: 5,
  axisLine: {
    show: true,
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },
  axisTick: {
    show: true,
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },
  axisLabel: {
    show: true,
    formatter: null,
    style: {
      fill: '#333',
      fontSize: 10,
      rotate: 0
    }
  },
  splitLine: {
    show: true,
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1
    }
  },
  animationCurve: 'easeOutCubic',
  animationFrame: 30
}

export const axisConfig = {
  xAxisConfig,
  yAxisConfig
}