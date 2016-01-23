// Utilities for creating global IDs in systems that don't have them.
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _nodeNodeJs = require('./node/node.js');

Object.defineProperty(exports, 'globalIdType', {
  enumerable: true,
  get: function get() {
    return _nodeNodeJs.globalIdType;
  }
});