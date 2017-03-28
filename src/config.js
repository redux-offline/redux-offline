// @flow
/*global $Shape*/
import type { Config } from './types';
import defaults from './defaults';

export const applyDefaults = (config: $Shape<Config> = {}): Config => {
  return {
    ...defaults,
    ...config
  };
};
