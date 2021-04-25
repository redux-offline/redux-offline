import { PERSIST_REHYDRATE, OFFLINE_RESET_STATE } from './actions';

const createReduxOfflineMiddleware = (instance) => {
  const reduxOfflineMiddleware = () => (next) => (action) => {
    const { offlineSideEffects } = instance;
    next(action);

    if (action.type === PERSIST_REHYDRATE) {
      offlineSideEffects.rehydrateState(action.payload?.offline ?? {});
    }

    if (action.type === OFFLINE_RESET_STATE) {
      offlineSideEffects.reset();
    }

    offlineSideEffects.addSideEffect(action);
  };

  return reduxOfflineMiddleware;
};

export default createReduxOfflineMiddleware;
