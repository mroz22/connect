"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.selectAccount = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

var setHeader = function setHeader(payload) {
  var h3 = _common.container.getElementsByTagName('h3')[0];

  if (payload.type === 'end') {
    h3.innerHTML = "Select " + payload.coinInfo.label + " account";
  } else {
    h3.innerHTML = "Loading " + payload.coinInfo.label + " accounts...";
  }
};

var selectAccount = function selectAccount(payload) {
  if (!payload) return;
  var accountTypes = payload.accountTypes,
      accounts = payload.accounts; // first render
  // show "select-account" view
  // configure tabs

  if (Array.isArray(accountTypes)) {
    (0, _common.showView)('select-account'); // setHeader(payload);

    if (accountTypes.length > 1) {
      (function () {
        var tabs = _common.container.getElementsByClassName('tabs')[0];

        tabs.style.display = 'flex';

        var selectAccountContainer = _common.container.getElementsByClassName('select-account')[0];

        var buttons = tabs.getElementsByClassName('tab-selection');
        var button;

        var _loop = function _loop() {
          if (_isArray) {
            if (_i >= _iterator.length) return "break";
            button = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) return "break";
            button = _i.value;
          }

          var type = button.getAttribute('data-tab');

          if (type && accountTypes.indexOf(type) >= 0) {
            button.onclick = function (event) {
              selectAccountContainer.className = 'select-account ' + type;
            };
          } else {
            tabs.removeChild(button);
          }
        };

        for (var _iterator = buttons, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ret = _loop();

          if (_ret === "break") break;
        }
      })();
    } // return;

  } // set header


  setHeader(payload);
  if (!accounts) return;
  var buttons = {
    'normal': _common.container.querySelectorAll('.select-account-list.normal')[0],
    'segwit': _common.container.querySelectorAll('.select-account-list.segwit')[0],
    'legacy': _common.container.querySelectorAll('.select-account-list.legacy')[0]
  };

  var handleClick = function handleClick(event) {
    if (!(event.currentTarget instanceof HTMLElement)) return;
    var index = event.currentTarget.getAttribute('data-index');
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_ACCOUNT, parseInt(index)));
    (0, _common.showView)('loader');
  };

  var removeEmptyButton = function removeEmptyButton(buttonContainer) {
    var defaultButton = buttonContainer.querySelectorAll('.account-default')[0];

    if (defaultButton) {
      buttonContainer.removeChild(defaultButton);
    }
  };

  var updateButtonValue = function updateButtonValue(button, account) {
    if (button.innerHTML.length < 1) {
      button.innerHTML = "\n                <span class=\"account-title\"></span>\n                <span class=\"account-status\"></span>";
    }

    var title = button.getElementsByClassName('account-title')[0];
    var status = button.getElementsByClassName('account-status')[0];
    title.innerHTML = account.label; // TODO: Disable button once an account is fully loaded and its balance is 0

    if (typeof account.balance !== 'string') {
      status.innerHTML = 'Loading...';
      button.disabled = true;
    } else {
      status.innerHTML = account.empty ? 'New account' : account.balance;
      button.disabled = false;

      if (payload.preventEmpty) {
        button.disabled = account.empty === true;
      } else {
        button.disabled = false;
      }

      if (!button.disabled) {
        button.onclick = handleClick;
      }
    }
  };

  for (var _iterator2 = accounts.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref = _i2.value;
    }

    var _ref2 = _ref,
        index = _ref2[0],
        account = _ref2[1];
    var buttonContainer = buttons[account.type];
    var existed = buttonContainer.querySelectorAll("[data-index=\"" + index + "\"]")[0];

    if (!existed) {
      var button = document.createElement('button');
      button.className = 'list';
      button.setAttribute('data-index', index.toString());
      updateButtonValue(button, account);
      removeEmptyButton(buttonContainer);
      buttonContainer.appendChild(button);
    } else {
      updateButtonValue(existed, account);
    }
  }
};

exports.selectAccount = selectAccount;