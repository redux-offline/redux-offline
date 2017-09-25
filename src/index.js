// @flow
/* global $Shape */
import { applyMiddleware, compose } from 'redux';
import { autoRehydrate } from 'redux-persist';
import type { Config } from './types';
import { createOfflineMiddleware } from './middleware';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';
import { networkStatusChanged } from './actions';

// @TODO: Take createStore as config?

// eslint-disable-next-line no-unused-vars
let persistor;

export const offline = (userConfig: $Shape<Config> = {}) => (
  createStore: any
) => (reducer: any, preloadedState: any, enhancer: any = x => x) => {
  const config = applyDefaults(userConfig);

  // wraps userland reducer with a top-level
  // reducer that handles offline state updating
  const offlineReducer = enhanceReducer(reducer);

  const offlineMiddleware = applyMiddleware(createOfflineMiddleware(config));

  // create autoRehydrate enhancer if required
  const offlineEnhancer =
    config.persist && config.rehydrate
      ? compose(offlineMiddleware, autoRehydrate())
      : offlineMiddleware;

  // create store
  const store = offlineEnhancer(createStore)(
    offlineReducer,
    preloadedState,
    enhancer
  );

  // launch store persistor
  if (config.persist) {
    persistor = config.persist(
      store,
      config.persistOptions,
      config.persistCallback
    );
  }

  // launch network detector
  if (config.detectNetwork) {
    config.detectNetwork(online => {
      store.dispatch(networkStatusChanged(online));
    });
  }

  return store;
};
