describe('on any action', () => {
  it('does not process outbox when busy', () => {
    // const { config, store, next, action } = setup({ busy: true });
    // createOfflineMiddleware(config)(store)(next)(action);
    // expect(send).not.toBeCalled();
  });

  it('does not process outbox when retry scheduled', () => {
    // const { config, store, next, action } = setup({ retryScheduled: true });
    // createOfflineMiddleware(config)(store)(next)(action);
    // expect(send).not.toBeCalled();
  });

  it('does not process outbox when paused', () => {
    // const { config, store, next, action } = setup({ online: false });
    // createOfflineMiddleware(config)(store)(next)(action);
    // expect(send).not.toBeCalled();
  });
});

// TODO: wrapping `setTimeout()` in a promise in `after()` is pointless
describe('on scheduleRetry', () => {
  jest.useFakeTimers();
  const delay = 15000;

  test('dispatches completeRetry after delay', () => {
    // const { config, store, next } = setup();
    // createOfflineMiddleware(config)(store)(next)(scheduleRetry(delay));
    // jest.runTimersToTime(delay);

    // expect.assertions(1);
    // const nextAction = store.getState().offline.outbox[0];
    // return Promise.resolve().then(() =>
    //   expect(store.dispatch).toBeCalledWith(completeRetry(nextAction)));
  });
});
