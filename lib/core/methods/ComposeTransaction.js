"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _Discovery = _interopRequireDefault(require("./helpers/Discovery"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var _promiseUtils = require("../../utils/promiseUtils");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _CoinInfo = require("../../data/CoinInfo");

var _formatUtils = require("../../utils/formatUtils");

var _errors = require("../../constants/errors");

var _BlockchainLink = require("../../backend/BlockchainLink");

var _TransactionComposer = _interopRequireDefault(require("./tx/TransactionComposer"));

var _tx = require("./tx");

var _signtx = _interopRequireDefault(require("./helpers/signtx"));

var _signtxVerify = _interopRequireDefault(require("./helpers/signtxVerify"));

var _builder = require("../../message/builder");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ComposeTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(ComposeTransaction, _AbstractMethod);

  function ComposeTransaction(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    _this.requiredPermissions = ['read', 'write'];
    var payload = message.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'outputs',
      type: 'array',
      obligatory: true,
      allowEmpty: true
    }, {
      name: 'coin',
      type: 'string',
      obligatory: true
    }, {
      name: 'push',
      type: 'boolean'
    }, {
      name: 'account',
      type: 'object'
    }, {
      name: 'feeLevels',
      type: 'array'
    }]);
    var coinInfo = (0, _CoinInfo.getBitcoinNetwork)(payload.coin);

    if (!coinInfo) {
      throw _errors.NO_COIN_INFO;
    }

    if (!coinInfo.blockchainLink) {
      throw (0, _errors.backendNotSupported)(coinInfo.name);
    } // set required firmware from coinInfo support


    _this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this.name, coinInfo, _this.firmwareRange); // validate each output and transform into hd-wallet format

    var outputs = [];
    var total = new _bignumber["default"](0);
    payload.outputs.forEach(function (out) {
      var output = (0, _tx.validateHDOutput)(out, coinInfo);

      if (typeof output.amount === 'string') {
        total = total.plus(output.amount);
      }

      outputs.push(output);
    });
    var sendMax = outputs.find(function (o) {
      return o.type === 'send-max';
    }) !== undefined; // there should be only one output when using send-max option

    if (sendMax && outputs.length > 1) {
      throw new Error('Only one output allowed when using "send-max" option.');
    } // if outputs contains regular items
    // check if total amount is not lower than dust limit
    // if (outputs.find(o => o.type === 'complete') !== undefined && total.lte(coinInfo.dustLimit)) {
    //     throw new Error('Total amount is too low. ');
    // }


    if (sendMax) {
      _this.info = 'Send maximum amount';
    } else {
      _this.info = "Send " + (0, _formatUtils.formatAmount)(total.toString(), coinInfo);
    }

    _this.useDevice = _this.useUi = !payload.account && !payload.feeLevels;
    _this.params = {
      outputs: outputs,
      coinInfo: coinInfo,
      account: payload.account,
      feeLevels: payload.feeLevels,
      push: typeof payload.push === 'boolean' ? payload.push : false
    };
    return _this;
  }

  var _proto = ComposeTransaction.prototype;

  _proto.precompose = /*#__PURE__*/function () {
    var _precompose = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(account, feeLevels) {
      var _this$params, coinInfo, outputs, composer, blockchain;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this$params = this.params, coinInfo = _this$params.coinInfo, outputs = _this$params.outputs;
              composer = new _TransactionComposer["default"]({
                account: {
                  type: 'normal',
                  label: 'normal',
                  descriptor: 'normal',
                  address_n: (0, _pathUtils.validatePath)(account.path),
                  addresses: account.addresses
                },
                utxo: account.utxo,
                coinInfo: coinInfo,
                outputs: outputs
              }); // This is mandatory, hd-wallet expects current block height
              // TODO: make it possible without it (offline composing)

              _context.next = 4;
              return (0, _BlockchainLink.initBlockchain)(this.params.coinInfo, this.postMessage);

            case 4:
              blockchain = _context.sent;
              _context.next = 7;
              return composer.init(blockchain);

            case 7:
              return _context.abrupt("return", feeLevels.map(function (level) {
                composer.composeCustomFee(level.feePerUnit);
                var tx = composer.composed.custom;

                if (tx.type === 'final') {
                  var inputs = tx.transaction.inputs.map(function (inp) {
                    return (0, _tx.inputToTrezor)(inp, 0);
                  });

                  var _outputs = tx.transaction.outputs.sorted.map(function (out) {
                    return (0, _tx.outputToTrezor)(out, coinInfo);
                  });

                  return {
                    type: 'final',
                    max: tx.max,
                    totalSpent: tx.totalSpent,
                    fee: tx.fee,
                    feePerByte: tx.feePerByte,
                    bytes: tx.bytes,
                    transaction: {
                      inputs: inputs,
                      outputs: _outputs
                    }
                  };
                }

                return tx;
              }));

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function precompose(_x, _x2) {
      return _precompose.apply(this, arguments);
    }

    return precompose;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _ref, account, utxo, response;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(this.params.account && this.params.feeLevels)) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", this.precompose(this.params.account, this.params.feeLevels));

            case 2:
              _context2.next = 4;
              return this.selectAccount();

            case 4:
              _ref = _context2.sent;
              account = _ref.account;
              utxo = _ref.utxo;
              _context2.next = 9;
              return this.selectFee(account, utxo);

            case 9:
              response = _context2.sent;

              if (this.discovery) {
                _context2.next = 12;
                break;
              }

              throw new Error('ComposeTransaction selectFee response received after dispose');

            case 12:
              if (!(typeof response === 'string')) {
                _context2.next = 16;
                break;
              }

              return _context2.abrupt("return", this.run());

            case 16:
              return _context2.abrupt("return", response);

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  _proto.selectAccount = /*#__PURE__*/function () {
    var _selectAccount = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var _this2 = this;

      var coinInfo, blockchain, dfd, _discovery, _uiResp, _account, _utxo, discovery, uiResp, account, utxo;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              coinInfo = this.params.coinInfo;
              _context3.next = 3;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 3:
              blockchain = _context3.sent;
              dfd = this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device);

              if (!(this.discovery && this.discovery.completed)) {
                _context3.next = 16;
                break;
              }

              _discovery = this.discovery;
              this.postMessage((0, _builder.UiMessage)(UI.SELECT_ACCOUNT, {
                type: 'end',
                coinInfo: coinInfo,
                accountTypes: _discovery.types.map(function (t) {
                  return t.type;
                }),
                accounts: _discovery.accounts
              }));
              _context3.next = 10;
              return dfd.promise;

            case 10:
              _uiResp = _context3.sent;
              _account = _discovery.accounts[_uiResp.payload];
              _context3.next = 14;
              return blockchain.getAccountUtxo(_account.descriptor);

            case 14:
              _utxo = _context3.sent;
              return _context3.abrupt("return", {
                account: _account,
                utxo: _utxo
              });

            case 16:
              // initialize backend
              discovery = this.discovery || new _Discovery["default"]({
                blockchain: blockchain,
                commands: this.device.getCommands()
              });
              this.discovery = discovery;
              discovery.on('progress', function (accounts) {
                _this2.postMessage((0, _builder.UiMessage)(UI.SELECT_ACCOUNT, {
                  type: 'progress',
                  // preventEmpty: true,
                  coinInfo: coinInfo,
                  accounts: accounts
                }));
              });
              discovery.on('complete', function () {
                _this2.postMessage((0, _builder.UiMessage)(UI.SELECT_ACCOUNT, {
                  type: 'end',
                  coinInfo: coinInfo
                }));
              }); // get accounts with addresses (tokens)

              discovery.start('tokens')["catch"](function (error) {
                // catch error from discovery process
                dfd.reject(error);
              }); // set select account view
              // this view will be updated from discovery events

              this.postMessage((0, _builder.UiMessage)(UI.SELECT_ACCOUNT, {
                type: 'start',
                accountTypes: discovery.types.map(function (t) {
                  return t.type;
                }),
                coinInfo: coinInfo
              })); // wait for user action

              _context3.next = 24;
              return dfd.promise;

            case 24:
              uiResp = _context3.sent;
              discovery.removeAllListeners();
              discovery.stop();

              if (discovery.completed) {
                _context3.next = 30;
                break;
              }

              _context3.next = 30;
              return (0, _promiseUtils.resolveAfter)(501);

            case 30:
              account = discovery.accounts[uiResp.payload];
              this.params.coinInfo = (0, _CoinInfo.fixCoinInfoNetwork)(this.params.coinInfo, account.address_n);
              _context3.next = 34;
              return blockchain.getAccountUtxo(account.descriptor);

            case 34:
              utxo = _context3.sent;
              return _context3.abrupt("return", {
                account: account,
                utxo: utxo
              });

            case 36:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function selectAccount() {
      return _selectAccount.apply(this, arguments);
    }

    return selectAccount;
  }();

  _proto.selectFee = /*#__PURE__*/function () {
    var _selectFee = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(account, utxo) {
      var _this$params2, coinInfo, outputs, blockchain, composer, hasFunds;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _this$params2 = this.params, coinInfo = _this$params2.coinInfo, outputs = _this$params2.outputs; // get backend instance (it should be initialized before)

              _context4.next = 3;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 3:
              blockchain = _context4.sent;
              composer = new _TransactionComposer["default"]({
                account: account,
                utxo: utxo,
                coinInfo: coinInfo,
                outputs: outputs
              });
              _context4.next = 7;
              return composer.init(blockchain);

            case 7:
              // try to compose multiple transactions with different fee levels
              // check if any of composed transactions is valid
              hasFunds = composer.composeAllFeeLevels();

              if (hasFunds) {
                _context4.next = 13;
                break;
              }

              // show error view
              this.postMessage((0, _builder.UiMessage)(UI.INSUFFICIENT_FUNDS)); // wait few seconds...

              _context4.next = 12;
              return (0, _promiseUtils.resolveAfter)(2000, null);

            case 12:
              return _context4.abrupt("return", 'change-account');

            case 13:
              // set select account view
              // this view will be updated from discovery events
              this.postMessage((0, _builder.UiMessage)(UI.SELECT_FEE, {
                feeLevels: composer.getFeeLevelList(),
                coinInfo: this.params.coinInfo
              })); // wait for user action

              _context4.next = 16;
              return this._selectFeeUiResponse(composer);

            case 16:
              return _context4.abrupt("return", _context4.sent);

            case 17:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function selectFee(_x3, _x4) {
      return _selectFee.apply(this, arguments);
    }

    return selectFee;
  }();

  _proto._selectFeeUiResponse = /*#__PURE__*/function () {
    var _selectFeeUiResponse2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(composer) {
      var resp;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.createUiPromise(UI.RECEIVE_FEE, this.device).promise;

            case 2:
              resp = _context5.sent;
              _context5.t0 = resp.payload.type;
              _context5.next = _context5.t0 === 'compose-custom' ? 6 : _context5.t0 === 'send' ? 11 : 14;
              break;

            case 6:
              // recompose custom fee level with requested value
              composer.composeCustomFee(resp.payload.value);
              this.postMessage((0, _builder.UiMessage)(UI.UPDATE_CUSTOM_FEE, {
                feeLevels: composer.getFeeLevelList(),
                coinInfo: this.params.coinInfo
              })); // wait for user action

              _context5.next = 10;
              return this._selectFeeUiResponse(composer);

            case 10:
              return _context5.abrupt("return", _context5.sent);

            case 11:
              _context5.next = 13;
              return this._sign(composer.composed[resp.payload.value]);

            case 13:
              return _context5.abrupt("return", _context5.sent);

            case 14:
              return _context5.abrupt("return", 'change-account');

            case 15:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function _selectFeeUiResponse(_x5) {
      return _selectFeeUiResponse2.apply(this, arguments);
    }

    return _selectFeeUiResponse;
  }();

  _proto._sign = /*#__PURE__*/function () {
    var _sign2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(tx) {
      var coinInfo, refTxs, refTxsIds, blockchain, bjsRefTxs, timestamp, inputs, outputs, response, _blockchain, txid;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (!(tx.type !== 'final')) {
                _context6.next = 2;
                break;
              }

              throw new Error('Trying to sign unfinished tx');

            case 2:
              coinInfo = this.params.coinInfo;
              refTxs = [];
              refTxsIds = (0, _tx.getReferencedTransactions)(tx.transaction.inputs);

              if (!(refTxsIds.length > 0)) {
                _context6.next = 13;
                break;
              }

              _context6.next = 8;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 8:
              blockchain = _context6.sent;
              _context6.next = 11;
              return blockchain.getReferencedTransactions(refTxsIds);

            case 11:
              bjsRefTxs = _context6.sent;
              refTxs = (0, _tx.transformReferencedTransactions)(bjsRefTxs);

            case 13:
              timestamp = coinInfo.hasTimestamp ? Math.round(new Date().getTime() / 1000) : undefined; // const inputs = tx.transaction.inputs.map(inp => inputToTrezor(inp, (0xffffffff - 2))); // TODO: RBF

              inputs = tx.transaction.inputs.map(function (inp) {
                return (0, _tx.inputToTrezor)(inp, 0);
              });
              outputs = tx.transaction.outputs.sorted.map(function (out) {
                return (0, _tx.outputToTrezor)(out, coinInfo);
              });
              _context6.next = 18;
              return (0, _signtx["default"])(this.device.getCommands().typedCall.bind(this.device.getCommands()), inputs, outputs, refTxs, {
                timestamp: timestamp
              }, coinInfo);

            case 18:
              response = _context6.sent;
              _context6.next = 21;
              return (0, _signtxVerify["default"])(this.device.getCommands().getHDNode.bind(this.device.getCommands()), inputs, outputs, response.serializedTx, coinInfo);

            case 21:
              if (!this.params.push) {
                _context6.next = 29;
                break;
              }

              _context6.next = 24;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 24:
              _blockchain = _context6.sent;
              _context6.next = 27;
              return _blockchain.pushTransaction(response.serializedTx);

            case 27:
              txid = _context6.sent;
              return _context6.abrupt("return", _objectSpread({}, response, {
                txid: txid
              }));

            case 29:
              return _context6.abrupt("return", response);

            case 30:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function _sign(_x6) {
      return _sign2.apply(this, arguments);
    }

    return _sign;
  }();

  _proto.dispose = function dispose() {
    var discovery = this.discovery;

    if (discovery) {
      discovery.stop();
      discovery.removeAllListeners();
      this.discovery = undefined;
    }
  };

  return ComposeTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = ComposeTransaction;