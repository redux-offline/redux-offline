'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint no-underscore-dangle: 0 */


var _reactNative = require('react-native');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// eslint-disable-line

var DetectNetwork = function () {
  function DetectNetwork(callback) {
    var _this = this;

    _classCallCheck(this, DetectNetwork);

    Object.defineProperty(this, '_hasChanged', {
      enumerable: true,
      writable: true,
      value: function value(reach) {
        if (_this._reach !== reach) {
          return true;
        }
        if (_this._isConnected !== _this._getConnection(reach)) {
          return true;
        }
        return false;
      }
    });
    Object.defineProperty(this, '_setReach', {
      enumerable: true,
      writable: true,
      value: function value(reach) {
        _this._reach = reach;
        _this._isConnected = _this._getConnection(reach);
      }
    });
    Object.defineProperty(this, '_getConnection', {
      enumerable: true,
      writable: true,
      value: function value(reach) {
        return reach !== 'NONE' && reach !== 'UNKNOWN';
      }
    });
    Object.defineProperty(this, '_setIsConnectionExpensive', {
      enumerable: true,
      writable: true,
      value: function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return _reactNative.NetInfo.isConnectionExpensive();

                case 3:
                  _this._isConnectionExpensive = _context.sent;
                  _context.next = 9;
                  break;

                case 6:
                  _context.prev = 6;
                  _context.t0 = _context['catch'](0);

                  // err means that isConnectionExpensive is not supported in iOS
                  _this._isConnectionExpensive = null;

                case 9:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this, [[0, 6]]);
        }));

        return function value() {
          return _ref.apply(this, arguments);
        };
      }()
    });
    Object.defineProperty(this, '_init', {
      enumerable: true,
      writable: true,
      value: function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var reach;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return _reactNative.NetInfo.fetch();

                case 2:
                  reach = _context2.sent;

                  _this._update(reach);

                case 4:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this);
        }));

        return function value() {
          return _ref2.apply(this, arguments);
        };
      }()
    });
    Object.defineProperty(this, '_update', {
      enumerable: true,
      writable: true,
      value: function value(reach) {
        var normalizedReach = reach.toUpperCase();
        if (_this._hasChanged(normalizedReach)) {
          _this._setReach(normalizedReach);
          _this._dispatch();
        }
      }
    });
    Object.defineProperty(this, '_dispatch', {
      enumerable: true,
      writable: true,
      value: function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return _this._setIsConnectionExpensive();

                case 2:
                  _this._callback({
                    online: _this._isConnected,
                    netInfo: {
                      isConnectionExpensive: _this._isConnectionExpensive,
                      reach: _this._reach
                    }
                  });

                case 3:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this);
        }));

        return function value() {
          return _ref3.apply(this, arguments);
        };
      }()
    });

    this._reach = null;
    this._isConnected = null;
    this._isConnectionExpensive = null;
    this._callback = callback;

    this._init();
    this._addListeners();
  }

  /**
   * Check props for changes
   * @param {string} reach - connection reachability.
   *     - iOS: [none, wifi, cell, unknown]
   *     - Android: [NONE, BLUETOOTH, DUMMY, ETHERNET, MOBILE, MOBILE_DUN, MOBILE_HIPRI,
   *                MOBILE_MMS, MOBILE_SUPL, VPN, WIFI, WIMAX, UNKNOWN]
   * @returns {boolean} - Whether the connection reachability or the connection props have changed
   * @private
   */

  /**
   * Sets the connection reachability prop
   * @param {string} reach - connection reachability.
   *     - iOS: [none, wifi, cell, unknown]
   *     - Android: [NONE, BLUETOOTH, DUMMY, ETHERNET, MOBILE, MOBILE_DUN, MOBILE_HIPRI,
   *                MOBILE_MMS, MOBILE_SUPL, VPN, WIFI, WIMAX, UNKNOWN]
   * @returns {void}
   * @private
   */

  /**
   * Gets the isConnected prop depending on the connection reachability's value
   * @param {string} reach - connection reachability.
   *     - iOS: [none, wifi, cell, unknown]
   *     - Android: [NONE, BLUETOOTH, DUMMY, ETHERNET, MOBILE, MOBILE_DUN, MOBILE_HIPRI,
   *                MOBILE_MMS, MOBILE_SUPL, VPN, WIFI, WIMAX, UNKNOWN]
   * @returns {void}
   * @private
   */

  /**
   * Sets the isConnectionExpensive prop
   * @returns {Promise.<void>} Resolves to true if connection is expensive,
   * false if not, and null if not supported.
   * @private
   */

  /**
   * Fetches and sets the connection reachability and the isConnected props
   * @returns {Promise.<void>} Resolves when the props have been
   * initialized and update.
   * @private
   */

  /**
   * Check changes on props and store and dispatch if neccesary
   * @param {string} reach - connection reachability.
   *     - iOS: [none, wifi, cell, unknown]
   *     - Android: [NONE, BLUETOOTH, DUMMY, ETHERNET, MOBILE, MOBILE_DUN, MOBILE_HIPRI,
   *                MOBILE_MMS, MOBILE_SUPL, VPN, WIFI, WIMAX, UNKNOWN]
   * @returns {void}
   * @private
   */


  _createClass(DetectNetwork, [{
    key: '_addListeners',


    /**
     * Adds listeners for when connection reachability and app state changes to update props
     * @returns {void}
     * @private
     */
    value: function _addListeners() {
      var _this2 = this;

      _reactNative.NetInfo.addEventListener('change', function (reach) {
        _this2._update(reach);
      });
      _reactNative.AppState.addEventListener('change', this._init);
    }

    /**
     * Executes the given callback to update redux's store with the new internal props
     * @returns {Promise.<void>} Resolves after fetching the isConnectionExpensive
     * and dispatches actions
     * @private
     */

  }]);

  return DetectNetwork;
}();

exports.default = function (callback) {
  return new DetectNetwork(callback);
};