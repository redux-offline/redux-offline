// @flow

import type { OfflineAction } from '../types';
import { NetworkError } from './effect';

export default (
  error: typeof NetworkError,
  action: OfflineAction,
  _retries: number = 0 // eslint-disable-line no-unused-vars
): boolean => {
  // not a network error -> discard
  if (!('status' in error)) {
    return true;
  }

  // discard http 4xx errors
  // $FlowFixMe
  return error.status >= 400 && error.status < 500;
};
