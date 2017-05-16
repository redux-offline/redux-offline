// @flow
/*global $Shape*/
import type { Config } from './types';
import { applyMiddleware, compose } from 'redux';
import { autoRehydrate as reduxAutoRehydrate } from 'redux-persist';
import {
  persistStore as immutablePersistStore,
  autoRehydrate as immutableAutoRehydrateImmutable
} from 'redux-persist-immutable';
import { createOfflineMiddleware } from './middleware';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';
import { networkStatusChanged } from './actions';

// @TODO: Take createStore as config?

// eslint-disable-next-line no-unused-vars
let persistor;
let autoRehydrate = reduxAutoRehydrate;

export const offline = (userConfig: $Shape<Config> = {}) => (createStore: any) => (
  reducer: any,
  preloadedState: any,
  enhancer: any = x => x
) => {
  console.log('user config', userConfig);
  const config = applyDefaults(userConfig);

  console.log('Creating offline store', config);

  // wraps userland reducer with a top-level
  // reducer that handles offline state updating
  const offlineReducer = enhanceReducer(reducer, config);

  const offlineMiddleware = applyMiddleware(createOfflineMiddleware(config));

  if (config.immutable) {
    autoRehydrate = immutableAutoRehydrateImmutable;
    config.persist = immutablePersistStore;
  }

  // create autoRehydrate enhancer if required
  const offlineEnhancer = config.persist && config.rehydrate
    ? compose(offlineMiddleware, enhancer, autoRehydrate())
    : compose(offlineMiddleware, enhancer);

  // create store
  const store = createStore(offlineReducer, preloadedState, offlineEnhancer);

  // launch store persistor
  if (config.persist) {
    persistor = config.persist(store, config.persistOptions, config.persistCallback);
  }

  // launch network detector
  if (config.detectNetwork) {
    config.detectNetwork(online => {
      store.dispatch(networkStatusChanged(online));
    });
  }

  return store;
};
