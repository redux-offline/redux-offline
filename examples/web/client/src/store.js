import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { offline, createOffline } from '@redux-offline/redux-offline';
import defaultConfig from '@redux-offline/redux-offline/lib/defaults';
import { waterfallMidway, waterfallEnd } from './actions';

const initialState = {
  timer: 0,
  waterfallStep: 0
};

function reducer(state = initialState, action) {
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
  if (action.type === 'WATERFALL_START_COMMIT') {
    return {
      ...state,
      waterfallStep: 1,
      waterfallResult: {
        meta: action.meta,
        payload: action.payload
      }
    };
  }
  if (action.type === 'WATERFALL_MIDWAY_COMMIT') {
    return {
      ...state,
      waterfallStep: 2,
      waterfallResult: {
        meta: action.meta,
        payload: action.payload
      }
    };
  }
  if (action.type === 'WATERFALL_END_COMMIT') {
    return {
      ...state,
      waterfallStep: 3,
      waterfallResult: {
        meta: action.meta,
        payload: action.payload
      }
    };
  }
  return state;
}

const config = {
  ...defaultConfig,
  retry(_action, retries) {
    return (retries + 1) * 1000;
  },
  observerPool: {
    waterfallMidway,
    waterfallEnd
  }
};

function tickMiddleware(store) {
  return next => action => {
    if (action.type === 'Offline/SCHEDULE_RETRY') {
      const intervalId = setInterval(() => {
        store.dispatch({ type: 'TICK' });
      }, 1000);
      setTimeout(() => clearInterval(intervalId), action.payload.delay);
    }
    return next(action);
  };
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

let store;
if (process.env.REACT_APP_OFFLINE_API === 'alternative') {
  const { middleware, enhanceReducer, enhanceStore } = createOffline(config);
  store = createStore(
    enhanceReducer(reducer),
    undefined,
    composeEnhancers(
      applyMiddleware(thunk, middleware, tickMiddleware),
      enhanceStore
    )
  );
} else {
  store = createStore(
    reducer,
    composeEnhancers(offline(config), applyMiddleware(thunk, tickMiddleware))
  );
}

export default store;
