// @flow

import type { AppState, Config, OfflineAction, ResultAction, Outbox, OfflineState } from './types';
import { OFFLINE_SEND, OFFLINE_SCHEDULE_RETRY } from './constants';
import { completeRetry, scheduleRetry, busy } from './actions';

const after = (timeout = 0) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const complete = (action: ResultAction, success: boolean, payload: {}): ResultAction => {
  return { ...action, payload, meta: { ...action.meta, success, completed: true } };
};

const take = (offline: OfflineState, config: Config): Outbox => {
  // batching is optional, for now
  if (config.batch) {
    return config.batch(offline.outbox);
  }

  return [offline.outbox[0]];
};

const send = (action: OfflineAction, dispatch, config: Config, retries = 0) => {
  const metadata = action.meta.offline;
  dispatch(busy(true));
  return config
    .effect(metadata.effect, action)
    .then(result => dispatch(complete(metadata.commit, true, result)))
    .catch(error => {
      // discard
      if (config.discard(error, action, retries)) {
        console.log('Discarding action', action.type);
        return dispatch(complete(metadata.rollback, false, error));
      }
      const delay = config.retry(action, retries);
      if (delay != null) {
        console.log('Retrying action', action.type, 'with delay', delay);
        return dispatch(scheduleRetry(delay));
      } else {
        console.log('Discarding action', action.type, 'because retry did not return a delay');
        return dispatch(complete(metadata.rollback, false, error));
      }
    });
};

export const createOfflineMiddleware = (config: Config) => (store: any) => (next: any) => (
  action: any
) => {
  // allow other middleware to do their things
  const result = next(action);

  // find any actions to send, if any
  const state: AppState = store.getState();

  const offline = config.offlineStateLens(state).get;

  const actions = take(offline, config);

  // if the are any actions in the queue that we are not
  // yet processing, send those actions
  if (
    actions.length > 0 &&
    !offline.busy &&
    !offline.retryScheduled &&
    offline.online
  ) {
    send(actions[0], store.dispatch, config, offline.retryCount);
  }

  if (action.type === OFFLINE_SCHEDULE_RETRY) {
    const retryToken = offline.retryToken;
    after(action.payload.delay).then(() => store.dispatch(completeRetry(retryToken)));
  }

  // if (action.type === 'Offline/COMPLETE_RETRY') {
  //   if (action.meta.retryToken === offline.retryToken && actions.length > 0) {
  //     send(actions[0], store.dispatch, config);
  //   }
  // }

  if (action.type === OFFLINE_SEND && actions.length > 0 && !offline.busy) {
    send(actions[0], store.dispatch, config, offline.retryCount);
  }

  return result;
};
