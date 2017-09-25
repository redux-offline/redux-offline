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
      const commitAction = metadata.commit || config.defaultCommit;
      try {
        dispatch(complete(commitAction, true, result));
      } catch (e) {
        console.error(e);
        dispatch(complete({ type: JS_ERROR, payload: e }, false));
      }
    })
    .catch(error => {
      const rollbackAction = metadata.rollback || config.defaultRollback;

      // discard
      if (config.discard(error, action, retries)) {
        console.info('Discarding action', action.type);
        if (rollbackAction) {
          dispatch(complete(rollbackAction, false, error));
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
      if (rollbackAction) {
        dispatch(complete(rollbackAction, false, error));
      }
    });
};

export default send;
