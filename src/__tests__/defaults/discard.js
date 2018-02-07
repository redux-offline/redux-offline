import discard from '../../defaults/discard';

test('discards non-http error', () => {
  const error = { message: 'Non-http error' };
  const action = { type: 'DISCARD', meta: { offline: { effect: {} } } };

  expect(discard(error, action)).toEqual(true);
});

test('discards http 4xx errors', () => {
  const error = { status: 404 };
  const action = { type: 'DISCARD', meta: { offline: { effect: {} } } };

  expect(discard(error, action)).toEqual(true);
});

test('does not discard http 5xx errors', () => {
  const error = { status: 500 };
  const action = { type: 'DISCARD', meta: { offline: { effect: {} } } };

  expect(discard(error, action)).toEqual(false);
});
