# 仪表盘

## 基本仪表盘

<demo :option="gauge1" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge1.js
</fold-box>

## 详情仪表盘

<demo :option="gauge2" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge2.js
</fold-box>

## 渐变仪表盘

<demo :option="gauge3" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge3.js
</fold-box>

## 多组仪表盘

<demo :option="gauge4" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge4.js
</fold-box>

## 局部渐变

<demo :option="gauge5" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge5.js
</fold-box>

## 百分比环

<demo :option="gauge6" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge6.js
</fold-box>

## 多同心百分比环

<demo :option="gauge7" />

<fold-box>
<<< @/docs/example/exampleData/gauge/gauge7.js
</fold-box>

<script>
import gauge1 from './exampleData/gauge/gauge1.js'
import gauge2 from './exampleData/gauge/gauge2.js'
import gauge3 from './exampleData/gauge/gauge3.js'
import gauge4 from './exampleData/gauge/gauge4.js'
import gauge5 from './exampleData/gauge/gauge5.js'
import gauge6 from './exampleData/gauge/gauge6.js'
import gauge7 from './exampleData/gauge/gauge7.js'

export default {
  data () {
    return {
      gauge1,
      gauge2,
      gauge3,
      gauge4,
      gauge5,
      gauge6,
      gauge7
    }
  }
}
</script>