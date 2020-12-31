import { offlineSideEffects as createOfflineSideEffects } from '@redux-offline/offline-side-effects';

const PERSIST_REHYDRATE = 'persist/REHYDRATE';
const SERIALIZE = 'Offline/SERIALIZE';
const STATUS_CHANGED = 'Offline/STATUS_CHANGED';
const SCHEDULE_RETRY = 'Offline/SCHEDULE_RETRY';

export const createOffline = (options, buildHooks = () => {}) => {
  let offlineSideEffects = null;

  const enhanceStore = createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);

    const hooks = {
      onCommit: (payload, commit) => store.dispatch({ ...commit, payload }),
      onRollback: (payload, rollback) =>
        store.dispatch({ ...rollback, payload }),
      onStatusChange: status =>
        store.dispatch({ type: 'statusChange', payload: status }),
      onSerialize: (state = []) =>
        store.dispatch({ type: SERIALIZE, payload: state }),
      onRetry: delay =>
        store.dispatch({ type: SCHEDULE_RETRY, payload: { delay } }),
      ...buildHooks(store)
    };

    offlineSideEffects = createOfflineSideEffects(hooks, options);

    // launch network detector
    if (options.detectNetwork) {
      options.detectNetwork(online => offlineSideEffects.setPaused(!online));
    }

    return store;
  };

  const reduxOfflineMiddleware = () => next => action => {
    next(action);

    if (action.type === PERSIST_REHYDRATE) {
      offlineSideEffects.rehydrateState(action.payload?.offline ?? {});
    }

    offlineSideEffects.addSideEffect(action);
  };

  function offlineReducer(state = { outbox: [], busy: false }, action) {
    if (action.type === SERIALIZE) {
      const { paused, status, retryScheduled, ...newState } = action.payload;
      const online = !paused;
      const busy = status === 'busy';
      return {
        ...state,
        ...newState,
        retryScheduled: Boolean(retryScheduled),
        online,
        busy
      };
    }
    if (action.type === STATUS_CHANGED) {
      return {
        ...state,
        busy: action.payload === 'busy'
      };
    }
    return state;
  }

  return {
    enhanceStore,
    reducer: offlineReducer,
    middleware: reduxOfflineMiddleware
  };
};
