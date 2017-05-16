'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*global window*/

var handle = function handle(callback, result) {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(function () {
      return callback(result);
    });
  } else {
    setTimeout(function () {
      return callback(result);
    }, 0);
  }
};

exports.default = function (callback) {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', function () {
      return handle(callback, true);
    });
    window.addEventListener('offline', function () {
      return handle(callback, false);
    });
    handle(callback, window.navigator.onLine);
  }
};