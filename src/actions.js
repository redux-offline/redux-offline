import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY
} from './constants';

export const networkStatusChanged = (params, key) => {
  let payload;
  if (typeof params === 'object') {
    payload = params;
  } else {
    payload = { online: params };
  }
  return {
    type: OFFLINE_STATUS_CHANGED,
    payload,
    key
  };
};

export const scheduleRetry = (delay = 0, key) => ({
  type: OFFLINE_SCHEDULE_RETRY,
  payload: {
    delay
  },
  key
});

export const completeRetry = (action, key) => ({
  type: OFFLINE_COMPLETE_RETRY,
  payload: action,
  key
});

export const busy = (isBusy, key) => ({
  type: OFFLINE_BUSY,
  payload: { busy: isBusy },
  key
});
