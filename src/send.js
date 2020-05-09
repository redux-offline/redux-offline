// @flow
import { busy, scheduleRetry, retryCountExceeded } from './actions';
import { JS_ERROR } from './constants';
import type {
  Config,
  OfflineAction,
  ResultAction,
  DefaultAction
} from './types';

type CompleteSuccessResult = {
  success: true,
  payload: {}
};

type CompleteFailResult = {
  success: false,
  payload?: Error
};

const complete = (
  action: DefaultAction | ResultAction,
  result: CompleteSuccessResult | CompleteFailResult,
  offlineAction: OfflineAction,
  config: Config
): ResultAction => {
  const { resolveAction, rejectAction } = config.offlineActionTracker;
  if (result.success) {
    resolveAction(offlineAction.meta.transaction, result.payload);
  } else if (result.payload) {
    rejectAction(offlineAction.meta.transaction, result.payload);
  }
  return (({
    ...action,
    payload: result.payload,
    meta: { ...action.meta, success: result.success, completed: true }
  }: any): ResultAction);
};

const handleJsError = (error: Error): ResultAction =>
  (({
    type: JS_ERROR,
    meta: { error, success: false, completed: true }
  }: any): ResultAction);

const send = (
  action: OfflineAction,
  dispatch: any => any,
  config: Config,
  retries: number = 0
) => {
  const metadata = action.meta.offline;
  dispatch(busy(true));
  return config
    .effect(metadata.effect, action)
    .then(result => {
      const commitAction =
        metadata.commit ||
        ({
          ...config.defaultCommit,
          meta: { ...config.defaultCommit.meta, offlineAction: action }
        }: DefaultAction);
      try {
        return dispatch(
          complete(
            commitAction,
            { success: true, payload: result },
            action,
            config
          )
        );
      } catch (error) {
        return dispatch(handleJsError(error));
      }
    })
    .catch(async error => {
      const rollbackAction =
        metadata.rollback ||
        ({
          ...config.defaultRollback,
          meta: { ...config.defaultRollback.meta, offlineAction: action }
        }: DefaultAction);

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
        } else if (!config.discardOnRetryCountExceeded) {
          return dispatch(retryCountExceeded());
        }
      }

      return dispatch(
        complete(
          rollbackAction,
          { success: false, payload: error },
          action,
          config
        )
      );
    })
    .finally(() => dispatch(busy(false)));
};

export default send;
