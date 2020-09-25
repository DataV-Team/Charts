<template>
  <div class="demo">
    <div class="chart" ref="chart" />
    <div class="action">
      <div class="btn blue" @click="setOption">切换数据</div>
      <div class="btn green" @click="init(true)">重置</div>
    </div>
  </div>
</template>

<script>
import Charts from "../../Charts/index.js"

export default {
  name: "Demo",
  props: ['option', 'debug'],
  data () {
    return {
      myChart: null,
      optionIndex: 0
    }
  },
  methods: {
    async init (reInit = false) {
      const { $refs, setOption } = this

      const container = $refs["chart"]

      if (reInit) container.innerHTML = ''

      await this.$nextTick()

      this.myChart = new Charts(container)

      setOption()
    },
    setOption () {
      const { myChart, optionIndex, option, debug } = this

      myChart.setOption(option[optionIndex])

      const optionNum = option.length

      this.optionIndex++

      if (optionIndex + 1 >= optionNum) this.optionIndex = 0

      if (debug) console.warn(myChart)
    }
  },
  async mounted () {
    this.init()
  }
}
</script>

<style lang="less">
.demo {
  height: 500px;
  box-shadow: 0 0 1px #46bd87;
  position: relative;

  .chart {
    width: 100%;
    height: 100%;
  }

  &:hover .action {
    opacity: 1;
  }

  .action {
    position: absolute;
    right: 0px;
    bottom: 0px;
    opacity: 0;
    transition: all 0.3s;
    display: flex;

    .btn {
      color: #fff;
      text-align: center;
      cursor: pointer;
      font-size: 15px;
      padding: 3px 20px;
      box-shadow: 0 0 3px #999;

      &.green {
        background-color: #46bd87;
      }

      &.blue {
        background-color: #37a2da;
      }

      &.green:active {
        color: #46bd87;
      }

      &.blue:active {
        color: #37a2da;
      }
    }
  }
}
</style>
