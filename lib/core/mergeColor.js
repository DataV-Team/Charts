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