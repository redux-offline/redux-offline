// @flow
/*global $Shape*/
import type { Config } from './types';
import { applyMiddleware, createStore, compose } from 'redux';
import { autoRehydrate } from 'redux-persist';
import { createOfflineMiddleware } from './middleware';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';
import { persist } from './defaults/persist';
import { networkStatusChanged } from './actions';

// @TODO: Take createStore as config?

let persistor;

export const createOfflineStore = (
  reducer,
  preloadedState,
  enhancer,
  userConfig: $Shape<Config> = {}
) => {
  console.log('user config', userConfig);
  const config = applyDefaults(userConfig);

  console.log('Creating offline store', config);

  // wraps userland reducer with a top-level
  // reducer that handles offline state updating
  const offlineReducer = enhanceReducer(reducer);

  const offlineMiddleware = applyMiddleware(createOfflineMiddleware(config));

  // create autoRehydrate enhancer if required
  const offlineEnhancer = config.strategies.persist && config.rehydrate
    ? compose(offlineMiddleware, enhancer, autoRehydrate())
    : compose(offlineMiddleware, enhancer);

  // create store
  const store = createStore(offlineReducer, preloadedState, offlineEnhancer);

  // launch store persistor
  if (config.strategies.persist) {
    persistor = config.strategies.persist(store);
  }

  // launch network detector
  if (config.strategies.detectNetwork) {
    config.strategies.detectNetwork(online => {
      console.log('received detectNetwork callback', online);
      store.dispatch(networkStatusChanged(online));
    });
  }

  return store;
};
