// @flow
// $FlowIgnore
import { persistStore } from 'redux-persist';
// $FlowIgnore
import AsyncStorage from '@react-native-community/async-storage'; // eslint-disable-line	

export default (store: any, options: {}, callback: any) =>
  // $FlowFixMe
  persistStore(store, { storage: AsyncStorage, ...options }, callback);
