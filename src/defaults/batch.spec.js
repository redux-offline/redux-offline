/* global describe,it,expect */
const batch = require('./batch').default;

describe('batch', () => {
  it('should return the first element of the array if outbox has elements', () => {
    expect(batch([1])).toEqual([1]);
    expect(batch([1, 2, 3])).toEqual([1]);
  });
  it('should return empty array if outbox is empty', () => {
    expect(batch([])).toEqual([]);
  });
  it('should throw when called with wrong parameters', () => {
    expect(() => batch()).toThrow();
    expect(() => batch(null)).toThrow();
  });
});
