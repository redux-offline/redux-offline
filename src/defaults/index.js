import persist from './persist';
import detectNetwork from './detectNetwork';
import effect from './effect';
import retry from './retry';
import discard from './discard';

export default {
  rehydrate: true,
  persist,
  detectNetwork,
  effect,
  retry,
  discard
};
