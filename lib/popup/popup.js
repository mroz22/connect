"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var POPUP = _interopRequireWildcard(require("../constants/popup"));

var UI = _interopRequireWildcard(require("../constants/ui"));

var _message = require("../message");

var _builder = require("../message/builder");

var _DataManager = _interopRequireDefault(require("../data/DataManager"));

var _networkUtils = require("../env/browser/networkUtils");

var view = _interopRequireWildcard(require("./view"));

var _common = require("./view/common");

var _notification = require("./view/notification");

var _popup2 = _interopRequireDefault(require("../../styles/popup.less"));

// eslint-disable-next-line no-unused-vars
// handle messages from window.opener and iframe
var handleMessage = function handleMessage(event) {
  var data = event.data;
  if (!data) return; // This is message from the window.opener

  if (data.type === POPUP.INIT) {
    init(data.payload); // eslint-disable-line no-use-before-define

    return;
  } // ignore messages from origin other then parent.window or whitelisted


  var isMessagePort = event.target instanceof MessagePort || typeof BroadcastChannel !== 'undefined' && event.target instanceof BroadcastChannel;
  if (!isMessagePort && (0, _networkUtils.getOrigin)(event.origin) !== (0, _networkUtils.getOrigin)(document.referrer) && !_DataManager["default"].isWhitelisted(event.origin)) return; // catch first message from iframe

  if (data.type === POPUP.HANDSHAKE) {
    handshake(data.payload); // eslint-disable-line no-use-before-define

    return;
  }

  var message = (0, _message.parseMessage)(event.data);

  switch (message.type) {
    case UI.LOADING:
      // case UI.REQUEST_UI_WINDOW :
      (0, _common.showView)('loader');
      break;

    case UI.SET_OPERATION:
      if (typeof message.payload === 'string') {
        (0, _common.setOperation)(message.payload);
      }

      break;

    case UI.TRANSPORT:
      (0, _common.showView)('transport');
      break;

    case UI.SELECT_DEVICE:
      view.selectDevice(message.payload);
      break;

    case UI.SELECT_ACCOUNT:
      view.selectAccount(message.payload);
      break;

    case UI.SELECT_FEE:
      view.selectFee(message.payload);
      break;

    case UI.UPDATE_CUSTOM_FEE:
      view.updateCustomFee(message.payload);
      break;

    case UI.INSUFFICIENT_FUNDS:
      (0, _common.showView)('insufficient-funds');
      break;

    case UI.REQUEST_BUTTON:
      view.requestButton(message.payload);
      break;

    case UI.BOOTLOADER:
      (0, _common.showView)('bootloader');
      break;

    case UI.NOT_IN_BOOTLOADER:
      (0, _common.showView)('not-in-bootloader');
      break;

    case UI.INITIALIZE:
      (0, _common.showView)('initialize');
      break;

    case UI.SEEDLESS:
      (0, _common.showView)('seedless');
      break;

    case UI.FIRMWARE_NOT_INSTALLED:
      (0, _common.showView)('firmware-install');
      break;

    case UI.FIRMWARE_OLD:
      view.firmwareRequiredUpdate(message.payload);
      break;

    case UI.FIRMWARE_NOT_SUPPORTED:
      view.firmwareNotSupported(message.payload);
      break;

    case UI.FIRMWARE_NOT_COMPATIBLE:
      view.firmwareNotCompatible(message.payload);
      break;

    case UI.FIRMWARE_OUTDATED:
      (0, _notification.showFirmwareUpdateNotification)(message.payload);
      break;

    case UI.DEVICE_NEEDS_BACKUP:
      (0, _notification.showBackupNotification)(message.payload);
      break;

    case UI.REQUEST_PERMISSION:
      view.initPermissionsView(message.payload);
      break;

    case UI.REQUEST_CONFIRMATION:
      view.initConfirmationView(message.payload);
      break;

    case UI.REQUEST_PIN:
      view.initPinView(message.payload);
      break;

    case UI.REQUEST_WORD:
      view.initWordView(message.payload);
      break;

    case UI.INVALID_PIN:
      (0, _common.showView)('invalid-pin');
      break;

    case UI.REQUEST_PASSPHRASE:
      view.initPassphraseView(message.payload);
      break;

    case UI.REQUEST_PASSPHRASE_ON_DEVICE:
      view.passphraseOnDeviceView(message.payload);
      break;

    case UI.INVALID_PASSPHRASE:
      view.initInvalidPassphraseView(message.payload);
      break;
  }
}; // handle POPUP.INIT message from window.opener


var init = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(payload) {
    var settings, broadcastID;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (payload) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            settings = payload.settings;
            _context.prev = 3;
            _context.next = 6;
            return _DataManager["default"].load(settings, false);

          case 6:
            // initialize message channel
            broadcastID = settings.env + "-" + settings.timestamp;
            (0, _common.initMessageChannel)(broadcastID, handleMessage); // reset loading hash

            window.location.hash = ''; // handshake with iframe

            view.initBrowserView();
            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](3);
            (0, _common.postMessageToParent)((0, _builder.UiMessage)(POPUP.ERROR, {
              error: _context.t0
            }));

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 12]]);
  }));

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
}(); // handle POPUP.HANDSHAKE message from iframe


var handshake = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(payload) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (payload) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            // replace local settings with values from iframe (parent origin etc.)
            _DataManager["default"].settings = payload.settings;
            (0, _common.setOperation)(payload.method || '');

            if (payload.transport && payload.transport.outdated) {
              (0, _notification.showBridgeUpdateNotification)();
            }

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function handshake(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var onLoad = function onLoad() {
  // unsupported browser, this hash was set in parent app (PopupManager)
  // display message and do not continue
  if (window.location.hash === '#unsupported') {
    view.initBrowserView(false);
    return;
  }

  (0, _common.postMessageToParent)((0, _builder.UiMessage)(POPUP.LOADED));
};

window.addEventListener('load', onLoad, false);
window.addEventListener('message', handleMessage, false); // global method used in html-inline elements

window.closeWindow = function () {
  setTimeout(function () {
    window.postMessage({
      type: POPUP.CLOSE_WINDOW
    }, window.location.origin);
    window.close();
  }, 100);
};