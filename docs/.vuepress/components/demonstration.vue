<template>
  <div
    title="点击以重新播放演示"
    id="demonstration"
    ref="demonstration"
    @click="start"
  />
</template>

<script>
import Charts from '../../Charts'

export default {
  name: 'demonstration',
  data () {
    return {
      chart: null,
      render: null,

      graphs: [],

      running: false,

      options: [
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            boundaryGap: false
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'line'
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第二周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'line',
              lineArea: {
                show: true,
                gradient: ['rgba(55, 162, 218, 0.6)', 'rgba(55, 162, 218, 0)']
              }
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'line',
              stack: 'a',
              fill: {
                show: true
              }
            },
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'line',
              stack: 'a',
              smooth: true
            },
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'line',
              stack: 'a',
              lineStyle: {
                lineDash: [5, 5]
              }
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: [
            {
              name: '销售额',
              data: 'value'
            },
            {
              name: '人流量',
              data: 'value',
              position: 'right',
              max: 2000,
              splitLine: {
                show: false
              }
            }
          ],
          series: [
            {
              data: [1000, 1200, 900, 1500, 900, 1200, 1000],
              type: 'line',
              smooth: true,
              lineArea: {
                show: true,
                gradient: ['rgba(251, 114, 147, 1)', 'rgba(251, 114, 147, 0)']
              },
              lineStyle: {
                stroke: 'rgba(251, 114, 147, 1)',
                lineDash: [3, 3]
              },
              linePoint: {
                style: {
                  stroke: 'rgba(251, 114, 147, 1)'
                }
              },
              yAxisIndex: 1
            },
            {
              data: [1500, 1700, 1400, 2000, 1400, 1700, 1500],
              type: 'bar',
              gradient: {
                color: ['rgba(103, 224, 227, .6)', 'rgba(103, 224, 227, .1)']
              },
              barStyle: {
                stroke: 'rgba(103, 224, 227, 1)'
              },
              animationCurve: 'easeOutBack'
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'bar',
              gradient: {
                color: ['rgba(251, 114, 147, .6)', 'rgba(251, 114, 147, .1)']
              },
              barStyle: {
                stroke: '#fb7293'
              }
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              type: 'bar',
              gradient: {
                color: ['rgba(251, 114, 147, .6)', 'rgba(251, 114, 147, .1)']
              },
              barStyle: {
                stroke: '#fb7293'
              }
            },
            {
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985].reverse(),
              type: 'bar',
              gradient: {
                color: ['rgba(150, 191, 255, .6)', 'rgba(150, 191, 255, .1)']
              },
              barStyle: {
                stroke: '#96bfff'
              }
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '销售额',
            data: 'value'
          },
          yAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          series: [
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              shapeType: 'leftEchelon',
              gradient: {
                color: ['rgba(251, 114, 147, .6)', 'rgba(251, 114, 147, .1)']
              },
              barStyle: {
                stroke: '#fb7293'
              }
            },
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985].reverse(),
              shapeType: 'rightEchelon',
              gradient: {
                color: ['rgba(150, 191, 255, .6)', 'rgba(150, 191, 255, .1)']
              },
              barStyle: {
                stroke: '#96bfff'
              }
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              gradient: {
                color: ['rgba(251, 114, 147, .6)', 'rgba(251, 114, 147, .1)']
              },
              barStyle: {
                stroke: '#fb7293'
              },
              stack: 'a'
            },
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985].reverse(),
              gradient: {
                color: ['rgba(150, 191, 255, .6)', 'rgba(150, 191, 255, .1)']
              },
              barStyle: {
                stroke: '#96bfff'
              },
              stack: 'a'
            }
          ]
        },
        {
          title: {
            text: '周销售额趋势'
          },
          xAxis: {
            name: '第一周',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            name: '销售额',
            data: 'value'
          },
          series: [
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              gradient: {
                color: ['rgba(251, 114, 147, .6)', 'rgba(251, 114, 147, .1)']
              },
              barStyle: {
                stroke: '#fb7293'
              },
              stack: 'a'
            },
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985].reverse(),
              gradient: {
                color: ['rgba(150, 191, 255, .6)', 'rgba(150, 191, 255, .1)']
              },
              barStyle: {
                stroke: '#96bfff'
              },
              stack: 'a'
            },
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985].reverse(),
              gradient: {
                color: ['rgba(150, 191, 255, .6)', 'rgba(150, 191, 255, .1)']
              },
              barStyle: {
                stroke: '#96bfff'
              },
            }
          ]
        },
        {
          grid: {
            left: 20,
            right: 20,
            top: '5%',
            bottom: '5%'
          },
          xAxis: {
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          yAxis: {
            data: 'value',
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            splitLine: {
              show: false,
              style: {
                lineDash: [10, 0]
              }
            }
          },
          series: [
            {
              type: 'bar',
              data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
              label: {
                show: true,
                position: 'center',
                offset: [0, 0],
                style: {
                  fill: '#fff'
                }
              },
              backgroundBar: {
                show: true
              },
              gradient: {
                color: ['#37a2da', '#67e0e3']
              },
              animationCurve: 'easeOutBounce'
            }
          ]
        },
        {
          xAxis: {
            data: [
            '一月份', '二月份', '三月份', '四月份', '五月份', '六月份',
            '七月份', '八月份', '九月份', '十月份', '十一月份', '十二月份'
            ],
            axisLabel: {
              style: {
                rotate: 20,
                textAlign: 'left',
                textBaseline: 'top'
              }
            },
            axisTick: {
              // show: false
            }
          },
          yAxis: [
            {
              name: '降雨量',
              data: 'value',
              min: 0,
              max: 300,
              interval: 50,
              splitLine: {
                style: {
                  lineDash: [3,3]
                }
              },
              axisLabel: {
                formatter: '{value} ml'
              },
              axisTick: {
                show: false
              }
            },
            {
              name: '气温',
              data: 'value',
              position: 'right',
              min: 0,
              max: 30,
              interval: 5,
              splitLine: {
                show: false
              },
              axisLabel: {
                formatter: '{value} °C',
              },
              axisTick: {
                show: false
              }
            }
          ],
          series: [
            {
              data: [
                175, 125, 90, 130, 45, 65,
                65, 47, 50, 52, 45, 37
              ],
              type: 'bar',
              gradient: {
                color: ['#37a2da', '#67e0e3']
              },
              animationCurve: 'easeOutBounce'
            },
            {
              data: [
                23, 18, 16, 14, 10, 8,
                6, 6, 6, 6, 6, 5
              ],
              type: 'line',
              yAxisIndex: 1,
              animationCurve: 'easeOutBounce'
            }
          ]
        },
        {
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
                  }
              }
          ]
        },
        {
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
        },
        {
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
                  radius: '30%',
                  outsideLabel: {
                      show: false
                  },
                  insideLabel: {
                      show: true
                  }
              },
              {
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
        },
        {
          radar: {
            indicator: [
              { name: '西峡', max: 300 },
              { name: '周口', max: 300 },
              { name: '南阳', max: 300 },
              { name: '驻马店', max: 300 },
              { name: '郑州', max: 300 },
              { name: '洛阳', max: 300 }
            ],
            splitArea: {
              show: true,
            }
          },
          series: [
            {
              type: 'radar',
              data: [111, 256, 178, 152, 266, 132],
              label: {
                show: false
              },
              animationCurve: 'easeOutBounce'
            },
            {
              type: 'radar',
              data: [222, 245, 220, 130, 240, 100],
              label: {
                show: false
              },
              animationCurve: 'easeOutBounce'
            }
          ]
        },
        {
          radar: {
            polygon: true,
            indicator: [
              { name: '西峡', max: 300 },
              { name: '周口', max: 300 },
              { name: '南阳', max: 300 },
              { name: '驻马店', max: 300 },
              { name: '郑州', max: 300 },
              { name: '洛阳', max: 300 }
            ],
            splitArea: {
              show: true,
              color: ['rgba(159, 230, 184, .2)']
            }
          },
          series: [
            {
              type: 'radar',
              data: [223, 189, 214, 265, 178, 155],
              label: {
                show: false
              },
              animationCurve: 'easeOutBounce'
            },
            {
              type: 'radar',
              data: [116, 256, 280, 244, 240, 255],
              label: {
                show: false
              },
              animationCurve: 'easeOutBounce'
            }
          ]
        },
        {
          radar: {
            indicator: [
              { name: '西峡', max: 300 },
              { name: '周口', max: 300 },
              { name: '南阳', max: 300 },
              { name: '驻马店', max: 300 },
              { name: '郑州', max: 300 },
              { name: '洛阳', max: 300 }
            ],
            polygon: true,
            axisLine: {
              style: {
                stroke: 'rgba(251, 114, 147, .3)'
              }
            },
            splitLine: {
              style: {
                stroke: 'rgba(251, 114, 147, .5)',
                fill: 'rgba(251, 114, 147, .2)'
              }
            }
          },
          series: [
            {
              type: 'radar',
              data: [111, 256, 178, 152, 266, 132],
              label: {
                show: false
              },
              animationCurve: 'easeInOutBack'
            }
          ]
        },
        {
          title: {
            text: '剩余油量表'
          },
          series: [
            {
              type: 'gauge',
              data: [ { name: 'itemA', value: 55 } ],
              axisLabel: {
                formatter: '{value}%'
              },
              animationCurve: 'easeInOutBack'
            }
          ]
        },
        {
          title: {
            text: '剩余油量表2'
          },
          series: [
            {
              type: 'gauge',
              data: [
                { name: 'itemA', value: 88, gradient: ['#e7bcf3', '#e690d1', '#fb7293'] }
              ],
              axisLabel: {
                formatter: '{value}%'
              },
              details: {
                show: true,
                offset: [0, 40],
                formatter: '剩余{value}%'
              },
              animationCurve: 'easeOutBounce'
            }
          ]
        },
        {
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
        },
        {
          series: [
            {
              type: 'gauge',
              startAngle: -Math.PI / 2,
              endAngle: Math.PI * 1.5,
              arcLineWidth: 25,
              data: [
                { name: 'itemA', value: 65, gradient: ['#03c2fd', '#1ed3e5', '#2fded6'] }
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
              details: {
                show: true,
                formatter: '{value}%',
                style: {
                    fill: '#1ed3e5',
                    fontSize: 35
                }
              }
            }
          ]
        },
        {
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
      ]
    }
  },
  methods: {
    init () {
      const { initInstance, initGraphs } = this

      initInstance()

      initGraphs()
    },
    initInstance () {
      const { $refs, graphs } = this

      this.chart = new Charts($refs['demonstration'])

      this.render = this.chart.render
    },
    initGraphs () {
      const { render, graphs } = this

      const [w, h] = render.area

      const text1 = render.add({
        name: 'text',
        animationCurve: 'easeOutBack',
        shape: {
          content: 'Charts',
          position: [w / 2, h / 2 - 30]
        },
        style: {
          opacity: 0,
          fontSize: 100,
          fontWeight: 'bold',
          fill: '#66d8ed',
          shadowBlur: 10,
          shadowColor: 'rgba(70, 189, 135, .4)'
        }
      })

      const line = render.add({
        name: 'polyline',
        animationCurve: 'easeOutBounce',
        shape: {
          points: [
            [w / 2, h / 2 + 15],
            [w / 2, h / 2 + 15]
          ]
        },
        style: {
          lineWidth: 5,
          stroke: '#67e0e3'
        }
      })

      const text2 = render.add({
        name: 'text',
        animationCurve: 'easeOutBack',
        shape: {
          content: 'npm install @jiaminghi/charts',
          position: [w / 2, h / 2 + 100]
        },
        style: {
          opacity: 0,
          fontSize: 40,
          fontWeight: 'bold',
          fill: '#66d8ed',
          shadowBlur: 10,
          shadowColor: 'rgba(70, 189, 135, .4)'
        }
      })      

      graphs.push(text1, line, text2)
    },
    async start () {
      const { chart, render, options, delay, running } = this

      const { hideGraphs, showGraphs } = this

      if (running) return

      this.running = true

      hideGraphs()

      const optionNum = options.length

      for (let i = 0; i < optionNum; i++) {
        chart.setOption(options[i])

        await delay(700)
      }

      chart.setOption({})

      showGraphs()

      this.running = false
    },
    hideGraphs () {
      const [text1, line, text2] = this.graphs

      const [w, h] = this.render.area

      text1.animation('style', {
        opacity: 0,
      }, true)

      text1.animation('shape', {
        position: [w / 2, h / 2 - 60],
      }, true)

      line.animation('shape', {
        points: [
          [w / 2, h / 2 + 15],
          [w / 2, h / 2 + 15]
        ]
      }, true)

      text2.animation('style', {
        opacity: 0,
      }, true)

      text2.animation('shape', {
        position: [w / 2, h / 2 + 100],
      })
    },
    showGraphs () {
      const [text1, line, text2] = this.graphs

      const [w, h] = this.render.area

      text1.animation('style', {
        opacity: 1,
      }, true)

      text1.animation('shape', {
        position: [w / 2, h / 2 - 30],
      }, true)

      line.animation('shape', {
        points: [
          [w / 2 - 300, h / 2 + 15],
          [w / 2 + 300, h / 2 + 15]
        ]
      }, true)

      text2.animation('style', {
        opacity: 1,
      }, true)

      text2.animation('shape', {
        position: [w / 2, h / 2 + 50],
      })
    },
    delay (time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }
  },
  async mounted () {
    const { init, start } = this

    init()

    await this.delay(200)

    start()
  }
}
</script>

<style lang="less">
#demonstration {
  width: 100%;
  height: 500px;
  box-shadow: 0 0 3px #46bd87;
  cursor: pointer;
}
</style>
