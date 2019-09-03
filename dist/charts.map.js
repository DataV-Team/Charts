(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Charts = require('../lib/index')

window.Charts = Charts
},{"../lib/index":29}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

require("../extend/index");

var _cRender = _interopRequireDefault(require("@jiaminghi/c-render"));

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _core = require("../core");

var Charts = function Charts(dom) {
  (0, _classCallCheck2["default"])(this, Charts);

  if (!dom) {
    console.error('Charts Missing parameters!');
    return false;
  }

  var clientWidth = dom.clientWidth,
      clientHeight = dom.clientHeight;
  var canvas = document.createElement('canvas');
  canvas.setAttribute('width', clientWidth);
  canvas.setAttribute('height', clientHeight);
  dom.appendChild(canvas);
  var attribute = {
    container: dom,
    canvas: canvas,
    render: new _cRender["default"](canvas),
    option: null
  };
  Object.assign(this, attribute);
};
/**
 * @description Set chart option
 * @param {Object} option Chart option
 * @return {Undefined} No return
 */


exports["default"] = Charts;

Charts.prototype.setOption = function (option) {
  if (!option || (0, _typeof2["default"])(option) !== 'object') {
    console.error('setOption Missing parameters!');
    return false;
  }

  var optionCloned = (0, _util.deepClone)(option, true);
  (0, _core.mergeColor)(this, optionCloned);
  (0, _core.grid)(this, optionCloned);
  (0, _core.axis)(this, optionCloned);
  (0, _core.radarAxis)(this, optionCloned);
  (0, _core.title)(this, optionCloned);
  (0, _core.bar)(this, optionCloned);
  (0, _core.line)(this, optionCloned);
  (0, _core.pie)(this, optionCloned);
  (0, _core.radar)(this, optionCloned);
  (0, _core.gauge)(this, optionCloned);
  (0, _core.legend)(this, optionCloned);
  this.option = option;
  this.render.launchAnimation(); // console.warn(this)
};
/**
 * @description Resize chart
 * @return {Undefined} No return
 */


Charts.prototype.resize = function () {
  var container = this.container,
      canvas = this.canvas,
      render = this.render,
      option = this.option;
  var clientWidth = container.clientWidth,
      clientHeight = container.clientHeight;
  canvas.setAttribute('width', clientWidth);
  canvas.setAttribute('height', clientHeight);
  render.area = [clientWidth, clientHeight];
  this.setOption(option);
};
},{"../core":20,"../extend/index":28,"@babel/runtime/helpers/classCallCheck":34,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render":52,"@jiaminghi/c-render/lib/plugin/util":54}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.doUpdate = doUpdate;
exports.Updater = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var Updater = function Updater(config, series) {
  (0, _classCallCheck2["default"])(this, Updater);
  var chart = config.chart,
      key = config.key,
      getGraphConfig = config.getGraphConfig;

  if (typeof getGraphConfig !== 'function') {
    console.warn('Updater need function getGraphConfig!');
    return;
  }

  if (!chart[key]) this.graphs = chart[key] = [];
  Object.assign(this, config);
  this.update(series);
};

exports.Updater = Updater;

Updater.prototype.update = function (series) {
  var _this = this;

  var graphs = this.graphs,
      beforeUpdate = this.beforeUpdate;
  delRedundanceGraph(this, series);
  if (!series.length) return;
  var beforeUpdateType = (0, _typeof2["default"])(beforeUpdate);
  series.forEach(function (seriesItem, i) {
    if (beforeUpdateType === 'function') beforeUpdate(graphs, seriesItem, i, _this);
    var cache = graphs[i];

    if (cache) {
      changeGraphs(cache, seriesItem, i, _this);
    } else {
      addGraphs(graphs, seriesItem, i, _this);
    }
  });
};

function delRedundanceGraph(updater, series) {
  var graphs = updater.graphs,
      render = updater.chart.render;
  var cacheGraphNum = graphs.length;
  var needGraphNum = series.length;

  if (cacheGraphNum > needGraphNum) {
    var needDelGraphs = graphs.splice(needGraphNum);
    needDelGraphs.forEach(function (item) {
      return item.forEach(function (g) {
        return render.delGraph(g);
      });
    });
  }
}

function changeGraphs(cache, seriesItem, i, updater) {
  var getGraphConfig = updater.getGraphConfig,
      render = updater.chart.render,
      beforeChange = updater.beforeChange;
  var configs = getGraphConfig(seriesItem, updater);
  balanceGraphsNum(cache, configs, render);
  cache.forEach(function (graph, j) {
    var config = configs[j];
    if (typeof beforeChange === 'function') beforeChange(graph, config);
    updateGraphConfigByKey(graph, config);
  });
}

function balanceGraphsNum(graphs, graphConfig, render) {
  var cacheGraphNum = graphs.length;
  var needGraphNum = graphConfig.length;

  if (needGraphNum > cacheGraphNum) {
    var lastCacheGraph = graphs.slice(-1)[0];
    var needAddGraphNum = needGraphNum - cacheGraphNum;
    var needAddGraphs = new Array(needAddGraphNum).fill(0).map(function (foo) {
      return render.clone(lastCacheGraph);
    });
    graphs.push.apply(graphs, (0, _toConsumableArray2["default"])(needAddGraphs));
  } else if (needGraphNum < cacheGraphNum) {
    var needDelCache = graphs.splice(needGraphNum);
    needDelCache.forEach(function (g) {
      return render.delGraph(g);
    });
  }
}

function addGraphs(graphs, seriesItem, i, updater) {
  var getGraphConfig = updater.getGraphConfig,
      getStartGraphConfig = updater.getStartGraphConfig,
      chart = updater.chart;
  var render = chart.render;
  var startConfigs = null;
  if (typeof getStartGraphConfig === 'function') startConfigs = getStartGraphConfig(seriesItem, updater);
  var configs = getGraphConfig(seriesItem, updater);
  if (!configs.length) return;

  if (startConfigs) {
    graphs[i] = startConfigs.map(function (config) {
      return render.add(config);
    });
    graphs[i].forEach(function (graph, i) {
      var config = configs[i];
      updateGraphConfigByKey(graph, config);
    });
  } else {
    graphs[i] = configs.map(function (config) {
      return render.add(config);
    });
  }

  var afterAddGraph = updater.afterAddGraph;
  if (typeof afterAddGraph === 'function') afterAddGraph(graphs[i]);
}

function updateGraphConfigByKey(graph, config) {
  var keys = Object.keys(config);
  keys.forEach(function (key) {
    if (key === 'shape' || key === 'style') {
      graph.animation(key, config[key], true);
    } else {
      graph[key] = config[key];
    }
  });
}

function doUpdate() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      chart = _ref.chart,
      series = _ref.series,
      key = _ref.key,
      getGraphConfig = _ref.getGraphConfig,
      getStartGraphConfig = _ref.getStartGraphConfig,
      beforeChange = _ref.beforeChange,
      beforeUpdate = _ref.beforeUpdate,
      afterAddGraph = _ref.afterAddGraph;

  if (chart[key]) {
    chart[key].update(series);
  } else {
    chart[key] = new Updater({
      chart: chart,
      key: key,
      getGraphConfig: getGraphConfig,
      getStartGraphConfig: getStartGraphConfig,
      beforeChange: beforeChange,
      beforeUpdate: beforeUpdate,
      afterAddGraph: afterAddGraph
    }, series);
  }
}
},{"@babel/runtime/helpers/classCallCheck":34,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.yAxisConfig = exports.xAxisConfig = void 0;
var xAxisConfig = {
  /**
   * @description Axis name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Whether to display this axis
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Axis position
   * @type {String}
   * @default position = 'bottom'
   * @example position = 'bottom' | 'top'
   */
  position: 'bottom',

  /**
   * @description Name gap
   * @type {Number}
   * @default nameGap = 15
   */
  nameGap: 15,

  /**
   * @description Name location
   * @type {String}
   * @default nameLocation = 'end'
   * @example nameLocation = 'end' | 'center' | 'start'
   */
  nameLocation: 'end',

  /**
   * @description Name default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  nameTextStyle: {
    fill: '#333',
    fontSize: 10
  },

  /**
   * @description Axis min value
   * @type {String|Number}
   * @default min = '20%'
   * @example min = '20%' | 0
   */
  min: '20%',

  /**
   * @description Axis max value
   * @type {String|Number}
   * @default max = '20%'
   * @example max = '20%' | 0
   */
  max: '20%',

  /**
   * @description Axis value interval
   * @type {Number}
   * @default interval = null
   * @example interval = 100
   */
  interval: null,

  /**
   * @description Min interval
   * @type {Number}
   * @default minInterval = null
   * @example minInterval = 1
   */
  minInterval: null,

  /**
   * @description Max interval
   * @type {Number}
   * @default maxInterval = null
   * @example maxInterval = 100
   */
  maxInterval: null,

  /**
   * @description Boundary gap
   * @type {Boolean}
   * @default boundaryGap = null
   * @example boundaryGap = true
   */
  boundaryGap: null,

  /**
   * @description Axis split number
   * @type {Number}
   * @default splitNumber = 5
   */
  splitNumber: 5,

  /**
   * @description Axis line configuration
   * @type {Object}
   */
  axisLine: {
    /**
     * @description Whether to display axis line
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis line default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },

  /**
   * @description Axis tick configuration
   * @type {Object}
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis tick default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },

  /**
   * @description Axis label configuration
   * @type {Object}
   */
  axisLabel: {
    /**
     * @description Whether to display axis label
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = '{value}件'
     * @example formatter = (dataItem) => (dataItem.value)
     */
    formatter: null,

    /**
     * @description Axis label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: '#333',
      fontSize: 10,
      rotate: 0
    }
  },

  /**
   * @description Axis split line configuration
   * @type {Object}
   */
  splitLine: {
    /**
     * @description Whether to display axis split line
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Axis split line default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1
    }
  },

  /**
   * @description X axis render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = -20
   */
  rLevel: -20,

  /**
   * @description X axis animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description X axis animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.xAxisConfig = xAxisConfig;
var yAxisConfig = {
  /**
   * @description Axis name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Whether to display this axis
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Axis position
   * @type {String}
   * @default position = 'left'
   * @example position = 'left' | 'right'
   */
  position: 'left',

  /**
   * @description Name gap
   * @type {Number}
   * @default nameGap = 15
   */
  nameGap: 15,

  /**
   * @description Name location
   * @type {String}
   * @default nameLocation = 'end'
   * @example nameLocation = 'end' | 'center' | 'start'
   */
  nameLocation: 'end',

  /**
   * @description name default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  nameTextStyle: {
    fill: '#333',
    fontSize: 10
  },

  /**
   * @description Axis min value
   * @type {String|Number}
   * @default min = '20%'
   * @example min = '20%' | 0
   */
  min: '20%',

  /**
   * @description Axis max value
   * @type {String|Number}
   * @default max = '20%'
   * @example max = '20%' | 0
   */
  max: '20%',

  /**
   * @description Axis value interval
   * @type {Number}
   * @default interval = null
   * @example interval = 100
   */
  interval: null,

  /**
   * @description Min interval
   * @type {Number}
   * @default minInterval = null
   * @example minInterval = 1
   */
  minInterval: null,

  /**
   * @description Max interval
   * @type {Number}
   * @default maxInterval = null
   * @example maxInterval = 100
   */
  maxInterval: null,

  /**
   * @description Boundary gap
   * @type {Boolean}
   * @default boundaryGap = null
   * @example boundaryGap = true
   */
  boundaryGap: null,

  /**
   * @description Axis split number
   * @type {Number}
   * @default splitNumber = 5
   */
  splitNumber: 5,

  /**
   * @description Axis line configuration
   * @type {Object}
   */
  axisLine: {
    /**
     * @description Whether to display axis line
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis line default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },

  /**
   * @description Axis tick configuration
   * @type {Object}
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis tick default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#333',
      lineWidth: 1
    }
  },

  /**
   * @description Axis label configuration
   * @type {Object}
   */
  axisLabel: {
    /**
     * @description Whether to display axis label
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = '{value}件'
     * @example formatter = (dataItem) => (dataItem.value)
     */
    formatter: null,

    /**
     * @description Axis label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: '#333',
      fontSize: 10,
      rotate: 0
    }
  },

  /**
   * @description Axis split line configuration
   * @type {Object}
   */
  splitLine: {
    /**
     * @description Whether to display axis split line
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis split line default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1
    }
  },

  /**
   * @description Y axis render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = -20
   */
  rLevel: -20,

  /**
   * @description Y axis animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Y axis animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.yAxisConfig = yAxisConfig;
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.barConfig = void 0;
var barConfig = {
  /**
   * @description Whether to display this bar chart
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Legend name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Data stacking
   * The data value of the series element of the same stack
   * will be superimposed (the latter value will be superimposed on the previous value)
   * @type {String}
   * @default stack = ''
   */
  stack: '',

  /**
   * @description Bar shape type
   * @type {String}
   * @default shapeType = 'normal'
   * @example shapeType = 'normal' | 'leftEchelon' | 'rightEchelon'
   */
  shapeType: 'normal',

  /**
   * @description Echelon bar sharpness offset
   * @type {Number}
   * @default echelonOffset = 10
   */
  echelonOffset: 10,

  /**
   * @description Bar width
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   * @type {String|Number}
   * @default barWidth = 'auto'
   * @example barWidth = 'auto' | '10%' | 20
   */
  barWidth: 'auto',

  /**
   * @description Bar gap
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   * @type {String|Number}
   * @default barGap = '30%'
   * @example barGap = '30%' | 30
   */
  barGap: '30%',

  /**
   * @description Bar category gap
   * This property should be set on the last 'bar' series
   * in this coordinate system to take effect and will be in effect
   * for all 'bar' series in this coordinate system
   * @type {String|Number}
   * @default barCategoryGap = '20%'
   * @example barCategoryGap = '20%' | 20
   */
  barCategoryGap: '20%',

  /**
   * @description Bar x axis index
   * @type {Number}
   * @default xAxisIndex = 0
   * @example xAxisIndex = 0 | 1
   */
  xAxisIndex: 0,

  /**
   * @description Bar y axis index
   * @type {Number}
   * @default yAxisIndex = 0
   * @example yAxisIndex = 0 | 1
   */
  yAxisIndex: 0,

  /**
   * @description Bar chart data
   * @type {Array}
   * @default data = []
   * @example data = [100, 200, 300]
   */
  data: [],

  /**
   * @description Background bar configuration
   * @type {Object}
   */
  backgroundBar: {
    /**
     * @description Whether to display background bar
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Background bar width
     * @type {String|Number}
     * @default width = 'auto'
     * @example width = 'auto' | '30%' | 30
     */
    width: 'auto',

    /**
     * @description Background bar default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: 'rgba(200, 200, 200, .4)'
    }
  },

  /**
   * @description Bar label configuration
   * @type {Object}
   */
  label: {
    /**
     * @description Whether to display bar label
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Bar label position
     * @type {String}
     * @default position = 'top'
     * @example position = 'top' | 'center' | 'bottom'
     */
    position: 'top',

    /**
     * @description Bar label offset
     * @type {Array}
     * @default offset = [0, -10]
     */
    offset: [0, -10],

    /**
     * @description Bar label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = '{value}件'
     * @example formatter = (dataItem) => (dataItem.value)
     */
    formatter: null,

    /**
     * @description Bar label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 10
    }
  },

  /**
   * @description Bar gradient configuration
   * @type {Object}
   */
  gradient: {
    /**
     * @description Gradient color (Hex|rgb|rgba)
     * @type {Array}
     * @default color = []
     */
    color: [],

    /**
     * @description Local gradient
     * @type {Boolean}
     * @default local = true
     */
    local: true
  },

  /**
   * @description Bar style default configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  barStyle: {},

  /**
   * @description Bar chart render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 0
   */
  rLevel: 0,

  /**
   * @description Bar animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Bar animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.barConfig = barConfig;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.colorConfig = void 0;
var colorConfig = ['#37a2da', '#32c5e9', '#67e0e3', '#9fe6b8', '#ffdb5c', '#ff9f7f', '#fb7293', '#e062ae', '#e690d1', '#e7bcf3', '#9d96f5', '#8378ea', '#96bfff'];
exports.colorConfig = colorConfig;
},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gaugeConfig = void 0;
var gaugeConfig = {
  /**
   * @description Whether to display this gauge
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Legend name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Radius of gauge
   * @type {String|Number}
   * @default radius = '60%'
   * @example radius = '60%' | 100
   */
  radius: '60%',

  /**
   * @description Center point of gauge
   * @type {Array}
   * @default center = ['50%','50%']
   * @example center = ['50%','50%'] | [100, 100]
   */
  center: ['50%', '50%'],

  /**
   * @description Gauge start angle
   * @type {Number}
   * @default startAngle = -(Math.PI / 4) * 5
   * @example startAngle = -Math.PI
   */
  startAngle: -(Math.PI / 4) * 5,

  /**
   * @description Gauge end angle
   * @type {Number}
   * @default endAngle = Math.PI / 4
   * @example endAngle = 0
   */
  endAngle: Math.PI / 4,

  /**
   * @description Gauge min value
   * @type {Number}
   * @default min = 0
   */
  min: 0,

  /**
   * @description Gauge max value
   * @type {Number}
   * @default max = 100
   */
  max: 100,

  /**
   * @description Gauge split number
   * @type {Number}
   * @default splitNum = 5
   */
  splitNum: 5,

  /**
   * @description Gauge arc line width
   * @type {Number}
   * @default arcLineWidth = 15
   */
  arcLineWidth: 15,

  /**
   * @description Gauge chart data
   * @type {Array}
   * @default data = []
   */
  data: [],

  /**
   * @description Data item arc default style configuration
   * @type {Object}
   * @default dataItemStyle = {Configuration Of Class Style}
   */
  dataItemStyle: {},

  /**
   * @description Axis tick configuration
   * @type {Object}
   */
  axisTick: {
    /**
     * @description Whether to display axis tick
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis tick length
     * @type {Number}
     * @default tickLength = 6
     */
    tickLength: 6,

    /**
     * @description Axis tick default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#999',
      lineWidth: 1
    }
  },

  /**
   * @description Axis label configuration
   * @type {Object}
   */
  axisLabel: {
    /**
     * @description Whether to display axis label
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Axis label data (Can be calculated automatically)
     * @type {Array}
     * @default data = [Number...]
     */
    data: [],

    /**
     * @description Axis label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = '{value}%'
     * @example formatter = (labelItem) => (labelItem.value)
     */
    formatter: null,

    /**
     * @description Axis label gap between label and axis tick
     * @type {String|Function}
     * @default labelGap = 5
     */
    labelGap: 5,

    /**
     * @description Axis label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {}
  },

  /**
   * @description Gauge pointer configuration
   * @type {Object}
   */
  pointer: {
    /**
     * @description Whether to display pointer
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Pointer value index of data
     * @type {Number}
     * @default valueIndex = 0 (pointer.value = data[0].value)
     */
    valueIndex: 0,

    /**
     * @description Pointer default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      scale: [1, 1],
      fill: '#fb7293'
    }
  },

  /**
   * @description Data item arc detail configuration
   * @type {Object}
   */
  details: {
    /**
     * @description Whether to display details
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Details formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = '{value}%'
     * @example formatter = '{name}%'
     * @example formatter = (dataItem) => (dataItem.value)
     */
    formatter: null,

    /**
     * @description Details position offset
     * @type {Array}
     * @default offset = [0, 0]
     * @example offset = [10, 10]
     */
    offset: [0, 0],

    /**
     * @description Value fractional precision
     * @type {Number}
     * @default valueToFixed = 0
     */
    valueToFixed: 0,

    /**
     * @description Details position
     * @type {String}
     * @default position = 'center'
     * @example position = 'start' | 'center' | 'end'
     */
    position: 'center',

    /**
     * @description Details default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      textBaseline: 'middle'
    }
  },

  /**
   * @description Gauge background arc configuration
   * @type {Object}
   */
  backgroundArc: {
    /**
     * @description Whether to display background arc
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Background arc default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#e0e0e0'
    }
  },

  /**
   * @description Gauge chart render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 10
   */
  rLevel: 10,

  /**
   * @description Gauge animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Gauge animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.gaugeConfig = gaugeConfig;
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridConfig = void 0;
var gridConfig = {
  /**
   * @description Grid left margin
   * @type {String|Number}
   * @default left = '10%'
   * @example left = '10%' | 10
   */
  left: '10%',

  /**
   * @description Grid right margin
   * @type {String|Number}
   * @default right = '10%'
   * @example right = '10%' | 10
   */
  right: '10%',

  /**
   * @description Grid top margin
   * @type {String|Number}
   * @default top = 60
   * @example top = '10%' | 60
   */
  top: 60,

  /**
   * @description Grid bottom margin
   * @type {String|Number}
   * @default bottom = 60
   * @example bottom = '10%' | 60
   */
  bottom: 60,

  /**
   * @description Grid default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  style: {
    fill: 'rgba(0, 0, 0, 0)'
  },

  /**
   * @description Grid render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = -30
   */
  rLevel: -30,

  /**
   * @description Grid animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Grid animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 30
};
exports.gridConfig = gridConfig;
},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changeDefaultConfig = changeDefaultConfig;
Object.defineProperty(exports, "colorConfig", {
  enumerable: true,
  get: function get() {
    return _color.colorConfig;
  }
});
Object.defineProperty(exports, "gridConfig", {
  enumerable: true,
  get: function get() {
    return _grid.gridConfig;
  }
});
Object.defineProperty(exports, "xAxisConfig", {
  enumerable: true,
  get: function get() {
    return _axis.xAxisConfig;
  }
});
Object.defineProperty(exports, "yAxisConfig", {
  enumerable: true,
  get: function get() {
    return _axis.yAxisConfig;
  }
});
Object.defineProperty(exports, "titleConfig", {
  enumerable: true,
  get: function get() {
    return _title.titleConfig;
  }
});
Object.defineProperty(exports, "lineConfig", {
  enumerable: true,
  get: function get() {
    return _line.lineConfig;
  }
});
Object.defineProperty(exports, "barConfig", {
  enumerable: true,
  get: function get() {
    return _bar.barConfig;
  }
});
Object.defineProperty(exports, "pieConfig", {
  enumerable: true,
  get: function get() {
    return _pie.pieConfig;
  }
});
Object.defineProperty(exports, "radarAxisConfig", {
  enumerable: true,
  get: function get() {
    return _radarAxis.radarAxisConfig;
  }
});
Object.defineProperty(exports, "radarConfig", {
  enumerable: true,
  get: function get() {
    return _radar.radarConfig;
  }
});
Object.defineProperty(exports, "gaugeConfig", {
  enumerable: true,
  get: function get() {
    return _gauge.gaugeConfig;
  }
});
Object.defineProperty(exports, "legendConfig", {
  enumerable: true,
  get: function get() {
    return _legend.legendConfig;
  }
});
exports.keys = void 0;

var _color = require("./color");

var _grid = require("./grid");

var _axis = require("./axis");

var _title = require("./title");

var _line = require("./line");

var _bar = require("./bar");

var _pie = require("./pie");

var _radarAxis = require("./radarAxis");

var _radar = require("./radar");

var _gauge = require("./gauge");

var _legend = require("./legend");

var _util = require("../util");

var allConfig = {
  colorConfig: _color.colorConfig,
  gridConfig: _grid.gridConfig,
  xAxisConfig: _axis.xAxisConfig,
  yAxisConfig: _axis.yAxisConfig,
  titleConfig: _title.titleConfig,
  lineConfig: _line.lineConfig,
  barConfig: _bar.barConfig,
  pieConfig: _pie.pieConfig,
  radarAxisConfig: _radarAxis.radarAxisConfig,
  radarConfig: _radar.radarConfig,
  gaugeConfig: _gauge.gaugeConfig,
  legendConfig: _legend.legendConfig
  /**
   * @description Change default configuration
   * @param {String} key          Configuration key
   * @param {Object|Array} config Your config
   * @return {Undefined} No return
   */

};

function changeDefaultConfig(key, config) {
  if (!allConfig["".concat(key, "Config")]) {
    console.warn('Change default config Error - Invalid key!');
    return;
  }

  (0, _util.deepMerge)(allConfig["".concat(key, "Config")], config);
}

var keys = ['color', 'title', 'legend', 'xAxis', 'yAxis', 'grid', 'radarAxis', 'line', 'bar', 'pie', 'radar', 'gauge'];
exports.keys = keys;
},{"../util":30,"./axis":4,"./bar":5,"./color":6,"./gauge":7,"./grid":8,"./legend":10,"./line":11,"./pie":12,"./radar":13,"./radarAxis":14,"./title":15}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.legendConfig = void 0;
var legendConfig = {
  /**
   * @description Whether to display legend
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Legend orient
   * @type {String}
   * @default orient = 'horizontal'
   * @example orient = 'horizontal' | 'vertical'
   */
  orient: 'horizontal',

  /**
   * @description Legend left
   * @type {String|Number}
   * @default left = 'auto'
   * @example left = 'auto' | '10%' | 10
   */
  left: 'auto',

  /**
   * @description Legend right
   * @type {String|Number}
   * @default right = 'auto'
   * @example right = 'auto' | '10%' | 10
   */
  right: 'auto',

  /**
   * @description Legend top
   * @type {String|Number}
   * @default top = 'auto'
   * @example top = 'auto' | '10%' | 10
   */
  top: 'auto',

  /**
   * @description Legend bottom
   * @type {String|Number}
   * @default bottom = 'auto'
   * @example bottom = 'auto' | '10%' | 10
   */
  bottom: 'auto',

  /**
   * @description Legend item gap
   * @type {Number}
   * @default itemGap = 10
   */
  itemGap: 10,

  /**
   * @description Icon width
   * @type {Number}
   * @default iconWidth = 25
   */
  iconWidth: 25,

  /**
   * @description Icon height
   * @type {Number}
   * @default iconHeight = 10
   */
  iconHeight: 10,

  /**
   * @description Whether legend is optional
   * @type {Boolean}
   * @default selectAble = true
   */
  selectAble: true,

  /**
   * @description Legend data
   * @type {Array}
   * @default data = []
   */
  data: [],

  /**
   * @description Legend text default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  textStyle: {
    fontFamily: 'Arial',
    fontSize: 13,
    fill: '#000'
  },

  /**
   * @description Legend icon default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  iconStyle: {},

  /**
   * @description Legend text unselected default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  textUnselectedStyle: {
    fontFamily: 'Arial',
    fontSize: 13,
    fill: '#999'
  },

  /**
   * @description Legend icon unselected default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  iconUnselectedStyle: {
    fill: '#999'
  },

  /**
   * @description Legend render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 20
   */
  rLevel: 20,

  /**
   * @description Legend animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Legend animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.legendConfig = legendConfig;
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lineConfig = void 0;
var lineConfig = {
  /**
   * @description Whether to display this line chart
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Legend name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Data stacking
   * The data value of the series element of the same stack
   * will be superimposed (the latter value will be superimposed on the previous value)
   * @type {String}
   * @default stack = ''
   */
  stack: '',

  /**
   * @description Smooth line
   * @type {Boolean}
   * @default smooth = false
   */
  smooth: false,

  /**
   * @description Line x axis index
   * @type {Number}
   * @default xAxisIndex = 0
   * @example xAxisIndex = 0 | 1
   */
  xAxisIndex: 0,

  /**
   * @description Line y axis index
   * @type {Number}
   * @default yAxisIndex = 0
   * @example yAxisIndex = 0 | 1
   */
  yAxisIndex: 0,

  /**
   * @description Line chart data
   * @type {Array}
   * @default data = []
   * @example data = [100, 200, 300]
   */
  data: [],

  /**
   * @description Line default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  lineStyle: {
    lineWidth: 1
  },

  /**
   * @description Line point configuration
   * @type {Object}
   */
  linePoint: {
    /**
     * @description Whether to display line point
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Line point radius
     * @type {Number}
     * @default radius = 2
     */
    radius: 2,

    /**
     * @description Line point default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: '#fff',
      lineWidth: 1
    }
  },

  /**
   * @description Line area configuration
   * @type {Object}
   */
  lineArea: {
    /**
     * @description Whether to display line area
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Line area gradient color (Hex|rgb|rgba)
     * @type {Array}
     * @default gradient = []
     */
    gradient: [],

    /**
     * @description Line area style default configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      opacity: 0.5
    }
  },

  /**
   * @description Line label configuration
   * @type {Object}
   */
  label: {
    /**
     * @description Whether to display line label
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Line label position
     * @type {String}
     * @default position = 'top'
     * @example position = 'top' | 'center' | 'bottom'
     */
    position: 'top',

    /**
     * @description Line label offset
     * @type {Array}
     * @default offset = [0, -10]
     */
    offset: [0, -10],

    /**
     * @description Line label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = '{value}件'
     * @example formatter = (dataItem) => (dataItem.value)
     */
    formatter: null,

    /**
     * @description Line label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 10
    }
  },

  /**
   * @description Line chart render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 10
   */
  rLevel: 10,

  /**
   * @description Line animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Line animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.lineConfig = lineConfig;
},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pieConfig = void 0;
var pieConfig = {
  /**
   * @description Whether to display this pie chart
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Legend name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Radius of pie
   * @type {String|Number}
   * @default radius = '50%'
   * @example radius = '50%' | 100
   */
  radius: '50%',

  /**
   * @description Center point of pie
   * @type {Array}
   * @default center = ['50%','50%']
   * @example center = ['50%','50%'] | [100, 100]
   */
  center: ['50%', '50%'],

  /**
   * @description Pie chart start angle
   * @type {Number}
   * @default startAngle = -Math.PI / 2
   * @example startAngle = -Math.PI
   */
  startAngle: -Math.PI / 2,

  /**
   * @description Whether to enable rose type
   * @type {Boolean}
   * @default roseType = false
   */
  roseType: false,

  /**
   * @description Automatic sorting in rose type
   * @type {Boolean}
   * @default roseSort = true
   */
  roseSort: true,

  /**
   * @description Rose radius increasing
   * @type {String|Number}
   * @default roseIncrement = 'auto'
   * @example roseIncrement = 'auto' | '10%' | 10
   */
  roseIncrement: 'auto',

  /**
   * @description Pie chart data
   * @type {Array}
   * @default data = []
   */
  data: [],

  /**
   * @description Pie inside label configuration
   * @type {Object}
   */
  insideLabel: {
    /**
     * @description Whether to display inside label
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Label formatter
     * @type {String|Function}
     * @default formatter = '{percent}%'
     * @example formatter = '${name}-{value}-{percent}%'
     * @example formatter = (dataItem) => (dataItem.name)
     */
    formatter: '{percent}%',

    /**
     * @description Label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 10,
      fill: '#fff',
      textAlign: 'center',
      textBaseline: 'middle'
    }
  },

  /**
   * @description Pie Outside label configuration
   * @type {Object}
   */
  outsideLabel: {
    /**
     * @description Whether to display outside label
     * @type {Boolean}
     * @default show = false
     */
    show: true,

    /**
     * @description Label formatter
     * @type {String|Function}
     * @default formatter = '{name}'
     * @example formatter = '${name}-{value}-{percent}%'
     * @example formatter = (dataItem) => (dataItem.name)
     */
    formatter: '{name}',

    /**
     * @description Label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 11
    },

    /**
     * @description Gap beteen label line bended place and pie
     * @type {String|Number}
     * @default labelLineBendGap = '20%'
     * @example labelLineBendGap = '20%' | 20
     */
    labelLineBendGap: '20%',

    /**
     * @description Label line end length
     * @type {Number}
     * @default labelLineEndLength = 50
     */
    labelLineEndLength: 50,

    /**
     * @description Label line default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    labelLineStyle: {
      lineWidth: 1
    }
  },

  /**
   * @description Pie default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  pieStyle: {},

  /**
   * @description Percentage fractional precision
   * @type {Number}
   * @default percentToFixed = 0
   */
  percentToFixed: 0,

  /**
   * @description Pie chart render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 10
   */
  rLevel: 10,

  /**
   * @description Animation delay gap
   * @type {Number}
   * @default animationDelayGap = 60
   */
  animationDelayGap: 60,

  /**
   * @description Pie animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Pie start animation curve
   * @type {String}
   * @default startAnimationCurve = 'easeOutBack'
   */
  startAnimationCurve: 'easeOutBack',

  /**
   * @description Pie animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.pieConfig = pieConfig;
},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radarConfig = void 0;
var radarConfig = {
  /**
   * @description Whether to display this radar
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Legend name
   * @type {String}
   * @default name = ''
   */
  name: '',

  /**
   * @description Radar chart data
   * @type {Array}
   * @default data = []
   * @example data = [100, 200, 300]
   */
  data: [],

  /**
   * @description Radar default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  radarStyle: {
    lineWidth: 1
  },

  /**
   * @description Radar point configuration
   * @type {Object}
   */
  point: {
    /**
     * @description Whether to display radar point
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Point radius
     * @type {Number}
     * @default radius = 2
     */
    radius: 2,

    /**
     * @description Radar point default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: '#fff'
    }
  },

  /**
   * @description Radar label configuration
   * @type {Object}
   */
  label: {
    /**
     * @description Whether to display radar label
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Label position offset
     * @type {Array}
     * @default offset = [0, 0]
     */
    offset: [0, 0],

    /**
     * @description Label gap between label and radar
     * @type {Number}
     * @default labelGap = 5
     */
    labelGap: 5,

    /**
     * @description Label formatter
     * @type {String|Function}
     * @default formatter = null
     * @example formatter = 'Score-{value}'
     * @example formatter = (label) => (label)
     */
    formatter: null,

    /**
     * @description Radar label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fontSize: 10
    }
  },

  /**
   * @description Radar chart render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 10
   */
  rLevel: 10,

  /**
   * @description Radar animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Radar animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrane: 50
};
exports.radarConfig = radarConfig;
},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radarAxisConfig = void 0;
var radarAxisConfig = {
  /**
   * @description Whether to display this radar axis
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Center point of radar axis
   * @type {Array}
   * @default center = ['50%','50%']
   * @example center = ['50%','50%'] | [100, 100]
   */
  center: ['50%', '50%'],

  /**
   * @description Radius of radar axis
   * @type {String|Number}
   * @default radius = '65%'
   * @example radius = '65%' | 100
   */
  radius: '65%',

  /**
   * @description Radar axis start angle
   * @type {Number}
   * @default startAngle = -Math.PI / 2
   * @example startAngle = -Math.PI
   */
  startAngle: -Math.PI / 2,

  /**
   * @description Radar axis split number
   * @type {Number}
   * @default splitNum = 5
   */
  splitNum: 5,

  /**
   * @description Whether to enable polygon radar axis
   * @type {Boolean}
   * @default polygon = false
   */
  polygon: false,

  /**
   * @description Axis label configuration
   * @type {Object}
   */
  axisLabel: {
    /**
     * @description Whether to display axis label
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Label gap between label and radar axis
     * @type {Number}
     * @default labelGap = 15
     */
    labelGap: 15,

    /**
     * @description Label color (Hex|rgb|rgba), will cover style.fill
     * @type {Array}
     * @default color = []
     */
    color: [],

    /**
     * @description Axis label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      fill: '#333'
    }
  },

  /**
   * @description Axis line configuration
   * @type {Object}
   */
  axisLine: {
    /**
     * @description Whether to display axis line
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Line color (Hex|rgb|rgba), will cover style.stroke
     * @type {Array}
     * @default color = []
     */
    color: [],

    /**
     * @description Axis label default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#999',
      lineWidth: 1
    }
  },

  /**
   * @description Split line configuration
   * @type {Object}
   */
  splitLine: {
    /**
     * @description Whether to display split line
     * @type {Boolean}
     * @default show = true
     */
    show: true,

    /**
     * @description Line color (Hex|rgb|rgba), will cover style.stroke
     * @type {Array}
     * @default color = []
     */
    color: [],

    /**
     * @description Split line default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {
      stroke: '#d4d4d4',
      lineWidth: 1
    }
  },

  /**
   * @description Split area configuration
   * @type {Object}
   */
  splitArea: {
    /**
     * @description Whether to display split area
     * @type {Boolean}
     * @default show = false
     */
    show: false,

    /**
     * @description Area color (Hex|rgb|rgba), will cover style.stroke
     * @type {Array}
     * @default color = []
     */
    color: ['#f5f5f5', '#e6e6e6'],

    /**
     * @description Split area default style configuration
     * @type {Object}
     * @default style = {Configuration Of Class Style}
     */
    style: {}
  },

  /**
   * @description Bar chart render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = -10
   */
  rLevel: -10,

  /**
   * @description Radar axis animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Radar axis animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrane: 50
};
exports.radarAxisConfig = radarAxisConfig;
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.titleConfig = void 0;
var titleConfig = {
  /**
   * @description Whether to display title
   * @type {Boolean}
   * @default show = true
   */
  show: true,

  /**
   * @description Title text
   * @type {String}
   * @default text = ''
   */
  text: '',

  /**
   * @description Title offset
   * @type {Array}
   * @default offset = [0, -20]
   */
  offset: [0, -20],

  /**
   * @description Title default style configuration
   * @type {Object}
   * @default style = {Configuration Of Class Style}
   */
  style: {
    fill: '#333',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    textBaseline: 'bottom'
  },

  /**
   * @description Title render level
   * Priority rendering high level
   * @type {Number}
   * @default rLevel = 20
   */
  rLevel: 20,

  /**
   * @description Title animation curve
   * @type {String}
   * @default animationCurve = 'easeOutCubic'
   */
  animationCurve: 'easeOutCubic',

  /**
   * @description Title animation frame
   * @type {Number}
   * @default animationFrame = 50
   */
  animationFrame: 50
};
exports.titleConfig = titleConfig;
},{}],16:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.axis = axis;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _updater = require("../class/updater.class");

var _config = require("../config");

var _util = require("../util");

var _util2 = require("@jiaminghi/c-render/lib/plugin/util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var axisConfig = {
  xAxisConfig: _config.xAxisConfig,
  yAxisConfig: _config.yAxisConfig
};
var min = Math.min,
    max = Math.max,
    abs = Math.abs,
    pow = Math.pow;

function axis(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var xAxis = option.xAxis,
      yAxis = option.yAxis,
      series = option.series;
  var allAxis = [];

  if (xAxis && yAxis && series) {
    allAxis = getAllAxis(xAxis, yAxis);
    allAxis = mergeDefaultAxisConfig(allAxis);
    allAxis = allAxis.filter(function (_ref) {
      var show = _ref.show;
      return show;
    });
    allAxis = mergeDefaultBoundaryGap(allAxis);
    allAxis = calcAxisLabelData(allAxis, series);
    allAxis = setAxisPosition(allAxis);
    allAxis = calcAxisLinePosition(allAxis, chart);
    allAxis = calcAxisTickPosition(allAxis, chart);
    allAxis = calcAxisNamePosition(allAxis, chart);
    allAxis = calcSplitLinePosition(allAxis, chart);
  }

  (0, _updater.doUpdate)({
    chart: chart,
    series: allAxis,
    key: 'axisLine',
    getGraphConfig: getLineConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: allAxis,
    key: 'axisTick',
    getGraphConfig: getTickConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: allAxis,
    key: 'axisLabel',
    getGraphConfig: getLabelConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: allAxis,
    key: 'axisName',
    getGraphConfig: getNameConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: allAxis,
    key: 'splitLine',
    getGraphConfig: getSplitLineConfig
  });
  chart.axisData = allAxis;
}

function getAllAxis(xAxis, yAxis) {
  var allXAxis = [],
      allYAxis = [];

  if (xAxis instanceof Array) {
    var _allXAxis;

    (_allXAxis = allXAxis).push.apply(_allXAxis, (0, _toConsumableArray2["default"])(xAxis));
  } else {
    allXAxis.push(xAxis);
  }

  if (yAxis instanceof Array) {
    var _allYAxis;

    (_allYAxis = allYAxis).push.apply(_allYAxis, (0, _toConsumableArray2["default"])(yAxis));
  } else {
    allYAxis.push(yAxis);
  }

  allXAxis.splice(2);
  allYAxis.splice(2);
  allXAxis = allXAxis.map(function (axis, i) {
    return _objectSpread({}, axis, {
      index: i,
      axis: 'x'
    });
  });
  allYAxis = allYAxis.map(function (axis, i) {
    return _objectSpread({}, axis, {
      index: i,
      axis: 'y'
    });
  });
  return [].concat((0, _toConsumableArray2["default"])(allXAxis), (0, _toConsumableArray2["default"])(allYAxis));
}

function mergeDefaultAxisConfig(allAxis) {
  var xAxis = allAxis.filter(function (_ref2) {
    var axis = _ref2.axis;
    return axis === 'x';
  });
  var yAxis = allAxis.filter(function (_ref3) {
    var axis = _ref3.axis;
    return axis === 'y';
  });
  xAxis = xAxis.map(function (axis) {
    return (0, _util.deepMerge)((0, _util2.deepClone)(_config.xAxisConfig), axis);
  });
  yAxis = yAxis.map(function (axis) {
    return (0, _util.deepMerge)((0, _util2.deepClone)(_config.yAxisConfig), axis);
  });
  return [].concat((0, _toConsumableArray2["default"])(xAxis), (0, _toConsumableArray2["default"])(yAxis));
}

function mergeDefaultBoundaryGap(allAxis) {
  var valueAxis = allAxis.filter(function (_ref4) {
    var data = _ref4.data;
    return data === 'value';
  });
  var labelAxis = allAxis.filter(function (_ref5) {
    var data = _ref5.data;
    return data !== 'value';
  });
  valueAxis.forEach(function (axis) {
    if (typeof axis.boundaryGap === 'boolean') return;
    axis.boundaryGap = false;
  });
  labelAxis.forEach(function (axis) {
    if (typeof axis.boundaryGap === 'boolean') return;
    axis.boundaryGap = true;
  });
  return [].concat((0, _toConsumableArray2["default"])(valueAxis), (0, _toConsumableArray2["default"])(labelAxis));
}

function calcAxisLabelData(allAxis, series) {
  var valueAxis = allAxis.filter(function (_ref6) {
    var data = _ref6.data;
    return data === 'value';
  });
  var labelAxis = allAxis.filter(function (_ref7) {
    var data = _ref7.data;
    return data instanceof Array;
  });
  valueAxis = calcValueAxisLabelData(valueAxis, series);
  labelAxis = calcLabelAxisLabelData(labelAxis);
  return [].concat((0, _toConsumableArray2["default"])(valueAxis), (0, _toConsumableArray2["default"])(labelAxis));
}

function calcValueAxisLabelData(valueAxis, series) {
  return valueAxis.map(function (axis) {
    var minMaxValue = getValueAxisMaxMinValue(axis, series);

    var _getTrueMinMax = getTrueMinMax(axis, minMaxValue),
        _getTrueMinMax2 = (0, _slicedToArray2["default"])(_getTrueMinMax, 2),
        min = _getTrueMinMax2[0],
        max = _getTrueMinMax2[1];

    var interval = getValueInterval(min, max, axis);
    var formatter = axis.axisLabel.formatter;
    var label = [];

    if (minMaxValue[0] === minMaxValue[1]) {
      label = minMaxValue;
    } else if (min < 0 && max > 0) {
      label = getValueAxisLabelFromZero(min, max, interval);
    } else {
      label = getValueAxisLabelFromMin(min, max, interval);
    }

    label = label.map(function (l) {
      return parseFloat(l.toFixed(2));
    });
    return _objectSpread({}, axis, {
      maxValue: label.slice(-1)[0],
      minValue: label[0],
      label: getAfterFormatterLabel(label, formatter)
    });
  });
}

function getValueAxisMaxMinValue(axis, series) {
  series = series.filter(function (_ref8) {
    var show = _ref8.show,
        type = _ref8.type;
    if (show === false) return false;
    if (type === 'pie') return false;
    return true;
  });
  if (series.length === 0) return [0, 0];
  var index = axis.index,
      axisType = axis.axis;
  series = mergeStackData(series);
  var axisName = axisType + 'Axis';
  var valueSeries = series.filter(function (s) {
    return s[axisName] === index;
  });
  if (!valueSeries.length) valueSeries = series;
  return getSeriesMinMaxValue(valueSeries);
}

function getSeriesMinMaxValue(series) {
  if (!series) return;
  var minValue = Math.min.apply(Math, (0, _toConsumableArray2["default"])(series.map(function (_ref9) {
    var data = _ref9.data;
    return Math.min.apply(Math, (0, _toConsumableArray2["default"])((0, _util.filterNonNumber)(data)));
  })));
  var maxValue = Math.max.apply(Math, (0, _toConsumableArray2["default"])(series.map(function (_ref10) {
    var data = _ref10.data;
    return Math.max.apply(Math, (0, _toConsumableArray2["default"])((0, _util.filterNonNumber)(data)));
  })));
  return [minValue, maxValue];
}

function mergeStackData(series) {
  var seriesCloned = (0, _util2.deepClone)(series, true);
  series.forEach(function (item, i) {
    var data = (0, _util.mergeSameStackData)(item, series);
    seriesCloned[i].data = data;
  });
  return seriesCloned;
}

function getTrueMinMax(_ref11, _ref12) {
  var min = _ref11.min,
      max = _ref11.max,
      axis = _ref11.axis;

  var _ref13 = (0, _slicedToArray2["default"])(_ref12, 2),
      minValue = _ref13[0],
      maxValue = _ref13[1];

  var minType = (0, _typeof2["default"])(min),
      maxType = (0, _typeof2["default"])(max);

  if (!testMinMaxType(min)) {
    min = axisConfig[axis + 'AxisConfig'].min;
    minType = 'string';
  }

  if (!testMinMaxType(max)) {
    max = axisConfig[axis + 'AxisConfig'].max;
    maxType = 'string';
  }

  if (minType === 'string') {
    min = parseInt(minValue - abs(minValue * parseFloat(min) / 100));
    var lever = getValueLever(min);
    min = parseFloat((min / lever - 0.1).toFixed(1)) * lever;
  }

  if (maxType === 'string') {
    max = parseInt(maxValue + abs(maxValue * parseFloat(max) / 100));

    var _lever = getValueLever(max);

    max = parseFloat((max / _lever + 0.1).toFixed(1)) * _lever;
  }

  return [min, max];
}

function getValueLever(value) {
  var valueString = abs(value).toString();
  var valueLength = valueString.length;
  var firstZeroIndex = valueString.replace(/0*$/g, '').indexOf('0');
  var pow10Num = valueLength - 1;
  if (firstZeroIndex !== -1) pow10Num -= firstZeroIndex;
  return pow(10, pow10Num);
}

function testMinMaxType(val) {
  var valType = (0, _typeof2["default"])(val);
  var isValidString = valType === 'string' && /^\d+%$/.test(val);
  var isValidNumber = valType === 'number';
  return isValidString || isValidNumber;
}

function getValueAxisLabelFromZero(min, max, interval) {
  var negative = [],
      positive = [];
  var currentNegative = 0,
      currentPositive = 0;

  do {
    negative.push(currentNegative -= interval);
  } while (currentNegative > min);

  do {
    positive.push(currentPositive += interval);
  } while (currentPositive < max);

  return [].concat((0, _toConsumableArray2["default"])(negative.reverse()), [0], (0, _toConsumableArray2["default"])(positive));
}

function getValueAxisLabelFromMin(min, max, interval) {
  var label = [min],
      currentValue = min;

  do {
    label.push(currentValue += interval);
  } while (currentValue < max);

  return label;
}

function getAfterFormatterLabel(label, formatter) {
  if (!formatter) return label;
  if (typeof formatter === 'string') label = label.map(function (l) {
    return formatter.replace('{value}', l);
  });
  if (typeof formatter === 'function') label = label.map(function (value, index) {
    return formatter({
      value: value,
      index: index
    });
  });
  return label;
}

function calcLabelAxisLabelData(labelAxis) {
  return labelAxis.map(function (axis) {
    var data = axis.data,
        formatter = axis.axisLabel.formatter;
    return _objectSpread({}, axis, {
      label: getAfterFormatterLabel(data, formatter)
    });
  });
}

function getValueInterval(min, max, axis) {
  var interval = axis.interval,
      minInterval = axis.minInterval,
      maxInterval = axis.maxInterval,
      splitNumber = axis.splitNumber,
      axisType = axis.axis;
  var config = axisConfig[axisType + 'AxisConfig'];
  if (typeof interval !== 'number') interval = config.interval;
  if (typeof minInterval !== 'number') minInterval = config.minInterval;
  if (typeof maxInterval !== 'number') maxInterval = config.maxInterval;
  if (typeof splitNumber !== 'number') splitNumber = config.splitNumber;
  if (typeof interval === 'number') return interval;
  var valueInterval = parseInt((max - min) / (splitNumber - 1));
  if (valueInterval.toString().length > 1) valueInterval = parseInt(valueInterval.toString().replace(/\d$/, '0'));
  if (valueInterval === 0) valueInterval = 1;
  if (typeof minInterval === 'number' && valueInterval < minInterval) return minInterval;
  if (typeof maxInterval === 'number' && valueInterval > maxInterval) return maxInterval;
  return valueInterval;
}

function setAxisPosition(allAxis) {
  var xAxis = allAxis.filter(function (_ref14) {
    var axis = _ref14.axis;
    return axis === 'x';
  });
  var yAxis = allAxis.filter(function (_ref15) {
    var axis = _ref15.axis;
    return axis === 'y';
  });
  if (xAxis[0] && !xAxis[0].position) xAxis[0].position = _config.xAxisConfig.position;

  if (xAxis[1] && !xAxis[1].position) {
    xAxis[1].position = xAxis[0].position === 'bottom' ? 'top' : 'bottom';
  }

  if (yAxis[0] && !yAxis[0].position) yAxis[0].position = _config.yAxisConfig.position;

  if (yAxis[1] && !yAxis[1].position) {
    yAxis[1].position = yAxis[0].position === 'left' ? 'right' : 'left';
  }

  return [].concat((0, _toConsumableArray2["default"])(xAxis), (0, _toConsumableArray2["default"])(yAxis));
}

function calcAxisLinePosition(allAxis, chart) {
  var _chart$gridArea = chart.gridArea,
      x = _chart$gridArea.x,
      y = _chart$gridArea.y,
      w = _chart$gridArea.w,
      h = _chart$gridArea.h;
  allAxis = allAxis.map(function (axis) {
    var position = axis.position;
    var linePosition = [];

    if (position === 'left') {
      linePosition = [[x, y], [x, y + h]].reverse();
    } else if (position === 'right') {
      linePosition = [[x + w, y], [x + w, y + h]].reverse();
    } else if (position === 'top') {
      linePosition = [[x, y], [x + w, y]];
    } else if (position === 'bottom') {
      linePosition = [[x, y + h], [x + w, y + h]];
    }

    return _objectSpread({}, axis, {
      linePosition: linePosition
    });
  });
  return allAxis;
}

function calcAxisTickPosition(allAxis, chart) {
  return allAxis.map(function (axisItem) {
    var axis = axisItem.axis,
        linePosition = axisItem.linePosition,
        position = axisItem.position,
        label = axisItem.label,
        boundaryGap = axisItem.boundaryGap;
    if (typeof boundaryGap !== 'boolean') boundaryGap = axisConfig[axis + 'AxisConfig'].boundaryGap;
    var labelNum = label.length;

    var _linePosition = (0, _slicedToArray2["default"])(linePosition, 2),
        _linePosition$ = (0, _slicedToArray2["default"])(_linePosition[0], 2),
        startX = _linePosition$[0],
        startY = _linePosition$[1],
        _linePosition$2 = (0, _slicedToArray2["default"])(_linePosition[1], 2),
        endX = _linePosition$2[0],
        endY = _linePosition$2[1];

    var gapLength = axis === 'x' ? endX - startX : endY - startY;
    var gap = gapLength / (boundaryGap ? labelNum : labelNum - 1);
    var tickPosition = new Array(labelNum).fill(0).map(function (foo, i) {
      if (axis === 'x') {
        return [startX + gap * (boundaryGap ? i + 0.5 : i), startY];
      }

      return [startX, startY + gap * (boundaryGap ? i + 0.5 : i)];
    });
    var tickLinePosition = getTickLinePosition(axis, boundaryGap, position, tickPosition, gap);
    return _objectSpread({}, axisItem, {
      tickPosition: tickPosition,
      tickLinePosition: tickLinePosition,
      tickGap: gap
    });
  });
}

function getTickLinePosition(axisType, boundaryGap, position, tickPosition, gap) {
  var index = axisType === 'x' ? 1 : 0;
  var plus = 5;
  if (axisType === 'x' && position === 'top') plus = -5;
  if (axisType === 'y' && position === 'left') plus = -5;
  var tickLinePosition = tickPosition.map(function (lineStart) {
    var lineEnd = (0, _util2.deepClone)(lineStart);
    lineEnd[index] += plus;
    return [(0, _util2.deepClone)(lineStart), lineEnd];
  });
  if (!boundaryGap) return tickLinePosition;
  index = axisType === 'x' ? 0 : 1;
  plus = gap / 2;
  tickLinePosition.forEach(function (_ref16) {
    var _ref17 = (0, _slicedToArray2["default"])(_ref16, 2),
        lineStart = _ref17[0],
        lineEnd = _ref17[1];

    lineStart[index] += plus;
    lineEnd[index] += plus;
  });
  return tickLinePosition;
}

function calcAxisNamePosition(allAxis, chart) {
  return allAxis.map(function (axisItem) {
    var nameGap = axisItem.nameGap,
        nameLocation = axisItem.nameLocation,
        position = axisItem.position,
        linePosition = axisItem.linePosition;

    var _linePosition2 = (0, _slicedToArray2["default"])(linePosition, 2),
        lineStart = _linePosition2[0],
        lineEnd = _linePosition2[1];

    var namePosition = (0, _toConsumableArray2["default"])(lineStart);
    if (nameLocation === 'end') namePosition = (0, _toConsumableArray2["default"])(lineEnd);

    if (nameLocation === 'center') {
      namePosition[0] = (lineStart[0] + lineEnd[0]) / 2;
      namePosition[1] = (lineStart[1] + lineEnd[1]) / 2;
    }

    var index = 0;
    if (position === 'top' && nameLocation === 'center') index = 1;
    if (position === 'bottom' && nameLocation === 'center') index = 1;
    if (position === 'left' && nameLocation !== 'center') index = 1;
    if (position === 'right' && nameLocation !== 'center') index = 1;
    var plus = nameGap;
    if (position === 'top' && nameLocation !== 'end') plus *= -1;
    if (position === 'left' && nameLocation !== 'start') plus *= -1;
    if (position === 'bottom' && nameLocation === 'start') plus *= -1;
    if (position === 'right' && nameLocation === 'end') plus *= -1;
    namePosition[index] += plus;
    return _objectSpread({}, axisItem, {
      namePosition: namePosition
    });
  });
}

function calcSplitLinePosition(allAxis, chart) {
  var _chart$gridArea2 = chart.gridArea,
      w = _chart$gridArea2.w,
      h = _chart$gridArea2.h;
  return allAxis.map(function (axisItem) {
    var tickLinePosition = axisItem.tickLinePosition,
        position = axisItem.position,
        boundaryGap = axisItem.boundaryGap;
    var index = 0,
        plus = w;
    if (position === 'top' || position === 'bottom') index = 1;
    if (position === 'top' || position === 'bottom') plus = h;
    if (position === 'right' || position === 'bottom') plus *= -1;
    var splitLinePosition = tickLinePosition.map(function (_ref18) {
      var _ref19 = (0, _slicedToArray2["default"])(_ref18, 1),
          startPoint = _ref19[0];

      var endPoint = (0, _toConsumableArray2["default"])(startPoint);
      endPoint[index] += plus;
      return [(0, _toConsumableArray2["default"])(startPoint), endPoint];
    });
    if (!boundaryGap) splitLinePosition.shift();
    return _objectSpread({}, axisItem, {
      splitLinePosition: splitLinePosition
    });
  });
}

function getLineConfig(axisItem) {
  var animationCurve = axisItem.animationCurve,
      animationFrame = axisItem.animationFrame,
      rLevel = axisItem.rLevel;
  return [{
    name: 'polyline',
    index: rLevel,
    visible: axisItem.axisLine.show,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: getLineShape(axisItem),
    style: getLineStyle(axisItem)
  }];
}

function getLineShape(axisItem) {
  var linePosition = axisItem.linePosition;
  return {
    points: linePosition
  };
}

function getLineStyle(axisItem) {
  return axisItem.axisLine.style;
}

function getTickConfig(axisItem) {
  var animationCurve = axisItem.animationCurve,
      animationFrame = axisItem.animationFrame,
      rLevel = axisItem.rLevel;
  var shapes = getTickShapes(axisItem);
  var style = getTickStyle(axisItem);
  return shapes.map(function (shape) {
    return {
      name: 'polyline',
      index: rLevel,
      visible: axisItem.axisTick.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: style
    };
  });
}

function getTickShapes(axisItem) {
  var tickLinePosition = axisItem.tickLinePosition;
  return tickLinePosition.map(function (points) {
    return {
      points: points
    };
  });
}

function getTickStyle(axisItem) {
  return axisItem.axisTick.style;
}

function getLabelConfig(axisItem) {
  var animationCurve = axisItem.animationCurve,
      animationFrame = axisItem.animationFrame,
      rLevel = axisItem.rLevel;
  var shapes = getLabelShapes(axisItem);
  var styles = getLabelStyle(axisItem, shapes);
  return shapes.map(function (shape, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: axisItem.axisLabel.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: styles[i],
      setGraphCenter: function setGraphCenter() {
        return void 0;
      }
    };
  });
}

function getLabelShapes(axisItem) {
  var label = axisItem.label,
      tickPosition = axisItem.tickPosition,
      position = axisItem.position;
  return tickPosition.map(function (point, i) {
    return {
      position: getLabelRealPosition(point, position),
      content: label[i].toString()
    };
  });
}

function getLabelRealPosition(points, position) {
  var index = 0,
      plus = 10;
  if (position === 'top' || position === 'bottom') index = 1;
  if (position === 'top' || position === 'left') plus = -10;
  points = (0, _util2.deepClone)(points);
  points[index] += plus;
  return points;
}

function getLabelStyle(axisItem, shapes) {
  var position = axisItem.position;
  var style = axisItem.axisLabel.style;
  var align = getAxisLabelRealAlign(position);
  style = (0, _util.deepMerge)(align, style);
  var styles = shapes.map(function (_ref20) {
    var position = _ref20.position;
    return _objectSpread({}, style, {
      graphCenter: position
    });
  });
  return styles;
}

function getAxisLabelRealAlign(position) {
  if (position === 'left') return {
    textAlign: 'right',
    textBaseline: 'middle'
  };
  if (position === 'right') return {
    textAlign: 'left',
    textBaseline: 'middle'
  };
  if (position === 'top') return {
    textAlign: 'center',
    textBaseline: 'bottom'
  };
  if (position === 'bottom') return {
    textAlign: 'center',
    textBaseline: 'top'
  };
}

function getNameConfig(axisItem) {
  var animationCurve = axisItem.animationCurve,
      animationFrame = axisItem.animationFrame,
      rLevel = axisItem.rLevel;
  return [{
    name: 'text',
    index: rLevel,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: getNameShape(axisItem),
    style: getNameStyle(axisItem)
  }];
}

function getNameShape(axisItem) {
  var name = axisItem.name,
      namePosition = axisItem.namePosition;
  return {
    content: name,
    position: namePosition
  };
}

function getNameStyle(axisItem) {
  var nameLocation = axisItem.nameLocation,
      position = axisItem.position,
      style = axisItem.nameTextStyle;
  var align = getNameRealAlign(position, nameLocation);
  return (0, _util.deepMerge)(align, style);
}

function getNameRealAlign(position, location) {
  if (position === 'top' && location === 'start' || position === 'bottom' && location === 'start' || position === 'left' && location === 'center') return {
    textAlign: 'right',
    textBaseline: 'middle'
  };
  if (position === 'top' && location === 'end' || position === 'bottom' && location === 'end' || position === 'right' && location === 'center') return {
    textAlign: 'left',
    textBaseline: 'middle'
  };
  if (position === 'top' && location === 'center' || position === 'left' && location === 'end' || position === 'right' && location === 'end') return {
    textAlign: 'center',
    textBaseline: 'bottom'
  };
  if (position === 'bottom' && location === 'center' || position === 'left' && location === 'start' || position === 'right' && location === 'start') return {
    textAlign: 'center',
    textBaseline: 'top'
  };
}

function getSplitLineConfig(axisItem) {
  var animationCurve = axisItem.animationCurve,
      animationFrame = axisItem.animationFrame,
      rLevel = axisItem.rLevel;
  var shapes = getSplitLineShapes(axisItem);
  var style = getSplitLineStyle(axisItem);
  return shapes.map(function (shape) {
    return {
      name: 'polyline',
      index: rLevel,
      visible: axisItem.splitLine.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: style
    };
  });
}

function getSplitLineShapes(axisItem) {
  var splitLinePosition = axisItem.splitLinePosition;
  return splitLinePosition.map(function (points) {
    return {
      points: points
    };
  });
}

function getSplitLineStyle(axisItem) {
  return axisItem.splitLine.style;
}
},{"../class/updater.class":3,"../config":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54}],17:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bar = bar;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _updater = require("../class/updater.class");

var _config = require("../config");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _util2 = require("../util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function bar(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var xAxis = option.xAxis,
      yAxis = option.yAxis,
      series = option.series;
  var bars = [];

  if (xAxis && yAxis && series) {
    bars = (0, _util2.initNeedSeries)(series, _config.barConfig, 'bar');
    bars = setBarAxis(bars, chart);
    bars = setBarPositionData(bars, chart);
    bars = calcBarsPosition(bars, chart);
  }

  (0, _updater.doUpdate)({
    chart: chart,
    series: bars.slice(-1),
    key: 'backgroundBar',
    getGraphConfig: getBackgroundBarConfig
  });
  bars.reverse();
  (0, _updater.doUpdate)({
    chart: chart,
    series: bars,
    key: 'bar',
    getGraphConfig: getBarConfig,
    getStartGraphConfig: getStartBarConfig,
    beforeUpdate: beforeUpdateBar
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: bars,
    key: 'barLabel',
    getGraphConfig: getLabelConfig
  });
}

function setBarAxis(bars, chart) {
  var axisData = chart.axisData;
  bars.forEach(function (bar) {
    var xAxisIndex = bar.xAxisIndex,
        yAxisIndex = bar.yAxisIndex;
    if (typeof xAxisIndex !== 'number') xAxisIndex = 0;
    if (typeof yAxisIndex !== 'number') yAxisIndex = 0;
    var xAxis = axisData.find(function (_ref) {
      var axis = _ref.axis,
          index = _ref.index;
      return "".concat(axis).concat(index) === "x".concat(xAxisIndex);
    });
    var yAxis = axisData.find(function (_ref2) {
      var axis = _ref2.axis,
          index = _ref2.index;
      return "".concat(axis).concat(index) === "y".concat(yAxisIndex);
    });
    var axis = [xAxis, yAxis];
    var valueAxisIndex = axis.findIndex(function (_ref3) {
      var data = _ref3.data;
      return data === 'value';
    });
    bar.valueAxis = axis[valueAxisIndex];
    bar.labelAxis = axis[1 - valueAxisIndex];
  });
  return bars;
}

function setBarPositionData(bars, chart) {
  var labelBarGroup = groupBarByLabelAxis(bars);
  labelBarGroup.forEach(function (group) {
    setBarIndex(group);
    setBarNum(group);
    setBarCategoryWidth(group, chart);
    setBarWidthAndGap(group);
    setBarAllWidthAndGap(group);
  });
  return bars;
}

function setBarIndex(bars) {
  var stacks = getBarStack(bars);
  stacks = stacks.map(function (stack) {
    return {
      stack: stack,
      index: -1
    };
  });
  var currentIndex = 0;
  bars.forEach(function (bar) {
    var stack = bar.stack;

    if (!stack) {
      bar.barIndex = currentIndex;
      currentIndex++;
    } else {
      var stackData = stacks.find(function (_ref4) {
        var s = _ref4.stack;
        return s === stack;
      });

      if (stackData.index === -1) {
        stackData.index = currentIndex;
        currentIndex++;
      }

      bar.barIndex = stackData.index;
    }
  });
}

function groupBarByLabelAxis(bars) {
  var labelAxis = bars.map(function (_ref5) {
    var _ref5$labelAxis = _ref5.labelAxis,
        axis = _ref5$labelAxis.axis,
        index = _ref5$labelAxis.index;
    return axis + index;
  });
  labelAxis = (0, _toConsumableArray2["default"])(new Set(labelAxis));
  return labelAxis.map(function (axisIndex) {
    return bars.filter(function (_ref6) {
      var _ref6$labelAxis = _ref6.labelAxis,
          axis = _ref6$labelAxis.axis,
          index = _ref6$labelAxis.index;
      return axis + index === axisIndex;
    });
  });
}

function getBarStack(bars) {
  var stacks = [];
  bars.forEach(function (_ref7) {
    var stack = _ref7.stack;
    if (stack) stacks.push(stack);
  });
  return (0, _toConsumableArray2["default"])(new Set(stacks));
}

function setBarNum(bars) {
  var barNum = (0, _toConsumableArray2["default"])(new Set(bars.map(function (_ref8) {
    var barIndex = _ref8.barIndex;
    return barIndex;
  }))).length;
  bars.forEach(function (bar) {
    return bar.barNum = barNum;
  });
}

function setBarCategoryWidth(bars) {
  var lastBar = bars.slice(-1)[0];
  var barCategoryGap = lastBar.barCategoryGap,
      tickGap = lastBar.labelAxis.tickGap;
  var barCategoryWidth = 0;

  if (typeof barCategoryGap === 'number') {
    barCategoryWidth = barCategoryGap;
  } else {
    barCategoryWidth = (1 - parseInt(barCategoryGap) / 100) * tickGap;
  }

  bars.forEach(function (bar) {
    return bar.barCategoryWidth = barCategoryWidth;
  });
}

function setBarWidthAndGap(bars) {
  var _bars$slice$ = bars.slice(-1)[0],
      barCategoryWidth = _bars$slice$.barCategoryWidth,
      barWidth = _bars$slice$.barWidth,
      barGap = _bars$slice$.barGap,
      barNum = _bars$slice$.barNum;
  var widthAndGap = [];

  if (typeof barWidth === 'number' || barWidth !== 'auto') {
    widthAndGap = getBarWidthAndGapWithPercentOrNumber(barCategoryWidth, barWidth, barGap, barNum);
  } else if (barWidth === 'auto') {
    widthAndGap = getBarWidthAndGapWidthAuto(barCategoryWidth, barWidth, barGap, barNum);
  }

  var _widthAndGap = widthAndGap,
      _widthAndGap2 = (0, _slicedToArray2["default"])(_widthAndGap, 2),
      width = _widthAndGap2[0],
      gap = _widthAndGap2[1];

  bars.forEach(function (bar) {
    bar.barWidth = width;
    bar.barGap = gap;
  });
}

function getBarWidthAndGapWithPercentOrNumber(barCategoryWidth, barWidth, barGap) {
  var width = 0,
      gap = 0;

  if (typeof barWidth === 'number') {
    width = barWidth;
  } else {
    width = parseInt(barWidth) / 100 * barCategoryWidth;
  }

  if (typeof barGap === 'number') {
    gap = barGap;
  } else {
    gap = parseInt(barGap) / 100 * width;
  }

  return [width, gap];
}

function getBarWidthAndGapWidthAuto(barCategoryWidth, barWidth, barGap, barNum) {
  var width = 0,
      gap = 0;
  var barItemWidth = barCategoryWidth / barNum;

  if (typeof barGap === 'number') {
    gap = barGap;
    width = barItemWidth - gap;
  } else {
    var percent = 10 + parseInt(barGap) / 10;

    if (percent === 0) {
      width = barItemWidth * 2;
      gap = -width;
    } else {
      width = barItemWidth / percent * 10;
      gap = barItemWidth - width;
    }
  }

  return [width, gap];
}

function setBarAllWidthAndGap(bars) {
  var _bars$slice$2 = bars.slice(-1)[0],
      barGap = _bars$slice$2.barGap,
      barWidth = _bars$slice$2.barWidth,
      barNum = _bars$slice$2.barNum;
  var barAllWidthAndGap = (barGap + barWidth) * barNum - barGap;
  bars.forEach(function (bar) {
    return bar.barAllWidthAndGap = barAllWidthAndGap;
  });
}

function calcBarsPosition(bars, chart) {
  bars = calcBarValueAxisCoordinate(bars);
  bars = calcBarLabelAxisCoordinate(bars);
  bars = eliminateNullBarLabelAxis(bars);
  bars = keepSameNumBetweenBarAndData(bars);
  return bars;
}

function calcBarLabelAxisCoordinate(bars) {
  return bars.map(function (bar) {
    var labelAxis = bar.labelAxis,
        barAllWidthAndGap = bar.barAllWidthAndGap,
        barGap = bar.barGap,
        barWidth = bar.barWidth,
        barIndex = bar.barIndex;
    var tickGap = labelAxis.tickGap,
        tickPosition = labelAxis.tickPosition,
        axis = labelAxis.axis;
    var coordinateIndex = axis === 'x' ? 0 : 1;
    var barLabelAxisPos = tickPosition.map(function (tick, i) {
      var barCategoryStartPos = tickPosition[i][coordinateIndex] - tickGap / 2;
      var barItemsStartPos = barCategoryStartPos + (tickGap - barAllWidthAndGap) / 2;
      return barItemsStartPos + (barIndex + 0.5) * barWidth + barIndex * barGap;
    });
    return _objectSpread({}, bar, {
      barLabelAxisPos: barLabelAxisPos
    });
  });
}

function calcBarValueAxisCoordinate(bars) {
  return bars.map(function (bar) {
    var data = (0, _util2.mergeSameStackData)(bar, bars);
    data = eliminateNonNumberData(bar, data);
    var _bar$valueAxis = bar.valueAxis,
        axis = _bar$valueAxis.axis,
        minValue = _bar$valueAxis.minValue,
        maxValue = _bar$valueAxis.maxValue,
        linePosition = _bar$valueAxis.linePosition;
    var startPos = getValuePos(minValue, maxValue, minValue < 0 ? 0 : minValue, linePosition, axis);
    var endPos = data.map(function (v) {
      return getValuePos(minValue, maxValue, v, linePosition, axis);
    });
    var barValueAxisPos = endPos.map(function (p) {
      return [startPos, p];
    });
    return _objectSpread({}, bar, {
      barValueAxisPos: barValueAxisPos
    });
  });
}

function eliminateNonNumberData(barItem, barData) {
  var data = barItem.data;
  return barData.map(function (v, i) {
    return typeof data[i] === 'number' ? v : null;
  }).filter(function (d) {
    return d !== null;
  });
}

function eliminateNullBarLabelAxis(bars) {
  return bars.map(function (bar) {
    var barLabelAxisPos = bar.barLabelAxisPos,
        data = bar.data;
    data.forEach(function (d, i) {
      if (typeof d === 'number') return;
      barLabelAxisPos[i] = null;
    });
    return _objectSpread({}, bar, {
      barLabelAxisPos: barLabelAxisPos.filter(function (p) {
        return p !== null;
      })
    });
  });
}

function keepSameNumBetweenBarAndData(bars) {
  bars.forEach(function (bar) {
    var data = bar.data,
        barLabelAxisPos = bar.barLabelAxisPos,
        barValueAxisPos = bar.barValueAxisPos;
    var dataNum = data.filter(function (d) {
      return typeof d === 'number';
    }).length;
    var axisPosNum = barLabelAxisPos.length;

    if (axisPosNum > dataNum) {
      barLabelAxisPos.splice(dataNum);
      barValueAxisPos.splice(dataNum);
    }
  });
  return bars;
}

function getValuePos(min, max, value, linePosition, axis) {
  if (typeof value !== 'number') return null;
  var valueMinus = max - min;
  var coordinateIndex = axis === 'x' ? 0 : 1;
  var posMinus = linePosition[1][coordinateIndex] - linePosition[0][coordinateIndex];
  var percent = (value - min) / valueMinus;
  if (valueMinus === 0) percent = 0;
  var pos = percent * posMinus;
  return pos + linePosition[0][coordinateIndex];
}

function getBackgroundBarConfig(barItem) {
  var animationCurve = barItem.animationCurve,
      animationFrame = barItem.animationFrame,
      rLevel = barItem.rLevel;
  var shapes = getBackgroundBarShapes(barItem);
  var style = getBackgroundBarStyle(barItem);
  return shapes.map(function (shape) {
    return {
      name: 'rect',
      index: rLevel,
      visible: barItem.backgroundBar.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: style
    };
  });
}

function getBackgroundBarShapes(barItem) {
  var labelAxis = barItem.labelAxis,
      valueAxis = barItem.valueAxis;
  var tickPosition = labelAxis.tickPosition;
  var axis = valueAxis.axis,
      linePosition = valueAxis.linePosition;
  var width = getBackgroundBarWidth(barItem);
  var haltWidth = width / 2;
  var posIndex = axis === 'x' ? 0 : 1;
  var centerPos = tickPosition.map(function (p) {
    return p[1 - posIndex];
  });
  var _ref9 = [linePosition[0][posIndex], linePosition[1][posIndex]],
      start = _ref9[0],
      end = _ref9[1];
  return centerPos.map(function (center) {
    if (axis === 'x') {
      return {
        x: start,
        y: center - haltWidth,
        w: end - start,
        h: width
      };
    } else {
      return {
        x: center - haltWidth,
        y: end,
        w: width,
        h: start - end
      };
    }
  });
}

function getBackgroundBarWidth(barItem) {
  var barAllWidthAndGap = barItem.barAllWidthAndGap,
      barCategoryWidth = barItem.barCategoryWidth,
      backgroundBar = barItem.backgroundBar;
  var width = backgroundBar.width;
  if (typeof width === 'number') return width;
  if (width === 'auto') return barAllWidthAndGap;
  return parseInt(width) / 100 * barCategoryWidth;
}

function getBackgroundBarStyle(barItem) {
  return barItem.backgroundBar.style;
}

function getBarConfig(barItem) {
  var barLabelAxisPos = barItem.barLabelAxisPos,
      animationCurve = barItem.animationCurve,
      animationFrame = barItem.animationFrame,
      rLevel = barItem.rLevel;
  var name = getBarName(barItem);
  return barLabelAxisPos.map(function (foo, i) {
    return {
      name: name,
      index: rLevel,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getBarShape(barItem, i),
      style: getBarStyle(barItem, i)
    };
  });
}

function getBarName(barItem) {
  var shapeType = barItem.shapeType;
  if (shapeType === 'leftEchelon' || shapeType === 'rightEchelon') return 'polyline';
  return 'rect';
}

function getBarShape(barItem, i) {
  var shapeType = barItem.shapeType;

  if (shapeType === 'leftEchelon') {
    return getLeftEchelonShape(barItem, i);
  } else if (shapeType === 'rightEchelon') {
    return getRightEchelonShape(barItem, i);
  } else {
    return getNormalBarShape(barItem, i);
  }
}

function getLeftEchelonShape(barItem, i) {
  var barValueAxisPos = barItem.barValueAxisPos,
      barLabelAxisPos = barItem.barLabelAxisPos,
      barWidth = barItem.barWidth,
      echelonOffset = barItem.echelonOffset;

  var _barValueAxisPos$i = (0, _slicedToArray2["default"])(barValueAxisPos[i], 2),
      start = _barValueAxisPos$i[0],
      end = _barValueAxisPos$i[1];

  var labelAxisPos = barLabelAxisPos[i];
  var halfWidth = barWidth / 2;
  var valueAxis = barItem.valueAxis.axis;
  var points = [];

  if (valueAxis === 'x') {
    points[0] = [end, labelAxisPos - halfWidth];
    points[1] = [end, labelAxisPos + halfWidth];
    points[2] = [start, labelAxisPos + halfWidth];
    points[3] = [start + echelonOffset, labelAxisPos - halfWidth];
    if (end - start < echelonOffset) points.splice(3, 1);
  } else {
    points[0] = [labelAxisPos - halfWidth, end];
    points[1] = [labelAxisPos + halfWidth, end];
    points[2] = [labelAxisPos + halfWidth, start];
    points[3] = [labelAxisPos - halfWidth, start - echelonOffset];
    if (start - end < echelonOffset) points.splice(3, 1);
  }

  return {
    points: points,
    close: true
  };
}

function getRightEchelonShape(barItem, i) {
  var barValueAxisPos = barItem.barValueAxisPos,
      barLabelAxisPos = barItem.barLabelAxisPos,
      barWidth = barItem.barWidth,
      echelonOffset = barItem.echelonOffset;

  var _barValueAxisPos$i2 = (0, _slicedToArray2["default"])(barValueAxisPos[i], 2),
      start = _barValueAxisPos$i2[0],
      end = _barValueAxisPos$i2[1];

  var labelAxisPos = barLabelAxisPos[i];
  var halfWidth = barWidth / 2;
  var valueAxis = barItem.valueAxis.axis;
  var points = [];

  if (valueAxis === 'x') {
    points[0] = [end, labelAxisPos + halfWidth];
    points[1] = [end, labelAxisPos - halfWidth];
    points[2] = [start, labelAxisPos - halfWidth];
    points[3] = [start + echelonOffset, labelAxisPos + halfWidth];
    if (end - start < echelonOffset) points.splice(2, 1);
  } else {
    points[0] = [labelAxisPos + halfWidth, end];
    points[1] = [labelAxisPos - halfWidth, end];
    points[2] = [labelAxisPos - halfWidth, start];
    points[3] = [labelAxisPos + halfWidth, start - echelonOffset];
    if (start - end < echelonOffset) points.splice(2, 1);
  }

  return {
    points: points,
    close: true
  };
}

function getNormalBarShape(barItem, i) {
  var barValueAxisPos = barItem.barValueAxisPos,
      barLabelAxisPos = barItem.barLabelAxisPos,
      barWidth = barItem.barWidth;

  var _barValueAxisPos$i3 = (0, _slicedToArray2["default"])(barValueAxisPos[i], 2),
      start = _barValueAxisPos$i3[0],
      end = _barValueAxisPos$i3[1];

  var labelAxisPos = barLabelAxisPos[i];
  var valueAxis = barItem.valueAxis.axis;
  var shape = {};

  if (valueAxis === 'x') {
    shape.x = start;
    shape.y = labelAxisPos - barWidth / 2;
    shape.w = end - start;
    shape.h = barWidth;
  } else {
    shape.x = labelAxisPos - barWidth / 2;
    shape.y = end;
    shape.w = barWidth;
    shape.h = start - end;
  }

  return shape;
}

function getBarStyle(barItem, i) {
  var barStyle = barItem.barStyle,
      gradient = barItem.gradient,
      color = barItem.color;
  var fillColor = [barStyle.fill || color];
  var gradientColor = (0, _util2.deepMerge)(fillColor, gradient.color);
  if (gradientColor.length === 1) gradientColor.push(gradientColor[0]);
  var gradientParams = getGradientParams(barItem, i);
  return (0, _util2.deepMerge)({
    gradientColor: gradientColor,
    gradientParams: gradientParams,
    gradientType: 'linear',
    gradientWith: 'fill'
  }, barStyle);
}

function getGradientParams(barItem, i) {
  var barValueAxisPos = barItem.barValueAxisPos,
      barLabelAxisPos = barItem.barLabelAxisPos,
      data = barItem.data;
  var _barItem$valueAxis = barItem.valueAxis,
      linePosition = _barItem$valueAxis.linePosition,
      axis = _barItem$valueAxis.axis;

  var _barValueAxisPos$i4 = (0, _slicedToArray2["default"])(barValueAxisPos[i], 2),
      start = _barValueAxisPos$i4[0],
      end = _barValueAxisPos$i4[1];

  var labelAxisPos = barLabelAxisPos[i];
  var value = data[i];

  var _linePosition = (0, _slicedToArray2["default"])(linePosition, 2),
      lineStart = _linePosition[0],
      lineEnd = _linePosition[1];

  var valueAxisIndex = axis === 'x' ? 0 : 1;
  var endPos = end;

  if (!barItem.gradient.local) {
    endPos = value < 0 ? lineStart[valueAxisIndex] : lineEnd[valueAxisIndex];
  }

  if (axis === 'y') {
    return [labelAxisPos, endPos, labelAxisPos, start];
  } else {
    return [endPos, labelAxisPos, start, labelAxisPos];
  }
}

function getStartBarConfig(barItem) {
  var configs = getBarConfig(barItem);
  var shapeType = barItem.shapeType;
  configs.forEach(function (config) {
    var shape = config.shape;

    if (shapeType === 'leftEchelon') {
      shape = getStartLeftEchelonShape(shape, barItem);
    } else if (shapeType === 'rightEchelon') {
      shape = getStartRightEchelonShape(shape, barItem);
    } else {
      shape = getStartNormalBarShape(shape, barItem);
    }

    config.shape = shape;
  });
  return configs;
}

function getStartLeftEchelonShape(shape, barItem) {
  var axis = barItem.valueAxis.axis;
  shape = (0, _util.deepClone)(shape);
  var _shape = shape,
      points = _shape.points;
  var index = axis === 'x' ? 0 : 1;
  var start = points[2][index];
  points.forEach(function (point) {
    return point[index] = start;
  });
  return shape;
}

function getStartRightEchelonShape(shape, barItem) {
  var axis = barItem.valueAxis.axis;
  shape = (0, _util.deepClone)(shape);
  var _shape2 = shape,
      points = _shape2.points;
  var index = axis === 'x' ? 0 : 1;
  var start = points[2][index];
  points.forEach(function (point) {
    return point[index] = start;
  });
  return shape;
}

function getStartNormalBarShape(shape, barItem) {
  var axis = barItem.valueAxis.axis;
  var x = shape.x,
      y = shape.y,
      w = shape.w,
      h = shape.h;

  if (axis === 'x') {
    w = 0;
  } else {
    y = y + h;
    h = 0;
  }

  return {
    x: x,
    y: y,
    w: w,
    h: h
  };
}

function beforeUpdateBar(graphs, barItem, i, updater) {
  var render = updater.chart.render;
  var name = getBarName(barItem);

  if (graphs[i] && graphs[i][0].name !== name) {
    graphs[i].forEach(function (g) {
      return render.delGraph(g);
    });
    graphs[i] = null;
  }
}

function getLabelConfig(barItem) {
  var animationCurve = barItem.animationCurve,
      animationFrame = barItem.animationFrame,
      rLevel = barItem.rLevel;
  var shapes = getLabelShapes(barItem);
  var style = getLabelStyle(barItem);
  return shapes.map(function (shape) {
    return {
      name: 'text',
      index: rLevel,
      visible: barItem.label.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: style
    };
  });
}

function getLabelShapes(barItem) {
  var contents = getFormatterLabels(barItem);
  var position = getLabelsPosition(barItem);
  return position.map(function (pos, i) {
    return {
      position: pos,
      content: contents[i]
    };
  });
}

function getFormatterLabels(barItem) {
  var data = barItem.data,
      label = barItem.label;
  var formatter = label.formatter;
  data = data.filter(function (d) {
    return typeof d === 'number';
  }).map(function (d) {
    return d.toString();
  });
  if (!formatter) return data;
  var type = (0, _typeof2["default"])(formatter);
  if (type === 'string') return data.map(function (d) {
    return formatter.replace('{value}', d);
  });
  if (type === 'function') return data.map(function (d, i) {
    return formatter({
      value: d,
      index: i
    });
  });
  return data;
}

function getLabelsPosition(barItem) {
  var label = barItem.label,
      barValueAxisPos = barItem.barValueAxisPos,
      barLabelAxisPos = barItem.barLabelAxisPos;
  var position = label.position,
      offset = label.offset;
  var axis = barItem.valueAxis.axis;
  return barValueAxisPos.map(function (_ref10, i) {
    var _ref11 = (0, _slicedToArray2["default"])(_ref10, 2),
        start = _ref11[0],
        end = _ref11[1];

    var labelAxisPos = barLabelAxisPos[i];
    var pos = [end, labelAxisPos];

    if (position === 'bottom') {
      pos = [start, labelAxisPos];
    }

    if (position === 'center') {
      pos = [(start + end) / 2, labelAxisPos];
    }

    if (axis === 'y') pos.reverse();
    return getOffsetedPoint(pos, offset);
  });
}

function getOffsetedPoint(_ref12, _ref13) {
  var _ref14 = (0, _slicedToArray2["default"])(_ref12, 2),
      x = _ref14[0],
      y = _ref14[1];

  var _ref15 = (0, _slicedToArray2["default"])(_ref13, 2),
      ox = _ref15[0],
      oy = _ref15[1];

  return [x + ox, y + oy];
}

function getLabelStyle(barItem) {
  var color = barItem.color,
      style = barItem.label.style,
      gc = barItem.gradient.color;
  if (gc.length) color = gc[0];
  style = (0, _util2.deepMerge)({
    fill: color
  }, style);
  return style;
}
},{"../class/updater.class":3,"../config":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54}],18:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gauge = gauge;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _updater = require("../class/updater.class");

var _gauge = require("../config/gauge");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _util2 = require("../util");

var _color = require("@jiaminghi/color");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function gauge(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var series = option.series;
  if (!series) series = [];
  var gauges = (0, _util2.initNeedSeries)(series, _gauge.gaugeConfig, 'gauge');
  gauges = calcGaugesCenter(gauges, chart);
  gauges = calcGaugesRadius(gauges, chart);
  gauges = calcGaugesDataRadiusAndLineWidth(gauges, chart);
  gauges = calcGaugesDataAngles(gauges, chart);
  gauges = calcGaugesDataGradient(gauges, chart);
  gauges = calcGaugesAxisTickPosition(gauges, chart);
  gauges = calcGaugesLabelPositionAndAlign(gauges, chart);
  gauges = calcGaugesLabelData(gauges, chart);
  gauges = calcGaugesDetailsPosition(gauges, chart);
  gauges = calcGaugesDetailsContent(gauges, chart);
  (0, _updater.doUpdate)({
    chart: chart,
    series: gauges,
    key: 'gaugeAxisTick',
    getGraphConfig: getAxisTickConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: gauges,
    key: 'gaugeAxisLabel',
    getGraphConfig: getAxisLabelConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: gauges,
    key: 'gaugeBackgroundArc',
    getGraphConfig: getBackgroundArcConfig,
    getStartGraphConfig: getStartBackgroundArcConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: gauges,
    key: 'gaugeArc',
    getGraphConfig: getArcConfig,
    getStartGraphConfig: getStartArcConfig,
    beforeChange: beforeChangeArc
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: gauges,
    key: 'gaugePointer',
    getGraphConfig: getPointerConfig,
    getStartGraphConfig: getStartPointerConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: gauges,
    key: 'gaugeDetails',
    getGraphConfig: getDetailsConfig
  });
}

function calcGaugesCenter(gauges, chart) {
  var area = chart.render.area;
  gauges.forEach(function (gaugeItem) {
    var center = gaugeItem.center;
    center = center.map(function (pos, i) {
      if (typeof pos === 'number') return pos;
      return parseInt(pos) / 100 * area[i];
    });
    gaugeItem.center = center;
  });
  return gauges;
}

function calcGaugesRadius(gauges, chart) {
  var area = chart.render.area;
  var maxRadius = Math.min.apply(Math, (0, _toConsumableArray2["default"])(area)) / 2;
  gauges.forEach(function (gaugeItem) {
    var radius = gaugeItem.radius;

    if (typeof radius !== 'number') {
      radius = parseInt(radius) / 100 * maxRadius;
    }

    gaugeItem.radius = radius;
  });
  return gauges;
}

function calcGaugesDataRadiusAndLineWidth(gauges, chart) {
  var area = chart.render.area;
  var maxRadius = Math.min.apply(Math, (0, _toConsumableArray2["default"])(area)) / 2;
  gauges.forEach(function (gaugeItem) {
    var radius = gaugeItem.radius,
        data = gaugeItem.data,
        arcLineWidth = gaugeItem.arcLineWidth;
    data.forEach(function (item) {
      var arcRadius = item.radius,
          lineWidth = item.lineWidth;
      if (!arcRadius) arcRadius = radius;
      if (typeof arcRadius !== 'number') arcRadius = parseInt(arcRadius) / 100 * maxRadius;
      item.radius = arcRadius;
      if (!lineWidth) lineWidth = arcLineWidth;
      item.lineWidth = lineWidth;
    });
  });
  return gauges;
}

function calcGaugesDataAngles(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var startAngle = gaugeItem.startAngle,
        endAngle = gaugeItem.endAngle,
        data = gaugeItem.data,
        min = gaugeItem.min,
        max = gaugeItem.max;
    var angleMinus = endAngle - startAngle;
    var valueMinus = max - min;
    data.forEach(function (item) {
      var value = item.value;
      var itemAngle = Math.abs((value - min) / valueMinus * angleMinus);
      item.startAngle = startAngle;
      item.endAngle = startAngle + itemAngle;
    });
  });
  return gauges;
}

function calcGaugesDataGradient(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var data = gaugeItem.data;
    data.forEach(function (item) {
      var color = item.color,
          gradient = item.gradient;
      if (!gradient || !gradient.length) gradient = color;
      if (!(gradient instanceof Array)) gradient = [gradient];
      item.gradient = gradient;
    });
  });
  return gauges;
}

function calcGaugesAxisTickPosition(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var startAngle = gaugeItem.startAngle,
        endAngle = gaugeItem.endAngle,
        splitNum = gaugeItem.splitNum,
        center = gaugeItem.center,
        radius = gaugeItem.radius,
        arcLineWidth = gaugeItem.arcLineWidth,
        axisTick = gaugeItem.axisTick;
    var tickLength = axisTick.tickLength,
        lineWidth = axisTick.style.lineWidth;
    var angles = endAngle - startAngle;
    var outerRadius = radius - arcLineWidth / 2;
    var innerRadius = outerRadius - tickLength;
    var angleGap = angles / (splitNum - 1);
    var arcLength = 2 * Math.PI * radius * angles / (Math.PI * 2);
    var offset = Math.ceil(lineWidth / 2) / arcLength * angles;
    gaugeItem.tickAngles = [];
    gaugeItem.tickInnerRadius = [];
    gaugeItem.tickPosition = new Array(splitNum).fill(0).map(function (foo, i) {
      var angle = startAngle + angleGap * i;
      if (i === 0) angle += offset;
      if (i === splitNum - 1) angle -= offset;
      gaugeItem.tickAngles[i] = angle;
      gaugeItem.tickInnerRadius[i] = innerRadius;
      return [_util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([outerRadius, angle])), _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([innerRadius, angle]))];
    });
  });
  return gauges;
}

function calcGaugesLabelPositionAndAlign(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var center = gaugeItem.center,
        tickInnerRadius = gaugeItem.tickInnerRadius,
        tickAngles = gaugeItem.tickAngles,
        labelGap = gaugeItem.axisLabel.labelGap;
    var position = tickAngles.map(function (angle, i) {
      return _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([tickInnerRadius[i] - labelGap, tickAngles[i]]));
    });
    var align = position.map(function (_ref) {
      var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          x = _ref2[0],
          y = _ref2[1];

      return {
        textAlign: x > center[0] ? 'right' : 'left',
        textBaseline: y > center[1] ? 'bottom' : 'top'
      };
    });
    gaugeItem.labelPosition = position;
    gaugeItem.labelAlign = align;
  });
  return gauges;
}

function calcGaugesLabelData(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var axisLabel = gaugeItem.axisLabel,
        min = gaugeItem.min,
        max = gaugeItem.max,
        splitNum = gaugeItem.splitNum;
    var data = axisLabel.data,
        formatter = axisLabel.formatter;
    var valueGap = (max - min) / (splitNum - 1);
    var value = new Array(splitNum).fill(0).map(function (foo, i) {
      return parseInt(min + valueGap * i);
    });
    var formatterType = (0, _typeof2["default"])(formatter);
    data = (0, _util2.deepMerge)(value, data).map(function (v, i) {
      var label = v;

      if (formatterType === 'string') {
        label = formatter.replace('{value}', v);
      }

      if (formatterType === 'function') {
        label = formatter({
          value: v,
          index: i
        });
      }

      return label;
    });
    axisLabel.data = data;
  });
  return gauges;
}

function calcGaugesDetailsPosition(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var data = gaugeItem.data,
        details = gaugeItem.details,
        center = gaugeItem.center;
    var position = details.position,
        offset = details.offset;
    var detailsPosition = data.map(function (_ref3) {
      var startAngle = _ref3.startAngle,
          endAngle = _ref3.endAngle,
          radius = _ref3.radius;
      var point = null;

      if (position === 'center') {
        point = center;
      } else if (position === 'start') {
        point = _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([radius, startAngle]));
      } else if (position === 'end') {
        point = _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([radius, endAngle]));
      }

      return getOffsetedPoint(point, offset);
    });
    gaugeItem.detailsPosition = detailsPosition;
  });
  return gauges;
}

function calcGaugesDetailsContent(gauges, chart) {
  gauges.forEach(function (gaugeItem) {
    var data = gaugeItem.data,
        details = gaugeItem.details;
    var formatter = details.formatter;
    var formatterType = (0, _typeof2["default"])(formatter);
    var contents = data.map(function (dataItem) {
      var content = dataItem.value;

      if (formatterType === 'string') {
        content = formatter.replace('{value}', '{nt}');
        content = content.replace('{name}', dataItem.name);
      }

      if (formatterType === 'function') content = formatter(dataItem);
      return content.toString();
    });
    gaugeItem.detailsContent = contents;
  });
  return gauges;
}

function getOffsetedPoint(_ref4, _ref5) {
  var _ref6 = (0, _slicedToArray2["default"])(_ref4, 2),
      x = _ref6[0],
      y = _ref6[1];

  var _ref7 = (0, _slicedToArray2["default"])(_ref5, 2),
      ox = _ref7[0],
      oy = _ref7[1];

  return [x + ox, y + oy];
}

function getAxisTickConfig(gaugeItem) {
  var tickPosition = gaugeItem.tickPosition,
      animationCurve = gaugeItem.animationCurve,
      animationFrame = gaugeItem.animationFrame,
      rLevel = gaugeItem.rLevel;
  return tickPosition.map(function (foo, i) {
    return {
      name: 'polyline',
      index: rLevel,
      visible: gaugeItem.axisTick.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getAxisTickShape(gaugeItem, i),
      style: getAxisTickStyle(gaugeItem, i)
    };
  });
}

function getAxisTickShape(gaugeItem, i) {
  var tickPosition = gaugeItem.tickPosition;
  return {
    points: tickPosition[i]
  };
}

function getAxisTickStyle(gaugeItem, i) {
  var style = gaugeItem.axisTick.style;
  return style;
}

function getAxisLabelConfig(gaugeItem) {
  var labelPosition = gaugeItem.labelPosition,
      animationCurve = gaugeItem.animationCurve,
      animationFrame = gaugeItem.animationFrame,
      rLevel = gaugeItem.rLevel;
  return labelPosition.map(function (foo, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: gaugeItem.axisLabel.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getAxisLabelShape(gaugeItem, i),
      style: getAxisLabelStyle(gaugeItem, i)
    };
  });
}

function getAxisLabelShape(gaugeItem, i) {
  var labelPosition = gaugeItem.labelPosition,
      data = gaugeItem.axisLabel.data;
  return {
    content: data[i].toString(),
    position: labelPosition[i]
  };
}

function getAxisLabelStyle(gaugeItem, i) {
  var labelAlign = gaugeItem.labelAlign,
      axisLabel = gaugeItem.axisLabel;
  var style = axisLabel.style;
  return (0, _util2.deepMerge)(_objectSpread({}, labelAlign[i]), style);
}

function getBackgroundArcConfig(gaugeItem) {
  var animationCurve = gaugeItem.animationCurve,
      animationFrame = gaugeItem.animationFrame,
      rLevel = gaugeItem.rLevel;
  return [{
    name: 'arc',
    index: rLevel,
    visible: gaugeItem.backgroundArc.show,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: getGaugeBackgroundArcShape(gaugeItem),
    style: getGaugeBackgroundArcStyle(gaugeItem)
  }];
}

function getGaugeBackgroundArcShape(gaugeItem) {
  var startAngle = gaugeItem.startAngle,
      endAngle = gaugeItem.endAngle,
      center = gaugeItem.center,
      radius = gaugeItem.radius;
  return {
    rx: center[0],
    ry: center[1],
    r: radius,
    startAngle: startAngle,
    endAngle: endAngle
  };
}

function getGaugeBackgroundArcStyle(gaugeItem) {
  var backgroundArc = gaugeItem.backgroundArc,
      arcLineWidth = gaugeItem.arcLineWidth;
  var style = backgroundArc.style;
  return (0, _util2.deepMerge)({
    lineWidth: arcLineWidth
  }, style);
}

function getStartBackgroundArcConfig(gaugeItem) {
  var config = getBackgroundArcConfig(gaugeItem)[0];

  var shape = _objectSpread({}, config.shape);

  shape.endAngle = config.shape.startAngle;
  config.shape = shape;
  return [config];
}

function getArcConfig(gaugeItem) {
  var data = gaugeItem.data,
      animationCurve = gaugeItem.animationCurve,
      animationFrame = gaugeItem.animationFrame,
      rLevel = gaugeItem.rLevel;
  return data.map(function (foo, i) {
    return {
      name: 'agArc',
      index: rLevel,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getGaugeArcShape(gaugeItem, i),
      style: getGaugeArcStyle(gaugeItem, i)
    };
  });
}

function getGaugeArcShape(gaugeItem, i) {
  var data = gaugeItem.data,
      center = gaugeItem.center,
      gradientEndAngle = gaugeItem.endAngle;
  var _data$i = data[i],
      radius = _data$i.radius,
      startAngle = _data$i.startAngle,
      endAngle = _data$i.endAngle,
      localGradient = _data$i.localGradient;
  if (localGradient) gradientEndAngle = endAngle;
  return {
    rx: center[0],
    ry: center[1],
    r: radius,
    startAngle: startAngle,
    endAngle: endAngle,
    gradientEndAngle: gradientEndAngle
  };
}

function getGaugeArcStyle(gaugeItem, i) {
  var data = gaugeItem.data,
      dataItemStyle = gaugeItem.dataItemStyle;
  var _data$i2 = data[i],
      lineWidth = _data$i2.lineWidth,
      gradient = _data$i2.gradient;
  gradient = gradient.map(function (c) {
    return (0, _color.getRgbaValue)(c);
  });
  return (0, _util2.deepMerge)({
    lineWidth: lineWidth,
    gradient: gradient
  }, dataItemStyle);
}

function getStartArcConfig(gaugeItem) {
  var configs = getArcConfig(gaugeItem);
  configs.map(function (config) {
    var shape = _objectSpread({}, config.shape);

    shape.endAngle = config.shape.startAngle;
    config.shape = shape;
  });
  return configs;
}

function beforeChangeArc(graph, config) {
  var graphGradient = graph.style.gradient;
  var cacheNum = graphGradient.length;
  var needNum = config.style.gradient.length;

  if (cacheNum > needNum) {
    graphGradient.splice(needNum);
  } else {
    var last = graphGradient.slice(-1)[0];
    graphGradient.push.apply(graphGradient, (0, _toConsumableArray2["default"])(new Array(needNum - cacheNum).fill(0).map(function (foo) {
      return (0, _toConsumableArray2["default"])(last);
    })));
  }
}

function getPointerConfig(gaugeItem) {
  var animationCurve = gaugeItem.animationCurve,
      animationFrame = gaugeItem.animationFrame,
      center = gaugeItem.center,
      rLevel = gaugeItem.rLevel;
  return [{
    name: 'polyline',
    index: rLevel,
    visible: gaugeItem.pointer.show,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: getPointerShape(gaugeItem),
    style: getPointerStyle(gaugeItem),
    setGraphCenter: function setGraphCenter(foo, graph) {
      graph.style.graphCenter = center;
    }
  }];
}

function getPointerShape(gaugeItem) {
  var center = gaugeItem.center;
  return {
    points: getPointerPoints(center),
    close: true
  };
}

function getPointerStyle(gaugeItem) {
  var startAngle = gaugeItem.startAngle,
      endAngle = gaugeItem.endAngle,
      min = gaugeItem.min,
      max = gaugeItem.max,
      data = gaugeItem.data,
      pointer = gaugeItem.pointer,
      center = gaugeItem.center;
  var valueIndex = pointer.valueIndex,
      style = pointer.style;
  var value = data[valueIndex] ? data[valueIndex].value : 0;
  var angle = (value - min) / (max - min) * (endAngle - startAngle) + startAngle + Math.PI / 2;
  return (0, _util2.deepMerge)({
    rotate: (0, _util2.radianToAngle)(angle),
    scale: [1, 1],
    graphCenter: center
  }, style);
}

function getPointerPoints(_ref8) {
  var _ref9 = (0, _slicedToArray2["default"])(_ref8, 2),
      x = _ref9[0],
      y = _ref9[1];

  var point1 = [x, y - 40];
  var point2 = [x + 5, y];
  var point3 = [x, y + 10];
  var point4 = [x - 5, y];
  return [point1, point2, point3, point4];
}

function getStartPointerConfig(gaugeItem) {
  var startAngle = gaugeItem.startAngle;
  var config = getPointerConfig(gaugeItem)[0];
  config.style.rotate = (0, _util2.radianToAngle)(startAngle + Math.PI / 2);
  return [config];
}

function getDetailsConfig(gaugeItem) {
  var detailsPosition = gaugeItem.detailsPosition,
      animationCurve = gaugeItem.animationCurve,
      animationFrame = gaugeItem.animationFrame,
      rLevel = gaugeItem.rLevel;
  var visible = gaugeItem.details.show;
  return detailsPosition.map(function (foo, i) {
    return {
      name: 'numberText',
      index: rLevel,
      visible: visible,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getDetailsShape(gaugeItem, i),
      style: getDetailsStyle(gaugeItem, i)
    };
  });
}

function getDetailsShape(gaugeItem, i) {
  var detailsPosition = gaugeItem.detailsPosition,
      detailsContent = gaugeItem.detailsContent,
      data = gaugeItem.data,
      details = gaugeItem.details;
  var position = detailsPosition[i];
  var content = detailsContent[i];
  var dataValue = data[i].value;
  var toFixed = details.valueToFixed;
  return {
    number: [dataValue],
    content: content,
    position: position,
    toFixed: toFixed
  };
}

function getDetailsStyle(gaugeItem, i) {
  var details = gaugeItem.details,
      data = gaugeItem.data;
  var style = details.style;
  var color = data[i].color;
  return (0, _util2.deepMerge)({
    fill: color
  }, style);
}
},{"../class/updater.class":3,"../config/gauge":7,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54,"@jiaminghi/color":56}],19:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.grid = grid;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _updater = require("../class/updater.class");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _config = require("../config");

var _util2 = require("../util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function grid(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var grid = option.grid;
  grid = (0, _util2.deepMerge)((0, _util.deepClone)(_config.gridConfig, true), grid || {});
  (0, _updater.doUpdate)({
    chart: chart,
    series: [grid],
    key: 'grid',
    getGraphConfig: getGridConfig
  });
}

function getGridConfig(gridItem, updater) {
  var animationCurve = gridItem.animationCurve,
      animationFrame = gridItem.animationFrame,
      rLevel = gridItem.rLevel;
  var shape = getGridShape(gridItem, updater);
  var style = getGridStyle(gridItem);
  updater.chart.gridArea = _objectSpread({}, shape);
  return [{
    name: 'rect',
    index: rLevel,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: shape,
    style: style
  }];
}

function getGridShape(gridItem, updater) {
  var _updater$chart$render = (0, _slicedToArray2["default"])(updater.chart.render.area, 2),
      w = _updater$chart$render[0],
      h = _updater$chart$render[1];

  var left = getNumberValue(gridItem.left, w);
  var right = getNumberValue(gridItem.right, w);
  var top = getNumberValue(gridItem.top, h);
  var bottom = getNumberValue(gridItem.bottom, h);
  var width = w - left - right;
  var height = h - top - bottom;
  return {
    x: left,
    y: top,
    w: width,
    h: height
  };
}

function getNumberValue(val, all) {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  return all * parseInt(val) / 100;
}

function getGridStyle(gridItem) {
  var style = gridItem.style;
  return style;
}
},{"../class/updater.class":3,"../config":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@jiaminghi/c-render/lib/plugin/util":54}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "mergeColor", {
  enumerable: true,
  get: function get() {
    return _mergeColor.mergeColor;
  }
});
Object.defineProperty(exports, "title", {
  enumerable: true,
  get: function get() {
    return _title.title;
  }
});
Object.defineProperty(exports, "grid", {
  enumerable: true,
  get: function get() {
    return _grid.grid;
  }
});
Object.defineProperty(exports, "axis", {
  enumerable: true,
  get: function get() {
    return _axis.axis;
  }
});
Object.defineProperty(exports, "line", {
  enumerable: true,
  get: function get() {
    return _line.line;
  }
});
Object.defineProperty(exports, "bar", {
  enumerable: true,
  get: function get() {
    return _bar.bar;
  }
});
Object.defineProperty(exports, "pie", {
  enumerable: true,
  get: function get() {
    return _pie.pie;
  }
});
Object.defineProperty(exports, "radarAxis", {
  enumerable: true,
  get: function get() {
    return _radarAxis.radarAxis;
  }
});
Object.defineProperty(exports, "radar", {
  enumerable: true,
  get: function get() {
    return _radar.radar;
  }
});
Object.defineProperty(exports, "gauge", {
  enumerable: true,
  get: function get() {
    return _gauge.gauge;
  }
});
Object.defineProperty(exports, "legend", {
  enumerable: true,
  get: function get() {
    return _legend.legend;
  }
});

var _mergeColor = require("./mergeColor");

var _title = require("./title");

var _grid = require("./grid");

var _axis = require("./axis");

var _line = require("./line");

var _bar = require("./bar");

var _pie = require("./pie");

var _radarAxis = require("./radarAxis");

var _radar = require("./radar");

var _gauge = require("./gauge");

var _legend = require("./legend");
},{"./axis":16,"./bar":17,"./gauge":18,"./grid":19,"./legend":21,"./line":22,"./mergeColor":23,"./pie":24,"./radar":25,"./radarAxis":26,"./title":27}],21:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.legend = legend;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _updater = require("../class/updater.class");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _config = require("../config");

var _util2 = require("../util");

function legend(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var legend = option.legend;

  if (legend) {
    legend = (0, _util2.deepMerge)((0, _util.deepClone)(_config.legendConfig, true), legend);
    legend = initLegendData(legend);
    legend = filterInvalidData(legend, option, chart);
    legend = calcLegendTextWidth(legend, chart);
    legend = calcLegendPosition(legend, chart);
    legend = [legend];
  } else {
    legend = [];
  }

  (0, _updater.doUpdate)({
    chart: chart,
    series: legend,
    key: 'legendIcon',
    getGraphConfig: getIconConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: legend,
    key: 'legendText',
    getGraphConfig: getTextConfig
  });
}

function initLegendData(legend) {
  var data = legend.data;
  legend.data = data.map(function (item) {
    var itemType = (0, _typeof2["default"])(item);

    if (itemType === 'string') {
      return {
        name: item
      };
    } else if (itemType === 'object') {
      return item;
    }

    return {
      name: ''
    };
  });
  return legend;
}

function filterInvalidData(legend, option, chart) {
  var series = option.series;
  var legendStatus = chart.legendStatus;
  var data = legend.data.filter(function (item) {
    var name = item.name;
    var result = series.find(function (_ref) {
      var sn = _ref.name;
      return name === sn;
    });
    if (!result) return false;
    if (!item.color) item.color = result.color;
    if (!item.icon) item.icon = result.type;
    return item;
  });
  if (!legendStatus || legendStatus.length !== legend.data.length) legendStatus = new Array(legend.data.length).fill(true);
  data.forEach(function (item, i) {
    return item.status = legendStatus[i];
  });
  legend.data = data;
  chart.legendStatus = legendStatus;
  return legend;
}

function calcLegendTextWidth(legend, chart) {
  var ctx = chart.render.ctx;
  var data = legend.data,
      textStyle = legend.textStyle,
      textUnselectedStyle = legend.textUnselectedStyle;
  data.forEach(function (item) {
    var status = item.status,
        name = item.name;
    item.textWidth = getTextWidth(ctx, name, status ? textStyle : textUnselectedStyle);
  });
  return legend;
}

function getTextWidth(ctx, text, style) {
  ctx.font = getFontConfig(style);
  return ctx.measureText(text).width;
}

function getFontConfig(style) {
  var fontFamily = style.fontFamily,
      fontSize = style.fontSize;
  return "".concat(fontSize, "px ").concat(fontFamily);
}

function calcLegendPosition(legend, chart) {
  var orient = legend.orient;

  if (orient === 'vertical') {
    calcVerticalPosition(legend, chart);
  } else {
    calcHorizontalPosition(legend, chart);
  }

  return legend;
}

function calcHorizontalPosition(legend, chart) {
  var iconHeight = legend.iconHeight,
      itemGap = legend.itemGap;
  var lines = calcDefaultHorizontalPosition(legend, chart);
  var xOffsets = lines.map(function (line) {
    return getHorizontalXOffset(line, legend, chart);
  });
  var yOffset = getHorizontalYOffset(legend, chart);
  var align = {
    textAlign: 'left',
    textBaseline: 'middle'
  };
  lines.forEach(function (line, i) {
    return line.forEach(function (item) {
      var iconPosition = item.iconPosition,
          textPosition = item.textPosition;
      var xOffset = xOffsets[i];
      var realYOffset = yOffset + i * (itemGap + iconHeight);
      item.iconPosition = mergeOffset(iconPosition, [xOffset, realYOffset]);
      item.textPosition = mergeOffset(textPosition, [xOffset, realYOffset]);
      item.align = align;
    });
  });
}

function calcDefaultHorizontalPosition(legend, chart) {
  var data = legend.data,
      iconWidth = legend.iconWidth;
  var w = chart.render.area[0];
  var startIndex = 0;
  var lines = [[]];
  data.forEach(function (item, i) {
    var beforeWidth = getBeforeWidth(startIndex, i, legend);
    var endXPos = beforeWidth + iconWidth + 5 + item.textWidth;

    if (endXPos >= w) {
      startIndex = i;
      beforeWidth = getBeforeWidth(startIndex, i, legend);
      lines.push([]);
    }

    item.iconPosition = [beforeWidth, 0];
    item.textPosition = [beforeWidth + iconWidth + 5, 0];
    lines.slice(-1)[0].push(item);
  });
  return lines;
}

function getBeforeWidth(startIndex, currentIndex, legend) {
  var data = legend.data,
      iconWidth = legend.iconWidth,
      itemGap = legend.itemGap;
  var beforeItem = data.slice(startIndex, currentIndex);
  return (0, _util2.mulAdd)(beforeItem.map(function (_ref2) {
    var textWidth = _ref2.textWidth;
    return textWidth;
  })) + (currentIndex - startIndex) * (itemGap + 5 + iconWidth);
}

function getHorizontalXOffset(data, legend, chart) {
  var left = legend.left,
      right = legend.right,
      iconWidth = legend.iconWidth,
      itemGap = legend.itemGap;
  var w = chart.render.area[0];
  var dataNum = data.length;
  var allWidth = (0, _util2.mulAdd)(data.map(function (_ref3) {
    var textWidth = _ref3.textWidth;
    return textWidth;
  })) + dataNum * (5 + iconWidth) + (dataNum - 1) * itemGap;
  var horizontal = [left, right].findIndex(function (pos) {
    return pos !== 'auto';
  });

  if (horizontal === -1) {
    return (w - allWidth) / 2;
  } else if (horizontal === 0) {
    if (typeof left === 'number') return left;
    return parseInt(left) / 100 * w;
  } else {
    if (typeof right !== 'number') right = parseInt(right) / 100 * w;
    return w - (allWidth + right);
  }
}

function getHorizontalYOffset(legend, chart) {
  var top = legend.top,
      bottom = legend.bottom,
      iconHeight = legend.iconHeight;
  var h = chart.render.area[1];
  var vertical = [top, bottom].findIndex(function (pos) {
    return pos !== 'auto';
  });
  var halfIconHeight = iconHeight / 2;

  if (vertical === -1) {
    var _chart$gridArea = chart.gridArea,
        y = _chart$gridArea.y,
        height = _chart$gridArea.h;
    return y + height + 45 - halfIconHeight;
  } else if (vertical === 0) {
    if (typeof top === 'number') return top - halfIconHeight;
    return parseInt(top) / 100 * h - halfIconHeight;
  } else {
    if (typeof bottom !== 'number') bottom = parseInt(bottom) / 100 * h;
    return h - bottom - halfIconHeight;
  }
}

function mergeOffset(_ref4, _ref5) {
  var _ref6 = (0, _slicedToArray2["default"])(_ref4, 2),
      x = _ref6[0],
      y = _ref6[1];

  var _ref7 = (0, _slicedToArray2["default"])(_ref5, 2),
      ox = _ref7[0],
      oy = _ref7[1];

  return [x + ox, y + oy];
}

function calcVerticalPosition(legend, chart) {
  var _getVerticalXOffset = getVerticalXOffset(legend, chart),
      _getVerticalXOffset2 = (0, _slicedToArray2["default"])(_getVerticalXOffset, 2),
      isRight = _getVerticalXOffset2[0],
      xOffset = _getVerticalXOffset2[1];

  var yOffset = getVerticalYOffset(legend, chart);
  calcDefaultVerticalPosition(legend, isRight);
  var align = {
    textAlign: 'left',
    textBaseline: 'middle'
  };
  legend.data.forEach(function (item) {
    var textPosition = item.textPosition,
        iconPosition = item.iconPosition;
    item.textPosition = mergeOffset(textPosition, [xOffset, yOffset]);
    item.iconPosition = mergeOffset(iconPosition, [xOffset, yOffset]);
    item.align = align;
  });
}

function getVerticalXOffset(legend, chart) {
  var left = legend.left,
      right = legend.right;
  var w = chart.render.area[0];
  var horizontal = [left, right].findIndex(function (pos) {
    return pos !== 'auto';
  });

  if (horizontal === -1) {
    return [true, w - 10];
  } else {
    var offset = [left, right][horizontal];
    if (typeof offset !== 'number') offset = parseInt(offset) / 100 * w;
    return [Boolean(horizontal), offset];
  }
}

function getVerticalYOffset(legend, chart) {
  var iconHeight = legend.iconHeight,
      itemGap = legend.itemGap,
      data = legend.data,
      top = legend.top,
      bottom = legend.bottom;
  var h = chart.render.area[1];
  var dataNum = data.length;
  var allHeight = dataNum * iconHeight + (dataNum - 1) * itemGap;
  var vertical = [top, bottom].findIndex(function (pos) {
    return pos !== 'auto';
  });

  if (vertical === -1) {
    return (h - allHeight) / 2;
  } else {
    var offset = [top, bottom][vertical];
    if (typeof offset !== 'number') offset = parseInt(offset) / 100 * h;
    if (vertical === 1) offset = h - offset - allHeight;
    return offset;
  }
}

function calcDefaultVerticalPosition(legend, isRight) {
  var data = legend.data,
      iconWidth = legend.iconWidth,
      iconHeight = legend.iconHeight,
      itemGap = legend.itemGap;
  var halfIconHeight = iconHeight / 2;
  data.forEach(function (item, i) {
    var textWidth = item.textWidth;
    var yPos = (iconHeight + itemGap) * i + halfIconHeight;
    var iconXPos = isRight ? 0 - iconWidth : 0;
    var textXpos = isRight ? iconXPos - 5 - textWidth : iconWidth + 5;
    item.iconPosition = [iconXPos, yPos];
    item.textPosition = [textXpos, yPos];
  });
}

function getIconConfig(legendItem, updater) {
  var data = legendItem.data,
      selectAble = legendItem.selectAble,
      animationCurve = legendItem.animationCurve,
      animationFrame = legendItem.animationFrame,
      rLevel = legendItem.rLevel;
  return data.map(function (item, i) {
    return (0, _defineProperty2["default"])({
      name: item.icon === 'line' ? 'lineIcon' : 'rect',
      index: rLevel,
      visible: legendItem.show,
      hover: selectAble,
      click: selectAble,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getIconShape(legendItem, i),
      style: getIconStyle(legendItem, i)
    }, "click", createClickCallBack(legendItem, i, updater));
  });
}

function getIconShape(legendItem, i) {
  var data = legendItem.data,
      iconWidth = legendItem.iconWidth,
      iconHeight = legendItem.iconHeight;

  var _data$i$iconPosition = (0, _slicedToArray2["default"])(data[i].iconPosition, 2),
      x = _data$i$iconPosition[0],
      y = _data$i$iconPosition[1];

  var halfIconHeight = iconHeight / 2;
  return {
    x: x,
    y: y - halfIconHeight,
    w: iconWidth,
    h: iconHeight
  };
}

function getIconStyle(legendItem, i) {
  var data = legendItem.data,
      iconStyle = legendItem.iconStyle,
      iconUnselectedStyle = legendItem.iconUnselectedStyle;
  var _data$i = data[i],
      status = _data$i.status,
      color = _data$i.color;
  var style = status ? iconStyle : iconUnselectedStyle;
  return (0, _util2.deepMerge)({
    fill: color
  }, style);
}

function getTextConfig(legendItem, updater) {
  var data = legendItem.data,
      selectAble = legendItem.selectAble,
      animationCurve = legendItem.animationCurve,
      animationFrame = legendItem.animationFrame,
      rLevel = legendItem.rLevel;
  return data.map(function (foo, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: legendItem.show,
      hover: selectAble,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      hoverRect: getTextHoverRect(legendItem, i),
      shape: getTextShape(legendItem, i),
      style: getTextStyle(legendItem, i),
      click: createClickCallBack(legendItem, i, updater)
    };
  });
}

function getTextShape(legendItem, i) {
  var _legendItem$data$i = legendItem.data[i],
      textPosition = _legendItem$data$i.textPosition,
      name = _legendItem$data$i.name;
  return {
    content: name,
    position: textPosition
  };
}

function getTextStyle(legendItem, i) {
  var textStyle = legendItem.textStyle,
      textUnselectedStyle = legendItem.textUnselectedStyle;
  var _legendItem$data$i2 = legendItem.data[i],
      status = _legendItem$data$i2.status,
      align = _legendItem$data$i2.align;
  var style = status ? textStyle : textUnselectedStyle;
  return (0, _util2.deepMerge)((0, _util.deepClone)(style, true), align);
}

function getTextHoverRect(legendItem, i) {
  var textStyle = legendItem.textStyle,
      textUnselectedStyle = legendItem.textUnselectedStyle;

  var _legendItem$data$i3 = legendItem.data[i],
      status = _legendItem$data$i3.status,
      _legendItem$data$i3$t = (0, _slicedToArray2["default"])(_legendItem$data$i3.textPosition, 2),
      x = _legendItem$data$i3$t[0],
      y = _legendItem$data$i3$t[1],
      textWidth = _legendItem$data$i3.textWidth;

  var style = status ? textStyle : textUnselectedStyle;
  var fontSize = style.fontSize;
  return [x, y - fontSize / 2, textWidth, fontSize];
}

function createClickCallBack(legendItem, index, updater) {
  var name = legendItem.data[index].name;
  return function () {
    var _updater$chart = updater.chart,
        legendStatus = _updater$chart.legendStatus,
        option = _updater$chart.option;
    var status = !legendStatus[index];
    var change = option.series.find(function (_ref9) {
      var sn = _ref9.name;
      return sn === name;
    });
    change.show = status;
    legendStatus[index] = status;
    updater.chart.setOption(option);
  };
}
},{"../class/updater.class":3,"../config":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54}],22:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.line = line;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _updater = require("../class/updater.class");

var _config = require("../config");

var _bezierCurve = _interopRequireDefault(require("@jiaminghi/bezier-curve"));

var _util = require("../util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var polylineToBezierCurve = _bezierCurve["default"].polylineToBezierCurve,
    getBezierCurveLength = _bezierCurve["default"].getBezierCurveLength;

function line(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var xAxis = option.xAxis,
      yAxis = option.yAxis,
      series = option.series;
  var lines = [];

  if (xAxis && yAxis && series) {
    lines = (0, _util.initNeedSeries)(series, _config.lineConfig, 'line');
    lines = calcLinesPosition(lines, chart);
  }

  (0, _updater.doUpdate)({
    chart: chart,
    series: lines,
    key: 'lineArea',
    getGraphConfig: getLineAreaConfig,
    getStartGraphConfig: getStartLineAreaConfig,
    beforeUpdate: beforeUpdateLineAndArea,
    beforeChange: beforeChangeLineAndArea
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: lines,
    key: 'line',
    getGraphConfig: getLineConfig,
    getStartGraphConfig: getStartLineConfig,
    beforeUpdate: beforeUpdateLineAndArea,
    beforeChange: beforeChangeLineAndArea
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: lines,
    key: 'linePoint',
    getGraphConfig: getPointConfig,
    getStartGraphConfig: getStartPointConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: lines,
    key: 'lineLabel',
    getGraphConfig: getLabelConfig
  });
}

function calcLinesPosition(lines, chart) {
  var axisData = chart.axisData;
  return lines.map(function (lineItem) {
    var lineData = (0, _util.mergeSameStackData)(lineItem, lines);
    lineData = mergeNonNumber(lineItem, lineData);
    var lineAxis = getLineAxis(lineItem, axisData);
    var linePosition = getLinePosition(lineData, lineAxis);
    var lineFillBottomPos = getLineFillBottomPos(lineAxis);
    return _objectSpread({}, lineItem, {
      linePosition: linePosition.filter(function (p) {
        return p;
      }),
      lineFillBottomPos: lineFillBottomPos
    });
  });
}

function mergeNonNumber(lineItem, lineData) {
  var data = lineItem.data;
  return lineData.map(function (v, i) {
    return typeof data[i] === 'number' ? v : null;
  });
}

function getLineAxis(line, axisData) {
  var xAxisIndex = line.xAxisIndex,
      yAxisIndex = line.yAxisIndex;
  var xAxis = axisData.find(function (_ref) {
    var axis = _ref.axis,
        index = _ref.index;
    return axis === 'x' && index === xAxisIndex;
  });
  var yAxis = axisData.find(function (_ref2) {
    var axis = _ref2.axis,
        index = _ref2.index;
    return axis === 'y' && index === yAxisIndex;
  });
  return [xAxis, yAxis];
}

function getLinePosition(lineData, lineAxis) {
  var valueAxisIndex = lineAxis.findIndex(function (_ref3) {
    var data = _ref3.data;
    return data === 'value';
  });
  var valueAxis = lineAxis[valueAxisIndex];
  var labelAxis = lineAxis[1 - valueAxisIndex];
  var linePosition = valueAxis.linePosition,
      axis = valueAxis.axis;
  var tickPosition = labelAxis.tickPosition;
  var tickNum = tickPosition.length;
  var valueAxisPosIndex = axis === 'x' ? 0 : 1;
  var valueAxisStartPos = linePosition[0][valueAxisPosIndex];
  var valueAxisEndPos = linePosition[1][valueAxisPosIndex];
  var valueAxisPosMinus = valueAxisEndPos - valueAxisStartPos;
  var maxValue = valueAxis.maxValue,
      minValue = valueAxis.minValue;
  var valueMinus = maxValue - minValue;
  var position = new Array(tickNum).fill(0).map(function (foo, i) {
    var v = lineData[i];
    if (typeof v !== 'number') return null;
    var valuePercent = (v - minValue) / valueMinus;
    if (valueMinus === 0) valuePercent = 0;
    return valuePercent * valueAxisPosMinus + valueAxisStartPos;
  });
  return position.map(function (vPos, i) {
    if (i >= tickNum || typeof vPos !== 'number') return null;
    var pos = [vPos, tickPosition[i][1 - valueAxisPosIndex]];
    if (valueAxisPosIndex === 0) return pos;
    pos.reverse();
    return pos;
  });
}

function getLineFillBottomPos(lineAxis) {
  var valueAxis = lineAxis.find(function (_ref4) {
    var data = _ref4.data;
    return data === 'value';
  });
  var axis = valueAxis.axis,
      linePosition = valueAxis.linePosition,
      minValue = valueAxis.minValue,
      maxValue = valueAxis.maxValue;
  var changeIndex = axis === 'x' ? 0 : 1;
  var changeValue = linePosition[0][changeIndex];

  if (minValue < 0 && maxValue > 0) {
    var valueMinus = maxValue - minValue;
    var posMinus = Math.abs(linePosition[0][changeIndex] - linePosition[1][changeIndex]);
    var offset = Math.abs(minValue) / valueMinus * posMinus;
    if (axis === 'y') offset *= -1;
    changeValue += offset;
  }

  return {
    changeIndex: changeIndex,
    changeValue: changeValue
  };
}

function getLineAreaConfig(lineItem) {
  var animationCurve = lineItem.animationCurve,
      animationFrame = lineItem.animationFrame,
      lineFillBottomPos = lineItem.lineFillBottomPos,
      rLevel = lineItem.rLevel;
  return [{
    name: getLineGraphName(lineItem),
    index: rLevel,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    visible: lineItem.lineArea.show,
    lineFillBottomPos: lineFillBottomPos,
    shape: getLineAndAreaShape(lineItem),
    style: getLineAreaStyle(lineItem),
    drawed: lineAreaDrawed
  }];
}

function getLineAndAreaShape(lineItem) {
  var linePosition = lineItem.linePosition;
  return {
    points: linePosition
  };
}

function getLineAreaStyle(lineItem) {
  var lineArea = lineItem.lineArea,
      color = lineItem.color;
  var gradient = lineArea.gradient,
      style = lineArea.style;
  var fillColor = [style.fill || color];
  var gradientColor = (0, _util.deepMerge)(fillColor, gradient);
  if (gradientColor.length === 1) gradientColor.push(gradientColor[0]);
  var gradientParams = getGradientParams(lineItem);
  style = _objectSpread({}, style, {
    stroke: 'rgba(0, 0, 0, 0)'
  });
  return (0, _util.deepMerge)({
    gradientColor: gradientColor,
    gradientParams: gradientParams,
    gradientType: 'linear',
    gradientWith: 'fill'
  }, style);
}

function getGradientParams(lineItem) {
  var lineFillBottomPos = lineItem.lineFillBottomPos,
      linePosition = lineItem.linePosition;
  var changeIndex = lineFillBottomPos.changeIndex,
      changeValue = lineFillBottomPos.changeValue;
  var mainPos = linePosition.map(function (p) {
    return p[changeIndex];
  });
  var maxPos = Math.max.apply(Math, (0, _toConsumableArray2["default"])(mainPos));
  var minPos = Math.min.apply(Math, (0, _toConsumableArray2["default"])(mainPos));
  var beginPos = maxPos;
  if (changeIndex === 1) beginPos = minPos;

  if (changeIndex === 1) {
    return [0, beginPos, 0, changeValue];
  } else {
    return [beginPos, 0, changeValue, 0];
  }
}

function lineAreaDrawed(_ref5, _ref6) {
  var lineFillBottomPos = _ref5.lineFillBottomPos,
      shape = _ref5.shape;
  var ctx = _ref6.ctx;
  var points = shape.points;
  var changeIndex = lineFillBottomPos.changeIndex,
      changeValue = lineFillBottomPos.changeValue;
  var linePoint1 = (0, _toConsumableArray2["default"])(points[points.length - 1]);
  var linePoint2 = (0, _toConsumableArray2["default"])(points[0]);
  linePoint1[changeIndex] = changeValue;
  linePoint2[changeIndex] = changeValue;
  ctx.lineTo.apply(ctx, (0, _toConsumableArray2["default"])(linePoint1));
  ctx.lineTo.apply(ctx, (0, _toConsumableArray2["default"])(linePoint2));
  ctx.closePath();
  ctx.fill();
}

function getStartLineAreaConfig(lineItem) {
  var config = getLineAreaConfig(lineItem)[0];

  var style = _objectSpread({}, config.style);

  style.opacity = 0;
  config.style = style;
  return [config];
}

function beforeUpdateLineAndArea(graphs, lineItem, i, updater) {
  var cache = graphs[i];
  if (!cache) return;
  var currentName = getLineGraphName(lineItem);
  var render = updater.chart.render;
  var name = cache[0].name;
  var delAll = currentName !== name;
  if (!delAll) return;
  cache.forEach(function (g) {
    return render.delGraph(g);
  });
  graphs[i] = null;
}

function beforeChangeLineAndArea(graph, config) {
  var points = config.shape.points;
  var graphPoints = graph.shape.points;
  var graphPointsNum = graphPoints.length;
  var pointsNum = points.length;

  if (pointsNum > graphPointsNum) {
    var lastPoint = graphPoints.slice(-1)[0];
    var newAddPoints = new Array(pointsNum - graphPointsNum).fill(0).map(function (foo) {
      return (0, _toConsumableArray2["default"])(lastPoint);
    });
    graphPoints.push.apply(graphPoints, (0, _toConsumableArray2["default"])(newAddPoints));
  } else if (pointsNum < graphPointsNum) {
    graphPoints.splice(pointsNum);
  }
}

function getLineConfig(lineItem) {
  var animationCurve = lineItem.animationCurve,
      animationFrame = lineItem.animationFrame,
      rLevel = lineItem.rLevel;
  return [{
    name: getLineGraphName(lineItem),
    index: rLevel + 1,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: getLineAndAreaShape(lineItem),
    style: getLineStyle(lineItem)
  }];
}

function getLineGraphName(lineItem) {
  var smooth = lineItem.smooth;
  return smooth ? 'smoothline' : 'polyline';
}

function getLineStyle(lineItem) {
  var lineStyle = lineItem.lineStyle,
      color = lineItem.color,
      smooth = lineItem.smooth,
      linePosition = lineItem.linePosition;
  var lineLength = getLineLength(linePosition, smooth);
  return (0, _util.deepMerge)({
    stroke: color,
    lineDash: [lineLength, 0]
  }, lineStyle);
}

function getLineLength(points) {
  var smooth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!smooth) return (0, _util.getPolylineLength)(points);
  var curve = polylineToBezierCurve(points);
  return getBezierCurveLength(curve);
}

function getStartLineConfig(lineItem) {
  var lineDash = lineItem.lineStyle.lineDash;
  var config = getLineConfig(lineItem)[0];
  var realLineDash = config.style.lineDash;

  if (lineDash) {
    realLineDash = [0, 0];
  } else {
    realLineDash = (0, _toConsumableArray2["default"])(realLineDash).reverse();
  }

  config.style.lineDash = realLineDash;
  return [config];
}

function getPointConfig(lineItem) {
  var animationCurve = lineItem.animationCurve,
      animationFrame = lineItem.animationFrame,
      rLevel = lineItem.rLevel;
  var shapes = getPointShapes(lineItem);
  var style = getPointStyle(lineItem);
  return shapes.map(function (shape) {
    return {
      name: 'circle',
      index: rLevel + 2,
      visible: lineItem.linePoint.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: style
    };
  });
}

function getPointShapes(lineItem) {
  var linePosition = lineItem.linePosition,
      radius = lineItem.linePoint.radius;
  return linePosition.map(function (_ref7) {
    var _ref8 = (0, _slicedToArray2["default"])(_ref7, 2),
        rx = _ref8[0],
        ry = _ref8[1];

    return {
      r: radius,
      rx: rx,
      ry: ry
    };
  });
}

function getPointStyle(lineItem) {
  var color = lineItem.color,
      style = lineItem.linePoint.style;
  return (0, _util.deepMerge)({
    stroke: color
  }, style);
}

function getStartPointConfig(lineItem) {
  var configs = getPointConfig(lineItem);
  configs.forEach(function (config) {
    config.shape.r = 0.1;
  });
  return configs;
}

function getLabelConfig(lineItem) {
  var animationCurve = lineItem.animationCurve,
      animationFrame = lineItem.animationFrame,
      rLevel = lineItem.rLevel;
  var shapes = getLabelShapes(lineItem);
  var style = getLabelStyle(lineItem);
  return shapes.map(function (shape, i) {
    return {
      name: 'text',
      index: rLevel + 3,
      visible: lineItem.label.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: shape,
      style: style
    };
  });
}

function getLabelShapes(lineItem) {
  var contents = formatterLabel(lineItem);
  var position = getLabelPosition(lineItem);
  return contents.map(function (content, i) {
    return {
      content: content,
      position: position[i]
    };
  });
}

function getLabelPosition(lineItem) {
  var linePosition = lineItem.linePosition,
      lineFillBottomPos = lineItem.lineFillBottomPos,
      label = lineItem.label;
  var position = label.position,
      offset = label.offset;
  var changeIndex = lineFillBottomPos.changeIndex,
      changeValue = lineFillBottomPos.changeValue;
  return linePosition.map(function (pos) {
    if (position === 'bottom') {
      pos = (0, _toConsumableArray2["default"])(pos);
      pos[changeIndex] = changeValue;
    }

    if (position === 'center') {
      var bottom = (0, _toConsumableArray2["default"])(pos);
      bottom[changeIndex] = changeValue;
      pos = getCenterLabelPoint(pos, bottom);
    }

    return getOffsetedPoint(pos, offset);
  });
}

function getOffsetedPoint(_ref9, _ref10) {
  var _ref11 = (0, _slicedToArray2["default"])(_ref9, 2),
      x = _ref11[0],
      y = _ref11[1];

  var _ref12 = (0, _slicedToArray2["default"])(_ref10, 2),
      ox = _ref12[0],
      oy = _ref12[1];

  return [x + ox, y + oy];
}

function getCenterLabelPoint(_ref13, _ref14) {
  var _ref15 = (0, _slicedToArray2["default"])(_ref13, 2),
      ax = _ref15[0],
      ay = _ref15[1];

  var _ref16 = (0, _slicedToArray2["default"])(_ref14, 2),
      bx = _ref16[0],
      by = _ref16[1];

  return [(ax + bx) / 2, (ay + by) / 2];
}

function formatterLabel(lineItem) {
  var data = lineItem.data,
      formatter = lineItem.label.formatter;
  data = data.filter(function (d) {
    return typeof d === 'number';
  }).map(function (d) {
    return d.toString();
  });
  if (!formatter) return data;
  var type = (0, _typeof2["default"])(formatter);
  if (type === 'string') return data.map(function (d) {
    return formatter.replace('{value}', d);
  });
  if (type === 'function') return data.map(function (value, index) {
    return formatter({
      value: value,
      index: index
    });
  });
  return data;
}

function getLabelStyle(lineItem) {
  var color = lineItem.color,
      style = lineItem.label.style;
  return (0, _util.deepMerge)({
    fill: color
  }, style);
}
},{"../class/updater.class":3,"../config":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/bezier-curve":47}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeColor = mergeColor;

var _config = require("../config");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _util2 = require("../util");

function mergeColor(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var defaultColor = (0, _util.deepClone)(_config.colorConfig, true);
  var color = option.color,
      series = option.series;
  if (!series) series = [];
  if (!color) color = [];
  option.color = color = (0, _util2.deepMerge)(defaultColor, color);
  if (!series.length) return;
  var colorNum = color.length;
  series.forEach(function (item, i) {
    if (item.color) return;
    item.color = color[i % colorNum];
  });
  var pies = series.filter(function (_ref) {
    var type = _ref.type;
    return type === 'pie';
  });
  pies.forEach(function (pie) {
    return pie.data.forEach(function (di, i) {
      return di.color = color[i % colorNum];
    });
  });
  var gauges = series.filter(function (_ref2) {
    var type = _ref2.type;
    return type === 'gauge';
  });
  gauges.forEach(function (gauge) {
    return gauge.data.forEach(function (di, i) {
      return di.color = color[i % colorNum];
    });
  });
}
},{"../config":9,"../util":30,"@jiaminghi/c-render/lib/plugin/util":54}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pie = pie;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _updater = require("../class/updater.class");

var _pie = require("../config/pie");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _util2 = require("../util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function pie(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var series = option.series;
  if (!series) series = [];
  var pies = (0, _util2.initNeedSeries)(series, _pie.pieConfig, 'pie');
  pies = calcPiesCenter(pies, chart);
  pies = calcPiesRadius(pies, chart);
  pies = calcRosePiesRadius(pies, chart);
  pies = calcPiesPercent(pies);
  pies = calcPiesAngle(pies, chart);
  pies = calcPiesInsideLabelPos(pies);
  pies = calcPiesEdgeCenterPos(pies);
  pies = calcPiesOutSideLabelPos(pies);
  (0, _updater.doUpdate)({
    chart: chart,
    series: pies,
    key: 'pie',
    getGraphConfig: getPieConfig,
    getStartGraphConfig: getStartPieConfig,
    beforeChange: beforeChangePie
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: pies,
    key: 'pieInsideLabel',
    getGraphConfig: getInsideLabelConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: pies,
    key: 'pieOutsideLabelLine',
    getGraphConfig: getOutsideLabelLineConfig,
    getStartGraphConfig: getStartOutsideLabelLineConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: pies,
    key: 'pieOutsideLabel',
    getGraphConfig: getOutsideLabelConfig,
    getStartGraphConfig: getStartOutsideLabelConfig
  });
}

function calcPiesCenter(pies, chart) {
  var area = chart.render.area;
  pies.forEach(function (pie) {
    var center = pie.center;
    center = center.map(function (pos, i) {
      if (typeof pos === 'number') return pos;
      return parseInt(pos) / 100 * area[i];
    });
    pie.center = center;
  });
  return pies;
}

function calcPiesRadius(pies, chart) {
  var maxRadius = Math.min.apply(Math, (0, _toConsumableArray2["default"])(chart.render.area)) / 2;
  pies.forEach(function (pie) {
    var radius = pie.radius,
        data = pie.data;
    radius = getNumberRadius(radius, maxRadius);
    data.forEach(function (item) {
      var itemRadius = item.radius;
      if (!itemRadius) itemRadius = radius;
      itemRadius = getNumberRadius(itemRadius, maxRadius);
      item.radius = itemRadius;
    });
    pie.radius = radius;
  });
  return pies;
}

function getNumberRadius(radius, maxRadius) {
  if (!(radius instanceof Array)) radius = [0, radius];
  radius = radius.map(function (r) {
    if (typeof r === 'number') return r;
    return parseInt(r) / 100 * maxRadius;
  });
  return radius;
}

function calcRosePiesRadius(pies, chart) {
  var rosePie = pies.filter(function (_ref) {
    var roseType = _ref.roseType;
    return roseType;
  });
  rosePie.forEach(function (pie) {
    var radius = pie.radius,
        data = pie.data,
        roseSort = pie.roseSort;
    var roseIncrement = getRoseIncrement(pie);
    var dataCopy = (0, _toConsumableArray2["default"])(data);
    data = sortData(data);
    data.forEach(function (item, i) {
      item.radius[1] = radius[1] - roseIncrement * i;
    });

    if (roseSort) {
      data.reverse();
    } else {
      pie.data = dataCopy;
    }

    pie.roseIncrement = roseIncrement;
  });
  return pies;
}

function sortData(data) {
  return data.sort(function (_ref2, _ref3) {
    var a = _ref2.value;
    var b = _ref3.value;
    if (a === b) return 0;
    if (a > b) return -1;
    if (a < b) return 1;
  });
}

function getRoseIncrement(pie) {
  var radius = pie.radius,
      roseIncrement = pie.roseIncrement;
  if (typeof roseIncrement === 'number') return roseIncrement;

  if (roseIncrement === 'auto') {
    var data = pie.data;
    var allRadius = data.reduce(function (all, _ref4) {
      var radius = _ref4.radius;
      return [].concat((0, _toConsumableArray2["default"])(all), (0, _toConsumableArray2["default"])(radius));
    }, []);
    var minRadius = Math.min.apply(Math, (0, _toConsumableArray2["default"])(allRadius));
    var maxRadius = Math.max.apply(Math, (0, _toConsumableArray2["default"])(allRadius));
    return (maxRadius - minRadius) * 0.6 / (data.length - 1 || 1);
  }

  return parseInt(roseIncrement) / 100 * radius[1];
}

function calcPiesPercent(pies) {
  pies.forEach(function (pie) {
    var data = pie.data,
        percentToFixed = pie.percentToFixed;
    var sum = getDataSum(data);
    data.forEach(function (item) {
      var value = item.value;
      item.percent = parseFloat((value / sum * 100).toFixed(percentToFixed));
    });
    var percentSumNoLast = (0, _util2.mulAdd)(data.slice(0, -1).map(function (_ref5) {
      var percent = _ref5.percent;
      return percent;
    }));
    data.slice(-1)[0].percent = 100 - percentSumNoLast;
  });
  return pies;
}

function getDataSum(data) {
  return (0, _util2.mulAdd)(data.map(function (_ref6) {
    var value = _ref6.value;
    return value;
  }));
}

function calcPiesAngle(pies) {
  pies.forEach(function (pie) {
    var start = pie.startAngle,
        data = pie.data;
    data.forEach(function (item, i) {
      var _getDataAngle = getDataAngle(data, i),
          _getDataAngle2 = (0, _slicedToArray2["default"])(_getDataAngle, 2),
          startAngle = _getDataAngle2[0],
          endAngle = _getDataAngle2[1];

      item.startAngle = start + startAngle;
      item.endAngle = start + endAngle;
    });
  });
  return pies;
}

function getDataAngle(data, i) {
  var fullAngle = Math.PI * 2;
  var needAddData = data.slice(0, i + 1);
  var percentSum = (0, _util2.mulAdd)(needAddData.map(function (_ref7) {
    var percent = _ref7.percent;
    return percent;
  }));
  var percent = data[i].percent;
  var startPercent = percentSum - percent;
  return [fullAngle * startPercent / 100, fullAngle * percentSum / 100];
}

function calcPiesInsideLabelPos(pies) {
  pies.forEach(function (pieItem) {
    var data = pieItem.data;
    data.forEach(function (item) {
      item.insideLabelPos = getPieInsideLabelPos(pieItem, item);
    });
  });
  return pies;
}

function getPieInsideLabelPos(pieItem, dataItem) {
  var center = pieItem.center;

  var startAngle = dataItem.startAngle,
      endAngle = dataItem.endAngle,
      _dataItem$radius = (0, _slicedToArray2["default"])(dataItem.radius, 2),
      ir = _dataItem$radius[0],
      or = _dataItem$radius[1];

  var radius = (ir + or) / 2;
  var angle = (startAngle + endAngle) / 2;
  return _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([radius, angle]));
}

function calcPiesEdgeCenterPos(pies) {
  pies.forEach(function (pie) {
    var data = pie.data,
        center = pie.center;
    data.forEach(function (item) {
      var startAngle = item.startAngle,
          endAngle = item.endAngle,
          radius = item.radius;
      var centerAngle = (startAngle + endAngle) / 2;

      var pos = _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([radius[1], centerAngle]));

      item.edgeCenterPos = pos;
    });
  });
  return pies;
}

function calcPiesOutSideLabelPos(pies) {
  pies.forEach(function (pieItem) {
    var leftPieDataItems = getLeftOrRightPieDataItems(pieItem);
    var rightPieDataItems = getLeftOrRightPieDataItems(pieItem, false);
    leftPieDataItems = sortPiesFromTopToBottom(leftPieDataItems);
    rightPieDataItems = sortPiesFromTopToBottom(rightPieDataItems);
    addLabelLineAndAlign(leftPieDataItems, pieItem);
    addLabelLineAndAlign(rightPieDataItems, pieItem, false);
  });
  return pies;
}

function getLabelLineBendRadius(pieItem) {
  var labelLineBendGap = pieItem.outsideLabel.labelLineBendGap;
  var maxRadius = getPieMaxRadius(pieItem);

  if (typeof labelLineBendGap !== 'number') {
    labelLineBendGap = parseInt(labelLineBendGap) / 100 * maxRadius;
  }

  return labelLineBendGap + maxRadius;
}

function getPieMaxRadius(pieItem) {
  var data = pieItem.data;
  var radius = data.map(function (_ref8) {
    var _ref8$radius = (0, _slicedToArray2["default"])(_ref8.radius, 2),
        foo = _ref8$radius[0],
        r = _ref8$radius[1];

    return r;
  });
  return Math.max.apply(Math, (0, _toConsumableArray2["default"])(radius));
}

function getLeftOrRightPieDataItems(pieItem) {
  var left = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var data = pieItem.data,
      center = pieItem.center;
  var centerXPos = center[0];
  return data.filter(function (_ref9) {
    var edgeCenterPos = _ref9.edgeCenterPos;
    var xPos = edgeCenterPos[0];
    if (left) return xPos <= centerXPos;
    return xPos > centerXPos;
  });
}

function sortPiesFromTopToBottom(dataItem) {
  dataItem.sort(function (_ref10, _ref11) {
    var _ref10$edgeCenterPos = (0, _slicedToArray2["default"])(_ref10.edgeCenterPos, 2),
        t = _ref10$edgeCenterPos[0],
        ay = _ref10$edgeCenterPos[1];

    var _ref11$edgeCenterPos = (0, _slicedToArray2["default"])(_ref11.edgeCenterPos, 2),
        tt = _ref11$edgeCenterPos[0],
        by = _ref11$edgeCenterPos[1];

    if (ay > by) return 1;
    if (ay < by) return -1;
    if (ay === by) return 0;
  });
  return dataItem;
}

function addLabelLineAndAlign(dataItem, pieItem) {
  var left = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var center = pieItem.center,
      outsideLabel = pieItem.outsideLabel;
  var radius = getLabelLineBendRadius(pieItem);
  dataItem.forEach(function (item) {
    var edgeCenterPos = item.edgeCenterPos,
        startAngle = item.startAngle,
        endAngle = item.endAngle;
    var labelLineEndLength = outsideLabel.labelLineEndLength;
    var angle = (startAngle + endAngle) / 2;

    var bendPoint = _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(center).concat([radius, angle]));

    var endPoint = (0, _toConsumableArray2["default"])(bendPoint);
    endPoint[0] += labelLineEndLength * (left ? -1 : 1);
    item.labelLine = [edgeCenterPos, bendPoint, endPoint];
    item.labelLineLength = (0, _util2.getPolylineLength)(item.labelLine);
    item.align = {
      textAlign: 'left',
      textBaseline: 'middle'
    };
    if (left) item.align.textAlign = 'right';
  });
}

function getPieConfig(pieItem) {
  var data = pieItem.data,
      animationCurve = pieItem.animationCurve,
      animationFrame = pieItem.animationFrame,
      rLevel = pieItem.rLevel;
  return data.map(function (foo, i) {
    return {
      name: 'pie',
      index: rLevel,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getPieShape(pieItem, i),
      style: getPieStyle(pieItem, i)
    };
  });
}

function getStartPieConfig(pieItem) {
  var animationDelayGap = pieItem.animationDelayGap,
      startAnimationCurve = pieItem.startAnimationCurve;
  var configs = getPieConfig(pieItem);
  configs.forEach(function (config, i) {
    config.animationCurve = startAnimationCurve;
    config.animationDelay = i * animationDelayGap;
    config.shape.or = config.shape.ir;
  });
  return configs;
}

function beforeChangePie(graph) {
  graph.animationDelay = 0;
}

function getPieShape(pieItem, i) {
  var center = pieItem.center,
      data = pieItem.data;
  var dataItem = data[i];
  var radius = dataItem.radius,
      startAngle = dataItem.startAngle,
      endAngle = dataItem.endAngle;
  return {
    startAngle: startAngle,
    endAngle: endAngle,
    ir: radius[0],
    or: radius[1],
    rx: center[0],
    ry: center[1]
  };
}

function getPieStyle(pieItem, i) {
  var pieStyle = pieItem.pieStyle,
      data = pieItem.data;
  var dataItem = data[i];
  var color = dataItem.color;
  return (0, _util2.deepMerge)({
    fill: color
  }, pieStyle);
}

function getInsideLabelConfig(pieItem) {
  var animationCurve = pieItem.animationCurve,
      animationFrame = pieItem.animationFrame,
      data = pieItem.data,
      rLevel = pieItem.rLevel;
  return data.map(function (foo, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: pieItem.insideLabel.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getInsideLabelShape(pieItem, i),
      style: getInsideLabelStyle(pieItem, i)
    };
  });
}

function getInsideLabelShape(pieItem, i) {
  var insideLabel = pieItem.insideLabel,
      data = pieItem.data;
  var formatter = insideLabel.formatter;
  var dataItem = data[i];
  var formatterType = (0, _typeof2["default"])(formatter);
  var label = '';

  if (formatterType === 'string') {
    label = formatter.replace('{name}', dataItem.name);
    label = label.replace('{percent}', dataItem.percent);
    label = label.replace('{value}', dataItem.value);
  }

  if (formatterType === 'function') {
    label = formatter(dataItem);
  }

  return {
    content: label,
    position: dataItem.insideLabelPos
  };
}

function getInsideLabelStyle(pieItem, i) {
  var style = pieItem.insideLabel.style;
  return style;
}

function getOutsideLabelLineConfig(pieItem) {
  var animationCurve = pieItem.animationCurve,
      animationFrame = pieItem.animationFrame,
      data = pieItem.data,
      rLevel = pieItem.rLevel;
  return data.map(function (foo, i) {
    return {
      name: 'polyline',
      index: rLevel,
      visible: pieItem.outsideLabel.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getOutsideLabelLineShape(pieItem, i),
      style: getOutsideLabelLineStyle(pieItem, i)
    };
  });
}

function getStartOutsideLabelLineConfig(pieItem) {
  var data = pieItem.data;
  var configs = getOutsideLabelLineConfig(pieItem);
  configs.forEach(function (config, i) {
    config.style.lineDash = [0, data[i].labelLineLength];
  });
  return configs;
}

function getOutsideLabelLineShape(pieItem, i) {
  var data = pieItem.data;
  var dataItem = data[i];
  return {
    points: dataItem.labelLine
  };
}

function getOutsideLabelLineStyle(pieItem, i) {
  var outsideLabel = pieItem.outsideLabel,
      data = pieItem.data;
  var labelLineStyle = outsideLabel.labelLineStyle;
  var color = data[i].color;
  return (0, _util2.deepMerge)({
    stroke: color,
    lineDash: [data[i].labelLineLength, 0]
  }, labelLineStyle);
}

function getOutsideLabelConfig(pieItem) {
  var animationCurve = pieItem.animationCurve,
      animationFrame = pieItem.animationFrame,
      data = pieItem.data,
      rLevel = pieItem.rLevel;
  return data.map(function (foo, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: pieItem.outsideLabel.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getOutsideLabelShape(pieItem, i),
      style: getOutsideLabelStyle(pieItem, i)
    };
  });
}

function getStartOutsideLabelConfig(pieItem) {
  var data = pieItem.data;
  var configs = getOutsideLabelConfig(pieItem);
  configs.forEach(function (config, i) {
    config.shape.position = data[i].labelLine[1];
  });
  return configs;
}

function getOutsideLabelShape(pieItem, i) {
  var outsideLabel = pieItem.outsideLabel,
      data = pieItem.data;
  var formatter = outsideLabel.formatter;
  var _data$i = data[i],
      labelLine = _data$i.labelLine,
      name = _data$i.name,
      percent = _data$i.percent,
      value = _data$i.value;
  var formatterType = (0, _typeof2["default"])(formatter);
  var label = '';

  if (formatterType === 'string') {
    label = formatter.replace('{name}', name);
    label = label.replace('{percent}', percent);
    label = label.replace('{value}', value);
  }

  if (formatterType === 'function') {
    label = formatter(data[i]);
  }

  return {
    content: label,
    position: labelLine[2]
  };
}

function getOutsideLabelStyle(pieItem, i) {
  var outsideLabel = pieItem.outsideLabel,
      data = pieItem.data;
  var _data$i2 = data[i],
      color = _data$i2.color,
      align = _data$i2.align;
  var style = outsideLabel.style;
  return (0, _util2.deepMerge)(_objectSpread({
    fill: color
  }, align), style);
}
},{"../class/updater.class":3,"../config/pie":12,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54}],25:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radar = radar;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _updater = require("../class/updater.class");

var _index = require("../config/index");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _color = require("@jiaminghi/color");

var _util2 = require("../util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function radar(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var series = option.series;
  if (!series) series = [];
  var radars = (0, _util2.initNeedSeries)(series, _index.radarConfig, 'radar');
  radars = calcRadarPosition(radars, chart);
  radars = calcRadarLabelPosition(radars, chart);
  radars = calcRadarLabelAlign(radars, chart);
  (0, _updater.doUpdate)({
    chart: chart,
    series: radars,
    key: 'radar',
    getGraphConfig: getRadarConfig,
    getStartGraphConfig: getStartRadarConfig,
    beforeChange: beforeChangeRadar
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: radars,
    key: 'radarPoint',
    getGraphConfig: getPointConfig,
    getStartGraphConfig: getStartPointConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: radars,
    key: 'radarLabel',
    getGraphConfig: getLabelConfig
  });
}

function calcRadarPosition(radars, chart) {
  var radarAxis = chart.radarAxis;
  if (!radarAxis) return [];
  var indicator = radarAxis.indicator,
      axisLineAngles = radarAxis.axisLineAngles,
      radius = radarAxis.radius,
      centerPos = radarAxis.centerPos;
  radars.forEach(function (radarItem) {
    var data = radarItem.data;
    radarItem.dataRadius = [];
    radarItem.radarPosition = indicator.map(function (_ref, i) {
      var max = _ref.max,
          min = _ref.min;
      var v = data[i];
      if (typeof max !== 'number') max = v;
      if (typeof min !== 'number') min = 0;
      if (typeof v !== 'number') v = min;
      var dataRadius = (v - min) / (max - min) * radius;
      radarItem.dataRadius[i] = dataRadius;
      return _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(centerPos).concat([dataRadius, axisLineAngles[i]]));
    });
  });
  return radars;
}

function calcRadarLabelPosition(radars, chart) {
  var radarAxis = chart.radarAxis;
  if (!radarAxis) return [];
  var centerPos = radarAxis.centerPos,
      axisLineAngles = radarAxis.axisLineAngles;
  radars.forEach(function (radarItem) {
    var dataRadius = radarItem.dataRadius,
        label = radarItem.label;
    var labelGap = label.labelGap;
    radarItem.labelPosition = dataRadius.map(function (r, i) {
      return _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(centerPos).concat([r + labelGap, axisLineAngles[i]]));
    });
  });
  return radars;
}

function calcRadarLabelAlign(radars, chart) {
  var radarAxis = chart.radarAxis;
  if (!radarAxis) return [];

  var _radarAxis$centerPos = (0, _slicedToArray2["default"])(radarAxis.centerPos, 2),
      x = _radarAxis$centerPos[0],
      y = _radarAxis$centerPos[1];

  radars.forEach(function (radarItem) {
    var labelPosition = radarItem.labelPosition;
    var labelAlign = labelPosition.map(function (_ref2) {
      var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
          lx = _ref3[0],
          ly = _ref3[1];

      var textAlign = lx > x ? 'left' : 'right';
      var textBaseline = ly > y ? 'top' : 'bottom';
      return {
        textAlign: textAlign,
        textBaseline: textBaseline
      };
    });
    radarItem.labelAlign = labelAlign;
  });
  return radars;
}

function getRadarConfig(radarItem) {
  var animationCurve = radarItem.animationCurve,
      animationFrame = radarItem.animationFrame,
      rLevel = radarItem.rLevel;
  return [{
    name: 'polyline',
    index: rLevel,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: getRadarShape(radarItem),
    style: getRadarStyle(radarItem)
  }];
}

function getStartRadarConfig(radarItem, updater) {
  var centerPos = updater.chart.radarAxis.centerPos;
  var config = getRadarConfig(radarItem)[0];
  var pointNum = config.shape.points.length;
  var points = new Array(pointNum).fill(0).map(function (foo) {
    return (0, _toConsumableArray2["default"])(centerPos);
  });
  config.shape.points = points;
  return [config];
}

function getRadarShape(radarItem) {
  var radarPosition = radarItem.radarPosition;
  return {
    points: radarPosition,
    close: true
  };
}

function getRadarStyle(radarItem) {
  var radarStyle = radarItem.radarStyle,
      color = radarItem.color;
  var colorRgbaValue = (0, _color.getRgbaValue)(color);
  colorRgbaValue[3] = 0.5;
  var radarDefaultColor = {
    stroke: color,
    fill: (0, _color.getColorFromRgbValue)(colorRgbaValue)
  };
  return (0, _util2.deepMerge)(radarDefaultColor, radarStyle);
}

function beforeChangeRadar(graph, _ref4) {
  var shape = _ref4.shape;
  var graphPoints = graph.shape.points;
  var graphPointsNum = graphPoints.length;
  var pointsNum = shape.points.length;

  if (pointsNum > graphPointsNum) {
    var lastPoint = graphPoints.slice(-1)[0];
    var newAddPoints = new Array(pointsNum - graphPointsNum).fill(0).map(function (foo) {
      return (0, _toConsumableArray2["default"])(lastPoint);
    });
    graphPoints.push.apply(graphPoints, (0, _toConsumableArray2["default"])(newAddPoints));
  } else if (pointsNum < graphPointsNum) {
    graphPoints.splice(pointsNum);
  }
}

function getPointConfig(radarItem) {
  var radarPosition = radarItem.radarPosition,
      animationCurve = radarItem.animationCurve,
      animationFrame = radarItem.animationFrame,
      rLevel = radarItem.rLevel;
  return radarPosition.map(function (foo, i) {
    return {
      name: 'circle',
      index: rLevel,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      visible: radarItem.point.show,
      shape: getPointShape(radarItem, i),
      style: getPointStyle(radarItem, i)
    };
  });
}

function getStartPointConfig(radarItem) {
  var configs = getPointConfig(radarItem);
  configs.forEach(function (config) {
    return config.shape.r = 0.01;
  });
  return configs;
}

function getPointShape(radarItem, i) {
  var radarPosition = radarItem.radarPosition,
      point = radarItem.point;
  var radius = point.radius;
  var position = radarPosition[i];
  return {
    rx: position[0],
    ry: position[1],
    r: radius
  };
}

function getPointStyle(radarItem, i) {
  var point = radarItem.point,
      color = radarItem.color;
  var style = point.style;
  return (0, _util2.deepMerge)({
    stroke: color
  }, style);
}

function getLabelConfig(radarItem) {
  var labelPosition = radarItem.labelPosition,
      animationCurve = radarItem.animationCurve,
      animationFrame = radarItem.animationFrame,
      rLevel = radarItem.rLevel;
  return labelPosition.map(function (foo, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: radarItem.label.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getLabelShape(radarItem, i),
      style: getLabelStyle(radarItem, i)
    };
  });
}

function getLabelShape(radarItem, i) {
  var labelPosition = radarItem.labelPosition,
      label = radarItem.label,
      data = radarItem.data;
  var offset = label.offset,
      formatter = label.formatter;
  var position = mergePointOffset(labelPosition[i], offset);
  var labelText = data[i] ? data[i].toString() : '0';
  var formatterType = (0, _typeof2["default"])(formatter);
  if (formatterType === 'string') labelText = formatter.replace('{value}', labelText);
  if (formatterType === 'function') labelText = formatter(labelText);
  return {
    content: labelText,
    position: position
  };
}

function mergePointOffset(_ref5, _ref6) {
  var _ref7 = (0, _slicedToArray2["default"])(_ref5, 2),
      x = _ref7[0],
      y = _ref7[1];

  var _ref8 = (0, _slicedToArray2["default"])(_ref6, 2),
      ox = _ref8[0],
      oy = _ref8[1];

  return [x + ox, y + oy];
}

function getLabelStyle(radarItem, i) {
  var label = radarItem.label,
      color = radarItem.color,
      labelAlign = radarItem.labelAlign;
  var style = label.style;

  var defaultColorAndAlign = _objectSpread({
    fill: color
  }, labelAlign[i]);

  return (0, _util2.deepMerge)(defaultColorAndAlign, style);
}
},{"../class/updater.class":3,"../config/index":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54,"@jiaminghi/color":56}],26:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radarAxis = radarAxis;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _updater = require("../class/updater.class");

var _index = require("../config/index");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _util2 = require("../util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function radarAxis(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var radar = option.radar;
  var radarAxis = [];

  if (radar) {
    radarAxis = mergeRadarAxisDefaultConfig(radar);
    radarAxis = calcRadarAxisCenter(radarAxis, chart);
    radarAxis = calcRadarAxisRingRadius(radarAxis, chart);
    radarAxis = calcRadarAxisLinePosition(radarAxis);
    radarAxis = calcRadarAxisAreaRadius(radarAxis);
    radarAxis = calcRadarAxisLabelPosition(radarAxis);
    radarAxis = [radarAxis];
  }

  var radarAxisForUpdate = radarAxis;
  if (radarAxis.length && !radarAxis[0].show) radarAxisForUpdate = [];
  (0, _updater.doUpdate)({
    chart: chart,
    series: radarAxisForUpdate,
    key: 'radarAxisSplitArea',
    getGraphConfig: getSplitAreaConfig,
    beforeUpdate: beforeUpdateSplitArea,
    beforeChange: beforeChangeSplitArea
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: radarAxisForUpdate,
    key: 'radarAxisSplitLine',
    getGraphConfig: getSplitLineConfig,
    beforeUpdate: beforeUpdateSplitLine,
    beforeChange: beforeChangeSplitLine
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: radarAxisForUpdate,
    key: 'radarAxisLine',
    getGraphConfig: getAxisLineConfig
  });
  (0, _updater.doUpdate)({
    chart: chart,
    series: radarAxisForUpdate,
    key: 'radarAxisLable',
    getGraphConfig: getAxisLabelConfig
  });
  chart.radarAxis = radarAxis[0];
}

function mergeRadarAxisDefaultConfig(radar) {
  return (0, _util2.deepMerge)((0, _util.deepClone)(_index.radarAxisConfig), radar);
}

function calcRadarAxisCenter(radarAxis, chart) {
  var area = chart.render.area;
  var center = radarAxis.center;
  radarAxis.centerPos = center.map(function (v, i) {
    if (typeof v === 'number') return v;
    return parseInt(v) / 100 * area[i];
  });
  return radarAxis;
}

function calcRadarAxisRingRadius(radarAxis, chart) {
  var area = chart.render.area;
  var splitNum = radarAxis.splitNum,
      radius = radarAxis.radius;
  var maxRadius = Math.min.apply(Math, (0, _toConsumableArray2["default"])(area)) / 2;
  if (typeof radius !== 'number') radius = parseInt(radius) / 100 * maxRadius;
  var splitGap = radius / splitNum;
  radarAxis.ringRadius = new Array(splitNum).fill(0).map(function (foo, i) {
    return splitGap * (i + 1);
  });
  radarAxis.radius = radius;
  return radarAxis;
}

function calcRadarAxisLinePosition(radarAxis) {
  var indicator = radarAxis.indicator,
      centerPos = radarAxis.centerPos,
      radius = radarAxis.radius,
      startAngle = radarAxis.startAngle;
  var fullAngle = Math.PI * 2;
  var indicatorNum = indicator.length;
  var indicatorGap = fullAngle / indicatorNum;
  var angles = new Array(indicatorNum).fill(0).map(function (foo, i) {
    return indicatorGap * i + startAngle;
  });
  radarAxis.axisLineAngles = angles;
  radarAxis.axisLinePosition = angles.map(function (g) {
    return _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(centerPos).concat([radius, g]));
  });
  return radarAxis;
}

function calcRadarAxisAreaRadius(radarAxis) {
  var ringRadius = radarAxis.ringRadius;
  var subRadius = ringRadius[0] / 2;
  radarAxis.areaRadius = ringRadius.map(function (r) {
    return r - subRadius;
  });
  return radarAxis;
}

function calcRadarAxisLabelPosition(radarAxis) {
  var axisLineAngles = radarAxis.axisLineAngles,
      centerPos = radarAxis.centerPos,
      radius = radarAxis.radius,
      axisLabel = radarAxis.axisLabel;
  radius += axisLabel.labelGap;
  radarAxis.axisLabelPosition = axisLineAngles.map(function (angle) {
    return _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(centerPos).concat([radius, angle]));
  });
  return radarAxis;
}

function getSplitAreaConfig(radarAxis) {
  var areaRadius = radarAxis.areaRadius,
      polygon = radarAxis.polygon,
      animationCurve = radarAxis.animationCurve,
      animationFrame = radarAxis.animationFrame,
      rLevel = radarAxis.rLevel;
  var name = polygon ? 'regPolygon' : 'ring';
  return areaRadius.map(function (foo, i) {
    return {
      name: name,
      index: rLevel,
      visible: radarAxis.splitArea.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getSplitAreaShape(radarAxis, i),
      style: getSplitAreaStyle(radarAxis, i)
    };
  });
}

function getSplitAreaShape(radarAxis, i) {
  var polygon = radarAxis.polygon,
      areaRadius = radarAxis.areaRadius,
      indicator = radarAxis.indicator,
      centerPos = radarAxis.centerPos;
  var indicatorNum = indicator.length;
  var shape = {
    rx: centerPos[0],
    ry: centerPos[1],
    r: areaRadius[i]
  };
  if (polygon) shape.side = indicatorNum;
  return shape;
}

function getSplitAreaStyle(radarAxis, i) {
  var splitArea = radarAxis.splitArea,
      ringRadius = radarAxis.ringRadius,
      axisLineAngles = radarAxis.axisLineAngles,
      polygon = radarAxis.polygon,
      centerPos = radarAxis.centerPos;
  var color = splitArea.color,
      style = splitArea.style;
  style = _objectSpread({
    fill: 'rgba(0, 0, 0, 0)'
  }, style);
  var lineWidth = ringRadius[0] - 0;

  if (polygon) {
    var point1 = _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(centerPos).concat([ringRadius[0], axisLineAngles[0]]));

    var point2 = _util.getCircleRadianPoint.apply(void 0, (0, _toConsumableArray2["default"])(centerPos).concat([ringRadius[0], axisLineAngles[1]]));

    lineWidth = (0, _util2.getPointToLineDistance)(centerPos, point1, point2);
  }

  style = (0, _util2.deepMerge)((0, _util.deepClone)(style, true), {
    lineWidth: lineWidth
  });
  if (!color.length) return style;
  var colorNum = color.length;
  return (0, _util2.deepMerge)(style, {
    stroke: color[i % colorNum]
  });
}

function beforeUpdateSplitArea(graphs, radarAxis, i, updater) {
  var cache = graphs[i];
  if (!cache) return;
  var render = updater.chart.render;
  var polygon = radarAxis.polygon;
  var name = cache[0].name;
  var currentName = polygon ? 'regPolygon' : 'ring';
  var delAll = currentName !== name;
  if (!delAll) return;
  cache.forEach(function (g) {
    return render.delGraph(g);
  });
  graphs[i] = null;
}

function beforeChangeSplitArea(graph, config) {
  var side = config.shape.side;
  if (typeof side !== 'number') return;
  graph.shape.side = side;
}

function getSplitLineConfig(radarAxis) {
  var ringRadius = radarAxis.ringRadius,
      polygon = radarAxis.polygon,
      animationCurve = radarAxis.animationCurve,
      animationFrame = radarAxis.animationFrame,
      rLevel = radarAxis.rLevel;
  var name = polygon ? 'regPolygon' : 'ring';
  return ringRadius.map(function (foo, i) {
    return {
      name: name,
      index: rLevel,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      visible: radarAxis.splitLine.show,
      shape: getSplitLineShape(radarAxis, i),
      style: getSplitLineStyle(radarAxis, i)
    };
  });
}

function getSplitLineShape(radarAxis, i) {
  var ringRadius = radarAxis.ringRadius,
      centerPos = radarAxis.centerPos,
      indicator = radarAxis.indicator,
      polygon = radarAxis.polygon;
  var shape = {
    rx: centerPos[0],
    ry: centerPos[1],
    r: ringRadius[i]
  };
  var indicatorNum = indicator.length;
  if (polygon) shape.side = indicatorNum;
  return shape;
}

function getSplitLineStyle(radarAxis, i) {
  var splitLine = radarAxis.splitLine;
  var color = splitLine.color,
      style = splitLine.style;
  style = _objectSpread({
    fill: 'rgba(0, 0, 0, 0)'
  }, style);
  if (!color.length) return style;
  var colorNum = color.length;
  return (0, _util2.deepMerge)(style, {
    stroke: color[i % colorNum]
  });
}

function beforeUpdateSplitLine(graphs, radarAxis, i, updater) {
  var cache = graphs[i];
  if (!cache) return;
  var render = updater.chart.render;
  var polygon = radarAxis.polygon;
  var name = cache[0].name;
  var currenName = polygon ? 'regPolygon' : 'ring';
  var delAll = currenName !== name;
  if (!delAll) return;
  cache.forEach(function (g) {
    return render.delGraph(g);
  });
  graphs[i] = null;
}

function beforeChangeSplitLine(graph, config) {
  var side = config.shape.side;
  if (typeof side !== 'number') return;
  graph.shape.side = side;
}

function getAxisLineConfig(radarAxis) {
  var axisLinePosition = radarAxis.axisLinePosition,
      animationCurve = radarAxis.animationCurve,
      animationFrame = radarAxis.animationFrame,
      rLevel = radarAxis.rLevel;
  return axisLinePosition.map(function (foo, i) {
    return {
      name: 'polyline',
      index: rLevel,
      visible: radarAxis.axisLine.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getAxisLineShape(radarAxis, i),
      style: getAxisLineStyle(radarAxis, i)
    };
  });
}

function getAxisLineShape(radarAxis, i) {
  var centerPos = radarAxis.centerPos,
      axisLinePosition = radarAxis.axisLinePosition;
  var points = [centerPos, axisLinePosition[i]];
  return {
    points: points
  };
}

function getAxisLineStyle(radarAxis, i) {
  var axisLine = radarAxis.axisLine;
  var color = axisLine.color,
      style = axisLine.style;
  if (!color.length) return style;
  var colorNum = color.length;
  return (0, _util2.deepMerge)(style, {
    stroke: color[i % colorNum]
  });
}

function getAxisLabelConfig(radarAxis) {
  var axisLabelPosition = radarAxis.axisLabelPosition,
      animationCurve = radarAxis.animationCurve,
      animationFrame = radarAxis.animationFrame,
      rLevel = radarAxis.rLevel;
  return axisLabelPosition.map(function (foo, i) {
    return {
      name: 'text',
      index: rLevel,
      visible: radarAxis.axisLabel.show,
      animationCurve: animationCurve,
      animationFrame: animationFrame,
      shape: getAxisLableShape(radarAxis, i),
      style: getAxisLableStyle(radarAxis, i)
    };
  });
}

function getAxisLableShape(radarAxis, i) {
  var axisLabelPosition = radarAxis.axisLabelPosition,
      indicator = radarAxis.indicator;
  return {
    content: indicator[i].name,
    position: axisLabelPosition[i]
  };
}

function getAxisLableStyle(radarAxis, i) {
  var axisLabel = radarAxis.axisLabel,
      _radarAxis$centerPos = (0, _slicedToArray2["default"])(radarAxis.centerPos, 2),
      x = _radarAxis$centerPos[0],
      y = _radarAxis$centerPos[1],
      axisLabelPosition = radarAxis.axisLabelPosition;

  var color = axisLabel.color,
      style = axisLabel.style;

  var _axisLabelPosition$i = (0, _slicedToArray2["default"])(axisLabelPosition[i], 2),
      labelXpos = _axisLabelPosition$i[0],
      labelYPos = _axisLabelPosition$i[1];

  var textAlign = labelXpos > x ? 'left' : 'right';
  var textBaseline = labelYPos > y ? 'top' : 'bottom';
  style = (0, _util2.deepMerge)({
    textAlign: textAlign,
    textBaseline: textBaseline
  }, style);
  if (!color.length) return style;
  var colorNum = color.length;
  return (0, _util2.deepMerge)(style, {
    fill: color[i % colorNum]
  });
}
},{"../class/updater.class":3,"../config/index":9,"../util":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@jiaminghi/c-render/lib/plugin/util":54}],27:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.title = title;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _updater = require("../class/updater.class");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _config = require("../config");

var _util2 = require("../util");

function title(chart) {
  var option = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var title = [];

  if (option.title) {
    title[0] = (0, _util2.deepMerge)((0, _util.deepClone)(_config.titleConfig, true), option.title);
  }

  (0, _updater.doUpdate)({
    chart: chart,
    series: title,
    key: 'title',
    getGraphConfig: getTitleConfig
  });
}

function getTitleConfig(titleItem, updater) {
  var animationCurve = _config.titleConfig.animationCurve,
      animationFrame = _config.titleConfig.animationFrame,
      rLevel = _config.titleConfig.rLevel;
  var shape = getTitleShape(titleItem, updater);
  var style = getTitleStyle(titleItem);
  return [{
    name: 'text',
    index: rLevel,
    visible: titleItem.show,
    animationCurve: animationCurve,
    animationFrame: animationFrame,
    shape: shape,
    style: style
  }];
}

function getTitleShape(titleItem, updater) {
  var offset = titleItem.offset,
      text = titleItem.text;
  var _updater$chart$gridAr = updater.chart.gridArea,
      x = _updater$chart$gridAr.x,
      y = _updater$chart$gridAr.y,
      w = _updater$chart$gridAr.w;

  var _offset = (0, _slicedToArray2["default"])(offset, 2),
      ox = _offset[0],
      oy = _offset[1];

  return {
    content: text,
    position: [x + w / 2 + ox, y + oy]
  };
}

function getTitleStyle(titleItem) {
  var style = titleItem.style;
  return style;
}
},{"../class/updater.class":3,"../config":9,"../util":30,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@jiaminghi/c-render/lib/plugin/util":54}],28:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _cRender = require("@jiaminghi/c-render");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _color = require("@jiaminghi/color");

var _index = require("../util/index");

var pie = {
  shape: {
    rx: 0,
    ry: 0,
    ir: 0,
    or: 0,
    startAngle: 0,
    endAngle: 0,
    clockWise: true
  },
  validator: function validator(_ref) {
    var shape = _ref.shape;
    var keys = ['rx', 'ry', 'ir', 'or', 'startAngle', 'endAngle'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('Pie shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref2, _ref3) {
    var ctx = _ref2.ctx;
    var shape = _ref3.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        ir = shape.ir,
        or = shape.or,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    rx = parseInt(rx) + 0.5;
    ry = parseInt(ry) + 0.5;
    ctx.arc(rx, ry, ir > 0 ? ir : 0, startAngle, endAngle, !clockWise);
    var connectPoint1 = (0, _util.getCircleRadianPoint)(rx, ry, or, endAngle).map(function (p) {
      return parseInt(p) + 0.5;
    });
    var connectPoint2 = (0, _util.getCircleRadianPoint)(rx, ry, ir, startAngle).map(function (p) {
      return parseInt(p) + 0.5;
    });
    ctx.lineTo.apply(ctx, (0, _toConsumableArray2["default"])(connectPoint1));
    ctx.arc(rx, ry, or > 0 ? or : 0, endAngle, startAngle, clockWise);
    ctx.lineTo.apply(ctx, (0, _toConsumableArray2["default"])(connectPoint2));
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
};
var agArc = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    startAngle: 0,
    endAngle: 0,
    gradientStartAngle: null,
    gradientEndAngle: null
  },
  validator: function validator(_ref4) {
    var shape = _ref4.shape;
    var keys = ['rx', 'ry', 'r', 'startAngle', 'endAngle'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('AgArc shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref5, _ref6) {
    var ctx = _ref5.ctx;
    var shape = _ref6.shape,
        style = _ref6.style;
    var gradient = style.gradient;
    gradient = gradient.map(function (cv) {
      return (0, _color.getColorFromRgbValue)(cv);
    });

    if (gradient.length === 1) {
      gradient = [gradient[0], gradient[0]];
    }

    var gradientArcNum = gradient.length - 1;
    var gradientStartAngle = shape.gradientStartAngle,
        gradientEndAngle = shape.gradientEndAngle,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        r = shape.r,
        rx = shape.rx,
        ry = shape.ry;
    if (gradientStartAngle === null) gradientStartAngle = startAngle;
    if (gradientEndAngle === null) gradientEndAngle = endAngle;
    var angleGap = (gradientEndAngle - gradientStartAngle) / gradientArcNum;
    if (angleGap === Math.PI * 2) angleGap = Math.PI * 2 - 0.001;

    for (var i = 0; i < gradientArcNum; i++) {
      ctx.beginPath();
      var startPoint = (0, _util.getCircleRadianPoint)(rx, ry, r, startAngle + angleGap * i);
      var endPoint = (0, _util.getCircleRadianPoint)(rx, ry, r, startAngle + angleGap * (i + 1));
      var color = (0, _index.getLinearGradientColor)(ctx, startPoint, endPoint, [gradient[i], gradient[i + 1]]);
      var arcStartAngle = startAngle + angleGap * i;
      var arcEndAngle = startAngle + angleGap * (i + 1);
      var doBreak = false;

      if (arcEndAngle > endAngle) {
        arcEndAngle = endAngle;
        doBreak = true;
      }

      ctx.arc(rx, ry, r, arcStartAngle, arcEndAngle);
      ctx.strokeStyle = color;
      ctx.stroke();
      if (doBreak) break;
    }
  }
};
var numberText = {
  shape: {
    number: [],
    content: '',
    position: [0, 0],
    toFixed: 0
  },
  validator: function validator(_ref7) {
    var shape = _ref7.shape;
    var number = shape.number,
        content = shape.content,
        position = shape.position;

    if (!(number instanceof Array) || typeof content !== 'string' || !(position instanceof Array)) {
      console.error('NumberText shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref8, _ref9) {
    var ctx = _ref8.ctx;
    var shape = _ref9.shape;
    ctx.beginPath();
    var number = shape.number,
        content = shape.content,
        position = shape.position,
        toFixed = shape.toFixed;
    var textSegments = content.split('{nt}');
    var lastSegmentIndex = textSegments.length - 1;
    var textString = '';
    textSegments.forEach(function (t, i) {
      var currentNumber = number[i];
      if (i === lastSegmentIndex) currentNumber = '';
      if (typeof currentNumber === 'number') currentNumber = currentNumber.toFixed(toFixed);
      textString += t + (currentNumber || '');
    });
    ctx.closePath();
    ctx.strokeText.apply(ctx, [textString].concat((0, _toConsumableArray2["default"])(position)));
    ctx.fillText.apply(ctx, [textString].concat((0, _toConsumableArray2["default"])(position)));
  }
};
var lineIcon = {
  shape: {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  },
  validator: function validator(_ref10) {
    var shape = _ref10.shape;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof w !== 'number' || typeof h !== 'number') {
      console.error('lineIcon shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref11, _ref12) {
    var ctx = _ref11.ctx;
    var shape = _ref12.shape;
    ctx.beginPath();
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    var halfH = h / 2;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.moveTo(x, y + halfH);
    ctx.lineTo(x + w, y + halfH);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    var radius = halfH - 5 * 2;
    if (radius <= 0) radius = 3;
    ctx.arc(x + w / 2, y + halfH, radius, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fill();
  },
  hoverCheck: function hoverCheck(position, _ref13) {
    var shape = _ref13.shape;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    return (0, _util.checkPointIsInRect)(position, x, y, w, h);
  },
  setGraphCenter: function setGraphCenter(e, _ref14) {
    var shape = _ref14.shape,
        style = _ref14.style;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    style.graphCenter = [x + w / 2, y + h / 2];
  }
};
(0, _cRender.extendNewGraph)('pie', pie);
(0, _cRender.extendNewGraph)('agArc', agArc);
(0, _cRender.extendNewGraph)('numberText', numberText);
(0, _cRender.extendNewGraph)('lineIcon', lineIcon);
},{"../util/index":30,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@jiaminghi/c-render":52,"@jiaminghi/c-render/lib/plugin/util":54,"@jiaminghi/color":56}],29:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "changeDefaultConfig", {
  enumerable: true,
  get: function get() {
    return _config.changeDefaultConfig;
  }
});
exports["default"] = void 0;

var _charts = _interopRequireDefault(require("./class/charts.class"));

var _config = require("./config");

var _default = _charts["default"];
exports["default"] = _default;
},{"./class/charts.class":2,"./config":9,"@babel/runtime/helpers/interopRequireDefault":36}],30:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterNonNumber = filterNonNumber;
exports.deepMerge = deepMerge;
exports.mulAdd = mulAdd;
exports.mergeSameStackData = mergeSameStackData;
exports.getTwoPointDistance = getTwoPointDistance;
exports.getLinearGradientColor = getLinearGradientColor;
exports.getPolylineLength = getPolylineLength;
exports.getPointToLineDistance = getPointToLineDistance;
exports.initNeedSeries = initNeedSeries;
exports.radianToAngle = radianToAngle;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _util = require("@jiaminghi/c-render/lib/plugin/util");

function filterNonNumber(array) {
  return array.filter(function (n) {
    return typeof n === 'number';
  });
}

function deepMerge(target, merged) {
  for (var key in merged) {
    target[key] = target[key] && (0, _typeof2["default"])(target[key]) === 'object' ? deepMerge(target[key], merged[key]) : target[key] = merged[key];
  }

  return target;
}

function mulAdd(nums) {
  nums = filterNonNumber(nums);
  return nums.reduce(function (all, num) {
    return all + num;
  }, 0);
}

function mergeSameStackData(item, series) {
  var stack = item.stack;
  if (!stack) return (0, _toConsumableArray2["default"])(item.data);
  var stacks = series.filter(function (_ref) {
    var s = _ref.stack;
    return s === stack;
  });
  var index = stacks.findIndex(function (_ref2) {
    var d = _ref2.data;
    return d === item.data;
  });
  var datas = stacks.splice(0, index + 1).map(function (_ref3) {
    var data = _ref3.data;
    return data;
  });
  var dataLength = datas[0].length;
  return new Array(dataLength).fill(0).map(function (foo, i) {
    return mulAdd(datas.map(function (d) {
      return d[i];
    }));
  });
}

function getTwoPointDistance(pointOne, pointTwo) {
  var minusX = Math.abs(pointOne[0] - pointTwo[0]);
  var minusY = Math.abs(pointOne[1] - pointTwo[1]);
  return Math.sqrt(minusX * minusX + minusY * minusY);
}

function getLinearGradientColor(ctx, begin, end, color) {
  if (!ctx || !begin || !end || !color.length) return;
  var colors = color;
  typeof colors === 'string' && (colors = [color, color]);
  var linearGradientColor = ctx.createLinearGradient.apply(ctx, (0, _toConsumableArray2["default"])(begin).concat((0, _toConsumableArray2["default"])(end)));
  var colorGap = 1 / (colors.length - 1);
  colors.forEach(function (c, i) {
    return linearGradientColor.addColorStop(colorGap * i, c);
  });
  return linearGradientColor;
}

function getPolylineLength(points) {
  var lineSegments = new Array(points.length - 1).fill(0).map(function (foo, i) {
    return [points[i], points[i + 1]];
  });
  var lengths = lineSegments.map(function (item) {
    return getTwoPointDistance.apply(void 0, (0, _toConsumableArray2["default"])(item));
  });
  return mulAdd(lengths);
}

function getPointToLineDistance(point, linePointOne, linePointTwo) {
  var a = getTwoPointDistance(point, linePointOne);
  var b = getTwoPointDistance(point, linePointTwo);
  var c = getTwoPointDistance(linePointOne, linePointTwo);
  return 0.5 * Math.sqrt((a + b + c) * (a + b - c) * (a + c - b) * (b + c - a)) / c;
}

function initNeedSeries(series, config, type) {
  series = series.filter(function (_ref4) {
    var st = _ref4.type;
    return st === type;
  });
  series = series.map(function (item) {
    return deepMerge((0, _util.deepClone)(config, true), item);
  });
  return series.filter(function (_ref5) {
    var show = _ref5.show;
    return show;
  });
}

function radianToAngle(radian) {
  return radian / Math.PI * 180;
}
},{"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@jiaminghi/c-render/lib/plugin/util":54}],31:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],32:[function(require,module,exports){
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

module.exports = _arrayWithoutHoles;
},{}],33:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],34:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],35:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],36:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],37:[function(require,module,exports){
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],38:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],39:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

module.exports = _nonIterableRest;
},{}],40:[function(require,module,exports){
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

module.exports = _nonIterableSpread;
},{}],41:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":31,"./iterableToArrayLimit":38,"./nonIterableRest":39}],42:[function(require,module,exports){
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":32,"./iterableToArray":37,"./nonIterableSpread":40}],43:[function(require,module,exports){
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],44:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":59}],45:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bezierCurveToPolyline = bezierCurveToPolyline;
exports.getBezierCurveLength = getBezierCurveLength;
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var sqrt = Math.sqrt,
    pow = Math.pow,
    ceil = Math.ceil,
    abs = Math.abs; // Initialize the number of points per curve

var defaultSegmentPointsNum = 50;
/**
 * @example data structure of bezierCurve
 * bezierCurve = [
 *  // Starting point of the curve
 *  [10, 10],
 *  // BezierCurve segment data (controlPoint1, controlPoint2, endPoint)
 *  [
 *    [20, 20], [40, 20], [50, 10]
 *  ],
 *  ...
 * ]
 */

/**
 * @description               Abstract the curve as a polyline consisting of N points
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Object}           Calculation results and related data
 * @return {Array}            Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number}           Option.cycles Number of iterations
 * @return {Number}           Option.rounds The number of recursions for the last iteration
 */

function abstractBezierCurveToPolyline(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  var segmentsNum = bezierCurve.length - 1;
  var startPoint = bezierCurve[0];
  var endPoint = bezierCurve[segmentsNum][2];
  var segments = bezierCurve.slice(1);
  var getSegmentTPointFuns = segments.map(function (seg, i) {
    var beginPoint = i === 0 ? startPoint : segments[i - 1][2];
    return createGetBezierCurveTPointFun.apply(void 0, [beginPoint].concat((0, _toConsumableArray2["default"])(seg)));
  }); // Initialize the curve to a polyline

  var segmentPointsNum = new Array(segmentsNum).fill(defaultSegmentPointsNum);
  var segmentPoints = getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum); // Calculate uniformly distributed points by iteratively

  var result = calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, segments, precision);
  result.segmentPoints.push(endPoint);
  return result;
}
/**
 * @description  Generate a method for obtaining corresponding point by t according to curve data
 * @param {Array} beginPoint    BezierCurve begin point. [x, y]
 * @param {Array} controlPoint1 BezierCurve controlPoint1. [x, y]
 * @param {Array} controlPoint2 BezierCurve controlPoint2. [x, y]
 * @param {Array} endPoint      BezierCurve end point. [x, y]
 * @return {Function} Expected function
 */


function createGetBezierCurveTPointFun(beginPoint, controlPoint1, controlPoint2, endPoint) {
  return function (t) {
    var tSubed1 = 1 - t;
    var tSubed1Pow3 = pow(tSubed1, 3);
    var tSubed1Pow2 = pow(tSubed1, 2);
    var tPow3 = pow(t, 3);
    var tPow2 = pow(t, 2);
    return [beginPoint[0] * tSubed1Pow3 + 3 * controlPoint1[0] * t * tSubed1Pow2 + 3 * controlPoint2[0] * tPow2 * tSubed1 + endPoint[0] * tPow3, beginPoint[1] * tSubed1Pow3 + 3 * controlPoint1[1] * t * tSubed1Pow2 + 3 * controlPoint2[1] * tPow2 * tSubed1 + endPoint[1] * tPow3];
  };
}
/**
 * @description Get the distance between two points
 * @param {Array} point1 BezierCurve begin point. [x, y]
 * @param {Array} point2 BezierCurve controlPoint1. [x, y]
 * @return {Number} Expected distance
 */


function getTwoPointDistance(_ref, _ref2) {
  var _ref3 = (0, _slicedToArray2["default"])(_ref, 2),
      ax = _ref3[0],
      ay = _ref3[1];

  var _ref4 = (0, _slicedToArray2["default"])(_ref2, 2),
      bx = _ref4[0],
      by = _ref4[1];

  return sqrt(pow(ax - bx, 2) + pow(ay - by, 2));
}
/**
 * @description Get the sum of the array of numbers
 * @param {Array} nums An array of numbers
 * @return {Number} Expected sum
 */


function getNumsSum(nums) {
  return nums.reduce(function (sum, num) {
    return sum + num;
  }, 0);
}
/**
 * @description Get the distance of multiple sets of points
 * @param {Array} segmentPoints Multiple sets of point data
 * @return {Array} Distance of multiple sets of point data
 */


function getSegmentPointsDistance(segmentPoints) {
  return segmentPoints.map(function (points, i) {
    return new Array(points.length - 1).fill(0).map(function (temp, j) {
      return getTwoPointDistance(points[j], points[j + 1]);
    });
  });
}
/**
 * @description Get the distance of multiple sets of points
 * @param {Array} segmentPoints Multiple sets of point data
 * @return {Array} Distance of multiple sets of point data
 */


function getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum) {
  return getSegmentTPointFuns.map(function (getSegmentTPointFun, i) {
    var tGap = 1 / segmentPointsNum[i];
    return new Array(segmentPointsNum[i]).fill('').map(function (foo, j) {
      return getSegmentTPointFun(j * tGap);
    });
  });
}
/**
 * @description Get the sum of deviations between line segment and the average length
 * @param {Array} segmentPointsDistance Segment length of polyline
 * @param {Number} avgLength            Average length of the line segment
 * @return {Number} Deviations
 */


function getAllDeviations(segmentPointsDistance, avgLength) {
  return segmentPointsDistance.map(function (seg) {
    return seg.map(function (s) {
      return abs(s - avgLength);
    });
  }).map(function (seg) {
    return getNumsSum(seg);
  }).reduce(function (total, v) {
    return total + v;
  }, 0);
}
/**
 * @description Calculate uniformly distributed points by iteratively
 * @param {Array} segmentPoints        Multiple setd of points that make up a polyline
 * @param {Array} getSegmentTPointFuns Functions of get a point on the curve with t
 * @param {Array} segments             BezierCurve data
 * @param {Number} precision           Calculation accuracy
 * @return {Object} Calculation results and related data
 * @return {Array}  Option.segmentPoints Point data that constitutes a polyline after calculation
 * @return {Number} Option.cycles Number of iterations
 * @return {Number} Option.rounds The number of recursions for the last iteration
 */


function calcUniformPointsByIteration(segmentPoints, getSegmentTPointFuns, segments, precision) {
  // The number of loops for the current iteration
  var rounds = 4; // Number of iterations

  var cycles = 1;

  var _loop = function _loop() {
    // Recalculate the number of points per curve based on the last iteration data
    var totalPointsNum = segmentPoints.reduce(function (total, seg) {
      return total + seg.length;
    }, 0); // Add last points of segment to calc exact segment length

    segmentPoints.forEach(function (seg, i) {
      return seg.push(segments[i][2]);
    });
    var segmentPointsDistance = getSegmentPointsDistance(segmentPoints);
    var lineSegmentNum = segmentPointsDistance.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    var segmentlength = segmentPointsDistance.map(function (seg) {
      return getNumsSum(seg);
    });
    var totalLength = getNumsSum(segmentlength);
    var avgLength = totalLength / lineSegmentNum; // Check if precision is reached

    var allDeviations = getAllDeviations(segmentPointsDistance, avgLength);
    if (allDeviations <= precision) return "break";
    totalPointsNum = ceil(avgLength / precision * totalPointsNum * 1.1);
    var segmentPointsNum = segmentlength.map(function (length) {
      return ceil(length / totalLength * totalPointsNum);
    }); // Calculate the points after redistribution

    segmentPoints = getSegmentPointsByNum(getSegmentTPointFuns, segmentPointsNum);
    totalPointsNum = segmentPoints.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    var segmentPointsForLength = JSON.parse(JSON.stringify(segmentPoints));
    segmentPointsForLength.forEach(function (seg, i) {
      return seg.push(segments[i][2]);
    });
    segmentPointsDistance = getSegmentPointsDistance(segmentPointsForLength);
    lineSegmentNum = segmentPointsDistance.reduce(function (total, seg) {
      return total + seg.length;
    }, 0);
    segmentlength = segmentPointsDistance.map(function (seg) {
      return getNumsSum(seg);
    });
    totalLength = getNumsSum(segmentlength);
    avgLength = totalLength / lineSegmentNum;
    var stepSize = 1 / totalPointsNum / 10; // Recursively for each segment of the polyline

    getSegmentTPointFuns.forEach(function (getSegmentTPointFun, i) {
      var currentSegmentPointsNum = segmentPointsNum[i];
      var t = new Array(currentSegmentPointsNum).fill('').map(function (foo, j) {
        return j / segmentPointsNum[i];
      }); // Repeated recursive offset

      for (var r = 0; r < rounds; r++) {
        var distance = getSegmentPointsDistance([segmentPoints[i]])[0];
        var deviations = distance.map(function (d) {
          return d - avgLength;
        });
        var offset = 0;

        for (var j = 0; j < currentSegmentPointsNum; j++) {
          if (j === 0) return;
          offset += deviations[j - 1];
          t[j] -= stepSize * offset;
          if (t[j] > 1) t[j] = 1;
          if (t[j] < 0) t[j] = 0;
          segmentPoints[i][j] = getSegmentTPointFun(t[j]);
        }
      }
    });
    rounds *= 4;
    cycles++;
  };

  do {
    var _ret = _loop();

    if (_ret === "break") break;
  } while (rounds <= 1025);

  segmentPoints = segmentPoints.reduce(function (all, seg) {
    return all.concat(seg);
  }, []);
  return {
    segmentPoints: segmentPoints,
    cycles: cycles,
    rounds: rounds
  };
}
/**
 * @description Get the polyline corresponding to the Bezier curve
 * @param {Array} bezierCurve BezierCurve data
 * @param {Number} precision  Calculation accuracy. Recommended for 1-20. Default = 5
 * @return {Array|Boolean} Point data that constitutes a polyline after calculation (Invalid input will return false)
 */


function bezierCurveToPolyline(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (!bezierCurve) {
    console.error('bezierCurveToPolyline: Missing parameters!');
    return false;
  }

  if (!(bezierCurve instanceof Array)) {
    console.error('bezierCurveToPolyline: Parameter bezierCurve must be an array!');
    return false;
  }

  if (typeof precision !== 'number') {
    console.error('bezierCurveToPolyline: Parameter precision must be a number!');
    return false;
  }

  var _abstractBezierCurveT = abstractBezierCurveToPolyline(bezierCurve, precision),
      segmentPoints = _abstractBezierCurveT.segmentPoints;

  return segmentPoints;
}
/**
 * @description Get the bezier curve length
 * @param {Array} bezierCurve bezierCurve data
 * @param {Number} precision  calculation accuracy. Recommended for 5-10. Default = 5
 * @return {Number|Boolean} BezierCurve length (Invalid input will return false)
 */


function getBezierCurveLength(bezierCurve) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

  if (!bezierCurve) {
    console.error('getBezierCurveLength: Missing parameters!');
    return false;
  }

  if (!(bezierCurve instanceof Array)) {
    console.error('getBezierCurveLength: Parameter bezierCurve must be an array!');
    return false;
  }

  if (typeof precision !== 'number') {
    console.error('getBezierCurveLength: Parameter precision must be a number!');
    return false;
  }

  var _abstractBezierCurveT2 = abstractBezierCurveToPolyline(bezierCurve, precision),
      segmentPoints = _abstractBezierCurveT2.segmentPoints; // Calculate the total length of the points that make up the polyline


  var pointsDistance = getSegmentPointsDistance([segmentPoints])[0];
  var length = getNumsSum(pointsDistance);
  return length;
}

var _default = bezierCurveToPolyline;
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42}],46:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

/**
 * @description Abstract the polyline formed by N points into a set of bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array|Boolean} A set of bezier curve (Invalid input will return false)
 */
function polylineToBezierCurve(polyline) {
  var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var offsetA = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.25;
  var offsetB = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.25;

  if (!(polyline instanceof Array)) {
    console.error('polylineToBezierCurve: Parameter polyline must be an array!');
    return false;
  }

  if (polyline.length <= 2) {
    console.error('polylineToBezierCurve: Converting to a curve requires at least 3 points!');
    return false;
  }

  var startPoint = polyline[0];
  var bezierCurveLineNum = polyline.length - 1;
  var bezierCurvePoints = new Array(bezierCurveLineNum).fill(0).map(function (foo, i) {
    return [].concat((0, _toConsumableArray2["default"])(getBezierCurveLineControlPoints(polyline, i, close, offsetA, offsetB)), [polyline[i + 1]]);
  });
  if (close) closeBezierCurve(bezierCurvePoints, startPoint);
  bezierCurvePoints.unshift(polyline[0]);
  return bezierCurvePoints;
}
/**
 * @description Get the control points of the Bezier curve
 * @param {Array} polyline A set of points that make up a polyline
 * @param {Number} index   The index of which get controls points's point in polyline
 * @param {Boolean} close  Closed curve
 * @param {Number} offsetA Smoothness
 * @param {Number} offsetB Smoothness
 * @return {Array} Control points
 */


function getBezierCurveLineControlPoints(polyline, index) {
  var close = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var offsetA = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.25;
  var offsetB = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.25;
  var pointNum = polyline.length;
  if (pointNum < 3 || index >= pointNum) return;
  var beforePointIndex = index - 1;
  if (beforePointIndex < 0) beforePointIndex = close ? pointNum + beforePointIndex : 0;
  var afterPointIndex = index + 1;
  if (afterPointIndex >= pointNum) afterPointIndex = close ? afterPointIndex - pointNum : pointNum - 1;
  var afterNextPointIndex = index + 2;
  if (afterNextPointIndex >= pointNum) afterNextPointIndex = close ? afterNextPointIndex - pointNum : pointNum - 1;
  var pointBefore = polyline[beforePointIndex];
  var pointMiddle = polyline[index];
  var pointAfter = polyline[afterPointIndex];
  var pointAfterNext = polyline[afterNextPointIndex];
  return [[pointMiddle[0] + offsetA * (pointAfter[0] - pointBefore[0]), pointMiddle[1] + offsetA * (pointAfter[1] - pointBefore[1])], [pointAfter[0] - offsetB * (pointAfterNext[0] - pointMiddle[0]), pointAfter[1] - offsetB * (pointAfterNext[1] - pointMiddle[1])]];
}
/**
 * @description Get the last curve of the closure
 * @param {Array} bezierCurve A set of sub-curve
 * @param {Array} startPoint  Start point
 * @return {Array} The last curve for closure
 */


function closeBezierCurve(bezierCurve, startPoint) {
  var firstSubCurve = bezierCurve[0];
  var lastSubCurve = bezierCurve.slice(-1)[0];
  bezierCurve.push([getSymmetryPoint(lastSubCurve[1], lastSubCurve[2]), getSymmetryPoint(firstSubCurve[0], startPoint), startPoint]);
  return bezierCurve;
}
/**
 * @description Get the symmetry point
 * @param {Array} point       Symmetric point
 * @param {Array} centerPoint Symmetric center
 * @return {Array} Symmetric point
 */


function getSymmetryPoint(point, centerPoint) {
  var _point = (0, _slicedToArray2["default"])(point, 2),
      px = _point[0],
      py = _point[1];

  var _centerPoint = (0, _slicedToArray2["default"])(centerPoint, 2),
      cx = _centerPoint[0],
      cy = _centerPoint[1];

  var minusX = cx - px;
  var minusY = cy - py;
  return [cx + minusX, cy + minusY];
}

var _default = polylineToBezierCurve;
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42}],47:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "bezierCurveToPolyline", {
  enumerable: true,
  get: function get() {
    return _bezierCurveToPolyline.bezierCurveToPolyline;
  }
});
Object.defineProperty(exports, "getBezierCurveLength", {
  enumerable: true,
  get: function get() {
    return _bezierCurveToPolyline.getBezierCurveLength;
  }
});
Object.defineProperty(exports, "polylineToBezierCurve", {
  enumerable: true,
  get: function get() {
    return _polylineToBezierCurve["default"];
  }
});
exports["default"] = void 0;

var _bezierCurveToPolyline = require("./core/bezierCurveToPolyline");

var _polylineToBezierCurve = _interopRequireDefault(require("./core/polylineToBezierCurve"));

var _default = {
  bezierCurveToPolyline: _bezierCurveToPolyline.bezierCurveToPolyline,
  getBezierCurveLength: _bezierCurveToPolyline.getBezierCurveLength,
  polylineToBezierCurve: _polylineToBezierCurve["default"]
};
exports["default"] = _default;
},{"./core/bezierCurveToPolyline":45,"./core/polylineToBezierCurve":46,"@babel/runtime/helpers/interopRequireDefault":36}],48:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _color = _interopRequireDefault(require("@jiaminghi/color"));

var _bezierCurve = _interopRequireDefault(require("@jiaminghi/bezier-curve"));

var _util = require("../plugin/util");

var _graphs = _interopRequireDefault(require("../config/graphs"));

var _graph = _interopRequireDefault(require("./graph.class"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * @description           Class of CRender
 * @param {Object} canvas Canvas DOM
 * @return {CRender}      Instance of CRender
 */
var CRender = function CRender(canvas) {
  (0, _classCallCheck2["default"])(this, CRender);

  if (!canvas) {
    console.error('CRender Missing parameters!');
    return;
  }

  var ctx = canvas.getContext('2d');
  var clientWidth = canvas.clientWidth,
      clientHeight = canvas.clientHeight;
  var area = [clientWidth, clientHeight];
  canvas.setAttribute('width', clientWidth);
  canvas.setAttribute('height', clientHeight);
  /**
   * @description Context of the canvas
   * @type {Object}
   * @example ctx = canvas.getContext('2d')
   */

  this.ctx = ctx;
  /**
   * @description Width and height of the canvas
   * @type {Array}
   * @example area = [300，100]
   */

  this.area = area;
  /**
   * @description Whether render is in animation rendering
   * @type {Boolean}
   * @example animationStatus = true|false
   */

  this.animationStatus = false;
  /**
   * @description Added graph
   * @type {[Graph]}
   * @example graphs = [Graph, Graph, ...]
   */

  this.graphs = [];
  /**
   * @description Color plugin
   * @type {Object}
   * @link https://github.com/jiaming743/color
   */

  this.color = _color["default"];
  /**
   * @description Bezier Curve plugin
   * @type {Object}
   * @link https://github.com/jiaming743/BezierCurve
   */

  this.bezierCurve = _bezierCurve["default"]; // bind event handler

  canvas.addEventListener('mousedown', mouseDown.bind(this));
  canvas.addEventListener('mousemove', mouseMove.bind(this));
  canvas.addEventListener('mouseup', mouseUp.bind(this));
};
/**
 * @description        Clear canvas drawing area
 * @return {Undefined} Void
 */


exports["default"] = CRender;

CRender.prototype.clearArea = function () {
  var _this$ctx;

  var area = this.area;

  (_this$ctx = this.ctx).clearRect.apply(_this$ctx, [0, 0].concat((0, _toConsumableArray2["default"])(area)));
};
/**
 * @description           Add graph to render
 * @param {Object} config Graph configuration
 * @return {Graph}        Graph instance
 */


CRender.prototype.add = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var name = config.name;

  if (!name) {
    console.error('add Missing parameters!');
    return;
  }

  var graphConfig = _graphs["default"].get(name);

  if (!graphConfig) {
    console.warn('No corresponding graph configuration found!');
    return;
  }

  var graph = new _graph["default"](graphConfig, config);
  if (!graph.validator(graph)) return;
  graph.render = this;
  this.graphs.push(graph);
  this.sortGraphsByIndex();
  this.drawAllGraph();
  return graph;
};
/**
 * @description Sort the graph by index
 * @return {Undefined} Void
 */


CRender.prototype.sortGraphsByIndex = function () {
  var graphs = this.graphs;
  graphs.sort(function (a, b) {
    if (a.index > b.index) return 1;
    if (a.index === b.index) return 0;
    if (a.index < b.index) return -1;
  });
};
/**
 * @description         Delete graph in render
 * @param {Graph} graph The graph to be deleted
 * @return {Undefined}  Void
 */


CRender.prototype.delGraph = function (graph) {
  if (typeof graph.delProcessor !== 'function') return;
  graph.delProcessor(this);
  this.graphs = this.graphs.filter(function (graph) {
    return graph;
  });
  this.drawAllGraph();
};
/**
 * @description        Delete all graph in render
 * @return {Undefined} Void
 */


CRender.prototype.delAllGraph = function () {
  var _this = this;

  this.graphs.forEach(function (graph) {
    return graph.delProcessor(_this);
  });
  this.graphs = this.graphs.filter(function (graph) {
    return graph;
  });
  this.drawAllGraph();
};
/**
 * @description        Draw all the graphs in the render
 * @return {Undefined} Void
 */


CRender.prototype.drawAllGraph = function () {
  var _this2 = this;

  this.clearArea();
  this.graphs.filter(function (graph) {
    return graph && graph.visible;
  }).forEach(function (graph) {
    return graph.drawProcessor(_this2, graph);
  });
};
/**
 * @description      Animate the graph whose animation queue is not empty
 *                   and the animationPause is equal to false
 * @return {Promise} Animation Promise
 */


CRender.prototype.launchAnimation = function () {
  var _this3 = this;

  var animationStatus = this.animationStatus;
  if (animationStatus) return;
  this.animationStatus = true;
  return new Promise(function (resolve) {
    animation.call(_this3, function () {
      _this3.animationStatus = false;
      resolve();
    }, Date.now());
  });
};
/**
 * @description Try to animate every graph
 * @param {Function} callback Callback in animation end
 * @param {Number} timeStamp  Time stamp of animation start
 * @return {Undefined} Void
 */


function animation(callback, timeStamp) {
  var graphs = this.graphs;

  if (!animationAble(graphs)) {
    callback();
    return;
  }

  graphs.forEach(function (graph) {
    return graph.turnNextAnimationFrame(timeStamp);
  });
  this.drawAllGraph();
  requestAnimationFrame(animation.bind(this, callback, timeStamp));
}
/**
 * @description Find if there are graph that can be animated
 * @param {[Graph]} graphs
 * @return {Boolean}
 */


function animationAble(graphs) {
  return graphs.find(function (graph) {
    return !graph.animationPause && graph.animationFrameState.length;
  });
}
/**
 * @description Handler of CRender mousedown event
 * @return {Undefined} Void
 */


function mouseDown(e) {
  var graphs = this.graphs;
  var hoverGraph = graphs.find(function (graph) {
    return graph.status === 'hover';
  });
  if (!hoverGraph) return;
  hoverGraph.status = 'active';
}
/**
 * @description Handler of CRender mousemove event
 * @return {Undefined} Void
 */


function mouseMove(e) {
  var offsetX = e.offsetX,
      offsetY = e.offsetY;
  var position = [offsetX, offsetY];
  var graphs = this.graphs;
  var activeGraph = graphs.find(function (graph) {
    return graph.status === 'active' || graph.status === 'drag';
  });

  if (activeGraph) {
    if (!activeGraph.drag) return;

    if (typeof activeGraph.move !== 'function') {
      console.error('No move method is provided, cannot be dragged!');
      return;
    }

    activeGraph.moveProcessor(e);
    activeGraph.status = 'drag';
    return;
  }

  var hoverGraph = graphs.find(function (graph) {
    return graph.status === 'hover';
  });
  var hoverAbleGraphs = graphs.filter(function (graph) {
    return graph.hover && (typeof graph.hoverCheck === 'function' || graph.hoverRect);
  });
  var hoveredGraph = hoverAbleGraphs.find(function (graph) {
    return graph.hoverCheckProcessor(position, graph);
  });

  if (hoveredGraph) {
    document.body.style.cursor = hoveredGraph.style.hoverCursor;
  } else {
    document.body.style.cursor = 'default';
  }

  var hoverGraphMouseOuterIsFun = false,
      hoveredGraphMouseEnterIsFun = false;
  if (hoverGraph) hoverGraphMouseOuterIsFun = typeof hoverGraph.mouseOuter === 'function';
  if (hoveredGraph) hoveredGraphMouseEnterIsFun = typeof hoveredGraph.mouseEnter === 'function';
  if (!hoveredGraph && !hoverGraph) return;

  if (!hoveredGraph && hoverGraph) {
    if (hoverGraphMouseOuterIsFun) hoverGraph.mouseOuter(e, hoverGraph);
    hoverGraph.status = 'static';
    return;
  }

  if (hoveredGraph && hoveredGraph === hoverGraph) return;

  if (hoveredGraph && !hoverGraph) {
    if (hoveredGraphMouseEnterIsFun) hoveredGraph.mouseEnter(e, hoveredGraph);
    hoveredGraph.status = 'hover';
    return;
  }

  if (hoveredGraph && hoverGraph && hoveredGraph !== hoverGraph) {
    if (hoverGraphMouseOuterIsFun) hoverGraph.mouseOuter(e, hoverGraph);
    hoverGraph.status = 'static';
    if (hoveredGraphMouseEnterIsFun) hoveredGraph.mouseEnter(e, hoveredGraph);
    hoveredGraph.status = 'hover';
  }
}
/**
 * @description Handler of CRender mouseup event
 * @return {Undefined} Void
 */


function mouseUp(e) {
  var graphs = this.graphs;
  var activeGraph = graphs.find(function (graph) {
    return graph.status === 'active';
  });
  var dragGraph = graphs.find(function (graph) {
    return graph.status === 'drag';
  });
  if (activeGraph && typeof activeGraph.click === 'function') activeGraph.click(e, activeGraph);
  graphs.forEach(function (graph) {
    return graph && (graph.status = 'static');
  });
  if (activeGraph) activeGraph.status = 'hover';
  if (dragGraph) dragGraph.status = 'hover';
}
/**
 * @description         Clone Graph
 * @param {Graph} graph The target to be cloned
 * @return {Graph}      Cloned graph
 */


CRender.prototype.clone = function (graph) {
  var style = graph.style.getStyle();

  var clonedGraph = _objectSpread({}, graph, {
    style: style
  });

  delete clonedGraph.render;
  clonedGraph = (0, _util.deepClone)(clonedGraph, true);
  return this.add(clonedGraph);
};
},{"../config/graphs":51,"../plugin/util":54,"./graph.class":49,"@babel/runtime/helpers/classCallCheck":34,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@jiaminghi/bezier-curve":47,"@jiaminghi/color":56}],49:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _style = _interopRequireDefault(require("./style.class"));

var _transition = _interopRequireDefault(require("@jiaminghi/transition"));

var _util = require("../plugin/util");

/**
 * @description Class Graph
 * @param {Object} graph  Graph default configuration
 * @param {Object} config Graph config
 * @return {Graph} Instance of Graph
 */
var Graph = function Graph(graph, config) {
  (0, _classCallCheck2["default"])(this, Graph);
  config = (0, _util.deepClone)(config, true);
  var defaultConfig = {
    /**
     * @description Weather to render graph
     * @type {Boolean}
     * @default visible = true
     */
    visible: true,

    /**
     * @description Whether to enable drag
     * @type {Boolean}
     * @default drag = false
     */
    drag: false,

    /**
     * @description Whether to enable hover
     * @type {Boolean}
     * @default hover = false
     */
    hover: false,

    /**
     * @description Graph rendering index
     *  Give priority to index high graph in rendering
     * @type {Number}
     * @example index = 1
     */
    index: 1,

    /**
     * @description Animation delay time(ms)
     * @type {Number}
     * @default animationDelay = 0
     */
    animationDelay: 0,

    /**
     * @description Number of animation frames
     * @type {Number}
     * @default animationFrame = 30
     */
    animationFrame: 30,

    /**
     * @description Animation dynamic curve (Supported by transition)
     * @type {String}
     * @default animationCurve = 'linear'
     * @link https://github.com/jiaming743/Transition
     */
    animationCurve: 'linear',

    /**
     * @description Weather to pause graph animation
     * @type {Boolean}
     * @default animationPause = false
     */
    animationPause: false,

    /**
     * @description Rectangular hover detection zone
     *  Use this method for hover detection first
     * @type {Null|Array}
     * @default hoverRect = null
     * @example hoverRect = [0, 0, 100, 100] // [Rect start x, y, Rect width, height]
     */
    hoverRect: null,

    /**
     * @description Mouse enter event handler
     * @type {Function|Null}
     * @default mouseEnter = null
     */
    mouseEnter: null,

    /**
     * @description Mouse outer event handler
     * @type {Function|Null}
     * @default mouseOuter = null
     */
    mouseOuter: null,

    /**
     * @description Mouse click event handler
     * @type {Function|Null}
     * @default click = null
     */
    click: null
  };
  var configAbleNot = {
    status: 'static',
    animationRoot: [],
    animationKeys: [],
    animationFrameState: [],
    cache: {}
  };
  if (!config.shape) config.shape = {};
  if (!config.style) config.style = {};
  var shape = Object.assign({}, graph.shape, config.shape);
  Object.assign(defaultConfig, config, configAbleNot);
  Object.assign(this, graph, defaultConfig);
  this.shape = shape;
  this.style = new _style["default"](config.style);
  this.addedProcessor();
};
/**
 * @description Processor of added
 * @return {Undefined} Void
 */


exports["default"] = Graph;

Graph.prototype.addedProcessor = function () {
  if (typeof this.setGraphCenter === 'function') this.setGraphCenter(null, this); // The life cycle 'added"

  if (typeof this.added === 'function') this.added(this);
};
/**
 * @description Processor of draw
 * @param {CRender} render Instance of CRender
 * @param {Graph} graph    Instance of Graph
 * @return {Undefined} Void
 */


Graph.prototype.drawProcessor = function (render, graph) {
  var ctx = render.ctx;
  graph.style.initStyle(ctx);
  if (typeof this.beforeDraw === 'function') this.beforeDraw(this, render);
  graph.draw(render, graph);
  if (typeof this.drawed === 'function') this.drawed(this, render);
  graph.style.restoreTransform(ctx);
};
/**
 * @description Processor of hover check
 * @param {Array} position Mouse Position
 * @param {Graph} graph    Instance of Graph
 * @return {Boolean} Result of hover check
 */


Graph.prototype.hoverCheckProcessor = function (position, _ref) {
  var hoverRect = _ref.hoverRect,
      style = _ref.style,
      hoverCheck = _ref.hoverCheck;
  var graphCenter = style.graphCenter,
      rotate = style.rotate,
      scale = style.scale,
      translate = style.translate;

  if (graphCenter) {
    if (rotate) position = (0, _util.getRotatePointPos)(-rotate, position, graphCenter);
    if (scale) position = (0, _util.getScalePointPos)(scale.map(function (s) {
      return 1 / s;
    }), position, graphCenter);
    if (translate) position = (0, _util.getTranslatePointPos)(translate.map(function (v) {
      return v * -1;
    }), position);
  }

  if (hoverRect) return _util.checkPointIsInRect.apply(void 0, [position].concat((0, _toConsumableArray2["default"])(hoverRect)));
  return hoverCheck(position, this);
};
/**
 * @description Processor of move
 * @param {Event} e Mouse movement event
 * @return {Undefined} Void
 */


Graph.prototype.moveProcessor = function (e) {
  this.move(e, this);
  if (typeof this.beforeMove === 'function') this.beforeMove(e, this);
  if (typeof this.setGraphCenter === 'function') this.setGraphCenter(e, this);
  if (typeof this.moved === 'function') this.moved(e, this);
};
/**
 * @description Update graph state
 * @param {String} attrName Updated attribute name
 * @param {Any} change      Updated value
 * @return {Undefined} Void
 */


Graph.prototype.attr = function (attrName) {
  var change = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (!attrName || change === undefined) return false;
  var isObject = (0, _typeof2["default"])(this[attrName]) === 'object';
  if (isObject) change = (0, _util.deepClone)(change, true);
  var render = this.render;

  if (attrName === 'style') {
    this.style.update(change);
  } else if (isObject) {
    Object.assign(this[attrName], change);
  } else {
    this[attrName] = change;
  }

  if (attrName === 'index') render.sortGraphsByIndex();
  render.drawAllGraph();
};
/**
 * @description Update graphics state (with animation)
 *  Only shape and style attributes are supported
 * @param {String} attrName Updated attribute name
 * @param {Any} change      Updated value
 * @param {Boolean} wait    Whether to store the animation waiting
 *                          for the next animation request
 * @return {Promise} Animation Promise
 */


Graph.prototype.animation =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee2(attrName, change) {
    var wait,
        changeRoot,
        changeKeys,
        beforeState,
        animationFrame,
        animationCurve,
        animationDelay,
        animationFrameState,
        render,
        _args2 = arguments;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            wait = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;

            if (!(attrName !== 'shape' && attrName !== 'style')) {
              _context2.next = 4;
              break;
            }

            console.error('Only supported shape and style animation!');
            return _context2.abrupt("return");

          case 4:
            change = (0, _util.deepClone)(change, true);
            if (attrName === 'style') this.style.colorProcessor(change);
            changeRoot = this[attrName];
            changeKeys = Object.keys(change);
            beforeState = {};
            changeKeys.forEach(function (key) {
              return beforeState[key] = changeRoot[key];
            });
            animationFrame = this.animationFrame, animationCurve = this.animationCurve, animationDelay = this.animationDelay;
            animationFrameState = (0, _transition["default"])(animationCurve, beforeState, change, animationFrame, true);
            this.animationRoot.push(changeRoot);
            this.animationKeys.push(changeKeys);
            this.animationFrameState.push(animationFrameState);

            if (!wait) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("return");

          case 17:
            if (!(animationDelay > 0)) {
              _context2.next = 20;
              break;
            }

            _context2.next = 20;
            return delay(animationDelay);

          case 20:
            render = this.render;
            return _context2.abrupt("return", new Promise(
            /*#__PURE__*/
            function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee(resolve) {
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return render.launchAnimation();

                      case 2:
                        resolve();

                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }()));

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * @description Extract the next frame of data from the animation queue
 *              and update the graph state
 * @return {Undefined} Void
 */


Graph.prototype.turnNextAnimationFrame = function (timeStamp) {
  var animationDelay = this.animationDelay,
      animationRoot = this.animationRoot,
      animationKeys = this.animationKeys,
      animationFrameState = this.animationFrameState,
      animationPause = this.animationPause;
  if (animationPause) return;
  if (Date.now() - timeStamp < animationDelay) return;
  animationRoot.forEach(function (root, i) {
    animationKeys[i].forEach(function (key) {
      root[key] = animationFrameState[i][0][key];
    });
  });
  animationFrameState.forEach(function (stateItem, i) {
    stateItem.shift();
    var noFrame = stateItem.length === 0;
    if (noFrame) animationRoot[i] = null;
    if (noFrame) animationKeys[i] = null;
  });
  this.animationFrameState = animationFrameState.filter(function (state) {
    return state.length;
  });
  this.animationRoot = animationRoot.filter(function (root) {
    return root;
  });
  this.animationKeys = animationKeys.filter(function (keys) {
    return keys;
  });
};
/**
 * @description Skip to the last frame of animation
 * @return {Undefined} Void
 */


Graph.prototype.animationEnd = function () {
  var animationFrameState = this.animationFrameState,
      animationKeys = this.animationKeys,
      animationRoot = this.animationRoot,
      render = this.render;
  animationRoot.forEach(function (root, i) {
    var currentKeys = animationKeys[i];
    var lastState = animationFrameState[i].pop();
    currentKeys.forEach(function (key) {
      return root[key] = lastState[key];
    });
  });
  this.animationFrameState = [];
  this.animationKeys = [];
  this.animationRoot = [];
  return render.drawAllGraph();
};
/**
 * @description Pause animation behavior
 * @return {Undefined} Void
 */


Graph.prototype.pauseAnimation = function () {
  this.attr('animationPause', true);
};
/**
 * @description Try animation behavior
 * @return {Undefined} Void
 */


Graph.prototype.playAnimation = function () {
  var render = this.render;
  this.attr('animationPause', false);
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref4 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3(resolve) {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return render.launchAnimation();

            case 2:
              resolve();

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
};
/**
 * @description Processor of delete
 * @param {CRender} render Instance of CRender
 * @return {Undefined} Void
 */


Graph.prototype.delProcessor = function (render) {
  var _this = this;

  var graphs = render.graphs;
  var index = graphs.findIndex(function (graph) {
    return graph === _this;
  });
  if (index === -1) return;
  if (typeof this.beforeDelete === 'function') this.beforeDelete(this);
  graphs.splice(index, 1, null);
  if (typeof this.deleted === 'function') this.deleted(this);
};
/**
 * @description Return a timed release Promise
 * @param {Number} time Release time
 * @return {Promise} A timed release Promise
 */


function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
},{"../plugin/util":54,"./style.class":50,"@babel/runtime/helpers/asyncToGenerator":33,"@babel/runtime/helpers/classCallCheck":34,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43,"@babel/runtime/regenerator":44,"@jiaminghi/transition":58}],50:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _color = require("@jiaminghi/color");

var _util = require("../plugin/util");

/**
 * @description Class Style
 * @param {Object} style  Style configuration
 * @return {Style} Instance of Style
 */
var Style = function Style(style) {
  (0, _classCallCheck2["default"])(this, Style);
  this.colorProcessor(style);
  var defaultStyle = {
    /**
     * @description Rgba value of graph fill color
     * @type {Array}
     * @default fill = [0, 0, 0, 1]
     */
    fill: [0, 0, 0, 1],

    /**
     * @description Rgba value of graph stroke color
     * @type {Array}
     * @default stroke = [0, 0, 0, 1]
     */
    stroke: [0, 0, 0, 0],

    /**
     * @description Opacity of graph
     * @type {Number}
     * @default opacity = 1
     */
    opacity: 1,

    /**
     * @description LineCap of Ctx
     * @type {String}
     * @default lineCap = null
     * @example lineCap = 'butt'|'round'|'square'
     */
    lineCap: null,

    /**
     * @description Linejoin of Ctx
     * @type {String}
     * @default lineJoin = null
     * @example lineJoin = 'round'|'bevel'|'miter'
     */
    lineJoin: null,

    /**
     * @description LineDash of Ctx
     * @type {Array}
     * @default lineDash = null
     * @example lineDash = [10, 10]
     */
    lineDash: null,

    /**
     * @description LineDashOffset of Ctx
     * @type {Number}
     * @default lineDashOffset = null
     * @example lineDashOffset = 10
     */
    lineDashOffset: null,

    /**
     * @description ShadowBlur of Ctx
     * @type {Number}
     * @default shadowBlur = 0
     */
    shadowBlur: 0,

    /**
     * @description Rgba value of graph shadow color
     * @type {Array}
     * @default shadowColor = [0, 0, 0, 0]
     */
    shadowColor: [0, 0, 0, 0],

    /**
     * @description ShadowOffsetX of Ctx
     * @type {Number}
     * @default shadowOffsetX = 0
     */
    shadowOffsetX: 0,

    /**
     * @description ShadowOffsetY of Ctx
     * @type {Number}
     * @default shadowOffsetY = 0
     */
    shadowOffsetY: 0,

    /**
     * @description LineWidth of Ctx
     * @type {Number}
     * @default lineWidth = 0
     */
    lineWidth: 0,

    /**
     * @description Center point of the graph
     * @type {Array}
     * @default graphCenter = null
     * @example graphCenter = [10, 10]
     */
    graphCenter: null,

    /**
     * @description Graph scale
     * @type {Array}
     * @default scale = null
     * @example scale = [1.5, 1.5]
     */
    scale: null,

    /**
     * @description Graph rotation degree
     * @type {Number}
     * @default rotate = null
     * @example rotate = 10
     */
    rotate: null,

    /**
     * @description Graph translate distance
     * @type {Array}
     * @default translate = null
     * @example translate = [10, 10]
     */
    translate: null,

    /**
     * @description Cursor status when hover
     * @type {String}
     * @default hoverCursor = 'pointer'
     * @example hoverCursor = 'default'|'pointer'|'auto'|'crosshair'|'move'|'wait'|...
     */
    hoverCursor: 'pointer',

    /**
     * @description Font style of Ctx
     * @type {String}
     * @default fontStyle = 'normal'
     * @example fontStyle = 'normal'|'italic'|'oblique'
     */
    fontStyle: 'normal',

    /**
     * @description Font varient of Ctx
     * @type {String}
     * @default fontVarient = 'normal'
     * @example fontVarient = 'normal'|'small-caps'
     */
    fontVarient: 'normal',

    /**
     * @description Font weight of Ctx
     * @type {String|Number}
     * @default fontWeight = 'normal'
     * @example fontWeight = 'normal'|'bold'|'bolder'|'lighter'|Number
     */
    fontWeight: 'normal',

    /**
     * @description Font size of Ctx
     * @type {Number}
     * @default fontSize = 10
     */
    fontSize: 10,

    /**
     * @description Font family of Ctx
     * @type {String}
     * @default fontFamily = 'Arial'
     */
    fontFamily: 'Arial',

    /**
     * @description TextAlign of Ctx
     * @type {String}
     * @default textAlign = 'center'
     * @example textAlign = 'start'|'end'|'left'|'right'|'center'
     */
    textAlign: 'center',

    /**
     * @description TextBaseline of Ctx
     * @type {String}
     * @default textBaseline = 'middle'
     * @example textBaseline = 'top'|'bottom'|'middle'|'alphabetic'|'hanging'
     */
    textBaseline: 'middle',

    /**
     * @description The color used to create the gradient
     * @type {Array}
     * @default gradientColor = null
     * @example gradientColor = ['#000', '#111', '#222']
     */
    gradientColor: null,

    /**
     * @description Gradient type
     * @type {String}
     * @default gradientType = 'linear'
     * @example gradientType = 'linear' | 'radial'
     */
    gradientType: 'linear',

    /**
     * @description Gradient params
     * @type {Array}
     * @default gradientParams = null
     * @example gradientParams = [x0, y0, x1, y1] (Linear Gradient)
     * @example gradientParams = [x0, y0, r0, x1, y1, r1] (Radial Gradient)
     */
    gradientParams: null,

    /**
     * @description When to use gradients
     * @type {String}
     * @default gradientWith = 'stroke'
     * @example gradientWith = 'stroke' | 'fill'
     */
    gradientWith: 'stroke',

    /**
     * @description Gradient color stops
     * @type {String}
     * @default gradientStops = 'auto'
     * @example gradientStops = 'auto' | [0, .2, .3, 1]
     */
    gradientStops: 'auto',

    /**
     * @description Extended color that supports animation transition
     * @type {Array|Object}
     * @default colors = null
     * @example colors = ['#000', '#111', '#222', 'red' ]
     * @example colors = { a: '#000', b: '#111' }
     */
    colors: null
  };
  Object.assign(this, defaultStyle, style);
};
/**
 * @description Set colors to rgba value
 * @param {Object} style style config
 * @param {Boolean} reverse Whether to perform reverse operation
 * @return {Undefined} Void
 */


exports["default"] = Style;

Style.prototype.colorProcessor = function (style) {
  var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var processor = reverse ? _color.getColorFromRgbValue : _color.getRgbaValue;
  var colorProcessorKeys = ['fill', 'stroke', 'shadowColor'];
  var allKeys = Object.keys(style);
  var colorKeys = allKeys.filter(function (key) {
    return colorProcessorKeys.find(function (k) {
      return k === key;
    });
  });
  colorKeys.forEach(function (key) {
    return style[key] = processor(style[key]);
  });
  var gradientColor = style.gradientColor,
      colors = style.colors;
  if (gradientColor) style.gradientColor = gradientColor.map(function (c) {
    return processor(c);
  });

  if (colors) {
    var colorsKeys = Object.keys(colors);
    colorsKeys.forEach(function (key) {
      return colors[key] = processor(colors[key]);
    });
  }
};
/**
 * @description Init graph style
 * @param {Object} ctx Context of canvas
 * @return {Undefined} Void
 */


Style.prototype.initStyle = function (ctx) {
  initTransform(ctx, this);
  initGraphStyle(ctx, this);
  initGradient(ctx, this);
};
/**
 * @description Init canvas transform
 * @param {Object} ctx  Context of canvas
 * @param {Style} style Instance of Style
 * @return {Undefined} Void
 */


function initTransform(ctx, style) {
  ctx.save();
  var graphCenter = style.graphCenter,
      rotate = style.rotate,
      scale = style.scale,
      translate = style.translate;
  if (!(graphCenter instanceof Array)) return;
  ctx.translate.apply(ctx, (0, _toConsumableArray2["default"])(graphCenter));
  if (rotate) ctx.rotate(rotate * Math.PI / 180);
  if (scale instanceof Array) ctx.scale.apply(ctx, (0, _toConsumableArray2["default"])(scale));
  if (translate) ctx.translate.apply(ctx, (0, _toConsumableArray2["default"])(translate));
  ctx.translate(-graphCenter[0], -graphCenter[1]);
}

var autoSetStyleKeys = ['lineCap', 'lineJoin', 'lineDashOffset', 'shadowOffsetX', 'shadowOffsetY', 'lineWidth', 'textAlign', 'textBaseline'];
/**
 * @description Set the style of canvas ctx
 * @param {Object} ctx  Context of canvas
 * @param {Style} style Instance of Style
 * @return {Undefined} Void
 */

function initGraphStyle(ctx, style) {
  var fill = style.fill,
      stroke = style.stroke,
      shadowColor = style.shadowColor,
      opacity = style.opacity;
  autoSetStyleKeys.forEach(function (key) {
    if (key || typeof key === 'number') ctx[key] = style[key];
  });
  fill = (0, _toConsumableArray2["default"])(fill);
  stroke = (0, _toConsumableArray2["default"])(stroke);
  shadowColor = (0, _toConsumableArray2["default"])(shadowColor);
  fill[3] *= opacity;
  stroke[3] *= opacity;
  shadowColor[3] *= opacity;
  ctx.fillStyle = (0, _color.getColorFromRgbValue)(fill);
  ctx.strokeStyle = (0, _color.getColorFromRgbValue)(stroke);
  ctx.shadowColor = (0, _color.getColorFromRgbValue)(shadowColor);
  var lineDash = style.lineDash,
      shadowBlur = style.shadowBlur;

  if (lineDash) {
    lineDash = lineDash.map(function (v) {
      return v >= 0 ? v : 0;
    });
    ctx.setLineDash(lineDash);
  }

  if (typeof shadowBlur === 'number') ctx.shadowBlur = shadowBlur > 0 ? shadowBlur : 0.001;
  var fontStyle = style.fontStyle,
      fontVarient = style.fontVarient,
      fontWeight = style.fontWeight,
      fontSize = style.fontSize,
      fontFamily = style.fontFamily;
  ctx.font = fontStyle + ' ' + fontVarient + ' ' + fontWeight + ' ' + fontSize + 'px' + ' ' + fontFamily;
}
/**
 * @description Set the gradient color of canvas ctx
 * @param {Object} ctx  Context of canvas
 * @param {Style} style Instance of Style
 * @return {Undefined} Void
 */


function initGradient(ctx, style) {
  if (!gradientValidator(style)) return;
  var gradientColor = style.gradientColor,
      gradientParams = style.gradientParams,
      gradientType = style.gradientType,
      gradientWith = style.gradientWith,
      gradientStops = style.gradientStops,
      opacity = style.opacity;
  gradientColor = gradientColor.map(function (color) {
    var colorOpacity = color[3] * opacity;
    var clonedColor = (0, _toConsumableArray2["default"])(color);
    clonedColor[3] = colorOpacity;
    return clonedColor;
  });
  gradientColor = gradientColor.map(function (c) {
    return (0, _color.getColorFromRgbValue)(c);
  });
  if (gradientStops === 'auto') gradientStops = getAutoColorStops(gradientColor);
  var gradient = ctx["create".concat(gradientType.slice(0, 1).toUpperCase() + gradientType.slice(1), "Gradient")].apply(ctx, (0, _toConsumableArray2["default"])(gradientParams));
  gradientStops.forEach(function (stop, i) {
    return gradient.addColorStop(stop, gradientColor[i]);
  });
  ctx["".concat(gradientWith, "Style")] = gradient;
}
/**
 * @description Check if the gradient configuration is legal
 * @param {Style} style Instance of Style
 * @return {Boolean} Check Result
 */


function gradientValidator(style) {
  var gradientColor = style.gradientColor,
      gradientParams = style.gradientParams,
      gradientType = style.gradientType,
      gradientWith = style.gradientWith,
      gradientStops = style.gradientStops;
  if (!gradientColor || !gradientParams) return false;

  if (gradientColor.length === 1) {
    console.warn('The gradient needs to provide at least two colors');
    return false;
  }

  if (gradientType !== 'linear' && gradientType !== 'radial') {
    console.warn('GradientType only supports linear or radial, current value is ' + gradientType);
    return false;
  }

  var gradientParamsLength = gradientParams.length;

  if (gradientType === 'linear' && gradientParamsLength !== 4 || gradientType === 'radial' && gradientParamsLength !== 6) {
    console.warn('The expected length of gradientParams is ' + (gradientType === 'linear' ? '4' : '6'));
    return false;
  }

  if (gradientWith !== 'fill' && gradientWith !== 'stroke') {
    console.warn('GradientWith only supports fill or stroke, current value is ' + gradientWith);
    return false;
  }

  if (gradientStops !== 'auto' && !(gradientStops instanceof Array)) {
    console.warn("gradientStops only supports 'auto' or Number Array ([0, .5, 1]), current value is " + gradientStops);
    return false;
  }

  return true;
}
/**
 * @description Get a uniform gradient color stop
 * @param {Array} color Gradient color
 * @return {Array} Gradient color stop
 */


function getAutoColorStops(color) {
  var stopGap = 1 / (color.length - 1);
  return color.map(function (foo, i) {
    return stopGap * i;
  });
}
/**
 * @description Restore canvas ctx transform
 * @param {Object} ctx  Context of canvas
 * @return {Undefined} Void
 */


Style.prototype.restoreTransform = function (ctx) {
  ctx.restore();
};
/**
 * @description Update style data
 * @param {Object} change Changed data
 * @return {Undefined} Void
 */


Style.prototype.update = function (change) {
  this.colorProcessor(change);
  Object.assign(this, change);
};
/**
 * @description Get the current style configuration
 * @return {Object} Style configuration
 */


Style.prototype.getStyle = function () {
  var clonedStyle = (0, _util.deepClone)(this, true);
  this.colorProcessor(clonedStyle, true);
  return clonedStyle;
};
},{"../plugin/util":54,"@babel/runtime/helpers/classCallCheck":34,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@jiaminghi/color":56}],51:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extendNewGraph = extendNewGraph;
exports["default"] = exports.text = exports.bezierCurve = exports.smoothline = exports.polyline = exports.regPolygon = exports.sector = exports.arc = exports.ring = exports.rect = exports.ellipse = exports.circle = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _bezierCurve2 = _interopRequireDefault(require("@jiaminghi/bezier-curve"));

var _util = require("../plugin/util");

var _canvas = require("../plugin/canvas");

var polylineToBezierCurve = _bezierCurve2["default"].polylineToBezierCurve,
    bezierCurveToPolyline = _bezierCurve2["default"].bezierCurveToPolyline;
var circle = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0
  },
  validator: function validator(_ref) {
    var shape = _ref.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;

    if (typeof rx !== 'number' || typeof ry !== 'number' || typeof r !== 'number') {
      console.error('Circle shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref2, _ref3) {
    var ctx = _ref2.ctx;
    var shape = _ref3.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    ctx.arc(rx, ry, r > 0 ? r : 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref4) {
    var shape = _ref4.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    return (0, _util.checkPointIsInCircle)(position, rx, ry, r);
  },
  setGraphCenter: function setGraphCenter(e, _ref5) {
    var shape = _ref5.shape,
        style = _ref5.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref6, _ref7) {
    var movementX = _ref6.movementX,
        movementY = _ref6.movementY;
    var shape = _ref7.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.circle = circle;
var ellipse = {
  shape: {
    rx: 0,
    ry: 0,
    hr: 0,
    vr: 0
  },
  validator: function validator(_ref8) {
    var shape = _ref8.shape;
    var rx = shape.rx,
        ry = shape.ry,
        hr = shape.hr,
        vr = shape.vr;

    if (typeof rx !== 'number' || typeof ry !== 'number' || typeof hr !== 'number' || typeof vr !== 'number') {
      console.error('Ellipse shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref9, _ref10) {
    var ctx = _ref9.ctx;
    var shape = _ref10.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        hr = shape.hr,
        vr = shape.vr;
    ctx.ellipse(rx, ry, hr > 0 ? hr : 0.01, vr > 0 ? vr : 0.01, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref11) {
    var shape = _ref11.shape;
    var rx = shape.rx,
        ry = shape.ry,
        hr = shape.hr,
        vr = shape.vr;
    var a = Math.max(hr, vr);
    var b = Math.min(hr, vr);
    var c = Math.sqrt(a * a - b * b);
    var leftFocusPoint = [rx - c, ry];
    var rightFocusPoint = [rx + c, ry];
    var distance = (0, _util.getTwoPointDistance)(position, leftFocusPoint) + (0, _util.getTwoPointDistance)(position, rightFocusPoint);
    return distance <= 2 * a;
  },
  setGraphCenter: function setGraphCenter(e, _ref12) {
    var shape = _ref12.shape,
        style = _ref12.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref13, _ref14) {
    var movementX = _ref13.movementX,
        movementY = _ref13.movementY;
    var shape = _ref14.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.ellipse = ellipse;
var rect = {
  shape: {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  },
  validator: function validator(_ref15) {
    var shape = _ref15.shape;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof w !== 'number' || typeof h !== 'number') {
      console.error('Rect shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref16, _ref17) {
    var ctx = _ref16.ctx;
    var shape = _ref17.shape;
    ctx.beginPath();
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref18) {
    var shape = _ref18.shape;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    return (0, _util.checkPointIsInRect)(position, x, y, w, h);
  },
  setGraphCenter: function setGraphCenter(e, _ref19) {
    var shape = _ref19.shape,
        style = _ref19.style;
    var x = shape.x,
        y = shape.y,
        w = shape.w,
        h = shape.h;
    style.graphCenter = [x + w / 2, y + h / 2];
  },
  move: function move(_ref20, _ref21) {
    var movementX = _ref20.movementX,
        movementY = _ref20.movementY;
    var shape = _ref21.shape;
    this.attr('shape', {
      x: shape.x + movementX,
      y: shape.y + movementY
    });
  }
};
exports.rect = rect;
var ring = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0
  },
  validator: function validator(_ref22) {
    var shape = _ref22.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;

    if (typeof rx !== 'number' || typeof ry !== 'number' || typeof r !== 'number') {
      console.error('Ring shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref23, _ref24) {
    var ctx = _ref23.ctx;
    var shape = _ref24.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    ctx.arc(rx, ry, r > 0 ? r : 0.01, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref25) {
    var shape = _ref25.shape,
        style = _ref25.style;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r;
    var lineWidth = style.lineWidth;
    var halfLineWidth = lineWidth / 2;
    var minDistance = r - halfLineWidth;
    var maxDistance = r + halfLineWidth;
    var distance = (0, _util.getTwoPointDistance)(position, [rx, ry]);
    return distance >= minDistance && distance <= maxDistance;
  },
  setGraphCenter: function setGraphCenter(e, _ref26) {
    var shape = _ref26.shape,
        style = _ref26.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref27, _ref28) {
    var movementX = _ref27.movementX,
        movementY = _ref27.movementY;
    var shape = _ref28.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.ring = ring;
var arc = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    startAngle: 0,
    endAngle: 0,
    clockWise: true
  },
  validator: function validator(_ref29) {
    var shape = _ref29.shape;
    var keys = ['rx', 'ry', 'r', 'startAngle', 'endAngle'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('Arc shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref30, _ref31) {
    var ctx = _ref30.ctx;
    var shape = _ref31.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    ctx.arc(rx, ry, r > 0 ? r : 0.001, startAngle, endAngle, !clockWise);
    ctx.stroke();
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref32) {
    var shape = _ref32.shape,
        style = _ref32.style;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    var lineWidth = style.lineWidth;
    var halfLineWidth = lineWidth / 2;
    var insideRadius = r - halfLineWidth;
    var outsideRadius = r + halfLineWidth;
    return !(0, _util.checkPointIsInSector)(position, rx, ry, insideRadius, startAngle, endAngle, clockWise) && (0, _util.checkPointIsInSector)(position, rx, ry, outsideRadius, startAngle, endAngle, clockWise);
  },
  setGraphCenter: function setGraphCenter(e, _ref33) {
    var shape = _ref33.shape,
        style = _ref33.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref34, _ref35) {
    var movementX = _ref34.movementX,
        movementY = _ref34.movementY;
    var shape = _ref35.shape;
    this.attr('shape', {
      rx: shape.rx + movementX,
      ry: shape.ry + movementY
    });
  }
};
exports.arc = arc;
var sector = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    startAngle: 0,
    endAngle: 0,
    clockWise: true
  },
  validator: function validator(_ref36) {
    var shape = _ref36.shape;
    var keys = ['rx', 'ry', 'r', 'startAngle', 'endAngle'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('Sector shape configuration is abnormal!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref37, _ref38) {
    var ctx = _ref37.ctx;
    var shape = _ref38.shape;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    ctx.arc(rx, ry, r > 0 ? r : 0.01, startAngle, endAngle, !clockWise);
    ctx.lineTo(rx, ry);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  },
  hoverCheck: function hoverCheck(position, _ref39) {
    var shape = _ref39.shape;
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        startAngle = shape.startAngle,
        endAngle = shape.endAngle,
        clockWise = shape.clockWise;
    return (0, _util.checkPointIsInSector)(position, rx, ry, r, startAngle, endAngle, clockWise);
  },
  setGraphCenter: function setGraphCenter(e, _ref40) {
    var shape = _ref40.shape,
        style = _ref40.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref41, _ref42) {
    var movementX = _ref41.movementX,
        movementY = _ref41.movementY;
    var shape = _ref42.shape;
    var rx = shape.rx,
        ry = shape.ry;
    this.attr('shape', {
      rx: rx + movementX,
      ry: ry + movementY
    });
  }
};
exports.sector = sector;
var regPolygon = {
  shape: {
    rx: 0,
    ry: 0,
    r: 0,
    side: 0
  },
  validator: function validator(_ref43) {
    var shape = _ref43.shape;
    var side = shape.side;
    var keys = ['rx', 'ry', 'r', 'side'];

    if (keys.find(function (key) {
      return typeof shape[key] !== 'number';
    })) {
      console.error('RegPolygon shape configuration is abnormal!');
      return false;
    }

    if (side < 3) {
      console.error('RegPolygon at least trigon!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref44, _ref45) {
    var ctx = _ref44.ctx;
    var shape = _ref45.shape,
        cache = _ref45.cache;
    ctx.beginPath();
    var rx = shape.rx,
        ry = shape.ry,
        r = shape.r,
        side = shape.side;

    if (!cache.points || cache.rx !== rx || cache.ry !== ry || cache.r !== r || cache.side !== side) {
      var _points = (0, _util.getRegularPolygonPoints)(rx, ry, r, side);

      Object.assign(cache, {
        points: _points,
        rx: rx,
        ry: ry,
        r: r,
        side: side
      });
    }

    var points = cache.points;
    (0, _canvas.drawPolylinePath)(ctx, points);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  },
  hoverCheck: function hoverCheck(position, _ref46) {
    var cache = _ref46.cache;
    var points = cache.points;
    return (0, _util.checkPointIsInPolygon)(position, points);
  },
  setGraphCenter: function setGraphCenter(e, _ref47) {
    var shape = _ref47.shape,
        style = _ref47.style;
    var rx = shape.rx,
        ry = shape.ry;
    style.graphCenter = [rx, ry];
  },
  move: function move(_ref48, _ref49) {
    var movementX = _ref48.movementX,
        movementY = _ref48.movementY;
    var shape = _ref49.shape,
        cache = _ref49.cache;
    var rx = shape.rx,
        ry = shape.ry;
    cache.rx += movementX;
    cache.ry += movementY;
    this.attr('shape', {
      rx: rx + movementX,
      ry: ry + movementY
    });
    cache.points = cache.points.map(function (_ref50) {
      var _ref51 = (0, _slicedToArray2["default"])(_ref50, 2),
          x = _ref51[0],
          y = _ref51[1];

      return [x + movementX, y + movementY];
    });
  }
};
exports.regPolygon = regPolygon;
var polyline = {
  shape: {
    points: [],
    close: false
  },
  validator: function validator(_ref52) {
    var shape = _ref52.shape;
    var points = shape.points;

    if (!(points instanceof Array)) {
      console.error('Polyline points should be an array!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref53, _ref54) {
    var ctx = _ref53.ctx;
    var shape = _ref54.shape,
        lineWidth = _ref54.style.lineWidth;
    ctx.beginPath();
    var points = shape.points,
        close = shape.close;
    if (lineWidth === 1) points = (0, _util.eliminateBlur)(points);
    (0, _canvas.drawPolylinePath)(ctx, points);

    if (close) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.stroke();
    }
  },
  hoverCheck: function hoverCheck(position, _ref55) {
    var shape = _ref55.shape,
        style = _ref55.style;
    var points = shape.points,
        close = shape.close;
    var lineWidth = style.lineWidth;

    if (close) {
      return (0, _util.checkPointIsInPolygon)(position, points);
    } else {
      return (0, _util.checkPointIsNearPolyline)(position, points, lineWidth);
    }
  },
  setGraphCenter: function setGraphCenter(e, _ref56) {
    var shape = _ref56.shape,
        style = _ref56.style;
    var points = shape.points;
    style.graphCenter = points[0];
  },
  move: function move(_ref57, _ref58) {
    var movementX = _ref57.movementX,
        movementY = _ref57.movementY;
    var shape = _ref58.shape;
    var points = shape.points;
    var moveAfterPoints = points.map(function (_ref59) {
      var _ref60 = (0, _slicedToArray2["default"])(_ref59, 2),
          x = _ref60[0],
          y = _ref60[1];

      return [x + movementX, y + movementY];
    });
    this.attr('shape', {
      points: moveAfterPoints
    });
  }
};
exports.polyline = polyline;
var smoothline = {
  shape: {
    points: [],
    close: false
  },
  validator: function validator(_ref61) {
    var shape = _ref61.shape;
    var points = shape.points;

    if (!(points instanceof Array)) {
      console.error('Smoothline points should be an array!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref62, _ref63) {
    var ctx = _ref62.ctx;
    var shape = _ref63.shape,
        cache = _ref63.cache;
    var points = shape.points,
        close = shape.close;

    if (!cache.points || cache.points.toString() !== points.toString()) {
      var _bezierCurve = polylineToBezierCurve(points, close);

      var hoverPoints = bezierCurveToPolyline(_bezierCurve);
      Object.assign(cache, {
        points: (0, _util.deepClone)(points, true),
        bezierCurve: _bezierCurve,
        hoverPoints: hoverPoints
      });
    }

    var bezierCurve = cache.bezierCurve;
    ctx.beginPath();
    (0, _canvas.drawBezierCurvePath)(ctx, bezierCurve.slice(1), bezierCurve[0]);

    if (close) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.stroke();
    }
  },
  hoverCheck: function hoverCheck(position, _ref64) {
    var cache = _ref64.cache,
        shape = _ref64.shape,
        style = _ref64.style;
    var hoverPoints = cache.hoverPoints;
    var close = shape.close;
    var lineWidth = style.lineWidth;

    if (close) {
      return (0, _util.checkPointIsInPolygon)(position, hoverPoints);
    } else {
      return (0, _util.checkPointIsNearPolyline)(position, hoverPoints, lineWidth);
    }
  },
  setGraphCenter: function setGraphCenter(e, _ref65) {
    var shape = _ref65.shape,
        style = _ref65.style;
    var points = shape.points;
    style.graphCenter = points[0];
  },
  move: function move(_ref66, _ref67) {
    var movementX = _ref66.movementX,
        movementY = _ref66.movementY;
    var shape = _ref67.shape,
        cache = _ref67.cache;
    var points = shape.points;
    var moveAfterPoints = points.map(function (_ref68) {
      var _ref69 = (0, _slicedToArray2["default"])(_ref68, 2),
          x = _ref69[0],
          y = _ref69[1];

      return [x + movementX, y + movementY];
    });
    cache.points = moveAfterPoints;

    var _cache$bezierCurve$ = (0, _slicedToArray2["default"])(cache.bezierCurve[0], 2),
        fx = _cache$bezierCurve$[0],
        fy = _cache$bezierCurve$[1];

    var curves = cache.bezierCurve.slice(1);
    cache.bezierCurve = [[fx + movementX, fy + movementY]].concat((0, _toConsumableArray2["default"])(curves.map(function (curve) {
      return curve.map(function (_ref70) {
        var _ref71 = (0, _slicedToArray2["default"])(_ref70, 2),
            x = _ref71[0],
            y = _ref71[1];

        return [x + movementX, y + movementY];
      });
    })));
    cache.hoverPoints = cache.hoverPoints.map(function (_ref72) {
      var _ref73 = (0, _slicedToArray2["default"])(_ref72, 2),
          x = _ref73[0],
          y = _ref73[1];

      return [x + movementX, y + movementY];
    });
    this.attr('shape', {
      points: moveAfterPoints
    });
  }
};
exports.smoothline = smoothline;
var bezierCurve = {
  shape: {
    points: [],
    close: false
  },
  validator: function validator(_ref74) {
    var shape = _ref74.shape;
    var points = shape.points;

    if (!(points instanceof Array)) {
      console.error('BezierCurve points should be an array!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref75, _ref76) {
    var ctx = _ref75.ctx;
    var shape = _ref76.shape,
        cache = _ref76.cache;
    var points = shape.points,
        close = shape.close;

    if (!cache.points || cache.points.toString() !== points.toString()) {
      var hoverPoints = bezierCurveToPolyline(points, 20);
      Object.assign(cache, {
        points: (0, _util.deepClone)(points, true),
        hoverPoints: hoverPoints
      });
    }

    ctx.beginPath();
    (0, _canvas.drawBezierCurvePath)(ctx, points.slice(1), points[0]);

    if (close) {
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.stroke();
    }
  },
  hoverCheck: function hoverCheck(position, _ref77) {
    var cache = _ref77.cache,
        shape = _ref77.shape,
        style = _ref77.style;
    var hoverPoints = cache.hoverPoints;
    var close = shape.close;
    var lineWidth = style.lineWidth;

    if (close) {
      return (0, _util.checkPointIsInPolygon)(position, hoverPoints);
    } else {
      return (0, _util.checkPointIsNearPolyline)(position, hoverPoints, lineWidth);
    }
  },
  setGraphCenter: function setGraphCenter(e, _ref78) {
    var shape = _ref78.shape,
        style = _ref78.style;
    var points = shape.points;
    style.graphCenter = points[0];
  },
  move: function move(_ref79, _ref80) {
    var movementX = _ref79.movementX,
        movementY = _ref79.movementY;
    var shape = _ref80.shape,
        cache = _ref80.cache;
    var points = shape.points;

    var _points$ = (0, _slicedToArray2["default"])(points[0], 2),
        fx = _points$[0],
        fy = _points$[1];

    var curves = points.slice(1);
    var bezierCurve = [[fx + movementX, fy + movementY]].concat((0, _toConsumableArray2["default"])(curves.map(function (curve) {
      return curve.map(function (_ref81) {
        var _ref82 = (0, _slicedToArray2["default"])(_ref81, 2),
            x = _ref82[0],
            y = _ref82[1];

        return [x + movementX, y + movementY];
      });
    })));
    cache.points = bezierCurve;
    cache.hoverPoints = cache.hoverPoints.map(function (_ref83) {
      var _ref84 = (0, _slicedToArray2["default"])(_ref83, 2),
          x = _ref84[0],
          y = _ref84[1];

      return [x + movementX, y + movementY];
    });
    this.attr('shape', {
      points: bezierCurve
    });
  }
};
exports.bezierCurve = bezierCurve;
var text = {
  shape: {
    content: '',
    position: [],
    maxWidth: undefined,
    rowGap: 0
  },
  validator: function validator(_ref85) {
    var shape = _ref85.shape;
    var content = shape.content,
        position = shape.position,
        rowGap = shape.rowGap;

    if (typeof content !== 'string') {
      console.error('Text content should be a string!');
      return false;
    }

    if (!(position instanceof Array)) {
      console.error('Text position should be an array!');
      return false;
    }

    if (typeof rowGap !== 'number') {
      console.error('Text rowGap should be a number!');
      return false;
    }

    return true;
  },
  draw: function draw(_ref86, _ref87) {
    var ctx = _ref86.ctx;
    var shape = _ref87.shape;
    var content = shape.content,
        position = shape.position,
        maxWidth = shape.maxWidth,
        rowGap = shape.rowGap;
    var textBaseline = ctx.textBaseline,
        font = ctx.font;
    var fontSize = parseInt(font.replace(/\D/g, ''));

    var _position = position,
        _position2 = (0, _slicedToArray2["default"])(_position, 2),
        x = _position2[0],
        y = _position2[1];

    content = content.split('\n');
    var rowNum = content.length;
    var lineHeight = fontSize + rowGap;
    var allHeight = rowNum * lineHeight - rowGap;
    var offset = 0;

    if (textBaseline === 'middle') {
      offset = allHeight / 2;
      y += fontSize / 2;
    }

    if (textBaseline === 'bottom') {
      offset = allHeight;
      y += fontSize;
    }

    position = new Array(rowNum).fill(0).map(function (foo, i) {
      return [x, y + i * lineHeight - offset];
    });
    ctx.beginPath();
    content.forEach(function (text, i) {
      ctx.fillText.apply(ctx, [text].concat((0, _toConsumableArray2["default"])(position[i]), [maxWidth]));
      ctx.strokeText.apply(ctx, [text].concat((0, _toConsumableArray2["default"])(position[i]), [maxWidth]));
    });
    ctx.closePath();
  },
  hoverCheck: function hoverCheck(position, _ref88) {
    var shape = _ref88.shape,
        style = _ref88.style;
    return false;
  },
  setGraphCenter: function setGraphCenter(e, _ref89) {
    var shape = _ref89.shape,
        style = _ref89.style;
    var position = shape.position;
    style.graphCenter = (0, _toConsumableArray2["default"])(position);
  },
  move: function move(_ref90, _ref91) {
    var movementX = _ref90.movementX,
        movementY = _ref90.movementY;
    var shape = _ref91.shape;

    var _shape$position = (0, _slicedToArray2["default"])(shape.position, 2),
        x = _shape$position[0],
        y = _shape$position[1];

    this.attr('shape', {
      position: [x + movementX, y + movementY]
    });
  }
};
exports.text = text;
var graphs = new Map([['circle', circle], ['ellipse', ellipse], ['rect', rect], ['ring', ring], ['arc', arc], ['sector', sector], ['regPolygon', regPolygon], ['polyline', polyline], ['smoothline', smoothline], ['bezierCurve', bezierCurve], ['text', text]]);
var _default = graphs;
/**
 * @description Extend new graph
 * @param {String} name   Name of Graph
 * @param {Object} config Configuration of Graph
 * @return {Undefined} Void
 */

exports["default"] = _default;

function extendNewGraph(name, config) {
  if (!name || !config) {
    console.error('ExtendNewGraph Missing Parameters!');
    return;
  }

  if (!config.shape) {
    console.error('Required attribute of shape to extendNewGraph!');
    return;
  }

  if (!config.validator) {
    console.error('Required function of validator to extendNewGraph!');
    return;
  }

  if (!config.draw) {
    console.error('Required function of draw to extendNewGraph!');
    return;
  }

  graphs.set(name, config);
}
},{"../plugin/canvas":53,"../plugin/util":54,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@jiaminghi/bezier-curve":47}],52:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "CRender", {
  enumerable: true,
  get: function get() {
    return _crender["default"];
  }
});
Object.defineProperty(exports, "extendNewGraph", {
  enumerable: true,
  get: function get() {
    return _graphs.extendNewGraph;
  }
});
exports["default"] = void 0;

var _crender = _interopRequireDefault(require("./class/crender.class"));

var _graphs = require("./config/graphs");

var _default = _crender["default"];
exports["default"] = _default;
},{"./class/crender.class":48,"./config/graphs":51,"@babel/runtime/helpers/interopRequireDefault":36}],53:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawPolylinePath = drawPolylinePath;
exports.drawBezierCurvePath = drawBezierCurvePath;
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

/**
 * @description Draw a polyline path
 * @param {Object} ctx        Canvas 2d context
 * @param {Array} points      The points that makes up a polyline
 * @param {Boolean} beginPath Whether to execute beginPath
 * @param {Boolean} closePath Whether to execute closePath
 * @return {Undefined} Void
 */
function drawPolylinePath(ctx, points) {
  var beginPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var closePath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!ctx || points.length < 2) return false;
  if (beginPath) ctx.beginPath();
  points.forEach(function (point, i) {
    return point && (i === 0 ? ctx.moveTo.apply(ctx, (0, _toConsumableArray2["default"])(point)) : ctx.lineTo.apply(ctx, (0, _toConsumableArray2["default"])(point)));
  });
  if (closePath) ctx.closePath();
}
/**
 * @description Draw a bezier curve path
 * @param {Object} ctx        Canvas 2d context
 * @param {Array} points      The points that makes up a bezier curve
 * @param {Array} moveTo      The point need to excute moveTo
 * @param {Boolean} beginPath Whether to execute beginPath
 * @param {Boolean} closePath Whether to execute closePath
 * @return {Undefined} Void
 */


function drawBezierCurvePath(ctx, points) {
  var moveTo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var beginPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var closePath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  if (!ctx || !points) return false;
  if (beginPath) ctx.beginPath();
  if (moveTo) ctx.moveTo.apply(ctx, (0, _toConsumableArray2["default"])(moveTo));
  points.forEach(function (item) {
    return item && ctx.bezierCurveTo.apply(ctx, (0, _toConsumableArray2["default"])(item[0]).concat((0, _toConsumableArray2["default"])(item[1]), (0, _toConsumableArray2["default"])(item[2])));
  });
  if (closePath) ctx.closePath();
}

var _default = {
  drawPolylinePath: drawPolylinePath,
  drawBezierCurvePath: drawBezierCurvePath
};
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42}],54:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepClone = deepClone;
exports.eliminateBlur = eliminateBlur;
exports.checkPointIsInCircle = checkPointIsInCircle;
exports.getTwoPointDistance = getTwoPointDistance;
exports.checkPointIsInPolygon = checkPointIsInPolygon;
exports.checkPointIsInSector = checkPointIsInSector;
exports.checkPointIsNearPolyline = checkPointIsNearPolyline;
exports.checkPointIsInRect = checkPointIsInRect;
exports.getRotatePointPos = getRotatePointPos;
exports.getScalePointPos = getScalePointPos;
exports.getTranslatePointPos = getTranslatePointPos;
exports.getDistanceBetweenPointAndLine = getDistanceBetweenPointAndLine;
exports.getCircleRadianPoint = getCircleRadianPoint;
exports.getRegularPolygonPoints = getRegularPolygonPoints;
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var abs = Math.abs,
    sqrt = Math.sqrt,
    sin = Math.sin,
    cos = Math.cos,
    max = Math.max,
    min = Math.min,
    PI = Math.PI;
/**
 * @description Clone an object or array
 * @param {Object|Array} object Cloned object
 * @param {Boolean} recursion   Whether to use recursive cloning
 * @return {Object|Array} Clone object
 */

function deepClone(object) {
  var recursion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!object) return object;
  var parse = JSON.parse,
      stringify = JSON.stringify;
  if (!recursion) return parse(stringify(object));
  var clonedObj = object instanceof Array ? [] : {};

  if (object && (0, _typeof2["default"])(object) === 'object') {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        if (object[key] && (0, _typeof2["default"])(object[key]) === 'object') {
          clonedObj[key] = deepClone(object[key], true);
        } else {
          clonedObj[key] = object[key];
        }
      }
    }
  }

  return clonedObj;
}
/**
 * @description Eliminate line blur due to 1px line width
 * @param {Array} points Line points
 * @return {Array} Line points after processed
 */


function eliminateBlur(points) {
  return points.map(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        x = _ref2[0],
        y = _ref2[1];

    return [parseInt(x) + 0.5, parseInt(y) + 0.5];
  });
}
/**
 * @description Check if the point is inside the circle
 * @param {Array} point Postion of point
 * @param {Number} rx   Circle x coordinate
 * @param {Number} ry   Circle y coordinate
 * @param {Number} r    Circle radius
 * @return {Boolean} Result of check
 */


function checkPointIsInCircle(point, rx, ry, r) {
  return getTwoPointDistance(point, [rx, ry]) <= r;
}
/**
 * @description Get the distance between two points
 * @param {Array} point1 point1
 * @param {Array} point2 point2
 * @return {Number} Distance between two points
 */


function getTwoPointDistance(_ref3, _ref4) {
  var _ref5 = (0, _slicedToArray2["default"])(_ref3, 2),
      xa = _ref5[0],
      ya = _ref5[1];

  var _ref6 = (0, _slicedToArray2["default"])(_ref4, 2),
      xb = _ref6[0],
      yb = _ref6[1];

  var minusX = abs(xa - xb);
  var minusY = abs(ya - yb);
  return sqrt(minusX * minusX + minusY * minusY);
}
/**
 * @description Check if the point is inside the polygon
 * @param {Array} point  Postion of point
 * @param {Array} points The points that makes up a polyline
 * @return {Boolean} Result of check
 */


function checkPointIsInPolygon(point, polygon) {
  var counter = 0;

  var _point = (0, _slicedToArray2["default"])(point, 2),
      x = _point[0],
      y = _point[1];

  var pointNum = polygon.length;

  for (var i = 1, p1 = polygon[0]; i <= pointNum; i++) {
    var p2 = polygon[i % pointNum];

    if (x > min(p1[0], p2[0]) && x <= max(p1[0], p2[0])) {
      if (y <= max(p1[1], p2[1])) {
        if (p1[0] !== p2[0]) {
          var xinters = (x - p1[0]) * (p2[1] - p1[1]) / (p2[0] - p1[0]) + p1[1];

          if (p1[1] === p2[1] || y <= xinters) {
            counter++;
          }
        }
      }
    }

    p1 = p2;
  }

  return counter % 2 === 1;
}
/**
 * @description Check if the point is inside the sector
 * @param {Array} point       Postion of point
 * @param {Number} rx         Sector x coordinate
 * @param {Number} ry         Sector y coordinate
 * @param {Number} r          Sector radius
 * @param {Number} startAngle Sector start angle
 * @param {Number} endAngle   Sector end angle
 * @param {Boolean} clockWise Whether the sector angle is clockwise
 * @return {Boolean} Result of check
 */


function checkPointIsInSector(point, rx, ry, r, startAngle, endAngle, clockWise) {
  if (!point) return false;
  if (getTwoPointDistance(point, [rx, ry]) > r) return false;

  if (!clockWise) {
    var _deepClone = deepClone([endAngle, startAngle]);

    var _deepClone2 = (0, _slicedToArray2["default"])(_deepClone, 2);

    startAngle = _deepClone2[0];
    endAngle = _deepClone2[1];
  }

  var reverseBE = startAngle > endAngle;

  if (reverseBE) {
    var _ref7 = [endAngle, startAngle];
    startAngle = _ref7[0];
    endAngle = _ref7[1];
  }

  var minus = endAngle - startAngle;
  if (minus >= PI * 2) return true;

  var _point2 = (0, _slicedToArray2["default"])(point, 2),
      x = _point2[0],
      y = _point2[1];

  var _getCircleRadianPoint = getCircleRadianPoint(rx, ry, r, startAngle),
      _getCircleRadianPoint2 = (0, _slicedToArray2["default"])(_getCircleRadianPoint, 2),
      bx = _getCircleRadianPoint2[0],
      by = _getCircleRadianPoint2[1];

  var _getCircleRadianPoint3 = getCircleRadianPoint(rx, ry, r, endAngle),
      _getCircleRadianPoint4 = (0, _slicedToArray2["default"])(_getCircleRadianPoint3, 2),
      ex = _getCircleRadianPoint4[0],
      ey = _getCircleRadianPoint4[1];

  var vPoint = [x - rx, y - ry];
  var vBArm = [bx - rx, by - ry];
  var vEArm = [ex - rx, ey - ry];
  var reverse = minus > PI;

  if (reverse) {
    var _deepClone3 = deepClone([vEArm, vBArm]);

    var _deepClone4 = (0, _slicedToArray2["default"])(_deepClone3, 2);

    vBArm = _deepClone4[0];
    vEArm = _deepClone4[1];
  }

  var inSector = isClockWise(vBArm, vPoint) && !isClockWise(vEArm, vPoint);
  if (reverse) inSector = !inSector;
  if (reverseBE) inSector = !inSector;
  return inSector;
}
/**
 * @description Determine if the point is in the clockwise direction of the vector
 * @param {Array} vArm   Vector
 * @param {Array} vPoint Point
 * @return {Boolean} Result of check
 */


function isClockWise(vArm, vPoint) {
  var _vArm = (0, _slicedToArray2["default"])(vArm, 2),
      ax = _vArm[0],
      ay = _vArm[1];

  var _vPoint = (0, _slicedToArray2["default"])(vPoint, 2),
      px = _vPoint[0],
      py = _vPoint[1];

  return -ay * px + ax * py > 0;
}
/**
 * @description Check if the point is inside the polyline
 * @param {Array} point      Postion of point
 * @param {Array} polyline   The points that makes up a polyline
 * @param {Number} lineWidth Polyline linewidth
 * @return {Boolean} Result of check
 */


function checkPointIsNearPolyline(point, polyline, lineWidth) {
  var halfLineWidth = lineWidth / 2;
  var moveUpPolyline = polyline.map(function (_ref8) {
    var _ref9 = (0, _slicedToArray2["default"])(_ref8, 2),
        x = _ref9[0],
        y = _ref9[1];

    return [x, y - halfLineWidth];
  });
  var moveDownPolyline = polyline.map(function (_ref10) {
    var _ref11 = (0, _slicedToArray2["default"])(_ref10, 2),
        x = _ref11[0],
        y = _ref11[1];

    return [x, y + halfLineWidth];
  });
  var polygon = [].concat((0, _toConsumableArray2["default"])(moveUpPolyline), (0, _toConsumableArray2["default"])(moveDownPolyline.reverse()));
  return checkPointIsInPolygon(point, polygon);
}
/**
 * @description Check if the point is inside the rect
 * @param {Array} point   Postion of point
 * @param {Number} x      Rect start x coordinate
 * @param {Number} y      Rect start y coordinate
 * @param {Number} width  Rect width
 * @param {Number} height Rect height
 * @return {Boolean} Result of check
 */


function checkPointIsInRect(_ref12, x, y, width, height) {
  var _ref13 = (0, _slicedToArray2["default"])(_ref12, 2),
      px = _ref13[0],
      py = _ref13[1];

  if (px < x) return false;
  if (py < y) return false;
  if (px > x + width) return false;
  if (py > y + height) return false;
  return true;
}
/**
 * @description Get the coordinates of the rotated point
 * @param {Number} rotate Degree of rotation
 * @param {Array} point   Postion of point
 * @param {Array} origin  Rotation center
 * @param {Array} origin  Rotation center
 * @return {Number} Coordinates after rotation
 */


function getRotatePointPos() {
  var rotate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var point = arguments.length > 1 ? arguments[1] : undefined;
  var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
  if (!point) return false;
  if (rotate % 360 === 0) return point;

  var _point3 = (0, _slicedToArray2["default"])(point, 2),
      x = _point3[0],
      y = _point3[1];

  var _origin = (0, _slicedToArray2["default"])(origin, 2),
      ox = _origin[0],
      oy = _origin[1];

  rotate *= PI / 180;
  return [(x - ox) * cos(rotate) - (y - oy) * sin(rotate) + ox, (x - ox) * sin(rotate) + (y - oy) * cos(rotate) + oy];
}
/**
 * @description Get the coordinates of the scaled point
 * @param {Array} scale  Scale factor
 * @param {Array} point  Postion of point
 * @param {Array} origin Scale center
 * @return {Number} Coordinates after scale
 */


function getScalePointPos() {
  var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [1, 1];
  var point = arguments.length > 1 ? arguments[1] : undefined;
  var origin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
  if (!point) return false;
  if (scale === 1) return point;

  var _point4 = (0, _slicedToArray2["default"])(point, 2),
      x = _point4[0],
      y = _point4[1];

  var _origin2 = (0, _slicedToArray2["default"])(origin, 2),
      ox = _origin2[0],
      oy = _origin2[1];

  var _scale = (0, _slicedToArray2["default"])(scale, 2),
      xs = _scale[0],
      ys = _scale[1];

  var relativePosX = x - ox;
  var relativePosY = y - oy;
  return [relativePosX * xs + ox, relativePosY * ys + oy];
}
/**
 * @description Get the coordinates of the scaled point
 * @param {Array} translate Translation distance
 * @param {Array} point     Postion of point
 * @return {Number} Coordinates after translation
 */


function getTranslatePointPos(translate, point) {
  if (!translate || !point) return false;

  var _point5 = (0, _slicedToArray2["default"])(point, 2),
      x = _point5[0],
      y = _point5[1];

  var _translate = (0, _slicedToArray2["default"])(translate, 2),
      tx = _translate[0],
      ty = _translate[1];

  return [x + tx, y + ty];
}
/**
 * @description Get the distance from the point to the line
 * @param {Array} point     Postion of point
 * @param {Array} lineBegin Line start position
 * @param {Array} lineEnd   Line end position
 * @return {Number} Distance between point and line
 */


function getDistanceBetweenPointAndLine(point, lineBegin, lineEnd) {
  if (!point || !lineBegin || !lineEnd) return false;

  var _point6 = (0, _slicedToArray2["default"])(point, 2),
      x = _point6[0],
      y = _point6[1];

  var _lineBegin = (0, _slicedToArray2["default"])(lineBegin, 2),
      x1 = _lineBegin[0],
      y1 = _lineBegin[1];

  var _lineEnd = (0, _slicedToArray2["default"])(lineEnd, 2),
      x2 = _lineEnd[0],
      y2 = _lineEnd[1];

  var a = y2 - y1;
  var b = x1 - x2;
  var c = y1 * (x2 - x1) - x1 * (y2 - y1);
  var molecule = abs(a * x + b * y + c);
  var denominator = sqrt(a * a + b * b);
  return molecule / denominator;
}
/**
 * @description Get the coordinates of the specified radian on the circle
 * @param {Number} x      Circle x coordinate
 * @param {Number} y      Circle y coordinate
 * @param {Number} radius Circle radius
 * @param {Number} radian Specfied radian
 * @return {Array} Postion of point
 */


function getCircleRadianPoint(x, y, radius, radian) {
  return [x + cos(radian) * radius, y + sin(radian) * radius];
}
/**
 * @description Get the points that make up a regular polygon
 * @param {Number} x     X coordinate of the polygon inscribed circle
 * @param {Number} y     Y coordinate of the polygon inscribed circle
 * @param {Number} r     Radius of the polygon inscribed circle
 * @param {Number} side  Side number
 * @param {Number} minus Radian offset
 * @return {Array} Points that make up a regular polygon
 */


function getRegularPolygonPoints(rx, ry, r, side) {
  var minus = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : PI * -0.5;
  var radianGap = PI * 2 / side;
  var radians = new Array(side).fill('').map(function (t, i) {
    return i * radianGap + minus;
  });
  return radians.map(function (radian) {
    return getCircleRadianPoint(rx, ry, r, radian);
  });
}

var _default = {
  deepClone: deepClone,
  eliminateBlur: eliminateBlur,
  checkPointIsInCircle: checkPointIsInCircle,
  checkPointIsInPolygon: checkPointIsInPolygon,
  checkPointIsInSector: checkPointIsInSector,
  checkPointIsNearPolyline: checkPointIsNearPolyline,
  getTwoPointDistance: getTwoPointDistance,
  getRotatePointPos: getRotatePointPos,
  getScalePointPos: getScalePointPos,
  getTranslatePointPos: getTranslatePointPos,
  getCircleRadianPoint: getCircleRadianPoint,
  getRegularPolygonPoints: getRegularPolygonPoints,
  getDistanceBetweenPointAndLine: getDistanceBetweenPointAndLine
};
exports["default"] = _default;
},{"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/toConsumableArray":42,"@babel/runtime/helpers/typeof":43}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = new Map([['transparent', 'rgba(0,0,0,0)'], ['black', '#000000'], ['silver', '#C0C0C0'], ['gray', '#808080'], ['white', '#FFFFFF'], ['maroon', '#800000'], ['red', '#FF0000'], ['purple', '#800080'], ['fuchsia', '#FF00FF'], ['green', '#008000'], ['lime', '#00FF00'], ['olive', '#808000'], ['yellow', '#FFFF00'], ['navy', '#000080'], ['blue', '#0000FF'], ['teal', '#008080'], ['aqua', '#00FFFF'], ['aliceblue', '#f0f8ff'], ['antiquewhite', '#faebd7'], ['aquamarine', '#7fffd4'], ['azure', '#f0ffff'], ['beige', '#f5f5dc'], ['bisque', '#ffe4c4'], ['blanchedalmond', '#ffebcd'], ['blueviolet', '#8a2be2'], ['brown', '#a52a2a'], ['burlywood', '#deb887'], ['cadetblue', '#5f9ea0'], ['chartreuse', '#7fff00'], ['chocolate', '#d2691e'], ['coral', '#ff7f50'], ['cornflowerblue', '#6495ed'], ['cornsilk', '#fff8dc'], ['crimson', '#dc143c'], ['cyan', '#00ffff'], ['darkblue', '#00008b'], ['darkcyan', '#008b8b'], ['darkgoldenrod', '#b8860b'], ['darkgray', '#a9a9a9'], ['darkgreen', '#006400'], ['darkgrey', '#a9a9a9'], ['darkkhaki', '#bdb76b'], ['darkmagenta', '#8b008b'], ['darkolivegreen', '#556b2f'], ['darkorange', '#ff8c00'], ['darkorchid', '#9932cc'], ['darkred', '#8b0000'], ['darksalmon', '#e9967a'], ['darkseagreen', '#8fbc8f'], ['darkslateblue', '#483d8b'], ['darkslategray', '#2f4f4f'], ['darkslategrey', '#2f4f4f'], ['darkturquoise', '#00ced1'], ['darkviolet', '#9400d3'], ['deeppink', '#ff1493'], ['deepskyblue', '#00bfff'], ['dimgray', '#696969'], ['dimgrey', '#696969'], ['dodgerblue', '#1e90ff'], ['firebrick', '#b22222'], ['floralwhite', '#fffaf0'], ['forestgreen', '#228b22'], ['gainsboro', '#dcdcdc'], ['ghostwhite', '#f8f8ff'], ['gold', '#ffd700'], ['goldenrod', '#daa520'], ['greenyellow', '#adff2f'], ['grey', '#808080'], ['honeydew', '#f0fff0'], ['hotpink', '#ff69b4'], ['indianred', '#cd5c5c'], ['indigo', '#4b0082'], ['ivory', '#fffff0'], ['khaki', '#f0e68c'], ['lavender', '#e6e6fa'], ['lavenderblush', '#fff0f5'], ['lawngreen', '#7cfc00'], ['lemonchiffon', '#fffacd'], ['lightblue', '#add8e6'], ['lightcoral', '#f08080'], ['lightcyan', '#e0ffff'], ['lightgoldenrodyellow', '#fafad2'], ['lightgray', '#d3d3d3'], ['lightgreen', '#90ee90'], ['lightgrey', '#d3d3d3'], ['lightpink', '#ffb6c1'], ['lightsalmon', '#ffa07a'], ['lightseagreen', '#20b2aa'], ['lightskyblue', '#87cefa'], ['lightslategray', '#778899'], ['lightslategrey', '#778899'], ['lightsteelblue', '#b0c4de'], ['lightyellow', '#ffffe0'], ['limegreen', '#32cd32'], ['linen', '#faf0e6'], ['magenta', '#ff00ff'], ['mediumaquamarine', '#66cdaa'], ['mediumblue', '#0000cd'], ['mediumorchid', '#ba55d3'], ['mediumpurple', '#9370db'], ['mediumseagreen', '#3cb371'], ['mediumslateblue', '#7b68ee'], ['mediumspringgreen', '#00fa9a'], ['mediumturquoise', '#48d1cc'], ['mediumvioletred', '#c71585'], ['midnightblue', '#191970'], ['mintcream', '#f5fffa'], ['mistyrose', '#ffe4e1'], ['moccasin', '#ffe4b5'], ['navajowhite', '#ffdead'], ['oldlace', '#fdf5e6'], ['olivedrab', '#6b8e23'], ['orange', '#ffa500'], ['orangered', '#ff4500'], ['orchid', '#da70d6'], ['palegoldenrod', '#eee8aa'], ['palegreen', '#98fb98'], ['paleturquoise', '#afeeee'], ['palevioletred', '#db7093'], ['papayawhip', '#ffefd5'], ['peachpuff', '#ffdab9'], ['peru', '#cd853f'], ['pink', '#ffc0cb'], ['plum', '#dda0dd'], ['powderblue', '#b0e0e6'], ['rosybrown', '#bc8f8f'], ['royalblue', '#4169e1'], ['saddlebrown', '#8b4513'], ['salmon', '#fa8072'], ['sandybrown', '#f4a460'], ['seagreen', '#2e8b57'], ['seashell', '#fff5ee'], ['sienna', '#a0522d'], ['skyblue', '#87ceeb'], ['slateblue', '#6a5acd'], ['slategray', '#708090'], ['slategrey', '#708090'], ['snow', '#fffafa'], ['springgreen', '#00ff7f'], ['steelblue', '#4682b4'], ['tan', '#d2b48c'], ['thistle', '#d8bfd8'], ['tomato', '#ff6347'], ['turquoise', '#40e0d0'], ['violet', '#ee82ee'], ['wheat', '#f5deb3'], ['whitesmoke', '#f5f5f5'], ['yellowgreen', '#9acd32']]);

exports["default"] = _default;
},{}],56:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRgbValue = getRgbValue;
exports.getRgbaValue = getRgbaValue;
exports.getOpacity = getOpacity;
exports.toRgb = toRgb;
exports.toHex = toHex;
exports.getColorFromRgbValue = getColorFromRgbValue;
exports.darken = darken;
exports.lighten = lighten;
exports.fade = fade;
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _keywords = _interopRequireDefault(require("./config/keywords"));

var hexReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
var rgbReg = /^(rgb|rgba|RGB|RGBA)/;
var rgbaReg = /^(rgba|RGBA)/;
/**
 * @description Color validator
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {String|Boolean} Valid color Or false
 */

function validator(color) {
  var isHex = hexReg.test(color);
  var isRgb = rgbReg.test(color);
  if (isHex || isRgb) return color;
  color = getColorByKeyword(color);

  if (!color) {
    console.error('Color: Invalid color!');
    return false;
  }

  return color;
}
/**
 * @description Get color by keyword
 * @param {String} keyword Color keyword like red, green and etc.
 * @return {String|Boolean} Hex or rgba color (Invalid keyword will return false)
 */


function getColorByKeyword(keyword) {
  if (!keyword) {
    console.error('getColorByKeywords: Missing parameters!');
    return false;
  }

  if (!_keywords["default"].has(keyword)) return false;
  return _keywords["default"].get(keyword);
}
/**
 * @description Get the Rgb value of the color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Array<Number>|Boolean} Rgb value of the color (Invalid input will return false)
 */


function getRgbValue(color) {
  if (!color) {
    console.error('getRgbValue: Missing parameters!');
    return false;
  }

  color = validator(color);
  if (!color) return false;
  var isHex = hexReg.test(color);
  var isRgb = rgbReg.test(color);
  var lowerColor = color.toLowerCase();
  if (isHex) return getRgbValueFromHex(lowerColor);
  if (isRgb) return getRgbValueFromRgb(lowerColor);
}
/**
 * @description Get the rgb value of the hex color
 * @param {String} color Hex color
 * @return {Array<Number>} Rgb value of the color
 */


function getRgbValueFromHex(color) {
  color = color.replace('#', '');
  if (color.length === 3) color = Array.from(color).map(function (hexNum) {
    return hexNum + hexNum;
  }).join('');
  color = color.split('');
  return new Array(3).fill(0).map(function (t, i) {
    return parseInt("0x".concat(color[i * 2]).concat(color[i * 2 + 1]));
  });
}
/**
 * @description Get the rgb value of the rgb/rgba color
 * @param {String} color Hex color
 * @return {Array} Rgb value of the color
 */


function getRgbValueFromRgb(color) {
  return color.replace(/rgb\(|rgba\(|\)/g, '').split(',').slice(0, 3).map(function (n) {
    return parseInt(n);
  });
}
/**
 * @description Get the Rgba value of the color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Array<Number>|Boolean} Rgba value of the color (Invalid input will return false)
 */


function getRgbaValue(color) {
  if (!color) {
    console.error('getRgbaValue: Missing parameters!');
    return false;
  }

  var colorValue = getRgbValue(color);
  if (!colorValue) return false;
  colorValue.push(getOpacity(color));
  return colorValue;
}
/**
 * @description Get the opacity of color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Number|Boolean} Color opacity (Invalid input will return false)
 */


function getOpacity(color) {
  if (!color) {
    console.error('getOpacity: Missing parameters!');
    return false;
  }

  color = validator(color);
  if (!color) return false;
  var isRgba = rgbaReg.test(color);
  if (!isRgba) return 1;
  color = color.toLowerCase();
  return Number(color.split(',').slice(-1)[0].replace(/[)|\s]/g, ''));
}
/**
 * @description Convert color to Rgb|Rgba color
 * @param {String} color   Hex|Rgb|Rgba color or color keyword
 * @param {Number} opacity The opacity of color
 * @return {String|Boolean} Rgb|Rgba color (Invalid input will return false)
 */


function toRgb(color, opacity) {
  if (!color) {
    console.error('toRgb: Missing parameters!');
    return false;
  }

  var rgbValue = getRgbValue(color);
  if (!rgbValue) return false;
  var addOpacity = typeof opacity === 'number';
  if (addOpacity) return 'rgba(' + rgbValue.join(',') + ",".concat(opacity, ")");
  return 'rgb(' + rgbValue.join(',') + ')';
}
/**
 * @description Convert color to Hex color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {String|Boolean} Hex color (Invalid input will return false)
 */


function toHex(color) {
  if (!color) {
    console.error('toHex: Missing parameters!');
    return false;
  }

  if (hexReg.test(color)) return color;
  color = getRgbValue(color);
  if (!color) return false;
  return '#' + color.map(function (n) {
    return Number(n).toString(16);
  }).map(function (n) {
    return n === '0' ? '00' : n;
  }).join('');
}
/**
 * @description Get Color from Rgb|Rgba value
 * @param {Array<Number>} value Rgb|Rgba color value
 * @return {String|Boolean} Rgb|Rgba color (Invalid input will return false)
 */


function getColorFromRgbValue(value) {
  if (!value) {
    console.error('getColorFromRgbValue: Missing parameters!');
    return false;
  }

  var valueLength = value.length;

  if (valueLength !== 3 && valueLength !== 4) {
    console.error('getColorFromRgbValue: Value is illegal!');
    return false;
  }

  var color = valueLength === 3 ? 'rgb(' : 'rgba(';
  color += value.join(',') + ')';
  return color;
}
/**
 * @description Deepen color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Number} Percent of Deepen (1-100)
 * @return {String|Boolean} Rgba color (Invalid input will return false)
 */


function darken(color) {
  var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!color) {
    console.error('darken: Missing parameters!');
    return false;
  }

  var rgbaValue = getRgbaValue(color);
  if (!rgbaValue) return false;
  rgbaValue = rgbaValue.map(function (v, i) {
    return i === 3 ? v : v - Math.ceil(2.55 * percent);
  }).map(function (v) {
    return v < 0 ? 0 : v;
  });
  return getColorFromRgbValue(rgbaValue);
}
/**
 * @description Brighten color
 * @param {String} color Hex|Rgb|Rgba color or color keyword
 * @return {Number} Percent of brighten (1-100)
 * @return {String|Boolean} Rgba color (Invalid input will return false)
 */


function lighten(color) {
  var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (!color) {
    console.error('lighten: Missing parameters!');
    return false;
  }

  var rgbaValue = getRgbaValue(color);
  if (!rgbaValue) return false;
  rgbaValue = rgbaValue.map(function (v, i) {
    return i === 3 ? v : v + Math.ceil(2.55 * percent);
  }).map(function (v) {
    return v > 255 ? 255 : v;
  });
  return getColorFromRgbValue(rgbaValue);
}
/**
 * @description Adjust color opacity
 * @param {String} color   Hex|Rgb|Rgba color or color keyword
 * @param {Number} Percent of opacity
 * @return {String|Boolean} Rgba color (Invalid input will return false)
 */


function fade(color) {
  var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

  if (!color) {
    console.error('fade: Missing parameters!');
    return false;
  }

  var rgbValue = getRgbValue(color);
  if (!rgbValue) return false;
  var rgbaValue = [].concat((0, _toConsumableArray2["default"])(rgbValue), [percent / 100]);
  return getColorFromRgbValue(rgbaValue);
}

var _default = {
  fade: fade,
  toHex: toHex,
  toRgb: toRgb,
  darken: darken,
  lighten: lighten,
  getOpacity: getOpacity,
  getRgbValue: getRgbValue,
  getRgbaValue: getRgbaValue,
  getColorFromRgbValue: getColorFromRgbValue
};
exports["default"] = _default;
},{"./config/keywords":55,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.easeInOutBounce = exports.easeOutBounce = exports.easeInBounce = exports.easeInOutElastic = exports.easeOutElastic = exports.easeInElastic = exports.easeInOutBack = exports.easeOutBack = exports.easeInBack = exports.easeInOutQuint = exports.easeOutQuint = exports.easeInQuint = exports.easeInOutQuart = exports.easeOutQuart = exports.easeInQuart = exports.easeInOutCubic = exports.easeOutCubic = exports.easeInCubic = exports.easeInOutQuad = exports.easeOutQuad = exports.easeInQuad = exports.easeInOutSine = exports.easeOutSine = exports.easeInSine = exports.linear = void 0;
var linear = [[[0, 1], '', [0.33, 0.67]], [[1, 0], [0.67, 0.33]]];
/**
 * @description Sine
 */

exports.linear = linear;
var easeInSine = [[[0, 1]], [[0.538, 0.564], [0.169, 0.912], [0.880, 0.196]], [[1, 0]]];
exports.easeInSine = easeInSine;
var easeOutSine = [[[0, 1]], [[0.444, 0.448], [0.169, 0.736], [0.718, 0.16]], [[1, 0]]];
exports.easeOutSine = easeOutSine;
var easeInOutSine = [[[0, 1]], [[0.5, 0.5], [0.2, 1], [0.8, 0]], [[1, 0]]];
/**
 * @description Quad
 */

exports.easeInOutSine = easeInOutSine;
var easeInQuad = [[[0, 1]], [[0.550, 0.584], [0.231, 0.904], [0.868, 0.264]], [[1, 0]]];
exports.easeInQuad = easeInQuad;
var easeOutQuad = [[[0, 1]], [[0.413, 0.428], [0.065, 0.816], [0.760, 0.04]], [[1, 0]]];
exports.easeOutQuad = easeOutQuad;
var easeInOutQuad = [[[0, 1]], [[0.5, 0.5], [0.3, 0.9], [0.7, 0.1]], [[1, 0]]];
/**
 * @description Cubic
 */

exports.easeInOutQuad = easeInOutQuad;
var easeInCubic = [[[0, 1]], [[0.679, 0.688], [0.366, 0.992], [0.992, 0.384]], [[1, 0]]];
exports.easeInCubic = easeInCubic;
var easeOutCubic = [[[0, 1]], [[0.321, 0.312], [0.008, 0.616], [0.634, 0.008]], [[1, 0]]];
exports.easeOutCubic = easeOutCubic;
var easeInOutCubic = [[[0, 1]], [[0.5, 0.5], [0.3, 1], [0.7, 0]], [[1, 0]]];
/**
 * @description Quart
 */

exports.easeInOutCubic = easeInOutCubic;
var easeInQuart = [[[0, 1]], [[0.812, 0.74], [0.611, 0.988], [1.013, 0.492]], [[1, 0]]];
exports.easeInQuart = easeInQuart;
var easeOutQuart = [[[0, 1]], [[0.152, 0.244], [0.001, 0.448], [0.285, -0.02]], [[1, 0]]];
exports.easeOutQuart = easeOutQuart;
var easeInOutQuart = [[[0, 1]], [[0.5, 0.5], [0.4, 1], [0.6, 0]], [[1, 0]]];
/**
 * @description Quint
 */

exports.easeInOutQuart = easeInOutQuart;
var easeInQuint = [[[0, 1]], [[0.857, 0.856], [0.714, 1], [1, 0.712]], [[1, 0]]];
exports.easeInQuint = easeInQuint;
var easeOutQuint = [[[0, 1]], [[0.108, 0.2], [0.001, 0.4], [0.214, -0.012]], [[1, 0]]];
exports.easeOutQuint = easeOutQuint;
var easeInOutQuint = [[[0, 1]], [[0.5, 0.5], [0.5, 1], [0.5, 0]], [[1, 0]]];
/**
 * @description Back
 */

exports.easeInOutQuint = easeInOutQuint;
var easeInBack = [[[0, 1]], [[0.667, 0.896], [0.380, 1.184], [0.955, 0.616]], [[1, 0]]];
exports.easeInBack = easeInBack;
var easeOutBack = [[[0, 1]], [[0.335, 0.028], [0.061, 0.22], [0.631, -0.18]], [[1, 0]]];
exports.easeOutBack = easeOutBack;
var easeInOutBack = [[[0, 1]], [[0.5, 0.5], [0.4, 1.4], [0.6, -0.4]], [[1, 0]]];
/**
 * @description Elastic
 */

exports.easeInOutBack = easeInOutBack;
var easeInElastic = [[[0, 1]], [[0.474, 0.964], [0.382, 0.988], [0.557, 0.952]], [[0.619, 1.076], [0.565, 1.088], [0.669, 1.08]], [[0.770, 0.916], [0.712, 0.924], [0.847, 0.904]], [[0.911, 1.304], [0.872, 1.316], [0.961, 1.34]], [[1, 0]]];
exports.easeInElastic = easeInElastic;
var easeOutElastic = [[[0, 1]], [[0.073, -0.32], [0.034, -0.328], [0.104, -0.344]], [[0.191, 0.092], [0.110, 0.06], [0.256, 0.08]], [[0.310, -0.076], [0.260, -0.068], [0.357, -0.076]], [[0.432, 0.032], [0.362, 0.028], [0.683, -0.004]], [[1, 0]]];
exports.easeOutElastic = easeOutElastic;
var easeInOutElastic = [[[0, 1]], [[0.210, 0.94], [0.167, 0.884], [0.252, 0.98]], [[0.299, 1.104], [0.256, 1.092], [0.347, 1.108]], [[0.5, 0.496], [0.451, 0.672], [0.548, 0.324]], [[0.696, -0.108], [0.652, -0.112], [0.741, -0.124]], [[0.805, 0.064], [0.756, 0.012], [0.866, 0.096]], [[1, 0]]];
/**
 * @description Bounce
 */

exports.easeInOutElastic = easeInOutElastic;
var easeInBounce = [[[0, 1]], [[0.148, 1], [0.075, 0.868], [0.193, 0.848]], [[0.326, 1], [0.276, 0.836], [0.405, 0.712]], [[0.600, 1], [0.511, 0.708], [0.671, 0.348]], [[1, 0]]];
exports.easeInBounce = easeInBounce;
var easeOutBounce = [[[0, 1]], [[0.357, 0.004], [0.270, 0.592], [0.376, 0.252]], [[0.604, -0.004], [0.548, 0.312], [0.669, 0.184]], [[0.820, 0], [0.749, 0.184], [0.905, 0.132]], [[1, 0]]];
exports.easeOutBounce = easeOutBounce;
var easeInOutBounce = [[[0, 1]], [[0.102, 1], [0.050, 0.864], [0.117, 0.86]], [[0.216, 0.996], [0.208, 0.844], [0.227, 0.808]], [[0.347, 0.996], [0.343, 0.8], [0.480, 0.292]], [[0.635, 0.004], [0.511, 0.676], [0.656, 0.208]], [[0.787, 0], [0.760, 0.2], [0.795, 0.144]], [[0.905, -0.004], [0.899, 0.164], [0.944, 0.144]], [[1, 0]]];
exports.easeInOutBounce = easeInOutBounce;

var _default = new Map([['linear', linear], ['easeInSine', easeInSine], ['easeOutSine', easeOutSine], ['easeInOutSine', easeInOutSine], ['easeInQuad', easeInQuad], ['easeOutQuad', easeOutQuad], ['easeInOutQuad', easeInOutQuad], ['easeInCubic', easeInCubic], ['easeOutCubic', easeOutCubic], ['easeInOutCubic', easeInOutCubic], ['easeInQuart', easeInQuart], ['easeOutQuart', easeOutQuart], ['easeInOutQuart', easeInOutQuart], ['easeInQuint', easeInQuint], ['easeOutQuint', easeOutQuint], ['easeInOutQuint', easeInOutQuint], ['easeInBack', easeInBack], ['easeOutBack', easeOutBack], ['easeInOutBack', easeInOutBack], ['easeInElastic', easeInElastic], ['easeOutElastic', easeOutElastic], ['easeInOutElastic', easeInOutElastic], ['easeInBounce', easeInBounce], ['easeOutBounce', easeOutBounce], ['easeInOutBounce', easeInOutBounce]]);

exports["default"] = _default;
},{}],58:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transition = transition;
exports.injectNewCurve = injectNewCurve;
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _curves = _interopRequireDefault(require("./config/curves"));

var defaultTransitionBC = 'linear';
/**
 * @description Get the N-frame animation state by the start and end state
 *              of the animation and the easing curve
 * @param {String|Array} tBC               Easing curve name or data
 * @param {Number|Array|Object} startState Animation start state
 * @param {Number|Array|Object} endState   Animation end state
 * @param {Number} frameNum                Number of Animation frames
 * @param {Boolean} deep                   Whether to use recursive mode
 * @return {Array|Boolean} State of each frame of the animation (Invalid input will return false)
 */

function transition(tBC) {
  var startState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var endState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var frameNum = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 30;
  var deep = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  if (!checkParams.apply(void 0, arguments)) return false;

  try {
    // Get the transition bezier curve
    var bezierCurve = getBezierCurve(tBC); // Get the progress of each frame state

    var frameStateProgress = getFrameStateProgress(bezierCurve, frameNum); // If the recursion mode is not enabled or the state type is Number, the shallow state calculation is performed directly.

    if (!deep || typeof endState === 'number') return getTransitionState(startState, endState, frameStateProgress);
    return recursionTransitionState(startState, endState, frameStateProgress);
  } catch (_unused) {
    console.warn('Transition parameter may be abnormal!');
    return [endState];
  }
}
/**
 * @description Check if the parameters are legal
 * @param {String} tBC      Name of transition bezier curve
 * @param {Any} startState  Transition start state
 * @param {Any} endState    Transition end state
 * @param {Number} frameNum Number of transition frames
 * @return {Boolean} Is the parameter legal
 */


function checkParams(tBC) {
  var startState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var endState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var frameNum = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 30;

  if (!tBC || startState === false || endState === false || !frameNum) {
    console.error('transition: Missing Parameters!');
    return false;
  }

  if ((0, _typeof2["default"])(startState) !== (0, _typeof2["default"])(endState)) {
    console.error('transition: Inconsistent Status Types!');
    return false;
  }

  var stateType = (0, _typeof2["default"])(endState);

  if (stateType === 'string' || stateType === 'boolean' || !tBC.length) {
    console.error('transition: Unsupported Data Type of State!');
    return false;
  }

  if (!_curves["default"].has(tBC) && !(tBC instanceof Array)) {
    console.warn('transition: Transition curve not found, default curve will be used!');
  }

  return true;
}
/**
 * @description Get the transition bezier curve
 * @param {String} tBC Name of transition bezier curve
 * @return {Array} Bezier curve data
 */


function getBezierCurve(tBC) {
  var bezierCurve = '';

  if (_curves["default"].has(tBC)) {
    bezierCurve = _curves["default"].get(tBC);
  } else if (tBC instanceof Array) {
    bezierCurve = tBC;
  } else {
    bezierCurve = _curves["default"].get(defaultTransitionBC);
  }

  return bezierCurve;
}
/**
 * @description Get the progress of each frame state
 * @param {Array} bezierCurve Transition bezier curve
 * @param {Number} frameNum   Number of transition frames
 * @return {Array} Progress of each frame state
 */


function getFrameStateProgress(bezierCurve, frameNum) {
  var tMinus = 1 / (frameNum - 1);
  var tState = new Array(frameNum).fill(0).map(function (t, i) {
    return i * tMinus;
  });
  var frameState = tState.map(function (t) {
    return getFrameStateFromT(bezierCurve, t);
  });
  return frameState;
}
/**
 * @description Get the progress of the corresponding frame according to t
 * @param {Array} bezierCurve Transition bezier curve
 * @param {Number} t          Current frame t
 * @return {Number} Progress of current frame
 */


function getFrameStateFromT(bezierCurve, t) {
  var tBezierCurvePoint = getBezierCurvePointFromT(bezierCurve, t);
  var bezierCurvePointT = getBezierCurvePointTFromReT(tBezierCurvePoint, t);
  return getBezierCurveTState(tBezierCurvePoint, bezierCurvePointT);
}
/**
 * @description Get the corresponding sub-curve according to t
 * @param {Array} bezierCurve Transition bezier curve
 * @param {Number} t          Current frame t
 * @return {Array} Sub-curve of t
 */


function getBezierCurvePointFromT(bezierCurve, t) {
  var lastIndex = bezierCurve.length - 1;
  var begin = '',
      end = '';
  bezierCurve.findIndex(function (item, i) {
    if (i === lastIndex) return;
    begin = item;
    end = bezierCurve[i + 1];
    var currentMainPointX = begin[0][0];
    var nextMainPointX = end[0][0];
    return t >= currentMainPointX && t < nextMainPointX;
  });
  var p0 = begin[0];
  var p1 = begin[2] || begin[0];
  var p2 = end[1] || end[0];
  var p3 = end[0];
  return [p0, p1, p2, p3];
}
/**
 * @description Get local t based on t and sub-curve
 * @param {Array} bezierCurve Sub-curve
 * @param {Number} t          Current frame t
 * @return {Number} local t of sub-curve
 */


function getBezierCurvePointTFromReT(bezierCurve, t) {
  var reBeginX = bezierCurve[0][0];
  var reEndX = bezierCurve[3][0];
  var xMinus = reEndX - reBeginX;
  var tMinus = t - reBeginX;
  return tMinus / xMinus;
}
/**
 * @description Get the curve progress of t
 * @param {Array} bezierCurve Sub-curve
 * @param {Number} t          Current frame t
 * @return {Number} Progress of current frame
 */


function getBezierCurveTState(_ref, t) {
  var _ref2 = (0, _slicedToArray2["default"])(_ref, 4),
      _ref2$ = (0, _slicedToArray2["default"])(_ref2[0], 2),
      p0 = _ref2$[1],
      _ref2$2 = (0, _slicedToArray2["default"])(_ref2[1], 2),
      p1 = _ref2$2[1],
      _ref2$3 = (0, _slicedToArray2["default"])(_ref2[2], 2),
      p2 = _ref2$3[1],
      _ref2$4 = (0, _slicedToArray2["default"])(_ref2[3], 2),
      p3 = _ref2$4[1];

  var pow = Math.pow;
  var tMinus = 1 - t;
  var result1 = p0 * pow(tMinus, 3);
  var result2 = 3 * p1 * t * pow(tMinus, 2);
  var result3 = 3 * p2 * pow(t, 2) * tMinus;
  var result4 = p3 * pow(t, 3);
  return 1 - (result1 + result2 + result3 + result4);
}
/**
 * @description Get transition state according to frame progress
 * @param {Any} startState   Transition start state
 * @param {Any} endState     Transition end state
 * @param {Array} frameState Frame state progress
 * @return {Array} Transition frame state
 */


function getTransitionState(begin, end, frameState) {
  var stateType = 'object';
  if (typeof begin === 'number') stateType = 'number';
  if (begin instanceof Array) stateType = 'array';
  if (stateType === 'number') return getNumberTransitionState(begin, end, frameState);
  if (stateType === 'array') return getArrayTransitionState(begin, end, frameState);
  if (stateType === 'object') return getObjectTransitionState(begin, end, frameState);
  return frameState.map(function (t) {
    return end;
  });
}
/**
 * @description Get the transition data of the number type
 * @param {Number} startState Transition start state
 * @param {Number} endState   Transition end state
 * @param {Array} frameState  Frame state progress
 * @return {Array} Transition frame state
 */


function getNumberTransitionState(begin, end, frameState) {
  var minus = end - begin;
  return frameState.map(function (s) {
    return begin + minus * s;
  });
}
/**
 * @description Get the transition data of the array type
 * @param {Array} startState Transition start state
 * @param {Array} endState   Transition end state
 * @param {Array} frameState Frame state progress
 * @return {Array} Transition frame state
 */


function getArrayTransitionState(begin, end, frameState) {
  var minus = end.map(function (v, i) {
    if (typeof v !== 'number') return false;
    return v - begin[i];
  });
  return frameState.map(function (s) {
    return minus.map(function (v, i) {
      if (v === false) return end[i];
      return begin[i] + v * s;
    });
  });
}
/**
 * @description Get the transition data of the object type
 * @param {Object} startState Transition start state
 * @param {Object} endState   Transition end state
 * @param {Array} frameState  Frame state progress
 * @return {Array} Transition frame state
 */


function getObjectTransitionState(begin, end, frameState) {
  var keys = Object.keys(end);
  var beginValue = keys.map(function (k) {
    return begin[k];
  });
  var endValue = keys.map(function (k) {
    return end[k];
  });
  var arrayState = getArrayTransitionState(beginValue, endValue, frameState);
  return arrayState.map(function (item) {
    var frameData = {};
    item.forEach(function (v, i) {
      return frameData[keys[i]] = v;
    });
    return frameData;
  });
}
/**
 * @description Get the transition state data by recursion
 * @param {Array|Object} startState Transition start state
 * @param {Array|Object} endState   Transition end state
 * @param {Array} frameState        Frame state progress
 * @return {Array} Transition frame state
 */


function recursionTransitionState(begin, end, frameState) {
  var state = getTransitionState(begin, end, frameState);

  var _loop = function _loop(key) {
    var bTemp = begin[key];
    var eTemp = end[key];
    if ((0, _typeof2["default"])(eTemp) !== 'object') return "continue";
    var data = recursionTransitionState(bTemp, eTemp, frameState);
    state.forEach(function (fs, i) {
      return fs[key] = data[i];
    });
  };

  for (var key in end) {
    var _ret = _loop(key);

    if (_ret === "continue") continue;
  }

  return state;
}
/**
 * @description Inject new curve into curves as config
 * @param {Any} key     The key of curve
 * @param {Array} curve Bezier curve data
 * @return {Undefined} No return
 */


function injectNewCurve(key, curve) {
  if (!key || !curve) {
    console.error('InjectNewCurve Missing Parameters!');
    return;
  }

  _curves["default"].set(key, curve);
}

var _default = transition;
exports["default"] = _default;
},{"./config/curves":57,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/slicedToArray":41,"@babel/runtime/helpers/typeof":43}],59:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9lbnRyeS5qcyIsImxpYi9jbGFzcy9jaGFydHMuY2xhc3MuanMiLCJsaWIvY2xhc3MvdXBkYXRlci5jbGFzcy5qcyIsImxpYi9jb25maWcvYXhpcy5qcyIsImxpYi9jb25maWcvYmFyLmpzIiwibGliL2NvbmZpZy9jb2xvci5qcyIsImxpYi9jb25maWcvZ2F1Z2UuanMiLCJsaWIvY29uZmlnL2dyaWQuanMiLCJsaWIvY29uZmlnL2luZGV4LmpzIiwibGliL2NvbmZpZy9sZWdlbmQuanMiLCJsaWIvY29uZmlnL2xpbmUuanMiLCJsaWIvY29uZmlnL3BpZS5qcyIsImxpYi9jb25maWcvcmFkYXIuanMiLCJsaWIvY29uZmlnL3JhZGFyQXhpcy5qcyIsImxpYi9jb25maWcvdGl0bGUuanMiLCJsaWIvY29yZS9heGlzLmpzIiwibGliL2NvcmUvYmFyLmpzIiwibGliL2NvcmUvZ2F1Z2UuanMiLCJsaWIvY29yZS9ncmlkLmpzIiwibGliL2NvcmUvaW5kZXguanMiLCJsaWIvY29yZS9sZWdlbmQuanMiLCJsaWIvY29yZS9saW5lLmpzIiwibGliL2NvcmUvbWVyZ2VDb2xvci5qcyIsImxpYi9jb3JlL3BpZS5qcyIsImxpYi9jb3JlL3JhZGFyLmpzIiwibGliL2NvcmUvcmFkYXJBeGlzLmpzIiwibGliL2NvcmUvdGl0bGUuanMiLCJsaWIvZXh0ZW5kL2luZGV4LmpzIiwibGliL2luZGV4LmpzIiwibGliL3V0aWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5V2l0aG91dEhvbGVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXN5bmNUb0dlbmVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXlMaW1pdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlUmVzdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlU3ByZWFkLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYmV6aWVyLWN1cnZlL2xpYi9jb3JlL2JlemllckN1cnZlVG9Qb2x5bGluZS5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2Jlemllci1jdXJ2ZS9saWIvY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmUuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9iZXppZXItY3VydmUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL2NsYXNzL2NyZW5kZXIuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3MvZ3JhcGguY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3Mvc3R5bGUuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY29uZmlnL2dyYXBocy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vY2FudmFzLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvY29sb3IvbGliL2NvbmZpZy9rZXl3b3Jkcy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2NvbG9yL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL3RyYW5zaXRpb24vbGliL2NvbmZpZy9jdXJ2ZXMuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS90cmFuc2l0aW9uL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3R3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3R5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1akJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcllBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBDaGFydHMgPSByZXF1aXJlKCcuLi9saWIvaW5kZXgnKVxyXG5cclxud2luZG93LkNoYXJ0cyA9IENoYXJ0cyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnJlcXVpcmUoXCIuLi9leHRlbmQvaW5kZXhcIik7XG5cbnZhciBfY1JlbmRlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXJcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29yZSA9IHJlcXVpcmUoXCIuLi9jb3JlXCIpO1xuXG52YXIgQ2hhcnRzID0gZnVuY3Rpb24gQ2hhcnRzKGRvbSkge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIENoYXJ0cyk7XG5cbiAgaWYgKCFkb20pIHtcbiAgICBjb25zb2xlLmVycm9yKCdDaGFydHMgTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBjbGllbnRXaWR0aCA9IGRvbS5jbGllbnRXaWR0aCxcbiAgICAgIGNsaWVudEhlaWdodCA9IGRvbS5jbGllbnRIZWlnaHQ7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBjbGllbnRXaWR0aCk7XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGNsaWVudEhlaWdodCk7XG4gIGRvbS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICB2YXIgYXR0cmlidXRlID0ge1xuICAgIGNvbnRhaW5lcjogZG9tLFxuICAgIGNhbnZhczogY2FudmFzLFxuICAgIHJlbmRlcjogbmV3IF9jUmVuZGVyW1wiZGVmYXVsdFwiXShjYW52YXMpLFxuICAgIG9wdGlvbjogbnVsbFxuICB9O1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGF0dHJpYnV0ZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTZXQgY2hhcnQgb3B0aW9uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gQ2hhcnQgb3B0aW9uXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gTm8gcmV0dXJuXHJcbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ2hhcnRzO1xuXG5DaGFydHMucHJvdG90eXBlLnNldE9wdGlvbiA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgaWYgKCFvcHRpb24gfHwgKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkob3B0aW9uKSAhPT0gJ29iamVjdCcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdzZXRPcHRpb24gTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBvcHRpb25DbG9uZWQgPSAoMCwgX3V0aWwuZGVlcENsb25lKShvcHRpb24sIHRydWUpO1xuICAoMCwgX2NvcmUubWVyZ2VDb2xvcikodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmdyaWQpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5heGlzKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUucmFkYXJBeGlzKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUudGl0bGUpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5iYXIpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5saW5lKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUucGllKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUucmFkYXIpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5nYXVnZSkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmxlZ2VuZCkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgdGhpcy5vcHRpb24gPSBvcHRpb247XG4gIHRoaXMucmVuZGVyLmxhdW5jaEFuaW1hdGlvbigpOyAvLyBjb25zb2xlLndhcm4odGhpcylcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFJlc2l6ZSBjaGFydFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IE5vIHJldHVyblxyXG4gKi9cblxuXG5DaGFydHMucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLFxuICAgICAgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICByZW5kZXIgPSB0aGlzLnJlbmRlcixcbiAgICAgIG9wdGlvbiA9IHRoaXMub3B0aW9uO1xuICB2YXIgY2xpZW50V2lkdGggPSBjb250YWluZXIuY2xpZW50V2lkdGgsXG4gICAgICBjbGllbnRIZWlnaHQgPSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGNsaWVudFdpZHRoKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgY2xpZW50SGVpZ2h0KTtcbiAgcmVuZGVyLmFyZWEgPSBbY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodF07XG4gIHRoaXMuc2V0T3B0aW9uKG9wdGlvbik7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZG9VcGRhdGUgPSBkb1VwZGF0ZTtcbmV4cG9ydHMuVXBkYXRlciA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG52YXIgVXBkYXRlciA9IGZ1bmN0aW9uIFVwZGF0ZXIoY29uZmlnLCBzZXJpZXMpIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBVcGRhdGVyKTtcbiAgdmFyIGNoYXJ0ID0gY29uZmlnLmNoYXJ0LFxuICAgICAga2V5ID0gY29uZmlnLmtleSxcbiAgICAgIGdldEdyYXBoQ29uZmlnID0gY29uZmlnLmdldEdyYXBoQ29uZmlnO1xuXG4gIGlmICh0eXBlb2YgZ2V0R3JhcGhDb25maWcgIT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLndhcm4oJ1VwZGF0ZXIgbmVlZCBmdW5jdGlvbiBnZXRHcmFwaENvbmZpZyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNoYXJ0W2tleV0pIHRoaXMuZ3JhcGhzID0gY2hhcnRba2V5XSA9IFtdO1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGNvbmZpZyk7XG4gIHRoaXMudXBkYXRlKHNlcmllcyk7XG59O1xuXG5leHBvcnRzLlVwZGF0ZXIgPSBVcGRhdGVyO1xuXG5VcGRhdGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoc2VyaWVzKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzLFxuICAgICAgYmVmb3JlVXBkYXRlID0gdGhpcy5iZWZvcmVVcGRhdGU7XG4gIGRlbFJlZHVuZGFuY2VHcmFwaCh0aGlzLCBzZXJpZXMpO1xuICBpZiAoIXNlcmllcy5sZW5ndGgpIHJldHVybjtcbiAgdmFyIGJlZm9yZVVwZGF0ZVR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShiZWZvcmVVcGRhdGUpO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoc2VyaWVzSXRlbSwgaSkge1xuICAgIGlmIChiZWZvcmVVcGRhdGVUeXBlID09PSAnZnVuY3Rpb24nKSBiZWZvcmVVcGRhdGUoZ3JhcGhzLCBzZXJpZXNJdGVtLCBpLCBfdGhpcyk7XG4gICAgdmFyIGNhY2hlID0gZ3JhcGhzW2ldO1xuXG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICBjaGFuZ2VHcmFwaHMoY2FjaGUsIHNlcmllc0l0ZW0sIGksIF90aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkR3JhcGhzKGdyYXBocywgc2VyaWVzSXRlbSwgaSwgX3RoaXMpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBkZWxSZWR1bmRhbmNlR3JhcGgodXBkYXRlciwgc2VyaWVzKSB7XG4gIHZhciBncmFwaHMgPSB1cGRhdGVyLmdyYXBocyxcbiAgICAgIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgY2FjaGVHcmFwaE51bSA9IGdyYXBocy5sZW5ndGg7XG4gIHZhciBuZWVkR3JhcGhOdW0gPSBzZXJpZXMubGVuZ3RoO1xuXG4gIGlmIChjYWNoZUdyYXBoTnVtID4gbmVlZEdyYXBoTnVtKSB7XG4gICAgdmFyIG5lZWREZWxHcmFwaHMgPSBncmFwaHMuc3BsaWNlKG5lZWRHcmFwaE51bSk7XG4gICAgbmVlZERlbEdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VHcmFwaHMoY2FjaGUsIHNlcmllc0l0ZW0sIGksIHVwZGF0ZXIpIHtcbiAgdmFyIGdldEdyYXBoQ29uZmlnID0gdXBkYXRlci5nZXRHcmFwaENvbmZpZyxcbiAgICAgIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyLFxuICAgICAgYmVmb3JlQ2hhbmdlID0gdXBkYXRlci5iZWZvcmVDaGFuZ2U7XG4gIHZhciBjb25maWdzID0gZ2V0R3JhcGhDb25maWcoc2VyaWVzSXRlbSwgdXBkYXRlcik7XG4gIGJhbGFuY2VHcmFwaHNOdW0oY2FjaGUsIGNvbmZpZ3MsIHJlbmRlcik7XG4gIGNhY2hlLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoLCBqKSB7XG4gICAgdmFyIGNvbmZpZyA9IGNvbmZpZ3Nbal07XG4gICAgaWYgKHR5cGVvZiBiZWZvcmVDaGFuZ2UgPT09ICdmdW5jdGlvbicpIGJlZm9yZUNoYW5nZShncmFwaCwgY29uZmlnKTtcbiAgICB1cGRhdGVHcmFwaENvbmZpZ0J5S2V5KGdyYXBoLCBjb25maWcpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYmFsYW5jZUdyYXBoc051bShncmFwaHMsIGdyYXBoQ29uZmlnLCByZW5kZXIpIHtcbiAgdmFyIGNhY2hlR3JhcGhOdW0gPSBncmFwaHMubGVuZ3RoO1xuICB2YXIgbmVlZEdyYXBoTnVtID0gZ3JhcGhDb25maWcubGVuZ3RoO1xuXG4gIGlmIChuZWVkR3JhcGhOdW0gPiBjYWNoZUdyYXBoTnVtKSB7XG4gICAgdmFyIGxhc3RDYWNoZUdyYXBoID0gZ3JhcGhzLnNsaWNlKC0xKVswXTtcbiAgICB2YXIgbmVlZEFkZEdyYXBoTnVtID0gbmVlZEdyYXBoTnVtIC0gY2FjaGVHcmFwaE51bTtcbiAgICB2YXIgbmVlZEFkZEdyYXBocyA9IG5ldyBBcnJheShuZWVkQWRkR3JhcGhOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2xvbmUobGFzdENhY2hlR3JhcGgpO1xuICAgIH0pO1xuICAgIGdyYXBocy5wdXNoLmFwcGx5KGdyYXBocywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZWVkQWRkR3JhcGhzKSk7XG4gIH0gZWxzZSBpZiAobmVlZEdyYXBoTnVtIDwgY2FjaGVHcmFwaE51bSkge1xuICAgIHZhciBuZWVkRGVsQ2FjaGUgPSBncmFwaHMuc3BsaWNlKG5lZWRHcmFwaE51bSk7XG4gICAgbmVlZERlbENhY2hlLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkR3JhcGhzKGdyYXBocywgc2VyaWVzSXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgZ2V0R3JhcGhDb25maWcgPSB1cGRhdGVyLmdldEdyYXBoQ29uZmlnLFxuICAgICAgZ2V0U3RhcnRHcmFwaENvbmZpZyA9IHVwZGF0ZXIuZ2V0U3RhcnRHcmFwaENvbmZpZyxcbiAgICAgIGNoYXJ0ID0gdXBkYXRlci5jaGFydDtcbiAgdmFyIHJlbmRlciA9IGNoYXJ0LnJlbmRlcjtcbiAgdmFyIHN0YXJ0Q29uZmlncyA9IG51bGw7XG4gIGlmICh0eXBlb2YgZ2V0U3RhcnRHcmFwaENvbmZpZyA9PT0gJ2Z1bmN0aW9uJykgc3RhcnRDb25maWdzID0gZ2V0U3RhcnRHcmFwaENvbmZpZyhzZXJpZXNJdGVtLCB1cGRhdGVyKTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRHcmFwaENvbmZpZyhzZXJpZXNJdGVtLCB1cGRhdGVyKTtcbiAgaWYgKCFjb25maWdzLmxlbmd0aCkgcmV0dXJuO1xuXG4gIGlmIChzdGFydENvbmZpZ3MpIHtcbiAgICBncmFwaHNbaV0gPSBzdGFydENvbmZpZ3MubWFwKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuYWRkKGNvbmZpZyk7XG4gICAgfSk7XG4gICAgZ3JhcGhzW2ldLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoLCBpKSB7XG4gICAgICB2YXIgY29uZmlnID0gY29uZmlnc1tpXTtcbiAgICAgIHVwZGF0ZUdyYXBoQ29uZmlnQnlLZXkoZ3JhcGgsIGNvbmZpZyk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZ3JhcGhzW2ldID0gY29uZmlncy5tYXAoZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgcmV0dXJuIHJlbmRlci5hZGQoY29uZmlnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBhZnRlckFkZEdyYXBoID0gdXBkYXRlci5hZnRlckFkZEdyYXBoO1xuICBpZiAodHlwZW9mIGFmdGVyQWRkR3JhcGggPT09ICdmdW5jdGlvbicpIGFmdGVyQWRkR3JhcGgoZ3JhcGhzW2ldKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlR3JhcGhDb25maWdCeUtleShncmFwaCwgY29uZmlnKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY29uZmlnKTtcbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5ID09PSAnc2hhcGUnIHx8IGtleSA9PT0gJ3N0eWxlJykge1xuICAgICAgZ3JhcGguYW5pbWF0aW9uKGtleSwgY29uZmlnW2tleV0sIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBncmFwaFtrZXldID0gY29uZmlnW2tleV07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZG9VcGRhdGUoKSB7XG4gIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fSxcbiAgICAgIGNoYXJ0ID0gX3JlZi5jaGFydCxcbiAgICAgIHNlcmllcyA9IF9yZWYuc2VyaWVzLFxuICAgICAga2V5ID0gX3JlZi5rZXksXG4gICAgICBnZXRHcmFwaENvbmZpZyA9IF9yZWYuZ2V0R3JhcGhDb25maWcsXG4gICAgICBnZXRTdGFydEdyYXBoQ29uZmlnID0gX3JlZi5nZXRTdGFydEdyYXBoQ29uZmlnLFxuICAgICAgYmVmb3JlQ2hhbmdlID0gX3JlZi5iZWZvcmVDaGFuZ2UsXG4gICAgICBiZWZvcmVVcGRhdGUgPSBfcmVmLmJlZm9yZVVwZGF0ZSxcbiAgICAgIGFmdGVyQWRkR3JhcGggPSBfcmVmLmFmdGVyQWRkR3JhcGg7XG5cbiAgaWYgKGNoYXJ0W2tleV0pIHtcbiAgICBjaGFydFtrZXldLnVwZGF0ZShzZXJpZXMpO1xuICB9IGVsc2Uge1xuICAgIGNoYXJ0W2tleV0gPSBuZXcgVXBkYXRlcih7XG4gICAgICBjaGFydDogY2hhcnQsXG4gICAgICBrZXk6IGtleSxcbiAgICAgIGdldEdyYXBoQ29uZmlnOiBnZXRHcmFwaENvbmZpZyxcbiAgICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0R3JhcGhDb25maWcsXG4gICAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZSxcbiAgICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlLFxuICAgICAgYWZ0ZXJBZGRHcmFwaDogYWZ0ZXJBZGRHcmFwaFxuICAgIH0sIHNlcmllcyk7XG4gIH1cbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMueUF4aXNDb25maWcgPSBleHBvcnRzLnhBeGlzQ29uZmlnID0gdm9pZCAwO1xudmFyIHhBeGlzQ29uZmlnID0ge1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBuYW1lXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcclxuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIGF4aXNcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHBvc2l0aW9uXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICdib3R0b20nXHJcbiAgICogQGV4YW1wbGUgcG9zaXRpb24gPSAnYm90dG9tJyB8ICd0b3AnXHJcbiAgICovXG4gIHBvc2l0aW9uOiAnYm90dG9tJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBnYXBcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IG5hbWVHYXAgPSAxNVxyXG4gICAqL1xuICBuYW1lR2FwOiAxNSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBsb2NhdGlvblxyXG4gICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICogQGRlZmF1bHQgbmFtZUxvY2F0aW9uID0gJ2VuZCdcclxuICAgKiBAZXhhbXBsZSBuYW1lTG9jYXRpb24gPSAnZW5kJyB8ICdjZW50ZXInIHwgJ3N0YXJ0J1xyXG4gICAqL1xuICBuYW1lTG9jYXRpb246ICdlbmQnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBOYW1lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgKi9cbiAgbmFtZVRleHRTdHlsZToge1xuICAgIGZpbGw6ICcjMzMzJyxcbiAgICBmb250U2l6ZTogMTBcbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBtaW4gdmFsdWVcclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCBtaW4gPSAnMjAlJ1xyXG4gICAqIEBleGFtcGxlIG1pbiA9ICcyMCUnIHwgMFxyXG4gICAqL1xuICBtaW46ICcyMCUnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG1heCB2YWx1ZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IG1heCA9ICcyMCUnXHJcbiAgICogQGV4YW1wbGUgbWF4ID0gJzIwJScgfCAwXHJcbiAgICovXG4gIG1heDogJzIwJScsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdmFsdWUgaW50ZXJ2YWxcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGludGVydmFsID0gbnVsbFxyXG4gICAqIEBleGFtcGxlIGludGVydmFsID0gMTAwXHJcbiAgICovXG4gIGludGVydmFsOiBudWxsLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBNaW4gaW50ZXJ2YWxcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IG1pbkludGVydmFsID0gbnVsbFxyXG4gICAqIEBleGFtcGxlIG1pbkludGVydmFsID0gMVxyXG4gICAqL1xuICBtaW5JbnRlcnZhbDogbnVsbCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTWF4IGludGVydmFsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBtYXhJbnRlcnZhbCA9IG51bGxcclxuICAgKiBAZXhhbXBsZSBtYXhJbnRlcnZhbCA9IDEwMFxyXG4gICAqL1xuICBtYXhJbnRlcnZhbDogbnVsbCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQm91bmRhcnkgZ2FwXHJcbiAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICogQGRlZmF1bHQgYm91bmRhcnlHYXAgPSBudWxsXHJcbiAgICogQGV4YW1wbGUgYm91bmRhcnlHYXAgPSB0cnVlXHJcbiAgICovXG4gIGJvdW5kYXJ5R2FwOiBudWxsLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IG51bWJlclxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgc3BsaXROdW1iZXIgPSA1XHJcbiAgICovXG4gIHNwbGl0TnVtYmVyOiA1LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGF4aXNMaW5lOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGluZVxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyMzMzMnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGF4aXNUaWNrOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgdGlja1xyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyMzMzMnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBheGlzTGFiZWw6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsYWJlbFxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZm9ybWF0dGVyXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxyXG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX3ku7YnXHJcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcclxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmaWxsOiAnIzMzMycsXG4gICAgICBmb250U2l6ZTogMTAsXG4gICAgICByb3RhdGU6IDBcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbGluZSBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgc3BsaXRMaW5lOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgc3BsaXQgbGluZVxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcclxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2Q0ZDRkNCcsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFggYXhpcyByZW5kZXIgbGV2ZWxcclxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgckxldmVsID0gLTIwXHJcbiAgICovXG4gIHJMZXZlbDogLTIwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBYIGF4aXMgYW5pbWF0aW9uIGN1cnZlXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXHJcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gWCBheGlzIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxyXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLnhBeGlzQ29uZmlnID0geEF4aXNDb25maWc7XG52YXIgeUF4aXNDb25maWcgPSB7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG5hbWVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IG5hbWUgPSAnJ1xyXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgYXhpc1xyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgcG9zaXRpb25cclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ2xlZnQnXHJcbiAgICogQGV4YW1wbGUgcG9zaXRpb24gPSAnbGVmdCcgfCAncmlnaHQnXHJcbiAgICovXG4gIHBvc2l0aW9uOiAnbGVmdCcsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgZ2FwXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBuYW1lR2FwID0gMTVcclxuICAgKi9cbiAgbmFtZUdhcDogMTUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgbG9jYXRpb25cclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IG5hbWVMb2NhdGlvbiA9ICdlbmQnXHJcbiAgICogQGV4YW1wbGUgbmFtZUxvY2F0aW9uID0gJ2VuZCcgfCAnY2VudGVyJyB8ICdzdGFydCdcclxuICAgKi9cbiAgbmFtZUxvY2F0aW9uOiAnZW5kJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gbmFtZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICovXG4gIG5hbWVUZXh0U3R5bGU6IHtcbiAgICBmaWxsOiAnIzMzMycsXG4gICAgZm9udFNpemU6IDEwXG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbWluIHZhbHVlXHJcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgbWluID0gJzIwJSdcclxuICAgKiBAZXhhbXBsZSBtaW4gPSAnMjAlJyB8IDBcclxuICAgKi9cbiAgbWluOiAnMjAlJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBtYXggdmFsdWVcclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCBtYXggPSAnMjAlJ1xyXG4gICAqIEBleGFtcGxlIG1heCA9ICcyMCUnIHwgMFxyXG4gICAqL1xuICBtYXg6ICcyMCUnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHZhbHVlIGludGVydmFsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBpbnRlcnZhbCA9IG51bGxcclxuICAgKiBAZXhhbXBsZSBpbnRlcnZhbCA9IDEwMFxyXG4gICAqL1xuICBpbnRlcnZhbDogbnVsbCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTWluIGludGVydmFsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBtaW5JbnRlcnZhbCA9IG51bGxcclxuICAgKiBAZXhhbXBsZSBtaW5JbnRlcnZhbCA9IDFcclxuICAgKi9cbiAgbWluSW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIE1heCBpbnRlcnZhbFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgbWF4SW50ZXJ2YWwgPSBudWxsXHJcbiAgICogQGV4YW1wbGUgbWF4SW50ZXJ2YWwgPSAxMDBcclxuICAgKi9cbiAgbWF4SW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEJvdW5kYXJ5IGdhcFxyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IGJvdW5kYXJ5R2FwID0gbnVsbFxyXG4gICAqIEBleGFtcGxlIGJvdW5kYXJ5R2FwID0gdHJ1ZVxyXG4gICAqL1xuICBib3VuZGFyeUdhcDogbnVsbCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBudW1iZXJcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHNwbGl0TnVtYmVyID0gNVxyXG4gICAqL1xuICBzcGxpdE51bWJlcjogNSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsaW5lIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBheGlzTGluZToge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxpbmVcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcclxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjMzMzJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBheGlzVGljazoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIHRpY2tcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcclxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjMzMzJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgYXhpc0xhYmVsOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGFiZWxcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcclxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGZvcm1hdHRlclxyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cclxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV95Lu2J1xyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0udmFsdWUpXHJcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyMzMzMnLFxuICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgcm90YXRlOiAwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IGxpbmUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIHNwbGl0TGluZToge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIHNwbGl0IGxpbmVcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcclxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjZDRkNGQ0JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gWSBheGlzIHJlbmRlciBsZXZlbFxyXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAtMjBcclxuICAgKi9cbiAgckxldmVsOiAtMjAsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFkgYXhpcyBhbmltYXRpb24gY3VydmVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcclxuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBZIGF4aXMgYW5pbWF0aW9uIGZyYW1lXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXHJcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMueUF4aXNDb25maWcgPSB5QXhpc0NvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYmFyQ29uZmlnID0gdm9pZCAwO1xudmFyIGJhckNvbmZpZyA9IHtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIGJhciBjaGFydFxyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBuYW1lXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcclxuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIERhdGEgc3RhY2tpbmdcclxuICAgKiBUaGUgZGF0YSB2YWx1ZSBvZiB0aGUgc2VyaWVzIGVsZW1lbnQgb2YgdGhlIHNhbWUgc3RhY2tcclxuICAgKiB3aWxsIGJlIHN1cGVyaW1wb3NlZCAodGhlIGxhdHRlciB2YWx1ZSB3aWxsIGJlIHN1cGVyaW1wb3NlZCBvbiB0aGUgcHJldmlvdXMgdmFsdWUpXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBzdGFjayA9ICcnXHJcbiAgICovXG4gIHN0YWNrOiAnJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHNoYXBlIHR5cGVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IHNoYXBlVHlwZSA9ICdub3JtYWwnXHJcbiAgICogQGV4YW1wbGUgc2hhcGVUeXBlID0gJ25vcm1hbCcgfCAnbGVmdEVjaGVsb24nIHwgJ3JpZ2h0RWNoZWxvbidcclxuICAgKi9cbiAgc2hhcGVUeXBlOiAnbm9ybWFsJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gRWNoZWxvbiBiYXIgc2hhcnBuZXNzIG9mZnNldFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgZWNoZWxvbk9mZnNldCA9IDEwXHJcbiAgICovXG4gIGVjaGVsb25PZmZzZXQ6IDEwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgd2lkdGhcclxuICAgKiBUaGlzIHByb3BlcnR5IHNob3VsZCBiZSBzZXQgb24gdGhlIGxhc3QgJ2Jhcicgc2VyaWVzXHJcbiAgICogaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbSB0byB0YWtlIGVmZmVjdCBhbmQgd2lsbCBiZSBpbiBlZmZlY3RcclxuICAgKiBmb3IgYWxsICdiYXInIHNlcmllcyBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYmFyV2lkdGggPSAnYXV0bydcclxuICAgKiBAZXhhbXBsZSBiYXJXaWR0aCA9ICdhdXRvJyB8ICcxMCUnIHwgMjBcclxuICAgKi9cbiAgYmFyV2lkdGg6ICdhdXRvJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGdhcFxyXG4gICAqIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIHNldCBvbiB0aGUgbGFzdCAnYmFyJyBzZXJpZXNcclxuICAgKiBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtIHRvIHRha2UgZWZmZWN0IGFuZCB3aWxsIGJlIGluIGVmZmVjdFxyXG4gICAqIGZvciBhbGwgJ2Jhcicgc2VyaWVzIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCBiYXJHYXAgPSAnMzAlJ1xyXG4gICAqIEBleGFtcGxlIGJhckdhcCA9ICczMCUnIHwgMzBcclxuICAgKi9cbiAgYmFyR2FwOiAnMzAlJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGNhdGVnb3J5IGdhcFxyXG4gICAqIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIHNldCBvbiB0aGUgbGFzdCAnYmFyJyBzZXJpZXNcclxuICAgKiBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtIHRvIHRha2UgZWZmZWN0IGFuZCB3aWxsIGJlIGluIGVmZmVjdFxyXG4gICAqIGZvciBhbGwgJ2Jhcicgc2VyaWVzIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCBiYXJDYXRlZ29yeUdhcCA9ICcyMCUnXHJcbiAgICogQGV4YW1wbGUgYmFyQ2F0ZWdvcnlHYXAgPSAnMjAlJyB8IDIwXHJcbiAgICovXG4gIGJhckNhdGVnb3J5R2FwOiAnMjAlJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHggYXhpcyBpbmRleFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgeEF4aXNJbmRleCA9IDBcclxuICAgKiBAZXhhbXBsZSB4QXhpc0luZGV4ID0gMCB8IDFcclxuICAgKi9cbiAgeEF4aXNJbmRleDogMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHkgYXhpcyBpbmRleFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgeUF4aXNJbmRleCA9IDBcclxuICAgKiBAZXhhbXBsZSB5QXhpc0luZGV4ID0gMCB8IDFcclxuICAgKi9cbiAgeUF4aXNJbmRleDogMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGNoYXJ0IGRhdGFcclxuICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICogQGRlZmF1bHQgZGF0YSA9IFtdXHJcbiAgICogQGV4YW1wbGUgZGF0YSA9IFsxMDAsIDIwMCwgMzAwXVxyXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFja2dyb3VuZCBiYXIgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGJhY2tncm91bmRCYXI6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYmFja2dyb3VuZCBiYXJcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEJhY2tncm91bmQgYmFyIHdpZHRoXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHdpZHRoID0gJ2F1dG8nXHJcbiAgICAgKiBAZXhhbXBsZSB3aWR0aCA9ICdhdXRvJyB8ICczMCUnIHwgMzBcclxuICAgICAqL1xuICAgIHdpZHRoOiAnYXV0bycsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBCYWNrZ3JvdW5kIGJhciBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICdyZ2JhKDIwMCwgMjAwLCAyMDAsIC40KSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgbGFiZWw6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYmFyIGxhYmVsXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxyXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgcG9zaXRpb25cclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICd0b3AnXHJcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICd0b3AnIHwgJ2NlbnRlcicgfCAnYm90dG9tJ1xyXG4gICAgICovXG4gICAgcG9zaXRpb246ICd0b3AnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFyIGxhYmVsIG9mZnNldFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIC0xMF1cclxuICAgICAqL1xuICAgIG9mZnNldDogWzAsIC0xMF0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgZm9ybWF0dGVyXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxyXG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX3ku7YnXHJcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcclxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMFxuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGdyYWRpZW50IGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBncmFkaWVudDoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IGNvbG9yIChIZXh8cmdifHJnYmEpXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXHJcbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMb2NhbCBncmFkaWVudFxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBsb2NhbCA9IHRydWVcclxuICAgICAqL1xuICAgIGxvY2FsOiB0cnVlXG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEJhciBzdHlsZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICovXG4gIGJhclN0eWxlOiB7fSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGNoYXJ0IHJlbmRlciBsZXZlbFxyXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAwXHJcbiAgICovXG4gIHJMZXZlbDogMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGFuaW1hdGlvbiBjdXJ2ZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xyXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEJhciBhbmltYXRpb24gZnJhbWVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcclxuICAgKi9cbiAgYW5pbWF0aW9uRnJhbWU6IDUwXG59O1xuZXhwb3J0cy5iYXJDb25maWcgPSBiYXJDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNvbG9yQ29uZmlnID0gdm9pZCAwO1xudmFyIGNvbG9yQ29uZmlnID0gWycjMzdhMmRhJywgJyMzMmM1ZTknLCAnIzY3ZTBlMycsICcjOWZlNmI4JywgJyNmZmRiNWMnLCAnI2ZmOWY3ZicsICcjZmI3MjkzJywgJyNlMDYyYWUnLCAnI2U2OTBkMScsICcjZTdiY2YzJywgJyM5ZDk2ZjUnLCAnIzgzNzhlYScsICcjOTZiZmZmJ107XG5leHBvcnRzLmNvbG9yQ29uZmlnID0gY29sb3JDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdhdWdlQ29uZmlnID0gdm9pZCAwO1xudmFyIGdhdWdlQ29uZmlnID0ge1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgZ2F1Z2VcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXHJcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRpdXMgb2YgZ2F1Z2VcclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCByYWRpdXMgPSAnNjAlJ1xyXG4gICAqIEBleGFtcGxlIHJhZGl1cyA9ICc2MCUnIHwgMTAwXHJcbiAgICovXG4gIHJhZGl1czogJzYwJScsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIENlbnRlciBwb2ludCBvZiBnYXVnZVxyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZGVmYXVsdCBjZW50ZXIgPSBbJzUwJScsJzUwJSddXHJcbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cclxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2Ugc3RhcnQgYW5nbGVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHN0YXJ0QW5nbGUgPSAtKE1hdGguUEkgLyA0KSAqIDVcclxuICAgKiBAZXhhbXBsZSBzdGFydEFuZ2xlID0gLU1hdGguUElcclxuICAgKi9cbiAgc3RhcnRBbmdsZTogLShNYXRoLlBJIC8gNCkgKiA1LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBlbmQgYW5nbGVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGVuZEFuZ2xlID0gTWF0aC5QSSAvIDRcclxuICAgKiBAZXhhbXBsZSBlbmRBbmdsZSA9IDBcclxuICAgKi9cbiAgZW5kQW5nbGU6IE1hdGguUEkgLyA0LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBtaW4gdmFsdWVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IG1pbiA9IDBcclxuICAgKi9cbiAgbWluOiAwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBtYXggdmFsdWVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IG1heCA9IDEwMFxyXG4gICAqL1xuICBtYXg6IDEwMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2Ugc3BsaXQgbnVtYmVyXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBzcGxpdE51bSA9IDVcclxuICAgKi9cbiAgc3BsaXROdW06IDUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGFyYyBsaW5lIHdpZHRoXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBhcmNMaW5lV2lkdGggPSAxNVxyXG4gICAqL1xuICBhcmNMaW5lV2lkdGg6IDE1LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBjaGFydCBkYXRhXHJcbiAgICogQHR5cGUge0FycmF5fVxyXG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxyXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBpdGVtIGFyYyBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IGRhdGFJdGVtU3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgKi9cbiAgZGF0YUl0ZW1TdHlsZToge30sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgYXhpc1RpY2s6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyB0aWNrXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGxlbmd0aFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHRpY2tMZW5ndGggPSA2XHJcbiAgICAgKi9cbiAgICB0aWNrTGVuZ3RoOiA2LFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzk5OScsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxhYmVsXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkYXRhIChDYW4gYmUgY2FsY3VsYXRlZCBhdXRvbWF0aWNhbGx5KVxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZGF0YSA9IFtOdW1iZXIuLi5dXHJcbiAgICAgKi9cbiAgICBkYXRhOiBbXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZm9ybWF0dGVyXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxyXG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX0lJ1xyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGxhYmVsSXRlbSkgPT4gKGxhYmVsSXRlbS52YWx1ZSlcclxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIGF4aXMgdGlja1xyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cclxuICAgICAqIEBkZWZhdWx0IGxhYmVsR2FwID0gNVxyXG4gICAgICovXG4gICAgbGFiZWxHYXA6IDUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge31cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgcG9pbnRlciBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgcG9pbnRlcjoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBwb2ludGVyXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gUG9pbnRlciB2YWx1ZSBpbmRleCBvZiBkYXRhXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgdmFsdWVJbmRleCA9IDAgKHBvaW50ZXIudmFsdWUgPSBkYXRhWzBdLnZhbHVlKVxyXG4gICAgICovXG4gICAgdmFsdWVJbmRleDogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFBvaW50ZXIgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzY2FsZTogWzEsIDFdLFxuICAgICAgZmlsbDogJyNmYjcyOTMnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBEYXRhIGl0ZW0gYXJjIGRldGFpbCBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgZGV0YWlsczoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBkZXRhaWxzXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxyXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIGZvcm1hdHRlclxyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cclxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV9JSdcclxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7bmFtZX0lJ1xyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0udmFsdWUpXHJcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIHBvc2l0aW9uIG9mZnNldFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIDBdXHJcbiAgICAgKiBAZXhhbXBsZSBvZmZzZXQgPSBbMTAsIDEwXVxyXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgMF0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBWYWx1ZSBmcmFjdGlvbmFsIHByZWNpc2lvblxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHZhbHVlVG9GaXhlZCA9IDBcclxuICAgICAqL1xuICAgIHZhbHVlVG9GaXhlZDogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgcG9zaXRpb25cclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICdjZW50ZXInXHJcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICdzdGFydCcgfCAnY2VudGVyJyB8ICdlbmQnXHJcbiAgICAgKi9cbiAgICBwb3NpdGlvbjogJ2NlbnRlcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxuICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGJhY2tncm91bmQgYXJjIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBiYWNrZ3JvdW5kQXJjOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGJhY2tncm91bmQgYXJjXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFja2dyb3VuZCBhcmMgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjZTBlMGUwJ1xuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgY2hhcnQgcmVuZGVyIGxldmVsXHJcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXHJcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGFuaW1hdGlvbiBjdXJ2ZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xyXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxyXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmdhdWdlQ29uZmlnID0gZ2F1Z2VDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdyaWRDb25maWcgPSB2b2lkIDA7XG52YXIgZ3JpZENvbmZpZyA9IHtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgbGVmdCBtYXJnaW5cclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCBsZWZ0ID0gJzEwJSdcclxuICAgKiBAZXhhbXBsZSBsZWZ0ID0gJzEwJScgfCAxMFxyXG4gICAqL1xuICBsZWZ0OiAnMTAlJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR3JpZCByaWdodCBtYXJnaW5cclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCByaWdodCA9ICcxMCUnXHJcbiAgICogQGV4YW1wbGUgcmlnaHQgPSAnMTAlJyB8IDEwXHJcbiAgICovXG4gIHJpZ2h0OiAnMTAlJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR3JpZCB0b3AgbWFyZ2luXHJcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgdG9wID0gNjBcclxuICAgKiBAZXhhbXBsZSB0b3AgPSAnMTAlJyB8IDYwXHJcbiAgICovXG4gIHRvcDogNjAsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYm90dG9tIG1hcmdpblxyXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGJvdHRvbSA9IDYwXHJcbiAgICogQGV4YW1wbGUgYm90dG9tID0gJzEwJScgfCA2MFxyXG4gICAqL1xuICBib3R0b206IDYwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgKi9cbiAgc3R5bGU6IHtcbiAgICBmaWxsOiAncmdiYSgwLCAwLCAwLCAwKSdcbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gR3JpZCByZW5kZXIgbGV2ZWxcclxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgckxldmVsID0gLTMwXHJcbiAgICovXG4gIHJMZXZlbDogLTMwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGFuaW1hdGlvbiBjdXJ2ZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xyXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYW5pbWF0aW9uIGZyYW1lXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXHJcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiAzMFxufTtcbmV4cG9ydHMuZ3JpZENvbmZpZyA9IGdyaWRDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNoYW5nZURlZmF1bHRDb25maWcgPSBjaGFuZ2VEZWZhdWx0Q29uZmlnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiY29sb3JDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2NvbG9yLmNvbG9yQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdyaWRDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dyaWQuZ3JpZENvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ4QXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy54QXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ5QXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy55QXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0aXRsZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfdGl0bGUudGl0bGVDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGluZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGluZS5saW5lQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImJhckNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYmFyLmJhckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJwaWVDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3BpZS5waWVDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicmFkYXJBeGlzQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhckF4aXMucmFkYXJBeGlzQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhci5yYWRhckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnYXVnZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2F1Z2UuZ2F1Z2VDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGVnZW5kQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9sZWdlbmQubGVnZW5kQ29uZmlnO1xuICB9XG59KTtcbmV4cG9ydHMua2V5cyA9IHZvaWQgMDtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuXG52YXIgX2dyaWQgPSByZXF1aXJlKFwiLi9ncmlkXCIpO1xuXG52YXIgX2F4aXMgPSByZXF1aXJlKFwiLi9heGlzXCIpO1xuXG52YXIgX3RpdGxlID0gcmVxdWlyZShcIi4vdGl0bGVcIik7XG5cbnZhciBfbGluZSA9IHJlcXVpcmUoXCIuL2xpbmVcIik7XG5cbnZhciBfYmFyID0gcmVxdWlyZShcIi4vYmFyXCIpO1xuXG52YXIgX3BpZSA9IHJlcXVpcmUoXCIuL3BpZVwiKTtcblxudmFyIF9yYWRhckF4aXMgPSByZXF1aXJlKFwiLi9yYWRhckF4aXNcIik7XG5cbnZhciBfcmFkYXIgPSByZXF1aXJlKFwiLi9yYWRhclwiKTtcblxudmFyIF9nYXVnZSA9IHJlcXVpcmUoXCIuL2dhdWdlXCIpO1xuXG52YXIgX2xlZ2VuZCA9IHJlcXVpcmUoXCIuL2xlZ2VuZFwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbnZhciBhbGxDb25maWcgPSB7XG4gIGNvbG9yQ29uZmlnOiBfY29sb3IuY29sb3JDb25maWcsXG4gIGdyaWRDb25maWc6IF9ncmlkLmdyaWRDb25maWcsXG4gIHhBeGlzQ29uZmlnOiBfYXhpcy54QXhpc0NvbmZpZyxcbiAgeUF4aXNDb25maWc6IF9heGlzLnlBeGlzQ29uZmlnLFxuICB0aXRsZUNvbmZpZzogX3RpdGxlLnRpdGxlQ29uZmlnLFxuICBsaW5lQ29uZmlnOiBfbGluZS5saW5lQ29uZmlnLFxuICBiYXJDb25maWc6IF9iYXIuYmFyQ29uZmlnLFxuICBwaWVDb25maWc6IF9waWUucGllQ29uZmlnLFxuICByYWRhckF4aXNDb25maWc6IF9yYWRhckF4aXMucmFkYXJBeGlzQ29uZmlnLFxuICByYWRhckNvbmZpZzogX3JhZGFyLnJhZGFyQ29uZmlnLFxuICBnYXVnZUNvbmZpZzogX2dhdWdlLmdhdWdlQ29uZmlnLFxuICBsZWdlbmRDb25maWc6IF9sZWdlbmQubGVnZW5kQ29uZmlnXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBDaGFuZ2UgZGVmYXVsdCBjb25maWd1cmF0aW9uXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgICAgICAgICBDb25maWd1cmF0aW9uIGtleVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjb25maWcgWW91ciBjb25maWdcclxuICAgKiBAcmV0dXJuIHtVbmRlZmluZWR9IE5vIHJldHVyblxyXG4gICAqL1xuXG59O1xuXG5mdW5jdGlvbiBjaGFuZ2VEZWZhdWx0Q29uZmlnKGtleSwgY29uZmlnKSB7XG4gIGlmICghYWxsQ29uZmlnW1wiXCIuY29uY2F0KGtleSwgXCJDb25maWdcIildKSB7XG4gICAgY29uc29sZS53YXJuKCdDaGFuZ2UgZGVmYXVsdCBjb25maWcgRXJyb3IgLSBJbnZhbGlkIGtleSEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAoMCwgX3V0aWwuZGVlcE1lcmdlKShhbGxDb25maWdbXCJcIi5jb25jYXQoa2V5LCBcIkNvbmZpZ1wiKV0sIGNvbmZpZyk7XG59XG5cbnZhciBrZXlzID0gWydjb2xvcicsICd0aXRsZScsICdsZWdlbmQnLCAneEF4aXMnLCAneUF4aXMnLCAnZ3JpZCcsICdyYWRhckF4aXMnLCAnbGluZScsICdiYXInLCAncGllJywgJ3JhZGFyJywgJ2dhdWdlJ107XG5leHBvcnRzLmtleXMgPSBrZXlzOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5sZWdlbmRDb25maWcgPSB2b2lkIDA7XG52YXIgbGVnZW5kQ29uZmlnID0ge1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGxlZ2VuZFxyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBvcmllbnRcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IG9yaWVudCA9ICdob3Jpem9udGFsJ1xyXG4gICAqIEBleGFtcGxlIG9yaWVudCA9ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCdcclxuICAgKi9cbiAgb3JpZW50OiAnaG9yaXpvbnRhbCcsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBsZWZ0XHJcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgbGVmdCA9ICdhdXRvJ1xyXG4gICAqIEBleGFtcGxlIGxlZnQgPSAnYXV0bycgfCAnMTAlJyB8IDEwXHJcbiAgICovXG4gIGxlZnQ6ICdhdXRvJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHJpZ2h0XHJcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgcmlnaHQgPSAnYXV0bydcclxuICAgKiBAZXhhbXBsZSByaWdodCA9ICdhdXRvJyB8ICcxMCUnIHwgMTBcclxuICAgKi9cbiAgcmlnaHQ6ICdhdXRvJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHRvcFxyXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHRvcCA9ICdhdXRvJ1xyXG4gICAqIEBleGFtcGxlIHRvcCA9ICdhdXRvJyB8ICcxMCUnIHwgMTBcclxuICAgKi9cbiAgdG9wOiAnYXV0bycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBib3R0b21cclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCBib3R0b20gPSAnYXV0bydcclxuICAgKiBAZXhhbXBsZSBib3R0b20gPSAnYXV0bycgfCAnMTAlJyB8IDEwXHJcbiAgICovXG4gIGJvdHRvbTogJ2F1dG8nLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgaXRlbSBnYXBcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGl0ZW1HYXAgPSAxMFxyXG4gICAqL1xuICBpdGVtR2FwOiAxMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gSWNvbiB3aWR0aFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgaWNvbldpZHRoID0gMjVcclxuICAgKi9cbiAgaWNvbldpZHRoOiAyNSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gSWNvbiBoZWlnaHRcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGljb25IZWlnaHQgPSAxMFxyXG4gICAqL1xuICBpY29uSGVpZ2h0OiAxMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciBsZWdlbmQgaXMgb3B0aW9uYWxcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBzZWxlY3RBYmxlID0gdHJ1ZVxyXG4gICAqL1xuICBzZWxlY3RBYmxlOiB0cnVlLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgZGF0YVxyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cclxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCB0ZXh0IGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgKi9cbiAgdGV4dFN0eWxlOiB7XG4gICAgZm9udEZhbWlseTogJ0FyaWFsJyxcbiAgICBmb250U2l6ZTogMTMsXG4gICAgZmlsbDogJyMwMDAnXG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBpY29uIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgKi9cbiAgaWNvblN0eWxlOiB7fSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHRleHQgdW5zZWxlY3RlZCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICovXG4gIHRleHRVbnNlbGVjdGVkU3R5bGU6IHtcbiAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgIGZvbnRTaXplOiAxMyxcbiAgICBmaWxsOiAnIzk5OSdcbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGljb24gdW5zZWxlY3RlZCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICovXG4gIGljb25VbnNlbGVjdGVkU3R5bGU6IHtcbiAgICBmaWxsOiAnIzk5OSdcbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHJlbmRlciBsZXZlbFxyXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAyMFxyXG4gICAqL1xuICByTGV2ZWw6IDIwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgYW5pbWF0aW9uIGN1cnZlXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXHJcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxyXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmxlZ2VuZENvbmZpZyA9IGxlZ2VuZENvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMubGluZUNvbmZpZyA9IHZvaWQgMDtcbnZhciBsaW5lQ29uZmlnID0ge1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgbGluZSBjaGFydFxyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBuYW1lXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcclxuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIERhdGEgc3RhY2tpbmdcclxuICAgKiBUaGUgZGF0YSB2YWx1ZSBvZiB0aGUgc2VyaWVzIGVsZW1lbnQgb2YgdGhlIHNhbWUgc3RhY2tcclxuICAgKiB3aWxsIGJlIHN1cGVyaW1wb3NlZCAodGhlIGxhdHRlciB2YWx1ZSB3aWxsIGJlIHN1cGVyaW1wb3NlZCBvbiB0aGUgcHJldmlvdXMgdmFsdWUpXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBzdGFjayA9ICcnXHJcbiAgICovXG4gIHN0YWNrOiAnJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gU21vb3RoIGxpbmVcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBzbW9vdGggPSBmYWxzZVxyXG4gICAqL1xuICBzbW9vdGg6IGZhbHNlLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHggYXhpcyBpbmRleFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgeEF4aXNJbmRleCA9IDBcclxuICAgKiBAZXhhbXBsZSB4QXhpc0luZGV4ID0gMCB8IDFcclxuICAgKi9cbiAgeEF4aXNJbmRleDogMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGluZSB5IGF4aXMgaW5kZXhcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHlBeGlzSW5kZXggPSAwXHJcbiAgICogQGV4YW1wbGUgeUF4aXNJbmRleCA9IDAgfCAxXHJcbiAgICovXG4gIHlBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExpbmUgY2hhcnQgZGF0YVxyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cclxuICAgKiBAZXhhbXBsZSBkYXRhID0gWzEwMCwgMjAwLCAzMDBdXHJcbiAgICovXG4gIGRhdGE6IFtdLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgKi9cbiAgbGluZVN0eWxlOiB7XG4gICAgbGluZVdpZHRoOiAxXG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExpbmUgcG9pbnQgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGxpbmVQb2ludDoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBsaW5lIHBvaW50XHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBwb2ludCByYWRpdXNcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCByYWRpdXMgPSAyXHJcbiAgICAgKi9cbiAgICByYWRpdXM6IDIsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFyZWEgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGxpbmVBcmVhOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGxpbmUgYXJlYVxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcclxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBhcmVhIGdyYWRpZW50IGNvbG9yIChIZXh8cmdifHJnYmEpXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudCA9IFtdXHJcbiAgICAgKi9cbiAgICBncmFkaWVudDogW10sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFyZWEgc3R5bGUgZGVmYXVsdCBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBvcGFjaXR5OiAwLjVcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExpbmUgbGFiZWwgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGxhYmVsOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGxpbmUgbGFiZWxcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgbGFiZWwgcG9zaXRpb25cclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICd0b3AnXHJcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICd0b3AnIHwgJ2NlbnRlcicgfCAnYm90dG9tJ1xyXG4gICAgICovXG4gICAgcG9zaXRpb246ICd0b3AnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBvZmZzZXRcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAtMTBdXHJcbiAgICAgKi9cbiAgICBvZmZzZXQ6IFswLCAtMTBdLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBmb3JtYXR0ZXJcclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XHJcbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfeS7tidcclxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxyXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMFxuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBjaGFydCByZW5kZXIgbGV2ZWxcclxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcclxuICAgKi9cbiAgckxldmVsOiAxMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBhbmltYXRpb24gY3VydmVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcclxuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxyXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmxpbmVDb25maWcgPSBsaW5lQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5waWVDb25maWcgPSB2b2lkIDA7XG52YXIgcGllQ29uZmlnID0ge1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgcGllIGNoYXJ0XHJcbiAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcclxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG5hbWVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IG5hbWUgPSAnJ1xyXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUmFkaXVzIG9mIHBpZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHJhZGl1cyA9ICc1MCUnXHJcbiAgICogQGV4YW1wbGUgcmFkaXVzID0gJzUwJScgfCAxMDBcclxuICAgKi9cbiAgcmFkaXVzOiAnNTAlJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQ2VudGVyIHBvaW50IG9mIHBpZVxyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZGVmYXVsdCBjZW50ZXIgPSBbJzUwJScsJzUwJSddXHJcbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cclxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUGllIGNoYXJ0IHN0YXJ0IGFuZ2xlXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBzdGFydEFuZ2xlID0gLU1hdGguUEkgLyAyXHJcbiAgICogQGV4YW1wbGUgc3RhcnRBbmdsZSA9IC1NYXRoLlBJXHJcbiAgICovXG4gIHN0YXJ0QW5nbGU6IC1NYXRoLlBJIC8gMixcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgcm9zZSB0eXBlXHJcbiAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICogQGRlZmF1bHQgcm9zZVR5cGUgPSBmYWxzZVxyXG4gICAqL1xuICByb3NlVHlwZTogZmFsc2UsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF1dG9tYXRpYyBzb3J0aW5nIGluIHJvc2UgdHlwZVxyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IHJvc2VTb3J0ID0gdHJ1ZVxyXG4gICAqL1xuICByb3NlU29ydDogdHJ1ZSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUm9zZSByYWRpdXMgaW5jcmVhc2luZ1xyXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHJvc2VJbmNyZW1lbnQgPSAnYXV0bydcclxuICAgKiBAZXhhbXBsZSByb3NlSW5jcmVtZW50ID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxyXG4gICAqL1xuICByb3NlSW5jcmVtZW50OiAnYXV0bycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBjaGFydCBkYXRhXHJcbiAgICogQHR5cGUge0FycmF5fVxyXG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxyXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUGllIGluc2lkZSBsYWJlbCBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgaW5zaWRlTGFiZWw6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgaW5zaWRlIGxhYmVsXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxyXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XHJcbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSAne3BlcmNlbnR9JSdcclxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICcke25hbWV9LXt2YWx1ZX0te3BlcmNlbnR9JSdcclxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLm5hbWUpXHJcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6ICd7cGVyY2VudH0lJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBPdXRzaWRlIGxhYmVsIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBvdXRzaWRlTGFiZWw6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgb3V0c2lkZSBsYWJlbFxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcclxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XHJcbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSAne25hbWV9J1xyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJyR7bmFtZX0te3ZhbHVlfS17cGVyY2VudH0lJ1xyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0ubmFtZSlcclxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogJ3tuYW1lfScsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMVxuICAgIH0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHYXAgYmV0ZWVuIGxhYmVsIGxpbmUgYmVuZGVkIHBsYWNlIGFuZCBwaWVcclxuICAgICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgbGFiZWxMaW5lQmVuZEdhcCA9ICcyMCUnXHJcbiAgICAgKiBAZXhhbXBsZSBsYWJlbExpbmVCZW5kR2FwID0gJzIwJScgfCAyMFxyXG4gICAgICovXG4gICAgbGFiZWxMaW5lQmVuZEdhcDogJzIwJScsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBsaW5lIGVuZCBsZW5ndGhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBsYWJlbExpbmVFbmRMZW5ndGggPSA1MFxyXG4gICAgICovXG4gICAgbGFiZWxMaW5lRW5kTGVuZ3RoOiA1MCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIGxhYmVsTGluZVN0eWxlOiB7XG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICovXG4gIHBpZVN0eWxlOiB7fSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUGVyY2VudGFnZSBmcmFjdGlvbmFsIHByZWNpc2lvblxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgcGVyY2VudFRvRml4ZWQgPSAwXHJcbiAgICovXG4gIHBlcmNlbnRUb0ZpeGVkOiAwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgY2hhcnQgcmVuZGVyIGxldmVsXHJcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXHJcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEFuaW1hdGlvbiBkZWxheSBnYXBcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkRlbGF5R2FwID0gNjBcclxuICAgKi9cbiAgYW5pbWF0aW9uRGVsYXlHYXA6IDYwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgYW5pbWF0aW9uIGN1cnZlXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXHJcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUGllIHN0YXJ0IGFuaW1hdGlvbiBjdXJ2ZVxyXG4gICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICogQGRlZmF1bHQgc3RhcnRBbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0QmFjaydcclxuICAgKi9cbiAgc3RhcnRBbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRCYWNrJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUGllIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxyXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLnBpZUNvbmZpZyA9IHBpZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXJDb25maWcgPSB2b2lkIDA7XG52YXIgcmFkYXJDb25maWcgPSB7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyByYWRhclxyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBuYW1lXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcclxuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGNoYXJ0IGRhdGFcclxuICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICogQGRlZmF1bHQgZGF0YSA9IFtdXHJcbiAgICogQGV4YW1wbGUgZGF0YSA9IFsxMDAsIDIwMCwgMzAwXVxyXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxyXG4gICAqL1xuICByYWRhclN0eWxlOiB7XG4gICAgbGluZVdpZHRoOiAxXG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIHBvaW50IGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqL1xuICBwb2ludDoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSByYWRhciBwb2ludFxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFBvaW50IHJhZGl1c1xyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHJhZGl1cyA9IDJcclxuICAgICAqL1xuICAgIHJhZGl1czogMixcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJhZGFyIHBvaW50IGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyNmZmYnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBsYWJlbCBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgbGFiZWw6IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgcmFkYXIgbGFiZWxcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcclxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBwb3NpdGlvbiBvZmZzZXRcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAwXVxyXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgMF0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBnYXAgYmV0d2VlbiBsYWJlbCBhbmQgcmFkYXJcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBsYWJlbEdhcCA9IDVcclxuICAgICAqL1xuICAgIGxhYmVsR2FwOiA1LFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZm9ybWF0dGVyXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxyXG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ1Njb3JlLXt2YWx1ZX0nXHJcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAobGFiZWwpID0+IChsYWJlbClcclxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBjaGFydCByZW5kZXIgbGV2ZWxcclxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcclxuICAgKi9cbiAgckxldmVsOiAxMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgYW5pbWF0aW9uIGN1cnZlXHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXHJcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgYW5pbWF0aW9uIGZyYW1lXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXHJcbiAgICovXG4gIGFuaW1hdGlvbkZyYW5lOiA1MFxufTtcbmV4cG9ydHMucmFkYXJDb25maWcgPSByYWRhckNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXJBeGlzQ29uZmlnID0gdm9pZCAwO1xudmFyIHJhZGFyQXhpc0NvbmZpZyA9IHtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIHJhZGFyIGF4aXNcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBDZW50ZXIgcG9pbnQgb2YgcmFkYXIgYXhpc1xyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZGVmYXVsdCBjZW50ZXIgPSBbJzUwJScsJzUwJSddXHJcbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cclxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUmFkaXVzIG9mIHJhZGFyIGF4aXNcclxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgKiBAZGVmYXVsdCByYWRpdXMgPSAnNjUlJ1xyXG4gICAqIEBleGFtcGxlIHJhZGl1cyA9ICc2NSUnIHwgMTAwXHJcbiAgICovXG4gIHJhZGl1czogJzY1JScsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgc3RhcnQgYW5nbGVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHN0YXJ0QW5nbGUgPSAtTWF0aC5QSSAvIDJcclxuICAgKiBAZXhhbXBsZSBzdGFydEFuZ2xlID0gLU1hdGguUElcclxuICAgKi9cbiAgc3RhcnRBbmdsZTogLU1hdGguUEkgLyAyLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBheGlzIHNwbGl0IG51bWJlclxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgc3BsaXROdW0gPSA1XHJcbiAgICovXG4gIHNwbGl0TnVtOiA1LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBwb2x5Z29uIHJhZGFyIGF4aXNcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBwb2x5Z29uID0gZmFsc2VcclxuICAgKi9cbiAgcG9seWdvbjogZmFsc2UsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxhYmVsXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIHJhZGFyIGF4aXNcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBsYWJlbEdhcCA9IDE1XHJcbiAgICAgKi9cbiAgICBsYWJlbEdhcDogMTUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBjb2xvciAoSGV4fHJnYnxyZ2JhKSwgd2lsbCBjb3ZlciBzdHlsZS5maWxsXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXHJcbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyMzMzMnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIGF4aXNMaW5lOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGluZVxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXHJcbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHR5cGUge09iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzk5OScsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFNwbGl0IGxpbmUgY29uZmlndXJhdGlvblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICovXG4gIHNwbGl0TGluZToge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBzcGxpdCBsaW5lXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXHJcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBjb2xvciAoSGV4fHJnYnxyZ2JhKSwgd2lsbCBjb3ZlciBzdHlsZS5zdHJva2VcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cclxuICAgICAqL1xuICAgIGNvbG9yOiBbXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFNwbGl0IGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjZDRkNGQ0JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gU3BsaXQgYXJlYSBjb25maWd1cmF0aW9uXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKi9cbiAgc3BsaXRBcmVhOiB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHNwbGl0IGFyZWFcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEFyZWEgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXHJcbiAgICAgKi9cbiAgICBjb2xvcjogWycjZjVmNWY1JywgJyNlNmU2ZTYnXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFNwbGl0IGFyZWEgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cclxuICAgICAqL1xuICAgIHN0eWxlOiB7fVxuICB9LFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgY2hhcnQgcmVuZGVyIGxldmVsXHJcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IC0xMFxyXG4gICAqL1xuICByTGV2ZWw6IC0xMCxcblxuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgYXhpcyBhbmltYXRpb24gY3VydmVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcclxuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBheGlzIGFuaW1hdGlvbiBmcmFtZVxyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxyXG4gICAqL1xuICBhbmltYXRpb25GcmFuZTogNTBcbn07XG5leHBvcnRzLnJhZGFyQXhpc0NvbmZpZyA9IHJhZGFyQXhpc0NvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGl0bGVDb25maWcgPSB2b2lkIDA7XG52YXIgdGl0bGVDb25maWcgPSB7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGl0bGVcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxyXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSB0ZXh0XHJcbiAgICogQHR5cGUge1N0cmluZ31cclxuICAgKiBAZGVmYXVsdCB0ZXh0ID0gJydcclxuICAgKi9cbiAgdGV4dDogJycsXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFRpdGxlIG9mZnNldFxyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZGVmYXVsdCBvZmZzZXQgPSBbMCwgLTIwXVxyXG4gICAqL1xuICBvZmZzZXQ6IFswLCAtMjBdLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XHJcbiAgICovXG4gIHN0eWxlOiB7XG4gICAgZmlsbDogJyMzMzMnLFxuICAgIGZvbnRTaXplOiAxNyxcbiAgICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nXG4gIH0sXG5cbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFRpdGxlIHJlbmRlciBsZXZlbFxyXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXHJcbiAgICogQHR5cGUge051bWJlcn1cclxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAyMFxyXG4gICAqL1xuICByTGV2ZWw6IDIwLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBhbmltYXRpb24gY3VydmVcclxuICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcclxuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBhbmltYXRpb24gZnJhbWVcclxuICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcclxuICAgKi9cbiAgYW5pbWF0aW9uRnJhbWU6IDUwXG59O1xuZXhwb3J0cy50aXRsZUNvbmZpZyA9IHRpdGxlQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYXhpcyA9IGF4aXM7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxudmFyIGF4aXNDb25maWcgPSB7XG4gIHhBeGlzQ29uZmlnOiBfY29uZmlnLnhBeGlzQ29uZmlnLFxuICB5QXhpc0NvbmZpZzogX2NvbmZpZy55QXhpc0NvbmZpZ1xufTtcbnZhciBtaW4gPSBNYXRoLm1pbixcbiAgICBtYXggPSBNYXRoLm1heCxcbiAgICBhYnMgPSBNYXRoLmFicyxcbiAgICBwb3cgPSBNYXRoLnBvdztcblxuZnVuY3Rpb24gYXhpcyhjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHhBeGlzID0gb3B0aW9uLnhBeGlzLFxuICAgICAgeUF4aXMgPSBvcHRpb24ueUF4aXMsXG4gICAgICBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICB2YXIgYWxsQXhpcyA9IFtdO1xuXG4gIGlmICh4QXhpcyAmJiB5QXhpcyAmJiBzZXJpZXMpIHtcbiAgICBhbGxBeGlzID0gZ2V0QWxsQXhpcyh4QXhpcywgeUF4aXMpO1xuICAgIGFsbEF4aXMgPSBtZXJnZURlZmF1bHRBeGlzQ29uZmlnKGFsbEF4aXMpO1xuICAgIGFsbEF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIHNob3cgPSBfcmVmLnNob3c7XG4gICAgICByZXR1cm4gc2hvdztcbiAgICB9KTtcbiAgICBhbGxBeGlzID0gbWVyZ2VEZWZhdWx0Qm91bmRhcnlHYXAoYWxsQXhpcyk7XG4gICAgYWxsQXhpcyA9IGNhbGNBeGlzTGFiZWxEYXRhKGFsbEF4aXMsIHNlcmllcyk7XG4gICAgYWxsQXhpcyA9IHNldEF4aXNQb3NpdGlvbihhbGxBeGlzKTtcbiAgICBhbGxBeGlzID0gY2FsY0F4aXNMaW5lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpO1xuICAgIGFsbEF4aXMgPSBjYWxjQXhpc1RpY2tQb3NpdGlvbihhbGxBeGlzLCBjaGFydCk7XG4gICAgYWxsQXhpcyA9IGNhbGNBeGlzTmFtZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KTtcbiAgICBhbGxBeGlzID0gY2FsY1NwbGl0TGluZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KTtcbiAgfVxuXG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnYXhpc0xpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMaW5lQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ2F4aXNUaWNrJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0VGlja0NvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYWxsQXhpcyxcbiAgICBrZXk6ICdheGlzTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMYWJlbENvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYWxsQXhpcyxcbiAgICBrZXk6ICdheGlzTmFtZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldE5hbWVDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnc3BsaXRMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0U3BsaXRMaW5lQ29uZmlnXG4gIH0pO1xuICBjaGFydC5heGlzRGF0YSA9IGFsbEF4aXM7XG59XG5cbmZ1bmN0aW9uIGdldEFsbEF4aXMoeEF4aXMsIHlBeGlzKSB7XG4gIHZhciBhbGxYQXhpcyA9IFtdLFxuICAgICAgYWxsWUF4aXMgPSBbXTtcblxuICBpZiAoeEF4aXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHZhciBfYWxsWEF4aXM7XG5cbiAgICAoX2FsbFhBeGlzID0gYWxsWEF4aXMpLnB1c2guYXBwbHkoX2FsbFhBeGlzLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHhBeGlzKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsWEF4aXMucHVzaCh4QXhpcyk7XG4gIH1cblxuICBpZiAoeUF4aXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHZhciBfYWxsWUF4aXM7XG5cbiAgICAoX2FsbFlBeGlzID0gYWxsWUF4aXMpLnB1c2guYXBwbHkoX2FsbFlBeGlzLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHlBeGlzKSk7XG4gIH0gZWxzZSB7XG4gICAgYWxsWUF4aXMucHVzaCh5QXhpcyk7XG4gIH1cblxuICBhbGxYQXhpcy5zcGxpY2UoMik7XG4gIGFsbFlBeGlzLnNwbGljZSgyKTtcbiAgYWxsWEF4aXMgPSBhbGxYQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMsIGkpIHtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpcywge1xuICAgICAgaW5kZXg6IGksXG4gICAgICBheGlzOiAneCdcbiAgICB9KTtcbiAgfSk7XG4gIGFsbFlBeGlzID0gYWxsWUF4aXMubWFwKGZ1bmN0aW9uIChheGlzLCBpKSB7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXMsIHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgYXhpczogJ3knXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsWEF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFsbFlBeGlzKSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlRGVmYXVsdEF4aXNDb25maWcoYWxsQXhpcykge1xuICB2YXIgeEF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYyLmF4aXM7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd4JztcbiAgfSk7XG4gIHZhciB5QXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciBheGlzID0gX3JlZjMuYXhpcztcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3knO1xuICB9KTtcbiAgeEF4aXMgPSB4QXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoKDAsIF91dGlsMi5kZWVwQ2xvbmUpKF9jb25maWcueEF4aXNDb25maWcpLCBheGlzKTtcbiAgfSk7XG4gIHlBeGlzID0geUF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKCgwLCBfdXRpbDIuZGVlcENsb25lKShfY29uZmlnLnlBeGlzQ29uZmlnKSwgYXhpcyk7XG4gIH0pO1xuICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeEF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHlBeGlzKSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlRGVmYXVsdEJvdW5kYXJ5R2FwKGFsbEF4aXMpIHtcbiAgdmFyIHZhbHVlQXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgIHZhciBkYXRhID0gX3JlZjQuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhciBsYWJlbEF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjUpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY1LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgIT09ICd2YWx1ZSc7XG4gIH0pO1xuICB2YWx1ZUF4aXMuZm9yRWFjaChmdW5jdGlvbiAoYXhpcykge1xuICAgIGlmICh0eXBlb2YgYXhpcy5ib3VuZGFyeUdhcCA9PT0gJ2Jvb2xlYW4nKSByZXR1cm47XG4gICAgYXhpcy5ib3VuZGFyeUdhcCA9IGZhbHNlO1xuICB9KTtcbiAgbGFiZWxBeGlzLmZvckVhY2goZnVuY3Rpb24gKGF4aXMpIHtcbiAgICBpZiAodHlwZW9mIGF4aXMuYm91bmRhcnlHYXAgPT09ICdib29sZWFuJykgcmV0dXJuO1xuICAgIGF4aXMuYm91bmRhcnlHYXAgPSB0cnVlO1xuICB9KTtcbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHZhbHVlQXhpcyksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGFiZWxBeGlzKSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNBeGlzTGFiZWxEYXRhKGFsbEF4aXMsIHNlcmllcykge1xuICB2YXIgdmFsdWVBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY2KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmNi5kYXRhO1xuICAgIHJldHVybiBkYXRhID09PSAndmFsdWUnO1xuICB9KTtcbiAgdmFyIGxhYmVsQXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNykge1xuICAgIHZhciBkYXRhID0gX3JlZjcuZGF0YTtcbiAgICByZXR1cm4gZGF0YSBpbnN0YW5jZW9mIEFycmF5O1xuICB9KTtcbiAgdmFsdWVBeGlzID0gY2FsY1ZhbHVlQXhpc0xhYmVsRGF0YSh2YWx1ZUF4aXMsIHNlcmllcyk7XG4gIGxhYmVsQXhpcyA9IGNhbGNMYWJlbEF4aXNMYWJlbERhdGEobGFiZWxBeGlzKTtcbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHZhbHVlQXhpcyksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGFiZWxBeGlzKSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNWYWx1ZUF4aXNMYWJlbERhdGEodmFsdWVBeGlzLCBzZXJpZXMpIHtcbiAgcmV0dXJuIHZhbHVlQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICB2YXIgbWluTWF4VmFsdWUgPSBnZXRWYWx1ZUF4aXNNYXhNaW5WYWx1ZShheGlzLCBzZXJpZXMpO1xuXG4gICAgdmFyIF9nZXRUcnVlTWluTWF4ID0gZ2V0VHJ1ZU1pbk1heChheGlzLCBtaW5NYXhWYWx1ZSksXG4gICAgICAgIF9nZXRUcnVlTWluTWF4MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZ2V0VHJ1ZU1pbk1heCwgMiksXG4gICAgICAgIG1pbiA9IF9nZXRUcnVlTWluTWF4MlswXSxcbiAgICAgICAgbWF4ID0gX2dldFRydWVNaW5NYXgyWzFdO1xuXG4gICAgdmFyIGludGVydmFsID0gZ2V0VmFsdWVJbnRlcnZhbChtaW4sIG1heCwgYXhpcyk7XG4gICAgdmFyIGZvcm1hdHRlciA9IGF4aXMuYXhpc0xhYmVsLmZvcm1hdHRlcjtcbiAgICB2YXIgbGFiZWwgPSBbXTtcblxuICAgIGlmIChtaW5NYXhWYWx1ZVswXSA9PT0gbWluTWF4VmFsdWVbMV0pIHtcbiAgICAgIGxhYmVsID0gbWluTWF4VmFsdWU7XG4gICAgfSBlbHNlIGlmIChtaW4gPCAwICYmIG1heCA+IDApIHtcbiAgICAgIGxhYmVsID0gZ2V0VmFsdWVBeGlzTGFiZWxGcm9tWmVybyhtaW4sIG1heCwgaW50ZXJ2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYWJlbCA9IGdldFZhbHVlQXhpc0xhYmVsRnJvbU1pbihtaW4sIG1heCwgaW50ZXJ2YWwpO1xuICAgIH1cblxuICAgIGxhYmVsID0gbGFiZWwubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdChsLnRvRml4ZWQoMikpO1xuICAgIH0pO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBtYXhWYWx1ZTogbGFiZWwuc2xpY2UoLTEpWzBdLFxuICAgICAgbWluVmFsdWU6IGxhYmVsWzBdLFxuICAgICAgbGFiZWw6IGdldEFmdGVyRm9ybWF0dGVyTGFiZWwobGFiZWwsIGZvcm1hdHRlcilcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlQXhpc01heE1pblZhbHVlKGF4aXMsIHNlcmllcykge1xuICBzZXJpZXMgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmOCkge1xuICAgIHZhciBzaG93ID0gX3JlZjguc2hvdyxcbiAgICAgICAgdHlwZSA9IF9yZWY4LnR5cGU7XG4gICAgaWYgKHNob3cgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHR5cGUgPT09ICdwaWUnKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xuICBpZiAoc2VyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFswLCAwXTtcbiAgdmFyIGluZGV4ID0gYXhpcy5pbmRleCxcbiAgICAgIGF4aXNUeXBlID0gYXhpcy5heGlzO1xuICBzZXJpZXMgPSBtZXJnZVN0YWNrRGF0YShzZXJpZXMpO1xuICB2YXIgYXhpc05hbWUgPSBheGlzVHlwZSArICdBeGlzJztcbiAgdmFyIHZhbHVlU2VyaWVzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBzW2F4aXNOYW1lXSA9PT0gaW5kZXg7XG4gIH0pO1xuICBpZiAoIXZhbHVlU2VyaWVzLmxlbmd0aCkgdmFsdWVTZXJpZXMgPSBzZXJpZXM7XG4gIHJldHVybiBnZXRTZXJpZXNNaW5NYXhWYWx1ZSh2YWx1ZVNlcmllcyk7XG59XG5cbmZ1bmN0aW9uIGdldFNlcmllc01pbk1heFZhbHVlKHNlcmllcykge1xuICBpZiAoIXNlcmllcykgcmV0dXJuO1xuICB2YXIgbWluVmFsdWUgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNlcmllcy5tYXAoZnVuY3Rpb24gKF9yZWY5KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmOS5kYXRhO1xuICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKCgwLCBfdXRpbC5maWx0ZXJOb25OdW1iZXIpKGRhdGEpKSk7XG4gIH0pKSk7XG4gIHZhciBtYXhWYWx1ZSA9IE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2VyaWVzLm1hcChmdW5jdGlvbiAoX3JlZjEwKSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmMTAuZGF0YTtcbiAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSgoMCwgX3V0aWwuZmlsdGVyTm9uTnVtYmVyKShkYXRhKSkpO1xuICB9KSkpO1xuICByZXR1cm4gW21pblZhbHVlLCBtYXhWYWx1ZV07XG59XG5cbmZ1bmN0aW9uIG1lcmdlU3RhY2tEYXRhKHNlcmllcykge1xuICB2YXIgc2VyaWVzQ2xvbmVkID0gKDAsIF91dGlsMi5kZWVwQ2xvbmUpKHNlcmllcywgdHJ1ZSk7XG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgdmFyIGRhdGEgPSAoMCwgX3V0aWwubWVyZ2VTYW1lU3RhY2tEYXRhKShpdGVtLCBzZXJpZXMpO1xuICAgIHNlcmllc0Nsb25lZFtpXS5kYXRhID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiBzZXJpZXNDbG9uZWQ7XG59XG5cbmZ1bmN0aW9uIGdldFRydWVNaW5NYXgoX3JlZjExLCBfcmVmMTIpIHtcbiAgdmFyIG1pbiA9IF9yZWYxMS5taW4sXG4gICAgICBtYXggPSBfcmVmMTEubWF4LFxuICAgICAgYXhpcyA9IF9yZWYxMS5heGlzO1xuXG4gIHZhciBfcmVmMTMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEyLCAyKSxcbiAgICAgIG1pblZhbHVlID0gX3JlZjEzWzBdLFxuICAgICAgbWF4VmFsdWUgPSBfcmVmMTNbMV07XG5cbiAgdmFyIG1pblR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShtaW4pLFxuICAgICAgbWF4VHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG1heCk7XG5cbiAgaWYgKCF0ZXN0TWluTWF4VHlwZShtaW4pKSB7XG4gICAgbWluID0gYXhpc0NvbmZpZ1theGlzICsgJ0F4aXNDb25maWcnXS5taW47XG4gICAgbWluVHlwZSA9ICdzdHJpbmcnO1xuICB9XG5cbiAgaWYgKCF0ZXN0TWluTWF4VHlwZShtYXgpKSB7XG4gICAgbWF4ID0gYXhpc0NvbmZpZ1theGlzICsgJ0F4aXNDb25maWcnXS5tYXg7XG4gICAgbWF4VHlwZSA9ICdzdHJpbmcnO1xuICB9XG5cbiAgaWYgKG1pblR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbWluID0gcGFyc2VJbnQobWluVmFsdWUgLSBhYnMobWluVmFsdWUgKiBwYXJzZUZsb2F0KG1pbikgLyAxMDApKTtcbiAgICB2YXIgbGV2ZXIgPSBnZXRWYWx1ZUxldmVyKG1pbik7XG4gICAgbWluID0gcGFyc2VGbG9hdCgobWluIC8gbGV2ZXIgLSAwLjEpLnRvRml4ZWQoMSkpICogbGV2ZXI7XG4gIH1cblxuICBpZiAobWF4VHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBtYXggPSBwYXJzZUludChtYXhWYWx1ZSArIGFicyhtYXhWYWx1ZSAqIHBhcnNlRmxvYXQobWF4KSAvIDEwMCkpO1xuXG4gICAgdmFyIF9sZXZlciA9IGdldFZhbHVlTGV2ZXIobWF4KTtcblxuICAgIG1heCA9IHBhcnNlRmxvYXQoKG1heCAvIF9sZXZlciArIDAuMSkudG9GaXhlZCgxKSkgKiBfbGV2ZXI7XG4gIH1cblxuICByZXR1cm4gW21pbiwgbWF4XTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVMZXZlcih2YWx1ZSkge1xuICB2YXIgdmFsdWVTdHJpbmcgPSBhYnModmFsdWUpLnRvU3RyaW5nKCk7XG4gIHZhciB2YWx1ZUxlbmd0aCA9IHZhbHVlU3RyaW5nLmxlbmd0aDtcbiAgdmFyIGZpcnN0WmVyb0luZGV4ID0gdmFsdWVTdHJpbmcucmVwbGFjZSgvMCokL2csICcnKS5pbmRleE9mKCcwJyk7XG4gIHZhciBwb3cxME51bSA9IHZhbHVlTGVuZ3RoIC0gMTtcbiAgaWYgKGZpcnN0WmVyb0luZGV4ICE9PSAtMSkgcG93MTBOdW0gLT0gZmlyc3RaZXJvSW5kZXg7XG4gIHJldHVybiBwb3coMTAsIHBvdzEwTnVtKTtcbn1cblxuZnVuY3Rpb24gdGVzdE1pbk1heFR5cGUodmFsKSB7XG4gIHZhciB2YWxUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkodmFsKTtcbiAgdmFyIGlzVmFsaWRTdHJpbmcgPSB2YWxUeXBlID09PSAnc3RyaW5nJyAmJiAvXlxcZCslJC8udGVzdCh2YWwpO1xuICB2YXIgaXNWYWxpZE51bWJlciA9IHZhbFR5cGUgPT09ICdudW1iZXInO1xuICByZXR1cm4gaXNWYWxpZFN0cmluZyB8fCBpc1ZhbGlkTnVtYmVyO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUF4aXNMYWJlbEZyb21aZXJvKG1pbiwgbWF4LCBpbnRlcnZhbCkge1xuICB2YXIgbmVnYXRpdmUgPSBbXSxcbiAgICAgIHBvc2l0aXZlID0gW107XG4gIHZhciBjdXJyZW50TmVnYXRpdmUgPSAwLFxuICAgICAgY3VycmVudFBvc2l0aXZlID0gMDtcblxuICBkbyB7XG4gICAgbmVnYXRpdmUucHVzaChjdXJyZW50TmVnYXRpdmUgLT0gaW50ZXJ2YWwpO1xuICB9IHdoaWxlIChjdXJyZW50TmVnYXRpdmUgPiBtaW4pO1xuXG4gIGRvIHtcbiAgICBwb3NpdGl2ZS5wdXNoKGN1cnJlbnRQb3NpdGl2ZSArPSBpbnRlcnZhbCk7XG4gIH0gd2hpbGUgKGN1cnJlbnRQb3NpdGl2ZSA8IG1heCk7XG5cbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5lZ2F0aXZlLnJldmVyc2UoKSksIFswXSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3NpdGl2ZSkpO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUF4aXNMYWJlbEZyb21NaW4obWluLCBtYXgsIGludGVydmFsKSB7XG4gIHZhciBsYWJlbCA9IFttaW5dLFxuICAgICAgY3VycmVudFZhbHVlID0gbWluO1xuXG4gIGRvIHtcbiAgICBsYWJlbC5wdXNoKGN1cnJlbnRWYWx1ZSArPSBpbnRlcnZhbCk7XG4gIH0gd2hpbGUgKGN1cnJlbnRWYWx1ZSA8IG1heCk7XG5cbiAgcmV0dXJuIGxhYmVsO1xufVxuXG5mdW5jdGlvbiBnZXRBZnRlckZvcm1hdHRlckxhYmVsKGxhYmVsLCBmb3JtYXR0ZXIpIHtcbiAgaWYgKCFmb3JtYXR0ZXIpIHJldHVybiBsYWJlbDtcbiAgaWYgKHR5cGVvZiBmb3JtYXR0ZXIgPT09ICdzdHJpbmcnKSBsYWJlbCA9IGxhYmVsLm1hcChmdW5jdGlvbiAobCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsIGwpO1xuICB9KTtcbiAgaWYgKHR5cGVvZiBmb3JtYXR0ZXIgPT09ICdmdW5jdGlvbicpIGxhYmVsID0gbGFiZWwubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyKHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGxhYmVsO1xufVxuXG5mdW5jdGlvbiBjYWxjTGFiZWxBeGlzTGFiZWxEYXRhKGxhYmVsQXhpcykge1xuICByZXR1cm4gbGFiZWxBeGlzLm1hcChmdW5jdGlvbiAoYXhpcykge1xuICAgIHZhciBkYXRhID0gYXhpcy5kYXRhLFxuICAgICAgICBmb3JtYXR0ZXIgPSBheGlzLmF4aXNMYWJlbC5mb3JtYXR0ZXI7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXMsIHtcbiAgICAgIGxhYmVsOiBnZXRBZnRlckZvcm1hdHRlckxhYmVsKGRhdGEsIGZvcm1hdHRlcilcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlSW50ZXJ2YWwobWluLCBtYXgsIGF4aXMpIHtcbiAgdmFyIGludGVydmFsID0gYXhpcy5pbnRlcnZhbCxcbiAgICAgIG1pbkludGVydmFsID0gYXhpcy5taW5JbnRlcnZhbCxcbiAgICAgIG1heEludGVydmFsID0gYXhpcy5tYXhJbnRlcnZhbCxcbiAgICAgIHNwbGl0TnVtYmVyID0gYXhpcy5zcGxpdE51bWJlcixcbiAgICAgIGF4aXNUeXBlID0gYXhpcy5heGlzO1xuICB2YXIgY29uZmlnID0gYXhpc0NvbmZpZ1theGlzVHlwZSArICdBeGlzQ29uZmlnJ107XG4gIGlmICh0eXBlb2YgaW50ZXJ2YWwgIT09ICdudW1iZXInKSBpbnRlcnZhbCA9IGNvbmZpZy5pbnRlcnZhbDtcbiAgaWYgKHR5cGVvZiBtaW5JbnRlcnZhbCAhPT0gJ251bWJlcicpIG1pbkludGVydmFsID0gY29uZmlnLm1pbkludGVydmFsO1xuICBpZiAodHlwZW9mIG1heEludGVydmFsICE9PSAnbnVtYmVyJykgbWF4SW50ZXJ2YWwgPSBjb25maWcubWF4SW50ZXJ2YWw7XG4gIGlmICh0eXBlb2Ygc3BsaXROdW1iZXIgIT09ICdudW1iZXInKSBzcGxpdE51bWJlciA9IGNvbmZpZy5zcGxpdE51bWJlcjtcbiAgaWYgKHR5cGVvZiBpbnRlcnZhbCA9PT0gJ251bWJlcicpIHJldHVybiBpbnRlcnZhbDtcbiAgdmFyIHZhbHVlSW50ZXJ2YWwgPSBwYXJzZUludCgobWF4IC0gbWluKSAvIChzcGxpdE51bWJlciAtIDEpKTtcbiAgaWYgKHZhbHVlSW50ZXJ2YWwudG9TdHJpbmcoKS5sZW5ndGggPiAxKSB2YWx1ZUludGVydmFsID0gcGFyc2VJbnQodmFsdWVJbnRlcnZhbC50b1N0cmluZygpLnJlcGxhY2UoL1xcZCQvLCAnMCcpKTtcbiAgaWYgKHZhbHVlSW50ZXJ2YWwgPT09IDApIHZhbHVlSW50ZXJ2YWwgPSAxO1xuICBpZiAodHlwZW9mIG1pbkludGVydmFsID09PSAnbnVtYmVyJyAmJiB2YWx1ZUludGVydmFsIDwgbWluSW50ZXJ2YWwpIHJldHVybiBtaW5JbnRlcnZhbDtcbiAgaWYgKHR5cGVvZiBtYXhJbnRlcnZhbCA9PT0gJ251bWJlcicgJiYgdmFsdWVJbnRlcnZhbCA+IG1heEludGVydmFsKSByZXR1cm4gbWF4SW50ZXJ2YWw7XG4gIHJldHVybiB2YWx1ZUludGVydmFsO1xufVxuXG5mdW5jdGlvbiBzZXRBeGlzUG9zaXRpb24oYWxsQXhpcykge1xuICB2YXIgeEF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjE0KSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmMTQuYXhpcztcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3gnO1xuICB9KTtcbiAgdmFyIHlBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYxNSkge1xuICAgIHZhciBheGlzID0gX3JlZjE1LmF4aXM7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd5JztcbiAgfSk7XG4gIGlmICh4QXhpc1swXSAmJiAheEF4aXNbMF0ucG9zaXRpb24pIHhBeGlzWzBdLnBvc2l0aW9uID0gX2NvbmZpZy54QXhpc0NvbmZpZy5wb3NpdGlvbjtcblxuICBpZiAoeEF4aXNbMV0gJiYgIXhBeGlzWzFdLnBvc2l0aW9uKSB7XG4gICAgeEF4aXNbMV0ucG9zaXRpb24gPSB4QXhpc1swXS5wb3NpdGlvbiA9PT0gJ2JvdHRvbScgPyAndG9wJyA6ICdib3R0b20nO1xuICB9XG5cbiAgaWYgKHlBeGlzWzBdICYmICF5QXhpc1swXS5wb3NpdGlvbikgeUF4aXNbMF0ucG9zaXRpb24gPSBfY29uZmlnLnlBeGlzQ29uZmlnLnBvc2l0aW9uO1xuXG4gIGlmICh5QXhpc1sxXSAmJiAheUF4aXNbMV0ucG9zaXRpb24pIHtcbiAgICB5QXhpc1sxXS5wb3NpdGlvbiA9IHlBeGlzWzBdLnBvc2l0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuICB9XG5cbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHhBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh5QXhpcykpO1xufVxuXG5mdW5jdGlvbiBjYWxjQXhpc0xpbmVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCkge1xuICB2YXIgX2NoYXJ0JGdyaWRBcmVhID0gY2hhcnQuZ3JpZEFyZWEsXG4gICAgICB4ID0gX2NoYXJ0JGdyaWRBcmVhLngsXG4gICAgICB5ID0gX2NoYXJ0JGdyaWRBcmVhLnksXG4gICAgICB3ID0gX2NoYXJ0JGdyaWRBcmVhLncsXG4gICAgICBoID0gX2NoYXJ0JGdyaWRBcmVhLmg7XG4gIGFsbEF4aXMgPSBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpcykge1xuICAgIHZhciBwb3NpdGlvbiA9IGF4aXMucG9zaXRpb247XG4gICAgdmFyIGxpbmVQb3NpdGlvbiA9IFtdO1xuXG4gICAgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgIGxpbmVQb3NpdGlvbiA9IFtbeCwgeV0sIFt4LCB5ICsgaF1dLnJldmVyc2UoKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICBsaW5lUG9zaXRpb24gPSBbW3ggKyB3LCB5XSwgW3ggKyB3LCB5ICsgaF1dLnJldmVyc2UoKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgbGluZVBvc2l0aW9uID0gW1t4LCB5XSwgW3ggKyB3LCB5XV07XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIGxpbmVQb3NpdGlvbiA9IFtbeCwgeSArIGhdLCBbeCArIHcsIHkgKyBoXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXMsIHtcbiAgICAgIGxpbmVQb3NpdGlvbjogbGluZVBvc2l0aW9uXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gYWxsQXhpcztcbn1cblxuZnVuY3Rpb24gY2FsY0F4aXNUaWNrUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpIHtcbiAgcmV0dXJuIGFsbEF4aXMubWFwKGZ1bmN0aW9uIChheGlzSXRlbSkge1xuICAgIHZhciBheGlzID0gYXhpc0l0ZW0uYXhpcyxcbiAgICAgICAgbGluZVBvc2l0aW9uID0gYXhpc0l0ZW0ubGluZVBvc2l0aW9uLFxuICAgICAgICBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uLFxuICAgICAgICBsYWJlbCA9IGF4aXNJdGVtLmxhYmVsLFxuICAgICAgICBib3VuZGFyeUdhcCA9IGF4aXNJdGVtLmJvdW5kYXJ5R2FwO1xuICAgIGlmICh0eXBlb2YgYm91bmRhcnlHYXAgIT09ICdib29sZWFuJykgYm91bmRhcnlHYXAgPSBheGlzQ29uZmlnW2F4aXMgKyAnQXhpc0NvbmZpZyddLmJvdW5kYXJ5R2FwO1xuICAgIHZhciBsYWJlbE51bSA9IGxhYmVsLmxlbmd0aDtcblxuICAgIHZhciBfbGluZVBvc2l0aW9uID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb3NpdGlvbiwgMiksXG4gICAgICAgIF9saW5lUG9zaXRpb24kID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9saW5lUG9zaXRpb25bMF0sIDIpLFxuICAgICAgICBzdGFydFggPSBfbGluZVBvc2l0aW9uJFswXSxcbiAgICAgICAgc3RhcnRZID0gX2xpbmVQb3NpdGlvbiRbMV0sXG4gICAgICAgIF9saW5lUG9zaXRpb24kMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfbGluZVBvc2l0aW9uWzFdLCAyKSxcbiAgICAgICAgZW5kWCA9IF9saW5lUG9zaXRpb24kMlswXSxcbiAgICAgICAgZW5kWSA9IF9saW5lUG9zaXRpb24kMlsxXTtcblxuICAgIHZhciBnYXBMZW5ndGggPSBheGlzID09PSAneCcgPyBlbmRYIC0gc3RhcnRYIDogZW5kWSAtIHN0YXJ0WTtcbiAgICB2YXIgZ2FwID0gZ2FwTGVuZ3RoIC8gKGJvdW5kYXJ5R2FwID8gbGFiZWxOdW0gOiBsYWJlbE51bSAtIDEpO1xuICAgIHZhciB0aWNrUG9zaXRpb24gPSBuZXcgQXJyYXkobGFiZWxOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICAgIGlmIChheGlzID09PSAneCcpIHtcbiAgICAgICAgcmV0dXJuIFtzdGFydFggKyBnYXAgKiAoYm91bmRhcnlHYXAgPyBpICsgMC41IDogaSksIHN0YXJ0WV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbc3RhcnRYLCBzdGFydFkgKyBnYXAgKiAoYm91bmRhcnlHYXAgPyBpICsgMC41IDogaSldO1xuICAgIH0pO1xuICAgIHZhciB0aWNrTGluZVBvc2l0aW9uID0gZ2V0VGlja0xpbmVQb3NpdGlvbihheGlzLCBib3VuZGFyeUdhcCwgcG9zaXRpb24sIHRpY2tQb3NpdGlvbiwgZ2FwKTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpc0l0ZW0sIHtcbiAgICAgIHRpY2tQb3NpdGlvbjogdGlja1Bvc2l0aW9uLFxuICAgICAgdGlja0xpbmVQb3NpdGlvbjogdGlja0xpbmVQb3NpdGlvbixcbiAgICAgIHRpY2tHYXA6IGdhcFxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlja0xpbmVQb3NpdGlvbihheGlzVHlwZSwgYm91bmRhcnlHYXAsIHBvc2l0aW9uLCB0aWNrUG9zaXRpb24sIGdhcCkge1xuICB2YXIgaW5kZXggPSBheGlzVHlwZSA9PT0gJ3gnID8gMSA6IDA7XG4gIHZhciBwbHVzID0gNTtcbiAgaWYgKGF4aXNUeXBlID09PSAneCcgJiYgcG9zaXRpb24gPT09ICd0b3AnKSBwbHVzID0gLTU7XG4gIGlmIChheGlzVHlwZSA9PT0gJ3knICYmIHBvc2l0aW9uID09PSAnbGVmdCcpIHBsdXMgPSAtNTtcbiAgdmFyIHRpY2tMaW5lUG9zaXRpb24gPSB0aWNrUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChsaW5lU3RhcnQpIHtcbiAgICB2YXIgbGluZUVuZCA9ICgwLCBfdXRpbDIuZGVlcENsb25lKShsaW5lU3RhcnQpO1xuICAgIGxpbmVFbmRbaW5kZXhdICs9IHBsdXM7XG4gICAgcmV0dXJuIFsoMCwgX3V0aWwyLmRlZXBDbG9uZSkobGluZVN0YXJ0KSwgbGluZUVuZF07XG4gIH0pO1xuICBpZiAoIWJvdW5kYXJ5R2FwKSByZXR1cm4gdGlja0xpbmVQb3NpdGlvbjtcbiAgaW5kZXggPSBheGlzVHlwZSA9PT0gJ3gnID8gMCA6IDE7XG4gIHBsdXMgPSBnYXAgLyAyO1xuICB0aWNrTGluZVBvc2l0aW9uLmZvckVhY2goZnVuY3Rpb24gKF9yZWYxNikge1xuICAgIHZhciBfcmVmMTcgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjE2LCAyKSxcbiAgICAgICAgbGluZVN0YXJ0ID0gX3JlZjE3WzBdLFxuICAgICAgICBsaW5lRW5kID0gX3JlZjE3WzFdO1xuXG4gICAgbGluZVN0YXJ0W2luZGV4XSArPSBwbHVzO1xuICAgIGxpbmVFbmRbaW5kZXhdICs9IHBsdXM7XG4gIH0pO1xuICByZXR1cm4gdGlja0xpbmVQb3NpdGlvbjtcbn1cblxuZnVuY3Rpb24gY2FsY0F4aXNOYW1lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpIHtcbiAgcmV0dXJuIGFsbEF4aXMubWFwKGZ1bmN0aW9uIChheGlzSXRlbSkge1xuICAgIHZhciBuYW1lR2FwID0gYXhpc0l0ZW0ubmFtZUdhcCxcbiAgICAgICAgbmFtZUxvY2F0aW9uID0gYXhpc0l0ZW0ubmFtZUxvY2F0aW9uLFxuICAgICAgICBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uLFxuICAgICAgICBsaW5lUG9zaXRpb24gPSBheGlzSXRlbS5saW5lUG9zaXRpb247XG5cbiAgICB2YXIgX2xpbmVQb3NpdGlvbjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVBvc2l0aW9uLCAyKSxcbiAgICAgICAgbGluZVN0YXJ0ID0gX2xpbmVQb3NpdGlvbjJbMF0sXG4gICAgICAgIGxpbmVFbmQgPSBfbGluZVBvc2l0aW9uMlsxXTtcblxuICAgIHZhciBuYW1lUG9zaXRpb24gPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxpbmVTdGFydCk7XG4gICAgaWYgKG5hbWVMb2NhdGlvbiA9PT0gJ2VuZCcpIG5hbWVQb3NpdGlvbiA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZUVuZCk7XG5cbiAgICBpZiAobmFtZUxvY2F0aW9uID09PSAnY2VudGVyJykge1xuICAgICAgbmFtZVBvc2l0aW9uWzBdID0gKGxpbmVTdGFydFswXSArIGxpbmVFbmRbMF0pIC8gMjtcbiAgICAgIG5hbWVQb3NpdGlvblsxXSA9IChsaW5lU3RhcnRbMV0gKyBsaW5lRW5kWzFdKSAvIDI7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmIG5hbWVMb2NhdGlvbiA9PT0gJ2NlbnRlcicpIGluZGV4ID0gMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nICYmIG5hbWVMb2NhdGlvbiA9PT0gJ2NlbnRlcicpIGluZGV4ID0gMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdsZWZ0JyAmJiBuYW1lTG9jYXRpb24gIT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnICYmIG5hbWVMb2NhdGlvbiAhPT0gJ2NlbnRlcicpIGluZGV4ID0gMTtcbiAgICB2YXIgcGx1cyA9IG5hbWVHYXA7XG4gICAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBuYW1lTG9jYXRpb24gIT09ICdlbmQnKSBwbHVzICo9IC0xO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIG5hbWVMb2NhdGlvbiAhPT0gJ3N0YXJ0JykgcGx1cyAqPSAtMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nICYmIG5hbWVMb2NhdGlvbiA9PT0gJ3N0YXJ0JykgcGx1cyAqPSAtMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcgJiYgbmFtZUxvY2F0aW9uID09PSAnZW5kJykgcGx1cyAqPSAtMTtcbiAgICBuYW1lUG9zaXRpb25baW5kZXhdICs9IHBsdXM7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXNJdGVtLCB7XG4gICAgICBuYW1lUG9zaXRpb246IG5hbWVQb3NpdGlvblxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY1NwbGl0TGluZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KSB7XG4gIHZhciBfY2hhcnQkZ3JpZEFyZWEyID0gY2hhcnQuZ3JpZEFyZWEsXG4gICAgICB3ID0gX2NoYXJ0JGdyaWRBcmVhMi53LFxuICAgICAgaCA9IF9jaGFydCRncmlkQXJlYTIuaDtcbiAgcmV0dXJuIGFsbEF4aXMubWFwKGZ1bmN0aW9uIChheGlzSXRlbSkge1xuICAgIHZhciB0aWNrTGluZVBvc2l0aW9uID0gYXhpc0l0ZW0udGlja0xpbmVQb3NpdGlvbixcbiAgICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbixcbiAgICAgICAgYm91bmRhcnlHYXAgPSBheGlzSXRlbS5ib3VuZGFyeUdhcDtcbiAgICB2YXIgaW5kZXggPSAwLFxuICAgICAgICBwbHVzID0gdztcbiAgICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgaW5kZXggPSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nKSBwbHVzID0gaDtcbiAgICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nKSBwbHVzICo9IC0xO1xuICAgIHZhciBzcGxpdExpbmVQb3NpdGlvbiA9IHRpY2tMaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChfcmVmMTgpIHtcbiAgICAgIHZhciBfcmVmMTkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjE4LCAxKSxcbiAgICAgICAgICBzdGFydFBvaW50ID0gX3JlZjE5WzBdO1xuXG4gICAgICB2YXIgZW5kUG9pbnQgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHN0YXJ0UG9pbnQpO1xuICAgICAgZW5kUG9pbnRbaW5kZXhdICs9IHBsdXM7XG4gICAgICByZXR1cm4gWygwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc3RhcnRQb2ludCksIGVuZFBvaW50XTtcbiAgICB9KTtcbiAgICBpZiAoIWJvdW5kYXJ5R2FwKSBzcGxpdExpbmVQb3NpdGlvbi5zaGlmdCgpO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzSXRlbSwge1xuICAgICAgc3BsaXRMaW5lUG9zaXRpb246IHNwbGl0TGluZVBvc2l0aW9uXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIHZpc2libGU6IGF4aXNJdGVtLmF4aXNMaW5lLnNob3csXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0TGluZVNoYXBlKGF4aXNJdGVtKSxcbiAgICBzdHlsZTogZ2V0TGluZVN0eWxlKGF4aXNJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZVNoYXBlKGF4aXNJdGVtKSB7XG4gIHZhciBsaW5lUG9zaXRpb24gPSBheGlzSXRlbS5saW5lUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBsaW5lUG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZVN0eWxlKGF4aXNJdGVtKSB7XG4gIHJldHVybiBheGlzSXRlbS5heGlzTGluZS5zdHlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlja0NvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRUaWNrU2hhcGVzKGF4aXNJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0VGlja1N0eWxlKGF4aXNJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogYXhpc0l0ZW0uYXhpc1RpY2suc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUaWNrU2hhcGVzKGF4aXNJdGVtKSB7XG4gIHZhciB0aWNrTGluZVBvc2l0aW9uID0gYXhpc0l0ZW0udGlja0xpbmVQb3NpdGlvbjtcbiAgcmV0dXJuIHRpY2tMaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9pbnRzOiBwb2ludHNcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlja1N0eWxlKGF4aXNJdGVtKSB7XG4gIHJldHVybiBheGlzSXRlbS5heGlzVGljay5zdHlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxDb25maWcoYXhpc0l0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYXhpc0l0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYXhpc0l0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0TGFiZWxTaGFwZXMoYXhpc0l0ZW0pO1xuICB2YXIgc3R5bGVzID0gZ2V0TGFiZWxTdHlsZShheGlzSXRlbSwgc2hhcGVzKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBheGlzSXRlbS5heGlzTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZXNbaV0sXG4gICAgICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU2hhcGVzKGF4aXNJdGVtKSB7XG4gIHZhciBsYWJlbCA9IGF4aXNJdGVtLmxhYmVsLFxuICAgICAgdGlja1Bvc2l0aW9uID0gYXhpc0l0ZW0udGlja1Bvc2l0aW9uLFxuICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbjtcbiAgcmV0dXJuIHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHBvaW50LCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBnZXRMYWJlbFJlYWxQb3NpdGlvbihwb2ludCwgcG9zaXRpb24pLFxuICAgICAgY29udGVudDogbGFiZWxbaV0udG9TdHJpbmcoKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFJlYWxQb3NpdGlvbihwb2ludHMsIHBvc2l0aW9uKSB7XG4gIHZhciBpbmRleCA9IDAsXG4gICAgICBwbHVzID0gMTA7XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nKSBpbmRleCA9IDE7XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgfHwgcG9zaXRpb24gPT09ICdsZWZ0JykgcGx1cyA9IC0xMDtcbiAgcG9pbnRzID0gKDAsIF91dGlsMi5kZWVwQ2xvbmUpKHBvaW50cyk7XG4gIHBvaW50c1tpbmRleF0gKz0gcGx1cztcbiAgcmV0dXJuIHBvaW50cztcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTdHlsZShheGlzSXRlbSwgc2hhcGVzKSB7XG4gIHZhciBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uO1xuICB2YXIgc3R5bGUgPSBheGlzSXRlbS5heGlzTGFiZWwuc3R5bGU7XG4gIHZhciBhbGlnbiA9IGdldEF4aXNMYWJlbFJlYWxBbGlnbihwb3NpdGlvbik7XG4gIHN0eWxlID0gKDAsIF91dGlsLmRlZXBNZXJnZSkoYWxpZ24sIHN0eWxlKTtcbiAgdmFyIHN0eWxlcyA9IHNoYXBlcy5tYXAoZnVuY3Rpb24gKF9yZWYyMCkge1xuICAgIHZhciBwb3NpdGlvbiA9IF9yZWYyMC5wb3NpdGlvbjtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgc3R5bGUsIHtcbiAgICAgIGdyYXBoQ2VudGVyOiBwb3NpdGlvblxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmVsUmVhbEFsaWduKHBvc2l0aW9uKSB7XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ3JpZ2h0JyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVDb25maWcoYXhpc0l0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYXhpc0l0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYXhpc0l0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAndGV4dCcsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXROYW1lU2hhcGUoYXhpc0l0ZW0pLFxuICAgIHN0eWxlOiBnZXROYW1lU3R5bGUoYXhpc0l0ZW0pXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXROYW1lU2hhcGUoYXhpc0l0ZW0pIHtcbiAgdmFyIG5hbWUgPSBheGlzSXRlbS5uYW1lLFxuICAgICAgbmFtZVBvc2l0aW9uID0gYXhpc0l0ZW0ubmFtZVBvc2l0aW9uO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IG5hbWUsXG4gICAgcG9zaXRpb246IG5hbWVQb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROYW1lU3R5bGUoYXhpc0l0ZW0pIHtcbiAgdmFyIG5hbWVMb2NhdGlvbiA9IGF4aXNJdGVtLm5hbWVMb2NhdGlvbixcbiAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb24sXG4gICAgICBzdHlsZSA9IGF4aXNJdGVtLm5hbWVUZXh0U3R5bGU7XG4gIHZhciBhbGlnbiA9IGdldE5hbWVSZWFsQWxpZ24ocG9zaXRpb24sIG5hbWVMb2NhdGlvbik7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKShhbGlnbiwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXROYW1lUmVhbEFsaWduKHBvc2l0aW9uLCBsb2NhdGlvbikge1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmIGxvY2F0aW9uID09PSAnc3RhcnQnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBsb2NhdGlvbiA9PT0gJ3N0YXJ0JyB8fCBwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGxvY2F0aW9uID09PSAnY2VudGVyJykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmIGxvY2F0aW9uID09PSAnZW5kJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbG9jYXRpb24gPT09ICdlbmQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnICYmIGxvY2F0aW9uID09PSAnY2VudGVyJykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgbG9jYXRpb24gPT09ICdjZW50ZXInIHx8IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbG9jYXRpb24gPT09ICdlbmQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnICYmIGxvY2F0aW9uID09PSAnZW5kJykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBsb2NhdGlvbiA9PT0gJ2NlbnRlcicgfHwgcG9zaXRpb24gPT09ICdsZWZ0JyAmJiBsb2NhdGlvbiA9PT0gJ3N0YXJ0JyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBsb2NhdGlvbiA9PT0gJ3N0YXJ0JykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIHRleHRCYXNlbGluZTogJ3RvcCdcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldFNwbGl0TGluZVNoYXBlcyhheGlzSXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldFNwbGl0TGluZVN0eWxlKGF4aXNJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogYXhpc0l0ZW0uc3BsaXRMaW5lLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lU2hhcGVzKGF4aXNJdGVtKSB7XG4gIHZhciBzcGxpdExpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLnNwbGl0TGluZVBvc2l0aW9uO1xuICByZXR1cm4gc3BsaXRMaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9pbnRzOiBwb2ludHNcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lU3R5bGUoYXhpc0l0ZW0pIHtcbiAgcmV0dXJuIGF4aXNJdGVtLnNwbGl0TGluZS5zdHlsZTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmJhciA9IGJhcjtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBiYXIoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciB4QXhpcyA9IG9wdGlvbi54QXhpcyxcbiAgICAgIHlBeGlzID0gb3B0aW9uLnlBeGlzLFxuICAgICAgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgdmFyIGJhcnMgPSBbXTtcblxuICBpZiAoeEF4aXMgJiYgeUF4aXMgJiYgc2VyaWVzKSB7XG4gICAgYmFycyA9ICgwLCBfdXRpbDIuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX2NvbmZpZy5iYXJDb25maWcsICdiYXInKTtcbiAgICBiYXJzID0gc2V0QmFyQXhpcyhiYXJzLCBjaGFydCk7XG4gICAgYmFycyA9IHNldEJhclBvc2l0aW9uRGF0YShiYXJzLCBjaGFydCk7XG4gICAgYmFycyA9IGNhbGNCYXJzUG9zaXRpb24oYmFycywgY2hhcnQpO1xuICB9XG5cbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYmFycy5zbGljZSgtMSksXG4gICAga2V5OiAnYmFja2dyb3VuZEJhcicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEJhY2tncm91bmRCYXJDb25maWdcbiAgfSk7XG4gIGJhcnMucmV2ZXJzZSgpO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBiYXJzLFxuICAgIGtleTogJ2JhcicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEJhckNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydEJhckNvbmZpZyxcbiAgICBiZWZvcmVVcGRhdGU6IGJlZm9yZVVwZGF0ZUJhclxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYmFycyxcbiAgICBrZXk6ICdiYXJMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExhYmVsQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJBeGlzKGJhcnMsIGNoYXJ0KSB7XG4gIHZhciBheGlzRGF0YSA9IGNoYXJ0LmF4aXNEYXRhO1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciB4QXhpc0luZGV4ID0gYmFyLnhBeGlzSW5kZXgsXG4gICAgICAgIHlBeGlzSW5kZXggPSBiYXIueUF4aXNJbmRleDtcbiAgICBpZiAodHlwZW9mIHhBeGlzSW5kZXggIT09ICdudW1iZXInKSB4QXhpc0luZGV4ID0gMDtcbiAgICBpZiAodHlwZW9mIHlBeGlzSW5kZXggIT09ICdudW1iZXInKSB5QXhpc0luZGV4ID0gMDtcbiAgICB2YXIgeEF4aXMgPSBheGlzRGF0YS5maW5kKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICB2YXIgYXhpcyA9IF9yZWYuYXhpcyxcbiAgICAgICAgICBpbmRleCA9IF9yZWYuaW5kZXg7XG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQoYXhpcykuY29uY2F0KGluZGV4KSA9PT0gXCJ4XCIuY29uY2F0KHhBeGlzSW5kZXgpO1xuICAgIH0pO1xuICAgIHZhciB5QXhpcyA9IGF4aXNEYXRhLmZpbmQoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgICB2YXIgYXhpcyA9IF9yZWYyLmF4aXMsXG4gICAgICAgICAgaW5kZXggPSBfcmVmMi5pbmRleDtcbiAgICAgIHJldHVybiBcIlwiLmNvbmNhdChheGlzKS5jb25jYXQoaW5kZXgpID09PSBcInlcIi5jb25jYXQoeUF4aXNJbmRleCk7XG4gICAgfSk7XG4gICAgdmFyIGF4aXMgPSBbeEF4aXMsIHlBeGlzXTtcbiAgICB2YXIgdmFsdWVBeGlzSW5kZXggPSBheGlzLmZpbmRJbmRleChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICAgIHZhciBkYXRhID0gX3JlZjMuZGF0YTtcbiAgICAgIHJldHVybiBkYXRhID09PSAndmFsdWUnO1xuICAgIH0pO1xuICAgIGJhci52YWx1ZUF4aXMgPSBheGlzW3ZhbHVlQXhpc0luZGV4XTtcbiAgICBiYXIubGFiZWxBeGlzID0gYXhpc1sxIC0gdmFsdWVBeGlzSW5kZXhdO1xuICB9KTtcbiAgcmV0dXJuIGJhcnM7XG59XG5cbmZ1bmN0aW9uIHNldEJhclBvc2l0aW9uRGF0YShiYXJzLCBjaGFydCkge1xuICB2YXIgbGFiZWxCYXJHcm91cCA9IGdyb3VwQmFyQnlMYWJlbEF4aXMoYmFycyk7XG4gIGxhYmVsQmFyR3JvdXAuZm9yRWFjaChmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICBzZXRCYXJJbmRleChncm91cCk7XG4gICAgc2V0QmFyTnVtKGdyb3VwKTtcbiAgICBzZXRCYXJDYXRlZ29yeVdpZHRoKGdyb3VwLCBjaGFydCk7XG4gICAgc2V0QmFyV2lkdGhBbmRHYXAoZ3JvdXApO1xuICAgIHNldEJhckFsbFdpZHRoQW5kR2FwKGdyb3VwKTtcbiAgfSk7XG4gIHJldHVybiBiYXJzO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJJbmRleChiYXJzKSB7XG4gIHZhciBzdGFja3MgPSBnZXRCYXJTdGFjayhiYXJzKTtcbiAgc3RhY2tzID0gc3RhY2tzLm1hcChmdW5jdGlvbiAoc3RhY2spIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhY2s6IHN0YWNrLFxuICAgICAgaW5kZXg6IC0xXG4gICAgfTtcbiAgfSk7XG4gIHZhciBjdXJyZW50SW5kZXggPSAwO1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciBzdGFjayA9IGJhci5zdGFjaztcblxuICAgIGlmICghc3RhY2spIHtcbiAgICAgIGJhci5iYXJJbmRleCA9IGN1cnJlbnRJbmRleDtcbiAgICAgIGN1cnJlbnRJbmRleCsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhY2tEYXRhID0gc3RhY2tzLmZpbmQoZnVuY3Rpb24gKF9yZWY0KSB7XG4gICAgICAgIHZhciBzID0gX3JlZjQuc3RhY2s7XG4gICAgICAgIHJldHVybiBzID09PSBzdGFjaztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoc3RhY2tEYXRhLmluZGV4ID09PSAtMSkge1xuICAgICAgICBzdGFja0RhdGEuaW5kZXggPSBjdXJyZW50SW5kZXg7XG4gICAgICAgIGN1cnJlbnRJbmRleCsrO1xuICAgICAgfVxuXG4gICAgICBiYXIuYmFySW5kZXggPSBzdGFja0RhdGEuaW5kZXg7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ3JvdXBCYXJCeUxhYmVsQXhpcyhiYXJzKSB7XG4gIHZhciBsYWJlbEF4aXMgPSBiYXJzLm1hcChmdW5jdGlvbiAoX3JlZjUpIHtcbiAgICB2YXIgX3JlZjUkbGFiZWxBeGlzID0gX3JlZjUubGFiZWxBeGlzLFxuICAgICAgICBheGlzID0gX3JlZjUkbGFiZWxBeGlzLmF4aXMsXG4gICAgICAgIGluZGV4ID0gX3JlZjUkbGFiZWxBeGlzLmluZGV4O1xuICAgIHJldHVybiBheGlzICsgaW5kZXg7XG4gIH0pO1xuICBsYWJlbEF4aXMgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ldyBTZXQobGFiZWxBeGlzKSk7XG4gIHJldHVybiBsYWJlbEF4aXMubWFwKGZ1bmN0aW9uIChheGlzSW5kZXgpIHtcbiAgICByZXR1cm4gYmFycy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY2KSB7XG4gICAgICB2YXIgX3JlZjYkbGFiZWxBeGlzID0gX3JlZjYubGFiZWxBeGlzLFxuICAgICAgICAgIGF4aXMgPSBfcmVmNiRsYWJlbEF4aXMuYXhpcyxcbiAgICAgICAgICBpbmRleCA9IF9yZWY2JGxhYmVsQXhpcy5pbmRleDtcbiAgICAgIHJldHVybiBheGlzICsgaW5kZXggPT09IGF4aXNJbmRleDtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhclN0YWNrKGJhcnMpIHtcbiAgdmFyIHN0YWNrcyA9IFtdO1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKF9yZWY3KSB7XG4gICAgdmFyIHN0YWNrID0gX3JlZjcuc3RhY2s7XG4gICAgaWYgKHN0YWNrKSBzdGFja3MucHVzaChzdGFjayk7XG4gIH0pO1xuICByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXcgU2V0KHN0YWNrcykpO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJOdW0oYmFycykge1xuICB2YXIgYmFyTnVtID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXcgU2V0KGJhcnMubWFwKGZ1bmN0aW9uIChfcmVmOCkge1xuICAgIHZhciBiYXJJbmRleCA9IF9yZWY4LmJhckluZGV4O1xuICAgIHJldHVybiBiYXJJbmRleDtcbiAgfSkpKS5sZW5ndGg7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgcmV0dXJuIGJhci5iYXJOdW0gPSBiYXJOdW07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJDYXRlZ29yeVdpZHRoKGJhcnMpIHtcbiAgdmFyIGxhc3RCYXIgPSBiYXJzLnNsaWNlKC0xKVswXTtcbiAgdmFyIGJhckNhdGVnb3J5R2FwID0gbGFzdEJhci5iYXJDYXRlZ29yeUdhcCxcbiAgICAgIHRpY2tHYXAgPSBsYXN0QmFyLmxhYmVsQXhpcy50aWNrR2FwO1xuICB2YXIgYmFyQ2F0ZWdvcnlXaWR0aCA9IDA7XG5cbiAgaWYgKHR5cGVvZiBiYXJDYXRlZ29yeUdhcCA9PT0gJ251bWJlcicpIHtcbiAgICBiYXJDYXRlZ29yeVdpZHRoID0gYmFyQ2F0ZWdvcnlHYXA7XG4gIH0gZWxzZSB7XG4gICAgYmFyQ2F0ZWdvcnlXaWR0aCA9ICgxIC0gcGFyc2VJbnQoYmFyQ2F0ZWdvcnlHYXApIC8gMTAwKSAqIHRpY2tHYXA7XG4gIH1cblxuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHJldHVybiBiYXIuYmFyQ2F0ZWdvcnlXaWR0aCA9IGJhckNhdGVnb3J5V2lkdGg7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJXaWR0aEFuZEdhcChiYXJzKSB7XG4gIHZhciBfYmFycyRzbGljZSQgPSBiYXJzLnNsaWNlKC0xKVswXSxcbiAgICAgIGJhckNhdGVnb3J5V2lkdGggPSBfYmFycyRzbGljZSQuYmFyQ2F0ZWdvcnlXaWR0aCxcbiAgICAgIGJhcldpZHRoID0gX2JhcnMkc2xpY2UkLmJhcldpZHRoLFxuICAgICAgYmFyR2FwID0gX2JhcnMkc2xpY2UkLmJhckdhcCxcbiAgICAgIGJhck51bSA9IF9iYXJzJHNsaWNlJC5iYXJOdW07XG4gIHZhciB3aWR0aEFuZEdhcCA9IFtdO1xuXG4gIGlmICh0eXBlb2YgYmFyV2lkdGggPT09ICdudW1iZXInIHx8IGJhcldpZHRoICE9PSAnYXV0bycpIHtcbiAgICB3aWR0aEFuZEdhcCA9IGdldEJhcldpZHRoQW5kR2FwV2l0aFBlcmNlbnRPck51bWJlcihiYXJDYXRlZ29yeVdpZHRoLCBiYXJXaWR0aCwgYmFyR2FwLCBiYXJOdW0pO1xuICB9IGVsc2UgaWYgKGJhcldpZHRoID09PSAnYXV0bycpIHtcbiAgICB3aWR0aEFuZEdhcCA9IGdldEJhcldpZHRoQW5kR2FwV2lkdGhBdXRvKGJhckNhdGVnb3J5V2lkdGgsIGJhcldpZHRoLCBiYXJHYXAsIGJhck51bSk7XG4gIH1cblxuICB2YXIgX3dpZHRoQW5kR2FwID0gd2lkdGhBbmRHYXAsXG4gICAgICBfd2lkdGhBbmRHYXAyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF93aWR0aEFuZEdhcCwgMiksXG4gICAgICB3aWR0aCA9IF93aWR0aEFuZEdhcDJbMF0sXG4gICAgICBnYXAgPSBfd2lkdGhBbmRHYXAyWzFdO1xuXG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgYmFyLmJhcldpZHRoID0gd2lkdGg7XG4gICAgYmFyLmJhckdhcCA9IGdhcDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhcldpZHRoQW5kR2FwV2l0aFBlcmNlbnRPck51bWJlcihiYXJDYXRlZ29yeVdpZHRoLCBiYXJXaWR0aCwgYmFyR2FwKSB7XG4gIHZhciB3aWR0aCA9IDAsXG4gICAgICBnYXAgPSAwO1xuXG4gIGlmICh0eXBlb2YgYmFyV2lkdGggPT09ICdudW1iZXInKSB7XG4gICAgd2lkdGggPSBiYXJXaWR0aDtcbiAgfSBlbHNlIHtcbiAgICB3aWR0aCA9IHBhcnNlSW50KGJhcldpZHRoKSAvIDEwMCAqIGJhckNhdGVnb3J5V2lkdGg7XG4gIH1cblxuICBpZiAodHlwZW9mIGJhckdhcCA9PT0gJ251bWJlcicpIHtcbiAgICBnYXAgPSBiYXJHYXA7XG4gIH0gZWxzZSB7XG4gICAgZ2FwID0gcGFyc2VJbnQoYmFyR2FwKSAvIDEwMCAqIHdpZHRoO1xuICB9XG5cbiAgcmV0dXJuIFt3aWR0aCwgZ2FwXTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyV2lkdGhBbmRHYXBXaWR0aEF1dG8oYmFyQ2F0ZWdvcnlXaWR0aCwgYmFyV2lkdGgsIGJhckdhcCwgYmFyTnVtKSB7XG4gIHZhciB3aWR0aCA9IDAsXG4gICAgICBnYXAgPSAwO1xuICB2YXIgYmFySXRlbVdpZHRoID0gYmFyQ2F0ZWdvcnlXaWR0aCAvIGJhck51bTtcblxuICBpZiAodHlwZW9mIGJhckdhcCA9PT0gJ251bWJlcicpIHtcbiAgICBnYXAgPSBiYXJHYXA7XG4gICAgd2lkdGggPSBiYXJJdGVtV2lkdGggLSBnYXA7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBlcmNlbnQgPSAxMCArIHBhcnNlSW50KGJhckdhcCkgLyAxMDtcblxuICAgIGlmIChwZXJjZW50ID09PSAwKSB7XG4gICAgICB3aWR0aCA9IGJhckl0ZW1XaWR0aCAqIDI7XG4gICAgICBnYXAgPSAtd2lkdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpZHRoID0gYmFySXRlbVdpZHRoIC8gcGVyY2VudCAqIDEwO1xuICAgICAgZ2FwID0gYmFySXRlbVdpZHRoIC0gd2lkdGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFt3aWR0aCwgZ2FwXTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyQWxsV2lkdGhBbmRHYXAoYmFycykge1xuICB2YXIgX2JhcnMkc2xpY2UkMiA9IGJhcnMuc2xpY2UoLTEpWzBdLFxuICAgICAgYmFyR2FwID0gX2JhcnMkc2xpY2UkMi5iYXJHYXAsXG4gICAgICBiYXJXaWR0aCA9IF9iYXJzJHNsaWNlJDIuYmFyV2lkdGgsXG4gICAgICBiYXJOdW0gPSBfYmFycyRzbGljZSQyLmJhck51bTtcbiAgdmFyIGJhckFsbFdpZHRoQW5kR2FwID0gKGJhckdhcCArIGJhcldpZHRoKSAqIGJhck51bSAtIGJhckdhcDtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICByZXR1cm4gYmFyLmJhckFsbFdpZHRoQW5kR2FwID0gYmFyQWxsV2lkdGhBbmRHYXA7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjQmFyc1Bvc2l0aW9uKGJhcnMsIGNoYXJ0KSB7XG4gIGJhcnMgPSBjYWxjQmFyVmFsdWVBeGlzQ29vcmRpbmF0ZShiYXJzKTtcbiAgYmFycyA9IGNhbGNCYXJMYWJlbEF4aXNDb29yZGluYXRlKGJhcnMpO1xuICBiYXJzID0gZWxpbWluYXRlTnVsbEJhckxhYmVsQXhpcyhiYXJzKTtcbiAgYmFycyA9IGtlZXBTYW1lTnVtQmV0d2VlbkJhckFuZERhdGEoYmFycyk7XG4gIHJldHVybiBiYXJzO1xufVxuXG5mdW5jdGlvbiBjYWxjQmFyTGFiZWxBeGlzQ29vcmRpbmF0ZShiYXJzKSB7XG4gIHJldHVybiBiYXJzLm1hcChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIGxhYmVsQXhpcyA9IGJhci5sYWJlbEF4aXMsXG4gICAgICAgIGJhckFsbFdpZHRoQW5kR2FwID0gYmFyLmJhckFsbFdpZHRoQW5kR2FwLFxuICAgICAgICBiYXJHYXAgPSBiYXIuYmFyR2FwLFxuICAgICAgICBiYXJXaWR0aCA9IGJhci5iYXJXaWR0aCxcbiAgICAgICAgYmFySW5kZXggPSBiYXIuYmFySW5kZXg7XG4gICAgdmFyIHRpY2tHYXAgPSBsYWJlbEF4aXMudGlja0dhcCxcbiAgICAgICAgdGlja1Bvc2l0aW9uID0gbGFiZWxBeGlzLnRpY2tQb3NpdGlvbixcbiAgICAgICAgYXhpcyA9IGxhYmVsQXhpcy5heGlzO1xuICAgIHZhciBjb29yZGluYXRlSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgICB2YXIgYmFyTGFiZWxBeGlzUG9zID0gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAodGljaywgaSkge1xuICAgICAgdmFyIGJhckNhdGVnb3J5U3RhcnRQb3MgPSB0aWNrUG9zaXRpb25baV1bY29vcmRpbmF0ZUluZGV4XSAtIHRpY2tHYXAgLyAyO1xuICAgICAgdmFyIGJhckl0ZW1zU3RhcnRQb3MgPSBiYXJDYXRlZ29yeVN0YXJ0UG9zICsgKHRpY2tHYXAgLSBiYXJBbGxXaWR0aEFuZEdhcCkgLyAyO1xuICAgICAgcmV0dXJuIGJhckl0ZW1zU3RhcnRQb3MgKyAoYmFySW5kZXggKyAwLjUpICogYmFyV2lkdGggKyBiYXJJbmRleCAqIGJhckdhcDtcbiAgICB9KTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYmFyLCB7XG4gICAgICBiYXJMYWJlbEF4aXNQb3M6IGJhckxhYmVsQXhpc1Bvc1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0JhclZhbHVlQXhpc0Nvb3JkaW5hdGUoYmFycykge1xuICByZXR1cm4gYmFycy5tYXAoZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciBkYXRhID0gKDAsIF91dGlsMi5tZXJnZVNhbWVTdGFja0RhdGEpKGJhciwgYmFycyk7XG4gICAgZGF0YSA9IGVsaW1pbmF0ZU5vbk51bWJlckRhdGEoYmFyLCBkYXRhKTtcbiAgICB2YXIgX2JhciR2YWx1ZUF4aXMgPSBiYXIudmFsdWVBeGlzLFxuICAgICAgICBheGlzID0gX2JhciR2YWx1ZUF4aXMuYXhpcyxcbiAgICAgICAgbWluVmFsdWUgPSBfYmFyJHZhbHVlQXhpcy5taW5WYWx1ZSxcbiAgICAgICAgbWF4VmFsdWUgPSBfYmFyJHZhbHVlQXhpcy5tYXhWYWx1ZSxcbiAgICAgICAgbGluZVBvc2l0aW9uID0gX2JhciR2YWx1ZUF4aXMubGluZVBvc2l0aW9uO1xuICAgIHZhciBzdGFydFBvcyA9IGdldFZhbHVlUG9zKG1pblZhbHVlLCBtYXhWYWx1ZSwgbWluVmFsdWUgPCAwID8gMCA6IG1pblZhbHVlLCBsaW5lUG9zaXRpb24sIGF4aXMpO1xuICAgIHZhciBlbmRQb3MgPSBkYXRhLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIGdldFZhbHVlUG9zKG1pblZhbHVlLCBtYXhWYWx1ZSwgdiwgbGluZVBvc2l0aW9uLCBheGlzKTtcbiAgICB9KTtcbiAgICB2YXIgYmFyVmFsdWVBeGlzUG9zID0gZW5kUG9zLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIFtzdGFydFBvcywgcF07XG4gICAgfSk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGJhciwge1xuICAgICAgYmFyVmFsdWVBeGlzUG9zOiBiYXJWYWx1ZUF4aXNQb3NcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGVsaW1pbmF0ZU5vbk51bWJlckRhdGEoYmFySXRlbSwgYmFyRGF0YSkge1xuICB2YXIgZGF0YSA9IGJhckl0ZW0uZGF0YTtcbiAgcmV0dXJuIGJhckRhdGEubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBkYXRhW2ldID09PSAnbnVtYmVyJyA/IHYgOiBudWxsO1xuICB9KS5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZCAhPT0gbnVsbDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGVsaW1pbmF0ZU51bGxCYXJMYWJlbEF4aXMoYmFycykge1xuICByZXR1cm4gYmFycy5tYXAoZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciBiYXJMYWJlbEF4aXNQb3MgPSBiYXIuYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgICBkYXRhID0gYmFyLmRhdGE7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICBpZiAodHlwZW9mIGQgPT09ICdudW1iZXInKSByZXR1cm47XG4gICAgICBiYXJMYWJlbEF4aXNQb3NbaV0gPSBudWxsO1xuICAgIH0pO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBiYXIsIHtcbiAgICAgIGJhckxhYmVsQXhpc1BvczogYmFyTGFiZWxBeGlzUG9zLmZpbHRlcihmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gcCAhPT0gbnVsbDtcbiAgICAgIH0pXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBrZWVwU2FtZU51bUJldHdlZW5CYXJBbmREYXRhKGJhcnMpIHtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgZGF0YSA9IGJhci5kYXRhLFxuICAgICAgICBiYXJMYWJlbEF4aXNQb3MgPSBiYXIuYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgICBiYXJWYWx1ZUF4aXNQb3MgPSBiYXIuYmFyVmFsdWVBeGlzUG9zO1xuICAgIHZhciBkYXRhTnVtID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ251bWJlcic7XG4gICAgfSkubGVuZ3RoO1xuICAgIHZhciBheGlzUG9zTnVtID0gYmFyTGFiZWxBeGlzUG9zLmxlbmd0aDtcblxuICAgIGlmIChheGlzUG9zTnVtID4gZGF0YU51bSkge1xuICAgICAgYmFyTGFiZWxBeGlzUG9zLnNwbGljZShkYXRhTnVtKTtcbiAgICAgIGJhclZhbHVlQXhpc1Bvcy5zcGxpY2UoZGF0YU51bSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGJhcnM7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlUG9zKG1pbiwgbWF4LCB2YWx1ZSwgbGluZVBvc2l0aW9uLCBheGlzKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSByZXR1cm4gbnVsbDtcbiAgdmFyIHZhbHVlTWludXMgPSBtYXggLSBtaW47XG4gIHZhciBjb29yZGluYXRlSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIHBvc01pbnVzID0gbGluZVBvc2l0aW9uWzFdW2Nvb3JkaW5hdGVJbmRleF0gLSBsaW5lUG9zaXRpb25bMF1bY29vcmRpbmF0ZUluZGV4XTtcbiAgdmFyIHBlcmNlbnQgPSAodmFsdWUgLSBtaW4pIC8gdmFsdWVNaW51cztcbiAgaWYgKHZhbHVlTWludXMgPT09IDApIHBlcmNlbnQgPSAwO1xuICB2YXIgcG9zID0gcGVyY2VudCAqIHBvc01pbnVzO1xuICByZXR1cm4gcG9zICsgbGluZVBvc2l0aW9uWzBdW2Nvb3JkaW5hdGVJbmRleF07XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRCYXJDb25maWcoYmFySXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBiYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBiYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYmFySXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRCYWNrZ3JvdW5kQmFyU2hhcGVzKGJhckl0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRCYWNrZ3JvdW5kQmFyU3R5bGUoYmFySXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncmVjdCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogYmFySXRlbS5iYWNrZ3JvdW5kQmFyLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJhclNoYXBlcyhiYXJJdGVtKSB7XG4gIHZhciBsYWJlbEF4aXMgPSBiYXJJdGVtLmxhYmVsQXhpcyxcbiAgICAgIHZhbHVlQXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzO1xuICB2YXIgdGlja1Bvc2l0aW9uID0gbGFiZWxBeGlzLnRpY2tQb3NpdGlvbjtcbiAgdmFyIGF4aXMgPSB2YWx1ZUF4aXMuYXhpcyxcbiAgICAgIGxpbmVQb3NpdGlvbiA9IHZhbHVlQXhpcy5saW5lUG9zaXRpb247XG4gIHZhciB3aWR0aCA9IGdldEJhY2tncm91bmRCYXJXaWR0aChiYXJJdGVtKTtcbiAgdmFyIGhhbHRXaWR0aCA9IHdpZHRoIC8gMjtcbiAgdmFyIHBvc0luZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBjZW50ZXJQb3MgPSB0aWNrUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgcmV0dXJuIHBbMSAtIHBvc0luZGV4XTtcbiAgfSk7XG4gIHZhciBfcmVmOSA9IFtsaW5lUG9zaXRpb25bMF1bcG9zSW5kZXhdLCBsaW5lUG9zaXRpb25bMV1bcG9zSW5kZXhdXSxcbiAgICAgIHN0YXJ0ID0gX3JlZjlbMF0sXG4gICAgICBlbmQgPSBfcmVmOVsxXTtcbiAgcmV0dXJuIGNlbnRlclBvcy5tYXAoZnVuY3Rpb24gKGNlbnRlcikge1xuICAgIGlmIChheGlzID09PSAneCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHN0YXJ0LFxuICAgICAgICB5OiBjZW50ZXIgLSBoYWx0V2lkdGgsXG4gICAgICAgIHc6IGVuZCAtIHN0YXJ0LFxuICAgICAgICBoOiB3aWR0aFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogY2VudGVyIC0gaGFsdFdpZHRoLFxuICAgICAgICB5OiBlbmQsXG4gICAgICAgIHc6IHdpZHRoLFxuICAgICAgICBoOiBzdGFydCAtIGVuZFxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQmFyV2lkdGgoYmFySXRlbSkge1xuICB2YXIgYmFyQWxsV2lkdGhBbmRHYXAgPSBiYXJJdGVtLmJhckFsbFdpZHRoQW5kR2FwLFxuICAgICAgYmFyQ2F0ZWdvcnlXaWR0aCA9IGJhckl0ZW0uYmFyQ2F0ZWdvcnlXaWR0aCxcbiAgICAgIGJhY2tncm91bmRCYXIgPSBiYXJJdGVtLmJhY2tncm91bmRCYXI7XG4gIHZhciB3aWR0aCA9IGJhY2tncm91bmRCYXIud2lkdGg7XG4gIGlmICh0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInKSByZXR1cm4gd2lkdGg7XG4gIGlmICh3aWR0aCA9PT0gJ2F1dG8nKSByZXR1cm4gYmFyQWxsV2lkdGhBbmRHYXA7XG4gIHJldHVybiBwYXJzZUludCh3aWR0aCkgLyAxMDAgKiBiYXJDYXRlZ29yeVdpZHRoO1xufVxuXG5mdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQmFyU3R5bGUoYmFySXRlbSkge1xuICByZXR1cm4gYmFySXRlbS5iYWNrZ3JvdW5kQmFyLnN0eWxlO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJDb25maWcoYmFySXRlbSkge1xuICB2YXIgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGJhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGJhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBiYXJJdGVtLnJMZXZlbDtcbiAgdmFyIG5hbWUgPSBnZXRCYXJOYW1lKGJhckl0ZW0pO1xuICByZXR1cm4gYmFyTGFiZWxBeGlzUG9zLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEJhclNoYXBlKGJhckl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEJhclN0eWxlKGJhckl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhck5hbWUoYmFySXRlbSkge1xuICB2YXIgc2hhcGVUeXBlID0gYmFySXRlbS5zaGFwZVR5cGU7XG4gIGlmIChzaGFwZVR5cGUgPT09ICdsZWZ0RWNoZWxvbicgfHwgc2hhcGVUeXBlID09PSAncmlnaHRFY2hlbG9uJykgcmV0dXJuICdwb2x5bGluZSc7XG4gIHJldHVybiAncmVjdCc7XG59XG5cbmZ1bmN0aW9uIGdldEJhclNoYXBlKGJhckl0ZW0sIGkpIHtcbiAgdmFyIHNoYXBlVHlwZSA9IGJhckl0ZW0uc2hhcGVUeXBlO1xuXG4gIGlmIChzaGFwZVR5cGUgPT09ICdsZWZ0RWNoZWxvbicpIHtcbiAgICByZXR1cm4gZ2V0TGVmdEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKTtcbiAgfSBlbHNlIGlmIChzaGFwZVR5cGUgPT09ICdyaWdodEVjaGVsb24nKSB7XG4gICAgcmV0dXJuIGdldFJpZ2h0RWNoZWxvblNoYXBlKGJhckl0ZW0sIGkpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBnZXROb3JtYWxCYXJTaGFwZShiYXJJdGVtLCBpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMZWZ0RWNoZWxvblNoYXBlKGJhckl0ZW0sIGkpIHtcbiAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGJhckl0ZW0uYmFyVmFsdWVBeGlzUG9zLFxuICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICBiYXJXaWR0aCA9IGJhckl0ZW0uYmFyV2lkdGgsXG4gICAgICBlY2hlbG9uT2Zmc2V0ID0gYmFySXRlbS5lY2hlbG9uT2Zmc2V0O1xuXG4gIHZhciBfYmFyVmFsdWVBeGlzUG9zJGkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoYmFyVmFsdWVBeGlzUG9zW2ldLCAyKSxcbiAgICAgIHN0YXJ0ID0gX2JhclZhbHVlQXhpc1BvcyRpWzBdLFxuICAgICAgZW5kID0gX2JhclZhbHVlQXhpc1BvcyRpWzFdO1xuXG4gIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gIHZhciBoYWxmV2lkdGggPSBiYXJXaWR0aCAvIDI7XG4gIHZhciB2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICB2YXIgcG9pbnRzID0gW107XG5cbiAgaWYgKHZhbHVlQXhpcyA9PT0gJ3gnKSB7XG4gICAgcG9pbnRzWzBdID0gW2VuZCwgbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoXTtcbiAgICBwb2ludHNbMV0gPSBbZW5kLCBsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGhdO1xuICAgIHBvaW50c1syXSA9IFtzdGFydCwgbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoXTtcbiAgICBwb2ludHNbM10gPSBbc3RhcnQgKyBlY2hlbG9uT2Zmc2V0LCBsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGhdO1xuICAgIGlmIChlbmQgLSBzdGFydCA8IGVjaGVsb25PZmZzZXQpIHBvaW50cy5zcGxpY2UoMywgMSk7XG4gIH0gZWxzZSB7XG4gICAgcG9pbnRzWzBdID0gW2xhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aCwgZW5kXTtcbiAgICBwb2ludHNbMV0gPSBbbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoLCBlbmRdO1xuICAgIHBvaW50c1syXSA9IFtsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGgsIHN0YXJ0XTtcbiAgICBwb2ludHNbM10gPSBbbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoLCBzdGFydCAtIGVjaGVsb25PZmZzZXRdO1xuICAgIGlmIChzdGFydCAtIGVuZCA8IGVjaGVsb25PZmZzZXQpIHBvaW50cy5zcGxpY2UoMywgMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBvaW50czogcG9pbnRzLFxuICAgIGNsb3NlOiB0cnVlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFJpZ2h0RWNoZWxvblNoYXBlKGJhckl0ZW0sIGkpIHtcbiAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGJhckl0ZW0uYmFyVmFsdWVBeGlzUG9zLFxuICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICBiYXJXaWR0aCA9IGJhckl0ZW0uYmFyV2lkdGgsXG4gICAgICBlY2hlbG9uT2Zmc2V0ID0gYmFySXRlbS5lY2hlbG9uT2Zmc2V0O1xuXG4gIHZhciBfYmFyVmFsdWVBeGlzUG9zJGkyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTJbMF0sXG4gICAgICBlbmQgPSBfYmFyVmFsdWVBeGlzUG9zJGkyWzFdO1xuXG4gIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gIHZhciBoYWxmV2lkdGggPSBiYXJXaWR0aCAvIDI7XG4gIHZhciB2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICB2YXIgcG9pbnRzID0gW107XG5cbiAgaWYgKHZhbHVlQXhpcyA9PT0gJ3gnKSB7XG4gICAgcG9pbnRzWzBdID0gW2VuZCwgbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoXTtcbiAgICBwb2ludHNbMV0gPSBbZW5kLCBsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGhdO1xuICAgIHBvaW50c1syXSA9IFtzdGFydCwgbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoXTtcbiAgICBwb2ludHNbM10gPSBbc3RhcnQgKyBlY2hlbG9uT2Zmc2V0LCBsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGhdO1xuICAgIGlmIChlbmQgLSBzdGFydCA8IGVjaGVsb25PZmZzZXQpIHBvaW50cy5zcGxpY2UoMiwgMSk7XG4gIH0gZWxzZSB7XG4gICAgcG9pbnRzWzBdID0gW2xhYmVsQXhpc1BvcyArIGhhbGZXaWR0aCwgZW5kXTtcbiAgICBwb2ludHNbMV0gPSBbbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoLCBlbmRdO1xuICAgIHBvaW50c1syXSA9IFtsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGgsIHN0YXJ0XTtcbiAgICBwb2ludHNbM10gPSBbbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoLCBzdGFydCAtIGVjaGVsb25PZmZzZXRdO1xuICAgIGlmIChzdGFydCAtIGVuZCA8IGVjaGVsb25PZmZzZXQpIHBvaW50cy5zcGxpY2UoMiwgMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBvaW50czogcG9pbnRzLFxuICAgIGNsb3NlOiB0cnVlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE5vcm1hbEJhclNoYXBlKGJhckl0ZW0sIGkpIHtcbiAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGJhckl0ZW0uYmFyVmFsdWVBeGlzUG9zLFxuICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICBiYXJXaWR0aCA9IGJhckl0ZW0uYmFyV2lkdGg7XG5cbiAgdmFyIF9iYXJWYWx1ZUF4aXNQb3MkaTMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoYmFyVmFsdWVBeGlzUG9zW2ldLCAyKSxcbiAgICAgIHN0YXJ0ID0gX2JhclZhbHVlQXhpc1BvcyRpM1swXSxcbiAgICAgIGVuZCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTNbMV07XG5cbiAgdmFyIGxhYmVsQXhpc1BvcyA9IGJhckxhYmVsQXhpc1Bvc1tpXTtcbiAgdmFyIHZhbHVlQXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHZhciBzaGFwZSA9IHt9O1xuXG4gIGlmICh2YWx1ZUF4aXMgPT09ICd4Jykge1xuICAgIHNoYXBlLnggPSBzdGFydDtcbiAgICBzaGFwZS55ID0gbGFiZWxBeGlzUG9zIC0gYmFyV2lkdGggLyAyO1xuICAgIHNoYXBlLncgPSBlbmQgLSBzdGFydDtcbiAgICBzaGFwZS5oID0gYmFyV2lkdGg7XG4gIH0gZWxzZSB7XG4gICAgc2hhcGUueCA9IGxhYmVsQXhpc1BvcyAtIGJhcldpZHRoIC8gMjtcbiAgICBzaGFwZS55ID0gZW5kO1xuICAgIHNoYXBlLncgPSBiYXJXaWR0aDtcbiAgICBzaGFwZS5oID0gc3RhcnQgLSBlbmQ7XG4gIH1cblxuICByZXR1cm4gc2hhcGU7XG59XG5cbmZ1bmN0aW9uIGdldEJhclN0eWxlKGJhckl0ZW0sIGkpIHtcbiAgdmFyIGJhclN0eWxlID0gYmFySXRlbS5iYXJTdHlsZSxcbiAgICAgIGdyYWRpZW50ID0gYmFySXRlbS5ncmFkaWVudCxcbiAgICAgIGNvbG9yID0gYmFySXRlbS5jb2xvcjtcbiAgdmFyIGZpbGxDb2xvciA9IFtiYXJTdHlsZS5maWxsIHx8IGNvbG9yXTtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoZmlsbENvbG9yLCBncmFkaWVudC5jb2xvcik7XG4gIGlmIChncmFkaWVudENvbG9yLmxlbmd0aCA9PT0gMSkgZ3JhZGllbnRDb2xvci5wdXNoKGdyYWRpZW50Q29sb3JbMF0pO1xuICB2YXIgZ3JhZGllbnRQYXJhbXMgPSBnZXRHcmFkaWVudFBhcmFtcyhiYXJJdGVtLCBpKTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZ3JhZGllbnRDb2xvcjogZ3JhZGllbnRDb2xvcixcbiAgICBncmFkaWVudFBhcmFtczogZ3JhZGllbnRQYXJhbXMsXG4gICAgZ3JhZGllbnRUeXBlOiAnbGluZWFyJyxcbiAgICBncmFkaWVudFdpdGg6ICdmaWxsJ1xuICB9LCBiYXJTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEdyYWRpZW50UGFyYW1zKGJhckl0ZW0sIGkpIHtcbiAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGJhckl0ZW0uYmFyVmFsdWVBeGlzUG9zLFxuICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICBkYXRhID0gYmFySXRlbS5kYXRhO1xuICB2YXIgX2Jhckl0ZW0kdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMsXG4gICAgICBsaW5lUG9zaXRpb24gPSBfYmFySXRlbSR2YWx1ZUF4aXMubGluZVBvc2l0aW9uLFxuICAgICAgYXhpcyA9IF9iYXJJdGVtJHZhbHVlQXhpcy5heGlzO1xuXG4gIHZhciBfYmFyVmFsdWVBeGlzUG9zJGk0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTRbMF0sXG4gICAgICBlbmQgPSBfYmFyVmFsdWVBeGlzUG9zJGk0WzFdO1xuXG4gIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gIHZhciB2YWx1ZSA9IGRhdGFbaV07XG5cbiAgdmFyIF9saW5lUG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVBvc2l0aW9uLCAyKSxcbiAgICAgIGxpbmVTdGFydCA9IF9saW5lUG9zaXRpb25bMF0sXG4gICAgICBsaW5lRW5kID0gX2xpbmVQb3NpdGlvblsxXTtcblxuICB2YXIgdmFsdWVBeGlzSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIGVuZFBvcyA9IGVuZDtcblxuICBpZiAoIWJhckl0ZW0uZ3JhZGllbnQubG9jYWwpIHtcbiAgICBlbmRQb3MgPSB2YWx1ZSA8IDAgPyBsaW5lU3RhcnRbdmFsdWVBeGlzSW5kZXhdIDogbGluZUVuZFt2YWx1ZUF4aXNJbmRleF07XG4gIH1cblxuICBpZiAoYXhpcyA9PT0gJ3knKSB7XG4gICAgcmV0dXJuIFtsYWJlbEF4aXNQb3MsIGVuZFBvcywgbGFiZWxBeGlzUG9zLCBzdGFydF07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtlbmRQb3MsIGxhYmVsQXhpc1Bvcywgc3RhcnQsIGxhYmVsQXhpc1Bvc107XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRCYXJDb25maWcoYmFySXRlbSkge1xuICB2YXIgY29uZmlncyA9IGdldEJhckNvbmZpZyhiYXJJdGVtKTtcbiAgdmFyIHNoYXBlVHlwZSA9IGJhckl0ZW0uc2hhcGVUeXBlO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHZhciBzaGFwZSA9IGNvbmZpZy5zaGFwZTtcblxuICAgIGlmIChzaGFwZVR5cGUgPT09ICdsZWZ0RWNoZWxvbicpIHtcbiAgICAgIHNoYXBlID0gZ2V0U3RhcnRMZWZ0RWNoZWxvblNoYXBlKHNoYXBlLCBiYXJJdGVtKTtcbiAgICB9IGVsc2UgaWYgKHNoYXBlVHlwZSA9PT0gJ3JpZ2h0RWNoZWxvbicpIHtcbiAgICAgIHNoYXBlID0gZ2V0U3RhcnRSaWdodEVjaGVsb25TaGFwZShzaGFwZSwgYmFySXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNoYXBlID0gZ2V0U3RhcnROb3JtYWxCYXJTaGFwZShzaGFwZSwgYmFySXRlbSk7XG4gICAgfVxuXG4gICAgY29uZmlnLnNoYXBlID0gc2hhcGU7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRMZWZ0RWNoZWxvblNoYXBlKHNoYXBlLCBiYXJJdGVtKSB7XG4gIHZhciBheGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgc2hhcGUgPSAoMCwgX3V0aWwuZGVlcENsb25lKShzaGFwZSk7XG4gIHZhciBfc2hhcGUgPSBzaGFwZSxcbiAgICAgIHBvaW50cyA9IF9zaGFwZS5wb2ludHM7XG4gIHZhciBpbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgc3RhcnQgPSBwb2ludHNbMl1baW5kZXhdO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQpIHtcbiAgICByZXR1cm4gcG9pbnRbaW5kZXhdID0gc3RhcnQ7XG4gIH0pO1xuICByZXR1cm4gc2hhcGU7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UmlnaHRFY2hlbG9uU2hhcGUoc2hhcGUsIGJhckl0ZW0pIHtcbiAgdmFyIGF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICBzaGFwZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKHNoYXBlKTtcbiAgdmFyIF9zaGFwZTIgPSBzaGFwZSxcbiAgICAgIHBvaW50cyA9IF9zaGFwZTIucG9pbnRzO1xuICB2YXIgaW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIHN0YXJ0ID0gcG9pbnRzWzJdW2luZGV4XTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgcmV0dXJuIHBvaW50W2luZGV4XSA9IHN0YXJ0O1xuICB9KTtcbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydE5vcm1hbEJhclNoYXBlKHNoYXBlLCBiYXJJdGVtKSB7XG4gIHZhciBheGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgeSA9IHNoYXBlLnksXG4gICAgICB3ID0gc2hhcGUudyxcbiAgICAgIGggPSBzaGFwZS5oO1xuXG4gIGlmIChheGlzID09PSAneCcpIHtcbiAgICB3ID0gMDtcbiAgfSBlbHNlIHtcbiAgICB5ID0geSArIGg7XG4gICAgaCA9IDA7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHg6IHgsXG4gICAgeTogeSxcbiAgICB3OiB3LFxuICAgIGg6IGhcbiAgfTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlQmFyKGdyYXBocywgYmFySXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBuYW1lID0gZ2V0QmFyTmFtZShiYXJJdGVtKTtcblxuICBpZiAoZ3JhcGhzW2ldICYmIGdyYXBoc1tpXVswXS5uYW1lICE9PSBuYW1lKSB7XG4gICAgZ3JhcGhzW2ldLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gICAgfSk7XG4gICAgZ3JhcGhzW2ldID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMYWJlbENvbmZpZyhiYXJJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGJhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGJhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBiYXJJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldExhYmVsU2hhcGVzKGJhckl0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRMYWJlbFN0eWxlKGJhckl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGJhckl0ZW0ubGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlcyhiYXJJdGVtKSB7XG4gIHZhciBjb250ZW50cyA9IGdldEZvcm1hdHRlckxhYmVscyhiYXJJdGVtKTtcbiAgdmFyIHBvc2l0aW9uID0gZ2V0TGFiZWxzUG9zaXRpb24oYmFySXRlbSk7XG4gIHJldHVybiBwb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHBvcywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogcG9zLFxuICAgICAgY29udGVudDogY29udGVudHNbaV1cbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybWF0dGVyTGFiZWxzKGJhckl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBiYXJJdGVtLmRhdGEsXG4gICAgICBsYWJlbCA9IGJhckl0ZW0ubGFiZWw7XG4gIHZhciBmb3JtYXR0ZXIgPSBsYWJlbC5mb3JtYXR0ZXI7XG4gIGRhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ251bWJlcic7XG4gIH0pLm1hcChmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLnRvU3RyaW5nKCk7XG4gIH0pO1xuICBpZiAoIWZvcm1hdHRlcikgcmV0dXJuIGRhdGE7XG4gIHZhciB0eXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCBkKTtcbiAgfSk7XG4gIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQsIGkpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyKHtcbiAgICAgIHZhbHVlOiBkLFxuICAgICAgaW5kZXg6IGlcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbHNQb3NpdGlvbihiYXJJdGVtKSB7XG4gIHZhciBsYWJlbCA9IGJhckl0ZW0ubGFiZWwsXG4gICAgICBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zO1xuICB2YXIgcG9zaXRpb24gPSBsYWJlbC5wb3NpdGlvbixcbiAgICAgIG9mZnNldCA9IGxhYmVsLm9mZnNldDtcbiAgdmFyIGF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICByZXR1cm4gYmFyVmFsdWVBeGlzUG9zLm1hcChmdW5jdGlvbiAoX3JlZjEwLCBpKSB7XG4gICAgdmFyIF9yZWYxMSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTAsIDIpLFxuICAgICAgICBzdGFydCA9IF9yZWYxMVswXSxcbiAgICAgICAgZW5kID0gX3JlZjExWzFdO1xuXG4gICAgdmFyIGxhYmVsQXhpc1BvcyA9IGJhckxhYmVsQXhpc1Bvc1tpXTtcbiAgICB2YXIgcG9zID0gW2VuZCwgbGFiZWxBeGlzUG9zXTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHBvcyA9IFtzdGFydCwgbGFiZWxBeGlzUG9zXTtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICBwb3MgPSBbKHN0YXJ0ICsgZW5kKSAvIDIsIGxhYmVsQXhpc1Bvc107XG4gICAgfVxuXG4gICAgaWYgKGF4aXMgPT09ICd5JykgcG9zLnJldmVyc2UoKTtcbiAgICByZXR1cm4gZ2V0T2Zmc2V0ZWRQb2ludChwb3MsIG9mZnNldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRPZmZzZXRlZFBvaW50KF9yZWYxMiwgX3JlZjEzKSB7XG4gIHZhciBfcmVmMTQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEyLCAyKSxcbiAgICAgIHggPSBfcmVmMTRbMF0sXG4gICAgICB5ID0gX3JlZjE0WzFdO1xuXG4gIHZhciBfcmVmMTUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEzLCAyKSxcbiAgICAgIG94ID0gX3JlZjE1WzBdLFxuICAgICAgb3kgPSBfcmVmMTVbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUoYmFySXRlbSkge1xuICB2YXIgY29sb3IgPSBiYXJJdGVtLmNvbG9yLFxuICAgICAgc3R5bGUgPSBiYXJJdGVtLmxhYmVsLnN0eWxlLFxuICAgICAgZ2MgPSBiYXJJdGVtLmdyYWRpZW50LmNvbG9yO1xuICBpZiAoZ2MubGVuZ3RoKSBjb2xvciA9IGdjWzBdO1xuICBzdHlsZSA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgc3R5bGUpO1xuICByZXR1cm4gc3R5bGU7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nYXVnZSA9IGdhdWdlO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9nYXVnZSA9IHJlcXVpcmUoXCIuLi9jb25maWcvZ2F1Z2VcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBnYXVnZShjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgdmFyIGdhdWdlcyA9ICgwLCBfdXRpbDIuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX2dhdWdlLmdhdWdlQ29uZmlnLCAnZ2F1Z2UnKTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0NlbnRlcihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc1JhZGl1cyhnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RhdGFSYWRpdXNBbmRMaW5lV2lkdGgoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNEYXRhQW5nbGVzKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzRGF0YUdyYWRpZW50KGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzQXhpc1RpY2tQb3NpdGlvbihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0xhYmVsUG9zaXRpb25BbmRBbGlnbihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0xhYmVsRGF0YShnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RldGFpbHNQb3NpdGlvbihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RldGFpbHNDb250ZW50KGdhdWdlcywgY2hhcnQpO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VBeGlzVGljaycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEF4aXNUaWNrQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VBeGlzTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRBeGlzTGFiZWxDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZUJhY2tncm91bmRBcmMnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRCYWNrZ3JvdW5kQXJjQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0QmFja2dyb3VuZEFyY0NvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlQXJjJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXJjQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0QXJjQ29uZmlnLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlQXJjXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VQb2ludGVyJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0UG9pbnRlckNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBvaW50ZXJDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZURldGFpbHMnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXREZXRhaWxzQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzQ2VudGVyKGdhdWdlcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyO1xuICAgIGNlbnRlciA9IGNlbnRlci5tYXAoZnVuY3Rpb24gKHBvcywgaSkge1xuICAgICAgaWYgKHR5cGVvZiBwb3MgPT09ICdudW1iZXInKSByZXR1cm4gcG9zO1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBvcykgLyAxMDAgKiBhcmVhW2ldO1xuICAgIH0pO1xuICAgIGdhdWdlSXRlbS5jZW50ZXIgPSBjZW50ZXI7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzUmFkaXVzKGdhdWdlcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXJlYSkpIC8gMjtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciByYWRpdXMgPSBnYXVnZUl0ZW0ucmFkaXVzO1xuXG4gICAgaWYgKHR5cGVvZiByYWRpdXMgIT09ICdudW1iZXInKSB7XG4gICAgICByYWRpdXMgPSBwYXJzZUludChyYWRpdXMpIC8gMTAwICogbWF4UmFkaXVzO1xuICAgIH1cblxuICAgIGdhdWdlSXRlbS5yYWRpdXMgPSByYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzRGF0YVJhZGl1c0FuZExpbmVXaWR0aChnYXVnZXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFyZWEpKSAvIDI7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cyxcbiAgICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgICBhcmNMaW5lV2lkdGggPSBnYXVnZUl0ZW0uYXJjTGluZVdpZHRoO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGFyY1JhZGl1cyA9IGl0ZW0ucmFkaXVzLFxuICAgICAgICAgIGxpbmVXaWR0aCA9IGl0ZW0ubGluZVdpZHRoO1xuICAgICAgaWYgKCFhcmNSYWRpdXMpIGFyY1JhZGl1cyA9IHJhZGl1cztcbiAgICAgIGlmICh0eXBlb2YgYXJjUmFkaXVzICE9PSAnbnVtYmVyJykgYXJjUmFkaXVzID0gcGFyc2VJbnQoYXJjUmFkaXVzKSAvIDEwMCAqIG1heFJhZGl1cztcbiAgICAgIGl0ZW0ucmFkaXVzID0gYXJjUmFkaXVzO1xuICAgICAgaWYgKCFsaW5lV2lkdGgpIGxpbmVXaWR0aCA9IGFyY0xpbmVXaWR0aDtcbiAgICAgIGl0ZW0ubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0RhdGFBbmdsZXMoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIHN0YXJ0QW5nbGUgPSBnYXVnZUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGUsXG4gICAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgICAgbWluID0gZ2F1Z2VJdGVtLm1pbixcbiAgICAgICAgbWF4ID0gZ2F1Z2VJdGVtLm1heDtcbiAgICB2YXIgYW5nbGVNaW51cyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZTtcbiAgICB2YXIgdmFsdWVNaW51cyA9IG1heCAtIG1pbjtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW0udmFsdWU7XG4gICAgICB2YXIgaXRlbUFuZ2xlID0gTWF0aC5hYnMoKHZhbHVlIC0gbWluKSAvIHZhbHVlTWludXMgKiBhbmdsZU1pbnVzKTtcbiAgICAgIGl0ZW0uc3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGU7XG4gICAgICBpdGVtLmVuZEFuZ2xlID0gc3RhcnRBbmdsZSArIGl0ZW1BbmdsZTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEYXRhR3JhZGllbnQoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb2xvciA9IGl0ZW0uY29sb3IsXG4gICAgICAgICAgZ3JhZGllbnQgPSBpdGVtLmdyYWRpZW50O1xuICAgICAgaWYgKCFncmFkaWVudCB8fCAhZ3JhZGllbnQubGVuZ3RoKSBncmFkaWVudCA9IGNvbG9yO1xuICAgICAgaWYgKCEoZ3JhZGllbnQgaW5zdGFuY2VvZiBBcnJheSkpIGdyYWRpZW50ID0gW2dyYWRpZW50XTtcbiAgICAgIGl0ZW0uZ3JhZGllbnQgPSBncmFkaWVudDtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNBeGlzVGlja1Bvc2l0aW9uKGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gZ2F1Z2VJdGVtLmVuZEFuZ2xlLFxuICAgICAgICBzcGxpdE51bSA9IGdhdWdlSXRlbS5zcGxpdE51bSxcbiAgICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgICAgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cyxcbiAgICAgICAgYXJjTGluZVdpZHRoID0gZ2F1Z2VJdGVtLmFyY0xpbmVXaWR0aCxcbiAgICAgICAgYXhpc1RpY2sgPSBnYXVnZUl0ZW0uYXhpc1RpY2s7XG4gICAgdmFyIHRpY2tMZW5ndGggPSBheGlzVGljay50aWNrTGVuZ3RoLFxuICAgICAgICBsaW5lV2lkdGggPSBheGlzVGljay5zdHlsZS5saW5lV2lkdGg7XG4gICAgdmFyIGFuZ2xlcyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZTtcbiAgICB2YXIgb3V0ZXJSYWRpdXMgPSByYWRpdXMgLSBhcmNMaW5lV2lkdGggLyAyO1xuICAgIHZhciBpbm5lclJhZGl1cyA9IG91dGVyUmFkaXVzIC0gdGlja0xlbmd0aDtcbiAgICB2YXIgYW5nbGVHYXAgPSBhbmdsZXMgLyAoc3BsaXROdW0gLSAxKTtcbiAgICB2YXIgYXJjTGVuZ3RoID0gMiAqIE1hdGguUEkgKiByYWRpdXMgKiBhbmdsZXMgLyAoTWF0aC5QSSAqIDIpO1xuICAgIHZhciBvZmZzZXQgPSBNYXRoLmNlaWwobGluZVdpZHRoIC8gMikgLyBhcmNMZW5ndGggKiBhbmdsZXM7XG4gICAgZ2F1Z2VJdGVtLnRpY2tBbmdsZXMgPSBbXTtcbiAgICBnYXVnZUl0ZW0udGlja0lubmVyUmFkaXVzID0gW107XG4gICAgZ2F1Z2VJdGVtLnRpY2tQb3NpdGlvbiA9IG5ldyBBcnJheShzcGxpdE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgICAgdmFyIGFuZ2xlID0gc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogaTtcbiAgICAgIGlmIChpID09PSAwKSBhbmdsZSArPSBvZmZzZXQ7XG4gICAgICBpZiAoaSA9PT0gc3BsaXROdW0gLSAxKSBhbmdsZSAtPSBvZmZzZXQ7XG4gICAgICBnYXVnZUl0ZW0udGlja0FuZ2xlc1tpXSA9IGFuZ2xlO1xuICAgICAgZ2F1Z2VJdGVtLnRpY2tJbm5lclJhZGl1c1tpXSA9IGlubmVyUmFkaXVzO1xuICAgICAgcmV0dXJuIFtfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW291dGVyUmFkaXVzLCBhbmdsZV0pKSwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtpbm5lclJhZGl1cywgYW5nbGVdKSldO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0xhYmVsUG9zaXRpb25BbmRBbGlnbihnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgICAgdGlja0lubmVyUmFkaXVzID0gZ2F1Z2VJdGVtLnRpY2tJbm5lclJhZGl1cyxcbiAgICAgICAgdGlja0FuZ2xlcyA9IGdhdWdlSXRlbS50aWNrQW5nbGVzLFxuICAgICAgICBsYWJlbEdhcCA9IGdhdWdlSXRlbS5heGlzTGFiZWwubGFiZWxHYXA7XG4gICAgdmFyIHBvc2l0aW9uID0gdGlja0FuZ2xlcy5tYXAoZnVuY3Rpb24gKGFuZ2xlLCBpKSB7XG4gICAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFt0aWNrSW5uZXJSYWRpdXNbaV0gLSBsYWJlbEdhcCwgdGlja0FuZ2xlc1tpXV0pKTtcbiAgICB9KTtcbiAgICB2YXIgYWxpZ24gPSBwb3NpdGlvbi5tYXAoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBfcmVmMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjJbMF0sXG4gICAgICAgICAgeSA9IF9yZWYyWzFdO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0QWxpZ246IHggPiBjZW50ZXJbMF0gPyAncmlnaHQnIDogJ2xlZnQnLFxuICAgICAgICB0ZXh0QmFzZWxpbmU6IHkgPiBjZW50ZXJbMV0gPyAnYm90dG9tJyA6ICd0b3AnXG4gICAgICB9O1xuICAgIH0pO1xuICAgIGdhdWdlSXRlbS5sYWJlbFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgZ2F1Z2VJdGVtLmxhYmVsQWxpZ24gPSBhbGlnbjtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNMYWJlbERhdGEoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGF4aXNMYWJlbCA9IGdhdWdlSXRlbS5heGlzTGFiZWwsXG4gICAgICAgIG1pbiA9IGdhdWdlSXRlbS5taW4sXG4gICAgICAgIG1heCA9IGdhdWdlSXRlbS5tYXgsXG4gICAgICAgIHNwbGl0TnVtID0gZ2F1Z2VJdGVtLnNwbGl0TnVtO1xuICAgIHZhciBkYXRhID0gYXhpc0xhYmVsLmRhdGEsXG4gICAgICAgIGZvcm1hdHRlciA9IGF4aXNMYWJlbC5mb3JtYXR0ZXI7XG4gICAgdmFyIHZhbHVlR2FwID0gKG1heCAtIG1pbikgLyAoc3BsaXROdW0gLSAxKTtcbiAgICB2YXIgdmFsdWUgPSBuZXcgQXJyYXkoc3BsaXROdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChtaW4gKyB2YWx1ZUdhcCAqIGkpO1xuICAgIH0pO1xuICAgIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgICBkYXRhID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHZhbHVlLCBkYXRhKS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIHZhciBsYWJlbCA9IHY7XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBsYWJlbCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9Jywgdik7XG4gICAgICB9XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGxhYmVsID0gZm9ybWF0dGVyKHtcbiAgICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgICBpbmRleDogaVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH0pO1xuICAgIGF4aXNMYWJlbC5kYXRhID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEZXRhaWxzUG9zaXRpb24oZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgICAgZGV0YWlscyA9IGdhdWdlSXRlbS5kZXRhaWxzLFxuICAgICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyO1xuICAgIHZhciBwb3NpdGlvbiA9IGRldGFpbHMucG9zaXRpb24sXG4gICAgICAgIG9mZnNldCA9IGRldGFpbHMub2Zmc2V0O1xuICAgIHZhciBkZXRhaWxzUG9zaXRpb24gPSBkYXRhLm1hcChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICAgIHZhciBzdGFydEFuZ2xlID0gX3JlZjMuc3RhcnRBbmdsZSxcbiAgICAgICAgICBlbmRBbmdsZSA9IF9yZWYzLmVuZEFuZ2xlLFxuICAgICAgICAgIHJhZGl1cyA9IF9yZWYzLnJhZGl1cztcbiAgICAgIHZhciBwb2ludCA9IG51bGw7XG5cbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgcG9pbnQgPSBjZW50ZXI7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgIHBvaW50ID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtyYWRpdXMsIHN0YXJ0QW5nbGVdKSk7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAgICBwb2ludCA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzLCBlbmRBbmdsZV0pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldE9mZnNldGVkUG9pbnQocG9pbnQsIG9mZnNldCk7XG4gICAgfSk7XG4gICAgZ2F1Z2VJdGVtLmRldGFpbHNQb3NpdGlvbiA9IGRldGFpbHNQb3NpdGlvbjtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEZXRhaWxzQ29udGVudChnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgICBkZXRhaWxzID0gZ2F1Z2VJdGVtLmRldGFpbHM7XG4gICAgdmFyIGZvcm1hdHRlciA9IGRldGFpbHMuZm9ybWF0dGVyO1xuICAgIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgICB2YXIgY29udGVudHMgPSBkYXRhLm1hcChmdW5jdGlvbiAoZGF0YUl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gZGF0YUl0ZW0udmFsdWU7XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb250ZW50ID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCAne250fScpO1xuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKCd7bmFtZX0nLCBkYXRhSXRlbS5uYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIGNvbnRlbnQgPSBmb3JtYXR0ZXIoZGF0YUl0ZW0pO1xuICAgICAgcmV0dXJuIGNvbnRlbnQudG9TdHJpbmcoKTtcbiAgICB9KTtcbiAgICBnYXVnZUl0ZW0uZGV0YWlsc0NvbnRlbnQgPSBjb250ZW50cztcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGdldE9mZnNldGVkUG9pbnQoX3JlZjQsIF9yZWY1KSB7XG4gIHZhciBfcmVmNiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNCwgMiksXG4gICAgICB4ID0gX3JlZjZbMF0sXG4gICAgICB5ID0gX3JlZjZbMV07XG5cbiAgdmFyIF9yZWY3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1LCAyKSxcbiAgICAgIG94ID0gX3JlZjdbMF0sXG4gICAgICBveSA9IF9yZWY3WzFdO1xuXG4gIHJldHVybiBbeCArIG94LCB5ICsgb3ldO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzVGlja0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGdhdWdlSXRlbS50aWNrUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGdhdWdlSXRlbS5heGlzVGljay5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNUaWNrU2hhcGUoZ2F1Z2VJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRBeGlzVGlja1N0eWxlKGdhdWdlSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc1RpY2tTaGFwZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGdhdWdlSXRlbS50aWNrUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiB0aWNrUG9zaXRpb25baV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc1RpY2tTdHlsZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIHN0eWxlID0gZ2F1Z2VJdGVtLmF4aXNUaWNrLnN0eWxlO1xuICByZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbENvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGxhYmVsUG9zaXRpb24gPSBnYXVnZUl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICByZXR1cm4gbGFiZWxQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogZ2F1Z2VJdGVtLmF4aXNMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNMYWJlbFNoYXBlKGdhdWdlSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0QXhpc0xhYmVsU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxTaGFwZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGxhYmVsUG9zaXRpb24gPSBnYXVnZUl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uYXhpc0xhYmVsLmRhdGE7XG4gIHJldHVybiB7XG4gICAgY29udGVudDogZGF0YVtpXS50b1N0cmluZygpLFxuICAgIHBvc2l0aW9uOiBsYWJlbFBvc2l0aW9uW2ldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbFN0eWxlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgbGFiZWxBbGlnbiA9IGdhdWdlSXRlbS5sYWJlbEFsaWduLFxuICAgICAgYXhpc0xhYmVsID0gZ2F1Z2VJdGVtLmF4aXNMYWJlbDtcbiAgdmFyIHN0eWxlID0gYXhpc0xhYmVsLnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKF9vYmplY3RTcHJlYWQoe30sIGxhYmVsQWxpZ25baV0pLCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ2FyYycsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiBnYXVnZUl0ZW0uYmFja2dyb3VuZEFyYy5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldEdhdWdlQmFja2dyb3VuZEFyY1NoYXBlKGdhdWdlSXRlbSksXG4gICAgc3R5bGU6IGdldEdhdWdlQmFja2dyb3VuZEFyY1N0eWxlKGdhdWdlSXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQmFja2dyb3VuZEFyY1NoYXBlKGdhdWdlSXRlbSkge1xuICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGUsXG4gICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyLFxuICAgICAgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cztcbiAgcmV0dXJuIHtcbiAgICByeDogY2VudGVyWzBdLFxuICAgIHJ5OiBjZW50ZXJbMV0sXG4gICAgcjogcmFkaXVzLFxuICAgIHN0YXJ0QW5nbGU6IHN0YXJ0QW5nbGUsXG4gICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQmFja2dyb3VuZEFyY1N0eWxlKGdhdWdlSXRlbSkge1xuICB2YXIgYmFja2dyb3VuZEFyYyA9IGdhdWdlSXRlbS5iYWNrZ3JvdW5kQXJjLFxuICAgICAgYXJjTGluZVdpZHRoID0gZ2F1Z2VJdGVtLmFyY0xpbmVXaWR0aDtcbiAgdmFyIHN0eWxlID0gYmFja2dyb3VuZEFyYy5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgbGluZVdpZHRoOiBhcmNMaW5lV2lkdGhcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydEJhY2tncm91bmRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBjb25maWcgPSBnZXRCYWNrZ3JvdW5kQXJjQ29uZmlnKGdhdWdlSXRlbSlbMF07XG5cbiAgdmFyIHNoYXBlID0gX29iamVjdFNwcmVhZCh7fSwgY29uZmlnLnNoYXBlKTtcblxuICBzaGFwZS5lbmRBbmdsZSA9IGNvbmZpZy5zaGFwZS5zdGFydEFuZ2xlO1xuICBjb25maWcuc2hhcGUgPSBzaGFwZTtcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBnZXRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ2FnQXJjJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0R2F1Z2VBcmNTaGFwZShnYXVnZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEdhdWdlQXJjU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRHYXVnZUFyY1NoYXBlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgIGdyYWRpZW50RW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGU7XG4gIHZhciBfZGF0YSRpID0gZGF0YVtpXSxcbiAgICAgIHJhZGl1cyA9IF9kYXRhJGkucmFkaXVzLFxuICAgICAgc3RhcnRBbmdsZSA9IF9kYXRhJGkuc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gX2RhdGEkaS5lbmRBbmdsZSxcbiAgICAgIGxvY2FsR3JhZGllbnQgPSBfZGF0YSRpLmxvY2FsR3JhZGllbnQ7XG4gIGlmIChsb2NhbEdyYWRpZW50KSBncmFkaWVudEVuZEFuZ2xlID0gZW5kQW5nbGU7XG4gIHJldHVybiB7XG4gICAgcng6IGNlbnRlclswXSxcbiAgICByeTogY2VudGVyWzFdLFxuICAgIHI6IHJhZGl1cyxcbiAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlOiBlbmRBbmdsZSxcbiAgICBncmFkaWVudEVuZEFuZ2xlOiBncmFkaWVudEVuZEFuZ2xlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQXJjU3R5bGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBkYXRhSXRlbVN0eWxlID0gZ2F1Z2VJdGVtLmRhdGFJdGVtU3R5bGU7XG4gIHZhciBfZGF0YSRpMiA9IGRhdGFbaV0sXG4gICAgICBsaW5lV2lkdGggPSBfZGF0YSRpMi5saW5lV2lkdGgsXG4gICAgICBncmFkaWVudCA9IF9kYXRhJGkyLmdyYWRpZW50O1xuICBncmFkaWVudCA9IGdyYWRpZW50Lm1hcChmdW5jdGlvbiAoYykge1xuICAgIHJldHVybiAoMCwgX2NvbG9yLmdldFJnYmFWYWx1ZSkoYyk7XG4gIH0pO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aCxcbiAgICBncmFkaWVudDogZ3JhZGllbnRcbiAgfSwgZGF0YUl0ZW1TdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0QXJjQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgY29uZmlncyA9IGdldEFyY0NvbmZpZyhnYXVnZUl0ZW0pO1xuICBjb25maWdzLm1hcChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgdmFyIHNoYXBlID0gX29iamVjdFNwcmVhZCh7fSwgY29uZmlnLnNoYXBlKTtcblxuICAgIHNoYXBlLmVuZEFuZ2xlID0gY29uZmlnLnNoYXBlLnN0YXJ0QW5nbGU7XG4gICAgY29uZmlnLnNoYXBlID0gc2hhcGU7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlQXJjKGdyYXBoLCBjb25maWcpIHtcbiAgdmFyIGdyYXBoR3JhZGllbnQgPSBncmFwaC5zdHlsZS5ncmFkaWVudDtcbiAgdmFyIGNhY2hlTnVtID0gZ3JhcGhHcmFkaWVudC5sZW5ndGg7XG4gIHZhciBuZWVkTnVtID0gY29uZmlnLnN0eWxlLmdyYWRpZW50Lmxlbmd0aDtcblxuICBpZiAoY2FjaGVOdW0gPiBuZWVkTnVtKSB7XG4gICAgZ3JhcGhHcmFkaWVudC5zcGxpY2UobmVlZE51bSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxhc3QgPSBncmFwaEdyYWRpZW50LnNsaWNlKC0xKVswXTtcbiAgICBncmFwaEdyYWRpZW50LnB1c2guYXBwbHkoZ3JhcGhHcmFkaWVudCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXcgQXJyYXkobmVlZE51bSAtIGNhY2hlTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgICByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsYXN0KTtcbiAgICB9KSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXJDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiBnYXVnZUl0ZW0ucG9pbnRlci5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldFBvaW50ZXJTaGFwZShnYXVnZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRQb2ludGVyU3R5bGUoZ2F1Z2VJdGVtKSxcbiAgICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZm9vLCBncmFwaCkge1xuICAgICAgZ3JhcGguc3R5bGUuZ3JhcGhDZW50ZXIgPSBjZW50ZXI7XG4gICAgfVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRlclNoYXBlKGdhdWdlSXRlbSkge1xuICB2YXIgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IGdldFBvaW50ZXJQb2ludHMoY2VudGVyKSxcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVyU3R5bGUoZ2F1Z2VJdGVtKSB7XG4gIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGdhdWdlSXRlbS5lbmRBbmdsZSxcbiAgICAgIG1pbiA9IGdhdWdlSXRlbS5taW4sXG4gICAgICBtYXggPSBnYXVnZUl0ZW0ubWF4LFxuICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgcG9pbnRlciA9IGdhdWdlSXRlbS5wb2ludGVyLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcjtcbiAgdmFyIHZhbHVlSW5kZXggPSBwb2ludGVyLnZhbHVlSW5kZXgsXG4gICAgICBzdHlsZSA9IHBvaW50ZXIuc3R5bGU7XG4gIHZhciB2YWx1ZSA9IGRhdGFbdmFsdWVJbmRleF0gPyBkYXRhW3ZhbHVlSW5kZXhdLnZhbHVlIDogMDtcbiAgdmFyIGFuZ2xlID0gKHZhbHVlIC0gbWluKSAvIChtYXggLSBtaW4pICogKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSkgKyBzdGFydEFuZ2xlICsgTWF0aC5QSSAvIDI7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIHJvdGF0ZTogKDAsIF91dGlsMi5yYWRpYW5Ub0FuZ2xlKShhbmdsZSksXG4gICAgc2NhbGU6IFsxLCAxXSxcbiAgICBncmFwaENlbnRlcjogY2VudGVyXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRlclBvaW50cyhfcmVmOCkge1xuICB2YXIgX3JlZjkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgsIDIpLFxuICAgICAgeCA9IF9yZWY5WzBdLFxuICAgICAgeSA9IF9yZWY5WzFdO1xuXG4gIHZhciBwb2ludDEgPSBbeCwgeSAtIDQwXTtcbiAgdmFyIHBvaW50MiA9IFt4ICsgNSwgeV07XG4gIHZhciBwb2ludDMgPSBbeCwgeSArIDEwXTtcbiAgdmFyIHBvaW50NCA9IFt4IC0gNSwgeV07XG4gIHJldHVybiBbcG9pbnQxLCBwb2ludDIsIHBvaW50MywgcG9pbnQ0XTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQb2ludGVyQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlO1xuICB2YXIgY29uZmlnID0gZ2V0UG9pbnRlckNvbmZpZyhnYXVnZUl0ZW0pWzBdO1xuICBjb25maWcuc3R5bGUucm90YXRlID0gKDAsIF91dGlsMi5yYWRpYW5Ub0FuZ2xlKShzdGFydEFuZ2xlICsgTWF0aC5QSSAvIDIpO1xuICByZXR1cm4gW2NvbmZpZ107XG59XG5cbmZ1bmN0aW9uIGdldERldGFpbHNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBkZXRhaWxzUG9zaXRpb24gPSBnYXVnZUl0ZW0uZGV0YWlsc1Bvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHZhciB2aXNpYmxlID0gZ2F1Z2VJdGVtLmRldGFpbHMuc2hvdztcbiAgcmV0dXJuIGRldGFpbHNQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnbnVtYmVyVGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogdmlzaWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXREZXRhaWxzU2hhcGUoZ2F1Z2VJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXREZXRhaWxzU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXREZXRhaWxzU2hhcGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBkZXRhaWxzUG9zaXRpb24gPSBnYXVnZUl0ZW0uZGV0YWlsc1Bvc2l0aW9uLFxuICAgICAgZGV0YWlsc0NvbnRlbnQgPSBnYXVnZUl0ZW0uZGV0YWlsc0NvbnRlbnQsXG4gICAgICBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBkZXRhaWxzID0gZ2F1Z2VJdGVtLmRldGFpbHM7XG4gIHZhciBwb3NpdGlvbiA9IGRldGFpbHNQb3NpdGlvbltpXTtcbiAgdmFyIGNvbnRlbnQgPSBkZXRhaWxzQ29udGVudFtpXTtcbiAgdmFyIGRhdGFWYWx1ZSA9IGRhdGFbaV0udmFsdWU7XG4gIHZhciB0b0ZpeGVkID0gZGV0YWlscy52YWx1ZVRvRml4ZWQ7XG4gIHJldHVybiB7XG4gICAgbnVtYmVyOiBbZGF0YVZhbHVlXSxcbiAgICBjb250ZW50OiBjb250ZW50LFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICB0b0ZpeGVkOiB0b0ZpeGVkXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERldGFpbHNTdHlsZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGRldGFpbHMgPSBnYXVnZUl0ZW0uZGV0YWlscyxcbiAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YTtcbiAgdmFyIHN0eWxlID0gZGV0YWlscy5zdHlsZTtcbiAgdmFyIGNvbG9yID0gZGF0YVtpXS5jb2xvcjtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgc3R5bGUpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ3JpZCA9IGdyaWQ7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIGdyaWQoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBncmlkID0gb3B0aW9uLmdyaWQ7XG4gIGdyaWQgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy5ncmlkQ29uZmlnLCB0cnVlKSwgZ3JpZCB8fCB7fSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IFtncmlkXSxcbiAgICBrZXk6ICdncmlkJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0R3JpZENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0R3JpZENvbmZpZyhncmlkSXRlbSwgdXBkYXRlcikge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBncmlkSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ3JpZEl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBncmlkSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZSA9IGdldEdyaWRTaGFwZShncmlkSXRlbSwgdXBkYXRlcik7XG4gIHZhciBzdHlsZSA9IGdldEdyaWRTdHlsZShncmlkSXRlbSk7XG4gIHVwZGF0ZXIuY2hhcnQuZ3JpZEFyZWEgPSBfb2JqZWN0U3ByZWFkKHt9LCBzaGFwZSk7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdyZWN0JyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IHNoYXBlLFxuICAgIHN0eWxlOiBzdHlsZVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0R3JpZFNoYXBlKGdyaWRJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBfdXBkYXRlciRjaGFydCRyZW5kZXIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkodXBkYXRlci5jaGFydC5yZW5kZXIuYXJlYSwgMiksXG4gICAgICB3ID0gX3VwZGF0ZXIkY2hhcnQkcmVuZGVyWzBdLFxuICAgICAgaCA9IF91cGRhdGVyJGNoYXJ0JHJlbmRlclsxXTtcblxuICB2YXIgbGVmdCA9IGdldE51bWJlclZhbHVlKGdyaWRJdGVtLmxlZnQsIHcpO1xuICB2YXIgcmlnaHQgPSBnZXROdW1iZXJWYWx1ZShncmlkSXRlbS5yaWdodCwgdyk7XG4gIHZhciB0b3AgPSBnZXROdW1iZXJWYWx1ZShncmlkSXRlbS50b3AsIGgpO1xuICB2YXIgYm90dG9tID0gZ2V0TnVtYmVyVmFsdWUoZ3JpZEl0ZW0uYm90dG9tLCBoKTtcbiAgdmFyIHdpZHRoID0gdyAtIGxlZnQgLSByaWdodDtcbiAgdmFyIGhlaWdodCA9IGggLSB0b3AgLSBib3R0b207XG4gIHJldHVybiB7XG4gICAgeDogbGVmdCxcbiAgICB5OiB0b3AsXG4gICAgdzogd2lkdGgsXG4gICAgaDogaGVpZ2h0XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE51bWJlclZhbHVlKHZhbCwgYWxsKSB7XG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSByZXR1cm4gMDtcbiAgcmV0dXJuIGFsbCAqIHBhcnNlSW50KHZhbCkgLyAxMDA7XG59XG5cbmZ1bmN0aW9uIGdldEdyaWRTdHlsZShncmlkSXRlbSkge1xuICB2YXIgc3R5bGUgPSBncmlkSXRlbS5zdHlsZTtcbiAgcmV0dXJuIHN0eWxlO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWVyZ2VDb2xvclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbWVyZ2VDb2xvci5tZXJnZUNvbG9yO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInRpdGxlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF90aXRsZS50aXRsZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJncmlkXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9ncmlkLmdyaWQ7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiYXhpc1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy5heGlzO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImxpbmVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2xpbmUubGluZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJiYXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2Jhci5iYXI7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicGllXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9waWUucGllO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyQXhpc1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcmFkYXJBeGlzLnJhZGFyQXhpcztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJyYWRhclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcmFkYXIucmFkYXI7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2F1Z2VcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dhdWdlLmdhdWdlO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImxlZ2VuZFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGVnZW5kLmxlZ2VuZDtcbiAgfVxufSk7XG5cbnZhciBfbWVyZ2VDb2xvciA9IHJlcXVpcmUoXCIuL21lcmdlQ29sb3JcIik7XG5cbnZhciBfdGl0bGUgPSByZXF1aXJlKFwiLi90aXRsZVwiKTtcblxudmFyIF9ncmlkID0gcmVxdWlyZShcIi4vZ3JpZFwiKTtcblxudmFyIF9heGlzID0gcmVxdWlyZShcIi4vYXhpc1wiKTtcblxudmFyIF9saW5lID0gcmVxdWlyZShcIi4vbGluZVwiKTtcblxudmFyIF9iYXIgPSByZXF1aXJlKFwiLi9iYXJcIik7XG5cbnZhciBfcGllID0gcmVxdWlyZShcIi4vcGllXCIpO1xuXG52YXIgX3JhZGFyQXhpcyA9IHJlcXVpcmUoXCIuL3JhZGFyQXhpc1wiKTtcblxudmFyIF9yYWRhciA9IHJlcXVpcmUoXCIuL3JhZGFyXCIpO1xuXG52YXIgX2dhdWdlID0gcmVxdWlyZShcIi4vZ2F1Z2VcIik7XG5cbnZhciBfbGVnZW5kID0gcmVxdWlyZShcIi4vbGVnZW5kXCIpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMubGVnZW5kID0gbGVnZW5kO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gbGVnZW5kKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgbGVnZW5kID0gb3B0aW9uLmxlZ2VuZDtcblxuICBpZiAobGVnZW5kKSB7XG4gICAgbGVnZW5kID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKF9jb25maWcubGVnZW5kQ29uZmlnLCB0cnVlKSwgbGVnZW5kKTtcbiAgICBsZWdlbmQgPSBpbml0TGVnZW5kRGF0YShsZWdlbmQpO1xuICAgIGxlZ2VuZCA9IGZpbHRlckludmFsaWREYXRhKGxlZ2VuZCwgb3B0aW9uLCBjaGFydCk7XG4gICAgbGVnZW5kID0gY2FsY0xlZ2VuZFRleHRXaWR0aChsZWdlbmQsIGNoYXJ0KTtcbiAgICBsZWdlbmQgPSBjYWxjTGVnZW5kUG9zaXRpb24obGVnZW5kLCBjaGFydCk7XG4gICAgbGVnZW5kID0gW2xlZ2VuZF07XG4gIH0gZWxzZSB7XG4gICAgbGVnZW5kID0gW107XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsZWdlbmQsXG4gICAga2V5OiAnbGVnZW5kSWNvbicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEljb25Db25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxlZ2VuZCxcbiAgICBrZXk6ICdsZWdlbmRUZXh0JyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0VGV4dENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdExlZ2VuZERhdGEobGVnZW5kKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGE7XG4gIGxlZ2VuZC5kYXRhID0gZGF0YS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgaXRlbVR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShpdGVtKTtcblxuICAgIGlmIChpdGVtVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGl0ZW1cbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChpdGVtVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnJ1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gbGVnZW5kO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJJbnZhbGlkRGF0YShsZWdlbmQsIG9wdGlvbiwgY2hhcnQpIHtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIHZhciBsZWdlbmRTdGF0dXMgPSBjaGFydC5sZWdlbmRTdGF0dXM7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIG5hbWUgPSBpdGVtLm5hbWU7XG4gICAgdmFyIHJlc3VsdCA9IHNlcmllcy5maW5kKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICB2YXIgc24gPSBfcmVmLm5hbWU7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gc247XG4gICAgfSk7XG4gICAgaWYgKCFyZXN1bHQpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIWl0ZW0uY29sb3IpIGl0ZW0uY29sb3IgPSByZXN1bHQuY29sb3I7XG4gICAgaWYgKCFpdGVtLmljb24pIGl0ZW0uaWNvbiA9IHJlc3VsdC50eXBlO1xuICAgIHJldHVybiBpdGVtO1xuICB9KTtcbiAgaWYgKCFsZWdlbmRTdGF0dXMgfHwgbGVnZW5kU3RhdHVzLmxlbmd0aCAhPT0gbGVnZW5kLmRhdGEubGVuZ3RoKSBsZWdlbmRTdGF0dXMgPSBuZXcgQXJyYXkobGVnZW5kLmRhdGEubGVuZ3RoKS5maWxsKHRydWUpO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICByZXR1cm4gaXRlbS5zdGF0dXMgPSBsZWdlbmRTdGF0dXNbaV07XG4gIH0pO1xuICBsZWdlbmQuZGF0YSA9IGRhdGE7XG4gIGNoYXJ0LmxlZ2VuZFN0YXR1cyA9IGxlZ2VuZFN0YXR1cztcbiAgcmV0dXJuIGxlZ2VuZDtcbn1cblxuZnVuY3Rpb24gY2FsY0xlZ2VuZFRleHRXaWR0aChsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBjdHggPSBjaGFydC5yZW5kZXIuY3R4O1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgdGV4dFN0eWxlID0gbGVnZW5kLnRleHRTdHlsZSxcbiAgICAgIHRleHRVbnNlbGVjdGVkU3R5bGUgPSBsZWdlbmQudGV4dFVuc2VsZWN0ZWRTdHlsZTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIHN0YXR1cyA9IGl0ZW0uc3RhdHVzLFxuICAgICAgICBuYW1lID0gaXRlbS5uYW1lO1xuICAgIGl0ZW0udGV4dFdpZHRoID0gZ2V0VGV4dFdpZHRoKGN0eCwgbmFtZSwgc3RhdHVzID8gdGV4dFN0eWxlIDogdGV4dFVuc2VsZWN0ZWRTdHlsZSk7XG4gIH0pO1xuICByZXR1cm4gbGVnZW5kO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0V2lkdGgoY3R4LCB0ZXh0LCBzdHlsZSkge1xuICBjdHguZm9udCA9IGdldEZvbnRDb25maWcoc3R5bGUpO1xuICByZXR1cm4gY3R4Lm1lYXN1cmVUZXh0KHRleHQpLndpZHRoO1xufVxuXG5mdW5jdGlvbiBnZXRGb250Q29uZmlnKHN0eWxlKSB7XG4gIHZhciBmb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseSxcbiAgICAgIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemU7XG4gIHJldHVybiBcIlwiLmNvbmNhdChmb250U2l6ZSwgXCJweCBcIikuY29uY2F0KGZvbnRGYW1pbHkpO1xufVxuXG5mdW5jdGlvbiBjYWxjTGVnZW5kUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgb3JpZW50ID0gbGVnZW5kLm9yaWVudDtcblxuICBpZiAob3JpZW50ID09PSAndmVydGljYWwnKSB7XG4gICAgY2FsY1ZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBjaGFydCk7XG4gIH0gZWxzZSB7XG4gICAgY2FsY0hvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KTtcbiAgfVxuXG4gIHJldHVybiBsZWdlbmQ7XG59XG5cbmZ1bmN0aW9uIGNhbGNIb3Jpem9udGFsUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgaWNvbkhlaWdodCA9IGxlZ2VuZC5pY29uSGVpZ2h0LFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwO1xuICB2YXIgbGluZXMgPSBjYWxjRGVmYXVsdEhvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KTtcbiAgdmFyIHhPZmZzZXRzID0gbGluZXMubWFwKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgcmV0dXJuIGdldEhvcml6b250YWxYT2Zmc2V0KGxpbmUsIGxlZ2VuZCwgY2hhcnQpO1xuICB9KTtcbiAgdmFyIHlPZmZzZXQgPSBnZXRIb3Jpem9udGFsWU9mZnNldChsZWdlbmQsIGNoYXJ0KTtcbiAgdmFyIGFsaWduID0ge1xuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgbGluZXMuZm9yRWFjaChmdW5jdGlvbiAobGluZSwgaSkge1xuICAgIHJldHVybiBsaW5lLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBpY29uUG9zaXRpb24gPSBpdGVtLmljb25Qb3NpdGlvbixcbiAgICAgICAgICB0ZXh0UG9zaXRpb24gPSBpdGVtLnRleHRQb3NpdGlvbjtcbiAgICAgIHZhciB4T2Zmc2V0ID0geE9mZnNldHNbaV07XG4gICAgICB2YXIgcmVhbFlPZmZzZXQgPSB5T2Zmc2V0ICsgaSAqIChpdGVtR2FwICsgaWNvbkhlaWdodCk7XG4gICAgICBpdGVtLmljb25Qb3NpdGlvbiA9IG1lcmdlT2Zmc2V0KGljb25Qb3NpdGlvbiwgW3hPZmZzZXQsIHJlYWxZT2Zmc2V0XSk7XG4gICAgICBpdGVtLnRleHRQb3NpdGlvbiA9IG1lcmdlT2Zmc2V0KHRleHRQb3NpdGlvbiwgW3hPZmZzZXQsIHJlYWxZT2Zmc2V0XSk7XG4gICAgICBpdGVtLmFsaWduID0gYWxpZ247XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjRGVmYXVsdEhvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmQuaWNvbldpZHRoO1xuICB2YXIgdyA9IGNoYXJ0LnJlbmRlci5hcmVhWzBdO1xuICB2YXIgc3RhcnRJbmRleCA9IDA7XG4gIHZhciBsaW5lcyA9IFtbXV07XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHZhciBiZWZvcmVXaWR0aCA9IGdldEJlZm9yZVdpZHRoKHN0YXJ0SW5kZXgsIGksIGxlZ2VuZCk7XG4gICAgdmFyIGVuZFhQb3MgPSBiZWZvcmVXaWR0aCArIGljb25XaWR0aCArIDUgKyBpdGVtLnRleHRXaWR0aDtcblxuICAgIGlmIChlbmRYUG9zID49IHcpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSBpO1xuICAgICAgYmVmb3JlV2lkdGggPSBnZXRCZWZvcmVXaWR0aChzdGFydEluZGV4LCBpLCBsZWdlbmQpO1xuICAgICAgbGluZXMucHVzaChbXSk7XG4gICAgfVxuXG4gICAgaXRlbS5pY29uUG9zaXRpb24gPSBbYmVmb3JlV2lkdGgsIDBdO1xuICAgIGl0ZW0udGV4dFBvc2l0aW9uID0gW2JlZm9yZVdpZHRoICsgaWNvbldpZHRoICsgNSwgMF07XG4gICAgbGluZXMuc2xpY2UoLTEpWzBdLnB1c2goaXRlbSk7XG4gIH0pO1xuICByZXR1cm4gbGluZXM7XG59XG5cbmZ1bmN0aW9uIGdldEJlZm9yZVdpZHRoKHN0YXJ0SW5kZXgsIGN1cnJlbnRJbmRleCwgbGVnZW5kKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmQuaWNvbldpZHRoLFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwO1xuICB2YXIgYmVmb3JlSXRlbSA9IGRhdGEuc2xpY2Uoc3RhcnRJbmRleCwgY3VycmVudEluZGV4KTtcbiAgcmV0dXJuICgwLCBfdXRpbDIubXVsQWRkKShiZWZvcmVJdGVtLm1hcChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgdGV4dFdpZHRoID0gX3JlZjIudGV4dFdpZHRoO1xuICAgIHJldHVybiB0ZXh0V2lkdGg7XG4gIH0pKSArIChjdXJyZW50SW5kZXggLSBzdGFydEluZGV4KSAqIChpdGVtR2FwICsgNSArIGljb25XaWR0aCk7XG59XG5cbmZ1bmN0aW9uIGdldEhvcml6b250YWxYT2Zmc2V0KGRhdGEsIGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGxlZnQgPSBsZWdlbmQubGVmdCxcbiAgICAgIHJpZ2h0ID0gbGVnZW5kLnJpZ2h0LFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kLmljb25XaWR0aCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcDtcbiAgdmFyIHcgPSBjaGFydC5yZW5kZXIuYXJlYVswXTtcbiAgdmFyIGRhdGFOdW0gPSBkYXRhLmxlbmd0aDtcbiAgdmFyIGFsbFdpZHRoID0gKDAsIF91dGlsMi5tdWxBZGQpKGRhdGEubWFwKGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciB0ZXh0V2lkdGggPSBfcmVmMy50ZXh0V2lkdGg7XG4gICAgcmV0dXJuIHRleHRXaWR0aDtcbiAgfSkpICsgZGF0YU51bSAqICg1ICsgaWNvbldpZHRoKSArIChkYXRhTnVtIC0gMSkgKiBpdGVtR2FwO1xuICB2YXIgaG9yaXpvbnRhbCA9IFtsZWZ0LCByaWdodF0uZmluZEluZGV4KGZ1bmN0aW9uIChwb3MpIHtcbiAgICByZXR1cm4gcG9zICE9PSAnYXV0byc7XG4gIH0pO1xuXG4gIGlmIChob3Jpem9udGFsID09PSAtMSkge1xuICAgIHJldHVybiAodyAtIGFsbFdpZHRoKSAvIDI7XG4gIH0gZWxzZSBpZiAoaG9yaXpvbnRhbCA9PT0gMCkge1xuICAgIGlmICh0eXBlb2YgbGVmdCA9PT0gJ251bWJlcicpIHJldHVybiBsZWZ0O1xuICAgIHJldHVybiBwYXJzZUludChsZWZ0KSAvIDEwMCAqIHc7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiByaWdodCAhPT0gJ251bWJlcicpIHJpZ2h0ID0gcGFyc2VJbnQocmlnaHQpIC8gMTAwICogdztcbiAgICByZXR1cm4gdyAtIChhbGxXaWR0aCArIHJpZ2h0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRIb3Jpem9udGFsWU9mZnNldChsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciB0b3AgPSBsZWdlbmQudG9wLFxuICAgICAgYm90dG9tID0gbGVnZW5kLmJvdHRvbSxcbiAgICAgIGljb25IZWlnaHQgPSBsZWdlbmQuaWNvbkhlaWdodDtcbiAgdmFyIGggPSBjaGFydC5yZW5kZXIuYXJlYVsxXTtcbiAgdmFyIHZlcnRpY2FsID0gW3RvcCwgYm90dG9tXS5maW5kSW5kZXgoZnVuY3Rpb24gKHBvcykge1xuICAgIHJldHVybiBwb3MgIT09ICdhdXRvJztcbiAgfSk7XG4gIHZhciBoYWxmSWNvbkhlaWdodCA9IGljb25IZWlnaHQgLyAyO1xuXG4gIGlmICh2ZXJ0aWNhbCA9PT0gLTEpIHtcbiAgICB2YXIgX2NoYXJ0JGdyaWRBcmVhID0gY2hhcnQuZ3JpZEFyZWEsXG4gICAgICAgIHkgPSBfY2hhcnQkZ3JpZEFyZWEueSxcbiAgICAgICAgaGVpZ2h0ID0gX2NoYXJ0JGdyaWRBcmVhLmg7XG4gICAgcmV0dXJuIHkgKyBoZWlnaHQgKyA0NSAtIGhhbGZJY29uSGVpZ2h0O1xuICB9IGVsc2UgaWYgKHZlcnRpY2FsID09PSAwKSB7XG4gICAgaWYgKHR5cGVvZiB0b3AgPT09ICdudW1iZXInKSByZXR1cm4gdG9wIC0gaGFsZkljb25IZWlnaHQ7XG4gICAgcmV0dXJuIHBhcnNlSW50KHRvcCkgLyAxMDAgKiBoIC0gaGFsZkljb25IZWlnaHQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBib3R0b20gIT09ICdudW1iZXInKSBib3R0b20gPSBwYXJzZUludChib3R0b20pIC8gMTAwICogaDtcbiAgICByZXR1cm4gaCAtIGJvdHRvbSAtIGhhbGZJY29uSGVpZ2h0O1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlT2Zmc2V0KF9yZWY0LCBfcmVmNSkge1xuICB2YXIgX3JlZjYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjQsIDIpLFxuICAgICAgeCA9IF9yZWY2WzBdLFxuICAgICAgeSA9IF9yZWY2WzFdO1xuXG4gIHZhciBfcmVmNyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNSwgMiksXG4gICAgICBveCA9IF9yZWY3WzBdLFxuICAgICAgb3kgPSBfcmVmN1sxXTtcblxuICByZXR1cm4gW3ggKyBveCwgeSArIG95XTtcbn1cblxuZnVuY3Rpb24gY2FsY1ZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgX2dldFZlcnRpY2FsWE9mZnNldCA9IGdldFZlcnRpY2FsWE9mZnNldChsZWdlbmQsIGNoYXJ0KSxcbiAgICAgIF9nZXRWZXJ0aWNhbFhPZmZzZXQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRWZXJ0aWNhbFhPZmZzZXQsIDIpLFxuICAgICAgaXNSaWdodCA9IF9nZXRWZXJ0aWNhbFhPZmZzZXQyWzBdLFxuICAgICAgeE9mZnNldCA9IF9nZXRWZXJ0aWNhbFhPZmZzZXQyWzFdO1xuXG4gIHZhciB5T2Zmc2V0ID0gZ2V0VmVydGljYWxZT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpO1xuICBjYWxjRGVmYXVsdFZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBpc1JpZ2h0KTtcbiAgdmFyIGFsaWduID0ge1xuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgbGVnZW5kLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciB0ZXh0UG9zaXRpb24gPSBpdGVtLnRleHRQb3NpdGlvbixcbiAgICAgICAgaWNvblBvc2l0aW9uID0gaXRlbS5pY29uUG9zaXRpb247XG4gICAgaXRlbS50ZXh0UG9zaXRpb24gPSBtZXJnZU9mZnNldCh0ZXh0UG9zaXRpb24sIFt4T2Zmc2V0LCB5T2Zmc2V0XSk7XG4gICAgaXRlbS5pY29uUG9zaXRpb24gPSBtZXJnZU9mZnNldChpY29uUG9zaXRpb24sIFt4T2Zmc2V0LCB5T2Zmc2V0XSk7XG4gICAgaXRlbS5hbGlnbiA9IGFsaWduO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VmVydGljYWxYT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGxlZnQgPSBsZWdlbmQubGVmdCxcbiAgICAgIHJpZ2h0ID0gbGVnZW5kLnJpZ2h0O1xuICB2YXIgdyA9IGNoYXJ0LnJlbmRlci5hcmVhWzBdO1xuICB2YXIgaG9yaXpvbnRhbCA9IFtsZWZ0LCByaWdodF0uZmluZEluZGV4KGZ1bmN0aW9uIChwb3MpIHtcbiAgICByZXR1cm4gcG9zICE9PSAnYXV0byc7XG4gIH0pO1xuXG4gIGlmIChob3Jpem9udGFsID09PSAtMSkge1xuICAgIHJldHVybiBbdHJ1ZSwgdyAtIDEwXTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb2Zmc2V0ID0gW2xlZnQsIHJpZ2h0XVtob3Jpem9udGFsXTtcbiAgICBpZiAodHlwZW9mIG9mZnNldCAhPT0gJ251bWJlcicpIG9mZnNldCA9IHBhcnNlSW50KG9mZnNldCkgLyAxMDAgKiB3O1xuICAgIHJldHVybiBbQm9vbGVhbihob3Jpem9udGFsKSwgb2Zmc2V0XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWZXJ0aWNhbFlPZmZzZXQobGVnZW5kLCBjaGFydCkge1xuICB2YXIgaWNvbkhlaWdodCA9IGxlZ2VuZC5pY29uSGVpZ2h0LFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwLFxuICAgICAgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgdG9wID0gbGVnZW5kLnRvcCxcbiAgICAgIGJvdHRvbSA9IGxlZ2VuZC5ib3R0b207XG4gIHZhciBoID0gY2hhcnQucmVuZGVyLmFyZWFbMV07XG4gIHZhciBkYXRhTnVtID0gZGF0YS5sZW5ndGg7XG4gIHZhciBhbGxIZWlnaHQgPSBkYXRhTnVtICogaWNvbkhlaWdodCArIChkYXRhTnVtIC0gMSkgKiBpdGVtR2FwO1xuICB2YXIgdmVydGljYWwgPSBbdG9wLCBib3R0b21dLmZpbmRJbmRleChmdW5jdGlvbiAocG9zKSB7XG4gICAgcmV0dXJuIHBvcyAhPT0gJ2F1dG8nO1xuICB9KTtcblxuICBpZiAodmVydGljYWwgPT09IC0xKSB7XG4gICAgcmV0dXJuIChoIC0gYWxsSGVpZ2h0KSAvIDI7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG9mZnNldCA9IFt0b3AsIGJvdHRvbV1bdmVydGljYWxdO1xuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ICE9PSAnbnVtYmVyJykgb2Zmc2V0ID0gcGFyc2VJbnQob2Zmc2V0KSAvIDEwMCAqIGg7XG4gICAgaWYgKHZlcnRpY2FsID09PSAxKSBvZmZzZXQgPSBoIC0gb2Zmc2V0IC0gYWxsSGVpZ2h0O1xuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FsY0RlZmF1bHRWZXJ0aWNhbFBvc2l0aW9uKGxlZ2VuZCwgaXNSaWdodCkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kLmljb25XaWR0aCxcbiAgICAgIGljb25IZWlnaHQgPSBsZWdlbmQuaWNvbkhlaWdodCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcDtcbiAgdmFyIGhhbGZJY29uSGVpZ2h0ID0gaWNvbkhlaWdodCAvIDI7XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHZhciB0ZXh0V2lkdGggPSBpdGVtLnRleHRXaWR0aDtcbiAgICB2YXIgeVBvcyA9IChpY29uSGVpZ2h0ICsgaXRlbUdhcCkgKiBpICsgaGFsZkljb25IZWlnaHQ7XG4gICAgdmFyIGljb25YUG9zID0gaXNSaWdodCA/IDAgLSBpY29uV2lkdGggOiAwO1xuICAgIHZhciB0ZXh0WHBvcyA9IGlzUmlnaHQgPyBpY29uWFBvcyAtIDUgLSB0ZXh0V2lkdGggOiBpY29uV2lkdGggKyA1O1xuICAgIGl0ZW0uaWNvblBvc2l0aW9uID0gW2ljb25YUG9zLCB5UG9zXTtcbiAgICBpdGVtLnRleHRQb3NpdGlvbiA9IFt0ZXh0WHBvcywgeVBvc107XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRJY29uQ29uZmlnKGxlZ2VuZEl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmRJdGVtLmRhdGEsXG4gICAgICBzZWxlY3RBYmxlID0gbGVnZW5kSXRlbS5zZWxlY3RBYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBsZWdlbmRJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsZWdlbmRJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGVnZW5kSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHJldHVybiAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHtcbiAgICAgIG5hbWU6IGl0ZW0uaWNvbiA9PT0gJ2xpbmUnID8gJ2xpbmVJY29uJyA6ICdyZWN0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBsZWdlbmRJdGVtLnNob3csXG4gICAgICBob3Zlcjogc2VsZWN0QWJsZSxcbiAgICAgIGNsaWNrOiBzZWxlY3RBYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEljb25TaGFwZShsZWdlbmRJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRJY29uU3R5bGUobGVnZW5kSXRlbSwgaSlcbiAgICB9LCBcImNsaWNrXCIsIGNyZWF0ZUNsaWNrQ2FsbEJhY2sobGVnZW5kSXRlbSwgaSwgdXBkYXRlcikpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvblNoYXBlKGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmRJdGVtLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmRJdGVtLmljb25XaWR0aCxcbiAgICAgIGljb25IZWlnaHQgPSBsZWdlbmRJdGVtLmljb25IZWlnaHQ7XG5cbiAgdmFyIF9kYXRhJGkkaWNvblBvc2l0aW9uID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGRhdGFbaV0uaWNvblBvc2l0aW9uLCAyKSxcbiAgICAgIHggPSBfZGF0YSRpJGljb25Qb3NpdGlvblswXSxcbiAgICAgIHkgPSBfZGF0YSRpJGljb25Qb3NpdGlvblsxXTtcblxuICB2YXIgaGFsZkljb25IZWlnaHQgPSBpY29uSGVpZ2h0IC8gMjtcbiAgcmV0dXJuIHtcbiAgICB4OiB4LFxuICAgIHk6IHkgLSBoYWxmSWNvbkhlaWdodCxcbiAgICB3OiBpY29uV2lkdGgsXG4gICAgaDogaWNvbkhlaWdodFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRJY29uU3R5bGUobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZEl0ZW0uZGF0YSxcbiAgICAgIGljb25TdHlsZSA9IGxlZ2VuZEl0ZW0uaWNvblN0eWxlLFxuICAgICAgaWNvblVuc2VsZWN0ZWRTdHlsZSA9IGxlZ2VuZEl0ZW0uaWNvblVuc2VsZWN0ZWRTdHlsZTtcbiAgdmFyIF9kYXRhJGkgPSBkYXRhW2ldLFxuICAgICAgc3RhdHVzID0gX2RhdGEkaS5zdGF0dXMsXG4gICAgICBjb2xvciA9IF9kYXRhJGkuY29sb3I7XG4gIHZhciBzdHlsZSA9IHN0YXR1cyA/IGljb25TdHlsZSA6IGljb25VbnNlbGVjdGVkU3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dENvbmZpZyhsZWdlbmRJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kSXRlbS5kYXRhLFxuICAgICAgc2VsZWN0QWJsZSA9IGxlZ2VuZEl0ZW0uc2VsZWN0QWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gbGVnZW5kSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGVnZW5kSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGxlZ2VuZEl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogbGVnZW5kSXRlbS5zaG93LFxuICAgICAgaG92ZXI6IHNlbGVjdEFibGUsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBob3ZlclJlY3Q6IGdldFRleHRIb3ZlclJlY3QobGVnZW5kSXRlbSwgaSksXG4gICAgICBzaGFwZTogZ2V0VGV4dFNoYXBlKGxlZ2VuZEl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldFRleHRTdHlsZShsZWdlbmRJdGVtLCBpKSxcbiAgICAgIGNsaWNrOiBjcmVhdGVDbGlja0NhbGxCYWNrKGxlZ2VuZEl0ZW0sIGksIHVwZGF0ZXIpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRleHRTaGFwZShsZWdlbmRJdGVtLCBpKSB7XG4gIHZhciBfbGVnZW5kSXRlbSRkYXRhJGkgPSBsZWdlbmRJdGVtLmRhdGFbaV0sXG4gICAgICB0ZXh0UG9zaXRpb24gPSBfbGVnZW5kSXRlbSRkYXRhJGkudGV4dFBvc2l0aW9uLFxuICAgICAgbmFtZSA9IF9sZWdlbmRJdGVtJGRhdGEkaS5uYW1lO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IG5hbWUsXG4gICAgcG9zaXRpb246IHRleHRQb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0U3R5bGUobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgdGV4dFN0eWxlID0gbGVnZW5kSXRlbS50ZXh0U3R5bGUsXG4gICAgICB0ZXh0VW5zZWxlY3RlZFN0eWxlID0gbGVnZW5kSXRlbS50ZXh0VW5zZWxlY3RlZFN0eWxlO1xuICB2YXIgX2xlZ2VuZEl0ZW0kZGF0YSRpMiA9IGxlZ2VuZEl0ZW0uZGF0YVtpXSxcbiAgICAgIHN0YXR1cyA9IF9sZWdlbmRJdGVtJGRhdGEkaTIuc3RhdHVzLFxuICAgICAgYWxpZ24gPSBfbGVnZW5kSXRlbSRkYXRhJGkyLmFsaWduO1xuICB2YXIgc3R5bGUgPSBzdGF0dXMgPyB0ZXh0U3R5bGUgOiB0ZXh0VW5zZWxlY3RlZFN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKHN0eWxlLCB0cnVlKSwgYWxpZ24pO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0SG92ZXJSZWN0KGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIHRleHRTdHlsZSA9IGxlZ2VuZEl0ZW0udGV4dFN0eWxlLFxuICAgICAgdGV4dFVuc2VsZWN0ZWRTdHlsZSA9IGxlZ2VuZEl0ZW0udGV4dFVuc2VsZWN0ZWRTdHlsZTtcblxuICB2YXIgX2xlZ2VuZEl0ZW0kZGF0YSRpMyA9IGxlZ2VuZEl0ZW0uZGF0YVtpXSxcbiAgICAgIHN0YXR1cyA9IF9sZWdlbmRJdGVtJGRhdGEkaTMuc3RhdHVzLFxuICAgICAgX2xlZ2VuZEl0ZW0kZGF0YSRpMyR0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9sZWdlbmRJdGVtJGRhdGEkaTMudGV4dFBvc2l0aW9uLCAyKSxcbiAgICAgIHggPSBfbGVnZW5kSXRlbSRkYXRhJGkzJHRbMF0sXG4gICAgICB5ID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMyR0WzFdLFxuICAgICAgdGV4dFdpZHRoID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMy50ZXh0V2lkdGg7XG5cbiAgdmFyIHN0eWxlID0gc3RhdHVzID8gdGV4dFN0eWxlIDogdGV4dFVuc2VsZWN0ZWRTdHlsZTtcbiAgdmFyIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemU7XG4gIHJldHVybiBbeCwgeSAtIGZvbnRTaXplIC8gMiwgdGV4dFdpZHRoLCBmb250U2l6ZV07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNsaWNrQ2FsbEJhY2sobGVnZW5kSXRlbSwgaW5kZXgsIHVwZGF0ZXIpIHtcbiAgdmFyIG5hbWUgPSBsZWdlbmRJdGVtLmRhdGFbaW5kZXhdLm5hbWU7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF91cGRhdGVyJGNoYXJ0ID0gdXBkYXRlci5jaGFydCxcbiAgICAgICAgbGVnZW5kU3RhdHVzID0gX3VwZGF0ZXIkY2hhcnQubGVnZW5kU3RhdHVzLFxuICAgICAgICBvcHRpb24gPSBfdXBkYXRlciRjaGFydC5vcHRpb247XG4gICAgdmFyIHN0YXR1cyA9ICFsZWdlbmRTdGF0dXNbaW5kZXhdO1xuICAgIHZhciBjaGFuZ2UgPSBvcHRpb24uc2VyaWVzLmZpbmQoZnVuY3Rpb24gKF9yZWY5KSB7XG4gICAgICB2YXIgc24gPSBfcmVmOS5uYW1lO1xuICAgICAgcmV0dXJuIHNuID09PSBuYW1lO1xuICAgIH0pO1xuICAgIGNoYW5nZS5zaG93ID0gc3RhdHVzO1xuICAgIGxlZ2VuZFN0YXR1c1tpbmRleF0gPSBzdGF0dXM7XG4gICAgdXBkYXRlci5jaGFydC5zZXRPcHRpb24ob3B0aW9uKTtcbiAgfTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmxpbmUgPSBsaW5lO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX2JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbnZhciBwb2x5bGluZVRvQmV6aWVyQ3VydmUgPSBfYmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdLnBvbHlsaW5lVG9CZXppZXJDdXJ2ZSxcbiAgICBnZXRCZXppZXJDdXJ2ZUxlbmd0aCA9IF9iZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl0uZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG5cbmZ1bmN0aW9uIGxpbmUoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciB4QXhpcyA9IG9wdGlvbi54QXhpcyxcbiAgICAgIHlBeGlzID0gb3B0aW9uLnlBeGlzLFxuICAgICAgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgdmFyIGxpbmVzID0gW107XG5cbiAgaWYgKHhBeGlzICYmIHlBeGlzICYmIHNlcmllcykge1xuICAgIGxpbmVzID0gKDAsIF91dGlsLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9jb25maWcubGluZUNvbmZpZywgJ2xpbmUnKTtcbiAgICBsaW5lcyA9IGNhbGNMaW5lc1Bvc2l0aW9uKGxpbmVzLCBjaGFydCk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lQXJlYScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExpbmVBcmVhQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0TGluZUFyZWFDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVMaW5lQW5kQXJlYSxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZUxpbmVBbmRBcmVhXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGluZUNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydExpbmVDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVMaW5lQW5kQXJlYSxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZUxpbmVBbmRBcmVhXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lUG9pbnQnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRQb2ludENvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBvaW50Q29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMYWJlbENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0xpbmVzUG9zaXRpb24obGluZXMsIGNoYXJ0KSB7XG4gIHZhciBheGlzRGF0YSA9IGNoYXJ0LmF4aXNEYXRhO1xuICByZXR1cm4gbGluZXMubWFwKGZ1bmN0aW9uIChsaW5lSXRlbSkge1xuICAgIHZhciBsaW5lRGF0YSA9ICgwLCBfdXRpbC5tZXJnZVNhbWVTdGFja0RhdGEpKGxpbmVJdGVtLCBsaW5lcyk7XG4gICAgbGluZURhdGEgPSBtZXJnZU5vbk51bWJlcihsaW5lSXRlbSwgbGluZURhdGEpO1xuICAgIHZhciBsaW5lQXhpcyA9IGdldExpbmVBeGlzKGxpbmVJdGVtLCBheGlzRGF0YSk7XG4gICAgdmFyIGxpbmVQb3NpdGlvbiA9IGdldExpbmVQb3NpdGlvbihsaW5lRGF0YSwgbGluZUF4aXMpO1xuICAgIHZhciBsaW5lRmlsbEJvdHRvbVBvcyA9IGdldExpbmVGaWxsQm90dG9tUG9zKGxpbmVBeGlzKTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgbGluZUl0ZW0sIHtcbiAgICAgIGxpbmVQb3NpdGlvbjogbGluZVBvc2l0aW9uLmZpbHRlcihmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH0pLFxuICAgICAgbGluZUZpbGxCb3R0b21Qb3M6IGxpbmVGaWxsQm90dG9tUG9zXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtZXJnZU5vbk51bWJlcihsaW5lSXRlbSwgbGluZURhdGEpIHtcbiAgdmFyIGRhdGEgPSBsaW5lSXRlbS5kYXRhO1xuICByZXR1cm4gbGluZURhdGEubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBkYXRhW2ldID09PSAnbnVtYmVyJyA/IHYgOiBudWxsO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUF4aXMobGluZSwgYXhpc0RhdGEpIHtcbiAgdmFyIHhBeGlzSW5kZXggPSBsaW5lLnhBeGlzSW5kZXgsXG4gICAgICB5QXhpc0luZGV4ID0gbGluZS55QXhpc0luZGV4O1xuICB2YXIgeEF4aXMgPSBheGlzRGF0YS5maW5kKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmLmF4aXMsXG4gICAgICAgIGluZGV4ID0gX3JlZi5pbmRleDtcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3gnICYmIGluZGV4ID09PSB4QXhpc0luZGV4O1xuICB9KTtcbiAgdmFyIHlBeGlzID0gYXhpc0RhdGEuZmluZChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYyLmF4aXMsXG4gICAgICAgIGluZGV4ID0gX3JlZjIuaW5kZXg7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd5JyAmJiBpbmRleCA9PT0geUF4aXNJbmRleDtcbiAgfSk7XG4gIHJldHVybiBbeEF4aXMsIHlBeGlzXTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZVBvc2l0aW9uKGxpbmVEYXRhLCBsaW5lQXhpcykge1xuICB2YXIgdmFsdWVBeGlzSW5kZXggPSBsaW5lQXhpcy5maW5kSW5kZXgoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmMy5kYXRhO1xuICAgIHJldHVybiBkYXRhID09PSAndmFsdWUnO1xuICB9KTtcbiAgdmFyIHZhbHVlQXhpcyA9IGxpbmVBeGlzW3ZhbHVlQXhpc0luZGV4XTtcbiAgdmFyIGxhYmVsQXhpcyA9IGxpbmVBeGlzWzEgLSB2YWx1ZUF4aXNJbmRleF07XG4gIHZhciBsaW5lUG9zaXRpb24gPSB2YWx1ZUF4aXMubGluZVBvc2l0aW9uLFxuICAgICAgYXhpcyA9IHZhbHVlQXhpcy5heGlzO1xuICB2YXIgdGlja1Bvc2l0aW9uID0gbGFiZWxBeGlzLnRpY2tQb3NpdGlvbjtcbiAgdmFyIHRpY2tOdW0gPSB0aWNrUG9zaXRpb24ubGVuZ3RoO1xuICB2YXIgdmFsdWVBeGlzUG9zSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIHZhbHVlQXhpc1N0YXJ0UG9zID0gbGluZVBvc2l0aW9uWzBdW3ZhbHVlQXhpc1Bvc0luZGV4XTtcbiAgdmFyIHZhbHVlQXhpc0VuZFBvcyA9IGxpbmVQb3NpdGlvblsxXVt2YWx1ZUF4aXNQb3NJbmRleF07XG4gIHZhciB2YWx1ZUF4aXNQb3NNaW51cyA9IHZhbHVlQXhpc0VuZFBvcyAtIHZhbHVlQXhpc1N0YXJ0UG9zO1xuICB2YXIgbWF4VmFsdWUgPSB2YWx1ZUF4aXMubWF4VmFsdWUsXG4gICAgICBtaW5WYWx1ZSA9IHZhbHVlQXhpcy5taW5WYWx1ZTtcbiAgdmFyIHZhbHVlTWludXMgPSBtYXhWYWx1ZSAtIG1pblZhbHVlO1xuICB2YXIgcG9zaXRpb24gPSBuZXcgQXJyYXkodGlja051bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHZhciB2ID0gbGluZURhdGFbaV07XG4gICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykgcmV0dXJuIG51bGw7XG4gICAgdmFyIHZhbHVlUGVyY2VudCA9ICh2IC0gbWluVmFsdWUpIC8gdmFsdWVNaW51cztcbiAgICBpZiAodmFsdWVNaW51cyA9PT0gMCkgdmFsdWVQZXJjZW50ID0gMDtcbiAgICByZXR1cm4gdmFsdWVQZXJjZW50ICogdmFsdWVBeGlzUG9zTWludXMgKyB2YWx1ZUF4aXNTdGFydFBvcztcbiAgfSk7XG4gIHJldHVybiBwb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHZQb3MsIGkpIHtcbiAgICBpZiAoaSA+PSB0aWNrTnVtIHx8IHR5cGVvZiB2UG9zICE9PSAnbnVtYmVyJykgcmV0dXJuIG51bGw7XG4gICAgdmFyIHBvcyA9IFt2UG9zLCB0aWNrUG9zaXRpb25baV1bMSAtIHZhbHVlQXhpc1Bvc0luZGV4XV07XG4gICAgaWYgKHZhbHVlQXhpc1Bvc0luZGV4ID09PSAwKSByZXR1cm4gcG9zO1xuICAgIHBvcy5yZXZlcnNlKCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVGaWxsQm90dG9tUG9zKGxpbmVBeGlzKSB7XG4gIHZhciB2YWx1ZUF4aXMgPSBsaW5lQXhpcy5maW5kKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgIHZhciBkYXRhID0gX3JlZjQuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhciBheGlzID0gdmFsdWVBeGlzLmF4aXMsXG4gICAgICBsaW5lUG9zaXRpb24gPSB2YWx1ZUF4aXMubGluZVBvc2l0aW9uLFxuICAgICAgbWluVmFsdWUgPSB2YWx1ZUF4aXMubWluVmFsdWUsXG4gICAgICBtYXhWYWx1ZSA9IHZhbHVlQXhpcy5tYXhWYWx1ZTtcbiAgdmFyIGNoYW5nZUluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBjaGFuZ2VWYWx1ZSA9IGxpbmVQb3NpdGlvblswXVtjaGFuZ2VJbmRleF07XG5cbiAgaWYgKG1pblZhbHVlIDwgMCAmJiBtYXhWYWx1ZSA+IDApIHtcbiAgICB2YXIgdmFsdWVNaW51cyA9IG1heFZhbHVlIC0gbWluVmFsdWU7XG4gICAgdmFyIHBvc01pbnVzID0gTWF0aC5hYnMobGluZVBvc2l0aW9uWzBdW2NoYW5nZUluZGV4XSAtIGxpbmVQb3NpdGlvblsxXVtjaGFuZ2VJbmRleF0pO1xuICAgIHZhciBvZmZzZXQgPSBNYXRoLmFicyhtaW5WYWx1ZSkgLyB2YWx1ZU1pbnVzICogcG9zTWludXM7XG4gICAgaWYgKGF4aXMgPT09ICd5Jykgb2Zmc2V0ICo9IC0xO1xuICAgIGNoYW5nZVZhbHVlICs9IG9mZnNldDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2hhbmdlSW5kZXg6IGNoYW5nZUluZGV4LFxuICAgIGNoYW5nZVZhbHVlOiBjaGFuZ2VWYWx1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQXJlYUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBsaW5lRmlsbEJvdHRvbVBvcyA9IGxpbmVJdGVtLmxpbmVGaWxsQm90dG9tUG9zLFxuICAgICAgckxldmVsID0gbGluZUl0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiBnZXRMaW5lR3JhcGhOYW1lKGxpbmVJdGVtKSxcbiAgICBpbmRleDogckxldmVsLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgdmlzaWJsZTogbGluZUl0ZW0ubGluZUFyZWEuc2hvdyxcbiAgICBsaW5lRmlsbEJvdHRvbVBvczogbGluZUZpbGxCb3R0b21Qb3MsXG4gICAgc2hhcGU6IGdldExpbmVBbmRBcmVhU2hhcGUobGluZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRMaW5lQXJlYVN0eWxlKGxpbmVJdGVtKSxcbiAgICBkcmF3ZWQ6IGxpbmVBcmVhRHJhd2VkXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQW5kQXJlYVNoYXBlKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBsaW5lUG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUFyZWFTdHlsZShsaW5lSXRlbSkge1xuICB2YXIgbGluZUFyZWEgPSBsaW5lSXRlbS5saW5lQXJlYSxcbiAgICAgIGNvbG9yID0gbGluZUl0ZW0uY29sb3I7XG4gIHZhciBncmFkaWVudCA9IGxpbmVBcmVhLmdyYWRpZW50LFxuICAgICAgc3R5bGUgPSBsaW5lQXJlYS5zdHlsZTtcbiAgdmFyIGZpbGxDb2xvciA9IFtzdHlsZS5maWxsIHx8IGNvbG9yXTtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSAoMCwgX3V0aWwuZGVlcE1lcmdlKShmaWxsQ29sb3IsIGdyYWRpZW50KTtcbiAgaWYgKGdyYWRpZW50Q29sb3IubGVuZ3RoID09PSAxKSBncmFkaWVudENvbG9yLnB1c2goZ3JhZGllbnRDb2xvclswXSk7XG4gIHZhciBncmFkaWVudFBhcmFtcyA9IGdldEdyYWRpZW50UGFyYW1zKGxpbmVJdGVtKTtcbiAgc3R5bGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZSwge1xuICAgIHN0cm9rZTogJ3JnYmEoMCwgMCwgMCwgMCknXG4gIH0pO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoe1xuICAgIGdyYWRpZW50Q29sb3I6IGdyYWRpZW50Q29sb3IsXG4gICAgZ3JhZGllbnRQYXJhbXM6IGdyYWRpZW50UGFyYW1zLFxuICAgIGdyYWRpZW50VHlwZTogJ2xpbmVhcicsXG4gICAgZ3JhZGllbnRXaXRoOiAnZmlsbCdcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRHcmFkaWVudFBhcmFtcyhsaW5lSXRlbSkge1xuICB2YXIgbGluZUZpbGxCb3R0b21Qb3MgPSBsaW5lSXRlbS5saW5lRmlsbEJvdHRvbVBvcyxcbiAgICAgIGxpbmVQb3NpdGlvbiA9IGxpbmVJdGVtLmxpbmVQb3NpdGlvbjtcbiAgdmFyIGNoYW5nZUluZGV4ID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlSW5kZXgsXG4gICAgICBjaGFuZ2VWYWx1ZSA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZVZhbHVlO1xuICB2YXIgbWFpblBvcyA9IGxpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcFtjaGFuZ2VJbmRleF07XG4gIH0pO1xuICB2YXIgbWF4UG9zID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtYWluUG9zKSk7XG4gIHZhciBtaW5Qb3MgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1haW5Qb3MpKTtcbiAgdmFyIGJlZ2luUG9zID0gbWF4UG9zO1xuICBpZiAoY2hhbmdlSW5kZXggPT09IDEpIGJlZ2luUG9zID0gbWluUG9zO1xuXG4gIGlmIChjaGFuZ2VJbmRleCA9PT0gMSkge1xuICAgIHJldHVybiBbMCwgYmVnaW5Qb3MsIDAsIGNoYW5nZVZhbHVlXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW2JlZ2luUG9zLCAwLCBjaGFuZ2VWYWx1ZSwgMF07XG4gIH1cbn1cblxuZnVuY3Rpb24gbGluZUFyZWFEcmF3ZWQoX3JlZjUsIF9yZWY2KSB7XG4gIHZhciBsaW5lRmlsbEJvdHRvbVBvcyA9IF9yZWY1LmxpbmVGaWxsQm90dG9tUG9zLFxuICAgICAgc2hhcGUgPSBfcmVmNS5zaGFwZTtcbiAgdmFyIGN0eCA9IF9yZWY2LmN0eDtcbiAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgdmFyIGNoYW5nZUluZGV4ID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlSW5kZXgsXG4gICAgICBjaGFuZ2VWYWx1ZSA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZVZhbHVlO1xuICB2YXIgbGluZVBvaW50MSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSk7XG4gIHZhciBsaW5lUG9pbnQyID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludHNbMF0pO1xuICBsaW5lUG9pbnQxW2NoYW5nZUluZGV4XSA9IGNoYW5nZVZhbHVlO1xuICBsaW5lUG9pbnQyW2NoYW5nZUluZGV4XSA9IGNoYW5nZVZhbHVlO1xuICBjdHgubGluZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9pbnQxKSk7XG4gIGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb2ludDIpKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydExpbmVBcmVhQ29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBjb25maWcgPSBnZXRMaW5lQXJlYUNvbmZpZyhsaW5lSXRlbSlbMF07XG5cbiAgdmFyIHN0eWxlID0gX29iamVjdFNwcmVhZCh7fSwgY29uZmlnLnN0eWxlKTtcblxuICBzdHlsZS5vcGFjaXR5ID0gMDtcbiAgY29uZmlnLnN0eWxlID0gc3R5bGU7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlTGluZUFuZEFyZWEoZ3JhcGhzLCBsaW5lSXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgY2FjaGUgPSBncmFwaHNbaV07XG4gIGlmICghY2FjaGUpIHJldHVybjtcbiAgdmFyIGN1cnJlbnROYW1lID0gZ2V0TGluZUdyYXBoTmFtZShsaW5lSXRlbSk7XG4gIHZhciByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcjtcbiAgdmFyIG5hbWUgPSBjYWNoZVswXS5uYW1lO1xuICB2YXIgZGVsQWxsID0gY3VycmVudE5hbWUgIT09IG5hbWU7XG4gIGlmICghZGVsQWxsKSByZXR1cm47XG4gIGNhY2hlLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICB9KTtcbiAgZ3JhcGhzW2ldID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlTGluZUFuZEFyZWEoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgcG9pbnRzID0gY29uZmlnLnNoYXBlLnBvaW50cztcbiAgdmFyIGdyYXBoUG9pbnRzID0gZ3JhcGguc2hhcGUucG9pbnRzO1xuICB2YXIgZ3JhcGhQb2ludHNOdW0gPSBncmFwaFBvaW50cy5sZW5ndGg7XG4gIHZhciBwb2ludHNOdW0gPSBwb2ludHMubGVuZ3RoO1xuXG4gIGlmIChwb2ludHNOdW0gPiBncmFwaFBvaW50c051bSkge1xuICAgIHZhciBsYXN0UG9pbnQgPSBncmFwaFBvaW50cy5zbGljZSgtMSlbMF07XG4gICAgdmFyIG5ld0FkZFBvaW50cyA9IG5ldyBBcnJheShwb2ludHNOdW0gLSBncmFwaFBvaW50c051bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbykge1xuICAgICAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGFzdFBvaW50KTtcbiAgICB9KTtcbiAgICBncmFwaFBvaW50cy5wdXNoLmFwcGx5KGdyYXBoUG9pbnRzLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ld0FkZFBvaW50cykpO1xuICB9IGVsc2UgaWYgKHBvaW50c051bSA8IGdyYXBoUG9pbnRzTnVtKSB7XG4gICAgZ3JhcGhQb2ludHMuc3BsaWNlKHBvaW50c051bSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGluZUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsaW5lSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6IGdldExpbmVHcmFwaE5hbWUobGluZUl0ZW0pLFxuICAgIGluZGV4OiByTGV2ZWwgKyAxLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldExpbmVBbmRBcmVhU2hhcGUobGluZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRMaW5lU3R5bGUobGluZUl0ZW0pXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lR3JhcGhOYW1lKGxpbmVJdGVtKSB7XG4gIHZhciBzbW9vdGggPSBsaW5lSXRlbS5zbW9vdGg7XG4gIHJldHVybiBzbW9vdGggPyAnc21vb3RobGluZScgOiAncG9seWxpbmUnO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lU3R5bGUobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVTdHlsZSA9IGxpbmVJdGVtLmxpbmVTdHlsZSxcbiAgICAgIGNvbG9yID0gbGluZUl0ZW0uY29sb3IsXG4gICAgICBzbW9vdGggPSBsaW5lSXRlbS5zbW9vdGgsXG4gICAgICBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb247XG4gIHZhciBsaW5lTGVuZ3RoID0gZ2V0TGluZUxlbmd0aChsaW5lUG9zaXRpb24sIHNtb290aCk7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvcixcbiAgICBsaW5lRGFzaDogW2xpbmVMZW5ndGgsIDBdXG4gIH0sIGxpbmVTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVMZW5ndGgocG9pbnRzKSB7XG4gIHZhciBzbW9vdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICBpZiAoIXNtb290aCkgcmV0dXJuICgwLCBfdXRpbC5nZXRQb2x5bGluZUxlbmd0aCkocG9pbnRzKTtcbiAgdmFyIGN1cnZlID0gcG9seWxpbmVUb0JlemllckN1cnZlKHBvaW50cyk7XG4gIHJldHVybiBnZXRCZXppZXJDdXJ2ZUxlbmd0aChjdXJ2ZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0TGluZUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgbGluZURhc2ggPSBsaW5lSXRlbS5saW5lU3R5bGUubGluZURhc2g7XG4gIHZhciBjb25maWcgPSBnZXRMaW5lQ29uZmlnKGxpbmVJdGVtKVswXTtcbiAgdmFyIHJlYWxMaW5lRGFzaCA9IGNvbmZpZy5zdHlsZS5saW5lRGFzaDtcblxuICBpZiAobGluZURhc2gpIHtcbiAgICByZWFsTGluZURhc2ggPSBbMCwgMF07XG4gIH0gZWxzZSB7XG4gICAgcmVhbExpbmVEYXNoID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyZWFsTGluZURhc2gpLnJldmVyc2UoKTtcbiAgfVxuXG4gIGNvbmZpZy5zdHlsZS5saW5lRGFzaCA9IHJlYWxMaW5lRGFzaDtcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludENvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsaW5lSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRQb2ludFNoYXBlcyhsaW5lSXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldFBvaW50U3R5bGUobGluZUl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ2NpcmNsZScsXG4gICAgICBpbmRleDogckxldmVsICsgMixcbiAgICAgIHZpc2libGU6IGxpbmVJdGVtLmxpbmVQb2ludC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50U2hhcGVzKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb24sXG4gICAgICByYWRpdXMgPSBsaW5lSXRlbS5saW5lUG9pbnQucmFkaXVzO1xuICByZXR1cm4gbGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICB2YXIgX3JlZjggPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjcsIDIpLFxuICAgICAgICByeCA9IF9yZWY4WzBdLFxuICAgICAgICByeSA9IF9yZWY4WzFdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHJhZGl1cyxcbiAgICAgIHJ4OiByeCxcbiAgICAgIHJ5OiByeVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFN0eWxlKGxpbmVJdGVtKSB7XG4gIHZhciBjb2xvciA9IGxpbmVJdGVtLmNvbG9yLFxuICAgICAgc3R5bGUgPSBsaW5lSXRlbS5saW5lUG9pbnQuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvclxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UG9pbnRDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRQb2ludENvbmZpZyhsaW5lSXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgY29uZmlnLnNoYXBlLnIgPSAwLjE7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gbGluZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGluZUl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0TGFiZWxTaGFwZXMobGluZUl0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRMYWJlbFN0eWxlKGxpbmVJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwgKyAzLFxuICAgICAgdmlzaWJsZTogbGluZUl0ZW0ubGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlcyhsaW5lSXRlbSkge1xuICB2YXIgY29udGVudHMgPSBmb3JtYXR0ZXJMYWJlbChsaW5lSXRlbSk7XG4gIHZhciBwb3NpdGlvbiA9IGdldExhYmVsUG9zaXRpb24obGluZUl0ZW0pO1xuICByZXR1cm4gY29udGVudHMubWFwKGZ1bmN0aW9uIChjb250ZW50LCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25baV1cbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxQb3NpdGlvbihsaW5lSXRlbSkge1xuICB2YXIgbGluZVBvc2l0aW9uID0gbGluZUl0ZW0ubGluZVBvc2l0aW9uLFxuICAgICAgbGluZUZpbGxCb3R0b21Qb3MgPSBsaW5lSXRlbS5saW5lRmlsbEJvdHRvbVBvcyxcbiAgICAgIGxhYmVsID0gbGluZUl0ZW0ubGFiZWw7XG4gIHZhciBwb3NpdGlvbiA9IGxhYmVsLnBvc2l0aW9uLFxuICAgICAgb2Zmc2V0ID0gbGFiZWwub2Zmc2V0O1xuICB2YXIgY2hhbmdlSW5kZXggPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VJbmRleCxcbiAgICAgIGNoYW5nZVZhbHVlID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlVmFsdWU7XG4gIHJldHVybiBsaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb3MpIHtcbiAgICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICBwb3MgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvcyk7XG4gICAgICBwb3NbY2hhbmdlSW5kZXhdID0gY2hhbmdlVmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uID09PSAnY2VudGVyJykge1xuICAgICAgdmFyIGJvdHRvbSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zKTtcbiAgICAgIGJvdHRvbVtjaGFuZ2VJbmRleF0gPSBjaGFuZ2VWYWx1ZTtcbiAgICAgIHBvcyA9IGdldENlbnRlckxhYmVsUG9pbnQocG9zLCBib3R0b20pO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRPZmZzZXRlZFBvaW50KHBvcywgb2Zmc2V0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldE9mZnNldGVkUG9pbnQoX3JlZjksIF9yZWYxMCkge1xuICB2YXIgX3JlZjExID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY5LCAyKSxcbiAgICAgIHggPSBfcmVmMTFbMF0sXG4gICAgICB5ID0gX3JlZjExWzFdO1xuXG4gIHZhciBfcmVmMTIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLCAyKSxcbiAgICAgIG94ID0gX3JlZjEyWzBdLFxuICAgICAgb3kgPSBfcmVmMTJbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldENlbnRlckxhYmVsUG9pbnQoX3JlZjEzLCBfcmVmMTQpIHtcbiAgdmFyIF9yZWYxNSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTMsIDIpLFxuICAgICAgYXggPSBfcmVmMTVbMF0sXG4gICAgICBheSA9IF9yZWYxNVsxXTtcblxuICB2YXIgX3JlZjE2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxNCwgMiksXG4gICAgICBieCA9IF9yZWYxNlswXSxcbiAgICAgIGJ5ID0gX3JlZjE2WzFdO1xuXG4gIHJldHVybiBbKGF4ICsgYngpIC8gMiwgKGF5ICsgYnkpIC8gMl07XG59XG5cbmZ1bmN0aW9uIGZvcm1hdHRlckxhYmVsKGxpbmVJdGVtKSB7XG4gIHZhciBkYXRhID0gbGluZUl0ZW0uZGF0YSxcbiAgICAgIGZvcm1hdHRlciA9IGxpbmVJdGVtLmxhYmVsLmZvcm1hdHRlcjtcbiAgZGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAnbnVtYmVyJztcbiAgfSkubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQudG9TdHJpbmcoKTtcbiAgfSk7XG4gIGlmICghZm9ybWF0dGVyKSByZXR1cm4gZGF0YTtcbiAgdmFyIHR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsIGQpO1xuICB9KTtcbiAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlcih7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBpbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFN0eWxlKGxpbmVJdGVtKSB7XG4gIHZhciBjb2xvciA9IGxpbmVJdGVtLmNvbG9yLFxuICAgICAgc3R5bGUgPSBsaW5lSXRlbS5sYWJlbC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLm1lcmdlQ29sb3IgPSBtZXJnZUNvbG9yO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBtZXJnZUNvbG9yKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgZGVmYXVsdENvbG9yID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy5jb2xvckNvbmZpZywgdHJ1ZSk7XG4gIHZhciBjb2xvciA9IG9wdGlvbi5jb2xvcixcbiAgICAgIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgaWYgKCFjb2xvcikgY29sb3IgPSBbXTtcbiAgb3B0aW9uLmNvbG9yID0gY29sb3IgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoZGVmYXVsdENvbG9yLCBjb2xvcik7XG4gIGlmICghc2VyaWVzLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgaWYgKGl0ZW0uY29sb3IpIHJldHVybjtcbiAgICBpdGVtLmNvbG9yID0gY29sb3JbaSAlIGNvbG9yTnVtXTtcbiAgfSk7XG4gIHZhciBwaWVzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciB0eXBlID0gX3JlZi50eXBlO1xuICAgIHJldHVybiB0eXBlID09PSAncGllJztcbiAgfSk7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgcmV0dXJuIHBpZS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGRpLCBpKSB7XG4gICAgICByZXR1cm4gZGkuY29sb3IgPSBjb2xvcltpICUgY29sb3JOdW1dO1xuICAgIH0pO1xuICB9KTtcbiAgdmFyIGdhdWdlcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIHR5cGUgPSBfcmVmMi50eXBlO1xuICAgIHJldHVybiB0eXBlID09PSAnZ2F1Z2UnO1xuICB9KTtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlKSB7XG4gICAgcmV0dXJuIGdhdWdlLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZGksIGkpIHtcbiAgICAgIHJldHVybiBkaS5jb2xvciA9IGNvbG9yW2kgJSBjb2xvck51bV07XG4gICAgfSk7XG4gIH0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucGllID0gcGllO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9waWUgPSByZXF1aXJlKFwiLi4vY29uZmlnL3BpZVwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBwaWUoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICBpZiAoIXNlcmllcykgc2VyaWVzID0gW107XG4gIHZhciBwaWVzID0gKDAsIF91dGlsMi5pbml0TmVlZFNlcmllcykoc2VyaWVzLCBfcGllLnBpZUNvbmZpZywgJ3BpZScpO1xuICBwaWVzID0gY2FsY1BpZXNDZW50ZXIocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1BpZXNSYWRpdXMocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1Jvc2VQaWVzUmFkaXVzKHBpZXMsIGNoYXJ0KTtcbiAgcGllcyA9IGNhbGNQaWVzUGVyY2VudChwaWVzKTtcbiAgcGllcyA9IGNhbGNQaWVzQW5nbGUocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1BpZXNJbnNpZGVMYWJlbFBvcyhwaWVzKTtcbiAgcGllcyA9IGNhbGNQaWVzRWRnZUNlbnRlclBvcyhwaWVzKTtcbiAgcGllcyA9IGNhbGNQaWVzT3V0U2lkZUxhYmVsUG9zKHBpZXMpO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBwaWVzLFxuICAgIGtleTogJ3BpZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFBpZUNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBpZUNvbmZpZyxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZVBpZVxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcGllcyxcbiAgICBrZXk6ICdwaWVJbnNpZGVMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEluc2lkZUxhYmVsQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBwaWVzLFxuICAgIGtleTogJ3BpZU91dHNpZGVMYWJlbExpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0T3V0c2lkZUxhYmVsTGluZUNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcGllcyxcbiAgICBrZXk6ICdwaWVPdXRzaWRlTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRPdXRzaWRlTGFiZWxDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRPdXRzaWRlTGFiZWxDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzQ2VudGVyKHBpZXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIGNlbnRlciA9IHBpZS5jZW50ZXI7XG4gICAgY2VudGVyID0gY2VudGVyLm1hcChmdW5jdGlvbiAocG9zLCBpKSB7XG4gICAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ251bWJlcicpIHJldHVybiBwb3M7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocG9zKSAvIDEwMCAqIGFyZWFbaV07XG4gICAgfSk7XG4gICAgcGllLmNlbnRlciA9IGNlbnRlcjtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc1JhZGl1cyhwaWVzLCBjaGFydCkge1xuICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjaGFydC5yZW5kZXIuYXJlYSkpIC8gMjtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgcmFkaXVzID0gcGllLnJhZGl1cyxcbiAgICAgICAgZGF0YSA9IHBpZS5kYXRhO1xuICAgIHJhZGl1cyA9IGdldE51bWJlclJhZGl1cyhyYWRpdXMsIG1heFJhZGl1cyk7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgaXRlbVJhZGl1cyA9IGl0ZW0ucmFkaXVzO1xuICAgICAgaWYgKCFpdGVtUmFkaXVzKSBpdGVtUmFkaXVzID0gcmFkaXVzO1xuICAgICAgaXRlbVJhZGl1cyA9IGdldE51bWJlclJhZGl1cyhpdGVtUmFkaXVzLCBtYXhSYWRpdXMpO1xuICAgICAgaXRlbS5yYWRpdXMgPSBpdGVtUmFkaXVzO1xuICAgIH0pO1xuICAgIHBpZS5yYWRpdXMgPSByYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0TnVtYmVyUmFkaXVzKHJhZGl1cywgbWF4UmFkaXVzKSB7XG4gIGlmICghKHJhZGl1cyBpbnN0YW5jZW9mIEFycmF5KSkgcmFkaXVzID0gWzAsIHJhZGl1c107XG4gIHJhZGl1cyA9IHJhZGl1cy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICBpZiAodHlwZW9mIHIgPT09ICdudW1iZXInKSByZXR1cm4gcjtcbiAgICByZXR1cm4gcGFyc2VJbnQocikgLyAxMDAgKiBtYXhSYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gcmFkaXVzO1xufVxuXG5mdW5jdGlvbiBjYWxjUm9zZVBpZXNSYWRpdXMocGllcywgY2hhcnQpIHtcbiAgdmFyIHJvc2VQaWUgPSBwaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciByb3NlVHlwZSA9IF9yZWYucm9zZVR5cGU7XG4gICAgcmV0dXJuIHJvc2VUeXBlO1xuICB9KTtcbiAgcm9zZVBpZS5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgcmFkaXVzID0gcGllLnJhZGl1cyxcbiAgICAgICAgZGF0YSA9IHBpZS5kYXRhLFxuICAgICAgICByb3NlU29ydCA9IHBpZS5yb3NlU29ydDtcbiAgICB2YXIgcm9zZUluY3JlbWVudCA9IGdldFJvc2VJbmNyZW1lbnQocGllKTtcbiAgICB2YXIgZGF0YUNvcHkgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGRhdGEpO1xuICAgIGRhdGEgPSBzb3J0RGF0YShkYXRhKTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIGl0ZW0ucmFkaXVzWzFdID0gcmFkaXVzWzFdIC0gcm9zZUluY3JlbWVudCAqIGk7XG4gICAgfSk7XG5cbiAgICBpZiAocm9zZVNvcnQpIHtcbiAgICAgIGRhdGEucmV2ZXJzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwaWUuZGF0YSA9IGRhdGFDb3B5O1xuICAgIH1cblxuICAgIHBpZS5yb3NlSW5jcmVtZW50ID0gcm9zZUluY3JlbWVudDtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBzb3J0RGF0YShkYXRhKSB7XG4gIHJldHVybiBkYXRhLnNvcnQoZnVuY3Rpb24gKF9yZWYyLCBfcmVmMykge1xuICAgIHZhciBhID0gX3JlZjIudmFsdWU7XG4gICAgdmFyIGIgPSBfcmVmMy52YWx1ZTtcbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIDA7XG4gICAgaWYgKGEgPiBiKSByZXR1cm4gLTE7XG4gICAgaWYgKGEgPCBiKSByZXR1cm4gMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFJvc2VJbmNyZW1lbnQocGllKSB7XG4gIHZhciByYWRpdXMgPSBwaWUucmFkaXVzLFxuICAgICAgcm9zZUluY3JlbWVudCA9IHBpZS5yb3NlSW5jcmVtZW50O1xuICBpZiAodHlwZW9mIHJvc2VJbmNyZW1lbnQgPT09ICdudW1iZXInKSByZXR1cm4gcm9zZUluY3JlbWVudDtcblxuICBpZiAocm9zZUluY3JlbWVudCA9PT0gJ2F1dG8nKSB7XG4gICAgdmFyIGRhdGEgPSBwaWUuZGF0YTtcbiAgICB2YXIgYWxsUmFkaXVzID0gZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKGFsbCwgX3JlZjQpIHtcbiAgICAgIHZhciByYWRpdXMgPSBfcmVmNC5yYWRpdXM7XG4gICAgICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyYWRpdXMpKTtcbiAgICB9LCBbXSk7XG4gICAgdmFyIG1pblJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsUmFkaXVzKSk7XG4gICAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsUmFkaXVzKSk7XG4gICAgcmV0dXJuIChtYXhSYWRpdXMgLSBtaW5SYWRpdXMpICogMC42IC8gKGRhdGEubGVuZ3RoIC0gMSB8fCAxKTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZUludChyb3NlSW5jcmVtZW50KSAvIDEwMCAqIHJhZGl1c1sxXTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNQZXJjZW50KHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgZGF0YSA9IHBpZS5kYXRhLFxuICAgICAgICBwZXJjZW50VG9GaXhlZCA9IHBpZS5wZXJjZW50VG9GaXhlZDtcbiAgICB2YXIgc3VtID0gZ2V0RGF0YVN1bShkYXRhKTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW0udmFsdWU7XG4gICAgICBpdGVtLnBlcmNlbnQgPSBwYXJzZUZsb2F0KCh2YWx1ZSAvIHN1bSAqIDEwMCkudG9GaXhlZChwZXJjZW50VG9GaXhlZCkpO1xuICAgIH0pO1xuICAgIHZhciBwZXJjZW50U3VtTm9MYXN0ID0gKDAsIF91dGlsMi5tdWxBZGQpKGRhdGEuc2xpY2UoMCwgLTEpLm1hcChmdW5jdGlvbiAoX3JlZjUpIHtcbiAgICAgIHZhciBwZXJjZW50ID0gX3JlZjUucGVyY2VudDtcbiAgICAgIHJldHVybiBwZXJjZW50O1xuICAgIH0pKTtcbiAgICBkYXRhLnNsaWNlKC0xKVswXS5wZXJjZW50ID0gMTAwIC0gcGVyY2VudFN1bU5vTGFzdDtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhU3VtKGRhdGEpIHtcbiAgcmV0dXJuICgwLCBfdXRpbDIubXVsQWRkKShkYXRhLm1hcChmdW5jdGlvbiAoX3JlZjYpIHtcbiAgICB2YXIgdmFsdWUgPSBfcmVmNi52YWx1ZTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNBbmdsZShwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIHN0YXJ0ID0gcGllLnN0YXJ0QW5nbGUsXG4gICAgICAgIGRhdGEgPSBwaWUuZGF0YTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIHZhciBfZ2V0RGF0YUFuZ2xlID0gZ2V0RGF0YUFuZ2xlKGRhdGEsIGkpLFxuICAgICAgICAgIF9nZXREYXRhQW5nbGUyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXREYXRhQW5nbGUsIDIpLFxuICAgICAgICAgIHN0YXJ0QW5nbGUgPSBfZ2V0RGF0YUFuZ2xlMlswXSxcbiAgICAgICAgICBlbmRBbmdsZSA9IF9nZXREYXRhQW5nbGUyWzFdO1xuXG4gICAgICBpdGVtLnN0YXJ0QW5nbGUgPSBzdGFydCArIHN0YXJ0QW5nbGU7XG4gICAgICBpdGVtLmVuZEFuZ2xlID0gc3RhcnQgKyBlbmRBbmdsZTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhQW5nbGUoZGF0YSwgaSkge1xuICB2YXIgZnVsbEFuZ2xlID0gTWF0aC5QSSAqIDI7XG4gIHZhciBuZWVkQWRkRGF0YSA9IGRhdGEuc2xpY2UoMCwgaSArIDEpO1xuICB2YXIgcGVyY2VudFN1bSA9ICgwLCBfdXRpbDIubXVsQWRkKShuZWVkQWRkRGF0YS5tYXAoZnVuY3Rpb24gKF9yZWY3KSB7XG4gICAgdmFyIHBlcmNlbnQgPSBfcmVmNy5wZXJjZW50O1xuICAgIHJldHVybiBwZXJjZW50O1xuICB9KSk7XG4gIHZhciBwZXJjZW50ID0gZGF0YVtpXS5wZXJjZW50O1xuICB2YXIgc3RhcnRQZXJjZW50ID0gcGVyY2VudFN1bSAtIHBlcmNlbnQ7XG4gIHJldHVybiBbZnVsbEFuZ2xlICogc3RhcnRQZXJjZW50IC8gMTAwLCBmdWxsQW5nbGUgKiBwZXJjZW50U3VtIC8gMTAwXTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNJbnNpZGVMYWJlbFBvcyhwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllSXRlbSkge1xuICAgIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaXRlbS5pbnNpZGVMYWJlbFBvcyA9IGdldFBpZUluc2lkZUxhYmVsUG9zKHBpZUl0ZW0sIGl0ZW0pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGdldFBpZUluc2lkZUxhYmVsUG9zKHBpZUl0ZW0sIGRhdGFJdGVtKSB7XG4gIHZhciBjZW50ZXIgPSBwaWVJdGVtLmNlbnRlcjtcblxuICB2YXIgc3RhcnRBbmdsZSA9IGRhdGFJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGRhdGFJdGVtLmVuZEFuZ2xlLFxuICAgICAgX2RhdGFJdGVtJHJhZGl1cyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShkYXRhSXRlbS5yYWRpdXMsIDIpLFxuICAgICAgaXIgPSBfZGF0YUl0ZW0kcmFkaXVzWzBdLFxuICAgICAgb3IgPSBfZGF0YUl0ZW0kcmFkaXVzWzFdO1xuXG4gIHZhciByYWRpdXMgPSAoaXIgKyBvcikgLyAyO1xuICB2YXIgYW5nbGUgPSAoc3RhcnRBbmdsZSArIGVuZEFuZ2xlKSAvIDI7XG4gIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1cywgYW5nbGVdKSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzRWRnZUNlbnRlclBvcyhwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIGRhdGEgPSBwaWUuZGF0YSxcbiAgICAgICAgY2VudGVyID0gcGllLmNlbnRlcjtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBzdGFydEFuZ2xlID0gaXRlbS5zdGFydEFuZ2xlLFxuICAgICAgICAgIGVuZEFuZ2xlID0gaXRlbS5lbmRBbmdsZSxcbiAgICAgICAgICByYWRpdXMgPSBpdGVtLnJhZGl1cztcbiAgICAgIHZhciBjZW50ZXJBbmdsZSA9IChzdGFydEFuZ2xlICsgZW5kQW5nbGUpIC8gMjtcblxuICAgICAgdmFyIHBvcyA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzWzFdLCBjZW50ZXJBbmdsZV0pKTtcblxuICAgICAgaXRlbS5lZGdlQ2VudGVyUG9zID0gcG9zO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzT3V0U2lkZUxhYmVsUG9zKHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWVJdGVtKSB7XG4gICAgdmFyIGxlZnRQaWVEYXRhSXRlbXMgPSBnZXRMZWZ0T3JSaWdodFBpZURhdGFJdGVtcyhwaWVJdGVtKTtcbiAgICB2YXIgcmlnaHRQaWVEYXRhSXRlbXMgPSBnZXRMZWZ0T3JSaWdodFBpZURhdGFJdGVtcyhwaWVJdGVtLCBmYWxzZSk7XG4gICAgbGVmdFBpZURhdGFJdGVtcyA9IHNvcnRQaWVzRnJvbVRvcFRvQm90dG9tKGxlZnRQaWVEYXRhSXRlbXMpO1xuICAgIHJpZ2h0UGllRGF0YUl0ZW1zID0gc29ydFBpZXNGcm9tVG9wVG9Cb3R0b20ocmlnaHRQaWVEYXRhSXRlbXMpO1xuICAgIGFkZExhYmVsTGluZUFuZEFsaWduKGxlZnRQaWVEYXRhSXRlbXMsIHBpZUl0ZW0pO1xuICAgIGFkZExhYmVsTGluZUFuZEFsaWduKHJpZ2h0UGllRGF0YUl0ZW1zLCBwaWVJdGVtLCBmYWxzZSk7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxMaW5lQmVuZFJhZGl1cyhwaWVJdGVtKSB7XG4gIHZhciBsYWJlbExpbmVCZW5kR2FwID0gcGllSXRlbS5vdXRzaWRlTGFiZWwubGFiZWxMaW5lQmVuZEdhcDtcbiAgdmFyIG1heFJhZGl1cyA9IGdldFBpZU1heFJhZGl1cyhwaWVJdGVtKTtcblxuICBpZiAodHlwZW9mIGxhYmVsTGluZUJlbmRHYXAgIT09ICdudW1iZXInKSB7XG4gICAgbGFiZWxMaW5lQmVuZEdhcCA9IHBhcnNlSW50KGxhYmVsTGluZUJlbmRHYXApIC8gMTAwICogbWF4UmFkaXVzO1xuICB9XG5cbiAgcmV0dXJuIGxhYmVsTGluZUJlbmRHYXAgKyBtYXhSYWRpdXM7XG59XG5cbmZ1bmN0aW9uIGdldFBpZU1heFJhZGl1cyhwaWVJdGVtKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgcmFkaXVzID0gZGF0YS5tYXAoZnVuY3Rpb24gKF9yZWY4KSB7XG4gICAgdmFyIF9yZWY4JHJhZGl1cyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmOC5yYWRpdXMsIDIpLFxuICAgICAgICBmb28gPSBfcmVmOCRyYWRpdXNbMF0sXG4gICAgICAgIHIgPSBfcmVmOCRyYWRpdXNbMV07XG5cbiAgICByZXR1cm4gcjtcbiAgfSk7XG4gIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHJhZGl1cykpO1xufVxuXG5mdW5jdGlvbiBnZXRMZWZ0T3JSaWdodFBpZURhdGFJdGVtcyhwaWVJdGVtKSB7XG4gIHZhciBsZWZ0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0cnVlO1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIGNlbnRlciA9IHBpZUl0ZW0uY2VudGVyO1xuICB2YXIgY2VudGVyWFBvcyA9IGNlbnRlclswXTtcbiAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChfcmVmOSkge1xuICAgIHZhciBlZGdlQ2VudGVyUG9zID0gX3JlZjkuZWRnZUNlbnRlclBvcztcbiAgICB2YXIgeFBvcyA9IGVkZ2VDZW50ZXJQb3NbMF07XG4gICAgaWYgKGxlZnQpIHJldHVybiB4UG9zIDw9IGNlbnRlclhQb3M7XG4gICAgcmV0dXJuIHhQb3MgPiBjZW50ZXJYUG9zO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc29ydFBpZXNGcm9tVG9wVG9Cb3R0b20oZGF0YUl0ZW0pIHtcbiAgZGF0YUl0ZW0uc29ydChmdW5jdGlvbiAoX3JlZjEwLCBfcmVmMTEpIHtcbiAgICB2YXIgX3JlZjEwJGVkZ2VDZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLmVkZ2VDZW50ZXJQb3MsIDIpLFxuICAgICAgICB0ID0gX3JlZjEwJGVkZ2VDZW50ZXJQb3NbMF0sXG4gICAgICAgIGF5ID0gX3JlZjEwJGVkZ2VDZW50ZXJQb3NbMV07XG5cbiAgICB2YXIgX3JlZjExJGVkZ2VDZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjExLmVkZ2VDZW50ZXJQb3MsIDIpLFxuICAgICAgICB0dCA9IF9yZWYxMSRlZGdlQ2VudGVyUG9zWzBdLFxuICAgICAgICBieSA9IF9yZWYxMSRlZGdlQ2VudGVyUG9zWzFdO1xuXG4gICAgaWYgKGF5ID4gYnkpIHJldHVybiAxO1xuICAgIGlmIChheSA8IGJ5KSByZXR1cm4gLTE7XG4gICAgaWYgKGF5ID09PSBieSkgcmV0dXJuIDA7XG4gIH0pO1xuICByZXR1cm4gZGF0YUl0ZW07XG59XG5cbmZ1bmN0aW9uIGFkZExhYmVsTGluZUFuZEFsaWduKGRhdGFJdGVtLCBwaWVJdGVtKSB7XG4gIHZhciBsZWZ0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB0cnVlO1xuICB2YXIgY2VudGVyID0gcGllSXRlbS5jZW50ZXIsXG4gICAgICBvdXRzaWRlTGFiZWwgPSBwaWVJdGVtLm91dHNpZGVMYWJlbDtcbiAgdmFyIHJhZGl1cyA9IGdldExhYmVsTGluZUJlbmRSYWRpdXMocGllSXRlbSk7XG4gIGRhdGFJdGVtLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgZWRnZUNlbnRlclBvcyA9IGl0ZW0uZWRnZUNlbnRlclBvcyxcbiAgICAgICAgc3RhcnRBbmdsZSA9IGl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBpdGVtLmVuZEFuZ2xlO1xuICAgIHZhciBsYWJlbExpbmVFbmRMZW5ndGggPSBvdXRzaWRlTGFiZWwubGFiZWxMaW5lRW5kTGVuZ3RoO1xuICAgIHZhciBhbmdsZSA9IChzdGFydEFuZ2xlICsgZW5kQW5nbGUpIC8gMjtcblxuICAgIHZhciBiZW5kUG9pbnQgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1cywgYW5nbGVdKSk7XG5cbiAgICB2YXIgZW5kUG9pbnQgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGJlbmRQb2ludCk7XG4gICAgZW5kUG9pbnRbMF0gKz0gbGFiZWxMaW5lRW5kTGVuZ3RoICogKGxlZnQgPyAtMSA6IDEpO1xuICAgIGl0ZW0ubGFiZWxMaW5lID0gW2VkZ2VDZW50ZXJQb3MsIGJlbmRQb2ludCwgZW5kUG9pbnRdO1xuICAgIGl0ZW0ubGFiZWxMaW5lTGVuZ3RoID0gKDAsIF91dGlsMi5nZXRQb2x5bGluZUxlbmd0aCkoaXRlbS5sYWJlbExpbmUpO1xuICAgIGl0ZW0uYWxpZ24gPSB7XG4gICAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9O1xuICAgIGlmIChsZWZ0KSBpdGVtLmFsaWduLnRleHRBbGlnbiA9ICdyaWdodCc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVDb25maWcocGllSXRlbSkge1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHBpZUl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncGllJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0UGllU2hhcGUocGllSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0UGllU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQaWVDb25maWcocGllSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uRGVsYXlHYXAgPSBwaWVJdGVtLmFuaW1hdGlvbkRlbGF5R2FwLFxuICAgICAgc3RhcnRBbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uc3RhcnRBbmltYXRpb25DdXJ2ZTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRQaWVDb25maWcocGllSXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnLCBpKSB7XG4gICAgY29uZmlnLmFuaW1hdGlvbkN1cnZlID0gc3RhcnRBbmltYXRpb25DdXJ2ZTtcbiAgICBjb25maWcuYW5pbWF0aW9uRGVsYXkgPSBpICogYW5pbWF0aW9uRGVsYXlHYXA7XG4gICAgY29uZmlnLnNoYXBlLm9yID0gY29uZmlnLnNoYXBlLmlyO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZVBpZShncmFwaCkge1xuICBncmFwaC5hbmltYXRpb25EZWxheSA9IDA7XG59XG5cbmZ1bmN0aW9uIGdldFBpZVNoYXBlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIGNlbnRlciA9IHBpZUl0ZW0uY2VudGVyLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGRhdGFJdGVtID0gZGF0YVtpXTtcbiAgdmFyIHJhZGl1cyA9IGRhdGFJdGVtLnJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUgPSBkYXRhSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBkYXRhSXRlbS5lbmRBbmdsZTtcbiAgcmV0dXJuIHtcbiAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlOiBlbmRBbmdsZSxcbiAgICBpcjogcmFkaXVzWzBdLFxuICAgIG9yOiByYWRpdXNbMV0sXG4gICAgcng6IGNlbnRlclswXSxcbiAgICByeTogY2VudGVyWzFdXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFBpZVN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIHBpZVN0eWxlID0gcGllSXRlbS5waWVTdHlsZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBkYXRhSXRlbSA9IGRhdGFbaV07XG4gIHZhciBjb2xvciA9IGRhdGFJdGVtLmNvbG9yO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBwaWVTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEluc2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICByTGV2ZWwgPSBwaWVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHBpZUl0ZW0uaW5zaWRlTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRJbnNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEluc2lkZUxhYmVsU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5zaWRlTGFiZWxTaGFwZShwaWVJdGVtLCBpKSB7XG4gIHZhciBpbnNpZGVMYWJlbCA9IHBpZUl0ZW0uaW5zaWRlTGFiZWwsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZm9ybWF0dGVyID0gaW5zaWRlTGFiZWwuZm9ybWF0dGVyO1xuICB2YXIgZGF0YUl0ZW0gPSBkYXRhW2ldO1xuICB2YXIgZm9ybWF0dGVyVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gIHZhciBsYWJlbCA9ICcnO1xuXG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgIGxhYmVsID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3tuYW1lfScsIGRhdGFJdGVtLm5hbWUpO1xuICAgIGxhYmVsID0gbGFiZWwucmVwbGFjZSgne3BlcmNlbnR9JywgZGF0YUl0ZW0ucGVyY2VudCk7XG4gICAgbGFiZWwgPSBsYWJlbC5yZXBsYWNlKCd7dmFsdWV9JywgZGF0YUl0ZW0udmFsdWUpO1xuICB9XG5cbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBsYWJlbCA9IGZvcm1hdHRlcihkYXRhSXRlbSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGxhYmVsLFxuICAgIHBvc2l0aW9uOiBkYXRhSXRlbS5pbnNpZGVMYWJlbFBvc1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRJbnNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIHN0eWxlID0gcGllSXRlbS5pbnNpZGVMYWJlbC5zdHlsZTtcbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICByTGV2ZWwgPSBwaWVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBwaWVJdGVtLm91dHNpZGVMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldE91dHNpZGVMYWJlbExpbmVTaGFwZShwaWVJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRPdXRzaWRlTGFiZWxMaW5lU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBjb25maWdzID0gZ2V0T3V0c2lkZUxhYmVsTGluZUNvbmZpZyhwaWVJdGVtKTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcsIGkpIHtcbiAgICBjb25maWcuc3R5bGUubGluZURhc2ggPSBbMCwgZGF0YVtpXS5sYWJlbExpbmVMZW5ndGhdO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbExpbmVTaGFwZShwaWVJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZGF0YUl0ZW0gPSBkYXRhW2ldO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogZGF0YUl0ZW0ubGFiZWxMaW5lXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbExpbmVTdHlsZShwaWVJdGVtLCBpKSB7XG4gIHZhciBvdXRzaWRlTGFiZWwgPSBwaWVJdGVtLm91dHNpZGVMYWJlbCxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBsYWJlbExpbmVTdHlsZSA9IG91dHNpZGVMYWJlbC5sYWJlbExpbmVTdHlsZTtcbiAgdmFyIGNvbG9yID0gZGF0YVtpXS5jb2xvcjtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvcixcbiAgICBsaW5lRGFzaDogW2RhdGFbaV0ubGFiZWxMaW5lTGVuZ3RoLCAwXVxuICB9LCBsYWJlbExpbmVTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbENvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHBpZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhLFxuICAgICAgckxldmVsID0gcGllSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBwaWVJdGVtLm91dHNpZGVMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldE91dHNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldE91dHNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0T3V0c2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBjb25maWdzID0gZ2V0T3V0c2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZywgaSkge1xuICAgIGNvbmZpZy5zaGFwZS5wb3NpdGlvbiA9IGRhdGFbaV0ubGFiZWxMaW5lWzFdO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIG91dHNpZGVMYWJlbCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGZvcm1hdHRlciA9IG91dHNpZGVMYWJlbC5mb3JtYXR0ZXI7XG4gIHZhciBfZGF0YSRpID0gZGF0YVtpXSxcbiAgICAgIGxhYmVsTGluZSA9IF9kYXRhJGkubGFiZWxMaW5lLFxuICAgICAgbmFtZSA9IF9kYXRhJGkubmFtZSxcbiAgICAgIHBlcmNlbnQgPSBfZGF0YSRpLnBlcmNlbnQsXG4gICAgICB2YWx1ZSA9IF9kYXRhJGkudmFsdWU7XG4gIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgdmFyIGxhYmVsID0gJyc7XG5cbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbGFiZWwgPSBmb3JtYXR0ZXIucmVwbGFjZSgne25hbWV9JywgbmFtZSk7XG4gICAgbGFiZWwgPSBsYWJlbC5yZXBsYWNlKCd7cGVyY2VudH0nLCBwZXJjZW50KTtcbiAgICBsYWJlbCA9IGxhYmVsLnJlcGxhY2UoJ3t2YWx1ZX0nLCB2YWx1ZSk7XG4gIH1cblxuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxhYmVsID0gZm9ybWF0dGVyKGRhdGFbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBsYWJlbCxcbiAgICBwb3NpdGlvbjogbGFiZWxMaW5lWzJdXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIG91dHNpZGVMYWJlbCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIF9kYXRhJGkyID0gZGF0YVtpXSxcbiAgICAgIGNvbG9yID0gX2RhdGEkaTIuY29sb3IsXG4gICAgICBhbGlnbiA9IF9kYXRhJGkyLmFsaWduO1xuICB2YXIgc3R5bGUgPSBvdXRzaWRlTGFiZWwuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoX29iamVjdFNwcmVhZCh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgYWxpZ24pLCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yYWRhciA9IHJhZGFyO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9pbmRleCA9IHJlcXVpcmUoXCIuLi9jb25maWcvaW5kZXhcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiByYWRhcihjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgdmFyIHJhZGFycyA9ICgwLCBfdXRpbDIuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX2luZGV4LnJhZGFyQ29uZmlnLCAncmFkYXInKTtcbiAgcmFkYXJzID0gY2FsY1JhZGFyUG9zaXRpb24ocmFkYXJzLCBjaGFydCk7XG4gIHJhZGFycyA9IGNhbGNSYWRhckxhYmVsUG9zaXRpb24ocmFkYXJzLCBjaGFydCk7XG4gIHJhZGFycyA9IGNhbGNSYWRhckxhYmVsQWxpZ24ocmFkYXJzLCBjaGFydCk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFycyxcbiAgICBrZXk6ICdyYWRhcicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFJhZGFyQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0UmFkYXJDb25maWcsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VSYWRhclxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJzLFxuICAgIGtleTogJ3JhZGFyUG9pbnQnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRQb2ludENvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBvaW50Q29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhcnMsXG4gICAga2V5OiAncmFkYXJMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExhYmVsQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJQb3NpdGlvbihyYWRhcnMsIGNoYXJ0KSB7XG4gIHZhciByYWRhckF4aXMgPSBjaGFydC5yYWRhckF4aXM7XG4gIGlmICghcmFkYXJBeGlzKSByZXR1cm4gW107XG4gIHZhciBpbmRpY2F0b3IgPSByYWRhckF4aXMuaW5kaWNhdG9yLFxuICAgICAgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMsXG4gICAgICByYWRpdXMgPSByYWRhckF4aXMucmFkaXVzLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcztcbiAgcmFkYXJzLmZvckVhY2goZnVuY3Rpb24gKHJhZGFySXRlbSkge1xuICAgIHZhciBkYXRhID0gcmFkYXJJdGVtLmRhdGE7XG4gICAgcmFkYXJJdGVtLmRhdGFSYWRpdXMgPSBbXTtcbiAgICByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbiA9IGluZGljYXRvci5tYXAoZnVuY3Rpb24gKF9yZWYsIGkpIHtcbiAgICAgIHZhciBtYXggPSBfcmVmLm1heCxcbiAgICAgICAgICBtaW4gPSBfcmVmLm1pbjtcbiAgICAgIHZhciB2ID0gZGF0YVtpXTtcbiAgICAgIGlmICh0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJykgbWF4ID0gdjtcbiAgICAgIGlmICh0eXBlb2YgbWluICE9PSAnbnVtYmVyJykgbWluID0gMDtcbiAgICAgIGlmICh0eXBlb2YgdiAhPT0gJ251bWJlcicpIHYgPSBtaW47XG4gICAgICB2YXIgZGF0YVJhZGl1cyA9ICh2IC0gbWluKSAvIChtYXggLSBtaW4pICogcmFkaXVzO1xuICAgICAgcmFkYXJJdGVtLmRhdGFSYWRpdXNbaV0gPSBkYXRhUmFkaXVzO1xuICAgICAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbZGF0YVJhZGl1cywgYXhpc0xpbmVBbmdsZXNbaV1dKSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJMYWJlbFBvc2l0aW9uKHJhZGFycywgY2hhcnQpIHtcbiAgdmFyIHJhZGFyQXhpcyA9IGNoYXJ0LnJhZGFyQXhpcztcbiAgaWYgKCFyYWRhckF4aXMpIHJldHVybiBbXTtcbiAgdmFyIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICBheGlzTGluZUFuZ2xlcyA9IHJhZGFyQXhpcy5heGlzTGluZUFuZ2xlcztcbiAgcmFkYXJzLmZvckVhY2goZnVuY3Rpb24gKHJhZGFySXRlbSkge1xuICAgIHZhciBkYXRhUmFkaXVzID0gcmFkYXJJdGVtLmRhdGFSYWRpdXMsXG4gICAgICAgIGxhYmVsID0gcmFkYXJJdGVtLmxhYmVsO1xuICAgIHZhciBsYWJlbEdhcCA9IGxhYmVsLmxhYmVsR2FwO1xuICAgIHJhZGFySXRlbS5sYWJlbFBvc2l0aW9uID0gZGF0YVJhZGl1cy5tYXAoZnVuY3Rpb24gKHIsIGkpIHtcbiAgICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3IgKyBsYWJlbEdhcCwgYXhpc0xpbmVBbmdsZXNbaV1dKSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJMYWJlbEFsaWduKHJhZGFycywgY2hhcnQpIHtcbiAgdmFyIHJhZGFyQXhpcyA9IGNoYXJ0LnJhZGFyQXhpcztcbiAgaWYgKCFyYWRhckF4aXMpIHJldHVybiBbXTtcblxuICB2YXIgX3JhZGFyQXhpcyRjZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocmFkYXJBeGlzLmNlbnRlclBvcywgMiksXG4gICAgICB4ID0gX3JhZGFyQXhpcyRjZW50ZXJQb3NbMF0sXG4gICAgICB5ID0gX3JhZGFyQXhpcyRjZW50ZXJQb3NbMV07XG5cbiAgcmFkYXJzLmZvckVhY2goZnVuY3Rpb24gKHJhZGFySXRlbSkge1xuICAgIHZhciBsYWJlbFBvc2l0aW9uID0gcmFkYXJJdGVtLmxhYmVsUG9zaXRpb247XG4gICAgdmFyIGxhYmVsQWxpZ24gPSBsYWJlbFBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICAgIHZhciBfcmVmMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMiwgMiksXG4gICAgICAgICAgbHggPSBfcmVmM1swXSxcbiAgICAgICAgICBseSA9IF9yZWYzWzFdO1xuXG4gICAgICB2YXIgdGV4dEFsaWduID0gbHggPiB4ID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIHZhciB0ZXh0QmFzZWxpbmUgPSBseSA+IHkgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dEFsaWduOiB0ZXh0QWxpZ24sXG4gICAgICAgIHRleHRCYXNlbGluZTogdGV4dEJhc2VsaW5lXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJhZGFySXRlbS5sYWJlbEFsaWduID0gbGFiZWxBbGlnbjtcbiAgfSk7XG4gIHJldHVybiByYWRhcnM7XG59XG5cbmZ1bmN0aW9uIGdldFJhZGFyQ29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSByYWRhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFySXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXRSYWRhclNoYXBlKHJhZGFySXRlbSksXG4gICAgc3R5bGU6IGdldFJhZGFyU3R5bGUocmFkYXJJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRSYWRhckNvbmZpZyhyYWRhckl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGNlbnRlclBvcyA9IHVwZGF0ZXIuY2hhcnQucmFkYXJBeGlzLmNlbnRlclBvcztcbiAgdmFyIGNvbmZpZyA9IGdldFJhZGFyQ29uZmlnKHJhZGFySXRlbSlbMF07XG4gIHZhciBwb2ludE51bSA9IGNvbmZpZy5zaGFwZS5wb2ludHMubGVuZ3RoO1xuICB2YXIgcG9pbnRzID0gbmV3IEFycmF5KHBvaW50TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKTtcbiAgfSk7XG4gIGNvbmZpZy5zaGFwZS5wb2ludHMgPSBwb2ludHM7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gZ2V0UmFkYXJTaGFwZShyYWRhckl0ZW0pIHtcbiAgdmFyIHJhZGFyUG9zaXRpb24gPSByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHJhZGFyUG9zaXRpb24sXG4gICAgY2xvc2U6IHRydWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UmFkYXJTdHlsZShyYWRhckl0ZW0pIHtcbiAgdmFyIHJhZGFyU3R5bGUgPSByYWRhckl0ZW0ucmFkYXJTdHlsZSxcbiAgICAgIGNvbG9yID0gcmFkYXJJdGVtLmNvbG9yO1xuICB2YXIgY29sb3JSZ2JhVmFsdWUgPSAoMCwgX2NvbG9yLmdldFJnYmFWYWx1ZSkoY29sb3IpO1xuICBjb2xvclJnYmFWYWx1ZVszXSA9IDAuNTtcbiAgdmFyIHJhZGFyRGVmYXVsdENvbG9yID0ge1xuICAgIHN0cm9rZTogY29sb3IsXG4gICAgZmlsbDogKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoY29sb3JSZ2JhVmFsdWUpXG4gIH07XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkocmFkYXJEZWZhdWx0Q29sb3IsIHJhZGFyU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VSYWRhcihncmFwaCwgX3JlZjQpIHtcbiAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gIHZhciBncmFwaFBvaW50cyA9IGdyYXBoLnNoYXBlLnBvaW50cztcbiAgdmFyIGdyYXBoUG9pbnRzTnVtID0gZ3JhcGhQb2ludHMubGVuZ3RoO1xuICB2YXIgcG9pbnRzTnVtID0gc2hhcGUucG9pbnRzLmxlbmd0aDtcblxuICBpZiAocG9pbnRzTnVtID4gZ3JhcGhQb2ludHNOdW0pIHtcbiAgICB2YXIgbGFzdFBvaW50ID0gZ3JhcGhQb2ludHMuc2xpY2UoLTEpWzBdO1xuICAgIHZhciBuZXdBZGRQb2ludHMgPSBuZXcgQXJyYXkocG9pbnRzTnVtIC0gZ3JhcGhQb2ludHNOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICAgIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhc3RQb2ludCk7XG4gICAgfSk7XG4gICAgZ3JhcGhQb2ludHMucHVzaC5hcHBseShncmFwaFBvaW50cywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXdBZGRQb2ludHMpKTtcbiAgfSBlbHNlIGlmIChwb2ludHNOdW0gPCBncmFwaFBvaW50c051bSkge1xuICAgIGdyYXBoUG9pbnRzLnNwbGljZShwb2ludHNOdW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50Q29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgcmFkYXJQb3NpdGlvbiA9IHJhZGFySXRlbS5yYWRhclBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFySXRlbS5yTGV2ZWw7XG4gIHJldHVybiByYWRhclBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdjaXJjbGUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHZpc2libGU6IHJhZGFySXRlbS5wb2ludC5zaG93LFxuICAgICAgc2hhcGU6IGdldFBvaW50U2hhcGUocmFkYXJJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRQb2ludFN0eWxlKHJhZGFySXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQb2ludENvbmZpZyhyYWRhckl0ZW0pIHtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRQb2ludENvbmZpZyhyYWRhckl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHJldHVybiBjb25maWcuc2hhcGUuciA9IDAuMDE7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRTaGFwZShyYWRhckl0ZW0sIGkpIHtcbiAgdmFyIHJhZGFyUG9zaXRpb24gPSByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbixcbiAgICAgIHBvaW50ID0gcmFkYXJJdGVtLnBvaW50O1xuICB2YXIgcmFkaXVzID0gcG9pbnQucmFkaXVzO1xuICB2YXIgcG9zaXRpb24gPSByYWRhclBvc2l0aW9uW2ldO1xuICByZXR1cm4ge1xuICAgIHJ4OiBwb3NpdGlvblswXSxcbiAgICByeTogcG9zaXRpb25bMV0sXG4gICAgcjogcmFkaXVzXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50U3R5bGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciBwb2ludCA9IHJhZGFySXRlbS5wb2ludCxcbiAgICAgIGNvbG9yID0gcmFkYXJJdGVtLmNvbG9yO1xuICB2YXIgc3R5bGUgPSBwb2ludC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvclxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsQ29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgbGFiZWxQb3NpdGlvbiA9IHJhZGFySXRlbS5sYWJlbFBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFySXRlbS5yTGV2ZWw7XG4gIHJldHVybiBsYWJlbFBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiByYWRhckl0ZW0ubGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRMYWJlbFNoYXBlKHJhZGFySXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0TGFiZWxTdHlsZShyYWRhckl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU2hhcGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciBsYWJlbFBvc2l0aW9uID0gcmFkYXJJdGVtLmxhYmVsUG9zaXRpb24sXG4gICAgICBsYWJlbCA9IHJhZGFySXRlbS5sYWJlbCxcbiAgICAgIGRhdGEgPSByYWRhckl0ZW0uZGF0YTtcbiAgdmFyIG9mZnNldCA9IGxhYmVsLm9mZnNldCxcbiAgICAgIGZvcm1hdHRlciA9IGxhYmVsLmZvcm1hdHRlcjtcbiAgdmFyIHBvc2l0aW9uID0gbWVyZ2VQb2ludE9mZnNldChsYWJlbFBvc2l0aW9uW2ldLCBvZmZzZXQpO1xuICB2YXIgbGFiZWxUZXh0ID0gZGF0YVtpXSA/IGRhdGFbaV0udG9TdHJpbmcoKSA6ICcwJztcbiAgdmFyIGZvcm1hdHRlclR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ3N0cmluZycpIGxhYmVsVGV4dCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9JywgbGFiZWxUZXh0KTtcbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIGxhYmVsVGV4dCA9IGZvcm1hdHRlcihsYWJlbFRleHQpO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGxhYmVsVGV4dCxcbiAgICBwb3NpdGlvbjogcG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VQb2ludE9mZnNldChfcmVmNSwgX3JlZjYpIHtcbiAgdmFyIF9yZWY3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1LCAyKSxcbiAgICAgIHggPSBfcmVmN1swXSxcbiAgICAgIHkgPSBfcmVmN1sxXTtcblxuICB2YXIgX3JlZjggPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjYsIDIpLFxuICAgICAgb3ggPSBfcmVmOFswXSxcbiAgICAgIG95ID0gX3JlZjhbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciBsYWJlbCA9IHJhZGFySXRlbS5sYWJlbCxcbiAgICAgIGNvbG9yID0gcmFkYXJJdGVtLmNvbG9yLFxuICAgICAgbGFiZWxBbGlnbiA9IHJhZGFySXRlbS5sYWJlbEFsaWduO1xuICB2YXIgc3R5bGUgPSBsYWJlbC5zdHlsZTtcblxuICB2YXIgZGVmYXVsdENvbG9yQW5kQWxpZ24gPSBfb2JqZWN0U3ByZWFkKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBsYWJlbEFsaWduW2ldKTtcblxuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKGRlZmF1bHRDb2xvckFuZEFsaWduLCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yYWRhckF4aXMgPSByYWRhckF4aXM7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9pbmRleCA9IHJlcXVpcmUoXCIuLi9jb25maWcvaW5kZXhcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gcmFkYXJBeGlzKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgcmFkYXIgPSBvcHRpb24ucmFkYXI7XG4gIHZhciByYWRhckF4aXMgPSBbXTtcblxuICBpZiAocmFkYXIpIHtcbiAgICByYWRhckF4aXMgPSBtZXJnZVJhZGFyQXhpc0RlZmF1bHRDb25maWcocmFkYXIpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNDZW50ZXIocmFkYXJBeGlzLCBjaGFydCk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc1JpbmdSYWRpdXMocmFkYXJBeGlzLCBjaGFydCk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc0xpbmVQb3NpdGlvbihyYWRhckF4aXMpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNBcmVhUmFkaXVzKHJhZGFyQXhpcyk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc0xhYmVsUG9zaXRpb24ocmFkYXJBeGlzKTtcbiAgICByYWRhckF4aXMgPSBbcmFkYXJBeGlzXTtcbiAgfVxuXG4gIHZhciByYWRhckF4aXNGb3JVcGRhdGUgPSByYWRhckF4aXM7XG4gIGlmIChyYWRhckF4aXMubGVuZ3RoICYmICFyYWRhckF4aXNbMF0uc2hvdykgcmFkYXJBeGlzRm9yVXBkYXRlID0gW107XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNTcGxpdEFyZWEnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRTcGxpdEFyZWFDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVTcGxpdEFyZWEsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VTcGxpdEFyZWFcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNTcGxpdExpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRTcGxpdExpbmVDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVTcGxpdExpbmUsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VTcGxpdExpbmVcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXhpc0xpbmVDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNMYWJsZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEF4aXNMYWJlbENvbmZpZ1xuICB9KTtcbiAgY2hhcnQucmFkYXJBeGlzID0gcmFkYXJBeGlzWzBdO1xufVxuXG5mdW5jdGlvbiBtZXJnZVJhZGFyQXhpc0RlZmF1bHRDb25maWcocmFkYXIpIHtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShfaW5kZXgucmFkYXJBeGlzQ29uZmlnKSwgcmFkYXIpO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJBeGlzQ2VudGVyKHJhZGFyQXhpcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIGNlbnRlciA9IHJhZGFyQXhpcy5jZW50ZXI7XG4gIHJhZGFyQXhpcy5jZW50ZXJQb3MgPSBjZW50ZXIubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHY7XG4gICAgcmV0dXJuIHBhcnNlSW50KHYpIC8gMTAwICogYXJlYVtpXTtcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNSaW5nUmFkaXVzKHJhZGFyQXhpcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIHNwbGl0TnVtID0gcmFkYXJBeGlzLnNwbGl0TnVtLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cztcbiAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXJlYSkpIC8gMjtcbiAgaWYgKHR5cGVvZiByYWRpdXMgIT09ICdudW1iZXInKSByYWRpdXMgPSBwYXJzZUludChyYWRpdXMpIC8gMTAwICogbWF4UmFkaXVzO1xuICB2YXIgc3BsaXRHYXAgPSByYWRpdXMgLyBzcGxpdE51bTtcbiAgcmFkYXJBeGlzLnJpbmdSYWRpdXMgPSBuZXcgQXJyYXkoc3BsaXROdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gc3BsaXRHYXAgKiAoaSArIDEpO1xuICB9KTtcbiAgcmFkYXJBeGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyQXhpc0xpbmVQb3NpdGlvbihyYWRhckF4aXMpIHtcbiAgdmFyIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3IsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUgPSByYWRhckF4aXMuc3RhcnRBbmdsZTtcbiAgdmFyIGZ1bGxBbmdsZSA9IE1hdGguUEkgKiAyO1xuICB2YXIgaW5kaWNhdG9yTnVtID0gaW5kaWNhdG9yLmxlbmd0aDtcbiAgdmFyIGluZGljYXRvckdhcCA9IGZ1bGxBbmdsZSAvIGluZGljYXRvck51bTtcbiAgdmFyIGFuZ2xlcyA9IG5ldyBBcnJheShpbmRpY2F0b3JOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gaW5kaWNhdG9yR2FwICogaSArIHN0YXJ0QW5nbGU7XG4gIH0pO1xuICByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMgPSBhbmdsZXM7XG4gIHJhZGFyQXhpcy5heGlzTGluZVBvc2l0aW9uID0gYW5nbGVzLm1hcChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3JhZGl1cywgZ10pKTtcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNBcmVhUmFkaXVzKHJhZGFyQXhpcykge1xuICB2YXIgcmluZ1JhZGl1cyA9IHJhZGFyQXhpcy5yaW5nUmFkaXVzO1xuICB2YXIgc3ViUmFkaXVzID0gcmluZ1JhZGl1c1swXSAvIDI7XG4gIHJhZGFyQXhpcy5hcmVhUmFkaXVzID0gcmluZ1JhZGl1cy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICByZXR1cm4gciAtIHN1YlJhZGl1cztcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNMYWJlbFBvc2l0aW9uKHJhZGFyQXhpcykge1xuICB2YXIgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cyxcbiAgICAgIGF4aXNMYWJlbCA9IHJhZGFyQXhpcy5heGlzTGFiZWw7XG4gIHJhZGl1cyArPSBheGlzTGFiZWwubGFiZWxHYXA7XG4gIHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbiA9IGF4aXNMaW5lQW5nbGVzLm1hcChmdW5jdGlvbiAoYW5nbGUpIHtcbiAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyYWRpdXMsIGFuZ2xlXSkpO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRBcmVhQ29uZmlnKHJhZGFyQXhpcykge1xuICB2YXIgYXJlYVJhZGl1cyA9IHJhZGFyQXhpcy5hcmVhUmFkaXVzLFxuICAgICAgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckF4aXMuYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFyQXhpcy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFyQXhpcy5yTGV2ZWw7XG4gIHZhciBuYW1lID0gcG9seWdvbiA/ICdyZWdQb2x5Z29uJyA6ICdyaW5nJztcbiAgcmV0dXJuIGFyZWFSYWRpdXMubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiByYWRhckF4aXMuc3BsaXRBcmVhLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0U3BsaXRBcmVhU2hhcGUocmFkYXJBeGlzLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRTcGxpdEFyZWFTdHlsZShyYWRhckF4aXMsIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0QXJlYVNoYXBlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uLFxuICAgICAgYXJlYVJhZGl1cyA9IHJhZGFyQXhpcy5hcmVhUmFkaXVzLFxuICAgICAgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcixcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3M7XG4gIHZhciBpbmRpY2F0b3JOdW0gPSBpbmRpY2F0b3IubGVuZ3RoO1xuICB2YXIgc2hhcGUgPSB7XG4gICAgcng6IGNlbnRlclBvc1swXSxcbiAgICByeTogY2VudGVyUG9zWzFdLFxuICAgIHI6IGFyZWFSYWRpdXNbaV1cbiAgfTtcbiAgaWYgKHBvbHlnb24pIHNoYXBlLnNpZGUgPSBpbmRpY2F0b3JOdW07XG4gIHJldHVybiBzaGFwZTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRBcmVhU3R5bGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBzcGxpdEFyZWEgPSByYWRhckF4aXMuc3BsaXRBcmVhLFxuICAgICAgcmluZ1JhZGl1cyA9IHJhZGFyQXhpcy5yaW5nUmFkaXVzLFxuICAgICAgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMsXG4gICAgICBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb24sXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zO1xuICB2YXIgY29sb3IgPSBzcGxpdEFyZWEuY29sb3IsXG4gICAgICBzdHlsZSA9IHNwbGl0QXJlYS5zdHlsZTtcbiAgc3R5bGUgPSBfb2JqZWN0U3ByZWFkKHtcbiAgICBmaWxsOiAncmdiYSgwLCAwLCAwLCAwKSdcbiAgfSwgc3R5bGUpO1xuICB2YXIgbGluZVdpZHRoID0gcmluZ1JhZGl1c1swXSAtIDA7XG5cbiAgaWYgKHBvbHlnb24pIHtcbiAgICB2YXIgcG9pbnQxID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyaW5nUmFkaXVzWzBdLCBheGlzTGluZUFuZ2xlc1swXV0pKTtcblxuICAgIHZhciBwb2ludDIgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3JpbmdSYWRpdXNbMF0sIGF4aXNMaW5lQW5nbGVzWzFdXSkpO1xuXG4gICAgbGluZVdpZHRoID0gKDAsIF91dGlsMi5nZXRQb2ludFRvTGluZURpc3RhbmNlKShjZW50ZXJQb3MsIHBvaW50MSwgcG9pbnQyKTtcbiAgfVxuXG4gIHN0eWxlID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKHN0eWxlLCB0cnVlKSwge1xuICAgIGxpbmVXaWR0aDogbGluZVdpZHRoXG4gIH0pO1xuICBpZiAoIWNvbG9yLmxlbmd0aCkgcmV0dXJuIHN0eWxlO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoc3R5bGUsIHtcbiAgICBzdHJva2U6IGNvbG9yW2kgJSBjb2xvck51bV1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZVNwbGl0QXJlYShncmFwaHMsIHJhZGFyQXhpcywgaSwgdXBkYXRlcikge1xuICB2YXIgY2FjaGUgPSBncmFwaHNbaV07XG4gIGlmICghY2FjaGUpIHJldHVybjtcbiAgdmFyIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uO1xuICB2YXIgbmFtZSA9IGNhY2hlWzBdLm5hbWU7XG4gIHZhciBjdXJyZW50TmFtZSA9IHBvbHlnb24gPyAncmVnUG9seWdvbicgOiAncmluZyc7XG4gIHZhciBkZWxBbGwgPSBjdXJyZW50TmFtZSAhPT0gbmFtZTtcbiAgaWYgKCFkZWxBbGwpIHJldHVybjtcbiAgY2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gIH0pO1xuICBncmFwaHNbaV0gPSBudWxsO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VTcGxpdEFyZWEoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgc2lkZSA9IGNvbmZpZy5zaGFwZS5zaWRlO1xuICBpZiAodHlwZW9mIHNpZGUgIT09ICdudW1iZXInKSByZXR1cm47XG4gIGdyYXBoLnNoYXBlLnNpZGUgPSBzaWRlO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVDb25maWcocmFkYXJBeGlzKSB7XG4gIHZhciByaW5nUmFkaXVzID0gcmFkYXJBeGlzLnJpbmdSYWRpdXMsXG4gICAgICBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFyQXhpcy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJBeGlzLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJBeGlzLnJMZXZlbDtcbiAgdmFyIG5hbWUgPSBwb2x5Z29uID8gJ3JlZ1BvbHlnb24nIDogJ3JpbmcnO1xuICByZXR1cm4gcmluZ1JhZGl1cy5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5zcGxpdExpbmUuc2hvdyxcbiAgICAgIHNoYXBlOiBnZXRTcGxpdExpbmVTaGFwZShyYWRhckF4aXMsIGkpLFxuICAgICAgc3R5bGU6IGdldFNwbGl0TGluZVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lU2hhcGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciByaW5nUmFkaXVzID0gcmFkYXJBeGlzLnJpbmdSYWRpdXMsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcixcbiAgICAgIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbjtcbiAgdmFyIHNoYXBlID0ge1xuICAgIHJ4OiBjZW50ZXJQb3NbMF0sXG4gICAgcnk6IGNlbnRlclBvc1sxXSxcbiAgICByOiByaW5nUmFkaXVzW2ldXG4gIH07XG4gIHZhciBpbmRpY2F0b3JOdW0gPSBpbmRpY2F0b3IubGVuZ3RoO1xuICBpZiAocG9seWdvbikgc2hhcGUuc2lkZSA9IGluZGljYXRvck51bTtcbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVTdHlsZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIHNwbGl0TGluZSA9IHJhZGFyQXhpcy5zcGxpdExpbmU7XG4gIHZhciBjb2xvciA9IHNwbGl0TGluZS5jb2xvcixcbiAgICAgIHN0eWxlID0gc3BsaXRMaW5lLnN0eWxlO1xuICBzdHlsZSA9IF9vYmplY3RTcHJlYWQoe1xuICAgIGZpbGw6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICB9LCBzdHlsZSk7XG4gIGlmICghY29sb3IubGVuZ3RoKSByZXR1cm4gc3R5bGU7XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShzdHlsZSwge1xuICAgIHN0cm9rZTogY29sb3JbaSAlIGNvbG9yTnVtXVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlU3BsaXRMaW5lKGdyYXBocywgcmFkYXJBeGlzLCBpLCB1cGRhdGVyKSB7XG4gIHZhciBjYWNoZSA9IGdyYXBoc1tpXTtcbiAgaWYgKCFjYWNoZSkgcmV0dXJuO1xuICB2YXIgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb247XG4gIHZhciBuYW1lID0gY2FjaGVbMF0ubmFtZTtcbiAgdmFyIGN1cnJlbk5hbWUgPSBwb2x5Z29uID8gJ3JlZ1BvbHlnb24nIDogJ3JpbmcnO1xuICB2YXIgZGVsQWxsID0gY3VycmVuTmFtZSAhPT0gbmFtZTtcbiAgaWYgKCFkZWxBbGwpIHJldHVybjtcbiAgY2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gIH0pO1xuICBncmFwaHNbaV0gPSBudWxsO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VTcGxpdExpbmUoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgc2lkZSA9IGNvbmZpZy5zaGFwZS5zaWRlO1xuICBpZiAodHlwZW9mIHNpZGUgIT09ICdudW1iZXInKSByZXR1cm47XG4gIGdyYXBoLnNoYXBlLnNpZGUgPSBzaWRlO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGluZUNvbmZpZyhyYWRhckF4aXMpIHtcbiAgdmFyIGF4aXNMaW5lUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xpbmVQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJBeGlzLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckF4aXMuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckF4aXMuckxldmVsO1xuICByZXR1cm4gYXhpc0xpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5heGlzTGluZS5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNMaW5lU2hhcGUocmFkYXJBeGlzLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRBeGlzTGluZVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xpbmVTaGFwZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICBheGlzTGluZVBvc2l0aW9uID0gcmFkYXJBeGlzLmF4aXNMaW5lUG9zaXRpb247XG4gIHZhciBwb2ludHMgPSBbY2VudGVyUG9zLCBheGlzTGluZVBvc2l0aW9uW2ldXTtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHBvaW50c1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGluZVN0eWxlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgYXhpc0xpbmUgPSByYWRhckF4aXMuYXhpc0xpbmU7XG4gIHZhciBjb2xvciA9IGF4aXNMaW5lLmNvbG9yLFxuICAgICAgc3R5bGUgPSBheGlzTGluZS5zdHlsZTtcbiAgaWYgKCFjb2xvci5sZW5ndGgpIHJldHVybiBzdHlsZTtcbiAgdmFyIGNvbG9yTnVtID0gY29sb3IubGVuZ3RoO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHN0eWxlLCB7XG4gICAgc3Ryb2tlOiBjb2xvcltpICUgY29sb3JOdW1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxDb25maWcocmFkYXJBeGlzKSB7XG4gIHZhciBheGlzTGFiZWxQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJBeGlzLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckF4aXMuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckF4aXMuckxldmVsO1xuICByZXR1cm4gYXhpc0xhYmVsUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5heGlzTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRBeGlzTGFibGVTaGFwZShyYWRhckF4aXMsIGkpLFxuICAgICAgc3R5bGU6IGdldEF4aXNMYWJsZVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmxlU2hhcGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBheGlzTGFiZWxQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbixcbiAgICAgIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3I7XG4gIHJldHVybiB7XG4gICAgY29udGVudDogaW5kaWNhdG9yW2ldLm5hbWUsXG4gICAgcG9zaXRpb246IGF4aXNMYWJlbFBvc2l0aW9uW2ldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJsZVN0eWxlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgYXhpc0xhYmVsID0gcmFkYXJBeGlzLmF4aXNMYWJlbCxcbiAgICAgIF9yYWRhckF4aXMkY2VudGVyUG9zID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHJhZGFyQXhpcy5jZW50ZXJQb3MsIDIpLFxuICAgICAgeCA9IF9yYWRhckF4aXMkY2VudGVyUG9zWzBdLFxuICAgICAgeSA9IF9yYWRhckF4aXMkY2VudGVyUG9zWzFdLFxuICAgICAgYXhpc0xhYmVsUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xhYmVsUG9zaXRpb247XG5cbiAgdmFyIGNvbG9yID0gYXhpc0xhYmVsLmNvbG9yLFxuICAgICAgc3R5bGUgPSBheGlzTGFiZWwuc3R5bGU7XG5cbiAgdmFyIF9heGlzTGFiZWxQb3NpdGlvbiRpID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGF4aXNMYWJlbFBvc2l0aW9uW2ldLCAyKSxcbiAgICAgIGxhYmVsWHBvcyA9IF9heGlzTGFiZWxQb3NpdGlvbiRpWzBdLFxuICAgICAgbGFiZWxZUG9zID0gX2F4aXNMYWJlbFBvc2l0aW9uJGlbMV07XG5cbiAgdmFyIHRleHRBbGlnbiA9IGxhYmVsWHBvcyA+IHggPyAnbGVmdCcgOiAncmlnaHQnO1xuICB2YXIgdGV4dEJhc2VsaW5lID0gbGFiZWxZUG9zID4geSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gIHN0eWxlID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICB0ZXh0QWxpZ246IHRleHRBbGlnbixcbiAgICB0ZXh0QmFzZWxpbmU6IHRleHRCYXNlbGluZVxuICB9LCBzdHlsZSk7XG4gIGlmICghY29sb3IubGVuZ3RoKSByZXR1cm4gc3R5bGU7XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShzdHlsZSwge1xuICAgIGZpbGw6IGNvbG9yW2kgJSBjb2xvck51bV1cbiAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50aXRsZSA9IHRpdGxlO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIHRpdGxlKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgdGl0bGUgPSBbXTtcblxuICBpZiAob3B0aW9uLnRpdGxlKSB7XG4gICAgdGl0bGVbMF0gPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy50aXRsZUNvbmZpZywgdHJ1ZSksIG9wdGlvbi50aXRsZSk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiB0aXRsZSxcbiAgICBrZXk6ICd0aXRsZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFRpdGxlQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUaXRsZUNvbmZpZyh0aXRsZUl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gX2NvbmZpZy50aXRsZUNvbmZpZy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gX2NvbmZpZy50aXRsZUNvbmZpZy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IF9jb25maWcudGl0bGVDb25maWcuckxldmVsO1xuICB2YXIgc2hhcGUgPSBnZXRUaXRsZVNoYXBlKHRpdGxlSXRlbSwgdXBkYXRlcik7XG4gIHZhciBzdHlsZSA9IGdldFRpdGxlU3R5bGUodGl0bGVJdGVtKTtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3RleHQnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgdmlzaWJsZTogdGl0bGVJdGVtLnNob3csXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogc2hhcGUsXG4gICAgc3R5bGU6IHN0eWxlXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRUaXRsZVNoYXBlKHRpdGxlSXRlbSwgdXBkYXRlcikge1xuICB2YXIgb2Zmc2V0ID0gdGl0bGVJdGVtLm9mZnNldCxcbiAgICAgIHRleHQgPSB0aXRsZUl0ZW0udGV4dDtcbiAgdmFyIF91cGRhdGVyJGNoYXJ0JGdyaWRBciA9IHVwZGF0ZXIuY2hhcnQuZ3JpZEFyZWEsXG4gICAgICB4ID0gX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyLngsXG4gICAgICB5ID0gX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyLnksXG4gICAgICB3ID0gX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyLnc7XG5cbiAgdmFyIF9vZmZzZXQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkob2Zmc2V0LCAyKSxcbiAgICAgIG94ID0gX29mZnNldFswXSxcbiAgICAgIG95ID0gX29mZnNldFsxXTtcblxuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IHRleHQsXG4gICAgcG9zaXRpb246IFt4ICsgdyAvIDIgKyBveCwgeSArIG95XVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRUaXRsZVN0eWxlKHRpdGxlSXRlbSkge1xuICB2YXIgc3R5bGUgPSB0aXRsZUl0ZW0uc3R5bGU7XG4gIHJldHVybiBzdHlsZTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY1JlbmRlciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKTtcblxudmFyIF9pbmRleCA9IHJlcXVpcmUoXCIuLi91dGlsL2luZGV4XCIpO1xuXG52YXIgcGllID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIGlyOiAwLFxuICAgIG9yOiAwLFxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgZW5kQW5nbGU6IDAsXG4gICAgY2xvY2tXaXNlOiB0cnVlXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmLnNoYXBlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdpcicsICdvcicsICdzdGFydEFuZ2xlJywgJ2VuZEFuZ2xlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BpZSBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYyLCBfcmVmMykge1xuICAgIHZhciBjdHggPSBfcmVmMi5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjMuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICBpciA9IHNoYXBlLmlyLFxuICAgICAgICBvciA9IHNoYXBlLm9yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIHJ4ID0gcGFyc2VJbnQocngpICsgMC41O1xuICAgIHJ5ID0gcGFyc2VJbnQocnkpICsgMC41O1xuICAgIGN0eC5hcmMocngsIHJ5LCBpciA+IDAgPyBpciA6IDAsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCAhY2xvY2tXaXNlKTtcbiAgICB2YXIgY29ubmVjdFBvaW50MSA9ICgwLCBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludCkocngsIHJ5LCBvciwgZW5kQW5nbGUpLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHApICsgMC41O1xuICAgIH0pO1xuICAgIHZhciBjb25uZWN0UG9pbnQyID0gKDAsIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50KShyeCwgcnksIGlyLCBzdGFydEFuZ2xlKS5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwKSArIDAuNTtcbiAgICB9KTtcbiAgICBjdHgubGluZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjb25uZWN0UG9pbnQxKSk7XG4gICAgY3R4LmFyYyhyeCwgcnksIG9yID4gMCA/IG9yIDogMCwgZW5kQW5nbGUsIHN0YXJ0QW5nbGUsIGNsb2NrV2lzZSk7XG4gICAgY3R4LmxpbmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY29ubmVjdFBvaW50MikpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgfVxufTtcbnZhciBhZ0FyYyA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwLFxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgZW5kQW5nbGU6IDAsXG4gICAgZ3JhZGllbnRTdGFydEFuZ2xlOiBudWxsLFxuICAgIGdyYWRpZW50RW5kQW5nbGU6IG51bGxcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjQpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNC5zaGFwZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAncicsICdzdGFydEFuZ2xlJywgJ2VuZEFuZ2xlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FnQXJjIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjUsIF9yZWY2KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY1LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNi5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNi5zdHlsZTtcbiAgICB2YXIgZ3JhZGllbnQgPSBzdHlsZS5ncmFkaWVudDtcbiAgICBncmFkaWVudCA9IGdyYWRpZW50Lm1hcChmdW5jdGlvbiAoY3YpIHtcbiAgICAgIHJldHVybiAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShjdik7XG4gICAgfSk7XG5cbiAgICBpZiAoZ3JhZGllbnQubGVuZ3RoID09PSAxKSB7XG4gICAgICBncmFkaWVudCA9IFtncmFkaWVudFswXSwgZ3JhZGllbnRbMF1dO1xuICAgIH1cblxuICAgIHZhciBncmFkaWVudEFyY051bSA9IGdyYWRpZW50Lmxlbmd0aCAtIDE7XG4gICAgdmFyIGdyYWRpZW50U3RhcnRBbmdsZSA9IHNoYXBlLmdyYWRpZW50U3RhcnRBbmdsZSxcbiAgICAgICAgZ3JhZGllbnRFbmRBbmdsZSA9IHNoYXBlLmdyYWRpZW50RW5kQW5nbGUsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBpZiAoZ3JhZGllbnRTdGFydEFuZ2xlID09PSBudWxsKSBncmFkaWVudFN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlO1xuICAgIGlmIChncmFkaWVudEVuZEFuZ2xlID09PSBudWxsKSBncmFkaWVudEVuZEFuZ2xlID0gZW5kQW5nbGU7XG4gICAgdmFyIGFuZ2xlR2FwID0gKGdyYWRpZW50RW5kQW5nbGUgLSBncmFkaWVudFN0YXJ0QW5nbGUpIC8gZ3JhZGllbnRBcmNOdW07XG4gICAgaWYgKGFuZ2xlR2FwID09PSBNYXRoLlBJICogMikgYW5nbGVHYXAgPSBNYXRoLlBJICogMiAtIDAuMDAxO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncmFkaWVudEFyY051bTsgaSsrKSB7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICB2YXIgc3RhcnRQb2ludCA9ICgwLCBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludCkocngsIHJ5LCByLCBzdGFydEFuZ2xlICsgYW5nbGVHYXAgKiBpKTtcbiAgICAgIHZhciBlbmRQb2ludCA9ICgwLCBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludCkocngsIHJ5LCByLCBzdGFydEFuZ2xlICsgYW5nbGVHYXAgKiAoaSArIDEpKTtcbiAgICAgIHZhciBjb2xvciA9ICgwLCBfaW5kZXguZ2V0TGluZWFyR3JhZGllbnRDb2xvcikoY3R4LCBzdGFydFBvaW50LCBlbmRQb2ludCwgW2dyYWRpZW50W2ldLCBncmFkaWVudFtpICsgMV1dKTtcbiAgICAgIHZhciBhcmNTdGFydEFuZ2xlID0gc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogaTtcbiAgICAgIHZhciBhcmNFbmRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBhbmdsZUdhcCAqIChpICsgMSk7XG4gICAgICB2YXIgZG9CcmVhayA9IGZhbHNlO1xuXG4gICAgICBpZiAoYXJjRW5kQW5nbGUgPiBlbmRBbmdsZSkge1xuICAgICAgICBhcmNFbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgICAgICBkb0JyZWFrID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY3R4LmFyYyhyeCwgcnksIHIsIGFyY1N0YXJ0QW5nbGUsIGFyY0VuZEFuZ2xlKTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgaWYgKGRvQnJlYWspIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcbnZhciBudW1iZXJUZXh0ID0ge1xuICBzaGFwZToge1xuICAgIG51bWJlcjogW10sXG4gICAgY29udGVudDogJycsXG4gICAgcG9zaXRpb246IFswLCAwXSxcbiAgICB0b0ZpeGVkOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY3KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjcuc2hhcGU7XG4gICAgdmFyIG51bWJlciA9IHNoYXBlLm51bWJlcixcbiAgICAgICAgY29udGVudCA9IHNoYXBlLmNvbnRlbnQsXG4gICAgICAgIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb247XG5cbiAgICBpZiAoIShudW1iZXIgaW5zdGFuY2VvZiBBcnJheSkgfHwgdHlwZW9mIGNvbnRlbnQgIT09ICdzdHJpbmcnIHx8ICEocG9zaXRpb24gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ051bWJlclRleHQgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmOCwgX3JlZjkpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjguY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY5LnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgbnVtYmVyID0gc2hhcGUubnVtYmVyLFxuICAgICAgICBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbixcbiAgICAgICAgdG9GaXhlZCA9IHNoYXBlLnRvRml4ZWQ7XG4gICAgdmFyIHRleHRTZWdtZW50cyA9IGNvbnRlbnQuc3BsaXQoJ3tudH0nKTtcbiAgICB2YXIgbGFzdFNlZ21lbnRJbmRleCA9IHRleHRTZWdtZW50cy5sZW5ndGggLSAxO1xuICAgIHZhciB0ZXh0U3RyaW5nID0gJyc7XG4gICAgdGV4dFNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24gKHQsIGkpIHtcbiAgICAgIHZhciBjdXJyZW50TnVtYmVyID0gbnVtYmVyW2ldO1xuICAgICAgaWYgKGkgPT09IGxhc3RTZWdtZW50SW5kZXgpIGN1cnJlbnROdW1iZXIgPSAnJztcbiAgICAgIGlmICh0eXBlb2YgY3VycmVudE51bWJlciA9PT0gJ251bWJlcicpIGN1cnJlbnROdW1iZXIgPSBjdXJyZW50TnVtYmVyLnRvRml4ZWQodG9GaXhlZCk7XG4gICAgICB0ZXh0U3RyaW5nICs9IHQgKyAoY3VycmVudE51bWJlciB8fCAnJyk7XG4gICAgfSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2VUZXh0LmFwcGx5KGN0eCwgW3RleHRTdHJpbmddLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uKSkpO1xuICAgIGN0eC5maWxsVGV4dC5hcHBseShjdHgsIFt0ZXh0U3RyaW5nXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3NpdGlvbikpKTtcbiAgfVxufTtcbnZhciBsaW5lSWNvbiA9IHtcbiAgc2hhcGU6IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgdzogMCxcbiAgICBoOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYxMCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMC5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG5cbiAgICBpZiAodHlwZW9mIHggIT09ICdudW1iZXInIHx8IHR5cGVvZiB5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdyAhPT0gJ251bWJlcicgfHwgdHlwZW9mIGggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdsaW5lSWNvbiBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYxMSwgX3JlZjEyKSB7XG4gICAgdmFyIGN0eCA9IF9yZWYxMS5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEyLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgdmFyIGhhbGZIID0gaCAvIDI7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY3R4LmZpbGxTdHlsZTtcbiAgICBjdHgubW92ZVRvKHgsIHkgKyBoYWxmSCk7XG4gICAgY3R4LmxpbmVUbyh4ICsgdywgeSArIGhhbGZIKTtcbiAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByYWRpdXMgPSBoYWxmSCAtIDUgKiAyO1xuICAgIGlmIChyYWRpdXMgPD0gMCkgcmFkaXVzID0gMztcbiAgICBjdHguYXJjKHggKyB3IC8gMiwgeSArIGhhbGZILCByYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHgubGluZVdpZHRoID0gNTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICcjZmZmJztcbiAgICBjdHguZmlsbCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMTMpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTMuc2hhcGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5SZWN0KShwb3NpdGlvbiwgeCwgeSwgdywgaCk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMTQpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTQuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjE0LnN0eWxlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFt4ICsgdyAvIDIsIHkgKyBoIC8gMl07XG4gIH1cbn07XG4oMCwgX2NSZW5kZXIuZXh0ZW5kTmV3R3JhcGgpKCdwaWUnLCBwaWUpO1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgnYWdBcmMnLCBhZ0FyYyk7XG4oMCwgX2NSZW5kZXIuZXh0ZW5kTmV3R3JhcGgpKCdudW1iZXJUZXh0JywgbnVtYmVyVGV4dCk7XG4oMCwgX2NSZW5kZXIuZXh0ZW5kTmV3R3JhcGgpKCdsaW5lSWNvbicsIGxpbmVJY29uKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJjaGFuZ2VEZWZhdWx0Q29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9jb25maWcuY2hhbmdlRGVmYXVsdENvbmZpZztcbiAgfVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9jaGFydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NsYXNzL2NoYXJ0cy5jbGFzc1wiKSk7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnXCIpO1xuXG52YXIgX2RlZmF1bHQgPSBfY2hhcnRzW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5maWx0ZXJOb25OdW1iZXIgPSBmaWx0ZXJOb25OdW1iZXI7XG5leHBvcnRzLmRlZXBNZXJnZSA9IGRlZXBNZXJnZTtcbmV4cG9ydHMubXVsQWRkID0gbXVsQWRkO1xuZXhwb3J0cy5tZXJnZVNhbWVTdGFja0RhdGEgPSBtZXJnZVNhbWVTdGFja0RhdGE7XG5leHBvcnRzLmdldFR3b1BvaW50RGlzdGFuY2UgPSBnZXRUd29Qb2ludERpc3RhbmNlO1xuZXhwb3J0cy5nZXRMaW5lYXJHcmFkaWVudENvbG9yID0gZ2V0TGluZWFyR3JhZGllbnRDb2xvcjtcbmV4cG9ydHMuZ2V0UG9seWxpbmVMZW5ndGggPSBnZXRQb2x5bGluZUxlbmd0aDtcbmV4cG9ydHMuZ2V0UG9pbnRUb0xpbmVEaXN0YW5jZSA9IGdldFBvaW50VG9MaW5lRGlzdGFuY2U7XG5leHBvcnRzLmluaXROZWVkU2VyaWVzID0gaW5pdE5lZWRTZXJpZXM7XG5leHBvcnRzLnJhZGlhblRvQW5nbGUgPSByYWRpYW5Ub0FuZ2xlO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxuZnVuY3Rpb24gZmlsdGVyTm9uTnVtYmVyKGFycmF5KSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gdHlwZW9mIG4gPT09ICdudW1iZXInO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZGVlcE1lcmdlKHRhcmdldCwgbWVyZ2VkKSB7XG4gIGZvciAodmFyIGtleSBpbiBtZXJnZWQpIHtcbiAgICB0YXJnZXRba2V5XSA9IHRhcmdldFtrZXldICYmICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHRhcmdldFtrZXldKSA9PT0gJ29iamVjdCcgPyBkZWVwTWVyZ2UodGFyZ2V0W2tleV0sIG1lcmdlZFtrZXldKSA6IHRhcmdldFtrZXldID0gbWVyZ2VkW2tleV07XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBtdWxBZGQobnVtcykge1xuICBudW1zID0gZmlsdGVyTm9uTnVtYmVyKG51bXMpO1xuICByZXR1cm4gbnVtcy5yZWR1Y2UoZnVuY3Rpb24gKGFsbCwgbnVtKSB7XG4gICAgcmV0dXJuIGFsbCArIG51bTtcbiAgfSwgMCk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlU2FtZVN0YWNrRGF0YShpdGVtLCBzZXJpZXMpIHtcbiAgdmFyIHN0YWNrID0gaXRlbS5zdGFjaztcbiAgaWYgKCFzdGFjaykgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbS5kYXRhKTtcbiAgdmFyIHN0YWNrcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgcyA9IF9yZWYuc3RhY2s7XG4gICAgcmV0dXJuIHMgPT09IHN0YWNrO1xuICB9KTtcbiAgdmFyIGluZGV4ID0gc3RhY2tzLmZpbmRJbmRleChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgZCA9IF9yZWYyLmRhdGE7XG4gICAgcmV0dXJuIGQgPT09IGl0ZW0uZGF0YTtcbiAgfSk7XG4gIHZhciBkYXRhcyA9IHN0YWNrcy5zcGxpY2UoMCwgaW5kZXggKyAxKS5tYXAoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmMy5kYXRhO1xuICAgIHJldHVybiBkYXRhO1xuICB9KTtcbiAgdmFyIGRhdGFMZW5ndGggPSBkYXRhc1swXS5sZW5ndGg7XG4gIHJldHVybiBuZXcgQXJyYXkoZGF0YUxlbmd0aCkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBtdWxBZGQoZGF0YXMubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gZFtpXTtcbiAgICB9KSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50T25lLCBwb2ludFR3bykge1xuICB2YXIgbWludXNYID0gTWF0aC5hYnMocG9pbnRPbmVbMF0gLSBwb2ludFR3b1swXSk7XG4gIHZhciBtaW51c1kgPSBNYXRoLmFicyhwb2ludE9uZVsxXSAtIHBvaW50VHdvWzFdKTtcbiAgcmV0dXJuIE1hdGguc3FydChtaW51c1ggKiBtaW51c1ggKyBtaW51c1kgKiBtaW51c1kpO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lYXJHcmFkaWVudENvbG9yKGN0eCwgYmVnaW4sIGVuZCwgY29sb3IpIHtcbiAgaWYgKCFjdHggfHwgIWJlZ2luIHx8ICFlbmQgfHwgIWNvbG9yLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgY29sb3JzID0gY29sb3I7XG4gIHR5cGVvZiBjb2xvcnMgPT09ICdzdHJpbmcnICYmIChjb2xvcnMgPSBbY29sb3IsIGNvbG9yXSk7XG4gIHZhciBsaW5lYXJHcmFkaWVudENvbG9yID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50LmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShiZWdpbikuY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZW5kKSkpO1xuICB2YXIgY29sb3JHYXAgPSAxIC8gKGNvbG9ycy5sZW5ndGggLSAxKTtcbiAgY29sb3JzLmZvckVhY2goZnVuY3Rpb24gKGMsIGkpIHtcbiAgICByZXR1cm4gbGluZWFyR3JhZGllbnRDb2xvci5hZGRDb2xvclN0b3AoY29sb3JHYXAgKiBpLCBjKTtcbiAgfSk7XG4gIHJldHVybiBsaW5lYXJHcmFkaWVudENvbG9yO1xufVxuXG5mdW5jdGlvbiBnZXRQb2x5bGluZUxlbmd0aChwb2ludHMpIHtcbiAgdmFyIGxpbmVTZWdtZW50cyA9IG5ldyBBcnJheShwb2ludHMubGVuZ3RoIC0gMSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBbcG9pbnRzW2ldLCBwb2ludHNbaSArIDFdXTtcbiAgfSk7XG4gIHZhciBsZW5ndGhzID0gbGluZVNlZ21lbnRzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBnZXRUd29Qb2ludERpc3RhbmNlLmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtKSk7XG4gIH0pO1xuICByZXR1cm4gbXVsQWRkKGxlbmd0aHMpO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFRvTGluZURpc3RhbmNlKHBvaW50LCBsaW5lUG9pbnRPbmUsIGxpbmVQb2ludFR3bykge1xuICB2YXIgYSA9IGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnQsIGxpbmVQb2ludE9uZSk7XG4gIHZhciBiID0gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgbGluZVBvaW50VHdvKTtcbiAgdmFyIGMgPSBnZXRUd29Qb2ludERpc3RhbmNlKGxpbmVQb2ludE9uZSwgbGluZVBvaW50VHdvKTtcbiAgcmV0dXJuIDAuNSAqIE1hdGguc3FydCgoYSArIGIgKyBjKSAqIChhICsgYiAtIGMpICogKGEgKyBjIC0gYikgKiAoYiArIGMgLSBhKSkgLyBjO1xufVxuXG5mdW5jdGlvbiBpbml0TmVlZFNlcmllcyhzZXJpZXMsIGNvbmZpZywgdHlwZSkge1xuICBzZXJpZXMgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgIHZhciBzdCA9IF9yZWY0LnR5cGU7XG4gICAgcmV0dXJuIHN0ID09PSB0eXBlO1xuICB9KTtcbiAgc2VyaWVzID0gc2VyaWVzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBkZWVwTWVyZ2UoKDAsIF91dGlsLmRlZXBDbG9uZSkoY29uZmlnLCB0cnVlKSwgaXRlbSk7XG4gIH0pO1xuICByZXR1cm4gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjUpIHtcbiAgICB2YXIgc2hvdyA9IF9yZWY1LnNob3c7XG4gICAgcmV0dXJuIHNob3c7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByYWRpYW5Ub0FuZ2xlKHJhZGlhbikge1xuICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcbn0iLCJmdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aEhvbGVzOyIsImZ1bmN0aW9uIF9hcnJheVdpdGhvdXRIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcnIyW2ldID0gYXJyW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBhcnIyO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aG91dEhvbGVzOyIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWZpbmVQcm9wZXJ0eTsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0OyIsImZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXkoaXRlcikge1xuICBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyKSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlcikgPT09IFwiW29iamVjdCBBcmd1bWVudHNdXCIpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pdGVyYWJsZVRvQXJyYXk7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkge1xuICB2YXIgX2FyciA9IFtdO1xuICB2YXIgX24gPSB0cnVlO1xuICB2YXIgX2QgPSBmYWxzZTtcbiAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2QgPSB0cnVlO1xuICAgIF9lID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9hcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheUxpbWl0OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVJlc3Q7IiwiZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX25vbkl0ZXJhYmxlU3ByZWFkOyIsInZhciBhcnJheVdpdGhIb2xlcyA9IHJlcXVpcmUoXCIuL2FycmF5V2l0aEhvbGVzXCIpO1xuXG52YXIgaXRlcmFibGVUb0FycmF5TGltaXQgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlMaW1pdFwiKTtcblxudmFyIG5vbkl0ZXJhYmxlUmVzdCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlUmVzdFwiKTtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7XG4gIHJldHVybiBhcnJheVdpdGhIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgbm9uSXRlcmFibGVSZXN0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NsaWNlZFRvQXJyYXk7IiwidmFyIGFycmF5V2l0aG91dEhvbGVzID0gcmVxdWlyZShcIi4vYXJyYXlXaXRob3V0SG9sZXNcIik7XG5cbnZhciBpdGVyYWJsZVRvQXJyYXkgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlcIik7XG5cbnZhciBub25JdGVyYWJsZVNwcmVhZCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlU3ByZWFkXCIpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7XG4gIHJldHVybiBhcnJheVdpdGhvdXRIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheShhcnIpIHx8IG5vbkl0ZXJhYmxlU3ByZWFkKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3RvQ29uc3VtYWJsZUFycmF5OyIsImZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZjIgPSBmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YyID0gZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mMihvYmopOyB9XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgX3R5cGVvZjIoU3ltYm9sLml0ZXJhdG9yKSA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gX3R5cGVvZjIob2JqKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogX3R5cGVvZjIob2JqKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmJlemllckN1cnZlVG9Qb2x5bGluZSA9IGJlemllckN1cnZlVG9Qb2x5bGluZTtcbmV4cG9ydHMuZ2V0QmV6aWVyQ3VydmVMZW5ndGggPSBnZXRCZXppZXJDdXJ2ZUxlbmd0aDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgcG93ID0gTWF0aC5wb3csXG4gICAgY2VpbCA9IE1hdGguY2VpbCxcbiAgICBhYnMgPSBNYXRoLmFiczsgLy8gSW5pdGlhbGl6ZSB0aGUgbnVtYmVyIG9mIHBvaW50cyBwZXIgY3VydmVcblxudmFyIGRlZmF1bHRTZWdtZW50UG9pbnRzTnVtID0gNTA7XG4vKipcclxuICogQGV4YW1wbGUgZGF0YSBzdHJ1Y3R1cmUgb2YgYmV6aWVyQ3VydmVcclxuICogYmV6aWVyQ3VydmUgPSBbXHJcbiAqICAvLyBTdGFydGluZyBwb2ludCBvZiB0aGUgY3VydmVcclxuICogIFsxMCwgMTBdLFxyXG4gKiAgLy8gQmV6aWVyQ3VydmUgc2VnbWVudCBkYXRhIChjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludClcclxuICogIFtcclxuICogICAgWzIwLCAyMF0sIFs0MCwgMjBdLCBbNTAsIDEwXVxyXG4gKiAgXSxcclxuICogIC4uLlxyXG4gKiBdXHJcbiAqL1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICAgICAgQWJzdHJhY3QgdGhlIGN1cnZlIGFzIGEgcG9seWxpbmUgY29uc2lzdGluZyBvZiBOIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBiZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIGNhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgMS0yMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgQ2FsY3VsYXRpb24gcmVzdWx0cyBhbmQgcmVsYXRlZCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICAgIE9wdGlvbi5zZWdtZW50UG9pbnRzIFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgIE9wdGlvbi5jeWNsZXMgTnVtYmVyIG9mIGl0ZXJhdGlvbnNcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgT3B0aW9uLnJvdW5kcyBUaGUgbnVtYmVyIG9mIHJlY3Vyc2lvbnMgZm9yIHRoZSBsYXN0IGl0ZXJhdGlvblxyXG4gKi9cblxuZnVuY3Rpb24gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcbiAgdmFyIHNlZ21lbnRzTnVtID0gYmV6aWVyQ3VydmUubGVuZ3RoIC0gMTtcbiAgdmFyIHN0YXJ0UG9pbnQgPSBiZXppZXJDdXJ2ZVswXTtcbiAgdmFyIGVuZFBvaW50ID0gYmV6aWVyQ3VydmVbc2VnbWVudHNOdW1dWzJdO1xuICB2YXIgc2VnbWVudHMgPSBiZXppZXJDdXJ2ZS5zbGljZSgxKTtcbiAgdmFyIGdldFNlZ21lbnRUUG9pbnRGdW5zID0gc2VnbWVudHMubWFwKGZ1bmN0aW9uIChzZWcsIGkpIHtcbiAgICB2YXIgYmVnaW5Qb2ludCA9IGkgPT09IDAgPyBzdGFydFBvaW50IDogc2VnbWVudHNbaSAtIDFdWzJdO1xuICAgIHJldHVybiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bi5hcHBseSh2b2lkIDAsIFtiZWdpblBvaW50XS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzZWcpKSk7XG4gIH0pOyAvLyBJbml0aWFsaXplIHRoZSBjdXJ2ZSB0byBhIHBvbHlsaW5lXG5cbiAgdmFyIHNlZ21lbnRQb2ludHNOdW0gPSBuZXcgQXJyYXkoc2VnbWVudHNOdW0pLmZpbGwoZGVmYXVsdFNlZ21lbnRQb2ludHNOdW0pO1xuICB2YXIgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7IC8vIENhbGN1bGF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcG9pbnRzIGJ5IGl0ZXJhdGl2ZWx5XG5cbiAgdmFyIHJlc3VsdCA9IGNhbGNVbmlmb3JtUG9pbnRzQnlJdGVyYXRpb24oc2VnbWVudFBvaW50cywgZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRzLCBwcmVjaXNpb24pO1xuICByZXN1bHQuc2VnbWVudFBvaW50cy5wdXNoKGVuZFBvaW50KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gIEdlbmVyYXRlIGEgbWV0aG9kIGZvciBvYnRhaW5pbmcgY29ycmVzcG9uZGluZyBwb2ludCBieSB0IGFjY29yZGluZyB0byBjdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlZ2luUG9pbnQgICAgQmV6aWVyQ3VydmUgYmVnaW4gcG9pbnQuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQxIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDEuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQyIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDIuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBlbmRQb2ludCAgICAgIEJlemllckN1cnZlIGVuZCBwb2ludC4gW3gsIHldXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBFeHBlY3RlZCBmdW5jdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bihiZWdpblBvaW50LCBjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICB2YXIgdFN1YmVkMSA9IDEgLSB0O1xuICAgIHZhciB0U3ViZWQxUG93MyA9IHBvdyh0U3ViZWQxLCAzKTtcbiAgICB2YXIgdFN1YmVkMVBvdzIgPSBwb3codFN1YmVkMSwgMik7XG4gICAgdmFyIHRQb3czID0gcG93KHQsIDMpO1xuICAgIHZhciB0UG93MiA9IHBvdyh0LCAyKTtcbiAgICByZXR1cm4gW2JlZ2luUG9pbnRbMF0gKiB0U3ViZWQxUG93MyArIDMgKiBjb250cm9sUG9pbnQxWzBdICogdCAqIHRTdWJlZDFQb3cyICsgMyAqIGNvbnRyb2xQb2ludDJbMF0gKiB0UG93MiAqIHRTdWJlZDEgKyBlbmRQb2ludFswXSAqIHRQb3czLCBiZWdpblBvaW50WzFdICogdFN1YmVkMVBvdzMgKyAzICogY29udHJvbFBvaW50MVsxXSAqIHQgKiB0U3ViZWQxUG93MiArIDMgKiBjb250cm9sUG9pbnQyWzFdICogdFBvdzIgKiB0U3ViZWQxICsgZW5kUG9pbnRbMV0gKiB0UG93M107XG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MSBCZXppZXJDdXJ2ZSBiZWdpbiBwb2ludC4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MiBCZXppZXJDdXJ2ZSBjb250cm9sUG9pbnQxLiBbeCwgeV1cclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBkaXN0YW5jZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKF9yZWYsIF9yZWYyKSB7XG4gIHZhciBfcmVmMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgIGF4ID0gX3JlZjNbMF0sXG4gICAgICBheSA9IF9yZWYzWzFdO1xuXG4gIHZhciBfcmVmNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMiwgMiksXG4gICAgICBieCA9IF9yZWY0WzBdLFxuICAgICAgYnkgPSBfcmVmNFsxXTtcblxuICByZXR1cm4gc3FydChwb3coYXggLSBieCwgMikgKyBwb3coYXkgLSBieSwgMikpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN1bSBvZiB0aGUgYXJyYXkgb2YgbnVtYmVyc1xyXG4gKiBAcGFyYW0ge0FycmF5fSBudW1zIEFuIGFycmF5IG9mIG51bWJlcnNcclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBzdW1cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0TnVtc1N1bShudW1zKSB7XG4gIHJldHVybiBudW1zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBudW0pIHtcbiAgICByZXR1cm4gc3VtICsgbnVtO1xuICB9LCAwKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzIE11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzKSB7XG4gIHJldHVybiBzZWdtZW50UG9pbnRzLm1hcChmdW5jdGlvbiAocG9pbnRzLCBpKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheShwb2ludHMubGVuZ3RoIC0gMSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKHRlbXAsIGopIHtcbiAgICAgIHJldHVybiBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50c1tqXSwgcG9pbnRzW2ogKyAxXSk7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHMgTXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSBEaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U2VnbWVudFBvaW50c0J5TnVtKGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50UG9pbnRzTnVtKSB7XG4gIHJldHVybiBnZXRTZWdtZW50VFBvaW50RnVucy5tYXAoZnVuY3Rpb24gKGdldFNlZ21lbnRUUG9pbnRGdW4sIGkpIHtcbiAgICB2YXIgdEdhcCA9IDEgLyBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgIHJldHVybiBuZXcgQXJyYXkoc2VnbWVudFBvaW50c051bVtpXSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uIChmb28sIGopIHtcbiAgICAgIHJldHVybiBnZXRTZWdtZW50VFBvaW50RnVuKGogKiB0R2FwKTtcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgc3VtIG9mIGRldmlhdGlvbnMgYmV0d2VlbiBsaW5lIHNlZ21lbnQgYW5kIHRoZSBhdmVyYWdlIGxlbmd0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzRGlzdGFuY2UgU2VnbWVudCBsZW5ndGggb2YgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGF2Z0xlbmd0aCAgICAgICAgICAgIEF2ZXJhZ2UgbGVuZ3RoIG9mIHRoZSBsaW5lIHNlZ21lbnRcclxuICogQHJldHVybiB7TnVtYmVyfSBEZXZpYXRpb25zXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEFsbERldmlhdGlvbnMoc2VnbWVudFBvaW50c0Rpc3RhbmNlLCBhdmdMZW5ndGgpIHtcbiAgcmV0dXJuIHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgIHJldHVybiBzZWcubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gYWJzKHMgLSBhdmdMZW5ndGgpO1xuICAgIH0pO1xuICB9KS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gIH0pLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHYpIHtcbiAgICByZXR1cm4gdG90YWwgKyB2O1xuICB9LCAwKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2FsY3VsYXRlIHVuaWZvcm1seSBkaXN0cmlidXRlZCBwb2ludHMgYnkgaXRlcmF0aXZlbHlcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50cyAgICAgICAgTXVsdGlwbGUgc2V0ZCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtBcnJheX0gZ2V0U2VnbWVudFRQb2ludEZ1bnMgRnVuY3Rpb25zIG9mIGdldCBhIHBvaW50IG9uIHRoZSBjdXJ2ZSB3aXRoIHRcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudHMgICAgICAgICAgICAgQmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICAgICAgICAgICBDYWxjdWxhdGlvbiBhY2N1cmFjeVxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IENhbGN1bGF0aW9uIHJlc3VsdHMgYW5kIHJlbGF0ZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gIE9wdGlvbi5zZWdtZW50UG9pbnRzIFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gT3B0aW9uLmN5Y2xlcyBOdW1iZXIgb2YgaXRlcmF0aW9uc1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE9wdGlvbi5yb3VuZHMgVGhlIG51bWJlciBvZiByZWN1cnNpb25zIGZvciB0aGUgbGFzdCBpdGVyYXRpb25cclxuICovXG5cblxuZnVuY3Rpb24gY2FsY1VuaWZvcm1Qb2ludHNCeUl0ZXJhdGlvbihzZWdtZW50UG9pbnRzLCBnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudHMsIHByZWNpc2lvbikge1xuICAvLyBUaGUgbnVtYmVyIG9mIGxvb3BzIGZvciB0aGUgY3VycmVudCBpdGVyYXRpb25cbiAgdmFyIHJvdW5kcyA9IDQ7IC8vIE51bWJlciBvZiBpdGVyYXRpb25zXG5cbiAgdmFyIGN5Y2xlcyA9IDE7XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoKSB7XG4gICAgLy8gUmVjYWxjdWxhdGUgdGhlIG51bWJlciBvZiBwb2ludHMgcGVyIGN1cnZlIGJhc2VkIG9uIHRoZSBsYXN0IGl0ZXJhdGlvbiBkYXRhXG4gICAgdmFyIHRvdGFsUG9pbnRzTnVtID0gc2VnbWVudFBvaW50cy5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7IC8vIEFkZCBsYXN0IHBvaW50cyBvZiBzZWdtZW50IHRvIGNhbGMgZXhhY3Qgc2VnbWVudCBsZW5ndGhcblxuICAgIHNlZ21lbnRQb2ludHMuZm9yRWFjaChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgICByZXR1cm4gc2VnLnB1c2goc2VnbWVudHNbaV1bMl0pO1xuICAgIH0pO1xuICAgIHZhciBzZWdtZW50UG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50cyk7XG4gICAgdmFyIGxpbmVTZWdtZW50TnVtID0gc2VnbWVudFBvaW50c0Rpc3RhbmNlLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICB2YXIgc2VnbWVudGxlbmd0aCA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgICB9KTtcbiAgICB2YXIgdG90YWxMZW5ndGggPSBnZXROdW1zU3VtKHNlZ21lbnRsZW5ndGgpO1xuICAgIHZhciBhdmdMZW5ndGggPSB0b3RhbExlbmd0aCAvIGxpbmVTZWdtZW50TnVtOyAvLyBDaGVjayBpZiBwcmVjaXNpb24gaXMgcmVhY2hlZFxuXG4gICAgdmFyIGFsbERldmlhdGlvbnMgPSBnZXRBbGxEZXZpYXRpb25zKHNlZ21lbnRQb2ludHNEaXN0YW5jZSwgYXZnTGVuZ3RoKTtcbiAgICBpZiAoYWxsRGV2aWF0aW9ucyA8PSBwcmVjaXNpb24pIHJldHVybiBcImJyZWFrXCI7XG4gICAgdG90YWxQb2ludHNOdW0gPSBjZWlsKGF2Z0xlbmd0aCAvIHByZWNpc2lvbiAqIHRvdGFsUG9pbnRzTnVtICogMS4xKTtcbiAgICB2YXIgc2VnbWVudFBvaW50c051bSA9IHNlZ21lbnRsZW5ndGgubWFwKGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgICAgIHJldHVybiBjZWlsKGxlbmd0aCAvIHRvdGFsTGVuZ3RoICogdG90YWxQb2ludHNOdW0pO1xuICAgIH0pOyAvLyBDYWxjdWxhdGUgdGhlIHBvaW50cyBhZnRlciByZWRpc3RyaWJ1dGlvblxuXG4gICAgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7XG4gICAgdG90YWxQb2ludHNOdW0gPSBzZWdtZW50UG9pbnRzLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICB2YXIgc2VnbWVudFBvaW50c0Zvckxlbmd0aCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VnbWVudFBvaW50cykpO1xuICAgIHNlZ21lbnRQb2ludHNGb3JMZW5ndGguZm9yRWFjaChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgICByZXR1cm4gc2VnLnB1c2goc2VnbWVudHNbaV1bMl0pO1xuICAgIH0pO1xuICAgIHNlZ21lbnRQb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzRm9yTGVuZ3RoKTtcbiAgICBsaW5lU2VnbWVudE51bSA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgc2VnbWVudGxlbmd0aCA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgICB9KTtcbiAgICB0b3RhbExlbmd0aCA9IGdldE51bXNTdW0oc2VnbWVudGxlbmd0aCk7XG4gICAgYXZnTGVuZ3RoID0gdG90YWxMZW5ndGggLyBsaW5lU2VnbWVudE51bTtcbiAgICB2YXIgc3RlcFNpemUgPSAxIC8gdG90YWxQb2ludHNOdW0gLyAxMDsgLy8gUmVjdXJzaXZlbHkgZm9yIGVhY2ggc2VnbWVudCBvZiB0aGUgcG9seWxpbmVcblxuICAgIGdldFNlZ21lbnRUUG9pbnRGdW5zLmZvckVhY2goZnVuY3Rpb24gKGdldFNlZ21lbnRUUG9pbnRGdW4sIGkpIHtcbiAgICAgIHZhciBjdXJyZW50U2VnbWVudFBvaW50c051bSA9IHNlZ21lbnRQb2ludHNOdW1baV07XG4gICAgICB2YXIgdCA9IG5ldyBBcnJheShjdXJyZW50U2VnbWVudFBvaW50c051bSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uIChmb28sIGopIHtcbiAgICAgICAgcmV0dXJuIGogLyBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgICAgfSk7IC8vIFJlcGVhdGVkIHJlY3Vyc2l2ZSBvZmZzZXRcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3VuZHM7IHIrKykge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2UoW3NlZ21lbnRQb2ludHNbaV1dKVswXTtcbiAgICAgICAgdmFyIGRldmlhdGlvbnMgPSBkaXN0YW5jZS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICByZXR1cm4gZCAtIGF2Z0xlbmd0aDtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY3VycmVudFNlZ21lbnRQb2ludHNOdW07IGorKykge1xuICAgICAgICAgIGlmIChqID09PSAwKSByZXR1cm47XG4gICAgICAgICAgb2Zmc2V0ICs9IGRldmlhdGlvbnNbaiAtIDFdO1xuICAgICAgICAgIHRbal0gLT0gc3RlcFNpemUgKiBvZmZzZXQ7XG4gICAgICAgICAgaWYgKHRbal0gPiAxKSB0W2pdID0gMTtcbiAgICAgICAgICBpZiAodFtqXSA8IDApIHRbal0gPSAwO1xuICAgICAgICAgIHNlZ21lbnRQb2ludHNbaV1bal0gPSBnZXRTZWdtZW50VFBvaW50RnVuKHRbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcm91bmRzICo9IDQ7XG4gICAgY3ljbGVzKys7XG4gIH07XG5cbiAgZG8ge1xuICAgIHZhciBfcmV0ID0gX2xvb3AoKTtcblxuICAgIGlmIChfcmV0ID09PSBcImJyZWFrXCIpIGJyZWFrO1xuICB9IHdoaWxlIChyb3VuZHMgPD0gMTAyNSk7XG5cbiAgc2VnbWVudFBvaW50cyA9IHNlZ21lbnRQb2ludHMucmVkdWNlKGZ1bmN0aW9uIChhbGwsIHNlZykge1xuICAgIHJldHVybiBhbGwuY29uY2F0KHNlZyk7XG4gIH0sIFtdKTtcbiAgcmV0dXJuIHtcbiAgICBzZWdtZW50UG9pbnRzOiBzZWdtZW50UG9pbnRzLFxuICAgIGN5Y2xlczogY3ljbGVzLFxuICAgIHJvdW5kczogcm91bmRzXG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcG9seWxpbmUgY29ycmVzcG9uZGluZyB0byB0aGUgQmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIEJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgQ2FsY3VsYXRpb24gYWNjdXJhY3kuIFJlY29tbWVuZGVkIGZvciAxLTIwLiBEZWZhdWx0ID0gNVxyXG4gKiBAcmV0dXJuIHtBcnJheXxCb29sZWFufSBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvbiAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gYmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG5cbiAgaWYgKCFiZXppZXJDdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2JlemllckN1cnZlVG9Qb2x5bGluZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghKGJlemllckN1cnZlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS5lcnJvcignYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBQYXJhbWV0ZXIgYmV6aWVyQ3VydmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZWNpc2lvbiAhPT0gJ251bWJlcicpIHtcbiAgICBjb25zb2xlLmVycm9yKCdiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IFBhcmFtZXRlciBwcmVjaXNpb24gbXVzdCBiZSBhIG51bWJlciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgX2Fic3RyYWN0QmV6aWVyQ3VydmVUID0gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUsIHByZWNpc2lvbiksXG4gICAgICBzZWdtZW50UG9pbnRzID0gX2Fic3RyYWN0QmV6aWVyQ3VydmVULnNlZ21lbnRQb2ludHM7XG5cbiAgcmV0dXJuIHNlZ21lbnRQb2ludHM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgYmV6aWVyIGN1cnZlIGxlbmd0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBiZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIGNhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgNS0xMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7TnVtYmVyfEJvb2xlYW59IEJlemllckN1cnZlIGxlbmd0aCAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVMZW5ndGgoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcblxuICBpZiAoIWJlemllckN1cnZlKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIShiZXppZXJDdXJ2ZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldEJlemllckN1cnZlTGVuZ3RoOiBQYXJhbWV0ZXIgYmV6aWVyQ3VydmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZWNpc2lvbiAhPT0gJ251bWJlcicpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRCZXppZXJDdXJ2ZUxlbmd0aDogUGFyYW1ldGVyIHByZWNpc2lvbiBtdXN0IGJlIGEgbnVtYmVyIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBfYWJzdHJhY3RCZXppZXJDdXJ2ZVQyID0gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUsIHByZWNpc2lvbiksXG4gICAgICBzZWdtZW50UG9pbnRzID0gX2Fic3RyYWN0QmV6aWVyQ3VydmVUMi5zZWdtZW50UG9pbnRzOyAvLyBDYWxjdWxhdGUgdGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgcG9pbnRzIHRoYXQgbWFrZSB1cCB0aGUgcG9seWxpbmVcblxuXG4gIHZhciBwb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShbc2VnbWVudFBvaW50c10pWzBdO1xuICB2YXIgbGVuZ3RoID0gZ2V0TnVtc1N1bShwb2ludHNEaXN0YW5jZSk7XG4gIHJldHVybiBsZW5ndGg7XG59XG5cbnZhciBfZGVmYXVsdCA9IGJlemllckN1cnZlVG9Qb2x5bGluZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIEFic3RyYWN0IHRoZSBwb2x5bGluZSBmb3JtZWQgYnkgTiBwb2ludHMgaW50byBhIHNldCBvZiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9seWxpbmUgQSBzZXQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgIENsb3NlZCBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QSBTbW9vdGhuZXNzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRCIFNtb290aG5lc3NcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gQSBzZXQgb2YgYmV6aWVyIGN1cnZlIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cbmZ1bmN0aW9uIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZShwb2x5bGluZSkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDAuMjU7XG5cbiAgaWYgKCEocG9seWxpbmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdwb2x5bGluZVRvQmV6aWVyQ3VydmU6IFBhcmFtZXRlciBwb2x5bGluZSBtdXN0IGJlIGFuIGFycmF5IScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChwb2x5bGluZS5sZW5ndGggPD0gMikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BvbHlsaW5lVG9CZXppZXJDdXJ2ZTogQ29udmVydGluZyB0byBhIGN1cnZlIHJlcXVpcmVzIGF0IGxlYXN0IDMgcG9pbnRzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzdGFydFBvaW50ID0gcG9seWxpbmVbMF07XG4gIHZhciBiZXppZXJDdXJ2ZUxpbmVOdW0gPSBwb2x5bGluZS5sZW5ndGggLSAxO1xuICB2YXIgYmV6aWVyQ3VydmVQb2ludHMgPSBuZXcgQXJyYXkoYmV6aWVyQ3VydmVMaW5lTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdldEJlemllckN1cnZlTGluZUNvbnRyb2xQb2ludHMocG9seWxpbmUsIGksIGNsb3NlLCBvZmZzZXRBLCBvZmZzZXRCKSksIFtwb2x5bGluZVtpICsgMV1dKTtcbiAgfSk7XG4gIGlmIChjbG9zZSkgY2xvc2VCZXppZXJDdXJ2ZShiZXppZXJDdXJ2ZVBvaW50cywgc3RhcnRQb2ludCk7XG4gIGJlemllckN1cnZlUG9pbnRzLnVuc2hpZnQocG9seWxpbmVbMF0pO1xuICByZXR1cm4gYmV6aWVyQ3VydmVQb2ludHM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29udHJvbCBwb2ludHMgb2YgdGhlIEJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5bGluZSBBIHNldCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4ICAgVGhlIGluZGV4IG9mIHdoaWNoIGdldCBjb250cm9scyBwb2ludHMncyBwb2ludCBpbiBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlICBDbG9zZWQgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldEEgU21vb3RobmVzc1xyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QiBTbW9vdGhuZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBDb250cm9sIHBvaW50c1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZUxpbmVDb250cm9sUG9pbnRzKHBvbHlsaW5lLCBpbmRleCkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDAuMjU7XG4gIHZhciBwb2ludE51bSA9IHBvbHlsaW5lLmxlbmd0aDtcbiAgaWYgKHBvaW50TnVtIDwgMyB8fCBpbmRleCA+PSBwb2ludE51bSkgcmV0dXJuO1xuICB2YXIgYmVmb3JlUG9pbnRJbmRleCA9IGluZGV4IC0gMTtcbiAgaWYgKGJlZm9yZVBvaW50SW5kZXggPCAwKSBiZWZvcmVQb2ludEluZGV4ID0gY2xvc2UgPyBwb2ludE51bSArIGJlZm9yZVBvaW50SW5kZXggOiAwO1xuICB2YXIgYWZ0ZXJQb2ludEluZGV4ID0gaW5kZXggKyAxO1xuICBpZiAoYWZ0ZXJQb2ludEluZGV4ID49IHBvaW50TnVtKSBhZnRlclBvaW50SW5kZXggPSBjbG9zZSA/IGFmdGVyUG9pbnRJbmRleCAtIHBvaW50TnVtIDogcG9pbnROdW0gLSAxO1xuICB2YXIgYWZ0ZXJOZXh0UG9pbnRJbmRleCA9IGluZGV4ICsgMjtcbiAgaWYgKGFmdGVyTmV4dFBvaW50SW5kZXggPj0gcG9pbnROdW0pIGFmdGVyTmV4dFBvaW50SW5kZXggPSBjbG9zZSA/IGFmdGVyTmV4dFBvaW50SW5kZXggLSBwb2ludE51bSA6IHBvaW50TnVtIC0gMTtcbiAgdmFyIHBvaW50QmVmb3JlID0gcG9seWxpbmVbYmVmb3JlUG9pbnRJbmRleF07XG4gIHZhciBwb2ludE1pZGRsZSA9IHBvbHlsaW5lW2luZGV4XTtcbiAgdmFyIHBvaW50QWZ0ZXIgPSBwb2x5bGluZVthZnRlclBvaW50SW5kZXhdO1xuICB2YXIgcG9pbnRBZnRlck5leHQgPSBwb2x5bGluZVthZnRlck5leHRQb2ludEluZGV4XTtcbiAgcmV0dXJuIFtbcG9pbnRNaWRkbGVbMF0gKyBvZmZzZXRBICogKHBvaW50QWZ0ZXJbMF0gLSBwb2ludEJlZm9yZVswXSksIHBvaW50TWlkZGxlWzFdICsgb2Zmc2V0QSAqIChwb2ludEFmdGVyWzFdIC0gcG9pbnRCZWZvcmVbMV0pXSwgW3BvaW50QWZ0ZXJbMF0gLSBvZmZzZXRCICogKHBvaW50QWZ0ZXJOZXh0WzBdIC0gcG9pbnRNaWRkbGVbMF0pLCBwb2ludEFmdGVyWzFdIC0gb2Zmc2V0QiAqIChwb2ludEFmdGVyTmV4dFsxXSAtIHBvaW50TWlkZGxlWzFdKV1dO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGxhc3QgY3VydmUgb2YgdGhlIGNsb3N1cmVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgQSBzZXQgb2Ygc3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0UG9pbnQgIFN0YXJ0IHBvaW50XHJcbiAqIEByZXR1cm4ge0FycmF5fSBUaGUgbGFzdCBjdXJ2ZSBmb3IgY2xvc3VyZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBjbG9zZUJlemllckN1cnZlKGJlemllckN1cnZlLCBzdGFydFBvaW50KSB7XG4gIHZhciBmaXJzdFN1YkN1cnZlID0gYmV6aWVyQ3VydmVbMF07XG4gIHZhciBsYXN0U3ViQ3VydmUgPSBiZXppZXJDdXJ2ZS5zbGljZSgtMSlbMF07XG4gIGJlemllckN1cnZlLnB1c2goW2dldFN5bW1ldHJ5UG9pbnQobGFzdFN1YkN1cnZlWzFdLCBsYXN0U3ViQ3VydmVbMl0pLCBnZXRTeW1tZXRyeVBvaW50KGZpcnN0U3ViQ3VydmVbMF0sIHN0YXJ0UG9pbnQpLCBzdGFydFBvaW50XSk7XG4gIHJldHVybiBiZXppZXJDdXJ2ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBzeW1tZXRyeSBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgICBTeW1tZXRyaWMgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gY2VudGVyUG9pbnQgU3ltbWV0cmljIGNlbnRlclxyXG4gKiBAcmV0dXJuIHtBcnJheX0gU3ltbWV0cmljIHBvaW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFN5bW1ldHJ5UG9pbnQocG9pbnQsIGNlbnRlclBvaW50KSB7XG4gIHZhciBfcG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgcHggPSBfcG9pbnRbMF0sXG4gICAgICBweSA9IF9wb2ludFsxXTtcblxuICB2YXIgX2NlbnRlclBvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvaW50LCAyKSxcbiAgICAgIGN4ID0gX2NlbnRlclBvaW50WzBdLFxuICAgICAgY3kgPSBfY2VudGVyUG9pbnRbMV07XG5cbiAgdmFyIG1pbnVzWCA9IGN4IC0gcHg7XG4gIHZhciBtaW51c1kgPSBjeSAtIHB5O1xuICByZXR1cm4gW2N4ICsgbWludXNYLCBjeSArIG1pbnVzWV07XG59XG5cbnZhciBfZGVmYXVsdCA9IHBvbHlsaW5lVG9CZXppZXJDdXJ2ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiYmV6aWVyQ3VydmVUb1BvbHlsaW5lXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEJlemllckN1cnZlTGVuZ3RoXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicG9seWxpbmVUb0JlemllckN1cnZlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdO1xuICB9XG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2JlemllckN1cnZlVG9Qb2x5bGluZSA9IHJlcXVpcmUoXCIuL2NvcmUvYmV6aWVyQ3VydmVUb1BvbHlsaW5lXCIpO1xuXG52YXIgX3BvbHlsaW5lVG9CZXppZXJDdXJ2ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmVcIikpO1xuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGJlemllckN1cnZlVG9Qb2x5bGluZTogX2JlemllckN1cnZlVG9Qb2x5bGluZS5iZXppZXJDdXJ2ZVRvUG9seWxpbmUsXG4gIGdldEJlemllckN1cnZlTGVuZ3RoOiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmdldEJlemllckN1cnZlTGVuZ3RoLFxuICBwb2x5bGluZVRvQmV6aWVyQ3VydmU6IF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIF9jb2xvciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIikpO1xuXG52YXIgX2JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfZ3JhcGhzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi4vY29uZmlnL2dyYXBoc1wiKSk7XG5cbnZhciBfZ3JhcGggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2dyYXBoLmNsYXNzXCIpKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICAgIENsYXNzIG9mIENSZW5kZXJcclxuICogQHBhcmFtIHtPYmplY3R9IGNhbnZhcyBDYW52YXMgRE9NXHJcbiAqIEByZXR1cm4ge0NSZW5kZXJ9ICAgICAgSW5zdGFuY2Ugb2YgQ1JlbmRlclxyXG4gKi9cbnZhciBDUmVuZGVyID0gZnVuY3Rpb24gQ1JlbmRlcihjYW52YXMpIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBDUmVuZGVyKTtcblxuICBpZiAoIWNhbnZhcykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NSZW5kZXIgTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdmFyIGNsaWVudFdpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgY2xpZW50SGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgdmFyIGFyZWEgPSBbY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodF07XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgY2xpZW50V2lkdGgpO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBjbGllbnRIZWlnaHQpO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQ29udGV4dCBvZiB0aGUgY2FudmFzXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKiBAZXhhbXBsZSBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAqL1xuXG4gIHRoaXMuY3R4ID0gY3R4O1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2lkdGggYW5kIGhlaWdodCBvZiB0aGUgY2FudmFzXHJcbiAgICogQHR5cGUge0FycmF5fVxyXG4gICAqIEBleGFtcGxlIGFyZWEgPSBbMzAw77yMMTAwXVxyXG4gICAqL1xuXG4gIHRoaXMuYXJlYSA9IGFyZWE7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHJlbmRlciBpcyBpbiBhbmltYXRpb24gcmVuZGVyaW5nXHJcbiAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICogQGV4YW1wbGUgYW5pbWF0aW9uU3RhdHVzID0gdHJ1ZXxmYWxzZVxyXG4gICAqL1xuXG4gIHRoaXMuYW5pbWF0aW9uU3RhdHVzID0gZmFsc2U7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBZGRlZCBncmFwaFxyXG4gICAqIEB0eXBlIHtbR3JhcGhdfVxyXG4gICAqIEBleGFtcGxlIGdyYXBocyA9IFtHcmFwaCwgR3JhcGgsIC4uLl1cclxuICAgKi9cblxuICB0aGlzLmdyYXBocyA9IFtdO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQ29sb3IgcGx1Z2luXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vamlhbWluZzc0My9jb2xvclxyXG4gICAqL1xuXG4gIHRoaXMuY29sb3IgPSBfY29sb3JbXCJkZWZhdWx0XCJdO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmV6aWVyIEN1cnZlIHBsdWdpblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2ppYW1pbmc3NDMvQmV6aWVyQ3VydmVcclxuICAgKi9cblxuICB0aGlzLmJlemllckN1cnZlID0gX2JlemllckN1cnZlW1wiZGVmYXVsdFwiXTsgLy8gYmluZCBldmVudCBoYW5kbGVyXG5cbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZVVwLmJpbmQodGhpcykpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgIENsZWFyIGNhbnZhcyBkcmF3aW5nIGFyZWFcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ1JlbmRlcjtcblxuQ1JlbmRlci5wcm90b3R5cGUuY2xlYXJBcmVhID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMkY3R4O1xuXG4gIHZhciBhcmVhID0gdGhpcy5hcmVhO1xuXG4gIChfdGhpcyRjdHggPSB0aGlzLmN0eCkuY2xlYXJSZWN0LmFwcGx5KF90aGlzJGN0eCwgWzAsIDBdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFyZWEpKSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgICAgQWRkIGdyYXBoIHRvIHJlbmRlclxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEdyYXBoIGNvbmZpZ3VyYXRpb25cclxuICogQHJldHVybiB7R3JhcGh9ICAgICAgICBHcmFwaCBpbnN0YW5jZVxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb25maWcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICB2YXIgbmFtZSA9IGNvbmZpZy5uYW1lO1xuXG4gIGlmICghbmFtZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2FkZCBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGdyYXBoQ29uZmlnID0gX2dyYXBoc1tcImRlZmF1bHRcIl0uZ2V0KG5hbWUpO1xuXG4gIGlmICghZ3JhcGhDb25maWcpIHtcbiAgICBjb25zb2xlLndhcm4oJ05vIGNvcnJlc3BvbmRpbmcgZ3JhcGggY29uZmlndXJhdGlvbiBmb3VuZCEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZ3JhcGggPSBuZXcgX2dyYXBoW1wiZGVmYXVsdFwiXShncmFwaENvbmZpZywgY29uZmlnKTtcbiAgaWYgKCFncmFwaC52YWxpZGF0b3IoZ3JhcGgpKSByZXR1cm47XG4gIGdyYXBoLnJlbmRlciA9IHRoaXM7XG4gIHRoaXMuZ3JhcGhzLnB1c2goZ3JhcGgpO1xuICB0aGlzLnNvcnRHcmFwaHNCeUluZGV4KCk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG4gIHJldHVybiBncmFwaDtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNvcnQgdGhlIGdyYXBoIGJ5IGluZGV4XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5zb3J0R3JhcGhzQnlJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuICBncmFwaHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIGlmIChhLmluZGV4ID4gYi5pbmRleCkgcmV0dXJuIDE7XG4gICAgaWYgKGEuaW5kZXggPT09IGIuaW5kZXgpIHJldHVybiAwO1xuICAgIGlmIChhLmluZGV4IDwgYi5pbmRleCkgcmV0dXJuIC0xO1xuICB9KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgRGVsZXRlIGdyYXBoIGluIHJlbmRlclxyXG4gKiBAcGFyYW0ge0dyYXBofSBncmFwaCBUaGUgZ3JhcGggdG8gYmUgZGVsZXRlZFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9ICBWb2lkXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmRlbEdyYXBoID0gZnVuY3Rpb24gKGdyYXBoKSB7XG4gIGlmICh0eXBlb2YgZ3JhcGguZGVsUHJvY2Vzc29yICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gIGdyYXBoLmRlbFByb2Nlc3Nvcih0aGlzKTtcbiAgdGhpcy5ncmFwaHMgPSB0aGlzLmdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9KTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICBEZWxldGUgYWxsIGdyYXBoIGluIHJlbmRlclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuZGVsQWxsR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5ncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguZGVsUHJvY2Vzc29yKF90aGlzKTtcbiAgfSk7XG4gIHRoaXMuZ3JhcGhzID0gdGhpcy5ncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaDtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgRHJhdyBhbGwgdGhlIGdyYXBocyBpbiB0aGUgcmVuZGVyXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5kcmF3QWxsR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gIHRoaXMuY2xlYXJBcmVhKCk7XG4gIHRoaXMuZ3JhcGhzLmZpbHRlcihmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGggJiYgZ3JhcGgudmlzaWJsZTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguZHJhd1Byb2Nlc3NvcihfdGhpczIsIGdyYXBoKTtcbiAgfSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgIEFuaW1hdGUgdGhlIGdyYXBoIHdob3NlIGFuaW1hdGlvbiBxdWV1ZSBpcyBub3QgZW1wdHlcclxuICogICAgICAgICAgICAgICAgICAgYW5kIHRoZSBhbmltYXRpb25QYXVzZSBpcyBlcXVhbCB0byBmYWxzZVxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBbmltYXRpb24gUHJvbWlzZVxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5sYXVuY2hBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gIHZhciBhbmltYXRpb25TdGF0dXMgPSB0aGlzLmFuaW1hdGlvblN0YXR1cztcbiAgaWYgKGFuaW1hdGlvblN0YXR1cykgcmV0dXJuO1xuICB0aGlzLmFuaW1hdGlvblN0YXR1cyA9IHRydWU7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGFuaW1hdGlvbi5jYWxsKF90aGlzMywgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMzLmFuaW1hdGlvblN0YXR1cyA9IGZhbHNlO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIERhdGUubm93KCkpO1xuICB9KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFRyeSB0byBhbmltYXRlIGV2ZXJ5IGdyYXBoXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGluIGFuaW1hdGlvbiBlbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVTdGFtcCAgVGltZSBzdGFtcCBvZiBhbmltYXRpb24gc3RhcnRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGFuaW1hdGlvbihjYWxsYmFjaywgdGltZVN0YW1wKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcblxuICBpZiAoIWFuaW1hdGlvbkFibGUoZ3JhcGhzKSkge1xuICAgIGNhbGxiYWNrKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnR1cm5OZXh0QW5pbWF0aW9uRnJhbWUodGltZVN0YW1wKTtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRpb24uYmluZCh0aGlzLCBjYWxsYmFjaywgdGltZVN0YW1wKSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEZpbmQgaWYgdGhlcmUgYXJlIGdyYXBoIHRoYXQgY2FuIGJlIGFuaW1hdGVkXHJcbiAqIEBwYXJhbSB7W0dyYXBoXX0gZ3JhcGhzXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGFuaW1hdGlvbkFibGUoZ3JhcGhzKSB7XG4gIHJldHVybiBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gIWdyYXBoLmFuaW1hdGlvblBhdXNlICYmIGdyYXBoLmFuaW1hdGlvbkZyYW1lU3RhdGUubGVuZ3RoO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSGFuZGxlciBvZiBDUmVuZGVyIG1vdXNlZG93biBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gbW91c2VEb3duKGUpIHtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuICB2YXIgaG92ZXJHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdob3Zlcic7XG4gIH0pO1xuICBpZiAoIWhvdmVyR3JhcGgpIHJldHVybjtcbiAgaG92ZXJHcmFwaC5zdGF0dXMgPSAnYWN0aXZlJztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSGFuZGxlciBvZiBDUmVuZGVyIG1vdXNlbW92ZSBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gbW91c2VNb3ZlKGUpIHtcbiAgdmFyIG9mZnNldFggPSBlLm9mZnNldFgsXG4gICAgICBvZmZzZXRZID0gZS5vZmZzZXRZO1xuICB2YXIgcG9zaXRpb24gPSBbb2Zmc2V0WCwgb2Zmc2V0WV07XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgdmFyIGFjdGl2ZUdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2FjdGl2ZScgfHwgZ3JhcGguc3RhdHVzID09PSAnZHJhZyc7XG4gIH0pO1xuXG4gIGlmIChhY3RpdmVHcmFwaCkge1xuICAgIGlmICghYWN0aXZlR3JhcGguZHJhZykgcmV0dXJuO1xuXG4gICAgaWYgKHR5cGVvZiBhY3RpdmVHcmFwaC5tb3ZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBtb3ZlIG1ldGhvZCBpcyBwcm92aWRlZCwgY2Fubm90IGJlIGRyYWdnZWQhJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWN0aXZlR3JhcGgubW92ZVByb2Nlc3NvcihlKTtcbiAgICBhY3RpdmVHcmFwaC5zdGF0dXMgPSAnZHJhZyc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGhvdmVyR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnaG92ZXInO1xuICB9KTtcbiAgdmFyIGhvdmVyQWJsZUdyYXBocyA9IGdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLmhvdmVyICYmICh0eXBlb2YgZ3JhcGguaG92ZXJDaGVjayA9PT0gJ2Z1bmN0aW9uJyB8fCBncmFwaC5ob3ZlclJlY3QpO1xuICB9KTtcbiAgdmFyIGhvdmVyZWRHcmFwaCA9IGhvdmVyQWJsZUdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5ob3ZlckNoZWNrUHJvY2Vzc29yKHBvc2l0aW9uLCBncmFwaCk7XG4gIH0pO1xuXG4gIGlmIChob3ZlcmVkR3JhcGgpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGhvdmVyZWRHcmFwaC5zdHlsZS5ob3ZlckN1cnNvcjtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgfVxuXG4gIHZhciBob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuID0gZmFsc2UsXG4gICAgICBob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4gPSBmYWxzZTtcbiAgaWYgKGhvdmVyR3JhcGgpIGhvdmVyR3JhcGhNb3VzZU91dGVySXNGdW4gPSB0eXBlb2YgaG92ZXJHcmFwaC5tb3VzZU91dGVyID09PSAnZnVuY3Rpb24nO1xuICBpZiAoaG92ZXJlZEdyYXBoKSBob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4gPSB0eXBlb2YgaG92ZXJlZEdyYXBoLm1vdXNlRW50ZXIgPT09ICdmdW5jdGlvbic7XG4gIGlmICghaG92ZXJlZEdyYXBoICYmICFob3ZlckdyYXBoKSByZXR1cm47XG5cbiAgaWYgKCFob3ZlcmVkR3JhcGggJiYgaG92ZXJHcmFwaCkge1xuICAgIGlmIChob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuKSBob3ZlckdyYXBoLm1vdXNlT3V0ZXIoZSwgaG92ZXJHcmFwaCk7XG4gICAgaG92ZXJHcmFwaC5zdGF0dXMgPSAnc3RhdGljJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaG92ZXJlZEdyYXBoICYmIGhvdmVyZWRHcmFwaCA9PT0gaG92ZXJHcmFwaCkgcmV0dXJuO1xuXG4gIGlmIChob3ZlcmVkR3JhcGggJiYgIWhvdmVyR3JhcGgpIHtcbiAgICBpZiAoaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuKSBob3ZlcmVkR3JhcGgubW91c2VFbnRlcihlLCBob3ZlcmVkR3JhcGgpO1xuICAgIGhvdmVyZWRHcmFwaC5zdGF0dXMgPSAnaG92ZXInO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChob3ZlcmVkR3JhcGggJiYgaG92ZXJHcmFwaCAmJiBob3ZlcmVkR3JhcGggIT09IGhvdmVyR3JhcGgpIHtcbiAgICBpZiAoaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1bikgaG92ZXJHcmFwaC5tb3VzZU91dGVyKGUsIGhvdmVyR3JhcGgpO1xuICAgIGhvdmVyR3JhcGguc3RhdHVzID0gJ3N0YXRpYyc7XG4gICAgaWYgKGhvdmVyZWRHcmFwaE1vdXNlRW50ZXJJc0Z1bikgaG92ZXJlZEdyYXBoLm1vdXNlRW50ZXIoZSwgaG92ZXJlZEdyYXBoKTtcbiAgICBob3ZlcmVkR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbiAgfVxufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVyIG9mIENSZW5kZXIgbW91c2V1cCBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gbW91c2VVcChlKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgdmFyIGFjdGl2ZUdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2FjdGl2ZSc7XG4gIH0pO1xuICB2YXIgZHJhZ0dyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2RyYWcnO1xuICB9KTtcbiAgaWYgKGFjdGl2ZUdyYXBoICYmIHR5cGVvZiBhY3RpdmVHcmFwaC5jbGljayA9PT0gJ2Z1bmN0aW9uJykgYWN0aXZlR3JhcGguY2xpY2soZSwgYWN0aXZlR3JhcGgpO1xuICBncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGggJiYgKGdyYXBoLnN0YXR1cyA9ICdzdGF0aWMnKTtcbiAgfSk7XG4gIGlmIChhY3RpdmVHcmFwaCkgYWN0aXZlR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbiAgaWYgKGRyYWdHcmFwaCkgZHJhZ0dyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgQ2xvbmUgR3JhcGhcclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggVGhlIHRhcmdldCB0byBiZSBjbG9uZWRcclxuICogQHJldHVybiB7R3JhcGh9ICAgICAgQ2xvbmVkIGdyYXBoXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKGdyYXBoKSB7XG4gIHZhciBzdHlsZSA9IGdyYXBoLnN0eWxlLmdldFN0eWxlKCk7XG5cbiAgdmFyIGNsb25lZEdyYXBoID0gX29iamVjdFNwcmVhZCh7fSwgZ3JhcGgsIHtcbiAgICBzdHlsZTogc3R5bGVcbiAgfSk7XG5cbiAgZGVsZXRlIGNsb25lZEdyYXBoLnJlbmRlcjtcbiAgY2xvbmVkR3JhcGggPSAoMCwgX3V0aWwuZGVlcENsb25lKShjbG9uZWRHcmFwaCwgdHJ1ZSk7XG4gIHJldHVybiB0aGlzLmFkZChjbG9uZWRHcmFwaCk7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3JlZ2VuZXJhdG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvcmVnZW5lcmF0b3JcIikpO1xuXG52YXIgX2FzeW5jVG9HZW5lcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yXCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG52YXIgX3N0eWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9zdHlsZS5jbGFzc1wiKSk7XG5cbnZhciBfdHJhbnNpdGlvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvdHJhbnNpdGlvblwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi9wbHVnaW4vdXRpbFwiKTtcblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDbGFzcyBHcmFwaFxyXG4gKiBAcGFyYW0ge09iamVjdH0gZ3JhcGggIEdyYXBoIGRlZmF1bHQgY29uZmlndXJhdGlvblxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEdyYXBoIGNvbmZpZ1xyXG4gKiBAcmV0dXJuIHtHcmFwaH0gSW5zdGFuY2Ugb2YgR3JhcGhcclxuICovXG52YXIgR3JhcGggPSBmdW5jdGlvbiBHcmFwaChncmFwaCwgY29uZmlnKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgR3JhcGgpO1xuICBjb25maWcgPSAoMCwgX3V0aWwuZGVlcENsb25lKShjb25maWcsIHRydWUpO1xuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXZWF0aGVyIHRvIHJlbmRlciBncmFwaFxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCB2aXNpYmxlID0gdHJ1ZVxyXG4gICAgICovXG4gICAgdmlzaWJsZTogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZW5hYmxlIGRyYWdcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgZHJhZyA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBkcmFnOiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZW5hYmxlIGhvdmVyXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IGhvdmVyID0gZmFsc2VcclxuICAgICAqL1xuICAgIGhvdmVyOiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYXBoIHJlbmRlcmluZyBpbmRleFxyXG4gICAgICogIEdpdmUgcHJpb3JpdHkgdG8gaW5kZXggaGlnaCBncmFwaCBpbiByZW5kZXJpbmdcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZXhhbXBsZSBpbmRleCA9IDFcclxuICAgICAqL1xuICAgIGluZGV4OiAxLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGRlbGF5IHRpbWUobXMpXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uRGVsYXkgPSAwXHJcbiAgICAgKi9cbiAgICBhbmltYXRpb25EZWxheTogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE51bWJlciBvZiBhbmltYXRpb24gZnJhbWVzXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSAzMFxyXG4gICAgICovXG4gICAgYW5pbWF0aW9uRnJhbWU6IDMwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGR5bmFtaWMgY3VydmUgKFN1cHBvcnRlZCBieSB0cmFuc2l0aW9uKVxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2xpbmVhcidcclxuICAgICAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9qaWFtaW5nNzQzL1RyYW5zaXRpb25cclxuICAgICAqL1xuICAgIGFuaW1hdGlvbkN1cnZlOiAnbGluZWFyJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdlYXRoZXIgdG8gcGF1c2UgZ3JhcGggYW5pbWF0aW9uXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvblBhdXNlID0gZmFsc2VcclxuICAgICAqL1xuICAgIGFuaW1hdGlvblBhdXNlOiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJlY3Rhbmd1bGFyIGhvdmVyIGRldGVjdGlvbiB6b25lXHJcbiAgICAgKiAgVXNlIHRoaXMgbWV0aG9kIGZvciBob3ZlciBkZXRlY3Rpb24gZmlyc3RcclxuICAgICAqIEB0eXBlIHtOdWxsfEFycmF5fVxyXG4gICAgICogQGRlZmF1bHQgaG92ZXJSZWN0ID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgaG92ZXJSZWN0ID0gWzAsIDAsIDEwMCwgMTAwXSAvLyBbUmVjdCBzdGFydCB4LCB5LCBSZWN0IHdpZHRoLCBoZWlnaHRdXHJcbiAgICAgKi9cbiAgICBob3ZlclJlY3Q6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBNb3VzZSBlbnRlciBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb258TnVsbH1cclxuICAgICAqIEBkZWZhdWx0IG1vdXNlRW50ZXIgPSBudWxsXHJcbiAgICAgKi9cbiAgICBtb3VzZUVudGVyOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTW91c2Ugb3V0ZXIgZXZlbnQgaGFuZGxlclxyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufE51bGx9XHJcbiAgICAgKiBAZGVmYXVsdCBtb3VzZU91dGVyID0gbnVsbFxyXG4gICAgICovXG4gICAgbW91c2VPdXRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE1vdXNlIGNsaWNrIGV2ZW50IGhhbmRsZXJcclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbnxOdWxsfVxyXG4gICAgICogQGRlZmF1bHQgY2xpY2sgPSBudWxsXHJcbiAgICAgKi9cbiAgICBjbGljazogbnVsbFxuICB9O1xuICB2YXIgY29uZmlnQWJsZU5vdCA9IHtcbiAgICBzdGF0dXM6ICdzdGF0aWMnLFxuICAgIGFuaW1hdGlvblJvb3Q6IFtdLFxuICAgIGFuaW1hdGlvbktleXM6IFtdLFxuICAgIGFuaW1hdGlvbkZyYW1lU3RhdGU6IFtdLFxuICAgIGNhY2hlOiB7fVxuICB9O1xuICBpZiAoIWNvbmZpZy5zaGFwZSkgY29uZmlnLnNoYXBlID0ge307XG4gIGlmICghY29uZmlnLnN0eWxlKSBjb25maWcuc3R5bGUgPSB7fTtcbiAgdmFyIHNoYXBlID0gT2JqZWN0LmFzc2lnbih7fSwgZ3JhcGguc2hhcGUsIGNvbmZpZy5zaGFwZSk7XG4gIE9iamVjdC5hc3NpZ24oZGVmYXVsdENvbmZpZywgY29uZmlnLCBjb25maWdBYmxlTm90KTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBncmFwaCwgZGVmYXVsdENvbmZpZyk7XG4gIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgdGhpcy5zdHlsZSA9IG5ldyBfc3R5bGVbXCJkZWZhdWx0XCJdKGNvbmZpZy5zdHlsZSk7XG4gIHRoaXMuYWRkZWRQcm9jZXNzb3IoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBhZGRlZFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBHcmFwaDtcblxuR3JhcGgucHJvdG90eXBlLmFkZGVkUHJvY2Vzc29yID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIHRoaXMuc2V0R3JhcGhDZW50ZXIgPT09ICdmdW5jdGlvbicpIHRoaXMuc2V0R3JhcGhDZW50ZXIobnVsbCwgdGhpcyk7IC8vIFRoZSBsaWZlIGN5Y2xlICdhZGRlZFwiXG5cbiAgaWYgKHR5cGVvZiB0aGlzLmFkZGVkID09PSAnZnVuY3Rpb24nKSB0aGlzLmFkZGVkKHRoaXMpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGRyYXdcclxuICogQHBhcmFtIHtDUmVuZGVyfSByZW5kZXIgSW5zdGFuY2Ugb2YgQ1JlbmRlclxyXG4gKiBAcGFyYW0ge0dyYXBofSBncmFwaCAgICBJbnN0YW5jZSBvZiBHcmFwaFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmRyYXdQcm9jZXNzb3IgPSBmdW5jdGlvbiAocmVuZGVyLCBncmFwaCkge1xuICB2YXIgY3R4ID0gcmVuZGVyLmN0eDtcbiAgZ3JhcGguc3R5bGUuaW5pdFN0eWxlKGN0eCk7XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVEcmF3ID09PSAnZnVuY3Rpb24nKSB0aGlzLmJlZm9yZURyYXcodGhpcywgcmVuZGVyKTtcbiAgZ3JhcGguZHJhdyhyZW5kZXIsIGdyYXBoKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmRyYXdlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5kcmF3ZWQodGhpcywgcmVuZGVyKTtcbiAgZ3JhcGguc3R5bGUucmVzdG9yZVRyYW5zZm9ybShjdHgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGhvdmVyIGNoZWNrXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvc2l0aW9uIE1vdXNlIFBvc2l0aW9uXHJcbiAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoICAgIEluc3RhbmNlIG9mIEdyYXBoXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBob3ZlciBjaGVja1xyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuaG92ZXJDaGVja1Byb2Nlc3NvciA9IGZ1bmN0aW9uIChwb3NpdGlvbiwgX3JlZikge1xuICB2YXIgaG92ZXJSZWN0ID0gX3JlZi5ob3ZlclJlY3QsXG4gICAgICBzdHlsZSA9IF9yZWYuc3R5bGUsXG4gICAgICBob3ZlckNoZWNrID0gX3JlZi5ob3ZlckNoZWNrO1xuICB2YXIgZ3JhcGhDZW50ZXIgPSBzdHlsZS5ncmFwaENlbnRlcixcbiAgICAgIHJvdGF0ZSA9IHN0eWxlLnJvdGF0ZSxcbiAgICAgIHNjYWxlID0gc3R5bGUuc2NhbGUsXG4gICAgICB0cmFuc2xhdGUgPSBzdHlsZS50cmFuc2xhdGU7XG5cbiAgaWYgKGdyYXBoQ2VudGVyKSB7XG4gICAgaWYgKHJvdGF0ZSkgcG9zaXRpb24gPSAoMCwgX3V0aWwuZ2V0Um90YXRlUG9pbnRQb3MpKC1yb3RhdGUsIHBvc2l0aW9uLCBncmFwaENlbnRlcik7XG4gICAgaWYgKHNjYWxlKSBwb3NpdGlvbiA9ICgwLCBfdXRpbC5nZXRTY2FsZVBvaW50UG9zKShzY2FsZS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiAxIC8gcztcbiAgICB9KSwgcG9zaXRpb24sIGdyYXBoQ2VudGVyKTtcbiAgICBpZiAodHJhbnNsYXRlKSBwb3NpdGlvbiA9ICgwLCBfdXRpbC5nZXRUcmFuc2xhdGVQb2ludFBvcykodHJhbnNsYXRlLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYgKiAtMTtcbiAgICB9KSwgcG9zaXRpb24pO1xuICB9XG5cbiAgaWYgKGhvdmVyUmVjdCkgcmV0dXJuIF91dGlsLmNoZWNrUG9pbnRJc0luUmVjdC5hcHBseSh2b2lkIDAsIFtwb3NpdGlvbl0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaG92ZXJSZWN0KSkpO1xuICByZXR1cm4gaG92ZXJDaGVjayhwb3NpdGlvbiwgdGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgbW92ZVxyXG4gKiBAcGFyYW0ge0V2ZW50fSBlIE1vdXNlIG1vdmVtZW50IGV2ZW50XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUubW92ZVByb2Nlc3NvciA9IGZ1bmN0aW9uIChlKSB7XG4gIHRoaXMubW92ZShlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmJlZm9yZU1vdmUgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlTW92ZShlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLnNldEdyYXBoQ2VudGVyID09PSAnZnVuY3Rpb24nKSB0aGlzLnNldEdyYXBoQ2VudGVyKGUsIHRoaXMpO1xuICBpZiAodHlwZW9mIHRoaXMubW92ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMubW92ZWQoZSwgdGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBVcGRhdGUgZ3JhcGggc3RhdGVcclxuICogQHBhcmFtIHtTdHJpbmd9IGF0dHJOYW1lIFVwZGF0ZWQgYXR0cmlidXRlIG5hbWVcclxuICogQHBhcmFtIHtBbnl9IGNoYW5nZSAgICAgIFVwZGF0ZWQgdmFsdWVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24gKGF0dHJOYW1lKSB7XG4gIHZhciBjaGFuZ2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgaWYgKCFhdHRyTmFtZSB8fCBjaGFuZ2UgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgaXNPYmplY3QgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKSh0aGlzW2F0dHJOYW1lXSkgPT09ICdvYmplY3QnO1xuICBpZiAoaXNPYmplY3QpIGNoYW5nZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNoYW5nZSwgdHJ1ZSk7XG4gIHZhciByZW5kZXIgPSB0aGlzLnJlbmRlcjtcblxuICBpZiAoYXR0ck5hbWUgPT09ICdzdHlsZScpIHtcbiAgICB0aGlzLnN0eWxlLnVwZGF0ZShjaGFuZ2UpO1xuICB9IGVsc2UgaWYgKGlzT2JqZWN0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzW2F0dHJOYW1lXSwgY2hhbmdlKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzW2F0dHJOYW1lXSA9IGNoYW5nZTtcbiAgfVxuXG4gIGlmIChhdHRyTmFtZSA9PT0gJ2luZGV4JykgcmVuZGVyLnNvcnRHcmFwaHNCeUluZGV4KCk7XG4gIHJlbmRlci5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFVwZGF0ZSBncmFwaGljcyBzdGF0ZSAod2l0aCBhbmltYXRpb24pXHJcbiAqICBPbmx5IHNoYXBlIGFuZCBzdHlsZSBhdHRyaWJ1dGVzIGFyZSBzdXBwb3J0ZWRcclxuICogQHBhcmFtIHtTdHJpbmd9IGF0dHJOYW1lIFVwZGF0ZWQgYXR0cmlidXRlIG5hbWVcclxuICogQHBhcmFtIHtBbnl9IGNoYW5nZSAgICAgIFVwZGF0ZWQgdmFsdWVcclxuICogQHBhcmFtIHtCb29sZWFufSB3YWl0ICAgIFdoZXRoZXIgdG8gc3RvcmUgdGhlIGFuaW1hdGlvbiB3YWl0aW5nXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhlIG5leHQgYW5pbWF0aW9uIHJlcXVlc3RcclxuICogQHJldHVybiB7UHJvbWlzZX0gQW5pbWF0aW9uIFByb21pc2VcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmFuaW1hdGlvbiA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIHZhciBfcmVmMiA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjJbXCJkZWZhdWx0XCJdKShcbiAgLyojX19QVVJFX18qL1xuICBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTIoYXR0ck5hbWUsIGNoYW5nZSkge1xuICAgIHZhciB3YWl0LFxuICAgICAgICBjaGFuZ2VSb290LFxuICAgICAgICBjaGFuZ2VLZXlzLFxuICAgICAgICBiZWZvcmVTdGF0ZSxcbiAgICAgICAgYW5pbWF0aW9uRnJhbWUsXG4gICAgICAgIGFuaW1hdGlvbkN1cnZlLFxuICAgICAgICBhbmltYXRpb25EZWxheSxcbiAgICAgICAgYW5pbWF0aW9uRnJhbWVTdGF0ZSxcbiAgICAgICAgcmVuZGVyLFxuICAgICAgICBfYXJnczIgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ud3JhcChmdW5jdGlvbiBfY2FsbGVlMiQoX2NvbnRleHQyKSB7XG4gICAgICB3aGlsZSAoMSkge1xuICAgICAgICBzd2l0Y2ggKF9jb250ZXh0Mi5wcmV2ID0gX2NvbnRleHQyLm5leHQpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICB3YWl0ID0gX2FyZ3MyLmxlbmd0aCA+IDIgJiYgX2FyZ3MyWzJdICE9PSB1bmRlZmluZWQgPyBfYXJnczJbMl0gOiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCEoYXR0ck5hbWUgIT09ICdzaGFwZScgJiYgYXR0ck5hbWUgIT09ICdzdHlsZScpKSB7XG4gICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ09ubHkgc3VwcG9ydGVkIHNoYXBlIGFuZCBzdHlsZSBhbmltYXRpb24hJyk7XG4gICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdChcInJldHVyblwiKTtcblxuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGNoYW5nZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNoYW5nZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoYXR0ck5hbWUgPT09ICdzdHlsZScpIHRoaXMuc3R5bGUuY29sb3JQcm9jZXNzb3IoY2hhbmdlKTtcbiAgICAgICAgICAgIGNoYW5nZVJvb3QgPSB0aGlzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgIGNoYW5nZUtleXMgPSBPYmplY3Qua2V5cyhjaGFuZ2UpO1xuICAgICAgICAgICAgYmVmb3JlU3RhdGUgPSB7fTtcbiAgICAgICAgICAgIGNoYW5nZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgIHJldHVybiBiZWZvcmVTdGF0ZVtrZXldID0gY2hhbmdlUm9vdFtrZXldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmltYXRpb25GcmFtZSA9IHRoaXMuYW5pbWF0aW9uRnJhbWUsIGFuaW1hdGlvbkN1cnZlID0gdGhpcy5hbmltYXRpb25DdXJ2ZSwgYW5pbWF0aW9uRGVsYXkgPSB0aGlzLmFuaW1hdGlvbkRlbGF5O1xuICAgICAgICAgICAgYW5pbWF0aW9uRnJhbWVTdGF0ZSA9ICgwLCBfdHJhbnNpdGlvbltcImRlZmF1bHRcIl0pKGFuaW1hdGlvbkN1cnZlLCBiZWZvcmVTdGF0ZSwgY2hhbmdlLCBhbmltYXRpb25GcmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvblJvb3QucHVzaChjaGFuZ2VSb290KTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uS2V5cy5wdXNoKGNoYW5nZUtleXMpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlLnB1c2goYW5pbWF0aW9uRnJhbWVTdGF0ZSk7XG5cbiAgICAgICAgICAgIGlmICghd2FpdCkge1xuICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDE3O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIik7XG5cbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgaWYgKCEoYW5pbWF0aW9uRGVsYXkgPiAwKSkge1xuICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDIwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyMDtcbiAgICAgICAgICAgIHJldHVybiBkZWxheShhbmltYXRpb25EZWxheSk7XG5cbiAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG4gICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdChcInJldHVyblwiLCBuZXcgUHJvbWlzZShcbiAgICAgICAgICAgIC8qI19fUFVSRV9fKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyIF9yZWYzID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMltcImRlZmF1bHRcIl0pKFxuICAgICAgICAgICAgICAvKiNfX1BVUkVfXyovXG4gICAgICAgICAgICAgIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ubWFyayhmdW5jdGlvbiBfY2FsbGVlKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUkKF9jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9jb250ZXh0LnByZXYgPSBfY29udGV4dC5uZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVuZGVyLmxhdW5jaEFuaW1hdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29udGV4dC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBfY2FsbGVlKTtcbiAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoX3gzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWYzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KCkpKTtcblxuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBfY2FsbGVlMiwgdGhpcyk7XG4gIH0pKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKF94LCBfeDIpIHtcbiAgICByZXR1cm4gX3JlZjIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn0oKTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRXh0cmFjdCB0aGUgbmV4dCBmcmFtZSBvZiBkYXRhIGZyb20gdGhlIGFuaW1hdGlvbiBxdWV1ZVxyXG4gKiAgICAgICAgICAgICAgYW5kIHVwZGF0ZSB0aGUgZ3JhcGggc3RhdGVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS50dXJuTmV4dEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKHRpbWVTdGFtcCkge1xuICB2YXIgYW5pbWF0aW9uRGVsYXkgPSB0aGlzLmFuaW1hdGlvbkRlbGF5LFxuICAgICAgYW5pbWF0aW9uUm9vdCA9IHRoaXMuYW5pbWF0aW9uUm9vdCxcbiAgICAgIGFuaW1hdGlvbktleXMgPSB0aGlzLmFuaW1hdGlvbktleXMsXG4gICAgICBhbmltYXRpb25GcmFtZVN0YXRlID0gdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlLFxuICAgICAgYW5pbWF0aW9uUGF1c2UgPSB0aGlzLmFuaW1hdGlvblBhdXNlO1xuICBpZiAoYW5pbWF0aW9uUGF1c2UpIHJldHVybjtcbiAgaWYgKERhdGUubm93KCkgLSB0aW1lU3RhbXAgPCBhbmltYXRpb25EZWxheSkgcmV0dXJuO1xuICBhbmltYXRpb25Sb290LmZvckVhY2goZnVuY3Rpb24gKHJvb3QsIGkpIHtcbiAgICBhbmltYXRpb25LZXlzW2ldLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgcm9vdFtrZXldID0gYW5pbWF0aW9uRnJhbWVTdGF0ZVtpXVswXVtrZXldO1xuICAgIH0pO1xuICB9KTtcbiAgYW5pbWF0aW9uRnJhbWVTdGF0ZS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZUl0ZW0sIGkpIHtcbiAgICBzdGF0ZUl0ZW0uc2hpZnQoKTtcbiAgICB2YXIgbm9GcmFtZSA9IHN0YXRlSXRlbS5sZW5ndGggPT09IDA7XG4gICAgaWYgKG5vRnJhbWUpIGFuaW1hdGlvblJvb3RbaV0gPSBudWxsO1xuICAgIGlmIChub0ZyYW1lKSBhbmltYXRpb25LZXlzW2ldID0gbnVsbDtcbiAgfSk7XG4gIHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZSA9IGFuaW1hdGlvbkZyYW1lU3RhdGUuZmlsdGVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZS5sZW5ndGg7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvblJvb3QgPSBhbmltYXRpb25Sb290LmZpbHRlcihmdW5jdGlvbiAocm9vdCkge1xuICAgIHJldHVybiByb290O1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25LZXlzID0gYW5pbWF0aW9uS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleXMpIHtcbiAgICByZXR1cm4ga2V5cztcbiAgfSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTa2lwIHRvIHRoZSBsYXN0IGZyYW1lIG9mIGFuaW1hdGlvblxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmFuaW1hdGlvbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFuaW1hdGlvbkZyYW1lU3RhdGUgPSB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUsXG4gICAgICBhbmltYXRpb25LZXlzID0gdGhpcy5hbmltYXRpb25LZXlzLFxuICAgICAgYW5pbWF0aW9uUm9vdCA9IHRoaXMuYW5pbWF0aW9uUm9vdCxcbiAgICAgIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuICBhbmltYXRpb25Sb290LmZvckVhY2goZnVuY3Rpb24gKHJvb3QsIGkpIHtcbiAgICB2YXIgY3VycmVudEtleXMgPSBhbmltYXRpb25LZXlzW2ldO1xuICAgIHZhciBsYXN0U3RhdGUgPSBhbmltYXRpb25GcmFtZVN0YXRlW2ldLnBvcCgpO1xuICAgIGN1cnJlbnRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHJvb3Rba2V5XSA9IGxhc3RTdGF0ZVtrZXldO1xuICAgIH0pO1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlID0gW107XG4gIHRoaXMuYW5pbWF0aW9uS2V5cyA9IFtdO1xuICB0aGlzLmFuaW1hdGlvblJvb3QgPSBbXTtcbiAgcmV0dXJuIHJlbmRlci5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFBhdXNlIGFuaW1hdGlvbiBiZWhhdmlvclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLnBhdXNlQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmF0dHIoJ2FuaW1hdGlvblBhdXNlJywgdHJ1ZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBUcnkgYW5pbWF0aW9uIGJlaGF2aW9yXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUucGxheUFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuICB0aGlzLmF0dHIoJ2FuaW1hdGlvblBhdXNlJywgZmFsc2UpO1xuICByZXR1cm4gbmV3IFByb21pc2UoXG4gIC8qI19fUFVSRV9fKi9cbiAgZnVuY3Rpb24gKCkge1xuICAgIHZhciBfcmVmNCA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjJbXCJkZWZhdWx0XCJdKShcbiAgICAvKiNfX1BVUkVfXyovXG4gICAgX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUzKHJlc29sdmUpIHtcbiAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLndyYXAoZnVuY3Rpb24gX2NhbGxlZTMkKF9jb250ZXh0Mykge1xuICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQzLnByZXYgPSBfY29udGV4dDMubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiByZW5kZXIubGF1bmNoQW5pbWF0aW9uKCk7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDMuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgX2NhbGxlZTMpO1xuICAgIH0pKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoX3g0KSB7XG4gICAgICByZXR1cm4gX3JlZjQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9KCkpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGRlbGV0ZVxyXG4gKiBAcGFyYW0ge0NSZW5kZXJ9IHJlbmRlciBJbnN0YW5jZSBvZiBDUmVuZGVyXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuZGVsUHJvY2Vzc29yID0gZnVuY3Rpb24gKHJlbmRlcikge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBncmFwaHMgPSByZW5kZXIuZ3JhcGhzO1xuICB2YXIgaW5kZXggPSBncmFwaHMuZmluZEluZGV4KGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaCA9PT0gX3RoaXM7XG4gIH0pO1xuICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVEZWxldGUgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlRGVsZXRlKHRoaXMpO1xuICBncmFwaHMuc3BsaWNlKGluZGV4LCAxLCBudWxsKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmRlbGV0ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMuZGVsZXRlZCh0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFJldHVybiBhIHRpbWVkIHJlbGVhc2UgUHJvbWlzZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZSBSZWxlYXNlIHRpbWVcclxuICogQHJldHVybiB7UHJvbWlzZX0gQSB0aW1lZCByZWxlYXNlIFByb21pc2VcclxuICovXG5cblxuZnVuY3Rpb24gZGVsYXkodGltZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIHRpbWUpO1xuICB9KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2xhc3MgU3R5bGVcclxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlICBTdHlsZSBjb25maWd1cmF0aW9uXHJcbiAqIEByZXR1cm4ge1N0eWxlfSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKi9cbnZhciBTdHlsZSA9IGZ1bmN0aW9uIFN0eWxlKHN0eWxlKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgU3R5bGUpO1xuICB0aGlzLmNvbG9yUHJvY2Vzc29yKHN0eWxlKTtcbiAgdmFyIGRlZmF1bHRTdHlsZSA9IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBSZ2JhIHZhbHVlIG9mIGdyYXBoIGZpbGwgY29sb3JcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGZpbGwgPSBbMCwgMCwgMCwgMV1cclxuICAgICAqL1xuICAgIGZpbGw6IFswLCAwLCAwLCAxXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJnYmEgdmFsdWUgb2YgZ3JhcGggc3Ryb2tlIGNvbG9yXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHJva2UgPSBbMCwgMCwgMCwgMV1cclxuICAgICAqL1xuICAgIHN0cm9rZTogWzAsIDAsIDAsIDBdLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gT3BhY2l0eSBvZiBncmFwaFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IG9wYWNpdHkgPSAxXHJcbiAgICAgKi9cbiAgICBvcGFjaXR5OiAxLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZUNhcCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBsaW5lQ2FwID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgbGluZUNhcCA9ICdidXR0J3wncm91bmQnfCdzcXVhcmUnXHJcbiAgICAgKi9cbiAgICBsaW5lQ2FwOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZWpvaW4gb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgbGluZUpvaW4gPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBsaW5lSm9pbiA9ICdyb3VuZCd8J2JldmVsJ3wnbWl0ZXInXHJcbiAgICAgKi9cbiAgICBsaW5lSm9pbjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVEYXNoIG9mIEN0eFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgbGluZURhc2ggPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBsaW5lRGFzaCA9IFsxMCwgMTBdXHJcbiAgICAgKi9cbiAgICBsaW5lRGFzaDogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVEYXNoT2Zmc2V0IG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGxpbmVEYXNoT2Zmc2V0ID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgbGluZURhc2hPZmZzZXQgPSAxMFxyXG4gICAgICovXG4gICAgbGluZURhc2hPZmZzZXQ6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBTaGFkb3dCbHVyIG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHNoYWRvd0JsdXIgPSAwXHJcbiAgICAgKi9cbiAgICBzaGFkb3dCbHVyOiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gUmdiYSB2YWx1ZSBvZiBncmFwaCBzaGFkb3cgY29sb3JcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IHNoYWRvd0NvbG9yID0gWzAsIDAsIDAsIDBdXHJcbiAgICAgKi9cbiAgICBzaGFkb3dDb2xvcjogWzAsIDAsIDAsIDBdLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gU2hhZG93T2Zmc2V0WCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBzaGFkb3dPZmZzZXRYID0gMFxyXG4gICAgICovXG4gICAgc2hhZG93T2Zmc2V0WDogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFNoYWRvd09mZnNldFkgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgc2hhZG93T2Zmc2V0WSA9IDBcclxuICAgICAqL1xuICAgIHNoYWRvd09mZnNldFk6IDAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lV2lkdGggb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgbGluZVdpZHRoID0gMFxyXG4gICAgICovXG4gICAgbGluZVdpZHRoOiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQ2VudGVyIHBvaW50IG9mIHRoZSBncmFwaFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZ3JhcGhDZW50ZXIgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBncmFwaENlbnRlciA9IFsxMCwgMTBdXHJcbiAgICAgKi9cbiAgICBncmFwaENlbnRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYXBoIHNjYWxlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBzY2FsZSA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIHNjYWxlID0gWzEuNSwgMS41XVxyXG4gICAgICovXG4gICAgc2NhbGU6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFwaCByb3RhdGlvbiBkZWdyZWVcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCByb3RhdGUgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSByb3RhdGUgPSAxMFxyXG4gICAgICovXG4gICAgcm90YXRlOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggdHJhbnNsYXRlIGRpc3RhbmNlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCB0cmFuc2xhdGUgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSB0cmFuc2xhdGUgPSBbMTAsIDEwXVxyXG4gICAgICovXG4gICAgdHJhbnNsYXRlOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQ3Vyc29yIHN0YXR1cyB3aGVuIGhvdmVyXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgaG92ZXJDdXJzb3IgPSAncG9pbnRlcidcclxuICAgICAqIEBleGFtcGxlIGhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnfCdwb2ludGVyJ3wnYXV0byd8J2Nyb3NzaGFpcid8J21vdmUnfCd3YWl0J3wuLi5cclxuICAgICAqL1xuICAgIGhvdmVyQ3Vyc29yOiAncG9pbnRlcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHN0eWxlIG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGZvbnRTdHlsZSA9ICdub3JtYWwnXHJcbiAgICAgKiBAZXhhbXBsZSBmb250U3R5bGUgPSAnbm9ybWFsJ3wnaXRhbGljJ3wnb2JsaXF1ZSdcclxuICAgICAqL1xuICAgIGZvbnRTdHlsZTogJ25vcm1hbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHZhcmllbnQgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZm9udFZhcmllbnQgPSAnbm9ybWFsJ1xyXG4gICAgICogQGV4YW1wbGUgZm9udFZhcmllbnQgPSAnbm9ybWFsJ3wnc21hbGwtY2FwcydcclxuICAgICAqL1xuICAgIGZvbnRWYXJpZW50OiAnbm9ybWFsJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEZvbnQgd2VpZ2h0IG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBmb250V2VpZ2h0ID0gJ25vcm1hbCdcclxuICAgICAqIEBleGFtcGxlIGZvbnRXZWlnaHQgPSAnbm9ybWFsJ3wnYm9sZCd8J2JvbGRlcid8J2xpZ2h0ZXInfE51bWJlclxyXG4gICAgICovXG4gICAgZm9udFdlaWdodDogJ25vcm1hbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHNpemUgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgZm9udFNpemUgPSAxMFxyXG4gICAgICovXG4gICAgZm9udFNpemU6IDEwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCBmYW1pbHkgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZm9udEZhbWlseSA9ICdBcmlhbCdcclxuICAgICAqL1xuICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBUZXh0QWxpZ24gb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgdGV4dEFsaWduID0gJ2NlbnRlcidcclxuICAgICAqIEBleGFtcGxlIHRleHRBbGlnbiA9ICdzdGFydCd8J2VuZCd8J2xlZnQnfCdyaWdodCd8J2NlbnRlcidcclxuICAgICAqL1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBUZXh0QmFzZWxpbmUgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgdGV4dEJhc2VsaW5lID0gJ21pZGRsZSdcclxuICAgICAqIEBleGFtcGxlIHRleHRCYXNlbGluZSA9ICd0b3AnfCdib3R0b20nfCdtaWRkbGUnfCdhbHBoYWJldGljJ3wnaGFuZ2luZydcclxuICAgICAqL1xuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZScsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBUaGUgY29sb3IgdXNlZCB0byBjcmVhdGUgdGhlIGdyYWRpZW50XHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudENvbG9yID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRDb2xvciA9IFsnIzAwMCcsICcjMTExJywgJyMyMjInXVxyXG4gICAgICovXG4gICAgZ3JhZGllbnRDb2xvcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IHR5cGVcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudFR5cGUgPSAnbGluZWFyJ1xyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRUeXBlID0gJ2xpbmVhcicgfCAncmFkaWFsJ1xyXG4gICAgICovXG4gICAgZ3JhZGllbnRUeXBlOiAnbGluZWFyJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IHBhcmFtc1xyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRQYXJhbXMgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFBhcmFtcyA9IFt4MCwgeTAsIHgxLCB5MV0gKExpbmVhciBHcmFkaWVudClcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50UGFyYW1zID0gW3gwLCB5MCwgcjAsIHgxLCB5MSwgcjFdIChSYWRpYWwgR3JhZGllbnQpXHJcbiAgICAgKi9cbiAgICBncmFkaWVudFBhcmFtczogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZW4gdG8gdXNlIGdyYWRpZW50c1xyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50V2l0aCA9ICdzdHJva2UnXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFdpdGggPSAnc3Ryb2tlJyB8ICdmaWxsJ1xyXG4gICAgICovXG4gICAgZ3JhZGllbnRXaXRoOiAnc3Ryb2tlJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IGNvbG9yIHN0b3BzXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRTdG9wcyA9ICdhdXRvJ1xyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRTdG9wcyA9ICdhdXRvJyB8IFswLCAuMiwgLjMsIDFdXHJcbiAgICAgKi9cbiAgICBncmFkaWVudFN0b3BzOiAnYXV0bycsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBFeHRlbmRlZCBjb2xvciB0aGF0IHN1cHBvcnRzIGFuaW1hdGlvbiB0cmFuc2l0aW9uXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl8T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgY29sb3JzID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgY29sb3JzID0gWycjMDAwJywgJyMxMTEnLCAnIzIyMicsICdyZWQnIF1cclxuICAgICAqIEBleGFtcGxlIGNvbG9ycyA9IHsgYTogJyMwMDAnLCBiOiAnIzExMScgfVxyXG4gICAgICovXG4gICAgY29sb3JzOiBudWxsXG4gIH07XG4gIE9iamVjdC5hc3NpZ24odGhpcywgZGVmYXVsdFN0eWxlLCBzdHlsZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTZXQgY29sb3JzIHRvIHJnYmEgdmFsdWVcclxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlIHN0eWxlIGNvbmZpZ1xyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJldmVyc2UgV2hldGhlciB0byBwZXJmb3JtIHJldmVyc2Ugb3BlcmF0aW9uXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFN0eWxlO1xuXG5TdHlsZS5wcm90b3R5cGUuY29sb3JQcm9jZXNzb3IgPSBmdW5jdGlvbiAoc3R5bGUpIHtcbiAgdmFyIHJldmVyc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgcHJvY2Vzc29yID0gcmV2ZXJzZSA/IF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSA6IF9jb2xvci5nZXRSZ2JhVmFsdWU7XG4gIHZhciBjb2xvclByb2Nlc3NvcktleXMgPSBbJ2ZpbGwnLCAnc3Ryb2tlJywgJ3NoYWRvd0NvbG9yJ107XG4gIHZhciBhbGxLZXlzID0gT2JqZWN0LmtleXMoc3R5bGUpO1xuICB2YXIgY29sb3JLZXlzID0gYWxsS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBjb2xvclByb2Nlc3NvcktleXMuZmluZChmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIGsgPT09IGtleTtcbiAgICB9KTtcbiAgfSk7XG4gIGNvbG9yS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3R5bGVba2V5XSA9IHByb2Nlc3NvcihzdHlsZVtrZXldKTtcbiAgfSk7XG4gIHZhciBncmFkaWVudENvbG9yID0gc3R5bGUuZ3JhZGllbnRDb2xvcixcbiAgICAgIGNvbG9ycyA9IHN0eWxlLmNvbG9ycztcbiAgaWYgKGdyYWRpZW50Q29sb3IpIHN0eWxlLmdyYWRpZW50Q29sb3IgPSBncmFkaWVudENvbG9yLm1hcChmdW5jdGlvbiAoYykge1xuICAgIHJldHVybiBwcm9jZXNzb3IoYyk7XG4gIH0pO1xuXG4gIGlmIChjb2xvcnMpIHtcbiAgICB2YXIgY29sb3JzS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG4gICAgY29sb3JzS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBjb2xvcnNba2V5XSA9IHByb2Nlc3Nvcihjb2xvcnNba2V5XSk7XG4gICAgfSk7XG4gIH1cbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEluaXQgZ3JhcGggc3R5bGVcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLmluaXRTdHlsZSA9IGZ1bmN0aW9uIChjdHgpIHtcbiAgaW5pdFRyYW5zZm9ybShjdHgsIHRoaXMpO1xuICBpbml0R3JhcGhTdHlsZShjdHgsIHRoaXMpO1xuICBpbml0R3JhZGllbnQoY3R4LCB0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEluaXQgY2FudmFzIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gaW5pdFRyYW5zZm9ybShjdHgsIHN0eWxlKSB7XG4gIGN0eC5zYXZlKCk7XG4gIHZhciBncmFwaENlbnRlciA9IHN0eWxlLmdyYXBoQ2VudGVyLFxuICAgICAgcm90YXRlID0gc3R5bGUucm90YXRlLFxuICAgICAgc2NhbGUgPSBzdHlsZS5zY2FsZSxcbiAgICAgIHRyYW5zbGF0ZSA9IHN0eWxlLnRyYW5zbGF0ZTtcbiAgaWYgKCEoZ3JhcGhDZW50ZXIgaW5zdGFuY2VvZiBBcnJheSkpIHJldHVybjtcbiAgY3R4LnRyYW5zbGF0ZS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZ3JhcGhDZW50ZXIpKTtcbiAgaWYgKHJvdGF0ZSkgY3R4LnJvdGF0ZShyb3RhdGUgKiBNYXRoLlBJIC8gMTgwKTtcbiAgaWYgKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpIGN0eC5zY2FsZS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2NhbGUpKTtcbiAgaWYgKHRyYW5zbGF0ZSkgY3R4LnRyYW5zbGF0ZS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkodHJhbnNsYXRlKSk7XG4gIGN0eC50cmFuc2xhdGUoLWdyYXBoQ2VudGVyWzBdLCAtZ3JhcGhDZW50ZXJbMV0pO1xufVxuXG52YXIgYXV0b1NldFN0eWxlS2V5cyA9IFsnbGluZUNhcCcsICdsaW5lSm9pbicsICdsaW5lRGFzaE9mZnNldCcsICdzaGFkb3dPZmZzZXRYJywgJ3NoYWRvd09mZnNldFknLCAnbGluZVdpZHRoJywgJ3RleHRBbGlnbicsICd0ZXh0QmFzZWxpbmUnXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2V0IHRoZSBzdHlsZSBvZiBjYW52YXMgY3R4XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggIENvbnRleHQgb2YgY2FudmFzXHJcbiAqIEBwYXJhbSB7U3R5bGV9IHN0eWxlIEluc3RhbmNlIG9mIFN0eWxlXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuZnVuY3Rpb24gaW5pdEdyYXBoU3R5bGUoY3R4LCBzdHlsZSkge1xuICB2YXIgZmlsbCA9IHN0eWxlLmZpbGwsXG4gICAgICBzdHJva2UgPSBzdHlsZS5zdHJva2UsXG4gICAgICBzaGFkb3dDb2xvciA9IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgb3BhY2l0eSA9IHN0eWxlLm9wYWNpdHk7XG4gIGF1dG9TZXRTdHlsZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGtleSB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJykgY3R4W2tleV0gPSBzdHlsZVtrZXldO1xuICB9KTtcbiAgZmlsbCA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZmlsbCk7XG4gIHN0cm9rZSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc3Ryb2tlKTtcbiAgc2hhZG93Q29sb3IgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNoYWRvd0NvbG9yKTtcbiAgZmlsbFszXSAqPSBvcGFjaXR5O1xuICBzdHJva2VbM10gKj0gb3BhY2l0eTtcbiAgc2hhZG93Q29sb3JbM10gKj0gb3BhY2l0eTtcbiAgY3R4LmZpbGxTdHlsZSA9ICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKGZpbGwpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShzdHJva2UpO1xuICBjdHguc2hhZG93Q29sb3IgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShzaGFkb3dDb2xvcik7XG4gIHZhciBsaW5lRGFzaCA9IHN0eWxlLmxpbmVEYXNoLFxuICAgICAgc2hhZG93Qmx1ciA9IHN0eWxlLnNoYWRvd0JsdXI7XG5cbiAgaWYgKGxpbmVEYXNoKSB7XG4gICAgbGluZURhc2ggPSBsaW5lRGFzaC5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2ID49IDAgPyB2IDogMDtcbiAgICB9KTtcbiAgICBjdHguc2V0TGluZURhc2gobGluZURhc2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBzaGFkb3dCbHVyID09PSAnbnVtYmVyJykgY3R4LnNoYWRvd0JsdXIgPSBzaGFkb3dCbHVyID4gMCA/IHNoYWRvd0JsdXIgOiAwLjAwMTtcbiAgdmFyIGZvbnRTdHlsZSA9IHN0eWxlLmZvbnRTdHlsZSxcbiAgICAgIGZvbnRWYXJpZW50ID0gc3R5bGUuZm9udFZhcmllbnQsXG4gICAgICBmb250V2VpZ2h0ID0gc3R5bGUuZm9udFdlaWdodCxcbiAgICAgIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemUsXG4gICAgICBmb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseTtcbiAgY3R4LmZvbnQgPSBmb250U3R5bGUgKyAnICcgKyBmb250VmFyaWVudCArICcgJyArIGZvbnRXZWlnaHQgKyAnICcgKyBmb250U2l6ZSArICdweCcgKyAnICcgKyBmb250RmFtaWx5O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTZXQgdGhlIGdyYWRpZW50IGNvbG9yIG9mIGNhbnZhcyBjdHhcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgQ29udGV4dCBvZiBjYW52YXNcclxuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGluaXRHcmFkaWVudChjdHgsIHN0eWxlKSB7XG4gIGlmICghZ3JhZGllbnRWYWxpZGF0b3Ioc3R5bGUpKSByZXR1cm47XG4gIHZhciBncmFkaWVudENvbG9yID0gc3R5bGUuZ3JhZGllbnRDb2xvcixcbiAgICAgIGdyYWRpZW50UGFyYW1zID0gc3R5bGUuZ3JhZGllbnRQYXJhbXMsXG4gICAgICBncmFkaWVudFR5cGUgPSBzdHlsZS5ncmFkaWVudFR5cGUsXG4gICAgICBncmFkaWVudFdpdGggPSBzdHlsZS5ncmFkaWVudFdpdGgsXG4gICAgICBncmFkaWVudFN0b3BzID0gc3R5bGUuZ3JhZGllbnRTdG9wcyxcbiAgICAgIG9wYWNpdHkgPSBzdHlsZS5vcGFjaXR5O1xuICBncmFkaWVudENvbG9yID0gZ3JhZGllbnRDb2xvci5tYXAoZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgdmFyIGNvbG9yT3BhY2l0eSA9IGNvbG9yWzNdICogb3BhY2l0eTtcbiAgICB2YXIgY2xvbmVkQ29sb3IgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNvbG9yKTtcbiAgICBjbG9uZWRDb2xvclszXSA9IGNvbG9yT3BhY2l0eTtcbiAgICByZXR1cm4gY2xvbmVkQ29sb3I7XG4gIH0pO1xuICBncmFkaWVudENvbG9yID0gZ3JhZGllbnRDb2xvci5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoYyk7XG4gIH0pO1xuICBpZiAoZ3JhZGllbnRTdG9wcyA9PT0gJ2F1dG8nKSBncmFkaWVudFN0b3BzID0gZ2V0QXV0b0NvbG9yU3RvcHMoZ3JhZGllbnRDb2xvcik7XG4gIHZhciBncmFkaWVudCA9IGN0eFtcImNyZWF0ZVwiLmNvbmNhdChncmFkaWVudFR5cGUuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArIGdyYWRpZW50VHlwZS5zbGljZSgxKSwgXCJHcmFkaWVudFwiKV0uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdyYWRpZW50UGFyYW1zKSk7XG4gIGdyYWRpZW50U3RvcHMuZm9yRWFjaChmdW5jdGlvbiAoc3RvcCwgaSkge1xuICAgIHJldHVybiBncmFkaWVudC5hZGRDb2xvclN0b3Aoc3RvcCwgZ3JhZGllbnRDb2xvcltpXSk7XG4gIH0pO1xuICBjdHhbXCJcIi5jb25jYXQoZ3JhZGllbnRXaXRoLCBcIlN0eWxlXCIpXSA9IGdyYWRpZW50O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgZ3JhZGllbnQgY29uZmlndXJhdGlvbiBpcyBsZWdhbFxyXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBDaGVjayBSZXN1bHRcclxuICovXG5cblxuZnVuY3Rpb24gZ3JhZGllbnRWYWxpZGF0b3Ioc3R5bGUpIHtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSBzdHlsZS5ncmFkaWVudENvbG9yLFxuICAgICAgZ3JhZGllbnRQYXJhbXMgPSBzdHlsZS5ncmFkaWVudFBhcmFtcyxcbiAgICAgIGdyYWRpZW50VHlwZSA9IHN0eWxlLmdyYWRpZW50VHlwZSxcbiAgICAgIGdyYWRpZW50V2l0aCA9IHN0eWxlLmdyYWRpZW50V2l0aCxcbiAgICAgIGdyYWRpZW50U3RvcHMgPSBzdHlsZS5ncmFkaWVudFN0b3BzO1xuICBpZiAoIWdyYWRpZW50Q29sb3IgfHwgIWdyYWRpZW50UGFyYW1zKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGdyYWRpZW50Q29sb3IubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc29sZS53YXJuKCdUaGUgZ3JhZGllbnQgbmVlZHMgdG8gcHJvdmlkZSBhdCBsZWFzdCB0d28gY29sb3JzJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50VHlwZSAhPT0gJ2xpbmVhcicgJiYgZ3JhZGllbnRUeXBlICE9PSAncmFkaWFsJykge1xuICAgIGNvbnNvbGUud2FybignR3JhZGllbnRUeXBlIG9ubHkgc3VwcG9ydHMgbGluZWFyIG9yIHJhZGlhbCwgY3VycmVudCB2YWx1ZSBpcyAnICsgZ3JhZGllbnRUeXBlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZ3JhZGllbnRQYXJhbXNMZW5ndGggPSBncmFkaWVudFBhcmFtcy5sZW5ndGg7XG5cbiAgaWYgKGdyYWRpZW50VHlwZSA9PT0gJ2xpbmVhcicgJiYgZ3JhZGllbnRQYXJhbXNMZW5ndGggIT09IDQgfHwgZ3JhZGllbnRUeXBlID09PSAncmFkaWFsJyAmJiBncmFkaWVudFBhcmFtc0xlbmd0aCAhPT0gNikge1xuICAgIGNvbnNvbGUud2FybignVGhlIGV4cGVjdGVkIGxlbmd0aCBvZiBncmFkaWVudFBhcmFtcyBpcyAnICsgKGdyYWRpZW50VHlwZSA9PT0gJ2xpbmVhcicgPyAnNCcgOiAnNicpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZ3JhZGllbnRXaXRoICE9PSAnZmlsbCcgJiYgZ3JhZGllbnRXaXRoICE9PSAnc3Ryb2tlJykge1xuICAgIGNvbnNvbGUud2FybignR3JhZGllbnRXaXRoIG9ubHkgc3VwcG9ydHMgZmlsbCBvciBzdHJva2UsIGN1cnJlbnQgdmFsdWUgaXMgJyArIGdyYWRpZW50V2l0aCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50U3RvcHMgIT09ICdhdXRvJyAmJiAhKGdyYWRpZW50U3RvcHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLndhcm4oXCJncmFkaWVudFN0b3BzIG9ubHkgc3VwcG9ydHMgJ2F1dG8nIG9yIE51bWJlciBBcnJheSAoWzAsIC41LCAxXSksIGN1cnJlbnQgdmFsdWUgaXMgXCIgKyBncmFkaWVudFN0b3BzKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IGEgdW5pZm9ybSBncmFkaWVudCBjb2xvciBzdG9wXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNvbG9yIEdyYWRpZW50IGNvbG9yXHJcbiAqIEByZXR1cm4ge0FycmF5fSBHcmFkaWVudCBjb2xvciBzdG9wXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEF1dG9Db2xvclN0b3BzKGNvbG9yKSB7XG4gIHZhciBzdG9wR2FwID0gMSAvIChjb2xvci5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIGNvbG9yLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHN0b3BHYXAgKiBpO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUmVzdG9yZSBjYW52YXMgY3R4IHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLnJlc3RvcmVUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoY3R4KSB7XG4gIGN0eC5yZXN0b3JlKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBVcGRhdGUgc3R5bGUgZGF0YVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY2hhbmdlIENoYW5nZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChjaGFuZ2UpIHtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihjaGFuZ2UpO1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGNoYW5nZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGN1cnJlbnQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IFN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLmdldFN0eWxlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2xvbmVkU3R5bGUgPSAoMCwgX3V0aWwuZGVlcENsb25lKSh0aGlzLCB0cnVlKTtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihjbG9uZWRTdHlsZSwgdHJ1ZSk7XG4gIHJldHVybiBjbG9uZWRTdHlsZTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5leHRlbmROZXdHcmFwaCA9IGV4dGVuZE5ld0dyYXBoO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBleHBvcnRzLnRleHQgPSBleHBvcnRzLmJlemllckN1cnZlID0gZXhwb3J0cy5zbW9vdGhsaW5lID0gZXhwb3J0cy5wb2x5bGluZSA9IGV4cG9ydHMucmVnUG9seWdvbiA9IGV4cG9ydHMuc2VjdG9yID0gZXhwb3J0cy5hcmMgPSBleHBvcnRzLnJpbmcgPSBleHBvcnRzLnJlY3QgPSBleHBvcnRzLmVsbGlwc2UgPSBleHBvcnRzLmNpcmNsZSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfYmV6aWVyQ3VydmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY2FudmFzID0gcmVxdWlyZShcIi4uL3BsdWdpbi9jYW52YXNcIik7XG5cbnZhciBwb2x5bGluZVRvQmV6aWVyQ3VydmUgPSBfYmV6aWVyQ3VydmUyW1wiZGVmYXVsdFwiXS5wb2x5bGluZVRvQmV6aWVyQ3VydmUsXG4gICAgYmV6aWVyQ3VydmVUb1BvbHlsaW5lID0gX2JlemllckN1cnZlMltcImRlZmF1bHRcIl0uYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xudmFyIGNpcmNsZSA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcblxuICAgIGlmICh0eXBlb2YgcnggIT09ICdudW1iZXInIHx8IHR5cGVvZiByeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHIgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDaXJjbGUgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMiwgX3JlZjMpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjIuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5DaXJjbGUpKHBvc2l0aW9uLCByeCwgcnksIHIpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNS5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY2LCBfcmVmNykge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNi5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY2Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNy5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHNoYXBlLnJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHNoYXBlLnJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmNpcmNsZSA9IGNpcmNsZTtcbnZhciBlbGxpcHNlID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIGhyOiAwLFxuICAgIHZyOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjguc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiBociAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHZyICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignRWxsaXBzZSBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY5LCBfcmVmMTApIHtcbiAgICB2YXIgY3R4ID0gX3JlZjkuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMC5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG4gICAgY3R4LmVsbGlwc2UocngsIHJ5LCBociA+IDAgPyBociA6IDAuMDEsIHZyID4gMCA/IHZyIDogMC4wMSwgMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjExKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjExLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICBociA9IHNoYXBlLmhyLFxuICAgICAgICB2ciA9IHNoYXBlLnZyO1xuICAgIHZhciBhID0gTWF0aC5tYXgoaHIsIHZyKTtcbiAgICB2YXIgYiA9IE1hdGgubWluKGhyLCB2cik7XG4gICAgdmFyIGMgPSBNYXRoLnNxcnQoYSAqIGEgLSBiICogYik7XG4gICAgdmFyIGxlZnRGb2N1c1BvaW50ID0gW3J4IC0gYywgcnldO1xuICAgIHZhciByaWdodEZvY3VzUG9pbnQgPSBbcnggKyBjLCByeV07XG4gICAgdmFyIGRpc3RhbmNlID0gKDAsIF91dGlsLmdldFR3b1BvaW50RGlzdGFuY2UpKHBvc2l0aW9uLCBsZWZ0Rm9jdXNQb2ludCkgKyAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIHJpZ2h0Rm9jdXNQb2ludCk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDw9IDIgKiBhO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjEyKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEyLnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYxMi5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWYxMywgX3JlZjE0KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWYxMy5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWYxMy5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE0LnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogc2hhcGUucnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogc2hhcGUucnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuZWxsaXBzZSA9IGVsbGlwc2U7XG52YXIgcmVjdCA9IHtcbiAgc2hhcGU6IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgdzogMCxcbiAgICBoOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYxNSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxNS5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG5cbiAgICBpZiAodHlwZW9mIHggIT09ICdudW1iZXInIHx8IHR5cGVvZiB5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdyAhPT0gJ251bWJlcicgfHwgdHlwZW9mIGggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZWN0IHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjE2LCBfcmVmMTcpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjE2LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTcuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICBjdHgucmVjdCh4LCB5LCB3LCBoKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYxOCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxOC5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblJlY3QpKHBvc2l0aW9uLCB4LCB5LCB3LCBoKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYxOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxOS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMTkuc3R5bGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3ggKyB3IC8gMiwgeSArIGggLyAyXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmMjAsIF9yZWYyMSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmMjAubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmMjAubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWYyMS5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgeDogc2hhcGUueCArIG1vdmVtZW50WCxcbiAgICAgIHk6IHNoYXBlLnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMucmVjdCA9IHJlY3Q7XG52YXIgcmluZyA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYyMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYyMi5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiByICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignUmluZyBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYyMywgX3JlZjI0KSB7XG4gICAgdmFyIGN0eCA9IF9yZWYyMy5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI0LnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjUuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjI1LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuICAgIHZhciBoYWxmTGluZVdpZHRoID0gbGluZVdpZHRoIC8gMjtcbiAgICB2YXIgbWluRGlzdGFuY2UgPSByIC0gaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgbWF4RGlzdGFuY2UgPSByICsgaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgZGlzdGFuY2UgPSAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIFtyeCwgcnldKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPj0gbWluRGlzdGFuY2UgJiYgZGlzdGFuY2UgPD0gbWF4RGlzdGFuY2U7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMjYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjYuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjI2LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjI3LCBfcmVmMjgpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjI3Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjI3Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjguc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yaW5nID0gcmluZztcbnZhciBhcmMgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGNsb2NrV2lzZTogdHJ1ZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMjkpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjkuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBcmMgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMzAsIF9yZWYzMSkge1xuICAgIHZhciBjdHggPSBfcmVmMzAuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMS5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIGN0eC5hcmMocngsIHJ5LCByID4gMCA/IHIgOiAwLjAwMSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYzMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMi5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMzIuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG4gICAgdmFyIGhhbGZMaW5lV2lkdGggPSBsaW5lV2lkdGggLyAyO1xuICAgIHZhciBpbnNpZGVSYWRpdXMgPSByIC0gaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgb3V0c2lkZVJhZGl1cyA9IHIgKyBoYWxmTGluZVdpZHRoO1xuICAgIHJldHVybiAhKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luU2VjdG9yKShwb3NpdGlvbiwgcngsIHJ5LCBpbnNpZGVSYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpICYmICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgb3V0c2lkZVJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMzMpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzMuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjMzLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjM0LCBfcmVmMzUpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjM0Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjM0Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzUuc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5hcmMgPSBhcmM7XG52YXIgc2VjdG9yID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDAsXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICBlbmRBbmdsZTogMCxcbiAgICBjbG9ja1dpc2U6IHRydWVcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjM2KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjM2LnNoYXBlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdyJywgJ3N0YXJ0QW5nbGUnLCAnZW5kQW5nbGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignU2VjdG9yIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjM3LCBfcmVmMzgpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjM3LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzguc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICBjdHguYXJjKHJ4LCByeSwgciA+IDAgPyByIDogMC4wMSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIGN0eC5saW5lVG8ocngsIHJ5KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYzOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzOS5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgciwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNDApIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDAuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjQwLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjQxLCBfcmVmNDIpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjQxLm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjQxLm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDIuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiByeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiByeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5zZWN0b3IgPSBzZWN0b3I7XG52YXIgcmVnUG9seWdvbiA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwLFxuICAgIHNpZGU6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjQzKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQzLnNoYXBlO1xuICAgIHZhciBzaWRlID0gc2hhcGUuc2lkZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAncicsICdzaWRlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ1BvbHlnb24gc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2lkZSA8IDMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ1BvbHlnb24gYXQgbGVhc3QgdHJpZ29uIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY0NCwgX3JlZjQ1KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY0NC5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQ1LnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY0NS5jYWNoZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzaWRlID0gc2hhcGUuc2lkZTtcblxuICAgIGlmICghY2FjaGUucG9pbnRzIHx8IGNhY2hlLnJ4ICE9PSByeCB8fCBjYWNoZS5yeSAhPT0gcnkgfHwgY2FjaGUuciAhPT0gciB8fCBjYWNoZS5zaWRlICE9PSBzaWRlKSB7XG4gICAgICB2YXIgX3BvaW50cyA9ICgwLCBfdXRpbC5nZXRSZWd1bGFyUG9seWdvblBvaW50cykocngsIHJ5LCByLCBzaWRlKTtcblxuICAgICAgT2JqZWN0LmFzc2lnbihjYWNoZSwge1xuICAgICAgICBwb2ludHM6IF9wb2ludHMsXG4gICAgICAgIHJ4OiByeCxcbiAgICAgICAgcnk6IHJ5LFxuICAgICAgICByOiByLFxuICAgICAgICBzaWRlOiBzaWRlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gY2FjaGUucG9pbnRzO1xuICAgICgwLCBfY2FudmFzLmRyYXdQb2x5bGluZVBhdGgpKGN0eCwgcG9pbnRzKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY0Nikge1xuICAgIHZhciBjYWNoZSA9IF9yZWY0Ni5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gY2FjaGUucG9pbnRzO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgcG9pbnRzKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY0Nykge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0Ny5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNDcuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNDgsIF9yZWY0OSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNDgubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNDgubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY0OS5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNDkuY2FjaGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgY2FjaGUucnggKz0gbW92ZW1lbnRYO1xuICAgIGNhY2hlLnJ5ICs9IG1vdmVtZW50WTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gICAgY2FjaGUucG9pbnRzID0gY2FjaGUucG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjUwKSB7XG4gICAgICB2YXIgX3JlZjUxID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1MCwgMiksXG4gICAgICAgICAgeCA9IF9yZWY1MVswXSxcbiAgICAgICAgICB5ID0gX3JlZjUxWzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yZWdQb2x5Z29uID0gcmVnUG9seWdvbjtcbnZhciBwb2x5bGluZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNTIpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTIuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignUG9seWxpbmUgcG9pbnRzIHNob3VsZCBiZSBhbiBhcnJheSEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNTMsIF9yZWY1NCkge1xuICAgIHZhciBjdHggPSBfcmVmNTMuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY1NC5zaGFwZSxcbiAgICAgICAgbGluZVdpZHRoID0gX3JlZjU0LnN0eWxlLmxpbmVXaWR0aDtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICBpZiAobGluZVdpZHRoID09PSAxKSBwb2ludHMgPSAoMCwgX3V0aWwuZWxpbWluYXRlQmx1cikocG9pbnRzKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3UG9seWxpbmVQYXRoKShjdHgsIHBvaW50cyk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY1NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1NS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNTUuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUG9seWdvbikocG9zaXRpb24sIHBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgcG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY1Nikge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1Ni5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNTYuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNTcsIF9yZWY1OCkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNTcubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNTcubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY1OC5zaGFwZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHZhciBtb3ZlQWZ0ZXJQb2ludHMgPSBwb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmNTkpIHtcbiAgICAgIHZhciBfcmVmNjAgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjU5LCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjYwWzBdLFxuICAgICAgICAgIHkgPSBfcmVmNjBbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvaW50czogbW92ZUFmdGVyUG9pbnRzXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnBvbHlsaW5lID0gcG9seWxpbmU7XG52YXIgc21vb3RobGluZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNjEpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNjEuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignU21vb3RobGluZSBwb2ludHMgc2hvdWxkIGJlIGFuIGFycmF5IScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY2MiwgX3JlZjYzKSB7XG4gICAgdmFyIGN0eCA9IF9yZWY2Mi5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjYzLnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY2My5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzLFxuICAgICAgICBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuXG4gICAgaWYgKCFjYWNoZS5wb2ludHMgfHwgY2FjaGUucG9pbnRzLnRvU3RyaW5nKCkgIT09IHBvaW50cy50b1N0cmluZygpKSB7XG4gICAgICB2YXIgX2JlemllckN1cnZlID0gcG9seWxpbmVUb0JlemllckN1cnZlKHBvaW50cywgY2xvc2UpO1xuXG4gICAgICB2YXIgaG92ZXJQb2ludHMgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmUoX2JlemllckN1cnZlKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiAoMCwgX3V0aWwuZGVlcENsb25lKShwb2ludHMsIHRydWUpLFxuICAgICAgICBiZXppZXJDdXJ2ZTogX2JlemllckN1cnZlLFxuICAgICAgICBob3ZlclBvaW50czogaG92ZXJQb2ludHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBiZXppZXJDdXJ2ZSA9IGNhY2hlLmJlemllckN1cnZlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3QmV6aWVyQ3VydmVQYXRoKShjdHgsIGJlemllckN1cnZlLnNsaWNlKDEpLCBiZXppZXJDdXJ2ZVswXSk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY2NCkge1xuICAgIHZhciBjYWNoZSA9IF9yZWY2NC5jYWNoZSxcbiAgICAgICAgc2hhcGUgPSBfcmVmNjQuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjY0LnN0eWxlO1xuICAgIHZhciBob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzO1xuICAgIHZhciBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgaG92ZXJQb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSkocG9zaXRpb24sIGhvdmVyUG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY2NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY2NS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNjUuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNjYsIF9yZWY2Nykge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNjYubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNjYubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY2Ny5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNjcuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICB2YXIgbW92ZUFmdGVyUG9pbnRzID0gcG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjY4KSB7XG4gICAgICB2YXIgX3JlZjY5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY2OCwgMiksXG4gICAgICAgICAgeCA9IF9yZWY2OVswXSxcbiAgICAgICAgICB5ID0gX3JlZjY5WzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIGNhY2hlLnBvaW50cyA9IG1vdmVBZnRlclBvaW50cztcblxuICAgIHZhciBfY2FjaGUkYmV6aWVyQ3VydmUkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGNhY2hlLmJlemllckN1cnZlWzBdLCAyKSxcbiAgICAgICAgZnggPSBfY2FjaGUkYmV6aWVyQ3VydmUkWzBdLFxuICAgICAgICBmeSA9IF9jYWNoZSRiZXppZXJDdXJ2ZSRbMV07XG5cbiAgICB2YXIgY3VydmVzID0gY2FjaGUuYmV6aWVyQ3VydmUuc2xpY2UoMSk7XG4gICAgY2FjaGUuYmV6aWVyQ3VydmUgPSBbW2Z4ICsgbW92ZW1lbnRYLCBmeSArIG1vdmVtZW50WV1dLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGN1cnZlcy5tYXAoZnVuY3Rpb24gKGN1cnZlKSB7XG4gICAgICByZXR1cm4gY3VydmUubWFwKGZ1bmN0aW9uIChfcmVmNzApIHtcbiAgICAgICAgdmFyIF9yZWY3MSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNzAsIDIpLFxuICAgICAgICAgICAgeCA9IF9yZWY3MVswXSxcbiAgICAgICAgICAgIHkgPSBfcmVmNzFbMV07XG5cbiAgICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICAgIH0pO1xuICAgIH0pKSk7XG4gICAgY2FjaGUuaG92ZXJQb2ludHMgPSBjYWNoZS5ob3ZlclBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY3Mikge1xuICAgICAgdmFyIF9yZWY3MyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNzIsIDIpLFxuICAgICAgICAgIHggPSBfcmVmNzNbMF0sXG4gICAgICAgICAgeSA9IF9yZWY3M1sxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcG9pbnRzOiBtb3ZlQWZ0ZXJQb2ludHNcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuc21vb3RobGluZSA9IHNtb290aGxpbmU7XG52YXIgYmV6aWVyQ3VydmUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcG9pbnRzOiBbXSxcbiAgICBjbG9zZTogZmFsc2VcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjc0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc0LnNoYXBlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG5cbiAgICBpZiAoIShwb2ludHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0JlemllckN1cnZlIHBvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjc1LCBfcmVmNzYpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjc1LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNzYuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjc2LmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHMsXG4gICAgICAgIGNsb3NlID0gc2hhcGUuY2xvc2U7XG5cbiAgICBpZiAoIWNhY2hlLnBvaW50cyB8fCBjYWNoZS5wb2ludHMudG9TdHJpbmcoKSAhPT0gcG9pbnRzLnRvU3RyaW5nKCkpIHtcbiAgICAgIHZhciBob3ZlclBvaW50cyA9IGJlemllckN1cnZlVG9Qb2x5bGluZShwb2ludHMsIDIwKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiAoMCwgX3V0aWwuZGVlcENsb25lKShwb2ludHMsIHRydWUpLFxuICAgICAgICBob3ZlclBvaW50czogaG92ZXJQb2ludHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3QmV6aWVyQ3VydmVQYXRoKShjdHgsIHBvaW50cy5zbGljZSgxKSwgcG9pbnRzWzBdKTtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjc3KSB7XG4gICAgdmFyIGNhY2hlID0gX3JlZjc3LmNhY2hlLFxuICAgICAgICBzaGFwZSA9IF9yZWY3Ny5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNzcuc3R5bGU7XG4gICAgdmFyIGhvdmVyUG9pbnRzID0gY2FjaGUuaG92ZXJQb2ludHM7XG4gICAgdmFyIGNsb3NlID0gc2hhcGUuY2xvc2U7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblBvbHlnb24pKHBvc2l0aW9uLCBob3ZlclBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgaG92ZXJQb2ludHMsIGxpbmVXaWR0aCk7XG4gICAgfVxuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjc4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc4LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY3OC5zdHlsZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gcG9pbnRzWzBdO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY3OSwgX3JlZjgwKSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY3OS5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY3OS5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjgwLnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY4MC5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuXG4gICAgdmFyIF9wb2ludHMkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50c1swXSwgMiksXG4gICAgICAgIGZ4ID0gX3BvaW50cyRbMF0sXG4gICAgICAgIGZ5ID0gX3BvaW50cyRbMV07XG5cbiAgICB2YXIgY3VydmVzID0gcG9pbnRzLnNsaWNlKDEpO1xuICAgIHZhciBiZXppZXJDdXJ2ZSA9IFtbZnggKyBtb3ZlbWVudFgsIGZ5ICsgbW92ZW1lbnRZXV0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY3VydmVzLm1hcChmdW5jdGlvbiAoY3VydmUpIHtcbiAgICAgIHJldHVybiBjdXJ2ZS5tYXAoZnVuY3Rpb24gKF9yZWY4MSkge1xuICAgICAgICB2YXIgX3JlZjgyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4MSwgMiksXG4gICAgICAgICAgICB4ID0gX3JlZjgyWzBdLFxuICAgICAgICAgICAgeSA9IF9yZWY4MlsxXTtcblxuICAgICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgICAgfSk7XG4gICAgfSkpKTtcbiAgICBjYWNoZS5wb2ludHMgPSBiZXppZXJDdXJ2ZTtcbiAgICBjYWNoZS5ob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjgzKSB7XG4gICAgICB2YXIgX3JlZjg0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4MywgMiksXG4gICAgICAgICAgeCA9IF9yZWY4NFswXSxcbiAgICAgICAgICB5ID0gX3JlZjg0WzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICBwb2ludHM6IGJlemllckN1cnZlXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmJlemllckN1cnZlID0gYmV6aWVyQ3VydmU7XG52YXIgdGV4dCA9IHtcbiAgc2hhcGU6IHtcbiAgICBjb250ZW50OiAnJyxcbiAgICBwb3NpdGlvbjogW10sXG4gICAgbWF4V2lkdGg6IHVuZGVmaW5lZCxcbiAgICByb3dHYXA6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjg1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjg1LnNoYXBlO1xuICAgIHZhciBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbixcbiAgICAgICAgcm93R2FwID0gc2hhcGUucm93R2FwO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCBjb250ZW50IHNob3VsZCBiZSBhIHN0cmluZyEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIShwb3NpdGlvbiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCBwb3NpdGlvbiBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByb3dHYXAgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXh0IHJvd0dhcCBzaG91bGQgYmUgYSBudW1iZXIhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjg2LCBfcmVmODcpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjg2LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODcuc2hhcGU7XG4gICAgdmFyIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uLFxuICAgICAgICBtYXhXaWR0aCA9IHNoYXBlLm1heFdpZHRoLFxuICAgICAgICByb3dHYXAgPSBzaGFwZS5yb3dHYXA7XG4gICAgdmFyIHRleHRCYXNlbGluZSA9IGN0eC50ZXh0QmFzZWxpbmUsXG4gICAgICAgIGZvbnQgPSBjdHguZm9udDtcbiAgICB2YXIgZm9udFNpemUgPSBwYXJzZUludChmb250LnJlcGxhY2UoL1xcRC9nLCAnJykpO1xuXG4gICAgdmFyIF9wb3NpdGlvbiA9IHBvc2l0aW9uLFxuICAgICAgICBfcG9zaXRpb24yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9wb3NpdGlvbiwgMiksXG4gICAgICAgIHggPSBfcG9zaXRpb24yWzBdLFxuICAgICAgICB5ID0gX3Bvc2l0aW9uMlsxXTtcblxuICAgIGNvbnRlbnQgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcbiAgICB2YXIgcm93TnVtID0gY29udGVudC5sZW5ndGg7XG4gICAgdmFyIGxpbmVIZWlnaHQgPSBmb250U2l6ZSArIHJvd0dhcDtcbiAgICB2YXIgYWxsSGVpZ2h0ID0gcm93TnVtICogbGluZUhlaWdodCAtIHJvd0dhcDtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgIGlmICh0ZXh0QmFzZWxpbmUgPT09ICdtaWRkbGUnKSB7XG4gICAgICBvZmZzZXQgPSBhbGxIZWlnaHQgLyAyO1xuICAgICAgeSArPSBmb250U2l6ZSAvIDI7XG4gICAgfVxuXG4gICAgaWYgKHRleHRCYXNlbGluZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIG9mZnNldCA9IGFsbEhlaWdodDtcbiAgICAgIHkgKz0gZm9udFNpemU7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBuZXcgQXJyYXkocm93TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICByZXR1cm4gW3gsIHkgKyBpICogbGluZUhlaWdodCAtIG9mZnNldF07XG4gICAgfSk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRlbnQuZm9yRWFjaChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgY3R4LmZpbGxUZXh0LmFwcGx5KGN0eCwgW3RleHRdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uW2ldKSwgW21heFdpZHRoXSkpO1xuICAgICAgY3R4LnN0cm9rZVRleHQuYXBwbHkoY3R4LCBbdGV4dF0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb25baV0pLCBbbWF4V2lkdGhdKSk7XG4gICAgfSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmODgpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODguc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjg4LnN0eWxlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY4OSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY4OS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmODkuc3R5bGU7XG4gICAgdmFyIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb247XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uKTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmOTAsIF9yZWY5MSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmOTAubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmOTAubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY5MS5zaGFwZTtcblxuICAgIHZhciBfc2hhcGUkcG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2hhcGUucG9zaXRpb24sIDIpLFxuICAgICAgICB4ID0gX3NoYXBlJHBvc2l0aW9uWzBdLFxuICAgICAgICB5ID0gX3NoYXBlJHBvc2l0aW9uWzFdO1xuXG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvc2l0aW9uOiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV1cbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMudGV4dCA9IHRleHQ7XG52YXIgZ3JhcGhzID0gbmV3IE1hcChbWydjaXJjbGUnLCBjaXJjbGVdLCBbJ2VsbGlwc2UnLCBlbGxpcHNlXSwgWydyZWN0JywgcmVjdF0sIFsncmluZycsIHJpbmddLCBbJ2FyYycsIGFyY10sIFsnc2VjdG9yJywgc2VjdG9yXSwgWydyZWdQb2x5Z29uJywgcmVnUG9seWdvbl0sIFsncG9seWxpbmUnLCBwb2x5bGluZV0sIFsnc21vb3RobGluZScsIHNtb290aGxpbmVdLCBbJ2JlemllckN1cnZlJywgYmV6aWVyQ3VydmVdLCBbJ3RleHQnLCB0ZXh0XV0pO1xudmFyIF9kZWZhdWx0ID0gZ3JhcGhzO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBFeHRlbmQgbmV3IGdyYXBoXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lICAgTmFtZSBvZiBHcmFwaFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gb2YgR3JhcGhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0O1xuXG5mdW5jdGlvbiBleHRlbmROZXdHcmFwaChuYW1lLCBjb25maWcpIHtcbiAgaWYgKCFuYW1lIHx8ICFjb25maWcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFeHRlbmROZXdHcmFwaCBNaXNzaW5nIFBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb25maWcuc2hhcGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZXF1aXJlZCBhdHRyaWJ1dGUgb2Ygc2hhcGUgdG8gZXh0ZW5kTmV3R3JhcGghJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb25maWcudmFsaWRhdG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignUmVxdWlyZWQgZnVuY3Rpb24gb2YgdmFsaWRhdG9yIHRvIGV4dGVuZE5ld0dyYXBoIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY29uZmlnLmRyYXcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZXF1aXJlZCBmdW5jdGlvbiBvZiBkcmF3IHRvIGV4dGVuZE5ld0dyYXBoIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGdyYXBocy5zZXQobmFtZSwgY29uZmlnKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJDUmVuZGVyXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9jcmVuZGVyW1wiZGVmYXVsdFwiXTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJleHRlbmROZXdHcmFwaFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ3JhcGhzLmV4dGVuZE5ld0dyYXBoO1xuICB9XG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2NyZW5kZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NsYXNzL2NyZW5kZXIuY2xhc3NcIikpO1xuXG52YXIgX2dyYXBocyA9IHJlcXVpcmUoXCIuL2NvbmZpZy9ncmFwaHNcIik7XG5cbnZhciBfZGVmYXVsdCA9IF9jcmVuZGVyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kcmF3UG9seWxpbmVQYXRoID0gZHJhd1BvbHlsaW5lUGF0aDtcbmV4cG9ydHMuZHJhd0JlemllckN1cnZlUGF0aCA9IGRyYXdCZXppZXJDdXJ2ZVBhdGg7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEcmF3IGEgcG9seWxpbmUgcGF0aFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICAgICAgICBDYW52YXMgMmQgY29udGV4dFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgICAgICBUaGUgcG9pbnRzIHRoYXQgbWFrZXMgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJlZ2luUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgYmVnaW5QYXRoXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2VQYXRoIFdoZXRoZXIgdG8gZXhlY3V0ZSBjbG9zZVBhdGhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuZnVuY3Rpb24gZHJhd1BvbHlsaW5lUGF0aChjdHgsIHBvaW50cykge1xuICB2YXIgYmVnaW5QYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIGNsb3NlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG4gIGlmICghY3R4IHx8IHBvaW50cy5sZW5ndGggPCAyKSByZXR1cm4gZmFsc2U7XG4gIGlmIChiZWdpblBhdGgpIGN0eC5iZWdpblBhdGgoKTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50LCBpKSB7XG4gICAgcmV0dXJuIHBvaW50ICYmIChpID09PSAwID8gY3R4Lm1vdmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQpKSA6IGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvaW50KSkpO1xuICB9KTtcbiAgaWYgKGNsb3NlUGF0aCkgY3R4LmNsb3NlUGF0aCgpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEcmF3IGEgYmV6aWVyIGN1cnZlIHBhdGhcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgICAgICAgQ2FudmFzIDJkIGNvbnRleHRcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzICAgICAgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IG1vdmVUbyAgICAgIFRoZSBwb2ludCBuZWVkIHRvIGV4Y3V0ZSBtb3ZlVG9cclxuICogQHBhcmFtIHtCb29sZWFufSBiZWdpblBhdGggV2hldGhlciB0byBleGVjdXRlIGJlZ2luUGF0aFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgY2xvc2VQYXRoXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBkcmF3QmV6aWVyQ3VydmVQYXRoKGN0eCwgcG9pbnRzKSB7XG4gIHZhciBtb3ZlVG8gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgYmVnaW5QYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcbiAgdmFyIGNsb3NlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogZmFsc2U7XG4gIGlmICghY3R4IHx8ICFwb2ludHMpIHJldHVybiBmYWxzZTtcbiAgaWYgKGJlZ2luUGF0aCkgY3R4LmJlZ2luUGF0aCgpO1xuICBpZiAobW92ZVRvKSBjdHgubW92ZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtb3ZlVG8pKTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBjdHguYmV6aWVyQ3VydmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbVswXSkuY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbVsxXSksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbVsyXSkpKTtcbiAgfSk7XG4gIGlmIChjbG9zZVBhdGgpIGN0eC5jbG9zZVBhdGgoKTtcbn1cblxudmFyIF9kZWZhdWx0ID0ge1xuICBkcmF3UG9seWxpbmVQYXRoOiBkcmF3UG9seWxpbmVQYXRoLFxuICBkcmF3QmV6aWVyQ3VydmVQYXRoOiBkcmF3QmV6aWVyQ3VydmVQYXRoXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZXBDbG9uZSA9IGRlZXBDbG9uZTtcbmV4cG9ydHMuZWxpbWluYXRlQmx1ciA9IGVsaW1pbmF0ZUJsdXI7XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luQ2lyY2xlID0gY2hlY2tQb2ludElzSW5DaXJjbGU7XG5leHBvcnRzLmdldFR3b1BvaW50RGlzdGFuY2UgPSBnZXRUd29Qb2ludERpc3RhbmNlO1xuZXhwb3J0cy5jaGVja1BvaW50SXNJblBvbHlnb24gPSBjaGVja1BvaW50SXNJblBvbHlnb247XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luU2VjdG9yID0gY2hlY2tQb2ludElzSW5TZWN0b3I7XG5leHBvcnRzLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSA9IGNoZWNrUG9pbnRJc05lYXJQb2x5bGluZTtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5SZWN0ID0gY2hlY2tQb2ludElzSW5SZWN0O1xuZXhwb3J0cy5nZXRSb3RhdGVQb2ludFBvcyA9IGdldFJvdGF0ZVBvaW50UG9zO1xuZXhwb3J0cy5nZXRTY2FsZVBvaW50UG9zID0gZ2V0U2NhbGVQb2ludFBvcztcbmV4cG9ydHMuZ2V0VHJhbnNsYXRlUG9pbnRQb3MgPSBnZXRUcmFuc2xhdGVQb2ludFBvcztcbmV4cG9ydHMuZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lID0gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lO1xuZXhwb3J0cy5nZXRDaXJjbGVSYWRpYW5Qb2ludCA9IGdldENpcmNsZVJhZGlhblBvaW50O1xuZXhwb3J0cy5nZXRSZWd1bGFyUG9seWdvblBvaW50cyA9IGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBhYnMgPSBNYXRoLmFicyxcbiAgICBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgIHNpbiA9IE1hdGguc2luLFxuICAgIGNvcyA9IE1hdGguY29zLFxuICAgIG1heCA9IE1hdGgubWF4LFxuICAgIG1pbiA9IE1hdGgubWluLFxuICAgIFBJID0gTWF0aC5QSTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2xvbmUgYW4gb2JqZWN0IG9yIGFycmF5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmplY3QgQ2xvbmVkIG9iamVjdFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlY3Vyc2lvbiAgIFdoZXRoZXIgdG8gdXNlIHJlY3Vyc2l2ZSBjbG9uaW5nXHJcbiAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gQ2xvbmUgb2JqZWN0XHJcbiAqL1xuXG5mdW5jdGlvbiBkZWVwQ2xvbmUob2JqZWN0KSB7XG4gIHZhciByZWN1cnNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICBpZiAoIW9iamVjdCkgcmV0dXJuIG9iamVjdDtcbiAgdmFyIHBhcnNlID0gSlNPTi5wYXJzZSxcbiAgICAgIHN0cmluZ2lmeSA9IEpTT04uc3RyaW5naWZ5O1xuICBpZiAoIXJlY3Vyc2lvbikgcmV0dXJuIHBhcnNlKHN0cmluZ2lmeShvYmplY3QpKTtcbiAgdmFyIGNsb25lZE9iaiA9IG9iamVjdCBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fTtcblxuICBpZiAob2JqZWN0ICYmICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG9iamVjdCkgPT09ICdvYmplY3QnKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGlmIChvYmplY3Rba2V5XSAmJiAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShvYmplY3Rba2V5XSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgY2xvbmVkT2JqW2tleV0gPSBkZWVwQ2xvbmUob2JqZWN0W2tleV0sIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsb25lZE9ialtrZXldID0gb2JqZWN0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2xvbmVkT2JqO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBFbGltaW5hdGUgbGluZSBibHVyIGR1ZSB0byAxcHggbGluZSB3aWR0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgTGluZSBwb2ludHNcclxuICogQHJldHVybiB7QXJyYXl9IExpbmUgcG9pbnRzIGFmdGVyIHByb2Nlc3NlZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBlbGltaW5hdGVCbHVyKHBvaW50cykge1xuICByZXR1cm4gcG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBfcmVmMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgICAgeCA9IF9yZWYyWzBdLFxuICAgICAgICB5ID0gX3JlZjJbMV07XG5cbiAgICByZXR1cm4gW3BhcnNlSW50KHgpICsgMC41LCBwYXJzZUludCh5KSArIDAuNV07XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcnggICBDaXJjbGUgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByeSAgIENpcmNsZSB5IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgQ2lyY2xlIHJhZGl1c1xyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5DaXJjbGUocG9pbnQsIHJ4LCByeSwgcikge1xuICByZXR1cm4gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgW3J4LCByeV0pIDw9IHI7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MSBwb2ludDFcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQyIHBvaW50MlxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKF9yZWYzLCBfcmVmNCkge1xuICB2YXIgX3JlZjUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjMsIDIpLFxuICAgICAgeGEgPSBfcmVmNVswXSxcbiAgICAgIHlhID0gX3JlZjVbMV07XG5cbiAgdmFyIF9yZWY2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY0LCAyKSxcbiAgICAgIHhiID0gX3JlZjZbMF0sXG4gICAgICB5YiA9IF9yZWY2WzFdO1xuXG4gIHZhciBtaW51c1ggPSBhYnMoeGEgLSB4Yik7XG4gIHZhciBtaW51c1kgPSBhYnMoeWEgLSB5Yik7XG4gIHJldHVybiBzcXJ0KG1pbnVzWCAqIG1pbnVzWCArIG1pbnVzWSAqIG1pbnVzWSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHBvbHlnb25cclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIHBvbHlsaW5lXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pIHtcbiAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gIHZhciBfcG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludFswXSxcbiAgICAgIHkgPSBfcG9pbnRbMV07XG5cbiAgdmFyIHBvaW50TnVtID0gcG9seWdvbi5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDEsIHAxID0gcG9seWdvblswXTsgaSA8PSBwb2ludE51bTsgaSsrKSB7XG4gICAgdmFyIHAyID0gcG9seWdvbltpICUgcG9pbnROdW1dO1xuXG4gICAgaWYgKHggPiBtaW4ocDFbMF0sIHAyWzBdKSAmJiB4IDw9IG1heChwMVswXSwgcDJbMF0pKSB7XG4gICAgICBpZiAoeSA8PSBtYXgocDFbMV0sIHAyWzFdKSkge1xuICAgICAgICBpZiAocDFbMF0gIT09IHAyWzBdKSB7XG4gICAgICAgICAgdmFyIHhpbnRlcnMgPSAoeCAtIHAxWzBdKSAqIChwMlsxXSAtIHAxWzFdKSAvIChwMlswXSAtIHAxWzBdKSArIHAxWzFdO1xuXG4gICAgICAgICAgaWYgKHAxWzFdID09PSBwMlsxXSB8fCB5IDw9IHhpbnRlcnMpIHtcbiAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwMSA9IHAyO1xuICB9XG5cbiAgcmV0dXJuIGNvdW50ZXIgJSAyID09PSAxO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBzZWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcnggICAgICAgICBTZWN0b3IgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByeSAgICAgICAgIFNlY3RvciB5IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgICAgICAgU2VjdG9yIHJhZGl1c1xyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhcnRBbmdsZSBTZWN0b3Igc3RhcnQgYW5nbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGVuZEFuZ2xlICAgU2VjdG9yIGVuZCBhbmdsZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb2NrV2lzZSBXaGV0aGVyIHRoZSBzZWN0b3IgYW5nbGUgaXMgY2xvY2t3aXNlXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNJblNlY3Rvcihwb2ludCwgcngsIHJ5LCByLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY2xvY2tXaXNlKSB7XG4gIGlmICghcG9pbnQpIHJldHVybiBmYWxzZTtcbiAgaWYgKGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnQsIFtyeCwgcnldKSA+IHIpIHJldHVybiBmYWxzZTtcblxuICBpZiAoIWNsb2NrV2lzZSkge1xuICAgIHZhciBfZGVlcENsb25lID0gZGVlcENsb25lKFtlbmRBbmdsZSwgc3RhcnRBbmdsZV0pO1xuXG4gICAgdmFyIF9kZWVwQ2xvbmUyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9kZWVwQ2xvbmUsIDIpO1xuXG4gICAgc3RhcnRBbmdsZSA9IF9kZWVwQ2xvbmUyWzBdO1xuICAgIGVuZEFuZ2xlID0gX2RlZXBDbG9uZTJbMV07XG4gIH1cblxuICB2YXIgcmV2ZXJzZUJFID0gc3RhcnRBbmdsZSA+IGVuZEFuZ2xlO1xuXG4gIGlmIChyZXZlcnNlQkUpIHtcbiAgICB2YXIgX3JlZjcgPSBbZW5kQW5nbGUsIHN0YXJ0QW5nbGVdO1xuICAgIHN0YXJ0QW5nbGUgPSBfcmVmN1swXTtcbiAgICBlbmRBbmdsZSA9IF9yZWY3WzFdO1xuICB9XG5cbiAgdmFyIG1pbnVzID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuICBpZiAobWludXMgPj0gUEkgKiAyKSByZXR1cm4gdHJ1ZTtcblxuICB2YXIgX3BvaW50MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50MlswXSxcbiAgICAgIHkgPSBfcG9pbnQyWzFdO1xuXG4gIHZhciBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQgPSBnZXRDaXJjbGVSYWRpYW5Qb2ludChyeCwgcnksIHIsIHN0YXJ0QW5nbGUpLFxuICAgICAgX2dldENpcmNsZVJhZGlhblBvaW50MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQsIDIpLFxuICAgICAgYnggPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQyWzBdLFxuICAgICAgYnkgPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQyWzFdO1xuXG4gIHZhciBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQzID0gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQocngsIHJ5LCByLCBlbmRBbmdsZSksXG4gICAgICBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRDaXJjbGVSYWRpYW5Qb2ludDMsIDIpLFxuICAgICAgZXggPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ0WzBdLFxuICAgICAgZXkgPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ0WzFdO1xuXG4gIHZhciB2UG9pbnQgPSBbeCAtIHJ4LCB5IC0gcnldO1xuICB2YXIgdkJBcm0gPSBbYnggLSByeCwgYnkgLSByeV07XG4gIHZhciB2RUFybSA9IFtleCAtIHJ4LCBleSAtIHJ5XTtcbiAgdmFyIHJldmVyc2UgPSBtaW51cyA+IFBJO1xuXG4gIGlmIChyZXZlcnNlKSB7XG4gICAgdmFyIF9kZWVwQ2xvbmUzID0gZGVlcENsb25lKFt2RUFybSwgdkJBcm1dKTtcblxuICAgIHZhciBfZGVlcENsb25lNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZGVlcENsb25lMywgMik7XG5cbiAgICB2QkFybSA9IF9kZWVwQ2xvbmU0WzBdO1xuICAgIHZFQXJtID0gX2RlZXBDbG9uZTRbMV07XG4gIH1cblxuICB2YXIgaW5TZWN0b3IgPSBpc0Nsb2NrV2lzZSh2QkFybSwgdlBvaW50KSAmJiAhaXNDbG9ja1dpc2UodkVBcm0sIHZQb2ludCk7XG4gIGlmIChyZXZlcnNlKSBpblNlY3RvciA9ICFpblNlY3RvcjtcbiAgaWYgKHJldmVyc2VCRSkgaW5TZWN0b3IgPSAhaW5TZWN0b3I7XG4gIHJldHVybiBpblNlY3Rvcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRGV0ZXJtaW5lIGlmIHRoZSBwb2ludCBpcyBpbiB0aGUgY2xvY2t3aXNlIGRpcmVjdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHZBcm0gICBWZWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gdlBvaW50IFBvaW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBpc0Nsb2NrV2lzZSh2QXJtLCB2UG9pbnQpIHtcbiAgdmFyIF92QXJtID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHZBcm0sIDIpLFxuICAgICAgYXggPSBfdkFybVswXSxcbiAgICAgIGF5ID0gX3ZBcm1bMV07XG5cbiAgdmFyIF92UG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkodlBvaW50LCAyKSxcbiAgICAgIHB4ID0gX3ZQb2ludFswXSxcbiAgICAgIHB5ID0gX3ZQb2ludFsxXTtcblxuICByZXR1cm4gLWF5ICogcHggKyBheCAqIHB5ID4gMDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcG9seWxpbmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlsaW5lICAgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbmVXaWR0aCBQb2x5bGluZSBsaW5ld2lkdGhcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc05lYXJQb2x5bGluZShwb2ludCwgcG9seWxpbmUsIGxpbmVXaWR0aCkge1xuICB2YXIgaGFsZkxpbmVXaWR0aCA9IGxpbmVXaWR0aCAvIDI7XG4gIHZhciBtb3ZlVXBQb2x5bGluZSA9IHBvbHlsaW5lLm1hcChmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgX3JlZjkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgsIDIpLFxuICAgICAgICB4ID0gX3JlZjlbMF0sXG4gICAgICAgIHkgPSBfcmVmOVsxXTtcblxuICAgIHJldHVybiBbeCwgeSAtIGhhbGZMaW5lV2lkdGhdO1xuICB9KTtcbiAgdmFyIG1vdmVEb3duUG9seWxpbmUgPSBwb2x5bGluZS5tYXAoZnVuY3Rpb24gKF9yZWYxMCkge1xuICAgIHZhciBfcmVmMTEgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLCAyKSxcbiAgICAgICAgeCA9IF9yZWYxMVswXSxcbiAgICAgICAgeSA9IF9yZWYxMVsxXTtcblxuICAgIHJldHVybiBbeCwgeSArIGhhbGZMaW5lV2lkdGhdO1xuICB9KTtcbiAgdmFyIHBvbHlnb24gPSBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtb3ZlVXBQb2x5bGluZSksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobW92ZURvd25Qb2x5bGluZS5yZXZlcnNlKCkpKTtcbiAgcmV0dXJuIGNoZWNrUG9pbnRJc0luUG9seWdvbihwb2ludCwgcG9seWdvbik7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHJlY3RcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4ICAgICAgUmVjdCBzdGFydCB4IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgICAgICBSZWN0IHN0YXJ0IHkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGggIFJlY3Qgd2lkdGhcclxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodCBSZWN0IGhlaWdodFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5SZWN0KF9yZWYxMiwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgX3JlZjEzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMiwgMiksXG4gICAgICBweCA9IF9yZWYxM1swXSxcbiAgICAgIHB5ID0gX3JlZjEzWzFdO1xuXG4gIGlmIChweCA8IHgpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB5IDwgeSkgcmV0dXJuIGZhbHNlO1xuICBpZiAocHggPiB4ICsgd2lkdGgpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB5ID4geSArIGhlaWdodCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgcm90YXRlZCBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcm90YXRlIERlZ3JlZSBvZiByb3RhdGlvblxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gb3JpZ2luICBSb3RhdGlvbiBjZW50ZXJcclxuICogQHBhcmFtIHtBcnJheX0gb3JpZ2luICBSb3RhdGlvbiBjZW50ZXJcclxuICogQHJldHVybiB7TnVtYmVyfSBDb29yZGluYXRlcyBhZnRlciByb3RhdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSb3RhdGVQb2ludFBvcygpIHtcbiAgdmFyIHJvdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcbiAgdmFyIHBvaW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gIHZhciBvcmlnaW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFswLCAwXTtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIGZhbHNlO1xuICBpZiAocm90YXRlICUgMzYwID09PSAwKSByZXR1cm4gcG9pbnQ7XG5cbiAgdmFyIF9wb2ludDMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDNbMF0sXG4gICAgICB5ID0gX3BvaW50M1sxXTtcblxuICB2YXIgX29yaWdpbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShvcmlnaW4sIDIpLFxuICAgICAgb3ggPSBfb3JpZ2luWzBdLFxuICAgICAgb3kgPSBfb3JpZ2luWzFdO1xuXG4gIHJvdGF0ZSAqPSBQSSAvIDE4MDtcbiAgcmV0dXJuIFsoeCAtIG94KSAqIGNvcyhyb3RhdGUpIC0gKHkgLSBveSkgKiBzaW4ocm90YXRlKSArIG94LCAoeCAtIG94KSAqIHNpbihyb3RhdGUpICsgKHkgLSBveSkgKiBjb3Mocm90YXRlKSArIG95XTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc2NhbGVkIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNjYWxlICBTY2FsZSBmYWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gb3JpZ2luIFNjYWxlIGNlbnRlclxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIGFmdGVyIHNjYWxlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNjYWxlUG9pbnRQb3MoKSB7XG4gIHZhciBzY2FsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogWzEsIDFdO1xuICB2YXIgcG9pbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgdmFyIG9yaWdpbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogWzAsIDBdO1xuICBpZiAoIXBvaW50KSByZXR1cm4gZmFsc2U7XG4gIGlmIChzY2FsZSA9PT0gMSkgcmV0dXJuIHBvaW50O1xuXG4gIHZhciBfcG9pbnQ0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQ0WzBdLFxuICAgICAgeSA9IF9wb2ludDRbMV07XG5cbiAgdmFyIF9vcmlnaW4yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKG9yaWdpbiwgMiksXG4gICAgICBveCA9IF9vcmlnaW4yWzBdLFxuICAgICAgb3kgPSBfb3JpZ2luMlsxXTtcblxuICB2YXIgX3NjYWxlID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHNjYWxlLCAyKSxcbiAgICAgIHhzID0gX3NjYWxlWzBdLFxuICAgICAgeXMgPSBfc2NhbGVbMV07XG5cbiAgdmFyIHJlbGF0aXZlUG9zWCA9IHggLSBveDtcbiAgdmFyIHJlbGF0aXZlUG9zWSA9IHkgLSBveTtcbiAgcmV0dXJuIFtyZWxhdGl2ZVBvc1ggKiB4cyArIG94LCByZWxhdGl2ZVBvc1kgKiB5cyArIG95XTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc2NhbGVkIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHRyYW5zbGF0ZSBUcmFuc2xhdGlvbiBkaXN0YW5jZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIGFmdGVyIHRyYW5zbGF0aW9uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFRyYW5zbGF0ZVBvaW50UG9zKHRyYW5zbGF0ZSwgcG9pbnQpIHtcbiAgaWYgKCF0cmFuc2xhdGUgfHwgIXBvaW50KSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIF9wb2ludDUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDVbMF0sXG4gICAgICB5ID0gX3BvaW50NVsxXTtcblxuICB2YXIgX3RyYW5zbGF0ZSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh0cmFuc2xhdGUsIDIpLFxuICAgICAgdHggPSBfdHJhbnNsYXRlWzBdLFxuICAgICAgdHkgPSBfdHJhbnNsYXRlWzFdO1xuXG4gIHJldHVybiBbeCArIHR4LCB5ICsgdHldO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHBvaW50IHRvIHRoZSBsaW5lXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGxpbmVCZWdpbiBMaW5lIHN0YXJ0IHBvc2l0aW9uXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGxpbmVFbmQgICBMaW5lIGVuZCBwb3NpdGlvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlIGJldHdlZW4gcG9pbnQgYW5kIGxpbmVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lKHBvaW50LCBsaW5lQmVnaW4sIGxpbmVFbmQpIHtcbiAgaWYgKCFwb2ludCB8fCAhbGluZUJlZ2luIHx8ICFsaW5lRW5kKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIF9wb2ludDYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDZbMF0sXG4gICAgICB5ID0gX3BvaW50NlsxXTtcblxuICB2YXIgX2xpbmVCZWdpbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lQmVnaW4sIDIpLFxuICAgICAgeDEgPSBfbGluZUJlZ2luWzBdLFxuICAgICAgeTEgPSBfbGluZUJlZ2luWzFdO1xuXG4gIHZhciBfbGluZUVuZCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lRW5kLCAyKSxcbiAgICAgIHgyID0gX2xpbmVFbmRbMF0sXG4gICAgICB5MiA9IF9saW5lRW5kWzFdO1xuXG4gIHZhciBhID0geTIgLSB5MTtcbiAgdmFyIGIgPSB4MSAtIHgyO1xuICB2YXIgYyA9IHkxICogKHgyIC0geDEpIC0geDEgKiAoeTIgLSB5MSk7XG4gIHZhciBtb2xlY3VsZSA9IGFicyhhICogeCArIGIgKiB5ICsgYyk7XG4gIHZhciBkZW5vbWluYXRvciA9IHNxcnQoYSAqIGEgKyBiICogYik7XG4gIHJldHVybiBtb2xlY3VsZSAvIGRlbm9taW5hdG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBzcGVjaWZpZWQgcmFkaWFuIG9uIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggICAgICBDaXJjbGUgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICAgQ2lyY2xlIHkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkaXVzIENpcmNsZSByYWRpdXNcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZGlhbiBTcGVjZmllZCByYWRpYW5cclxuICogQHJldHVybiB7QXJyYXl9IFBvc3Rpb24gb2YgcG9pbnRcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQoeCwgeSwgcmFkaXVzLCByYWRpYW4pIHtcbiAgcmV0dXJuIFt4ICsgY29zKHJhZGlhbikgKiByYWRpdXMsIHkgKyBzaW4ocmFkaWFuKSAqIHJhZGl1c107XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHJlZ3VsYXIgcG9seWdvblxyXG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgWCBjb29yZGluYXRlIG9mIHRoZSBwb2x5Z29uIGluc2NyaWJlZCBjaXJjbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgICAgIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9seWdvbiBpbnNjcmliZWQgY2lyY2xlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByICAgICBSYWRpdXMgb2YgdGhlIHBvbHlnb24gaW5zY3JpYmVkIGNpcmNsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2lkZSAgU2lkZSBudW1iZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbnVzIFJhZGlhbiBvZmZzZXRcclxuICogQHJldHVybiB7QXJyYXl9IFBvaW50cyB0aGF0IG1ha2UgdXAgYSByZWd1bGFyIHBvbHlnb25cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmVndWxhclBvbHlnb25Qb2ludHMocngsIHJ5LCByLCBzaWRlKSB7XG4gIHZhciBtaW51cyA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogUEkgKiAtMC41O1xuICB2YXIgcmFkaWFuR2FwID0gUEkgKiAyIC8gc2lkZTtcbiAgdmFyIHJhZGlhbnMgPSBuZXcgQXJyYXkoc2lkZSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIGkgKiByYWRpYW5HYXAgKyBtaW51cztcbiAgfSk7XG4gIHJldHVybiByYWRpYW5zLm1hcChmdW5jdGlvbiAocmFkaWFuKSB7XG4gICAgcmV0dXJuIGdldENpcmNsZVJhZGlhblBvaW50KHJ4LCByeSwgciwgcmFkaWFuKTtcbiAgfSk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHtcbiAgZGVlcENsb25lOiBkZWVwQ2xvbmUsXG4gIGVsaW1pbmF0ZUJsdXI6IGVsaW1pbmF0ZUJsdXIsXG4gIGNoZWNrUG9pbnRJc0luQ2lyY2xlOiBjaGVja1BvaW50SXNJbkNpcmNsZSxcbiAgY2hlY2tQb2ludElzSW5Qb2x5Z29uOiBjaGVja1BvaW50SXNJblBvbHlnb24sXG4gIGNoZWNrUG9pbnRJc0luU2VjdG9yOiBjaGVja1BvaW50SXNJblNlY3RvcixcbiAgY2hlY2tQb2ludElzTmVhclBvbHlsaW5lOiBjaGVja1BvaW50SXNOZWFyUG9seWxpbmUsXG4gIGdldFR3b1BvaW50RGlzdGFuY2U6IGdldFR3b1BvaW50RGlzdGFuY2UsXG4gIGdldFJvdGF0ZVBvaW50UG9zOiBnZXRSb3RhdGVQb2ludFBvcyxcbiAgZ2V0U2NhbGVQb2ludFBvczogZ2V0U2NhbGVQb2ludFBvcyxcbiAgZ2V0VHJhbnNsYXRlUG9pbnRQb3M6IGdldFRyYW5zbGF0ZVBvaW50UG9zLFxuICBnZXRDaXJjbGVSYWRpYW5Qb2ludDogZ2V0Q2lyY2xlUmFkaWFuUG9pbnQsXG4gIGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzOiBnZXRSZWd1bGFyUG9seWdvblBvaW50cyxcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lOiBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmVcbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfZGVmYXVsdCA9IG5ldyBNYXAoW1sndHJhbnNwYXJlbnQnLCAncmdiYSgwLDAsMCwwKSddLCBbJ2JsYWNrJywgJyMwMDAwMDAnXSwgWydzaWx2ZXInLCAnI0MwQzBDMCddLCBbJ2dyYXknLCAnIzgwODA4MCddLCBbJ3doaXRlJywgJyNGRkZGRkYnXSwgWydtYXJvb24nLCAnIzgwMDAwMCddLCBbJ3JlZCcsICcjRkYwMDAwJ10sIFsncHVycGxlJywgJyM4MDAwODAnXSwgWydmdWNoc2lhJywgJyNGRjAwRkYnXSwgWydncmVlbicsICcjMDA4MDAwJ10sIFsnbGltZScsICcjMDBGRjAwJ10sIFsnb2xpdmUnLCAnIzgwODAwMCddLCBbJ3llbGxvdycsICcjRkZGRjAwJ10sIFsnbmF2eScsICcjMDAwMDgwJ10sIFsnYmx1ZScsICcjMDAwMEZGJ10sIFsndGVhbCcsICcjMDA4MDgwJ10sIFsnYXF1YScsICcjMDBGRkZGJ10sIFsnYWxpY2VibHVlJywgJyNmMGY4ZmYnXSwgWydhbnRpcXVld2hpdGUnLCAnI2ZhZWJkNyddLCBbJ2FxdWFtYXJpbmUnLCAnIzdmZmZkNCddLCBbJ2F6dXJlJywgJyNmMGZmZmYnXSwgWydiZWlnZScsICcjZjVmNWRjJ10sIFsnYmlzcXVlJywgJyNmZmU0YzQnXSwgWydibGFuY2hlZGFsbW9uZCcsICcjZmZlYmNkJ10sIFsnYmx1ZXZpb2xldCcsICcjOGEyYmUyJ10sIFsnYnJvd24nLCAnI2E1MmEyYSddLCBbJ2J1cmx5d29vZCcsICcjZGViODg3J10sIFsnY2FkZXRibHVlJywgJyM1ZjllYTAnXSwgWydjaGFydHJldXNlJywgJyM3ZmZmMDAnXSwgWydjaG9jb2xhdGUnLCAnI2QyNjkxZSddLCBbJ2NvcmFsJywgJyNmZjdmNTAnXSwgWydjb3JuZmxvd2VyYmx1ZScsICcjNjQ5NWVkJ10sIFsnY29ybnNpbGsnLCAnI2ZmZjhkYyddLCBbJ2NyaW1zb24nLCAnI2RjMTQzYyddLCBbJ2N5YW4nLCAnIzAwZmZmZiddLCBbJ2RhcmtibHVlJywgJyMwMDAwOGInXSwgWydkYXJrY3lhbicsICcjMDA4YjhiJ10sIFsnZGFya2dvbGRlbnJvZCcsICcjYjg4NjBiJ10sIFsnZGFya2dyYXknLCAnI2E5YTlhOSddLCBbJ2RhcmtncmVlbicsICcjMDA2NDAwJ10sIFsnZGFya2dyZXknLCAnI2E5YTlhOSddLCBbJ2RhcmtraGFraScsICcjYmRiNzZiJ10sIFsnZGFya21hZ2VudGEnLCAnIzhiMDA4YiddLCBbJ2RhcmtvbGl2ZWdyZWVuJywgJyM1NTZiMmYnXSwgWydkYXJrb3JhbmdlJywgJyNmZjhjMDAnXSwgWydkYXJrb3JjaGlkJywgJyM5OTMyY2MnXSwgWydkYXJrcmVkJywgJyM4YjAwMDAnXSwgWydkYXJrc2FsbW9uJywgJyNlOTk2N2EnXSwgWydkYXJrc2VhZ3JlZW4nLCAnIzhmYmM4ZiddLCBbJ2RhcmtzbGF0ZWJsdWUnLCAnIzQ4M2Q4YiddLCBbJ2RhcmtzbGF0ZWdyYXknLCAnIzJmNGY0ZiddLCBbJ2RhcmtzbGF0ZWdyZXknLCAnIzJmNGY0ZiddLCBbJ2Rhcmt0dXJxdW9pc2UnLCAnIzAwY2VkMSddLCBbJ2Rhcmt2aW9sZXQnLCAnIzk0MDBkMyddLCBbJ2RlZXBwaW5rJywgJyNmZjE0OTMnXSwgWydkZWVwc2t5Ymx1ZScsICcjMDBiZmZmJ10sIFsnZGltZ3JheScsICcjNjk2OTY5J10sIFsnZGltZ3JleScsICcjNjk2OTY5J10sIFsnZG9kZ2VyYmx1ZScsICcjMWU5MGZmJ10sIFsnZmlyZWJyaWNrJywgJyNiMjIyMjInXSwgWydmbG9yYWx3aGl0ZScsICcjZmZmYWYwJ10sIFsnZm9yZXN0Z3JlZW4nLCAnIzIyOGIyMiddLCBbJ2dhaW5zYm9ybycsICcjZGNkY2RjJ10sIFsnZ2hvc3R3aGl0ZScsICcjZjhmOGZmJ10sIFsnZ29sZCcsICcjZmZkNzAwJ10sIFsnZ29sZGVucm9kJywgJyNkYWE1MjAnXSwgWydncmVlbnllbGxvdycsICcjYWRmZjJmJ10sIFsnZ3JleScsICcjODA4MDgwJ10sIFsnaG9uZXlkZXcnLCAnI2YwZmZmMCddLCBbJ2hvdHBpbmsnLCAnI2ZmNjliNCddLCBbJ2luZGlhbnJlZCcsICcjY2Q1YzVjJ10sIFsnaW5kaWdvJywgJyM0YjAwODInXSwgWydpdm9yeScsICcjZmZmZmYwJ10sIFsna2hha2knLCAnI2YwZTY4YyddLCBbJ2xhdmVuZGVyJywgJyNlNmU2ZmEnXSwgWydsYXZlbmRlcmJsdXNoJywgJyNmZmYwZjUnXSwgWydsYXduZ3JlZW4nLCAnIzdjZmMwMCddLCBbJ2xlbW9uY2hpZmZvbicsICcjZmZmYWNkJ10sIFsnbGlnaHRibHVlJywgJyNhZGQ4ZTYnXSwgWydsaWdodGNvcmFsJywgJyNmMDgwODAnXSwgWydsaWdodGN5YW4nLCAnI2UwZmZmZiddLCBbJ2xpZ2h0Z29sZGVucm9keWVsbG93JywgJyNmYWZhZDInXSwgWydsaWdodGdyYXknLCAnI2QzZDNkMyddLCBbJ2xpZ2h0Z3JlZW4nLCAnIzkwZWU5MCddLCBbJ2xpZ2h0Z3JleScsICcjZDNkM2QzJ10sIFsnbGlnaHRwaW5rJywgJyNmZmI2YzEnXSwgWydsaWdodHNhbG1vbicsICcjZmZhMDdhJ10sIFsnbGlnaHRzZWFncmVlbicsICcjMjBiMmFhJ10sIFsnbGlnaHRza3libHVlJywgJyM4N2NlZmEnXSwgWydsaWdodHNsYXRlZ3JheScsICcjNzc4ODk5J10sIFsnbGlnaHRzbGF0ZWdyZXknLCAnIzc3ODg5OSddLCBbJ2xpZ2h0c3RlZWxibHVlJywgJyNiMGM0ZGUnXSwgWydsaWdodHllbGxvdycsICcjZmZmZmUwJ10sIFsnbGltZWdyZWVuJywgJyMzMmNkMzInXSwgWydsaW5lbicsICcjZmFmMGU2J10sIFsnbWFnZW50YScsICcjZmYwMGZmJ10sIFsnbWVkaXVtYXF1YW1hcmluZScsICcjNjZjZGFhJ10sIFsnbWVkaXVtYmx1ZScsICcjMDAwMGNkJ10sIFsnbWVkaXVtb3JjaGlkJywgJyNiYTU1ZDMnXSwgWydtZWRpdW1wdXJwbGUnLCAnIzkzNzBkYiddLCBbJ21lZGl1bXNlYWdyZWVuJywgJyMzY2IzNzEnXSwgWydtZWRpdW1zbGF0ZWJsdWUnLCAnIzdiNjhlZSddLCBbJ21lZGl1bXNwcmluZ2dyZWVuJywgJyMwMGZhOWEnXSwgWydtZWRpdW10dXJxdW9pc2UnLCAnIzQ4ZDFjYyddLCBbJ21lZGl1bXZpb2xldHJlZCcsICcjYzcxNTg1J10sIFsnbWlkbmlnaHRibHVlJywgJyMxOTE5NzAnXSwgWydtaW50Y3JlYW0nLCAnI2Y1ZmZmYSddLCBbJ21pc3R5cm9zZScsICcjZmZlNGUxJ10sIFsnbW9jY2FzaW4nLCAnI2ZmZTRiNSddLCBbJ25hdmFqb3doaXRlJywgJyNmZmRlYWQnXSwgWydvbGRsYWNlJywgJyNmZGY1ZTYnXSwgWydvbGl2ZWRyYWInLCAnIzZiOGUyMyddLCBbJ29yYW5nZScsICcjZmZhNTAwJ10sIFsnb3JhbmdlcmVkJywgJyNmZjQ1MDAnXSwgWydvcmNoaWQnLCAnI2RhNzBkNiddLCBbJ3BhbGVnb2xkZW5yb2QnLCAnI2VlZThhYSddLCBbJ3BhbGVncmVlbicsICcjOThmYjk4J10sIFsncGFsZXR1cnF1b2lzZScsICcjYWZlZWVlJ10sIFsncGFsZXZpb2xldHJlZCcsICcjZGI3MDkzJ10sIFsncGFwYXlhd2hpcCcsICcjZmZlZmQ1J10sIFsncGVhY2hwdWZmJywgJyNmZmRhYjknXSwgWydwZXJ1JywgJyNjZDg1M2YnXSwgWydwaW5rJywgJyNmZmMwY2InXSwgWydwbHVtJywgJyNkZGEwZGQnXSwgWydwb3dkZXJibHVlJywgJyNiMGUwZTYnXSwgWydyb3N5YnJvd24nLCAnI2JjOGY4ZiddLCBbJ3JveWFsYmx1ZScsICcjNDE2OWUxJ10sIFsnc2FkZGxlYnJvd24nLCAnIzhiNDUxMyddLCBbJ3NhbG1vbicsICcjZmE4MDcyJ10sIFsnc2FuZHlicm93bicsICcjZjRhNDYwJ10sIFsnc2VhZ3JlZW4nLCAnIzJlOGI1NyddLCBbJ3NlYXNoZWxsJywgJyNmZmY1ZWUnXSwgWydzaWVubmEnLCAnI2EwNTIyZCddLCBbJ3NreWJsdWUnLCAnIzg3Y2VlYiddLCBbJ3NsYXRlYmx1ZScsICcjNmE1YWNkJ10sIFsnc2xhdGVncmF5JywgJyM3MDgwOTAnXSwgWydzbGF0ZWdyZXknLCAnIzcwODA5MCddLCBbJ3Nub3cnLCAnI2ZmZmFmYSddLCBbJ3NwcmluZ2dyZWVuJywgJyMwMGZmN2YnXSwgWydzdGVlbGJsdWUnLCAnIzQ2ODJiNCddLCBbJ3RhbicsICcjZDJiNDhjJ10sIFsndGhpc3RsZScsICcjZDhiZmQ4J10sIFsndG9tYXRvJywgJyNmZjYzNDcnXSwgWyd0dXJxdW9pc2UnLCAnIzQwZTBkMCddLCBbJ3Zpb2xldCcsICcjZWU4MmVlJ10sIFsnd2hlYXQnLCAnI2Y1ZGViMyddLCBbJ3doaXRlc21va2UnLCAnI2Y1ZjVmNSddLCBbJ3llbGxvd2dyZWVuJywgJyM5YWNkMzInXV0pO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2V0UmdiVmFsdWUgPSBnZXRSZ2JWYWx1ZTtcbmV4cG9ydHMuZ2V0UmdiYVZhbHVlID0gZ2V0UmdiYVZhbHVlO1xuZXhwb3J0cy5nZXRPcGFjaXR5ID0gZ2V0T3BhY2l0eTtcbmV4cG9ydHMudG9SZ2IgPSB0b1JnYjtcbmV4cG9ydHMudG9IZXggPSB0b0hleDtcbmV4cG9ydHMuZ2V0Q29sb3JGcm9tUmdiVmFsdWUgPSBnZXRDb2xvckZyb21SZ2JWYWx1ZTtcbmV4cG9ydHMuZGFya2VuID0gZGFya2VuO1xuZXhwb3J0cy5saWdodGVuID0gbGlnaHRlbjtcbmV4cG9ydHMuZmFkZSA9IGZhZGU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9rZXl3b3JkcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29uZmlnL2tleXdvcmRzXCIpKTtcblxudmFyIGhleFJlZyA9IC9eIyhbMC05YS1mQS1mXXszfXxbMC05YS1mQS1mXXs2fSkkLztcbnZhciByZ2JSZWcgPSAvXihyZ2J8cmdiYXxSR0J8UkdCQSkvO1xudmFyIHJnYmFSZWcgPSAvXihyZ2JhfFJHQkEpLztcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ29sb3IgdmFsaWRhdG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gVmFsaWQgY29sb3IgT3IgZmFsc2VcclxuICovXG5cbmZ1bmN0aW9uIHZhbGlkYXRvcihjb2xvcikge1xuICB2YXIgaXNIZXggPSBoZXhSZWcudGVzdChjb2xvcik7XG4gIHZhciBpc1JnYiA9IHJnYlJlZy50ZXN0KGNvbG9yKTtcbiAgaWYgKGlzSGV4IHx8IGlzUmdiKSByZXR1cm4gY29sb3I7XG4gIGNvbG9yID0gZ2V0Q29sb3JCeUtleXdvcmQoY29sb3IpO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDb2xvcjogSW52YWxpZCBjb2xvciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gY29sb3I7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCBjb2xvciBieSBrZXl3b3JkXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIENvbG9yIGtleXdvcmQgbGlrZSByZWQsIGdyZWVuIGFuZCBldGMuXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBIZXggb3IgcmdiYSBjb2xvciAoSW52YWxpZCBrZXl3b3JkIHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRDb2xvckJ5S2V5d29yZChrZXl3b3JkKSB7XG4gIGlmICgha2V5d29yZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldENvbG9yQnlLZXl3b3JkczogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghX2tleXdvcmRzW1wiZGVmYXVsdFwiXS5oYXMoa2V5d29yZCkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIF9rZXl3b3Jkc1tcImRlZmF1bHRcIl0uZ2V0KGtleXdvcmQpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIFJnYiB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge0FycmF5PE51bWJlcj58Qm9vbGVhbn0gUmdiIHZhbHVlIG9mIHRoZSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiVmFsdWUoY29sb3IpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldFJnYlZhbHVlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29sb3IgPSB2YWxpZGF0b3IoY29sb3IpO1xuICBpZiAoIWNvbG9yKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpc0hleCA9IGhleFJlZy50ZXN0KGNvbG9yKTtcbiAgdmFyIGlzUmdiID0gcmdiUmVnLnRlc3QoY29sb3IpO1xuICB2YXIgbG93ZXJDb2xvciA9IGNvbG9yLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChpc0hleCkgcmV0dXJuIGdldFJnYlZhbHVlRnJvbUhleChsb3dlckNvbG9yKTtcbiAgaWYgKGlzUmdiKSByZXR1cm4gZ2V0UmdiVmFsdWVGcm9tUmdiKGxvd2VyQ29sb3IpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHJnYiB2YWx1ZSBvZiB0aGUgaGV4IGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXggY29sb3JcclxuICogQHJldHVybiB7QXJyYXk8TnVtYmVyPn0gUmdiIHZhbHVlIG9mIHRoZSBjb2xvclxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSZ2JWYWx1ZUZyb21IZXgoY29sb3IpIHtcbiAgY29sb3IgPSBjb2xvci5yZXBsYWNlKCcjJywgJycpO1xuICBpZiAoY29sb3IubGVuZ3RoID09PSAzKSBjb2xvciA9IEFycmF5LmZyb20oY29sb3IpLm1hcChmdW5jdGlvbiAoaGV4TnVtKSB7XG4gICAgcmV0dXJuIGhleE51bSArIGhleE51bTtcbiAgfSkuam9pbignJyk7XG4gIGNvbG9yID0gY29sb3Iuc3BsaXQoJycpO1xuICByZXR1cm4gbmV3IEFycmF5KDMpLmZpbGwoMCkubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KFwiMHhcIi5jb25jYXQoY29sb3JbaSAqIDJdKS5jb25jYXQoY29sb3JbaSAqIDIgKyAxXSkpO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSByZ2IgdmFsdWUgb2YgdGhlIHJnYi9yZ2JhIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXggY29sb3JcclxuICogQHJldHVybiB7QXJyYXl9IFJnYiB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiVmFsdWVGcm9tUmdiKGNvbG9yKSB7XG4gIHJldHVybiBjb2xvci5yZXBsYWNlKC9yZ2JcXCh8cmdiYVxcKHxcXCkvZywgJycpLnNwbGl0KCcsJykuc2xpY2UoMCwgMykubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KG4pO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBSZ2JhIHZhbHVlIG9mIHRoZSBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7QXJyYXk8TnVtYmVyPnxCb29sZWFufSBSZ2JhIHZhbHVlIG9mIHRoZSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiYVZhbHVlKGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRSZ2JhVmFsdWU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgY29sb3JWYWx1ZSA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFjb2xvclZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIGNvbG9yVmFsdWUucHVzaChnZXRPcGFjaXR5KGNvbG9yKSk7XG4gIHJldHVybiBjb2xvclZhbHVlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIG9wYWNpdHkgb2YgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge051bWJlcnxCb29sZWFufSBDb2xvciBvcGFjaXR5IChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRPcGFjaXR5KGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRPcGFjaXR5OiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29sb3IgPSB2YWxpZGF0b3IoY29sb3IpO1xuICBpZiAoIWNvbG9yKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpc1JnYmEgPSByZ2JhUmVnLnRlc3QoY29sb3IpO1xuICBpZiAoIWlzUmdiYSkgcmV0dXJuIDE7XG4gIGNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIE51bWJlcihjb2xvci5zcGxpdCgnLCcpLnNsaWNlKC0xKVswXS5yZXBsYWNlKC9bKXxcXHNdL2csICcnKSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENvbnZlcnQgY29sb3IgdG8gUmdifFJnYmEgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yICAgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9wYWNpdHkgVGhlIG9wYWNpdHkgb2YgY29sb3JcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYnxSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiB0b1JnYihjb2xvciwgb3BhY2l0eSkge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcigndG9SZ2I6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiVmFsdWUgPSBnZXRSZ2JWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgdmFyIGFkZE9wYWNpdHkgPSB0eXBlb2Ygb3BhY2l0eSA9PT0gJ251bWJlcic7XG4gIGlmIChhZGRPcGFjaXR5KSByZXR1cm4gJ3JnYmEoJyArIHJnYlZhbHVlLmpvaW4oJywnKSArIFwiLFwiLmNvbmNhdChvcGFjaXR5LCBcIilcIik7XG4gIHJldHVybiAncmdiKCcgKyByZ2JWYWx1ZS5qb2luKCcsJykgKyAnKSc7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENvbnZlcnQgY29sb3IgdG8gSGV4IGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gSGV4IGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiB0b0hleChjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcigndG9IZXg6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoaGV4UmVnLnRlc3QoY29sb3IpKSByZXR1cm4gY29sb3I7XG4gIGNvbG9yID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIWNvbG9yKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiAnIycgKyBjb2xvci5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gTnVtYmVyKG4pLnRvU3RyaW5nKDE2KTtcbiAgfSkubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIG4gPT09ICcwJyA/ICcwMCcgOiBuO1xuICB9KS5qb2luKCcnKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IENvbG9yIGZyb20gUmdifFJnYmEgdmFsdWVcclxuICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fSB2YWx1ZSBSZ2J8UmdiYSBjb2xvciB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdifFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldENvbG9yRnJvbVJnYlZhbHVlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRDb2xvckZyb21SZ2JWYWx1ZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciB2YWx1ZUxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuICBpZiAodmFsdWVMZW5ndGggIT09IDMgJiYgdmFsdWVMZW5ndGggIT09IDQpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRDb2xvckZyb21SZ2JWYWx1ZTogVmFsdWUgaXMgaWxsZWdhbCEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgY29sb3IgPSB2YWx1ZUxlbmd0aCA9PT0gMyA/ICdyZ2IoJyA6ICdyZ2JhKCc7XG4gIGNvbG9yICs9IHZhbHVlLmpvaW4oJywnKSArICcpJztcbiAgcmV0dXJuIGNvbG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEZWVwZW4gY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge051bWJlcn0gUGVyY2VudCBvZiBEZWVwZW4gKDEtMTAwKVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZGFya2VuKGNvbG9yKSB7XG4gIHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdkYXJrZW46IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiYVZhbHVlID0gZ2V0UmdiYVZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JhVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgcmdiYVZhbHVlID0gcmdiYVZhbHVlLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiBpID09PSAzID8gdiA6IHYgLSBNYXRoLmNlaWwoMi41NSAqIHBlcmNlbnQpO1xuICB9KS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gdiA8IDAgPyAwIDogdjtcbiAgfSk7XG4gIHJldHVybiBnZXRDb2xvckZyb21SZ2JWYWx1ZShyZ2JhVmFsdWUpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBCcmlnaHRlbiBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7TnVtYmVyfSBQZXJjZW50IG9mIGJyaWdodGVuICgxLTEwMClcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGxpZ2h0ZW4oY29sb3IpIHtcbiAgdmFyIHBlcmNlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG5cbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2xpZ2h0ZW46IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiYVZhbHVlID0gZ2V0UmdiYVZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JhVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgcmdiYVZhbHVlID0gcmdiYVZhbHVlLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiBpID09PSAzID8gdiA6IHYgKyBNYXRoLmNlaWwoMi41NSAqIHBlcmNlbnQpO1xuICB9KS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gdiA+IDI1NSA/IDI1NSA6IHY7XG4gIH0pO1xuICByZXR1cm4gZ2V0Q29sb3JGcm9tUmdiVmFsdWUocmdiYVZhbHVlKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQWRqdXN0IGNvbG9yIG9wYWNpdHlcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yICAgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IFBlcmNlbnQgb2Ygb3BhY2l0eVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZmFkZShjb2xvcikge1xuICB2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMTAwO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdmYWRlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYlZhbHVlID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIXJnYlZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHZhciByZ2JhVmFsdWUgPSBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyZ2JWYWx1ZSksIFtwZXJjZW50IC8gMTAwXSk7XG4gIHJldHVybiBnZXRDb2xvckZyb21SZ2JWYWx1ZShyZ2JhVmFsdWUpO1xufVxuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGZhZGU6IGZhZGUsXG4gIHRvSGV4OiB0b0hleCxcbiAgdG9SZ2I6IHRvUmdiLFxuICBkYXJrZW46IGRhcmtlbixcbiAgbGlnaHRlbjogbGlnaHRlbixcbiAgZ2V0T3BhY2l0eTogZ2V0T3BhY2l0eSxcbiAgZ2V0UmdiVmFsdWU6IGdldFJnYlZhbHVlLFxuICBnZXRSZ2JhVmFsdWU6IGdldFJnYmFWYWx1ZSxcbiAgZ2V0Q29sb3JGcm9tUmdiVmFsdWU6IGdldENvbG9yRnJvbVJnYlZhbHVlXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZXhwb3J0cy5lYXNlSW5PdXRCb3VuY2UgPSBleHBvcnRzLmVhc2VPdXRCb3VuY2UgPSBleHBvcnRzLmVhc2VJbkJvdW5jZSA9IGV4cG9ydHMuZWFzZUluT3V0RWxhc3RpYyA9IGV4cG9ydHMuZWFzZU91dEVsYXN0aWMgPSBleHBvcnRzLmVhc2VJbkVsYXN0aWMgPSBleHBvcnRzLmVhc2VJbk91dEJhY2sgPSBleHBvcnRzLmVhc2VPdXRCYWNrID0gZXhwb3J0cy5lYXNlSW5CYWNrID0gZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGV4cG9ydHMuZWFzZU91dFF1aW50ID0gZXhwb3J0cy5lYXNlSW5RdWludCA9IGV4cG9ydHMuZWFzZUluT3V0UXVhcnQgPSBleHBvcnRzLmVhc2VPdXRRdWFydCA9IGV4cG9ydHMuZWFzZUluUXVhcnQgPSBleHBvcnRzLmVhc2VJbk91dEN1YmljID0gZXhwb3J0cy5lYXNlT3V0Q3ViaWMgPSBleHBvcnRzLmVhc2VJbkN1YmljID0gZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZXhwb3J0cy5lYXNlT3V0UXVhZCA9IGV4cG9ydHMuZWFzZUluUXVhZCA9IGV4cG9ydHMuZWFzZUluT3V0U2luZSA9IGV4cG9ydHMuZWFzZU91dFNpbmUgPSBleHBvcnRzLmVhc2VJblNpbmUgPSBleHBvcnRzLmxpbmVhciA9IHZvaWQgMDtcbnZhciBsaW5lYXIgPSBbW1swLCAxXSwgJycsIFswLjMzLCAwLjY3XV0sIFtbMSwgMF0sIFswLjY3LCAwLjMzXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTaW5lXHJcbiAqL1xuXG5leHBvcnRzLmxpbmVhciA9IGxpbmVhcjtcbnZhciBlYXNlSW5TaW5lID0gW1tbMCwgMV1dLCBbWzAuNTM4LCAwLjU2NF0sIFswLjE2OSwgMC45MTJdLCBbMC44ODAsIDAuMTk2XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluU2luZSA9IGVhc2VJblNpbmU7XG52YXIgZWFzZU91dFNpbmUgPSBbW1swLCAxXV0sIFtbMC40NDQsIDAuNDQ4XSwgWzAuMTY5LCAwLjczNl0sIFswLjcxOCwgMC4xNl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRTaW5lID0gZWFzZU91dFNpbmU7XG52YXIgZWFzZUluT3V0U2luZSA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjIsIDFdLCBbMC44LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUXVhZFxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRTaW5lID0gZWFzZUluT3V0U2luZTtcbnZhciBlYXNlSW5RdWFkID0gW1tbMCwgMV1dLCBbWzAuNTUwLCAwLjU4NF0sIFswLjIzMSwgMC45MDRdLCBbMC44NjgsIDAuMjY0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluUXVhZCA9IGVhc2VJblF1YWQ7XG52YXIgZWFzZU91dFF1YWQgPSBbW1swLCAxXV0sIFtbMC40MTMsIDAuNDI4XSwgWzAuMDY1LCAwLjgxNl0sIFswLjc2MCwgMC4wNF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRRdWFkID0gZWFzZU91dFF1YWQ7XG52YXIgZWFzZUluT3V0UXVhZCA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjMsIDAuOV0sIFswLjcsIDAuMV1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEN1YmljXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dFF1YWQgPSBlYXNlSW5PdXRRdWFkO1xudmFyIGVhc2VJbkN1YmljID0gW1tbMCwgMV1dLCBbWzAuNjc5LCAwLjY4OF0sIFswLjM2NiwgMC45OTJdLCBbMC45OTIsIDAuMzg0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluQ3ViaWMgPSBlYXNlSW5DdWJpYztcbnZhciBlYXNlT3V0Q3ViaWMgPSBbW1swLCAxXV0sIFtbMC4zMjEsIDAuMzEyXSwgWzAuMDA4LCAwLjYxNl0sIFswLjYzNCwgMC4wMDhdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0Q3ViaWMgPSBlYXNlT3V0Q3ViaWM7XG52YXIgZWFzZUluT3V0Q3ViaWMgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC4zLCAxXSwgWzAuNywgMF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFF1YXJ0XHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dEN1YmljID0gZWFzZUluT3V0Q3ViaWM7XG52YXIgZWFzZUluUXVhcnQgPSBbW1swLCAxXV0sIFtbMC44MTIsIDAuNzRdLCBbMC42MTEsIDAuOTg4XSwgWzEuMDEzLCAwLjQ5Ml1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblF1YXJ0ID0gZWFzZUluUXVhcnQ7XG52YXIgZWFzZU91dFF1YXJ0ID0gW1tbMCwgMV1dLCBbWzAuMTUyLCAwLjI0NF0sIFswLjAwMSwgMC40NDhdLCBbMC4yODUsIC0wLjAyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dFF1YXJ0ID0gZWFzZU91dFF1YXJ0O1xudmFyIGVhc2VJbk91dFF1YXJ0ID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuNCwgMV0sIFswLjYsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBRdWludFxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRRdWFydCA9IGVhc2VJbk91dFF1YXJ0O1xudmFyIGVhc2VJblF1aW50ID0gW1tbMCwgMV1dLCBbWzAuODU3LCAwLjg1Nl0sIFswLjcxNCwgMV0sIFsxLCAwLjcxMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblF1aW50ID0gZWFzZUluUXVpbnQ7XG52YXIgZWFzZU91dFF1aW50ID0gW1tbMCwgMV1dLCBbWzAuMTA4LCAwLjJdLCBbMC4wMDEsIDAuNF0sIFswLjIxNCwgLTAuMDEyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dFF1aW50ID0gZWFzZU91dFF1aW50O1xudmFyIGVhc2VJbk91dFF1aW50ID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuNSwgMV0sIFswLjUsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBCYWNrXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dFF1aW50ID0gZWFzZUluT3V0UXVpbnQ7XG52YXIgZWFzZUluQmFjayA9IFtbWzAsIDFdXSwgW1swLjY2NywgMC44OTZdLCBbMC4zODAsIDEuMTg0XSwgWzAuOTU1LCAwLjYxNl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkJhY2sgPSBlYXNlSW5CYWNrO1xudmFyIGVhc2VPdXRCYWNrID0gW1tbMCwgMV1dLCBbWzAuMzM1LCAwLjAyOF0sIFswLjA2MSwgMC4yMl0sIFswLjYzMSwgLTAuMThdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0QmFjayA9IGVhc2VPdXRCYWNrO1xudmFyIGVhc2VJbk91dEJhY2sgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC40LCAxLjRdLCBbMC42LCAtMC40XV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRWxhc3RpY1xyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRCYWNrID0gZWFzZUluT3V0QmFjaztcbnZhciBlYXNlSW5FbGFzdGljID0gW1tbMCwgMV1dLCBbWzAuNDc0LCAwLjk2NF0sIFswLjM4MiwgMC45ODhdLCBbMC41NTcsIDAuOTUyXV0sIFtbMC42MTksIDEuMDc2XSwgWzAuNTY1LCAxLjA4OF0sIFswLjY2OSwgMS4wOF1dLCBbWzAuNzcwLCAwLjkxNl0sIFswLjcxMiwgMC45MjRdLCBbMC44NDcsIDAuOTA0XV0sIFtbMC45MTEsIDEuMzA0XSwgWzAuODcyLCAxLjMxNl0sIFswLjk2MSwgMS4zNF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkVsYXN0aWMgPSBlYXNlSW5FbGFzdGljO1xudmFyIGVhc2VPdXRFbGFzdGljID0gW1tbMCwgMV1dLCBbWzAuMDczLCAtMC4zMl0sIFswLjAzNCwgLTAuMzI4XSwgWzAuMTA0LCAtMC4zNDRdXSwgW1swLjE5MSwgMC4wOTJdLCBbMC4xMTAsIDAuMDZdLCBbMC4yNTYsIDAuMDhdXSwgW1swLjMxMCwgLTAuMDc2XSwgWzAuMjYwLCAtMC4wNjhdLCBbMC4zNTcsIC0wLjA3Nl1dLCBbWzAuNDMyLCAwLjAzMl0sIFswLjM2MiwgMC4wMjhdLCBbMC42ODMsIC0wLjAwNF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRFbGFzdGljID0gZWFzZU91dEVsYXN0aWM7XG52YXIgZWFzZUluT3V0RWxhc3RpYyA9IFtbWzAsIDFdXSwgW1swLjIxMCwgMC45NF0sIFswLjE2NywgMC44ODRdLCBbMC4yNTIsIDAuOThdXSwgW1swLjI5OSwgMS4xMDRdLCBbMC4yNTYsIDEuMDkyXSwgWzAuMzQ3LCAxLjEwOF1dLCBbWzAuNSwgMC40OTZdLCBbMC40NTEsIDAuNjcyXSwgWzAuNTQ4LCAwLjMyNF1dLCBbWzAuNjk2LCAtMC4xMDhdLCBbMC42NTIsIC0wLjExMl0sIFswLjc0MSwgLTAuMTI0XV0sIFtbMC44MDUsIDAuMDY0XSwgWzAuNzU2LCAwLjAxMl0sIFswLjg2NiwgMC4wOTZdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBCb3VuY2VcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0RWxhc3RpYyA9IGVhc2VJbk91dEVsYXN0aWM7XG52YXIgZWFzZUluQm91bmNlID0gW1tbMCwgMV1dLCBbWzAuMTQ4LCAxXSwgWzAuMDc1LCAwLjg2OF0sIFswLjE5MywgMC44NDhdXSwgW1swLjMyNiwgMV0sIFswLjI3NiwgMC44MzZdLCBbMC40MDUsIDAuNzEyXV0sIFtbMC42MDAsIDFdLCBbMC41MTEsIDAuNzA4XSwgWzAuNjcxLCAwLjM0OF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkJvdW5jZSA9IGVhc2VJbkJvdW5jZTtcbnZhciBlYXNlT3V0Qm91bmNlID0gW1tbMCwgMV1dLCBbWzAuMzU3LCAwLjAwNF0sIFswLjI3MCwgMC41OTJdLCBbMC4zNzYsIDAuMjUyXV0sIFtbMC42MDQsIC0wLjAwNF0sIFswLjU0OCwgMC4zMTJdLCBbMC42NjksIDAuMTg0XV0sIFtbMC44MjAsIDBdLCBbMC43NDksIDAuMTg0XSwgWzAuOTA1LCAwLjEzMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRCb3VuY2UgPSBlYXNlT3V0Qm91bmNlO1xudmFyIGVhc2VJbk91dEJvdW5jZSA9IFtbWzAsIDFdXSwgW1swLjEwMiwgMV0sIFswLjA1MCwgMC44NjRdLCBbMC4xMTcsIDAuODZdXSwgW1swLjIxNiwgMC45OTZdLCBbMC4yMDgsIDAuODQ0XSwgWzAuMjI3LCAwLjgwOF1dLCBbWzAuMzQ3LCAwLjk5Nl0sIFswLjM0MywgMC44XSwgWzAuNDgwLCAwLjI5Ml1dLCBbWzAuNjM1LCAwLjAwNF0sIFswLjUxMSwgMC42NzZdLCBbMC42NTYsIDAuMjA4XV0sIFtbMC43ODcsIDBdLCBbMC43NjAsIDAuMl0sIFswLjc5NSwgMC4xNDRdXSwgW1swLjkwNSwgLTAuMDA0XSwgWzAuODk5LCAwLjE2NF0sIFswLjk0NCwgMC4xNDRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5PdXRCb3VuY2UgPSBlYXNlSW5PdXRCb3VuY2U7XG5cbnZhciBfZGVmYXVsdCA9IG5ldyBNYXAoW1snbGluZWFyJywgbGluZWFyXSwgWydlYXNlSW5TaW5lJywgZWFzZUluU2luZV0sIFsnZWFzZU91dFNpbmUnLCBlYXNlT3V0U2luZV0sIFsnZWFzZUluT3V0U2luZScsIGVhc2VJbk91dFNpbmVdLCBbJ2Vhc2VJblF1YWQnLCBlYXNlSW5RdWFkXSwgWydlYXNlT3V0UXVhZCcsIGVhc2VPdXRRdWFkXSwgWydlYXNlSW5PdXRRdWFkJywgZWFzZUluT3V0UXVhZF0sIFsnZWFzZUluQ3ViaWMnLCBlYXNlSW5DdWJpY10sIFsnZWFzZU91dEN1YmljJywgZWFzZU91dEN1YmljXSwgWydlYXNlSW5PdXRDdWJpYycsIGVhc2VJbk91dEN1YmljXSwgWydlYXNlSW5RdWFydCcsIGVhc2VJblF1YXJ0XSwgWydlYXNlT3V0UXVhcnQnLCBlYXNlT3V0UXVhcnRdLCBbJ2Vhc2VJbk91dFF1YXJ0JywgZWFzZUluT3V0UXVhcnRdLCBbJ2Vhc2VJblF1aW50JywgZWFzZUluUXVpbnRdLCBbJ2Vhc2VPdXRRdWludCcsIGVhc2VPdXRRdWludF0sIFsnZWFzZUluT3V0UXVpbnQnLCBlYXNlSW5PdXRRdWludF0sIFsnZWFzZUluQmFjaycsIGVhc2VJbkJhY2tdLCBbJ2Vhc2VPdXRCYWNrJywgZWFzZU91dEJhY2tdLCBbJ2Vhc2VJbk91dEJhY2snLCBlYXNlSW5PdXRCYWNrXSwgWydlYXNlSW5FbGFzdGljJywgZWFzZUluRWxhc3RpY10sIFsnZWFzZU91dEVsYXN0aWMnLCBlYXNlT3V0RWxhc3RpY10sIFsnZWFzZUluT3V0RWxhc3RpYycsIGVhc2VJbk91dEVsYXN0aWNdLCBbJ2Vhc2VJbkJvdW5jZScsIGVhc2VJbkJvdW5jZV0sIFsnZWFzZU91dEJvdW5jZScsIGVhc2VPdXRCb3VuY2VdLCBbJ2Vhc2VJbk91dEJvdW5jZScsIGVhc2VJbk91dEJvdW5jZV1dKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uO1xuZXhwb3J0cy5pbmplY3ROZXdDdXJ2ZSA9IGluamVjdE5ld0N1cnZlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfY3VydmVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jb25maWcvY3VydmVzXCIpKTtcblxudmFyIGRlZmF1bHRUcmFuc2l0aW9uQkMgPSAnbGluZWFyJztcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBOLWZyYW1lIGFuaW1hdGlvbiBzdGF0ZSBieSB0aGUgc3RhcnQgYW5kIGVuZCBzdGF0ZVxyXG4gKiAgICAgICAgICAgICAgb2YgdGhlIGFuaW1hdGlvbiBhbmQgdGhlIGVhc2luZyBjdXJ2ZVxyXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gdEJDICAgICAgICAgICAgICAgRWFzaW5nIGN1cnZlIG5hbWUgb3IgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcnxBcnJheXxPYmplY3R9IHN0YXJ0U3RhdGUgQW5pbWF0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfEFycmF5fE9iamVjdH0gZW5kU3RhdGUgICBBbmltYXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBmcmFtZU51bSAgICAgICAgICAgICAgICBOdW1iZXIgb2YgQW5pbWF0aW9uIGZyYW1lc1xyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGRlZXAgICAgICAgICAgICAgICAgICAgV2hldGhlciB0byB1c2UgcmVjdXJzaXZlIG1vZGVcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gU3RhdGUgb2YgZWFjaCBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuZnVuY3Rpb24gdHJhbnNpdGlvbih0QkMpIHtcbiAgdmFyIHN0YXJ0U3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gIHZhciBlbmRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogbnVsbDtcbiAgdmFyIGZyYW1lTnVtID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAzMDtcbiAgdmFyIGRlZXAgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IGZhbHNlO1xuICBpZiAoIWNoZWNrUGFyYW1zLmFwcGx5KHZvaWQgMCwgYXJndW1lbnRzKSkgcmV0dXJuIGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgLy8gR2V0IHRoZSB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxuICAgIHZhciBiZXppZXJDdXJ2ZSA9IGdldEJlemllckN1cnZlKHRCQyk7IC8vIEdldCB0aGUgcHJvZ3Jlc3Mgb2YgZWFjaCBmcmFtZSBzdGF0ZVxuXG4gICAgdmFyIGZyYW1lU3RhdGVQcm9ncmVzcyA9IGdldEZyYW1lU3RhdGVQcm9ncmVzcyhiZXppZXJDdXJ2ZSwgZnJhbWVOdW0pOyAvLyBJZiB0aGUgcmVjdXJzaW9uIG1vZGUgaXMgbm90IGVuYWJsZWQgb3IgdGhlIHN0YXRlIHR5cGUgaXMgTnVtYmVyLCB0aGUgc2hhbGxvdyBzdGF0ZSBjYWxjdWxhdGlvbiBpcyBwZXJmb3JtZWQgZGlyZWN0bHkuXG5cbiAgICBpZiAoIWRlZXAgfHwgdHlwZW9mIGVuZFN0YXRlID09PSAnbnVtYmVyJykgcmV0dXJuIGdldFRyYW5zaXRpb25TdGF0ZShzdGFydFN0YXRlLCBlbmRTdGF0ZSwgZnJhbWVTdGF0ZVByb2dyZXNzKTtcbiAgICByZXR1cm4gcmVjdXJzaW9uVHJhbnNpdGlvblN0YXRlKHN0YXJ0U3RhdGUsIGVuZFN0YXRlLCBmcmFtZVN0YXRlUHJvZ3Jlc3MpO1xuICB9IGNhdGNoIChfdW51c2VkKSB7XG4gICAgY29uc29sZS53YXJuKCdUcmFuc2l0aW9uIHBhcmFtZXRlciBtYXkgYmUgYWJub3JtYWwhJyk7XG4gICAgcmV0dXJuIFtlbmRTdGF0ZV07XG4gIH1cbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBhcmFtZXRlcnMgYXJlIGxlZ2FsXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0QkMgICAgICBOYW1lIG9mIHRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QW55fSBzdGFydFN0YXRlICBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QW55fSBlbmRTdGF0ZSAgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZnJhbWVOdW0gTnVtYmVyIG9mIHRyYW5zaXRpb24gZnJhbWVzXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IElzIHRoZSBwYXJhbWV0ZXIgbGVnYWxcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQYXJhbXModEJDKSB7XG4gIHZhciBzdGFydFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgdmFyIGVuZFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIGZyYW1lTnVtID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAzMDtcblxuICBpZiAoIXRCQyB8fCBzdGFydFN0YXRlID09PSBmYWxzZSB8fCBlbmRTdGF0ZSA9PT0gZmFsc2UgfHwgIWZyYW1lTnVtKSB7XG4gICAgY29uc29sZS5lcnJvcigndHJhbnNpdGlvbjogTWlzc2luZyBQYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICgoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShzdGFydFN0YXRlKSAhPT0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZW5kU3RhdGUpKSB7XG4gICAgY29uc29sZS5lcnJvcigndHJhbnNpdGlvbjogSW5jb25zaXN0ZW50IFN0YXR1cyBUeXBlcyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgc3RhdGVUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZW5kU3RhdGUpO1xuXG4gIGlmIChzdGF0ZVR5cGUgPT09ICdzdHJpbmcnIHx8IHN0YXRlVHlwZSA9PT0gJ2Jvb2xlYW4nIHx8ICF0QkMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5lcnJvcigndHJhbnNpdGlvbjogVW5zdXBwb3J0ZWQgRGF0YSBUeXBlIG9mIFN0YXRlIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghX2N1cnZlc1tcImRlZmF1bHRcIl0uaGFzKHRCQykgJiYgISh0QkMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ3RyYW5zaXRpb246IFRyYW5zaXRpb24gY3VydmUgbm90IGZvdW5kLCBkZWZhdWx0IGN1cnZlIHdpbGwgYmUgdXNlZCEnKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0QkMgTmFtZSBvZiB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gQmV6aWVyIGN1cnZlIGRhdGFcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmUodEJDKSB7XG4gIHZhciBiZXppZXJDdXJ2ZSA9ICcnO1xuXG4gIGlmIChfY3VydmVzW1wiZGVmYXVsdFwiXS5oYXModEJDKSkge1xuICAgIGJlemllckN1cnZlID0gX2N1cnZlc1tcImRlZmF1bHRcIl0uZ2V0KHRCQyk7XG4gIH0gZWxzZSBpZiAodEJDIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBiZXppZXJDdXJ2ZSA9IHRCQztcbiAgfSBlbHNlIHtcbiAgICBiZXppZXJDdXJ2ZSA9IF9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmdldChkZWZhdWx0VHJhbnNpdGlvbkJDKTtcbiAgfVxuXG4gIHJldHVybiBiZXppZXJDdXJ2ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwcm9ncmVzcyBvZiBlYWNoIGZyYW1lIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBmcmFtZU51bSAgIE51bWJlciBvZiB0cmFuc2l0aW9uIGZyYW1lc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gUHJvZ3Jlc3Mgb2YgZWFjaCBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRGcmFtZVN0YXRlUHJvZ3Jlc3MoYmV6aWVyQ3VydmUsIGZyYW1lTnVtKSB7XG4gIHZhciB0TWludXMgPSAxIC8gKGZyYW1lTnVtIC0gMSk7XG4gIHZhciB0U3RhdGUgPSBuZXcgQXJyYXkoZnJhbWVOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIGkgKiB0TWludXM7XG4gIH0pO1xuICB2YXIgZnJhbWVTdGF0ZSA9IHRTdGF0ZS5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gZ2V0RnJhbWVTdGF0ZUZyb21UKGJlemllckN1cnZlLCB0KTtcbiAgfSk7XG4gIHJldHVybiBmcmFtZVN0YXRlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHByb2dyZXNzIG9mIHRoZSBjb3JyZXNwb25kaW5nIGZyYW1lIGFjY29yZGluZyB0byB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFByb2dyZXNzIG9mIGN1cnJlbnQgZnJhbWVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0RnJhbWVTdGF0ZUZyb21UKGJlemllckN1cnZlLCB0KSB7XG4gIHZhciB0QmV6aWVyQ3VydmVQb2ludCA9IGdldEJlemllckN1cnZlUG9pbnRGcm9tVChiZXppZXJDdXJ2ZSwgdCk7XG4gIHZhciBiZXppZXJDdXJ2ZVBvaW50VCA9IGdldEJlemllckN1cnZlUG9pbnRURnJvbVJlVCh0QmV6aWVyQ3VydmVQb2ludCwgdCk7XG4gIHJldHVybiBnZXRCZXppZXJDdXJ2ZVRTdGF0ZSh0QmV6aWVyQ3VydmVQb2ludCwgYmV6aWVyQ3VydmVQb2ludFQpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3ViLWN1cnZlIGFjY29yZGluZyB0byB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtBcnJheX0gU3ViLWN1cnZlIG9mIHRcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVQb2ludEZyb21UKGJlemllckN1cnZlLCB0KSB7XG4gIHZhciBsYXN0SW5kZXggPSBiZXppZXJDdXJ2ZS5sZW5ndGggLSAxO1xuICB2YXIgYmVnaW4gPSAnJyxcbiAgICAgIGVuZCA9ICcnO1xuICBiZXppZXJDdXJ2ZS5maW5kSW5kZXgoZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICBpZiAoaSA9PT0gbGFzdEluZGV4KSByZXR1cm47XG4gICAgYmVnaW4gPSBpdGVtO1xuICAgIGVuZCA9IGJlemllckN1cnZlW2kgKyAxXTtcbiAgICB2YXIgY3VycmVudE1haW5Qb2ludFggPSBiZWdpblswXVswXTtcbiAgICB2YXIgbmV4dE1haW5Qb2ludFggPSBlbmRbMF1bMF07XG4gICAgcmV0dXJuIHQgPj0gY3VycmVudE1haW5Qb2ludFggJiYgdCA8IG5leHRNYWluUG9pbnRYO1xuICB9KTtcbiAgdmFyIHAwID0gYmVnaW5bMF07XG4gIHZhciBwMSA9IGJlZ2luWzJdIHx8IGJlZ2luWzBdO1xuICB2YXIgcDIgPSBlbmRbMV0gfHwgZW5kWzBdO1xuICB2YXIgcDMgPSBlbmRbMF07XG4gIHJldHVybiBbcDAsIHAxLCBwMiwgcDNdO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgbG9jYWwgdCBiYXNlZCBvbiB0IGFuZCBzdWItY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgU3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGxvY2FsIHQgb2Ygc3ViLWN1cnZlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlUG9pbnRURnJvbVJlVChiZXppZXJDdXJ2ZSwgdCkge1xuICB2YXIgcmVCZWdpblggPSBiZXppZXJDdXJ2ZVswXVswXTtcbiAgdmFyIHJlRW5kWCA9IGJlemllckN1cnZlWzNdWzBdO1xuICB2YXIgeE1pbnVzID0gcmVFbmRYIC0gcmVCZWdpblg7XG4gIHZhciB0TWludXMgPSB0IC0gcmVCZWdpblg7XG4gIHJldHVybiB0TWludXMgLyB4TWludXM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY3VydmUgcHJvZ3Jlc3Mgb2YgdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBTdWItY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgICAgICAgICAgQ3VycmVudCBmcmFtZSB0XHJcbiAqIEByZXR1cm4ge051bWJlcn0gUHJvZ3Jlc3Mgb2YgY3VycmVudCBmcmFtZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZVRTdGF0ZShfcmVmLCB0KSB7XG4gIHZhciBfcmVmMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCA0KSxcbiAgICAgIF9yZWYyJCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlswXSwgMiksXG4gICAgICBwMCA9IF9yZWYyJFsxXSxcbiAgICAgIF9yZWYyJDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbMV0sIDIpLFxuICAgICAgcDEgPSBfcmVmMiQyWzFdLFxuICAgICAgX3JlZjIkMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlsyXSwgMiksXG4gICAgICBwMiA9IF9yZWYyJDNbMV0sXG4gICAgICBfcmVmMiQ0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyWzNdLCAyKSxcbiAgICAgIHAzID0gX3JlZjIkNFsxXTtcblxuICB2YXIgcG93ID0gTWF0aC5wb3c7XG4gIHZhciB0TWludXMgPSAxIC0gdDtcbiAgdmFyIHJlc3VsdDEgPSBwMCAqIHBvdyh0TWludXMsIDMpO1xuICB2YXIgcmVzdWx0MiA9IDMgKiBwMSAqIHQgKiBwb3codE1pbnVzLCAyKTtcbiAgdmFyIHJlc3VsdDMgPSAzICogcDIgKiBwb3codCwgMikgKiB0TWludXM7XG4gIHZhciByZXN1bHQ0ID0gcDMgKiBwb3codCwgMyk7XG4gIHJldHVybiAxIC0gKHJlc3VsdDEgKyByZXN1bHQyICsgcmVzdWx0MyArIHJlc3VsdDQpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdHJhbnNpdGlvbiBzdGF0ZSBhY2NvcmRpbmcgdG8gZnJhbWUgcHJvZ3Jlc3NcclxuICogQHBhcmFtIHtBbnl9IHN0YXJ0U3RhdGUgICBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QW55fSBlbmRTdGF0ZSAgICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIgc3RhdGVUeXBlID0gJ29iamVjdCc7XG4gIGlmICh0eXBlb2YgYmVnaW4gPT09ICdudW1iZXInKSBzdGF0ZVR5cGUgPSAnbnVtYmVyJztcbiAgaWYgKGJlZ2luIGluc3RhbmNlb2YgQXJyYXkpIHN0YXRlVHlwZSA9ICdhcnJheSc7XG4gIGlmIChzdGF0ZVR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gZ2V0TnVtYmVyVHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuICBpZiAoc3RhdGVUeXBlID09PSAnYXJyYXknKSByZXR1cm4gZ2V0QXJyYXlUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSk7XG4gIGlmIChzdGF0ZVR5cGUgPT09ICdvYmplY3QnKSByZXR1cm4gZ2V0T2JqZWN0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuICByZXR1cm4gZnJhbWVTdGF0ZS5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gZW5kO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIGRhdGEgb2YgdGhlIG51bWJlciB0eXBlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGVuZFN0YXRlICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSAgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0TnVtYmVyVHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIG1pbnVzID0gZW5kIC0gYmVnaW47XG4gIHJldHVybiBmcmFtZVN0YXRlLm1hcChmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBiZWdpbiArIG1pbnVzICogcztcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBkYXRhIG9mIHRoZSBhcnJheSB0eXBlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0U3RhdGUgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QXJyYXlUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIgbWludXMgPSBlbmQubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2IC0gYmVnaW5baV07XG4gIH0pO1xuICByZXR1cm4gZnJhbWVTdGF0ZS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gbWludXMubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICBpZiAodiA9PT0gZmFsc2UpIHJldHVybiBlbmRbaV07XG4gICAgICByZXR1cm4gYmVnaW5baV0gKyB2ICogcztcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBkYXRhIG9mIHRoZSBvYmplY3QgdHlwZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE9iamVjdFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZW5kKTtcbiAgdmFyIGJlZ2luVmFsdWUgPSBrZXlzLm1hcChmdW5jdGlvbiAoaykge1xuICAgIHJldHVybiBiZWdpbltrXTtcbiAgfSk7XG4gIHZhciBlbmRWYWx1ZSA9IGtleXMubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgcmV0dXJuIGVuZFtrXTtcbiAgfSk7XG4gIHZhciBhcnJheVN0YXRlID0gZ2V0QXJyYXlUcmFuc2l0aW9uU3RhdGUoYmVnaW5WYWx1ZSwgZW5kVmFsdWUsIGZyYW1lU3RhdGUpO1xuICByZXR1cm4gYXJyYXlTdGF0ZS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgZnJhbWVEYXRhID0ge307XG4gICAgaXRlbS5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICByZXR1cm4gZnJhbWVEYXRhW2tleXNbaV1dID0gdjtcbiAgICB9KTtcbiAgICByZXR1cm4gZnJhbWVEYXRhO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIHN0YXRlIGRhdGEgYnkgcmVjdXJzaW9uXHJcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGVuZFN0YXRlICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSAgICAgICAgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gcmVjdXJzaW9uVHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIHN0YXRlID0gZ2V0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuXG4gIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKGtleSkge1xuICAgIHZhciBiVGVtcCA9IGJlZ2luW2tleV07XG4gICAgdmFyIGVUZW1wID0gZW5kW2tleV07XG4gICAgaWYgKCgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGVUZW1wKSAhPT0gJ29iamVjdCcpIHJldHVybiBcImNvbnRpbnVlXCI7XG4gICAgdmFyIGRhdGEgPSByZWN1cnNpb25UcmFuc2l0aW9uU3RhdGUoYlRlbXAsIGVUZW1wLCBmcmFtZVN0YXRlKTtcbiAgICBzdGF0ZS5mb3JFYWNoKGZ1bmN0aW9uIChmcywgaSkge1xuICAgICAgcmV0dXJuIGZzW2tleV0gPSBkYXRhW2ldO1xuICAgIH0pO1xuICB9O1xuXG4gIGZvciAodmFyIGtleSBpbiBlbmQpIHtcbiAgICB2YXIgX3JldCA9IF9sb29wKGtleSk7XG5cbiAgICBpZiAoX3JldCA9PT0gXCJjb250aW51ZVwiKSBjb250aW51ZTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSW5qZWN0IG5ldyBjdXJ2ZSBpbnRvIGN1cnZlcyBhcyBjb25maWdcclxuICogQHBhcmFtIHtBbnl9IGtleSAgICAgVGhlIGtleSBvZiBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjdXJ2ZSBCZXppZXIgY3VydmUgZGF0YVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IE5vIHJldHVyblxyXG4gKi9cblxuXG5mdW5jdGlvbiBpbmplY3ROZXdDdXJ2ZShrZXksIGN1cnZlKSB7XG4gIGlmICgha2V5IHx8ICFjdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0luamVjdE5ld0N1cnZlIE1pc3NpbmcgUGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBfY3VydmVzW1wiZGVmYXVsdFwiXS5zZXQoa2V5LCBjdXJ2ZSk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHRyYW5zaXRpb247XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZVt0b1N0cmluZ1RhZ1N5bWJvbF0gPVxuICAgIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIGV4cG9ydHMubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgaWYgKCEodG9TdHJpbmdUYWdTeW1ib2wgaW4gZ2VuRnVuKSkge1xuICAgICAgICBnZW5GdW5bdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuICAgICAgfVxuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBHcFt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvclwiO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xufVxuIl19
