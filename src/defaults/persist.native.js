// @flow
// $FlowIgnore
import { AsyncStorage } from 'react-native'; // eslint-disable-line
import { persistStore } from 'redux-persist';

export default (store: any, options: {}, callback: any) =>
  // $FlowFixMe
  persistStore(store, { storage: AsyncStorage, ...options }, callback);
