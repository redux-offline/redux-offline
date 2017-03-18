// @flow
/*global $Shape*/
import type { Config } from './types';
import { createStore, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { createOfflineMiddleware } from './middleware';
import { addEffects } from './effects';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';

// @TODO: Take createStore as config?

let persistor;

export const createOfflineStore = (
  reducer,
  preloadedState,
  enhancer,
  userConfig: $Shape<Config> = {}
) => {
  const config = applyDefaults(userConfig);

  console.log('Creating offline store', config);

  // wraps userland reducer with a top-level
  // reducer that handles offline state updating
  const offlineReducer = enhanceReducer(reducer);

  // create autoRehydrate enhancer if required
  const offlineEnhancer = config.persist && config.rehydrate
    ? compose(enhancer, autoRehydrate())
    : enhancer;

  // create store
  const store = createStore(offlineReducer, preloadedState, offlineEnhancer);

  // launch store persistor
  if (config.persist) {
    persistor = persistStore(store);
  }

  // add effects handler
  if (config.effects) {
    addEffects(store, config);
  }

  return store;
};
