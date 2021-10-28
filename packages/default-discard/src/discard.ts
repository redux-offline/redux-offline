import type { Action } from '../../../types';

function discard<E extends { status: number }>(
  error: E,
  _action: Action,
  retries = 0
): boolean {
  if ('status' in error) {
    // discard http 4xx errors
    return error.status >= 400 && error.status < 500;
  }
  // BREAKING CHANGE!
  // not a network error -> we retry once
  return retries >= 1;
}

export default discard;
