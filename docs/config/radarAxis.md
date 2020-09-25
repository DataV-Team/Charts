---
sidebarDepth: 2
---

# radar

::: tip TIP
`radar`为雷达图提供坐标系支持，如果需要使用雷达图，则需要该配置。
:::

## show

```js
/**
 * @description 是否显示该雷达图坐标系
 * @type {Boolean}
 * @default show = true
 */
```

## center

```js
/**
 * @description 坐标系中心点
 * @type {Array}
 * @default center = ['50%','50%']
 * @example center = ['50%','50%'] | [100, 100]
 */
```

## radius

```js
/**
 * @description 坐标系半径
 * @type {String|Number}
 * @default radius = '65%'
 * @example radius = '65%' | 100
 */
```

## startAngle

```js
/**
 * @description 坐标系起始角度 (弧度值)
 * @type {Number}
 * @default startAngle = -Math.PI / 2
 * @example startAngle = -Math.PI
 */
```

## splitNum

```js
/**
 * @description 坐标系分隔数目
 * @type {Number}
 * @default splitNum = 5
 */
```

## polygon

```js
/**
 * @description 是否启用多边形坐标系
 * @type {Boolean}
 * @default polygon = false
 */
```

## indicator

```js
/**
 * @description 坐标系指示符
 * @type {Array}
 */
```

### indicator[i].name

```js
/**
 * @description 指示符标签名
 * @type {String}
 * @example name = 'itemA'
 */
```

### indicator[i].min

```js
/**
 * @description 指示符最小值
 * @type {Number}
 * @default min = 0
 */
```

### indicator[i].max

```js
/**
 * @description 指示符最大值
 * @type {Number}
 * @default max = Undefined
 */
```

## axisLabel

```js
/**
 * @description 坐标系标签配置
 * @type {Object}
 */
```

### axisLabel.show

```js
/**
 * @description 是否显示标签
 * @type {Boolean}
 * @default show = true
 */
```

### axisLabel.labelGap

```js
/**
 * @description 标签与坐标系间的间距
 * @type {Number}
 * @default labelGap = 15
 */
```

### axisLabel.color

```js
/**
 * @description 标签颜色 (Hex|rgb|rgba), 将覆盖style.fill
 * @type {Array}
 * @default color = []
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
  fill: '#333'
}
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
 * @description 是否显示坐标轴线
 * @type {Boolean}
 * @default show = true
 */
```

### axisLine.color

```js
/**
 * @description 轴线颜色 (Hex|rgb|rgba), 将覆盖style.stroke
 * @type {Array}
 * @default color = []
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
  stroke: '#999',
  lineWidth: 1
}
```

## splitLine

```js
/**
 * @description 坐标系分隔线配置
 * @type {Object}
 */
```

### splitLine.show

```js
/**
 * @description 是否显示分割线
 * @type {Boolean}
 * @default show = true
 */
```

### splitLine.color

```js
/**
 * @description 分割线颜色 (Hex|rgb|rgba), 将覆盖 style.stroke
 * @type {Array}
 * @default color = []
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

## splitArea

```js
/**
 * @description 坐标系分隔区配置
 * @type {Object}
 */
```

### splitArea.show

```js
/**
 * @description 是否显示分隔区
 * @type {Boolean}
 * @default show = false
 */
```

### splitArea.color

```js
/**
 * @description 分隔区颜色 (Hex|rgb|rgba), 将覆盖 style.stroke
 * @type {Array}
 * @default color = []
 */
```

### splitArea.style

```js
/**
 * @description 分隔区默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
```

## rLevel

```js
/**
 * @description 雷达图坐标系渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = -10
 */
```

## animationCurve

```js
/**
 * @description 雷达图坐标系缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 雷达图坐标系缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```