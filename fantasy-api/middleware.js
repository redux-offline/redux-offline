import { createStore, applyMiddleware } from 'redux';
import { createOfflineMiddleware, enhanceReducer } from 'redux-offline';
import httpFetch from 'redux-offline/network/httpFetch';
import localStorage from 'redux-offline/persistence/localStorage';
import oneAtATime from 'redux-offline/batching/oneAtATime';
import decayingSchedule from 'redux-offline/retry/decayingSchedule';
import httpErrors from 'redux-offline/error/httpErrors';
import versioned from 'redux-offline/migration/versioned';
import blacklist from 'redux-offline/transient/blacklist';
import maxAge from 'redux-offline/pruning/maxAge';

import reducer from './reducers';
import migrations from './migrations';
const initialState = {};

// @TODO: Analytics, metrics

const offlineMiddleware = createOfflineMiddleware({
  network: httpFetch({ headers: {} }),
  persistence: localStorage({ storageKey: 'MY_APP' }),
  batching: oneAtATime(),
  discard: httpErrors(),
  retry: decayingSchedule(),
  migration: versioned({ currentVersion: '1.0', migrations }),
  transient: blacklist({ paths: ['session'] }),
  pruning: maxAge({ days: 7 })
});

const offlineMiddleware = createOfflineMiddleware();

const store = createStore(
  enhanceReducer(reducer),
  initialState,
  applyMiddleware(offlineMiddleware)
);
