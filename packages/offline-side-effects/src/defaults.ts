import defaultQueue from '@redux-offline/queue';
import defaultEffect from '@redux-offline/effect';
import defaultDiscard from '@redux-offline/discard';
import defaultRetry from '@redux-offline/retry';
import { Options } from './types';

const defaults: Options = {
  queue: defaultQueue,
  effect: defaultEffect,
  discard: defaultDiscard,
  retry: defaultRetry,
  alterStream: (defaultMiddlewareChain, _context) => defaultMiddlewareChain,
};

export { defaults };
