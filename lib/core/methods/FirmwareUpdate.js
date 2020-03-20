"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _rollout = require("@trezor/rollout");

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _uploadFirmware = require("./helpers/uploadFirmware");

var _builder = require("../../message/builder");

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var _paramsValidator = require("./helpers/paramsValidator");

var FirmwareUpdate = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(FirmwareUpdate, _AbstractMethod);

  function FirmwareUpdate(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    _this.useEmptyPassphrase = true;
    _this.requiredPermissions = ['management'];
    _this.allowDeviceMode = [UI.BOOTLOADER, UI.INITIALIZE];
    _this.requireDeviceMode = [UI.BOOTLOADER];
    _this.useDeviceState = false;
    _this.skipFirmwareCheck = true;
    var payload = message.payload;
    (0, _paramsValidator.validateParams)(payload, [{
      name: 'version',
      type: 'array'
    }, {
      name: 'btcOnly',
      type: 'boolean'
    }, {
      name: 'binary',
      type: 'buffer'
    }]);
    _this.params = {
      // either receive version and btcOnly
      version: payload.version,
      btcOnly: payload.btcOnly,
      // or binary
      binary: payload.binary
    };
    return _this;
  }

  var _proto = FirmwareUpdate.prototype;

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, uiResp;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.getPopupPromise().promise;

            case 2:
              // initialize user response promise
              uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(UI.REQUEST_CONFIRMATION, {
                view: 'device-management',
                customConfirmButton: {
                  className: 'wipe',
                  label: 'Proceed'
                },
                label: 'Do you want to update firmware? Never do this without your recovery card.'
              })); // wait for user action

              _context.next = 6;
              return uiPromise.promise;

            case 6:
              uiResp = _context.sent;
              return _context.abrupt("return", uiResp.payload);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function confirmation() {
      return _confirmation.apply(this, arguments);
    }

    return confirmation;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var device, binary, firmware;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              device = this.device;

              if (!this.params.binary) {
                _context2.next = 5;
                break;
              }

              binary = this.params.binary;
              _context2.next = 9;
              break;

            case 5:
              _context2.next = 7;
              return (0, _rollout.getBinary)({
                // features and releases are used for sanity checking inside @trezor/rollout
                features: device.features,
                releases: _DataManager["default"].assets["firmware-t" + device.features.major_version],
                // version argument is used to find and fetch concrete release from releases list
                version: this.params.version,
                btcOnly: this.params.btcOnly,
                baseUrl: 'https://wallet.trezor.io'
              });

            case 7:
              firmware = _context2.sent;
              binary = firmware.binary;

            case 9:
              return _context2.abrupt("return", (0, _uploadFirmware.uploadFirmware)(this.device.getCommands().typedCall.bind(this.device.getCommands()), this.postMessage, device, {
                payload: binary,
                length: binary.byteLength
              }));

            case 10:
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

  return FirmwareUpdate;
}(_AbstractMethod2["default"]);

exports["default"] = FirmwareUpdate;