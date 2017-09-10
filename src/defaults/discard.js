// @flow

import type { OfflineAction } from '../types';
import { NetworkError } from './effect';

// eslint-disable-next-line no-unused-vars
export default (error: NetworkError, action: OfflineAction, _retries: number = 0): boolean => {
  // not a network error -> discard
  if (!('status' in error)) {
    return true;
  }

  // discard http 4xx errors
  // $FlowFixMe
  return error.status >= 400 && error.status < 500;
};
