// @flow

import type { AppState, Config } from './types';
import { OFFLINE_SEND, OFFLINE_SCHEDULE_RETRY } from './constants';
import { completeRetry } from './actions';
import send from './send';

const after = (timeout = 0) =>
  new Promise(resolve => setTimeout(resolve, timeout));

export const createOfflineMiddleware = (config: Config) => (store: any) => (
  next: any
) => (action: any) => {
  // allow other middleware to do their things
  const result = next(action);
  let promise;

  // find any actions to send, if any
  const state: AppState = store.getState();
  const offline = config.offlineStateLens(state).get;
  const context = { offline };
  const offlineAction = config.queue.peek(offline.outbox, action, context);

  // create promise to return on enqueue offline action
  if (action.meta && action.meta.offline) {
    const { registerAction } = config.offlineActionTracker;
    promise = registerAction(offline.lastTransaction);
  }

  // if there are any actions in the queue that we are not
  // yet processing, send those actions
  if (
    offlineAction &&
    !offline.busy &&
    !offline.retryScheduled &&
    !offline.retryCountExceeded &&
    offline.online
  ) {
    send(offlineAction, store.dispatch, config, offline.retryCount);
  }

  if (action.type === OFFLINE_SCHEDULE_RETRY) {
    after(action.payload.delay).then(() => {
      store.dispatch(completeRetry(offlineAction));
    });
  }

  if (action.type === OFFLINE_SEND && offlineAction && !offline.busy) {
    send(offlineAction, store.dispatch, config, offline.retryCount);
  }

  return promise || result;
};
