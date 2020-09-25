# 柱状图

## 基本柱状图

<demo :option="bar1" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar1.js
</fold-box>

## 梯形柱状图

<demo :option="bar2" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar2.js
</fold-box>

## 渐变柱状图

<demo :option="bar3" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar3.js
</fold-box>

## 同组柱状图

<demo :option="bar4" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar4.js
</fold-box>

## 背景柱状图

<demo :option="bar5" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar5.js
</fold-box>

## 横向柱状图

<demo :option="bar6" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar6.js
</fold-box>

## 系列柱状图

<demo :option="bar7" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar7.js
</fold-box>

## 描边柱状图

<demo :option="bar8" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar8.js
</fold-box>

## 极简柱状图

<demo :option="bar9" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar9.js
</fold-box>

## 柱线混用

<demo :option="bar10" />

<fold-box>
<<< @/docs/example/exampleData/bar/bar10.js
</fold-box>

<script>
import bar1 from './exampleData/bar/bar1.js'
import bar2 from './exampleData/bar/bar2.js'
import bar3 from './exampleData/bar/bar3.js'
import bar4 from './exampleData/bar/bar4.js'
import bar5 from './exampleData/bar/bar5.js'
import bar6 from './exampleData/bar/bar6.js'
import bar7 from './exampleData/bar/bar7.js'
import bar8 from './exampleData/bar/bar8.js'
import bar9 from './exampleData/bar/bar9.js'
import bar10 from './exampleData/bar/bar10.js'

export default {
  data () {
    return {
      bar1,
      bar2,
      bar3,
      bar4,
      bar5,
      bar6,
      bar7,
      bar8,
      bar9,
      bar10
    }
  }
}
</script>