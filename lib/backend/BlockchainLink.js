"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.initBlockchain = exports.setCustomBackend = exports.find = exports.remove = exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _utxoLib = require("@trezor/utxo-lib");

var _blockchainLink = _interopRequireDefault(require("@trezor/blockchain-link"));

var _builder = require("../message/builder");

var BLOCKCHAIN = _interopRequireWildcard(require("../constants/blockchain"));

var _workers = require("../env/node/workers");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

_utxoLib.Transaction.USE_STRING_VALUES = true;

var getWorker = function getWorker(type) {
  switch (type) {
    case 'blockbook':
      return _workers.BlockbookWorker;

    case 'ripple':
      return _workers.RippleWorker;

    default:
      return null;
  }
};

var Blockchain = /*#__PURE__*/function () {
  function Blockchain(options) {
    (0, _defineProperty2["default"])(this, "feeForBlock", []);
    (0, _defineProperty2["default"])(this, "feeTimestamp", 0);
    this.coinInfo = options.coinInfo;
    this.postMessage = options.postMessage;
    var settings = options.coinInfo.blockchainLink;

    if (!settings) {
      throw new Error('BlockchainLink settings not found in coins.json');
    }

    var worker = getWorker(settings.type);

    if (!worker) {
      throw new Error("BlockchainLink worker not found " + settings.type);
    }

    this.link = new _blockchainLink["default"]({
      name: this.coinInfo.shortcut,
      worker: worker,
      server: settings.url,
      debug: false
    });
  }

  var _proto = Blockchain.prototype;

  _proto.onError = function onError(error) {
    this.link.removeAllListeners();
    this.postMessage((0, _builder.BlockchainMessage)(BLOCKCHAIN.ERROR, {
      coin: this.coinInfo,
      error: error
    }));
    remove(this); // eslint-disable-line no-use-before-define
  };

  _proto.init = /*#__PURE__*/function () {
    var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _this = this;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.link.on('connected', /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                var info;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return _this.link.getInfo();

                      case 2:
                        info = _context.sent;

                        _this.postMessage((0, _builder.BlockchainMessage)(BLOCKCHAIN.CONNECT, _objectSpread({
                          coin: _this.coinInfo
                        }, info)));

                      case 4:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              })));
              this.link.on('disconnected', function () {
                _this.onError('Disconnected');
              });
              this.link.on('error', function (error) {
                _this.onError(error.message);
              });
              _context2.prev = 3;
              _context2.next = 6;
              return this.link.connect();

            case 6:
              _context2.next = 12;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](3);
              this.onError(_context2.t0.message);
              throw _context2.t0;

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[3, 8]]);
    }));

    function init() {
      return _init.apply(this, arguments);
    }

    return init;
  }();

  _proto.loadTransaction = /*#__PURE__*/function () {
    var _loadTransaction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(id) {
      var transaction;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.link.getTransaction(id);

            case 2:
              transaction = _context3.sent;
              return _context3.abrupt("return", _utxoLib.Transaction.fromHex(transaction.tx.hex, this.coinInfo.network));

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function loadTransaction(_x) {
      return _loadTransaction.apply(this, arguments);
    }

    return loadTransaction;
  }();

  _proto.getTransactions = /*#__PURE__*/function () {
    var _getTransactions = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(txs) {
      var _this2 = this;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", Promise.all(txs.map(function (id) {
                return _this2.link.getTransaction(id);
              })));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function getTransactions(_x2) {
      return _getTransactions.apply(this, arguments);
    }

    return getTransactions;
  }();

  _proto.getReferencedTransactions = /*#__PURE__*/function () {
    var _getReferencedTransactions = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(txs) {
      var _this3 = this;

      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", Promise.all(txs.map(function (id) {
                return _this3.loadTransaction(id);
              })));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    function getReferencedTransactions(_x3) {
      return _getReferencedTransactions.apply(this, arguments);
    }

    return getReferencedTransactions;
  }();

  _proto.getCurrentFiatRates = /*#__PURE__*/function () {
    var _getCurrentFiatRates = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(params) {
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", this.link.getCurrentFiatRates(params));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function getCurrentFiatRates(_x4) {
      return _getCurrentFiatRates.apply(this, arguments);
    }

    return getCurrentFiatRates;
  }();

  _proto.getFiatRatesForTimestamps = /*#__PURE__*/function () {
    var _getFiatRatesForTimestamps = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(params) {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", this.link.getFiatRatesForTimestamps(params));

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function getFiatRatesForTimestamps(_x5) {
      return _getFiatRatesForTimestamps.apply(this, arguments);
    }

    return getFiatRatesForTimestamps;
  }();

  _proto.getAccountBalanceHistory = /*#__PURE__*/function () {
    var _getAccountBalanceHistory = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(params) {
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", this.link.getAccountBalanceHistory(params));

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function getAccountBalanceHistory(_x6) {
      return _getAccountBalanceHistory.apply(this, arguments);
    }

    return getAccountBalanceHistory;
  }();

  _proto.getNetworkInfo = /*#__PURE__*/function () {
    var _getNetworkInfo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", this.link.getInfo());

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function getNetworkInfo() {
      return _getNetworkInfo.apply(this, arguments);
    }

    return getNetworkInfo;
  }();

  _proto.getAccountInfo = /*#__PURE__*/function () {
    var _getAccountInfo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(request) {
      return _regenerator["default"].wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", this.link.getAccountInfo(request));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function getAccountInfo(_x7) {
      return _getAccountInfo.apply(this, arguments);
    }

    return getAccountInfo;
  }();

  _proto.getAccountUtxo = /*#__PURE__*/function () {
    var _getAccountUtxo = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(descriptor) {
      return _regenerator["default"].wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              return _context11.abrupt("return", this.link.getAccountUtxo(descriptor));

            case 1:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function getAccountUtxo(_x8) {
      return _getAccountUtxo.apply(this, arguments);
    }

    return getAccountUtxo;
  }();

  _proto.estimateFee = /*#__PURE__*/function () {
    var _estimateFee = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(request) {
      var _this4 = this;

      var blocks, now, outdated, unknownBlocks, fees;
      return _regenerator["default"].wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              blocks = request.blocks;

              if (!blocks) {
                _context12.next = 11;
                break;
              }

              now = Date.now();
              outdated = now - this.feeTimestamp > 20 * 60 * 1000;
              unknownBlocks = blocks.filter(function (b) {
                return typeof _this4.feeForBlock !== 'string';
              });

              if (!outdated && unknownBlocks.length < 1) {} // return cached
              // get new values


              _context12.next = 8;
              return this.link.estimateFee(request);

            case 8:
              fees = _context12.sent;
              // cache blocks for future use
              blocks.forEach(function (block, index) {
                _this4.feeForBlock[block] = fees[index];
              });
              this.feeTimestamp = now;

            case 11:
              return _context12.abrupt("return", this.link.estimateFee(request));

            case 12:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    }));

    function estimateFee(_x9) {
      return _estimateFee.apply(this, arguments);
    }

    return estimateFee;
  }();

  _proto.subscribe = /*#__PURE__*/function () {
    var _subscribe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(accounts) {
      var _this5 = this;

      return _regenerator["default"].wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              // set block listener if it wasn't set before
              if (this.link.listenerCount('block') === 0) {
                this.link.on('block', function (block) {
                  _this5.postMessage((0, _builder.BlockchainMessage)(BLOCKCHAIN.BLOCK, _objectSpread({
                    coin: _this5.coinInfo
                  }, block)));
                });
              } // set notification listener if it wasn't set before


              if (this.link.listenerCount('notification') === 0) {
                this.link.on('notification', function (notification) {
                  _this5.postMessage((0, _builder.BlockchainMessage)(BLOCKCHAIN.NOTIFICATION, {
                    coin: _this5.coinInfo,
                    notification: notification
                  }));
                });
              }

              _context13.next = 4;
              return this.link.subscribe({
                type: 'block'
              });

            case 4:
              return _context13.abrupt("return", this.link.subscribe({
                type: 'accounts',
                accounts: accounts
              }));

            case 5:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    }));

    function subscribe(_x10) {
      return _subscribe.apply(this, arguments);
    }

    return subscribe;
  }();

  _proto.subscribeFiatRates = /*#__PURE__*/function () {
    var _subscribeFiatRates = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14(currency) {
      var _this6 = this;

      return _regenerator["default"].wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              // set block listener if it wasn't set before
              if (this.link.listenerCount('fiatRates') === 0) {
                this.link.on('fiatRates', function (res) {
                  _this6.postMessage((0, _builder.BlockchainMessage)(BLOCKCHAIN.FIAT_RATES_UPDATE, {
                    coin: _this6.coinInfo,
                    rates: res.rates
                  }));
                });
              }

              return _context14.abrupt("return", this.link.subscribe({
                type: 'fiatRates'
              }));

            case 2:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, this);
    }));

    function subscribeFiatRates(_x11) {
      return _subscribeFiatRates.apply(this, arguments);
    }

    return subscribeFiatRates;
  }();

  _proto.unsubscribe = /*#__PURE__*/function () {
    var _unsubscribe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee15(accounts) {
      return _regenerator["default"].wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              if (accounts) {
                _context15.next = 9;
                break;
              }

              this.link.removeAllListeners('block');
              this.link.removeAllListeners('fiatRates');
              this.link.removeAllListeners('notification'); // remove all subscriptions

              _context15.next = 6;
              return this.link.unsubscribe({
                type: 'block'
              });

            case 6:
              _context15.next = 8;
              return this.link.unsubscribe({
                type: 'fiatRates'
              });

            case 8:
              return _context15.abrupt("return", this.link.unsubscribe({
                type: 'notification'
              }));

            case 9:
              return _context15.abrupt("return", this.link.unsubscribe({
                type: 'accounts',
                accounts: accounts
              }));

            case 10:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15, this);
    }));

    function unsubscribe(_x12) {
      return _unsubscribe.apply(this, arguments);
    }

    return unsubscribe;
  }();

  _proto.unsubscribeFiatRates = /*#__PURE__*/function () {
    var _unsubscribeFiatRates = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee16() {
      return _regenerator["default"].wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              this.link.removeAllListeners('fiatRates');
              return _context16.abrupt("return", this.link.unsubscribe({
                type: 'fiatRates'
              }));

            case 2:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16, this);
    }));

    function unsubscribeFiatRates() {
      return _unsubscribeFiatRates.apply(this, arguments);
    }

    return unsubscribeFiatRates;
  }();

  _proto.pushTransaction = /*#__PURE__*/function () {
    var _pushTransaction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee17(tx) {
      return _regenerator["default"].wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return this.link.pushTransaction(tx);

            case 2:
              return _context17.abrupt("return", _context17.sent);

            case 3:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17, this);
    }));

    function pushTransaction(_x13) {
      return _pushTransaction.apply(this, arguments);
    }

    return pushTransaction;
  }();

  _proto.disconnect = /*#__PURE__*/function () {
    var _disconnect = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee18() {
      return _regenerator["default"].wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              this.link.removeAllListeners();
              this.link.disconnect();
              this.onError('Disconnected');

            case 3:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18, this);
    }));

    function disconnect() {
      return _disconnect.apply(this, arguments);
    }

    return disconnect;
  }();

  return Blockchain;
}();

exports["default"] = Blockchain;
var instances = [];
var customBackends = {};

var remove = function remove(backend) {
  var index = instances.indexOf(backend);

  if (index >= 0) {
    instances.splice(index, 1);
  }
};

exports.remove = remove;

var find = function find(name) {
  for (var i = 0; i < instances.length; i++) {
    if (instances[i].coinInfo.name === name) {
      return instances[i];
    }
  }

  return null;
};

exports.find = find;

var setCustomBackend = function setCustomBackend(coinInfo, blockchainLink) {
  if (!blockchainLink) {
    delete customBackends[coinInfo.shortcut];
  } else {
    customBackends[coinInfo.shortcut] = coinInfo;
    customBackends[coinInfo.shortcut].blockchainLink = blockchainLink;
  }
};

exports.setCustomBackend = setCustomBackend;

var initBlockchain = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee19(coinInfo, postMessage) {
    var backend;
    return _regenerator["default"].wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            backend = find(coinInfo.name);

            if (backend) {
              _context19.next = 13;
              break;
            }

            backend = new Blockchain({
              coinInfo: customBackends[coinInfo.shortcut] || coinInfo,
              postMessage: postMessage
            });
            _context19.prev = 3;
            _context19.next = 6;
            return backend.init();

          case 6:
            _context19.next = 12;
            break;

          case 8:
            _context19.prev = 8;
            _context19.t0 = _context19["catch"](3);
            remove(backend);
            throw _context19.t0;

          case 12:
            instances.push(backend);

          case 13:
            return _context19.abrupt("return", backend);

          case 14:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, null, [[3, 8]]);
  }));

  return function initBlockchain(_x14, _x15) {
    return _ref2.apply(this, arguments);
  };
}();

exports.initBlockchain = initBlockchain;