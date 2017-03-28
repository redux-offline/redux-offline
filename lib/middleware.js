'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var babelPluginFlowReactPropTypes_proptype_Outbox = require('./types').babelPluginFlowReactPropTypes_proptype_Outbox || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_ResultAction = require('./types').babelPluginFlowReactPropTypes_proptype_ResultAction || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_OfflineAction = require('./types').babelPluginFlowReactPropTypes_proptype_OfflineAction || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_Config = require('./types').babelPluginFlowReactPropTypes_proptype_Config || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_AppState = require('./types').babelPluginFlowReactPropTypes_proptype_AppState || require('react').PropTypes.any;

var scheduleRetry = function scheduleRetry() {
  var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return { type: 'Offline/SCHEDULE_RETRY', payload: { delay: delay } };
};

var completeRetry = function completeRetry(action, retryToken) {
  return { type: 'Offline/COMPLETE_RETRY', payload: action, meta: { retryToken: retryToken } };
};

var after = function after() {
  var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return new Promise(function (resolve) {
    return setTimeout(resolve, timeout);
  });
};

var complete = function complete(action, success, payload) {
  return _extends({}, action, { payload: payload, meta: _extends({}, action.meta, { success: success, completed: true }) });
};

var take = function take(state, config) {
  // batching is optional, for now
  if (config.batch) {
    return config.batch(state.offline.outbox);
  }

  return [state.offline.outbox[0]];
};

var send = function send(action, dispatch, config) {
  var retries = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var metadata = action.meta.offline;
  return config.effect(metadata.effect, action).then(function (result) {
    return dispatch(complete(metadata.commit, true, result));
  }).catch(function (error) {
    // discard
    if (config.discard(error, action, retries)) {
      console.log('Discarding action', action.type);
      return dispatch(complete(metadata.rollback, false, error));
    }
    var delay = config.retry(action, retries);
    if (delay != null) {
      console.log('Retrying action', action.type, 'with delay', delay);
      return dispatch(scheduleRetry(delay));
    } else {
      console.log('Discarding action', action.type, 'because retry did not return a delay');
      return dispatch(complete(metadata.rollback, false, error));
    }
  });
};

var createOfflineMiddleware = exports.createOfflineMiddleware = function createOfflineMiddleware(config) {
  return function (store) {
    return function (next) {
      return function (action) {
        // allow other middleware to do their things
        var result = next(action);

        // find any actions to send, if any
        var state = store.getState();
        var actions = take(state, config);

        // if the are any actions in the queue that we are not
        // yet processing, send those actions
        if (actions.length > 0 && !state.offline.busy && !state.offline.retryScheduled && state.offline.online) {
          send(actions[0], store.dispatch, config, state.offline.retryCount);
        }

        if (action.type === 'Offline/SCHEDULE_RETRY') {
          var retryToken = state.offline.retryToken;
          after(action.payload.delay).then(function () {
            return store.dispatch(completeRetry(retryToken));
          });
        }

        // if (action.type === 'Offline/COMPLETE_RETRY') {
        //   if (action.meta.retryToken === state.offline.retryToken && actions.length > 0) {
        //     send(actions[0], store.dispatch, config);
        //   }
        // }

        if (action.type === 'Offline/SEND' && actions.length > 0 && !state.offline.busy) {
          send(actions[0], store.dispatch, config, state.offline.retryCount);
        }

        return result;
      };
    };
  };
};