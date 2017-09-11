// @flow

import type { AppState, Config, OfflineAction, ResultAction } from './types';
import { OFFLINE_SEND, OFFLINE_SCHEDULE_RETRY, JS_ERROR } from './constants';
import { completeRetry, scheduleRetry, busy } from './actions';

const after = (timeout = 0) =>
  new Promise(resolve => setTimeout(resolve, timeout));

const complete = (
  action: ResultAction,
  success: boolean,
  payload: {}
): ResultAction => ({
  ...action,
  payload,
  meta: { ...action.meta, success, completed: true }
});

const send = (action: OfflineAction, dispatch, config: Config, retries = 0) => {
  const metadata = action.meta.offline;
  dispatch(busy(true));
  return config
    .effect(metadata.effect, action)
    .then(result => {
      try {
        return dispatch(complete(metadata.commit, true, result));
      } catch (e) {
        console.error(e);
        return dispatch(complete({ type: JS_ERROR, payload: e }, false));
      }
    })
    .catch(error => {
      // discard
      if (config.discard(error, action, retries)) {
        console.info('Discarding action', action.type);
        return dispatch(complete(metadata.rollback, false, error));
      }
      const delay = config.retry(action, retries);
      if (delay != null) {
        console.info('Retrying action', action.type, 'with delay', delay);
        return dispatch(scheduleRetry(delay));
      }
      console.info(
        'Discarding action',
        action.type,
        'because retry did not return a delay'
      );
      return dispatch(complete(metadata.rollback, false, error));
    });
};

export const createOfflineMiddleware = (config: Config) => (store: any) => (
  next: any
) => (action: any) => {
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
