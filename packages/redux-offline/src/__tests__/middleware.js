import createReduxOfflineMiddleware from '../middleware';

test('creates middleware', () => {
  // const { config, store, next, action } = setup();
  // const middleware = createOfflineMiddleware(config);
  // const result = middleware(store)(next)(action);
  // expect(next).toBeCalled();
  // expect(result).toEqual(next(action));
});

describe('on any action', () => {
  it('processes outbox when idle', () => {
    const { config, store, next, action } = setup();
    createOfflineMiddleware(config)(store)(next)(action);
    expect(send).toBeCalled();
  });
});
