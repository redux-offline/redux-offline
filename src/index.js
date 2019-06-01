// @flow
/* global $Shape */
import { applyMiddleware, compose } from 'redux';
import type { Config } from './types';
import { createOfflineMiddleware } from './middleware';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';
import { networkStatusChanged } from './actions';
import offlineActionTracker from './offlineActionTracker';

// @TODO: Take createStore as config?
const warnIfNotReduxAction = (config: $Shape<Config>, key: string) => {
  const maybeAction = config[key];

  const isNotReduxAction =
    maybeAction === null ||
    typeof maybeAction !== 'object' ||
    typeof maybeAction.type !== 'string' ||
    maybeAction.type === '';

  if (isNotReduxAction && console.warn) {
    const msg =
      `${key} must be a proper redux action, ` +
      `i.e. it must be an object and have a non-empty string type. ` +
      `Instead you provided: ${JSON.stringify(maybeAction, null, 2)}`;
    console.warn(msg);
  }
};

export const offline = (userConfig: $Shape<Config> = {}) => (
  createStore: any
) => (reducer: any, preloadedState: any, enhancer: any = x => x) => {
  const config = mergeConfigs(userConfig);

  // wraps userland reducer with a top-level
  // reducer that handles offline state updating
  const offlineReducer = enhanceReducer(reducer, config);

  // $FlowFixMe
  const offlineMiddleware = applyMiddleware(createOfflineMiddleware(config));

  // create autoRehydrate enhancer if required
  const offlineEnhancer =
    config.persist && config.rehydrate && config.persistAutoRehydrate
      ? compose(
          offlineMiddleware,
          config.persistAutoRehydrate()
        )
      : offlineMiddleware;

  // create store
  return configStore(offlineEnhancer(createStore)(
    offlineReducer,
    preloadedState,
    enhancer
  ), config);
};

export const createOffline = (userConfig: $Shape<Config> = {}) => {
  const config = mergeConfigs(userConfig);

  return {
    middleware: createOfflineMiddleware(config),
    enhanceReducer(reducer: any) {
      return enhanceReducer(reducer, config);
    },
    enhanceStore: createEnhanceStore(config)
  };
};

export const createEnhanceStore = (config: $Shape<Config> = {}) => {
  return (next: any) => (
    reducer: any,
    preloadedState: any,
    enhancer: any
  ) => {
    // create autoRehydrate enhancer if required
    const createStore =
      config.persist && config.rehydrate && config.persistAutoRehydrate
        ? config.persistAutoRehydrate()(next)
        : next;

    // create store
    return configStore(createStore(reducer, preloadedState, enhancer), config);
  };
};

function mergeConfigs(userConfig)
{
  const config = applyDefaults(userConfig);

  warnIfNotReduxAction(config, 'defaultCommit');
  warnIfNotReduxAction(config, 'defaultRollback');

  // toggle experimental returned promises
  config.offlineActionTracker = config.returnPromises
    ? offlineActionTracker.withPromises
    : offlineActionTracker.withoutPromises;
  delete config.returnPromises;

  return config
}

function configStore(store, config)
{
  const baseReplaceReducer = store.replaceReducer.bind(store);
  // $FlowFixMe
  store.replaceReducer = function replaceReducer(nextReducer) {
    return baseReplaceReducer(enhanceReducer(nextReducer, config));
  };

  // launch store persistor
  if (config.persist) {
    config.persist(store, config.persistOptions, config.persistCallback);
  }

  // launch network detector
  if (config.detectNetwork) {
    config.detectNetwork(online => {
      store.dispatch(networkStatusChanged(online));
    });
  }

  return store;
}
