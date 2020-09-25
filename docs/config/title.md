---
sidebarDepth: 2
---

# title

`title`用来显示图表的标题，你可以配置该项来设置其位置和样式。

## show

```js
/**
 * @description 是否显示标题
 * @type {Boolean}
 * @default show = true
 */
```

## text

```js
/**
 * @description 标题文本
 * @type {String}
 * @default text = ''
 */
```

## offset

```js
/**
 * @description 标题位置偏移
 * @type {Array}
 * @default offset = [0, -20]
 */
```

## style

```js
/**
 * @description 标题默认样式
 * @type {Object}
 * @default style = {Class Style的配置项}
 */
style: {
  fill: '#333',
  fontSize: 17,
  fontWeight: 'bold',
  textAlign: 'center',
  textBaseline: 'bottom'
}
```

## rLevel

```js
/**
 * @description 标题渲染级别
 * 级别高者优先渲染
 * @type {Number}
 * @default rLevel = 20
 */
```

## animationCurve

```js
/**
 * @description 标题缓动曲线
 * @type {String}
 * @default animationCurve = 'easeOutCubic'
 */
```

## animationFrame

```js
/**
 * @description 标题缓动效果帧数
 * @type {Number}
 * @default animationFrame = 50
 */
```