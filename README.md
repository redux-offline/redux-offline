<p>
  <img alt="redux-offline" src="docs/logo.png" width="300"></img>
</p>
<p>
  <a title='License' href="https://raw.githubusercontent.com/jevakallio/redux-offline/master/LICENSE" height="18">
    <img src='https://img.shields.io/badge/license-MIT-blue.svg' />
  </a>
  <a href="https://badge.fury.io/js/redux-offline">
    <img src="https://badge.fury.io/js/redux-offline.svg" alt="npm version" height="18">
  </a>
  <a href="https://travis-ci.org/jevakallio/redux-offline">
    <img src="https://travis-ci.org/jevakallio/redux-offline.svg?branch=master" alt="travis" height="18">
  </a>
</p>

Persistent Redux store for _Reasonaboutable_:tm: Offline-First applications, with first-class support for optimistic UI. Use with React, React Native, or as standalone state container for any web app.

_To get started, take a moment to read through the **[Offline Guide](#offline-guide)** to understand the architecture and tradeoffs behind Redux Offline, and for further context why Offline matters, read [this blog post](https://hackernoon.com/introducing-redux-offline-offline-first-architecture-for-progressive-web-applications-and-react-68c5167ecfe0)_

## Contents

* [Quick start](#quick-start)
* [Offline Guide](#offline-guide)
* [Configuration](#configuration)
* [Contributing](#contributing)
* [Miscellanea](#miscellanea)

## Full disclosure

Redux Offline is very, very new. If you find a bug, good job for being an early adopter! (And there will be issues.) If you find a problem, please submit an issue and I will get to them. 😇

## Quick start

##### 1. Install with npm (or [Yarn](https://yarnpkg.com))
```sh
npm install --save redux-offline
```

##### 2. Add the `offline` [store enhancer](http://redux.js.org/docs/Glossary.html#store-enhancer) with `compose`
```diff

- import { applyMiddleware, createStore } from 'redux';
+ import { applyMiddleware, createStore, compose } from 'redux';
+ import { offline } from 'redux-offline';
+ import offlineConfig from 'redux-offline/lib/defaults';

// ...

const store = createStore(
  reducer,
  preloadedState,
-  applyMiddleware(middleware)
+  compose(
+    applyMiddleware(middleware),
+    offline(offlineConfig)
+  )
);
```

See [Configuration](#configuration) for overriding default configurations.

Looking for `createOfflineStore` from redux-offline 1.x? See migration instructions in the [2.0.0 release notes](https://github.com/jevakallio/redux-offline/releases/tag/v2.0.0).

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

##### 4. (React Native Android) Ask permission to read network status

If writing a native app for Android, you'll need to make sure to request the permission to access network state in your `AndroidManifest.xml`:

```xml
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```


## Offline Guide

Making offline-friendly apps is not rocket science, but to make them work well involves dealing with finicky details around persisting state, resilience against flaky networks, optimistically updating user interface state, reliably reverting it back in case of failures, synchronising state in the background, and managing the evolution of the persistent state over long, long periods of time.

**Redux Offline** is a battle-tested offline-first architecture, and an _experimental_ library that implements it. To make use of the library, it'll be helpful to understand the architecture behind it.

### Progressive Web Apps

Redux Offline helps you with offline state management, but it **does not** automatically make your web site available offline. For caching assets (HTML pages, scripts, images, and other resources) your website needs to implement a ServiceWorker. To get started with PWAs and React, [this article provides great list of resources](https://medium.com/@addyosmani/progressive-web-apps-with-react-js-part-3-offline-support-and-network-resilience-c84db889162c) to begin with.

### Persistence is key
In order to be able to render meaningful content when the user opens your application offline, your application state needs to be persisted to disk.

Instead of reinventing the wheel, Redux Offline uses the excellent [redux-persist](https://github.com/rt2zz/redux-persist) library. Your Redux store is saved to disk on every change, and reloaded automatically on startup. By default, browser environments will use [IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API) or WebSQL/localStorage fallbacks via [localForage](https://github.com/localForage/localForage), and [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) in React Native.

You can [configure every aspect of how your state is persisted](#configuration).

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

### Optimism will get you places

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
    default:
      return state;
  }
}
```

### A pessimist is never disappointed

Sometimes it's important that the user knows that the action actually went through, so you can't optimistically update your state until the effect has been executed. Or sometimes, in order to render the final UI state, you need some data from the server response. For these cases, you can use the `meta.offline.commit` action:

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
    default:
      return state;
  }
}
```

### Executor of our will

The last part of the offline metadata is `meta.offline.effect`. This property can contain anything, and will be passed as-is to the effects reconciler.

The **effects reconciler** is a function that you pass to offline enhancer configuration, whose responsibility it is to take the effect payload, send it over the network, and return a Promise that resolves if sending was successful or rejects if the sending failed. The method is passed the full action as a second parameter:

```js
type EffectsReconciler = (effect: any, action: OfflineAction) => Promise<any>
```

The default reconciler is simply a paper-thin wrapper around [fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) that rejects non-OK HTTP status codes, and assumes the response will be valid JSON.
```js
  const effectReconciler = ({url, ...opts}) =>
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

That said, you'll probably want to [use your own method](#change-how-network-requests-are-made) - it can be anything, as long as it returns a Promise.

### Is this thing even on?

A library that aims to support offline usage, it would be useful to know whether or not the device is online or offline. Unfortunately, network availability is not a binary "Yes" or "No": It can also be "Yes, but not really". The network receiver on your mobile device may report connectivity, but if you can't reach the remote server, are we really connected?

Redux Offline uses the browser [Network Information APIs](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) and React Native [NetInfo](https://facebook.github.io/react-native/docs/netinfo.html) to be notified when the device *thinks* it's online to orchestrate synchronisation and retries. The current reported online state is stored in your store state as boolean `state.offline.online` and can be used to display a network indicator in your app, if desired.

Sometimes, it's more reliable to check network connectivity by actually making sure you can exchange data with a remote server by periodically making a HEAD request, or keeping an open WebSocket connection with a heartbeat. This, too, [can be configured](#change-how-network-status-is-detected).


### Giving up is hard to do

Networks are flaky. Your backend could be down. Sometimes, when the moon is in waxing crescent and the sixth-degree leylines are obstructed by passing birds, things mysteriously fail. If you are processing your offline actions queue in serial, you will need a reliable mechanism to decide when to retry the requests, and when to give up to prevent blocking the rest of the queue from being flushed.

Building an offline-friendly app, you should never give up because a *network* connection failed. You *may* want to give up if the server reports a *server error*. And if the server tells you that your *request cannot be processed*, you need to give up immediately.

Modelled after this principle, the default discard strategy is:
* If server was not reached, always retry
* If server responded with HTTP `4xx` client error, always discard
* If server responded with HTTP `5xx` server error, retry with a decaying schedule configured by the [retry strategy](#change-how-network-requests-are-retried).

If your backend doesn't conform to this standard, or you've [changed the effects reconciler](#change-how-network-requests-are-made) to return errors that don't expose a HTTP `status` field, you'll want to [configure the error detection strategy](#change-how-irreconcilable-errors-are-detected), too.

When a message is discarded, the `meta.offline.rollback` action defined in the message metadata is fired, and you can respond accordingly.


### And if you don't at first succeed, try, try again

When a network request has failed, and you've [chosen not to discard the message](#giving-up-is-hard-to-do), you need to decide when to retry the request. If your requests are failing due to an overloaded backend, retrying too often will make the problem worse and effectively DDoS your own service. Never kick a man when he's down.

By default, we will always retry the first message in the queue when the [network detector](#is-this-thing-even-on) reports a change from offline to online. Otherwise, we will retry the request on a decaying schedule:
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

After these 10 timed attempts, if the message is still failing due to a server error, it will be discarded.

Retrying a request for this long may seem excessive, and for some use cases it can be. You can [configure the retry strategy](#change-how-network-requests-are-retried) to suit yours.

The reason the default behaviour is to desperately try to make the requests succeed is that we really, really want to avoid having to deal with conflict resolution...


## Configuration


### Configuration object

Redux Offline supports the following configuration properties:
```js
export type Config = {
  detectNetwork: (callback: NetworkCallback) => void,
  persist: (store: any) => any,
  effect: (effect: any, action: OfflineAction) => Promise<*>,
  retry: (action: OfflineAction, retries: number) => ?number,
  discard: (error: any, action: OfflineAction, retries: number) => boolean,
  persistOptions: {}
};
```

#### Passing configuration to the enhancer
The `offline` store enhancer takes the [configuration object](#configuration-object) as a final parameter:
```diff
+ import { offline } from 'redux-offline';
+ import defaultConfig from 'redux-offline/lib/defaults';

const store = createStore(
  reducer,
  preloadedState,
-  middleware
+  compose(middleware, offline(defaultConfig))
);
```

#### Overriding default properties
You can override any individual property in the default configuration:
```diff
import { offline } from 'redux-offline';
import defaultConfig from 'redux-offline/lib/defaults';

const customConfig = {
  ...defaultConfig,
  effect: (effect, _action) => Api.send(effect)
}

const store = createStore(
  reducer,
  preloadedState,
-  middleware
+  compose(middleware, offline(customConfig))
);
```

#### Only import what you need
The reason for default config is defined as a separate import is, that it pulls in the [redux-persist](https://github.com/rt2zz/redux-persist) dependency and a limited, but non-negligible amount of library code. If you want to minimize your bundle size, you'll want to avoid importing any code you don't use, and bring in only the pieces you need:

```diff
import { offline } from 'redux-offline';
import batch from 'redux-offline/lib/defaults/batch';
import retry from 'redux-offline/lib/defaults/retry';
import discard from 'redux-offline/lib/defaults/discard';

const myConfig = {
  retry,
  discard,
  effect: (effect, action) => MyCustomApiService.send(effect, action),
  detectNetwork: (callback) => MyCustomPingService.startPing(callback),
  persist: (store) => MyCustomPersistence.persist(store)
};

const store = createStore(
  reducer,
  preloadedState,
-  middleware
+  compose(middleware, offline(myConfig))
 myConfig  
);
```


### I want to...

#### Change how network requests are made

Probably the first thing you will want to do is to replace the default `fetch` effects handler. Do this by overriding `config.effect`:
```js
const config = {
  effect: (effect, action) => {
    console.log(`Executing effect for ${action.type}`);
    return MyApi.send(effect)
  }
}
```

The first parameter is whatever value is set in `action.meta.offline.effect`. The second parameter is the full action, which may be useful for context. The method is expected to return a Promise. The full signature of the effect handler is: `(effect: any, action: OfflineAction) => Promise<any>`.


#### Change how state is saved to disk

By default, persistence is handled by [redux-persist](https://github.com/rt2zz/redux-persist). The recommended way of customizing
persistence is to configure redux-persist. You can pass any valid configuration
to redux-persist by defining it `config.persistOptions`:
```js
const config = {
  persistOptions: { /*...*/ }
};
```

You can pass the callback for redux-persist as well. This function would be called when rehydration is complete. It's useful if you want to delay rendering until rehydration is complete. You can define it in `config.persistCallback`:
```js
const config = {
  persistCallback: () => { /*...*/ }
};
```

If you want to replace redux-persist entirely **(not recommended)**, you can override `config.persist`. The function receives the store instance as a first parameter, and is responsible for setting any subscribers to listen for store changes to persist it.
```js
const config = {
  persist: (store) =>
    store.subscribe(() => console.log(store.getState()))
  )
}
```

If you override `config.store`, you will also need to manage the rehydration of your state manually.

#### Change how network status is detected

To replace the default network status detector, override the `config.detectNetwork` method:
```js
const config = {
  detectNetwork: callback => MyCustomDetector.on('change', callback)
}
```

The function is passed a callback, which you should call with boolean `true` when the app gets back online, and `false` when it goes offline.

#### Change how irreconcilable errors are detected

Actions in the queue are by default discarded when a server returns
a HTTP `4xx` error. To change this, set override the `config.discard` method:
```js
const config = {
  discard: (error, action, retries) => error.permanent || retries > 10;
}
```

The method receives the Error returned by the effect reconciler, the action being processed, and a number representing how many times the action has been retried. If the method returns `true`, the action will be discarded; `false`, and it will be retried. The full signature of the method is `(error: any, action: OfflineAction, retries: number) => boolean`.

#### Change how network requests are retried

By default, sending actions is retried on a decaying schedule starting with retries every few seconds, eventually slowing down to an hour before the last retry. These retry delays only apply to scenarios where the device reports being online but the server cannot be reached, or the server is reached but is responding with a non-permanent error.

To configure the retry duration, override `config.retry`:
```js
const config = {
  retry: (action, retries) => action.meta.urgent ? 100 : 1000 * (retries + 1)
}
```

The function receives the action and a number representing how many times the
action has been retried, and should reply with a number representing the amount
of milliseconds to wait until the next retry. If this method returns `null` or
`undefined`, the action will not be retried until the next time the app comes
online, is started, or you manually fire an `Offline/SEND` action.

#### Change how errors are handled

Granular error handling is not yet implemented. You can use discard/retry, and
if necessary to purge messages from your queue, you can filter `state.offline.outbox`
in your reducers. Official support coming soon.

#### Change how queue processing is batched

Currently messages are sent one by one, in serial. Customization support coming soon.

#### Synchronise my state while the app is not open

Background sync is not yet supported. Coming soon.

#### Use an [Immutable](https://facebook.github.io/immutable-js/) store

Stores that implement the entire store as an Immutable.js structure are currently not supported. You can use Immutable in the rest of your store, but the root object and the `offline` state branch created by Redux Offline currently needs to be vanilla JavaScript objects.

[Contributions welcome](#contributing).


## Contributing

Improvements and additions welcome. For large changes, please submit a discussion issue before jumping to coding; we'd hate you to waste the effort.

In lieu of a formal style guide, follow the included eslint rules, and use Prettier to format your code.

## Miscellanea

### Prior art

Redux Offline is a distillation of patterns discovered while building apps using previously existing libraries:

* Forbes Lindesay's [redux-optimist](https://github.com/ForbesLindesay/redux-optimist)
* Zack Story's [redux-persist](https://github.com/rt2zz/redux-persist)

Without their work, Redux Offline wouldn't exist. If you like the ideas behind Redux Offline, but want to build your own stack from lower-level components, these are good places to start.

### License

MIT
