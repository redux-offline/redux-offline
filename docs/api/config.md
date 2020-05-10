# `config`

Redux Offline supports the following configuration properties:

```js
type Config = {
  defaultCommit: { type: string },
  defaultRollback: { type: string },
  detectNetwork: (callback: NetworkCallback) => void,
  discard: (error: any, action: OfflineAction, retries: number) => boolean|Promise<boolean>,
  discardOnRetryCountExceeded: boolean,
  effect: (effect: any, action: OfflineAction) => Promise<*>,
  offlineStateLens: (
    state: any
  ) => { get: OfflineState, set: (offlineState: ?OfflineState) => any },
  persist: (store: any, options: {}, callback: () => void) => any,
  persistAutoRehydrate: (config: ?{}) => (next: any) => any,
  persistCallback: (callback: any) => any,
  persistOptions: {},
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
  },
  retry: (action: OfflineAction, retries: number) => ?number,
  returnPromises: boolean
};
```

## defaultCommit

The default action to be dispatched when an offline action is successfully resolved. This is only used when there is not a commit action defined on a offline action.

The default action has its payload set to the result of the effects reconciler just as a normal commit action would.

## defaultRollback

The default action to be dispatched when an offline action is discarded. This is only used when there is not a rollback action defined on a offline action.

The default action has its payload set to the error thrown by the effects reconciler just as a normal rollback action would.

## detectNetwork

Responsible for communicating network status changes to Redux Offline through the provided callback.

The function is passed a callback, which you should call with boolean `true` when the app gets back online, and `false` when it goes offline. Additionally you can call it with an object containing as props `online` and `netInfo`. The `online` is a boolean that defines whether there's connection or not, the `netInfo` is an optional object containing details about the current network.

The default _detectNetwork.js_ provides an object with `online` as the only property.

The default _detectNetwork.native.js_ provides both the `online` and the `netInfo` props following `react-native` netInfo possible values. The payload object would follow the following example:

```js
/**
* netInfo reach values follow react-native's NetInfo values
* Cross-platform: ['none', 'wifi', 'cellular', 'unknown']
* Android: ['bluetooth', 'ethernet', 'wimax']
*/
const payload = {
  online: true, // determines the connection status
  netInfo: {
    reach: 'wifi', // network reach as provided by react native
    isConnectionExpensive: false // whether connection is metered (only supported by android)
  }
};
```

## discard

Decides whether a request should be retried or not. Tightly coupled with `config.effect`.

Receives the rejection error from `config.effect`, the related offline action, and the number of times the request has been retried. Returns or resolves to a boolean representing if the action should be discarded (as opposed to retried).

The default implementation discards only on client errors.

See [Customize Requests](../recipes/customize-requests.md) for more details.

## discardOnRetryCountExceeded

Determines what happens to a request after it has been automatically retried the number of times indicated in `config.retry`.  When true (default), the request will simply be discarded. When false, the request will remain in the outbox, but will no longer be automatically retried. 

## effect

The effect reconciler resolves offline actions to network requests.

Called with `action.meta.offline.effect` and the action itself, this method must return a Promise. Resolve the promise if the request is a success and reject otherwise. If rejected, the error will be used by `config.discard` to decide whether to attempt the request again.

See [Customize Requests](../recipes/customize-requests.md) for more details.

## offlineStateLens

Determines how the offline state is accessed and updated.

The default implementation:

```js
(state: any) => {
  const { offline, ...rest } = state;
  return {
    get: offline,
    set: (offlineState: any) =>
      typeof offlineState === 'undefined'
        ? rest
        : { offline: offlineState, ...rest }
  };
};
```

## persist

Maintain a copy of the state in some persistent storage.

Redux Offline uses [Redux Persist v4](https://github.com/rt2zz/redux-persist/tree/v4) by default. It is not recommended to write your own implementation for this feature. You can, however, pass a falsey value to prevent the state from being persisted.

## persistAutoRehydrate

Store enhancer that loads persisted state.

Redux Offline uses the default implementation from [Redux Persist v4](https://github.com/rt2zz/redux-persist/tree/v4). It is not recommended that you replace this function.

## persistCallback

Called when the state has been rehydrated.

Rehydration is fast but not instantaneous, so it is a good idea to delay rendering until the store has been rehydrated.

```js
const persistCallback = () => {
  ReactDOM.render(
    document.getElementById('root'),
    <Provider store={store}>
      <MyApp />
    </Provider>
  );
}
```

## persistOptions

Config object provided to `config.persist` as follows:

```js
config.persist(store, config.persistOptions, config.persistCallback);
```

For details on the available options, refer to the [Redux Persist v4 docs](https://github.com/rt2zz/redux-persist/tree/v4#persiststorestore-config-callback);

## queue

Configure how offline actions are stored, accessed, and discarded.

### queue.enqueue

Save an offline action when it is first dispatched.

```js
import defaultQueue from '@redux-offline/redux-offline/lib/defaults/queue';

const getMethod = action => action.meta.offline.effect.method || "GET";
const getUrl = action => action.meta.offline.effect.url;

// Last Value Queue
// Only keep the last action for each URL-method pair.
const config = {
  queue: {
    ...defaultQueue,
    enqueue(array, action) {
      const newArray = array.filter(item =>
        !(getMethod(item) === getMethod(action) && getUrl(item) === getUrl(action))
      );
      newArray.push(action);
      return newArray;
    }
  }
};
```

### queue.dequeue

Remove an offline action when it has been successfully resolved or discarded.

### queue.peek

Retrieve the next offline action to be resolved.

## retry

Determine the delay for retrying requests.

Accepts the offline action representing the request and the number of times already attempted. Returns either the number of milliseconds to wait before retrying, or `null` if the retry count has been exceeded.

The default implementation uses the following schedule to retry requets:

* After 1 seconds
* After 5 seconds
* After 15 seconds
* After 30 seconds
* After 1 minute
* After 3 minutes
* After 5 minutes
* After 10 minutes
* After 30 minutes
* After 1 hour

If a request fails after this point, what happens next is determined by the `config.discardOnRetryCountExceeded` flag. 

If the flag is true (default), the request will be discarded, and the next item in the outbox will be processed. 

If the flag is false, the request will remain in the outbox, blocking processing of subsequent requests. Additionally, the `retryCountExceeded` flag will be set to true in the reducer. Dispatching `OFFLINE_RESET_RETRY_COUNT` will reset the retry count of the request, causing the automatic retry behavior to start over.

## returnPromises

> WARNING: This is an experimental feature and might change.

Toggle whether dispatch returns promises for offline actions. Defaults to false.

`store.dispatch()` returns a promise that you can use to chain behavior off offline actions, but be careful! A chief benefit of this library is that requests are tried across sessions, but promises do not last that long. So if you use this feature, know that your promise might not get resolved, even if the associated request is eventually delivered.
