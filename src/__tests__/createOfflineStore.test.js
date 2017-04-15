/* eslint-disable  max-len*/
/*==================================================
                   IMPORTS / SETUP
==================================================*/
import * as Redux from 'redux';
import * as Actions from '../actions';
import * as ReduxPersist from 'redux-persist';

import { applyDefaults } from '../config';
import { enhanceReducer } from '../updater';
import { createOfflineMiddleware } from '../middleware';
import { defaultUserConfig, createOfflineStoreWithDefaults } from './utils';

jest.mock('../middleware', () => ({
  createOfflineMiddleware: jest.fn(() => () => next => action => next(action))
}));

jest.mock('../updater', () => ({
  enhanceReducer: jest.fn(reducer => reducer)
}));
/*==================================================
                        TESTS
==================================================*/
describe('createOfflineStore', () => {
  it('should return an instance of a Redux store', () => {
    // calls createOfflineStore with default args
    const store = createOfflineStoreWithDefaults();

    expect(store.dispatch).toBeInstanceOf(Function);
    expect(store.getState).toBeInstanceOf(Function);
    expect(store.subscribe).toBeInstanceOf(Function);
    expect(store.replaceReducer).toBeInstanceOf(Function);
  });

  it('should take in a reducer and pass it to enhanceReducer', () => {
    const reducer = nope => nope;
    createOfflineStoreWithDefaults({ reducer });
    expect(enhanceReducer).toHaveBeenCalledWith(reducer);
  });

  it(`should take in a config object provided by the user, add default config 
    options to it, and then pass it to 'createOfflineMiddleware'`, () => {
    createOfflineStoreWithDefaults();

    const configWithDefaults = applyDefaults(defaultUserConfig);
    expect(createOfflineMiddleware).toHaveBeenCalledWith(configWithDefaults);
  });

  it(`should call 'compose' passing in the offline middleware, the enhancer, and the return 
    value of 'autoRehydrate' if config.persist && config.rehydrate are not falsy`, () => {
    Redux.compose = jest.fn();
    ReduxPersist.autoRehydrate = jest.fn();

    createOfflineStoreWithDefaults();

    expect(Redux.compose).toHaveBeenCalled();
    expect(ReduxPersist.autoRehydrate).toHaveBeenCalled();

    Redux.compose.mockReset();
    ReduxPersist.autoRehydrate.mockReset();

    createOfflineStoreWithDefaults({
      userConfig: { persist: null }
    });

    expect(Redux.compose).toHaveBeenCalled();
    expect(ReduxPersist.autoRehydrate).not.toHaveBeenCalled();

    Redux.compose.mockReset();
    ReduxPersist.autoRehydrate.mockReset();

    createOfflineStoreWithDefaults({
      userConfig: { rehydrate: false }
    });

    expect(Redux.compose).toHaveBeenCalled();
    expect(ReduxPersist.autoRehydrate).not.toHaveBeenCalled();
  });

  it(`should, in the case where a persist function was included on config, call the persist function 
    passing in the the store as well as any options included in config.persistOptions`, () => {
    const overrides = {
      userConfig: {
        persist: jest.fn(),
        persistOptions: { foo: 'bar' }
      }
    };

    createOfflineStoreWithDefaults(overrides);
    const { persist, persistOptions } = overrides.userConfig;

    expect(persist).toHaveBeenCalled();
    expect(persist.mock.calls[0][0].dispatch).toBeInstanceOf(Function);
    expect(persist.mock.calls[0][1]).toBe(persistOptions);
  });

  it(`should, in the case where a detectNetwork function was included in config, call the 
    detectNetwork function, passing in a calback which takes in a boolean and dispatches 
    the networkStatuChanged action to the store with the boolean as the payload`, () => {
    const originalAction = Actions.networkStatusChanged;
    Actions.networkStatusChanged = jest.fn(() => originalAction(true));

    const overrides = {
      userConfig: { detectNetwork: jest.fn(cb => cb(true)) }
    };

    createOfflineStoreWithDefaults(overrides);
    const { detectNetwork } = overrides.userConfig;

    expect(detectNetwork).toHaveBeenCalled();
    expect(detectNetwork.mock.calls[0][0]).toBeInstanceOf(Function);
    expect(detectNetwork).toHaveBeenCalled();
    expect(Actions.networkStatusChanged.mock.calls[0][0]).toBe(true);

    // test that the action creator won't be called a second time if !detectNetwork
    const noDetectOverrides = {
      userConfig: { detectNetwork: null }
    };

    createOfflineStoreWithDefaults(noDetectOverrides);

    expect(Actions.networkStatusChanged.mock.calls.length).toBe(1);
    Actions.networkStatusChanged.mockClear();
  });
});
