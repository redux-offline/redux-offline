import { offlineSideEffects as createOfflineSideEffects } from '@redux-offline/offline-side-effects';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_BUSY,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_SERIALIZE
} from './actions';
import offlineReducer from './reducer';
import createReduxOfflineMiddleware from './middleware';

export const createOffline = (options, buildListeners = () => ({})) => {
  let offlineSideEffects = null;

  const enhanceStore = createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let prevStatus = null;
    const listeners = {
      onCommit: (payload, commit) => store.dispatch({ ...commit, payload }),
      onRollback: (payload, rollback) =>
        store.dispatch({ ...rollback, payload }),
      onStatusChange: status => {
        if (status === 'paused') {
          store.dispatch({ type: OFFLINE_STATUS_CHANGED, payload: false });
        } else {
          if (prevStatus === 'paused') {
            store.dispatch({ type: OFFLINE_STATUS_CHANGED, payload: true });
          }
          store.dispatch({ type: OFFLINE_BUSY, payload: status === 'busy' });
        }
        prevStatus = status;
      },
      onSerialize: state => {
        store.dispatch({ type: OFFLINE_SERIALIZE, payload: state });
      },
      onRetry: delay =>
        store.dispatch({ type: OFFLINE_SCHEDULE_RETRY, payload: { delay } }),
      ...buildListeners(store)
    };

    offlineSideEffects = createOfflineSideEffects(listeners, options);

    // launch network detector
    if (options.detectNetwork) {
      options.detectNetwork(online => offlineSideEffects.setPaused(!online));
    }

    return store;
  };

  const reduxOfflineMiddleware = createReduxOfflineMiddleware(
    offlineSideEffects
  );

  return {
    enhanceStore,
    reducer: offlineReducer,
    middleware: reduxOfflineMiddleware
  };
};
