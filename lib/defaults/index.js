'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _persist = require('./persist');

var _persist2 = _interopRequireDefault(_persist);

var _detectNetwork = require('./detectNetwork');

var _detectNetwork2 = _interopRequireDefault(_detectNetwork);

var _effect = require('./effect');

var _effect2 = _interopRequireDefault(_effect);

var _batch = require('./batch');

var _batch2 = _interopRequireDefault(_batch);

var _retry = require('./retry');

var _retry2 = _interopRequireDefault(_retry);

var _discard = require('./discard');

var _discard2 = _interopRequireDefault(_discard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  rehydrate: true,
  persist: _persist2.default,
  detectNetwork: _detectNetwork2.default,
  batch: _batch2.default,
  effect: _effect2.default,
  retry: _retry2.default,
  discard: _discard2.default
};