'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOfflineMiddleware = undefined;

var _constants = require('./constants');

var _actions = require('./actions');

var _send = require('./send');

var _send2 = _interopRequireDefault(_send);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var after = function after() {
  var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new Promise(function (resolve) {
    return setTimeout(resolve, timeout);
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
        var offlineAction = state.offline.outbox[0];

        // if the are any actions in the queue that we are not
        // yet processing, send those actions
        if (offlineAction && !state.offline.busy && !state.offline.retryScheduled && state.offline.online) {
          (0, _send2.default)(offlineAction, store.dispatch, config, state.offline.retryCount);
        }

        if (action.type === _constants.OFFLINE_SCHEDULE_RETRY) {
          after(action.payload.delay).then(function () {
            store.dispatch((0, _actions.completeRetry)(offlineAction));
          });
        }

        if (action.type === _constants.OFFLINE_SEND && offlineAction && !state.offline.busy) {
          (0, _send2.default)(offlineAction, store.dispatch, config, state.offline.retryCount);
        }
        return result;
      };
    };
  };
};