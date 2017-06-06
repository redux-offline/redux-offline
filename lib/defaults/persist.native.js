'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

//$FlowIgnore
//eslint-disable-line import/no-unresolved


var _reactNative = require('react-native');

var _reduxPersist = require('redux-persist');

exports.default = function (store, options, callback) {
  return (0, _reduxPersist.persistStore)(store, _extends({ storage: _reactNative.AsyncStorage }, options), callback);
};