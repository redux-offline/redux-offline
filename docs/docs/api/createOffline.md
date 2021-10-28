---
sidebar_position: 2
title: "createOffline()"
---

# `createOffline(config)`

Advanced entrypoint to Redux Offline: returns a middleware, reducer enhancer, and store enhancer.

```js
import { applyMiddleware, compose, createStore } from 'redux';
import { createOffline } from '@redux-offline/redux-offline';
import config from '@redux-offline/redux-offline/lib/defaults';

const { middleware, enhanceReducer, enhanceStore } = createOffline(config);
const store = createStore(
  enhanceReducer(myReducer),
  compose(enhanceStore, applyMiddleware(middleware))
);
```

By default, the offline middleware is inserted right before the offline store enhancer as part of its own middleware chain. This method allows you to choose exactly where you want each inserted in your application.

