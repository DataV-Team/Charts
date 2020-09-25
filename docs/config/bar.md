---
sidebarDepth: 2
---

# series[i] ({type: 'bar', ...})

将series子元素的`type`属性配置为`bar`，即可使用柱状图。

## show

```js
/**
 * @description 是否显示该柱状图
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

## stack

```js
/**
 * @description 数据堆叠
 * 相同stack的series元素的data值将被叠加（后边的值将被叠加在前边的值上）
 * @type {String}
 * @default name = ''
 */
```

## shapeType

```js
/**
 * @description 柱类型
 * @type {String}
 * @default shapeType = 'normal'
 * @example shapeType = 'normal' | 'leftEchelon' | 'rightEchelon'
 */
```

## echelonOffset

```js
/**
 * @description 梯形柱锐利偏移
 * @type {Number}
 * @default echelonOffset = 10
 */
```

## barWidth

```js
/**
 * @description 柱宽度
 * 此属性应设置于此坐标系中最后一个 'bar' 系列上才会生效
 * 并且是对此坐标系中所有 'bar' 系列生效
 * @type {String|Number}
 * @default barWidth = 'auto'
 * @example barWidth = 'auto' | '10%' | 20
 */
```

## barGap

```js
/**
 * @description 柱间距
 * 此属性应设置于此坐标系中最后一个 'bar' 系列上才会生效
 * 并且是对此坐标系中所有 'bar' 系列生效
 * @type {String|Number}
 * @default barGap = '30%'
 * @example barGap = '30%' | 30
 */
```

## barCategoryGap

```js
/**
 * @description 柱类目间距
 * 此属性应设置于此坐标系中最后一个 'bar' 系列上才会生效
 * 并且是对此坐标系中所有 'bar' 系列生效
 * @type {String|Number}
 * @default barCategoryGap = '20%'
 * @example barCategoryGap = '20%' | 20
 */
```

## xAxisIndex

```js
/**
 * @description 柱状图x坐标系索引
 * @type {Number}
 * @default xAxisIndex = 0
 * @example xAxisIndex = 0 | 1
 */
```

## yAxisIndex

```js
/**
 * @description 柱状图y坐标系索引
 * @type {Number}
 * @default yAxisIndex = 0
 * @example yAxisIndex = 0 | 1
 */
```

## data

```js
/**
 * @description 构成柱状图的数据
 * @type {Array}
 * @default data = []
 * @example data = [100, 200, 300]
 */
```

## backgroundBar

```js
/**
 * @description 背景柱配置
 * @type {Object}
 */
```

### backgroundBar.show

```js
/**
 * @description 是否显示背景柱
 * @type {Boolean}
 * @default show = false
 */
```

### backgroundBar.width

```js
/**
 * @description 背景柱宽度
 * @type {String|Number}
 * @default width = 'auto'
 * @example width = 'auto' | '30%' | 30
 */
```

### backgroundBar.style

```js
/**
 * @description 背景柱默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fill: 'rgba(200, 200, 200, .4)'
}
```

## label

```js
/**
 * @description 柱标签配置
 * @type {Object}
 */
```

### label.show

```js
/**
 * @description 是否显示柱标签
 * @type {Boolean}
 * @default show = false
 */
```

### label.position

```js
/**
 * @description 标签位置
 * @type {String}
 * @default position = 'top'
 * @example position = 'top' | 'center' | 'bottom'
 */
```

### label.offset

```js
/**
 * @description 标签位置偏移
 * @type {Array}
 * @default offset = [0, -10]
 */
```

### label.formatter

```js
/**
 * @description 标签格式化
 * @type {String|Function}
 * @default formatter = null
 * @example formatter = '{value}件'
 * @example formatter = (dataItem) => (dataItem.value)
 */
```

### label.style

```js
/**
 * @description 标签默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fontSize: 10
}
```

## gradient

```js
/**
 * @description 柱渐变配置
 * @type {Object}
 */
```

### gradient.color

```js
/**
 * @description 渐变色 (Hex|rgb|rgba)
 * @type {Array}
 * @default color = []
 */
```

### gradient.local

```js
/**
 * @description 局部渐变
 * @type {Boolean}
 * @default local = true
 */
```

## barStyle

```js
/**
 * @description 柱默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {}
```

## independentColor

```js
/**
 * @description 独立配色模式
 * 设置为true时，可以配置每一个柱的颜色
 * @type {Boolean}
 * @default independentColor = false
 */
```

## independentColors

```js
/**
 * @description 独立配色颜色
 * 仅在启用独立配色模式后生效
 * 默认值与根配置下的color属性相同，用于分别设置每一个柱的颜色
 * 设置二维颜色数组时，将自动应用渐变色独立配色
 * @type {Array}
 * @example independentColor = ['#fff', '#000']
 * @example independentColor = [['#fff', '#000'], '#000']
 */
```

## rLevel

```js
/**
 * @description 柱状图渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = 0
 */
```

## animationCurve

```js
/**
 * @description 柱状图缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 柱状图缓动效果帧数
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
```