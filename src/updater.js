// @flow
/* global $Shape */

import _ from 'lodash'

import type {
  OfflineState,
  OfflineAction,
  ResultAction,
  Config
} from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE,
  DEQUEUE_ACTION
} from './constants';

type ControlAction =
  | { type: OFFLINE_STATUS_CHANGED, payload: { online: boolean } }
  | { type: OFFLINE_SCHEDULE_RETRY };

const enqueue = (state: OfflineState, action: any): OfflineState => {
  const transaction = state.lastTransaction + 1;
  const stamped = { ...action, meta: { ...action.meta, transaction } };
  const { outbox } = state;
  return {
    ...state,
    lastTransaction: transaction,
    outbox: [...outbox, stamped]
  };
};

const dequeue = (state: OfflineState): OfflineState => {
  const [, ...rest] = state.outbox;
  return {
    ...state,
    outbox: rest,
    retryCount: 0,
    busy: false
  };
};

const dequeueAction = (state: OfflineState, dequeueAction): OfflineState => {
  const newOutbox = [];
  for (const action of state.outbox) {
    if (action.type === dequeueAction.payload.type) {
      if (_.isEqual(action.payload, dequeueAction.payload.payload)) {
        continue;
      }
      newOutbox.push(action);
    }
  }
  return {
    ...state,
    outbox: newOutbox,
    retryCount: 0,
    busy: false
  };
};

const initialState: OfflineState = {
  busy: false,
  lastTransaction: 0,
  online: false,
  outbox: [],
  retryCount: 0,
  retryScheduled: false,
  netInfo: {
    isConnectionExpensive: null,
    reach: 'NONE'
  }
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
    return {
      ...state,
      online: action.payload.online,
      netInfo: action.payload.netInfo
    };
  }

  if (action.type === PERSIST_REHYDRATE) {
    return {
      ...state,
      ...action.payload.offline,
      online: state.online,
      netInfo: state.netInfo,
      retryScheduled: initialState.retryScheduled,
      retryCount: initialState.retryCount,
      busy: initialState.busy
    };
  }

  if (action.type === OFFLINE_SCHEDULE_RETRY) {
    return {
      ...state,
      busy: false,
      retryScheduled: true,
      retryCount: state.retryCount + 1
    };
  }

  if (action.type === OFFLINE_COMPLETE_RETRY) {
    return { ...state, retryScheduled: false };
  }

  if (
    action.type === OFFLINE_BUSY &&
    action.payload &&
    typeof action.payload.busy === 'boolean'
  ) {
    return { ...state, busy: action.payload.busy };
  }

  // Add offline actions to queue
  if (action.meta && action.meta.offline) {
    return enqueue(state, action);
  }

  // Remove completed actions from queue (success or fail)
  if (action.meta && action.meta.completed === true) {
    return dequeue(state);
  }

  if (action.type === RESET_STATE) {
    return { ...initialState, online: state.online, netInfo: state.netInfo };
  }

  if (action.type === DEQUEUE_ACTION) {
    return dequeueAction(state, action);
  }

  return state;
};

export const enhanceReducer = (reducer: any, config: $Shape<Config>) => (
  state: any,
  action: any
) => {
  let offlineState;
  let restState;
  if (typeof state !== 'undefined') {
    offlineState = config.offlineStateLens(state).get;
    restState = config.offlineStateLens(state).set();
  }

  return config
    .offlineStateLens(reducer(restState, action))
    .set(offlineUpdater(offlineState, action));
};
