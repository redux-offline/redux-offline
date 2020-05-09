declare module '@redux-offline/redux-offline/lib/defaults' {
  import { Config } from '@redux-offline/redux-offline/lib/types';

  const config: Config;
  export default config;
}

declare module '@redux-offline/redux-offline/lib/types' {
  export interface ResultAction {
    meta: {
      completed: boolean;
      success: boolean;
    };
    payload?: object;
    type: string;
  }

  export interface OfflineMetadata {
    commit?: ResultAction;
    effect: object;
    rollback?: ResultAction;
  }

  export interface OfflineAction {
    meta: {
      offline: OfflineMetadata;
      transaction?: number;
    };
    payload?: object;
    type: string;
  }

  export interface NetInfo {
    isConnectionExpensive?: boolean;
    reach: string;
  }

  export interface OfflineStatusChangeAction {
    payload: {
      netInfo?: NetInfo;
      online: boolean;
    };
    type: string;
  }

  export interface OfflineScheduleRetryAction {
    type: string;
  }

  export type Outbox = OfflineAction[];

  export interface OfflineState {
    busy: boolean;
    lastTransaction: number;
    netInfo?: NetInfo;
    online: boolean;
    outbox: Outbox;
    retryCount: number;
    retryCountExceeded: boolean;
    retryScheduled: boolean;
  }

  export interface PersistRehydrateAction {
    payload: {
      offline: OfflineState;
    };
    type: string;
  }

  export interface AppState {
    offline: OfflineState;
  }

  export type NetworkCallback = (result: boolean) => void;

  export interface Config {
    defaultCommit: { type: string };
    defaultRollback: { type: string };
    detectNetwork: (callback: NetworkCallback) => void;
    discard: (error: any, action: OfflineAction, retries: number) => boolean;
    discardOnRetryCountExceeded: boolean;
    effect: (effect: any, action: OfflineAction) => Promise<any>;
    offlineStateLens: (
      state: any,
    ) => { get: OfflineState, set: (offlineState?: OfflineState) => any };
    persist: (store: any) => any;
    persistAutoRehydrate: (config?: { [key: string]: any }) => (next: any) => any;
    persistCallback: (callback?: any) => any;
    persistOptions: { [key: string]: any };
    retry: (action: OfflineAction, retries: number) => number | void;
    queue: {
      enqueue: (
        array: Array<OfflineAction>,
        item: OfflineAction,
        context: { offline: OfflineState }
      ) => Array<OfflineAction>,
      dequeue: (
        array: Array<OfflineAction>,
        item: ResultAction,
        context: { offline: OfflineState }
      ) => Array<OfflineAction>,
      peek: (
        array: Array<OfflineAction>,
        item: any,
        context: { offline: OfflineState }
      ) => OfflineAction
    };
    offlineActionTracker: {
      registerAction: (transaction: number) => Promise<any> | (() => void),
      resolveAction: (transaction: number, value: any) => void | (() => void),
      rejectAction: (transaction: number, error: Error) => void | (() => void)
    };
    returnPromises?: boolean;
    rehydrate?: boolean;
  }
}

declare module '@redux-offline/redux-offline/lib/constants' {
  export const DEFAULT_ROLLBACK: string;
  export const DEFAULT_COMMIT: string;
  export const JS_ERROR: string;
  export const PERSIST_REHYDRATE: string;
  export const RESET_STATE: string;
  export const OFFLINE_BUSY: string;
  export const OFFLINE_SEND: string;
  export const OFFLINE_RETRY_COUNT_EXCEEDED: string;
  export const OFFLINE_RESET_RETRY_COUNT: string;
  export const OFFLINE_COMPLETE_RETRY: string;
  export const OFFLINE_SCHEDULE_RETRY: string;
  export const OFFLINE_STATUS_CHANGED: string;
}

declare module '@redux-offline/redux-offline' {
  import { createStore as createReduxStore, Store, StoreEnhancer, Dispatch, Middleware } from 'redux';

  import { Config } from '@redux-offline/redux-offline/lib/types';

  export const offline: (userConfig: Partial<Config>) => (createStore: typeof createReduxStore) =>
    <T extends { [key: string]: any }>(
      reducer: (state: T, action: any) => T,
      preloadedState: T,
      enhancer: StoreEnhancer<T>,
    ) => Store<T>;

  export const createOffline: (userConfig: Partial<Config>) => ({
    enhanceReducer: (reducer: any) => (state: any, action: any) => any,
    enhanceStore: (next: any) => <T extends { [key: string]: any }>(
      reducer: (state: T, action: any) => T,
      preloadedState: T,
      enhancer: StoreEnhancer<T>,
    ) => Store<T>,
    middleware: Middleware
  });
}
