// @flow
/* global $Shape */

import type { OfflineState, Config } from './types';
import type { Action } from './reducers';
import reducers, { initialState, enqueue, dequeue } from './reducers';

const offlineUpdater = function offlineUpdater(
  state: OfflineState = initialState,
  action: Action
): OfflineState {
  // Update online/offline status
  const newState =
    reducers[action.type] && reducers[action.type](state, action);

  // Add offline actions to queue
  if (action.meta && action.meta.offline) {
    return enqueue(state, action);
  }

  // Remove completed actions from queue (success or fail)
  if (action.meta && action.meta.completed === true) {
    return dequeue(state);
  }

  return newState || state;
};

export const enhanceReducer = (reducer: any, config: $Shape<Config>) => (
  state: any,
  action: any
) => {
  let offlineState;
  let restState;
  if (typeof state !== 'undefined') {
    offlineState = config.offlineStateLens(state).get;
    restState = config.offlineStateLens(state).set();
  }

  return config
    .offlineStateLens(reducer(restState, action))
    .set(offlineUpdater(offlineState, action));
};
