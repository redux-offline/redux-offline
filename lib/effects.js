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

// const completeRetry = action => {
//   return { type: 'Offline/COMPLETE_RETRY', payload: action };
// };
//
// const delay = (timeout = 0) => {
//   return new Promise(resolve => setTimeout(resolve, timeout));
// };

var complete = function complete(action, success, payload) {
  return _extends({}, action, { payload: payload, meta: _extends({}, action.meta, { success: success, completed: true }) });
};

var take = function take(state, config) {
  return config.strategy.batching(state.offline.outbox);
};

var send = function send(action, dispatch, config) {
  var retries = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var metadata = action.meta.offline;
  return config.strategy.network(metadata.effect, action).then(function (result) {
    return dispatch(complete(metadata.commit, true, result));
  }).catch(function (error) {
    var retry = config.strategy.retry(action, retries);
    if (retry) {
      return dispatch(scheduleRetry(retry.delay));
    } else {
      return dispatch(complete(metadata.rollback, false, error));
    }
  });
};

var addEffects = exports.addEffects = function addEffects(store, config) {
  store.subscribe(function () {
    // find any actions to send, if any
    var state = store.getState();
    var actions = take(state, config);

    // if the are any actions in the queue that we are not
    // yet processing, send those actions
    if (actions.length > 0 && !state.offline.busy && state.offline.online) {
      // @TODO: batching
      send(actions[0], store.dispatch, config);
    }

    // @TODO: retry
    // if (action.type === 'Offline/SCHEDULE_RETRY') {
    //   //retryToken = retryToken++;
    //   delay(action.payload.delay).then(() => store.dispatch(completeRetry(action)));
    // }
  });
};