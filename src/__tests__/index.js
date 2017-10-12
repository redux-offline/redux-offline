import { compose, createStore } from "redux";
import { KEY_PREFIX } from "redux-persist/lib/constants"
import { AsyncNodeStorage } from "redux-persist-node-storage";
import instrument from "redux-devtools-instrument";
import { offline } from "../index";
import { applyDefaults } from "../config";

beforeEach(() => storage.removeItem(storageKey, noop) );

const defaultOfflineState = {
  busy: false,
  lastTransaction: 0,
  online: true,
  outbox: [],
  receipts: [],
  retryToken: 0,
  retryCount: 0,
  retryScheduled: false,
  netInfo: {
    isConnectionExpensive: null,
    reach: 'NONE'
  }
};

const state = {
  offline: defaultOfflineState
};

test("creates storeEnhancer", () => {
  const reducer = noop;
  const storeEnhancer = offline(defaultConfig);

  const store = storeEnhancer(createStore)(reducer);
  expect(store.dispatch).toEqual(expect.any(Function));
  expect(store.getState).toEqual(expect.any(Function));
});

// see https://github.com/redux-offline/redux-offline/issues/4
test("restores offline outbox when rehydrates", () => {
  const meta = { offline: { effect: {} } };
  const actions = [{ type: "SOME_OFFLINE_ACTION", meta }];
  storage.setItem(
    storageKey,
    JSON.stringify({ outbox: actions }),
    noop
  );
  const reducer = noop;

  expect.assertions(1);
  return new Promise(resolve => {
    const store = offline({
      ...defaultConfig,
      persistCallback() {
        const { offline: { outbox } } = store.getState();
        expect(outbox).toEqual(actions);
        resolve();
      }
    })(createStore)(reducer);
  });
});

// see https://github.com/jevakallio/redux-offline/pull/91
test("works with devtools store enhancer", () => {
  const monitorReducer = state => state;
  const devtoolsEnhancer = instrument(monitorReducer);
  const offlineEnhancer = offline(defaultConfig);
  const reducer = noop;
  const store = createStore(reducer, compose(offlineEnhancer, devtoolsEnhancer));

  expect(() => {
    store.dispatch({ type: "SOME_ACTION" });
  }).not.toThrow();
});

const storage = new AsyncNodeStorage("/tmp/storageDir");
const defaultConfig = applyDefaults({ persistOptions: { storage } });
const storageKey = `${KEY_PREFIX}offline`;
function noop() {
  return state;
}
