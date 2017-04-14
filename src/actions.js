import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY
} from './constants';

export const networkStatusChanged = online => ({
  type: OFFLINE_STATUS_CHANGED,
  payload: {
    online
  }
});

export const scheduleRetry = (delay = 0) => ({
  type: OFFLINE_SCHEDULE_RETRY,
  payload: {
    delay
  }
});

export const completeRetry = (action, retryToken) => ({
  type: OFFLINE_COMPLETE_RETRY,
  payload: action,
  meta: { retryToken }
});

export const busy = isBusy => ({
  type: OFFLINE_BUSY,
  payload: { busy: isBusy }
});
