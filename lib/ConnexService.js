"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
exports.ACCOUNT_CHANGES_INTERVAL = 1000;
class ConnexService {
    static getDefaultAccountSigningService() {
        const signingService = ConnexService.instance.vendor.sign('tx');
        return signingService.signer(ConnexService.defaultAccount); // Enforce signer
    }
}
exports.ConnexService = ConnexService;
