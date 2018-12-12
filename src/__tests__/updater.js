import { enhanceReducer } from "../updater";
import { OFFLINE_STATUS_CHANGED } from "../types";
import { PERSIST_REHYDRATE } from "../constants";
import { busy, scheduleRetry, completeRetry } from "../actions";
import { initialState } from "../updater";

const config = {
  queue: {
    enqueue: jest.fn(),
    dequeue: jest.fn()
  },
  offlineStateLens: (state: any) => {
    const { offline, ...rest } = state;
    return {
      get: offline,
      set: (offlineState: any) =>
        typeof offlineState === "undefined"
          ? rest
          : { offline: offlineState, ...rest }
    };
  }
};
let enhanceReducerRef;
const reducer = state => state;
beforeEach(() => {
  enhanceReducerRef = enhanceReducer(reducer, config);
});

describe("offucer", () => {
  test("action type: OFFLINE_COMPLETE_RETRY sets retryScheduled to false", () => {
    const reducerVal = enhanceReducerRef(initialState, completeRetry(true));
    expect(reducerVal.offline.retryScheduled).toBe(false);
  });

  test("action type: OFFLINE_BUSY sets busy to true", () => {
    const reducerVal = enhanceReducerRef(initialState, busy(true));
    expect(reducerVal.offline.busy).toBe(true);
  });

  test("action type: PERSIST_REHYDRATE sets lastTransactions to 27", () => {
    const persistRehydrate = () => ({
      type: PERSIST_REHYDRATE,
      payload: {
        offline: {
          lastTransaction: 27
        }
      }
    });
    const reducerVal = enhanceReducerRef(
      { ...initialState, offline: { ...initialState } },
      persistRehydrate()
    );
    expect(reducerVal.offline.lastTransaction).toBe(27);
  });
  test("action type: OFFLINE_SCHEDULE_RETRY increaments retryCount", () => {
    const reducerVal = enhanceReducerRef(
      { ...initialState, offline: { ...initialState } },
      scheduleRetry()
    );
    expect(reducerVal.offline.retryScheduled).toBe(true);
    expect(reducerVal.offline.retryCount).toBe(initialState.retryCount + 1);
  });

  test("action type: OFFLINE_STATUS_CHANGED sets onlie to false", () => {
    const offlineStatusChanagedAction = () => ({
      type: OFFLINE_STATUS_CHANGED,
      payload: {
        online: true,
        netInfo: "netInfo"
      }
    });
    const reducerVal = enhanceReducerRef(
      { ...initialState, offline: { ...initialState } },
      offlineStatusChanagedAction
    );
    expect(reducerVal.offline.online).toBe(false);
  });

  test("action with meta property", () => {
    const succeedSomeTime = () => ({
      type: "SUCCEED_SOMETIMES",
      meta: { offline: {} }
    });
    const reducerVal = enhanceReducerRef(initialState, succeedSomeTime());
    expect(config.queue.enqueue).toHaveBeenCalled();
  });

  test("action with meta property with complete to be true", () => {
    const succeedSomeTimeO = () => ({
      type: "SUCCEED_SOMETIMES",
      meta: {
        completed: true
      }
    });
    const reducerVal = enhanceReducerRef(initialState, succeedSomeTimeO());
    expect(config.queue.dequeue).toHaveBeenCalled();
  });
});
