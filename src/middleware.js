// @flow

import type { AppState, Config, OfflineAction, ResultAction, Outbox } from './types';

const scheduleRetry = (delay = 0) => {
  return { type: 'Offline/SCHEDULE_RETRY', payload: { delay } };
};

const completeRetry = action => {
  return { type: 'Offline/COMPLETE_RETRY', payload: action };
};

const delay = (timeout = 0) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const complete = (action: ResultAction, success: boolean, payload: {}): ResultAction => {
  return { ...action, payload, meta: { ...action.meta, success, completed: true } };
};

const take = (state: AppState, config: Config): Outbox => {
  return config.strategy.batching(state.offline.outbox);
};

const send = (action: OfflineAction, dispatch, config: Config, retries = 0) => {
  const metadata = action.meta.offline;
  return config.strategy
    .network(metadata.effect, action)
    .then(result => dispatch(complete(metadata.commit, true, result)))
    .catch(error => {
      const retry = config.strategy.retry(action, retries);
      if (retry) {
        return dispatch(scheduleRetry(retry.delay));
      } else {
        return dispatch(complete(metadata.rollback, false, error));
      }
    });
};

export const createOfflineMiddleware = config => store => next => action => {
  // allow other middleware to do their things
  const result = next(action);

  // find any actions to send, if any
  const state: AppState = store.getState();
  const actions = take(state, config);

  // if the are any actions in the queue that we are not
  // yet processing, send those actions
  if (actions.length > 0 && !state.offline.busy && state.offline.online) {
    // @TODO: batching
    send(actions[0], store.dispatch, config);
  }

  // @TODO: retry
  if (action.type === 'Offline/SCHEDULE_RETRY') {
    //retryToken = retryToken++;
    delay(action.payload.delay).then(() => store.dispatch(completeRetry(action)));
  }

  return result;
};
