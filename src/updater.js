// @flow
/* global */

import type { OfflineState, OfflineAction, ResultAction } from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  PERSIST_REHYDRATE
} from './constants';

type ControlAction =
  | { type: OFFLINE_STATUS_CHANGED, payload: { online: boolean } }
  | { type: OFFLINE_SCHEDULE_RETRY };

const enqueue = (state: OfflineState, action: any): OfflineState => {
  const transaction = state.lastTransaction + 1;
  const stamped = { ...action, meta: { ...action.meta, transaction } };
  const outbox = state.outbox;
  return {
    ...state,
    lastTransaction: transaction,
    outbox: [...outbox, stamped]
  };
};

const dequeue = (state: OfflineState): OfflineState => {
  const [, ...rest] = state.outbox;
  return { ...state, outbox: rest, retryCount: 0, busy: false };
};

const initialState: OfflineState = {
  busy: false,
  lastTransaction: 0,
  online: false,
  outbox: [],
  receipts: [],
  retryToken: 0,
  retryCount: 0,
  retryScheduled: false
};

// @TODO: the typing of this is all kinds of wack

const offlineUpdater = function offlineUpdater(
  state: OfflineState = initialState,
  action: ControlAction | OfflineAction | ResultAction
): OfflineState {
  // Update online/offline status
  if (
    action.type === OFFLINE_STATUS_CHANGED &&
    action.payload &&
    typeof action.payload.online === 'boolean'
  ) {
    return { ...state, online: action.payload.online };
  }

  if (action.type === PERSIST_REHYDRATE) {
    if (action.payload.offline) delete action.payload.offline.online;
    return { ...state, ...action.payload.offline, busy: false };
  }

  if (action.type === OFFLINE_SCHEDULE_RETRY) {
    return {
      ...state,
      busy: false,
      retryScheduled: true,
      retryCount: state.retryCount + 1,
      retryToken: state.retryToken + 1
    };
  }

  if (action.type === OFFLINE_COMPLETE_RETRY) {
    return { ...state, retryScheduled: false };
  }

  if (action.type === OFFLINE_BUSY && action.payload && typeof action.payload.busy === 'boolean') {
    return { ...state, busy: action.payload.busy };
  }

  // Add offline actions to queue
  if (action.meta && action.meta.offline) {
    return enqueue(state, action);
  }

  // Remove completed actions from queue (success or fail)
  if (action.meta != null && action.meta.completed === true) {
    return dequeue(state);
  }

  return state;
};

export const enhanceReducer = (reducer: any) =>
  (state: any, action: any) => {
    let offlineState;
    let restState;
    if (typeof state !== 'undefined') {
      const { offline, ...rest } = state;
      offlineState = offline;
      restState = rest;
    }

    return {
      ...reducer(restState, action),
      offline: offlineUpdater(offlineState, action)
    };
  };
