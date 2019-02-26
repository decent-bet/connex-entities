"use strict";
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
Object.defineProperty(exports, "__esModule", { value: true });
const ConnexService_1 = require("./ConnexService");
/**
 * Implements Connex helpers used either directly or with Connex contract decorators
 */
class ContractService {
    constructor(contractImport, chainTag) {
        this.contractImport = contractImport;
        this.chainTag = chainTag;
        if (contractImport.raw) {
            this.setAbi(contractImport.raw);
        }
    }
    getSigningService() {
        return ConnexService_1.ConnexService.getDefaultAccountSigningService();
    }
    setAddress(address) {
        this.address = address;
    }
    setAbi(val) {
        this.abi = val.abi;
    }
    /**
     * Gets a Connex Method object
     * @param address contract address
     * @param methodAbi method ABI
     */
    getMethod(methodNameOrAbi, address) {
        let addr;
        if (!address) {
            addr = this.contractImport.address[ConnexService_1.ConnexService.chainTag];
        }
        const acc = ConnexService_1.ConnexService.instance.thor.account(address || addr);
        let methodAbi = methodNameOrAbi;
        if (typeof methodNameOrAbi === 'string') {
            methodAbi = this.abi.filter(i => i.name === methodNameOrAbi)[0];
        }
        return acc.method(methodAbi);
    }
    /**
     * Gets a Connex Event object
     * @param address contract address
     * @param eventAbi event ABI
     */
    getEvent(eventNameOrAbi, address) {
        const acc = ConnexService_1.ConnexService.instance.thor.account(address || this.address);
        let eventAbi = eventNameOrAbi;
        if (typeof eventNameOrAbi === 'string') {
            eventAbi = this.abi.filter(i => i.name === eventNameOrAbi)[0];
        }
        return acc.event(eventAbi);
    }
}
exports.ContractService = ContractService;
