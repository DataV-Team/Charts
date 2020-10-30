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

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
    return _objectSpread(_objectSpread({}, lineItem), {}, {
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
  style = _objectSpread(_objectSpread({}, style), {}, {
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