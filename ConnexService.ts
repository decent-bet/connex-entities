// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
export const ACCOUNT_CHANGES_INTERVAL = 1_000;

export class ConnexService {
  public static instance: Connex;

  public static defaultAccount: string;

  public static chainTag: string;

  public static getDefaultAccountSigningService(): Connex.Vendor.TxSigningService {
    const signingService = ConnexService.instance.vendor.sign('tx');

    return signingService.signer(ConnexService.defaultAccount); // Enforce signer
  }
}
