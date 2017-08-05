// @flow
/*global $Shape*/
import type { Config } from './types';
import { applyMiddleware, compose } from 'redux';
import { autoRehydrate } from 'redux-persist';
import { createOfflineMiddleware } from './middleware';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';
import { networkStatusChanged } from './actions';

// @TODO: Take createStore as config?

// eslint-disable-next-line no-unused-vars
let persistor;

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
  const offlineReducer = enhanceReducer(reducer);

  const offlineMiddleware = applyMiddleware(
    ...userConfig.effectResultMiddleware || [],
    createOfflineMiddleware(config)
  );

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
