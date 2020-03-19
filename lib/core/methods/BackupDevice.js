"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _builder = require("../../message/builder");

var BackupDevice = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(BackupDevice, _AbstractMethod);

  function BackupDevice(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    _this.requiredPermissions = ['management'];
    _this.useEmptyPassphrase = true;
    return _this;
  }

  var _proto = BackupDevice.prototype;

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
                  className: 'confirm',
                  label: 'Proceed'
                },
                label: 'Do you want to initiate backup procedure?'
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
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.device.getCommands().backupDevice();

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
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

  return BackupDevice;
}(_AbstractMethod2["default"]);

exports["default"] = BackupDevice;