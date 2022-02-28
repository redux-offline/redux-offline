---
sidebar_position: 3
title: Redux-Saga
---

# Use with Redux-Saga

Redux-Offline has partial support for Sagas.

### What does this mean?
Well, when dispatching an offline enhanced action, the effect reconcilier will handle the API requests and responses.
This means that for offline actions you won't be able to manage the requests from within a saga. There's currently some discussions about changing the architecture to support sagas and other inside the effect reconcilier.
Until then however, support will be limited to non API effect sagas.

### Why would you need Redux-Saga then?
Besides the improvement in maintainability that sagas can bring to your application, a good use case for sagas is the ability to subscribe/listen to actions.
This allows us to listen for a particular action, and dispatch a new action/thunk/saga afterwards, thus chaining actions and side-effects.

## How to configure your store?
In the past how to configure your Redux store so that Redux-Saga could listen to Redux-Offline actions was somewhat confusing. Now we hope to clear things up with the following example:

```js
import { createStore, compose, combineReducers, applyMiddleware } from 'redux';
import { createOffline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import * as reducers from './reducers';
import { helloSaga } from './sagas';

const sagaMiddleware = createSagaMiddleware();
const rootReducer = combineReducers(reducers);
const middlewareList = [
  /* other middleware here */
  sagaMiddleware
];

const {
    middleware: offlineMiddleware,
    enhanceReducer,
    enhanceStore
  } = createOffline(offlineConfig);
const middleware = applyMiddleware(...middlewareList, offlineMiddleware);

const store = createStore(enhanceReducer(reducer), compose(enhanceStore, middleware));
sagaMiddleware.run(helloSaga);
```

For more info about integration between these 2 libraries, please check [here](https://github.com/redux-offline/redux-offline/issues/90) and [here](https://github.com/redux-offline/redux-offline/issues/173).
