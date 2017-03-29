import * as CONSTANTS from 'constants';

export const networkStatusChanged = online => ({
  type: CONSTANTS.OFFLINE_STATUS_CHANGED,
  payload: {
    online
  }
});

export const scheduleRetry = (delay = 0) => ({
  type: CONSTANTS.OFFLINE_SCHEDULE_RETRY,
  payload: {
    delay
  }
});

export const completeRetry = (action, retryToken) => ({
  type: CONSTANTS.OFFLINE_COMPLETE_RETRY,
  payload: action,
  meta: { retryToken }
});

export const complete = (action: ResultAction, success: boolean, payload: {}): ResultAction => ({
  ...action,
  payload,
  meta: {
    ...action.meta,
    success,
    completed: true
  }
});
