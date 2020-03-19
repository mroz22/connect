"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.RippleWorker = exports.BlockbookWorker = exports.ReactNativeUsbPlugin = exports.WebUsbPlugin = void 0;

var _tinyWorker = _interopRequireDefault(require("tiny-worker"));

var WebUsbPlugin = undefined;
exports.WebUsbPlugin = WebUsbPlugin;
var ReactNativeUsbPlugin = undefined;
exports.ReactNativeUsbPlugin = ReactNativeUsbPlugin;

var BlockbookWorker = function BlockbookWorker() {
  return new _tinyWorker["default"](function () {
    // $FlowIssue
    require('@trezor/blockchain-link/build/node/blockbook-worker');
  });
};

exports.BlockbookWorker = BlockbookWorker;

var RippleWorker = function RippleWorker() {
  return new _tinyWorker["default"](function () {
    // $FlowIssue
    require('@trezor/blockchain-link/build/node/ripple-worker');
  });
};

exports.RippleWorker = RippleWorker;