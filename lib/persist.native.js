'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.persist = undefined;

var _reactNative = require('react-native');

var _reduxPersist = require('redux-persist');

var persist = exports.persist = function persist(store) {
  return (0, _reduxPersist.persistStore)(store, { storage: _reactNative.AsyncStorage });
};