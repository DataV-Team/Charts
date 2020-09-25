# 折线图

## 基本折线图

<demo :option="line1" />

<fold-box>
<<< @/docs/example/exampleData/line/line1.js
</fold-box>

## 光滑折线图

<demo :option="line2" />

<fold-box>
<<< @/docs/example/exampleData/line/line2.js
</fold-box>

## 虚线折线图

<demo :option="line3" />

<fold-box>
<<< @/docs/example/exampleData/line/line3.js
</fold-box>

## 填充折线图

<demo :option="line4" />

<fold-box>
<<< @/docs/example/exampleData/line/line4.js
</fold-box>

## 渐变填充折线图

<demo :option="line5" />

<fold-box>
<<< @/docs/example/exampleData/line/line5.js
</fold-box>

## 数值显示

<demo :option="line6" />

<fold-box>
<<< @/docs/example/exampleData/line/line6.js
</fold-box>

## 球点半径

<demo :option="line7" />

<fold-box>
<<< @/docs/example/exampleData/line/line7.js
</fold-box>

## 边界间隙

<demo :option="line8" />

<fold-box>
<<< @/docs/example/exampleData/line/line8.js
</fold-box>

## 多组折线

<demo :option="line9" />

<fold-box>
<<< @/docs/example/exampleData/line/line9.js
</fold-box>

## 线柱混用

<demo :option="line10" />

<fold-box>
<<< @/docs/example/exampleData/line/line10.js
</fold-box>

<script>
import line1 from './exampleData/line/line1.js'
import line2 from './exampleData/line/line2.js'
import line3 from './exampleData/line/line3.js'
import line4 from './exampleData/line/line4.js'
import line5 from './exampleData/line/line5.js'
import line6 from './exampleData/line/line6.js'
import line7 from './exampleData/line/line7.js'
import line8 from './exampleData/line/line8.js'
import line9 from './exampleData/line/line9.js'
import line10 from './exampleData/line/line10.js'

export default {
  data () {
    return {
      line1,
      line2,
      line3,
      line4,
      line5,
      line6,
      line7,
      line8,
      line9,
      line10
    }
  }
}
</script>