import send from '../send';
import { busy, scheduleRetry, retryCountExceeded } from '../actions';
import defaultCommitAction from '../defaults/defaultCommit';
import defaultRollbackAction from '../defaults/defaultRollback';
import offlineActionTracker from '../offlineActionTracker';

const DELAY = 1000;
const completedMeta = {
  meta: expect.objectContaining({ completed: expect.any(Boolean) })
};

function setup(partialConfig) {
  const defaultConfig = {
    effect: jest.fn(() => Promise.resolve()),
    discard: () => false,
    discardOnRetryCountExceeded: true,
    retry: () => DELAY,
    defaultCommit: defaultCommitAction,
    defaultRollback: defaultRollbackAction,
    offlineActionTracker: offlineActionTracker.withoutPromises
  };

  return {
    action: {
      type: 'REQUEST',
      meta: {
        offline: {
          effect: { url: '/api/resource', method: 'get' },
          commit: { type: 'COMMIT' },
          rollback: { type: 'ROLLBACK' }
        },
        transaction: 0
      }
    },
    config: { ...defaultConfig, ...partialConfig },
    dispatch: jest.fn()
  };
}

test('dispatches busy action', () => {
  const { action, config, dispatch } = setup();
  const promise = send(action, dispatch, config);

  expect.assertions(2);
  return promise.then(() => {
    expect(dispatch).toBeCalledWith(busy(true));
    expect(dispatch).toHaveBeenLastCalledWith(busy(false));
  });
});

test('requests resource using effects reconciler', () => {
  const { action, config, dispatch } = setup();
  send(action, dispatch, config);
  expect(config.effect).toBeCalledWith(action.meta.offline.effect, action);
});

describe('when request succeeds', () => {
  test('dispatches complete action', () => {
    const effect = () => Promise.resolve();
    const { action, config, dispatch } = setup({ effect });
    const promise = send(action, dispatch, config);

    const { commit } = action.meta.offline;
    expect.assertions(2);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(commit));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });
});

describe('when request fails', () => {
  test('dispatches schedule retry action', () => {
    const effect = () => Promise.reject();
    const { action, config, dispatch } = setup({ effect });
    const promise = send(action, dispatch, config);

    expect.assertions(1);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(scheduleRetry(DELAY));
    });
  });

  test('dispatches complete: failed action on max retries', () => {
    const effect = () => Promise.reject();
    const retry = () => null;
    const { action, config, dispatch } = setup({ effect, retry });
    const promise = send(action, dispatch, config);

    const { rollback } = action.meta.offline;
    expect.assertions(2);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });

  test('dispatches retry count exceeded action on max retries when preventDiscardOnRetryCountExceeded is configured', () => {
    const effect = () => Promise.reject();
    const discard = () => false;
    const retry = () => null;
    const discardOnRetryCountExceeded = false;
    const { action, config, dispatch } = setup({ effect, discard, retry, discardOnRetryCountExceeded });
    const promise = send(action, dispatch, config);

    expect.assertions(1);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(retryCountExceeded());
    });
  });

  test('dispatches complete: failed action on discard', () => {
    const effect = () => Promise.reject();
    const discard = () => true;
    const { action, config, dispatch } = setup({ effect, discard });
    const promise = send(action, dispatch, config);

    const { rollback } = action.meta.offline;
    expect.assertions(2);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });

  test('dispatches complete: failed action with promised discard', () => {
    const effect = () => Promise.reject();
    const discard = () => Promise.resolve(true);
    const { action, config, dispatch } = setup({ effect, discard });
    const promise = send(action, dispatch, config);

    const { rollback } = action.meta.offline;
    expect.assertions(2);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });

  test('dispatches complete: failed action when discard throw an exception', () => {
    const effect = () => Promise.reject();
    const discard = () => {throw new Error};
    const { action, config, dispatch } = setup({ effect, discard });
    const promise = send(action, dispatch, config);

    const { rollback } = action.meta.offline;
    expect.assertions(2);
    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(rollback));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });
});

describe('when request succeeds and commit is undefined', () => {
  test('dispatches default commit action', () => {
    const effect = () => Promise.resolve();

    const action = {
      type: 'REQUEST',
      meta: {
        offline: {
          effect: { type: 'MOCK' },
        },
      },
    };

    const { config, dispatch } = setup({ effect });

    const promise = send(action, dispatch, config)

    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(defaultCommitAction));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });
});

describe('when request is to be discarded and rollback is undefined', () => {
  test('dispatches default rollback action', () => {
    const effect = () => Promise.reject();
    const discard = () => true;

    const action = {
      type: 'REQUEST',
      meta: {
        offline: {
          effect: { type: 'MOCK' },
        },
      },
    };

    const { config, dispatch } = setup({ effect, discard });

    const promise = send(action, dispatch, config)

    return promise.then(() => {
      expect(dispatch).toBeCalledWith(expect.objectContaining(defaultRollbackAction));
      expect(dispatch).toBeCalledWith(expect.objectContaining(completedMeta));
    });
  });
});

describe('offlineActionTracker', () => {
  let trackerMock;
  beforeEach(() => {
    trackerMock = {
      registerAction: () => {},
      resolveAction: jest.fn(),
      rejectAction: jest.fn()
    }
  })
  test('resolves action on successful complete', () => {
    const effect = () => Promise.resolve();
    const { action, config, dispatch } = setup({ effect });
    const promise = send(action, dispatch, {
      ...config,
      offlineActionTracker: trackerMock
    });

    expect.assertions(1);
    return promise.then(() => expect(trackerMock.resolveAction).toBeCalled());
  });

  test('rejects action on failed complete', () => {
    const effect = () => Promise.reject(new Error());
    const discard = () => true;
    const { action, config, dispatch } = setup({ effect, discard });
    const promise = send(action, dispatch, {
      ...config,
      offlineActionTracker: trackerMock
    });

    expect.assertions(1);
    return promise.then(() => expect(trackerMock.rejectAction).toBeCalled());
  });
});
