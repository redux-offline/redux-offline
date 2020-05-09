import { createOfflineMiddleware } from '../middleware';
import { completeRetry, scheduleRetry } from '../actions';
import defaultConfig from '../defaults';
import { OFFLINE_SEND } from '../constants';
import send from '../send';
import offlineActionTracker from '../offlineActionTracker';

const offlineAction = {
  type: 'OFFLINE_ACTION_REQUEST',
  meta: {
    offline: {
      effect: { url: '/api/endpoint', method: 'POST' },
      commit: { type: 'OFFLINE_ACTION_COMMIT' },
      rollback: { type: 'OFFLINE_ACTION_ROLLBACK' }
    },
    transaction: 0
  }
};

const defaultOfflineState = {
  busy: false,
  lastTransaction: 0,
  online: true,
  outbox: [offlineAction],
  receipts: [],
  retryToken: 0,
  retryCount: 0,
  retryCountExceeded: false,
  retryScheduled: false,
  netInfo: {
    isConnectionExpensive: null,
    reach: 'NONE'
  }
};

function setup(offlineState = {}) {
  const state = {
    offline: { ...defaultOfflineState, ...offlineState }
  };
  return {
    config: {
      ...defaultConfig,
      rehydrate: false,
      persist: null,
      detectNetwork: null,
      batch: jest.fn(outbox => outbox.slice(0, 1)),
      effect: jest.fn(),
      retry: jest.fn(),
      discard: jest.fn(),
      offlineActionTracker: offlineActionTracker.withoutPromises
    },
    store: {
      getState: jest.fn(() => state),
      dispatch: jest.fn()
    },
    next: jest.fn(action => ({ actions: [action] })),
    action: { type: 'NOT_OFFLINE_ACTION' }
  };
}

// NOTE: there is not currently an action creator for this
function offlineSend() {
  return { type: OFFLINE_SEND };
}

jest.mock('../send', () => jest.fn(() => Promise.resolve()));
beforeEach(send.mockClear);

test('creates middleware', () => {
  const { config, store, next, action } = setup();
  const middleware = createOfflineMiddleware(config);

  const result = middleware(store)(next)(action);
  expect(next).toBeCalled();
  expect(result).toEqual(next(action));
});

describe('on any action', () => {
  it('processes outbox when idle', () => {
    const { config, store, next, action } = setup();
    createOfflineMiddleware(config)(store)(next)(action);
    expect(send).toBeCalled();
  });

  it('does not process outbox when busy', () => {
    const { config, store, next, action } = setup({ busy: true });
    createOfflineMiddleware(config)(store)(next)(action);
    expect(send).not.toBeCalled();
  });

  it('does not process outbox when retry scheduled', () => {
    const { config, store, next, action } = setup({ retryScheduled: true });
    createOfflineMiddleware(config)(store)(next)(action);
    expect(send).not.toBeCalled();
  });

  it('does not process outbox when retry count exceeded', () => {
    const { config, store, next, action } = setup({ retryCountExceeded: true });
    createOfflineMiddleware(config)(store)(next)(action);
    expect(send).not.toBeCalled();
  });

  it('does not process outbox when offline', () => {
    const { config, store, next, action } = setup({ online: false });
    createOfflineMiddleware(config)(store)(next)(action);
    expect(send).not.toBeCalled();
  });
});

// TODO: test for double dispatch
describe('on OFFLINE_SEND', () => {
  it('processes outbox when idle', () => {
    const { config, store, next } = setup();
    createOfflineMiddleware(config)(store)(next)(offlineSend());
    expect(send).toBeCalled();
  });

  it('does not process outbox when busy', () => {
    const { config, store, next } = setup({ busy: true });
    createOfflineMiddleware(config)(store)(next)(offlineSend());
    expect(send).not.toBeCalled();
  });

  it('processes outbox when retry scheduled', () => {
    const { config, store, next } = setup({ retryScheduled: true });
    createOfflineMiddleware(config)(store)(next)(offlineSend());
    expect(send).toBeCalled();
  });

  it('processes outbox when offline', () => {
    const { config, store, next } = setup({ online: false });
    createOfflineMiddleware(config)(store)(next)(offlineSend());
    expect(send).toBeCalled();
  });
});

// TODO: wrapping `setTimeout()` in a promise in `after()` is pointless
describe('on OFFLINE_SCHEDULE_RETRY', () => {
  jest.useFakeTimers();
  const delay = 15000;

  test('dispatches COMPLETE_RETRY after delay', () => {
    const { config, store, next } = setup();
    createOfflineMiddleware(config)(store)(next)(scheduleRetry(delay));
    jest.runTimersToTime(delay);

    expect.assertions(1);
    const nextAction = store.getState().offline.outbox[0];
    return Promise.resolve().then(() =>
      expect(store.dispatch).toBeCalledWith(completeRetry(nextAction)));
  });
});

test('offlineActionTracker without promises', () => {
  const { config, store, next } = setup();

  const value = createOfflineMiddleware(config)(store)(next)(offlineAction);
  expect(value).not.toHaveProperty('then');
});

describe('offlineActionTracker integration', () => {
  let config, store, next;
  beforeEach(() => {
    ({ config, store, next } = setup())
    config = {
      ...config,
      offlineActionTracker: offlineActionTracker.withPromises 
    };
  });

  test('returns a promise that can be resolved', () => {
    const promise = createOfflineMiddleware(config)(store)(next)(offlineAction);

    const transaction = 0;
    const data = { some: "data" };
    config.offlineActionTracker.resolveAction(transaction, data);

    expect.assertions(1);
    return promise.then(value => expect(value).toEqual(data));
  });

  test('returns a promise that can be rejected', () => {
    const promise = createOfflineMiddleware(config)(store)(next)(offlineAction);

    const transaction = 0;
    const data = { some: 'data' };
    config.offlineActionTracker.rejectAction(transaction, data);

    expect.assertions(1);
    return promise.catch(error => expect(error).toEqual(data));
  });
});
