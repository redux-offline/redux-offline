# Redux Offline

Persistent Redux store for _Reasonaboutable_:tm: Offline-First applications, with first-class support for optimistic UI. Use with React, React Native, or as standalone state container for any web app.

## Contents

* [Quick start](#quick-start)
* [Offline Guide](#offlne-guide)
* [Configuration](#configuration)
* [API documentation](#api)
* [Contributing](#contributing)
* [Miscellanea](#miscellanea)


## Quick start

##### 1. Install with npm (or [Yarn](https://yarnpkg.com))
```sh
npm install --save redux-offline
```

##### 2. Replace [redux createStore](http://redux.js.org/docs/api/createStore.html) with [createOfflineStore](#createofflinestore)
```diff

- import { applyMiddleware, createStore } from 'redux';
+ import { applyMiddleware } from 'redux';
+ import { createOfflineStore } from 'redux-offline';
+ import offlineConfig from 'redux-offline/config/default';

// ...

- const store = createStore(
+ const store = createOfflineStore(
  reducer,
  preloadedState,
  applyMiddleware(middleware),
+ offlineConfig  
);
```

See [Configuration](#configuration) for overriding default configurations.

##### 3. Decorate actions with offline metadata

```js
const followUser = userId => ({
  type: 'FOLLOW_USER_REQUEST',
  payload: { userId },
  meta: {
    offline: {
      // the network action to execute:
      effect: { url: '/api/follow', method: 'POST', body: { userId } },
      // action to dispatch when effect succeeds:
      commit: { type: 'FOLLOW_USER_COMMIT', meta: { userId } },
      // action to dispatch if network action fails permanently:
      rollback: { type: 'FOLLOW_USER_ROLLBACK', meta: { userId } }
    }
  }
});

```

Read the [Offline Guide](#offline-guide) to understand how effects are executed, and how the actions are dispatched.


## Offline Guide

Making offline-friendly apps is not rocket science, but to make them work well involves dealing with finicky details around persisting state, resilience against flaky networks, optimistically updating user interface state, reliably reverting it back in case of failures, synchronising state in the background, and managing the evolution of the persistent state over long, long periods of time.

**Redux Offline** is a battle-tested offline-first architecture, and an _experimental_ library that implements it. To make use of the library, it'll be helpful to understand the architecture behind it.

### Persistence is key
In order to be able to render meaningful content when the user opens your application offline, your application state needs to be persisted to disk.

Instead of reinventing the wheel, Redux Offline uses the excellent [redux-persist](https://github.com/rt2zz/redux-persist) library. Your Redux store is saved to disk on every change, and reloaded automatically on startup. By default, browser environments will use [IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API) or WebSQL/localStorage fallbacks via [localForage](https://github.com/localForage/localForage), and [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) in React Native.

You can [configure every aspect of how your state is persisted](#todo).

### That's all she wrote

Persisting and rehydrating state (which is a term we use for reading the state back from the disk and into our store) will get us **Read**-resilience. Our app will work offline as long as the user only wants to read from the state. We also want to support **Write**-resilience: The user should be able to do (some) actions while offline, and be able to safely assume that they will eventually be reconciled and sent to our backend.

In order to support Write-resilience, we will store all network-bound actions in a queue inside our store. Redux Offline creates a state subtree called `offline`, where among other internal state needed by the library, it manages an array called `outbox`.

To be able to perform the network-bound actions after we come back online, we need to store all necessary data to perform the action, and metadata about what should happen afterwards. Redux Offline understands the following metadata:
```diff
type OfflineAction = {
  type: string,
  payload: any,
+ meta: {
+   offline: {
+     effect: any,
+     commit: Action,
+     rollback: Action
+   }
+ }
```

* `meta.offline.effect` is any data you want to send to the reconciler
* `meta.offline.commit` action will be fired once the network effect has been successfully sent
* `meta.offline.rollback` action will be fired if the network effect **permanently** fails (does not count network-related failures, which will be automatically retried).

### Optimism will get you to places

When the initial action has been dispatched, you can update your application state in your reducers as you normally would.

A common pattern for offline-friendly apps is to *optimistically update  UI state*. In practice, this means that as soon as user performs an action, we update the UI to look as if the action had already succeeded. This makes our applications resilient to network latency, and improves the perceived performance of our app.

When we optimistically update state, we need to ensure that if the action does permanently fail, the user is appropriately notified and the application state is rolled back. To allow you this opportunity, Redux Offline will fire the action you specified in `meta.offline.rollback`. If the rollback action does not have a payload, an error object returned by the effects reconciler will be set as the payload.

An example of an optimistic update:
```js
const action = userId => ({
  type: 'FOLLOW_USER',
  payload: { userId },
  meta: {
  	offline: {
      effect: //...,
  	  rollback: { type: 'FOLLOW_USER_ROLLBACK', meta: { userId }}  
   	}
  }
});

// optimistically update the state, revert on rollback
const followingUsersReducer = (state, action) {
  switch(action.type) {
    case 'FOLLOW_USER':
      return { ...state, [action.payload.userId]: true };
    case 'FOLLOW_USER_ROLLBACK':
      return omit(state, [action.payload.userId]);
    default;
      return state;
  }
}
```

### A pessimist is never disappointed

Sometimes it's important that the user knows that the action actually went through, so you can't optimistically your state until the effect has been executed. Or sometimes, in order to render the final UI state, you need some data from the server response. For these cases, you can use the `meta.offline.commit` action:

```js
const completeOrder = (orderId, lineItems) => ({
  type: 'COMPLETE_ORDER',
  payload: { orderId, lineItems },
  meta: {
  	offline: {
      effect: //...,
      commit: { type: 'COMPLETE_ORDER_COMMIT', meta: { orderId }},
  	  rollback: { type: 'COMPLETE_ORDER_ROLLBACK', meta: { orderId }}  
   	}
  }
});

const ordersReducer = (state, action) {
  switch(action.type) {
    case 'COMPLETE_ORDER':
      return {
        ...state,
        submitting: {...state.submitting, [action.payload.orderId]: true
      };
    case 'COMPLETE_ORDER_COMMIT':
      return {
        ...state,
        receipts: { ...state.receipts, [action.meta.orderId]: action.payload },
        submitting: omit(state.submitting, [action.meta.orderId])
      };
    case 'COMPLETE_ORDER_ROLLBACK':
      return {
        ...state, 	
        error: action.payload,
        submitting: omit(state.submitting, [action.meta.orderId])
      };
    default;
      return state;
  }
}
```

### Executor of our will

The last part of the offline metadata is `meta.offline.effect`. This property can contain anything, and will be passed as-is to the effects reconciler.

The **effects reconciler** is a function that you pass to `createOfflineStore` configuration, whose responsible it is to take the effect payload, send it over the network, and return a Promise that resolves if sending was successful or rejects if the sending failed. The method is passed the full action as a second parameter:

```js
type EffectsReconciler = (effect: any, action: OfflineAction) => Promise<any>
```

The default reconciler is simply a paper-thin wrapper around [fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) that rejects non-OK HTTP status codes, and assumes the response will be valid JSON.
```js
  const reconciler = ({url, ...opts}) =>
  	fetch(url, opts).then(res => res.ok
  		? res.json()
  		: Promise.reject(res.text().then(msg => new Error(msg)));
```
So the default effect format expected by the reconciler is something like:
```js
{
  type: 'ACTION',
  meta: {
  	offline: {
      effect: { url: '/api/endpoint', method: 'POST'}
    }
  }
}
```

That said, you'll probably want to [use your own method](#todo) - it can be anything, as long as it returns a Promise.


### What could go wrong?





## Configuration

### I want to...

### Change how state is saved to disk

### Change how network requests are made

## API

#### createOfflineStore

## Contributing

## Miscellanea
