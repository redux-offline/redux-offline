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
  commit: ResultAction,
  rollback: ResultAction
};

export type Receipt = {
  message: OfflineMetadata,
  success: boolean,
  result: {}
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
  receipts: Array<Receipt>
};

export type AppState = {
  offline: OfflineState
};

export type Retry = {
  delay: number
};

type NetworkCallback = (result: boolean) => void;

export type Config = {
  strategies: {
    batch: (outbox: Outbox) => Outbox,
    detectNetwork: (callback: NetworkCallback) => void,
    persist: (store: any) => any,
    send: (effect: any, action: OfflineAction) => Promise<*>,
    retry: (action: OfflineAction, retries: number) => ?Retry
  }
};
