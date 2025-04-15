// @flow
/* global $Shape */
import { applyDefaults } from './config';
import offlineActionTracker from './offlineActionTracker';
import type { Config } from './types';

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

export default function mergeConfigs(userConfig) {
  const config = applyDefaults(userConfig);

  warnIfNotReduxAction(config, 'defaultCommit');
  warnIfNotReduxAction(config, 'defaultRollback');

  // toggle experimental returned promises
  if (!config.offlineActionTracker) {
    config.offlineActionTracker = config.returnPromises
      ? offlineActionTracker.withPromises
      : offlineActionTracker.withoutPromises;
    delete config.returnPromises;
  }

  return config;
}
