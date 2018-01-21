import send from '../send';
import { busy, scheduleRetry } from '../actions';
import defaultCommitAction from '../defaults/defaultCommit';
import defaultRollbackAction from '../defaults/defaultRollback';
import { resolveAction, rejectAction } from '../offlineActionTracker';

const DELAY = 1000;
const completedMeta = {
  meta: expect.objectContaining({ completed: expect.any(Boolean) })
};

function setup(partialConfig) {
  const defaultConfig = {
    effect: jest.fn(() => Promise.resolve()),
    discard: () => false,
    retry: () => DELAY,
    defaultCommit: defaultCommitAction,
    defaultRollback: defaultRollbackAction,
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
  send(action, dispatch, config);
  expect(dispatch).toBeCalledWith(busy(true));
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

  test('dispatches complete action on discard', () => {
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

  test('dispatches complete action with promised discard', () => {
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

  test('dispatches complete action when discard throw an exception', () => {
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

jest.mock('../offlineActionTracker', () => ({
  resolveAction: jest.fn(),
  rejectAction: jest.fn()
}));

describe('offlineActionTracker', () => {
  beforeEach(() => {
    resolveAction.mockClear();
    rejectAction.mockClear();
  });

  test('resolves action on successful complete', () => {
    const effect = () => Promise.resolve();
    const { action, config, dispatch } = setup({ effect });
    const promise = send(action, dispatch, config);

    expect.assertions(1);
    return promise.then(() => expect(resolveAction).toBeCalled());
  });

  test('rejects action on failed complete', () => {
    const effect = () => Promise.reject();
    const discard = () => true;
    const { action, config, dispatch } = setup({ effect, discard });
    const promise = send(action, dispatch, config);

    expect.assertions(1);
    return promise.then(() => expect(rejectAction).toBeCalled());
  });
});
