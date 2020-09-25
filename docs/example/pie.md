# 饼状图

## 基本饼状图

<demo :option="pie1" />

<fold-box>
<<< @/docs/example/exampleData/pie/pie1.js
</fold-box>

## 玫瑰饼状图

<demo :option="pie2" />

<fold-box>
<<< @/docs/example/exampleData/pie/pie2.js
</fold-box>

## 环形饼状图

<demo :option="pie3" />

<fold-box>
<<< @/docs/example/exampleData/pie/pie3.js
</fold-box>

## 多组饼状图

<demo :option="pie4" />

<fold-box>
<<< @/docs/example/exampleData/pie/pie4.js
</fold-box>

<script>
import pie1 from './exampleData/pie/pie1.js'
import pie2 from './exampleData/pie/pie2.js'
import pie3 from './exampleData/pie/pie3.js'
import pie4 from './exampleData/pie/pie4.js'

export default{
  data () {
    return {
      pie1,
      pie2,
      pie3,
      pie4
    }
  }
}
</script>