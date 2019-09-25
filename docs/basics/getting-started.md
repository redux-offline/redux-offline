# Getting Started

Making offline-friendly apps is not rocket science, but to make them work well involves dealing with finicky details around persisting state, resilience against flaky networks, optimistically updating user interface state, reliably reverting it back in case of failures, synchronising state in the background, and managing the evolution of the persistent state over long, long periods of time.

> Redux Offline helps you with offline state management, but it **does not** automatically make your web site available offline. For caching assets (HTML pages, scripts, images, and other resources) your website needs to implement a ServiceWorker. To get started with PWAs and React, [this article provides great list of resources](https://medium.com/@addyosmani/progressive-web-apps-with-react-js-part-3-offline-support-and-network-resilience-c84db889162c) to begin with.

## Quick start

#### Install

```
npm install --save @redux-offline/redux-offline
```

#### Add the store enhancer

```js
import { createStore } from 'redux';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

const store = createStore(reducer, offline(offlineConfig));
```

#### Make a request

```js
store.dispatch({
  type: "MY_OFFLINE_ACTION",
  meta: {
    offline: {
      effect: { url: "https://my-api.com/resource" }
    }
  }
})
```
