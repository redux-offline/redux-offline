import offlineActionTracker from '../offlineActionTracker.js';
const {
  registerAction,
  resolveAction,
  rejectAction
} = offlineActionTracker.withPromises;

test('resolves first action with correct transaction', () => {
  const transaction = 0;
  const promise = registerAction(transaction);

  const data = { some: "data" };
  resolveAction(transaction, data);

  expect.assertions(1);
  return promise.then(value => expect(value).toEqual(data));
});

test('rejects first action with correct transaction', () => {
  const transaction = 0;
  const promise = registerAction(transaction);

  const data = { some: "data" };
  rejectAction(transaction, data);

  expect.assertions(1);
  return promise.catch(error => expect(error).toEqual(data));
});

test('does not resolve first action with incorrect transaction', () => {
  const transaction = 0;
  const promise = registerAction(transaction);

  const incorrectData = { incorrect: "data" };
  resolveAction(transaction + 1, incorrectData);

  const correctData = { some: "data" };
  resolveAction(transaction, correctData);

  expect.assertions(1);
  return promise.then(value => expect(value).toEqual(correctData));
});

test('resolves second action with correct transaction', () => {
  const array = [];

  registerAction(0).then(() => array.push(0));
  const promise = registerAction(1).then(() => array.push(1));
  resolveAction(1);
  resolveAction(0);

  expect.assertions(1);
  return promise.then(() => expect(array).toEqual([1, 0]));
});
