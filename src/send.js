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
        if (metadata.commit) {
          dispatch(complete(metadata.commit, true, result));
          return;
        }
      } catch (e) {
        console.error(e);
        dispatch(complete({ type: JS_ERROR, payload: e }, false));
      }
    })
    .catch(error => {
      // discard
      if (config.discard(error, action, retries)) {
        console.info('Discarding action', action.type);
        if (metadata.commit) {
          dispatch(complete(metadata.rollback, false, error));
          return;
        }
      }
      const delay = config.retry(action, retries);
      if (delay != null) {
        console.info('Retrying action', action.type, 'with delay', delay);
        dispatch(scheduleRetry(delay));
        return;
      }
      console.info(
        'Discarding action',
        action.type,
        'because retry did not return a delay'
      );
      if (metadata.rollback) {
        dispatch(complete(metadata.rollback, false, error));
      }
    });
};

export default send;
