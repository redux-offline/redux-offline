import { offlineSideEffects as createOfflineSideEffects } from '@redux-offline/offline-side-effects';
import {
  OFFLINE_STATUS_CHANGED,
  OFFLINE_BUSY,
  OFFLINE_SCHEDULE_RETRY,
  OFFLINE_SERIALIZE,
  OFFLINE_UPDATE_NETINFO
} from './actions';
import offlineReducer from './reducer';
import createReduxOfflineMiddleware from './middleware';

export const createOffline = (options, buildListeners = () => ({})) => {
  const instance = {
    offlineSideEffects: null
  };

  const enhanceStore = (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);
    let prevStatus = null;

    const listeners = {
      onCommit: (payload, commit) => store.dispatch({ ...commit, payload }),
      onRollback: (payload, rollback) =>
        store.dispatch({ ...rollback, payload }),
      onStatusChange: (status) => {
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
      onSerialize: (state) => {
        store.dispatch({ type: OFFLINE_SERIALIZE, payload: state });
      },
      onRetry: (delay) =>
        store.dispatch({ type: OFFLINE_SCHEDULE_RETRY, payload: { delay } }),
      // @ts-ignore
      ...buildListeners(store)
    };

    // the initial state of Redux-Offline reducer is "online: false",
    // once the detect network kicks-in this gets updated to true.
    const providedState = { status: 'paused' };

    instance.offlineSideEffects = createOfflineSideEffects(listeners, options, providedState);

    // launch network detector
    if (options.detectNetwork) {
      options.detectNetwork(({ online, netInfo }) => {
        instance.offlineSideEffects.setPaused(!online);
        if (netInfo) {
          store.dispatch({ type: OFFLINE_UPDATE_NETINFO, payload: { netInfo } });
        }
      });
    }

    return store;
  };

  const reduxOfflineMiddleware = createReduxOfflineMiddleware(instance);

  const testingInstance = new Proxy(instance, {
    get(target, prop) {
      if (process.env.NODE_ENV !== 'testing') {
        console.error('Access to offlineSideEffects instance not allowed, only meant for testing purposes');
        return null;
      }
      return Reflect.get(target, prop);
    }
  });

  return {
    enhanceStore,
    reducer: offlineReducer,
    middleware: reduxOfflineMiddleware,
    _instance: testingInstance
  };
};
