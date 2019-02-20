"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _Icon = _interopRequireDefault(require("../../cjs/components/Icon"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var Generic48Icon = function Generic48Icon(props) {
  return _react.default.createElement(_Icon.default, _extends({
    dangerouslySetGlyph: "<svg width=\"48\" height=\"64\" viewBox=\"0 0 48 64\" focusable=\"false\" role=\"presentation\"><g fill-rule=\"evenodd\"><path fill=\"#FFF\" stroke=\"#091E42\" stroke-opacity=\".08\" d=\"M4 .5h28.007a3.5 3.5 0 0 1 2.52 1.072l11.994 12.45a3.5 3.5 0 0 1 .979 2.429V60a3.5 3.5 0 0 1-3.5 3.5H4A3.5 3.5 0 0 1 .5 60V4A3.5 3.5 0 0 1 4 .5z\"/><path fill=\"#5E6C84\" d=\"M24 22.667h1.528a2 2 0 0 1 1.42.59l3.907 3.938a.5.5 0 0 1 .145.352v1.62a.5.5 0 0 1-.5.5H26a2 2 0 0 1-2-2V25h-4.667v14h9.334v-8.16H31V39a2.333 2.333 0 0 1-2.333 2.334h-9.334A2.333 2.333 0 0 1 17 39V25a2.333 2.333 0 0 1 2.333-2.333H24z\"/></g></svg>"
  }, props, {
    size: "xlarge"
  }));
};

Generic48Icon.displayName = 'Generic48Icon';
var _default = Generic48Icon;
exports.default = _default;