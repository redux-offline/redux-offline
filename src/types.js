// @flow
import {
  DEFAULT_COMMIT,
  DEFAULT_ROLLBACK,
  OFFLINE_STATUS_CHANGED,
  OFFLINE_SCHEDULE_RETRY,
  PERSIST_REHYDRATE
} from './constants';

export type ResultAction = {
  type: typeof DEFAULT_COMMIT | typeof DEFAULT_ROLLBACK,
  payload: ?{},
  meta: {
    success: boolean,
    completed: boolean
  }
};

export type OfflineMetadata = {
  effect: {},
  commit?: ResultAction,
  rollback?: ResultAction
};

// User passed action
// it is impossible to use a type literal for it,
// since it can be any user passed string
export type OfflineAction = {
  type: string,
  payload: ?{},
  meta: {
    transaction?: number,
    offline: OfflineMetadata
  }
};

export type NetInfo = {
  isConnectionExpensive: ?boolean,
  reach: string
};

export type OfflineStatusChangeAction = {
  type: typeof OFFLINE_STATUS_CHANGED,
  payload: {
    online: boolean,
    netInfo?: NetInfo
  }
};

export type OfflineScheduleRetryAction = {
  type: typeof OFFLINE_SCHEDULE_RETRY
};

export type Outbox = Array<OfflineAction>;

export type OfflineState = {
  busy: boolean,
  lastTransaction: number,
  online: boolean,
  outbox: Outbox,
  netInfo?: NetInfo,
  retryCount: number,
  retryScheduled: boolean
};

export type PersistRehydrateAction = {
  type: typeof PERSIST_REHYDRATE,
  payload: {
    offline: OfflineState
  }
};

export type AppState = {
  offline: OfflineState
};

type NetworkCallback = (result: boolean) => void;

export type Config = {
  detectNetwork: (callback: NetworkCallback) => void,
  persist: (store: any, options: {}, callback: () => void) => any,
  effect: (effect: any, action: OfflineAction) => Promise<*>,
  retry: (action: OfflineAction, retries: number) => ?number,
  discard: (error: any, action: OfflineAction, retries: number) => boolean,
  persistOptions: {},
  persistCallback: (callback: any) => any,
  defaultCommit: { type: string },
  defaultRollback: { type: string },
  persistAutoRehydrate: (config: ?{}) => (next: any) => any,
  offlineStateLens: (
    state: any
  ) => { get: OfflineState, set: (offlineState: ?OfflineState) => any },
  queue: {
    enqueue: (
      array: Array<OfflineAction>,
      item: OfflineAction
    ) => Array<OfflineAction>,
    dequeue: (
      array: Array<OfflineAction>,
      item: ResultAction
    ) => Array<OfflineAction>,
    peek: (array: Array<OfflineAction>) => OfflineAction
  }
};
