// @flow

// $FlowIgnore
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore } from 'redux-persist';

export default (store: any, options: {}, callback: any) =>
  persistStore(store, { storage: AsyncStorage, ...options }, callback);
