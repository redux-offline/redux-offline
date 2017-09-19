// @flow

import type { AppState, Config } from './types';
import { OFFLINE_SEND, OFFLINE_SCHEDULE_RETRY } from './constants';
import { completeRetry } from './actions';
import send from './send';

const after = (timeout = 0) =>
  new Promise(resolve => setTimeout(resolve, timeout));

export const createOfflineMiddleware = (config: Config) =>
  (store: any) => (next: any) => (action: any) => {
    // allow other middleware to do their things
    const result = next(action);

  // find any actions to send, if any
  const state: AppState = store.getState();
  const offlineAction = state.offline.outbox[0];

  // if the are any actions in the queue that we are not
  // yet processing, send those actions
  if (
    offlineAction &&
    !state.offline.busy &&
    !state.offline.retryScheduled &&
    state.offline.online
  ) {
    send(offlineAction, store.dispatch, config, state.offline.retryCount);
  }

  if (action.type === OFFLINE_SCHEDULE_RETRY) {
    after(action.payload.delay).then(() => {
      store.dispatch(completeRetry(offlineAction));
    });
  }

  if (action.type === OFFLINE_SEND && offlineAction && !state.offline.busy) {
    send(offlineAction, store.dispatch, config, state.offline.retryCount);
  }
  return result;
};
