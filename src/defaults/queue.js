function enqueue(array, item) {
  return [...array, item];
}

// eslint-disable-next-line no-unused-vars
function dequeue(array, _item) {
  const [, ...rest] = array;
  return rest;
}

function peek(array) {
  return array[0];
}

export default {
  enqueue,
  dequeue,
  peek
};
