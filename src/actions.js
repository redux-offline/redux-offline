import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY
} from './constants';

export const networkStatusChanged = params => {
  let payload;
  if (typeof params === 'object') {
    payload = params;
  } else {
    payload = { online: params };
  }
  return {
    type: OFFLINE_STATUS_CHANGED,
    payload
  };
};

export const scheduleRetry = (delay = 0) => ({
  type: OFFLINE_SCHEDULE_RETRY,
  payload: {
    delay
  }
});

export const completeRetry = action => ({
  type: OFFLINE_COMPLETE_RETRY,
  payload: action
});

export const busy = isBusy => ({
  type: OFFLINE_BUSY,
  payload: { busy: isBusy }
});
