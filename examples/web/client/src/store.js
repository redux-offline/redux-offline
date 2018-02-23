import { applyMiddleware, compose, createStore } from 'redux';
import { offline, createOffline } from '@redux-offline/redux-offline';
import defaultConfig from '@redux-offline/redux-offline/lib/defaults';

const initialState = {
  timer: 0
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
  return state;
}

const config = {
  ...defaultConfig,
  retry(_action, retries) {
    return (retries + 1) * 1000;
  },
  returnPromises: true
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
    composeEnhancers(applyMiddleware(middleware, tickMiddleware), enhanceStore)
  );
} else {
  store = createStore(
    reducer,
    composeEnhancers(offline(config), applyMiddleware(tickMiddleware))
  );
}

export default store;
