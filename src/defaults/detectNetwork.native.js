import { NetInfo } from 'react-native'; //eslint-disable-line

export default callback => {
  NetInfo.isConnected.addEventListener('change', isOnline => callback(isOnline));
  NetInfo.isConnected.fetch().then(isOnline => callback(isOnline));
};
