# Getting Started

Making offline-friendly apps is not rocket science, but to make them work well involves dealing with finicky details around persisting state, resilience against flaky networks, optimistically updating user interface state, reliably reverting it back in case of failures, synchronising state in the background, and managing the evolution of the persistent state over long, long periods of time.

**Redux Offline** is a battle-tested offline-first architecture, and an _experimental_ library that implements it. To make use of the library, it'll be helpful to understand the architecture behind it.

## Progressive Web Apps

Redux Offline helps you with offline state management, but it **does not** automatically make your web site available offline. For caching assets (HTML pages, scripts, images, and other resources) your website needs to implement a ServiceWorker. To get started with PWAs and React, [this article provides great list of resources](https://medium.com/@addyosmani/progressive-web-apps-with-react-js-part-3-offline-support-and-network-resilience-c84db889162c) to begin with.

## Quick start

#### 1. Install with npm (or [Yarn](https://yarnpkg.com))
```diff
- npm install --save redux-offline
+ npm install --save @redux-offline/redux-offline
```

#### 2. Add the `offline` [store enhancer](http://redux.js.org/docs/Glossary.html#store-enhancer) with `compose`
```diff

- import { applyMiddleware, createStore } from 'redux';
+ import { applyMiddleware, createStore, compose } from 'redux';
- import { offline } from 'redux-offline';
+ import { offline } from '@redux-offline/redux-offline';
- import offlineConfig from 'redux-offline/lib/defaults';
+ import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

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

See [Configuration](/api/config) for overriding default configurations.

#### 3. Decorate actions with offline metadata

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

#### 4. (React Native Android) Ask permission to read network status

If writing a native app for Android, you'll need to make sure to request the permission to access network state in your `AndroidManifest.xml`:

```xml
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
