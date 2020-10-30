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

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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