// @flow
/*global fetch*/

import type { OfflineAction } from '../types';

export default (effect: any, _action: OfflineAction): Promise<any> => {
  const { url, ...options } = effect;
  return fetch(url, options);
};
