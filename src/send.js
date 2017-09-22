import { busy, scheduleRetry } from './actions';
import { JS_ERROR } from './constants';
import type { Config, OfflineAction, ResultAction } from './types';

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
        return dispatch(complete({ type: JS_ERROR, payload: e }, false));
      }
    })
    .catch(error => {
      // discard
      if (config.discard(error, action, retries)) {
        return dispatch(complete(metadata.rollback, false, error));
      }
      const delay = config.retry(action, retries);
      if (delay != null) {
        return dispatch(scheduleRetry(delay));
      }
      return dispatch(complete(metadata.rollback, false, error));
    });
};

export default send;
