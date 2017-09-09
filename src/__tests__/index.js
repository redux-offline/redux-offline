import { createStore } from "redux";
import { KEY_PREFIX } from "redux-persist/lib/constants"
import { AsyncNodeStorage } from "redux-persist-node-storage";
import { offline } from "../index";
import { applyDefaults } from "../config";

beforeEach(() => storage.removeItem(storageKey, noop) );

test("creates storeEnhancer", () => {
  const reducer = noop;
  const storeEnhancer = offline(defaultConfig);

  const store = storeEnhancer(createStore)(reducer);
  expect(store.dispatch).toEqual(expect.any(Function));
  expect(store.getState).toEqual(expect.any(Function));
});

// see https://github.com/redux-offline/redux-offline/issues/4
test("restores offline outbox when rehydrates", () => {
  const actions = [{ type: "SOME_OFFLINE_ACTION" }];
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

const storage = new AsyncNodeStorage("/tmp/storageDir");
const defaultConfig = applyDefaults({ persistOptions: { storage } });
const storageKey = `${KEY_PREFIX}offline`;
function noop() {}
