import { enhanceReducer } from "../updater";
import { OFFLINE_STATUS_CHANGED } from "../types";
import { PERSIST_REHYDRATE, RESET_STATE } from "../constants";
import { busy, scheduleRetry, completeRetry } from "../actions";
import { initialState } from "../updater";
import config from "../defaults";

let enhanceReducerRef;
const reducer = state => state;
beforeEach(() => {
  enhanceReducerRef = enhanceReducer(reducer, config);
});

describe("offline reducer", () => {
  test("action type: OFFLINE_COMPLETE_RETRY sets retryScheduled to false", () => {
    const reducerVal = enhanceReducerRef(
      { offline: { ...initialState, retryScheduled: true } },
      completeRetry()
    );
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
    const state = enhanceReducerRef(
      { ...initialState, offline: { ...initialState } },
      persistRehydrate()
    );
    expect(state.offline.lastTransaction).toBe(27);
  });
  test("action type: OFFLINE_SCHEDULE_RETRY increaments retryCount", () => {
    const state = enhanceReducerRef(
      { ...initialState, offline: { ...initialState } },
      scheduleRetry()
    );
    expect(state.offline.retryScheduled).toBe(true);
    expect(state.offline.retryCount).toBe(initialState.retryCount + 1);
  });

  test("action type: OFFLINE_STATUS_CHANGED sets onlie to false", () => {
    const offlineStatusChanagedAction = () => ({
      type: OFFLINE_STATUS_CHANGED,
      payload: {
        online: true,
        netInfo: "netInfo"
      }
    });
    const state = enhanceReducerRef(
      { ...initialState, offline: { ...initialState } },
      offlineStatusChanagedAction
    );
    expect(state.offline.online).toBe(false);
  });

  test("action type: RESET_STATE ", () => {
    const resetState = () => ({
      type: RESET_STATE
    });
    const state = enhanceReducerRef(initialState, resetState());
    expect(state.offline.online).toBe(initialState.online);
    expect(state.offline.netInfo).toBe(initialState.netInfo);
  });

  test("action with meta property", () => {
    const succeedSomeTime = () => ({
      type: "SUCCEED_SOMETIMES",
      meta: { offline: {} }
    });
    const state = enhanceReducerRef(initialState, succeedSomeTime());
    expect(state.offline.outbox).toEqual(
      expect.arrayContaining([
        { meta: { offline: {}, transaction: 1 }, type: "SUCCEED_SOMETIMES" }
      ])
    );
    expect(state.offline.retryCount).toBe(0);
  });

  test("action with meta property and complete set to true", () => {
    const offlineActionComplete = () => ({
      type: "SUCCEED_SOMETIMES",
      meta: {
        completed: true
      }
    });
    const state = enhanceReducerRef(initialState, offlineActionComplete());
    // it dequeues action from the array
    expect(state.offline.outbox).toEqual([]);
    expect(state.offline.retryCount).toBe(0);
  });
});
