import React, { useRef, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom'
import './dev.less'
import Charts from './src'
import './dev.less'

const Dev: React.FC = () => {
  const chartEle = useRef<HTMLDivElement>(null)

  const renderTest = useCallback(() => {
    const chart = new Charts(chartEle.current!)

    chart.setOption({
      // title: {
      //   text: '周销售额趋势',
      // },
      xAxis: {
        name: '第一周',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
      yAxis: {
        name: '销售额',
        data: 'value',
      },
      series: [
        {
          type: 'bar',
          data: [1200, 2230, 1900, 2100, 3500, 4200, 3985],
        },
      ],
    })

    setTimeout(() => {
      chart.setOption({
        // title: {
        //   text: '周销售额趋势',
        // },
        xAxis: {
          name: '第一周',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        },
        yAxis: {
          name: '销售额',
          data: 'value',
        },
        series: [
          {
            type: 'bar',
            shapeType: 'leftEchelon',
            data: [3100, 2230, 1900, 2100, 3500, 4200, 3985],
          },
        ],
      })
    }, 3000);

    console.warn(chart)
  }, [])

  useEffect(() => {
    renderTest()
  }, [renderTest])

  return <div className="chart" ref={chartEle} />
}

ReactDOM.render(<Dev />, document.getElementById('root'))

export default null
