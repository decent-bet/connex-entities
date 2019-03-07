"use strict";
exports.__esModule = true;
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
exports.ACCOUNT_CHANGES_INTERVAL = 1000;
var ConnexService = /** @class */ (function () {
    function ConnexService() {
    }
    ConnexService.contracts = function (name) {
        return ConnexService.contractInstances[name];
    };
    ConnexService.setupContracts = function (settings) {
        settings.forEach(function (s) {
            ConnexService.contractInstances[s.name] = new s.contract();
        });
    };
    ConnexService.getDefaultAccountSigningService = function () {
        var signingService = ConnexService.instance.vendor.sign('tx');
        return signingService.signer(ConnexService.defaultAccount); // Enforce signer
    };
    ConnexService.contractInstances = {};
    return ConnexService;
}());
exports.ConnexService = ConnexService;
