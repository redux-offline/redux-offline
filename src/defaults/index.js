import persist from './persist';
import detectNetwork from './detectNetwork';
import effect from './effect';
import retry from './retry';
import discard from './discard';
import defaultCommit from './defaultCommit';
import defaultRollback from './defaultRollback';
import persistAutoRehydrate from './persistAutoRehydrate';
import offlineStateLens from './offlineStateLens';
import queue from './queue';

export default {
  rehydrate: true, // backward compatibility, TODO remove in the next breaking change version
  persist,
  detectNetwork,
  effect,
  retry,
  discard,
  discardOnRetryCountExceeded: true,
  defaultCommit,
  defaultRollback,
  persistAutoRehydrate,
  offlineStateLens,
  queue,
  returnPromises: false
};
