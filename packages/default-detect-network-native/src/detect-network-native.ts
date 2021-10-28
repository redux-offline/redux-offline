/* eslint no-underscore-dangle: 0 */
import { AppState } from 'react-native'; // eslint-disable-line
import NetInfo, {
  NetInfoConnectedDetails,
  NetInfoState
} from '@react-native-community/netinfo'; // eslint-disable-line

type Reach = NetInfoState['type'] | null;
type IsConnected = boolean | null;
type IsConnectionExpensive =
  | NetInfoConnectedDetails['isConnectionExpensive']
  | null;

type DetectNetworkNativeCallback = (connectionInfo: {
  online: boolean;
  netInfo: {
    isConnectionExpensive: IsConnectionExpensive;
    reach: Reach;
  };
}) => void;

class NativeNetworkDetector {
  _reach: Reach;
  _isConnected: IsConnected;
  _isConnectionExpensive: IsConnectionExpensive;
  _callback: DetectNetworkNativeCallback;
  _shouldInitUpdateReach: boolean;

  constructor(callback) {
    this._reach = null;
    this._isConnected = null;
    this._isConnectionExpensive = null;
    this._callback = callback;
    this._shouldInitUpdateReach = true;

    this._init();
    this._addListeners();
  }

  _hasChanged = (reach: Reach) => {
    if (this._reach !== reach) {
      return true;
    }
    if (this._isConnected !== this._getConnection(reach)) {
      return true;
    }
    return false;
  };

  _setReach = (reach: Reach) => {
    this._reach = reach;
    this._isConnected = this._getConnection(reach);
  };

  _getConnection = (reach: Reach) => reach !== 'none' && reach !== 'unknown';

  _setIsConnectionExpensive = async () => {
    try {
      const { details } = await NetInfo.fetch();
      this._isConnectionExpensive = details.isConnectionExpensive;
    } catch (err) {
      // err means that isConnectionExpensive is not supported in iOS
      this._isConnectionExpensive = null;
    }
  };

  _setShouldInitUpdateReach = (shouldUpdate: boolean) => {
    this._shouldInitUpdateReach = shouldUpdate;
  };

  _init = async () => {
    const connectionInfo = await NetInfo.fetch();
    if (this._shouldInitUpdateReach) {
      this._update(connectionInfo.type);
    }
  };

  _update = (reach: Reach) => {
    if (this._hasChanged(reach)) {
      this._setReach(reach);
      this._dispatch();
    }
  };

  _addListeners() {
    NetInfo.addEventListener((connectionInfo) => {
      this._setShouldInitUpdateReach(false);
      this._update(connectionInfo.type);
    });
    AppState.addEventListener('change', async () => {
      this._setShouldInitUpdateReach(false);
      const connectionInfo = await NetInfo.fetch();
      this._update(connectionInfo.type);
    });
  }

  _dispatch = async () => {
    await this._setIsConnectionExpensive();
    this._callback({
      online: this._isConnected,
      netInfo: {
        isConnectionExpensive: this._isConnectionExpensive,
        reach: this._reach
      }
    });
  };
}

const detectNetworkNative = (callback: DetectNetworkNativeCallback) =>
  new NativeNetworkDetector(callback);

export default detectNetworkNative;
