---
sidebarDepth: 2
---

# series[i] ({type: 'line', ...})

将series子元素的`type`属性配置为`line`，即可使用折线图。

## show

```js
/**
 * @description 是否显示该折线图
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

## smooth

```js
/**
 * @description 光滑折线
 * @type {Boolean}
 * @default smooth = false
 */
```

## xAxisIndex

```js
/**
 * @description 折线图x坐标系索引
 * @type {Number}
 * @default xAxisIndex = 0
 * @example xAxisIndex = 0 | 1
 */
```

## yAxisIndex

```js
/**
 * @description 折线图y坐标系索引
 * @type {Number}
 * @default yAxisIndex = 0
 * @example yAxisIndex = 0 | 1
 */
```

## data

```js
/**
 * @description 构成折线图的数据
 * @type {Array}
 * @default data = []
 * @example data = [100, 200, 300]
 */
```

## lineStyle

```js
/**
 * @description 折线默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
lineStyle: {
  lineWidth: 1
}
```

## linePoint

```js
/**
 * @description 折线点配置
 * @type {Object}
 */
```

### linePoint.show

```js
/**
 * @description 是否显示该折线点
 * @type {Boolean}
 * @default show = true
 */
```

### linePoint.radius

```js
/**
 * @description 折线点半径
 * @type {Number}
 * @default radius = 2
 */
```

### linePoint.style

```js
/**
 * @description 折线点默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fill: '#fff',
  lineWidth: 1
}
```

## lineArea

```js
/**
 * @description 折线区域配置
 * @type {Object}
 */
```

### lineArea.show

```js
/**
 * @description 是否显示折线区域
 * @type {Boolean}
 * @default show = false
 */
```

### lineArea.gradient

```js
/**
 * @description 折线区域渐变色 (Hex|rgb|rgba)
 * @type {Array}
 * @default gradient = []
 */
```

### lineArea.style

```js
/**
 * @description 折线区域默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  opacity: 0.5
}
```

## label

```js
/**
 * @description 折线标签配置
 * @type {Object}
 */
```

### label.show

```js
/**
 * @description 是否显示折线标签
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

## rLevel

```js
/**
 * @description 折线图渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = 10
 */
```

## animationCurve

```js
/**
 * @description 折线图缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 折线图缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```