"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getLatestRelease = exports.checkFirmware = exports.parseFirmware = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rollout = require("@trezor/rollout");

var _releases;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// [] is weird flow hack https://github.com/facebook/flow/issues/380#issuecomment-224380551
var releases = (_releases = {}, _releases[1] = [], _releases[2] = [], _releases);

var parseFirmware = function parseFirmware(json, model) {
  var obj = json;
  Object.keys(obj).forEach(function (key) {
    var release = obj[key];
    releases[model].push(_objectSpread({}, release));
  });
};

exports.parseFirmware = parseFirmware;

var checkFirmware = function checkFirmware(features) {
  // indication that firmware is not installed at all. This information is set to false in bl mode. Otherwise it is null.
  if (features.firmware_present === false) {
    return 'none';
  } // for t1 in bootloader, what device reports as firmware version is in fact bootloader version, so we can
  // not safely tell firmware version


  if (features.major_version === 1 && features.bootloader_mode) {
    return 'unknown';
  }

  var info = (0, _rollout.getInfo)({
    features: features,
    releases: releases[features.major_version]
  }); // should not happen, possibly if releases list contains inconsistent data or so

  if (!info) return 'unknown'; //

  if (info.isRequired) {
    return 'required';
  }

  if (info.isNewer) {
    return 'outdated';
  }

  return 'valid';
};

exports.checkFirmware = checkFirmware;

var getLatestRelease = function getLatestRelease(features) {
  return (0, _rollout.getInfo)({
    features: features,
    releases: releases[features.major_version]
  });
};

exports.getLatestRelease = getLatestRelease;