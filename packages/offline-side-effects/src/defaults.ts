import defaultQueue from '@redux-offline/default-queue';
import defaultEffect from '@redux-offline/default-effect';
import defaultDiscard from '@redux-offline/default-discard';
import defaultRetry from '@redux-offline/default-retry';
import { Options } from './types';

const defaults: Options = {
  queue: defaultQueue,
  effect: defaultEffect,
  discard: defaultDiscard,
  retry: defaultRetry,
  alterStream: (defaultMiddlewareChain, _context) => defaultMiddlewareChain,
};

export { defaults };
