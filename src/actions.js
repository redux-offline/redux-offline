export const networkStatusChanged = online => ({
  type: 'Offline/STATUS_CHANGED',
  payload: {
    online
  }
});
