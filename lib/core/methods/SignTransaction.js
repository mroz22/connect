"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _errors = require("../../constants/errors");

var _BlockchainLink = require("../../backend/BlockchainLink");

var _signtx = _interopRequireDefault(require("./helpers/signtx"));

var _signtxVerify = _interopRequireDefault(require("./helpers/signtxVerify"));

var _tx = require("./tx");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SignTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(SignTransaction, _AbstractMethod);

  function SignTransaction(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    _this.requiredPermissions = ['read', 'write'];
    _this.info = 'Sign transaction';
    var payload = message.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'coin',
      type: 'string',
      obligatory: true
    }, {
      name: 'inputs',
      type: 'array',
      obligatory: true
    }, {
      name: 'outputs',
      type: 'array',
      obligatory: true
    }, {
      name: 'refTxs',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'locktime',
      type: 'number'
    }, {
      name: 'timestamp',
      type: 'number'
    }, {
      name: 'version',
      type: 'number'
    }, {
      name: 'expiry',
      type: 'number'
    }, {
      name: 'overwintered',
      type: 'boolean'
    }, {
      name: 'versionGroupId',
      type: 'number'
    }, {
      name: 'branchId',
      type: 'number'
    }, {
      name: 'push',
      type: 'boolean'
    }]);
    var coinInfo = (0, _CoinInfo.getBitcoinNetwork)(payload.coin);

    if (!coinInfo) {
      throw _errors.NO_COIN_INFO;
    } else {
      // set required firmware from coinInfo support
      _this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this.name, coinInfo, _this.firmwareRange);
      _this.info = (0, _pathUtils.getLabel)('Sign #NETWORK transaction', coinInfo);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'refTxs')) {
      payload.refTxs.forEach(function (tx) {
        (0, _paramsValidator.validateParams)(tx, [{
          name: 'hash',
          type: 'string',
          obligatory: true
        }, {
          name: 'inputs',
          type: 'array',
          obligatory: true
        }, {
          name: 'bin_outputs',
          type: 'array',
          obligatory: true
        }, {
          name: 'version',
          type: 'number',
          obligatory: true
        }, {
          name: 'lock_time',
          type: 'number',
          obligatory: true
        }, {
          name: 'extra_data',
          type: 'string'
        }, {
          name: 'timestamp',
          type: 'number'
        }, {
          name: 'version_group_id',
          type: 'number'
        }]);
      });
    }

    var inputs = (0, _tx.validateTrezorInputs)(payload.inputs, coinInfo);
    var outputs = (0, _tx.validateTrezorOutputs)(payload.outputs, coinInfo);
    var outputsWithAmount = outputs.filter(function (output) {
      return typeof output.amount === 'string' && !Object.prototype.hasOwnProperty.call(output, 'op_return_data');
    });

    if (outputsWithAmount.length > 0) {
      var total = outputsWithAmount.reduce(function (bn, output) {
        return bn.plus(typeof output.amount === 'string' ? output.amount : '0');
      }, new _bignumber["default"](0));

      if (total.lte(coinInfo.dustLimit)) {
        throw new Error('Total amount is below dust limit.');
      }
    }

    _this.params = {
      inputs: inputs,
      outputs: payload.outputs,
      refTxs: payload.refTxs,
      options: {
        lock_time: payload.locktime,
        timestamp: payload.timestamp,
        version: payload.version,
        expiry: payload.expiry,
        overwintered: payload.overwintered,
        version_group_id: payload.versionGroupId,
        branch_id: payload.branchId
      },
      coinInfo: coinInfo,
      push: typeof payload.push === 'boolean' ? payload.push : false
    };

    if (coinInfo.hasTimestamp && !Object.prototype.hasOwnProperty.call(payload, 'timestamp')) {
      var d = new Date();
      _this.params.options.timestamp = Math.round(d.getTime() / 1000);
    }

    return _this;
  }

  var _proto = SignTransaction.prototype;

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var device, params, refTxs, hdInputs, refTxsIds, blockchain, bjsRefTxs, response, _blockchain, txid;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              device = this.device, params = this.params;
              refTxs = [];

              if (params.refTxs) {
                _context.next = 17;
                break;
              }

              // initialize backend
              hdInputs = params.inputs.map(_tx.inputToHD);
              refTxsIds = (0, _tx.getReferencedTransactions)(hdInputs);

              if (!(refTxsIds.length > 0)) {
                _context.next = 15;
                break;
              }

              if (params.coinInfo.blockchainLink) {
                _context.next = 8;
                break;
              }

              throw (0, _errors.backendNotSupported)(params.coinInfo.name);

            case 8:
              _context.next = 10;
              return (0, _BlockchainLink.initBlockchain)(params.coinInfo, this.postMessage);

            case 10:
              blockchain = _context.sent;
              _context.next = 13;
              return blockchain.getReferencedTransactions(refTxsIds);

            case 13:
              bjsRefTxs = _context.sent;
              refTxs = (0, _tx.transformReferencedTransactions)(bjsRefTxs);

            case 15:
              _context.next = 18;
              break;

            case 17:
              refTxs = params.refTxs;

            case 18:
              _context.next = 20;
              return (0, _signtx["default"])(device.getCommands().typedCall.bind(device.getCommands()), params.inputs, params.outputs, refTxs, params.options, params.coinInfo);

            case 20:
              response = _context.sent;
              _context.next = 23;
              return (0, _signtxVerify["default"])(device.getCommands().getHDNode.bind(device.getCommands()), params.inputs, params.outputs, response.serializedTx, params.coinInfo);

            case 23:
              if (!params.push) {
                _context.next = 33;
                break;
              }

              if (params.coinInfo.blockchainLink) {
                _context.next = 26;
                break;
              }

              throw (0, _errors.backendNotSupported)(params.coinInfo.name);

            case 26:
              _context.next = 28;
              return (0, _BlockchainLink.initBlockchain)(params.coinInfo, this.postMessage);

            case 28:
              _blockchain = _context.sent;
              _context.next = 31;
              return _blockchain.pushTransaction(response.serializedTx);

            case 31:
              txid = _context.sent;
              return _context.abrupt("return", _objectSpread({}, response, {
                txid: txid
              }));

            case 33:
              return _context.abrupt("return", response);

            case 34:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return SignTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = SignTransaction;