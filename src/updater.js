// @flow
/* global $Shape */

import type {
  OfflineStatusChangeAction,
  OfflineScheduleRetryAction,
  PersistRehydrateAction,
  OfflineAction,
  OfflineState,
  ResultAction,
  Config
} from './types';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_COMPLETE_RETRY,
  OFFLINE_BUSY,
  RESET_STATE,
  PERSIST_REHYDRATE
} from './constants';
import mergeConfigs from './mergeConfigs';

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

type Dequeue = $PropertyType<$PropertyType<Config, 'queue'>, 'dequeue'>;
type Enqueue = $PropertyType<$PropertyType<Config, 'queue'>, 'enqueue'>;

export const buildOfflineUpdater = (dequeue: Dequeue, enqueue: Enqueue, key) =>
  function offlineUpdater(
    state: OfflineState = initialState,
    action:
      | OfflineStatusChangeAction
      | OfflineScheduleRetryAction
      | ResultAction
      | PersistRehydrateAction
  ): OfflineState {
    if (action.key != null && action.key !== key) {
      return state;
    }

    // Update online/offline status
    if (action.type === OFFLINE_STATUS_CHANGED && !action.meta) {
      return {
        ...state,
        online: action.payload.online,
        netInfo: action.payload.netInfo
      };
    }

    if (action.type === PERSIST_REHYDRATE && action.payload) {
      return {
        ...state,
        ...(action.payload.offline || {}),
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
        retryScheduled: true,
        retryCount: state.retryCount + 1
      };
    }

    if (action.type === OFFLINE_COMPLETE_RETRY) {
      return { ...state, retryScheduled: false };
    }

    if (
      action.type === OFFLINE_BUSY &&
      !action.meta &&
      action.payload &&
      typeof action.payload.busy === 'boolean'
    ) {
      return { ...state, busy: action.payload.busy };
    }

    // Add offline actions to queue
    if (action.meta && action.meta.offline) {
      const transaction = state.lastTransaction + 1;
      const stamped = (({
        ...action,
        meta: { ...action.meta, transaction }
      }: any): OfflineAction);
      const offline = state;
      return {
        ...state,
        lastTransaction: transaction,
        outbox: enqueue(offline.outbox, stamped, { offline })
      };
    }

    // Remove completed actions from queue (success or fail)
    if (action.meta && action.meta.completed === true) {
      const offline = state;
      return {
        ...state,
        outbox: dequeue(offline.outbox, action, { offline }),
        retryCount: 0
      };
    }

    if (action.type === RESET_STATE) {
      return {
        ...initialState,
        online: state.online,
        netInfo: state.netInfo
      };
    }

    return state;
  };

export const enhanceReducer = (reducer: any, userConfig: $Shape<Config>) => {
  const config = mergeConfigs(userConfig);

  const { dequeue, enqueue } = config.queue;
  const offlineUpdater = buildOfflineUpdater(dequeue, enqueue, config.key);

  return (state: any, action: any): any => {
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
};
