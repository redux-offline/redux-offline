import { Action } from '../../types';

function enqueue(outbox: Action[], item: Action) {
  return [...outbox, item];
}

function dequeue(outbox: Action[], _action: Action) {
  const newOutbox = outbox.slice(1);
  return newOutbox;
}

function peek(outbox: Action[]): Action {
  return outbox[0];
}

export default {
  enqueue,
  dequeue,
  peek
};
