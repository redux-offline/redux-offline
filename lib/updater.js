'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var babelPluginFlowReactPropTypes_proptype_ResultAction = require('./types').babelPluginFlowReactPropTypes_proptype_ResultAction || require('react').PropTypes.any;
/* global $Shape*/

var babelPluginFlowReactPropTypes_proptype_OfflineAction = require('./types').babelPluginFlowReactPropTypes_proptype_OfflineAction || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_OfflineState = require('./types').babelPluginFlowReactPropTypes_proptype_OfflineState || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_AppState = require('./types').babelPluginFlowReactPropTypes_proptype_AppState || require('react').PropTypes.any;

var get = function get(state) {
  return state.offline;
};

var update = function update(state, fragment) {
  return _extends({}, state, { offline: _extends({}, state.offline, fragment) });
};

var enqueue = function enqueue(state, action) {
  var transaction = get(state).lastTransaction + 1;
  var stamped = _extends({}, action, { meta: _extends({}, action.meta, { transaction: transaction }) });
  var outbox = get(state).outbox;
  return update(state, {
    lastTransaction: transaction,
    outbox: [].concat(_toConsumableArray(outbox), [stamped])
  });
};

var dequeue = function dequeue(state) {
  var _get$outbox = _toArray(get(state).outbox),
      rest = _get$outbox.slice(1);

  return update(state, { outbox: rest, retryCount: 0 });
};

var initialState = {
  lastTransaction: 0,
  online: false,
  outbox: [],
  receipts: [],
  retryToken: 0,
  retryCount: 0,
  retryScheduled: false
};

// @TODO: the typing of this is all kinds of wack

var offlineUpdater = function offlineUpdater(state, action) {
  // Initial state
  if (!get(state || {})) {
    return update(state || {}, initialState);
  }

  // Update online/offline status
  if (action.type === 'Offline/STATUS_CHANGED' && action.payload && typeof action.payload.online === 'boolean') {
    return update(state, { online: action.payload.online });
  }

  if (action.type === 'Offline/SCHEDULE_RETRY') {
    return update(state, {
      retryScheduled: true,
      retryCount: get(state).retryCount + 1,
      retryToken: get(state).retryToken + 1
    });
  }

  if (action.type === 'Offline/COMPLETE_RETRY') {
    return update(state, { retryScheduled: false });
  }

  // Add offline actions to queue
  if (action.meta && action.meta.offline) {
    return enqueue(state, action);
  }

  // Remove completed actions from queue (success or fail)
  if (action.meta != null && action.meta.completed === true) {
    return dequeue(state);
  }

  return state;
};

var enhanceReducer = exports.enhanceReducer = function enhanceReducer(reducer) {
  return function (state, action) {
    return offlineUpdater(reducer(state, action), action);
  };
};