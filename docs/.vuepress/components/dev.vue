<template>
  <div class="dev">
    <canvas
      class="chart"
      ref="chart"
    />
  </div>
</template>

<script>
import CRender from "@jiaminghi/c-render"
import '../../Charts/extend/index.js'

export default {
  name: "Dev",
  data () {
    return {
    }
  },
  methods: {
    async init () {
      const { $refs, randomNum } = this;

      const render = new CRender($refs["chart"])

      const text = render.add({
        name: 'numberText',
        shape: {
          number: [10123123, 32324],
          position: [200, 20],
          content: '{nt}元\n{nt}个',
          formatter (number) {
            const numbers = number.toString().split('').reverse()
            const segs = []

            while (numbers.length) segs.push(numbers.splice(0, 3).join(''))

            return segs.join(',').split('').reverse().join('')
          }
        },
        style: {
          fontSize: 20
        }
      })

      text.animation('shape', {
        number: [0, 0]
      })
    },
    randomNum (minNum, maxNum){ 
      switch(arguments.length){ 
        case 1:
          return parseInt(Math.random() * minNum + 1, 10)
        break
        case 2:
          return parseInt(Math.random() * (maxNum - minNum + 1) + minNum,10)
        break
        default:
            return 0
        break
      }
    }
  },
  async mounted () {
    this.init()
  }
}
</script>

<style lang="less">
.dev {
  height: 500px;
  box-shadow: 0 0 1px #46bd87;

  .chart {
    width: 100%;
    height: 100%;
    background-color: gray;
  }
}
</style>
