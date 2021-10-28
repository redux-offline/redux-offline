# offline-side-effects

The JS focused library for offline first async side effects. This library takes all the learnings of building Redux-Offline and extracts them into a pure JS module that can be used in almost any context.

The main aspects that this library focuses on are:

- Requests pausing and recording when offline
- Optimistic updates
- Request retries using exponential backoff
- Rollback on errors
- Requests persistence across sessions

## Options
The library accepts some config options for high level customisation:
```ts
type Options = {
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
```
## API

The library contains 3 actors: Middleware, Listeners and Triggers. The different parts of the system are glued together by the Context object.

### Context

The Context is an object that contains the provided options, the provided listeners, and the state updater. The Context object provides everything you need to alter the internals of the library.

```ts
type Context = {
  updater: Updater;
  options: Options;
  listeners: Listeners;
};
```

### Updater

The updater is a tuple that holds the internal state, and an updateState function. It can be used to read/update the internal state.

```ts
type State = {
  outbox: Action[];
  status: 'idle' | 'busy' | 'paused';
  retryScheduled: number | null;
  retryCount: number;
  lastTransaction: number;
};
type UpdateState = (type: Updates, payload?: any) => void;
type Updater = [State, UpdateState];
```

### Middleware

The middleware are functions that perform a specific step in the side effect lifecycle.
The library comes with the following default middleware chain:

```js
const defaultMiddlewareChain = [processOutbox, send, retry];
```

- **Process Outbox.** In charge of peeking the next action, checking if it's safe to perform a side-effect, and awaiting for the retry time to expire. We say a side-effect is safe to be performed when the state is idle and the next action exists.
- **Send.** Receives the peeked action from **Process Outbox**, performs the side-effect, and if successful commits with the received data.
- **Retry.** Receives the error and peeked action from **Send**, if error is defined checks if needs to discard based on the retry count. In case of discarding, rollback with the error. If it doesn't need to discard, schedules a retry attempt.

A middleware will receive as first argument the async function `next`, the remaining arguments will be whatever the previous middleware in the chain passed as arguments when calling `next`. If the `next` function is not called, the middleware chain will finish.

```js
// Example

const processOutbox = async next => {
  const action = peek(outbox);
  if (action) {
    await next(action); // where next will be the "send" middleware
  }
};

const send = async (next, action) => {
  const response = await fetch(action.meta.url);
  const data = await response.json();
  await next(data, action); // in this case, the "store" middleware will receive as arguments data and action
};

const store = async (next, data, action) => {
  await idb.save(action.meta.key, data);
  next(); // and so on, until the chain is over or a middleware doesn't call next().
};
```

### Listeners

The listeners are callbacks that can be called from within any Middleware, or Triggers. These are the appropriate mechanism for sharing the internal library state with the userland application code.
The library provides some default listeners that are being used by the default middleware and triggers. But the user can extend these to include any other listener that they deem necessary. This is very useful because the user can define a custom middleware that in turn has access to custom listeners.

```ts
export type Listeners = {
  [customListenerName: string]: (...args: any[]) => void;
  onRequest: (action: Action) => void;
  onCommit: (data: unknown, action: Action['meta']['commit']) => void;
  onRollback: (error: UnknownError, action: Action['meta']['rollback']) => void;
  onStatusChange: (status: string) => void;
  onSerialize: (state: State) => void;
  onRetry: (delay: number) => void;
};
```

### Triggers

The triggers are the way the userland application code signals the library that something happened that should run the side-effects stream.

The library defines the following triggers:

- `actionWasRequested: (action: Action) => void`
  You call this function to add a new side-effect action.
- `togglePause: (paused: boolean) => void` You call this function to pause the side-effect stream. Useful for pausing the requests when there's no internet connection.
- `rehydrateState: (newState: State) => void` You call this function when you want to load the outbox from a persisted source.
- `restartProcess: () => void` You call this function when you want to force restart the side-effect stream.
- `resetState: () => void` You call this function when you want to reset the internal state to the initial values. Useful for when you want to logout from an application.
