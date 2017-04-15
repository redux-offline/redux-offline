// @flow

/*==================================================
                   IMPORTS / SETUP
==================================================*/
import { cloneDeep } from 'lodash';
import { applyDefaults } from '../config';
import { createOfflineStore } from '../index';
import { createOfflineMiddleware } from '../middleware';
import { createStore, applyMiddleware } from 'redux';

import type { OfflineState } from '../types';
/*==================================================
                UTILITY DEFINITIONS
==================================================*/
type ActionType = { type: string, payload?: any };
type ReducerType = Function<Object, ActionType>;

const defaultUserConfig = {
  defaultUserConfig: true
};

const defaultState: OfflineState = {
  lastTransaction: 0,
  online: false,
  outbox: [],
  receipts: [],
  retryToken: 0,
  retryCount: 0,
  retryScheduled: false
};

// essentially a no-op Redux middleware
const dummyMiddleWare = () => next => (action: ActionType) => next(action);

// returns a reducer which acts on given action type
function mockReducerForActionType(actionType: string) {
  return (state: Object = { updated: false }, action: Object) => {
    if (action.type === actionType) {
      state.updated = true;
      return state;
    }

    return state;
  };
}

// default reducer. For use when you don't care about the action,
// you just want to ensure it received an action
const dummyReducer: ReducerType = mockReducerForActionType('ANY');

// calls createOfflineStore with default args
function createOfflineStoreWithDefaults(
  {
    reducer = dummyReducer,
    enhancer = applyMiddleware(dummyMiddleWare),
    userConfig = defaultUserConfig,
    preloadedState = {}
  } = {}
) {
  return createOfflineStore(reducer, preloadedState, enhancer, userConfig);
}

function createInitialState(overrides = {}) {
  return {
    offline: { ...cloneDeep(defaultState), online: true },
    ...overrides
  };
}

// returns the innermost function of the redux middleware signature
// which actually receives the action and does the processing
function createOfflineActionReceiver(
  next: Function,
  state = {},
  userConfig = {},
  reducer: ReducerType = dummyReducer
) {
  const defaults = applyDefaults();
  const middleware = createOfflineMiddleware(defaults);
  const initialState = createInitialState(state);
  const store = createStore(reducer, initialState);
  const actionReceiver = middleware(store)(next);
  return actionReceiver;
}

function createOfflineMiddlewareWithDefaults(overrides = {}) {
  const defaults = applyDefaults(overrides);
  return createOfflineMiddleware(defaults);
}

// @TODO: make this more configurable
function createOfflineAction(overrides) {
  const defaultAction = {
    type: 'COMPLETE_ACTION',
    meta: {
      offline: {
        commit: { type: 'COMPLETE_ACTION_COMMIT', meta: { foo: 'bar' } },
        effect: {
          url: '/api/foo/bar',
          method: 'POST',
          body: { thing: 'stuff' }
        }
      }
    }
  };

  return { ...defaultAction, ...overrides };
}

function flushAllPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

/*==================================================
                       EXPORTS
==================================================*/
export {
  dummyReducer,
  dummyMiddleWare,
  flushAllPromises,
  defaultUserConfig,
  createInitialState,
  createOfflineAction,
  mockReducerForActionType,
  createOfflineActionReceiver,
  createOfflineStoreWithDefaults,
  createOfflineMiddlewareWithDefaults
};
