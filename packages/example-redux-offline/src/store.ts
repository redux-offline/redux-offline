import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import { createOffline } from '@redux-offline/redux-offline';
import { OFFLINE_SERIALIZE } from '@redux-offline/redux-offline/src/actions';
import { defaults } from '@redux-offline/offline-side-effects';
import detectNetwork from '@redux-offline/detect-network';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const initialState = {
  timer: 0
};

function tickReducer(state = initialState, action) {
  if (action.type === 'Offline/SCHEDULE_RETRY') {
    return {
      ...state,
      timer: action.payload.delay / 1000
    };
  }
  if (action.type === 'TICK') {
    return {
      ...state,
      timer: state.timer === 0 ? 0 : state.timer - 1
    };
  }
  return state;
}

const persistConfig = {
  key: 'offline-client-example-app',
  storage
};

const options = {
  ...defaults,
  retry(_action, retries) {
    return (retries + 1) * 1000;
  },
  detectNetwork
};

// Optionally you can blacklist OFFLINE_SERIALIZE to avoid too much noise in the devtools
const composeEnhancers =
  // @ts-ignore
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ actionsBlacklist: [OFFLINE_SERIALIZE] }) as unknown)
  || compose;

// @ts-ignore
const { middleware, enhanceStore, enhanceReducer } = createOffline(options);
const rootReducer = combineReducers({ tick: tickReducer });
const persistedReducer = persistReducer(persistConfig, enhanceReducer(rootReducer));
const store = createStore(
  persistedReducer,
  undefined,
  // @ts-ignore
  composeEnhancers(applyMiddleware(middleware), enhanceStore)
);
export const persistor = persistStore(store);

export default store;
