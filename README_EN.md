[中文](./README.md)

<h1 align="center">Charts</h1>

<p align="center">
    <a href="https://github.com/DataV-Team/charts/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/DataV-Team/charts.svg" alt="LICENSE" />
    </a>
    <a href="https://www.npmjs.com/package/@jiaminghi/charts">
        <img src="https://img.shields.io/npm/v/@jiaminghi/charts.svg" alt="LICENSE" />
    </a>
</p>

### What is Charts?

- It is a `lightweight` chart library based on **canvas**.

### Provides

* `line`
* `bar`
* `pie`
* `radar`
* `gauge`

### Install with npm

```shell
$ npm install @jiaminghi/charts
```

### Use

```javascript
import Charts from '@jiaminghi/charts'

const container = document.getElementById('container')

const myChart = new Charts(container)

myChart.setOption({
  title: 'My Chart',
  // ...otherConfig
})
```

Detailed documents and examples can be viewed on the [HomePage](http://charts.jiaminghi.com).

### Quick experience

```html
<!--Resources are located on personal servers for experience and testing only, do not use in production environments-->
<!--Debug version-->
<script src="http://lib.jiaminghi.com/charts/charts.map.js"></script>
<!--Compression version-->
<script src="http://lib.jiaminghi.com/charts/charts.min.js"></script>
<script>
  const Charts = window.Charts.default
  // do something
</script>
```
