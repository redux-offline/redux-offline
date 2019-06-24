import retry from '../../defaults/retry';

test('no arguments', () => {
  expect(retry()).toBeNull();
});
