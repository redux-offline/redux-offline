// @flow
// $FlowIgnore
import { persistStore } from 'redux-persist';
// $FlowIgnore
import AsyncStorage from '@react-native-async-storage/async-storage';

export default (store: any, options: {}, callback: any) =>
  // $FlowFixMe
  persistStore(store, { storage: AsyncStorage, ...options }, callback);
