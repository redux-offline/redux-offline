/* eslint-disable  max-len*/
/*==================================================
                   IMPORTS / SETUP
==================================================*/
import * as Redux from 'redux';
import * as Actions from '../actions';
import { autoRehydrate } from 'redux-persist';

import { offline } from '../index';
import { applyDefaults } from '../config';
import { enhanceReducer } from '../updater';
import { createOfflineMiddleware } from '../middleware';

import {
  dummyReducer,
  mockCreateStore,
  defaultUserConfig,
  offlineWithDefaults
} from './utils';

// jest.mock('redux-persist', () => ({
//   autoRehydrate: enhancer => enhancer
// }));

jest.mock('../middleware', () => ({
  createOfflineMiddleware: jest.fn(() => () => next => action => next(action))
}));

jest.mock('../updater', () => ({
  enhanceReducer: jest.fn(reducer => reducer)
}));
/*==================================================
                        TESTS
==================================================*/
describe('the offline store enhancer creator', () => {
  afterEach(jest.clearAllMocks);

  it('should return a new store enhancer function', () => {
    const offlineEnhancer = offline(defaultUserConfig);

    expect(offlineEnhancer).toBeInstanceOf(Function);
    expect(offlineEnhancer.length).toBe(1);

    const storeCreator = offlineEnhancer(mockCreateStore);
    const store = storeCreator(dummyReducer);

    expect(mockCreateStore).toHaveBeenCalled();
    expect(store.dispatch).toBeInstanceOf(jest.fn.constructor);
    expect(store.getState).toBeInstanceOf(jest.fn.constructor);
    expect(store.subscribe).toBeInstanceOf(jest.fn.constructor);
    expect(store.replaceReducer).toBeInstanceOf(jest.fn.constructor);
  });

  describe('the store creator that is returned from the offline store enhancer', () => {
    it('should take in a reducer and pass it to enhanceReducer', () => {
      const reducer = nope => nope;
      offlineWithDefaults({ reducer });
      expect(enhanceReducer).toHaveBeenCalledWith(reducer);
    });

    it(`should take in a config object provided by the user, add default config 
      options to it, and then pass it to 'createOfflineMiddleware'`, () => {
      offlineWithDefaults();

      const configWithDefaults = applyDefaults(defaultUserConfig);
      expect(createOfflineMiddleware).toHaveBeenCalledWith(configWithDefaults);
    });

    // @TODO: Figure out why ReduxPersist.autoRehydrate isn't mocking correctly
    it.skip(
      `should call compose passing in the offline middleware, enhancer, and return 
      value of autoRehydrate if config.persist && config.rehydrate are not falsy`,
      () => {
        Redux.compose = jest.fn();

        offlineWithDefaults();

        expect(Redux.compose).toHaveBeenCalled();
        expect(autoRehydrate).toHaveBeenCalled();

        Redux.compose.mockReset();
        autoRehydrate.mockReset();

        offlineWithDefaults({
          userConfig: { persist: null }
        });

        expect(Redux.compose).toHaveBeenCalled();
        expect(autoRehydrate).not.toHaveBeenCalled();

        Redux.compose.mockReset();
        autoRehydrate.mockReset();

        offlineWithDefaults({
          userConfig: { rehydrate: false }
        });

        expect(Redux.compose).toHaveBeenCalled();
        expect(autoRehydrate).not.toHaveBeenCalled();
      }
    );

    it(`should, in the case where a persist function was included 
      on config, call the persist function passing in the the store 
      as well as any options included in config.persistOptions`, () => {
      const overrides = {
        userConfig: {
          persist: jest.fn(),
          persistOptions: { foo: 'bar' }
        }
      };

      offlineWithDefaults(overrides);
      const { persist, persistOptions } = overrides.userConfig;

      expect(persist).toHaveBeenCalled();
      expect(persist.mock.calls[0][0].dispatch).toBeInstanceOf(Function);
      expect(persist.mock.calls[0][1]).toBe(persistOptions);
    });

    it(`should, in the case where a detectNetwork function was included in 
      config, call the detectNetwork function, passing in a calback which 
      takes in a boolean and dispatches the networkStatuChanged action to 
      the store with the boolean as the payload`, () => {
      const originalAction = Actions.networkStatusChanged;
      Actions.networkStatusChanged = jest.fn(() => originalAction(true));

      const overrides = {
        userConfig: { detectNetwork: jest.fn(cb => cb(true)) }
      };

      offlineWithDefaults(overrides);
      const { detectNetwork } = overrides.userConfig;

      expect(detectNetwork).toHaveBeenCalled();
      expect(detectNetwork.mock.calls[0][0]).toBeInstanceOf(Function);
      expect(Actions.networkStatusChanged.mock.calls[0][0]).toBe(true);

      // test that the action creator won't be called a second time if !detectNetwork
      const noDetectOverrides = {
        userConfig: { detectNetwork: null }
      };

      offlineWithDefaults(noDetectOverrides);

      expect(Actions.networkStatusChanged.mock.calls.length).toBe(1);
      Actions.networkStatusChanged.mockClear();
    });
  });
});
