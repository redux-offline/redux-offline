'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var babelPluginFlowReactPropTypes_proptype_OfflineAction = require('../types').babelPluginFlowReactPropTypes_proptype_OfflineAction || require('react').PropTypes.any;
/*global fetch*/

exports.default = function (effect, _action) {
  var url = effect.url,
      options = _objectWithoutProperties(effect, ['url']);

  return fetch(url, options);
};