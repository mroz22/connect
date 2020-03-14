"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.firmwareNotCompatible = void 0;

var _builder = require("../../message/builder");

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

var firmwareNotCompatible = function firmwareNotCompatible(device) {
  var view = (0, _common.showView)('firmware-not-compatible');
  if (!device.features) return;
  var features = device.features;
  var fwVersion = view.getElementsByClassName('fw-version')[0];
  var identity = view.getElementsByClassName('fw-identity');
  var developer = _DataManager["default"].getSettings('hostLabel') || _DataManager["default"].getSettings('origin') || 'this application';
  var confirmButton = view.getElementsByClassName('confirm')[0];
  var cancelButton = view.getElementsByClassName('cancel')[0]; // h3.innerHTML = `${features.major_version === 1 ? 'Trezor One' : 'Trezor TTTT'} is not supported`;

  fwVersion.innerHTML = features.major_version + "." + features.minor_version + "." + features.patch_version;

  for (var i = 0; i < identity.length; i++) {
    identity[i].innerText = developer;
  }

  confirmButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_CONFIRMATION, true));
    (0, _common.showView)('loader');
  };

  cancelButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_CONFIRMATION, false));
    (0, _common.showView)('loader');
  };
};

exports.firmwareNotCompatible = firmwareNotCompatible;