"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.disableWebUSB = exports.cancel = exports.requestLogin = exports.customMessage = exports.getSettings = exports.renderWebUSBButton = exports.uiResponse = exports.call = exports.init = exports.dispose = exports.manifest = exports.messagePromises = exports.eventEmitter = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _events = _interopRequireDefault(require("events"));

var _ConnectSettings = require("../../data/ConnectSettings");

var _debug = _interopRequireWildcard(require("../../utils/debug"));

var _Core = require("../../core/Core");

var _deferred = require("../../utils/deferred");

var _constants = require("../../constants");

var $T = _interopRequireWildcard(require("../../types"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var eventEmitter = new _events["default"]();
exports.eventEmitter = eventEmitter;

var _log = (0, _debug.init)('[trezor-connect.js]');

var _settings;

var _core;

var _messageID = 0;
var messagePromises = {};
exports.messagePromises = messagePromises;

var manifest = function manifest(data) {
  _settings = (0, _ConnectSettings.parse)({
    manifest: data
  });
};

exports.manifest = manifest;

var dispose = function dispose() {// iframe.dispose();
  // if (_popupManager) {
  //     _popupManager.close();
  // }
}; // handle message received from iframe


exports.dispose = dispose;

var handleMessage = function handleMessage(message) {
  var event = message.event,
      type = message.type,
      payload = message.payload;
  var id = message.id || 0;

  if (type === _constants.UI.REQUEST_UI_WINDOW) {
    _core.handleMessage({
      event: _constants.UI_EVENT,
      type: _constants.POPUP.HANDSHAKE
    }, true);

    return;
  }

  _log.log('handleMessage', message);

  switch (event) {
    case _constants.RESPONSE_EVENT:
      if (messagePromises[id]) {
        // resolve message promise (send result of call method)
        messagePromises[id].resolve({
          id: id,
          success: message.success,
          payload: payload
        });
        delete messagePromises[id];
      } else {
        _log.warn("Unknown message id " + id);
      }

      break;

    case _constants.DEVICE_EVENT:
      // pass DEVICE event up to html
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload); // DEVICE_EVENT also emit single events (connect/disconnect...)

      break;

    case _constants.TRANSPORT_EVENT:
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    case _constants.BLOCKCHAIN_EVENT:
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    case _constants.UI_EVENT:
      // pass UI event up
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    default:
      _log.log('Undefined message', event, message);

  }
};

var postMessage = function postMessage(message, usePromise) {
  if (usePromise === void 0) {
    usePromise = true;
  }

  if (!_core) {
    throw new Error('postMessage: _core not found');
  }

  if (usePromise) {
    _messageID++;
    message.id = _messageID;
    messagePromises[_messageID] = (0, _deferred.create)();

    _core.handleMessage(message, true);

    return messagePromises[_messageID].promise;
  }

  _core.handleMessage(message, true);

  return null;
};

var init = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(settings) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (settings === void 0) {
              settings = {};
            }

            if (!_settings) {
              _settings = (0, _ConnectSettings.parse)(settings);
            } // set defaults for node


            _settings.origin = 'http://node.trezor.io/';
            _settings.popup = false;
            _settings.env = 'react-native';

            if (_settings.manifest) {
              _context.next = 7;
              break;
            }

            throw _constants.ERRORS.MANIFEST_NOT_SET;

          case 7:
            if (!_settings.lazyLoad) {
              _context.next = 10;
              break;
            }

            // reset "lazyLoad" after first use
            _settings.lazyLoad = false;
            return _context.abrupt("return");

          case 10:
            _log.enabled = !!_settings.debug;
            _context.next = 13;
            return (0, _Core.init)(_settings);

          case 13:
            _core = _context.sent;

            _core.on(_constants.CORE_EVENT, handleMessage);

            _context.next = 17;
            return (0, _Core.initTransport)(_settings);

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function init() {
    return _ref.apply(this, arguments);
  };
}();

exports.init = init;

var call = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(params) {
    var response;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (_core) {
              _context2.next = 10;
              break;
            }

            _settings = (0, _ConnectSettings.parse)({
              debug: false,
              popup: false
            }); // auto init with default settings

            _context2.prev = 2;
            _context2.next = 5;
            return init(_settings);

          case 5:
            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](2);
            return _context2.abrupt("return", {
              success: false,
              payload: {
                error: _context2.t0
              }
            });

          case 10:
            _context2.prev = 10;
            _context2.next = 13;
            return postMessage({
              type: _constants.IFRAME.CALL,
              payload: params
            });

          case 13:
            response = _context2.sent;

            if (!response) {
              _context2.next = 18;
              break;
            }

            return _context2.abrupt("return", response);

          case 18:
            return _context2.abrupt("return", {
              success: false,
              payload: {
                error: 'No response from iframe'
              }
            });

          case 19:
            _context2.next = 25;
            break;

          case 21:
            _context2.prev = 21;
            _context2.t1 = _context2["catch"](10);

            _log.error('__call error', _context2.t1);

            return _context2.abrupt("return", _context2.t1);

          case 25:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 7], [10, 21]]);
  }));

  return function call(_x) {
    return _ref2.apply(this, arguments);
  };
}();

exports.call = call;

var customMessageResponse = function customMessageResponse(payload) {
  _core.handleMessage({
    event: _constants.UI_EVENT,
    type: _constants.UI.CUSTOM_MESSAGE_RESPONSE,
    payload: payload
  }, true);
};

var uiResponse = function uiResponse(response) {
  var type = response.type,
      payload = response.payload;

  _core.handleMessage({
    event: _constants.UI_EVENT,
    type: type,
    payload: payload
  }, true);
};

exports.uiResponse = uiResponse;

var renderWebUSBButton = function renderWebUSBButton(className) {// webUSBButton(className, _settings.webusbSrc, iframe.origin);
};

exports.renderWebUSBButton = renderWebUSBButton;

var getSettings = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (_core) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return", {
              success: false,
              payload: {
                error: 'Core not initialized yet, you need to call TrezorConnect.init or any other method first.'
              }
            });

          case 2:
            _context3.next = 4;
            return call({
              method: 'getSettings'
            });

          case 4:
            return _context3.abrupt("return", _context3.sent);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function getSettings() {
    return _ref3.apply(this, arguments);
  };
}();

exports.getSettings = getSettings;

var customMessage = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(params) {
    var callback, customMessageListener, response;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!(typeof params.callback !== 'function')) {
              _context5.next = 2;
              break;
            }

            return _context5.abrupt("return", {
              success: false,
              payload: {
                error: 'Parameter "callback" is not a function'
              }
            });

          case 2:
            // TODO: set message listener only if iframe is loaded correctly
            callback = params.callback;

            customMessageListener = /*#__PURE__*/function () {
              var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(event) {
                var data, payload;
                return _regenerator["default"].wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        data = event.data;

                        if (!(data && data.type === _constants.UI.CUSTOM_MESSAGE_REQUEST)) {
                          _context4.next = 6;
                          break;
                        }

                        _context4.next = 4;
                        return callback(data.payload);

                      case 4:
                        payload = _context4.sent;

                        if (payload) {
                          customMessageResponse(payload);
                        } else {
                          customMessageResponse({
                            message: 'release'
                          });
                        }

                      case 6:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function customMessageListener(_x3) {
                return _ref5.apply(this, arguments);
              };
            }();

            _core.on(_constants.CORE_EVENT, customMessageListener);

            _context5.next = 7;
            return call(_objectSpread({
              method: 'customMessage'
            }, params, {
              callback: null
            }));

          case 7:
            response = _context5.sent;

            _core.removeListener(_constants.CORE_EVENT, customMessageListener);

            return _context5.abrupt("return", response);

          case 10:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function customMessage(_x2) {
    return _ref4.apply(this, arguments);
  };
}();

exports.customMessage = customMessage;

var requestLogin = /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(params) {
    var callback, loginChallengeListener, response;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!(typeof params.callback === 'function')) {
              _context7.next = 11;
              break;
            }

            callback = params.callback; // TODO: set message listener only if iframe is loaded correctly

            loginChallengeListener = /*#__PURE__*/function () {
              var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(event) {
                var data, payload;
                return _regenerator["default"].wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        data = event.data;

                        if (!(data && data.type === _constants.UI.LOGIN_CHALLENGE_REQUEST)) {
                          _context6.next = 12;
                          break;
                        }

                        _context6.prev = 2;
                        _context6.next = 5;
                        return callback();

                      case 5:
                        payload = _context6.sent;

                        _core.handleMessage({
                          event: _constants.UI_EVENT,
                          type: _constants.UI.LOGIN_CHALLENGE_RESPONSE,
                          payload: payload
                        }, true);

                        _context6.next = 12;
                        break;

                      case 9:
                        _context6.prev = 9;
                        _context6.t0 = _context6["catch"](2);

                        _core.handleMessage({
                          event: _constants.UI_EVENT,
                          type: _constants.UI.LOGIN_CHALLENGE_RESPONSE,
                          payload: _context6.t0.message
                        }, true);

                      case 12:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6, null, [[2, 9]]);
              }));

              return function loginChallengeListener(_x5) {
                return _ref7.apply(this, arguments);
              };
            }();

            _core.on(_constants.CORE_EVENT, loginChallengeListener);

            _context7.next = 6;
            return call(_objectSpread({
              method: 'requestLogin'
            }, params, {
              asyncChallenge: true,
              callback: null
            }));

          case 6:
            response = _context7.sent;

            _core.removeListener(_constants.CORE_EVENT, loginChallengeListener);

            return _context7.abrupt("return", response);

          case 11:
            _context7.next = 13;
            return call(_objectSpread({
              method: 'requestLogin'
            }, params));

          case 13:
            return _context7.abrupt("return", _context7.sent);

          case 14:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function requestLogin(_x4) {
    return _ref6.apply(this, arguments);
  };
}();

exports.requestLogin = requestLogin;

var cancel = function cancel(error) {
  postMessage({
    type: _constants.POPUP.CLOSED,
    payload: error ? {
      error: error
    } : null
  }, false);
};

exports.cancel = cancel;

var disableWebUSB = function disableWebUSB() {
  throw new Error('This version of trezor-connect is not suitable to work without browser');
};

exports.disableWebUSB = disableWebUSB;