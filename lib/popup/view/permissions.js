"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.initPermissionsView = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var _common = require("./common");

var getPermissionText = function getPermissionText(permissionType, deviceName) {
  var text = '';

  switch (permissionType) {
    case 'read':
      text = 'Read public keys from Trezor device';
      break;

    case 'read-meta':
      text = 'Read metadata from Trezor device';
      break;

    case 'write':
      text = 'Prepare Trezor device for transaction and data signing';
      break;

    case 'write-meta':
      text = 'Write metadata to Trezor device';
      break;

    case 'management':
      text = 'Modify device settings';
      break;

    case 'custom-message':
      text = 'Run custom operations';
      break;
  }

  return text;
};

var getPermissionTooltipText = function getPermissionTooltipText(permissionType) {
  var text = '';

  switch (permissionType) {
    case 'read':
      text = 'Permission needed to load public information from your device.';
      break;

    case 'write':
      text = 'Permission needed to execute operations, such as composing a transaction, after your confirmation.';
      break;

    case 'management':
      text = 'Permission needed to change device settings, such as PIN, passphrase, label or seed.';
      break;

    case 'custom-message':
      text = 'Development tool. Use at your own risk. Allows service to send arbitrary data to your Trezor device.';
      break;
  }

  return text;
};

var createPermissionItem = function createPermissionItem(permissionText, tooltipText) {
  var permissionItem = document.createElement('div');
  permissionItem.className = 'permission-item'; // Tooltip

  if (tooltipText !== '') {
    var tooltip = (0, _common.createTooltip)(tooltipText);
    permissionItem.appendChild(tooltip);
  } //
  // Permission content (icon & text)


  var contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  var infoIcon = document.createElement('span');
  infoIcon.className = 'info-icon';
  var permissionTextSpan = document.createElement('span');
  permissionTextSpan.innerText = permissionText;
  contentDiv.appendChild(infoIcon);
  contentDiv.appendChild(permissionTextSpan);
  permissionItem.appendChild(contentDiv); //

  return permissionItem;
};

var initPermissionsView = function initPermissionsView(payload) {
  (0, _common.showView)('permissions');

  var h3 = _common.container.getElementsByTagName('h3')[0];

  var hostName = h3.getElementsByClassName('host-name')[0];

  var permissionsList = _common.container.getElementsByClassName('permissions-list')[0];

  var confirmButton = _common.container.getElementsByClassName('confirm')[0];

  var cancelButton = _common.container.getElementsByClassName('cancel')[0];

  var rememberCheckbox = _common.container.getElementsByClassName('remember-permissions')[0];

  hostName.innerText = _DataManager["default"].getSettings('hostLabel') || _DataManager["default"].getSettings('origin');

  if (payload && Array.isArray(payload.permissions)) {
    payload.permissions.forEach(function (p) {
      var permissionText = getPermissionText(p, payload.device.label);
      var tooltipText = getPermissionTooltipText(p);
      var permissionItem = createPermissionItem(permissionText, tooltipText);
      permissionsList.appendChild(permissionItem);
    });
  }

  confirmButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PERMISSION, {
      remember: rememberCheckbox && rememberCheckbox.checked,
      granted: true
    }));
    (0, _common.showView)('loader');
  };

  cancelButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PERMISSION, {
      remember: rememberCheckbox && rememberCheckbox.checked,
      granted: false
    }));
    (0, _common.showView)('loader');
  };

  rememberCheckbox.onchange = function (e) {
    confirmButton.innerText = e.target.checked ? 'Always allow for this service' : 'Allow once for this session';
  };
};

exports.initPermissionsView = initPermissionsView;