/*==================================================
                   IMPORTS / SETUP
==================================================*/
import outbox from '../../defaults/batch';
/*==================================================
                        TESTS
==================================================*/
describe('outbox', () => {
  it(`should take in an array and return the first element of the 
  array, wrapped in a new array if it has a length > 0`, () => {
    const items = [2, 1];
    expect(outbox(items)).toEqual([2]);
  });

  it('should return a new array if the array passed in has a length of 0', () => {
    const argArray = [];
    const returnVal = outbox(argArray);
    expect(returnVal).not.toBe(argArray);
    expect(returnVal).toBeInstanceOf(Array);
    expect(returnVal.length).toBe(0);
  });
});
