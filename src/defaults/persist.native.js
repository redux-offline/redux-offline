// @flow

//$FlowIgnore
import { AsyncStorage } from 'react-native'; //eslint-disable-line import/no-unresolved
import { persistStore } from 'redux-persist';

export default (store: any, options: {}, callback: any) => {
  return persistStore(store, { storage: AsyncStorage, ...options }, callback);
};
