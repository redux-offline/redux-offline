import { enhanceReducer } from "../updater";
import { OFFLINE_STATUS_CHANGED } from "../types";
import { PERSIST_REHYDRATE, RESET_STATE } from "../constants";
import { busy, scheduleRetry, completeRetry } from "../actions";
import { initialState } from "../updater";
import config from "../defaults";

let enhanceReducerRef;
const reducer = state => state;

const offlineAction = () => ({
  type: "OFFLINE_ACTION",
  meta: { offline: {} }
});

const offlineActionComplete = () => ({
  type: "OFFLINE_ACTION_COMPLETED",
  meta: {
    completed: true
  }
});
describe("offline reducer", () => {
  beforeEach(() => {
    enhanceReducerRef = enhanceReducer(reducer, config);
  });
  test("action type: OFFLINE_COMPLETE_RETRY sets retryScheduled to false", () => {
    const state = enhanceReducerRef(
      { offline: { ...initialState, retryScheduled: true } },
      completeRetry()
    );
    const defaultState = enhanceReducerRef(initialState, completeRetry());
    expect(state.offline.retryScheduled).toBe(false);
    expect(defaultState.offline.retryScheduled).toBe(false);
  });

  test("action type: OFFLINE_BUSY sets busy to true", () => {
    const state = enhanceReducerRef(initialState, busy(true));
    expect(state.offline.busy).toBe(true);
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
      {
        busy: false,
        lastTransaction: 0,
        online: false,
        offline: {
          busy: false,
          lastTransaction: 0,
          online: false
        }
      },
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

  test("enqueu action when offline ", () => {
    const state = enhanceReducerRef(initialState, offlineAction());
    expect(state.offline.outbox).toEqual(
      expect.arrayContaining([
        { meta: { offline: {}, transaction: 1 }, type: "OFFLINE_ACTION" }
      ])
    );
    expect(state.offline.retryCount).toBe(0);
  });

  test("dequeue action when its completed", () => {
    const state = enhanceReducerRef(initialState, offlineActionComplete());
    // it dequeues action from the array
    expect(state.offline.outbox).toEqual([]);
    expect(state.offline.retryCount).toBe(0);
  });
});

// assert enqueue and dequeue to return outbox
describe("assert enqueue and dequeue", () => {
  const mockConfig = {
    queue: {
      enqueue: jest.fn().mockImplementation((ar, item) => [...ar].concat(item)),
      dequeue: jest.fn().mockImplementation(ar => ar.slice(1))
    },
    offlineStateLens: config.offlineStateLens
  };
  beforeEach(() => {
    enhanceReducerRef = enhanceReducer(reducer, mockConfig);
  });
  test("return enqued action", () => {
    const state = enhanceReducerRef(initialState, offlineAction());
    expect(state.offline.outbox).toEqual(
      expect.arrayContaining([
        { meta: { offline: {}, transaction: 1 }, type: "OFFLINE_ACTION" }
      ])
    );
  });
  test("when action is completed remove from queue", () => {
    const state = enhanceReducerRef(initialState, offlineActionComplete());
    expect(state.offline.outbox).toEqual([]);
  });
});
