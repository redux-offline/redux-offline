// @flow
/* global $Shape */
import type { AdvancedConfig, Config } from './types';
import defaults from './defaults';

export const applyDefaults = (config: $Shape<Config> = {}): Config => ({
  ...defaults,
  ...config
});

export const applyAdvancedDefaults = (
  config: $Shape<AdvancedConfig> = {}
): AdvancedConfig => ({
  ...defaults,
  ...config
});
