export enum Updates {
  toggleBusy = 'toggleBusy',
  enqueue = 'enqueue',
  dequeue = 'dequeue',
  pause = 'pause',
  rehydrate = 'rehydrate',
  scheduleRetry = 'scheduleRetry',
  completeRetry = 'completeRetry',
  reset = 'reset'
}
export type UpdateState = (type: Updates, payload?: any) => void;

export type Action<T = { [key: string]: any }, C = {}, R = {}> = T & {
  meta: {
    effect: string;
    commit: C;
    rollback: R;
    transaction?: number;
  };
};

export type State = {
  outbox: Action[];
  status: 'idle' | 'busy' | 'paused';
  retryScheduled: number | null;
  retryCount: number;
  lastTransaction: number;
};
export type Updater = [State, UpdateState];

type NetworkError = Error & { status: number };
type UnknownError = Error | NetworkError;

export type NextFn<Args extends any[]> = (...args: Args) => Promise<void>;

export type Middleware<PrevArgs extends any[], NextArgs extends any[]> = (
  next: NextFn<NextArgs>,
  ...args: PrevArgs
) => void;

export type ProcessOutboxMiddleware = Middleware<undefined[], [Action]>;
export type SendMiddleware = Middleware<[Action], [UnknownError, Action]>;
export type RetryMiddleware = Middleware<[UnknownError, Action], undefined[]>;

export type DefaultMiddlewareChain = [ProcessOutboxMiddleware, SendMiddleware, RetryMiddleware];

export type Listeners = {
  [customListenersName: string]: (...args: any[]) => void;
  onRequest: (action: Action) => void;
  onCommit: (data: unknown, action: Action['meta']['commit']) => void;
  onRollback: (error: UnknownError, action: Action['meta']['rollback']) => void;
  onStatusChange: (status: string) => void;
  onSerialize: (state: State) => void;
  onRetry: (delay: number) => void;
};

export type Stream = {
  start: () => void;
};

export type Context = {
  updater: Updater;
  options: Options;
  listeners: Listeners;
};

export type Options = {
  queue: {
    peek: (outbox: Action[]) => Action;
    enqueue: (outbox: Action[], action: Action) => Action[];
    dequeue: (outbox: Action[], completed: Action) => Action[];
  };
  effect: (requestInfo: RequestInfo) => Promise<unknown>;
  discard: (error: UnknownError, action: Action, retries: number) => Promise<boolean> | boolean;
  retry: (action: Action, retries: number) => number | null;
  alterStream: (
    defaultMiddlewareChain: DefaultMiddlewareChain,
    context: Context
  ) => Middleware<any, any>[];
};
