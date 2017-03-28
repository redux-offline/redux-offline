'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var networkStatusChanged = exports.networkStatusChanged = function networkStatusChanged(online) {
  return {
    type: 'Offline/STATUS_CHANGED',
    payload: {
      online: online
    }
  };
};