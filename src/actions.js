import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY
} from './constants';

export const networkStatusChanged = (params, namespace) => {
  let payload;
  if (typeof params === 'object') {
    payload = params;
  } else {
    payload = { online: params };
  }
  return {
    type: OFFLINE_STATUS_CHANGED,
    payload,
    namespace
  };
};

export const scheduleRetry = (delay = 0, namespace) => ({
  type: OFFLINE_SCHEDULE_RETRY,
  payload: {
    delay
  },
  namespace
});

export const completeRetry = (action, namespace) => ({
  type: OFFLINE_COMPLETE_RETRY,
  payload: action,
  namespace
});

export const busy = (isBusy, namespace) => ({
  type: OFFLINE_BUSY,
  payload: { busy: isBusy },
  namespace
});
