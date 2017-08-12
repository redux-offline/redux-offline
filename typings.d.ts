declare module 'redux-offline' {
  import { createStore as createReduxStore, Store, StoreEnhancer } from 'redux';

  export interface ResultAction {
    meta: {
      completed: boolean;
      success: boolean;
    };
    payload?: object;
    type: string;
  }

  export interface OfflineMetadata {
    commit: ResultAction;
    effect: object;
    rollback: ResultAction;
  }

  export interface Receipt {
    message: OfflineMetadata;
    result: object;
    success: boolean;
  }

  export interface OfflineAction {
    meta: {
      offline: OfflineMetadata;
      transaction?: number;
    };
    payload?: object;
    type: string;
  }

  export type Outbox = OfflineAction[];

  export interface OfflineState {
    lastTransaction: number;
    online: boolean;
    outbox: Outbox;
    receipts: Receipt[];
    retryCount: number;
    retryScheduled: boolean;
    retryToken: number;
  }

  export interface AppState {
    offline: OfflineState;
  }

  type NetworkCallback = (result: boolean) => void;

  export interface Config {
    batch: (outbox: Outbox) => Outbox;
    detectNetwork: (callback: NetworkCallback) => void;
    discard: (error: any, action: OfflineAction, retries: number) => boolean;
    effect: (effect: any, action: OfflineAction) => Promise<any>;
    persist: (store: any) => any;
    persistCallback: () => any;
    persistOptions: { [key: string]: any };
    rehydrate?: boolean;
    retry: (action: OfflineAction, retries: number) => number | void;
  }

  export const offline: (config: Config) => (createStore: typeof createReduxStore) =>
    <T extends { [key: string]: any }>(
      reducer: (state: T, action: any) => T,
      preloadedState: T,
      enhancer: StoreEnhancer<T>,
    ) => Store<T>;
}

declare module 'redux-offline/lib/defaults' {
  import { Config } from 'redux-offline';

  const config: Config;
  export default config;
}
