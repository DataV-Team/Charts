# 实例

这里将提供一些具体的实例，在构建图表前，应确保图表容器节点已在页面中完成渲染，否则这可能导致异常。

::: tip TIP
点击示例可以切换图表数据，以便于观察动画效果。
:::

## 实例化

```js
import Charts from '@jiaminghi/charts'

const container = document.getElementById('container')

const myChart = new Charts(container)
```

## 实例方法

目前仅有两个实例方法，分别用于设置图表配置和重置图表大小。

### setOption

```js
/**
 * @description 设置图表配置
 * @param {Object} option 图表配置
 * @param {Boolean} animationEnd 执行animationEnd
 * @return {Undefined} 无返回值
 */
Charts.prototype.setOption = function (option, animationEnd = false) {
  //...
}
```

::: tip TIP
尽量避免频繁更新图表状态（时间间隔小于3s），频繁更新时建议`animationEnd`配置为`true`，强制清空图表动画队列，避免频繁更新图表状态时动画池体积持续增长（绘制速度低于新增速度，造成堆积），导致内存泄露。
:::

### resize

```js
/**
 * @description 重置图表大小
 * @return {Undefined} 无返回值
 */
Charts.prototype.resize = function () {
  //...
}
```

<script>

export default{
  data () {
    return {
    }
  }
}
</script>