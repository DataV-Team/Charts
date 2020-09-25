# 介绍

**Charts**是一个轻量级的简易图表，主要为[DataV大屏数据展示组件库](http://datav.jiaminghi.com)提供图表支持，在该场景下不考虑图表交互，仅需展示效果，因此插件不提供交互及复杂功能。插件配置项参考**eCharts**，具有相关经验则极易上手使用。

由[CRender](http://crender.jiaminghi.com)提供图形渲染。

<demonstration />

点击以**重新**播放演示。

## 安装

* npm安装

```sh
npm install @jiaminghi/charts
```

* yarn安装

```sh
yarn add @jiaminghi/charts
```

## 使用

```js
import Charts from '@jiaminghi/charts'

const container = document.getElementById('container')

const myChart = new Charts(container)

myChart.setOption({
  title: 'My Chart',
  // ...otherConfig
})
```

## 快速体验

```html
<!--资源位于个人服务器仅供体验和测试，请勿在生产环境使用-->
<!--调试版-->
<script src="http://lib.jiaminghi.com/charts/charts.map.js"></script>
<!--压缩版-->
<script src="http://lib.jiaminghi.com/charts/charts.min.js"></script>
<script>
  const Charts = window.Charts.default
  // do something
</script>
```
