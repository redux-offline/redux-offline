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
      const commitAction = metadata.commit || {
        ...config.defaultCommit,
        meta: { ...config.defaultCommit.meta, offlineAction: action }
      };
      try {
        dispatch(complete(commitAction, true, result));
      } catch (e) {
        dispatch(complete({ type: JS_ERROR, payload: e }, false));
      }
    })
    .catch(async error => {
      const rollbackAction = metadata.rollback || {
        ...config.defaultRollback,
        meta: { ...config.defaultRollback.meta, offlineAction: action }
      };

      // discard
      let mustDiscard = true;
      try {
        mustDiscard = await config.discard(error, action, retries);
      } catch (e) {
        console.warn(e);
      }

      if (!mustDiscard) {
        const delay = config.retry(action, retries);
        if (delay != null) {
          dispatch(scheduleRetry(delay));
          return;
        }
      }

      dispatch(complete(rollbackAction, false, error));
    });
};

export default send;
