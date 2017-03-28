'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var babelPluginFlowReactPropTypes_proptype_Outbox = require('../types').babelPluginFlowReactPropTypes_proptype_Outbox || require('react').PropTypes.any;

exports.default = function (outbox) {
  if (outbox.length > 0) {
    return [outbox[0]];
  }
  return [];
};