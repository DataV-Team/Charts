---
sidebarDepth: 2
---

# legend

`legend`为图表提供图例标签功能，它允许用户隐藏/显示`series`中的某个子图表。

## show

```js
/**
 * @description 是否显示图例标签
 * @type {Boolean}
 * @default show = true
 */
```

## orient

```js
/**
 * @description 图例标签方向
 * @type {String}
 * @default orient = 'horizontal'
 * @example orient = 'horizontal' | 'vertical'
 */
```

## left

```js
/**
 * @description 图例标签左边距
 * 优先级高于right
 * @type {String|Number}
 * @default left = 'auto'
 * @example left = 'auto' | '10%' | 10
 */
```

## right

```js
/**
 * @description 图例标签右边距
 * @type {String|Number}
 * @default right = 'auto'
 * @example right = 'auto' | '10%' | 10
 */
```

## top

```js
/**
 * @description 图例标签上边距
 * 优先级高于bottom
 * @type {String|Number}
 * @default top = 'auto'
 * @example top = 'auto' | '10%' | 10
 */
```

## bottom

```js
/**
 * @description 图例标签下边距
 * @type {String|Number}
 * @default bottom = 'auto'
 * @example bottom = 'auto' | '10%' | 10
 */
```

## itemGap

```js
/**
 * @description 标签间距
 * @type {Number}
 * @default itemGap = 10
 */
```

## iconWidth

```js
/**
 * @description 图例标签图标的宽度
 * @type {Number}
 * @default iconWidth = 25
 */
```

## iconHeight

```js
/**
 * @description 图例标签图标的高度
 * @type {Number}
 * @default iconHeight = 10
 */
```

## selectAble

```js
/**
 * @description 图里标签是否具有选择功能
 * 点击以隐藏/显示对应的series子图表
 * @type {Boolean}
 * @default selectAble = true
 */
```

## data

```js
/**
 * @description 构成图例标签的数据
 * 其子元素可以为String也可以为Object
 * 要想定义图例标签图标颜色或图标形状请使用Object类型
 * @type {Array}
 * @default data = []
 */
```

### data[i] | {String}

```js
/**
 * @description data子元素
 * 应与series子图表的name相对应
 * @type {String}
 * @example data = ['系列A', '系列B']
 */
```

### data[i] | {Object}

```js
/**
 * @description data子元素
 * @type {Object}
 */
```

### data[i].name

```js
/**
 * @description 与series子图表相对应的name值
 * @type {String}
 */
```

### data[i].color

```js
/**
 * @description 用于设置图例标签图标的颜色 (Hex|rgb|rgba)
 * @type {String}
 */
```

### data[i].icon

```js
/**
 * @description 图例标签图标形状
 * @type {String}
 * @example icon = 'rect' | 'line'
 */
```

## textStyle

```js
/**
 * @description 图例标签文字默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
textStyle: {
  fontFamily: 'Arial',
  fontSize: 13,
  fill: '#000'
}
```

## iconStyle

```js
/**
 * @description 图例标签图标默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
iconStyle: {
}
```

## textUnselectedStyle

```js
/**
 * @description 未选择的图例标签文字默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
textUnselectedStyle: {
  fontFamily: 'Arial',
  fontSize: 13,
  fill: '#999'
}
```

## iconUnselectedStyle

```js
/**
 * @description 未选择的图例标签图标默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
iconUnselectedStyle: {
  fill: '#999'
}
```

## rLevel

```js
/**
 * @description 图例标签渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = 20
 */
```

## animationCurve

```js
/**
 * @description 图例标签缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 图例标签缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```