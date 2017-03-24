import persist from './persist';
import detectNetwork from './detectNetwork';
import effect from './effect';
import batch from './batch';
import retry from './retry';

export default {
  rehydrate: true,
  persist,
  detectNetwork,
  batch,
  effect,
  retry
};
