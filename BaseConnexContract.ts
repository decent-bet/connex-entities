// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />

import { abi } from 'thor-devkit';
import { ContractImport, IConnexContract, IConnexOnReady } from './types';

/**
 * OnConnexReady implements call executed by plugin vendors to inject Connex
 */
export class OnConnexReady implements IConnexContract, IConnexOnReady {
    public defaultAccount: string;
    public connex: Connex;
    public chainTag: string;
    private abi: Array<abi.Function.Definition | abi.Event.Definition>;
    private contractImport: ContractImport;

    onConnexReady(connex: Connex, chainTag: string, defaultAccount: string) {
        this.connex = connex;
        this.chainTag = chainTag;
        this.defaultAccount = defaultAccount;
    }

    protected setContractImport(contractImport: ContractImport) {
        this.abi = contractImport.raw.abi as any;
        this.contractImport = contractImport;
    }

    protected getAbiMethod(name: string, address?: string): object {
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
    protected getMethod(
        methodNameOrAbi: abi.Function.Definition | string,
        address?: string
    ): Connex.Thor.Method {
        let addr;
        if (!address) {
            addr = this.contractImport.address[this.chainTag];
        }
        const acc = this.connex.thor.account(address || addr);
        let methodAbi: abi.Function.Definition | string = methodNameOrAbi;
        if (typeof methodNameOrAbi === 'string') {
            methodAbi = this.abi.filter(
                i => i.name === methodNameOrAbi
            )[0] as abi.Function.Definition;
        }
        return acc.method(methodAbi as object);
    }

    /**
     * Gets a Connex Event object
     * @param address contract address
     * @param eventAbi event ABI
     */
    protected getEvent(
        eventNameOrAbi: abi.Event.Definition | string,
        address?: string
    ): Connex.Thor.EventVisitor {
        let addr;
        if (!address) {
            addr = this.contractImport.address[this.chainTag];
        }
        const acc = this.connex.thor.account(address || addr);

        let eventAbi: abi.Event.Definition | string = eventNameOrAbi;
        if (typeof eventNameOrAbi === 'string') {
            eventAbi = this.abi.filter(
                i => i.name === eventNameOrAbi
            )[0] as abi.Event.Definition;
        }
        return acc.event(eventAbi as object);
    }
}
