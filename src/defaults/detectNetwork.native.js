import { NetInfo } from 'react-native'; //eslint-disable-line

// @TODO: Docs: Android needs
// <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

export default callback => {
  console.log('initializing native detectNetwork');
  NetInfo.isConnected.addEventListener('change', isOnline => callback(isOnline));
  NetInfo.isConnected.fetch().then(isOnline => callback(isOnline));
};
