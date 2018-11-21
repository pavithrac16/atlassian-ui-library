"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _index = _interopRequireDefault(require("../../cjs/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var EditorAlignLeftIcon = function EditorAlignLeftIcon(props) {
  return _react.default.createElement(_index.default, _extends({
    dangerouslySetGlyph: "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" focusable=\"false\" role=\"presentation\"><path d=\"M7 7h10a1 1 0 0 1 0 2H7a1 1 0 1 1 0-2zm0 4h10a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2zm0 4h5a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>"
  }, props));
};

EditorAlignLeftIcon.displayName = 'EditorAlignLeftIcon';
var _default = EditorAlignLeftIcon;
exports.default = _default;