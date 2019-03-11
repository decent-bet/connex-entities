"use strict";
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * OnConnexReady implements call executed by plugin vendors to inject Connex
 */
class OnConnexReady {
    onConnexReady(connex, chainTag, defaultAccount) {
        this.connex = connex;
        this.chainTag = chainTag;
        this.defaultAccount = defaultAccount;
    }
}
exports.OnConnexReady = OnConnexReady;
/**
 * BaseConnexContract is a mixin injected by ConnexContract decorator
 */
class BaseConnexContract {
    constructor(contractImport) {
        this.contractImport = contractImport;
        if (contractImport && contractImport.raw) {
            this.setAbi(contractImport.raw);
        }
    }
    setAbi(val) {
        this.abi = val.abi;
    }
    getAbiMethod(name, address) {
        let addr;
        if (!address) {
            addr = this.contractImport.address[this.chainTag];
        }
        const acc = this.connex.thor.account(address || addr);
        return this.abi.filter(i => i.name === name)[0];
    }
    /**
     * Gets a Connex Method object
     * @param address contract address
     * @param methodAbi method ABI
     */
    getMethod(methodNameOrAbi, address) {
        let addr;
        if (!address) {
            addr = this.contractImport.address[this.chainTag];
        }
        const acc = this.connex.thor.account(address || addr);
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
        let addr;
        if (!address) {
            addr = this.contractImport.address[this.chainTag];
        }
        const acc = this.connex.thor.account(address || addr);
        let eventAbi = eventNameOrAbi;
        if (typeof eventNameOrAbi === 'string') {
            eventAbi = this.abi.filter(i => i.name === eventNameOrAbi)[0];
        }
        return acc.event(eventAbi);
    }
}
exports.BaseConnexContract = BaseConnexContract;
