"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.signTx = exports.validate = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var bs58 = _interopRequireWildcard(require("bs58"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// | $EosActionCommon & { name: string; data: string };
// copied from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-numeric.ts
var binaryToDecimal = function binaryToDecimal(bignum, minDigits) {
  if (minDigits === void 0) {
    minDigits = 1;
  }

  var result = Array(minDigits).fill('0'.charCodeAt(0));

  for (var i = bignum.length - 1; i >= 0; --i) {
    var carry = bignum[i];

    for (var j = 0; j < result.length; ++j) {
      var x = (result[j] - '0'.charCodeAt(0) << 8) + carry;
      result[j] = '0'.charCodeAt(0) + x % 10;
      carry = x / 10 | 0;
    }

    while (carry) {
      result.push('0'.charCodeAt(0) + carry % 10);
      carry = carry / 10 | 0;
    }
  }

  result.reverse();
  return String.fromCharCode.apply(String, result);
}; // copied from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts
// "pushName"


var serialize = function serialize(s) {
  if (typeof s !== 'string') {
    throw new Error("Eos serialization error, \"" + typeof s + "\" should be a string");
  }

  function charToSymbol(c) {
    if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
      return c - 'a'.charCodeAt(0) + 6;
    }

    if (c >= '1'.charCodeAt(0) && c <= '5'.charCodeAt(0)) {
      return c - '1'.charCodeAt(0) + 1;
    }

    return 0;
  }

  var a = new Uint8Array(8);
  var bit = 63;

  for (var i = 0; i < s.length; ++i) {
    var c = charToSymbol(s.charCodeAt(i));

    if (bit < 5) {
      c = c << 1;
    }

    for (var j = 4; j >= 0; --j) {
      if (bit >= 0) {
        a[Math.floor(bit / 8)] |= (c >> j & 1) << bit % 8;
        --bit;
      }
    }
  }

  return binaryToDecimal(a);
}; // copied (and slightly modified) from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts
// "pushAsset"


var parseQuantity = function parseQuantity(s) {
  if (typeof s !== 'string') {
    throw new Error("Eos serialization error. Expected string containing asset, got: " + typeof s);
  }

  s = s.trim();
  var pos = 0;
  var amount = '';
  var precision = 0;

  if (s[pos] === '-') {
    amount += '-';
    ++pos;
  }

  var foundDigit = false;

  while (pos < s.length && s.charCodeAt(pos) >= '0'.charCodeAt(0) && s.charCodeAt(pos) <= '9'.charCodeAt(0)) {
    foundDigit = true;
    amount += s[pos];
    ++pos;
  }

  if (!foundDigit) {
    throw new Error('Eos serialization error. Asset must begin with a number');
  }

  if (s[pos] === '.') {
    ++pos;

    while (pos < s.length && s.charCodeAt(pos) >= '0'.charCodeAt(0) && s.charCodeAt(pos) <= '9'.charCodeAt(0)) {
      amount += s[pos];
      ++precision;
      ++pos;
    }
  }

  var symbol = s.substr(pos).trim();
  var a = [precision & 0xff];

  for (var i = 0; i < symbol.length; ++i) {
    a.push(symbol.charCodeAt(i));
  }

  while (a.length < 8) {
    a.push(0);
  }

  return {
    amount: amount,
    symbol: binaryToDecimal(a.slice(0, 8))
  };
}; // transform incoming parameters to protobuf messages format


var parseAuth = function parseAuth(a) {
  function keyToBuffer(pk) {
    var len = pk.indexOf('EOS') === 0 ? 3 : 7;
    var key = bs58.decode(pk.substring(len)); // key.slice(0, key.length - 4);

    return {
      type: 0,
      key: key.slice(0, key.length - 4)
    };
  }

  return {
    threshold: a.threshold,
    keys: a.keys.map(function (k) {
      return _objectSpread({
        weight: k.weight
      }, keyToBuffer(k.key));
    }),
    accounts: a.accounts.map(function (acc) {
      return {
        weight: acc.weight,
        account: {
          actor: serialize(acc.permission.actor),
          permission: serialize(acc.permission.permission)
        }
      };
    }),
    waits: a.waits
  };
}; // from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts
// "dateToTimePoint"


var parseDate = function parseDate(d) {
  if (typeof d !== 'string') {
    throw new Error('Eos serialization error. Header.expiration should be string or number');
  }

  if (d.substr(d.length - 1, d.length) !== 'Z') {
    d += 'Z';
  }

  return Date.parse(d) / 1000;
};

var parseAck = function parseAck(action) {
  switch (action.name) {
    case 'transfer':
      return {
        'transfer': {
          sender: serialize(action.data.from),
          receiver: serialize(action.data.to),
          quantity: parseQuantity(action.data.quantity),
          memo: action.data.memo
        }
      };

    case 'delegatebw':
      return {
        'delegate': {
          sender: serialize(action.data.from),
          receiver: serialize(action.data.receiver),
          net_quantity: parseQuantity(action.data.stake_net_quantity),
          cpu_quantity: parseQuantity(action.data.stake_cpu_quantity),
          transfer: action.data.transfer
        }
      };

    case 'undelegatebw':
      return {
        'undelegate': {
          sender: serialize(action.data.from),
          receiver: serialize(action.data.receiver),
          net_quantity: parseQuantity(action.data.unstake_net_quantity),
          cpu_quantity: parseQuantity(action.data.unstake_cpu_quantity)
        }
      };

    case 'buyram':
      return {
        'buy_ram': {
          payer: serialize(action.data.payer),
          receiver: serialize(action.data.receiver),
          quantity: parseQuantity(action.data.quant)
        }
      };

    case 'buyrambytes':
      return {
        'buy_ram_bytes': {
          payer: serialize(action.data.payer),
          receiver: serialize(action.data.receiver),
          bytes: action.data.bytes
        }
      };

    case 'sellram':
      return {
        'sell_ram': {
          account: serialize(action.data.account),
          bytes: action.data.bytes
        }
      };

    case 'voteproducer':
      return {
        'vote_producer': {
          voter: serialize(action.data.voter),
          proxy: serialize(action.data.proxy),
          producers: action.data.producers.map(function (p) {
            return serialize(p);
          })
        }
      };

    case 'refund':
      return {
        'refund': {
          owner: serialize(action.data.owner)
        }
      };

    case 'updateauth':
      return {
        'update_auth': {
          account: serialize(action.data.account),
          permission: serialize(action.data.permission),
          parent: serialize(action.data.parent),
          auth: parseAuth(action.data.auth)
        }
      };

    case 'deleteauth':
      return {
        'delete_auth': {
          account: serialize(action.data.account),
          permission: serialize(action.data.permission)
        }
      };

    case 'linkauth':
      return {
        'link_auth': {
          account: serialize(action.data.account),
          code: serialize(action.data.code),
          type: serialize(action.data.type),
          requirement: serialize(action.data.requirement)
        }
      };

    case 'unlinkauth':
      return {
        'unlink_auth': {
          account: serialize(action.data.account),
          code: serialize(action.data.code),
          type: serialize(action.data.type)
        }
      };

    case 'newaccount':
      return {
        'new_account': {
          creator: serialize(action.data.creator),
          name: serialize(action.data.name),
          owner: parseAuth(action.data.owner),
          active: parseAuth(action.data.active)
        }
      };

    default:
      return null;
  }
};

var parseUnknown = function parseUnknown(action) {
  if (typeof action.data !== 'string') return null;
  return {
    unknown: {
      data_size: action.data.length / 2,
      data_chunk: action.data
    }
  };
};

var parseCommon = function parseCommon(action) {
  return {
    account: serialize(action.account),
    name: serialize(action.name),
    authorization: action.authorization.map(function (a) {
      return {
        actor: serialize(a.actor),
        permission: serialize(a.permission)
      };
    })
  };
};

var parseAction = function parseAction(action) {
  var ack = parseAck(action) || parseUnknown(action);
  return _objectSpread({
    common: parseCommon(action)
  }, ack);
};

var validate = function validate(address_n, tx) {
  var header = tx.header ? {
    expiration: typeof tx.header.expiration === 'number' ? tx.header.expiration : parseDate(tx.header.expiration),
    ref_block_num: tx.header.refBlockNum,
    ref_block_prefix: tx.header.refBlockPrefix,
    max_net_usage_words: tx.header.maxNetUsageWords,
    max_cpu_usage_ms: tx.header.maxCpuUsageMs,
    delay_sec: tx.header.delaySec
  } : null;
  var ack = [];
  tx.actions.forEach(function (action) {
    ack.push(parseAction(action));
  });
  return {
    chain_id: tx.chainId,
    header: header,
    ack: ack
  };
}; // sign transaction logic


exports.validate = validate;
var CHUNK_SIZE = 2048;

var getDataChunk = function getDataChunk(data, offset) {
  if (offset < 0) return null;
  if (data.length < offset) return null;
  var o = offset > 0 ? data.length - offset * 2 : 0;
  return data.substring(o, o + CHUNK_SIZE * 2);
};

var processTxRequest = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(typedCall, response, actions, index) {
    var action, lastOp, ack, requestedDataSize, unknown, offset, data_chunk, act, sent, lastChunk, _response, _response2;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            action = actions[index];
            lastOp = index + 1 >= actions.length;
            requestedDataSize = response.message.data_size;

            if (!action.unknown) {
              _context.next = 23;
              break;
            }

            unknown = action.unknown;
            offset = typeof requestedDataSize === 'number' ? requestedDataSize : 0;
            data_chunk = getDataChunk(unknown.data_chunk, offset);
            act = {
              common: action.common,
              unknown: {
                data_size: unknown.data_size,
                data_chunk: data_chunk
              }
            };
            sent = offset > 0 ? unknown.data_size - offset + CHUNK_SIZE : CHUNK_SIZE;
            lastChunk = sent >= unknown.data_size;

            if (!(lastOp && lastChunk)) {
              _context.next = 17;
              break;
            }

            _context.next = 13;
            return typedCall('EosTxActionAck', 'EosSignedTx', act);

          case 13:
            _response = _context.sent;
            return _context.abrupt("return", _response.message);

          case 17:
            _context.next = 19;
            return typedCall('EosTxActionAck', 'EosTxActionRequest', act);

          case 19:
            ack = _context.sent;

            if (lastChunk) {
              index++;
            }

          case 21:
            _context.next = 32;
            break;

          case 23:
            if (!lastOp) {
              _context.next = 28;
              break;
            }

            _context.next = 26;
            return typedCall('EosTxActionAck', 'EosSignedTx', action);

          case 26:
            _response2 = _context.sent;
            return _context.abrupt("return", _response2.message);

          case 28:
            _context.next = 30;
            return typedCall('EosTxActionAck', 'EosTxActionRequest', action);

          case 30:
            ack = _context.sent;
            index++;

          case 32:
            _context.next = 34;
            return processTxRequest(typedCall, ack, actions, index);

          case 34:
            return _context.abrupt("return", _context.sent);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function processTxRequest(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var signTx = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(typedCall, address_n, chain_id, header, actions) {
    var response;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return typedCall('EosSignTx', 'EosTxActionRequest', {
              address_n: address_n,
              chain_id: chain_id,
              header: header,
              num_actions: actions.length
            });

          case 2:
            response = _context2.sent;
            _context2.next = 5;
            return processTxRequest(typedCall, response, actions, 0);

          case 5:
            return _context2.abrupt("return", _context2.sent);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function signTx(_x5, _x6, _x7, _x8, _x9) {
    return _ref2.apply(this, arguments);
  };
}();

exports.signTx = signTx;