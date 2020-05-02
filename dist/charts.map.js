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
   * @description Independent color mode
   * When set to true, independent color mode is enabled
   * @type {Boolean}
   * @default independentColor = false
   */
  independentColor: false,

  /**
   * @description Independent colors
   * Only effective when independent color mode is enabled
   * Default value is the same as the color in the root configuration
   * Two-dimensional color array can produce gradient colors
   * @type {Array}
   * @example independentColor = ['#fff', '#000']
   * @example independentColor = [['#fff', '#000'], '#000']
   */
  independentColors: [],

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

    if (min < 0 && max > 0) {
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
      color = barItem.color,
      independentColor = barItem.independentColor,
      independentColors = barItem.independentColors;
  var fillColor = [barStyle.fill || color];
  var gradientColor = (0, _util2.deepMerge)(fillColor, gradient.color);

  if (independentColor) {
    var idtColor = independentColors[i % independentColors.length];
    gradientColor = idtColor instanceof Array ? idtColor : [idtColor];
  }

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
  var barWithIndependentColor = series.filter(function (_ref3) {
    var type = _ref3.type,
        independentColor = _ref3.independentColor;
    return type === 'bar' && independentColor;
  });
  barWithIndependentColor.forEach(function (bar) {
    if (bar.independentColors) return;
    bar.independentColors = color;
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
      item.percent = toFixedNoCeil(value / sum * 100, percentToFixed);
    });
    var percentSumNoLast = (0, _util2.mulAdd)(data.slice(0, -1).map(function (_ref5) {
      var percent = _ref5.percent;
      return percent;
    }));
    data.slice(-1)[0].percent = toFixedNoCeil(100 - percentSumNoLast, percentToFixed);
  });
  return pies;
}

function toFixedNoCeil(number) {
  var toFixed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var stringNumber = number.toString();
  var splitedNumber = stringNumber.split('.');
  var decimal = splitedNumber[1] || '0';
  var fixedDecimal = decimal.slice(0, toFixed);
  splitedNumber[1] = fixedDecimal;
  return parseFloat(splitedNumber.join('.'));
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

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _cRender = require("@jiaminghi/c-render");

var _graphs = require("@jiaminghi/c-render/lib/config/graphs");

var _util = require("@jiaminghi/c-render/lib/plugin/util");

var _color = require("@jiaminghi/color");

var _index = require("../util/index");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
    var number = shape.number,
        content = shape.content,
        toFixed = shape.toFixed,
        rowGap = shape.rowGap;
    var textSegments = content.split('{nt}');
    var lastSegmentIndex = textSegments.length - 1;
    var textString = '';
    textSegments.forEach(function (t, i) {
      var currentNumber = number[i];
      if (i === lastSegmentIndex) currentNumber = '';
      if (typeof currentNumber === 'number') currentNumber = currentNumber.toFixed(toFixed);
      textString += t + (currentNumber || '');
    });

    _graphs.text.draw({
      ctx: ctx
    }, {
      shape: _objectSpread({}, shape, {
        content: textString,
        rowGap: rowGap || 0
      })
    });
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
},{"../util/index":30,"@babel/runtime/helpers/defineProperty":35,"@babel/runtime/helpers/interopRequireDefault":36,"@babel/runtime/helpers/toConsumableArray":42,"@jiaminghi/c-render":52,"@jiaminghi/c-render/lib/config/graphs":51,"@jiaminghi/c-render/lib/plugin/util":54,"@jiaminghi/color":56}],29:[function(require,module,exports){
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
    if (target[key] && (0, _typeof2["default"])(target[key]) === 'object') {
      deepMerge(target[key], merged[key]);
      continue;
    }

    if ((0, _typeof2["default"])(merged[key]) === 'object') {
      target[key] = (0, _util.deepClone)(merged[key], true);
      continue;
    }

    target[key] = merged[key];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9lbnRyeS5qcyIsImxpYi9jbGFzcy9jaGFydHMuY2xhc3MuanMiLCJsaWIvY2xhc3MvdXBkYXRlci5jbGFzcy5qcyIsImxpYi9jb25maWcvYXhpcy5qcyIsImxpYi9jb25maWcvYmFyLmpzIiwibGliL2NvbmZpZy9jb2xvci5qcyIsImxpYi9jb25maWcvZ2F1Z2UuanMiLCJsaWIvY29uZmlnL2dyaWQuanMiLCJsaWIvY29uZmlnL2luZGV4LmpzIiwibGliL2NvbmZpZy9sZWdlbmQuanMiLCJsaWIvY29uZmlnL2xpbmUuanMiLCJsaWIvY29uZmlnL3BpZS5qcyIsImxpYi9jb25maWcvcmFkYXIuanMiLCJsaWIvY29uZmlnL3JhZGFyQXhpcy5qcyIsImxpYi9jb25maWcvdGl0bGUuanMiLCJsaWIvY29yZS9heGlzLmpzIiwibGliL2NvcmUvYmFyLmpzIiwibGliL2NvcmUvZ2F1Z2UuanMiLCJsaWIvY29yZS9ncmlkLmpzIiwibGliL2NvcmUvaW5kZXguanMiLCJsaWIvY29yZS9sZWdlbmQuanMiLCJsaWIvY29yZS9saW5lLmpzIiwibGliL2NvcmUvbWVyZ2VDb2xvci5qcyIsImxpYi9jb3JlL3BpZS5qcyIsImxpYi9jb3JlL3JhZGFyLmpzIiwibGliL2NvcmUvcmFkYXJBeGlzLmpzIiwibGliL2NvcmUvdGl0bGUuanMiLCJsaWIvZXh0ZW5kL2luZGV4LmpzIiwibGliL2luZGV4LmpzIiwibGliL3V0aWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5V2l0aG91dEhvbGVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXN5bmNUb0dlbmVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXlMaW1pdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlUmVzdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlU3ByZWFkLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYmV6aWVyLWN1cnZlL2xpYi9jb3JlL2JlemllckN1cnZlVG9Qb2x5bGluZS5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2Jlemllci1jdXJ2ZS9saWIvY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmUuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9iZXppZXItY3VydmUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL2NsYXNzL2NyZW5kZXIuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3MvZ3JhcGguY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3Mvc3R5bGUuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY29uZmlnL2dyYXBocy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vY2FudmFzLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvY29sb3IvbGliL2NvbmZpZy9rZXl3b3Jkcy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2NvbG9yL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL3RyYW5zaXRpb24vbGliL2NvbmZpZy9jdXJ2ZXMuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS90cmFuc2l0aW9uL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwd0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOXlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNW1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3A0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIENoYXJ0cyA9IHJlcXVpcmUoJy4uL2xpYi9pbmRleCcpXG5cbndpbmRvdy5DaGFydHMgPSBDaGFydHMiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG5yZXF1aXJlKFwiLi4vZXh0ZW5kL2luZGV4XCIpO1xuXG52YXIgX2NSZW5kZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvcmUgPSByZXF1aXJlKFwiLi4vY29yZVwiKTtcblxudmFyIENoYXJ0cyA9IGZ1bmN0aW9uIENoYXJ0cyhkb20pIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBDaGFydHMpO1xuXG4gIGlmICghZG9tKSB7XG4gICAgY29uc29sZS5lcnJvcignQ2hhcnRzIE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgY2xpZW50V2lkdGggPSBkb20uY2xpZW50V2lkdGgsXG4gICAgICBjbGllbnRIZWlnaHQgPSBkb20uY2xpZW50SGVpZ2h0O1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgY2xpZW50V2lkdGgpO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBjbGllbnRIZWlnaHQpO1xuICBkb20uYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgdmFyIGF0dHJpYnV0ZSA9IHtcbiAgICBjb250YWluZXI6IGRvbSxcbiAgICBjYW52YXM6IGNhbnZhcyxcbiAgICByZW5kZXI6IG5ldyBfY1JlbmRlcltcImRlZmF1bHRcIl0oY2FudmFzKSxcbiAgICBvcHRpb246IG51bGxcbiAgfTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBhdHRyaWJ1dGUpO1xufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIFNldCBjaGFydCBvcHRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb24gQ2hhcnQgb3B0aW9uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGFuaW1hdGlvbkVuZCBFeGVjdXRlIGFuaW1hdGlvbkVuZFxuICogQHJldHVybiB7VW5kZWZpbmVkfSBObyByZXR1cm5cbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ2hhcnRzO1xuXG5DaGFydHMucHJvdG90eXBlLnNldE9wdGlvbiA9IGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgdmFyIGFuaW1hdGlvbkVuZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgaWYgKCFvcHRpb24gfHwgKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkob3B0aW9uKSAhPT0gJ29iamVjdCcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdzZXRPcHRpb24gTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChhbmltYXRpb25FbmQpIHRoaXMucmVuZGVyLmdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5hbmltYXRpb25FbmQoKTtcbiAgfSk7XG4gIHZhciBvcHRpb25DbG9uZWQgPSAoMCwgX3V0aWwuZGVlcENsb25lKShvcHRpb24sIHRydWUpO1xuICAoMCwgX2NvcmUubWVyZ2VDb2xvcikodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmdyaWQpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5heGlzKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUucmFkYXJBeGlzKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUudGl0bGUpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5iYXIpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5saW5lKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUucGllKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUucmFkYXIpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5nYXVnZSkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmxlZ2VuZCkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgdGhpcy5vcHRpb24gPSBvcHRpb247XG4gIHRoaXMucmVuZGVyLmxhdW5jaEFuaW1hdGlvbigpOyAvLyBjb25zb2xlLndhcm4odGhpcylcbn07XG4vKipcbiAqIEBkZXNjcmlwdGlvbiBSZXNpemUgY2hhcnRcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gTm8gcmV0dXJuXG4gKi9cblxuXG5DaGFydHMucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyLFxuICAgICAgY2FudmFzID0gdGhpcy5jYW52YXMsXG4gICAgICByZW5kZXIgPSB0aGlzLnJlbmRlcixcbiAgICAgIG9wdGlvbiA9IHRoaXMub3B0aW9uO1xuICB2YXIgY2xpZW50V2lkdGggPSBjb250YWluZXIuY2xpZW50V2lkdGgsXG4gICAgICBjbGllbnRIZWlnaHQgPSBjb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGNsaWVudFdpZHRoKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgY2xpZW50SGVpZ2h0KTtcbiAgcmVuZGVyLmFyZWEgPSBbY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodF07XG4gIHRoaXMuc2V0T3B0aW9uKG9wdGlvbik7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZG9VcGRhdGUgPSBkb1VwZGF0ZTtcbmV4cG9ydHMuVXBkYXRlciA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG52YXIgVXBkYXRlciA9IGZ1bmN0aW9uIFVwZGF0ZXIoY29uZmlnLCBzZXJpZXMpIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBVcGRhdGVyKTtcbiAgdmFyIGNoYXJ0ID0gY29uZmlnLmNoYXJ0LFxuICAgICAga2V5ID0gY29uZmlnLmtleSxcbiAgICAgIGdldEdyYXBoQ29uZmlnID0gY29uZmlnLmdldEdyYXBoQ29uZmlnO1xuXG4gIGlmICh0eXBlb2YgZ2V0R3JhcGhDb25maWcgIT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLndhcm4oJ1VwZGF0ZXIgbmVlZCBmdW5jdGlvbiBnZXRHcmFwaENvbmZpZyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNoYXJ0W2tleV0pIHRoaXMuZ3JhcGhzID0gY2hhcnRba2V5XSA9IFtdO1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGNvbmZpZyk7XG4gIHRoaXMudXBkYXRlKHNlcmllcyk7XG59O1xuXG5leHBvcnRzLlVwZGF0ZXIgPSBVcGRhdGVyO1xuXG5VcGRhdGVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoc2VyaWVzKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzLFxuICAgICAgYmVmb3JlVXBkYXRlID0gdGhpcy5iZWZvcmVVcGRhdGU7XG4gIGRlbFJlZHVuZGFuY2VHcmFwaCh0aGlzLCBzZXJpZXMpO1xuICBpZiAoIXNlcmllcy5sZW5ndGgpIHJldHVybjtcbiAgdmFyIGJlZm9yZVVwZGF0ZVR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShiZWZvcmVVcGRhdGUpO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoc2VyaWVzSXRlbSwgaSkge1xuICAgIGlmIChiZWZvcmVVcGRhdGVUeXBlID09PSAnZnVuY3Rpb24nKSBiZWZvcmVVcGRhdGUoZ3JhcGhzLCBzZXJpZXNJdGVtLCBpLCBfdGhpcyk7XG4gICAgdmFyIGNhY2hlID0gZ3JhcGhzW2ldO1xuXG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICBjaGFuZ2VHcmFwaHMoY2FjaGUsIHNlcmllc0l0ZW0sIGksIF90aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkR3JhcGhzKGdyYXBocywgc2VyaWVzSXRlbSwgaSwgX3RoaXMpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBkZWxSZWR1bmRhbmNlR3JhcGgodXBkYXRlciwgc2VyaWVzKSB7XG4gIHZhciBncmFwaHMgPSB1cGRhdGVyLmdyYXBocyxcbiAgICAgIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgY2FjaGVHcmFwaE51bSA9IGdyYXBocy5sZW5ndGg7XG4gIHZhciBuZWVkR3JhcGhOdW0gPSBzZXJpZXMubGVuZ3RoO1xuXG4gIGlmIChjYWNoZUdyYXBoTnVtID4gbmVlZEdyYXBoTnVtKSB7XG4gICAgdmFyIG5lZWREZWxHcmFwaHMgPSBncmFwaHMuc3BsaWNlKG5lZWRHcmFwaE51bSk7XG4gICAgbmVlZERlbEdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFuZ2VHcmFwaHMoY2FjaGUsIHNlcmllc0l0ZW0sIGksIHVwZGF0ZXIpIHtcbiAgdmFyIGdldEdyYXBoQ29uZmlnID0gdXBkYXRlci5nZXRHcmFwaENvbmZpZyxcbiAgICAgIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyLFxuICAgICAgYmVmb3JlQ2hhbmdlID0gdXBkYXRlci5iZWZvcmVDaGFuZ2U7XG4gIHZhciBjb25maWdzID0gZ2V0R3JhcGhDb25maWcoc2VyaWVzSXRlbSwgdXBkYXRlcik7XG4gIGJhbGFuY2VHcmFwaHNOdW0oY2FjaGUsIGNvbmZpZ3MsIHJlbmRlcik7XG4gIGNhY2hlLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoLCBqKSB7XG4gICAgdmFyIGNvbmZpZyA9IGNvbmZpZ3Nbal07XG4gICAgaWYgKHR5cGVvZiBiZWZvcmVDaGFuZ2UgPT09ICdmdW5jdGlvbicpIGJlZm9yZUNoYW5nZShncmFwaCwgY29uZmlnKTtcbiAgICB1cGRhdGVHcmFwaENvbmZpZ0J5S2V5KGdyYXBoLCBjb25maWcpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYmFsYW5jZUdyYXBoc051bShncmFwaHMsIGdyYXBoQ29uZmlnLCByZW5kZXIpIHtcbiAgdmFyIGNhY2hlR3JhcGhOdW0gPSBncmFwaHMubGVuZ3RoO1xuICB2YXIgbmVlZEdyYXBoTnVtID0gZ3JhcGhDb25maWcubGVuZ3RoO1xuXG4gIGlmIChuZWVkR3JhcGhOdW0gPiBjYWNoZUdyYXBoTnVtKSB7XG4gICAgdmFyIGxhc3RDYWNoZUdyYXBoID0gZ3JhcGhzLnNsaWNlKC0xKVswXTtcbiAgICB2YXIgbmVlZEFkZEdyYXBoTnVtID0gbmVlZEdyYXBoTnVtIC0gY2FjaGVHcmFwaE51bTtcbiAgICB2YXIgbmVlZEFkZEdyYXBocyA9IG5ldyBBcnJheShuZWVkQWRkR3JhcGhOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2xvbmUobGFzdENhY2hlR3JhcGgpO1xuICAgIH0pO1xuICAgIGdyYXBocy5wdXNoLmFwcGx5KGdyYXBocywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZWVkQWRkR3JhcGhzKSk7XG4gIH0gZWxzZSBpZiAobmVlZEdyYXBoTnVtIDwgY2FjaGVHcmFwaE51bSkge1xuICAgIHZhciBuZWVkRGVsQ2FjaGUgPSBncmFwaHMuc3BsaWNlKG5lZWRHcmFwaE51bSk7XG4gICAgbmVlZERlbENhY2hlLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkR3JhcGhzKGdyYXBocywgc2VyaWVzSXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgZ2V0R3JhcGhDb25maWcgPSB1cGRhdGVyLmdldEdyYXBoQ29uZmlnLFxuICAgICAgZ2V0U3RhcnRHcmFwaENvbmZpZyA9IHVwZGF0ZXIuZ2V0U3RhcnRHcmFwaENvbmZpZyxcbiAgICAgIGNoYXJ0ID0gdXBkYXRlci5jaGFydDtcbiAgdmFyIHJlbmRlciA9IGNoYXJ0LnJlbmRlcjtcbiAgdmFyIHN0YXJ0Q29uZmlncyA9IG51bGw7XG4gIGlmICh0eXBlb2YgZ2V0U3RhcnRHcmFwaENvbmZpZyA9PT0gJ2Z1bmN0aW9uJykgc3RhcnRDb25maWdzID0gZ2V0U3RhcnRHcmFwaENvbmZpZyhzZXJpZXNJdGVtLCB1cGRhdGVyKTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRHcmFwaENvbmZpZyhzZXJpZXNJdGVtLCB1cGRhdGVyKTtcbiAgaWYgKCFjb25maWdzLmxlbmd0aCkgcmV0dXJuO1xuXG4gIGlmIChzdGFydENvbmZpZ3MpIHtcbiAgICBncmFwaHNbaV0gPSBzdGFydENvbmZpZ3MubWFwKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuYWRkKGNvbmZpZyk7XG4gICAgfSk7XG4gICAgZ3JhcGhzW2ldLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoLCBpKSB7XG4gICAgICB2YXIgY29uZmlnID0gY29uZmlnc1tpXTtcbiAgICAgIHVwZGF0ZUdyYXBoQ29uZmlnQnlLZXkoZ3JhcGgsIGNvbmZpZyk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZ3JhcGhzW2ldID0gY29uZmlncy5tYXAoZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgcmV0dXJuIHJlbmRlci5hZGQoY29uZmlnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBhZnRlckFkZEdyYXBoID0gdXBkYXRlci5hZnRlckFkZEdyYXBoO1xuICBpZiAodHlwZW9mIGFmdGVyQWRkR3JhcGggPT09ICdmdW5jdGlvbicpIGFmdGVyQWRkR3JhcGgoZ3JhcGhzW2ldKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlR3JhcGhDb25maWdCeUtleShncmFwaCwgY29uZmlnKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY29uZmlnKTtcbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5ID09PSAnc2hhcGUnIHx8IGtleSA9PT0gJ3N0eWxlJykge1xuICAgICAgZ3JhcGguYW5pbWF0aW9uKGtleSwgY29uZmlnW2tleV0sIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBncmFwaFtrZXldID0gY29uZmlnW2tleV07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZG9VcGRhdGUoKSB7XG4gIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fSxcbiAgICAgIGNoYXJ0ID0gX3JlZi5jaGFydCxcbiAgICAgIHNlcmllcyA9IF9yZWYuc2VyaWVzLFxuICAgICAga2V5ID0gX3JlZi5rZXksXG4gICAgICBnZXRHcmFwaENvbmZpZyA9IF9yZWYuZ2V0R3JhcGhDb25maWcsXG4gICAgICBnZXRTdGFydEdyYXBoQ29uZmlnID0gX3JlZi5nZXRTdGFydEdyYXBoQ29uZmlnLFxuICAgICAgYmVmb3JlQ2hhbmdlID0gX3JlZi5iZWZvcmVDaGFuZ2UsXG4gICAgICBiZWZvcmVVcGRhdGUgPSBfcmVmLmJlZm9yZVVwZGF0ZSxcbiAgICAgIGFmdGVyQWRkR3JhcGggPSBfcmVmLmFmdGVyQWRkR3JhcGg7XG5cbiAgaWYgKGNoYXJ0W2tleV0pIHtcbiAgICBjaGFydFtrZXldLnVwZGF0ZShzZXJpZXMpO1xuICB9IGVsc2Uge1xuICAgIGNoYXJ0W2tleV0gPSBuZXcgVXBkYXRlcih7XG4gICAgICBjaGFydDogY2hhcnQsXG4gICAgICBrZXk6IGtleSxcbiAgICAgIGdldEdyYXBoQ29uZmlnOiBnZXRHcmFwaENvbmZpZyxcbiAgICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0R3JhcGhDb25maWcsXG4gICAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZSxcbiAgICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlLFxuICAgICAgYWZ0ZXJBZGRHcmFwaDogYWZ0ZXJBZGRHcmFwaFxuICAgIH0sIHNlcmllcyk7XG4gIH1cbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMueUF4aXNDb25maWcgPSBleHBvcnRzLnhBeGlzQ29uZmlnID0gdm9pZCAwO1xudmFyIHhBeGlzQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgYXhpc1xuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHBvc2l0aW9uXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ2JvdHRvbSdcbiAgICogQGV4YW1wbGUgcG9zaXRpb24gPSAnYm90dG9tJyB8ICd0b3AnXG4gICAqL1xuICBwb3NpdGlvbjogJ2JvdHRvbScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBOYW1lIGdhcFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBuYW1lR2FwID0gMTVcbiAgICovXG4gIG5hbWVHYXA6IDE1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBsb2NhdGlvblxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lTG9jYXRpb24gPSAnZW5kJ1xuICAgKiBAZXhhbXBsZSBuYW1lTG9jYXRpb24gPSAnZW5kJyB8ICdjZW50ZXInIHwgJ3N0YXJ0J1xuICAgKi9cbiAgbmFtZUxvY2F0aW9uOiAnZW5kJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBuYW1lVGV4dFN0eWxlOiB7XG4gICAgZmlsbDogJyMzMzMnLFxuICAgIGZvbnRTaXplOiAxMFxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBtaW4gdmFsdWVcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1pbiA9ICcyMCUnXG4gICAqIEBleGFtcGxlIG1pbiA9ICcyMCUnIHwgMFxuICAgKi9cbiAgbWluOiAnMjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbWF4IHZhbHVlXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtYXggPSAnMjAlJ1xuICAgKiBAZXhhbXBsZSBtYXggPSAnMjAlJyB8IDBcbiAgICovXG4gIG1heDogJzIwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHZhbHVlIGludGVydmFsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGludGVydmFsID0gbnVsbFxuICAgKiBAZXhhbXBsZSBpbnRlcnZhbCA9IDEwMFxuICAgKi9cbiAgaW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBNaW4gaW50ZXJ2YWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbWluSW50ZXJ2YWwgPSBudWxsXG4gICAqIEBleGFtcGxlIG1pbkludGVydmFsID0gMVxuICAgKi9cbiAgbWluSW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBNYXggaW50ZXJ2YWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbWF4SW50ZXJ2YWwgPSBudWxsXG4gICAqIEBleGFtcGxlIG1heEludGVydmFsID0gMTAwXG4gICAqL1xuICBtYXhJbnRlcnZhbDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJvdW5kYXJ5IGdhcFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgYm91bmRhcnlHYXAgPSBudWxsXG4gICAqIEBleGFtcGxlIGJvdW5kYXJ5R2FwID0gdHJ1ZVxuICAgKi9cbiAgYm91bmRhcnlHYXA6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IG51bWJlclxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzcGxpdE51bWJlciA9IDVcbiAgICovXG4gIHNwbGl0TnVtYmVyOiA1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsaW5lIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMaW5lOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxpbmVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzMzMycsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc1RpY2s6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgdGlja1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjMzMzJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX3ku7YnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0udmFsdWUpXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmaWxsOiAnIzMzMycsXG4gICAgICBmb250U2l6ZTogMTAsXG4gICAgICByb3RhdGU6IDBcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IGxpbmUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgc3BsaXRMaW5lOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIHNwbGl0IGxpbmVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjZDRkNGQ0JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFggYXhpcyByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gLTIwXG4gICAqL1xuICByTGV2ZWw6IC0yMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFggYXhpcyBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gWCBheGlzIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLnhBeGlzQ29uZmlnID0geEF4aXNDb25maWc7XG52YXIgeUF4aXNDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBuYW1lXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG5hbWUgPSAnJ1xuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyBheGlzXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgcG9zaXRpb25cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgcG9zaXRpb24gPSAnbGVmdCdcbiAgICogQGV4YW1wbGUgcG9zaXRpb24gPSAnbGVmdCcgfCAncmlnaHQnXG4gICAqL1xuICBwb3NpdGlvbjogJ2xlZnQnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBnYXBcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbmFtZUdhcCA9IDE1XG4gICAqL1xuICBuYW1lR2FwOiAxNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgbG9jYXRpb25cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZUxvY2F0aW9uID0gJ2VuZCdcbiAgICogQGV4YW1wbGUgbmFtZUxvY2F0aW9uID0gJ2VuZCcgfCAnY2VudGVyJyB8ICdzdGFydCdcbiAgICovXG4gIG5hbWVMb2NhdGlvbjogJ2VuZCcsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBuYW1lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgbmFtZVRleHRTdHlsZToge1xuICAgIGZpbGw6ICcjMzMzJyxcbiAgICBmb250U2l6ZTogMTBcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbWluIHZhbHVlXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtaW4gPSAnMjAlJ1xuICAgKiBAZXhhbXBsZSBtaW4gPSAnMjAlJyB8IDBcbiAgICovXG4gIG1pbjogJzIwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG1heCB2YWx1ZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgbWF4ID0gJzIwJSdcbiAgICogQGV4YW1wbGUgbWF4ID0gJzIwJScgfCAwXG4gICAqL1xuICBtYXg6ICcyMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyB2YWx1ZSBpbnRlcnZhbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpbnRlcnZhbCA9IG51bGxcbiAgICogQGV4YW1wbGUgaW50ZXJ2YWwgPSAxMDBcbiAgICovXG4gIGludGVydmFsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTWluIGludGVydmFsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1pbkludGVydmFsID0gbnVsbFxuICAgKiBAZXhhbXBsZSBtaW5JbnRlcnZhbCA9IDFcbiAgICovXG4gIG1pbkludGVydmFsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTWF4IGludGVydmFsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1heEludGVydmFsID0gbnVsbFxuICAgKiBAZXhhbXBsZSBtYXhJbnRlcnZhbCA9IDEwMFxuICAgKi9cbiAgbWF4SW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCb3VuZGFyeSBnYXBcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGJvdW5kYXJ5R2FwID0gbnVsbFxuICAgKiBAZXhhbXBsZSBib3VuZGFyeUdhcCA9IHRydWVcbiAgICovXG4gIGJvdW5kYXJ5R2FwOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBudW1iZXJcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3BsaXROdW1iZXIgPSA1XG4gICAqL1xuICBzcGxpdE51bWJlcjogNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGluZToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyMzMzMnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNUaWNrOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIHRpY2tcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzMzMycsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV95Lu2J1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyMzMzMnLFxuICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgcm90YXRlOiAwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBsaW5lIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHNwbGl0TGluZToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBzcGxpdCBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyNkNGQ0ZDQnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gWSBheGlzIHJlbmRlciBsZXZlbFxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAtMjBcbiAgICovXG4gIHJMZXZlbDogLTIwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gWSBheGlzIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBZIGF4aXMgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMueUF4aXNDb25maWcgPSB5QXhpc0NvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYmFyQ29uZmlnID0gdm9pZCAwO1xudmFyIGJhckNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyBiYXIgY2hhcnRcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIERhdGEgc3RhY2tpbmdcbiAgICogVGhlIGRhdGEgdmFsdWUgb2YgdGhlIHNlcmllcyBlbGVtZW50IG9mIHRoZSBzYW1lIHN0YWNrXG4gICAqIHdpbGwgYmUgc3VwZXJpbXBvc2VkICh0aGUgbGF0dGVyIHZhbHVlIHdpbGwgYmUgc3VwZXJpbXBvc2VkIG9uIHRoZSBwcmV2aW91cyB2YWx1ZSlcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgc3RhY2sgPSAnJ1xuICAgKi9cbiAgc3RhY2s6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHNoYXBlIHR5cGVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgc2hhcGVUeXBlID0gJ25vcm1hbCdcbiAgICogQGV4YW1wbGUgc2hhcGVUeXBlID0gJ25vcm1hbCcgfCAnbGVmdEVjaGVsb24nIHwgJ3JpZ2h0RWNoZWxvbidcbiAgICovXG4gIHNoYXBlVHlwZTogJ25vcm1hbCcsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBFY2hlbG9uIGJhciBzaGFycG5lc3Mgb2Zmc2V0XG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGVjaGVsb25PZmZzZXQgPSAxMFxuICAgKi9cbiAgZWNoZWxvbk9mZnNldDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgd2lkdGhcbiAgICogVGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgc2V0IG9uIHRoZSBsYXN0ICdiYXInIHNlcmllc1xuICAgKiBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtIHRvIHRha2UgZWZmZWN0IGFuZCB3aWxsIGJlIGluIGVmZmVjdFxuICAgKiBmb3IgYWxsICdiYXInIHNlcmllcyBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBiYXJXaWR0aCA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSBiYXJXaWR0aCA9ICdhdXRvJyB8ICcxMCUnIHwgMjBcbiAgICovXG4gIGJhcldpZHRoOiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgZ2FwXG4gICAqIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIHNldCBvbiB0aGUgbGFzdCAnYmFyJyBzZXJpZXNcbiAgICogaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbSB0byB0YWtlIGVmZmVjdCBhbmQgd2lsbCBiZSBpbiBlZmZlY3RcbiAgICogZm9yIGFsbCAnYmFyJyBzZXJpZXMgaW4gdGhpcyBjb29yZGluYXRlIHN5c3RlbVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgYmFyR2FwID0gJzMwJSdcbiAgICogQGV4YW1wbGUgYmFyR2FwID0gJzMwJScgfCAzMFxuICAgKi9cbiAgYmFyR2FwOiAnMzAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBjYXRlZ29yeSBnYXBcbiAgICogVGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgc2V0IG9uIHRoZSBsYXN0ICdiYXInIHNlcmllc1xuICAgKiBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtIHRvIHRha2UgZWZmZWN0IGFuZCB3aWxsIGJlIGluIGVmZmVjdFxuICAgKiBmb3IgYWxsICdiYXInIHNlcmllcyBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBiYXJDYXRlZ29yeUdhcCA9ICcyMCUnXG4gICAqIEBleGFtcGxlIGJhckNhdGVnb3J5R2FwID0gJzIwJScgfCAyMFxuICAgKi9cbiAgYmFyQ2F0ZWdvcnlHYXA6ICcyMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHggYXhpcyBpbmRleFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB4QXhpc0luZGV4ID0gMFxuICAgKiBAZXhhbXBsZSB4QXhpc0luZGV4ID0gMCB8IDFcbiAgICovXG4gIHhBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgeSBheGlzIGluZGV4XG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHlBeGlzSW5kZXggPSAwXG4gICAqIEBleGFtcGxlIHlBeGlzSW5kZXggPSAwIHwgMVxuICAgKi9cbiAgeUF4aXNJbmRleDogMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBjaGFydCBkYXRhXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgZGF0YSA9IFtdXG4gICAqIEBleGFtcGxlIGRhdGEgPSBbMTAwLCAyMDAsIDMwMF1cbiAgICovXG4gIGRhdGE6IFtdLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFja2dyb3VuZCBiYXIgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYmFja2dyb3VuZEJhcjoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYmFja2dyb3VuZCBiYXJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYWNrZ3JvdW5kIGJhciB3aWR0aFxuICAgICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHdpZHRoID0gJ2F1dG8nXG4gICAgICogQGV4YW1wbGUgd2lkdGggPSAnYXV0bycgfCAnMzAlJyB8IDMwXG4gICAgICovXG4gICAgd2lkdGg6ICdhdXRvJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYWNrZ3JvdW5kIGJhciBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICdyZ2JhKDIwMCwgMjAwLCAyMDAsIC40KSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgbGFiZWw6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGJhciBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBwb3NpdGlvblxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcG9zaXRpb24gPSAndG9wJ1xuICAgICAqIEBleGFtcGxlIHBvc2l0aW9uID0gJ3RvcCcgfCAnY2VudGVyJyB8ICdib3R0b20nXG4gICAgICovXG4gICAgcG9zaXRpb246ICd0b3AnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBvZmZzZXRcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIC0xMF1cbiAgICAgKi9cbiAgICBvZmZzZXQ6IFswLCAtMTBdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfeS7tidcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFyIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGdyYWRpZW50IGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGdyYWRpZW50OiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IGNvbG9yIChIZXh8cmdifHJnYmEpXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTG9jYWwgZ3JhZGllbnRcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBsb2NhbCA9IHRydWVcbiAgICAgKi9cbiAgICBsb2NhbDogdHJ1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIHN0eWxlIGRlZmF1bHQgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgYmFyU3R5bGU6IHt9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gSW5kZXBlbmRlbnQgY29sb3IgbW9kZVxuICAgKiBXaGVuIHNldCB0byB0cnVlLCBpbmRlcGVuZGVudCBjb2xvciBtb2RlIGlzIGVuYWJsZWRcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGluZGVwZW5kZW50Q29sb3IgPSBmYWxzZVxuICAgKi9cbiAgaW5kZXBlbmRlbnRDb2xvcjogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBJbmRlcGVuZGVudCBjb2xvcnNcbiAgICogT25seSBlZmZlY3RpdmUgd2hlbiBpbmRlcGVuZGVudCBjb2xvciBtb2RlIGlzIGVuYWJsZWRcbiAgICogRGVmYXVsdCB2YWx1ZSBpcyB0aGUgc2FtZSBhcyB0aGUgY29sb3IgaW4gdGhlIHJvb3QgY29uZmlndXJhdGlvblxuICAgKiBUd28tZGltZW5zaW9uYWwgY29sb3IgYXJyYXkgY2FuIHByb2R1Y2UgZ3JhZGllbnQgY29sb3JzXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGV4YW1wbGUgaW5kZXBlbmRlbnRDb2xvciA9IFsnI2ZmZicsICcjMDAwJ11cbiAgICogQGV4YW1wbGUgaW5kZXBlbmRlbnRDb2xvciA9IFtbJyNmZmYnLCAnIzAwMCddLCAnIzAwMCddXG4gICAqL1xuICBpbmRlcGVuZGVudENvbG9yczogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDBcbiAgICovXG4gIHJMZXZlbDogMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmJhckNvbmZpZyA9IGJhckNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuY29sb3JDb25maWcgPSB2b2lkIDA7XG52YXIgY29sb3JDb25maWcgPSBbJyMzN2EyZGEnLCAnIzMyYzVlOScsICcjNjdlMGUzJywgJyM5ZmU2YjgnLCAnI2ZmZGI1YycsICcjZmY5ZjdmJywgJyNmYjcyOTMnLCAnI2UwNjJhZScsICcjZTY5MGQxJywgJyNlN2JjZjMnLCAnIzlkOTZmNScsICcjODM3OGVhJywgJyM5NmJmZmYnXTtcbmV4cG9ydHMuY29sb3JDb25maWcgPSBjb2xvckNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2F1Z2VDb25maWcgPSB2b2lkIDA7XG52YXIgZ2F1Z2VDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgZ2F1Z2VcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGl1cyBvZiBnYXVnZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcmFkaXVzID0gJzYwJSdcbiAgICogQGV4YW1wbGUgcmFkaXVzID0gJzYwJScgfCAxMDBcbiAgICovXG4gIHJhZGl1czogJzYwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDZW50ZXIgcG9pbnQgb2YgZ2F1Z2VcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBjZW50ZXIgPSBbJzUwJScsJzUwJSddXG4gICAqIEBleGFtcGxlIGNlbnRlciA9IFsnNTAlJywnNTAlJ10gfCBbMTAwLCAxMDBdXG4gICAqL1xuICBjZW50ZXI6IFsnNTAlJywgJzUwJSddLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2Ugc3RhcnQgYW5nbGVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3RhcnRBbmdsZSA9IC0oTWF0aC5QSSAvIDQpICogNVxuICAgKiBAZXhhbXBsZSBzdGFydEFuZ2xlID0gLU1hdGguUElcbiAgICovXG4gIHN0YXJ0QW5nbGU6IC0oTWF0aC5QSSAvIDQpICogNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGVuZCBhbmdsZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBlbmRBbmdsZSA9IE1hdGguUEkgLyA0XG4gICAqIEBleGFtcGxlIGVuZEFuZ2xlID0gMFxuICAgKi9cbiAgZW5kQW5nbGU6IE1hdGguUEkgLyA0LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgbWluIHZhbHVlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1pbiA9IDBcbiAgICovXG4gIG1pbjogMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIG1heCB2YWx1ZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtYXggPSAxMDBcbiAgICovXG4gIG1heDogMTAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2Ugc3BsaXQgbnVtYmVyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHNwbGl0TnVtID0gNVxuICAgKi9cbiAgc3BsaXROdW06IDUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBhcmMgbGluZSB3aWR0aFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhcmNMaW5lV2lkdGggPSAxNVxuICAgKi9cbiAgYXJjTGluZVdpZHRoOiAxNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGNoYXJ0IGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICovXG4gIGRhdGE6IFtdLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBpdGVtIGFyYyBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgZGF0YUl0ZW1TdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgZGF0YUl0ZW1TdHlsZToge30sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc1RpY2s6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgdGlja1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgbGVuZ3RoXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCB0aWNrTGVuZ3RoID0gNlxuICAgICAqL1xuICAgIHRpY2tMZW5ndGg6IDYsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyB0aWNrIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzk5OScsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRhdGEgKENhbiBiZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkpXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGRhdGEgPSBbTnVtYmVyLi4uXVxuICAgICAqL1xuICAgIGRhdGE6IFtdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChsYWJlbEl0ZW0pID0+IChsYWJlbEl0ZW0udmFsdWUpXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIGF4aXMgdGlja1xuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgbGFiZWxHYXAgPSA1XG4gICAgICovXG4gICAgbGFiZWxHYXA6IDUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHt9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBwb2ludGVyIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHBvaW50ZXI6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHBvaW50ZXJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gUG9pbnRlciB2YWx1ZSBpbmRleCBvZiBkYXRhXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCB2YWx1ZUluZGV4ID0gMCAocG9pbnRlci52YWx1ZSA9IGRhdGFbMF0udmFsdWUpXG4gICAgICovXG4gICAgdmFsdWVJbmRleDogMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBQb2ludGVyIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc2NhbGU6IFsxLCAxXSxcbiAgICAgIGZpbGw6ICcjZmI3MjkzJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIERhdGEgaXRlbSBhcmMgZGV0YWlsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGRldGFpbHM6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGRldGFpbHNcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV9JSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne25hbWV9JSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gRGV0YWlscyBwb3NpdGlvbiBvZmZzZXRcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIDBdXG4gICAgICogQGV4YW1wbGUgb2Zmc2V0ID0gWzEwLCAxMF1cbiAgICAgKi9cbiAgICBvZmZzZXQ6IFswLCAwXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBWYWx1ZSBmcmFjdGlvbmFsIHByZWNpc2lvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgdmFsdWVUb0ZpeGVkID0gMFxuICAgICAqL1xuICAgIHZhbHVlVG9GaXhlZDogMCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIHBvc2l0aW9uXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICdjZW50ZXInXG4gICAgICogQGV4YW1wbGUgcG9zaXRpb24gPSAnc3RhcnQnIHwgJ2NlbnRlcicgfCAnZW5kJ1xuICAgICAqL1xuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDIwLFxuICAgICAgZm9udFdlaWdodDogJ2JvbGQnLFxuICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBiYWNrZ3JvdW5kIGFyYyBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBiYWNrZ3JvdW5kQXJjOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBiYWNrZ3JvdW5kIGFyY1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYWNrZ3JvdW5kIGFyYyBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyNlMGUwZTAnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXG4gICAqL1xuICByTGV2ZWw6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmdhdWdlQ29uZmlnID0gZ2F1Z2VDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdyaWRDb25maWcgPSB2b2lkIDA7XG52YXIgZ3JpZENvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGxlZnQgbWFyZ2luXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBsZWZ0ID0gJzEwJSdcbiAgICogQGV4YW1wbGUgbGVmdCA9ICcxMCUnIHwgMTBcbiAgICovXG4gIGxlZnQ6ICcxMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR3JpZCByaWdodCBtYXJnaW5cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJpZ2h0ID0gJzEwJSdcbiAgICogQGV4YW1wbGUgcmlnaHQgPSAnMTAlJyB8IDEwXG4gICAqL1xuICByaWdodDogJzEwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIHRvcCBtYXJnaW5cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHRvcCA9IDYwXG4gICAqIEBleGFtcGxlIHRvcCA9ICcxMCUnIHwgNjBcbiAgICovXG4gIHRvcDogNjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGJvdHRvbSBtYXJnaW5cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGJvdHRvbSA9IDYwXG4gICAqIEBleGFtcGxlIGJvdHRvbSA9ICcxMCUnIHwgNjBcbiAgICovXG4gIGJvdHRvbTogNjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgc3R5bGU6IHtcbiAgICBmaWxsOiAncmdiYSgwLCAwLCAwLCAwKSdcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IC0zMFxuICAgKi9cbiAgckxldmVsOiAtMzAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogMzBcbn07XG5leHBvcnRzLmdyaWRDb25maWcgPSBncmlkQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jaGFuZ2VEZWZhdWx0Q29uZmlnID0gY2hhbmdlRGVmYXVsdENvbmZpZztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImNvbG9yQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9jb2xvci5jb2xvckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJncmlkQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9ncmlkLmdyaWRDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwieEF4aXNDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2F4aXMueEF4aXNDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwieUF4aXNDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2F4aXMueUF4aXNDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidGl0bGVDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3RpdGxlLnRpdGxlQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImxpbmVDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2xpbmUubGluZUNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJiYXJDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2Jhci5iYXJDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicGllQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9waWUucGllQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyQXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcmFkYXJBeGlzLnJhZGFyQXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJyYWRhckNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcmFkYXIucmFkYXJDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2F1Z2VDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dhdWdlLmdhdWdlQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImxlZ2VuZENvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGVnZW5kLmxlZ2VuZENvbmZpZztcbiAgfVxufSk7XG5leHBvcnRzLmtleXMgPSB2b2lkIDA7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiLi9jb2xvclwiKTtcblxudmFyIF9ncmlkID0gcmVxdWlyZShcIi4vZ3JpZFwiKTtcblxudmFyIF9heGlzID0gcmVxdWlyZShcIi4vYXhpc1wiKTtcblxudmFyIF90aXRsZSA9IHJlcXVpcmUoXCIuL3RpdGxlXCIpO1xuXG52YXIgX2xpbmUgPSByZXF1aXJlKFwiLi9saW5lXCIpO1xuXG52YXIgX2JhciA9IHJlcXVpcmUoXCIuL2JhclwiKTtcblxudmFyIF9waWUgPSByZXF1aXJlKFwiLi9waWVcIik7XG5cbnZhciBfcmFkYXJBeGlzID0gcmVxdWlyZShcIi4vcmFkYXJBeGlzXCIpO1xuXG52YXIgX3JhZGFyID0gcmVxdWlyZShcIi4vcmFkYXJcIik7XG5cbnZhciBfZ2F1Z2UgPSByZXF1aXJlKFwiLi9nYXVnZVwiKTtcblxudmFyIF9sZWdlbmQgPSByZXF1aXJlKFwiLi9sZWdlbmRcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG52YXIgYWxsQ29uZmlnID0ge1xuICBjb2xvckNvbmZpZzogX2NvbG9yLmNvbG9yQ29uZmlnLFxuICBncmlkQ29uZmlnOiBfZ3JpZC5ncmlkQ29uZmlnLFxuICB4QXhpc0NvbmZpZzogX2F4aXMueEF4aXNDb25maWcsXG4gIHlBeGlzQ29uZmlnOiBfYXhpcy55QXhpc0NvbmZpZyxcbiAgdGl0bGVDb25maWc6IF90aXRsZS50aXRsZUNvbmZpZyxcbiAgbGluZUNvbmZpZzogX2xpbmUubGluZUNvbmZpZyxcbiAgYmFyQ29uZmlnOiBfYmFyLmJhckNvbmZpZyxcbiAgcGllQ29uZmlnOiBfcGllLnBpZUNvbmZpZyxcbiAgcmFkYXJBeGlzQ29uZmlnOiBfcmFkYXJBeGlzLnJhZGFyQXhpc0NvbmZpZyxcbiAgcmFkYXJDb25maWc6IF9yYWRhci5yYWRhckNvbmZpZyxcbiAgZ2F1Z2VDb25maWc6IF9nYXVnZS5nYXVnZUNvbmZpZyxcbiAgbGVnZW5kQ29uZmlnOiBfbGVnZW5kLmxlZ2VuZENvbmZpZ1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENoYW5nZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleSAgICAgICAgICBDb25maWd1cmF0aW9uIGtleVxuICAgKiBAcGFyYW0ge09iamVjdHxBcnJheX0gY29uZmlnIFlvdXIgY29uZmlnXG4gICAqIEByZXR1cm4ge1VuZGVmaW5lZH0gTm8gcmV0dXJuXG4gICAqL1xuXG59O1xuXG5mdW5jdGlvbiBjaGFuZ2VEZWZhdWx0Q29uZmlnKGtleSwgY29uZmlnKSB7XG4gIGlmICghYWxsQ29uZmlnW1wiXCIuY29uY2F0KGtleSwgXCJDb25maWdcIildKSB7XG4gICAgY29uc29sZS53YXJuKCdDaGFuZ2UgZGVmYXVsdCBjb25maWcgRXJyb3IgLSBJbnZhbGlkIGtleSEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAoMCwgX3V0aWwuZGVlcE1lcmdlKShhbGxDb25maWdbXCJcIi5jb25jYXQoa2V5LCBcIkNvbmZpZ1wiKV0sIGNvbmZpZyk7XG59XG5cbnZhciBrZXlzID0gWydjb2xvcicsICd0aXRsZScsICdsZWdlbmQnLCAneEF4aXMnLCAneUF4aXMnLCAnZ3JpZCcsICdyYWRhckF4aXMnLCAnbGluZScsICdiYXInLCAncGllJywgJ3JhZGFyJywgJ2dhdWdlJ107XG5leHBvcnRzLmtleXMgPSBrZXlzOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5sZWdlbmRDb25maWcgPSB2b2lkIDA7XG52YXIgbGVnZW5kQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBsZWdlbmRcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG9yaWVudFxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBvcmllbnQgPSAnaG9yaXpvbnRhbCdcbiAgICogQGV4YW1wbGUgb3JpZW50ID0gJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJ1xuICAgKi9cbiAgb3JpZW50OiAnaG9yaXpvbnRhbCcsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbGVmdFxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgbGVmdCA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSBsZWZ0ID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxuICAgKi9cbiAgbGVmdDogJ2F1dG8nLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHJpZ2h0XG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByaWdodCA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSByaWdodCA9ICdhdXRvJyB8ICcxMCUnIHwgMTBcbiAgICovXG4gIHJpZ2h0OiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgdG9wXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB0b3AgPSAnYXV0bydcbiAgICogQGV4YW1wbGUgdG9wID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxuICAgKi9cbiAgdG9wOiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgYm90dG9tXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBib3R0b20gPSAnYXV0bydcbiAgICogQGV4YW1wbGUgYm90dG9tID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxuICAgKi9cbiAgYm90dG9tOiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgaXRlbSBnYXBcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgaXRlbUdhcCA9IDEwXG4gICAqL1xuICBpdGVtR2FwOiAxMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEljb24gd2lkdGhcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgaWNvbldpZHRoID0gMjVcbiAgICovXG4gIGljb25XaWR0aDogMjUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBJY29uIGhlaWdodFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpY29uSGVpZ2h0ID0gMTBcbiAgICovXG4gIGljb25IZWlnaHQ6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciBsZWdlbmQgaXMgb3B0aW9uYWxcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNlbGVjdEFibGUgPSB0cnVlXG4gICAqL1xuICBzZWxlY3RBYmxlOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICovXG4gIGRhdGE6IFtdLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHRleHQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICB0ZXh0U3R5bGU6IHtcbiAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgIGZvbnRTaXplOiAxMyxcbiAgICBmaWxsOiAnIzAwMCdcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBpY29uIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgaWNvblN0eWxlOiB7fSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCB0ZXh0IHVuc2VsZWN0ZWQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICB0ZXh0VW5zZWxlY3RlZFN0eWxlOiB7XG4gICAgZm9udEZhbWlseTogJ0FyaWFsJyxcbiAgICBmb250U2l6ZTogMTMsXG4gICAgZmlsbDogJyM5OTknXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgaWNvbiB1bnNlbGVjdGVkIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgaWNvblVuc2VsZWN0ZWRTdHlsZToge1xuICAgIGZpbGw6ICcjOTk5J1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHJlbmRlciBsZXZlbFxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAyMFxuICAgKi9cbiAgckxldmVsOiAyMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmxlZ2VuZENvbmZpZyA9IGxlZ2VuZENvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMubGluZUNvbmZpZyA9IHZvaWQgMDtcbnZhciBsaW5lQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIGxpbmUgY2hhcnRcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIERhdGEgc3RhY2tpbmdcbiAgICogVGhlIGRhdGEgdmFsdWUgb2YgdGhlIHNlcmllcyBlbGVtZW50IG9mIHRoZSBzYW1lIHN0YWNrXG4gICAqIHdpbGwgYmUgc3VwZXJpbXBvc2VkICh0aGUgbGF0dGVyIHZhbHVlIHdpbGwgYmUgc3VwZXJpbXBvc2VkIG9uIHRoZSBwcmV2aW91cyB2YWx1ZSlcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgc3RhY2sgPSAnJ1xuICAgKi9cbiAgc3RhY2s6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gU21vb3RoIGxpbmVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNtb290aCA9IGZhbHNlXG4gICAqL1xuICBzbW9vdGg6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSB4IGF4aXMgaW5kZXhcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgeEF4aXNJbmRleCA9IDBcbiAgICogQGV4YW1wbGUgeEF4aXNJbmRleCA9IDAgfCAxXG4gICAqL1xuICB4QXhpc0luZGV4OiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSB5IGF4aXMgaW5kZXhcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgeUF4aXNJbmRleCA9IDBcbiAgICogQGV4YW1wbGUgeUF4aXNJbmRleCA9IDAgfCAxXG4gICAqL1xuICB5QXhpc0luZGV4OiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBjaGFydCBkYXRhXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgZGF0YSA9IFtdXG4gICAqIEBleGFtcGxlIGRhdGEgPSBbMTAwLCAyMDAsIDMwMF1cbiAgICovXG4gIGRhdGE6IFtdLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIGxpbmVTdHlsZToge1xuICAgIGxpbmVXaWR0aDogMVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBwb2ludCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBsaW5lUG9pbnQ6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGxpbmUgcG9pbnRcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBwb2ludCByYWRpdXNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHJhZGl1cyA9IDJcbiAgICAgKi9cbiAgICByYWRpdXM6IDIsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBwb2ludCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjZmZmJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExpbmUgYXJlYSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBsaW5lQXJlYToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgbGluZSBhcmVhXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBhcmVhIGdyYWRpZW50IGNvbG9yIChIZXh8cmdifHJnYmEpXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50ID0gW11cbiAgICAgKi9cbiAgICBncmFkaWVudDogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBhcmVhIHN0eWxlIGRlZmF1bHQgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgb3BhY2l0eTogMC41XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBsYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgbGluZSBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgbGFiZWwgcG9zaXRpb25cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ3RvcCdcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICd0b3AnIHwgJ2NlbnRlcicgfCAnYm90dG9tJ1xuICAgICAqL1xuICAgIHBvc2l0aW9uOiAndG9wJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIG9mZnNldFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBvZmZzZXQgPSBbMCwgLTEwXVxuICAgICAqL1xuICAgIG9mZnNldDogWzAsIC0xMF0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfeS7tidcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExpbmUgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXG4gICAqL1xuICByTGV2ZWw6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBhbmltYXRpb24gZnJhbWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxuICAgKi9cbiAgYW5pbWF0aW9uRnJhbWU6IDUwXG59O1xuZXhwb3J0cy5saW5lQ29uZmlnID0gbGluZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucGllQ29uZmlnID0gdm9pZCAwO1xudmFyIHBpZUNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyBwaWUgY2hhcnRcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGl1cyBvZiBwaWVcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJhZGl1cyA9ICc1MCUnXG4gICAqIEBleGFtcGxlIHJhZGl1cyA9ICc1MCUnIHwgMTAwXG4gICAqL1xuICByYWRpdXM6ICc1MCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ2VudGVyIHBvaW50IG9mIHBpZVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGNlbnRlciA9IFsnNTAlJywnNTAlJ11cbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cbiAgICovXG4gIGNlbnRlcjogWyc1MCUnLCAnNTAlJ10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgY2hhcnQgc3RhcnQgYW5nbGVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3RhcnRBbmdsZSA9IC1NYXRoLlBJIC8gMlxuICAgKiBAZXhhbXBsZSBzdGFydEFuZ2xlID0gLU1hdGguUElcbiAgICovXG4gIHN0YXJ0QW5nbGU6IC1NYXRoLlBJIC8gMixcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZW5hYmxlIHJvc2UgdHlwZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgcm9zZVR5cGUgPSBmYWxzZVxuICAgKi9cbiAgcm9zZVR5cGU6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXV0b21hdGljIHNvcnRpbmcgaW4gcm9zZSB0eXBlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCByb3NlU29ydCA9IHRydWVcbiAgICovXG4gIHJvc2VTb3J0OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUm9zZSByYWRpdXMgaW5jcmVhc2luZ1xuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcm9zZUluY3JlbWVudCA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSByb3NlSW5jcmVtZW50ID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxuICAgKi9cbiAgcm9zZUluY3JlbWVudDogJ2F1dG8nLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIGNoYXJ0IGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICovXG4gIGRhdGE6IFtdLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIGluc2lkZSBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBpbnNpZGVMYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgaW5zaWRlIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSAne3BlcmNlbnR9JSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAnJHtuYW1lfS17dmFsdWV9LXtwZXJjZW50fSUnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0ubmFtZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6ICd7cGVyY2VudH0lJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMCxcbiAgICAgIGZpbGw6ICcjZmZmJyxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIE91dHNpZGUgbGFiZWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgb3V0c2lkZUxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBvdXRzaWRlIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9ICd7bmFtZX0nXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJyR7bmFtZX0te3ZhbHVlfS17cGVyY2VudH0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLm5hbWUpXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiAne25hbWV9JyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZvbnRTaXplOiAxMVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gR2FwIGJldGVlbiBsYWJlbCBsaW5lIGJlbmRlZCBwbGFjZSBhbmQgcGllXG4gICAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgbGFiZWxMaW5lQmVuZEdhcCA9ICcyMCUnXG4gICAgICogQGV4YW1wbGUgbGFiZWxMaW5lQmVuZEdhcCA9ICcyMCUnIHwgMjBcbiAgICAgKi9cbiAgICBsYWJlbExpbmVCZW5kR2FwOiAnMjAlJyxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBsaW5lIGVuZCBsZW5ndGhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IGxhYmVsTGluZUVuZExlbmd0aCA9IDUwXG4gICAgICovXG4gICAgbGFiZWxMaW5lRW5kTGVuZ3RoOiA1MCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBsYWJlbExpbmVTdHlsZToge1xuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgcGllU3R5bGU6IHt9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGVyY2VudGFnZSBmcmFjdGlvbmFsIHByZWNpc2lvblxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBwZXJjZW50VG9GaXhlZCA9IDBcbiAgICovXG4gIHBlcmNlbnRUb0ZpeGVkOiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIGNoYXJ0IHJlbmRlciBsZXZlbFxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAxMFxuICAgKi9cbiAgckxldmVsOiAxMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEFuaW1hdGlvbiBkZWxheSBnYXBcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRGVsYXlHYXAgPSA2MFxuICAgKi9cbiAgYW5pbWF0aW9uRGVsYXlHYXA6IDYwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgc3RhcnQgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IHN0YXJ0QW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEJhY2snXG4gICAqL1xuICBzdGFydEFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEJhY2snLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUGllIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLnBpZUNvbmZpZyA9IHBpZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXJDb25maWcgPSB2b2lkIDA7XG52YXIgcmFkYXJDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgcmFkYXJcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGNoYXJ0IGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICogQGV4YW1wbGUgZGF0YSA9IFsxMDAsIDIwMCwgMzAwXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHJhZGFyU3R5bGU6IHtcbiAgICBsaW5lV2lkdGg6IDFcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIHBvaW50IGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHBvaW50OiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSByYWRhciBwb2ludFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBQb2ludCByYWRpdXNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHJhZGl1cyA9IDJcbiAgICAgKi9cbiAgICByYWRpdXM6IDIsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgcG9pbnQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmaWxsOiAnI2ZmZidcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBsYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgcmFkYXIgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgcG9zaXRpb24gb2Zmc2V0XG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAwXVxuICAgICAqL1xuICAgIG9mZnNldDogWzAsIDBdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGdhcCBiZXR3ZWVuIGxhYmVsIGFuZCByYWRhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgbGFiZWxHYXAgPSA1XG4gICAgICovXG4gICAgbGFiZWxHYXA6IDUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ1Njb3JlLXt2YWx1ZX0nXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGxhYmVsKSA9PiAobGFiZWwpXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXG4gICAqL1xuICByTGV2ZWw6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFuZTogNTBcbn07XG5leHBvcnRzLnJhZGFyQ29uZmlnID0gcmFkYXJDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnJhZGFyQXhpc0NvbmZpZyA9IHZvaWQgMDtcbnZhciByYWRhckF4aXNDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgcmFkYXIgYXhpc1xuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDZW50ZXIgcG9pbnQgb2YgcmFkYXIgYXhpc1xuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGNlbnRlciA9IFsnNTAlJywnNTAlJ11cbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cbiAgICovXG4gIGNlbnRlcjogWyc1MCUnLCAnNTAlJ10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRpdXMgb2YgcmFkYXIgYXhpc1xuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcmFkaXVzID0gJzY1JSdcbiAgICogQGV4YW1wbGUgcmFkaXVzID0gJzY1JScgfCAxMDBcbiAgICovXG4gIHJhZGl1czogJzY1JScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBheGlzIHN0YXJ0IGFuZ2xlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHN0YXJ0QW5nbGUgPSAtTWF0aC5QSSAvIDJcbiAgICogQGV4YW1wbGUgc3RhcnRBbmdsZSA9IC1NYXRoLlBJXG4gICAqL1xuICBzdGFydEFuZ2xlOiAtTWF0aC5QSSAvIDIsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBheGlzIHNwbGl0IG51bWJlclxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzcGxpdE51bSA9IDVcbiAgICovXG4gIHNwbGl0TnVtOiA1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgcG9seWdvbiByYWRhciBheGlzXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBwb2x5Z29uID0gZmFsc2VcbiAgICovXG4gIHBvbHlnb246IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGFiZWw6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIHJhZGFyIGF4aXNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IGxhYmVsR2FwID0gMTVcbiAgICAgKi9cbiAgICBsYWJlbEdhcDogMTUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuZmlsbFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXG4gICAgICovXG4gICAgY29sb3I6IFtdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmaWxsOiAnIzMzMydcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGluZVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGNvbG9yIChIZXh8cmdifHJnYmEpLCB3aWxsIGNvdmVyIHN0eWxlLnN0cm9rZVxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXG4gICAgICovXG4gICAgY29sb3I6IFtdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjOTk5JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFNwbGl0IGxpbmUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgc3BsaXRMaW5lOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBzcGxpdCBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gU3BsaXQgbGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyNkNGQ0ZDQnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gU3BsaXQgYXJlYSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBzcGxpdEFyZWE6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHNwbGl0IGFyZWFcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBcmVhIGNvbG9yIChIZXh8cmdifHJnYmEpLCB3aWxsIGNvdmVyIHN0eWxlLnN0cm9rZVxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBjb2xvciA9IFtdXG4gICAgICovXG4gICAgY29sb3I6IFsnI2Y1ZjVmNScsICcjZTZlNmU2J10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gU3BsaXQgYXJlYSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHt9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IC0xMFxuICAgKi9cbiAgckxldmVsOiAtMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBheGlzIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBheGlzIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFuZTogNTBcbn07XG5leHBvcnRzLnJhZGFyQXhpc0NvbmZpZyA9IHJhZGFyQXhpc0NvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGl0bGVDb25maWcgPSB2b2lkIDA7XG52YXIgdGl0bGVDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRpdGxlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFRpdGxlIHRleHRcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgdGV4dCA9ICcnXG4gICAqL1xuICB0ZXh0OiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFRpdGxlIG9mZnNldFxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAtMjBdXG4gICAqL1xuICBvZmZzZXQ6IFswLCAtMjBdLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBzdHlsZToge1xuICAgIGZpbGw6ICcjMzMzJyxcbiAgICBmb250U2l6ZTogMTcsXG4gICAgZm9udFdlaWdodDogJ2JvbGQnLFxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDIwXG4gICAqL1xuICByTGV2ZWw6IDIwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFRpdGxlIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLnRpdGxlQ29uZmlnID0gdGl0bGVDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5heGlzID0gYXhpcztcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG52YXIgYXhpc0NvbmZpZyA9IHtcbiAgeEF4aXNDb25maWc6IF9jb25maWcueEF4aXNDb25maWcsXG4gIHlBeGlzQ29uZmlnOiBfY29uZmlnLnlBeGlzQ29uZmlnXG59O1xudmFyIG1pbiA9IE1hdGgubWluLFxuICAgIG1heCA9IE1hdGgubWF4LFxuICAgIGFicyA9IE1hdGguYWJzLFxuICAgIHBvdyA9IE1hdGgucG93O1xuXG5mdW5jdGlvbiBheGlzKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgeEF4aXMgPSBvcHRpb24ueEF4aXMsXG4gICAgICB5QXhpcyA9IG9wdGlvbi55QXhpcyxcbiAgICAgIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIHZhciBhbGxBeGlzID0gW107XG5cbiAgaWYgKHhBeGlzICYmIHlBeGlzICYmIHNlcmllcykge1xuICAgIGFsbEF4aXMgPSBnZXRBbGxBeGlzKHhBeGlzLCB5QXhpcyk7XG4gICAgYWxsQXhpcyA9IG1lcmdlRGVmYXVsdEF4aXNDb25maWcoYWxsQXhpcyk7XG4gICAgYWxsQXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICB2YXIgc2hvdyA9IF9yZWYuc2hvdztcbiAgICAgIHJldHVybiBzaG93O1xuICAgIH0pO1xuICAgIGFsbEF4aXMgPSBtZXJnZURlZmF1bHRCb3VuZGFyeUdhcChhbGxBeGlzKTtcbiAgICBhbGxBeGlzID0gY2FsY0F4aXNMYWJlbERhdGEoYWxsQXhpcywgc2VyaWVzKTtcbiAgICBhbGxBeGlzID0gc2V0QXhpc1Bvc2l0aW9uKGFsbEF4aXMpO1xuICAgIGFsbEF4aXMgPSBjYWxjQXhpc0xpbmVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCk7XG4gICAgYWxsQXhpcyA9IGNhbGNBeGlzVGlja1Bvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KTtcbiAgICBhbGxBeGlzID0gY2FsY0F4aXNOYW1lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpO1xuICAgIGFsbEF4aXMgPSBjYWxjU3BsaXRMaW5lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpO1xuICB9XG5cbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYWxsQXhpcyxcbiAgICBrZXk6ICdheGlzTGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExpbmVDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnYXhpc1RpY2snLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRUaWNrQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ2F4aXNMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExhYmVsQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ2F4aXNOYW1lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TmFtZUNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYWxsQXhpcyxcbiAgICBrZXk6ICdzcGxpdExpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRTcGxpdExpbmVDb25maWdcbiAgfSk7XG4gIGNoYXJ0LmF4aXNEYXRhID0gYWxsQXhpcztcbn1cblxuZnVuY3Rpb24gZ2V0QWxsQXhpcyh4QXhpcywgeUF4aXMpIHtcbiAgdmFyIGFsbFhBeGlzID0gW10sXG4gICAgICBhbGxZQXhpcyA9IFtdO1xuXG4gIGlmICh4QXhpcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgdmFyIF9hbGxYQXhpcztcblxuICAgIChfYWxsWEF4aXMgPSBhbGxYQXhpcykucHVzaC5hcHBseShfYWxsWEF4aXMsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeEF4aXMpKTtcbiAgfSBlbHNlIHtcbiAgICBhbGxYQXhpcy5wdXNoKHhBeGlzKTtcbiAgfVxuXG4gIGlmICh5QXhpcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgdmFyIF9hbGxZQXhpcztcblxuICAgIChfYWxsWUF4aXMgPSBhbGxZQXhpcykucHVzaC5hcHBseShfYWxsWUF4aXMsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeUF4aXMpKTtcbiAgfSBlbHNlIHtcbiAgICBhbGxZQXhpcy5wdXNoKHlBeGlzKTtcbiAgfVxuXG4gIGFsbFhBeGlzLnNwbGljZSgyKTtcbiAgYWxsWUF4aXMuc3BsaWNlKDIpO1xuICBhbGxYQXhpcyA9IGFsbFhBeGlzLm1hcChmdW5jdGlvbiAoYXhpcywgaSkge1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIGF4aXM6ICd4J1xuICAgIH0pO1xuICB9KTtcbiAgYWxsWUF4aXMgPSBhbGxZQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMsIGkpIHtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpcywge1xuICAgICAgaW5kZXg6IGksXG4gICAgICBheGlzOiAneSdcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhbGxYQXhpcyksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsWUF4aXMpKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VEZWZhdWx0QXhpc0NvbmZpZyhhbGxBeGlzKSB7XG4gIHZhciB4QXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMikge1xuICAgIHZhciBheGlzID0gX3JlZjIuYXhpcztcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3gnO1xuICB9KTtcbiAgdmFyIHlBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmMy5heGlzO1xuICAgIHJldHVybiBheGlzID09PSAneSc7XG4gIH0pO1xuICB4QXhpcyA9IHhBeGlzLm1hcChmdW5jdGlvbiAoYXhpcykge1xuICAgIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSgoMCwgX3V0aWwyLmRlZXBDbG9uZSkoX2NvbmZpZy54QXhpc0NvbmZpZyksIGF4aXMpO1xuICB9KTtcbiAgeUF4aXMgPSB5QXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoKDAsIF91dGlsMi5kZWVwQ2xvbmUpKF9jb25maWcueUF4aXNDb25maWcpLCBheGlzKTtcbiAgfSk7XG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh4QXhpcyksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeUF4aXMpKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VEZWZhdWx0Qm91bmRhcnlHYXAoYWxsQXhpcykge1xuICB2YXIgdmFsdWVBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY0KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmNC5kYXRhO1xuICAgIHJldHVybiBkYXRhID09PSAndmFsdWUnO1xuICB9KTtcbiAgdmFyIGxhYmVsQXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNSkge1xuICAgIHZhciBkYXRhID0gX3JlZjUuZGF0YTtcbiAgICByZXR1cm4gZGF0YSAhPT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhbHVlQXhpcy5mb3JFYWNoKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgaWYgKHR5cGVvZiBheGlzLmJvdW5kYXJ5R2FwID09PSAnYm9vbGVhbicpIHJldHVybjtcbiAgICBheGlzLmJvdW5kYXJ5R2FwID0gZmFsc2U7XG4gIH0pO1xuICBsYWJlbEF4aXMuZm9yRWFjaChmdW5jdGlvbiAoYXhpcykge1xuICAgIGlmICh0eXBlb2YgYXhpcy5ib3VuZGFyeUdhcCA9PT0gJ2Jvb2xlYW4nKSByZXR1cm47XG4gICAgYXhpcy5ib3VuZGFyeUdhcCA9IHRydWU7XG4gIH0pO1xuICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkodmFsdWVBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsYWJlbEF4aXMpKTtcbn1cblxuZnVuY3Rpb24gY2FsY0F4aXNMYWJlbERhdGEoYWxsQXhpcywgc2VyaWVzKSB7XG4gIHZhciB2YWx1ZUF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjYpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY2LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgPT09ICd2YWx1ZSc7XG4gIH0pO1xuICB2YXIgbGFiZWxBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY3KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmNy5kYXRhO1xuICAgIHJldHVybiBkYXRhIGluc3RhbmNlb2YgQXJyYXk7XG4gIH0pO1xuICB2YWx1ZUF4aXMgPSBjYWxjVmFsdWVBeGlzTGFiZWxEYXRhKHZhbHVlQXhpcywgc2VyaWVzKTtcbiAgbGFiZWxBeGlzID0gY2FsY0xhYmVsQXhpc0xhYmVsRGF0YShsYWJlbEF4aXMpO1xuICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkodmFsdWVBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsYWJlbEF4aXMpKTtcbn1cblxuZnVuY3Rpb24gY2FsY1ZhbHVlQXhpc0xhYmVsRGF0YSh2YWx1ZUF4aXMsIHNlcmllcykge1xuICByZXR1cm4gdmFsdWVBeGlzLm1hcChmdW5jdGlvbiAoYXhpcykge1xuICAgIHZhciBtaW5NYXhWYWx1ZSA9IGdldFZhbHVlQXhpc01heE1pblZhbHVlKGF4aXMsIHNlcmllcyk7XG5cbiAgICB2YXIgX2dldFRydWVNaW5NYXggPSBnZXRUcnVlTWluTWF4KGF4aXMsIG1pbk1heFZhbHVlKSxcbiAgICAgICAgX2dldFRydWVNaW5NYXgyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRUcnVlTWluTWF4LCAyKSxcbiAgICAgICAgbWluID0gX2dldFRydWVNaW5NYXgyWzBdLFxuICAgICAgICBtYXggPSBfZ2V0VHJ1ZU1pbk1heDJbMV07XG5cbiAgICB2YXIgaW50ZXJ2YWwgPSBnZXRWYWx1ZUludGVydmFsKG1pbiwgbWF4LCBheGlzKTtcbiAgICB2YXIgZm9ybWF0dGVyID0gYXhpcy5heGlzTGFiZWwuZm9ybWF0dGVyO1xuICAgIHZhciBsYWJlbCA9IFtdO1xuXG4gICAgaWYgKG1pbiA8IDAgJiYgbWF4ID4gMCkge1xuICAgICAgbGFiZWwgPSBnZXRWYWx1ZUF4aXNMYWJlbEZyb21aZXJvKG1pbiwgbWF4LCBpbnRlcnZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhYmVsID0gZ2V0VmFsdWVBeGlzTGFiZWxGcm9tTWluKG1pbiwgbWF4LCBpbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgbGFiZWwgPSBsYWJlbC5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGwudG9GaXhlZCgyKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXMsIHtcbiAgICAgIG1heFZhbHVlOiBsYWJlbC5zbGljZSgtMSlbMF0sXG4gICAgICBtaW5WYWx1ZTogbGFiZWxbMF0sXG4gICAgICBsYWJlbDogZ2V0QWZ0ZXJGb3JtYXR0ZXJMYWJlbChsYWJlbCwgZm9ybWF0dGVyKVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVBeGlzTWF4TWluVmFsdWUoYXhpcywgc2VyaWVzKSB7XG4gIHNlcmllcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY4KSB7XG4gICAgdmFyIHNob3cgPSBfcmVmOC5zaG93LFxuICAgICAgICB0eXBlID0gX3JlZjgudHlwZTtcbiAgICBpZiAoc2hvdyA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodHlwZSA9PT0gJ3BpZScpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG4gIGlmIChzZXJpZXMubGVuZ3RoID09PSAwKSByZXR1cm4gWzAsIDBdO1xuICB2YXIgaW5kZXggPSBheGlzLmluZGV4LFxuICAgICAgYXhpc1R5cGUgPSBheGlzLmF4aXM7XG4gIHNlcmllcyA9IG1lcmdlU3RhY2tEYXRhKHNlcmllcyk7XG4gIHZhciBheGlzTmFtZSA9IGF4aXNUeXBlICsgJ0F4aXMnO1xuICB2YXIgdmFsdWVTZXJpZXMgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHNbYXhpc05hbWVdID09PSBpbmRleDtcbiAgfSk7XG4gIGlmICghdmFsdWVTZXJpZXMubGVuZ3RoKSB2YWx1ZVNlcmllcyA9IHNlcmllcztcbiAgcmV0dXJuIGdldFNlcmllc01pbk1heFZhbHVlKHZhbHVlU2VyaWVzKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VyaWVzTWluTWF4VmFsdWUoc2VyaWVzKSB7XG4gIGlmICghc2VyaWVzKSByZXR1cm47XG4gIHZhciBtaW5WYWx1ZSA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2VyaWVzLm1hcChmdW5jdGlvbiAoX3JlZjkpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY5LmRhdGE7XG4gICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoKDAsIF91dGlsLmZpbHRlck5vbk51bWJlcikoZGF0YSkpKTtcbiAgfSkpKTtcbiAgdmFyIG1heFZhbHVlID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzZXJpZXMubWFwKGZ1bmN0aW9uIChfcmVmMTApIHtcbiAgICB2YXIgZGF0YSA9IF9yZWYxMC5kYXRhO1xuICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKCgwLCBfdXRpbC5maWx0ZXJOb25OdW1iZXIpKGRhdGEpKSk7XG4gIH0pKSk7XG4gIHJldHVybiBbbWluVmFsdWUsIG1heFZhbHVlXTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VTdGFja0RhdGEoc2VyaWVzKSB7XG4gIHZhciBzZXJpZXNDbG9uZWQgPSAoMCwgX3V0aWwyLmRlZXBDbG9uZSkoc2VyaWVzLCB0cnVlKTtcbiAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICB2YXIgZGF0YSA9ICgwLCBfdXRpbC5tZXJnZVNhbWVTdGFja0RhdGEpKGl0ZW0sIHNlcmllcyk7XG4gICAgc2VyaWVzQ2xvbmVkW2ldLmRhdGEgPSBkYXRhO1xuICB9KTtcbiAgcmV0dXJuIHNlcmllc0Nsb25lZDtcbn1cblxuZnVuY3Rpb24gZ2V0VHJ1ZU1pbk1heChfcmVmMTEsIF9yZWYxMikge1xuICB2YXIgbWluID0gX3JlZjExLm1pbixcbiAgICAgIG1heCA9IF9yZWYxMS5tYXgsXG4gICAgICBheGlzID0gX3JlZjExLmF4aXM7XG5cbiAgdmFyIF9yZWYxMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTIsIDIpLFxuICAgICAgbWluVmFsdWUgPSBfcmVmMTNbMF0sXG4gICAgICBtYXhWYWx1ZSA9IF9yZWYxM1sxXTtcblxuICB2YXIgbWluVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG1pbiksXG4gICAgICBtYXhUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkobWF4KTtcblxuICBpZiAoIXRlc3RNaW5NYXhUeXBlKG1pbikpIHtcbiAgICBtaW4gPSBheGlzQ29uZmlnW2F4aXMgKyAnQXhpc0NvbmZpZyddLm1pbjtcbiAgICBtaW5UeXBlID0gJ3N0cmluZyc7XG4gIH1cblxuICBpZiAoIXRlc3RNaW5NYXhUeXBlKG1heCkpIHtcbiAgICBtYXggPSBheGlzQ29uZmlnW2F4aXMgKyAnQXhpc0NvbmZpZyddLm1heDtcbiAgICBtYXhUeXBlID0gJ3N0cmluZyc7XG4gIH1cblxuICBpZiAobWluVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBtaW4gPSBwYXJzZUludChtaW5WYWx1ZSAtIGFicyhtaW5WYWx1ZSAqIHBhcnNlRmxvYXQobWluKSAvIDEwMCkpO1xuICAgIHZhciBsZXZlciA9IGdldFZhbHVlTGV2ZXIobWluKTtcbiAgICBtaW4gPSBwYXJzZUZsb2F0KChtaW4gLyBsZXZlciAtIDAuMSkudG9GaXhlZCgxKSkgKiBsZXZlcjtcbiAgfVxuXG4gIGlmIChtYXhUeXBlID09PSAnc3RyaW5nJykge1xuICAgIG1heCA9IHBhcnNlSW50KG1heFZhbHVlICsgYWJzKG1heFZhbHVlICogcGFyc2VGbG9hdChtYXgpIC8gMTAwKSk7XG5cbiAgICB2YXIgX2xldmVyID0gZ2V0VmFsdWVMZXZlcihtYXgpO1xuXG4gICAgbWF4ID0gcGFyc2VGbG9hdCgobWF4IC8gX2xldmVyICsgMC4xKS50b0ZpeGVkKDEpKSAqIF9sZXZlcjtcbiAgfVxuXG4gIHJldHVybiBbbWluLCBtYXhdO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUxldmVyKHZhbHVlKSB7XG4gIHZhciB2YWx1ZVN0cmluZyA9IGFicyh2YWx1ZSkudG9TdHJpbmcoKTtcbiAgdmFyIHZhbHVlTGVuZ3RoID0gdmFsdWVTdHJpbmcubGVuZ3RoO1xuICB2YXIgZmlyc3RaZXJvSW5kZXggPSB2YWx1ZVN0cmluZy5yZXBsYWNlKC8wKiQvZywgJycpLmluZGV4T2YoJzAnKTtcbiAgdmFyIHBvdzEwTnVtID0gdmFsdWVMZW5ndGggLSAxO1xuICBpZiAoZmlyc3RaZXJvSW5kZXggIT09IC0xKSBwb3cxME51bSAtPSBmaXJzdFplcm9JbmRleDtcbiAgcmV0dXJuIHBvdygxMCwgcG93MTBOdW0pO1xufVxuXG5mdW5jdGlvbiB0ZXN0TWluTWF4VHlwZSh2YWwpIHtcbiAgdmFyIHZhbFR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKSh2YWwpO1xuICB2YXIgaXNWYWxpZFN0cmluZyA9IHZhbFR5cGUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyUkLy50ZXN0KHZhbCk7XG4gIHZhciBpc1ZhbGlkTnVtYmVyID0gdmFsVHlwZSA9PT0gJ251bWJlcic7XG4gIHJldHVybiBpc1ZhbGlkU3RyaW5nIHx8IGlzVmFsaWROdW1iZXI7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlQXhpc0xhYmVsRnJvbVplcm8obWluLCBtYXgsIGludGVydmFsKSB7XG4gIHZhciBuZWdhdGl2ZSA9IFtdLFxuICAgICAgcG9zaXRpdmUgPSBbXTtcbiAgdmFyIGN1cnJlbnROZWdhdGl2ZSA9IDAsXG4gICAgICBjdXJyZW50UG9zaXRpdmUgPSAwO1xuXG4gIGRvIHtcbiAgICBuZWdhdGl2ZS5wdXNoKGN1cnJlbnROZWdhdGl2ZSAtPSBpbnRlcnZhbCk7XG4gIH0gd2hpbGUgKGN1cnJlbnROZWdhdGl2ZSA+IG1pbik7XG5cbiAgZG8ge1xuICAgIHBvc2l0aXZlLnB1c2goY3VycmVudFBvc2l0aXZlICs9IGludGVydmFsKTtcbiAgfSB3aGlsZSAoY3VycmVudFBvc2l0aXZlIDwgbWF4KTtcblxuICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmVnYXRpdmUucmV2ZXJzZSgpKSwgWzBdLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aXZlKSk7XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlQXhpc0xhYmVsRnJvbU1pbihtaW4sIG1heCwgaW50ZXJ2YWwpIHtcbiAgdmFyIGxhYmVsID0gW21pbl0sXG4gICAgICBjdXJyZW50VmFsdWUgPSBtaW47XG5cbiAgZG8ge1xuICAgIGxhYmVsLnB1c2goY3VycmVudFZhbHVlICs9IGludGVydmFsKTtcbiAgfSB3aGlsZSAoY3VycmVudFZhbHVlIDwgbWF4KTtcblxuICByZXR1cm4gbGFiZWw7XG59XG5cbmZ1bmN0aW9uIGdldEFmdGVyRm9ybWF0dGVyTGFiZWwobGFiZWwsIGZvcm1hdHRlcikge1xuICBpZiAoIWZvcm1hdHRlcikgcmV0dXJuIGxhYmVsO1xuICBpZiAodHlwZW9mIGZvcm1hdHRlciA9PT0gJ3N0cmluZycpIGxhYmVsID0gbGFiZWwubWFwKGZ1bmN0aW9uIChsKSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9JywgbCk7XG4gIH0pO1xuICBpZiAodHlwZW9mIGZvcm1hdHRlciA9PT0gJ2Z1bmN0aW9uJykgbGFiZWwgPSBsYWJlbC5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIoe1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgaW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gbGFiZWw7XG59XG5cbmZ1bmN0aW9uIGNhbGNMYWJlbEF4aXNMYWJlbERhdGEobGFiZWxBeGlzKSB7XG4gIHJldHVybiBsYWJlbEF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgdmFyIGRhdGEgPSBheGlzLmRhdGEsXG4gICAgICAgIGZvcm1hdHRlciA9IGF4aXMuYXhpc0xhYmVsLmZvcm1hdHRlcjtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpcywge1xuICAgICAgbGFiZWw6IGdldEFmdGVyRm9ybWF0dGVyTGFiZWwoZGF0YSwgZm9ybWF0dGVyKVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVJbnRlcnZhbChtaW4sIG1heCwgYXhpcykge1xuICB2YXIgaW50ZXJ2YWwgPSBheGlzLmludGVydmFsLFxuICAgICAgbWluSW50ZXJ2YWwgPSBheGlzLm1pbkludGVydmFsLFxuICAgICAgbWF4SW50ZXJ2YWwgPSBheGlzLm1heEludGVydmFsLFxuICAgICAgc3BsaXROdW1iZXIgPSBheGlzLnNwbGl0TnVtYmVyLFxuICAgICAgYXhpc1R5cGUgPSBheGlzLmF4aXM7XG4gIHZhciBjb25maWcgPSBheGlzQ29uZmlnW2F4aXNUeXBlICsgJ0F4aXNDb25maWcnXTtcbiAgaWYgKHR5cGVvZiBpbnRlcnZhbCAhPT0gJ251bWJlcicpIGludGVydmFsID0gY29uZmlnLmludGVydmFsO1xuICBpZiAodHlwZW9mIG1pbkludGVydmFsICE9PSAnbnVtYmVyJykgbWluSW50ZXJ2YWwgPSBjb25maWcubWluSW50ZXJ2YWw7XG4gIGlmICh0eXBlb2YgbWF4SW50ZXJ2YWwgIT09ICdudW1iZXInKSBtYXhJbnRlcnZhbCA9IGNvbmZpZy5tYXhJbnRlcnZhbDtcbiAgaWYgKHR5cGVvZiBzcGxpdE51bWJlciAhPT0gJ251bWJlcicpIHNwbGl0TnVtYmVyID0gY29uZmlnLnNwbGl0TnVtYmVyO1xuICBpZiAodHlwZW9mIGludGVydmFsID09PSAnbnVtYmVyJykgcmV0dXJuIGludGVydmFsO1xuICB2YXIgdmFsdWVJbnRlcnZhbCA9IHBhcnNlSW50KChtYXggLSBtaW4pIC8gKHNwbGl0TnVtYmVyIC0gMSkpO1xuICBpZiAodmFsdWVJbnRlcnZhbC50b1N0cmluZygpLmxlbmd0aCA+IDEpIHZhbHVlSW50ZXJ2YWwgPSBwYXJzZUludCh2YWx1ZUludGVydmFsLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxkJC8sICcwJykpO1xuICBpZiAodmFsdWVJbnRlcnZhbCA9PT0gMCkgdmFsdWVJbnRlcnZhbCA9IDE7XG4gIGlmICh0eXBlb2YgbWluSW50ZXJ2YWwgPT09ICdudW1iZXInICYmIHZhbHVlSW50ZXJ2YWwgPCBtaW5JbnRlcnZhbCkgcmV0dXJuIG1pbkludGVydmFsO1xuICBpZiAodHlwZW9mIG1heEludGVydmFsID09PSAnbnVtYmVyJyAmJiB2YWx1ZUludGVydmFsID4gbWF4SW50ZXJ2YWwpIHJldHVybiBtYXhJbnRlcnZhbDtcbiAgcmV0dXJuIHZhbHVlSW50ZXJ2YWw7XG59XG5cbmZ1bmN0aW9uIHNldEF4aXNQb3NpdGlvbihhbGxBeGlzKSB7XG4gIHZhciB4QXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMTQpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYxNC5heGlzO1xuICAgIHJldHVybiBheGlzID09PSAneCc7XG4gIH0pO1xuICB2YXIgeUF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjE1KSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmMTUuYXhpcztcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3knO1xuICB9KTtcbiAgaWYgKHhBeGlzWzBdICYmICF4QXhpc1swXS5wb3NpdGlvbikgeEF4aXNbMF0ucG9zaXRpb24gPSBfY29uZmlnLnhBeGlzQ29uZmlnLnBvc2l0aW9uO1xuXG4gIGlmICh4QXhpc1sxXSAmJiAheEF4aXNbMV0ucG9zaXRpb24pIHtcbiAgICB4QXhpc1sxXS5wb3NpdGlvbiA9IHhBeGlzWzBdLnBvc2l0aW9uID09PSAnYm90dG9tJyA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gIH1cblxuICBpZiAoeUF4aXNbMF0gJiYgIXlBeGlzWzBdLnBvc2l0aW9uKSB5QXhpc1swXS5wb3NpdGlvbiA9IF9jb25maWcueUF4aXNDb25maWcucG9zaXRpb247XG5cbiAgaWYgKHlBeGlzWzFdICYmICF5QXhpc1sxXS5wb3NpdGlvbikge1xuICAgIHlBeGlzWzFdLnBvc2l0aW9uID0geUF4aXNbMF0ucG9zaXRpb24gPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gIH1cblxuICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeEF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHlBeGlzKSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNBeGlzTGluZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KSB7XG4gIHZhciBfY2hhcnQkZ3JpZEFyZWEgPSBjaGFydC5ncmlkQXJlYSxcbiAgICAgIHggPSBfY2hhcnQkZ3JpZEFyZWEueCxcbiAgICAgIHkgPSBfY2hhcnQkZ3JpZEFyZWEueSxcbiAgICAgIHcgPSBfY2hhcnQkZ3JpZEFyZWEudyxcbiAgICAgIGggPSBfY2hhcnQkZ3JpZEFyZWEuaDtcbiAgYWxsQXhpcyA9IGFsbEF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gYXhpcy5wb3NpdGlvbjtcbiAgICB2YXIgbGluZVBvc2l0aW9uID0gW107XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgbGluZVBvc2l0aW9uID0gW1t4LCB5XSwgW3gsIHkgKyBoXV0ucmV2ZXJzZSgpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdyaWdodCcpIHtcbiAgICAgIGxpbmVQb3NpdGlvbiA9IFtbeCArIHcsIHldLCBbeCArIHcsIHkgKyBoXV0ucmV2ZXJzZSgpO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICBsaW5lUG9zaXRpb24gPSBbW3gsIHldLCBbeCArIHcsIHldXTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgbGluZVBvc2l0aW9uID0gW1t4LCB5ICsgaF0sIFt4ICsgdywgeSArIGhdXTtcbiAgICB9XG5cbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpcywge1xuICAgICAgbGluZVBvc2l0aW9uOiBsaW5lUG9zaXRpb25cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBhbGxBeGlzO1xufVxuXG5mdW5jdGlvbiBjYWxjQXhpc1RpY2tQb3NpdGlvbihhbGxBeGlzLCBjaGFydCkge1xuICByZXR1cm4gYWxsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXNJdGVtKSB7XG4gICAgdmFyIGF4aXMgPSBheGlzSXRlbS5heGlzLFxuICAgICAgICBsaW5lUG9zaXRpb24gPSBheGlzSXRlbS5saW5lUG9zaXRpb24sXG4gICAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb24sXG4gICAgICAgIGxhYmVsID0gYXhpc0l0ZW0ubGFiZWwsXG4gICAgICAgIGJvdW5kYXJ5R2FwID0gYXhpc0l0ZW0uYm91bmRhcnlHYXA7XG4gICAgaWYgKHR5cGVvZiBib3VuZGFyeUdhcCAhPT0gJ2Jvb2xlYW4nKSBib3VuZGFyeUdhcCA9IGF4aXNDb25maWdbYXhpcyArICdBeGlzQ29uZmlnJ10uYm91bmRhcnlHYXA7XG4gICAgdmFyIGxhYmVsTnVtID0gbGFiZWwubGVuZ3RoO1xuXG4gICAgdmFyIF9saW5lUG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVBvc2l0aW9uLCAyKSxcbiAgICAgICAgX2xpbmVQb3NpdGlvbiQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2xpbmVQb3NpdGlvblswXSwgMiksXG4gICAgICAgIHN0YXJ0WCA9IF9saW5lUG9zaXRpb24kWzBdLFxuICAgICAgICBzdGFydFkgPSBfbGluZVBvc2l0aW9uJFsxXSxcbiAgICAgICAgX2xpbmVQb3NpdGlvbiQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9saW5lUG9zaXRpb25bMV0sIDIpLFxuICAgICAgICBlbmRYID0gX2xpbmVQb3NpdGlvbiQyWzBdLFxuICAgICAgICBlbmRZID0gX2xpbmVQb3NpdGlvbiQyWzFdO1xuXG4gICAgdmFyIGdhcExlbmd0aCA9IGF4aXMgPT09ICd4JyA/IGVuZFggLSBzdGFydFggOiBlbmRZIC0gc3RhcnRZO1xuICAgIHZhciBnYXAgPSBnYXBMZW5ndGggLyAoYm91bmRhcnlHYXAgPyBsYWJlbE51bSA6IGxhYmVsTnVtIC0gMSk7XG4gICAgdmFyIHRpY2tQb3NpdGlvbiA9IG5ldyBBcnJheShsYWJlbE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgICAgaWYgKGF4aXMgPT09ICd4Jykge1xuICAgICAgICByZXR1cm4gW3N0YXJ0WCArIGdhcCAqIChib3VuZGFyeUdhcCA/IGkgKyAwLjUgOiBpKSwgc3RhcnRZXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtzdGFydFgsIHN0YXJ0WSArIGdhcCAqIChib3VuZGFyeUdhcCA/IGkgKyAwLjUgOiBpKV07XG4gICAgfSk7XG4gICAgdmFyIHRpY2tMaW5lUG9zaXRpb24gPSBnZXRUaWNrTGluZVBvc2l0aW9uKGF4aXMsIGJvdW5kYXJ5R2FwLCBwb3NpdGlvbiwgdGlja1Bvc2l0aW9uLCBnYXApO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzSXRlbSwge1xuICAgICAgdGlja1Bvc2l0aW9uOiB0aWNrUG9zaXRpb24sXG4gICAgICB0aWNrTGluZVBvc2l0aW9uOiB0aWNrTGluZVBvc2l0aW9uLFxuICAgICAgdGlja0dhcDogZ2FwXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUaWNrTGluZVBvc2l0aW9uKGF4aXNUeXBlLCBib3VuZGFyeUdhcCwgcG9zaXRpb24sIHRpY2tQb3NpdGlvbiwgZ2FwKSB7XG4gIHZhciBpbmRleCA9IGF4aXNUeXBlID09PSAneCcgPyAxIDogMDtcbiAgdmFyIHBsdXMgPSA1O1xuICBpZiAoYXhpc1R5cGUgPT09ICd4JyAmJiBwb3NpdGlvbiA9PT0gJ3RvcCcpIHBsdXMgPSAtNTtcbiAgaWYgKGF4aXNUeXBlID09PSAneScgJiYgcG9zaXRpb24gPT09ICdsZWZ0JykgcGx1cyA9IC01O1xuICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGxpbmVTdGFydCkge1xuICAgIHZhciBsaW5lRW5kID0gKDAsIF91dGlsMi5kZWVwQ2xvbmUpKGxpbmVTdGFydCk7XG4gICAgbGluZUVuZFtpbmRleF0gKz0gcGx1cztcbiAgICByZXR1cm4gWygwLCBfdXRpbDIuZGVlcENsb25lKShsaW5lU3RhcnQpLCBsaW5lRW5kXTtcbiAgfSk7XG4gIGlmICghYm91bmRhcnlHYXApIHJldHVybiB0aWNrTGluZVBvc2l0aW9uO1xuICBpbmRleCA9IGF4aXNUeXBlID09PSAneCcgPyAwIDogMTtcbiAgcGx1cyA9IGdhcCAvIDI7XG4gIHRpY2tMaW5lUG9zaXRpb24uZm9yRWFjaChmdW5jdGlvbiAoX3JlZjE2KSB7XG4gICAgdmFyIF9yZWYxNyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTYsIDIpLFxuICAgICAgICBsaW5lU3RhcnQgPSBfcmVmMTdbMF0sXG4gICAgICAgIGxpbmVFbmQgPSBfcmVmMTdbMV07XG5cbiAgICBsaW5lU3RhcnRbaW5kZXhdICs9IHBsdXM7XG4gICAgbGluZUVuZFtpbmRleF0gKz0gcGx1cztcbiAgfSk7XG4gIHJldHVybiB0aWNrTGluZVBvc2l0aW9uO1xufVxuXG5mdW5jdGlvbiBjYWxjQXhpc05hbWVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCkge1xuICByZXR1cm4gYWxsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXNJdGVtKSB7XG4gICAgdmFyIG5hbWVHYXAgPSBheGlzSXRlbS5uYW1lR2FwLFxuICAgICAgICBuYW1lTG9jYXRpb24gPSBheGlzSXRlbS5uYW1lTG9jYXRpb24sXG4gICAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb24sXG4gICAgICAgIGxpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLmxpbmVQb3NpdGlvbjtcblxuICAgIHZhciBfbGluZVBvc2l0aW9uMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9zaXRpb24sIDIpLFxuICAgICAgICBsaW5lU3RhcnQgPSBfbGluZVBvc2l0aW9uMlswXSxcbiAgICAgICAgbGluZUVuZCA9IF9saW5lUG9zaXRpb24yWzFdO1xuXG4gICAgdmFyIG5hbWVQb3NpdGlvbiA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVN0YXJ0KTtcbiAgICBpZiAobmFtZUxvY2F0aW9uID09PSAnZW5kJykgbmFtZVBvc2l0aW9uID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lRW5kKTtcblxuICAgIGlmIChuYW1lTG9jYXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICBuYW1lUG9zaXRpb25bMF0gPSAobGluZVN0YXJ0WzBdICsgbGluZUVuZFswXSkgLyAyO1xuICAgICAgbmFtZVBvc2l0aW9uWzFdID0gKGxpbmVTdGFydFsxXSArIGxpbmVFbmRbMV0pIC8gMjtcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgbmFtZUxvY2F0aW9uID09PSAnY2VudGVyJykgaW5kZXggPSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbmFtZUxvY2F0aW9uID09PSAnY2VudGVyJykgaW5kZXggPSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIG5hbWVMb2NhdGlvbiAhPT0gJ2NlbnRlcicpIGluZGV4ID0gMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcgJiYgbmFtZUxvY2F0aW9uICE9PSAnY2VudGVyJykgaW5kZXggPSAxO1xuICAgIHZhciBwbHVzID0gbmFtZUdhcDtcbiAgICBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmIG5hbWVMb2NhdGlvbiAhPT0gJ2VuZCcpIHBsdXMgKj0gLTE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbmFtZUxvY2F0aW9uICE9PSAnc3RhcnQnKSBwbHVzICo9IC0xO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbmFtZUxvY2F0aW9uID09PSAnc3RhcnQnKSBwbHVzICo9IC0xO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBuYW1lTG9jYXRpb24gPT09ICdlbmQnKSBwbHVzICo9IC0xO1xuICAgIG5hbWVQb3NpdGlvbltpbmRleF0gKz0gcGx1cztcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpc0l0ZW0sIHtcbiAgICAgIG5hbWVQb3NpdGlvbjogbmFtZVBvc2l0aW9uXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjU3BsaXRMaW5lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpIHtcbiAgdmFyIF9jaGFydCRncmlkQXJlYTIgPSBjaGFydC5ncmlkQXJlYSxcbiAgICAgIHcgPSBfY2hhcnQkZ3JpZEFyZWEyLncsXG4gICAgICBoID0gX2NoYXJ0JGdyaWRBcmVhMi5oO1xuICByZXR1cm4gYWxsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXNJdGVtKSB7XG4gICAgdmFyIHRpY2tMaW5lUG9zaXRpb24gPSBheGlzSXRlbS50aWNrTGluZVBvc2l0aW9uLFxuICAgICAgICBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uLFxuICAgICAgICBib3VuZGFyeUdhcCA9IGF4aXNJdGVtLmJvdW5kYXJ5R2FwO1xuICAgIHZhciBpbmRleCA9IDAsXG4gICAgICAgIHBsdXMgPSB3O1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nKSBpbmRleCA9IDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHBsdXMgPSBoO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHBsdXMgKj0gLTE7XG4gICAgdmFyIHNwbGl0TGluZVBvc2l0aW9uID0gdGlja0xpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKF9yZWYxOCkge1xuICAgICAgdmFyIF9yZWYxOSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTgsIDEpLFxuICAgICAgICAgIHN0YXJ0UG9pbnQgPSBfcmVmMTlbMF07XG5cbiAgICAgIHZhciBlbmRQb2ludCA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc3RhcnRQb2ludCk7XG4gICAgICBlbmRQb2ludFtpbmRleF0gKz0gcGx1cztcbiAgICAgIHJldHVybiBbKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzdGFydFBvaW50KSwgZW5kUG9pbnRdO1xuICAgIH0pO1xuICAgIGlmICghYm91bmRhcnlHYXApIHNwbGl0TGluZVBvc2l0aW9uLnNoaWZ0KCk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXNJdGVtLCB7XG4gICAgICBzcGxpdExpbmVQb3NpdGlvbjogc3BsaXRMaW5lUG9zaXRpb25cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVDb25maWcoYXhpc0l0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYXhpc0l0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYXhpc0l0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgdmlzaWJsZTogYXhpc0l0ZW0uYXhpc0xpbmUuc2hvdyxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXRMaW5lU2hhcGUoYXhpc0l0ZW0pLFxuICAgIHN0eWxlOiBnZXRMaW5lU3R5bGUoYXhpc0l0ZW0pXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lU2hhcGUoYXhpc0l0ZW0pIHtcbiAgdmFyIGxpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLmxpbmVQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IGxpbmVQb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lU3R5bGUoYXhpc0l0ZW0pIHtcbiAgcmV0dXJuIGF4aXNJdGVtLmF4aXNMaW5lLnN0eWxlO1xufVxuXG5mdW5jdGlvbiBnZXRUaWNrQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldFRpY2tTaGFwZXMoYXhpc0l0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRUaWNrU3R5bGUoYXhpc0l0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBheGlzSXRlbS5heGlzVGljay5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tTaGFwZXMoYXhpc0l0ZW0pIHtcbiAgdmFyIHRpY2tMaW5lUG9zaXRpb24gPSBheGlzSXRlbS50aWNrTGluZVBvc2l0aW9uO1xuICByZXR1cm4gdGlja0xpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHBvaW50cykge1xuICAgIHJldHVybiB7XG4gICAgICBwb2ludHM6IHBvaW50c1xuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUaWNrU3R5bGUoYXhpc0l0ZW0pIHtcbiAgcmV0dXJuIGF4aXNJdGVtLmF4aXNUaWNrLnN0eWxlO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbENvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRMYWJlbFNoYXBlcyhheGlzSXRlbSk7XG4gIHZhciBzdHlsZXMgPSBnZXRMYWJlbFN0eWxlKGF4aXNJdGVtLCBzaGFwZXMpO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUsIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGF4aXNJdGVtLmF4aXNMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlc1tpXSxcbiAgICAgIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcigpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTaGFwZXMoYXhpc0l0ZW0pIHtcbiAgdmFyIGxhYmVsID0gYXhpc0l0ZW0ubGFiZWwsXG4gICAgICB0aWNrUG9zaXRpb24gPSBheGlzSXRlbS50aWNrUG9zaXRpb24sXG4gICAgICBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uO1xuICByZXR1cm4gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9pbnQsIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IGdldExhYmVsUmVhbFBvc2l0aW9uKHBvaW50LCBwb3NpdGlvbiksXG4gICAgICBjb250ZW50OiBsYWJlbFtpXS50b1N0cmluZygpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsUmVhbFBvc2l0aW9uKHBvaW50cywgcG9zaXRpb24pIHtcbiAgdmFyIGluZGV4ID0gMCxcbiAgICAgIHBsdXMgPSAxMDtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIGluZGV4ID0gMTtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2xlZnQnKSBwbHVzID0gLTEwO1xuICBwb2ludHMgPSAoMCwgX3V0aWwyLmRlZXBDbG9uZSkocG9pbnRzKTtcbiAgcG9pbnRzW2luZGV4XSArPSBwbHVzO1xuICByZXR1cm4gcG9pbnRzO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFN0eWxlKGF4aXNJdGVtLCBzaGFwZXMpIHtcbiAgdmFyIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb247XG4gIHZhciBzdHlsZSA9IGF4aXNJdGVtLmF4aXNMYWJlbC5zdHlsZTtcbiAgdmFyIGFsaWduID0gZ2V0QXhpc0xhYmVsUmVhbEFsaWduKHBvc2l0aW9uKTtcbiAgc3R5bGUgPSAoMCwgX3V0aWwuZGVlcE1lcmdlKShhbGlnbiwgc3R5bGUpO1xuICB2YXIgc3R5bGVzID0gc2hhcGVzLm1hcChmdW5jdGlvbiAoX3JlZjIwKSB7XG4gICAgdmFyIHBvc2l0aW9uID0gX3JlZjIwLnBvc2l0aW9uO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZSwge1xuICAgICAgZ3JhcGhDZW50ZXI6IHBvc2l0aW9uXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gc3R5bGVzO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxSZWFsQWxpZ24ocG9zaXRpb24pIHtcbiAgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAncmlnaHQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIHRleHRCYXNlbGluZTogJ3RvcCdcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZUNvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICd0ZXh0JyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldE5hbWVTaGFwZShheGlzSXRlbSksXG4gICAgc3R5bGU6IGdldE5hbWVTdHlsZShheGlzSXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVTaGFwZShheGlzSXRlbSkge1xuICB2YXIgbmFtZSA9IGF4aXNJdGVtLm5hbWUsXG4gICAgICBuYW1lUG9zaXRpb24gPSBheGlzSXRlbS5uYW1lUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgY29udGVudDogbmFtZSxcbiAgICBwb3NpdGlvbjogbmFtZVBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVTdHlsZShheGlzSXRlbSkge1xuICB2YXIgbmFtZUxvY2F0aW9uID0gYXhpc0l0ZW0ubmFtZUxvY2F0aW9uLFxuICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbixcbiAgICAgIHN0eWxlID0gYXhpc0l0ZW0ubmFtZVRleHRTdHlsZTtcbiAgdmFyIGFsaWduID0gZ2V0TmFtZVJlYWxBbGlnbihwb3NpdGlvbiwgbmFtZUxvY2F0aW9uKTtcbiAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKGFsaWduLCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVSZWFsQWxpZ24ocG9zaXRpb24sIGxvY2F0aW9uKSB7XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgbG9jYXRpb24gPT09ICdzdGFydCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nICYmIGxvY2F0aW9uID09PSAnc3RhcnQnIHx8IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbG9jYXRpb24gPT09ICdjZW50ZXInKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ3JpZ2h0JyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdtaWRkbGUnXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgbG9jYXRpb24gPT09ICdlbmQnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBsb2NhdGlvbiA9PT0gJ2VuZCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcgJiYgbG9jYXRpb24gPT09ICdjZW50ZXInKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBsb2NhdGlvbiA9PT0gJ2NlbnRlcicgfHwgcG9zaXRpb24gPT09ICdsZWZ0JyAmJiBsb2NhdGlvbiA9PT0gJ2VuZCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcgJiYgbG9jYXRpb24gPT09ICdlbmQnKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nICYmIGxvY2F0aW9uID09PSAnY2VudGVyJyB8fCBwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGxvY2F0aW9uID09PSAnc3RhcnQnIHx8IHBvc2l0aW9uID09PSAncmlnaHQnICYmIGxvY2F0aW9uID09PSAnc3RhcnQnKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAndG9wJ1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVDb25maWcoYXhpc0l0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYXhpc0l0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYXhpc0l0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0U3BsaXRMaW5lU2hhcGVzKGF4aXNJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0U3BsaXRMaW5lU3R5bGUoYXhpc0l0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBheGlzSXRlbS5zcGxpdExpbmUuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVTaGFwZXMoYXhpc0l0ZW0pIHtcbiAgdmFyIHNwbGl0TGluZVBvc2l0aW9uID0gYXhpc0l0ZW0uc3BsaXRMaW5lUG9zaXRpb247XG4gIHJldHVybiBzcGxpdExpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHBvaW50cykge1xuICAgIHJldHVybiB7XG4gICAgICBwb2ludHM6IHBvaW50c1xuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVTdHlsZShheGlzSXRlbSkge1xuICByZXR1cm4gYXhpc0l0ZW0uc3BsaXRMaW5lLnN0eWxlO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYmFyID0gYmFyO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIGJhcihjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHhBeGlzID0gb3B0aW9uLnhBeGlzLFxuICAgICAgeUF4aXMgPSBvcHRpb24ueUF4aXMsXG4gICAgICBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICB2YXIgYmFycyA9IFtdO1xuXG4gIGlmICh4QXhpcyAmJiB5QXhpcyAmJiBzZXJpZXMpIHtcbiAgICBiYXJzID0gKDAsIF91dGlsMi5pbml0TmVlZFNlcmllcykoc2VyaWVzLCBfY29uZmlnLmJhckNvbmZpZywgJ2JhcicpO1xuICAgIGJhcnMgPSBzZXRCYXJBeGlzKGJhcnMsIGNoYXJ0KTtcbiAgICBiYXJzID0gc2V0QmFyUG9zaXRpb25EYXRhKGJhcnMsIGNoYXJ0KTtcbiAgICBiYXJzID0gY2FsY0JhcnNQb3NpdGlvbihiYXJzLCBjaGFydCk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBiYXJzLnNsaWNlKC0xKSxcbiAgICBrZXk6ICdiYWNrZ3JvdW5kQmFyJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QmFja2dyb3VuZEJhckNvbmZpZ1xuICB9KTtcbiAgYmFycy5yZXZlcnNlKCk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGJhcnMsXG4gICAga2V5OiAnYmFyJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QmFyQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0QmFyQ29uZmlnLFxuICAgIGJlZm9yZVVwZGF0ZTogYmVmb3JlVXBkYXRlQmFyXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBiYXJzLFxuICAgIGtleTogJ2JhckxhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGFiZWxDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldEJhckF4aXMoYmFycywgY2hhcnQpIHtcbiAgdmFyIGF4aXNEYXRhID0gY2hhcnQuYXhpc0RhdGE7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIHhBeGlzSW5kZXggPSBiYXIueEF4aXNJbmRleCxcbiAgICAgICAgeUF4aXNJbmRleCA9IGJhci55QXhpc0luZGV4O1xuICAgIGlmICh0eXBlb2YgeEF4aXNJbmRleCAhPT0gJ251bWJlcicpIHhBeGlzSW5kZXggPSAwO1xuICAgIGlmICh0eXBlb2YgeUF4aXNJbmRleCAhPT0gJ251bWJlcicpIHlBeGlzSW5kZXggPSAwO1xuICAgIHZhciB4QXhpcyA9IGF4aXNEYXRhLmZpbmQoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBheGlzID0gX3JlZi5heGlzLFxuICAgICAgICAgIGluZGV4ID0gX3JlZi5pbmRleDtcbiAgICAgIHJldHVybiBcIlwiLmNvbmNhdChheGlzKS5jb25jYXQoaW5kZXgpID09PSBcInhcIi5jb25jYXQoeEF4aXNJbmRleCk7XG4gICAgfSk7XG4gICAgdmFyIHlBeGlzID0gYXhpc0RhdGEuZmluZChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICAgIHZhciBheGlzID0gX3JlZjIuYXhpcyxcbiAgICAgICAgICBpbmRleCA9IF9yZWYyLmluZGV4O1xuICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KGF4aXMpLmNvbmNhdChpbmRleCkgPT09IFwieVwiLmNvbmNhdCh5QXhpc0luZGV4KTtcbiAgICB9KTtcbiAgICB2YXIgYXhpcyA9IFt4QXhpcywgeUF4aXNdO1xuICAgIHZhciB2YWx1ZUF4aXNJbmRleCA9IGF4aXMuZmluZEluZGV4KGZ1bmN0aW9uIChfcmVmMykge1xuICAgICAgdmFyIGRhdGEgPSBfcmVmMy5kYXRhO1xuICAgICAgcmV0dXJuIGRhdGEgPT09ICd2YWx1ZSc7XG4gICAgfSk7XG4gICAgYmFyLnZhbHVlQXhpcyA9IGF4aXNbdmFsdWVBeGlzSW5kZXhdO1xuICAgIGJhci5sYWJlbEF4aXMgPSBheGlzWzEgLSB2YWx1ZUF4aXNJbmRleF07XG4gIH0pO1xuICByZXR1cm4gYmFycztcbn1cblxuZnVuY3Rpb24gc2V0QmFyUG9zaXRpb25EYXRhKGJhcnMsIGNoYXJ0KSB7XG4gIHZhciBsYWJlbEJhckdyb3VwID0gZ3JvdXBCYXJCeUxhYmVsQXhpcyhiYXJzKTtcbiAgbGFiZWxCYXJHcm91cC5mb3JFYWNoKGZ1bmN0aW9uIChncm91cCkge1xuICAgIHNldEJhckluZGV4KGdyb3VwKTtcbiAgICBzZXRCYXJOdW0oZ3JvdXApO1xuICAgIHNldEJhckNhdGVnb3J5V2lkdGgoZ3JvdXAsIGNoYXJ0KTtcbiAgICBzZXRCYXJXaWR0aEFuZEdhcChncm91cCk7XG4gICAgc2V0QmFyQWxsV2lkdGhBbmRHYXAoZ3JvdXApO1xuICB9KTtcbiAgcmV0dXJuIGJhcnM7XG59XG5cbmZ1bmN0aW9uIHNldEJhckluZGV4KGJhcnMpIHtcbiAgdmFyIHN0YWNrcyA9IGdldEJhclN0YWNrKGJhcnMpO1xuICBzdGFja3MgPSBzdGFja3MubWFwKGZ1bmN0aW9uIChzdGFjaykge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFjazogc3RhY2ssXG4gICAgICBpbmRleDogLTFcbiAgICB9O1xuICB9KTtcbiAgdmFyIGN1cnJlbnRJbmRleCA9IDA7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIHN0YWNrID0gYmFyLnN0YWNrO1xuXG4gICAgaWYgKCFzdGFjaykge1xuICAgICAgYmFyLmJhckluZGV4ID0gY3VycmVudEluZGV4O1xuICAgICAgY3VycmVudEluZGV4Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzdGFja0RhdGEgPSBzdGFja3MuZmluZChmdW5jdGlvbiAoX3JlZjQpIHtcbiAgICAgICAgdmFyIHMgPSBfcmVmNC5zdGFjaztcbiAgICAgICAgcmV0dXJuIHMgPT09IHN0YWNrO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChzdGFja0RhdGEuaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHN0YWNrRGF0YS5pbmRleCA9IGN1cnJlbnRJbmRleDtcbiAgICAgICAgY3VycmVudEluZGV4Kys7XG4gICAgICB9XG5cbiAgICAgIGJhci5iYXJJbmRleCA9IHN0YWNrRGF0YS5pbmRleDtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBncm91cEJhckJ5TGFiZWxBeGlzKGJhcnMpIHtcbiAgdmFyIGxhYmVsQXhpcyA9IGJhcnMubWFwKGZ1bmN0aW9uIChfcmVmNSkge1xuICAgIHZhciBfcmVmNSRsYWJlbEF4aXMgPSBfcmVmNS5sYWJlbEF4aXMsXG4gICAgICAgIGF4aXMgPSBfcmVmNSRsYWJlbEF4aXMuYXhpcyxcbiAgICAgICAgaW5kZXggPSBfcmVmNSRsYWJlbEF4aXMuaW5kZXg7XG4gICAgcmV0dXJuIGF4aXMgKyBpbmRleDtcbiAgfSk7XG4gIGxhYmVsQXhpcyA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3IFNldChsYWJlbEF4aXMpKTtcbiAgcmV0dXJuIGxhYmVsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXNJbmRleCkge1xuICAgIHJldHVybiBiYXJzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjYpIHtcbiAgICAgIHZhciBfcmVmNiRsYWJlbEF4aXMgPSBfcmVmNi5sYWJlbEF4aXMsXG4gICAgICAgICAgYXhpcyA9IF9yZWY2JGxhYmVsQXhpcy5heGlzLFxuICAgICAgICAgIGluZGV4ID0gX3JlZjYkbGFiZWxBeGlzLmluZGV4O1xuICAgICAgcmV0dXJuIGF4aXMgKyBpbmRleCA9PT0gYXhpc0luZGV4O1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyU3RhY2soYmFycykge1xuICB2YXIgc3RhY2tzID0gW107XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICB2YXIgc3RhY2sgPSBfcmVmNy5zdGFjaztcbiAgICBpZiAoc3RhY2spIHN0YWNrcy5wdXNoKHN0YWNrKTtcbiAgfSk7XG4gIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ldyBTZXQoc3RhY2tzKSk7XG59XG5cbmZ1bmN0aW9uIHNldEJhck51bShiYXJzKSB7XG4gIHZhciBiYXJOdW0gPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ldyBTZXQoYmFycy5tYXAoZnVuY3Rpb24gKF9yZWY4KSB7XG4gICAgdmFyIGJhckluZGV4ID0gX3JlZjguYmFySW5kZXg7XG4gICAgcmV0dXJuIGJhckluZGV4O1xuICB9KSkpLmxlbmd0aDtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICByZXR1cm4gYmFyLmJhck51bSA9IGJhck51bTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldEJhckNhdGVnb3J5V2lkdGgoYmFycykge1xuICB2YXIgbGFzdEJhciA9IGJhcnMuc2xpY2UoLTEpWzBdO1xuICB2YXIgYmFyQ2F0ZWdvcnlHYXAgPSBsYXN0QmFyLmJhckNhdGVnb3J5R2FwLFxuICAgICAgdGlja0dhcCA9IGxhc3RCYXIubGFiZWxBeGlzLnRpY2tHYXA7XG4gIHZhciBiYXJDYXRlZ29yeVdpZHRoID0gMDtcblxuICBpZiAodHlwZW9mIGJhckNhdGVnb3J5R2FwID09PSAnbnVtYmVyJykge1xuICAgIGJhckNhdGVnb3J5V2lkdGggPSBiYXJDYXRlZ29yeUdhcDtcbiAgfSBlbHNlIHtcbiAgICBiYXJDYXRlZ29yeVdpZHRoID0gKDEgLSBwYXJzZUludChiYXJDYXRlZ29yeUdhcCkgLyAxMDApICogdGlja0dhcDtcbiAgfVxuXG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgcmV0dXJuIGJhci5iYXJDYXRlZ29yeVdpZHRoID0gYmFyQ2F0ZWdvcnlXaWR0aDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldEJhcldpZHRoQW5kR2FwKGJhcnMpIHtcbiAgdmFyIF9iYXJzJHNsaWNlJCA9IGJhcnMuc2xpY2UoLTEpWzBdLFxuICAgICAgYmFyQ2F0ZWdvcnlXaWR0aCA9IF9iYXJzJHNsaWNlJC5iYXJDYXRlZ29yeVdpZHRoLFxuICAgICAgYmFyV2lkdGggPSBfYmFycyRzbGljZSQuYmFyV2lkdGgsXG4gICAgICBiYXJHYXAgPSBfYmFycyRzbGljZSQuYmFyR2FwLFxuICAgICAgYmFyTnVtID0gX2JhcnMkc2xpY2UkLmJhck51bTtcbiAgdmFyIHdpZHRoQW5kR2FwID0gW107XG5cbiAgaWYgKHR5cGVvZiBiYXJXaWR0aCA9PT0gJ251bWJlcicgfHwgYmFyV2lkdGggIT09ICdhdXRvJykge1xuICAgIHdpZHRoQW5kR2FwID0gZ2V0QmFyV2lkdGhBbmRHYXBXaXRoUGVyY2VudE9yTnVtYmVyKGJhckNhdGVnb3J5V2lkdGgsIGJhcldpZHRoLCBiYXJHYXAsIGJhck51bSk7XG4gIH0gZWxzZSBpZiAoYmFyV2lkdGggPT09ICdhdXRvJykge1xuICAgIHdpZHRoQW5kR2FwID0gZ2V0QmFyV2lkdGhBbmRHYXBXaWR0aEF1dG8oYmFyQ2F0ZWdvcnlXaWR0aCwgYmFyV2lkdGgsIGJhckdhcCwgYmFyTnVtKTtcbiAgfVxuXG4gIHZhciBfd2lkdGhBbmRHYXAgPSB3aWR0aEFuZEdhcCxcbiAgICAgIF93aWR0aEFuZEdhcDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3dpZHRoQW5kR2FwLCAyKSxcbiAgICAgIHdpZHRoID0gX3dpZHRoQW5kR2FwMlswXSxcbiAgICAgIGdhcCA9IF93aWR0aEFuZEdhcDJbMV07XG5cbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICBiYXIuYmFyV2lkdGggPSB3aWR0aDtcbiAgICBiYXIuYmFyR2FwID0gZ2FwO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyV2lkdGhBbmRHYXBXaXRoUGVyY2VudE9yTnVtYmVyKGJhckNhdGVnb3J5V2lkdGgsIGJhcldpZHRoLCBiYXJHYXApIHtcbiAgdmFyIHdpZHRoID0gMCxcbiAgICAgIGdhcCA9IDA7XG5cbiAgaWYgKHR5cGVvZiBiYXJXaWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICB3aWR0aCA9IGJhcldpZHRoO1xuICB9IGVsc2Uge1xuICAgIHdpZHRoID0gcGFyc2VJbnQoYmFyV2lkdGgpIC8gMTAwICogYmFyQ2F0ZWdvcnlXaWR0aDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYmFyR2FwID09PSAnbnVtYmVyJykge1xuICAgIGdhcCA9IGJhckdhcDtcbiAgfSBlbHNlIHtcbiAgICBnYXAgPSBwYXJzZUludChiYXJHYXApIC8gMTAwICogd2lkdGg7XG4gIH1cblxuICByZXR1cm4gW3dpZHRoLCBnYXBdO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJXaWR0aEFuZEdhcFdpZHRoQXV0byhiYXJDYXRlZ29yeVdpZHRoLCBiYXJXaWR0aCwgYmFyR2FwLCBiYXJOdW0pIHtcbiAgdmFyIHdpZHRoID0gMCxcbiAgICAgIGdhcCA9IDA7XG4gIHZhciBiYXJJdGVtV2lkdGggPSBiYXJDYXRlZ29yeVdpZHRoIC8gYmFyTnVtO1xuXG4gIGlmICh0eXBlb2YgYmFyR2FwID09PSAnbnVtYmVyJykge1xuICAgIGdhcCA9IGJhckdhcDtcbiAgICB3aWR0aCA9IGJhckl0ZW1XaWR0aCAtIGdhcDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGVyY2VudCA9IDEwICsgcGFyc2VJbnQoYmFyR2FwKSAvIDEwO1xuXG4gICAgaWYgKHBlcmNlbnQgPT09IDApIHtcbiAgICAgIHdpZHRoID0gYmFySXRlbVdpZHRoICogMjtcbiAgICAgIGdhcCA9IC13aWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2lkdGggPSBiYXJJdGVtV2lkdGggLyBwZXJjZW50ICogMTA7XG4gICAgICBnYXAgPSBiYXJJdGVtV2lkdGggLSB3aWR0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW3dpZHRoLCBnYXBdO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJBbGxXaWR0aEFuZEdhcChiYXJzKSB7XG4gIHZhciBfYmFycyRzbGljZSQyID0gYmFycy5zbGljZSgtMSlbMF0sXG4gICAgICBiYXJHYXAgPSBfYmFycyRzbGljZSQyLmJhckdhcCxcbiAgICAgIGJhcldpZHRoID0gX2JhcnMkc2xpY2UkMi5iYXJXaWR0aCxcbiAgICAgIGJhck51bSA9IF9iYXJzJHNsaWNlJDIuYmFyTnVtO1xuICB2YXIgYmFyQWxsV2lkdGhBbmRHYXAgPSAoYmFyR2FwICsgYmFyV2lkdGgpICogYmFyTnVtIC0gYmFyR2FwO1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHJldHVybiBiYXIuYmFyQWxsV2lkdGhBbmRHYXAgPSBiYXJBbGxXaWR0aEFuZEdhcDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNCYXJzUG9zaXRpb24oYmFycywgY2hhcnQpIHtcbiAgYmFycyA9IGNhbGNCYXJWYWx1ZUF4aXNDb29yZGluYXRlKGJhcnMpO1xuICBiYXJzID0gY2FsY0JhckxhYmVsQXhpc0Nvb3JkaW5hdGUoYmFycyk7XG4gIGJhcnMgPSBlbGltaW5hdGVOdWxsQmFyTGFiZWxBeGlzKGJhcnMpO1xuICBiYXJzID0ga2VlcFNhbWVOdW1CZXR3ZWVuQmFyQW5kRGF0YShiYXJzKTtcbiAgcmV0dXJuIGJhcnM7XG59XG5cbmZ1bmN0aW9uIGNhbGNCYXJMYWJlbEF4aXNDb29yZGluYXRlKGJhcnMpIHtcbiAgcmV0dXJuIGJhcnMubWFwKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgbGFiZWxBeGlzID0gYmFyLmxhYmVsQXhpcyxcbiAgICAgICAgYmFyQWxsV2lkdGhBbmRHYXAgPSBiYXIuYmFyQWxsV2lkdGhBbmRHYXAsXG4gICAgICAgIGJhckdhcCA9IGJhci5iYXJHYXAsXG4gICAgICAgIGJhcldpZHRoID0gYmFyLmJhcldpZHRoLFxuICAgICAgICBiYXJJbmRleCA9IGJhci5iYXJJbmRleDtcbiAgICB2YXIgdGlja0dhcCA9IGxhYmVsQXhpcy50aWNrR2FwLFxuICAgICAgICB0aWNrUG9zaXRpb24gPSBsYWJlbEF4aXMudGlja1Bvc2l0aW9uLFxuICAgICAgICBheGlzID0gbGFiZWxBeGlzLmF4aXM7XG4gICAgdmFyIGNvb3JkaW5hdGVJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICAgIHZhciBiYXJMYWJlbEF4aXNQb3MgPSB0aWNrUG9zaXRpb24ubWFwKGZ1bmN0aW9uICh0aWNrLCBpKSB7XG4gICAgICB2YXIgYmFyQ2F0ZWdvcnlTdGFydFBvcyA9IHRpY2tQb3NpdGlvbltpXVtjb29yZGluYXRlSW5kZXhdIC0gdGlja0dhcCAvIDI7XG4gICAgICB2YXIgYmFySXRlbXNTdGFydFBvcyA9IGJhckNhdGVnb3J5U3RhcnRQb3MgKyAodGlja0dhcCAtIGJhckFsbFdpZHRoQW5kR2FwKSAvIDI7XG4gICAgICByZXR1cm4gYmFySXRlbXNTdGFydFBvcyArIChiYXJJbmRleCArIDAuNSkgKiBiYXJXaWR0aCArIGJhckluZGV4ICogYmFyR2FwO1xuICAgIH0pO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBiYXIsIHtcbiAgICAgIGJhckxhYmVsQXhpc1BvczogYmFyTGFiZWxBeGlzUG9zXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjQmFyVmFsdWVBeGlzQ29vcmRpbmF0ZShiYXJzKSB7XG4gIHJldHVybiBiYXJzLm1hcChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIGRhdGEgPSAoMCwgX3V0aWwyLm1lcmdlU2FtZVN0YWNrRGF0YSkoYmFyLCBiYXJzKTtcbiAgICBkYXRhID0gZWxpbWluYXRlTm9uTnVtYmVyRGF0YShiYXIsIGRhdGEpO1xuICAgIHZhciBfYmFyJHZhbHVlQXhpcyA9IGJhci52YWx1ZUF4aXMsXG4gICAgICAgIGF4aXMgPSBfYmFyJHZhbHVlQXhpcy5heGlzLFxuICAgICAgICBtaW5WYWx1ZSA9IF9iYXIkdmFsdWVBeGlzLm1pblZhbHVlLFxuICAgICAgICBtYXhWYWx1ZSA9IF9iYXIkdmFsdWVBeGlzLm1heFZhbHVlLFxuICAgICAgICBsaW5lUG9zaXRpb24gPSBfYmFyJHZhbHVlQXhpcy5saW5lUG9zaXRpb247XG4gICAgdmFyIHN0YXJ0UG9zID0gZ2V0VmFsdWVQb3MobWluVmFsdWUsIG1heFZhbHVlLCBtaW5WYWx1ZSA8IDAgPyAwIDogbWluVmFsdWUsIGxpbmVQb3NpdGlvbiwgYXhpcyk7XG4gICAgdmFyIGVuZFBvcyA9IGRhdGEubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gZ2V0VmFsdWVQb3MobWluVmFsdWUsIG1heFZhbHVlLCB2LCBsaW5lUG9zaXRpb24sIGF4aXMpO1xuICAgIH0pO1xuICAgIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBlbmRQb3MubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gW3N0YXJ0UG9zLCBwXTtcbiAgICB9KTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYmFyLCB7XG4gICAgICBiYXJWYWx1ZUF4aXNQb3M6IGJhclZhbHVlQXhpc1Bvc1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZWxpbWluYXRlTm9uTnVtYmVyRGF0YShiYXJJdGVtLCBiYXJEYXRhKSB7XG4gIHZhciBkYXRhID0gYmFySXRlbS5kYXRhO1xuICByZXR1cm4gYmFyRGF0YS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICByZXR1cm4gdHlwZW9mIGRhdGFbaV0gPT09ICdudW1iZXInID8gdiA6IG51bGw7XG4gIH0pLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkICE9PSBudWxsO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZWxpbWluYXRlTnVsbEJhckxhYmVsQXhpcyhiYXJzKSB7XG4gIHJldHVybiBiYXJzLm1hcChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIGJhckxhYmVsQXhpc1BvcyA9IGJhci5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICAgIGRhdGEgPSBiYXIuZGF0YTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgIGlmICh0eXBlb2YgZCA9PT0gJ251bWJlcicpIHJldHVybjtcbiAgICAgIGJhckxhYmVsQXhpc1Bvc1tpXSA9IG51bGw7XG4gICAgfSk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGJhciwge1xuICAgICAgYmFyTGFiZWxBeGlzUG9zOiBiYXJMYWJlbEF4aXNQb3MuZmlsdGVyKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiBwICE9PSBudWxsO1xuICAgICAgfSlcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGtlZXBTYW1lTnVtQmV0d2VlbkJhckFuZERhdGEoYmFycykge1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciBkYXRhID0gYmFyLmRhdGEsXG4gICAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhci5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICAgIGJhclZhbHVlQXhpc1BvcyA9IGJhci5iYXJWYWx1ZUF4aXNQb3M7XG4gICAgdmFyIGRhdGFOdW0gPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBkID09PSAnbnVtYmVyJztcbiAgICB9KS5sZW5ndGg7XG4gICAgdmFyIGF4aXNQb3NOdW0gPSBiYXJMYWJlbEF4aXNQb3MubGVuZ3RoO1xuXG4gICAgaWYgKGF4aXNQb3NOdW0gPiBkYXRhTnVtKSB7XG4gICAgICBiYXJMYWJlbEF4aXNQb3Muc3BsaWNlKGRhdGFOdW0pO1xuICAgICAgYmFyVmFsdWVBeGlzUG9zLnNwbGljZShkYXRhTnVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYmFycztcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVQb3MobWluLCBtYXgsIHZhbHVlLCBsaW5lUG9zaXRpb24sIGF4aXMpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHJldHVybiBudWxsO1xuICB2YXIgdmFsdWVNaW51cyA9IG1heCAtIG1pbjtcbiAgdmFyIGNvb3JkaW5hdGVJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgcG9zTWludXMgPSBsaW5lUG9zaXRpb25bMV1bY29vcmRpbmF0ZUluZGV4XSAtIGxpbmVQb3NpdGlvblswXVtjb29yZGluYXRlSW5kZXhdO1xuICB2YXIgcGVyY2VudCA9ICh2YWx1ZSAtIG1pbikgLyB2YWx1ZU1pbnVzO1xuICBpZiAodmFsdWVNaW51cyA9PT0gMCkgcGVyY2VudCA9IDA7XG4gIHZhciBwb3MgPSBwZXJjZW50ICogcG9zTWludXM7XG4gIHJldHVybiBwb3MgKyBsaW5lUG9zaXRpb25bMF1bY29vcmRpbmF0ZUluZGV4XTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJhckNvbmZpZyhiYXJJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGJhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGJhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBiYXJJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldEJhY2tncm91bmRCYXJTaGFwZXMoYmFySXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldEJhY2tncm91bmRCYXJTdHlsZShiYXJJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdyZWN0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBiYXJJdGVtLmJhY2tncm91bmRCYXIuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQmFyU2hhcGVzKGJhckl0ZW0pIHtcbiAgdmFyIGxhYmVsQXhpcyA9IGJhckl0ZW0ubGFiZWxBeGlzLFxuICAgICAgdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXM7XG4gIHZhciB0aWNrUG9zaXRpb24gPSBsYWJlbEF4aXMudGlja1Bvc2l0aW9uO1xuICB2YXIgYXhpcyA9IHZhbHVlQXhpcy5heGlzLFxuICAgICAgbGluZVBvc2l0aW9uID0gdmFsdWVBeGlzLmxpbmVQb3NpdGlvbjtcbiAgdmFyIHdpZHRoID0gZ2V0QmFja2dyb3VuZEJhcldpZHRoKGJhckl0ZW0pO1xuICB2YXIgaGFsdFdpZHRoID0gd2lkdGggLyAyO1xuICB2YXIgcG9zSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIGNlbnRlclBvcyA9IHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcFsxIC0gcG9zSW5kZXhdO1xuICB9KTtcbiAgdmFyIF9yZWY5ID0gW2xpbmVQb3NpdGlvblswXVtwb3NJbmRleF0sIGxpbmVQb3NpdGlvblsxXVtwb3NJbmRleF1dLFxuICAgICAgc3RhcnQgPSBfcmVmOVswXSxcbiAgICAgIGVuZCA9IF9yZWY5WzFdO1xuICByZXR1cm4gY2VudGVyUG9zLm1hcChmdW5jdGlvbiAoY2VudGVyKSB7XG4gICAgaWYgKGF4aXMgPT09ICd4Jykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogc3RhcnQsXG4gICAgICAgIHk6IGNlbnRlciAtIGhhbHRXaWR0aCxcbiAgICAgICAgdzogZW5kIC0gc3RhcnQsXG4gICAgICAgIGg6IHdpZHRoXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBjZW50ZXIgLSBoYWx0V2lkdGgsXG4gICAgICAgIHk6IGVuZCxcbiAgICAgICAgdzogd2lkdGgsXG4gICAgICAgIGg6IHN0YXJ0IC0gZW5kXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRCYXJXaWR0aChiYXJJdGVtKSB7XG4gIHZhciBiYXJBbGxXaWR0aEFuZEdhcCA9IGJhckl0ZW0uYmFyQWxsV2lkdGhBbmRHYXAsXG4gICAgICBiYXJDYXRlZ29yeVdpZHRoID0gYmFySXRlbS5iYXJDYXRlZ29yeVdpZHRoLFxuICAgICAgYmFja2dyb3VuZEJhciA9IGJhckl0ZW0uYmFja2dyb3VuZEJhcjtcbiAgdmFyIHdpZHRoID0gYmFja2dyb3VuZEJhci53aWR0aDtcbiAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHJldHVybiB3aWR0aDtcbiAgaWYgKHdpZHRoID09PSAnYXV0bycpIHJldHVybiBiYXJBbGxXaWR0aEFuZEdhcDtcbiAgcmV0dXJuIHBhcnNlSW50KHdpZHRoKSAvIDEwMCAqIGJhckNhdGVnb3J5V2lkdGg7XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRCYXJTdHlsZShiYXJJdGVtKSB7XG4gIHJldHVybiBiYXJJdGVtLmJhY2tncm91bmRCYXIuc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldEJhckNvbmZpZyhiYXJJdGVtKSB7XG4gIHZhciBiYXJMYWJlbEF4aXNQb3MgPSBiYXJJdGVtLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gYmFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYmFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGJhckl0ZW0uckxldmVsO1xuICB2YXIgbmFtZSA9IGdldEJhck5hbWUoYmFySXRlbSk7XG4gIHJldHVybiBiYXJMYWJlbEF4aXNQb3MubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0QmFyU2hhcGUoYmFySXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0QmFyU3R5bGUoYmFySXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyTmFtZShiYXJJdGVtKSB7XG4gIHZhciBzaGFwZVR5cGUgPSBiYXJJdGVtLnNoYXBlVHlwZTtcbiAgaWYgKHNoYXBlVHlwZSA9PT0gJ2xlZnRFY2hlbG9uJyB8fCBzaGFwZVR5cGUgPT09ICdyaWdodEVjaGVsb24nKSByZXR1cm4gJ3BvbHlsaW5lJztcbiAgcmV0dXJuICdyZWN0Jztcbn1cblxuZnVuY3Rpb24gZ2V0QmFyU2hhcGUoYmFySXRlbSwgaSkge1xuICB2YXIgc2hhcGVUeXBlID0gYmFySXRlbS5zaGFwZVR5cGU7XG5cbiAgaWYgKHNoYXBlVHlwZSA9PT0gJ2xlZnRFY2hlbG9uJykge1xuICAgIHJldHVybiBnZXRMZWZ0RWNoZWxvblNoYXBlKGJhckl0ZW0sIGkpO1xuICB9IGVsc2UgaWYgKHNoYXBlVHlwZSA9PT0gJ3JpZ2h0RWNoZWxvbicpIHtcbiAgICByZXR1cm4gZ2V0UmlnaHRFY2hlbG9uU2hhcGUoYmFySXRlbSwgaSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGdldE5vcm1hbEJhclNoYXBlKGJhckl0ZW0sIGkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldExlZnRFY2hlbG9uU2hhcGUoYmFySXRlbSwgaSkge1xuICB2YXIgYmFyVmFsdWVBeGlzUG9zID0gYmFySXRlbS5iYXJWYWx1ZUF4aXNQb3MsXG4gICAgICBiYXJMYWJlbEF4aXNQb3MgPSBiYXJJdGVtLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgIGJhcldpZHRoID0gYmFySXRlbS5iYXJXaWR0aCxcbiAgICAgIGVjaGVsb25PZmZzZXQgPSBiYXJJdGVtLmVjaGVsb25PZmZzZXQ7XG5cbiAgdmFyIF9iYXJWYWx1ZUF4aXNQb3MkaSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShiYXJWYWx1ZUF4aXNQb3NbaV0sIDIpLFxuICAgICAgc3RhcnQgPSBfYmFyVmFsdWVBeGlzUG9zJGlbMF0sXG4gICAgICBlbmQgPSBfYmFyVmFsdWVBeGlzUG9zJGlbMV07XG5cbiAgdmFyIGxhYmVsQXhpc1BvcyA9IGJhckxhYmVsQXhpc1Bvc1tpXTtcbiAgdmFyIGhhbGZXaWR0aCA9IGJhcldpZHRoIC8gMjtcbiAgdmFyIHZhbHVlQXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHZhciBwb2ludHMgPSBbXTtcblxuICBpZiAodmFsdWVBeGlzID09PSAneCcpIHtcbiAgICBwb2ludHNbMF0gPSBbZW5kLCBsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGhdO1xuICAgIHBvaW50c1sxXSA9IFtlbmQsIGxhYmVsQXhpc1BvcyArIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzJdID0gW3N0YXJ0LCBsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGhdO1xuICAgIHBvaW50c1szXSA9IFtzdGFydCArIGVjaGVsb25PZmZzZXQsIGxhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aF07XG4gICAgaWYgKGVuZCAtIHN0YXJ0IDwgZWNoZWxvbk9mZnNldCkgcG9pbnRzLnNwbGljZSgzLCAxKTtcbiAgfSBlbHNlIHtcbiAgICBwb2ludHNbMF0gPSBbbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoLCBlbmRdO1xuICAgIHBvaW50c1sxXSA9IFtsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGgsIGVuZF07XG4gICAgcG9pbnRzWzJdID0gW2xhYmVsQXhpc1BvcyArIGhhbGZXaWR0aCwgc3RhcnRdO1xuICAgIHBvaW50c1szXSA9IFtsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGgsIHN0YXJ0IC0gZWNoZWxvbk9mZnNldF07XG4gICAgaWYgKHN0YXJ0IC0gZW5kIDwgZWNoZWxvbk9mZnNldCkgcG9pbnRzLnNwbGljZSgzLCAxKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBwb2ludHMsXG4gICAgY2xvc2U6IHRydWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UmlnaHRFY2hlbG9uU2hhcGUoYmFySXRlbSwgaSkge1xuICB2YXIgYmFyVmFsdWVBeGlzUG9zID0gYmFySXRlbS5iYXJWYWx1ZUF4aXNQb3MsXG4gICAgICBiYXJMYWJlbEF4aXNQb3MgPSBiYXJJdGVtLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgIGJhcldpZHRoID0gYmFySXRlbS5iYXJXaWR0aCxcbiAgICAgIGVjaGVsb25PZmZzZXQgPSBiYXJJdGVtLmVjaGVsb25PZmZzZXQ7XG5cbiAgdmFyIF9iYXJWYWx1ZUF4aXNQb3MkaTIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoYmFyVmFsdWVBeGlzUG9zW2ldLCAyKSxcbiAgICAgIHN0YXJ0ID0gX2JhclZhbHVlQXhpc1BvcyRpMlswXSxcbiAgICAgIGVuZCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTJbMV07XG5cbiAgdmFyIGxhYmVsQXhpc1BvcyA9IGJhckxhYmVsQXhpc1Bvc1tpXTtcbiAgdmFyIGhhbGZXaWR0aCA9IGJhcldpZHRoIC8gMjtcbiAgdmFyIHZhbHVlQXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHZhciBwb2ludHMgPSBbXTtcblxuICBpZiAodmFsdWVBeGlzID09PSAneCcpIHtcbiAgICBwb2ludHNbMF0gPSBbZW5kLCBsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGhdO1xuICAgIHBvaW50c1sxXSA9IFtlbmQsIGxhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzJdID0gW3N0YXJ0LCBsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGhdO1xuICAgIHBvaW50c1szXSA9IFtzdGFydCArIGVjaGVsb25PZmZzZXQsIGxhYmVsQXhpc1BvcyArIGhhbGZXaWR0aF07XG4gICAgaWYgKGVuZCAtIHN0YXJ0IDwgZWNoZWxvbk9mZnNldCkgcG9pbnRzLnNwbGljZSgyLCAxKTtcbiAgfSBlbHNlIHtcbiAgICBwb2ludHNbMF0gPSBbbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoLCBlbmRdO1xuICAgIHBvaW50c1sxXSA9IFtsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGgsIGVuZF07XG4gICAgcG9pbnRzWzJdID0gW2xhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aCwgc3RhcnRdO1xuICAgIHBvaW50c1szXSA9IFtsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGgsIHN0YXJ0IC0gZWNoZWxvbk9mZnNldF07XG4gICAgaWYgKHN0YXJ0IC0gZW5kIDwgZWNoZWxvbk9mZnNldCkgcG9pbnRzLnNwbGljZSgyLCAxKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBwb2ludHMsXG4gICAgY2xvc2U6IHRydWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9ybWFsQmFyU2hhcGUoYmFySXRlbSwgaSkge1xuICB2YXIgYmFyVmFsdWVBeGlzUG9zID0gYmFySXRlbS5iYXJWYWx1ZUF4aXNQb3MsXG4gICAgICBiYXJMYWJlbEF4aXNQb3MgPSBiYXJJdGVtLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgIGJhcldpZHRoID0gYmFySXRlbS5iYXJXaWR0aDtcblxuICB2YXIgX2JhclZhbHVlQXhpc1BvcyRpMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShiYXJWYWx1ZUF4aXNQb3NbaV0sIDIpLFxuICAgICAgc3RhcnQgPSBfYmFyVmFsdWVBeGlzUG9zJGkzWzBdLFxuICAgICAgZW5kID0gX2JhclZhbHVlQXhpc1BvcyRpM1sxXTtcblxuICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICB2YXIgdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHNoYXBlID0ge307XG5cbiAgaWYgKHZhbHVlQXhpcyA9PT0gJ3gnKSB7XG4gICAgc2hhcGUueCA9IHN0YXJ0O1xuICAgIHNoYXBlLnkgPSBsYWJlbEF4aXNQb3MgLSBiYXJXaWR0aCAvIDI7XG4gICAgc2hhcGUudyA9IGVuZCAtIHN0YXJ0O1xuICAgIHNoYXBlLmggPSBiYXJXaWR0aDtcbiAgfSBlbHNlIHtcbiAgICBzaGFwZS54ID0gbGFiZWxBeGlzUG9zIC0gYmFyV2lkdGggLyAyO1xuICAgIHNoYXBlLnkgPSBlbmQ7XG4gICAgc2hhcGUudyA9IGJhcldpZHRoO1xuICAgIHNoYXBlLmggPSBzdGFydCAtIGVuZDtcbiAgfVxuXG4gIHJldHVybiBzaGFwZTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyU3R5bGUoYmFySXRlbSwgaSkge1xuICB2YXIgYmFyU3R5bGUgPSBiYXJJdGVtLmJhclN0eWxlLFxuICAgICAgZ3JhZGllbnQgPSBiYXJJdGVtLmdyYWRpZW50LFxuICAgICAgY29sb3IgPSBiYXJJdGVtLmNvbG9yLFxuICAgICAgaW5kZXBlbmRlbnRDb2xvciA9IGJhckl0ZW0uaW5kZXBlbmRlbnRDb2xvcixcbiAgICAgIGluZGVwZW5kZW50Q29sb3JzID0gYmFySXRlbS5pbmRlcGVuZGVudENvbG9ycztcbiAgdmFyIGZpbGxDb2xvciA9IFtiYXJTdHlsZS5maWxsIHx8IGNvbG9yXTtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoZmlsbENvbG9yLCBncmFkaWVudC5jb2xvcik7XG5cbiAgaWYgKGluZGVwZW5kZW50Q29sb3IpIHtcbiAgICB2YXIgaWR0Q29sb3IgPSBpbmRlcGVuZGVudENvbG9yc1tpICUgaW5kZXBlbmRlbnRDb2xvcnMubGVuZ3RoXTtcbiAgICBncmFkaWVudENvbG9yID0gaWR0Q29sb3IgaW5zdGFuY2VvZiBBcnJheSA/IGlkdENvbG9yIDogW2lkdENvbG9yXTtcbiAgfVxuXG4gIGlmIChncmFkaWVudENvbG9yLmxlbmd0aCA9PT0gMSkgZ3JhZGllbnRDb2xvci5wdXNoKGdyYWRpZW50Q29sb3JbMF0pO1xuICB2YXIgZ3JhZGllbnRQYXJhbXMgPSBnZXRHcmFkaWVudFBhcmFtcyhiYXJJdGVtLCBpKTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZ3JhZGllbnRDb2xvcjogZ3JhZGllbnRDb2xvcixcbiAgICBncmFkaWVudFBhcmFtczogZ3JhZGllbnRQYXJhbXMsXG4gICAgZ3JhZGllbnRUeXBlOiAnbGluZWFyJyxcbiAgICBncmFkaWVudFdpdGg6ICdmaWxsJ1xuICB9LCBiYXJTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEdyYWRpZW50UGFyYW1zKGJhckl0ZW0sIGkpIHtcbiAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGJhckl0ZW0uYmFyVmFsdWVBeGlzUG9zLFxuICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3MsXG4gICAgICBkYXRhID0gYmFySXRlbS5kYXRhO1xuICB2YXIgX2Jhckl0ZW0kdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMsXG4gICAgICBsaW5lUG9zaXRpb24gPSBfYmFySXRlbSR2YWx1ZUF4aXMubGluZVBvc2l0aW9uLFxuICAgICAgYXhpcyA9IF9iYXJJdGVtJHZhbHVlQXhpcy5heGlzO1xuXG4gIHZhciBfYmFyVmFsdWVBeGlzUG9zJGk0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTRbMF0sXG4gICAgICBlbmQgPSBfYmFyVmFsdWVBeGlzUG9zJGk0WzFdO1xuXG4gIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gIHZhciB2YWx1ZSA9IGRhdGFbaV07XG5cbiAgdmFyIF9saW5lUG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVBvc2l0aW9uLCAyKSxcbiAgICAgIGxpbmVTdGFydCA9IF9saW5lUG9zaXRpb25bMF0sXG4gICAgICBsaW5lRW5kID0gX2xpbmVQb3NpdGlvblsxXTtcblxuICB2YXIgdmFsdWVBeGlzSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIGVuZFBvcyA9IGVuZDtcblxuICBpZiAoIWJhckl0ZW0uZ3JhZGllbnQubG9jYWwpIHtcbiAgICBlbmRQb3MgPSB2YWx1ZSA8IDAgPyBsaW5lU3RhcnRbdmFsdWVBeGlzSW5kZXhdIDogbGluZUVuZFt2YWx1ZUF4aXNJbmRleF07XG4gIH1cblxuICBpZiAoYXhpcyA9PT0gJ3knKSB7XG4gICAgcmV0dXJuIFtsYWJlbEF4aXNQb3MsIGVuZFBvcywgbGFiZWxBeGlzUG9zLCBzdGFydF07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtlbmRQb3MsIGxhYmVsQXhpc1Bvcywgc3RhcnQsIGxhYmVsQXhpc1Bvc107XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRCYXJDb25maWcoYmFySXRlbSkge1xuICB2YXIgY29uZmlncyA9IGdldEJhckNvbmZpZyhiYXJJdGVtKTtcbiAgdmFyIHNoYXBlVHlwZSA9IGJhckl0ZW0uc2hhcGVUeXBlO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHZhciBzaGFwZSA9IGNvbmZpZy5zaGFwZTtcblxuICAgIGlmIChzaGFwZVR5cGUgPT09ICdsZWZ0RWNoZWxvbicpIHtcbiAgICAgIHNoYXBlID0gZ2V0U3RhcnRMZWZ0RWNoZWxvblNoYXBlKHNoYXBlLCBiYXJJdGVtKTtcbiAgICB9IGVsc2UgaWYgKHNoYXBlVHlwZSA9PT0gJ3JpZ2h0RWNoZWxvbicpIHtcbiAgICAgIHNoYXBlID0gZ2V0U3RhcnRSaWdodEVjaGVsb25TaGFwZShzaGFwZSwgYmFySXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNoYXBlID0gZ2V0U3RhcnROb3JtYWxCYXJTaGFwZShzaGFwZSwgYmFySXRlbSk7XG4gICAgfVxuXG4gICAgY29uZmlnLnNoYXBlID0gc2hhcGU7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRMZWZ0RWNoZWxvblNoYXBlKHNoYXBlLCBiYXJJdGVtKSB7XG4gIHZhciBheGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgc2hhcGUgPSAoMCwgX3V0aWwuZGVlcENsb25lKShzaGFwZSk7XG4gIHZhciBfc2hhcGUgPSBzaGFwZSxcbiAgICAgIHBvaW50cyA9IF9zaGFwZS5wb2ludHM7XG4gIHZhciBpbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgc3RhcnQgPSBwb2ludHNbMl1baW5kZXhdO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQpIHtcbiAgICByZXR1cm4gcG9pbnRbaW5kZXhdID0gc3RhcnQ7XG4gIH0pO1xuICByZXR1cm4gc2hhcGU7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UmlnaHRFY2hlbG9uU2hhcGUoc2hhcGUsIGJhckl0ZW0pIHtcbiAgdmFyIGF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICBzaGFwZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKHNoYXBlKTtcbiAgdmFyIF9zaGFwZTIgPSBzaGFwZSxcbiAgICAgIHBvaW50cyA9IF9zaGFwZTIucG9pbnRzO1xuICB2YXIgaW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIHN0YXJ0ID0gcG9pbnRzWzJdW2luZGV4XTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgcmV0dXJuIHBvaW50W2luZGV4XSA9IHN0YXJ0O1xuICB9KTtcbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydE5vcm1hbEJhclNoYXBlKHNoYXBlLCBiYXJJdGVtKSB7XG4gIHZhciBheGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgeSA9IHNoYXBlLnksXG4gICAgICB3ID0gc2hhcGUudyxcbiAgICAgIGggPSBzaGFwZS5oO1xuXG4gIGlmIChheGlzID09PSAneCcpIHtcbiAgICB3ID0gMDtcbiAgfSBlbHNlIHtcbiAgICB5ID0geSArIGg7XG4gICAgaCA9IDA7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHg6IHgsXG4gICAgeTogeSxcbiAgICB3OiB3LFxuICAgIGg6IGhcbiAgfTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlQmFyKGdyYXBocywgYmFySXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBuYW1lID0gZ2V0QmFyTmFtZShiYXJJdGVtKTtcblxuICBpZiAoZ3JhcGhzW2ldICYmIGdyYXBoc1tpXVswXS5uYW1lICE9PSBuYW1lKSB7XG4gICAgZ3JhcGhzW2ldLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gICAgfSk7XG4gICAgZ3JhcGhzW2ldID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMYWJlbENvbmZpZyhiYXJJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGJhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGJhckl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBiYXJJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldExhYmVsU2hhcGVzKGJhckl0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRMYWJlbFN0eWxlKGJhckl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGJhckl0ZW0ubGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlcyhiYXJJdGVtKSB7XG4gIHZhciBjb250ZW50cyA9IGdldEZvcm1hdHRlckxhYmVscyhiYXJJdGVtKTtcbiAgdmFyIHBvc2l0aW9uID0gZ2V0TGFiZWxzUG9zaXRpb24oYmFySXRlbSk7XG4gIHJldHVybiBwb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHBvcywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogcG9zLFxuICAgICAgY29udGVudDogY29udGVudHNbaV1cbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybWF0dGVyTGFiZWxzKGJhckl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBiYXJJdGVtLmRhdGEsXG4gICAgICBsYWJlbCA9IGJhckl0ZW0ubGFiZWw7XG4gIHZhciBmb3JtYXR0ZXIgPSBsYWJlbC5mb3JtYXR0ZXI7XG4gIGRhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ251bWJlcic7XG4gIH0pLm1hcChmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBkLnRvU3RyaW5nKCk7XG4gIH0pO1xuICBpZiAoIWZvcm1hdHRlcikgcmV0dXJuIGRhdGE7XG4gIHZhciB0eXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCBkKTtcbiAgfSk7XG4gIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQsIGkpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyKHtcbiAgICAgIHZhbHVlOiBkLFxuICAgICAgaW5kZXg6IGlcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbHNQb3NpdGlvbihiYXJJdGVtKSB7XG4gIHZhciBsYWJlbCA9IGJhckl0ZW0ubGFiZWwsXG4gICAgICBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zO1xuICB2YXIgcG9zaXRpb24gPSBsYWJlbC5wb3NpdGlvbixcbiAgICAgIG9mZnNldCA9IGxhYmVsLm9mZnNldDtcbiAgdmFyIGF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICByZXR1cm4gYmFyVmFsdWVBeGlzUG9zLm1hcChmdW5jdGlvbiAoX3JlZjEwLCBpKSB7XG4gICAgdmFyIF9yZWYxMSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTAsIDIpLFxuICAgICAgICBzdGFydCA9IF9yZWYxMVswXSxcbiAgICAgICAgZW5kID0gX3JlZjExWzFdO1xuXG4gICAgdmFyIGxhYmVsQXhpc1BvcyA9IGJhckxhYmVsQXhpc1Bvc1tpXTtcbiAgICB2YXIgcG9zID0gW2VuZCwgbGFiZWxBeGlzUG9zXTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHBvcyA9IFtzdGFydCwgbGFiZWxBeGlzUG9zXTtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICBwb3MgPSBbKHN0YXJ0ICsgZW5kKSAvIDIsIGxhYmVsQXhpc1Bvc107XG4gICAgfVxuXG4gICAgaWYgKGF4aXMgPT09ICd5JykgcG9zLnJldmVyc2UoKTtcbiAgICByZXR1cm4gZ2V0T2Zmc2V0ZWRQb2ludChwb3MsIG9mZnNldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRPZmZzZXRlZFBvaW50KF9yZWYxMiwgX3JlZjEzKSB7XG4gIHZhciBfcmVmMTQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEyLCAyKSxcbiAgICAgIHggPSBfcmVmMTRbMF0sXG4gICAgICB5ID0gX3JlZjE0WzFdO1xuXG4gIHZhciBfcmVmMTUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEzLCAyKSxcbiAgICAgIG94ID0gX3JlZjE1WzBdLFxuICAgICAgb3kgPSBfcmVmMTVbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUoYmFySXRlbSkge1xuICB2YXIgY29sb3IgPSBiYXJJdGVtLmNvbG9yLFxuICAgICAgc3R5bGUgPSBiYXJJdGVtLmxhYmVsLnN0eWxlLFxuICAgICAgZ2MgPSBiYXJJdGVtLmdyYWRpZW50LmNvbG9yO1xuICBpZiAoZ2MubGVuZ3RoKSBjb2xvciA9IGdjWzBdO1xuICBzdHlsZSA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgc3R5bGUpO1xuICByZXR1cm4gc3R5bGU7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nYXVnZSA9IGdhdWdlO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9nYXVnZSA9IHJlcXVpcmUoXCIuLi9jb25maWcvZ2F1Z2VcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBnYXVnZShjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgdmFyIGdhdWdlcyA9ICgwLCBfdXRpbDIuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX2dhdWdlLmdhdWdlQ29uZmlnLCAnZ2F1Z2UnKTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0NlbnRlcihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc1JhZGl1cyhnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RhdGFSYWRpdXNBbmRMaW5lV2lkdGgoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNEYXRhQW5nbGVzKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzRGF0YUdyYWRpZW50KGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzQXhpc1RpY2tQb3NpdGlvbihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0xhYmVsUG9zaXRpb25BbmRBbGlnbihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0xhYmVsRGF0YShnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RldGFpbHNQb3NpdGlvbihnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RldGFpbHNDb250ZW50KGdhdWdlcywgY2hhcnQpO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VBeGlzVGljaycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEF4aXNUaWNrQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VBeGlzTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRBeGlzTGFiZWxDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZUJhY2tncm91bmRBcmMnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRCYWNrZ3JvdW5kQXJjQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0QmFja2dyb3VuZEFyY0NvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlQXJjJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXJjQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0QXJjQ29uZmlnLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlQXJjXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VQb2ludGVyJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0UG9pbnRlckNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBvaW50ZXJDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZURldGFpbHMnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXREZXRhaWxzQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzQ2VudGVyKGdhdWdlcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyO1xuICAgIGNlbnRlciA9IGNlbnRlci5tYXAoZnVuY3Rpb24gKHBvcywgaSkge1xuICAgICAgaWYgKHR5cGVvZiBwb3MgPT09ICdudW1iZXInKSByZXR1cm4gcG9zO1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHBvcykgLyAxMDAgKiBhcmVhW2ldO1xuICAgIH0pO1xuICAgIGdhdWdlSXRlbS5jZW50ZXIgPSBjZW50ZXI7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzUmFkaXVzKGdhdWdlcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXJlYSkpIC8gMjtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciByYWRpdXMgPSBnYXVnZUl0ZW0ucmFkaXVzO1xuXG4gICAgaWYgKHR5cGVvZiByYWRpdXMgIT09ICdudW1iZXInKSB7XG4gICAgICByYWRpdXMgPSBwYXJzZUludChyYWRpdXMpIC8gMTAwICogbWF4UmFkaXVzO1xuICAgIH1cblxuICAgIGdhdWdlSXRlbS5yYWRpdXMgPSByYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzRGF0YVJhZGl1c0FuZExpbmVXaWR0aChnYXVnZXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFyZWEpKSAvIDI7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cyxcbiAgICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgICBhcmNMaW5lV2lkdGggPSBnYXVnZUl0ZW0uYXJjTGluZVdpZHRoO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGFyY1JhZGl1cyA9IGl0ZW0ucmFkaXVzLFxuICAgICAgICAgIGxpbmVXaWR0aCA9IGl0ZW0ubGluZVdpZHRoO1xuICAgICAgaWYgKCFhcmNSYWRpdXMpIGFyY1JhZGl1cyA9IHJhZGl1cztcbiAgICAgIGlmICh0eXBlb2YgYXJjUmFkaXVzICE9PSAnbnVtYmVyJykgYXJjUmFkaXVzID0gcGFyc2VJbnQoYXJjUmFkaXVzKSAvIDEwMCAqIG1heFJhZGl1cztcbiAgICAgIGl0ZW0ucmFkaXVzID0gYXJjUmFkaXVzO1xuICAgICAgaWYgKCFsaW5lV2lkdGgpIGxpbmVXaWR0aCA9IGFyY0xpbmVXaWR0aDtcbiAgICAgIGl0ZW0ubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0RhdGFBbmdsZXMoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIHN0YXJ0QW5nbGUgPSBnYXVnZUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGUsXG4gICAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgICAgbWluID0gZ2F1Z2VJdGVtLm1pbixcbiAgICAgICAgbWF4ID0gZ2F1Z2VJdGVtLm1heDtcbiAgICB2YXIgYW5nbGVNaW51cyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZTtcbiAgICB2YXIgdmFsdWVNaW51cyA9IG1heCAtIG1pbjtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW0udmFsdWU7XG4gICAgICB2YXIgaXRlbUFuZ2xlID0gTWF0aC5hYnMoKHZhbHVlIC0gbWluKSAvIHZhbHVlTWludXMgKiBhbmdsZU1pbnVzKTtcbiAgICAgIGl0ZW0uc3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGU7XG4gICAgICBpdGVtLmVuZEFuZ2xlID0gc3RhcnRBbmdsZSArIGl0ZW1BbmdsZTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEYXRhR3JhZGllbnQoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb2xvciA9IGl0ZW0uY29sb3IsXG4gICAgICAgICAgZ3JhZGllbnQgPSBpdGVtLmdyYWRpZW50O1xuICAgICAgaWYgKCFncmFkaWVudCB8fCAhZ3JhZGllbnQubGVuZ3RoKSBncmFkaWVudCA9IGNvbG9yO1xuICAgICAgaWYgKCEoZ3JhZGllbnQgaW5zdGFuY2VvZiBBcnJheSkpIGdyYWRpZW50ID0gW2dyYWRpZW50XTtcbiAgICAgIGl0ZW0uZ3JhZGllbnQgPSBncmFkaWVudDtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNBeGlzVGlja1Bvc2l0aW9uKGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gZ2F1Z2VJdGVtLmVuZEFuZ2xlLFxuICAgICAgICBzcGxpdE51bSA9IGdhdWdlSXRlbS5zcGxpdE51bSxcbiAgICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgICAgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cyxcbiAgICAgICAgYXJjTGluZVdpZHRoID0gZ2F1Z2VJdGVtLmFyY0xpbmVXaWR0aCxcbiAgICAgICAgYXhpc1RpY2sgPSBnYXVnZUl0ZW0uYXhpc1RpY2s7XG4gICAgdmFyIHRpY2tMZW5ndGggPSBheGlzVGljay50aWNrTGVuZ3RoLFxuICAgICAgICBsaW5lV2lkdGggPSBheGlzVGljay5zdHlsZS5saW5lV2lkdGg7XG4gICAgdmFyIGFuZ2xlcyA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZTtcbiAgICB2YXIgb3V0ZXJSYWRpdXMgPSByYWRpdXMgLSBhcmNMaW5lV2lkdGggLyAyO1xuICAgIHZhciBpbm5lclJhZGl1cyA9IG91dGVyUmFkaXVzIC0gdGlja0xlbmd0aDtcbiAgICB2YXIgYW5nbGVHYXAgPSBhbmdsZXMgLyAoc3BsaXROdW0gLSAxKTtcbiAgICB2YXIgYXJjTGVuZ3RoID0gMiAqIE1hdGguUEkgKiByYWRpdXMgKiBhbmdsZXMgLyAoTWF0aC5QSSAqIDIpO1xuICAgIHZhciBvZmZzZXQgPSBNYXRoLmNlaWwobGluZVdpZHRoIC8gMikgLyBhcmNMZW5ndGggKiBhbmdsZXM7XG4gICAgZ2F1Z2VJdGVtLnRpY2tBbmdsZXMgPSBbXTtcbiAgICBnYXVnZUl0ZW0udGlja0lubmVyUmFkaXVzID0gW107XG4gICAgZ2F1Z2VJdGVtLnRpY2tQb3NpdGlvbiA9IG5ldyBBcnJheShzcGxpdE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgICAgdmFyIGFuZ2xlID0gc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogaTtcbiAgICAgIGlmIChpID09PSAwKSBhbmdsZSArPSBvZmZzZXQ7XG4gICAgICBpZiAoaSA9PT0gc3BsaXROdW0gLSAxKSBhbmdsZSAtPSBvZmZzZXQ7XG4gICAgICBnYXVnZUl0ZW0udGlja0FuZ2xlc1tpXSA9IGFuZ2xlO1xuICAgICAgZ2F1Z2VJdGVtLnRpY2tJbm5lclJhZGl1c1tpXSA9IGlubmVyUmFkaXVzO1xuICAgICAgcmV0dXJuIFtfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW291dGVyUmFkaXVzLCBhbmdsZV0pKSwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtpbm5lclJhZGl1cywgYW5nbGVdKSldO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0xhYmVsUG9zaXRpb25BbmRBbGlnbihnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgICAgdGlja0lubmVyUmFkaXVzID0gZ2F1Z2VJdGVtLnRpY2tJbm5lclJhZGl1cyxcbiAgICAgICAgdGlja0FuZ2xlcyA9IGdhdWdlSXRlbS50aWNrQW5nbGVzLFxuICAgICAgICBsYWJlbEdhcCA9IGdhdWdlSXRlbS5heGlzTGFiZWwubGFiZWxHYXA7XG4gICAgdmFyIHBvc2l0aW9uID0gdGlja0FuZ2xlcy5tYXAoZnVuY3Rpb24gKGFuZ2xlLCBpKSB7XG4gICAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFt0aWNrSW5uZXJSYWRpdXNbaV0gLSBsYWJlbEdhcCwgdGlja0FuZ2xlc1tpXV0pKTtcbiAgICB9KTtcbiAgICB2YXIgYWxpZ24gPSBwb3NpdGlvbi5tYXAoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBfcmVmMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjJbMF0sXG4gICAgICAgICAgeSA9IF9yZWYyWzFdO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0QWxpZ246IHggPiBjZW50ZXJbMF0gPyAncmlnaHQnIDogJ2xlZnQnLFxuICAgICAgICB0ZXh0QmFzZWxpbmU6IHkgPiBjZW50ZXJbMV0gPyAnYm90dG9tJyA6ICd0b3AnXG4gICAgICB9O1xuICAgIH0pO1xuICAgIGdhdWdlSXRlbS5sYWJlbFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgZ2F1Z2VJdGVtLmxhYmVsQWxpZ24gPSBhbGlnbjtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNMYWJlbERhdGEoZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGF4aXNMYWJlbCA9IGdhdWdlSXRlbS5heGlzTGFiZWwsXG4gICAgICAgIG1pbiA9IGdhdWdlSXRlbS5taW4sXG4gICAgICAgIG1heCA9IGdhdWdlSXRlbS5tYXgsXG4gICAgICAgIHNwbGl0TnVtID0gZ2F1Z2VJdGVtLnNwbGl0TnVtO1xuICAgIHZhciBkYXRhID0gYXhpc0xhYmVsLmRhdGEsXG4gICAgICAgIGZvcm1hdHRlciA9IGF4aXNMYWJlbC5mb3JtYXR0ZXI7XG4gICAgdmFyIHZhbHVlR2FwID0gKG1heCAtIG1pbikgLyAoc3BsaXROdW0gLSAxKTtcbiAgICB2YXIgdmFsdWUgPSBuZXcgQXJyYXkoc3BsaXROdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChtaW4gKyB2YWx1ZUdhcCAqIGkpO1xuICAgIH0pO1xuICAgIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgICBkYXRhID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHZhbHVlLCBkYXRhKS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIHZhciBsYWJlbCA9IHY7XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBsYWJlbCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9Jywgdik7XG4gICAgICB9XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGxhYmVsID0gZm9ybWF0dGVyKHtcbiAgICAgICAgICB2YWx1ZTogdixcbiAgICAgICAgICBpbmRleDogaVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH0pO1xuICAgIGF4aXNMYWJlbC5kYXRhID0gZGF0YTtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEZXRhaWxzUG9zaXRpb24oZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgICAgZGV0YWlscyA9IGdhdWdlSXRlbS5kZXRhaWxzLFxuICAgICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyO1xuICAgIHZhciBwb3NpdGlvbiA9IGRldGFpbHMucG9zaXRpb24sXG4gICAgICAgIG9mZnNldCA9IGRldGFpbHMub2Zmc2V0O1xuICAgIHZhciBkZXRhaWxzUG9zaXRpb24gPSBkYXRhLm1hcChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICAgIHZhciBzdGFydEFuZ2xlID0gX3JlZjMuc3RhcnRBbmdsZSxcbiAgICAgICAgICBlbmRBbmdsZSA9IF9yZWYzLmVuZEFuZ2xlLFxuICAgICAgICAgIHJhZGl1cyA9IF9yZWYzLnJhZGl1cztcbiAgICAgIHZhciBwb2ludCA9IG51bGw7XG5cbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgcG9pbnQgPSBjZW50ZXI7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnc3RhcnQnKSB7XG4gICAgICAgIHBvaW50ID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtyYWRpdXMsIHN0YXJ0QW5nbGVdKSk7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAnZW5kJykge1xuICAgICAgICBwb2ludCA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzLCBlbmRBbmdsZV0pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldE9mZnNldGVkUG9pbnQocG9pbnQsIG9mZnNldCk7XG4gICAgfSk7XG4gICAgZ2F1Z2VJdGVtLmRldGFpbHNQb3NpdGlvbiA9IGRldGFpbHNQb3NpdGlvbjtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEZXRhaWxzQ29udGVudChnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgICBkZXRhaWxzID0gZ2F1Z2VJdGVtLmRldGFpbHM7XG4gICAgdmFyIGZvcm1hdHRlciA9IGRldGFpbHMuZm9ybWF0dGVyO1xuICAgIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgICB2YXIgY29udGVudHMgPSBkYXRhLm1hcChmdW5jdGlvbiAoZGF0YUl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gZGF0YUl0ZW0udmFsdWU7XG5cbiAgICAgIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb250ZW50ID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCAne250fScpO1xuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKCd7bmFtZX0nLCBkYXRhSXRlbS5uYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIGNvbnRlbnQgPSBmb3JtYXR0ZXIoZGF0YUl0ZW0pO1xuICAgICAgcmV0dXJuIGNvbnRlbnQudG9TdHJpbmcoKTtcbiAgICB9KTtcbiAgICBnYXVnZUl0ZW0uZGV0YWlsc0NvbnRlbnQgPSBjb250ZW50cztcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGdldE9mZnNldGVkUG9pbnQoX3JlZjQsIF9yZWY1KSB7XG4gIHZhciBfcmVmNiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNCwgMiksXG4gICAgICB4ID0gX3JlZjZbMF0sXG4gICAgICB5ID0gX3JlZjZbMV07XG5cbiAgdmFyIF9yZWY3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1LCAyKSxcbiAgICAgIG94ID0gX3JlZjdbMF0sXG4gICAgICBveSA9IF9yZWY3WzFdO1xuXG4gIHJldHVybiBbeCArIG94LCB5ICsgb3ldO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzVGlja0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGdhdWdlSXRlbS50aWNrUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGdhdWdlSXRlbS5heGlzVGljay5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNUaWNrU2hhcGUoZ2F1Z2VJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRBeGlzVGlja1N0eWxlKGdhdWdlSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc1RpY2tTaGFwZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGdhdWdlSXRlbS50aWNrUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiB0aWNrUG9zaXRpb25baV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc1RpY2tTdHlsZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIHN0eWxlID0gZ2F1Z2VJdGVtLmF4aXNUaWNrLnN0eWxlO1xuICByZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbENvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGxhYmVsUG9zaXRpb24gPSBnYXVnZUl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICByZXR1cm4gbGFiZWxQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogZ2F1Z2VJdGVtLmF4aXNMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNMYWJlbFNoYXBlKGdhdWdlSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0QXhpc0xhYmVsU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxTaGFwZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGxhYmVsUG9zaXRpb24gPSBnYXVnZUl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uYXhpc0xhYmVsLmRhdGE7XG4gIHJldHVybiB7XG4gICAgY29udGVudDogZGF0YVtpXS50b1N0cmluZygpLFxuICAgIHBvc2l0aW9uOiBsYWJlbFBvc2l0aW9uW2ldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbFN0eWxlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgbGFiZWxBbGlnbiA9IGdhdWdlSXRlbS5sYWJlbEFsaWduLFxuICAgICAgYXhpc0xhYmVsID0gZ2F1Z2VJdGVtLmF4aXNMYWJlbDtcbiAgdmFyIHN0eWxlID0gYXhpc0xhYmVsLnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKF9vYmplY3RTcHJlYWQoe30sIGxhYmVsQWxpZ25baV0pLCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ2FyYycsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiBnYXVnZUl0ZW0uYmFja2dyb3VuZEFyYy5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldEdhdWdlQmFja2dyb3VuZEFyY1NoYXBlKGdhdWdlSXRlbSksXG4gICAgc3R5bGU6IGdldEdhdWdlQmFja2dyb3VuZEFyY1N0eWxlKGdhdWdlSXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQmFja2dyb3VuZEFyY1NoYXBlKGdhdWdlSXRlbSkge1xuICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGUsXG4gICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyLFxuICAgICAgcmFkaXVzID0gZ2F1Z2VJdGVtLnJhZGl1cztcbiAgcmV0dXJuIHtcbiAgICByeDogY2VudGVyWzBdLFxuICAgIHJ5OiBjZW50ZXJbMV0sXG4gICAgcjogcmFkaXVzLFxuICAgIHN0YXJ0QW5nbGU6IHN0YXJ0QW5nbGUsXG4gICAgZW5kQW5nbGU6IGVuZEFuZ2xlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQmFja2dyb3VuZEFyY1N0eWxlKGdhdWdlSXRlbSkge1xuICB2YXIgYmFja2dyb3VuZEFyYyA9IGdhdWdlSXRlbS5iYWNrZ3JvdW5kQXJjLFxuICAgICAgYXJjTGluZVdpZHRoID0gZ2F1Z2VJdGVtLmFyY0xpbmVXaWR0aDtcbiAgdmFyIHN0eWxlID0gYmFja2dyb3VuZEFyYy5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgbGluZVdpZHRoOiBhcmNMaW5lV2lkdGhcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydEJhY2tncm91bmRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBjb25maWcgPSBnZXRCYWNrZ3JvdW5kQXJjQ29uZmlnKGdhdWdlSXRlbSlbMF07XG5cbiAgdmFyIHNoYXBlID0gX29iamVjdFNwcmVhZCh7fSwgY29uZmlnLnNoYXBlKTtcblxuICBzaGFwZS5lbmRBbmdsZSA9IGNvbmZpZy5zaGFwZS5zdGFydEFuZ2xlO1xuICBjb25maWcuc2hhcGUgPSBzaGFwZTtcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBnZXRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ2FnQXJjJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0R2F1Z2VBcmNTaGFwZShnYXVnZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEdhdWdlQXJjU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRHYXVnZUFyY1NoYXBlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgIGdyYWRpZW50RW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGU7XG4gIHZhciBfZGF0YSRpID0gZGF0YVtpXSxcbiAgICAgIHJhZGl1cyA9IF9kYXRhJGkucmFkaXVzLFxuICAgICAgc3RhcnRBbmdsZSA9IF9kYXRhJGkuc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gX2RhdGEkaS5lbmRBbmdsZSxcbiAgICAgIGxvY2FsR3JhZGllbnQgPSBfZGF0YSRpLmxvY2FsR3JhZGllbnQ7XG4gIGlmIChsb2NhbEdyYWRpZW50KSBncmFkaWVudEVuZEFuZ2xlID0gZW5kQW5nbGU7XG4gIHJldHVybiB7XG4gICAgcng6IGNlbnRlclswXSxcbiAgICByeTogY2VudGVyWzFdLFxuICAgIHI6IHJhZGl1cyxcbiAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlOiBlbmRBbmdsZSxcbiAgICBncmFkaWVudEVuZEFuZ2xlOiBncmFkaWVudEVuZEFuZ2xlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQXJjU3R5bGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBkYXRhSXRlbVN0eWxlID0gZ2F1Z2VJdGVtLmRhdGFJdGVtU3R5bGU7XG4gIHZhciBfZGF0YSRpMiA9IGRhdGFbaV0sXG4gICAgICBsaW5lV2lkdGggPSBfZGF0YSRpMi5saW5lV2lkdGgsXG4gICAgICBncmFkaWVudCA9IF9kYXRhJGkyLmdyYWRpZW50O1xuICBncmFkaWVudCA9IGdyYWRpZW50Lm1hcChmdW5jdGlvbiAoYykge1xuICAgIHJldHVybiAoMCwgX2NvbG9yLmdldFJnYmFWYWx1ZSkoYyk7XG4gIH0pO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBsaW5lV2lkdGg6IGxpbmVXaWR0aCxcbiAgICBncmFkaWVudDogZ3JhZGllbnRcbiAgfSwgZGF0YUl0ZW1TdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0QXJjQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgY29uZmlncyA9IGdldEFyY0NvbmZpZyhnYXVnZUl0ZW0pO1xuICBjb25maWdzLm1hcChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgdmFyIHNoYXBlID0gX29iamVjdFNwcmVhZCh7fSwgY29uZmlnLnNoYXBlKTtcblxuICAgIHNoYXBlLmVuZEFuZ2xlID0gY29uZmlnLnNoYXBlLnN0YXJ0QW5nbGU7XG4gICAgY29uZmlnLnNoYXBlID0gc2hhcGU7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlQXJjKGdyYXBoLCBjb25maWcpIHtcbiAgdmFyIGdyYXBoR3JhZGllbnQgPSBncmFwaC5zdHlsZS5ncmFkaWVudDtcbiAgdmFyIGNhY2hlTnVtID0gZ3JhcGhHcmFkaWVudC5sZW5ndGg7XG4gIHZhciBuZWVkTnVtID0gY29uZmlnLnN0eWxlLmdyYWRpZW50Lmxlbmd0aDtcblxuICBpZiAoY2FjaGVOdW0gPiBuZWVkTnVtKSB7XG4gICAgZ3JhcGhHcmFkaWVudC5zcGxpY2UobmVlZE51bSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxhc3QgPSBncmFwaEdyYWRpZW50LnNsaWNlKC0xKVswXTtcbiAgICBncmFwaEdyYWRpZW50LnB1c2guYXBwbHkoZ3JhcGhHcmFkaWVudCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXcgQXJyYXkobmVlZE51bSAtIGNhY2hlTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgICByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsYXN0KTtcbiAgICB9KSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXJDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcixcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiBnYXVnZUl0ZW0ucG9pbnRlci5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldFBvaW50ZXJTaGFwZShnYXVnZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRQb2ludGVyU3R5bGUoZ2F1Z2VJdGVtKSxcbiAgICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZm9vLCBncmFwaCkge1xuICAgICAgZ3JhcGguc3R5bGUuZ3JhcGhDZW50ZXIgPSBjZW50ZXI7XG4gICAgfVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRlclNoYXBlKGdhdWdlSXRlbSkge1xuICB2YXIgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IGdldFBvaW50ZXJQb2ludHMoY2VudGVyKSxcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVyU3R5bGUoZ2F1Z2VJdGVtKSB7XG4gIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGdhdWdlSXRlbS5lbmRBbmdsZSxcbiAgICAgIG1pbiA9IGdhdWdlSXRlbS5taW4sXG4gICAgICBtYXggPSBnYXVnZUl0ZW0ubWF4LFxuICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgcG9pbnRlciA9IGdhdWdlSXRlbS5wb2ludGVyLFxuICAgICAgY2VudGVyID0gZ2F1Z2VJdGVtLmNlbnRlcjtcbiAgdmFyIHZhbHVlSW5kZXggPSBwb2ludGVyLnZhbHVlSW5kZXgsXG4gICAgICBzdHlsZSA9IHBvaW50ZXIuc3R5bGU7XG4gIHZhciB2YWx1ZSA9IGRhdGFbdmFsdWVJbmRleF0gPyBkYXRhW3ZhbHVlSW5kZXhdLnZhbHVlIDogMDtcbiAgdmFyIGFuZ2xlID0gKHZhbHVlIC0gbWluKSAvIChtYXggLSBtaW4pICogKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSkgKyBzdGFydEFuZ2xlICsgTWF0aC5QSSAvIDI7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIHJvdGF0ZTogKDAsIF91dGlsMi5yYWRpYW5Ub0FuZ2xlKShhbmdsZSksXG4gICAgc2NhbGU6IFsxLCAxXSxcbiAgICBncmFwaENlbnRlcjogY2VudGVyXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRlclBvaW50cyhfcmVmOCkge1xuICB2YXIgX3JlZjkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgsIDIpLFxuICAgICAgeCA9IF9yZWY5WzBdLFxuICAgICAgeSA9IF9yZWY5WzFdO1xuXG4gIHZhciBwb2ludDEgPSBbeCwgeSAtIDQwXTtcbiAgdmFyIHBvaW50MiA9IFt4ICsgNSwgeV07XG4gIHZhciBwb2ludDMgPSBbeCwgeSArIDEwXTtcbiAgdmFyIHBvaW50NCA9IFt4IC0gNSwgeV07XG4gIHJldHVybiBbcG9pbnQxLCBwb2ludDIsIHBvaW50MywgcG9pbnQ0XTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQb2ludGVyQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlO1xuICB2YXIgY29uZmlnID0gZ2V0UG9pbnRlckNvbmZpZyhnYXVnZUl0ZW0pWzBdO1xuICBjb25maWcuc3R5bGUucm90YXRlID0gKDAsIF91dGlsMi5yYWRpYW5Ub0FuZ2xlKShzdGFydEFuZ2xlICsgTWF0aC5QSSAvIDIpO1xuICByZXR1cm4gW2NvbmZpZ107XG59XG5cbmZ1bmN0aW9uIGdldERldGFpbHNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBkZXRhaWxzUG9zaXRpb24gPSBnYXVnZUl0ZW0uZGV0YWlsc1Bvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHZhciB2aXNpYmxlID0gZ2F1Z2VJdGVtLmRldGFpbHMuc2hvdztcbiAgcmV0dXJuIGRldGFpbHNQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnbnVtYmVyVGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogdmlzaWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXREZXRhaWxzU2hhcGUoZ2F1Z2VJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXREZXRhaWxzU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXREZXRhaWxzU2hhcGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBkZXRhaWxzUG9zaXRpb24gPSBnYXVnZUl0ZW0uZGV0YWlsc1Bvc2l0aW9uLFxuICAgICAgZGV0YWlsc0NvbnRlbnQgPSBnYXVnZUl0ZW0uZGV0YWlsc0NvbnRlbnQsXG4gICAgICBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBkZXRhaWxzID0gZ2F1Z2VJdGVtLmRldGFpbHM7XG4gIHZhciBwb3NpdGlvbiA9IGRldGFpbHNQb3NpdGlvbltpXTtcbiAgdmFyIGNvbnRlbnQgPSBkZXRhaWxzQ29udGVudFtpXTtcbiAgdmFyIGRhdGFWYWx1ZSA9IGRhdGFbaV0udmFsdWU7XG4gIHZhciB0b0ZpeGVkID0gZGV0YWlscy52YWx1ZVRvRml4ZWQ7XG4gIHJldHVybiB7XG4gICAgbnVtYmVyOiBbZGF0YVZhbHVlXSxcbiAgICBjb250ZW50OiBjb250ZW50LFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvbixcbiAgICB0b0ZpeGVkOiB0b0ZpeGVkXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldERldGFpbHNTdHlsZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGRldGFpbHMgPSBnYXVnZUl0ZW0uZGV0YWlscyxcbiAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YTtcbiAgdmFyIHN0eWxlID0gZGV0YWlscy5zdHlsZTtcbiAgdmFyIGNvbG9yID0gZGF0YVtpXS5jb2xvcjtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgc3R5bGUpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ3JpZCA9IGdyaWQ7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIGdyaWQoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBncmlkID0gb3B0aW9uLmdyaWQ7XG4gIGdyaWQgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy5ncmlkQ29uZmlnLCB0cnVlKSwgZ3JpZCB8fCB7fSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IFtncmlkXSxcbiAgICBrZXk6ICdncmlkJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0R3JpZENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0R3JpZENvbmZpZyhncmlkSXRlbSwgdXBkYXRlcikge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBncmlkSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ3JpZEl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBncmlkSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZSA9IGdldEdyaWRTaGFwZShncmlkSXRlbSwgdXBkYXRlcik7XG4gIHZhciBzdHlsZSA9IGdldEdyaWRTdHlsZShncmlkSXRlbSk7XG4gIHVwZGF0ZXIuY2hhcnQuZ3JpZEFyZWEgPSBfb2JqZWN0U3ByZWFkKHt9LCBzaGFwZSk7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdyZWN0JyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IHNoYXBlLFxuICAgIHN0eWxlOiBzdHlsZVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0R3JpZFNoYXBlKGdyaWRJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBfdXBkYXRlciRjaGFydCRyZW5kZXIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkodXBkYXRlci5jaGFydC5yZW5kZXIuYXJlYSwgMiksXG4gICAgICB3ID0gX3VwZGF0ZXIkY2hhcnQkcmVuZGVyWzBdLFxuICAgICAgaCA9IF91cGRhdGVyJGNoYXJ0JHJlbmRlclsxXTtcblxuICB2YXIgbGVmdCA9IGdldE51bWJlclZhbHVlKGdyaWRJdGVtLmxlZnQsIHcpO1xuICB2YXIgcmlnaHQgPSBnZXROdW1iZXJWYWx1ZShncmlkSXRlbS5yaWdodCwgdyk7XG4gIHZhciB0b3AgPSBnZXROdW1iZXJWYWx1ZShncmlkSXRlbS50b3AsIGgpO1xuICB2YXIgYm90dG9tID0gZ2V0TnVtYmVyVmFsdWUoZ3JpZEl0ZW0uYm90dG9tLCBoKTtcbiAgdmFyIHdpZHRoID0gdyAtIGxlZnQgLSByaWdodDtcbiAgdmFyIGhlaWdodCA9IGggLSB0b3AgLSBib3R0b207XG4gIHJldHVybiB7XG4gICAgeDogbGVmdCxcbiAgICB5OiB0b3AsXG4gICAgdzogd2lkdGgsXG4gICAgaDogaGVpZ2h0XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE51bWJlclZhbHVlKHZhbCwgYWxsKSB7XG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgcmV0dXJuIHZhbDtcbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSByZXR1cm4gMDtcbiAgcmV0dXJuIGFsbCAqIHBhcnNlSW50KHZhbCkgLyAxMDA7XG59XG5cbmZ1bmN0aW9uIGdldEdyaWRTdHlsZShncmlkSXRlbSkge1xuICB2YXIgc3R5bGUgPSBncmlkSXRlbS5zdHlsZTtcbiAgcmV0dXJuIHN0eWxlO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibWVyZ2VDb2xvclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbWVyZ2VDb2xvci5tZXJnZUNvbG9yO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInRpdGxlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF90aXRsZS50aXRsZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJncmlkXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9ncmlkLmdyaWQ7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiYXhpc1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy5heGlzO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImxpbmVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2xpbmUubGluZTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJiYXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2Jhci5iYXI7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicGllXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9waWUucGllO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyQXhpc1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcmFkYXJBeGlzLnJhZGFyQXhpcztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJyYWRhclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfcmFkYXIucmFkYXI7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2F1Z2VcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dhdWdlLmdhdWdlO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImxlZ2VuZFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGVnZW5kLmxlZ2VuZDtcbiAgfVxufSk7XG5cbnZhciBfbWVyZ2VDb2xvciA9IHJlcXVpcmUoXCIuL21lcmdlQ29sb3JcIik7XG5cbnZhciBfdGl0bGUgPSByZXF1aXJlKFwiLi90aXRsZVwiKTtcblxudmFyIF9ncmlkID0gcmVxdWlyZShcIi4vZ3JpZFwiKTtcblxudmFyIF9heGlzID0gcmVxdWlyZShcIi4vYXhpc1wiKTtcblxudmFyIF9saW5lID0gcmVxdWlyZShcIi4vbGluZVwiKTtcblxudmFyIF9iYXIgPSByZXF1aXJlKFwiLi9iYXJcIik7XG5cbnZhciBfcGllID0gcmVxdWlyZShcIi4vcGllXCIpO1xuXG52YXIgX3JhZGFyQXhpcyA9IHJlcXVpcmUoXCIuL3JhZGFyQXhpc1wiKTtcblxudmFyIF9yYWRhciA9IHJlcXVpcmUoXCIuL3JhZGFyXCIpO1xuXG52YXIgX2dhdWdlID0gcmVxdWlyZShcIi4vZ2F1Z2VcIik7XG5cbnZhciBfbGVnZW5kID0gcmVxdWlyZShcIi4vbGVnZW5kXCIpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMubGVnZW5kID0gbGVnZW5kO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gbGVnZW5kKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgbGVnZW5kID0gb3B0aW9uLmxlZ2VuZDtcblxuICBpZiAobGVnZW5kKSB7XG4gICAgbGVnZW5kID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKF9jb25maWcubGVnZW5kQ29uZmlnLCB0cnVlKSwgbGVnZW5kKTtcbiAgICBsZWdlbmQgPSBpbml0TGVnZW5kRGF0YShsZWdlbmQpO1xuICAgIGxlZ2VuZCA9IGZpbHRlckludmFsaWREYXRhKGxlZ2VuZCwgb3B0aW9uLCBjaGFydCk7XG4gICAgbGVnZW5kID0gY2FsY0xlZ2VuZFRleHRXaWR0aChsZWdlbmQsIGNoYXJ0KTtcbiAgICBsZWdlbmQgPSBjYWxjTGVnZW5kUG9zaXRpb24obGVnZW5kLCBjaGFydCk7XG4gICAgbGVnZW5kID0gW2xlZ2VuZF07XG4gIH0gZWxzZSB7XG4gICAgbGVnZW5kID0gW107XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsZWdlbmQsXG4gICAga2V5OiAnbGVnZW5kSWNvbicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEljb25Db25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxlZ2VuZCxcbiAgICBrZXk6ICdsZWdlbmRUZXh0JyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0VGV4dENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdExlZ2VuZERhdGEobGVnZW5kKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGE7XG4gIGxlZ2VuZC5kYXRhID0gZGF0YS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgaXRlbVR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShpdGVtKTtcblxuICAgIGlmIChpdGVtVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGl0ZW1cbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChpdGVtVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnJ1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gbGVnZW5kO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJJbnZhbGlkRGF0YShsZWdlbmQsIG9wdGlvbiwgY2hhcnQpIHtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIHZhciBsZWdlbmRTdGF0dXMgPSBjaGFydC5sZWdlbmRTdGF0dXM7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIG5hbWUgPSBpdGVtLm5hbWU7XG4gICAgdmFyIHJlc3VsdCA9IHNlcmllcy5maW5kKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICB2YXIgc24gPSBfcmVmLm5hbWU7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gc247XG4gICAgfSk7XG4gICAgaWYgKCFyZXN1bHQpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIWl0ZW0uY29sb3IpIGl0ZW0uY29sb3IgPSByZXN1bHQuY29sb3I7XG4gICAgaWYgKCFpdGVtLmljb24pIGl0ZW0uaWNvbiA9IHJlc3VsdC50eXBlO1xuICAgIHJldHVybiBpdGVtO1xuICB9KTtcbiAgaWYgKCFsZWdlbmRTdGF0dXMgfHwgbGVnZW5kU3RhdHVzLmxlbmd0aCAhPT0gbGVnZW5kLmRhdGEubGVuZ3RoKSBsZWdlbmRTdGF0dXMgPSBuZXcgQXJyYXkobGVnZW5kLmRhdGEubGVuZ3RoKS5maWxsKHRydWUpO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICByZXR1cm4gaXRlbS5zdGF0dXMgPSBsZWdlbmRTdGF0dXNbaV07XG4gIH0pO1xuICBsZWdlbmQuZGF0YSA9IGRhdGE7XG4gIGNoYXJ0LmxlZ2VuZFN0YXR1cyA9IGxlZ2VuZFN0YXR1cztcbiAgcmV0dXJuIGxlZ2VuZDtcbn1cblxuZnVuY3Rpb24gY2FsY0xlZ2VuZFRleHRXaWR0aChsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBjdHggPSBjaGFydC5yZW5kZXIuY3R4O1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgdGV4dFN0eWxlID0gbGVnZW5kLnRleHRTdHlsZSxcbiAgICAgIHRleHRVbnNlbGVjdGVkU3R5bGUgPSBsZWdlbmQudGV4dFVuc2VsZWN0ZWRTdHlsZTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIHN0YXR1cyA9IGl0ZW0uc3RhdHVzLFxuICAgICAgICBuYW1lID0gaXRlbS5uYW1lO1xuICAgIGl0ZW0udGV4dFdpZHRoID0gZ2V0VGV4dFdpZHRoKGN0eCwgbmFtZSwgc3RhdHVzID8gdGV4dFN0eWxlIDogdGV4dFVuc2VsZWN0ZWRTdHlsZSk7XG4gIH0pO1xuICByZXR1cm4gbGVnZW5kO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0V2lkdGgoY3R4LCB0ZXh0LCBzdHlsZSkge1xuICBjdHguZm9udCA9IGdldEZvbnRDb25maWcoc3R5bGUpO1xuICByZXR1cm4gY3R4Lm1lYXN1cmVUZXh0KHRleHQpLndpZHRoO1xufVxuXG5mdW5jdGlvbiBnZXRGb250Q29uZmlnKHN0eWxlKSB7XG4gIHZhciBmb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseSxcbiAgICAgIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemU7XG4gIHJldHVybiBcIlwiLmNvbmNhdChmb250U2l6ZSwgXCJweCBcIikuY29uY2F0KGZvbnRGYW1pbHkpO1xufVxuXG5mdW5jdGlvbiBjYWxjTGVnZW5kUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgb3JpZW50ID0gbGVnZW5kLm9yaWVudDtcblxuICBpZiAob3JpZW50ID09PSAndmVydGljYWwnKSB7XG4gICAgY2FsY1ZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBjaGFydCk7XG4gIH0gZWxzZSB7XG4gICAgY2FsY0hvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KTtcbiAgfVxuXG4gIHJldHVybiBsZWdlbmQ7XG59XG5cbmZ1bmN0aW9uIGNhbGNIb3Jpem9udGFsUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgaWNvbkhlaWdodCA9IGxlZ2VuZC5pY29uSGVpZ2h0LFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwO1xuICB2YXIgbGluZXMgPSBjYWxjRGVmYXVsdEhvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KTtcbiAgdmFyIHhPZmZzZXRzID0gbGluZXMubWFwKGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgcmV0dXJuIGdldEhvcml6b250YWxYT2Zmc2V0KGxpbmUsIGxlZ2VuZCwgY2hhcnQpO1xuICB9KTtcbiAgdmFyIHlPZmZzZXQgPSBnZXRIb3Jpem9udGFsWU9mZnNldChsZWdlbmQsIGNoYXJ0KTtcbiAgdmFyIGFsaWduID0ge1xuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgbGluZXMuZm9yRWFjaChmdW5jdGlvbiAobGluZSwgaSkge1xuICAgIHJldHVybiBsaW5lLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBpY29uUG9zaXRpb24gPSBpdGVtLmljb25Qb3NpdGlvbixcbiAgICAgICAgICB0ZXh0UG9zaXRpb24gPSBpdGVtLnRleHRQb3NpdGlvbjtcbiAgICAgIHZhciB4T2Zmc2V0ID0geE9mZnNldHNbaV07XG4gICAgICB2YXIgcmVhbFlPZmZzZXQgPSB5T2Zmc2V0ICsgaSAqIChpdGVtR2FwICsgaWNvbkhlaWdodCk7XG4gICAgICBpdGVtLmljb25Qb3NpdGlvbiA9IG1lcmdlT2Zmc2V0KGljb25Qb3NpdGlvbiwgW3hPZmZzZXQsIHJlYWxZT2Zmc2V0XSk7XG4gICAgICBpdGVtLnRleHRQb3NpdGlvbiA9IG1lcmdlT2Zmc2V0KHRleHRQb3NpdGlvbiwgW3hPZmZzZXQsIHJlYWxZT2Zmc2V0XSk7XG4gICAgICBpdGVtLmFsaWduID0gYWxpZ247XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjRGVmYXVsdEhvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmQuaWNvbldpZHRoO1xuICB2YXIgdyA9IGNoYXJ0LnJlbmRlci5hcmVhWzBdO1xuICB2YXIgc3RhcnRJbmRleCA9IDA7XG4gIHZhciBsaW5lcyA9IFtbXV07XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHZhciBiZWZvcmVXaWR0aCA9IGdldEJlZm9yZVdpZHRoKHN0YXJ0SW5kZXgsIGksIGxlZ2VuZCk7XG4gICAgdmFyIGVuZFhQb3MgPSBiZWZvcmVXaWR0aCArIGljb25XaWR0aCArIDUgKyBpdGVtLnRleHRXaWR0aDtcblxuICAgIGlmIChlbmRYUG9zID49IHcpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSBpO1xuICAgICAgYmVmb3JlV2lkdGggPSBnZXRCZWZvcmVXaWR0aChzdGFydEluZGV4LCBpLCBsZWdlbmQpO1xuICAgICAgbGluZXMucHVzaChbXSk7XG4gICAgfVxuXG4gICAgaXRlbS5pY29uUG9zaXRpb24gPSBbYmVmb3JlV2lkdGgsIDBdO1xuICAgIGl0ZW0udGV4dFBvc2l0aW9uID0gW2JlZm9yZVdpZHRoICsgaWNvbldpZHRoICsgNSwgMF07XG4gICAgbGluZXMuc2xpY2UoLTEpWzBdLnB1c2goaXRlbSk7XG4gIH0pO1xuICByZXR1cm4gbGluZXM7XG59XG5cbmZ1bmN0aW9uIGdldEJlZm9yZVdpZHRoKHN0YXJ0SW5kZXgsIGN1cnJlbnRJbmRleCwgbGVnZW5kKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmQuaWNvbldpZHRoLFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwO1xuICB2YXIgYmVmb3JlSXRlbSA9IGRhdGEuc2xpY2Uoc3RhcnRJbmRleCwgY3VycmVudEluZGV4KTtcbiAgcmV0dXJuICgwLCBfdXRpbDIubXVsQWRkKShiZWZvcmVJdGVtLm1hcChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgdGV4dFdpZHRoID0gX3JlZjIudGV4dFdpZHRoO1xuICAgIHJldHVybiB0ZXh0V2lkdGg7XG4gIH0pKSArIChjdXJyZW50SW5kZXggLSBzdGFydEluZGV4KSAqIChpdGVtR2FwICsgNSArIGljb25XaWR0aCk7XG59XG5cbmZ1bmN0aW9uIGdldEhvcml6b250YWxYT2Zmc2V0KGRhdGEsIGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGxlZnQgPSBsZWdlbmQubGVmdCxcbiAgICAgIHJpZ2h0ID0gbGVnZW5kLnJpZ2h0LFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kLmljb25XaWR0aCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcDtcbiAgdmFyIHcgPSBjaGFydC5yZW5kZXIuYXJlYVswXTtcbiAgdmFyIGRhdGFOdW0gPSBkYXRhLmxlbmd0aDtcbiAgdmFyIGFsbFdpZHRoID0gKDAsIF91dGlsMi5tdWxBZGQpKGRhdGEubWFwKGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciB0ZXh0V2lkdGggPSBfcmVmMy50ZXh0V2lkdGg7XG4gICAgcmV0dXJuIHRleHRXaWR0aDtcbiAgfSkpICsgZGF0YU51bSAqICg1ICsgaWNvbldpZHRoKSArIChkYXRhTnVtIC0gMSkgKiBpdGVtR2FwO1xuICB2YXIgaG9yaXpvbnRhbCA9IFtsZWZ0LCByaWdodF0uZmluZEluZGV4KGZ1bmN0aW9uIChwb3MpIHtcbiAgICByZXR1cm4gcG9zICE9PSAnYXV0byc7XG4gIH0pO1xuXG4gIGlmIChob3Jpem9udGFsID09PSAtMSkge1xuICAgIHJldHVybiAodyAtIGFsbFdpZHRoKSAvIDI7XG4gIH0gZWxzZSBpZiAoaG9yaXpvbnRhbCA9PT0gMCkge1xuICAgIGlmICh0eXBlb2YgbGVmdCA9PT0gJ251bWJlcicpIHJldHVybiBsZWZ0O1xuICAgIHJldHVybiBwYXJzZUludChsZWZ0KSAvIDEwMCAqIHc7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiByaWdodCAhPT0gJ251bWJlcicpIHJpZ2h0ID0gcGFyc2VJbnQocmlnaHQpIC8gMTAwICogdztcbiAgICByZXR1cm4gdyAtIChhbGxXaWR0aCArIHJpZ2h0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRIb3Jpem9udGFsWU9mZnNldChsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciB0b3AgPSBsZWdlbmQudG9wLFxuICAgICAgYm90dG9tID0gbGVnZW5kLmJvdHRvbSxcbiAgICAgIGljb25IZWlnaHQgPSBsZWdlbmQuaWNvbkhlaWdodDtcbiAgdmFyIGggPSBjaGFydC5yZW5kZXIuYXJlYVsxXTtcbiAgdmFyIHZlcnRpY2FsID0gW3RvcCwgYm90dG9tXS5maW5kSW5kZXgoZnVuY3Rpb24gKHBvcykge1xuICAgIHJldHVybiBwb3MgIT09ICdhdXRvJztcbiAgfSk7XG4gIHZhciBoYWxmSWNvbkhlaWdodCA9IGljb25IZWlnaHQgLyAyO1xuXG4gIGlmICh2ZXJ0aWNhbCA9PT0gLTEpIHtcbiAgICB2YXIgX2NoYXJ0JGdyaWRBcmVhID0gY2hhcnQuZ3JpZEFyZWEsXG4gICAgICAgIHkgPSBfY2hhcnQkZ3JpZEFyZWEueSxcbiAgICAgICAgaGVpZ2h0ID0gX2NoYXJ0JGdyaWRBcmVhLmg7XG4gICAgcmV0dXJuIHkgKyBoZWlnaHQgKyA0NSAtIGhhbGZJY29uSGVpZ2h0O1xuICB9IGVsc2UgaWYgKHZlcnRpY2FsID09PSAwKSB7XG4gICAgaWYgKHR5cGVvZiB0b3AgPT09ICdudW1iZXInKSByZXR1cm4gdG9wIC0gaGFsZkljb25IZWlnaHQ7XG4gICAgcmV0dXJuIHBhcnNlSW50KHRvcCkgLyAxMDAgKiBoIC0gaGFsZkljb25IZWlnaHQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBib3R0b20gIT09ICdudW1iZXInKSBib3R0b20gPSBwYXJzZUludChib3R0b20pIC8gMTAwICogaDtcbiAgICByZXR1cm4gaCAtIGJvdHRvbSAtIGhhbGZJY29uSGVpZ2h0O1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlT2Zmc2V0KF9yZWY0LCBfcmVmNSkge1xuICB2YXIgX3JlZjYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjQsIDIpLFxuICAgICAgeCA9IF9yZWY2WzBdLFxuICAgICAgeSA9IF9yZWY2WzFdO1xuXG4gIHZhciBfcmVmNyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNSwgMiksXG4gICAgICBveCA9IF9yZWY3WzBdLFxuICAgICAgb3kgPSBfcmVmN1sxXTtcblxuICByZXR1cm4gW3ggKyBveCwgeSArIG95XTtcbn1cblxuZnVuY3Rpb24gY2FsY1ZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBjaGFydCkge1xuICB2YXIgX2dldFZlcnRpY2FsWE9mZnNldCA9IGdldFZlcnRpY2FsWE9mZnNldChsZWdlbmQsIGNoYXJ0KSxcbiAgICAgIF9nZXRWZXJ0aWNhbFhPZmZzZXQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRWZXJ0aWNhbFhPZmZzZXQsIDIpLFxuICAgICAgaXNSaWdodCA9IF9nZXRWZXJ0aWNhbFhPZmZzZXQyWzBdLFxuICAgICAgeE9mZnNldCA9IF9nZXRWZXJ0aWNhbFhPZmZzZXQyWzFdO1xuXG4gIHZhciB5T2Zmc2V0ID0gZ2V0VmVydGljYWxZT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpO1xuICBjYWxjRGVmYXVsdFZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBpc1JpZ2h0KTtcbiAgdmFyIGFsaWduID0ge1xuICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgbGVnZW5kLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciB0ZXh0UG9zaXRpb24gPSBpdGVtLnRleHRQb3NpdGlvbixcbiAgICAgICAgaWNvblBvc2l0aW9uID0gaXRlbS5pY29uUG9zaXRpb247XG4gICAgaXRlbS50ZXh0UG9zaXRpb24gPSBtZXJnZU9mZnNldCh0ZXh0UG9zaXRpb24sIFt4T2Zmc2V0LCB5T2Zmc2V0XSk7XG4gICAgaXRlbS5pY29uUG9zaXRpb24gPSBtZXJnZU9mZnNldChpY29uUG9zaXRpb24sIFt4T2Zmc2V0LCB5T2Zmc2V0XSk7XG4gICAgaXRlbS5hbGlnbiA9IGFsaWduO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VmVydGljYWxYT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGxlZnQgPSBsZWdlbmQubGVmdCxcbiAgICAgIHJpZ2h0ID0gbGVnZW5kLnJpZ2h0O1xuICB2YXIgdyA9IGNoYXJ0LnJlbmRlci5hcmVhWzBdO1xuICB2YXIgaG9yaXpvbnRhbCA9IFtsZWZ0LCByaWdodF0uZmluZEluZGV4KGZ1bmN0aW9uIChwb3MpIHtcbiAgICByZXR1cm4gcG9zICE9PSAnYXV0byc7XG4gIH0pO1xuXG4gIGlmIChob3Jpem9udGFsID09PSAtMSkge1xuICAgIHJldHVybiBbdHJ1ZSwgdyAtIDEwXTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb2Zmc2V0ID0gW2xlZnQsIHJpZ2h0XVtob3Jpem9udGFsXTtcbiAgICBpZiAodHlwZW9mIG9mZnNldCAhPT0gJ251bWJlcicpIG9mZnNldCA9IHBhcnNlSW50KG9mZnNldCkgLyAxMDAgKiB3O1xuICAgIHJldHVybiBbQm9vbGVhbihob3Jpem9udGFsKSwgb2Zmc2V0XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWZXJ0aWNhbFlPZmZzZXQobGVnZW5kLCBjaGFydCkge1xuICB2YXIgaWNvbkhlaWdodCA9IGxlZ2VuZC5pY29uSGVpZ2h0LFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwLFxuICAgICAgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgdG9wID0gbGVnZW5kLnRvcCxcbiAgICAgIGJvdHRvbSA9IGxlZ2VuZC5ib3R0b207XG4gIHZhciBoID0gY2hhcnQucmVuZGVyLmFyZWFbMV07XG4gIHZhciBkYXRhTnVtID0gZGF0YS5sZW5ndGg7XG4gIHZhciBhbGxIZWlnaHQgPSBkYXRhTnVtICogaWNvbkhlaWdodCArIChkYXRhTnVtIC0gMSkgKiBpdGVtR2FwO1xuICB2YXIgdmVydGljYWwgPSBbdG9wLCBib3R0b21dLmZpbmRJbmRleChmdW5jdGlvbiAocG9zKSB7XG4gICAgcmV0dXJuIHBvcyAhPT0gJ2F1dG8nO1xuICB9KTtcblxuICBpZiAodmVydGljYWwgPT09IC0xKSB7XG4gICAgcmV0dXJuIChoIC0gYWxsSGVpZ2h0KSAvIDI7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG9mZnNldCA9IFt0b3AsIGJvdHRvbV1bdmVydGljYWxdO1xuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ICE9PSAnbnVtYmVyJykgb2Zmc2V0ID0gcGFyc2VJbnQob2Zmc2V0KSAvIDEwMCAqIGg7XG4gICAgaWYgKHZlcnRpY2FsID09PSAxKSBvZmZzZXQgPSBoIC0gb2Zmc2V0IC0gYWxsSGVpZ2h0O1xuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FsY0RlZmF1bHRWZXJ0aWNhbFBvc2l0aW9uKGxlZ2VuZCwgaXNSaWdodCkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZC5kYXRhLFxuICAgICAgaWNvbldpZHRoID0gbGVnZW5kLmljb25XaWR0aCxcbiAgICAgIGljb25IZWlnaHQgPSBsZWdlbmQuaWNvbkhlaWdodCxcbiAgICAgIGl0ZW1HYXAgPSBsZWdlbmQuaXRlbUdhcDtcbiAgdmFyIGhhbGZJY29uSGVpZ2h0ID0gaWNvbkhlaWdodCAvIDI7XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHZhciB0ZXh0V2lkdGggPSBpdGVtLnRleHRXaWR0aDtcbiAgICB2YXIgeVBvcyA9IChpY29uSGVpZ2h0ICsgaXRlbUdhcCkgKiBpICsgaGFsZkljb25IZWlnaHQ7XG4gICAgdmFyIGljb25YUG9zID0gaXNSaWdodCA/IDAgLSBpY29uV2lkdGggOiAwO1xuICAgIHZhciB0ZXh0WHBvcyA9IGlzUmlnaHQgPyBpY29uWFBvcyAtIDUgLSB0ZXh0V2lkdGggOiBpY29uV2lkdGggKyA1O1xuICAgIGl0ZW0uaWNvblBvc2l0aW9uID0gW2ljb25YUG9zLCB5UG9zXTtcbiAgICBpdGVtLnRleHRQb3NpdGlvbiA9IFt0ZXh0WHBvcywgeVBvc107XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRJY29uQ29uZmlnKGxlZ2VuZEl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmRJdGVtLmRhdGEsXG4gICAgICBzZWxlY3RBYmxlID0gbGVnZW5kSXRlbS5zZWxlY3RBYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBsZWdlbmRJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsZWdlbmRJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGVnZW5kSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHJldHVybiAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHtcbiAgICAgIG5hbWU6IGl0ZW0uaWNvbiA9PT0gJ2xpbmUnID8gJ2xpbmVJY29uJyA6ICdyZWN0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBsZWdlbmRJdGVtLnNob3csXG4gICAgICBob3Zlcjogc2VsZWN0QWJsZSxcbiAgICAgIGNsaWNrOiBzZWxlY3RBYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEljb25TaGFwZShsZWdlbmRJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRJY29uU3R5bGUobGVnZW5kSXRlbSwgaSlcbiAgICB9LCBcImNsaWNrXCIsIGNyZWF0ZUNsaWNrQ2FsbEJhY2sobGVnZW5kSXRlbSwgaSwgdXBkYXRlcikpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvblNoYXBlKGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmRJdGVtLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmRJdGVtLmljb25XaWR0aCxcbiAgICAgIGljb25IZWlnaHQgPSBsZWdlbmRJdGVtLmljb25IZWlnaHQ7XG5cbiAgdmFyIF9kYXRhJGkkaWNvblBvc2l0aW9uID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGRhdGFbaV0uaWNvblBvc2l0aW9uLCAyKSxcbiAgICAgIHggPSBfZGF0YSRpJGljb25Qb3NpdGlvblswXSxcbiAgICAgIHkgPSBfZGF0YSRpJGljb25Qb3NpdGlvblsxXTtcblxuICB2YXIgaGFsZkljb25IZWlnaHQgPSBpY29uSGVpZ2h0IC8gMjtcbiAgcmV0dXJuIHtcbiAgICB4OiB4LFxuICAgIHk6IHkgLSBoYWxmSWNvbkhlaWdodCxcbiAgICB3OiBpY29uV2lkdGgsXG4gICAgaDogaWNvbkhlaWdodFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRJY29uU3R5bGUobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZEl0ZW0uZGF0YSxcbiAgICAgIGljb25TdHlsZSA9IGxlZ2VuZEl0ZW0uaWNvblN0eWxlLFxuICAgICAgaWNvblVuc2VsZWN0ZWRTdHlsZSA9IGxlZ2VuZEl0ZW0uaWNvblVuc2VsZWN0ZWRTdHlsZTtcbiAgdmFyIF9kYXRhJGkgPSBkYXRhW2ldLFxuICAgICAgc3RhdHVzID0gX2RhdGEkaS5zdGF0dXMsXG4gICAgICBjb2xvciA9IF9kYXRhJGkuY29sb3I7XG4gIHZhciBzdHlsZSA9IHN0YXR1cyA/IGljb25TdHlsZSA6IGljb25VbnNlbGVjdGVkU3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dENvbmZpZyhsZWdlbmRJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kSXRlbS5kYXRhLFxuICAgICAgc2VsZWN0QWJsZSA9IGxlZ2VuZEl0ZW0uc2VsZWN0QWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gbGVnZW5kSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGVnZW5kSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGxlZ2VuZEl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogbGVnZW5kSXRlbS5zaG93LFxuICAgICAgaG92ZXI6IHNlbGVjdEFibGUsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBob3ZlclJlY3Q6IGdldFRleHRIb3ZlclJlY3QobGVnZW5kSXRlbSwgaSksXG4gICAgICBzaGFwZTogZ2V0VGV4dFNoYXBlKGxlZ2VuZEl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldFRleHRTdHlsZShsZWdlbmRJdGVtLCBpKSxcbiAgICAgIGNsaWNrOiBjcmVhdGVDbGlja0NhbGxCYWNrKGxlZ2VuZEl0ZW0sIGksIHVwZGF0ZXIpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRleHRTaGFwZShsZWdlbmRJdGVtLCBpKSB7XG4gIHZhciBfbGVnZW5kSXRlbSRkYXRhJGkgPSBsZWdlbmRJdGVtLmRhdGFbaV0sXG4gICAgICB0ZXh0UG9zaXRpb24gPSBfbGVnZW5kSXRlbSRkYXRhJGkudGV4dFBvc2l0aW9uLFxuICAgICAgbmFtZSA9IF9sZWdlbmRJdGVtJGRhdGEkaS5uYW1lO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IG5hbWUsXG4gICAgcG9zaXRpb246IHRleHRQb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0U3R5bGUobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgdGV4dFN0eWxlID0gbGVnZW5kSXRlbS50ZXh0U3R5bGUsXG4gICAgICB0ZXh0VW5zZWxlY3RlZFN0eWxlID0gbGVnZW5kSXRlbS50ZXh0VW5zZWxlY3RlZFN0eWxlO1xuICB2YXIgX2xlZ2VuZEl0ZW0kZGF0YSRpMiA9IGxlZ2VuZEl0ZW0uZGF0YVtpXSxcbiAgICAgIHN0YXR1cyA9IF9sZWdlbmRJdGVtJGRhdGEkaTIuc3RhdHVzLFxuICAgICAgYWxpZ24gPSBfbGVnZW5kSXRlbSRkYXRhJGkyLmFsaWduO1xuICB2YXIgc3R5bGUgPSBzdGF0dXMgPyB0ZXh0U3R5bGUgOiB0ZXh0VW5zZWxlY3RlZFN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKHN0eWxlLCB0cnVlKSwgYWxpZ24pO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0SG92ZXJSZWN0KGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIHRleHRTdHlsZSA9IGxlZ2VuZEl0ZW0udGV4dFN0eWxlLFxuICAgICAgdGV4dFVuc2VsZWN0ZWRTdHlsZSA9IGxlZ2VuZEl0ZW0udGV4dFVuc2VsZWN0ZWRTdHlsZTtcblxuICB2YXIgX2xlZ2VuZEl0ZW0kZGF0YSRpMyA9IGxlZ2VuZEl0ZW0uZGF0YVtpXSxcbiAgICAgIHN0YXR1cyA9IF9sZWdlbmRJdGVtJGRhdGEkaTMuc3RhdHVzLFxuICAgICAgX2xlZ2VuZEl0ZW0kZGF0YSRpMyR0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9sZWdlbmRJdGVtJGRhdGEkaTMudGV4dFBvc2l0aW9uLCAyKSxcbiAgICAgIHggPSBfbGVnZW5kSXRlbSRkYXRhJGkzJHRbMF0sXG4gICAgICB5ID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMyR0WzFdLFxuICAgICAgdGV4dFdpZHRoID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMy50ZXh0V2lkdGg7XG5cbiAgdmFyIHN0eWxlID0gc3RhdHVzID8gdGV4dFN0eWxlIDogdGV4dFVuc2VsZWN0ZWRTdHlsZTtcbiAgdmFyIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemU7XG4gIHJldHVybiBbeCwgeSAtIGZvbnRTaXplIC8gMiwgdGV4dFdpZHRoLCBmb250U2l6ZV07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNsaWNrQ2FsbEJhY2sobGVnZW5kSXRlbSwgaW5kZXgsIHVwZGF0ZXIpIHtcbiAgdmFyIG5hbWUgPSBsZWdlbmRJdGVtLmRhdGFbaW5kZXhdLm5hbWU7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF91cGRhdGVyJGNoYXJ0ID0gdXBkYXRlci5jaGFydCxcbiAgICAgICAgbGVnZW5kU3RhdHVzID0gX3VwZGF0ZXIkY2hhcnQubGVnZW5kU3RhdHVzLFxuICAgICAgICBvcHRpb24gPSBfdXBkYXRlciRjaGFydC5vcHRpb247XG4gICAgdmFyIHN0YXR1cyA9ICFsZWdlbmRTdGF0dXNbaW5kZXhdO1xuICAgIHZhciBjaGFuZ2UgPSBvcHRpb24uc2VyaWVzLmZpbmQoZnVuY3Rpb24gKF9yZWY5KSB7XG4gICAgICB2YXIgc24gPSBfcmVmOS5uYW1lO1xuICAgICAgcmV0dXJuIHNuID09PSBuYW1lO1xuICAgIH0pO1xuICAgIGNoYW5nZS5zaG93ID0gc3RhdHVzO1xuICAgIGxlZ2VuZFN0YXR1c1tpbmRleF0gPSBzdGF0dXM7XG4gICAgdXBkYXRlci5jaGFydC5zZXRPcHRpb24ob3B0aW9uKTtcbiAgfTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmxpbmUgPSBsaW5lO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX2JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbnZhciBwb2x5bGluZVRvQmV6aWVyQ3VydmUgPSBfYmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdLnBvbHlsaW5lVG9CZXppZXJDdXJ2ZSxcbiAgICBnZXRCZXppZXJDdXJ2ZUxlbmd0aCA9IF9iZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl0uZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG5cbmZ1bmN0aW9uIGxpbmUoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciB4QXhpcyA9IG9wdGlvbi54QXhpcyxcbiAgICAgIHlBeGlzID0gb3B0aW9uLnlBeGlzLFxuICAgICAgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgdmFyIGxpbmVzID0gW107XG5cbiAgaWYgKHhBeGlzICYmIHlBeGlzICYmIHNlcmllcykge1xuICAgIGxpbmVzID0gKDAsIF91dGlsLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9jb25maWcubGluZUNvbmZpZywgJ2xpbmUnKTtcbiAgICBsaW5lcyA9IGNhbGNMaW5lc1Bvc2l0aW9uKGxpbmVzLCBjaGFydCk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lQXJlYScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExpbmVBcmVhQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0TGluZUFyZWFDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVMaW5lQW5kQXJlYSxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZUxpbmVBbmRBcmVhXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGluZUNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydExpbmVDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVMaW5lQW5kQXJlYSxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZUxpbmVBbmRBcmVhXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lUG9pbnQnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRQb2ludENvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBvaW50Q29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBsaW5lcyxcbiAgICBrZXk6ICdsaW5lTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMYWJlbENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0xpbmVzUG9zaXRpb24obGluZXMsIGNoYXJ0KSB7XG4gIHZhciBheGlzRGF0YSA9IGNoYXJ0LmF4aXNEYXRhO1xuICByZXR1cm4gbGluZXMubWFwKGZ1bmN0aW9uIChsaW5lSXRlbSkge1xuICAgIHZhciBsaW5lRGF0YSA9ICgwLCBfdXRpbC5tZXJnZVNhbWVTdGFja0RhdGEpKGxpbmVJdGVtLCBsaW5lcyk7XG4gICAgbGluZURhdGEgPSBtZXJnZU5vbk51bWJlcihsaW5lSXRlbSwgbGluZURhdGEpO1xuICAgIHZhciBsaW5lQXhpcyA9IGdldExpbmVBeGlzKGxpbmVJdGVtLCBheGlzRGF0YSk7XG4gICAgdmFyIGxpbmVQb3NpdGlvbiA9IGdldExpbmVQb3NpdGlvbihsaW5lRGF0YSwgbGluZUF4aXMpO1xuICAgIHZhciBsaW5lRmlsbEJvdHRvbVBvcyA9IGdldExpbmVGaWxsQm90dG9tUG9zKGxpbmVBeGlzKTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgbGluZUl0ZW0sIHtcbiAgICAgIGxpbmVQb3NpdGlvbjogbGluZVBvc2l0aW9uLmZpbHRlcihmdW5jdGlvbiAocCkge1xuICAgICAgICByZXR1cm4gcDtcbiAgICAgIH0pLFxuICAgICAgbGluZUZpbGxCb3R0b21Qb3M6IGxpbmVGaWxsQm90dG9tUG9zXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtZXJnZU5vbk51bWJlcihsaW5lSXRlbSwgbGluZURhdGEpIHtcbiAgdmFyIGRhdGEgPSBsaW5lSXRlbS5kYXRhO1xuICByZXR1cm4gbGluZURhdGEubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBkYXRhW2ldID09PSAnbnVtYmVyJyA/IHYgOiBudWxsO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUF4aXMobGluZSwgYXhpc0RhdGEpIHtcbiAgdmFyIHhBeGlzSW5kZXggPSBsaW5lLnhBeGlzSW5kZXgsXG4gICAgICB5QXhpc0luZGV4ID0gbGluZS55QXhpc0luZGV4O1xuICB2YXIgeEF4aXMgPSBheGlzRGF0YS5maW5kKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmLmF4aXMsXG4gICAgICAgIGluZGV4ID0gX3JlZi5pbmRleDtcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3gnICYmIGluZGV4ID09PSB4QXhpc0luZGV4O1xuICB9KTtcbiAgdmFyIHlBeGlzID0gYXhpc0RhdGEuZmluZChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYyLmF4aXMsXG4gICAgICAgIGluZGV4ID0gX3JlZjIuaW5kZXg7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd5JyAmJiBpbmRleCA9PT0geUF4aXNJbmRleDtcbiAgfSk7XG4gIHJldHVybiBbeEF4aXMsIHlBeGlzXTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZVBvc2l0aW9uKGxpbmVEYXRhLCBsaW5lQXhpcykge1xuICB2YXIgdmFsdWVBeGlzSW5kZXggPSBsaW5lQXhpcy5maW5kSW5kZXgoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmMy5kYXRhO1xuICAgIHJldHVybiBkYXRhID09PSAndmFsdWUnO1xuICB9KTtcbiAgdmFyIHZhbHVlQXhpcyA9IGxpbmVBeGlzW3ZhbHVlQXhpc0luZGV4XTtcbiAgdmFyIGxhYmVsQXhpcyA9IGxpbmVBeGlzWzEgLSB2YWx1ZUF4aXNJbmRleF07XG4gIHZhciBsaW5lUG9zaXRpb24gPSB2YWx1ZUF4aXMubGluZVBvc2l0aW9uLFxuICAgICAgYXhpcyA9IHZhbHVlQXhpcy5heGlzO1xuICB2YXIgdGlja1Bvc2l0aW9uID0gbGFiZWxBeGlzLnRpY2tQb3NpdGlvbjtcbiAgdmFyIHRpY2tOdW0gPSB0aWNrUG9zaXRpb24ubGVuZ3RoO1xuICB2YXIgdmFsdWVBeGlzUG9zSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIHZhbHVlQXhpc1N0YXJ0UG9zID0gbGluZVBvc2l0aW9uWzBdW3ZhbHVlQXhpc1Bvc0luZGV4XTtcbiAgdmFyIHZhbHVlQXhpc0VuZFBvcyA9IGxpbmVQb3NpdGlvblsxXVt2YWx1ZUF4aXNQb3NJbmRleF07XG4gIHZhciB2YWx1ZUF4aXNQb3NNaW51cyA9IHZhbHVlQXhpc0VuZFBvcyAtIHZhbHVlQXhpc1N0YXJ0UG9zO1xuICB2YXIgbWF4VmFsdWUgPSB2YWx1ZUF4aXMubWF4VmFsdWUsXG4gICAgICBtaW5WYWx1ZSA9IHZhbHVlQXhpcy5taW5WYWx1ZTtcbiAgdmFyIHZhbHVlTWludXMgPSBtYXhWYWx1ZSAtIG1pblZhbHVlO1xuICB2YXIgcG9zaXRpb24gPSBuZXcgQXJyYXkodGlja051bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHZhciB2ID0gbGluZURhdGFbaV07XG4gICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykgcmV0dXJuIG51bGw7XG4gICAgdmFyIHZhbHVlUGVyY2VudCA9ICh2IC0gbWluVmFsdWUpIC8gdmFsdWVNaW51cztcbiAgICBpZiAodmFsdWVNaW51cyA9PT0gMCkgdmFsdWVQZXJjZW50ID0gMDtcbiAgICByZXR1cm4gdmFsdWVQZXJjZW50ICogdmFsdWVBeGlzUG9zTWludXMgKyB2YWx1ZUF4aXNTdGFydFBvcztcbiAgfSk7XG4gIHJldHVybiBwb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHZQb3MsIGkpIHtcbiAgICBpZiAoaSA+PSB0aWNrTnVtIHx8IHR5cGVvZiB2UG9zICE9PSAnbnVtYmVyJykgcmV0dXJuIG51bGw7XG4gICAgdmFyIHBvcyA9IFt2UG9zLCB0aWNrUG9zaXRpb25baV1bMSAtIHZhbHVlQXhpc1Bvc0luZGV4XV07XG4gICAgaWYgKHZhbHVlQXhpc1Bvc0luZGV4ID09PSAwKSByZXR1cm4gcG9zO1xuICAgIHBvcy5yZXZlcnNlKCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVGaWxsQm90dG9tUG9zKGxpbmVBeGlzKSB7XG4gIHZhciB2YWx1ZUF4aXMgPSBsaW5lQXhpcy5maW5kKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgIHZhciBkYXRhID0gX3JlZjQuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhciBheGlzID0gdmFsdWVBeGlzLmF4aXMsXG4gICAgICBsaW5lUG9zaXRpb24gPSB2YWx1ZUF4aXMubGluZVBvc2l0aW9uLFxuICAgICAgbWluVmFsdWUgPSB2YWx1ZUF4aXMubWluVmFsdWUsXG4gICAgICBtYXhWYWx1ZSA9IHZhbHVlQXhpcy5tYXhWYWx1ZTtcbiAgdmFyIGNoYW5nZUluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBjaGFuZ2VWYWx1ZSA9IGxpbmVQb3NpdGlvblswXVtjaGFuZ2VJbmRleF07XG5cbiAgaWYgKG1pblZhbHVlIDwgMCAmJiBtYXhWYWx1ZSA+IDApIHtcbiAgICB2YXIgdmFsdWVNaW51cyA9IG1heFZhbHVlIC0gbWluVmFsdWU7XG4gICAgdmFyIHBvc01pbnVzID0gTWF0aC5hYnMobGluZVBvc2l0aW9uWzBdW2NoYW5nZUluZGV4XSAtIGxpbmVQb3NpdGlvblsxXVtjaGFuZ2VJbmRleF0pO1xuICAgIHZhciBvZmZzZXQgPSBNYXRoLmFicyhtaW5WYWx1ZSkgLyB2YWx1ZU1pbnVzICogcG9zTWludXM7XG4gICAgaWYgKGF4aXMgPT09ICd5Jykgb2Zmc2V0ICo9IC0xO1xuICAgIGNoYW5nZVZhbHVlICs9IG9mZnNldDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2hhbmdlSW5kZXg6IGNoYW5nZUluZGV4LFxuICAgIGNoYW5nZVZhbHVlOiBjaGFuZ2VWYWx1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQXJlYUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBsaW5lRmlsbEJvdHRvbVBvcyA9IGxpbmVJdGVtLmxpbmVGaWxsQm90dG9tUG9zLFxuICAgICAgckxldmVsID0gbGluZUl0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiBnZXRMaW5lR3JhcGhOYW1lKGxpbmVJdGVtKSxcbiAgICBpbmRleDogckxldmVsLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgdmlzaWJsZTogbGluZUl0ZW0ubGluZUFyZWEuc2hvdyxcbiAgICBsaW5lRmlsbEJvdHRvbVBvczogbGluZUZpbGxCb3R0b21Qb3MsXG4gICAgc2hhcGU6IGdldExpbmVBbmRBcmVhU2hhcGUobGluZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRMaW5lQXJlYVN0eWxlKGxpbmVJdGVtKSxcbiAgICBkcmF3ZWQ6IGxpbmVBcmVhRHJhd2VkXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQW5kQXJlYVNoYXBlKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb247XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBsaW5lUG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUFyZWFTdHlsZShsaW5lSXRlbSkge1xuICB2YXIgbGluZUFyZWEgPSBsaW5lSXRlbS5saW5lQXJlYSxcbiAgICAgIGNvbG9yID0gbGluZUl0ZW0uY29sb3I7XG4gIHZhciBncmFkaWVudCA9IGxpbmVBcmVhLmdyYWRpZW50LFxuICAgICAgc3R5bGUgPSBsaW5lQXJlYS5zdHlsZTtcbiAgdmFyIGZpbGxDb2xvciA9IFtzdHlsZS5maWxsIHx8IGNvbG9yXTtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSAoMCwgX3V0aWwuZGVlcE1lcmdlKShmaWxsQ29sb3IsIGdyYWRpZW50KTtcbiAgaWYgKGdyYWRpZW50Q29sb3IubGVuZ3RoID09PSAxKSBncmFkaWVudENvbG9yLnB1c2goZ3JhZGllbnRDb2xvclswXSk7XG4gIHZhciBncmFkaWVudFBhcmFtcyA9IGdldEdyYWRpZW50UGFyYW1zKGxpbmVJdGVtKTtcbiAgc3R5bGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBzdHlsZSwge1xuICAgIHN0cm9rZTogJ3JnYmEoMCwgMCwgMCwgMCknXG4gIH0pO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoe1xuICAgIGdyYWRpZW50Q29sb3I6IGdyYWRpZW50Q29sb3IsXG4gICAgZ3JhZGllbnRQYXJhbXM6IGdyYWRpZW50UGFyYW1zLFxuICAgIGdyYWRpZW50VHlwZTogJ2xpbmVhcicsXG4gICAgZ3JhZGllbnRXaXRoOiAnZmlsbCdcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRHcmFkaWVudFBhcmFtcyhsaW5lSXRlbSkge1xuICB2YXIgbGluZUZpbGxCb3R0b21Qb3MgPSBsaW5lSXRlbS5saW5lRmlsbEJvdHRvbVBvcyxcbiAgICAgIGxpbmVQb3NpdGlvbiA9IGxpbmVJdGVtLmxpbmVQb3NpdGlvbjtcbiAgdmFyIGNoYW5nZUluZGV4ID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlSW5kZXgsXG4gICAgICBjaGFuZ2VWYWx1ZSA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZVZhbHVlO1xuICB2YXIgbWFpblBvcyA9IGxpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcFtjaGFuZ2VJbmRleF07XG4gIH0pO1xuICB2YXIgbWF4UG9zID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtYWluUG9zKSk7XG4gIHZhciBtaW5Qb3MgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1haW5Qb3MpKTtcbiAgdmFyIGJlZ2luUG9zID0gbWF4UG9zO1xuICBpZiAoY2hhbmdlSW5kZXggPT09IDEpIGJlZ2luUG9zID0gbWluUG9zO1xuXG4gIGlmIChjaGFuZ2VJbmRleCA9PT0gMSkge1xuICAgIHJldHVybiBbMCwgYmVnaW5Qb3MsIDAsIGNoYW5nZVZhbHVlXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW2JlZ2luUG9zLCAwLCBjaGFuZ2VWYWx1ZSwgMF07XG4gIH1cbn1cblxuZnVuY3Rpb24gbGluZUFyZWFEcmF3ZWQoX3JlZjUsIF9yZWY2KSB7XG4gIHZhciBsaW5lRmlsbEJvdHRvbVBvcyA9IF9yZWY1LmxpbmVGaWxsQm90dG9tUG9zLFxuICAgICAgc2hhcGUgPSBfcmVmNS5zaGFwZTtcbiAgdmFyIGN0eCA9IF9yZWY2LmN0eDtcbiAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgdmFyIGNoYW5nZUluZGV4ID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlSW5kZXgsXG4gICAgICBjaGFuZ2VWYWx1ZSA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZVZhbHVlO1xuICB2YXIgbGluZVBvaW50MSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSk7XG4gIHZhciBsaW5lUG9pbnQyID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludHNbMF0pO1xuICBsaW5lUG9pbnQxW2NoYW5nZUluZGV4XSA9IGNoYW5nZVZhbHVlO1xuICBsaW5lUG9pbnQyW2NoYW5nZUluZGV4XSA9IGNoYW5nZVZhbHVlO1xuICBjdHgubGluZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9pbnQxKSk7XG4gIGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb2ludDIpKTtcbiAgY3R4LmNsb3NlUGF0aCgpO1xuICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydExpbmVBcmVhQ29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBjb25maWcgPSBnZXRMaW5lQXJlYUNvbmZpZyhsaW5lSXRlbSlbMF07XG5cbiAgdmFyIHN0eWxlID0gX29iamVjdFNwcmVhZCh7fSwgY29uZmlnLnN0eWxlKTtcblxuICBzdHlsZS5vcGFjaXR5ID0gMDtcbiAgY29uZmlnLnN0eWxlID0gc3R5bGU7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlTGluZUFuZEFyZWEoZ3JhcGhzLCBsaW5lSXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgY2FjaGUgPSBncmFwaHNbaV07XG4gIGlmICghY2FjaGUpIHJldHVybjtcbiAgdmFyIGN1cnJlbnROYW1lID0gZ2V0TGluZUdyYXBoTmFtZShsaW5lSXRlbSk7XG4gIHZhciByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcjtcbiAgdmFyIG5hbWUgPSBjYWNoZVswXS5uYW1lO1xuICB2YXIgZGVsQWxsID0gY3VycmVudE5hbWUgIT09IG5hbWU7XG4gIGlmICghZGVsQWxsKSByZXR1cm47XG4gIGNhY2hlLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gcmVuZGVyLmRlbEdyYXBoKGcpO1xuICB9KTtcbiAgZ3JhcGhzW2ldID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlTGluZUFuZEFyZWEoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgcG9pbnRzID0gY29uZmlnLnNoYXBlLnBvaW50cztcbiAgdmFyIGdyYXBoUG9pbnRzID0gZ3JhcGguc2hhcGUucG9pbnRzO1xuICB2YXIgZ3JhcGhQb2ludHNOdW0gPSBncmFwaFBvaW50cy5sZW5ndGg7XG4gIHZhciBwb2ludHNOdW0gPSBwb2ludHMubGVuZ3RoO1xuXG4gIGlmIChwb2ludHNOdW0gPiBncmFwaFBvaW50c051bSkge1xuICAgIHZhciBsYXN0UG9pbnQgPSBncmFwaFBvaW50cy5zbGljZSgtMSlbMF07XG4gICAgdmFyIG5ld0FkZFBvaW50cyA9IG5ldyBBcnJheShwb2ludHNOdW0gLSBncmFwaFBvaW50c051bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbykge1xuICAgICAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGFzdFBvaW50KTtcbiAgICB9KTtcbiAgICBncmFwaFBvaW50cy5wdXNoLmFwcGx5KGdyYXBoUG9pbnRzLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ld0FkZFBvaW50cykpO1xuICB9IGVsc2UgaWYgKHBvaW50c051bSA8IGdyYXBoUG9pbnRzTnVtKSB7XG4gICAgZ3JhcGhQb2ludHMuc3BsaWNlKHBvaW50c051bSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGluZUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsaW5lSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6IGdldExpbmVHcmFwaE5hbWUobGluZUl0ZW0pLFxuICAgIGluZGV4OiByTGV2ZWwgKyAxLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldExpbmVBbmRBcmVhU2hhcGUobGluZUl0ZW0pLFxuICAgIHN0eWxlOiBnZXRMaW5lU3R5bGUobGluZUl0ZW0pXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lR3JhcGhOYW1lKGxpbmVJdGVtKSB7XG4gIHZhciBzbW9vdGggPSBsaW5lSXRlbS5zbW9vdGg7XG4gIHJldHVybiBzbW9vdGggPyAnc21vb3RobGluZScgOiAncG9seWxpbmUnO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lU3R5bGUobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVTdHlsZSA9IGxpbmVJdGVtLmxpbmVTdHlsZSxcbiAgICAgIGNvbG9yID0gbGluZUl0ZW0uY29sb3IsXG4gICAgICBzbW9vdGggPSBsaW5lSXRlbS5zbW9vdGgsXG4gICAgICBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb247XG4gIHZhciBsaW5lTGVuZ3RoID0gZ2V0TGluZUxlbmd0aChsaW5lUG9zaXRpb24sIHNtb290aCk7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvcixcbiAgICBsaW5lRGFzaDogW2xpbmVMZW5ndGgsIDBdXG4gIH0sIGxpbmVTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVMZW5ndGgocG9pbnRzKSB7XG4gIHZhciBzbW9vdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICBpZiAoIXNtb290aCkgcmV0dXJuICgwLCBfdXRpbC5nZXRQb2x5bGluZUxlbmd0aCkocG9pbnRzKTtcbiAgdmFyIGN1cnZlID0gcG9seWxpbmVUb0JlemllckN1cnZlKHBvaW50cyk7XG4gIHJldHVybiBnZXRCZXppZXJDdXJ2ZUxlbmd0aChjdXJ2ZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0TGluZUNvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgbGluZURhc2ggPSBsaW5lSXRlbS5saW5lU3R5bGUubGluZURhc2g7XG4gIHZhciBjb25maWcgPSBnZXRMaW5lQ29uZmlnKGxpbmVJdGVtKVswXTtcbiAgdmFyIHJlYWxMaW5lRGFzaCA9IGNvbmZpZy5zdHlsZS5saW5lRGFzaDtcblxuICBpZiAobGluZURhc2gpIHtcbiAgICByZWFsTGluZURhc2ggPSBbMCwgMF07XG4gIH0gZWxzZSB7XG4gICAgcmVhbExpbmVEYXNoID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyZWFsTGluZURhc2gpLnJldmVyc2UoKTtcbiAgfVxuXG4gIGNvbmZpZy5zdHlsZS5saW5lRGFzaCA9IHJlYWxMaW5lRGFzaDtcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludENvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsaW5lSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRQb2ludFNoYXBlcyhsaW5lSXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldFBvaW50U3R5bGUobGluZUl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ2NpcmNsZScsXG4gICAgICBpbmRleDogckxldmVsICsgMixcbiAgICAgIHZpc2libGU6IGxpbmVJdGVtLmxpbmVQb2ludC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50U2hhcGVzKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb24sXG4gICAgICByYWRpdXMgPSBsaW5lSXRlbS5saW5lUG9pbnQucmFkaXVzO1xuICByZXR1cm4gbGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICB2YXIgX3JlZjggPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjcsIDIpLFxuICAgICAgICByeCA9IF9yZWY4WzBdLFxuICAgICAgICByeSA9IF9yZWY4WzFdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHJhZGl1cyxcbiAgICAgIHJ4OiByeCxcbiAgICAgIHJ5OiByeVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFN0eWxlKGxpbmVJdGVtKSB7XG4gIHZhciBjb2xvciA9IGxpbmVJdGVtLmNvbG9yLFxuICAgICAgc3R5bGUgPSBsaW5lSXRlbS5saW5lUG9pbnQuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvclxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0UG9pbnRDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRQb2ludENvbmZpZyhsaW5lSXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgY29uZmlnLnNoYXBlLnIgPSAwLjE7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gbGluZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGluZUl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0TGFiZWxTaGFwZXMobGluZUl0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRMYWJlbFN0eWxlKGxpbmVJdGVtKTtcbiAgcmV0dXJuIHNoYXBlcy5tYXAoZnVuY3Rpb24gKHNoYXBlLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwgKyAzLFxuICAgICAgdmlzaWJsZTogbGluZUl0ZW0ubGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgIHN0eWxlOiBzdHlsZVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlcyhsaW5lSXRlbSkge1xuICB2YXIgY29udGVudHMgPSBmb3JtYXR0ZXJMYWJlbChsaW5lSXRlbSk7XG4gIHZhciBwb3NpdGlvbiA9IGdldExhYmVsUG9zaXRpb24obGluZUl0ZW0pO1xuICByZXR1cm4gY29udGVudHMubWFwKGZ1bmN0aW9uIChjb250ZW50LCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25baV1cbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxQb3NpdGlvbihsaW5lSXRlbSkge1xuICB2YXIgbGluZVBvc2l0aW9uID0gbGluZUl0ZW0ubGluZVBvc2l0aW9uLFxuICAgICAgbGluZUZpbGxCb3R0b21Qb3MgPSBsaW5lSXRlbS5saW5lRmlsbEJvdHRvbVBvcyxcbiAgICAgIGxhYmVsID0gbGluZUl0ZW0ubGFiZWw7XG4gIHZhciBwb3NpdGlvbiA9IGxhYmVsLnBvc2l0aW9uLFxuICAgICAgb2Zmc2V0ID0gbGFiZWwub2Zmc2V0O1xuICB2YXIgY2hhbmdlSW5kZXggPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VJbmRleCxcbiAgICAgIGNoYW5nZVZhbHVlID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlVmFsdWU7XG4gIHJldHVybiBsaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb3MpIHtcbiAgICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICBwb3MgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvcyk7XG4gICAgICBwb3NbY2hhbmdlSW5kZXhdID0gY2hhbmdlVmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uID09PSAnY2VudGVyJykge1xuICAgICAgdmFyIGJvdHRvbSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zKTtcbiAgICAgIGJvdHRvbVtjaGFuZ2VJbmRleF0gPSBjaGFuZ2VWYWx1ZTtcbiAgICAgIHBvcyA9IGdldENlbnRlckxhYmVsUG9pbnQocG9zLCBib3R0b20pO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRPZmZzZXRlZFBvaW50KHBvcywgb2Zmc2V0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldE9mZnNldGVkUG9pbnQoX3JlZjksIF9yZWYxMCkge1xuICB2YXIgX3JlZjExID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY5LCAyKSxcbiAgICAgIHggPSBfcmVmMTFbMF0sXG4gICAgICB5ID0gX3JlZjExWzFdO1xuXG4gIHZhciBfcmVmMTIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLCAyKSxcbiAgICAgIG94ID0gX3JlZjEyWzBdLFxuICAgICAgb3kgPSBfcmVmMTJbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldENlbnRlckxhYmVsUG9pbnQoX3JlZjEzLCBfcmVmMTQpIHtcbiAgdmFyIF9yZWYxNSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTMsIDIpLFxuICAgICAgYXggPSBfcmVmMTVbMF0sXG4gICAgICBheSA9IF9yZWYxNVsxXTtcblxuICB2YXIgX3JlZjE2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxNCwgMiksXG4gICAgICBieCA9IF9yZWYxNlswXSxcbiAgICAgIGJ5ID0gX3JlZjE2WzFdO1xuXG4gIHJldHVybiBbKGF4ICsgYngpIC8gMiwgKGF5ICsgYnkpIC8gMl07XG59XG5cbmZ1bmN0aW9uIGZvcm1hdHRlckxhYmVsKGxpbmVJdGVtKSB7XG4gIHZhciBkYXRhID0gbGluZUl0ZW0uZGF0YSxcbiAgICAgIGZvcm1hdHRlciA9IGxpbmVJdGVtLmxhYmVsLmZvcm1hdHRlcjtcbiAgZGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAnbnVtYmVyJztcbiAgfSkubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQudG9TdHJpbmcoKTtcbiAgfSk7XG4gIGlmICghZm9ybWF0dGVyKSByZXR1cm4gZGF0YTtcbiAgdmFyIHR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsIGQpO1xuICB9KTtcbiAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlcih7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBpbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFN0eWxlKGxpbmVJdGVtKSB7XG4gIHZhciBjb2xvciA9IGxpbmVJdGVtLmNvbG9yLFxuICAgICAgc3R5bGUgPSBsaW5lSXRlbS5sYWJlbC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLm1lcmdlQ29sb3IgPSBtZXJnZUNvbG9yO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBtZXJnZUNvbG9yKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgZGVmYXVsdENvbG9yID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy5jb2xvckNvbmZpZywgdHJ1ZSk7XG4gIHZhciBjb2xvciA9IG9wdGlvbi5jb2xvcixcbiAgICAgIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgaWYgKCFjb2xvcikgY29sb3IgPSBbXTtcbiAgb3B0aW9uLmNvbG9yID0gY29sb3IgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoZGVmYXVsdENvbG9yLCBjb2xvcik7XG4gIGlmICghc2VyaWVzLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgaWYgKGl0ZW0uY29sb3IpIHJldHVybjtcbiAgICBpdGVtLmNvbG9yID0gY29sb3JbaSAlIGNvbG9yTnVtXTtcbiAgfSk7XG4gIHZhciBwaWVzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciB0eXBlID0gX3JlZi50eXBlO1xuICAgIHJldHVybiB0eXBlID09PSAncGllJztcbiAgfSk7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgcmV0dXJuIHBpZS5kYXRhLmZvckVhY2goZnVuY3Rpb24gKGRpLCBpKSB7XG4gICAgICByZXR1cm4gZGkuY29sb3IgPSBjb2xvcltpICUgY29sb3JOdW1dO1xuICAgIH0pO1xuICB9KTtcbiAgdmFyIGdhdWdlcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIHR5cGUgPSBfcmVmMi50eXBlO1xuICAgIHJldHVybiB0eXBlID09PSAnZ2F1Z2UnO1xuICB9KTtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlKSB7XG4gICAgcmV0dXJuIGdhdWdlLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZGksIGkpIHtcbiAgICAgIHJldHVybiBkaS5jb2xvciA9IGNvbG9yW2kgJSBjb2xvck51bV07XG4gICAgfSk7XG4gIH0pO1xuICB2YXIgYmFyV2l0aEluZGVwZW5kZW50Q29sb3IgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMykge1xuICAgIHZhciB0eXBlID0gX3JlZjMudHlwZSxcbiAgICAgICAgaW5kZXBlbmRlbnRDb2xvciA9IF9yZWYzLmluZGVwZW5kZW50Q29sb3I7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdiYXInICYmIGluZGVwZW5kZW50Q29sb3I7XG4gIH0pO1xuICBiYXJXaXRoSW5kZXBlbmRlbnRDb2xvci5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICBpZiAoYmFyLmluZGVwZW5kZW50Q29sb3JzKSByZXR1cm47XG4gICAgYmFyLmluZGVwZW5kZW50Q29sb3JzID0gY29sb3I7XG4gIH0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucGllID0gcGllO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9waWUgPSByZXF1aXJlKFwiLi4vY29uZmlnL3BpZVwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiBwaWUoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICBpZiAoIXNlcmllcykgc2VyaWVzID0gW107XG4gIHZhciBwaWVzID0gKDAsIF91dGlsMi5pbml0TmVlZFNlcmllcykoc2VyaWVzLCBfcGllLnBpZUNvbmZpZywgJ3BpZScpO1xuICBwaWVzID0gY2FsY1BpZXNDZW50ZXIocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1BpZXNSYWRpdXMocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1Jvc2VQaWVzUmFkaXVzKHBpZXMsIGNoYXJ0KTtcbiAgcGllcyA9IGNhbGNQaWVzUGVyY2VudChwaWVzKTtcbiAgcGllcyA9IGNhbGNQaWVzQW5nbGUocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1BpZXNJbnNpZGVMYWJlbFBvcyhwaWVzKTtcbiAgcGllcyA9IGNhbGNQaWVzRWRnZUNlbnRlclBvcyhwaWVzKTtcbiAgcGllcyA9IGNhbGNQaWVzT3V0U2lkZUxhYmVsUG9zKHBpZXMpO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBwaWVzLFxuICAgIGtleTogJ3BpZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFBpZUNvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBpZUNvbmZpZyxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZVBpZVxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcGllcyxcbiAgICBrZXk6ICdwaWVJbnNpZGVMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEluc2lkZUxhYmVsQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBwaWVzLFxuICAgIGtleTogJ3BpZU91dHNpZGVMYWJlbExpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0T3V0c2lkZUxhYmVsTGluZUNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcGllcyxcbiAgICBrZXk6ICdwaWVPdXRzaWRlTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRPdXRzaWRlTGFiZWxDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRPdXRzaWRlTGFiZWxDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzQ2VudGVyKHBpZXMsIGNoYXJ0KSB7XG4gIHZhciBhcmVhID0gY2hhcnQucmVuZGVyLmFyZWE7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIGNlbnRlciA9IHBpZS5jZW50ZXI7XG4gICAgY2VudGVyID0gY2VudGVyLm1hcChmdW5jdGlvbiAocG9zLCBpKSB7XG4gICAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ251bWJlcicpIHJldHVybiBwb3M7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocG9zKSAvIDEwMCAqIGFyZWFbaV07XG4gICAgfSk7XG4gICAgcGllLmNlbnRlciA9IGNlbnRlcjtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc1JhZGl1cyhwaWVzLCBjaGFydCkge1xuICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjaGFydC5yZW5kZXIuYXJlYSkpIC8gMjtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgcmFkaXVzID0gcGllLnJhZGl1cyxcbiAgICAgICAgZGF0YSA9IHBpZS5kYXRhO1xuICAgIHJhZGl1cyA9IGdldE51bWJlclJhZGl1cyhyYWRpdXMsIG1heFJhZGl1cyk7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgaXRlbVJhZGl1cyA9IGl0ZW0ucmFkaXVzO1xuICAgICAgaWYgKCFpdGVtUmFkaXVzKSBpdGVtUmFkaXVzID0gcmFkaXVzO1xuICAgICAgaXRlbVJhZGl1cyA9IGdldE51bWJlclJhZGl1cyhpdGVtUmFkaXVzLCBtYXhSYWRpdXMpO1xuICAgICAgaXRlbS5yYWRpdXMgPSBpdGVtUmFkaXVzO1xuICAgIH0pO1xuICAgIHBpZS5yYWRpdXMgPSByYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0TnVtYmVyUmFkaXVzKHJhZGl1cywgbWF4UmFkaXVzKSB7XG4gIGlmICghKHJhZGl1cyBpbnN0YW5jZW9mIEFycmF5KSkgcmFkaXVzID0gWzAsIHJhZGl1c107XG4gIHJhZGl1cyA9IHJhZGl1cy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICBpZiAodHlwZW9mIHIgPT09ICdudW1iZXInKSByZXR1cm4gcjtcbiAgICByZXR1cm4gcGFyc2VJbnQocikgLyAxMDAgKiBtYXhSYWRpdXM7XG4gIH0pO1xuICByZXR1cm4gcmFkaXVzO1xufVxuXG5mdW5jdGlvbiBjYWxjUm9zZVBpZXNSYWRpdXMocGllcywgY2hhcnQpIHtcbiAgdmFyIHJvc2VQaWUgPSBwaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciByb3NlVHlwZSA9IF9yZWYucm9zZVR5cGU7XG4gICAgcmV0dXJuIHJvc2VUeXBlO1xuICB9KTtcbiAgcm9zZVBpZS5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgcmFkaXVzID0gcGllLnJhZGl1cyxcbiAgICAgICAgZGF0YSA9IHBpZS5kYXRhLFxuICAgICAgICByb3NlU29ydCA9IHBpZS5yb3NlU29ydDtcbiAgICB2YXIgcm9zZUluY3JlbWVudCA9IGdldFJvc2VJbmNyZW1lbnQocGllKTtcbiAgICB2YXIgZGF0YUNvcHkgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGRhdGEpO1xuICAgIGRhdGEgPSBzb3J0RGF0YShkYXRhKTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIGl0ZW0ucmFkaXVzWzFdID0gcmFkaXVzWzFdIC0gcm9zZUluY3JlbWVudCAqIGk7XG4gICAgfSk7XG5cbiAgICBpZiAocm9zZVNvcnQpIHtcbiAgICAgIGRhdGEucmV2ZXJzZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwaWUuZGF0YSA9IGRhdGFDb3B5O1xuICAgIH1cblxuICAgIHBpZS5yb3NlSW5jcmVtZW50ID0gcm9zZUluY3JlbWVudDtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBzb3J0RGF0YShkYXRhKSB7XG4gIHJldHVybiBkYXRhLnNvcnQoZnVuY3Rpb24gKF9yZWYyLCBfcmVmMykge1xuICAgIHZhciBhID0gX3JlZjIudmFsdWU7XG4gICAgdmFyIGIgPSBfcmVmMy52YWx1ZTtcbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIDA7XG4gICAgaWYgKGEgPiBiKSByZXR1cm4gLTE7XG4gICAgaWYgKGEgPCBiKSByZXR1cm4gMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFJvc2VJbmNyZW1lbnQocGllKSB7XG4gIHZhciByYWRpdXMgPSBwaWUucmFkaXVzLFxuICAgICAgcm9zZUluY3JlbWVudCA9IHBpZS5yb3NlSW5jcmVtZW50O1xuICBpZiAodHlwZW9mIHJvc2VJbmNyZW1lbnQgPT09ICdudW1iZXInKSByZXR1cm4gcm9zZUluY3JlbWVudDtcblxuICBpZiAocm9zZUluY3JlbWVudCA9PT0gJ2F1dG8nKSB7XG4gICAgdmFyIGRhdGEgPSBwaWUuZGF0YTtcbiAgICB2YXIgYWxsUmFkaXVzID0gZGF0YS5yZWR1Y2UoZnVuY3Rpb24gKGFsbCwgX3JlZjQpIHtcbiAgICAgIHZhciByYWRpdXMgPSBfcmVmNC5yYWRpdXM7XG4gICAgICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyYWRpdXMpKTtcbiAgICB9LCBbXSk7XG4gICAgdmFyIG1pblJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsUmFkaXVzKSk7XG4gICAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYWxsUmFkaXVzKSk7XG4gICAgcmV0dXJuIChtYXhSYWRpdXMgLSBtaW5SYWRpdXMpICogMC42IC8gKGRhdGEubGVuZ3RoIC0gMSB8fCAxKTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZUludChyb3NlSW5jcmVtZW50KSAvIDEwMCAqIHJhZGl1c1sxXTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNQZXJjZW50KHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgZGF0YSA9IHBpZS5kYXRhLFxuICAgICAgICBwZXJjZW50VG9GaXhlZCA9IHBpZS5wZXJjZW50VG9GaXhlZDtcbiAgICB2YXIgc3VtID0gZ2V0RGF0YVN1bShkYXRhKTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW0udmFsdWU7XG4gICAgICBpdGVtLnBlcmNlbnQgPSB0b0ZpeGVkTm9DZWlsKHZhbHVlIC8gc3VtICogMTAwLCBwZXJjZW50VG9GaXhlZCk7XG4gICAgfSk7XG4gICAgdmFyIHBlcmNlbnRTdW1Ob0xhc3QgPSAoMCwgX3V0aWwyLm11bEFkZCkoZGF0YS5zbGljZSgwLCAtMSkubWFwKGZ1bmN0aW9uIChfcmVmNSkge1xuICAgICAgdmFyIHBlcmNlbnQgPSBfcmVmNS5wZXJjZW50O1xuICAgICAgcmV0dXJuIHBlcmNlbnQ7XG4gICAgfSkpO1xuICAgIGRhdGEuc2xpY2UoLTEpWzBdLnBlcmNlbnQgPSB0b0ZpeGVkTm9DZWlsKDEwMCAtIHBlcmNlbnRTdW1Ob0xhc3QsIHBlcmNlbnRUb0ZpeGVkKTtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiB0b0ZpeGVkTm9DZWlsKG51bWJlcikge1xuICB2YXIgdG9GaXhlZCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIHN0cmluZ051bWJlciA9IG51bWJlci50b1N0cmluZygpO1xuICB2YXIgc3BsaXRlZE51bWJlciA9IHN0cmluZ051bWJlci5zcGxpdCgnLicpO1xuICB2YXIgZGVjaW1hbCA9IHNwbGl0ZWROdW1iZXJbMV0gfHwgJzAnO1xuICB2YXIgZml4ZWREZWNpbWFsID0gZGVjaW1hbC5zbGljZSgwLCB0b0ZpeGVkKTtcbiAgc3BsaXRlZE51bWJlclsxXSA9IGZpeGVkRGVjaW1hbDtcbiAgcmV0dXJuIHBhcnNlRmxvYXQoc3BsaXRlZE51bWJlci5qb2luKCcuJykpO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhU3VtKGRhdGEpIHtcbiAgcmV0dXJuICgwLCBfdXRpbDIubXVsQWRkKShkYXRhLm1hcChmdW5jdGlvbiAoX3JlZjYpIHtcbiAgICB2YXIgdmFsdWUgPSBfcmVmNi52YWx1ZTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNBbmdsZShwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIHN0YXJ0ID0gcGllLnN0YXJ0QW5nbGUsXG4gICAgICAgIGRhdGEgPSBwaWUuZGF0YTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIHZhciBfZ2V0RGF0YUFuZ2xlID0gZ2V0RGF0YUFuZ2xlKGRhdGEsIGkpLFxuICAgICAgICAgIF9nZXREYXRhQW5nbGUyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXREYXRhQW5nbGUsIDIpLFxuICAgICAgICAgIHN0YXJ0QW5nbGUgPSBfZ2V0RGF0YUFuZ2xlMlswXSxcbiAgICAgICAgICBlbmRBbmdsZSA9IF9nZXREYXRhQW5nbGUyWzFdO1xuXG4gICAgICBpdGVtLnN0YXJ0QW5nbGUgPSBzdGFydCArIHN0YXJ0QW5nbGU7XG4gICAgICBpdGVtLmVuZEFuZ2xlID0gc3RhcnQgKyBlbmRBbmdsZTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhQW5nbGUoZGF0YSwgaSkge1xuICB2YXIgZnVsbEFuZ2xlID0gTWF0aC5QSSAqIDI7XG4gIHZhciBuZWVkQWRkRGF0YSA9IGRhdGEuc2xpY2UoMCwgaSArIDEpO1xuICB2YXIgcGVyY2VudFN1bSA9ICgwLCBfdXRpbDIubXVsQWRkKShuZWVkQWRkRGF0YS5tYXAoZnVuY3Rpb24gKF9yZWY3KSB7XG4gICAgdmFyIHBlcmNlbnQgPSBfcmVmNy5wZXJjZW50O1xuICAgIHJldHVybiBwZXJjZW50O1xuICB9KSk7XG4gIHZhciBwZXJjZW50ID0gZGF0YVtpXS5wZXJjZW50O1xuICB2YXIgc3RhcnRQZXJjZW50ID0gcGVyY2VudFN1bSAtIHBlcmNlbnQ7XG4gIHJldHVybiBbZnVsbEFuZ2xlICogc3RhcnRQZXJjZW50IC8gMTAwLCBmdWxsQW5nbGUgKiBwZXJjZW50U3VtIC8gMTAwXTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNJbnNpZGVMYWJlbFBvcyhwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllSXRlbSkge1xuICAgIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaXRlbS5pbnNpZGVMYWJlbFBvcyA9IGdldFBpZUluc2lkZUxhYmVsUG9zKHBpZUl0ZW0sIGl0ZW0pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGdldFBpZUluc2lkZUxhYmVsUG9zKHBpZUl0ZW0sIGRhdGFJdGVtKSB7XG4gIHZhciBjZW50ZXIgPSBwaWVJdGVtLmNlbnRlcjtcblxuICB2YXIgc3RhcnRBbmdsZSA9IGRhdGFJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGRhdGFJdGVtLmVuZEFuZ2xlLFxuICAgICAgX2RhdGFJdGVtJHJhZGl1cyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShkYXRhSXRlbS5yYWRpdXMsIDIpLFxuICAgICAgaXIgPSBfZGF0YUl0ZW0kcmFkaXVzWzBdLFxuICAgICAgb3IgPSBfZGF0YUl0ZW0kcmFkaXVzWzFdO1xuXG4gIHZhciByYWRpdXMgPSAoaXIgKyBvcikgLyAyO1xuICB2YXIgYW5nbGUgPSAoc3RhcnRBbmdsZSArIGVuZEFuZ2xlKSAvIDI7XG4gIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1cywgYW5nbGVdKSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzRWRnZUNlbnRlclBvcyhwaWVzKSB7XG4gIHBpZXMuZm9yRWFjaChmdW5jdGlvbiAocGllKSB7XG4gICAgdmFyIGRhdGEgPSBwaWUuZGF0YSxcbiAgICAgICAgY2VudGVyID0gcGllLmNlbnRlcjtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBzdGFydEFuZ2xlID0gaXRlbS5zdGFydEFuZ2xlLFxuICAgICAgICAgIGVuZEFuZ2xlID0gaXRlbS5lbmRBbmdsZSxcbiAgICAgICAgICByYWRpdXMgPSBpdGVtLnJhZGl1cztcbiAgICAgIHZhciBjZW50ZXJBbmdsZSA9IChzdGFydEFuZ2xlICsgZW5kQW5nbGUpIC8gMjtcblxuICAgICAgdmFyIHBvcyA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzWzFdLCBjZW50ZXJBbmdsZV0pKTtcblxuICAgICAgaXRlbS5lZGdlQ2VudGVyUG9zID0gcG9zO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzT3V0U2lkZUxhYmVsUG9zKHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWVJdGVtKSB7XG4gICAgdmFyIGxlZnRQaWVEYXRhSXRlbXMgPSBnZXRMZWZ0T3JSaWdodFBpZURhdGFJdGVtcyhwaWVJdGVtKTtcbiAgICB2YXIgcmlnaHRQaWVEYXRhSXRlbXMgPSBnZXRMZWZ0T3JSaWdodFBpZURhdGFJdGVtcyhwaWVJdGVtLCBmYWxzZSk7XG4gICAgbGVmdFBpZURhdGFJdGVtcyA9IHNvcnRQaWVzRnJvbVRvcFRvQm90dG9tKGxlZnRQaWVEYXRhSXRlbXMpO1xuICAgIHJpZ2h0UGllRGF0YUl0ZW1zID0gc29ydFBpZXNGcm9tVG9wVG9Cb3R0b20ocmlnaHRQaWVEYXRhSXRlbXMpO1xuICAgIGFkZExhYmVsTGluZUFuZEFsaWduKGxlZnRQaWVEYXRhSXRlbXMsIHBpZUl0ZW0pO1xuICAgIGFkZExhYmVsTGluZUFuZEFsaWduKHJpZ2h0UGllRGF0YUl0ZW1zLCBwaWVJdGVtLCBmYWxzZSk7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxMaW5lQmVuZFJhZGl1cyhwaWVJdGVtKSB7XG4gIHZhciBsYWJlbExpbmVCZW5kR2FwID0gcGllSXRlbS5vdXRzaWRlTGFiZWwubGFiZWxMaW5lQmVuZEdhcDtcbiAgdmFyIG1heFJhZGl1cyA9IGdldFBpZU1heFJhZGl1cyhwaWVJdGVtKTtcblxuICBpZiAodHlwZW9mIGxhYmVsTGluZUJlbmRHYXAgIT09ICdudW1iZXInKSB7XG4gICAgbGFiZWxMaW5lQmVuZEdhcCA9IHBhcnNlSW50KGxhYmVsTGluZUJlbmRHYXApIC8gMTAwICogbWF4UmFkaXVzO1xuICB9XG5cbiAgcmV0dXJuIGxhYmVsTGluZUJlbmRHYXAgKyBtYXhSYWRpdXM7XG59XG5cbmZ1bmN0aW9uIGdldFBpZU1heFJhZGl1cyhwaWVJdGVtKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgcmFkaXVzID0gZGF0YS5tYXAoZnVuY3Rpb24gKF9yZWY4KSB7XG4gICAgdmFyIF9yZWY4JHJhZGl1cyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmOC5yYWRpdXMsIDIpLFxuICAgICAgICBmb28gPSBfcmVmOCRyYWRpdXNbMF0sXG4gICAgICAgIHIgPSBfcmVmOCRyYWRpdXNbMV07XG5cbiAgICByZXR1cm4gcjtcbiAgfSk7XG4gIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHJhZGl1cykpO1xufVxuXG5mdW5jdGlvbiBnZXRMZWZ0T3JSaWdodFBpZURhdGFJdGVtcyhwaWVJdGVtKSB7XG4gIHZhciBsZWZ0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB0cnVlO1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIGNlbnRlciA9IHBpZUl0ZW0uY2VudGVyO1xuICB2YXIgY2VudGVyWFBvcyA9IGNlbnRlclswXTtcbiAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChfcmVmOSkge1xuICAgIHZhciBlZGdlQ2VudGVyUG9zID0gX3JlZjkuZWRnZUNlbnRlclBvcztcbiAgICB2YXIgeFBvcyA9IGVkZ2VDZW50ZXJQb3NbMF07XG4gICAgaWYgKGxlZnQpIHJldHVybiB4UG9zIDw9IGNlbnRlclhQb3M7XG4gICAgcmV0dXJuIHhQb3MgPiBjZW50ZXJYUG9zO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc29ydFBpZXNGcm9tVG9wVG9Cb3R0b20oZGF0YUl0ZW0pIHtcbiAgZGF0YUl0ZW0uc29ydChmdW5jdGlvbiAoX3JlZjEwLCBfcmVmMTEpIHtcbiAgICB2YXIgX3JlZjEwJGVkZ2VDZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLmVkZ2VDZW50ZXJQb3MsIDIpLFxuICAgICAgICB0ID0gX3JlZjEwJGVkZ2VDZW50ZXJQb3NbMF0sXG4gICAgICAgIGF5ID0gX3JlZjEwJGVkZ2VDZW50ZXJQb3NbMV07XG5cbiAgICB2YXIgX3JlZjExJGVkZ2VDZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjExLmVkZ2VDZW50ZXJQb3MsIDIpLFxuICAgICAgICB0dCA9IF9yZWYxMSRlZGdlQ2VudGVyUG9zWzBdLFxuICAgICAgICBieSA9IF9yZWYxMSRlZGdlQ2VudGVyUG9zWzFdO1xuXG4gICAgaWYgKGF5ID4gYnkpIHJldHVybiAxO1xuICAgIGlmIChheSA8IGJ5KSByZXR1cm4gLTE7XG4gICAgaWYgKGF5ID09PSBieSkgcmV0dXJuIDA7XG4gIH0pO1xuICByZXR1cm4gZGF0YUl0ZW07XG59XG5cbmZ1bmN0aW9uIGFkZExhYmVsTGluZUFuZEFsaWduKGRhdGFJdGVtLCBwaWVJdGVtKSB7XG4gIHZhciBsZWZ0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB0cnVlO1xuICB2YXIgY2VudGVyID0gcGllSXRlbS5jZW50ZXIsXG4gICAgICBvdXRzaWRlTGFiZWwgPSBwaWVJdGVtLm91dHNpZGVMYWJlbDtcbiAgdmFyIHJhZGl1cyA9IGdldExhYmVsTGluZUJlbmRSYWRpdXMocGllSXRlbSk7XG4gIGRhdGFJdGVtLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgZWRnZUNlbnRlclBvcyA9IGl0ZW0uZWRnZUNlbnRlclBvcyxcbiAgICAgICAgc3RhcnRBbmdsZSA9IGl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBpdGVtLmVuZEFuZ2xlO1xuICAgIHZhciBsYWJlbExpbmVFbmRMZW5ndGggPSBvdXRzaWRlTGFiZWwubGFiZWxMaW5lRW5kTGVuZ3RoO1xuICAgIHZhciBhbmdsZSA9IChzdGFydEFuZ2xlICsgZW5kQW5nbGUpIC8gMjtcblxuICAgIHZhciBiZW5kUG9pbnQgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1cywgYW5nbGVdKSk7XG5cbiAgICB2YXIgZW5kUG9pbnQgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGJlbmRQb2ludCk7XG4gICAgZW5kUG9pbnRbMF0gKz0gbGFiZWxMaW5lRW5kTGVuZ3RoICogKGxlZnQgPyAtMSA6IDEpO1xuICAgIGl0ZW0ubGFiZWxMaW5lID0gW2VkZ2VDZW50ZXJQb3MsIGJlbmRQb2ludCwgZW5kUG9pbnRdO1xuICAgIGl0ZW0ubGFiZWxMaW5lTGVuZ3RoID0gKDAsIF91dGlsMi5nZXRQb2x5bGluZUxlbmd0aCkoaXRlbS5sYWJlbExpbmUpO1xuICAgIGl0ZW0uYWxpZ24gPSB7XG4gICAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9O1xuICAgIGlmIChsZWZ0KSBpdGVtLmFsaWduLnRleHRBbGlnbiA9ICdyaWdodCc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRQaWVDb25maWcocGllSXRlbSkge1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHBpZUl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncGllJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0UGllU2hhcGUocGllSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0UGllU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQaWVDb25maWcocGllSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uRGVsYXlHYXAgPSBwaWVJdGVtLmFuaW1hdGlvbkRlbGF5R2FwLFxuICAgICAgc3RhcnRBbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uc3RhcnRBbmltYXRpb25DdXJ2ZTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRQaWVDb25maWcocGllSXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnLCBpKSB7XG4gICAgY29uZmlnLmFuaW1hdGlvbkN1cnZlID0gc3RhcnRBbmltYXRpb25DdXJ2ZTtcbiAgICBjb25maWcuYW5pbWF0aW9uRGVsYXkgPSBpICogYW5pbWF0aW9uRGVsYXlHYXA7XG4gICAgY29uZmlnLnNoYXBlLm9yID0gY29uZmlnLnNoYXBlLmlyO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZVBpZShncmFwaCkge1xuICBncmFwaC5hbmltYXRpb25EZWxheSA9IDA7XG59XG5cbmZ1bmN0aW9uIGdldFBpZVNoYXBlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIGNlbnRlciA9IHBpZUl0ZW0uY2VudGVyLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGRhdGFJdGVtID0gZGF0YVtpXTtcbiAgdmFyIHJhZGl1cyA9IGRhdGFJdGVtLnJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUgPSBkYXRhSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBkYXRhSXRlbS5lbmRBbmdsZTtcbiAgcmV0dXJuIHtcbiAgICBzdGFydEFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlOiBlbmRBbmdsZSxcbiAgICBpcjogcmFkaXVzWzBdLFxuICAgIG9yOiByYWRpdXNbMV0sXG4gICAgcng6IGNlbnRlclswXSxcbiAgICByeTogY2VudGVyWzFdXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFBpZVN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIHBpZVN0eWxlID0gcGllSXRlbS5waWVTdHlsZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBkYXRhSXRlbSA9IGRhdGFbaV07XG4gIHZhciBjb2xvciA9IGRhdGFJdGVtLmNvbG9yO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBwaWVTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEluc2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICByTGV2ZWwgPSBwaWVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHBpZUl0ZW0uaW5zaWRlTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRJbnNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEluc2lkZUxhYmVsU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5zaWRlTGFiZWxTaGFwZShwaWVJdGVtLCBpKSB7XG4gIHZhciBpbnNpZGVMYWJlbCA9IHBpZUl0ZW0uaW5zaWRlTGFiZWwsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZm9ybWF0dGVyID0gaW5zaWRlTGFiZWwuZm9ybWF0dGVyO1xuICB2YXIgZGF0YUl0ZW0gPSBkYXRhW2ldO1xuICB2YXIgZm9ybWF0dGVyVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gIHZhciBsYWJlbCA9ICcnO1xuXG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykge1xuICAgIGxhYmVsID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3tuYW1lfScsIGRhdGFJdGVtLm5hbWUpO1xuICAgIGxhYmVsID0gbGFiZWwucmVwbGFjZSgne3BlcmNlbnR9JywgZGF0YUl0ZW0ucGVyY2VudCk7XG4gICAgbGFiZWwgPSBsYWJlbC5yZXBsYWNlKCd7dmFsdWV9JywgZGF0YUl0ZW0udmFsdWUpO1xuICB9XG5cbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICBsYWJlbCA9IGZvcm1hdHRlcihkYXRhSXRlbSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGxhYmVsLFxuICAgIHBvc2l0aW9uOiBkYXRhSXRlbS5pbnNpZGVMYWJlbFBvc1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRJbnNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIHN0eWxlID0gcGllSXRlbS5pbnNpZGVMYWJlbC5zdHlsZTtcbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICByTGV2ZWwgPSBwaWVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBwaWVJdGVtLm91dHNpZGVMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldE91dHNpZGVMYWJlbExpbmVTaGFwZShwaWVJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRPdXRzaWRlTGFiZWxMaW5lU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBjb25maWdzID0gZ2V0T3V0c2lkZUxhYmVsTGluZUNvbmZpZyhwaWVJdGVtKTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcsIGkpIHtcbiAgICBjb25maWcuc3R5bGUubGluZURhc2ggPSBbMCwgZGF0YVtpXS5sYWJlbExpbmVMZW5ndGhdO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbExpbmVTaGFwZShwaWVJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZGF0YUl0ZW0gPSBkYXRhW2ldO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogZGF0YUl0ZW0ubGFiZWxMaW5lXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbExpbmVTdHlsZShwaWVJdGVtLCBpKSB7XG4gIHZhciBvdXRzaWRlTGFiZWwgPSBwaWVJdGVtLm91dHNpZGVMYWJlbCxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBsYWJlbExpbmVTdHlsZSA9IG91dHNpZGVMYWJlbC5sYWJlbExpbmVTdHlsZTtcbiAgdmFyIGNvbG9yID0gZGF0YVtpXS5jb2xvcjtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvcixcbiAgICBsaW5lRGFzaDogW2RhdGFbaV0ubGFiZWxMaW5lTGVuZ3RoLCAwXVxuICB9LCBsYWJlbExpbmVTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbENvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IHBpZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHBpZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhLFxuICAgICAgckxldmVsID0gcGllSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBwaWVJdGVtLm91dHNpZGVMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldE91dHNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldE91dHNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0T3V0c2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBjb25maWdzID0gZ2V0T3V0c2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZywgaSkge1xuICAgIGNvbmZpZy5zaGFwZS5wb3NpdGlvbiA9IGRhdGFbaV0ubGFiZWxMaW5lWzFdO1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIG91dHNpZGVMYWJlbCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGZvcm1hdHRlciA9IG91dHNpZGVMYWJlbC5mb3JtYXR0ZXI7XG4gIHZhciBfZGF0YSRpID0gZGF0YVtpXSxcbiAgICAgIGxhYmVsTGluZSA9IF9kYXRhJGkubGFiZWxMaW5lLFxuICAgICAgbmFtZSA9IF9kYXRhJGkubmFtZSxcbiAgICAgIHBlcmNlbnQgPSBfZGF0YSRpLnBlcmNlbnQsXG4gICAgICB2YWx1ZSA9IF9kYXRhJGkudmFsdWU7XG4gIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgdmFyIGxhYmVsID0gJyc7XG5cbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbGFiZWwgPSBmb3JtYXR0ZXIucmVwbGFjZSgne25hbWV9JywgbmFtZSk7XG4gICAgbGFiZWwgPSBsYWJlbC5yZXBsYWNlKCd7cGVyY2VudH0nLCBwZXJjZW50KTtcbiAgICBsYWJlbCA9IGxhYmVsLnJlcGxhY2UoJ3t2YWx1ZX0nLCB2YWx1ZSk7XG4gIH1cblxuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxhYmVsID0gZm9ybWF0dGVyKGRhdGFbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBsYWJlbCxcbiAgICBwb3NpdGlvbjogbGFiZWxMaW5lWzJdXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbFN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIG91dHNpZGVMYWJlbCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIF9kYXRhJGkyID0gZGF0YVtpXSxcbiAgICAgIGNvbG9yID0gX2RhdGEkaTIuY29sb3IsXG4gICAgICBhbGlnbiA9IF9kYXRhJGkyLmFsaWduO1xuICB2YXIgc3R5bGUgPSBvdXRzaWRlTGFiZWwuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoX29iamVjdFNwcmVhZCh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgYWxpZ24pLCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yYWRhciA9IHJhZGFyO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9pbmRleCA9IHJlcXVpcmUoXCIuLi9jb25maWcvaW5kZXhcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiByYWRhcihjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgdmFyIHJhZGFycyA9ICgwLCBfdXRpbDIuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX2luZGV4LnJhZGFyQ29uZmlnLCAncmFkYXInKTtcbiAgcmFkYXJzID0gY2FsY1JhZGFyUG9zaXRpb24ocmFkYXJzLCBjaGFydCk7XG4gIHJhZGFycyA9IGNhbGNSYWRhckxhYmVsUG9zaXRpb24ocmFkYXJzLCBjaGFydCk7XG4gIHJhZGFycyA9IGNhbGNSYWRhckxhYmVsQWxpZ24ocmFkYXJzLCBjaGFydCk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFycyxcbiAgICBrZXk6ICdyYWRhcicsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFJhZGFyQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0UmFkYXJDb25maWcsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VSYWRhclxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJzLFxuICAgIGtleTogJ3JhZGFyUG9pbnQnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRQb2ludENvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydFBvaW50Q29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhcnMsXG4gICAga2V5OiAncmFkYXJMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExhYmVsQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJQb3NpdGlvbihyYWRhcnMsIGNoYXJ0KSB7XG4gIHZhciByYWRhckF4aXMgPSBjaGFydC5yYWRhckF4aXM7XG4gIGlmICghcmFkYXJBeGlzKSByZXR1cm4gW107XG4gIHZhciBpbmRpY2F0b3IgPSByYWRhckF4aXMuaW5kaWNhdG9yLFxuICAgICAgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMsXG4gICAgICByYWRpdXMgPSByYWRhckF4aXMucmFkaXVzLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcztcbiAgcmFkYXJzLmZvckVhY2goZnVuY3Rpb24gKHJhZGFySXRlbSkge1xuICAgIHZhciBkYXRhID0gcmFkYXJJdGVtLmRhdGE7XG4gICAgcmFkYXJJdGVtLmRhdGFSYWRpdXMgPSBbXTtcbiAgICByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbiA9IGluZGljYXRvci5tYXAoZnVuY3Rpb24gKF9yZWYsIGkpIHtcbiAgICAgIHZhciBtYXggPSBfcmVmLm1heCxcbiAgICAgICAgICBtaW4gPSBfcmVmLm1pbjtcbiAgICAgIHZhciB2ID0gZGF0YVtpXTtcbiAgICAgIGlmICh0eXBlb2YgbWF4ICE9PSAnbnVtYmVyJykgbWF4ID0gdjtcbiAgICAgIGlmICh0eXBlb2YgbWluICE9PSAnbnVtYmVyJykgbWluID0gMDtcbiAgICAgIGlmICh0eXBlb2YgdiAhPT0gJ251bWJlcicpIHYgPSBtaW47XG4gICAgICB2YXIgZGF0YVJhZGl1cyA9ICh2IC0gbWluKSAvIChtYXggLSBtaW4pICogcmFkaXVzO1xuICAgICAgcmFkYXJJdGVtLmRhdGFSYWRpdXNbaV0gPSBkYXRhUmFkaXVzO1xuICAgICAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbZGF0YVJhZGl1cywgYXhpc0xpbmVBbmdsZXNbaV1dKSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJMYWJlbFBvc2l0aW9uKHJhZGFycywgY2hhcnQpIHtcbiAgdmFyIHJhZGFyQXhpcyA9IGNoYXJ0LnJhZGFyQXhpcztcbiAgaWYgKCFyYWRhckF4aXMpIHJldHVybiBbXTtcbiAgdmFyIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICBheGlzTGluZUFuZ2xlcyA9IHJhZGFyQXhpcy5heGlzTGluZUFuZ2xlcztcbiAgcmFkYXJzLmZvckVhY2goZnVuY3Rpb24gKHJhZGFySXRlbSkge1xuICAgIHZhciBkYXRhUmFkaXVzID0gcmFkYXJJdGVtLmRhdGFSYWRpdXMsXG4gICAgICAgIGxhYmVsID0gcmFkYXJJdGVtLmxhYmVsO1xuICAgIHZhciBsYWJlbEdhcCA9IGxhYmVsLmxhYmVsR2FwO1xuICAgIHJhZGFySXRlbS5sYWJlbFBvc2l0aW9uID0gZGF0YVJhZGl1cy5tYXAoZnVuY3Rpb24gKHIsIGkpIHtcbiAgICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3IgKyBsYWJlbEdhcCwgYXhpc0xpbmVBbmdsZXNbaV1dKSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJMYWJlbEFsaWduKHJhZGFycywgY2hhcnQpIHtcbiAgdmFyIHJhZGFyQXhpcyA9IGNoYXJ0LnJhZGFyQXhpcztcbiAgaWYgKCFyYWRhckF4aXMpIHJldHVybiBbXTtcblxuICB2YXIgX3JhZGFyQXhpcyRjZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocmFkYXJBeGlzLmNlbnRlclBvcywgMiksXG4gICAgICB4ID0gX3JhZGFyQXhpcyRjZW50ZXJQb3NbMF0sXG4gICAgICB5ID0gX3JhZGFyQXhpcyRjZW50ZXJQb3NbMV07XG5cbiAgcmFkYXJzLmZvckVhY2goZnVuY3Rpb24gKHJhZGFySXRlbSkge1xuICAgIHZhciBsYWJlbFBvc2l0aW9uID0gcmFkYXJJdGVtLmxhYmVsUG9zaXRpb247XG4gICAgdmFyIGxhYmVsQWxpZ24gPSBsYWJlbFBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICAgIHZhciBfcmVmMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMiwgMiksXG4gICAgICAgICAgbHggPSBfcmVmM1swXSxcbiAgICAgICAgICBseSA9IF9yZWYzWzFdO1xuXG4gICAgICB2YXIgdGV4dEFsaWduID0gbHggPiB4ID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIHZhciB0ZXh0QmFzZWxpbmUgPSBseSA+IHkgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGV4dEFsaWduOiB0ZXh0QWxpZ24sXG4gICAgICAgIHRleHRCYXNlbGluZTogdGV4dEJhc2VsaW5lXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJhZGFySXRlbS5sYWJlbEFsaWduID0gbGFiZWxBbGlnbjtcbiAgfSk7XG4gIHJldHVybiByYWRhcnM7XG59XG5cbmZ1bmN0aW9uIGdldFJhZGFyQ29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSByYWRhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFySXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBnZXRSYWRhclNoYXBlKHJhZGFySXRlbSksXG4gICAgc3R5bGU6IGdldFJhZGFyU3R5bGUocmFkYXJJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRSYWRhckNvbmZpZyhyYWRhckl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGNlbnRlclBvcyA9IHVwZGF0ZXIuY2hhcnQucmFkYXJBeGlzLmNlbnRlclBvcztcbiAgdmFyIGNvbmZpZyA9IGdldFJhZGFyQ29uZmlnKHJhZGFySXRlbSlbMF07XG4gIHZhciBwb2ludE51bSA9IGNvbmZpZy5zaGFwZS5wb2ludHMubGVuZ3RoO1xuICB2YXIgcG9pbnRzID0gbmV3IEFycmF5KHBvaW50TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKTtcbiAgfSk7XG4gIGNvbmZpZy5zaGFwZS5wb2ludHMgPSBwb2ludHM7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gZ2V0UmFkYXJTaGFwZShyYWRhckl0ZW0pIHtcbiAgdmFyIHJhZGFyUG9zaXRpb24gPSByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHJhZGFyUG9zaXRpb24sXG4gICAgY2xvc2U6IHRydWVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UmFkYXJTdHlsZShyYWRhckl0ZW0pIHtcbiAgdmFyIHJhZGFyU3R5bGUgPSByYWRhckl0ZW0ucmFkYXJTdHlsZSxcbiAgICAgIGNvbG9yID0gcmFkYXJJdGVtLmNvbG9yO1xuICB2YXIgY29sb3JSZ2JhVmFsdWUgPSAoMCwgX2NvbG9yLmdldFJnYmFWYWx1ZSkoY29sb3IpO1xuICBjb2xvclJnYmFWYWx1ZVszXSA9IDAuNTtcbiAgdmFyIHJhZGFyRGVmYXVsdENvbG9yID0ge1xuICAgIHN0cm9rZTogY29sb3IsXG4gICAgZmlsbDogKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoY29sb3JSZ2JhVmFsdWUpXG4gIH07XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkocmFkYXJEZWZhdWx0Q29sb3IsIHJhZGFyU3R5bGUpO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VSYWRhcihncmFwaCwgX3JlZjQpIHtcbiAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gIHZhciBncmFwaFBvaW50cyA9IGdyYXBoLnNoYXBlLnBvaW50cztcbiAgdmFyIGdyYXBoUG9pbnRzTnVtID0gZ3JhcGhQb2ludHMubGVuZ3RoO1xuICB2YXIgcG9pbnRzTnVtID0gc2hhcGUucG9pbnRzLmxlbmd0aDtcblxuICBpZiAocG9pbnRzTnVtID4gZ3JhcGhQb2ludHNOdW0pIHtcbiAgICB2YXIgbGFzdFBvaW50ID0gZ3JhcGhQb2ludHMuc2xpY2UoLTEpWzBdO1xuICAgIHZhciBuZXdBZGRQb2ludHMgPSBuZXcgQXJyYXkocG9pbnRzTnVtIC0gZ3JhcGhQb2ludHNOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICAgIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhc3RQb2ludCk7XG4gICAgfSk7XG4gICAgZ3JhcGhQb2ludHMucHVzaC5hcHBseShncmFwaFBvaW50cywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXdBZGRQb2ludHMpKTtcbiAgfSBlbHNlIGlmIChwb2ludHNOdW0gPCBncmFwaFBvaW50c051bSkge1xuICAgIGdyYXBoUG9pbnRzLnNwbGljZShwb2ludHNOdW0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50Q29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgcmFkYXJQb3NpdGlvbiA9IHJhZGFySXRlbS5yYWRhclBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFySXRlbS5yTGV2ZWw7XG4gIHJldHVybiByYWRhclBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdjaXJjbGUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHZpc2libGU6IHJhZGFySXRlbS5wb2ludC5zaG93LFxuICAgICAgc2hhcGU6IGdldFBvaW50U2hhcGUocmFkYXJJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRQb2ludFN0eWxlKHJhZGFySXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQb2ludENvbmZpZyhyYWRhckl0ZW0pIHtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRQb2ludENvbmZpZyhyYWRhckl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHJldHVybiBjb25maWcuc2hhcGUuciA9IDAuMDE7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRTaGFwZShyYWRhckl0ZW0sIGkpIHtcbiAgdmFyIHJhZGFyUG9zaXRpb24gPSByYWRhckl0ZW0ucmFkYXJQb3NpdGlvbixcbiAgICAgIHBvaW50ID0gcmFkYXJJdGVtLnBvaW50O1xuICB2YXIgcmFkaXVzID0gcG9pbnQucmFkaXVzO1xuICB2YXIgcG9zaXRpb24gPSByYWRhclBvc2l0aW9uW2ldO1xuICByZXR1cm4ge1xuICAgIHJ4OiBwb3NpdGlvblswXSxcbiAgICByeTogcG9zaXRpb25bMV0sXG4gICAgcjogcmFkaXVzXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50U3R5bGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciBwb2ludCA9IHJhZGFySXRlbS5wb2ludCxcbiAgICAgIGNvbG9yID0gcmFkYXJJdGVtLmNvbG9yO1xuICB2YXIgc3R5bGUgPSBwb2ludC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgc3Ryb2tlOiBjb2xvclxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsQ29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgbGFiZWxQb3NpdGlvbiA9IHJhZGFySXRlbS5sYWJlbFBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFySXRlbS5yTGV2ZWw7XG4gIHJldHVybiBsYWJlbFBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiByYWRhckl0ZW0ubGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRMYWJlbFNoYXBlKHJhZGFySXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0TGFiZWxTdHlsZShyYWRhckl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU2hhcGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciBsYWJlbFBvc2l0aW9uID0gcmFkYXJJdGVtLmxhYmVsUG9zaXRpb24sXG4gICAgICBsYWJlbCA9IHJhZGFySXRlbS5sYWJlbCxcbiAgICAgIGRhdGEgPSByYWRhckl0ZW0uZGF0YTtcbiAgdmFyIG9mZnNldCA9IGxhYmVsLm9mZnNldCxcbiAgICAgIGZvcm1hdHRlciA9IGxhYmVsLmZvcm1hdHRlcjtcbiAgdmFyIHBvc2l0aW9uID0gbWVyZ2VQb2ludE9mZnNldChsYWJlbFBvc2l0aW9uW2ldLCBvZmZzZXQpO1xuICB2YXIgbGFiZWxUZXh0ID0gZGF0YVtpXSA/IGRhdGFbaV0udG9TdHJpbmcoKSA6ICcwJztcbiAgdmFyIGZvcm1hdHRlclR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ3N0cmluZycpIGxhYmVsVGV4dCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9JywgbGFiZWxUZXh0KTtcbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIGxhYmVsVGV4dCA9IGZvcm1hdHRlcihsYWJlbFRleHQpO1xuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGxhYmVsVGV4dCxcbiAgICBwb3NpdGlvbjogcG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VQb2ludE9mZnNldChfcmVmNSwgX3JlZjYpIHtcbiAgdmFyIF9yZWY3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1LCAyKSxcbiAgICAgIHggPSBfcmVmN1swXSxcbiAgICAgIHkgPSBfcmVmN1sxXTtcblxuICB2YXIgX3JlZjggPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjYsIDIpLFxuICAgICAgb3ggPSBfcmVmOFswXSxcbiAgICAgIG95ID0gX3JlZjhbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUocmFkYXJJdGVtLCBpKSB7XG4gIHZhciBsYWJlbCA9IHJhZGFySXRlbS5sYWJlbCxcbiAgICAgIGNvbG9yID0gcmFkYXJJdGVtLmNvbG9yLFxuICAgICAgbGFiZWxBbGlnbiA9IHJhZGFySXRlbS5sYWJlbEFsaWduO1xuICB2YXIgc3R5bGUgPSBsYWJlbC5zdHlsZTtcblxuICB2YXIgZGVmYXVsdENvbG9yQW5kQWxpZ24gPSBfb2JqZWN0U3ByZWFkKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBsYWJlbEFsaWduW2ldKTtcblxuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKGRlZmF1bHRDb2xvckFuZEFsaWduLCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yYWRhckF4aXMgPSByYWRhckF4aXM7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9pbmRleCA9IHJlcXVpcmUoXCIuLi9jb25maWcvaW5kZXhcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gcmFkYXJBeGlzKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgcmFkYXIgPSBvcHRpb24ucmFkYXI7XG4gIHZhciByYWRhckF4aXMgPSBbXTtcblxuICBpZiAocmFkYXIpIHtcbiAgICByYWRhckF4aXMgPSBtZXJnZVJhZGFyQXhpc0RlZmF1bHRDb25maWcocmFkYXIpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNDZW50ZXIocmFkYXJBeGlzLCBjaGFydCk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc1JpbmdSYWRpdXMocmFkYXJBeGlzLCBjaGFydCk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc0xpbmVQb3NpdGlvbihyYWRhckF4aXMpO1xuICAgIHJhZGFyQXhpcyA9IGNhbGNSYWRhckF4aXNBcmVhUmFkaXVzKHJhZGFyQXhpcyk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc0xhYmVsUG9zaXRpb24ocmFkYXJBeGlzKTtcbiAgICByYWRhckF4aXMgPSBbcmFkYXJBeGlzXTtcbiAgfVxuXG4gIHZhciByYWRhckF4aXNGb3JVcGRhdGUgPSByYWRhckF4aXM7XG4gIGlmIChyYWRhckF4aXMubGVuZ3RoICYmICFyYWRhckF4aXNbMF0uc2hvdykgcmFkYXJBeGlzRm9yVXBkYXRlID0gW107XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNTcGxpdEFyZWEnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRTcGxpdEFyZWFDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVTcGxpdEFyZWEsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VTcGxpdEFyZWFcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNTcGxpdExpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRTcGxpdExpbmVDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVTcGxpdExpbmUsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VTcGxpdExpbmVcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXhpc0xpbmVDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFyQXhpc0ZvclVwZGF0ZSxcbiAgICBrZXk6ICdyYWRhckF4aXNMYWJsZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEF4aXNMYWJlbENvbmZpZ1xuICB9KTtcbiAgY2hhcnQucmFkYXJBeGlzID0gcmFkYXJBeGlzWzBdO1xufVxuXG5mdW5jdGlvbiBtZXJnZVJhZGFyQXhpc0RlZmF1bHRDb25maWcocmFkYXIpIHtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShfaW5kZXgucmFkYXJBeGlzQ29uZmlnKSwgcmFkYXIpO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJBeGlzQ2VudGVyKHJhZGFyQXhpcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIGNlbnRlciA9IHJhZGFyQXhpcy5jZW50ZXI7XG4gIHJhZGFyQXhpcy5jZW50ZXJQb3MgPSBjZW50ZXIubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykgcmV0dXJuIHY7XG4gICAgcmV0dXJuIHBhcnNlSW50KHYpIC8gMTAwICogYXJlYVtpXTtcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNSaW5nUmFkaXVzKHJhZGFyQXhpcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIHNwbGl0TnVtID0gcmFkYXJBeGlzLnNwbGl0TnVtLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cztcbiAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXJlYSkpIC8gMjtcbiAgaWYgKHR5cGVvZiByYWRpdXMgIT09ICdudW1iZXInKSByYWRpdXMgPSBwYXJzZUludChyYWRpdXMpIC8gMTAwICogbWF4UmFkaXVzO1xuICB2YXIgc3BsaXRHYXAgPSByYWRpdXMgLyBzcGxpdE51bTtcbiAgcmFkYXJBeGlzLnJpbmdSYWRpdXMgPSBuZXcgQXJyYXkoc3BsaXROdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gc3BsaXRHYXAgKiAoaSArIDEpO1xuICB9KTtcbiAgcmFkYXJBeGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyQXhpc0xpbmVQb3NpdGlvbihyYWRhckF4aXMpIHtcbiAgdmFyIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3IsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUgPSByYWRhckF4aXMuc3RhcnRBbmdsZTtcbiAgdmFyIGZ1bGxBbmdsZSA9IE1hdGguUEkgKiAyO1xuICB2YXIgaW5kaWNhdG9yTnVtID0gaW5kaWNhdG9yLmxlbmd0aDtcbiAgdmFyIGluZGljYXRvckdhcCA9IGZ1bGxBbmdsZSAvIGluZGljYXRvck51bTtcbiAgdmFyIGFuZ2xlcyA9IG5ldyBBcnJheShpbmRpY2F0b3JOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gaW5kaWNhdG9yR2FwICogaSArIHN0YXJ0QW5nbGU7XG4gIH0pO1xuICByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMgPSBhbmdsZXM7XG4gIHJhZGFyQXhpcy5heGlzTGluZVBvc2l0aW9uID0gYW5nbGVzLm1hcChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3JhZGl1cywgZ10pKTtcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNBcmVhUmFkaXVzKHJhZGFyQXhpcykge1xuICB2YXIgcmluZ1JhZGl1cyA9IHJhZGFyQXhpcy5yaW5nUmFkaXVzO1xuICB2YXIgc3ViUmFkaXVzID0gcmluZ1JhZGl1c1swXSAvIDI7XG4gIHJhZGFyQXhpcy5hcmVhUmFkaXVzID0gcmluZ1JhZGl1cy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICByZXR1cm4gciAtIHN1YlJhZGl1cztcbiAgfSk7XG4gIHJldHVybiByYWRhckF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNMYWJlbFBvc2l0aW9uKHJhZGFyQXhpcykge1xuICB2YXIgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgcmFkaXVzID0gcmFkYXJBeGlzLnJhZGl1cyxcbiAgICAgIGF4aXNMYWJlbCA9IHJhZGFyQXhpcy5heGlzTGFiZWw7XG4gIHJhZGl1cyArPSBheGlzTGFiZWwubGFiZWxHYXA7XG4gIHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbiA9IGF4aXNMaW5lQW5nbGVzLm1hcChmdW5jdGlvbiAoYW5nbGUpIHtcbiAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyYWRpdXMsIGFuZ2xlXSkpO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRBcmVhQ29uZmlnKHJhZGFyQXhpcykge1xuICB2YXIgYXJlYVJhZGl1cyA9IHJhZGFyQXhpcy5hcmVhUmFkaXVzLFxuICAgICAgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckF4aXMuYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFyQXhpcy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFyQXhpcy5yTGV2ZWw7XG4gIHZhciBuYW1lID0gcG9seWdvbiA/ICdyZWdQb2x5Z29uJyA6ICdyaW5nJztcbiAgcmV0dXJuIGFyZWFSYWRpdXMubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiByYWRhckF4aXMuc3BsaXRBcmVhLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0U3BsaXRBcmVhU2hhcGUocmFkYXJBeGlzLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRTcGxpdEFyZWFTdHlsZShyYWRhckF4aXMsIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0QXJlYVNoYXBlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uLFxuICAgICAgYXJlYVJhZGl1cyA9IHJhZGFyQXhpcy5hcmVhUmFkaXVzLFxuICAgICAgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcixcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3M7XG4gIHZhciBpbmRpY2F0b3JOdW0gPSBpbmRpY2F0b3IubGVuZ3RoO1xuICB2YXIgc2hhcGUgPSB7XG4gICAgcng6IGNlbnRlclBvc1swXSxcbiAgICByeTogY2VudGVyUG9zWzFdLFxuICAgIHI6IGFyZWFSYWRpdXNbaV1cbiAgfTtcbiAgaWYgKHBvbHlnb24pIHNoYXBlLnNpZGUgPSBpbmRpY2F0b3JOdW07XG4gIHJldHVybiBzaGFwZTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRBcmVhU3R5bGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBzcGxpdEFyZWEgPSByYWRhckF4aXMuc3BsaXRBcmVhLFxuICAgICAgcmluZ1JhZGl1cyA9IHJhZGFyQXhpcy5yaW5nUmFkaXVzLFxuICAgICAgYXhpc0xpbmVBbmdsZXMgPSByYWRhckF4aXMuYXhpc0xpbmVBbmdsZXMsXG4gICAgICBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb24sXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zO1xuICB2YXIgY29sb3IgPSBzcGxpdEFyZWEuY29sb3IsXG4gICAgICBzdHlsZSA9IHNwbGl0QXJlYS5zdHlsZTtcbiAgc3R5bGUgPSBfb2JqZWN0U3ByZWFkKHtcbiAgICBmaWxsOiAncmdiYSgwLCAwLCAwLCAwKSdcbiAgfSwgc3R5bGUpO1xuICB2YXIgbGluZVdpZHRoID0gcmluZ1JhZGl1c1swXSAtIDA7XG5cbiAgaWYgKHBvbHlnb24pIHtcbiAgICB2YXIgcG9pbnQxID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtyaW5nUmFkaXVzWzBdLCBheGlzTGluZUFuZ2xlc1swXV0pKTtcblxuICAgIHZhciBwb2ludDIgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3JpbmdSYWRpdXNbMF0sIGF4aXNMaW5lQW5nbGVzWzFdXSkpO1xuXG4gICAgbGluZVdpZHRoID0gKDAsIF91dGlsMi5nZXRQb2ludFRvTGluZURpc3RhbmNlKShjZW50ZXJQb3MsIHBvaW50MSwgcG9pbnQyKTtcbiAgfVxuXG4gIHN0eWxlID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKHN0eWxlLCB0cnVlKSwge1xuICAgIGxpbmVXaWR0aDogbGluZVdpZHRoXG4gIH0pO1xuICBpZiAoIWNvbG9yLmxlbmd0aCkgcmV0dXJuIHN0eWxlO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoc3R5bGUsIHtcbiAgICBzdHJva2U6IGNvbG9yW2kgJSBjb2xvck51bV1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZVNwbGl0QXJlYShncmFwaHMsIHJhZGFyQXhpcywgaSwgdXBkYXRlcikge1xuICB2YXIgY2FjaGUgPSBncmFwaHNbaV07XG4gIGlmICghY2FjaGUpIHJldHVybjtcbiAgdmFyIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uO1xuICB2YXIgbmFtZSA9IGNhY2hlWzBdLm5hbWU7XG4gIHZhciBjdXJyZW50TmFtZSA9IHBvbHlnb24gPyAncmVnUG9seWdvbicgOiAncmluZyc7XG4gIHZhciBkZWxBbGwgPSBjdXJyZW50TmFtZSAhPT0gbmFtZTtcbiAgaWYgKCFkZWxBbGwpIHJldHVybjtcbiAgY2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gIH0pO1xuICBncmFwaHNbaV0gPSBudWxsO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VTcGxpdEFyZWEoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgc2lkZSA9IGNvbmZpZy5zaGFwZS5zaWRlO1xuICBpZiAodHlwZW9mIHNpZGUgIT09ICdudW1iZXInKSByZXR1cm47XG4gIGdyYXBoLnNoYXBlLnNpZGUgPSBzaWRlO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVDb25maWcocmFkYXJBeGlzKSB7XG4gIHZhciByaW5nUmFkaXVzID0gcmFkYXJBeGlzLnJpbmdSYWRpdXMsXG4gICAgICBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFyQXhpcy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJBeGlzLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJBeGlzLnJMZXZlbDtcbiAgdmFyIG5hbWUgPSBwb2x5Z29uID8gJ3JlZ1BvbHlnb24nIDogJ3JpbmcnO1xuICByZXR1cm4gcmluZ1JhZGl1cy5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5zcGxpdExpbmUuc2hvdyxcbiAgICAgIHNoYXBlOiBnZXRTcGxpdExpbmVTaGFwZShyYWRhckF4aXMsIGkpLFxuICAgICAgc3R5bGU6IGdldFNwbGl0TGluZVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRMaW5lU2hhcGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciByaW5nUmFkaXVzID0gcmFkYXJBeGlzLnJpbmdSYWRpdXMsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zLFxuICAgICAgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcixcbiAgICAgIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbjtcbiAgdmFyIHNoYXBlID0ge1xuICAgIHJ4OiBjZW50ZXJQb3NbMF0sXG4gICAgcnk6IGNlbnRlclBvc1sxXSxcbiAgICByOiByaW5nUmFkaXVzW2ldXG4gIH07XG4gIHZhciBpbmRpY2F0b3JOdW0gPSBpbmRpY2F0b3IubGVuZ3RoO1xuICBpZiAocG9seWdvbikgc2hhcGUuc2lkZSA9IGluZGljYXRvck51bTtcbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVTdHlsZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIHNwbGl0TGluZSA9IHJhZGFyQXhpcy5zcGxpdExpbmU7XG4gIHZhciBjb2xvciA9IHNwbGl0TGluZS5jb2xvcixcbiAgICAgIHN0eWxlID0gc3BsaXRMaW5lLnN0eWxlO1xuICBzdHlsZSA9IF9vYmplY3RTcHJlYWQoe1xuICAgIGZpbGw6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICB9LCBzdHlsZSk7XG4gIGlmICghY29sb3IubGVuZ3RoKSByZXR1cm4gc3R5bGU7XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShzdHlsZSwge1xuICAgIHN0cm9rZTogY29sb3JbaSAlIGNvbG9yTnVtXVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlU3BsaXRMaW5lKGdyYXBocywgcmFkYXJBeGlzLCBpLCB1cGRhdGVyKSB7XG4gIHZhciBjYWNoZSA9IGdyYXBoc1tpXTtcbiAgaWYgKCFjYWNoZSkgcmV0dXJuO1xuICB2YXIgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb247XG4gIHZhciBuYW1lID0gY2FjaGVbMF0ubmFtZTtcbiAgdmFyIGN1cnJlbk5hbWUgPSBwb2x5Z29uID8gJ3JlZ1BvbHlnb24nIDogJ3JpbmcnO1xuICB2YXIgZGVsQWxsID0gY3VycmVuTmFtZSAhPT0gbmFtZTtcbiAgaWYgKCFkZWxBbGwpIHJldHVybjtcbiAgY2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gIH0pO1xuICBncmFwaHNbaV0gPSBudWxsO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VTcGxpdExpbmUoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgc2lkZSA9IGNvbmZpZy5zaGFwZS5zaWRlO1xuICBpZiAodHlwZW9mIHNpZGUgIT09ICdudW1iZXInKSByZXR1cm47XG4gIGdyYXBoLnNoYXBlLnNpZGUgPSBzaWRlO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGluZUNvbmZpZyhyYWRhckF4aXMpIHtcbiAgdmFyIGF4aXNMaW5lUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xpbmVQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJBeGlzLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckF4aXMuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckF4aXMuckxldmVsO1xuICByZXR1cm4gYXhpc0xpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5heGlzTGluZS5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNMaW5lU2hhcGUocmFkYXJBeGlzLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRBeGlzTGluZVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xpbmVTaGFwZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICBheGlzTGluZVBvc2l0aW9uID0gcmFkYXJBeGlzLmF4aXNMaW5lUG9zaXRpb247XG4gIHZhciBwb2ludHMgPSBbY2VudGVyUG9zLCBheGlzTGluZVBvc2l0aW9uW2ldXTtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHBvaW50c1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGluZVN0eWxlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgYXhpc0xpbmUgPSByYWRhckF4aXMuYXhpc0xpbmU7XG4gIHZhciBjb2xvciA9IGF4aXNMaW5lLmNvbG9yLFxuICAgICAgc3R5bGUgPSBheGlzTGluZS5zdHlsZTtcbiAgaWYgKCFjb2xvci5sZW5ndGgpIHJldHVybiBzdHlsZTtcbiAgdmFyIGNvbG9yTnVtID0gY29sb3IubGVuZ3RoO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHN0eWxlLCB7XG4gICAgc3Ryb2tlOiBjb2xvcltpICUgY29sb3JOdW1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFiZWxDb25maWcocmFkYXJBeGlzKSB7XG4gIHZhciBheGlzTGFiZWxQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJBeGlzLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckF4aXMuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckF4aXMuckxldmVsO1xuICByZXR1cm4gYXhpc0xhYmVsUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5heGlzTGFiZWwuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRBeGlzTGFibGVTaGFwZShyYWRhckF4aXMsIGkpLFxuICAgICAgc3R5bGU6IGdldEF4aXNMYWJsZVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmxlU2hhcGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBheGlzTGFiZWxQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbixcbiAgICAgIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3I7XG4gIHJldHVybiB7XG4gICAgY29udGVudDogaW5kaWNhdG9yW2ldLm5hbWUsXG4gICAgcG9zaXRpb246IGF4aXNMYWJlbFBvc2l0aW9uW2ldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJsZVN0eWxlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgYXhpc0xhYmVsID0gcmFkYXJBeGlzLmF4aXNMYWJlbCxcbiAgICAgIF9yYWRhckF4aXMkY2VudGVyUG9zID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHJhZGFyQXhpcy5jZW50ZXJQb3MsIDIpLFxuICAgICAgeCA9IF9yYWRhckF4aXMkY2VudGVyUG9zWzBdLFxuICAgICAgeSA9IF9yYWRhckF4aXMkY2VudGVyUG9zWzFdLFxuICAgICAgYXhpc0xhYmVsUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xhYmVsUG9zaXRpb247XG5cbiAgdmFyIGNvbG9yID0gYXhpc0xhYmVsLmNvbG9yLFxuICAgICAgc3R5bGUgPSBheGlzTGFiZWwuc3R5bGU7XG5cbiAgdmFyIF9heGlzTGFiZWxQb3NpdGlvbiRpID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGF4aXNMYWJlbFBvc2l0aW9uW2ldLCAyKSxcbiAgICAgIGxhYmVsWHBvcyA9IF9heGlzTGFiZWxQb3NpdGlvbiRpWzBdLFxuICAgICAgbGFiZWxZUG9zID0gX2F4aXNMYWJlbFBvc2l0aW9uJGlbMV07XG5cbiAgdmFyIHRleHRBbGlnbiA9IGxhYmVsWHBvcyA+IHggPyAnbGVmdCcgOiAncmlnaHQnO1xuICB2YXIgdGV4dEJhc2VsaW5lID0gbGFiZWxZUG9zID4geSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gIHN0eWxlID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICB0ZXh0QWxpZ246IHRleHRBbGlnbixcbiAgICB0ZXh0QmFzZWxpbmU6IHRleHRCYXNlbGluZVxuICB9LCBzdHlsZSk7XG4gIGlmICghY29sb3IubGVuZ3RoKSByZXR1cm4gc3R5bGU7XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShzdHlsZSwge1xuICAgIGZpbGw6IGNvbG9yW2kgJSBjb2xvck51bV1cbiAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50aXRsZSA9IHRpdGxlO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF91cGRhdGVyID0gcmVxdWlyZShcIi4uL2NsYXNzL3VwZGF0ZXIuY2xhc3NcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIHRpdGxlKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgdGl0bGUgPSBbXTtcblxuICBpZiAob3B0aW9uLnRpdGxlKSB7XG4gICAgdGl0bGVbMF0gPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy50aXRsZUNvbmZpZywgdHJ1ZSksIG9wdGlvbi50aXRsZSk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiB0aXRsZSxcbiAgICBrZXk6ICd0aXRsZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFRpdGxlQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUaXRsZUNvbmZpZyh0aXRsZUl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gX2NvbmZpZy50aXRsZUNvbmZpZy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gX2NvbmZpZy50aXRsZUNvbmZpZy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IF9jb25maWcudGl0bGVDb25maWcuckxldmVsO1xuICB2YXIgc2hhcGUgPSBnZXRUaXRsZVNoYXBlKHRpdGxlSXRlbSwgdXBkYXRlcik7XG4gIHZhciBzdHlsZSA9IGdldFRpdGxlU3R5bGUodGl0bGVJdGVtKTtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3RleHQnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgdmlzaWJsZTogdGl0bGVJdGVtLnNob3csXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogc2hhcGUsXG4gICAgc3R5bGU6IHN0eWxlXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRUaXRsZVNoYXBlKHRpdGxlSXRlbSwgdXBkYXRlcikge1xuICB2YXIgb2Zmc2V0ID0gdGl0bGVJdGVtLm9mZnNldCxcbiAgICAgIHRleHQgPSB0aXRsZUl0ZW0udGV4dDtcbiAgdmFyIF91cGRhdGVyJGNoYXJ0JGdyaWRBciA9IHVwZGF0ZXIuY2hhcnQuZ3JpZEFyZWEsXG4gICAgICB4ID0gX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyLngsXG4gICAgICB5ID0gX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyLnksXG4gICAgICB3ID0gX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyLnc7XG5cbiAgdmFyIF9vZmZzZXQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkob2Zmc2V0LCAyKSxcbiAgICAgIG94ID0gX29mZnNldFswXSxcbiAgICAgIG95ID0gX29mZnNldFsxXTtcblxuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IHRleHQsXG4gICAgcG9zaXRpb246IFt4ICsgdyAvIDIgKyBveCwgeSArIG95XVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRUaXRsZVN0eWxlKHRpdGxlSXRlbSkge1xuICB2YXIgc3R5bGUgPSB0aXRsZUl0ZW0uc3R5bGU7XG4gIHJldHVybiBzdHlsZTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY1JlbmRlciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyXCIpO1xuXG52YXIgX2dyYXBocyA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9jb25maWcvZ3JhcGhzXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKTtcblxudmFyIF9pbmRleCA9IHJlcXVpcmUoXCIuLi91dGlsL2luZGV4XCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxudmFyIHBpZSA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICBpcjogMCxcbiAgICBvcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGNsb2NrV2lzZTogdHJ1ZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZi5zaGFwZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAnaXInLCAnb3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdQaWUgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMiwgX3JlZjMpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjIuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgaXIgPSBzaGFwZS5pcixcbiAgICAgICAgb3IgPSBzaGFwZS5vcixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICByeCA9IHBhcnNlSW50KHJ4KSArIDAuNTtcbiAgICByeSA9IHBhcnNlSW50KHJ5KSArIDAuNTtcbiAgICBjdHguYXJjKHJ4LCByeSwgaXIgPiAwID8gaXIgOiAwLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgIWNsb2NrV2lzZSk7XG4gICAgdmFyIGNvbm5lY3RQb2ludDEgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgb3IsIGVuZEFuZ2xlKS5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiBwYXJzZUludChwKSArIDAuNTtcbiAgICB9KTtcbiAgICB2YXIgY29ubmVjdFBvaW50MiA9ICgwLCBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludCkocngsIHJ5LCBpciwgc3RhcnRBbmdsZSkubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocCkgKyAwLjU7XG4gICAgfSk7XG4gICAgY3R4LmxpbmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY29ubmVjdFBvaW50MSkpO1xuICAgIGN0eC5hcmMocngsIHJ5LCBvciA+IDAgPyBvciA6IDAsIGVuZEFuZ2xlLCBzdGFydEFuZ2xlLCBjbG9ja1dpc2UpO1xuICAgIGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNvbm5lY3RQb2ludDIpKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH1cbn07XG52YXIgYWdBcmMgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGdyYWRpZW50U3RhcnRBbmdsZTogbnVsbCxcbiAgICBncmFkaWVudEVuZEFuZ2xlOiBudWxsXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBZ0FyYyBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY1LCBfcmVmNikge1xuICAgIHZhciBjdHggPSBfcmVmNS5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjYuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjYuc3R5bGU7XG4gICAgdmFyIGdyYWRpZW50ID0gc3R5bGUuZ3JhZGllbnQ7XG4gICAgZ3JhZGllbnQgPSBncmFkaWVudC5tYXAoZnVuY3Rpb24gKGN2KSB7XG4gICAgICByZXR1cm4gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoY3YpO1xuICAgIH0pO1xuXG4gICAgaWYgKGdyYWRpZW50Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgZ3JhZGllbnQgPSBbZ3JhZGllbnRbMF0sIGdyYWRpZW50WzBdXTtcbiAgICB9XG5cbiAgICB2YXIgZ3JhZGllbnRBcmNOdW0gPSBncmFkaWVudC5sZW5ndGggLSAxO1xuICAgIHZhciBncmFkaWVudFN0YXJ0QW5nbGUgPSBzaGFwZS5ncmFkaWVudFN0YXJ0QW5nbGUsXG4gICAgICAgIGdyYWRpZW50RW5kQW5nbGUgPSBzaGFwZS5ncmFkaWVudEVuZEFuZ2xlLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgaWYgKGdyYWRpZW50U3RhcnRBbmdsZSA9PT0gbnVsbCkgZ3JhZGllbnRTdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICBpZiAoZ3JhZGllbnRFbmRBbmdsZSA9PT0gbnVsbCkgZ3JhZGllbnRFbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgIHZhciBhbmdsZUdhcCA9IChncmFkaWVudEVuZEFuZ2xlIC0gZ3JhZGllbnRTdGFydEFuZ2xlKSAvIGdyYWRpZW50QXJjTnVtO1xuICAgIGlmIChhbmdsZUdhcCA9PT0gTWF0aC5QSSAqIDIpIGFuZ2xlR2FwID0gTWF0aC5QSSAqIDIgLSAwLjAwMTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JhZGllbnRBcmNOdW07IGkrKykge1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdmFyIHN0YXJ0UG9pbnQgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgciwgc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogaSk7XG4gICAgICB2YXIgZW5kUG9pbnQgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgciwgc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogKGkgKyAxKSk7XG4gICAgICB2YXIgY29sb3IgPSAoMCwgX2luZGV4LmdldExpbmVhckdyYWRpZW50Q29sb3IpKGN0eCwgc3RhcnRQb2ludCwgZW5kUG9pbnQsIFtncmFkaWVudFtpXSwgZ3JhZGllbnRbaSArIDFdXSk7XG4gICAgICB2YXIgYXJjU3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBhbmdsZUdhcCAqIGk7XG4gICAgICB2YXIgYXJjRW5kQW5nbGUgPSBzdGFydEFuZ2xlICsgYW5nbGVHYXAgKiAoaSArIDEpO1xuICAgICAgdmFyIGRvQnJlYWsgPSBmYWxzZTtcblxuICAgICAgaWYgKGFyY0VuZEFuZ2xlID4gZW5kQW5nbGUpIHtcbiAgICAgICAgYXJjRW5kQW5nbGUgPSBlbmRBbmdsZTtcbiAgICAgICAgZG9CcmVhayA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGN0eC5hcmMocngsIHJ5LCByLCBhcmNTdGFydEFuZ2xlLCBhcmNFbmRBbmdsZSk7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgIGlmIChkb0JyZWFrKSBicmVhaztcbiAgICB9XG4gIH1cbn07XG52YXIgbnVtYmVyVGV4dCA9IHtcbiAgc2hhcGU6IHtcbiAgICBudW1iZXI6IFtdLFxuICAgIGNvbnRlbnQ6ICcnLFxuICAgIHBvc2l0aW9uOiBbMCwgMF0sXG4gICAgdG9GaXhlZDogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNykge1xuICAgIHZhciBzaGFwZSA9IF9yZWY3LnNoYXBlO1xuICAgIHZhciBudW1iZXIgPSBzaGFwZS5udW1iZXIsXG4gICAgICAgIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uO1xuXG4gICAgaWYgKCEobnVtYmVyIGluc3RhbmNlb2YgQXJyYXkpIHx8IHR5cGVvZiBjb250ZW50ICE9PSAnc3RyaW5nJyB8fCAhKHBvc2l0aW9uIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdOdW1iZXJUZXh0IHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjgsIF9yZWY5KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY4LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmOS5zaGFwZTtcbiAgICB2YXIgbnVtYmVyID0gc2hhcGUubnVtYmVyLFxuICAgICAgICBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgdG9GaXhlZCA9IHNoYXBlLnRvRml4ZWQsXG4gICAgICAgIHJvd0dhcCA9IHNoYXBlLnJvd0dhcDtcbiAgICB2YXIgdGV4dFNlZ21lbnRzID0gY29udGVudC5zcGxpdCgne250fScpO1xuICAgIHZhciBsYXN0U2VnbWVudEluZGV4ID0gdGV4dFNlZ21lbnRzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHRleHRTdHJpbmcgPSAnJztcbiAgICB0ZXh0U2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAodCwgaSkge1xuICAgICAgdmFyIGN1cnJlbnROdW1iZXIgPSBudW1iZXJbaV07XG4gICAgICBpZiAoaSA9PT0gbGFzdFNlZ21lbnRJbmRleCkgY3VycmVudE51bWJlciA9ICcnO1xuICAgICAgaWYgKHR5cGVvZiBjdXJyZW50TnVtYmVyID09PSAnbnVtYmVyJykgY3VycmVudE51bWJlciA9IGN1cnJlbnROdW1iZXIudG9GaXhlZCh0b0ZpeGVkKTtcbiAgICAgIHRleHRTdHJpbmcgKz0gdCArIChjdXJyZW50TnVtYmVyIHx8ICcnKTtcbiAgICB9KTtcblxuICAgIF9ncmFwaHMudGV4dC5kcmF3KHtcbiAgICAgIGN0eDogY3R4XG4gICAgfSwge1xuICAgICAgc2hhcGU6IF9vYmplY3RTcHJlYWQoe30sIHNoYXBlLCB7XG4gICAgICAgIGNvbnRlbnQ6IHRleHRTdHJpbmcsXG4gICAgICAgIHJvd0dhcDogcm93R2FwIHx8IDBcbiAgICAgIH0pXG4gICAgfSk7XG4gIH1cbn07XG52YXIgbGluZUljb24gPSB7XG4gIHNoYXBlOiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHc6IDAsXG4gICAgaDogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMTApIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTAuc2hhcGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuXG4gICAgaWYgKHR5cGVvZiB4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHcgIT09ICdudW1iZXInIHx8IHR5cGVvZiBoICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignbGluZUljb24gc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMTEsIF9yZWYxMikge1xuICAgIHZhciBjdHggPSBfcmVmMTEuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMi5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHZhciBoYWxmSCA9IGggLyAyO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IGN0eC5maWxsU3R5bGU7XG4gICAgY3R4Lm1vdmVUbyh4LCB5ICsgaGFsZkgpO1xuICAgIGN0eC5saW5lVG8oeCArIHcsIHkgKyBoYWxmSCk7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcmFkaXVzID0gaGFsZkggLSA1ICogMjtcbiAgICBpZiAocmFkaXVzIDw9IDApIHJhZGl1cyA9IDM7XG4gICAgY3R4LmFyYyh4ICsgdyAvIDIsIHkgKyBoYWxmSCwgcmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDU7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnI2ZmZic7XG4gICAgY3R4LmZpbGwoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjEzKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEzLnNoYXBlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUmVjdCkocG9zaXRpb24sIHgsIHksIHcsIGgpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjE0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE0LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYxNC5zdHlsZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbeCArIHcgLyAyLCB5ICsgaCAvIDJdO1xuICB9XG59O1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgncGllJywgcGllKTtcbigwLCBfY1JlbmRlci5leHRlbmROZXdHcmFwaCkoJ2FnQXJjJywgYWdBcmMpO1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgnbnVtYmVyVGV4dCcsIG51bWJlclRleHQpO1xuKDAsIF9jUmVuZGVyLmV4dGVuZE5ld0dyYXBoKSgnbGluZUljb24nLCBsaW5lSWNvbik7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiY2hhbmdlRGVmYXVsdENvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfY29uZmlnLmNoYW5nZURlZmF1bHRDb25maWc7XG4gIH1cbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfY2hhcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jbGFzcy9jaGFydHMuY2xhc3NcIikpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZ1wiKTtcblxudmFyIF9kZWZhdWx0ID0gX2NoYXJ0c1tcImRlZmF1bHRcIl07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZmlsdGVyTm9uTnVtYmVyID0gZmlsdGVyTm9uTnVtYmVyO1xuZXhwb3J0cy5kZWVwTWVyZ2UgPSBkZWVwTWVyZ2U7XG5leHBvcnRzLm11bEFkZCA9IG11bEFkZDtcbmV4cG9ydHMubWVyZ2VTYW1lU3RhY2tEYXRhID0gbWVyZ2VTYW1lU3RhY2tEYXRhO1xuZXhwb3J0cy5nZXRUd29Qb2ludERpc3RhbmNlID0gZ2V0VHdvUG9pbnREaXN0YW5jZTtcbmV4cG9ydHMuZ2V0TGluZWFyR3JhZGllbnRDb2xvciA9IGdldExpbmVhckdyYWRpZW50Q29sb3I7XG5leHBvcnRzLmdldFBvbHlsaW5lTGVuZ3RoID0gZ2V0UG9seWxpbmVMZW5ndGg7XG5leHBvcnRzLmdldFBvaW50VG9MaW5lRGlzdGFuY2UgPSBnZXRQb2ludFRvTGluZURpc3RhbmNlO1xuZXhwb3J0cy5pbml0TmVlZFNlcmllcyA9IGluaXROZWVkU2VyaWVzO1xuZXhwb3J0cy5yYWRpYW5Ub0FuZ2xlID0gcmFkaWFuVG9BbmdsZTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbmZ1bmN0aW9uIGZpbHRlck5vbk51bWJlcihhcnJheSkge1xuICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBuID09PSAnbnVtYmVyJztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRlZXBNZXJnZSh0YXJnZXQsIG1lcmdlZCkge1xuICBmb3IgKHZhciBrZXkgaW4gbWVyZ2VkKSB7XG4gICAgaWYgKHRhcmdldFtrZXldICYmICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHRhcmdldFtrZXldKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGRlZXBNZXJnZSh0YXJnZXRba2V5XSwgbWVyZ2VkW2tleV0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKCgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG1lcmdlZFtrZXldKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHRhcmdldFtrZXldID0gKDAsIF91dGlsLmRlZXBDbG9uZSkobWVyZ2VkW2tleV0sIHRydWUpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdGFyZ2V0W2tleV0gPSBtZXJnZWRba2V5XTtcbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIG11bEFkZChudW1zKSB7XG4gIG51bXMgPSBmaWx0ZXJOb25OdW1iZXIobnVtcyk7XG4gIHJldHVybiBudW1zLnJlZHVjZShmdW5jdGlvbiAoYWxsLCBudW0pIHtcbiAgICByZXR1cm4gYWxsICsgbnVtO1xuICB9LCAwKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VTYW1lU3RhY2tEYXRhKGl0ZW0sIHNlcmllcykge1xuICB2YXIgc3RhY2sgPSBpdGVtLnN0YWNrO1xuICBpZiAoIXN0YWNrKSByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtLmRhdGEpO1xuICB2YXIgc3RhY2tzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBzID0gX3JlZi5zdGFjaztcbiAgICByZXR1cm4gcyA9PT0gc3RhY2s7XG4gIH0pO1xuICB2YXIgaW5kZXggPSBzdGFja3MuZmluZEluZGV4KGZ1bmN0aW9uIChfcmVmMikge1xuICAgIHZhciBkID0gX3JlZjIuZGF0YTtcbiAgICByZXR1cm4gZCA9PT0gaXRlbS5kYXRhO1xuICB9KTtcbiAgdmFyIGRhdGFzID0gc3RhY2tzLnNwbGljZSgwLCBpbmRleCArIDEpLm1hcChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWYzLmRhdGE7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0pO1xuICB2YXIgZGF0YUxlbmd0aCA9IGRhdGFzWzBdLmxlbmd0aDtcbiAgcmV0dXJuIG5ldyBBcnJheShkYXRhTGVuZ3RoKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIG11bEFkZChkYXRhcy5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgIHJldHVybiBkW2ldO1xuICAgIH0pKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnRPbmUsIHBvaW50VHdvKSB7XG4gIHZhciBtaW51c1ggPSBNYXRoLmFicyhwb2ludE9uZVswXSAtIHBvaW50VHdvWzBdKTtcbiAgdmFyIG1pbnVzWSA9IE1hdGguYWJzKHBvaW50T25lWzFdIC0gcG9pbnRUd29bMV0pO1xuICByZXR1cm4gTWF0aC5zcXJ0KG1pbnVzWCAqIG1pbnVzWCArIG1pbnVzWSAqIG1pbnVzWSk7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVhckdyYWRpZW50Q29sb3IoY3R4LCBiZWdpbiwgZW5kLCBjb2xvcikge1xuICBpZiAoIWN0eCB8fCAhYmVnaW4gfHwgIWVuZCB8fCAhY29sb3IubGVuZ3RoKSByZXR1cm47XG4gIHZhciBjb2xvcnMgPSBjb2xvcjtcbiAgdHlwZW9mIGNvbG9ycyA9PT0gJ3N0cmluZycgJiYgKGNvbG9ycyA9IFtjb2xvciwgY29sb3JdKTtcbiAgdmFyIGxpbmVhckdyYWRpZW50Q29sb3IgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQuYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGJlZ2luKS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShlbmQpKSk7XG4gIHZhciBjb2xvckdhcCA9IDEgLyAoY29sb3JzLmxlbmd0aCAtIDEpO1xuICBjb2xvcnMuZm9yRWFjaChmdW5jdGlvbiAoYywgaSkge1xuICAgIHJldHVybiBsaW5lYXJHcmFkaWVudENvbG9yLmFkZENvbG9yU3RvcChjb2xvckdhcCAqIGksIGMpO1xuICB9KTtcbiAgcmV0dXJuIGxpbmVhckdyYWRpZW50Q29sb3I7XG59XG5cbmZ1bmN0aW9uIGdldFBvbHlsaW5lTGVuZ3RoKHBvaW50cykge1xuICB2YXIgbGluZVNlZ21lbnRzID0gbmV3IEFycmF5KHBvaW50cy5sZW5ndGggLSAxKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIFtwb2ludHNbaV0sIHBvaW50c1tpICsgMV1dO1xuICB9KTtcbiAgdmFyIGxlbmd0aHMgPSBsaW5lU2VnbWVudHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGdldFR3b1BvaW50RGlzdGFuY2UuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGl0ZW0pKTtcbiAgfSk7XG4gIHJldHVybiBtdWxBZGQobGVuZ3Rocyk7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50VG9MaW5lRGlzdGFuY2UocG9pbnQsIGxpbmVQb2ludE9uZSwgbGluZVBvaW50VHdvKSB7XG4gIHZhciBhID0gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgbGluZVBvaW50T25lKTtcbiAgdmFyIGIgPSBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50LCBsaW5lUG9pbnRUd28pO1xuICB2YXIgYyA9IGdldFR3b1BvaW50RGlzdGFuY2UobGluZVBvaW50T25lLCBsaW5lUG9pbnRUd28pO1xuICByZXR1cm4gMC41ICogTWF0aC5zcXJ0KChhICsgYiArIGMpICogKGEgKyBiIC0gYykgKiAoYSArIGMgLSBiKSAqIChiICsgYyAtIGEpKSAvIGM7XG59XG5cbmZ1bmN0aW9uIGluaXROZWVkU2VyaWVzKHNlcmllcywgY29uZmlnLCB0eXBlKSB7XG4gIHNlcmllcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY0KSB7XG4gICAgdmFyIHN0ID0gX3JlZjQudHlwZTtcbiAgICByZXR1cm4gc3QgPT09IHR5cGU7XG4gIH0pO1xuICBzZXJpZXMgPSBzZXJpZXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgcmV0dXJuIGRlZXBNZXJnZSgoMCwgX3V0aWwuZGVlcENsb25lKShjb25maWcsIHRydWUpLCBpdGVtKTtcbiAgfSk7XG4gIHJldHVybiBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNSkge1xuICAgIHZhciBzaG93ID0gX3JlZjUuc2hvdztcbiAgICByZXR1cm4gc2hvdztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJhZGlhblRvQW5nbGUocmFkaWFuKSB7XG4gIHJldHVybiByYWRpYW4gLyBNYXRoLlBJICogMTgwO1xufSIsImZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlXaXRoSG9sZXM7IiwiZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFycjJbaV0gPSBhcnJbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjI7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXJyYXlXaXRob3V0SG9sZXM7IiwiZnVuY3Rpb24gYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBrZXksIGFyZykge1xuICB0cnkge1xuICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlamVjdChlcnJvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGluZm8uZG9uZSkge1xuICAgIHJlc29sdmUodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihfbmV4dCwgX3Rocm93KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYXN5bmNUb0dlbmVyYXRvcihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbiA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXG4gICAgICBmdW5jdGlvbiBfbmV4dCh2YWx1ZSkge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF90aHJvdyhlcnIpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcInRocm93XCIsIGVycik7XG4gICAgICB9XG5cbiAgICAgIF9uZXh0KHVuZGVmaW5lZCk7XG4gICAgfSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FzeW5jVG9HZW5lcmF0b3I7IiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY2xhc3NDYWxsQ2hlY2s7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2RlZmluZVByb3BlcnR5OyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheShpdGVyKSB7XG4gIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXIpIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVyKSA9PT0gXCJbb2JqZWN0IEFyZ3VtZW50c11cIikgcmV0dXJuIEFycmF5LmZyb20oaXRlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheTsiLCJmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7XG4gIHZhciBfYXJyID0gW107XG4gIHZhciBfbiA9IHRydWU7XG4gIHZhciBfZCA9IGZhbHNlO1xuICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XG4gICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZCA9IHRydWU7XG4gICAgX2UgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gX2Fycjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXRlcmFibGVUb0FycmF5TGltaXQ7IiwiZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX25vbkl0ZXJhYmxlUmVzdDsiLCJmdW5jdGlvbiBfbm9uSXRlcmFibGVTcHJlYWQoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gc3ByZWFkIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfbm9uSXRlcmFibGVTcHJlYWQ7IiwidmFyIGFycmF5V2l0aEhvbGVzID0gcmVxdWlyZShcIi4vYXJyYXlXaXRoSG9sZXNcIik7XG5cbnZhciBpdGVyYWJsZVRvQXJyYXlMaW1pdCA9IHJlcXVpcmUoXCIuL2l0ZXJhYmxlVG9BcnJheUxpbWl0XCIpO1xuXG52YXIgbm9uSXRlcmFibGVSZXN0ID0gcmVxdWlyZShcIi4vbm9uSXRlcmFibGVSZXN0XCIpO1xuXG5mdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHtcbiAgcmV0dXJuIGFycmF5V2l0aEhvbGVzKGFycikgfHwgaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBub25JdGVyYWJsZVJlc3QoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfc2xpY2VkVG9BcnJheTsiLCJ2YXIgYXJyYXlXaXRob3V0SG9sZXMgPSByZXF1aXJlKFwiLi9hcnJheVdpdGhvdXRIb2xlc1wiKTtcblxudmFyIGl0ZXJhYmxlVG9BcnJheSA9IHJlcXVpcmUoXCIuL2l0ZXJhYmxlVG9BcnJheVwiKTtcblxudmFyIG5vbkl0ZXJhYmxlU3ByZWFkID0gcmVxdWlyZShcIi4vbm9uSXRlcmFibGVTcHJlYWRcIik7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHtcbiAgcmV0dXJuIGFycmF5V2l0aG91dEhvbGVzKGFycikgfHwgaXRlcmFibGVUb0FycmF5KGFycikgfHwgbm9uSXRlcmFibGVTcHJlYWQoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdG9Db25zdW1hYmxlQXJyYXk7IiwiZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mMiA9IGZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZjIgPSBmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2YyKG9iaik7IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBfdHlwZW9mMihTeW1ib2wuaXRlcmF0b3IpID09PSBcInN5bWJvbFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBfdHlwZW9mMihvYmopO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiBfdHlwZW9mMihvYmopO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF90eXBlb2Y7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYmV6aWVyQ3VydmVUb1BvbHlsaW5lID0gYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xuZXhwb3J0cy5nZXRCZXppZXJDdXJ2ZUxlbmd0aCA9IGdldEJlemllckN1cnZlTGVuZ3RoO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgc3FydCA9IE1hdGguc3FydCxcbiAgICBwb3cgPSBNYXRoLnBvdyxcbiAgICBjZWlsID0gTWF0aC5jZWlsLFxuICAgIGFicyA9IE1hdGguYWJzOyAvLyBJbml0aWFsaXplIHRoZSBudW1iZXIgb2YgcG9pbnRzIHBlciBjdXJ2ZVxuXG52YXIgZGVmYXVsdFNlZ21lbnRQb2ludHNOdW0gPSA1MDtcbi8qKlxyXG4gKiBAZXhhbXBsZSBkYXRhIHN0cnVjdHVyZSBvZiBiZXppZXJDdXJ2ZVxyXG4gKiBiZXppZXJDdXJ2ZSA9IFtcclxuICogIC8vIFN0YXJ0aW5nIHBvaW50IG9mIHRoZSBjdXJ2ZVxyXG4gKiAgWzEwLCAxMF0sXHJcbiAqICAvLyBCZXppZXJDdXJ2ZSBzZWdtZW50IGRhdGEgKGNvbnRyb2xQb2ludDEsIGNvbnRyb2xQb2ludDIsIGVuZFBvaW50KVxyXG4gKiAgW1xyXG4gKiAgICBbMjAsIDIwXSwgWzQwLCAyMF0sIFs1MCwgMTBdXHJcbiAqICBdLFxyXG4gKiAgLi4uXHJcbiAqIF1cclxuICovXG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICAgICAgICBBYnN0cmFjdCB0aGUgY3VydmUgYXMgYSBwb2x5bGluZSBjb25zaXN0aW5nIG9mIE4gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIGJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgY2FsY3VsYXRpb24gYWNjdXJhY3kuIFJlY29tbWVuZGVkIGZvciAxLTIwLiBEZWZhdWx0ID0gNVxyXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAgICBDYWxjdWxhdGlvbiByZXN1bHRzIGFuZCByZWxhdGVkIGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9ICAgICAgICAgICAgT3B0aW9uLnNlZ21lbnRQb2ludHMgUG9pbnQgZGF0YSB0aGF0IGNvbnN0aXR1dGVzIGEgcG9seWxpbmUgYWZ0ZXIgY2FsY3VsYXRpb25cclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgT3B0aW9uLmN5Y2xlcyBOdW1iZXIgb2YgaXRlcmF0aW9uc1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgICBPcHRpb24ucm91bmRzIFRoZSBudW1iZXIgb2YgcmVjdXJzaW9ucyBmb3IgdGhlIGxhc3QgaXRlcmF0aW9uXHJcbiAqL1xuXG5mdW5jdGlvbiBhYnN0cmFjdEJlemllckN1cnZlVG9Qb2x5bGluZShiZXppZXJDdXJ2ZSkge1xuICB2YXIgcHJlY2lzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiA1O1xuICB2YXIgc2VnbWVudHNOdW0gPSBiZXppZXJDdXJ2ZS5sZW5ndGggLSAxO1xuICB2YXIgc3RhcnRQb2ludCA9IGJlemllckN1cnZlWzBdO1xuICB2YXIgZW5kUG9pbnQgPSBiZXppZXJDdXJ2ZVtzZWdtZW50c051bV1bMl07XG4gIHZhciBzZWdtZW50cyA9IGJlemllckN1cnZlLnNsaWNlKDEpO1xuICB2YXIgZ2V0U2VnbWVudFRQb2ludEZ1bnMgPSBzZWdtZW50cy5tYXAoZnVuY3Rpb24gKHNlZywgaSkge1xuICAgIHZhciBiZWdpblBvaW50ID0gaSA9PT0gMCA/IHN0YXJ0UG9pbnQgOiBzZWdtZW50c1tpIC0gMV1bMl07XG4gICAgcmV0dXJuIGNyZWF0ZUdldEJlemllckN1cnZlVFBvaW50RnVuLmFwcGx5KHZvaWQgMCwgW2JlZ2luUG9pbnRdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNlZykpKTtcbiAgfSk7IC8vIEluaXRpYWxpemUgdGhlIGN1cnZlIHRvIGEgcG9seWxpbmVcblxuICB2YXIgc2VnbWVudFBvaW50c051bSA9IG5ldyBBcnJheShzZWdtZW50c051bSkuZmlsbChkZWZhdWx0U2VnbWVudFBvaW50c051bSk7XG4gIHZhciBzZWdtZW50UG9pbnRzID0gZ2V0U2VnbWVudFBvaW50c0J5TnVtKGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50UG9pbnRzTnVtKTsgLy8gQ2FsY3VsYXRlIHVuaWZvcm1seSBkaXN0cmlidXRlZCBwb2ludHMgYnkgaXRlcmF0aXZlbHlcblxuICB2YXIgcmVzdWx0ID0gY2FsY1VuaWZvcm1Qb2ludHNCeUl0ZXJhdGlvbihzZWdtZW50UG9pbnRzLCBnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudHMsIHByZWNpc2lvbik7XG4gIHJlc3VsdC5zZWdtZW50UG9pbnRzLnB1c2goZW5kUG9pbnQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgR2VuZXJhdGUgYSBtZXRob2QgZm9yIG9idGFpbmluZyBjb3JyZXNwb25kaW5nIHBvaW50IGJ5IHQgYWNjb3JkaW5nIHRvIGN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtBcnJheX0gYmVnaW5Qb2ludCAgICBCZXppZXJDdXJ2ZSBiZWdpbiBwb2ludC4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNvbnRyb2xQb2ludDEgQmV6aWVyQ3VydmUgY29udHJvbFBvaW50MS4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNvbnRyb2xQb2ludDIgQmV6aWVyQ3VydmUgY29udHJvbFBvaW50Mi4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGVuZFBvaW50ICAgICAgQmV6aWVyQ3VydmUgZW5kIHBvaW50LiBbeCwgeV1cclxuICogQHJldHVybiB7RnVuY3Rpb259IEV4cGVjdGVkIGZ1bmN0aW9uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNyZWF0ZUdldEJlemllckN1cnZlVFBvaW50RnVuKGJlZ2luUG9pbnQsIGNvbnRyb2xQb2ludDEsIGNvbnRyb2xQb2ludDIsIGVuZFBvaW50KSB7XG4gIHJldHVybiBmdW5jdGlvbiAodCkge1xuICAgIHZhciB0U3ViZWQxID0gMSAtIHQ7XG4gICAgdmFyIHRTdWJlZDFQb3czID0gcG93KHRTdWJlZDEsIDMpO1xuICAgIHZhciB0U3ViZWQxUG93MiA9IHBvdyh0U3ViZWQxLCAyKTtcbiAgICB2YXIgdFBvdzMgPSBwb3codCwgMyk7XG4gICAgdmFyIHRQb3cyID0gcG93KHQsIDIpO1xuICAgIHJldHVybiBbYmVnaW5Qb2ludFswXSAqIHRTdWJlZDFQb3czICsgMyAqIGNvbnRyb2xQb2ludDFbMF0gKiB0ICogdFN1YmVkMVBvdzIgKyAzICogY29udHJvbFBvaW50MlswXSAqIHRQb3cyICogdFN1YmVkMSArIGVuZFBvaW50WzBdICogdFBvdzMsIGJlZ2luUG9pbnRbMV0gKiB0U3ViZWQxUG93MyArIDMgKiBjb250cm9sUG9pbnQxWzFdICogdCAqIHRTdWJlZDFQb3cyICsgMyAqIGNvbnRyb2xQb2ludDJbMV0gKiB0UG93MiAqIHRTdWJlZDEgKyBlbmRQb2ludFsxXSAqIHRQb3czXTtcbiAgfTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQxIEJlemllckN1cnZlIGJlZ2luIHBvaW50LiBbeCwgeV1cclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQyIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDEuIFt4LCB5XVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEV4cGVjdGVkIGRpc3RhbmNlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFR3b1BvaW50RGlzdGFuY2UoX3JlZiwgX3JlZjIpIHtcbiAgdmFyIF9yZWYzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYsIDIpLFxuICAgICAgYXggPSBfcmVmM1swXSxcbiAgICAgIGF5ID0gX3JlZjNbMV07XG5cbiAgdmFyIF9yZWY0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyLCAyKSxcbiAgICAgIGJ4ID0gX3JlZjRbMF0sXG4gICAgICBieSA9IF9yZWY0WzFdO1xuXG4gIHJldHVybiBzcXJ0KHBvdyhheCAtIGJ4LCAyKSArIHBvdyhheSAtIGJ5LCAyKSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgc3VtIG9mIHRoZSBhcnJheSBvZiBudW1iZXJzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IG51bXMgQW4gYXJyYXkgb2YgbnVtYmVyc1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEV4cGVjdGVkIHN1bVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXROdW1zU3VtKG51bXMpIHtcbiAgcmV0dXJuIG51bXMucmVkdWNlKGZ1bmN0aW9uIChzdW0sIG51bSkge1xuICAgIHJldHVybiBzdW0gKyBudW07XG4gIH0sIDApO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHMgTXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSBEaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKHNlZ21lbnRQb2ludHMpIHtcbiAgcmV0dXJuIHNlZ21lbnRQb2ludHMubWFwKGZ1bmN0aW9uIChwb2ludHMsIGkpIHtcbiAgICByZXR1cm4gbmV3IEFycmF5KHBvaW50cy5sZW5ndGggLSAxKS5maWxsKDApLm1hcChmdW5jdGlvbiAodGVtcCwgaikge1xuICAgICAgcmV0dXJuIGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnRzW2pdLCBwb2ludHNbaiArIDFdKTtcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50cyBNdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICogQHJldHVybiB7QXJyYXl9IERpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRTZWdtZW50UG9pbnRzQnlOdW0oZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRQb2ludHNOdW0pIHtcbiAgcmV0dXJuIGdldFNlZ21lbnRUUG9pbnRGdW5zLm1hcChmdW5jdGlvbiAoZ2V0U2VnbWVudFRQb2ludEZ1biwgaSkge1xuICAgIHZhciB0R2FwID0gMSAvIHNlZ21lbnRQb2ludHNOdW1baV07XG4gICAgcmV0dXJuIG5ldyBBcnJheShzZWdtZW50UG9pbnRzTnVtW2ldKS5maWxsKCcnKS5tYXAoZnVuY3Rpb24gKGZvbywgaikge1xuICAgICAgcmV0dXJuIGdldFNlZ21lbnRUUG9pbnRGdW4oaiAqIHRHYXApO1xuICAgIH0pO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBzdW0gb2YgZGV2aWF0aW9ucyBiZXR3ZWVuIGxpbmUgc2VnbWVudCBhbmQgdGhlIGF2ZXJhZ2UgbGVuZ3RoXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHNEaXN0YW5jZSBTZWdtZW50IGxlbmd0aCBvZiBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYXZnTGVuZ3RoICAgICAgICAgICAgQXZlcmFnZSBsZW5ndGggb2YgdGhlIGxpbmUgc2VnbWVudFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERldmlhdGlvbnNcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QWxsRGV2aWF0aW9ucyhzZWdtZW50UG9pbnRzRGlzdGFuY2UsIGF2Z0xlbmd0aCkge1xuICByZXR1cm4gc2VnbWVudFBvaW50c0Rpc3RhbmNlLm1hcChmdW5jdGlvbiAoc2VnKSB7XG4gICAgcmV0dXJuIHNlZy5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBhYnMocyAtIGF2Z0xlbmd0aCk7XG4gICAgfSk7XG4gIH0pLm1hcChmdW5jdGlvbiAoc2VnKSB7XG4gICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgfSkucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgdikge1xuICAgIHJldHVybiB0b3RhbCArIHY7XG4gIH0sIDApO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDYWxjdWxhdGUgdW5pZm9ybWx5IGRpc3RyaWJ1dGVkIHBvaW50cyBieSBpdGVyYXRpdmVseVxyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzICAgICAgICBNdWx0aXBsZSBzZXRkIG9mIHBvaW50cyB0aGF0IG1ha2UgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBnZXRTZWdtZW50VFBvaW50RnVucyBGdW5jdGlvbnMgb2YgZ2V0IGEgcG9pbnQgb24gdGhlIGN1cnZlIHdpdGggdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50cyAgICAgICAgICAgICBCZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gICAgICAgICAgIENhbGN1bGF0aW9uIGFjY3VyYWN5XHJcbiAqIEByZXR1cm4ge09iamVjdH0gQ2FsY3VsYXRpb24gcmVzdWx0cyBhbmQgcmVsYXRlZCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgT3B0aW9uLnNlZ21lbnRQb2ludHMgUG9pbnQgZGF0YSB0aGF0IGNvbnN0aXR1dGVzIGEgcG9seWxpbmUgYWZ0ZXIgY2FsY3VsYXRpb25cclxuICogQHJldHVybiB7TnVtYmVyfSBPcHRpb24uY3ljbGVzIE51bWJlciBvZiBpdGVyYXRpb25zXHJcbiAqIEByZXR1cm4ge051bWJlcn0gT3B0aW9uLnJvdW5kcyBUaGUgbnVtYmVyIG9mIHJlY3Vyc2lvbnMgZm9yIHRoZSBsYXN0IGl0ZXJhdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBjYWxjVW5pZm9ybVBvaW50c0J5SXRlcmF0aW9uKHNlZ21lbnRQb2ludHMsIGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50cywgcHJlY2lzaW9uKSB7XG4gIC8vIFRoZSBudW1iZXIgb2YgbG9vcHMgZm9yIHRoZSBjdXJyZW50IGl0ZXJhdGlvblxuICB2YXIgcm91bmRzID0gNDsgLy8gTnVtYmVyIG9mIGl0ZXJhdGlvbnNcblxuICB2YXIgY3ljbGVzID0gMTtcblxuICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcCgpIHtcbiAgICAvLyBSZWNhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIHBvaW50cyBwZXIgY3VydmUgYmFzZWQgb24gdGhlIGxhc3QgaXRlcmF0aW9uIGRhdGFcbiAgICB2YXIgdG90YWxQb2ludHNOdW0gPSBzZWdtZW50UG9pbnRzLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTsgLy8gQWRkIGxhc3QgcG9pbnRzIG9mIHNlZ21lbnQgdG8gY2FsYyBleGFjdCBzZWdtZW50IGxlbmd0aFxuXG4gICAgc2VnbWVudFBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChzZWcsIGkpIHtcbiAgICAgIHJldHVybiBzZWcucHVzaChzZWdtZW50c1tpXVsyXSk7XG4gICAgfSk7XG4gICAgdmFyIHNlZ21lbnRQb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzKTtcbiAgICB2YXIgbGluZVNlZ21lbnROdW0gPSBzZWdtZW50UG9pbnRzRGlzdGFuY2UucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgc2VnKSB7XG4gICAgICByZXR1cm4gdG90YWwgKyBzZWcubGVuZ3RoO1xuICAgIH0sIDApO1xuICAgIHZhciBzZWdtZW50bGVuZ3RoID0gc2VnbWVudFBvaW50c0Rpc3RhbmNlLm1hcChmdW5jdGlvbiAoc2VnKSB7XG4gICAgICByZXR1cm4gZ2V0TnVtc1N1bShzZWcpO1xuICAgIH0pO1xuICAgIHZhciB0b3RhbExlbmd0aCA9IGdldE51bXNTdW0oc2VnbWVudGxlbmd0aCk7XG4gICAgdmFyIGF2Z0xlbmd0aCA9IHRvdGFsTGVuZ3RoIC8gbGluZVNlZ21lbnROdW07IC8vIENoZWNrIGlmIHByZWNpc2lvbiBpcyByZWFjaGVkXG5cbiAgICB2YXIgYWxsRGV2aWF0aW9ucyA9IGdldEFsbERldmlhdGlvbnMoc2VnbWVudFBvaW50c0Rpc3RhbmNlLCBhdmdMZW5ndGgpO1xuICAgIGlmIChhbGxEZXZpYXRpb25zIDw9IHByZWNpc2lvbikgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICB0b3RhbFBvaW50c051bSA9IGNlaWwoYXZnTGVuZ3RoIC8gcHJlY2lzaW9uICogdG90YWxQb2ludHNOdW0gKiAxLjEpO1xuICAgIHZhciBzZWdtZW50UG9pbnRzTnVtID0gc2VnbWVudGxlbmd0aC5tYXAoZnVuY3Rpb24gKGxlbmd0aCkge1xuICAgICAgcmV0dXJuIGNlaWwobGVuZ3RoIC8gdG90YWxMZW5ndGggKiB0b3RhbFBvaW50c051bSk7XG4gICAgfSk7IC8vIENhbGN1bGF0ZSB0aGUgcG9pbnRzIGFmdGVyIHJlZGlzdHJpYnV0aW9uXG5cbiAgICBzZWdtZW50UG9pbnRzID0gZ2V0U2VnbWVudFBvaW50c0J5TnVtKGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50UG9pbnRzTnVtKTtcbiAgICB0b3RhbFBvaW50c051bSA9IHNlZ21lbnRQb2ludHMucmVkdWNlKGZ1bmN0aW9uICh0b3RhbCwgc2VnKSB7XG4gICAgICByZXR1cm4gdG90YWwgKyBzZWcubGVuZ3RoO1xuICAgIH0sIDApO1xuICAgIHZhciBzZWdtZW50UG9pbnRzRm9yTGVuZ3RoID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzZWdtZW50UG9pbnRzKSk7XG4gICAgc2VnbWVudFBvaW50c0Zvckxlbmd0aC5mb3JFYWNoKGZ1bmN0aW9uIChzZWcsIGkpIHtcbiAgICAgIHJldHVybiBzZWcucHVzaChzZWdtZW50c1tpXVsyXSk7XG4gICAgfSk7XG4gICAgc2VnbWVudFBvaW50c0Rpc3RhbmNlID0gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKHNlZ21lbnRQb2ludHNGb3JMZW5ndGgpO1xuICAgIGxpbmVTZWdtZW50TnVtID0gc2VnbWVudFBvaW50c0Rpc3RhbmNlLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICBzZWdtZW50bGVuZ3RoID0gc2VnbWVudFBvaW50c0Rpc3RhbmNlLm1hcChmdW5jdGlvbiAoc2VnKSB7XG4gICAgICByZXR1cm4gZ2V0TnVtc1N1bShzZWcpO1xuICAgIH0pO1xuICAgIHRvdGFsTGVuZ3RoID0gZ2V0TnVtc1N1bShzZWdtZW50bGVuZ3RoKTtcbiAgICBhdmdMZW5ndGggPSB0b3RhbExlbmd0aCAvIGxpbmVTZWdtZW50TnVtO1xuICAgIHZhciBzdGVwU2l6ZSA9IDEgLyB0b3RhbFBvaW50c051bSAvIDEwOyAvLyBSZWN1cnNpdmVseSBmb3IgZWFjaCBzZWdtZW50IG9mIHRoZSBwb2x5bGluZVxuXG4gICAgZ2V0U2VnbWVudFRQb2ludEZ1bnMuZm9yRWFjaChmdW5jdGlvbiAoZ2V0U2VnbWVudFRQb2ludEZ1biwgaSkge1xuICAgICAgdmFyIGN1cnJlbnRTZWdtZW50UG9pbnRzTnVtID0gc2VnbWVudFBvaW50c051bVtpXTtcbiAgICAgIHZhciB0ID0gbmV3IEFycmF5KGN1cnJlbnRTZWdtZW50UG9pbnRzTnVtKS5maWxsKCcnKS5tYXAoZnVuY3Rpb24gKGZvbywgaikge1xuICAgICAgICByZXR1cm4gaiAvIHNlZ21lbnRQb2ludHNOdW1baV07XG4gICAgICB9KTsgLy8gUmVwZWF0ZWQgcmVjdXJzaXZlIG9mZnNldFxuXG4gICAgICBmb3IgKHZhciByID0gMDsgciA8IHJvdW5kczsgcisrKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShbc2VnbWVudFBvaW50c1tpXV0pWzBdO1xuICAgICAgICB2YXIgZGV2aWF0aW9ucyA9IGRpc3RhbmNlLm1hcChmdW5jdGlvbiAoZCkge1xuICAgICAgICAgIHJldHVybiBkIC0gYXZnTGVuZ3RoO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjdXJyZW50U2VnbWVudFBvaW50c051bTsgaisrKSB7XG4gICAgICAgICAgaWYgKGogPT09IDApIHJldHVybjtcbiAgICAgICAgICBvZmZzZXQgKz0gZGV2aWF0aW9uc1tqIC0gMV07XG4gICAgICAgICAgdFtqXSAtPSBzdGVwU2l6ZSAqIG9mZnNldDtcbiAgICAgICAgICBpZiAodFtqXSA+IDEpIHRbal0gPSAxO1xuICAgICAgICAgIGlmICh0W2pdIDwgMCkgdFtqXSA9IDA7XG4gICAgICAgICAgc2VnbWVudFBvaW50c1tpXVtqXSA9IGdldFNlZ21lbnRUUG9pbnRGdW4odFtqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByb3VuZHMgKj0gNDtcbiAgICBjeWNsZXMrKztcbiAgfTtcblxuICBkbyB7XG4gICAgdmFyIF9yZXQgPSBfbG9vcCgpO1xuXG4gICAgaWYgKF9yZXQgPT09IFwiYnJlYWtcIikgYnJlYWs7XG4gIH0gd2hpbGUgKHJvdW5kcyA8PSAxMDI1KTtcblxuICBzZWdtZW50UG9pbnRzID0gc2VnbWVudFBvaW50cy5yZWR1Y2UoZnVuY3Rpb24gKGFsbCwgc2VnKSB7XG4gICAgcmV0dXJuIGFsbC5jb25jYXQoc2VnKTtcbiAgfSwgW10pO1xuICByZXR1cm4ge1xuICAgIHNlZ21lbnRQb2ludHM6IHNlZ21lbnRQb2ludHMsXG4gICAgY3ljbGVzOiBjeWNsZXMsXG4gICAgcm91bmRzOiByb3VuZHNcbiAgfTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwb2x5bGluZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBCZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgQmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICBDYWxjdWxhdGlvbiBhY2N1cmFjeS4gUmVjb21tZW5kZWQgZm9yIDEtMjAuIERlZmF1bHQgPSA1XHJcbiAqIEByZXR1cm4ge0FycmF5fEJvb2xlYW59IFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBiZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcblxuICBpZiAoIWJlemllckN1cnZlKSB7XG4gICAgY29uc29sZS5lcnJvcignYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCEoYmV6aWVyQ3VydmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IFBhcmFtZXRlciBiZXppZXJDdXJ2ZSBtdXN0IGJlIGFuIGFycmF5IScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJlY2lzaW9uICE9PSAnbnVtYmVyJykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2JlemllckN1cnZlVG9Qb2x5bGluZTogUGFyYW1ldGVyIHByZWNpc2lvbiBtdXN0IGJlIGEgbnVtYmVyIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBfYWJzdHJhY3RCZXppZXJDdXJ2ZVQgPSBhYnN0cmFjdEJlemllckN1cnZlVG9Qb2x5bGluZShiZXppZXJDdXJ2ZSwgcHJlY2lzaW9uKSxcbiAgICAgIHNlZ21lbnRQb2ludHMgPSBfYWJzdHJhY3RCZXppZXJDdXJ2ZVQuc2VnbWVudFBvaW50cztcblxuICByZXR1cm4gc2VnbWVudFBvaW50cztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBiZXppZXIgY3VydmUgbGVuZ3RoXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIGJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgY2FsY3VsYXRpb24gYWNjdXJhY3kuIFJlY29tbWVuZGVkIGZvciA1LTEwLiBEZWZhdWx0ID0gNVxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ8Qm9vbGVhbn0gQmV6aWVyQ3VydmUgbGVuZ3RoIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZUxlbmd0aChiZXppZXJDdXJ2ZSkge1xuICB2YXIgcHJlY2lzaW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiA1O1xuXG4gIGlmICghYmV6aWVyQ3VydmUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRCZXppZXJDdXJ2ZUxlbmd0aDogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghKGJlemllckN1cnZlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IFBhcmFtZXRlciBiZXppZXJDdXJ2ZSBtdXN0IGJlIGFuIGFycmF5IScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJlY2lzaW9uICE9PSAnbnVtYmVyJykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldEJlemllckN1cnZlTGVuZ3RoOiBQYXJhbWV0ZXIgcHJlY2lzaW9uIG11c3QgYmUgYSBudW1iZXIhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIF9hYnN0cmFjdEJlemllckN1cnZlVDIgPSBhYnN0cmFjdEJlemllckN1cnZlVG9Qb2x5bGluZShiZXppZXJDdXJ2ZSwgcHJlY2lzaW9uKSxcbiAgICAgIHNlZ21lbnRQb2ludHMgPSBfYWJzdHJhY3RCZXppZXJDdXJ2ZVQyLnNlZ21lbnRQb2ludHM7IC8vIENhbGN1bGF0ZSB0aGUgdG90YWwgbGVuZ3RoIG9mIHRoZSBwb2ludHMgdGhhdCBtYWtlIHVwIHRoZSBwb2x5bGluZVxuXG5cbiAgdmFyIHBvaW50c0Rpc3RhbmNlID0gZ2V0U2VnbWVudFBvaW50c0Rpc3RhbmNlKFtzZWdtZW50UG9pbnRzXSlbMF07XG4gIHZhciBsZW5ndGggPSBnZXROdW1zU3VtKHBvaW50c0Rpc3RhbmNlKTtcbiAgcmV0dXJuIGxlbmd0aDtcbn1cblxudmFyIF9kZWZhdWx0ID0gYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQWJzdHJhY3QgdGhlIHBvbHlsaW5lIGZvcm1lZCBieSBOIHBvaW50cyBpbnRvIGEgc2V0IG9mIGJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5bGluZSBBIHNldCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtCb29sZWFufSBjbG9zZSAgQ2xvc2VkIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRBIFNtb290aG5lc3NcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldEIgU21vb3RobmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheXxCb29sZWFufSBBIHNldCBvZiBiZXppZXIgY3VydmUgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuZnVuY3Rpb24gcG9seWxpbmVUb0JlemllckN1cnZlKHBvbHlsaW5lKSB7XG4gIHZhciBjbG9zZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gIHZhciBvZmZzZXRBID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAwLjI1O1xuICB2YXIgb2Zmc2V0QiA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMC4yNTtcblxuICBpZiAoIShwb2x5bGluZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BvbHlsaW5lVG9CZXppZXJDdXJ2ZTogUGFyYW1ldGVyIHBvbHlsaW5lIG11c3QgYmUgYW4gYXJyYXkhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHBvbHlsaW5lLmxlbmd0aCA8PSAyKSB7XG4gICAgY29uc29sZS5lcnJvcigncG9seWxpbmVUb0JlemllckN1cnZlOiBDb252ZXJ0aW5nIHRvIGEgY3VydmUgcmVxdWlyZXMgYXQgbGVhc3QgMyBwb2ludHMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHN0YXJ0UG9pbnQgPSBwb2x5bGluZVswXTtcbiAgdmFyIGJlemllckN1cnZlTGluZU51bSA9IHBvbHlsaW5lLmxlbmd0aCAtIDE7XG4gIHZhciBiZXppZXJDdXJ2ZVBvaW50cyA9IG5ldyBBcnJheShiZXppZXJDdXJ2ZUxpbmVOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gW10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZ2V0QmV6aWVyQ3VydmVMaW5lQ29udHJvbFBvaW50cyhwb2x5bGluZSwgaSwgY2xvc2UsIG9mZnNldEEsIG9mZnNldEIpKSwgW3BvbHlsaW5lW2kgKyAxXV0pO1xuICB9KTtcbiAgaWYgKGNsb3NlKSBjbG9zZUJlemllckN1cnZlKGJlemllckN1cnZlUG9pbnRzLCBzdGFydFBvaW50KTtcbiAgYmV6aWVyQ3VydmVQb2ludHMudW5zaGlmdChwb2x5bGluZVswXSk7XG4gIHJldHVybiBiZXppZXJDdXJ2ZVBvaW50cztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb250cm9sIHBvaW50cyBvZiB0aGUgQmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlsaW5lIEEgc2V0IG9mIHBvaW50cyB0aGF0IG1ha2UgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXggICBUaGUgaW5kZXggb2Ygd2hpY2ggZ2V0IGNvbnRyb2xzIHBvaW50cydzIHBvaW50IGluIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgIENsb3NlZCBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QSBTbW9vdGhuZXNzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRCIFNtb290aG5lc3NcclxuICogQHJldHVybiB7QXJyYXl9IENvbnRyb2wgcG9pbnRzXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlTGluZUNvbnRyb2xQb2ludHMocG9seWxpbmUsIGluZGV4KSB7XG4gIHZhciBjbG9zZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBvZmZzZXRBID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAwLjI1O1xuICB2YXIgb2Zmc2V0QiA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogMC4yNTtcbiAgdmFyIHBvaW50TnVtID0gcG9seWxpbmUubGVuZ3RoO1xuICBpZiAocG9pbnROdW0gPCAzIHx8IGluZGV4ID49IHBvaW50TnVtKSByZXR1cm47XG4gIHZhciBiZWZvcmVQb2ludEluZGV4ID0gaW5kZXggLSAxO1xuICBpZiAoYmVmb3JlUG9pbnRJbmRleCA8IDApIGJlZm9yZVBvaW50SW5kZXggPSBjbG9zZSA/IHBvaW50TnVtICsgYmVmb3JlUG9pbnRJbmRleCA6IDA7XG4gIHZhciBhZnRlclBvaW50SW5kZXggPSBpbmRleCArIDE7XG4gIGlmIChhZnRlclBvaW50SW5kZXggPj0gcG9pbnROdW0pIGFmdGVyUG9pbnRJbmRleCA9IGNsb3NlID8gYWZ0ZXJQb2ludEluZGV4IC0gcG9pbnROdW0gOiBwb2ludE51bSAtIDE7XG4gIHZhciBhZnRlck5leHRQb2ludEluZGV4ID0gaW5kZXggKyAyO1xuICBpZiAoYWZ0ZXJOZXh0UG9pbnRJbmRleCA+PSBwb2ludE51bSkgYWZ0ZXJOZXh0UG9pbnRJbmRleCA9IGNsb3NlID8gYWZ0ZXJOZXh0UG9pbnRJbmRleCAtIHBvaW50TnVtIDogcG9pbnROdW0gLSAxO1xuICB2YXIgcG9pbnRCZWZvcmUgPSBwb2x5bGluZVtiZWZvcmVQb2ludEluZGV4XTtcbiAgdmFyIHBvaW50TWlkZGxlID0gcG9seWxpbmVbaW5kZXhdO1xuICB2YXIgcG9pbnRBZnRlciA9IHBvbHlsaW5lW2FmdGVyUG9pbnRJbmRleF07XG4gIHZhciBwb2ludEFmdGVyTmV4dCA9IHBvbHlsaW5lW2FmdGVyTmV4dFBvaW50SW5kZXhdO1xuICByZXR1cm4gW1twb2ludE1pZGRsZVswXSArIG9mZnNldEEgKiAocG9pbnRBZnRlclswXSAtIHBvaW50QmVmb3JlWzBdKSwgcG9pbnRNaWRkbGVbMV0gKyBvZmZzZXRBICogKHBvaW50QWZ0ZXJbMV0gLSBwb2ludEJlZm9yZVsxXSldLCBbcG9pbnRBZnRlclswXSAtIG9mZnNldEIgKiAocG9pbnRBZnRlck5leHRbMF0gLSBwb2ludE1pZGRsZVswXSksIHBvaW50QWZ0ZXJbMV0gLSBvZmZzZXRCICogKHBvaW50QWZ0ZXJOZXh0WzFdIC0gcG9pbnRNaWRkbGVbMV0pXV07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgbGFzdCBjdXJ2ZSBvZiB0aGUgY2xvc3VyZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBBIHNldCBvZiBzdWItY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gc3RhcnRQb2ludCAgU3RhcnQgcG9pbnRcclxuICogQHJldHVybiB7QXJyYXl9IFRoZSBsYXN0IGN1cnZlIGZvciBjbG9zdXJlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNsb3NlQmV6aWVyQ3VydmUoYmV6aWVyQ3VydmUsIHN0YXJ0UG9pbnQpIHtcbiAgdmFyIGZpcnN0U3ViQ3VydmUgPSBiZXppZXJDdXJ2ZVswXTtcbiAgdmFyIGxhc3RTdWJDdXJ2ZSA9IGJlemllckN1cnZlLnNsaWNlKC0xKVswXTtcbiAgYmV6aWVyQ3VydmUucHVzaChbZ2V0U3ltbWV0cnlQb2ludChsYXN0U3ViQ3VydmVbMV0sIGxhc3RTdWJDdXJ2ZVsyXSksIGdldFN5bW1ldHJ5UG9pbnQoZmlyc3RTdWJDdXJ2ZVswXSwgc3RhcnRQb2ludCksIHN0YXJ0UG9pbnRdKTtcbiAgcmV0dXJuIGJlemllckN1cnZlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN5bW1ldHJ5IHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICAgIFN5bW1ldHJpYyBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBjZW50ZXJQb2ludCBTeW1tZXRyaWMgY2VudGVyXHJcbiAqIEByZXR1cm4ge0FycmF5fSBTeW1tZXRyaWMgcG9pbnRcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U3ltbWV0cnlQb2ludChwb2ludCwgY2VudGVyUG9pbnQpIHtcbiAgdmFyIF9wb2ludCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICBweCA9IF9wb2ludFswXSxcbiAgICAgIHB5ID0gX3BvaW50WzFdO1xuXG4gIHZhciBfY2VudGVyUG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9pbnQsIDIpLFxuICAgICAgY3ggPSBfY2VudGVyUG9pbnRbMF0sXG4gICAgICBjeSA9IF9jZW50ZXJQb2ludFsxXTtcblxuICB2YXIgbWludXNYID0gY3ggLSBweDtcbiAgdmFyIG1pbnVzWSA9IGN5IC0gcHk7XG4gIHJldHVybiBbY3ggKyBtaW51c1gsIGN5ICsgbWludXNZXTtcbn1cblxudmFyIF9kZWZhdWx0ID0gcG9seWxpbmVUb0JlemllckN1cnZlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJiZXppZXJDdXJ2ZVRvUG9seWxpbmVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2JlemllckN1cnZlVG9Qb2x5bGluZS5iZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2V0QmV6aWVyQ3VydmVMZW5ndGhcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2JlemllckN1cnZlVG9Qb2x5bGluZS5nZXRCZXppZXJDdXJ2ZUxlbmd0aDtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJwb2x5bGluZVRvQmV6aWVyQ3VydmVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3BvbHlsaW5lVG9CZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl07XG4gIH1cbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lID0gcmVxdWlyZShcIi4vY29yZS9iZXppZXJDdXJ2ZVRvUG9seWxpbmVcIik7XG5cbnZhciBfcG9seWxpbmVUb0JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jb3JlL3BvbHlsaW5lVG9CZXppZXJDdXJ2ZVwiKSk7XG5cbnZhciBfZGVmYXVsdCA9IHtcbiAgYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmJlemllckN1cnZlVG9Qb2x5bGluZSxcbiAgZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuZ2V0QmV6aWVyQ3VydmVMZW5ndGgsXG4gIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZTogX3BvbHlsaW5lVG9CZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl1cbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG52YXIgX2NvbG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKSk7XG5cbnZhciBfYmV6aWVyQ3VydmUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAamlhbWluZ2hpL2Jlemllci1jdXJ2ZVwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9ncmFwaHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuLi9jb25maWcvZ3JhcGhzXCIpKTtcblxudmFyIF9ncmFwaCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vZ3JhcGguY2xhc3NcIikpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgICAgQ2xhc3Mgb2YgQ1JlbmRlclxyXG4gKiBAcGFyYW0ge09iamVjdH0gY2FudmFzIENhbnZhcyBET01cclxuICogQHJldHVybiB7Q1JlbmRlcn0gICAgICBJbnN0YW5jZSBvZiBDUmVuZGVyXHJcbiAqL1xudmFyIENSZW5kZXIgPSBmdW5jdGlvbiBDUmVuZGVyKGNhbnZhcykge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIENSZW5kZXIpO1xuXG4gIGlmICghY2FudmFzKSB7XG4gICAgY29uc29sZS5lcnJvcignQ1JlbmRlciBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICB2YXIgY2xpZW50V2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGgsXG4gICAgICBjbGllbnRIZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0O1xuICB2YXIgYXJlYSA9IFtjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0XTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBjbGllbnRXaWR0aCk7XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGNsaWVudEhlaWdodCk7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBDb250ZXh0IG9mIHRoZSBjYW52YXNcclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBleGFtcGxlIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXHJcbiAgICovXG5cbiAgdGhpcy5jdHggPSBjdHg7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBXaWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSBjYW52YXNcclxuICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICogQGV4YW1wbGUgYXJlYSA9IFszMDDvvIwxMDBdXHJcbiAgICovXG5cbiAgdGhpcy5hcmVhID0gYXJlYTtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgcmVuZGVyIGlzIGluIGFuaW1hdGlvbiByZW5kZXJpbmdcclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgKiBAZXhhbXBsZSBhbmltYXRpb25TdGF0dXMgPSB0cnVlfGZhbHNlXHJcbiAgICovXG5cbiAgdGhpcy5hbmltYXRpb25TdGF0dXMgPSBmYWxzZTtcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEFkZGVkIGdyYXBoXHJcbiAgICogQHR5cGUge1tHcmFwaF19XHJcbiAgICogQGV4YW1wbGUgZ3JhcGhzID0gW0dyYXBoLCBHcmFwaCwgLi4uXVxyXG4gICAqL1xuXG4gIHRoaXMuZ3JhcGhzID0gW107XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBDb2xvciBwbHVnaW5cclxuICAgKiBAdHlwZSB7T2JqZWN0fVxyXG4gICAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9qaWFtaW5nNzQzL2NvbG9yXHJcbiAgICovXG5cbiAgdGhpcy5jb2xvciA9IF9jb2xvcltcImRlZmF1bHRcIl07XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBCZXppZXIgQ3VydmUgcGx1Z2luXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vamlhbWluZzc0My9CZXppZXJDdXJ2ZVxyXG4gICAqL1xuXG4gIHRoaXMuYmV6aWVyQ3VydmUgPSBfYmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdOyAvLyBiaW5kIGV2ZW50IGhhbmRsZXJcblxuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgbW91c2VEb3duLmJpbmQodGhpcykpO1xuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG1vdXNlVXAuYmluZCh0aGlzKSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgQ2xlYXIgY2FudmFzIGRyYXdpbmcgYXJlYVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBDUmVuZGVyO1xuXG5DUmVuZGVyLnByb3RvdHlwZS5jbGVhckFyZWEgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyRjdHg7XG5cbiAgdmFyIGFyZWEgPSB0aGlzLmFyZWE7XG5cbiAgKF90aGlzJGN0eCA9IHRoaXMuY3R4KS5jbGVhclJlY3QuYXBwbHkoX3RoaXMkY3R4LCBbMCwgMF0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXJlYSkpKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICBBZGQgZ3JhcGggdG8gcmVuZGVyXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgR3JhcGggY29uZmlndXJhdGlvblxyXG4gKiBAcmV0dXJuIHtHcmFwaH0gICAgICAgIEdyYXBoIGluc3RhbmNlXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbmZpZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gIHZhciBuYW1lID0gY29uZmlnLm5hbWU7XG5cbiAgaWYgKCFuYW1lKSB7XG4gICAgY29uc29sZS5lcnJvcignYWRkIE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZ3JhcGhDb25maWcgPSBfZ3JhcGhzW1wiZGVmYXVsdFwiXS5nZXQobmFtZSk7XG5cbiAgaWYgKCFncmFwaENvbmZpZykge1xuICAgIGNvbnNvbGUud2FybignTm8gY29ycmVzcG9uZGluZyBncmFwaCBjb25maWd1cmF0aW9uIGZvdW5kIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBncmFwaCA9IG5ldyBfZ3JhcGhbXCJkZWZhdWx0XCJdKGdyYXBoQ29uZmlnLCBjb25maWcpO1xuICBpZiAoIWdyYXBoLnZhbGlkYXRvcihncmFwaCkpIHJldHVybjtcbiAgZ3JhcGgucmVuZGVyID0gdGhpcztcbiAgdGhpcy5ncmFwaHMucHVzaChncmFwaCk7XG4gIHRoaXMuc29ydEdyYXBoc0J5SW5kZXgoKTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbiAgcmV0dXJuIGdyYXBoO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU29ydCB0aGUgZ3JhcGggYnkgaW5kZXhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLnNvcnRHcmFwaHNCeUluZGV4ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIGdyYXBocy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEuaW5kZXggPiBiLmluZGV4KSByZXR1cm4gMTtcbiAgICBpZiAoYS5pbmRleCA9PT0gYi5pbmRleCkgcmV0dXJuIDA7XG4gICAgaWYgKGEuaW5kZXggPCBiLmluZGV4KSByZXR1cm4gLTE7XG4gIH0pO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICBEZWxldGUgZ3JhcGggaW4gcmVuZGVyXHJcbiAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoIFRoZSBncmFwaCB0byBiZSBkZWxldGVkXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gIFZvaWRcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuZGVsR3JhcGggPSBmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgaWYgKHR5cGVvZiBncmFwaC5kZWxQcm9jZXNzb3IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgZ3JhcGguZGVsUHJvY2Vzc29yKHRoaXMpO1xuICB0aGlzLmdyYXBocyA9IHRoaXMuZ3JhcGhzLmZpbHRlcihmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGg7XG4gIH0pO1xuICB0aGlzLmRyYXdBbGxHcmFwaCgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgIERlbGV0ZSBhbGwgZ3JhcGggaW4gcmVuZGVyXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5kZWxBbGxHcmFwaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB0aGlzLmdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5kZWxQcm9jZXNzb3IoX3RoaXMpO1xuICB9KTtcbiAgdGhpcy5ncmFwaHMgPSB0aGlzLmdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9KTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICBEcmF3IGFsbCB0aGUgZ3JhcGhzIGluIHRoZSByZW5kZXJcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmRyYXdBbGxHcmFwaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgdGhpcy5jbGVhckFyZWEoKTtcbiAgdGhpcy5ncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaCAmJiBncmFwaC52aXNpYmxlO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5kcmF3UHJvY2Vzc29yKF90aGlzMiwgZ3JhcGgpO1xuICB9KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgQW5pbWF0ZSB0aGUgZ3JhcGggd2hvc2UgYW5pbWF0aW9uIHF1ZXVlIGlzIG5vdCBlbXB0eVxyXG4gKiAgICAgICAgICAgICAgICAgICBhbmQgdGhlIGFuaW1hdGlvblBhdXNlIGlzIGVxdWFsIHRvIGZhbHNlXHJcbiAqIEByZXR1cm4ge1Byb21pc2V9IEFuaW1hdGlvbiBQcm9taXNlXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmxhdW5jaEFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgdmFyIGFuaW1hdGlvblN0YXR1cyA9IHRoaXMuYW5pbWF0aW9uU3RhdHVzO1xuICBpZiAoYW5pbWF0aW9uU3RhdHVzKSByZXR1cm47XG4gIHRoaXMuYW5pbWF0aW9uU3RhdHVzID0gdHJ1ZTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgYW5pbWF0aW9uLmNhbGwoX3RoaXMzLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpczMuYW5pbWF0aW9uU3RhdHVzID0gZmFsc2U7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSwgRGF0ZS5ub3coKSk7XG4gIH0pO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gVHJ5IHRvIGFuaW1hdGUgZXZlcnkgZ3JhcGhcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaW4gYW5pbWF0aW9uIGVuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZVN0YW1wICBUaW1lIHN0YW1wIG9mIGFuaW1hdGlvbiBzdGFydFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gYW5pbWF0aW9uKGNhbGxiYWNrLCB0aW1lU3RhbXApIHtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuXG4gIGlmICghYW5pbWF0aW9uQWJsZShncmFwaHMpKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGgudHVybk5leHRBbmltYXRpb25GcmFtZSh0aW1lU3RhbXApO1xuICB9KTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbi5iaW5kKHRoaXMsIGNhbGxiYWNrLCB0aW1lU3RhbXApKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRmluZCBpZiB0aGVyZSBhcmUgZ3JhcGggdGhhdCBjYW4gYmUgYW5pbWF0ZWRcclxuICogQHBhcmFtIHtbR3JhcGhdfSBncmFwaHNcclxuICogQHJldHVybiB7Qm9vbGVhbn1cclxuICovXG5cblxuZnVuY3Rpb24gYW5pbWF0aW9uQWJsZShncmFwaHMpIHtcbiAgcmV0dXJuIGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiAhZ3JhcGguYW5pbWF0aW9uUGF1c2UgJiYgZ3JhcGguYW5pbWF0aW9uRnJhbWVTdGF0ZS5sZW5ndGg7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVyIG9mIENSZW5kZXIgbW91c2Vkb3duIGV2ZW50XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBtb3VzZURvd24oZSkge1xuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHM7XG4gIHZhciBob3ZlckdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2hvdmVyJztcbiAgfSk7XG4gIGlmICghaG92ZXJHcmFwaCkgcmV0dXJuO1xuICBob3ZlckdyYXBoLnN0YXR1cyA9ICdhY3RpdmUnO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVyIG9mIENSZW5kZXIgbW91c2Vtb3ZlIGV2ZW50XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBtb3VzZU1vdmUoZSkge1xuICB2YXIgb2Zmc2V0WCA9IGUub2Zmc2V0WCxcbiAgICAgIG9mZnNldFkgPSBlLm9mZnNldFk7XG4gIHZhciBwb3NpdGlvbiA9IFtvZmZzZXRYLCBvZmZzZXRZXTtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuICB2YXIgYWN0aXZlR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnYWN0aXZlJyB8fCBncmFwaC5zdGF0dXMgPT09ICdkcmFnJztcbiAgfSk7XG5cbiAgaWYgKGFjdGl2ZUdyYXBoKSB7XG4gICAgaWYgKCFhY3RpdmVHcmFwaC5kcmFnKSByZXR1cm47XG5cbiAgICBpZiAodHlwZW9mIGFjdGl2ZUdyYXBoLm1vdmUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIG1vdmUgbWV0aG9kIGlzIHByb3ZpZGVkLCBjYW5ub3QgYmUgZHJhZ2dlZCEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY3RpdmVHcmFwaC5tb3ZlUHJvY2Vzc29yKGUpO1xuICAgIGFjdGl2ZUdyYXBoLnN0YXR1cyA9ICdkcmFnJztcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaG92ZXJHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdob3Zlcic7XG4gIH0pO1xuICB2YXIgaG92ZXJBYmxlR3JhcGhzID0gZ3JhcGhzLmZpbHRlcihmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguaG92ZXIgJiYgKHR5cGVvZiBncmFwaC5ob3ZlckNoZWNrID09PSAnZnVuY3Rpb24nIHx8IGdyYXBoLmhvdmVyUmVjdCk7XG4gIH0pO1xuICB2YXIgaG92ZXJlZEdyYXBoID0gaG92ZXJBYmxlR3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLmhvdmVyQ2hlY2tQcm9jZXNzb3IocG9zaXRpb24sIGdyYXBoKTtcbiAgfSk7XG5cbiAgaWYgKGhvdmVyZWRHcmFwaCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gaG92ZXJlZEdyYXBoLnN0eWxlLmhvdmVyQ3Vyc29yO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICB9XG5cbiAgdmFyIGhvdmVyR3JhcGhNb3VzZU91dGVySXNGdW4gPSBmYWxzZSxcbiAgICAgIGhvdmVyZWRHcmFwaE1vdXNlRW50ZXJJc0Z1biA9IGZhbHNlO1xuICBpZiAoaG92ZXJHcmFwaCkgaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1biA9IHR5cGVvZiBob3ZlckdyYXBoLm1vdXNlT3V0ZXIgPT09ICdmdW5jdGlvbic7XG4gIGlmIChob3ZlcmVkR3JhcGgpIGhvdmVyZWRHcmFwaE1vdXNlRW50ZXJJc0Z1biA9IHR5cGVvZiBob3ZlcmVkR3JhcGgubW91c2VFbnRlciA9PT0gJ2Z1bmN0aW9uJztcbiAgaWYgKCFob3ZlcmVkR3JhcGggJiYgIWhvdmVyR3JhcGgpIHJldHVybjtcblxuICBpZiAoIWhvdmVyZWRHcmFwaCAmJiBob3ZlckdyYXBoKSB7XG4gICAgaWYgKGhvdmVyR3JhcGhNb3VzZU91dGVySXNGdW4pIGhvdmVyR3JhcGgubW91c2VPdXRlcihlLCBob3ZlckdyYXBoKTtcbiAgICBob3ZlckdyYXBoLnN0YXR1cyA9ICdzdGF0aWMnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChob3ZlcmVkR3JhcGggJiYgaG92ZXJlZEdyYXBoID09PSBob3ZlckdyYXBoKSByZXR1cm47XG5cbiAgaWYgKGhvdmVyZWRHcmFwaCAmJiAhaG92ZXJHcmFwaCkge1xuICAgIGlmIChob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4pIGhvdmVyZWRHcmFwaC5tb3VzZUVudGVyKGUsIGhvdmVyZWRHcmFwaCk7XG4gICAgaG92ZXJlZEdyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGhvdmVyZWRHcmFwaCAmJiBob3ZlckdyYXBoICYmIGhvdmVyZWRHcmFwaCAhPT0gaG92ZXJHcmFwaCkge1xuICAgIGlmIChob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuKSBob3ZlckdyYXBoLm1vdXNlT3V0ZXIoZSwgaG92ZXJHcmFwaCk7XG4gICAgaG92ZXJHcmFwaC5zdGF0dXMgPSAnc3RhdGljJztcbiAgICBpZiAoaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuKSBob3ZlcmVkR3JhcGgubW91c2VFbnRlcihlLCBob3ZlcmVkR3JhcGgpO1xuICAgIGhvdmVyZWRHcmFwaC5zdGF0dXMgPSAnaG92ZXInO1xuICB9XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEhhbmRsZXIgb2YgQ1JlbmRlciBtb3VzZXVwIGV2ZW50XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBtb3VzZVVwKGUpIHtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuICB2YXIgYWN0aXZlR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnYWN0aXZlJztcbiAgfSk7XG4gIHZhciBkcmFnR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnZHJhZyc7XG4gIH0pO1xuICBpZiAoYWN0aXZlR3JhcGggJiYgdHlwZW9mIGFjdGl2ZUdyYXBoLmNsaWNrID09PSAnZnVuY3Rpb24nKSBhY3RpdmVHcmFwaC5jbGljayhlLCBhY3RpdmVHcmFwaCk7XG4gIGdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaCAmJiAoZ3JhcGguc3RhdHVzID0gJ3N0YXRpYycpO1xuICB9KTtcbiAgaWYgKGFjdGl2ZUdyYXBoKSBhY3RpdmVHcmFwaC5zdGF0dXMgPSAnaG92ZXInO1xuICBpZiAoZHJhZ0dyYXBoKSBkcmFnR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICBDbG9uZSBHcmFwaFxyXG4gKiBAcGFyYW0ge0dyYXBofSBncmFwaCBUaGUgdGFyZ2V0IHRvIGJlIGNsb25lZFxyXG4gKiBAcmV0dXJuIHtHcmFwaH0gICAgICBDbG9uZWQgZ3JhcGhcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgdmFyIHN0eWxlID0gZ3JhcGguc3R5bGUuZ2V0U3R5bGUoKTtcblxuICB2YXIgY2xvbmVkR3JhcGggPSBfb2JqZWN0U3ByZWFkKHt9LCBncmFwaCwge1xuICAgIHN0eWxlOiBzdHlsZVxuICB9KTtcblxuICBkZWxldGUgY2xvbmVkR3JhcGgucmVuZGVyO1xuICBjbG9uZWRHcmFwaCA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNsb25lZEdyYXBoLCB0cnVlKTtcbiAgcmV0dXJuIHRoaXMuYWRkKGNsb25lZEdyYXBoKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfcmVnZW5lcmF0b3IgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvclwiKSk7XG5cbnZhciBfYXN5bmNUb0dlbmVyYXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2FzeW5jVG9HZW5lcmF0b3JcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnZhciBfc3R5bGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3N0eWxlLmNsYXNzXCIpKTtcblxudmFyIF90cmFuc2l0aW9uID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS90cmFuc2l0aW9uXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3BsdWdpbi91dGlsXCIpO1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIENsYXNzIEdyYXBoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBncmFwaCAgR3JhcGggZGVmYXVsdCBjb25maWd1cmF0aW9uXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgR3JhcGggY29uZmlnXHJcbiAqIEByZXR1cm4ge0dyYXBofSBJbnN0YW5jZSBvZiBHcmFwaFxyXG4gKi9cbnZhciBHcmFwaCA9IGZ1bmN0aW9uIEdyYXBoKGdyYXBoLCBjb25maWcpIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBHcmFwaCk7XG4gIGNvbmZpZyA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNvbmZpZywgdHJ1ZSk7XG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdlYXRoZXIgdG8gcmVuZGVyIGdyYXBoXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IHZpc2libGUgPSB0cnVlXHJcbiAgICAgKi9cbiAgICB2aXNpYmxlOiB0cnVlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgZHJhZ1xyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCBkcmFnID0gZmFsc2VcclxuICAgICAqL1xuICAgIGRyYWc6IGZhbHNlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgaG92ZXJcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgaG92ZXIgPSBmYWxzZVxyXG4gICAgICovXG4gICAgaG92ZXI6IGZhbHNlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggcmVuZGVyaW5nIGluZGV4XHJcbiAgICAgKiAgR2l2ZSBwcmlvcml0eSB0byBpbmRleCBoaWdoIGdyYXBoIGluIHJlbmRlcmluZ1xyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBleGFtcGxlIGluZGV4ID0gMVxyXG4gICAgICovXG4gICAgaW5kZXg6IDEsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBbmltYXRpb24gZGVsYXkgdGltZShtcylcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBhbmltYXRpb25EZWxheSA9IDBcclxuICAgICAqL1xuICAgIGFuaW1hdGlvbkRlbGF5OiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTnVtYmVyIG9mIGFuaW1hdGlvbiBmcmFtZXNcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDMwXHJcbiAgICAgKi9cbiAgICBhbmltYXRpb25GcmFtZTogMzAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBbmltYXRpb24gZHluYW1pYyBjdXJ2ZSAoU3VwcG9ydGVkIGJ5IHRyYW5zaXRpb24pXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnbGluZWFyJ1xyXG4gICAgICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2ppYW1pbmc3NDMvVHJhbnNpdGlvblxyXG4gICAgICovXG4gICAgYW5pbWF0aW9uQ3VydmU6ICdsaW5lYXInLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2VhdGhlciB0byBwYXVzZSBncmFwaCBhbmltYXRpb25cclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uUGF1c2UgPSBmYWxzZVxyXG4gICAgICovXG4gICAgYW5pbWF0aW9uUGF1c2U6IGZhbHNlLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gUmVjdGFuZ3VsYXIgaG92ZXIgZGV0ZWN0aW9uIHpvbmVcclxuICAgICAqICBVc2UgdGhpcyBtZXRob2QgZm9yIGhvdmVyIGRldGVjdGlvbiBmaXJzdFxyXG4gICAgICogQHR5cGUge051bGx8QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBob3ZlclJlY3QgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBob3ZlclJlY3QgPSBbMCwgMCwgMTAwLCAxMDBdIC8vIFtSZWN0IHN0YXJ0IHgsIHksIFJlY3Qgd2lkdGgsIGhlaWdodF1cclxuICAgICAqL1xuICAgIGhvdmVyUmVjdDogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE1vdXNlIGVudGVyIGV2ZW50IGhhbmRsZXJcclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbnxOdWxsfVxyXG4gICAgICogQGRlZmF1bHQgbW91c2VFbnRlciA9IG51bGxcclxuICAgICAqL1xuICAgIG1vdXNlRW50ZXI6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBNb3VzZSBvdXRlciBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb258TnVsbH1cclxuICAgICAqIEBkZWZhdWx0IG1vdXNlT3V0ZXIgPSBudWxsXHJcbiAgICAgKi9cbiAgICBtb3VzZU91dGVyOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTW91c2UgY2xpY2sgZXZlbnQgaGFuZGxlclxyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufE51bGx9XHJcbiAgICAgKiBAZGVmYXVsdCBjbGljayA9IG51bGxcclxuICAgICAqL1xuICAgIGNsaWNrOiBudWxsXG4gIH07XG4gIHZhciBjb25maWdBYmxlTm90ID0ge1xuICAgIHN0YXR1czogJ3N0YXRpYycsXG4gICAgYW5pbWF0aW9uUm9vdDogW10sXG4gICAgYW5pbWF0aW9uS2V5czogW10sXG4gICAgYW5pbWF0aW9uRnJhbWVTdGF0ZTogW10sXG4gICAgY2FjaGU6IHt9XG4gIH07XG4gIGlmICghY29uZmlnLnNoYXBlKSBjb25maWcuc2hhcGUgPSB7fTtcbiAgaWYgKCFjb25maWcuc3R5bGUpIGNvbmZpZy5zdHlsZSA9IHt9O1xuICB2YXIgc2hhcGUgPSBPYmplY3QuYXNzaWduKHt9LCBncmFwaC5zaGFwZSwgY29uZmlnLnNoYXBlKTtcbiAgT2JqZWN0LmFzc2lnbihkZWZhdWx0Q29uZmlnLCBjb25maWcsIGNvbmZpZ0FibGVOb3QpO1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGdyYXBoLCBkZWZhdWx0Q29uZmlnKTtcbiAgdGhpcy5zaGFwZSA9IHNoYXBlO1xuICB0aGlzLnN0eWxlID0gbmV3IF9zdHlsZVtcImRlZmF1bHRcIl0oY29uZmlnLnN0eWxlKTtcbiAgdGhpcy5hZGRlZFByb2Nlc3NvcigpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGFkZGVkXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEdyYXBoO1xuXG5HcmFwaC5wcm90b3R5cGUuYWRkZWRQcm9jZXNzb3IgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgdGhpcy5zZXRHcmFwaENlbnRlciA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5zZXRHcmFwaENlbnRlcihudWxsLCB0aGlzKTsgLy8gVGhlIGxpZmUgY3ljbGUgJ2FkZGVkXCJcblxuICBpZiAodHlwZW9mIHRoaXMuYWRkZWQgPT09ICdmdW5jdGlvbicpIHRoaXMuYWRkZWQodGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgZHJhd1xyXG4gKiBAcGFyYW0ge0NSZW5kZXJ9IHJlbmRlciBJbnN0YW5jZSBvZiBDUmVuZGVyXHJcbiAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoICAgIEluc3RhbmNlIG9mIEdyYXBoXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuZHJhd1Byb2Nlc3NvciA9IGZ1bmN0aW9uIChyZW5kZXIsIGdyYXBoKSB7XG4gIHZhciBjdHggPSByZW5kZXIuY3R4O1xuICBncmFwaC5zdHlsZS5pbml0U3R5bGUoY3R4KTtcbiAgaWYgKHR5cGVvZiB0aGlzLmJlZm9yZURyYXcgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlRHJhdyh0aGlzLCByZW5kZXIpO1xuICBncmFwaC5kcmF3KHJlbmRlciwgZ3JhcGgpO1xuICBpZiAodHlwZW9mIHRoaXMuZHJhd2VkID09PSAnZnVuY3Rpb24nKSB0aGlzLmRyYXdlZCh0aGlzLCByZW5kZXIpO1xuICBncmFwaC5zdHlsZS5yZXN0b3JlVHJhbnNmb3JtKGN0eCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgaG92ZXIgY2hlY2tcclxuICogQHBhcmFtIHtBcnJheX0gcG9zaXRpb24gTW91c2UgUG9zaXRpb25cclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggICAgSW5zdGFuY2Ugb2YgR3JhcGhcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGhvdmVyIGNoZWNrXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5ob3ZlckNoZWNrUHJvY2Vzc29yID0gZnVuY3Rpb24gKHBvc2l0aW9uLCBfcmVmKSB7XG4gIHZhciBob3ZlclJlY3QgPSBfcmVmLmhvdmVyUmVjdCxcbiAgICAgIHN0eWxlID0gX3JlZi5zdHlsZSxcbiAgICAgIGhvdmVyQ2hlY2sgPSBfcmVmLmhvdmVyQ2hlY2s7XG4gIHZhciBncmFwaENlbnRlciA9IHN0eWxlLmdyYXBoQ2VudGVyLFxuICAgICAgcm90YXRlID0gc3R5bGUucm90YXRlLFxuICAgICAgc2NhbGUgPSBzdHlsZS5zY2FsZSxcbiAgICAgIHRyYW5zbGF0ZSA9IHN0eWxlLnRyYW5zbGF0ZTtcblxuICBpZiAoZ3JhcGhDZW50ZXIpIHtcbiAgICBpZiAocm90YXRlKSBwb3NpdGlvbiA9ICgwLCBfdXRpbC5nZXRSb3RhdGVQb2ludFBvcykoLXJvdGF0ZSwgcG9zaXRpb24sIGdyYXBoQ2VudGVyKTtcbiAgICBpZiAoc2NhbGUpIHBvc2l0aW9uID0gKDAsIF91dGlsLmdldFNjYWxlUG9pbnRQb3MpKHNjYWxlLm1hcChmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIDEgLyBzO1xuICAgIH0pLCBwb3NpdGlvbiwgZ3JhcGhDZW50ZXIpO1xuICAgIGlmICh0cmFuc2xhdGUpIHBvc2l0aW9uID0gKDAsIF91dGlsLmdldFRyYW5zbGF0ZVBvaW50UG9zKSh0cmFuc2xhdGUubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdiAqIC0xO1xuICAgIH0pLCBwb3NpdGlvbik7XG4gIH1cblxuICBpZiAoaG92ZXJSZWN0KSByZXR1cm4gX3V0aWwuY2hlY2tQb2ludElzSW5SZWN0LmFwcGx5KHZvaWQgMCwgW3Bvc2l0aW9uXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShob3ZlclJlY3QpKSk7XG4gIHJldHVybiBob3ZlckNoZWNrKHBvc2l0aW9uLCB0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBtb3ZlXHJcbiAqIEBwYXJhbSB7RXZlbnR9IGUgTW91c2UgbW92ZW1lbnQgZXZlbnRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5tb3ZlUHJvY2Vzc29yID0gZnVuY3Rpb24gKGUpIHtcbiAgdGhpcy5tb3ZlKGUsIHRoaXMpO1xuICBpZiAodHlwZW9mIHRoaXMuYmVmb3JlTW92ZSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5iZWZvcmVNb3ZlKGUsIHRoaXMpO1xuICBpZiAodHlwZW9mIHRoaXMuc2V0R3JhcGhDZW50ZXIgPT09ICdmdW5jdGlvbicpIHRoaXMuc2V0R3JhcGhDZW50ZXIoZSwgdGhpcyk7XG4gIGlmICh0eXBlb2YgdGhpcy5tb3ZlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5tb3ZlZChlLCB0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFVwZGF0ZSBncmFwaCBzdGF0ZVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0ck5hbWUgVXBkYXRlZCBhdHRyaWJ1dGUgbmFtZVxyXG4gKiBAcGFyYW0ge0FueX0gY2hhbmdlICAgICAgVXBkYXRlZCB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAoYXR0ck5hbWUpIHtcbiAgdmFyIGNoYW5nZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICBpZiAoIWF0dHJOYW1lIHx8IGNoYW5nZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpc09iamVjdCA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHRoaXNbYXR0ck5hbWVdKSA9PT0gJ29iamVjdCc7XG4gIGlmIChpc09iamVjdCkgY2hhbmdlID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoY2hhbmdlLCB0cnVlKTtcbiAgdmFyIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuXG4gIGlmIChhdHRyTmFtZSA9PT0gJ3N0eWxlJykge1xuICAgIHRoaXMuc3R5bGUudXBkYXRlKGNoYW5nZSk7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXNbYXR0ck5hbWVdLCBjaGFuZ2UpO1xuICB9IGVsc2Uge1xuICAgIHRoaXNbYXR0ck5hbWVdID0gY2hhbmdlO1xuICB9XG5cbiAgaWYgKGF0dHJOYW1lID09PSAnaW5kZXgnKSByZW5kZXIuc29ydEdyYXBoc0J5SW5kZXgoKTtcbiAgcmVuZGVyLmRyYXdBbGxHcmFwaCgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gVXBkYXRlIGdyYXBoaWNzIHN0YXRlICh3aXRoIGFuaW1hdGlvbilcclxuICogIE9ubHkgc2hhcGUgYW5kIHN0eWxlIGF0dHJpYnV0ZXMgYXJlIHN1cHBvcnRlZFxyXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0ck5hbWUgVXBkYXRlZCBhdHRyaWJ1dGUgbmFtZVxyXG4gKiBAcGFyYW0ge0FueX0gY2hhbmdlICAgICAgVXBkYXRlZCB2YWx1ZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHdhaXQgICAgV2hldGhlciB0byBzdG9yZSB0aGUgYW5pbWF0aW9uIHdhaXRpbmdcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGUgbmV4dCBhbmltYXRpb24gcmVxdWVzdFxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBbmltYXRpb24gUHJvbWlzZVxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuYW5pbWF0aW9uID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgdmFyIF9yZWYyID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMltcImRlZmF1bHRcIl0pKFxuICAvKiNfX1BVUkVfXyovXG4gIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ubWFyayhmdW5jdGlvbiBfY2FsbGVlMihhdHRyTmFtZSwgY2hhbmdlKSB7XG4gICAgdmFyIHdhaXQsXG4gICAgICAgIGNoYW5nZVJvb3QsXG4gICAgICAgIGNoYW5nZUtleXMsXG4gICAgICAgIGJlZm9yZVN0YXRlLFxuICAgICAgICBhbmltYXRpb25GcmFtZSxcbiAgICAgICAgYW5pbWF0aW9uQ3VydmUsXG4gICAgICAgIGFuaW1hdGlvbkRlbGF5LFxuICAgICAgICBhbmltYXRpb25GcmFtZVN0YXRlLFxuICAgICAgICByZW5kZXIsXG4gICAgICAgIF9hcmdzMiA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUyJChfY29udGV4dDIpIHtcbiAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgIHN3aXRjaCAoX2NvbnRleHQyLnByZXYgPSBfY29udGV4dDIubmV4dCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHdhaXQgPSBfYXJnczIubGVuZ3RoID4gMiAmJiBfYXJnczJbMl0gIT09IHVuZGVmaW5lZCA/IF9hcmdzMlsyXSA6IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoIShhdHRyTmFtZSAhPT0gJ3NoYXBlJyAmJiBhdHRyTmFtZSAhPT0gJ3N0eWxlJykpIHtcbiAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSA0O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignT25seSBzdXBwb3J0ZWQgc2hhcGUgYW5kIHN0eWxlIGFuaW1hdGlvbiEnKTtcbiAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuYWJydXB0KFwicmV0dXJuXCIpO1xuXG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgY2hhbmdlID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoY2hhbmdlLCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ3N0eWxlJykgdGhpcy5zdHlsZS5jb2xvclByb2Nlc3NvcihjaGFuZ2UpO1xuICAgICAgICAgICAgY2hhbmdlUm9vdCA9IHRoaXNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgY2hhbmdlS2V5cyA9IE9iamVjdC5rZXlzKGNoYW5nZSk7XG4gICAgICAgICAgICBiZWZvcmVTdGF0ZSA9IHt9O1xuICAgICAgICAgICAgY2hhbmdlS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGJlZm9yZVN0YXRlW2tleV0gPSBjaGFuZ2VSb290W2tleV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuaW1hdGlvbkZyYW1lID0gdGhpcy5hbmltYXRpb25GcmFtZSwgYW5pbWF0aW9uQ3VydmUgPSB0aGlzLmFuaW1hdGlvbkN1cnZlLCBhbmltYXRpb25EZWxheSA9IHRoaXMuYW5pbWF0aW9uRGVsYXk7XG4gICAgICAgICAgICBhbmltYXRpb25GcmFtZVN0YXRlID0gKDAsIF90cmFuc2l0aW9uW1wiZGVmYXVsdFwiXSkoYW5pbWF0aW9uQ3VydmUsIGJlZm9yZVN0YXRlLCBjaGFuZ2UsIGFuaW1hdGlvbkZyYW1lLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uUm9vdC5wdXNoKGNoYW5nZVJvb3QpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25LZXlzLnB1c2goY2hhbmdlS2V5cyk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUucHVzaChhbmltYXRpb25GcmFtZVN0YXRlKTtcblxuICAgICAgICAgICAgaWYgKCF3YWl0KSB7XG4gICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMTc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdChcInJldHVyblwiKTtcblxuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICBpZiAoIShhbmltYXRpb25EZWxheSA+IDApKSB7XG4gICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gMjA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDIwO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGF5KGFuaW1hdGlvbkRlbGF5KTtcblxuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICByZW5kZXIgPSB0aGlzLnJlbmRlcjtcbiAgICAgICAgICAgIHJldHVybiBfY29udGV4dDIuYWJydXB0KFwicmV0dXJuXCIsIG5ldyBQcm9taXNlKFxuICAgICAgICAgICAgLyojX19QVVJFX18qL1xuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgX3JlZjMgPSAoMCwgX2FzeW5jVG9HZW5lcmF0b3IyW1wiZGVmYXVsdFwiXSkoXG4gICAgICAgICAgICAgIC8qI19fUFVSRV9fKi9cbiAgICAgICAgICAgICAgX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLndyYXAoZnVuY3Rpb24gX2NhbGxlZSQoX2NvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQucHJldiA9IF9jb250ZXh0Lm5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZW5kZXIubGF1bmNoQW5pbWF0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIF9jYWxsZWUpO1xuICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChfeDMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZjMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0oKSkpO1xuXG4gICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIF9jYWxsZWUyLCB0aGlzKTtcbiAgfSkpO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoX3gsIF94Mikge1xuICAgIHJldHVybiBfcmVmMi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufSgpO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBFeHRyYWN0IHRoZSBuZXh0IGZyYW1lIG9mIGRhdGEgZnJvbSB0aGUgYW5pbWF0aW9uIHF1ZXVlXHJcbiAqICAgICAgICAgICAgICBhbmQgdXBkYXRlIHRoZSBncmFwaCBzdGF0ZVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLnR1cm5OZXh0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAodGltZVN0YW1wKSB7XG4gIHZhciBhbmltYXRpb25EZWxheSA9IHRoaXMuYW5pbWF0aW9uRGVsYXksXG4gICAgICBhbmltYXRpb25Sb290ID0gdGhpcy5hbmltYXRpb25Sb290LFxuICAgICAgYW5pbWF0aW9uS2V5cyA9IHRoaXMuYW5pbWF0aW9uS2V5cyxcbiAgICAgIGFuaW1hdGlvbkZyYW1lU3RhdGUgPSB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUsXG4gICAgICBhbmltYXRpb25QYXVzZSA9IHRoaXMuYW5pbWF0aW9uUGF1c2U7XG4gIGlmIChhbmltYXRpb25QYXVzZSkgcmV0dXJuO1xuICBpZiAoRGF0ZS5ub3coKSAtIHRpbWVTdGFtcCA8IGFuaW1hdGlvbkRlbGF5KSByZXR1cm47XG4gIGFuaW1hdGlvblJvb3QuZm9yRWFjaChmdW5jdGlvbiAocm9vdCwgaSkge1xuICAgIGFuaW1hdGlvbktleXNbaV0uZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByb290W2tleV0gPSBhbmltYXRpb25GcmFtZVN0YXRlW2ldWzBdW2tleV07XG4gICAgfSk7XG4gIH0pO1xuICBhbmltYXRpb25GcmFtZVN0YXRlLmZvckVhY2goZnVuY3Rpb24gKHN0YXRlSXRlbSwgaSkge1xuICAgIHN0YXRlSXRlbS5zaGlmdCgpO1xuICAgIHZhciBub0ZyYW1lID0gc3RhdGVJdGVtLmxlbmd0aCA9PT0gMDtcbiAgICBpZiAobm9GcmFtZSkgYW5pbWF0aW9uUm9vdFtpXSA9IG51bGw7XG4gICAgaWYgKG5vRnJhbWUpIGFuaW1hdGlvbktleXNbaV0gPSBudWxsO1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlID0gYW5pbWF0aW9uRnJhbWVTdGF0ZS5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgcmV0dXJuIHN0YXRlLmxlbmd0aDtcbiAgfSk7XG4gIHRoaXMuYW5pbWF0aW9uUm9vdCA9IGFuaW1hdGlvblJvb3QuZmlsdGVyKGZ1bmN0aW9uIChyb290KSB7XG4gICAgcmV0dXJuIHJvb3Q7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvbktleXMgPSBhbmltYXRpb25LZXlzLmZpbHRlcihmdW5jdGlvbiAoa2V5cykge1xuICAgIHJldHVybiBrZXlzO1xuICB9KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNraXAgdG8gdGhlIGxhc3QgZnJhbWUgb2YgYW5pbWF0aW9uXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuYW5pbWF0aW9uRW5kID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYW5pbWF0aW9uRnJhbWVTdGF0ZSA9IHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZSxcbiAgICAgIGFuaW1hdGlvbktleXMgPSB0aGlzLmFuaW1hdGlvbktleXMsXG4gICAgICBhbmltYXRpb25Sb290ID0gdGhpcy5hbmltYXRpb25Sb290LFxuICAgICAgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG4gIGFuaW1hdGlvblJvb3QuZm9yRWFjaChmdW5jdGlvbiAocm9vdCwgaSkge1xuICAgIHZhciBjdXJyZW50S2V5cyA9IGFuaW1hdGlvbktleXNbaV07XG4gICAgdmFyIGxhc3RTdGF0ZSA9IGFuaW1hdGlvbkZyYW1lU3RhdGVbaV0ucG9wKCk7XG4gICAgY3VycmVudEtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gcm9vdFtrZXldID0gbGFzdFN0YXRlW2tleV07XG4gICAgfSk7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUgPSBbXTtcbiAgdGhpcy5hbmltYXRpb25LZXlzID0gW107XG4gIHRoaXMuYW5pbWF0aW9uUm9vdCA9IFtdO1xuICByZXR1cm4gcmVuZGVyLmRyYXdBbGxHcmFwaCgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUGF1c2UgYW5pbWF0aW9uIGJlaGF2aW9yXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUucGF1c2VBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYXR0cignYW5pbWF0aW9uUGF1c2UnLCB0cnVlKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFRyeSBhbmltYXRpb24gYmVoYXZpb3JcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5wbGF5QW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG4gIHRoaXMuYXR0cignYW5pbWF0aW9uUGF1c2UnLCBmYWxzZSk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShcbiAgLyojX19QVVJFX18qL1xuICBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF9yZWY0ID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMltcImRlZmF1bHRcIl0pKFxuICAgIC8qI19fUFVSRV9fKi9cbiAgICBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTMocmVzb2x2ZSkge1xuICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ud3JhcChmdW5jdGlvbiBfY2FsbGVlMyQoX2NvbnRleHQzKSB7XG4gICAgICAgIHdoaWxlICgxKSB7XG4gICAgICAgICAgc3dpdGNoIChfY29udGV4dDMucHJldiA9IF9jb250ZXh0My5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlbmRlci5sYXVuY2hBbmltYXRpb24oKTtcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBfY2FsbGVlMyk7XG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChfeDQpIHtcbiAgICAgIHJldHVybiBfcmVmNC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0oKSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgZGVsZXRlXHJcbiAqIEBwYXJhbSB7Q1JlbmRlcn0gcmVuZGVyIEluc3RhbmNlIG9mIENSZW5kZXJcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5kZWxQcm9jZXNzb3IgPSBmdW5jdGlvbiAocmVuZGVyKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdmFyIGdyYXBocyA9IHJlbmRlci5ncmFwaHM7XG4gIHZhciBpbmRleCA9IGdyYXBocy5maW5kSW5kZXgoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoID09PSBfdGhpcztcbiAgfSk7XG4gIGlmIChpbmRleCA9PT0gLTEpIHJldHVybjtcbiAgaWYgKHR5cGVvZiB0aGlzLmJlZm9yZURlbGV0ZSA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5iZWZvcmVEZWxldGUodGhpcyk7XG4gIGdyYXBocy5zcGxpY2UoaW5kZXgsIDEsIG51bGwpO1xuICBpZiAodHlwZW9mIHRoaXMuZGVsZXRlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5kZWxldGVkKHRoaXMpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUmV0dXJuIGEgdGltZWQgcmVsZWFzZSBQcm9taXNlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIFJlbGVhc2UgdGltZVxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBIHRpbWVkIHJlbGVhc2UgUHJvbWlzZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBkZWxheSh0aW1lKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZSk7XG4gIH0pO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi9wbHVnaW4vdXRpbFwiKTtcblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDbGFzcyBTdHlsZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGUgIFN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICogQHJldHVybiB7U3R5bGV9IEluc3RhbmNlIG9mIFN0eWxlXHJcbiAqL1xudmFyIFN0eWxlID0gZnVuY3Rpb24gU3R5bGUoc3R5bGUpIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBTdHlsZSk7XG4gIHRoaXMuY29sb3JQcm9jZXNzb3Ioc3R5bGUpO1xuICB2YXIgZGVmYXVsdFN0eWxlID0ge1xuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJnYmEgdmFsdWUgb2YgZ3JhcGggZmlsbCBjb2xvclxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZmlsbCA9IFswLCAwLCAwLCAxXVxyXG4gICAgICovXG4gICAgZmlsbDogWzAsIDAsIDAsIDFdLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gUmdiYSB2YWx1ZSBvZiBncmFwaCBzdHJva2UgY29sb3JcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IHN0cm9rZSA9IFswLCAwLCAwLCAxXVxyXG4gICAgICovXG4gICAgc3Ryb2tlOiBbMCwgMCwgMCwgMF0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBPcGFjaXR5IG9mIGdyYXBoXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgb3BhY2l0eSA9IDFcclxuICAgICAqL1xuICAgIG9wYWNpdHk6IDEsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lQ2FwIG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGxpbmVDYXAgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBsaW5lQ2FwID0gJ2J1dHQnfCdyb3VuZCd8J3NxdWFyZSdcclxuICAgICAqL1xuICAgIGxpbmVDYXA6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lam9pbiBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBsaW5lSm9pbiA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGxpbmVKb2luID0gJ3JvdW5kJ3wnYmV2ZWwnfCdtaXRlcidcclxuICAgICAqL1xuICAgIGxpbmVKb2luOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZURhc2ggb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBsaW5lRGFzaCA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGxpbmVEYXNoID0gWzEwLCAxMF1cclxuICAgICAqL1xuICAgIGxpbmVEYXNoOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZURhc2hPZmZzZXQgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgbGluZURhc2hPZmZzZXQgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBsaW5lRGFzaE9mZnNldCA9IDEwXHJcbiAgICAgKi9cbiAgICBsaW5lRGFzaE9mZnNldDogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFNoYWRvd0JsdXIgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgc2hhZG93Qmx1ciA9IDBcclxuICAgICAqL1xuICAgIHNoYWRvd0JsdXI6IDAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBSZ2JhIHZhbHVlIG9mIGdyYXBoIHNoYWRvdyBjb2xvclxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgc2hhZG93Q29sb3IgPSBbMCwgMCwgMCwgMF1cclxuICAgICAqL1xuICAgIHNoYWRvd0NvbG9yOiBbMCwgMCwgMCwgMF0sXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBTaGFkb3dPZmZzZXRYIG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHNoYWRvd09mZnNldFggPSAwXHJcbiAgICAgKi9cbiAgICBzaGFkb3dPZmZzZXRYOiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gU2hhZG93T2Zmc2V0WSBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBzaGFkb3dPZmZzZXRZID0gMFxyXG4gICAgICovXG4gICAgc2hhZG93T2Zmc2V0WTogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVXaWR0aCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBsaW5lV2lkdGggPSAwXHJcbiAgICAgKi9cbiAgICBsaW5lV2lkdGg6IDAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBDZW50ZXIgcG9pbnQgb2YgdGhlIGdyYXBoXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFwaENlbnRlciA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGdyYXBoQ2VudGVyID0gWzEwLCAxMF1cclxuICAgICAqL1xuICAgIGdyYXBoQ2VudGVyOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggc2NhbGVcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IHNjYWxlID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgc2NhbGUgPSBbMS41LCAxLjVdXHJcbiAgICAgKi9cbiAgICBzY2FsZTogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYXBoIHJvdGF0aW9uIGRlZ3JlZVxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHJvdGF0ZSA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIHJvdGF0ZSA9IDEwXHJcbiAgICAgKi9cbiAgICByb3RhdGU6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFwaCB0cmFuc2xhdGUgZGlzdGFuY2VcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IHRyYW5zbGF0ZSA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIHRyYW5zbGF0ZSA9IFsxMCwgMTBdXHJcbiAgICAgKi9cbiAgICB0cmFuc2xhdGU6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBDdXJzb3Igc3RhdHVzIHdoZW4gaG92ZXJcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBob3ZlckN1cnNvciA9ICdwb2ludGVyJ1xyXG4gICAgICogQGV4YW1wbGUgaG92ZXJDdXJzb3IgPSAnZGVmYXVsdCd8J3BvaW50ZXInfCdhdXRvJ3wnY3Jvc3NoYWlyJ3wnbW92ZSd8J3dhaXQnfC4uLlxyXG4gICAgICovXG4gICAgaG92ZXJDdXJzb3I6ICdwb2ludGVyJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEZvbnQgc3R5bGUgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZm9udFN0eWxlID0gJ25vcm1hbCdcclxuICAgICAqIEBleGFtcGxlIGZvbnRTdHlsZSA9ICdub3JtYWwnfCdpdGFsaWMnfCdvYmxpcXVlJ1xyXG4gICAgICovXG4gICAgZm9udFN0eWxlOiAnbm9ybWFsJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEZvbnQgdmFyaWVudCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBmb250VmFyaWVudCA9ICdub3JtYWwnXHJcbiAgICAgKiBAZXhhbXBsZSBmb250VmFyaWVudCA9ICdub3JtYWwnfCdzbWFsbC1jYXBzJ1xyXG4gICAgICovXG4gICAgZm9udFZhcmllbnQ6ICdub3JtYWwnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCB3ZWlnaHQgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGZvbnRXZWlnaHQgPSAnbm9ybWFsJ1xyXG4gICAgICogQGV4YW1wbGUgZm9udFdlaWdodCA9ICdub3JtYWwnfCdib2xkJ3wnYm9sZGVyJ3wnbGlnaHRlcid8TnVtYmVyXHJcbiAgICAgKi9cbiAgICBmb250V2VpZ2h0OiAnbm9ybWFsJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEZvbnQgc2l6ZSBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBmb250U2l6ZSA9IDEwXHJcbiAgICAgKi9cbiAgICBmb250U2l6ZTogMTAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IGZhbWlseSBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBmb250RmFtaWx5ID0gJ0FyaWFsJ1xyXG4gICAgICovXG4gICAgZm9udEZhbWlseTogJ0FyaWFsJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFRleHRBbGlnbiBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCB0ZXh0QWxpZ24gPSAnY2VudGVyJ1xyXG4gICAgICogQGV4YW1wbGUgdGV4dEFsaWduID0gJ3N0YXJ0J3wnZW5kJ3wnbGVmdCd8J3JpZ2h0J3wnY2VudGVyJ1xyXG4gICAgICovXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFRleHRCYXNlbGluZSBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCB0ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xyXG4gICAgICogQGV4YW1wbGUgdGV4dEJhc2VsaW5lID0gJ3RvcCd8J2JvdHRvbSd8J21pZGRsZSd8J2FscGhhYmV0aWMnfCdoYW5naW5nJ1xyXG4gICAgICovXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFRoZSBjb2xvciB1c2VkIHRvIGNyZWF0ZSB0aGUgZ3JhZGllbnRcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50Q29sb3IgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudENvbG9yID0gWycjMDAwJywgJyMxMTEnLCAnIzIyMiddXHJcbiAgICAgKi9cbiAgICBncmFkaWVudENvbG9yOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhZGllbnQgdHlwZVxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50VHlwZSA9ICdsaW5lYXInXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFR5cGUgPSAnbGluZWFyJyB8ICdyYWRpYWwnXHJcbiAgICAgKi9cbiAgICBncmFkaWVudFR5cGU6ICdsaW5lYXInLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhZGllbnQgcGFyYW1zXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudFBhcmFtcyA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50UGFyYW1zID0gW3gwLCB5MCwgeDEsIHkxXSAoTGluZWFyIEdyYWRpZW50KVxyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRQYXJhbXMgPSBbeDAsIHkwLCByMCwgeDEsIHkxLCByMV0gKFJhZGlhbCBHcmFkaWVudClcclxuICAgICAqL1xuICAgIGdyYWRpZW50UGFyYW1zOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hlbiB0byB1c2UgZ3JhZGllbnRzXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRXaXRoID0gJ3N0cm9rZSdcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50V2l0aCA9ICdzdHJva2UnIHwgJ2ZpbGwnXHJcbiAgICAgKi9cbiAgICBncmFkaWVudFdpdGg6ICdzdHJva2UnLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhZGllbnQgY29sb3Igc3RvcHNcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudFN0b3BzID0gJ2F1dG8nXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFN0b3BzID0gJ2F1dG8nIHwgWzAsIC4yLCAuMywgMV1cclxuICAgICAqL1xuICAgIGdyYWRpZW50U3RvcHM6ICdhdXRvJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEV4dGVuZGVkIGNvbG9yIHRoYXQgc3VwcG9ydHMgYW5pbWF0aW9uIHRyYW5zaXRpb25cclxuICAgICAqIEB0eXBlIHtBcnJheXxPYmplY3R9XHJcbiAgICAgKiBAZGVmYXVsdCBjb2xvcnMgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBjb2xvcnMgPSBbJyMwMDAnLCAnIzExMScsICcjMjIyJywgJ3JlZCcgXVxyXG4gICAgICogQGV4YW1wbGUgY29sb3JzID0geyBhOiAnIzAwMCcsIGI6ICcjMTExJyB9XHJcbiAgICAgKi9cbiAgICBjb2xvcnM6IG51bGxcbiAgfTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBkZWZhdWx0U3R5bGUsIHN0eWxlKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNldCBjb2xvcnMgdG8gcmdiYSB2YWx1ZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGUgc3R5bGUgY29uZmlnXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmV2ZXJzZSBXaGV0aGVyIHRvIHBlcmZvcm0gcmV2ZXJzZSBvcGVyYXRpb25cclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gU3R5bGU7XG5cblN0eWxlLnByb3RvdHlwZS5jb2xvclByb2Nlc3NvciA9IGZ1bmN0aW9uIChzdHlsZSkge1xuICB2YXIgcmV2ZXJzZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gIHZhciBwcm9jZXNzb3IgPSByZXZlcnNlID8gX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlIDogX2NvbG9yLmdldFJnYmFWYWx1ZTtcbiAgdmFyIGNvbG9yUHJvY2Vzc29yS2V5cyA9IFsnZmlsbCcsICdzdHJva2UnLCAnc2hhZG93Q29sb3InXTtcbiAgdmFyIGFsbEtleXMgPSBPYmplY3Qua2V5cyhzdHlsZSk7XG4gIHZhciBjb2xvcktleXMgPSBhbGxLZXlzLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGNvbG9yUHJvY2Vzc29yS2V5cy5maW5kKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gayA9PT0ga2V5O1xuICAgIH0pO1xuICB9KTtcbiAgY29sb3JLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBzdHlsZVtrZXldID0gcHJvY2Vzc29yKHN0eWxlW2tleV0pO1xuICB9KTtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSBzdHlsZS5ncmFkaWVudENvbG9yLFxuICAgICAgY29sb3JzID0gc3R5bGUuY29sb3JzO1xuICBpZiAoZ3JhZGllbnRDb2xvcikgc3R5bGUuZ3JhZGllbnRDb2xvciA9IGdyYWRpZW50Q29sb3IubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgcmV0dXJuIHByb2Nlc3NvcihjKTtcbiAgfSk7XG5cbiAgaWYgKGNvbG9ycykge1xuICAgIHZhciBjb2xvcnNLZXlzID0gT2JqZWN0LmtleXMoY29sb3JzKTtcbiAgICBjb2xvcnNLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGNvbG9yc1trZXldID0gcHJvY2Vzc29yKGNvbG9yc1trZXldKTtcbiAgICB9KTtcbiAgfVxufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSW5pdCBncmFwaCBzdHlsZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4IENvbnRleHQgb2YgY2FudmFzXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5TdHlsZS5wcm90b3R5cGUuaW5pdFN0eWxlID0gZnVuY3Rpb24gKGN0eCkge1xuICBpbml0VHJhbnNmb3JtKGN0eCwgdGhpcyk7XG4gIGluaXRHcmFwaFN0eWxlKGN0eCwgdGhpcyk7XG4gIGluaXRHcmFkaWVudChjdHgsIHRoaXMpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSW5pdCBjYW52YXMgdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggIENvbnRleHQgb2YgY2FudmFzXHJcbiAqIEBwYXJhbSB7U3R5bGV9IHN0eWxlIEluc3RhbmNlIG9mIFN0eWxlXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBpbml0VHJhbnNmb3JtKGN0eCwgc3R5bGUpIHtcbiAgY3R4LnNhdmUoKTtcbiAgdmFyIGdyYXBoQ2VudGVyID0gc3R5bGUuZ3JhcGhDZW50ZXIsXG4gICAgICByb3RhdGUgPSBzdHlsZS5yb3RhdGUsXG4gICAgICBzY2FsZSA9IHN0eWxlLnNjYWxlLFxuICAgICAgdHJhbnNsYXRlID0gc3R5bGUudHJhbnNsYXRlO1xuICBpZiAoIShncmFwaENlbnRlciBpbnN0YW5jZW9mIEFycmF5KSkgcmV0dXJuO1xuICBjdHgudHJhbnNsYXRlLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShncmFwaENlbnRlcikpO1xuICBpZiAocm90YXRlKSBjdHgucm90YXRlKHJvdGF0ZSAqIE1hdGguUEkgLyAxODApO1xuICBpZiAoc2NhbGUgaW5zdGFuY2VvZiBBcnJheSkgY3R4LnNjYWxlLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzY2FsZSkpO1xuICBpZiAodHJhbnNsYXRlKSBjdHgudHJhbnNsYXRlLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh0cmFuc2xhdGUpKTtcbiAgY3R4LnRyYW5zbGF0ZSgtZ3JhcGhDZW50ZXJbMF0sIC1ncmFwaENlbnRlclsxXSk7XG59XG5cbnZhciBhdXRvU2V0U3R5bGVLZXlzID0gWydsaW5lQ2FwJywgJ2xpbmVKb2luJywgJ2xpbmVEYXNoT2Zmc2V0JywgJ3NoYWRvd09mZnNldFgnLCAnc2hhZG93T2Zmc2V0WScsICdsaW5lV2lkdGgnLCAndGV4dEFsaWduJywgJ3RleHRCYXNlbGluZSddO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTZXQgdGhlIHN0eWxlIG9mIGNhbnZhcyBjdHhcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgQ29udGV4dCBvZiBjYW52YXNcclxuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5mdW5jdGlvbiBpbml0R3JhcGhTdHlsZShjdHgsIHN0eWxlKSB7XG4gIHZhciBmaWxsID0gc3R5bGUuZmlsbCxcbiAgICAgIHN0cm9rZSA9IHN0eWxlLnN0cm9rZSxcbiAgICAgIHNoYWRvd0NvbG9yID0gc3R5bGUuc2hhZG93Q29sb3IsXG4gICAgICBvcGFjaXR5ID0gc3R5bGUub3BhY2l0eTtcbiAgYXV0b1NldFN0eWxlS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoa2V5IHx8IHR5cGVvZiBrZXkgPT09ICdudW1iZXInKSBjdHhba2V5XSA9IHN0eWxlW2tleV07XG4gIH0pO1xuICBmaWxsID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShmaWxsKTtcbiAgc3Ryb2tlID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzdHJva2UpO1xuICBzaGFkb3dDb2xvciA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2hhZG93Q29sb3IpO1xuICBmaWxsWzNdICo9IG9wYWNpdHk7XG4gIHN0cm9rZVszXSAqPSBvcGFjaXR5O1xuICBzaGFkb3dDb2xvclszXSAqPSBvcGFjaXR5O1xuICBjdHguZmlsbFN0eWxlID0gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoZmlsbCk7XG4gIGN0eC5zdHJva2VTdHlsZSA9ICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKHN0cm9rZSk7XG4gIGN0eC5zaGFkb3dDb2xvciA9ICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKHNoYWRvd0NvbG9yKTtcbiAgdmFyIGxpbmVEYXNoID0gc3R5bGUubGluZURhc2gsXG4gICAgICBzaGFkb3dCbHVyID0gc3R5bGUuc2hhZG93Qmx1cjtcblxuICBpZiAobGluZURhc2gpIHtcbiAgICBsaW5lRGFzaCA9IGxpbmVEYXNoLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYgPj0gMCA/IHYgOiAwO1xuICAgIH0pO1xuICAgIGN0eC5zZXRMaW5lRGFzaChsaW5lRGFzaCk7XG4gIH1cblxuICBpZiAodHlwZW9mIHNoYWRvd0JsdXIgPT09ICdudW1iZXInKSBjdHguc2hhZG93Qmx1ciA9IHNoYWRvd0JsdXIgPiAwID8gc2hhZG93Qmx1ciA6IDAuMDAxO1xuICB2YXIgZm9udFN0eWxlID0gc3R5bGUuZm9udFN0eWxlLFxuICAgICAgZm9udFZhcmllbnQgPSBzdHlsZS5mb250VmFyaWVudCxcbiAgICAgIGZvbnRXZWlnaHQgPSBzdHlsZS5mb250V2VpZ2h0LFxuICAgICAgZm9udFNpemUgPSBzdHlsZS5mb250U2l6ZSxcbiAgICAgIGZvbnRGYW1pbHkgPSBzdHlsZS5mb250RmFtaWx5O1xuICBjdHguZm9udCA9IGZvbnRTdHlsZSArICcgJyArIGZvbnRWYXJpZW50ICsgJyAnICsgZm9udFdlaWdodCArICcgJyArIGZvbnRTaXplICsgJ3B4JyArICcgJyArIGZvbnRGYW1pbHk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNldCB0aGUgZ3JhZGllbnQgY29sb3Igb2YgY2FudmFzIGN0eFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gaW5pdEdyYWRpZW50KGN0eCwgc3R5bGUpIHtcbiAgaWYgKCFncmFkaWVudFZhbGlkYXRvcihzdHlsZSkpIHJldHVybjtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSBzdHlsZS5ncmFkaWVudENvbG9yLFxuICAgICAgZ3JhZGllbnRQYXJhbXMgPSBzdHlsZS5ncmFkaWVudFBhcmFtcyxcbiAgICAgIGdyYWRpZW50VHlwZSA9IHN0eWxlLmdyYWRpZW50VHlwZSxcbiAgICAgIGdyYWRpZW50V2l0aCA9IHN0eWxlLmdyYWRpZW50V2l0aCxcbiAgICAgIGdyYWRpZW50U3RvcHMgPSBzdHlsZS5ncmFkaWVudFN0b3BzLFxuICAgICAgb3BhY2l0eSA9IHN0eWxlLm9wYWNpdHk7XG4gIGdyYWRpZW50Q29sb3IgPSBncmFkaWVudENvbG9yLm1hcChmdW5jdGlvbiAoY29sb3IpIHtcbiAgICB2YXIgY29sb3JPcGFjaXR5ID0gY29sb3JbM10gKiBvcGFjaXR5O1xuICAgIHZhciBjbG9uZWRDb2xvciA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY29sb3IpO1xuICAgIGNsb25lZENvbG9yWzNdID0gY29sb3JPcGFjaXR5O1xuICAgIHJldHVybiBjbG9uZWRDb2xvcjtcbiAgfSk7XG4gIGdyYWRpZW50Q29sb3IgPSBncmFkaWVudENvbG9yLm1hcChmdW5jdGlvbiAoYykge1xuICAgIHJldHVybiAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShjKTtcbiAgfSk7XG4gIGlmIChncmFkaWVudFN0b3BzID09PSAnYXV0bycpIGdyYWRpZW50U3RvcHMgPSBnZXRBdXRvQ29sb3JTdG9wcyhncmFkaWVudENvbG9yKTtcbiAgdmFyIGdyYWRpZW50ID0gY3R4W1wiY3JlYXRlXCIuY29uY2F0KGdyYWRpZW50VHlwZS5zbGljZSgwLCAxKS50b1VwcGVyQ2FzZSgpICsgZ3JhZGllbnRUeXBlLnNsaWNlKDEpLCBcIkdyYWRpZW50XCIpXS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZ3JhZGllbnRQYXJhbXMpKTtcbiAgZ3JhZGllbnRTdG9wcy5mb3JFYWNoKGZ1bmN0aW9uIChzdG9wLCBpKSB7XG4gICAgcmV0dXJuIGdyYWRpZW50LmFkZENvbG9yU3RvcChzdG9wLCBncmFkaWVudENvbG9yW2ldKTtcbiAgfSk7XG4gIGN0eFtcIlwiLmNvbmNhdChncmFkaWVudFdpdGgsIFwiU3R5bGVcIildID0gZ3JhZGllbnQ7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBncmFkaWVudCBjb25maWd1cmF0aW9uIGlzIGxlZ2FsXHJcbiAqIEBwYXJhbSB7U3R5bGV9IHN0eWxlIEluc3RhbmNlIG9mIFN0eWxlXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IENoZWNrIFJlc3VsdFxyXG4gKi9cblxuXG5mdW5jdGlvbiBncmFkaWVudFZhbGlkYXRvcihzdHlsZSkge1xuICB2YXIgZ3JhZGllbnRDb2xvciA9IHN0eWxlLmdyYWRpZW50Q29sb3IsXG4gICAgICBncmFkaWVudFBhcmFtcyA9IHN0eWxlLmdyYWRpZW50UGFyYW1zLFxuICAgICAgZ3JhZGllbnRUeXBlID0gc3R5bGUuZ3JhZGllbnRUeXBlLFxuICAgICAgZ3JhZGllbnRXaXRoID0gc3R5bGUuZ3JhZGllbnRXaXRoLFxuICAgICAgZ3JhZGllbnRTdG9wcyA9IHN0eWxlLmdyYWRpZW50U3RvcHM7XG4gIGlmICghZ3JhZGllbnRDb2xvciB8fCAhZ3JhZGllbnRQYXJhbXMpIHJldHVybiBmYWxzZTtcblxuICBpZiAoZ3JhZGllbnRDb2xvci5sZW5ndGggPT09IDEpIHtcbiAgICBjb25zb2xlLndhcm4oJ1RoZSBncmFkaWVudCBuZWVkcyB0byBwcm92aWRlIGF0IGxlYXN0IHR3byBjb2xvcnMnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZ3JhZGllbnRUeXBlICE9PSAnbGluZWFyJyAmJiBncmFkaWVudFR5cGUgIT09ICdyYWRpYWwnKSB7XG4gICAgY29uc29sZS53YXJuKCdHcmFkaWVudFR5cGUgb25seSBzdXBwb3J0cyBsaW5lYXIgb3IgcmFkaWFsLCBjdXJyZW50IHZhbHVlIGlzICcgKyBncmFkaWVudFR5cGUpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBncmFkaWVudFBhcmFtc0xlbmd0aCA9IGdyYWRpZW50UGFyYW1zLmxlbmd0aDtcblxuICBpZiAoZ3JhZGllbnRUeXBlID09PSAnbGluZWFyJyAmJiBncmFkaWVudFBhcmFtc0xlbmd0aCAhPT0gNCB8fCBncmFkaWVudFR5cGUgPT09ICdyYWRpYWwnICYmIGdyYWRpZW50UGFyYW1zTGVuZ3RoICE9PSA2KSB7XG4gICAgY29uc29sZS53YXJuKCdUaGUgZXhwZWN0ZWQgbGVuZ3RoIG9mIGdyYWRpZW50UGFyYW1zIGlzICcgKyAoZ3JhZGllbnRUeXBlID09PSAnbGluZWFyJyA/ICc0JyA6ICc2JykpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChncmFkaWVudFdpdGggIT09ICdmaWxsJyAmJiBncmFkaWVudFdpdGggIT09ICdzdHJva2UnKSB7XG4gICAgY29uc29sZS53YXJuKCdHcmFkaWVudFdpdGggb25seSBzdXBwb3J0cyBmaWxsIG9yIHN0cm9rZSwgY3VycmVudCB2YWx1ZSBpcyAnICsgZ3JhZGllbnRXaXRoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZ3JhZGllbnRTdG9wcyAhPT0gJ2F1dG8nICYmICEoZ3JhZGllbnRTdG9wcyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUud2FybihcImdyYWRpZW50U3RvcHMgb25seSBzdXBwb3J0cyAnYXV0bycgb3IgTnVtYmVyIEFycmF5IChbMCwgLjUsIDFdKSwgY3VycmVudCB2YWx1ZSBpcyBcIiArIGdyYWRpZW50U3RvcHMpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgYSB1bmlmb3JtIGdyYWRpZW50IGNvbG9yIHN0b3BcclxuICogQHBhcmFtIHtBcnJheX0gY29sb3IgR3JhZGllbnQgY29sb3JcclxuICogQHJldHVybiB7QXJyYXl9IEdyYWRpZW50IGNvbG9yIHN0b3BcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QXV0b0NvbG9yU3RvcHMoY29sb3IpIHtcbiAgdmFyIHN0b3BHYXAgPSAxIC8gKGNvbG9yLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gY29sb3IubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4gc3RvcEdhcCAqIGk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBSZXN0b3JlIGNhbnZhcyBjdHggdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggIENvbnRleHQgb2YgY2FudmFzXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5TdHlsZS5wcm90b3R5cGUucmVzdG9yZVRyYW5zZm9ybSA9IGZ1bmN0aW9uIChjdHgpIHtcbiAgY3R4LnJlc3RvcmUoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFVwZGF0ZSBzdHlsZSBkYXRhXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjaGFuZ2UgQ2hhbmdlZCBkYXRhXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5TdHlsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGNoYW5nZSkge1xuICB0aGlzLmNvbG9yUHJvY2Vzc29yKGNoYW5nZSk7XG4gIE9iamVjdC5hc3NpZ24odGhpcywgY2hhbmdlKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY3VycmVudCBzdHlsZSBjb25maWd1cmF0aW9uXHJcbiAqIEByZXR1cm4ge09iamVjdH0gU3R5bGUgY29uZmlndXJhdGlvblxyXG4gKi9cblxuXG5TdHlsZS5wcm90b3R5cGUuZ2V0U3R5bGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjbG9uZWRTdHlsZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKHRoaXMsIHRydWUpO1xuICB0aGlzLmNvbG9yUHJvY2Vzc29yKGNsb25lZFN0eWxlLCB0cnVlKTtcbiAgcmV0dXJuIGNsb25lZFN0eWxlO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmV4dGVuZE5ld0dyYXBoID0gZXh0ZW5kTmV3R3JhcGg7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGV4cG9ydHMudGV4dCA9IGV4cG9ydHMuYmV6aWVyQ3VydmUgPSBleHBvcnRzLnNtb290aGxpbmUgPSBleHBvcnRzLnBvbHlsaW5lID0gZXhwb3J0cy5yZWdQb2x5Z29uID0gZXhwb3J0cy5zZWN0b3IgPSBleHBvcnRzLmFyYyA9IGV4cG9ydHMucmluZyA9IGV4cG9ydHMucmVjdCA9IGV4cG9ydHMuZWxsaXBzZSA9IGV4cG9ydHMuY2lyY2xlID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF9iZXppZXJDdXJ2ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAamlhbWluZ2hpL2Jlemllci1jdXJ2ZVwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jYW52YXMgPSByZXF1aXJlKFwiLi4vcGx1Z2luL2NhbnZhc1wiKTtcblxudmFyIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZSA9IF9iZXppZXJDdXJ2ZTJbXCJkZWZhdWx0XCJdLnBvbHlsaW5lVG9CZXppZXJDdXJ2ZSxcbiAgICBiZXppZXJDdXJ2ZVRvUG9seWxpbmUgPSBfYmV6aWVyQ3VydmUyW1wiZGVmYXVsdFwiXS5iZXppZXJDdXJ2ZVRvUG9seWxpbmU7XG52YXIgY2lyY2xlID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuXG4gICAgaWYgKHR5cGVvZiByeCAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHJ5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgciAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NpcmNsZSBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYyLCBfcmVmMykge1xuICAgIHZhciBjdHggPSBfcmVmMi5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjMuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcbiAgICBjdHguYXJjKHJ4LCByeSwgciA+IDAgPyByIDogMC4wMSwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjQpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNC5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJbkNpcmNsZSkocG9zaXRpb24sIHJ4LCByeSwgcik7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY1LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjYsIF9yZWY3KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY2Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjYubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY3LnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogc2hhcGUucnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogc2hhcGUucnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuY2lyY2xlID0gY2lyY2xlO1xudmFyIGVsbGlwc2UgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgaHI6IDAsXG4gICAgdnI6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjgpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmOC5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgaHIgPSBzaGFwZS5ocixcbiAgICAgICAgdnIgPSBzaGFwZS52cjtcblxuICAgIGlmICh0eXBlb2YgcnggIT09ICdudW1iZXInIHx8IHR5cGVvZiByeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIGhyICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdnIgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFbGxpcHNlIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjksIF9yZWYxMCkge1xuICAgIHZhciBjdHggPSBfcmVmOS5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEwLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgaHIgPSBzaGFwZS5ocixcbiAgICAgICAgdnIgPSBzaGFwZS52cjtcbiAgICBjdHguZWxsaXBzZShyeCwgcnksIGhyID4gMCA/IGhyIDogMC4wMSwgdnIgPiAwID8gdnIgOiAwLjAxLCAwLCAwLCBNYXRoLlBJICogMik7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMTEpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTEuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG4gICAgdmFyIGEgPSBNYXRoLm1heChociwgdnIpO1xuICAgIHZhciBiID0gTWF0aC5taW4oaHIsIHZyKTtcbiAgICB2YXIgYyA9IE1hdGguc3FydChhICogYSAtIGIgKiBiKTtcbiAgICB2YXIgbGVmdEZvY3VzUG9pbnQgPSBbcnggLSBjLCByeV07XG4gICAgdmFyIHJpZ2h0Rm9jdXNQb2ludCA9IFtyeCArIGMsIHJ5XTtcbiAgICB2YXIgZGlzdGFuY2UgPSAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIGxlZnRGb2N1c1BvaW50KSArICgwLCBfdXRpbC5nZXRUd29Qb2ludERpc3RhbmNlKShwb3NpdGlvbiwgcmlnaHRGb2N1c1BvaW50KTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gMiAqIGE7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMTIpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTIuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjEyLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjEzLCBfcmVmMTQpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjEzLm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjEzLm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTQuc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5lbGxpcHNlID0gZWxsaXBzZTtcbnZhciByZWN0ID0ge1xuICBzaGFwZToge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgICB3OiAwLFxuICAgIGg6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjE1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE1LnNoYXBlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcblxuICAgIGlmICh0eXBlb2YgeCAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHkgIT09ICdudW1iZXInIHx8IHR5cGVvZiB3ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgaCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlY3Qgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMTYsIF9yZWYxNykge1xuICAgIHZhciBjdHggPSBfcmVmMTYuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYxNy5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIGN0eC5yZWN0KHgsIHksIHcsIGgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjE4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE4LnNoYXBlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUmVjdCkocG9zaXRpb24sIHgsIHksIHcsIGgpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjE5KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE5LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYxOS5zdHlsZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbeCArIHcgLyAyLCB5ICsgaCAvIDJdO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWYyMCwgX3JlZjIxKSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWYyMC5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWYyMC5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjIxLnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICB4OiBzaGFwZS54ICsgbW92ZW1lbnRYLFxuICAgICAgeTogc2hhcGUueSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yZWN0ID0gcmVjdDtcbnZhciByaW5nID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjIyKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjIyLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcblxuICAgIGlmICh0eXBlb2YgcnggIT09ICdudW1iZXInIHx8IHR5cGVvZiByeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHIgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSaW5nIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjIzLCBfcmVmMjQpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjIzLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjQuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcbiAgICBjdHguYXJjKHJ4LCByeSwgciA+IDAgPyByIDogMC4wMSwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYyNSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYyNS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMjUuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG4gICAgdmFyIGhhbGZMaW5lV2lkdGggPSBsaW5lV2lkdGggLyAyO1xuICAgIHZhciBtaW5EaXN0YW5jZSA9IHIgLSBoYWxmTGluZVdpZHRoO1xuICAgIHZhciBtYXhEaXN0YW5jZSA9IHIgKyBoYWxmTGluZVdpZHRoO1xuICAgIHZhciBkaXN0YW5jZSA9ICgwLCBfdXRpbC5nZXRUd29Qb2ludERpc3RhbmNlKShwb3NpdGlvbiwgW3J4LCByeV0pO1xuICAgIHJldHVybiBkaXN0YW5jZSA+PSBtaW5EaXN0YW5jZSAmJiBkaXN0YW5jZSA8PSBtYXhEaXN0YW5jZTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYyNikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYyNi5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMjYuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmMjcsIF9yZWYyOCkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmMjcubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmMjcubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWYyOC5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHNoYXBlLnJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHNoYXBlLnJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnJpbmcgPSByaW5nO1xudmFyIGFyYyA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwLFxuICAgIHN0YXJ0QW5nbGU6IDAsXG4gICAgZW5kQW5nbGU6IDAsXG4gICAgY2xvY2tXaXNlOiB0cnVlXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYyOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYyOS5zaGFwZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAncicsICdzdGFydEFuZ2xlJywgJ2VuZEFuZ2xlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FyYyBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYzMCwgX3JlZjMxKSB7XG4gICAgdmFyIGN0eCA9IF9yZWYzMC5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjMxLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDAxLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgIWNsb2NrV2lzZSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjMyKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjMyLnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYzMi5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcbiAgICB2YXIgaGFsZkxpbmVXaWR0aCA9IGxpbmVXaWR0aCAvIDI7XG4gICAgdmFyIGluc2lkZVJhZGl1cyA9IHIgLSBoYWxmTGluZVdpZHRoO1xuICAgIHZhciBvdXRzaWRlUmFkaXVzID0gciArIGhhbGZMaW5lV2lkdGg7XG4gICAgcmV0dXJuICEoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5TZWN0b3IpKHBvc2l0aW9uLCByeCwgcnksIGluc2lkZVJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSkgJiYgKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luU2VjdG9yKShwb3NpdGlvbiwgcngsIHJ5LCBvdXRzaWRlUmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY2xvY2tXaXNlKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYzMykge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMy5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMzMuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmMzQsIF9yZWYzNSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmMzQubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmMzQubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWYzNS5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHNoYXBlLnJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHNoYXBlLnJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmFyYyA9IGFyYztcbnZhciBzZWN0b3IgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGNsb2NrV2lzZTogdHJ1ZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMzYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzYuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTZWN0b3Igc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMzcsIF9yZWYzOCkge1xuICAgIHZhciBjdHggPSBfcmVmMzcuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzOC5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIGN0eC5hcmMocngsIHJ5LCByID4gMCA/IHIgOiAwLjAxLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgIWNsb2NrV2lzZSk7XG4gICAgY3R4LmxpbmVUbyhyeCwgcnkpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjM5KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjM5LnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luU2VjdG9yKShwb3NpdGlvbiwgcngsIHJ5LCByLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY2xvY2tXaXNlKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY0MCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0MC5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNDAuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNDEsIF9yZWY0Mikge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNDEubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNDEubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY0Mi5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnNlY3RvciA9IHNlY3RvcjtcbnZhciByZWdQb2x5Z29uID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDAsXG4gICAgc2lkZTogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNDMpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDMuc2hhcGU7XG4gICAgdmFyIHNpZGUgPSBzaGFwZS5zaWRlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdyJywgJ3NpZGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignUmVnUG9seWdvbiBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzaWRlIDwgMykge1xuICAgICAgY29uc29sZS5lcnJvcignUmVnUG9seWdvbiBhdCBsZWFzdCB0cmlnb24hJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjQ0LCBfcmVmNDUpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjQ0LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDUuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjQ1LmNhY2hlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHNpZGUgPSBzaGFwZS5zaWRlO1xuXG4gICAgaWYgKCFjYWNoZS5wb2ludHMgfHwgY2FjaGUucnggIT09IHJ4IHx8IGNhY2hlLnJ5ICE9PSByeSB8fCBjYWNoZS5yICE9PSByIHx8IGNhY2hlLnNpZGUgIT09IHNpZGUpIHtcbiAgICAgIHZhciBfcG9pbnRzID0gKDAsIF91dGlsLmdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzKShyeCwgcnksIHIsIHNpZGUpO1xuXG4gICAgICBPYmplY3QuYXNzaWduKGNhY2hlLCB7XG4gICAgICAgIHBvaW50czogX3BvaW50cyxcbiAgICAgICAgcng6IHJ4LFxuICAgICAgICByeTogcnksXG4gICAgICAgIHI6IHIsXG4gICAgICAgIHNpZGU6IHNpZGVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBwb2ludHMgPSBjYWNoZS5wb2ludHM7XG4gICAgKDAsIF9jYW52YXMuZHJhd1BvbHlsaW5lUGF0aCkoY3R4LCBwb2ludHMpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjQ2KSB7XG4gICAgdmFyIGNhY2hlID0gX3JlZjQ2LmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBjYWNoZS5wb2ludHM7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblBvbHlnb24pKHBvc2l0aW9uLCBwb2ludHMpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjQ3KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQ3LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY0Ny5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY0OCwgX3JlZjQ5KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY0OC5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY0OC5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQ5LnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY0OS5jYWNoZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBjYWNoZS5yeCArPSBtb3ZlbWVudFg7XG4gICAgY2FjaGUucnkgKz0gbW92ZW1lbnRZO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogcnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogcnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgICBjYWNoZS5wb2ludHMgPSBjYWNoZS5wb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmNTApIHtcbiAgICAgIHZhciBfcmVmNTEgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjUwLCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjUxWzBdLFxuICAgICAgICAgIHkgPSBfcmVmNTFbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnJlZ1BvbHlnb24gPSByZWdQb2x5Z29uO1xudmFyIHBvbHlsaW5lID0ge1xuICBzaGFwZToge1xuICAgIHBvaW50czogW10sXG4gICAgY2xvc2U6IGZhbHNlXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY1Mikge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1Mi5zaGFwZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuXG4gICAgaWYgKCEocG9pbnRzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdQb2x5bGluZSBwb2ludHMgc2hvdWxkIGJlIGFuIGFycmF5IScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY1MywgX3JlZjU0KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY1My5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjU0LnNoYXBlLFxuICAgICAgICBsaW5lV2lkdGggPSBfcmVmNTQuc3R5bGUubGluZVdpZHRoO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzLFxuICAgICAgICBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuICAgIGlmIChsaW5lV2lkdGggPT09IDEpIHBvaW50cyA9ICgwLCBfdXRpbC5lbGltaW5hdGVCbHVyKShwb2ludHMpO1xuICAgICgwLCBfY2FudmFzLmRyYXdQb2x5bGluZVBhdGgpKGN0eCwgcG9pbnRzKTtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjU1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjU1LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY1NS5zdHlsZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzLFxuICAgICAgICBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgcG9pbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNOZWFyUG9seWxpbmUpKHBvc2l0aW9uLCBwb2ludHMsIGxpbmVXaWR0aCk7XG4gICAgfVxuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjU2KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjU2LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY1Ni5zdHlsZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gcG9pbnRzWzBdO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY1NywgX3JlZjU4KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY1Ny5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY1Ny5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjU4LnNoYXBlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG4gICAgdmFyIG1vdmVBZnRlclBvaW50cyA9IHBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY1OSkge1xuICAgICAgdmFyIF9yZWY2MCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNTksIDIpLFxuICAgICAgICAgIHggPSBfcmVmNjBbMF0sXG4gICAgICAgICAgeSA9IF9yZWY2MFsxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcG9pbnRzOiBtb3ZlQWZ0ZXJQb2ludHNcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMucG9seWxpbmUgPSBwb2x5bGluZTtcbnZhciBzbW9vdGhsaW5lID0ge1xuICBzaGFwZToge1xuICAgIHBvaW50czogW10sXG4gICAgY2xvc2U6IGZhbHNlXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY2MSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY2MS5zaGFwZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuXG4gICAgaWYgKCEocG9pbnRzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdTbW9vdGhsaW5lIHBvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjYyLCBfcmVmNjMpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjYyLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNjMuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjYzLmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHMsXG4gICAgICAgIGNsb3NlID0gc2hhcGUuY2xvc2U7XG5cbiAgICBpZiAoIWNhY2hlLnBvaW50cyB8fCBjYWNoZS5wb2ludHMudG9TdHJpbmcoKSAhPT0gcG9pbnRzLnRvU3RyaW5nKCkpIHtcbiAgICAgIHZhciBfYmV6aWVyQ3VydmUgPSBwb2x5bGluZVRvQmV6aWVyQ3VydmUocG9pbnRzLCBjbG9zZSk7XG5cbiAgICAgIHZhciBob3ZlclBvaW50cyA9IGJlemllckN1cnZlVG9Qb2x5bGluZShfYmV6aWVyQ3VydmUpO1xuICAgICAgT2JqZWN0LmFzc2lnbihjYWNoZSwge1xuICAgICAgICBwb2ludHM6ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKHBvaW50cywgdHJ1ZSksXG4gICAgICAgIGJlemllckN1cnZlOiBfYmV6aWVyQ3VydmUsXG4gICAgICAgIGhvdmVyUG9pbnRzOiBob3ZlclBvaW50c1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIGJlemllckN1cnZlID0gY2FjaGUuYmV6aWVyQ3VydmU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICgwLCBfY2FudmFzLmRyYXdCZXppZXJDdXJ2ZVBhdGgpKGN0eCwgYmV6aWVyQ3VydmUuc2xpY2UoMSksIGJlemllckN1cnZlWzBdKTtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjY0KSB7XG4gICAgdmFyIGNhY2hlID0gX3JlZjY0LmNhY2hlLFxuICAgICAgICBzaGFwZSA9IF9yZWY2NC5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNjQuc3R5bGU7XG4gICAgdmFyIGhvdmVyUG9pbnRzID0gY2FjaGUuaG92ZXJQb2ludHM7XG4gICAgdmFyIGNsb3NlID0gc2hhcGUuY2xvc2U7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblBvbHlnb24pKHBvc2l0aW9uLCBob3ZlclBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgaG92ZXJQb2ludHMsIGxpbmVXaWR0aCk7XG4gICAgfVxuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjY1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjY1LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY2NS5zdHlsZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gcG9pbnRzWzBdO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY2NiwgX3JlZjY3KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY2Ni5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY2Ni5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjY3LnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY2Ny5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHZhciBtb3ZlQWZ0ZXJQb2ludHMgPSBwb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmNjgpIHtcbiAgICAgIHZhciBfcmVmNjkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjY4LCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjY5WzBdLFxuICAgICAgICAgIHkgPSBfcmVmNjlbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gICAgY2FjaGUucG9pbnRzID0gbW92ZUFmdGVyUG9pbnRzO1xuXG4gICAgdmFyIF9jYWNoZSRiZXppZXJDdXJ2ZSQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2FjaGUuYmV6aWVyQ3VydmVbMF0sIDIpLFxuICAgICAgICBmeCA9IF9jYWNoZSRiZXppZXJDdXJ2ZSRbMF0sXG4gICAgICAgIGZ5ID0gX2NhY2hlJGJlemllckN1cnZlJFsxXTtcblxuICAgIHZhciBjdXJ2ZXMgPSBjYWNoZS5iZXppZXJDdXJ2ZS5zbGljZSgxKTtcbiAgICBjYWNoZS5iZXppZXJDdXJ2ZSA9IFtbZnggKyBtb3ZlbWVudFgsIGZ5ICsgbW92ZW1lbnRZXV0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY3VydmVzLm1hcChmdW5jdGlvbiAoY3VydmUpIHtcbiAgICAgIHJldHVybiBjdXJ2ZS5tYXAoZnVuY3Rpb24gKF9yZWY3MCkge1xuICAgICAgICB2YXIgX3JlZjcxID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY3MCwgMiksXG4gICAgICAgICAgICB4ID0gX3JlZjcxWzBdLFxuICAgICAgICAgICAgeSA9IF9yZWY3MVsxXTtcblxuICAgICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgICAgfSk7XG4gICAgfSkpKTtcbiAgICBjYWNoZS5ob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjcyKSB7XG4gICAgICB2YXIgX3JlZjczID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY3MiwgMiksXG4gICAgICAgICAgeCA9IF9yZWY3M1swXSxcbiAgICAgICAgICB5ID0gX3JlZjczWzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICBwb2ludHM6IG1vdmVBZnRlclBvaW50c1xuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5zbW9vdGhsaW5lID0gc21vb3RobGluZTtcbnZhciBiZXppZXJDdXJ2ZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNzQpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNzQuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignQmV6aWVyQ3VydmUgcG9pbnRzIHNob3VsZCBiZSBhbiBhcnJheSEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNzUsIF9yZWY3Nikge1xuICAgIHZhciBjdHggPSBfcmVmNzUuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY3Ni5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNzYuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcblxuICAgIGlmICghY2FjaGUucG9pbnRzIHx8IGNhY2hlLnBvaW50cy50b1N0cmluZygpICE9PSBwb2ludHMudG9TdHJpbmcoKSkge1xuICAgICAgdmFyIGhvdmVyUG9pbnRzID0gYmV6aWVyQ3VydmVUb1BvbHlsaW5lKHBvaW50cywgMjApO1xuICAgICAgT2JqZWN0LmFzc2lnbihjYWNoZSwge1xuICAgICAgICBwb2ludHM6ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKHBvaW50cywgdHJ1ZSksXG4gICAgICAgIGhvdmVyUG9pbnRzOiBob3ZlclBvaW50c1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICgwLCBfY2FudmFzLmRyYXdCZXppZXJDdXJ2ZVBhdGgpKGN0eCwgcG9pbnRzLnNsaWNlKDEpLCBwb2ludHNbMF0pO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmNzcpIHtcbiAgICB2YXIgY2FjaGUgPSBfcmVmNzcuY2FjaGUsXG4gICAgICAgIHNoYXBlID0gX3JlZjc3LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY3Ny5zdHlsZTtcbiAgICB2YXIgaG92ZXJQb2ludHMgPSBjYWNoZS5ob3ZlclBvaW50cztcbiAgICB2YXIgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUG9seWdvbikocG9zaXRpb24sIGhvdmVyUG9pbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNOZWFyUG9seWxpbmUpKHBvc2l0aW9uLCBob3ZlclBvaW50cywgbGluZVdpZHRoKTtcbiAgICB9XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNzgpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNzguc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjc4LnN0eWxlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBwb2ludHNbMF07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjc5LCBfcmVmODApIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjc5Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjc5Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODAuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjgwLmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG5cbiAgICB2YXIgX3BvaW50cyQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnRzWzBdLCAyKSxcbiAgICAgICAgZnggPSBfcG9pbnRzJFswXSxcbiAgICAgICAgZnkgPSBfcG9pbnRzJFsxXTtcblxuICAgIHZhciBjdXJ2ZXMgPSBwb2ludHMuc2xpY2UoMSk7XG4gICAgdmFyIGJlemllckN1cnZlID0gW1tmeCArIG1vdmVtZW50WCwgZnkgKyBtb3ZlbWVudFldXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjdXJ2ZXMubWFwKGZ1bmN0aW9uIChjdXJ2ZSkge1xuICAgICAgcmV0dXJuIGN1cnZlLm1hcChmdW5jdGlvbiAoX3JlZjgxKSB7XG4gICAgICAgIHZhciBfcmVmODIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgxLCAyKSxcbiAgICAgICAgICAgIHggPSBfcmVmODJbMF0sXG4gICAgICAgICAgICB5ID0gX3JlZjgyWzFdO1xuXG4gICAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgICB9KTtcbiAgICB9KSkpO1xuICAgIGNhY2hlLnBvaW50cyA9IGJlemllckN1cnZlO1xuICAgIGNhY2hlLmhvdmVyUG9pbnRzID0gY2FjaGUuaG92ZXJQb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmODMpIHtcbiAgICAgIHZhciBfcmVmODQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgzLCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjg0WzBdLFxuICAgICAgICAgIHkgPSBfcmVmODRbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvaW50czogYmV6aWVyQ3VydmVcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuYmV6aWVyQ3VydmUgPSBiZXppZXJDdXJ2ZTtcbnZhciB0ZXh0ID0ge1xuICBzaGFwZToge1xuICAgIGNvbnRlbnQ6ICcnLFxuICAgIHBvc2l0aW9uOiBbXSxcbiAgICBtYXhXaWR0aDogdW5kZWZpbmVkLFxuICAgIHJvd0dhcDogMFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmODUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODUuc2hhcGU7XG4gICAgdmFyIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uLFxuICAgICAgICByb3dHYXAgPSBzaGFwZS5yb3dHYXA7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRlbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXh0IGNvbnRlbnQgc2hvdWxkIGJlIGEgc3RyaW5nIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghKHBvc2l0aW9uIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXh0IHBvc2l0aW9uIHNob3VsZCBiZSBhbiBhcnJheSEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJvd0dhcCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1RleHQgcm93R2FwIHNob3VsZCBiZSBhIG51bWJlciEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmODYsIF9yZWY4Nykge1xuICAgIHZhciBjdHggPSBfcmVmODYuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY4Ny5zaGFwZTtcbiAgICB2YXIgY29udGVudCA9IHNoYXBlLmNvbnRlbnQsXG4gICAgICAgIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb24sXG4gICAgICAgIG1heFdpZHRoID0gc2hhcGUubWF4V2lkdGgsXG4gICAgICAgIHJvd0dhcCA9IHNoYXBlLnJvd0dhcDtcbiAgICB2YXIgdGV4dEJhc2VsaW5lID0gY3R4LnRleHRCYXNlbGluZSxcbiAgICAgICAgZm9udCA9IGN0eC5mb250O1xuICAgIHZhciBmb250U2l6ZSA9IHBhcnNlSW50KGZvbnQucmVwbGFjZSgvXFxEL2csICcnKSk7XG5cbiAgICB2YXIgX3Bvc2l0aW9uID0gcG9zaXRpb24sXG4gICAgICAgIF9wb3NpdGlvbjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3Bvc2l0aW9uLCAyKSxcbiAgICAgICAgeCA9IF9wb3NpdGlvbjJbMF0sXG4gICAgICAgIHkgPSBfcG9zaXRpb24yWzFdO1xuXG4gICAgY29udGVudCA9IGNvbnRlbnQuc3BsaXQoJ1xcbicpO1xuICAgIHZhciByb3dOdW0gPSBjb250ZW50Lmxlbmd0aDtcbiAgICB2YXIgbGluZUhlaWdodCA9IGZvbnRTaXplICsgcm93R2FwO1xuICAgIHZhciBhbGxIZWlnaHQgPSByb3dOdW0gKiBsaW5lSGVpZ2h0IC0gcm93R2FwO1xuICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgaWYgKHRleHRCYXNlbGluZSA9PT0gJ21pZGRsZScpIHtcbiAgICAgIG9mZnNldCA9IGFsbEhlaWdodCAvIDI7XG4gICAgICB5ICs9IGZvbnRTaXplIC8gMjtcbiAgICB9XG5cbiAgICBpZiAodGV4dEJhc2VsaW5lID09PSAnYm90dG9tJykge1xuICAgICAgb2Zmc2V0ID0gYWxsSGVpZ2h0O1xuICAgICAgeSArPSBmb250U2l6ZTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbiA9IG5ldyBBcnJheShyb3dOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICAgIHJldHVybiBbeCwgeSArIGkgKiBsaW5lSGVpZ2h0IC0gb2Zmc2V0XTtcbiAgICB9KTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY29udGVudC5mb3JFYWNoKGZ1bmN0aW9uICh0ZXh0LCBpKSB7XG4gICAgICBjdHguZmlsbFRleHQuYXBwbHkoY3R4LCBbdGV4dF0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb25baV0pLCBbbWF4V2lkdGhdKSk7XG4gICAgICBjdHguc3Ryb2tlVGV4dC5hcHBseShjdHgsIFt0ZXh0XS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3NpdGlvbltpXSksIFttYXhXaWR0aF0pKTtcbiAgICB9KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY4OCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY4OC5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmODguc3R5bGU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjg5KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjg5LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY4OS5zdHlsZTtcbiAgICB2YXIgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbjtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb24pO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY5MCwgX3JlZjkxKSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY5MC5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY5MC5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjkxLnNoYXBlO1xuXG4gICAgdmFyIF9zaGFwZSRwb3NpdGlvbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShzaGFwZS5wb3NpdGlvbiwgMiksXG4gICAgICAgIHggPSBfc2hhcGUkcG9zaXRpb25bMF0sXG4gICAgICAgIHkgPSBfc2hhcGUkcG9zaXRpb25bMV07XG5cbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcG9zaXRpb246IFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy50ZXh0ID0gdGV4dDtcbnZhciBncmFwaHMgPSBuZXcgTWFwKFtbJ2NpcmNsZScsIGNpcmNsZV0sIFsnZWxsaXBzZScsIGVsbGlwc2VdLCBbJ3JlY3QnLCByZWN0XSwgWydyaW5nJywgcmluZ10sIFsnYXJjJywgYXJjXSwgWydzZWN0b3InLCBzZWN0b3JdLCBbJ3JlZ1BvbHlnb24nLCByZWdQb2x5Z29uXSwgWydwb2x5bGluZScsIHBvbHlsaW5lXSwgWydzbW9vdGhsaW5lJywgc21vb3RobGluZV0sIFsnYmV6aWVyQ3VydmUnLCBiZXppZXJDdXJ2ZV0sIFsndGV4dCcsIHRleHRdXSk7XG52YXIgX2RlZmF1bHQgPSBncmFwaHM7XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEV4dGVuZCBuZXcgZ3JhcGhcclxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgICBOYW1lIG9mIEdyYXBoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgQ29uZmlndXJhdGlvbiBvZiBHcmFwaFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7XG5cbmZ1bmN0aW9uIGV4dGVuZE5ld0dyYXBoKG5hbWUsIGNvbmZpZykge1xuICBpZiAoIW5hbWUgfHwgIWNvbmZpZykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0V4dGVuZE5ld0dyYXBoIE1pc3NpbmcgUGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbmZpZy5zaGFwZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1JlcXVpcmVkIGF0dHJpYnV0ZSBvZiBzaGFwZSB0byBleHRlbmROZXdHcmFwaCEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIWNvbmZpZy52YWxpZGF0b3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZXF1aXJlZCBmdW5jdGlvbiBvZiB2YWxpZGF0b3IgdG8gZXh0ZW5kTmV3R3JhcGghJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb25maWcuZHJhdykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1JlcXVpcmVkIGZ1bmN0aW9uIG9mIGRyYXcgdG8gZXh0ZW5kTmV3R3JhcGghJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ3JhcGhzLnNldChuYW1lLCBjb25maWcpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkNSZW5kZXJcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2NyZW5kZXJbXCJkZWZhdWx0XCJdO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImV4dGVuZE5ld0dyYXBoXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9ncmFwaHMuZXh0ZW5kTmV3R3JhcGg7XG4gIH1cbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfY3JlbmRlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY2xhc3MvY3JlbmRlci5jbGFzc1wiKSk7XG5cbnZhciBfZ3JhcGhzID0gcmVxdWlyZShcIi4vY29uZmlnL2dyYXBoc1wiKTtcblxudmFyIF9kZWZhdWx0ID0gX2NyZW5kZXJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRyYXdQb2x5bGluZVBhdGggPSBkcmF3UG9seWxpbmVQYXRoO1xuZXhwb3J0cy5kcmF3QmV6aWVyQ3VydmVQYXRoID0gZHJhd0JlemllckN1cnZlUGF0aDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIERyYXcgYSBwb2x5bGluZSBwYXRoXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggICAgICAgIENhbnZhcyAyZCBjb250ZXh0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyAgICAgIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYmVnaW5QYXRoIFdoZXRoZXIgdG8gZXhlY3V0ZSBiZWdpblBhdGhcclxuICogQHBhcmFtIHtCb29sZWFufSBjbG9zZVBhdGggV2hldGhlciB0byBleGVjdXRlIGNsb3NlUGF0aFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5mdW5jdGlvbiBkcmF3UG9seWxpbmVQYXRoKGN0eCwgcG9pbnRzKSB7XG4gIHZhciBiZWdpblBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgY2xvc2VQYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcbiAgaWYgKCFjdHggfHwgcG9pbnRzLmxlbmd0aCA8IDIpIHJldHVybiBmYWxzZTtcbiAgaWYgKGJlZ2luUGF0aCkgY3R4LmJlZ2luUGF0aCgpO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQsIGkpIHtcbiAgICByZXR1cm4gcG9pbnQgJiYgKGkgPT09IDAgPyBjdHgubW92ZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCkpIDogY3R4LmxpbmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQpKSk7XG4gIH0pO1xuICBpZiAoY2xvc2VQYXRoKSBjdHguY2xvc2VQYXRoKCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIERyYXcgYSBiZXppZXIgY3VydmUgcGF0aFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICAgICAgICBDYW52YXMgMmQgY29udGV4dFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgICAgICBUaGUgcG9pbnRzIHRoYXQgbWFrZXMgdXAgYSBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gbW92ZVRvICAgICAgVGhlIHBvaW50IG5lZWQgdG8gZXhjdXRlIG1vdmVUb1xyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJlZ2luUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgYmVnaW5QYXRoXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2VQYXRoIFdoZXRoZXIgdG8gZXhlY3V0ZSBjbG9zZVBhdGhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGRyYXdCZXppZXJDdXJ2ZVBhdGgoY3R4LCBwb2ludHMpIHtcbiAgdmFyIG1vdmVUbyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gIHZhciBiZWdpblBhdGggPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuICB2YXIgY2xvc2VQYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBmYWxzZTtcbiAgaWYgKCFjdHggfHwgIXBvaW50cykgcmV0dXJuIGZhbHNlO1xuICBpZiAoYmVnaW5QYXRoKSBjdHguYmVnaW5QYXRoKCk7XG4gIGlmIChtb3ZlVG8pIGN0eC5tb3ZlVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1vdmVUbykpO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBpdGVtICYmIGN0eC5iZXppZXJDdXJ2ZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtWzBdKS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtWzFdKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtWzJdKSkpO1xuICB9KTtcbiAgaWYgKGNsb3NlUGF0aCkgY3R4LmNsb3NlUGF0aCgpO1xufVxuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGRyYXdQb2x5bGluZVBhdGg6IGRyYXdQb2x5bGluZVBhdGgsXG4gIGRyYXdCZXppZXJDdXJ2ZVBhdGg6IGRyYXdCZXppZXJDdXJ2ZVBhdGhcbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVlcENsb25lID0gZGVlcENsb25lO1xuZXhwb3J0cy5lbGltaW5hdGVCbHVyID0gZWxpbWluYXRlQmx1cjtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5DaXJjbGUgPSBjaGVja1BvaW50SXNJbkNpcmNsZTtcbmV4cG9ydHMuZ2V0VHdvUG9pbnREaXN0YW5jZSA9IGdldFR3b1BvaW50RGlzdGFuY2U7XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luUG9seWdvbiA9IGNoZWNrUG9pbnRJc0luUG9seWdvbjtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5TZWN0b3IgPSBjaGVja1BvaW50SXNJblNlY3RvcjtcbmV4cG9ydHMuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lID0gY2hlY2tQb2ludElzTmVhclBvbHlsaW5lO1xuZXhwb3J0cy5jaGVja1BvaW50SXNJblJlY3QgPSBjaGVja1BvaW50SXNJblJlY3Q7XG5leHBvcnRzLmdldFJvdGF0ZVBvaW50UG9zID0gZ2V0Um90YXRlUG9pbnRQb3M7XG5leHBvcnRzLmdldFNjYWxlUG9pbnRQb3MgPSBnZXRTY2FsZVBvaW50UG9zO1xuZXhwb3J0cy5nZXRUcmFuc2xhdGVQb2ludFBvcyA9IGdldFRyYW5zbGF0ZVBvaW50UG9zO1xuZXhwb3J0cy5nZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmUgPSBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmU7XG5leHBvcnRzLmdldENpcmNsZVJhZGlhblBvaW50ID0gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ7XG5leHBvcnRzLmdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzID0gZ2V0UmVndWxhclBvbHlnb25Qb2ludHM7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIGFicyA9IE1hdGguYWJzLFxuICAgIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgc2luID0gTWF0aC5zaW4sXG4gICAgY29zID0gTWF0aC5jb3MsXG4gICAgbWF4ID0gTWF0aC5tYXgsXG4gICAgbWluID0gTWF0aC5taW4sXG4gICAgUEkgPSBNYXRoLlBJO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDbG9uZSBhbiBvYmplY3Qgb3IgYXJyYXlcclxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iamVjdCBDbG9uZWQgb2JqZWN0XHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVjdXJzaW9uICAgV2hldGhlciB0byB1c2UgcmVjdXJzaXZlIGNsb25pbmdcclxuICogQHJldHVybiB7T2JqZWN0fEFycmF5fSBDbG9uZSBvYmplY3RcclxuICovXG5cbmZ1bmN0aW9uIGRlZXBDbG9uZShvYmplY3QpIHtcbiAgdmFyIHJlY3Vyc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gIGlmICghb2JqZWN0KSByZXR1cm4gb2JqZWN0O1xuICB2YXIgcGFyc2UgPSBKU09OLnBhcnNlLFxuICAgICAgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG4gIGlmICghcmVjdXJzaW9uKSByZXR1cm4gcGFyc2Uoc3RyaW5naWZ5KG9iamVjdCkpO1xuICB2YXIgY2xvbmVkT2JqID0gb2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9O1xuXG4gIGlmIChvYmplY3QgJiYgKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkob2JqZWN0KSA9PT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKG9iamVjdFtrZXldICYmICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG9iamVjdFtrZXldKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBjbG9uZWRPYmpba2V5XSA9IGRlZXBDbG9uZShvYmplY3Rba2V5XSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2xvbmVkT2JqW2tleV0gPSBvYmplY3Rba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjbG9uZWRPYmo7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEVsaW1pbmF0ZSBsaW5lIGJsdXIgZHVlIHRvIDFweCBsaW5lIHdpZHRoXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50cyBMaW5lIHBvaW50c1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gTGluZSBwb2ludHMgYWZ0ZXIgcHJvY2Vzc2VkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGVsaW1pbmF0ZUJsdXIocG9pbnRzKSB7XG4gIHJldHVybiBwb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIF9yZWYyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYsIDIpLFxuICAgICAgICB4ID0gX3JlZjJbMF0sXG4gICAgICAgIHkgPSBfcmVmMlsxXTtcblxuICAgIHJldHVybiBbcGFyc2VJbnQoeCkgKyAwLjUsIHBhcnNlSW50KHkpICsgMC41XTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIGNpcmNsZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByeCAgIENpcmNsZSB4IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJ5ICAgQ2lyY2xlIHkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gciAgICBDaXJjbGUgcmFkaXVzXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNJbkNpcmNsZShwb2ludCwgcngsIHJ5LCByKSB7XG4gIHJldHVybiBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50LCBbcngsIHJ5XSkgPD0gcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQxIHBvaW50MVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludDIgcG9pbnQyXHJcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFR3b1BvaW50RGlzdGFuY2UoX3JlZjMsIF9yZWY0KSB7XG4gIHZhciBfcmVmNSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMywgMiksXG4gICAgICB4YSA9IF9yZWY1WzBdLFxuICAgICAgeWEgPSBfcmVmNVsxXTtcblxuICB2YXIgX3JlZjYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjQsIDIpLFxuICAgICAgeGIgPSBfcmVmNlswXSxcbiAgICAgIHliID0gX3JlZjZbMV07XG5cbiAgdmFyIG1pbnVzWCA9IGFicyh4YSAtIHhiKTtcbiAgdmFyIG1pbnVzWSA9IGFicyh5YSAtIHliKTtcbiAgcmV0dXJuIHNxcnQobWludXNYICogbWludXNYICsgbWludXNZICogbWludXNZKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcG9seWdvblxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgcG9seWxpbmVcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc0luUG9seWdvbihwb2ludCwgcG9seWdvbikge1xuICB2YXIgY291bnRlciA9IDA7XG5cbiAgdmFyIF9wb2ludCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50WzBdLFxuICAgICAgeSA9IF9wb2ludFsxXTtcblxuICB2YXIgcG9pbnROdW0gPSBwb2x5Z29uLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMSwgcDEgPSBwb2x5Z29uWzBdOyBpIDw9IHBvaW50TnVtOyBpKyspIHtcbiAgICB2YXIgcDIgPSBwb2x5Z29uW2kgJSBwb2ludE51bV07XG5cbiAgICBpZiAoeCA+IG1pbihwMVswXSwgcDJbMF0pICYmIHggPD0gbWF4KHAxWzBdLCBwMlswXSkpIHtcbiAgICAgIGlmICh5IDw9IG1heChwMVsxXSwgcDJbMV0pKSB7XG4gICAgICAgIGlmIChwMVswXSAhPT0gcDJbMF0pIHtcbiAgICAgICAgICB2YXIgeGludGVycyA9ICh4IC0gcDFbMF0pICogKHAyWzFdIC0gcDFbMV0pIC8gKHAyWzBdIC0gcDFbMF0pICsgcDFbMV07XG5cbiAgICAgICAgICBpZiAocDFbMV0gPT09IHAyWzFdIHx8IHkgPD0geGludGVycykge1xuICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHAxID0gcDI7XG4gIH1cblxuICByZXR1cm4gY291bnRlciAlIDIgPT09IDE7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHNlY3RvclxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByeCAgICAgICAgIFNlY3RvciB4IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJ5ICAgICAgICAgU2VjdG9yIHkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gciAgICAgICAgICBTZWN0b3IgcmFkaXVzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydEFuZ2xlIFNlY3RvciBzdGFydCBhbmdsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZW5kQW5nbGUgICBTZWN0b3IgZW5kIGFuZ2xlXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvY2tXaXNlIFdoZXRoZXIgdGhlIHNlY3RvciBhbmdsZSBpcyBjbG9ja3dpc2VcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc0luU2VjdG9yKHBvaW50LCByeCwgcnksIHIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgW3J4LCByeV0pID4gcikgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICghY2xvY2tXaXNlKSB7XG4gICAgdmFyIF9kZWVwQ2xvbmUgPSBkZWVwQ2xvbmUoW2VuZEFuZ2xlLCBzdGFydEFuZ2xlXSk7XG5cbiAgICB2YXIgX2RlZXBDbG9uZTIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2RlZXBDbG9uZSwgMik7XG5cbiAgICBzdGFydEFuZ2xlID0gX2RlZXBDbG9uZTJbMF07XG4gICAgZW5kQW5nbGUgPSBfZGVlcENsb25lMlsxXTtcbiAgfVxuXG4gIHZhciByZXZlcnNlQkUgPSBzdGFydEFuZ2xlID4gZW5kQW5nbGU7XG5cbiAgaWYgKHJldmVyc2VCRSkge1xuICAgIHZhciBfcmVmNyA9IFtlbmRBbmdsZSwgc3RhcnRBbmdsZV07XG4gICAgc3RhcnRBbmdsZSA9IF9yZWY3WzBdO1xuICAgIGVuZEFuZ2xlID0gX3JlZjdbMV07XG4gIH1cblxuICB2YXIgbWludXMgPSBlbmRBbmdsZSAtIHN0YXJ0QW5nbGU7XG4gIGlmIChtaW51cyA+PSBQSSAqIDIpIHJldHVybiB0cnVlO1xuXG4gIHZhciBfcG9pbnQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQyWzBdLFxuICAgICAgeSA9IF9wb2ludDJbMV07XG5cbiAgdmFyIF9nZXRDaXJjbGVSYWRpYW5Qb2ludCA9IGdldENpcmNsZVJhZGlhblBvaW50KHJ4LCByeSwgciwgc3RhcnRBbmdsZSksXG4gICAgICBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRDaXJjbGVSYWRpYW5Qb2ludCwgMiksXG4gICAgICBieCA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDJbMF0sXG4gICAgICBieSA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDJbMV07XG5cbiAgdmFyIF9nZXRDaXJjbGVSYWRpYW5Qb2ludDMgPSBnZXRDaXJjbGVSYWRpYW5Qb2ludChyeCwgcnksIHIsIGVuZEFuZ2xlKSxcbiAgICAgIF9nZXRDaXJjbGVSYWRpYW5Qb2ludDQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldENpcmNsZVJhZGlhblBvaW50MywgMiksXG4gICAgICBleCA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDRbMF0sXG4gICAgICBleSA9IF9nZXRDaXJjbGVSYWRpYW5Qb2ludDRbMV07XG5cbiAgdmFyIHZQb2ludCA9IFt4IC0gcngsIHkgLSByeV07XG4gIHZhciB2QkFybSA9IFtieCAtIHJ4LCBieSAtIHJ5XTtcbiAgdmFyIHZFQXJtID0gW2V4IC0gcngsIGV5IC0gcnldO1xuICB2YXIgcmV2ZXJzZSA9IG1pbnVzID4gUEk7XG5cbiAgaWYgKHJldmVyc2UpIHtcbiAgICB2YXIgX2RlZXBDbG9uZTMgPSBkZWVwQ2xvbmUoW3ZFQXJtLCB2QkFybV0pO1xuXG4gICAgdmFyIF9kZWVwQ2xvbmU0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9kZWVwQ2xvbmUzLCAyKTtcblxuICAgIHZCQXJtID0gX2RlZXBDbG9uZTRbMF07XG4gICAgdkVBcm0gPSBfZGVlcENsb25lNFsxXTtcbiAgfVxuXG4gIHZhciBpblNlY3RvciA9IGlzQ2xvY2tXaXNlKHZCQXJtLCB2UG9pbnQpICYmICFpc0Nsb2NrV2lzZSh2RUFybSwgdlBvaW50KTtcbiAgaWYgKHJldmVyc2UpIGluU2VjdG9yID0gIWluU2VjdG9yO1xuICBpZiAocmV2ZXJzZUJFKSBpblNlY3RvciA9ICFpblNlY3RvcjtcbiAgcmV0dXJuIGluU2VjdG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEZXRlcm1pbmUgaWYgdGhlIHBvaW50IGlzIGluIHRoZSBjbG9ja3dpc2UgZGlyZWN0aW9uIG9mIHRoZSB2ZWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gdkFybSAgIFZlY3RvclxyXG4gKiBAcGFyYW0ge0FycmF5fSB2UG9pbnQgUG9pbnRcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGlzQ2xvY2tXaXNlKHZBcm0sIHZQb2ludCkge1xuICB2YXIgX3ZBcm0gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkodkFybSwgMiksXG4gICAgICBheCA9IF92QXJtWzBdLFxuICAgICAgYXkgPSBfdkFybVsxXTtcblxuICB2YXIgX3ZQb2ludCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh2UG9pbnQsIDIpLFxuICAgICAgcHggPSBfdlBvaW50WzBdLFxuICAgICAgcHkgPSBfdlBvaW50WzFdO1xuXG4gIHJldHVybiAtYXkgKiBweCArIGF4ICogcHkgPiAwO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gcG9seWxpbmUgICBUaGUgcG9pbnRzIHRoYXQgbWFrZXMgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbGluZVdpZHRoIFBvbHlsaW5lIGxpbmV3aWR0aFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKHBvaW50LCBwb2x5bGluZSwgbGluZVdpZHRoKSB7XG4gIHZhciBoYWxmTGluZVdpZHRoID0gbGluZVdpZHRoIC8gMjtcbiAgdmFyIG1vdmVVcFBvbHlsaW5lID0gcG9seWxpbmUubWFwKGZ1bmN0aW9uIChfcmVmOCkge1xuICAgIHZhciBfcmVmOSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmOCwgMiksXG4gICAgICAgIHggPSBfcmVmOVswXSxcbiAgICAgICAgeSA9IF9yZWY5WzFdO1xuXG4gICAgcmV0dXJuIFt4LCB5IC0gaGFsZkxpbmVXaWR0aF07XG4gIH0pO1xuICB2YXIgbW92ZURvd25Qb2x5bGluZSA9IHBvbHlsaW5lLm1hcChmdW5jdGlvbiAoX3JlZjEwKSB7XG4gICAgdmFyIF9yZWYxMSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTAsIDIpLFxuICAgICAgICB4ID0gX3JlZjExWzBdLFxuICAgICAgICB5ID0gX3JlZjExWzFdO1xuXG4gICAgcmV0dXJuIFt4LCB5ICsgaGFsZkxpbmVXaWR0aF07XG4gIH0pO1xuICB2YXIgcG9seWdvbiA9IFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1vdmVVcFBvbHlsaW5lKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtb3ZlRG93blBvbHlsaW5lLnJldmVyc2UoKSkpO1xuICByZXR1cm4gY2hlY2tQb2ludElzSW5Qb2x5Z29uKHBvaW50LCBwb2x5Z29uKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcmVjdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggICAgICBSZWN0IHN0YXJ0IHggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0geSAgICAgIFJlY3Qgc3RhcnQgeSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aCAgUmVjdCB3aWR0aFxyXG4gKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0IFJlY3QgaGVpZ2h0XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNJblJlY3QoX3JlZjEyLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBfcmVmMTMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEyLCAyKSxcbiAgICAgIHB4ID0gX3JlZjEzWzBdLFxuICAgICAgcHkgPSBfcmVmMTNbMV07XG5cbiAgaWYgKHB4IDwgeCkgcmV0dXJuIGZhbHNlO1xuICBpZiAocHkgPCB5KSByZXR1cm4gZmFsc2U7XG4gIGlmIChweCA+IHggKyB3aWR0aCkgcmV0dXJuIGZhbHNlO1xuICBpZiAocHkgPiB5ICsgaGVpZ2h0KSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSByb3RhdGVkIHBvaW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByb3RhdGUgRGVncmVlIG9mIHJvdGF0aW9uXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBvcmlnaW4gIFJvdGF0aW9uIGNlbnRlclxyXG4gKiBAcGFyYW0ge0FycmF5fSBvcmlnaW4gIFJvdGF0aW9uIGNlbnRlclxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIGFmdGVyIHJvdGF0aW9uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJvdGF0ZVBvaW50UG9zKCkge1xuICB2YXIgcm90YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xuICB2YXIgcG9pbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgdmFyIG9yaWdpbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogWzAsIDBdO1xuICBpZiAoIXBvaW50KSByZXR1cm4gZmFsc2U7XG4gIGlmIChyb3RhdGUgJSAzNjAgPT09IDApIHJldHVybiBwb2ludDtcblxuICB2YXIgX3BvaW50MyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50M1swXSxcbiAgICAgIHkgPSBfcG9pbnQzWzFdO1xuXG4gIHZhciBfb3JpZ2luID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKG9yaWdpbiwgMiksXG4gICAgICBveCA9IF9vcmlnaW5bMF0sXG4gICAgICBveSA9IF9vcmlnaW5bMV07XG5cbiAgcm90YXRlICo9IFBJIC8gMTgwO1xuICByZXR1cm4gWyh4IC0gb3gpICogY29zKHJvdGF0ZSkgLSAoeSAtIG95KSAqIHNpbihyb3RhdGUpICsgb3gsICh4IC0gb3gpICogc2luKHJvdGF0ZSkgKyAoeSAtIG95KSAqIGNvcyhyb3RhdGUpICsgb3ldO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBzY2FsZWQgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gc2NhbGUgIFNjYWxlIGZhY3RvclxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBvcmlnaW4gU2NhbGUgY2VudGVyXHJcbiAqIEByZXR1cm4ge051bWJlcn0gQ29vcmRpbmF0ZXMgYWZ0ZXIgc2NhbGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U2NhbGVQb2ludFBvcygpIHtcbiAgdmFyIHNjYWxlID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbMSwgMV07XG4gIHZhciBwb2ludCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkO1xuICB2YXIgb3JpZ2luID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBbMCwgMF07XG4gIGlmICghcG9pbnQpIHJldHVybiBmYWxzZTtcbiAgaWYgKHNjYWxlID09PSAxKSByZXR1cm4gcG9pbnQ7XG5cbiAgdmFyIF9wb2ludDQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDRbMF0sXG4gICAgICB5ID0gX3BvaW50NFsxXTtcblxuICB2YXIgX29yaWdpbjIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkob3JpZ2luLCAyKSxcbiAgICAgIG94ID0gX29yaWdpbjJbMF0sXG4gICAgICBveSA9IF9vcmlnaW4yWzFdO1xuXG4gIHZhciBfc2NhbGUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2NhbGUsIDIpLFxuICAgICAgeHMgPSBfc2NhbGVbMF0sXG4gICAgICB5cyA9IF9zY2FsZVsxXTtcblxuICB2YXIgcmVsYXRpdmVQb3NYID0geCAtIG94O1xuICB2YXIgcmVsYXRpdmVQb3NZID0geSAtIG95O1xuICByZXR1cm4gW3JlbGF0aXZlUG9zWCAqIHhzICsgb3gsIHJlbGF0aXZlUG9zWSAqIHlzICsgb3ldO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBzY2FsZWQgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gdHJhbnNsYXRlIFRyYW5zbGF0aW9uIGRpc3RhbmNlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEByZXR1cm4ge051bWJlcn0gQ29vcmRpbmF0ZXMgYWZ0ZXIgdHJhbnNsYXRpb25cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0VHJhbnNsYXRlUG9pbnRQb3ModHJhbnNsYXRlLCBwb2ludCkge1xuICBpZiAoIXRyYW5zbGF0ZSB8fCAhcG9pbnQpIHJldHVybiBmYWxzZTtcblxuICB2YXIgX3BvaW50NSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50NVswXSxcbiAgICAgIHkgPSBfcG9pbnQ1WzFdO1xuXG4gIHZhciBfdHJhbnNsYXRlID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHRyYW5zbGF0ZSwgMiksXG4gICAgICB0eCA9IF90cmFuc2xhdGVbMF0sXG4gICAgICB0eSA9IF90cmFuc2xhdGVbMV07XG5cbiAgcmV0dXJuIFt4ICsgdHgsIHkgKyB0eV07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcG9pbnQgdG8gdGhlIGxpbmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gbGluZUJlZ2luIExpbmUgc3RhcnQgcG9zaXRpb25cclxuICogQHBhcmFtIHtBcnJheX0gbGluZUVuZCAgIExpbmUgZW5kIHBvc2l0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2UgYmV0d2VlbiBwb2ludCBhbmQgbGluZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmUocG9pbnQsIGxpbmVCZWdpbiwgbGluZUVuZCkge1xuICBpZiAoIXBvaW50IHx8ICFsaW5lQmVnaW4gfHwgIWxpbmVFbmQpIHJldHVybiBmYWxzZTtcblxuICB2YXIgX3BvaW50NiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50NlswXSxcbiAgICAgIHkgPSBfcG9pbnQ2WzFdO1xuXG4gIHZhciBfbGluZUJlZ2luID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGxpbmVCZWdpbiwgMiksXG4gICAgICB4MSA9IF9saW5lQmVnaW5bMF0sXG4gICAgICB5MSA9IF9saW5lQmVnaW5bMV07XG5cbiAgdmFyIF9saW5lRW5kID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGxpbmVFbmQsIDIpLFxuICAgICAgeDIgPSBfbGluZUVuZFswXSxcbiAgICAgIHkyID0gX2xpbmVFbmRbMV07XG5cbiAgdmFyIGEgPSB5MiAtIHkxO1xuICB2YXIgYiA9IHgxIC0geDI7XG4gIHZhciBjID0geTEgKiAoeDIgLSB4MSkgLSB4MSAqICh5MiAtIHkxKTtcbiAgdmFyIG1vbGVjdWxlID0gYWJzKGEgKiB4ICsgYiAqIHkgKyBjKTtcbiAgdmFyIGRlbm9taW5hdG9yID0gc3FydChhICogYSArIGIgKiBiKTtcbiAgcmV0dXJuIG1vbGVjdWxlIC8gZGVub21pbmF0b3I7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHNwZWNpZmllZCByYWRpYW4gb24gdGhlIGNpcmNsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgIENpcmNsZSB4IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgICAgICBDaXJjbGUgeSBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWRpdXMgQ2lyY2xlIHJhZGl1c1xyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkaWFuIFNwZWNmaWVkIHJhZGlhblxyXG4gKiBAcmV0dXJuIHtBcnJheX0gUG9zdGlvbiBvZiBwb2ludFxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRDaXJjbGVSYWRpYW5Qb2ludCh4LCB5LCByYWRpdXMsIHJhZGlhbikge1xuICByZXR1cm4gW3ggKyBjb3MocmFkaWFuKSAqIHJhZGl1cywgeSArIHNpbihyYWRpYW4pICogcmFkaXVzXTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcmVndWxhciBwb2x5Z29uXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4ICAgICBYIGNvb3JkaW5hdGUgb2YgdGhlIHBvbHlnb24gaW5zY3JpYmVkIGNpcmNsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0geSAgICAgWSBjb29yZGluYXRlIG9mIHRoZSBwb2x5Z29uIGluc2NyaWJlZCBjaXJjbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgIFJhZGl1cyBvZiB0aGUgcG9seWdvbiBpbnNjcmliZWQgY2lyY2xlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzaWRlICBTaWRlIG51bWJlclxyXG4gKiBAcGFyYW0ge051bWJlcn0gbWludXMgUmFkaWFuIG9mZnNldFxyXG4gKiBAcmV0dXJuIHtBcnJheX0gUG9pbnRzIHRoYXQgbWFrZSB1cCBhIHJlZ3VsYXIgcG9seWdvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSZWd1bGFyUG9seWdvblBvaW50cyhyeCwgcnksIHIsIHNpZGUpIHtcbiAgdmFyIG1pbnVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBQSSAqIC0wLjU7XG4gIHZhciByYWRpYW5HYXAgPSBQSSAqIDIgLyBzaWRlO1xuICB2YXIgcmFkaWFucyA9IG5ldyBBcnJheShzaWRlKS5maWxsKCcnKS5tYXAoZnVuY3Rpb24gKHQsIGkpIHtcbiAgICByZXR1cm4gaSAqIHJhZGlhbkdhcCArIG1pbnVzO1xuICB9KTtcbiAgcmV0dXJuIHJhZGlhbnMubWFwKGZ1bmN0aW9uIChyYWRpYW4pIHtcbiAgICByZXR1cm4gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQocngsIHJ5LCByLCByYWRpYW4pO1xuICB9KTtcbn1cblxudmFyIF9kZWZhdWx0ID0ge1xuICBkZWVwQ2xvbmU6IGRlZXBDbG9uZSxcbiAgZWxpbWluYXRlQmx1cjogZWxpbWluYXRlQmx1cixcbiAgY2hlY2tQb2ludElzSW5DaXJjbGU6IGNoZWNrUG9pbnRJc0luQ2lyY2xlLFxuICBjaGVja1BvaW50SXNJblBvbHlnb246IGNoZWNrUG9pbnRJc0luUG9seWdvbixcbiAgY2hlY2tQb2ludElzSW5TZWN0b3I6IGNoZWNrUG9pbnRJc0luU2VjdG9yLFxuICBjaGVja1BvaW50SXNOZWFyUG9seWxpbmU6IGNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSxcbiAgZ2V0VHdvUG9pbnREaXN0YW5jZTogZ2V0VHdvUG9pbnREaXN0YW5jZSxcbiAgZ2V0Um90YXRlUG9pbnRQb3M6IGdldFJvdGF0ZVBvaW50UG9zLFxuICBnZXRTY2FsZVBvaW50UG9zOiBnZXRTY2FsZVBvaW50UG9zLFxuICBnZXRUcmFuc2xhdGVQb2ludFBvczogZ2V0VHJhbnNsYXRlUG9pbnRQb3MsXG4gIGdldENpcmNsZVJhZGlhblBvaW50OiBnZXRDaXJjbGVSYWRpYW5Qb2ludCxcbiAgZ2V0UmVndWxhclBvbHlnb25Qb2ludHM6IGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzLFxuICBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmU6IGdldERpc3RhbmNlQmV0d2VlblBvaW50QW5kTGluZVxufTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9kZWZhdWx0ID0gbmV3IE1hcChbWyd0cmFuc3BhcmVudCcsICdyZ2JhKDAsMCwwLDApJ10sIFsnYmxhY2snLCAnIzAwMDAwMCddLCBbJ3NpbHZlcicsICcjQzBDMEMwJ10sIFsnZ3JheScsICcjODA4MDgwJ10sIFsnd2hpdGUnLCAnI0ZGRkZGRiddLCBbJ21hcm9vbicsICcjODAwMDAwJ10sIFsncmVkJywgJyNGRjAwMDAnXSwgWydwdXJwbGUnLCAnIzgwMDA4MCddLCBbJ2Z1Y2hzaWEnLCAnI0ZGMDBGRiddLCBbJ2dyZWVuJywgJyMwMDgwMDAnXSwgWydsaW1lJywgJyMwMEZGMDAnXSwgWydvbGl2ZScsICcjODA4MDAwJ10sIFsneWVsbG93JywgJyNGRkZGMDAnXSwgWyduYXZ5JywgJyMwMDAwODAnXSwgWydibHVlJywgJyMwMDAwRkYnXSwgWyd0ZWFsJywgJyMwMDgwODAnXSwgWydhcXVhJywgJyMwMEZGRkYnXSwgWydhbGljZWJsdWUnLCAnI2YwZjhmZiddLCBbJ2FudGlxdWV3aGl0ZScsICcjZmFlYmQ3J10sIFsnYXF1YW1hcmluZScsICcjN2ZmZmQ0J10sIFsnYXp1cmUnLCAnI2YwZmZmZiddLCBbJ2JlaWdlJywgJyNmNWY1ZGMnXSwgWydiaXNxdWUnLCAnI2ZmZTRjNCddLCBbJ2JsYW5jaGVkYWxtb25kJywgJyNmZmViY2QnXSwgWydibHVldmlvbGV0JywgJyM4YTJiZTInXSwgWydicm93bicsICcjYTUyYTJhJ10sIFsnYnVybHl3b29kJywgJyNkZWI4ODcnXSwgWydjYWRldGJsdWUnLCAnIzVmOWVhMCddLCBbJ2NoYXJ0cmV1c2UnLCAnIzdmZmYwMCddLCBbJ2Nob2NvbGF0ZScsICcjZDI2OTFlJ10sIFsnY29yYWwnLCAnI2ZmN2Y1MCddLCBbJ2Nvcm5mbG93ZXJibHVlJywgJyM2NDk1ZWQnXSwgWydjb3Juc2lsaycsICcjZmZmOGRjJ10sIFsnY3JpbXNvbicsICcjZGMxNDNjJ10sIFsnY3lhbicsICcjMDBmZmZmJ10sIFsnZGFya2JsdWUnLCAnIzAwMDA4YiddLCBbJ2RhcmtjeWFuJywgJyMwMDhiOGInXSwgWydkYXJrZ29sZGVucm9kJywgJyNiODg2MGInXSwgWydkYXJrZ3JheScsICcjYTlhOWE5J10sIFsnZGFya2dyZWVuJywgJyMwMDY0MDAnXSwgWydkYXJrZ3JleScsICcjYTlhOWE5J10sIFsnZGFya2toYWtpJywgJyNiZGI3NmInXSwgWydkYXJrbWFnZW50YScsICcjOGIwMDhiJ10sIFsnZGFya29saXZlZ3JlZW4nLCAnIzU1NmIyZiddLCBbJ2RhcmtvcmFuZ2UnLCAnI2ZmOGMwMCddLCBbJ2RhcmtvcmNoaWQnLCAnIzk5MzJjYyddLCBbJ2RhcmtyZWQnLCAnIzhiMDAwMCddLCBbJ2RhcmtzYWxtb24nLCAnI2U5OTY3YSddLCBbJ2RhcmtzZWFncmVlbicsICcjOGZiYzhmJ10sIFsnZGFya3NsYXRlYmx1ZScsICcjNDgzZDhiJ10sIFsnZGFya3NsYXRlZ3JheScsICcjMmY0ZjRmJ10sIFsnZGFya3NsYXRlZ3JleScsICcjMmY0ZjRmJ10sIFsnZGFya3R1cnF1b2lzZScsICcjMDBjZWQxJ10sIFsnZGFya3Zpb2xldCcsICcjOTQwMGQzJ10sIFsnZGVlcHBpbmsnLCAnI2ZmMTQ5MyddLCBbJ2RlZXBza3libHVlJywgJyMwMGJmZmYnXSwgWydkaW1ncmF5JywgJyM2OTY5NjknXSwgWydkaW1ncmV5JywgJyM2OTY5NjknXSwgWydkb2RnZXJibHVlJywgJyMxZTkwZmYnXSwgWydmaXJlYnJpY2snLCAnI2IyMjIyMiddLCBbJ2Zsb3JhbHdoaXRlJywgJyNmZmZhZjAnXSwgWydmb3Jlc3RncmVlbicsICcjMjI4YjIyJ10sIFsnZ2FpbnNib3JvJywgJyNkY2RjZGMnXSwgWydnaG9zdHdoaXRlJywgJyNmOGY4ZmYnXSwgWydnb2xkJywgJyNmZmQ3MDAnXSwgWydnb2xkZW5yb2QnLCAnI2RhYTUyMCddLCBbJ2dyZWVueWVsbG93JywgJyNhZGZmMmYnXSwgWydncmV5JywgJyM4MDgwODAnXSwgWydob25leWRldycsICcjZjBmZmYwJ10sIFsnaG90cGluaycsICcjZmY2OWI0J10sIFsnaW5kaWFucmVkJywgJyNjZDVjNWMnXSwgWydpbmRpZ28nLCAnIzRiMDA4MiddLCBbJ2l2b3J5JywgJyNmZmZmZjAnXSwgWydraGFraScsICcjZjBlNjhjJ10sIFsnbGF2ZW5kZXInLCAnI2U2ZTZmYSddLCBbJ2xhdmVuZGVyYmx1c2gnLCAnI2ZmZjBmNSddLCBbJ2xhd25ncmVlbicsICcjN2NmYzAwJ10sIFsnbGVtb25jaGlmZm9uJywgJyNmZmZhY2QnXSwgWydsaWdodGJsdWUnLCAnI2FkZDhlNiddLCBbJ2xpZ2h0Y29yYWwnLCAnI2YwODA4MCddLCBbJ2xpZ2h0Y3lhbicsICcjZTBmZmZmJ10sIFsnbGlnaHRnb2xkZW5yb2R5ZWxsb3cnLCAnI2ZhZmFkMiddLCBbJ2xpZ2h0Z3JheScsICcjZDNkM2QzJ10sIFsnbGlnaHRncmVlbicsICcjOTBlZTkwJ10sIFsnbGlnaHRncmV5JywgJyNkM2QzZDMnXSwgWydsaWdodHBpbmsnLCAnI2ZmYjZjMSddLCBbJ2xpZ2h0c2FsbW9uJywgJyNmZmEwN2EnXSwgWydsaWdodHNlYWdyZWVuJywgJyMyMGIyYWEnXSwgWydsaWdodHNreWJsdWUnLCAnIzg3Y2VmYSddLCBbJ2xpZ2h0c2xhdGVncmF5JywgJyM3Nzg4OTknXSwgWydsaWdodHNsYXRlZ3JleScsICcjNzc4ODk5J10sIFsnbGlnaHRzdGVlbGJsdWUnLCAnI2IwYzRkZSddLCBbJ2xpZ2h0eWVsbG93JywgJyNmZmZmZTAnXSwgWydsaW1lZ3JlZW4nLCAnIzMyY2QzMiddLCBbJ2xpbmVuJywgJyNmYWYwZTYnXSwgWydtYWdlbnRhJywgJyNmZjAwZmYnXSwgWydtZWRpdW1hcXVhbWFyaW5lJywgJyM2NmNkYWEnXSwgWydtZWRpdW1ibHVlJywgJyMwMDAwY2QnXSwgWydtZWRpdW1vcmNoaWQnLCAnI2JhNTVkMyddLCBbJ21lZGl1bXB1cnBsZScsICcjOTM3MGRiJ10sIFsnbWVkaXVtc2VhZ3JlZW4nLCAnIzNjYjM3MSddLCBbJ21lZGl1bXNsYXRlYmx1ZScsICcjN2I2OGVlJ10sIFsnbWVkaXVtc3ByaW5nZ3JlZW4nLCAnIzAwZmE5YSddLCBbJ21lZGl1bXR1cnF1b2lzZScsICcjNDhkMWNjJ10sIFsnbWVkaXVtdmlvbGV0cmVkJywgJyNjNzE1ODUnXSwgWydtaWRuaWdodGJsdWUnLCAnIzE5MTk3MCddLCBbJ21pbnRjcmVhbScsICcjZjVmZmZhJ10sIFsnbWlzdHlyb3NlJywgJyNmZmU0ZTEnXSwgWydtb2NjYXNpbicsICcjZmZlNGI1J10sIFsnbmF2YWpvd2hpdGUnLCAnI2ZmZGVhZCddLCBbJ29sZGxhY2UnLCAnI2ZkZjVlNiddLCBbJ29saXZlZHJhYicsICcjNmI4ZTIzJ10sIFsnb3JhbmdlJywgJyNmZmE1MDAnXSwgWydvcmFuZ2VyZWQnLCAnI2ZmNDUwMCddLCBbJ29yY2hpZCcsICcjZGE3MGQ2J10sIFsncGFsZWdvbGRlbnJvZCcsICcjZWVlOGFhJ10sIFsncGFsZWdyZWVuJywgJyM5OGZiOTgnXSwgWydwYWxldHVycXVvaXNlJywgJyNhZmVlZWUnXSwgWydwYWxldmlvbGV0cmVkJywgJyNkYjcwOTMnXSwgWydwYXBheWF3aGlwJywgJyNmZmVmZDUnXSwgWydwZWFjaHB1ZmYnLCAnI2ZmZGFiOSddLCBbJ3BlcnUnLCAnI2NkODUzZiddLCBbJ3BpbmsnLCAnI2ZmYzBjYiddLCBbJ3BsdW0nLCAnI2RkYTBkZCddLCBbJ3Bvd2RlcmJsdWUnLCAnI2IwZTBlNiddLCBbJ3Jvc3licm93bicsICcjYmM4ZjhmJ10sIFsncm95YWxibHVlJywgJyM0MTY5ZTEnXSwgWydzYWRkbGVicm93bicsICcjOGI0NTEzJ10sIFsnc2FsbW9uJywgJyNmYTgwNzInXSwgWydzYW5keWJyb3duJywgJyNmNGE0NjAnXSwgWydzZWFncmVlbicsICcjMmU4YjU3J10sIFsnc2Vhc2hlbGwnLCAnI2ZmZjVlZSddLCBbJ3NpZW5uYScsICcjYTA1MjJkJ10sIFsnc2t5Ymx1ZScsICcjODdjZWViJ10sIFsnc2xhdGVibHVlJywgJyM2YTVhY2QnXSwgWydzbGF0ZWdyYXknLCAnIzcwODA5MCddLCBbJ3NsYXRlZ3JleScsICcjNzA4MDkwJ10sIFsnc25vdycsICcjZmZmYWZhJ10sIFsnc3ByaW5nZ3JlZW4nLCAnIzAwZmY3ZiddLCBbJ3N0ZWVsYmx1ZScsICcjNDY4MmI0J10sIFsndGFuJywgJyNkMmI0OGMnXSwgWyd0aGlzdGxlJywgJyNkOGJmZDgnXSwgWyd0b21hdG8nLCAnI2ZmNjM0NyddLCBbJ3R1cnF1b2lzZScsICcjNDBlMGQwJ10sIFsndmlvbGV0JywgJyNlZTgyZWUnXSwgWyd3aGVhdCcsICcjZjVkZWIzJ10sIFsnd2hpdGVzbW9rZScsICcjZjVmNWY1J10sIFsneWVsbG93Z3JlZW4nLCAnIzlhY2QzMiddXSk7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nZXRSZ2JWYWx1ZSA9IGdldFJnYlZhbHVlO1xuZXhwb3J0cy5nZXRSZ2JhVmFsdWUgPSBnZXRSZ2JhVmFsdWU7XG5leHBvcnRzLmdldE9wYWNpdHkgPSBnZXRPcGFjaXR5O1xuZXhwb3J0cy50b1JnYiA9IHRvUmdiO1xuZXhwb3J0cy50b0hleCA9IHRvSGV4O1xuZXhwb3J0cy5nZXRDb2xvckZyb21SZ2JWYWx1ZSA9IGdldENvbG9yRnJvbVJnYlZhbHVlO1xuZXhwb3J0cy5kYXJrZW4gPSBkYXJrZW47XG5leHBvcnRzLmxpZ2h0ZW4gPSBsaWdodGVuO1xuZXhwb3J0cy5mYWRlID0gZmFkZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2tleXdvcmRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jb25maWcva2V5d29yZHNcIikpO1xuXG52YXIgaGV4UmVnID0gL14jKFswLTlhLWZBLWZdezN9fFswLTlhLWZBLWZdezZ9KSQvO1xudmFyIHJnYlJlZyA9IC9eKHJnYnxyZ2JhfFJHQnxSR0JBKS87XG52YXIgcmdiYVJlZyA9IC9eKHJnYmF8UkdCQSkvO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDb2xvciB2YWxpZGF0b3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBWYWxpZCBjb2xvciBPciBmYWxzZVxyXG4gKi9cblxuZnVuY3Rpb24gdmFsaWRhdG9yKGNvbG9yKSB7XG4gIHZhciBpc0hleCA9IGhleFJlZy50ZXN0KGNvbG9yKTtcbiAgdmFyIGlzUmdiID0gcmdiUmVnLnRlc3QoY29sb3IpO1xuICBpZiAoaXNIZXggfHwgaXNSZ2IpIHJldHVybiBjb2xvcjtcbiAgY29sb3IgPSBnZXRDb2xvckJ5S2V5d29yZChjb2xvcik7XG5cbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NvbG9yOiBJbnZhbGlkIGNvbG9yIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBjb2xvcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IGNvbG9yIGJ5IGtleXdvcmRcclxuICogQHBhcmFtIHtTdHJpbmd9IGtleXdvcmQgQ29sb3Iga2V5d29yZCBsaWtlIHJlZCwgZ3JlZW4gYW5kIGV0Yy5cclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IEhleCBvciByZ2JhIGNvbG9yIChJbnZhbGlkIGtleXdvcmQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldENvbG9yQnlLZXl3b3JkKGtleXdvcmQpIHtcbiAgaWYgKCFrZXl3b3JkKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0Q29sb3JCeUtleXdvcmRzOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFfa2V5d29yZHNbXCJkZWZhdWx0XCJdLmhhcyhrZXl3b3JkKSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gX2tleXdvcmRzW1wiZGVmYXVsdFwiXS5nZXQoa2V5d29yZCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgUmdiIHZhbHVlIG9mIHRoZSBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7QXJyYXk8TnVtYmVyPnxCb29sZWFufSBSZ2IgdmFsdWUgb2YgdGhlIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSZ2JWYWx1ZShjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0UmdiVmFsdWU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb2xvciA9IHZhbGlkYXRvcihjb2xvcik7XG4gIGlmICghY29sb3IpIHJldHVybiBmYWxzZTtcbiAgdmFyIGlzSGV4ID0gaGV4UmVnLnRlc3QoY29sb3IpO1xuICB2YXIgaXNSZ2IgPSByZ2JSZWcudGVzdChjb2xvcik7XG4gIHZhciBsb3dlckNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgaWYgKGlzSGV4KSByZXR1cm4gZ2V0UmdiVmFsdWVGcm9tSGV4KGxvd2VyQ29sb3IpO1xuICBpZiAoaXNSZ2IpIHJldHVybiBnZXRSZ2JWYWx1ZUZyb21SZ2IobG93ZXJDb2xvcik7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcmdiIHZhbHVlIG9mIHRoZSBoZXggY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleCBjb2xvclxyXG4gKiBAcmV0dXJuIHtBcnJheTxOdW1iZXI+fSBSZ2IgdmFsdWUgb2YgdGhlIGNvbG9yXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFJnYlZhbHVlRnJvbUhleChjb2xvcikge1xuICBjb2xvciA9IGNvbG9yLnJlcGxhY2UoJyMnLCAnJyk7XG4gIGlmIChjb2xvci5sZW5ndGggPT09IDMpIGNvbG9yID0gQXJyYXkuZnJvbShjb2xvcikubWFwKGZ1bmN0aW9uIChoZXhOdW0pIHtcbiAgICByZXR1cm4gaGV4TnVtICsgaGV4TnVtO1xuICB9KS5qb2luKCcnKTtcbiAgY29sb3IgPSBjb2xvci5zcGxpdCgnJyk7XG4gIHJldHVybiBuZXcgQXJyYXkoMykuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKHQsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQoXCIweFwiLmNvbmNhdChjb2xvcltpICogMl0pLmNvbmNhdChjb2xvcltpICogMiArIDFdKSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHJnYiB2YWx1ZSBvZiB0aGUgcmdiL3JnYmEgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleCBjb2xvclxyXG4gKiBAcmV0dXJuIHtBcnJheX0gUmdiIHZhbHVlIG9mIHRoZSBjb2xvclxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSZ2JWYWx1ZUZyb21SZ2IoY29sb3IpIHtcbiAgcmV0dXJuIGNvbG9yLnJlcGxhY2UoL3JnYlxcKHxyZ2JhXFwofFxcKS9nLCAnJykuc3BsaXQoJywnKS5zbGljZSgwLCAzKS5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gcGFyc2VJbnQobik7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIFJnYmEgdmFsdWUgb2YgdGhlIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtBcnJheTxOdW1iZXI+fEJvb2xlYW59IFJnYmEgdmFsdWUgb2YgdGhlIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSZ2JhVmFsdWUoY29sb3IpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldFJnYmFWYWx1ZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBjb2xvclZhbHVlID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIWNvbG9yVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgY29sb3JWYWx1ZS5wdXNoKGdldE9wYWNpdHkoY29sb3IpKTtcbiAgcmV0dXJuIGNvbG9yVmFsdWU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgb3BhY2l0eSBvZiBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7TnVtYmVyfEJvb2xlYW59IENvbG9yIG9wYWNpdHkgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE9wYWNpdHkoY29sb3IpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldE9wYWNpdHk6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb2xvciA9IHZhbGlkYXRvcihjb2xvcik7XG4gIGlmICghY29sb3IpIHJldHVybiBmYWxzZTtcbiAgdmFyIGlzUmdiYSA9IHJnYmFSZWcudGVzdChjb2xvcik7XG4gIGlmICghaXNSZ2JhKSByZXR1cm4gMTtcbiAgY29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gTnVtYmVyKGNvbG9yLnNwbGl0KCcsJykuc2xpY2UoLTEpWzBdLnJlcGxhY2UoL1spfFxcc10vZywgJycpKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ29udmVydCBjb2xvciB0byBSZ2J8UmdiYSBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgICBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gb3BhY2l0eSBUaGUgb3BhY2l0eSBvZiBjb2xvclxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdifFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHRvUmdiKGNvbG9yLCBvcGFjaXR5KSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCd0b1JnYjogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZ2JWYWx1ZSA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICB2YXIgYWRkT3BhY2l0eSA9IHR5cGVvZiBvcGFjaXR5ID09PSAnbnVtYmVyJztcbiAgaWYgKGFkZE9wYWNpdHkpIHJldHVybiAncmdiYSgnICsgcmdiVmFsdWUuam9pbignLCcpICsgXCIsXCIuY29uY2F0KG9wYWNpdHksIFwiKVwiKTtcbiAgcmV0dXJuICdyZ2IoJyArIHJnYlZhbHVlLmpvaW4oJywnKSArICcpJztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ29udmVydCBjb2xvciB0byBIZXggY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBIZXggY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIHRvSGV4KGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCd0b0hleDogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChoZXhSZWcudGVzdChjb2xvcikpIHJldHVybiBjb2xvcjtcbiAgY29sb3IgPSBnZXRSZ2JWYWx1ZShjb2xvcik7XG4gIGlmICghY29sb3IpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuICcjJyArIGNvbG9yLm1hcChmdW5jdGlvbiAobikge1xuICAgIHJldHVybiBOdW1iZXIobikudG9TdHJpbmcoMTYpO1xuICB9KS5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gbiA9PT0gJzAnID8gJzAwJyA6IG47XG4gIH0pLmpvaW4oJycpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgQ29sb3IgZnJvbSBSZ2J8UmdiYSB2YWx1ZVxyXG4gKiBAcGFyYW0ge0FycmF5PE51bWJlcj59IHZhbHVlIFJnYnxSZ2JhIGNvbG9yIHZhbHVlXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2J8UmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0Q29sb3JGcm9tUmdiVmFsdWUodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldENvbG9yRnJvbVJnYlZhbHVlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xuXG4gIGlmICh2YWx1ZUxlbmd0aCAhPT0gMyAmJiB2YWx1ZUxlbmd0aCAhPT0gNCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldENvbG9yRnJvbVJnYlZhbHVlOiBWYWx1ZSBpcyBpbGxlZ2FsIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBjb2xvciA9IHZhbHVlTGVuZ3RoID09PSAzID8gJ3JnYignIDogJ3JnYmEoJztcbiAgY29sb3IgKz0gdmFsdWUuam9pbignLCcpICsgJyknO1xuICByZXR1cm4gY29sb3I7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIERlZXBlbiBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7TnVtYmVyfSBQZXJjZW50IG9mIERlZXBlbiAoMS0xMDApXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBkYXJrZW4oY29sb3IpIHtcbiAgdmFyIHBlcmNlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG5cbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2RhcmtlbjogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZ2JhVmFsdWUgPSBnZXRSZ2JhVmFsdWUoY29sb3IpO1xuICBpZiAoIXJnYmFWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICByZ2JhVmFsdWUgPSByZ2JhVmFsdWUubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgcmV0dXJuIGkgPT09IDMgPyB2IDogdiAtIE1hdGguY2VpbCgyLjU1ICogcGVyY2VudCk7XG4gIH0pLm1hcChmdW5jdGlvbiAodikge1xuICAgIHJldHVybiB2IDwgMCA/IDAgOiB2O1xuICB9KTtcbiAgcmV0dXJuIGdldENvbG9yRnJvbVJnYlZhbHVlKHJnYmFWYWx1ZSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEJyaWdodGVuIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFBlcmNlbnQgb2YgYnJpZ2h0ZW4gKDEtMTAwKVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gbGlnaHRlbihjb2xvcikge1xuICB2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcblxuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignbGlnaHRlbjogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciByZ2JhVmFsdWUgPSBnZXRSZ2JhVmFsdWUoY29sb3IpO1xuICBpZiAoIXJnYmFWYWx1ZSkgcmV0dXJuIGZhbHNlO1xuICByZ2JhVmFsdWUgPSByZ2JhVmFsdWUubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgcmV0dXJuIGkgPT09IDMgPyB2IDogdiArIE1hdGguY2VpbCgyLjU1ICogcGVyY2VudCk7XG4gIH0pLm1hcChmdW5jdGlvbiAodikge1xuICAgIHJldHVybiB2ID4gMjU1ID8gMjU1IDogdjtcbiAgfSk7XG4gIHJldHVybiBnZXRDb2xvckZyb21SZ2JWYWx1ZShyZ2JhVmFsdWUpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBBZGp1c3QgY29sb3Igb3BhY2l0eVxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgICBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gUGVyY2VudCBvZiBvcGFjaXR5XHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBmYWRlKGNvbG9yKSB7XG4gIHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAxMDA7XG5cbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2ZhZGU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiVmFsdWUgPSBnZXRSZ2JWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgdmFyIHJnYmFWYWx1ZSA9IFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHJnYlZhbHVlKSwgW3BlcmNlbnQgLyAxMDBdKTtcbiAgcmV0dXJuIGdldENvbG9yRnJvbVJnYlZhbHVlKHJnYmFWYWx1ZSk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHtcbiAgZmFkZTogZmFkZSxcbiAgdG9IZXg6IHRvSGV4LFxuICB0b1JnYjogdG9SZ2IsXG4gIGRhcmtlbjogZGFya2VuLFxuICBsaWdodGVuOiBsaWdodGVuLFxuICBnZXRPcGFjaXR5OiBnZXRPcGFjaXR5LFxuICBnZXRSZ2JWYWx1ZTogZ2V0UmdiVmFsdWUsXG4gIGdldFJnYmFWYWx1ZTogZ2V0UmdiYVZhbHVlLFxuICBnZXRDb2xvckZyb21SZ2JWYWx1ZTogZ2V0Q29sb3JGcm9tUmdiVmFsdWVcbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBleHBvcnRzLmVhc2VJbk91dEJvdW5jZSA9IGV4cG9ydHMuZWFzZU91dEJvdW5jZSA9IGV4cG9ydHMuZWFzZUluQm91bmNlID0gZXhwb3J0cy5lYXNlSW5PdXRFbGFzdGljID0gZXhwb3J0cy5lYXNlT3V0RWxhc3RpYyA9IGV4cG9ydHMuZWFzZUluRWxhc3RpYyA9IGV4cG9ydHMuZWFzZUluT3V0QmFjayA9IGV4cG9ydHMuZWFzZU91dEJhY2sgPSBleHBvcnRzLmVhc2VJbkJhY2sgPSBleHBvcnRzLmVhc2VJbk91dFF1aW50ID0gZXhwb3J0cy5lYXNlT3V0UXVpbnQgPSBleHBvcnRzLmVhc2VJblF1aW50ID0gZXhwb3J0cy5lYXNlSW5PdXRRdWFydCA9IGV4cG9ydHMuZWFzZU91dFF1YXJ0ID0gZXhwb3J0cy5lYXNlSW5RdWFydCA9IGV4cG9ydHMuZWFzZUluT3V0Q3ViaWMgPSBleHBvcnRzLmVhc2VPdXRDdWJpYyA9IGV4cG9ydHMuZWFzZUluQ3ViaWMgPSBleHBvcnRzLmVhc2VJbk91dFF1YWQgPSBleHBvcnRzLmVhc2VPdXRRdWFkID0gZXhwb3J0cy5lYXNlSW5RdWFkID0gZXhwb3J0cy5lYXNlSW5PdXRTaW5lID0gZXhwb3J0cy5lYXNlT3V0U2luZSA9IGV4cG9ydHMuZWFzZUluU2luZSA9IGV4cG9ydHMubGluZWFyID0gdm9pZCAwO1xudmFyIGxpbmVhciA9IFtbWzAsIDFdLCAnJywgWzAuMzMsIDAuNjddXSwgW1sxLCAwXSwgWzAuNjcsIDAuMzNdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNpbmVcclxuICovXG5cbmV4cG9ydHMubGluZWFyID0gbGluZWFyO1xudmFyIGVhc2VJblNpbmUgPSBbW1swLCAxXV0sIFtbMC41MzgsIDAuNTY0XSwgWzAuMTY5LCAwLjkxMl0sIFswLjg4MCwgMC4xOTZdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5TaW5lID0gZWFzZUluU2luZTtcbnZhciBlYXNlT3V0U2luZSA9IFtbWzAsIDFdXSwgW1swLjQ0NCwgMC40NDhdLCBbMC4xNjksIDAuNzM2XSwgWzAuNzE4LCAwLjE2XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dFNpbmUgPSBlYXNlT3V0U2luZTtcbnZhciBlYXNlSW5PdXRTaW5lID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuMiwgMV0sIFswLjgsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBRdWFkXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dFNpbmUgPSBlYXNlSW5PdXRTaW5lO1xudmFyIGVhc2VJblF1YWQgPSBbW1swLCAxXV0sIFtbMC41NTAsIDAuNTg0XSwgWzAuMjMxLCAwLjkwNF0sIFswLjg2OCwgMC4yNjRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5RdWFkID0gZWFzZUluUXVhZDtcbnZhciBlYXNlT3V0UXVhZCA9IFtbWzAsIDFdXSwgW1swLjQxMywgMC40MjhdLCBbMC4wNjUsIDAuODE2XSwgWzAuNzYwLCAwLjA0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dFF1YWQgPSBlYXNlT3V0UXVhZDtcbnZhciBlYXNlSW5PdXRRdWFkID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuMywgMC45XSwgWzAuNywgMC4xXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ3ViaWNcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0UXVhZCA9IGVhc2VJbk91dFF1YWQ7XG52YXIgZWFzZUluQ3ViaWMgPSBbW1swLCAxXV0sIFtbMC42NzksIDAuNjg4XSwgWzAuMzY2LCAwLjk5Ml0sIFswLjk5MiwgMC4zODRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5DdWJpYyA9IGVhc2VJbkN1YmljO1xudmFyIGVhc2VPdXRDdWJpYyA9IFtbWzAsIDFdXSwgW1swLjMyMSwgMC4zMTJdLCBbMC4wMDgsIDAuNjE2XSwgWzAuNjM0LCAwLjAwOF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRDdWJpYyA9IGVhc2VPdXRDdWJpYztcbnZhciBlYXNlSW5PdXRDdWJpYyA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjMsIDFdLCBbMC43LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUXVhcnRcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0Q3ViaWMgPSBlYXNlSW5PdXRDdWJpYztcbnZhciBlYXNlSW5RdWFydCA9IFtbWzAsIDFdXSwgW1swLjgxMiwgMC43NF0sIFswLjYxMSwgMC45ODhdLCBbMS4wMTMsIDAuNDkyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluUXVhcnQgPSBlYXNlSW5RdWFydDtcbnZhciBlYXNlT3V0UXVhcnQgPSBbW1swLCAxXV0sIFtbMC4xNTIsIDAuMjQ0XSwgWzAuMDAxLCAwLjQ0OF0sIFswLjI4NSwgLTAuMDJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0UXVhcnQgPSBlYXNlT3V0UXVhcnQ7XG52YXIgZWFzZUluT3V0UXVhcnQgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC40LCAxXSwgWzAuNiwgMF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFF1aW50XHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dFF1YXJ0ID0gZWFzZUluT3V0UXVhcnQ7XG52YXIgZWFzZUluUXVpbnQgPSBbW1swLCAxXV0sIFtbMC44NTcsIDAuODU2XSwgWzAuNzE0LCAxXSwgWzEsIDAuNzEyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluUXVpbnQgPSBlYXNlSW5RdWludDtcbnZhciBlYXNlT3V0UXVpbnQgPSBbW1swLCAxXV0sIFtbMC4xMDgsIDAuMl0sIFswLjAwMSwgMC40XSwgWzAuMjE0LCAtMC4wMTJdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0UXVpbnQgPSBlYXNlT3V0UXVpbnQ7XG52YXIgZWFzZUluT3V0UXVpbnQgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC41LCAxXSwgWzAuNSwgMF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEJhY2tcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0UXVpbnQgPSBlYXNlSW5PdXRRdWludDtcbnZhciBlYXNlSW5CYWNrID0gW1tbMCwgMV1dLCBbWzAuNjY3LCAwLjg5Nl0sIFswLjM4MCwgMS4xODRdLCBbMC45NTUsIDAuNjE2XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluQmFjayA9IGVhc2VJbkJhY2s7XG52YXIgZWFzZU91dEJhY2sgPSBbW1swLCAxXV0sIFtbMC4zMzUsIDAuMDI4XSwgWzAuMDYxLCAwLjIyXSwgWzAuNjMxLCAtMC4xOF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRCYWNrID0gZWFzZU91dEJhY2s7XG52YXIgZWFzZUluT3V0QmFjayA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjQsIDEuNF0sIFswLjYsIC0wLjRdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBFbGFzdGljXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dEJhY2sgPSBlYXNlSW5PdXRCYWNrO1xudmFyIGVhc2VJbkVsYXN0aWMgPSBbW1swLCAxXV0sIFtbMC40NzQsIDAuOTY0XSwgWzAuMzgyLCAwLjk4OF0sIFswLjU1NywgMC45NTJdXSwgW1swLjYxOSwgMS4wNzZdLCBbMC41NjUsIDEuMDg4XSwgWzAuNjY5LCAxLjA4XV0sIFtbMC43NzAsIDAuOTE2XSwgWzAuNzEyLCAwLjkyNF0sIFswLjg0NywgMC45MDRdXSwgW1swLjkxMSwgMS4zMDRdLCBbMC44NzIsIDEuMzE2XSwgWzAuOTYxLCAxLjM0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluRWxhc3RpYyA9IGVhc2VJbkVsYXN0aWM7XG52YXIgZWFzZU91dEVsYXN0aWMgPSBbW1swLCAxXV0sIFtbMC4wNzMsIC0wLjMyXSwgWzAuMDM0LCAtMC4zMjhdLCBbMC4xMDQsIC0wLjM0NF1dLCBbWzAuMTkxLCAwLjA5Ml0sIFswLjExMCwgMC4wNl0sIFswLjI1NiwgMC4wOF1dLCBbWzAuMzEwLCAtMC4wNzZdLCBbMC4yNjAsIC0wLjA2OF0sIFswLjM1NywgLTAuMDc2XV0sIFtbMC40MzIsIDAuMDMyXSwgWzAuMzYyLCAwLjAyOF0sIFswLjY4MywgLTAuMDA0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dEVsYXN0aWMgPSBlYXNlT3V0RWxhc3RpYztcbnZhciBlYXNlSW5PdXRFbGFzdGljID0gW1tbMCwgMV1dLCBbWzAuMjEwLCAwLjk0XSwgWzAuMTY3LCAwLjg4NF0sIFswLjI1MiwgMC45OF1dLCBbWzAuMjk5LCAxLjEwNF0sIFswLjI1NiwgMS4wOTJdLCBbMC4zNDcsIDEuMTA4XV0sIFtbMC41LCAwLjQ5Nl0sIFswLjQ1MSwgMC42NzJdLCBbMC41NDgsIDAuMzI0XV0sIFtbMC42OTYsIC0wLjEwOF0sIFswLjY1MiwgLTAuMTEyXSwgWzAuNzQxLCAtMC4xMjRdXSwgW1swLjgwNSwgMC4wNjRdLCBbMC43NTYsIDAuMDEyXSwgWzAuODY2LCAwLjA5Nl1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEJvdW5jZVxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRFbGFzdGljID0gZWFzZUluT3V0RWxhc3RpYztcbnZhciBlYXNlSW5Cb3VuY2UgPSBbW1swLCAxXV0sIFtbMC4xNDgsIDFdLCBbMC4wNzUsIDAuODY4XSwgWzAuMTkzLCAwLjg0OF1dLCBbWzAuMzI2LCAxXSwgWzAuMjc2LCAwLjgzNl0sIFswLjQwNSwgMC43MTJdXSwgW1swLjYwMCwgMV0sIFswLjUxMSwgMC43MDhdLCBbMC42NzEsIDAuMzQ4XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluQm91bmNlID0gZWFzZUluQm91bmNlO1xudmFyIGVhc2VPdXRCb3VuY2UgPSBbW1swLCAxXV0sIFtbMC4zNTcsIDAuMDA0XSwgWzAuMjcwLCAwLjU5Ml0sIFswLjM3NiwgMC4yNTJdXSwgW1swLjYwNCwgLTAuMDA0XSwgWzAuNTQ4LCAwLjMxMl0sIFswLjY2OSwgMC4xODRdXSwgW1swLjgyMCwgMF0sIFswLjc0OSwgMC4xODRdLCBbMC45MDUsIDAuMTMyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dEJvdW5jZSA9IGVhc2VPdXRCb3VuY2U7XG52YXIgZWFzZUluT3V0Qm91bmNlID0gW1tbMCwgMV1dLCBbWzAuMTAyLCAxXSwgWzAuMDUwLCAwLjg2NF0sIFswLjExNywgMC44Nl1dLCBbWzAuMjE2LCAwLjk5Nl0sIFswLjIwOCwgMC44NDRdLCBbMC4yMjcsIDAuODA4XV0sIFtbMC4zNDcsIDAuOTk2XSwgWzAuMzQzLCAwLjhdLCBbMC40ODAsIDAuMjkyXV0sIFtbMC42MzUsIDAuMDA0XSwgWzAuNTExLCAwLjY3Nl0sIFswLjY1NiwgMC4yMDhdXSwgW1swLjc4NywgMF0sIFswLjc2MCwgMC4yXSwgWzAuNzk1LCAwLjE0NF1dLCBbWzAuOTA1LCAtMC4wMDRdLCBbMC44OTksIDAuMTY0XSwgWzAuOTQ0LCAwLjE0NF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbk91dEJvdW5jZSA9IGVhc2VJbk91dEJvdW5jZTtcblxudmFyIF9kZWZhdWx0ID0gbmV3IE1hcChbWydsaW5lYXInLCBsaW5lYXJdLCBbJ2Vhc2VJblNpbmUnLCBlYXNlSW5TaW5lXSwgWydlYXNlT3V0U2luZScsIGVhc2VPdXRTaW5lXSwgWydlYXNlSW5PdXRTaW5lJywgZWFzZUluT3V0U2luZV0sIFsnZWFzZUluUXVhZCcsIGVhc2VJblF1YWRdLCBbJ2Vhc2VPdXRRdWFkJywgZWFzZU91dFF1YWRdLCBbJ2Vhc2VJbk91dFF1YWQnLCBlYXNlSW5PdXRRdWFkXSwgWydlYXNlSW5DdWJpYycsIGVhc2VJbkN1YmljXSwgWydlYXNlT3V0Q3ViaWMnLCBlYXNlT3V0Q3ViaWNdLCBbJ2Vhc2VJbk91dEN1YmljJywgZWFzZUluT3V0Q3ViaWNdLCBbJ2Vhc2VJblF1YXJ0JywgZWFzZUluUXVhcnRdLCBbJ2Vhc2VPdXRRdWFydCcsIGVhc2VPdXRRdWFydF0sIFsnZWFzZUluT3V0UXVhcnQnLCBlYXNlSW5PdXRRdWFydF0sIFsnZWFzZUluUXVpbnQnLCBlYXNlSW5RdWludF0sIFsnZWFzZU91dFF1aW50JywgZWFzZU91dFF1aW50XSwgWydlYXNlSW5PdXRRdWludCcsIGVhc2VJbk91dFF1aW50XSwgWydlYXNlSW5CYWNrJywgZWFzZUluQmFja10sIFsnZWFzZU91dEJhY2snLCBlYXNlT3V0QmFja10sIFsnZWFzZUluT3V0QmFjaycsIGVhc2VJbk91dEJhY2tdLCBbJ2Vhc2VJbkVsYXN0aWMnLCBlYXNlSW5FbGFzdGljXSwgWydlYXNlT3V0RWxhc3RpYycsIGVhc2VPdXRFbGFzdGljXSwgWydlYXNlSW5PdXRFbGFzdGljJywgZWFzZUluT3V0RWxhc3RpY10sIFsnZWFzZUluQm91bmNlJywgZWFzZUluQm91bmNlXSwgWydlYXNlT3V0Qm91bmNlJywgZWFzZU91dEJvdW5jZV0sIFsnZWFzZUluT3V0Qm91bmNlJywgZWFzZUluT3V0Qm91bmNlXV0pO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudHJhbnNpdGlvbiA9IHRyYW5zaXRpb247XG5leHBvcnRzLmluamVjdE5ld0N1cnZlID0gaW5qZWN0TmV3Q3VydmU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9jdXJ2ZXMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NvbmZpZy9jdXJ2ZXNcIikpO1xuXG52YXIgZGVmYXVsdFRyYW5zaXRpb25CQyA9ICdsaW5lYXInO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIE4tZnJhbWUgYW5pbWF0aW9uIHN0YXRlIGJ5IHRoZSBzdGFydCBhbmQgZW5kIHN0YXRlXHJcbiAqICAgICAgICAgICAgICBvZiB0aGUgYW5pbWF0aW9uIGFuZCB0aGUgZWFzaW5nIGN1cnZlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSB0QkMgICAgICAgICAgICAgICBFYXNpbmcgY3VydmUgbmFtZSBvciBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfEFycmF5fE9iamVjdH0gc3RhcnRTdGF0ZSBBbmltYXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ8QXJyYXl8T2JqZWN0fSBlbmRTdGF0ZSAgIEFuaW1hdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGZyYW1lTnVtICAgICAgICAgICAgICAgIE51bWJlciBvZiBBbmltYXRpb24gZnJhbWVzXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZGVlcCAgICAgICAgICAgICAgICAgICBXaGV0aGVyIHRvIHVzZSByZWN1cnNpdmUgbW9kZVxyXG4gKiBAcmV0dXJuIHtBcnJheXxCb29sZWFufSBTdGF0ZSBvZiBlYWNoIGZyYW1lIG9mIHRoZSBhbmltYXRpb24gKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5mdW5jdGlvbiB0cmFuc2l0aW9uKHRCQykge1xuICB2YXIgc3RhcnRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgdmFyIGVuZFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBudWxsO1xuICB2YXIgZnJhbWVOdW0gPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDMwO1xuICB2YXIgZGVlcCA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogZmFsc2U7XG4gIGlmICghY2hlY2tQYXJhbXMuYXBwbHkodm9pZCAwLCBhcmd1bWVudHMpKSByZXR1cm4gZmFsc2U7XG5cbiAgdHJ5IHtcbiAgICAvLyBHZXQgdGhlIHRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXG4gICAgdmFyIGJlemllckN1cnZlID0gZ2V0QmV6aWVyQ3VydmUodEJDKTsgLy8gR2V0IHRoZSBwcm9ncmVzcyBvZiBlYWNoIGZyYW1lIHN0YXRlXG5cbiAgICB2YXIgZnJhbWVTdGF0ZVByb2dyZXNzID0gZ2V0RnJhbWVTdGF0ZVByb2dyZXNzKGJlemllckN1cnZlLCBmcmFtZU51bSk7IC8vIElmIHRoZSByZWN1cnNpb24gbW9kZSBpcyBub3QgZW5hYmxlZCBvciB0aGUgc3RhdGUgdHlwZSBpcyBOdW1iZXIsIHRoZSBzaGFsbG93IHN0YXRlIGNhbGN1bGF0aW9uIGlzIHBlcmZvcm1lZCBkaXJlY3RseS5cblxuICAgIGlmICghZGVlcCB8fCB0eXBlb2YgZW5kU3RhdGUgPT09ICdudW1iZXInKSByZXR1cm4gZ2V0VHJhbnNpdGlvblN0YXRlKHN0YXJ0U3RhdGUsIGVuZFN0YXRlLCBmcmFtZVN0YXRlUHJvZ3Jlc3MpO1xuICAgIHJldHVybiByZWN1cnNpb25UcmFuc2l0aW9uU3RhdGUoc3RhcnRTdGF0ZSwgZW5kU3RhdGUsIGZyYW1lU3RhdGVQcm9ncmVzcyk7XG4gIH0gY2F0Y2ggKF91bnVzZWQpIHtcbiAgICBjb25zb2xlLndhcm4oJ1RyYW5zaXRpb24gcGFyYW1ldGVyIG1heSBiZSBhYm5vcm1hbCEnKTtcbiAgICByZXR1cm4gW2VuZFN0YXRlXTtcbiAgfVxufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcGFyYW1ldGVycyBhcmUgbGVnYWxcclxuICogQHBhcmFtIHtTdHJpbmd9IHRCQyAgICAgIE5hbWUgb2YgdHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBbnl9IHN0YXJ0U3RhdGUgIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtBbnl9IGVuZFN0YXRlICAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBmcmFtZU51bSBOdW1iZXIgb2YgdHJhbnNpdGlvbiBmcmFtZXNcclxuICogQHJldHVybiB7Qm9vbGVhbn0gSXMgdGhlIHBhcmFtZXRlciBsZWdhbFxyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BhcmFtcyh0QkMpIHtcbiAgdmFyIHN0YXJ0U3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgZW5kU3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgZnJhbWVOdW0gPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDMwO1xuXG4gIGlmICghdEJDIHx8IHN0YXJ0U3RhdGUgPT09IGZhbHNlIHx8IGVuZFN0YXRlID09PSBmYWxzZSB8fCAhZnJhbWVOdW0pIHtcbiAgICBjb25zb2xlLmVycm9yKCd0cmFuc2l0aW9uOiBNaXNzaW5nIFBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHN0YXJ0U3RhdGUpICE9PSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShlbmRTdGF0ZSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCd0cmFuc2l0aW9uOiBJbmNvbnNpc3RlbnQgU3RhdHVzIFR5cGVzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzdGF0ZVR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShlbmRTdGF0ZSk7XG5cbiAgaWYgKHN0YXRlVHlwZSA9PT0gJ3N0cmluZycgfHwgc3RhdGVUeXBlID09PSAnYm9vbGVhbicgfHwgIXRCQy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKCd0cmFuc2l0aW9uOiBVbnN1cHBvcnRlZCBEYXRhIFR5cGUgb2YgU3RhdGUhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFfY3VydmVzW1wiZGVmYXVsdFwiXS5oYXModEJDKSAmJiAhKHRCQyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUud2FybigndHJhbnNpdGlvbjogVHJhbnNpdGlvbiBjdXJ2ZSBub3QgZm91bmQsIGRlZmF1bHQgY3VydmUgd2lsbCBiZSB1c2VkIScpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtTdHJpbmd9IHRCQyBOYW1lIG9mIHRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEByZXR1cm4ge0FycmF5fSBCZXppZXIgY3VydmUgZGF0YVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZSh0QkMpIHtcbiAgdmFyIGJlemllckN1cnZlID0gJyc7XG5cbiAgaWYgKF9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmhhcyh0QkMpKSB7XG4gICAgYmV6aWVyQ3VydmUgPSBfY3VydmVzW1wiZGVmYXVsdFwiXS5nZXQodEJDKTtcbiAgfSBlbHNlIGlmICh0QkMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGJlemllckN1cnZlID0gdEJDO1xuICB9IGVsc2Uge1xuICAgIGJlemllckN1cnZlID0gX2N1cnZlc1tcImRlZmF1bHRcIl0uZ2V0KGRlZmF1bHRUcmFuc2l0aW9uQkMpO1xuICB9XG5cbiAgcmV0dXJuIGJlemllckN1cnZlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHByb2dyZXNzIG9mIGVhY2ggZnJhbWUgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgVHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGZyYW1lTnVtICAgTnVtYmVyIG9mIHRyYW5zaXRpb24gZnJhbWVzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBQcm9ncmVzcyBvZiBlYWNoIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEZyYW1lU3RhdGVQcm9ncmVzcyhiZXppZXJDdXJ2ZSwgZnJhbWVOdW0pIHtcbiAgdmFyIHRNaW51cyA9IDEgLyAoZnJhbWVOdW0gLSAxKTtcbiAgdmFyIHRTdGF0ZSA9IG5ldyBBcnJheShmcmFtZU51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKHQsIGkpIHtcbiAgICByZXR1cm4gaSAqIHRNaW51cztcbiAgfSk7XG4gIHZhciBmcmFtZVN0YXRlID0gdFN0YXRlLm1hcChmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBnZXRGcmFtZVN0YXRlRnJvbVQoYmV6aWVyQ3VydmUsIHQpO1xuICB9KTtcbiAgcmV0dXJuIGZyYW1lU3RhdGU7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcHJvZ3Jlc3Mgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZnJhbWUgYWNjb3JkaW5nIHRvIHRcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgVHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgICAgICAgICAgQ3VycmVudCBmcmFtZSB0XHJcbiAqIEByZXR1cm4ge051bWJlcn0gUHJvZ3Jlc3Mgb2YgY3VycmVudCBmcmFtZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRGcmFtZVN0YXRlRnJvbVQoYmV6aWVyQ3VydmUsIHQpIHtcbiAgdmFyIHRCZXppZXJDdXJ2ZVBvaW50ID0gZ2V0QmV6aWVyQ3VydmVQb2ludEZyb21UKGJlemllckN1cnZlLCB0KTtcbiAgdmFyIGJlemllckN1cnZlUG9pbnRUID0gZ2V0QmV6aWVyQ3VydmVQb2ludFRGcm9tUmVUKHRCZXppZXJDdXJ2ZVBvaW50LCB0KTtcbiAgcmV0dXJuIGdldEJlemllckN1cnZlVFN0YXRlKHRCZXppZXJDdXJ2ZVBvaW50LCBiZXppZXJDdXJ2ZVBvaW50VCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29ycmVzcG9uZGluZyBzdWItY3VydmUgYWNjb3JkaW5nIHRvIHRcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgVHJhbnNpdGlvbiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgICAgICAgICAgQ3VycmVudCBmcmFtZSB0XHJcbiAqIEByZXR1cm4ge0FycmF5fSBTdWItY3VydmUgb2YgdFxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZVBvaW50RnJvbVQoYmV6aWVyQ3VydmUsIHQpIHtcbiAgdmFyIGxhc3RJbmRleCA9IGJlemllckN1cnZlLmxlbmd0aCAtIDE7XG4gIHZhciBiZWdpbiA9ICcnLFxuICAgICAgZW5kID0gJyc7XG4gIGJlemllckN1cnZlLmZpbmRJbmRleChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIGlmIChpID09PSBsYXN0SW5kZXgpIHJldHVybjtcbiAgICBiZWdpbiA9IGl0ZW07XG4gICAgZW5kID0gYmV6aWVyQ3VydmVbaSArIDFdO1xuICAgIHZhciBjdXJyZW50TWFpblBvaW50WCA9IGJlZ2luWzBdWzBdO1xuICAgIHZhciBuZXh0TWFpblBvaW50WCA9IGVuZFswXVswXTtcbiAgICByZXR1cm4gdCA+PSBjdXJyZW50TWFpblBvaW50WCAmJiB0IDwgbmV4dE1haW5Qb2ludFg7XG4gIH0pO1xuICB2YXIgcDAgPSBiZWdpblswXTtcbiAgdmFyIHAxID0gYmVnaW5bMl0gfHwgYmVnaW5bMF07XG4gIHZhciBwMiA9IGVuZFsxXSB8fCBlbmRbMF07XG4gIHZhciBwMyA9IGVuZFswXTtcbiAgcmV0dXJuIFtwMCwgcDEsIHAyLCBwM107XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCBsb2NhbCB0IGJhc2VkIG9uIHQgYW5kIHN1Yi1jdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBTdWItY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgICAgICAgICAgQ3VycmVudCBmcmFtZSB0XHJcbiAqIEByZXR1cm4ge051bWJlcn0gbG9jYWwgdCBvZiBzdWItY3VydmVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVQb2ludFRGcm9tUmVUKGJlemllckN1cnZlLCB0KSB7XG4gIHZhciByZUJlZ2luWCA9IGJlemllckN1cnZlWzBdWzBdO1xuICB2YXIgcmVFbmRYID0gYmV6aWVyQ3VydmVbM11bMF07XG4gIHZhciB4TWludXMgPSByZUVuZFggLSByZUJlZ2luWDtcbiAgdmFyIHRNaW51cyA9IHQgLSByZUJlZ2luWDtcbiAgcmV0dXJuIHRNaW51cyAvIHhNaW51cztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjdXJ2ZSBwcm9ncmVzcyBvZiB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFN1Yi1jdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCAgICAgICAgICBDdXJyZW50IGZyYW1lIHRcclxuICogQHJldHVybiB7TnVtYmVyfSBQcm9ncmVzcyBvZiBjdXJyZW50IGZyYW1lXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlVFN0YXRlKF9yZWYsIHQpIHtcbiAgdmFyIF9yZWYyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYsIDQpLFxuICAgICAgX3JlZjIkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyWzBdLCAyKSxcbiAgICAgIHAwID0gX3JlZjIkWzFdLFxuICAgICAgX3JlZjIkMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlsxXSwgMiksXG4gICAgICBwMSA9IF9yZWYyJDJbMV0sXG4gICAgICBfcmVmMiQzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyWzJdLCAyKSxcbiAgICAgIHAyID0gX3JlZjIkM1sxXSxcbiAgICAgIF9yZWYyJDQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbM10sIDIpLFxuICAgICAgcDMgPSBfcmVmMiQ0WzFdO1xuXG4gIHZhciBwb3cgPSBNYXRoLnBvdztcbiAgdmFyIHRNaW51cyA9IDEgLSB0O1xuICB2YXIgcmVzdWx0MSA9IHAwICogcG93KHRNaW51cywgMyk7XG4gIHZhciByZXN1bHQyID0gMyAqIHAxICogdCAqIHBvdyh0TWludXMsIDIpO1xuICB2YXIgcmVzdWx0MyA9IDMgKiBwMiAqIHBvdyh0LCAyKSAqIHRNaW51cztcbiAgdmFyIHJlc3VsdDQgPSBwMyAqIHBvdyh0LCAzKTtcbiAgcmV0dXJuIDEgLSAocmVzdWx0MSArIHJlc3VsdDIgKyByZXN1bHQzICsgcmVzdWx0NCk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0cmFuc2l0aW9uIHN0YXRlIGFjY29yZGluZyB0byBmcmFtZSBwcm9ncmVzc1xyXG4gKiBAcGFyYW0ge0FueX0gc3RhcnRTdGF0ZSAgIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtBbnl9IGVuZFN0YXRlICAgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBzdGF0ZVR5cGUgPSAnb2JqZWN0JztcbiAgaWYgKHR5cGVvZiBiZWdpbiA9PT0gJ251bWJlcicpIHN0YXRlVHlwZSA9ICdudW1iZXInO1xuICBpZiAoYmVnaW4gaW5zdGFuY2VvZiBBcnJheSkgc3RhdGVUeXBlID0gJ2FycmF5JztcbiAgaWYgKHN0YXRlVHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBnZXROdW1iZXJUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSk7XG4gIGlmIChzdGF0ZVR5cGUgPT09ICdhcnJheScpIHJldHVybiBnZXRBcnJheVRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKTtcbiAgaWYgKHN0YXRlVHlwZSA9PT0gJ29iamVjdCcpIHJldHVybiBnZXRPYmplY3RUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSk7XG4gIHJldHVybiBmcmFtZVN0YXRlLm1hcChmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBlbmQ7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gZGF0YSBvZiB0aGUgbnVtYmVyIHR5cGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0U3RhdGUgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZW5kU3RhdGUgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlICBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXROdW1iZXJUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIgbWludXMgPSBlbmQgLSBiZWdpbjtcbiAgcmV0dXJuIGZyYW1lU3RhdGUubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIGJlZ2luICsgbWludXMgKiBzO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIGRhdGEgb2YgdGhlIGFycmF5IHR5cGVcclxuICogQHBhcmFtIHtBcnJheX0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGVuZFN0YXRlICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRBcnJheVRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBtaW51cyA9IGVuZC5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICBpZiAodHlwZW9mIHYgIT09ICdudW1iZXInKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHYgLSBiZWdpbltpXTtcbiAgfSk7XG4gIHJldHVybiBmcmFtZVN0YXRlLm1hcChmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBtaW51cy5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIGlmICh2ID09PSBmYWxzZSkgcmV0dXJuIGVuZFtpXTtcbiAgICAgIHJldHVybiBiZWdpbltpXSArIHYgKiBzO1xuICAgIH0pO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIGRhdGEgb2YgdGhlIG9iamVjdCB0eXBlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtPYmplY3R9IGVuZFN0YXRlICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSAgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0T2JqZWN0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhlbmQpO1xuICB2YXIgYmVnaW5WYWx1ZSA9IGtleXMubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgcmV0dXJuIGJlZ2luW2tdO1xuICB9KTtcbiAgdmFyIGVuZFZhbHVlID0ga2V5cy5tYXAoZnVuY3Rpb24gKGspIHtcbiAgICByZXR1cm4gZW5kW2tdO1xuICB9KTtcbiAgdmFyIGFycmF5U3RhdGUgPSBnZXRBcnJheVRyYW5zaXRpb25TdGF0ZShiZWdpblZhbHVlLCBlbmRWYWx1ZSwgZnJhbWVTdGF0ZSk7XG4gIHJldHVybiBhcnJheVN0YXRlLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciBmcmFtZURhdGEgPSB7fTtcbiAgICBpdGVtLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIHJldHVybiBmcmFtZURhdGFba2V5c1tpXV0gPSB2O1xuICAgIH0pO1xuICAgIHJldHVybiBmcmFtZURhdGE7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gc3RhdGUgZGF0YSBieSByZWN1cnNpb25cclxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IHN0YXJ0U3RhdGUgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gZW5kU3RhdGUgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBmcmFtZVN0YXRlICAgICAgICBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiByZWN1cnNpb25UcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIgc3RhdGUgPSBnZXRUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSk7XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3Aoa2V5KSB7XG4gICAgdmFyIGJUZW1wID0gYmVnaW5ba2V5XTtcbiAgICB2YXIgZVRlbXAgPSBlbmRba2V5XTtcbiAgICBpZiAoKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZVRlbXApICE9PSAnb2JqZWN0JykgcmV0dXJuIFwiY29udGludWVcIjtcbiAgICB2YXIgZGF0YSA9IHJlY3Vyc2lvblRyYW5zaXRpb25TdGF0ZShiVGVtcCwgZVRlbXAsIGZyYW1lU3RhdGUpO1xuICAgIHN0YXRlLmZvckVhY2goZnVuY3Rpb24gKGZzLCBpKSB7XG4gICAgICByZXR1cm4gZnNba2V5XSA9IGRhdGFbaV07XG4gICAgfSk7XG4gIH07XG5cbiAgZm9yICh2YXIga2V5IGluIGVuZCkge1xuICAgIHZhciBfcmV0ID0gX2xvb3Aoa2V5KTtcblxuICAgIGlmIChfcmV0ID09PSBcImNvbnRpbnVlXCIpIGNvbnRpbnVlO1xuICB9XG5cbiAgcmV0dXJuIHN0YXRlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBJbmplY3QgbmV3IGN1cnZlIGludG8gY3VydmVzIGFzIGNvbmZpZ1xyXG4gKiBAcGFyYW0ge0FueX0ga2V5ICAgICBUaGUga2V5IG9mIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGN1cnZlIEJlemllciBjdXJ2ZSBkYXRhXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gTm8gcmV0dXJuXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGluamVjdE5ld0N1cnZlKGtleSwgY3VydmUpIHtcbiAgaWYgKCFrZXkgfHwgIWN1cnZlKSB7XG4gICAgY29uc29sZS5lcnJvcignSW5qZWN0TmV3Q3VydmUgTWlzc2luZyBQYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIF9jdXJ2ZXNbXCJkZWZhdWx0XCJdLnNldChrZXksIGN1cnZlKTtcbn1cblxudmFyIF9kZWZhdWx0ID0gdHJhbnNpdGlvbjtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlW3RvU3RyaW5nVGFnU3ltYm9sXSA9XG4gICAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBpZiAoISh0b1N0cmluZ1RhZ1N5bWJvbCBpbiBnZW5GdW4pKSB7XG4gICAgICAgIGdlbkZ1blt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW3RvU3RyaW5nVGFnU3ltYm9sXSA9IFwiR2VuZXJhdG9yXCI7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG59XG4iXX0=
