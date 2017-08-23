'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactNative = require('react-native');

//eslint-disable-line

exports.default = function (callback) {
  var wasOnline = void 0;
  var updateState = function updateState(isOnline) {
    if (wasOnline !== isOnline) {
      wasOnline = isOnline;
      callback(isOnline);
    }
  };

  _reactNative.NetInfo.isConnected.addEventListener('change', updateState);
  _reactNative.NetInfo.isConnected.fetch().then(updateState);
  _reactNative.AppState.addEventListener('change', function () {
    _reactNative.NetInfo.isConnected.fetch().then(updateState);
  });
};