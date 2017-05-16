'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyDefaults = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global $Shape*/
var applyDefaults = exports.applyDefaults = function applyDefaults() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return _extends({}, _defaults2.default, config);
};