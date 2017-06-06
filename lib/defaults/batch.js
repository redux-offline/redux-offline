'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (outbox) {
  if (outbox.length > 0) {
    return [outbox[0]];
  }
  return [];
};