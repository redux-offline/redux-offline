'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var offlineSideEffects = require('@redux-offline/offline-side-effects');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var PERSIST_REHYDRATE = 'persist/REHYDRATE';
var OFFLINE_SERIALIZE = 'Offline/OFFLINE_SERIALIZE';
var OFFLINE_STATUS_CHANGED = 'Offline/OFFLINE_STATUS_CHANGED';
var OFFLINE_BUSY = 'Offline/OFFLINE_BUSY';
var OFFLINE_SCHEDULE_RETRY = 'Offline/OFFLINE_SCHEDULE_RETRY';
var OFFLINE_RESET_STATE = 'Offline/OFFLINE_RESET_STATE';

var initialState = {
  outbox: [],
  busy: false,
  online: true
};

function offlineReducer(state, action) {
  if (state === void 0) {
    state = initialState;
  }

  if (action.type === OFFLINE_SERIALIZE) {
    var _action$payload = action.payload,
        status = _action$payload.status,
        retryScheduled = _action$payload.retryScheduled,
        newState = _objectWithoutPropertiesLoose(_action$payload, ["status", "retryScheduled"]);

    var online = status !== 'paused';
    var busy = status === 'busy';
    return _extends({}, state, newState, {
      retryScheduled: Boolean(retryScheduled),
      online: online,
      busy: busy
    });
  }

  return state;
}

function createReduxOfflineMiddleware(offlineSideEffects) {
  var reduxOfflineMiddleware = function reduxOfflineMiddleware() {
    return function (next) {
      return function (action) {
        next(action);

        if (action.type === PERSIST_REHYDRATE) {
          var _action$payload$offli, _action$payload;

          offlineSideEffects.rehydrateState((_action$payload$offli = (_action$payload = action.payload) == null ? void 0 : _action$payload.offline) != null ? _action$payload$offli : {});
        }

        if (action.type === OFFLINE_RESET_STATE) {
          offlineSideEffects.reset();
        }

        offlineSideEffects.addSideEffect(action);
      };
    };
  };

  return reduxOfflineMiddleware;
}

var createOffline = function createOffline(options, buildListeners) {
  if (buildListeners === void 0) {
    buildListeners = function buildListeners() {
      return {};
    };
  }

  var offlineSideEffects$1 = null;

  var enhanceStore = function enhanceStore(createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var prevStatus = null;

      var listeners = _extends({
        onCommit: function onCommit(payload, commit) {
          return store.dispatch(_extends({}, commit, {
            payload: payload
          }));
        },
        onRollback: function onRollback(payload, rollback) {
          return store.dispatch(_extends({}, rollback, {
            payload: payload
          }));
        },
        onStatusChange: function onStatusChange(status) {
          if (status === 'paused') {
            store.dispatch({
              type: OFFLINE_STATUS_CHANGED,
              payload: false
            });
          } else {
            if (prevStatus === 'paused') {
              store.dispatch({
                type: OFFLINE_STATUS_CHANGED,
                payload: true
              });
            }

            store.dispatch({
              type: OFFLINE_BUSY,
              payload: status === 'busy'
            });
          }

          prevStatus = status;
        },
        onSerialize: function onSerialize(state) {
          store.dispatch({
            type: OFFLINE_SERIALIZE,
            payload: state
          });
        },
        onRetry: function onRetry(delay) {
          return store.dispatch({
            type: OFFLINE_SCHEDULE_RETRY,
            payload: {
              delay: delay
            }
          });
        }
      }, buildListeners(store));

      offlineSideEffects$1 = offlineSideEffects.offlineSideEffects(listeners, options); // launch network detector

      if (options.detectNetwork) {
        options.detectNetwork(function (online) {
          return offlineSideEffects$1.setPaused(!online);
        });
      }

      return store;
    };
  };

  var reduxOfflineMiddleware = createReduxOfflineMiddleware(offlineSideEffects$1);
  return {
    enhanceStore: enhanceStore,
    reducer: offlineReducer,
    middleware: reduxOfflineMiddleware
  };
};

exports.createOffline = createOffline;
//# sourceMappingURL=redux-offline.cjs.development.js.map
