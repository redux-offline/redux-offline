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

export type Config = {
  strategy: {
    network: () => Promise<*>,
    retry: (action: OfflineAction, retries: number) => ?Retry,
    batching: (outbox: Outbox) => Outbox
  }
};
