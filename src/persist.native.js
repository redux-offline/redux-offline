import { AsyncStorage } from 'react-native';
import { persistStore } from 'redux-persist';

export const persist = store => {
  return persistStore(store, { storage: AsyncStorage });
};
