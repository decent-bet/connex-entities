import { ContractSetting } from "./types";

// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
export const ACCOUNT_CHANGES_INTERVAL = 1_000;

export class ConnexService {
  public static contractInstances: any = {};
  
  public static contracts<T>(name: string): T {
    return ConnexService.contractInstances[name] as T;
  }

  public static setupContracts(settings: ContractSetting[]): void {
    settings.forEach((s: ContractSetting) => {
      ConnexService.contractInstances[s.name] = new s.contract();
    });
  }  
}
