// @flow

export type ResultAction = {
  type: string,
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

export type OfflineAction = {
  type: string,
  payload?: {},
  meta: {
    transaction?: number,
    offline: OfflineMetadata
  }
};

export type Outbox = Array<OfflineAction>;

export type OfflineState = {
  lastTransaction: number,
  online: boolean,
  outbox: Outbox,
  retryCount: number,
  retryScheduled: boolean
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
  ) => { get: OfflineState, set: (offlineState: ?OfflineState) => any }
};
