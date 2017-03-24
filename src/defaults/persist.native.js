// @flow

import { AsyncStorage } from 'react-native'; //eslint-disable-line
import { persistStore } from 'redux-persist';

export default (store: any, options: {}) => {
  return persistStore(store, { storage: AsyncStorage, ...options });
};
