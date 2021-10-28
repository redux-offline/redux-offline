---
sidebar_position: 1
title: "offline()"
---

# `offline(config)`

The principle entrypoint to Redux Offline: returns a store enhancer.

```js
import { createStore } from 'redux';
import { offline } from '@redux-offline/redux-offline';
import config from '@redux-offline/redux-offline/lib/defaults';

const store = createStore(myReducer, offline(config));
```

See [config documentation](./config) for information on customizing the returned store enhancer.
