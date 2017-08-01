import persist from './persist';
import detectNetwork from './detectNetwork';
import effect from './effect';
import batch from './batch';
import retry from './retry';
import discard from './discard';
import persistAutoRehydrate from './persistAutoRehydrate';
import offlineStateLens from './offlineStateLens';

export default {
  rehydrate: true, // backward compatibility, TODO remove in the next breaking change version
  persist,
  detectNetwork,
  batch,
  effect,
  retry,
  discard,
  persistAutoRehydrate,
  offlineStateLens
};
