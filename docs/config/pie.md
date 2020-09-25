---
sidebarDepth: 2
---

# series[i] ({type: 'pie', ...})

将series子元素的`type`属性配置为`pie`，即可使用饼状图。

## show

```js
/**
 * @description 是否显示该饼状图
 * @type {Boolean}
 * @default show = true
 */
```

## name

```js
/**
 * @description 图例标签名
 * @type {String}
 * @default name = ''
 */
```

## radius

```js
/**
 * @description 饼的半径
 * @type {String|Number}
 * @default radius = '50%'
 * @example radius = '50%' | 100
 */
```

## center

```js
/**
 * @description 饼的中心点
 * @type {Array}
 * @default center = ['50%','50%']
 * @example center = ['50%','50%'] | [100, 100]
 */
```

## startAngle

```js
/**
 * @description 饼状图的起始角度 (弧度值)
 * @type {Number}
 * @default startAngle = -Math.PI / 2
 * @example startAngle = -Math.PI
 */
```

## roseType

```js
/**
 * @description 是否启用玫瑰图模式
 * @type {Boolean}
 * @default roseType = false
 */
```

## roseSort

```js
/**
 * @description 玫瑰图模式下是否启用自动排序
 * @type {Boolean}
 * @default roseSort = true
 */
```

## roseIncrement

```js
/**
 * @description 玫瑰半径递增值
 * @type {String|Number}
 * @default roseIncrement = 'auto'
 * @example roseIncrement = 'auto' | '10%' | 10
 */
```

## data

```js
/**
 * @description 构成饼状图的数据
 * @type {Array}
 * @default data = []
 */
```

### data[i].name

```js
/**
 * @description 构成饼状图的饼的名称
 * @type {String}
 */
```

### data[i].value

```js
/**
 * @description 构成饼状图的饼的值
 * @type {Number}
 */
```

## insideLabel

```js
/**
 * @description 饼状图内部标签配置
 * @type {Object}
 */
```

### insideLabel.show

```js
/**
 * @description 是否显示内部标签
 * @type {Boolean}
 * @default show = false
 */
```

### insideLabel.formatter

```js
/**
 * @description 标签格式化
 * @type {String|Function}
 * @default formatter = '{percent}%'
 * @example formatter = '${name}-{value}-{percent}%'
 * @example formatter = (dataItem) => (dataItem.name)
 */
```

### insideLabel.style

```js
/**
 * @description 标签默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fontSize: 10,
  fill: '#fff',
  textAlign: 'center',
  textBaseline: 'middle'
}
```

## outsideLabel

```js
/**
 * @description 饼状图外部标签配置
 * @type {Object}
 */
```

### outsideLabel.show

```js
/**
 * @description 是否显示外部标签
 * @type {Boolean}
 * @default show = true
 */
```

### outsideLabel.formatter

```js
/**
 * @description 标签格式化
 * @type {String|Function}
 * @default formatter = '{name}'
 * @example formatter = '${name}-{value}-{percent}%'
 * @example formatter = (dataItem) => (dataItem.name)
 */
```

### outsideLabel.style

```js
/**
 * @description 标签默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fontSize: 11,
}
```

### outsideLabel.labelLineBendGap

```js
/**
 * @description 标签线弯曲点与饼状图的间距
 * @type {String|Number}
 * @default labelLineBendGap = '20%'
 * @example labelLineBendGap = '20%' | 20
 */
```

### outsideLabel.labelLineEndLength

```js
/**
 * @description 标签线末端长度
 * @type {Number}
 * @default labelLineEndLength = 50
 */
```

### outsideLabel.labelLineStyle

```js
/**
 * @description 标签线默认配置
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
labelLineStyle: {
  lineWidth: 1
}
```

## pieStyle

```js
/**
 * @description 饼默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
pieStyle: {
}
```

## percentToFixed

```js
/**
 * @description 百分比小数部分精度
 * @type {Number}
 * @default percentToFixed = 0
 */
```

## rLevel

```js
/**
 * @description 饼状图渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = 10
 */
```

## animationDelayGap

```js
/**
 * @description 动画延迟间距
 * @type {Number}
 * @default animationDelayGap = 60
 */
```

## animationCurve

```js
/**
 * @description 饼状图缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## startAnimationCurve

```js
/**
 * @description 饼状图起始缓动曲线
 * @type {String}
 * @default startAnimationCurve = 'easeOutBack'
 */
```

## animationFrame

```js
/**
 * @description 饼状图缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```