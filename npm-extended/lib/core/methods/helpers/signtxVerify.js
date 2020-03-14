"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = exports.derivePubKeyHash = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _utxoLib = require("@trezor/utxo-lib");

var _addressUtils = require("../../../utils/addressUtils");

var _pathUtils = require("../../../utils/pathUtils");

var changePaths = [];
_utxoLib.Transaction.USE_STRING_VALUES = true;

var derivePubKeyHash = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(address_n, getHDNode, coinInfo) {
    var _response, _node, addr, response, node;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(address_n.length === 5)) {
              _context.next = 7;
              break;
            }

            _context.next = 3;
            return getHDNode(address_n.slice(0, 4), coinInfo);

          case 3:
            _response = _context.sent;
            _node = _utxoLib.HDNode.fromBase58(_response.xpub, coinInfo.network, true);
            addr = _node.derive(address_n[address_n.length - 1]);
            return _context.abrupt("return", addr.getIdentifier());

          case 7:
            _context.next = 9;
            return getHDNode(address_n, coinInfo);

          case 9:
            response = _context.sent;
            node = _utxoLib.HDNode.fromBase58(response.xpub, coinInfo.network, true);
            return _context.abrupt("return", node.getIdentifier());

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function derivePubKeyHash(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.derivePubKeyHash = derivePubKeyHash;

var deriveWitnessOutput = function deriveWitnessOutput(pkh) {
  // see https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
  // address derivation + test vectors
  var scriptSig = Buffer.alloc(pkh.length + 2);
  scriptSig[0] = 0;
  scriptSig[1] = 0x14;
  pkh.copy(scriptSig, 2);

  var addressBytes = _utxoLib.crypto.hash160(scriptSig);

  var scriptPubKey = Buffer.alloc(23);
  scriptPubKey[0] = 0xa9;
  scriptPubKey[1] = 0x14;
  scriptPubKey[22] = 0x87;
  addressBytes.copy(scriptPubKey, 2);
  return scriptPubKey;
};

var deriveBech32Output = function deriveBech32Output(pkh) {
  // see https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#Segwit_address_format
  // address derivation + test vectors
  var scriptSig = Buffer.alloc(pkh.length + 2);
  scriptSig[0] = 0;
  scriptSig[1] = 0x14;
  pkh.copy(scriptSig, 2);
  return scriptSig;
};

var deriveOutputScript = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(getHDNode, output, coinInfo) {
    var scriptType, pkh;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!output.op_return_data) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return", _utxoLib.script.nullData.output.encode(Buffer.from(output.op_return_data, 'hex')));

          case 2:
            if (!(!output.address_n && !output.address)) {
              _context2.next = 4;
              break;
            }

            throw new Error('deriveOutputScript: Neither address or address_n is set');

          case 4:
            scriptType = output.address_n ? (0, _pathUtils.getOutputScriptType)(output.address_n) : (0, _addressUtils.getAddressScriptType)(output.address, coinInfo);

            if (!output.address_n) {
              _context2.next = 11;
              break;
            }

            _context2.next = 8;
            return derivePubKeyHash(output.address_n, getHDNode, coinInfo);

          case 8:
            _context2.t0 = _context2.sent;
            _context2.next = 12;
            break;

          case 11:
            _context2.t0 = (0, _addressUtils.getAddressHash)(output.address);

          case 12:
            pkh = _context2.t0;

            if (!(scriptType === 'PAYTOADDRESS')) {
              _context2.next = 15;
              break;
            }

            return _context2.abrupt("return", _utxoLib.script.pubKeyHash.output.encode(pkh));

          case 15:
            if (!(scriptType === 'PAYTOSCRIPTHASH')) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("return", _utxoLib.script.scriptHash.output.encode(pkh));

          case 17:
            if (!(scriptType === 'PAYTOP2SHWITNESS')) {
              _context2.next = 19;
              break;
            }

            return _context2.abrupt("return", deriveWitnessOutput(pkh));

          case 19:
            if (!(scriptType === 'PAYTOWITNESS')) {
              _context2.next = 21;
              break;
            }

            return _context2.abrupt("return", deriveBech32Output(pkh));

          case 21:
            throw new Error('Unknown script type ' + scriptType);

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function deriveOutputScript(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

var _default = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(getHDNode, inputs, outputs, serializedTx, coinInfo) {
    var bitcoinTx, i, scriptB, amount, scriptA;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // clear cached values
            changePaths.splice(0, changePaths.length); // deserialize signed transaction

            bitcoinTx = _utxoLib.Transaction.fromHex(serializedTx, coinInfo.network); // check inputs and outputs length

            if (!(inputs.length !== bitcoinTx.ins.length)) {
              _context3.next = 4;
              break;
            }

            throw new Error('Signed transaction has wrong length.');

          case 4:
            if (!(outputs.length !== bitcoinTx.outs.length)) {
              _context3.next = 6;
              break;
            }

            throw new Error('Signed transaction has wrong length.');

          case 6:
            i = 0;

          case 7:
            if (!(i < outputs.length)) {
              _context3.next = 21;
              break;
            }

            scriptB = bitcoinTx.outs[i].script;

            if (!outputs[i].amount) {
              _context3.next = 13;
              break;
            }

            amount = outputs[i].amount;

            if (!(amount !== bitcoinTx.outs[i].value)) {
              _context3.next = 13;
              break;
            }

            throw new Error("Wrong output amount at output " + i + ". Requested: " + amount + ", signed: " + bitcoinTx.outs[i].value);

          case 13:
            _context3.next = 15;
            return deriveOutputScript(getHDNode, outputs[i], coinInfo);

          case 15:
            scriptA = _context3.sent;

            if (!(scriptA.compare(scriptB) !== 0)) {
              _context3.next = 18;
              break;
            }

            throw new Error("Output " + i + " scripts differ.");

          case 18:
            i++;
            _context3.next = 7;
            break;

          case 21:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x7, _x8, _x9, _x10, _x11) {
    return _ref3.apply(this, arguments);
  };
}();

exports["default"] = _default;