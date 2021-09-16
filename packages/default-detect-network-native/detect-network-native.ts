/* eslint no-underscore-dangle: 0 */
import { AppState, NetInfo } from 'react-native'; // eslint-disable-line

type DetectNetworkNativeCallback = (connectionInfo: {
  online: boolean,
  netInfo: {
    isConnectionExpensive: NetInfo['isConnectionExpensive'];
    reach: NetInfo['reach'];
  }
}) => void;

type Reach = NetInfo['reach'] | null;
type IsConnected = boolean | null;
type IsConnectionExpensive = NetInfo['isConnectionExpensive'] | null;

class NativeNetworkDetector {
  _reach: Reach
  _isConnected: IsConnected
  _isConnectionExpensive: IsConnectionExpensive;
  _callback: DetectNetworkNativeCallback;
  _shouldInitUpdateReach: boolean;

  constructor(callback: DetectNetworkNativeCallback) {
    this._reach = null;
    this._isConnected = null;
    this._isConnectionExpensive = null;
    this._callback = callback;
    this._shouldInitUpdateReach = true;

    this._init();
    this._addListeners();
  }

  /**
   * Check props for changes
   * @param {string} reach - connection reachability.
   *     - Cross-platform: [none, wifi, cellular, unknown]
   *     - Android: [bluetooth, ethernet, wimax]
   * @returns {boolean} - Whether the connection reachability or the connection props have changed
   * @private
   */
  _hasChanged = (reach: Reach) => {
    if (this._reach !== reach) {
      return true;
    }
    return this._isConnected !== this._getConnection(reach);
  };

  /**
   * Sets the connection reachability prop
   * @param {string} reach - connection reachability.
   *     - Cross-platform: [none, wifi, cellular, unknown]
   *     - Android: [bluetooth, ethernet, wimax]
   * @returns {void}
   * @private
   */
  _setReach = (reach: Reach) => {
    this._reach = reach;
    this._isConnected = this._getConnection(reach);
  };

  /**
   * Gets the isConnected prop depending on the connection reachability's value
   * @param {string} reach - connection reachability.
   *     - Cross-platform: [none, wifi, cellular, unknown]
   *     - Android: [bluetooth, ethernet, wimax]
   * @returns {void}
   * @private
   */
  _getConnection = (reach: Reach) => reach !== 'none' && reach !== 'unknown';

  /**
   * Sets the isConnectionExpensive prop
   * @returns {Promise.<void>} Resolves to true if connection is expensive,
   * false if not, and null if not supported.
   * @private
   */
  _setIsConnectionExpensive = async () => {
    try {
      this._isConnectionExpensive = await NetInfo.isConnectionExpensive();
    } catch (err) {
      // err means that isConnectionExpensive is not supported in iOS
      this._isConnectionExpensive = null;
    }
  };

  /**
   * Sets the shouldInitUpdateReach flag
   * @param {boolean} shouldUpdate - Whether the init method should update the reach prop
   * @returns {void}
   * @private
   */
  _setShouldInitUpdateReach = (shouldUpdate: boolean) => {
    this._shouldInitUpdateReach = shouldUpdate;
  };

  /**
   * Fetches and sets the connection reachability and the isConnected props,
   * if neither of the AppState and NetInfo event listeners have been called
   * @returns {Promise.<void>} Resolves when the props have been
   * initialized and update.
   * @private
   */
  _init = async () => {
    const connectionInfo = await NetInfo.getConnectionInfo();
    if (this._shouldInitUpdateReach) {
      this._update(connectionInfo.type);
    }
  };

  /**
   * Check changes on props and store and dispatch if neccesary
   * @param {string} reach - connection reachability.
   *     - Cross-platform: [none, wifi, cellular, unknown]
   *     - Android: [bluetooth, ethernet, wimax]
   * @returns {void}
   * @private
   */
  _update = (reach: Reach) => {
    if (this._hasChanged(reach)) {
      this._setReach(reach);
      this._dispatch();
    }
  };

  /**
   * Adds listeners for when connection reachability and app state changes to update props
   * @returns {void}
   * @private
   */
  _addListeners() {
    NetInfo.addEventListener('connectionChange', connectionInfo => {
      this._setShouldInitUpdateReach(false);
      this._update(connectionInfo.type);
    });
    AppState.addEventListener('change', async () => {
      this._setShouldInitUpdateReach(false);
      const connectionInfo = await NetInfo.getConnectionInfo();
      this._update(connectionInfo.type);
    });
  }

  /**
   * Executes the given callback to update state with the new internal props
   * @returns {Promise.<void>} Resolves after fetching the isConnectionExpensive
   * and dispatches actions
   * @private
   */
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

const detectNetworkNative = (callback: DetectNetworkNativeCallback) => new NativeNetworkDetector(callback);

export default detectNetworkNative;
