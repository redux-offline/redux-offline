/* eslint-disable no-unused-vars */

function enqueue(array, item, context) {
  return [...array, item];
}

function dequeue(array, item, context) {
  const [, ...rest] = array;
  return rest;
}

function peek(array, item, context) {
  return array[0];
}

export default {
  enqueue,
  dequeue,
  peek
};
