import { persistStore } from 'redux-persist';

export const persist = store => {
  return persistStore(store);
};
