"use strict";
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
exports.__esModule = true;
var ConnexService_1 = require("./ConnexService");
/**
 * Implements Connex helpers used either directly or with Connex contract decorators
 */
var ContractService = /** @class */ (function () {
    function ContractService(contractImport, chainTag) {
        this.contractImport = contractImport;
        this.chainTag = chainTag;
        if (contractImport.raw) {
            this.setAbi(contractImport.raw);
        }
    }
    ContractService.prototype.getSigningService = function () {
        return ConnexService_1.ConnexService.getDefaultAccountSigningService();
    };
    ContractService.prototype.setAddress = function (address) {
        this.address = address;
    };
    ContractService.prototype.setAbi = function (val) {
        this.abi = val.abi;
    };
    ContractService.prototype.getAbiMethod = function (name, address) {
        var addr;
        if (!address) {
            addr = this.contractImport.address[ConnexService_1.ConnexService.chainTag];
        }
        var acc = ConnexService_1.ConnexService.instance.thor.account(address || addr);
        return this.abi.filter(function (i) { return i.name === name; })[0];
    };
    /**
     * Gets a Connex Method object
     * @param address contract address
     * @param methodAbi method ABI
     */
    ContractService.prototype.getMethod = function (methodNameOrAbi, address) {
        var addr;
        if (!address) {
            addr = this.contractImport.address[ConnexService_1.ConnexService.chainTag];
        }
        var acc = ConnexService_1.ConnexService.instance.thor.account(address || addr);
        var methodAbi = methodNameOrAbi;
        if (typeof methodNameOrAbi === 'string') {
            methodAbi = this.abi.filter(function (i) { return i.name === methodNameOrAbi; })[0];
        }
        return acc.method(methodAbi);
    };
    /**
     * Gets a Connex Event object
     * @param address contract address
     * @param eventAbi event ABI
     */
    ContractService.prototype.getEvent = function (eventNameOrAbi, address) {
        var addr;
        if (!address) {
            addr = this.contractImport.address[ConnexService_1.ConnexService.chainTag];
        }
        var acc = ConnexService_1.ConnexService.instance.thor.account(address || addr);
        var eventAbi = eventNameOrAbi;
        if (typeof eventNameOrAbi === 'string') {
            eventAbi = this.abi.filter(function (i) { return i.name === eventNameOrAbi; })[0];
        }
        return acc.event(eventAbi);
    };
    return ContractService;
}());
exports.ContractService = ContractService;
