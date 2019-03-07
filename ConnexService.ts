import { ContractSetting } from "./types";

// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
export const ACCOUNT_CHANGES_INTERVAL = 1_000;

export class ConnexService {
  public static contractInstances: any = {};
  
  public static instance: Connex;

  public static defaultAccount: string;

  public static chainTag: string;

  public static contracts<T>(name: string): T {
    return ConnexService.contractInstances[name] as T;
  }

  public static setupContracts(settings: ContractSetting[]): void {
    settings.forEach((s: ContractSetting) => {
      ConnexService.contractInstances[s.name] = new s.contract();
    });
  }

  public static getDefaultAccountSigningService(): Connex.Vendor.TxSigningService {
    const signingService = ConnexService.instance.vendor.sign('tx');

    return signingService.signer(ConnexService.defaultAccount); // Enforce signer
  }
}
