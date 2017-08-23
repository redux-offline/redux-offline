'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enhanceReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _constants = require('./constants');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* global */

var enqueue = function enqueue(state, action) {
  var transaction = state.lastTransaction + 1;
  var stamped = _extends({}, action, { meta: _extends({}, action.meta, { transaction: transaction }) });
  var outbox = state.outbox;
  return _extends({}, state, {
    lastTransaction: transaction,
    outbox: [].concat(_toConsumableArray(outbox), [stamped])
  });
};

var dequeue = function dequeue(state) {
  var _state$outbox = _toArray(state.outbox),
      rest = _state$outbox.slice(1);

  return _extends({}, state, { outbox: rest, retryCount: 0, busy: false });
};

var initialState = {
  busy: false,
  lastTransaction: 0,
  online: false,
  outbox: [],
  receipts: [],
  retryToken: 0,
  retryCount: 0,
  retryScheduled: false
};

// @TODO: the typing of this is all kinds of wack

var offlineUpdater = function offlineUpdater() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  // Update online/offline status
  if (action.type === _constants.OFFLINE_STATUS_CHANGED && action.payload && typeof action.payload.online === 'boolean') {
    return _extends({}, state, { online: action.payload.online });
  }

  if (action.type === _constants.PERSIST_REHYDRATE) {
    return _extends({}, state, { busy: false });
  }

  if (action.type === _constants.OFFLINE_SCHEDULE_RETRY) {
    return _extends({}, state, {
      busy: false,
      retryScheduled: true,
      retryCount: state.retryCount + 1,
      retryToken: state.retryToken + 1
    });
  }

  if (action.type === _constants.OFFLINE_COMPLETE_RETRY) {
    return _extends({}, state, { retryScheduled: false });
  }

  if (action.type === _constants.OFFLINE_BUSY && action.payload && typeof action.payload.busy === 'boolean') {
    return _extends({}, state, { busy: action.payload.busy });
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

var enhanceReducer = function enhanceReducer(reducer) {
  return function (state, action) {
    var offlineState = void 0;
    var restState = void 0;
    if (typeof state !== 'undefined') {
      var offline = state.offline,
          rest = _objectWithoutProperties(state, ['offline']);

      offlineState = offline;
      restState = rest;
    }

    return _extends({}, reducer(restState, action), {
      offline: offlineUpdater(offlineState, action)
    });
  };
};
exports.enhanceReducer = enhanceReducer;