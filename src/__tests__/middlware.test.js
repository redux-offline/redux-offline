/* eslint-disable  max-len */
/* global fetch */
/*==================================================
                   IMPORTS / SETUP
==================================================*/
import configureStore from 'redux-mock-store';

import {
  flushAllPromises,
  createInitialState,
  createOfflineAction,
  createOfflineActionReceiver,
  createOfflineMiddlewareWithDefaults
} from './utils';
/*==================================================
                        TESTS
==================================================*/
describe('middleware', () => {
  it('should return a function that conforms to the Redux middleware signature', () => {
    const expectedResult = 'test is passing';
    const next = jest.fn(() => expectedResult);
    const actionReceiver = createOfflineActionReceiver(next);
    const result = actionReceiver({ type: 'TEST' });

    expect(next).toHaveBeenCalled();
    expect(result).toBe(expectedResult);
  });

  it(`should take in the first item in state.offline.outbox and, in the case 
    where the first item has a length > 1, the middleware is online, not busy, 
    and does not have a retry scheuled, attempt to run the effect described in 
    the action and dispatch the result to the store`, () => {
    const action = createOfflineAction();
    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);

    let initialState = createInitialState();
    initialState.offline.outbox = [action];

    const store = mockStore(() => initialState);

    fetch.mockResponseSuccessOnce({ data: 'it works!' });
    store.dispatch({ type: 'ANY' });

    // need to do this to prevent infininte loop caused by mockStore never
    // clearing out the offline.outbox because it doesn't actually use a reducer
    initialState = createInitialState();

    setImmediate(() => {
      const actions = store.getActions();
      const finder = actionItem => actionItem.type === 'COMPLETE_ACTION_COMMIT';
      const offlineAction = actions.find(finder);

      expect(offlineAction.type).toBe('COMPLETE_ACTION_COMMIT');
      expect(offlineAction.meta.completed).toBe(true);
      expect(offlineAction.meta.success).toBe(true);
      expect(offlineAction.payload).toEqual({ data: 'it works!' });
    });
  });

  it(`should simply return the result of calling the next middleware if 
    the offline actions it gets back from the store have a length of 0
    and the action type is not 'Offline/SCHEDULE_RETRY' or 'Offline/SEND'`, () => {
    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);
    const initialState = createInitialState();
    const store = mockStore(initialState);
    store.dispatch({ type: 'ANY' });

    const actions = store.getActions();
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('ANY');
  });

  it(`should simply return the result of calling the next middleware 
    if state.offline.busy is true and the action type is not 
    'Offline/SCHEDULE_RETRY' or 'Offline/SEND'`, () => {
    const action = createOfflineAction();
    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);
    const initialState = createInitialState();

    initialState.offline.outbox = [action];
    initialState.offline.busy = true;

    const store = mockStore(initialState);
    store.dispatch({ type: 'ANY' });

    const actions = store.getActions();
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('ANY');
  });

  it(`should simply return the result of calling the next middleware 
  if state.offline.retryScheduled is true and the action type is not 
  'Offline/SCHEDULE_RETRY' or 'Offline/SEND'`, () => {
    const action = createOfflineAction();
    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);
    const initialState = createInitialState();

    initialState.offline.outbox = [action];
    initialState.offline.retryScheduled = true;

    const store = mockStore(initialState);
    store.dispatch({ type: 'ANY' });

    const actions = store.getActions();
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('ANY');
  });

  it(`should simply return the result of calling the next middleware 
    if state.offline.retryScheduled is true and the action type is not 
    'Offline/SCHEDULE_RETRY' or 'Offline/SEND'`, () => {
    const action = createOfflineAction();
    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);
    const initialState = createInitialState();

    initialState.offline.outbox = [action];
    initialState.offline.retryScheduled = true;

    const store = mockStore(initialState);
    store.dispatch({ type: 'ANY' });

    const actions = store.getActions();
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('ANY');
  });

  it(`should simply return the result of calling the next middleware 
    if state.offline.retryScheduled is true and the action type is not 
    'Offline/SCHEDULE_RETRY' or 'Offline/SEND'`, () => {
    const action = createOfflineAction();
    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);
    const initialState = createInitialState();

    initialState.offline.outbox = [action];
    initialState.offline.retryScheduled = true;

    const store = mockStore(initialState);
    store.dispatch({ type: 'ANY' });

    const actions = store.getActions();
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe('ANY');
  });

  it(`should, when it receives the 'Offline/SCHEDULE_RETRY' action, dispatch 
    the 'completeRetry' action with the 'retryToken' as the payload after a 
    given delay specified by the action it initially received`, done => {
    jest.useFakeTimers();

    const action = createOfflineAction({
      type: 'Offline/SCHEDULE_RETRY',
      payload: { delay: 0 }
    });

    const middleware = createOfflineMiddlewareWithDefaults();
    const mockStore = configureStore([middleware]);
    const initialState = createInitialState();

    const store = mockStore(initialState);
    store.dispatch(action);

    jest.runOnlyPendingTimers();

    flushAllPromises().then(() => {
      const actions = store.getActions();
      expect(actions.length).toBe(2);
      expect(actions[0].type).toBe('Offline/SCHEDULE_RETRY');
      expect(actions[1].type).toBe('Offline/COMPLETE_RETRY');
      done();
    });
  });
});
