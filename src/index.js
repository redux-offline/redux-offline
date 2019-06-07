// @flow
/* global $Shape */
import { applyMiddleware, compose } from 'redux';

import { networkStatusChanged } from './actions';
import mergeConfigs from './mergeConfigs';
import { createOfflineMiddleware } from './middleware';
import type { Config } from './types';
import { enhanceReducer } from './updater';

function configStore(store, config) {
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
      store.dispatch(networkStatusChanged(online, config.key));
    });
  }

  return store;
}

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
  return configStore(
    offlineEnhancer(createStore)(offlineReducer, preloadedState, enhancer),
    config
  );
};

export const createEnhanceStore = (userConfig: $Shape<Config> = {}) => {
  const config = mergeConfigs(userConfig);

  return (next: any) => (reducer: any, preloadedState: any, enhancer: any) => {
    // create autoRehydrate enhancer if required
    const createStore =
      config.persist && config.rehydrate && config.persistAutoRehydrate
        ? config.persistAutoRehydrate()(next)
        : next;

    // create store
    return configStore(createStore(reducer, preloadedState, enhancer), config);
  };
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
