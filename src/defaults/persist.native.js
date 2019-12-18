// @flow

// $FlowIgnore
import { persistStore } from 'redux-persist';
import { AsyncStorage } from "react-native"; // eslint-disable-line

export default (store: any, options: {}, callback: any) =>
  persistStore(store, { storage: AsyncStorage, ...options }, callback);
