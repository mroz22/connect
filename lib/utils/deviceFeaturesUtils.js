"use strict";

exports.__esModule = true;
exports.getUnavailableCapabilities = exports.parseCapabilities = exports.versionCompare = void 0;

var versionCompare = function versionCompare(a, b) {
  var pa = typeof a === 'string' ? a.split('.') : a;
  var pb = typeof b === 'string' ? b.split('.') : b;
  if (!Array.isArray(pa) || !Array.isArray(pb)) return 0;
  var i;

  for (i = 0; i < 3; i++) {
    var na = Number(pa[i]);
    var nb = Number(pb[i]);
    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!isNaN(na) && isNaN(nb)) return 1;
    if (isNaN(na) && !isNaN(nb)) return -1;
  }

  return 0;
}; // From protobuf


exports.versionCompare = versionCompare;
var CAPABILITIES = [undefined, 'Capability_Bitcoin', 'Capability_Bitcoin_like', 'Capability_Binance', 'Capability_Cardano', 'Capability_Crypto', 'Capability_EOS', 'Capability_Ethereum', 'Capability_Lisk', 'Capability_Monero', 'Capability_NEM', 'Capability_Ripple', 'Capability_Stellar', 'Capability_Tezos', 'Capability_U2F', 'Capability_Shamir', 'Capability_ShamirGroups', 'Capability_PassphraseEntry'];
var DEFAULT_CAPABILITIES_T1 = [1, 2, 5, 7, 8, 10, 12, 14];
var DEFAULT_CAPABILITIES_TT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

var parseCapabilities = function parseCapabilities(features) {
  if (!features) return []; // no features - no capabilities
  // needs to be "any" since Features.capabilities are declared as string[] but in fact it's a number[]

  var filter = function filter(c) {
    return CAPABILITIES[c] || 'Capability_Unknown_trezor-connect';
  }; // fallback for older firmware


  if (!features.capabilities || !features.capabilities.length) return features.major_version === 1 ? DEFAULT_CAPABILITIES_T1.map(filter) : DEFAULT_CAPABILITIES_TT.map(filter); // regular capabilities

  return features.capabilities.map(filter);
}; // TODO: support type


exports.parseCapabilities = parseCapabilities;

var getUnavailableCapabilities = function getUnavailableCapabilities(features, coins, support) {
  var capabilities = features.capabilities;
  var list = {};
  if (!capabilities) return list;
  var fw = [features.major_version, features.minor_version, features.patch_version]; // 1. check if Trezor has enabled capabilities

  var unavailable = coins.filter(function (info) {
    if (info.type === 'bitcoin') {
      if (info.name === 'Bitcoin' || info.name === 'Testnet') {
        return !capabilities.includes('Capability_Bitcoin');
      }

      return !capabilities.includes('Capability_Bitcoin_like');
    }

    if (info.type === 'ethereum') {
      return !capabilities.includes('Capability_Ethereum');
    }

    if (info.type === 'nem') {
      return !capabilities.includes('Capability_NEM');
    } // misc


    if (info.shortcut === 'BNB') return !capabilities.includes('Capability_Binance');
    if (info.shortcut === 'XRP' || info.shortcut === 'tXRP') return !capabilities.includes('Capability_Ripple');
    return !capabilities.includes("Capability_" + info.name);
  }); // add unavailable coins to list

  unavailable.forEach(function (info) {
    list[info.shortcut.toLowerCase()] = 'no-capability';
  }); // 2. check if firmware version is in range of CoinInfo.support

  var available = coins.filter(function (info) {
    return !unavailable.includes(info);
  });
  var key = "trezor" + features.major_version;
  available.forEach(function (info) {
    if (!info.support || typeof info.support[key] !== 'string') {
      list[info.shortcut.toLowerCase()] = 'no-support';
      unavailable.push(info);
    }

    if (versionCompare(info.support[key], fw) > 0) {
      list[info.shortcut.toLowerCase()] = 'update-required';
      unavailable.push(info);
    }
  }); // 3. check if firmware version is in range of excluded methods in "config.supportedFirmware"

  support.forEach(function (s) {
    if (s.min && versionCompare(s.min[fw[0] - 1], fw) > 0) {
      s.excludedMethods.forEach(function (m) {
        list[m] = s.coin || 'update-required';
      });
    }

    if (s.max && versionCompare(s.max[fw[0] - 1], fw) < 0) {
      s.excludedMethods.forEach(function (m) {
        list[m] = s.coin || 'trezor-connect-outdated';
      });
    }
  });
  return list;
};

exports.getUnavailableCapabilities = getUnavailableCapabilities;