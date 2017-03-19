import { AsyncStorage } from 'react-native'; //eslint-disable-line
import { persistStore } from 'redux-persist';

export default store => {
  return persistStore(store, { storage: AsyncStorage });
};
