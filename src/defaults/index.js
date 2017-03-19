import persist from './persist';
import detectNetwork from './detectNetwork';
import send from './send';
import batch from './batch';
import retry from './retry';

export default {
  rehydrate: true,
  strategies: {
    persist,
    detectNetwork,
    batch,
    send,
    retry
  }
};
