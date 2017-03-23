// @flow
/* global $Shape*/

import type { AppState, OfflineState, OfflineAction, ResultAction } from './types';

type ControlAction =
  | { type: 'Offline/STATUS_CHANGED', payload: { online: boolean } }
  | { type: 'Offline/SCHEDULE_RETRY' };

const get = (state: AppState): OfflineState => {
  return state.offline;
};

const update = (state: AppState, fragment: $Shape<OfflineState>): AppState => {
  return { ...state, offline: { ...state.offline, ...fragment } };
};

const enqueue = (state: AppState, action: any): AppState => {
  const transaction = get(state).lastTransaction + 1;
  const stamped = { ...action, meta: { ...action.meta, transaction } };
  const outbox = get(state).outbox;
  return update(state, {
    lastTransaction: transaction,
    outbox: [...outbox, stamped]
  });
};

const dequeue = (state: AppState): AppState => {
  const [, ...rest] = get(state).outbox;
  return update(state, { outbox: rest });
};

const initialState: OfflineState = {
  lastTransaction: 0,
  online: false,
  outbox: [],
  receipts: []
};

// @TODO: the typing of this is all kinds of wack

const offlineUpdater = function offlineUpdater(
  state: AppState,
  action: ControlAction | OfflineAction | ResultAction
): AppState {
  // Initial state
  if (!get(state || {})) {
    return update(state || {}, initialState);
  }

  // Update online/offline status
  if (
    action.type === 'Offline/STATUS_CHANGED' &&
    action.payload &&
    typeof action.payload.online === 'boolean'
  ) {
    return update(state, { online: action.payload.online });
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

export const enhanceReducer = (reducer: any) => (state: any, action: any) => {
  return offlineUpdater(reducer(state, action), action);
};
