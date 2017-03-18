// @flow
/*global fetch, $Shape*/

import type { Config, Retry, Outbox, OfflineAction } from './types';

//@TODO nuke

const defaultSettings = {
  persist: true,
  rehydrate: true
};

const defaultStrategies = {
  batching(outbox: Outbox): Outbox {
    if (outbox.length > 0) {
      return [outbox[0]];
    }
    return [];
  },
  network(effect: any) {
    const { url, ...options } = effect;
    return fetch(url, options);
  },
  retry(_metadata: OfflineAction, _retries: number): ?Retry {
    return null;
  }
};

export const applyDefaults = (config: $Shape<Config>): Config => {
  return {
    ...defaultSettings,
    ...config,
    strategy: { ...defaultStrategies, ...config.strategy }
  };
};
