'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.offline = undefined;

var _redux = require('redux');

var _reduxPersist = require('redux-persist');

var _middleware = require('./middleware');

var _updater = require('./updater');

var _config = require('./config');

var _actions = require('./actions');

// @TODO: Take createStore as config?

// eslint-disable-next-line no-unused-vars
var persistor = void 0;
/*global $Shape*/
var offline = exports.offline = function offline() {
  var userConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (createStore) {
    return function (reducer, preloadedState) {
      var enhancer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x) {
        return x;
      };

      console.log('user config', userConfig);
      var config = (0, _config.applyDefaults)(userConfig);

      console.log('Creating offline store', config);

      // wraps userland reducer with a top-level
      // reducer that handles offline state updating
      var offlineReducer = (0, _updater.enhanceReducer)(reducer);

      var offlineMiddleware = (0, _redux.applyMiddleware)((0, _middleware.createOfflineMiddleware)(config));

      // create autoRehydrate enhancer if required
      var offlineEnhancer = config.persist && config.rehydrate ? (0, _redux.compose)(offlineMiddleware, enhancer, (0, _reduxPersist.autoRehydrate)()) : (0, _redux.compose)(offlineMiddleware, enhancer);

      // create store
      var store = createStore(offlineReducer, preloadedState, offlineEnhancer);

      // launch store persistor
      if (config.persist) {
        persistor = config.persist(store, config.persistOptions, config.persistCallback);
      }

      // launch network detector
      if (config.detectNetwork) {
        config.detectNetwork(function (online) {
          store.dispatch((0, _actions.networkStatusChanged)(online));
        });
      }

      return store;
    };
  };
};