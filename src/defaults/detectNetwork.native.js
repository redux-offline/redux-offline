/* eslint no-underscore-dangle: 0 */
import { AppState, NetInfo } from 'react-native'; // eslint-disable-line import/no-unresolved

class DetectNetwork {
  constructor(callback) {
    this._reach = null;
    this._isConnected = null;
    this._isConnectionExpensive = null;
    this._callback = callback;

    this._init();
    this._addListeners();
  }

  /**
   * Sets the connection reachability prop
   * @param reach - connection reachability.
   *     - iOS: [none, wifi, cell, unknown]
   *     - Android: [NONE, BLUETOOTH, DUMMY, ETHERNET, MOBILE, MOBILE_DUN, MOBILE_HIPRI, MOBILE_MMS, MOBILE_SUPL, VPN, WIFI, WIMAX, UNKNOWN]
   * @private
   */
  _setReach = (reach) => {
    this._reach = reach.toUpperCase();
    this._setIsConnected(reach.toUpperCase());
  }
  /**
   * Sets the isConnected prop depending on the connection reachability's value
   * @param reach
   * @private
   */
  _setIsConnected = (reach) => {
    this._isConnected = (reach !== 'NONE' && reach !== 'UNKNOWN');
  }
  /**
   * Sets the isConnectionExpensive prop
   * @returns {Promise.<void>}
   * @private
   */
  _setIsConnectionExpensive = async () => {
    try {
      this._isConnectionExpensive = await NetInfo.isConnectionExpensive();
    } catch (err) {
      // err means that isConnectionExpensive is not supported
      this._isConnectionExpensive = null;
    }
  }
  /**
   * Fetches and sets the connection reachability and the isConnected props
   * @returns {Promise.<void>}
   * @private
   */
  _init = async () => {
    this._setReach(await NetInfo.fetch());
    this._updateState();
  }

  /**
   * Adds listeners for when connection reachability and app state changes to update props
   * @private
   */
  _addListeners() {
    NetInfo.addEventListener('change', (reach) => {
      this._setReach(reach);
      this._updateState();
    });
    AppState.addEventListener('change', this._init);
  }

  /**
   * Executes the given callback to update redux's store with the new internal props
   * @returns {Promise.<void>}
   * @private
   */
  _updateState = async () => {
    await this._setIsConnectionExpensive();
    this._callback({
      online: this._isConnected,
      netInfo: {
        isConnectionExpensive: this._isConnectionExpensive,
        reach: this._reach
      }
    });
  }
}

export default callback => new DetectNetwork(callback);
