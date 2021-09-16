import defaultEffect from '@redux-offline/default-effect';
import { Options } from './types';

const defaults: Options = {
  queue: {
    peek: outbox => outbox[0],
    enqueue: (outbox, item) => [...outbox, item],
    dequeue: (outbox, _action) => {
      const newOutbox = outbox.slice(1);
      return newOutbox;
    },
  },
  effect: defaultEffect,
  discard: (error, _action, retries) => {
    if ('status' in error) {
      // discard http 4xx errors
      return error.status >= 400 && error.status < 500;
    }

    // not a network error -> we retry once
    return retries >= 1;
  },
  retry: (_action, retries) => {
    const exponentialBackoff = [
      1000, // After 1 seconds
      1000 * 5, // After 5 seconds
      1000 * 15, // After 15 seconds
      1000 * 30, // After 30 seconds
      1000 * 60, // After 1 minute
      1000 * 60 * 3, // After 3 minutes
      1000 * 60 * 5, // After 5 minutes
      1000 * 60 * 10, // After 10 minutes
      1000 * 60 * 30, // After 30 minutes
      1000 * 60 * 60, // After 1 hour
    ];

    return exponentialBackoff[retries] || null;
  },
  alterStream: (defaultMiddlewareChain, _context) => defaultMiddlewareChain,
};

export { defaults };
