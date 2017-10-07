// @flow
/* global $Shape */
import { applyMiddleware, compose } from 'redux';
import type { Config } from './types';
import { createOfflineMiddleware } from './middleware';
import { enhanceReducer } from './updater';
import { applyDefaults } from './config';
import { networkStatusChanged } from './actions';

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

// eslint-disable-next-line no-unused-vars
let persistor;

export const offline = (userConfig: $Shape<Config> = {}) => (
  createStore: any
) => (reducer: any, preloadedState: any, enhancer: any = x => x) => {
  const config = applyDefaults(userConfig);

  warnIfNotReduxAction(config, 'defaultCommit');
  warnIfNotReduxAction(config, 'defaultRollback');

  // wraps userland reducer with a top-level
  // reducer that handles offline state updating
  const offlineReducer = enhanceReducer(reducer, config);

  const offlineMiddleware = applyMiddleware(createOfflineMiddleware(config));

  // create autoRehydrate enhancer if required
  const offlineEnhancer =
    config.persist && config.rehydrate && config.persistAutoRehydrate
      ? compose(offlineMiddleware, config.persistAutoRehydrate())
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
