import { busy, scheduleRetry } from './actions';
import { JS_ERROR } from './constants';
import type { Config, OfflineAction, ResultAction } from './types';

const complete = (
  action: ResultAction,
  success: boolean,
  payload: {},
  offlineAction: OfflineAction,
  config: Config
): ResultAction => {
  const { resolveAction, rejectAction } = config.offlineActionTracker;
  if (success) {
    resolveAction(offlineAction.meta.transaction, payload);
  } else {
    rejectAction(offlineAction.meta.transaction, payload);
  }
  return {
    ...action,
    payload,
    meta: { ...action.meta, success, completed: true }
  };
};

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
        return dispatch(complete(commitAction, true, result, action, config));
      } catch (error) {
        return dispatch(
          complete(
            { type: JS_ERROR, meta: { error } },
            false,
            undefined,
            action,
            config
          )
        );
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
          return dispatch(scheduleRetry(delay));
        }
      }

      return dispatch(complete(rollbackAction, false, error, action, config));
    })
    .finally(() => dispatch(busy(false)));
};

export default send;
