'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.busy = exports.completeRetry = exports.scheduleRetry = exports.networkStatusChanged = undefined;

var _constants = require('./constants');

var networkStatusChanged = exports.networkStatusChanged = function networkStatusChanged(online) {
  return {
    type: _constants.OFFLINE_STATUS_CHANGED,
    payload: {
      online: online
    }
  };
};

var scheduleRetry = exports.scheduleRetry = function scheduleRetry() {
  var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return {
    type: _constants.OFFLINE_SCHEDULE_RETRY,
    payload: {
      delay: delay
    }
  };
};

var completeRetry = exports.completeRetry = function completeRetry(action, retryToken) {
  return {
    type: _constants.OFFLINE_COMPLETE_RETRY,
    payload: action,
    meta: { retryToken: retryToken }
  };
};

var busy = exports.busy = function busy(isBusy) {
  return {
    type: _constants.OFFLINE_BUSY,
    payload: { busy: isBusy }
  };
};