// @flow

import type { OfflineState, OfflineAction, ResultAction } from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE
} from './constants';

type ControlAction =
  | { type: OFFLINE_STATUS_CHANGED, payload: { online: boolean } }
  | { type: OFFLINE_SCHEDULE_RETRY };

export type Action = ControlAction | OfflineAction | ResultAction;

export const initialState: OfflineState = {
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

export const enqueue = (state: OfflineState, action: Action): OfflineState => {
  const transaction = state.lastTransaction + 1;
  const stamped = { ...action, meta: { ...action.meta, transaction } };
  const { outbox } = state;
  return {
    ...state,
    lastTransaction: transaction,
    outbox: [...outbox, stamped]
  };
};

export const dequeue = (state: OfflineState): OfflineState => {
  const [, ...rest] = state.outbox;
  return {
    ...state,
    outbox: rest,
    retryCount: 0,
    busy: false
  };
};

export default {
  [OFFLINE_STATUS_CHANGED](state: OfflineState, action: Action): ?OfflineState {
    if (!action.payload || typeof action.payload.online === 'boolean') {
      return null;
    }
    return {
      ...state,
      online: action.payload.online,
      netInfo: action.payload.netInfo
    };
  },
  [PERSIST_REHYDRATE](state: OfflineState, action: Action): OfflineState {
    return {
      ...state,
      ...action.payload.offline,
      online: state.online,
      netInfo: state.netInfo,
      retryScheduled: initialState.retryScheduled,
      retryCount: initialState.retryCount,
      busy: initialState.busy
    };
  },
  [OFFLINE_SCHEDULE_RETRY](state: OfflineState): OfflineState {
    return {
      ...state,
      busy: false,
      retryScheduled: true,
      retryCount: state.retryCount + 1
    };
  },
  [OFFLINE_COMPLETE_RETRY](state: OfflineState): OfflineState {
    return { ...state, retryScheduled: false };
  },
  [OFFLINE_BUSY](state: OfflineState, action: Action): ?OfflineState {
    if (!action.payload || typeof action.payload.busy !== 'boolean') {
      return null;
    }
    return {
      ...state,
      busy: action.payload.busy
    };
  },
  [RESET_STATE](state: OfflineState): OfflineState {
    return { ...initialState, online: state.online, netInfo: state.netInfo };
  }
};
