'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actions = require('./actions');

var _constants = require('./constants');

var complete = function complete(action, success, payload) {
  return _extends({}, action, {
    payload: payload,
    meta: _extends({}, action.meta, { success: success, completed: true })
  });
};

var send = function send(action, dispatch, config) {
  var retries = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var metadata = action.meta.offline;
  dispatch((0, _actions.busy)(true));
  return config.effect(metadata.effect, action).then(function (result) {
    try {
      if (metadata.commit) {
        dispatch(complete(metadata.commit, true, result));
        return;
      }
    } catch (e) {
      console.error(e);
      dispatch(complete({ type: _constants.JS_ERROR, payload: e }, false));
    }
  }).catch(function (error) {
    // discard
    if (config.discard(error, action, retries)) {
      console.info('Discarding action', action.type);
      if (metadata.commit) {
        dispatch(complete(metadata.rollback, false, error));
        return;
      }
    }
    var delay = config.retry(action, retries);
    if (delay != null) {
      console.info('Retrying action', action.type, 'with delay', delay);
      dispatch((0, _actions.scheduleRetry)(delay));
      return;
    }
    console.info('Discarding action', action.type, 'because retry did not return a delay');
    if (metadata.rollback) {
      dispatch(complete(metadata.rollback, false, error));
    }
  });
};

exports.default = send;