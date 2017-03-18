// @flow

export type ResultAction = {
  type: string,
  payload: ?{},
  meta: ?{}
};

export type Message = {
  effect: {},
  commit: ResultAction,
  rollback: ResultAction
};

export type Receipt = {|
  message: Message,
  success: boolean,
  result: {}
|};

export type Outbox = Array<Message>;

export type OfflineState = {|
  online: boolean,
  outbox: Outbox,
  receipts: Array<Receipt>
|};

export type OfflineAction = {
  type: string,
  payload?: {},
  meta: {
    offline: Message
  }
};

export type State = {
  offline: OfflineState
};
