"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _hdWallet = require("hd-wallet");

var _Fees = _interopRequireDefault(require("./Fees"));

var _BlockchainLink = _interopRequireDefault(require("../../../backend/BlockchainLink"));

var _pathUtils = require("../../../utils/pathUtils");

var TransactionComposer = /*#__PURE__*/function () {
  function TransactionComposer(options) {
    (0, _defineProperty2["default"])(this, "blockHeight", 0);
    (0, _defineProperty2["default"])(this, "composed", {});
    this.account = options.account;
    this.outputs = options.outputs;
    this.coinInfo = options.coinInfo;
    this.blockHeight = 0;
    this.feeLevels = new _Fees["default"](options.coinInfo); // map to hd-wallet/buildTx format

    var addresses = options.account.addresses;
    var allAddresses = !addresses ? [] : addresses.used.concat(addresses.unused).concat(addresses.change).map(function (a) {
      return a.address;
    });
    this.utxos = options.utxo.map(function (u) {
      var addressPath = (0, _pathUtils.getHDPath)(u.path);
      return {
        index: u.vout,
        transactionHash: u.txid,
        value: u.amount,
        addressPath: [addressPath[3], addressPath[4]],
        height: u.blockHeight,
        tsize: 0,
        // doesn't matter
        vsize: 0,
        // doesn't matter
        coinbase: typeof u.coinbase === 'boolean' ? u.coinbase : false,
        // decide it it can be spent immediately (false) or after 100 conf (true)
        own: allAddresses.indexOf(u.address) >= 0 // decide if it can be spent immediately (own) or after 6 conf (not own)

      };
    });
  }

  var _proto = TransactionComposer.prototype;

  _proto.init = /*#__PURE__*/function () {
    var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(blockchain) {
      var _ref, blockHeight;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return blockchain.getNetworkInfo();

            case 2:
              _ref = _context.sent;
              blockHeight = _ref.blockHeight;
              this.blockHeight = blockHeight;
              _context.next = 7;
              return this.feeLevels.load(blockchain);

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function init(_x) {
      return _init.apply(this, arguments);
    }

    return init;
  }() // Composing fee levels for SelectFee view in popup
  ;

  _proto.composeAllFeeLevels = function composeAllFeeLevels() {
    var levels = this.feeLevels.levels;
    if (this.utxos.length < 1) return false;
    this.composed = {};
    var atLeastOneValid = false;

    for (var _iterator = levels, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var level = _ref2;

      if (level.feePerUnit !== '0') {
        var _tx = this.compose(level.feePerUnit);

        if (_tx.type === 'final') {
          atLeastOneValid = true;
        }

        this.composed[level.label] = _tx;
      }
    }

    if (!atLeastOneValid) {
      var lastLevel = levels[levels.length - 1];
      var lastFee = new _bignumber["default"](lastLevel.feePerUnit);

      while (lastFee.gt(this.coinInfo.minFee) && this.composed['custom'] === undefined) {
        lastFee = lastFee.minus(1);
        var tx = this.compose(lastFee.toString());

        if (tx.type === 'final') {
          this.feeLevels.updateCustomFee(tx.feePerByte);
          this.composed['custom'] = tx;
          return true;
        }
      }

      return false;
    }

    return true;
  };

  _proto.composeCustomFee = function composeCustomFee(fee) {
    var tx = this.compose(fee);
    this.composed['custom'] = tx;

    if (tx.type === 'final') {
      this.feeLevels.updateCustomFee(tx.feePerByte);
    } else {
      this.feeLevels.updateCustomFee(fee);
    }
  };

  _proto.getFeeLevelList = function getFeeLevelList() {
    var _this = this;

    var list = [];
    var levels = this.feeLevels.levels;
    levels.forEach(function (level) {
      var tx = _this.composed[level.label];

      if (tx && tx.type === 'final') {
        list.push({
          name: level.label,
          fee: tx.fee,
          feePerByte: level.feePerUnit,
          minutes: level.blocks * _this.coinInfo.blocktime,
          total: tx.totalSpent
        });
      } else {
        list.push({
          name: level.label,
          fee: '0',
          disabled: true
        });
      }
    });
    return list;
  };

  _proto.compose = function compose(feeRate) {
    var account = this.account;
    var addresses = account.addresses;
    if (!addresses) return {
      type: 'error',
      error: 'ADDRESSES-NOT-SET'
    };
    var changeId = addresses.change.findIndex(function (a) {
      return a.transfers < 1;
    });
    if (changeId < 0) return {
      type: 'error',
      error: 'CHANGE-ADDRESS-NOT-SET'
    };
    var changeAddress = addresses.change[changeId].address;
    return (0, _hdWallet.buildTx)({
      utxos: this.utxos,
      outputs: this.outputs,
      height: this.blockHeight,
      feeRate: feeRate,
      segwit: this.coinInfo.segwit,
      inputAmounts: this.coinInfo.segwit || this.coinInfo.forkid !== null,
      basePath: account.address_n,
      network: this.coinInfo.network,
      changeId: changeId,
      changeAddress: changeAddress,
      dustThreshold: this.coinInfo.dustLimit
    });
  };

  _proto.dispose = function dispose() {// TODO
  };

  return TransactionComposer;
}();

exports["default"] = TransactionComposer;