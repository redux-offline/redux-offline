import retry from '../../src/defaults/retry';

test('no arguments', () => {
  expect(retry()).toBeNull();
});
