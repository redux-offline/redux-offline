'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.persist = undefined;

var _reduxPersist = require('redux-persist');

var persist = exports.persist = function persist(store) {
  return (0, _reduxPersist.persistStore)(store);
};