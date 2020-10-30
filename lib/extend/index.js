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

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
    toFixed: 0,
    rowGap: 0,
    formatter: null
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
        rowGap = shape.rowGap,
        formatter = shape.formatter;
    var textSegments = content.split('{nt}');
    var textString = '';
    textSegments.forEach(function (t, i) {
      var currentNumber = number[i];
      if (typeof currentNumber !== 'number') currentNumber = '';

      if (typeof currentNumber === 'number') {
        currentNumber = currentNumber.toFixed(toFixed);
        if (typeof formatter === 'function') currentNumber = formatter(currentNumber);
      }

      textString += t + (currentNumber || '');
    });

    _graphs.text.draw({
      ctx: ctx
    }, {
      shape: _objectSpread(_objectSpread({}, shape), {}, {
        content: textString,
        rowGap: rowGap
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