import { applyMiddleware, compose, createStore } from "redux";
import { KEY_PREFIX } from "redux-persist/lib/constants"
import { AsyncNodeStorage } from "redux-persist-node-storage";
import instrument from "redux-devtools-instrument";
import { createOffline, offline } from "../index";
import { applyDefaults } from "../config";
import { networkStatusChanged } from "../actions";

const storage = new AsyncNodeStorage("/tmp/storageDir");
const storageKey = `${KEY_PREFIX}offline`;
function noop() {}

beforeEach(() => storage.removeItem(storageKey, noop) );

const defaultConfig = applyDefaults({
  effect: jest.fn(() => Promise.resolve()),
  persistOptions: { storage }
});

function defaultReducer(state = {}) {
  return state;
}

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
  store.replaceReducer(defaultReducer);
  store.dispatch({ type: "SOME_ACTION" });
  expect(store.getState()).toHaveProperty("offline");
});

// see https://github.com/redux-offline/redux-offline/issues/4
test("restores offline outbox when rehydrates", () => {
  const actions = [{
    type: "SOME_OFFLINE_ACTION",
    meta: { offline: { effect: {} } }
  }];
  storage.setItem(
    storageKey,
    JSON.stringify({ outbox: actions }),
    noop
  );

  expect.assertions(1);
  return new Promise(resolve => {
    const store = offline({
      ...defaultConfig,
      persistCallback() {
        const { offline: { outbox } } = store.getState();
        expect(outbox).toEqual(actions);
        resolve();
      }
    })(createStore)(defaultReducer);
  });
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
