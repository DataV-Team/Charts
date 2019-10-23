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
 * @param {Boolean} animationEnd Execute animationEnd
 * @return {Undefined} No return
 */


exports["default"] = Charts;

Charts.prototype.setOption = function (option) {
  var animationEnd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!option || (0, _typeof2["default"])(option) !== 'object') {
    console.error('setOption Missing parameters!');
    return false;
  }

  if (animationEnd) this.render.graphs.forEach(function (graph) {
    return graph.animationEnd();
  });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9lbnRyeS5qcyIsImxpYi9jbGFzcy9jaGFydHMuY2xhc3MuanMiLCJsaWIvY2xhc3MvdXBkYXRlci5jbGFzcy5qcyIsImxpYi9jb25maWcvYXhpcy5qcyIsImxpYi9jb25maWcvYmFyLmpzIiwibGliL2NvbmZpZy9jb2xvci5qcyIsImxpYi9jb25maWcvZ2F1Z2UuanMiLCJsaWIvY29uZmlnL2dyaWQuanMiLCJsaWIvY29uZmlnL2luZGV4LmpzIiwibGliL2NvbmZpZy9sZWdlbmQuanMiLCJsaWIvY29uZmlnL2xpbmUuanMiLCJsaWIvY29uZmlnL3BpZS5qcyIsImxpYi9jb25maWcvcmFkYXIuanMiLCJsaWIvY29uZmlnL3JhZGFyQXhpcy5qcyIsImxpYi9jb25maWcvdGl0bGUuanMiLCJsaWIvY29yZS9heGlzLmpzIiwibGliL2NvcmUvYmFyLmpzIiwibGliL2NvcmUvZ2F1Z2UuanMiLCJsaWIvY29yZS9ncmlkLmpzIiwibGliL2NvcmUvaW5kZXguanMiLCJsaWIvY29yZS9sZWdlbmQuanMiLCJsaWIvY29yZS9saW5lLmpzIiwibGliL2NvcmUvbWVyZ2VDb2xvci5qcyIsImxpYi9jb3JlL3BpZS5qcyIsImxpYi9jb3JlL3JhZGFyLmpzIiwibGliL2NvcmUvcmFkYXJBeGlzLmpzIiwibGliL2NvcmUvdGl0bGUuanMiLCJsaWIvZXh0ZW5kL2luZGV4LmpzIiwibGliL2luZGV4LmpzIiwibGliL3V0aWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5V2l0aG91dEhvbGVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXN5bmNUb0dlbmVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXlMaW1pdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlUmVzdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlU3ByZWFkLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYmV6aWVyLWN1cnZlL2xpYi9jb3JlL2JlemllckN1cnZlVG9Qb2x5bGluZS5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2Jlemllci1jdXJ2ZS9saWIvY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmUuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9iZXppZXItY3VydmUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL2NsYXNzL2NyZW5kZXIuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3MvZ3JhcGguY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3Mvc3R5bGUuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY29uZmlnL2dyYXBocy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vY2FudmFzLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvY29sb3IvbGliL2NvbmZpZy9rZXl3b3Jkcy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2NvbG9yL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL3RyYW5zaXRpb24vbGliL2NvbmZpZy9jdXJ2ZXMuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS90cmFuc2l0aW9uL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3R3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3R5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1akJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcllBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsInZhciBDaGFydHMgPSByZXF1aXJlKCcuLi9saWIvaW5kZXgnKVxuXG53aW5kb3cuQ2hhcnRzID0gQ2hhcnRzIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxucmVxdWlyZShcIi4uL2V4dGVuZC9pbmRleFwiKTtcblxudmFyIF9jUmVuZGVyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlclwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb3JlID0gcmVxdWlyZShcIi4uL2NvcmVcIik7XG5cbnZhciBDaGFydHMgPSBmdW5jdGlvbiBDaGFydHMoZG9tKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgQ2hhcnRzKTtcblxuICBpZiAoIWRvbSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NoYXJ0cyBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNsaWVudFdpZHRoID0gZG9tLmNsaWVudFdpZHRoLFxuICAgICAgY2xpZW50SGVpZ2h0ID0gZG9tLmNsaWVudEhlaWdodDtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGNsaWVudFdpZHRoKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgY2xpZW50SGVpZ2h0KTtcbiAgZG9tLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gIHZhciBhdHRyaWJ1dGUgPSB7XG4gICAgY29udGFpbmVyOiBkb20sXG4gICAgY2FudmFzOiBjYW52YXMsXG4gICAgcmVuZGVyOiBuZXcgX2NSZW5kZXJbXCJkZWZhdWx0XCJdKGNhbnZhcyksXG4gICAgb3B0aW9uOiBudWxsXG4gIH07XG4gIE9iamVjdC5hc3NpZ24odGhpcywgYXR0cmlidXRlKTtcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBTZXQgY2hhcnQgb3B0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uIENoYXJ0IG9wdGlvblxuICogQHBhcmFtIHtCb29sZWFufSBhbmltYXRpb25FbmQgRXhlY3V0ZSBhbmltYXRpb25FbmRcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gTm8gcmV0dXJuXG4gKi9cblxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IENoYXJ0cztcblxuQ2hhcnRzLnByb3RvdHlwZS5zZXRPcHRpb24gPSBmdW5jdGlvbiAob3B0aW9uKSB7XG4gIHZhciBhbmltYXRpb25FbmQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuXG4gIGlmICghb3B0aW9uIHx8ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG9wdGlvbikgIT09ICdvYmplY3QnKSB7XG4gICAgY29uc29sZS5lcnJvcignc2V0T3B0aW9uIE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoYW5pbWF0aW9uRW5kKSB0aGlzLnJlbmRlci5ncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguYW5pbWF0aW9uRW5kKCk7XG4gIH0pO1xuICB2YXIgb3B0aW9uQ2xvbmVkID0gKDAsIF91dGlsLmRlZXBDbG9uZSkob3B0aW9uLCB0cnVlKTtcbiAgKDAsIF9jb3JlLm1lcmdlQ29sb3IpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5ncmlkKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUuYXhpcykodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLnJhZGFyQXhpcykodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLnRpdGxlKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUuYmFyKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUubGluZSkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLnBpZSkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLnJhZGFyKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUuZ2F1Z2UpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5sZWdlbmQpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gIHRoaXMub3B0aW9uID0gb3B0aW9uO1xuICB0aGlzLnJlbmRlci5sYXVuY2hBbmltYXRpb24oKTsgLy8gY29uc29sZS53YXJuKHRoaXMpXG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gUmVzaXplIGNoYXJ0XG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IE5vIHJldHVyblxuICovXG5cblxuQ2hhcnRzLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lcixcbiAgICAgIGNhbnZhcyA9IHRoaXMuY2FudmFzLFxuICAgICAgcmVuZGVyID0gdGhpcy5yZW5kZXIsXG4gICAgICBvcHRpb24gPSB0aGlzLm9wdGlvbjtcbiAgdmFyIGNsaWVudFdpZHRoID0gY29udGFpbmVyLmNsaWVudFdpZHRoLFxuICAgICAgY2xpZW50SGVpZ2h0ID0gY29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBjbGllbnRXaWR0aCk7XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGNsaWVudEhlaWdodCk7XG4gIHJlbmRlci5hcmVhID0gW2NsaWVudFdpZHRoLCBjbGllbnRIZWlnaHRdO1xuICB0aGlzLnNldE9wdGlvbihvcHRpb24pO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRvVXBkYXRlID0gZG9VcGRhdGU7XG5leHBvcnRzLlVwZGF0ZXIgPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIFVwZGF0ZXIgPSBmdW5jdGlvbiBVcGRhdGVyKGNvbmZpZywgc2VyaWVzKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgVXBkYXRlcik7XG4gIHZhciBjaGFydCA9IGNvbmZpZy5jaGFydCxcbiAgICAgIGtleSA9IGNvbmZpZy5rZXksXG4gICAgICBnZXRHcmFwaENvbmZpZyA9IGNvbmZpZy5nZXRHcmFwaENvbmZpZztcblxuICBpZiAodHlwZW9mIGdldEdyYXBoQ29uZmlnICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS53YXJuKCdVcGRhdGVyIG5lZWQgZnVuY3Rpb24gZ2V0R3JhcGhDb25maWchJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjaGFydFtrZXldKSB0aGlzLmdyYXBocyA9IGNoYXJ0W2tleV0gPSBbXTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBjb25maWcpO1xuICB0aGlzLnVwZGF0ZShzZXJpZXMpO1xufTtcblxuZXhwb3J0cy5VcGRhdGVyID0gVXBkYXRlcjtcblxuVXBkYXRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHNlcmllcykge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocyxcbiAgICAgIGJlZm9yZVVwZGF0ZSA9IHRoaXMuYmVmb3JlVXBkYXRlO1xuICBkZWxSZWR1bmRhbmNlR3JhcGgodGhpcywgc2VyaWVzKTtcbiAgaWYgKCFzZXJpZXMubGVuZ3RoKSByZXR1cm47XG4gIHZhciBiZWZvcmVVcGRhdGVUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoYmVmb3JlVXBkYXRlKTtcbiAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24gKHNlcmllc0l0ZW0sIGkpIHtcbiAgICBpZiAoYmVmb3JlVXBkYXRlVHlwZSA9PT0gJ2Z1bmN0aW9uJykgYmVmb3JlVXBkYXRlKGdyYXBocywgc2VyaWVzSXRlbSwgaSwgX3RoaXMpO1xuICAgIHZhciBjYWNoZSA9IGdyYXBoc1tpXTtcblxuICAgIGlmIChjYWNoZSkge1xuICAgICAgY2hhbmdlR3JhcGhzKGNhY2hlLCBzZXJpZXNJdGVtLCBpLCBfdGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZEdyYXBocyhncmFwaHMsIHNlcmllc0l0ZW0sIGksIF90aGlzKTtcbiAgICB9XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gZGVsUmVkdW5kYW5jZUdyYXBoKHVwZGF0ZXIsIHNlcmllcykge1xuICB2YXIgZ3JhcGhzID0gdXBkYXRlci5ncmFwaHMsXG4gICAgICByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcjtcbiAgdmFyIGNhY2hlR3JhcGhOdW0gPSBncmFwaHMubGVuZ3RoO1xuICB2YXIgbmVlZEdyYXBoTnVtID0gc2VyaWVzLmxlbmd0aDtcblxuICBpZiAoY2FjaGVHcmFwaE51bSA+IG5lZWRHcmFwaE51bSkge1xuICAgIHZhciBuZWVkRGVsR3JhcGhzID0gZ3JhcGhzLnNwbGljZShuZWVkR3JhcGhOdW0pO1xuICAgIG5lZWREZWxHcmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIGl0ZW0uZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgICAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhbmdlR3JhcGhzKGNhY2hlLCBzZXJpZXNJdGVtLCBpLCB1cGRhdGVyKSB7XG4gIHZhciBnZXRHcmFwaENvbmZpZyA9IHVwZGF0ZXIuZ2V0R3JhcGhDb25maWcsXG4gICAgICByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcixcbiAgICAgIGJlZm9yZUNoYW5nZSA9IHVwZGF0ZXIuYmVmb3JlQ2hhbmdlO1xuICB2YXIgY29uZmlncyA9IGdldEdyYXBoQ29uZmlnKHNlcmllc0l0ZW0sIHVwZGF0ZXIpO1xuICBiYWxhbmNlR3JhcGhzTnVtKGNhY2hlLCBjb25maWdzLCByZW5kZXIpO1xuICBjYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCwgaikge1xuICAgIHZhciBjb25maWcgPSBjb25maWdzW2pdO1xuICAgIGlmICh0eXBlb2YgYmVmb3JlQ2hhbmdlID09PSAnZnVuY3Rpb24nKSBiZWZvcmVDaGFuZ2UoZ3JhcGgsIGNvbmZpZyk7XG4gICAgdXBkYXRlR3JhcGhDb25maWdCeUtleShncmFwaCwgY29uZmlnKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGJhbGFuY2VHcmFwaHNOdW0oZ3JhcGhzLCBncmFwaENvbmZpZywgcmVuZGVyKSB7XG4gIHZhciBjYWNoZUdyYXBoTnVtID0gZ3JhcGhzLmxlbmd0aDtcbiAgdmFyIG5lZWRHcmFwaE51bSA9IGdyYXBoQ29uZmlnLmxlbmd0aDtcblxuICBpZiAobmVlZEdyYXBoTnVtID4gY2FjaGVHcmFwaE51bSkge1xuICAgIHZhciBsYXN0Q2FjaGVHcmFwaCA9IGdyYXBocy5zbGljZSgtMSlbMF07XG4gICAgdmFyIG5lZWRBZGRHcmFwaE51bSA9IG5lZWRHcmFwaE51bSAtIGNhY2hlR3JhcGhOdW07XG4gICAgdmFyIG5lZWRBZGRHcmFwaHMgPSBuZXcgQXJyYXkobmVlZEFkZEdyYXBoTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNsb25lKGxhc3RDYWNoZUdyYXBoKTtcbiAgICB9KTtcbiAgICBncmFwaHMucHVzaC5hcHBseShncmFwaHMsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmVlZEFkZEdyYXBocykpO1xuICB9IGVsc2UgaWYgKG5lZWRHcmFwaE51bSA8IGNhY2hlR3JhcGhOdW0pIHtcbiAgICB2YXIgbmVlZERlbENhY2hlID0gZ3JhcGhzLnNwbGljZShuZWVkR3JhcGhOdW0pO1xuICAgIG5lZWREZWxDYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZEdyYXBocyhncmFwaHMsIHNlcmllc0l0ZW0sIGksIHVwZGF0ZXIpIHtcbiAgdmFyIGdldEdyYXBoQ29uZmlnID0gdXBkYXRlci5nZXRHcmFwaENvbmZpZyxcbiAgICAgIGdldFN0YXJ0R3JhcGhDb25maWcgPSB1cGRhdGVyLmdldFN0YXJ0R3JhcGhDb25maWcsXG4gICAgICBjaGFydCA9IHVwZGF0ZXIuY2hhcnQ7XG4gIHZhciByZW5kZXIgPSBjaGFydC5yZW5kZXI7XG4gIHZhciBzdGFydENvbmZpZ3MgPSBudWxsO1xuICBpZiAodHlwZW9mIGdldFN0YXJ0R3JhcGhDb25maWcgPT09ICdmdW5jdGlvbicpIHN0YXJ0Q29uZmlncyA9IGdldFN0YXJ0R3JhcGhDb25maWcoc2VyaWVzSXRlbSwgdXBkYXRlcik7XG4gIHZhciBjb25maWdzID0gZ2V0R3JhcGhDb25maWcoc2VyaWVzSXRlbSwgdXBkYXRlcik7XG4gIGlmICghY29uZmlncy5sZW5ndGgpIHJldHVybjtcblxuICBpZiAoc3RhcnRDb25maWdzKSB7XG4gICAgZ3JhcGhzW2ldID0gc3RhcnRDb25maWdzLm1hcChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmFkZChjb25maWcpO1xuICAgIH0pO1xuICAgIGdyYXBoc1tpXS5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCwgaSkge1xuICAgICAgdmFyIGNvbmZpZyA9IGNvbmZpZ3NbaV07XG4gICAgICB1cGRhdGVHcmFwaENvbmZpZ0J5S2V5KGdyYXBoLCBjb25maWcpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGdyYXBoc1tpXSA9IGNvbmZpZ3MubWFwKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuYWRkKGNvbmZpZyk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgYWZ0ZXJBZGRHcmFwaCA9IHVwZGF0ZXIuYWZ0ZXJBZGRHcmFwaDtcbiAgaWYgKHR5cGVvZiBhZnRlckFkZEdyYXBoID09PSAnZnVuY3Rpb24nKSBhZnRlckFkZEdyYXBoKGdyYXBoc1tpXSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUdyYXBoQ29uZmlnQnlLZXkoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNvbmZpZyk7XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGtleSA9PT0gJ3NoYXBlJyB8fCBrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgIGdyYXBoLmFuaW1hdGlvbihrZXksIGNvbmZpZ1trZXldLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ3JhcGhba2V5XSA9IGNvbmZpZ1trZXldO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRvVXBkYXRlKCkge1xuICB2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge30sXG4gICAgICBjaGFydCA9IF9yZWYuY2hhcnQsXG4gICAgICBzZXJpZXMgPSBfcmVmLnNlcmllcyxcbiAgICAgIGtleSA9IF9yZWYua2V5LFxuICAgICAgZ2V0R3JhcGhDb25maWcgPSBfcmVmLmdldEdyYXBoQ29uZmlnLFxuICAgICAgZ2V0U3RhcnRHcmFwaENvbmZpZyA9IF9yZWYuZ2V0U3RhcnRHcmFwaENvbmZpZyxcbiAgICAgIGJlZm9yZUNoYW5nZSA9IF9yZWYuYmVmb3JlQ2hhbmdlLFxuICAgICAgYmVmb3JlVXBkYXRlID0gX3JlZi5iZWZvcmVVcGRhdGUsXG4gICAgICBhZnRlckFkZEdyYXBoID0gX3JlZi5hZnRlckFkZEdyYXBoO1xuXG4gIGlmIChjaGFydFtrZXldKSB7XG4gICAgY2hhcnRba2V5XS51cGRhdGUoc2VyaWVzKTtcbiAgfSBlbHNlIHtcbiAgICBjaGFydFtrZXldID0gbmV3IFVwZGF0ZXIoe1xuICAgICAgY2hhcnQ6IGNoYXJ0LFxuICAgICAga2V5OiBrZXksXG4gICAgICBnZXRHcmFwaENvbmZpZzogZ2V0R3JhcGhDb25maWcsXG4gICAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydEdyYXBoQ29uZmlnLFxuICAgICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2UsXG4gICAgICBiZWZvcmVVcGRhdGU6IGJlZm9yZVVwZGF0ZSxcbiAgICAgIGFmdGVyQWRkR3JhcGg6IGFmdGVyQWRkR3JhcGhcbiAgICB9LCBzZXJpZXMpO1xuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnlBeGlzQ29uZmlnID0gZXhwb3J0cy54QXhpc0NvbmZpZyA9IHZvaWQgMDtcbnZhciB4QXhpc0NvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIGF4aXNcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBwb3NpdGlvblxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICdib3R0b20nXG4gICAqIEBleGFtcGxlIHBvc2l0aW9uID0gJ2JvdHRvbScgfCAndG9wJ1xuICAgKi9cbiAgcG9zaXRpb246ICdib3R0b20nLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBnYXBcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbmFtZUdhcCA9IDE1XG4gICAqL1xuICBuYW1lR2FwOiAxNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgbG9jYXRpb25cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZUxvY2F0aW9uID0gJ2VuZCdcbiAgICogQGV4YW1wbGUgbmFtZUxvY2F0aW9uID0gJ2VuZCcgfCAnY2VudGVyJyB8ICdzdGFydCdcbiAgICovXG4gIG5hbWVMb2NhdGlvbjogJ2VuZCcsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBOYW1lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgbmFtZVRleHRTdHlsZToge1xuICAgIGZpbGw6ICcjMzMzJyxcbiAgICBmb250U2l6ZTogMTBcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbWluIHZhbHVlXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtaW4gPSAnMjAlJ1xuICAgKiBAZXhhbXBsZSBtaW4gPSAnMjAlJyB8IDBcbiAgICovXG4gIG1pbjogJzIwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG1heCB2YWx1ZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgbWF4ID0gJzIwJSdcbiAgICogQGV4YW1wbGUgbWF4ID0gJzIwJScgfCAwXG4gICAqL1xuICBtYXg6ICcyMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyB2YWx1ZSBpbnRlcnZhbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpbnRlcnZhbCA9IG51bGxcbiAgICogQGV4YW1wbGUgaW50ZXJ2YWwgPSAxMDBcbiAgICovXG4gIGludGVydmFsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTWluIGludGVydmFsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1pbkludGVydmFsID0gbnVsbFxuICAgKiBAZXhhbXBsZSBtaW5JbnRlcnZhbCA9IDFcbiAgICovXG4gIG1pbkludGVydmFsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTWF4IGludGVydmFsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1heEludGVydmFsID0gbnVsbFxuICAgKiBAZXhhbXBsZSBtYXhJbnRlcnZhbCA9IDEwMFxuICAgKi9cbiAgbWF4SW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCb3VuZGFyeSBnYXBcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGJvdW5kYXJ5R2FwID0gbnVsbFxuICAgKiBAZXhhbXBsZSBib3VuZGFyeUdhcCA9IHRydWVcbiAgICovXG4gIGJvdW5kYXJ5R2FwOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBudW1iZXJcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3BsaXROdW1iZXIgPSA1XG4gICAqL1xuICBzcGxpdE51bWJlcjogNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGluZToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyMzMzMnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNUaWNrOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIHRpY2tcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzMzMycsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV95Lu2J1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyMzMzMnLFxuICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgcm90YXRlOiAwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBsaW5lIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHNwbGl0TGluZToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBzcGxpdCBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2Q0ZDRkNCcsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBYIGF4aXMgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IC0yMFxuICAgKi9cbiAgckxldmVsOiAtMjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBYIGF4aXMgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFggYXhpcyBhbmltYXRpb24gZnJhbWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxuICAgKi9cbiAgYW5pbWF0aW9uRnJhbWU6IDUwXG59O1xuZXhwb3J0cy54QXhpc0NvbmZpZyA9IHhBeGlzQ29uZmlnO1xudmFyIHlBeGlzQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgYXhpc1xuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHBvc2l0aW9uXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ2xlZnQnXG4gICAqIEBleGFtcGxlIHBvc2l0aW9uID0gJ2xlZnQnIHwgJ3JpZ2h0J1xuICAgKi9cbiAgcG9zaXRpb246ICdsZWZ0JyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgZ2FwXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG5hbWVHYXAgPSAxNVxuICAgKi9cbiAgbmFtZUdhcDogMTUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBOYW1lIGxvY2F0aW9uXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG5hbWVMb2NhdGlvbiA9ICdlbmQnXG4gICAqIEBleGFtcGxlIG5hbWVMb2NhdGlvbiA9ICdlbmQnIHwgJ2NlbnRlcicgfCAnc3RhcnQnXG4gICAqL1xuICBuYW1lTG9jYXRpb246ICdlbmQnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gbmFtZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIG5hbWVUZXh0U3R5bGU6IHtcbiAgICBmaWxsOiAnIzMzMycsXG4gICAgZm9udFNpemU6IDEwXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG1pbiB2YWx1ZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgbWluID0gJzIwJSdcbiAgICogQGV4YW1wbGUgbWluID0gJzIwJScgfCAwXG4gICAqL1xuICBtaW46ICcyMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBtYXggdmFsdWVcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1heCA9ICcyMCUnXG4gICAqIEBleGFtcGxlIG1heCA9ICcyMCUnIHwgMFxuICAgKi9cbiAgbWF4OiAnMjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdmFsdWUgaW50ZXJ2YWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgaW50ZXJ2YWwgPSBudWxsXG4gICAqIEBleGFtcGxlIGludGVydmFsID0gMTAwXG4gICAqL1xuICBpbnRlcnZhbDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE1pbiBpbnRlcnZhbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtaW5JbnRlcnZhbCA9IG51bGxcbiAgICogQGV4YW1wbGUgbWluSW50ZXJ2YWwgPSAxXG4gICAqL1xuICBtaW5JbnRlcnZhbDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE1heCBpbnRlcnZhbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtYXhJbnRlcnZhbCA9IG51bGxcbiAgICogQGV4YW1wbGUgbWF4SW50ZXJ2YWwgPSAxMDBcbiAgICovXG4gIG1heEludGVydmFsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQm91bmRhcnkgZ2FwXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBib3VuZGFyeUdhcCA9IG51bGxcbiAgICogQGV4YW1wbGUgYm91bmRhcnlHYXAgPSB0cnVlXG4gICAqL1xuICBib3VuZGFyeUdhcDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbnVtYmVyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHNwbGl0TnVtYmVyID0gNVxuICAgKi9cbiAgc3BsaXROdW1iZXI6IDUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGluZVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjMzMzJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzVGljazoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyB0aWNrXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyMzMzMnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGFiZWw6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfeS7tidcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjMzMzJyxcbiAgICAgIGZvbnRTaXplOiAxMCxcbiAgICAgIHJvdGF0ZTogMFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBzcGxpdExpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgc3BsaXQgbGluZVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjZDRkNGQ0JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFkgYXhpcyByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gLTIwXG4gICAqL1xuICByTGV2ZWw6IC0yMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFkgYXhpcyBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gWSBheGlzIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLnlBeGlzQ29uZmlnID0geUF4aXNDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmJhckNvbmZpZyA9IHZvaWQgMDtcbnZhciBiYXJDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgYmFyIGNoYXJ0XG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBuYW1lXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG5hbWUgPSAnJ1xuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBEYXRhIHN0YWNraW5nXG4gICAqIFRoZSBkYXRhIHZhbHVlIG9mIHRoZSBzZXJpZXMgZWxlbWVudCBvZiB0aGUgc2FtZSBzdGFja1xuICAgKiB3aWxsIGJlIHN1cGVyaW1wb3NlZCAodGhlIGxhdHRlciB2YWx1ZSB3aWxsIGJlIHN1cGVyaW1wb3NlZCBvbiB0aGUgcHJldmlvdXMgdmFsdWUpXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IHN0YWNrID0gJydcbiAgICovXG4gIHN0YWNrOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBzaGFwZSB0eXBlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IHNoYXBlVHlwZSA9ICdub3JtYWwnXG4gICAqIEBleGFtcGxlIHNoYXBlVHlwZSA9ICdub3JtYWwnIHwgJ2xlZnRFY2hlbG9uJyB8ICdyaWdodEVjaGVsb24nXG4gICAqL1xuICBzaGFwZVR5cGU6ICdub3JtYWwnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRWNoZWxvbiBiYXIgc2hhcnBuZXNzIG9mZnNldFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBlY2hlbG9uT2Zmc2V0ID0gMTBcbiAgICovXG4gIGVjaGVsb25PZmZzZXQ6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHdpZHRoXG4gICAqIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIHNldCBvbiB0aGUgbGFzdCAnYmFyJyBzZXJpZXNcbiAgICogaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbSB0byB0YWtlIGVmZmVjdCBhbmQgd2lsbCBiZSBpbiBlZmZlY3RcbiAgICogZm9yIGFsbCAnYmFyJyBzZXJpZXMgaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgYmFyV2lkdGggPSAnYXV0bydcbiAgICogQGV4YW1wbGUgYmFyV2lkdGggPSAnYXV0bycgfCAnMTAlJyB8IDIwXG4gICAqL1xuICBiYXJXaWR0aDogJ2F1dG8nLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGdhcFxuICAgKiBUaGlzIHByb3BlcnR5IHNob3VsZCBiZSBzZXQgb24gdGhlIGxhc3QgJ2Jhcicgc2VyaWVzXG4gICAqIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW0gdG8gdGFrZSBlZmZlY3QgYW5kIHdpbGwgYmUgaW4gZWZmZWN0XG4gICAqIGZvciBhbGwgJ2Jhcicgc2VyaWVzIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGJhckdhcCA9ICczMCUnXG4gICAqIEBleGFtcGxlIGJhckdhcCA9ICczMCUnIHwgMzBcbiAgICovXG4gIGJhckdhcDogJzMwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgY2F0ZWdvcnkgZ2FwXG4gICAqIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIHNldCBvbiB0aGUgbGFzdCAnYmFyJyBzZXJpZXNcbiAgICogaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbSB0byB0YWtlIGVmZmVjdCBhbmQgd2lsbCBiZSBpbiBlZmZlY3RcbiAgICogZm9yIGFsbCAnYmFyJyBzZXJpZXMgaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgYmFyQ2F0ZWdvcnlHYXAgPSAnMjAlJ1xuICAgKiBAZXhhbXBsZSBiYXJDYXRlZ29yeUdhcCA9ICcyMCUnIHwgMjBcbiAgICovXG4gIGJhckNhdGVnb3J5R2FwOiAnMjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciB4IGF4aXMgaW5kZXhcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgeEF4aXNJbmRleCA9IDBcbiAgICogQGV4YW1wbGUgeEF4aXNJbmRleCA9IDAgfCAxXG4gICAqL1xuICB4QXhpc0luZGV4OiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHkgYXhpcyBpbmRleFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB5QXhpc0luZGV4ID0gMFxuICAgKiBAZXhhbXBsZSB5QXhpc0luZGV4ID0gMCB8IDFcbiAgICovXG4gIHlBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKiBAZXhhbXBsZSBkYXRhID0gWzEwMCwgMjAwLCAzMDBdXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhY2tncm91bmQgYmFyIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGJhY2tncm91bmRCYXI6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGJhY2tncm91bmQgYmFyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFja2dyb3VuZCBiYXIgd2lkdGhcbiAgICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICAgKiBAZGVmYXVsdCB3aWR0aCA9ICdhdXRvJ1xuICAgICAqIEBleGFtcGxlIHdpZHRoID0gJ2F1dG8nIHwgJzMwJScgfCAzMFxuICAgICAqL1xuICAgIHdpZHRoOiAnYXV0bycsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFja2dyb3VuZCBiYXIgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmaWxsOiAncmdiYSgyMDAsIDIwMCwgMjAwLCAuNCknXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBiYXIgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgcG9zaXRpb25cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ3RvcCdcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICd0b3AnIHwgJ2NlbnRlcicgfCAnYm90dG9tJ1xuICAgICAqL1xuICAgIHBvc2l0aW9uOiAndG9wJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgb2Zmc2V0XG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAtMTBdXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgLTEwXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX3ku7YnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0udmFsdWUpXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBncmFkaWVudCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBncmFkaWVudDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFkaWVudCBjb2xvciAoSGV4fHJnYnxyZ2JhKVxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXG4gICAgICovXG4gICAgY29sb3I6IFtdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExvY2FsIGdyYWRpZW50XG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgbG9jYWwgPSB0cnVlXG4gICAgICovXG4gICAgbG9jYWw6IHRydWVcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBzdHlsZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIGJhclN0eWxlOiB7fSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMFxuICAgKi9cbiAgckxldmVsOiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMuYmFyQ29uZmlnID0gYmFyQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jb2xvckNvbmZpZyA9IHZvaWQgMDtcbnZhciBjb2xvckNvbmZpZyA9IFsnIzM3YTJkYScsICcjMzJjNWU5JywgJyM2N2UwZTMnLCAnIzlmZTZiOCcsICcjZmZkYjVjJywgJyNmZjlmN2YnLCAnI2ZiNzI5MycsICcjZTA2MmFlJywgJyNlNjkwZDEnLCAnI2U3YmNmMycsICcjOWQ5NmY1JywgJyM4Mzc4ZWEnLCAnIzk2YmZmZiddO1xuZXhwb3J0cy5jb2xvckNvbmZpZyA9IGNvbG9yQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nYXVnZUNvbmZpZyA9IHZvaWQgMDtcbnZhciBnYXVnZUNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyBnYXVnZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkaXVzIG9mIGdhdWdlXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByYWRpdXMgPSAnNjAlJ1xuICAgKiBAZXhhbXBsZSByYWRpdXMgPSAnNjAlJyB8IDEwMFxuICAgKi9cbiAgcmFkaXVzOiAnNjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENlbnRlciBwb2ludCBvZiBnYXVnZVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGNlbnRlciA9IFsnNTAlJywnNTAlJ11cbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cbiAgICovXG4gIGNlbnRlcjogWyc1MCUnLCAnNTAlJ10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBzdGFydCBhbmdsZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzdGFydEFuZ2xlID0gLShNYXRoLlBJIC8gNCkgKiA1XG4gICAqIEBleGFtcGxlIHN0YXJ0QW5nbGUgPSAtTWF0aC5QSVxuICAgKi9cbiAgc3RhcnRBbmdsZTogLShNYXRoLlBJIC8gNCkgKiA1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgZW5kIGFuZ2xlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGVuZEFuZ2xlID0gTWF0aC5QSSAvIDRcbiAgICogQGV4YW1wbGUgZW5kQW5nbGUgPSAwXG4gICAqL1xuICBlbmRBbmdsZTogTWF0aC5QSSAvIDQsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBtaW4gdmFsdWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbWluID0gMFxuICAgKi9cbiAgbWluOiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgbWF4IHZhbHVlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1heCA9IDEwMFxuICAgKi9cbiAgbWF4OiAxMDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBzcGxpdCBudW1iZXJcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3BsaXROdW0gPSA1XG4gICAqL1xuICBzcGxpdE51bTogNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGFyYyBsaW5lIHdpZHRoXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFyY0xpbmVXaWR0aCA9IDE1XG4gICAqL1xuICBhcmNMaW5lV2lkdGg6IDE1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBEYXRhIGl0ZW0gYXJjIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBkYXRhSXRlbVN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBkYXRhSXRlbVN0eWxlOiB7fSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzVGljazoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyB0aWNrXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBsZW5ndGhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHRpY2tMZW5ndGggPSA2XG4gICAgICovXG4gICAgdGlja0xlbmd0aDogNixcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjOTk5JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGF0YSAoQ2FuIGJlIGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSlcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgZGF0YSA9IFtOdW1iZXIuLi5dXG4gICAgICovXG4gICAgZGF0YTogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfSUnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGxhYmVsSXRlbSkgPT4gKGxhYmVsSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBnYXAgYmV0d2VlbiBsYWJlbCBhbmQgYXhpcyB0aWNrXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBsYWJlbEdhcCA9IDVcbiAgICAgKi9cbiAgICBsYWJlbEdhcDogNSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge31cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIHBvaW50ZXIgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgcG9pbnRlcjoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgcG9pbnRlclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBQb2ludGVyIHZhbHVlIGluZGV4IG9mIGRhdGFcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHZhbHVlSW5kZXggPSAwIChwb2ludGVyLnZhbHVlID0gZGF0YVswXS52YWx1ZSlcbiAgICAgKi9cbiAgICB2YWx1ZUluZGV4OiAwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFBvaW50ZXIgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzY2FsZTogWzEsIDFdLFxuICAgICAgZmlsbDogJyNmYjcyOTMnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBpdGVtIGFyYyBkZXRhaWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgZGV0YWlsczoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgZGV0YWlsc1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7bmFtZX0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIHBvc2l0aW9uIG9mZnNldFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBvZmZzZXQgPSBbMCwgMF1cbiAgICAgKiBAZXhhbXBsZSBvZmZzZXQgPSBbMTAsIDEwXVxuICAgICAqL1xuICAgIG9mZnNldDogWzAsIDBdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFZhbHVlIGZyYWN0aW9uYWwgcHJlY2lzaW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCB2YWx1ZVRvRml4ZWQgPSAwXG4gICAgICovXG4gICAgdmFsdWVUb0ZpeGVkOiAwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgcG9zaXRpb25cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ2NlbnRlcidcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICdzdGFydCcgfCAnY2VudGVyJyB8ICdlbmQnXG4gICAgICovXG4gICAgcG9zaXRpb246ICdjZW50ZXInLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmb250U2l6ZTogMjAsXG4gICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGJhY2tncm91bmQgYXJjIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGJhY2tncm91bmRBcmM6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGJhY2tncm91bmQgYXJjXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhY2tncm91bmQgYXJjIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2UwZTBlMCdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMuZ2F1Z2VDb25maWcgPSBnYXVnZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ3JpZENvbmZpZyA9IHZvaWQgMDtcbnZhciBncmlkQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgbGVmdCBtYXJnaW5cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGxlZnQgPSAnMTAlJ1xuICAgKiBAZXhhbXBsZSBsZWZ0ID0gJzEwJScgfCAxMFxuICAgKi9cbiAgbGVmdDogJzEwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIHJpZ2h0IG1hcmdpblxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcmlnaHQgPSAnMTAlJ1xuICAgKiBAZXhhbXBsZSByaWdodCA9ICcxMCUnIHwgMTBcbiAgICovXG4gIHJpZ2h0OiAnMTAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgdG9wIG1hcmdpblxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgdG9wID0gNjBcbiAgICogQGV4YW1wbGUgdG9wID0gJzEwJScgfCA2MFxuICAgKi9cbiAgdG9wOiA2MCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYm90dG9tIG1hcmdpblxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgYm90dG9tID0gNjBcbiAgICogQGV4YW1wbGUgYm90dG9tID0gJzEwJScgfCA2MFxuICAgKi9cbiAgYm90dG9tOiA2MCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBzdHlsZToge1xuICAgIGZpbGw6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR3JpZCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gLTMwXG4gICAqL1xuICByTGV2ZWw6IC0zMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiAzMFxufTtcbmV4cG9ydHMuZ3JpZENvbmZpZyA9IGdyaWRDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNoYW5nZURlZmF1bHRDb25maWcgPSBjaGFuZ2VEZWZhdWx0Q29uZmlnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiY29sb3JDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2NvbG9yLmNvbG9yQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdyaWRDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dyaWQuZ3JpZENvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ4QXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy54QXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ5QXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy55QXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0aXRsZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfdGl0bGUudGl0bGVDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGluZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGluZS5saW5lQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImJhckNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYmFyLmJhckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJwaWVDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3BpZS5waWVDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicmFkYXJBeGlzQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhckF4aXMucmFkYXJBeGlzQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhci5yYWRhckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnYXVnZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2F1Z2UuZ2F1Z2VDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGVnZW5kQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9sZWdlbmQubGVnZW5kQ29uZmlnO1xuICB9XG59KTtcbmV4cG9ydHMua2V5cyA9IHZvaWQgMDtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuXG52YXIgX2dyaWQgPSByZXF1aXJlKFwiLi9ncmlkXCIpO1xuXG52YXIgX2F4aXMgPSByZXF1aXJlKFwiLi9heGlzXCIpO1xuXG52YXIgX3RpdGxlID0gcmVxdWlyZShcIi4vdGl0bGVcIik7XG5cbnZhciBfbGluZSA9IHJlcXVpcmUoXCIuL2xpbmVcIik7XG5cbnZhciBfYmFyID0gcmVxdWlyZShcIi4vYmFyXCIpO1xuXG52YXIgX3BpZSA9IHJlcXVpcmUoXCIuL3BpZVwiKTtcblxudmFyIF9yYWRhckF4aXMgPSByZXF1aXJlKFwiLi9yYWRhckF4aXNcIik7XG5cbnZhciBfcmFkYXIgPSByZXF1aXJlKFwiLi9yYWRhclwiKTtcblxudmFyIF9nYXVnZSA9IHJlcXVpcmUoXCIuL2dhdWdlXCIpO1xuXG52YXIgX2xlZ2VuZCA9IHJlcXVpcmUoXCIuL2xlZ2VuZFwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbnZhciBhbGxDb25maWcgPSB7XG4gIGNvbG9yQ29uZmlnOiBfY29sb3IuY29sb3JDb25maWcsXG4gIGdyaWRDb25maWc6IF9ncmlkLmdyaWRDb25maWcsXG4gIHhBeGlzQ29uZmlnOiBfYXhpcy54QXhpc0NvbmZpZyxcbiAgeUF4aXNDb25maWc6IF9heGlzLnlBeGlzQ29uZmlnLFxuICB0aXRsZUNvbmZpZzogX3RpdGxlLnRpdGxlQ29uZmlnLFxuICBsaW5lQ29uZmlnOiBfbGluZS5saW5lQ29uZmlnLFxuICBiYXJDb25maWc6IF9iYXIuYmFyQ29uZmlnLFxuICBwaWVDb25maWc6IF9waWUucGllQ29uZmlnLFxuICByYWRhckF4aXNDb25maWc6IF9yYWRhckF4aXMucmFkYXJBeGlzQ29uZmlnLFxuICByYWRhckNvbmZpZzogX3JhZGFyLnJhZGFyQ29uZmlnLFxuICBnYXVnZUNvbmZpZzogX2dhdWdlLmdhdWdlQ29uZmlnLFxuICBsZWdlbmRDb25maWc6IF9sZWdlbmQubGVnZW5kQ29uZmlnXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ2hhbmdlIGRlZmF1bHQgY29uZmlndXJhdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5ICAgICAgICAgIENvbmZpZ3VyYXRpb24ga2V5XG4gICAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjb25maWcgWW91ciBjb25maWdcbiAgICogQHJldHVybiB7VW5kZWZpbmVkfSBObyByZXR1cm5cbiAgICovXG5cbn07XG5cbmZ1bmN0aW9uIGNoYW5nZURlZmF1bHRDb25maWcoa2V5LCBjb25maWcpIHtcbiAgaWYgKCFhbGxDb25maWdbXCJcIi5jb25jYXQoa2V5LCBcIkNvbmZpZ1wiKV0pIHtcbiAgICBjb25zb2xlLndhcm4oJ0NoYW5nZSBkZWZhdWx0IGNvbmZpZyBFcnJvciAtIEludmFsaWQga2V5IScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gICgwLCBfdXRpbC5kZWVwTWVyZ2UpKGFsbENvbmZpZ1tcIlwiLmNvbmNhdChrZXksIFwiQ29uZmlnXCIpXSwgY29uZmlnKTtcbn1cblxudmFyIGtleXMgPSBbJ2NvbG9yJywgJ3RpdGxlJywgJ2xlZ2VuZCcsICd4QXhpcycsICd5QXhpcycsICdncmlkJywgJ3JhZGFyQXhpcycsICdsaW5lJywgJ2JhcicsICdwaWUnLCAncmFkYXInLCAnZ2F1Z2UnXTtcbmV4cG9ydHMua2V5cyA9IGtleXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmxlZ2VuZENvbmZpZyA9IHZvaWQgMDtcbnZhciBsZWdlbmRDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGxlZ2VuZFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgb3JpZW50XG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG9yaWVudCA9ICdob3Jpem9udGFsJ1xuICAgKiBAZXhhbXBsZSBvcmllbnQgPSAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnXG4gICAqL1xuICBvcmllbnQ6ICdob3Jpem9udGFsJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBsZWZ0XG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBsZWZ0ID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIGxlZnQgPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICBsZWZ0OiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgcmlnaHRcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJpZ2h0ID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIHJpZ2h0ID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxuICAgKi9cbiAgcmlnaHQ6ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCB0b3BcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHRvcCA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSB0b3AgPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICB0b3A6ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBib3R0b21cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGJvdHRvbSA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSBib3R0b20gPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICBib3R0b206ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBpdGVtIGdhcFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpdGVtR2FwID0gMTBcbiAgICovXG4gIGl0ZW1HYXA6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gSWNvbiB3aWR0aFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpY29uV2lkdGggPSAyNVxuICAgKi9cbiAgaWNvbldpZHRoOiAyNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEljb24gaGVpZ2h0XG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGljb25IZWlnaHQgPSAxMFxuICAgKi9cbiAgaWNvbkhlaWdodDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIGxlZ2VuZCBpcyBvcHRpb25hbFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2VsZWN0QWJsZSA9IHRydWVcbiAgICovXG4gIHNlbGVjdEFibGU6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgdGV4dCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHRleHRTdHlsZToge1xuICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgZm9udFNpemU6IDEzLFxuICAgIGZpbGw6ICcjMDAwJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGljb24gZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBpY29uU3R5bGU6IHt9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHRleHQgdW5zZWxlY3RlZCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHRleHRVbnNlbGVjdGVkU3R5bGU6IHtcbiAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgIGZvbnRTaXplOiAxMyxcbiAgICBmaWxsOiAnIzk5OSdcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBpY29uIHVuc2VsZWN0ZWQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBpY29uVW5zZWxlY3RlZFN0eWxlOiB7XG4gICAgZmlsbDogJyM5OTknXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDIwXG4gICAqL1xuICByTGV2ZWw6IDIwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMubGVnZW5kQ29uZmlnID0gbGVnZW5kQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5saW5lQ29uZmlnID0gdm9pZCAwO1xudmFyIGxpbmVDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgbGluZSBjaGFydFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBzdGFja2luZ1xuICAgKiBUaGUgZGF0YSB2YWx1ZSBvZiB0aGUgc2VyaWVzIGVsZW1lbnQgb2YgdGhlIHNhbWUgc3RhY2tcbiAgICogd2lsbCBiZSBzdXBlcmltcG9zZWQgKHRoZSBsYXR0ZXIgdmFsdWUgd2lsbCBiZSBzdXBlcmltcG9zZWQgb24gdGhlIHByZXZpb3VzIHZhbHVlKVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBzdGFjayA9ICcnXG4gICAqL1xuICBzdGFjazogJycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBTbW9vdGggbGluZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc21vb3RoID0gZmFsc2VcbiAgICovXG4gIHNtb290aDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHggYXhpcyBpbmRleFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB4QXhpc0luZGV4ID0gMFxuICAgKiBAZXhhbXBsZSB4QXhpc0luZGV4ID0gMCB8IDFcbiAgICovXG4gIHhBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHkgYXhpcyBpbmRleFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB5QXhpc0luZGV4ID0gMFxuICAgKiBAZXhhbXBsZSB5QXhpc0luZGV4ID0gMCB8IDFcbiAgICovXG4gIHlBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGNoYXJ0IGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICogQGV4YW1wbGUgZGF0YSA9IFsxMDAsIDIwMCwgMzAwXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgbGluZVN0eWxlOiB7XG4gICAgbGluZVdpZHRoOiAxXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxpbmVQb2ludDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgbGluZSBwb2ludFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IHJhZGl1c1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgcmFkaXVzID0gMlxuICAgICAqL1xuICAgIHJhZGl1czogMixcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBhcmVhIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxpbmVBcmVhOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBsaW5lIGFyZWFcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFyZWEgZ3JhZGllbnQgY29sb3IgKEhleHxyZ2J8cmdiYSlcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnQgPSBbXVxuICAgICAqL1xuICAgIGdyYWRpZW50OiBbXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFyZWEgc3R5bGUgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBvcGFjaXR5OiAwLjVcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBsaW5lIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBwb3NpdGlvblxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcG9zaXRpb24gPSAndG9wJ1xuICAgICAqIEBleGFtcGxlIHBvc2l0aW9uID0gJ3RvcCcgfCAnY2VudGVyJyB8ICdib3R0b20nXG4gICAgICovXG4gICAgcG9zaXRpb246ICd0b3AnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgbGFiZWwgb2Zmc2V0XG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAtMTBdXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgLTEwXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV95Lu2J1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmxpbmVDb25maWcgPSBsaW5lQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5waWVDb25maWcgPSB2b2lkIDA7XG52YXIgcGllQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIHBpZSBjaGFydFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkaXVzIG9mIHBpZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcmFkaXVzID0gJzUwJSdcbiAgICogQGV4YW1wbGUgcmFkaXVzID0gJzUwJScgfCAxMDBcbiAgICovXG4gIHJhZGl1czogJzUwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDZW50ZXIgcG9pbnQgb2YgcGllXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgY2VudGVyID0gWyc1MCUnLCc1MCUnXVxuICAgKiBAZXhhbXBsZSBjZW50ZXIgPSBbJzUwJScsJzUwJSddIHwgWzEwMCwgMTAwXVxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBjaGFydCBzdGFydCBhbmdsZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzdGFydEFuZ2xlID0gLU1hdGguUEkgLyAyXG4gICAqIEBleGFtcGxlIHN0YXJ0QW5nbGUgPSAtTWF0aC5QSVxuICAgKi9cbiAgc3RhcnRBbmdsZTogLU1hdGguUEkgLyAyLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgcm9zZSB0eXBlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCByb3NlVHlwZSA9IGZhbHNlXG4gICAqL1xuICByb3NlVHlwZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBdXRvbWF0aWMgc29ydGluZyBpbiByb3NlIHR5cGVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHJvc2VTb3J0ID0gdHJ1ZVxuICAgKi9cbiAgcm9zZVNvcnQ6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSb3NlIHJhZGl1cyBpbmNyZWFzaW5nXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByb3NlSW5jcmVtZW50ID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIHJvc2VJbmNyZW1lbnQgPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICByb3NlSW5jcmVtZW50OiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgaW5zaWRlIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGluc2lkZUxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBpbnNpZGUgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9ICd7cGVyY2VudH0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICcke25hbWV9LXt2YWx1ZX0te3BlcmNlbnR9JSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS5uYW1lKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogJ3twZXJjZW50fSUnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgT3V0c2lkZSBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBvdXRzaWRlTGFiZWw6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IG91dHNpZGUgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gJ3tuYW1lfSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAnJHtuYW1lfS17dmFsdWV9LXtwZXJjZW50fSUnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0ubmFtZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6ICd7bmFtZX0nLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDExXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBHYXAgYmV0ZWVuIGxhYmVsIGxpbmUgYmVuZGVkIHBsYWNlIGFuZCBwaWVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBsYWJlbExpbmVCZW5kR2FwID0gJzIwJSdcbiAgICAgKiBAZXhhbXBsZSBsYWJlbExpbmVCZW5kR2FwID0gJzIwJScgfCAyMFxuICAgICAqL1xuICAgIGxhYmVsTGluZUJlbmRHYXA6ICcyMCUnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGxpbmUgZW5kIGxlbmd0aFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgbGFiZWxMaW5lRW5kTGVuZ3RoID0gNTBcbiAgICAgKi9cbiAgICBsYWJlbExpbmVFbmRMZW5ndGg6IDUwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIGxhYmVsTGluZVN0eWxlOiB7XG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBwaWVTdHlsZToge30sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQZXJjZW50YWdlIGZyYWN0aW9uYWwgcHJlY2lzaW9uXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHBlcmNlbnRUb0ZpeGVkID0gMFxuICAgKi9cbiAgcGVyY2VudFRvRml4ZWQ6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXG4gICAqL1xuICByTGV2ZWw6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGRlbGF5IGdhcFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25EZWxheUdhcCA9IDYwXG4gICAqL1xuICBhbmltYXRpb25EZWxheUdhcDogNjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBzdGFydCBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgc3RhcnRBbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0QmFjaydcbiAgICovXG4gIHN0YXJ0QW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0QmFjaycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMucGllQ29uZmlnID0gcGllQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yYWRhckNvbmZpZyA9IHZvaWQgMDtcbnZhciByYWRhckNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyByYWRhclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKiBAZXhhbXBsZSBkYXRhID0gWzEwMCwgMjAwLCAzMDBdXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgcmFkYXJTdHlsZToge1xuICAgIGxpbmVXaWR0aDogMVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgcG9pbnQgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgcG9pbnQ6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHJhZGFyIHBvaW50XG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFBvaW50IHJhZGl1c1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgcmFkaXVzID0gMlxuICAgICAqL1xuICAgIHJhZGl1czogMixcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBSYWRhciBwb2ludCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjZmZmJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSByYWRhciBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBwb3NpdGlvbiBvZmZzZXRcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIDBdXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgMF0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIHJhZGFyXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBsYWJlbEdhcCA9IDVcbiAgICAgKi9cbiAgICBsYWJlbEdhcDogNSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAnU2NvcmUte3ZhbHVlfSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAobGFiZWwpID0+IChsYWJlbClcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmb250U2l6ZTogMTBcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW5lOiA1MFxufTtcbmV4cG9ydHMucmFkYXJDb25maWcgPSByYWRhckNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXJBeGlzQ29uZmlnID0gdm9pZCAwO1xudmFyIHJhZGFyQXhpc0NvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyByYWRhciBheGlzXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENlbnRlciBwb2ludCBvZiByYWRhciBheGlzXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgY2VudGVyID0gWyc1MCUnLCc1MCUnXVxuICAgKiBAZXhhbXBsZSBjZW50ZXIgPSBbJzUwJScsJzUwJSddIHwgWzEwMCwgMTAwXVxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGl1cyBvZiByYWRhciBheGlzXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByYWRpdXMgPSAnNjUlJ1xuICAgKiBAZXhhbXBsZSByYWRpdXMgPSAnNjUlJyB8IDEwMFxuICAgKi9cbiAgcmFkaXVzOiAnNjUlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgc3RhcnQgYW5nbGVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3RhcnRBbmdsZSA9IC1NYXRoLlBJIC8gMlxuICAgKiBAZXhhbXBsZSBzdGFydEFuZ2xlID0gLU1hdGguUElcbiAgICovXG4gIHN0YXJ0QW5nbGU6IC1NYXRoLlBJIC8gMixcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgc3BsaXQgbnVtYmVyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHNwbGl0TnVtID0gNVxuICAgKi9cbiAgc3BsaXROdW06IDUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBwb2x5Z29uIHJhZGFyIGF4aXNcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHBvbHlnb24gPSBmYWxzZVxuICAgKi9cbiAgcG9seWdvbjogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBnYXAgYmV0d2VlbiBsYWJlbCBhbmQgcmFkYXIgYXhpc1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgbGFiZWxHYXAgPSAxNVxuICAgICAqL1xuICAgIGxhYmVsR2FwOiAxNSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBjb2xvciAoSGV4fHJnYnxyZ2JhKSwgd2lsbCBjb3ZlciBzdHlsZS5maWxsXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjMzMzJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGluZToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyM5OTknLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gU3BsaXQgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBzcGxpdExpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHNwbGl0IGxpbmVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBjb2xvciAoSGV4fHJnYnxyZ2JhKSwgd2lsbCBjb3ZlciBzdHlsZS5zdHJva2VcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgY29sb3IgPSBbXVxuICAgICAqL1xuICAgIGNvbG9yOiBbXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBTcGxpdCBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2Q0ZDRkNCcsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBTcGxpdCBhcmVhIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHNwbGl0QXJlYToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgc3BsaXQgYXJlYVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEFyZWEgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogWycjZjVmNWY1JywgJyNlNmU2ZTYnXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBTcGxpdCBhcmVhIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge31cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gLTEwXG4gICAqL1xuICByTGV2ZWw6IC0xMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW5lOiA1MFxufTtcbmV4cG9ydHMucmFkYXJBeGlzQ29uZmlnID0gcmFkYXJBeGlzQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50aXRsZUNvbmZpZyA9IHZvaWQgMDtcbnZhciB0aXRsZUNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGl0bGVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgdGV4dFxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCB0ZXh0ID0gJydcbiAgICovXG4gIHRleHQ6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgb2Zmc2V0XG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIC0yMF1cbiAgICovXG4gIG9mZnNldDogWzAsIC0yMF0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHN0eWxlOiB7XG4gICAgZmlsbDogJyMzMzMnLFxuICAgIGZvbnRTaXplOiAxNyxcbiAgICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMjBcbiAgICovXG4gIHJMZXZlbDogMjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMudGl0bGVDb25maWcgPSB0aXRsZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmF4aXMgPSBheGlzO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbnZhciBheGlzQ29uZmlnID0ge1xuICB4QXhpc0NvbmZpZzogX2NvbmZpZy54QXhpc0NvbmZpZyxcbiAgeUF4aXNDb25maWc6IF9jb25maWcueUF4aXNDb25maWdcbn07XG52YXIgbWluID0gTWF0aC5taW4sXG4gICAgbWF4ID0gTWF0aC5tYXgsXG4gICAgYWJzID0gTWF0aC5hYnMsXG4gICAgcG93ID0gTWF0aC5wb3c7XG5cbmZ1bmN0aW9uIGF4aXMoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciB4QXhpcyA9IG9wdGlvbi54QXhpcyxcbiAgICAgIHlBeGlzID0gb3B0aW9uLnlBeGlzLFxuICAgICAgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgdmFyIGFsbEF4aXMgPSBbXTtcblxuICBpZiAoeEF4aXMgJiYgeUF4aXMgJiYgc2VyaWVzKSB7XG4gICAgYWxsQXhpcyA9IGdldEFsbEF4aXMoeEF4aXMsIHlBeGlzKTtcbiAgICBhbGxBeGlzID0gbWVyZ2VEZWZhdWx0QXhpc0NvbmZpZyhhbGxBeGlzKTtcbiAgICBhbGxBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBzaG93ID0gX3JlZi5zaG93O1xuICAgICAgcmV0dXJuIHNob3c7XG4gICAgfSk7XG4gICAgYWxsQXhpcyA9IG1lcmdlRGVmYXVsdEJvdW5kYXJ5R2FwKGFsbEF4aXMpO1xuICAgIGFsbEF4aXMgPSBjYWxjQXhpc0xhYmVsRGF0YShhbGxBeGlzLCBzZXJpZXMpO1xuICAgIGFsbEF4aXMgPSBzZXRBeGlzUG9zaXRpb24oYWxsQXhpcyk7XG4gICAgYWxsQXhpcyA9IGNhbGNBeGlzTGluZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KTtcbiAgICBhbGxBeGlzID0gY2FsY0F4aXNUaWNrUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpO1xuICAgIGFsbEF4aXMgPSBjYWxjQXhpc05hbWVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCk7XG4gICAgYWxsQXhpcyA9IGNhbGNTcGxpdExpbmVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ2F4aXNMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGluZUNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYWxsQXhpcyxcbiAgICBrZXk6ICdheGlzVGljaycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFRpY2tDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnYXhpc0xhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGFiZWxDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnYXhpc05hbWUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXROYW1lQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ3NwbGl0TGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFNwbGl0TGluZUNvbmZpZ1xuICB9KTtcbiAgY2hhcnQuYXhpc0RhdGEgPSBhbGxBeGlzO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxBeGlzKHhBeGlzLCB5QXhpcykge1xuICB2YXIgYWxsWEF4aXMgPSBbXSxcbiAgICAgIGFsbFlBeGlzID0gW107XG5cbiAgaWYgKHhBeGlzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICB2YXIgX2FsbFhBeGlzO1xuXG4gICAgKF9hbGxYQXhpcyA9IGFsbFhBeGlzKS5wdXNoLmFwcGx5KF9hbGxYQXhpcywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh4QXhpcykpO1xuICB9IGVsc2Uge1xuICAgIGFsbFhBeGlzLnB1c2goeEF4aXMpO1xuICB9XG5cbiAgaWYgKHlBeGlzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICB2YXIgX2FsbFlBeGlzO1xuXG4gICAgKF9hbGxZQXhpcyA9IGFsbFlBeGlzKS5wdXNoLmFwcGx5KF9hbGxZQXhpcywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh5QXhpcykpO1xuICB9IGVsc2Uge1xuICAgIGFsbFlBeGlzLnB1c2goeUF4aXMpO1xuICB9XG5cbiAgYWxsWEF4aXMuc3BsaWNlKDIpO1xuICBhbGxZQXhpcy5zcGxpY2UoMik7XG4gIGFsbFhBeGlzID0gYWxsWEF4aXMubWFwKGZ1bmN0aW9uIChheGlzLCBpKSB7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXMsIHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgYXhpczogJ3gnXG4gICAgfSk7XG4gIH0pO1xuICBhbGxZQXhpcyA9IGFsbFlBeGlzLm1hcChmdW5jdGlvbiAoYXhpcywgaSkge1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIGF4aXM6ICd5J1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFsbFhBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhbGxZQXhpcykpO1xufVxuXG5mdW5jdGlvbiBtZXJnZURlZmF1bHRBeGlzQ29uZmlnKGFsbEF4aXMpIHtcbiAgdmFyIHhBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmMi5heGlzO1xuICAgIHJldHVybiBheGlzID09PSAneCc7XG4gIH0pO1xuICB2YXIgeUF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYzLmF4aXM7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd5JztcbiAgfSk7XG4gIHhBeGlzID0geEF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKCgwLCBfdXRpbDIuZGVlcENsb25lKShfY29uZmlnLnhBeGlzQ29uZmlnKSwgYXhpcyk7XG4gIH0pO1xuICB5QXhpcyA9IHlBeGlzLm1hcChmdW5jdGlvbiAoYXhpcykge1xuICAgIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSgoMCwgX3V0aWwyLmRlZXBDbG9uZSkoX2NvbmZpZy55QXhpc0NvbmZpZyksIGF4aXMpO1xuICB9KTtcbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHhBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh5QXhpcykpO1xufVxuXG5mdW5jdGlvbiBtZXJnZURlZmF1bHRCb3VuZGFyeUdhcChhbGxBeGlzKSB7XG4gIHZhciB2YWx1ZUF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjQpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY0LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgPT09ICd2YWx1ZSc7XG4gIH0pO1xuICB2YXIgbGFiZWxBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmNS5kYXRhO1xuICAgIHJldHVybiBkYXRhICE9PSAndmFsdWUnO1xuICB9KTtcbiAgdmFsdWVBeGlzLmZvckVhY2goZnVuY3Rpb24gKGF4aXMpIHtcbiAgICBpZiAodHlwZW9mIGF4aXMuYm91bmRhcnlHYXAgPT09ICdib29sZWFuJykgcmV0dXJuO1xuICAgIGF4aXMuYm91bmRhcnlHYXAgPSBmYWxzZTtcbiAgfSk7XG4gIGxhYmVsQXhpcy5mb3JFYWNoKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgaWYgKHR5cGVvZiBheGlzLmJvdW5kYXJ5R2FwID09PSAnYm9vbGVhbicpIHJldHVybjtcbiAgICBheGlzLmJvdW5kYXJ5R2FwID0gdHJ1ZTtcbiAgfSk7XG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh2YWx1ZUF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhYmVsQXhpcykpO1xufVxuXG5mdW5jdGlvbiBjYWxjQXhpc0xhYmVsRGF0YShhbGxBeGlzLCBzZXJpZXMpIHtcbiAgdmFyIHZhbHVlQXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNikge1xuICAgIHZhciBkYXRhID0gX3JlZjYuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhciBsYWJlbEF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY3LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgaW5zdGFuY2VvZiBBcnJheTtcbiAgfSk7XG4gIHZhbHVlQXhpcyA9IGNhbGNWYWx1ZUF4aXNMYWJlbERhdGEodmFsdWVBeGlzLCBzZXJpZXMpO1xuICBsYWJlbEF4aXMgPSBjYWxjTGFiZWxBeGlzTGFiZWxEYXRhKGxhYmVsQXhpcyk7XG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh2YWx1ZUF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhYmVsQXhpcykpO1xufVxuXG5mdW5jdGlvbiBjYWxjVmFsdWVBeGlzTGFiZWxEYXRhKHZhbHVlQXhpcywgc2VyaWVzKSB7XG4gIHJldHVybiB2YWx1ZUF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgdmFyIG1pbk1heFZhbHVlID0gZ2V0VmFsdWVBeGlzTWF4TWluVmFsdWUoYXhpcywgc2VyaWVzKTtcblxuICAgIHZhciBfZ2V0VHJ1ZU1pbk1heCA9IGdldFRydWVNaW5NYXgoYXhpcywgbWluTWF4VmFsdWUpLFxuICAgICAgICBfZ2V0VHJ1ZU1pbk1heDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldFRydWVNaW5NYXgsIDIpLFxuICAgICAgICBtaW4gPSBfZ2V0VHJ1ZU1pbk1heDJbMF0sXG4gICAgICAgIG1heCA9IF9nZXRUcnVlTWluTWF4MlsxXTtcblxuICAgIHZhciBpbnRlcnZhbCA9IGdldFZhbHVlSW50ZXJ2YWwobWluLCBtYXgsIGF4aXMpO1xuICAgIHZhciBmb3JtYXR0ZXIgPSBheGlzLmF4aXNMYWJlbC5mb3JtYXR0ZXI7XG4gICAgdmFyIGxhYmVsID0gW107XG5cbiAgICBpZiAobWluTWF4VmFsdWVbMF0gPT09IG1pbk1heFZhbHVlWzFdKSB7XG4gICAgICBsYWJlbCA9IG1pbk1heFZhbHVlO1xuICAgIH0gZWxzZSBpZiAobWluIDwgMCAmJiBtYXggPiAwKSB7XG4gICAgICBsYWJlbCA9IGdldFZhbHVlQXhpc0xhYmVsRnJvbVplcm8obWluLCBtYXgsIGludGVydmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFiZWwgPSBnZXRWYWx1ZUF4aXNMYWJlbEZyb21NaW4obWluLCBtYXgsIGludGVydmFsKTtcbiAgICB9XG5cbiAgICBsYWJlbCA9IGxhYmVsLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobC50b0ZpeGVkKDIpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpcywge1xuICAgICAgbWF4VmFsdWU6IGxhYmVsLnNsaWNlKC0xKVswXSxcbiAgICAgIG1pblZhbHVlOiBsYWJlbFswXSxcbiAgICAgIGxhYmVsOiBnZXRBZnRlckZvcm1hdHRlckxhYmVsKGxhYmVsLCBmb3JtYXR0ZXIpXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUF4aXNNYXhNaW5WYWx1ZShheGlzLCBzZXJpZXMpIHtcbiAgc2VyaWVzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgc2hvdyA9IF9yZWY4LnNob3csXG4gICAgICAgIHR5cGUgPSBfcmVmOC50eXBlO1xuICAgIGlmIChzaG93ID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlID09PSAncGllJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbiAgaWYgKHNlcmllcy5sZW5ndGggPT09IDApIHJldHVybiBbMCwgMF07XG4gIHZhciBpbmRleCA9IGF4aXMuaW5kZXgsXG4gICAgICBheGlzVHlwZSA9IGF4aXMuYXhpcztcbiAgc2VyaWVzID0gbWVyZ2VTdGFja0RhdGEoc2VyaWVzKTtcbiAgdmFyIGF4aXNOYW1lID0gYXhpc1R5cGUgKyAnQXhpcyc7XG4gIHZhciB2YWx1ZVNlcmllcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gc1theGlzTmFtZV0gPT09IGluZGV4O1xuICB9KTtcbiAgaWYgKCF2YWx1ZVNlcmllcy5sZW5ndGgpIHZhbHVlU2VyaWVzID0gc2VyaWVzO1xuICByZXR1cm4gZ2V0U2VyaWVzTWluTWF4VmFsdWUodmFsdWVTZXJpZXMpO1xufVxuXG5mdW5jdGlvbiBnZXRTZXJpZXNNaW5NYXhWYWx1ZShzZXJpZXMpIHtcbiAgaWYgKCFzZXJpZXMpIHJldHVybjtcbiAgdmFyIG1pblZhbHVlID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzZXJpZXMubWFwKGZ1bmN0aW9uIChfcmVmOSkge1xuICAgIHZhciBkYXRhID0gX3JlZjkuZGF0YTtcbiAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSgoMCwgX3V0aWwuZmlsdGVyTm9uTnVtYmVyKShkYXRhKSkpO1xuICB9KSkpO1xuICB2YXIgbWF4VmFsdWUgPSBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNlcmllcy5tYXAoZnVuY3Rpb24gKF9yZWYxMCkge1xuICAgIHZhciBkYXRhID0gX3JlZjEwLmRhdGE7XG4gICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoKDAsIF91dGlsLmZpbHRlck5vbk51bWJlcikoZGF0YSkpKTtcbiAgfSkpKTtcbiAgcmV0dXJuIFttaW5WYWx1ZSwgbWF4VmFsdWVdO1xufVxuXG5mdW5jdGlvbiBtZXJnZVN0YWNrRGF0YShzZXJpZXMpIHtcbiAgdmFyIHNlcmllc0Nsb25lZCA9ICgwLCBfdXRpbDIuZGVlcENsb25lKShzZXJpZXMsIHRydWUpO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHZhciBkYXRhID0gKDAsIF91dGlsLm1lcmdlU2FtZVN0YWNrRGF0YSkoaXRlbSwgc2VyaWVzKTtcbiAgICBzZXJpZXNDbG9uZWRbaV0uZGF0YSA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gc2VyaWVzQ2xvbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlTWluTWF4KF9yZWYxMSwgX3JlZjEyKSB7XG4gIHZhciBtaW4gPSBfcmVmMTEubWluLFxuICAgICAgbWF4ID0gX3JlZjExLm1heCxcbiAgICAgIGF4aXMgPSBfcmVmMTEuYXhpcztcblxuICB2YXIgX3JlZjEzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMiwgMiksXG4gICAgICBtaW5WYWx1ZSA9IF9yZWYxM1swXSxcbiAgICAgIG1heFZhbHVlID0gX3JlZjEzWzFdO1xuXG4gIHZhciBtaW5UeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkobWluKSxcbiAgICAgIG1heFR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShtYXgpO1xuXG4gIGlmICghdGVzdE1pbk1heFR5cGUobWluKSkge1xuICAgIG1pbiA9IGF4aXNDb25maWdbYXhpcyArICdBeGlzQ29uZmlnJ10ubWluO1xuICAgIG1pblR5cGUgPSAnc3RyaW5nJztcbiAgfVxuXG4gIGlmICghdGVzdE1pbk1heFR5cGUobWF4KSkge1xuICAgIG1heCA9IGF4aXNDb25maWdbYXhpcyArICdBeGlzQ29uZmlnJ10ubWF4O1xuICAgIG1heFR5cGUgPSAnc3RyaW5nJztcbiAgfVxuXG4gIGlmIChtaW5UeXBlID09PSAnc3RyaW5nJykge1xuICAgIG1pbiA9IHBhcnNlSW50KG1pblZhbHVlIC0gYWJzKG1pblZhbHVlICogcGFyc2VGbG9hdChtaW4pIC8gMTAwKSk7XG4gICAgdmFyIGxldmVyID0gZ2V0VmFsdWVMZXZlcihtaW4pO1xuICAgIG1pbiA9IHBhcnNlRmxvYXQoKG1pbiAvIGxldmVyIC0gMC4xKS50b0ZpeGVkKDEpKSAqIGxldmVyO1xuICB9XG5cbiAgaWYgKG1heFR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbWF4ID0gcGFyc2VJbnQobWF4VmFsdWUgKyBhYnMobWF4VmFsdWUgKiBwYXJzZUZsb2F0KG1heCkgLyAxMDApKTtcblxuICAgIHZhciBfbGV2ZXIgPSBnZXRWYWx1ZUxldmVyKG1heCk7XG5cbiAgICBtYXggPSBwYXJzZUZsb2F0KChtYXggLyBfbGV2ZXIgKyAwLjEpLnRvRml4ZWQoMSkpICogX2xldmVyO1xuICB9XG5cbiAgcmV0dXJuIFttaW4sIG1heF07XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlTGV2ZXIodmFsdWUpIHtcbiAgdmFyIHZhbHVlU3RyaW5nID0gYWJzKHZhbHVlKS50b1N0cmluZygpO1xuICB2YXIgdmFsdWVMZW5ndGggPSB2YWx1ZVN0cmluZy5sZW5ndGg7XG4gIHZhciBmaXJzdFplcm9JbmRleCA9IHZhbHVlU3RyaW5nLnJlcGxhY2UoLzAqJC9nLCAnJykuaW5kZXhPZignMCcpO1xuICB2YXIgcG93MTBOdW0gPSB2YWx1ZUxlbmd0aCAtIDE7XG4gIGlmIChmaXJzdFplcm9JbmRleCAhPT0gLTEpIHBvdzEwTnVtIC09IGZpcnN0WmVyb0luZGV4O1xuICByZXR1cm4gcG93KDEwLCBwb3cxME51bSk7XG59XG5cbmZ1bmN0aW9uIHRlc3RNaW5NYXhUeXBlKHZhbCkge1xuICB2YXIgdmFsVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHZhbCk7XG4gIHZhciBpc1ZhbGlkU3RyaW5nID0gdmFsVHlwZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJSQvLnRlc3QodmFsKTtcbiAgdmFyIGlzVmFsaWROdW1iZXIgPSB2YWxUeXBlID09PSAnbnVtYmVyJztcbiAgcmV0dXJuIGlzVmFsaWRTdHJpbmcgfHwgaXNWYWxpZE51bWJlcjtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVBeGlzTGFiZWxGcm9tWmVybyhtaW4sIG1heCwgaW50ZXJ2YWwpIHtcbiAgdmFyIG5lZ2F0aXZlID0gW10sXG4gICAgICBwb3NpdGl2ZSA9IFtdO1xuICB2YXIgY3VycmVudE5lZ2F0aXZlID0gMCxcbiAgICAgIGN1cnJlbnRQb3NpdGl2ZSA9IDA7XG5cbiAgZG8ge1xuICAgIG5lZ2F0aXZlLnB1c2goY3VycmVudE5lZ2F0aXZlIC09IGludGVydmFsKTtcbiAgfSB3aGlsZSAoY3VycmVudE5lZ2F0aXZlID4gbWluKTtcblxuICBkbyB7XG4gICAgcG9zaXRpdmUucHVzaChjdXJyZW50UG9zaXRpdmUgKz0gaW50ZXJ2YWwpO1xuICB9IHdoaWxlIChjdXJyZW50UG9zaXRpdmUgPCBtYXgpO1xuXG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZWdhdGl2ZS5yZXZlcnNlKCkpLCBbMF0sICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpdmUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVBeGlzTGFiZWxGcm9tTWluKG1pbiwgbWF4LCBpbnRlcnZhbCkge1xuICB2YXIgbGFiZWwgPSBbbWluXSxcbiAgICAgIGN1cnJlbnRWYWx1ZSA9IG1pbjtcblxuICBkbyB7XG4gICAgbGFiZWwucHVzaChjdXJyZW50VmFsdWUgKz0gaW50ZXJ2YWwpO1xuICB9IHdoaWxlIChjdXJyZW50VmFsdWUgPCBtYXgpO1xuXG4gIHJldHVybiBsYWJlbDtcbn1cblxuZnVuY3Rpb24gZ2V0QWZ0ZXJGb3JtYXR0ZXJMYWJlbChsYWJlbCwgZm9ybWF0dGVyKSB7XG4gIGlmICghZm9ybWF0dGVyKSByZXR1cm4gbGFiZWw7XG4gIGlmICh0eXBlb2YgZm9ybWF0dGVyID09PSAnc3RyaW5nJykgbGFiZWwgPSBsYWJlbC5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCBsKTtcbiAgfSk7XG4gIGlmICh0eXBlb2YgZm9ybWF0dGVyID09PSAnZnVuY3Rpb24nKSBsYWJlbCA9IGxhYmVsLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlcih7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBpbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBsYWJlbDtcbn1cblxuZnVuY3Rpb24gY2FsY0xhYmVsQXhpc0xhYmVsRGF0YShsYWJlbEF4aXMpIHtcbiAgcmV0dXJuIGxhYmVsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICB2YXIgZGF0YSA9IGF4aXMuZGF0YSxcbiAgICAgICAgZm9ybWF0dGVyID0gYXhpcy5heGlzTGFiZWwuZm9ybWF0dGVyO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBsYWJlbDogZ2V0QWZ0ZXJGb3JtYXR0ZXJMYWJlbChkYXRhLCBmb3JtYXR0ZXIpXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUludGVydmFsKG1pbiwgbWF4LCBheGlzKSB7XG4gIHZhciBpbnRlcnZhbCA9IGF4aXMuaW50ZXJ2YWwsXG4gICAgICBtaW5JbnRlcnZhbCA9IGF4aXMubWluSW50ZXJ2YWwsXG4gICAgICBtYXhJbnRlcnZhbCA9IGF4aXMubWF4SW50ZXJ2YWwsXG4gICAgICBzcGxpdE51bWJlciA9IGF4aXMuc3BsaXROdW1iZXIsXG4gICAgICBheGlzVHlwZSA9IGF4aXMuYXhpcztcbiAgdmFyIGNvbmZpZyA9IGF4aXNDb25maWdbYXhpc1R5cGUgKyAnQXhpc0NvbmZpZyddO1xuICBpZiAodHlwZW9mIGludGVydmFsICE9PSAnbnVtYmVyJykgaW50ZXJ2YWwgPSBjb25maWcuaW50ZXJ2YWw7XG4gIGlmICh0eXBlb2YgbWluSW50ZXJ2YWwgIT09ICdudW1iZXInKSBtaW5JbnRlcnZhbCA9IGNvbmZpZy5taW5JbnRlcnZhbDtcbiAgaWYgKHR5cGVvZiBtYXhJbnRlcnZhbCAhPT0gJ251bWJlcicpIG1heEludGVydmFsID0gY29uZmlnLm1heEludGVydmFsO1xuICBpZiAodHlwZW9mIHNwbGl0TnVtYmVyICE9PSAnbnVtYmVyJykgc3BsaXROdW1iZXIgPSBjb25maWcuc3BsaXROdW1iZXI7XG4gIGlmICh0eXBlb2YgaW50ZXJ2YWwgPT09ICdudW1iZXInKSByZXR1cm4gaW50ZXJ2YWw7XG4gIHZhciB2YWx1ZUludGVydmFsID0gcGFyc2VJbnQoKG1heCAtIG1pbikgLyAoc3BsaXROdW1iZXIgLSAxKSk7XG4gIGlmICh2YWx1ZUludGVydmFsLnRvU3RyaW5nKCkubGVuZ3RoID4gMSkgdmFsdWVJbnRlcnZhbCA9IHBhcnNlSW50KHZhbHVlSW50ZXJ2YWwudG9TdHJpbmcoKS5yZXBsYWNlKC9cXGQkLywgJzAnKSk7XG4gIGlmICh2YWx1ZUludGVydmFsID09PSAwKSB2YWx1ZUludGVydmFsID0gMTtcbiAgaWYgKHR5cGVvZiBtaW5JbnRlcnZhbCA9PT0gJ251bWJlcicgJiYgdmFsdWVJbnRlcnZhbCA8IG1pbkludGVydmFsKSByZXR1cm4gbWluSW50ZXJ2YWw7XG4gIGlmICh0eXBlb2YgbWF4SW50ZXJ2YWwgPT09ICdudW1iZXInICYmIHZhbHVlSW50ZXJ2YWwgPiBtYXhJbnRlcnZhbCkgcmV0dXJuIG1heEludGVydmFsO1xuICByZXR1cm4gdmFsdWVJbnRlcnZhbDtcbn1cblxuZnVuY3Rpb24gc2V0QXhpc1Bvc2l0aW9uKGFsbEF4aXMpIHtcbiAgdmFyIHhBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYxNCkge1xuICAgIHZhciBheGlzID0gX3JlZjE0LmF4aXM7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd4JztcbiAgfSk7XG4gIHZhciB5QXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMTUpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYxNS5heGlzO1xuICAgIHJldHVybiBheGlzID09PSAneSc7XG4gIH0pO1xuICBpZiAoeEF4aXNbMF0gJiYgIXhBeGlzWzBdLnBvc2l0aW9uKSB4QXhpc1swXS5wb3NpdGlvbiA9IF9jb25maWcueEF4aXNDb25maWcucG9zaXRpb247XG5cbiAgaWYgKHhBeGlzWzFdICYmICF4QXhpc1sxXS5wb3NpdGlvbikge1xuICAgIHhBeGlzWzFdLnBvc2l0aW9uID0geEF4aXNbMF0ucG9zaXRpb24gPT09ICdib3R0b20nID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgfVxuXG4gIGlmICh5QXhpc1swXSAmJiAheUF4aXNbMF0ucG9zaXRpb24pIHlBeGlzWzBdLnBvc2l0aW9uID0gX2NvbmZpZy55QXhpc0NvbmZpZy5wb3NpdGlvbjtcblxuICBpZiAoeUF4aXNbMV0gJiYgIXlBeGlzWzFdLnBvc2l0aW9uKSB7XG4gICAgeUF4aXNbMV0ucG9zaXRpb24gPSB5QXhpc1swXS5wb3NpdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgfVxuXG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh4QXhpcyksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeUF4aXMpKTtcbn1cblxuZnVuY3Rpb24gY2FsY0F4aXNMaW5lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpIHtcbiAgdmFyIF9jaGFydCRncmlkQXJlYSA9IGNoYXJ0LmdyaWRBcmVhLFxuICAgICAgeCA9IF9jaGFydCRncmlkQXJlYS54LFxuICAgICAgeSA9IF9jaGFydCRncmlkQXJlYS55LFxuICAgICAgdyA9IF9jaGFydCRncmlkQXJlYS53LFxuICAgICAgaCA9IF9jaGFydCRncmlkQXJlYS5oO1xuICBhbGxBeGlzID0gYWxsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICB2YXIgcG9zaXRpb24gPSBheGlzLnBvc2l0aW9uO1xuICAgIHZhciBsaW5lUG9zaXRpb24gPSBbXTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICBsaW5lUG9zaXRpb24gPSBbW3gsIHldLCBbeCwgeSArIGhdXS5yZXZlcnNlKCk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgbGluZVBvc2l0aW9uID0gW1t4ICsgdywgeV0sIFt4ICsgdywgeSArIGhdXS5yZXZlcnNlKCk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIGxpbmVQb3NpdGlvbiA9IFtbeCwgeV0sIFt4ICsgdywgeV1dO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICBsaW5lUG9zaXRpb24gPSBbW3gsIHkgKyBoXSwgW3ggKyB3LCB5ICsgaF1dO1xuICAgIH1cblxuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBsaW5lUG9zaXRpb246IGxpbmVQb3NpdGlvblxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGFsbEF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNBeGlzVGlja1Bvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KSB7XG4gIHJldHVybiBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0l0ZW0pIHtcbiAgICB2YXIgYXhpcyA9IGF4aXNJdGVtLmF4aXMsXG4gICAgICAgIGxpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLmxpbmVQb3NpdGlvbixcbiAgICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbixcbiAgICAgICAgbGFiZWwgPSBheGlzSXRlbS5sYWJlbCxcbiAgICAgICAgYm91bmRhcnlHYXAgPSBheGlzSXRlbS5ib3VuZGFyeUdhcDtcbiAgICBpZiAodHlwZW9mIGJvdW5kYXJ5R2FwICE9PSAnYm9vbGVhbicpIGJvdW5kYXJ5R2FwID0gYXhpc0NvbmZpZ1theGlzICsgJ0F4aXNDb25maWcnXS5ib3VuZGFyeUdhcDtcbiAgICB2YXIgbGFiZWxOdW0gPSBsYWJlbC5sZW5ndGg7XG5cbiAgICB2YXIgX2xpbmVQb3NpdGlvbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9zaXRpb24sIDIpLFxuICAgICAgICBfbGluZVBvc2l0aW9uJCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfbGluZVBvc2l0aW9uWzBdLCAyKSxcbiAgICAgICAgc3RhcnRYID0gX2xpbmVQb3NpdGlvbiRbMF0sXG4gICAgICAgIHN0YXJ0WSA9IF9saW5lUG9zaXRpb24kWzFdLFxuICAgICAgICBfbGluZVBvc2l0aW9uJDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2xpbmVQb3NpdGlvblsxXSwgMiksXG4gICAgICAgIGVuZFggPSBfbGluZVBvc2l0aW9uJDJbMF0sXG4gICAgICAgIGVuZFkgPSBfbGluZVBvc2l0aW9uJDJbMV07XG5cbiAgICB2YXIgZ2FwTGVuZ3RoID0gYXhpcyA9PT0gJ3gnID8gZW5kWCAtIHN0YXJ0WCA6IGVuZFkgLSBzdGFydFk7XG4gICAgdmFyIGdhcCA9IGdhcExlbmd0aCAvIChib3VuZGFyeUdhcCA/IGxhYmVsTnVtIDogbGFiZWxOdW0gLSAxKTtcbiAgICB2YXIgdGlja1Bvc2l0aW9uID0gbmV3IEFycmF5KGxhYmVsTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgICAgIHJldHVybiBbc3RhcnRYICsgZ2FwICogKGJvdW5kYXJ5R2FwID8gaSArIDAuNSA6IGkpLCBzdGFydFldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW3N0YXJ0WCwgc3RhcnRZICsgZ2FwICogKGJvdW5kYXJ5R2FwID8gaSArIDAuNSA6IGkpXTtcbiAgICB9KTtcbiAgICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IGdldFRpY2tMaW5lUG9zaXRpb24oYXhpcywgYm91bmRhcnlHYXAsIHBvc2l0aW9uLCB0aWNrUG9zaXRpb24sIGdhcCk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXNJdGVtLCB7XG4gICAgICB0aWNrUG9zaXRpb246IHRpY2tQb3NpdGlvbixcbiAgICAgIHRpY2tMaW5lUG9zaXRpb246IHRpY2tMaW5lUG9zaXRpb24sXG4gICAgICB0aWNrR2FwOiBnYXBcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tMaW5lUG9zaXRpb24oYXhpc1R5cGUsIGJvdW5kYXJ5R2FwLCBwb3NpdGlvbiwgdGlja1Bvc2l0aW9uLCBnYXApIHtcbiAgdmFyIGluZGV4ID0gYXhpc1R5cGUgPT09ICd4JyA/IDEgOiAwO1xuICB2YXIgcGx1cyA9IDU7XG4gIGlmIChheGlzVHlwZSA9PT0gJ3gnICYmIHBvc2l0aW9uID09PSAndG9wJykgcGx1cyA9IC01O1xuICBpZiAoYXhpc1R5cGUgPT09ICd5JyAmJiBwb3NpdGlvbiA9PT0gJ2xlZnQnKSBwbHVzID0gLTU7XG4gIHZhciB0aWNrTGluZVBvc2l0aW9uID0gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAobGluZVN0YXJ0KSB7XG4gICAgdmFyIGxpbmVFbmQgPSAoMCwgX3V0aWwyLmRlZXBDbG9uZSkobGluZVN0YXJ0KTtcbiAgICBsaW5lRW5kW2luZGV4XSArPSBwbHVzO1xuICAgIHJldHVybiBbKDAsIF91dGlsMi5kZWVwQ2xvbmUpKGxpbmVTdGFydCksIGxpbmVFbmRdO1xuICB9KTtcbiAgaWYgKCFib3VuZGFyeUdhcCkgcmV0dXJuIHRpY2tMaW5lUG9zaXRpb247XG4gIGluZGV4ID0gYXhpc1R5cGUgPT09ICd4JyA/IDAgOiAxO1xuICBwbHVzID0gZ2FwIC8gMjtcbiAgdGlja0xpbmVQb3NpdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChfcmVmMTYpIHtcbiAgICB2YXIgX3JlZjE3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxNiwgMiksXG4gICAgICAgIGxpbmVTdGFydCA9IF9yZWYxN1swXSxcbiAgICAgICAgbGluZUVuZCA9IF9yZWYxN1sxXTtcblxuICAgIGxpbmVTdGFydFtpbmRleF0gKz0gcGx1cztcbiAgICBsaW5lRW5kW2luZGV4XSArPSBwbHVzO1xuICB9KTtcbiAgcmV0dXJuIHRpY2tMaW5lUG9zaXRpb247XG59XG5cbmZ1bmN0aW9uIGNhbGNBeGlzTmFtZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KSB7XG4gIHJldHVybiBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0l0ZW0pIHtcbiAgICB2YXIgbmFtZUdhcCA9IGF4aXNJdGVtLm5hbWVHYXAsXG4gICAgICAgIG5hbWVMb2NhdGlvbiA9IGF4aXNJdGVtLm5hbWVMb2NhdGlvbixcbiAgICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbixcbiAgICAgICAgbGluZVBvc2l0aW9uID0gYXhpc0l0ZW0ubGluZVBvc2l0aW9uO1xuXG4gICAgdmFyIF9saW5lUG9zaXRpb24yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb3NpdGlvbiwgMiksXG4gICAgICAgIGxpbmVTdGFydCA9IF9saW5lUG9zaXRpb24yWzBdLFxuICAgICAgICBsaW5lRW5kID0gX2xpbmVQb3NpdGlvbjJbMV07XG5cbiAgICB2YXIgbmFtZVBvc2l0aW9uID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lU3RhcnQpO1xuICAgIGlmIChuYW1lTG9jYXRpb24gPT09ICdlbmQnKSBuYW1lUG9zaXRpb24gPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxpbmVFbmQpO1xuXG4gICAgaWYgKG5hbWVMb2NhdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIG5hbWVQb3NpdGlvblswXSA9IChsaW5lU3RhcnRbMF0gKyBsaW5lRW5kWzBdKSAvIDI7XG4gICAgICBuYW1lUG9zaXRpb25bMV0gPSAobGluZVN0YXJ0WzFdICsgbGluZUVuZFsxXSkgLyAyO1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBuYW1lTG9jYXRpb24gPT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBuYW1lTG9jYXRpb24gPT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbmFtZUxvY2F0aW9uICE9PSAnY2VudGVyJykgaW5kZXggPSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBuYW1lTG9jYXRpb24gIT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgdmFyIHBsdXMgPSBuYW1lR2FwO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgbmFtZUxvY2F0aW9uICE9PSAnZW5kJykgcGx1cyAqPSAtMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdsZWZ0JyAmJiBuYW1lTG9jYXRpb24gIT09ICdzdGFydCcpIHBsdXMgKj0gLTE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBuYW1lTG9jYXRpb24gPT09ICdzdGFydCcpIHBsdXMgKj0gLTE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnICYmIG5hbWVMb2NhdGlvbiA9PT0gJ2VuZCcpIHBsdXMgKj0gLTE7XG4gICAgbmFtZVBvc2l0aW9uW2luZGV4XSArPSBwbHVzO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzSXRlbSwge1xuICAgICAgbmFtZVBvc2l0aW9uOiBuYW1lUG9zaXRpb25cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNTcGxpdExpbmVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCkge1xuICB2YXIgX2NoYXJ0JGdyaWRBcmVhMiA9IGNoYXJ0LmdyaWRBcmVhLFxuICAgICAgdyA9IF9jaGFydCRncmlkQXJlYTIudyxcbiAgICAgIGggPSBfY2hhcnQkZ3JpZEFyZWEyLmg7XG4gIHJldHVybiBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0l0ZW0pIHtcbiAgICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLnRpY2tMaW5lUG9zaXRpb24sXG4gICAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb24sXG4gICAgICAgIGJvdW5kYXJ5R2FwID0gYXhpc0l0ZW0uYm91bmRhcnlHYXA7XG4gICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgcGx1cyA9IHc7XG4gICAgaWYgKHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIGluZGV4ID0gMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgcGx1cyA9IGg7XG4gICAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgcGx1cyAqPSAtMTtcbiAgICB2YXIgc3BsaXRMaW5lUG9zaXRpb24gPSB0aWNrTGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZjE4KSB7XG4gICAgICB2YXIgX3JlZjE5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxOCwgMSksXG4gICAgICAgICAgc3RhcnRQb2ludCA9IF9yZWYxOVswXTtcblxuICAgICAgdmFyIGVuZFBvaW50ID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzdGFydFBvaW50KTtcbiAgICAgIGVuZFBvaW50W2luZGV4XSArPSBwbHVzO1xuICAgICAgcmV0dXJuIFsoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHN0YXJ0UG9pbnQpLCBlbmRQb2ludF07XG4gICAgfSk7XG4gICAgaWYgKCFib3VuZGFyeUdhcCkgc3BsaXRMaW5lUG9zaXRpb24uc2hpZnQoKTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpc0l0ZW0sIHtcbiAgICAgIHNwbGl0TGluZVBvc2l0aW9uOiBzcGxpdExpbmVQb3NpdGlvblxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUNvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiBheGlzSXRlbS5heGlzTGluZS5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldExpbmVTaGFwZShheGlzSXRlbSksXG4gICAgc3R5bGU6IGdldExpbmVTdHlsZShheGlzSXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVTaGFwZShheGlzSXRlbSkge1xuICB2YXIgbGluZVBvc2l0aW9uID0gYXhpc0l0ZW0ubGluZVBvc2l0aW9uO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogbGluZVBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVTdHlsZShheGlzSXRlbSkge1xuICByZXR1cm4gYXhpc0l0ZW0uYXhpc0xpbmUuc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tDb25maWcoYXhpc0l0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYXhpc0l0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYXhpc0l0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0VGlja1NoYXBlcyhheGlzSXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldFRpY2tTdHlsZShheGlzSXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGF4aXNJdGVtLmF4aXNUaWNrLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlja1NoYXBlcyhheGlzSXRlbSkge1xuICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLnRpY2tMaW5lUG9zaXRpb247XG4gIHJldHVybiB0aWNrTGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tTdHlsZShheGlzSXRlbSkge1xuICByZXR1cm4gYXhpc0l0ZW0uYXhpc1RpY2suc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldExhYmVsU2hhcGVzKGF4aXNJdGVtKTtcbiAgdmFyIHN0eWxlcyA9IGdldExhYmVsU3R5bGUoYXhpc0l0ZW0sIHNoYXBlcyk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSwgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogYXhpc0l0ZW0uYXhpc0xhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVzW2ldLFxuICAgICAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlcyhheGlzSXRlbSkge1xuICB2YXIgbGFiZWwgPSBheGlzSXRlbS5sYWJlbCxcbiAgICAgIHRpY2tQb3NpdGlvbiA9IGF4aXNJdGVtLnRpY2tQb3NpdGlvbixcbiAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb247XG4gIHJldHVybiB0aWNrUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb2ludCwgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogZ2V0TGFiZWxSZWFsUG9zaXRpb24ocG9pbnQsIHBvc2l0aW9uKSxcbiAgICAgIGNvbnRlbnQ6IGxhYmVsW2ldLnRvU3RyaW5nKClcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxSZWFsUG9zaXRpb24ocG9pbnRzLCBwb3NpdGlvbikge1xuICB2YXIgaW5kZXggPSAwLFxuICAgICAgcGx1cyA9IDEwO1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgaW5kZXggPSAxO1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnbGVmdCcpIHBsdXMgPSAtMTA7XG4gIHBvaW50cyA9ICgwLCBfdXRpbDIuZGVlcENsb25lKShwb2ludHMpO1xuICBwb2ludHNbaW5kZXhdICs9IHBsdXM7XG4gIHJldHVybiBwb2ludHM7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUoYXhpc0l0ZW0sIHNoYXBlcykge1xuICB2YXIgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbjtcbiAgdmFyIHN0eWxlID0gYXhpc0l0ZW0uYXhpc0xhYmVsLnN0eWxlO1xuICB2YXIgYWxpZ24gPSBnZXRBeGlzTGFiZWxSZWFsQWxpZ24ocG9zaXRpb24pO1xuICBzdHlsZSA9ICgwLCBfdXRpbC5kZWVwTWVyZ2UpKGFsaWduLCBzdHlsZSk7XG4gIHZhciBzdHlsZXMgPSBzaGFwZXMubWFwKGZ1bmN0aW9uIChfcmVmMjApIHtcbiAgICB2YXIgcG9zaXRpb24gPSBfcmVmMjAucG9zaXRpb247XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIHN0eWxlLCB7XG4gICAgICBncmFwaENlbnRlcjogcG9zaXRpb25cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbFJlYWxBbGlnbihwb3NpdGlvbikge1xuICBpZiAocG9zaXRpb24gPT09ICdsZWZ0JykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAndG9wJ1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROYW1lQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3RleHQnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0TmFtZVNoYXBlKGF4aXNJdGVtKSxcbiAgICBzdHlsZTogZ2V0TmFtZVN0eWxlKGF4aXNJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZVNoYXBlKGF4aXNJdGVtKSB7XG4gIHZhciBuYW1lID0gYXhpc0l0ZW0ubmFtZSxcbiAgICAgIG5hbWVQb3NpdGlvbiA9IGF4aXNJdGVtLm5hbWVQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBuYW1lLFxuICAgIHBvc2l0aW9uOiBuYW1lUG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZVN0eWxlKGF4aXNJdGVtKSB7XG4gIHZhciBuYW1lTG9jYXRpb24gPSBheGlzSXRlbS5uYW1lTG9jYXRpb24sXG4gICAgICBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uLFxuICAgICAgc3R5bGUgPSBheGlzSXRlbS5uYW1lVGV4dFN0eWxlO1xuICB2YXIgYWxpZ24gPSBnZXROYW1lUmVhbEFsaWduKHBvc2l0aW9uLCBuYW1lTG9jYXRpb24pO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoYWxpZ24sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZVJlYWxBbGlnbihwb3NpdGlvbiwgbG9jYXRpb24pIHtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBsb2NhdGlvbiA9PT0gJ3N0YXJ0JyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbG9jYXRpb24gPT09ICdzdGFydCcgfHwgcG9zaXRpb24gPT09ICdsZWZ0JyAmJiBsb2NhdGlvbiA9PT0gJ2NlbnRlcicpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAncmlnaHQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBsb2NhdGlvbiA9PT0gJ2VuZCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nICYmIGxvY2F0aW9uID09PSAnZW5kJyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBsb2NhdGlvbiA9PT0gJ2NlbnRlcicpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmIGxvY2F0aW9uID09PSAnY2VudGVyJyB8fCBwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGxvY2F0aW9uID09PSAnZW5kJyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBsb2NhdGlvbiA9PT0gJ2VuZCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbG9jYXRpb24gPT09ICdjZW50ZXInIHx8IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbG9jYXRpb24gPT09ICdzdGFydCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcgJiYgbG9jYXRpb24gPT09ICdzdGFydCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZUNvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRTcGxpdExpbmVTaGFwZXMoYXhpc0l0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRTcGxpdExpbmVTdHlsZShheGlzSXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGF4aXNJdGVtLnNwbGl0TGluZS5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZVNoYXBlcyhheGlzSXRlbSkge1xuICB2YXIgc3BsaXRMaW5lUG9zaXRpb24gPSBheGlzSXRlbS5zcGxpdExpbmVQb3NpdGlvbjtcbiAgcmV0dXJuIHNwbGl0TGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZVN0eWxlKGF4aXNJdGVtKSB7XG4gIHJldHVybiBheGlzSXRlbS5zcGxpdExpbmUuc3R5bGU7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5iYXIgPSBiYXI7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gYmFyKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgeEF4aXMgPSBvcHRpb24ueEF4aXMsXG4gICAgICB5QXhpcyA9IG9wdGlvbi55QXhpcyxcbiAgICAgIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIHZhciBiYXJzID0gW107XG5cbiAgaWYgKHhBeGlzICYmIHlBeGlzICYmIHNlcmllcykge1xuICAgIGJhcnMgPSAoMCwgX3V0aWwyLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9jb25maWcuYmFyQ29uZmlnLCAnYmFyJyk7XG4gICAgYmFycyA9IHNldEJhckF4aXMoYmFycywgY2hhcnQpO1xuICAgIGJhcnMgPSBzZXRCYXJQb3NpdGlvbkRhdGEoYmFycywgY2hhcnQpO1xuICAgIGJhcnMgPSBjYWxjQmFyc1Bvc2l0aW9uKGJhcnMsIGNoYXJ0KTtcbiAgfVxuXG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGJhcnMuc2xpY2UoLTEpLFxuICAgIGtleTogJ2JhY2tncm91bmRCYXInLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRCYWNrZ3JvdW5kQmFyQ29uZmlnXG4gIH0pO1xuICBiYXJzLnJldmVyc2UoKTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYmFycyxcbiAgICBrZXk6ICdiYXInLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRCYXJDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRCYXJDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVCYXJcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGJhcnMsXG4gICAga2V5OiAnYmFyTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMYWJlbENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyQXhpcyhiYXJzLCBjaGFydCkge1xuICB2YXIgYXhpc0RhdGEgPSBjaGFydC5heGlzRGF0YTtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgeEF4aXNJbmRleCA9IGJhci54QXhpc0luZGV4LFxuICAgICAgICB5QXhpc0luZGV4ID0gYmFyLnlBeGlzSW5kZXg7XG4gICAgaWYgKHR5cGVvZiB4QXhpc0luZGV4ICE9PSAnbnVtYmVyJykgeEF4aXNJbmRleCA9IDA7XG4gICAgaWYgKHR5cGVvZiB5QXhpc0luZGV4ICE9PSAnbnVtYmVyJykgeUF4aXNJbmRleCA9IDA7XG4gICAgdmFyIHhBeGlzID0gYXhpc0RhdGEuZmluZChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIGF4aXMgPSBfcmVmLmF4aXMsXG4gICAgICAgICAgaW5kZXggPSBfcmVmLmluZGV4O1xuICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KGF4aXMpLmNvbmNhdChpbmRleCkgPT09IFwieFwiLmNvbmNhdCh4QXhpc0luZGV4KTtcbiAgICB9KTtcbiAgICB2YXIgeUF4aXMgPSBheGlzRGF0YS5maW5kKGZ1bmN0aW9uIChfcmVmMikge1xuICAgICAgdmFyIGF4aXMgPSBfcmVmMi5heGlzLFxuICAgICAgICAgIGluZGV4ID0gX3JlZjIuaW5kZXg7XG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQoYXhpcykuY29uY2F0KGluZGV4KSA9PT0gXCJ5XCIuY29uY2F0KHlBeGlzSW5kZXgpO1xuICAgIH0pO1xuICAgIHZhciBheGlzID0gW3hBeGlzLCB5QXhpc107XG4gICAgdmFyIHZhbHVlQXhpc0luZGV4ID0gYXhpcy5maW5kSW5kZXgoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgICB2YXIgZGF0YSA9IF9yZWYzLmRhdGE7XG4gICAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgICB9KTtcbiAgICBiYXIudmFsdWVBeGlzID0gYXhpc1t2YWx1ZUF4aXNJbmRleF07XG4gICAgYmFyLmxhYmVsQXhpcyA9IGF4aXNbMSAtIHZhbHVlQXhpc0luZGV4XTtcbiAgfSk7XG4gIHJldHVybiBiYXJzO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJQb3NpdGlvbkRhdGEoYmFycywgY2hhcnQpIHtcbiAgdmFyIGxhYmVsQmFyR3JvdXAgPSBncm91cEJhckJ5TGFiZWxBeGlzKGJhcnMpO1xuICBsYWJlbEJhckdyb3VwLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgc2V0QmFySW5kZXgoZ3JvdXApO1xuICAgIHNldEJhck51bShncm91cCk7XG4gICAgc2V0QmFyQ2F0ZWdvcnlXaWR0aChncm91cCwgY2hhcnQpO1xuICAgIHNldEJhcldpZHRoQW5kR2FwKGdyb3VwKTtcbiAgICBzZXRCYXJBbGxXaWR0aEFuZEdhcChncm91cCk7XG4gIH0pO1xuICByZXR1cm4gYmFycztcbn1cblxuZnVuY3Rpb24gc2V0QmFySW5kZXgoYmFycykge1xuICB2YXIgc3RhY2tzID0gZ2V0QmFyU3RhY2soYmFycyk7XG4gIHN0YWNrcyA9IHN0YWNrcy5tYXAoZnVuY3Rpb24gKHN0YWNrKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrOiBzdGFjayxcbiAgICAgIGluZGV4OiAtMVxuICAgIH07XG4gIH0pO1xuICB2YXIgY3VycmVudEluZGV4ID0gMDtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgc3RhY2sgPSBiYXIuc3RhY2s7XG5cbiAgICBpZiAoIXN0YWNrKSB7XG4gICAgICBiYXIuYmFySW5kZXggPSBjdXJyZW50SW5kZXg7XG4gICAgICBjdXJyZW50SW5kZXgrKztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YWNrRGF0YSA9IHN0YWNrcy5maW5kKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgICAgICB2YXIgcyA9IF9yZWY0LnN0YWNrO1xuICAgICAgICByZXR1cm4gcyA9PT0gc3RhY2s7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHN0YWNrRGF0YS5pbmRleCA9PT0gLTEpIHtcbiAgICAgICAgc3RhY2tEYXRhLmluZGV4ID0gY3VycmVudEluZGV4O1xuICAgICAgICBjdXJyZW50SW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgYmFyLmJhckluZGV4ID0gc3RhY2tEYXRhLmluZGV4O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdyb3VwQmFyQnlMYWJlbEF4aXMoYmFycykge1xuICB2YXIgbGFiZWxBeGlzID0gYmFycy5tYXAoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgdmFyIF9yZWY1JGxhYmVsQXhpcyA9IF9yZWY1LmxhYmVsQXhpcyxcbiAgICAgICAgYXhpcyA9IF9yZWY1JGxhYmVsQXhpcy5heGlzLFxuICAgICAgICBpbmRleCA9IF9yZWY1JGxhYmVsQXhpcy5pbmRleDtcbiAgICByZXR1cm4gYXhpcyArIGluZGV4O1xuICB9KTtcbiAgbGFiZWxBeGlzID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXcgU2V0KGxhYmVsQXhpcykpO1xuICByZXR1cm4gbGFiZWxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0luZGV4KSB7XG4gICAgcmV0dXJuIGJhcnMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNikge1xuICAgICAgdmFyIF9yZWY2JGxhYmVsQXhpcyA9IF9yZWY2LmxhYmVsQXhpcyxcbiAgICAgICAgICBheGlzID0gX3JlZjYkbGFiZWxBeGlzLmF4aXMsXG4gICAgICAgICAgaW5kZXggPSBfcmVmNiRsYWJlbEF4aXMuaW5kZXg7XG4gICAgICByZXR1cm4gYXhpcyArIGluZGV4ID09PSBheGlzSW5kZXg7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJTdGFjayhiYXJzKSB7XG4gIHZhciBzdGFja3MgPSBbXTtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChfcmVmNykge1xuICAgIHZhciBzdGFjayA9IF9yZWY3LnN0YWNrO1xuICAgIGlmIChzdGFjaykgc3RhY2tzLnB1c2goc3RhY2spO1xuICB9KTtcbiAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3IFNldChzdGFja3MpKTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyTnVtKGJhcnMpIHtcbiAgdmFyIGJhck51bSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3IFNldChiYXJzLm1hcChmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgYmFySW5kZXggPSBfcmVmOC5iYXJJbmRleDtcbiAgICByZXR1cm4gYmFySW5kZXg7XG4gIH0pKSkubGVuZ3RoO1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHJldHVybiBiYXIuYmFyTnVtID0gYmFyTnVtO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyQ2F0ZWdvcnlXaWR0aChiYXJzKSB7XG4gIHZhciBsYXN0QmFyID0gYmFycy5zbGljZSgtMSlbMF07XG4gIHZhciBiYXJDYXRlZ29yeUdhcCA9IGxhc3RCYXIuYmFyQ2F0ZWdvcnlHYXAsXG4gICAgICB0aWNrR2FwID0gbGFzdEJhci5sYWJlbEF4aXMudGlja0dhcDtcbiAgdmFyIGJhckNhdGVnb3J5V2lkdGggPSAwO1xuXG4gIGlmICh0eXBlb2YgYmFyQ2F0ZWdvcnlHYXAgPT09ICdudW1iZXInKSB7XG4gICAgYmFyQ2F0ZWdvcnlXaWR0aCA9IGJhckNhdGVnb3J5R2FwO1xuICB9IGVsc2Uge1xuICAgIGJhckNhdGVnb3J5V2lkdGggPSAoMSAtIHBhcnNlSW50KGJhckNhdGVnb3J5R2FwKSAvIDEwMCkgKiB0aWNrR2FwO1xuICB9XG5cbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICByZXR1cm4gYmFyLmJhckNhdGVnb3J5V2lkdGggPSBiYXJDYXRlZ29yeVdpZHRoO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyV2lkdGhBbmRHYXAoYmFycykge1xuICB2YXIgX2JhcnMkc2xpY2UkID0gYmFycy5zbGljZSgtMSlbMF0sXG4gICAgICBiYXJDYXRlZ29yeVdpZHRoID0gX2JhcnMkc2xpY2UkLmJhckNhdGVnb3J5V2lkdGgsXG4gICAgICBiYXJXaWR0aCA9IF9iYXJzJHNsaWNlJC5iYXJXaWR0aCxcbiAgICAgIGJhckdhcCA9IF9iYXJzJHNsaWNlJC5iYXJHYXAsXG4gICAgICBiYXJOdW0gPSBfYmFycyRzbGljZSQuYmFyTnVtO1xuICB2YXIgd2lkdGhBbmRHYXAgPSBbXTtcblxuICBpZiAodHlwZW9mIGJhcldpZHRoID09PSAnbnVtYmVyJyB8fCBiYXJXaWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgd2lkdGhBbmRHYXAgPSBnZXRCYXJXaWR0aEFuZEdhcFdpdGhQZXJjZW50T3JOdW1iZXIoYmFyQ2F0ZWdvcnlXaWR0aCwgYmFyV2lkdGgsIGJhckdhcCwgYmFyTnVtKTtcbiAgfSBlbHNlIGlmIChiYXJXaWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgd2lkdGhBbmRHYXAgPSBnZXRCYXJXaWR0aEFuZEdhcFdpZHRoQXV0byhiYXJDYXRlZ29yeVdpZHRoLCBiYXJXaWR0aCwgYmFyR2FwLCBiYXJOdW0pO1xuICB9XG5cbiAgdmFyIF93aWR0aEFuZEdhcCA9IHdpZHRoQW5kR2FwLFxuICAgICAgX3dpZHRoQW5kR2FwMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfd2lkdGhBbmRHYXAsIDIpLFxuICAgICAgd2lkdGggPSBfd2lkdGhBbmRHYXAyWzBdLFxuICAgICAgZ2FwID0gX3dpZHRoQW5kR2FwMlsxXTtcblxuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIGJhci5iYXJXaWR0aCA9IHdpZHRoO1xuICAgIGJhci5iYXJHYXAgPSBnYXA7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJXaWR0aEFuZEdhcFdpdGhQZXJjZW50T3JOdW1iZXIoYmFyQ2F0ZWdvcnlXaWR0aCwgYmFyV2lkdGgsIGJhckdhcCkge1xuICB2YXIgd2lkdGggPSAwLFxuICAgICAgZ2FwID0gMDtcblxuICBpZiAodHlwZW9mIGJhcldpZHRoID09PSAnbnVtYmVyJykge1xuICAgIHdpZHRoID0gYmFyV2lkdGg7XG4gIH0gZWxzZSB7XG4gICAgd2lkdGggPSBwYXJzZUludChiYXJXaWR0aCkgLyAxMDAgKiBiYXJDYXRlZ29yeVdpZHRoO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBiYXJHYXAgPT09ICdudW1iZXInKSB7XG4gICAgZ2FwID0gYmFyR2FwO1xuICB9IGVsc2Uge1xuICAgIGdhcCA9IHBhcnNlSW50KGJhckdhcCkgLyAxMDAgKiB3aWR0aDtcbiAgfVxuXG4gIHJldHVybiBbd2lkdGgsIGdhcF07XG59XG5cbmZ1bmN0aW9uIGdldEJhcldpZHRoQW5kR2FwV2lkdGhBdXRvKGJhckNhdGVnb3J5V2lkdGgsIGJhcldpZHRoLCBiYXJHYXAsIGJhck51bSkge1xuICB2YXIgd2lkdGggPSAwLFxuICAgICAgZ2FwID0gMDtcbiAgdmFyIGJhckl0ZW1XaWR0aCA9IGJhckNhdGVnb3J5V2lkdGggLyBiYXJOdW07XG5cbiAgaWYgKHR5cGVvZiBiYXJHYXAgPT09ICdudW1iZXInKSB7XG4gICAgZ2FwID0gYmFyR2FwO1xuICAgIHdpZHRoID0gYmFySXRlbVdpZHRoIC0gZ2FwO1xuICB9IGVsc2Uge1xuICAgIHZhciBwZXJjZW50ID0gMTAgKyBwYXJzZUludChiYXJHYXApIC8gMTA7XG5cbiAgICBpZiAocGVyY2VudCA9PT0gMCkge1xuICAgICAgd2lkdGggPSBiYXJJdGVtV2lkdGggKiAyO1xuICAgICAgZ2FwID0gLXdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aWR0aCA9IGJhckl0ZW1XaWR0aCAvIHBlcmNlbnQgKiAxMDtcbiAgICAgIGdhcCA9IGJhckl0ZW1XaWR0aCAtIHdpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbd2lkdGgsIGdhcF07XG59XG5cbmZ1bmN0aW9uIHNldEJhckFsbFdpZHRoQW5kR2FwKGJhcnMpIHtcbiAgdmFyIF9iYXJzJHNsaWNlJDIgPSBiYXJzLnNsaWNlKC0xKVswXSxcbiAgICAgIGJhckdhcCA9IF9iYXJzJHNsaWNlJDIuYmFyR2FwLFxuICAgICAgYmFyV2lkdGggPSBfYmFycyRzbGljZSQyLmJhcldpZHRoLFxuICAgICAgYmFyTnVtID0gX2JhcnMkc2xpY2UkMi5iYXJOdW07XG4gIHZhciBiYXJBbGxXaWR0aEFuZEdhcCA9IChiYXJHYXAgKyBiYXJXaWR0aCkgKiBiYXJOdW0gLSBiYXJHYXA7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgcmV0dXJuIGJhci5iYXJBbGxXaWR0aEFuZEdhcCA9IGJhckFsbFdpZHRoQW5kR2FwO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0JhcnNQb3NpdGlvbihiYXJzLCBjaGFydCkge1xuICBiYXJzID0gY2FsY0JhclZhbHVlQXhpc0Nvb3JkaW5hdGUoYmFycyk7XG4gIGJhcnMgPSBjYWxjQmFyTGFiZWxBeGlzQ29vcmRpbmF0ZShiYXJzKTtcbiAgYmFycyA9IGVsaW1pbmF0ZU51bGxCYXJMYWJlbEF4aXMoYmFycyk7XG4gIGJhcnMgPSBrZWVwU2FtZU51bUJldHdlZW5CYXJBbmREYXRhKGJhcnMpO1xuICByZXR1cm4gYmFycztcbn1cblxuZnVuY3Rpb24gY2FsY0JhckxhYmVsQXhpc0Nvb3JkaW5hdGUoYmFycykge1xuICByZXR1cm4gYmFycy5tYXAoZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciBsYWJlbEF4aXMgPSBiYXIubGFiZWxBeGlzLFxuICAgICAgICBiYXJBbGxXaWR0aEFuZEdhcCA9IGJhci5iYXJBbGxXaWR0aEFuZEdhcCxcbiAgICAgICAgYmFyR2FwID0gYmFyLmJhckdhcCxcbiAgICAgICAgYmFyV2lkdGggPSBiYXIuYmFyV2lkdGgsXG4gICAgICAgIGJhckluZGV4ID0gYmFyLmJhckluZGV4O1xuICAgIHZhciB0aWNrR2FwID0gbGFiZWxBeGlzLnRpY2tHYXAsXG4gICAgICAgIHRpY2tQb3NpdGlvbiA9IGxhYmVsQXhpcy50aWNrUG9zaXRpb24sXG4gICAgICAgIGF4aXMgPSBsYWJlbEF4aXMuYXhpcztcbiAgICB2YXIgY29vcmRpbmF0ZUluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gICAgdmFyIGJhckxhYmVsQXhpc1BvcyA9IHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHRpY2ssIGkpIHtcbiAgICAgIHZhciBiYXJDYXRlZ29yeVN0YXJ0UG9zID0gdGlja1Bvc2l0aW9uW2ldW2Nvb3JkaW5hdGVJbmRleF0gLSB0aWNrR2FwIC8gMjtcbiAgICAgIHZhciBiYXJJdGVtc1N0YXJ0UG9zID0gYmFyQ2F0ZWdvcnlTdGFydFBvcyArICh0aWNrR2FwIC0gYmFyQWxsV2lkdGhBbmRHYXApIC8gMjtcbiAgICAgIHJldHVybiBiYXJJdGVtc1N0YXJ0UG9zICsgKGJhckluZGV4ICsgMC41KSAqIGJhcldpZHRoICsgYmFySW5kZXggKiBiYXJHYXA7XG4gICAgfSk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGJhciwge1xuICAgICAgYmFyTGFiZWxBeGlzUG9zOiBiYXJMYWJlbEF4aXNQb3NcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNCYXJWYWx1ZUF4aXNDb29yZGluYXRlKGJhcnMpIHtcbiAgcmV0dXJuIGJhcnMubWFwKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgZGF0YSA9ICgwLCBfdXRpbDIubWVyZ2VTYW1lU3RhY2tEYXRhKShiYXIsIGJhcnMpO1xuICAgIGRhdGEgPSBlbGltaW5hdGVOb25OdW1iZXJEYXRhKGJhciwgZGF0YSk7XG4gICAgdmFyIF9iYXIkdmFsdWVBeGlzID0gYmFyLnZhbHVlQXhpcyxcbiAgICAgICAgYXhpcyA9IF9iYXIkdmFsdWVBeGlzLmF4aXMsXG4gICAgICAgIG1pblZhbHVlID0gX2JhciR2YWx1ZUF4aXMubWluVmFsdWUsXG4gICAgICAgIG1heFZhbHVlID0gX2JhciR2YWx1ZUF4aXMubWF4VmFsdWUsXG4gICAgICAgIGxpbmVQb3NpdGlvbiA9IF9iYXIkdmFsdWVBeGlzLmxpbmVQb3NpdGlvbjtcbiAgICB2YXIgc3RhcnRQb3MgPSBnZXRWYWx1ZVBvcyhtaW5WYWx1ZSwgbWF4VmFsdWUsIG1pblZhbHVlIDwgMCA/IDAgOiBtaW5WYWx1ZSwgbGluZVBvc2l0aW9uLCBheGlzKTtcbiAgICB2YXIgZW5kUG9zID0gZGF0YS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiBnZXRWYWx1ZVBvcyhtaW5WYWx1ZSwgbWF4VmFsdWUsIHYsIGxpbmVQb3NpdGlvbiwgYXhpcyk7XG4gICAgfSk7XG4gICAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGVuZFBvcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiBbc3RhcnRQb3MsIHBdO1xuICAgIH0pO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBiYXIsIHtcbiAgICAgIGJhclZhbHVlQXhpc1BvczogYmFyVmFsdWVBeGlzUG9zXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBlbGltaW5hdGVOb25OdW1iZXJEYXRhKGJhckl0ZW0sIGJhckRhdGEpIHtcbiAgdmFyIGRhdGEgPSBiYXJJdGVtLmRhdGE7XG4gIHJldHVybiBiYXJEYXRhLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiB0eXBlb2YgZGF0YVtpXSA9PT0gJ251bWJlcicgPyB2IDogbnVsbDtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQgIT09IG51bGw7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBlbGltaW5hdGVOdWxsQmFyTGFiZWxBeGlzKGJhcnMpIHtcbiAgcmV0dXJuIGJhcnMubWFwKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgYmFyTGFiZWxBeGlzUG9zID0gYmFyLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgICAgZGF0YSA9IGJhci5kYXRhO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgaWYgKHR5cGVvZiBkID09PSAnbnVtYmVyJykgcmV0dXJuO1xuICAgICAgYmFyTGFiZWxBeGlzUG9zW2ldID0gbnVsbDtcbiAgICB9KTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYmFyLCB7XG4gICAgICBiYXJMYWJlbEF4aXNQb3M6IGJhckxhYmVsQXhpc1Bvcy5maWx0ZXIoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHAgIT09IG51bGw7XG4gICAgICB9KVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24ga2VlcFNhbWVOdW1CZXR3ZWVuQmFyQW5kRGF0YShiYXJzKSB7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIGRhdGEgPSBiYXIuZGF0YSxcbiAgICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFyLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgICAgYmFyVmFsdWVBeGlzUG9zID0gYmFyLmJhclZhbHVlQXhpc1BvcztcbiAgICB2YXIgZGF0YU51bSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGQgPT09ICdudW1iZXInO1xuICAgIH0pLmxlbmd0aDtcbiAgICB2YXIgYXhpc1Bvc051bSA9IGJhckxhYmVsQXhpc1Bvcy5sZW5ndGg7XG5cbiAgICBpZiAoYXhpc1Bvc051bSA+IGRhdGFOdW0pIHtcbiAgICAgIGJhckxhYmVsQXhpc1Bvcy5zcGxpY2UoZGF0YU51bSk7XG4gICAgICBiYXJWYWx1ZUF4aXNQb3Muc3BsaWNlKGRhdGFOdW0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBiYXJzO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZVBvcyhtaW4sIG1heCwgdmFsdWUsIGxpbmVQb3NpdGlvbiwgYXhpcykge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykgcmV0dXJuIG51bGw7XG4gIHZhciB2YWx1ZU1pbnVzID0gbWF4IC0gbWluO1xuICB2YXIgY29vcmRpbmF0ZUluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBwb3NNaW51cyA9IGxpbmVQb3NpdGlvblsxXVtjb29yZGluYXRlSW5kZXhdIC0gbGluZVBvc2l0aW9uWzBdW2Nvb3JkaW5hdGVJbmRleF07XG4gIHZhciBwZXJjZW50ID0gKHZhbHVlIC0gbWluKSAvIHZhbHVlTWludXM7XG4gIGlmICh2YWx1ZU1pbnVzID09PSAwKSBwZXJjZW50ID0gMDtcbiAgdmFyIHBvcyA9IHBlcmNlbnQgKiBwb3NNaW51cztcbiAgcmV0dXJuIHBvcyArIGxpbmVQb3NpdGlvblswXVtjb29yZGluYXRlSW5kZXhdO1xufVxuXG5mdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQmFyQ29uZmlnKGJhckl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYmFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYmFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGJhckl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0QmFja2dyb3VuZEJhclNoYXBlcyhiYXJJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0QmFja2dyb3VuZEJhclN0eWxlKGJhckl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3JlY3QnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGJhckl0ZW0uYmFja2dyb3VuZEJhci5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRCYXJTaGFwZXMoYmFySXRlbSkge1xuICB2YXIgbGFiZWxBeGlzID0gYmFySXRlbS5sYWJlbEF4aXMsXG4gICAgICB2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcztcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGxhYmVsQXhpcy50aWNrUG9zaXRpb247XG4gIHZhciBheGlzID0gdmFsdWVBeGlzLmF4aXMsXG4gICAgICBsaW5lUG9zaXRpb24gPSB2YWx1ZUF4aXMubGluZVBvc2l0aW9uO1xuICB2YXIgd2lkdGggPSBnZXRCYWNrZ3JvdW5kQmFyV2lkdGgoYmFySXRlbSk7XG4gIHZhciBoYWx0V2lkdGggPSB3aWR0aCAvIDI7XG4gIHZhciBwb3NJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgY2VudGVyUG9zID0gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAocCkge1xuICAgIHJldHVybiBwWzEgLSBwb3NJbmRleF07XG4gIH0pO1xuICB2YXIgX3JlZjkgPSBbbGluZVBvc2l0aW9uWzBdW3Bvc0luZGV4XSwgbGluZVBvc2l0aW9uWzFdW3Bvc0luZGV4XV0sXG4gICAgICBzdGFydCA9IF9yZWY5WzBdLFxuICAgICAgZW5kID0gX3JlZjlbMV07XG4gIHJldHVybiBjZW50ZXJQb3MubWFwKGZ1bmN0aW9uIChjZW50ZXIpIHtcbiAgICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBzdGFydCxcbiAgICAgICAgeTogY2VudGVyIC0gaGFsdFdpZHRoLFxuICAgICAgICB3OiBlbmQgLSBzdGFydCxcbiAgICAgICAgaDogd2lkdGhcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IGNlbnRlciAtIGhhbHRXaWR0aCxcbiAgICAgICAgeTogZW5kLFxuICAgICAgICB3OiB3aWR0aCxcbiAgICAgICAgaDogc3RhcnQgLSBlbmRcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJhcldpZHRoKGJhckl0ZW0pIHtcbiAgdmFyIGJhckFsbFdpZHRoQW5kR2FwID0gYmFySXRlbS5iYXJBbGxXaWR0aEFuZEdhcCxcbiAgICAgIGJhckNhdGVnb3J5V2lkdGggPSBiYXJJdGVtLmJhckNhdGVnb3J5V2lkdGgsXG4gICAgICBiYWNrZ3JvdW5kQmFyID0gYmFySXRlbS5iYWNrZ3JvdW5kQmFyO1xuICB2YXIgd2lkdGggPSBiYWNrZ3JvdW5kQmFyLndpZHRoO1xuICBpZiAodHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJykgcmV0dXJuIHdpZHRoO1xuICBpZiAod2lkdGggPT09ICdhdXRvJykgcmV0dXJuIGJhckFsbFdpZHRoQW5kR2FwO1xuICByZXR1cm4gcGFyc2VJbnQod2lkdGgpIC8gMTAwICogYmFyQ2F0ZWdvcnlXaWR0aDtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJhclN0eWxlKGJhckl0ZW0pIHtcbiAgcmV0dXJuIGJhckl0ZW0uYmFja2dyb3VuZEJhci5zdHlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyQ29uZmlnKGJhckl0ZW0pIHtcbiAgdmFyIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBiYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBiYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYmFySXRlbS5yTGV2ZWw7XG4gIHZhciBuYW1lID0gZ2V0QmFyTmFtZShiYXJJdGVtKTtcbiAgcmV0dXJuIGJhckxhYmVsQXhpc1Bvcy5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRCYXJTaGFwZShiYXJJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRCYXJTdHlsZShiYXJJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJOYW1lKGJhckl0ZW0pIHtcbiAgdmFyIHNoYXBlVHlwZSA9IGJhckl0ZW0uc2hhcGVUeXBlO1xuICBpZiAoc2hhcGVUeXBlID09PSAnbGVmdEVjaGVsb24nIHx8IHNoYXBlVHlwZSA9PT0gJ3JpZ2h0RWNoZWxvbicpIHJldHVybiAncG9seWxpbmUnO1xuICByZXR1cm4gJ3JlY3QnO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJTaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBzaGFwZVR5cGUgPSBiYXJJdGVtLnNoYXBlVHlwZTtcblxuICBpZiAoc2hhcGVUeXBlID09PSAnbGVmdEVjaGVsb24nKSB7XG4gICAgcmV0dXJuIGdldExlZnRFY2hlbG9uU2hhcGUoYmFySXRlbSwgaSk7XG4gIH0gZWxzZSBpZiAoc2hhcGVUeXBlID09PSAncmlnaHRFY2hlbG9uJykge1xuICAgIHJldHVybiBnZXRSaWdodEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZ2V0Tm9ybWFsQmFyU2hhcGUoYmFySXRlbSwgaSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGVmdEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYmFyV2lkdGggPSBiYXJJdGVtLmJhcldpZHRoLFxuICAgICAgZWNoZWxvbk9mZnNldCA9IGJhckl0ZW0uZWNoZWxvbk9mZnNldDtcblxuICB2YXIgX2JhclZhbHVlQXhpc1BvcyRpID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaVswXSxcbiAgICAgIGVuZCA9IF9iYXJWYWx1ZUF4aXNQb3MkaVsxXTtcblxuICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICB2YXIgaGFsZldpZHRoID0gYmFyV2lkdGggLyAyO1xuICB2YXIgdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHBvaW50cyA9IFtdO1xuXG4gIGlmICh2YWx1ZUF4aXMgPT09ICd4Jykge1xuICAgIHBvaW50c1swXSA9IFtlbmQsIGxhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzFdID0gW2VuZCwgbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoXTtcbiAgICBwb2ludHNbMl0gPSBbc3RhcnQsIGxhYmVsQXhpc1BvcyArIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzNdID0gW3N0YXJ0ICsgZWNoZWxvbk9mZnNldCwgbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoXTtcbiAgICBpZiAoZW5kIC0gc3RhcnQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDMsIDEpO1xuICB9IGVsc2Uge1xuICAgIHBvaW50c1swXSA9IFtsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGgsIGVuZF07XG4gICAgcG9pbnRzWzFdID0gW2xhYmVsQXhpc1BvcyArIGhhbGZXaWR0aCwgZW5kXTtcbiAgICBwb2ludHNbMl0gPSBbbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoLCBzdGFydF07XG4gICAgcG9pbnRzWzNdID0gW2xhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aCwgc3RhcnQgLSBlY2hlbG9uT2Zmc2V0XTtcbiAgICBpZiAoc3RhcnQgLSBlbmQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDMsIDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRSaWdodEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYmFyV2lkdGggPSBiYXJJdGVtLmJhcldpZHRoLFxuICAgICAgZWNoZWxvbk9mZnNldCA9IGJhckl0ZW0uZWNoZWxvbk9mZnNldDtcblxuICB2YXIgX2JhclZhbHVlQXhpc1BvcyRpMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShiYXJWYWx1ZUF4aXNQb3NbaV0sIDIpLFxuICAgICAgc3RhcnQgPSBfYmFyVmFsdWVBeGlzUG9zJGkyWzBdLFxuICAgICAgZW5kID0gX2JhclZhbHVlQXhpc1BvcyRpMlsxXTtcblxuICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICB2YXIgaGFsZldpZHRoID0gYmFyV2lkdGggLyAyO1xuICB2YXIgdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHBvaW50cyA9IFtdO1xuXG4gIGlmICh2YWx1ZUF4aXMgPT09ICd4Jykge1xuICAgIHBvaW50c1swXSA9IFtlbmQsIGxhYmVsQXhpc1BvcyArIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzFdID0gW2VuZCwgbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoXTtcbiAgICBwb2ludHNbMl0gPSBbc3RhcnQsIGxhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzNdID0gW3N0YXJ0ICsgZWNoZWxvbk9mZnNldCwgbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoXTtcbiAgICBpZiAoZW5kIC0gc3RhcnQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDIsIDEpO1xuICB9IGVsc2Uge1xuICAgIHBvaW50c1swXSA9IFtsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGgsIGVuZF07XG4gICAgcG9pbnRzWzFdID0gW2xhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aCwgZW5kXTtcbiAgICBwb2ludHNbMl0gPSBbbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoLCBzdGFydF07XG4gICAgcG9pbnRzWzNdID0gW2xhYmVsQXhpc1BvcyArIGhhbGZXaWR0aCwgc3RhcnQgLSBlY2hlbG9uT2Zmc2V0XTtcbiAgICBpZiAoc3RhcnQgLSBlbmQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDIsIDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROb3JtYWxCYXJTaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYmFyV2lkdGggPSBiYXJJdGVtLmJhcldpZHRoO1xuXG4gIHZhciBfYmFyVmFsdWVBeGlzUG9zJGkzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTNbMF0sXG4gICAgICBlbmQgPSBfYmFyVmFsdWVBeGlzUG9zJGkzWzFdO1xuXG4gIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gIHZhciB2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICB2YXIgc2hhcGUgPSB7fTtcblxuICBpZiAodmFsdWVBeGlzID09PSAneCcpIHtcbiAgICBzaGFwZS54ID0gc3RhcnQ7XG4gICAgc2hhcGUueSA9IGxhYmVsQXhpc1BvcyAtIGJhcldpZHRoIC8gMjtcbiAgICBzaGFwZS53ID0gZW5kIC0gc3RhcnQ7XG4gICAgc2hhcGUuaCA9IGJhcldpZHRoO1xuICB9IGVsc2Uge1xuICAgIHNoYXBlLnggPSBsYWJlbEF4aXNQb3MgLSBiYXJXaWR0aCAvIDI7XG4gICAgc2hhcGUueSA9IGVuZDtcbiAgICBzaGFwZS53ID0gYmFyV2lkdGg7XG4gICAgc2hhcGUuaCA9IHN0YXJ0IC0gZW5kO1xuICB9XG5cbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJTdHlsZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJTdHlsZSA9IGJhckl0ZW0uYmFyU3R5bGUsXG4gICAgICBncmFkaWVudCA9IGJhckl0ZW0uZ3JhZGllbnQsXG4gICAgICBjb2xvciA9IGJhckl0ZW0uY29sb3I7XG4gIHZhciBmaWxsQ29sb3IgPSBbYmFyU3R5bGUuZmlsbCB8fCBjb2xvcl07XG4gIHZhciBncmFkaWVudENvbG9yID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKGZpbGxDb2xvciwgZ3JhZGllbnQuY29sb3IpO1xuICBpZiAoZ3JhZGllbnRDb2xvci5sZW5ndGggPT09IDEpIGdyYWRpZW50Q29sb3IucHVzaChncmFkaWVudENvbG9yWzBdKTtcbiAgdmFyIGdyYWRpZW50UGFyYW1zID0gZ2V0R3JhZGllbnRQYXJhbXMoYmFySXRlbSwgaSk7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGdyYWRpZW50Q29sb3I6IGdyYWRpZW50Q29sb3IsXG4gICAgZ3JhZGllbnRQYXJhbXM6IGdyYWRpZW50UGFyYW1zLFxuICAgIGdyYWRpZW50VHlwZTogJ2xpbmVhcicsXG4gICAgZ3JhZGllbnRXaXRoOiAnZmlsbCdcbiAgfSwgYmFyU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRHcmFkaWVudFBhcmFtcyhiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgZGF0YSA9IGJhckl0ZW0uZGF0YTtcbiAgdmFyIF9iYXJJdGVtJHZhbHVlQXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLFxuICAgICAgbGluZVBvc2l0aW9uID0gX2Jhckl0ZW0kdmFsdWVBeGlzLmxpbmVQb3NpdGlvbixcbiAgICAgIGF4aXMgPSBfYmFySXRlbSR2YWx1ZUF4aXMuYXhpcztcblxuICB2YXIgX2JhclZhbHVlQXhpc1BvcyRpNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShiYXJWYWx1ZUF4aXNQb3NbaV0sIDIpLFxuICAgICAgc3RhcnQgPSBfYmFyVmFsdWVBeGlzUG9zJGk0WzBdLFxuICAgICAgZW5kID0gX2JhclZhbHVlQXhpc1BvcyRpNFsxXTtcblxuICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICB2YXIgdmFsdWUgPSBkYXRhW2ldO1xuXG4gIHZhciBfbGluZVBvc2l0aW9uID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb3NpdGlvbiwgMiksXG4gICAgICBsaW5lU3RhcnQgPSBfbGluZVBvc2l0aW9uWzBdLFxuICAgICAgbGluZUVuZCA9IF9saW5lUG9zaXRpb25bMV07XG5cbiAgdmFyIHZhbHVlQXhpc0luZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBlbmRQb3MgPSBlbmQ7XG5cbiAgaWYgKCFiYXJJdGVtLmdyYWRpZW50LmxvY2FsKSB7XG4gICAgZW5kUG9zID0gdmFsdWUgPCAwID8gbGluZVN0YXJ0W3ZhbHVlQXhpc0luZGV4XSA6IGxpbmVFbmRbdmFsdWVBeGlzSW5kZXhdO1xuICB9XG5cbiAgaWYgKGF4aXMgPT09ICd5Jykge1xuICAgIHJldHVybiBbbGFiZWxBeGlzUG9zLCBlbmRQb3MsIGxhYmVsQXhpc1Bvcywgc3RhcnRdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbZW5kUG9zLCBsYWJlbEF4aXNQb3MsIHN0YXJ0LCBsYWJlbEF4aXNQb3NdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0QmFyQ29uZmlnKGJhckl0ZW0pIHtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRCYXJDb25maWcoYmFySXRlbSk7XG4gIHZhciBzaGFwZVR5cGUgPSBiYXJJdGVtLnNoYXBlVHlwZTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICB2YXIgc2hhcGUgPSBjb25maWcuc2hhcGU7XG5cbiAgICBpZiAoc2hhcGVUeXBlID09PSAnbGVmdEVjaGVsb24nKSB7XG4gICAgICBzaGFwZSA9IGdldFN0YXJ0TGVmdEVjaGVsb25TaGFwZShzaGFwZSwgYmFySXRlbSk7XG4gICAgfSBlbHNlIGlmIChzaGFwZVR5cGUgPT09ICdyaWdodEVjaGVsb24nKSB7XG4gICAgICBzaGFwZSA9IGdldFN0YXJ0UmlnaHRFY2hlbG9uU2hhcGUoc2hhcGUsIGJhckl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzaGFwZSA9IGdldFN0YXJ0Tm9ybWFsQmFyU2hhcGUoc2hhcGUsIGJhckl0ZW0pO1xuICAgIH1cblxuICAgIGNvbmZpZy5zaGFwZSA9IHNoYXBlO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0TGVmdEVjaGVsb25TaGFwZShzaGFwZSwgYmFySXRlbSkge1xuICB2YXIgYXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHNoYXBlID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoc2hhcGUpO1xuICB2YXIgX3NoYXBlID0gc2hhcGUsXG4gICAgICBwb2ludHMgPSBfc2hhcGUucG9pbnRzO1xuICB2YXIgaW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIHN0YXJ0ID0gcG9pbnRzWzJdW2luZGV4XTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgcmV0dXJuIHBvaW50W2luZGV4XSA9IHN0YXJ0O1xuICB9KTtcbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydFJpZ2h0RWNoZWxvblNoYXBlKHNoYXBlLCBiYXJJdGVtKSB7XG4gIHZhciBheGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgc2hhcGUgPSAoMCwgX3V0aWwuZGVlcENsb25lKShzaGFwZSk7XG4gIHZhciBfc2hhcGUyID0gc2hhcGUsXG4gICAgICBwb2ludHMgPSBfc2hhcGUyLnBvaW50cztcbiAgdmFyIGluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBzdGFydCA9IHBvaW50c1syXVtpbmRleF07XG4gIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCkge1xuICAgIHJldHVybiBwb2ludFtpbmRleF0gPSBzdGFydDtcbiAgfSk7XG4gIHJldHVybiBzaGFwZTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnROb3JtYWxCYXJTaGFwZShzaGFwZSwgYmFySXRlbSkge1xuICB2YXIgYXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHZhciB4ID0gc2hhcGUueCxcbiAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgdyA9IHNoYXBlLncsXG4gICAgICBoID0gc2hhcGUuaDtcblxuICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgdyA9IDA7XG4gIH0gZWxzZSB7XG4gICAgeSA9IHkgKyBoO1xuICAgIGggPSAwO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB4OiB4LFxuICAgIHk6IHksXG4gICAgdzogdyxcbiAgICBoOiBoXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZUJhcihncmFwaHMsIGJhckl0ZW0sIGksIHVwZGF0ZXIpIHtcbiAgdmFyIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgbmFtZSA9IGdldEJhck5hbWUoYmFySXRlbSk7XG5cbiAgaWYgKGdyYXBoc1tpXSAmJiBncmFwaHNbaV1bMF0ubmFtZSAhPT0gbmFtZSkge1xuICAgIGdyYXBoc1tpXS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICAgIH0pO1xuICAgIGdyYXBoc1tpXSA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxDb25maWcoYmFySXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBiYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBiYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYmFySXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRMYWJlbFNoYXBlcyhiYXJJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0TGFiZWxTdHlsZShiYXJJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBiYXJJdGVtLmxhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTaGFwZXMoYmFySXRlbSkge1xuICB2YXIgY29udGVudHMgPSBnZXRGb3JtYXR0ZXJMYWJlbHMoYmFySXRlbSk7XG4gIHZhciBwb3NpdGlvbiA9IGdldExhYmVsc1Bvc2l0aW9uKGJhckl0ZW0pO1xuICByZXR1cm4gcG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb3MsIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IHBvcyxcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnRzW2ldXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEZvcm1hdHRlckxhYmVscyhiYXJJdGVtKSB7XG4gIHZhciBkYXRhID0gYmFySXRlbS5kYXRhLFxuICAgICAgbGFiZWwgPSBiYXJJdGVtLmxhYmVsO1xuICB2YXIgZm9ybWF0dGVyID0gbGFiZWwuZm9ybWF0dGVyO1xuICBkYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gdHlwZW9mIGQgPT09ICdudW1iZXInO1xuICB9KS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZC50b1N0cmluZygpO1xuICB9KTtcbiAgaWYgKCFmb3JtYXR0ZXIpIHJldHVybiBkYXRhO1xuICB2YXIgdHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gIGlmICh0eXBlID09PSAnc3RyaW5nJykgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9JywgZCk7XG4gIH0pO1xuICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlcih7XG4gICAgICB2YWx1ZTogZCxcbiAgICAgIGluZGV4OiBpXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxzUG9zaXRpb24oYmFySXRlbSkge1xuICB2YXIgbGFiZWwgPSBiYXJJdGVtLmxhYmVsLFxuICAgICAgYmFyVmFsdWVBeGlzUG9zID0gYmFySXRlbS5iYXJWYWx1ZUF4aXNQb3MsXG4gICAgICBiYXJMYWJlbEF4aXNQb3MgPSBiYXJJdGVtLmJhckxhYmVsQXhpc1BvcztcbiAgdmFyIHBvc2l0aW9uID0gbGFiZWwucG9zaXRpb24sXG4gICAgICBvZmZzZXQgPSBsYWJlbC5vZmZzZXQ7XG4gIHZhciBheGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgcmV0dXJuIGJhclZhbHVlQXhpc1Bvcy5tYXAoZnVuY3Rpb24gKF9yZWYxMCwgaSkge1xuICAgIHZhciBfcmVmMTEgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLCAyKSxcbiAgICAgICAgc3RhcnQgPSBfcmVmMTFbMF0sXG4gICAgICAgIGVuZCA9IF9yZWYxMVsxXTtcblxuICAgIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gICAgdmFyIHBvcyA9IFtlbmQsIGxhYmVsQXhpc1Bvc107XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICBwb3MgPSBbc3RhcnQsIGxhYmVsQXhpc1Bvc107XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uID09PSAnY2VudGVyJykge1xuICAgICAgcG9zID0gWyhzdGFydCArIGVuZCkgLyAyLCBsYWJlbEF4aXNQb3NdO1xuICAgIH1cblxuICAgIGlmIChheGlzID09PSAneScpIHBvcy5yZXZlcnNlKCk7XG4gICAgcmV0dXJuIGdldE9mZnNldGVkUG9pbnQocG9zLCBvZmZzZXQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0ZWRQb2ludChfcmVmMTIsIF9yZWYxMykge1xuICB2YXIgX3JlZjE0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMiwgMiksXG4gICAgICB4ID0gX3JlZjE0WzBdLFxuICAgICAgeSA9IF9yZWYxNFsxXTtcblxuICB2YXIgX3JlZjE1ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMywgMiksXG4gICAgICBveCA9IF9yZWYxNVswXSxcbiAgICAgIG95ID0gX3JlZjE1WzFdO1xuXG4gIHJldHVybiBbeCArIG94LCB5ICsgb3ldO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFN0eWxlKGJhckl0ZW0pIHtcbiAgdmFyIGNvbG9yID0gYmFySXRlbS5jb2xvcixcbiAgICAgIHN0eWxlID0gYmFySXRlbS5sYWJlbC5zdHlsZSxcbiAgICAgIGdjID0gYmFySXRlbS5ncmFkaWVudC5jb2xvcjtcbiAgaWYgKGdjLmxlbmd0aCkgY29sb3IgPSBnY1swXTtcbiAgc3R5bGUgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbiAgcmV0dXJuIHN0eWxlO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2F1Z2UgPSBnYXVnZTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfZ2F1Z2UgPSByZXF1aXJlKFwiLi4vY29uZmlnL2dhdWdlXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gZ2F1Z2UoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICBpZiAoIXNlcmllcykgc2VyaWVzID0gW107XG4gIHZhciBnYXVnZXMgPSAoMCwgX3V0aWwyLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9nYXVnZS5nYXVnZUNvbmZpZywgJ2dhdWdlJyk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNDZW50ZXIoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNSYWRpdXMoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNEYXRhUmFkaXVzQW5kTGluZVdpZHRoKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzRGF0YUFuZ2xlcyhnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RhdGFHcmFkaWVudChnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0F4aXNUaWNrUG9zaXRpb24oZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNMYWJlbFBvc2l0aW9uQW5kQWxpZ24oZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNMYWJlbERhdGEoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNEZXRhaWxzUG9zaXRpb24oZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNEZXRhaWxzQ29udGVudChnYXVnZXMsIGNoYXJ0KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlQXhpc1RpY2snLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRBeGlzVGlja0NvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlQXhpc0xhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXhpc0xhYmVsQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VCYWNrZ3JvdW5kQXJjJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QmFja2dyb3VuZEFyY0NvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydEJhY2tncm91bmRBcmNDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZUFyYycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEFyY0NvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydEFyY0NvbmZpZyxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZUFyY1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlUG9pbnRlcicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFBvaW50ZXJDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRQb2ludGVyQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VEZXRhaWxzJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0RGV0YWlsc0NvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0NlbnRlcihnYXVnZXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcjtcbiAgICBjZW50ZXIgPSBjZW50ZXIubWFwKGZ1bmN0aW9uIChwb3MsIGkpIHtcbiAgICAgIGlmICh0eXBlb2YgcG9zID09PSAnbnVtYmVyJykgcmV0dXJuIHBvcztcbiAgICAgIHJldHVybiBwYXJzZUludChwb3MpIC8gMTAwICogYXJlYVtpXTtcbiAgICB9KTtcbiAgICBnYXVnZUl0ZW0uY2VudGVyID0gY2VudGVyO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc1JhZGl1cyhnYXVnZXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFyZWEpKSAvIDI7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cztcblxuICAgIGlmICh0eXBlb2YgcmFkaXVzICE9PSAnbnVtYmVyJykge1xuICAgICAgcmFkaXVzID0gcGFyc2VJbnQocmFkaXVzKSAvIDEwMCAqIG1heFJhZGl1cztcbiAgICB9XG5cbiAgICBnYXVnZUl0ZW0ucmFkaXVzID0gcmFkaXVzO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0RhdGFSYWRpdXNBbmRMaW5lV2lkdGgoZ2F1Z2VzLCBjaGFydCkge1xuICB2YXIgYXJlYSA9IGNoYXJ0LnJlbmRlci5hcmVhO1xuICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhcmVhKSkgLyAyO1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIHJhZGl1cyA9IGdhdWdlSXRlbS5yYWRpdXMsXG4gICAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgICAgYXJjTGluZVdpZHRoID0gZ2F1Z2VJdGVtLmFyY0xpbmVXaWR0aDtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBhcmNSYWRpdXMgPSBpdGVtLnJhZGl1cyxcbiAgICAgICAgICBsaW5lV2lkdGggPSBpdGVtLmxpbmVXaWR0aDtcbiAgICAgIGlmICghYXJjUmFkaXVzKSBhcmNSYWRpdXMgPSByYWRpdXM7XG4gICAgICBpZiAodHlwZW9mIGFyY1JhZGl1cyAhPT0gJ251bWJlcicpIGFyY1JhZGl1cyA9IHBhcnNlSW50KGFyY1JhZGl1cykgLyAxMDAgKiBtYXhSYWRpdXM7XG4gICAgICBpdGVtLnJhZGl1cyA9IGFyY1JhZGl1cztcbiAgICAgIGlmICghbGluZVdpZHRoKSBsaW5lV2lkdGggPSBhcmNMaW5lV2lkdGg7XG4gICAgICBpdGVtLmxpbmVXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEYXRhQW5nbGVzKGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gZ2F1Z2VJdGVtLmVuZEFuZ2xlLFxuICAgICAgICBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICAgIG1pbiA9IGdhdWdlSXRlbS5taW4sXG4gICAgICAgIG1heCA9IGdhdWdlSXRlbS5tYXg7XG4gICAgdmFyIGFuZ2xlTWludXMgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGU7XG4gICAgdmFyIHZhbHVlTWludXMgPSBtYXggLSBtaW47XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpdGVtLnZhbHVlO1xuICAgICAgdmFyIGl0ZW1BbmdsZSA9IE1hdGguYWJzKCh2YWx1ZSAtIG1pbikgLyB2YWx1ZU1pbnVzICogYW5nbGVNaW51cyk7XG4gICAgICBpdGVtLnN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlO1xuICAgICAgaXRlbS5lbmRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBpdGVtQW5nbGU7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzRGF0YUdyYWRpZW50KGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGE7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29sb3IgPSBpdGVtLmNvbG9yLFxuICAgICAgICAgIGdyYWRpZW50ID0gaXRlbS5ncmFkaWVudDtcbiAgICAgIGlmICghZ3JhZGllbnQgfHwgIWdyYWRpZW50Lmxlbmd0aCkgZ3JhZGllbnQgPSBjb2xvcjtcbiAgICAgIGlmICghKGdyYWRpZW50IGluc3RhbmNlb2YgQXJyYXkpKSBncmFkaWVudCA9IFtncmFkaWVudF07XG4gICAgICBpdGVtLmdyYWRpZW50ID0gZ3JhZGllbnQ7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzQXhpc1RpY2tQb3NpdGlvbihnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IGdhdWdlSXRlbS5lbmRBbmdsZSxcbiAgICAgICAgc3BsaXROdW0gPSBnYXVnZUl0ZW0uc3BsaXROdW0sXG4gICAgICAgIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXIsXG4gICAgICAgIHJhZGl1cyA9IGdhdWdlSXRlbS5yYWRpdXMsXG4gICAgICAgIGFyY0xpbmVXaWR0aCA9IGdhdWdlSXRlbS5hcmNMaW5lV2lkdGgsXG4gICAgICAgIGF4aXNUaWNrID0gZ2F1Z2VJdGVtLmF4aXNUaWNrO1xuICAgIHZhciB0aWNrTGVuZ3RoID0gYXhpc1RpY2sudGlja0xlbmd0aCxcbiAgICAgICAgbGluZVdpZHRoID0gYXhpc1RpY2suc3R5bGUubGluZVdpZHRoO1xuICAgIHZhciBhbmdsZXMgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGU7XG4gICAgdmFyIG91dGVyUmFkaXVzID0gcmFkaXVzIC0gYXJjTGluZVdpZHRoIC8gMjtcbiAgICB2YXIgaW5uZXJSYWRpdXMgPSBvdXRlclJhZGl1cyAtIHRpY2tMZW5ndGg7XG4gICAgdmFyIGFuZ2xlR2FwID0gYW5nbGVzIC8gKHNwbGl0TnVtIC0gMSk7XG4gICAgdmFyIGFyY0xlbmd0aCA9IDIgKiBNYXRoLlBJICogcmFkaXVzICogYW5nbGVzIC8gKE1hdGguUEkgKiAyKTtcbiAgICB2YXIgb2Zmc2V0ID0gTWF0aC5jZWlsKGxpbmVXaWR0aCAvIDIpIC8gYXJjTGVuZ3RoICogYW5nbGVzO1xuICAgIGdhdWdlSXRlbS50aWNrQW5nbGVzID0gW107XG4gICAgZ2F1Z2VJdGVtLnRpY2tJbm5lclJhZGl1cyA9IFtdO1xuICAgIGdhdWdlSXRlbS50aWNrUG9zaXRpb24gPSBuZXcgQXJyYXkoc3BsaXROdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICAgIHZhciBhbmdsZSA9IHN0YXJ0QW5nbGUgKyBhbmdsZUdhcCAqIGk7XG4gICAgICBpZiAoaSA9PT0gMCkgYW5nbGUgKz0gb2Zmc2V0O1xuICAgICAgaWYgKGkgPT09IHNwbGl0TnVtIC0gMSkgYW5nbGUgLT0gb2Zmc2V0O1xuICAgICAgZ2F1Z2VJdGVtLnRpY2tBbmdsZXNbaV0gPSBhbmdsZTtcbiAgICAgIGdhdWdlSXRlbS50aWNrSW5uZXJSYWRpdXNbaV0gPSBpbm5lclJhZGl1cztcbiAgICAgIHJldHVybiBbX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtvdXRlclJhZGl1cywgYW5nbGVdKSksIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbaW5uZXJSYWRpdXMsIGFuZ2xlXSkpXTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNMYWJlbFBvc2l0aW9uQW5kQWxpZ24oZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXIsXG4gICAgICAgIHRpY2tJbm5lclJhZGl1cyA9IGdhdWdlSXRlbS50aWNrSW5uZXJSYWRpdXMsXG4gICAgICAgIHRpY2tBbmdsZXMgPSBnYXVnZUl0ZW0udGlja0FuZ2xlcyxcbiAgICAgICAgbGFiZWxHYXAgPSBnYXVnZUl0ZW0uYXhpc0xhYmVsLmxhYmVsR2FwO1xuICAgIHZhciBwb3NpdGlvbiA9IHRpY2tBbmdsZXMubWFwKGZ1bmN0aW9uIChhbmdsZSwgaSkge1xuICAgICAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbdGlja0lubmVyUmFkaXVzW2ldIC0gbGFiZWxHYXAsIHRpY2tBbmdsZXNbaV1dKSk7XG4gICAgfSk7XG4gICAgdmFyIGFsaWduID0gcG9zaXRpb24ubWFwKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICB2YXIgX3JlZjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZiwgMiksXG4gICAgICAgICAgeCA9IF9yZWYyWzBdLFxuICAgICAgICAgIHkgPSBfcmVmMlsxXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dEFsaWduOiB4ID4gY2VudGVyWzBdID8gJ3JpZ2h0JyA6ICdsZWZ0JyxcbiAgICAgICAgdGV4dEJhc2VsaW5lOiB5ID4gY2VudGVyWzFdID8gJ2JvdHRvbScgOiAndG9wJ1xuICAgICAgfTtcbiAgICB9KTtcbiAgICBnYXVnZUl0ZW0ubGFiZWxQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIGdhdWdlSXRlbS5sYWJlbEFsaWduID0gYWxpZ247XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzTGFiZWxEYXRhKGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBheGlzTGFiZWwgPSBnYXVnZUl0ZW0uYXhpc0xhYmVsLFxuICAgICAgICBtaW4gPSBnYXVnZUl0ZW0ubWluLFxuICAgICAgICBtYXggPSBnYXVnZUl0ZW0ubWF4LFxuICAgICAgICBzcGxpdE51bSA9IGdhdWdlSXRlbS5zcGxpdE51bTtcbiAgICB2YXIgZGF0YSA9IGF4aXNMYWJlbC5kYXRhLFxuICAgICAgICBmb3JtYXR0ZXIgPSBheGlzTGFiZWwuZm9ybWF0dGVyO1xuICAgIHZhciB2YWx1ZUdhcCA9IChtYXggLSBtaW4pIC8gKHNwbGl0TnVtIC0gMSk7XG4gICAgdmFyIHZhbHVlID0gbmV3IEFycmF5KHNwbGl0TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQobWluICsgdmFsdWVHYXAgKiBpKTtcbiAgICB9KTtcbiAgICB2YXIgZm9ybWF0dGVyVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gICAgZGF0YSA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh2YWx1ZSwgZGF0YSkubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICB2YXIgbGFiZWwgPSB2O1xuXG4gICAgICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbGFiZWwgPSBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsIHYpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBsYWJlbCA9IGZvcm1hdHRlcih7XG4gICAgICAgICAgdmFsdWU6IHYsXG4gICAgICAgICAgaW5kZXg6IGlcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9KTtcbiAgICBheGlzTGFiZWwuZGF0YSA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzRGV0YWlsc1Bvc2l0aW9uKGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICAgIGRldGFpbHMgPSBnYXVnZUl0ZW0uZGV0YWlscyxcbiAgICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcjtcbiAgICB2YXIgcG9zaXRpb24gPSBkZXRhaWxzLnBvc2l0aW9uLFxuICAgICAgICBvZmZzZXQgPSBkZXRhaWxzLm9mZnNldDtcbiAgICB2YXIgZGV0YWlsc1Bvc2l0aW9uID0gZGF0YS5tYXAoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgICB2YXIgc3RhcnRBbmdsZSA9IF9yZWYzLnN0YXJ0QW5nbGUsXG4gICAgICAgICAgZW5kQW5nbGUgPSBfcmVmMy5lbmRBbmdsZSxcbiAgICAgICAgICByYWRpdXMgPSBfcmVmMy5yYWRpdXM7XG4gICAgICB2YXIgcG9pbnQgPSBudWxsO1xuXG4gICAgICBpZiAocG9zaXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICAgIHBvaW50ID0gY2VudGVyO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3N0YXJ0Jykge1xuICAgICAgICBwb2ludCA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzLCBzdGFydEFuZ2xlXSkpO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ2VuZCcpIHtcbiAgICAgICAgcG9pbnQgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1cywgZW5kQW5nbGVdKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnZXRPZmZzZXRlZFBvaW50KHBvaW50LCBvZmZzZXQpO1xuICAgIH0pO1xuICAgIGdhdWdlSXRlbS5kZXRhaWxzUG9zaXRpb24gPSBkZXRhaWxzUG9zaXRpb247XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzRGV0YWlsc0NvbnRlbnQoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgICAgZGV0YWlscyA9IGdhdWdlSXRlbS5kZXRhaWxzO1xuICAgIHZhciBmb3JtYXR0ZXIgPSBkZXRhaWxzLmZvcm1hdHRlcjtcbiAgICB2YXIgZm9ybWF0dGVyVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gICAgdmFyIGNvbnRlbnRzID0gZGF0YS5tYXAoZnVuY3Rpb24gKGRhdGFJdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IGRhdGFJdGVtLnZhbHVlO1xuXG4gICAgICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29udGVudCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9JywgJ3tudH0nKTtcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgne25hbWV9JywgZGF0YUl0ZW0ubmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnZnVuY3Rpb24nKSBjb250ZW50ID0gZm9ybWF0dGVyKGRhdGFJdGVtKTtcbiAgICAgIHJldHVybiBjb250ZW50LnRvU3RyaW5nKCk7XG4gICAgfSk7XG4gICAgZ2F1Z2VJdGVtLmRldGFpbHNDb250ZW50ID0gY29udGVudHM7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBnZXRPZmZzZXRlZFBvaW50KF9yZWY0LCBfcmVmNSkge1xuICB2YXIgX3JlZjYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjQsIDIpLFxuICAgICAgeCA9IF9yZWY2WzBdLFxuICAgICAgeSA9IF9yZWY2WzFdO1xuXG4gIHZhciBfcmVmNyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNSwgMiksXG4gICAgICBveCA9IF9yZWY3WzBdLFxuICAgICAgb3kgPSBfcmVmN1sxXTtcblxuICByZXR1cm4gW3ggKyBveCwgeSArIG95XTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc1RpY2tDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciB0aWNrUG9zaXRpb24gPSBnYXVnZUl0ZW0udGlja1Bvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHJldHVybiB0aWNrUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBnYXVnZUl0ZW0uYXhpc1RpY2suc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRBeGlzVGlja1NoYXBlKGdhdWdlSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0QXhpc1RpY2tTdHlsZShnYXVnZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNUaWNrU2hhcGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciB0aWNrUG9zaXRpb24gPSBnYXVnZUl0ZW0udGlja1Bvc2l0aW9uO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogdGlja1Bvc2l0aW9uW2ldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNUaWNrU3R5bGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBzdHlsZSA9IGdhdWdlSXRlbS5heGlzVGljay5zdHlsZTtcbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBsYWJlbFBvc2l0aW9uID0gZ2F1Z2VJdGVtLmxhYmVsUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGxhYmVsUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGdhdWdlSXRlbS5heGlzTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRBeGlzTGFiZWxTaGFwZShnYXVnZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEF4aXNMYWJlbFN0eWxlKGdhdWdlSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmVsU2hhcGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBsYWJlbFBvc2l0aW9uID0gZ2F1Z2VJdGVtLmxhYmVsUG9zaXRpb24sXG4gICAgICBkYXRhID0gZ2F1Z2VJdGVtLmF4aXNMYWJlbC5kYXRhO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGRhdGFbaV0udG9TdHJpbmcoKSxcbiAgICBwb3NpdGlvbjogbGFiZWxQb3NpdGlvbltpXVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxTdHlsZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGxhYmVsQWxpZ24gPSBnYXVnZUl0ZW0ubGFiZWxBbGlnbixcbiAgICAgIGF4aXNMYWJlbCA9IGdhdWdlSXRlbS5heGlzTGFiZWw7XG4gIHZhciBzdHlsZSA9IGF4aXNMYWJlbC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShfb2JqZWN0U3ByZWFkKHt9LCBsYWJlbEFsaWduW2ldKSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQXJjQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdhcmMnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgdmlzaWJsZTogZ2F1Z2VJdGVtLmJhY2tncm91bmRBcmMuc2hvdyxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXRHYXVnZUJhY2tncm91bmRBcmNTaGFwZShnYXVnZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRHYXVnZUJhY2tncm91bmRBcmNTdHlsZShnYXVnZUl0ZW0pXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRHYXVnZUJhY2tncm91bmRBcmNTaGFwZShnYXVnZUl0ZW0pIHtcbiAgdmFyIHN0YXJ0QW5nbGUgPSBnYXVnZUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gZ2F1Z2VJdGVtLmVuZEFuZ2xlLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgIHJhZGl1cyA9IGdhdWdlSXRlbS5yYWRpdXM7XG4gIHJldHVybiB7XG4gICAgcng6IGNlbnRlclswXSxcbiAgICByeTogY2VudGVyWzFdLFxuICAgIHI6IHJhZGl1cyxcbiAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlOiBlbmRBbmdsZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRHYXVnZUJhY2tncm91bmRBcmNTdHlsZShnYXVnZUl0ZW0pIHtcbiAgdmFyIGJhY2tncm91bmRBcmMgPSBnYXVnZUl0ZW0uYmFja2dyb3VuZEFyYyxcbiAgICAgIGFyY0xpbmVXaWR0aCA9IGdhdWdlSXRlbS5hcmNMaW5lV2lkdGg7XG4gIHZhciBzdHlsZSA9IGJhY2tncm91bmRBcmMuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGxpbmVXaWR0aDogYXJjTGluZVdpZHRoXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRCYWNrZ3JvdW5kQXJjQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgY29uZmlnID0gZ2V0QmFja2dyb3VuZEFyY0NvbmZpZyhnYXVnZUl0ZW0pWzBdO1xuXG4gIHZhciBzaGFwZSA9IF9vYmplY3RTcHJlYWQoe30sIGNvbmZpZy5zaGFwZSk7XG5cbiAgc2hhcGUuZW5kQW5nbGUgPSBjb25maWcuc2hhcGUuc3RhcnRBbmdsZTtcbiAgY29uZmlnLnNoYXBlID0gc2hhcGU7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gZ2V0QXJjQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdhZ0FyYycsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEdhdWdlQXJjU2hhcGUoZ2F1Z2VJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRHYXVnZUFyY1N0eWxlKGdhdWdlSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0R2F1Z2VBcmNTaGFwZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXIsXG4gICAgICBncmFkaWVudEVuZEFuZ2xlID0gZ2F1Z2VJdGVtLmVuZEFuZ2xlO1xuICB2YXIgX2RhdGEkaSA9IGRhdGFbaV0sXG4gICAgICByYWRpdXMgPSBfZGF0YSRpLnJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUgPSBfZGF0YSRpLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IF9kYXRhJGkuZW5kQW5nbGUsXG4gICAgICBsb2NhbEdyYWRpZW50ID0gX2RhdGEkaS5sb2NhbEdyYWRpZW50O1xuICBpZiAobG9jYWxHcmFkaWVudCkgZ3JhZGllbnRFbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICByZXR1cm4ge1xuICAgIHJ4OiBjZW50ZXJbMF0sXG4gICAgcnk6IGNlbnRlclsxXSxcbiAgICByOiByYWRpdXMsXG4gICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSxcbiAgICBlbmRBbmdsZTogZW5kQW5nbGUsXG4gICAgZ3JhZGllbnRFbmRBbmdsZTogZ3JhZGllbnRFbmRBbmdsZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRHYXVnZUFyY1N0eWxlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgZGF0YUl0ZW1TdHlsZSA9IGdhdWdlSXRlbS5kYXRhSXRlbVN0eWxlO1xuICB2YXIgX2RhdGEkaTIgPSBkYXRhW2ldLFxuICAgICAgbGluZVdpZHRoID0gX2RhdGEkaTIubGluZVdpZHRoLFxuICAgICAgZ3JhZGllbnQgPSBfZGF0YSRpMi5ncmFkaWVudDtcbiAgZ3JhZGllbnQgPSBncmFkaWVudC5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gKDAsIF9jb2xvci5nZXRSZ2JhVmFsdWUpKGMpO1xuICB9KTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgbGluZVdpZHRoOiBsaW5lV2lkdGgsXG4gICAgZ3JhZGllbnQ6IGdyYWRpZW50XG4gIH0sIGRhdGFJdGVtU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydEFyY0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRBcmNDb25maWcoZ2F1Z2VJdGVtKTtcbiAgY29uZmlncy5tYXAoZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHZhciBzaGFwZSA9IF9vYmplY3RTcHJlYWQoe30sIGNvbmZpZy5zaGFwZSk7XG5cbiAgICBzaGFwZS5lbmRBbmdsZSA9IGNvbmZpZy5zaGFwZS5zdGFydEFuZ2xlO1xuICAgIGNvbmZpZy5zaGFwZSA9IHNoYXBlO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZUFyYyhncmFwaCwgY29uZmlnKSB7XG4gIHZhciBncmFwaEdyYWRpZW50ID0gZ3JhcGguc3R5bGUuZ3JhZGllbnQ7XG4gIHZhciBjYWNoZU51bSA9IGdyYXBoR3JhZGllbnQubGVuZ3RoO1xuICB2YXIgbmVlZE51bSA9IGNvbmZpZy5zdHlsZS5ncmFkaWVudC5sZW5ndGg7XG5cbiAgaWYgKGNhY2hlTnVtID4gbmVlZE51bSkge1xuICAgIGdyYXBoR3JhZGllbnQuc3BsaWNlKG5lZWROdW0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBsYXN0ID0gZ3JhcGhHcmFkaWVudC5zbGljZSgtMSlbMF07XG4gICAgZ3JhcGhHcmFkaWVudC5wdXNoLmFwcGx5KGdyYXBoR3JhZGllbnQsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3IEFycmF5KG5lZWROdW0gLSBjYWNoZU51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbykge1xuICAgICAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGFzdCk7XG4gICAgfSkpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVyQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXIsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgdmlzaWJsZTogZ2F1Z2VJdGVtLnBvaW50ZXIuc2hvdyxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXRQb2ludGVyU2hhcGUoZ2F1Z2VJdGVtKSxcbiAgICBzdHlsZTogZ2V0UG9pbnRlclN0eWxlKGdhdWdlSXRlbSksXG4gICAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGZvbywgZ3JhcGgpIHtcbiAgICAgIGdyYXBoLnN0eWxlLmdyYXBoQ2VudGVyID0gY2VudGVyO1xuICAgIH1cbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXJTaGFwZShnYXVnZUl0ZW0pIHtcbiAgdmFyIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXI7XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBnZXRQb2ludGVyUG9pbnRzKGNlbnRlciksXG4gICAgY2xvc2U6IHRydWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRlclN0eWxlKGdhdWdlSXRlbSkge1xuICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGUsXG4gICAgICBtaW4gPSBnYXVnZUl0ZW0ubWluLFxuICAgICAgbWF4ID0gZ2F1Z2VJdGVtLm1heCxcbiAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgIHBvaW50ZXIgPSBnYXVnZUl0ZW0ucG9pbnRlcixcbiAgICAgIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXI7XG4gIHZhciB2YWx1ZUluZGV4ID0gcG9pbnRlci52YWx1ZUluZGV4LFxuICAgICAgc3R5bGUgPSBwb2ludGVyLnN0eWxlO1xuICB2YXIgdmFsdWUgPSBkYXRhW3ZhbHVlSW5kZXhdID8gZGF0YVt2YWx1ZUluZGV4XS52YWx1ZSA6IDA7XG4gIHZhciBhbmdsZSA9ICh2YWx1ZSAtIG1pbikgLyAobWF4IC0gbWluKSAqIChlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpICsgc3RhcnRBbmdsZSArIE1hdGguUEkgLyAyO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICByb3RhdGU6ICgwLCBfdXRpbDIucmFkaWFuVG9BbmdsZSkoYW5nbGUpLFxuICAgIHNjYWxlOiBbMSwgMV0sXG4gICAgZ3JhcGhDZW50ZXI6IGNlbnRlclxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXJQb2ludHMoX3JlZjgpIHtcbiAgdmFyIF9yZWY5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4LCAyKSxcbiAgICAgIHggPSBfcmVmOVswXSxcbiAgICAgIHkgPSBfcmVmOVsxXTtcblxuICB2YXIgcG9pbnQxID0gW3gsIHkgLSA0MF07XG4gIHZhciBwb2ludDIgPSBbeCArIDUsIHldO1xuICB2YXIgcG9pbnQzID0gW3gsIHkgKyAxMF07XG4gIHZhciBwb2ludDQgPSBbeCAtIDUsIHldO1xuICByZXR1cm4gW3BvaW50MSwgcG9pbnQyLCBwb2ludDMsIHBvaW50NF07XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UG9pbnRlckNvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIHN0YXJ0QW5nbGUgPSBnYXVnZUl0ZW0uc3RhcnRBbmdsZTtcbiAgdmFyIGNvbmZpZyA9IGdldFBvaW50ZXJDb25maWcoZ2F1Z2VJdGVtKVswXTtcbiAgY29uZmlnLnN0eWxlLnJvdGF0ZSA9ICgwLCBfdXRpbDIucmFkaWFuVG9BbmdsZSkoc3RhcnRBbmdsZSArIE1hdGguUEkgLyAyKTtcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBnZXREZXRhaWxzQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgZGV0YWlsc1Bvc2l0aW9uID0gZ2F1Z2VJdGVtLmRldGFpbHNQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICB2YXIgdmlzaWJsZSA9IGdhdWdlSXRlbS5kZXRhaWxzLnNob3c7XG4gIHJldHVybiBkZXRhaWxzUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ251bWJlclRleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHZpc2libGUsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0RGV0YWlsc1NoYXBlKGdhdWdlSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0RGV0YWlsc1N0eWxlKGdhdWdlSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RGV0YWlsc1NoYXBlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgZGV0YWlsc1Bvc2l0aW9uID0gZ2F1Z2VJdGVtLmRldGFpbHNQb3NpdGlvbixcbiAgICAgIGRldGFpbHNDb250ZW50ID0gZ2F1Z2VJdGVtLmRldGFpbHNDb250ZW50LFxuICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgZGV0YWlscyA9IGdhdWdlSXRlbS5kZXRhaWxzO1xuICB2YXIgcG9zaXRpb24gPSBkZXRhaWxzUG9zaXRpb25baV07XG4gIHZhciBjb250ZW50ID0gZGV0YWlsc0NvbnRlbnRbaV07XG4gIHZhciBkYXRhVmFsdWUgPSBkYXRhW2ldLnZhbHVlO1xuICB2YXIgdG9GaXhlZCA9IGRldGFpbHMudmFsdWVUb0ZpeGVkO1xuICByZXR1cm4ge1xuICAgIG51bWJlcjogW2RhdGFWYWx1ZV0sXG4gICAgY29udGVudDogY29udGVudCxcbiAgICBwb3NpdGlvbjogcG9zaXRpb24sXG4gICAgdG9GaXhlZDogdG9GaXhlZFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREZXRhaWxzU3R5bGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBkZXRhaWxzID0gZ2F1Z2VJdGVtLmRldGFpbHMsXG4gICAgICBkYXRhID0gZ2F1Z2VJdGVtLmRhdGE7XG4gIHZhciBzdHlsZSA9IGRldGFpbHMuc3R5bGU7XG4gIHZhciBjb2xvciA9IGRhdGFbaV0uY29sb3I7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdyaWQgPSBncmlkO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBncmlkKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgZ3JpZCA9IG9wdGlvbi5ncmlkO1xuICBncmlkID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKF9jb25maWcuZ3JpZENvbmZpZywgdHJ1ZSksIGdyaWQgfHwge30pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBbZ3JpZF0sXG4gICAga2V5OiAnZ3JpZCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEdyaWRDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEdyaWRDb25maWcoZ3JpZEl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gZ3JpZEl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdyaWRJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ3JpZEl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGUgPSBnZXRHcmlkU2hhcGUoZ3JpZEl0ZW0sIHVwZGF0ZXIpO1xuICB2YXIgc3R5bGUgPSBnZXRHcmlkU3R5bGUoZ3JpZEl0ZW0pO1xuICB1cGRhdGVyLmNoYXJ0LmdyaWRBcmVhID0gX29iamVjdFNwcmVhZCh7fSwgc2hhcGUpO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAncmVjdCcsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBzaGFwZSxcbiAgICBzdHlsZTogc3R5bGVcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldEdyaWRTaGFwZShncmlkSXRlbSwgdXBkYXRlcikge1xuICB2YXIgX3VwZGF0ZXIkY2hhcnQkcmVuZGVyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHVwZGF0ZXIuY2hhcnQucmVuZGVyLmFyZWEsIDIpLFxuICAgICAgdyA9IF91cGRhdGVyJGNoYXJ0JHJlbmRlclswXSxcbiAgICAgIGggPSBfdXBkYXRlciRjaGFydCRyZW5kZXJbMV07XG5cbiAgdmFyIGxlZnQgPSBnZXROdW1iZXJWYWx1ZShncmlkSXRlbS5sZWZ0LCB3KTtcbiAgdmFyIHJpZ2h0ID0gZ2V0TnVtYmVyVmFsdWUoZ3JpZEl0ZW0ucmlnaHQsIHcpO1xuICB2YXIgdG9wID0gZ2V0TnVtYmVyVmFsdWUoZ3JpZEl0ZW0udG9wLCBoKTtcbiAgdmFyIGJvdHRvbSA9IGdldE51bWJlclZhbHVlKGdyaWRJdGVtLmJvdHRvbSwgaCk7XG4gIHZhciB3aWR0aCA9IHcgLSBsZWZ0IC0gcmlnaHQ7XG4gIHZhciBoZWlnaHQgPSBoIC0gdG9wIC0gYm90dG9tO1xuICByZXR1cm4ge1xuICAgIHg6IGxlZnQsXG4gICAgeTogdG9wLFxuICAgIHc6IHdpZHRoLFxuICAgIGg6IGhlaWdodFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROdW1iZXJWYWx1ZSh2YWwsIGFsbCkge1xuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykgcmV0dXJuIDA7XG4gIHJldHVybiBhbGwgKiBwYXJzZUludCh2YWwpIC8gMTAwO1xufVxuXG5mdW5jdGlvbiBnZXRHcmlkU3R5bGUoZ3JpZEl0ZW0pIHtcbiAgdmFyIHN0eWxlID0gZ3JpZEl0ZW0uc3R5bGU7XG4gIHJldHVybiBzdHlsZTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIm1lcmdlQ29sb3JcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX21lcmdlQ29sb3IubWVyZ2VDb2xvcjtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0aXRsZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfdGl0bGUudGl0bGU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ3JpZFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ3JpZC5ncmlkO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImF4aXNcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2F4aXMuYXhpcztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJsaW5lXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9saW5lLmxpbmU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiYmFyXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iYXIuYmFyO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInBpZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcGllLnBpZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJyYWRhckF4aXNcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3JhZGFyQXhpcy5yYWRhckF4aXM7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicmFkYXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3JhZGFyLnJhZGFyO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdhdWdlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9nYXVnZS5nYXVnZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJsZWdlbmRcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2xlZ2VuZC5sZWdlbmQ7XG4gIH1cbn0pO1xuXG52YXIgX21lcmdlQ29sb3IgPSByZXF1aXJlKFwiLi9tZXJnZUNvbG9yXCIpO1xuXG52YXIgX3RpdGxlID0gcmVxdWlyZShcIi4vdGl0bGVcIik7XG5cbnZhciBfZ3JpZCA9IHJlcXVpcmUoXCIuL2dyaWRcIik7XG5cbnZhciBfYXhpcyA9IHJlcXVpcmUoXCIuL2F4aXNcIik7XG5cbnZhciBfbGluZSA9IHJlcXVpcmUoXCIuL2xpbmVcIik7XG5cbnZhciBfYmFyID0gcmVxdWlyZShcIi4vYmFyXCIpO1xuXG52YXIgX3BpZSA9IHJlcXVpcmUoXCIuL3BpZVwiKTtcblxudmFyIF9yYWRhckF4aXMgPSByZXF1aXJlKFwiLi9yYWRhckF4aXNcIik7XG5cbnZhciBfcmFkYXIgPSByZXF1aXJlKFwiLi9yYWRhclwiKTtcblxudmFyIF9nYXVnZSA9IHJlcXVpcmUoXCIuL2dhdWdlXCIpO1xuXG52YXIgX2xlZ2VuZCA9IHJlcXVpcmUoXCIuL2xlZ2VuZFwiKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmxlZ2VuZCA9IGxlZ2VuZDtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIGxlZ2VuZChjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIGxlZ2VuZCA9IG9wdGlvbi5sZWdlbmQ7XG5cbiAgaWYgKGxlZ2VuZCkge1xuICAgIGxlZ2VuZCA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShfY29uZmlnLmxlZ2VuZENvbmZpZywgdHJ1ZSksIGxlZ2VuZCk7XG4gICAgbGVnZW5kID0gaW5pdExlZ2VuZERhdGEobGVnZW5kKTtcbiAgICBsZWdlbmQgPSBmaWx0ZXJJbnZhbGlkRGF0YShsZWdlbmQsIG9wdGlvbiwgY2hhcnQpO1xuICAgIGxlZ2VuZCA9IGNhbGNMZWdlbmRUZXh0V2lkdGgobGVnZW5kLCBjaGFydCk7XG4gICAgbGVnZW5kID0gY2FsY0xlZ2VuZFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpO1xuICAgIGxlZ2VuZCA9IFtsZWdlbmRdO1xuICB9IGVsc2Uge1xuICAgIGxlZ2VuZCA9IFtdO1xuICB9XG5cbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogbGVnZW5kLFxuICAgIGtleTogJ2xlZ2VuZEljb24nLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRJY29uQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsZWdlbmQsXG4gICAga2V5OiAnbGVnZW5kVGV4dCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFRleHRDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGluaXRMZWdlbmREYXRhKGxlZ2VuZCkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhO1xuICBsZWdlbmQuZGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIGl0ZW1UeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoaXRlbSk7XG5cbiAgICBpZiAoaXRlbVR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiBpdGVtXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoaXRlbVR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJydcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGxlZ2VuZDtcbn1cblxuZnVuY3Rpb24gZmlsdGVySW52YWxpZERhdGEobGVnZW5kLCBvcHRpb24sIGNoYXJ0KSB7XG4gIHZhciBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICB2YXIgbGVnZW5kU3RhdHVzID0gY2hhcnQubGVnZW5kU3RhdHVzO1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciBuYW1lID0gaXRlbS5uYW1lO1xuICAgIHZhciByZXN1bHQgPSBzZXJpZXMuZmluZChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIHNuID0gX3JlZi5uYW1lO1xuICAgICAgcmV0dXJuIG5hbWUgPT09IHNuO1xuICAgIH0pO1xuICAgIGlmICghcmVzdWx0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFpdGVtLmNvbG9yKSBpdGVtLmNvbG9yID0gcmVzdWx0LmNvbG9yO1xuICAgIGlmICghaXRlbS5pY29uKSBpdGVtLmljb24gPSByZXN1bHQudHlwZTtcbiAgICByZXR1cm4gaXRlbTtcbiAgfSk7XG4gIGlmICghbGVnZW5kU3RhdHVzIHx8IGxlZ2VuZFN0YXR1cy5sZW5ndGggIT09IGxlZ2VuZC5kYXRhLmxlbmd0aCkgbGVnZW5kU3RhdHVzID0gbmV3IEFycmF5KGxlZ2VuZC5kYXRhLmxlbmd0aCkuZmlsbCh0cnVlKTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgcmV0dXJuIGl0ZW0uc3RhdHVzID0gbGVnZW5kU3RhdHVzW2ldO1xuICB9KTtcbiAgbGVnZW5kLmRhdGEgPSBkYXRhO1xuICBjaGFydC5sZWdlbmRTdGF0dXMgPSBsZWdlbmRTdGF0dXM7XG4gIHJldHVybiBsZWdlbmQ7XG59XG5cbmZ1bmN0aW9uIGNhbGNMZWdlbmRUZXh0V2lkdGgobGVnZW5kLCBjaGFydCkge1xuICB2YXIgY3R4ID0gY2hhcnQucmVuZGVyLmN0eDtcbiAgdmFyIGRhdGEgPSBsZWdlbmQuZGF0YSxcbiAgICAgIHRleHRTdHlsZSA9IGxlZ2VuZC50ZXh0U3R5bGUsXG4gICAgICB0ZXh0VW5zZWxlY3RlZFN0eWxlID0gbGVnZW5kLnRleHRVbnNlbGVjdGVkU3R5bGU7XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciBzdGF0dXMgPSBpdGVtLnN0YXR1cyxcbiAgICAgICAgbmFtZSA9IGl0ZW0ubmFtZTtcbiAgICBpdGVtLnRleHRXaWR0aCA9IGdldFRleHRXaWR0aChjdHgsIG5hbWUsIHN0YXR1cyA/IHRleHRTdHlsZSA6IHRleHRVbnNlbGVjdGVkU3R5bGUpO1xuICB9KTtcbiAgcmV0dXJuIGxlZ2VuZDtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dFdpZHRoKGN0eCwgdGV4dCwgc3R5bGUpIHtcbiAgY3R4LmZvbnQgPSBnZXRGb250Q29uZmlnKHN0eWxlKTtcbiAgcmV0dXJuIGN0eC5tZWFzdXJlVGV4dCh0ZXh0KS53aWR0aDtcbn1cblxuZnVuY3Rpb24gZ2V0Rm9udENvbmZpZyhzdHlsZSkge1xuICB2YXIgZm9udEZhbWlseSA9IHN0eWxlLmZvbnRGYW1pbHksXG4gICAgICBmb250U2l6ZSA9IHN0eWxlLmZvbnRTaXplO1xuICByZXR1cm4gXCJcIi5jb25jYXQoZm9udFNpemUsIFwicHggXCIpLmNvbmNhdChmb250RmFtaWx5KTtcbn1cblxuZnVuY3Rpb24gY2FsY0xlZ2VuZFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIG9yaWVudCA9IGxlZ2VuZC5vcmllbnQ7XG5cbiAgaWYgKG9yaWVudCA9PT0gJ3ZlcnRpY2FsJykge1xuICAgIGNhbGNWZXJ0aWNhbFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpO1xuICB9IGVsc2Uge1xuICAgIGNhbGNIb3Jpem9udGFsUG9zaXRpb24obGVnZW5kLCBjaGFydCk7XG4gIH1cblxuICByZXR1cm4gbGVnZW5kO1xufVxuXG5mdW5jdGlvbiBjYWxjSG9yaXpvbnRhbFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGljb25IZWlnaHQgPSBsZWdlbmQuaWNvbkhlaWdodCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcDtcbiAgdmFyIGxpbmVzID0gY2FsY0RlZmF1bHRIb3Jpem9udGFsUG9zaXRpb24obGVnZW5kLCBjaGFydCk7XG4gIHZhciB4T2Zmc2V0cyA9IGxpbmVzLm1hcChmdW5jdGlvbiAobGluZSkge1xuICAgIHJldHVybiBnZXRIb3Jpem9udGFsWE9mZnNldChsaW5lLCBsZWdlbmQsIGNoYXJ0KTtcbiAgfSk7XG4gIHZhciB5T2Zmc2V0ID0gZ2V0SG9yaXpvbnRhbFlPZmZzZXQobGVnZW5kLCBjaGFydCk7XG4gIHZhciBhbGlnbiA9IHtcbiAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gIH07XG4gIGxpbmVzLmZvckVhY2goZnVuY3Rpb24gKGxpbmUsIGkpIHtcbiAgICByZXR1cm4gbGluZS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgaWNvblBvc2l0aW9uID0gaXRlbS5pY29uUG9zaXRpb24sXG4gICAgICAgICAgdGV4dFBvc2l0aW9uID0gaXRlbS50ZXh0UG9zaXRpb247XG4gICAgICB2YXIgeE9mZnNldCA9IHhPZmZzZXRzW2ldO1xuICAgICAgdmFyIHJlYWxZT2Zmc2V0ID0geU9mZnNldCArIGkgKiAoaXRlbUdhcCArIGljb25IZWlnaHQpO1xuICAgICAgaXRlbS5pY29uUG9zaXRpb24gPSBtZXJnZU9mZnNldChpY29uUG9zaXRpb24sIFt4T2Zmc2V0LCByZWFsWU9mZnNldF0pO1xuICAgICAgaXRlbS50ZXh0UG9zaXRpb24gPSBtZXJnZU9mZnNldCh0ZXh0UG9zaXRpb24sIFt4T2Zmc2V0LCByZWFsWU9mZnNldF0pO1xuICAgICAgaXRlbS5hbGlnbiA9IGFsaWduO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0RlZmF1bHRIb3Jpem9udGFsUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kLmljb25XaWR0aDtcbiAgdmFyIHcgPSBjaGFydC5yZW5kZXIuYXJlYVswXTtcbiAgdmFyIHN0YXJ0SW5kZXggPSAwO1xuICB2YXIgbGluZXMgPSBbW11dO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICB2YXIgYmVmb3JlV2lkdGggPSBnZXRCZWZvcmVXaWR0aChzdGFydEluZGV4LCBpLCBsZWdlbmQpO1xuICAgIHZhciBlbmRYUG9zID0gYmVmb3JlV2lkdGggKyBpY29uV2lkdGggKyA1ICsgaXRlbS50ZXh0V2lkdGg7XG5cbiAgICBpZiAoZW5kWFBvcyA+PSB3KSB7XG4gICAgICBzdGFydEluZGV4ID0gaTtcbiAgICAgIGJlZm9yZVdpZHRoID0gZ2V0QmVmb3JlV2lkdGgoc3RhcnRJbmRleCwgaSwgbGVnZW5kKTtcbiAgICAgIGxpbmVzLnB1c2goW10pO1xuICAgIH1cblxuICAgIGl0ZW0uaWNvblBvc2l0aW9uID0gW2JlZm9yZVdpZHRoLCAwXTtcbiAgICBpdGVtLnRleHRQb3NpdGlvbiA9IFtiZWZvcmVXaWR0aCArIGljb25XaWR0aCArIDUsIDBdO1xuICAgIGxpbmVzLnNsaWNlKC0xKVswXS5wdXNoKGl0ZW0pO1xuICB9KTtcbiAgcmV0dXJuIGxpbmVzO1xufVxuXG5mdW5jdGlvbiBnZXRCZWZvcmVXaWR0aChzdGFydEluZGV4LCBjdXJyZW50SW5kZXgsIGxlZ2VuZCkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kLmljb25XaWR0aCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcDtcbiAgdmFyIGJlZm9yZUl0ZW0gPSBkYXRhLnNsaWNlKHN0YXJ0SW5kZXgsIGN1cnJlbnRJbmRleCk7XG4gIHJldHVybiAoMCwgX3V0aWwyLm11bEFkZCkoYmVmb3JlSXRlbS5tYXAoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IF9yZWYyLnRleHRXaWR0aDtcbiAgICByZXR1cm4gdGV4dFdpZHRoO1xuICB9KSkgKyAoY3VycmVudEluZGV4IC0gc3RhcnRJbmRleCkgKiAoaXRlbUdhcCArIDUgKyBpY29uV2lkdGgpO1xufVxuXG5mdW5jdGlvbiBnZXRIb3Jpem9udGFsWE9mZnNldChkYXRhLCBsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBsZWZ0ID0gbGVnZW5kLmxlZnQsXG4gICAgICByaWdodCA9IGxlZ2VuZC5yaWdodCxcbiAgICAgIGljb25XaWR0aCA9IGxlZ2VuZC5pY29uV2lkdGgsXG4gICAgICBpdGVtR2FwID0gbGVnZW5kLml0ZW1HYXA7XG4gIHZhciB3ID0gY2hhcnQucmVuZGVyLmFyZWFbMF07XG4gIHZhciBkYXRhTnVtID0gZGF0YS5sZW5ndGg7XG4gIHZhciBhbGxXaWR0aCA9ICgwLCBfdXRpbDIubXVsQWRkKShkYXRhLm1hcChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgdGV4dFdpZHRoID0gX3JlZjMudGV4dFdpZHRoO1xuICAgIHJldHVybiB0ZXh0V2lkdGg7XG4gIH0pKSArIGRhdGFOdW0gKiAoNSArIGljb25XaWR0aCkgKyAoZGF0YU51bSAtIDEpICogaXRlbUdhcDtcbiAgdmFyIGhvcml6b250YWwgPSBbbGVmdCwgcmlnaHRdLmZpbmRJbmRleChmdW5jdGlvbiAocG9zKSB7XG4gICAgcmV0dXJuIHBvcyAhPT0gJ2F1dG8nO1xuICB9KTtcblxuICBpZiAoaG9yaXpvbnRhbCA9PT0gLTEpIHtcbiAgICByZXR1cm4gKHcgLSBhbGxXaWR0aCkgLyAyO1xuICB9IGVsc2UgaWYgKGhvcml6b250YWwgPT09IDApIHtcbiAgICBpZiAodHlwZW9mIGxlZnQgPT09ICdudW1iZXInKSByZXR1cm4gbGVmdDtcbiAgICByZXR1cm4gcGFyc2VJbnQobGVmdCkgLyAxMDAgKiB3O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgcmlnaHQgIT09ICdudW1iZXInKSByaWdodCA9IHBhcnNlSW50KHJpZ2h0KSAvIDEwMCAqIHc7XG4gICAgcmV0dXJuIHcgLSAoYWxsV2lkdGggKyByaWdodCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0SG9yaXpvbnRhbFlPZmZzZXQobGVnZW5kLCBjaGFydCkge1xuICB2YXIgdG9wID0gbGVnZW5kLnRvcCxcbiAgICAgIGJvdHRvbSA9IGxlZ2VuZC5ib3R0b20sXG4gICAgICBpY29uSGVpZ2h0ID0gbGVnZW5kLmljb25IZWlnaHQ7XG4gIHZhciBoID0gY2hhcnQucmVuZGVyLmFyZWFbMV07XG4gIHZhciB2ZXJ0aWNhbCA9IFt0b3AsIGJvdHRvbV0uZmluZEluZGV4KGZ1bmN0aW9uIChwb3MpIHtcbiAgICByZXR1cm4gcG9zICE9PSAnYXV0byc7XG4gIH0pO1xuICB2YXIgaGFsZkljb25IZWlnaHQgPSBpY29uSGVpZ2h0IC8gMjtcblxuICBpZiAodmVydGljYWwgPT09IC0xKSB7XG4gICAgdmFyIF9jaGFydCRncmlkQXJlYSA9IGNoYXJ0LmdyaWRBcmVhLFxuICAgICAgICB5ID0gX2NoYXJ0JGdyaWRBcmVhLnksXG4gICAgICAgIGhlaWdodCA9IF9jaGFydCRncmlkQXJlYS5oO1xuICAgIHJldHVybiB5ICsgaGVpZ2h0ICsgNDUgLSBoYWxmSWNvbkhlaWdodDtcbiAgfSBlbHNlIGlmICh2ZXJ0aWNhbCA9PT0gMCkge1xuICAgIGlmICh0eXBlb2YgdG9wID09PSAnbnVtYmVyJykgcmV0dXJuIHRvcCAtIGhhbGZJY29uSGVpZ2h0O1xuICAgIHJldHVybiBwYXJzZUludCh0b3ApIC8gMTAwICogaCAtIGhhbGZJY29uSGVpZ2h0O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgYm90dG9tICE9PSAnbnVtYmVyJykgYm90dG9tID0gcGFyc2VJbnQoYm90dG9tKSAvIDEwMCAqIGg7XG4gICAgcmV0dXJuIGggLSBib3R0b20gLSBoYWxmSWNvbkhlaWdodDtcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZU9mZnNldChfcmVmNCwgX3JlZjUpIHtcbiAgdmFyIF9yZWY2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY0LCAyKSxcbiAgICAgIHggPSBfcmVmNlswXSxcbiAgICAgIHkgPSBfcmVmNlsxXTtcblxuICB2YXIgX3JlZjcgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjUsIDIpLFxuICAgICAgb3ggPSBfcmVmN1swXSxcbiAgICAgIG95ID0gX3JlZjdbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGNhbGNWZXJ0aWNhbFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIF9nZXRWZXJ0aWNhbFhPZmZzZXQgPSBnZXRWZXJ0aWNhbFhPZmZzZXQobGVnZW5kLCBjaGFydCksXG4gICAgICBfZ2V0VmVydGljYWxYT2Zmc2V0MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZ2V0VmVydGljYWxYT2Zmc2V0LCAyKSxcbiAgICAgIGlzUmlnaHQgPSBfZ2V0VmVydGljYWxYT2Zmc2V0MlswXSxcbiAgICAgIHhPZmZzZXQgPSBfZ2V0VmVydGljYWxYT2Zmc2V0MlsxXTtcblxuICB2YXIgeU9mZnNldCA9IGdldFZlcnRpY2FsWU9mZnNldChsZWdlbmQsIGNoYXJ0KTtcbiAgY2FsY0RlZmF1bHRWZXJ0aWNhbFBvc2l0aW9uKGxlZ2VuZCwgaXNSaWdodCk7XG4gIHZhciBhbGlnbiA9IHtcbiAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gIH07XG4gIGxlZ2VuZC5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgdGV4dFBvc2l0aW9uID0gaXRlbS50ZXh0UG9zaXRpb24sXG4gICAgICAgIGljb25Qb3NpdGlvbiA9IGl0ZW0uaWNvblBvc2l0aW9uO1xuICAgIGl0ZW0udGV4dFBvc2l0aW9uID0gbWVyZ2VPZmZzZXQodGV4dFBvc2l0aW9uLCBbeE9mZnNldCwgeU9mZnNldF0pO1xuICAgIGl0ZW0uaWNvblBvc2l0aW9uID0gbWVyZ2VPZmZzZXQoaWNvblBvc2l0aW9uLCBbeE9mZnNldCwgeU9mZnNldF0pO1xuICAgIGl0ZW0uYWxpZ24gPSBhbGlnbjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFZlcnRpY2FsWE9mZnNldChsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBsZWZ0ID0gbGVnZW5kLmxlZnQsXG4gICAgICByaWdodCA9IGxlZ2VuZC5yaWdodDtcbiAgdmFyIHcgPSBjaGFydC5yZW5kZXIuYXJlYVswXTtcbiAgdmFyIGhvcml6b250YWwgPSBbbGVmdCwgcmlnaHRdLmZpbmRJbmRleChmdW5jdGlvbiAocG9zKSB7XG4gICAgcmV0dXJuIHBvcyAhPT0gJ2F1dG8nO1xuICB9KTtcblxuICBpZiAoaG9yaXpvbnRhbCA9PT0gLTEpIHtcbiAgICByZXR1cm4gW3RydWUsIHcgLSAxMF07XG4gIH0gZWxzZSB7XG4gICAgdmFyIG9mZnNldCA9IFtsZWZ0LCByaWdodF1baG9yaXpvbnRhbF07XG4gICAgaWYgKHR5cGVvZiBvZmZzZXQgIT09ICdudW1iZXInKSBvZmZzZXQgPSBwYXJzZUludChvZmZzZXQpIC8gMTAwICogdztcbiAgICByZXR1cm4gW0Jvb2xlYW4oaG9yaXpvbnRhbCksIG9mZnNldF07XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VmVydGljYWxZT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGljb25IZWlnaHQgPSBsZWdlbmQuaWNvbkhlaWdodCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcCxcbiAgICAgIGRhdGEgPSBsZWdlbmQuZGF0YSxcbiAgICAgIHRvcCA9IGxlZ2VuZC50b3AsXG4gICAgICBib3R0b20gPSBsZWdlbmQuYm90dG9tO1xuICB2YXIgaCA9IGNoYXJ0LnJlbmRlci5hcmVhWzFdO1xuICB2YXIgZGF0YU51bSA9IGRhdGEubGVuZ3RoO1xuICB2YXIgYWxsSGVpZ2h0ID0gZGF0YU51bSAqIGljb25IZWlnaHQgKyAoZGF0YU51bSAtIDEpICogaXRlbUdhcDtcbiAgdmFyIHZlcnRpY2FsID0gW3RvcCwgYm90dG9tXS5maW5kSW5kZXgoZnVuY3Rpb24gKHBvcykge1xuICAgIHJldHVybiBwb3MgIT09ICdhdXRvJztcbiAgfSk7XG5cbiAgaWYgKHZlcnRpY2FsID09PSAtMSkge1xuICAgIHJldHVybiAoaCAtIGFsbEhlaWdodCkgLyAyO1xuICB9IGVsc2Uge1xuICAgIHZhciBvZmZzZXQgPSBbdG9wLCBib3R0b21dW3ZlcnRpY2FsXTtcbiAgICBpZiAodHlwZW9mIG9mZnNldCAhPT0gJ251bWJlcicpIG9mZnNldCA9IHBhcnNlSW50KG9mZnNldCkgLyAxMDAgKiBoO1xuICAgIGlmICh2ZXJ0aWNhbCA9PT0gMSkgb2Zmc2V0ID0gaCAtIG9mZnNldCAtIGFsbEhlaWdodDtcbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGNEZWZhdWx0VmVydGljYWxQb3NpdGlvbihsZWdlbmQsIGlzUmlnaHQpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmQuZGF0YSxcbiAgICAgIGljb25XaWR0aCA9IGxlZ2VuZC5pY29uV2lkdGgsXG4gICAgICBpY29uSGVpZ2h0ID0gbGVnZW5kLmljb25IZWlnaHQsXG4gICAgICBpdGVtR2FwID0gbGVnZW5kLml0ZW1HYXA7XG4gIHZhciBoYWxmSWNvbkhlaWdodCA9IGljb25IZWlnaHQgLyAyO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICB2YXIgdGV4dFdpZHRoID0gaXRlbS50ZXh0V2lkdGg7XG4gICAgdmFyIHlQb3MgPSAoaWNvbkhlaWdodCArIGl0ZW1HYXApICogaSArIGhhbGZJY29uSGVpZ2h0O1xuICAgIHZhciBpY29uWFBvcyA9IGlzUmlnaHQgPyAwIC0gaWNvbldpZHRoIDogMDtcbiAgICB2YXIgdGV4dFhwb3MgPSBpc1JpZ2h0ID8gaWNvblhQb3MgLSA1IC0gdGV4dFdpZHRoIDogaWNvbldpZHRoICsgNTtcbiAgICBpdGVtLmljb25Qb3NpdGlvbiA9IFtpY29uWFBvcywgeVBvc107XG4gICAgaXRlbS50ZXh0UG9zaXRpb24gPSBbdGV4dFhwb3MsIHlQb3NdO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvbkNvbmZpZyhsZWdlbmRJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kSXRlbS5kYXRhLFxuICAgICAgc2VsZWN0QWJsZSA9IGxlZ2VuZEl0ZW0uc2VsZWN0QWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gbGVnZW5kSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGVnZW5kSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGxlZ2VuZEl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICByZXR1cm4gKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh7XG4gICAgICBuYW1lOiBpdGVtLmljb24gPT09ICdsaW5lJyA/ICdsaW5lSWNvbicgOiAncmVjdCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogbGVnZW5kSXRlbS5zaG93LFxuICAgICAgaG92ZXI6IHNlbGVjdEFibGUsXG4gICAgICBjbGljazogc2VsZWN0QWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRJY29uU2hhcGUobGVnZW5kSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0SWNvblN0eWxlKGxlZ2VuZEl0ZW0sIGkpXG4gICAgfSwgXCJjbGlja1wiLCBjcmVhdGVDbGlja0NhbGxCYWNrKGxlZ2VuZEl0ZW0sIGksIHVwZGF0ZXIpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEljb25TaGFwZShsZWdlbmRJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kSXRlbS5kYXRhLFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kSXRlbS5pY29uV2lkdGgsXG4gICAgICBpY29uSGVpZ2h0ID0gbGVnZW5kSXRlbS5pY29uSGVpZ2h0O1xuXG4gIHZhciBfZGF0YSRpJGljb25Qb3NpdGlvbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShkYXRhW2ldLmljb25Qb3NpdGlvbiwgMiksXG4gICAgICB4ID0gX2RhdGEkaSRpY29uUG9zaXRpb25bMF0sXG4gICAgICB5ID0gX2RhdGEkaSRpY29uUG9zaXRpb25bMV07XG5cbiAgdmFyIGhhbGZJY29uSGVpZ2h0ID0gaWNvbkhlaWdodCAvIDI7XG4gIHJldHVybiB7XG4gICAgeDogeCxcbiAgICB5OiB5IC0gaGFsZkljb25IZWlnaHQsXG4gICAgdzogaWNvbldpZHRoLFxuICAgIGg6IGljb25IZWlnaHRcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvblN0eWxlKGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmRJdGVtLmRhdGEsXG4gICAgICBpY29uU3R5bGUgPSBsZWdlbmRJdGVtLmljb25TdHlsZSxcbiAgICAgIGljb25VbnNlbGVjdGVkU3R5bGUgPSBsZWdlbmRJdGVtLmljb25VbnNlbGVjdGVkU3R5bGU7XG4gIHZhciBfZGF0YSRpID0gZGF0YVtpXSxcbiAgICAgIHN0YXR1cyA9IF9kYXRhJGkuc3RhdHVzLFxuICAgICAgY29sb3IgPSBfZGF0YSRpLmNvbG9yO1xuICB2YXIgc3R5bGUgPSBzdGF0dXMgPyBpY29uU3R5bGUgOiBpY29uVW5zZWxlY3RlZFN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFRleHRDb25maWcobGVnZW5kSXRlbSwgdXBkYXRlcikge1xuICB2YXIgZGF0YSA9IGxlZ2VuZEl0ZW0uZGF0YSxcbiAgICAgIHNlbGVjdEFibGUgPSBsZWdlbmRJdGVtLnNlbGVjdEFibGUsXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGxlZ2VuZEl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxlZ2VuZEl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsZWdlbmRJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGxlZ2VuZEl0ZW0uc2hvdyxcbiAgICAgIGhvdmVyOiBzZWxlY3RBYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgaG92ZXJSZWN0OiBnZXRUZXh0SG92ZXJSZWN0KGxlZ2VuZEl0ZW0sIGkpLFxuICAgICAgc2hhcGU6IGdldFRleHRTaGFwZShsZWdlbmRJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRUZXh0U3R5bGUobGVnZW5kSXRlbSwgaSksXG4gICAgICBjbGljazogY3JlYXRlQ2xpY2tDYWxsQmFjayhsZWdlbmRJdGVtLCBpLCB1cGRhdGVyKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0U2hhcGUobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgX2xlZ2VuZEl0ZW0kZGF0YSRpID0gbGVnZW5kSXRlbS5kYXRhW2ldLFxuICAgICAgdGV4dFBvc2l0aW9uID0gX2xlZ2VuZEl0ZW0kZGF0YSRpLnRleHRQb3NpdGlvbixcbiAgICAgIG5hbWUgPSBfbGVnZW5kSXRlbSRkYXRhJGkubmFtZTtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBuYW1lLFxuICAgIHBvc2l0aW9uOiB0ZXh0UG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dFN0eWxlKGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIHRleHRTdHlsZSA9IGxlZ2VuZEl0ZW0udGV4dFN0eWxlLFxuICAgICAgdGV4dFVuc2VsZWN0ZWRTdHlsZSA9IGxlZ2VuZEl0ZW0udGV4dFVuc2VsZWN0ZWRTdHlsZTtcbiAgdmFyIF9sZWdlbmRJdGVtJGRhdGEkaTIgPSBsZWdlbmRJdGVtLmRhdGFbaV0sXG4gICAgICBzdGF0dXMgPSBfbGVnZW5kSXRlbSRkYXRhJGkyLnN0YXR1cyxcbiAgICAgIGFsaWduID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMi5hbGlnbjtcbiAgdmFyIHN0eWxlID0gc3RhdHVzID8gdGV4dFN0eWxlIDogdGV4dFVuc2VsZWN0ZWRTdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShzdHlsZSwgdHJ1ZSksIGFsaWduKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dEhvdmVyUmVjdChsZWdlbmRJdGVtLCBpKSB7XG4gIHZhciB0ZXh0U3R5bGUgPSBsZWdlbmRJdGVtLnRleHRTdHlsZSxcbiAgICAgIHRleHRVbnNlbGVjdGVkU3R5bGUgPSBsZWdlbmRJdGVtLnRleHRVbnNlbGVjdGVkU3R5bGU7XG5cbiAgdmFyIF9sZWdlbmRJdGVtJGRhdGEkaTMgPSBsZWdlbmRJdGVtLmRhdGFbaV0sXG4gICAgICBzdGF0dXMgPSBfbGVnZW5kSXRlbSRkYXRhJGkzLnN0YXR1cyxcbiAgICAgIF9sZWdlbmRJdGVtJGRhdGEkaTMkdCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfbGVnZW5kSXRlbSRkYXRhJGkzLnRleHRQb3NpdGlvbiwgMiksXG4gICAgICB4ID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMyR0WzBdLFxuICAgICAgeSA9IF9sZWdlbmRJdGVtJGRhdGEkaTMkdFsxXSxcbiAgICAgIHRleHRXaWR0aCA9IF9sZWdlbmRJdGVtJGRhdGEkaTMudGV4dFdpZHRoO1xuXG4gIHZhciBzdHlsZSA9IHN0YXR1cyA/IHRleHRTdHlsZSA6IHRleHRVbnNlbGVjdGVkU3R5bGU7XG4gIHZhciBmb250U2l6ZSA9IHN0eWxlLmZvbnRTaXplO1xuICByZXR1cm4gW3gsIHkgLSBmb250U2l6ZSAvIDIsIHRleHRXaWR0aCwgZm9udFNpemVdO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGlja0NhbGxCYWNrKGxlZ2VuZEl0ZW0sIGluZGV4LCB1cGRhdGVyKSB7XG4gIHZhciBuYW1lID0gbGVnZW5kSXRlbS5kYXRhW2luZGV4XS5uYW1lO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBfdXBkYXRlciRjaGFydCA9IHVwZGF0ZXIuY2hhcnQsXG4gICAgICAgIGxlZ2VuZFN0YXR1cyA9IF91cGRhdGVyJGNoYXJ0LmxlZ2VuZFN0YXR1cyxcbiAgICAgICAgb3B0aW9uID0gX3VwZGF0ZXIkY2hhcnQub3B0aW9uO1xuICAgIHZhciBzdGF0dXMgPSAhbGVnZW5kU3RhdHVzW2luZGV4XTtcbiAgICB2YXIgY2hhbmdlID0gb3B0aW9uLnNlcmllcy5maW5kKGZ1bmN0aW9uIChfcmVmOSkge1xuICAgICAgdmFyIHNuID0gX3JlZjkubmFtZTtcbiAgICAgIHJldHVybiBzbiA9PT0gbmFtZTtcbiAgICB9KTtcbiAgICBjaGFuZ2Uuc2hvdyA9IHN0YXR1cztcbiAgICBsZWdlbmRTdGF0dXNbaW5kZXhdID0gc3RhdHVzO1xuICAgIHVwZGF0ZXIuY2hhcnQuc2V0T3B0aW9uKG9wdGlvbik7XG4gIH07XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5saW5lID0gbGluZTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF9iZXppZXJDdXJ2ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvYmV6aWVyLWN1cnZlXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG52YXIgcG9seWxpbmVUb0JlemllckN1cnZlID0gX2JlemllckN1cnZlW1wiZGVmYXVsdFwiXS5wb2x5bGluZVRvQmV6aWVyQ3VydmUsXG4gICAgZ2V0QmV6aWVyQ3VydmVMZW5ndGggPSBfYmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdLmdldEJlemllckN1cnZlTGVuZ3RoO1xuXG5mdW5jdGlvbiBsaW5lKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgeEF4aXMgPSBvcHRpb24ueEF4aXMsXG4gICAgICB5QXhpcyA9IG9wdGlvbi55QXhpcyxcbiAgICAgIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIHZhciBsaW5lcyA9IFtdO1xuXG4gIGlmICh4QXhpcyAmJiB5QXhpcyAmJiBzZXJpZXMpIHtcbiAgICBsaW5lcyA9ICgwLCBfdXRpbC5pbml0TmVlZFNlcmllcykoc2VyaWVzLCBfY29uZmlnLmxpbmVDb25maWcsICdsaW5lJyk7XG4gICAgbGluZXMgPSBjYWxjTGluZXNQb3NpdGlvbihsaW5lcywgY2hhcnQpO1xuICB9XG5cbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogbGluZXMsXG4gICAga2V5OiAnbGluZUFyZWEnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMaW5lQXJlYUNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydExpbmVBcmVhQ29uZmlnLFxuICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlTGluZUFuZEFyZWEsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VMaW5lQW5kQXJlYVxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogbGluZXMsXG4gICAga2V5OiAnbGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExpbmVDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRMaW5lQ29uZmlnLFxuICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlTGluZUFuZEFyZWEsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VMaW5lQW5kQXJlYVxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogbGluZXMsXG4gICAga2V5OiAnbGluZVBvaW50JyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0UG9pbnRDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRQb2ludENvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogbGluZXMsXG4gICAga2V5OiAnbGluZUxhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGFiZWxDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNMaW5lc1Bvc2l0aW9uKGxpbmVzLCBjaGFydCkge1xuICB2YXIgYXhpc0RhdGEgPSBjaGFydC5heGlzRGF0YTtcbiAgcmV0dXJuIGxpbmVzLm1hcChmdW5jdGlvbiAobGluZUl0ZW0pIHtcbiAgICB2YXIgbGluZURhdGEgPSAoMCwgX3V0aWwubWVyZ2VTYW1lU3RhY2tEYXRhKShsaW5lSXRlbSwgbGluZXMpO1xuICAgIGxpbmVEYXRhID0gbWVyZ2VOb25OdW1iZXIobGluZUl0ZW0sIGxpbmVEYXRhKTtcbiAgICB2YXIgbGluZUF4aXMgPSBnZXRMaW5lQXhpcyhsaW5lSXRlbSwgYXhpc0RhdGEpO1xuICAgIHZhciBsaW5lUG9zaXRpb24gPSBnZXRMaW5lUG9zaXRpb24obGluZURhdGEsIGxpbmVBeGlzKTtcbiAgICB2YXIgbGluZUZpbGxCb3R0b21Qb3MgPSBnZXRMaW5lRmlsbEJvdHRvbVBvcyhsaW5lQXhpcyk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGxpbmVJdGVtLCB7XG4gICAgICBsaW5lUG9zaXRpb246IGxpbmVQb3NpdGlvbi5maWx0ZXIoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9KSxcbiAgICAgIGxpbmVGaWxsQm90dG9tUG9zOiBsaW5lRmlsbEJvdHRvbVBvc1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VOb25OdW1iZXIobGluZUl0ZW0sIGxpbmVEYXRhKSB7XG4gIHZhciBkYXRhID0gbGluZUl0ZW0uZGF0YTtcbiAgcmV0dXJuIGxpbmVEYXRhLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiB0eXBlb2YgZGF0YVtpXSA9PT0gJ251bWJlcicgPyB2IDogbnVsbDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVBeGlzKGxpbmUsIGF4aXNEYXRhKSB7XG4gIHZhciB4QXhpc0luZGV4ID0gbGluZS54QXhpc0luZGV4LFxuICAgICAgeUF4aXNJbmRleCA9IGxpbmUueUF4aXNJbmRleDtcbiAgdmFyIHhBeGlzID0gYXhpc0RhdGEuZmluZChmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBheGlzID0gX3JlZi5heGlzLFxuICAgICAgICBpbmRleCA9IF9yZWYuaW5kZXg7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd4JyAmJiBpbmRleCA9PT0geEF4aXNJbmRleDtcbiAgfSk7XG4gIHZhciB5QXhpcyA9IGF4aXNEYXRhLmZpbmQoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmMi5heGlzLFxuICAgICAgICBpbmRleCA9IF9yZWYyLmluZGV4O1xuICAgIHJldHVybiBheGlzID09PSAneScgJiYgaW5kZXggPT09IHlBeGlzSW5kZXg7XG4gIH0pO1xuICByZXR1cm4gW3hBeGlzLCB5QXhpc107XG59XG5cbmZ1bmN0aW9uIGdldExpbmVQb3NpdGlvbihsaW5lRGF0YSwgbGluZUF4aXMpIHtcbiAgdmFyIHZhbHVlQXhpc0luZGV4ID0gbGluZUF4aXMuZmluZEluZGV4KGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciBkYXRhID0gX3JlZjMuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhciB2YWx1ZUF4aXMgPSBsaW5lQXhpc1t2YWx1ZUF4aXNJbmRleF07XG4gIHZhciBsYWJlbEF4aXMgPSBsaW5lQXhpc1sxIC0gdmFsdWVBeGlzSW5kZXhdO1xuICB2YXIgbGluZVBvc2l0aW9uID0gdmFsdWVBeGlzLmxpbmVQb3NpdGlvbixcbiAgICAgIGF4aXMgPSB2YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGxhYmVsQXhpcy50aWNrUG9zaXRpb247XG4gIHZhciB0aWNrTnVtID0gdGlja1Bvc2l0aW9uLmxlbmd0aDtcbiAgdmFyIHZhbHVlQXhpc1Bvc0luZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciB2YWx1ZUF4aXNTdGFydFBvcyA9IGxpbmVQb3NpdGlvblswXVt2YWx1ZUF4aXNQb3NJbmRleF07XG4gIHZhciB2YWx1ZUF4aXNFbmRQb3MgPSBsaW5lUG9zaXRpb25bMV1bdmFsdWVBeGlzUG9zSW5kZXhdO1xuICB2YXIgdmFsdWVBeGlzUG9zTWludXMgPSB2YWx1ZUF4aXNFbmRQb3MgLSB2YWx1ZUF4aXNTdGFydFBvcztcbiAgdmFyIG1heFZhbHVlID0gdmFsdWVBeGlzLm1heFZhbHVlLFxuICAgICAgbWluVmFsdWUgPSB2YWx1ZUF4aXMubWluVmFsdWU7XG4gIHZhciB2YWx1ZU1pbnVzID0gbWF4VmFsdWUgLSBtaW5WYWx1ZTtcbiAgdmFyIHBvc2l0aW9uID0gbmV3IEFycmF5KHRpY2tOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICB2YXIgdiA9IGxpbmVEYXRhW2ldO1xuICAgIGlmICh0eXBlb2YgdiAhPT0gJ251bWJlcicpIHJldHVybiBudWxsO1xuICAgIHZhciB2YWx1ZVBlcmNlbnQgPSAodiAtIG1pblZhbHVlKSAvIHZhbHVlTWludXM7XG4gICAgaWYgKHZhbHVlTWludXMgPT09IDApIHZhbHVlUGVyY2VudCA9IDA7XG4gICAgcmV0dXJuIHZhbHVlUGVyY2VudCAqIHZhbHVlQXhpc1Bvc01pbnVzICsgdmFsdWVBeGlzU3RhcnRQb3M7XG4gIH0pO1xuICByZXR1cm4gcG9zaXRpb24ubWFwKGZ1bmN0aW9uICh2UG9zLCBpKSB7XG4gICAgaWYgKGkgPj0gdGlja051bSB8fCB0eXBlb2YgdlBvcyAhPT0gJ251bWJlcicpIHJldHVybiBudWxsO1xuICAgIHZhciBwb3MgPSBbdlBvcywgdGlja1Bvc2l0aW9uW2ldWzEgLSB2YWx1ZUF4aXNQb3NJbmRleF1dO1xuICAgIGlmICh2YWx1ZUF4aXNQb3NJbmRleCA9PT0gMCkgcmV0dXJuIHBvcztcbiAgICBwb3MucmV2ZXJzZSgpO1xuICAgIHJldHVybiBwb3M7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lRmlsbEJvdHRvbVBvcyhsaW5lQXhpcykge1xuICB2YXIgdmFsdWVBeGlzID0gbGluZUF4aXMuZmluZChmdW5jdGlvbiAoX3JlZjQpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY0LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgPT09ICd2YWx1ZSc7XG4gIH0pO1xuICB2YXIgYXhpcyA9IHZhbHVlQXhpcy5heGlzLFxuICAgICAgbGluZVBvc2l0aW9uID0gdmFsdWVBeGlzLmxpbmVQb3NpdGlvbixcbiAgICAgIG1pblZhbHVlID0gdmFsdWVBeGlzLm1pblZhbHVlLFxuICAgICAgbWF4VmFsdWUgPSB2YWx1ZUF4aXMubWF4VmFsdWU7XG4gIHZhciBjaGFuZ2VJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgY2hhbmdlVmFsdWUgPSBsaW5lUG9zaXRpb25bMF1bY2hhbmdlSW5kZXhdO1xuXG4gIGlmIChtaW5WYWx1ZSA8IDAgJiYgbWF4VmFsdWUgPiAwKSB7XG4gICAgdmFyIHZhbHVlTWludXMgPSBtYXhWYWx1ZSAtIG1pblZhbHVlO1xuICAgIHZhciBwb3NNaW51cyA9IE1hdGguYWJzKGxpbmVQb3NpdGlvblswXVtjaGFuZ2VJbmRleF0gLSBsaW5lUG9zaXRpb25bMV1bY2hhbmdlSW5kZXhdKTtcbiAgICB2YXIgb2Zmc2V0ID0gTWF0aC5hYnMobWluVmFsdWUpIC8gdmFsdWVNaW51cyAqIHBvc01pbnVzO1xuICAgIGlmIChheGlzID09PSAneScpIG9mZnNldCAqPSAtMTtcbiAgICBjaGFuZ2VWYWx1ZSArPSBvZmZzZXQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNoYW5nZUluZGV4OiBjaGFuZ2VJbmRleCxcbiAgICBjaGFuZ2VWYWx1ZTogY2hhbmdlVmFsdWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUFyZWFDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gbGluZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgbGluZUZpbGxCb3R0b21Qb3MgPSBsaW5lSXRlbS5saW5lRmlsbEJvdHRvbVBvcyxcbiAgICAgIHJMZXZlbCA9IGxpbmVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogZ2V0TGluZUdyYXBoTmFtZShsaW5lSXRlbSksXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHZpc2libGU6IGxpbmVJdGVtLmxpbmVBcmVhLnNob3csXG4gICAgbGluZUZpbGxCb3R0b21Qb3M6IGxpbmVGaWxsQm90dG9tUG9zLFxuICAgIHNoYXBlOiBnZXRMaW5lQW5kQXJlYVNoYXBlKGxpbmVJdGVtKSxcbiAgICBzdHlsZTogZ2V0TGluZUFyZWFTdHlsZShsaW5lSXRlbSksXG4gICAgZHJhd2VkOiBsaW5lQXJlYURyYXdlZFxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUFuZEFyZWFTaGFwZShsaW5lSXRlbSkge1xuICB2YXIgbGluZVBvc2l0aW9uID0gbGluZUl0ZW0ubGluZVBvc2l0aW9uO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogbGluZVBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVBcmVhU3R5bGUobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVBcmVhID0gbGluZUl0ZW0ubGluZUFyZWEsXG4gICAgICBjb2xvciA9IGxpbmVJdGVtLmNvbG9yO1xuICB2YXIgZ3JhZGllbnQgPSBsaW5lQXJlYS5ncmFkaWVudCxcbiAgICAgIHN0eWxlID0gbGluZUFyZWEuc3R5bGU7XG4gIHZhciBmaWxsQ29sb3IgPSBbc3R5bGUuZmlsbCB8fCBjb2xvcl07XG4gIHZhciBncmFkaWVudENvbG9yID0gKDAsIF91dGlsLmRlZXBNZXJnZSkoZmlsbENvbG9yLCBncmFkaWVudCk7XG4gIGlmIChncmFkaWVudENvbG9yLmxlbmd0aCA9PT0gMSkgZ3JhZGllbnRDb2xvci5wdXNoKGdyYWRpZW50Q29sb3JbMF0pO1xuICB2YXIgZ3JhZGllbnRQYXJhbXMgPSBnZXRHcmFkaWVudFBhcmFtcyhsaW5lSXRlbSk7XG4gIHN0eWxlID0gX29iamVjdFNwcmVhZCh7fSwgc3R5bGUsIHtcbiAgICBzdHJva2U6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICB9KTtcbiAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKHtcbiAgICBncmFkaWVudENvbG9yOiBncmFkaWVudENvbG9yLFxuICAgIGdyYWRpZW50UGFyYW1zOiBncmFkaWVudFBhcmFtcyxcbiAgICBncmFkaWVudFR5cGU6ICdsaW5lYXInLFxuICAgIGdyYWRpZW50V2l0aDogJ2ZpbGwnXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0R3JhZGllbnRQYXJhbXMobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVGaWxsQm90dG9tUG9zID0gbGluZUl0ZW0ubGluZUZpbGxCb3R0b21Qb3MsXG4gICAgICBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb247XG4gIHZhciBjaGFuZ2VJbmRleCA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZUluZGV4LFxuICAgICAgY2hhbmdlVmFsdWUgPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VWYWx1ZTtcbiAgdmFyIG1haW5Qb3MgPSBsaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgcmV0dXJuIHBbY2hhbmdlSW5kZXhdO1xuICB9KTtcbiAgdmFyIG1heFBvcyA9IE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobWFpblBvcykpO1xuICB2YXIgbWluUG9zID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtYWluUG9zKSk7XG4gIHZhciBiZWdpblBvcyA9IG1heFBvcztcbiAgaWYgKGNoYW5nZUluZGV4ID09PSAxKSBiZWdpblBvcyA9IG1pblBvcztcblxuICBpZiAoY2hhbmdlSW5kZXggPT09IDEpIHtcbiAgICByZXR1cm4gWzAsIGJlZ2luUG9zLCAwLCBjaGFuZ2VWYWx1ZV07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtiZWdpblBvcywgMCwgY2hhbmdlVmFsdWUsIDBdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxpbmVBcmVhRHJhd2VkKF9yZWY1LCBfcmVmNikge1xuICB2YXIgbGluZUZpbGxCb3R0b21Qb3MgPSBfcmVmNS5saW5lRmlsbEJvdHRvbVBvcyxcbiAgICAgIHNoYXBlID0gX3JlZjUuc2hhcGU7XG4gIHZhciBjdHggPSBfcmVmNi5jdHg7XG4gIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG4gIHZhciBjaGFuZ2VJbmRleCA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZUluZGV4LFxuICAgICAgY2hhbmdlVmFsdWUgPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VWYWx1ZTtcbiAgdmFyIGxpbmVQb2ludDEgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0pO1xuICB2YXIgbGluZVBvaW50MiA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnRzWzBdKTtcbiAgbGluZVBvaW50MVtjaGFuZ2VJbmRleF0gPSBjaGFuZ2VWYWx1ZTtcbiAgbGluZVBvaW50MltjaGFuZ2VJbmRleF0gPSBjaGFuZ2VWYWx1ZTtcbiAgY3R4LmxpbmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVBvaW50MSkpO1xuICBjdHgubGluZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9pbnQyKSk7XG4gIGN0eC5jbG9zZVBhdGgoKTtcbiAgY3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRMaW5lQXJlYUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgY29uZmlnID0gZ2V0TGluZUFyZWFDb25maWcobGluZUl0ZW0pWzBdO1xuXG4gIHZhciBzdHlsZSA9IF9vYmplY3RTcHJlYWQoe30sIGNvbmZpZy5zdHlsZSk7XG5cbiAgc3R5bGUub3BhY2l0eSA9IDA7XG4gIGNvbmZpZy5zdHlsZSA9IHN0eWxlO1xuICByZXR1cm4gW2NvbmZpZ107XG59XG5cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZUxpbmVBbmRBcmVhKGdyYXBocywgbGluZUl0ZW0sIGksIHVwZGF0ZXIpIHtcbiAgdmFyIGNhY2hlID0gZ3JhcGhzW2ldO1xuICBpZiAoIWNhY2hlKSByZXR1cm47XG4gIHZhciBjdXJyZW50TmFtZSA9IGdldExpbmVHcmFwaE5hbWUobGluZUl0ZW0pO1xuICB2YXIgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBuYW1lID0gY2FjaGVbMF0ubmFtZTtcbiAgdmFyIGRlbEFsbCA9IGN1cnJlbnROYW1lICE9PSBuYW1lO1xuICBpZiAoIWRlbEFsbCkgcmV0dXJuO1xuICBjYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgcmV0dXJuIHJlbmRlci5kZWxHcmFwaChnKTtcbiAgfSk7XG4gIGdyYXBoc1tpXSA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZUxpbmVBbmRBcmVhKGdyYXBoLCBjb25maWcpIHtcbiAgdmFyIHBvaW50cyA9IGNvbmZpZy5zaGFwZS5wb2ludHM7XG4gIHZhciBncmFwaFBvaW50cyA9IGdyYXBoLnNoYXBlLnBvaW50cztcbiAgdmFyIGdyYXBoUG9pbnRzTnVtID0gZ3JhcGhQb2ludHMubGVuZ3RoO1xuICB2YXIgcG9pbnRzTnVtID0gcG9pbnRzLmxlbmd0aDtcblxuICBpZiAocG9pbnRzTnVtID4gZ3JhcGhQb2ludHNOdW0pIHtcbiAgICB2YXIgbGFzdFBvaW50ID0gZ3JhcGhQb2ludHMuc2xpY2UoLTEpWzBdO1xuICAgIHZhciBuZXdBZGRQb2ludHMgPSBuZXcgQXJyYXkocG9pbnRzTnVtIC0gZ3JhcGhQb2ludHNOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICAgIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhc3RQb2ludCk7XG4gICAgfSk7XG4gICAgZ3JhcGhQb2ludHMucHVzaC5hcHBseShncmFwaFBvaW50cywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXdBZGRQb2ludHMpKTtcbiAgfSBlbHNlIGlmIChwb2ludHNOdW0gPCBncmFwaFBvaW50c051bSkge1xuICAgIGdyYXBoUG9pbnRzLnNwbGljZShwb2ludHNOdW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldExpbmVDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gbGluZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGluZUl0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiBnZXRMaW5lR3JhcGhOYW1lKGxpbmVJdGVtKSxcbiAgICBpbmRleDogckxldmVsICsgMSxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXRMaW5lQW5kQXJlYVNoYXBlKGxpbmVJdGVtKSxcbiAgICBzdHlsZTogZ2V0TGluZVN0eWxlKGxpbmVJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUdyYXBoTmFtZShsaW5lSXRlbSkge1xuICB2YXIgc21vb3RoID0gbGluZUl0ZW0uc21vb3RoO1xuICByZXR1cm4gc21vb3RoID8gJ3Ntb290aGxpbmUnIDogJ3BvbHlsaW5lJztcbn1cblxuZnVuY3Rpb24gZ2V0TGluZVN0eWxlKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lU3R5bGUgPSBsaW5lSXRlbS5saW5lU3R5bGUsXG4gICAgICBjb2xvciA9IGxpbmVJdGVtLmNvbG9yLFxuICAgICAgc21vb3RoID0gbGluZUl0ZW0uc21vb3RoLFxuICAgICAgbGluZVBvc2l0aW9uID0gbGluZUl0ZW0ubGluZVBvc2l0aW9uO1xuICB2YXIgbGluZUxlbmd0aCA9IGdldExpbmVMZW5ndGgobGluZVBvc2l0aW9uLCBzbW9vdGgpO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoe1xuICAgIHN0cm9rZTogY29sb3IsXG4gICAgbGluZURhc2g6IFtsaW5lTGVuZ3RoLCAwXVxuICB9LCBsaW5lU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lTGVuZ3RoKHBvaW50cykge1xuICB2YXIgc21vb3RoID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgaWYgKCFzbW9vdGgpIHJldHVybiAoMCwgX3V0aWwuZ2V0UG9seWxpbmVMZW5ndGgpKHBvaW50cyk7XG4gIHZhciBjdXJ2ZSA9IHBvbHlsaW5lVG9CZXppZXJDdXJ2ZShwb2ludHMpO1xuICByZXR1cm4gZ2V0QmV6aWVyQ3VydmVMZW5ndGgoY3VydmUpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydExpbmVDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVEYXNoID0gbGluZUl0ZW0ubGluZVN0eWxlLmxpbmVEYXNoO1xuICB2YXIgY29uZmlnID0gZ2V0TGluZUNvbmZpZyhsaW5lSXRlbSlbMF07XG4gIHZhciByZWFsTGluZURhc2ggPSBjb25maWcuc3R5bGUubGluZURhc2g7XG5cbiAgaWYgKGxpbmVEYXNoKSB7XG4gICAgcmVhbExpbmVEYXNoID0gWzAsIDBdO1xuICB9IGVsc2Uge1xuICAgIHJlYWxMaW5lRGFzaCA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocmVhbExpbmVEYXNoKS5yZXZlcnNlKCk7XG4gIH1cblxuICBjb25maWcuc3R5bGUubGluZURhc2ggPSByZWFsTGluZURhc2g7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gbGluZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGluZUl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0UG9pbnRTaGFwZXMobGluZUl0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRQb2ludFN0eWxlKGxpbmVJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdjaXJjbGUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCArIDIsXG4gICAgICB2aXNpYmxlOiBsaW5lSXRlbS5saW5lUG9pbnQuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFNoYXBlcyhsaW5lSXRlbSkge1xuICB2YXIgbGluZVBvc2l0aW9uID0gbGluZUl0ZW0ubGluZVBvc2l0aW9uLFxuICAgICAgcmFkaXVzID0gbGluZUl0ZW0ubGluZVBvaW50LnJhZGl1cztcbiAgcmV0dXJuIGxpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKF9yZWY3KSB7XG4gICAgdmFyIF9yZWY4ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY3LCAyKSxcbiAgICAgICAgcnggPSBfcmVmOFswXSxcbiAgICAgICAgcnkgPSBfcmVmOFsxXTtcblxuICAgIHJldHVybiB7XG4gICAgICByOiByYWRpdXMsXG4gICAgICByeDogcngsXG4gICAgICByeTogcnlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRTdHlsZShsaW5lSXRlbSkge1xuICB2YXIgY29sb3IgPSBsaW5lSXRlbS5jb2xvcixcbiAgICAgIHN0eWxlID0gbGluZUl0ZW0ubGluZVBvaW50LnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoe1xuICAgIHN0cm9rZTogY29sb3JcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydFBvaW50Q29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBjb25maWdzID0gZ2V0UG9pbnRDb25maWcobGluZUl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGNvbmZpZy5zaGFwZS5yID0gMC4xO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsQ29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsaW5lSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGxpbmVJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldExhYmVsU2hhcGVzKGxpbmVJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0TGFiZWxTdHlsZShsaW5lSXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSwgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsICsgMyxcbiAgICAgIHZpc2libGU6IGxpbmVJdGVtLmxhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTaGFwZXMobGluZUl0ZW0pIHtcbiAgdmFyIGNvbnRlbnRzID0gZm9ybWF0dGVyTGFiZWwobGluZUl0ZW0pO1xuICB2YXIgcG9zaXRpb24gPSBnZXRMYWJlbFBvc2l0aW9uKGxpbmVJdGVtKTtcbiAgcmV0dXJuIGNvbnRlbnRzLm1hcChmdW5jdGlvbiAoY29udGVudCwgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50OiBjb250ZW50LFxuICAgICAgcG9zaXRpb246IHBvc2l0aW9uW2ldXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsUG9zaXRpb24obGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVQb3NpdGlvbiA9IGxpbmVJdGVtLmxpbmVQb3NpdGlvbixcbiAgICAgIGxpbmVGaWxsQm90dG9tUG9zID0gbGluZUl0ZW0ubGluZUZpbGxCb3R0b21Qb3MsXG4gICAgICBsYWJlbCA9IGxpbmVJdGVtLmxhYmVsO1xuICB2YXIgcG9zaXRpb24gPSBsYWJlbC5wb3NpdGlvbixcbiAgICAgIG9mZnNldCA9IGxhYmVsLm9mZnNldDtcbiAgdmFyIGNoYW5nZUluZGV4ID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlSW5kZXgsXG4gICAgICBjaGFuZ2VWYWx1ZSA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZVZhbHVlO1xuICByZXR1cm4gbGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9zKSB7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgcG9zID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3MpO1xuICAgICAgcG9zW2NoYW5nZUluZGV4XSA9IGNoYW5nZVZhbHVlO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIHZhciBib3R0b20gPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvcyk7XG4gICAgICBib3R0b21bY2hhbmdlSW5kZXhdID0gY2hhbmdlVmFsdWU7XG4gICAgICBwb3MgPSBnZXRDZW50ZXJMYWJlbFBvaW50KHBvcywgYm90dG9tKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0T2Zmc2V0ZWRQb2ludChwb3MsIG9mZnNldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRPZmZzZXRlZFBvaW50KF9yZWY5LCBfcmVmMTApIHtcbiAgdmFyIF9yZWYxMSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmOSwgMiksXG4gICAgICB4ID0gX3JlZjExWzBdLFxuICAgICAgeSA9IF9yZWYxMVsxXTtcblxuICB2YXIgX3JlZjEyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMCwgMiksXG4gICAgICBveCA9IF9yZWYxMlswXSxcbiAgICAgIG95ID0gX3JlZjEyWzFdO1xuXG4gIHJldHVybiBbeCArIG94LCB5ICsgb3ldO1xufVxuXG5mdW5jdGlvbiBnZXRDZW50ZXJMYWJlbFBvaW50KF9yZWYxMywgX3JlZjE0KSB7XG4gIHZhciBfcmVmMTUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEzLCAyKSxcbiAgICAgIGF4ID0gX3JlZjE1WzBdLFxuICAgICAgYXkgPSBfcmVmMTVbMV07XG5cbiAgdmFyIF9yZWYxNiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTQsIDIpLFxuICAgICAgYnggPSBfcmVmMTZbMF0sXG4gICAgICBieSA9IF9yZWYxNlsxXTtcblxuICByZXR1cm4gWyhheCArIGJ4KSAvIDIsIChheSArIGJ5KSAvIDJdO1xufVxuXG5mdW5jdGlvbiBmb3JtYXR0ZXJMYWJlbChsaW5lSXRlbSkge1xuICB2YXIgZGF0YSA9IGxpbmVJdGVtLmRhdGEsXG4gICAgICBmb3JtYXR0ZXIgPSBsaW5lSXRlbS5sYWJlbC5mb3JtYXR0ZXI7XG4gIGRhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ251bWJlcic7XG4gIH0pLm1hcChmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLnRvU3RyaW5nKCk7XG4gIH0pO1xuICBpZiAoIWZvcm1hdHRlcikgcmV0dXJuIGRhdGE7XG4gIHZhciB0eXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCBkKTtcbiAgfSk7XG4gIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIoe1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgaW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTdHlsZShsaW5lSXRlbSkge1xuICB2YXIgY29sb3IgPSBsaW5lSXRlbS5jb2xvcixcbiAgICAgIHN0eWxlID0gbGluZUl0ZW0ubGFiZWwuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgc3R5bGUpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5tZXJnZUNvbG9yID0gbWVyZ2VDb2xvcjtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gbWVyZ2VDb2xvcihjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIGRlZmF1bHRDb2xvciA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKF9jb25maWcuY29sb3JDb25maWcsIHRydWUpO1xuICB2YXIgY29sb3IgPSBvcHRpb24uY29sb3IsXG4gICAgICBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICBpZiAoIXNlcmllcykgc2VyaWVzID0gW107XG4gIGlmICghY29sb3IpIGNvbG9yID0gW107XG4gIG9wdGlvbi5jb2xvciA9IGNvbG9yID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKGRlZmF1bHRDb2xvciwgY29sb3IpO1xuICBpZiAoIXNlcmllcy5sZW5ndGgpIHJldHVybjtcbiAgdmFyIGNvbG9yTnVtID0gY29sb3IubGVuZ3RoO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIGlmIChpdGVtLmNvbG9yKSByZXR1cm47XG4gICAgaXRlbS5jb2xvciA9IGNvbG9yW2kgJSBjb2xvck51bV07XG4gIH0pO1xuICB2YXIgcGllcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgdHlwZSA9IF9yZWYudHlwZTtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ3BpZSc7XG4gIH0pO1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHJldHVybiBwaWUuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkaSwgaSkge1xuICAgICAgcmV0dXJuIGRpLmNvbG9yID0gY29sb3JbaSAlIGNvbG9yTnVtXTtcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBnYXVnZXMgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMikge1xuICAgIHZhciB0eXBlID0gX3JlZjIudHlwZTtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2dhdWdlJztcbiAgfSk7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZSkge1xuICAgIHJldHVybiBnYXVnZS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGRpLCBpKSB7XG4gICAgICByZXR1cm4gZGkuY29sb3IgPSBjb2xvcltpICUgY29sb3JOdW1dO1xuICAgIH0pO1xuICB9KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnBpZSA9IHBpZTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfcGllID0gcmVxdWlyZShcIi4uL2NvbmZpZy9waWVcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gcGllKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgaWYgKCFzZXJpZXMpIHNlcmllcyA9IFtdO1xuICB2YXIgcGllcyA9ICgwLCBfdXRpbDIuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX3BpZS5waWVDb25maWcsICdwaWUnKTtcbiAgcGllcyA9IGNhbGNQaWVzQ2VudGVyKHBpZXMsIGNoYXJ0KTtcbiAgcGllcyA9IGNhbGNQaWVzUmFkaXVzKHBpZXMsIGNoYXJ0KTtcbiAgcGllcyA9IGNhbGNSb3NlUGllc1JhZGl1cyhwaWVzLCBjaGFydCk7XG4gIHBpZXMgPSBjYWxjUGllc1BlcmNlbnQocGllcyk7XG4gIHBpZXMgPSBjYWxjUGllc0FuZ2xlKHBpZXMsIGNoYXJ0KTtcbiAgcGllcyA9IGNhbGNQaWVzSW5zaWRlTGFiZWxQb3MocGllcyk7XG4gIHBpZXMgPSBjYWxjUGllc0VkZ2VDZW50ZXJQb3MocGllcyk7XG4gIHBpZXMgPSBjYWxjUGllc091dFNpZGVMYWJlbFBvcyhwaWVzKTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcGllcyxcbiAgICBrZXk6ICdwaWUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRQaWVDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRQaWVDb25maWcsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VQaWVcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHBpZXMsXG4gICAga2V5OiAncGllSW5zaWRlTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRJbnNpZGVMYWJlbENvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcGllcyxcbiAgICBrZXk6ICdwaWVPdXRzaWRlTGFiZWxMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0T3V0c2lkZUxhYmVsTGluZUNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydE91dHNpZGVMYWJlbExpbmVDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHBpZXMsXG4gICAga2V5OiAncGllT3V0c2lkZUxhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0T3V0c2lkZUxhYmVsQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0T3V0c2lkZUxhYmVsQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc0NlbnRlcihwaWVzLCBjaGFydCkge1xuICB2YXIgYXJlYSA9IGNoYXJ0LnJlbmRlci5hcmVhO1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHZhciBjZW50ZXIgPSBwaWUuY2VudGVyO1xuICAgIGNlbnRlciA9IGNlbnRlci5tYXAoZnVuY3Rpb24gKHBvcywgaSkge1xuICAgICAgaWYgKHR5cGVvZiBwb3MgPT09ICdudW1iZXInKSByZXR1cm4gcG9zO1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBvcykgLyAxMDAgKiBhcmVhW2ldO1xuICAgIH0pO1xuICAgIHBpZS5jZW50ZXIgPSBjZW50ZXI7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNSYWRpdXMocGllcywgY2hhcnQpIHtcbiAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2hhcnQucmVuZGVyLmFyZWEpKSAvIDI7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIHJhZGl1cyA9IHBpZS5yYWRpdXMsXG4gICAgICAgIGRhdGEgPSBwaWUuZGF0YTtcbiAgICByYWRpdXMgPSBnZXROdW1iZXJSYWRpdXMocmFkaXVzLCBtYXhSYWRpdXMpO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGl0ZW1SYWRpdXMgPSBpdGVtLnJhZGl1cztcbiAgICAgIGlmICghaXRlbVJhZGl1cykgaXRlbVJhZGl1cyA9IHJhZGl1cztcbiAgICAgIGl0ZW1SYWRpdXMgPSBnZXROdW1iZXJSYWRpdXMoaXRlbVJhZGl1cywgbWF4UmFkaXVzKTtcbiAgICAgIGl0ZW0ucmFkaXVzID0gaXRlbVJhZGl1cztcbiAgICB9KTtcbiAgICBwaWUucmFkaXVzID0gcmFkaXVzO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGdldE51bWJlclJhZGl1cyhyYWRpdXMsIG1heFJhZGl1cykge1xuICBpZiAoIShyYWRpdXMgaW5zdGFuY2VvZiBBcnJheSkpIHJhZGl1cyA9IFswLCByYWRpdXNdO1xuICByYWRpdXMgPSByYWRpdXMubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgaWYgKHR5cGVvZiByID09PSAnbnVtYmVyJykgcmV0dXJuIHI7XG4gICAgcmV0dXJuIHBhcnNlSW50KHIpIC8gMTAwICogbWF4UmFkaXVzO1xuICB9KTtcbiAgcmV0dXJuIHJhZGl1cztcbn1cblxuZnVuY3Rpb24gY2FsY1Jvc2VQaWVzUmFkaXVzKHBpZXMsIGNoYXJ0KSB7XG4gIHZhciByb3NlUGllID0gcGllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgcm9zZVR5cGUgPSBfcmVmLnJvc2VUeXBlO1xuICAgIHJldHVybiByb3NlVHlwZTtcbiAgfSk7XG4gIHJvc2VQaWUuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIHJhZGl1cyA9IHBpZS5yYWRpdXMsXG4gICAgICAgIGRhdGEgPSBwaWUuZGF0YSxcbiAgICAgICAgcm9zZVNvcnQgPSBwaWUucm9zZVNvcnQ7XG4gICAgdmFyIHJvc2VJbmNyZW1lbnQgPSBnZXRSb3NlSW5jcmVtZW50KHBpZSk7XG4gICAgdmFyIGRhdGFDb3B5ID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShkYXRhKTtcbiAgICBkYXRhID0gc29ydERhdGEoZGF0YSk7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICBpdGVtLnJhZGl1c1sxXSA9IHJhZGl1c1sxXSAtIHJvc2VJbmNyZW1lbnQgKiBpO1xuICAgIH0pO1xuXG4gICAgaWYgKHJvc2VTb3J0KSB7XG4gICAgICBkYXRhLnJldmVyc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGllLmRhdGEgPSBkYXRhQ29weTtcbiAgICB9XG5cbiAgICBwaWUucm9zZUluY3JlbWVudCA9IHJvc2VJbmNyZW1lbnQ7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gc29ydERhdGEoZGF0YSkge1xuICByZXR1cm4gZGF0YS5zb3J0KGZ1bmN0aW9uIChfcmVmMiwgX3JlZjMpIHtcbiAgICB2YXIgYSA9IF9yZWYyLnZhbHVlO1xuICAgIHZhciBiID0gX3JlZjMudmFsdWU7XG4gICAgaWYgKGEgPT09IGIpIHJldHVybiAwO1xuICAgIGlmIChhID4gYikgcmV0dXJuIC0xO1xuICAgIGlmIChhIDwgYikgcmV0dXJuIDE7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRSb3NlSW5jcmVtZW50KHBpZSkge1xuICB2YXIgcmFkaXVzID0gcGllLnJhZGl1cyxcbiAgICAgIHJvc2VJbmNyZW1lbnQgPSBwaWUucm9zZUluY3JlbWVudDtcbiAgaWYgKHR5cGVvZiByb3NlSW5jcmVtZW50ID09PSAnbnVtYmVyJykgcmV0dXJuIHJvc2VJbmNyZW1lbnQ7XG5cbiAgaWYgKHJvc2VJbmNyZW1lbnQgPT09ICdhdXRvJykge1xuICAgIHZhciBkYXRhID0gcGllLmRhdGE7XG4gICAgdmFyIGFsbFJhZGl1cyA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uIChhbGwsIF9yZWY0KSB7XG4gICAgICB2YXIgcmFkaXVzID0gX3JlZjQucmFkaXVzO1xuICAgICAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFsbCksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocmFkaXVzKSk7XG4gICAgfSwgW10pO1xuICAgIHZhciBtaW5SYWRpdXMgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFsbFJhZGl1cykpO1xuICAgIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFsbFJhZGl1cykpO1xuICAgIHJldHVybiAobWF4UmFkaXVzIC0gbWluUmFkaXVzKSAqIDAuNiAvIChkYXRhLmxlbmd0aCAtIDEgfHwgMSk7XG4gIH1cblxuICByZXR1cm4gcGFyc2VJbnQocm9zZUluY3JlbWVudCkgLyAxMDAgKiByYWRpdXNbMV07XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzUGVyY2VudChwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIGRhdGEgPSBwaWUuZGF0YSxcbiAgICAgICAgcGVyY2VudFRvRml4ZWQgPSBwaWUucGVyY2VudFRvRml4ZWQ7XG4gICAgdmFyIHN1bSA9IGdldERhdGFTdW0oZGF0YSk7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpdGVtLnZhbHVlO1xuICAgICAgaXRlbS5wZXJjZW50ID0gcGFyc2VGbG9hdCgodmFsdWUgLyBzdW0gKiAxMDApLnRvRml4ZWQocGVyY2VudFRvRml4ZWQpKTtcbiAgICB9KTtcbiAgICB2YXIgcGVyY2VudFN1bU5vTGFzdCA9ICgwLCBfdXRpbDIubXVsQWRkKShkYXRhLnNsaWNlKDAsIC0xKS5tYXAoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgICB2YXIgcGVyY2VudCA9IF9yZWY1LnBlcmNlbnQ7XG4gICAgICByZXR1cm4gcGVyY2VudDtcbiAgICB9KSk7XG4gICAgZGF0YS5zbGljZSgtMSlbMF0ucGVyY2VudCA9IDEwMCAtIHBlcmNlbnRTdW1Ob0xhc3Q7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YVN1bShkYXRhKSB7XG4gIHJldHVybiAoMCwgX3V0aWwyLm11bEFkZCkoZGF0YS5tYXAoZnVuY3Rpb24gKF9yZWY2KSB7XG4gICAgdmFyIHZhbHVlID0gX3JlZjYudmFsdWU7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9KSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzQW5nbGUocGllcykge1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHZhciBzdGFydCA9IHBpZS5zdGFydEFuZ2xlLFxuICAgICAgICBkYXRhID0gcGllLmRhdGE7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICB2YXIgX2dldERhdGFBbmdsZSA9IGdldERhdGFBbmdsZShkYXRhLCBpKSxcbiAgICAgICAgICBfZ2V0RGF0YUFuZ2xlMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZ2V0RGF0YUFuZ2xlLCAyKSxcbiAgICAgICAgICBzdGFydEFuZ2xlID0gX2dldERhdGFBbmdsZTJbMF0sXG4gICAgICAgICAgZW5kQW5nbGUgPSBfZ2V0RGF0YUFuZ2xlMlsxXTtcblxuICAgICAgaXRlbS5zdGFydEFuZ2xlID0gc3RhcnQgKyBzdGFydEFuZ2xlO1xuICAgICAgaXRlbS5lbmRBbmdsZSA9IHN0YXJ0ICsgZW5kQW5nbGU7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YUFuZ2xlKGRhdGEsIGkpIHtcbiAgdmFyIGZ1bGxBbmdsZSA9IE1hdGguUEkgKiAyO1xuICB2YXIgbmVlZEFkZERhdGEgPSBkYXRhLnNsaWNlKDAsIGkgKyAxKTtcbiAgdmFyIHBlcmNlbnRTdW0gPSAoMCwgX3V0aWwyLm11bEFkZCkobmVlZEFkZERhdGEubWFwKGZ1bmN0aW9uIChfcmVmNykge1xuICAgIHZhciBwZXJjZW50ID0gX3JlZjcucGVyY2VudDtcbiAgICByZXR1cm4gcGVyY2VudDtcbiAgfSkpO1xuICB2YXIgcGVyY2VudCA9IGRhdGFbaV0ucGVyY2VudDtcbiAgdmFyIHN0YXJ0UGVyY2VudCA9IHBlcmNlbnRTdW0gLSBwZXJjZW50O1xuICByZXR1cm4gW2Z1bGxBbmdsZSAqIHN0YXJ0UGVyY2VudCAvIDEwMCwgZnVsbEFuZ2xlICogcGVyY2VudFN1bSAvIDEwMF07XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzSW5zaWRlTGFiZWxQb3MocGllcykge1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZUl0ZW0pIHtcbiAgICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGl0ZW0uaW5zaWRlTGFiZWxQb3MgPSBnZXRQaWVJbnNpZGVMYWJlbFBvcyhwaWVJdGVtLCBpdGVtKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVJbnNpZGVMYWJlbFBvcyhwaWVJdGVtLCBkYXRhSXRlbSkge1xuICB2YXIgY2VudGVyID0gcGllSXRlbS5jZW50ZXI7XG5cbiAgdmFyIHN0YXJ0QW5nbGUgPSBkYXRhSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBkYXRhSXRlbS5lbmRBbmdsZSxcbiAgICAgIF9kYXRhSXRlbSRyYWRpdXMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoZGF0YUl0ZW0ucmFkaXVzLCAyKSxcbiAgICAgIGlyID0gX2RhdGFJdGVtJHJhZGl1c1swXSxcbiAgICAgIG9yID0gX2RhdGFJdGVtJHJhZGl1c1sxXTtcblxuICB2YXIgcmFkaXVzID0gKGlyICsgb3IpIC8gMjtcbiAgdmFyIGFuZ2xlID0gKHN0YXJ0QW5nbGUgKyBlbmRBbmdsZSkgLyAyO1xuICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtyYWRpdXMsIGFuZ2xlXSkpO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc0VkZ2VDZW50ZXJQb3MocGllcykge1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHZhciBkYXRhID0gcGllLmRhdGEsXG4gICAgICAgIGNlbnRlciA9IHBpZS5jZW50ZXI7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgc3RhcnRBbmdsZSA9IGl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgICAgICBlbmRBbmdsZSA9IGl0ZW0uZW5kQW5nbGUsXG4gICAgICAgICAgcmFkaXVzID0gaXRlbS5yYWRpdXM7XG4gICAgICB2YXIgY2VudGVyQW5nbGUgPSAoc3RhcnRBbmdsZSArIGVuZEFuZ2xlKSAvIDI7XG5cbiAgICAgIHZhciBwb3MgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1c1sxXSwgY2VudGVyQW5nbGVdKSk7XG5cbiAgICAgIGl0ZW0uZWRnZUNlbnRlclBvcyA9IHBvcztcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc091dFNpZGVMYWJlbFBvcyhwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllSXRlbSkge1xuICAgIHZhciBsZWZ0UGllRGF0YUl0ZW1zID0gZ2V0TGVmdE9yUmlnaHRQaWVEYXRhSXRlbXMocGllSXRlbSk7XG4gICAgdmFyIHJpZ2h0UGllRGF0YUl0ZW1zID0gZ2V0TGVmdE9yUmlnaHRQaWVEYXRhSXRlbXMocGllSXRlbSwgZmFsc2UpO1xuICAgIGxlZnRQaWVEYXRhSXRlbXMgPSBzb3J0UGllc0Zyb21Ub3BUb0JvdHRvbShsZWZ0UGllRGF0YUl0ZW1zKTtcbiAgICByaWdodFBpZURhdGFJdGVtcyA9IHNvcnRQaWVzRnJvbVRvcFRvQm90dG9tKHJpZ2h0UGllRGF0YUl0ZW1zKTtcbiAgICBhZGRMYWJlbExpbmVBbmRBbGlnbihsZWZ0UGllRGF0YUl0ZW1zLCBwaWVJdGVtKTtcbiAgICBhZGRMYWJlbExpbmVBbmRBbGlnbihyaWdodFBpZURhdGFJdGVtcywgcGllSXRlbSwgZmFsc2UpO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsTGluZUJlbmRSYWRpdXMocGllSXRlbSkge1xuICB2YXIgbGFiZWxMaW5lQmVuZEdhcCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLmxhYmVsTGluZUJlbmRHYXA7XG4gIHZhciBtYXhSYWRpdXMgPSBnZXRQaWVNYXhSYWRpdXMocGllSXRlbSk7XG5cbiAgaWYgKHR5cGVvZiBsYWJlbExpbmVCZW5kR2FwICE9PSAnbnVtYmVyJykge1xuICAgIGxhYmVsTGluZUJlbmRHYXAgPSBwYXJzZUludChsYWJlbExpbmVCZW5kR2FwKSAvIDEwMCAqIG1heFJhZGl1cztcbiAgfVxuXG4gIHJldHVybiBsYWJlbExpbmVCZW5kR2FwICsgbWF4UmFkaXVzO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVNYXhSYWRpdXMocGllSXRlbSkge1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIHJhZGl1cyA9IGRhdGEubWFwKGZ1bmN0aW9uIChfcmVmOCkge1xuICAgIHZhciBfcmVmOCRyYWRpdXMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgucmFkaXVzLCAyKSxcbiAgICAgICAgZm9vID0gX3JlZjgkcmFkaXVzWzBdLFxuICAgICAgICByID0gX3JlZjgkcmFkaXVzWzFdO1xuXG4gICAgcmV0dXJuIHI7XG4gIH0pO1xuICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyYWRpdXMpKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGVmdE9yUmlnaHRQaWVEYXRhSXRlbXMocGllSXRlbSkge1xuICB2YXIgbGVmdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdHJ1ZTtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICBjZW50ZXIgPSBwaWVJdGVtLmNlbnRlcjtcbiAgdmFyIGNlbnRlclhQb3MgPSBjZW50ZXJbMF07XG4gIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbiAoX3JlZjkpIHtcbiAgICB2YXIgZWRnZUNlbnRlclBvcyA9IF9yZWY5LmVkZ2VDZW50ZXJQb3M7XG4gICAgdmFyIHhQb3MgPSBlZGdlQ2VudGVyUG9zWzBdO1xuICAgIGlmIChsZWZ0KSByZXR1cm4geFBvcyA8PSBjZW50ZXJYUG9zO1xuICAgIHJldHVybiB4UG9zID4gY2VudGVyWFBvcztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNvcnRQaWVzRnJvbVRvcFRvQm90dG9tKGRhdGFJdGVtKSB7XG4gIGRhdGFJdGVtLnNvcnQoZnVuY3Rpb24gKF9yZWYxMCwgX3JlZjExKSB7XG4gICAgdmFyIF9yZWYxMCRlZGdlQ2VudGVyUG9zID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMC5lZGdlQ2VudGVyUG9zLCAyKSxcbiAgICAgICAgdCA9IF9yZWYxMCRlZGdlQ2VudGVyUG9zWzBdLFxuICAgICAgICBheSA9IF9yZWYxMCRlZGdlQ2VudGVyUG9zWzFdO1xuXG4gICAgdmFyIF9yZWYxMSRlZGdlQ2VudGVyUG9zID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMS5lZGdlQ2VudGVyUG9zLCAyKSxcbiAgICAgICAgdHQgPSBfcmVmMTEkZWRnZUNlbnRlclBvc1swXSxcbiAgICAgICAgYnkgPSBfcmVmMTEkZWRnZUNlbnRlclBvc1sxXTtcblxuICAgIGlmIChheSA+IGJ5KSByZXR1cm4gMTtcbiAgICBpZiAoYXkgPCBieSkgcmV0dXJuIC0xO1xuICAgIGlmIChheSA9PT0gYnkpIHJldHVybiAwO1xuICB9KTtcbiAgcmV0dXJuIGRhdGFJdGVtO1xufVxuXG5mdW5jdGlvbiBhZGRMYWJlbExpbmVBbmRBbGlnbihkYXRhSXRlbSwgcGllSXRlbSkge1xuICB2YXIgbGVmdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogdHJ1ZTtcbiAgdmFyIGNlbnRlciA9IHBpZUl0ZW0uY2VudGVyLFxuICAgICAgb3V0c2lkZUxhYmVsID0gcGllSXRlbS5vdXRzaWRlTGFiZWw7XG4gIHZhciByYWRpdXMgPSBnZXRMYWJlbExpbmVCZW5kUmFkaXVzKHBpZUl0ZW0pO1xuICBkYXRhSXRlbS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIGVkZ2VDZW50ZXJQb3MgPSBpdGVtLmVkZ2VDZW50ZXJQb3MsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBpdGVtLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gaXRlbS5lbmRBbmdsZTtcbiAgICB2YXIgbGFiZWxMaW5lRW5kTGVuZ3RoID0gb3V0c2lkZUxhYmVsLmxhYmVsTGluZUVuZExlbmd0aDtcbiAgICB2YXIgYW5nbGUgPSAoc3RhcnRBbmdsZSArIGVuZEFuZ2xlKSAvIDI7XG5cbiAgICB2YXIgYmVuZFBvaW50ID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtyYWRpdXMsIGFuZ2xlXSkpO1xuXG4gICAgdmFyIGVuZFBvaW50ID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShiZW5kUG9pbnQpO1xuICAgIGVuZFBvaW50WzBdICs9IGxhYmVsTGluZUVuZExlbmd0aCAqIChsZWZ0ID8gLTEgOiAxKTtcbiAgICBpdGVtLmxhYmVsTGluZSA9IFtlZGdlQ2VudGVyUG9zLCBiZW5kUG9pbnQsIGVuZFBvaW50XTtcbiAgICBpdGVtLmxhYmVsTGluZUxlbmd0aCA9ICgwLCBfdXRpbDIuZ2V0UG9seWxpbmVMZW5ndGgpKGl0ZW0ubGFiZWxMaW5lKTtcbiAgICBpdGVtLmFsaWduID0ge1xuICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gICAgfTtcbiAgICBpZiAobGVmdCkgaXRlbS5hbGlnbi50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UGllQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHBpZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBwaWVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BpZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldFBpZVNoYXBlKHBpZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldFBpZVN0eWxlKHBpZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UGllQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkRlbGF5R2FwID0gcGllSXRlbS5hbmltYXRpb25EZWxheUdhcCxcbiAgICAgIHN0YXJ0QW5pbWF0aW9uQ3VydmUgPSBwaWVJdGVtLnN0YXJ0QW5pbWF0aW9uQ3VydmU7XG4gIHZhciBjb25maWdzID0gZ2V0UGllQ29uZmlnKHBpZUl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZywgaSkge1xuICAgIGNvbmZpZy5hbmltYXRpb25DdXJ2ZSA9IHN0YXJ0QW5pbWF0aW9uQ3VydmU7XG4gICAgY29uZmlnLmFuaW1hdGlvbkRlbGF5ID0gaSAqIGFuaW1hdGlvbkRlbGF5R2FwO1xuICAgIGNvbmZpZy5zaGFwZS5vciA9IGNvbmZpZy5zaGFwZS5pcjtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VQaWUoZ3JhcGgpIHtcbiAgZ3JhcGguYW5pbWF0aW9uRGVsYXkgPSAwO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVTaGFwZShwaWVJdGVtLCBpKSB7XG4gIHZhciBjZW50ZXIgPSBwaWVJdGVtLmNlbnRlcixcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBkYXRhSXRlbSA9IGRhdGFbaV07XG4gIHZhciByYWRpdXMgPSBkYXRhSXRlbS5yYWRpdXMsXG4gICAgICBzdGFydEFuZ2xlID0gZGF0YUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gZGF0YUl0ZW0uZW5kQW5nbGU7XG4gIHJldHVybiB7XG4gICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSxcbiAgICBlbmRBbmdsZTogZW5kQW5nbGUsXG4gICAgaXI6IHJhZGl1c1swXSxcbiAgICBvcjogcmFkaXVzWzFdLFxuICAgIHJ4OiBjZW50ZXJbMF0sXG4gICAgcnk6IGNlbnRlclsxXVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRQaWVTdHlsZShwaWVJdGVtLCBpKSB7XG4gIHZhciBwaWVTdHlsZSA9IHBpZUl0ZW0ucGllU3R5bGUsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZGF0YUl0ZW0gPSBkYXRhW2ldO1xuICB2YXIgY29sb3IgPSBkYXRhSXRlbS5jb2xvcjtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgcGllU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRJbnNpZGVMYWJlbENvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHBpZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhLFxuICAgICAgckxldmVsID0gcGllSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBwaWVJdGVtLmluc2lkZUxhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0SW5zaWRlTGFiZWxTaGFwZShwaWVJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRJbnNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEluc2lkZUxhYmVsU2hhcGUocGllSXRlbSwgaSkge1xuICB2YXIgaW5zaWRlTGFiZWwgPSBwaWVJdGVtLmluc2lkZUxhYmVsLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGZvcm1hdHRlciA9IGluc2lkZUxhYmVsLmZvcm1hdHRlcjtcbiAgdmFyIGRhdGFJdGVtID0gZGF0YVtpXTtcbiAgdmFyIGZvcm1hdHRlclR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICB2YXIgbGFiZWwgPSAnJztcblxuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBsYWJlbCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7bmFtZX0nLCBkYXRhSXRlbS5uYW1lKTtcbiAgICBsYWJlbCA9IGxhYmVsLnJlcGxhY2UoJ3twZXJjZW50fScsIGRhdGFJdGVtLnBlcmNlbnQpO1xuICAgIGxhYmVsID0gbGFiZWwucmVwbGFjZSgne3ZhbHVlfScsIGRhdGFJdGVtLnZhbHVlKTtcbiAgfVxuXG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGFiZWwgPSBmb3JtYXR0ZXIoZGF0YUl0ZW0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBsYWJlbCxcbiAgICBwb3NpdGlvbjogZGF0YUl0ZW0uaW5zaWRlTGFiZWxQb3NcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5zaWRlTGFiZWxTdHlsZShwaWVJdGVtLCBpKSB7XG4gIHZhciBzdHlsZSA9IHBpZUl0ZW0uaW5zaWRlTGFiZWwuc3R5bGU7XG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0c2lkZUxhYmVsTGluZUNvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHBpZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhLFxuICAgICAgckxldmVsID0gcGllSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcGllSXRlbS5vdXRzaWRlTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRPdXRzaWRlTGFiZWxMaW5lU2hhcGUocGllSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0T3V0c2lkZUxhYmVsTGluZVN0eWxlKHBpZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0T3V0c2lkZUxhYmVsTGluZUNvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgY29uZmlncyA9IGdldE91dHNpZGVMYWJlbExpbmVDb25maWcocGllSXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnLCBpKSB7XG4gICAgY29uZmlnLnN0eWxlLmxpbmVEYXNoID0gWzAsIGRhdGFbaV0ubGFiZWxMaW5lTGVuZ3RoXTtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxMaW5lU2hhcGUocGllSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGRhdGFJdGVtID0gZGF0YVtpXTtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IGRhdGFJdGVtLmxhYmVsTGluZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxMaW5lU3R5bGUocGllSXRlbSwgaSkge1xuICB2YXIgb3V0c2lkZUxhYmVsID0gcGllSXRlbS5vdXRzaWRlTGFiZWwsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgbGFiZWxMaW5lU3R5bGUgPSBvdXRzaWRlTGFiZWwubGFiZWxMaW5lU3R5bGU7XG4gIHZhciBjb2xvciA9IGRhdGFbaV0uY29sb3I7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIHN0cm9rZTogY29sb3IsXG4gICAgbGluZURhc2g6IFtkYXRhW2ldLmxhYmVsTGluZUxlbmd0aCwgMF1cbiAgfSwgbGFiZWxMaW5lU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxDb25maWcocGllSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBwaWVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBwaWVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIHJMZXZlbCA9IHBpZUl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcGllSXRlbS5vdXRzaWRlTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRPdXRzaWRlTGFiZWxTaGFwZShwaWVJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRPdXRzaWRlTGFiZWxTdHlsZShwaWVJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydE91dHNpZGVMYWJlbENvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgY29uZmlncyA9IGdldE91dHNpZGVMYWJlbENvbmZpZyhwaWVJdGVtKTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcsIGkpIHtcbiAgICBjb25maWcuc2hhcGUucG9zaXRpb24gPSBkYXRhW2ldLmxhYmVsTGluZVsxXTtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxTaGFwZShwaWVJdGVtLCBpKSB7XG4gIHZhciBvdXRzaWRlTGFiZWwgPSBwaWVJdGVtLm91dHNpZGVMYWJlbCxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBmb3JtYXR0ZXIgPSBvdXRzaWRlTGFiZWwuZm9ybWF0dGVyO1xuICB2YXIgX2RhdGEkaSA9IGRhdGFbaV0sXG4gICAgICBsYWJlbExpbmUgPSBfZGF0YSRpLmxhYmVsTGluZSxcbiAgICAgIG5hbWUgPSBfZGF0YSRpLm5hbWUsXG4gICAgICBwZXJjZW50ID0gX2RhdGEkaS5wZXJjZW50LFxuICAgICAgdmFsdWUgPSBfZGF0YSRpLnZhbHVlO1xuICB2YXIgZm9ybWF0dGVyVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gIHZhciBsYWJlbCA9ICcnO1xuXG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgIGxhYmVsID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3tuYW1lfScsIG5hbWUpO1xuICAgIGxhYmVsID0gbGFiZWwucmVwbGFjZSgne3BlcmNlbnR9JywgcGVyY2VudCk7XG4gICAgbGFiZWwgPSBsYWJlbC5yZXBsYWNlKCd7dmFsdWV9JywgdmFsdWUpO1xuICB9XG5cbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBsYWJlbCA9IGZvcm1hdHRlcihkYXRhW2ldKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29udGVudDogbGFiZWwsXG4gICAgcG9zaXRpb246IGxhYmVsTGluZVsyXVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxTdHlsZShwaWVJdGVtLCBpKSB7XG4gIHZhciBvdXRzaWRlTGFiZWwgPSBwaWVJdGVtLm91dHNpZGVMYWJlbCxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBfZGF0YSRpMiA9IGRhdGFbaV0sXG4gICAgICBjb2xvciA9IF9kYXRhJGkyLmNvbG9yLFxuICAgICAgYWxpZ24gPSBfZGF0YSRpMi5hbGlnbjtcbiAgdmFyIHN0eWxlID0gb3V0c2lkZUxhYmVsLnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKF9vYmplY3RTcHJlYWQoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIGFsaWduKSwgc3R5bGUpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXIgPSByYWRhcjtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfaW5kZXggPSByZXF1aXJlKFwiLi4vY29uZmlnL2luZGV4XCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gcmFkYXIoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICBpZiAoIXNlcmllcykgc2VyaWVzID0gW107XG4gIHZhciByYWRhcnMgPSAoMCwgX3V0aWwyLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9pbmRleC5yYWRhckNvbmZpZywgJ3JhZGFyJyk7XG4gIHJhZGFycyA9IGNhbGNSYWRhclBvc2l0aW9uKHJhZGFycywgY2hhcnQpO1xuICByYWRhcnMgPSBjYWxjUmFkYXJMYWJlbFBvc2l0aW9uKHJhZGFycywgY2hhcnQpO1xuICByYWRhcnMgPSBjYWxjUmFkYXJMYWJlbEFsaWduKHJhZGFycywgY2hhcnQpO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhcnMsXG4gICAga2V5OiAncmFkYXInLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRSYWRhckNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFJhZGFyQ29uZmlnLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlUmFkYXJcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFycyxcbiAgICBrZXk6ICdyYWRhclBvaW50JyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0UG9pbnRDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRQb2ludENvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJzLFxuICAgIGtleTogJ3JhZGFyTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMYWJlbENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyUG9zaXRpb24ocmFkYXJzLCBjaGFydCkge1xuICB2YXIgcmFkYXJBeGlzID0gY2hhcnQucmFkYXJBeGlzO1xuICBpZiAoIXJhZGFyQXhpcykgcmV0dXJuIFtdO1xuICB2YXIgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcixcbiAgICAgIGF4aXNMaW5lQW5nbGVzID0gcmFkYXJBeGlzLmF4aXNMaW5lQW5nbGVzLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cyxcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3M7XG4gIHJhZGFycy5mb3JFYWNoKGZ1bmN0aW9uIChyYWRhckl0ZW0pIHtcbiAgICB2YXIgZGF0YSA9IHJhZGFySXRlbS5kYXRhO1xuICAgIHJhZGFySXRlbS5kYXRhUmFkaXVzID0gW107XG4gICAgcmFkYXJJdGVtLnJhZGFyUG9zaXRpb24gPSBpbmRpY2F0b3IubWFwKGZ1bmN0aW9uIChfcmVmLCBpKSB7XG4gICAgICB2YXIgbWF4ID0gX3JlZi5tYXgsXG4gICAgICAgICAgbWluID0gX3JlZi5taW47XG4gICAgICB2YXIgdiA9IGRhdGFbaV07XG4gICAgICBpZiAodHlwZW9mIG1heCAhPT0gJ251bWJlcicpIG1heCA9IHY7XG4gICAgICBpZiAodHlwZW9mIG1pbiAhPT0gJ251bWJlcicpIG1pbiA9IDA7XG4gICAgICBpZiAodHlwZW9mIHYgIT09ICdudW1iZXInKSB2ID0gbWluO1xuICAgICAgdmFyIGRhdGFSYWRpdXMgPSAodiAtIG1pbikgLyAobWF4IC0gbWluKSAqIHJhZGl1cztcbiAgICAgIHJhZGFySXRlbS5kYXRhUmFkaXVzW2ldID0gZGF0YVJhZGl1cztcbiAgICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW2RhdGFSYWRpdXMsIGF4aXNMaW5lQW5nbGVzW2ldXSkpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFycztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyTGFiZWxQb3NpdGlvbihyYWRhcnMsIGNoYXJ0KSB7XG4gIHZhciByYWRhckF4aXMgPSBjaGFydC5yYWRhckF4aXM7XG4gIGlmICghcmFkYXJBeGlzKSByZXR1cm4gW107XG4gIHZhciBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXM7XG4gIHJhZGFycy5mb3JFYWNoKGZ1bmN0aW9uIChyYWRhckl0ZW0pIHtcbiAgICB2YXIgZGF0YVJhZGl1cyA9IHJhZGFySXRlbS5kYXRhUmFkaXVzLFxuICAgICAgICBsYWJlbCA9IHJhZGFySXRlbS5sYWJlbDtcbiAgICB2YXIgbGFiZWxHYXAgPSBsYWJlbC5sYWJlbEdhcDtcbiAgICByYWRhckl0ZW0ubGFiZWxQb3NpdGlvbiA9IGRhdGFSYWRpdXMubWFwKGZ1bmN0aW9uIChyLCBpKSB7XG4gICAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyICsgbGFiZWxHYXAsIGF4aXNMaW5lQW5nbGVzW2ldXSkpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFycztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyTGFiZWxBbGlnbihyYWRhcnMsIGNoYXJ0KSB7XG4gIHZhciByYWRhckF4aXMgPSBjaGFydC5yYWRhckF4aXM7XG4gIGlmICghcmFkYXJBeGlzKSByZXR1cm4gW107XG5cbiAgdmFyIF9yYWRhckF4aXMkY2VudGVyUG9zID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHJhZGFyQXhpcy5jZW50ZXJQb3MsIDIpLFxuICAgICAgeCA9IF9yYWRhckF4aXMkY2VudGVyUG9zWzBdLFxuICAgICAgeSA9IF9yYWRhckF4aXMkY2VudGVyUG9zWzFdO1xuXG4gIHJhZGFycy5mb3JFYWNoKGZ1bmN0aW9uIChyYWRhckl0ZW0pIHtcbiAgICB2YXIgbGFiZWxQb3NpdGlvbiA9IHJhZGFySXRlbS5sYWJlbFBvc2l0aW9uO1xuICAgIHZhciBsYWJlbEFsaWduID0gbGFiZWxQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgICB2YXIgX3JlZjMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjIsIDIpLFxuICAgICAgICAgIGx4ID0gX3JlZjNbMF0sXG4gICAgICAgICAgbHkgPSBfcmVmM1sxXTtcblxuICAgICAgdmFyIHRleHRBbGlnbiA9IGx4ID4geCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgICB2YXIgdGV4dEJhc2VsaW5lID0gbHkgPiB5ID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHRBbGlnbjogdGV4dEFsaWduLFxuICAgICAgICB0ZXh0QmFzZWxpbmU6IHRleHRCYXNlbGluZVxuICAgICAgfTtcbiAgICB9KTtcbiAgICByYWRhckl0ZW0ubGFiZWxBbGlnbiA9IGxhYmVsQWxpZ247XG4gIH0pO1xuICByZXR1cm4gcmFkYXJzO1xufVxuXG5mdW5jdGlvbiBnZXRSYWRhckNvbmZpZyhyYWRhckl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckl0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0UmFkYXJTaGFwZShyYWRhckl0ZW0pLFxuICAgIHN0eWxlOiBnZXRSYWRhclN0eWxlKHJhZGFySXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UmFkYXJDb25maWcocmFkYXJJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBjZW50ZXJQb3MgPSB1cGRhdGVyLmNoYXJ0LnJhZGFyQXhpcy5jZW50ZXJQb3M7XG4gIHZhciBjb25maWcgPSBnZXRSYWRhckNvbmZpZyhyYWRhckl0ZW0pWzBdO1xuICB2YXIgcG9pbnROdW0gPSBjb25maWcuc2hhcGUucG9pbnRzLmxlbmd0aDtcbiAgdmFyIHBvaW50cyA9IG5ldyBBcnJheShwb2ludE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbykge1xuICAgIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcyk7XG4gIH0pO1xuICBjb25maWcuc2hhcGUucG9pbnRzID0gcG9pbnRzO1xuICByZXR1cm4gW2NvbmZpZ107XG59XG5cbmZ1bmN0aW9uIGdldFJhZGFyU2hhcGUocmFkYXJJdGVtKSB7XG4gIHZhciByYWRhclBvc2l0aW9uID0gcmFkYXJJdGVtLnJhZGFyUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiByYWRhclBvc2l0aW9uLFxuICAgIGNsb3NlOiB0cnVlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFJhZGFyU3R5bGUocmFkYXJJdGVtKSB7XG4gIHZhciByYWRhclN0eWxlID0gcmFkYXJJdGVtLnJhZGFyU3R5bGUsXG4gICAgICBjb2xvciA9IHJhZGFySXRlbS5jb2xvcjtcbiAgdmFyIGNvbG9yUmdiYVZhbHVlID0gKDAsIF9jb2xvci5nZXRSZ2JhVmFsdWUpKGNvbG9yKTtcbiAgY29sb3JSZ2JhVmFsdWVbM10gPSAwLjU7XG4gIHZhciByYWRhckRlZmF1bHRDb2xvciA9IHtcbiAgICBzdHJva2U6IGNvbG9yLFxuICAgIGZpbGw6ICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKGNvbG9yUmdiYVZhbHVlKVxuICB9O1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHJhZGFyRGVmYXVsdENvbG9yLCByYWRhclN0eWxlKTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlUmFkYXIoZ3JhcGgsIF9yZWY0KSB7XG4gIHZhciBzaGFwZSA9IF9yZWY0LnNoYXBlO1xuICB2YXIgZ3JhcGhQb2ludHMgPSBncmFwaC5zaGFwZS5wb2ludHM7XG4gIHZhciBncmFwaFBvaW50c051bSA9IGdyYXBoUG9pbnRzLmxlbmd0aDtcbiAgdmFyIHBvaW50c051bSA9IHNoYXBlLnBvaW50cy5sZW5ndGg7XG5cbiAgaWYgKHBvaW50c051bSA+IGdyYXBoUG9pbnRzTnVtKSB7XG4gICAgdmFyIGxhc3RQb2ludCA9IGdyYXBoUG9pbnRzLnNsaWNlKC0xKVswXTtcbiAgICB2YXIgbmV3QWRkUG9pbnRzID0gbmV3IEFycmF5KHBvaW50c051bSAtIGdyYXBoUG9pbnRzTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgICByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsYXN0UG9pbnQpO1xuICAgIH0pO1xuICAgIGdyYXBoUG9pbnRzLnB1c2guYXBwbHkoZ3JhcGhQb2ludHMsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3QWRkUG9pbnRzKSk7XG4gIH0gZWxzZSBpZiAocG9pbnRzTnVtIDwgZ3JhcGhQb2ludHNOdW0pIHtcbiAgICBncmFwaFBvaW50cy5zcGxpY2UocG9pbnRzTnVtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQb2ludENvbmZpZyhyYWRhckl0ZW0pIHtcbiAgdmFyIHJhZGFyUG9zaXRpb24gPSByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckl0ZW0uckxldmVsO1xuICByZXR1cm4gcmFkYXJQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnY2lyY2xlJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICB2aXNpYmxlOiByYWRhckl0ZW0ucG9pbnQuc2hvdyxcbiAgICAgIHNoYXBlOiBnZXRQb2ludFNoYXBlKHJhZGFySXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0UG9pbnRTdHlsZShyYWRhckl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UG9pbnRDb25maWcocmFkYXJJdGVtKSB7XG4gIHZhciBjb25maWdzID0gZ2V0UG9pbnRDb25maWcocmFkYXJJdGVtKTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICByZXR1cm4gY29uZmlnLnNoYXBlLnIgPSAwLjAxO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50U2hhcGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciByYWRhclBvc2l0aW9uID0gcmFkYXJJdGVtLnJhZGFyUG9zaXRpb24sXG4gICAgICBwb2ludCA9IHJhZGFySXRlbS5wb2ludDtcbiAgdmFyIHJhZGl1cyA9IHBvaW50LnJhZGl1cztcbiAgdmFyIHBvc2l0aW9uID0gcmFkYXJQb3NpdGlvbltpXTtcbiAgcmV0dXJuIHtcbiAgICByeDogcG9zaXRpb25bMF0sXG4gICAgcnk6IHBvc2l0aW9uWzFdLFxuICAgIHI6IHJhZGl1c1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFN0eWxlKHJhZGFySXRlbSwgaSkge1xuICB2YXIgcG9pbnQgPSByYWRhckl0ZW0ucG9pbnQsXG4gICAgICBjb2xvciA9IHJhZGFySXRlbS5jb2xvcjtcbiAgdmFyIHN0eWxlID0gcG9pbnQuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIHN0cm9rZTogY29sb3JcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbENvbmZpZyhyYWRhckl0ZW0pIHtcbiAgdmFyIGxhYmVsUG9zaXRpb24gPSByYWRhckl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckl0ZW0uckxldmVsO1xuICByZXR1cm4gbGFiZWxQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcmFkYXJJdGVtLmxhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0TGFiZWxTaGFwZShyYWRhckl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldExhYmVsU3R5bGUocmFkYXJJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlKHJhZGFySXRlbSwgaSkge1xuICB2YXIgbGFiZWxQb3NpdGlvbiA9IHJhZGFySXRlbS5sYWJlbFBvc2l0aW9uLFxuICAgICAgbGFiZWwgPSByYWRhckl0ZW0ubGFiZWwsXG4gICAgICBkYXRhID0gcmFkYXJJdGVtLmRhdGE7XG4gIHZhciBvZmZzZXQgPSBsYWJlbC5vZmZzZXQsXG4gICAgICBmb3JtYXR0ZXIgPSBsYWJlbC5mb3JtYXR0ZXI7XG4gIHZhciBwb3NpdGlvbiA9IG1lcmdlUG9pbnRPZmZzZXQobGFiZWxQb3NpdGlvbltpXSwgb2Zmc2V0KTtcbiAgdmFyIGxhYmVsVGV4dCA9IGRhdGFbaV0gPyBkYXRhW2ldLnRvU3RyaW5nKCkgOiAnMCc7XG4gIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdzdHJpbmcnKSBsYWJlbFRleHQgPSBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsIGxhYmVsVGV4dCk7XG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnZnVuY3Rpb24nKSBsYWJlbFRleHQgPSBmb3JtYXR0ZXIobGFiZWxUZXh0KTtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBsYWJlbFRleHQsXG4gICAgcG9zaXRpb246IHBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlUG9pbnRPZmZzZXQoX3JlZjUsIF9yZWY2KSB7XG4gIHZhciBfcmVmNyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNSwgMiksXG4gICAgICB4ID0gX3JlZjdbMF0sXG4gICAgICB5ID0gX3JlZjdbMV07XG5cbiAgdmFyIF9yZWY4ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY2LCAyKSxcbiAgICAgIG94ID0gX3JlZjhbMF0sXG4gICAgICBveSA9IF9yZWY4WzFdO1xuXG4gIHJldHVybiBbeCArIG94LCB5ICsgb3ldO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFN0eWxlKHJhZGFySXRlbSwgaSkge1xuICB2YXIgbGFiZWwgPSByYWRhckl0ZW0ubGFiZWwsXG4gICAgICBjb2xvciA9IHJhZGFySXRlbS5jb2xvcixcbiAgICAgIGxhYmVsQWxpZ24gPSByYWRhckl0ZW0ubGFiZWxBbGlnbjtcbiAgdmFyIHN0eWxlID0gbGFiZWwuc3R5bGU7XG5cbiAgdmFyIGRlZmF1bHRDb2xvckFuZEFsaWduID0gX29iamVjdFNwcmVhZCh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgbGFiZWxBbGlnbltpXSk7XG5cbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShkZWZhdWx0Q29sb3JBbmRBbGlnbiwgc3R5bGUpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXJBeGlzID0gcmFkYXJBeGlzO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfaW5kZXggPSByZXF1aXJlKFwiLi4vY29uZmlnL2luZGV4XCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIHJhZGFyQXhpcyhjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHJhZGFyID0gb3B0aW9uLnJhZGFyO1xuICB2YXIgcmFkYXJBeGlzID0gW107XG5cbiAgaWYgKHJhZGFyKSB7XG4gICAgcmFkYXJBeGlzID0gbWVyZ2VSYWRhckF4aXNEZWZhdWx0Q29uZmlnKHJhZGFyKTtcbiAgICByYWRhckF4aXMgPSBjYWxjUmFkYXJBeGlzQ2VudGVyKHJhZGFyQXhpcywgY2hhcnQpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNSaW5nUmFkaXVzKHJhZGFyQXhpcywgY2hhcnQpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNMaW5lUG9zaXRpb24ocmFkYXJBeGlzKTtcbiAgICByYWRhckF4aXMgPSBjYWxjUmFkYXJBeGlzQXJlYVJhZGl1cyhyYWRhckF4aXMpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNMYWJlbFBvc2l0aW9uKHJhZGFyQXhpcyk7XG4gICAgcmFkYXJBeGlzID0gW3JhZGFyQXhpc107XG4gIH1cblxuICB2YXIgcmFkYXJBeGlzRm9yVXBkYXRlID0gcmFkYXJBeGlzO1xuICBpZiAocmFkYXJBeGlzLmxlbmd0aCAmJiAhcmFkYXJBeGlzWzBdLnNob3cpIHJhZGFyQXhpc0ZvclVwZGF0ZSA9IFtdO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhckF4aXNGb3JVcGRhdGUsXG4gICAga2V5OiAncmFkYXJBeGlzU3BsaXRBcmVhJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0U3BsaXRBcmVhQ29uZmlnLFxuICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlU3BsaXRBcmVhLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlU3BsaXRBcmVhXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhckF4aXNGb3JVcGRhdGUsXG4gICAga2V5OiAncmFkYXJBeGlzU3BsaXRMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0U3BsaXRMaW5lQ29uZmlnLFxuICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlU3BsaXRMaW5lLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlU3BsaXRMaW5lXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhckF4aXNGb3JVcGRhdGUsXG4gICAga2V5OiAncmFkYXJBeGlzTGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEF4aXNMaW5lQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhckF4aXNGb3JVcGRhdGUsXG4gICAga2V5OiAncmFkYXJBeGlzTGFibGUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRBeGlzTGFiZWxDb25maWdcbiAgfSk7XG4gIGNoYXJ0LnJhZGFyQXhpcyA9IHJhZGFyQXhpc1swXTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VSYWRhckF4aXNEZWZhdWx0Q29uZmlnKHJhZGFyKSB7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoX2luZGV4LnJhZGFyQXhpc0NvbmZpZyksIHJhZGFyKTtcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyQXhpc0NlbnRlcihyYWRhckF4aXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHZhciBjZW50ZXIgPSByYWRhckF4aXMuY2VudGVyO1xuICByYWRhckF4aXMuY2VudGVyUG9zID0gY2VudGVyLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIGlmICh0eXBlb2YgdiA9PT0gJ251bWJlcicpIHJldHVybiB2O1xuICAgIHJldHVybiBwYXJzZUludCh2KSAvIDEwMCAqIGFyZWFbaV07XG4gIH0pO1xuICByZXR1cm4gcmFkYXJBeGlzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJBeGlzUmluZ1JhZGl1cyhyYWRhckF4aXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHZhciBzcGxpdE51bSA9IHJhZGFyQXhpcy5zcGxpdE51bSxcbiAgICAgIHJhZGl1cyA9IHJhZGFyQXhpcy5yYWRpdXM7XG4gIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFyZWEpKSAvIDI7XG4gIGlmICh0eXBlb2YgcmFkaXVzICE9PSAnbnVtYmVyJykgcmFkaXVzID0gcGFyc2VJbnQocmFkaXVzKSAvIDEwMCAqIG1heFJhZGl1cztcbiAgdmFyIHNwbGl0R2FwID0gcmFkaXVzIC8gc3BsaXROdW07XG4gIHJhZGFyQXhpcy5yaW5nUmFkaXVzID0gbmV3IEFycmF5KHNwbGl0TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHNwbGl0R2FwICogKGkgKyAxKTtcbiAgfSk7XG4gIHJhZGFyQXhpcy5yYWRpdXMgPSByYWRpdXM7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNMaW5lUG9zaXRpb24ocmFkYXJBeGlzKSB7XG4gIHZhciBpbmRpY2F0b3IgPSByYWRhckF4aXMuaW5kaWNhdG9yLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcyxcbiAgICAgIHJhZGl1cyA9IHJhZGFyQXhpcy5yYWRpdXMsXG4gICAgICBzdGFydEFuZ2xlID0gcmFkYXJBeGlzLnN0YXJ0QW5nbGU7XG4gIHZhciBmdWxsQW5nbGUgPSBNYXRoLlBJICogMjtcbiAgdmFyIGluZGljYXRvck51bSA9IGluZGljYXRvci5sZW5ndGg7XG4gIHZhciBpbmRpY2F0b3JHYXAgPSBmdWxsQW5nbGUgLyBpbmRpY2F0b3JOdW07XG4gIHZhciBhbmdsZXMgPSBuZXcgQXJyYXkoaW5kaWNhdG9yTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIGluZGljYXRvckdhcCAqIGkgKyBzdGFydEFuZ2xlO1xuICB9KTtcbiAgcmFkYXJBeGlzLmF4aXNMaW5lQW5nbGVzID0gYW5nbGVzO1xuICByYWRhckF4aXMuYXhpc0xpbmVQb3NpdGlvbiA9IGFuZ2xlcy5tYXAoZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyYWRpdXMsIGddKSk7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJBeGlzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJBeGlzQXJlYVJhZGl1cyhyYWRhckF4aXMpIHtcbiAgdmFyIHJpbmdSYWRpdXMgPSByYWRhckF4aXMucmluZ1JhZGl1cztcbiAgdmFyIHN1YlJhZGl1cyA9IHJpbmdSYWRpdXNbMF0gLyAyO1xuICByYWRhckF4aXMuYXJlYVJhZGl1cyA9IHJpbmdSYWRpdXMubWFwKGZ1bmN0aW9uIChyKSB7XG4gICAgcmV0dXJuIHIgLSBzdWJSYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJBeGlzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJBeGlzTGFiZWxQb3NpdGlvbihyYWRhckF4aXMpIHtcbiAgdmFyIGF4aXNMaW5lQW5nbGVzID0gcmFkYXJBeGlzLmF4aXNMaW5lQW5nbGVzLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcyxcbiAgICAgIHJhZGl1cyA9IHJhZGFyQXhpcy5yYWRpdXMsXG4gICAgICBheGlzTGFiZWwgPSByYWRhckF4aXMuYXhpc0xhYmVsO1xuICByYWRpdXMgKz0gYXhpc0xhYmVsLmxhYmVsR2FwO1xuICByYWRhckF4aXMuYXhpc0xhYmVsUG9zaXRpb24gPSBheGlzTGluZUFuZ2xlcy5tYXAoZnVuY3Rpb24gKGFuZ2xlKSB7XG4gICAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbcmFkaXVzLCBhbmdsZV0pKTtcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0QXJlYUNvbmZpZyhyYWRhckF4aXMpIHtcbiAgdmFyIGFyZWFSYWRpdXMgPSByYWRhckF4aXMuYXJlYVJhZGl1cyxcbiAgICAgIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJBeGlzLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckF4aXMuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckF4aXMuckxldmVsO1xuICB2YXIgbmFtZSA9IHBvbHlnb24gPyAncmVnUG9seWdvbicgOiAncmluZyc7XG4gIHJldHVybiBhcmVhUmFkaXVzLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcmFkYXJBeGlzLnNwbGl0QXJlYS5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldFNwbGl0QXJlYVNoYXBlKHJhZGFyQXhpcywgaSksXG4gICAgICBzdHlsZTogZ2V0U3BsaXRBcmVhU3R5bGUocmFkYXJBeGlzLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdEFyZWFTaGFwZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbixcbiAgICAgIGFyZWFSYWRpdXMgPSByYWRhckF4aXMuYXJlYVJhZGl1cyxcbiAgICAgIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3IsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zO1xuICB2YXIgaW5kaWNhdG9yTnVtID0gaW5kaWNhdG9yLmxlbmd0aDtcbiAgdmFyIHNoYXBlID0ge1xuICAgIHJ4OiBjZW50ZXJQb3NbMF0sXG4gICAgcnk6IGNlbnRlclBvc1sxXSxcbiAgICByOiBhcmVhUmFkaXVzW2ldXG4gIH07XG4gIGlmIChwb2x5Z29uKSBzaGFwZS5zaWRlID0gaW5kaWNhdG9yTnVtO1xuICByZXR1cm4gc2hhcGU7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0QXJlYVN0eWxlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgc3BsaXRBcmVhID0gcmFkYXJBeGlzLnNwbGl0QXJlYSxcbiAgICAgIHJpbmdSYWRpdXMgPSByYWRhckF4aXMucmluZ1JhZGl1cyxcbiAgICAgIGF4aXNMaW5lQW5nbGVzID0gcmFkYXJBeGlzLmF4aXNMaW5lQW5nbGVzLFxuICAgICAgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcztcbiAgdmFyIGNvbG9yID0gc3BsaXRBcmVhLmNvbG9yLFxuICAgICAgc3R5bGUgPSBzcGxpdEFyZWEuc3R5bGU7XG4gIHN0eWxlID0gX29iamVjdFNwcmVhZCh7XG4gICAgZmlsbDogJ3JnYmEoMCwgMCwgMCwgMCknXG4gIH0sIHN0eWxlKTtcbiAgdmFyIGxpbmVXaWR0aCA9IHJpbmdSYWRpdXNbMF0gLSAwO1xuXG4gIGlmIChwb2x5Z29uKSB7XG4gICAgdmFyIHBvaW50MSA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbcmluZ1JhZGl1c1swXSwgYXhpc0xpbmVBbmdsZXNbMF1dKSk7XG5cbiAgICB2YXIgcG9pbnQyID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyaW5nUmFkaXVzWzBdLCBheGlzTGluZUFuZ2xlc1sxXV0pKTtcblxuICAgIGxpbmVXaWR0aCA9ICgwLCBfdXRpbDIuZ2V0UG9pbnRUb0xpbmVEaXN0YW5jZSkoY2VudGVyUG9zLCBwb2ludDEsIHBvaW50Mik7XG4gIH1cblxuICBzdHlsZSA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShzdHlsZSwgdHJ1ZSksIHtcbiAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aFxuICB9KTtcbiAgaWYgKCFjb2xvci5sZW5ndGgpIHJldHVybiBzdHlsZTtcbiAgdmFyIGNvbG9yTnVtID0gY29sb3IubGVuZ3RoO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHN0eWxlLCB7XG4gICAgc3Ryb2tlOiBjb2xvcltpICUgY29sb3JOdW1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVVcGRhdGVTcGxpdEFyZWEoZ3JhcGhzLCByYWRhckF4aXMsIGksIHVwZGF0ZXIpIHtcbiAgdmFyIGNhY2hlID0gZ3JhcGhzW2ldO1xuICBpZiAoIWNhY2hlKSByZXR1cm47XG4gIHZhciByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcjtcbiAgdmFyIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbjtcbiAgdmFyIG5hbWUgPSBjYWNoZVswXS5uYW1lO1xuICB2YXIgY3VycmVudE5hbWUgPSBwb2x5Z29uID8gJ3JlZ1BvbHlnb24nIDogJ3JpbmcnO1xuICB2YXIgZGVsQWxsID0gY3VycmVudE5hbWUgIT09IG5hbWU7XG4gIGlmICghZGVsQWxsKSByZXR1cm47XG4gIGNhY2hlLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICB9KTtcbiAgZ3JhcGhzW2ldID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlU3BsaXRBcmVhKGdyYXBoLCBjb25maWcpIHtcbiAgdmFyIHNpZGUgPSBjb25maWcuc2hhcGUuc2lkZTtcbiAgaWYgKHR5cGVvZiBzaWRlICE9PSAnbnVtYmVyJykgcmV0dXJuO1xuICBncmFwaC5zaGFwZS5zaWRlID0gc2lkZTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lQ29uZmlnKHJhZGFyQXhpcykge1xuICB2YXIgcmluZ1JhZGl1cyA9IHJhZGFyQXhpcy5yaW5nUmFkaXVzLFxuICAgICAgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckF4aXMuYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFyQXhpcy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFyQXhpcy5yTGV2ZWw7XG4gIHZhciBuYW1lID0gcG9seWdvbiA/ICdyZWdQb2x5Z29uJyA6ICdyaW5nJztcbiAgcmV0dXJuIHJpbmdSYWRpdXMubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICB2aXNpYmxlOiByYWRhckF4aXMuc3BsaXRMaW5lLnNob3csXG4gICAgICBzaGFwZTogZ2V0U3BsaXRMaW5lU2hhcGUocmFkYXJBeGlzLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRTcGxpdExpbmVTdHlsZShyYWRhckF4aXMsIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZVNoYXBlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgcmluZ1JhZGl1cyA9IHJhZGFyQXhpcy5yaW5nUmFkaXVzLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcyxcbiAgICAgIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3IsXG4gICAgICBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb247XG4gIHZhciBzaGFwZSA9IHtcbiAgICByeDogY2VudGVyUG9zWzBdLFxuICAgIHJ5OiBjZW50ZXJQb3NbMV0sXG4gICAgcjogcmluZ1JhZGl1c1tpXVxuICB9O1xuICB2YXIgaW5kaWNhdG9yTnVtID0gaW5kaWNhdG9yLmxlbmd0aDtcbiAgaWYgKHBvbHlnb24pIHNoYXBlLnNpZGUgPSBpbmRpY2F0b3JOdW07XG4gIHJldHVybiBzaGFwZTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lU3R5bGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBzcGxpdExpbmUgPSByYWRhckF4aXMuc3BsaXRMaW5lO1xuICB2YXIgY29sb3IgPSBzcGxpdExpbmUuY29sb3IsXG4gICAgICBzdHlsZSA9IHNwbGl0TGluZS5zdHlsZTtcbiAgc3R5bGUgPSBfb2JqZWN0U3ByZWFkKHtcbiAgICBmaWxsOiAncmdiYSgwLCAwLCAwLCAwKSdcbiAgfSwgc3R5bGUpO1xuICBpZiAoIWNvbG9yLmxlbmd0aCkgcmV0dXJuIHN0eWxlO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoc3R5bGUsIHtcbiAgICBzdHJva2U6IGNvbG9yW2kgJSBjb2xvck51bV1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZVNwbGl0TGluZShncmFwaHMsIHJhZGFyQXhpcywgaSwgdXBkYXRlcikge1xuICB2YXIgY2FjaGUgPSBncmFwaHNbaV07XG4gIGlmICghY2FjaGUpIHJldHVybjtcbiAgdmFyIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uO1xuICB2YXIgbmFtZSA9IGNhY2hlWzBdLm5hbWU7XG4gIHZhciBjdXJyZW5OYW1lID0gcG9seWdvbiA/ICdyZWdQb2x5Z29uJyA6ICdyaW5nJztcbiAgdmFyIGRlbEFsbCA9IGN1cnJlbk5hbWUgIT09IG5hbWU7XG4gIGlmICghZGVsQWxsKSByZXR1cm47XG4gIGNhY2hlLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICB9KTtcbiAgZ3JhcGhzW2ldID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlU3BsaXRMaW5lKGdyYXBoLCBjb25maWcpIHtcbiAgdmFyIHNpZGUgPSBjb25maWcuc2hhcGUuc2lkZTtcbiAgaWYgKHR5cGVvZiBzaWRlICE9PSAnbnVtYmVyJykgcmV0dXJuO1xuICBncmFwaC5zaGFwZS5zaWRlID0gc2lkZTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xpbmVDb25maWcocmFkYXJBeGlzKSB7XG4gIHZhciBheGlzTGluZVBvc2l0aW9uID0gcmFkYXJBeGlzLmF4aXNMaW5lUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFyQXhpcy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJBeGlzLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJBeGlzLnJMZXZlbDtcbiAgcmV0dXJuIGF4aXNMaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiByYWRhckF4aXMuYXhpc0xpbmUuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRBeGlzTGluZVNoYXBlKHJhZGFyQXhpcywgaSksXG4gICAgICBzdHlsZTogZ2V0QXhpc0xpbmVTdHlsZShyYWRhckF4aXMsIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMaW5lU2hhcGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgYXhpc0xpbmVQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGluZVBvc2l0aW9uO1xuICB2YXIgcG9pbnRzID0gW2NlbnRlclBvcywgYXhpc0xpbmVQb3NpdGlvbltpXV07XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBwb2ludHNcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xpbmVTdHlsZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIGF4aXNMaW5lID0gcmFkYXJBeGlzLmF4aXNMaW5lO1xuICB2YXIgY29sb3IgPSBheGlzTGluZS5jb2xvcixcbiAgICAgIHN0eWxlID0gYXhpc0xpbmUuc3R5bGU7XG4gIGlmICghY29sb3IubGVuZ3RoKSByZXR1cm4gc3R5bGU7XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShzdHlsZSwge1xuICAgIHN0cm9rZTogY29sb3JbaSAlIGNvbG9yTnVtXVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmVsQ29uZmlnKHJhZGFyQXhpcykge1xuICB2YXIgYXhpc0xhYmVsUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xhYmVsUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFyQXhpcy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJBeGlzLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJBeGlzLnJMZXZlbDtcbiAgcmV0dXJuIGF4aXNMYWJlbFBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiByYWRhckF4aXMuYXhpc0xhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0QXhpc0xhYmxlU2hhcGUocmFkYXJBeGlzLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRBeGlzTGFibGVTdHlsZShyYWRhckF4aXMsIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJsZVNoYXBlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgYXhpc0xhYmVsUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xhYmVsUG9zaXRpb24sXG4gICAgICBpbmRpY2F0b3IgPSByYWRhckF4aXMuaW5kaWNhdG9yO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGluZGljYXRvcltpXS5uYW1lLFxuICAgIHBvc2l0aW9uOiBheGlzTGFiZWxQb3NpdGlvbltpXVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFibGVTdHlsZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIGF4aXNMYWJlbCA9IHJhZGFyQXhpcy5heGlzTGFiZWwsXG4gICAgICBfcmFkYXJBeGlzJGNlbnRlclBvcyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShyYWRhckF4aXMuY2VudGVyUG9zLCAyKSxcbiAgICAgIHggPSBfcmFkYXJBeGlzJGNlbnRlclBvc1swXSxcbiAgICAgIHkgPSBfcmFkYXJBeGlzJGNlbnRlclBvc1sxXSxcbiAgICAgIGF4aXNMYWJlbFBvc2l0aW9uID0gcmFkYXJBeGlzLmF4aXNMYWJlbFBvc2l0aW9uO1xuXG4gIHZhciBjb2xvciA9IGF4aXNMYWJlbC5jb2xvcixcbiAgICAgIHN0eWxlID0gYXhpc0xhYmVsLnN0eWxlO1xuXG4gIHZhciBfYXhpc0xhYmVsUG9zaXRpb24kaSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShheGlzTGFiZWxQb3NpdGlvbltpXSwgMiksXG4gICAgICBsYWJlbFhwb3MgPSBfYXhpc0xhYmVsUG9zaXRpb24kaVswXSxcbiAgICAgIGxhYmVsWVBvcyA9IF9heGlzTGFiZWxQb3NpdGlvbiRpWzFdO1xuXG4gIHZhciB0ZXh0QWxpZ24gPSBsYWJlbFhwb3MgPiB4ID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgdmFyIHRleHRCYXNlbGluZSA9IGxhYmVsWVBvcyA+IHkgPyAndG9wJyA6ICdib3R0b20nO1xuICBzdHlsZSA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgdGV4dEFsaWduOiB0ZXh0QWxpZ24sXG4gICAgdGV4dEJhc2VsaW5lOiB0ZXh0QmFzZWxpbmVcbiAgfSwgc3R5bGUpO1xuICBpZiAoIWNvbG9yLmxlbmd0aCkgcmV0dXJuIHN0eWxlO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoc3R5bGUsIHtcbiAgICBmaWxsOiBjb2xvcltpICUgY29sb3JOdW1dXG4gIH0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGl0bGUgPSB0aXRsZTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiB0aXRsZShjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHRpdGxlID0gW107XG5cbiAgaWYgKG9wdGlvbi50aXRsZSkge1xuICAgIHRpdGxlWzBdID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKF9jb25maWcudGl0bGVDb25maWcsIHRydWUpLCBvcHRpb24udGl0bGUpO1xuICB9XG5cbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogdGl0bGUsXG4gICAga2V5OiAndGl0bGUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRUaXRsZUNvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VGl0bGVDb25maWcodGl0bGVJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IF9jb25maWcudGl0bGVDb25maWcuYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IF9jb25maWcudGl0bGVDb25maWcuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBfY29uZmlnLnRpdGxlQ29uZmlnLnJMZXZlbDtcbiAgdmFyIHNoYXBlID0gZ2V0VGl0bGVTaGFwZSh0aXRsZUl0ZW0sIHVwZGF0ZXIpO1xuICB2YXIgc3R5bGUgPSBnZXRUaXRsZVN0eWxlKHRpdGxlSXRlbSk7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICd0ZXh0JyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIHZpc2libGU6IHRpdGxlSXRlbS5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IHNoYXBlLFxuICAgIHN0eWxlOiBzdHlsZVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0VGl0bGVTaGFwZSh0aXRsZUl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIG9mZnNldCA9IHRpdGxlSXRlbS5vZmZzZXQsXG4gICAgICB0ZXh0ID0gdGl0bGVJdGVtLnRleHQ7XG4gIHZhciBfdXBkYXRlciRjaGFydCRncmlkQXIgPSB1cGRhdGVyLmNoYXJ0LmdyaWRBcmVhLFxuICAgICAgeCA9IF91cGRhdGVyJGNoYXJ0JGdyaWRBci54LFxuICAgICAgeSA9IF91cGRhdGVyJGNoYXJ0JGdyaWRBci55LFxuICAgICAgdyA9IF91cGRhdGVyJGNoYXJ0JGdyaWRBci53O1xuXG4gIHZhciBfb2Zmc2V0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKG9mZnNldCwgMiksXG4gICAgICBveCA9IF9vZmZzZXRbMF0sXG4gICAgICBveSA9IF9vZmZzZXRbMV07XG5cbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiB0ZXh0LFxuICAgIHBvc2l0aW9uOiBbeCArIHcgLyAyICsgb3gsIHkgKyBveV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0VGl0bGVTdHlsZSh0aXRsZUl0ZW0pIHtcbiAgdmFyIHN0eWxlID0gdGl0bGVJdGVtLnN0eWxlO1xuICByZXR1cm4gc3R5bGU7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2NSZW5kZXIgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlclwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIik7XG5cbnZhciBfaW5kZXggPSByZXF1aXJlKFwiLi4vdXRpbC9pbmRleFwiKTtcblxudmFyIHBpZSA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICBpcjogMCxcbiAgICBvcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGNsb2NrV2lzZTogdHJ1ZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZi5zaGFwZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAnaXInLCAnb3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdQaWUgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMiwgX3JlZjMpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjIuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgaXIgPSBzaGFwZS5pcixcbiAgICAgICAgb3IgPSBzaGFwZS5vcixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICByeCA9IHBhcnNlSW50KHJ4KSArIDAuNTtcbiAgICByeSA9IHBhcnNlSW50KHJ5KSArIDAuNTtcbiAgICBjdHguYXJjKHJ4LCByeSwgaXIgPiAwID8gaXIgOiAwLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgIWNsb2NrV2lzZSk7XG4gICAgdmFyIGNvbm5lY3RQb2ludDEgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgb3IsIGVuZEFuZ2xlKS5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwKSArIDAuNTtcbiAgICB9KTtcbiAgICB2YXIgY29ubmVjdFBvaW50MiA9ICgwLCBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludCkocngsIHJ5LCBpciwgc3RhcnRBbmdsZSkubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocCkgKyAwLjU7XG4gICAgfSk7XG4gICAgY3R4LmxpbmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY29ubmVjdFBvaW50MSkpO1xuICAgIGN0eC5hcmMocngsIHJ5LCBvciA+IDAgPyBvciA6IDAsIGVuZEFuZ2xlLCBzdGFydEFuZ2xlLCBjbG9ja1dpc2UpO1xuICAgIGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNvbm5lY3RQb2ludDIpKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH1cbn07XG52YXIgYWdBcmMgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGdyYWRpZW50U3RhcnRBbmdsZTogbnVsbCxcbiAgICBncmFkaWVudEVuZEFuZ2xlOiBudWxsXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBZ0FyYyBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY1LCBfcmVmNikge1xuICAgIHZhciBjdHggPSBfcmVmNS5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjYuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjYuc3R5bGU7XG4gICAgdmFyIGdyYWRpZW50ID0gc3R5bGUuZ3JhZGllbnQ7XG4gICAgZ3JhZGllbnQgPSBncmFkaWVudC5tYXAoZnVuY3Rpb24gKGN2KSB7XG4gICAgICByZXR1cm4gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoY3YpO1xuICAgIH0pO1xuXG4gICAgaWYgKGdyYWRpZW50Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgZ3JhZGllbnQgPSBbZ3JhZGllbnRbMF0sIGdyYWRpZW50WzBdXTtcbiAgICB9XG5cbiAgICB2YXIgZ3JhZGllbnRBcmNOdW0gPSBncmFkaWVudC5sZW5ndGggLSAxO1xuICAgIHZhciBncmFkaWVudFN0YXJ0QW5nbGUgPSBzaGFwZS5ncmFkaWVudFN0YXJ0QW5nbGUsXG4gICAgICAgIGdyYWRpZW50RW5kQW5nbGUgPSBzaGFwZS5ncmFkaWVudEVuZEFuZ2xlLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgaWYgKGdyYWRpZW50U3RhcnRBbmdsZSA9PT0gbnVsbCkgZ3JhZGllbnRTdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICBpZiAoZ3JhZGllbnRFbmRBbmdsZSA9PT0gbnVsbCkgZ3JhZGllbnRFbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgIHZhciBhbmdsZUdhcCA9IChncmFkaWVudEVuZEFuZ2xlIC0gZ3JhZGllbnRTdGFydEFuZ2xlKSAvIGdyYWRpZW50QXJjTnVtO1xuICAgIGlmIChhbmdsZUdhcCA9PT0gTWF0aC5QSSAqIDIpIGFuZ2xlR2FwID0gTWF0aC5QSSAqIDIgLSAwLjAwMTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JhZGllbnRBcmNOdW07IGkrKykge1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdmFyIHN0YXJ0UG9pbnQgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgciwgc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogaSk7XG4gICAgICB2YXIgZW5kUG9pbnQgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgciwgc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogKGkgKyAxKSk7XG4gICAgICB2YXIgY29sb3IgPSAoMCwgX2luZGV4LmdldExpbmVhckdyYWRpZW50Q29sb3IpKGN0eCwgc3RhcnRQb2ludCwgZW5kUG9pbnQsIFtncmFkaWVudFtpXSwgZ3JhZGllbnRbaSArIDFdXSk7XG4gICAgICB2YXIgYXJjU3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBhbmdsZUdhcCAqIGk7XG4gICAgICB2YXIgYXJjRW5kQW5nbGUgPSBzdGFydEFuZ2xlICsgYW5nbGVHYXAgKiAoaSArIDEpO1xuICAgICAgdmFyIGRvQnJlYWsgPSBmYWxzZTtcblxuICAgICAgaWYgKGFyY0VuZEFuZ2xlID4gZW5kQW5nbGUpIHtcbiAgICAgICAgYXJjRW5kQW5nbGUgPSBlbmRBbmdsZTtcbiAgICAgICAgZG9CcmVhayA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGN0eC5hcmMocngsIHJ5LCByLCBhcmNTdGFydEFuZ2xlLCBhcmNFbmRBbmdsZSk7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgIGlmIChkb0JyZWFrKSBicmVhaztcbiAgICB9XG4gIH1cbn07XG52YXIgbnVtYmVyVGV4dCA9IHtcbiAgc2hhcGU6IHtcbiAgICBudW1iZXI6IFtdLFxuICAgIGNvbnRlbnQ6ICcnLFxuICAgIHBvc2l0aW9uOiBbMCwgMF0sXG4gICAgdG9GaXhlZDogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNykge1xuICAgIHZhciBzaGFwZSA9IF9yZWY3LnNoYXBlO1xuICAgIHZhciBudW1iZXIgPSBzaGFwZS5udW1iZXIsXG4gICAgICAgIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uO1xuXG4gICAgaWYgKCEobnVtYmVyIGluc3RhbmNlb2YgQXJyYXkpIHx8IHR5cGVvZiBjb250ZW50ICE9PSAnc3RyaW5nJyB8fCAhKHBvc2l0aW9uIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdOdW1iZXJUZXh0IHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjgsIF9yZWY5KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY4LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmOS5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIG51bWJlciA9IHNoYXBlLm51bWJlcixcbiAgICAgICAgY29udGVudCA9IHNoYXBlLmNvbnRlbnQsXG4gICAgICAgIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb24sXG4gICAgICAgIHRvRml4ZWQgPSBzaGFwZS50b0ZpeGVkO1xuICAgIHZhciB0ZXh0U2VnbWVudHMgPSBjb250ZW50LnNwbGl0KCd7bnR9Jyk7XG4gICAgdmFyIGxhc3RTZWdtZW50SW5kZXggPSB0ZXh0U2VnbWVudHMubGVuZ3RoIC0gMTtcbiAgICB2YXIgdGV4dFN0cmluZyA9ICcnO1xuICAgIHRleHRTZWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgICB2YXIgY3VycmVudE51bWJlciA9IG51bWJlcltpXTtcbiAgICAgIGlmIChpID09PSBsYXN0U2VnbWVudEluZGV4KSBjdXJyZW50TnVtYmVyID0gJyc7XG4gICAgICBpZiAodHlwZW9mIGN1cnJlbnROdW1iZXIgPT09ICdudW1iZXInKSBjdXJyZW50TnVtYmVyID0gY3VycmVudE51bWJlci50b0ZpeGVkKHRvRml4ZWQpO1xuICAgICAgdGV4dFN0cmluZyArPSB0ICsgKGN1cnJlbnROdW1iZXIgfHwgJycpO1xuICAgIH0pO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlVGV4dC5hcHBseShjdHgsIFt0ZXh0U3RyaW5nXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3NpdGlvbikpKTtcbiAgICBjdHguZmlsbFRleHQuYXBwbHkoY3R4LCBbdGV4dFN0cmluZ10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb24pKSk7XG4gIH1cbn07XG52YXIgbGluZUljb24gPSB7XG4gIHNoYXBlOiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHc6IDAsXG4gICAgaDogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMTApIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTAuc2hhcGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuXG4gICAgaWYgKHR5cGVvZiB4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHcgIT09ICdudW1iZXInIHx8IHR5cGVvZiBoICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignbGluZUljb24gc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMTEsIF9yZWYxMikge1xuICAgIHZhciBjdHggPSBfcmVmMTEuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMi5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHZhciBoYWxmSCA9IGggLyAyO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGU7XG4gICAgY3R4Lm1vdmVUbyh4LCB5ICsgaGFsZkgpO1xuICAgIGN0eC5saW5lVG8oeCArIHcsIHkgKyBoYWxmSCk7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcmFkaXVzID0gaGFsZkggLSA1ICogMjtcbiAgICBpZiAocmFkaXVzIDw9IDApIHJhZGl1cyA9IDM7XG4gICAgY3R4LmFyYyh4ICsgdyAvIDIsIHkgKyBoYWxmSCwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDU7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnI2ZmZic7XG4gICAgY3R4LmZpbGwoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjEzKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEzLnNoYXBlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUmVjdCkocG9zaXRpb24sIHgsIHksIHcsIGgpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjE0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE0LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYxNC5zdHlsZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbeCArIHcgLyAyLCB5ICsgaCAvIDJdO1xuICB9XG59O1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgncGllJywgcGllKTtcbigwLCBfY1JlbmRlci5leHRlbmROZXdHcmFwaCkoJ2FnQXJjJywgYWdBcmMpO1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgnbnVtYmVyVGV4dCcsIG51bWJlclRleHQpO1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgnbGluZUljb24nLCBsaW5lSWNvbik7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiY2hhbmdlRGVmYXVsdENvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfY29uZmlnLmNoYW5nZURlZmF1bHRDb25maWc7XG4gIH1cbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfY2hhcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jbGFzcy9jaGFydHMuY2xhc3NcIikpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKTtcblxudmFyIF9kZWZhdWx0ID0gX2NoYXJ0c1tcImRlZmF1bHRcIl07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZmlsdGVyTm9uTnVtYmVyID0gZmlsdGVyTm9uTnVtYmVyO1xuZXhwb3J0cy5kZWVwTWVyZ2UgPSBkZWVwTWVyZ2U7XG5leHBvcnRzLm11bEFkZCA9IG11bEFkZDtcbmV4cG9ydHMubWVyZ2VTYW1lU3RhY2tEYXRhID0gbWVyZ2VTYW1lU3RhY2tEYXRhO1xuZXhwb3J0cy5nZXRUd29Qb2ludERpc3RhbmNlID0gZ2V0VHdvUG9pbnREaXN0YW5jZTtcbmV4cG9ydHMuZ2V0TGluZWFyR3JhZGllbnRDb2xvciA9IGdldExpbmVhckdyYWRpZW50Q29sb3I7XG5leHBvcnRzLmdldFBvbHlsaW5lTGVuZ3RoID0gZ2V0UG9seWxpbmVMZW5ndGg7XG5leHBvcnRzLmdldFBvaW50VG9MaW5lRGlzdGFuY2UgPSBnZXRQb2ludFRvTGluZURpc3RhbmNlO1xuZXhwb3J0cy5pbml0TmVlZFNlcmllcyA9IGluaXROZWVkU2VyaWVzO1xuZXhwb3J0cy5yYWRpYW5Ub0FuZ2xlID0gcmFkaWFuVG9BbmdsZTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbmZ1bmN0aW9uIGZpbHRlck5vbk51bWJlcihhcnJheSkge1xuICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBuID09PSAnbnVtYmVyJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRlZXBNZXJnZSh0YXJnZXQsIG1lcmdlZCkge1xuICBmb3IgKHZhciBrZXkgaW4gbWVyZ2VkKSB7XG4gICAgdGFyZ2V0W2tleV0gPSB0YXJnZXRba2V5XSAmJiAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKSh0YXJnZXRba2V5XSkgPT09ICdvYmplY3QnID8gZGVlcE1lcmdlKHRhcmdldFtrZXldLCBtZXJnZWRba2V5XSkgOiB0YXJnZXRba2V5XSA9IG1lcmdlZFtrZXldO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gbXVsQWRkKG51bXMpIHtcbiAgbnVtcyA9IGZpbHRlck5vbk51bWJlcihudW1zKTtcbiAgcmV0dXJuIG51bXMucmVkdWNlKGZ1bmN0aW9uIChhbGwsIG51bSkge1xuICAgIHJldHVybiBhbGwgKyBudW07XG4gIH0sIDApO1xufVxuXG5mdW5jdGlvbiBtZXJnZVNhbWVTdGFja0RhdGEoaXRlbSwgc2VyaWVzKSB7XG4gIHZhciBzdGFjayA9IGl0ZW0uc3RhY2s7XG4gIGlmICghc3RhY2spIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGl0ZW0uZGF0YSk7XG4gIHZhciBzdGFja3MgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIHMgPSBfcmVmLnN0YWNrO1xuICAgIHJldHVybiBzID09PSBzdGFjaztcbiAgfSk7XG4gIHZhciBpbmRleCA9IHN0YWNrcy5maW5kSW5kZXgoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIGQgPSBfcmVmMi5kYXRhO1xuICAgIHJldHVybiBkID09PSBpdGVtLmRhdGE7XG4gIH0pO1xuICB2YXIgZGF0YXMgPSBzdGFja3Muc3BsaWNlKDAsIGluZGV4ICsgMSkubWFwKGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciBkYXRhID0gX3JlZjMuZGF0YTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSk7XG4gIHZhciBkYXRhTGVuZ3RoID0gZGF0YXNbMF0ubGVuZ3RoO1xuICByZXR1cm4gbmV3IEFycmF5KGRhdGFMZW5ndGgpLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gbXVsQWRkKGRhdGFzLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGRbaV07XG4gICAgfSkpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludE9uZSwgcG9pbnRUd28pIHtcbiAgdmFyIG1pbnVzWCA9IE1hdGguYWJzKHBvaW50T25lWzBdIC0gcG9pbnRUd29bMF0pO1xuICB2YXIgbWludXNZID0gTWF0aC5hYnMocG9pbnRPbmVbMV0gLSBwb2ludFR3b1sxXSk7XG4gIHJldHVybiBNYXRoLnNxcnQobWludXNYICogbWludXNYICsgbWludXNZICogbWludXNZKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZWFyR3JhZGllbnRDb2xvcihjdHgsIGJlZ2luLCBlbmQsIGNvbG9yKSB7XG4gIGlmICghY3R4IHx8ICFiZWdpbiB8fCAhZW5kIHx8ICFjb2xvci5sZW5ndGgpIHJldHVybjtcbiAgdmFyIGNvbG9ycyA9IGNvbG9yO1xuICB0eXBlb2YgY29sb3JzID09PSAnc3RyaW5nJyAmJiAoY29sb3JzID0gW2NvbG9yLCBjb2xvcl0pO1xuICB2YXIgbGluZWFyR3JhZGllbnRDb2xvciA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudC5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYmVnaW4pLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGVuZCkpKTtcbiAgdmFyIGNvbG9yR2FwID0gMSAvIChjb2xvcnMubGVuZ3RoIC0gMSk7XG4gIGNvbG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpKSB7XG4gICAgcmV0dXJuIGxpbmVhckdyYWRpZW50Q29sb3IuYWRkQ29sb3JTdG9wKGNvbG9yR2FwICogaSwgYyk7XG4gIH0pO1xuICByZXR1cm4gbGluZWFyR3JhZGllbnRDb2xvcjtcbn1cblxuZnVuY3Rpb24gZ2V0UG9seWxpbmVMZW5ndGgocG9pbnRzKSB7XG4gIHZhciBsaW5lU2VnbWVudHMgPSBuZXcgQXJyYXkocG9pbnRzLmxlbmd0aCAtIDEpLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gW3BvaW50c1tpXSwgcG9pbnRzW2kgKyAxXV07XG4gIH0pO1xuICB2YXIgbGVuZ3RocyA9IGxpbmVTZWdtZW50cy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gZ2V0VHdvUG9pbnREaXN0YW5jZS5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbSkpO1xuICB9KTtcbiAgcmV0dXJuIG11bEFkZChsZW5ndGhzKTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRUb0xpbmVEaXN0YW5jZShwb2ludCwgbGluZVBvaW50T25lLCBsaW5lUG9pbnRUd28pIHtcbiAgdmFyIGEgPSBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50LCBsaW5lUG9pbnRPbmUpO1xuICB2YXIgYiA9IGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnQsIGxpbmVQb2ludFR3byk7XG4gIHZhciBjID0gZ2V0VHdvUG9pbnREaXN0YW5jZShsaW5lUG9pbnRPbmUsIGxpbmVQb2ludFR3byk7XG4gIHJldHVybiAwLjUgKiBNYXRoLnNxcnQoKGEgKyBiICsgYykgKiAoYSArIGIgLSBjKSAqIChhICsgYyAtIGIpICogKGIgKyBjIC0gYSkpIC8gYztcbn1cblxuZnVuY3Rpb24gaW5pdE5lZWRTZXJpZXMoc2VyaWVzLCBjb25maWcsIHR5cGUpIHtcbiAgc2VyaWVzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjQpIHtcbiAgICB2YXIgc3QgPSBfcmVmNC50eXBlO1xuICAgIHJldHVybiBzdCA9PT0gdHlwZTtcbiAgfSk7XG4gIHNlcmllcyA9IHNlcmllcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gZGVlcE1lcmdlKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNvbmZpZywgdHJ1ZSksIGl0ZW0pO1xuICB9KTtcbiAgcmV0dXJuIHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgdmFyIHNob3cgPSBfcmVmNS5zaG93O1xuICAgIHJldHVybiBzaG93O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmFkaWFuVG9BbmdsZShyYWRpYW4pIHtcbiAgcmV0dXJuIHJhZGlhbiAvIE1hdGguUEkgKiAxODA7XG59IiwiZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcnJheVdpdGhIb2xlczsiLCJmdW5jdGlvbiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgYXJyMltpXSA9IGFycltpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyMjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hcnJheVdpdGhvdXRIb2xlczsiLCJmdW5jdGlvbiBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIGtleSwgYXJnKSB7XG4gIHRyeSB7XG4gICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVqZWN0KGVycm9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaW5mby5kb25lKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKF9uZXh0LCBfdGhyb3cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIF9uZXh0KHZhbHVlKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJuZXh0XCIsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX3Rocm93KGVycikge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwidGhyb3dcIiwgZXJyKTtcbiAgICAgIH1cblxuICAgICAgX25leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXN5bmNUb0dlbmVyYXRvcjsiLCJmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jbGFzc0NhbGxDaGVjazsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZGVmaW5lUHJvcGVydHk7IiwiZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdDsiLCJmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5KGl0ZXIpIHtcbiAgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoaXRlcikgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZXIpID09PSBcIltvYmplY3QgQXJndW1lbnRzXVwiKSByZXR1cm4gQXJyYXkuZnJvbShpdGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXRlcmFibGVUb0FycmF5OyIsImZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHtcbiAgdmFyIF9hcnIgPSBbXTtcbiAgdmFyIF9uID0gdHJ1ZTtcbiAgdmFyIF9kID0gZmFsc2U7XG4gIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICB0cnkge1xuICAgIGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kID0gdHJ1ZTtcbiAgICBfZSA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBfYXJyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pdGVyYWJsZVRvQXJyYXlMaW1pdDsiLCJmdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfbm9uSXRlcmFibGVSZXN0OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVNwcmVhZCgpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVNwcmVhZDsiLCJ2YXIgYXJyYXlXaXRoSG9sZXMgPSByZXF1aXJlKFwiLi9hcnJheVdpdGhIb2xlc1wiKTtcblxudmFyIGl0ZXJhYmxlVG9BcnJheUxpbWl0ID0gcmVxdWlyZShcIi4vaXRlcmFibGVUb0FycmF5TGltaXRcIik7XG5cbnZhciBub25JdGVyYWJsZVJlc3QgPSByZXF1aXJlKFwiLi9ub25JdGVyYWJsZVJlc3RcIik7XG5cbmZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkge1xuICByZXR1cm4gYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBpdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IG5vbkl0ZXJhYmxlUmVzdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9zbGljZWRUb0FycmF5OyIsInZhciBhcnJheVdpdGhvdXRIb2xlcyA9IHJlcXVpcmUoXCIuL2FycmF5V2l0aG91dEhvbGVzXCIpO1xuXG52YXIgaXRlcmFibGVUb0FycmF5ID0gcmVxdWlyZShcIi4vaXRlcmFibGVUb0FycmF5XCIpO1xuXG52YXIgbm9uSXRlcmFibGVTcHJlYWQgPSByZXF1aXJlKFwiLi9ub25JdGVyYWJsZVNwcmVhZFwiKTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikge1xuICByZXR1cm4gYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBpdGVyYWJsZVRvQXJyYXkoYXJyKSB8fCBub25JdGVyYWJsZVNwcmVhZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF90b0NvbnN1bWFibGVBcnJheTsiLCJmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YyID0gZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mMiA9IGZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZjIob2JqKTsgfVxuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIF90eXBlb2YyKFN5bWJvbC5pdGVyYXRvcikgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIF90eXBlb2YyKG9iaik7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IF90eXBlb2YyKG9iaik7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5iZXppZXJDdXJ2ZVRvUG9seWxpbmUgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG5leHBvcnRzLmdldEJlemllckN1cnZlTGVuZ3RoID0gZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgIHBvdyA9IE1hdGgucG93LFxuICAgIGNlaWwgPSBNYXRoLmNlaWwsXG4gICAgYWJzID0gTWF0aC5hYnM7IC8vIEluaXRpYWxpemUgdGhlIG51bWJlciBvZiBwb2ludHMgcGVyIGN1cnZlXG5cbnZhciBkZWZhdWx0U2VnbWVudFBvaW50c051bSA9IDUwO1xuLyoqXHJcbiAqIEBleGFtcGxlIGRhdGEgc3RydWN0dXJlIG9mIGJlemllckN1cnZlXHJcbiAqIGJlemllckN1cnZlID0gW1xyXG4gKiAgLy8gU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGN1cnZlXHJcbiAqICBbMTAsIDEwXSxcclxuICogIC8vIEJlemllckN1cnZlIHNlZ21lbnQgZGF0YSAoY29udHJvbFBvaW50MSwgY29udHJvbFBvaW50MiwgZW5kUG9pbnQpXHJcbiAqICBbXHJcbiAqICAgIFsyMCwgMjBdLCBbNDAsIDIwXSwgWzUwLCAxMF1cclxuICogIF0sXHJcbiAqICAuLi5cclxuICogXVxyXG4gKi9cblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgICAgICAgIEFic3RyYWN0IHRoZSBjdXJ2ZSBhcyBhIHBvbHlsaW5lIGNvbnNpc3Rpbmcgb2YgTiBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgYmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICBjYWxjdWxhdGlvbiBhY2N1cmFjeS4gUmVjb21tZW5kZWQgZm9yIDEtMjAuIERlZmF1bHQgPSA1XHJcbiAqIEByZXR1cm4ge09iamVjdH0gICAgICAgICAgIENhbGN1bGF0aW9uIHJlc3VsdHMgYW5kIHJlbGF0ZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gICAgICAgICAgICBPcHRpb24uc2VnbWVudFBvaW50cyBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICBPcHRpb24uY3ljbGVzIE51bWJlciBvZiBpdGVyYXRpb25zXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgIE9wdGlvbi5yb3VuZHMgVGhlIG51bWJlciBvZiByZWN1cnNpb25zIGZvciB0aGUgbGFzdCBpdGVyYXRpb25cclxuICovXG5cbmZ1bmN0aW9uIGFic3RyYWN0QmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG4gIHZhciBzZWdtZW50c051bSA9IGJlemllckN1cnZlLmxlbmd0aCAtIDE7XG4gIHZhciBzdGFydFBvaW50ID0gYmV6aWVyQ3VydmVbMF07XG4gIHZhciBlbmRQb2ludCA9IGJlemllckN1cnZlW3NlZ21lbnRzTnVtXVsyXTtcbiAgdmFyIHNlZ21lbnRzID0gYmV6aWVyQ3VydmUuc2xpY2UoMSk7XG4gIHZhciBnZXRTZWdtZW50VFBvaW50RnVucyA9IHNlZ21lbnRzLm1hcChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgdmFyIGJlZ2luUG9pbnQgPSBpID09PSAwID8gc3RhcnRQb2ludCA6IHNlZ21lbnRzW2kgLSAxXVsyXTtcbiAgICByZXR1cm4gY3JlYXRlR2V0QmV6aWVyQ3VydmVUUG9pbnRGdW4uYXBwbHkodm9pZCAwLCBbYmVnaW5Qb2ludF0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2VnKSkpO1xuICB9KTsgLy8gSW5pdGlhbGl6ZSB0aGUgY3VydmUgdG8gYSBwb2x5bGluZVxuXG4gIHZhciBzZWdtZW50UG9pbnRzTnVtID0gbmV3IEFycmF5KHNlZ21lbnRzTnVtKS5maWxsKGRlZmF1bHRTZWdtZW50UG9pbnRzTnVtKTtcbiAgdmFyIHNlZ21lbnRQb2ludHMgPSBnZXRTZWdtZW50UG9pbnRzQnlOdW0oZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRQb2ludHNOdW0pOyAvLyBDYWxjdWxhdGUgdW5pZm9ybWx5IGRpc3RyaWJ1dGVkIHBvaW50cyBieSBpdGVyYXRpdmVseVxuXG4gIHZhciByZXN1bHQgPSBjYWxjVW5pZm9ybVBvaW50c0J5SXRlcmF0aW9uKHNlZ21lbnRQb2ludHMsIGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50cywgcHJlY2lzaW9uKTtcbiAgcmVzdWx0LnNlZ21lbnRQb2ludHMucHVzaChlbmRQb2ludCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uICBHZW5lcmF0ZSBhIG1ldGhvZCBmb3Igb2J0YWluaW5nIGNvcnJlc3BvbmRpbmcgcG9pbnQgYnkgdCBhY2NvcmRpbmcgdG8gY3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZWdpblBvaW50ICAgIEJlemllckN1cnZlIGJlZ2luIHBvaW50LiBbeCwgeV1cclxuICogQHBhcmFtIHtBcnJheX0gY29udHJvbFBvaW50MSBCZXppZXJDdXJ2ZSBjb250cm9sUG9pbnQxLiBbeCwgeV1cclxuICogQHBhcmFtIHtBcnJheX0gY29udHJvbFBvaW50MiBCZXppZXJDdXJ2ZSBjb250cm9sUG9pbnQyLiBbeCwgeV1cclxuICogQHBhcmFtIHtBcnJheX0gZW5kUG9pbnQgICAgICBCZXppZXJDdXJ2ZSBlbmQgcG9pbnQuIFt4LCB5XVxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gRXhwZWN0ZWQgZnVuY3Rpb25cclxuICovXG5cblxuZnVuY3Rpb24gY3JlYXRlR2V0QmV6aWVyQ3VydmVUUG9pbnRGdW4oYmVnaW5Qb2ludCwgY29udHJvbFBvaW50MSwgY29udHJvbFBvaW50MiwgZW5kUG9pbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0KSB7XG4gICAgdmFyIHRTdWJlZDEgPSAxIC0gdDtcbiAgICB2YXIgdFN1YmVkMVBvdzMgPSBwb3codFN1YmVkMSwgMyk7XG4gICAgdmFyIHRTdWJlZDFQb3cyID0gcG93KHRTdWJlZDEsIDIpO1xuICAgIHZhciB0UG93MyA9IHBvdyh0LCAzKTtcbiAgICB2YXIgdFBvdzIgPSBwb3codCwgMik7XG4gICAgcmV0dXJuIFtiZWdpblBvaW50WzBdICogdFN1YmVkMVBvdzMgKyAzICogY29udHJvbFBvaW50MVswXSAqIHQgKiB0U3ViZWQxUG93MiArIDMgKiBjb250cm9sUG9pbnQyWzBdICogdFBvdzIgKiB0U3ViZWQxICsgZW5kUG9pbnRbMF0gKiB0UG93MywgYmVnaW5Qb2ludFsxXSAqIHRTdWJlZDFQb3czICsgMyAqIGNvbnRyb2xQb2ludDFbMV0gKiB0ICogdFN1YmVkMVBvdzIgKyAzICogY29udHJvbFBvaW50MlsxXSAqIHRQb3cyICogdFN1YmVkMSArIGVuZFBvaW50WzFdICogdFBvdzNdO1xuICB9O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludDEgQmV6aWVyQ3VydmUgYmVnaW4gcG9pbnQuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludDIgQmV6aWVyQ3VydmUgY29udHJvbFBvaW50MS4gW3gsIHldXHJcbiAqIEByZXR1cm4ge051bWJlcn0gRXhwZWN0ZWQgZGlzdGFuY2VcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0VHdvUG9pbnREaXN0YW5jZShfcmVmLCBfcmVmMikge1xuICB2YXIgX3JlZjMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZiwgMiksXG4gICAgICBheCA9IF9yZWYzWzBdLFxuICAgICAgYXkgPSBfcmVmM1sxXTtcblxuICB2YXIgX3JlZjQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjIsIDIpLFxuICAgICAgYnggPSBfcmVmNFswXSxcbiAgICAgIGJ5ID0gX3JlZjRbMV07XG5cbiAgcmV0dXJuIHNxcnQocG93KGF4IC0gYngsIDIpICsgcG93KGF5IC0gYnksIDIpKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBzdW0gb2YgdGhlIGFycmF5IG9mIG51bWJlcnNcclxuICogQHBhcmFtIHtBcnJheX0gbnVtcyBBbiBhcnJheSBvZiBudW1iZXJzXHJcbiAqIEByZXR1cm4ge051bWJlcn0gRXhwZWN0ZWQgc3VtXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE51bXNTdW0obnVtcykge1xuICByZXR1cm4gbnVtcy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgbnVtKSB7XG4gICAgcmV0dXJuIHN1bSArIG51bTtcbiAgfSwgMCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50cyBNdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9IERpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50cykge1xuICByZXR1cm4gc2VnbWVudFBvaW50cy5tYXAoZnVuY3Rpb24gKHBvaW50cywgaSkge1xuICAgIHJldHVybiBuZXcgQXJyYXkocG9pbnRzLmxlbmd0aCAtIDEpLmZpbGwoMCkubWFwKGZ1bmN0aW9uICh0ZW1wLCBqKSB7XG4gICAgICByZXR1cm4gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludHNbal0sIHBvaW50c1tqICsgMV0pO1xuICAgIH0pO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzIE11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSkge1xuICByZXR1cm4gZ2V0U2VnbWVudFRQb2ludEZ1bnMubWFwKGZ1bmN0aW9uIChnZXRTZWdtZW50VFBvaW50RnVuLCBpKSB7XG4gICAgdmFyIHRHYXAgPSAxIC8gc2VnbWVudFBvaW50c051bVtpXTtcbiAgICByZXR1cm4gbmV3IEFycmF5KHNlZ21lbnRQb2ludHNOdW1baV0pLmZpbGwoJycpLm1hcChmdW5jdGlvbiAoZm9vLCBqKSB7XG4gICAgICByZXR1cm4gZ2V0U2VnbWVudFRQb2ludEZ1bihqICogdEdhcCk7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN1bSBvZiBkZXZpYXRpb25zIGJldHdlZW4gbGluZSBzZWdtZW50IGFuZCB0aGUgYXZlcmFnZSBsZW5ndGhcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50c0Rpc3RhbmNlIFNlZ21lbnQgbGVuZ3RoIG9mIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBhdmdMZW5ndGggICAgICAgICAgICBBdmVyYWdlIGxlbmd0aCBvZiB0aGUgbGluZSBzZWdtZW50XHJcbiAqIEByZXR1cm4ge051bWJlcn0gRGV2aWF0aW9uc1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRBbGxEZXZpYXRpb25zKHNlZ21lbnRQb2ludHNEaXN0YW5jZSwgYXZnTGVuZ3RoKSB7XG4gIHJldHVybiBzZWdtZW50UG9pbnRzRGlzdGFuY2UubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICByZXR1cm4gc2VnLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIGFicyhzIC0gYXZnTGVuZ3RoKTtcbiAgICB9KTtcbiAgfSkubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICByZXR1cm4gZ2V0TnVtc1N1bShzZWcpO1xuICB9KS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCB2KSB7XG4gICAgcmV0dXJuIHRvdGFsICsgdjtcbiAgfSwgMCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENhbGN1bGF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcG9pbnRzIGJ5IGl0ZXJhdGl2ZWx5XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHMgICAgICAgIE11bHRpcGxlIHNldGQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGdldFNlZ21lbnRUUG9pbnRGdW5zIEZ1bmN0aW9ucyBvZiBnZXQgYSBwb2ludCBvbiB0aGUgY3VydmUgd2l0aCB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRzICAgICAgICAgICAgIEJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgICAgICAgICAgQ2FsY3VsYXRpb24gYWNjdXJhY3lcclxuICogQHJldHVybiB7T2JqZWN0fSBDYWxjdWxhdGlvbiByZXN1bHRzIGFuZCByZWxhdGVkIGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9ICBPcHRpb24uc2VnbWVudFBvaW50cyBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE9wdGlvbi5jeWNsZXMgTnVtYmVyIG9mIGl0ZXJhdGlvbnNcclxuICogQHJldHVybiB7TnVtYmVyfSBPcHRpb24ucm91bmRzIFRoZSBudW1iZXIgb2YgcmVjdXJzaW9ucyBmb3IgdGhlIGxhc3QgaXRlcmF0aW9uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNhbGNVbmlmb3JtUG9pbnRzQnlJdGVyYXRpb24oc2VnbWVudFBvaW50cywgZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRzLCBwcmVjaXNpb24pIHtcbiAgLy8gVGhlIG51bWJlciBvZiBsb29wcyBmb3IgdGhlIGN1cnJlbnQgaXRlcmF0aW9uXG4gIHZhciByb3VuZHMgPSA0OyAvLyBOdW1iZXIgb2YgaXRlcmF0aW9uc1xuXG4gIHZhciBjeWNsZXMgPSAxO1xuXG4gIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgIC8vIFJlY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgcG9pbnRzIHBlciBjdXJ2ZSBiYXNlZCBvbiB0aGUgbGFzdCBpdGVyYXRpb24gZGF0YVxuICAgIHZhciB0b3RhbFBvaW50c051bSA9IHNlZ21lbnRQb2ludHMucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgc2VnKSB7XG4gICAgICByZXR1cm4gdG90YWwgKyBzZWcubGVuZ3RoO1xuICAgIH0sIDApOyAvLyBBZGQgbGFzdCBwb2ludHMgb2Ygc2VnbWVudCB0byBjYWxjIGV4YWN0IHNlZ21lbnQgbGVuZ3RoXG5cbiAgICBzZWdtZW50UG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHNlZywgaSkge1xuICAgICAgcmV0dXJuIHNlZy5wdXNoKHNlZ21lbnRzW2ldWzJdKTtcbiAgICB9KTtcbiAgICB2YXIgc2VnbWVudFBvaW50c0Rpc3RhbmNlID0gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKHNlZ21lbnRQb2ludHMpO1xuICAgIHZhciBsaW5lU2VnbWVudE51bSA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgdmFyIHNlZ21lbnRsZW5ndGggPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gICAgfSk7XG4gICAgdmFyIHRvdGFsTGVuZ3RoID0gZ2V0TnVtc1N1bShzZWdtZW50bGVuZ3RoKTtcbiAgICB2YXIgYXZnTGVuZ3RoID0gdG90YWxMZW5ndGggLyBsaW5lU2VnbWVudE51bTsgLy8gQ2hlY2sgaWYgcHJlY2lzaW9uIGlzIHJlYWNoZWRcblxuICAgIHZhciBhbGxEZXZpYXRpb25zID0gZ2V0QWxsRGV2aWF0aW9ucyhzZWdtZW50UG9pbnRzRGlzdGFuY2UsIGF2Z0xlbmd0aCk7XG4gICAgaWYgKGFsbERldmlhdGlvbnMgPD0gcHJlY2lzaW9uKSByZXR1cm4gXCJicmVha1wiO1xuICAgIHRvdGFsUG9pbnRzTnVtID0gY2VpbChhdmdMZW5ndGggLyBwcmVjaXNpb24gKiB0b3RhbFBvaW50c051bSAqIDEuMSk7XG4gICAgdmFyIHNlZ21lbnRQb2ludHNOdW0gPSBzZWdtZW50bGVuZ3RoLm1hcChmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgICByZXR1cm4gY2VpbChsZW5ndGggLyB0b3RhbExlbmd0aCAqIHRvdGFsUG9pbnRzTnVtKTtcbiAgICB9KTsgLy8gQ2FsY3VsYXRlIHRoZSBwb2ludHMgYWZ0ZXIgcmVkaXN0cmlidXRpb25cblxuICAgIHNlZ21lbnRQb2ludHMgPSBnZXRTZWdtZW50UG9pbnRzQnlOdW0oZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRQb2ludHNOdW0pO1xuICAgIHRvdGFsUG9pbnRzTnVtID0gc2VnbWVudFBvaW50cy5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgdmFyIHNlZ21lbnRQb2ludHNGb3JMZW5ndGggPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNlZ21lbnRQb2ludHMpKTtcbiAgICBzZWdtZW50UG9pbnRzRm9yTGVuZ3RoLmZvckVhY2goZnVuY3Rpb24gKHNlZywgaSkge1xuICAgICAgcmV0dXJuIHNlZy5wdXNoKHNlZ21lbnRzW2ldWzJdKTtcbiAgICB9KTtcbiAgICBzZWdtZW50UG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50c0Zvckxlbmd0aCk7XG4gICAgbGluZVNlZ21lbnROdW0gPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgc2VnKSB7XG4gICAgICByZXR1cm4gdG90YWwgKyBzZWcubGVuZ3RoO1xuICAgIH0sIDApO1xuICAgIHNlZ21lbnRsZW5ndGggPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UubWFwKGZ1bmN0aW9uIChzZWcpIHtcbiAgICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gICAgfSk7XG4gICAgdG90YWxMZW5ndGggPSBnZXROdW1zU3VtKHNlZ21lbnRsZW5ndGgpO1xuICAgIGF2Z0xlbmd0aCA9IHRvdGFsTGVuZ3RoIC8gbGluZVNlZ21lbnROdW07XG4gICAgdmFyIHN0ZXBTaXplID0gMSAvIHRvdGFsUG9pbnRzTnVtIC8gMTA7IC8vIFJlY3Vyc2l2ZWx5IGZvciBlYWNoIHNlZ21lbnQgb2YgdGhlIHBvbHlsaW5lXG5cbiAgICBnZXRTZWdtZW50VFBvaW50RnVucy5mb3JFYWNoKGZ1bmN0aW9uIChnZXRTZWdtZW50VFBvaW50RnVuLCBpKSB7XG4gICAgICB2YXIgY3VycmVudFNlZ21lbnRQb2ludHNOdW0gPSBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgICAgdmFyIHQgPSBuZXcgQXJyYXkoY3VycmVudFNlZ21lbnRQb2ludHNOdW0pLmZpbGwoJycpLm1hcChmdW5jdGlvbiAoZm9vLCBqKSB7XG4gICAgICAgIHJldHVybiBqIC8gc2VnbWVudFBvaW50c051bVtpXTtcbiAgICAgIH0pOyAvLyBSZXBlYXRlZCByZWN1cnNpdmUgb2Zmc2V0XG5cbiAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcm91bmRzOyByKyspIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKFtzZWdtZW50UG9pbnRzW2ldXSlbMF07XG4gICAgICAgIHZhciBkZXZpYXRpb25zID0gZGlzdGFuY2UubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgcmV0dXJuIGQgLSBhdmdMZW5ndGg7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGN1cnJlbnRTZWdtZW50UG9pbnRzTnVtOyBqKyspIHtcbiAgICAgICAgICBpZiAoaiA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgIG9mZnNldCArPSBkZXZpYXRpb25zW2ogLSAxXTtcbiAgICAgICAgICB0W2pdIC09IHN0ZXBTaXplICogb2Zmc2V0O1xuICAgICAgICAgIGlmICh0W2pdID4gMSkgdFtqXSA9IDE7XG4gICAgICAgICAgaWYgKHRbal0gPCAwKSB0W2pdID0gMDtcbiAgICAgICAgICBzZWdtZW50UG9pbnRzW2ldW2pdID0gZ2V0U2VnbWVudFRQb2ludEZ1bih0W2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJvdW5kcyAqPSA0O1xuICAgIGN5Y2xlcysrO1xuICB9O1xuXG4gIGRvIHtcbiAgICB2YXIgX3JldCA9IF9sb29wKCk7XG5cbiAgICBpZiAoX3JldCA9PT0gXCJicmVha1wiKSBicmVhaztcbiAgfSB3aGlsZSAocm91bmRzIDw9IDEwMjUpO1xuXG4gIHNlZ21lbnRQb2ludHMgPSBzZWdtZW50UG9pbnRzLnJlZHVjZShmdW5jdGlvbiAoYWxsLCBzZWcpIHtcbiAgICByZXR1cm4gYWxsLmNvbmNhdChzZWcpO1xuICB9LCBbXSk7XG4gIHJldHVybiB7XG4gICAgc2VnbWVudFBvaW50czogc2VnbWVudFBvaW50cyxcbiAgICBjeWNsZXM6IGN5Y2xlcyxcbiAgICByb3VuZHM6IHJvdW5kc1xuICB9O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHBvbHlsaW5lIGNvcnJlc3BvbmRpbmcgdG8gdGhlIEJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBCZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIENhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgMS0yMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gUG9pbnQgZGF0YSB0aGF0IGNvbnN0aXR1dGVzIGEgcG9seWxpbmUgYWZ0ZXIgY2FsY3VsYXRpb24gKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGJlemllckN1cnZlVG9Qb2x5bGluZShiZXppZXJDdXJ2ZSkge1xuICB2YXIgcHJlY2lzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiA1O1xuXG4gIGlmICghYmV6aWVyQ3VydmUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIShiZXppZXJDdXJ2ZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2JlemllckN1cnZlVG9Qb2x5bGluZTogUGFyYW1ldGVyIGJlemllckN1cnZlIG11c3QgYmUgYW4gYXJyYXkhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcmVjaXNpb24gIT09ICdudW1iZXInKSB7XG4gICAgY29uc29sZS5lcnJvcignYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBQYXJhbWV0ZXIgcHJlY2lzaW9uIG11c3QgYmUgYSBudW1iZXIhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIF9hYnN0cmFjdEJlemllckN1cnZlVCA9IGFic3RyYWN0QmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlLCBwcmVjaXNpb24pLFxuICAgICAgc2VnbWVudFBvaW50cyA9IF9hYnN0cmFjdEJlemllckN1cnZlVC5zZWdtZW50UG9pbnRzO1xuXG4gIHJldHVybiBzZWdtZW50UG9pbnRzO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGJlemllciBjdXJ2ZSBsZW5ndGhcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgYmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICBjYWxjdWxhdGlvbiBhY2N1cmFjeS4gUmVjb21tZW5kZWQgZm9yIDUtMTAuIERlZmF1bHQgPSA1XHJcbiAqIEByZXR1cm4ge051bWJlcnxCb29sZWFufSBCZXppZXJDdXJ2ZSBsZW5ndGggKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlTGVuZ3RoKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG5cbiAgaWYgKCFiZXppZXJDdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldEJlemllckN1cnZlTGVuZ3RoOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCEoYmV6aWVyQ3VydmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRCZXppZXJDdXJ2ZUxlbmd0aDogUGFyYW1ldGVyIGJlemllckN1cnZlIG11c3QgYmUgYW4gYXJyYXkhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwcmVjaXNpb24gIT09ICdudW1iZXInKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IFBhcmFtZXRlciBwcmVjaXNpb24gbXVzdCBiZSBhIG51bWJlciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgX2Fic3RyYWN0QmV6aWVyQ3VydmVUMiA9IGFic3RyYWN0QmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlLCBwcmVjaXNpb24pLFxuICAgICAgc2VnbWVudFBvaW50cyA9IF9hYnN0cmFjdEJlemllckN1cnZlVDIuc2VnbWVudFBvaW50czsgLy8gQ2FsY3VsYXRlIHRoZSB0b3RhbCBsZW5ndGggb2YgdGhlIHBvaW50cyB0aGF0IG1ha2UgdXAgdGhlIHBvbHlsaW5lXG5cblxuICB2YXIgcG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2UoW3NlZ21lbnRQb2ludHNdKVswXTtcbiAgdmFyIGxlbmd0aCA9IGdldE51bXNTdW0ocG9pbnRzRGlzdGFuY2UpO1xuICByZXR1cm4gbGVuZ3RoO1xufVxuXG52YXIgX2RlZmF1bHQgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBBYnN0cmFjdCB0aGUgcG9seWxpbmUgZm9ybWVkIGJ5IE4gcG9pbnRzIGludG8gYSBzZXQgb2YgYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlsaW5lIEEgc2V0IG9mIHBvaW50cyB0aGF0IG1ha2UgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlICBDbG9zZWQgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldEEgU21vb3RobmVzc1xyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QiBTbW9vdGhuZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fEJvb2xlYW59IEEgc2V0IG9mIGJlemllciBjdXJ2ZSAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5mdW5jdGlvbiBwb2x5bGluZVRvQmV6aWVyQ3VydmUocG9seWxpbmUpIHtcbiAgdmFyIGNsb3NlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgdmFyIG9mZnNldEEgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDAuMjU7XG4gIHZhciBvZmZzZXRCID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAwLjI1O1xuXG4gIGlmICghKHBvbHlsaW5lIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS5lcnJvcigncG9seWxpbmVUb0JlemllckN1cnZlOiBQYXJhbWV0ZXIgcG9seWxpbmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAocG9seWxpbmUubGVuZ3RoIDw9IDIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdwb2x5bGluZVRvQmV6aWVyQ3VydmU6IENvbnZlcnRpbmcgdG8gYSBjdXJ2ZSByZXF1aXJlcyBhdCBsZWFzdCAzIHBvaW50cyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgc3RhcnRQb2ludCA9IHBvbHlsaW5lWzBdO1xuICB2YXIgYmV6aWVyQ3VydmVMaW5lTnVtID0gcG9seWxpbmUubGVuZ3RoIC0gMTtcbiAgdmFyIGJlemllckN1cnZlUG9pbnRzID0gbmV3IEFycmF5KGJlemllckN1cnZlTGluZU51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShnZXRCZXppZXJDdXJ2ZUxpbmVDb250cm9sUG9pbnRzKHBvbHlsaW5lLCBpLCBjbG9zZSwgb2Zmc2V0QSwgb2Zmc2V0QikpLCBbcG9seWxpbmVbaSArIDFdXSk7XG4gIH0pO1xuICBpZiAoY2xvc2UpIGNsb3NlQmV6aWVyQ3VydmUoYmV6aWVyQ3VydmVQb2ludHMsIHN0YXJ0UG9pbnQpO1xuICBiZXppZXJDdXJ2ZVBvaW50cy51bnNoaWZ0KHBvbHlsaW5lWzBdKTtcbiAgcmV0dXJuIGJlemllckN1cnZlUG9pbnRzO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvbnRyb2wgcG9pbnRzIG9mIHRoZSBCZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9seWxpbmUgQSBzZXQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAgIFRoZSBpbmRleCBvZiB3aGljaCBnZXQgY29udHJvbHMgcG9pbnRzJ3MgcG9pbnQgaW4gcG9seWxpbmVcclxuICogQHBhcmFtIHtCb29sZWFufSBjbG9zZSAgQ2xvc2VkIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRBIFNtb290aG5lc3NcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldEIgU21vb3RobmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gQ29udHJvbCBwb2ludHNcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVMaW5lQ29udHJvbFBvaW50cyhwb2x5bGluZSwgaW5kZXgpIHtcbiAgdmFyIGNsb3NlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIG9mZnNldEEgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDAuMjU7XG4gIHZhciBvZmZzZXRCID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAwLjI1O1xuICB2YXIgcG9pbnROdW0gPSBwb2x5bGluZS5sZW5ndGg7XG4gIGlmIChwb2ludE51bSA8IDMgfHwgaW5kZXggPj0gcG9pbnROdW0pIHJldHVybjtcbiAgdmFyIGJlZm9yZVBvaW50SW5kZXggPSBpbmRleCAtIDE7XG4gIGlmIChiZWZvcmVQb2ludEluZGV4IDwgMCkgYmVmb3JlUG9pbnRJbmRleCA9IGNsb3NlID8gcG9pbnROdW0gKyBiZWZvcmVQb2ludEluZGV4IDogMDtcbiAgdmFyIGFmdGVyUG9pbnRJbmRleCA9IGluZGV4ICsgMTtcbiAgaWYgKGFmdGVyUG9pbnRJbmRleCA+PSBwb2ludE51bSkgYWZ0ZXJQb2ludEluZGV4ID0gY2xvc2UgPyBhZnRlclBvaW50SW5kZXggLSBwb2ludE51bSA6IHBvaW50TnVtIC0gMTtcbiAgdmFyIGFmdGVyTmV4dFBvaW50SW5kZXggPSBpbmRleCArIDI7XG4gIGlmIChhZnRlck5leHRQb2ludEluZGV4ID49IHBvaW50TnVtKSBhZnRlck5leHRQb2ludEluZGV4ID0gY2xvc2UgPyBhZnRlck5leHRQb2ludEluZGV4IC0gcG9pbnROdW0gOiBwb2ludE51bSAtIDE7XG4gIHZhciBwb2ludEJlZm9yZSA9IHBvbHlsaW5lW2JlZm9yZVBvaW50SW5kZXhdO1xuICB2YXIgcG9pbnRNaWRkbGUgPSBwb2x5bGluZVtpbmRleF07XG4gIHZhciBwb2ludEFmdGVyID0gcG9seWxpbmVbYWZ0ZXJQb2ludEluZGV4XTtcbiAgdmFyIHBvaW50QWZ0ZXJOZXh0ID0gcG9seWxpbmVbYWZ0ZXJOZXh0UG9pbnRJbmRleF07XG4gIHJldHVybiBbW3BvaW50TWlkZGxlWzBdICsgb2Zmc2V0QSAqIChwb2ludEFmdGVyWzBdIC0gcG9pbnRCZWZvcmVbMF0pLCBwb2ludE1pZGRsZVsxXSArIG9mZnNldEEgKiAocG9pbnRBZnRlclsxXSAtIHBvaW50QmVmb3JlWzFdKV0sIFtwb2ludEFmdGVyWzBdIC0gb2Zmc2V0QiAqIChwb2ludEFmdGVyTmV4dFswXSAtIHBvaW50TWlkZGxlWzBdKSwgcG9pbnRBZnRlclsxXSAtIG9mZnNldEIgKiAocG9pbnRBZnRlck5leHRbMV0gLSBwb2ludE1pZGRsZVsxXSldXTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBsYXN0IGN1cnZlIG9mIHRoZSBjbG9zdXJlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIEEgc2V0IG9mIHN1Yi1jdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBzdGFydFBvaW50ICBTdGFydCBwb2ludFxyXG4gKiBAcmV0dXJuIHtBcnJheX0gVGhlIGxhc3QgY3VydmUgZm9yIGNsb3N1cmVcclxuICovXG5cblxuZnVuY3Rpb24gY2xvc2VCZXppZXJDdXJ2ZShiZXppZXJDdXJ2ZSwgc3RhcnRQb2ludCkge1xuICB2YXIgZmlyc3RTdWJDdXJ2ZSA9IGJlemllckN1cnZlWzBdO1xuICB2YXIgbGFzdFN1YkN1cnZlID0gYmV6aWVyQ3VydmUuc2xpY2UoLTEpWzBdO1xuICBiZXppZXJDdXJ2ZS5wdXNoKFtnZXRTeW1tZXRyeVBvaW50KGxhc3RTdWJDdXJ2ZVsxXSwgbGFzdFN1YkN1cnZlWzJdKSwgZ2V0U3ltbWV0cnlQb2ludChmaXJzdFN1YkN1cnZlWzBdLCBzdGFydFBvaW50KSwgc3RhcnRQb2ludF0pO1xuICByZXR1cm4gYmV6aWVyQ3VydmU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgc3ltbWV0cnkgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICAgU3ltbWV0cmljIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNlbnRlclBvaW50IFN5bW1ldHJpYyBjZW50ZXJcclxuICogQHJldHVybiB7QXJyYXl9IFN5bW1ldHJpYyBwb2ludFxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRTeW1tZXRyeVBvaW50KHBvaW50LCBjZW50ZXJQb2ludCkge1xuICB2YXIgX3BvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHB4ID0gX3BvaW50WzBdLFxuICAgICAgcHkgPSBfcG9pbnRbMV07XG5cbiAgdmFyIF9jZW50ZXJQb2ludCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb2ludCwgMiksXG4gICAgICBjeCA9IF9jZW50ZXJQb2ludFswXSxcbiAgICAgIGN5ID0gX2NlbnRlclBvaW50WzFdO1xuXG4gIHZhciBtaW51c1ggPSBjeCAtIHB4O1xuICB2YXIgbWludXNZID0gY3kgLSBweTtcbiAgcmV0dXJuIFtjeCArIG1pbnVzWCwgY3kgKyBtaW51c1ldO1xufVxuXG52YXIgX2RlZmF1bHQgPSBwb2x5bGluZVRvQmV6aWVyQ3VydmU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImJlemllckN1cnZlVG9Qb2x5bGluZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmJlemllckN1cnZlVG9Qb2x5bGluZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnZXRCZXppZXJDdXJ2ZUxlbmd0aFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmdldEJlemllckN1cnZlTGVuZ3RoO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInBvbHlsaW5lVG9CZXppZXJDdXJ2ZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcG9seWxpbmVUb0JlemllckN1cnZlW1wiZGVmYXVsdFwiXTtcbiAgfVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUgPSByZXF1aXJlKFwiLi9jb3JlL2JlemllckN1cnZlVG9Qb2x5bGluZVwiKTtcblxudmFyIF9wb2x5bGluZVRvQmV6aWVyQ3VydmUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NvcmUvcG9seWxpbmVUb0JlemllckN1cnZlXCIpKTtcblxudmFyIF9kZWZhdWx0ID0ge1xuICBiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuYmV6aWVyQ3VydmVUb1BvbHlsaW5lLFxuICBnZXRCZXppZXJDdXJ2ZUxlbmd0aDogX2JlemllckN1cnZlVG9Qb2x5bGluZS5nZXRCZXppZXJDdXJ2ZUxlbmd0aCxcbiAgcG9seWxpbmVUb0JlemllckN1cnZlOiBfcG9seWxpbmVUb0JlemllckN1cnZlW1wiZGVmYXVsdFwiXVxufTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnZhciBfY29sb3IgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpKTtcblxudmFyIF9iZXppZXJDdXJ2ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvYmV6aWVyLWN1cnZlXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2dyYXBocyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4uL2NvbmZpZy9ncmFwaHNcIikpO1xuXG52YXIgX2dyYXBoID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9ncmFwaC5jbGFzc1wiKSk7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICBDbGFzcyBvZiBDUmVuZGVyXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjYW52YXMgQ2FudmFzIERPTVxyXG4gKiBAcmV0dXJuIHtDUmVuZGVyfSAgICAgIEluc3RhbmNlIG9mIENSZW5kZXJcclxuICovXG52YXIgQ1JlbmRlciA9IGZ1bmN0aW9uIENSZW5kZXIoY2FudmFzKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgQ1JlbmRlcik7XG5cbiAgaWYgKCFjYW52YXMpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDUmVuZGVyIE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIHZhciBjbGllbnRXaWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgIGNsaWVudEhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQ7XG4gIHZhciBhcmVhID0gW2NsaWVudFdpZHRoLCBjbGllbnRIZWlnaHRdO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGNsaWVudFdpZHRoKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgY2xpZW50SGVpZ2h0KTtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIENvbnRleHQgb2YgdGhlIGNhbnZhc1xyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGV4YW1wbGUgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuICAgKi9cblxuICB0aGlzLmN0eCA9IGN0eDtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGNhbnZhc1xyXG4gICAqIEB0eXBlIHtBcnJheX1cclxuICAgKiBAZXhhbXBsZSBhcmVhID0gWzMwMO+8jDEwMF1cclxuICAgKi9cblxuICB0aGlzLmFyZWEgPSBhcmVhO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciByZW5kZXIgaXMgaW4gYW5pbWF0aW9uIHJlbmRlcmluZ1xyXG4gICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAqIEBleGFtcGxlIGFuaW1hdGlvblN0YXR1cyA9IHRydWV8ZmFsc2VcclxuICAgKi9cblxuICB0aGlzLmFuaW1hdGlvblN0YXR1cyA9IGZhbHNlO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQWRkZWQgZ3JhcGhcclxuICAgKiBAdHlwZSB7W0dyYXBoXX1cclxuICAgKiBAZXhhbXBsZSBncmFwaHMgPSBbR3JhcGgsIEdyYXBoLCAuLi5dXHJcbiAgICovXG5cbiAgdGhpcy5ncmFwaHMgPSBbXTtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIENvbG9yIHBsdWdpblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2ppYW1pbmc3NDMvY29sb3JcclxuICAgKi9cblxuICB0aGlzLmNvbG9yID0gX2NvbG9yW1wiZGVmYXVsdFwiXTtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEJlemllciBDdXJ2ZSBwbHVnaW5cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9qaWFtaW5nNzQzL0JlemllckN1cnZlXHJcbiAgICovXG5cbiAgdGhpcy5iZXppZXJDdXJ2ZSA9IF9iZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl07IC8vIGJpbmQgZXZlbnQgaGFuZGxlclxuXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBtb3VzZURvd24uYmluZCh0aGlzKSk7XG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgbW91c2VVcC5iaW5kKHRoaXMpKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICBDbGVhciBjYW52YXMgZHJhd2luZyBhcmVhXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IENSZW5kZXI7XG5cbkNSZW5kZXIucHJvdG90eXBlLmNsZWFyQXJlYSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzJGN0eDtcblxuICB2YXIgYXJlYSA9IHRoaXMuYXJlYTtcblxuICAoX3RoaXMkY3R4ID0gdGhpcy5jdHgpLmNsZWFyUmVjdC5hcHBseShfdGhpcyRjdHgsIFswLCAwXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhcmVhKSkpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICAgIEFkZCBncmFwaCB0byByZW5kZXJcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBHcmFwaCBjb25maWd1cmF0aW9uXHJcbiAqIEByZXR1cm4ge0dyYXBofSAgICAgICAgR3JhcGggaW5zdGFuY2VcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29uZmlnID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgdmFyIG5hbWUgPSBjb25maWcubmFtZTtcblxuICBpZiAoIW5hbWUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdhZGQgTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBncmFwaENvbmZpZyA9IF9ncmFwaHNbXCJkZWZhdWx0XCJdLmdldChuYW1lKTtcblxuICBpZiAoIWdyYXBoQ29uZmlnKSB7XG4gICAgY29uc29sZS53YXJuKCdObyBjb3JyZXNwb25kaW5nIGdyYXBoIGNvbmZpZ3VyYXRpb24gZm91bmQhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGdyYXBoID0gbmV3IF9ncmFwaFtcImRlZmF1bHRcIl0oZ3JhcGhDb25maWcsIGNvbmZpZyk7XG4gIGlmICghZ3JhcGgudmFsaWRhdG9yKGdyYXBoKSkgcmV0dXJuO1xuICBncmFwaC5yZW5kZXIgPSB0aGlzO1xuICB0aGlzLmdyYXBocy5wdXNoKGdyYXBoKTtcbiAgdGhpcy5zb3J0R3JhcGhzQnlJbmRleCgpO1xuICB0aGlzLmRyYXdBbGxHcmFwaCgpO1xuICByZXR1cm4gZ3JhcGg7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTb3J0IHRoZSBncmFwaCBieSBpbmRleFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuc29ydEdyYXBoc0J5SW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgZ3JhcGhzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYS5pbmRleCA+IGIuaW5kZXgpIHJldHVybiAxO1xuICAgIGlmIChhLmluZGV4ID09PSBiLmluZGV4KSByZXR1cm4gMDtcbiAgICBpZiAoYS5pbmRleCA8IGIuaW5kZXgpIHJldHVybiAtMTtcbiAgfSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgIERlbGV0ZSBncmFwaCBpbiByZW5kZXJcclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggVGhlIGdyYXBoIHRvIGJlIGRlbGV0ZWRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSAgVm9pZFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5kZWxHcmFwaCA9IGZ1bmN0aW9uIChncmFwaCkge1xuICBpZiAodHlwZW9mIGdyYXBoLmRlbFByb2Nlc3NvciAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICBncmFwaC5kZWxQcm9jZXNzb3IodGhpcyk7XG4gIHRoaXMuZ3JhcGhzID0gdGhpcy5ncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaDtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgRGVsZXRlIGFsbCBncmFwaCBpbiByZW5kZXJcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmRlbEFsbEdyYXBoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMuZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLmRlbFByb2Nlc3NvcihfdGhpcyk7XG4gIH0pO1xuICB0aGlzLmdyYXBocyA9IHRoaXMuZ3JhcGhzLmZpbHRlcihmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGg7XG4gIH0pO1xuICB0aGlzLmRyYXdBbGxHcmFwaCgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgIERyYXcgYWxsIHRoZSBncmFwaHMgaW4gdGhlIHJlbmRlclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuZHJhd0FsbEdyYXBoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMyID0gdGhpcztcblxuICB0aGlzLmNsZWFyQXJlYSgpO1xuICB0aGlzLmdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoICYmIGdyYXBoLnZpc2libGU7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLmRyYXdQcm9jZXNzb3IoX3RoaXMyLCBncmFwaCk7XG4gIH0pO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICBBbmltYXRlIHRoZSBncmFwaCB3aG9zZSBhbmltYXRpb24gcXVldWUgaXMgbm90IGVtcHR5XHJcbiAqICAgICAgICAgICAgICAgICAgIGFuZCB0aGUgYW5pbWF0aW9uUGF1c2UgaXMgZXF1YWwgdG8gZmFsc2VcclxuICogQHJldHVybiB7UHJvbWlzZX0gQW5pbWF0aW9uIFByb21pc2VcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUubGF1bmNoQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMzID0gdGhpcztcblxuICB2YXIgYW5pbWF0aW9uU3RhdHVzID0gdGhpcy5hbmltYXRpb25TdGF0dXM7XG4gIGlmIChhbmltYXRpb25TdGF0dXMpIHJldHVybjtcbiAgdGhpcy5hbmltYXRpb25TdGF0dXMgPSB0cnVlO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBhbmltYXRpb24uY2FsbChfdGhpczMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIF90aGlzMy5hbmltYXRpb25TdGF0dXMgPSBmYWxzZTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9LCBEYXRlLm5vdygpKTtcbiAgfSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBUcnkgdG8gYW5pbWF0ZSBldmVyeSBncmFwaFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBpbiBhbmltYXRpb24gZW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lU3RhbXAgIFRpbWUgc3RhbXAgb2YgYW5pbWF0aW9uIHN0YXJ0XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBhbmltYXRpb24oY2FsbGJhY2ssIHRpbWVTdGFtcCkge1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG5cbiAgaWYgKCFhbmltYXRpb25BYmxlKGdyYXBocykpIHtcbiAgICBjYWxsYmFjaygpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC50dXJuTmV4dEFuaW1hdGlvbkZyYW1lKHRpbWVTdGFtcCk7XG4gIH0pO1xuICB0aGlzLmRyYXdBbGxHcmFwaCgpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uLmJpbmQodGhpcywgY2FsbGJhY2ssIHRpbWVTdGFtcCkpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBGaW5kIGlmIHRoZXJlIGFyZSBncmFwaCB0aGF0IGNhbiBiZSBhbmltYXRlZFxyXG4gKiBAcGFyYW0ge1tHcmFwaF19IGdyYXBoc1xyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gKi9cblxuXG5mdW5jdGlvbiBhbmltYXRpb25BYmxlKGdyYXBocykge1xuICByZXR1cm4gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuICFncmFwaC5hbmltYXRpb25QYXVzZSAmJiBncmFwaC5hbmltYXRpb25GcmFtZVN0YXRlLmxlbmd0aDtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEhhbmRsZXIgb2YgQ1JlbmRlciBtb3VzZWRvd24gZXZlbnRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIG1vdXNlRG93bihlKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgdmFyIGhvdmVyR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnaG92ZXInO1xuICB9KTtcbiAgaWYgKCFob3ZlckdyYXBoKSByZXR1cm47XG4gIGhvdmVyR3JhcGguc3RhdHVzID0gJ2FjdGl2ZSc7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEhhbmRsZXIgb2YgQ1JlbmRlciBtb3VzZW1vdmUgZXZlbnRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIG1vdXNlTW92ZShlKSB7XG4gIHZhciBvZmZzZXRYID0gZS5vZmZzZXRYLFxuICAgICAgb2Zmc2V0WSA9IGUub2Zmc2V0WTtcbiAgdmFyIHBvc2l0aW9uID0gW29mZnNldFgsIG9mZnNldFldO1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIHZhciBhY3RpdmVHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdhY3RpdmUnIHx8IGdyYXBoLnN0YXR1cyA9PT0gJ2RyYWcnO1xuICB9KTtcblxuICBpZiAoYWN0aXZlR3JhcGgpIHtcbiAgICBpZiAoIWFjdGl2ZUdyYXBoLmRyYWcpIHJldHVybjtcblxuICAgIGlmICh0eXBlb2YgYWN0aXZlR3JhcGgubW92ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS5lcnJvcignTm8gbW92ZSBtZXRob2QgaXMgcHJvdmlkZWQsIGNhbm5vdCBiZSBkcmFnZ2VkIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjdGl2ZUdyYXBoLm1vdmVQcm9jZXNzb3IoZSk7XG4gICAgYWN0aXZlR3JhcGguc3RhdHVzID0gJ2RyYWcnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBob3ZlckdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2hvdmVyJztcbiAgfSk7XG4gIHZhciBob3ZlckFibGVHcmFwaHMgPSBncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5ob3ZlciAmJiAodHlwZW9mIGdyYXBoLmhvdmVyQ2hlY2sgPT09ICdmdW5jdGlvbicgfHwgZ3JhcGguaG92ZXJSZWN0KTtcbiAgfSk7XG4gIHZhciBob3ZlcmVkR3JhcGggPSBob3ZlckFibGVHcmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguaG92ZXJDaGVja1Byb2Nlc3Nvcihwb3NpdGlvbiwgZ3JhcGgpO1xuICB9KTtcblxuICBpZiAoaG92ZXJlZEdyYXBoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBob3ZlcmVkR3JhcGguc3R5bGUuaG92ZXJDdXJzb3I7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gIH1cblxuICB2YXIgaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1biA9IGZhbHNlLFxuICAgICAgaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuID0gZmFsc2U7XG4gIGlmIChob3ZlckdyYXBoKSBob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuID0gdHlwZW9mIGhvdmVyR3JhcGgubW91c2VPdXRlciA9PT0gJ2Z1bmN0aW9uJztcbiAgaWYgKGhvdmVyZWRHcmFwaCkgaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuID0gdHlwZW9mIGhvdmVyZWRHcmFwaC5tb3VzZUVudGVyID09PSAnZnVuY3Rpb24nO1xuICBpZiAoIWhvdmVyZWRHcmFwaCAmJiAhaG92ZXJHcmFwaCkgcmV0dXJuO1xuXG4gIGlmICghaG92ZXJlZEdyYXBoICYmIGhvdmVyR3JhcGgpIHtcbiAgICBpZiAoaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1bikgaG92ZXJHcmFwaC5tb3VzZU91dGVyKGUsIGhvdmVyR3JhcGgpO1xuICAgIGhvdmVyR3JhcGguc3RhdHVzID0gJ3N0YXRpYyc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGhvdmVyZWRHcmFwaCAmJiBob3ZlcmVkR3JhcGggPT09IGhvdmVyR3JhcGgpIHJldHVybjtcblxuICBpZiAoaG92ZXJlZEdyYXBoICYmICFob3ZlckdyYXBoKSB7XG4gICAgaWYgKGhvdmVyZWRHcmFwaE1vdXNlRW50ZXJJc0Z1bikgaG92ZXJlZEdyYXBoLm1vdXNlRW50ZXIoZSwgaG92ZXJlZEdyYXBoKTtcbiAgICBob3ZlcmVkR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaG92ZXJlZEdyYXBoICYmIGhvdmVyR3JhcGggJiYgaG92ZXJlZEdyYXBoICE9PSBob3ZlckdyYXBoKSB7XG4gICAgaWYgKGhvdmVyR3JhcGhNb3VzZU91dGVySXNGdW4pIGhvdmVyR3JhcGgubW91c2VPdXRlcihlLCBob3ZlckdyYXBoKTtcbiAgICBob3ZlckdyYXBoLnN0YXR1cyA9ICdzdGF0aWMnO1xuICAgIGlmIChob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4pIGhvdmVyZWRHcmFwaC5tb3VzZUVudGVyKGUsIGhvdmVyZWRHcmFwaCk7XG4gICAgaG92ZXJlZEdyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG4gIH1cbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSGFuZGxlciBvZiBDUmVuZGVyIG1vdXNldXAgZXZlbnRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIG1vdXNlVXAoZSkge1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIHZhciBhY3RpdmVHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdhY3RpdmUnO1xuICB9KTtcbiAgdmFyIGRyYWdHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdkcmFnJztcbiAgfSk7XG4gIGlmIChhY3RpdmVHcmFwaCAmJiB0eXBlb2YgYWN0aXZlR3JhcGguY2xpY2sgPT09ICdmdW5jdGlvbicpIGFjdGl2ZUdyYXBoLmNsaWNrKGUsIGFjdGl2ZUdyYXBoKTtcbiAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoICYmIChncmFwaC5zdGF0dXMgPSAnc3RhdGljJyk7XG4gIH0pO1xuICBpZiAoYWN0aXZlR3JhcGgpIGFjdGl2ZUdyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG4gIGlmIChkcmFnR3JhcGgpIGRyYWdHcmFwaC5zdGF0dXMgPSAnaG92ZXInO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgIENsb25lIEdyYXBoXHJcbiAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoIFRoZSB0YXJnZXQgdG8gYmUgY2xvbmVkXHJcbiAqIEByZXR1cm4ge0dyYXBofSAgICAgIENsb25lZCBncmFwaFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uIChncmFwaCkge1xuICB2YXIgc3R5bGUgPSBncmFwaC5zdHlsZS5nZXRTdHlsZSgpO1xuXG4gIHZhciBjbG9uZWRHcmFwaCA9IF9vYmplY3RTcHJlYWQoe30sIGdyYXBoLCB7XG4gICAgc3R5bGU6IHN0eWxlXG4gIH0pO1xuXG4gIGRlbGV0ZSBjbG9uZWRHcmFwaC5yZW5kZXI7XG4gIGNsb25lZEdyYXBoID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoY2xvbmVkR3JhcGgsIHRydWUpO1xuICByZXR1cm4gdGhpcy5hZGQoY2xvbmVkR3JhcGgpO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9yZWdlbmVyYXRvciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yXCIpKTtcblxudmFyIF9hc3luY1RvR2VuZXJhdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXN5bmNUb0dlbmVyYXRvclwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIF9zdHlsZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vc3R5bGUuY2xhc3NcIikpO1xuXG52YXIgX3RyYW5zaXRpb24gPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAamlhbWluZ2hpL3RyYW5zaXRpb25cIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2xhc3MgR3JhcGhcclxuICogQHBhcmFtIHtPYmplY3R9IGdyYXBoICBHcmFwaCBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cclxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBHcmFwaCBjb25maWdcclxuICogQHJldHVybiB7R3JhcGh9IEluc3RhbmNlIG9mIEdyYXBoXHJcbiAqL1xudmFyIEdyYXBoID0gZnVuY3Rpb24gR3JhcGgoZ3JhcGgsIGNvbmZpZykge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIEdyYXBoKTtcbiAgY29uZmlnID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoY29uZmlnLCB0cnVlKTtcbiAgdmFyIGRlZmF1bHRDb25maWcgPSB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2VhdGhlciB0byByZW5kZXIgZ3JhcGhcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgdmlzaWJsZSA9IHRydWVcclxuICAgICAqL1xuICAgIHZpc2libGU6IHRydWUsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBkcmFnXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IGRyYWcgPSBmYWxzZVxyXG4gICAgICovXG4gICAgZHJhZzogZmFsc2UsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBob3ZlclxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBob3ZlciA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBob3ZlcjogZmFsc2UsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFwaCByZW5kZXJpbmcgaW5kZXhcclxuICAgICAqICBHaXZlIHByaW9yaXR5IHRvIGluZGV4IGhpZ2ggZ3JhcGggaW4gcmVuZGVyaW5nXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGV4YW1wbGUgaW5kZXggPSAxXHJcbiAgICAgKi9cbiAgICBpbmRleDogMSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEFuaW1hdGlvbiBkZWxheSB0aW1lKG1zKVxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvbkRlbGF5ID0gMFxyXG4gICAgICovXG4gICAgYW5pbWF0aW9uRGVsYXk6IDAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBOdW1iZXIgb2YgYW5pbWF0aW9uIGZyYW1lc1xyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gMzBcclxuICAgICAqL1xuICAgIGFuaW1hdGlvbkZyYW1lOiAzMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEFuaW1hdGlvbiBkeW5hbWljIGN1cnZlIChTdXBwb3J0ZWQgYnkgdHJhbnNpdGlvbilcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdsaW5lYXInXHJcbiAgICAgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vamlhbWluZzc0My9UcmFuc2l0aW9uXHJcbiAgICAgKi9cbiAgICBhbmltYXRpb25DdXJ2ZTogJ2xpbmVhcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXZWF0aGVyIHRvIHBhdXNlIGdyYXBoIGFuaW1hdGlvblxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBhbmltYXRpb25QYXVzZSA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBhbmltYXRpb25QYXVzZTogZmFsc2UsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBSZWN0YW5ndWxhciBob3ZlciBkZXRlY3Rpb24gem9uZVxyXG4gICAgICogIFVzZSB0aGlzIG1ldGhvZCBmb3IgaG92ZXIgZGV0ZWN0aW9uIGZpcnN0XHJcbiAgICAgKiBAdHlwZSB7TnVsbHxBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGhvdmVyUmVjdCA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGhvdmVyUmVjdCA9IFswLCAwLCAxMDAsIDEwMF0gLy8gW1JlY3Qgc3RhcnQgeCwgeSwgUmVjdCB3aWR0aCwgaGVpZ2h0XVxyXG4gICAgICovXG4gICAgaG92ZXJSZWN0OiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTW91c2UgZW50ZXIgZXZlbnQgaGFuZGxlclxyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufE51bGx9XHJcbiAgICAgKiBAZGVmYXVsdCBtb3VzZUVudGVyID0gbnVsbFxyXG4gICAgICovXG4gICAgbW91c2VFbnRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE1vdXNlIG91dGVyIGV2ZW50IGhhbmRsZXJcclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbnxOdWxsfVxyXG4gICAgICogQGRlZmF1bHQgbW91c2VPdXRlciA9IG51bGxcclxuICAgICAqL1xuICAgIG1vdXNlT3V0ZXI6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBNb3VzZSBjbGljayBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb258TnVsbH1cclxuICAgICAqIEBkZWZhdWx0IGNsaWNrID0gbnVsbFxyXG4gICAgICovXG4gICAgY2xpY2s6IG51bGxcbiAgfTtcbiAgdmFyIGNvbmZpZ0FibGVOb3QgPSB7XG4gICAgc3RhdHVzOiAnc3RhdGljJyxcbiAgICBhbmltYXRpb25Sb290OiBbXSxcbiAgICBhbmltYXRpb25LZXlzOiBbXSxcbiAgICBhbmltYXRpb25GcmFtZVN0YXRlOiBbXSxcbiAgICBjYWNoZToge31cbiAgfTtcbiAgaWYgKCFjb25maWcuc2hhcGUpIGNvbmZpZy5zaGFwZSA9IHt9O1xuICBpZiAoIWNvbmZpZy5zdHlsZSkgY29uZmlnLnN0eWxlID0ge307XG4gIHZhciBzaGFwZSA9IE9iamVjdC5hc3NpZ24oe30sIGdyYXBoLnNoYXBlLCBjb25maWcuc2hhcGUpO1xuICBPYmplY3QuYXNzaWduKGRlZmF1bHRDb25maWcsIGNvbmZpZywgY29uZmlnQWJsZU5vdCk7XG4gIE9iamVjdC5hc3NpZ24odGhpcywgZ3JhcGgsIGRlZmF1bHRDb25maWcpO1xuICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gIHRoaXMuc3R5bGUgPSBuZXcgX3N0eWxlW1wiZGVmYXVsdFwiXShjb25maWcuc3R5bGUpO1xuICB0aGlzLmFkZGVkUHJvY2Vzc29yKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgYWRkZWRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gR3JhcGg7XG5cbkdyYXBoLnByb3RvdHlwZS5hZGRlZFByb2Nlc3NvciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiB0aGlzLnNldEdyYXBoQ2VudGVyID09PSAnZnVuY3Rpb24nKSB0aGlzLnNldEdyYXBoQ2VudGVyKG51bGwsIHRoaXMpOyAvLyBUaGUgbGlmZSBjeWNsZSAnYWRkZWRcIlxuXG4gIGlmICh0eXBlb2YgdGhpcy5hZGRlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5hZGRlZCh0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBkcmF3XHJcbiAqIEBwYXJhbSB7Q1JlbmRlcn0gcmVuZGVyIEluc3RhbmNlIG9mIENSZW5kZXJcclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggICAgSW5zdGFuY2Ugb2YgR3JhcGhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5kcmF3UHJvY2Vzc29yID0gZnVuY3Rpb24gKHJlbmRlciwgZ3JhcGgpIHtcbiAgdmFyIGN0eCA9IHJlbmRlci5jdHg7XG4gIGdyYXBoLnN0eWxlLmluaXRTdHlsZShjdHgpO1xuICBpZiAodHlwZW9mIHRoaXMuYmVmb3JlRHJhdyA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5iZWZvcmVEcmF3KHRoaXMsIHJlbmRlcik7XG4gIGdyYXBoLmRyYXcocmVuZGVyLCBncmFwaCk7XG4gIGlmICh0eXBlb2YgdGhpcy5kcmF3ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMuZHJhd2VkKHRoaXMsIHJlbmRlcik7XG4gIGdyYXBoLnN0eWxlLnJlc3RvcmVUcmFuc2Zvcm0oY3R4KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBob3ZlciBjaGVja1xyXG4gKiBAcGFyYW0ge0FycmF5fSBwb3NpdGlvbiBNb3VzZSBQb3NpdGlvblxyXG4gKiBAcGFyYW0ge0dyYXBofSBncmFwaCAgICBJbnN0YW5jZSBvZiBHcmFwaFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgaG92ZXIgY2hlY2tcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmhvdmVyQ2hlY2tQcm9jZXNzb3IgPSBmdW5jdGlvbiAocG9zaXRpb24sIF9yZWYpIHtcbiAgdmFyIGhvdmVyUmVjdCA9IF9yZWYuaG92ZXJSZWN0LFxuICAgICAgc3R5bGUgPSBfcmVmLnN0eWxlLFxuICAgICAgaG92ZXJDaGVjayA9IF9yZWYuaG92ZXJDaGVjaztcbiAgdmFyIGdyYXBoQ2VudGVyID0gc3R5bGUuZ3JhcGhDZW50ZXIsXG4gICAgICByb3RhdGUgPSBzdHlsZS5yb3RhdGUsXG4gICAgICBzY2FsZSA9IHN0eWxlLnNjYWxlLFxuICAgICAgdHJhbnNsYXRlID0gc3R5bGUudHJhbnNsYXRlO1xuXG4gIGlmIChncmFwaENlbnRlcikge1xuICAgIGlmIChyb3RhdGUpIHBvc2l0aW9uID0gKDAsIF91dGlsLmdldFJvdGF0ZVBvaW50UG9zKSgtcm90YXRlLCBwb3NpdGlvbiwgZ3JhcGhDZW50ZXIpO1xuICAgIGlmIChzY2FsZSkgcG9zaXRpb24gPSAoMCwgX3V0aWwuZ2V0U2NhbGVQb2ludFBvcykoc2NhbGUubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gMSAvIHM7XG4gICAgfSksIHBvc2l0aW9uLCBncmFwaENlbnRlcik7XG4gICAgaWYgKHRyYW5zbGF0ZSkgcG9zaXRpb24gPSAoMCwgX3V0aWwuZ2V0VHJhbnNsYXRlUG9pbnRQb3MpKHRyYW5zbGF0ZS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2ICogLTE7XG4gICAgfSksIHBvc2l0aW9uKTtcbiAgfVxuXG4gIGlmIChob3ZlclJlY3QpIHJldHVybiBfdXRpbC5jaGVja1BvaW50SXNJblJlY3QuYXBwbHkodm9pZCAwLCBbcG9zaXRpb25dLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGhvdmVyUmVjdCkpKTtcbiAgcmV0dXJuIGhvdmVyQ2hlY2socG9zaXRpb24sIHRoaXMpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIG1vdmVcclxuICogQHBhcmFtIHtFdmVudH0gZSBNb3VzZSBtb3ZlbWVudCBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLm1vdmVQcm9jZXNzb3IgPSBmdW5jdGlvbiAoZSkge1xuICB0aGlzLm1vdmUoZSwgdGhpcyk7XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVNb3ZlID09PSAnZnVuY3Rpb24nKSB0aGlzLmJlZm9yZU1vdmUoZSwgdGhpcyk7XG4gIGlmICh0eXBlb2YgdGhpcy5zZXRHcmFwaENlbnRlciA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5zZXRHcmFwaENlbnRlcihlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLm1vdmVkID09PSAnZnVuY3Rpb24nKSB0aGlzLm1vdmVkKGUsIHRoaXMpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gVXBkYXRlIGdyYXBoIHN0YXRlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBhdHRyTmFtZSBVcGRhdGVkIGF0dHJpYnV0ZSBuYW1lXHJcbiAqIEBwYXJhbSB7QW55fSBjaGFuZ2UgICAgICBVcGRhdGVkIHZhbHVlXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChhdHRyTmFtZSkge1xuICB2YXIgY2hhbmdlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gIGlmICghYXR0ck5hbWUgfHwgY2hhbmdlID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgdmFyIGlzT2JqZWN0ID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkodGhpc1thdHRyTmFtZV0pID09PSAnb2JqZWN0JztcbiAgaWYgKGlzT2JqZWN0KSBjaGFuZ2UgPSAoMCwgX3V0aWwuZGVlcENsb25lKShjaGFuZ2UsIHRydWUpO1xuICB2YXIgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG5cbiAgaWYgKGF0dHJOYW1lID09PSAnc3R5bGUnKSB7XG4gICAgdGhpcy5zdHlsZS51cGRhdGUoY2hhbmdlKTtcbiAgfSBlbHNlIGlmIChpc09iamVjdCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpc1thdHRyTmFtZV0sIGNoYW5nZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpc1thdHRyTmFtZV0gPSBjaGFuZ2U7XG4gIH1cblxuICBpZiAoYXR0ck5hbWUgPT09ICdpbmRleCcpIHJlbmRlci5zb3J0R3JhcGhzQnlJbmRleCgpO1xuICByZW5kZXIuZHJhd0FsbEdyYXBoKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBVcGRhdGUgZ3JhcGhpY3Mgc3RhdGUgKHdpdGggYW5pbWF0aW9uKVxyXG4gKiAgT25seSBzaGFwZSBhbmQgc3R5bGUgYXR0cmlidXRlcyBhcmUgc3VwcG9ydGVkXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBhdHRyTmFtZSBVcGRhdGVkIGF0dHJpYnV0ZSBuYW1lXHJcbiAqIEBwYXJhbSB7QW55fSBjaGFuZ2UgICAgICBVcGRhdGVkIHZhbHVlXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2FpdCAgICBXaGV0aGVyIHRvIHN0b3JlIHRoZSBhbmltYXRpb24gd2FpdGluZ1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHRoZSBuZXh0IGFuaW1hdGlvbiByZXF1ZXN0XHJcbiAqIEByZXR1cm4ge1Byb21pc2V9IEFuaW1hdGlvbiBQcm9taXNlXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5hbmltYXRpb24gPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICB2YXIgX3JlZjIgPSAoMCwgX2FzeW5jVG9HZW5lcmF0b3IyW1wiZGVmYXVsdFwiXSkoXG4gIC8qI19fUFVSRV9fKi9cbiAgX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUyKGF0dHJOYW1lLCBjaGFuZ2UpIHtcbiAgICB2YXIgd2FpdCxcbiAgICAgICAgY2hhbmdlUm9vdCxcbiAgICAgICAgY2hhbmdlS2V5cyxcbiAgICAgICAgYmVmb3JlU3RhdGUsXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lLFxuICAgICAgICBhbmltYXRpb25DdXJ2ZSxcbiAgICAgICAgYW5pbWF0aW9uRGVsYXksXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lU3RhdGUsXG4gICAgICAgIHJlbmRlcixcbiAgICAgICAgX2FyZ3MyID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLndyYXAoZnVuY3Rpb24gX2NhbGxlZTIkKF9jb250ZXh0Mikge1xuICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgc3dpdGNoIChfY29udGV4dDIucHJldiA9IF9jb250ZXh0Mi5uZXh0KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgd2FpdCA9IF9hcmdzMi5sZW5ndGggPiAyICYmIF9hcmdzMlsyXSAhPT0gdW5kZWZpbmVkID8gX2FyZ3MyWzJdIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICghKGF0dHJOYW1lICE9PSAnc2hhcGUnICYmIGF0dHJOYW1lICE9PSAnc3R5bGUnKSkge1xuICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdPbmx5IHN1cHBvcnRlZCBzaGFwZSBhbmQgc3R5bGUgYW5pbWF0aW9uIScpO1xuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIik7XG5cbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBjaGFuZ2UgPSAoMCwgX3V0aWwuZGVlcENsb25lKShjaGFuZ2UsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnc3R5bGUnKSB0aGlzLnN0eWxlLmNvbG9yUHJvY2Vzc29yKGNoYW5nZSk7XG4gICAgICAgICAgICBjaGFuZ2VSb290ID0gdGhpc1thdHRyTmFtZV07XG4gICAgICAgICAgICBjaGFuZ2VLZXlzID0gT2JqZWN0LmtleXMoY2hhbmdlKTtcbiAgICAgICAgICAgIGJlZm9yZVN0YXRlID0ge307XG4gICAgICAgICAgICBjaGFuZ2VLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICByZXR1cm4gYmVmb3JlU3RhdGVba2V5XSA9IGNoYW5nZVJvb3Rba2V5XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5pbWF0aW9uRnJhbWUgPSB0aGlzLmFuaW1hdGlvbkZyYW1lLCBhbmltYXRpb25DdXJ2ZSA9IHRoaXMuYW5pbWF0aW9uQ3VydmUsIGFuaW1hdGlvbkRlbGF5ID0gdGhpcy5hbmltYXRpb25EZWxheTtcbiAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lU3RhdGUgPSAoMCwgX3RyYW5zaXRpb25bXCJkZWZhdWx0XCJdKShhbmltYXRpb25DdXJ2ZSwgYmVmb3JlU3RhdGUsIGNoYW5nZSwgYW5pbWF0aW9uRnJhbWUsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25Sb290LnB1c2goY2hhbmdlUm9vdCk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbktleXMucHVzaChjaGFuZ2VLZXlzKTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZS5wdXNoKGFuaW1hdGlvbkZyYW1lU3RhdGUpO1xuXG4gICAgICAgICAgICBpZiAoIXdhaXQpIHtcbiAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAxNztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuYWJydXB0KFwicmV0dXJuXCIpO1xuXG4gICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgIGlmICghKGFuaW1hdGlvbkRlbGF5ID4gMCkpIHtcbiAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMjA7XG4gICAgICAgICAgICByZXR1cm4gZGVsYXkoYW5pbWF0aW9uRGVsYXkpO1xuXG4gICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIiwgbmV3IFByb21pc2UoXG4gICAgICAgICAgICAvKiNfX1BVUkVfXyovXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciBfcmVmMyA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjJbXCJkZWZhdWx0XCJdKShcbiAgICAgICAgICAgICAgLyojX19QVVJFX18qL1xuICAgICAgICAgICAgICBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLm1hcmsoZnVuY3Rpb24gX2NhbGxlZShyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ud3JhcChmdW5jdGlvbiBfY2FsbGVlJChfY29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChfY29udGV4dC5wcmV2ID0gX2NvbnRleHQubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0Lm5leHQgPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlci5sYXVuY2hBbmltYXRpb24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuc3RvcCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgX2NhbGxlZSk7XG4gICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKF94Mykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVmMy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSgpKSk7XG5cbiAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgX2NhbGxlZTIsIHRoaXMpO1xuICB9KSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChfeCwgX3gyKSB7XG4gICAgcmV0dXJuIF9yZWYyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59KCk7XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEV4dHJhY3QgdGhlIG5leHQgZnJhbWUgb2YgZGF0YSBmcm9tIHRoZSBhbmltYXRpb24gcXVldWVcclxuICogICAgICAgICAgICAgIGFuZCB1cGRhdGUgdGhlIGdyYXBoIHN0YXRlXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUudHVybk5leHRBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uICh0aW1lU3RhbXApIHtcbiAgdmFyIGFuaW1hdGlvbkRlbGF5ID0gdGhpcy5hbmltYXRpb25EZWxheSxcbiAgICAgIGFuaW1hdGlvblJvb3QgPSB0aGlzLmFuaW1hdGlvblJvb3QsXG4gICAgICBhbmltYXRpb25LZXlzID0gdGhpcy5hbmltYXRpb25LZXlzLFxuICAgICAgYW5pbWF0aW9uRnJhbWVTdGF0ZSA9IHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZSxcbiAgICAgIGFuaW1hdGlvblBhdXNlID0gdGhpcy5hbmltYXRpb25QYXVzZTtcbiAgaWYgKGFuaW1hdGlvblBhdXNlKSByZXR1cm47XG4gIGlmIChEYXRlLm5vdygpIC0gdGltZVN0YW1wIDwgYW5pbWF0aW9uRGVsYXkpIHJldHVybjtcbiAgYW5pbWF0aW9uUm9vdC5mb3JFYWNoKGZ1bmN0aW9uIChyb290LCBpKSB7XG4gICAgYW5pbWF0aW9uS2V5c1tpXS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJvb3Rba2V5XSA9IGFuaW1hdGlvbkZyYW1lU3RhdGVbaV1bMF1ba2V5XTtcbiAgICB9KTtcbiAgfSk7XG4gIGFuaW1hdGlvbkZyYW1lU3RhdGUuZm9yRWFjaChmdW5jdGlvbiAoc3RhdGVJdGVtLCBpKSB7XG4gICAgc3RhdGVJdGVtLnNoaWZ0KCk7XG4gICAgdmFyIG5vRnJhbWUgPSBzdGF0ZUl0ZW0ubGVuZ3RoID09PSAwO1xuICAgIGlmIChub0ZyYW1lKSBhbmltYXRpb25Sb290W2ldID0gbnVsbDtcbiAgICBpZiAobm9GcmFtZSkgYW5pbWF0aW9uS2V5c1tpXSA9IG51bGw7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUgPSBhbmltYXRpb25GcmFtZVN0YXRlLmZpbHRlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICByZXR1cm4gc3RhdGUubGVuZ3RoO1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25Sb290ID0gYW5pbWF0aW9uUm9vdC5maWx0ZXIoZnVuY3Rpb24gKHJvb3QpIHtcbiAgICByZXR1cm4gcm9vdDtcbiAgfSk7XG4gIHRoaXMuYW5pbWF0aW9uS2V5cyA9IGFuaW1hdGlvbktleXMuZmlsdGVyKGZ1bmN0aW9uIChrZXlzKSB7XG4gICAgcmV0dXJuIGtleXM7XG4gIH0pO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2tpcCB0byB0aGUgbGFzdCBmcmFtZSBvZiBhbmltYXRpb25cclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5hbmltYXRpb25FbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhbmltYXRpb25GcmFtZVN0YXRlID0gdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlLFxuICAgICAgYW5pbWF0aW9uS2V5cyA9IHRoaXMuYW5pbWF0aW9uS2V5cyxcbiAgICAgIGFuaW1hdGlvblJvb3QgPSB0aGlzLmFuaW1hdGlvblJvb3QsXG4gICAgICByZW5kZXIgPSB0aGlzLnJlbmRlcjtcbiAgYW5pbWF0aW9uUm9vdC5mb3JFYWNoKGZ1bmN0aW9uIChyb290LCBpKSB7XG4gICAgdmFyIGN1cnJlbnRLZXlzID0gYW5pbWF0aW9uS2V5c1tpXTtcbiAgICB2YXIgbGFzdFN0YXRlID0gYW5pbWF0aW9uRnJhbWVTdGF0ZVtpXS5wb3AoKTtcbiAgICBjdXJyZW50S2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiByb290W2tleV0gPSBsYXN0U3RhdGVba2V5XTtcbiAgICB9KTtcbiAgfSk7XG4gIHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZSA9IFtdO1xuICB0aGlzLmFuaW1hdGlvbktleXMgPSBbXTtcbiAgdGhpcy5hbmltYXRpb25Sb290ID0gW107XG4gIHJldHVybiByZW5kZXIuZHJhd0FsbEdyYXBoKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQYXVzZSBhbmltYXRpb24gYmVoYXZpb3JcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5wYXVzZUFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5hdHRyKCdhbmltYXRpb25QYXVzZScsIHRydWUpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gVHJ5IGFuaW1hdGlvbiBiZWhhdmlvclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLnBsYXlBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByZW5kZXIgPSB0aGlzLnJlbmRlcjtcbiAgdGhpcy5hdHRyKCdhbmltYXRpb25QYXVzZScsIGZhbHNlKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKFxuICAvKiNfX1BVUkVfXyovXG4gIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3JlZjQgPSAoMCwgX2FzeW5jVG9HZW5lcmF0b3IyW1wiZGVmYXVsdFwiXSkoXG4gICAgLyojX19QVVJFX18qL1xuICAgIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ubWFyayhmdW5jdGlvbiBfY2FsbGVlMyhyZXNvbHZlKSB7XG4gICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUzJChfY29udGV4dDMpIHtcbiAgICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgICBzd2l0Y2ggKF9jb250ZXh0My5wcmV2ID0gX2NvbnRleHQzLm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gcmVuZGVyLmxhdW5jaEFuaW1hdGlvbigpO1xuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcblxuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIF9jYWxsZWUzKTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKF94NCkge1xuICAgICAgcmV0dXJuIF9yZWY0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfSgpKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBkZWxldGVcclxuICogQHBhcmFtIHtDUmVuZGVyfSByZW5kZXIgSW5zdGFuY2Ugb2YgQ1JlbmRlclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmRlbFByb2Nlc3NvciA9IGZ1bmN0aW9uIChyZW5kZXIpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB2YXIgZ3JhcGhzID0gcmVuZGVyLmdyYXBocztcbiAgdmFyIGluZGV4ID0gZ3JhcGhzLmZpbmRJbmRleChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGggPT09IF90aGlzO1xuICB9KTtcbiAgaWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xuICBpZiAodHlwZW9mIHRoaXMuYmVmb3JlRGVsZXRlID09PSAnZnVuY3Rpb24nKSB0aGlzLmJlZm9yZURlbGV0ZSh0aGlzKTtcbiAgZ3JhcGhzLnNwbGljZShpbmRleCwgMSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdGhpcy5kZWxldGVkID09PSAnZnVuY3Rpb24nKSB0aGlzLmRlbGV0ZWQodGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBSZXR1cm4gYSB0aW1lZCByZWxlYXNlIFByb21pc2VcclxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgUmVsZWFzZSB0aW1lXHJcbiAqIEByZXR1cm4ge1Byb21pc2V9IEEgdGltZWQgcmVsZWFzZSBQcm9taXNlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRlbGF5KHRpbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCB0aW1lKTtcbiAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3BsdWdpbi91dGlsXCIpO1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIENsYXNzIFN0eWxlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdHlsZSAgU3R5bGUgY29uZmlndXJhdGlvblxyXG4gKiBAcmV0dXJuIHtTdHlsZX0gSW5zdGFuY2Ugb2YgU3R5bGVcclxuICovXG52YXIgU3R5bGUgPSBmdW5jdGlvbiBTdHlsZShzdHlsZSkge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIFN0eWxlKTtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihzdHlsZSk7XG4gIHZhciBkZWZhdWx0U3R5bGUgPSB7XG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gUmdiYSB2YWx1ZSBvZiBncmFwaCBmaWxsIGNvbG9yXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBmaWxsID0gWzAsIDAsIDAsIDFdXHJcbiAgICAgKi9cbiAgICBmaWxsOiBbMCwgMCwgMCwgMV0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBSZ2JhIHZhbHVlIG9mIGdyYXBoIHN0cm9rZSBjb2xvclxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgc3Ryb2tlID0gWzAsIDAsIDAsIDFdXHJcbiAgICAgKi9cbiAgICBzdHJva2U6IFswLCAwLCAwLCAwXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE9wYWNpdHkgb2YgZ3JhcGhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBvcGFjaXR5ID0gMVxyXG4gICAgICovXG4gICAgb3BhY2l0eTogMSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVDYXAgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgbGluZUNhcCA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGxpbmVDYXAgPSAnYnV0dCd8J3JvdW5kJ3wnc3F1YXJlJ1xyXG4gICAgICovXG4gICAgbGluZUNhcDogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVqb2luIG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGxpbmVKb2luID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgbGluZUpvaW4gPSAncm91bmQnfCdiZXZlbCd8J21pdGVyJ1xyXG4gICAgICovXG4gICAgbGluZUpvaW46IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lRGFzaCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGxpbmVEYXNoID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgbGluZURhc2ggPSBbMTAsIDEwXVxyXG4gICAgICovXG4gICAgbGluZURhc2g6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lRGFzaE9mZnNldCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBsaW5lRGFzaE9mZnNldCA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGxpbmVEYXNoT2Zmc2V0ID0gMTBcclxuICAgICAqL1xuICAgIGxpbmVEYXNoT2Zmc2V0OiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gU2hhZG93Qmx1ciBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBzaGFkb3dCbHVyID0gMFxyXG4gICAgICovXG4gICAgc2hhZG93Qmx1cjogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJnYmEgdmFsdWUgb2YgZ3JhcGggc2hhZG93IGNvbG9yXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBzaGFkb3dDb2xvciA9IFswLCAwLCAwLCAwXVxyXG4gICAgICovXG4gICAgc2hhZG93Q29sb3I6IFswLCAwLCAwLCAwXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFNoYWRvd09mZnNldFggb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgc2hhZG93T2Zmc2V0WCA9IDBcclxuICAgICAqL1xuICAgIHNoYWRvd09mZnNldFg6IDAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBTaGFkb3dPZmZzZXRZIG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHNoYWRvd09mZnNldFkgPSAwXHJcbiAgICAgKi9cbiAgICBzaGFkb3dPZmZzZXRZOiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZVdpZHRoIG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGxpbmVXaWR0aCA9IDBcclxuICAgICAqL1xuICAgIGxpbmVXaWR0aDogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIENlbnRlciBwb2ludCBvZiB0aGUgZ3JhcGhcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGdyYXBoQ2VudGVyID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZ3JhcGhDZW50ZXIgPSBbMTAsIDEwXVxyXG4gICAgICovXG4gICAgZ3JhcGhDZW50ZXI6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFwaCBzY2FsZVxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgc2NhbGUgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBzY2FsZSA9IFsxLjUsIDEuNV1cclxuICAgICAqL1xuICAgIHNjYWxlOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggcm90YXRpb24gZGVncmVlXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgcm90YXRlID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgcm90YXRlID0gMTBcclxuICAgICAqL1xuICAgIHJvdGF0ZTogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYXBoIHRyYW5zbGF0ZSBkaXN0YW5jZVxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgdHJhbnNsYXRlID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgdHJhbnNsYXRlID0gWzEwLCAxMF1cclxuICAgICAqL1xuICAgIHRyYW5zbGF0ZTogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEN1cnNvciBzdGF0dXMgd2hlbiBob3ZlclxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGhvdmVyQ3Vyc29yID0gJ3BvaW50ZXInXHJcbiAgICAgKiBAZXhhbXBsZSBob3ZlckN1cnNvciA9ICdkZWZhdWx0J3wncG9pbnRlcid8J2F1dG8nfCdjcm9zc2hhaXInfCdtb3ZlJ3wnd2FpdCd8Li4uXHJcbiAgICAgKi9cbiAgICBob3ZlckN1cnNvcjogJ3BvaW50ZXInLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCBzdHlsZSBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBmb250U3R5bGUgPSAnbm9ybWFsJ1xyXG4gICAgICogQGV4YW1wbGUgZm9udFN0eWxlID0gJ25vcm1hbCd8J2l0YWxpYyd8J29ibGlxdWUnXHJcbiAgICAgKi9cbiAgICBmb250U3R5bGU6ICdub3JtYWwnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCB2YXJpZW50IG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGZvbnRWYXJpZW50ID0gJ25vcm1hbCdcclxuICAgICAqIEBleGFtcGxlIGZvbnRWYXJpZW50ID0gJ25vcm1hbCd8J3NtYWxsLWNhcHMnXHJcbiAgICAgKi9cbiAgICBmb250VmFyaWVudDogJ25vcm1hbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHdlaWdodCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgZm9udFdlaWdodCA9ICdub3JtYWwnXHJcbiAgICAgKiBAZXhhbXBsZSBmb250V2VpZ2h0ID0gJ25vcm1hbCd8J2JvbGQnfCdib2xkZXInfCdsaWdodGVyJ3xOdW1iZXJcclxuICAgICAqL1xuICAgIGZvbnRXZWlnaHQ6ICdub3JtYWwnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCBzaXplIG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGZvbnRTaXplID0gMTBcclxuICAgICAqL1xuICAgIGZvbnRTaXplOiAxMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEZvbnQgZmFtaWx5IG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGZvbnRGYW1pbHkgPSAnQXJpYWwnXHJcbiAgICAgKi9cbiAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gVGV4dEFsaWduIG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IHRleHRBbGlnbiA9ICdjZW50ZXInXHJcbiAgICAgKiBAZXhhbXBsZSB0ZXh0QWxpZ24gPSAnc3RhcnQnfCdlbmQnfCdsZWZ0J3wncmlnaHQnfCdjZW50ZXInXHJcbiAgICAgKi9cbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gVGV4dEJhc2VsaW5lIG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IHRleHRCYXNlbGluZSA9ICdtaWRkbGUnXHJcbiAgICAgKiBAZXhhbXBsZSB0ZXh0QmFzZWxpbmUgPSAndG9wJ3wnYm90dG9tJ3wnbWlkZGxlJ3wnYWxwaGFiZXRpYyd8J2hhbmdpbmcnXHJcbiAgICAgKi9cbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gVGhlIGNvbG9yIHVzZWQgdG8gY3JlYXRlIHRoZSBncmFkaWVudFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRDb2xvciA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50Q29sb3IgPSBbJyMwMDAnLCAnIzExMScsICcjMjIyJ11cclxuICAgICAqL1xuICAgIGdyYWRpZW50Q29sb3I6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFkaWVudCB0eXBlXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRUeXBlID0gJ2xpbmVhcidcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50VHlwZSA9ICdsaW5lYXInIHwgJ3JhZGlhbCdcclxuICAgICAqL1xuICAgIGdyYWRpZW50VHlwZTogJ2xpbmVhcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFkaWVudCBwYXJhbXNcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50UGFyYW1zID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRQYXJhbXMgPSBbeDAsIHkwLCB4MSwgeTFdIChMaW5lYXIgR3JhZGllbnQpXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFBhcmFtcyA9IFt4MCwgeTAsIHIwLCB4MSwgeTEsIHIxXSAoUmFkaWFsIEdyYWRpZW50KVxyXG4gICAgICovXG4gICAgZ3JhZGllbnRQYXJhbXM6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGVuIHRvIHVzZSBncmFkaWVudHNcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudFdpdGggPSAnc3Ryb2tlJ1xyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRXaXRoID0gJ3N0cm9rZScgfCAnZmlsbCdcclxuICAgICAqL1xuICAgIGdyYWRpZW50V2l0aDogJ3N0cm9rZScsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFkaWVudCBjb2xvciBzdG9wc1xyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50U3RvcHMgPSAnYXV0bydcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50U3RvcHMgPSAnYXV0bycgfCBbMCwgLjIsIC4zLCAxXVxyXG4gICAgICovXG4gICAgZ3JhZGllbnRTdG9wczogJ2F1dG8nLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRXh0ZW5kZWQgY29sb3IgdGhhdCBzdXBwb3J0cyBhbmltYXRpb24gdHJhbnNpdGlvblxyXG4gICAgICogQHR5cGUge0FycmF5fE9iamVjdH1cclxuICAgICAqIEBkZWZhdWx0IGNvbG9ycyA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGNvbG9ycyA9IFsnIzAwMCcsICcjMTExJywgJyMyMjInLCAncmVkJyBdXHJcbiAgICAgKiBAZXhhbXBsZSBjb2xvcnMgPSB7IGE6ICcjMDAwJywgYjogJyMxMTEnIH1cclxuICAgICAqL1xuICAgIGNvbG9yczogbnVsbFxuICB9O1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGRlZmF1bHRTdHlsZSwgc3R5bGUpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2V0IGNvbG9ycyB0byByZ2JhIHZhbHVlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdHlsZSBzdHlsZSBjb25maWdcclxuICogQHBhcmFtIHtCb29sZWFufSByZXZlcnNlIFdoZXRoZXIgdG8gcGVyZm9ybSByZXZlcnNlIG9wZXJhdGlvblxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTdHlsZTtcblxuU3R5bGUucHJvdG90eXBlLmNvbG9yUHJvY2Vzc29yID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gIHZhciByZXZlcnNlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgdmFyIHByb2Nlc3NvciA9IHJldmVyc2UgPyBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUgOiBfY29sb3IuZ2V0UmdiYVZhbHVlO1xuICB2YXIgY29sb3JQcm9jZXNzb3JLZXlzID0gWydmaWxsJywgJ3N0cm9rZScsICdzaGFkb3dDb2xvciddO1xuICB2YXIgYWxsS2V5cyA9IE9iamVjdC5rZXlzKHN0eWxlKTtcbiAgdmFyIGNvbG9yS2V5cyA9IGFsbEtleXMuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gY29sb3JQcm9jZXNzb3JLZXlzLmZpbmQoZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiBrID09PSBrZXk7XG4gICAgfSk7XG4gIH0pO1xuICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHN0eWxlW2tleV0gPSBwcm9jZXNzb3Ioc3R5bGVba2V5XSk7XG4gIH0pO1xuICB2YXIgZ3JhZGllbnRDb2xvciA9IHN0eWxlLmdyYWRpZW50Q29sb3IsXG4gICAgICBjb2xvcnMgPSBzdHlsZS5jb2xvcnM7XG4gIGlmIChncmFkaWVudENvbG9yKSBzdHlsZS5ncmFkaWVudENvbG9yID0gZ3JhZGllbnRDb2xvci5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gcHJvY2Vzc29yKGMpO1xuICB9KTtcblxuICBpZiAoY29sb3JzKSB7XG4gICAgdmFyIGNvbG9yc0tleXMgPSBPYmplY3Qua2V5cyhjb2xvcnMpO1xuICAgIGNvbG9yc0tleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gY29sb3JzW2tleV0gPSBwcm9jZXNzb3IoY29sb3JzW2tleV0pO1xuICAgIH0pO1xuICB9XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBJbml0IGdyYXBoIHN0eWxlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggQ29udGV4dCBvZiBjYW52YXNcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cblN0eWxlLnByb3RvdHlwZS5pbml0U3R5bGUgPSBmdW5jdGlvbiAoY3R4KSB7XG4gIGluaXRUcmFuc2Zvcm0oY3R4LCB0aGlzKTtcbiAgaW5pdEdyYXBoU3R5bGUoY3R4LCB0aGlzKTtcbiAgaW5pdEdyYWRpZW50KGN0eCwgdGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBJbml0IGNhbnZhcyB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgQ29udGV4dCBvZiBjYW52YXNcclxuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGluaXRUcmFuc2Zvcm0oY3R4LCBzdHlsZSkge1xuICBjdHguc2F2ZSgpO1xuICB2YXIgZ3JhcGhDZW50ZXIgPSBzdHlsZS5ncmFwaENlbnRlcixcbiAgICAgIHJvdGF0ZSA9IHN0eWxlLnJvdGF0ZSxcbiAgICAgIHNjYWxlID0gc3R5bGUuc2NhbGUsXG4gICAgICB0cmFuc2xhdGUgPSBzdHlsZS50cmFuc2xhdGU7XG4gIGlmICghKGdyYXBoQ2VudGVyIGluc3RhbmNlb2YgQXJyYXkpKSByZXR1cm47XG4gIGN0eC50cmFuc2xhdGUuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdyYXBoQ2VudGVyKSk7XG4gIGlmIChyb3RhdGUpIGN0eC5yb3RhdGUocm90YXRlICogTWF0aC5QSSAvIDE4MCk7XG4gIGlmIChzY2FsZSBpbnN0YW5jZW9mIEFycmF5KSBjdHguc2NhbGUuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNjYWxlKSk7XG4gIGlmICh0cmFuc2xhdGUpIGN0eC50cmFuc2xhdGUuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHRyYW5zbGF0ZSkpO1xuICBjdHgudHJhbnNsYXRlKC1ncmFwaENlbnRlclswXSwgLWdyYXBoQ2VudGVyWzFdKTtcbn1cblxudmFyIGF1dG9TZXRTdHlsZUtleXMgPSBbJ2xpbmVDYXAnLCAnbGluZUpvaW4nLCAnbGluZURhc2hPZmZzZXQnLCAnc2hhZG93T2Zmc2V0WCcsICdzaGFkb3dPZmZzZXRZJywgJ2xpbmVXaWR0aCcsICd0ZXh0QWxpZ24nLCAndGV4dEJhc2VsaW5lJ107XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNldCB0aGUgc3R5bGUgb2YgY2FudmFzIGN0eFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cbmZ1bmN0aW9uIGluaXRHcmFwaFN0eWxlKGN0eCwgc3R5bGUpIHtcbiAgdmFyIGZpbGwgPSBzdHlsZS5maWxsLFxuICAgICAgc3Ryb2tlID0gc3R5bGUuc3Ryb2tlLFxuICAgICAgc2hhZG93Q29sb3IgPSBzdHlsZS5zaGFkb3dDb2xvcixcbiAgICAgIG9wYWNpdHkgPSBzdHlsZS5vcGFjaXR5O1xuICBhdXRvU2V0U3R5bGVLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgfHwgdHlwZW9mIGtleSA9PT0gJ251bWJlcicpIGN0eFtrZXldID0gc3R5bGVba2V5XTtcbiAgfSk7XG4gIGZpbGwgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGZpbGwpO1xuICBzdHJva2UgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHN0cm9rZSk7XG4gIHNoYWRvd0NvbG9yID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzaGFkb3dDb2xvcik7XG4gIGZpbGxbM10gKj0gb3BhY2l0eTtcbiAgc3Ryb2tlWzNdICo9IG9wYWNpdHk7XG4gIHNoYWRvd0NvbG9yWzNdICo9IG9wYWNpdHk7XG4gIGN0eC5maWxsU3R5bGUgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShmaWxsKTtcbiAgY3R4LnN0cm9rZVN0eWxlID0gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoc3Ryb2tlKTtcbiAgY3R4LnNoYWRvd0NvbG9yID0gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoc2hhZG93Q29sb3IpO1xuICB2YXIgbGluZURhc2ggPSBzdHlsZS5saW5lRGFzaCxcbiAgICAgIHNoYWRvd0JsdXIgPSBzdHlsZS5zaGFkb3dCbHVyO1xuXG4gIGlmIChsaW5lRGFzaCkge1xuICAgIGxpbmVEYXNoID0gbGluZURhc2gubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdiA+PSAwID8gdiA6IDA7XG4gICAgfSk7XG4gICAgY3R4LnNldExpbmVEYXNoKGxpbmVEYXNoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc2hhZG93Qmx1ciA9PT0gJ251bWJlcicpIGN0eC5zaGFkb3dCbHVyID0gc2hhZG93Qmx1ciA+IDAgPyBzaGFkb3dCbHVyIDogMC4wMDE7XG4gIHZhciBmb250U3R5bGUgPSBzdHlsZS5mb250U3R5bGUsXG4gICAgICBmb250VmFyaWVudCA9IHN0eWxlLmZvbnRWYXJpZW50LFxuICAgICAgZm9udFdlaWdodCA9IHN0eWxlLmZvbnRXZWlnaHQsXG4gICAgICBmb250U2l6ZSA9IHN0eWxlLmZvbnRTaXplLFxuICAgICAgZm9udEZhbWlseSA9IHN0eWxlLmZvbnRGYW1pbHk7XG4gIGN0eC5mb250ID0gZm9udFN0eWxlICsgJyAnICsgZm9udFZhcmllbnQgKyAnICcgKyBmb250V2VpZ2h0ICsgJyAnICsgZm9udFNpemUgKyAncHgnICsgJyAnICsgZm9udEZhbWlseTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2V0IHRoZSBncmFkaWVudCBjb2xvciBvZiBjYW52YXMgY3R4XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggIENvbnRleHQgb2YgY2FudmFzXHJcbiAqIEBwYXJhbSB7U3R5bGV9IHN0eWxlIEluc3RhbmNlIG9mIFN0eWxlXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBpbml0R3JhZGllbnQoY3R4LCBzdHlsZSkge1xuICBpZiAoIWdyYWRpZW50VmFsaWRhdG9yKHN0eWxlKSkgcmV0dXJuO1xuICB2YXIgZ3JhZGllbnRDb2xvciA9IHN0eWxlLmdyYWRpZW50Q29sb3IsXG4gICAgICBncmFkaWVudFBhcmFtcyA9IHN0eWxlLmdyYWRpZW50UGFyYW1zLFxuICAgICAgZ3JhZGllbnRUeXBlID0gc3R5bGUuZ3JhZGllbnRUeXBlLFxuICAgICAgZ3JhZGllbnRXaXRoID0gc3R5bGUuZ3JhZGllbnRXaXRoLFxuICAgICAgZ3JhZGllbnRTdG9wcyA9IHN0eWxlLmdyYWRpZW50U3RvcHMsXG4gICAgICBvcGFjaXR5ID0gc3R5bGUub3BhY2l0eTtcbiAgZ3JhZGllbnRDb2xvciA9IGdyYWRpZW50Q29sb3IubWFwKGZ1bmN0aW9uIChjb2xvcikge1xuICAgIHZhciBjb2xvck9wYWNpdHkgPSBjb2xvclszXSAqIG9wYWNpdHk7XG4gICAgdmFyIGNsb25lZENvbG9yID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjb2xvcik7XG4gICAgY2xvbmVkQ29sb3JbM10gPSBjb2xvck9wYWNpdHk7XG4gICAgcmV0dXJuIGNsb25lZENvbG9yO1xuICB9KTtcbiAgZ3JhZGllbnRDb2xvciA9IGdyYWRpZW50Q29sb3IubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgcmV0dXJuICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKGMpO1xuICB9KTtcbiAgaWYgKGdyYWRpZW50U3RvcHMgPT09ICdhdXRvJykgZ3JhZGllbnRTdG9wcyA9IGdldEF1dG9Db2xvclN0b3BzKGdyYWRpZW50Q29sb3IpO1xuICB2YXIgZ3JhZGllbnQgPSBjdHhbXCJjcmVhdGVcIi5jb25jYXQoZ3JhZGllbnRUeXBlLnNsaWNlKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBncmFkaWVudFR5cGUuc2xpY2UoMSksIFwiR3JhZGllbnRcIildLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShncmFkaWVudFBhcmFtcykpO1xuICBncmFkaWVudFN0b3BzLmZvckVhY2goZnVuY3Rpb24gKHN0b3AsIGkpIHtcbiAgICByZXR1cm4gZ3JhZGllbnQuYWRkQ29sb3JTdG9wKHN0b3AsIGdyYWRpZW50Q29sb3JbaV0pO1xuICB9KTtcbiAgY3R4W1wiXCIuY29uY2F0KGdyYWRpZW50V2l0aCwgXCJTdHlsZVwiKV0gPSBncmFkaWVudDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIGdyYWRpZW50IGNvbmZpZ3VyYXRpb24gaXMgbGVnYWxcclxuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcclxuICogQHJldHVybiB7Qm9vbGVhbn0gQ2hlY2sgUmVzdWx0XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdyYWRpZW50VmFsaWRhdG9yKHN0eWxlKSB7XG4gIHZhciBncmFkaWVudENvbG9yID0gc3R5bGUuZ3JhZGllbnRDb2xvcixcbiAgICAgIGdyYWRpZW50UGFyYW1zID0gc3R5bGUuZ3JhZGllbnRQYXJhbXMsXG4gICAgICBncmFkaWVudFR5cGUgPSBzdHlsZS5ncmFkaWVudFR5cGUsXG4gICAgICBncmFkaWVudFdpdGggPSBzdHlsZS5ncmFkaWVudFdpdGgsXG4gICAgICBncmFkaWVudFN0b3BzID0gc3R5bGUuZ3JhZGllbnRTdG9wcztcbiAgaWYgKCFncmFkaWVudENvbG9yIHx8ICFncmFkaWVudFBhcmFtcykgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChncmFkaWVudENvbG9yLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbnNvbGUud2FybignVGhlIGdyYWRpZW50IG5lZWRzIHRvIHByb3ZpZGUgYXQgbGVhc3QgdHdvIGNvbG9ycycpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChncmFkaWVudFR5cGUgIT09ICdsaW5lYXInICYmIGdyYWRpZW50VHlwZSAhPT0gJ3JhZGlhbCcpIHtcbiAgICBjb25zb2xlLndhcm4oJ0dyYWRpZW50VHlwZSBvbmx5IHN1cHBvcnRzIGxpbmVhciBvciByYWRpYWwsIGN1cnJlbnQgdmFsdWUgaXMgJyArIGdyYWRpZW50VHlwZSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGdyYWRpZW50UGFyYW1zTGVuZ3RoID0gZ3JhZGllbnRQYXJhbXMubGVuZ3RoO1xuXG4gIGlmIChncmFkaWVudFR5cGUgPT09ICdsaW5lYXInICYmIGdyYWRpZW50UGFyYW1zTGVuZ3RoICE9PSA0IHx8IGdyYWRpZW50VHlwZSA9PT0gJ3JhZGlhbCcgJiYgZ3JhZGllbnRQYXJhbXNMZW5ndGggIT09IDYpIHtcbiAgICBjb25zb2xlLndhcm4oJ1RoZSBleHBlY3RlZCBsZW5ndGggb2YgZ3JhZGllbnRQYXJhbXMgaXMgJyArIChncmFkaWVudFR5cGUgPT09ICdsaW5lYXInID8gJzQnIDogJzYnKSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50V2l0aCAhPT0gJ2ZpbGwnICYmIGdyYWRpZW50V2l0aCAhPT0gJ3N0cm9rZScpIHtcbiAgICBjb25zb2xlLndhcm4oJ0dyYWRpZW50V2l0aCBvbmx5IHN1cHBvcnRzIGZpbGwgb3Igc3Ryb2tlLCBjdXJyZW50IHZhbHVlIGlzICcgKyBncmFkaWVudFdpdGgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChncmFkaWVudFN0b3BzICE9PSAnYXV0bycgJiYgIShncmFkaWVudFN0b3BzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS53YXJuKFwiZ3JhZGllbnRTdG9wcyBvbmx5IHN1cHBvcnRzICdhdXRvJyBvciBOdW1iZXIgQXJyYXkgKFswLCAuNSwgMV0pLCBjdXJyZW50IHZhbHVlIGlzIFwiICsgZ3JhZGllbnRTdG9wcyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCBhIHVuaWZvcm0gZ3JhZGllbnQgY29sb3Igc3RvcFxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb2xvciBHcmFkaWVudCBjb2xvclxyXG4gKiBAcmV0dXJuIHtBcnJheX0gR3JhZGllbnQgY29sb3Igc3RvcFxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRBdXRvQ29sb3JTdG9wcyhjb2xvcikge1xuICB2YXIgc3RvcEdhcCA9IDEgLyAoY29sb3IubGVuZ3RoIC0gMSk7XG4gIHJldHVybiBjb2xvci5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBzdG9wR2FwICogaTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFJlc3RvcmUgY2FudmFzIGN0eCB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgQ29udGV4dCBvZiBjYW52YXNcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cblN0eWxlLnByb3RvdHlwZS5yZXN0b3JlVHJhbnNmb3JtID0gZnVuY3Rpb24gKGN0eCkge1xuICBjdHgucmVzdG9yZSgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gVXBkYXRlIHN0eWxlIGRhdGFcclxuICogQHBhcmFtIHtPYmplY3R9IGNoYW5nZSBDaGFuZ2VkIGRhdGFcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cblN0eWxlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoY2hhbmdlKSB7XG4gIHRoaXMuY29sb3JQcm9jZXNzb3IoY2hhbmdlKTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBjaGFuZ2UpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjdXJyZW50IHN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICogQHJldHVybiB7T2JqZWN0fSBTdHlsZSBjb25maWd1cmF0aW9uXHJcbiAqL1xuXG5cblN0eWxlLnByb3RvdHlwZS5nZXRTdHlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNsb25lZFN0eWxlID0gKDAsIF91dGlsLmRlZXBDbG9uZSkodGhpcywgdHJ1ZSk7XG4gIHRoaXMuY29sb3JQcm9jZXNzb3IoY2xvbmVkU3R5bGUsIHRydWUpO1xuICByZXR1cm4gY2xvbmVkU3R5bGU7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZXh0ZW5kTmV3R3JhcGggPSBleHRlbmROZXdHcmFwaDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZXhwb3J0cy50ZXh0ID0gZXhwb3J0cy5iZXppZXJDdXJ2ZSA9IGV4cG9ydHMuc21vb3RobGluZSA9IGV4cG9ydHMucG9seWxpbmUgPSBleHBvcnRzLnJlZ1BvbHlnb24gPSBleHBvcnRzLnNlY3RvciA9IGV4cG9ydHMuYXJjID0gZXhwb3J0cy5yaW5nID0gZXhwb3J0cy5yZWN0ID0gZXhwb3J0cy5lbGxpcHNlID0gZXhwb3J0cy5jaXJjbGUgPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2JlemllckN1cnZlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvYmV6aWVyLWN1cnZlXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NhbnZhcyA9IHJlcXVpcmUoXCIuLi9wbHVnaW4vY2FudmFzXCIpO1xuXG52YXIgcG9seWxpbmVUb0JlemllckN1cnZlID0gX2JlemllckN1cnZlMltcImRlZmF1bHRcIl0ucG9seWxpbmVUb0JlemllckN1cnZlLFxuICAgIGJlemllckN1cnZlVG9Qb2x5bGluZSA9IF9iZXppZXJDdXJ2ZTJbXCJkZWZhdWx0XCJdLmJlemllckN1cnZlVG9Qb2x5bGluZTtcbnZhciBjaXJjbGUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZi5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiByICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignQ2lyY2xlIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjIsIF9yZWYzKSB7XG4gICAgdmFyIGN0eCA9IF9yZWYyLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMy5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuICAgIGN0eC5hcmMocngsIHJ5LCByID4gMCA/IHIgOiAwLjAxLCAwLCBNYXRoLlBJICogMik7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmNCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0LnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcbiAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luQ2lyY2xlKShwb3NpdGlvbiwgcngsIHJ5LCByKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjUuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjUuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNiwgX3JlZjcpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjYubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNi5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjcuc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5jaXJjbGUgPSBjaXJjbGU7XG52YXIgZWxsaXBzZSA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICBocjogMCxcbiAgICB2cjogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmOCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY4LnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICBociA9IHNoYXBlLmhyLFxuICAgICAgICB2ciA9IHNoYXBlLnZyO1xuXG4gICAgaWYgKHR5cGVvZiByeCAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHJ5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgaHIgIT09ICdudW1iZXInIHx8IHR5cGVvZiB2ciAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0VsbGlwc2Ugc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmOSwgX3JlZjEwKSB7XG4gICAgdmFyIGN0eCA9IF9yZWY5LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTAuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICBociA9IHNoYXBlLmhyLFxuICAgICAgICB2ciA9IHNoYXBlLnZyO1xuICAgIGN0eC5lbGxpcHNlKHJ4LCByeSwgaHIgPiAwID8gaHIgOiAwLjAxLCB2ciA+IDAgPyB2ciA6IDAuMDEsIDAsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYxMSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMS5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgaHIgPSBzaGFwZS5ocixcbiAgICAgICAgdnIgPSBzaGFwZS52cjtcbiAgICB2YXIgYSA9IE1hdGgubWF4KGhyLCB2cik7XG4gICAgdmFyIGIgPSBNYXRoLm1pbihociwgdnIpO1xuICAgIHZhciBjID0gTWF0aC5zcXJ0KGEgKiBhIC0gYiAqIGIpO1xuICAgIHZhciBsZWZ0Rm9jdXNQb2ludCA9IFtyeCAtIGMsIHJ5XTtcbiAgICB2YXIgcmlnaHRGb2N1c1BvaW50ID0gW3J4ICsgYywgcnldO1xuICAgIHZhciBkaXN0YW5jZSA9ICgwLCBfdXRpbC5nZXRUd29Qb2ludERpc3RhbmNlKShwb3NpdGlvbiwgbGVmdEZvY3VzUG9pbnQpICsgKDAsIF91dGlsLmdldFR3b1BvaW50RGlzdGFuY2UpKHBvc2l0aW9uLCByaWdodEZvY3VzUG9pbnQpO1xuICAgIHJldHVybiBkaXN0YW5jZSA8PSAyICogYTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYxMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMi5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMTIuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmMTMsIF9yZWYxNCkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmMTMubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmMTMubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWYxNC5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHNoYXBlLnJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHNoYXBlLnJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmVsbGlwc2UgPSBlbGxpcHNlO1xudmFyIHJlY3QgPSB7XG4gIHNoYXBlOiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHc6IDAsXG4gICAgaDogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMTUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTUuc2hhcGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuXG4gICAgaWYgKHR5cGVvZiB4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHcgIT09ICdudW1iZXInIHx8IHR5cGVvZiBoICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignUmVjdCBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYxNiwgX3JlZjE3KSB7XG4gICAgdmFyIGN0eCA9IF9yZWYxNi5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE3LnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgY3R4LnJlY3QoeCwgeSwgdywgaCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMTgpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTguc2hhcGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5SZWN0KShwb3NpdGlvbiwgeCwgeSwgdywgaCk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMTkpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTkuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjE5LnN0eWxlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFt4ICsgdyAvIDIsIHkgKyBoIC8gMl07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjIwLCBfcmVmMjEpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjIwLm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjIwLm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjEuc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHg6IHNoYXBlLnggKyBtb3ZlbWVudFgsXG4gICAgICB5OiBzaGFwZS55ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnJlY3QgPSByZWN0O1xudmFyIHJpbmcgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMjIpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjIuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuXG4gICAgaWYgKHR5cGVvZiByeCAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHJ5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgciAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Jpbmcgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMjMsIF9yZWYyNCkge1xuICAgIHZhciBjdHggPSBfcmVmMjMuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYyNC5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuICAgIGN0eC5hcmMocngsIHJ5LCByID4gMCA/IHIgOiAwLjAxLCAwLCBNYXRoLlBJICogMik7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjI1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI1LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYyNS5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcbiAgICB2YXIgaGFsZkxpbmVXaWR0aCA9IGxpbmVXaWR0aCAvIDI7XG4gICAgdmFyIG1pbkRpc3RhbmNlID0gciAtIGhhbGZMaW5lV2lkdGg7XG4gICAgdmFyIG1heERpc3RhbmNlID0gciArIGhhbGZMaW5lV2lkdGg7XG4gICAgdmFyIGRpc3RhbmNlID0gKDAsIF91dGlsLmdldFR3b1BvaW50RGlzdGFuY2UpKHBvc2l0aW9uLCBbcngsIHJ5XSk7XG4gICAgcmV0dXJuIGRpc3RhbmNlID49IG1pbkRpc3RhbmNlICYmIGRpc3RhbmNlIDw9IG1heERpc3RhbmNlO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjI2KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI2LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYyNi5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWYyNywgX3JlZjI4KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWYyNy5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWYyNy5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI4LnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogc2hhcGUucnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogc2hhcGUucnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMucmluZyA9IHJpbmc7XG52YXIgYXJjID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDAsXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICBlbmRBbmdsZTogMCxcbiAgICBjbG9ja1dpc2U6IHRydWVcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjI5KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI5LnNoYXBlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdyJywgJ3N0YXJ0QW5nbGUnLCAnZW5kQW5nbGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignQXJjIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjMwLCBfcmVmMzEpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjMwLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzEuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICBjdHguYXJjKHJ4LCByeSwgciA+IDAgPyByIDogMC4wMDEsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCAhY2xvY2tXaXNlKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMzIpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzIuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjMyLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuICAgIHZhciBoYWxmTGluZVdpZHRoID0gbGluZVdpZHRoIC8gMjtcbiAgICB2YXIgaW5zaWRlUmFkaXVzID0gciAtIGhhbGZMaW5lV2lkdGg7XG4gICAgdmFyIG91dHNpZGVSYWRpdXMgPSByICsgaGFsZkxpbmVXaWR0aDtcbiAgICByZXR1cm4gISgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgaW5zaWRlUmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY2xvY2tXaXNlKSAmJiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5TZWN0b3IpKHBvc2l0aW9uLCByeCwgcnksIG91dHNpZGVSYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjMzKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjMzLnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYzMy5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWYzNCwgX3JlZjM1KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWYzNC5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWYzNC5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjM1LnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogc2hhcGUucnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogc2hhcGUucnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuYXJjID0gYXJjO1xudmFyIHNlY3RvciA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwLFxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgZW5kQW5nbGU6IDAsXG4gICAgY2xvY2tXaXNlOiB0cnVlXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYzNikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzNi5zaGFwZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAncicsICdzdGFydEFuZ2xlJywgJ2VuZEFuZ2xlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1NlY3RvciBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYzNywgX3JlZjM4KSB7XG4gICAgdmFyIGN0eCA9IF9yZWYzNy5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjM4LnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCAhY2xvY2tXaXNlKTtcbiAgICBjdHgubGluZVRvKHJ4LCByeSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMzkpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzkuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5TZWN0b3IpKHBvc2l0aW9uLCByeCwgcnksIHIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjQwKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQwLnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY0MC5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY0MSwgX3JlZjQyKSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY0MS5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY0MS5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQyLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogcnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogcnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuc2VjdG9yID0gc2VjdG9yO1xudmFyIHJlZ1BvbHlnb24gPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzaWRlOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY0Mykge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0My5zaGFwZTtcbiAgICB2YXIgc2lkZSA9IHNoYXBlLnNpZGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc2lkZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZWdQb2x5Z29uIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNpZGUgPCAzKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZWdQb2x5Z29uIGF0IGxlYXN0IHRyaWdvbiEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNDQsIF9yZWY0NSkge1xuICAgIHZhciBjdHggPSBfcmVmNDQuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY0NS5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNDUuY2FjaGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc2lkZSA9IHNoYXBlLnNpZGU7XG5cbiAgICBpZiAoIWNhY2hlLnBvaW50cyB8fCBjYWNoZS5yeCAhPT0gcnggfHwgY2FjaGUucnkgIT09IHJ5IHx8IGNhY2hlLnIgIT09IHIgfHwgY2FjaGUuc2lkZSAhPT0gc2lkZSkge1xuICAgICAgdmFyIF9wb2ludHMgPSAoMCwgX3V0aWwuZ2V0UmVndWxhclBvbHlnb25Qb2ludHMpKHJ4LCByeSwgciwgc2lkZSk7XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiBfcG9pbnRzLFxuICAgICAgICByeDogcngsXG4gICAgICAgIHJ5OiByeSxcbiAgICAgICAgcjogcixcbiAgICAgICAgc2lkZTogc2lkZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHBvaW50cyA9IGNhY2hlLnBvaW50cztcbiAgICAoMCwgX2NhbnZhcy5kcmF3UG9seWxpbmVQYXRoKShjdHgsIHBvaW50cyk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmNDYpIHtcbiAgICB2YXIgY2FjaGUgPSBfcmVmNDYuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IGNhY2hlLnBvaW50cztcbiAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUG9seWdvbikocG9zaXRpb24sIHBvaW50cyk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNDcpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDcuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjQ3LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjQ4LCBfcmVmNDkpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjQ4Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjQ4Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDkuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjQ5LmNhY2hlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIGNhY2hlLnJ4ICs9IG1vdmVtZW50WDtcbiAgICBjYWNoZS5yeSArPSBtb3ZlbWVudFk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiByeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiByeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICAgIGNhY2hlLnBvaW50cyA9IGNhY2hlLnBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY1MCkge1xuICAgICAgdmFyIF9yZWY1MSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNTAsIDIpLFxuICAgICAgICAgIHggPSBfcmVmNTFbMF0sXG4gICAgICAgICAgeSA9IF9yZWY1MVsxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMucmVnUG9seWdvbiA9IHJlZ1BvbHlnb247XG52YXIgcG9seWxpbmUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcG9pbnRzOiBbXSxcbiAgICBjbG9zZTogZmFsc2VcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjUyKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjUyLnNoYXBlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG5cbiAgICBpZiAoIShwb2ludHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BvbHlsaW5lIHBvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjUzLCBfcmVmNTQpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjUzLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTQuc2hhcGUsXG4gICAgICAgIGxpbmVXaWR0aCA9IF9yZWY1NC5zdHlsZS5saW5lV2lkdGg7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHMsXG4gICAgICAgIGNsb3NlID0gc2hhcGUuY2xvc2U7XG4gICAgaWYgKGxpbmVXaWR0aCA9PT0gMSkgcG9pbnRzID0gKDAsIF91dGlsLmVsaW1pbmF0ZUJsdXIpKHBvaW50cyk7XG4gICAgKDAsIF9jYW52YXMuZHJhd1BvbHlsaW5lUGF0aCkoY3R4LCBwb2ludHMpO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmNTUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTUuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjU1LnN0eWxlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHMsXG4gICAgICAgIGNsb3NlID0gc2hhcGUuY2xvc2U7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblBvbHlnb24pKHBvc2l0aW9uLCBwb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSkocG9zaXRpb24sIHBvaW50cywgbGluZVdpZHRoKTtcbiAgICB9XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNTYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTYuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjU2LnN0eWxlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBwb2ludHNbMF07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjU3LCBfcmVmNTgpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjU3Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjU3Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTguc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICB2YXIgbW92ZUFmdGVyUG9pbnRzID0gcG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjU5KSB7XG4gICAgICB2YXIgX3JlZjYwID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1OSwgMiksXG4gICAgICAgICAgeCA9IF9yZWY2MFswXSxcbiAgICAgICAgICB5ID0gX3JlZjYwWzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICBwb2ludHM6IG1vdmVBZnRlclBvaW50c1xuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5wb2x5bGluZSA9IHBvbHlsaW5lO1xudmFyIHNtb290aGxpbmUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcG9pbnRzOiBbXSxcbiAgICBjbG9zZTogZmFsc2VcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjYxKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjYxLnNoYXBlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG5cbiAgICBpZiAoIShwb2ludHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Ntb290aGxpbmUgcG9pbnRzIHNob3VsZCBiZSBhbiBhcnJheSEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNjIsIF9yZWY2Mykge1xuICAgIHZhciBjdHggPSBfcmVmNjIuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY2My5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNjMuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcblxuICAgIGlmICghY2FjaGUucG9pbnRzIHx8IGNhY2hlLnBvaW50cy50b1N0cmluZygpICE9PSBwb2ludHMudG9TdHJpbmcoKSkge1xuICAgICAgdmFyIF9iZXppZXJDdXJ2ZSA9IHBvbHlsaW5lVG9CZXppZXJDdXJ2ZShwb2ludHMsIGNsb3NlKTtcblxuICAgICAgdmFyIGhvdmVyUG9pbnRzID0gYmV6aWVyQ3VydmVUb1BvbHlsaW5lKF9iZXppZXJDdXJ2ZSk7XG4gICAgICBPYmplY3QuYXNzaWduKGNhY2hlLCB7XG4gICAgICAgIHBvaW50czogKDAsIF91dGlsLmRlZXBDbG9uZSkocG9pbnRzLCB0cnVlKSxcbiAgICAgICAgYmV6aWVyQ3VydmU6IF9iZXppZXJDdXJ2ZSxcbiAgICAgICAgaG92ZXJQb2ludHM6IGhvdmVyUG9pbnRzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgYmV6aWVyQ3VydmUgPSBjYWNoZS5iZXppZXJDdXJ2ZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgKDAsIF9jYW52YXMuZHJhd0JlemllckN1cnZlUGF0aCkoY3R4LCBiZXppZXJDdXJ2ZS5zbGljZSgxKSwgYmV6aWVyQ3VydmVbMF0pO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmNjQpIHtcbiAgICB2YXIgY2FjaGUgPSBfcmVmNjQuY2FjaGUsXG4gICAgICAgIHNoYXBlID0gX3JlZjY0LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY2NC5zdHlsZTtcbiAgICB2YXIgaG92ZXJQb2ludHMgPSBjYWNoZS5ob3ZlclBvaW50cztcbiAgICB2YXIgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUG9seWdvbikocG9zaXRpb24sIGhvdmVyUG9pbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNOZWFyUG9seWxpbmUpKHBvc2l0aW9uLCBob3ZlclBvaW50cywgbGluZVdpZHRoKTtcbiAgICB9XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNjUuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjY1LnN0eWxlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBwb2ludHNbMF07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjY2LCBfcmVmNjcpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjY2Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjY2Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNjcuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjY3LmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG4gICAgdmFyIG1vdmVBZnRlclBvaW50cyA9IHBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY2OCkge1xuICAgICAgdmFyIF9yZWY2OSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNjgsIDIpLFxuICAgICAgICAgIHggPSBfcmVmNjlbMF0sXG4gICAgICAgICAgeSA9IF9yZWY2OVsxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgICBjYWNoZS5wb2ludHMgPSBtb3ZlQWZ0ZXJQb2ludHM7XG5cbiAgICB2YXIgX2NhY2hlJGJlemllckN1cnZlJCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShjYWNoZS5iZXppZXJDdXJ2ZVswXSwgMiksXG4gICAgICAgIGZ4ID0gX2NhY2hlJGJlemllckN1cnZlJFswXSxcbiAgICAgICAgZnkgPSBfY2FjaGUkYmV6aWVyQ3VydmUkWzFdO1xuXG4gICAgdmFyIGN1cnZlcyA9IGNhY2hlLmJlemllckN1cnZlLnNsaWNlKDEpO1xuICAgIGNhY2hlLmJlemllckN1cnZlID0gW1tmeCArIG1vdmVtZW50WCwgZnkgKyBtb3ZlbWVudFldXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjdXJ2ZXMubWFwKGZ1bmN0aW9uIChjdXJ2ZSkge1xuICAgICAgcmV0dXJuIGN1cnZlLm1hcChmdW5jdGlvbiAoX3JlZjcwKSB7XG4gICAgICAgIHZhciBfcmVmNzEgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjcwLCAyKSxcbiAgICAgICAgICAgIHggPSBfcmVmNzFbMF0sXG4gICAgICAgICAgICB5ID0gX3JlZjcxWzFdO1xuXG4gICAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgICB9KTtcbiAgICB9KSkpO1xuICAgIGNhY2hlLmhvdmVyUG9pbnRzID0gY2FjaGUuaG92ZXJQb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmNzIpIHtcbiAgICAgIHZhciBfcmVmNzMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjcyLCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjczWzBdLFxuICAgICAgICAgIHkgPSBfcmVmNzNbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvaW50czogbW92ZUFmdGVyUG9pbnRzXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnNtb290aGxpbmUgPSBzbW9vdGhsaW5lO1xudmFyIGJlemllckN1cnZlID0ge1xuICBzaGFwZToge1xuICAgIHBvaW50czogW10sXG4gICAgY2xvc2U6IGZhbHNlXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY3NCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY3NC5zaGFwZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuXG4gICAgaWYgKCEocG9pbnRzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdCZXppZXJDdXJ2ZSBwb2ludHMgc2hvdWxkIGJlIGFuIGFycmF5IScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY3NSwgX3JlZjc2KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY3NS5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc2LnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY3Ni5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzLFxuICAgICAgICBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuXG4gICAgaWYgKCFjYWNoZS5wb2ludHMgfHwgY2FjaGUucG9pbnRzLnRvU3RyaW5nKCkgIT09IHBvaW50cy50b1N0cmluZygpKSB7XG4gICAgICB2YXIgaG92ZXJQb2ludHMgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmUocG9pbnRzLCAyMCk7XG4gICAgICBPYmplY3QuYXNzaWduKGNhY2hlLCB7XG4gICAgICAgIHBvaW50czogKDAsIF91dGlsLmRlZXBDbG9uZSkocG9pbnRzLCB0cnVlKSxcbiAgICAgICAgaG92ZXJQb2ludHM6IGhvdmVyUG9pbnRzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgKDAsIF9jYW52YXMuZHJhd0JlemllckN1cnZlUGF0aCkoY3R4LCBwb2ludHMuc2xpY2UoMSksIHBvaW50c1swXSk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY3Nykge1xuICAgIHZhciBjYWNoZSA9IF9yZWY3Ny5jYWNoZSxcbiAgICAgICAgc2hhcGUgPSBfcmVmNzcuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjc3LnN0eWxlO1xuICAgIHZhciBob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzO1xuICAgIHZhciBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgaG92ZXJQb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSkocG9zaXRpb24sIGhvdmVyUG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY3OCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY3OC5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNzguc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNzksIF9yZWY4MCkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNzkubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNzkubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY4MC5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmODAuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIHZhciBfcG9pbnRzJCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludHNbMF0sIDIpLFxuICAgICAgICBmeCA9IF9wb2ludHMkWzBdLFxuICAgICAgICBmeSA9IF9wb2ludHMkWzFdO1xuXG4gICAgdmFyIGN1cnZlcyA9IHBvaW50cy5zbGljZSgxKTtcbiAgICB2YXIgYmV6aWVyQ3VydmUgPSBbW2Z4ICsgbW92ZW1lbnRYLCBmeSArIG1vdmVtZW50WV1dLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGN1cnZlcy5tYXAoZnVuY3Rpb24gKGN1cnZlKSB7XG4gICAgICByZXR1cm4gY3VydmUubWFwKGZ1bmN0aW9uIChfcmVmODEpIHtcbiAgICAgICAgdmFyIF9yZWY4MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmODEsIDIpLFxuICAgICAgICAgICAgeCA9IF9yZWY4MlswXSxcbiAgICAgICAgICAgIHkgPSBfcmVmODJbMV07XG5cbiAgICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICAgIH0pO1xuICAgIH0pKSk7XG4gICAgY2FjaGUucG9pbnRzID0gYmV6aWVyQ3VydmU7XG4gICAgY2FjaGUuaG92ZXJQb2ludHMgPSBjYWNoZS5ob3ZlclBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY4Mykge1xuICAgICAgdmFyIF9yZWY4NCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmODMsIDIpLFxuICAgICAgICAgIHggPSBfcmVmODRbMF0sXG4gICAgICAgICAgeSA9IF9yZWY4NFsxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcG9pbnRzOiBiZXppZXJDdXJ2ZVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5iZXppZXJDdXJ2ZSA9IGJlemllckN1cnZlO1xudmFyIHRleHQgPSB7XG4gIHNoYXBlOiB7XG4gICAgY29udGVudDogJycsXG4gICAgcG9zaXRpb246IFtdLFxuICAgIG1heFdpZHRoOiB1bmRlZmluZWQsXG4gICAgcm93R2FwOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY4NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY4NS5zaGFwZTtcbiAgICB2YXIgY29udGVudCA9IHNoYXBlLmNvbnRlbnQsXG4gICAgICAgIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb24sXG4gICAgICAgIHJvd0dhcCA9IHNoYXBlLnJvd0dhcDtcblxuICAgIGlmICh0eXBlb2YgY29udGVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RleHQgY29udGVudCBzaG91bGQgYmUgYSBzdHJpbmchJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCEocG9zaXRpb24gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RleHQgcG9zaXRpb24gc2hvdWxkIGJlIGFuIGFycmF5IScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygcm93R2FwICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCByb3dHYXAgc2hvdWxkIGJlIGEgbnVtYmVyIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY4NiwgX3JlZjg3KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY4Ni5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjg3LnNoYXBlO1xuICAgIHZhciBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbixcbiAgICAgICAgbWF4V2lkdGggPSBzaGFwZS5tYXhXaWR0aCxcbiAgICAgICAgcm93R2FwID0gc2hhcGUucm93R2FwO1xuICAgIHZhciB0ZXh0QmFzZWxpbmUgPSBjdHgudGV4dEJhc2VsaW5lLFxuICAgICAgICBmb250ID0gY3R4LmZvbnQ7XG4gICAgdmFyIGZvbnRTaXplID0gcGFyc2VJbnQoZm9udC5yZXBsYWNlKC9cXEQvZywgJycpKTtcblxuICAgIHZhciBfcG9zaXRpb24gPSBwb3NpdGlvbixcbiAgICAgICAgX3Bvc2l0aW9uMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcG9zaXRpb24sIDIpLFxuICAgICAgICB4ID0gX3Bvc2l0aW9uMlswXSxcbiAgICAgICAgeSA9IF9wb3NpdGlvbjJbMV07XG5cbiAgICBjb250ZW50ID0gY29udGVudC5zcGxpdCgnXFxuJyk7XG4gICAgdmFyIHJvd051bSA9IGNvbnRlbnQubGVuZ3RoO1xuICAgIHZhciBsaW5lSGVpZ2h0ID0gZm9udFNpemUgKyByb3dHYXA7XG4gICAgdmFyIGFsbEhlaWdodCA9IHJvd051bSAqIGxpbmVIZWlnaHQgLSByb3dHYXA7XG4gICAgdmFyIG9mZnNldCA9IDA7XG5cbiAgICBpZiAodGV4dEJhc2VsaW5lID09PSAnbWlkZGxlJykge1xuICAgICAgb2Zmc2V0ID0gYWxsSGVpZ2h0IC8gMjtcbiAgICAgIHkgKz0gZm9udFNpemUgLyAyO1xuICAgIH1cblxuICAgIGlmICh0ZXh0QmFzZWxpbmUgPT09ICdib3R0b20nKSB7XG4gICAgICBvZmZzZXQgPSBhbGxIZWlnaHQ7XG4gICAgICB5ICs9IGZvbnRTaXplO1xuICAgIH1cblxuICAgIHBvc2l0aW9uID0gbmV3IEFycmF5KHJvd051bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgICAgcmV0dXJuIFt4LCB5ICsgaSAqIGxpbmVIZWlnaHQgLSBvZmZzZXRdO1xuICAgIH0pO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjb250ZW50LmZvckVhY2goZnVuY3Rpb24gKHRleHQsIGkpIHtcbiAgICAgIGN0eC5maWxsVGV4dC5hcHBseShjdHgsIFt0ZXh0XS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3NpdGlvbltpXSksIFttYXhXaWR0aF0pKTtcbiAgICAgIGN0eC5zdHJva2VUZXh0LmFwcGx5KGN0eCwgW3RleHRdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uW2ldKSwgW21heFdpZHRoXSkpO1xuICAgIH0pO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjg4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjg4LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY4OC5zdHlsZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmODkpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODkuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjg5LnN0eWxlO1xuICAgIHZhciBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3NpdGlvbik7XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjkwLCBfcmVmOTEpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjkwLm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjkwLm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmOTEuc2hhcGU7XG5cbiAgICB2YXIgX3NoYXBlJHBvc2l0aW9uID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHNoYXBlLnBvc2l0aW9uLCAyKSxcbiAgICAgICAgeCA9IF9zaGFwZSRwb3NpdGlvblswXSxcbiAgICAgICAgeSA9IF9zaGFwZSRwb3NpdGlvblsxXTtcblxuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICBwb3NpdGlvbjogW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnRleHQgPSB0ZXh0O1xudmFyIGdyYXBocyA9IG5ldyBNYXAoW1snY2lyY2xlJywgY2lyY2xlXSwgWydlbGxpcHNlJywgZWxsaXBzZV0sIFsncmVjdCcsIHJlY3RdLCBbJ3JpbmcnLCByaW5nXSwgWydhcmMnLCBhcmNdLCBbJ3NlY3RvcicsIHNlY3Rvcl0sIFsncmVnUG9seWdvbicsIHJlZ1BvbHlnb25dLCBbJ3BvbHlsaW5lJywgcG9seWxpbmVdLCBbJ3Ntb290aGxpbmUnLCBzbW9vdGhsaW5lXSwgWydiZXppZXJDdXJ2ZScsIGJlemllckN1cnZlXSwgWyd0ZXh0JywgdGV4dF1dKTtcbnZhciBfZGVmYXVsdCA9IGdyYXBocztcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRXh0ZW5kIG5ldyBncmFwaFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAgIE5hbWUgb2YgR3JhcGhcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBDb25maWd1cmF0aW9uIG9mIEdyYXBoXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDtcblxuZnVuY3Rpb24gZXh0ZW5kTmV3R3JhcGgobmFtZSwgY29uZmlnKSB7XG4gIGlmICghbmFtZSB8fCAhY29uZmlnKSB7XG4gICAgY29uc29sZS5lcnJvcignRXh0ZW5kTmV3R3JhcGggTWlzc2luZyBQYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY29uZmlnLnNoYXBlKSB7XG4gICAgY29uc29sZS5lcnJvcignUmVxdWlyZWQgYXR0cmlidXRlIG9mIHNoYXBlIHRvIGV4dGVuZE5ld0dyYXBoIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY29uZmlnLnZhbGlkYXRvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1JlcXVpcmVkIGZ1bmN0aW9uIG9mIHZhbGlkYXRvciB0byBleHRlbmROZXdHcmFwaCEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbmZpZy5kcmF3KSB7XG4gICAgY29uc29sZS5lcnJvcignUmVxdWlyZWQgZnVuY3Rpb24gb2YgZHJhdyB0byBleHRlbmROZXdHcmFwaCEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBncmFwaHMuc2V0KG5hbWUsIGNvbmZpZyk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQ1JlbmRlclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfY3JlbmRlcltcImRlZmF1bHRcIl07XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZXh0ZW5kTmV3R3JhcGhcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dyYXBocy5leHRlbmROZXdHcmFwaDtcbiAgfVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9jcmVuZGVyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jbGFzcy9jcmVuZGVyLmNsYXNzXCIpKTtcblxudmFyIF9ncmFwaHMgPSByZXF1aXJlKFwiLi9jb25maWcvZ3JhcGhzXCIpO1xuXG52YXIgX2RlZmF1bHQgPSBfY3JlbmRlcltcImRlZmF1bHRcIl07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZHJhd1BvbHlsaW5lUGF0aCA9IGRyYXdQb2x5bGluZVBhdGg7XG5leHBvcnRzLmRyYXdCZXppZXJDdXJ2ZVBhdGggPSBkcmF3QmV6aWVyQ3VydmVQYXRoO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRHJhdyBhIHBvbHlsaW5lIHBhdGhcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgICAgICAgQ2FudmFzIDJkIGNvbnRleHRcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzICAgICAgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtCb29sZWFufSBiZWdpblBhdGggV2hldGhlciB0byBleGVjdXRlIGJlZ2luUGF0aFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgY2xvc2VQYXRoXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cbmZ1bmN0aW9uIGRyYXdQb2x5bGluZVBhdGgoY3R4LCBwb2ludHMpIHtcbiAgdmFyIGJlZ2luUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBjbG9zZVBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuICBpZiAoIWN0eCB8fCBwb2ludHMubGVuZ3RoIDwgMikgcmV0dXJuIGZhbHNlO1xuICBpZiAoYmVnaW5QYXRoKSBjdHguYmVnaW5QYXRoKCk7XG4gIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCwgaSkge1xuICAgIHJldHVybiBwb2ludCAmJiAoaSA9PT0gMCA/IGN0eC5tb3ZlVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvaW50KSkgOiBjdHgubGluZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCkpKTtcbiAgfSk7XG4gIGlmIChjbG9zZVBhdGgpIGN0eC5jbG9zZVBhdGgoKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRHJhdyBhIGJlemllciBjdXJ2ZSBwYXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggICAgICAgIENhbnZhcyAyZCBjb250ZXh0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyAgICAgIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBtb3ZlVG8gICAgICBUaGUgcG9pbnQgbmVlZCB0byBleGN1dGUgbW92ZVRvXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYmVnaW5QYXRoIFdoZXRoZXIgdG8gZXhlY3V0ZSBiZWdpblBhdGhcclxuICogQHBhcmFtIHtCb29sZWFufSBjbG9zZVBhdGggV2hldGhlciB0byBleGVjdXRlIGNsb3NlUGF0aFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gZHJhd0JlemllckN1cnZlUGF0aChjdHgsIHBvaW50cykge1xuICB2YXIgbW92ZVRvID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIGJlZ2luUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG4gIHZhciBjbG9zZVBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IGZhbHNlO1xuICBpZiAoIWN0eCB8fCAhcG9pbnRzKSByZXR1cm4gZmFsc2U7XG4gIGlmIChiZWdpblBhdGgpIGN0eC5iZWdpblBhdGgoKTtcbiAgaWYgKG1vdmVUbykgY3R4Lm1vdmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobW92ZVRvKSk7XG4gIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0gJiYgY3R4LmJlemllckN1cnZlVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGl0ZW1bMF0pLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGl0ZW1bMV0pLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGl0ZW1bMl0pKSk7XG4gIH0pO1xuICBpZiAoY2xvc2VQYXRoKSBjdHguY2xvc2VQYXRoKCk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHtcbiAgZHJhd1BvbHlsaW5lUGF0aDogZHJhd1BvbHlsaW5lUGF0aCxcbiAgZHJhd0JlemllckN1cnZlUGF0aDogZHJhd0JlemllckN1cnZlUGF0aFxufTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWVwQ2xvbmUgPSBkZWVwQ2xvbmU7XG5leHBvcnRzLmVsaW1pbmF0ZUJsdXIgPSBlbGltaW5hdGVCbHVyO1xuZXhwb3J0cy5jaGVja1BvaW50SXNJbkNpcmNsZSA9IGNoZWNrUG9pbnRJc0luQ2lyY2xlO1xuZXhwb3J0cy5nZXRUd29Qb2ludERpc3RhbmNlID0gZ2V0VHdvUG9pbnREaXN0YW5jZTtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5Qb2x5Z29uID0gY2hlY2tQb2ludElzSW5Qb2x5Z29uO1xuZXhwb3J0cy5jaGVja1BvaW50SXNJblNlY3RvciA9IGNoZWNrUG9pbnRJc0luU2VjdG9yO1xuZXhwb3J0cy5jaGVja1BvaW50SXNOZWFyUG9seWxpbmUgPSBjaGVja1BvaW50SXNOZWFyUG9seWxpbmU7XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luUmVjdCA9IGNoZWNrUG9pbnRJc0luUmVjdDtcbmV4cG9ydHMuZ2V0Um90YXRlUG9pbnRQb3MgPSBnZXRSb3RhdGVQb2ludFBvcztcbmV4cG9ydHMuZ2V0U2NhbGVQb2ludFBvcyA9IGdldFNjYWxlUG9pbnRQb3M7XG5leHBvcnRzLmdldFRyYW5zbGF0ZVBvaW50UG9zID0gZ2V0VHJhbnNsYXRlUG9pbnRQb3M7XG5leHBvcnRzLmdldERpc3RhbmNlQmV0d2VlblBvaW50QW5kTGluZSA9IGdldERpc3RhbmNlQmV0d2VlblBvaW50QW5kTGluZTtcbmV4cG9ydHMuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQgPSBnZXRDaXJjbGVSYWRpYW5Qb2ludDtcbmV4cG9ydHMuZ2V0UmVndWxhclBvbHlnb25Qb2ludHMgPSBnZXRSZWd1bGFyUG9seWdvblBvaW50cztcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgYWJzID0gTWF0aC5hYnMsXG4gICAgc3FydCA9IE1hdGguc3FydCxcbiAgICBzaW4gPSBNYXRoLnNpbixcbiAgICBjb3MgPSBNYXRoLmNvcyxcbiAgICBtYXggPSBNYXRoLm1heCxcbiAgICBtaW4gPSBNYXRoLm1pbixcbiAgICBQSSA9IE1hdGguUEk7XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENsb25lIGFuIG9iamVjdCBvciBhcnJheVxyXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqZWN0IENsb25lZCBvYmplY3RcclxuICogQHBhcmFtIHtCb29sZWFufSByZWN1cnNpb24gICBXaGV0aGVyIHRvIHVzZSByZWN1cnNpdmUgY2xvbmluZ1xyXG4gKiBAcmV0dXJuIHtPYmplY3R8QXJyYXl9IENsb25lIG9iamVjdFxyXG4gKi9cblxuZnVuY3Rpb24gZGVlcENsb25lKG9iamVjdCkge1xuICB2YXIgcmVjdXJzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgaWYgKCFvYmplY3QpIHJldHVybiBvYmplY3Q7XG4gIHZhciBwYXJzZSA9IEpTT04ucGFyc2UsXG4gICAgICBzdHJpbmdpZnkgPSBKU09OLnN0cmluZ2lmeTtcbiAgaWYgKCFyZWN1cnNpb24pIHJldHVybiBwYXJzZShzdHJpbmdpZnkob2JqZWN0KSk7XG4gIHZhciBjbG9uZWRPYmogPSBvYmplY3QgaW5zdGFuY2VvZiBBcnJheSA/IFtdIDoge307XG5cbiAgaWYgKG9iamVjdCAmJiAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShvYmplY3QpID09PSAnb2JqZWN0Jykge1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBpZiAob2JqZWN0W2tleV0gJiYgKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkob2JqZWN0W2tleV0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGNsb25lZE9ialtrZXldID0gZGVlcENsb25lKG9iamVjdFtrZXldLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbG9uZWRPYmpba2V5XSA9IG9iamVjdFtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNsb25lZE9iajtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRWxpbWluYXRlIGxpbmUgYmx1ciBkdWUgdG8gMXB4IGxpbmUgd2lkdGhcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzIExpbmUgcG9pbnRzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBMaW5lIHBvaW50cyBhZnRlciBwcm9jZXNzZWRcclxuICovXG5cblxuZnVuY3Rpb24gZWxpbWluYXRlQmx1cihwb2ludHMpIHtcbiAgcmV0dXJuIHBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgX3JlZjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZiwgMiksXG4gICAgICAgIHggPSBfcmVmMlswXSxcbiAgICAgICAgeSA9IF9yZWYyWzFdO1xuXG4gICAgcmV0dXJuIFtwYXJzZUludCh4KSArIDAuNSwgcGFyc2VJbnQoeSkgKyAwLjVdO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgY2lyY2xlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50IFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJ4ICAgQ2lyY2xlIHggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcnkgICBDaXJjbGUgeSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByICAgIENpcmNsZSByYWRpdXNcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc0luQ2lyY2xlKHBvaW50LCByeCwgcnksIHIpIHtcbiAgcmV0dXJuIGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnQsIFtyeCwgcnldKSA8PSByO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludDEgcG9pbnQxXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MiBwb2ludDJcclxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0VHdvUG9pbnREaXN0YW5jZShfcmVmMywgX3JlZjQpIHtcbiAgdmFyIF9yZWY1ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYzLCAyKSxcbiAgICAgIHhhID0gX3JlZjVbMF0sXG4gICAgICB5YSA9IF9yZWY1WzFdO1xuXG4gIHZhciBfcmVmNiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNCwgMiksXG4gICAgICB4YiA9IF9yZWY2WzBdLFxuICAgICAgeWIgPSBfcmVmNlsxXTtcblxuICB2YXIgbWludXNYID0gYWJzKHhhIC0geGIpO1xuICB2YXIgbWludXNZID0gYWJzKHlhIC0geWIpO1xuICByZXR1cm4gc3FydChtaW51c1ggKiBtaW51c1ggKyBtaW51c1kgKiBtaW51c1kpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBwb2x5Z29uXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyBUaGUgcG9pbnRzIHRoYXQgbWFrZXMgdXAgYSBwb2x5bGluZVxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKSB7XG4gIHZhciBjb3VudGVyID0gMDtcblxuICB2YXIgX3BvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnRbMF0sXG4gICAgICB5ID0gX3BvaW50WzFdO1xuXG4gIHZhciBwb2ludE51bSA9IHBvbHlnb24ubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAxLCBwMSA9IHBvbHlnb25bMF07IGkgPD0gcG9pbnROdW07IGkrKykge1xuICAgIHZhciBwMiA9IHBvbHlnb25baSAlIHBvaW50TnVtXTtcblxuICAgIGlmICh4ID4gbWluKHAxWzBdLCBwMlswXSkgJiYgeCA8PSBtYXgocDFbMF0sIHAyWzBdKSkge1xuICAgICAgaWYgKHkgPD0gbWF4KHAxWzFdLCBwMlsxXSkpIHtcbiAgICAgICAgaWYgKHAxWzBdICE9PSBwMlswXSkge1xuICAgICAgICAgIHZhciB4aW50ZXJzID0gKHggLSBwMVswXSkgKiAocDJbMV0gLSBwMVsxXSkgLyAocDJbMF0gLSBwMVswXSkgKyBwMVsxXTtcblxuICAgICAgICAgIGlmIChwMVsxXSA9PT0gcDJbMV0gfHwgeSA8PSB4aW50ZXJzKSB7XG4gICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcDEgPSBwMjtcbiAgfVxuXG4gIHJldHVybiBjb3VudGVyICUgMiA9PT0gMTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgc2VjdG9yXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJ4ICAgICAgICAgU2VjdG9yIHggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcnkgICAgICAgICBTZWN0b3IgeSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByICAgICAgICAgIFNlY3RvciByYWRpdXNcclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0QW5nbGUgU2VjdG9yIHN0YXJ0IGFuZ2xlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBlbmRBbmdsZSAgIFNlY3RvciBlbmQgYW5nbGVcclxuICogQHBhcmFtIHtCb29sZWFufSBjbG9ja1dpc2UgV2hldGhlciB0aGUgc2VjdG9yIGFuZ2xlIGlzIGNsb2Nrd2lzZVxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5TZWN0b3IocG9pbnQsIHJ4LCByeSwgciwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSkge1xuICBpZiAoIXBvaW50KSByZXR1cm4gZmFsc2U7XG4gIGlmIChnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50LCBbcngsIHJ5XSkgPiByKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKCFjbG9ja1dpc2UpIHtcbiAgICB2YXIgX2RlZXBDbG9uZSA9IGRlZXBDbG9uZShbZW5kQW5nbGUsIHN0YXJ0QW5nbGVdKTtcblxuICAgIHZhciBfZGVlcENsb25lMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZGVlcENsb25lLCAyKTtcblxuICAgIHN0YXJ0QW5nbGUgPSBfZGVlcENsb25lMlswXTtcbiAgICBlbmRBbmdsZSA9IF9kZWVwQ2xvbmUyWzFdO1xuICB9XG5cbiAgdmFyIHJldmVyc2VCRSA9IHN0YXJ0QW5nbGUgPiBlbmRBbmdsZTtcblxuICBpZiAocmV2ZXJzZUJFKSB7XG4gICAgdmFyIF9yZWY3ID0gW2VuZEFuZ2xlLCBzdGFydEFuZ2xlXTtcbiAgICBzdGFydEFuZ2xlID0gX3JlZjdbMF07XG4gICAgZW5kQW5nbGUgPSBfcmVmN1sxXTtcbiAgfVxuXG4gIHZhciBtaW51cyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZTtcbiAgaWYgKG1pbnVzID49IFBJICogMikgcmV0dXJuIHRydWU7XG5cbiAgdmFyIF9wb2ludDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDJbMF0sXG4gICAgICB5ID0gX3BvaW50MlsxXTtcblxuICB2YXIgX2dldENpcmNsZVJhZGlhblBvaW50ID0gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQocngsIHJ5LCByLCBzdGFydEFuZ2xlKSxcbiAgICAgIF9nZXRDaXJjbGVSYWRpYW5Qb2ludDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldENpcmNsZVJhZGlhblBvaW50LCAyKSxcbiAgICAgIGJ4ID0gX2dldENpcmNsZVJhZGlhblBvaW50MlswXSxcbiAgICAgIGJ5ID0gX2dldENpcmNsZVJhZGlhblBvaW50MlsxXTtcblxuICB2YXIgX2dldENpcmNsZVJhZGlhblBvaW50MyA9IGdldENpcmNsZVJhZGlhblBvaW50KHJ4LCByeSwgciwgZW5kQW5nbGUpLFxuICAgICAgX2dldENpcmNsZVJhZGlhblBvaW50NCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQzLCAyKSxcbiAgICAgIGV4ID0gX2dldENpcmNsZVJhZGlhblBvaW50NFswXSxcbiAgICAgIGV5ID0gX2dldENpcmNsZVJhZGlhblBvaW50NFsxXTtcblxuICB2YXIgdlBvaW50ID0gW3ggLSByeCwgeSAtIHJ5XTtcbiAgdmFyIHZCQXJtID0gW2J4IC0gcngsIGJ5IC0gcnldO1xuICB2YXIgdkVBcm0gPSBbZXggLSByeCwgZXkgLSByeV07XG4gIHZhciByZXZlcnNlID0gbWludXMgPiBQSTtcblxuICBpZiAocmV2ZXJzZSkge1xuICAgIHZhciBfZGVlcENsb25lMyA9IGRlZXBDbG9uZShbdkVBcm0sIHZCQXJtXSk7XG5cbiAgICB2YXIgX2RlZXBDbG9uZTQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2RlZXBDbG9uZTMsIDIpO1xuXG4gICAgdkJBcm0gPSBfZGVlcENsb25lNFswXTtcbiAgICB2RUFybSA9IF9kZWVwQ2xvbmU0WzFdO1xuICB9XG5cbiAgdmFyIGluU2VjdG9yID0gaXNDbG9ja1dpc2UodkJBcm0sIHZQb2ludCkgJiYgIWlzQ2xvY2tXaXNlKHZFQXJtLCB2UG9pbnQpO1xuICBpZiAocmV2ZXJzZSkgaW5TZWN0b3IgPSAhaW5TZWN0b3I7XG4gIGlmIChyZXZlcnNlQkUpIGluU2VjdG9yID0gIWluU2VjdG9yO1xuICByZXR1cm4gaW5TZWN0b3I7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIERldGVybWluZSBpZiB0aGUgcG9pbnQgaXMgaW4gdGhlIGNsb2Nrd2lzZSBkaXJlY3Rpb24gb2YgdGhlIHZlY3RvclxyXG4gKiBAcGFyYW0ge0FycmF5fSB2QXJtICAgVmVjdG9yXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHZQb2ludCBQb2ludFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gaXNDbG9ja1dpc2UodkFybSwgdlBvaW50KSB7XG4gIHZhciBfdkFybSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh2QXJtLCAyKSxcbiAgICAgIGF4ID0gX3ZBcm1bMF0sXG4gICAgICBheSA9IF92QXJtWzFdO1xuXG4gIHZhciBfdlBvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHZQb2ludCwgMiksXG4gICAgICBweCA9IF92UG9pbnRbMF0sXG4gICAgICBweSA9IF92UG9pbnRbMV07XG5cbiAgcmV0dXJuIC1heSAqIHB4ICsgYXggKiBweSA+IDA7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5bGluZSAgIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBsaW5lV2lkdGggUG9seWxpbmUgbGluZXdpZHRoXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNOZWFyUG9seWxpbmUocG9pbnQsIHBvbHlsaW5lLCBsaW5lV2lkdGgpIHtcbiAgdmFyIGhhbGZMaW5lV2lkdGggPSBsaW5lV2lkdGggLyAyO1xuICB2YXIgbW92ZVVwUG9seWxpbmUgPSBwb2x5bGluZS5tYXAoZnVuY3Rpb24gKF9yZWY4KSB7XG4gICAgdmFyIF9yZWY5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4LCAyKSxcbiAgICAgICAgeCA9IF9yZWY5WzBdLFxuICAgICAgICB5ID0gX3JlZjlbMV07XG5cbiAgICByZXR1cm4gW3gsIHkgLSBoYWxmTGluZVdpZHRoXTtcbiAgfSk7XG4gIHZhciBtb3ZlRG93blBvbHlsaW5lID0gcG9seWxpbmUubWFwKGZ1bmN0aW9uIChfcmVmMTApIHtcbiAgICB2YXIgX3JlZjExID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMCwgMiksXG4gICAgICAgIHggPSBfcmVmMTFbMF0sXG4gICAgICAgIHkgPSBfcmVmMTFbMV07XG5cbiAgICByZXR1cm4gW3gsIHkgKyBoYWxmTGluZVdpZHRoXTtcbiAgfSk7XG4gIHZhciBwb2x5Z29uID0gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobW92ZVVwUG9seWxpbmUpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1vdmVEb3duUG9seWxpbmUucmV2ZXJzZSgpKSk7XG4gIHJldHVybiBjaGVja1BvaW50SXNJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSByZWN0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgIFJlY3Qgc3RhcnQgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICAgUmVjdCBzdGFydCB5IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoICBSZWN0IHdpZHRoXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHQgUmVjdCBoZWlnaHRcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc0luUmVjdChfcmVmMTIsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIF9yZWYxMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTIsIDIpLFxuICAgICAgcHggPSBfcmVmMTNbMF0sXG4gICAgICBweSA9IF9yZWYxM1sxXTtcblxuICBpZiAocHggPCB4KSByZXR1cm4gZmFsc2U7XG4gIGlmIChweSA8IHkpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB4ID4geCArIHdpZHRoKSByZXR1cm4gZmFsc2U7XG4gIGlmIChweSA+IHkgKyBoZWlnaHQpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHJvdGF0ZWQgcG9pbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJvdGF0ZSBEZWdyZWUgb2Ygcm90YXRpb25cclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IG9yaWdpbiAgUm90YXRpb24gY2VudGVyXHJcbiAqIEBwYXJhbSB7QXJyYXl9IG9yaWdpbiAgUm90YXRpb24gY2VudGVyXHJcbiAqIEByZXR1cm4ge051bWJlcn0gQ29vcmRpbmF0ZXMgYWZ0ZXIgcm90YXRpb25cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0Um90YXRlUG9pbnRQb3MoKSB7XG4gIHZhciByb3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XG4gIHZhciBwb2ludCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICB2YXIgb3JpZ2luID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBbMCwgMF07XG4gIGlmICghcG9pbnQpIHJldHVybiBmYWxzZTtcbiAgaWYgKHJvdGF0ZSAlIDM2MCA9PT0gMCkgcmV0dXJuIHBvaW50O1xuXG4gIHZhciBfcG9pbnQzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQzWzBdLFxuICAgICAgeSA9IF9wb2ludDNbMV07XG5cbiAgdmFyIF9vcmlnaW4gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkob3JpZ2luLCAyKSxcbiAgICAgIG94ID0gX29yaWdpblswXSxcbiAgICAgIG95ID0gX29yaWdpblsxXTtcblxuICByb3RhdGUgKj0gUEkgLyAxODA7XG4gIHJldHVybiBbKHggLSBveCkgKiBjb3Mocm90YXRlKSAtICh5IC0gb3kpICogc2luKHJvdGF0ZSkgKyBveCwgKHggLSBveCkgKiBzaW4ocm90YXRlKSArICh5IC0gb3kpICogY29zKHJvdGF0ZSkgKyBveV07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHNjYWxlZCBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBzY2FsZSAgU2NhbGUgZmFjdG9yXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IG9yaWdpbiBTY2FsZSBjZW50ZXJcclxuICogQHJldHVybiB7TnVtYmVyfSBDb29yZGluYXRlcyBhZnRlciBzY2FsZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRTY2FsZVBvaW50UG9zKCkge1xuICB2YXIgc2NhbGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFsxLCAxXTtcbiAgdmFyIHBvaW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gIHZhciBvcmlnaW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFswLCAwXTtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoc2NhbGUgPT09IDEpIHJldHVybiBwb2ludDtcblxuICB2YXIgX3BvaW50NCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50NFswXSxcbiAgICAgIHkgPSBfcG9pbnQ0WzFdO1xuXG4gIHZhciBfb3JpZ2luMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShvcmlnaW4sIDIpLFxuICAgICAgb3ggPSBfb3JpZ2luMlswXSxcbiAgICAgIG95ID0gX29yaWdpbjJbMV07XG5cbiAgdmFyIF9zY2FsZSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShzY2FsZSwgMiksXG4gICAgICB4cyA9IF9zY2FsZVswXSxcbiAgICAgIHlzID0gX3NjYWxlWzFdO1xuXG4gIHZhciByZWxhdGl2ZVBvc1ggPSB4IC0gb3g7XG4gIHZhciByZWxhdGl2ZVBvc1kgPSB5IC0gb3k7XG4gIHJldHVybiBbcmVsYXRpdmVQb3NYICogeHMgKyBveCwgcmVsYXRpdmVQb3NZICogeXMgKyBveV07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHNjYWxlZCBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSB0cmFuc2xhdGUgVHJhbnNsYXRpb24gZGlzdGFuY2VcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHJldHVybiB7TnVtYmVyfSBDb29yZGluYXRlcyBhZnRlciB0cmFuc2xhdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUcmFuc2xhdGVQb2ludFBvcyh0cmFuc2xhdGUsIHBvaW50KSB7XG4gIGlmICghdHJhbnNsYXRlIHx8ICFwb2ludCkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBfcG9pbnQ1ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQ1WzBdLFxuICAgICAgeSA9IF9wb2ludDVbMV07XG5cbiAgdmFyIF90cmFuc2xhdGUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkodHJhbnNsYXRlLCAyKSxcbiAgICAgIHR4ID0gX3RyYW5zbGF0ZVswXSxcbiAgICAgIHR5ID0gX3RyYW5zbGF0ZVsxXTtcblxuICByZXR1cm4gW3ggKyB0eCwgeSArIHR5XTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBmcm9tIHRoZSBwb2ludCB0byB0aGUgbGluZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBsaW5lQmVnaW4gTGluZSBzdGFydCBwb3NpdGlvblxyXG4gKiBAcGFyYW0ge0FycmF5fSBsaW5lRW5kICAgTGluZSBlbmQgcG9zaXRpb25cclxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZSBiZXR3ZWVuIHBvaW50IGFuZCBsaW5lXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldERpc3RhbmNlQmV0d2VlblBvaW50QW5kTGluZShwb2ludCwgbGluZUJlZ2luLCBsaW5lRW5kKSB7XG4gIGlmICghcG9pbnQgfHwgIWxpbmVCZWdpbiB8fCAhbGluZUVuZCkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBfcG9pbnQ2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQ2WzBdLFxuICAgICAgeSA9IF9wb2ludDZbMV07XG5cbiAgdmFyIF9saW5lQmVnaW4gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZUJlZ2luLCAyKSxcbiAgICAgIHgxID0gX2xpbmVCZWdpblswXSxcbiAgICAgIHkxID0gX2xpbmVCZWdpblsxXTtcblxuICB2YXIgX2xpbmVFbmQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZUVuZCwgMiksXG4gICAgICB4MiA9IF9saW5lRW5kWzBdLFxuICAgICAgeTIgPSBfbGluZUVuZFsxXTtcblxuICB2YXIgYSA9IHkyIC0geTE7XG4gIHZhciBiID0geDEgLSB4MjtcbiAgdmFyIGMgPSB5MSAqICh4MiAtIHgxKSAtIHgxICogKHkyIC0geTEpO1xuICB2YXIgbW9sZWN1bGUgPSBhYnMoYSAqIHggKyBiICogeSArIGMpO1xuICB2YXIgZGVub21pbmF0b3IgPSBzcXJ0KGEgKiBhICsgYiAqIGIpO1xuICByZXR1cm4gbW9sZWN1bGUgLyBkZW5vbWluYXRvcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc3BlY2lmaWVkIHJhZGlhbiBvbiB0aGUgY2lyY2xlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4ICAgICAgQ2lyY2xlIHggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0geSAgICAgIENpcmNsZSB5IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZGl1cyBDaXJjbGUgcmFkaXVzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWRpYW4gU3BlY2ZpZWQgcmFkaWFuXHJcbiAqIEByZXR1cm4ge0FycmF5fSBQb3N0aW9uIG9mIHBvaW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldENpcmNsZVJhZGlhblBvaW50KHgsIHksIHJhZGl1cywgcmFkaWFuKSB7XG4gIHJldHVybiBbeCArIGNvcyhyYWRpYW4pICogcmFkaXVzLCB5ICsgc2luKHJhZGlhbikgKiByYWRpdXNdO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHBvaW50cyB0aGF0IG1ha2UgdXAgYSByZWd1bGFyIHBvbHlnb25cclxuICogQHBhcmFtIHtOdW1iZXJ9IHggICAgIFggY29vcmRpbmF0ZSBvZiB0aGUgcG9seWdvbiBpbnNjcmliZWQgY2lyY2xlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICBZIGNvb3JkaW5hdGUgb2YgdGhlIHBvbHlnb24gaW5zY3JpYmVkIGNpcmNsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gciAgICAgUmFkaXVzIG9mIHRoZSBwb2x5Z29uIGluc2NyaWJlZCBjaXJjbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHNpZGUgIFNpZGUgbnVtYmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaW51cyBSYWRpYW4gb2Zmc2V0XHJcbiAqIEByZXR1cm4ge0FycmF5fSBQb2ludHMgdGhhdCBtYWtlIHVwIGEgcmVndWxhciBwb2x5Z29uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzKHJ4LCByeSwgciwgc2lkZSkge1xuICB2YXIgbWludXMgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IFBJICogLTAuNTtcbiAgdmFyIHJhZGlhbkdhcCA9IFBJICogMiAvIHNpZGU7XG4gIHZhciByYWRpYW5zID0gbmV3IEFycmF5KHNpZGUpLmZpbGwoJycpLm1hcChmdW5jdGlvbiAodCwgaSkge1xuICAgIHJldHVybiBpICogcmFkaWFuR2FwICsgbWludXM7XG4gIH0pO1xuICByZXR1cm4gcmFkaWFucy5tYXAoZnVuY3Rpb24gKHJhZGlhbikge1xuICAgIHJldHVybiBnZXRDaXJjbGVSYWRpYW5Qb2ludChyeCwgcnksIHIsIHJhZGlhbik7XG4gIH0pO1xufVxuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGRlZXBDbG9uZTogZGVlcENsb25lLFxuICBlbGltaW5hdGVCbHVyOiBlbGltaW5hdGVCbHVyLFxuICBjaGVja1BvaW50SXNJbkNpcmNsZTogY2hlY2tQb2ludElzSW5DaXJjbGUsXG4gIGNoZWNrUG9pbnRJc0luUG9seWdvbjogY2hlY2tQb2ludElzSW5Qb2x5Z29uLFxuICBjaGVja1BvaW50SXNJblNlY3RvcjogY2hlY2tQb2ludElzSW5TZWN0b3IsXG4gIGNoZWNrUG9pbnRJc05lYXJQb2x5bGluZTogY2hlY2tQb2ludElzTmVhclBvbHlsaW5lLFxuICBnZXRUd29Qb2ludERpc3RhbmNlOiBnZXRUd29Qb2ludERpc3RhbmNlLFxuICBnZXRSb3RhdGVQb2ludFBvczogZ2V0Um90YXRlUG9pbnRQb3MsXG4gIGdldFNjYWxlUG9pbnRQb3M6IGdldFNjYWxlUG9pbnRQb3MsXG4gIGdldFRyYW5zbGF0ZVBvaW50UG9zOiBnZXRUcmFuc2xhdGVQb2ludFBvcyxcbiAgZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ6IGdldENpcmNsZVJhZGlhblBvaW50LFxuICBnZXRSZWd1bGFyUG9seWdvblBvaW50czogZ2V0UmVndWxhclBvbHlnb25Qb2ludHMsXG4gIGdldERpc3RhbmNlQmV0d2VlblBvaW50QW5kTGluZTogZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2RlZmF1bHQgPSBuZXcgTWFwKFtbJ3RyYW5zcGFyZW50JywgJ3JnYmEoMCwwLDAsMCknXSwgWydibGFjaycsICcjMDAwMDAwJ10sIFsnc2lsdmVyJywgJyNDMEMwQzAnXSwgWydncmF5JywgJyM4MDgwODAnXSwgWyd3aGl0ZScsICcjRkZGRkZGJ10sIFsnbWFyb29uJywgJyM4MDAwMDAnXSwgWydyZWQnLCAnI0ZGMDAwMCddLCBbJ3B1cnBsZScsICcjODAwMDgwJ10sIFsnZnVjaHNpYScsICcjRkYwMEZGJ10sIFsnZ3JlZW4nLCAnIzAwODAwMCddLCBbJ2xpbWUnLCAnIzAwRkYwMCddLCBbJ29saXZlJywgJyM4MDgwMDAnXSwgWyd5ZWxsb3cnLCAnI0ZGRkYwMCddLCBbJ25hdnknLCAnIzAwMDA4MCddLCBbJ2JsdWUnLCAnIzAwMDBGRiddLCBbJ3RlYWwnLCAnIzAwODA4MCddLCBbJ2FxdWEnLCAnIzAwRkZGRiddLCBbJ2FsaWNlYmx1ZScsICcjZjBmOGZmJ10sIFsnYW50aXF1ZXdoaXRlJywgJyNmYWViZDcnXSwgWydhcXVhbWFyaW5lJywgJyM3ZmZmZDQnXSwgWydhenVyZScsICcjZjBmZmZmJ10sIFsnYmVpZ2UnLCAnI2Y1ZjVkYyddLCBbJ2Jpc3F1ZScsICcjZmZlNGM0J10sIFsnYmxhbmNoZWRhbG1vbmQnLCAnI2ZmZWJjZCddLCBbJ2JsdWV2aW9sZXQnLCAnIzhhMmJlMiddLCBbJ2Jyb3duJywgJyNhNTJhMmEnXSwgWydidXJseXdvb2QnLCAnI2RlYjg4NyddLCBbJ2NhZGV0Ymx1ZScsICcjNWY5ZWEwJ10sIFsnY2hhcnRyZXVzZScsICcjN2ZmZjAwJ10sIFsnY2hvY29sYXRlJywgJyNkMjY5MWUnXSwgWydjb3JhbCcsICcjZmY3ZjUwJ10sIFsnY29ybmZsb3dlcmJsdWUnLCAnIzY0OTVlZCddLCBbJ2Nvcm5zaWxrJywgJyNmZmY4ZGMnXSwgWydjcmltc29uJywgJyNkYzE0M2MnXSwgWydjeWFuJywgJyMwMGZmZmYnXSwgWydkYXJrYmx1ZScsICcjMDAwMDhiJ10sIFsnZGFya2N5YW4nLCAnIzAwOGI4YiddLCBbJ2Rhcmtnb2xkZW5yb2QnLCAnI2I4ODYwYiddLCBbJ2RhcmtncmF5JywgJyNhOWE5YTknXSwgWydkYXJrZ3JlZW4nLCAnIzAwNjQwMCddLCBbJ2RhcmtncmV5JywgJyNhOWE5YTknXSwgWydkYXJra2hha2knLCAnI2JkYjc2YiddLCBbJ2RhcmttYWdlbnRhJywgJyM4YjAwOGInXSwgWydkYXJrb2xpdmVncmVlbicsICcjNTU2YjJmJ10sIFsnZGFya29yYW5nZScsICcjZmY4YzAwJ10sIFsnZGFya29yY2hpZCcsICcjOTkzMmNjJ10sIFsnZGFya3JlZCcsICcjOGIwMDAwJ10sIFsnZGFya3NhbG1vbicsICcjZTk5NjdhJ10sIFsnZGFya3NlYWdyZWVuJywgJyM4ZmJjOGYnXSwgWydkYXJrc2xhdGVibHVlJywgJyM0ODNkOGInXSwgWydkYXJrc2xhdGVncmF5JywgJyMyZjRmNGYnXSwgWydkYXJrc2xhdGVncmV5JywgJyMyZjRmNGYnXSwgWydkYXJrdHVycXVvaXNlJywgJyMwMGNlZDEnXSwgWydkYXJrdmlvbGV0JywgJyM5NDAwZDMnXSwgWydkZWVwcGluaycsICcjZmYxNDkzJ10sIFsnZGVlcHNreWJsdWUnLCAnIzAwYmZmZiddLCBbJ2RpbWdyYXknLCAnIzY5Njk2OSddLCBbJ2RpbWdyZXknLCAnIzY5Njk2OSddLCBbJ2RvZGdlcmJsdWUnLCAnIzFlOTBmZiddLCBbJ2ZpcmVicmljaycsICcjYjIyMjIyJ10sIFsnZmxvcmFsd2hpdGUnLCAnI2ZmZmFmMCddLCBbJ2ZvcmVzdGdyZWVuJywgJyMyMjhiMjInXSwgWydnYWluc2Jvcm8nLCAnI2RjZGNkYyddLCBbJ2dob3N0d2hpdGUnLCAnI2Y4ZjhmZiddLCBbJ2dvbGQnLCAnI2ZmZDcwMCddLCBbJ2dvbGRlbnJvZCcsICcjZGFhNTIwJ10sIFsnZ3JlZW55ZWxsb3cnLCAnI2FkZmYyZiddLCBbJ2dyZXknLCAnIzgwODA4MCddLCBbJ2hvbmV5ZGV3JywgJyNmMGZmZjAnXSwgWydob3RwaW5rJywgJyNmZjY5YjQnXSwgWydpbmRpYW5yZWQnLCAnI2NkNWM1YyddLCBbJ2luZGlnbycsICcjNGIwMDgyJ10sIFsnaXZvcnknLCAnI2ZmZmZmMCddLCBbJ2toYWtpJywgJyNmMGU2OGMnXSwgWydsYXZlbmRlcicsICcjZTZlNmZhJ10sIFsnbGF2ZW5kZXJibHVzaCcsICcjZmZmMGY1J10sIFsnbGF3bmdyZWVuJywgJyM3Y2ZjMDAnXSwgWydsZW1vbmNoaWZmb24nLCAnI2ZmZmFjZCddLCBbJ2xpZ2h0Ymx1ZScsICcjYWRkOGU2J10sIFsnbGlnaHRjb3JhbCcsICcjZjA4MDgwJ10sIFsnbGlnaHRjeWFuJywgJyNlMGZmZmYnXSwgWydsaWdodGdvbGRlbnJvZHllbGxvdycsICcjZmFmYWQyJ10sIFsnbGlnaHRncmF5JywgJyNkM2QzZDMnXSwgWydsaWdodGdyZWVuJywgJyM5MGVlOTAnXSwgWydsaWdodGdyZXknLCAnI2QzZDNkMyddLCBbJ2xpZ2h0cGluaycsICcjZmZiNmMxJ10sIFsnbGlnaHRzYWxtb24nLCAnI2ZmYTA3YSddLCBbJ2xpZ2h0c2VhZ3JlZW4nLCAnIzIwYjJhYSddLCBbJ2xpZ2h0c2t5Ymx1ZScsICcjODdjZWZhJ10sIFsnbGlnaHRzbGF0ZWdyYXknLCAnIzc3ODg5OSddLCBbJ2xpZ2h0c2xhdGVncmV5JywgJyM3Nzg4OTknXSwgWydsaWdodHN0ZWVsYmx1ZScsICcjYjBjNGRlJ10sIFsnbGlnaHR5ZWxsb3cnLCAnI2ZmZmZlMCddLCBbJ2xpbWVncmVlbicsICcjMzJjZDMyJ10sIFsnbGluZW4nLCAnI2ZhZjBlNiddLCBbJ21hZ2VudGEnLCAnI2ZmMDBmZiddLCBbJ21lZGl1bWFxdWFtYXJpbmUnLCAnIzY2Y2RhYSddLCBbJ21lZGl1bWJsdWUnLCAnIzAwMDBjZCddLCBbJ21lZGl1bW9yY2hpZCcsICcjYmE1NWQzJ10sIFsnbWVkaXVtcHVycGxlJywgJyM5MzcwZGInXSwgWydtZWRpdW1zZWFncmVlbicsICcjM2NiMzcxJ10sIFsnbWVkaXVtc2xhdGVibHVlJywgJyM3YjY4ZWUnXSwgWydtZWRpdW1zcHJpbmdncmVlbicsICcjMDBmYTlhJ10sIFsnbWVkaXVtdHVycXVvaXNlJywgJyM0OGQxY2MnXSwgWydtZWRpdW12aW9sZXRyZWQnLCAnI2M3MTU4NSddLCBbJ21pZG5pZ2h0Ymx1ZScsICcjMTkxOTcwJ10sIFsnbWludGNyZWFtJywgJyNmNWZmZmEnXSwgWydtaXN0eXJvc2UnLCAnI2ZmZTRlMSddLCBbJ21vY2Nhc2luJywgJyNmZmU0YjUnXSwgWyduYXZham93aGl0ZScsICcjZmZkZWFkJ10sIFsnb2xkbGFjZScsICcjZmRmNWU2J10sIFsnb2xpdmVkcmFiJywgJyM2YjhlMjMnXSwgWydvcmFuZ2UnLCAnI2ZmYTUwMCddLCBbJ29yYW5nZXJlZCcsICcjZmY0NTAwJ10sIFsnb3JjaGlkJywgJyNkYTcwZDYnXSwgWydwYWxlZ29sZGVucm9kJywgJyNlZWU4YWEnXSwgWydwYWxlZ3JlZW4nLCAnIzk4ZmI5OCddLCBbJ3BhbGV0dXJxdW9pc2UnLCAnI2FmZWVlZSddLCBbJ3BhbGV2aW9sZXRyZWQnLCAnI2RiNzA5MyddLCBbJ3BhcGF5YXdoaXAnLCAnI2ZmZWZkNSddLCBbJ3BlYWNocHVmZicsICcjZmZkYWI5J10sIFsncGVydScsICcjY2Q4NTNmJ10sIFsncGluaycsICcjZmZjMGNiJ10sIFsncGx1bScsICcjZGRhMGRkJ10sIFsncG93ZGVyYmx1ZScsICcjYjBlMGU2J10sIFsncm9zeWJyb3duJywgJyNiYzhmOGYnXSwgWydyb3lhbGJsdWUnLCAnIzQxNjllMSddLCBbJ3NhZGRsZWJyb3duJywgJyM4YjQ1MTMnXSwgWydzYWxtb24nLCAnI2ZhODA3MiddLCBbJ3NhbmR5YnJvd24nLCAnI2Y0YTQ2MCddLCBbJ3NlYWdyZWVuJywgJyMyZThiNTcnXSwgWydzZWFzaGVsbCcsICcjZmZmNWVlJ10sIFsnc2llbm5hJywgJyNhMDUyMmQnXSwgWydza3libHVlJywgJyM4N2NlZWInXSwgWydzbGF0ZWJsdWUnLCAnIzZhNWFjZCddLCBbJ3NsYXRlZ3JheScsICcjNzA4MDkwJ10sIFsnc2xhdGVncmV5JywgJyM3MDgwOTAnXSwgWydzbm93JywgJyNmZmZhZmEnXSwgWydzcHJpbmdncmVlbicsICcjMDBmZjdmJ10sIFsnc3RlZWxibHVlJywgJyM0NjgyYjQnXSwgWyd0YW4nLCAnI2QyYjQ4YyddLCBbJ3RoaXN0bGUnLCAnI2Q4YmZkOCddLCBbJ3RvbWF0bycsICcjZmY2MzQ3J10sIFsndHVycXVvaXNlJywgJyM0MGUwZDAnXSwgWyd2aW9sZXQnLCAnI2VlODJlZSddLCBbJ3doZWF0JywgJyNmNWRlYjMnXSwgWyd3aGl0ZXNtb2tlJywgJyNmNWY1ZjUnXSwgWyd5ZWxsb3dncmVlbicsICcjOWFjZDMyJ11dKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdldFJnYlZhbHVlID0gZ2V0UmdiVmFsdWU7XG5leHBvcnRzLmdldFJnYmFWYWx1ZSA9IGdldFJnYmFWYWx1ZTtcbmV4cG9ydHMuZ2V0T3BhY2l0eSA9IGdldE9wYWNpdHk7XG5leHBvcnRzLnRvUmdiID0gdG9SZ2I7XG5leHBvcnRzLnRvSGV4ID0gdG9IZXg7XG5leHBvcnRzLmdldENvbG9yRnJvbVJnYlZhbHVlID0gZ2V0Q29sb3JGcm9tUmdiVmFsdWU7XG5leHBvcnRzLmRhcmtlbiA9IGRhcmtlbjtcbmV4cG9ydHMubGlnaHRlbiA9IGxpZ2h0ZW47XG5leHBvcnRzLmZhZGUgPSBmYWRlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfa2V5d29yZHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NvbmZpZy9rZXl3b3Jkc1wiKSk7XG5cbnZhciBoZXhSZWcgPSAvXiMoWzAtOWEtZkEtZl17M318WzAtOWEtZkEtZl17Nn0pJC87XG52YXIgcmdiUmVnID0gL14ocmdifHJnYmF8UkdCfFJHQkEpLztcbnZhciByZ2JhUmVnID0gL14ocmdiYXxSR0JBKS87XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENvbG9yIHZhbGlkYXRvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFZhbGlkIGNvbG9yIE9yIGZhbHNlXHJcbiAqL1xuXG5mdW5jdGlvbiB2YWxpZGF0b3IoY29sb3IpIHtcbiAgdmFyIGlzSGV4ID0gaGV4UmVnLnRlc3QoY29sb3IpO1xuICB2YXIgaXNSZ2IgPSByZ2JSZWcudGVzdChjb2xvcik7XG4gIGlmIChpc0hleCB8fCBpc1JnYikgcmV0dXJuIGNvbG9yO1xuICBjb2xvciA9IGdldENvbG9yQnlLZXl3b3JkKGNvbG9yKTtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQ29sb3I6IEludmFsaWQgY29sb3IhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGNvbG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgY29sb3IgYnkga2V5d29yZFxyXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5d29yZCBDb2xvciBrZXl3b3JkIGxpa2UgcmVkLCBncmVlbiBhbmQgZXRjLlxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gSGV4IG9yIHJnYmEgY29sb3IgKEludmFsaWQga2V5d29yZCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0Q29sb3JCeUtleXdvcmQoa2V5d29yZCkge1xuICBpZiAoIWtleXdvcmQpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRDb2xvckJ5S2V5d29yZHM6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIV9rZXl3b3Jkc1tcImRlZmF1bHRcIl0uaGFzKGtleXdvcmQpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBfa2V5d29yZHNbXCJkZWZhdWx0XCJdLmdldChrZXl3b3JkKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBSZ2IgdmFsdWUgb2YgdGhlIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtBcnJheTxOdW1iZXI+fEJvb2xlYW59IFJnYiB2YWx1ZSBvZiB0aGUgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYlZhbHVlKGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRSZ2JWYWx1ZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbG9yID0gdmFsaWRhdG9yKGNvbG9yKTtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlO1xuICB2YXIgaXNIZXggPSBoZXhSZWcudGVzdChjb2xvcik7XG4gIHZhciBpc1JnYiA9IHJnYlJlZy50ZXN0KGNvbG9yKTtcbiAgdmFyIGxvd2VyQ29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICBpZiAoaXNIZXgpIHJldHVybiBnZXRSZ2JWYWx1ZUZyb21IZXgobG93ZXJDb2xvcik7XG4gIGlmIChpc1JnYikgcmV0dXJuIGdldFJnYlZhbHVlRnJvbVJnYihsb3dlckNvbG9yKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSByZ2IgdmFsdWUgb2YgdGhlIGhleCBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4IGNvbG9yXHJcbiAqIEByZXR1cm4ge0FycmF5PE51bWJlcj59IFJnYiB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiVmFsdWVGcm9tSGV4KGNvbG9yKSB7XG4gIGNvbG9yID0gY29sb3IucmVwbGFjZSgnIycsICcnKTtcbiAgaWYgKGNvbG9yLmxlbmd0aCA9PT0gMykgY29sb3IgPSBBcnJheS5mcm9tKGNvbG9yKS5tYXAoZnVuY3Rpb24gKGhleE51bSkge1xuICAgIHJldHVybiBoZXhOdW0gKyBoZXhOdW07XG4gIH0pLmpvaW4oJycpO1xuICBjb2xvciA9IGNvbG9yLnNwbGl0KCcnKTtcbiAgcmV0dXJuIG5ldyBBcnJheSgzKS5maWxsKDApLm1hcChmdW5jdGlvbiAodCwgaSkge1xuICAgIHJldHVybiBwYXJzZUludChcIjB4XCIuY29uY2F0KGNvbG9yW2kgKiAyXSkuY29uY2F0KGNvbG9yW2kgKiAyICsgMV0pKTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcmdiIHZhbHVlIG9mIHRoZSByZ2IvcmdiYSBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4IGNvbG9yXHJcbiAqIEByZXR1cm4ge0FycmF5fSBSZ2IgdmFsdWUgb2YgdGhlIGNvbG9yXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYlZhbHVlRnJvbVJnYihjb2xvcikge1xuICByZXR1cm4gY29sb3IucmVwbGFjZSgvcmdiXFwofHJnYmFcXCh8XFwpL2csICcnKS5zcGxpdCgnLCcpLnNsaWNlKDAsIDMpLm1hcChmdW5jdGlvbiAobikge1xuICAgIHJldHVybiBwYXJzZUludChuKTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgUmdiYSB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge0FycmF5PE51bWJlcj58Qm9vbGVhbn0gUmdiYSB2YWx1ZSBvZiB0aGUgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYmFWYWx1ZShjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0UmdiYVZhbHVlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNvbG9yVmFsdWUgPSBnZXRSZ2JWYWx1ZShjb2xvcik7XG4gIGlmICghY29sb3JWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICBjb2xvclZhbHVlLnB1c2goZ2V0T3BhY2l0eShjb2xvcikpO1xuICByZXR1cm4gY29sb3JWYWx1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBvcGFjaXR5IG9mIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ8Qm9vbGVhbn0gQ29sb3Igb3BhY2l0eSAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0T3BhY2l0eShjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0T3BhY2l0eTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbG9yID0gdmFsaWRhdG9yKGNvbG9yKTtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlO1xuICB2YXIgaXNSZ2JhID0gcmdiYVJlZy50ZXN0KGNvbG9yKTtcbiAgaWYgKCFpc1JnYmEpIHJldHVybiAxO1xuICBjb2xvciA9IGNvbG9yLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiBOdW1iZXIoY29sb3Iuc3BsaXQoJywnKS5zbGljZSgtMSlbMF0ucmVwbGFjZSgvWyl8XFxzXS9nLCAnJykpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDb252ZXJ0IGNvbG9yIHRvIFJnYnxSZ2JhIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciAgIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvcGFjaXR5IFRoZSBvcGFjaXR5IG9mIGNvbG9yXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2J8UmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gdG9SZ2IoY29sb3IsIG9wYWNpdHkpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RvUmdiOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYlZhbHVlID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIXJnYlZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHZhciBhZGRPcGFjaXR5ID0gdHlwZW9mIG9wYWNpdHkgPT09ICdudW1iZXInO1xuICBpZiAoYWRkT3BhY2l0eSkgcmV0dXJuICdyZ2JhKCcgKyByZ2JWYWx1ZS5qb2luKCcsJykgKyBcIixcIi5jb25jYXQob3BhY2l0eSwgXCIpXCIpO1xuICByZXR1cm4gJ3JnYignICsgcmdiVmFsdWUuam9pbignLCcpICsgJyknO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDb252ZXJ0IGNvbG9yIHRvIEhleCBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IEhleCBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gdG9IZXgoY29sb3IpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RvSGV4OiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGhleFJlZy50ZXN0KGNvbG9yKSkgcmV0dXJuIGNvbG9yO1xuICBjb2xvciA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFjb2xvcikgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gJyMnICsgY29sb3IubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIE51bWJlcihuKS50b1N0cmluZygxNik7XG4gIH0pLm1hcChmdW5jdGlvbiAobikge1xuICAgIHJldHVybiBuID09PSAnMCcgPyAnMDAnIDogbjtcbiAgfSkuam9pbignJyk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCBDb2xvciBmcm9tIFJnYnxSZ2JhIHZhbHVlXHJcbiAqIEBwYXJhbSB7QXJyYXk8TnVtYmVyPn0gdmFsdWUgUmdifFJnYmEgY29sb3IgdmFsdWVcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYnxSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRDb2xvckZyb21SZ2JWYWx1ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0Q29sb3JGcm9tUmdiVmFsdWU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG5cbiAgaWYgKHZhbHVlTGVuZ3RoICE9PSAzICYmIHZhbHVlTGVuZ3RoICE9PSA0KSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0Q29sb3JGcm9tUmdiVmFsdWU6IFZhbHVlIGlzIGlsbGVnYWwhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGNvbG9yID0gdmFsdWVMZW5ndGggPT09IDMgPyAncmdiKCcgOiAncmdiYSgnO1xuICBjb2xvciArPSB2YWx1ZS5qb2luKCcsJykgKyAnKSc7XG4gIHJldHVybiBjb2xvcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRGVlcGVuIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFBlcmNlbnQgb2YgRGVlcGVuICgxLTEwMClcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRhcmtlbihjb2xvcikge1xuICB2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZGFya2VuOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYmFWYWx1ZSA9IGdldFJnYmFWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiYVZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHJnYmFWYWx1ZSA9IHJnYmFWYWx1ZS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICByZXR1cm4gaSA9PT0gMyA/IHYgOiB2IC0gTWF0aC5jZWlsKDIuNTUgKiBwZXJjZW50KTtcbiAgfSkubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHYgPCAwID8gMCA6IHY7XG4gIH0pO1xuICByZXR1cm4gZ2V0Q29sb3JGcm9tUmdiVmFsdWUocmdiYVZhbHVlKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQnJpZ2h0ZW4gY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge051bWJlcn0gUGVyY2VudCBvZiBicmlnaHRlbiAoMS0xMDApXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBsaWdodGVuKGNvbG9yKSB7XG4gIHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdsaWdodGVuOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYmFWYWx1ZSA9IGdldFJnYmFWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiYVZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHJnYmFWYWx1ZSA9IHJnYmFWYWx1ZS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICByZXR1cm4gaSA9PT0gMyA/IHYgOiB2ICsgTWF0aC5jZWlsKDIuNTUgKiBwZXJjZW50KTtcbiAgfSkubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHYgPiAyNTUgPyAyNTUgOiB2O1xuICB9KTtcbiAgcmV0dXJuIGdldENvbG9yRnJvbVJnYlZhbHVlKHJnYmFWYWx1ZSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEFkanVzdCBjb2xvciBvcGFjaXR5XHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciAgIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBQZXJjZW50IG9mIG9wYWNpdHlcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGZhZGUoY29sb3IpIHtcbiAgdmFyIHBlcmNlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDEwMDtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZmFkZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZ2JWYWx1ZSA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICB2YXIgcmdiYVZhbHVlID0gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocmdiVmFsdWUpLCBbcGVyY2VudCAvIDEwMF0pO1xuICByZXR1cm4gZ2V0Q29sb3JGcm9tUmdiVmFsdWUocmdiYVZhbHVlKTtcbn1cblxudmFyIF9kZWZhdWx0ID0ge1xuICBmYWRlOiBmYWRlLFxuICB0b0hleDogdG9IZXgsXG4gIHRvUmdiOiB0b1JnYixcbiAgZGFya2VuOiBkYXJrZW4sXG4gIGxpZ2h0ZW46IGxpZ2h0ZW4sXG4gIGdldE9wYWNpdHk6IGdldE9wYWNpdHksXG4gIGdldFJnYlZhbHVlOiBnZXRSZ2JWYWx1ZSxcbiAgZ2V0UmdiYVZhbHVlOiBnZXRSZ2JhVmFsdWUsXG4gIGdldENvbG9yRnJvbVJnYlZhbHVlOiBnZXRDb2xvckZyb21SZ2JWYWx1ZVxufTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGV4cG9ydHMuZWFzZUluT3V0Qm91bmNlID0gZXhwb3J0cy5lYXNlT3V0Qm91bmNlID0gZXhwb3J0cy5lYXNlSW5Cb3VuY2UgPSBleHBvcnRzLmVhc2VJbk91dEVsYXN0aWMgPSBleHBvcnRzLmVhc2VPdXRFbGFzdGljID0gZXhwb3J0cy5lYXNlSW5FbGFzdGljID0gZXhwb3J0cy5lYXNlSW5PdXRCYWNrID0gZXhwb3J0cy5lYXNlT3V0QmFjayA9IGV4cG9ydHMuZWFzZUluQmFjayA9IGV4cG9ydHMuZWFzZUluT3V0UXVpbnQgPSBleHBvcnRzLmVhc2VPdXRRdWludCA9IGV4cG9ydHMuZWFzZUluUXVpbnQgPSBleHBvcnRzLmVhc2VJbk91dFF1YXJ0ID0gZXhwb3J0cy5lYXNlT3V0UXVhcnQgPSBleHBvcnRzLmVhc2VJblF1YXJ0ID0gZXhwb3J0cy5lYXNlSW5PdXRDdWJpYyA9IGV4cG9ydHMuZWFzZU91dEN1YmljID0gZXhwb3J0cy5lYXNlSW5DdWJpYyA9IGV4cG9ydHMuZWFzZUluT3V0UXVhZCA9IGV4cG9ydHMuZWFzZU91dFF1YWQgPSBleHBvcnRzLmVhc2VJblF1YWQgPSBleHBvcnRzLmVhc2VJbk91dFNpbmUgPSBleHBvcnRzLmVhc2VPdXRTaW5lID0gZXhwb3J0cy5lYXNlSW5TaW5lID0gZXhwb3J0cy5saW5lYXIgPSB2b2lkIDA7XG52YXIgbGluZWFyID0gW1tbMCwgMV0sICcnLCBbMC4zMywgMC42N11dLCBbWzEsIDBdLCBbMC42NywgMC4zM11dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2luZVxyXG4gKi9cblxuZXhwb3J0cy5saW5lYXIgPSBsaW5lYXI7XG52YXIgZWFzZUluU2luZSA9IFtbWzAsIDFdXSwgW1swLjUzOCwgMC41NjRdLCBbMC4xNjksIDAuOTEyXSwgWzAuODgwLCAwLjE5Nl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblNpbmUgPSBlYXNlSW5TaW5lO1xudmFyIGVhc2VPdXRTaW5lID0gW1tbMCwgMV1dLCBbWzAuNDQ0LCAwLjQ0OF0sIFswLjE2OSwgMC43MzZdLCBbMC43MTgsIDAuMTZdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0U2luZSA9IGVhc2VPdXRTaW5lO1xudmFyIGVhc2VJbk91dFNpbmUgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC4yLCAxXSwgWzAuOCwgMF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFF1YWRcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0U2luZSA9IGVhc2VJbk91dFNpbmU7XG52YXIgZWFzZUluUXVhZCA9IFtbWzAsIDFdXSwgW1swLjU1MCwgMC41ODRdLCBbMC4yMzEsIDAuOTA0XSwgWzAuODY4LCAwLjI2NF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblF1YWQgPSBlYXNlSW5RdWFkO1xudmFyIGVhc2VPdXRRdWFkID0gW1tbMCwgMV1dLCBbWzAuNDEzLCAwLjQyOF0sIFswLjA2NSwgMC44MTZdLCBbMC43NjAsIDAuMDRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0UXVhZCA9IGVhc2VPdXRRdWFkO1xudmFyIGVhc2VJbk91dFF1YWQgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC4zLCAwLjldLCBbMC43LCAwLjFdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDdWJpY1xyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZWFzZUluT3V0UXVhZDtcbnZhciBlYXNlSW5DdWJpYyA9IFtbWzAsIDFdXSwgW1swLjY3OSwgMC42ODhdLCBbMC4zNjYsIDAuOTkyXSwgWzAuOTkyLCAwLjM4NF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkN1YmljID0gZWFzZUluQ3ViaWM7XG52YXIgZWFzZU91dEN1YmljID0gW1tbMCwgMV1dLCBbWzAuMzIxLCAwLjMxMl0sIFswLjAwOCwgMC42MTZdLCBbMC42MzQsIDAuMDA4XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dEN1YmljID0gZWFzZU91dEN1YmljO1xudmFyIGVhc2VJbk91dEN1YmljID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuMywgMV0sIFswLjcsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBRdWFydFxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRDdWJpYyA9IGVhc2VJbk91dEN1YmljO1xudmFyIGVhc2VJblF1YXJ0ID0gW1tbMCwgMV1dLCBbWzAuODEyLCAwLjc0XSwgWzAuNjExLCAwLjk4OF0sIFsxLjAxMywgMC40OTJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5RdWFydCA9IGVhc2VJblF1YXJ0O1xudmFyIGVhc2VPdXRRdWFydCA9IFtbWzAsIDFdXSwgW1swLjE1MiwgMC4yNDRdLCBbMC4wMDEsIDAuNDQ4XSwgWzAuMjg1LCAtMC4wMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRRdWFydCA9IGVhc2VPdXRRdWFydDtcbnZhciBlYXNlSW5PdXRRdWFydCA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjQsIDFdLCBbMC42LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUXVpbnRcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0UXVhcnQgPSBlYXNlSW5PdXRRdWFydDtcbnZhciBlYXNlSW5RdWludCA9IFtbWzAsIDFdXSwgW1swLjg1NywgMC44NTZdLCBbMC43MTQsIDFdLCBbMSwgMC43MTJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5RdWludCA9IGVhc2VJblF1aW50O1xudmFyIGVhc2VPdXRRdWludCA9IFtbWzAsIDFdXSwgW1swLjEwOCwgMC4yXSwgWzAuMDAxLCAwLjRdLCBbMC4yMTQsIC0wLjAxMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRRdWludCA9IGVhc2VPdXRRdWludDtcbnZhciBlYXNlSW5PdXRRdWludCA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjUsIDFdLCBbMC41LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQmFja1xyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGVhc2VJbk91dFF1aW50O1xudmFyIGVhc2VJbkJhY2sgPSBbW1swLCAxXV0sIFtbMC42NjcsIDAuODk2XSwgWzAuMzgwLCAxLjE4NF0sIFswLjk1NSwgMC42MTZdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5CYWNrID0gZWFzZUluQmFjaztcbnZhciBlYXNlT3V0QmFjayA9IFtbWzAsIDFdXSwgW1swLjMzNSwgMC4wMjhdLCBbMC4wNjEsIDAuMjJdLCBbMC42MzEsIC0wLjE4XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dEJhY2sgPSBlYXNlT3V0QmFjaztcbnZhciBlYXNlSW5PdXRCYWNrID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuNCwgMS40XSwgWzAuNiwgLTAuNF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEVsYXN0aWNcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0QmFjayA9IGVhc2VJbk91dEJhY2s7XG52YXIgZWFzZUluRWxhc3RpYyA9IFtbWzAsIDFdXSwgW1swLjQ3NCwgMC45NjRdLCBbMC4zODIsIDAuOTg4XSwgWzAuNTU3LCAwLjk1Ml1dLCBbWzAuNjE5LCAxLjA3Nl0sIFswLjU2NSwgMS4wODhdLCBbMC42NjksIDEuMDhdXSwgW1swLjc3MCwgMC45MTZdLCBbMC43MTIsIDAuOTI0XSwgWzAuODQ3LCAwLjkwNF1dLCBbWzAuOTExLCAxLjMwNF0sIFswLjg3MiwgMS4zMTZdLCBbMC45NjEsIDEuMzRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5FbGFzdGljID0gZWFzZUluRWxhc3RpYztcbnZhciBlYXNlT3V0RWxhc3RpYyA9IFtbWzAsIDFdXSwgW1swLjA3MywgLTAuMzJdLCBbMC4wMzQsIC0wLjMyOF0sIFswLjEwNCwgLTAuMzQ0XV0sIFtbMC4xOTEsIDAuMDkyXSwgWzAuMTEwLCAwLjA2XSwgWzAuMjU2LCAwLjA4XV0sIFtbMC4zMTAsIC0wLjA3Nl0sIFswLjI2MCwgLTAuMDY4XSwgWzAuMzU3LCAtMC4wNzZdXSwgW1swLjQzMiwgMC4wMzJdLCBbMC4zNjIsIDAuMDI4XSwgWzAuNjgzLCAtMC4wMDRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0RWxhc3RpYyA9IGVhc2VPdXRFbGFzdGljO1xudmFyIGVhc2VJbk91dEVsYXN0aWMgPSBbW1swLCAxXV0sIFtbMC4yMTAsIDAuOTRdLCBbMC4xNjcsIDAuODg0XSwgWzAuMjUyLCAwLjk4XV0sIFtbMC4yOTksIDEuMTA0XSwgWzAuMjU2LCAxLjA5Ml0sIFswLjM0NywgMS4xMDhdXSwgW1swLjUsIDAuNDk2XSwgWzAuNDUxLCAwLjY3Ml0sIFswLjU0OCwgMC4zMjRdXSwgW1swLjY5NiwgLTAuMTA4XSwgWzAuNjUyLCAtMC4xMTJdLCBbMC43NDEsIC0wLjEyNF1dLCBbWzAuODA1LCAwLjA2NF0sIFswLjc1NiwgMC4wMTJdLCBbMC44NjYsIDAuMDk2XV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQm91bmNlXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dEVsYXN0aWMgPSBlYXNlSW5PdXRFbGFzdGljO1xudmFyIGVhc2VJbkJvdW5jZSA9IFtbWzAsIDFdXSwgW1swLjE0OCwgMV0sIFswLjA3NSwgMC44NjhdLCBbMC4xOTMsIDAuODQ4XV0sIFtbMC4zMjYsIDFdLCBbMC4yNzYsIDAuODM2XSwgWzAuNDA1LCAwLjcxMl1dLCBbWzAuNjAwLCAxXSwgWzAuNTExLCAwLjcwOF0sIFswLjY3MSwgMC4zNDhdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5Cb3VuY2UgPSBlYXNlSW5Cb3VuY2U7XG52YXIgZWFzZU91dEJvdW5jZSA9IFtbWzAsIDFdXSwgW1swLjM1NywgMC4wMDRdLCBbMC4yNzAsIDAuNTkyXSwgWzAuMzc2LCAwLjI1Ml1dLCBbWzAuNjA0LCAtMC4wMDRdLCBbMC41NDgsIDAuMzEyXSwgWzAuNjY5LCAwLjE4NF1dLCBbWzAuODIwLCAwXSwgWzAuNzQ5LCAwLjE4NF0sIFswLjkwNSwgMC4xMzJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0Qm91bmNlID0gZWFzZU91dEJvdW5jZTtcbnZhciBlYXNlSW5PdXRCb3VuY2UgPSBbW1swLCAxXV0sIFtbMC4xMDIsIDFdLCBbMC4wNTAsIDAuODY0XSwgWzAuMTE3LCAwLjg2XV0sIFtbMC4yMTYsIDAuOTk2XSwgWzAuMjA4LCAwLjg0NF0sIFswLjIyNywgMC44MDhdXSwgW1swLjM0NywgMC45OTZdLCBbMC4zNDMsIDAuOF0sIFswLjQ4MCwgMC4yOTJdXSwgW1swLjYzNSwgMC4wMDRdLCBbMC41MTEsIDAuNjc2XSwgWzAuNjU2LCAwLjIwOF1dLCBbWzAuNzg3LCAwXSwgWzAuNzYwLCAwLjJdLCBbMC43OTUsIDAuMTQ0XV0sIFtbMC45MDUsIC0wLjAwNF0sIFswLjg5OSwgMC4xNjRdLCBbMC45NDQsIDAuMTQ0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluT3V0Qm91bmNlID0gZWFzZUluT3V0Qm91bmNlO1xuXG52YXIgX2RlZmF1bHQgPSBuZXcgTWFwKFtbJ2xpbmVhcicsIGxpbmVhcl0sIFsnZWFzZUluU2luZScsIGVhc2VJblNpbmVdLCBbJ2Vhc2VPdXRTaW5lJywgZWFzZU91dFNpbmVdLCBbJ2Vhc2VJbk91dFNpbmUnLCBlYXNlSW5PdXRTaW5lXSwgWydlYXNlSW5RdWFkJywgZWFzZUluUXVhZF0sIFsnZWFzZU91dFF1YWQnLCBlYXNlT3V0UXVhZF0sIFsnZWFzZUluT3V0UXVhZCcsIGVhc2VJbk91dFF1YWRdLCBbJ2Vhc2VJbkN1YmljJywgZWFzZUluQ3ViaWNdLCBbJ2Vhc2VPdXRDdWJpYycsIGVhc2VPdXRDdWJpY10sIFsnZWFzZUluT3V0Q3ViaWMnLCBlYXNlSW5PdXRDdWJpY10sIFsnZWFzZUluUXVhcnQnLCBlYXNlSW5RdWFydF0sIFsnZWFzZU91dFF1YXJ0JywgZWFzZU91dFF1YXJ0XSwgWydlYXNlSW5PdXRRdWFydCcsIGVhc2VJbk91dFF1YXJ0XSwgWydlYXNlSW5RdWludCcsIGVhc2VJblF1aW50XSwgWydlYXNlT3V0UXVpbnQnLCBlYXNlT3V0UXVpbnRdLCBbJ2Vhc2VJbk91dFF1aW50JywgZWFzZUluT3V0UXVpbnRdLCBbJ2Vhc2VJbkJhY2snLCBlYXNlSW5CYWNrXSwgWydlYXNlT3V0QmFjaycsIGVhc2VPdXRCYWNrXSwgWydlYXNlSW5PdXRCYWNrJywgZWFzZUluT3V0QmFja10sIFsnZWFzZUluRWxhc3RpYycsIGVhc2VJbkVsYXN0aWNdLCBbJ2Vhc2VPdXRFbGFzdGljJywgZWFzZU91dEVsYXN0aWNdLCBbJ2Vhc2VJbk91dEVsYXN0aWMnLCBlYXNlSW5PdXRFbGFzdGljXSwgWydlYXNlSW5Cb3VuY2UnLCBlYXNlSW5Cb3VuY2VdLCBbJ2Vhc2VPdXRCb3VuY2UnLCBlYXNlT3V0Qm91bmNlXSwgWydlYXNlSW5PdXRCb3VuY2UnLCBlYXNlSW5PdXRCb3VuY2VdXSk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50cmFuc2l0aW9uID0gdHJhbnNpdGlvbjtcbmV4cG9ydHMuaW5qZWN0TmV3Q3VydmUgPSBpbmplY3ROZXdDdXJ2ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2N1cnZlcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29uZmlnL2N1cnZlc1wiKSk7XG5cbnZhciBkZWZhdWx0VHJhbnNpdGlvbkJDID0gJ2xpbmVhcic7XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgTi1mcmFtZSBhbmltYXRpb24gc3RhdGUgYnkgdGhlIHN0YXJ0IGFuZCBlbmQgc3RhdGVcclxuICogICAgICAgICAgICAgIG9mIHRoZSBhbmltYXRpb24gYW5kIHRoZSBlYXNpbmcgY3VydmVcclxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHRCQyAgICAgICAgICAgICAgIEVhc2luZyBjdXJ2ZSBuYW1lIG9yIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ8QXJyYXl8T2JqZWN0fSBzdGFydFN0YXRlIEFuaW1hdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcnxBcnJheXxPYmplY3R9IGVuZFN0YXRlICAgQW5pbWF0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZnJhbWVOdW0gICAgICAgICAgICAgICAgTnVtYmVyIG9mIEFuaW1hdGlvbiBmcmFtZXNcclxuICogQHBhcmFtIHtCb29sZWFufSBkZWVwICAgICAgICAgICAgICAgICAgIFdoZXRoZXIgdG8gdXNlIHJlY3Vyc2l2ZSBtb2RlXHJcbiAqIEByZXR1cm4ge0FycmF5fEJvb2xlYW59IFN0YXRlIG9mIGVhY2ggZnJhbWUgb2YgdGhlIGFuaW1hdGlvbiAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cbmZ1bmN0aW9uIHRyYW5zaXRpb24odEJDKSB7XG4gIHZhciBzdGFydFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICB2YXIgZW5kU3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gIHZhciBmcmFtZU51bSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMzA7XG4gIHZhciBkZWVwID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBmYWxzZTtcbiAgaWYgKCFjaGVja1BhcmFtcy5hcHBseSh2b2lkIDAsIGFyZ3VtZW50cykpIHJldHVybiBmYWxzZTtcblxuICB0cnkge1xuICAgIC8vIEdldCB0aGUgdHJhbnNpdGlvbiBiZXppZXIgY3VydmVcbiAgICB2YXIgYmV6aWVyQ3VydmUgPSBnZXRCZXppZXJDdXJ2ZSh0QkMpOyAvLyBHZXQgdGhlIHByb2dyZXNzIG9mIGVhY2ggZnJhbWUgc3RhdGVcblxuICAgIHZhciBmcmFtZVN0YXRlUHJvZ3Jlc3MgPSBnZXRGcmFtZVN0YXRlUHJvZ3Jlc3MoYmV6aWVyQ3VydmUsIGZyYW1lTnVtKTsgLy8gSWYgdGhlIHJlY3Vyc2lvbiBtb2RlIGlzIG5vdCBlbmFibGVkIG9yIHRoZSBzdGF0ZSB0eXBlIGlzIE51bWJlciwgdGhlIHNoYWxsb3cgc3RhdGUgY2FsY3VsYXRpb24gaXMgcGVyZm9ybWVkIGRpcmVjdGx5LlxuXG4gICAgaWYgKCFkZWVwIHx8IHR5cGVvZiBlbmRTdGF0ZSA9PT0gJ251bWJlcicpIHJldHVybiBnZXRUcmFuc2l0aW9uU3RhdGUoc3RhcnRTdGF0ZSwgZW5kU3RhdGUsIGZyYW1lU3RhdGVQcm9ncmVzcyk7XG4gICAgcmV0dXJuIHJlY3Vyc2lvblRyYW5zaXRpb25TdGF0ZShzdGFydFN0YXRlLCBlbmRTdGF0ZSwgZnJhbWVTdGF0ZVByb2dyZXNzKTtcbiAgfSBjYXRjaCAoX3VudXNlZCkge1xuICAgIGNvbnNvbGUud2FybignVHJhbnNpdGlvbiBwYXJhbWV0ZXIgbWF5IGJlIGFibm9ybWFsIScpO1xuICAgIHJldHVybiBbZW5kU3RhdGVdO1xuICB9XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwYXJhbWV0ZXJzIGFyZSBsZWdhbFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdEJDICAgICAgTmFtZSBvZiB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FueX0gc3RhcnRTdGF0ZSAgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FueX0gZW5kU3RhdGUgICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGZyYW1lTnVtIE51bWJlciBvZiB0cmFuc2l0aW9uIGZyYW1lc1xyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBJcyB0aGUgcGFyYW1ldGVyIGxlZ2FsXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUGFyYW1zKHRCQykge1xuICB2YXIgc3RhcnRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gIHZhciBlbmRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBmcmFtZU51bSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMzA7XG5cbiAgaWYgKCF0QkMgfHwgc3RhcnRTdGF0ZSA9PT0gZmFsc2UgfHwgZW5kU3RhdGUgPT09IGZhbHNlIHx8ICFmcmFtZU51bSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RyYW5zaXRpb246IE1pc3NpbmcgUGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoc3RhcnRTdGF0ZSkgIT09ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGVuZFN0YXRlKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RyYW5zaXRpb246IEluY29uc2lzdGVudCBTdGF0dXMgVHlwZXMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHN0YXRlVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGVuZFN0YXRlKTtcblxuICBpZiAoc3RhdGVUeXBlID09PSAnc3RyaW5nJyB8fCBzdGF0ZVR5cGUgPT09ICdib29sZWFuJyB8fCAhdEJDLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3RyYW5zaXRpb246IFVuc3VwcG9ydGVkIERhdGEgVHlwZSBvZiBTdGF0ZSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIV9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmhhcyh0QkMpICYmICEodEJDIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS53YXJuKCd0cmFuc2l0aW9uOiBUcmFuc2l0aW9uIGN1cnZlIG5vdCBmb3VuZCwgZGVmYXVsdCBjdXJ2ZSB3aWxsIGJlIHVzZWQhJyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gdEJDIE5hbWUgb2YgdHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHJldHVybiB7QXJyYXl9IEJlemllciBjdXJ2ZSBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlKHRCQykge1xuICB2YXIgYmV6aWVyQ3VydmUgPSAnJztcblxuICBpZiAoX2N1cnZlc1tcImRlZmF1bHRcIl0uaGFzKHRCQykpIHtcbiAgICBiZXppZXJDdXJ2ZSA9IF9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmdldCh0QkMpO1xuICB9IGVsc2UgaWYgKHRCQyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgYmV6aWVyQ3VydmUgPSB0QkM7XG4gIH0gZWxzZSB7XG4gICAgYmV6aWVyQ3VydmUgPSBfY3VydmVzW1wiZGVmYXVsdFwiXS5nZXQoZGVmYXVsdFRyYW5zaXRpb25CQyk7XG4gIH1cblxuICByZXR1cm4gYmV6aWVyQ3VydmU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcHJvZ3Jlc3Mgb2YgZWFjaCBmcmFtZSBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBUcmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZnJhbWVOdW0gICBOdW1iZXIgb2YgdHJhbnNpdGlvbiBmcmFtZXNcclxuICogQHJldHVybiB7QXJyYXl9IFByb2dyZXNzIG9mIGVhY2ggZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0RnJhbWVTdGF0ZVByb2dyZXNzKGJlemllckN1cnZlLCBmcmFtZU51bSkge1xuICB2YXIgdE1pbnVzID0gMSAvIChmcmFtZU51bSAtIDEpO1xuICB2YXIgdFN0YXRlID0gbmV3IEFycmF5KGZyYW1lTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAodCwgaSkge1xuICAgIHJldHVybiBpICogdE1pbnVzO1xuICB9KTtcbiAgdmFyIGZyYW1lU3RhdGUgPSB0U3RhdGUubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIGdldEZyYW1lU3RhdGVGcm9tVChiZXppZXJDdXJ2ZSwgdCk7XG4gIH0pO1xuICByZXR1cm4gZnJhbWVTdGF0ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwcm9ncmVzcyBvZiB0aGUgY29ycmVzcG9uZGluZyBmcmFtZSBhY2NvcmRpbmcgdG8gdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBUcmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7TnVtYmVyfSBQcm9ncmVzcyBvZiBjdXJyZW50IGZyYW1lXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEZyYW1lU3RhdGVGcm9tVChiZXppZXJDdXJ2ZSwgdCkge1xuICB2YXIgdEJlemllckN1cnZlUG9pbnQgPSBnZXRCZXppZXJDdXJ2ZVBvaW50RnJvbVQoYmV6aWVyQ3VydmUsIHQpO1xuICB2YXIgYmV6aWVyQ3VydmVQb2ludFQgPSBnZXRCZXppZXJDdXJ2ZVBvaW50VEZyb21SZVQodEJlemllckN1cnZlUG9pbnQsIHQpO1xuICByZXR1cm4gZ2V0QmV6aWVyQ3VydmVUU3RhdGUodEJlemllckN1cnZlUG9pbnQsIGJlemllckN1cnZlUG9pbnRUKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb3JyZXNwb25kaW5nIHN1Yi1jdXJ2ZSBhY2NvcmRpbmcgdG8gdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBUcmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7QXJyYXl9IFN1Yi1jdXJ2ZSBvZiB0XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlUG9pbnRGcm9tVChiZXppZXJDdXJ2ZSwgdCkge1xuICB2YXIgbGFzdEluZGV4ID0gYmV6aWVyQ3VydmUubGVuZ3RoIC0gMTtcbiAgdmFyIGJlZ2luID0gJycsXG4gICAgICBlbmQgPSAnJztcbiAgYmV6aWVyQ3VydmUuZmluZEluZGV4KGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgaWYgKGkgPT09IGxhc3RJbmRleCkgcmV0dXJuO1xuICAgIGJlZ2luID0gaXRlbTtcbiAgICBlbmQgPSBiZXppZXJDdXJ2ZVtpICsgMV07XG4gICAgdmFyIGN1cnJlbnRNYWluUG9pbnRYID0gYmVnaW5bMF1bMF07XG4gICAgdmFyIG5leHRNYWluUG9pbnRYID0gZW5kWzBdWzBdO1xuICAgIHJldHVybiB0ID49IGN1cnJlbnRNYWluUG9pbnRYICYmIHQgPCBuZXh0TWFpblBvaW50WDtcbiAgfSk7XG4gIHZhciBwMCA9IGJlZ2luWzBdO1xuICB2YXIgcDEgPSBiZWdpblsyXSB8fCBiZWdpblswXTtcbiAgdmFyIHAyID0gZW5kWzFdIHx8IGVuZFswXTtcbiAgdmFyIHAzID0gZW5kWzBdO1xuICByZXR1cm4gW3AwLCBwMSwgcDIsIHAzXTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IGxvY2FsIHQgYmFzZWQgb24gdCBhbmQgc3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFN1Yi1jdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7TnVtYmVyfSBsb2NhbCB0IG9mIHN1Yi1jdXJ2ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZVBvaW50VEZyb21SZVQoYmV6aWVyQ3VydmUsIHQpIHtcbiAgdmFyIHJlQmVnaW5YID0gYmV6aWVyQ3VydmVbMF1bMF07XG4gIHZhciByZUVuZFggPSBiZXppZXJDdXJ2ZVszXVswXTtcbiAgdmFyIHhNaW51cyA9IHJlRW5kWCAtIHJlQmVnaW5YO1xuICB2YXIgdE1pbnVzID0gdCAtIHJlQmVnaW5YO1xuICByZXR1cm4gdE1pbnVzIC8geE1pbnVzO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGN1cnZlIHByb2dyZXNzIG9mIHRcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgU3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFByb2dyZXNzIG9mIGN1cnJlbnQgZnJhbWVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVUU3RhdGUoX3JlZiwgdCkge1xuICB2YXIgX3JlZjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZiwgNCksXG4gICAgICBfcmVmMiQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbMF0sIDIpLFxuICAgICAgcDAgPSBfcmVmMiRbMV0sXG4gICAgICBfcmVmMiQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyWzFdLCAyKSxcbiAgICAgIHAxID0gX3JlZjIkMlsxXSxcbiAgICAgIF9yZWYyJDMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbMl0sIDIpLFxuICAgICAgcDIgPSBfcmVmMiQzWzFdLFxuICAgICAgX3JlZjIkNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlszXSwgMiksXG4gICAgICBwMyA9IF9yZWYyJDRbMV07XG5cbiAgdmFyIHBvdyA9IE1hdGgucG93O1xuICB2YXIgdE1pbnVzID0gMSAtIHQ7XG4gIHZhciByZXN1bHQxID0gcDAgKiBwb3codE1pbnVzLCAzKTtcbiAgdmFyIHJlc3VsdDIgPSAzICogcDEgKiB0ICogcG93KHRNaW51cywgMik7XG4gIHZhciByZXN1bHQzID0gMyAqIHAyICogcG93KHQsIDIpICogdE1pbnVzO1xuICB2YXIgcmVzdWx0NCA9IHAzICogcG93KHQsIDMpO1xuICByZXR1cm4gMSAtIChyZXN1bHQxICsgcmVzdWx0MiArIHJlc3VsdDMgKyByZXN1bHQ0KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRyYW5zaXRpb24gc3RhdGUgYWNjb3JkaW5nIHRvIGZyYW1lIHByb2dyZXNzXHJcbiAqIEBwYXJhbSB7QW55fSBzdGFydFN0YXRlICAgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FueX0gZW5kU3RhdGUgICAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIHN0YXRlVHlwZSA9ICdvYmplY3QnO1xuICBpZiAodHlwZW9mIGJlZ2luID09PSAnbnVtYmVyJykgc3RhdGVUeXBlID0gJ251bWJlcic7XG4gIGlmIChiZWdpbiBpbnN0YW5jZW9mIEFycmF5KSBzdGF0ZVR5cGUgPSAnYXJyYXknO1xuICBpZiAoc3RhdGVUeXBlID09PSAnbnVtYmVyJykgcmV0dXJuIGdldE51bWJlclRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcbiAgaWYgKHN0YXRlVHlwZSA9PT0gJ2FycmF5JykgcmV0dXJuIGdldEFycmF5VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuICBpZiAoc3RhdGVUeXBlID09PSAnb2JqZWN0JykgcmV0dXJuIGdldE9iamVjdFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcbiAgcmV0dXJuIGZyYW1lU3RhdGUubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIGVuZDtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBkYXRhIG9mIHRoZSBudW1iZXIgdHlwZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE51bWJlclRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBtaW51cyA9IGVuZCAtIGJlZ2luO1xuICByZXR1cm4gZnJhbWVTdGF0ZS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gYmVnaW4gKyBtaW51cyAqIHM7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gZGF0YSBvZiB0aGUgYXJyYXkgdHlwZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZW5kU3RhdGUgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEFycmF5VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIG1pbnVzID0gZW5kLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIGlmICh0eXBlb2YgdiAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdiAtIGJlZ2luW2ldO1xuICB9KTtcbiAgcmV0dXJuIGZyYW1lU3RhdGUubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIG1pbnVzLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgaWYgKHYgPT09IGZhbHNlKSByZXR1cm4gZW5kW2ldO1xuICAgICAgcmV0dXJuIGJlZ2luW2ldICsgdiAqIHM7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gZGF0YSBvZiB0aGUgb2JqZWN0IHR5cGVcclxuICogQHBhcmFtIHtPYmplY3R9IHN0YXJ0U3RhdGUgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gZW5kU3RhdGUgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlICBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRPYmplY3RUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGVuZCk7XG4gIHZhciBiZWdpblZhbHVlID0ga2V5cy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICByZXR1cm4gYmVnaW5ba107XG4gIH0pO1xuICB2YXIgZW5kVmFsdWUgPSBrZXlzLm1hcChmdW5jdGlvbiAoaykge1xuICAgIHJldHVybiBlbmRba107XG4gIH0pO1xuICB2YXIgYXJyYXlTdGF0ZSA9IGdldEFycmF5VHJhbnNpdGlvblN0YXRlKGJlZ2luVmFsdWUsIGVuZFZhbHVlLCBmcmFtZVN0YXRlKTtcbiAgcmV0dXJuIGFycmF5U3RhdGUubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIGZyYW1lRGF0YSA9IHt9O1xuICAgIGl0ZW0uZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgcmV0dXJuIGZyYW1lRGF0YVtrZXlzW2ldXSA9IHY7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZyYW1lRGF0YTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBzdGF0ZSBkYXRhIGJ5IHJlY3Vyc2lvblxyXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgICAgICAgIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHJlY3Vyc2lvblRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBzdGF0ZSA9IGdldFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcblxuICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChrZXkpIHtcbiAgICB2YXIgYlRlbXAgPSBiZWdpbltrZXldO1xuICAgIHZhciBlVGVtcCA9IGVuZFtrZXldO1xuICAgIGlmICgoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShlVGVtcCkgIT09ICdvYmplY3QnKSByZXR1cm4gXCJjb250aW51ZVwiO1xuICAgIHZhciBkYXRhID0gcmVjdXJzaW9uVHJhbnNpdGlvblN0YXRlKGJUZW1wLCBlVGVtcCwgZnJhbWVTdGF0ZSk7XG4gICAgc3RhdGUuZm9yRWFjaChmdW5jdGlvbiAoZnMsIGkpIHtcbiAgICAgIHJldHVybiBmc1trZXldID0gZGF0YVtpXTtcbiAgICB9KTtcbiAgfTtcblxuICBmb3IgKHZhciBrZXkgaW4gZW5kKSB7XG4gICAgdmFyIF9yZXQgPSBfbG9vcChrZXkpO1xuXG4gICAgaWYgKF9yZXQgPT09IFwiY29udGludWVcIikgY29udGludWU7XG4gIH1cblxuICByZXR1cm4gc3RhdGU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEluamVjdCBuZXcgY3VydmUgaW50byBjdXJ2ZXMgYXMgY29uZmlnXHJcbiAqIEBwYXJhbSB7QW55fSBrZXkgICAgIFRoZSBrZXkgb2YgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gY3VydmUgQmV6aWVyIGN1cnZlIGRhdGFcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBObyByZXR1cm5cclxuICovXG5cblxuZnVuY3Rpb24gaW5qZWN0TmV3Q3VydmUoa2V5LCBjdXJ2ZSkge1xuICBpZiAoIWtleSB8fCAhY3VydmUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdJbmplY3ROZXdDdXJ2ZSBNaXNzaW5nIFBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgX2N1cnZlc1tcImRlZmF1bHRcIl0uc2V0KGtleSwgY3VydmUpO1xufVxuXG52YXIgX2RlZmF1bHQgPSB0cmFuc2l0aW9uO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGVbdG9TdHJpbmdUYWdTeW1ib2xdID1cbiAgICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBwcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGlmICghKHRvU3RyaW5nVGFnU3ltYm9sIGluIGdlbkZ1bikpIHtcbiAgICAgICAgZ2VuRnVuW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yRnVuY3Rpb25cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KVxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgR3BbdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JcIjtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiJdfQ==
