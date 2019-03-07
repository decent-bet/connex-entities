"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
exports.ACCOUNT_CHANGES_INTERVAL = 1000;
class ConnexService {
    static contracts(name) {
        return ConnexService.contractInstances[name];
    }
    static setupContracts(settings) {
        settings.forEach((s) => {
            ConnexService.contractInstances[s.name] = new s.contract();
        });
    }
    static getDefaultAccountSigningService() {
        const signingService = ConnexService.instance.vendor.sign('tx');
        return signingService.signer(ConnexService.defaultAccount); // Enforce signer
    }
}
ConnexService.contractInstances = {};
exports.ConnexService = ConnexService;
