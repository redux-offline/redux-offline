// @flow
// Literal ACTION typing allows to ensure a stricter type than string

export const OFFLINE_STATUS_CHANGED: 'Offline/STATUS_CHANGED' =
  'Offline/STATUS_CHANGED';
export const OFFLINE_SCHEDULE_RETRY: 'Offline/SCHEDULE_RETRY' =
  'Offline/SCHEDULE_RETRY';
export const OFFLINE_COMPLETE_RETRY: 'Offline/COMPLETE_RETRY' =
  'Offline/COMPLETE_RETRY';
export const OFFLINE_RETRY_COUNT_EXCEEDED: 'Offline/RETRY_COUNT_EXCEEDED' = 
  'Offline/RETRY_COUNT_EXCEEDED';
export const OFFLINE_RESET_RETRY_COUNT: 'Offline/RESET_RETRY_COUNT' = 
  'Offline/RESET_RETRY_COUNT';
export const OFFLINE_SEND: 'Offline/SEND' = 'Offline/SEND';
export const OFFLINE_BUSY: 'Offline/BUSY' = 'Offline/BUSY';
export const RESET_STATE: 'Offline/RESET_STATE' = 'Offline/RESET_STATE';
export const PERSIST_REHYDRATE: 'persist/REHYDRATE' = 'persist/REHYDRATE';
export const JS_ERROR: 'Offline/JS_ERROR' = 'Offline/JS_ERROR';
export const DEFAULT_COMMIT: 'Offline/DEFAULT_COMMIT' =
  'Offline/DEFAULT_COMMIT';
export const DEFAULT_ROLLBACK: 'Offline/DEFAULT_ROLLBACK' =
  'Offline/DEFAULT_ROLLBACK';
