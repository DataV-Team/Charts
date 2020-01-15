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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9lbnRyeS5qcyIsImxpYi9jbGFzcy9jaGFydHMuY2xhc3MuanMiLCJsaWIvY2xhc3MvdXBkYXRlci5jbGFzcy5qcyIsImxpYi9jb25maWcvYXhpcy5qcyIsImxpYi9jb25maWcvYmFyLmpzIiwibGliL2NvbmZpZy9jb2xvci5qcyIsImxpYi9jb25maWcvZ2F1Z2UuanMiLCJsaWIvY29uZmlnL2dyaWQuanMiLCJsaWIvY29uZmlnL2luZGV4LmpzIiwibGliL2NvbmZpZy9sZWdlbmQuanMiLCJsaWIvY29uZmlnL2xpbmUuanMiLCJsaWIvY29uZmlnL3BpZS5qcyIsImxpYi9jb25maWcvcmFkYXIuanMiLCJsaWIvY29uZmlnL3JhZGFyQXhpcy5qcyIsImxpYi9jb25maWcvdGl0bGUuanMiLCJsaWIvY29yZS9heGlzLmpzIiwibGliL2NvcmUvYmFyLmpzIiwibGliL2NvcmUvZ2F1Z2UuanMiLCJsaWIvY29yZS9ncmlkLmpzIiwibGliL2NvcmUvaW5kZXguanMiLCJsaWIvY29yZS9sZWdlbmQuanMiLCJsaWIvY29yZS9saW5lLmpzIiwibGliL2NvcmUvbWVyZ2VDb2xvci5qcyIsImxpYi9jb3JlL3BpZS5qcyIsImxpYi9jb3JlL3JhZGFyLmpzIiwibGliL2NvcmUvcmFkYXJBeGlzLmpzIiwibGliL2NvcmUvdGl0bGUuanMiLCJsaWIvZXh0ZW5kL2luZGV4LmpzIiwibGliL2luZGV4LmpzIiwibGliL3V0aWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hcnJheVdpdGhIb2xlcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2FycmF5V2l0aG91dEhvbGVzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvYXN5bmNUb0dlbmVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pdGVyYWJsZVRvQXJyYXlMaW1pdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlUmVzdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL25vbkl0ZXJhYmxlU3ByZWFkLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL3JlZ2VuZXJhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYmV6aWVyLWN1cnZlL2xpYi9jb3JlL2JlemllckN1cnZlVG9Qb2x5bGluZS5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2Jlemllci1jdXJ2ZS9saWIvY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmUuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9iZXppZXItY3VydmUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL2NsYXNzL2NyZW5kZXIuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3MvZ3JhcGguY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY2xhc3Mvc3R5bGUuY2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS9jLXJlbmRlci9saWIvY29uZmlnL2dyYXBocy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vY2FudmFzLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsLmpzIiwibm9kZV9tb2R1bGVzL0BqaWFtaW5naGkvY29sb3IvbGliL2NvbmZpZy9rZXl3b3Jkcy5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL2NvbG9yL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AamlhbWluZ2hpL3RyYW5zaXRpb24vbGliL2NvbmZpZy9jdXJ2ZXMuanMiLCJub2RlX21vZHVsZXMvQGppYW1pbmdoaS90cmFuc2l0aW9uL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdHdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzl5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcDRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgQ2hhcnRzID0gcmVxdWlyZSgnLi4vbGliL2luZGV4Jylcblxud2luZG93LkNoYXJ0cyA9IENoYXJ0cyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnJlcXVpcmUoXCIuLi9leHRlbmQvaW5kZXhcIik7XG5cbnZhciBfY1JlbmRlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXJcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29yZSA9IHJlcXVpcmUoXCIuLi9jb3JlXCIpO1xuXG52YXIgQ2hhcnRzID0gZnVuY3Rpb24gQ2hhcnRzKGRvbSkge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIENoYXJ0cyk7XG5cbiAgaWYgKCFkb20pIHtcbiAgICBjb25zb2xlLmVycm9yKCdDaGFydHMgTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBjbGllbnRXaWR0aCA9IGRvbS5jbGllbnRXaWR0aCxcbiAgICAgIGNsaWVudEhlaWdodCA9IGRvbS5jbGllbnRIZWlnaHQ7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBjbGllbnRXaWR0aCk7XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGNsaWVudEhlaWdodCk7XG4gIGRvbS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICB2YXIgYXR0cmlidXRlID0ge1xuICAgIGNvbnRhaW5lcjogZG9tLFxuICAgIGNhbnZhczogY2FudmFzLFxuICAgIHJlbmRlcjogbmV3IF9jUmVuZGVyW1wiZGVmYXVsdFwiXShjYW52YXMpLFxuICAgIG9wdGlvbjogbnVsbFxuICB9O1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGF0dHJpYnV0ZSk7XG59O1xuLyoqXG4gKiBAZGVzY3JpcHRpb24gU2V0IGNoYXJ0IG9wdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiBDaGFydCBvcHRpb25cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYW5pbWF0aW9uRW5kIEV4ZWN1dGUgYW5pbWF0aW9uRW5kXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IE5vIHJldHVyblxuICovXG5cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBDaGFydHM7XG5cbkNoYXJ0cy5wcm90b3R5cGUuc2V0T3B0aW9uID0gZnVuY3Rpb24gKG9wdGlvbikge1xuICB2YXIgYW5pbWF0aW9uRW5kID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcblxuICBpZiAoIW9wdGlvbiB8fCAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShvcHRpb24pICE9PSAnb2JqZWN0Jykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3NldE9wdGlvbiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGFuaW1hdGlvbkVuZCkgdGhpcy5yZW5kZXIuZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLmFuaW1hdGlvbkVuZCgpO1xuICB9KTtcbiAgdmFyIG9wdGlvbkNsb25lZCA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKG9wdGlvbiwgdHJ1ZSk7XG4gICgwLCBfY29yZS5tZXJnZUNvbG9yKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUuZ3JpZCkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmF4aXMpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5yYWRhckF4aXMpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS50aXRsZSkodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmJhcikodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmxpbmUpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5waWUpKHRoaXMsIG9wdGlvbkNsb25lZCk7XG4gICgwLCBfY29yZS5yYWRhcikodGhpcywgb3B0aW9uQ2xvbmVkKTtcbiAgKDAsIF9jb3JlLmdhdWdlKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICAoMCwgX2NvcmUubGVnZW5kKSh0aGlzLCBvcHRpb25DbG9uZWQpO1xuICB0aGlzLm9wdGlvbiA9IG9wdGlvbjtcbiAgdGhpcy5yZW5kZXIubGF1bmNoQW5pbWF0aW9uKCk7IC8vIGNvbnNvbGUud2Fybih0aGlzKVxufTtcbi8qKlxuICogQGRlc2NyaXB0aW9uIFJlc2l6ZSBjaGFydFxuICogQHJldHVybiB7VW5kZWZpbmVkfSBObyByZXR1cm5cbiAqL1xuXG5cbkNoYXJ0cy5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGFpbmVyID0gdGhpcy5jb250YWluZXIsXG4gICAgICBjYW52YXMgPSB0aGlzLmNhbnZhcyxcbiAgICAgIHJlbmRlciA9IHRoaXMucmVuZGVyLFxuICAgICAgb3B0aW9uID0gdGhpcy5vcHRpb247XG4gIHZhciBjbGllbnRXaWR0aCA9IGNvbnRhaW5lci5jbGllbnRXaWR0aCxcbiAgICAgIGNsaWVudEhlaWdodCA9IGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgY2xpZW50V2lkdGgpO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBjbGllbnRIZWlnaHQpO1xuICByZW5kZXIuYXJlYSA9IFtjbGllbnRXaWR0aCwgY2xpZW50SGVpZ2h0XTtcbiAgdGhpcy5zZXRPcHRpb24ob3B0aW9uKTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kb1VwZGF0ZSA9IGRvVXBkYXRlO1xuZXhwb3J0cy5VcGRhdGVyID0gdm9pZCAwO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfY2xhc3NDYWxsQ2hlY2syID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVja1wiKSk7XG5cbnZhciBVcGRhdGVyID0gZnVuY3Rpb24gVXBkYXRlcihjb25maWcsIHNlcmllcykge1xuICAoMCwgX2NsYXNzQ2FsbENoZWNrMltcImRlZmF1bHRcIl0pKHRoaXMsIFVwZGF0ZXIpO1xuICB2YXIgY2hhcnQgPSBjb25maWcuY2hhcnQsXG4gICAgICBrZXkgPSBjb25maWcua2V5LFxuICAgICAgZ2V0R3JhcGhDb25maWcgPSBjb25maWcuZ2V0R3JhcGhDb25maWc7XG5cbiAgaWYgKHR5cGVvZiBnZXRHcmFwaENvbmZpZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUud2FybignVXBkYXRlciBuZWVkIGZ1bmN0aW9uIGdldEdyYXBoQ29uZmlnIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY2hhcnRba2V5XSkgdGhpcy5ncmFwaHMgPSBjaGFydFtrZXldID0gW107XG4gIE9iamVjdC5hc3NpZ24odGhpcywgY29uZmlnKTtcbiAgdGhpcy51cGRhdGUoc2VyaWVzKTtcbn07XG5cbmV4cG9ydHMuVXBkYXRlciA9IFVwZGF0ZXI7XG5cblVwZGF0ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChzZXJpZXMpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICB2YXIgZ3JhcGhzID0gdGhpcy5ncmFwaHMsXG4gICAgICBiZWZvcmVVcGRhdGUgPSB0aGlzLmJlZm9yZVVwZGF0ZTtcbiAgZGVsUmVkdW5kYW5jZUdyYXBoKHRoaXMsIHNlcmllcyk7XG4gIGlmICghc2VyaWVzLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgYmVmb3JlVXBkYXRlVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGJlZm9yZVVwZGF0ZSk7XG4gIHNlcmllcy5mb3JFYWNoKGZ1bmN0aW9uIChzZXJpZXNJdGVtLCBpKSB7XG4gICAgaWYgKGJlZm9yZVVwZGF0ZVR5cGUgPT09ICdmdW5jdGlvbicpIGJlZm9yZVVwZGF0ZShncmFwaHMsIHNlcmllc0l0ZW0sIGksIF90aGlzKTtcbiAgICB2YXIgY2FjaGUgPSBncmFwaHNbaV07XG5cbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIGNoYW5nZUdyYXBocyhjYWNoZSwgc2VyaWVzSXRlbSwgaSwgX3RoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRHcmFwaHMoZ3JhcGhzLCBzZXJpZXNJdGVtLCBpLCBfdGhpcyk7XG4gICAgfVxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIGRlbFJlZHVuZGFuY2VHcmFwaCh1cGRhdGVyLCBzZXJpZXMpIHtcbiAgdmFyIGdyYXBocyA9IHVwZGF0ZXIuZ3JhcGhzLFxuICAgICAgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBjYWNoZUdyYXBoTnVtID0gZ3JhcGhzLmxlbmd0aDtcbiAgdmFyIG5lZWRHcmFwaE51bSA9IHNlcmllcy5sZW5ndGg7XG5cbiAgaWYgKGNhY2hlR3JhcGhOdW0gPiBuZWVkR3JhcGhOdW0pIHtcbiAgICB2YXIgbmVlZERlbEdyYXBocyA9IGdyYXBocy5zcGxpY2UobmVlZEdyYXBoTnVtKTtcbiAgICBuZWVkRGVsR3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiBpdGVtLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcbiAgICAgICAgcmV0dXJuIHJlbmRlci5kZWxHcmFwaChnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNoYW5nZUdyYXBocyhjYWNoZSwgc2VyaWVzSXRlbSwgaSwgdXBkYXRlcikge1xuICB2YXIgZ2V0R3JhcGhDb25maWcgPSB1cGRhdGVyLmdldEdyYXBoQ29uZmlnLFxuICAgICAgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXIsXG4gICAgICBiZWZvcmVDaGFuZ2UgPSB1cGRhdGVyLmJlZm9yZUNoYW5nZTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRHcmFwaENvbmZpZyhzZXJpZXNJdGVtLCB1cGRhdGVyKTtcbiAgYmFsYW5jZUdyYXBoc051bShjYWNoZSwgY29uZmlncywgcmVuZGVyKTtcbiAgY2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgsIGopIHtcbiAgICB2YXIgY29uZmlnID0gY29uZmlnc1tqXTtcbiAgICBpZiAodHlwZW9mIGJlZm9yZUNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykgYmVmb3JlQ2hhbmdlKGdyYXBoLCBjb25maWcpO1xuICAgIHVwZGF0ZUdyYXBoQ29uZmlnQnlLZXkoZ3JhcGgsIGNvbmZpZyk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBiYWxhbmNlR3JhcGhzTnVtKGdyYXBocywgZ3JhcGhDb25maWcsIHJlbmRlcikge1xuICB2YXIgY2FjaGVHcmFwaE51bSA9IGdyYXBocy5sZW5ndGg7XG4gIHZhciBuZWVkR3JhcGhOdW0gPSBncmFwaENvbmZpZy5sZW5ndGg7XG5cbiAgaWYgKG5lZWRHcmFwaE51bSA+IGNhY2hlR3JhcGhOdW0pIHtcbiAgICB2YXIgbGFzdENhY2hlR3JhcGggPSBncmFwaHMuc2xpY2UoLTEpWzBdO1xuICAgIHZhciBuZWVkQWRkR3JhcGhOdW0gPSBuZWVkR3JhcGhOdW0gLSBjYWNoZUdyYXBoTnVtO1xuICAgIHZhciBuZWVkQWRkR3JhcGhzID0gbmV3IEFycmF5KG5lZWRBZGRHcmFwaE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbykge1xuICAgICAgcmV0dXJuIHJlbmRlci5jbG9uZShsYXN0Q2FjaGVHcmFwaCk7XG4gICAgfSk7XG4gICAgZ3JhcGhzLnB1c2guYXBwbHkoZ3JhcGhzLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5lZWRBZGRHcmFwaHMpKTtcbiAgfSBlbHNlIGlmIChuZWVkR3JhcGhOdW0gPCBjYWNoZUdyYXBoTnVtKSB7XG4gICAgdmFyIG5lZWREZWxDYWNoZSA9IGdyYXBocy5zcGxpY2UobmVlZEdyYXBoTnVtKTtcbiAgICBuZWVkRGVsQ2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgICAgcmV0dXJuIHJlbmRlci5kZWxHcmFwaChnKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRHcmFwaHMoZ3JhcGhzLCBzZXJpZXNJdGVtLCBpLCB1cGRhdGVyKSB7XG4gIHZhciBnZXRHcmFwaENvbmZpZyA9IHVwZGF0ZXIuZ2V0R3JhcGhDb25maWcsXG4gICAgICBnZXRTdGFydEdyYXBoQ29uZmlnID0gdXBkYXRlci5nZXRTdGFydEdyYXBoQ29uZmlnLFxuICAgICAgY2hhcnQgPSB1cGRhdGVyLmNoYXJ0O1xuICB2YXIgcmVuZGVyID0gY2hhcnQucmVuZGVyO1xuICB2YXIgc3RhcnRDb25maWdzID0gbnVsbDtcbiAgaWYgKHR5cGVvZiBnZXRTdGFydEdyYXBoQ29uZmlnID09PSAnZnVuY3Rpb24nKSBzdGFydENvbmZpZ3MgPSBnZXRTdGFydEdyYXBoQ29uZmlnKHNlcmllc0l0ZW0sIHVwZGF0ZXIpO1xuICB2YXIgY29uZmlncyA9IGdldEdyYXBoQ29uZmlnKHNlcmllc0l0ZW0sIHVwZGF0ZXIpO1xuICBpZiAoIWNvbmZpZ3MubGVuZ3RoKSByZXR1cm47XG5cbiAgaWYgKHN0YXJ0Q29uZmlncykge1xuICAgIGdyYXBoc1tpXSA9IHN0YXJ0Q29uZmlncy5tYXAoZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgcmV0dXJuIHJlbmRlci5hZGQoY29uZmlnKTtcbiAgICB9KTtcbiAgICBncmFwaHNbaV0uZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgsIGkpIHtcbiAgICAgIHZhciBjb25maWcgPSBjb25maWdzW2ldO1xuICAgICAgdXBkYXRlR3JhcGhDb25maWdCeUtleShncmFwaCwgY29uZmlnKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBncmFwaHNbaV0gPSBjb25maWdzLm1hcChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmFkZChjb25maWcpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGFmdGVyQWRkR3JhcGggPSB1cGRhdGVyLmFmdGVyQWRkR3JhcGg7XG4gIGlmICh0eXBlb2YgYWZ0ZXJBZGRHcmFwaCA9PT0gJ2Z1bmN0aW9uJykgYWZ0ZXJBZGRHcmFwaChncmFwaHNbaV0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVHcmFwaENvbmZpZ0J5S2V5KGdyYXBoLCBjb25maWcpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjb25maWcpO1xuICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgPT09ICdzaGFwZScgfHwga2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICBncmFwaC5hbmltYXRpb24oa2V5LCBjb25maWdba2V5XSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyYXBoW2tleV0gPSBjb25maWdba2V5XTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkb1VwZGF0ZSgpIHtcbiAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9LFxuICAgICAgY2hhcnQgPSBfcmVmLmNoYXJ0LFxuICAgICAgc2VyaWVzID0gX3JlZi5zZXJpZXMsXG4gICAgICBrZXkgPSBfcmVmLmtleSxcbiAgICAgIGdldEdyYXBoQ29uZmlnID0gX3JlZi5nZXRHcmFwaENvbmZpZyxcbiAgICAgIGdldFN0YXJ0R3JhcGhDb25maWcgPSBfcmVmLmdldFN0YXJ0R3JhcGhDb25maWcsXG4gICAgICBiZWZvcmVDaGFuZ2UgPSBfcmVmLmJlZm9yZUNoYW5nZSxcbiAgICAgIGJlZm9yZVVwZGF0ZSA9IF9yZWYuYmVmb3JlVXBkYXRlLFxuICAgICAgYWZ0ZXJBZGRHcmFwaCA9IF9yZWYuYWZ0ZXJBZGRHcmFwaDtcblxuICBpZiAoY2hhcnRba2V5XSkge1xuICAgIGNoYXJ0W2tleV0udXBkYXRlKHNlcmllcyk7XG4gIH0gZWxzZSB7XG4gICAgY2hhcnRba2V5XSA9IG5ldyBVcGRhdGVyKHtcbiAgICAgIGNoYXJ0OiBjaGFydCxcbiAgICAgIGtleToga2V5LFxuICAgICAgZ2V0R3JhcGhDb25maWc6IGdldEdyYXBoQ29uZmlnLFxuICAgICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRHcmFwaENvbmZpZyxcbiAgICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlLFxuICAgICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGUsXG4gICAgICBhZnRlckFkZEdyYXBoOiBhZnRlckFkZEdyYXBoXG4gICAgfSwgc2VyaWVzKTtcbiAgfVxufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy55QXhpc0NvbmZpZyA9IGV4cG9ydHMueEF4aXNDb25maWcgPSB2b2lkIDA7XG52YXIgeEF4aXNDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBuYW1lXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG5hbWUgPSAnJ1xuICAgKi9cbiAgbmFtZTogJycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyBheGlzXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgcG9zaXRpb25cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgcG9zaXRpb24gPSAnYm90dG9tJ1xuICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICdib3R0b20nIHwgJ3RvcCdcbiAgICovXG4gIHBvc2l0aW9uOiAnYm90dG9tJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE5hbWUgZ2FwXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG5hbWVHYXAgPSAxNVxuICAgKi9cbiAgbmFtZUdhcDogMTUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBOYW1lIGxvY2F0aW9uXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG5hbWVMb2NhdGlvbiA9ICdlbmQnXG4gICAqIEBleGFtcGxlIG5hbWVMb2NhdGlvbiA9ICdlbmQnIHwgJ2NlbnRlcicgfCAnc3RhcnQnXG4gICAqL1xuICBuYW1lTG9jYXRpb246ICdlbmQnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIG5hbWVUZXh0U3R5bGU6IHtcbiAgICBmaWxsOiAnIzMzMycsXG4gICAgZm9udFNpemU6IDEwXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG1pbiB2YWx1ZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgbWluID0gJzIwJSdcbiAgICogQGV4YW1wbGUgbWluID0gJzIwJScgfCAwXG4gICAqL1xuICBtaW46ICcyMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBtYXggdmFsdWVcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1heCA9ICcyMCUnXG4gICAqIEBleGFtcGxlIG1heCA9ICcyMCUnIHwgMFxuICAgKi9cbiAgbWF4OiAnMjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdmFsdWUgaW50ZXJ2YWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgaW50ZXJ2YWwgPSBudWxsXG4gICAqIEBleGFtcGxlIGludGVydmFsID0gMTAwXG4gICAqL1xuICBpbnRlcnZhbDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE1pbiBpbnRlcnZhbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtaW5JbnRlcnZhbCA9IG51bGxcbiAgICogQGV4YW1wbGUgbWluSW50ZXJ2YWwgPSAxXG4gICAqL1xuICBtaW5JbnRlcnZhbDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIE1heCBpbnRlcnZhbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtYXhJbnRlcnZhbCA9IG51bGxcbiAgICogQGV4YW1wbGUgbWF4SW50ZXJ2YWwgPSAxMDBcbiAgICovXG4gIG1heEludGVydmFsOiBudWxsLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQm91bmRhcnkgZ2FwXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBib3VuZGFyeUdhcCA9IG51bGxcbiAgICogQGV4YW1wbGUgYm91bmRhcnlHYXAgPSB0cnVlXG4gICAqL1xuICBib3VuZGFyeUdhcDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbnVtYmVyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHNwbGl0TnVtYmVyID0gNVxuICAgKi9cbiAgc3BsaXROdW1iZXI6IDUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGluZVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjMzMzJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzVGljazoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyB0aWNrXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyMzMzMnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGFiZWw6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfeS7tidcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjMzMzJyxcbiAgICAgIGZvbnRTaXplOiAxMCxcbiAgICAgIHJvdGF0ZTogMFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBzcGxpdExpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgc3BsaXQgbGluZVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgc3BsaXQgbGluZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyNkNGQ0ZDQnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gWCBheGlzIHJlbmRlciBsZXZlbFxuICAgKiBQcmlvcml0eSByZW5kZXJpbmcgaGlnaCBsZXZlbFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByTGV2ZWwgPSAtMjBcbiAgICovXG4gIHJMZXZlbDogLTIwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gWCBheGlzIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBYIGF4aXMgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMueEF4aXNDb25maWcgPSB4QXhpc0NvbmZpZztcbnZhciB5QXhpc0NvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIG5hbWVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgbmFtZSA9ICcnXG4gICAqL1xuICBuYW1lOiAnJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIGF4aXNcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBwb3NpdGlvblxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICdsZWZ0J1xuICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICdsZWZ0JyB8ICdyaWdodCdcbiAgICovXG4gIHBvc2l0aW9uOiAnbGVmdCcsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBOYW1lIGdhcFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBuYW1lR2FwID0gMTVcbiAgICovXG4gIG5hbWVHYXA6IDE1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTmFtZSBsb2NhdGlvblxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lTG9jYXRpb24gPSAnZW5kJ1xuICAgKiBAZXhhbXBsZSBuYW1lTG9jYXRpb24gPSAnZW5kJyB8ICdjZW50ZXInIHwgJ3N0YXJ0J1xuICAgKi9cbiAgbmFtZUxvY2F0aW9uOiAnZW5kJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIG5hbWUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBuYW1lVGV4dFN0eWxlOiB7XG4gICAgZmlsbDogJyMzMzMnLFxuICAgIGZvbnRTaXplOiAxMFxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBtaW4gdmFsdWVcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1pbiA9ICcyMCUnXG4gICAqIEBleGFtcGxlIG1pbiA9ICcyMCUnIHwgMFxuICAgKi9cbiAgbWluOiAnMjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbWF4IHZhbHVlXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBtYXggPSAnMjAlJ1xuICAgKiBAZXhhbXBsZSBtYXggPSAnMjAlJyB8IDBcbiAgICovXG4gIG1heDogJzIwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHZhbHVlIGludGVydmFsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGludGVydmFsID0gbnVsbFxuICAgKiBAZXhhbXBsZSBpbnRlcnZhbCA9IDEwMFxuICAgKi9cbiAgaW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBNaW4gaW50ZXJ2YWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbWluSW50ZXJ2YWwgPSBudWxsXG4gICAqIEBleGFtcGxlIG1pbkludGVydmFsID0gMVxuICAgKi9cbiAgbWluSW50ZXJ2YWw6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBNYXggaW50ZXJ2YWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbWF4SW50ZXJ2YWwgPSBudWxsXG4gICAqIEBleGFtcGxlIG1heEludGVydmFsID0gMTAwXG4gICAqL1xuICBtYXhJbnRlcnZhbDogbnVsbCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJvdW5kYXJ5IGdhcFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgYm91bmRhcnlHYXAgPSBudWxsXG4gICAqIEBleGFtcGxlIGJvdW5kYXJ5R2FwID0gdHJ1ZVxuICAgKi9cbiAgYm91bmRhcnlHYXA6IG51bGwsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IG51bWJlclxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzcGxpdE51bWJlciA9IDVcbiAgICovXG4gIHNwbGl0TnVtYmVyOiA1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsaW5lIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMaW5lOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxpbmVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnIzMzMycsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc1RpY2s6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGF4aXMgdGlja1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjMzMzJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX3ku7YnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0udmFsdWUpXG4gICAgICovXG4gICAgZm9ybWF0dGVyOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmaWxsOiAnIzMzMycsXG4gICAgICBmb250U2l6ZTogMTAsXG4gICAgICByb3RhdGU6IDBcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIHNwbGl0IGxpbmUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgc3BsaXRMaW5lOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIHNwbGl0IGxpbmVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBzcGxpdCBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2Q0ZDRkNCcsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBZIGF4aXMgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IC0yMFxuICAgKi9cbiAgckxldmVsOiAtMjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBZIGF4aXMgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFkgYXhpcyBhbmltYXRpb24gZnJhbWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSA1MFxuICAgKi9cbiAgYW5pbWF0aW9uRnJhbWU6IDUwXG59O1xuZXhwb3J0cy55QXhpc0NvbmZpZyA9IHlBeGlzQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5iYXJDb25maWcgPSB2b2lkIDA7XG52YXIgYmFyQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIGJhciBjaGFydFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBzdGFja2luZ1xuICAgKiBUaGUgZGF0YSB2YWx1ZSBvZiB0aGUgc2VyaWVzIGVsZW1lbnQgb2YgdGhlIHNhbWUgc3RhY2tcbiAgICogd2lsbCBiZSBzdXBlcmltcG9zZWQgKHRoZSBsYXR0ZXIgdmFsdWUgd2lsbCBiZSBzdXBlcmltcG9zZWQgb24gdGhlIHByZXZpb3VzIHZhbHVlKVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBzdGFjayA9ICcnXG4gICAqL1xuICBzdGFjazogJycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgc2hhcGUgdHlwZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBzaGFwZVR5cGUgPSAnbm9ybWFsJ1xuICAgKiBAZXhhbXBsZSBzaGFwZVR5cGUgPSAnbm9ybWFsJyB8ICdsZWZ0RWNoZWxvbicgfCAncmlnaHRFY2hlbG9uJ1xuICAgKi9cbiAgc2hhcGVUeXBlOiAnbm9ybWFsJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEVjaGVsb24gYmFyIHNoYXJwbmVzcyBvZmZzZXRcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgZWNoZWxvbk9mZnNldCA9IDEwXG4gICAqL1xuICBlY2hlbG9uT2Zmc2V0OiAxMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciB3aWR0aFxuICAgKiBUaGlzIHByb3BlcnR5IHNob3VsZCBiZSBzZXQgb24gdGhlIGxhc3QgJ2Jhcicgc2VyaWVzXG4gICAqIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW0gdG8gdGFrZSBlZmZlY3QgYW5kIHdpbGwgYmUgaW4gZWZmZWN0XG4gICAqIGZvciBhbGwgJ2Jhcicgc2VyaWVzIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGJhcldpZHRoID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIGJhcldpZHRoID0gJ2F1dG8nIHwgJzEwJScgfCAyMFxuICAgKi9cbiAgYmFyV2lkdGg6ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBnYXBcbiAgICogVGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgc2V0IG9uIHRoZSBsYXN0ICdiYXInIHNlcmllc1xuICAgKiBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtIHRvIHRha2UgZWZmZWN0IGFuZCB3aWxsIGJlIGluIGVmZmVjdFxuICAgKiBmb3IgYWxsICdiYXInIHNlcmllcyBpbiB0aGlzIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBiYXJHYXAgPSAnMzAlJ1xuICAgKiBAZXhhbXBsZSBiYXJHYXAgPSAnMzAlJyB8IDMwXG4gICAqL1xuICBiYXJHYXA6ICczMCUnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGNhdGVnb3J5IGdhcFxuICAgKiBUaGlzIHByb3BlcnR5IHNob3VsZCBiZSBzZXQgb24gdGhlIGxhc3QgJ2Jhcicgc2VyaWVzXG4gICAqIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW0gdG8gdGFrZSBlZmZlY3QgYW5kIHdpbGwgYmUgaW4gZWZmZWN0XG4gICAqIGZvciBhbGwgJ2Jhcicgc2VyaWVzIGluIHRoaXMgY29vcmRpbmF0ZSBzeXN0ZW1cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGJhckNhdGVnb3J5R2FwID0gJzIwJSdcbiAgICogQGV4YW1wbGUgYmFyQ2F0ZWdvcnlHYXAgPSAnMjAlJyB8IDIwXG4gICAqL1xuICBiYXJDYXRlZ29yeUdhcDogJzIwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgeCBheGlzIGluZGV4XG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHhBeGlzSW5kZXggPSAwXG4gICAqIEBleGFtcGxlIHhBeGlzSW5kZXggPSAwIHwgMVxuICAgKi9cbiAgeEF4aXNJbmRleDogMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciB5IGF4aXMgaW5kZXhcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgeUF4aXNJbmRleCA9IDBcbiAgICogQGV4YW1wbGUgeUF4aXNJbmRleCA9IDAgfCAxXG4gICAqL1xuICB5QXhpc0luZGV4OiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGNoYXJ0IGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICogQGV4YW1wbGUgZGF0YSA9IFsxMDAsIDIwMCwgMzAwXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYWNrZ3JvdW5kIGJhciBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBiYWNrZ3JvdW5kQmFyOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBiYWNrZ3JvdW5kIGJhclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhY2tncm91bmQgYmFyIHdpZHRoXG4gICAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgd2lkdGggPSAnYXV0bydcbiAgICAgKiBAZXhhbXBsZSB3aWR0aCA9ICdhdXRvJyB8ICczMCUnIHwgMzBcbiAgICAgKi9cbiAgICB3aWR0aDogJ2F1dG8nLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhY2tncm91bmQgYmFyIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJ3JnYmEoMjAwLCAyMDAsIDIwMCwgLjQpJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBsYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYmFyIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFyIGxhYmVsIHBvc2l0aW9uXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAZGVmYXVsdCBwb3NpdGlvbiA9ICd0b3AnXG4gICAgICogQGV4YW1wbGUgcG9zaXRpb24gPSAndG9wJyB8ICdjZW50ZXInIHwgJ2JvdHRvbSdcbiAgICAgKi9cbiAgICBwb3NpdGlvbjogJ3RvcCcsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFyIGxhYmVsIG9mZnNldFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBvZmZzZXQgPSBbMCwgLTEwXVxuICAgICAqL1xuICAgIG9mZnNldDogWzAsIC0xMF0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQmFyIGxhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV95Lu2J1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBCYXIgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmb250U2l6ZTogMTBcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgZ3JhZGllbnQgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgZ3JhZGllbnQ6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhZGllbnQgY29sb3IgKEhleHxyZ2J8cmdiYSlcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgY29sb3IgPSBbXVxuICAgICAqL1xuICAgIGNvbG9yOiBbXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMb2NhbCBncmFkaWVudFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IGxvY2FsID0gdHJ1ZVxuICAgICAqL1xuICAgIGxvY2FsOiB0cnVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgc3R5bGUgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBiYXJTdHlsZToge30sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBJbmRlcGVuZGVudCBjb2xvciBtb2RlXG4gICAqIFdoZW4gc2V0IHRvIHRydWUsIGluZGVwZW5kZW50IGNvbG9yIG1vZGUgaXMgZW5hYmxlZFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgaW5kZXBlbmRlbnRDb2xvciA9IGZhbHNlXG4gICAqL1xuICBpbmRlcGVuZGVudENvbG9yOiBmYWxzZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEluZGVwZW5kZW50IGNvbG9yc1xuICAgKiBPbmx5IGVmZmVjdGl2ZSB3aGVuIGluZGVwZW5kZW50IGNvbG9yIG1vZGUgaXMgZW5hYmxlZFxuICAgKiBEZWZhdWx0IHZhbHVlIGlzIHRoZSBzYW1lIGFzIHRoZSBjb2xvciBpbiB0aGUgcm9vdCBjb25maWd1cmF0aW9uXG4gICAqIFR3by1kaW1lbnNpb25hbCBjb2xvciBhcnJheSBjYW4gcHJvZHVjZSBncmFkaWVudCBjb2xvcnNcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZXhhbXBsZSBpbmRlcGVuZGVudENvbG9yID0gWycjZmZmJywgJyMwMDAnXVxuICAgKiBAZXhhbXBsZSBpbmRlcGVuZGVudENvbG9yID0gW1snI2ZmZicsICcjMDAwJ10sICcjMDAwJ11cbiAgICovXG4gIGluZGVwZW5kZW50Q29sb3JzOiBbXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMFxuICAgKi9cbiAgckxldmVsOiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQmFyIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBCYXIgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMuYmFyQ29uZmlnID0gYmFyQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5jb2xvckNvbmZpZyA9IHZvaWQgMDtcbnZhciBjb2xvckNvbmZpZyA9IFsnIzM3YTJkYScsICcjMzJjNWU5JywgJyM2N2UwZTMnLCAnIzlmZTZiOCcsICcjZmZkYjVjJywgJyNmZjlmN2YnLCAnI2ZiNzI5MycsICcjZTA2MmFlJywgJyNlNjkwZDEnLCAnI2U3YmNmMycsICcjOWQ5NmY1JywgJyM4Mzc4ZWEnLCAnIzk2YmZmZiddO1xuZXhwb3J0cy5jb2xvckNvbmZpZyA9IGNvbG9yQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5nYXVnZUNvbmZpZyA9IHZvaWQgMDtcbnZhciBnYXVnZUNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyBnYXVnZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkaXVzIG9mIGdhdWdlXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByYWRpdXMgPSAnNjAlJ1xuICAgKiBAZXhhbXBsZSByYWRpdXMgPSAnNjAlJyB8IDEwMFxuICAgKi9cbiAgcmFkaXVzOiAnNjAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENlbnRlciBwb2ludCBvZiBnYXVnZVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGNlbnRlciA9IFsnNTAlJywnNTAlJ11cbiAgICogQGV4YW1wbGUgY2VudGVyID0gWyc1MCUnLCc1MCUnXSB8IFsxMDAsIDEwMF1cbiAgICovXG4gIGNlbnRlcjogWyc1MCUnLCAnNTAlJ10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBzdGFydCBhbmdsZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzdGFydEFuZ2xlID0gLShNYXRoLlBJIC8gNCkgKiA1XG4gICAqIEBleGFtcGxlIHN0YXJ0QW5nbGUgPSAtTWF0aC5QSVxuICAgKi9cbiAgc3RhcnRBbmdsZTogLShNYXRoLlBJIC8gNCkgKiA1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgZW5kIGFuZ2xlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGVuZEFuZ2xlID0gTWF0aC5QSSAvIDRcbiAgICogQGV4YW1wbGUgZW5kQW5nbGUgPSAwXG4gICAqL1xuICBlbmRBbmdsZTogTWF0aC5QSSAvIDQsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBtaW4gdmFsdWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgbWluID0gMFxuICAgKi9cbiAgbWluOiAwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgbWF4IHZhbHVlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IG1heCA9IDEwMFxuICAgKi9cbiAgbWF4OiAxMDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBzcGxpdCBudW1iZXJcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3BsaXROdW0gPSA1XG4gICAqL1xuICBzcGxpdE51bTogNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGFyYyBsaW5lIHdpZHRoXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFyY0xpbmVXaWR0aCA9IDE1XG4gICAqL1xuICBhcmNMaW5lV2lkdGg6IDE1LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBEYXRhIGl0ZW0gYXJjIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBkYXRhSXRlbVN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBkYXRhSXRlbVN0eWxlOiB7fSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzVGljazoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyB0aWNrXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgdGljayBsZW5ndGhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHRpY2tMZW5ndGggPSA2XG4gICAgICovXG4gICAgdGlja0xlbmd0aDogNixcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIHRpY2sgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzdHJva2U6ICcjOTk5JyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgYXhpc0xhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBheGlzIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGFiZWwgZGF0YSAoQ2FuIGJlIGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseSlcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgZGF0YSA9IFtOdW1iZXIuLi5dXG4gICAgICovXG4gICAgZGF0YTogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAne3ZhbHVlfSUnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGxhYmVsSXRlbSkgPT4gKGxhYmVsSXRlbS52YWx1ZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBnYXAgYmV0d2VlbiBsYWJlbCBhbmQgYXhpcyB0aWNrXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBsYWJlbEdhcCA9IDVcbiAgICAgKi9cbiAgICBsYWJlbEdhcDogNSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge31cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIHBvaW50ZXIgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgcG9pbnRlcjoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgcG9pbnRlclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBQb2ludGVyIHZhbHVlIGluZGV4IG9mIGRhdGFcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IHZhbHVlSW5kZXggPSAwIChwb2ludGVyLnZhbHVlID0gZGF0YVswXS52YWx1ZSlcbiAgICAgKi9cbiAgICB2YWx1ZUluZGV4OiAwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFBvaW50ZXIgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBzY2FsZTogWzEsIDFdLFxuICAgICAgZmlsbDogJyNmYjcyOTMnXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBpdGVtIGFyYyBkZXRhaWwgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgZGV0YWlsczoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgZGV0YWlsc1xuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgZm9ybWF0dGVyXG4gICAgICogQHR5cGUge1N0cmluZ3xGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBmb3JtYXR0ZXIgPSBudWxsXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gJ3t2YWx1ZX0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7bmFtZX0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBEZXRhaWxzIHBvc2l0aW9uIG9mZnNldFxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBvZmZzZXQgPSBbMCwgMF1cbiAgICAgKiBAZXhhbXBsZSBvZmZzZXQgPSBbMTAsIDEwXVxuICAgICAqL1xuICAgIG9mZnNldDogWzAsIDBdLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFZhbHVlIGZyYWN0aW9uYWwgcHJlY2lzaW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCB2YWx1ZVRvRml4ZWQgPSAwXG4gICAgICovXG4gICAgdmFsdWVUb0ZpeGVkOiAwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgcG9zaXRpb25cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IHBvc2l0aW9uID0gJ2NlbnRlcidcbiAgICAgKiBAZXhhbXBsZSBwb3NpdGlvbiA9ICdzdGFydCcgfCAnY2VudGVyJyB8ICdlbmQnXG4gICAgICovXG4gICAgcG9zaXRpb246ICdjZW50ZXInLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIERldGFpbHMgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmb250U2l6ZTogMjAsXG4gICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdhdWdlIGJhY2tncm91bmQgYXJjIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGJhY2tncm91bmRBcmM6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGJhY2tncm91bmQgYXJjXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEJhY2tncm91bmQgYXJjIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2UwZTBlMCdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHYXVnZSBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2F1Z2UgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMuZ2F1Z2VDb25maWcgPSBnYXVnZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ3JpZENvbmZpZyA9IHZvaWQgMDtcbnZhciBncmlkQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgbGVmdCBtYXJnaW5cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGxlZnQgPSAnMTAlJ1xuICAgKiBAZXhhbXBsZSBsZWZ0ID0gJzEwJScgfCAxMFxuICAgKi9cbiAgbGVmdDogJzEwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHcmlkIHJpZ2h0IG1hcmdpblxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcmlnaHQgPSAnMTAlJ1xuICAgKiBAZXhhbXBsZSByaWdodCA9ICcxMCUnIHwgMTBcbiAgICovXG4gIHJpZ2h0OiAnMTAlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgdG9wIG1hcmdpblxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgdG9wID0gNjBcbiAgICogQGV4YW1wbGUgdG9wID0gJzEwJScgfCA2MFxuICAgKi9cbiAgdG9wOiA2MCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYm90dG9tIG1hcmdpblxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgYm90dG9tID0gNjBcbiAgICogQGV4YW1wbGUgYm90dG9tID0gJzEwJScgfCA2MFxuICAgKi9cbiAgYm90dG9tOiA2MCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBzdHlsZToge1xuICAgIGZpbGw6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR3JpZCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gLTMwXG4gICAqL1xuICByTGV2ZWw6IC0zMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdyaWQgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiAzMFxufTtcbmV4cG9ydHMuZ3JpZENvbmZpZyA9IGdyaWRDb25maWc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNoYW5nZURlZmF1bHRDb25maWcgPSBjaGFuZ2VEZWZhdWx0Q29uZmlnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiY29sb3JDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2NvbG9yLmNvbG9yQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdyaWRDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dyaWQuZ3JpZENvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ4QXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy54QXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ5QXhpc0NvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYXhpcy55QXhpc0NvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ0aXRsZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfdGl0bGUudGl0bGVDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGluZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGluZS5saW5lQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImJhckNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYmFyLmJhckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJwaWVDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3BpZS5waWVDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicmFkYXJBeGlzQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhckF4aXMucmFkYXJBeGlzQ29uZmlnO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhci5yYWRhckNvbmZpZztcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnYXVnZUNvbmZpZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2F1Z2UuZ2F1Z2VDb25maWc7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGVnZW5kQ29uZmlnXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9sZWdlbmQubGVnZW5kQ29uZmlnO1xuICB9XG59KTtcbmV4cG9ydHMua2V5cyA9IHZvaWQgMDtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCIuL2NvbG9yXCIpO1xuXG52YXIgX2dyaWQgPSByZXF1aXJlKFwiLi9ncmlkXCIpO1xuXG52YXIgX2F4aXMgPSByZXF1aXJlKFwiLi9heGlzXCIpO1xuXG52YXIgX3RpdGxlID0gcmVxdWlyZShcIi4vdGl0bGVcIik7XG5cbnZhciBfbGluZSA9IHJlcXVpcmUoXCIuL2xpbmVcIik7XG5cbnZhciBfYmFyID0gcmVxdWlyZShcIi4vYmFyXCIpO1xuXG52YXIgX3BpZSA9IHJlcXVpcmUoXCIuL3BpZVwiKTtcblxudmFyIF9yYWRhckF4aXMgPSByZXF1aXJlKFwiLi9yYWRhckF4aXNcIik7XG5cbnZhciBfcmFkYXIgPSByZXF1aXJlKFwiLi9yYWRhclwiKTtcblxudmFyIF9nYXVnZSA9IHJlcXVpcmUoXCIuL2dhdWdlXCIpO1xuXG52YXIgX2xlZ2VuZCA9IHJlcXVpcmUoXCIuL2xlZ2VuZFwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbnZhciBhbGxDb25maWcgPSB7XG4gIGNvbG9yQ29uZmlnOiBfY29sb3IuY29sb3JDb25maWcsXG4gIGdyaWRDb25maWc6IF9ncmlkLmdyaWRDb25maWcsXG4gIHhBeGlzQ29uZmlnOiBfYXhpcy54QXhpc0NvbmZpZyxcbiAgeUF4aXNDb25maWc6IF9heGlzLnlBeGlzQ29uZmlnLFxuICB0aXRsZUNvbmZpZzogX3RpdGxlLnRpdGxlQ29uZmlnLFxuICBsaW5lQ29uZmlnOiBfbGluZS5saW5lQ29uZmlnLFxuICBiYXJDb25maWc6IF9iYXIuYmFyQ29uZmlnLFxuICBwaWVDb25maWc6IF9waWUucGllQ29uZmlnLFxuICByYWRhckF4aXNDb25maWc6IF9yYWRhckF4aXMucmFkYXJBeGlzQ29uZmlnLFxuICByYWRhckNvbmZpZzogX3JhZGFyLnJhZGFyQ29uZmlnLFxuICBnYXVnZUNvbmZpZzogX2dhdWdlLmdhdWdlQ29uZmlnLFxuICBsZWdlbmRDb25maWc6IF9sZWdlbmQubGVnZW5kQ29uZmlnXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQ2hhbmdlIGRlZmF1bHQgY29uZmlndXJhdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5ICAgICAgICAgIENvbmZpZ3VyYXRpb24ga2V5XG4gICAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBjb25maWcgWW91ciBjb25maWdcbiAgICogQHJldHVybiB7VW5kZWZpbmVkfSBObyByZXR1cm5cbiAgICovXG5cbn07XG5cbmZ1bmN0aW9uIGNoYW5nZURlZmF1bHRDb25maWcoa2V5LCBjb25maWcpIHtcbiAgaWYgKCFhbGxDb25maWdbXCJcIi5jb25jYXQoa2V5LCBcIkNvbmZpZ1wiKV0pIHtcbiAgICBjb25zb2xlLndhcm4oJ0NoYW5nZSBkZWZhdWx0IGNvbmZpZyBFcnJvciAtIEludmFsaWQga2V5IScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gICgwLCBfdXRpbC5kZWVwTWVyZ2UpKGFsbENvbmZpZ1tcIlwiLmNvbmNhdChrZXksIFwiQ29uZmlnXCIpXSwgY29uZmlnKTtcbn1cblxudmFyIGtleXMgPSBbJ2NvbG9yJywgJ3RpdGxlJywgJ2xlZ2VuZCcsICd4QXhpcycsICd5QXhpcycsICdncmlkJywgJ3JhZGFyQXhpcycsICdsaW5lJywgJ2JhcicsICdwaWUnLCAncmFkYXInLCAnZ2F1Z2UnXTtcbmV4cG9ydHMua2V5cyA9IGtleXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmxlZ2VuZENvbmZpZyA9IHZvaWQgMDtcbnZhciBsZWdlbmRDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IGxlZ2VuZFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgb3JpZW50XG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IG9yaWVudCA9ICdob3Jpem9udGFsJ1xuICAgKiBAZXhhbXBsZSBvcmllbnQgPSAnaG9yaXpvbnRhbCcgfCAndmVydGljYWwnXG4gICAqL1xuICBvcmllbnQ6ICdob3Jpem9udGFsJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBsZWZ0XG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBsZWZ0ID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIGxlZnQgPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICBsZWZ0OiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgcmlnaHRcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJpZ2h0ID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIHJpZ2h0ID0gJ2F1dG8nIHwgJzEwJScgfCAxMFxuICAgKi9cbiAgcmlnaHQ6ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCB0b3BcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHRvcCA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSB0b3AgPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICB0b3A6ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBib3R0b21cbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGJvdHRvbSA9ICdhdXRvJ1xuICAgKiBAZXhhbXBsZSBib3R0b20gPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICBib3R0b206ICdhdXRvJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBpdGVtIGdhcFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpdGVtR2FwID0gMTBcbiAgICovXG4gIGl0ZW1HYXA6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gSWNvbiB3aWR0aFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBpY29uV2lkdGggPSAyNVxuICAgKi9cbiAgaWNvbldpZHRoOiAyNSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEljb24gaGVpZ2h0XG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGljb25IZWlnaHQgPSAxMFxuICAgKi9cbiAgaWNvbkhlaWdodDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIGxlZ2VuZCBpcyBvcHRpb25hbFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2VsZWN0QWJsZSA9IHRydWVcbiAgICovXG4gIHNlbGVjdEFibGU6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgdGV4dCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHRleHRTdHlsZToge1xuICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG4gICAgZm9udFNpemU6IDEzLFxuICAgIGZpbGw6ICcjMDAwJ1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGljb24gZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBpY29uU3R5bGU6IHt9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIHRleHQgdW5zZWxlY3RlZCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHRleHRVbnNlbGVjdGVkU3R5bGU6IHtcbiAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgIGZvbnRTaXplOiAxMyxcbiAgICBmaWxsOiAnIzk5OSdcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIExlZ2VuZCBpY29uIHVuc2VsZWN0ZWQgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBpY29uVW5zZWxlY3RlZFN0eWxlOiB7XG4gICAgZmlsbDogJyM5OTknXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDIwXG4gICAqL1xuICByTGV2ZWw6IDIwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGVnZW5kIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMubGVnZW5kQ29uZmlnID0gbGVnZW5kQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5saW5lQ29uZmlnID0gdm9pZCAwO1xudmFyIGxpbmVDb25maWcgPSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHRoaXMgbGluZSBjaGFydFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gRGF0YSBzdGFja2luZ1xuICAgKiBUaGUgZGF0YSB2YWx1ZSBvZiB0aGUgc2VyaWVzIGVsZW1lbnQgb2YgdGhlIHNhbWUgc3RhY2tcbiAgICogd2lsbCBiZSBzdXBlcmltcG9zZWQgKHRoZSBsYXR0ZXIgdmFsdWUgd2lsbCBiZSBzdXBlcmltcG9zZWQgb24gdGhlIHByZXZpb3VzIHZhbHVlKVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBzdGFjayA9ICcnXG4gICAqL1xuICBzdGFjazogJycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBTbW9vdGggbGluZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc21vb3RoID0gZmFsc2VcbiAgICovXG4gIHNtb290aDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHggYXhpcyBpbmRleFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB4QXhpc0luZGV4ID0gMFxuICAgKiBAZXhhbXBsZSB4QXhpc0luZGV4ID0gMCB8IDFcbiAgICovXG4gIHhBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHkgYXhpcyBpbmRleFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCB5QXhpc0luZGV4ID0gMFxuICAgKiBAZXhhbXBsZSB5QXhpc0luZGV4ID0gMCB8IDFcbiAgICovXG4gIHlBeGlzSW5kZXg6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGNoYXJ0IGRhdGFcbiAgICogQHR5cGUge0FycmF5fVxuICAgKiBAZGVmYXVsdCBkYXRhID0gW11cbiAgICogQGV4YW1wbGUgZGF0YSA9IFsxMDAsIDIwMCwgMzAwXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgbGluZVN0eWxlOiB7XG4gICAgbGluZVdpZHRoOiAxXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxpbmVQb2ludDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgbGluZSBwb2ludFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IHJhZGl1c1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgcmFkaXVzID0gMlxuICAgICAqL1xuICAgIHJhZGl1czogMixcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIHBvaW50IGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBhcmVhIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxpbmVBcmVhOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBsaW5lIGFyZWFcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFyZWEgZ3JhZGllbnQgY29sb3IgKEhleHxyZ2J8cmdiYSlcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnQgPSBbXVxuICAgICAqL1xuICAgIGdyYWRpZW50OiBbXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFyZWEgc3R5bGUgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBvcGFjaXR5OiAwLjVcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBsaW5lIGxhYmVsXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IGZhbHNlXG4gICAgICovXG4gICAgc2hvdzogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBsYWJlbCBwb3NpdGlvblxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgcG9zaXRpb24gPSAndG9wJ1xuICAgICAqIEBleGFtcGxlIHBvc2l0aW9uID0gJ3RvcCcgfCAnY2VudGVyJyB8ICdib3R0b20nXG4gICAgICovXG4gICAgcG9zaXRpb246ICd0b3AnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgbGFiZWwgb2Zmc2V0XG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IG9mZnNldCA9IFswLCAtMTBdXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgLTEwXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gbnVsbFxuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICd7dmFsdWV95Lu2J1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9IChkYXRhSXRlbSkgPT4gKGRhdGFJdGVtLnZhbHVlKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lIGxhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gTGluZSBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFuaW1hdGlvbiBjdXJ2ZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0Q3ViaWMnXG4gICAqL1xuICBhbmltYXRpb25DdXJ2ZTogJ2Vhc2VPdXRDdWJpYycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMaW5lIGFuaW1hdGlvbiBmcmFtZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25GcmFtZSA9IDUwXG4gICAqL1xuICBhbmltYXRpb25GcmFtZTogNTBcbn07XG5leHBvcnRzLmxpbmVDb25maWcgPSBsaW5lQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5waWVDb25maWcgPSB2b2lkIDA7XG52YXIgcGllQ29uZmlnID0ge1xuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSB0aGlzIHBpZSBjaGFydFxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkaXVzIG9mIHBpZVxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICogQGRlZmF1bHQgcmFkaXVzID0gJzUwJSdcbiAgICogQGV4YW1wbGUgcmFkaXVzID0gJzUwJScgfCAxMDBcbiAgICovXG4gIHJhZGl1czogJzUwJScsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBDZW50ZXIgcG9pbnQgb2YgcGllXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgY2VudGVyID0gWyc1MCUnLCc1MCUnXVxuICAgKiBAZXhhbXBsZSBjZW50ZXIgPSBbJzUwJScsJzUwJSddIHwgWzEwMCwgMTAwXVxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBjaGFydCBzdGFydCBhbmdsZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBzdGFydEFuZ2xlID0gLU1hdGguUEkgLyAyXG4gICAqIEBleGFtcGxlIHN0YXJ0QW5nbGUgPSAtTWF0aC5QSVxuICAgKi9cbiAgc3RhcnRBbmdsZTogLU1hdGguUEkgLyAyLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBlbmFibGUgcm9zZSB0eXBlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCByb3NlVHlwZSA9IGZhbHNlXG4gICAqL1xuICByb3NlVHlwZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBdXRvbWF0aWMgc29ydGluZyBpbiByb3NlIHR5cGVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHJvc2VTb3J0ID0gdHJ1ZVxuICAgKi9cbiAgcm9zZVNvcnQ6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSb3NlIHJhZGl1cyBpbmNyZWFzaW5nXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByb3NlSW5jcmVtZW50ID0gJ2F1dG8nXG4gICAqIEBleGFtcGxlIHJvc2VJbmNyZW1lbnQgPSAnYXV0bycgfCAnMTAlJyB8IDEwXG4gICAqL1xuICByb3NlSW5jcmVtZW50OiAnYXV0bycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKi9cbiAgZGF0YTogW10sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgaW5zaWRlIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGluc2lkZUxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSBpbnNpZGUgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9ICd7cGVyY2VudH0lJ1xuICAgICAqIEBleGFtcGxlIGZvcm1hdHRlciA9ICcke25hbWV9LXt2YWx1ZX0te3BlcmNlbnR9JSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAoZGF0YUl0ZW0pID0+IChkYXRhSXRlbS5uYW1lKVxuICAgICAqL1xuICAgIGZvcm1hdHRlcjogJ3twZXJjZW50fSUnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDEwLFxuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgT3V0c2lkZSBsYWJlbCBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBvdXRzaWRlTGFiZWw6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IG91dHNpZGUgbGFiZWxcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gZmFsc2VcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGZvcm1hdHRlclxuICAgICAqIEB0eXBlIHtTdHJpbmd8RnVuY3Rpb259XG4gICAgICogQGRlZmF1bHQgZm9ybWF0dGVyID0gJ3tuYW1lfSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAnJHtuYW1lfS17dmFsdWV9LXtwZXJjZW50fSUnXG4gICAgICogQGV4YW1wbGUgZm9ybWF0dGVyID0gKGRhdGFJdGVtKSA9PiAoZGF0YUl0ZW0ubmFtZSlcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6ICd7bmFtZX0nLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgZm9udFNpemU6IDExXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBHYXAgYmV0ZWVuIGxhYmVsIGxpbmUgYmVuZGVkIHBsYWNlIGFuZCBwaWVcbiAgICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBsYWJlbExpbmVCZW5kR2FwID0gJzIwJSdcbiAgICAgKiBAZXhhbXBsZSBsYWJlbExpbmVCZW5kR2FwID0gJzIwJScgfCAyMFxuICAgICAqL1xuICAgIGxhYmVsTGluZUJlbmRHYXA6ICcyMCUnLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGxpbmUgZW5kIGxlbmd0aFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgbGFiZWxMaW5lRW5kTGVuZ3RoID0gNTBcbiAgICAgKi9cbiAgICBsYWJlbExpbmVFbmRMZW5ndGg6IDUwLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExhYmVsIGxpbmUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIGxhYmVsTGluZVN0eWxlOiB7XG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAqL1xuICBwaWVTdHlsZToge30sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQZXJjZW50YWdlIGZyYWN0aW9uYWwgcHJlY2lzaW9uXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHBlcmNlbnRUb0ZpeGVkID0gMFxuICAgKi9cbiAgcGVyY2VudFRvRml4ZWQ6IDAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgY2hhcnQgcmVuZGVyIGxldmVsXG4gICAqIFByaW9yaXR5IHJlbmRlcmluZyBoaWdoIGxldmVsXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHJMZXZlbCA9IDEwXG4gICAqL1xuICByTGV2ZWw6IDEwLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGRlbGF5IGdhcFxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCBhbmltYXRpb25EZWxheUdhcCA9IDYwXG4gICAqL1xuICBhbmltYXRpb25EZWxheUdhcDogNjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFBpZSBzdGFydCBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgc3RhcnRBbmltYXRpb25DdXJ2ZSA9ICdlYXNlT3V0QmFjaydcbiAgICovXG4gIHN0YXJ0QW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0QmFjaycsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBQaWUgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMucGllQ29uZmlnID0gcGllQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5yYWRhckNvbmZpZyA9IHZvaWQgMDtcbnZhciByYWRhckNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyByYWRhclxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICovXG4gIHNob3c6IHRydWUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBMZWdlbmQgbmFtZVxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCBuYW1lID0gJydcbiAgICovXG4gIG5hbWU6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgY2hhcnQgZGF0YVxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqIEBkZWZhdWx0IGRhdGEgPSBbXVxuICAgKiBAZXhhbXBsZSBkYXRhID0gWzEwMCwgMjAwLCAzMDBdXG4gICAqL1xuICBkYXRhOiBbXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgKi9cbiAgcmFkYXJTdHlsZToge1xuICAgIGxpbmVXaWR0aDogMVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgcG9pbnQgY29uZmlndXJhdGlvblxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgcG9pbnQ6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHJhZGFyIHBvaW50XG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFBvaW50IHJhZGl1c1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgcmFkaXVzID0gMlxuICAgICAqL1xuICAgIHJhZGl1czogMixcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBSYWRhciBwb2ludCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjZmZmJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGxhYmVsOiB7XG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZGlzcGxheSByYWRhciBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBwb3NpdGlvbiBvZmZzZXRcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIDBdXG4gICAgICovXG4gICAgb2Zmc2V0OiBbMCwgMF0sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGFiZWwgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIHJhZGFyXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBsYWJlbEdhcCA9IDVcbiAgICAgKi9cbiAgICBsYWJlbEdhcDogNSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBmb3JtYXR0ZXJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IGZvcm1hdHRlciA9IG51bGxcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAnU2NvcmUte3ZhbHVlfSdcbiAgICAgKiBAZXhhbXBsZSBmb3JtYXR0ZXIgPSAobGFiZWwpID0+IChsYWJlbClcbiAgICAgKi9cbiAgICBmb3JtYXR0ZXI6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgbGFiZWwgZGVmYXVsdCBzdHlsZSBjb25maWd1cmF0aW9uXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAZGVmYXVsdCBzdHlsZSA9IHtDb25maWd1cmF0aW9uIE9mIENsYXNzIFN0eWxlfVxuICAgICAqL1xuICAgIHN0eWxlOiB7XG4gICAgICBmb250U2l6ZTogMTBcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMTBcbiAgICovXG4gIHJMZXZlbDogMTAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBSYWRhciBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gUmFkYXIgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW5lOiA1MFxufTtcbmV4cG9ydHMucmFkYXJDb25maWcgPSByYWRhckNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmFkYXJBeGlzQ29uZmlnID0gdm9pZCAwO1xudmFyIHJhZGFyQXhpc0NvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGhpcyByYWRhciBheGlzXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgKi9cbiAgc2hvdzogdHJ1ZSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIENlbnRlciBwb2ludCBvZiByYWRhciBheGlzXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgY2VudGVyID0gWyc1MCUnLCc1MCUnXVxuICAgKiBAZXhhbXBsZSBjZW50ZXIgPSBbJzUwJScsJzUwJSddIHwgWzEwMCwgMTAwXVxuICAgKi9cbiAgY2VudGVyOiBbJzUwJScsICc1MCUnXSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGl1cyBvZiByYWRhciBheGlzXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKiBAZGVmYXVsdCByYWRpdXMgPSAnNjUlJ1xuICAgKiBAZXhhbXBsZSByYWRpdXMgPSAnNjUlJyB8IDEwMFxuICAgKi9cbiAgcmFkaXVzOiAnNjUlJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgc3RhcnQgYW5nbGVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgc3RhcnRBbmdsZSA9IC1NYXRoLlBJIC8gMlxuICAgKiBAZXhhbXBsZSBzdGFydEFuZ2xlID0gLU1hdGguUElcbiAgICovXG4gIHN0YXJ0QW5nbGU6IC1NYXRoLlBJIC8gMixcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgc3BsaXQgbnVtYmVyXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IHNwbGl0TnVtID0gNVxuICAgKi9cbiAgc3BsaXROdW06IDUsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBwb2x5Z29uIHJhZGFyIGF4aXNcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHBvbHlnb24gPSBmYWxzZVxuICAgKi9cbiAgcG9seWdvbjogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBBeGlzIGxhYmVsIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGF4aXNMYWJlbDoge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsYWJlbFxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAgICovXG4gICAgc2hvdzogdHJ1ZSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBnYXAgYmV0d2VlbiBsYWJlbCBhbmQgcmFkYXIgYXhpc1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgbGFiZWxHYXAgPSAxNVxuICAgICAqL1xuICAgIGxhYmVsR2FwOiAxNSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBMYWJlbCBjb2xvciAoSGV4fHJnYnxyZ2JhKSwgd2lsbCBjb3ZlciBzdHlsZS5maWxsXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIGZpbGw6ICcjMzMzJ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEF4aXMgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBheGlzTGluZToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgYXhpcyBsaW5lXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQGRlZmF1bHQgc2hvdyA9IHRydWVcbiAgICAgKi9cbiAgICBzaG93OiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmUgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogW10sXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gQXhpcyBsYWJlbCBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBkZWZhdWx0IHN0eWxlID0ge0NvbmZpZ3VyYXRpb24gT2YgQ2xhc3MgU3R5bGV9XG4gICAgICovXG4gICAgc3R5bGU6IHtcbiAgICAgIHN0cm9rZTogJyM5OTknLFxuICAgICAgbGluZVdpZHRoOiAxXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gU3BsaXQgbGluZSBjb25maWd1cmF0aW9uXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBzcGxpdExpbmU6IHtcbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gV2hldGhlciB0byBkaXNwbGF5IHNwbGl0IGxpbmVcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBzaG93ID0gdHJ1ZVxuICAgICAqL1xuICAgIHNob3c6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZSBjb2xvciAoSGV4fHJnYnxyZ2JhKSwgd2lsbCBjb3ZlciBzdHlsZS5zdHJva2VcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICogQGRlZmF1bHQgY29sb3IgPSBbXVxuICAgICAqL1xuICAgIGNvbG9yOiBbXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBTcGxpdCBsaW5lIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge1xuICAgICAgc3Ryb2tlOiAnI2Q0ZDRkNCcsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBTcGxpdCBhcmVhIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHNwbGl0QXJlYToge1xuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgc3BsaXQgYXJlYVxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHNob3cgPSBmYWxzZVxuICAgICAqL1xuICAgIHNob3c6IGZhbHNlLFxuXG4gICAgLyoqXG4gICAgICogQGRlc2NyaXB0aW9uIEFyZWEgY29sb3IgKEhleHxyZ2J8cmdiYSksIHdpbGwgY292ZXIgc3R5bGUuc3Ryb2tlXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IGNvbG9yID0gW11cbiAgICAgKi9cbiAgICBjb2xvcjogWycjZjVmNWY1JywgJyNlNmU2ZTYnXSxcblxuICAgIC8qKlxuICAgICAqIEBkZXNjcmlwdGlvbiBTcGxpdCBhcmVhIGRlZmF1bHQgc3R5bGUgY29uZmlndXJhdGlvblxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICAgKi9cbiAgICBzdHlsZToge31cbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEJhciBjaGFydCByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gLTEwXG4gICAqL1xuICByTGV2ZWw6IC0xMCxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgYW5pbWF0aW9uIGN1cnZlXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2Vhc2VPdXRDdWJpYydcbiAgICovXG4gIGFuaW1hdGlvbkN1cnZlOiAnZWFzZU91dEN1YmljJyxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIFJhZGFyIGF4aXMgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW5lOiA1MFxufTtcbmV4cG9ydHMucmFkYXJBeGlzQ29uZmlnID0gcmFkYXJBeGlzQ29uZmlnOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50aXRsZUNvbmZpZyA9IHZvaWQgMDtcbnZhciB0aXRsZUNvbmZpZyA9IHtcbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHRvIGRpc3BsYXkgdGl0bGVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHNob3cgPSB0cnVlXG4gICAqL1xuICBzaG93OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgdGV4dFxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKiBAZGVmYXVsdCB0ZXh0ID0gJydcbiAgICovXG4gIHRleHQ6ICcnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgb2Zmc2V0XG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICogQGRlZmF1bHQgb2Zmc2V0ID0gWzAsIC0yMF1cbiAgICovXG4gIG9mZnNldDogWzAsIC0yMF0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBkZWZhdWx0IHN0eWxlIGNvbmZpZ3VyYXRpb25cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQGRlZmF1bHQgc3R5bGUgPSB7Q29uZmlndXJhdGlvbiBPZiBDbGFzcyBTdHlsZX1cbiAgICovXG4gIHN0eWxlOiB7XG4gICAgZmlsbDogJyMzMzMnLFxuICAgIGZvbnRTaXplOiAxNyxcbiAgICBmb250V2VpZ2h0OiAnYm9sZCcsXG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSByZW5kZXIgbGV2ZWxcbiAgICogUHJpb3JpdHkgcmVuZGVyaW5nIGhpZ2ggbGV2ZWxcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQGRlZmF1bHQgckxldmVsID0gMjBcbiAgICovXG4gIHJMZXZlbDogMjAsXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaXRsZSBhbmltYXRpb24gY3VydmVcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICogQGRlZmF1bHQgYW5pbWF0aW9uQ3VydmUgPSAnZWFzZU91dEN1YmljJ1xuICAgKi9cbiAgYW5pbWF0aW9uQ3VydmU6ICdlYXNlT3V0Q3ViaWMnLFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gVGl0bGUgYW5pbWF0aW9uIGZyYW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IGFuaW1hdGlvbkZyYW1lID0gNTBcbiAgICovXG4gIGFuaW1hdGlvbkZyYW1lOiA1MFxufTtcbmV4cG9ydHMudGl0bGVDb25maWcgPSB0aXRsZUNvbmZpZzsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmF4aXMgPSBheGlzO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX2RlZmluZVByb3BlcnR5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbnZhciBheGlzQ29uZmlnID0ge1xuICB4QXhpc0NvbmZpZzogX2NvbmZpZy54QXhpc0NvbmZpZyxcbiAgeUF4aXNDb25maWc6IF9jb25maWcueUF4aXNDb25maWdcbn07XG52YXIgbWluID0gTWF0aC5taW4sXG4gICAgbWF4ID0gTWF0aC5tYXgsXG4gICAgYWJzID0gTWF0aC5hYnMsXG4gICAgcG93ID0gTWF0aC5wb3c7XG5cbmZ1bmN0aW9uIGF4aXMoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciB4QXhpcyA9IG9wdGlvbi54QXhpcyxcbiAgICAgIHlBeGlzID0gb3B0aW9uLnlBeGlzLFxuICAgICAgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgdmFyIGFsbEF4aXMgPSBbXTtcblxuICBpZiAoeEF4aXMgJiYgeUF4aXMgJiYgc2VyaWVzKSB7XG4gICAgYWxsQXhpcyA9IGdldEFsbEF4aXMoeEF4aXMsIHlBeGlzKTtcbiAgICBhbGxBeGlzID0gbWVyZ2VEZWZhdWx0QXhpc0NvbmZpZyhhbGxBeGlzKTtcbiAgICBhbGxBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBzaG93ID0gX3JlZi5zaG93O1xuICAgICAgcmV0dXJuIHNob3c7XG4gICAgfSk7XG4gICAgYWxsQXhpcyA9IG1lcmdlRGVmYXVsdEJvdW5kYXJ5R2FwKGFsbEF4aXMpO1xuICAgIGFsbEF4aXMgPSBjYWxjQXhpc0xhYmVsRGF0YShhbGxBeGlzLCBzZXJpZXMpO1xuICAgIGFsbEF4aXMgPSBzZXRBeGlzUG9zaXRpb24oYWxsQXhpcyk7XG4gICAgYWxsQXhpcyA9IGNhbGNBeGlzTGluZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KTtcbiAgICBhbGxBeGlzID0gY2FsY0F4aXNUaWNrUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpO1xuICAgIGFsbEF4aXMgPSBjYWxjQXhpc05hbWVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCk7XG4gICAgYWxsQXhpcyA9IGNhbGNTcGxpdExpbmVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCk7XG4gIH1cblxuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ2F4aXNMaW5lJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGluZUNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYWxsQXhpcyxcbiAgICBrZXk6ICdheGlzVGljaycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFRpY2tDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnYXhpc0xhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGFiZWxDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGFsbEF4aXMsXG4gICAga2V5OiAnYXhpc05hbWUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXROYW1lQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBhbGxBeGlzLFxuICAgIGtleTogJ3NwbGl0TGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFNwbGl0TGluZUNvbmZpZ1xuICB9KTtcbiAgY2hhcnQuYXhpc0RhdGEgPSBhbGxBeGlzO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxBeGlzKHhBeGlzLCB5QXhpcykge1xuICB2YXIgYWxsWEF4aXMgPSBbXSxcbiAgICAgIGFsbFlBeGlzID0gW107XG5cbiAgaWYgKHhBeGlzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICB2YXIgX2FsbFhBeGlzO1xuXG4gICAgKF9hbGxYQXhpcyA9IGFsbFhBeGlzKS5wdXNoLmFwcGx5KF9hbGxYQXhpcywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh4QXhpcykpO1xuICB9IGVsc2Uge1xuICAgIGFsbFhBeGlzLnB1c2goeEF4aXMpO1xuICB9XG5cbiAgaWYgKHlBeGlzIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICB2YXIgX2FsbFlBeGlzO1xuXG4gICAgKF9hbGxZQXhpcyA9IGFsbFlBeGlzKS5wdXNoLmFwcGx5KF9hbGxZQXhpcywgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh5QXhpcykpO1xuICB9IGVsc2Uge1xuICAgIGFsbFlBeGlzLnB1c2goeUF4aXMpO1xuICB9XG5cbiAgYWxsWEF4aXMuc3BsaWNlKDIpO1xuICBhbGxZQXhpcy5zcGxpY2UoMik7XG4gIGFsbFhBeGlzID0gYWxsWEF4aXMubWFwKGZ1bmN0aW9uIChheGlzLCBpKSB7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXMsIHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgYXhpczogJ3gnXG4gICAgfSk7XG4gIH0pO1xuICBhbGxZQXhpcyA9IGFsbFlBeGlzLm1hcChmdW5jdGlvbiAoYXhpcywgaSkge1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBpbmRleDogaSxcbiAgICAgIGF4aXM6ICd5J1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFsbFhBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhbGxZQXhpcykpO1xufVxuXG5mdW5jdGlvbiBtZXJnZURlZmF1bHRBeGlzQ29uZmlnKGFsbEF4aXMpIHtcbiAgdmFyIHhBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYyKSB7XG4gICAgdmFyIGF4aXMgPSBfcmVmMi5heGlzO1xuICAgIHJldHVybiBheGlzID09PSAneCc7XG4gIH0pO1xuICB2YXIgeUF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYzLmF4aXM7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd5JztcbiAgfSk7XG4gIHhBeGlzID0geEF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKCgwLCBfdXRpbDIuZGVlcENsb25lKShfY29uZmlnLnhBeGlzQ29uZmlnKSwgYXhpcyk7XG4gIH0pO1xuICB5QXhpcyA9IHlBeGlzLm1hcChmdW5jdGlvbiAoYXhpcykge1xuICAgIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSgoMCwgX3V0aWwyLmRlZXBDbG9uZSkoX2NvbmZpZy55QXhpc0NvbmZpZyksIGF4aXMpO1xuICB9KTtcbiAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHhBeGlzKSwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh5QXhpcykpO1xufVxuXG5mdW5jdGlvbiBtZXJnZURlZmF1bHRCb3VuZGFyeUdhcChhbGxBeGlzKSB7XG4gIHZhciB2YWx1ZUF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjQpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY0LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgPT09ICd2YWx1ZSc7XG4gIH0pO1xuICB2YXIgbGFiZWxBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmNS5kYXRhO1xuICAgIHJldHVybiBkYXRhICE9PSAndmFsdWUnO1xuICB9KTtcbiAgdmFsdWVBeGlzLmZvckVhY2goZnVuY3Rpb24gKGF4aXMpIHtcbiAgICBpZiAodHlwZW9mIGF4aXMuYm91bmRhcnlHYXAgPT09ICdib29sZWFuJykgcmV0dXJuO1xuICAgIGF4aXMuYm91bmRhcnlHYXAgPSBmYWxzZTtcbiAgfSk7XG4gIGxhYmVsQXhpcy5mb3JFYWNoKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgaWYgKHR5cGVvZiBheGlzLmJvdW5kYXJ5R2FwID09PSAnYm9vbGVhbicpIHJldHVybjtcbiAgICBheGlzLmJvdW5kYXJ5R2FwID0gdHJ1ZTtcbiAgfSk7XG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh2YWx1ZUF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhYmVsQXhpcykpO1xufVxuXG5mdW5jdGlvbiBjYWxjQXhpc0xhYmVsRGF0YShhbGxBeGlzLCBzZXJpZXMpIHtcbiAgdmFyIHZhbHVlQXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNikge1xuICAgIHZhciBkYXRhID0gX3JlZjYuZGF0YTtcbiAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgfSk7XG4gIHZhciBsYWJlbEF4aXMgPSBhbGxBeGlzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWY3LmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgaW5zdGFuY2VvZiBBcnJheTtcbiAgfSk7XG4gIHZhbHVlQXhpcyA9IGNhbGNWYWx1ZUF4aXNMYWJlbERhdGEodmFsdWVBeGlzLCBzZXJpZXMpO1xuICBsYWJlbEF4aXMgPSBjYWxjTGFiZWxBeGlzTGFiZWxEYXRhKGxhYmVsQXhpcyk7XG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh2YWx1ZUF4aXMpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhYmVsQXhpcykpO1xufVxuXG5mdW5jdGlvbiBjYWxjVmFsdWVBeGlzTGFiZWxEYXRhKHZhbHVlQXhpcywgc2VyaWVzKSB7XG4gIHJldHVybiB2YWx1ZUF4aXMubWFwKGZ1bmN0aW9uIChheGlzKSB7XG4gICAgdmFyIG1pbk1heFZhbHVlID0gZ2V0VmFsdWVBeGlzTWF4TWluVmFsdWUoYXhpcywgc2VyaWVzKTtcblxuICAgIHZhciBfZ2V0VHJ1ZU1pbk1heCA9IGdldFRydWVNaW5NYXgoYXhpcywgbWluTWF4VmFsdWUpLFxuICAgICAgICBfZ2V0VHJ1ZU1pbk1heDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldFRydWVNaW5NYXgsIDIpLFxuICAgICAgICBtaW4gPSBfZ2V0VHJ1ZU1pbk1heDJbMF0sXG4gICAgICAgIG1heCA9IF9nZXRUcnVlTWluTWF4MlsxXTtcblxuICAgIHZhciBpbnRlcnZhbCA9IGdldFZhbHVlSW50ZXJ2YWwobWluLCBtYXgsIGF4aXMpO1xuICAgIHZhciBmb3JtYXR0ZXIgPSBheGlzLmF4aXNMYWJlbC5mb3JtYXR0ZXI7XG4gICAgdmFyIGxhYmVsID0gW107XG5cbiAgICBpZiAobWluTWF4VmFsdWVbMF0gPT09IG1pbk1heFZhbHVlWzFdKSB7XG4gICAgICBsYWJlbCA9IG1pbk1heFZhbHVlO1xuICAgIH0gZWxzZSBpZiAobWluIDwgMCAmJiBtYXggPiAwKSB7XG4gICAgICBsYWJlbCA9IGdldFZhbHVlQXhpc0xhYmVsRnJvbVplcm8obWluLCBtYXgsIGludGVydmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFiZWwgPSBnZXRWYWx1ZUF4aXNMYWJlbEZyb21NaW4obWluLCBtYXgsIGludGVydmFsKTtcbiAgICB9XG5cbiAgICBsYWJlbCA9IGxhYmVsLm1hcChmdW5jdGlvbiAobCkge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobC50b0ZpeGVkKDIpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpcywge1xuICAgICAgbWF4VmFsdWU6IGxhYmVsLnNsaWNlKC0xKVswXSxcbiAgICAgIG1pblZhbHVlOiBsYWJlbFswXSxcbiAgICAgIGxhYmVsOiBnZXRBZnRlckZvcm1hdHRlckxhYmVsKGxhYmVsLCBmb3JtYXR0ZXIpXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUF4aXNNYXhNaW5WYWx1ZShheGlzLCBzZXJpZXMpIHtcbiAgc2VyaWVzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgc2hvdyA9IF9yZWY4LnNob3csXG4gICAgICAgIHR5cGUgPSBfcmVmOC50eXBlO1xuICAgIGlmIChzaG93ID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh0eXBlID09PSAncGllJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbiAgaWYgKHNlcmllcy5sZW5ndGggPT09IDApIHJldHVybiBbMCwgMF07XG4gIHZhciBpbmRleCA9IGF4aXMuaW5kZXgsXG4gICAgICBheGlzVHlwZSA9IGF4aXMuYXhpcztcbiAgc2VyaWVzID0gbWVyZ2VTdGFja0RhdGEoc2VyaWVzKTtcbiAgdmFyIGF4aXNOYW1lID0gYXhpc1R5cGUgKyAnQXhpcyc7XG4gIHZhciB2YWx1ZVNlcmllcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gc1theGlzTmFtZV0gPT09IGluZGV4O1xuICB9KTtcbiAgaWYgKCF2YWx1ZVNlcmllcy5sZW5ndGgpIHZhbHVlU2VyaWVzID0gc2VyaWVzO1xuICByZXR1cm4gZ2V0U2VyaWVzTWluTWF4VmFsdWUodmFsdWVTZXJpZXMpO1xufVxuXG5mdW5jdGlvbiBnZXRTZXJpZXNNaW5NYXhWYWx1ZShzZXJpZXMpIHtcbiAgaWYgKCFzZXJpZXMpIHJldHVybjtcbiAgdmFyIG1pblZhbHVlID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzZXJpZXMubWFwKGZ1bmN0aW9uIChfcmVmOSkge1xuICAgIHZhciBkYXRhID0gX3JlZjkuZGF0YTtcbiAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSgoMCwgX3V0aWwuZmlsdGVyTm9uTnVtYmVyKShkYXRhKSkpO1xuICB9KSkpO1xuICB2YXIgbWF4VmFsdWUgPSBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNlcmllcy5tYXAoZnVuY3Rpb24gKF9yZWYxMCkge1xuICAgIHZhciBkYXRhID0gX3JlZjEwLmRhdGE7XG4gICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoKDAsIF91dGlsLmZpbHRlck5vbk51bWJlcikoZGF0YSkpKTtcbiAgfSkpKTtcbiAgcmV0dXJuIFttaW5WYWx1ZSwgbWF4VmFsdWVdO1xufVxuXG5mdW5jdGlvbiBtZXJnZVN0YWNrRGF0YShzZXJpZXMpIHtcbiAgdmFyIHNlcmllc0Nsb25lZCA9ICgwLCBfdXRpbDIuZGVlcENsb25lKShzZXJpZXMsIHRydWUpO1xuICBzZXJpZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHZhciBkYXRhID0gKDAsIF91dGlsLm1lcmdlU2FtZVN0YWNrRGF0YSkoaXRlbSwgc2VyaWVzKTtcbiAgICBzZXJpZXNDbG9uZWRbaV0uZGF0YSA9IGRhdGE7XG4gIH0pO1xuICByZXR1cm4gc2VyaWVzQ2xvbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRUcnVlTWluTWF4KF9yZWYxMSwgX3JlZjEyKSB7XG4gIHZhciBtaW4gPSBfcmVmMTEubWluLFxuICAgICAgbWF4ID0gX3JlZjExLm1heCxcbiAgICAgIGF4aXMgPSBfcmVmMTEuYXhpcztcblxuICB2YXIgX3JlZjEzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMiwgMiksXG4gICAgICBtaW5WYWx1ZSA9IF9yZWYxM1swXSxcbiAgICAgIG1heFZhbHVlID0gX3JlZjEzWzFdO1xuXG4gIHZhciBtaW5UeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkobWluKSxcbiAgICAgIG1heFR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShtYXgpO1xuXG4gIGlmICghdGVzdE1pbk1heFR5cGUobWluKSkge1xuICAgIG1pbiA9IGF4aXNDb25maWdbYXhpcyArICdBeGlzQ29uZmlnJ10ubWluO1xuICAgIG1pblR5cGUgPSAnc3RyaW5nJztcbiAgfVxuXG4gIGlmICghdGVzdE1pbk1heFR5cGUobWF4KSkge1xuICAgIG1heCA9IGF4aXNDb25maWdbYXhpcyArICdBeGlzQ29uZmlnJ10ubWF4O1xuICAgIG1heFR5cGUgPSAnc3RyaW5nJztcbiAgfVxuXG4gIGlmIChtaW5UeXBlID09PSAnc3RyaW5nJykge1xuICAgIG1pbiA9IHBhcnNlSW50KG1pblZhbHVlIC0gYWJzKG1pblZhbHVlICogcGFyc2VGbG9hdChtaW4pIC8gMTAwKSk7XG4gICAgdmFyIGxldmVyID0gZ2V0VmFsdWVMZXZlcihtaW4pO1xuICAgIG1pbiA9IHBhcnNlRmxvYXQoKG1pbiAvIGxldmVyIC0gMC4xKS50b0ZpeGVkKDEpKSAqIGxldmVyO1xuICB9XG5cbiAgaWYgKG1heFR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbWF4ID0gcGFyc2VJbnQobWF4VmFsdWUgKyBhYnMobWF4VmFsdWUgKiBwYXJzZUZsb2F0KG1heCkgLyAxMDApKTtcblxuICAgIHZhciBfbGV2ZXIgPSBnZXRWYWx1ZUxldmVyKG1heCk7XG5cbiAgICBtYXggPSBwYXJzZUZsb2F0KChtYXggLyBfbGV2ZXIgKyAwLjEpLnRvRml4ZWQoMSkpICogX2xldmVyO1xuICB9XG5cbiAgcmV0dXJuIFttaW4sIG1heF07XG59XG5cbmZ1bmN0aW9uIGdldFZhbHVlTGV2ZXIodmFsdWUpIHtcbiAgdmFyIHZhbHVlU3RyaW5nID0gYWJzKHZhbHVlKS50b1N0cmluZygpO1xuICB2YXIgdmFsdWVMZW5ndGggPSB2YWx1ZVN0cmluZy5sZW5ndGg7XG4gIHZhciBmaXJzdFplcm9JbmRleCA9IHZhbHVlU3RyaW5nLnJlcGxhY2UoLzAqJC9nLCAnJykuaW5kZXhPZignMCcpO1xuICB2YXIgcG93MTBOdW0gPSB2YWx1ZUxlbmd0aCAtIDE7XG4gIGlmIChmaXJzdFplcm9JbmRleCAhPT0gLTEpIHBvdzEwTnVtIC09IGZpcnN0WmVyb0luZGV4O1xuICByZXR1cm4gcG93KDEwLCBwb3cxME51bSk7XG59XG5cbmZ1bmN0aW9uIHRlc3RNaW5NYXhUeXBlKHZhbCkge1xuICB2YXIgdmFsVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKHZhbCk7XG4gIHZhciBpc1ZhbGlkU3RyaW5nID0gdmFsVHlwZSA9PT0gJ3N0cmluZycgJiYgL15cXGQrJSQvLnRlc3QodmFsKTtcbiAgdmFyIGlzVmFsaWROdW1iZXIgPSB2YWxUeXBlID09PSAnbnVtYmVyJztcbiAgcmV0dXJuIGlzVmFsaWRTdHJpbmcgfHwgaXNWYWxpZE51bWJlcjtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVBeGlzTGFiZWxGcm9tWmVybyhtaW4sIG1heCwgaW50ZXJ2YWwpIHtcbiAgdmFyIG5lZ2F0aXZlID0gW10sXG4gICAgICBwb3NpdGl2ZSA9IFtdO1xuICB2YXIgY3VycmVudE5lZ2F0aXZlID0gMCxcbiAgICAgIGN1cnJlbnRQb3NpdGl2ZSA9IDA7XG5cbiAgZG8ge1xuICAgIG5lZ2F0aXZlLnB1c2goY3VycmVudE5lZ2F0aXZlIC09IGludGVydmFsKTtcbiAgfSB3aGlsZSAoY3VycmVudE5lZ2F0aXZlID4gbWluKTtcblxuICBkbyB7XG4gICAgcG9zaXRpdmUucHVzaChjdXJyZW50UG9zaXRpdmUgKz0gaW50ZXJ2YWwpO1xuICB9IHdoaWxlIChjdXJyZW50UG9zaXRpdmUgPCBtYXgpO1xuXG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZWdhdGl2ZS5yZXZlcnNlKCkpLCBbMF0sICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpdmUpKTtcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWVBeGlzTGFiZWxGcm9tTWluKG1pbiwgbWF4LCBpbnRlcnZhbCkge1xuICB2YXIgbGFiZWwgPSBbbWluXSxcbiAgICAgIGN1cnJlbnRWYWx1ZSA9IG1pbjtcblxuICBkbyB7XG4gICAgbGFiZWwucHVzaChjdXJyZW50VmFsdWUgKz0gaW50ZXJ2YWwpO1xuICB9IHdoaWxlIChjdXJyZW50VmFsdWUgPCBtYXgpO1xuXG4gIHJldHVybiBsYWJlbDtcbn1cblxuZnVuY3Rpb24gZ2V0QWZ0ZXJGb3JtYXR0ZXJMYWJlbChsYWJlbCwgZm9ybWF0dGVyKSB7XG4gIGlmICghZm9ybWF0dGVyKSByZXR1cm4gbGFiZWw7XG4gIGlmICh0eXBlb2YgZm9ybWF0dGVyID09PSAnc3RyaW5nJykgbGFiZWwgPSBsYWJlbC5tYXAoZnVuY3Rpb24gKGwpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCBsKTtcbiAgfSk7XG4gIGlmICh0eXBlb2YgZm9ybWF0dGVyID09PSAnZnVuY3Rpb24nKSBsYWJlbCA9IGxhYmVsLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlcih7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBpbmRleDogaW5kZXhcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBsYWJlbDtcbn1cblxuZnVuY3Rpb24gY2FsY0xhYmVsQXhpc0xhYmVsRGF0YShsYWJlbEF4aXMpIHtcbiAgcmV0dXJuIGxhYmVsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICB2YXIgZGF0YSA9IGF4aXMuZGF0YSxcbiAgICAgICAgZm9ybWF0dGVyID0gYXhpcy5heGlzTGFiZWwuZm9ybWF0dGVyO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBsYWJlbDogZ2V0QWZ0ZXJGb3JtYXR0ZXJMYWJlbChkYXRhLCBmb3JtYXR0ZXIpXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZUludGVydmFsKG1pbiwgbWF4LCBheGlzKSB7XG4gIHZhciBpbnRlcnZhbCA9IGF4aXMuaW50ZXJ2YWwsXG4gICAgICBtaW5JbnRlcnZhbCA9IGF4aXMubWluSW50ZXJ2YWwsXG4gICAgICBtYXhJbnRlcnZhbCA9IGF4aXMubWF4SW50ZXJ2YWwsXG4gICAgICBzcGxpdE51bWJlciA9IGF4aXMuc3BsaXROdW1iZXIsXG4gICAgICBheGlzVHlwZSA9IGF4aXMuYXhpcztcbiAgdmFyIGNvbmZpZyA9IGF4aXNDb25maWdbYXhpc1R5cGUgKyAnQXhpc0NvbmZpZyddO1xuICBpZiAodHlwZW9mIGludGVydmFsICE9PSAnbnVtYmVyJykgaW50ZXJ2YWwgPSBjb25maWcuaW50ZXJ2YWw7XG4gIGlmICh0eXBlb2YgbWluSW50ZXJ2YWwgIT09ICdudW1iZXInKSBtaW5JbnRlcnZhbCA9IGNvbmZpZy5taW5JbnRlcnZhbDtcbiAgaWYgKHR5cGVvZiBtYXhJbnRlcnZhbCAhPT0gJ251bWJlcicpIG1heEludGVydmFsID0gY29uZmlnLm1heEludGVydmFsO1xuICBpZiAodHlwZW9mIHNwbGl0TnVtYmVyICE9PSAnbnVtYmVyJykgc3BsaXROdW1iZXIgPSBjb25maWcuc3BsaXROdW1iZXI7XG4gIGlmICh0eXBlb2YgaW50ZXJ2YWwgPT09ICdudW1iZXInKSByZXR1cm4gaW50ZXJ2YWw7XG4gIHZhciB2YWx1ZUludGVydmFsID0gcGFyc2VJbnQoKG1heCAtIG1pbikgLyAoc3BsaXROdW1iZXIgLSAxKSk7XG4gIGlmICh2YWx1ZUludGVydmFsLnRvU3RyaW5nKCkubGVuZ3RoID4gMSkgdmFsdWVJbnRlcnZhbCA9IHBhcnNlSW50KHZhbHVlSW50ZXJ2YWwudG9TdHJpbmcoKS5yZXBsYWNlKC9cXGQkLywgJzAnKSk7XG4gIGlmICh2YWx1ZUludGVydmFsID09PSAwKSB2YWx1ZUludGVydmFsID0gMTtcbiAgaWYgKHR5cGVvZiBtaW5JbnRlcnZhbCA9PT0gJ251bWJlcicgJiYgdmFsdWVJbnRlcnZhbCA8IG1pbkludGVydmFsKSByZXR1cm4gbWluSW50ZXJ2YWw7XG4gIGlmICh0eXBlb2YgbWF4SW50ZXJ2YWwgPT09ICdudW1iZXInICYmIHZhbHVlSW50ZXJ2YWwgPiBtYXhJbnRlcnZhbCkgcmV0dXJuIG1heEludGVydmFsO1xuICByZXR1cm4gdmFsdWVJbnRlcnZhbDtcbn1cblxuZnVuY3Rpb24gc2V0QXhpc1Bvc2l0aW9uKGFsbEF4aXMpIHtcbiAgdmFyIHhBeGlzID0gYWxsQXhpcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYxNCkge1xuICAgIHZhciBheGlzID0gX3JlZjE0LmF4aXM7XG4gICAgcmV0dXJuIGF4aXMgPT09ICd4JztcbiAgfSk7XG4gIHZhciB5QXhpcyA9IGFsbEF4aXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmMTUpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYxNS5heGlzO1xuICAgIHJldHVybiBheGlzID09PSAneSc7XG4gIH0pO1xuICBpZiAoeEF4aXNbMF0gJiYgIXhBeGlzWzBdLnBvc2l0aW9uKSB4QXhpc1swXS5wb3NpdGlvbiA9IF9jb25maWcueEF4aXNDb25maWcucG9zaXRpb247XG5cbiAgaWYgKHhBeGlzWzFdICYmICF4QXhpc1sxXS5wb3NpdGlvbikge1xuICAgIHhBeGlzWzFdLnBvc2l0aW9uID0geEF4aXNbMF0ucG9zaXRpb24gPT09ICdib3R0b20nID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgfVxuXG4gIGlmICh5QXhpc1swXSAmJiAheUF4aXNbMF0ucG9zaXRpb24pIHlBeGlzWzBdLnBvc2l0aW9uID0gX2NvbmZpZy55QXhpc0NvbmZpZy5wb3NpdGlvbjtcblxuICBpZiAoeUF4aXNbMV0gJiYgIXlBeGlzWzFdLnBvc2l0aW9uKSB7XG4gICAgeUF4aXNbMV0ucG9zaXRpb24gPSB5QXhpc1swXS5wb3NpdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgfVxuXG4gIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKSh4QXhpcyksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoeUF4aXMpKTtcbn1cblxuZnVuY3Rpb24gY2FsY0F4aXNMaW5lUG9zaXRpb24oYWxsQXhpcywgY2hhcnQpIHtcbiAgdmFyIF9jaGFydCRncmlkQXJlYSA9IGNoYXJ0LmdyaWRBcmVhLFxuICAgICAgeCA9IF9jaGFydCRncmlkQXJlYS54LFxuICAgICAgeSA9IF9jaGFydCRncmlkQXJlYS55LFxuICAgICAgdyA9IF9jaGFydCRncmlkQXJlYS53LFxuICAgICAgaCA9IF9jaGFydCRncmlkQXJlYS5oO1xuICBhbGxBeGlzID0gYWxsQXhpcy5tYXAoZnVuY3Rpb24gKGF4aXMpIHtcbiAgICB2YXIgcG9zaXRpb24gPSBheGlzLnBvc2l0aW9uO1xuICAgIHZhciBsaW5lUG9zaXRpb24gPSBbXTtcblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICBsaW5lUG9zaXRpb24gPSBbW3gsIHldLCBbeCwgeSArIGhdXS5yZXZlcnNlKCk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgbGluZVBvc2l0aW9uID0gW1t4ICsgdywgeV0sIFt4ICsgdywgeSArIGhdXS5yZXZlcnNlKCk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgIGxpbmVQb3NpdGlvbiA9IFtbeCwgeV0sIFt4ICsgdywgeV1dO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICBsaW5lUG9zaXRpb24gPSBbW3gsIHkgKyBoXSwgW3ggKyB3LCB5ICsgaF1dO1xuICAgIH1cblxuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzLCB7XG4gICAgICBsaW5lUG9zaXRpb246IGxpbmVQb3NpdGlvblxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGFsbEF4aXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNBeGlzVGlja1Bvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KSB7XG4gIHJldHVybiBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0l0ZW0pIHtcbiAgICB2YXIgYXhpcyA9IGF4aXNJdGVtLmF4aXMsXG4gICAgICAgIGxpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLmxpbmVQb3NpdGlvbixcbiAgICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbixcbiAgICAgICAgbGFiZWwgPSBheGlzSXRlbS5sYWJlbCxcbiAgICAgICAgYm91bmRhcnlHYXAgPSBheGlzSXRlbS5ib3VuZGFyeUdhcDtcbiAgICBpZiAodHlwZW9mIGJvdW5kYXJ5R2FwICE9PSAnYm9vbGVhbicpIGJvdW5kYXJ5R2FwID0gYXhpc0NvbmZpZ1theGlzICsgJ0F4aXNDb25maWcnXS5ib3VuZGFyeUdhcDtcbiAgICB2YXIgbGFiZWxOdW0gPSBsYWJlbC5sZW5ndGg7XG5cbiAgICB2YXIgX2xpbmVQb3NpdGlvbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9zaXRpb24sIDIpLFxuICAgICAgICBfbGluZVBvc2l0aW9uJCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfbGluZVBvc2l0aW9uWzBdLCAyKSxcbiAgICAgICAgc3RhcnRYID0gX2xpbmVQb3NpdGlvbiRbMF0sXG4gICAgICAgIHN0YXJ0WSA9IF9saW5lUG9zaXRpb24kWzFdLFxuICAgICAgICBfbGluZVBvc2l0aW9uJDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2xpbmVQb3NpdGlvblsxXSwgMiksXG4gICAgICAgIGVuZFggPSBfbGluZVBvc2l0aW9uJDJbMF0sXG4gICAgICAgIGVuZFkgPSBfbGluZVBvc2l0aW9uJDJbMV07XG5cbiAgICB2YXIgZ2FwTGVuZ3RoID0gYXhpcyA9PT0gJ3gnID8gZW5kWCAtIHN0YXJ0WCA6IGVuZFkgLSBzdGFydFk7XG4gICAgdmFyIGdhcCA9IGdhcExlbmd0aCAvIChib3VuZGFyeUdhcCA/IGxhYmVsTnVtIDogbGFiZWxOdW0gLSAxKTtcbiAgICB2YXIgdGlja1Bvc2l0aW9uID0gbmV3IEFycmF5KGxhYmVsTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgICAgIHJldHVybiBbc3RhcnRYICsgZ2FwICogKGJvdW5kYXJ5R2FwID8gaSArIDAuNSA6IGkpLCBzdGFydFldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW3N0YXJ0WCwgc3RhcnRZICsgZ2FwICogKGJvdW5kYXJ5R2FwID8gaSArIDAuNSA6IGkpXTtcbiAgICB9KTtcbiAgICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IGdldFRpY2tMaW5lUG9zaXRpb24oYXhpcywgYm91bmRhcnlHYXAsIHBvc2l0aW9uLCB0aWNrUG9zaXRpb24sIGdhcCk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGF4aXNJdGVtLCB7XG4gICAgICB0aWNrUG9zaXRpb246IHRpY2tQb3NpdGlvbixcbiAgICAgIHRpY2tMaW5lUG9zaXRpb246IHRpY2tMaW5lUG9zaXRpb24sXG4gICAgICB0aWNrR2FwOiBnYXBcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tMaW5lUG9zaXRpb24oYXhpc1R5cGUsIGJvdW5kYXJ5R2FwLCBwb3NpdGlvbiwgdGlja1Bvc2l0aW9uLCBnYXApIHtcbiAgdmFyIGluZGV4ID0gYXhpc1R5cGUgPT09ICd4JyA/IDEgOiAwO1xuICB2YXIgcGx1cyA9IDU7XG4gIGlmIChheGlzVHlwZSA9PT0gJ3gnICYmIHBvc2l0aW9uID09PSAndG9wJykgcGx1cyA9IC01O1xuICBpZiAoYXhpc1R5cGUgPT09ICd5JyAmJiBwb3NpdGlvbiA9PT0gJ2xlZnQnKSBwbHVzID0gLTU7XG4gIHZhciB0aWNrTGluZVBvc2l0aW9uID0gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAobGluZVN0YXJ0KSB7XG4gICAgdmFyIGxpbmVFbmQgPSAoMCwgX3V0aWwyLmRlZXBDbG9uZSkobGluZVN0YXJ0KTtcbiAgICBsaW5lRW5kW2luZGV4XSArPSBwbHVzO1xuICAgIHJldHVybiBbKDAsIF91dGlsMi5kZWVwQ2xvbmUpKGxpbmVTdGFydCksIGxpbmVFbmRdO1xuICB9KTtcbiAgaWYgKCFib3VuZGFyeUdhcCkgcmV0dXJuIHRpY2tMaW5lUG9zaXRpb247XG4gIGluZGV4ID0gYXhpc1R5cGUgPT09ICd4JyA/IDAgOiAxO1xuICBwbHVzID0gZ2FwIC8gMjtcbiAgdGlja0xpbmVQb3NpdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChfcmVmMTYpIHtcbiAgICB2YXIgX3JlZjE3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxNiwgMiksXG4gICAgICAgIGxpbmVTdGFydCA9IF9yZWYxN1swXSxcbiAgICAgICAgbGluZUVuZCA9IF9yZWYxN1sxXTtcblxuICAgIGxpbmVTdGFydFtpbmRleF0gKz0gcGx1cztcbiAgICBsaW5lRW5kW2luZGV4XSArPSBwbHVzO1xuICB9KTtcbiAgcmV0dXJuIHRpY2tMaW5lUG9zaXRpb247XG59XG5cbmZ1bmN0aW9uIGNhbGNBeGlzTmFtZVBvc2l0aW9uKGFsbEF4aXMsIGNoYXJ0KSB7XG4gIHJldHVybiBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0l0ZW0pIHtcbiAgICB2YXIgbmFtZUdhcCA9IGF4aXNJdGVtLm5hbWVHYXAsXG4gICAgICAgIG5hbWVMb2NhdGlvbiA9IGF4aXNJdGVtLm5hbWVMb2NhdGlvbixcbiAgICAgICAgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbixcbiAgICAgICAgbGluZVBvc2l0aW9uID0gYXhpc0l0ZW0ubGluZVBvc2l0aW9uO1xuXG4gICAgdmFyIF9saW5lUG9zaXRpb24yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb3NpdGlvbiwgMiksXG4gICAgICAgIGxpbmVTdGFydCA9IF9saW5lUG9zaXRpb24yWzBdLFxuICAgICAgICBsaW5lRW5kID0gX2xpbmVQb3NpdGlvbjJbMV07XG5cbiAgICB2YXIgbmFtZVBvc2l0aW9uID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lU3RhcnQpO1xuICAgIGlmIChuYW1lTG9jYXRpb24gPT09ICdlbmQnKSBuYW1lUG9zaXRpb24gPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxpbmVFbmQpO1xuXG4gICAgaWYgKG5hbWVMb2NhdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIG5hbWVQb3NpdGlvblswXSA9IChsaW5lU3RhcnRbMF0gKyBsaW5lRW5kWzBdKSAvIDI7XG4gICAgICBuYW1lUG9zaXRpb25bMV0gPSAobGluZVN0YXJ0WzFdICsgbGluZUVuZFsxXSkgLyAyO1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBuYW1lTG9jYXRpb24gPT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBuYW1lTG9jYXRpb24gPT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbmFtZUxvY2F0aW9uICE9PSAnY2VudGVyJykgaW5kZXggPSAxO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBuYW1lTG9jYXRpb24gIT09ICdjZW50ZXInKSBpbmRleCA9IDE7XG4gICAgdmFyIHBsdXMgPSBuYW1lR2FwO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ3RvcCcgJiYgbmFtZUxvY2F0aW9uICE9PSAnZW5kJykgcGx1cyAqPSAtMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICdsZWZ0JyAmJiBuYW1lTG9jYXRpb24gIT09ICdzdGFydCcpIHBsdXMgKj0gLTE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJyAmJiBuYW1lTG9jYXRpb24gPT09ICdzdGFydCcpIHBsdXMgKj0gLTE7XG4gICAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnICYmIG5hbWVMb2NhdGlvbiA9PT0gJ2VuZCcpIHBsdXMgKj0gLTE7XG4gICAgbmFtZVBvc2l0aW9uW2luZGV4XSArPSBwbHVzO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBheGlzSXRlbSwge1xuICAgICAgbmFtZVBvc2l0aW9uOiBuYW1lUG9zaXRpb25cbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNTcGxpdExpbmVQb3NpdGlvbihhbGxBeGlzLCBjaGFydCkge1xuICB2YXIgX2NoYXJ0JGdyaWRBcmVhMiA9IGNoYXJ0LmdyaWRBcmVhLFxuICAgICAgdyA9IF9jaGFydCRncmlkQXJlYTIudyxcbiAgICAgIGggPSBfY2hhcnQkZ3JpZEFyZWEyLmg7XG4gIHJldHVybiBhbGxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0l0ZW0pIHtcbiAgICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLnRpY2tMaW5lUG9zaXRpb24sXG4gICAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb24sXG4gICAgICAgIGJvdW5kYXJ5R2FwID0gYXhpc0l0ZW0uYm91bmRhcnlHYXA7XG4gICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgcGx1cyA9IHc7XG4gICAgaWYgKHBvc2l0aW9uID09PSAndG9wJyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIGluZGV4ID0gMTtcbiAgICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgcGx1cyA9IGg7XG4gICAgaWYgKHBvc2l0aW9uID09PSAncmlnaHQnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgcGx1cyAqPSAtMTtcbiAgICB2YXIgc3BsaXRMaW5lUG9zaXRpb24gPSB0aWNrTGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZjE4KSB7XG4gICAgICB2YXIgX3JlZjE5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxOCwgMSksXG4gICAgICAgICAgc3RhcnRQb2ludCA9IF9yZWYxOVswXTtcblxuICAgICAgdmFyIGVuZFBvaW50ID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzdGFydFBvaW50KTtcbiAgICAgIGVuZFBvaW50W2luZGV4XSArPSBwbHVzO1xuICAgICAgcmV0dXJuIFsoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHN0YXJ0UG9pbnQpLCBlbmRQb2ludF07XG4gICAgfSk7XG4gICAgaWYgKCFib3VuZGFyeUdhcCkgc3BsaXRMaW5lUG9zaXRpb24uc2hpZnQoKTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYXhpc0l0ZW0sIHtcbiAgICAgIHNwbGl0TGluZVBvc2l0aW9uOiBzcGxpdExpbmVQb3NpdGlvblxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUNvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiBheGlzSXRlbS5heGlzTGluZS5zaG93LFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldExpbmVTaGFwZShheGlzSXRlbSksXG4gICAgc3R5bGU6IGdldExpbmVTdHlsZShheGlzSXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVTaGFwZShheGlzSXRlbSkge1xuICB2YXIgbGluZVBvc2l0aW9uID0gYXhpc0l0ZW0ubGluZVBvc2l0aW9uO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogbGluZVBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVTdHlsZShheGlzSXRlbSkge1xuICByZXR1cm4gYXhpc0l0ZW0uYXhpc0xpbmUuc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tDb25maWcoYXhpc0l0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYXhpc0l0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYXhpc0l0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0VGlja1NoYXBlcyhheGlzSXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldFRpY2tTdHlsZShheGlzSXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGF4aXNJdGVtLmF4aXNUaWNrLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VGlja1NoYXBlcyhheGlzSXRlbSkge1xuICB2YXIgdGlja0xpbmVQb3NpdGlvbiA9IGF4aXNJdGVtLnRpY2tMaW5lUG9zaXRpb247XG4gIHJldHVybiB0aWNrTGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRpY2tTdHlsZShheGlzSXRlbSkge1xuICByZXR1cm4gYXhpc0l0ZW0uYXhpc1RpY2suc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldExhYmVsU2hhcGVzKGF4aXNJdGVtKTtcbiAgdmFyIHN0eWxlcyA9IGdldExhYmVsU3R5bGUoYXhpc0l0ZW0sIHNoYXBlcyk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSwgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogYXhpc0l0ZW0uYXhpc0xhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVzW2ldLFxuICAgICAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKCkge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFNoYXBlcyhheGlzSXRlbSkge1xuICB2YXIgbGFiZWwgPSBheGlzSXRlbS5sYWJlbCxcbiAgICAgIHRpY2tQb3NpdGlvbiA9IGF4aXNJdGVtLnRpY2tQb3NpdGlvbixcbiAgICAgIHBvc2l0aW9uID0gYXhpc0l0ZW0ucG9zaXRpb247XG4gIHJldHVybiB0aWNrUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChwb2ludCwgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogZ2V0TGFiZWxSZWFsUG9zaXRpb24ocG9pbnQsIHBvc2l0aW9uKSxcbiAgICAgIGNvbnRlbnQ6IGxhYmVsW2ldLnRvU3RyaW5nKClcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxSZWFsUG9zaXRpb24ocG9pbnRzLCBwb3NpdGlvbikge1xuICB2YXIgaW5kZXggPSAwLFxuICAgICAgcGx1cyA9IDEwO1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnYm90dG9tJykgaW5kZXggPSAxO1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnIHx8IHBvc2l0aW9uID09PSAnbGVmdCcpIHBsdXMgPSAtMTA7XG4gIHBvaW50cyA9ICgwLCBfdXRpbDIuZGVlcENsb25lKShwb2ludHMpO1xuICBwb2ludHNbaW5kZXhdICs9IHBsdXM7XG4gIHJldHVybiBwb2ludHM7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUoYXhpc0l0ZW0sIHNoYXBlcykge1xuICB2YXIgcG9zaXRpb24gPSBheGlzSXRlbS5wb3NpdGlvbjtcbiAgdmFyIHN0eWxlID0gYXhpc0l0ZW0uYXhpc0xhYmVsLnN0eWxlO1xuICB2YXIgYWxpZ24gPSBnZXRBeGlzTGFiZWxSZWFsQWxpZ24ocG9zaXRpb24pO1xuICBzdHlsZSA9ICgwLCBfdXRpbC5kZWVwTWVyZ2UpKGFsaWduLCBzdHlsZSk7XG4gIHZhciBzdHlsZXMgPSBzaGFwZXMubWFwKGZ1bmN0aW9uIChfcmVmMjApIHtcbiAgICB2YXIgcG9zaXRpb24gPSBfcmVmMjAucG9zaXRpb247XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIHN0eWxlLCB7XG4gICAgICBncmFwaENlbnRlcjogcG9zaXRpb25cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBzdHlsZXM7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbFJlYWxBbGlnbihwb3NpdGlvbikge1xuICBpZiAocG9zaXRpb24gPT09ICdsZWZ0JykgcmV0dXJuIHtcbiAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICdyaWdodCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICdib3R0b20nKSByZXR1cm4ge1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgdGV4dEJhc2VsaW5lOiAndG9wJ1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROYW1lQ29uZmlnKGF4aXNJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGF4aXNJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBheGlzSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGF4aXNJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3RleHQnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0TmFtZVNoYXBlKGF4aXNJdGVtKSxcbiAgICBzdHlsZTogZ2V0TmFtZVN0eWxlKGF4aXNJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZVNoYXBlKGF4aXNJdGVtKSB7XG4gIHZhciBuYW1lID0gYXhpc0l0ZW0ubmFtZSxcbiAgICAgIG5hbWVQb3NpdGlvbiA9IGF4aXNJdGVtLm5hbWVQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBuYW1lLFxuICAgIHBvc2l0aW9uOiBuYW1lUG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZVN0eWxlKGF4aXNJdGVtKSB7XG4gIHZhciBuYW1lTG9jYXRpb24gPSBheGlzSXRlbS5uYW1lTG9jYXRpb24sXG4gICAgICBwb3NpdGlvbiA9IGF4aXNJdGVtLnBvc2l0aW9uLFxuICAgICAgc3R5bGUgPSBheGlzSXRlbS5uYW1lVGV4dFN0eWxlO1xuICB2YXIgYWxpZ24gPSBnZXROYW1lUmVhbEFsaWduKHBvc2l0aW9uLCBuYW1lTG9jYXRpb24pO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoYWxpZ24sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0TmFtZVJlYWxBbGlnbihwb3NpdGlvbiwgbG9jYXRpb24pIHtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBsb2NhdGlvbiA9PT0gJ3N0YXJ0JyB8fCBwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbG9jYXRpb24gPT09ICdzdGFydCcgfHwgcG9zaXRpb24gPT09ICdsZWZ0JyAmJiBsb2NhdGlvbiA9PT0gJ2NlbnRlcicpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAncmlnaHQnLFxuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZSdcbiAgfTtcbiAgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiBsb2NhdGlvbiA9PT0gJ2VuZCcgfHwgcG9zaXRpb24gPT09ICdib3R0b20nICYmIGxvY2F0aW9uID09PSAnZW5kJyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBsb2NhdGlvbiA9PT0gJ2NlbnRlcicpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBpZiAocG9zaXRpb24gPT09ICd0b3AnICYmIGxvY2F0aW9uID09PSAnY2VudGVyJyB8fCBwb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGxvY2F0aW9uID09PSAnZW5kJyB8fCBwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBsb2NhdGlvbiA9PT0gJ2VuZCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nXG4gIH07XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgbG9jYXRpb24gPT09ICdjZW50ZXInIHx8IHBvc2l0aW9uID09PSAnbGVmdCcgJiYgbG9jYXRpb24gPT09ICdzdGFydCcgfHwgcG9zaXRpb24gPT09ICdyaWdodCcgJiYgbG9jYXRpb24gPT09ICdzdGFydCcpIHJldHVybiB7XG4gICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZUNvbmZpZyhheGlzSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBheGlzSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYXhpc0l0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBheGlzSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRTcGxpdExpbmVTaGFwZXMoYXhpc0l0ZW0pO1xuICB2YXIgc3R5bGUgPSBnZXRTcGxpdExpbmVTdHlsZShheGlzSXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGF4aXNJdGVtLnNwbGl0TGluZS5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZVNoYXBlcyhheGlzSXRlbSkge1xuICB2YXIgc3BsaXRMaW5lUG9zaXRpb24gPSBheGlzSXRlbS5zcGxpdExpbmVQb3NpdGlvbjtcbiAgcmV0dXJuIHNwbGl0TGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvaW50czogcG9pbnRzXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZVN0eWxlKGF4aXNJdGVtKSB7XG4gIHJldHVybiBheGlzSXRlbS5zcGxpdExpbmUuc3R5bGU7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5iYXIgPSBiYXI7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gYmFyKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgeEF4aXMgPSBvcHRpb24ueEF4aXMsXG4gICAgICB5QXhpcyA9IG9wdGlvbi55QXhpcyxcbiAgICAgIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIHZhciBiYXJzID0gW107XG5cbiAgaWYgKHhBeGlzICYmIHlBeGlzICYmIHNlcmllcykge1xuICAgIGJhcnMgPSAoMCwgX3V0aWwyLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9jb25maWcuYmFyQ29uZmlnLCAnYmFyJyk7XG4gICAgYmFycyA9IHNldEJhckF4aXMoYmFycywgY2hhcnQpO1xuICAgIGJhcnMgPSBzZXRCYXJQb3NpdGlvbkRhdGEoYmFycywgY2hhcnQpO1xuICAgIGJhcnMgPSBjYWxjQmFyc1Bvc2l0aW9uKGJhcnMsIGNoYXJ0KTtcbiAgfVxuXG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGJhcnMuc2xpY2UoLTEpLFxuICAgIGtleTogJ2JhY2tncm91bmRCYXInLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRCYWNrZ3JvdW5kQmFyQ29uZmlnXG4gIH0pO1xuICBiYXJzLnJldmVyc2UoKTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogYmFycyxcbiAgICBrZXk6ICdiYXInLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRCYXJDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRCYXJDb25maWcsXG4gICAgYmVmb3JlVXBkYXRlOiBiZWZvcmVVcGRhdGVCYXJcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGJhcnMsXG4gICAga2V5OiAnYmFyTGFiZWwnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMYWJlbENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyQXhpcyhiYXJzLCBjaGFydCkge1xuICB2YXIgYXhpc0RhdGEgPSBjaGFydC5heGlzRGF0YTtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgeEF4aXNJbmRleCA9IGJhci54QXhpc0luZGV4LFxuICAgICAgICB5QXhpc0luZGV4ID0gYmFyLnlBeGlzSW5kZXg7XG4gICAgaWYgKHR5cGVvZiB4QXhpc0luZGV4ICE9PSAnbnVtYmVyJykgeEF4aXNJbmRleCA9IDA7XG4gICAgaWYgKHR5cGVvZiB5QXhpc0luZGV4ICE9PSAnbnVtYmVyJykgeUF4aXNJbmRleCA9IDA7XG4gICAgdmFyIHhBeGlzID0gYXhpc0RhdGEuZmluZChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIGF4aXMgPSBfcmVmLmF4aXMsXG4gICAgICAgICAgaW5kZXggPSBfcmVmLmluZGV4O1xuICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KGF4aXMpLmNvbmNhdChpbmRleCkgPT09IFwieFwiLmNvbmNhdCh4QXhpc0luZGV4KTtcbiAgICB9KTtcbiAgICB2YXIgeUF4aXMgPSBheGlzRGF0YS5maW5kKGZ1bmN0aW9uIChfcmVmMikge1xuICAgICAgdmFyIGF4aXMgPSBfcmVmMi5heGlzLFxuICAgICAgICAgIGluZGV4ID0gX3JlZjIuaW5kZXg7XG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQoYXhpcykuY29uY2F0KGluZGV4KSA9PT0gXCJ5XCIuY29uY2F0KHlBeGlzSW5kZXgpO1xuICAgIH0pO1xuICAgIHZhciBheGlzID0gW3hBeGlzLCB5QXhpc107XG4gICAgdmFyIHZhbHVlQXhpc0luZGV4ID0gYXhpcy5maW5kSW5kZXgoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgICB2YXIgZGF0YSA9IF9yZWYzLmRhdGE7XG4gICAgICByZXR1cm4gZGF0YSA9PT0gJ3ZhbHVlJztcbiAgICB9KTtcbiAgICBiYXIudmFsdWVBeGlzID0gYXhpc1t2YWx1ZUF4aXNJbmRleF07XG4gICAgYmFyLmxhYmVsQXhpcyA9IGF4aXNbMSAtIHZhbHVlQXhpc0luZGV4XTtcbiAgfSk7XG4gIHJldHVybiBiYXJzO1xufVxuXG5mdW5jdGlvbiBzZXRCYXJQb3NpdGlvbkRhdGEoYmFycywgY2hhcnQpIHtcbiAgdmFyIGxhYmVsQmFyR3JvdXAgPSBncm91cEJhckJ5TGFiZWxBeGlzKGJhcnMpO1xuICBsYWJlbEJhckdyb3VwLmZvckVhY2goZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgc2V0QmFySW5kZXgoZ3JvdXApO1xuICAgIHNldEJhck51bShncm91cCk7XG4gICAgc2V0QmFyQ2F0ZWdvcnlXaWR0aChncm91cCwgY2hhcnQpO1xuICAgIHNldEJhcldpZHRoQW5kR2FwKGdyb3VwKTtcbiAgICBzZXRCYXJBbGxXaWR0aEFuZEdhcChncm91cCk7XG4gIH0pO1xuICByZXR1cm4gYmFycztcbn1cblxuZnVuY3Rpb24gc2V0QmFySW5kZXgoYmFycykge1xuICB2YXIgc3RhY2tzID0gZ2V0QmFyU3RhY2soYmFycyk7XG4gIHN0YWNrcyA9IHN0YWNrcy5tYXAoZnVuY3Rpb24gKHN0YWNrKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWNrOiBzdGFjayxcbiAgICAgIGluZGV4OiAtMVxuICAgIH07XG4gIH0pO1xuICB2YXIgY3VycmVudEluZGV4ID0gMDtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgc3RhY2sgPSBiYXIuc3RhY2s7XG5cbiAgICBpZiAoIXN0YWNrKSB7XG4gICAgICBiYXIuYmFySW5kZXggPSBjdXJyZW50SW5kZXg7XG4gICAgICBjdXJyZW50SW5kZXgrKztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHN0YWNrRGF0YSA9IHN0YWNrcy5maW5kKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgICAgICB2YXIgcyA9IF9yZWY0LnN0YWNrO1xuICAgICAgICByZXR1cm4gcyA9PT0gc3RhY2s7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHN0YWNrRGF0YS5pbmRleCA9PT0gLTEpIHtcbiAgICAgICAgc3RhY2tEYXRhLmluZGV4ID0gY3VycmVudEluZGV4O1xuICAgICAgICBjdXJyZW50SW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgYmFyLmJhckluZGV4ID0gc3RhY2tEYXRhLmluZGV4O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdyb3VwQmFyQnlMYWJlbEF4aXMoYmFycykge1xuICB2YXIgbGFiZWxBeGlzID0gYmFycy5tYXAoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgdmFyIF9yZWY1JGxhYmVsQXhpcyA9IF9yZWY1LmxhYmVsQXhpcyxcbiAgICAgICAgYXhpcyA9IF9yZWY1JGxhYmVsQXhpcy5heGlzLFxuICAgICAgICBpbmRleCA9IF9yZWY1JGxhYmVsQXhpcy5pbmRleDtcbiAgICByZXR1cm4gYXhpcyArIGluZGV4O1xuICB9KTtcbiAgbGFiZWxBeGlzID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShuZXcgU2V0KGxhYmVsQXhpcykpO1xuICByZXR1cm4gbGFiZWxBeGlzLm1hcChmdW5jdGlvbiAoYXhpc0luZGV4KSB7XG4gICAgcmV0dXJuIGJhcnMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNikge1xuICAgICAgdmFyIF9yZWY2JGxhYmVsQXhpcyA9IF9yZWY2LmxhYmVsQXhpcyxcbiAgICAgICAgICBheGlzID0gX3JlZjYkbGFiZWxBeGlzLmF4aXMsXG4gICAgICAgICAgaW5kZXggPSBfcmVmNiRsYWJlbEF4aXMuaW5kZXg7XG4gICAgICByZXR1cm4gYXhpcyArIGluZGV4ID09PSBheGlzSW5kZXg7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJTdGFjayhiYXJzKSB7XG4gIHZhciBzdGFja3MgPSBbXTtcbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChfcmVmNykge1xuICAgIHZhciBzdGFjayA9IF9yZWY3LnN0YWNrO1xuICAgIGlmIChzdGFjaykgc3RhY2tzLnB1c2goc3RhY2spO1xuICB9KTtcbiAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3IFNldChzdGFja3MpKTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyTnVtKGJhcnMpIHtcbiAgdmFyIGJhck51bSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3IFNldChiYXJzLm1hcChmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgYmFySW5kZXggPSBfcmVmOC5iYXJJbmRleDtcbiAgICByZXR1cm4gYmFySW5kZXg7XG4gIH0pKSkubGVuZ3RoO1xuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIHJldHVybiBiYXIuYmFyTnVtID0gYmFyTnVtO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyQ2F0ZWdvcnlXaWR0aChiYXJzKSB7XG4gIHZhciBsYXN0QmFyID0gYmFycy5zbGljZSgtMSlbMF07XG4gIHZhciBiYXJDYXRlZ29yeUdhcCA9IGxhc3RCYXIuYmFyQ2F0ZWdvcnlHYXAsXG4gICAgICB0aWNrR2FwID0gbGFzdEJhci5sYWJlbEF4aXMudGlja0dhcDtcbiAgdmFyIGJhckNhdGVnb3J5V2lkdGggPSAwO1xuXG4gIGlmICh0eXBlb2YgYmFyQ2F0ZWdvcnlHYXAgPT09ICdudW1iZXInKSB7XG4gICAgYmFyQ2F0ZWdvcnlXaWR0aCA9IGJhckNhdGVnb3J5R2FwO1xuICB9IGVsc2Uge1xuICAgIGJhckNhdGVnb3J5V2lkdGggPSAoMSAtIHBhcnNlSW50KGJhckNhdGVnb3J5R2FwKSAvIDEwMCkgKiB0aWNrR2FwO1xuICB9XG5cbiAgYmFycy5mb3JFYWNoKGZ1bmN0aW9uIChiYXIpIHtcbiAgICByZXR1cm4gYmFyLmJhckNhdGVnb3J5V2lkdGggPSBiYXJDYXRlZ29yeVdpZHRoO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0QmFyV2lkdGhBbmRHYXAoYmFycykge1xuICB2YXIgX2JhcnMkc2xpY2UkID0gYmFycy5zbGljZSgtMSlbMF0sXG4gICAgICBiYXJDYXRlZ29yeVdpZHRoID0gX2JhcnMkc2xpY2UkLmJhckNhdGVnb3J5V2lkdGgsXG4gICAgICBiYXJXaWR0aCA9IF9iYXJzJHNsaWNlJC5iYXJXaWR0aCxcbiAgICAgIGJhckdhcCA9IF9iYXJzJHNsaWNlJC5iYXJHYXAsXG4gICAgICBiYXJOdW0gPSBfYmFycyRzbGljZSQuYmFyTnVtO1xuICB2YXIgd2lkdGhBbmRHYXAgPSBbXTtcblxuICBpZiAodHlwZW9mIGJhcldpZHRoID09PSAnbnVtYmVyJyB8fCBiYXJXaWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgd2lkdGhBbmRHYXAgPSBnZXRCYXJXaWR0aEFuZEdhcFdpdGhQZXJjZW50T3JOdW1iZXIoYmFyQ2F0ZWdvcnlXaWR0aCwgYmFyV2lkdGgsIGJhckdhcCwgYmFyTnVtKTtcbiAgfSBlbHNlIGlmIChiYXJXaWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgd2lkdGhBbmRHYXAgPSBnZXRCYXJXaWR0aEFuZEdhcFdpZHRoQXV0byhiYXJDYXRlZ29yeVdpZHRoLCBiYXJXaWR0aCwgYmFyR2FwLCBiYXJOdW0pO1xuICB9XG5cbiAgdmFyIF93aWR0aEFuZEdhcCA9IHdpZHRoQW5kR2FwLFxuICAgICAgX3dpZHRoQW5kR2FwMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfd2lkdGhBbmRHYXAsIDIpLFxuICAgICAgd2lkdGggPSBfd2lkdGhBbmRHYXAyWzBdLFxuICAgICAgZ2FwID0gX3dpZHRoQW5kR2FwMlsxXTtcblxuICBiYXJzLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIGJhci5iYXJXaWR0aCA9IHdpZHRoO1xuICAgIGJhci5iYXJHYXAgPSBnYXA7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJXaWR0aEFuZEdhcFdpdGhQZXJjZW50T3JOdW1iZXIoYmFyQ2F0ZWdvcnlXaWR0aCwgYmFyV2lkdGgsIGJhckdhcCkge1xuICB2YXIgd2lkdGggPSAwLFxuICAgICAgZ2FwID0gMDtcblxuICBpZiAodHlwZW9mIGJhcldpZHRoID09PSAnbnVtYmVyJykge1xuICAgIHdpZHRoID0gYmFyV2lkdGg7XG4gIH0gZWxzZSB7XG4gICAgd2lkdGggPSBwYXJzZUludChiYXJXaWR0aCkgLyAxMDAgKiBiYXJDYXRlZ29yeVdpZHRoO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBiYXJHYXAgPT09ICdudW1iZXInKSB7XG4gICAgZ2FwID0gYmFyR2FwO1xuICB9IGVsc2Uge1xuICAgIGdhcCA9IHBhcnNlSW50KGJhckdhcCkgLyAxMDAgKiB3aWR0aDtcbiAgfVxuXG4gIHJldHVybiBbd2lkdGgsIGdhcF07XG59XG5cbmZ1bmN0aW9uIGdldEJhcldpZHRoQW5kR2FwV2lkdGhBdXRvKGJhckNhdGVnb3J5V2lkdGgsIGJhcldpZHRoLCBiYXJHYXAsIGJhck51bSkge1xuICB2YXIgd2lkdGggPSAwLFxuICAgICAgZ2FwID0gMDtcbiAgdmFyIGJhckl0ZW1XaWR0aCA9IGJhckNhdGVnb3J5V2lkdGggLyBiYXJOdW07XG5cbiAgaWYgKHR5cGVvZiBiYXJHYXAgPT09ICdudW1iZXInKSB7XG4gICAgZ2FwID0gYmFyR2FwO1xuICAgIHdpZHRoID0gYmFySXRlbVdpZHRoIC0gZ2FwO1xuICB9IGVsc2Uge1xuICAgIHZhciBwZXJjZW50ID0gMTAgKyBwYXJzZUludChiYXJHYXApIC8gMTA7XG5cbiAgICBpZiAocGVyY2VudCA9PT0gMCkge1xuICAgICAgd2lkdGggPSBiYXJJdGVtV2lkdGggKiAyO1xuICAgICAgZ2FwID0gLXdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aWR0aCA9IGJhckl0ZW1XaWR0aCAvIHBlcmNlbnQgKiAxMDtcbiAgICAgIGdhcCA9IGJhckl0ZW1XaWR0aCAtIHdpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbd2lkdGgsIGdhcF07XG59XG5cbmZ1bmN0aW9uIHNldEJhckFsbFdpZHRoQW5kR2FwKGJhcnMpIHtcbiAgdmFyIF9iYXJzJHNsaWNlJDIgPSBiYXJzLnNsaWNlKC0xKVswXSxcbiAgICAgIGJhckdhcCA9IF9iYXJzJHNsaWNlJDIuYmFyR2FwLFxuICAgICAgYmFyV2lkdGggPSBfYmFycyRzbGljZSQyLmJhcldpZHRoLFxuICAgICAgYmFyTnVtID0gX2JhcnMkc2xpY2UkMi5iYXJOdW07XG4gIHZhciBiYXJBbGxXaWR0aEFuZEdhcCA9IChiYXJHYXAgKyBiYXJXaWR0aCkgKiBiYXJOdW0gLSBiYXJHYXA7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgcmV0dXJuIGJhci5iYXJBbGxXaWR0aEFuZEdhcCA9IGJhckFsbFdpZHRoQW5kR2FwO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY0JhcnNQb3NpdGlvbihiYXJzLCBjaGFydCkge1xuICBiYXJzID0gY2FsY0JhclZhbHVlQXhpc0Nvb3JkaW5hdGUoYmFycyk7XG4gIGJhcnMgPSBjYWxjQmFyTGFiZWxBeGlzQ29vcmRpbmF0ZShiYXJzKTtcbiAgYmFycyA9IGVsaW1pbmF0ZU51bGxCYXJMYWJlbEF4aXMoYmFycyk7XG4gIGJhcnMgPSBrZWVwU2FtZU51bUJldHdlZW5CYXJBbmREYXRhKGJhcnMpO1xuICByZXR1cm4gYmFycztcbn1cblxuZnVuY3Rpb24gY2FsY0JhckxhYmVsQXhpc0Nvb3JkaW5hdGUoYmFycykge1xuICByZXR1cm4gYmFycy5tYXAoZnVuY3Rpb24gKGJhcikge1xuICAgIHZhciBsYWJlbEF4aXMgPSBiYXIubGFiZWxBeGlzLFxuICAgICAgICBiYXJBbGxXaWR0aEFuZEdhcCA9IGJhci5iYXJBbGxXaWR0aEFuZEdhcCxcbiAgICAgICAgYmFyR2FwID0gYmFyLmJhckdhcCxcbiAgICAgICAgYmFyV2lkdGggPSBiYXIuYmFyV2lkdGgsXG4gICAgICAgIGJhckluZGV4ID0gYmFyLmJhckluZGV4O1xuICAgIHZhciB0aWNrR2FwID0gbGFiZWxBeGlzLnRpY2tHYXAsXG4gICAgICAgIHRpY2tQb3NpdGlvbiA9IGxhYmVsQXhpcy50aWNrUG9zaXRpb24sXG4gICAgICAgIGF4aXMgPSBsYWJlbEF4aXMuYXhpcztcbiAgICB2YXIgY29vcmRpbmF0ZUluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gICAgdmFyIGJhckxhYmVsQXhpc1BvcyA9IHRpY2tQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHRpY2ssIGkpIHtcbiAgICAgIHZhciBiYXJDYXRlZ29yeVN0YXJ0UG9zID0gdGlja1Bvc2l0aW9uW2ldW2Nvb3JkaW5hdGVJbmRleF0gLSB0aWNrR2FwIC8gMjtcbiAgICAgIHZhciBiYXJJdGVtc1N0YXJ0UG9zID0gYmFyQ2F0ZWdvcnlTdGFydFBvcyArICh0aWNrR2FwIC0gYmFyQWxsV2lkdGhBbmRHYXApIC8gMjtcbiAgICAgIHJldHVybiBiYXJJdGVtc1N0YXJ0UG9zICsgKGJhckluZGV4ICsgMC41KSAqIGJhcldpZHRoICsgYmFySW5kZXggKiBiYXJHYXA7XG4gICAgfSk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe30sIGJhciwge1xuICAgICAgYmFyTGFiZWxBeGlzUG9zOiBiYXJMYWJlbEF4aXNQb3NcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNCYXJWYWx1ZUF4aXNDb29yZGluYXRlKGJhcnMpIHtcbiAgcmV0dXJuIGJhcnMubWFwKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgZGF0YSA9ICgwLCBfdXRpbDIubWVyZ2VTYW1lU3RhY2tEYXRhKShiYXIsIGJhcnMpO1xuICAgIGRhdGEgPSBlbGltaW5hdGVOb25OdW1iZXJEYXRhKGJhciwgZGF0YSk7XG4gICAgdmFyIF9iYXIkdmFsdWVBeGlzID0gYmFyLnZhbHVlQXhpcyxcbiAgICAgICAgYXhpcyA9IF9iYXIkdmFsdWVBeGlzLmF4aXMsXG4gICAgICAgIG1pblZhbHVlID0gX2JhciR2YWx1ZUF4aXMubWluVmFsdWUsXG4gICAgICAgIG1heFZhbHVlID0gX2JhciR2YWx1ZUF4aXMubWF4VmFsdWUsXG4gICAgICAgIGxpbmVQb3NpdGlvbiA9IF9iYXIkdmFsdWVBeGlzLmxpbmVQb3NpdGlvbjtcbiAgICB2YXIgc3RhcnRQb3MgPSBnZXRWYWx1ZVBvcyhtaW5WYWx1ZSwgbWF4VmFsdWUsIG1pblZhbHVlIDwgMCA/IDAgOiBtaW5WYWx1ZSwgbGluZVBvc2l0aW9uLCBheGlzKTtcbiAgICB2YXIgZW5kUG9zID0gZGF0YS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiBnZXRWYWx1ZVBvcyhtaW5WYWx1ZSwgbWF4VmFsdWUsIHYsIGxpbmVQb3NpdGlvbiwgYXhpcyk7XG4gICAgfSk7XG4gICAgdmFyIGJhclZhbHVlQXhpc1BvcyA9IGVuZFBvcy5tYXAoZnVuY3Rpb24gKHApIHtcbiAgICAgIHJldHVybiBbc3RhcnRQb3MsIHBdO1xuICAgIH0pO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBiYXIsIHtcbiAgICAgIGJhclZhbHVlQXhpc1BvczogYmFyVmFsdWVBeGlzUG9zXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBlbGltaW5hdGVOb25OdW1iZXJEYXRhKGJhckl0ZW0sIGJhckRhdGEpIHtcbiAgdmFyIGRhdGEgPSBiYXJJdGVtLmRhdGE7XG4gIHJldHVybiBiYXJEYXRhLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiB0eXBlb2YgZGF0YVtpXSA9PT0gJ251bWJlcicgPyB2IDogbnVsbDtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQgIT09IG51bGw7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBlbGltaW5hdGVOdWxsQmFyTGFiZWxBeGlzKGJhcnMpIHtcbiAgcmV0dXJuIGJhcnMubWFwKGZ1bmN0aW9uIChiYXIpIHtcbiAgICB2YXIgYmFyTGFiZWxBeGlzUG9zID0gYmFyLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgICAgZGF0YSA9IGJhci5kYXRhO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgaWYgKHR5cGVvZiBkID09PSAnbnVtYmVyJykgcmV0dXJuO1xuICAgICAgYmFyTGFiZWxBeGlzUG9zW2ldID0gbnVsbDtcbiAgICB9KTtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZCh7fSwgYmFyLCB7XG4gICAgICBiYXJMYWJlbEF4aXNQb3M6IGJhckxhYmVsQXhpc1Bvcy5maWx0ZXIoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgcmV0dXJuIHAgIT09IG51bGw7XG4gICAgICB9KVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24ga2VlcFNhbWVOdW1CZXR3ZWVuQmFyQW5kRGF0YShiYXJzKSB7XG4gIGJhcnMuZm9yRWFjaChmdW5jdGlvbiAoYmFyKSB7XG4gICAgdmFyIGRhdGEgPSBiYXIuZGF0YSxcbiAgICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFyLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgICAgYmFyVmFsdWVBeGlzUG9zID0gYmFyLmJhclZhbHVlQXhpc1BvcztcbiAgICB2YXIgZGF0YU51bSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGQgPT09ICdudW1iZXInO1xuICAgIH0pLmxlbmd0aDtcbiAgICB2YXIgYXhpc1Bvc051bSA9IGJhckxhYmVsQXhpc1Bvcy5sZW5ndGg7XG5cbiAgICBpZiAoYXhpc1Bvc051bSA+IGRhdGFOdW0pIHtcbiAgICAgIGJhckxhYmVsQXhpc1Bvcy5zcGxpY2UoZGF0YU51bSk7XG4gICAgICBiYXJWYWx1ZUF4aXNQb3Muc3BsaWNlKGRhdGFOdW0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBiYXJzO1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZVBvcyhtaW4sIG1heCwgdmFsdWUsIGxpbmVQb3NpdGlvbiwgYXhpcykge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykgcmV0dXJuIG51bGw7XG4gIHZhciB2YWx1ZU1pbnVzID0gbWF4IC0gbWluO1xuICB2YXIgY29vcmRpbmF0ZUluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBwb3NNaW51cyA9IGxpbmVQb3NpdGlvblsxXVtjb29yZGluYXRlSW5kZXhdIC0gbGluZVBvc2l0aW9uWzBdW2Nvb3JkaW5hdGVJbmRleF07XG4gIHZhciBwZXJjZW50ID0gKHZhbHVlIC0gbWluKSAvIHZhbHVlTWludXM7XG4gIGlmICh2YWx1ZU1pbnVzID09PSAwKSBwZXJjZW50ID0gMDtcbiAgdmFyIHBvcyA9IHBlcmNlbnQgKiBwb3NNaW51cztcbiAgcmV0dXJuIHBvcyArIGxpbmVQb3NpdGlvblswXVtjb29yZGluYXRlSW5kZXhdO1xufVxuXG5mdW5jdGlvbiBnZXRCYWNrZ3JvdW5kQmFyQ29uZmlnKGJhckl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYmFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYmFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGJhckl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0QmFja2dyb3VuZEJhclNoYXBlcyhiYXJJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0QmFja2dyb3VuZEJhclN0eWxlKGJhckl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3JlY3QnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGJhckl0ZW0uYmFja2dyb3VuZEJhci5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEJhY2tncm91bmRCYXJTaGFwZXMoYmFySXRlbSkge1xuICB2YXIgbGFiZWxBeGlzID0gYmFySXRlbS5sYWJlbEF4aXMsXG4gICAgICB2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcztcbiAgdmFyIHRpY2tQb3NpdGlvbiA9IGxhYmVsQXhpcy50aWNrUG9zaXRpb247XG4gIHZhciBheGlzID0gdmFsdWVBeGlzLmF4aXMsXG4gICAgICBsaW5lUG9zaXRpb24gPSB2YWx1ZUF4aXMubGluZVBvc2l0aW9uO1xuICB2YXIgd2lkdGggPSBnZXRCYWNrZ3JvdW5kQmFyV2lkdGgoYmFySXRlbSk7XG4gIHZhciBoYWx0V2lkdGggPSB3aWR0aCAvIDI7XG4gIHZhciBwb3NJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgY2VudGVyUG9zID0gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAocCkge1xuICAgIHJldHVybiBwWzEgLSBwb3NJbmRleF07XG4gIH0pO1xuICB2YXIgX3JlZjkgPSBbbGluZVBvc2l0aW9uWzBdW3Bvc0luZGV4XSwgbGluZVBvc2l0aW9uWzFdW3Bvc0luZGV4XV0sXG4gICAgICBzdGFydCA9IF9yZWY5WzBdLFxuICAgICAgZW5kID0gX3JlZjlbMV07XG4gIHJldHVybiBjZW50ZXJQb3MubWFwKGZ1bmN0aW9uIChjZW50ZXIpIHtcbiAgICBpZiAoYXhpcyA9PT0gJ3gnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBzdGFydCxcbiAgICAgICAgeTogY2VudGVyIC0gaGFsdFdpZHRoLFxuICAgICAgICB3OiBlbmQgLSBzdGFydCxcbiAgICAgICAgaDogd2lkdGhcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IGNlbnRlciAtIGhhbHRXaWR0aCxcbiAgICAgICAgeTogZW5kLFxuICAgICAgICB3OiB3aWR0aCxcbiAgICAgICAgaDogc3RhcnQgLSBlbmRcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJhcldpZHRoKGJhckl0ZW0pIHtcbiAgdmFyIGJhckFsbFdpZHRoQW5kR2FwID0gYmFySXRlbS5iYXJBbGxXaWR0aEFuZEdhcCxcbiAgICAgIGJhckNhdGVnb3J5V2lkdGggPSBiYXJJdGVtLmJhckNhdGVnb3J5V2lkdGgsXG4gICAgICBiYWNrZ3JvdW5kQmFyID0gYmFySXRlbS5iYWNrZ3JvdW5kQmFyO1xuICB2YXIgd2lkdGggPSBiYWNrZ3JvdW5kQmFyLndpZHRoO1xuICBpZiAodHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJykgcmV0dXJuIHdpZHRoO1xuICBpZiAod2lkdGggPT09ICdhdXRvJykgcmV0dXJuIGJhckFsbFdpZHRoQW5kR2FwO1xuICByZXR1cm4gcGFyc2VJbnQod2lkdGgpIC8gMTAwICogYmFyQ2F0ZWdvcnlXaWR0aDtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEJhclN0eWxlKGJhckl0ZW0pIHtcbiAgcmV0dXJuIGJhckl0ZW0uYmFja2dyb3VuZEJhci5zdHlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFyQ29uZmlnKGJhckl0ZW0pIHtcbiAgdmFyIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBiYXJJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBiYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gYmFySXRlbS5yTGV2ZWw7XG4gIHZhciBuYW1lID0gZ2V0QmFyTmFtZShiYXJJdGVtKTtcbiAgcmV0dXJuIGJhckxhYmVsQXhpc1Bvcy5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRCYXJTaGFwZShiYXJJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRCYXJTdHlsZShiYXJJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJOYW1lKGJhckl0ZW0pIHtcbiAgdmFyIHNoYXBlVHlwZSA9IGJhckl0ZW0uc2hhcGVUeXBlO1xuICBpZiAoc2hhcGVUeXBlID09PSAnbGVmdEVjaGVsb24nIHx8IHNoYXBlVHlwZSA9PT0gJ3JpZ2h0RWNoZWxvbicpIHJldHVybiAncG9seWxpbmUnO1xuICByZXR1cm4gJ3JlY3QnO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJTaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBzaGFwZVR5cGUgPSBiYXJJdGVtLnNoYXBlVHlwZTtcblxuICBpZiAoc2hhcGVUeXBlID09PSAnbGVmdEVjaGVsb24nKSB7XG4gICAgcmV0dXJuIGdldExlZnRFY2hlbG9uU2hhcGUoYmFySXRlbSwgaSk7XG4gIH0gZWxzZSBpZiAoc2hhcGVUeXBlID09PSAncmlnaHRFY2hlbG9uJykge1xuICAgIHJldHVybiBnZXRSaWdodEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZ2V0Tm9ybWFsQmFyU2hhcGUoYmFySXRlbSwgaSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGVmdEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYmFyV2lkdGggPSBiYXJJdGVtLmJhcldpZHRoLFxuICAgICAgZWNoZWxvbk9mZnNldCA9IGJhckl0ZW0uZWNoZWxvbk9mZnNldDtcblxuICB2YXIgX2JhclZhbHVlQXhpc1BvcyRpID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaVswXSxcbiAgICAgIGVuZCA9IF9iYXJWYWx1ZUF4aXNQb3MkaVsxXTtcblxuICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICB2YXIgaGFsZldpZHRoID0gYmFyV2lkdGggLyAyO1xuICB2YXIgdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHBvaW50cyA9IFtdO1xuXG4gIGlmICh2YWx1ZUF4aXMgPT09ICd4Jykge1xuICAgIHBvaW50c1swXSA9IFtlbmQsIGxhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzFdID0gW2VuZCwgbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoXTtcbiAgICBwb2ludHNbMl0gPSBbc3RhcnQsIGxhYmVsQXhpc1BvcyArIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzNdID0gW3N0YXJ0ICsgZWNoZWxvbk9mZnNldCwgbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoXTtcbiAgICBpZiAoZW5kIC0gc3RhcnQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDMsIDEpO1xuICB9IGVsc2Uge1xuICAgIHBvaW50c1swXSA9IFtsYWJlbEF4aXNQb3MgLSBoYWxmV2lkdGgsIGVuZF07XG4gICAgcG9pbnRzWzFdID0gW2xhYmVsQXhpc1BvcyArIGhhbGZXaWR0aCwgZW5kXTtcbiAgICBwb2ludHNbMl0gPSBbbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoLCBzdGFydF07XG4gICAgcG9pbnRzWzNdID0gW2xhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aCwgc3RhcnQgLSBlY2hlbG9uT2Zmc2V0XTtcbiAgICBpZiAoc3RhcnQgLSBlbmQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDMsIDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRSaWdodEVjaGVsb25TaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYmFyV2lkdGggPSBiYXJJdGVtLmJhcldpZHRoLFxuICAgICAgZWNoZWxvbk9mZnNldCA9IGJhckl0ZW0uZWNoZWxvbk9mZnNldDtcblxuICB2YXIgX2JhclZhbHVlQXhpc1BvcyRpMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShiYXJWYWx1ZUF4aXNQb3NbaV0sIDIpLFxuICAgICAgc3RhcnQgPSBfYmFyVmFsdWVBeGlzUG9zJGkyWzBdLFxuICAgICAgZW5kID0gX2JhclZhbHVlQXhpc1BvcyRpMlsxXTtcblxuICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICB2YXIgaGFsZldpZHRoID0gYmFyV2lkdGggLyAyO1xuICB2YXIgdmFsdWVBeGlzID0gYmFySXRlbS52YWx1ZUF4aXMuYXhpcztcbiAgdmFyIHBvaW50cyA9IFtdO1xuXG4gIGlmICh2YWx1ZUF4aXMgPT09ICd4Jykge1xuICAgIHBvaW50c1swXSA9IFtlbmQsIGxhYmVsQXhpc1BvcyArIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzFdID0gW2VuZCwgbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoXTtcbiAgICBwb2ludHNbMl0gPSBbc3RhcnQsIGxhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aF07XG4gICAgcG9pbnRzWzNdID0gW3N0YXJ0ICsgZWNoZWxvbk9mZnNldCwgbGFiZWxBeGlzUG9zICsgaGFsZldpZHRoXTtcbiAgICBpZiAoZW5kIC0gc3RhcnQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDIsIDEpO1xuICB9IGVsc2Uge1xuICAgIHBvaW50c1swXSA9IFtsYWJlbEF4aXNQb3MgKyBoYWxmV2lkdGgsIGVuZF07XG4gICAgcG9pbnRzWzFdID0gW2xhYmVsQXhpc1BvcyAtIGhhbGZXaWR0aCwgZW5kXTtcbiAgICBwb2ludHNbMl0gPSBbbGFiZWxBeGlzUG9zIC0gaGFsZldpZHRoLCBzdGFydF07XG4gICAgcG9pbnRzWzNdID0gW2xhYmVsQXhpc1BvcyArIGhhbGZXaWR0aCwgc3RhcnQgLSBlY2hlbG9uT2Zmc2V0XTtcbiAgICBpZiAoc3RhcnQgLSBlbmQgPCBlY2hlbG9uT2Zmc2V0KSBwb2ludHMuc3BsaWNlKDIsIDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROb3JtYWxCYXJTaGFwZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJWYWx1ZUF4aXNQb3MgPSBiYXJJdGVtLmJhclZhbHVlQXhpc1BvcyxcbiAgICAgIGJhckxhYmVsQXhpc1BvcyA9IGJhckl0ZW0uYmFyTGFiZWxBeGlzUG9zLFxuICAgICAgYmFyV2lkdGggPSBiYXJJdGVtLmJhcldpZHRoO1xuXG4gIHZhciBfYmFyVmFsdWVBeGlzUG9zJGkzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGJhclZhbHVlQXhpc1Bvc1tpXSwgMiksXG4gICAgICBzdGFydCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTNbMF0sXG4gICAgICBlbmQgPSBfYmFyVmFsdWVBeGlzUG9zJGkzWzFdO1xuXG4gIHZhciBsYWJlbEF4aXNQb3MgPSBiYXJMYWJlbEF4aXNQb3NbaV07XG4gIHZhciB2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICB2YXIgc2hhcGUgPSB7fTtcblxuICBpZiAodmFsdWVBeGlzID09PSAneCcpIHtcbiAgICBzaGFwZS54ID0gc3RhcnQ7XG4gICAgc2hhcGUueSA9IGxhYmVsQXhpc1BvcyAtIGJhcldpZHRoIC8gMjtcbiAgICBzaGFwZS53ID0gZW5kIC0gc3RhcnQ7XG4gICAgc2hhcGUuaCA9IGJhcldpZHRoO1xuICB9IGVsc2Uge1xuICAgIHNoYXBlLnggPSBsYWJlbEF4aXNQb3MgLSBiYXJXaWR0aCAvIDI7XG4gICAgc2hhcGUueSA9IGVuZDtcbiAgICBzaGFwZS53ID0gYmFyV2lkdGg7XG4gICAgc2hhcGUuaCA9IHN0YXJ0IC0gZW5kO1xuICB9XG5cbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRCYXJTdHlsZShiYXJJdGVtLCBpKSB7XG4gIHZhciBiYXJTdHlsZSA9IGJhckl0ZW0uYmFyU3R5bGUsXG4gICAgICBncmFkaWVudCA9IGJhckl0ZW0uZ3JhZGllbnQsXG4gICAgICBjb2xvciA9IGJhckl0ZW0uY29sb3IsXG4gICAgICBpbmRlcGVuZGVudENvbG9yID0gYmFySXRlbS5pbmRlcGVuZGVudENvbG9yLFxuICAgICAgaW5kZXBlbmRlbnRDb2xvcnMgPSBiYXJJdGVtLmluZGVwZW5kZW50Q29sb3JzO1xuICB2YXIgZmlsbENvbG9yID0gW2JhclN0eWxlLmZpbGwgfHwgY29sb3JdO1xuICB2YXIgZ3JhZGllbnRDb2xvciA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKShmaWxsQ29sb3IsIGdyYWRpZW50LmNvbG9yKTtcblxuICBpZiAoaW5kZXBlbmRlbnRDb2xvcikge1xuICAgIHZhciBpZHRDb2xvciA9IGluZGVwZW5kZW50Q29sb3JzW2kgJSBpbmRlcGVuZGVudENvbG9ycy5sZW5ndGhdO1xuICAgIGdyYWRpZW50Q29sb3IgPSBpZHRDb2xvciBpbnN0YW5jZW9mIEFycmF5ID8gaWR0Q29sb3IgOiBbaWR0Q29sb3JdO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50Q29sb3IubGVuZ3RoID09PSAxKSBncmFkaWVudENvbG9yLnB1c2goZ3JhZGllbnRDb2xvclswXSk7XG4gIHZhciBncmFkaWVudFBhcmFtcyA9IGdldEdyYWRpZW50UGFyYW1zKGJhckl0ZW0sIGkpO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBncmFkaWVudENvbG9yOiBncmFkaWVudENvbG9yLFxuICAgIGdyYWRpZW50UGFyYW1zOiBncmFkaWVudFBhcmFtcyxcbiAgICBncmFkaWVudFR5cGU6ICdsaW5lYXInLFxuICAgIGdyYWRpZW50V2l0aDogJ2ZpbGwnXG4gIH0sIGJhclN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0R3JhZGllbnRQYXJhbXMoYmFySXRlbSwgaSkge1xuICB2YXIgYmFyVmFsdWVBeGlzUG9zID0gYmFySXRlbS5iYXJWYWx1ZUF4aXNQb3MsXG4gICAgICBiYXJMYWJlbEF4aXNQb3MgPSBiYXJJdGVtLmJhckxhYmVsQXhpc1BvcyxcbiAgICAgIGRhdGEgPSBiYXJJdGVtLmRhdGE7XG4gIHZhciBfYmFySXRlbSR2YWx1ZUF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcyxcbiAgICAgIGxpbmVQb3NpdGlvbiA9IF9iYXJJdGVtJHZhbHVlQXhpcy5saW5lUG9zaXRpb24sXG4gICAgICBheGlzID0gX2Jhckl0ZW0kdmFsdWVBeGlzLmF4aXM7XG5cbiAgdmFyIF9iYXJWYWx1ZUF4aXNQb3MkaTQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoYmFyVmFsdWVBeGlzUG9zW2ldLCAyKSxcbiAgICAgIHN0YXJ0ID0gX2JhclZhbHVlQXhpc1BvcyRpNFswXSxcbiAgICAgIGVuZCA9IF9iYXJWYWx1ZUF4aXNQb3MkaTRbMV07XG5cbiAgdmFyIGxhYmVsQXhpc1BvcyA9IGJhckxhYmVsQXhpc1Bvc1tpXTtcbiAgdmFyIHZhbHVlID0gZGF0YVtpXTtcblxuICB2YXIgX2xpbmVQb3NpdGlvbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lUG9zaXRpb24sIDIpLFxuICAgICAgbGluZVN0YXJ0ID0gX2xpbmVQb3NpdGlvblswXSxcbiAgICAgIGxpbmVFbmQgPSBfbGluZVBvc2l0aW9uWzFdO1xuXG4gIHZhciB2YWx1ZUF4aXNJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgZW5kUG9zID0gZW5kO1xuXG4gIGlmICghYmFySXRlbS5ncmFkaWVudC5sb2NhbCkge1xuICAgIGVuZFBvcyA9IHZhbHVlIDwgMCA/IGxpbmVTdGFydFt2YWx1ZUF4aXNJbmRleF0gOiBsaW5lRW5kW3ZhbHVlQXhpc0luZGV4XTtcbiAgfVxuXG4gIGlmIChheGlzID09PSAneScpIHtcbiAgICByZXR1cm4gW2xhYmVsQXhpc1BvcywgZW5kUG9zLCBsYWJlbEF4aXNQb3MsIHN0YXJ0XTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gW2VuZFBvcywgbGFiZWxBeGlzUG9zLCBzdGFydCwgbGFiZWxBeGlzUG9zXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTdGFydEJhckNvbmZpZyhiYXJJdGVtKSB7XG4gIHZhciBjb25maWdzID0gZ2V0QmFyQ29uZmlnKGJhckl0ZW0pO1xuICB2YXIgc2hhcGVUeXBlID0gYmFySXRlbS5zaGFwZVR5cGU7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgdmFyIHNoYXBlID0gY29uZmlnLnNoYXBlO1xuXG4gICAgaWYgKHNoYXBlVHlwZSA9PT0gJ2xlZnRFY2hlbG9uJykge1xuICAgICAgc2hhcGUgPSBnZXRTdGFydExlZnRFY2hlbG9uU2hhcGUoc2hhcGUsIGJhckl0ZW0pO1xuICAgIH0gZWxzZSBpZiAoc2hhcGVUeXBlID09PSAncmlnaHRFY2hlbG9uJykge1xuICAgICAgc2hhcGUgPSBnZXRTdGFydFJpZ2h0RWNoZWxvblNoYXBlKHNoYXBlLCBiYXJJdGVtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2hhcGUgPSBnZXRTdGFydE5vcm1hbEJhclNoYXBlKHNoYXBlLCBiYXJJdGVtKTtcbiAgICB9XG5cbiAgICBjb25maWcuc2hhcGUgPSBzaGFwZTtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydExlZnRFY2hlbG9uU2hhcGUoc2hhcGUsIGJhckl0ZW0pIHtcbiAgdmFyIGF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICBzaGFwZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKHNoYXBlKTtcbiAgdmFyIF9zaGFwZSA9IHNoYXBlLFxuICAgICAgcG9pbnRzID0gX3NoYXBlLnBvaW50cztcbiAgdmFyIGluZGV4ID0gYXhpcyA9PT0gJ3gnID8gMCA6IDE7XG4gIHZhciBzdGFydCA9IHBvaW50c1syXVtpbmRleF07XG4gIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCkge1xuICAgIHJldHVybiBwb2ludFtpbmRleF0gPSBzdGFydDtcbiAgfSk7XG4gIHJldHVybiBzaGFwZTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRSaWdodEVjaGVsb25TaGFwZShzaGFwZSwgYmFySXRlbSkge1xuICB2YXIgYXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHNoYXBlID0gKDAsIF91dGlsLmRlZXBDbG9uZSkoc2hhcGUpO1xuICB2YXIgX3NoYXBlMiA9IHNoYXBlLFxuICAgICAgcG9pbnRzID0gX3NoYXBlMi5wb2ludHM7XG4gIHZhciBpbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgc3RhcnQgPSBwb2ludHNbMl1baW5kZXhdO1xuICBwb2ludHMuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQpIHtcbiAgICByZXR1cm4gcG9pbnRbaW5kZXhdID0gc3RhcnQ7XG4gIH0pO1xuICByZXR1cm4gc2hhcGU7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0Tm9ybWFsQmFyU2hhcGUoc2hhcGUsIGJhckl0ZW0pIHtcbiAgdmFyIGF4aXMgPSBiYXJJdGVtLnZhbHVlQXhpcy5heGlzO1xuICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICB5ID0gc2hhcGUueSxcbiAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgaCA9IHNoYXBlLmg7XG5cbiAgaWYgKGF4aXMgPT09ICd4Jykge1xuICAgIHcgPSAwO1xuICB9IGVsc2Uge1xuICAgIHkgPSB5ICsgaDtcbiAgICBoID0gMDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeDogeCxcbiAgICB5OiB5LFxuICAgIHc6IHcsXG4gICAgaDogaFxuICB9O1xufVxuXG5mdW5jdGlvbiBiZWZvcmVVcGRhdGVCYXIoZ3JhcGhzLCBiYXJJdGVtLCBpLCB1cGRhdGVyKSB7XG4gIHZhciByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcjtcbiAgdmFyIG5hbWUgPSBnZXRCYXJOYW1lKGJhckl0ZW0pO1xuXG4gIGlmIChncmFwaHNbaV0gJiYgZ3JhcGhzW2ldWzBdLm5hbWUgIT09IG5hbWUpIHtcbiAgICBncmFwaHNbaV0uZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgICAgcmV0dXJuIHJlbmRlci5kZWxHcmFwaChnKTtcbiAgICB9KTtcbiAgICBncmFwaHNbaV0gPSBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsQ29uZmlnKGJhckl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gYmFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gYmFySXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGJhckl0ZW0uckxldmVsO1xuICB2YXIgc2hhcGVzID0gZ2V0TGFiZWxTaGFwZXMoYmFySXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldExhYmVsU3R5bGUoYmFySXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogYmFySXRlbS5sYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU2hhcGVzKGJhckl0ZW0pIHtcbiAgdmFyIGNvbnRlbnRzID0gZ2V0Rm9ybWF0dGVyTGFiZWxzKGJhckl0ZW0pO1xuICB2YXIgcG9zaXRpb24gPSBnZXRMYWJlbHNQb3NpdGlvbihiYXJJdGVtKTtcbiAgcmV0dXJuIHBvc2l0aW9uLm1hcChmdW5jdGlvbiAocG9zLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBwb3MsXG4gICAgICBjb250ZW50OiBjb250ZW50c1tpXVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRGb3JtYXR0ZXJMYWJlbHMoYmFySXRlbSkge1xuICB2YXIgZGF0YSA9IGJhckl0ZW0uZGF0YSxcbiAgICAgIGxhYmVsID0gYmFySXRlbS5sYWJlbDtcbiAgdmFyIGZvcm1hdHRlciA9IGxhYmVsLmZvcm1hdHRlcjtcbiAgZGF0YSA9IGRhdGEuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAnbnVtYmVyJztcbiAgfSkubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGQudG9TdHJpbmcoKTtcbiAgfSk7XG4gIGlmICghZm9ybWF0dGVyKSByZXR1cm4gZGF0YTtcbiAgdmFyIHR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsIGQpO1xuICB9KTtcbiAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZCwgaSkge1xuICAgIHJldHVybiBmb3JtYXR0ZXIoe1xuICAgICAgdmFsdWU6IGQsXG4gICAgICBpbmRleDogaVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsc1Bvc2l0aW9uKGJhckl0ZW0pIHtcbiAgdmFyIGxhYmVsID0gYmFySXRlbS5sYWJlbCxcbiAgICAgIGJhclZhbHVlQXhpc1BvcyA9IGJhckl0ZW0uYmFyVmFsdWVBeGlzUG9zLFxuICAgICAgYmFyTGFiZWxBeGlzUG9zID0gYmFySXRlbS5iYXJMYWJlbEF4aXNQb3M7XG4gIHZhciBwb3NpdGlvbiA9IGxhYmVsLnBvc2l0aW9uLFxuICAgICAgb2Zmc2V0ID0gbGFiZWwub2Zmc2V0O1xuICB2YXIgYXhpcyA9IGJhckl0ZW0udmFsdWVBeGlzLmF4aXM7XG4gIHJldHVybiBiYXJWYWx1ZUF4aXNQb3MubWFwKGZ1bmN0aW9uIChfcmVmMTAsIGkpIHtcbiAgICB2YXIgX3JlZjExID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMCwgMiksXG4gICAgICAgIHN0YXJ0ID0gX3JlZjExWzBdLFxuICAgICAgICBlbmQgPSBfcmVmMTFbMV07XG5cbiAgICB2YXIgbGFiZWxBeGlzUG9zID0gYmFyTGFiZWxBeGlzUG9zW2ldO1xuICAgIHZhciBwb3MgPSBbZW5kLCBsYWJlbEF4aXNQb3NdO1xuXG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgcG9zID0gW3N0YXJ0LCBsYWJlbEF4aXNQb3NdO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2NlbnRlcicpIHtcbiAgICAgIHBvcyA9IFsoc3RhcnQgKyBlbmQpIC8gMiwgbGFiZWxBeGlzUG9zXTtcbiAgICB9XG5cbiAgICBpZiAoYXhpcyA9PT0gJ3knKSBwb3MucmV2ZXJzZSgpO1xuICAgIHJldHVybiBnZXRPZmZzZXRlZFBvaW50KHBvcywgb2Zmc2V0KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldE9mZnNldGVkUG9pbnQoX3JlZjEyLCBfcmVmMTMpIHtcbiAgdmFyIF9yZWYxNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTIsIDIpLFxuICAgICAgeCA9IF9yZWYxNFswXSxcbiAgICAgIHkgPSBfcmVmMTRbMV07XG5cbiAgdmFyIF9yZWYxNSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTMsIDIpLFxuICAgICAgb3ggPSBfcmVmMTVbMF0sXG4gICAgICBveSA9IF9yZWYxNVsxXTtcblxuICByZXR1cm4gW3ggKyBveCwgeSArIG95XTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTdHlsZShiYXJJdGVtKSB7XG4gIHZhciBjb2xvciA9IGJhckl0ZW0uY29sb3IsXG4gICAgICBzdHlsZSA9IGJhckl0ZW0ubGFiZWwuc3R5bGUsXG4gICAgICBnYyA9IGJhckl0ZW0uZ3JhZGllbnQuY29sb3I7XG4gIGlmIChnYy5sZW5ndGgpIGNvbG9yID0gZ2NbMF07XG4gIHN0eWxlID0gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBzdHlsZSk7XG4gIHJldHVybiBzdHlsZTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmdhdWdlID0gZ2F1Z2U7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2dhdWdlID0gcmVxdWlyZShcIi4uL2NvbmZpZy9nYXVnZVwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbnZhciBfY29sb3IgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jb2xvclwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIGdhdWdlKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgaWYgKCFzZXJpZXMpIHNlcmllcyA9IFtdO1xuICB2YXIgZ2F1Z2VzID0gKDAsIF91dGlsMi5pbml0TmVlZFNlcmllcykoc2VyaWVzLCBfZ2F1Z2UuZ2F1Z2VDb25maWcsICdnYXVnZScpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzQ2VudGVyKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzUmFkaXVzKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzRGF0YVJhZGl1c0FuZExpbmVXaWR0aChnYXVnZXMsIGNoYXJ0KTtcbiAgZ2F1Z2VzID0gY2FsY0dhdWdlc0RhdGFBbmdsZXMoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNEYXRhR3JhZGllbnQoZ2F1Z2VzLCBjaGFydCk7XG4gIGdhdWdlcyA9IGNhbGNHYXVnZXNBeGlzVGlja1Bvc2l0aW9uKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzTGFiZWxQb3NpdGlvbkFuZEFsaWduKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzTGFiZWxEYXRhKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzRGV0YWlsc1Bvc2l0aW9uKGdhdWdlcywgY2hhcnQpO1xuICBnYXVnZXMgPSBjYWxjR2F1Z2VzRGV0YWlsc0NvbnRlbnQoZ2F1Z2VzLCBjaGFydCk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZUF4aXNUaWNrJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXhpc1RpY2tDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZUF4aXNMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEF4aXNMYWJlbENvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlQmFja2dyb3VuZEFyYycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldEJhY2tncm91bmRBcmNDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRCYWNrZ3JvdW5kQXJjQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBnYXVnZXMsXG4gICAga2V5OiAnZ2F1Z2VBcmMnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRBcmNDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRBcmNDb25maWcsXG4gICAgYmVmb3JlQ2hhbmdlOiBiZWZvcmVDaGFuZ2VBcmNcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGdhdWdlcyxcbiAgICBrZXk6ICdnYXVnZVBvaW50ZXInLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRQb2ludGVyQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0UG9pbnRlckNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogZ2F1Z2VzLFxuICAgIGtleTogJ2dhdWdlRGV0YWlscycsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldERldGFpbHNDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNDZW50ZXIoZ2F1Z2VzLCBjaGFydCkge1xuICB2YXIgYXJlYSA9IGNoYXJ0LnJlbmRlci5hcmVhO1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXI7XG4gICAgY2VudGVyID0gY2VudGVyLm1hcChmdW5jdGlvbiAocG9zLCBpKSB7XG4gICAgICBpZiAodHlwZW9mIHBvcyA9PT0gJ251bWJlcicpIHJldHVybiBwb3M7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocG9zKSAvIDEwMCAqIGFyZWFbaV07XG4gICAgfSk7XG4gICAgZ2F1Z2VJdGVtLmNlbnRlciA9IGNlbnRlcjtcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNSYWRpdXMoZ2F1Z2VzLCBjaGFydCkge1xuICB2YXIgYXJlYSA9IGNoYXJ0LnJlbmRlci5hcmVhO1xuICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhcmVhKSkgLyAyO1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIHJhZGl1cyA9IGdhdWdlSXRlbS5yYWRpdXM7XG5cbiAgICBpZiAodHlwZW9mIHJhZGl1cyAhPT0gJ251bWJlcicpIHtcbiAgICAgIHJhZGl1cyA9IHBhcnNlSW50KHJhZGl1cykgLyAxMDAgKiBtYXhSYWRpdXM7XG4gICAgfVxuXG4gICAgZ2F1Z2VJdGVtLnJhZGl1cyA9IHJhZGl1cztcbiAgfSk7XG4gIHJldHVybiBnYXVnZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNHYXVnZXNEYXRhUmFkaXVzQW5kTGluZVdpZHRoKGdhdWdlcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgdmFyIG1heFJhZGl1cyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXJlYSkpIC8gMjtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciByYWRpdXMgPSBnYXVnZUl0ZW0ucmFkaXVzLFxuICAgICAgICBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICAgIGFyY0xpbmVXaWR0aCA9IGdhdWdlSXRlbS5hcmNMaW5lV2lkdGg7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgYXJjUmFkaXVzID0gaXRlbS5yYWRpdXMsXG4gICAgICAgICAgbGluZVdpZHRoID0gaXRlbS5saW5lV2lkdGg7XG4gICAgICBpZiAoIWFyY1JhZGl1cykgYXJjUmFkaXVzID0gcmFkaXVzO1xuICAgICAgaWYgKHR5cGVvZiBhcmNSYWRpdXMgIT09ICdudW1iZXInKSBhcmNSYWRpdXMgPSBwYXJzZUludChhcmNSYWRpdXMpIC8gMTAwICogbWF4UmFkaXVzO1xuICAgICAgaXRlbS5yYWRpdXMgPSBhcmNSYWRpdXM7XG4gICAgICBpZiAoIWxpbmVXaWR0aCkgbGluZVdpZHRoID0gYXJjTGluZVdpZHRoO1xuICAgICAgaXRlbS5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzRGF0YUFuZ2xlcyhnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgc3RhcnRBbmdsZSA9IGdhdWdlSXRlbS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IGdhdWdlSXRlbS5lbmRBbmdsZSxcbiAgICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgICBtaW4gPSBnYXVnZUl0ZW0ubWluLFxuICAgICAgICBtYXggPSBnYXVnZUl0ZW0ubWF4O1xuICAgIHZhciBhbmdsZU1pbnVzID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuICAgIHZhciB2YWx1ZU1pbnVzID0gbWF4IC0gbWluO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIHZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICAgIHZhciBpdGVtQW5nbGUgPSBNYXRoLmFicygodmFsdWUgLSBtaW4pIC8gdmFsdWVNaW51cyAqIGFuZ2xlTWludXMpO1xuICAgICAgaXRlbS5zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICAgIGl0ZW0uZW5kQW5nbGUgPSBzdGFydEFuZ2xlICsgaXRlbUFuZ2xlO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0RhdGFHcmFkaWVudChnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbG9yID0gaXRlbS5jb2xvcixcbiAgICAgICAgICBncmFkaWVudCA9IGl0ZW0uZ3JhZGllbnQ7XG4gICAgICBpZiAoIWdyYWRpZW50IHx8ICFncmFkaWVudC5sZW5ndGgpIGdyYWRpZW50ID0gY29sb3I7XG4gICAgICBpZiAoIShncmFkaWVudCBpbnN0YW5jZW9mIEFycmF5KSkgZ3JhZGllbnQgPSBbZ3JhZGllbnRdO1xuICAgICAgaXRlbS5ncmFkaWVudCA9IGdyYWRpZW50O1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0F4aXNUaWNrUG9zaXRpb24oZ2F1Z2VzLCBjaGFydCkge1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2VJdGVtKSB7XG4gICAgdmFyIHN0YXJ0QW5nbGUgPSBnYXVnZUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBnYXVnZUl0ZW0uZW5kQW5nbGUsXG4gICAgICAgIHNwbGl0TnVtID0gZ2F1Z2VJdGVtLnNwbGl0TnVtLFxuICAgICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyLFxuICAgICAgICByYWRpdXMgPSBnYXVnZUl0ZW0ucmFkaXVzLFxuICAgICAgICBhcmNMaW5lV2lkdGggPSBnYXVnZUl0ZW0uYXJjTGluZVdpZHRoLFxuICAgICAgICBheGlzVGljayA9IGdhdWdlSXRlbS5heGlzVGljaztcbiAgICB2YXIgdGlja0xlbmd0aCA9IGF4aXNUaWNrLnRpY2tMZW5ndGgsXG4gICAgICAgIGxpbmVXaWR0aCA9IGF4aXNUaWNrLnN0eWxlLmxpbmVXaWR0aDtcbiAgICB2YXIgYW5nbGVzID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuICAgIHZhciBvdXRlclJhZGl1cyA9IHJhZGl1cyAtIGFyY0xpbmVXaWR0aCAvIDI7XG4gICAgdmFyIGlubmVyUmFkaXVzID0gb3V0ZXJSYWRpdXMgLSB0aWNrTGVuZ3RoO1xuICAgIHZhciBhbmdsZUdhcCA9IGFuZ2xlcyAvIChzcGxpdE51bSAtIDEpO1xuICAgIHZhciBhcmNMZW5ndGggPSAyICogTWF0aC5QSSAqIHJhZGl1cyAqIGFuZ2xlcyAvIChNYXRoLlBJICogMik7XG4gICAgdmFyIG9mZnNldCA9IE1hdGguY2VpbChsaW5lV2lkdGggLyAyKSAvIGFyY0xlbmd0aCAqIGFuZ2xlcztcbiAgICBnYXVnZUl0ZW0udGlja0FuZ2xlcyA9IFtdO1xuICAgIGdhdWdlSXRlbS50aWNrSW5uZXJSYWRpdXMgPSBbXTtcbiAgICBnYXVnZUl0ZW0udGlja1Bvc2l0aW9uID0gbmV3IEFycmF5KHNwbGl0TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICB2YXIgYW5nbGUgPSBzdGFydEFuZ2xlICsgYW5nbGVHYXAgKiBpO1xuICAgICAgaWYgKGkgPT09IDApIGFuZ2xlICs9IG9mZnNldDtcbiAgICAgIGlmIChpID09PSBzcGxpdE51bSAtIDEpIGFuZ2xlIC09IG9mZnNldDtcbiAgICAgIGdhdWdlSXRlbS50aWNrQW5nbGVzW2ldID0gYW5nbGU7XG4gICAgICBnYXVnZUl0ZW0udGlja0lubmVyUmFkaXVzW2ldID0gaW5uZXJSYWRpdXM7XG4gICAgICByZXR1cm4gW191dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbb3V0ZXJSYWRpdXMsIGFuZ2xlXSkpLCBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW2lubmVyUmFkaXVzLCBhbmdsZV0pKV07XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZ2F1Z2VzO1xufVxuXG5mdW5jdGlvbiBjYWxjR2F1Z2VzTGFiZWxQb3NpdGlvbkFuZEFsaWduKGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyLFxuICAgICAgICB0aWNrSW5uZXJSYWRpdXMgPSBnYXVnZUl0ZW0udGlja0lubmVyUmFkaXVzLFxuICAgICAgICB0aWNrQW5nbGVzID0gZ2F1Z2VJdGVtLnRpY2tBbmdsZXMsXG4gICAgICAgIGxhYmVsR2FwID0gZ2F1Z2VJdGVtLmF4aXNMYWJlbC5sYWJlbEdhcDtcbiAgICB2YXIgcG9zaXRpb24gPSB0aWNrQW5nbGVzLm1hcChmdW5jdGlvbiAoYW5nbGUsIGkpIHtcbiAgICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3RpY2tJbm5lclJhZGl1c1tpXSAtIGxhYmVsR2FwLCB0aWNrQW5nbGVzW2ldXSkpO1xuICAgIH0pO1xuICAgIHZhciBhbGlnbiA9IHBvc2l0aW9uLm1hcChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIF9yZWYyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYsIDIpLFxuICAgICAgICAgIHggPSBfcmVmMlswXSxcbiAgICAgICAgICB5ID0gX3JlZjJbMV07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHRBbGlnbjogeCA+IGNlbnRlclswXSA/ICdyaWdodCcgOiAnbGVmdCcsXG4gICAgICAgIHRleHRCYXNlbGluZTogeSA+IGNlbnRlclsxXSA/ICdib3R0b20nIDogJ3RvcCdcbiAgICAgIH07XG4gICAgfSk7XG4gICAgZ2F1Z2VJdGVtLmxhYmVsUG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICBnYXVnZUl0ZW0ubGFiZWxBbGlnbiA9IGFsaWduO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0xhYmVsRGF0YShnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgYXhpc0xhYmVsID0gZ2F1Z2VJdGVtLmF4aXNMYWJlbCxcbiAgICAgICAgbWluID0gZ2F1Z2VJdGVtLm1pbixcbiAgICAgICAgbWF4ID0gZ2F1Z2VJdGVtLm1heCxcbiAgICAgICAgc3BsaXROdW0gPSBnYXVnZUl0ZW0uc3BsaXROdW07XG4gICAgdmFyIGRhdGEgPSBheGlzTGFiZWwuZGF0YSxcbiAgICAgICAgZm9ybWF0dGVyID0gYXhpc0xhYmVsLmZvcm1hdHRlcjtcbiAgICB2YXIgdmFsdWVHYXAgPSAobWF4IC0gbWluKSAvIChzcGxpdE51bSAtIDEpO1xuICAgIHZhciB2YWx1ZSA9IG5ldyBBcnJheShzcGxpdE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KG1pbiArIHZhbHVlR2FwICogaSk7XG4gICAgfSk7XG4gICAgdmFyIGZvcm1hdHRlclR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICAgIGRhdGEgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkodmFsdWUsIGRhdGEpLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgdmFyIGxhYmVsID0gdjtcblxuICAgICAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGxhYmVsID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCB2KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgbGFiZWwgPSBmb3JtYXR0ZXIoe1xuICAgICAgICAgIHZhbHVlOiB2LFxuICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGFiZWw7XG4gICAgfSk7XG4gICAgYXhpc0xhYmVsLmRhdGEgPSBkYXRhO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0RldGFpbHNQb3NpdGlvbihnYXVnZXMsIGNoYXJ0KSB7XG4gIGdhdWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChnYXVnZUl0ZW0pIHtcbiAgICB2YXIgZGF0YSA9IGdhdWdlSXRlbS5kYXRhLFxuICAgICAgICBkZXRhaWxzID0gZ2F1Z2VJdGVtLmRldGFpbHMsXG4gICAgICAgIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXI7XG4gICAgdmFyIHBvc2l0aW9uID0gZGV0YWlscy5wb3NpdGlvbixcbiAgICAgICAgb2Zmc2V0ID0gZGV0YWlscy5vZmZzZXQ7XG4gICAgdmFyIGRldGFpbHNQb3NpdGlvbiA9IGRhdGEubWFwKGZ1bmN0aW9uIChfcmVmMykge1xuICAgICAgdmFyIHN0YXJ0QW5nbGUgPSBfcmVmMy5zdGFydEFuZ2xlLFxuICAgICAgICAgIGVuZEFuZ2xlID0gX3JlZjMuZW5kQW5nbGUsXG4gICAgICAgICAgcmFkaXVzID0gX3JlZjMucmFkaXVzO1xuICAgICAgdmFyIHBvaW50ID0gbnVsbDtcblxuICAgICAgaWYgKHBvc2l0aW9uID09PSAnY2VudGVyJykge1xuICAgICAgICBwb2ludCA9IGNlbnRlcjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdzdGFydCcpIHtcbiAgICAgICAgcG9pbnQgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyKS5jb25jYXQoW3JhZGl1cywgc3RhcnRBbmdsZV0pKTtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdlbmQnKSB7XG4gICAgICAgIHBvaW50ID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtyYWRpdXMsIGVuZEFuZ2xlXSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0T2Zmc2V0ZWRQb2ludChwb2ludCwgb2Zmc2V0KTtcbiAgICB9KTtcbiAgICBnYXVnZUl0ZW0uZGV0YWlsc1Bvc2l0aW9uID0gZGV0YWlsc1Bvc2l0aW9uO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gY2FsY0dhdWdlc0RldGFpbHNDb250ZW50KGdhdWdlcywgY2hhcnQpIHtcbiAgZ2F1Z2VzLmZvckVhY2goZnVuY3Rpb24gKGdhdWdlSXRlbSkge1xuICAgIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICAgIGRldGFpbHMgPSBnYXVnZUl0ZW0uZGV0YWlscztcbiAgICB2YXIgZm9ybWF0dGVyID0gZGV0YWlscy5mb3JtYXR0ZXI7XG4gICAgdmFyIGZvcm1hdHRlclR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICAgIHZhciBjb250ZW50cyA9IGRhdGEubWFwKGZ1bmN0aW9uIChkYXRhSXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBkYXRhSXRlbS52YWx1ZTtcblxuICAgICAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnRlbnQgPSBmb3JtYXR0ZXIucmVwbGFjZSgne3ZhbHVlfScsICd7bnR9Jyk7XG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoJ3tuYW1lfScsIGRhdGFJdGVtLm5hbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykgY29udGVudCA9IGZvcm1hdHRlcihkYXRhSXRlbSk7XG4gICAgICByZXR1cm4gY29udGVudC50b1N0cmluZygpO1xuICAgIH0pO1xuICAgIGdhdWdlSXRlbS5kZXRhaWxzQ29udGVudCA9IGNvbnRlbnRzO1xuICB9KTtcbiAgcmV0dXJuIGdhdWdlcztcbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0ZWRQb2ludChfcmVmNCwgX3JlZjUpIHtcbiAgdmFyIF9yZWY2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY0LCAyKSxcbiAgICAgIHggPSBfcmVmNlswXSxcbiAgICAgIHkgPSBfcmVmNlsxXTtcblxuICB2YXIgX3JlZjcgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjUsIDIpLFxuICAgICAgb3ggPSBfcmVmN1swXSxcbiAgICAgIG95ID0gX3JlZjdbMV07XG5cbiAgcmV0dXJuIFt4ICsgb3gsIHkgKyBveV07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNUaWNrQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgdGlja1Bvc2l0aW9uID0gZ2F1Z2VJdGVtLnRpY2tQb3NpdGlvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICByZXR1cm4gdGlja1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogZ2F1Z2VJdGVtLmF4aXNUaWNrLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0QXhpc1RpY2tTaGFwZShnYXVnZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEF4aXNUaWNrU3R5bGUoZ2F1Z2VJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzVGlja1NoYXBlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgdGlja1Bvc2l0aW9uID0gZ2F1Z2VJdGVtLnRpY2tQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IHRpY2tQb3NpdGlvbltpXVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzVGlja1N0eWxlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgc3R5bGUgPSBnYXVnZUl0ZW0uYXhpc1RpY2suc3R5bGU7XG4gIHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmVsQ29uZmlnKGdhdWdlSXRlbSkge1xuICB2YXIgbGFiZWxQb3NpdGlvbiA9IGdhdWdlSXRlbS5sYWJlbFBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGdhdWdlSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdhdWdlSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBsYWJlbFBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBnYXVnZUl0ZW0uYXhpc0xhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0QXhpc0xhYmVsU2hhcGUoZ2F1Z2VJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRBeGlzTGFiZWxTdHlsZShnYXVnZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbFNoYXBlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgbGFiZWxQb3NpdGlvbiA9IGdhdWdlSXRlbS5sYWJlbFBvc2l0aW9uLFxuICAgICAgZGF0YSA9IGdhdWdlSXRlbS5heGlzTGFiZWwuZGF0YTtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBkYXRhW2ldLnRvU3RyaW5nKCksXG4gICAgcG9zaXRpb246IGxhYmVsUG9zaXRpb25baV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmVsU3R5bGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBsYWJlbEFsaWduID0gZ2F1Z2VJdGVtLmxhYmVsQWxpZ24sXG4gICAgICBheGlzTGFiZWwgPSBnYXVnZUl0ZW0uYXhpc0xhYmVsO1xuICB2YXIgc3R5bGUgPSBheGlzTGFiZWwuc3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoX29iamVjdFNwcmVhZCh7fSwgbGFiZWxBbGlnbltpXSksIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0QmFja2dyb3VuZEFyY0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAnYXJjJyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIHZpc2libGU6IGdhdWdlSXRlbS5iYWNrZ3JvdW5kQXJjLnNob3csXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0R2F1Z2VCYWNrZ3JvdW5kQXJjU2hhcGUoZ2F1Z2VJdGVtKSxcbiAgICBzdHlsZTogZ2V0R2F1Z2VCYWNrZ3JvdW5kQXJjU3R5bGUoZ2F1Z2VJdGVtKVxuICB9XTtcbn1cblxuZnVuY3Rpb24gZ2V0R2F1Z2VCYWNrZ3JvdW5kQXJjU2hhcGUoZ2F1Z2VJdGVtKSB7XG4gIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGdhdWdlSXRlbS5lbmRBbmdsZSxcbiAgICAgIGNlbnRlciA9IGdhdWdlSXRlbS5jZW50ZXIsXG4gICAgICByYWRpdXMgPSBnYXVnZUl0ZW0ucmFkaXVzO1xuICByZXR1cm4ge1xuICAgIHJ4OiBjZW50ZXJbMF0sXG4gICAgcnk6IGNlbnRlclsxXSxcbiAgICByOiByYWRpdXMsXG4gICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSxcbiAgICBlbmRBbmdsZTogZW5kQW5nbGVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0R2F1Z2VCYWNrZ3JvdW5kQXJjU3R5bGUoZ2F1Z2VJdGVtKSB7XG4gIHZhciBiYWNrZ3JvdW5kQXJjID0gZ2F1Z2VJdGVtLmJhY2tncm91bmRBcmMsXG4gICAgICBhcmNMaW5lV2lkdGggPSBnYXVnZUl0ZW0uYXJjTGluZVdpZHRoO1xuICB2YXIgc3R5bGUgPSBiYWNrZ3JvdW5kQXJjLnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBsaW5lV2lkdGg6IGFyY0xpbmVXaWR0aFxuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0QmFja2dyb3VuZEFyY0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGNvbmZpZyA9IGdldEJhY2tncm91bmRBcmNDb25maWcoZ2F1Z2VJdGVtKVswXTtcblxuICB2YXIgc2hhcGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBjb25maWcuc2hhcGUpO1xuXG4gIHNoYXBlLmVuZEFuZ2xlID0gY29uZmlnLnNoYXBlLnN0YXJ0QW5nbGU7XG4gIGNvbmZpZy5zaGFwZSA9IHNoYXBlO1xuICByZXR1cm4gW2NvbmZpZ107XG59XG5cbmZ1bmN0aW9uIGdldEFyY0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBnYXVnZUl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnYWdBcmMnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRHYXVnZUFyY1NoYXBlKGdhdWdlSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0R2F1Z2VBcmNTdHlsZShnYXVnZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEdhdWdlQXJjU2hhcGUoZ2F1Z2VJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyLFxuICAgICAgZ3JhZGllbnRFbmRBbmdsZSA9IGdhdWdlSXRlbS5lbmRBbmdsZTtcbiAgdmFyIF9kYXRhJGkgPSBkYXRhW2ldLFxuICAgICAgcmFkaXVzID0gX2RhdGEkaS5yYWRpdXMsXG4gICAgICBzdGFydEFuZ2xlID0gX2RhdGEkaS5zdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUgPSBfZGF0YSRpLmVuZEFuZ2xlLFxuICAgICAgbG9jYWxHcmFkaWVudCA9IF9kYXRhJGkubG9jYWxHcmFkaWVudDtcbiAgaWYgKGxvY2FsR3JhZGllbnQpIGdyYWRpZW50RW5kQW5nbGUgPSBlbmRBbmdsZTtcbiAgcmV0dXJuIHtcbiAgICByeDogY2VudGVyWzBdLFxuICAgIHJ5OiBjZW50ZXJbMV0sXG4gICAgcjogcmFkaXVzLFxuICAgIHN0YXJ0QW5nbGU6IHN0YXJ0QW5nbGUsXG4gICAgZW5kQW5nbGU6IGVuZEFuZ2xlLFxuICAgIGdyYWRpZW50RW5kQW5nbGU6IGdyYWRpZW50RW5kQW5nbGVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0R2F1Z2VBcmNTdHlsZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgIGRhdGFJdGVtU3R5bGUgPSBnYXVnZUl0ZW0uZGF0YUl0ZW1TdHlsZTtcbiAgdmFyIF9kYXRhJGkyID0gZGF0YVtpXSxcbiAgICAgIGxpbmVXaWR0aCA9IF9kYXRhJGkyLmxpbmVXaWR0aCxcbiAgICAgIGdyYWRpZW50ID0gX2RhdGEkaTIuZ3JhZGllbnQ7XG4gIGdyYWRpZW50ID0gZ3JhZGllbnQubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgcmV0dXJuICgwLCBfY29sb3IuZ2V0UmdiYVZhbHVlKShjKTtcbiAgfSk7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGxpbmVXaWR0aDogbGluZVdpZHRoLFxuICAgIGdyYWRpZW50OiBncmFkaWVudFxuICB9LCBkYXRhSXRlbVN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRBcmNDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBjb25maWdzID0gZ2V0QXJjQ29uZmlnKGdhdWdlSXRlbSk7XG4gIGNvbmZpZ3MubWFwKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICB2YXIgc2hhcGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBjb25maWcuc2hhcGUpO1xuXG4gICAgc2hhcGUuZW5kQW5nbGUgPSBjb25maWcuc2hhcGUuc3RhcnRBbmdsZTtcbiAgICBjb25maWcuc2hhcGUgPSBzaGFwZTtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VBcmMoZ3JhcGgsIGNvbmZpZykge1xuICB2YXIgZ3JhcGhHcmFkaWVudCA9IGdyYXBoLnN0eWxlLmdyYWRpZW50O1xuICB2YXIgY2FjaGVOdW0gPSBncmFwaEdyYWRpZW50Lmxlbmd0aDtcbiAgdmFyIG5lZWROdW0gPSBjb25maWcuc3R5bGUuZ3JhZGllbnQubGVuZ3RoO1xuXG4gIGlmIChjYWNoZU51bSA+IG5lZWROdW0pIHtcbiAgICBncmFwaEdyYWRpZW50LnNwbGljZShuZWVkTnVtKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGFzdCA9IGdyYXBoR3JhZGllbnQuc2xpY2UoLTEpWzBdO1xuICAgIGdyYXBoR3JhZGllbnQucHVzaC5hcHBseShncmFwaEdyYWRpZW50LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ldyBBcnJheShuZWVkTnVtIC0gY2FjaGVOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICAgIHJldHVybiAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxhc3QpO1xuICAgIH0pKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRlckNvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBnYXVnZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIHZpc2libGU6IGdhdWdlSXRlbS5wb2ludGVyLnNob3csXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0UG9pbnRlclNoYXBlKGdhdWdlSXRlbSksXG4gICAgc3R5bGU6IGdldFBvaW50ZXJTdHlsZShnYXVnZUl0ZW0pLFxuICAgIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihmb28sIGdyYXBoKSB7XG4gICAgICBncmFwaC5zdHlsZS5ncmFwaENlbnRlciA9IGNlbnRlcjtcbiAgICB9XG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVyU2hhcGUoZ2F1Z2VJdGVtKSB7XG4gIHZhciBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogZ2V0UG9pbnRlclBvaW50cyhjZW50ZXIpLFxuICAgIGNsb3NlOiB0cnVlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXJTdHlsZShnYXVnZUl0ZW0pIHtcbiAgdmFyIHN0YXJ0QW5nbGUgPSBnYXVnZUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gZ2F1Z2VJdGVtLmVuZEFuZ2xlLFxuICAgICAgbWluID0gZ2F1Z2VJdGVtLm1pbixcbiAgICAgIG1heCA9IGdhdWdlSXRlbS5tYXgsXG4gICAgICBkYXRhID0gZ2F1Z2VJdGVtLmRhdGEsXG4gICAgICBwb2ludGVyID0gZ2F1Z2VJdGVtLnBvaW50ZXIsXG4gICAgICBjZW50ZXIgPSBnYXVnZUl0ZW0uY2VudGVyO1xuICB2YXIgdmFsdWVJbmRleCA9IHBvaW50ZXIudmFsdWVJbmRleCxcbiAgICAgIHN0eWxlID0gcG9pbnRlci5zdHlsZTtcbiAgdmFyIHZhbHVlID0gZGF0YVt2YWx1ZUluZGV4XSA/IGRhdGFbdmFsdWVJbmRleF0udmFsdWUgOiAwO1xuICB2YXIgYW5nbGUgPSAodmFsdWUgLSBtaW4pIC8gKG1heCAtIG1pbikgKiAoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKSArIHN0YXJ0QW5nbGUgKyBNYXRoLlBJIC8gMjtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgcm90YXRlOiAoMCwgX3V0aWwyLnJhZGlhblRvQW5nbGUpKGFuZ2xlKSxcbiAgICBzY2FsZTogWzEsIDFdLFxuICAgIGdyYXBoQ2VudGVyOiBjZW50ZXJcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludGVyUG9pbnRzKF9yZWY4KSB7XG4gIHZhciBfcmVmOSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmOCwgMiksXG4gICAgICB4ID0gX3JlZjlbMF0sXG4gICAgICB5ID0gX3JlZjlbMV07XG5cbiAgdmFyIHBvaW50MSA9IFt4LCB5IC0gNDBdO1xuICB2YXIgcG9pbnQyID0gW3ggKyA1LCB5XTtcbiAgdmFyIHBvaW50MyA9IFt4LCB5ICsgMTBdO1xuICB2YXIgcG9pbnQ0ID0gW3ggLSA1LCB5XTtcbiAgcmV0dXJuIFtwb2ludDEsIHBvaW50MiwgcG9pbnQzLCBwb2ludDRdO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydFBvaW50ZXJDb25maWcoZ2F1Z2VJdGVtKSB7XG4gIHZhciBzdGFydEFuZ2xlID0gZ2F1Z2VJdGVtLnN0YXJ0QW5nbGU7XG4gIHZhciBjb25maWcgPSBnZXRQb2ludGVyQ29uZmlnKGdhdWdlSXRlbSlbMF07XG4gIGNvbmZpZy5zdHlsZS5yb3RhdGUgPSAoMCwgX3V0aWwyLnJhZGlhblRvQW5nbGUpKHN0YXJ0QW5nbGUgKyBNYXRoLlBJIC8gMik7XG4gIHJldHVybiBbY29uZmlnXTtcbn1cblxuZnVuY3Rpb24gZ2V0RGV0YWlsc0NvbmZpZyhnYXVnZUl0ZW0pIHtcbiAgdmFyIGRldGFpbHNQb3NpdGlvbiA9IGdhdWdlSXRlbS5kZXRhaWxzUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGdhdWdlSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gZ2F1Z2VJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gZ2F1Z2VJdGVtLnJMZXZlbDtcbiAgdmFyIHZpc2libGUgPSBnYXVnZUl0ZW0uZGV0YWlscy5zaG93O1xuICByZXR1cm4gZGV0YWlsc1Bvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdudW1iZXJUZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiB2aXNpYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldERldGFpbHNTaGFwZShnYXVnZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldERldGFpbHNTdHlsZShnYXVnZUl0ZW0sIGkpXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERldGFpbHNTaGFwZShnYXVnZUl0ZW0sIGkpIHtcbiAgdmFyIGRldGFpbHNQb3NpdGlvbiA9IGdhdWdlSXRlbS5kZXRhaWxzUG9zaXRpb24sXG4gICAgICBkZXRhaWxzQ29udGVudCA9IGdhdWdlSXRlbS5kZXRhaWxzQ29udGVudCxcbiAgICAgIGRhdGEgPSBnYXVnZUl0ZW0uZGF0YSxcbiAgICAgIGRldGFpbHMgPSBnYXVnZUl0ZW0uZGV0YWlscztcbiAgdmFyIHBvc2l0aW9uID0gZGV0YWlsc1Bvc2l0aW9uW2ldO1xuICB2YXIgY29udGVudCA9IGRldGFpbHNDb250ZW50W2ldO1xuICB2YXIgZGF0YVZhbHVlID0gZGF0YVtpXS52YWx1ZTtcbiAgdmFyIHRvRml4ZWQgPSBkZXRhaWxzLnZhbHVlVG9GaXhlZDtcbiAgcmV0dXJuIHtcbiAgICBudW1iZXI6IFtkYXRhVmFsdWVdLFxuICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgIHRvRml4ZWQ6IHRvRml4ZWRcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0RGV0YWlsc1N0eWxlKGdhdWdlSXRlbSwgaSkge1xuICB2YXIgZGV0YWlscyA9IGdhdWdlSXRlbS5kZXRhaWxzLFxuICAgICAgZGF0YSA9IGdhdWdlSXRlbS5kYXRhO1xuICB2YXIgc3R5bGUgPSBkZXRhaWxzLnN0eWxlO1xuICB2YXIgY29sb3IgPSBkYXRhW2ldLmNvbG9yO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBzdHlsZSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5ncmlkID0gZ3JpZDtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxuZnVuY3Rpb24gZ3JpZChjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIGdyaWQgPSBvcHRpb24uZ3JpZDtcbiAgZ3JpZCA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShfY29uZmlnLmdyaWRDb25maWcsIHRydWUpLCBncmlkIHx8IHt9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogW2dyaWRdLFxuICAgIGtleTogJ2dyaWQnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRHcmlkQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRHcmlkQ29uZmlnKGdyaWRJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGdyaWRJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBncmlkSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGdyaWRJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlID0gZ2V0R3JpZFNoYXBlKGdyaWRJdGVtLCB1cGRhdGVyKTtcbiAgdmFyIHN0eWxlID0gZ2V0R3JpZFN0eWxlKGdyaWRJdGVtKTtcbiAgdXBkYXRlci5jaGFydC5ncmlkQXJlYSA9IF9vYmplY3RTcHJlYWQoe30sIHNoYXBlKTtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3JlY3QnLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogc2hhcGUsXG4gICAgc3R5bGU6IHN0eWxlXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRHcmlkU2hhcGUoZ3JpZEl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIF91cGRhdGVyJGNoYXJ0JHJlbmRlciA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh1cGRhdGVyLmNoYXJ0LnJlbmRlci5hcmVhLCAyKSxcbiAgICAgIHcgPSBfdXBkYXRlciRjaGFydCRyZW5kZXJbMF0sXG4gICAgICBoID0gX3VwZGF0ZXIkY2hhcnQkcmVuZGVyWzFdO1xuXG4gIHZhciBsZWZ0ID0gZ2V0TnVtYmVyVmFsdWUoZ3JpZEl0ZW0ubGVmdCwgdyk7XG4gIHZhciByaWdodCA9IGdldE51bWJlclZhbHVlKGdyaWRJdGVtLnJpZ2h0LCB3KTtcbiAgdmFyIHRvcCA9IGdldE51bWJlclZhbHVlKGdyaWRJdGVtLnRvcCwgaCk7XG4gIHZhciBib3R0b20gPSBnZXROdW1iZXJWYWx1ZShncmlkSXRlbS5ib3R0b20sIGgpO1xuICB2YXIgd2lkdGggPSB3IC0gbGVmdCAtIHJpZ2h0O1xuICB2YXIgaGVpZ2h0ID0gaCAtIHRvcCAtIGJvdHRvbTtcbiAgcmV0dXJuIHtcbiAgICB4OiBsZWZ0LFxuICAgIHk6IHRvcCxcbiAgICB3OiB3aWR0aCxcbiAgICBoOiBoZWlnaHRcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TnVtYmVyVmFsdWUodmFsLCBhbGwpIHtcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHJldHVybiAwO1xuICByZXR1cm4gYWxsICogcGFyc2VJbnQodmFsKSAvIDEwMDtcbn1cblxuZnVuY3Rpb24gZ2V0R3JpZFN0eWxlKGdyaWRJdGVtKSB7XG4gIHZhciBzdHlsZSA9IGdyaWRJdGVtLnN0eWxlO1xuICByZXR1cm4gc3R5bGU7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJtZXJnZUNvbG9yXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9tZXJnZUNvbG9yLm1lcmdlQ29sb3I7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidGl0bGVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3RpdGxlLnRpdGxlO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdyaWRcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2dyaWQuZ3JpZDtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJheGlzXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9heGlzLmF4aXM7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGluZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfbGluZS5saW5lO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImJhclwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfYmFyLmJhcjtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJwaWVcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX3BpZS5waWU7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicmFkYXJBeGlzXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhckF4aXMucmFkYXJBeGlzO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInJhZGFyXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9yYWRhci5yYWRhcjtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnYXVnZVwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ2F1Z2UuZ2F1Z2U7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwibGVnZW5kXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9sZWdlbmQubGVnZW5kO1xuICB9XG59KTtcblxudmFyIF9tZXJnZUNvbG9yID0gcmVxdWlyZShcIi4vbWVyZ2VDb2xvclwiKTtcblxudmFyIF90aXRsZSA9IHJlcXVpcmUoXCIuL3RpdGxlXCIpO1xuXG52YXIgX2dyaWQgPSByZXF1aXJlKFwiLi9ncmlkXCIpO1xuXG52YXIgX2F4aXMgPSByZXF1aXJlKFwiLi9heGlzXCIpO1xuXG52YXIgX2xpbmUgPSByZXF1aXJlKFwiLi9saW5lXCIpO1xuXG52YXIgX2JhciA9IHJlcXVpcmUoXCIuL2JhclwiKTtcblxudmFyIF9waWUgPSByZXF1aXJlKFwiLi9waWVcIik7XG5cbnZhciBfcmFkYXJBeGlzID0gcmVxdWlyZShcIi4vcmFkYXJBeGlzXCIpO1xuXG52YXIgX3JhZGFyID0gcmVxdWlyZShcIi4vcmFkYXJcIik7XG5cbnZhciBfZ2F1Z2UgPSByZXF1aXJlKFwiLi9nYXVnZVwiKTtcblxudmFyIF9sZWdlbmQgPSByZXF1aXJlKFwiLi9sZWdlbmRcIik7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5sZWdlbmQgPSBsZWdlbmQ7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF91dGlsMiA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBsZWdlbmQoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBsZWdlbmQgPSBvcHRpb24ubGVnZW5kO1xuXG4gIGlmIChsZWdlbmQpIHtcbiAgICBsZWdlbmQgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoX2NvbmZpZy5sZWdlbmRDb25maWcsIHRydWUpLCBsZWdlbmQpO1xuICAgIGxlZ2VuZCA9IGluaXRMZWdlbmREYXRhKGxlZ2VuZCk7XG4gICAgbGVnZW5kID0gZmlsdGVySW52YWxpZERhdGEobGVnZW5kLCBvcHRpb24sIGNoYXJ0KTtcbiAgICBsZWdlbmQgPSBjYWxjTGVnZW5kVGV4dFdpZHRoKGxlZ2VuZCwgY2hhcnQpO1xuICAgIGxlZ2VuZCA9IGNhbGNMZWdlbmRQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KTtcbiAgICBsZWdlbmQgPSBbbGVnZW5kXTtcbiAgfSBlbHNlIHtcbiAgICBsZWdlbmQgPSBbXTtcbiAgfVxuXG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxlZ2VuZCxcbiAgICBrZXk6ICdsZWdlbmRJY29uJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0SWNvbkNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogbGVnZW5kLFxuICAgIGtleTogJ2xlZ2VuZFRleHQnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRUZXh0Q29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpbml0TGVnZW5kRGF0YShsZWdlbmQpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmQuZGF0YTtcbiAgbGVnZW5kLmRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciBpdGVtVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGl0ZW0pO1xuXG4gICAgaWYgKGl0ZW1UeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogaXRlbVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGl0ZW1UeXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICcnXG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBsZWdlbmQ7XG59XG5cbmZ1bmN0aW9uIGZpbHRlckludmFsaWREYXRhKGxlZ2VuZCwgb3B0aW9uLCBjaGFydCkge1xuICB2YXIgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgdmFyIGxlZ2VuZFN0YXR1cyA9IGNoYXJ0LmxlZ2VuZFN0YXR1cztcbiAgdmFyIGRhdGEgPSBsZWdlbmQuZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgbmFtZSA9IGl0ZW0ubmFtZTtcbiAgICB2YXIgcmVzdWx0ID0gc2VyaWVzLmZpbmQoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgIHZhciBzbiA9IF9yZWYubmFtZTtcbiAgICAgIHJldHVybiBuYW1lID09PSBzbjtcbiAgICB9KTtcbiAgICBpZiAoIXJlc3VsdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmICghaXRlbS5jb2xvcikgaXRlbS5jb2xvciA9IHJlc3VsdC5jb2xvcjtcbiAgICBpZiAoIWl0ZW0uaWNvbikgaXRlbS5pY29uID0gcmVzdWx0LnR5cGU7XG4gICAgcmV0dXJuIGl0ZW07XG4gIH0pO1xuICBpZiAoIWxlZ2VuZFN0YXR1cyB8fCBsZWdlbmRTdGF0dXMubGVuZ3RoICE9PSBsZWdlbmQuZGF0YS5sZW5ndGgpIGxlZ2VuZFN0YXR1cyA9IG5ldyBBcnJheShsZWdlbmQuZGF0YS5sZW5ndGgpLmZpbGwodHJ1ZSk7XG4gIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgIHJldHVybiBpdGVtLnN0YXR1cyA9IGxlZ2VuZFN0YXR1c1tpXTtcbiAgfSk7XG4gIGxlZ2VuZC5kYXRhID0gZGF0YTtcbiAgY2hhcnQubGVnZW5kU3RhdHVzID0gbGVnZW5kU3RhdHVzO1xuICByZXR1cm4gbGVnZW5kO1xufVxuXG5mdW5jdGlvbiBjYWxjTGVnZW5kVGV4dFdpZHRoKGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGN0eCA9IGNoYXJ0LnJlbmRlci5jdHg7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICB0ZXh0U3R5bGUgPSBsZWdlbmQudGV4dFN0eWxlLFxuICAgICAgdGV4dFVuc2VsZWN0ZWRTdHlsZSA9IGxlZ2VuZC50ZXh0VW5zZWxlY3RlZFN0eWxlO1xuICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgc3RhdHVzID0gaXRlbS5zdGF0dXMsXG4gICAgICAgIG5hbWUgPSBpdGVtLm5hbWU7XG4gICAgaXRlbS50ZXh0V2lkdGggPSBnZXRUZXh0V2lkdGgoY3R4LCBuYW1lLCBzdGF0dXMgPyB0ZXh0U3R5bGUgOiB0ZXh0VW5zZWxlY3RlZFN0eWxlKTtcbiAgfSk7XG4gIHJldHVybiBsZWdlbmQ7XG59XG5cbmZ1bmN0aW9uIGdldFRleHRXaWR0aChjdHgsIHRleHQsIHN0eWxlKSB7XG4gIGN0eC5mb250ID0gZ2V0Rm9udENvbmZpZyhzdHlsZSk7XG4gIHJldHVybiBjdHgubWVhc3VyZVRleHQodGV4dCkud2lkdGg7XG59XG5cbmZ1bmN0aW9uIGdldEZvbnRDb25maWcoc3R5bGUpIHtcbiAgdmFyIGZvbnRGYW1pbHkgPSBzdHlsZS5mb250RmFtaWx5LFxuICAgICAgZm9udFNpemUgPSBzdHlsZS5mb250U2l6ZTtcbiAgcmV0dXJuIFwiXCIuY29uY2F0KGZvbnRTaXplLCBcInB4IFwiKS5jb25jYXQoZm9udEZhbWlseSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNMZWdlbmRQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBvcmllbnQgPSBsZWdlbmQub3JpZW50O1xuXG4gIGlmIChvcmllbnQgPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICBjYWxjVmVydGljYWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KTtcbiAgfSBlbHNlIHtcbiAgICBjYWxjSG9yaXpvbnRhbFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpO1xuICB9XG5cbiAgcmV0dXJuIGxlZ2VuZDtcbn1cblxuZnVuY3Rpb24gY2FsY0hvcml6b250YWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBpY29uSGVpZ2h0ID0gbGVnZW5kLmljb25IZWlnaHQsXG4gICAgICBpdGVtR2FwID0gbGVnZW5kLml0ZW1HYXA7XG4gIHZhciBsaW5lcyA9IGNhbGNEZWZhdWx0SG9yaXpvbnRhbFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpO1xuICB2YXIgeE9mZnNldHMgPSBsaW5lcy5tYXAoZnVuY3Rpb24gKGxpbmUpIHtcbiAgICByZXR1cm4gZ2V0SG9yaXpvbnRhbFhPZmZzZXQobGluZSwgbGVnZW5kLCBjaGFydCk7XG4gIH0pO1xuICB2YXIgeU9mZnNldCA9IGdldEhvcml6b250YWxZT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpO1xuICB2YXIgYWxpZ24gPSB7XG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBsaW5lcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5lLCBpKSB7XG4gICAgcmV0dXJuIGxpbmUuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGljb25Qb3NpdGlvbiA9IGl0ZW0uaWNvblBvc2l0aW9uLFxuICAgICAgICAgIHRleHRQb3NpdGlvbiA9IGl0ZW0udGV4dFBvc2l0aW9uO1xuICAgICAgdmFyIHhPZmZzZXQgPSB4T2Zmc2V0c1tpXTtcbiAgICAgIHZhciByZWFsWU9mZnNldCA9IHlPZmZzZXQgKyBpICogKGl0ZW1HYXAgKyBpY29uSGVpZ2h0KTtcbiAgICAgIGl0ZW0uaWNvblBvc2l0aW9uID0gbWVyZ2VPZmZzZXQoaWNvblBvc2l0aW9uLCBbeE9mZnNldCwgcmVhbFlPZmZzZXRdKTtcbiAgICAgIGl0ZW0udGV4dFBvc2l0aW9uID0gbWVyZ2VPZmZzZXQodGV4dFBvc2l0aW9uLCBbeE9mZnNldCwgcmVhbFlPZmZzZXRdKTtcbiAgICAgIGl0ZW0uYWxpZ24gPSBhbGlnbjtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNEZWZhdWx0SG9yaXpvbnRhbFBvc2l0aW9uKGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmQuZGF0YSxcbiAgICAgIGljb25XaWR0aCA9IGxlZ2VuZC5pY29uV2lkdGg7XG4gIHZhciB3ID0gY2hhcnQucmVuZGVyLmFyZWFbMF07XG4gIHZhciBzdGFydEluZGV4ID0gMDtcbiAgdmFyIGxpbmVzID0gW1tdXTtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgdmFyIGJlZm9yZVdpZHRoID0gZ2V0QmVmb3JlV2lkdGgoc3RhcnRJbmRleCwgaSwgbGVnZW5kKTtcbiAgICB2YXIgZW5kWFBvcyA9IGJlZm9yZVdpZHRoICsgaWNvbldpZHRoICsgNSArIGl0ZW0udGV4dFdpZHRoO1xuXG4gICAgaWYgKGVuZFhQb3MgPj0gdykge1xuICAgICAgc3RhcnRJbmRleCA9IGk7XG4gICAgICBiZWZvcmVXaWR0aCA9IGdldEJlZm9yZVdpZHRoKHN0YXJ0SW5kZXgsIGksIGxlZ2VuZCk7XG4gICAgICBsaW5lcy5wdXNoKFtdKTtcbiAgICB9XG5cbiAgICBpdGVtLmljb25Qb3NpdGlvbiA9IFtiZWZvcmVXaWR0aCwgMF07XG4gICAgaXRlbS50ZXh0UG9zaXRpb24gPSBbYmVmb3JlV2lkdGggKyBpY29uV2lkdGggKyA1LCAwXTtcbiAgICBsaW5lcy5zbGljZSgtMSlbMF0ucHVzaChpdGVtKTtcbiAgfSk7XG4gIHJldHVybiBsaW5lcztcbn1cblxuZnVuY3Rpb24gZ2V0QmVmb3JlV2lkdGgoc3RhcnRJbmRleCwgY3VycmVudEluZGV4LCBsZWdlbmQpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmQuZGF0YSxcbiAgICAgIGljb25XaWR0aCA9IGxlZ2VuZC5pY29uV2lkdGgsXG4gICAgICBpdGVtR2FwID0gbGVnZW5kLml0ZW1HYXA7XG4gIHZhciBiZWZvcmVJdGVtID0gZGF0YS5zbGljZShzdGFydEluZGV4LCBjdXJyZW50SW5kZXgpO1xuICByZXR1cm4gKDAsIF91dGlsMi5tdWxBZGQpKGJlZm9yZUl0ZW0ubWFwKGZ1bmN0aW9uIChfcmVmMikge1xuICAgIHZhciB0ZXh0V2lkdGggPSBfcmVmMi50ZXh0V2lkdGg7XG4gICAgcmV0dXJuIHRleHRXaWR0aDtcbiAgfSkpICsgKGN1cnJlbnRJbmRleCAtIHN0YXJ0SW5kZXgpICogKGl0ZW1HYXAgKyA1ICsgaWNvbldpZHRoKTtcbn1cblxuZnVuY3Rpb24gZ2V0SG9yaXpvbnRhbFhPZmZzZXQoZGF0YSwgbGVnZW5kLCBjaGFydCkge1xuICB2YXIgbGVmdCA9IGxlZ2VuZC5sZWZ0LFxuICAgICAgcmlnaHQgPSBsZWdlbmQucmlnaHQsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmQuaWNvbldpZHRoLFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwO1xuICB2YXIgdyA9IGNoYXJ0LnJlbmRlci5hcmVhWzBdO1xuICB2YXIgZGF0YU51bSA9IGRhdGEubGVuZ3RoO1xuICB2YXIgYWxsV2lkdGggPSAoMCwgX3V0aWwyLm11bEFkZCkoZGF0YS5tYXAoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IF9yZWYzLnRleHRXaWR0aDtcbiAgICByZXR1cm4gdGV4dFdpZHRoO1xuICB9KSkgKyBkYXRhTnVtICogKDUgKyBpY29uV2lkdGgpICsgKGRhdGFOdW0gLSAxKSAqIGl0ZW1HYXA7XG4gIHZhciBob3Jpem9udGFsID0gW2xlZnQsIHJpZ2h0XS5maW5kSW5kZXgoZnVuY3Rpb24gKHBvcykge1xuICAgIHJldHVybiBwb3MgIT09ICdhdXRvJztcbiAgfSk7XG5cbiAgaWYgKGhvcml6b250YWwgPT09IC0xKSB7XG4gICAgcmV0dXJuICh3IC0gYWxsV2lkdGgpIC8gMjtcbiAgfSBlbHNlIGlmIChob3Jpem9udGFsID09PSAwKSB7XG4gICAgaWYgKHR5cGVvZiBsZWZ0ID09PSAnbnVtYmVyJykgcmV0dXJuIGxlZnQ7XG4gICAgcmV0dXJuIHBhcnNlSW50KGxlZnQpIC8gMTAwICogdztcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHJpZ2h0ICE9PSAnbnVtYmVyJykgcmlnaHQgPSBwYXJzZUludChyaWdodCkgLyAxMDAgKiB3O1xuICAgIHJldHVybiB3IC0gKGFsbFdpZHRoICsgcmlnaHQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEhvcml6b250YWxZT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpIHtcbiAgdmFyIHRvcCA9IGxlZ2VuZC50b3AsXG4gICAgICBib3R0b20gPSBsZWdlbmQuYm90dG9tLFxuICAgICAgaWNvbkhlaWdodCA9IGxlZ2VuZC5pY29uSGVpZ2h0O1xuICB2YXIgaCA9IGNoYXJ0LnJlbmRlci5hcmVhWzFdO1xuICB2YXIgdmVydGljYWwgPSBbdG9wLCBib3R0b21dLmZpbmRJbmRleChmdW5jdGlvbiAocG9zKSB7XG4gICAgcmV0dXJuIHBvcyAhPT0gJ2F1dG8nO1xuICB9KTtcbiAgdmFyIGhhbGZJY29uSGVpZ2h0ID0gaWNvbkhlaWdodCAvIDI7XG5cbiAgaWYgKHZlcnRpY2FsID09PSAtMSkge1xuICAgIHZhciBfY2hhcnQkZ3JpZEFyZWEgPSBjaGFydC5ncmlkQXJlYSxcbiAgICAgICAgeSA9IF9jaGFydCRncmlkQXJlYS55LFxuICAgICAgICBoZWlnaHQgPSBfY2hhcnQkZ3JpZEFyZWEuaDtcbiAgICByZXR1cm4geSArIGhlaWdodCArIDQ1IC0gaGFsZkljb25IZWlnaHQ7XG4gIH0gZWxzZSBpZiAodmVydGljYWwgPT09IDApIHtcbiAgICBpZiAodHlwZW9mIHRvcCA9PT0gJ251bWJlcicpIHJldHVybiB0b3AgLSBoYWxmSWNvbkhlaWdodDtcbiAgICByZXR1cm4gcGFyc2VJbnQodG9wKSAvIDEwMCAqIGggLSBoYWxmSWNvbkhlaWdodDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGJvdHRvbSAhPT0gJ251bWJlcicpIGJvdHRvbSA9IHBhcnNlSW50KGJvdHRvbSkgLyAxMDAgKiBoO1xuICAgIHJldHVybiBoIC0gYm90dG9tIC0gaGFsZkljb25IZWlnaHQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2VPZmZzZXQoX3JlZjQsIF9yZWY1KSB7XG4gIHZhciBfcmVmNiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNCwgMiksXG4gICAgICB4ID0gX3JlZjZbMF0sXG4gICAgICB5ID0gX3JlZjZbMV07XG5cbiAgdmFyIF9yZWY3ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1LCAyKSxcbiAgICAgIG94ID0gX3JlZjdbMF0sXG4gICAgICBveSA9IF9yZWY3WzFdO1xuXG4gIHJldHVybiBbeCArIG94LCB5ICsgb3ldO1xufVxuXG5mdW5jdGlvbiBjYWxjVmVydGljYWxQb3NpdGlvbihsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBfZ2V0VmVydGljYWxYT2Zmc2V0ID0gZ2V0VmVydGljYWxYT2Zmc2V0KGxlZ2VuZCwgY2hhcnQpLFxuICAgICAgX2dldFZlcnRpY2FsWE9mZnNldDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldFZlcnRpY2FsWE9mZnNldCwgMiksXG4gICAgICBpc1JpZ2h0ID0gX2dldFZlcnRpY2FsWE9mZnNldDJbMF0sXG4gICAgICB4T2Zmc2V0ID0gX2dldFZlcnRpY2FsWE9mZnNldDJbMV07XG5cbiAgdmFyIHlPZmZzZXQgPSBnZXRWZXJ0aWNhbFlPZmZzZXQobGVnZW5kLCBjaGFydCk7XG4gIGNhbGNEZWZhdWx0VmVydGljYWxQb3NpdGlvbihsZWdlbmQsIGlzUmlnaHQpO1xuICB2YXIgYWxpZ24gPSB7XG4gICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICB9O1xuICBsZWdlbmQuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgdmFyIHRleHRQb3NpdGlvbiA9IGl0ZW0udGV4dFBvc2l0aW9uLFxuICAgICAgICBpY29uUG9zaXRpb24gPSBpdGVtLmljb25Qb3NpdGlvbjtcbiAgICBpdGVtLnRleHRQb3NpdGlvbiA9IG1lcmdlT2Zmc2V0KHRleHRQb3NpdGlvbiwgW3hPZmZzZXQsIHlPZmZzZXRdKTtcbiAgICBpdGVtLmljb25Qb3NpdGlvbiA9IG1lcmdlT2Zmc2V0KGljb25Qb3NpdGlvbiwgW3hPZmZzZXQsIHlPZmZzZXRdKTtcbiAgICBpdGVtLmFsaWduID0gYWxpZ247XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRWZXJ0aWNhbFhPZmZzZXQobGVnZW5kLCBjaGFydCkge1xuICB2YXIgbGVmdCA9IGxlZ2VuZC5sZWZ0LFxuICAgICAgcmlnaHQgPSBsZWdlbmQucmlnaHQ7XG4gIHZhciB3ID0gY2hhcnQucmVuZGVyLmFyZWFbMF07XG4gIHZhciBob3Jpem9udGFsID0gW2xlZnQsIHJpZ2h0XS5maW5kSW5kZXgoZnVuY3Rpb24gKHBvcykge1xuICAgIHJldHVybiBwb3MgIT09ICdhdXRvJztcbiAgfSk7XG5cbiAgaWYgKGhvcml6b250YWwgPT09IC0xKSB7XG4gICAgcmV0dXJuIFt0cnVlLCB3IC0gMTBdO1xuICB9IGVsc2Uge1xuICAgIHZhciBvZmZzZXQgPSBbbGVmdCwgcmlnaHRdW2hvcml6b250YWxdO1xuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ICE9PSAnbnVtYmVyJykgb2Zmc2V0ID0gcGFyc2VJbnQob2Zmc2V0KSAvIDEwMCAqIHc7XG4gICAgcmV0dXJuIFtCb29sZWFuKGhvcml6b250YWwpLCBvZmZzZXRdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFZlcnRpY2FsWU9mZnNldChsZWdlbmQsIGNoYXJ0KSB7XG4gIHZhciBpY29uSGVpZ2h0ID0gbGVnZW5kLmljb25IZWlnaHQsXG4gICAgICBpdGVtR2FwID0gbGVnZW5kLml0ZW1HYXAsXG4gICAgICBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICB0b3AgPSBsZWdlbmQudG9wLFxuICAgICAgYm90dG9tID0gbGVnZW5kLmJvdHRvbTtcbiAgdmFyIGggPSBjaGFydC5yZW5kZXIuYXJlYVsxXTtcbiAgdmFyIGRhdGFOdW0gPSBkYXRhLmxlbmd0aDtcbiAgdmFyIGFsbEhlaWdodCA9IGRhdGFOdW0gKiBpY29uSGVpZ2h0ICsgKGRhdGFOdW0gLSAxKSAqIGl0ZW1HYXA7XG4gIHZhciB2ZXJ0aWNhbCA9IFt0b3AsIGJvdHRvbV0uZmluZEluZGV4KGZ1bmN0aW9uIChwb3MpIHtcbiAgICByZXR1cm4gcG9zICE9PSAnYXV0byc7XG4gIH0pO1xuXG4gIGlmICh2ZXJ0aWNhbCA9PT0gLTEpIHtcbiAgICByZXR1cm4gKGggLSBhbGxIZWlnaHQpIC8gMjtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb2Zmc2V0ID0gW3RvcCwgYm90dG9tXVt2ZXJ0aWNhbF07XG4gICAgaWYgKHR5cGVvZiBvZmZzZXQgIT09ICdudW1iZXInKSBvZmZzZXQgPSBwYXJzZUludChvZmZzZXQpIC8gMTAwICogaDtcbiAgICBpZiAodmVydGljYWwgPT09IDEpIG9mZnNldCA9IGggLSBvZmZzZXQgLSBhbGxIZWlnaHQ7XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxjRGVmYXVsdFZlcnRpY2FsUG9zaXRpb24obGVnZW5kLCBpc1JpZ2h0KSB7XG4gIHZhciBkYXRhID0gbGVnZW5kLmRhdGEsXG4gICAgICBpY29uV2lkdGggPSBsZWdlbmQuaWNvbldpZHRoLFxuICAgICAgaWNvbkhlaWdodCA9IGxlZ2VuZC5pY29uSGVpZ2h0LFxuICAgICAgaXRlbUdhcCA9IGxlZ2VuZC5pdGVtR2FwO1xuICB2YXIgaGFsZkljb25IZWlnaHQgPSBpY29uSGVpZ2h0IC8gMjtcbiAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IGl0ZW0udGV4dFdpZHRoO1xuICAgIHZhciB5UG9zID0gKGljb25IZWlnaHQgKyBpdGVtR2FwKSAqIGkgKyBoYWxmSWNvbkhlaWdodDtcbiAgICB2YXIgaWNvblhQb3MgPSBpc1JpZ2h0ID8gMCAtIGljb25XaWR0aCA6IDA7XG4gICAgdmFyIHRleHRYcG9zID0gaXNSaWdodCA/IGljb25YUG9zIC0gNSAtIHRleHRXaWR0aCA6IGljb25XaWR0aCArIDU7XG4gICAgaXRlbS5pY29uUG9zaXRpb24gPSBbaWNvblhQb3MsIHlQb3NdO1xuICAgIGl0ZW0udGV4dFBvc2l0aW9uID0gW3RleHRYcG9zLCB5UG9zXTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEljb25Db25maWcobGVnZW5kSXRlbSwgdXBkYXRlcikge1xuICB2YXIgZGF0YSA9IGxlZ2VuZEl0ZW0uZGF0YSxcbiAgICAgIHNlbGVjdEFibGUgPSBsZWdlbmRJdGVtLnNlbGVjdEFibGUsXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IGxlZ2VuZEl0ZW0uYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IGxlZ2VuZEl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsZWdlbmRJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgcmV0dXJuICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkoe1xuICAgICAgbmFtZTogaXRlbS5pY29uID09PSAnbGluZScgPyAnbGluZUljb24nIDogJ3JlY3QnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IGxlZ2VuZEl0ZW0uc2hvdyxcbiAgICAgIGhvdmVyOiBzZWxlY3RBYmxlLFxuICAgICAgY2xpY2s6IHNlbGVjdEFibGUsXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0SWNvblNoYXBlKGxlZ2VuZEl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldEljb25TdHlsZShsZWdlbmRJdGVtLCBpKVxuICAgIH0sIFwiY2xpY2tcIiwgY3JlYXRlQ2xpY2tDYWxsQmFjayhsZWdlbmRJdGVtLCBpLCB1cGRhdGVyKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRJY29uU2hhcGUobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgZGF0YSA9IGxlZ2VuZEl0ZW0uZGF0YSxcbiAgICAgIGljb25XaWR0aCA9IGxlZ2VuZEl0ZW0uaWNvbldpZHRoLFxuICAgICAgaWNvbkhlaWdodCA9IGxlZ2VuZEl0ZW0uaWNvbkhlaWdodDtcblxuICB2YXIgX2RhdGEkaSRpY29uUG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoZGF0YVtpXS5pY29uUG9zaXRpb24sIDIpLFxuICAgICAgeCA9IF9kYXRhJGkkaWNvblBvc2l0aW9uWzBdLFxuICAgICAgeSA9IF9kYXRhJGkkaWNvblBvc2l0aW9uWzFdO1xuXG4gIHZhciBoYWxmSWNvbkhlaWdodCA9IGljb25IZWlnaHQgLyAyO1xuICByZXR1cm4ge1xuICAgIHg6IHgsXG4gICAgeTogeSAtIGhhbGZJY29uSGVpZ2h0LFxuICAgIHc6IGljb25XaWR0aCxcbiAgICBoOiBpY29uSGVpZ2h0XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEljb25TdHlsZShsZWdlbmRJdGVtLCBpKSB7XG4gIHZhciBkYXRhID0gbGVnZW5kSXRlbS5kYXRhLFxuICAgICAgaWNvblN0eWxlID0gbGVnZW5kSXRlbS5pY29uU3R5bGUsXG4gICAgICBpY29uVW5zZWxlY3RlZFN0eWxlID0gbGVnZW5kSXRlbS5pY29uVW5zZWxlY3RlZFN0eWxlO1xuICB2YXIgX2RhdGEkaSA9IGRhdGFbaV0sXG4gICAgICBzdGF0dXMgPSBfZGF0YSRpLnN0YXR1cyxcbiAgICAgIGNvbG9yID0gX2RhdGEkaS5jb2xvcjtcbiAgdmFyIHN0eWxlID0gc3RhdHVzID8gaWNvblN0eWxlIDogaWNvblVuc2VsZWN0ZWRTdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKSh7XG4gICAgZmlsbDogY29sb3JcbiAgfSwgc3R5bGUpO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0Q29uZmlnKGxlZ2VuZEl0ZW0sIHVwZGF0ZXIpIHtcbiAgdmFyIGRhdGEgPSBsZWdlbmRJdGVtLmRhdGEsXG4gICAgICBzZWxlY3RBYmxlID0gbGVnZW5kSXRlbS5zZWxlY3RBYmxlLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBsZWdlbmRJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsZWdlbmRJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gbGVnZW5kSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICd0ZXh0JyxcbiAgICAgIGluZGV4OiByTGV2ZWwsXG4gICAgICB2aXNpYmxlOiBsZWdlbmRJdGVtLnNob3csXG4gICAgICBob3Zlcjogc2VsZWN0QWJsZSxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIGhvdmVyUmVjdDogZ2V0VGV4dEhvdmVyUmVjdChsZWdlbmRJdGVtLCBpKSxcbiAgICAgIHNoYXBlOiBnZXRUZXh0U2hhcGUobGVnZW5kSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0VGV4dFN0eWxlKGxlZ2VuZEl0ZW0sIGkpLFxuICAgICAgY2xpY2s6IGNyZWF0ZUNsaWNrQ2FsbEJhY2sobGVnZW5kSXRlbSwgaSwgdXBkYXRlcilcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dFNoYXBlKGxlZ2VuZEl0ZW0sIGkpIHtcbiAgdmFyIF9sZWdlbmRJdGVtJGRhdGEkaSA9IGxlZ2VuZEl0ZW0uZGF0YVtpXSxcbiAgICAgIHRleHRQb3NpdGlvbiA9IF9sZWdlbmRJdGVtJGRhdGEkaS50ZXh0UG9zaXRpb24sXG4gICAgICBuYW1lID0gX2xlZ2VuZEl0ZW0kZGF0YSRpLm5hbWU7XG4gIHJldHVybiB7XG4gICAgY29udGVudDogbmFtZSxcbiAgICBwb3NpdGlvbjogdGV4dFBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFRleHRTdHlsZShsZWdlbmRJdGVtLCBpKSB7XG4gIHZhciB0ZXh0U3R5bGUgPSBsZWdlbmRJdGVtLnRleHRTdHlsZSxcbiAgICAgIHRleHRVbnNlbGVjdGVkU3R5bGUgPSBsZWdlbmRJdGVtLnRleHRVbnNlbGVjdGVkU3R5bGU7XG4gIHZhciBfbGVnZW5kSXRlbSRkYXRhJGkyID0gbGVnZW5kSXRlbS5kYXRhW2ldLFxuICAgICAgc3RhdHVzID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMi5zdGF0dXMsXG4gICAgICBhbGlnbiA9IF9sZWdlbmRJdGVtJGRhdGEkaTIuYWxpZ247XG4gIHZhciBzdHlsZSA9IHN0YXR1cyA/IHRleHRTdHlsZSA6IHRleHRVbnNlbGVjdGVkU3R5bGU7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoc3R5bGUsIHRydWUpLCBhbGlnbik7XG59XG5cbmZ1bmN0aW9uIGdldFRleHRIb3ZlclJlY3QobGVnZW5kSXRlbSwgaSkge1xuICB2YXIgdGV4dFN0eWxlID0gbGVnZW5kSXRlbS50ZXh0U3R5bGUsXG4gICAgICB0ZXh0VW5zZWxlY3RlZFN0eWxlID0gbGVnZW5kSXRlbS50ZXh0VW5zZWxlY3RlZFN0eWxlO1xuXG4gIHZhciBfbGVnZW5kSXRlbSRkYXRhJGkzID0gbGVnZW5kSXRlbS5kYXRhW2ldLFxuICAgICAgc3RhdHVzID0gX2xlZ2VuZEl0ZW0kZGF0YSRpMy5zdGF0dXMsXG4gICAgICBfbGVnZW5kSXRlbSRkYXRhJGkzJHQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2xlZ2VuZEl0ZW0kZGF0YSRpMy50ZXh0UG9zaXRpb24sIDIpLFxuICAgICAgeCA9IF9sZWdlbmRJdGVtJGRhdGEkaTMkdFswXSxcbiAgICAgIHkgPSBfbGVnZW5kSXRlbSRkYXRhJGkzJHRbMV0sXG4gICAgICB0ZXh0V2lkdGggPSBfbGVnZW5kSXRlbSRkYXRhJGkzLnRleHRXaWR0aDtcblxuICB2YXIgc3R5bGUgPSBzdGF0dXMgPyB0ZXh0U3R5bGUgOiB0ZXh0VW5zZWxlY3RlZFN0eWxlO1xuICB2YXIgZm9udFNpemUgPSBzdHlsZS5mb250U2l6ZTtcbiAgcmV0dXJuIFt4LCB5IC0gZm9udFNpemUgLyAyLCB0ZXh0V2lkdGgsIGZvbnRTaXplXTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xpY2tDYWxsQmFjayhsZWdlbmRJdGVtLCBpbmRleCwgdXBkYXRlcikge1xuICB2YXIgbmFtZSA9IGxlZ2VuZEl0ZW0uZGF0YVtpbmRleF0ubmFtZTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3VwZGF0ZXIkY2hhcnQgPSB1cGRhdGVyLmNoYXJ0LFxuICAgICAgICBsZWdlbmRTdGF0dXMgPSBfdXBkYXRlciRjaGFydC5sZWdlbmRTdGF0dXMsXG4gICAgICAgIG9wdGlvbiA9IF91cGRhdGVyJGNoYXJ0Lm9wdGlvbjtcbiAgICB2YXIgc3RhdHVzID0gIWxlZ2VuZFN0YXR1c1tpbmRleF07XG4gICAgdmFyIGNoYW5nZSA9IG9wdGlvbi5zZXJpZXMuZmluZChmdW5jdGlvbiAoX3JlZjkpIHtcbiAgICAgIHZhciBzbiA9IF9yZWY5Lm5hbWU7XG4gICAgICByZXR1cm4gc24gPT09IG5hbWU7XG4gICAgfSk7XG4gICAgY2hhbmdlLnNob3cgPSBzdGF0dXM7XG4gICAgbGVnZW5kU3RhdHVzW2luZGV4XSA9IHN0YXR1cztcbiAgICB1cGRhdGVyLmNoYXJ0LnNldE9wdGlvbihvcHRpb24pO1xuICB9O1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMubGluZSA9IGxpbmU7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfYmV6aWVyQ3VydmUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAamlhbWluZ2hpL2Jlemllci1jdXJ2ZVwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTsgfSk7IGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTsgaWYgKGkgJSAyKSB7IG93bktleXMoc291cmNlLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgKDAsIF9kZWZpbmVQcm9wZXJ0eTJbXCJkZWZhdWx0XCJdKSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KTsgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykgeyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpOyB9IGVsc2UgeyBvd25LZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpOyB9KTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cblxudmFyIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZSA9IF9iZXppZXJDdXJ2ZVtcImRlZmF1bHRcIl0ucG9seWxpbmVUb0JlemllckN1cnZlLFxuICAgIGdldEJlemllckN1cnZlTGVuZ3RoID0gX2JlemllckN1cnZlW1wiZGVmYXVsdFwiXS5nZXRCZXppZXJDdXJ2ZUxlbmd0aDtcblxuZnVuY3Rpb24gbGluZShjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHhBeGlzID0gb3B0aW9uLnhBeGlzLFxuICAgICAgeUF4aXMgPSBvcHRpb24ueUF4aXMsXG4gICAgICBzZXJpZXMgPSBvcHRpb24uc2VyaWVzO1xuICB2YXIgbGluZXMgPSBbXTtcblxuICBpZiAoeEF4aXMgJiYgeUF4aXMgJiYgc2VyaWVzKSB7XG4gICAgbGluZXMgPSAoMCwgX3V0aWwuaW5pdE5lZWRTZXJpZXMpKHNlcmllcywgX2NvbmZpZy5saW5lQ29uZmlnLCAnbGluZScpO1xuICAgIGxpbmVzID0gY2FsY0xpbmVzUG9zaXRpb24obGluZXMsIGNoYXJ0KTtcbiAgfVxuXG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxpbmVzLFxuICAgIGtleTogJ2xpbmVBcmVhJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGluZUFyZWFDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRMaW5lQXJlYUNvbmZpZyxcbiAgICBiZWZvcmVVcGRhdGU6IGJlZm9yZVVwZGF0ZUxpbmVBbmRBcmVhLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlTGluZUFuZEFyZWFcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxpbmVzLFxuICAgIGtleTogJ2xpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRMaW5lQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0TGluZUNvbmZpZyxcbiAgICBiZWZvcmVVcGRhdGU6IGJlZm9yZVVwZGF0ZUxpbmVBbmRBcmVhLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlTGluZUFuZEFyZWFcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxpbmVzLFxuICAgIGtleTogJ2xpbmVQb2ludCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFBvaW50Q29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0UG9pbnRDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IGxpbmVzLFxuICAgIGtleTogJ2xpbmVMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldExhYmVsQ29uZmlnXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjYWxjTGluZXNQb3NpdGlvbihsaW5lcywgY2hhcnQpIHtcbiAgdmFyIGF4aXNEYXRhID0gY2hhcnQuYXhpc0RhdGE7XG4gIHJldHVybiBsaW5lcy5tYXAoZnVuY3Rpb24gKGxpbmVJdGVtKSB7XG4gICAgdmFyIGxpbmVEYXRhID0gKDAsIF91dGlsLm1lcmdlU2FtZVN0YWNrRGF0YSkobGluZUl0ZW0sIGxpbmVzKTtcbiAgICBsaW5lRGF0YSA9IG1lcmdlTm9uTnVtYmVyKGxpbmVJdGVtLCBsaW5lRGF0YSk7XG4gICAgdmFyIGxpbmVBeGlzID0gZ2V0TGluZUF4aXMobGluZUl0ZW0sIGF4aXNEYXRhKTtcbiAgICB2YXIgbGluZVBvc2l0aW9uID0gZ2V0TGluZVBvc2l0aW9uKGxpbmVEYXRhLCBsaW5lQXhpcyk7XG4gICAgdmFyIGxpbmVGaWxsQm90dG9tUG9zID0gZ2V0TGluZUZpbGxCb3R0b21Qb3MobGluZUF4aXMpO1xuICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKHt9LCBsaW5lSXRlbSwge1xuICAgICAgbGluZVBvc2l0aW9uOiBsaW5lUG9zaXRpb24uZmlsdGVyKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfSksXG4gICAgICBsaW5lRmlsbEJvdHRvbVBvczogbGluZUZpbGxCb3R0b21Qb3NcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlTm9uTnVtYmVyKGxpbmVJdGVtLCBsaW5lRGF0YSkge1xuICB2YXIgZGF0YSA9IGxpbmVJdGVtLmRhdGE7XG4gIHJldHVybiBsaW5lRGF0YS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICByZXR1cm4gdHlwZW9mIGRhdGFbaV0gPT09ICdudW1iZXInID8gdiA6IG51bGw7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQXhpcyhsaW5lLCBheGlzRGF0YSkge1xuICB2YXIgeEF4aXNJbmRleCA9IGxpbmUueEF4aXNJbmRleCxcbiAgICAgIHlBeGlzSW5kZXggPSBsaW5lLnlBeGlzSW5kZXg7XG4gIHZhciB4QXhpcyA9IGF4aXNEYXRhLmZpbmQoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgYXhpcyA9IF9yZWYuYXhpcyxcbiAgICAgICAgaW5kZXggPSBfcmVmLmluZGV4O1xuICAgIHJldHVybiBheGlzID09PSAneCcgJiYgaW5kZXggPT09IHhBeGlzSW5kZXg7XG4gIH0pO1xuICB2YXIgeUF4aXMgPSBheGlzRGF0YS5maW5kKGZ1bmN0aW9uIChfcmVmMikge1xuICAgIHZhciBheGlzID0gX3JlZjIuYXhpcyxcbiAgICAgICAgaW5kZXggPSBfcmVmMi5pbmRleDtcbiAgICByZXR1cm4gYXhpcyA9PT0gJ3knICYmIGluZGV4ID09PSB5QXhpc0luZGV4O1xuICB9KTtcbiAgcmV0dXJuIFt4QXhpcywgeUF4aXNdO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lUG9zaXRpb24obGluZURhdGEsIGxpbmVBeGlzKSB7XG4gIHZhciB2YWx1ZUF4aXNJbmRleCA9IGxpbmVBeGlzLmZpbmRJbmRleChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICB2YXIgZGF0YSA9IF9yZWYzLmRhdGE7XG4gICAgcmV0dXJuIGRhdGEgPT09ICd2YWx1ZSc7XG4gIH0pO1xuICB2YXIgdmFsdWVBeGlzID0gbGluZUF4aXNbdmFsdWVBeGlzSW5kZXhdO1xuICB2YXIgbGFiZWxBeGlzID0gbGluZUF4aXNbMSAtIHZhbHVlQXhpc0luZGV4XTtcbiAgdmFyIGxpbmVQb3NpdGlvbiA9IHZhbHVlQXhpcy5saW5lUG9zaXRpb24sXG4gICAgICBheGlzID0gdmFsdWVBeGlzLmF4aXM7XG4gIHZhciB0aWNrUG9zaXRpb24gPSBsYWJlbEF4aXMudGlja1Bvc2l0aW9uO1xuICB2YXIgdGlja051bSA9IHRpY2tQb3NpdGlvbi5sZW5ndGg7XG4gIHZhciB2YWx1ZUF4aXNQb3NJbmRleCA9IGF4aXMgPT09ICd4JyA/IDAgOiAxO1xuICB2YXIgdmFsdWVBeGlzU3RhcnRQb3MgPSBsaW5lUG9zaXRpb25bMF1bdmFsdWVBeGlzUG9zSW5kZXhdO1xuICB2YXIgdmFsdWVBeGlzRW5kUG9zID0gbGluZVBvc2l0aW9uWzFdW3ZhbHVlQXhpc1Bvc0luZGV4XTtcbiAgdmFyIHZhbHVlQXhpc1Bvc01pbnVzID0gdmFsdWVBeGlzRW5kUG9zIC0gdmFsdWVBeGlzU3RhcnRQb3M7XG4gIHZhciBtYXhWYWx1ZSA9IHZhbHVlQXhpcy5tYXhWYWx1ZSxcbiAgICAgIG1pblZhbHVlID0gdmFsdWVBeGlzLm1pblZhbHVlO1xuICB2YXIgdmFsdWVNaW51cyA9IG1heFZhbHVlIC0gbWluVmFsdWU7XG4gIHZhciBwb3NpdGlvbiA9IG5ldyBBcnJheSh0aWNrTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgdmFyIHYgPSBsaW5lRGF0YVtpXTtcbiAgICBpZiAodHlwZW9mIHYgIT09ICdudW1iZXInKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgdmFsdWVQZXJjZW50ID0gKHYgLSBtaW5WYWx1ZSkgLyB2YWx1ZU1pbnVzO1xuICAgIGlmICh2YWx1ZU1pbnVzID09PSAwKSB2YWx1ZVBlcmNlbnQgPSAwO1xuICAgIHJldHVybiB2YWx1ZVBlcmNlbnQgKiB2YWx1ZUF4aXNQb3NNaW51cyArIHZhbHVlQXhpc1N0YXJ0UG9zO1xuICB9KTtcbiAgcmV0dXJuIHBvc2l0aW9uLm1hcChmdW5jdGlvbiAodlBvcywgaSkge1xuICAgIGlmIChpID49IHRpY2tOdW0gfHwgdHlwZW9mIHZQb3MgIT09ICdudW1iZXInKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgcG9zID0gW3ZQb3MsIHRpY2tQb3NpdGlvbltpXVsxIC0gdmFsdWVBeGlzUG9zSW5kZXhdXTtcbiAgICBpZiAodmFsdWVBeGlzUG9zSW5kZXggPT09IDApIHJldHVybiBwb3M7XG4gICAgcG9zLnJldmVyc2UoKTtcbiAgICByZXR1cm4gcG9zO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUZpbGxCb3R0b21Qb3MobGluZUF4aXMpIHtcbiAgdmFyIHZhbHVlQXhpcyA9IGxpbmVBeGlzLmZpbmQoZnVuY3Rpb24gKF9yZWY0KSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmNC5kYXRhO1xuICAgIHJldHVybiBkYXRhID09PSAndmFsdWUnO1xuICB9KTtcbiAgdmFyIGF4aXMgPSB2YWx1ZUF4aXMuYXhpcyxcbiAgICAgIGxpbmVQb3NpdGlvbiA9IHZhbHVlQXhpcy5saW5lUG9zaXRpb24sXG4gICAgICBtaW5WYWx1ZSA9IHZhbHVlQXhpcy5taW5WYWx1ZSxcbiAgICAgIG1heFZhbHVlID0gdmFsdWVBeGlzLm1heFZhbHVlO1xuICB2YXIgY2hhbmdlSW5kZXggPSBheGlzID09PSAneCcgPyAwIDogMTtcbiAgdmFyIGNoYW5nZVZhbHVlID0gbGluZVBvc2l0aW9uWzBdW2NoYW5nZUluZGV4XTtcblxuICBpZiAobWluVmFsdWUgPCAwICYmIG1heFZhbHVlID4gMCkge1xuICAgIHZhciB2YWx1ZU1pbnVzID0gbWF4VmFsdWUgLSBtaW5WYWx1ZTtcbiAgICB2YXIgcG9zTWludXMgPSBNYXRoLmFicyhsaW5lUG9zaXRpb25bMF1bY2hhbmdlSW5kZXhdIC0gbGluZVBvc2l0aW9uWzFdW2NoYW5nZUluZGV4XSk7XG4gICAgdmFyIG9mZnNldCA9IE1hdGguYWJzKG1pblZhbHVlKSAvIHZhbHVlTWludXMgKiBwb3NNaW51cztcbiAgICBpZiAoYXhpcyA9PT0gJ3knKSBvZmZzZXQgKj0gLTE7XG4gICAgY2hhbmdlVmFsdWUgKz0gb2Zmc2V0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjaGFuZ2VJbmRleDogY2hhbmdlSW5kZXgsXG4gICAgY2hhbmdlVmFsdWU6IGNoYW5nZVZhbHVlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVBcmVhQ29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsaW5lSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGxpbmVGaWxsQm90dG9tUG9zID0gbGluZUl0ZW0ubGluZUZpbGxCb3R0b21Qb3MsXG4gICAgICByTGV2ZWwgPSBsaW5lSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBbe1xuICAgIG5hbWU6IGdldExpbmVHcmFwaE5hbWUobGluZUl0ZW0pLFxuICAgIGluZGV4OiByTGV2ZWwsXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICB2aXNpYmxlOiBsaW5lSXRlbS5saW5lQXJlYS5zaG93LFxuICAgIGxpbmVGaWxsQm90dG9tUG9zOiBsaW5lRmlsbEJvdHRvbVBvcyxcbiAgICBzaGFwZTogZ2V0TGluZUFuZEFyZWFTaGFwZShsaW5lSXRlbSksXG4gICAgc3R5bGU6IGdldExpbmVBcmVhU3R5bGUobGluZUl0ZW0pLFxuICAgIGRyYXdlZDogbGluZUFyZWFEcmF3ZWRcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVBbmRBcmVhU2hhcGUobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVQb3NpdGlvbiA9IGxpbmVJdGVtLmxpbmVQb3NpdGlvbjtcbiAgcmV0dXJuIHtcbiAgICBwb2ludHM6IGxpbmVQb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lQXJlYVN0eWxlKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lQXJlYSA9IGxpbmVJdGVtLmxpbmVBcmVhLFxuICAgICAgY29sb3IgPSBsaW5lSXRlbS5jb2xvcjtcbiAgdmFyIGdyYWRpZW50ID0gbGluZUFyZWEuZ3JhZGllbnQsXG4gICAgICBzdHlsZSA9IGxpbmVBcmVhLnN0eWxlO1xuICB2YXIgZmlsbENvbG9yID0gW3N0eWxlLmZpbGwgfHwgY29sb3JdO1xuICB2YXIgZ3JhZGllbnRDb2xvciA9ICgwLCBfdXRpbC5kZWVwTWVyZ2UpKGZpbGxDb2xvciwgZ3JhZGllbnQpO1xuICBpZiAoZ3JhZGllbnRDb2xvci5sZW5ndGggPT09IDEpIGdyYWRpZW50Q29sb3IucHVzaChncmFkaWVudENvbG9yWzBdKTtcbiAgdmFyIGdyYWRpZW50UGFyYW1zID0gZ2V0R3JhZGllbnRQYXJhbXMobGluZUl0ZW0pO1xuICBzdHlsZSA9IF9vYmplY3RTcHJlYWQoe30sIHN0eWxlLCB7XG4gICAgc3Ryb2tlOiAncmdiYSgwLCAwLCAwLCAwKSdcbiAgfSk7XG4gIHJldHVybiAoMCwgX3V0aWwuZGVlcE1lcmdlKSh7XG4gICAgZ3JhZGllbnRDb2xvcjogZ3JhZGllbnRDb2xvcixcbiAgICBncmFkaWVudFBhcmFtczogZ3JhZGllbnRQYXJhbXMsXG4gICAgZ3JhZGllbnRUeXBlOiAnbGluZWFyJyxcbiAgICBncmFkaWVudFdpdGg6ICdmaWxsJ1xuICB9LCBzdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGdldEdyYWRpZW50UGFyYW1zKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lRmlsbEJvdHRvbVBvcyA9IGxpbmVJdGVtLmxpbmVGaWxsQm90dG9tUG9zLFxuICAgICAgbGluZVBvc2l0aW9uID0gbGluZUl0ZW0ubGluZVBvc2l0aW9uO1xuICB2YXIgY2hhbmdlSW5kZXggPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VJbmRleCxcbiAgICAgIGNoYW5nZVZhbHVlID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlVmFsdWU7XG4gIHZhciBtYWluUG9zID0gbGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAocCkge1xuICAgIHJldHVybiBwW2NoYW5nZUluZGV4XTtcbiAgfSk7XG4gIHZhciBtYXhQb3MgPSBNYXRoLm1heC5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG1haW5Qb3MpKTtcbiAgdmFyIG1pblBvcyA9IE1hdGgubWluLmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobWFpblBvcykpO1xuICB2YXIgYmVnaW5Qb3MgPSBtYXhQb3M7XG4gIGlmIChjaGFuZ2VJbmRleCA9PT0gMSkgYmVnaW5Qb3MgPSBtaW5Qb3M7XG5cbiAgaWYgKGNoYW5nZUluZGV4ID09PSAxKSB7XG4gICAgcmV0dXJuIFswLCBiZWdpblBvcywgMCwgY2hhbmdlVmFsdWVdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbYmVnaW5Qb3MsIDAsIGNoYW5nZVZhbHVlLCAwXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsaW5lQXJlYURyYXdlZChfcmVmNSwgX3JlZjYpIHtcbiAgdmFyIGxpbmVGaWxsQm90dG9tUG9zID0gX3JlZjUubGluZUZpbGxCb3R0b21Qb3MsXG4gICAgICBzaGFwZSA9IF9yZWY1LnNoYXBlO1xuICB2YXIgY3R4ID0gX3JlZjYuY3R4O1xuICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICB2YXIgY2hhbmdlSW5kZXggPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VJbmRleCxcbiAgICAgIGNoYW5nZVZhbHVlID0gbGluZUZpbGxCb3R0b21Qb3MuY2hhbmdlVmFsdWU7XG4gIHZhciBsaW5lUG9pbnQxID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdKTtcbiAgdmFyIGxpbmVQb2ludDIgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvaW50c1swXSk7XG4gIGxpbmVQb2ludDFbY2hhbmdlSW5kZXhdID0gY2hhbmdlVmFsdWU7XG4gIGxpbmVQb2ludDJbY2hhbmdlSW5kZXhdID0gY2hhbmdlVmFsdWU7XG4gIGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGxpbmVQb2ludDEpKTtcbiAgY3R4LmxpbmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGluZVBvaW50MikpO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIGdldFN0YXJ0TGluZUFyZWFDb25maWcobGluZUl0ZW0pIHtcbiAgdmFyIGNvbmZpZyA9IGdldExpbmVBcmVhQ29uZmlnKGxpbmVJdGVtKVswXTtcblxuICB2YXIgc3R5bGUgPSBfb2JqZWN0U3ByZWFkKHt9LCBjb25maWcuc3R5bGUpO1xuXG4gIHN0eWxlLm9wYWNpdHkgPSAwO1xuICBjb25maWcuc3R5bGUgPSBzdHlsZTtcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVVcGRhdGVMaW5lQW5kQXJlYShncmFwaHMsIGxpbmVJdGVtLCBpLCB1cGRhdGVyKSB7XG4gIHZhciBjYWNoZSA9IGdyYXBoc1tpXTtcbiAgaWYgKCFjYWNoZSkgcmV0dXJuO1xuICB2YXIgY3VycmVudE5hbWUgPSBnZXRMaW5lR3JhcGhOYW1lKGxpbmVJdGVtKTtcbiAgdmFyIHJlbmRlciA9IHVwZGF0ZXIuY2hhcnQucmVuZGVyO1xuICB2YXIgbmFtZSA9IGNhY2hlWzBdLm5hbWU7XG4gIHZhciBkZWxBbGwgPSBjdXJyZW50TmFtZSAhPT0gbmFtZTtcbiAgaWYgKCFkZWxBbGwpIHJldHVybjtcbiAgY2FjaGUuZm9yRWFjaChmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiByZW5kZXIuZGVsR3JhcGgoZyk7XG4gIH0pO1xuICBncmFwaHNbaV0gPSBudWxsO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVDaGFuZ2VMaW5lQW5kQXJlYShncmFwaCwgY29uZmlnKSB7XG4gIHZhciBwb2ludHMgPSBjb25maWcuc2hhcGUucG9pbnRzO1xuICB2YXIgZ3JhcGhQb2ludHMgPSBncmFwaC5zaGFwZS5wb2ludHM7XG4gIHZhciBncmFwaFBvaW50c051bSA9IGdyYXBoUG9pbnRzLmxlbmd0aDtcbiAgdmFyIHBvaW50c051bSA9IHBvaW50cy5sZW5ndGg7XG5cbiAgaWYgKHBvaW50c051bSA+IGdyYXBoUG9pbnRzTnVtKSB7XG4gICAgdmFyIGxhc3RQb2ludCA9IGdyYXBoUG9pbnRzLnNsaWNlKC0xKVswXTtcbiAgICB2YXIgbmV3QWRkUG9pbnRzID0gbmV3IEFycmF5KHBvaW50c051bSAtIGdyYXBoUG9pbnRzTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vKSB7XG4gICAgICByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShsYXN0UG9pbnQpO1xuICAgIH0pO1xuICAgIGdyYXBoUG9pbnRzLnB1c2guYXBwbHkoZ3JhcGhQb2ludHMsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobmV3QWRkUG9pbnRzKSk7XG4gIH0gZWxzZSBpZiAocG9pbnRzTnVtIDwgZ3JhcGhQb2ludHNOdW0pIHtcbiAgICBncmFwaFBvaW50cy5zcGxpY2UocG9pbnRzTnVtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMaW5lQ29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsaW5lSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGxpbmVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogZ2V0TGluZUdyYXBoTmFtZShsaW5lSXRlbSksXG4gICAgaW5kZXg6IHJMZXZlbCArIDEsXG4gICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICBzaGFwZTogZ2V0TGluZUFuZEFyZWFTaGFwZShsaW5lSXRlbSksXG4gICAgc3R5bGU6IGdldExpbmVTdHlsZShsaW5lSXRlbSlcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldExpbmVHcmFwaE5hbWUobGluZUl0ZW0pIHtcbiAgdmFyIHNtb290aCA9IGxpbmVJdGVtLnNtb290aDtcbiAgcmV0dXJuIHNtb290aCA/ICdzbW9vdGhsaW5lJyA6ICdwb2x5bGluZSc7XG59XG5cbmZ1bmN0aW9uIGdldExpbmVTdHlsZShsaW5lSXRlbSkge1xuICB2YXIgbGluZVN0eWxlID0gbGluZUl0ZW0ubGluZVN0eWxlLFxuICAgICAgY29sb3IgPSBsaW5lSXRlbS5jb2xvcixcbiAgICAgIHNtb290aCA9IGxpbmVJdGVtLnNtb290aCxcbiAgICAgIGxpbmVQb3NpdGlvbiA9IGxpbmVJdGVtLmxpbmVQb3NpdGlvbjtcbiAgdmFyIGxpbmVMZW5ndGggPSBnZXRMaW5lTGVuZ3RoKGxpbmVQb3NpdGlvbiwgc21vb3RoKTtcbiAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKHtcbiAgICBzdHJva2U6IGNvbG9yLFxuICAgIGxpbmVEYXNoOiBbbGluZUxlbmd0aCwgMF1cbiAgfSwgbGluZVN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZUxlbmd0aChwb2ludHMpIHtcbiAgdmFyIHNtb290aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gIGlmICghc21vb3RoKSByZXR1cm4gKDAsIF91dGlsLmdldFBvbHlsaW5lTGVuZ3RoKShwb2ludHMpO1xuICB2YXIgY3VydmUgPSBwb2x5bGluZVRvQmV6aWVyQ3VydmUocG9pbnRzKTtcbiAgcmV0dXJuIGdldEJlemllckN1cnZlTGVuZ3RoKGN1cnZlKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRMaW5lQ29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lRGFzaCA9IGxpbmVJdGVtLmxpbmVTdHlsZS5saW5lRGFzaDtcbiAgdmFyIGNvbmZpZyA9IGdldExpbmVDb25maWcobGluZUl0ZW0pWzBdO1xuICB2YXIgcmVhbExpbmVEYXNoID0gY29uZmlnLnN0eWxlLmxpbmVEYXNoO1xuXG4gIGlmIChsaW5lRGFzaCkge1xuICAgIHJlYWxMaW5lRGFzaCA9IFswLCAwXTtcbiAgfSBlbHNlIHtcbiAgICByZWFsTGluZURhc2ggPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHJlYWxMaW5lRGFzaCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgY29uZmlnLnN0eWxlLmxpbmVEYXNoID0gcmVhbExpbmVEYXNoO1xuICByZXR1cm4gW2NvbmZpZ107XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50Q29uZmlnKGxpbmVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IGxpbmVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBsaW5lSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IGxpbmVJdGVtLnJMZXZlbDtcbiAgdmFyIHNoYXBlcyA9IGdldFBvaW50U2hhcGVzKGxpbmVJdGVtKTtcbiAgdmFyIHN0eWxlID0gZ2V0UG9pbnRTdHlsZShsaW5lSXRlbSk7XG4gIHJldHVybiBzaGFwZXMubWFwKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnY2lyY2xlJyxcbiAgICAgIGluZGV4OiByTGV2ZWwgKyAyLFxuICAgICAgdmlzaWJsZTogbGluZUl0ZW0ubGluZVBvaW50LnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogc2hhcGUsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRTaGFwZXMobGluZUl0ZW0pIHtcbiAgdmFyIGxpbmVQb3NpdGlvbiA9IGxpbmVJdGVtLmxpbmVQb3NpdGlvbixcbiAgICAgIHJhZGl1cyA9IGxpbmVJdGVtLmxpbmVQb2ludC5yYWRpdXM7XG4gIHJldHVybiBsaW5lUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChfcmVmNykge1xuICAgIHZhciBfcmVmOCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNywgMiksXG4gICAgICAgIHJ4ID0gX3JlZjhbMF0sXG4gICAgICAgIHJ5ID0gX3JlZjhbMV07XG5cbiAgICByZXR1cm4ge1xuICAgICAgcjogcmFkaXVzLFxuICAgICAgcng6IHJ4LFxuICAgICAgcnk6IHJ5XG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFBvaW50U3R5bGUobGluZUl0ZW0pIHtcbiAgdmFyIGNvbG9yID0gbGluZUl0ZW0uY29sb3IsXG4gICAgICBzdHlsZSA9IGxpbmVJdGVtLmxpbmVQb2ludC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbC5kZWVwTWVyZ2UpKHtcbiAgICBzdHJva2U6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRQb2ludENvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgY29uZmlncyA9IGdldFBvaW50Q29uZmlnKGxpbmVJdGVtKTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICBjb25maWcuc2hhcGUuciA9IDAuMTtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbENvbmZpZyhsaW5lSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBsaW5lSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gbGluZUl0ZW0uYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSBsaW5lSXRlbS5yTGV2ZWw7XG4gIHZhciBzaGFwZXMgPSBnZXRMYWJlbFNoYXBlcyhsaW5lSXRlbSk7XG4gIHZhciBzdHlsZSA9IGdldExhYmVsU3R5bGUobGluZUl0ZW0pO1xuICByZXR1cm4gc2hhcGVzLm1hcChmdW5jdGlvbiAoc2hhcGUsIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCArIDMsXG4gICAgICB2aXNpYmxlOiBsaW5lSXRlbS5sYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgc3R5bGU6IHN0eWxlXG4gICAgfTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU2hhcGVzKGxpbmVJdGVtKSB7XG4gIHZhciBjb250ZW50cyA9IGZvcm1hdHRlckxhYmVsKGxpbmVJdGVtKTtcbiAgdmFyIHBvc2l0aW9uID0gZ2V0TGFiZWxQb3NpdGlvbihsaW5lSXRlbSk7XG4gIHJldHVybiBjb250ZW50cy5tYXAoZnVuY3Rpb24gKGNvbnRlbnQsIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbltpXVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbFBvc2l0aW9uKGxpbmVJdGVtKSB7XG4gIHZhciBsaW5lUG9zaXRpb24gPSBsaW5lSXRlbS5saW5lUG9zaXRpb24sXG4gICAgICBsaW5lRmlsbEJvdHRvbVBvcyA9IGxpbmVJdGVtLmxpbmVGaWxsQm90dG9tUG9zLFxuICAgICAgbGFiZWwgPSBsaW5lSXRlbS5sYWJlbDtcbiAgdmFyIHBvc2l0aW9uID0gbGFiZWwucG9zaXRpb24sXG4gICAgICBvZmZzZXQgPSBsYWJlbC5vZmZzZXQ7XG4gIHZhciBjaGFuZ2VJbmRleCA9IGxpbmVGaWxsQm90dG9tUG9zLmNoYW5nZUluZGV4LFxuICAgICAgY2hhbmdlVmFsdWUgPSBsaW5lRmlsbEJvdHRvbVBvcy5jaGFuZ2VWYWx1ZTtcbiAgcmV0dXJuIGxpbmVQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKHBvcykge1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHBvcyA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zKTtcbiAgICAgIHBvc1tjaGFuZ2VJbmRleF0gPSBjaGFuZ2VWYWx1ZTtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09ICdjZW50ZXInKSB7XG4gICAgICB2YXIgYm90dG9tID0gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShwb3MpO1xuICAgICAgYm90dG9tW2NoYW5nZUluZGV4XSA9IGNoYW5nZVZhbHVlO1xuICAgICAgcG9zID0gZ2V0Q2VudGVyTGFiZWxQb2ludChwb3MsIGJvdHRvbSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldE9mZnNldGVkUG9pbnQocG9zLCBvZmZzZXQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0T2Zmc2V0ZWRQb2ludChfcmVmOSwgX3JlZjEwKSB7XG4gIHZhciBfcmVmMTEgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjksIDIpLFxuICAgICAgeCA9IF9yZWYxMVswXSxcbiAgICAgIHkgPSBfcmVmMTFbMV07XG5cbiAgdmFyIF9yZWYxMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTAsIDIpLFxuICAgICAgb3ggPSBfcmVmMTJbMF0sXG4gICAgICBveSA9IF9yZWYxMlsxXTtcblxuICByZXR1cm4gW3ggKyBveCwgeSArIG95XTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2VudGVyTGFiZWxQb2ludChfcmVmMTMsIF9yZWYxNCkge1xuICB2YXIgX3JlZjE1ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMywgMiksXG4gICAgICBheCA9IF9yZWYxNVswXSxcbiAgICAgIGF5ID0gX3JlZjE1WzFdO1xuXG4gIHZhciBfcmVmMTYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjE0LCAyKSxcbiAgICAgIGJ4ID0gX3JlZjE2WzBdLFxuICAgICAgYnkgPSBfcmVmMTZbMV07XG5cbiAgcmV0dXJuIFsoYXggKyBieCkgLyAyLCAoYXkgKyBieSkgLyAyXTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0dGVyTGFiZWwobGluZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBsaW5lSXRlbS5kYXRhLFxuICAgICAgZm9ybWF0dGVyID0gbGluZUl0ZW0ubGFiZWwuZm9ybWF0dGVyO1xuICBkYXRhID0gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gdHlwZW9mIGQgPT09ICdudW1iZXInO1xuICB9KS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICByZXR1cm4gZC50b1N0cmluZygpO1xuICB9KTtcbiAgaWYgKCFmb3JtYXR0ZXIpIHJldHVybiBkYXRhO1xuICB2YXIgdHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gIGlmICh0eXBlID09PSAnc3RyaW5nJykgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgcmV0dXJuIGZvcm1hdHRlci5yZXBsYWNlKCd7dmFsdWV9JywgZCk7XG4gIH0pO1xuICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICByZXR1cm4gZm9ybWF0dGVyKHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGRhdGE7XG59XG5cbmZ1bmN0aW9uIGdldExhYmVsU3R5bGUobGluZUl0ZW0pIHtcbiAgdmFyIGNvbG9yID0gbGluZUl0ZW0uY29sb3IsXG4gICAgICBzdHlsZSA9IGxpbmVJdGVtLmxhYmVsLnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsLmRlZXBNZXJnZSkoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMubWVyZ2VDb2xvciA9IG1lcmdlQ29sb3I7XG5cbnZhciBfY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZ1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG1lcmdlQ29sb3IoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBkZWZhdWx0Q29sb3IgPSAoMCwgX3V0aWwuZGVlcENsb25lKShfY29uZmlnLmNvbG9yQ29uZmlnLCB0cnVlKTtcbiAgdmFyIGNvbG9yID0gb3B0aW9uLmNvbG9yLFxuICAgICAgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgaWYgKCFzZXJpZXMpIHNlcmllcyA9IFtdO1xuICBpZiAoIWNvbG9yKSBjb2xvciA9IFtdO1xuICBvcHRpb24uY29sb3IgPSBjb2xvciA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKShkZWZhdWx0Q29sb3IsIGNvbG9yKTtcbiAgaWYgKCFzZXJpZXMubGVuZ3RoKSByZXR1cm47XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgc2VyaWVzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICBpZiAoaXRlbS5jb2xvcikgcmV0dXJuO1xuICAgIGl0ZW0uY29sb3IgPSBjb2xvcltpICUgY29sb3JOdW1dO1xuICB9KTtcbiAgdmFyIHBpZXMgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIHR5cGUgPSBfcmVmLnR5cGU7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdwaWUnO1xuICB9KTtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICByZXR1cm4gcGllLmRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZGksIGkpIHtcbiAgICAgIHJldHVybiBkaS5jb2xvciA9IGNvbG9yW2kgJSBjb2xvck51bV07XG4gICAgfSk7XG4gIH0pO1xuICB2YXIgZ2F1Z2VzID0gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgdHlwZSA9IF9yZWYyLnR5cGU7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdnYXVnZSc7XG4gIH0pO1xuICBnYXVnZXMuZm9yRWFjaChmdW5jdGlvbiAoZ2F1Z2UpIHtcbiAgICByZXR1cm4gZ2F1Z2UuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkaSwgaSkge1xuICAgICAgcmV0dXJuIGRpLmNvbG9yID0gY29sb3JbaSAlIGNvbG9yTnVtXTtcbiAgICB9KTtcbiAgfSk7XG4gIHZhciBiYXJXaXRoSW5kZXBlbmRlbnRDb2xvciA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIHR5cGUgPSBfcmVmMy50eXBlLFxuICAgICAgICBpbmRlcGVuZGVudENvbG9yID0gX3JlZjMuaW5kZXBlbmRlbnRDb2xvcjtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2JhcicgJiYgaW5kZXBlbmRlbnRDb2xvcjtcbiAgfSk7XG4gIGJhcldpdGhJbmRlcGVuZGVudENvbG9yLmZvckVhY2goZnVuY3Rpb24gKGJhcikge1xuICAgIGlmIChiYXIuaW5kZXBlbmRlbnRDb2xvcnMpIHJldHVybjtcbiAgICBiYXIuaW5kZXBlbmRlbnRDb2xvcnMgPSBjb2xvcjtcbiAgfSk7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5waWUgPSBwaWU7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX3BpZSA9IHJlcXVpcmUoXCIuLi9jb25maWcvcGllXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiQGppYW1pbmdoaS9jLXJlbmRlci9saWIvcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIHBpZShjaGFydCkge1xuICB2YXIgb3B0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgdmFyIHNlcmllcyA9IG9wdGlvbi5zZXJpZXM7XG4gIGlmICghc2VyaWVzKSBzZXJpZXMgPSBbXTtcbiAgdmFyIHBpZXMgPSAoMCwgX3V0aWwyLmluaXROZWVkU2VyaWVzKShzZXJpZXMsIF9waWUucGllQ29uZmlnLCAncGllJyk7XG4gIHBpZXMgPSBjYWxjUGllc0NlbnRlcihwaWVzLCBjaGFydCk7XG4gIHBpZXMgPSBjYWxjUGllc1JhZGl1cyhwaWVzLCBjaGFydCk7XG4gIHBpZXMgPSBjYWxjUm9zZVBpZXNSYWRpdXMocGllcywgY2hhcnQpO1xuICBwaWVzID0gY2FsY1BpZXNQZXJjZW50KHBpZXMpO1xuICBwaWVzID0gY2FsY1BpZXNBbmdsZShwaWVzLCBjaGFydCk7XG4gIHBpZXMgPSBjYWxjUGllc0luc2lkZUxhYmVsUG9zKHBpZXMpO1xuICBwaWVzID0gY2FsY1BpZXNFZGdlQ2VudGVyUG9zKHBpZXMpO1xuICBwaWVzID0gY2FsY1BpZXNPdXRTaWRlTGFiZWxQb3MocGllcyk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHBpZXMsXG4gICAga2V5OiAncGllJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0UGllQ29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0UGllQ29uZmlnLFxuICAgIGJlZm9yZUNoYW5nZTogYmVmb3JlQ2hhbmdlUGllXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBwaWVzLFxuICAgIGtleTogJ3BpZUluc2lkZUxhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0SW5zaWRlTGFiZWxDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHBpZXMsXG4gICAga2V5OiAncGllT3V0c2lkZUxhYmVsTGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldE91dHNpZGVMYWJlbExpbmVDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiBwaWVzLFxuICAgIGtleTogJ3BpZU91dHNpZGVMYWJlbCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldE91dHNpZGVMYWJlbENvbmZpZyxcbiAgICBnZXRTdGFydEdyYXBoQ29uZmlnOiBnZXRTdGFydE91dHNpZGVMYWJlbENvbmZpZ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNDZW50ZXIocGllcywgY2hhcnQpIHtcbiAgdmFyIGFyZWEgPSBjaGFydC5yZW5kZXIuYXJlYTtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgY2VudGVyID0gcGllLmNlbnRlcjtcbiAgICBjZW50ZXIgPSBjZW50ZXIubWFwKGZ1bmN0aW9uIChwb3MsIGkpIHtcbiAgICAgIGlmICh0eXBlb2YgcG9zID09PSAnbnVtYmVyJykgcmV0dXJuIHBvcztcbiAgICAgIHJldHVybiBwYXJzZUludChwb3MpIC8gMTAwICogYXJlYVtpXTtcbiAgICB9KTtcbiAgICBwaWUuY2VudGVyID0gY2VudGVyO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNQaWVzUmFkaXVzKHBpZXMsIGNoYXJ0KSB7XG4gIHZhciBtYXhSYWRpdXMgPSBNYXRoLm1pbi5hcHBseShNYXRoLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNoYXJ0LnJlbmRlci5hcmVhKSkgLyAyO1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHZhciByYWRpdXMgPSBwaWUucmFkaXVzLFxuICAgICAgICBkYXRhID0gcGllLmRhdGE7XG4gICAgcmFkaXVzID0gZ2V0TnVtYmVyUmFkaXVzKHJhZGl1cywgbWF4UmFkaXVzKTtcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBpdGVtUmFkaXVzID0gaXRlbS5yYWRpdXM7XG4gICAgICBpZiAoIWl0ZW1SYWRpdXMpIGl0ZW1SYWRpdXMgPSByYWRpdXM7XG4gICAgICBpdGVtUmFkaXVzID0gZ2V0TnVtYmVyUmFkaXVzKGl0ZW1SYWRpdXMsIG1heFJhZGl1cyk7XG4gICAgICBpdGVtLnJhZGl1cyA9IGl0ZW1SYWRpdXM7XG4gICAgfSk7XG4gICAgcGllLnJhZGl1cyA9IHJhZGl1cztcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBnZXROdW1iZXJSYWRpdXMocmFkaXVzLCBtYXhSYWRpdXMpIHtcbiAgaWYgKCEocmFkaXVzIGluc3RhbmNlb2YgQXJyYXkpKSByYWRpdXMgPSBbMCwgcmFkaXVzXTtcbiAgcmFkaXVzID0gcmFkaXVzLm1hcChmdW5jdGlvbiAocikge1xuICAgIGlmICh0eXBlb2YgciA9PT0gJ251bWJlcicpIHJldHVybiByO1xuICAgIHJldHVybiBwYXJzZUludChyKSAvIDEwMCAqIG1heFJhZGl1cztcbiAgfSk7XG4gIHJldHVybiByYWRpdXM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSb3NlUGllc1JhZGl1cyhwaWVzLCBjaGFydCkge1xuICB2YXIgcm9zZVBpZSA9IHBpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIHJvc2VUeXBlID0gX3JlZi5yb3NlVHlwZTtcbiAgICByZXR1cm4gcm9zZVR5cGU7XG4gIH0pO1xuICByb3NlUGllLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHZhciByYWRpdXMgPSBwaWUucmFkaXVzLFxuICAgICAgICBkYXRhID0gcGllLmRhdGEsXG4gICAgICAgIHJvc2VTb3J0ID0gcGllLnJvc2VTb3J0O1xuICAgIHZhciByb3NlSW5jcmVtZW50ID0gZ2V0Um9zZUluY3JlbWVudChwaWUpO1xuICAgIHZhciBkYXRhQ29weSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZGF0YSk7XG4gICAgZGF0YSA9IHNvcnREYXRhKGRhdGEpO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgaXRlbS5yYWRpdXNbMV0gPSByYWRpdXNbMV0gLSByb3NlSW5jcmVtZW50ICogaTtcbiAgICB9KTtcblxuICAgIGlmIChyb3NlU29ydCkge1xuICAgICAgZGF0YS5yZXZlcnNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBpZS5kYXRhID0gZGF0YUNvcHk7XG4gICAgfVxuXG4gICAgcGllLnJvc2VJbmNyZW1lbnQgPSByb3NlSW5jcmVtZW50O1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIHNvcnREYXRhKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEuc29ydChmdW5jdGlvbiAoX3JlZjIsIF9yZWYzKSB7XG4gICAgdmFyIGEgPSBfcmVmMi52YWx1ZTtcbiAgICB2YXIgYiA9IF9yZWYzLnZhbHVlO1xuICAgIGlmIChhID09PSBiKSByZXR1cm4gMDtcbiAgICBpZiAoYSA+IGIpIHJldHVybiAtMTtcbiAgICBpZiAoYSA8IGIpIHJldHVybiAxO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0Um9zZUluY3JlbWVudChwaWUpIHtcbiAgdmFyIHJhZGl1cyA9IHBpZS5yYWRpdXMsXG4gICAgICByb3NlSW5jcmVtZW50ID0gcGllLnJvc2VJbmNyZW1lbnQ7XG4gIGlmICh0eXBlb2Ygcm9zZUluY3JlbWVudCA9PT0gJ251bWJlcicpIHJldHVybiByb3NlSW5jcmVtZW50O1xuXG4gIGlmIChyb3NlSW5jcmVtZW50ID09PSAnYXV0bycpIHtcbiAgICB2YXIgZGF0YSA9IHBpZS5kYXRhO1xuICAgIHZhciBhbGxSYWRpdXMgPSBkYXRhLnJlZHVjZShmdW5jdGlvbiAoYWxsLCBfcmVmNCkge1xuICAgICAgdmFyIHJhZGl1cyA9IF9yZWY0LnJhZGl1cztcbiAgICAgIHJldHVybiBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhbGwpLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHJhZGl1cykpO1xuICAgIH0sIFtdKTtcbiAgICB2YXIgbWluUmFkaXVzID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhbGxSYWRpdXMpKTtcbiAgICB2YXIgbWF4UmFkaXVzID0gTWF0aC5tYXguYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhbGxSYWRpdXMpKTtcbiAgICByZXR1cm4gKG1heFJhZGl1cyAtIG1pblJhZGl1cykgKiAwLjYgLyAoZGF0YS5sZW5ndGggLSAxIHx8IDEpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlSW50KHJvc2VJbmNyZW1lbnQpIC8gMTAwICogcmFkaXVzWzFdO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc1BlcmNlbnQocGllcykge1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZSkge1xuICAgIHZhciBkYXRhID0gcGllLmRhdGEsXG4gICAgICAgIHBlcmNlbnRUb0ZpeGVkID0gcGllLnBlcmNlbnRUb0ZpeGVkO1xuICAgIHZhciBzdW0gPSBnZXREYXRhU3VtKGRhdGEpO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIHZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICAgIGl0ZW0ucGVyY2VudCA9IHRvRml4ZWROb0NlaWwodmFsdWUgLyBzdW0gKiAxMDAsIHBlcmNlbnRUb0ZpeGVkKTtcbiAgICB9KTtcbiAgICB2YXIgcGVyY2VudFN1bU5vTGFzdCA9ICgwLCBfdXRpbDIubXVsQWRkKShkYXRhLnNsaWNlKDAsIC0xKS5tYXAoZnVuY3Rpb24gKF9yZWY1KSB7XG4gICAgICB2YXIgcGVyY2VudCA9IF9yZWY1LnBlcmNlbnQ7XG4gICAgICByZXR1cm4gcGVyY2VudDtcbiAgICB9KSk7XG4gICAgZGF0YS5zbGljZSgtMSlbMF0ucGVyY2VudCA9IHRvRml4ZWROb0NlaWwoMTAwIC0gcGVyY2VudFN1bU5vTGFzdCwgcGVyY2VudFRvRml4ZWQpO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIHRvRml4ZWROb0NlaWwobnVtYmVyKSB7XG4gIHZhciB0b0ZpeGVkID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICB2YXIgc3RyaW5nTnVtYmVyID0gbnVtYmVyLnRvU3RyaW5nKCk7XG4gIHZhciBzcGxpdGVkTnVtYmVyID0gc3RyaW5nTnVtYmVyLnNwbGl0KCcuJyk7XG4gIHZhciBkZWNpbWFsID0gc3BsaXRlZE51bWJlclsxXSB8fCAnMCc7XG4gIHZhciBmaXhlZERlY2ltYWwgPSBkZWNpbWFsLnNsaWNlKDAsIHRvRml4ZWQpO1xuICBzcGxpdGVkTnVtYmVyWzFdID0gZml4ZWREZWNpbWFsO1xuICByZXR1cm4gcGFyc2VGbG9hdChzcGxpdGVkTnVtYmVyLmpvaW4oJy4nKSk7XG59XG5cbmZ1bmN0aW9uIGdldERhdGFTdW0oZGF0YSkge1xuICByZXR1cm4gKDAsIF91dGlsMi5tdWxBZGQpKGRhdGEubWFwKGZ1bmN0aW9uIChfcmVmNikge1xuICAgIHZhciB2YWx1ZSA9IF9yZWY2LnZhbHVlO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfSkpO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc0FuZ2xlKHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgc3RhcnQgPSBwaWUuc3RhcnRBbmdsZSxcbiAgICAgICAgZGF0YSA9IHBpZS5kYXRhO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSkge1xuICAgICAgdmFyIF9nZXREYXRhQW5nbGUgPSBnZXREYXRhQW5nbGUoZGF0YSwgaSksXG4gICAgICAgICAgX2dldERhdGFBbmdsZTIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX2dldERhdGFBbmdsZSwgMiksXG4gICAgICAgICAgc3RhcnRBbmdsZSA9IF9nZXREYXRhQW5nbGUyWzBdLFxuICAgICAgICAgIGVuZEFuZ2xlID0gX2dldERhdGFBbmdsZTJbMV07XG5cbiAgICAgIGl0ZW0uc3RhcnRBbmdsZSA9IHN0YXJ0ICsgc3RhcnRBbmdsZTtcbiAgICAgIGl0ZW0uZW5kQW5nbGUgPSBzdGFydCArIGVuZEFuZ2xlO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIHBpZXM7XG59XG5cbmZ1bmN0aW9uIGdldERhdGFBbmdsZShkYXRhLCBpKSB7XG4gIHZhciBmdWxsQW5nbGUgPSBNYXRoLlBJICogMjtcbiAgdmFyIG5lZWRBZGREYXRhID0gZGF0YS5zbGljZSgwLCBpICsgMSk7XG4gIHZhciBwZXJjZW50U3VtID0gKDAsIF91dGlsMi5tdWxBZGQpKG5lZWRBZGREYXRhLm1hcChmdW5jdGlvbiAoX3JlZjcpIHtcbiAgICB2YXIgcGVyY2VudCA9IF9yZWY3LnBlcmNlbnQ7XG4gICAgcmV0dXJuIHBlcmNlbnQ7XG4gIH0pKTtcbiAgdmFyIHBlcmNlbnQgPSBkYXRhW2ldLnBlcmNlbnQ7XG4gIHZhciBzdGFydFBlcmNlbnQgPSBwZXJjZW50U3VtIC0gcGVyY2VudDtcbiAgcmV0dXJuIFtmdWxsQW5nbGUgKiBzdGFydFBlcmNlbnQgLyAxMDAsIGZ1bGxBbmdsZSAqIHBlcmNlbnRTdW0gLyAxMDBdO1xufVxuXG5mdW5jdGlvbiBjYWxjUGllc0luc2lkZUxhYmVsUG9zKHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWVJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpdGVtLmluc2lkZUxhYmVsUG9zID0gZ2V0UGllSW5zaWRlTGFiZWxQb3MocGllSXRlbSwgaXRlbSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gZ2V0UGllSW5zaWRlTGFiZWxQb3MocGllSXRlbSwgZGF0YUl0ZW0pIHtcbiAgdmFyIGNlbnRlciA9IHBpZUl0ZW0uY2VudGVyO1xuXG4gIHZhciBzdGFydEFuZ2xlID0gZGF0YUl0ZW0uc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlID0gZGF0YUl0ZW0uZW5kQW5nbGUsXG4gICAgICBfZGF0YUl0ZW0kcmFkaXVzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGRhdGFJdGVtLnJhZGl1cywgMiksXG4gICAgICBpciA9IF9kYXRhSXRlbSRyYWRpdXNbMF0sXG4gICAgICBvciA9IF9kYXRhSXRlbSRyYWRpdXNbMV07XG5cbiAgdmFyIHJhZGl1cyA9IChpciArIG9yKSAvIDI7XG4gIHZhciBhbmdsZSA9IChzdGFydEFuZ2xlICsgZW5kQW5nbGUpIC8gMjtcbiAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzLCBhbmdsZV0pKTtcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNFZGdlQ2VudGVyUG9zKHBpZXMpIHtcbiAgcGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwaWUpIHtcbiAgICB2YXIgZGF0YSA9IHBpZS5kYXRhLFxuICAgICAgICBjZW50ZXIgPSBwaWUuY2VudGVyO1xuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIHN0YXJ0QW5nbGUgPSBpdGVtLnN0YXJ0QW5nbGUsXG4gICAgICAgICAgZW5kQW5nbGUgPSBpdGVtLmVuZEFuZ2xlLFxuICAgICAgICAgIHJhZGl1cyA9IGl0ZW0ucmFkaXVzO1xuICAgICAgdmFyIGNlbnRlckFuZ2xlID0gKHN0YXJ0QW5nbGUgKyBlbmRBbmdsZSkgLyAyO1xuXG4gICAgICB2YXIgcG9zID0gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlcikuY29uY2F0KFtyYWRpdXNbMV0sIGNlbnRlckFuZ2xlXSkpO1xuXG4gICAgICBpdGVtLmVkZ2VDZW50ZXJQb3MgPSBwb3M7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcGllcztcbn1cblxuZnVuY3Rpb24gY2FsY1BpZXNPdXRTaWRlTGFiZWxQb3MocGllcykge1xuICBwaWVzLmZvckVhY2goZnVuY3Rpb24gKHBpZUl0ZW0pIHtcbiAgICB2YXIgbGVmdFBpZURhdGFJdGVtcyA9IGdldExlZnRPclJpZ2h0UGllRGF0YUl0ZW1zKHBpZUl0ZW0pO1xuICAgIHZhciByaWdodFBpZURhdGFJdGVtcyA9IGdldExlZnRPclJpZ2h0UGllRGF0YUl0ZW1zKHBpZUl0ZW0sIGZhbHNlKTtcbiAgICBsZWZ0UGllRGF0YUl0ZW1zID0gc29ydFBpZXNGcm9tVG9wVG9Cb3R0b20obGVmdFBpZURhdGFJdGVtcyk7XG4gICAgcmlnaHRQaWVEYXRhSXRlbXMgPSBzb3J0UGllc0Zyb21Ub3BUb0JvdHRvbShyaWdodFBpZURhdGFJdGVtcyk7XG4gICAgYWRkTGFiZWxMaW5lQW5kQWxpZ24obGVmdFBpZURhdGFJdGVtcywgcGllSXRlbSk7XG4gICAgYWRkTGFiZWxMaW5lQW5kQWxpZ24ocmlnaHRQaWVEYXRhSXRlbXMsIHBpZUl0ZW0sIGZhbHNlKTtcbiAgfSk7XG4gIHJldHVybiBwaWVzO1xufVxuXG5mdW5jdGlvbiBnZXRMYWJlbExpbmVCZW5kUmFkaXVzKHBpZUl0ZW0pIHtcbiAgdmFyIGxhYmVsTGluZUJlbmRHYXAgPSBwaWVJdGVtLm91dHNpZGVMYWJlbC5sYWJlbExpbmVCZW5kR2FwO1xuICB2YXIgbWF4UmFkaXVzID0gZ2V0UGllTWF4UmFkaXVzKHBpZUl0ZW0pO1xuXG4gIGlmICh0eXBlb2YgbGFiZWxMaW5lQmVuZEdhcCAhPT0gJ251bWJlcicpIHtcbiAgICBsYWJlbExpbmVCZW5kR2FwID0gcGFyc2VJbnQobGFiZWxMaW5lQmVuZEdhcCkgLyAxMDAgKiBtYXhSYWRpdXM7XG4gIH1cblxuICByZXR1cm4gbGFiZWxMaW5lQmVuZEdhcCArIG1heFJhZGl1cztcbn1cblxuZnVuY3Rpb24gZ2V0UGllTWF4UmFkaXVzKHBpZUl0ZW0pIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciByYWRpdXMgPSBkYXRhLm1hcChmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgX3JlZjgkcmFkaXVzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4LnJhZGl1cywgMiksXG4gICAgICAgIGZvbyA9IF9yZWY4JHJhZGl1c1swXSxcbiAgICAgICAgciA9IF9yZWY4JHJhZGl1c1sxXTtcblxuICAgIHJldHVybiByO1xuICB9KTtcbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocmFkaXVzKSk7XG59XG5cbmZ1bmN0aW9uIGdldExlZnRPclJpZ2h0UGllRGF0YUl0ZW1zKHBpZUl0ZW0pIHtcbiAgdmFyIGxlZnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHRydWU7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhLFxuICAgICAgY2VudGVyID0gcGllSXRlbS5jZW50ZXI7XG4gIHZhciBjZW50ZXJYUG9zID0gY2VudGVyWzBdO1xuICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24gKF9yZWY5KSB7XG4gICAgdmFyIGVkZ2VDZW50ZXJQb3MgPSBfcmVmOS5lZGdlQ2VudGVyUG9zO1xuICAgIHZhciB4UG9zID0gZWRnZUNlbnRlclBvc1swXTtcbiAgICBpZiAobGVmdCkgcmV0dXJuIHhQb3MgPD0gY2VudGVyWFBvcztcbiAgICByZXR1cm4geFBvcyA+IGNlbnRlclhQb3M7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzb3J0UGllc0Zyb21Ub3BUb0JvdHRvbShkYXRhSXRlbSkge1xuICBkYXRhSXRlbS5zb3J0KGZ1bmN0aW9uIChfcmVmMTAsIF9yZWYxMSkge1xuICAgIHZhciBfcmVmMTAkZWRnZUNlbnRlclBvcyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTAuZWRnZUNlbnRlclBvcywgMiksXG4gICAgICAgIHQgPSBfcmVmMTAkZWRnZUNlbnRlclBvc1swXSxcbiAgICAgICAgYXkgPSBfcmVmMTAkZWRnZUNlbnRlclBvc1sxXTtcblxuICAgIHZhciBfcmVmMTEkZWRnZUNlbnRlclBvcyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMTEuZWRnZUNlbnRlclBvcywgMiksXG4gICAgICAgIHR0ID0gX3JlZjExJGVkZ2VDZW50ZXJQb3NbMF0sXG4gICAgICAgIGJ5ID0gX3JlZjExJGVkZ2VDZW50ZXJQb3NbMV07XG5cbiAgICBpZiAoYXkgPiBieSkgcmV0dXJuIDE7XG4gICAgaWYgKGF5IDwgYnkpIHJldHVybiAtMTtcbiAgICBpZiAoYXkgPT09IGJ5KSByZXR1cm4gMDtcbiAgfSk7XG4gIHJldHVybiBkYXRhSXRlbTtcbn1cblxuZnVuY3Rpb24gYWRkTGFiZWxMaW5lQW5kQWxpZ24oZGF0YUl0ZW0sIHBpZUl0ZW0pIHtcbiAgdmFyIGxlZnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHRydWU7XG4gIHZhciBjZW50ZXIgPSBwaWVJdGVtLmNlbnRlcixcbiAgICAgIG91dHNpZGVMYWJlbCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsO1xuICB2YXIgcmFkaXVzID0gZ2V0TGFiZWxMaW5lQmVuZFJhZGl1cyhwaWVJdGVtKTtcbiAgZGF0YUl0ZW0uZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHZhciBlZGdlQ2VudGVyUG9zID0gaXRlbS5lZGdlQ2VudGVyUG9zLFxuICAgICAgICBzdGFydEFuZ2xlID0gaXRlbS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IGl0ZW0uZW5kQW5nbGU7XG4gICAgdmFyIGxhYmVsTGluZUVuZExlbmd0aCA9IG91dHNpZGVMYWJlbC5sYWJlbExpbmVFbmRMZW5ndGg7XG4gICAgdmFyIGFuZ2xlID0gKHN0YXJ0QW5nbGUgKyBlbmRBbmdsZSkgLyAyO1xuXG4gICAgdmFyIGJlbmRQb2ludCA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXIpLmNvbmNhdChbcmFkaXVzLCBhbmdsZV0pKTtcblxuICAgIHZhciBlbmRQb2ludCA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoYmVuZFBvaW50KTtcbiAgICBlbmRQb2ludFswXSArPSBsYWJlbExpbmVFbmRMZW5ndGggKiAobGVmdCA/IC0xIDogMSk7XG4gICAgaXRlbS5sYWJlbExpbmUgPSBbZWRnZUNlbnRlclBvcywgYmVuZFBvaW50LCBlbmRQb2ludF07XG4gICAgaXRlbS5sYWJlbExpbmVMZW5ndGggPSAoMCwgX3V0aWwyLmdldFBvbHlsaW5lTGVuZ3RoKShpdGVtLmxhYmVsTGluZSk7XG4gICAgaXRlbS5hbGlnbiA9IHtcbiAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgdGV4dEJhc2VsaW5lOiAnbWlkZGxlJ1xuICAgIH07XG4gICAgaWYgKGxlZnQpIGl0ZW0uYWxpZ24udGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFBpZUNvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBkYXRhID0gcGllSXRlbS5kYXRhLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSBwaWVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBwaWVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcGllSXRlbS5yTGV2ZWw7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdwaWUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRQaWVTaGFwZShwaWVJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRQaWVTdHlsZShwaWVJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydFBpZUNvbmZpZyhwaWVJdGVtKSB7XG4gIHZhciBhbmltYXRpb25EZWxheUdhcCA9IHBpZUl0ZW0uYW5pbWF0aW9uRGVsYXlHYXAsXG4gICAgICBzdGFydEFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5zdGFydEFuaW1hdGlvbkN1cnZlO1xuICB2YXIgY29uZmlncyA9IGdldFBpZUNvbmZpZyhwaWVJdGVtKTtcbiAgY29uZmlncy5mb3JFYWNoKGZ1bmN0aW9uIChjb25maWcsIGkpIHtcbiAgICBjb25maWcuYW5pbWF0aW9uQ3VydmUgPSBzdGFydEFuaW1hdGlvbkN1cnZlO1xuICAgIGNvbmZpZy5hbmltYXRpb25EZWxheSA9IGkgKiBhbmltYXRpb25EZWxheUdhcDtcbiAgICBjb25maWcuc2hhcGUub3IgPSBjb25maWcuc2hhcGUuaXI7XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gYmVmb3JlQ2hhbmdlUGllKGdyYXBoKSB7XG4gIGdyYXBoLmFuaW1hdGlvbkRlbGF5ID0gMDtcbn1cblxuZnVuY3Rpb24gZ2V0UGllU2hhcGUocGllSXRlbSwgaSkge1xuICB2YXIgY2VudGVyID0gcGllSXRlbS5jZW50ZXIsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZGF0YUl0ZW0gPSBkYXRhW2ldO1xuICB2YXIgcmFkaXVzID0gZGF0YUl0ZW0ucmFkaXVzLFxuICAgICAgc3RhcnRBbmdsZSA9IGRhdGFJdGVtLnN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZSA9IGRhdGFJdGVtLmVuZEFuZ2xlO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0QW5nbGU6IHN0YXJ0QW5nbGUsXG4gICAgZW5kQW5nbGU6IGVuZEFuZ2xlLFxuICAgIGlyOiByYWRpdXNbMF0sXG4gICAgb3I6IHJhZGl1c1sxXSxcbiAgICByeDogY2VudGVyWzBdLFxuICAgIHJ5OiBjZW50ZXJbMV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UGllU3R5bGUocGllSXRlbSwgaSkge1xuICB2YXIgcGllU3R5bGUgPSBwaWVJdGVtLnBpZVN0eWxlLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGRhdGFJdGVtID0gZGF0YVtpXTtcbiAgdmFyIGNvbG9yID0gZGF0YUl0ZW0uY29sb3I7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIHBpZVN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0SW5zaWRlTGFiZWxDb25maWcocGllSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBwaWVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBwaWVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIHJMZXZlbCA9IHBpZUl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcGllSXRlbS5pbnNpZGVMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEluc2lkZUxhYmVsU2hhcGUocGllSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0SW5zaWRlTGFiZWxTdHlsZShwaWVJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRJbnNpZGVMYWJlbFNoYXBlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIGluc2lkZUxhYmVsID0gcGllSXRlbS5pbnNpZGVMYWJlbCxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBmb3JtYXR0ZXIgPSBpbnNpZGVMYWJlbC5mb3JtYXR0ZXI7XG4gIHZhciBkYXRhSXRlbSA9IGRhdGFbaV07XG4gIHZhciBmb3JtYXR0ZXJUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZm9ybWF0dGVyKTtcbiAgdmFyIGxhYmVsID0gJyc7XG5cbiAgaWYgKGZvcm1hdHRlclR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgbGFiZWwgPSBmb3JtYXR0ZXIucmVwbGFjZSgne25hbWV9JywgZGF0YUl0ZW0ubmFtZSk7XG4gICAgbGFiZWwgPSBsYWJlbC5yZXBsYWNlKCd7cGVyY2VudH0nLCBkYXRhSXRlbS5wZXJjZW50KTtcbiAgICBsYWJlbCA9IGxhYmVsLnJlcGxhY2UoJ3t2YWx1ZX0nLCBkYXRhSXRlbS52YWx1ZSk7XG4gIH1cblxuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxhYmVsID0gZm9ybWF0dGVyKGRhdGFJdGVtKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29udGVudDogbGFiZWwsXG4gICAgcG9zaXRpb246IGRhdGFJdGVtLmluc2lkZUxhYmVsUG9zXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEluc2lkZUxhYmVsU3R5bGUocGllSXRlbSwgaSkge1xuICB2YXIgc3R5bGUgPSBwaWVJdGVtLmluc2lkZUxhYmVsLnN0eWxlO1xuICByZXR1cm4gc3R5bGU7XG59XG5cbmZ1bmN0aW9uIGdldE91dHNpZGVMYWJlbExpbmVDb25maWcocGllSXRlbSkge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBwaWVJdGVtLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBwaWVJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YSxcbiAgICAgIHJMZXZlbCA9IHBpZUl0ZW0uckxldmVsO1xuICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAncG9seWxpbmUnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0T3V0c2lkZUxhYmVsTGluZVNoYXBlKHBpZUl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldE91dHNpZGVMYWJlbExpbmVTdHlsZShwaWVJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydE91dHNpZGVMYWJlbExpbmVDb25maWcocGllSXRlbSkge1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRPdXRzaWRlTGFiZWxMaW5lQ29uZmlnKHBpZUl0ZW0pO1xuICBjb25maWdzLmZvckVhY2goZnVuY3Rpb24gKGNvbmZpZywgaSkge1xuICAgIGNvbmZpZy5zdHlsZS5saW5lRGFzaCA9IFswLCBkYXRhW2ldLmxhYmVsTGluZUxlbmd0aF07XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0T3V0c2lkZUxhYmVsTGluZVNoYXBlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIGRhdGEgPSBwaWVJdGVtLmRhdGE7XG4gIHZhciBkYXRhSXRlbSA9IGRhdGFbaV07XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBkYXRhSXRlbS5sYWJlbExpbmVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0c2lkZUxhYmVsTGluZVN0eWxlKHBpZUl0ZW0sIGkpIHtcbiAgdmFyIG91dHNpZGVMYWJlbCA9IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLFxuICAgICAgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGxhYmVsTGluZVN0eWxlID0gb3V0c2lkZUxhYmVsLmxhYmVsTGluZVN0eWxlO1xuICB2YXIgY29sb3IgPSBkYXRhW2ldLmNvbG9yO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBzdHJva2U6IGNvbG9yLFxuICAgIGxpbmVEYXNoOiBbZGF0YVtpXS5sYWJlbExpbmVMZW5ndGgsIDBdXG4gIH0sIGxhYmVsTGluZVN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0c2lkZUxhYmVsQ29uZmlnKHBpZUl0ZW0pIHtcbiAgdmFyIGFuaW1hdGlvbkN1cnZlID0gcGllSXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcGllSXRlbS5hbmltYXRpb25GcmFtZSxcbiAgICAgIGRhdGEgPSBwaWVJdGVtLmRhdGEsXG4gICAgICByTGV2ZWwgPSBwaWVJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHBpZUl0ZW0ub3V0c2lkZUxhYmVsLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0T3V0c2lkZUxhYmVsU2hhcGUocGllSXRlbSwgaSksXG4gICAgICBzdHlsZTogZ2V0T3V0c2lkZUxhYmVsU3R5bGUocGllSXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3RhcnRPdXRzaWRlTGFiZWxDb25maWcocGllSXRlbSkge1xuICB2YXIgZGF0YSA9IHBpZUl0ZW0uZGF0YTtcbiAgdmFyIGNvbmZpZ3MgPSBnZXRPdXRzaWRlTGFiZWxDb25maWcocGllSXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnLCBpKSB7XG4gICAgY29uZmlnLnNoYXBlLnBvc2l0aW9uID0gZGF0YVtpXS5sYWJlbExpbmVbMV07XG4gIH0pO1xuICByZXR1cm4gY29uZmlncztcbn1cblxuZnVuY3Rpb24gZ2V0T3V0c2lkZUxhYmVsU2hhcGUocGllSXRlbSwgaSkge1xuICB2YXIgb3V0c2lkZUxhYmVsID0gcGllSXRlbS5vdXRzaWRlTGFiZWwsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgZm9ybWF0dGVyID0gb3V0c2lkZUxhYmVsLmZvcm1hdHRlcjtcbiAgdmFyIF9kYXRhJGkgPSBkYXRhW2ldLFxuICAgICAgbGFiZWxMaW5lID0gX2RhdGEkaS5sYWJlbExpbmUsXG4gICAgICBuYW1lID0gX2RhdGEkaS5uYW1lLFxuICAgICAgcGVyY2VudCA9IF9kYXRhJGkucGVyY2VudCxcbiAgICAgIHZhbHVlID0gX2RhdGEkaS52YWx1ZTtcbiAgdmFyIGZvcm1hdHRlclR5cGUgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShmb3JtYXR0ZXIpO1xuICB2YXIgbGFiZWwgPSAnJztcblxuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBsYWJlbCA9IGZvcm1hdHRlci5yZXBsYWNlKCd7bmFtZX0nLCBuYW1lKTtcbiAgICBsYWJlbCA9IGxhYmVsLnJlcGxhY2UoJ3twZXJjZW50fScsIHBlcmNlbnQpO1xuICAgIGxhYmVsID0gbGFiZWwucmVwbGFjZSgne3ZhbHVlfScsIHZhbHVlKTtcbiAgfVxuXG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGFiZWwgPSBmb3JtYXR0ZXIoZGF0YVtpXSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNvbnRlbnQ6IGxhYmVsLFxuICAgIHBvc2l0aW9uOiBsYWJlbExpbmVbMl1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0c2lkZUxhYmVsU3R5bGUocGllSXRlbSwgaSkge1xuICB2YXIgb3V0c2lkZUxhYmVsID0gcGllSXRlbS5vdXRzaWRlTGFiZWwsXG4gICAgICBkYXRhID0gcGllSXRlbS5kYXRhO1xuICB2YXIgX2RhdGEkaTIgPSBkYXRhW2ldLFxuICAgICAgY29sb3IgPSBfZGF0YSRpMi5jb2xvcixcbiAgICAgIGFsaWduID0gX2RhdGEkaTIuYWxpZ247XG4gIHZhciBzdHlsZSA9IG91dHNpZGVMYWJlbC5zdHlsZTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShfb2JqZWN0U3ByZWFkKHtcbiAgICBmaWxsOiBjb2xvclxuICB9LCBhbGlnbiksIHN0eWxlKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnJhZGFyID0gcmFkYXI7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2luZGV4ID0gcmVxdWlyZShcIi4uL2NvbmZpZy9pbmRleFwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbG9yID0gcmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbmZ1bmN0aW9uIHJhZGFyKGNoYXJ0KSB7XG4gIHZhciBvcHRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICB2YXIgc2VyaWVzID0gb3B0aW9uLnNlcmllcztcbiAgaWYgKCFzZXJpZXMpIHNlcmllcyA9IFtdO1xuICB2YXIgcmFkYXJzID0gKDAsIF91dGlsMi5pbml0TmVlZFNlcmllcykoc2VyaWVzLCBfaW5kZXgucmFkYXJDb25maWcsICdyYWRhcicpO1xuICByYWRhcnMgPSBjYWxjUmFkYXJQb3NpdGlvbihyYWRhcnMsIGNoYXJ0KTtcbiAgcmFkYXJzID0gY2FsY1JhZGFyTGFiZWxQb3NpdGlvbihyYWRhcnMsIGNoYXJ0KTtcbiAgcmFkYXJzID0gY2FsY1JhZGFyTGFiZWxBbGlnbihyYWRhcnMsIGNoYXJ0KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJzLFxuICAgIGtleTogJ3JhZGFyJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0UmFkYXJDb25maWcsXG4gICAgZ2V0U3RhcnRHcmFwaENvbmZpZzogZ2V0U3RhcnRSYWRhckNvbmZpZyxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZVJhZGFyXG4gIH0pO1xuICAoMCwgX3VwZGF0ZXIuZG9VcGRhdGUpKHtcbiAgICBjaGFydDogY2hhcnQsXG4gICAgc2VyaWVzOiByYWRhcnMsXG4gICAga2V5OiAncmFkYXJQb2ludCcsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFBvaW50Q29uZmlnLFxuICAgIGdldFN0YXJ0R3JhcGhDb25maWc6IGdldFN0YXJ0UG9pbnRDb25maWdcbiAgfSk7XG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHJhZGFycyxcbiAgICBrZXk6ICdyYWRhckxhYmVsJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0TGFiZWxDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhclBvc2l0aW9uKHJhZGFycywgY2hhcnQpIHtcbiAgdmFyIHJhZGFyQXhpcyA9IGNoYXJ0LnJhZGFyQXhpcztcbiAgaWYgKCFyYWRhckF4aXMpIHJldHVybiBbXTtcbiAgdmFyIGluZGljYXRvciA9IHJhZGFyQXhpcy5pbmRpY2F0b3IsXG4gICAgICBheGlzTGluZUFuZ2xlcyA9IHJhZGFyQXhpcy5heGlzTGluZUFuZ2xlcyxcbiAgICAgIHJhZGl1cyA9IHJhZGFyQXhpcy5yYWRpdXMsXG4gICAgICBjZW50ZXJQb3MgPSByYWRhckF4aXMuY2VudGVyUG9zO1xuICByYWRhcnMuZm9yRWFjaChmdW5jdGlvbiAocmFkYXJJdGVtKSB7XG4gICAgdmFyIGRhdGEgPSByYWRhckl0ZW0uZGF0YTtcbiAgICByYWRhckl0ZW0uZGF0YVJhZGl1cyA9IFtdO1xuICAgIHJhZGFySXRlbS5yYWRhclBvc2l0aW9uID0gaW5kaWNhdG9yLm1hcChmdW5jdGlvbiAoX3JlZiwgaSkge1xuICAgICAgdmFyIG1heCA9IF9yZWYubWF4LFxuICAgICAgICAgIG1pbiA9IF9yZWYubWluO1xuICAgICAgdmFyIHYgPSBkYXRhW2ldO1xuICAgICAgaWYgKHR5cGVvZiBtYXggIT09ICdudW1iZXInKSBtYXggPSB2O1xuICAgICAgaWYgKHR5cGVvZiBtaW4gIT09ICdudW1iZXInKSBtaW4gPSAwO1xuICAgICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykgdiA9IG1pbjtcbiAgICAgIHZhciBkYXRhUmFkaXVzID0gKHYgLSBtaW4pIC8gKG1heCAtIG1pbikgKiByYWRpdXM7XG4gICAgICByYWRhckl0ZW0uZGF0YVJhZGl1c1tpXSA9IGRhdGFSYWRpdXM7XG4gICAgICByZXR1cm4gX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQuYXBwbHkodm9pZCAwLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvcykuY29uY2F0KFtkYXRhUmFkaXVzLCBheGlzTGluZUFuZ2xlc1tpXV0pKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiByYWRhcnM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckxhYmVsUG9zaXRpb24ocmFkYXJzLCBjaGFydCkge1xuICB2YXIgcmFkYXJBeGlzID0gY2hhcnQucmFkYXJBeGlzO1xuICBpZiAoIXJhZGFyQXhpcykgcmV0dXJuIFtdO1xuICB2YXIgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcyxcbiAgICAgIGF4aXNMaW5lQW5nbGVzID0gcmFkYXJBeGlzLmF4aXNMaW5lQW5nbGVzO1xuICByYWRhcnMuZm9yRWFjaChmdW5jdGlvbiAocmFkYXJJdGVtKSB7XG4gICAgdmFyIGRhdGFSYWRpdXMgPSByYWRhckl0ZW0uZGF0YVJhZGl1cyxcbiAgICAgICAgbGFiZWwgPSByYWRhckl0ZW0ubGFiZWw7XG4gICAgdmFyIGxhYmVsR2FwID0gbGFiZWwubGFiZWxHYXA7XG4gICAgcmFkYXJJdGVtLmxhYmVsUG9zaXRpb24gPSBkYXRhUmFkaXVzLm1hcChmdW5jdGlvbiAociwgaSkge1xuICAgICAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbciArIGxhYmVsR2FwLCBheGlzTGluZUFuZ2xlc1tpXV0pKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiByYWRhcnM7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckxhYmVsQWxpZ24ocmFkYXJzLCBjaGFydCkge1xuICB2YXIgcmFkYXJBeGlzID0gY2hhcnQucmFkYXJBeGlzO1xuICBpZiAoIXJhZGFyQXhpcykgcmV0dXJuIFtdO1xuXG4gIHZhciBfcmFkYXJBeGlzJGNlbnRlclBvcyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShyYWRhckF4aXMuY2VudGVyUG9zLCAyKSxcbiAgICAgIHggPSBfcmFkYXJBeGlzJGNlbnRlclBvc1swXSxcbiAgICAgIHkgPSBfcmFkYXJBeGlzJGNlbnRlclBvc1sxXTtcblxuICByYWRhcnMuZm9yRWFjaChmdW5jdGlvbiAocmFkYXJJdGVtKSB7XG4gICAgdmFyIGxhYmVsUG9zaXRpb24gPSByYWRhckl0ZW0ubGFiZWxQb3NpdGlvbjtcbiAgICB2YXIgbGFiZWxBbGlnbiA9IGxhYmVsUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChfcmVmMikge1xuICAgICAgdmFyIF9yZWYzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyLCAyKSxcbiAgICAgICAgICBseCA9IF9yZWYzWzBdLFxuICAgICAgICAgIGx5ID0gX3JlZjNbMV07XG5cbiAgICAgIHZhciB0ZXh0QWxpZ24gPSBseCA+IHggPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgdmFyIHRleHRCYXNlbGluZSA9IGx5ID4geSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXh0QWxpZ246IHRleHRBbGlnbixcbiAgICAgICAgdGV4dEJhc2VsaW5lOiB0ZXh0QmFzZWxpbmVcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmFkYXJJdGVtLmxhYmVsQWxpZ24gPSBsYWJlbEFsaWduO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFycztcbn1cblxuZnVuY3Rpb24gZ2V0UmFkYXJDb25maWcocmFkYXJJdGVtKSB7XG4gIHZhciBhbmltYXRpb25DdXJ2ZSA9IHJhZGFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIFt7XG4gICAgbmFtZTogJ3BvbHlsaW5lJyxcbiAgICBpbmRleDogckxldmVsLFxuICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgc2hhcGU6IGdldFJhZGFyU2hhcGUocmFkYXJJdGVtKSxcbiAgICBzdHlsZTogZ2V0UmFkYXJTdHlsZShyYWRhckl0ZW0pXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydFJhZGFyQ29uZmlnKHJhZGFySXRlbSwgdXBkYXRlcikge1xuICB2YXIgY2VudGVyUG9zID0gdXBkYXRlci5jaGFydC5yYWRhckF4aXMuY2VudGVyUG9zO1xuICB2YXIgY29uZmlnID0gZ2V0UmFkYXJDb25maWcocmFkYXJJdGVtKVswXTtcbiAgdmFyIHBvaW50TnVtID0gY29uZmlnLnNoYXBlLnBvaW50cy5sZW5ndGg7XG4gIHZhciBwb2ludHMgPSBuZXcgQXJyYXkocG9pbnROdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uIChmb28pIHtcbiAgICByZXR1cm4gKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpO1xuICB9KTtcbiAgY29uZmlnLnNoYXBlLnBvaW50cyA9IHBvaW50cztcbiAgcmV0dXJuIFtjb25maWddO1xufVxuXG5mdW5jdGlvbiBnZXRSYWRhclNoYXBlKHJhZGFySXRlbSkge1xuICB2YXIgcmFkYXJQb3NpdGlvbiA9IHJhZGFySXRlbS5yYWRhclBvc2l0aW9uO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogcmFkYXJQb3NpdGlvbixcbiAgICBjbG9zZTogdHJ1ZVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRSYWRhclN0eWxlKHJhZGFySXRlbSkge1xuICB2YXIgcmFkYXJTdHlsZSA9IHJhZGFySXRlbS5yYWRhclN0eWxlLFxuICAgICAgY29sb3IgPSByYWRhckl0ZW0uY29sb3I7XG4gIHZhciBjb2xvclJnYmFWYWx1ZSA9ICgwLCBfY29sb3IuZ2V0UmdiYVZhbHVlKShjb2xvcik7XG4gIGNvbG9yUmdiYVZhbHVlWzNdID0gMC41O1xuICB2YXIgcmFkYXJEZWZhdWx0Q29sb3IgPSB7XG4gICAgc3Ryb2tlOiBjb2xvcixcbiAgICBmaWxsOiAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShjb2xvclJnYmFWYWx1ZSlcbiAgfTtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShyYWRhckRlZmF1bHRDb2xvciwgcmFkYXJTdHlsZSk7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZVJhZGFyKGdyYXBoLCBfcmVmNCkge1xuICB2YXIgc2hhcGUgPSBfcmVmNC5zaGFwZTtcbiAgdmFyIGdyYXBoUG9pbnRzID0gZ3JhcGguc2hhcGUucG9pbnRzO1xuICB2YXIgZ3JhcGhQb2ludHNOdW0gPSBncmFwaFBvaW50cy5sZW5ndGg7XG4gIHZhciBwb2ludHNOdW0gPSBzaGFwZS5wb2ludHMubGVuZ3RoO1xuXG4gIGlmIChwb2ludHNOdW0gPiBncmFwaFBvaW50c051bSkge1xuICAgIHZhciBsYXN0UG9pbnQgPSBncmFwaFBvaW50cy5zbGljZSgtMSlbMF07XG4gICAgdmFyIG5ld0FkZFBvaW50cyA9IG5ldyBBcnJheShwb2ludHNOdW0gLSBncmFwaFBvaW50c051bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbykge1xuICAgICAgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobGFzdFBvaW50KTtcbiAgICB9KTtcbiAgICBncmFwaFBvaW50cy5wdXNoLmFwcGx5KGdyYXBoUG9pbnRzLCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKG5ld0FkZFBvaW50cykpO1xuICB9IGVsc2UgaWYgKHBvaW50c051bSA8IGdyYXBoUG9pbnRzTnVtKSB7XG4gICAgZ3JhcGhQb2ludHMuc3BsaWNlKHBvaW50c051bSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRDb25maWcocmFkYXJJdGVtKSB7XG4gIHZhciByYWRhclBvc2l0aW9uID0gcmFkYXJJdGVtLnJhZGFyUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIHJhZGFyUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ2NpcmNsZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgdmlzaWJsZTogcmFkYXJJdGVtLnBvaW50LnNob3csXG4gICAgICBzaGFwZTogZ2V0UG9pbnRTaGFwZShyYWRhckl0ZW0sIGkpLFxuICAgICAgc3R5bGU6IGdldFBvaW50U3R5bGUocmFkYXJJdGVtLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTdGFydFBvaW50Q29uZmlnKHJhZGFySXRlbSkge1xuICB2YXIgY29uZmlncyA9IGdldFBvaW50Q29uZmlnKHJhZGFySXRlbSk7XG4gIGNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgcmV0dXJuIGNvbmZpZy5zaGFwZS5yID0gMC4wMTtcbiAgfSk7XG4gIHJldHVybiBjb25maWdzO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFNoYXBlKHJhZGFySXRlbSwgaSkge1xuICB2YXIgcmFkYXJQb3NpdGlvbiA9IHJhZGFySXRlbS5yYWRhclBvc2l0aW9uLFxuICAgICAgcG9pbnQgPSByYWRhckl0ZW0ucG9pbnQ7XG4gIHZhciByYWRpdXMgPSBwb2ludC5yYWRpdXM7XG4gIHZhciBwb3NpdGlvbiA9IHJhZGFyUG9zaXRpb25baV07XG4gIHJldHVybiB7XG4gICAgcng6IHBvc2l0aW9uWzBdLFxuICAgIHJ5OiBwb3NpdGlvblsxXSxcbiAgICByOiByYWRpdXNcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UG9pbnRTdHlsZShyYWRhckl0ZW0sIGkpIHtcbiAgdmFyIHBvaW50ID0gcmFkYXJJdGVtLnBvaW50LFxuICAgICAgY29sb3IgPSByYWRhckl0ZW0uY29sb3I7XG4gIHZhciBzdHlsZSA9IHBvaW50LnN0eWxlO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHtcbiAgICBzdHJva2U6IGNvbG9yXG4gIH0sIHN0eWxlKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxDb25maWcocmFkYXJJdGVtKSB7XG4gIHZhciBsYWJlbFBvc2l0aW9uID0gcmFkYXJJdGVtLmxhYmVsUG9zaXRpb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFySXRlbS5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJJdGVtLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJJdGVtLnJMZXZlbDtcbiAgcmV0dXJuIGxhYmVsUG9zaXRpb24ubWFwKGZ1bmN0aW9uIChmb28sIGkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3RleHQnLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHJhZGFySXRlbS5sYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldExhYmVsU2hhcGUocmFkYXJJdGVtLCBpKSxcbiAgICAgIHN0eWxlOiBnZXRMYWJlbFN0eWxlKHJhZGFySXRlbSwgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTaGFwZShyYWRhckl0ZW0sIGkpIHtcbiAgdmFyIGxhYmVsUG9zaXRpb24gPSByYWRhckl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgIGxhYmVsID0gcmFkYXJJdGVtLmxhYmVsLFxuICAgICAgZGF0YSA9IHJhZGFySXRlbS5kYXRhO1xuICB2YXIgb2Zmc2V0ID0gbGFiZWwub2Zmc2V0LFxuICAgICAgZm9ybWF0dGVyID0gbGFiZWwuZm9ybWF0dGVyO1xuICB2YXIgcG9zaXRpb24gPSBtZXJnZVBvaW50T2Zmc2V0KGxhYmVsUG9zaXRpb25baV0sIG9mZnNldCk7XG4gIHZhciBsYWJlbFRleHQgPSBkYXRhW2ldID8gZGF0YVtpXS50b1N0cmluZygpIDogJzAnO1xuICB2YXIgZm9ybWF0dGVyVHlwZSA9ICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGZvcm1hdHRlcik7XG4gIGlmIChmb3JtYXR0ZXJUeXBlID09PSAnc3RyaW5nJykgbGFiZWxUZXh0ID0gZm9ybWF0dGVyLnJlcGxhY2UoJ3t2YWx1ZX0nLCBsYWJlbFRleHQpO1xuICBpZiAoZm9ybWF0dGVyVHlwZSA9PT0gJ2Z1bmN0aW9uJykgbGFiZWxUZXh0ID0gZm9ybWF0dGVyKGxhYmVsVGV4dCk7XG4gIHJldHVybiB7XG4gICAgY29udGVudDogbGFiZWxUZXh0LFxuICAgIHBvc2l0aW9uOiBwb3NpdGlvblxuICB9O1xufVxuXG5mdW5jdGlvbiBtZXJnZVBvaW50T2Zmc2V0KF9yZWY1LCBfcmVmNikge1xuICB2YXIgX3JlZjcgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjUsIDIpLFxuICAgICAgeCA9IF9yZWY3WzBdLFxuICAgICAgeSA9IF9yZWY3WzFdO1xuXG4gIHZhciBfcmVmOCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNiwgMiksXG4gICAgICBveCA9IF9yZWY4WzBdLFxuICAgICAgb3kgPSBfcmVmOFsxXTtcblxuICByZXR1cm4gW3ggKyBveCwgeSArIG95XTtcbn1cblxuZnVuY3Rpb24gZ2V0TGFiZWxTdHlsZShyYWRhckl0ZW0sIGkpIHtcbiAgdmFyIGxhYmVsID0gcmFkYXJJdGVtLmxhYmVsLFxuICAgICAgY29sb3IgPSByYWRhckl0ZW0uY29sb3IsXG4gICAgICBsYWJlbEFsaWduID0gcmFkYXJJdGVtLmxhYmVsQWxpZ247XG4gIHZhciBzdHlsZSA9IGxhYmVsLnN0eWxlO1xuXG4gIHZhciBkZWZhdWx0Q29sb3JBbmRBbGlnbiA9IF9vYmplY3RTcHJlYWQoe1xuICAgIGZpbGw6IGNvbG9yXG4gIH0sIGxhYmVsQWxpZ25baV0pO1xuXG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoZGVmYXVsdENvbG9yQW5kQWxpZ24sIHN0eWxlKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnJhZGFyQXhpcyA9IHJhZGFyQXhpcztcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9kZWZpbmVQcm9wZXJ0eVwiKSk7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdXBkYXRlciA9IHJlcXVpcmUoXCIuLi9jbGFzcy91cGRhdGVyLmNsYXNzXCIpO1xuXG52YXIgX2luZGV4ID0gcmVxdWlyZShcIi4uL2NvbmZpZy9pbmRleFwiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX3V0aWwyID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBpZiAoZW51bWVyYWJsZU9ubHkpIHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KTsga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9OyBpZiAoaSAlIDIpIHsgb3duS2V5cyhzb3VyY2UsIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyAoMCwgX2RlZmluZVByb3BlcnR5MltcImRlZmF1bHRcIl0pKHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7IH0pOyB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7IH0gZWxzZSB7IG93bktleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IH0gcmV0dXJuIHRhcmdldDsgfVxuXG5mdW5jdGlvbiByYWRhckF4aXMoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciByYWRhciA9IG9wdGlvbi5yYWRhcjtcbiAgdmFyIHJhZGFyQXhpcyA9IFtdO1xuXG4gIGlmIChyYWRhcikge1xuICAgIHJhZGFyQXhpcyA9IG1lcmdlUmFkYXJBeGlzRGVmYXVsdENvbmZpZyhyYWRhcik7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc0NlbnRlcihyYWRhckF4aXMsIGNoYXJ0KTtcbiAgICByYWRhckF4aXMgPSBjYWxjUmFkYXJBeGlzUmluZ1JhZGl1cyhyYWRhckF4aXMsIGNoYXJ0KTtcbiAgICByYWRhckF4aXMgPSBjYWxjUmFkYXJBeGlzTGluZVBvc2l0aW9uKHJhZGFyQXhpcyk7XG4gICAgcmFkYXJBeGlzID0gY2FsY1JhZGFyQXhpc0FyZWFSYWRpdXMocmFkYXJBeGlzKTtcbiAgICByYWRhckF4aXMgPSBjYWxjUmFkYXJBeGlzTGFiZWxQb3NpdGlvbihyYWRhckF4aXMpO1xuICAgIHJhZGFyQXhpcyA9IFtyYWRhckF4aXNdO1xuICB9XG5cbiAgdmFyIHJhZGFyQXhpc0ZvclVwZGF0ZSA9IHJhZGFyQXhpcztcbiAgaWYgKHJhZGFyQXhpcy5sZW5ndGggJiYgIXJhZGFyQXhpc1swXS5zaG93KSByYWRhckF4aXNGb3JVcGRhdGUgPSBbXTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJBeGlzRm9yVXBkYXRlLFxuICAgIGtleTogJ3JhZGFyQXhpc1NwbGl0QXJlYScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFNwbGl0QXJlYUNvbmZpZyxcbiAgICBiZWZvcmVVcGRhdGU6IGJlZm9yZVVwZGF0ZVNwbGl0QXJlYSxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZVNwbGl0QXJlYVxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJBeGlzRm9yVXBkYXRlLFxuICAgIGtleTogJ3JhZGFyQXhpc1NwbGl0TGluZScsXG4gICAgZ2V0R3JhcGhDb25maWc6IGdldFNwbGl0TGluZUNvbmZpZyxcbiAgICBiZWZvcmVVcGRhdGU6IGJlZm9yZVVwZGF0ZVNwbGl0TGluZSxcbiAgICBiZWZvcmVDaGFuZ2U6IGJlZm9yZUNoYW5nZVNwbGl0TGluZVxuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJBeGlzRm9yVXBkYXRlLFxuICAgIGtleTogJ3JhZGFyQXhpc0xpbmUnLFxuICAgIGdldEdyYXBoQ29uZmlnOiBnZXRBeGlzTGluZUNvbmZpZ1xuICB9KTtcbiAgKDAsIF91cGRhdGVyLmRvVXBkYXRlKSh7XG4gICAgY2hhcnQ6IGNoYXJ0LFxuICAgIHNlcmllczogcmFkYXJBeGlzRm9yVXBkYXRlLFxuICAgIGtleTogJ3JhZGFyQXhpc0xhYmxlJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0QXhpc0xhYmVsQ29uZmlnXG4gIH0pO1xuICBjaGFydC5yYWRhckF4aXMgPSByYWRhckF4aXNbMF07XG59XG5cbmZ1bmN0aW9uIG1lcmdlUmFkYXJBeGlzRGVmYXVsdENvbmZpZyhyYWRhcikge1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKCgwLCBfdXRpbC5kZWVwQ2xvbmUpKF9pbmRleC5yYWRhckF4aXNDb25maWcpLCByYWRhcik7XG59XG5cbmZ1bmN0aW9uIGNhbGNSYWRhckF4aXNDZW50ZXIocmFkYXJBeGlzLCBjaGFydCkge1xuICB2YXIgYXJlYSA9IGNoYXJ0LnJlbmRlci5hcmVhO1xuICB2YXIgY2VudGVyID0gcmFkYXJBeGlzLmNlbnRlcjtcbiAgcmFkYXJBeGlzLmNlbnRlclBvcyA9IGNlbnRlci5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKSByZXR1cm4gdjtcbiAgICByZXR1cm4gcGFyc2VJbnQodikgLyAxMDAgKiBhcmVhW2ldO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyQXhpc1JpbmdSYWRpdXMocmFkYXJBeGlzLCBjaGFydCkge1xuICB2YXIgYXJlYSA9IGNoYXJ0LnJlbmRlci5hcmVhO1xuICB2YXIgc3BsaXROdW0gPSByYWRhckF4aXMuc3BsaXROdW0sXG4gICAgICByYWRpdXMgPSByYWRhckF4aXMucmFkaXVzO1xuICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShhcmVhKSkgLyAyO1xuICBpZiAodHlwZW9mIHJhZGl1cyAhPT0gJ251bWJlcicpIHJhZGl1cyA9IHBhcnNlSW50KHJhZGl1cykgLyAxMDAgKiBtYXhSYWRpdXM7XG4gIHZhciBzcGxpdEdhcCA9IHJhZGl1cyAvIHNwbGl0TnVtO1xuICByYWRhckF4aXMucmluZ1JhZGl1cyA9IG5ldyBBcnJheShzcGxpdE51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBzcGxpdEdhcCAqIChpICsgMSk7XG4gIH0pO1xuICByYWRhckF4aXMucmFkaXVzID0gcmFkaXVzO1xuICByZXR1cm4gcmFkYXJBeGlzO1xufVxuXG5mdW5jdGlvbiBjYWxjUmFkYXJBeGlzTGluZVBvc2l0aW9uKHJhZGFyQXhpcykge1xuICB2YXIgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcixcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICByYWRpdXMgPSByYWRhckF4aXMucmFkaXVzLFxuICAgICAgc3RhcnRBbmdsZSA9IHJhZGFyQXhpcy5zdGFydEFuZ2xlO1xuICB2YXIgZnVsbEFuZ2xlID0gTWF0aC5QSSAqIDI7XG4gIHZhciBpbmRpY2F0b3JOdW0gPSBpbmRpY2F0b3IubGVuZ3RoO1xuICB2YXIgaW5kaWNhdG9yR2FwID0gZnVsbEFuZ2xlIC8gaW5kaWNhdG9yTnVtO1xuICB2YXIgYW5nbGVzID0gbmV3IEFycmF5KGluZGljYXRvck51bSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBpbmRpY2F0b3JHYXAgKiBpICsgc3RhcnRBbmdsZTtcbiAgfSk7XG4gIHJhZGFyQXhpcy5heGlzTGluZUFuZ2xlcyA9IGFuZ2xlcztcbiAgcmFkYXJBeGlzLmF4aXNMaW5lUG9zaXRpb24gPSBhbmdsZXMubWFwKGZ1bmN0aW9uIChnKSB7XG4gICAgcmV0dXJuIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbcmFkaXVzLCBnXSkpO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyQXhpc0FyZWFSYWRpdXMocmFkYXJBeGlzKSB7XG4gIHZhciByaW5nUmFkaXVzID0gcmFkYXJBeGlzLnJpbmdSYWRpdXM7XG4gIHZhciBzdWJSYWRpdXMgPSByaW5nUmFkaXVzWzBdIC8gMjtcbiAgcmFkYXJBeGlzLmFyZWFSYWRpdXMgPSByaW5nUmFkaXVzLm1hcChmdW5jdGlvbiAocikge1xuICAgIHJldHVybiByIC0gc3ViUmFkaXVzO1xuICB9KTtcbiAgcmV0dXJuIHJhZGFyQXhpcztcbn1cblxuZnVuY3Rpb24gY2FsY1JhZGFyQXhpc0xhYmVsUG9zaXRpb24ocmFkYXJBeGlzKSB7XG4gIHZhciBheGlzTGluZUFuZ2xlcyA9IHJhZGFyQXhpcy5heGlzTGluZUFuZ2xlcyxcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICByYWRpdXMgPSByYWRhckF4aXMucmFkaXVzLFxuICAgICAgYXhpc0xhYmVsID0gcmFkYXJBeGlzLmF4aXNMYWJlbDtcbiAgcmFkaXVzICs9IGF4aXNMYWJlbC5sYWJlbEdhcDtcbiAgcmFkYXJBeGlzLmF4aXNMYWJlbFBvc2l0aW9uID0gYXhpc0xpbmVBbmdsZXMubWFwKGZ1bmN0aW9uIChhbmdsZSkge1xuICAgIHJldHVybiBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3JhZGl1cywgYW5nbGVdKSk7XG4gIH0pO1xuICByZXR1cm4gcmFkYXJBeGlzO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdEFyZWFDb25maWcocmFkYXJBeGlzKSB7XG4gIHZhciBhcmVhUmFkaXVzID0gcmFkYXJBeGlzLmFyZWFSYWRpdXMsXG4gICAgICBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb24sXG4gICAgICBhbmltYXRpb25DdXJ2ZSA9IHJhZGFyQXhpcy5hbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lID0gcmFkYXJBeGlzLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gcmFkYXJBeGlzLnJMZXZlbDtcbiAgdmFyIG5hbWUgPSBwb2x5Z29uID8gJ3JlZ1BvbHlnb24nIDogJ3JpbmcnO1xuICByZXR1cm4gYXJlYVJhZGl1cy5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaW5kZXg6IHJMZXZlbCxcbiAgICAgIHZpc2libGU6IHJhZGFyQXhpcy5zcGxpdEFyZWEuc2hvdyxcbiAgICAgIGFuaW1hdGlvbkN1cnZlOiBhbmltYXRpb25DdXJ2ZSxcbiAgICAgIGFuaW1hdGlvbkZyYW1lOiBhbmltYXRpb25GcmFtZSxcbiAgICAgIHNoYXBlOiBnZXRTcGxpdEFyZWFTaGFwZShyYWRhckF4aXMsIGkpLFxuICAgICAgc3R5bGU6IGdldFNwbGl0QXJlYVN0eWxlKHJhZGFyQXhpcywgaSlcbiAgICB9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U3BsaXRBcmVhU2hhcGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb24sXG4gICAgICBhcmVhUmFkaXVzID0gcmFkYXJBeGlzLmFyZWFSYWRpdXMsXG4gICAgICBpbmRpY2F0b3IgPSByYWRhckF4aXMuaW5kaWNhdG9yLFxuICAgICAgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcztcbiAgdmFyIGluZGljYXRvck51bSA9IGluZGljYXRvci5sZW5ndGg7XG4gIHZhciBzaGFwZSA9IHtcbiAgICByeDogY2VudGVyUG9zWzBdLFxuICAgIHJ5OiBjZW50ZXJQb3NbMV0sXG4gICAgcjogYXJlYVJhZGl1c1tpXVxuICB9O1xuICBpZiAocG9seWdvbikgc2hhcGUuc2lkZSA9IGluZGljYXRvck51bTtcbiAgcmV0dXJuIHNoYXBlO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdEFyZWFTdHlsZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIHNwbGl0QXJlYSA9IHJhZGFyQXhpcy5zcGxpdEFyZWEsXG4gICAgICByaW5nUmFkaXVzID0gcmFkYXJBeGlzLnJpbmdSYWRpdXMsXG4gICAgICBheGlzTGluZUFuZ2xlcyA9IHJhZGFyQXhpcy5heGlzTGluZUFuZ2xlcyxcbiAgICAgIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbixcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3M7XG4gIHZhciBjb2xvciA9IHNwbGl0QXJlYS5jb2xvcixcbiAgICAgIHN0eWxlID0gc3BsaXRBcmVhLnN0eWxlO1xuICBzdHlsZSA9IF9vYmplY3RTcHJlYWQoe1xuICAgIGZpbGw6ICdyZ2JhKDAsIDAsIDAsIDApJ1xuICB9LCBzdHlsZSk7XG4gIHZhciBsaW5lV2lkdGggPSByaW5nUmFkaXVzWzBdIC0gMDtcblxuICBpZiAocG9seWdvbikge1xuICAgIHZhciBwb2ludDEgPSBfdXRpbC5nZXRDaXJjbGVSYWRpYW5Qb2ludC5hcHBseSh2b2lkIDAsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY2VudGVyUG9zKS5jb25jYXQoW3JpbmdSYWRpdXNbMF0sIGF4aXNMaW5lQW5nbGVzWzBdXSkpO1xuXG4gICAgdmFyIHBvaW50MiA9IF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50LmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjZW50ZXJQb3MpLmNvbmNhdChbcmluZ1JhZGl1c1swXSwgYXhpc0xpbmVBbmdsZXNbMV1dKSk7XG5cbiAgICBsaW5lV2lkdGggPSAoMCwgX3V0aWwyLmdldFBvaW50VG9MaW5lRGlzdGFuY2UpKGNlbnRlclBvcywgcG9pbnQxLCBwb2ludDIpO1xuICB9XG5cbiAgc3R5bGUgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoKDAsIF91dGlsLmRlZXBDbG9uZSkoc3R5bGUsIHRydWUpLCB7XG4gICAgbGluZVdpZHRoOiBsaW5lV2lkdGhcbiAgfSk7XG4gIGlmICghY29sb3IubGVuZ3RoKSByZXR1cm4gc3R5bGU7XG4gIHZhciBjb2xvck51bSA9IGNvbG9yLmxlbmd0aDtcbiAgcmV0dXJuICgwLCBfdXRpbDIuZGVlcE1lcmdlKShzdHlsZSwge1xuICAgIHN0cm9rZTogY29sb3JbaSAlIGNvbG9yTnVtXVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlU3BsaXRBcmVhKGdyYXBocywgcmFkYXJBeGlzLCBpLCB1cGRhdGVyKSB7XG4gIHZhciBjYWNoZSA9IGdyYXBoc1tpXTtcbiAgaWYgKCFjYWNoZSkgcmV0dXJuO1xuICB2YXIgcmVuZGVyID0gdXBkYXRlci5jaGFydC5yZW5kZXI7XG4gIHZhciBwb2x5Z29uID0gcmFkYXJBeGlzLnBvbHlnb247XG4gIHZhciBuYW1lID0gY2FjaGVbMF0ubmFtZTtcbiAgdmFyIGN1cnJlbnROYW1lID0gcG9seWdvbiA/ICdyZWdQb2x5Z29uJyA6ICdyaW5nJztcbiAgdmFyIGRlbEFsbCA9IGN1cnJlbnROYW1lICE9PSBuYW1lO1xuICBpZiAoIWRlbEFsbCkgcmV0dXJuO1xuICBjYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgcmV0dXJuIHJlbmRlci5kZWxHcmFwaChnKTtcbiAgfSk7XG4gIGdyYXBoc1tpXSA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZVNwbGl0QXJlYShncmFwaCwgY29uZmlnKSB7XG4gIHZhciBzaWRlID0gY29uZmlnLnNoYXBlLnNpZGU7XG4gIGlmICh0eXBlb2Ygc2lkZSAhPT0gJ251bWJlcicpIHJldHVybjtcbiAgZ3JhcGguc2hhcGUuc2lkZSA9IHNpZGU7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZUNvbmZpZyhyYWRhckF4aXMpIHtcbiAgdmFyIHJpbmdSYWRpdXMgPSByYWRhckF4aXMucmluZ1JhZGl1cyxcbiAgICAgIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbixcbiAgICAgIGFuaW1hdGlvbkN1cnZlID0gcmFkYXJBeGlzLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSByYWRhckF4aXMuYW5pbWF0aW9uRnJhbWUsXG4gICAgICByTGV2ZWwgPSByYWRhckF4aXMuckxldmVsO1xuICB2YXIgbmFtZSA9IHBvbHlnb24gPyAncmVnUG9seWdvbicgOiAncmluZyc7XG4gIHJldHVybiByaW5nUmFkaXVzLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgdmlzaWJsZTogcmFkYXJBeGlzLnNwbGl0TGluZS5zaG93LFxuICAgICAgc2hhcGU6IGdldFNwbGl0TGluZVNoYXBlKHJhZGFyQXhpcywgaSksXG4gICAgICBzdHlsZTogZ2V0U3BsaXRMaW5lU3R5bGUocmFkYXJBeGlzLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTcGxpdExpbmVTaGFwZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIHJpbmdSYWRpdXMgPSByYWRhckF4aXMucmluZ1JhZGl1cyxcbiAgICAgIGNlbnRlclBvcyA9IHJhZGFyQXhpcy5jZW50ZXJQb3MsXG4gICAgICBpbmRpY2F0b3IgPSByYWRhckF4aXMuaW5kaWNhdG9yLFxuICAgICAgcG9seWdvbiA9IHJhZGFyQXhpcy5wb2x5Z29uO1xuICB2YXIgc2hhcGUgPSB7XG4gICAgcng6IGNlbnRlclBvc1swXSxcbiAgICByeTogY2VudGVyUG9zWzFdLFxuICAgIHI6IHJpbmdSYWRpdXNbaV1cbiAgfTtcbiAgdmFyIGluZGljYXRvck51bSA9IGluZGljYXRvci5sZW5ndGg7XG4gIGlmIChwb2x5Z29uKSBzaGFwZS5zaWRlID0gaW5kaWNhdG9yTnVtO1xuICByZXR1cm4gc2hhcGU7XG59XG5cbmZ1bmN0aW9uIGdldFNwbGl0TGluZVN0eWxlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgc3BsaXRMaW5lID0gcmFkYXJBeGlzLnNwbGl0TGluZTtcbiAgdmFyIGNvbG9yID0gc3BsaXRMaW5lLmNvbG9yLFxuICAgICAgc3R5bGUgPSBzcGxpdExpbmUuc3R5bGU7XG4gIHN0eWxlID0gX29iamVjdFNwcmVhZCh7XG4gICAgZmlsbDogJ3JnYmEoMCwgMCwgMCwgMCknXG4gIH0sIHN0eWxlKTtcbiAgaWYgKCFjb2xvci5sZW5ndGgpIHJldHVybiBzdHlsZTtcbiAgdmFyIGNvbG9yTnVtID0gY29sb3IubGVuZ3RoO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHN0eWxlLCB7XG4gICAgc3Ryb2tlOiBjb2xvcltpICUgY29sb3JOdW1dXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBiZWZvcmVVcGRhdGVTcGxpdExpbmUoZ3JhcGhzLCByYWRhckF4aXMsIGksIHVwZGF0ZXIpIHtcbiAgdmFyIGNhY2hlID0gZ3JhcGhzW2ldO1xuICBpZiAoIWNhY2hlKSByZXR1cm47XG4gIHZhciByZW5kZXIgPSB1cGRhdGVyLmNoYXJ0LnJlbmRlcjtcbiAgdmFyIHBvbHlnb24gPSByYWRhckF4aXMucG9seWdvbjtcbiAgdmFyIG5hbWUgPSBjYWNoZVswXS5uYW1lO1xuICB2YXIgY3VycmVuTmFtZSA9IHBvbHlnb24gPyAncmVnUG9seWdvbicgOiAncmluZyc7XG4gIHZhciBkZWxBbGwgPSBjdXJyZW5OYW1lICE9PSBuYW1lO1xuICBpZiAoIWRlbEFsbCkgcmV0dXJuO1xuICBjYWNoZS5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XG4gICAgcmV0dXJuIHJlbmRlci5kZWxHcmFwaChnKTtcbiAgfSk7XG4gIGdyYXBoc1tpXSA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGJlZm9yZUNoYW5nZVNwbGl0TGluZShncmFwaCwgY29uZmlnKSB7XG4gIHZhciBzaWRlID0gY29uZmlnLnNoYXBlLnNpZGU7XG4gIGlmICh0eXBlb2Ygc2lkZSAhPT0gJ251bWJlcicpIHJldHVybjtcbiAgZ3JhcGguc2hhcGUuc2lkZSA9IHNpZGU7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMaW5lQ29uZmlnKHJhZGFyQXhpcykge1xuICB2YXIgYXhpc0xpbmVQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGluZVBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckF4aXMuYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFyQXhpcy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFyQXhpcy5yTGV2ZWw7XG4gIHJldHVybiBheGlzTGluZVBvc2l0aW9uLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdwb2x5bGluZScsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcmFkYXJBeGlzLmF4aXNMaW5lLnNob3csXG4gICAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZTogYW5pbWF0aW9uRnJhbWUsXG4gICAgICBzaGFwZTogZ2V0QXhpc0xpbmVTaGFwZShyYWRhckF4aXMsIGkpLFxuICAgICAgc3R5bGU6IGdldEF4aXNMaW5lU3R5bGUocmFkYXJBeGlzLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGluZVNoYXBlKHJhZGFyQXhpcywgaSkge1xuICB2YXIgY2VudGVyUG9zID0gcmFkYXJBeGlzLmNlbnRlclBvcyxcbiAgICAgIGF4aXNMaW5lUG9zaXRpb24gPSByYWRhckF4aXMuYXhpc0xpbmVQb3NpdGlvbjtcbiAgdmFyIHBvaW50cyA9IFtjZW50ZXJQb3MsIGF4aXNMaW5lUG9zaXRpb25baV1dO1xuICByZXR1cm4ge1xuICAgIHBvaW50czogcG9pbnRzXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMaW5lU3R5bGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBheGlzTGluZSA9IHJhZGFyQXhpcy5heGlzTGluZTtcbiAgdmFyIGNvbG9yID0gYXhpc0xpbmUuY29sb3IsXG4gICAgICBzdHlsZSA9IGF4aXNMaW5lLnN0eWxlO1xuICBpZiAoIWNvbG9yLmxlbmd0aCkgcmV0dXJuIHN0eWxlO1xuICB2YXIgY29sb3JOdW0gPSBjb2xvci5sZW5ndGg7XG4gIHJldHVybiAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoc3R5bGUsIHtcbiAgICBzdHJva2U6IGNvbG9yW2kgJSBjb2xvck51bV1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEF4aXNMYWJlbENvbmZpZyhyYWRhckF4aXMpIHtcbiAgdmFyIGF4aXNMYWJlbFBvc2l0aW9uID0gcmFkYXJBeGlzLmF4aXNMYWJlbFBvc2l0aW9uLFxuICAgICAgYW5pbWF0aW9uQ3VydmUgPSByYWRhckF4aXMuYW5pbWF0aW9uQ3VydmUsXG4gICAgICBhbmltYXRpb25GcmFtZSA9IHJhZGFyQXhpcy5hbmltYXRpb25GcmFtZSxcbiAgICAgIHJMZXZlbCA9IHJhZGFyQXhpcy5yTGV2ZWw7XG4gIHJldHVybiBheGlzTGFiZWxQb3NpdGlvbi5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAndGV4dCcsXG4gICAgICBpbmRleDogckxldmVsLFxuICAgICAgdmlzaWJsZTogcmFkYXJBeGlzLmF4aXNMYWJlbC5zaG93LFxuICAgICAgYW5pbWF0aW9uQ3VydmU6IGFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgICAgc2hhcGU6IGdldEF4aXNMYWJsZVNoYXBlKHJhZGFyQXhpcywgaSksXG4gICAgICBzdHlsZTogZ2V0QXhpc0xhYmxlU3R5bGUocmFkYXJBeGlzLCBpKVxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRBeGlzTGFibGVTaGFwZShyYWRhckF4aXMsIGkpIHtcbiAgdmFyIGF4aXNMYWJlbFBvc2l0aW9uID0gcmFkYXJBeGlzLmF4aXNMYWJlbFBvc2l0aW9uLFxuICAgICAgaW5kaWNhdG9yID0gcmFkYXJBeGlzLmluZGljYXRvcjtcbiAgcmV0dXJuIHtcbiAgICBjb250ZW50OiBpbmRpY2F0b3JbaV0ubmFtZSxcbiAgICBwb3NpdGlvbjogYXhpc0xhYmVsUG9zaXRpb25baV1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0QXhpc0xhYmxlU3R5bGUocmFkYXJBeGlzLCBpKSB7XG4gIHZhciBheGlzTGFiZWwgPSByYWRhckF4aXMuYXhpc0xhYmVsLFxuICAgICAgX3JhZGFyQXhpcyRjZW50ZXJQb3MgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocmFkYXJBeGlzLmNlbnRlclBvcywgMiksXG4gICAgICB4ID0gX3JhZGFyQXhpcyRjZW50ZXJQb3NbMF0sXG4gICAgICB5ID0gX3JhZGFyQXhpcyRjZW50ZXJQb3NbMV0sXG4gICAgICBheGlzTGFiZWxQb3NpdGlvbiA9IHJhZGFyQXhpcy5heGlzTGFiZWxQb3NpdGlvbjtcblxuICB2YXIgY29sb3IgPSBheGlzTGFiZWwuY29sb3IsXG4gICAgICBzdHlsZSA9IGF4aXNMYWJlbC5zdHlsZTtcblxuICB2YXIgX2F4aXNMYWJlbFBvc2l0aW9uJGkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoYXhpc0xhYmVsUG9zaXRpb25baV0sIDIpLFxuICAgICAgbGFiZWxYcG9zID0gX2F4aXNMYWJlbFBvc2l0aW9uJGlbMF0sXG4gICAgICBsYWJlbFlQb3MgPSBfYXhpc0xhYmVsUG9zaXRpb24kaVsxXTtcblxuICB2YXIgdGV4dEFsaWduID0gbGFiZWxYcG9zID4geCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gIHZhciB0ZXh0QmFzZWxpbmUgPSBsYWJlbFlQb3MgPiB5ID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgc3R5bGUgPSAoMCwgX3V0aWwyLmRlZXBNZXJnZSkoe1xuICAgIHRleHRBbGlnbjogdGV4dEFsaWduLFxuICAgIHRleHRCYXNlbGluZTogdGV4dEJhc2VsaW5lXG4gIH0sIHN0eWxlKTtcbiAgaWYgKCFjb2xvci5sZW5ndGgpIHJldHVybiBzdHlsZTtcbiAgdmFyIGNvbG9yTnVtID0gY29sb3IubGVuZ3RoO1xuICByZXR1cm4gKDAsIF91dGlsMi5kZWVwTWVyZ2UpKHN0eWxlLCB7XG4gICAgZmlsbDogY29sb3JbaSAlIGNvbG9yTnVtXVxuICB9KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnRpdGxlID0gdGl0bGU7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3VwZGF0ZXIgPSByZXF1aXJlKFwiLi4vY2xhc3MvdXBkYXRlci5jbGFzc1wiKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG52YXIgX2NvbmZpZyA9IHJlcXVpcmUoXCIuLi9jb25maWdcIik7XG5cbnZhciBfdXRpbDIgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxuZnVuY3Rpb24gdGl0bGUoY2hhcnQpIHtcbiAgdmFyIG9wdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciB0aXRsZSA9IFtdO1xuXG4gIGlmIChvcHRpb24udGl0bGUpIHtcbiAgICB0aXRsZVswXSA9ICgwLCBfdXRpbDIuZGVlcE1lcmdlKSgoMCwgX3V0aWwuZGVlcENsb25lKShfY29uZmlnLnRpdGxlQ29uZmlnLCB0cnVlKSwgb3B0aW9uLnRpdGxlKTtcbiAgfVxuXG4gICgwLCBfdXBkYXRlci5kb1VwZGF0ZSkoe1xuICAgIGNoYXJ0OiBjaGFydCxcbiAgICBzZXJpZXM6IHRpdGxlLFxuICAgIGtleTogJ3RpdGxlJyxcbiAgICBnZXRHcmFwaENvbmZpZzogZ2V0VGl0bGVDb25maWdcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFRpdGxlQ29uZmlnKHRpdGxlSXRlbSwgdXBkYXRlcikge1xuICB2YXIgYW5pbWF0aW9uQ3VydmUgPSBfY29uZmlnLnRpdGxlQ29uZmlnLmFuaW1hdGlvbkN1cnZlLFxuICAgICAgYW5pbWF0aW9uRnJhbWUgPSBfY29uZmlnLnRpdGxlQ29uZmlnLmFuaW1hdGlvbkZyYW1lLFxuICAgICAgckxldmVsID0gX2NvbmZpZy50aXRsZUNvbmZpZy5yTGV2ZWw7XG4gIHZhciBzaGFwZSA9IGdldFRpdGxlU2hhcGUodGl0bGVJdGVtLCB1cGRhdGVyKTtcbiAgdmFyIHN0eWxlID0gZ2V0VGl0bGVTdHlsZSh0aXRsZUl0ZW0pO1xuICByZXR1cm4gW3tcbiAgICBuYW1lOiAndGV4dCcsXG4gICAgaW5kZXg6IHJMZXZlbCxcbiAgICB2aXNpYmxlOiB0aXRsZUl0ZW0uc2hvdyxcbiAgICBhbmltYXRpb25DdXJ2ZTogYW5pbWF0aW9uQ3VydmUsXG4gICAgYW5pbWF0aW9uRnJhbWU6IGFuaW1hdGlvbkZyYW1lLFxuICAgIHNoYXBlOiBzaGFwZSxcbiAgICBzdHlsZTogc3R5bGVcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldFRpdGxlU2hhcGUodGl0bGVJdGVtLCB1cGRhdGVyKSB7XG4gIHZhciBvZmZzZXQgPSB0aXRsZUl0ZW0ub2Zmc2V0LFxuICAgICAgdGV4dCA9IHRpdGxlSXRlbS50ZXh0O1xuICB2YXIgX3VwZGF0ZXIkY2hhcnQkZ3JpZEFyID0gdXBkYXRlci5jaGFydC5ncmlkQXJlYSxcbiAgICAgIHggPSBfdXBkYXRlciRjaGFydCRncmlkQXIueCxcbiAgICAgIHkgPSBfdXBkYXRlciRjaGFydCRncmlkQXIueSxcbiAgICAgIHcgPSBfdXBkYXRlciRjaGFydCRncmlkQXIudztcblxuICB2YXIgX29mZnNldCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShvZmZzZXQsIDIpLFxuICAgICAgb3ggPSBfb2Zmc2V0WzBdLFxuICAgICAgb3kgPSBfb2Zmc2V0WzFdO1xuXG4gIHJldHVybiB7XG4gICAgY29udGVudDogdGV4dCxcbiAgICBwb3NpdGlvbjogW3ggKyB3IC8gMiArIG94LCB5ICsgb3ldXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldFRpdGxlU3R5bGUodGl0bGVJdGVtKSB7XG4gIHZhciBzdHlsZSA9IHRpdGxlSXRlbS5zdHlsZTtcbiAgcmV0dXJuIHN0eWxlO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jUmVuZGVyID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXJcIik7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2MtcmVuZGVyL2xpYi9wbHVnaW4vdXRpbFwiKTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpO1xuXG52YXIgX2luZGV4ID0gcmVxdWlyZShcIi4uL3V0aWwvaW5kZXhcIik7XG5cbnZhciBwaWUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgaXI6IDAsXG4gICAgb3I6IDAsXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICBlbmRBbmdsZTogMCxcbiAgICBjbG9ja1dpc2U6IHRydWVcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ2lyJywgJ29yJywgJ3N0YXJ0QW5nbGUnLCAnZW5kQW5nbGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignUGllIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjIsIF9yZWYzKSB7XG4gICAgdmFyIGN0eCA9IF9yZWYyLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMy5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGlyID0gc2hhcGUuaXIsXG4gICAgICAgIG9yID0gc2hhcGUub3IsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgcnggPSBwYXJzZUludChyeCkgKyAwLjU7XG4gICAgcnkgPSBwYXJzZUludChyeSkgKyAwLjU7XG4gICAgY3R4LmFyYyhyeCwgcnksIGlyID4gMCA/IGlyIDogMCwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIHZhciBjb25uZWN0UG9pbnQxID0gKDAsIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50KShyeCwgcnksIG9yLCBlbmRBbmdsZSkubWFwKGZ1bmN0aW9uIChwKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQocCkgKyAwLjU7XG4gICAgfSk7XG4gICAgdmFyIGNvbm5lY3RQb2ludDIgPSAoMCwgX3V0aWwuZ2V0Q2lyY2xlUmFkaWFuUG9pbnQpKHJ4LCByeSwgaXIsIHN0YXJ0QW5nbGUpLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHApICsgMC41O1xuICAgIH0pO1xuICAgIGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNvbm5lY3RQb2ludDEpKTtcbiAgICBjdHguYXJjKHJ4LCByeSwgb3IgPiAwID8gb3IgOiAwLCBlbmRBbmdsZSwgc3RhcnRBbmdsZSwgY2xvY2tXaXNlKTtcbiAgICBjdHgubGluZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShjb25uZWN0UG9pbnQyKSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xuICB9XG59O1xudmFyIGFnQXJjID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDAsXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICBlbmRBbmdsZTogMCxcbiAgICBncmFkaWVudFN0YXJ0QW5nbGU6IG51bGwsXG4gICAgZ3JhZGllbnRFbmRBbmdsZTogbnVsbFxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0LnNoYXBlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdyJywgJ3N0YXJ0QW5nbGUnLCAnZW5kQW5nbGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignQWdBcmMgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNSwgX3JlZjYpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjUuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY2LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY2LnN0eWxlO1xuICAgIHZhciBncmFkaWVudCA9IHN0eWxlLmdyYWRpZW50O1xuICAgIGdyYWRpZW50ID0gZ3JhZGllbnQubWFwKGZ1bmN0aW9uIChjdikge1xuICAgICAgcmV0dXJuICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKGN2KTtcbiAgICB9KTtcblxuICAgIGlmIChncmFkaWVudC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGdyYWRpZW50ID0gW2dyYWRpZW50WzBdLCBncmFkaWVudFswXV07XG4gICAgfVxuXG4gICAgdmFyIGdyYWRpZW50QXJjTnVtID0gZ3JhZGllbnQubGVuZ3RoIC0gMTtcbiAgICB2YXIgZ3JhZGllbnRTdGFydEFuZ2xlID0gc2hhcGUuZ3JhZGllbnRTdGFydEFuZ2xlLFxuICAgICAgICBncmFkaWVudEVuZEFuZ2xlID0gc2hhcGUuZ3JhZGllbnRFbmRBbmdsZSxcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIGlmIChncmFkaWVudFN0YXJ0QW5nbGUgPT09IG51bGwpIGdyYWRpZW50U3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGU7XG4gICAgaWYgKGdyYWRpZW50RW5kQW5nbGUgPT09IG51bGwpIGdyYWRpZW50RW5kQW5nbGUgPSBlbmRBbmdsZTtcbiAgICB2YXIgYW5nbGVHYXAgPSAoZ3JhZGllbnRFbmRBbmdsZSAtIGdyYWRpZW50U3RhcnRBbmdsZSkgLyBncmFkaWVudEFyY051bTtcbiAgICBpZiAoYW5nbGVHYXAgPT09IE1hdGguUEkgKiAyKSBhbmdsZUdhcCA9IE1hdGguUEkgKiAyIC0gMC4wMDE7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyYWRpZW50QXJjTnVtOyBpKyspIHtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIHZhciBzdGFydFBvaW50ID0gKDAsIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50KShyeCwgcnksIHIsIHN0YXJ0QW5nbGUgKyBhbmdsZUdhcCAqIGkpO1xuICAgICAgdmFyIGVuZFBvaW50ID0gKDAsIF91dGlsLmdldENpcmNsZVJhZGlhblBvaW50KShyeCwgcnksIHIsIHN0YXJ0QW5nbGUgKyBhbmdsZUdhcCAqIChpICsgMSkpO1xuICAgICAgdmFyIGNvbG9yID0gKDAsIF9pbmRleC5nZXRMaW5lYXJHcmFkaWVudENvbG9yKShjdHgsIHN0YXJ0UG9pbnQsIGVuZFBvaW50LCBbZ3JhZGllbnRbaV0sIGdyYWRpZW50W2kgKyAxXV0pO1xuICAgICAgdmFyIGFyY1N0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlICsgYW5nbGVHYXAgKiBpO1xuICAgICAgdmFyIGFyY0VuZEFuZ2xlID0gc3RhcnRBbmdsZSArIGFuZ2xlR2FwICogKGkgKyAxKTtcbiAgICAgIHZhciBkb0JyZWFrID0gZmFsc2U7XG5cbiAgICAgIGlmIChhcmNFbmRBbmdsZSA+IGVuZEFuZ2xlKSB7XG4gICAgICAgIGFyY0VuZEFuZ2xlID0gZW5kQW5nbGU7XG4gICAgICAgIGRvQnJlYWsgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjdHguYXJjKHJ4LCByeSwgciwgYXJjU3RhcnRBbmdsZSwgYXJjRW5kQW5nbGUpO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICBpZiAoZG9CcmVhaykgYnJlYWs7XG4gICAgfVxuICB9XG59O1xudmFyIG51bWJlclRleHQgPSB7XG4gIHNoYXBlOiB7XG4gICAgbnVtYmVyOiBbXSxcbiAgICBjb250ZW50OiAnJyxcbiAgICBwb3NpdGlvbjogWzAsIDBdLFxuICAgIHRvRml4ZWQ6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjcpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNy5zaGFwZTtcbiAgICB2YXIgbnVtYmVyID0gc2hhcGUubnVtYmVyLFxuICAgICAgICBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbjtcblxuICAgIGlmICghKG51bWJlciBpbnN0YW5jZW9mIEFycmF5KSB8fCB0eXBlb2YgY29udGVudCAhPT0gJ3N0cmluZycgfHwgIShwb3NpdGlvbiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignTnVtYmVyVGV4dCBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY4LCBfcmVmOSkge1xuICAgIHZhciBjdHggPSBfcmVmOC5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjkuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciBudW1iZXIgPSBzaGFwZS5udW1iZXIsXG4gICAgICAgIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uLFxuICAgICAgICB0b0ZpeGVkID0gc2hhcGUudG9GaXhlZDtcbiAgICB2YXIgdGV4dFNlZ21lbnRzID0gY29udGVudC5zcGxpdCgne250fScpO1xuICAgIHZhciBsYXN0U2VnbWVudEluZGV4ID0gdGV4dFNlZ21lbnRzLmxlbmd0aCAtIDE7XG4gICAgdmFyIHRleHRTdHJpbmcgPSAnJztcbiAgICB0ZXh0U2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAodCwgaSkge1xuICAgICAgdmFyIGN1cnJlbnROdW1iZXIgPSBudW1iZXJbaV07XG4gICAgICBpZiAoaSA9PT0gbGFzdFNlZ21lbnRJbmRleCkgY3VycmVudE51bWJlciA9ICcnO1xuICAgICAgaWYgKHR5cGVvZiBjdXJyZW50TnVtYmVyID09PSAnbnVtYmVyJykgY3VycmVudE51bWJlciA9IGN1cnJlbnROdW1iZXIudG9GaXhlZCh0b0ZpeGVkKTtcbiAgICAgIHRleHRTdHJpbmcgKz0gdCArIChjdXJyZW50TnVtYmVyIHx8ICcnKTtcbiAgICB9KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZVRleHQuYXBwbHkoY3R4LCBbdGV4dFN0cmluZ10uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb24pKSk7XG4gICAgY3R4LmZpbGxUZXh0LmFwcGx5KGN0eCwgW3RleHRTdHJpbmddLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uKSkpO1xuICB9XG59O1xudmFyIGxpbmVJY29uID0ge1xuICBzaGFwZToge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgICB3OiAwLFxuICAgIGg6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjEwKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEwLnNoYXBlO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcblxuICAgIGlmICh0eXBlb2YgeCAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHkgIT09ICdudW1iZXInIHx8IHR5cGVvZiB3ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgaCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2xpbmVJY29uIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjExLCBfcmVmMTIpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjExLmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTIuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICB2YXIgaGFsZkggPSBoIC8gMjtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjdHguZmlsbFN0eWxlO1xuICAgIGN0eC5tb3ZlVG8oeCwgeSArIGhhbGZIKTtcbiAgICBjdHgubGluZVRvKHggKyB3LCB5ICsgaGFsZkgpO1xuICAgIGN0eC5saW5lV2lkdGggPSAxO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJhZGl1cyA9IGhhbGZIIC0gNSAqIDI7XG4gICAgaWYgKHJhZGl1cyA8PSAwKSByYWRpdXMgPSAzO1xuICAgIGN0eC5hcmMoeCArIHcgLyAyLCB5ICsgaGFsZkgsIHJhZGl1cywgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5saW5lV2lkdGggPSA1O1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJyNmZmYnO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYxMykge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMy5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblJlY3QpKHBvc2l0aW9uLCB4LCB5LCB3LCBoKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYxNCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxNC5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMTQuc3R5bGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3ggKyB3IC8gMiwgeSArIGggLyAyXTtcbiAgfVxufTtcbigwLCBfY1JlbmRlci5leHRlbmROZXdHcmFwaCkoJ3BpZScsIHBpZSk7XG4oMCwgX2NSZW5kZXIuZXh0ZW5kTmV3R3JhcGgpKCdhZ0FyYycsIGFnQXJjKTtcbigwLCBfY1JlbmRlci5leHRlbmROZXdHcmFwaCkoJ251bWJlclRleHQnLCBudW1iZXJUZXh0KTtcbigwLCBfY1JlbmRlci5leHRlbmROZXdHcmFwaCkoJ2xpbmVJY29uJywgbGluZUljb24pOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImNoYW5nZURlZmF1bHRDb25maWdcIiwge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICByZXR1cm4gX2NvbmZpZy5jaGFuZ2VEZWZhdWx0Q29uZmlnO1xuICB9XG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2NoYXJ0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY2xhc3MvY2hhcnRzLmNsYXNzXCIpKTtcblxudmFyIF9jb25maWcgPSByZXF1aXJlKFwiLi9jb25maWdcIik7XG5cbnZhciBfZGVmYXVsdCA9IF9jaGFydHNbXCJkZWZhdWx0XCJdO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmZpbHRlck5vbk51bWJlciA9IGZpbHRlck5vbk51bWJlcjtcbmV4cG9ydHMuZGVlcE1lcmdlID0gZGVlcE1lcmdlO1xuZXhwb3J0cy5tdWxBZGQgPSBtdWxBZGQ7XG5leHBvcnRzLm1lcmdlU2FtZVN0YWNrRGF0YSA9IG1lcmdlU2FtZVN0YWNrRGF0YTtcbmV4cG9ydHMuZ2V0VHdvUG9pbnREaXN0YW5jZSA9IGdldFR3b1BvaW50RGlzdGFuY2U7XG5leHBvcnRzLmdldExpbmVhckdyYWRpZW50Q29sb3IgPSBnZXRMaW5lYXJHcmFkaWVudENvbG9yO1xuZXhwb3J0cy5nZXRQb2x5bGluZUxlbmd0aCA9IGdldFBvbHlsaW5lTGVuZ3RoO1xuZXhwb3J0cy5nZXRQb2ludFRvTGluZURpc3RhbmNlID0gZ2V0UG9pbnRUb0xpbmVEaXN0YW5jZTtcbmV4cG9ydHMuaW5pdE5lZWRTZXJpZXMgPSBpbml0TmVlZFNlcmllcztcbmV4cG9ydHMucmFkaWFuVG9BbmdsZSA9IHJhZGlhblRvQW5nbGU7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfdHlwZW9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpKTtcblxudmFyIF91dGlsID0gcmVxdWlyZShcIkBqaWFtaW5naGkvYy1yZW5kZXIvbGliL3BsdWdpbi91dGlsXCIpO1xuXG5mdW5jdGlvbiBmaWx0ZXJOb25OdW1iZXIoYXJyYXkpIHtcbiAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbiAobikge1xuICAgIHJldHVybiB0eXBlb2YgbiA9PT0gJ251bWJlcic7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2UodGFyZ2V0LCBtZXJnZWQpIHtcbiAgZm9yICh2YXIga2V5IGluIG1lcmdlZCkge1xuICAgIGlmICh0YXJnZXRba2V5XSAmJiAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKSh0YXJnZXRba2V5XSkgPT09ICdvYmplY3QnKSB7XG4gICAgICBkZWVwTWVyZ2UodGFyZ2V0W2tleV0sIG1lcmdlZFtrZXldKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICgoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShtZXJnZWRba2V5XSkgPT09ICdvYmplY3QnKSB7XG4gICAgICB0YXJnZXRba2V5XSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKG1lcmdlZFtrZXldLCB0cnVlKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHRhcmdldFtrZXldID0gbWVyZ2VkW2tleV07XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBtdWxBZGQobnVtcykge1xuICBudW1zID0gZmlsdGVyTm9uTnVtYmVyKG51bXMpO1xuICByZXR1cm4gbnVtcy5yZWR1Y2UoZnVuY3Rpb24gKGFsbCwgbnVtKSB7XG4gICAgcmV0dXJuIGFsbCArIG51bTtcbiAgfSwgMCk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlU2FtZVN0YWNrRGF0YShpdGVtLCBzZXJpZXMpIHtcbiAgdmFyIHN0YWNrID0gaXRlbS5zdGFjaztcbiAgaWYgKCFzdGFjaykgcmV0dXJuICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbS5kYXRhKTtcbiAgdmFyIHN0YWNrcyA9IHNlcmllcy5maWx0ZXIoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICB2YXIgcyA9IF9yZWYuc3RhY2s7XG4gICAgcmV0dXJuIHMgPT09IHN0YWNrO1xuICB9KTtcbiAgdmFyIGluZGV4ID0gc3RhY2tzLmZpbmRJbmRleChmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICB2YXIgZCA9IF9yZWYyLmRhdGE7XG4gICAgcmV0dXJuIGQgPT09IGl0ZW0uZGF0YTtcbiAgfSk7XG4gIHZhciBkYXRhcyA9IHN0YWNrcy5zcGxpY2UoMCwgaW5kZXggKyAxKS5tYXAoZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgdmFyIGRhdGEgPSBfcmVmMy5kYXRhO1xuICAgIHJldHVybiBkYXRhO1xuICB9KTtcbiAgdmFyIGRhdGFMZW5ndGggPSBkYXRhc1swXS5sZW5ndGg7XG4gIHJldHVybiBuZXcgQXJyYXkoZGF0YUxlbmd0aCkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBtdWxBZGQoZGF0YXMubWFwKGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gZFtpXTtcbiAgICB9KSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50T25lLCBwb2ludFR3bykge1xuICB2YXIgbWludXNYID0gTWF0aC5hYnMocG9pbnRPbmVbMF0gLSBwb2ludFR3b1swXSk7XG4gIHZhciBtaW51c1kgPSBNYXRoLmFicyhwb2ludE9uZVsxXSAtIHBvaW50VHdvWzFdKTtcbiAgcmV0dXJuIE1hdGguc3FydChtaW51c1ggKiBtaW51c1ggKyBtaW51c1kgKiBtaW51c1kpO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lYXJHcmFkaWVudENvbG9yKGN0eCwgYmVnaW4sIGVuZCwgY29sb3IpIHtcbiAgaWYgKCFjdHggfHwgIWJlZ2luIHx8ICFlbmQgfHwgIWNvbG9yLmxlbmd0aCkgcmV0dXJuO1xuICB2YXIgY29sb3JzID0gY29sb3I7XG4gIHR5cGVvZiBjb2xvcnMgPT09ICdzdHJpbmcnICYmIChjb2xvcnMgPSBbY29sb3IsIGNvbG9yXSk7XG4gIHZhciBsaW5lYXJHcmFkaWVudENvbG9yID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50LmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShiZWdpbikuY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZW5kKSkpO1xuICB2YXIgY29sb3JHYXAgPSAxIC8gKGNvbG9ycy5sZW5ndGggLSAxKTtcbiAgY29sb3JzLmZvckVhY2goZnVuY3Rpb24gKGMsIGkpIHtcbiAgICByZXR1cm4gbGluZWFyR3JhZGllbnRDb2xvci5hZGRDb2xvclN0b3AoY29sb3JHYXAgKiBpLCBjKTtcbiAgfSk7XG4gIHJldHVybiBsaW5lYXJHcmFkaWVudENvbG9yO1xufVxuXG5mdW5jdGlvbiBnZXRQb2x5bGluZUxlbmd0aChwb2ludHMpIHtcbiAgdmFyIGxpbmVTZWdtZW50cyA9IG5ldyBBcnJheShwb2ludHMubGVuZ3RoIC0gMSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKGZvbywgaSkge1xuICAgIHJldHVybiBbcG9pbnRzW2ldLCBwb2ludHNbaSArIDFdXTtcbiAgfSk7XG4gIHZhciBsZW5ndGhzID0gbGluZVNlZ21lbnRzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBnZXRUd29Qb2ludERpc3RhbmNlLmFwcGx5KHZvaWQgMCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShpdGVtKSk7XG4gIH0pO1xuICByZXR1cm4gbXVsQWRkKGxlbmd0aHMpO1xufVxuXG5mdW5jdGlvbiBnZXRQb2ludFRvTGluZURpc3RhbmNlKHBvaW50LCBsaW5lUG9pbnRPbmUsIGxpbmVQb2ludFR3bykge1xuICB2YXIgYSA9IGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnQsIGxpbmVQb2ludE9uZSk7XG4gIHZhciBiID0gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgbGluZVBvaW50VHdvKTtcbiAgdmFyIGMgPSBnZXRUd29Qb2ludERpc3RhbmNlKGxpbmVQb2ludE9uZSwgbGluZVBvaW50VHdvKTtcbiAgcmV0dXJuIDAuNSAqIE1hdGguc3FydCgoYSArIGIgKyBjKSAqIChhICsgYiAtIGMpICogKGEgKyBjIC0gYikgKiAoYiArIGMgLSBhKSkgLyBjO1xufVxuXG5mdW5jdGlvbiBpbml0TmVlZFNlcmllcyhzZXJpZXMsIGNvbmZpZywgdHlwZSkge1xuICBzZXJpZXMgPSBzZXJpZXMuZmlsdGVyKGZ1bmN0aW9uIChfcmVmNCkge1xuICAgIHZhciBzdCA9IF9yZWY0LnR5cGU7XG4gICAgcmV0dXJuIHN0ID09PSB0eXBlO1xuICB9KTtcbiAgc2VyaWVzID0gc2VyaWVzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBkZWVwTWVyZ2UoKDAsIF91dGlsLmRlZXBDbG9uZSkoY29uZmlnLCB0cnVlKSwgaXRlbSk7XG4gIH0pO1xuICByZXR1cm4gc2VyaWVzLmZpbHRlcihmdW5jdGlvbiAoX3JlZjUpIHtcbiAgICB2YXIgc2hvdyA9IF9yZWY1LnNob3c7XG4gICAgcmV0dXJuIHNob3c7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByYWRpYW5Ub0FuZ2xlKHJhZGlhbikge1xuICByZXR1cm4gcmFkaWFuIC8gTWF0aC5QSSAqIDE4MDtcbn0iLCJmdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aEhvbGVzOyIsImZ1bmN0aW9uIF9hcnJheVdpdGhvdXRIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcnIyW2ldID0gYXJyW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBhcnIyO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FycmF5V2l0aG91dEhvbGVzOyIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWZpbmVQcm9wZXJ0eTsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0OyIsImZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXkoaXRlcikge1xuICBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChpdGVyKSB8fCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlcikgPT09IFwiW29iamVjdCBBcmd1bWVudHNdXCIpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pdGVyYWJsZVRvQXJyYXk7IiwiZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkge1xuICB2YXIgX2FyciA9IFtdO1xuICB2YXIgX24gPSB0cnVlO1xuICB2YXIgX2QgPSBmYWxzZTtcbiAgdmFyIF9lID0gdW5kZWZpbmVkO1xuXG4gIHRyeSB7XG4gICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2QgPSB0cnVlO1xuICAgIF9lID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9hcnI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2l0ZXJhYmxlVG9BcnJheUxpbWl0OyIsImZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9ub25JdGVyYWJsZVJlc3Q7IiwiZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX25vbkl0ZXJhYmxlU3ByZWFkOyIsInZhciBhcnJheVdpdGhIb2xlcyA9IHJlcXVpcmUoXCIuL2FycmF5V2l0aEhvbGVzXCIpO1xuXG52YXIgaXRlcmFibGVUb0FycmF5TGltaXQgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlMaW1pdFwiKTtcblxudmFyIG5vbkl0ZXJhYmxlUmVzdCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlUmVzdFwiKTtcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7XG4gIHJldHVybiBhcnJheVdpdGhIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgbm9uSXRlcmFibGVSZXN0KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NsaWNlZFRvQXJyYXk7IiwidmFyIGFycmF5V2l0aG91dEhvbGVzID0gcmVxdWlyZShcIi4vYXJyYXlXaXRob3V0SG9sZXNcIik7XG5cbnZhciBpdGVyYWJsZVRvQXJyYXkgPSByZXF1aXJlKFwiLi9pdGVyYWJsZVRvQXJyYXlcIik7XG5cbnZhciBub25JdGVyYWJsZVNwcmVhZCA9IHJlcXVpcmUoXCIuL25vbkl0ZXJhYmxlU3ByZWFkXCIpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7XG4gIHJldHVybiBhcnJheVdpdGhvdXRIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheShhcnIpIHx8IG5vbkl0ZXJhYmxlU3ByZWFkKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3RvQ29uc3VtYWJsZUFycmF5OyIsImZ1bmN0aW9uIF90eXBlb2YyKG9iaikgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZjIgPSBmdW5jdGlvbiBfdHlwZW9mMihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YyID0gZnVuY3Rpb24gX3R5cGVvZjIob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mMihvYmopOyB9XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgX3R5cGVvZjIoU3ltYm9sLml0ZXJhdG9yKSA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gX3R5cGVvZjIob2JqKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogX3R5cGVvZjIob2JqKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmJlemllckN1cnZlVG9Qb2x5bGluZSA9IGJlemllckN1cnZlVG9Qb2x5bGluZTtcbmV4cG9ydHMuZ2V0QmV6aWVyQ3VydmVMZW5ndGggPSBnZXRCZXppZXJDdXJ2ZUxlbmd0aDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9zbGljZWRUb0FycmF5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgcG93ID0gTWF0aC5wb3csXG4gICAgY2VpbCA9IE1hdGguY2VpbCxcbiAgICBhYnMgPSBNYXRoLmFiczsgLy8gSW5pdGlhbGl6ZSB0aGUgbnVtYmVyIG9mIHBvaW50cyBwZXIgY3VydmVcblxudmFyIGRlZmF1bHRTZWdtZW50UG9pbnRzTnVtID0gNTA7XG4vKipcclxuICogQGV4YW1wbGUgZGF0YSBzdHJ1Y3R1cmUgb2YgYmV6aWVyQ3VydmVcclxuICogYmV6aWVyQ3VydmUgPSBbXHJcbiAqICAvLyBTdGFydGluZyBwb2ludCBvZiB0aGUgY3VydmVcclxuICogIFsxMCwgMTBdLFxyXG4gKiAgLy8gQmV6aWVyQ3VydmUgc2VnbWVudCBkYXRhIChjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludClcclxuICogIFtcclxuICogICAgWzIwLCAyMF0sIFs0MCwgMjBdLCBbNTAsIDEwXVxyXG4gKiAgXSxcclxuICogIC4uLlxyXG4gKiBdXHJcbiAqL1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgICAgICAgQWJzdHJhY3QgdGhlIGN1cnZlIGFzIGEgcG9seWxpbmUgY29uc2lzdGluZyBvZiBOIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBiZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIGNhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgMS0yMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgICAgQ2FsY3VsYXRpb24gcmVzdWx0cyBhbmQgcmVsYXRlZCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSAgICAgICAgICAgIE9wdGlvbi5zZWdtZW50UG9pbnRzIFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgIE9wdGlvbi5jeWNsZXMgTnVtYmVyIG9mIGl0ZXJhdGlvbnNcclxuICogQHJldHVybiB7TnVtYmVyfSAgICAgICAgICAgT3B0aW9uLnJvdW5kcyBUaGUgbnVtYmVyIG9mIHJlY3Vyc2lvbnMgZm9yIHRoZSBsYXN0IGl0ZXJhdGlvblxyXG4gKi9cblxuZnVuY3Rpb24gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcbiAgdmFyIHNlZ21lbnRzTnVtID0gYmV6aWVyQ3VydmUubGVuZ3RoIC0gMTtcbiAgdmFyIHN0YXJ0UG9pbnQgPSBiZXppZXJDdXJ2ZVswXTtcbiAgdmFyIGVuZFBvaW50ID0gYmV6aWVyQ3VydmVbc2VnbWVudHNOdW1dWzJdO1xuICB2YXIgc2VnbWVudHMgPSBiZXppZXJDdXJ2ZS5zbGljZSgxKTtcbiAgdmFyIGdldFNlZ21lbnRUUG9pbnRGdW5zID0gc2VnbWVudHMubWFwKGZ1bmN0aW9uIChzZWcsIGkpIHtcbiAgICB2YXIgYmVnaW5Qb2ludCA9IGkgPT09IDAgPyBzdGFydFBvaW50IDogc2VnbWVudHNbaSAtIDFdWzJdO1xuICAgIHJldHVybiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bi5hcHBseSh2b2lkIDAsIFtiZWdpblBvaW50XS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShzZWcpKSk7XG4gIH0pOyAvLyBJbml0aWFsaXplIHRoZSBjdXJ2ZSB0byBhIHBvbHlsaW5lXG5cbiAgdmFyIHNlZ21lbnRQb2ludHNOdW0gPSBuZXcgQXJyYXkoc2VnbWVudHNOdW0pLmZpbGwoZGVmYXVsdFNlZ21lbnRQb2ludHNOdW0pO1xuICB2YXIgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7IC8vIENhbGN1bGF0ZSB1bmlmb3JtbHkgZGlzdHJpYnV0ZWQgcG9pbnRzIGJ5IGl0ZXJhdGl2ZWx5XG5cbiAgdmFyIHJlc3VsdCA9IGNhbGNVbmlmb3JtUG9pbnRzQnlJdGVyYXRpb24oc2VnbWVudFBvaW50cywgZ2V0U2VnbWVudFRQb2ludEZ1bnMsIHNlZ21lbnRzLCBwcmVjaXNpb24pO1xuICByZXN1bHQuc2VnbWVudFBvaW50cy5wdXNoKGVuZFBvaW50KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gIEdlbmVyYXRlIGEgbWV0aG9kIGZvciBvYnRhaW5pbmcgY29ycmVzcG9uZGluZyBwb2ludCBieSB0IGFjY29yZGluZyB0byBjdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlZ2luUG9pbnQgICAgQmV6aWVyQ3VydmUgYmVnaW4gcG9pbnQuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQxIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDEuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjb250cm9sUG9pbnQyIEJlemllckN1cnZlIGNvbnRyb2xQb2ludDIuIFt4LCB5XVxyXG4gKiBAcGFyYW0ge0FycmF5fSBlbmRQb2ludCAgICAgIEJlemllckN1cnZlIGVuZCBwb2ludC4gW3gsIHldXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBFeHBlY3RlZCBmdW5jdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVHZXRCZXppZXJDdXJ2ZVRQb2ludEZ1bihiZWdpblBvaW50LCBjb250cm9sUG9pbnQxLCBjb250cm9sUG9pbnQyLCBlbmRQb2ludCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICB2YXIgdFN1YmVkMSA9IDEgLSB0O1xuICAgIHZhciB0U3ViZWQxUG93MyA9IHBvdyh0U3ViZWQxLCAzKTtcbiAgICB2YXIgdFN1YmVkMVBvdzIgPSBwb3codFN1YmVkMSwgMik7XG4gICAgdmFyIHRQb3czID0gcG93KHQsIDMpO1xuICAgIHZhciB0UG93MiA9IHBvdyh0LCAyKTtcbiAgICByZXR1cm4gW2JlZ2luUG9pbnRbMF0gKiB0U3ViZWQxUG93MyArIDMgKiBjb250cm9sUG9pbnQxWzBdICogdCAqIHRTdWJlZDFQb3cyICsgMyAqIGNvbnRyb2xQb2ludDJbMF0gKiB0UG93MiAqIHRTdWJlZDEgKyBlbmRQb2ludFswXSAqIHRQb3czLCBiZWdpblBvaW50WzFdICogdFN1YmVkMVBvdzMgKyAzICogY29udHJvbFBvaW50MVsxXSAqIHQgKiB0U3ViZWQxUG93MiArIDMgKiBjb250cm9sUG9pbnQyWzFdICogdFBvdzIgKiB0U3ViZWQxICsgZW5kUG9pbnRbMV0gKiB0UG93M107XG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MSBCZXppZXJDdXJ2ZSBiZWdpbiBwb2ludC4gW3gsIHldXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MiBCZXppZXJDdXJ2ZSBjb250cm9sUG9pbnQxLiBbeCwgeV1cclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBkaXN0YW5jZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKF9yZWYsIF9yZWYyKSB7XG4gIHZhciBfcmVmMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgIGF4ID0gX3JlZjNbMF0sXG4gICAgICBheSA9IF9yZWYzWzFdO1xuXG4gIHZhciBfcmVmNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMiwgMiksXG4gICAgICBieCA9IF9yZWY0WzBdLFxuICAgICAgYnkgPSBfcmVmNFsxXTtcblxuICByZXR1cm4gc3FydChwb3coYXggLSBieCwgMikgKyBwb3coYXkgLSBieSwgMikpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHN1bSBvZiB0aGUgYXJyYXkgb2YgbnVtYmVyc1xyXG4gKiBAcGFyYW0ge0FycmF5fSBudW1zIEFuIGFycmF5IG9mIG51bWJlcnNcclxuICogQHJldHVybiB7TnVtYmVyfSBFeHBlY3RlZCBzdW1cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0TnVtc1N1bShudW1zKSB7XG4gIHJldHVybiBudW1zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBudW0pIHtcbiAgICByZXR1cm4gc3VtICsgbnVtO1xuICB9LCAwKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBkaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50c1xyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzIE11bHRpcGxlIHNldHMgb2YgcG9pbnQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gRGlzdGFuY2Ugb2YgbXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzKSB7XG4gIHJldHVybiBzZWdtZW50UG9pbnRzLm1hcChmdW5jdGlvbiAocG9pbnRzLCBpKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheShwb2ludHMubGVuZ3RoIC0gMSkuZmlsbCgwKS5tYXAoZnVuY3Rpb24gKHRlbXAsIGopIHtcbiAgICAgIHJldHVybiBnZXRUd29Qb2ludERpc3RhbmNlKHBvaW50c1tqXSwgcG9pbnRzW2ogKyAxXSk7XG4gICAgfSk7XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIG9mIG11bHRpcGxlIHNldHMgb2YgcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNlZ21lbnRQb2ludHMgTXVsdGlwbGUgc2V0cyBvZiBwb2ludCBkYXRhXHJcbiAqIEByZXR1cm4ge0FycmF5fSBEaXN0YW5jZSBvZiBtdWx0aXBsZSBzZXRzIG9mIHBvaW50IGRhdGFcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0U2VnbWVudFBvaW50c0J5TnVtKGdldFNlZ21lbnRUUG9pbnRGdW5zLCBzZWdtZW50UG9pbnRzTnVtKSB7XG4gIHJldHVybiBnZXRTZWdtZW50VFBvaW50RnVucy5tYXAoZnVuY3Rpb24gKGdldFNlZ21lbnRUUG9pbnRGdW4sIGkpIHtcbiAgICB2YXIgdEdhcCA9IDEgLyBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgIHJldHVybiBuZXcgQXJyYXkoc2VnbWVudFBvaW50c051bVtpXSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uIChmb28sIGopIHtcbiAgICAgIHJldHVybiBnZXRTZWdtZW50VFBvaW50RnVuKGogKiB0R2FwKTtcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgc3VtIG9mIGRldmlhdGlvbnMgYmV0d2VlbiBsaW5lIHNlZ21lbnQgYW5kIHRoZSBhdmVyYWdlIGxlbmd0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBzZWdtZW50UG9pbnRzRGlzdGFuY2UgU2VnbWVudCBsZW5ndGggb2YgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGF2Z0xlbmd0aCAgICAgICAgICAgIEF2ZXJhZ2UgbGVuZ3RoIG9mIHRoZSBsaW5lIHNlZ21lbnRcclxuICogQHJldHVybiB7TnVtYmVyfSBEZXZpYXRpb25zXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEFsbERldmlhdGlvbnMoc2VnbWVudFBvaW50c0Rpc3RhbmNlLCBhdmdMZW5ndGgpIHtcbiAgcmV0dXJuIHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgIHJldHVybiBzZWcubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gYWJzKHMgLSBhdmdMZW5ndGgpO1xuICAgIH0pO1xuICB9KS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgIHJldHVybiBnZXROdW1zU3VtKHNlZyk7XG4gIH0pLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHYpIHtcbiAgICByZXR1cm4gdG90YWwgKyB2O1xuICB9LCAwKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2FsY3VsYXRlIHVuaWZvcm1seSBkaXN0cmlidXRlZCBwb2ludHMgYnkgaXRlcmF0aXZlbHlcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudFBvaW50cyAgICAgICAgTXVsdGlwbGUgc2V0ZCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtBcnJheX0gZ2V0U2VnbWVudFRQb2ludEZ1bnMgRnVuY3Rpb25zIG9mIGdldCBhIHBvaW50IG9uIHRoZSBjdXJ2ZSB3aXRoIHRcclxuICogQHBhcmFtIHtBcnJheX0gc2VnbWVudHMgICAgICAgICAgICAgQmV6aWVyQ3VydmUgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uICAgICAgICAgICBDYWxjdWxhdGlvbiBhY2N1cmFjeVxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IENhbGN1bGF0aW9uIHJlc3VsdHMgYW5kIHJlbGF0ZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gIE9wdGlvbi5zZWdtZW50UG9pbnRzIFBvaW50IGRhdGEgdGhhdCBjb25zdGl0dXRlcyBhIHBvbHlsaW5lIGFmdGVyIGNhbGN1bGF0aW9uXHJcbiAqIEByZXR1cm4ge051bWJlcn0gT3B0aW9uLmN5Y2xlcyBOdW1iZXIgb2YgaXRlcmF0aW9uc1xyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IE9wdGlvbi5yb3VuZHMgVGhlIG51bWJlciBvZiByZWN1cnNpb25zIGZvciB0aGUgbGFzdCBpdGVyYXRpb25cclxuICovXG5cblxuZnVuY3Rpb24gY2FsY1VuaWZvcm1Qb2ludHNCeUl0ZXJhdGlvbihzZWdtZW50UG9pbnRzLCBnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudHMsIHByZWNpc2lvbikge1xuICAvLyBUaGUgbnVtYmVyIG9mIGxvb3BzIGZvciB0aGUgY3VycmVudCBpdGVyYXRpb25cbiAgdmFyIHJvdW5kcyA9IDQ7IC8vIE51bWJlciBvZiBpdGVyYXRpb25zXG5cbiAgdmFyIGN5Y2xlcyA9IDE7XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoKSB7XG4gICAgLy8gUmVjYWxjdWxhdGUgdGhlIG51bWJlciBvZiBwb2ludHMgcGVyIGN1cnZlIGJhc2VkIG9uIHRoZSBsYXN0IGl0ZXJhdGlvbiBkYXRhXG4gICAgdmFyIHRvdGFsUG9pbnRzTnVtID0gc2VnbWVudFBvaW50cy5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7IC8vIEFkZCBsYXN0IHBvaW50cyBvZiBzZWdtZW50IHRvIGNhbGMgZXhhY3Qgc2VnbWVudCBsZW5ndGhcblxuICAgIHNlZ21lbnRQb2ludHMuZm9yRWFjaChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgICByZXR1cm4gc2VnLnB1c2goc2VnbWVudHNbaV1bMl0pO1xuICAgIH0pO1xuICAgIHZhciBzZWdtZW50UG9pbnRzRGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2Uoc2VnbWVudFBvaW50cyk7XG4gICAgdmFyIGxpbmVTZWdtZW50TnVtID0gc2VnbWVudFBvaW50c0Rpc3RhbmNlLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICB2YXIgc2VnbWVudGxlbmd0aCA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgICB9KTtcbiAgICB2YXIgdG90YWxMZW5ndGggPSBnZXROdW1zU3VtKHNlZ21lbnRsZW5ndGgpO1xuICAgIHZhciBhdmdMZW5ndGggPSB0b3RhbExlbmd0aCAvIGxpbmVTZWdtZW50TnVtOyAvLyBDaGVjayBpZiBwcmVjaXNpb24gaXMgcmVhY2hlZFxuXG4gICAgdmFyIGFsbERldmlhdGlvbnMgPSBnZXRBbGxEZXZpYXRpb25zKHNlZ21lbnRQb2ludHNEaXN0YW5jZSwgYXZnTGVuZ3RoKTtcbiAgICBpZiAoYWxsRGV2aWF0aW9ucyA8PSBwcmVjaXNpb24pIHJldHVybiBcImJyZWFrXCI7XG4gICAgdG90YWxQb2ludHNOdW0gPSBjZWlsKGF2Z0xlbmd0aCAvIHByZWNpc2lvbiAqIHRvdGFsUG9pbnRzTnVtICogMS4xKTtcbiAgICB2YXIgc2VnbWVudFBvaW50c051bSA9IHNlZ21lbnRsZW5ndGgubWFwKGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgICAgIHJldHVybiBjZWlsKGxlbmd0aCAvIHRvdGFsTGVuZ3RoICogdG90YWxQb2ludHNOdW0pO1xuICAgIH0pOyAvLyBDYWxjdWxhdGUgdGhlIHBvaW50cyBhZnRlciByZWRpc3RyaWJ1dGlvblxuXG4gICAgc2VnbWVudFBvaW50cyA9IGdldFNlZ21lbnRQb2ludHNCeU51bShnZXRTZWdtZW50VFBvaW50RnVucywgc2VnbWVudFBvaW50c051bSk7XG4gICAgdG90YWxQb2ludHNOdW0gPSBzZWdtZW50UG9pbnRzLnJlZHVjZShmdW5jdGlvbiAodG90YWwsIHNlZykge1xuICAgICAgcmV0dXJuIHRvdGFsICsgc2VnLmxlbmd0aDtcbiAgICB9LCAwKTtcbiAgICB2YXIgc2VnbWVudFBvaW50c0Zvckxlbmd0aCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc2VnbWVudFBvaW50cykpO1xuICAgIHNlZ21lbnRQb2ludHNGb3JMZW5ndGguZm9yRWFjaChmdW5jdGlvbiAoc2VnLCBpKSB7XG4gICAgICByZXR1cm4gc2VnLnB1c2goc2VnbWVudHNbaV1bMl0pO1xuICAgIH0pO1xuICAgIHNlZ21lbnRQb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShzZWdtZW50UG9pbnRzRm9yTGVuZ3RoKTtcbiAgICBsaW5lU2VnbWVudE51bSA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzZWcpIHtcbiAgICAgIHJldHVybiB0b3RhbCArIHNlZy5sZW5ndGg7XG4gICAgfSwgMCk7XG4gICAgc2VnbWVudGxlbmd0aCA9IHNlZ21lbnRQb2ludHNEaXN0YW5jZS5tYXAoZnVuY3Rpb24gKHNlZykge1xuICAgICAgcmV0dXJuIGdldE51bXNTdW0oc2VnKTtcbiAgICB9KTtcbiAgICB0b3RhbExlbmd0aCA9IGdldE51bXNTdW0oc2VnbWVudGxlbmd0aCk7XG4gICAgYXZnTGVuZ3RoID0gdG90YWxMZW5ndGggLyBsaW5lU2VnbWVudE51bTtcbiAgICB2YXIgc3RlcFNpemUgPSAxIC8gdG90YWxQb2ludHNOdW0gLyAxMDsgLy8gUmVjdXJzaXZlbHkgZm9yIGVhY2ggc2VnbWVudCBvZiB0aGUgcG9seWxpbmVcblxuICAgIGdldFNlZ21lbnRUUG9pbnRGdW5zLmZvckVhY2goZnVuY3Rpb24gKGdldFNlZ21lbnRUUG9pbnRGdW4sIGkpIHtcbiAgICAgIHZhciBjdXJyZW50U2VnbWVudFBvaW50c051bSA9IHNlZ21lbnRQb2ludHNOdW1baV07XG4gICAgICB2YXIgdCA9IG5ldyBBcnJheShjdXJyZW50U2VnbWVudFBvaW50c051bSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uIChmb28sIGopIHtcbiAgICAgICAgcmV0dXJuIGogLyBzZWdtZW50UG9pbnRzTnVtW2ldO1xuICAgICAgfSk7IC8vIFJlcGVhdGVkIHJlY3Vyc2l2ZSBvZmZzZXRcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByb3VuZHM7IHIrKykge1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBnZXRTZWdtZW50UG9pbnRzRGlzdGFuY2UoW3NlZ21lbnRQb2ludHNbaV1dKVswXTtcbiAgICAgICAgdmFyIGRldmlhdGlvbnMgPSBkaXN0YW5jZS5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICByZXR1cm4gZCAtIGF2Z0xlbmd0aDtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY3VycmVudFNlZ21lbnRQb2ludHNOdW07IGorKykge1xuICAgICAgICAgIGlmIChqID09PSAwKSByZXR1cm47XG4gICAgICAgICAgb2Zmc2V0ICs9IGRldmlhdGlvbnNbaiAtIDFdO1xuICAgICAgICAgIHRbal0gLT0gc3RlcFNpemUgKiBvZmZzZXQ7XG4gICAgICAgICAgaWYgKHRbal0gPiAxKSB0W2pdID0gMTtcbiAgICAgICAgICBpZiAodFtqXSA8IDApIHRbal0gPSAwO1xuICAgICAgICAgIHNlZ21lbnRQb2ludHNbaV1bal0gPSBnZXRTZWdtZW50VFBvaW50RnVuKHRbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcm91bmRzICo9IDQ7XG4gICAgY3ljbGVzKys7XG4gIH07XG5cbiAgZG8ge1xuICAgIHZhciBfcmV0ID0gX2xvb3AoKTtcblxuICAgIGlmIChfcmV0ID09PSBcImJyZWFrXCIpIGJyZWFrO1xuICB9IHdoaWxlIChyb3VuZHMgPD0gMTAyNSk7XG5cbiAgc2VnbWVudFBvaW50cyA9IHNlZ21lbnRQb2ludHMucmVkdWNlKGZ1bmN0aW9uIChhbGwsIHNlZykge1xuICAgIHJldHVybiBhbGwuY29uY2F0KHNlZyk7XG4gIH0sIFtdKTtcbiAgcmV0dXJuIHtcbiAgICBzZWdtZW50UG9pbnRzOiBzZWdtZW50UG9pbnRzLFxuICAgIGN5Y2xlczogY3ljbGVzLFxuICAgIHJvdW5kczogcm91bmRzXG4gIH07XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcG9seWxpbmUgY29ycmVzcG9uZGluZyB0byB0aGUgQmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIEJlemllckN1cnZlIGRhdGFcclxuICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbiAgQ2FsY3VsYXRpb24gYWNjdXJhY3kuIFJlY29tbWVuZGVkIGZvciAxLTIwLiBEZWZhdWx0ID0gNVxyXG4gKiBAcmV0dXJuIHtBcnJheXxCb29sZWFufSBQb2ludCBkYXRhIHRoYXQgY29uc3RpdHV0ZXMgYSBwb2x5bGluZSBhZnRlciBjYWxjdWxhdGlvbiAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gYmV6aWVyQ3VydmVUb1BvbHlsaW5lKGJlemllckN1cnZlKSB7XG4gIHZhciBwcmVjaXNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDU7XG5cbiAgaWYgKCFiZXppZXJDdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2JlemllckN1cnZlVG9Qb2x5bGluZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghKGJlemllckN1cnZlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgY29uc29sZS5lcnJvcignYmV6aWVyQ3VydmVUb1BvbHlsaW5lOiBQYXJhbWV0ZXIgYmV6aWVyQ3VydmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZWNpc2lvbiAhPT0gJ251bWJlcicpIHtcbiAgICBjb25zb2xlLmVycm9yKCdiZXppZXJDdXJ2ZVRvUG9seWxpbmU6IFBhcmFtZXRlciBwcmVjaXNpb24gbXVzdCBiZSBhIG51bWJlciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgX2Fic3RyYWN0QmV6aWVyQ3VydmVUID0gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUsIHByZWNpc2lvbiksXG4gICAgICBzZWdtZW50UG9pbnRzID0gX2Fic3RyYWN0QmV6aWVyQ3VydmVULnNlZ21lbnRQb2ludHM7XG5cbiAgcmV0dXJuIHNlZ21lbnRQb2ludHM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgYmV6aWVyIGN1cnZlIGxlbmd0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBiZXppZXJDdXJ2ZSBkYXRhXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24gIGNhbGN1bGF0aW9uIGFjY3VyYWN5LiBSZWNvbW1lbmRlZCBmb3IgNS0xMC4gRGVmYXVsdCA9IDVcclxuICogQHJldHVybiB7TnVtYmVyfEJvb2xlYW59IEJlemllckN1cnZlIGxlbmd0aCAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVMZW5ndGgoYmV6aWVyQ3VydmUpIHtcbiAgdmFyIHByZWNpc2lvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNTtcblxuICBpZiAoIWJlemllckN1cnZlKSB7XG4gICAgY29uc29sZS5lcnJvcignZ2V0QmV6aWVyQ3VydmVMZW5ndGg6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIShiZXppZXJDdXJ2ZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldEJlemllckN1cnZlTGVuZ3RoOiBQYXJhbWV0ZXIgYmV6aWVyQ3VydmUgbXVzdCBiZSBhbiBhcnJheSEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIHByZWNpc2lvbiAhPT0gJ251bWJlcicpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRCZXppZXJDdXJ2ZUxlbmd0aDogUGFyYW1ldGVyIHByZWNpc2lvbiBtdXN0IGJlIGEgbnVtYmVyIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBfYWJzdHJhY3RCZXppZXJDdXJ2ZVQyID0gYWJzdHJhY3RCZXppZXJDdXJ2ZVRvUG9seWxpbmUoYmV6aWVyQ3VydmUsIHByZWNpc2lvbiksXG4gICAgICBzZWdtZW50UG9pbnRzID0gX2Fic3RyYWN0QmV6aWVyQ3VydmVUMi5zZWdtZW50UG9pbnRzOyAvLyBDYWxjdWxhdGUgdGhlIHRvdGFsIGxlbmd0aCBvZiB0aGUgcG9pbnRzIHRoYXQgbWFrZSB1cCB0aGUgcG9seWxpbmVcblxuXG4gIHZhciBwb2ludHNEaXN0YW5jZSA9IGdldFNlZ21lbnRQb2ludHNEaXN0YW5jZShbc2VnbWVudFBvaW50c10pWzBdO1xuICB2YXIgbGVuZ3RoID0gZ2V0TnVtc1N1bShwb2ludHNEaXN0YW5jZSk7XG4gIHJldHVybiBsZW5ndGg7XG59XG5cbnZhciBfZGVmYXVsdCA9IGJlemllckN1cnZlVG9Qb2x5bGluZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG4vKipcclxuICogQGRlc2NyaXB0aW9uIEFic3RyYWN0IHRoZSBwb2x5bGluZSBmb3JtZWQgYnkgTiBwb2ludHMgaW50byBhIHNldCBvZiBiZXppZXIgY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9seWxpbmUgQSBzZXQgb2YgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHBvbHlsaW5lXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgIENsb3NlZCBjdXJ2ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QSBTbW9vdGhuZXNzXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRCIFNtb290aG5lc3NcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gQSBzZXQgb2YgYmV6aWVyIGN1cnZlIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cbmZ1bmN0aW9uIHBvbHlsaW5lVG9CZXppZXJDdXJ2ZShwb2x5bGluZSkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IDAuMjU7XG5cbiAgaWYgKCEocG9seWxpbmUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdwb2x5bGluZVRvQmV6aWVyQ3VydmU6IFBhcmFtZXRlciBwb2x5bGluZSBtdXN0IGJlIGFuIGFycmF5IScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChwb2x5bGluZS5sZW5ndGggPD0gMikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BvbHlsaW5lVG9CZXppZXJDdXJ2ZTogQ29udmVydGluZyB0byBhIGN1cnZlIHJlcXVpcmVzIGF0IGxlYXN0IDMgcG9pbnRzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBzdGFydFBvaW50ID0gcG9seWxpbmVbMF07XG4gIHZhciBiZXppZXJDdXJ2ZUxpbmVOdW0gPSBwb2x5bGluZS5sZW5ndGggLSAxO1xuICB2YXIgYmV6aWVyQ3VydmVQb2ludHMgPSBuZXcgQXJyYXkoYmV6aWVyQ3VydmVMaW5lTnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdldEJlemllckN1cnZlTGluZUNvbnRyb2xQb2ludHMocG9seWxpbmUsIGksIGNsb3NlLCBvZmZzZXRBLCBvZmZzZXRCKSksIFtwb2x5bGluZVtpICsgMV1dKTtcbiAgfSk7XG4gIGlmIChjbG9zZSkgY2xvc2VCZXppZXJDdXJ2ZShiZXppZXJDdXJ2ZVBvaW50cywgc3RhcnRQb2ludCk7XG4gIGJlemllckN1cnZlUG9pbnRzLnVuc2hpZnQocG9seWxpbmVbMF0pO1xuICByZXR1cm4gYmV6aWVyQ3VydmVQb2ludHM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY29udHJvbCBwb2ludHMgb2YgdGhlIEJlemllciBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2x5bGluZSBBIHNldCBvZiBwb2ludHMgdGhhdCBtYWtlIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4ICAgVGhlIGluZGV4IG9mIHdoaWNoIGdldCBjb250cm9scyBwb2ludHMncyBwb2ludCBpbiBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlICBDbG9zZWQgY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldEEgU21vb3RobmVzc1xyXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0QiBTbW9vdGhuZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBDb250cm9sIHBvaW50c1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZUxpbmVDb250cm9sUG9pbnRzKHBvbHlsaW5lLCBpbmRleCkge1xuICB2YXIgY2xvc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgb2Zmc2V0QSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMC4yNTtcbiAgdmFyIG9mZnNldEIgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IDAuMjU7XG4gIHZhciBwb2ludE51bSA9IHBvbHlsaW5lLmxlbmd0aDtcbiAgaWYgKHBvaW50TnVtIDwgMyB8fCBpbmRleCA+PSBwb2ludE51bSkgcmV0dXJuO1xuICB2YXIgYmVmb3JlUG9pbnRJbmRleCA9IGluZGV4IC0gMTtcbiAgaWYgKGJlZm9yZVBvaW50SW5kZXggPCAwKSBiZWZvcmVQb2ludEluZGV4ID0gY2xvc2UgPyBwb2ludE51bSArIGJlZm9yZVBvaW50SW5kZXggOiAwO1xuICB2YXIgYWZ0ZXJQb2ludEluZGV4ID0gaW5kZXggKyAxO1xuICBpZiAoYWZ0ZXJQb2ludEluZGV4ID49IHBvaW50TnVtKSBhZnRlclBvaW50SW5kZXggPSBjbG9zZSA/IGFmdGVyUG9pbnRJbmRleCAtIHBvaW50TnVtIDogcG9pbnROdW0gLSAxO1xuICB2YXIgYWZ0ZXJOZXh0UG9pbnRJbmRleCA9IGluZGV4ICsgMjtcbiAgaWYgKGFmdGVyTmV4dFBvaW50SW5kZXggPj0gcG9pbnROdW0pIGFmdGVyTmV4dFBvaW50SW5kZXggPSBjbG9zZSA/IGFmdGVyTmV4dFBvaW50SW5kZXggLSBwb2ludE51bSA6IHBvaW50TnVtIC0gMTtcbiAgdmFyIHBvaW50QmVmb3JlID0gcG9seWxpbmVbYmVmb3JlUG9pbnRJbmRleF07XG4gIHZhciBwb2ludE1pZGRsZSA9IHBvbHlsaW5lW2luZGV4XTtcbiAgdmFyIHBvaW50QWZ0ZXIgPSBwb2x5bGluZVthZnRlclBvaW50SW5kZXhdO1xuICB2YXIgcG9pbnRBZnRlck5leHQgPSBwb2x5bGluZVthZnRlck5leHRQb2ludEluZGV4XTtcbiAgcmV0dXJuIFtbcG9pbnRNaWRkbGVbMF0gKyBvZmZzZXRBICogKHBvaW50QWZ0ZXJbMF0gLSBwb2ludEJlZm9yZVswXSksIHBvaW50TWlkZGxlWzFdICsgb2Zmc2V0QSAqIChwb2ludEFmdGVyWzFdIC0gcG9pbnRCZWZvcmVbMV0pXSwgW3BvaW50QWZ0ZXJbMF0gLSBvZmZzZXRCICogKHBvaW50QWZ0ZXJOZXh0WzBdIC0gcG9pbnRNaWRkbGVbMF0pLCBwb2ludEFmdGVyWzFdIC0gb2Zmc2V0QiAqIChwb2ludEFmdGVyTmV4dFsxXSAtIHBvaW50TWlkZGxlWzFdKV1dO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGxhc3QgY3VydmUgb2YgdGhlIGNsb3N1cmVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgQSBzZXQgb2Ygc3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0UG9pbnQgIFN0YXJ0IHBvaW50XHJcbiAqIEByZXR1cm4ge0FycmF5fSBUaGUgbGFzdCBjdXJ2ZSBmb3IgY2xvc3VyZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBjbG9zZUJlemllckN1cnZlKGJlemllckN1cnZlLCBzdGFydFBvaW50KSB7XG4gIHZhciBmaXJzdFN1YkN1cnZlID0gYmV6aWVyQ3VydmVbMF07XG4gIHZhciBsYXN0U3ViQ3VydmUgPSBiZXppZXJDdXJ2ZS5zbGljZSgtMSlbMF07XG4gIGJlemllckN1cnZlLnB1c2goW2dldFN5bW1ldHJ5UG9pbnQobGFzdFN1YkN1cnZlWzFdLCBsYXN0U3ViQ3VydmVbMl0pLCBnZXRTeW1tZXRyeVBvaW50KGZpcnN0U3ViQ3VydmVbMF0sIHN0YXJ0UG9pbnQpLCBzdGFydFBvaW50XSk7XG4gIHJldHVybiBiZXppZXJDdXJ2ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBzeW1tZXRyeSBwb2ludFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgICBTeW1tZXRyaWMgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gY2VudGVyUG9pbnQgU3ltbWV0cmljIGNlbnRlclxyXG4gKiBAcmV0dXJuIHtBcnJheX0gU3ltbWV0cmljIHBvaW50XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFN5bW1ldHJ5UG9pbnQocG9pbnQsIGNlbnRlclBvaW50KSB7XG4gIHZhciBfcG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgcHggPSBfcG9pbnRbMF0sXG4gICAgICBweSA9IF9wb2ludFsxXTtcblxuICB2YXIgX2NlbnRlclBvaW50ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGNlbnRlclBvaW50LCAyKSxcbiAgICAgIGN4ID0gX2NlbnRlclBvaW50WzBdLFxuICAgICAgY3kgPSBfY2VudGVyUG9pbnRbMV07XG5cbiAgdmFyIG1pbnVzWCA9IGN4IC0gcHg7XG4gIHZhciBtaW51c1kgPSBjeSAtIHB5O1xuICByZXR1cm4gW2N4ICsgbWludXNYLCBjeSArIG1pbnVzWV07XG59XG5cbnZhciBfZGVmYXVsdCA9IHBvbHlsaW5lVG9CZXppZXJDdXJ2ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiYmV6aWVyQ3VydmVUb1BvbHlsaW5lXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEJlemllckN1cnZlTGVuZ3RoXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9iZXppZXJDdXJ2ZVRvUG9seWxpbmUuZ2V0QmV6aWVyQ3VydmVMZW5ndGg7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwicG9seWxpbmVUb0JlemllckN1cnZlXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdO1xuICB9XG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2JlemllckN1cnZlVG9Qb2x5bGluZSA9IHJlcXVpcmUoXCIuL2NvcmUvYmV6aWVyQ3VydmVUb1BvbHlsaW5lXCIpO1xuXG52YXIgX3BvbHlsaW5lVG9CZXppZXJDdXJ2ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29yZS9wb2x5bGluZVRvQmV6aWVyQ3VydmVcIikpO1xuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGJlemllckN1cnZlVG9Qb2x5bGluZTogX2JlemllckN1cnZlVG9Qb2x5bGluZS5iZXppZXJDdXJ2ZVRvUG9seWxpbmUsXG4gIGdldEJlemllckN1cnZlTGVuZ3RoOiBfYmV6aWVyQ3VydmVUb1BvbHlsaW5lLmdldEJlemllckN1cnZlTGVuZ3RoLFxuICBwb2x5bGluZVRvQmV6aWVyQ3VydmU6IF9wb2x5bGluZVRvQmV6aWVyQ3VydmVbXCJkZWZhdWx0XCJdXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5XCIpKTtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIF9jb2xvciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvY29sb3JcIikpO1xuXG52YXIgX2JlemllckN1cnZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfZ3JhcGhzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi4vY29uZmlnL2dyYXBoc1wiKSk7XG5cbnZhciBfZ3JhcGggPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2dyYXBoLmNsYXNzXCIpKTtcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7IHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7IGlmIChlbnVtZXJhYmxlT25seSkgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pOyBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7IH0gcmV0dXJuIGtleXM7IH1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307IGlmIChpICUgMikgeyBvd25LZXlzKHNvdXJjZSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7ICgwLCBfZGVmaW5lUHJvcGVydHkyW1wiZGVmYXVsdFwiXSkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSk7IH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHsgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTsgfSBlbHNlIHsgb3duS2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gfSByZXR1cm4gdGFyZ2V0OyB9XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgICAgIENsYXNzIG9mIENSZW5kZXJcclxuICogQHBhcmFtIHtPYmplY3R9IGNhbnZhcyBDYW52YXMgRE9NXHJcbiAqIEByZXR1cm4ge0NSZW5kZXJ9ICAgICAgSW5zdGFuY2Ugb2YgQ1JlbmRlclxyXG4gKi9cbnZhciBDUmVuZGVyID0gZnVuY3Rpb24gQ1JlbmRlcihjYW52YXMpIHtcbiAgKDAsIF9jbGFzc0NhbGxDaGVjazJbXCJkZWZhdWx0XCJdKSh0aGlzLCBDUmVuZGVyKTtcblxuICBpZiAoIWNhbnZhcykge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NSZW5kZXIgTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdmFyIGNsaWVudFdpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgY2xpZW50SGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgdmFyIGFyZWEgPSBbY2xpZW50V2lkdGgsIGNsaWVudEhlaWdodF07XG4gIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgY2xpZW50V2lkdGgpO1xuICBjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBjbGllbnRIZWlnaHQpO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQ29udGV4dCBvZiB0aGUgY2FudmFzXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKiBAZXhhbXBsZSBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxyXG4gICAqL1xuXG4gIHRoaXMuY3R4ID0gY3R4O1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gV2lkdGggYW5kIGhlaWdodCBvZiB0aGUgY2FudmFzXHJcbiAgICogQHR5cGUge0FycmF5fVxyXG4gICAqIEBleGFtcGxlIGFyZWEgPSBbMzAw77yMMTAwXVxyXG4gICAqL1xuXG4gIHRoaXMuYXJlYSA9IGFyZWE7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBXaGV0aGVyIHJlbmRlciBpcyBpbiBhbmltYXRpb24gcmVuZGVyaW5nXHJcbiAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICogQGV4YW1wbGUgYW5pbWF0aW9uU3RhdHVzID0gdHJ1ZXxmYWxzZVxyXG4gICAqL1xuXG4gIHRoaXMuYW5pbWF0aW9uU3RhdHVzID0gZmFsc2U7XG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiBBZGRlZCBncmFwaFxyXG4gICAqIEB0eXBlIHtbR3JhcGhdfVxyXG4gICAqIEBleGFtcGxlIGdyYXBocyA9IFtHcmFwaCwgR3JhcGgsIC4uLl1cclxuICAgKi9cblxuICB0aGlzLmdyYXBocyA9IFtdO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQ29sb3IgcGx1Z2luXHJcbiAgICogQHR5cGUge09iamVjdH1cclxuICAgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vamlhbWluZzc0My9jb2xvclxyXG4gICAqL1xuXG4gIHRoaXMuY29sb3IgPSBfY29sb3JbXCJkZWZhdWx0XCJdO1xuICAvKipcclxuICAgKiBAZGVzY3JpcHRpb24gQmV6aWVyIEN1cnZlIHBsdWdpblxyXG4gICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2ppYW1pbmc3NDMvQmV6aWVyQ3VydmVcclxuICAgKi9cblxuICB0aGlzLmJlemllckN1cnZlID0gX2JlemllckN1cnZlW1wiZGVmYXVsdFwiXTsgLy8gYmluZCBldmVudCBoYW5kbGVyXG5cbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZVVwLmJpbmQodGhpcykpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gICAgICAgIENsZWFyIGNhbnZhcyBkcmF3aW5nIGFyZWFcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gQ1JlbmRlcjtcblxuQ1JlbmRlci5wcm90b3R5cGUuY2xlYXJBcmVhID0gZnVuY3Rpb24gKCkge1xuICB2YXIgX3RoaXMkY3R4O1xuXG4gIHZhciBhcmVhID0gdGhpcy5hcmVhO1xuXG4gIChfdGhpcyRjdHggPSB0aGlzLmN0eCkuY2xlYXJSZWN0LmFwcGx5KF90aGlzJGN0eCwgWzAsIDBdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGFyZWEpKSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgICAgQWRkIGdyYXBoIHRvIHJlbmRlclxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEdyYXBoIGNvbmZpZ3VyYXRpb25cclxuICogQHJldHVybiB7R3JhcGh9ICAgICAgICBHcmFwaCBpbnN0YW5jZVxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb25maWcgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICB2YXIgbmFtZSA9IGNvbmZpZy5uYW1lO1xuXG4gIGlmICghbmFtZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2FkZCBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGdyYXBoQ29uZmlnID0gX2dyYXBoc1tcImRlZmF1bHRcIl0uZ2V0KG5hbWUpO1xuXG4gIGlmICghZ3JhcGhDb25maWcpIHtcbiAgICBjb25zb2xlLndhcm4oJ05vIGNvcnJlc3BvbmRpbmcgZ3JhcGggY29uZmlndXJhdGlvbiBmb3VuZCEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZ3JhcGggPSBuZXcgX2dyYXBoW1wiZGVmYXVsdFwiXShncmFwaENvbmZpZywgY29uZmlnKTtcbiAgaWYgKCFncmFwaC52YWxpZGF0b3IoZ3JhcGgpKSByZXR1cm47XG4gIGdyYXBoLnJlbmRlciA9IHRoaXM7XG4gIHRoaXMuZ3JhcGhzLnB1c2goZ3JhcGgpO1xuICB0aGlzLnNvcnRHcmFwaHNCeUluZGV4KCk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG4gIHJldHVybiBncmFwaDtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFNvcnQgdGhlIGdyYXBoIGJ5IGluZGV4XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5zb3J0R3JhcGhzQnlJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuICBncmFwaHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIGlmIChhLmluZGV4ID4gYi5pbmRleCkgcmV0dXJuIDE7XG4gICAgaWYgKGEuaW5kZXggPT09IGIuaW5kZXgpIHJldHVybiAwO1xuICAgIGlmIChhLmluZGV4IDwgYi5pbmRleCkgcmV0dXJuIC0xO1xuICB9KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgRGVsZXRlIGdyYXBoIGluIHJlbmRlclxyXG4gKiBAcGFyYW0ge0dyYXBofSBncmFwaCBUaGUgZ3JhcGggdG8gYmUgZGVsZXRlZFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9ICBWb2lkXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmRlbEdyYXBoID0gZnVuY3Rpb24gKGdyYXBoKSB7XG4gIGlmICh0eXBlb2YgZ3JhcGguZGVsUHJvY2Vzc29yICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG4gIGdyYXBoLmRlbFByb2Nlc3Nvcih0aGlzKTtcbiAgdGhpcy5ncmFwaHMgPSB0aGlzLmdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9KTtcbiAgdGhpcy5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICBEZWxldGUgYWxsIGdyYXBoIGluIHJlbmRlclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuQ1JlbmRlci5wcm90b3R5cGUuZGVsQWxsR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5ncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguZGVsUHJvY2Vzc29yKF90aGlzKTtcbiAgfSk7XG4gIHRoaXMuZ3JhcGhzID0gdGhpcy5ncmFwaHMuZmlsdGVyKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaDtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgICAgRHJhdyBhbGwgdGhlIGdyYXBocyBpbiB0aGUgcmVuZGVyXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5kcmF3QWxsR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gIHRoaXMuY2xlYXJBcmVhKCk7XG4gIHRoaXMuZ3JhcGhzLmZpbHRlcihmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGggJiYgZ3JhcGgudmlzaWJsZTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguZHJhd1Byb2Nlc3NvcihfdGhpczIsIGdyYXBoKTtcbiAgfSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAgICAgIEFuaW1hdGUgdGhlIGdyYXBoIHdob3NlIGFuaW1hdGlvbiBxdWV1ZSBpcyBub3QgZW1wdHlcclxuICogICAgICAgICAgICAgICAgICAgYW5kIHRoZSBhbmltYXRpb25QYXVzZSBpcyBlcXVhbCB0byBmYWxzZVxyXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBBbmltYXRpb24gUHJvbWlzZVxyXG4gKi9cblxuXG5DUmVuZGVyLnByb3RvdHlwZS5sYXVuY2hBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gIHZhciBhbmltYXRpb25TdGF0dXMgPSB0aGlzLmFuaW1hdGlvblN0YXR1cztcbiAgaWYgKGFuaW1hdGlvblN0YXR1cykgcmV0dXJuO1xuICB0aGlzLmFuaW1hdGlvblN0YXR1cyA9IHRydWU7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgIGFuaW1hdGlvbi5jYWxsKF90aGlzMywgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMzLmFuaW1hdGlvblN0YXR1cyA9IGZhbHNlO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIERhdGUubm93KCkpO1xuICB9KTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFRyeSB0byBhbmltYXRlIGV2ZXJ5IGdyYXBoXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGluIGFuaW1hdGlvbiBlbmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVTdGFtcCAgVGltZSBzdGFtcCBvZiBhbmltYXRpb24gc3RhcnRcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGFuaW1hdGlvbihjYWxsYmFjaywgdGltZVN0YW1wKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcblxuICBpZiAoIWFuaW1hdGlvbkFibGUoZ3JhcGhzKSkge1xuICAgIGNhbGxiYWNrKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnR1cm5OZXh0QW5pbWF0aW9uRnJhbWUodGltZVN0YW1wKTtcbiAgfSk7XG4gIHRoaXMuZHJhd0FsbEdyYXBoKCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRpb24uYmluZCh0aGlzLCBjYWxsYmFjaywgdGltZVN0YW1wKSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEZpbmQgaWYgdGhlcmUgYXJlIGdyYXBoIHRoYXQgY2FuIGJlIGFuaW1hdGVkXHJcbiAqIEBwYXJhbSB7W0dyYXBoXX0gZ3JhcGhzXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGFuaW1hdGlvbkFibGUoZ3JhcGhzKSB7XG4gIHJldHVybiBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gIWdyYXBoLmFuaW1hdGlvblBhdXNlICYmIGdyYXBoLmFuaW1hdGlvbkZyYW1lU3RhdGUubGVuZ3RoO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSGFuZGxlciBvZiBDUmVuZGVyIG1vdXNlZG93biBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gbW91c2VEb3duKGUpIHtcbiAgdmFyIGdyYXBocyA9IHRoaXMuZ3JhcGhzO1xuICB2YXIgaG92ZXJHcmFwaCA9IGdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5zdGF0dXMgPT09ICdob3Zlcic7XG4gIH0pO1xuICBpZiAoIWhvdmVyR3JhcGgpIHJldHVybjtcbiAgaG92ZXJHcmFwaC5zdGF0dXMgPSAnYWN0aXZlJztcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSGFuZGxlciBvZiBDUmVuZGVyIG1vdXNlbW92ZSBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gbW91c2VNb3ZlKGUpIHtcbiAgdmFyIG9mZnNldFggPSBlLm9mZnNldFgsXG4gICAgICBvZmZzZXRZID0gZS5vZmZzZXRZO1xuICB2YXIgcG9zaXRpb24gPSBbb2Zmc2V0WCwgb2Zmc2V0WV07XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgdmFyIGFjdGl2ZUdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2FjdGl2ZScgfHwgZ3JhcGguc3RhdHVzID09PSAnZHJhZyc7XG4gIH0pO1xuXG4gIGlmIChhY3RpdmVHcmFwaCkge1xuICAgIGlmICghYWN0aXZlR3JhcGguZHJhZykgcmV0dXJuO1xuXG4gICAgaWYgKHR5cGVvZiBhY3RpdmVHcmFwaC5tb3ZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdObyBtb3ZlIG1ldGhvZCBpcyBwcm92aWRlZCwgY2Fubm90IGJlIGRyYWdnZWQhJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWN0aXZlR3JhcGgubW92ZVByb2Nlc3NvcihlKTtcbiAgICBhY3RpdmVHcmFwaC5zdGF0dXMgPSAnZHJhZyc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGhvdmVyR3JhcGggPSBncmFwaHMuZmluZChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGguc3RhdHVzID09PSAnaG92ZXInO1xuICB9KTtcbiAgdmFyIGhvdmVyQWJsZUdyYXBocyA9IGdyYXBocy5maWx0ZXIoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLmhvdmVyICYmICh0eXBlb2YgZ3JhcGguaG92ZXJDaGVjayA9PT0gJ2Z1bmN0aW9uJyB8fCBncmFwaC5ob3ZlclJlY3QpO1xuICB9KTtcbiAgdmFyIGhvdmVyZWRHcmFwaCA9IGhvdmVyQWJsZUdyYXBocy5maW5kKGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaC5ob3ZlckNoZWNrUHJvY2Vzc29yKHBvc2l0aW9uLCBncmFwaCk7XG4gIH0pO1xuXG4gIGlmIChob3ZlcmVkR3JhcGgpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IGhvdmVyZWRHcmFwaC5zdHlsZS5ob3ZlckN1cnNvcjtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgfVxuXG4gIHZhciBob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuID0gZmFsc2UsXG4gICAgICBob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4gPSBmYWxzZTtcbiAgaWYgKGhvdmVyR3JhcGgpIGhvdmVyR3JhcGhNb3VzZU91dGVySXNGdW4gPSB0eXBlb2YgaG92ZXJHcmFwaC5tb3VzZU91dGVyID09PSAnZnVuY3Rpb24nO1xuICBpZiAoaG92ZXJlZEdyYXBoKSBob3ZlcmVkR3JhcGhNb3VzZUVudGVySXNGdW4gPSB0eXBlb2YgaG92ZXJlZEdyYXBoLm1vdXNlRW50ZXIgPT09ICdmdW5jdGlvbic7XG4gIGlmICghaG92ZXJlZEdyYXBoICYmICFob3ZlckdyYXBoKSByZXR1cm47XG5cbiAgaWYgKCFob3ZlcmVkR3JhcGggJiYgaG92ZXJHcmFwaCkge1xuICAgIGlmIChob3ZlckdyYXBoTW91c2VPdXRlcklzRnVuKSBob3ZlckdyYXBoLm1vdXNlT3V0ZXIoZSwgaG92ZXJHcmFwaCk7XG4gICAgaG92ZXJHcmFwaC5zdGF0dXMgPSAnc3RhdGljJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaG92ZXJlZEdyYXBoICYmIGhvdmVyZWRHcmFwaCA9PT0gaG92ZXJHcmFwaCkgcmV0dXJuO1xuXG4gIGlmIChob3ZlcmVkR3JhcGggJiYgIWhvdmVyR3JhcGgpIHtcbiAgICBpZiAoaG92ZXJlZEdyYXBoTW91c2VFbnRlcklzRnVuKSBob3ZlcmVkR3JhcGgubW91c2VFbnRlcihlLCBob3ZlcmVkR3JhcGgpO1xuICAgIGhvdmVyZWRHcmFwaC5zdGF0dXMgPSAnaG92ZXInO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChob3ZlcmVkR3JhcGggJiYgaG92ZXJHcmFwaCAmJiBob3ZlcmVkR3JhcGggIT09IGhvdmVyR3JhcGgpIHtcbiAgICBpZiAoaG92ZXJHcmFwaE1vdXNlT3V0ZXJJc0Z1bikgaG92ZXJHcmFwaC5tb3VzZU91dGVyKGUsIGhvdmVyR3JhcGgpO1xuICAgIGhvdmVyR3JhcGguc3RhdHVzID0gJ3N0YXRpYyc7XG4gICAgaWYgKGhvdmVyZWRHcmFwaE1vdXNlRW50ZXJJc0Z1bikgaG92ZXJlZEdyYXBoLm1vdXNlRW50ZXIoZSwgaG92ZXJlZEdyYXBoKTtcbiAgICBob3ZlcmVkR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbiAgfVxufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBIYW5kbGVyIG9mIENSZW5kZXIgbW91c2V1cCBldmVudFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gbW91c2VVcChlKSB7XG4gIHZhciBncmFwaHMgPSB0aGlzLmdyYXBocztcbiAgdmFyIGFjdGl2ZUdyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2FjdGl2ZSc7XG4gIH0pO1xuICB2YXIgZHJhZ0dyYXBoID0gZ3JhcGhzLmZpbmQoZnVuY3Rpb24gKGdyYXBoKSB7XG4gICAgcmV0dXJuIGdyYXBoLnN0YXR1cyA9PT0gJ2RyYWcnO1xuICB9KTtcbiAgaWYgKGFjdGl2ZUdyYXBoICYmIHR5cGVvZiBhY3RpdmVHcmFwaC5jbGljayA9PT0gJ2Z1bmN0aW9uJykgYWN0aXZlR3JhcGguY2xpY2soZSwgYWN0aXZlR3JhcGgpO1xuICBncmFwaHMuZm9yRWFjaChmdW5jdGlvbiAoZ3JhcGgpIHtcbiAgICByZXR1cm4gZ3JhcGggJiYgKGdyYXBoLnN0YXR1cyA9ICdzdGF0aWMnKTtcbiAgfSk7XG4gIGlmIChhY3RpdmVHcmFwaCkgYWN0aXZlR3JhcGguc3RhdHVzID0gJ2hvdmVyJztcbiAgaWYgKGRyYWdHcmFwaCkgZHJhZ0dyYXBoLnN0YXR1cyA9ICdob3Zlcic7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uICAgICAgICAgQ2xvbmUgR3JhcGhcclxuICogQHBhcmFtIHtHcmFwaH0gZ3JhcGggVGhlIHRhcmdldCB0byBiZSBjbG9uZWRcclxuICogQHJldHVybiB7R3JhcGh9ICAgICAgQ2xvbmVkIGdyYXBoXHJcbiAqL1xuXG5cbkNSZW5kZXIucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24gKGdyYXBoKSB7XG4gIHZhciBzdHlsZSA9IGdyYXBoLnN0eWxlLmdldFN0eWxlKCk7XG5cbiAgdmFyIGNsb25lZEdyYXBoID0gX29iamVjdFNwcmVhZCh7fSwgZ3JhcGgsIHtcbiAgICBzdHlsZTogc3R5bGVcbiAgfSk7XG5cbiAgZGVsZXRlIGNsb25lZEdyYXBoLnJlbmRlcjtcbiAgY2xvbmVkR3JhcGggPSAoMCwgX3V0aWwuZGVlcENsb25lKShjbG9uZWRHcmFwaCwgdHJ1ZSk7XG4gIHJldHVybiB0aGlzLmFkZChjbG9uZWRHcmFwaCk7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX3JlZ2VuZXJhdG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvcmVnZW5lcmF0b3JcIikpO1xuXG52YXIgX2FzeW5jVG9HZW5lcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yXCIpKTtcblxudmFyIF90eXBlb2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIikpO1xuXG52YXIgX3RvQ29uc3VtYWJsZUFycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdG9Db25zdW1hYmxlQXJyYXlcIikpO1xuXG52YXIgX2NsYXNzQ2FsbENoZWNrMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2tcIikpO1xuXG52YXIgX3N0eWxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9zdHlsZS5jbGFzc1wiKSk7XG5cbnZhciBfdHJhbnNpdGlvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBqaWFtaW5naGkvdHJhbnNpdGlvblwiKSk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoXCIuLi9wbHVnaW4vdXRpbFwiKTtcblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDbGFzcyBHcmFwaFxyXG4gKiBAcGFyYW0ge09iamVjdH0gZ3JhcGggIEdyYXBoIGRlZmF1bHQgY29uZmlndXJhdGlvblxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIEdyYXBoIGNvbmZpZ1xyXG4gKiBAcmV0dXJuIHtHcmFwaH0gSW5zdGFuY2Ugb2YgR3JhcGhcclxuICovXG52YXIgR3JhcGggPSBmdW5jdGlvbiBHcmFwaChncmFwaCwgY29uZmlnKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgR3JhcGgpO1xuICBjb25maWcgPSAoMCwgX3V0aWwuZGVlcENsb25lKShjb25maWcsIHRydWUpO1xuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBXZWF0aGVyIHRvIHJlbmRlciBncmFwaFxyXG4gICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgKiBAZGVmYXVsdCB2aXNpYmxlID0gdHJ1ZVxyXG4gICAgICovXG4gICAgdmlzaWJsZTogdHJ1ZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZW5hYmxlIGRyYWdcclxuICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICogQGRlZmF1bHQgZHJhZyA9IGZhbHNlXHJcbiAgICAgKi9cbiAgICBkcmFnOiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZXRoZXIgdG8gZW5hYmxlIGhvdmVyXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IGhvdmVyID0gZmFsc2VcclxuICAgICAqL1xuICAgIGhvdmVyOiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYXBoIHJlbmRlcmluZyBpbmRleFxyXG4gICAgICogIEdpdmUgcHJpb3JpdHkgdG8gaW5kZXggaGlnaCBncmFwaCBpbiByZW5kZXJpbmdcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZXhhbXBsZSBpbmRleCA9IDFcclxuICAgICAqL1xuICAgIGluZGV4OiAxLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGRlbGF5IHRpbWUobXMpXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uRGVsYXkgPSAwXHJcbiAgICAgKi9cbiAgICBhbmltYXRpb25EZWxheTogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE51bWJlciBvZiBhbmltYXRpb24gZnJhbWVzXHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgYW5pbWF0aW9uRnJhbWUgPSAzMFxyXG4gICAgICovXG4gICAgYW5pbWF0aW9uRnJhbWU6IDMwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQW5pbWF0aW9uIGR5bmFtaWMgY3VydmUgKFN1cHBvcnRlZCBieSB0cmFuc2l0aW9uKVxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvbkN1cnZlID0gJ2xpbmVhcidcclxuICAgICAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9qaWFtaW5nNzQzL1RyYW5zaXRpb25cclxuICAgICAqL1xuICAgIGFuaW1hdGlvbkN1cnZlOiAnbGluZWFyJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdlYXRoZXIgdG8gcGF1c2UgZ3JhcGggYW5pbWF0aW9uXHJcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cclxuICAgICAqIEBkZWZhdWx0IGFuaW1hdGlvblBhdXNlID0gZmFsc2VcclxuICAgICAqL1xuICAgIGFuaW1hdGlvblBhdXNlOiBmYWxzZSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJlY3Rhbmd1bGFyIGhvdmVyIGRldGVjdGlvbiB6b25lXHJcbiAgICAgKiAgVXNlIHRoaXMgbWV0aG9kIGZvciBob3ZlciBkZXRlY3Rpb24gZmlyc3RcclxuICAgICAqIEB0eXBlIHtOdWxsfEFycmF5fVxyXG4gICAgICogQGRlZmF1bHQgaG92ZXJSZWN0ID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgaG92ZXJSZWN0ID0gWzAsIDAsIDEwMCwgMTAwXSAvLyBbUmVjdCBzdGFydCB4LCB5LCBSZWN0IHdpZHRoLCBoZWlnaHRdXHJcbiAgICAgKi9cbiAgICBob3ZlclJlY3Q6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBNb3VzZSBlbnRlciBldmVudCBoYW5kbGVyXHJcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb258TnVsbH1cclxuICAgICAqIEBkZWZhdWx0IG1vdXNlRW50ZXIgPSBudWxsXHJcbiAgICAgKi9cbiAgICBtb3VzZUVudGVyOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTW91c2Ugb3V0ZXIgZXZlbnQgaGFuZGxlclxyXG4gICAgICogQHR5cGUge0Z1bmN0aW9ufE51bGx9XHJcbiAgICAgKiBAZGVmYXVsdCBtb3VzZU91dGVyID0gbnVsbFxyXG4gICAgICovXG4gICAgbW91c2VPdXRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIE1vdXNlIGNsaWNrIGV2ZW50IGhhbmRsZXJcclxuICAgICAqIEB0eXBlIHtGdW5jdGlvbnxOdWxsfVxyXG4gICAgICogQGRlZmF1bHQgY2xpY2sgPSBudWxsXHJcbiAgICAgKi9cbiAgICBjbGljazogbnVsbFxuICB9O1xuICB2YXIgY29uZmlnQWJsZU5vdCA9IHtcbiAgICBzdGF0dXM6ICdzdGF0aWMnLFxuICAgIGFuaW1hdGlvblJvb3Q6IFtdLFxuICAgIGFuaW1hdGlvbktleXM6IFtdLFxuICAgIGFuaW1hdGlvbkZyYW1lU3RhdGU6IFtdLFxuICAgIGNhY2hlOiB7fVxuICB9O1xuICBpZiAoIWNvbmZpZy5zaGFwZSkgY29uZmlnLnNoYXBlID0ge307XG4gIGlmICghY29uZmlnLnN0eWxlKSBjb25maWcuc3R5bGUgPSB7fTtcbiAgdmFyIHNoYXBlID0gT2JqZWN0LmFzc2lnbih7fSwgZ3JhcGguc2hhcGUsIGNvbmZpZy5zaGFwZSk7XG4gIE9iamVjdC5hc3NpZ24oZGVmYXVsdENvbmZpZywgY29uZmlnLCBjb25maWdBYmxlTm90KTtcbiAgT2JqZWN0LmFzc2lnbih0aGlzLCBncmFwaCwgZGVmYXVsdENvbmZpZyk7XG4gIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgdGhpcy5zdHlsZSA9IG5ldyBfc3R5bGVbXCJkZWZhdWx0XCJdKGNvbmZpZy5zdHlsZSk7XG4gIHRoaXMuYWRkZWRQcm9jZXNzb3IoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFByb2Nlc3NvciBvZiBhZGRlZFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBHcmFwaDtcblxuR3JhcGgucHJvdG90eXBlLmFkZGVkUHJvY2Vzc29yID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIHRoaXMuc2V0R3JhcGhDZW50ZXIgPT09ICdmdW5jdGlvbicpIHRoaXMuc2V0R3JhcGhDZW50ZXIobnVsbCwgdGhpcyk7IC8vIFRoZSBsaWZlIGN5Y2xlICdhZGRlZFwiXG5cbiAgaWYgKHR5cGVvZiB0aGlzLmFkZGVkID09PSAnZnVuY3Rpb24nKSB0aGlzLmFkZGVkKHRoaXMpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGRyYXdcclxuICogQHBhcmFtIHtDUmVuZGVyfSByZW5kZXIgSW5zdGFuY2Ugb2YgQ1JlbmRlclxyXG4gKiBAcGFyYW0ge0dyYXBofSBncmFwaCAgICBJbnN0YW5jZSBvZiBHcmFwaFxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmRyYXdQcm9jZXNzb3IgPSBmdW5jdGlvbiAocmVuZGVyLCBncmFwaCkge1xuICB2YXIgY3R4ID0gcmVuZGVyLmN0eDtcbiAgZ3JhcGguc3R5bGUuaW5pdFN0eWxlKGN0eCk7XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVEcmF3ID09PSAnZnVuY3Rpb24nKSB0aGlzLmJlZm9yZURyYXcodGhpcywgcmVuZGVyKTtcbiAgZ3JhcGguZHJhdyhyZW5kZXIsIGdyYXBoKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmRyYXdlZCA9PT0gJ2Z1bmN0aW9uJykgdGhpcy5kcmF3ZWQodGhpcywgcmVuZGVyKTtcbiAgZ3JhcGguc3R5bGUucmVzdG9yZVRyYW5zZm9ybShjdHgpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGhvdmVyIGNoZWNrXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvc2l0aW9uIE1vdXNlIFBvc2l0aW9uXHJcbiAqIEBwYXJhbSB7R3JhcGh9IGdyYXBoICAgIEluc3RhbmNlIG9mIEdyYXBoXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBob3ZlciBjaGVja1xyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuaG92ZXJDaGVja1Byb2Nlc3NvciA9IGZ1bmN0aW9uIChwb3NpdGlvbiwgX3JlZikge1xuICB2YXIgaG92ZXJSZWN0ID0gX3JlZi5ob3ZlclJlY3QsXG4gICAgICBzdHlsZSA9IF9yZWYuc3R5bGUsXG4gICAgICBob3ZlckNoZWNrID0gX3JlZi5ob3ZlckNoZWNrO1xuICB2YXIgZ3JhcGhDZW50ZXIgPSBzdHlsZS5ncmFwaENlbnRlcixcbiAgICAgIHJvdGF0ZSA9IHN0eWxlLnJvdGF0ZSxcbiAgICAgIHNjYWxlID0gc3R5bGUuc2NhbGUsXG4gICAgICB0cmFuc2xhdGUgPSBzdHlsZS50cmFuc2xhdGU7XG5cbiAgaWYgKGdyYXBoQ2VudGVyKSB7XG4gICAgaWYgKHJvdGF0ZSkgcG9zaXRpb24gPSAoMCwgX3V0aWwuZ2V0Um90YXRlUG9pbnRQb3MpKC1yb3RhdGUsIHBvc2l0aW9uLCBncmFwaENlbnRlcik7XG4gICAgaWYgKHNjYWxlKSBwb3NpdGlvbiA9ICgwLCBfdXRpbC5nZXRTY2FsZVBvaW50UG9zKShzY2FsZS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiAxIC8gcztcbiAgICB9KSwgcG9zaXRpb24sIGdyYXBoQ2VudGVyKTtcbiAgICBpZiAodHJhbnNsYXRlKSBwb3NpdGlvbiA9ICgwLCBfdXRpbC5nZXRUcmFuc2xhdGVQb2ludFBvcykodHJhbnNsYXRlLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYgKiAtMTtcbiAgICB9KSwgcG9zaXRpb24pO1xuICB9XG5cbiAgaWYgKGhvdmVyUmVjdCkgcmV0dXJuIF91dGlsLmNoZWNrUG9pbnRJc0luUmVjdC5hcHBseSh2b2lkIDAsIFtwb3NpdGlvbl0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaG92ZXJSZWN0KSkpO1xuICByZXR1cm4gaG92ZXJDaGVjayhwb3NpdGlvbiwgdGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBQcm9jZXNzb3Igb2YgbW92ZVxyXG4gKiBAcGFyYW0ge0V2ZW50fSBlIE1vdXNlIG1vdmVtZW50IGV2ZW50XHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUubW92ZVByb2Nlc3NvciA9IGZ1bmN0aW9uIChlKSB7XG4gIHRoaXMubW92ZShlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmJlZm9yZU1vdmUgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlTW92ZShlLCB0aGlzKTtcbiAgaWYgKHR5cGVvZiB0aGlzLnNldEdyYXBoQ2VudGVyID09PSAnZnVuY3Rpb24nKSB0aGlzLnNldEdyYXBoQ2VudGVyKGUsIHRoaXMpO1xuICBpZiAodHlwZW9mIHRoaXMubW92ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMubW92ZWQoZSwgdGhpcyk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBVcGRhdGUgZ3JhcGggc3RhdGVcclxuICogQHBhcmFtIHtTdHJpbmd9IGF0dHJOYW1lIFVwZGF0ZWQgYXR0cmlidXRlIG5hbWVcclxuICogQHBhcmFtIHtBbnl9IGNoYW5nZSAgICAgIFVwZGF0ZWQgdmFsdWVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24gKGF0dHJOYW1lKSB7XG4gIHZhciBjaGFuZ2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgaWYgKCFhdHRyTmFtZSB8fCBjaGFuZ2UgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgaXNPYmplY3QgPSAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKSh0aGlzW2F0dHJOYW1lXSkgPT09ICdvYmplY3QnO1xuICBpZiAoaXNPYmplY3QpIGNoYW5nZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNoYW5nZSwgdHJ1ZSk7XG4gIHZhciByZW5kZXIgPSB0aGlzLnJlbmRlcjtcblxuICBpZiAoYXR0ck5hbWUgPT09ICdzdHlsZScpIHtcbiAgICB0aGlzLnN0eWxlLnVwZGF0ZShjaGFuZ2UpO1xuICB9IGVsc2UgaWYgKGlzT2JqZWN0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzW2F0dHJOYW1lXSwgY2hhbmdlKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzW2F0dHJOYW1lXSA9IGNoYW5nZTtcbiAgfVxuXG4gIGlmIChhdHRyTmFtZSA9PT0gJ2luZGV4JykgcmVuZGVyLnNvcnRHcmFwaHNCeUluZGV4KCk7XG4gIHJlbmRlci5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFVwZGF0ZSBncmFwaGljcyBzdGF0ZSAod2l0aCBhbmltYXRpb24pXHJcbiAqICBPbmx5IHNoYXBlIGFuZCBzdHlsZSBhdHRyaWJ1dGVzIGFyZSBzdXBwb3J0ZWRcclxuICogQHBhcmFtIHtTdHJpbmd9IGF0dHJOYW1lIFVwZGF0ZWQgYXR0cmlidXRlIG5hbWVcclxuICogQHBhcmFtIHtBbnl9IGNoYW5nZSAgICAgIFVwZGF0ZWQgdmFsdWVcclxuICogQHBhcmFtIHtCb29sZWFufSB3YWl0ICAgIFdoZXRoZXIgdG8gc3RvcmUgdGhlIGFuaW1hdGlvbiB3YWl0aW5nXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdGhlIG5leHQgYW5pbWF0aW9uIHJlcXVlc3RcclxuICogQHJldHVybiB7UHJvbWlzZX0gQW5pbWF0aW9uIFByb21pc2VcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmFuaW1hdGlvbiA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIHZhciBfcmVmMiA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjJbXCJkZWZhdWx0XCJdKShcbiAgLyojX19QVVJFX18qL1xuICBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTIoYXR0ck5hbWUsIGNoYW5nZSkge1xuICAgIHZhciB3YWl0LFxuICAgICAgICBjaGFuZ2VSb290LFxuICAgICAgICBjaGFuZ2VLZXlzLFxuICAgICAgICBiZWZvcmVTdGF0ZSxcbiAgICAgICAgYW5pbWF0aW9uRnJhbWUsXG4gICAgICAgIGFuaW1hdGlvbkN1cnZlLFxuICAgICAgICBhbmltYXRpb25EZWxheSxcbiAgICAgICAgYW5pbWF0aW9uRnJhbWVTdGF0ZSxcbiAgICAgICAgcmVuZGVyLFxuICAgICAgICBfYXJnczIgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ud3JhcChmdW5jdGlvbiBfY2FsbGVlMiQoX2NvbnRleHQyKSB7XG4gICAgICB3aGlsZSAoMSkge1xuICAgICAgICBzd2l0Y2ggKF9jb250ZXh0Mi5wcmV2ID0gX2NvbnRleHQyLm5leHQpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICB3YWl0ID0gX2FyZ3MyLmxlbmd0aCA+IDIgJiYgX2FyZ3MyWzJdICE9PSB1bmRlZmluZWQgPyBfYXJnczJbMl0gOiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCEoYXR0ck5hbWUgIT09ICdzaGFwZScgJiYgYXR0ck5hbWUgIT09ICdzdHlsZScpKSB7XG4gICAgICAgICAgICAgIF9jb250ZXh0Mi5uZXh0ID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ09ubHkgc3VwcG9ydGVkIHNoYXBlIGFuZCBzdHlsZSBhbmltYXRpb24hJyk7XG4gICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdChcInJldHVyblwiKTtcblxuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGNoYW5nZSA9ICgwLCBfdXRpbC5kZWVwQ2xvbmUpKGNoYW5nZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoYXR0ck5hbWUgPT09ICdzdHlsZScpIHRoaXMuc3R5bGUuY29sb3JQcm9jZXNzb3IoY2hhbmdlKTtcbiAgICAgICAgICAgIGNoYW5nZVJvb3QgPSB0aGlzW2F0dHJOYW1lXTtcbiAgICAgICAgICAgIGNoYW5nZUtleXMgPSBPYmplY3Qua2V5cyhjaGFuZ2UpO1xuICAgICAgICAgICAgYmVmb3JlU3RhdGUgPSB7fTtcbiAgICAgICAgICAgIGNoYW5nZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgIHJldHVybiBiZWZvcmVTdGF0ZVtrZXldID0gY2hhbmdlUm9vdFtrZXldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmltYXRpb25GcmFtZSA9IHRoaXMuYW5pbWF0aW9uRnJhbWUsIGFuaW1hdGlvbkN1cnZlID0gdGhpcy5hbmltYXRpb25DdXJ2ZSwgYW5pbWF0aW9uRGVsYXkgPSB0aGlzLmFuaW1hdGlvbkRlbGF5O1xuICAgICAgICAgICAgYW5pbWF0aW9uRnJhbWVTdGF0ZSA9ICgwLCBfdHJhbnNpdGlvbltcImRlZmF1bHRcIl0pKGFuaW1hdGlvbkN1cnZlLCBiZWZvcmVTdGF0ZSwgY2hhbmdlLCBhbmltYXRpb25GcmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvblJvb3QucHVzaChjaGFuZ2VSb290KTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uS2V5cy5wdXNoKGNoYW5nZUtleXMpO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlLnB1c2goYW5pbWF0aW9uRnJhbWVTdGF0ZSk7XG5cbiAgICAgICAgICAgIGlmICghd2FpdCkge1xuICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDE3O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5hYnJ1cHQoXCJyZXR1cm5cIik7XG5cbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgaWYgKCEoYW5pbWF0aW9uRGVsYXkgPiAwKSkge1xuICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDIwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyMDtcbiAgICAgICAgICAgIHJldHVybiBkZWxheShhbmltYXRpb25EZWxheSk7XG5cbiAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgcmVuZGVyID0gdGhpcy5yZW5kZXI7XG4gICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdChcInJldHVyblwiLCBuZXcgUHJvbWlzZShcbiAgICAgICAgICAgIC8qI19fUFVSRV9fKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyIF9yZWYzID0gKDAsIF9hc3luY1RvR2VuZXJhdG9yMltcImRlZmF1bHRcIl0pKFxuICAgICAgICAgICAgICAvKiNfX1BVUkVfXyovXG4gICAgICAgICAgICAgIF9yZWdlbmVyYXRvcltcImRlZmF1bHRcIl0ubWFyayhmdW5jdGlvbiBfY2FsbGVlKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUkKF9jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKF9jb250ZXh0LnByZXYgPSBfY29udGV4dC5uZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVuZGVyLmxhdW5jaEFuaW1hdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29udGV4dC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBfY2FsbGVlKTtcbiAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoX3gzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWYzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KCkpKTtcblxuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBfY2FsbGVlMiwgdGhpcyk7XG4gIH0pKTtcblxuICByZXR1cm4gZnVuY3Rpb24gKF94LCBfeDIpIHtcbiAgICByZXR1cm4gX3JlZjIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn0oKTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRXh0cmFjdCB0aGUgbmV4dCBmcmFtZSBvZiBkYXRhIGZyb20gdGhlIGFuaW1hdGlvbiBxdWV1ZVxyXG4gKiAgICAgICAgICAgICAgYW5kIHVwZGF0ZSB0aGUgZ3JhcGggc3RhdGVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbkdyYXBoLnByb3RvdHlwZS50dXJuTmV4dEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24gKHRpbWVTdGFtcCkge1xuICB2YXIgYW5pbWF0aW9uRGVsYXkgPSB0aGlzLmFuaW1hdGlvbkRlbGF5LFxuICAgICAgYW5pbWF0aW9uUm9vdCA9IHRoaXMuYW5pbWF0aW9uUm9vdCxcbiAgICAgIGFuaW1hdGlvbktleXMgPSB0aGlzLmFuaW1hdGlvbktleXMsXG4gICAgICBhbmltYXRpb25GcmFtZVN0YXRlID0gdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlLFxuICAgICAgYW5pbWF0aW9uUGF1c2UgPSB0aGlzLmFuaW1hdGlvblBhdXNlO1xuICBpZiAoYW5pbWF0aW9uUGF1c2UpIHJldHVybjtcbiAgaWYgKERhdGUubm93KCkgLSB0aW1lU3RhbXAgPCBhbmltYXRpb25EZWxheSkgcmV0dXJuO1xuICBhbmltYXRpb25Sb290LmZvckVhY2goZnVuY3Rpb24gKHJvb3QsIGkpIHtcbiAgICBhbmltYXRpb25LZXlzW2ldLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgcm9vdFtrZXldID0gYW5pbWF0aW9uRnJhbWVTdGF0ZVtpXVswXVtrZXldO1xuICAgIH0pO1xuICB9KTtcbiAgYW5pbWF0aW9uRnJhbWVTdGF0ZS5mb3JFYWNoKGZ1bmN0aW9uIChzdGF0ZUl0ZW0sIGkpIHtcbiAgICBzdGF0ZUl0ZW0uc2hpZnQoKTtcbiAgICB2YXIgbm9GcmFtZSA9IHN0YXRlSXRlbS5sZW5ndGggPT09IDA7XG4gICAgaWYgKG5vRnJhbWUpIGFuaW1hdGlvblJvb3RbaV0gPSBudWxsO1xuICAgIGlmIChub0ZyYW1lKSBhbmltYXRpb25LZXlzW2ldID0gbnVsbDtcbiAgfSk7XG4gIHRoaXMuYW5pbWF0aW9uRnJhbWVTdGF0ZSA9IGFuaW1hdGlvbkZyYW1lU3RhdGUuZmlsdGVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZS5sZW5ndGg7XG4gIH0pO1xuICB0aGlzLmFuaW1hdGlvblJvb3QgPSBhbmltYXRpb25Sb290LmZpbHRlcihmdW5jdGlvbiAocm9vdCkge1xuICAgIHJldHVybiByb290O1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25LZXlzID0gYW5pbWF0aW9uS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleXMpIHtcbiAgICByZXR1cm4ga2V5cztcbiAgfSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTa2lwIHRvIHRoZSBsYXN0IGZyYW1lIG9mIGFuaW1hdGlvblxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLmFuaW1hdGlvbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFuaW1hdGlvbkZyYW1lU3RhdGUgPSB0aGlzLmFuaW1hdGlvbkZyYW1lU3RhdGUsXG4gICAgICBhbmltYXRpb25LZXlzID0gdGhpcy5hbmltYXRpb25LZXlzLFxuICAgICAgYW5pbWF0aW9uUm9vdCA9IHRoaXMuYW5pbWF0aW9uUm9vdCxcbiAgICAgIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuICBhbmltYXRpb25Sb290LmZvckVhY2goZnVuY3Rpb24gKHJvb3QsIGkpIHtcbiAgICB2YXIgY3VycmVudEtleXMgPSBhbmltYXRpb25LZXlzW2ldO1xuICAgIHZhciBsYXN0U3RhdGUgPSBhbmltYXRpb25GcmFtZVN0YXRlW2ldLnBvcCgpO1xuICAgIGN1cnJlbnRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHJvb3Rba2V5XSA9IGxhc3RTdGF0ZVtrZXldO1xuICAgIH0pO1xuICB9KTtcbiAgdGhpcy5hbmltYXRpb25GcmFtZVN0YXRlID0gW107XG4gIHRoaXMuYW5pbWF0aW9uS2V5cyA9IFtdO1xuICB0aGlzLmFuaW1hdGlvblJvb3QgPSBbXTtcbiAgcmV0dXJuIHJlbmRlci5kcmF3QWxsR3JhcGgoKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFBhdXNlIGFuaW1hdGlvbiBiZWhhdmlvclxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuR3JhcGgucHJvdG90eXBlLnBhdXNlQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmF0dHIoJ2FuaW1hdGlvblBhdXNlJywgdHJ1ZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBUcnkgYW5pbWF0aW9uIGJlaGF2aW9yXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUucGxheUFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlbmRlciA9IHRoaXMucmVuZGVyO1xuICB0aGlzLmF0dHIoJ2FuaW1hdGlvblBhdXNlJywgZmFsc2UpO1xuICByZXR1cm4gbmV3IFByb21pc2UoXG4gIC8qI19fUFVSRV9fKi9cbiAgZnVuY3Rpb24gKCkge1xuICAgIHZhciBfcmVmNCA9ICgwLCBfYXN5bmNUb0dlbmVyYXRvcjJbXCJkZWZhdWx0XCJdKShcbiAgICAvKiNfX1BVUkVfXyovXG4gICAgX3JlZ2VuZXJhdG9yW1wiZGVmYXVsdFwiXS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUzKHJlc29sdmUpIHtcbiAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JbXCJkZWZhdWx0XCJdLndyYXAoZnVuY3Rpb24gX2NhbGxlZTMkKF9jb250ZXh0Mykge1xuICAgICAgICB3aGlsZSAoMSkge1xuICAgICAgICAgIHN3aXRjaCAoX2NvbnRleHQzLnByZXYgPSBfY29udGV4dDMubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiByZW5kZXIubGF1bmNoQW5pbWF0aW9uKCk7XG5cbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDMuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgX2NhbGxlZTMpO1xuICAgIH0pKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoX3g0KSB7XG4gICAgICByZXR1cm4gX3JlZjQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9KCkpO1xufTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUHJvY2Vzc29yIG9mIGRlbGV0ZVxyXG4gKiBAcGFyYW0ge0NSZW5kZXJ9IHJlbmRlciBJbnN0YW5jZSBvZiBDUmVuZGVyXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5HcmFwaC5wcm90b3R5cGUuZGVsUHJvY2Vzc29yID0gZnVuY3Rpb24gKHJlbmRlcikge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHZhciBncmFwaHMgPSByZW5kZXIuZ3JhcGhzO1xuICB2YXIgaW5kZXggPSBncmFwaHMuZmluZEluZGV4KGZ1bmN0aW9uIChncmFwaCkge1xuICAgIHJldHVybiBncmFwaCA9PT0gX3RoaXM7XG4gIH0pO1xuICBpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG4gIGlmICh0eXBlb2YgdGhpcy5iZWZvcmVEZWxldGUgPT09ICdmdW5jdGlvbicpIHRoaXMuYmVmb3JlRGVsZXRlKHRoaXMpO1xuICBncmFwaHMuc3BsaWNlKGluZGV4LCAxLCBudWxsKTtcbiAgaWYgKHR5cGVvZiB0aGlzLmRlbGV0ZWQgPT09ICdmdW5jdGlvbicpIHRoaXMuZGVsZXRlZCh0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFJldHVybiBhIHRpbWVkIHJlbGVhc2UgUHJvbWlzZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZSBSZWxlYXNlIHRpbWVcclxuICogQHJldHVybiB7UHJvbWlzZX0gQSB0aW1lZCByZWxlYXNlIFByb21pc2VcclxuICovXG5cblxuZnVuY3Rpb24gZGVsYXkodGltZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICBzZXRUaW1lb3V0KHJlc29sdmUsIHRpbWUpO1xuICB9KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjazIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2NsYXNzQ2FsbENoZWNrXCIpKTtcblxudmFyIF9jb2xvciA9IHJlcXVpcmUoXCJAamlhbWluZ2hpL2NvbG9yXCIpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2xhc3MgU3R5bGVcclxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlICBTdHlsZSBjb25maWd1cmF0aW9uXHJcbiAqIEByZXR1cm4ge1N0eWxlfSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKi9cbnZhciBTdHlsZSA9IGZ1bmN0aW9uIFN0eWxlKHN0eWxlKSB7XG4gICgwLCBfY2xhc3NDYWxsQ2hlY2syW1wiZGVmYXVsdFwiXSkodGhpcywgU3R5bGUpO1xuICB0aGlzLmNvbG9yUHJvY2Vzc29yKHN0eWxlKTtcbiAgdmFyIGRlZmF1bHRTdHlsZSA9IHtcbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBSZ2JhIHZhbHVlIG9mIGdyYXBoIGZpbGwgY29sb3JcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IGZpbGwgPSBbMCwgMCwgMCwgMV1cclxuICAgICAqL1xuICAgIGZpbGw6IFswLCAwLCAwLCAxXSxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFJnYmEgdmFsdWUgb2YgZ3JhcGggc3Ryb2tlIGNvbG9yXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBzdHJva2UgPSBbMCwgMCwgMCwgMV1cclxuICAgICAqL1xuICAgIHN0cm9rZTogWzAsIDAsIDAsIDBdLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gT3BhY2l0eSBvZiBncmFwaFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IG9wYWNpdHkgPSAxXHJcbiAgICAgKi9cbiAgICBvcGFjaXR5OiAxLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZUNhcCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBsaW5lQ2FwID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgbGluZUNhcCA9ICdidXR0J3wncm91bmQnfCdzcXVhcmUnXHJcbiAgICAgKi9cbiAgICBsaW5lQ2FwOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gTGluZWpvaW4gb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgbGluZUpvaW4gPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBsaW5lSm9pbiA9ICdyb3VuZCd8J2JldmVsJ3wnbWl0ZXInXHJcbiAgICAgKi9cbiAgICBsaW5lSm9pbjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVEYXNoIG9mIEN0eFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgbGluZURhc2ggPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBsaW5lRGFzaCA9IFsxMCwgMTBdXHJcbiAgICAgKi9cbiAgICBsaW5lRGFzaDogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIExpbmVEYXNoT2Zmc2V0IG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IGxpbmVEYXNoT2Zmc2V0ID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgbGluZURhc2hPZmZzZXQgPSAxMFxyXG4gICAgICovXG4gICAgbGluZURhc2hPZmZzZXQ6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBTaGFkb3dCbHVyIG9mIEN0eFxyXG4gICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAqIEBkZWZhdWx0IHNoYWRvd0JsdXIgPSAwXHJcbiAgICAgKi9cbiAgICBzaGFkb3dCbHVyOiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gUmdiYSB2YWx1ZSBvZiBncmFwaCBzaGFkb3cgY29sb3JcclxuICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAqIEBkZWZhdWx0IHNoYWRvd0NvbG9yID0gWzAsIDAsIDAsIDBdXHJcbiAgICAgKi9cbiAgICBzaGFkb3dDb2xvcjogWzAsIDAsIDAsIDBdLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gU2hhZG93T2Zmc2V0WCBvZiBDdHhcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBzaGFkb3dPZmZzZXRYID0gMFxyXG4gICAgICovXG4gICAgc2hhZG93T2Zmc2V0WDogMCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFNoYWRvd09mZnNldFkgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgc2hhZG93T2Zmc2V0WSA9IDBcclxuICAgICAqL1xuICAgIHNoYWRvd09mZnNldFk6IDAsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBMaW5lV2lkdGggb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgbGluZVdpZHRoID0gMFxyXG4gICAgICovXG4gICAgbGluZVdpZHRoOiAwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQ2VudGVyIHBvaW50IG9mIHRoZSBncmFwaFxyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZ3JhcGhDZW50ZXIgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBncmFwaENlbnRlciA9IFsxMCwgMTBdXHJcbiAgICAgKi9cbiAgICBncmFwaENlbnRlcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYXBoIHNjYWxlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBzY2FsZSA9IG51bGxcclxuICAgICAqIEBleGFtcGxlIHNjYWxlID0gWzEuNSwgMS41XVxyXG4gICAgICovXG4gICAgc2NhbGU6IG51bGwsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBHcmFwaCByb3RhdGlvbiBkZWdyZWVcclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCByb3RhdGUgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSByb3RhdGUgPSAxMFxyXG4gICAgICovXG4gICAgcm90YXRlOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gR3JhcGggdHJhbnNsYXRlIGRpc3RhbmNlXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCB0cmFuc2xhdGUgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSB0cmFuc2xhdGUgPSBbMTAsIDEwXVxyXG4gICAgICovXG4gICAgdHJhbnNsYXRlOiBudWxsLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQ3Vyc29yIHN0YXR1cyB3aGVuIGhvdmVyXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgaG92ZXJDdXJzb3IgPSAncG9pbnRlcidcclxuICAgICAqIEBleGFtcGxlIGhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnfCdwb2ludGVyJ3wnYXV0byd8J2Nyb3NzaGFpcid8J21vdmUnfCd3YWl0J3wuLi5cclxuICAgICAqL1xuICAgIGhvdmVyQ3Vyc29yOiAncG9pbnRlcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHN0eWxlIG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGZvbnRTdHlsZSA9ICdub3JtYWwnXHJcbiAgICAgKiBAZXhhbXBsZSBmb250U3R5bGUgPSAnbm9ybWFsJ3wnaXRhbGljJ3wnb2JsaXF1ZSdcclxuICAgICAqL1xuICAgIGZvbnRTdHlsZTogJ25vcm1hbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHZhcmllbnQgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZm9udFZhcmllbnQgPSAnbm9ybWFsJ1xyXG4gICAgICogQGV4YW1wbGUgZm9udFZhcmllbnQgPSAnbm9ybWFsJ3wnc21hbGwtY2FwcydcclxuICAgICAqL1xuICAgIGZvbnRWYXJpZW50OiAnbm9ybWFsJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEZvbnQgd2VpZ2h0IG9mIEN0eFxyXG4gICAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XHJcbiAgICAgKiBAZGVmYXVsdCBmb250V2VpZ2h0ID0gJ25vcm1hbCdcclxuICAgICAqIEBleGFtcGxlIGZvbnRXZWlnaHQgPSAnbm9ybWFsJ3wnYm9sZCd8J2JvbGRlcid8J2xpZ2h0ZXInfE51bWJlclxyXG4gICAgICovXG4gICAgZm9udFdlaWdodDogJ25vcm1hbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBGb250IHNpemUgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxyXG4gICAgICogQGRlZmF1bHQgZm9udFNpemUgPSAxMFxyXG4gICAgICovXG4gICAgZm9udFNpemU6IDEwLFxuXG4gICAgLyoqXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gRm9udCBmYW1pbHkgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZm9udEZhbWlseSA9ICdBcmlhbCdcclxuICAgICAqL1xuICAgIGZvbnRGYW1pbHk6ICdBcmlhbCcsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBUZXh0QWxpZ24gb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgdGV4dEFsaWduID0gJ2NlbnRlcidcclxuICAgICAqIEBleGFtcGxlIHRleHRBbGlnbiA9ICdzdGFydCd8J2VuZCd8J2xlZnQnfCdyaWdodCd8J2NlbnRlcidcclxuICAgICAqL1xuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBUZXh0QmFzZWxpbmUgb2YgQ3R4XHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgdGV4dEJhc2VsaW5lID0gJ21pZGRsZSdcclxuICAgICAqIEBleGFtcGxlIHRleHRCYXNlbGluZSA9ICd0b3AnfCdib3R0b20nfCdtaWRkbGUnfCdhbHBoYWJldGljJ3wnaGFuZ2luZydcclxuICAgICAqL1xuICAgIHRleHRCYXNlbGluZTogJ21pZGRsZScsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBUaGUgY29sb3IgdXNlZCB0byBjcmVhdGUgdGhlIGdyYWRpZW50XHJcbiAgICAgKiBAdHlwZSB7QXJyYXl9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudENvbG9yID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRDb2xvciA9IFsnIzAwMCcsICcjMTExJywgJyMyMjInXVxyXG4gICAgICovXG4gICAgZ3JhZGllbnRDb2xvcjogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IHR5cGVcclxuICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgKiBAZGVmYXVsdCBncmFkaWVudFR5cGUgPSAnbGluZWFyJ1xyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRUeXBlID0gJ2xpbmVhcicgfCAncmFkaWFsJ1xyXG4gICAgICovXG4gICAgZ3JhZGllbnRUeXBlOiAnbGluZWFyJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IHBhcmFtc1xyXG4gICAgICogQHR5cGUge0FycmF5fVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRQYXJhbXMgPSBudWxsXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFBhcmFtcyA9IFt4MCwgeTAsIHgxLCB5MV0gKExpbmVhciBHcmFkaWVudClcclxuICAgICAqIEBleGFtcGxlIGdyYWRpZW50UGFyYW1zID0gW3gwLCB5MCwgcjAsIHgxLCB5MSwgcjFdIChSYWRpYWwgR3JhZGllbnQpXHJcbiAgICAgKi9cbiAgICBncmFkaWVudFBhcmFtczogbnVsbCxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIFdoZW4gdG8gdXNlIGdyYWRpZW50c1xyXG4gICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAqIEBkZWZhdWx0IGdyYWRpZW50V2l0aCA9ICdzdHJva2UnXHJcbiAgICAgKiBAZXhhbXBsZSBncmFkaWVudFdpdGggPSAnc3Ryb2tlJyB8ICdmaWxsJ1xyXG4gICAgICovXG4gICAgZ3JhZGllbnRXaXRoOiAnc3Ryb2tlJyxcblxuICAgIC8qKlxyXG4gICAgICogQGRlc2NyaXB0aW9uIEdyYWRpZW50IGNvbG9yIHN0b3BzXHJcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICogQGRlZmF1bHQgZ3JhZGllbnRTdG9wcyA9ICdhdXRvJ1xyXG4gICAgICogQGV4YW1wbGUgZ3JhZGllbnRTdG9wcyA9ICdhdXRvJyB8IFswLCAuMiwgLjMsIDFdXHJcbiAgICAgKi9cbiAgICBncmFkaWVudFN0b3BzOiAnYXV0bycsXG5cbiAgICAvKipcclxuICAgICAqIEBkZXNjcmlwdGlvbiBFeHRlbmRlZCBjb2xvciB0aGF0IHN1cHBvcnRzIGFuaW1hdGlvbiB0cmFuc2l0aW9uXHJcbiAgICAgKiBAdHlwZSB7QXJyYXl8T2JqZWN0fVxyXG4gICAgICogQGRlZmF1bHQgY29sb3JzID0gbnVsbFxyXG4gICAgICogQGV4YW1wbGUgY29sb3JzID0gWycjMDAwJywgJyMxMTEnLCAnIzIyMicsICdyZWQnIF1cclxuICAgICAqIEBleGFtcGxlIGNvbG9ycyA9IHsgYTogJyMwMDAnLCBiOiAnIzExMScgfVxyXG4gICAgICovXG4gICAgY29sb3JzOiBudWxsXG4gIH07XG4gIE9iamVjdC5hc3NpZ24odGhpcywgZGVmYXVsdFN0eWxlLCBzdHlsZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTZXQgY29sb3JzIHRvIHJnYmEgdmFsdWVcclxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlIHN0eWxlIGNvbmZpZ1xyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJldmVyc2UgV2hldGhlciB0byBwZXJmb3JtIHJldmVyc2Ugb3BlcmF0aW9uXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFN0eWxlO1xuXG5TdHlsZS5wcm90b3R5cGUuY29sb3JQcm9jZXNzb3IgPSBmdW5jdGlvbiAoc3R5bGUpIHtcbiAgdmFyIHJldmVyc2UgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICB2YXIgcHJvY2Vzc29yID0gcmV2ZXJzZSA/IF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSA6IF9jb2xvci5nZXRSZ2JhVmFsdWU7XG4gIHZhciBjb2xvclByb2Nlc3NvcktleXMgPSBbJ2ZpbGwnLCAnc3Ryb2tlJywgJ3NoYWRvd0NvbG9yJ107XG4gIHZhciBhbGxLZXlzID0gT2JqZWN0LmtleXMoc3R5bGUpO1xuICB2YXIgY29sb3JLZXlzID0gYWxsS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBjb2xvclByb2Nlc3NvcktleXMuZmluZChmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIGsgPT09IGtleTtcbiAgICB9KTtcbiAgfSk7XG4gIGNvbG9yS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gc3R5bGVba2V5XSA9IHByb2Nlc3NvcihzdHlsZVtrZXldKTtcbiAgfSk7XG4gIHZhciBncmFkaWVudENvbG9yID0gc3R5bGUuZ3JhZGllbnRDb2xvcixcbiAgICAgIGNvbG9ycyA9IHN0eWxlLmNvbG9ycztcbiAgaWYgKGdyYWRpZW50Q29sb3IpIHN0eWxlLmdyYWRpZW50Q29sb3IgPSBncmFkaWVudENvbG9yLm1hcChmdW5jdGlvbiAoYykge1xuICAgIHJldHVybiBwcm9jZXNzb3IoYyk7XG4gIH0pO1xuXG4gIGlmIChjb2xvcnMpIHtcbiAgICB2YXIgY29sb3JzS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG4gICAgY29sb3JzS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBjb2xvcnNba2V5XSA9IHByb2Nlc3Nvcihjb2xvcnNba2V5XSk7XG4gICAgfSk7XG4gIH1cbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEluaXQgZ3JhcGggc3R5bGVcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLmluaXRTdHlsZSA9IGZ1bmN0aW9uIChjdHgpIHtcbiAgaW5pdFRyYW5zZm9ybShjdHgsIHRoaXMpO1xuICBpbml0R3JhcGhTdHlsZShjdHgsIHRoaXMpO1xuICBpbml0R3JhZGllbnQoY3R4LCB0aGlzKTtcbn07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEluaXQgY2FudmFzIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuZnVuY3Rpb24gaW5pdFRyYW5zZm9ybShjdHgsIHN0eWxlKSB7XG4gIGN0eC5zYXZlKCk7XG4gIHZhciBncmFwaENlbnRlciA9IHN0eWxlLmdyYXBoQ2VudGVyLFxuICAgICAgcm90YXRlID0gc3R5bGUucm90YXRlLFxuICAgICAgc2NhbGUgPSBzdHlsZS5zY2FsZSxcbiAgICAgIHRyYW5zbGF0ZSA9IHN0eWxlLnRyYW5zbGF0ZTtcbiAgaWYgKCEoZ3JhcGhDZW50ZXIgaW5zdGFuY2VvZiBBcnJheSkpIHJldHVybjtcbiAgY3R4LnRyYW5zbGF0ZS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZ3JhcGhDZW50ZXIpKTtcbiAgaWYgKHJvdGF0ZSkgY3R4LnJvdGF0ZShyb3RhdGUgKiBNYXRoLlBJIC8gMTgwKTtcbiAgaWYgKHNjYWxlIGluc3RhbmNlb2YgQXJyYXkpIGN0eC5zY2FsZS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2NhbGUpKTtcbiAgaWYgKHRyYW5zbGF0ZSkgY3R4LnRyYW5zbGF0ZS5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkodHJhbnNsYXRlKSk7XG4gIGN0eC50cmFuc2xhdGUoLWdyYXBoQ2VudGVyWzBdLCAtZ3JhcGhDZW50ZXJbMV0pO1xufVxuXG52YXIgYXV0b1NldFN0eWxlS2V5cyA9IFsnbGluZUNhcCcsICdsaW5lSm9pbicsICdsaW5lRGFzaE9mZnNldCcsICdzaGFkb3dPZmZzZXRYJywgJ3NoYWRvd09mZnNldFknLCAnbGluZVdpZHRoJywgJ3RleHRBbGlnbicsICd0ZXh0QmFzZWxpbmUnXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gU2V0IHRoZSBzdHlsZSBvZiBjYW52YXMgY3R4XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggIENvbnRleHQgb2YgY2FudmFzXHJcbiAqIEBwYXJhbSB7U3R5bGV9IHN0eWxlIEluc3RhbmNlIG9mIFN0eWxlXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuZnVuY3Rpb24gaW5pdEdyYXBoU3R5bGUoY3R4LCBzdHlsZSkge1xuICB2YXIgZmlsbCA9IHN0eWxlLmZpbGwsXG4gICAgICBzdHJva2UgPSBzdHlsZS5zdHJva2UsXG4gICAgICBzaGFkb3dDb2xvciA9IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgb3BhY2l0eSA9IHN0eWxlLm9wYWNpdHk7XG4gIGF1dG9TZXRTdHlsZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKGtleSB8fCB0eXBlb2Yga2V5ID09PSAnbnVtYmVyJykgY3R4W2tleV0gPSBzdHlsZVtrZXldO1xuICB9KTtcbiAgZmlsbCA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoZmlsbCk7XG4gIHN0cm9rZSA9ICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoc3Ryb2tlKTtcbiAgc2hhZG93Q29sb3IgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHNoYWRvd0NvbG9yKTtcbiAgZmlsbFszXSAqPSBvcGFjaXR5O1xuICBzdHJva2VbM10gKj0gb3BhY2l0eTtcbiAgc2hhZG93Q29sb3JbM10gKj0gb3BhY2l0eTtcbiAgY3R4LmZpbGxTdHlsZSA9ICgwLCBfY29sb3IuZ2V0Q29sb3JGcm9tUmdiVmFsdWUpKGZpbGwpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShzdHJva2UpO1xuICBjdHguc2hhZG93Q29sb3IgPSAoMCwgX2NvbG9yLmdldENvbG9yRnJvbVJnYlZhbHVlKShzaGFkb3dDb2xvcik7XG4gIHZhciBsaW5lRGFzaCA9IHN0eWxlLmxpbmVEYXNoLFxuICAgICAgc2hhZG93Qmx1ciA9IHN0eWxlLnNoYWRvd0JsdXI7XG5cbiAgaWYgKGxpbmVEYXNoKSB7XG4gICAgbGluZURhc2ggPSBsaW5lRGFzaC5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2ID49IDAgPyB2IDogMDtcbiAgICB9KTtcbiAgICBjdHguc2V0TGluZURhc2gobGluZURhc2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBzaGFkb3dCbHVyID09PSAnbnVtYmVyJykgY3R4LnNoYWRvd0JsdXIgPSBzaGFkb3dCbHVyID4gMCA/IHNoYWRvd0JsdXIgOiAwLjAwMTtcbiAgdmFyIGZvbnRTdHlsZSA9IHN0eWxlLmZvbnRTdHlsZSxcbiAgICAgIGZvbnRWYXJpZW50ID0gc3R5bGUuZm9udFZhcmllbnQsXG4gICAgICBmb250V2VpZ2h0ID0gc3R5bGUuZm9udFdlaWdodCxcbiAgICAgIGZvbnRTaXplID0gc3R5bGUuZm9udFNpemUsXG4gICAgICBmb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseTtcbiAgY3R4LmZvbnQgPSBmb250U3R5bGUgKyAnICcgKyBmb250VmFyaWVudCArICcgJyArIGZvbnRXZWlnaHQgKyAnICcgKyBmb250U2l6ZSArICdweCcgKyAnICcgKyBmb250RmFtaWx5O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTZXQgdGhlIGdyYWRpZW50IGNvbG9yIG9mIGNhbnZhcyBjdHhcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgQ29udGV4dCBvZiBjYW52YXNcclxuICogQHBhcmFtIHtTdHlsZX0gc3R5bGUgSW5zdGFuY2Ugb2YgU3R5bGVcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGluaXRHcmFkaWVudChjdHgsIHN0eWxlKSB7XG4gIGlmICghZ3JhZGllbnRWYWxpZGF0b3Ioc3R5bGUpKSByZXR1cm47XG4gIHZhciBncmFkaWVudENvbG9yID0gc3R5bGUuZ3JhZGllbnRDb2xvcixcbiAgICAgIGdyYWRpZW50UGFyYW1zID0gc3R5bGUuZ3JhZGllbnRQYXJhbXMsXG4gICAgICBncmFkaWVudFR5cGUgPSBzdHlsZS5ncmFkaWVudFR5cGUsXG4gICAgICBncmFkaWVudFdpdGggPSBzdHlsZS5ncmFkaWVudFdpdGgsXG4gICAgICBncmFkaWVudFN0b3BzID0gc3R5bGUuZ3JhZGllbnRTdG9wcyxcbiAgICAgIG9wYWNpdHkgPSBzdHlsZS5vcGFjaXR5O1xuICBncmFkaWVudENvbG9yID0gZ3JhZGllbnRDb2xvci5tYXAoZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgdmFyIGNvbG9yT3BhY2l0eSA9IGNvbG9yWzNdICogb3BhY2l0eTtcbiAgICB2YXIgY2xvbmVkQ29sb3IgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGNvbG9yKTtcbiAgICBjbG9uZWRDb2xvclszXSA9IGNvbG9yT3BhY2l0eTtcbiAgICByZXR1cm4gY2xvbmVkQ29sb3I7XG4gIH0pO1xuICBncmFkaWVudENvbG9yID0gZ3JhZGllbnRDb2xvci5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICByZXR1cm4gKDAsIF9jb2xvci5nZXRDb2xvckZyb21SZ2JWYWx1ZSkoYyk7XG4gIH0pO1xuICBpZiAoZ3JhZGllbnRTdG9wcyA9PT0gJ2F1dG8nKSBncmFkaWVudFN0b3BzID0gZ2V0QXV0b0NvbG9yU3RvcHMoZ3JhZGllbnRDb2xvcik7XG4gIHZhciBncmFkaWVudCA9IGN0eFtcImNyZWF0ZVwiLmNvbmNhdChncmFkaWVudFR5cGUuc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArIGdyYWRpZW50VHlwZS5zbGljZSgxKSwgXCJHcmFkaWVudFwiKV0uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGdyYWRpZW50UGFyYW1zKSk7XG4gIGdyYWRpZW50U3RvcHMuZm9yRWFjaChmdW5jdGlvbiAoc3RvcCwgaSkge1xuICAgIHJldHVybiBncmFkaWVudC5hZGRDb2xvclN0b3Aoc3RvcCwgZ3JhZGllbnRDb2xvcltpXSk7XG4gIH0pO1xuICBjdHhbXCJcIi5jb25jYXQoZ3JhZGllbnRXaXRoLCBcIlN0eWxlXCIpXSA9IGdyYWRpZW50O1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgZ3JhZGllbnQgY29uZmlndXJhdGlvbiBpcyBsZWdhbFxyXG4gKiBAcGFyYW0ge1N0eWxlfSBzdHlsZSBJbnN0YW5jZSBvZiBTdHlsZVxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBDaGVjayBSZXN1bHRcclxuICovXG5cblxuZnVuY3Rpb24gZ3JhZGllbnRWYWxpZGF0b3Ioc3R5bGUpIHtcbiAgdmFyIGdyYWRpZW50Q29sb3IgPSBzdHlsZS5ncmFkaWVudENvbG9yLFxuICAgICAgZ3JhZGllbnRQYXJhbXMgPSBzdHlsZS5ncmFkaWVudFBhcmFtcyxcbiAgICAgIGdyYWRpZW50VHlwZSA9IHN0eWxlLmdyYWRpZW50VHlwZSxcbiAgICAgIGdyYWRpZW50V2l0aCA9IHN0eWxlLmdyYWRpZW50V2l0aCxcbiAgICAgIGdyYWRpZW50U3RvcHMgPSBzdHlsZS5ncmFkaWVudFN0b3BzO1xuICBpZiAoIWdyYWRpZW50Q29sb3IgfHwgIWdyYWRpZW50UGFyYW1zKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGdyYWRpZW50Q29sb3IubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc29sZS53YXJuKCdUaGUgZ3JhZGllbnQgbmVlZHMgdG8gcHJvdmlkZSBhdCBsZWFzdCB0d28gY29sb3JzJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50VHlwZSAhPT0gJ2xpbmVhcicgJiYgZ3JhZGllbnRUeXBlICE9PSAncmFkaWFsJykge1xuICAgIGNvbnNvbGUud2FybignR3JhZGllbnRUeXBlIG9ubHkgc3VwcG9ydHMgbGluZWFyIG9yIHJhZGlhbCwgY3VycmVudCB2YWx1ZSBpcyAnICsgZ3JhZGllbnRUeXBlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZ3JhZGllbnRQYXJhbXNMZW5ndGggPSBncmFkaWVudFBhcmFtcy5sZW5ndGg7XG5cbiAgaWYgKGdyYWRpZW50VHlwZSA9PT0gJ2xpbmVhcicgJiYgZ3JhZGllbnRQYXJhbXNMZW5ndGggIT09IDQgfHwgZ3JhZGllbnRUeXBlID09PSAncmFkaWFsJyAmJiBncmFkaWVudFBhcmFtc0xlbmd0aCAhPT0gNikge1xuICAgIGNvbnNvbGUud2FybignVGhlIGV4cGVjdGVkIGxlbmd0aCBvZiBncmFkaWVudFBhcmFtcyBpcyAnICsgKGdyYWRpZW50VHlwZSA9PT0gJ2xpbmVhcicgPyAnNCcgOiAnNicpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoZ3JhZGllbnRXaXRoICE9PSAnZmlsbCcgJiYgZ3JhZGllbnRXaXRoICE9PSAnc3Ryb2tlJykge1xuICAgIGNvbnNvbGUud2FybignR3JhZGllbnRXaXRoIG9ubHkgc3VwcG9ydHMgZmlsbCBvciBzdHJva2UsIGN1cnJlbnQgdmFsdWUgaXMgJyArIGdyYWRpZW50V2l0aCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGdyYWRpZW50U3RvcHMgIT09ICdhdXRvJyAmJiAhKGdyYWRpZW50U3RvcHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLndhcm4oXCJncmFkaWVudFN0b3BzIG9ubHkgc3VwcG9ydHMgJ2F1dG8nIG9yIE51bWJlciBBcnJheSAoWzAsIC41LCAxXSksIGN1cnJlbnQgdmFsdWUgaXMgXCIgKyBncmFkaWVudFN0b3BzKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IGEgdW5pZm9ybSBncmFkaWVudCBjb2xvciBzdG9wXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGNvbG9yIEdyYWRpZW50IGNvbG9yXHJcbiAqIEByZXR1cm4ge0FycmF5fSBHcmFkaWVudCBjb2xvciBzdG9wXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEF1dG9Db2xvclN0b3BzKGNvbG9yKSB7XG4gIHZhciBzdG9wR2FwID0gMSAvIChjb2xvci5sZW5ndGggLSAxKTtcbiAgcmV0dXJuIGNvbG9yLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgcmV0dXJuIHN0b3BHYXAgKiBpO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUmVzdG9yZSBjYW52YXMgY3R4IHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICBDb250ZXh0IG9mIGNhbnZhc1xyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLnJlc3RvcmVUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoY3R4KSB7XG4gIGN0eC5yZXN0b3JlKCk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBVcGRhdGUgc3R5bGUgZGF0YVxyXG4gKiBAcGFyYW0ge09iamVjdH0gY2hhbmdlIENoYW5nZWQgZGF0YVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IFZvaWRcclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChjaGFuZ2UpIHtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihjaGFuZ2UpO1xuICBPYmplY3QuYXNzaWduKHRoaXMsIGNoYW5nZSk7XG59O1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGN1cnJlbnQgc3R5bGUgY29uZmlndXJhdGlvblxyXG4gKiBAcmV0dXJuIHtPYmplY3R9IFN0eWxlIGNvbmZpZ3VyYXRpb25cclxuICovXG5cblxuU3R5bGUucHJvdG90eXBlLmdldFN0eWxlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY2xvbmVkU3R5bGUgPSAoMCwgX3V0aWwuZGVlcENsb25lKSh0aGlzLCB0cnVlKTtcbiAgdGhpcy5jb2xvclByb2Nlc3NvcihjbG9uZWRTdHlsZSwgdHJ1ZSk7XG4gIHJldHVybiBjbG9uZWRTdHlsZTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5leHRlbmROZXdHcmFwaCA9IGV4dGVuZE5ld0dyYXBoO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBleHBvcnRzLnRleHQgPSBleHBvcnRzLmJlemllckN1cnZlID0gZXhwb3J0cy5zbW9vdGhsaW5lID0gZXhwb3J0cy5wb2x5bGluZSA9IGV4cG9ydHMucmVnUG9seWdvbiA9IGV4cG9ydHMuc2VjdG9yID0gZXhwb3J0cy5hcmMgPSBleHBvcnRzLnJpbmcgPSBleHBvcnRzLnJlY3QgPSBleHBvcnRzLmVsbGlwc2UgPSBleHBvcnRzLmNpcmNsZSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9zbGljZWRUb0FycmF5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvc2xpY2VkVG9BcnJheVwiKSk7XG5cbnZhciBfYmV6aWVyQ3VydmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGppYW1pbmdoaS9iZXppZXItY3VydmVcIikpO1xuXG52YXIgX3V0aWwgPSByZXF1aXJlKFwiLi4vcGx1Z2luL3V0aWxcIik7XG5cbnZhciBfY2FudmFzID0gcmVxdWlyZShcIi4uL3BsdWdpbi9jYW52YXNcIik7XG5cbnZhciBwb2x5bGluZVRvQmV6aWVyQ3VydmUgPSBfYmV6aWVyQ3VydmUyW1wiZGVmYXVsdFwiXS5wb2x5bGluZVRvQmV6aWVyQ3VydmUsXG4gICAgYmV6aWVyQ3VydmVUb1BvbHlsaW5lID0gX2JlemllckN1cnZlMltcImRlZmF1bHRcIl0uYmV6aWVyQ3VydmVUb1BvbHlsaW5lO1xudmFyIGNpcmNsZSA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcblxuICAgIGlmICh0eXBlb2YgcnggIT09ICdudW1iZXInIHx8IHR5cGVvZiByeSAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHIgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDaXJjbGUgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMiwgX3JlZjMpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjIuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzLnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5DaXJjbGUpKHBvc2l0aW9uLCByeCwgcnksIHIpO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNS5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY2LCBfcmVmNykge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNi5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY2Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNy5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHNoYXBlLnJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHNoYXBlLnJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmNpcmNsZSA9IGNpcmNsZTtcbnZhciBlbGxpcHNlID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIGhyOiAwLFxuICAgIHZyOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWY4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjguc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiBociAhPT0gJ251bWJlcicgfHwgdHlwZW9mIHZyICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignRWxsaXBzZSBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY5LCBfcmVmMTApIHtcbiAgICB2YXIgY3R4ID0gX3JlZjkuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYxMC5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIGhyID0gc2hhcGUuaHIsXG4gICAgICAgIHZyID0gc2hhcGUudnI7XG4gICAgY3R4LmVsbGlwc2UocngsIHJ5LCBociA+IDAgPyBociA6IDAuMDEsIHZyID4gMCA/IHZyIDogMC4wMSwgMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjExKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjExLnNoYXBlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICBociA9IHNoYXBlLmhyLFxuICAgICAgICB2ciA9IHNoYXBlLnZyO1xuICAgIHZhciBhID0gTWF0aC5tYXgoaHIsIHZyKTtcbiAgICB2YXIgYiA9IE1hdGgubWluKGhyLCB2cik7XG4gICAgdmFyIGMgPSBNYXRoLnNxcnQoYSAqIGEgLSBiICogYik7XG4gICAgdmFyIGxlZnRGb2N1c1BvaW50ID0gW3J4IC0gYywgcnldO1xuICAgIHZhciByaWdodEZvY3VzUG9pbnQgPSBbcnggKyBjLCByeV07XG4gICAgdmFyIGRpc3RhbmNlID0gKDAsIF91dGlsLmdldFR3b1BvaW50RGlzdGFuY2UpKHBvc2l0aW9uLCBsZWZ0Rm9jdXNQb2ludCkgKyAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIHJpZ2h0Rm9jdXNQb2ludCk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDw9IDIgKiBhO1xuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjEyKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjEyLnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWYxMi5zdHlsZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeTtcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IFtyeCwgcnldO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWYxMywgX3JlZjE0KSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWYxMy5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWYxMy5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjE0LnNoYXBlO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICByeDogc2hhcGUucnggKyBtb3ZlbWVudFgsXG4gICAgICByeTogc2hhcGUucnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuZWxsaXBzZSA9IGVsbGlwc2U7XG52YXIgcmVjdCA9IHtcbiAgc2hhcGU6IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgdzogMCxcbiAgICBoOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYxNSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxNS5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG5cbiAgICBpZiAodHlwZW9mIHggIT09ICdudW1iZXInIHx8IHR5cGVvZiB5ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgdyAhPT0gJ251bWJlcicgfHwgdHlwZW9mIGggIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdSZWN0IHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjE2LCBfcmVmMTcpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjE2LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMTcuc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciB4ID0gc2hhcGUueCxcbiAgICAgICAgeSA9IHNoYXBlLnksXG4gICAgICAgIHcgPSBzaGFwZS53LFxuICAgICAgICBoID0gc2hhcGUuaDtcbiAgICBjdHgucmVjdCh4LCB5LCB3LCBoKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYxOCkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxOC5zaGFwZTtcbiAgICB2YXIgeCA9IHNoYXBlLngsXG4gICAgICAgIHkgPSBzaGFwZS55LFxuICAgICAgICB3ID0gc2hhcGUudyxcbiAgICAgICAgaCA9IHNoYXBlLmg7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblJlY3QpKHBvc2l0aW9uLCB4LCB5LCB3LCBoKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWYxOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYxOS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMTkuc3R5bGU7XG4gICAgdmFyIHggPSBzaGFwZS54LFxuICAgICAgICB5ID0gc2hhcGUueSxcbiAgICAgICAgdyA9IHNoYXBlLncsXG4gICAgICAgIGggPSBzaGFwZS5oO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3ggKyB3IC8gMiwgeSArIGggLyAyXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmMjAsIF9yZWYyMSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmMjAubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmMjAubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWYyMS5zaGFwZTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgeDogc2hhcGUueCArIG1vdmVtZW50WCxcbiAgICAgIHk6IHNoYXBlLnkgKyBtb3ZlbWVudFlcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMucmVjdCA9IHJlY3Q7XG52YXIgcmluZyA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwXG4gIH0sXG4gIHZhbGlkYXRvcjogZnVuY3Rpb24gdmFsaWRhdG9yKF9yZWYyMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYyMi5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG5cbiAgICBpZiAodHlwZW9mIHJ4ICE9PSAnbnVtYmVyJyB8fCB0eXBlb2YgcnkgIT09ICdudW1iZXInIHx8IHR5cGVvZiByICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc29sZS5lcnJvcignUmluZyBzaGFwZSBjb25maWd1cmF0aW9uIGlzIGFibm9ybWFsIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWYyMywgX3JlZjI0KSB7XG4gICAgdmFyIGN0eCA9IF9yZWYyMy5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjI0LnNoYXBlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnI7XG4gICAgY3R4LmFyYyhyeCwgcnksIHIgPiAwID8gciA6IDAuMDEsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmMjUpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjUuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjI1LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucjtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuICAgIHZhciBoYWxmTGluZVdpZHRoID0gbGluZVdpZHRoIC8gMjtcbiAgICB2YXIgbWluRGlzdGFuY2UgPSByIC0gaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgbWF4RGlzdGFuY2UgPSByICsgaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgZGlzdGFuY2UgPSAoMCwgX3V0aWwuZ2V0VHdvUG9pbnREaXN0YW5jZSkocG9zaXRpb24sIFtyeCwgcnldKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPj0gbWluRGlzdGFuY2UgJiYgZGlzdGFuY2UgPD0gbWF4RGlzdGFuY2U7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMjYpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjYuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjI2LnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjI3LCBfcmVmMjgpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjI3Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjI3Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjguc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yaW5nID0gcmluZztcbnZhciBhcmMgPSB7XG4gIHNoYXBlOiB7XG4gICAgcng6IDAsXG4gICAgcnk6IDAsXG4gICAgcjogMCxcbiAgICBzdGFydEFuZ2xlOiAwLFxuICAgIGVuZEFuZ2xlOiAwLFxuICAgIGNsb2NrV2lzZTogdHJ1ZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmMjkpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMjkuc2hhcGU7XG4gICAgdmFyIGtleXMgPSBbJ3J4JywgJ3J5JywgJ3InLCAnc3RhcnRBbmdsZScsICdlbmRBbmdsZSddO1xuXG4gICAgaWYgKGtleXMuZmluZChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHNoYXBlW2tleV0gIT09ICdudW1iZXInO1xuICAgIH0pKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBcmMgc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmMzAsIF9yZWYzMSkge1xuICAgIHZhciBjdHggPSBfcmVmMzAuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMS5zaGFwZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIGN0eC5hcmMocngsIHJ5LCByID4gMCA/IHIgOiAwLjAwMSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYzMikge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzMi5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmMzIuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzdGFydEFuZ2xlID0gc2hhcGUuc3RhcnRBbmdsZSxcbiAgICAgICAgZW5kQW5nbGUgPSBzaGFwZS5lbmRBbmdsZSxcbiAgICAgICAgY2xvY2tXaXNlID0gc2hhcGUuY2xvY2tXaXNlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG4gICAgdmFyIGhhbGZMaW5lV2lkdGggPSBsaW5lV2lkdGggLyAyO1xuICAgIHZhciBpbnNpZGVSYWRpdXMgPSByIC0gaGFsZkxpbmVXaWR0aDtcbiAgICB2YXIgb3V0c2lkZVJhZGl1cyA9IHIgKyBoYWxmTGluZVdpZHRoO1xuICAgIHJldHVybiAhKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luU2VjdG9yKShwb3NpdGlvbiwgcngsIHJ5LCBpbnNpZGVSYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBjbG9ja1dpc2UpICYmICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgb3V0c2lkZVJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmMzMpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzMuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjMzLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjM0LCBfcmVmMzUpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjM0Lm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjM0Lm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzUuc2hhcGU7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiBzaGFwZS5yeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiBzaGFwZS5yeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5hcmMgPSBhcmM7XG52YXIgc2VjdG9yID0ge1xuICBzaGFwZToge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHI6IDAsXG4gICAgc3RhcnRBbmdsZTogMCxcbiAgICBlbmRBbmdsZTogMCxcbiAgICBjbG9ja1dpc2U6IHRydWVcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjM2KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjM2LnNoYXBlO1xuICAgIHZhciBrZXlzID0gWydyeCcsICdyeScsICdyJywgJ3N0YXJ0QW5nbGUnLCAnZW5kQW5nbGUnXTtcblxuICAgIGlmIChrZXlzLmZpbmQoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzaGFwZVtrZXldICE9PSAnbnVtYmVyJztcbiAgICB9KSkge1xuICAgICAgY29uc29sZS5lcnJvcignU2VjdG9yIHNoYXBlIGNvbmZpZ3VyYXRpb24gaXMgYWJub3JtYWwhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjM3LCBfcmVmMzgpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjM3LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmMzguc2hhcGU7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5LFxuICAgICAgICByID0gc2hhcGUucixcbiAgICAgICAgc3RhcnRBbmdsZSA9IHNoYXBlLnN0YXJ0QW5nbGUsXG4gICAgICAgIGVuZEFuZ2xlID0gc2hhcGUuZW5kQW5nbGUsXG4gICAgICAgIGNsb2NrV2lzZSA9IHNoYXBlLmNsb2NrV2lzZTtcbiAgICBjdHguYXJjKHJ4LCByeSwgciA+IDAgPyByIDogMC4wMSwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsICFjbG9ja1dpc2UpO1xuICAgIGN0eC5saW5lVG8ocngsIHJ5KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWYzOSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWYzOS5zaGFwZTtcbiAgICB2YXIgcnggPSBzaGFwZS5yeCxcbiAgICAgICAgcnkgPSBzaGFwZS5yeSxcbiAgICAgICAgciA9IHNoYXBlLnIsXG4gICAgICAgIHN0YXJ0QW5nbGUgPSBzaGFwZS5zdGFydEFuZ2xlLFxuICAgICAgICBlbmRBbmdsZSA9IHNoYXBlLmVuZEFuZ2xlLFxuICAgICAgICBjbG9ja1dpc2UgPSBzaGFwZS5jbG9ja1dpc2U7XG4gICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblNlY3RvcikocG9zaXRpb24sIHJ4LCByeSwgciwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGNsb2NrV2lzZSk7XG4gIH0sXG4gIHNldEdyYXBoQ2VudGVyOiBmdW5jdGlvbiBzZXRHcmFwaENlbnRlcihlLCBfcmVmNDApIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDAuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjQwLnN0eWxlO1xuICAgIHZhciByeCA9IHNoYXBlLnJ4LFxuICAgICAgICByeSA9IHNoYXBlLnJ5O1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gW3J4LCByeV07XG4gIH0sXG4gIG1vdmU6IGZ1bmN0aW9uIG1vdmUoX3JlZjQxLCBfcmVmNDIpIHtcbiAgICB2YXIgbW92ZW1lbnRYID0gX3JlZjQxLm1vdmVtZW50WCxcbiAgICAgICAgbW92ZW1lbnRZID0gX3JlZjQxLm1vdmVtZW50WTtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNDIuc2hhcGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHJ4OiByeCArIG1vdmVtZW50WCxcbiAgICAgIHJ5OiByeSArIG1vdmVtZW50WVxuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5zZWN0b3IgPSBzZWN0b3I7XG52YXIgcmVnUG9seWdvbiA9IHtcbiAgc2hhcGU6IHtcbiAgICByeDogMCxcbiAgICByeTogMCxcbiAgICByOiAwLFxuICAgIHNpZGU6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjQzKSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQzLnNoYXBlO1xuICAgIHZhciBzaWRlID0gc2hhcGUuc2lkZTtcbiAgICB2YXIga2V5cyA9IFsncngnLCAncnknLCAncicsICdzaWRlJ107XG5cbiAgICBpZiAoa2V5cy5maW5kKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc2hhcGVba2V5XSAhPT0gJ251bWJlcic7XG4gICAgfSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ1BvbHlnb24gc2hhcGUgY29uZmlndXJhdGlvbiBpcyBhYm5vcm1hbCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2lkZSA8IDMpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1JlZ1BvbHlnb24gYXQgbGVhc3QgdHJpZ29uIScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY0NCwgX3JlZjQ1KSB7XG4gICAgdmFyIGN0eCA9IF9yZWY0NC5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjQ1LnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY0NS5jYWNoZTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnksXG4gICAgICAgIHIgPSBzaGFwZS5yLFxuICAgICAgICBzaWRlID0gc2hhcGUuc2lkZTtcblxuICAgIGlmICghY2FjaGUucG9pbnRzIHx8IGNhY2hlLnJ4ICE9PSByeCB8fCBjYWNoZS5yeSAhPT0gcnkgfHwgY2FjaGUuciAhPT0gciB8fCBjYWNoZS5zaWRlICE9PSBzaWRlKSB7XG4gICAgICB2YXIgX3BvaW50cyA9ICgwLCBfdXRpbC5nZXRSZWd1bGFyUG9seWdvblBvaW50cykocngsIHJ5LCByLCBzaWRlKTtcblxuICAgICAgT2JqZWN0LmFzc2lnbihjYWNoZSwge1xuICAgICAgICBwb2ludHM6IF9wb2ludHMsXG4gICAgICAgIHJ4OiByeCxcbiAgICAgICAgcnk6IHJ5LFxuICAgICAgICByOiByLFxuICAgICAgICBzaWRlOiBzaWRlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnRzID0gY2FjaGUucG9pbnRzO1xuICAgICgwLCBfY2FudmFzLmRyYXdQb2x5bGluZVBhdGgpKGN0eCwgcG9pbnRzKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY0Nikge1xuICAgIHZhciBjYWNoZSA9IF9yZWY0Ni5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gY2FjaGUucG9pbnRzO1xuICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgcG9pbnRzKTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY0Nykge1xuICAgIHZhciBzaGFwZSA9IF9yZWY0Ny5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNDcuc3R5bGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSBbcngsIHJ5XTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNDgsIF9yZWY0OSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNDgubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNDgubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY0OS5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNDkuY2FjaGU7XG4gICAgdmFyIHJ4ID0gc2hhcGUucngsXG4gICAgICAgIHJ5ID0gc2hhcGUucnk7XG4gICAgY2FjaGUucnggKz0gbW92ZW1lbnRYO1xuICAgIGNhY2hlLnJ5ICs9IG1vdmVtZW50WTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcng6IHJ4ICsgbW92ZW1lbnRYLFxuICAgICAgcnk6IHJ5ICsgbW92ZW1lbnRZXG4gICAgfSk7XG4gICAgY2FjaGUucG9pbnRzID0gY2FjaGUucG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjUwKSB7XG4gICAgICB2YXIgX3JlZjUxID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY1MCwgMiksXG4gICAgICAgICAgeCA9IF9yZWY1MVswXSxcbiAgICAgICAgICB5ID0gX3JlZjUxWzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0cy5yZWdQb2x5Z29uID0gcmVnUG9seWdvbjtcbnZhciBwb2x5bGluZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNTIpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNTIuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignUG9seWxpbmUgcG9pbnRzIHNob3VsZCBiZSBhbiBhcnJheSEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZHJhdzogZnVuY3Rpb24gZHJhdyhfcmVmNTMsIF9yZWY1NCkge1xuICAgIHZhciBjdHggPSBfcmVmNTMuY3R4O1xuICAgIHZhciBzaGFwZSA9IF9yZWY1NC5zaGFwZSxcbiAgICAgICAgbGluZVdpZHRoID0gX3JlZjU0LnN0eWxlLmxpbmVXaWR0aDtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICBpZiAobGluZVdpZHRoID09PSAxKSBwb2ludHMgPSAoMCwgX3V0aWwuZWxpbWluYXRlQmx1cikocG9pbnRzKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3UG9seWxpbmVQYXRoKShjdHgsIHBvaW50cyk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY1NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1NS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNTUuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cyxcbiAgICAgICAgY2xvc2UgPSBzaGFwZS5jbG9zZTtcbiAgICB2YXIgbGluZVdpZHRoID0gc3R5bGUubGluZVdpZHRoO1xuXG4gICAgaWYgKGNsb3NlKSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc0luUG9seWdvbikocG9zaXRpb24sIHBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgcG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY1Nikge1xuICAgIHZhciBzaGFwZSA9IF9yZWY1Ni5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNTYuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNTcsIF9yZWY1OCkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNTcubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNTcubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY1OC5zaGFwZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHZhciBtb3ZlQWZ0ZXJQb2ludHMgPSBwb2ludHMubWFwKGZ1bmN0aW9uIChfcmVmNTkpIHtcbiAgICAgIHZhciBfcmVmNjAgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjU5LCAyKSxcbiAgICAgICAgICB4ID0gX3JlZjYwWzBdLFxuICAgICAgICAgIHkgPSBfcmVmNjBbMV07XG5cbiAgICAgIHJldHVybiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV07XG4gICAgfSk7XG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvaW50czogbW92ZUFmdGVyUG9pbnRzXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLnBvbHlsaW5lID0gcG9seWxpbmU7XG52YXIgc21vb3RobGluZSA9IHtcbiAgc2hhcGU6IHtcbiAgICBwb2ludHM6IFtdLFxuICAgIGNsb3NlOiBmYWxzZVxuICB9LFxuICB2YWxpZGF0b3I6IGZ1bmN0aW9uIHZhbGlkYXRvcihfcmVmNjEpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNjEuc2hhcGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcblxuICAgIGlmICghKHBvaW50cyBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignU21vb3RobGluZSBwb2ludHMgc2hvdWxkIGJlIGFuIGFycmF5IScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkcmF3OiBmdW5jdGlvbiBkcmF3KF9yZWY2MiwgX3JlZjYzKSB7XG4gICAgdmFyIGN0eCA9IF9yZWY2Mi5jdHg7XG4gICAgdmFyIHNoYXBlID0gX3JlZjYzLnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY2My5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzLFxuICAgICAgICBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuXG4gICAgaWYgKCFjYWNoZS5wb2ludHMgfHwgY2FjaGUucG9pbnRzLnRvU3RyaW5nKCkgIT09IHBvaW50cy50b1N0cmluZygpKSB7XG4gICAgICB2YXIgX2JlemllckN1cnZlID0gcG9seWxpbmVUb0JlemllckN1cnZlKHBvaW50cywgY2xvc2UpO1xuXG4gICAgICB2YXIgaG92ZXJQb2ludHMgPSBiZXppZXJDdXJ2ZVRvUG9seWxpbmUoX2JlemllckN1cnZlKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiAoMCwgX3V0aWwuZGVlcENsb25lKShwb2ludHMsIHRydWUpLFxuICAgICAgICBiZXppZXJDdXJ2ZTogX2JlemllckN1cnZlLFxuICAgICAgICBob3ZlclBvaW50czogaG92ZXJQb2ludHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBiZXppZXJDdXJ2ZSA9IGNhY2hlLmJlemllckN1cnZlO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3QmV6aWVyQ3VydmVQYXRoKShjdHgsIGJlemllckN1cnZlLnNsaWNlKDEpLCBiZXppZXJDdXJ2ZVswXSk7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG4gIH0sXG4gIGhvdmVyQ2hlY2s6IGZ1bmN0aW9uIGhvdmVyQ2hlY2socG9zaXRpb24sIF9yZWY2NCkge1xuICAgIHZhciBjYWNoZSA9IF9yZWY2NC5jYWNoZSxcbiAgICAgICAgc2hhcGUgPSBfcmVmNjQuc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjY0LnN0eWxlO1xuICAgIHZhciBob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzO1xuICAgIHZhciBjbG9zZSA9IHNoYXBlLmNsb3NlO1xuICAgIHZhciBsaW5lV2lkdGggPSBzdHlsZS5saW5lV2lkdGg7XG5cbiAgICBpZiAoY2xvc2UpIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzSW5Qb2x5Z29uKShwb3NpdGlvbiwgaG92ZXJQb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKDAsIF91dGlsLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSkocG9zaXRpb24sIGhvdmVyUG9pbnRzLCBsaW5lV2lkdGgpO1xuICAgIH1cbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY2NSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY2NS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNjUuc3R5bGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICBzdHlsZS5ncmFwaENlbnRlciA9IHBvaW50c1swXTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmNjYsIF9yZWY2Nykge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmNjYubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmNjYubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY2Ny5zaGFwZSxcbiAgICAgICAgY2FjaGUgPSBfcmVmNjcuY2FjaGU7XG4gICAgdmFyIHBvaW50cyA9IHNoYXBlLnBvaW50cztcbiAgICB2YXIgbW92ZUFmdGVyUG9pbnRzID0gcG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjY4KSB7XG4gICAgICB2YXIgX3JlZjY5ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY2OCwgMiksXG4gICAgICAgICAgeCA9IF9yZWY2OVswXSxcbiAgICAgICAgICB5ID0gX3JlZjY5WzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIGNhY2hlLnBvaW50cyA9IG1vdmVBZnRlclBvaW50cztcblxuICAgIHZhciBfY2FjaGUkYmV6aWVyQ3VydmUkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKGNhY2hlLmJlemllckN1cnZlWzBdLCAyKSxcbiAgICAgICAgZnggPSBfY2FjaGUkYmV6aWVyQ3VydmUkWzBdLFxuICAgICAgICBmeSA9IF9jYWNoZSRiZXppZXJDdXJ2ZSRbMV07XG5cbiAgICB2YXIgY3VydmVzID0gY2FjaGUuYmV6aWVyQ3VydmUuc2xpY2UoMSk7XG4gICAgY2FjaGUuYmV6aWVyQ3VydmUgPSBbW2Z4ICsgbW92ZW1lbnRYLCBmeSArIG1vdmVtZW50WV1dLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKGN1cnZlcy5tYXAoZnVuY3Rpb24gKGN1cnZlKSB7XG4gICAgICByZXR1cm4gY3VydmUubWFwKGZ1bmN0aW9uIChfcmVmNzApIHtcbiAgICAgICAgdmFyIF9yZWY3MSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNzAsIDIpLFxuICAgICAgICAgICAgeCA9IF9yZWY3MVswXSxcbiAgICAgICAgICAgIHkgPSBfcmVmNzFbMV07XG5cbiAgICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICAgIH0pO1xuICAgIH0pKSk7XG4gICAgY2FjaGUuaG92ZXJQb2ludHMgPSBjYWNoZS5ob3ZlclBvaW50cy5tYXAoZnVuY3Rpb24gKF9yZWY3Mikge1xuICAgICAgdmFyIF9yZWY3MyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmNzIsIDIpLFxuICAgICAgICAgIHggPSBfcmVmNzNbMF0sXG4gICAgICAgICAgeSA9IF9yZWY3M1sxXTtcblxuICAgICAgcmV0dXJuIFt4ICsgbW92ZW1lbnRYLCB5ICsgbW92ZW1lbnRZXTtcbiAgICB9KTtcbiAgICB0aGlzLmF0dHIoJ3NoYXBlJywge1xuICAgICAgcG9pbnRzOiBtb3ZlQWZ0ZXJQb2ludHNcbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMuc21vb3RobGluZSA9IHNtb290aGxpbmU7XG52YXIgYmV6aWVyQ3VydmUgPSB7XG4gIHNoYXBlOiB7XG4gICAgcG9pbnRzOiBbXSxcbiAgICBjbG9zZTogZmFsc2VcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjc0KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc0LnNoYXBlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHM7XG5cbiAgICBpZiAoIShwb2ludHMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0JlemllckN1cnZlIHBvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjc1LCBfcmVmNzYpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjc1LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmNzYuc2hhcGUsXG4gICAgICAgIGNhY2hlID0gX3JlZjc2LmNhY2hlO1xuICAgIHZhciBwb2ludHMgPSBzaGFwZS5wb2ludHMsXG4gICAgICAgIGNsb3NlID0gc2hhcGUuY2xvc2U7XG5cbiAgICBpZiAoIWNhY2hlLnBvaW50cyB8fCBjYWNoZS5wb2ludHMudG9TdHJpbmcoKSAhPT0gcG9pbnRzLnRvU3RyaW5nKCkpIHtcbiAgICAgIHZhciBob3ZlclBvaW50cyA9IGJlemllckN1cnZlVG9Qb2x5bGluZShwb2ludHMsIDIwKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oY2FjaGUsIHtcbiAgICAgICAgcG9pbnRzOiAoMCwgX3V0aWwuZGVlcENsb25lKShwb2ludHMsIHRydWUpLFxuICAgICAgICBob3ZlclBvaW50czogaG92ZXJQb2ludHNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAoMCwgX2NhbnZhcy5kcmF3QmV6aWVyQ3VydmVQYXRoKShjdHgsIHBvaW50cy5zbGljZSgxKSwgcG9pbnRzWzBdKTtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgfSxcbiAgaG92ZXJDaGVjazogZnVuY3Rpb24gaG92ZXJDaGVjayhwb3NpdGlvbiwgX3JlZjc3KSB7XG4gICAgdmFyIGNhY2hlID0gX3JlZjc3LmNhY2hlLFxuICAgICAgICBzaGFwZSA9IF9yZWY3Ny5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmNzcuc3R5bGU7XG4gICAgdmFyIGhvdmVyUG9pbnRzID0gY2FjaGUuaG92ZXJQb2ludHM7XG4gICAgdmFyIGNsb3NlID0gc2hhcGUuY2xvc2U7XG4gICAgdmFyIGxpbmVXaWR0aCA9IHN0eWxlLmxpbmVXaWR0aDtcblxuICAgIGlmIChjbG9zZSkge1xuICAgICAgcmV0dXJuICgwLCBfdXRpbC5jaGVja1BvaW50SXNJblBvbHlnb24pKHBvc2l0aW9uLCBob3ZlclBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoMCwgX3V0aWwuY2hlY2tQb2ludElzTmVhclBvbHlsaW5lKShwb3NpdGlvbiwgaG92ZXJQb2ludHMsIGxpbmVXaWR0aCk7XG4gICAgfVxuICB9LFxuICBzZXRHcmFwaENlbnRlcjogZnVuY3Rpb24gc2V0R3JhcGhDZW50ZXIoZSwgX3JlZjc4KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjc4LnNoYXBlLFxuICAgICAgICBzdHlsZSA9IF9yZWY3OC5zdHlsZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuICAgIHN0eWxlLmdyYXBoQ2VudGVyID0gcG9pbnRzWzBdO1xuICB9LFxuICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKF9yZWY3OSwgX3JlZjgwKSB7XG4gICAgdmFyIG1vdmVtZW50WCA9IF9yZWY3OS5tb3ZlbWVudFgsXG4gICAgICAgIG1vdmVtZW50WSA9IF9yZWY3OS5tb3ZlbWVudFk7XG4gICAgdmFyIHNoYXBlID0gX3JlZjgwLnNoYXBlLFxuICAgICAgICBjYWNoZSA9IF9yZWY4MC5jYWNoZTtcbiAgICB2YXIgcG9pbnRzID0gc2hhcGUucG9pbnRzO1xuXG4gICAgdmFyIF9wb2ludHMkID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50c1swXSwgMiksXG4gICAgICAgIGZ4ID0gX3BvaW50cyRbMF0sXG4gICAgICAgIGZ5ID0gX3BvaW50cyRbMV07XG5cbiAgICB2YXIgY3VydmVzID0gcG9pbnRzLnNsaWNlKDEpO1xuICAgIHZhciBiZXppZXJDdXJ2ZSA9IFtbZnggKyBtb3ZlbWVudFgsIGZ5ICsgbW92ZW1lbnRZXV0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoY3VydmVzLm1hcChmdW5jdGlvbiAoY3VydmUpIHtcbiAgICAgIHJldHVybiBjdXJ2ZS5tYXAoZnVuY3Rpb24gKF9yZWY4MSkge1xuICAgICAgICB2YXIgX3JlZjgyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4MSwgMiksXG4gICAgICAgICAgICB4ID0gX3JlZjgyWzBdLFxuICAgICAgICAgICAgeSA9IF9yZWY4MlsxXTtcblxuICAgICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgICAgfSk7XG4gICAgfSkpKTtcbiAgICBjYWNoZS5wb2ludHMgPSBiZXppZXJDdXJ2ZTtcbiAgICBjYWNoZS5ob3ZlclBvaW50cyA9IGNhY2hlLmhvdmVyUG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZjgzKSB7XG4gICAgICB2YXIgX3JlZjg0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY4MywgMiksXG4gICAgICAgICAgeCA9IF9yZWY4NFswXSxcbiAgICAgICAgICB5ID0gX3JlZjg0WzFdO1xuXG4gICAgICByZXR1cm4gW3ggKyBtb3ZlbWVudFgsIHkgKyBtb3ZlbWVudFldO1xuICAgIH0pO1xuICAgIHRoaXMuYXR0cignc2hhcGUnLCB7XG4gICAgICBwb2ludHM6IGJlemllckN1cnZlXG4gICAgfSk7XG4gIH1cbn07XG5leHBvcnRzLmJlemllckN1cnZlID0gYmV6aWVyQ3VydmU7XG52YXIgdGV4dCA9IHtcbiAgc2hhcGU6IHtcbiAgICBjb250ZW50OiAnJyxcbiAgICBwb3NpdGlvbjogW10sXG4gICAgbWF4V2lkdGg6IHVuZGVmaW5lZCxcbiAgICByb3dHYXA6IDBcbiAgfSxcbiAgdmFsaWRhdG9yOiBmdW5jdGlvbiB2YWxpZGF0b3IoX3JlZjg1KSB7XG4gICAgdmFyIHNoYXBlID0gX3JlZjg1LnNoYXBlO1xuICAgIHZhciBjb250ZW50ID0gc2hhcGUuY29udGVudCxcbiAgICAgICAgcG9zaXRpb24gPSBzaGFwZS5wb3NpdGlvbixcbiAgICAgICAgcm93R2FwID0gc2hhcGUucm93R2FwO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZW50ICE9PSAnc3RyaW5nJykge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCBjb250ZW50IHNob3VsZCBiZSBhIHN0cmluZyEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIShwb3NpdGlvbiBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgY29uc29sZS5lcnJvcignVGV4dCBwb3NpdGlvbiBzaG91bGQgYmUgYW4gYXJyYXkhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByb3dHYXAgIT09ICdudW1iZXInKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXh0IHJvd0dhcCBzaG91bGQgYmUgYSBudW1iZXIhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uIGRyYXcoX3JlZjg2LCBfcmVmODcpIHtcbiAgICB2YXIgY3R4ID0gX3JlZjg2LmN0eDtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODcuc2hhcGU7XG4gICAgdmFyIGNvbnRlbnQgPSBzaGFwZS5jb250ZW50LFxuICAgICAgICBwb3NpdGlvbiA9IHNoYXBlLnBvc2l0aW9uLFxuICAgICAgICBtYXhXaWR0aCA9IHNoYXBlLm1heFdpZHRoLFxuICAgICAgICByb3dHYXAgPSBzaGFwZS5yb3dHYXA7XG4gICAgdmFyIHRleHRCYXNlbGluZSA9IGN0eC50ZXh0QmFzZWxpbmUsXG4gICAgICAgIGZvbnQgPSBjdHguZm9udDtcbiAgICB2YXIgZm9udFNpemUgPSBwYXJzZUludChmb250LnJlcGxhY2UoL1xcRC9nLCAnJykpO1xuXG4gICAgdmFyIF9wb3NpdGlvbiA9IHBvc2l0aW9uLFxuICAgICAgICBfcG9zaXRpb24yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9wb3NpdGlvbiwgMiksXG4gICAgICAgIHggPSBfcG9zaXRpb24yWzBdLFxuICAgICAgICB5ID0gX3Bvc2l0aW9uMlsxXTtcblxuICAgIGNvbnRlbnQgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcbiAgICB2YXIgcm93TnVtID0gY29udGVudC5sZW5ndGg7XG4gICAgdmFyIGxpbmVIZWlnaHQgPSBmb250U2l6ZSArIHJvd0dhcDtcbiAgICB2YXIgYWxsSGVpZ2h0ID0gcm93TnVtICogbGluZUhlaWdodCAtIHJvd0dhcDtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgIGlmICh0ZXh0QmFzZWxpbmUgPT09ICdtaWRkbGUnKSB7XG4gICAgICBvZmZzZXQgPSBhbGxIZWlnaHQgLyAyO1xuICAgICAgeSArPSBmb250U2l6ZSAvIDI7XG4gICAgfVxuXG4gICAgaWYgKHRleHRCYXNlbGluZSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIG9mZnNldCA9IGFsbEhlaWdodDtcbiAgICAgIHkgKz0gZm9udFNpemU7XG4gICAgfVxuXG4gICAgcG9zaXRpb24gPSBuZXcgQXJyYXkocm93TnVtKS5maWxsKDApLm1hcChmdW5jdGlvbiAoZm9vLCBpKSB7XG4gICAgICByZXR1cm4gW3gsIHkgKyBpICogbGluZUhlaWdodCAtIG9mZnNldF07XG4gICAgfSk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRlbnQuZm9yRWFjaChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgY3R4LmZpbGxUZXh0LmFwcGx5KGN0eCwgW3RleHRdLmNvbmNhdCgoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uW2ldKSwgW21heFdpZHRoXSkpO1xuICAgICAgY3R4LnN0cm9rZVRleHQuYXBwbHkoY3R4LCBbdGV4dF0uY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9zaXRpb25baV0pLCBbbWF4V2lkdGhdKSk7XG4gICAgfSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICB9LFxuICBob3ZlckNoZWNrOiBmdW5jdGlvbiBob3ZlckNoZWNrKHBvc2l0aW9uLCBfcmVmODgpIHtcbiAgICB2YXIgc2hhcGUgPSBfcmVmODguc2hhcGUsXG4gICAgICAgIHN0eWxlID0gX3JlZjg4LnN0eWxlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgc2V0R3JhcGhDZW50ZXI6IGZ1bmN0aW9uIHNldEdyYXBoQ2VudGVyKGUsIF9yZWY4OSkge1xuICAgIHZhciBzaGFwZSA9IF9yZWY4OS5zaGFwZSxcbiAgICAgICAgc3R5bGUgPSBfcmVmODkuc3R5bGU7XG4gICAgdmFyIHBvc2l0aW9uID0gc2hhcGUucG9zaXRpb247XG4gICAgc3R5bGUuZ3JhcGhDZW50ZXIgPSAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvc2l0aW9uKTtcbiAgfSxcbiAgbW92ZTogZnVuY3Rpb24gbW92ZShfcmVmOTAsIF9yZWY5MSkge1xuICAgIHZhciBtb3ZlbWVudFggPSBfcmVmOTAubW92ZW1lbnRYLFxuICAgICAgICBtb3ZlbWVudFkgPSBfcmVmOTAubW92ZW1lbnRZO1xuICAgIHZhciBzaGFwZSA9IF9yZWY5MS5zaGFwZTtcblxuICAgIHZhciBfc2hhcGUkcG9zaXRpb24gPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoc2hhcGUucG9zaXRpb24sIDIpLFxuICAgICAgICB4ID0gX3NoYXBlJHBvc2l0aW9uWzBdLFxuICAgICAgICB5ID0gX3NoYXBlJHBvc2l0aW9uWzFdO1xuXG4gICAgdGhpcy5hdHRyKCdzaGFwZScsIHtcbiAgICAgIHBvc2l0aW9uOiBbeCArIG1vdmVtZW50WCwgeSArIG1vdmVtZW50WV1cbiAgICB9KTtcbiAgfVxufTtcbmV4cG9ydHMudGV4dCA9IHRleHQ7XG52YXIgZ3JhcGhzID0gbmV3IE1hcChbWydjaXJjbGUnLCBjaXJjbGVdLCBbJ2VsbGlwc2UnLCBlbGxpcHNlXSwgWydyZWN0JywgcmVjdF0sIFsncmluZycsIHJpbmddLCBbJ2FyYycsIGFyY10sIFsnc2VjdG9yJywgc2VjdG9yXSwgWydyZWdQb2x5Z29uJywgcmVnUG9seWdvbl0sIFsncG9seWxpbmUnLCBwb2x5bGluZV0sIFsnc21vb3RobGluZScsIHNtb290aGxpbmVdLCBbJ2JlemllckN1cnZlJywgYmV6aWVyQ3VydmVdLCBbJ3RleHQnLCB0ZXh0XV0pO1xudmFyIF9kZWZhdWx0ID0gZ3JhcGhzO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBFeHRlbmQgbmV3IGdyYXBoXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lICAgTmFtZSBvZiBHcmFwaFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gb2YgR3JhcGhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0O1xuXG5mdW5jdGlvbiBleHRlbmROZXdHcmFwaChuYW1lLCBjb25maWcpIHtcbiAgaWYgKCFuYW1lIHx8ICFjb25maWcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFeHRlbmROZXdHcmFwaCBNaXNzaW5nIFBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb25maWcuc2hhcGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZXF1aXJlZCBhdHRyaWJ1dGUgb2Ygc2hhcGUgdG8gZXh0ZW5kTmV3R3JhcGghJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFjb25maWcudmFsaWRhdG9yKSB7XG4gICAgY29uc29sZS5lcnJvcignUmVxdWlyZWQgZnVuY3Rpb24gb2YgdmFsaWRhdG9yIHRvIGV4dGVuZE5ld0dyYXBoIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY29uZmlnLmRyYXcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZXF1aXJlZCBmdW5jdGlvbiBvZiBkcmF3IHRvIGV4dGVuZE5ld0dyYXBoIScpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGdyYXBocy5zZXQobmFtZSwgY29uZmlnKTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJDUmVuZGVyXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgcmV0dXJuIF9jcmVuZGVyW1wiZGVmYXVsdFwiXTtcbiAgfVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJleHRlbmROZXdHcmFwaFwiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgIHJldHVybiBfZ3JhcGhzLmV4dGVuZE5ld0dyYXBoO1xuICB9XG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gdm9pZCAwO1xuXG52YXIgX2NyZW5kZXIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2NsYXNzL2NyZW5kZXIuY2xhc3NcIikpO1xuXG52YXIgX2dyYXBocyA9IHJlcXVpcmUoXCIuL2NvbmZpZy9ncmFwaHNcIik7XG5cbnZhciBfZGVmYXVsdCA9IF9jcmVuZGVyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0ID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW50ZXJvcFJlcXVpcmVEZWZhdWx0XCIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kcmF3UG9seWxpbmVQYXRoID0gZHJhd1BvbHlsaW5lUGF0aDtcbmV4cG9ydHMuZHJhd0JlemllckN1cnZlUGF0aCA9IGRyYXdCZXppZXJDdXJ2ZVBhdGg7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEcmF3IGEgcG9seWxpbmUgcGF0aFxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4ICAgICAgICBDYW52YXMgMmQgY29udGV4dFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgICAgICBUaGUgcG9pbnRzIHRoYXQgbWFrZXMgdXAgYSBwb2x5bGluZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGJlZ2luUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgYmVnaW5QYXRoXHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2VQYXRoIFdoZXRoZXIgdG8gZXhlY3V0ZSBjbG9zZVBhdGhcclxuICogQHJldHVybiB7VW5kZWZpbmVkfSBWb2lkXHJcbiAqL1xuZnVuY3Rpb24gZHJhd1BvbHlsaW5lUGF0aChjdHgsIHBvaW50cykge1xuICB2YXIgYmVnaW5QYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIGNsb3NlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG4gIGlmICghY3R4IHx8IHBvaW50cy5sZW5ndGggPCAyKSByZXR1cm4gZmFsc2U7XG4gIGlmIChiZWdpblBhdGgpIGN0eC5iZWdpblBhdGgoKTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKHBvaW50LCBpKSB7XG4gICAgcmV0dXJuIHBvaW50ICYmIChpID09PSAwID8gY3R4Lm1vdmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQpKSA6IGN0eC5saW5lVG8uYXBwbHkoY3R4LCAoMCwgX3RvQ29uc3VtYWJsZUFycmF5MltcImRlZmF1bHRcIl0pKHBvaW50KSkpO1xuICB9KTtcbiAgaWYgKGNsb3NlUGF0aCkgY3R4LmNsb3NlUGF0aCgpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEcmF3IGEgYmV6aWVyIGN1cnZlIHBhdGhcclxuICogQHBhcmFtIHtPYmplY3R9IGN0eCAgICAgICAgQ2FudmFzIDJkIGNvbnRleHRcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzICAgICAgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IG1vdmVUbyAgICAgIFRoZSBwb2ludCBuZWVkIHRvIGV4Y3V0ZSBtb3ZlVG9cclxuICogQHBhcmFtIHtCb29sZWFufSBiZWdpblBhdGggV2hldGhlciB0byBleGVjdXRlIGJlZ2luUGF0aFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlUGF0aCBXaGV0aGVyIHRvIGV4ZWN1dGUgY2xvc2VQYXRoXHJcbiAqIEByZXR1cm4ge1VuZGVmaW5lZH0gVm9pZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBkcmF3QmV6aWVyQ3VydmVQYXRoKGN0eCwgcG9pbnRzKSB7XG4gIHZhciBtb3ZlVG8gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICB2YXIgYmVnaW5QYXRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcbiAgdmFyIGNsb3NlUGF0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogZmFsc2U7XG4gIGlmICghY3R4IHx8ICFwb2ludHMpIHJldHVybiBmYWxzZTtcbiAgaWYgKGJlZ2luUGF0aCkgY3R4LmJlZ2luUGF0aCgpO1xuICBpZiAobW92ZVRvKSBjdHgubW92ZVRvLmFwcGx5KGN0eCwgKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtb3ZlVG8pKTtcbiAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbSAmJiBjdHguYmV6aWVyQ3VydmVUby5hcHBseShjdHgsICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbVswXSkuY29uY2F0KCgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbVsxXSksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkoaXRlbVsyXSkpKTtcbiAgfSk7XG4gIGlmIChjbG9zZVBhdGgpIGN0eC5jbG9zZVBhdGgoKTtcbn1cblxudmFyIF9kZWZhdWx0ID0ge1xuICBkcmF3UG9seWxpbmVQYXRoOiBkcmF3UG9seWxpbmVQYXRoLFxuICBkcmF3QmV6aWVyQ3VydmVQYXRoOiBkcmF3QmV6aWVyQ3VydmVQYXRoXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZXBDbG9uZSA9IGRlZXBDbG9uZTtcbmV4cG9ydHMuZWxpbWluYXRlQmx1ciA9IGVsaW1pbmF0ZUJsdXI7XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luQ2lyY2xlID0gY2hlY2tQb2ludElzSW5DaXJjbGU7XG5leHBvcnRzLmdldFR3b1BvaW50RGlzdGFuY2UgPSBnZXRUd29Qb2ludERpc3RhbmNlO1xuZXhwb3J0cy5jaGVja1BvaW50SXNJblBvbHlnb24gPSBjaGVja1BvaW50SXNJblBvbHlnb247XG5leHBvcnRzLmNoZWNrUG9pbnRJc0luU2VjdG9yID0gY2hlY2tQb2ludElzSW5TZWN0b3I7XG5leHBvcnRzLmNoZWNrUG9pbnRJc05lYXJQb2x5bGluZSA9IGNoZWNrUG9pbnRJc05lYXJQb2x5bGluZTtcbmV4cG9ydHMuY2hlY2tQb2ludElzSW5SZWN0ID0gY2hlY2tQb2ludElzSW5SZWN0O1xuZXhwb3J0cy5nZXRSb3RhdGVQb2ludFBvcyA9IGdldFJvdGF0ZVBvaW50UG9zO1xuZXhwb3J0cy5nZXRTY2FsZVBvaW50UG9zID0gZ2V0U2NhbGVQb2ludFBvcztcbmV4cG9ydHMuZ2V0VHJhbnNsYXRlUG9pbnRQb3MgPSBnZXRUcmFuc2xhdGVQb2ludFBvcztcbmV4cG9ydHMuZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lID0gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lO1xuZXhwb3J0cy5nZXRDaXJjbGVSYWRpYW5Qb2ludCA9IGdldENpcmNsZVJhZGlhblBvaW50O1xuZXhwb3J0cy5nZXRSZWd1bGFyUG9seWdvblBvaW50cyA9IGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfdG9Db25zdW1hYmxlQXJyYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90b0NvbnN1bWFibGVBcnJheVwiKSk7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBhYnMgPSBNYXRoLmFicyxcbiAgICBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgIHNpbiA9IE1hdGguc2luLFxuICAgIGNvcyA9IE1hdGguY29zLFxuICAgIG1heCA9IE1hdGgubWF4LFxuICAgIG1pbiA9IE1hdGgubWluLFxuICAgIFBJID0gTWF0aC5QSTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2xvbmUgYW4gb2JqZWN0IG9yIGFycmF5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmplY3QgQ2xvbmVkIG9iamVjdFxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHJlY3Vyc2lvbiAgIFdoZXRoZXIgdG8gdXNlIHJlY3Vyc2l2ZSBjbG9uaW5nXHJcbiAqIEByZXR1cm4ge09iamVjdHxBcnJheX0gQ2xvbmUgb2JqZWN0XHJcbiAqL1xuXG5mdW5jdGlvbiBkZWVwQ2xvbmUob2JqZWN0KSB7XG4gIHZhciByZWN1cnNpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICBpZiAoIW9iamVjdCkgcmV0dXJuIG9iamVjdDtcbiAgdmFyIHBhcnNlID0gSlNPTi5wYXJzZSxcbiAgICAgIHN0cmluZ2lmeSA9IEpTT04uc3RyaW5naWZ5O1xuICBpZiAoIXJlY3Vyc2lvbikgcmV0dXJuIHBhcnNlKHN0cmluZ2lmeShvYmplY3QpKTtcbiAgdmFyIGNsb25lZE9iaiA9IG9iamVjdCBpbnN0YW5jZW9mIEFycmF5ID8gW10gOiB7fTtcblxuICBpZiAob2JqZWN0ICYmICgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKG9iamVjdCkgPT09ICdvYmplY3QnKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGlmIChvYmplY3Rba2V5XSAmJiAoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShvYmplY3Rba2V5XSkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgY2xvbmVkT2JqW2tleV0gPSBkZWVwQ2xvbmUob2JqZWN0W2tleV0sIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsb25lZE9ialtrZXldID0gb2JqZWN0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gY2xvbmVkT2JqO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBFbGltaW5hdGUgbGluZSBibHVyIGR1ZSB0byAxcHggbGluZSB3aWR0aFxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludHMgTGluZSBwb2ludHNcclxuICogQHJldHVybiB7QXJyYXl9IExpbmUgcG9pbnRzIGFmdGVyIHByb2Nlc3NlZFxyXG4gKi9cblxuXG5mdW5jdGlvbiBlbGltaW5hdGVCbHVyKHBvaW50cykge1xuICByZXR1cm4gcG9pbnRzLm1hcChmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBfcmVmMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCAyKSxcbiAgICAgICAgeCA9IF9yZWYyWzBdLFxuICAgICAgICB5ID0gX3JlZjJbMV07XG5cbiAgICByZXR1cm4gW3BhcnNlSW50KHgpICsgMC41LCBwYXJzZUludCh5KSArIDAuNV07XG4gIH0pO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcnggICBDaXJjbGUgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByeSAgIENpcmNsZSB5IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgQ2lyY2xlIHJhZGl1c1xyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5DaXJjbGUocG9pbnQsIHJ4LCByeSwgcikge1xuICByZXR1cm4gZ2V0VHdvUG9pbnREaXN0YW5jZShwb2ludCwgW3J4LCByeV0pIDw9IHI7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50MSBwb2ludDFcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQyIHBvaW50MlxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUd29Qb2ludERpc3RhbmNlKF9yZWYzLCBfcmVmNCkge1xuICB2YXIgX3JlZjUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjMsIDIpLFxuICAgICAgeGEgPSBfcmVmNVswXSxcbiAgICAgIHlhID0gX3JlZjVbMV07XG5cbiAgdmFyIF9yZWY2ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWY0LCAyKSxcbiAgICAgIHhiID0gX3JlZjZbMF0sXG4gICAgICB5YiA9IF9yZWY2WzFdO1xuXG4gIHZhciBtaW51c1ggPSBhYnMoeGEgLSB4Yik7XG4gIHZhciBtaW51c1kgPSBhYnMoeWEgLSB5Yik7XG4gIHJldHVybiBzcXJ0KG1pbnVzWCAqIG1pbnVzWCArIG1pbnVzWSAqIG1pbnVzWSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHBvbHlnb25cclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnRzIFRoZSBwb2ludHMgdGhhdCBtYWtlcyB1cCBhIHBvbHlsaW5lXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pIHtcbiAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gIHZhciBfcG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludFswXSxcbiAgICAgIHkgPSBfcG9pbnRbMV07XG5cbiAgdmFyIHBvaW50TnVtID0gcG9seWdvbi5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDEsIHAxID0gcG9seWdvblswXTsgaSA8PSBwb2ludE51bTsgaSsrKSB7XG4gICAgdmFyIHAyID0gcG9seWdvbltpICUgcG9pbnROdW1dO1xuXG4gICAgaWYgKHggPiBtaW4ocDFbMF0sIHAyWzBdKSAmJiB4IDw9IG1heChwMVswXSwgcDJbMF0pKSB7XG4gICAgICBpZiAoeSA8PSBtYXgocDFbMV0sIHAyWzFdKSkge1xuICAgICAgICBpZiAocDFbMF0gIT09IHAyWzBdKSB7XG4gICAgICAgICAgdmFyIHhpbnRlcnMgPSAoeCAtIHAxWzBdKSAqIChwMlsxXSAtIHAxWzFdKSAvIChwMlswXSAtIHAxWzBdKSArIHAxWzFdO1xuXG4gICAgICAgICAgaWYgKHAxWzFdID09PSBwMlsxXSB8fCB5IDw9IHhpbnRlcnMpIHtcbiAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBwMSA9IHAyO1xuICB9XG5cbiAgcmV0dXJuIGNvdW50ZXIgJSAyID09PSAxO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBDaGVjayBpZiB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBzZWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcnggICAgICAgICBTZWN0b3IgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByeSAgICAgICAgIFNlY3RvciB5IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHIgICAgICAgICAgU2VjdG9yIHJhZGl1c1xyXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhcnRBbmdsZSBTZWN0b3Igc3RhcnQgYW5nbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGVuZEFuZ2xlICAgU2VjdG9yIGVuZCBhbmdsZVxyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGNsb2NrV2lzZSBXaGV0aGVyIHRoZSBzZWN0b3IgYW5nbGUgaXMgY2xvY2t3aXNlXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBjaGVja1BvaW50SXNJblNlY3Rvcihwb2ludCwgcngsIHJ5LCByLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgY2xvY2tXaXNlKSB7XG4gIGlmICghcG9pbnQpIHJldHVybiBmYWxzZTtcbiAgaWYgKGdldFR3b1BvaW50RGlzdGFuY2UocG9pbnQsIFtyeCwgcnldKSA+IHIpIHJldHVybiBmYWxzZTtcblxuICBpZiAoIWNsb2NrV2lzZSkge1xuICAgIHZhciBfZGVlcENsb25lID0gZGVlcENsb25lKFtlbmRBbmdsZSwgc3RhcnRBbmdsZV0pO1xuXG4gICAgdmFyIF9kZWVwQ2xvbmUyID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9kZWVwQ2xvbmUsIDIpO1xuXG4gICAgc3RhcnRBbmdsZSA9IF9kZWVwQ2xvbmUyWzBdO1xuICAgIGVuZEFuZ2xlID0gX2RlZXBDbG9uZTJbMV07XG4gIH1cblxuICB2YXIgcmV2ZXJzZUJFID0gc3RhcnRBbmdsZSA+IGVuZEFuZ2xlO1xuXG4gIGlmIChyZXZlcnNlQkUpIHtcbiAgICB2YXIgX3JlZjcgPSBbZW5kQW5nbGUsIHN0YXJ0QW5nbGVdO1xuICAgIHN0YXJ0QW5nbGUgPSBfcmVmN1swXTtcbiAgICBlbmRBbmdsZSA9IF9yZWY3WzFdO1xuICB9XG5cbiAgdmFyIG1pbnVzID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuICBpZiAobWludXMgPj0gUEkgKiAyKSByZXR1cm4gdHJ1ZTtcblxuICB2YXIgX3BvaW50MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShwb2ludCwgMiksXG4gICAgICB4ID0gX3BvaW50MlswXSxcbiAgICAgIHkgPSBfcG9pbnQyWzFdO1xuXG4gIHZhciBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQgPSBnZXRDaXJjbGVSYWRpYW5Qb2ludChyeCwgcnksIHIsIHN0YXJ0QW5nbGUpLFxuICAgICAgX2dldENpcmNsZVJhZGlhblBvaW50MiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQsIDIpLFxuICAgICAgYnggPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQyWzBdLFxuICAgICAgYnkgPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQyWzFdO1xuXG4gIHZhciBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQzID0gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQocngsIHJ5LCByLCBlbmRBbmdsZSksXG4gICAgICBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9nZXRDaXJjbGVSYWRpYW5Qb2ludDMsIDIpLFxuICAgICAgZXggPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ0WzBdLFxuICAgICAgZXkgPSBfZ2V0Q2lyY2xlUmFkaWFuUG9pbnQ0WzFdO1xuXG4gIHZhciB2UG9pbnQgPSBbeCAtIHJ4LCB5IC0gcnldO1xuICB2YXIgdkJBcm0gPSBbYnggLSByeCwgYnkgLSByeV07XG4gIHZhciB2RUFybSA9IFtleCAtIHJ4LCBleSAtIHJ5XTtcbiAgdmFyIHJldmVyc2UgPSBtaW51cyA+IFBJO1xuXG4gIGlmIChyZXZlcnNlKSB7XG4gICAgdmFyIF9kZWVwQ2xvbmUzID0gZGVlcENsb25lKFt2RUFybSwgdkJBcm1dKTtcblxuICAgIHZhciBfZGVlcENsb25lNCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfZGVlcENsb25lMywgMik7XG5cbiAgICB2QkFybSA9IF9kZWVwQ2xvbmU0WzBdO1xuICAgIHZFQXJtID0gX2RlZXBDbG9uZTRbMV07XG4gIH1cblxuICB2YXIgaW5TZWN0b3IgPSBpc0Nsb2NrV2lzZSh2QkFybSwgdlBvaW50KSAmJiAhaXNDbG9ja1dpc2UodkVBcm0sIHZQb2ludCk7XG4gIGlmIChyZXZlcnNlKSBpblNlY3RvciA9ICFpblNlY3RvcjtcbiAgaWYgKHJldmVyc2VCRSkgaW5TZWN0b3IgPSAhaW5TZWN0b3I7XG4gIHJldHVybiBpblNlY3Rvcjtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRGV0ZXJtaW5lIGlmIHRoZSBwb2ludCBpcyBpbiB0aGUgY2xvY2t3aXNlIGRpcmVjdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHZBcm0gICBWZWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gdlBvaW50IFBvaW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJlc3VsdCBvZiBjaGVja1xyXG4gKi9cblxuXG5mdW5jdGlvbiBpc0Nsb2NrV2lzZSh2QXJtLCB2UG9pbnQpIHtcbiAgdmFyIF92QXJtID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHZBcm0sIDIpLFxuICAgICAgYXggPSBfdkFybVswXSxcbiAgICAgIGF5ID0gX3ZBcm1bMV07XG5cbiAgdmFyIF92UG9pbnQgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkodlBvaW50LCAyKSxcbiAgICAgIHB4ID0gX3ZQb2ludFswXSxcbiAgICAgIHB5ID0gX3ZQb2ludFsxXTtcblxuICByZXR1cm4gLWF5ICogcHggKyBheCAqIHB5ID4gMDtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgcG9seWxpbmVcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICAgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlsaW5lICAgVGhlIHBvaW50cyB0aGF0IG1ha2VzIHVwIGEgcG9seWxpbmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbmVXaWR0aCBQb2x5bGluZSBsaW5ld2lkdGhcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmVzdWx0IG9mIGNoZWNrXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGNoZWNrUG9pbnRJc05lYXJQb2x5bGluZShwb2ludCwgcG9seWxpbmUsIGxpbmVXaWR0aCkge1xuICB2YXIgaGFsZkxpbmVXaWR0aCA9IGxpbmVXaWR0aCAvIDI7XG4gIHZhciBtb3ZlVXBQb2x5bGluZSA9IHBvbHlsaW5lLm1hcChmdW5jdGlvbiAoX3JlZjgpIHtcbiAgICB2YXIgX3JlZjkgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjgsIDIpLFxuICAgICAgICB4ID0gX3JlZjlbMF0sXG4gICAgICAgIHkgPSBfcmVmOVsxXTtcblxuICAgIHJldHVybiBbeCwgeSAtIGhhbGZMaW5lV2lkdGhdO1xuICB9KTtcbiAgdmFyIG1vdmVEb3duUG9seWxpbmUgPSBwb2x5bGluZS5tYXAoZnVuY3Rpb24gKF9yZWYxMCkge1xuICAgIHZhciBfcmVmMTEgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjEwLCAyKSxcbiAgICAgICAgeCA9IF9yZWYxMVswXSxcbiAgICAgICAgeSA9IF9yZWYxMVsxXTtcblxuICAgIHJldHVybiBbeCwgeSArIGhhbGZMaW5lV2lkdGhdO1xuICB9KTtcbiAgdmFyIHBvbHlnb24gPSBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShtb3ZlVXBQb2x5bGluZSksICgwLCBfdG9Db25zdW1hYmxlQXJyYXkyW1wiZGVmYXVsdFwiXSkobW92ZURvd25Qb2x5bGluZS5yZXZlcnNlKCkpKTtcbiAgcmV0dXJuIGNoZWNrUG9pbnRJc0luUG9seWdvbihwb2ludCwgcG9seWdvbik7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENoZWNrIGlmIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHJlY3RcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB4ICAgICAgUmVjdCBzdGFydCB4IGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgICAgICBSZWN0IHN0YXJ0IHkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGggIFJlY3Qgd2lkdGhcclxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodCBSZWN0IGhlaWdodFxyXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXN1bHQgb2YgY2hlY2tcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQb2ludElzSW5SZWN0KF9yZWYxMiwgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgX3JlZjEzID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYxMiwgMiksXG4gICAgICBweCA9IF9yZWYxM1swXSxcbiAgICAgIHB5ID0gX3JlZjEzWzFdO1xuXG4gIGlmIChweCA8IHgpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB5IDwgeSkgcmV0dXJuIGZhbHNlO1xuICBpZiAocHggPiB4ICsgd2lkdGgpIHJldHVybiBmYWxzZTtcbiAgaWYgKHB5ID4geSArIGhlaWdodCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgcm90YXRlZCBwb2ludFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcm90YXRlIERlZ3JlZSBvZiByb3RhdGlvblxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gb3JpZ2luICBSb3RhdGlvbiBjZW50ZXJcclxuICogQHBhcmFtIHtBcnJheX0gb3JpZ2luICBSb3RhdGlvbiBjZW50ZXJcclxuICogQHJldHVybiB7TnVtYmVyfSBDb29yZGluYXRlcyBhZnRlciByb3RhdGlvblxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSb3RhdGVQb2ludFBvcygpIHtcbiAgdmFyIHJvdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcbiAgdmFyIHBvaW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gIHZhciBvcmlnaW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IFswLCAwXTtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIGZhbHNlO1xuICBpZiAocm90YXRlICUgMzYwID09PSAwKSByZXR1cm4gcG9pbnQ7XG5cbiAgdmFyIF9wb2ludDMgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDNbMF0sXG4gICAgICB5ID0gX3BvaW50M1sxXTtcblxuICB2YXIgX29yaWdpbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShvcmlnaW4sIDIpLFxuICAgICAgb3ggPSBfb3JpZ2luWzBdLFxuICAgICAgb3kgPSBfb3JpZ2luWzFdO1xuXG4gIHJvdGF0ZSAqPSBQSSAvIDE4MDtcbiAgcmV0dXJuIFsoeCAtIG94KSAqIGNvcyhyb3RhdGUpIC0gKHkgLSBveSkgKiBzaW4ocm90YXRlKSArIG94LCAoeCAtIG94KSAqIHNpbihyb3RhdGUpICsgKHkgLSBveSkgKiBjb3Mocm90YXRlKSArIG95XTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc2NhbGVkIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHNjYWxlICBTY2FsZSBmYWN0b3JcclxuICogQHBhcmFtIHtBcnJheX0gcG9pbnQgIFBvc3Rpb24gb2YgcG9pbnRcclxuICogQHBhcmFtIHtBcnJheX0gb3JpZ2luIFNjYWxlIGNlbnRlclxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIGFmdGVyIHNjYWxlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFNjYWxlUG9pbnRQb3MoKSB7XG4gIHZhciBzY2FsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogWzEsIDFdO1xuICB2YXIgcG9pbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgdmFyIG9yaWdpbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogWzAsIDBdO1xuICBpZiAoIXBvaW50KSByZXR1cm4gZmFsc2U7XG4gIGlmIChzY2FsZSA9PT0gMSkgcmV0dXJuIHBvaW50O1xuXG4gIHZhciBfcG9pbnQ0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHBvaW50LCAyKSxcbiAgICAgIHggPSBfcG9pbnQ0WzBdLFxuICAgICAgeSA9IF9wb2ludDRbMV07XG5cbiAgdmFyIF9vcmlnaW4yID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKG9yaWdpbiwgMiksXG4gICAgICBveCA9IF9vcmlnaW4yWzBdLFxuICAgICAgb3kgPSBfb3JpZ2luMlsxXTtcblxuICB2YXIgX3NjYWxlID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKHNjYWxlLCAyKSxcbiAgICAgIHhzID0gX3NjYWxlWzBdLFxuICAgICAgeXMgPSBfc2NhbGVbMV07XG5cbiAgdmFyIHJlbGF0aXZlUG9zWCA9IHggLSBveDtcbiAgdmFyIHJlbGF0aXZlUG9zWSA9IHkgLSBveTtcbiAgcmV0dXJuIFtyZWxhdGl2ZVBvc1ggKiB4cyArIG94LCByZWxhdGl2ZVBvc1kgKiB5cyArIG95XTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgc2NhbGVkIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IHRyYW5zbGF0ZSBUcmFuc2xhdGlvbiBkaXN0YW5jZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBwb2ludCAgICAgUG9zdGlvbiBvZiBwb2ludFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IENvb3JkaW5hdGVzIGFmdGVyIHRyYW5zbGF0aW9uXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldFRyYW5zbGF0ZVBvaW50UG9zKHRyYW5zbGF0ZSwgcG9pbnQpIHtcbiAgaWYgKCF0cmFuc2xhdGUgfHwgIXBvaW50KSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIF9wb2ludDUgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDVbMF0sXG4gICAgICB5ID0gX3BvaW50NVsxXTtcblxuICB2YXIgX3RyYW5zbGF0ZSA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKSh0cmFuc2xhdGUsIDIpLFxuICAgICAgdHggPSBfdHJhbnNsYXRlWzBdLFxuICAgICAgdHkgPSBfdHJhbnNsYXRlWzFdO1xuXG4gIHJldHVybiBbeCArIHR4LCB5ICsgdHldO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHBvaW50IHRvIHRoZSBsaW5lXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ICAgICBQb3N0aW9uIG9mIHBvaW50XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGxpbmVCZWdpbiBMaW5lIHN0YXJ0IHBvc2l0aW9uXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGxpbmVFbmQgICBMaW5lIGVuZCBwb3NpdGlvblxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IERpc3RhbmNlIGJldHdlZW4gcG9pbnQgYW5kIGxpbmVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lKHBvaW50LCBsaW5lQmVnaW4sIGxpbmVFbmQpIHtcbiAgaWYgKCFwb2ludCB8fCAhbGluZUJlZ2luIHx8ICFsaW5lRW5kKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIF9wb2ludDYgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkocG9pbnQsIDIpLFxuICAgICAgeCA9IF9wb2ludDZbMF0sXG4gICAgICB5ID0gX3BvaW50NlsxXTtcblxuICB2YXIgX2xpbmVCZWdpbiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lQmVnaW4sIDIpLFxuICAgICAgeDEgPSBfbGluZUJlZ2luWzBdLFxuICAgICAgeTEgPSBfbGluZUJlZ2luWzFdO1xuXG4gIHZhciBfbGluZUVuZCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShsaW5lRW5kLCAyKSxcbiAgICAgIHgyID0gX2xpbmVFbmRbMF0sXG4gICAgICB5MiA9IF9saW5lRW5kWzFdO1xuXG4gIHZhciBhID0geTIgLSB5MTtcbiAgdmFyIGIgPSB4MSAtIHgyO1xuICB2YXIgYyA9IHkxICogKHgyIC0geDEpIC0geDEgKiAoeTIgLSB5MSk7XG4gIHZhciBtb2xlY3VsZSA9IGFicyhhICogeCArIGIgKiB5ICsgYyk7XG4gIHZhciBkZW5vbWluYXRvciA9IHNxcnQoYSAqIGEgKyBiICogYik7XG4gIHJldHVybiBtb2xlY3VsZSAvIGRlbm9taW5hdG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBzcGVjaWZpZWQgcmFkaWFuIG9uIHRoZSBjaXJjbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggICAgICBDaXJjbGUgeCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB5ICAgICAgQ2lyY2xlIHkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkaXVzIENpcmNsZSByYWRpdXNcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZGlhbiBTcGVjZmllZCByYWRpYW5cclxuICogQHJldHVybiB7QXJyYXl9IFBvc3Rpb24gb2YgcG9pbnRcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0Q2lyY2xlUmFkaWFuUG9pbnQoeCwgeSwgcmFkaXVzLCByYWRpYW4pIHtcbiAgcmV0dXJuIFt4ICsgY29zKHJhZGlhbikgKiByYWRpdXMsIHkgKyBzaW4ocmFkaWFuKSAqIHJhZGl1c107XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgcG9pbnRzIHRoYXQgbWFrZSB1cCBhIHJlZ3VsYXIgcG9seWdvblxyXG4gKiBAcGFyYW0ge051bWJlcn0geCAgICAgWCBjb29yZGluYXRlIG9mIHRoZSBwb2x5Z29uIGluc2NyaWJlZCBjaXJjbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgICAgIFkgY29vcmRpbmF0ZSBvZiB0aGUgcG9seWdvbiBpbnNjcmliZWQgY2lyY2xlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByICAgICBSYWRpdXMgb2YgdGhlIHBvbHlnb24gaW5zY3JpYmVkIGNpcmNsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2lkZSAgU2lkZSBudW1iZXJcclxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbnVzIFJhZGlhbiBvZmZzZXRcclxuICogQHJldHVybiB7QXJyYXl9IFBvaW50cyB0aGF0IG1ha2UgdXAgYSByZWd1bGFyIHBvbHlnb25cclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmVndWxhclBvbHlnb25Qb2ludHMocngsIHJ5LCByLCBzaWRlKSB7XG4gIHZhciBtaW51cyA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogUEkgKiAtMC41O1xuICB2YXIgcmFkaWFuR2FwID0gUEkgKiAyIC8gc2lkZTtcbiAgdmFyIHJhZGlhbnMgPSBuZXcgQXJyYXkoc2lkZSkuZmlsbCgnJykubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIGkgKiByYWRpYW5HYXAgKyBtaW51cztcbiAgfSk7XG4gIHJldHVybiByYWRpYW5zLm1hcChmdW5jdGlvbiAocmFkaWFuKSB7XG4gICAgcmV0dXJuIGdldENpcmNsZVJhZGlhblBvaW50KHJ4LCByeSwgciwgcmFkaWFuKTtcbiAgfSk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHtcbiAgZGVlcENsb25lOiBkZWVwQ2xvbmUsXG4gIGVsaW1pbmF0ZUJsdXI6IGVsaW1pbmF0ZUJsdXIsXG4gIGNoZWNrUG9pbnRJc0luQ2lyY2xlOiBjaGVja1BvaW50SXNJbkNpcmNsZSxcbiAgY2hlY2tQb2ludElzSW5Qb2x5Z29uOiBjaGVja1BvaW50SXNJblBvbHlnb24sXG4gIGNoZWNrUG9pbnRJc0luU2VjdG9yOiBjaGVja1BvaW50SXNJblNlY3RvcixcbiAgY2hlY2tQb2ludElzTmVhclBvbHlsaW5lOiBjaGVja1BvaW50SXNOZWFyUG9seWxpbmUsXG4gIGdldFR3b1BvaW50RGlzdGFuY2U6IGdldFR3b1BvaW50RGlzdGFuY2UsXG4gIGdldFJvdGF0ZVBvaW50UG9zOiBnZXRSb3RhdGVQb2ludFBvcyxcbiAgZ2V0U2NhbGVQb2ludFBvczogZ2V0U2NhbGVQb2ludFBvcyxcbiAgZ2V0VHJhbnNsYXRlUG9pbnRQb3M6IGdldFRyYW5zbGF0ZVBvaW50UG9zLFxuICBnZXRDaXJjbGVSYWRpYW5Qb2ludDogZ2V0Q2lyY2xlUmFkaWFuUG9pbnQsXG4gIGdldFJlZ3VsYXJQb2x5Z29uUG9pbnRzOiBnZXRSZWd1bGFyUG9seWdvblBvaW50cyxcbiAgZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRBbmRMaW5lOiBnZXREaXN0YW5jZUJldHdlZW5Qb2ludEFuZExpbmVcbn07XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfZGVmYXVsdCA9IG5ldyBNYXAoW1sndHJhbnNwYXJlbnQnLCAncmdiYSgwLDAsMCwwKSddLCBbJ2JsYWNrJywgJyMwMDAwMDAnXSwgWydzaWx2ZXInLCAnI0MwQzBDMCddLCBbJ2dyYXknLCAnIzgwODA4MCddLCBbJ3doaXRlJywgJyNGRkZGRkYnXSwgWydtYXJvb24nLCAnIzgwMDAwMCddLCBbJ3JlZCcsICcjRkYwMDAwJ10sIFsncHVycGxlJywgJyM4MDAwODAnXSwgWydmdWNoc2lhJywgJyNGRjAwRkYnXSwgWydncmVlbicsICcjMDA4MDAwJ10sIFsnbGltZScsICcjMDBGRjAwJ10sIFsnb2xpdmUnLCAnIzgwODAwMCddLCBbJ3llbGxvdycsICcjRkZGRjAwJ10sIFsnbmF2eScsICcjMDAwMDgwJ10sIFsnYmx1ZScsICcjMDAwMEZGJ10sIFsndGVhbCcsICcjMDA4MDgwJ10sIFsnYXF1YScsICcjMDBGRkZGJ10sIFsnYWxpY2VibHVlJywgJyNmMGY4ZmYnXSwgWydhbnRpcXVld2hpdGUnLCAnI2ZhZWJkNyddLCBbJ2FxdWFtYXJpbmUnLCAnIzdmZmZkNCddLCBbJ2F6dXJlJywgJyNmMGZmZmYnXSwgWydiZWlnZScsICcjZjVmNWRjJ10sIFsnYmlzcXVlJywgJyNmZmU0YzQnXSwgWydibGFuY2hlZGFsbW9uZCcsICcjZmZlYmNkJ10sIFsnYmx1ZXZpb2xldCcsICcjOGEyYmUyJ10sIFsnYnJvd24nLCAnI2E1MmEyYSddLCBbJ2J1cmx5d29vZCcsICcjZGViODg3J10sIFsnY2FkZXRibHVlJywgJyM1ZjllYTAnXSwgWydjaGFydHJldXNlJywgJyM3ZmZmMDAnXSwgWydjaG9jb2xhdGUnLCAnI2QyNjkxZSddLCBbJ2NvcmFsJywgJyNmZjdmNTAnXSwgWydjb3JuZmxvd2VyYmx1ZScsICcjNjQ5NWVkJ10sIFsnY29ybnNpbGsnLCAnI2ZmZjhkYyddLCBbJ2NyaW1zb24nLCAnI2RjMTQzYyddLCBbJ2N5YW4nLCAnIzAwZmZmZiddLCBbJ2RhcmtibHVlJywgJyMwMDAwOGInXSwgWydkYXJrY3lhbicsICcjMDA4YjhiJ10sIFsnZGFya2dvbGRlbnJvZCcsICcjYjg4NjBiJ10sIFsnZGFya2dyYXknLCAnI2E5YTlhOSddLCBbJ2RhcmtncmVlbicsICcjMDA2NDAwJ10sIFsnZGFya2dyZXknLCAnI2E5YTlhOSddLCBbJ2RhcmtraGFraScsICcjYmRiNzZiJ10sIFsnZGFya21hZ2VudGEnLCAnIzhiMDA4YiddLCBbJ2RhcmtvbGl2ZWdyZWVuJywgJyM1NTZiMmYnXSwgWydkYXJrb3JhbmdlJywgJyNmZjhjMDAnXSwgWydkYXJrb3JjaGlkJywgJyM5OTMyY2MnXSwgWydkYXJrcmVkJywgJyM4YjAwMDAnXSwgWydkYXJrc2FsbW9uJywgJyNlOTk2N2EnXSwgWydkYXJrc2VhZ3JlZW4nLCAnIzhmYmM4ZiddLCBbJ2RhcmtzbGF0ZWJsdWUnLCAnIzQ4M2Q4YiddLCBbJ2RhcmtzbGF0ZWdyYXknLCAnIzJmNGY0ZiddLCBbJ2RhcmtzbGF0ZWdyZXknLCAnIzJmNGY0ZiddLCBbJ2Rhcmt0dXJxdW9pc2UnLCAnIzAwY2VkMSddLCBbJ2Rhcmt2aW9sZXQnLCAnIzk0MDBkMyddLCBbJ2RlZXBwaW5rJywgJyNmZjE0OTMnXSwgWydkZWVwc2t5Ymx1ZScsICcjMDBiZmZmJ10sIFsnZGltZ3JheScsICcjNjk2OTY5J10sIFsnZGltZ3JleScsICcjNjk2OTY5J10sIFsnZG9kZ2VyYmx1ZScsICcjMWU5MGZmJ10sIFsnZmlyZWJyaWNrJywgJyNiMjIyMjInXSwgWydmbG9yYWx3aGl0ZScsICcjZmZmYWYwJ10sIFsnZm9yZXN0Z3JlZW4nLCAnIzIyOGIyMiddLCBbJ2dhaW5zYm9ybycsICcjZGNkY2RjJ10sIFsnZ2hvc3R3aGl0ZScsICcjZjhmOGZmJ10sIFsnZ29sZCcsICcjZmZkNzAwJ10sIFsnZ29sZGVucm9kJywgJyNkYWE1MjAnXSwgWydncmVlbnllbGxvdycsICcjYWRmZjJmJ10sIFsnZ3JleScsICcjODA4MDgwJ10sIFsnaG9uZXlkZXcnLCAnI2YwZmZmMCddLCBbJ2hvdHBpbmsnLCAnI2ZmNjliNCddLCBbJ2luZGlhbnJlZCcsICcjY2Q1YzVjJ10sIFsnaW5kaWdvJywgJyM0YjAwODInXSwgWydpdm9yeScsICcjZmZmZmYwJ10sIFsna2hha2knLCAnI2YwZTY4YyddLCBbJ2xhdmVuZGVyJywgJyNlNmU2ZmEnXSwgWydsYXZlbmRlcmJsdXNoJywgJyNmZmYwZjUnXSwgWydsYXduZ3JlZW4nLCAnIzdjZmMwMCddLCBbJ2xlbW9uY2hpZmZvbicsICcjZmZmYWNkJ10sIFsnbGlnaHRibHVlJywgJyNhZGQ4ZTYnXSwgWydsaWdodGNvcmFsJywgJyNmMDgwODAnXSwgWydsaWdodGN5YW4nLCAnI2UwZmZmZiddLCBbJ2xpZ2h0Z29sZGVucm9keWVsbG93JywgJyNmYWZhZDInXSwgWydsaWdodGdyYXknLCAnI2QzZDNkMyddLCBbJ2xpZ2h0Z3JlZW4nLCAnIzkwZWU5MCddLCBbJ2xpZ2h0Z3JleScsICcjZDNkM2QzJ10sIFsnbGlnaHRwaW5rJywgJyNmZmI2YzEnXSwgWydsaWdodHNhbG1vbicsICcjZmZhMDdhJ10sIFsnbGlnaHRzZWFncmVlbicsICcjMjBiMmFhJ10sIFsnbGlnaHRza3libHVlJywgJyM4N2NlZmEnXSwgWydsaWdodHNsYXRlZ3JheScsICcjNzc4ODk5J10sIFsnbGlnaHRzbGF0ZWdyZXknLCAnIzc3ODg5OSddLCBbJ2xpZ2h0c3RlZWxibHVlJywgJyNiMGM0ZGUnXSwgWydsaWdodHllbGxvdycsICcjZmZmZmUwJ10sIFsnbGltZWdyZWVuJywgJyMzMmNkMzInXSwgWydsaW5lbicsICcjZmFmMGU2J10sIFsnbWFnZW50YScsICcjZmYwMGZmJ10sIFsnbWVkaXVtYXF1YW1hcmluZScsICcjNjZjZGFhJ10sIFsnbWVkaXVtYmx1ZScsICcjMDAwMGNkJ10sIFsnbWVkaXVtb3JjaGlkJywgJyNiYTU1ZDMnXSwgWydtZWRpdW1wdXJwbGUnLCAnIzkzNzBkYiddLCBbJ21lZGl1bXNlYWdyZWVuJywgJyMzY2IzNzEnXSwgWydtZWRpdW1zbGF0ZWJsdWUnLCAnIzdiNjhlZSddLCBbJ21lZGl1bXNwcmluZ2dyZWVuJywgJyMwMGZhOWEnXSwgWydtZWRpdW10dXJxdW9pc2UnLCAnIzQ4ZDFjYyddLCBbJ21lZGl1bXZpb2xldHJlZCcsICcjYzcxNTg1J10sIFsnbWlkbmlnaHRibHVlJywgJyMxOTE5NzAnXSwgWydtaW50Y3JlYW0nLCAnI2Y1ZmZmYSddLCBbJ21pc3R5cm9zZScsICcjZmZlNGUxJ10sIFsnbW9jY2FzaW4nLCAnI2ZmZTRiNSddLCBbJ25hdmFqb3doaXRlJywgJyNmZmRlYWQnXSwgWydvbGRsYWNlJywgJyNmZGY1ZTYnXSwgWydvbGl2ZWRyYWInLCAnIzZiOGUyMyddLCBbJ29yYW5nZScsICcjZmZhNTAwJ10sIFsnb3JhbmdlcmVkJywgJyNmZjQ1MDAnXSwgWydvcmNoaWQnLCAnI2RhNzBkNiddLCBbJ3BhbGVnb2xkZW5yb2QnLCAnI2VlZThhYSddLCBbJ3BhbGVncmVlbicsICcjOThmYjk4J10sIFsncGFsZXR1cnF1b2lzZScsICcjYWZlZWVlJ10sIFsncGFsZXZpb2xldHJlZCcsICcjZGI3MDkzJ10sIFsncGFwYXlhd2hpcCcsICcjZmZlZmQ1J10sIFsncGVhY2hwdWZmJywgJyNmZmRhYjknXSwgWydwZXJ1JywgJyNjZDg1M2YnXSwgWydwaW5rJywgJyNmZmMwY2InXSwgWydwbHVtJywgJyNkZGEwZGQnXSwgWydwb3dkZXJibHVlJywgJyNiMGUwZTYnXSwgWydyb3N5YnJvd24nLCAnI2JjOGY4ZiddLCBbJ3JveWFsYmx1ZScsICcjNDE2OWUxJ10sIFsnc2FkZGxlYnJvd24nLCAnIzhiNDUxMyddLCBbJ3NhbG1vbicsICcjZmE4MDcyJ10sIFsnc2FuZHlicm93bicsICcjZjRhNDYwJ10sIFsnc2VhZ3JlZW4nLCAnIzJlOGI1NyddLCBbJ3NlYXNoZWxsJywgJyNmZmY1ZWUnXSwgWydzaWVubmEnLCAnI2EwNTIyZCddLCBbJ3NreWJsdWUnLCAnIzg3Y2VlYiddLCBbJ3NsYXRlYmx1ZScsICcjNmE1YWNkJ10sIFsnc2xhdGVncmF5JywgJyM3MDgwOTAnXSwgWydzbGF0ZWdyZXknLCAnIzcwODA5MCddLCBbJ3Nub3cnLCAnI2ZmZmFmYSddLCBbJ3NwcmluZ2dyZWVuJywgJyMwMGZmN2YnXSwgWydzdGVlbGJsdWUnLCAnIzQ2ODJiNCddLCBbJ3RhbicsICcjZDJiNDhjJ10sIFsndGhpc3RsZScsICcjZDhiZmQ4J10sIFsndG9tYXRvJywgJyNmZjYzNDcnXSwgWyd0dXJxdW9pc2UnLCAnIzQwZTBkMCddLCBbJ3Zpb2xldCcsICcjZWU4MmVlJ10sIFsnd2hlYXQnLCAnI2Y1ZGViMyddLCBbJ3doaXRlc21va2UnLCAnI2Y1ZjVmNSddLCBbJ3llbGxvd2dyZWVuJywgJyM5YWNkMzInXV0pO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2ludGVyb3BSZXF1aXJlRGVmYXVsdCA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL2ludGVyb3BSZXF1aXJlRGVmYXVsdFwiKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2V0UmdiVmFsdWUgPSBnZXRSZ2JWYWx1ZTtcbmV4cG9ydHMuZ2V0UmdiYVZhbHVlID0gZ2V0UmdiYVZhbHVlO1xuZXhwb3J0cy5nZXRPcGFjaXR5ID0gZ2V0T3BhY2l0eTtcbmV4cG9ydHMudG9SZ2IgPSB0b1JnYjtcbmV4cG9ydHMudG9IZXggPSB0b0hleDtcbmV4cG9ydHMuZ2V0Q29sb3JGcm9tUmdiVmFsdWUgPSBnZXRDb2xvckZyb21SZ2JWYWx1ZTtcbmV4cG9ydHMuZGFya2VuID0gZGFya2VuO1xuZXhwb3J0cy5saWdodGVuID0gbGlnaHRlbjtcbmV4cG9ydHMuZmFkZSA9IGZhZGU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHZvaWQgMDtcblxudmFyIF90b0NvbnN1bWFibGVBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3RvQ29uc3VtYWJsZUFycmF5XCIpKTtcblxudmFyIF9rZXl3b3JkcyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vY29uZmlnL2tleXdvcmRzXCIpKTtcblxudmFyIGhleFJlZyA9IC9eIyhbMC05YS1mQS1mXXszfXxbMC05YS1mQS1mXXs2fSkkLztcbnZhciByZ2JSZWcgPSAvXihyZ2J8cmdiYXxSR0J8UkdCQSkvO1xudmFyIHJnYmFSZWcgPSAvXihyZ2JhfFJHQkEpLztcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ29sb3IgdmFsaWRhdG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gVmFsaWQgY29sb3IgT3IgZmFsc2VcclxuICovXG5cbmZ1bmN0aW9uIHZhbGlkYXRvcihjb2xvcikge1xuICB2YXIgaXNIZXggPSBoZXhSZWcudGVzdChjb2xvcik7XG4gIHZhciBpc1JnYiA9IHJnYlJlZy50ZXN0KGNvbG9yKTtcbiAgaWYgKGlzSGV4IHx8IGlzUmdiKSByZXR1cm4gY29sb3I7XG4gIGNvbG9yID0gZ2V0Q29sb3JCeUtleXdvcmQoY29sb3IpO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDb2xvcjogSW52YWxpZCBjb2xvciEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gY29sb3I7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCBjb2xvciBieSBrZXl3b3JkXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXl3b3JkIENvbG9yIGtleXdvcmQgbGlrZSByZWQsIGdyZWVuIGFuZCBldGMuXHJcbiAqIEByZXR1cm4ge1N0cmluZ3xCb29sZWFufSBIZXggb3IgcmdiYSBjb2xvciAoSW52YWxpZCBrZXl3b3JkIHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRDb2xvckJ5S2V5d29yZChrZXl3b3JkKSB7XG4gIGlmICgha2V5d29yZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldENvbG9yQnlLZXl3b3JkczogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghX2tleXdvcmRzW1wiZGVmYXVsdFwiXS5oYXMoa2V5d29yZCkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIF9rZXl3b3Jkc1tcImRlZmF1bHRcIl0uZ2V0KGtleXdvcmQpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIFJnYiB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge0FycmF5PE51bWJlcj58Qm9vbGVhbn0gUmdiIHZhbHVlIG9mIHRoZSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiVmFsdWUoY29sb3IpIHtcbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2dldFJnYlZhbHVlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29sb3IgPSB2YWxpZGF0b3IoY29sb3IpO1xuICBpZiAoIWNvbG9yKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpc0hleCA9IGhleFJlZy50ZXN0KGNvbG9yKTtcbiAgdmFyIGlzUmdiID0gcmdiUmVnLnRlc3QoY29sb3IpO1xuICB2YXIgbG93ZXJDb2xvciA9IGNvbG9yLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChpc0hleCkgcmV0dXJuIGdldFJnYlZhbHVlRnJvbUhleChsb3dlckNvbG9yKTtcbiAgaWYgKGlzUmdiKSByZXR1cm4gZ2V0UmdiVmFsdWVGcm9tUmdiKGxvd2VyQ29sb3IpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHJnYiB2YWx1ZSBvZiB0aGUgaGV4IGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXggY29sb3JcclxuICogQHJldHVybiB7QXJyYXk8TnVtYmVyPn0gUmdiIHZhbHVlIG9mIHRoZSBjb2xvclxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRSZ2JWYWx1ZUZyb21IZXgoY29sb3IpIHtcbiAgY29sb3IgPSBjb2xvci5yZXBsYWNlKCcjJywgJycpO1xuICBpZiAoY29sb3IubGVuZ3RoID09PSAzKSBjb2xvciA9IEFycmF5LmZyb20oY29sb3IpLm1hcChmdW5jdGlvbiAoaGV4TnVtKSB7XG4gICAgcmV0dXJuIGhleE51bSArIGhleE51bTtcbiAgfSkuam9pbignJyk7XG4gIGNvbG9yID0gY29sb3Iuc3BsaXQoJycpO1xuICByZXR1cm4gbmV3IEFycmF5KDMpLmZpbGwoMCkubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KFwiMHhcIi5jb25jYXQoY29sb3JbaSAqIDJdKS5jb25jYXQoY29sb3JbaSAqIDIgKyAxXSkpO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSByZ2IgdmFsdWUgb2YgdGhlIHJnYi9yZ2JhIGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXggY29sb3JcclxuICogQHJldHVybiB7QXJyYXl9IFJnYiB2YWx1ZSBvZiB0aGUgY29sb3JcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiVmFsdWVGcm9tUmdiKGNvbG9yKSB7XG4gIHJldHVybiBjb2xvci5yZXBsYWNlKC9yZ2JcXCh8cmdiYVxcKHxcXCkvZywgJycpLnNwbGl0KCcsJykuc2xpY2UoMCwgMykubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIHBhcnNlSW50KG4pO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBSZ2JhIHZhbHVlIG9mIHRoZSBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7QXJyYXk8TnVtYmVyPnxCb29sZWFufSBSZ2JhIHZhbHVlIG9mIHRoZSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0UmdiYVZhbHVlKGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRSZ2JhVmFsdWU6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgY29sb3JWYWx1ZSA9IGdldFJnYlZhbHVlKGNvbG9yKTtcbiAgaWYgKCFjb2xvclZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIGNvbG9yVmFsdWUucHVzaChnZXRPcGFjaXR5KGNvbG9yKSk7XG4gIHJldHVybiBjb2xvclZhbHVlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIG9wYWNpdHkgb2YgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge051bWJlcnxCb29sZWFufSBDb2xvciBvcGFjaXR5IChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRPcGFjaXR5KGNvbG9yKSB7XG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRPcGFjaXR5OiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29sb3IgPSB2YWxpZGF0b3IoY29sb3IpO1xuICBpZiAoIWNvbG9yKSByZXR1cm4gZmFsc2U7XG4gIHZhciBpc1JnYmEgPSByZ2JhUmVnLnRlc3QoY29sb3IpO1xuICBpZiAoIWlzUmdiYSkgcmV0dXJuIDE7XG4gIGNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIE51bWJlcihjb2xvci5zcGxpdCgnLCcpLnNsaWNlKC0xKVswXS5yZXBsYWNlKC9bKXxcXHNdL2csICcnKSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENvbnZlcnQgY29sb3IgdG8gUmdifFJnYmEgY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yICAgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IG9wYWNpdHkgVGhlIG9wYWNpdHkgb2YgY29sb3JcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYnxSZ2JhIGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiB0b1JnYihjb2xvciwgb3BhY2l0eSkge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcigndG9SZ2I6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiVmFsdWUgPSBnZXRSZ2JWYWx1ZShjb2xvcik7XG4gIGlmICghcmdiVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgdmFyIGFkZE9wYWNpdHkgPSB0eXBlb2Ygb3BhY2l0eSA9PT0gJ251bWJlcic7XG4gIGlmIChhZGRPcGFjaXR5KSByZXR1cm4gJ3JnYmEoJyArIHJnYlZhbHVlLmpvaW4oJywnKSArIFwiLFwiLmNvbmNhdChvcGFjaXR5LCBcIilcIik7XG4gIHJldHVybiAncmdiKCcgKyByZ2JWYWx1ZS5qb2luKCcsJykgKyAnKSc7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIENvbnZlcnQgY29sb3IgdG8gSGV4IGNvbG9yXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBjb2xvciBIZXh8UmdifFJnYmEgY29sb3Igb3IgY29sb3Iga2V5d29yZFxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gSGV4IGNvbG9yIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuXG5mdW5jdGlvbiB0b0hleChjb2xvcikge1xuICBpZiAoIWNvbG9yKSB7XG4gICAgY29uc29sZS5lcnJvcigndG9IZXg6IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoaGV4UmVnLnRlc3QoY29sb3IpKSByZXR1cm4gY29sb3I7XG4gIGNvbG9yID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIWNvbG9yKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiAnIycgKyBjb2xvci5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gTnVtYmVyKG4pLnRvU3RyaW5nKDE2KTtcbiAgfSkubWFwKGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuIG4gPT09ICcwJyA/ICcwMCcgOiBuO1xuICB9KS5qb2luKCcnKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IENvbG9yIGZyb20gUmdifFJnYmEgdmFsdWVcclxuICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fSB2YWx1ZSBSZ2J8UmdiYSBjb2xvciB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdifFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldENvbG9yRnJvbVJnYlZhbHVlKHZhbHVlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRDb2xvckZyb21SZ2JWYWx1ZTogTWlzc2luZyBwYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciB2YWx1ZUxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcblxuICBpZiAodmFsdWVMZW5ndGggIT09IDMgJiYgdmFsdWVMZW5ndGggIT09IDQpIHtcbiAgICBjb25zb2xlLmVycm9yKCdnZXRDb2xvckZyb21SZ2JWYWx1ZTogVmFsdWUgaXMgaWxsZWdhbCEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgY29sb3IgPSB2YWx1ZUxlbmd0aCA9PT0gMyA/ICdyZ2IoJyA6ICdyZ2JhKCc7XG4gIGNvbG9yICs9IHZhbHVlLmpvaW4oJywnKSArICcpJztcbiAgcmV0dXJuIGNvbG9yO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBEZWVwZW4gY29sb3JcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yIEhleHxSZ2J8UmdiYSBjb2xvciBvciBjb2xvciBrZXl3b3JkXHJcbiAqIEByZXR1cm4ge051bWJlcn0gUGVyY2VudCBvZiBEZWVwZW4gKDEtMTAwKVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZGFya2VuKGNvbG9yKSB7XG4gIHZhciBwZXJjZW50ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdkYXJrZW46IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiYVZhbHVlID0gZ2V0UmdiYVZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JhVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgcmdiYVZhbHVlID0gcmdiYVZhbHVlLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiBpID09PSAzID8gdiA6IHYgLSBNYXRoLmNlaWwoMi41NSAqIHBlcmNlbnQpO1xuICB9KS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gdiA8IDAgPyAwIDogdjtcbiAgfSk7XG4gIHJldHVybiBnZXRDb2xvckZyb21SZ2JWYWx1ZShyZ2JhVmFsdWUpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBCcmlnaHRlbiBjb2xvclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gY29sb3IgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHJldHVybiB7TnVtYmVyfSBQZXJjZW50IG9mIGJyaWdodGVuICgxLTEwMClcclxuICogQHJldHVybiB7U3RyaW5nfEJvb2xlYW59IFJnYmEgY29sb3IgKEludmFsaWQgaW5wdXQgd2lsbCByZXR1cm4gZmFsc2UpXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGxpZ2h0ZW4oY29sb3IpIHtcbiAgdmFyIHBlcmNlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG5cbiAgaWYgKCFjb2xvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2xpZ2h0ZW46IE1pc3NpbmcgcGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcmdiYVZhbHVlID0gZ2V0UmdiYVZhbHVlKGNvbG9yKTtcbiAgaWYgKCFyZ2JhVmFsdWUpIHJldHVybiBmYWxzZTtcbiAgcmdiYVZhbHVlID0gcmdiYVZhbHVlLm1hcChmdW5jdGlvbiAodiwgaSkge1xuICAgIHJldHVybiBpID09PSAzID8gdiA6IHYgKyBNYXRoLmNlaWwoMi41NSAqIHBlcmNlbnQpO1xuICB9KS5tYXAoZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gdiA+IDI1NSA/IDI1NSA6IHY7XG4gIH0pO1xuICByZXR1cm4gZ2V0Q29sb3JGcm9tUmdiVmFsdWUocmdiYVZhbHVlKTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQWRqdXN0IGNvbG9yIG9wYWNpdHlcclxuICogQHBhcmFtIHtTdHJpbmd9IGNvbG9yICAgSGV4fFJnYnxSZ2JhIGNvbG9yIG9yIGNvbG9yIGtleXdvcmRcclxuICogQHBhcmFtIHtOdW1iZXJ9IFBlcmNlbnQgb2Ygb3BhY2l0eVxyXG4gKiBAcmV0dXJuIHtTdHJpbmd8Qm9vbGVhbn0gUmdiYSBjb2xvciAoSW52YWxpZCBpbnB1dCB3aWxsIHJldHVybiBmYWxzZSlcclxuICovXG5cblxuZnVuY3Rpb24gZmFkZShjb2xvcikge1xuICB2YXIgcGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMTAwO1xuXG4gIGlmICghY29sb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdmYWRlOiBNaXNzaW5nIHBhcmFtZXRlcnMhJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHJnYlZhbHVlID0gZ2V0UmdiVmFsdWUoY29sb3IpO1xuICBpZiAoIXJnYlZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIHZhciByZ2JhVmFsdWUgPSBbXS5jb25jYXQoKDAsIF90b0NvbnN1bWFibGVBcnJheTJbXCJkZWZhdWx0XCJdKShyZ2JWYWx1ZSksIFtwZXJjZW50IC8gMTAwXSk7XG4gIHJldHVybiBnZXRDb2xvckZyb21SZ2JWYWx1ZShyZ2JhVmFsdWUpO1xufVxuXG52YXIgX2RlZmF1bHQgPSB7XG4gIGZhZGU6IGZhZGUsXG4gIHRvSGV4OiB0b0hleCxcbiAgdG9SZ2I6IHRvUmdiLFxuICBkYXJrZW46IGRhcmtlbixcbiAgbGlnaHRlbjogbGlnaHRlbixcbiAgZ2V0T3BhY2l0eTogZ2V0T3BhY2l0eSxcbiAgZ2V0UmdiVmFsdWU6IGdldFJnYlZhbHVlLFxuICBnZXRSZ2JhVmFsdWU6IGdldFJnYmFWYWx1ZSxcbiAgZ2V0Q29sb3JGcm9tUmdiVmFsdWU6IGdldENvbG9yRnJvbVJnYlZhbHVlXG59O1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZXhwb3J0cy5lYXNlSW5PdXRCb3VuY2UgPSBleHBvcnRzLmVhc2VPdXRCb3VuY2UgPSBleHBvcnRzLmVhc2VJbkJvdW5jZSA9IGV4cG9ydHMuZWFzZUluT3V0RWxhc3RpYyA9IGV4cG9ydHMuZWFzZU91dEVsYXN0aWMgPSBleHBvcnRzLmVhc2VJbkVsYXN0aWMgPSBleHBvcnRzLmVhc2VJbk91dEJhY2sgPSBleHBvcnRzLmVhc2VPdXRCYWNrID0gZXhwb3J0cy5lYXNlSW5CYWNrID0gZXhwb3J0cy5lYXNlSW5PdXRRdWludCA9IGV4cG9ydHMuZWFzZU91dFF1aW50ID0gZXhwb3J0cy5lYXNlSW5RdWludCA9IGV4cG9ydHMuZWFzZUluT3V0UXVhcnQgPSBleHBvcnRzLmVhc2VPdXRRdWFydCA9IGV4cG9ydHMuZWFzZUluUXVhcnQgPSBleHBvcnRzLmVhc2VJbk91dEN1YmljID0gZXhwb3J0cy5lYXNlT3V0Q3ViaWMgPSBleHBvcnRzLmVhc2VJbkN1YmljID0gZXhwb3J0cy5lYXNlSW5PdXRRdWFkID0gZXhwb3J0cy5lYXNlT3V0UXVhZCA9IGV4cG9ydHMuZWFzZUluUXVhZCA9IGV4cG9ydHMuZWFzZUluT3V0U2luZSA9IGV4cG9ydHMuZWFzZU91dFNpbmUgPSBleHBvcnRzLmVhc2VJblNpbmUgPSBleHBvcnRzLmxpbmVhciA9IHZvaWQgMDtcbnZhciBsaW5lYXIgPSBbW1swLCAxXSwgJycsIFswLjMzLCAwLjY3XV0sIFtbMSwgMF0sIFswLjY3LCAwLjMzXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBTaW5lXHJcbiAqL1xuXG5leHBvcnRzLmxpbmVhciA9IGxpbmVhcjtcbnZhciBlYXNlSW5TaW5lID0gW1tbMCwgMV1dLCBbWzAuNTM4LCAwLjU2NF0sIFswLjE2OSwgMC45MTJdLCBbMC44ODAsIDAuMTk2XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluU2luZSA9IGVhc2VJblNpbmU7XG52YXIgZWFzZU91dFNpbmUgPSBbW1swLCAxXV0sIFtbMC40NDQsIDAuNDQ4XSwgWzAuMTY5LCAwLjczNl0sIFswLjcxOCwgMC4xNl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRTaW5lID0gZWFzZU91dFNpbmU7XG52YXIgZWFzZUluT3V0U2luZSA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjIsIDFdLCBbMC44LCAwXV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gUXVhZFxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRTaW5lID0gZWFzZUluT3V0U2luZTtcbnZhciBlYXNlSW5RdWFkID0gW1tbMCwgMV1dLCBbWzAuNTUwLCAwLjU4NF0sIFswLjIzMSwgMC45MDRdLCBbMC44NjgsIDAuMjY0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluUXVhZCA9IGVhc2VJblF1YWQ7XG52YXIgZWFzZU91dFF1YWQgPSBbW1swLCAxXV0sIFtbMC40MTMsIDAuNDI4XSwgWzAuMDY1LCAwLjgxNl0sIFswLjc2MCwgMC4wNF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRRdWFkID0gZWFzZU91dFF1YWQ7XG52YXIgZWFzZUluT3V0UXVhZCA9IFtbWzAsIDFdXSwgW1swLjUsIDAuNV0sIFswLjMsIDAuOV0sIFswLjcsIDAuMV1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEN1YmljXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dFF1YWQgPSBlYXNlSW5PdXRRdWFkO1xudmFyIGVhc2VJbkN1YmljID0gW1tbMCwgMV1dLCBbWzAuNjc5LCAwLjY4OF0sIFswLjM2NiwgMC45OTJdLCBbMC45OTIsIDAuMzg0XV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZUluQ3ViaWMgPSBlYXNlSW5DdWJpYztcbnZhciBlYXNlT3V0Q3ViaWMgPSBbW1swLCAxXV0sIFtbMC4zMjEsIDAuMzEyXSwgWzAuMDA4LCAwLjYxNl0sIFswLjYzNCwgMC4wMDhdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0Q3ViaWMgPSBlYXNlT3V0Q3ViaWM7XG52YXIgZWFzZUluT3V0Q3ViaWMgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC4zLCAxXSwgWzAuNywgMF1dLCBbWzEsIDBdXV07XG4vKipcclxuICogQGRlc2NyaXB0aW9uIFF1YXJ0XHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dEN1YmljID0gZWFzZUluT3V0Q3ViaWM7XG52YXIgZWFzZUluUXVhcnQgPSBbW1swLCAxXV0sIFtbMC44MTIsIDAuNzRdLCBbMC42MTEsIDAuOTg4XSwgWzEuMDEzLCAwLjQ5Ml1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblF1YXJ0ID0gZWFzZUluUXVhcnQ7XG52YXIgZWFzZU91dFF1YXJ0ID0gW1tbMCwgMV1dLCBbWzAuMTUyLCAwLjI0NF0sIFswLjAwMSwgMC40NDhdLCBbMC4yODUsIC0wLjAyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dFF1YXJ0ID0gZWFzZU91dFF1YXJ0O1xudmFyIGVhc2VJbk91dFF1YXJ0ID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuNCwgMV0sIFswLjYsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBRdWludFxyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRRdWFydCA9IGVhc2VJbk91dFF1YXJ0O1xudmFyIGVhc2VJblF1aW50ID0gW1tbMCwgMV1dLCBbWzAuODU3LCAwLjg1Nl0sIFswLjcxNCwgMV0sIFsxLCAwLjcxMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJblF1aW50ID0gZWFzZUluUXVpbnQ7XG52YXIgZWFzZU91dFF1aW50ID0gW1tbMCwgMV1dLCBbWzAuMTA4LCAwLjJdLCBbMC4wMDEsIDAuNF0sIFswLjIxNCwgLTAuMDEyXV0sIFtbMSwgMF1dXTtcbmV4cG9ydHMuZWFzZU91dFF1aW50ID0gZWFzZU91dFF1aW50O1xudmFyIGVhc2VJbk91dFF1aW50ID0gW1tbMCwgMV1dLCBbWzAuNSwgMC41XSwgWzAuNSwgMV0sIFswLjUsIDBdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBCYWNrXHJcbiAqL1xuXG5leHBvcnRzLmVhc2VJbk91dFF1aW50ID0gZWFzZUluT3V0UXVpbnQ7XG52YXIgZWFzZUluQmFjayA9IFtbWzAsIDFdXSwgW1swLjY2NywgMC44OTZdLCBbMC4zODAsIDEuMTg0XSwgWzAuOTU1LCAwLjYxNl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkJhY2sgPSBlYXNlSW5CYWNrO1xudmFyIGVhc2VPdXRCYWNrID0gW1tbMCwgMV1dLCBbWzAuMzM1LCAwLjAyOF0sIFswLjA2MSwgMC4yMl0sIFswLjYzMSwgLTAuMThdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlT3V0QmFjayA9IGVhc2VPdXRCYWNrO1xudmFyIGVhc2VJbk91dEJhY2sgPSBbW1swLCAxXV0sIFtbMC41LCAwLjVdLCBbMC40LCAxLjRdLCBbMC42LCAtMC40XV0sIFtbMSwgMF1dXTtcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gRWxhc3RpY1xyXG4gKi9cblxuZXhwb3J0cy5lYXNlSW5PdXRCYWNrID0gZWFzZUluT3V0QmFjaztcbnZhciBlYXNlSW5FbGFzdGljID0gW1tbMCwgMV1dLCBbWzAuNDc0LCAwLjk2NF0sIFswLjM4MiwgMC45ODhdLCBbMC41NTcsIDAuOTUyXV0sIFtbMC42MTksIDEuMDc2XSwgWzAuNTY1LCAxLjA4OF0sIFswLjY2OSwgMS4wOF1dLCBbWzAuNzcwLCAwLjkxNl0sIFswLjcxMiwgMC45MjRdLCBbMC44NDcsIDAuOTA0XV0sIFtbMC45MTEsIDEuMzA0XSwgWzAuODcyLCAxLjMxNl0sIFswLjk2MSwgMS4zNF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkVsYXN0aWMgPSBlYXNlSW5FbGFzdGljO1xudmFyIGVhc2VPdXRFbGFzdGljID0gW1tbMCwgMV1dLCBbWzAuMDczLCAtMC4zMl0sIFswLjAzNCwgLTAuMzI4XSwgWzAuMTA0LCAtMC4zNDRdXSwgW1swLjE5MSwgMC4wOTJdLCBbMC4xMTAsIDAuMDZdLCBbMC4yNTYsIDAuMDhdXSwgW1swLjMxMCwgLTAuMDc2XSwgWzAuMjYwLCAtMC4wNjhdLCBbMC4zNTcsIC0wLjA3Nl1dLCBbWzAuNDMyLCAwLjAzMl0sIFswLjM2MiwgMC4wMjhdLCBbMC42ODMsIC0wLjAwNF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRFbGFzdGljID0gZWFzZU91dEVsYXN0aWM7XG52YXIgZWFzZUluT3V0RWxhc3RpYyA9IFtbWzAsIDFdXSwgW1swLjIxMCwgMC45NF0sIFswLjE2NywgMC44ODRdLCBbMC4yNTIsIDAuOThdXSwgW1swLjI5OSwgMS4xMDRdLCBbMC4yNTYsIDEuMDkyXSwgWzAuMzQ3LCAxLjEwOF1dLCBbWzAuNSwgMC40OTZdLCBbMC40NTEsIDAuNjcyXSwgWzAuNTQ4LCAwLjMyNF1dLCBbWzAuNjk2LCAtMC4xMDhdLCBbMC42NTIsIC0wLjExMl0sIFswLjc0MSwgLTAuMTI0XV0sIFtbMC44MDUsIDAuMDY0XSwgWzAuNzU2LCAwLjAxMl0sIFswLjg2NiwgMC4wOTZdXSwgW1sxLCAwXV1dO1xuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBCb3VuY2VcclxuICovXG5cbmV4cG9ydHMuZWFzZUluT3V0RWxhc3RpYyA9IGVhc2VJbk91dEVsYXN0aWM7XG52YXIgZWFzZUluQm91bmNlID0gW1tbMCwgMV1dLCBbWzAuMTQ4LCAxXSwgWzAuMDc1LCAwLjg2OF0sIFswLjE5MywgMC44NDhdXSwgW1swLjMyNiwgMV0sIFswLjI3NiwgMC44MzZdLCBbMC40MDUsIDAuNzEyXV0sIFtbMC42MDAsIDFdLCBbMC41MTEsIDAuNzA4XSwgWzAuNjcxLCAwLjM0OF1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VJbkJvdW5jZSA9IGVhc2VJbkJvdW5jZTtcbnZhciBlYXNlT3V0Qm91bmNlID0gW1tbMCwgMV1dLCBbWzAuMzU3LCAwLjAwNF0sIFswLjI3MCwgMC41OTJdLCBbMC4zNzYsIDAuMjUyXV0sIFtbMC42MDQsIC0wLjAwNF0sIFswLjU0OCwgMC4zMTJdLCBbMC42NjksIDAuMTg0XV0sIFtbMC44MjAsIDBdLCBbMC43NDksIDAuMTg0XSwgWzAuOTA1LCAwLjEzMl1dLCBbWzEsIDBdXV07XG5leHBvcnRzLmVhc2VPdXRCb3VuY2UgPSBlYXNlT3V0Qm91bmNlO1xudmFyIGVhc2VJbk91dEJvdW5jZSA9IFtbWzAsIDFdXSwgW1swLjEwMiwgMV0sIFswLjA1MCwgMC44NjRdLCBbMC4xMTcsIDAuODZdXSwgW1swLjIxNiwgMC45OTZdLCBbMC4yMDgsIDAuODQ0XSwgWzAuMjI3LCAwLjgwOF1dLCBbWzAuMzQ3LCAwLjk5Nl0sIFswLjM0MywgMC44XSwgWzAuNDgwLCAwLjI5Ml1dLCBbWzAuNjM1LCAwLjAwNF0sIFswLjUxMSwgMC42NzZdLCBbMC42NTYsIDAuMjA4XV0sIFtbMC43ODcsIDBdLCBbMC43NjAsIDAuMl0sIFswLjc5NSwgMC4xNDRdXSwgW1swLjkwNSwgLTAuMDA0XSwgWzAuODk5LCAwLjE2NF0sIFswLjk0NCwgMC4xNDRdXSwgW1sxLCAwXV1dO1xuZXhwb3J0cy5lYXNlSW5PdXRCb3VuY2UgPSBlYXNlSW5PdXRCb3VuY2U7XG5cbnZhciBfZGVmYXVsdCA9IG5ldyBNYXAoW1snbGluZWFyJywgbGluZWFyXSwgWydlYXNlSW5TaW5lJywgZWFzZUluU2luZV0sIFsnZWFzZU91dFNpbmUnLCBlYXNlT3V0U2luZV0sIFsnZWFzZUluT3V0U2luZScsIGVhc2VJbk91dFNpbmVdLCBbJ2Vhc2VJblF1YWQnLCBlYXNlSW5RdWFkXSwgWydlYXNlT3V0UXVhZCcsIGVhc2VPdXRRdWFkXSwgWydlYXNlSW5PdXRRdWFkJywgZWFzZUluT3V0UXVhZF0sIFsnZWFzZUluQ3ViaWMnLCBlYXNlSW5DdWJpY10sIFsnZWFzZU91dEN1YmljJywgZWFzZU91dEN1YmljXSwgWydlYXNlSW5PdXRDdWJpYycsIGVhc2VJbk91dEN1YmljXSwgWydlYXNlSW5RdWFydCcsIGVhc2VJblF1YXJ0XSwgWydlYXNlT3V0UXVhcnQnLCBlYXNlT3V0UXVhcnRdLCBbJ2Vhc2VJbk91dFF1YXJ0JywgZWFzZUluT3V0UXVhcnRdLCBbJ2Vhc2VJblF1aW50JywgZWFzZUluUXVpbnRdLCBbJ2Vhc2VPdXRRdWludCcsIGVhc2VPdXRRdWludF0sIFsnZWFzZUluT3V0UXVpbnQnLCBlYXNlSW5PdXRRdWludF0sIFsnZWFzZUluQmFjaycsIGVhc2VJbkJhY2tdLCBbJ2Vhc2VPdXRCYWNrJywgZWFzZU91dEJhY2tdLCBbJ2Vhc2VJbk91dEJhY2snLCBlYXNlSW5PdXRCYWNrXSwgWydlYXNlSW5FbGFzdGljJywgZWFzZUluRWxhc3RpY10sIFsnZWFzZU91dEVsYXN0aWMnLCBlYXNlT3V0RWxhc3RpY10sIFsnZWFzZUluT3V0RWxhc3RpYycsIGVhc2VJbk91dEVsYXN0aWNdLCBbJ2Vhc2VJbkJvdW5jZScsIGVhc2VJbkJvdW5jZV0sIFsnZWFzZU91dEJvdW5jZScsIGVhc2VPdXRCb3VuY2VdLCBbJ2Vhc2VJbk91dEJvdW5jZScsIGVhc2VJbk91dEJvdW5jZV1dKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHRcIik7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uO1xuZXhwb3J0cy5pbmplY3ROZXdDdXJ2ZSA9IGluamVjdE5ld0N1cnZlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB2b2lkIDA7XG5cbnZhciBfc2xpY2VkVG9BcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3NsaWNlZFRvQXJyYXlcIikpO1xuXG52YXIgX3R5cGVvZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKSk7XG5cbnZhciBfY3VydmVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9jb25maWcvY3VydmVzXCIpKTtcblxudmFyIGRlZmF1bHRUcmFuc2l0aW9uQkMgPSAnbGluZWFyJztcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBOLWZyYW1lIGFuaW1hdGlvbiBzdGF0ZSBieSB0aGUgc3RhcnQgYW5kIGVuZCBzdGF0ZVxyXG4gKiAgICAgICAgICAgICAgb2YgdGhlIGFuaW1hdGlvbiBhbmQgdGhlIGVhc2luZyBjdXJ2ZVxyXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gdEJDICAgICAgICAgICAgICAgRWFzaW5nIGN1cnZlIG5hbWUgb3IgZGF0YVxyXG4gKiBAcGFyYW0ge051bWJlcnxBcnJheXxPYmplY3R9IHN0YXJ0U3RhdGUgQW5pbWF0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfEFycmF5fE9iamVjdH0gZW5kU3RhdGUgICBBbmltYXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBmcmFtZU51bSAgICAgICAgICAgICAgICBOdW1iZXIgb2YgQW5pbWF0aW9uIGZyYW1lc1xyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGRlZXAgICAgICAgICAgICAgICAgICAgV2hldGhlciB0byB1c2UgcmVjdXJzaXZlIG1vZGVcclxuICogQHJldHVybiB7QXJyYXl8Qm9vbGVhbn0gU3RhdGUgb2YgZWFjaCBmcmFtZSBvZiB0aGUgYW5pbWF0aW9uIChJbnZhbGlkIGlucHV0IHdpbGwgcmV0dXJuIGZhbHNlKVxyXG4gKi9cblxuZnVuY3Rpb24gdHJhbnNpdGlvbih0QkMpIHtcbiAgdmFyIHN0YXJ0U3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gIHZhciBlbmRTdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogbnVsbDtcbiAgdmFyIGZyYW1lTnVtID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAzMDtcbiAgdmFyIGRlZXAgPSBhcmd1bWVudHMubGVuZ3RoID4gNCAmJiBhcmd1bWVudHNbNF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1s0XSA6IGZhbHNlO1xuICBpZiAoIWNoZWNrUGFyYW1zLmFwcGx5KHZvaWQgMCwgYXJndW1lbnRzKSkgcmV0dXJuIGZhbHNlO1xuXG4gIHRyeSB7XG4gICAgLy8gR2V0IHRoZSB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxuICAgIHZhciBiZXppZXJDdXJ2ZSA9IGdldEJlemllckN1cnZlKHRCQyk7IC8vIEdldCB0aGUgcHJvZ3Jlc3Mgb2YgZWFjaCBmcmFtZSBzdGF0ZVxuXG4gICAgdmFyIGZyYW1lU3RhdGVQcm9ncmVzcyA9IGdldEZyYW1lU3RhdGVQcm9ncmVzcyhiZXppZXJDdXJ2ZSwgZnJhbWVOdW0pOyAvLyBJZiB0aGUgcmVjdXJzaW9uIG1vZGUgaXMgbm90IGVuYWJsZWQgb3IgdGhlIHN0YXRlIHR5cGUgaXMgTnVtYmVyLCB0aGUgc2hhbGxvdyBzdGF0ZSBjYWxjdWxhdGlvbiBpcyBwZXJmb3JtZWQgZGlyZWN0bHkuXG5cbiAgICBpZiAoIWRlZXAgfHwgdHlwZW9mIGVuZFN0YXRlID09PSAnbnVtYmVyJykgcmV0dXJuIGdldFRyYW5zaXRpb25TdGF0ZShzdGFydFN0YXRlLCBlbmRTdGF0ZSwgZnJhbWVTdGF0ZVByb2dyZXNzKTtcbiAgICByZXR1cm4gcmVjdXJzaW9uVHJhbnNpdGlvblN0YXRlKHN0YXJ0U3RhdGUsIGVuZFN0YXRlLCBmcmFtZVN0YXRlUHJvZ3Jlc3MpO1xuICB9IGNhdGNoIChfdW51c2VkKSB7XG4gICAgY29uc29sZS53YXJuKCdUcmFuc2l0aW9uIHBhcmFtZXRlciBtYXkgYmUgYWJub3JtYWwhJyk7XG4gICAgcmV0dXJuIFtlbmRTdGF0ZV07XG4gIH1cbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gQ2hlY2sgaWYgdGhlIHBhcmFtZXRlcnMgYXJlIGxlZ2FsXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0QkMgICAgICBOYW1lIG9mIHRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7QW55fSBzdGFydFN0YXRlICBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QW55fSBlbmRTdGF0ZSAgICBUcmFuc2l0aW9uIGVuZCBzdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZnJhbWVOdW0gTnVtYmVyIG9mIHRyYW5zaXRpb24gZnJhbWVzXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IElzIHRoZSBwYXJhbWV0ZXIgbGVnYWxcclxuICovXG5cblxuZnVuY3Rpb24gY2hlY2tQYXJhbXModEJDKSB7XG4gIHZhciBzdGFydFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgdmFyIGVuZFN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgdmFyIGZyYW1lTnVtID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiAzMDtcblxuICBpZiAoIXRCQyB8fCBzdGFydFN0YXRlID09PSBmYWxzZSB8fCBlbmRTdGF0ZSA9PT0gZmFsc2UgfHwgIWZyYW1lTnVtKSB7XG4gICAgY29uc29sZS5lcnJvcigndHJhbnNpdGlvbjogTWlzc2luZyBQYXJhbWV0ZXJzIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICgoMCwgX3R5cGVvZjJbXCJkZWZhdWx0XCJdKShzdGFydFN0YXRlKSAhPT0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZW5kU3RhdGUpKSB7XG4gICAgY29uc29sZS5lcnJvcigndHJhbnNpdGlvbjogSW5jb25zaXN0ZW50IFN0YXR1cyBUeXBlcyEnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgc3RhdGVUeXBlID0gKDAsIF90eXBlb2YyW1wiZGVmYXVsdFwiXSkoZW5kU3RhdGUpO1xuXG4gIGlmIChzdGF0ZVR5cGUgPT09ICdzdHJpbmcnIHx8IHN0YXRlVHlwZSA9PT0gJ2Jvb2xlYW4nIHx8ICF0QkMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5lcnJvcigndHJhbnNpdGlvbjogVW5zdXBwb3J0ZWQgRGF0YSBUeXBlIG9mIFN0YXRlIScpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghX2N1cnZlc1tcImRlZmF1bHRcIl0uaGFzKHRCQykgJiYgISh0QkMgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICBjb25zb2xlLndhcm4oJ3RyYW5zaXRpb246IFRyYW5zaXRpb24gY3VydmUgbm90IGZvdW5kLCBkZWZhdWx0IGN1cnZlIHdpbGwgYmUgdXNlZCEnKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSB0QkMgTmFtZSBvZiB0cmFuc2l0aW9uIGJlemllciBjdXJ2ZVxyXG4gKiBAcmV0dXJuIHtBcnJheX0gQmV6aWVyIGN1cnZlIGRhdGFcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmUodEJDKSB7XG4gIHZhciBiZXppZXJDdXJ2ZSA9ICcnO1xuXG4gIGlmIChfY3VydmVzW1wiZGVmYXVsdFwiXS5oYXModEJDKSkge1xuICAgIGJlemllckN1cnZlID0gX2N1cnZlc1tcImRlZmF1bHRcIl0uZ2V0KHRCQyk7XG4gIH0gZWxzZSBpZiAodEJDIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBiZXppZXJDdXJ2ZSA9IHRCQztcbiAgfSBlbHNlIHtcbiAgICBiZXppZXJDdXJ2ZSA9IF9jdXJ2ZXNbXCJkZWZhdWx0XCJdLmdldChkZWZhdWx0VHJhbnNpdGlvbkJDKTtcbiAgfVxuXG4gIHJldHVybiBiZXppZXJDdXJ2ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSBwcm9ncmVzcyBvZiBlYWNoIGZyYW1lIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBmcmFtZU51bSAgIE51bWJlciBvZiB0cmFuc2l0aW9uIGZyYW1lc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gUHJvZ3Jlc3Mgb2YgZWFjaCBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRGcmFtZVN0YXRlUHJvZ3Jlc3MoYmV6aWVyQ3VydmUsIGZyYW1lTnVtKSB7XG4gIHZhciB0TWludXMgPSAxIC8gKGZyYW1lTnVtIC0gMSk7XG4gIHZhciB0U3RhdGUgPSBuZXcgQXJyYXkoZnJhbWVOdW0pLmZpbGwoMCkubWFwKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIGkgKiB0TWludXM7XG4gIH0pO1xuICB2YXIgZnJhbWVTdGF0ZSA9IHRTdGF0ZS5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gZ2V0RnJhbWVTdGF0ZUZyb21UKGJlemllckN1cnZlLCB0KTtcbiAgfSk7XG4gIHJldHVybiBmcmFtZVN0YXRlO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIHByb2dyZXNzIG9mIHRoZSBjb3JyZXNwb25kaW5nIGZyYW1lIGFjY29yZGluZyB0byB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFByb2dyZXNzIG9mIGN1cnJlbnQgZnJhbWVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0RnJhbWVTdGF0ZUZyb21UKGJlemllckN1cnZlLCB0KSB7XG4gIHZhciB0QmV6aWVyQ3VydmVQb2ludCA9IGdldEJlemllckN1cnZlUG9pbnRGcm9tVChiZXppZXJDdXJ2ZSwgdCk7XG4gIHZhciBiZXppZXJDdXJ2ZVBvaW50VCA9IGdldEJlemllckN1cnZlUG9pbnRURnJvbVJlVCh0QmV6aWVyQ3VydmVQb2ludCwgdCk7XG4gIHJldHVybiBnZXRCZXppZXJDdXJ2ZVRTdGF0ZSh0QmV6aWVyQ3VydmVQb2ludCwgYmV6aWVyQ3VydmVQb2ludFQpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3ViLWN1cnZlIGFjY29yZGluZyB0byB0XHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJlemllckN1cnZlIFRyYW5zaXRpb24gYmV6aWVyIGN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtBcnJheX0gU3ViLWN1cnZlIG9mIHRcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QmV6aWVyQ3VydmVQb2ludEZyb21UKGJlemllckN1cnZlLCB0KSB7XG4gIHZhciBsYXN0SW5kZXggPSBiZXppZXJDdXJ2ZS5sZW5ndGggLSAxO1xuICB2YXIgYmVnaW4gPSAnJyxcbiAgICAgIGVuZCA9ICcnO1xuICBiZXppZXJDdXJ2ZS5maW5kSW5kZXgoZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICBpZiAoaSA9PT0gbGFzdEluZGV4KSByZXR1cm47XG4gICAgYmVnaW4gPSBpdGVtO1xuICAgIGVuZCA9IGJlemllckN1cnZlW2kgKyAxXTtcbiAgICB2YXIgY3VycmVudE1haW5Qb2ludFggPSBiZWdpblswXVswXTtcbiAgICB2YXIgbmV4dE1haW5Qb2ludFggPSBlbmRbMF1bMF07XG4gICAgcmV0dXJuIHQgPj0gY3VycmVudE1haW5Qb2ludFggJiYgdCA8IG5leHRNYWluUG9pbnRYO1xuICB9KTtcbiAgdmFyIHAwID0gYmVnaW5bMF07XG4gIHZhciBwMSA9IGJlZ2luWzJdIHx8IGJlZ2luWzBdO1xuICB2YXIgcDIgPSBlbmRbMV0gfHwgZW5kWzBdO1xuICB2YXIgcDMgPSBlbmRbMF07XG4gIHJldHVybiBbcDAsIHAxLCBwMiwgcDNdO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgbG9jYWwgdCBiYXNlZCBvbiB0IGFuZCBzdWItY3VydmVcclxuICogQHBhcmFtIHtBcnJheX0gYmV6aWVyQ3VydmUgU3ViLWN1cnZlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0ICAgICAgICAgIEN1cnJlbnQgZnJhbWUgdFxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGxvY2FsIHQgb2Ygc3ViLWN1cnZlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldEJlemllckN1cnZlUG9pbnRURnJvbVJlVChiZXppZXJDdXJ2ZSwgdCkge1xuICB2YXIgcmVCZWdpblggPSBiZXppZXJDdXJ2ZVswXVswXTtcbiAgdmFyIHJlRW5kWCA9IGJlemllckN1cnZlWzNdWzBdO1xuICB2YXIgeE1pbnVzID0gcmVFbmRYIC0gcmVCZWdpblg7XG4gIHZhciB0TWludXMgPSB0IC0gcmVCZWdpblg7XG4gIHJldHVybiB0TWludXMgLyB4TWludXM7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgY3VydmUgcHJvZ3Jlc3Mgb2YgdFxyXG4gKiBAcGFyYW0ge0FycmF5fSBiZXppZXJDdXJ2ZSBTdWItY3VydmVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHQgICAgICAgICAgQ3VycmVudCBmcmFtZSB0XHJcbiAqIEByZXR1cm4ge051bWJlcn0gUHJvZ3Jlc3Mgb2YgY3VycmVudCBmcmFtZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRCZXppZXJDdXJ2ZVRTdGF0ZShfcmVmLCB0KSB7XG4gIHZhciBfcmVmMiA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmLCA0KSxcbiAgICAgIF9yZWYyJCA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlswXSwgMiksXG4gICAgICBwMCA9IF9yZWYyJFsxXSxcbiAgICAgIF9yZWYyJDIgPSAoMCwgX3NsaWNlZFRvQXJyYXkyW1wiZGVmYXVsdFwiXSkoX3JlZjJbMV0sIDIpLFxuICAgICAgcDEgPSBfcmVmMiQyWzFdLFxuICAgICAgX3JlZjIkMyA9ICgwLCBfc2xpY2VkVG9BcnJheTJbXCJkZWZhdWx0XCJdKShfcmVmMlsyXSwgMiksXG4gICAgICBwMiA9IF9yZWYyJDNbMV0sXG4gICAgICBfcmVmMiQ0ID0gKDAsIF9zbGljZWRUb0FycmF5MltcImRlZmF1bHRcIl0pKF9yZWYyWzNdLCAyKSxcbiAgICAgIHAzID0gX3JlZjIkNFsxXTtcblxuICB2YXIgcG93ID0gTWF0aC5wb3c7XG4gIHZhciB0TWludXMgPSAxIC0gdDtcbiAgdmFyIHJlc3VsdDEgPSBwMCAqIHBvdyh0TWludXMsIDMpO1xuICB2YXIgcmVzdWx0MiA9IDMgKiBwMSAqIHQgKiBwb3codE1pbnVzLCAyKTtcbiAgdmFyIHJlc3VsdDMgPSAzICogcDIgKiBwb3codCwgMikgKiB0TWludXM7XG4gIHZhciByZXN1bHQ0ID0gcDMgKiBwb3codCwgMyk7XG4gIHJldHVybiAxIC0gKHJlc3VsdDEgKyByZXN1bHQyICsgcmVzdWx0MyArIHJlc3VsdDQpO1xufVxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiBHZXQgdHJhbnNpdGlvbiBzdGF0ZSBhY2NvcmRpbmcgdG8gZnJhbWUgcHJvZ3Jlc3NcclxuICogQHBhcmFtIHtBbnl9IHN0YXJ0U3RhdGUgICBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7QW55fSBlbmRTdGF0ZSAgICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSBGcmFtZSBzdGF0ZSBwcm9ncmVzc1xyXG4gKiBAcmV0dXJuIHtBcnJheX0gVHJhbnNpdGlvbiBmcmFtZSBzdGF0ZVxyXG4gKi9cblxuXG5mdW5jdGlvbiBnZXRUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIgc3RhdGVUeXBlID0gJ29iamVjdCc7XG4gIGlmICh0eXBlb2YgYmVnaW4gPT09ICdudW1iZXInKSBzdGF0ZVR5cGUgPSAnbnVtYmVyJztcbiAgaWYgKGJlZ2luIGluc3RhbmNlb2YgQXJyYXkpIHN0YXRlVHlwZSA9ICdhcnJheSc7XG4gIGlmIChzdGF0ZVR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gZ2V0TnVtYmVyVHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuICBpZiAoc3RhdGVUeXBlID09PSAnYXJyYXknKSByZXR1cm4gZ2V0QXJyYXlUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSk7XG4gIGlmIChzdGF0ZVR5cGUgPT09ICdvYmplY3QnKSByZXR1cm4gZ2V0T2JqZWN0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuICByZXR1cm4gZnJhbWVTdGF0ZS5tYXAoZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gZW5kO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIGRhdGEgb2YgdGhlIG51bWJlciB0eXBlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGVuZFN0YXRlICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSAgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0TnVtYmVyVHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIG1pbnVzID0gZW5kIC0gYmVnaW47XG4gIHJldHVybiBmcmFtZVN0YXRlLm1hcChmdW5jdGlvbiAocykge1xuICAgIHJldHVybiBiZWdpbiArIG1pbnVzICogcztcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBkYXRhIG9mIHRoZSBhcnJheSB0eXBlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0U3RhdGUgVHJhbnNpdGlvbiBzdGFydCBzdGF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gZ2V0QXJyYXlUcmFuc2l0aW9uU3RhdGUoYmVnaW4sIGVuZCwgZnJhbWVTdGF0ZSkge1xuICB2YXIgbWludXMgPSBlbmQubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB2IC0gYmVnaW5baV07XG4gIH0pO1xuICByZXR1cm4gZnJhbWVTdGF0ZS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICByZXR1cm4gbWludXMubWFwKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICBpZiAodiA9PT0gZmFsc2UpIHJldHVybiBlbmRbaV07XG4gICAgICByZXR1cm4gYmVnaW5baV0gKyB2ICogcztcbiAgICB9KTtcbiAgfSk7XG59XG4vKipcclxuICogQGRlc2NyaXB0aW9uIEdldCB0aGUgdHJhbnNpdGlvbiBkYXRhIG9mIHRoZSBvYmplY3QgdHlwZVxyXG4gKiBAcGFyYW0ge09iamVjdH0gc3RhcnRTdGF0ZSBUcmFuc2l0aW9uIHN0YXJ0IHN0YXRlXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbmRTdGF0ZSAgIFRyYW5zaXRpb24gZW5kIHN0YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGZyYW1lU3RhdGUgIEZyYW1lIHN0YXRlIHByb2dyZXNzXHJcbiAqIEByZXR1cm4ge0FycmF5fSBUcmFuc2l0aW9uIGZyYW1lIHN0YXRlXHJcbiAqL1xuXG5cbmZ1bmN0aW9uIGdldE9iamVjdFRyYW5zaXRpb25TdGF0ZShiZWdpbiwgZW5kLCBmcmFtZVN0YXRlKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZW5kKTtcbiAgdmFyIGJlZ2luVmFsdWUgPSBrZXlzLm1hcChmdW5jdGlvbiAoaykge1xuICAgIHJldHVybiBiZWdpbltrXTtcbiAgfSk7XG4gIHZhciBlbmRWYWx1ZSA9IGtleXMubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgcmV0dXJuIGVuZFtrXTtcbiAgfSk7XG4gIHZhciBhcnJheVN0YXRlID0gZ2V0QXJyYXlUcmFuc2l0aW9uU3RhdGUoYmVnaW5WYWx1ZSwgZW5kVmFsdWUsIGZyYW1lU3RhdGUpO1xuICByZXR1cm4gYXJyYXlTdGF0ZS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICB2YXIgZnJhbWVEYXRhID0ge307XG4gICAgaXRlbS5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICByZXR1cm4gZnJhbWVEYXRhW2tleXNbaV1dID0gdjtcbiAgICB9KTtcbiAgICByZXR1cm4gZnJhbWVEYXRhO1xuICB9KTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gR2V0IHRoZSB0cmFuc2l0aW9uIHN0YXRlIGRhdGEgYnkgcmVjdXJzaW9uXHJcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBzdGFydFN0YXRlIFRyYW5zaXRpb24gc3RhcnQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGVuZFN0YXRlICAgVHJhbnNpdGlvbiBlbmQgc3RhdGVcclxuICogQHBhcmFtIHtBcnJheX0gZnJhbWVTdGF0ZSAgICAgICAgRnJhbWUgc3RhdGUgcHJvZ3Jlc3NcclxuICogQHJldHVybiB7QXJyYXl9IFRyYW5zaXRpb24gZnJhbWUgc3RhdGVcclxuICovXG5cblxuZnVuY3Rpb24gcmVjdXJzaW9uVHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpIHtcbiAgdmFyIHN0YXRlID0gZ2V0VHJhbnNpdGlvblN0YXRlKGJlZ2luLCBlbmQsIGZyYW1lU3RhdGUpO1xuXG4gIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKGtleSkge1xuICAgIHZhciBiVGVtcCA9IGJlZ2luW2tleV07XG4gICAgdmFyIGVUZW1wID0gZW5kW2tleV07XG4gICAgaWYgKCgwLCBfdHlwZW9mMltcImRlZmF1bHRcIl0pKGVUZW1wKSAhPT0gJ29iamVjdCcpIHJldHVybiBcImNvbnRpbnVlXCI7XG4gICAgdmFyIGRhdGEgPSByZWN1cnNpb25UcmFuc2l0aW9uU3RhdGUoYlRlbXAsIGVUZW1wLCBmcmFtZVN0YXRlKTtcbiAgICBzdGF0ZS5mb3JFYWNoKGZ1bmN0aW9uIChmcywgaSkge1xuICAgICAgcmV0dXJuIGZzW2tleV0gPSBkYXRhW2ldO1xuICAgIH0pO1xuICB9O1xuXG4gIGZvciAodmFyIGtleSBpbiBlbmQpIHtcbiAgICB2YXIgX3JldCA9IF9sb29wKGtleSk7XG5cbiAgICBpZiAoX3JldCA9PT0gXCJjb250aW51ZVwiKSBjb250aW51ZTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZTtcbn1cbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gSW5qZWN0IG5ldyBjdXJ2ZSBpbnRvIGN1cnZlcyBhcyBjb25maWdcclxuICogQHBhcmFtIHtBbnl9IGtleSAgICAgVGhlIGtleSBvZiBjdXJ2ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBjdXJ2ZSBCZXppZXIgY3VydmUgZGF0YVxyXG4gKiBAcmV0dXJuIHtVbmRlZmluZWR9IE5vIHJldHVyblxyXG4gKi9cblxuXG5mdW5jdGlvbiBpbmplY3ROZXdDdXJ2ZShrZXksIGN1cnZlKSB7XG4gIGlmICgha2V5IHx8ICFjdXJ2ZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0luamVjdE5ld0N1cnZlIE1pc3NpbmcgUGFyYW1ldGVycyEnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBfY3VydmVzW1wiZGVmYXVsdFwiXS5zZXQoa2V5LCBjdXJ2ZSk7XG59XG5cbnZhciBfZGVmYXVsdCA9IHRyYW5zaXRpb247XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9kZWZhdWx0OyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZVt0b1N0cmluZ1RhZ1N5bWJvbF0gPVxuICAgIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIGV4cG9ydHMubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgaWYgKCEodG9TdHJpbmdUYWdTeW1ib2wgaW4gZ2VuRnVuKSkge1xuICAgICAgICBnZW5GdW5bdG9TdHJpbmdUYWdTeW1ib2xdID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuICAgICAgfVxuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBHcFt0b1N0cmluZ1RhZ1N5bWJvbF0gPSBcIkdlbmVyYXRvclwiO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xufVxuIl19
