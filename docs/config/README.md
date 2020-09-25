# 配置项

在这里你可以查看所有的配置项，大部分配置项都具有默认配置，你只需要配置个别属性即可快速生成一个图表。当然，也可以配置出个性化的图表。配合[实例](/example/)你可以更快的掌握它们。

## 样式

图表基于[CRender](http://crender.jiaminghi.com)渲染，在配置项中有关样式的配置都基于其`Style`类，完整配置项可查阅[Class Style](http://crender.jiaminghi.com/guide/style.html)，但并非所有配置项都能生效，因为他们可能会被覆盖。

## 动画

图表数据发生变化时，会伴随动画，配置不同的缓动曲线可以带来不同的动画效果。[Transition](http://transition.jiaminghi.com)为`CRender`提供了动效支持，查看完整缓动曲线表请移步[曲线表](http://transition.jiaminghi.com/curveTable/)。

## 颜色

图表默认配色如下：

<div class="color-container">
  <div
    class="color-item"
    :key="color"
    v-for="color in colors"
    :style="`background-color:${color};`"
  >
    {{ color }}
  </div>
</div>

## 更改默认配置

如果在项目中你需要使用多个图表，并且他们的某些配置相同，那么你可以直接更改这些默认配置，这样就不需要重复的对每一个图表进行相关配置。`Charts`提供了修改默认配置的方法，示例如下

```js
import { changeDefaultConfig } from '@jiaminghi/charts'

/**
 * @description 修改默认配置
 * @param {String} key          想要修改的配置项的key
 * @param {Object|Array} config 你的配置
 * @return {Undefined} 无返回值
 */
changeDefaultConfig('color', ['#000'])
```

key的可选值如下

<div class="key-container">
  <div
    class="key-item"
    :key="key"
    v-for="key in keys"
  >
    {{ key }}
  </div>
</div>

<script>
import { colorConfig as colors } from '../Charts/config/color.js'

import { keys } from '../Charts/config/index.js'

export default {
  data () {
    return {
      colors,
      keys
    }
  }
}
</script>

<style lang="less">
.color-container {
  display: flex;
  flex-wrap: wrap;

  .color-item {
    padding: 5px;
    color: #fff;
    font-weight: bold;
    font-size: 15px;
    margin: 5px;
  }
}

.key-container {
  display: flex;
  flex-wrap: wrap;
  background-color: #282c34;
  border-radius: 6px;

  .key-item {
    color: #7ec699;
    font-size: 15px;
    margin: 10px;
  }
}
</style>