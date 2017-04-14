'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createOfflineStore = undefined;

var _redux = require('redux');

var _reduxPersist = require('redux-persist');

var _middleware = require('./middleware');

var _updater = require('./updater');

var _config = require('./config');

var _actions = require('./actions');

var babelPluginFlowReactPropTypes_proptype_Config = require('./types').babelPluginFlowReactPropTypes_proptype_Config || require('react').PropTypes.any;
/*global $Shape*/


// @TODO: Take createStore as config?

// eslint-disable-next-line no-unused-vars
var persistor = void 0;

var createOfflineStore = exports.createOfflineStore = function createOfflineStore(reducer, preloadedState, enhancer) {
  var userConfig = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var persistCallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

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
  var store = (0, _redux.createStore)(offlineReducer, preloadedState, offlineEnhancer);

  // launch store persistor
  if (config.persist) {
    persistor = config.persist(store, config.persistOptions, persistCallback ? () => persistCallback(store) : null);
  }

  // launch network detector
  if (config.detectNetwork) {
    config.detectNetwork(function (online) {
      store.dispatch((0, _actions.networkStatusChanged)(online));
    });
  }

  return store;
};
