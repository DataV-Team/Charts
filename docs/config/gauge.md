---
sidebarDepth: 2
---

# series[i] ({type: 'gauge', ...})

将series子元素的`type`属性配置为`gauge`，即可使用仪表盘。

## show

```js
/**
 * @description 是否显示该仪表盘
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

## center

```js
/**
 * @description 仪表盘中心点
 * @type {Array}
 * @default center = ['50%','50%']
 * @example center = ['50%','50%'] | [100, 100]
 */
```

## radius

```js
/**
 * @description 仪表盘半径
 * @type {String|Number}
 * @default radius = '60%'
 * @example radius = '60%' | 100
 */
```

## startAngle

```js
/**
 * @description 仪表盘起始角度（弧度值）
 * @type {Number}
 * @default startAngle = -(Math.PI / 4) * 5
 * @example startAngle = -Math.PI
 */
```

## endAngle

```js
/**
 * @description 仪表盘结束角度（弧度值）
 * @type {Number}
 * @default endAngle = Math.PI / 4
 * @example endAngle = 0
 */
```

## min

```js
/**
 * @description 仪表盘最小值
 * @type {Number}
 * @default min = 0
 */
```

## max

```js
/**
 * @description 仪表盘最大值
 * @type {Number}
 * @default max = 100
 */
```

## splitNum

```js
/**
 * @description 仪表盘分隔数目
 * @type {Number}
 * @default splitNum = 5
 */
```

## arcLineWidth

```js
/**
 * @description 仪表盘圆弧线条宽度
 * @type {Number}
 * @default arcLineWidth = 15
 */
```

## dataItemStyle

```js
/**
 * @description Data元素构成的圆弧的默认样式
 * @type {Object}
 * @default dataItemStyle = {Class Style的配置项}
 */
```

## data

```js
/**
 * @description 构成仪表盘的圆弧的数据
 * @type {Array}
 * @default data = []
 */
```

### data[i].name

```js
/**
 * @description 构成仪表盘的圆弧的名称
 * @type {Number}
 * @example name = 'name'
 */
```

### data[i].value

```js
/**
 * @description 构成仪表盘的圆弧的值
 * @type {Number}
 * @example value = 66
 */
```

### data[i].radius

```js
/**
 * @description 构成仪表盘的圆弧的半径 (默认与根属性radius的值相同)
 * @type {String|Number}
 * @example radius = '50%' | 150
 */
```

### data[i].lineWidth

```js
/**
 * @description 构成仪表盘的圆弧的线条宽度 (默认与根属性arcLineWidth的值相)
 * @type {Number}
 * @example lineWidth = 10
 */
```

### data[i].gradient

```js
/**
 * @description 构成仪表盘的圆弧的渐变色 (Hex|rgb|rgba)
 * @type {Array}
 * @example gradient = ['#000', 'rgb(10, 10, 10)', 'rgba(10, 10, 10, 1)']
 */
```

### data[i].localGradient

```js
/**
 * @description 渐变色是否应用局部渐变
 * @type {Boolean}
 * @default localGradient = false
 */
```

## axisTick

```js
/**
 * @description 坐标刻度配置项
 * @type {Object}
 */
```

### axisTick.show

```js
/**
 * @description 是否显示刻度
 * @type {Boolean}
 * @default show = true
 */
```

### axisTick.tickLength

```js
/**
 * @description 刻度线长度
 * @type {Number}
 * @default tickLength = 6
 */
```

### axisTick.style

```js
/**
 * @description 刻度线样式
 * @type {Object} {Class Style的配置项}
 */
axisTick.stype: {
  stroke: '#999',
  lineWidth: 1
}
```

## axisLabel

```js
/**
 * @description 坐标标签配置项
 * @type {Object}
 */
```

### axisLabel.show

```js
/**
 * @description 是否显示坐标标签
 * @type {Boolean}
 * @default show = true
 */
```

### axisLabel.data

```js
/**
 * @description 坐标标签的内容数据（可以自动计算）
 * @type {Array}
 * @default data = ['10', '20', ...]
 */
```

### axisLabel.formatter

```js
/**
 * @description 坐标标签内容格式
 * @type {String|Function}
 * @default formatter = null
 * @example formatter = '{value}%'
 * @example formatter = (labelItem) => (labelItem.value)
 */
```

### axisLabel.labelGap

```js
/**
 * @description 坐标标签与刻度线间的间隔
 * @type {String|Function}
 * @default labelGap = 5
 */
```

### axisLabel.style

```js
/**
 * @description 坐标标签样式
 * @type {Object}
 * @default style = {Configuration Of Class Style}
 */
```

## pointer

```js
/**
 * @description 仪表盘指针配置项
 * @type {Object}
 */
```

### pointer.show

```js
/**
 * @description 是否显示指针
 * @type {Boolean}
 * @default show = true
 */
```

### pointer.valueIndex

```js
/**
 * @description 指针从data中获取值的索引
 * @type {Number}
 * @default valueIndex = 0 (pointer.value = data[0].value)
 */
```

### pointer.style

```js
/**
 * @description 指针样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
pointer.style: {
  // 可以调节scale的值放大缩小指针
  scale: [1, 1],
  fill: '#fb7293'
}
```

## details

```js
/**
 * @description Data子元素构成的圆弧的详情的配置项
 * @type {Object}
 */
```

### details.show

```js
/**
 * @description 是否显示详情
 * @type {Boolean}
 * @default show = false
 */
```

### details.formatter

```js
/**
 * @description 详情内容格式化
 * @type {String|Function}
 * @default formatter = null
 * @example formatter = '{value}%'
 * @example formatter = '{name}%'
 * @example formatter = (dataItem) => (dataItem.value)
 */
```

### details.offset

```js
/**
 * @description 详情内容位置偏移量
 * @type {Array}
 * @default offset = [0, 0]
 * @example offset = [10, 10]
 */
```

### details.valueToFixed

```js
/**
 * @description 数值小数精度
 * @type {Number}
 * @default valueToFixed = 0
 */
```

### details.position

```js
/**
 * @description 详情位置
 * @type {String}
 * @default position = 'center'
 * @example position = 'start' | 'center' | 'end'
 */
```

### details.style

```js
/**
 * @description 详情样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  textBaseline: 'middle'
}
```

## backgroundArc

```js
/**
 * @description 仪表盘背景圆弧配置
 * @type {Object}
 */
```

### backgroundArc.show

```js
/**
 * @description 是否显示背景环
 * @type {Boolean}
 * @default show = true
 */
```

### backgroundArc.style

```js
/**
 * @description 背景环样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
```

## rLevel

```js
/**
 * @description 仪表盘渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = 10
 */
```

## animationCurve

```js
/**
 * @description 仪表盘缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 仪表盘缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```