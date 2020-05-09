import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { KEY_PREFIX } from "redux-persist/lib/constants"
import { AsyncNodeStorage } from "redux-persist-node-storage";
import instrument from "redux-devtools-instrument";
import { createOffline, offline } from "../index";
import { applyDefaults } from "../config";
import { networkStatusChanged, retryCountExceeded, resetRetryCount } from "../actions";

const storageKey = `${KEY_PREFIX}offline`;
const defaultReducer = (state = {}) => state;
const noop = () => {};

let defaultConfig;
beforeEach(() => {
  const storage = new AsyncNodeStorage("/tmp/storageDir");
  defaultConfig = applyDefaults({
    effect: jest.fn(() => Promise.resolve()),
    persistOptions: { storage }
  });
});

test("offline() creates storeEnhancer", () => {
  const storeEnhancer = offline(defaultConfig);

  const store = storeEnhancer(createStore)(defaultReducer);
  expect(store.dispatch).toEqual(expect.any(Function));
  expect(store.getState).toEqual(expect.any(Function));
});

test("createOffline() creates storeEnhancer", () => {
  const { middleware, enhanceReducer, enhanceStore } =
    createOffline(defaultConfig);
  const reducer = enhanceReducer(defaultReducer);
  const store = createStore(reducer, compose(
    applyMiddleware(middleware),
    enhanceStore
  ));
  expect(store.dispatch).toEqual(expect.any(Function));
  expect(store.getState).toEqual(expect.any(Function));
});

// see https://github.com/redux-offline/redux-offline/issues/31
test("supports HMR by overriding `replaceReducer()`", () => {
  const store = offline(defaultConfig)(createStore)(defaultReducer);
  store.replaceReducer(combineReducers({
    data: defaultReducer
  }));
  store.dispatch({ type: "SOME_ACTION" });
  expect(store.getState()).toHaveProperty("offline");
});

test("createOffline() supports HMR", () => {
  const { middleware, enhanceReducer, enhanceStore } =
    createOffline(defaultConfig);
  const reducer = enhanceReducer(defaultReducer);
  const store = createStore(reducer, compose(
    applyMiddleware(middleware),
    enhanceStore
  ));
  store.replaceReducer(combineReducers({
    data: defaultReducer
  }));
  store.dispatch({ type: "SOME_ACTION" });
  expect(store.getState()).toHaveProperty("offline");
});

// see https://github.com/redux-offline/redux-offline/issues/4
test("restores offline outbox when rehydrates", done => {
  const actions = [{
    type: "SOME_OFFLINE_ACTION",
    meta: { offline: { effect: {} } }
  }];
  defaultConfig.persistOptions.storage.setItem(
    storageKey,
    JSON.stringify({ outbox: actions }),
    noop
  );

  const store = offline({
    ...defaultConfig,
    persistCallback() {
      const { offline: { outbox } } = store.getState();
      expect(outbox).toEqual(actions);
      done();
    }
  })(createStore)(defaultReducer);
});

// see https://github.com/jevakallio/redux-offline/pull/91
test("works with devtools store enhancer", () => {
  const monitorReducer = state => state;
  const store = createStore(
    defaultReducer,
    compose(offline(defaultConfig), instrument(monitorReducer))
  );

  expect(() => {
    store.dispatch({ type: "SOME_ACTION" });
  }).not.toThrow();
});

// there were some reports that this might not be working correctly
test("coming online processes outbox", () => {
  const { middleware, enhanceReducer } = createOffline(defaultConfig);
  const reducer = enhanceReducer(defaultReducer);
  const store = createStore(reducer, applyMiddleware(middleware));

  expect(store.getState().offline.online).toBe(false);
  const action = { type: "REQUEST", meta: { offline: { effect: {} } } };
  store.dispatch(action);
  expect(defaultConfig.effect).not.toBeCalled();

  store.dispatch(networkStatusChanged(true));
  expect(store.getState().offline.online).toBe(true);
  expect(defaultConfig.effect).toBeCalled();
});

test("reset retry count processes outbox", () => {
  const config = {
    ...defaultConfig,
    discardOnRetryCountExceeded: false,
    discard: () => false,
    retry: () => null,
    effect: () => Promise.resolve()
  }

  const { middleware, enhanceReducer } = createOffline(defaultConfig);
  const reducer = enhanceReducer(defaultReducer);
  const store = createStore(reducer, applyMiddleware(middleware));

  store.dispatch(networkStatusChanged(true));
  store.dispatch(retryCountExceeded());

  const action = { type: "REQUEST", meta: { offline: { effect: {} } } };
  store.dispatch(action);

  expect(config.effect).not.toBeCalled();

  store.dispatch(resetRetryCount());
  expect(config.effect).toBeCalled();
});
