"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getDeviceList = exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = _interopRequireDefault(require("events"));

var TRANSPORT = _interopRequireWildcard(require("../constants/transport"));

var DEVICE = _interopRequireWildcard(require("../constants/device"));

var ERROR = _interopRequireWildcard(require("../constants/errors"));

var _DescriptorStream = _interopRequireDefault(require("./DescriptorStream"));

var _Device = _interopRequireDefault(require("./Device"));

var _trezorLink = _interopRequireDefault(require("trezor-link"));

var _DataManager = _interopRequireDefault(require("../data/DataManager"));

var _TransportInfo = require("../data/TransportInfo");

var _debug = _interopRequireWildcard(require("../utils/debug"));

var _promiseUtils = require("../utils/promiseUtils");

var _workers = require("../env/node/workers");

var BridgeV2 = _trezorLink["default"].BridgeV2,
    Fallback = _trezorLink["default"].Fallback; // custom log

var _log = (0, _debug.init)('DeviceList'); // TODO: plugins are not typed in 'trezor-link'


var DeviceList = /*#__PURE__*/function (_EventEmitter) {
  (0, _inheritsLoose2["default"])(DeviceList, _EventEmitter);

  function DeviceList() {
    var _this;

    _this = _EventEmitter.call(this) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "devices", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "creatingDevicesDescriptors", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "hasCustomMessages", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "transportStartPending", 0);
    var _DataManager$settings = _DataManager["default"].settings,
        debug = _DataManager$settings.debug,
        env = _DataManager$settings.env,
        webusb = _DataManager$settings.webusb;
    _log.enabled = !!debug;
    var transports = [];

    if (env === 'react-native' && typeof _workers.ReactNativeUsbPlugin !== 'undefined') {
      transports.push((0, _workers.ReactNativeUsbPlugin)());
    } else {
      // $FlowIssue: `version` is missing in `JSON`
      var bridgeVersion = (0, _TransportInfo.getBridgeInfo)().version.join('.');

      if (env === 'node' || env === 'electron') {
        BridgeV2.setFetch(fetch, true);
      }

      transports.push(new BridgeV2(null, null, bridgeVersion));
    }

    if (webusb && typeof _workers.WebUsbPlugin !== 'undefined') {
      transports.push((0, _workers.WebUsbPlugin)());
    }

    _this.transport = new Fallback(transports);
    _this.defaultMessages = _DataManager["default"].getProtobufMessages();
    _this.currentMessages = _this.defaultMessages;
    return _this;
  }

  var _proto = DeviceList.prototype;

  _proto.init = /*#__PURE__*/function () {
    var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var transport, activeName;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              transport = this.transport;
              _context.prev = 1;

              _log.debug('Initializing transports');

              _context.next = 5;
              return transport.init(_log.enabled);

            case 5:
              _log.debug('Configuring transports');

              _context.next = 8;
              return transport.configure(JSON.stringify(this.defaultMessages));

            case 8:
              _log.debug('Configuring transports done');

              activeName = transport.activeName;

              if (activeName === 'LowlevelTransportWithSharedConnections') {
                // $FlowIssue "activeTransport" is not typed in trezor-link
                this.transportPlugin = transport.activeTransport.plugin;
              }

              _context.next = 13;
              return this._initStream();

            case 13:
              // listen for self emitted events and resolve pending transport event if needed
              this.on(DEVICE.CONNECT, this.resolveTransportEvent.bind(this));
              this.on(DEVICE.CONNECT_UNACQUIRED, this.resolveTransportEvent.bind(this));
              _context.next = 20;
              break;

            case 17:
              _context.prev = 17;
              _context.t0 = _context["catch"](1);
              this.emit(TRANSPORT.ERROR, _context.t0);

            case 20:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 17]]);
    }));

    function init() {
      return _init.apply(this, arguments);
    }

    return init;
  }();

  _proto.reconfigure = /*#__PURE__*/function () {
    var _reconfigure = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(messages, custom) {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (Array.isArray(messages)) {
                messages = _DataManager["default"].getProtobufMessages(messages);
              }

              if (!(this.currentMessages === messages)) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return");

            case 3:
              _context2.prev = 3;
              _context2.next = 6;
              return this.transport.configure(JSON.stringify(messages));

            case 6:
              this.currentMessages = messages;
              this.hasCustomMessages = typeof custom === 'boolean' ? custom : false;
              _context2.next = 13;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2["catch"](3);
              throw ERROR.WRONG_TRANSPORT_CONFIG;

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[3, 10]]);
    }));

    function reconfigure(_x, _x2) {
      return _reconfigure.apply(this, arguments);
    }

    return reconfigure;
  }();

  _proto.restoreMessages = /*#__PURE__*/function () {
    var _restoreMessages = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (this.hasCustomMessages) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return");

            case 2:
              _context3.prev = 2;
              _context3.next = 5;
              return this.transport.configure(JSON.stringify(this.defaultMessages));

            case 5:
              this.hasCustomMessages = false;
              _context3.next = 11;
              break;

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](2);
              throw ERROR.WRONG_TRANSPORT_CONFIG;

            case 11:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[2, 8]]);
    }));

    function restoreMessages() {
      return _restoreMessages.apply(this, arguments);
    }

    return restoreMessages;
  }();

  _proto.resolveTransportEvent = function resolveTransportEvent() {
    this.transportStartPending--;

    if (this.transportStartPending === 0) {
      this.stream.emit(TRANSPORT.START);
    }
  };

  _proto.waitForTransportFirstEvent = /*#__PURE__*/function () {
    var _waitForTransportFirstEvent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var _this2 = this;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return new Promise(function (resolve) {
                var handler = function handler() {
                  _this2.removeListener(TRANSPORT.START, handler);

                  _this2.removeListener(TRANSPORT.ERROR, handler);

                  resolve();
                };

                _this2.on(TRANSPORT.START, handler);

                _this2.on(TRANSPORT.ERROR, handler);
              });

            case 2:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function waitForTransportFirstEvent() {
      return _waitForTransportFirstEvent.apply(this, arguments);
    }

    return waitForTransportFirstEvent;
  }()
  /**
   * Transport events handler
   * @param {Transport} transport
   * @memberof DeviceList
   */
  ;

  _proto._initStream =
  /*#__PURE__*/
  function () {
    var _initStream2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
      var _this3 = this;

      var stream, _this$transportPlugin, unreadableHidDevice, unreadableHidDeviceChange;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              stream = new _DescriptorStream["default"](this.transport);
              stream.on(TRANSPORT.START_PENDING, function (pending) {
                _this3.transportStartPending = pending;
              });
              stream.on(TRANSPORT.START, function () {
                _this3.emit(TRANSPORT.START, _this3.getTransportInfo());
              });
              stream.on(TRANSPORT.UPDATE, function (diff) {
                new DiffHandler(_this3, diff).handle();
              });
              stream.on(TRANSPORT.ERROR, function (error) {
                _this3.emit(TRANSPORT.ERROR, error);

                stream.stop();
              });
              stream.listen();
              this.stream = stream;

              if (this.transportPlugin && this.transportPlugin.name === 'WebUsbPlugin') {
                _this$transportPlugin = this.transportPlugin, unreadableHidDevice = _this$transportPlugin.unreadableHidDevice, unreadableHidDeviceChange = _this$transportPlugin.unreadableHidDeviceChange;
                unreadableHidDeviceChange.on('change', /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
                  var device, _device;

                  return _regenerator["default"].wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          if (!unreadableHidDevice) {
                            _context5.next = 8;
                            break;
                          }

                          _context5.next = 3;
                          return _this3._createUnacquiredDevice({
                            path: DEVICE.UNREADABLE,
                            session: null,
                            debugSession: null,
                            debug: false
                          });

                        case 3:
                          device = _context5.sent;
                          _this3.devices[DEVICE.UNREADABLE] = device;

                          _this3.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());

                          _context5.next = 11;
                          break;

                        case 8:
                          _device = _this3.devices[DEVICE.UNREADABLE];
                          delete _this3.devices[DEVICE.UNREADABLE];

                          _this3.emit(DEVICE.DISCONNECT, _device.toMessageObject());

                        case 11:
                        case "end":
                          return _context5.stop();
                      }
                    }
                  }, _callee5);
                })));
              }

              this.emit(TRANSPORT.STREAM, stream);

            case 9:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function _initStream() {
      return _initStream2.apply(this, arguments);
    }

    return _initStream;
  }();

  _proto._createAndSaveDevice = /*#__PURE__*/function () {
    var _createAndSaveDevice2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(descriptor) {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _log.debug('Creating Device', descriptor);

              _context7.next = 3;
              return new CreateDeviceHandler(descriptor, this).handle();

            case 3:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function _createAndSaveDevice(_x3) {
      return _createAndSaveDevice2.apply(this, arguments);
    }

    return _createAndSaveDevice;
  }();

  _proto._createUnacquiredDevice = /*#__PURE__*/function () {
    var _createUnacquiredDevice2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(descriptor) {
      var _this4 = this;

      var currentDescriptor, device;
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              currentDescriptor = this.stream.current && this.stream.current.find(function (d) {
                return d.path === descriptor.path;
              }) || descriptor;

              _log.debug('Creating Unacquired Device', currentDescriptor);

              _context8.next = 4;
              return _Device["default"].createUnacquired(this.transport, currentDescriptor);

            case 4:
              device = _context8.sent;
              device.once(DEVICE.ACQUIRED, function () {
                _this4.emit(DEVICE.CONNECT, device.toMessageObject());
              });
              return _context8.abrupt("return", device);

            case 7:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function _createUnacquiredDevice(_x4) {
      return _createUnacquiredDevice2.apply(this, arguments);
    }

    return _createUnacquiredDevice;
  }();

  _proto.getDevice = function getDevice(path) {
    return this.devices[path];
  };

  _proto.getFirstDevicePath = function getFirstDevicePath() {
    return this.asArray()[0].path;
  };

  _proto.asArray = function asArray() {
    return this.allDevices().map(function (device) {
      return device.toMessageObject();
    });
  };

  _proto.allDevices = function allDevices() {
    var _this5 = this;

    return Object.keys(this.devices).map(function (key) {
      return _this5.devices[key];
    });
  };

  _proto.length = function length() {
    return this.asArray().length;
  };

  _proto.transportType = function transportType() {
    var transport = this.transport,
        transportPlugin = this.transportPlugin;
    var activeName = transport.activeName;

    if (activeName === 'BridgeTransport') {
      return 'bridge';
    }

    if (transportPlugin) {
      return transportPlugin.name;
    }

    return transport.name;
  };

  _proto.getTransportInfo = function getTransportInfo() {
    return {
      type: this.transportType(),
      version: this.transport.version,
      outdated: this.transport.isOutdated
    };
  };

  _proto.onBeforeUnload = function onBeforeUnload() {
    if (this.stream) {
      this.stream.stop();
    }

    this.allDevices().forEach(function (device) {
      return device.onBeforeUnload();
    });
  };

  _proto.disconnectDevices = function disconnectDevices() {
    var _this6 = this;

    this.allDevices().forEach(function (device) {
      // device.disconnect();
      _this6.emit(DEVICE.DISCONNECT, device.toMessageObject());
    });
  };

  _proto.enumerate = function enumerate() {
    var _this7 = this;

    this.stream.enumerate();
    if (!this.stream.current) return; // update current values

    this.stream.current.forEach(function (descriptor) {
      var path = descriptor.path.toString();
      var device = _this7.devices[path];

      if (device) {
        device.updateDescriptor(descriptor);
      }
    });
  };

  return DeviceList;
}(_events["default"]);
/**
 * DeviceList initialization
 * returns instance of DeviceList
 * @returns {Promise<DeviceList>}
 */


exports["default"] = DeviceList;

var getDeviceList = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
    var list;
    return _regenerator["default"].wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            list = new DeviceList();
            _context9.next = 3;
            return list.init();

          case 3:
            return _context9.abrupt("return", list);

          case 4:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function getDeviceList() {
    return _ref2.apply(this, arguments);
  };
}(); // Helper class for creating new device


exports.getDeviceList = getDeviceList;

var CreateDeviceHandler = /*#__PURE__*/function () {
  function CreateDeviceHandler(descriptor, list) {
    this.descriptor = descriptor;
    this.list = list;
    this.path = descriptor.path.toString();
  } // main logic


  var _proto2 = CreateDeviceHandler.prototype;

  _proto2.handle =
  /*#__PURE__*/
  function () {
    var _handle = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
      return _regenerator["default"].wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              // creatingDevicesDescriptors is needed, so that if *during* creating of Device,
              // other application acquires the device and changes the descriptor,
              // the new unacquired device has correct descriptor
              this.list.creatingDevicesDescriptors[this.path] = this.descriptor;
              _context10.prev = 1;
              _context10.next = 4;
              return this._takeAndCreateDevice();

            case 4:
              _context10.next = 32;
              break;

            case 6:
              _context10.prev = 6;
              _context10.t0 = _context10["catch"](1);

              _log.debug('Cannot create device', _context10.t0);

              if (!(_context10.t0.message.toLowerCase() === ERROR.DEVICE_NOT_FOUND.message.toLowerCase())) {
                _context10.next = 12;
                break;
              }

              _context10.next = 32;
              break;

            case 12:
              if (!(_context10.t0.message === ERROR.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE || _context10.t0.toString() === ERROR.WEBUSB_ERROR_MESSAGE)) {
                _context10.next = 18;
                break;
              }

              this.list.enumerate();
              _context10.next = 16;
              return this._handleUsedElsewhere();

            case 16:
              _context10.next = 32;
              break;

            case 18:
              if (!(_context10.t0.code === ERROR.INITIALIZATION_FAILED.code)) {
                _context10.next = 23;
                break;
              }

              _context10.next = 21;
              return this._handleUsedElsewhere();

            case 21:
              _context10.next = 32;
              break;

            case 23:
              if (!(_context10.t0.message === ERROR.DEVICE_USED_ELSEWHERE.message)) {
                _context10.next = 28;
                break;
              }

              _context10.next = 26;
              return this._handleUsedElsewhere();

            case 26:
              _context10.next = 32;
              break;

            case 28:
              _context10.next = 30;
              return (0, _promiseUtils.resolveAfter)(501, null);

            case 30:
              _context10.next = 32;
              return this.handle();

            case 32:
              delete this.list.creatingDevicesDescriptors[this.path];

            case 33:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this, [[1, 6]]);
    }));

    function handle() {
      return _handle.apply(this, arguments);
    }

    return handle;
  }();

  _proto2._takeAndCreateDevice = /*#__PURE__*/function () {
    var _takeAndCreateDevice2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
      var device;
      return _regenerator["default"].wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _Device["default"].fromDescriptor(this.list.transport, this.descriptor);

            case 2:
              device = _context11.sent;
              this.list.devices[this.path] = device;
              _context11.next = 6;
              return device.run();

            case 6:
              this.list.emit(DEVICE.CONNECT, device.toMessageObject());

            case 7:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function _takeAndCreateDevice() {
      return _takeAndCreateDevice2.apply(this, arguments);
    }

    return _takeAndCreateDevice;
  }();

  _proto2._handleUsedElsewhere = /*#__PURE__*/function () {
    var _handleUsedElsewhere2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12() {
      var device;
      return _regenerator["default"].wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return this.list._createUnacquiredDevice(this.list.creatingDevicesDescriptors[this.path]);

            case 2:
              device = _context12.sent;
              this.list.devices[this.path] = device;
              this.list.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());

            case 5:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    }));

    function _handleUsedElsewhere() {
      return _handleUsedElsewhere2.apply(this, arguments);
    }

    return _handleUsedElsewhere;
  }();

  return CreateDeviceHandler;
}(); // Helper class for actual logic of handling differences


var DiffHandler = /*#__PURE__*/function () {
  function DiffHandler(list, diff) {
    this.list = list;
    this.diff = diff;
  }

  var _proto3 = DiffHandler.prototype;

  _proto3.handle = function handle() {
    _log.debug('Update DescriptorStream', this.diff); // note - this intentionally does not wait for connected devices
    // createDevice inside waits for the updateDescriptor event


    this._createConnectedDevices();

    this._createReleasedDevices();

    this._signalAcquiredDevices();

    this._updateDescriptors();

    this._emitEvents();

    this._disconnectDevices();
  };

  _proto3._updateDescriptors = function _updateDescriptors() {
    var _this8 = this;

    this.diff.descriptors.forEach(function (descriptor) {
      var path = descriptor.path.toString();
      var device = _this8.list.devices[path];

      if (device) {
        device.updateDescriptor(descriptor);
      }
    });
  };

  _proto3._emitEvents = function _emitEvents() {
    var _this9 = this;

    var events = [{
      d: this.diff.changedSessions,
      e: DEVICE.CHANGED
    }, {
      d: this.diff.acquired,
      e: DEVICE.ACQUIRED
    }, {
      d: this.diff.released,
      e: DEVICE.RELEASED
    }];
    events.forEach(function (_ref3) {
      var d = _ref3.d,
          e = _ref3.e;
      d.forEach(function (descriptor) {
        var path = descriptor.path.toString();
        var device = _this9.list.devices[path];

        _log.debug('Event', e, device);

        if (device) {
          _this9.list.emit(e, device.toMessageObject());
        }
      });
    });
  } // tries to read info about connected devices
  ;

  _proto3._createConnectedDevices =
  /*#__PURE__*/
  function () {
    var _createConnectedDevices2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13() {
      var _iterator, _isArray, _i, _ref4, descriptor, path, priority, device;

      return _regenerator["default"].wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _iterator = this.diff.connected, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();

            case 1:
              if (!_isArray) {
                _context13.next = 7;
                break;
              }

              if (!(_i >= _iterator.length)) {
                _context13.next = 4;
                break;
              }

              return _context13.abrupt("break", 30);

            case 4:
              _ref4 = _iterator[_i++];
              _context13.next = 11;
              break;

            case 7:
              _i = _iterator.next();

              if (!_i.done) {
                _context13.next = 10;
                break;
              }

              return _context13.abrupt("break", 30);

            case 10:
              _ref4 = _i.value;

            case 11:
              descriptor = _ref4;
              path = descriptor.path.toString();
              priority = _DataManager["default"].getSettings('priority');

              _log.debug('Connected', priority, descriptor.session, this.list.devices);

              if (!priority) {
                _context13.next = 18;
                break;
              }

              _context13.next = 18;
              return (0, _promiseUtils.resolveAfter)(501 + 100 * priority, null);

            case 18:
              if (!(descriptor.session == null)) {
                _context13.next = 23;
                break;
              }

              _context13.next = 21;
              return this.list._createAndSaveDevice(descriptor);

            case 21:
              _context13.next = 28;
              break;

            case 23:
              _context13.next = 25;
              return this.list._createUnacquiredDevice(descriptor);

            case 25:
              device = _context13.sent;
              this.list.devices[path] = device;
              this.list.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());

            case 28:
              _context13.next = 1;
              break;

            case 30:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    }));

    function _createConnectedDevices() {
      return _createConnectedDevices2.apply(this, arguments);
    }

    return _createConnectedDevices;
  }();

  _proto3._signalAcquiredDevices = function _signalAcquiredDevices() {
    for (var _iterator2 = this.diff.acquired, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref5;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref5 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref5 = _i2.value;
      }

      var descriptor = _ref5;
      var path = descriptor.path.toString();

      if (this.list.creatingDevicesDescriptors[path]) {
        this.list.creatingDevicesDescriptors[path] = descriptor;
      }
    }
  } // tries acquire and read info about recently released devices
  ;

  _proto3._createReleasedDevices =
  /*#__PURE__*/
  function () {
    var _createReleasedDevices2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee14() {
      var _iterator3, _isArray3, _i3, _ref6, descriptor, path, device;

      return _regenerator["default"].wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _iterator3 = this.diff.released, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();

            case 1:
              if (!_isArray3) {
                _context14.next = 7;
                break;
              }

              if (!(_i3 >= _iterator3.length)) {
                _context14.next = 4;
                break;
              }

              return _context14.abrupt("break", 23);

            case 4:
              _ref6 = _iterator3[_i3++];
              _context14.next = 11;
              break;

            case 7:
              _i3 = _iterator3.next();

              if (!_i3.done) {
                _context14.next = 10;
                break;
              }

              return _context14.abrupt("break", 23);

            case 10:
              _ref6 = _i3.value;

            case 11:
              descriptor = _ref6;
              path = descriptor.path.toString();
              device = this.list.devices[path];

              if (!device) {
                _context14.next = 21;
                break;
              }

              if (!(device.isUnacquired() && !device.isInconsistent())) {
                _context14.next = 21;
                break;
              }

              _context14.next = 18;
              return (0, _promiseUtils.resolveAfter)(501, null);

            case 18:
              _log.debug('Create device from unacquired', device);

              _context14.next = 21;
              return this.list._createAndSaveDevice(descriptor);

            case 21:
              _context14.next = 1;
              break;

            case 23:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, this);
    }));

    function _createReleasedDevices() {
      return _createReleasedDevices2.apply(this, arguments);
    }

    return _createReleasedDevices;
  }();

  _proto3._disconnectDevices = function _disconnectDevices() {
    for (var _iterator4 = this.diff.disconnected, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref7;

      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        _ref7 = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        _ref7 = _i4.value;
      }

      var descriptor = _ref7;
      var path = descriptor.path.toString();
      var device = this.list.devices[path];

      if (device != null) {
        device.disconnect();
        delete this.list.devices[path];
        this.list.emit(DEVICE.DISCONNECT, device.toMessageObject());
      }
    }
  };

  return DiffHandler;
}();