import { ContractSetting, IConnexContract } from "./types";
import { OnConnexReady } from "./BaseConnexContract";

// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
export const ACCOUNT_CHANGES_INTERVAL = 1_000;

export interface GeneriContractFn<T> {
  (arg: T): T;
}

export function identityContract<T>(arg: T): T {
  return arg;
}

export class ConnexService {
  public static contractInstances: any = {};
  
  public static getContract<T>(): T {
    const contractIdentity: GeneriContractFn<T> = identityContract;
    const items: string[] = Object.keys(ConnexService.contractInstances);
    const contractName = items.find((name) => name === contractIdentity.name);
    if (!contractName) {
      throw new Error(`Contract with type ${contractIdentity.name} not found`)
    }
    const instance = ConnexService.contractInstances[contractName] as T;
    return instance;
  }

  public static setupContracts(settings: ContractSetting[], 
                               chainTag: string, 
                               publicAddress: string): void {
    const { connex } = window as any;
    if (!connex) {
      throw new Error('Connext not found in window object.');
    }
    settings.forEach((i: { name: string | number; contract: new () => IConnexContract; }) => {
      const instance = new i.contract() as OnConnexReady;
      instance.onConnexReady(connex as Connex, chainTag, publicAddress);
      ConnexService.contractInstances[i.name] = instance;
    });
  }  
}
