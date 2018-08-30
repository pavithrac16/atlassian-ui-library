'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('../../es5/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditorWarningIcon = function EditorWarningIcon(props) {
  return _react2.default.createElement(_index2.default, _extends({ dangerouslySetGlyph: '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation"><path d="M13.31 5.343l7.359 13.17A1 1 0 0 1 19.796 20H4.204a1 1 0 0 1-.873-1.488l7.36-13.169a1.5 1.5 0 0 1 2.618 0zM12 8.5a1.091 1.091 0 0 0-1.081 1.239l.513 3.766a.573.573 0 0 0 1.136 0l.513-3.766A1.091 1.091 0 0 0 12 8.5zm0 8.63a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25z" fill="currentColor" fill-rule="evenodd"/></svg>' }, props));
};
EditorWarningIcon.displayName = 'EditorWarningIcon';
exports.default = EditorWarningIcon;