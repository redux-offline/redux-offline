import { OFFLINE_STATUS_CHANGED } from 'constants';

export const networkStatusChanged = online => ({
  type: OFFLINE_STATUS_CHANGED,
  payload: {
    online
  }
});
