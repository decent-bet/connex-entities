// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />

import { abi } from 'thor-devkit';
import { ContractImport } from './types';

/**
 * Implements Connex helpers used either directly or with Connex contract decorators
 */
export class ContractService {
  private abi: Array<abi.Function.Definition | abi.Event.Definition>;
  public defaultAccount: string;
  public connex: Connex;
  public chainTag: string;
  
  constructor(private contractImport: ContractImport) {
    if (contractImport.raw) {
      this.setAbi(contractImport.raw);
    }
  }

  __setConnexReady(connex: Connex, chainTag: string, defaultAccount: string) {
    this.connex = connex;
    this.chainTag = chainTag;
    this.defaultAccount = defaultAccount;
  }

  public setAbi(val: any) {
    this.abi = val.abi;
  }

  public getAbiMethod(
    name: string,
    address?: string
  ): object {
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
  public getMethod(
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
      methodAbi = this.abi.filter(i => i.name === methodNameOrAbi)[0] as abi.Function.Definition;
    }
    return acc.method(methodAbi as object);
  }

  /**
   * Gets a Connex Event object
   * @param address contract address
   * @param eventAbi event ABI
   */
  public getEvent(
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
      eventAbi = this.abi.filter(i => i.name === eventNameOrAbi)[0] as abi.Event.Definition;
    }
    return acc.event(eventAbi as object);
  }
}
