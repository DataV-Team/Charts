# 雷达图

## 基本雷达图

<demo :option="radar1" />

<fold-box>
<<< @/docs/example/exampleData/radar/radar1.js
</fold-box>

## 多边形雷达图

<demo :option="radar2" />

<fold-box>
<<< @/docs/example/exampleData/radar/radar2.js
</fold-box>

## 多组雷达图

<demo :option="radar3" />

<fold-box>
<<< @/docs/example/exampleData/radar/radar3.js
</fold-box>

## 背景配色

<demo :option="radar4" />

<fold-box>
<<< @/docs/example/exampleData/radar/radar4.js
</fold-box>

## 多背景配色

<demo :option="radar5" />

<fold-box>
<<< @/docs/example/exampleData/radar/radar5.js
</fold-box>

## 层叠背景配色

<demo :option="radar6" />

<fold-box>
<<< @/docs/example/exampleData/radar/radar6.js
</fold-box>

<script>
import radar1 from './exampleData/radar/radar1.js'
import radar2 from './exampleData/radar/radar2.js'
import radar3 from './exampleData/radar/radar3.js'
import radar4 from './exampleData/radar/radar4.js'
import radar5 from './exampleData/radar/radar5.js'
import radar6 from './exampleData/radar/radar6.js'

export default{
  data () {
    return {
      radar1,
      radar2,
      radar3,
      radar4,
      radar5,
      radar6
    }
  }
}
</script>