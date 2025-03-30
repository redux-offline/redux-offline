/* eslint-disable no-unused-vars */

function enqueue(array, item, context) {
  return [...array, item];
}

function dequeue(array, item, context) {
  let index = array.indexOf(item.meta.offlineAction);
  if (index >= 0)
  {
    let rest = array.slice();
    rest.splice(index, 1);
    return rest;
  }
}

function peek(array, item, context) {
  return array[0];
}

export default {
  enqueue,
  dequeue,
  peek
};
