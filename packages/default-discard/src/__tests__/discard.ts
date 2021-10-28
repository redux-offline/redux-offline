import discard from '../discard';

const meta = {
  commit: {},
  rollback: {},
  effect: 'any_effect'
}

test('retries non-http error once', () => {
  const error = { message: 'Non-Http error' };
  const action = { meta };

  expect(discard(error, action)).toEqual(false);
});

test('discards non-http after one retry', () => {
  const error = { message: 'Non-Http error' };
  const action = { meta };

  expect(discard(error, action, 1)).toEqual(true);
});

test('discards http 4xx errors', () => {
  const error = { status: 404 };
  const action = { meta };

  expect(discard(error, action)).toEqual(true);
});

test('does not discard http 5xx errors', () => {
  const error = { status: 500 };
  const action = { meta };

  expect(discard(error, action)).toEqual(false);
});
