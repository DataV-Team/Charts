---
sidebarDepth: 2
---

# grid

`grid`是配合坐标系工作的，通过配置它，你可以设置坐标系的宽高大小。

## left

```js
/**
 * @description 网格左边距
 * @type {String|Number}
 * @default left = '10%'
 * @example left = '10%' | 10
 */
```

## right

```js
/**
 * @description 网格右边距
 * @type {String|Number}
 * @default right = '10%'
 * @example right = '10%' | 10
 */
```

## top

```js
/**
 * @description 网格上边距
 * @type {String|Number}
 * @default top = 60
 * @example top = '10%' | 60
 */
```

## bottom

```js
/**
 * @description 网格下边距
 * @type {String|Number}
 * @default bottom = 60
 * @example bottom = '10%' | 60
 */
```

## style

```js
/**
 * @description 网格默认样式
 * @type {Object}
 * @default style = {Configuration Of Class Style}
 */
style: {
  fill: 'rgba(0, 0, 0, 0)'
}
```

## rLevel

```js
/**
 * @description 柱状图渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = -30
 */
```

## animationCurve

```js
/**
 * @description 网格缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 网格缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```