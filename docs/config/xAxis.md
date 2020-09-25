---
sidebarDepth: 2
---

# xAxis

`xAxis`用来配置x坐标轴，它的值可以为对象，也可以为一个数组，为数组时即多个x坐标轴(至多2个)。

## name

```js
/**
 * @description 坐标轴名称
 * @type {String}
 * @default name = ''
 */
```

## show

```js
/**
 * @description 是否展示该坐标轴
 * @type {Boolean}
 * @default show = true
 */
```

## data

```js
/**
 * @description 坐标轴的标签内容
 * x或y坐标轴应至少有一个配置为'value'
 * @type {Array}
 * @default data = null
 * @example data = ['周一', '周二', '周三', ...] | 'value'
 */
```

## position

```js
/**
 * @description 坐标轴位置
 * @type {String}
 * @default position = 'bottom'
 * @example position = 'bottom' | 'top'
 */
```

## nameGap

```js
/**
 * @description 名称与坐标轴间距
 * @type {Number}
 * @default nameGap = 15
 */
```

## nameLocation

```js
/**
 * @description 名称位置
 * @type {String}
 * @default nameLocation = 'end'
 * @example nameLocation = 'end' | 'center' | 'start'
 */
```

## nameTextStyle

```js
/**
 * @description 名称默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
nameTextStyle: {
  fill: '#333',
  fontSize: 10
}
```

## min

```js
/**
 * @description 坐标轴最小值
 * data属性为'value'时才生效
 * @type {String|Number}
 * @default min = '20%'
 * @example min = '20%' | 0
 */
```

## max

```js
/**
 * @description 坐标轴最大值
 * data属性为'value'时才生效
 * @type {String|Number}
 * @default max = '20%'
 * @example max = '20%' | 0
 */
```

## interval

```js
/**
 * @description 数值间距
 * data属性为'value'时才生效
 * @type {Number}
 * @default interval = null
 * @example interval = 100
 */
```

## minInterval

```js
/**
 * @description 最小数值间距
 * data属性为'value'时才生效
 * @type {Number}
 * @default minInterval = null
 * @example minInterval = 1
 */
```

## maxInterval

```js
/**
 * @description 最大数值间距
 * data属性为'value'时才生效
 * @type {Number}
 * @default maxInterval = null
 * @example maxInterval = 100
 */
```

## boundaryGap

```js
/**
 * @description 边界间隔
 * data属性不为'value'时默认为true
 * @type {Boolean}
 * @default boundaryGap = null
 * @example boundaryGap = true
 */
```

## splitNumber

```js
/**
 * @description 坐标轴分割个数
 * @type {Number}
 * @default splitNumber = 5
 */
```

## axisLine

```js
/**
 * @description 坐标轴线配置
 * @type {Object}
 */
```

### axisLine.show

```js
/**
 * @description 是否显示该轴线
 * @type {Boolean}
 * @default show = true
 */
```

### axisLine.style

```js
/**
 * @description 轴线默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  stroke: '#333',
  lineWidth: 1
}
```

## axisTick

```js
/**
 * @description 坐标轴刻度线配置
 * @type {Object}
 */
```

### axisTick.show

```js
/**
 * @description 是否显示刻度线
 * @type {Boolean}
 * @default show = true
 */
```

### axisTick.style

```js
/**
 * @description 刻度线默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  stroke: '#333',
  lineWidth: 1
}
```

## axisLabel

```js
/**
 * @description 坐标轴标签配置
 * @type {Object}
 */
```

### axisLabel.show

```js
/**
 * @description 是否显示坐标轴标签
 * @type {Boolean}
 * @default show = true
 */
```

### axisLabel.formatter

```js
/**
 * @description 标签格式化
 * @type {String|Function}
 * @default formatter = null
 * @example formatter = '{value}件'
 * @example formatter = (dataItem) => (dataItem.value)
 */
```

### axisLabel.style

```js
/**
 * @description 标签默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fill: '#333',
  fontSize: 10,
  rotate: 0
}
```

## splitLine

```js
/**
 * @description 坐标轴分割线配置
 * @type {Object}
 */
```

### splitLine.show

```js
/**
 * @description 是否显示分割线
 * @type {Boolean}
 * @default show = false
 */
```

### splitLine.style

```js
/**
 * @description 分割线默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  stroke: '#d4d4d4',
  lineWidth: 1
}
```

## rLevel

```js
/**
 * @description X坐标轴渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = -20
 */
```

## animationCurve

```js
/**
 * @description X坐标轴缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description X坐标轴缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```