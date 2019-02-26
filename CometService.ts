import { map, switchMap, filter } from 'rxjs/operators';
import { from } from 'rxjs';

export class CometService {
  /**
   * Allows external wallet access (boot time)
   */
  public static requestExternalWalletAccess(comet: any, connex: any): () => Promise<any> {
    return (): Promise<any> => from(comet.enable())
      .pipe(
        map(([publicAddress]) => publicAddress),
        switchMap(async publicAddress => {
          const _ = await connex.thor.block(0).get();
          const { id } = connex.thor.genesis;
          const chainTag = `0x${id.substring(id.length - 2, id.length)}`;
          return { publicAddress, chainTag };
        })
      )
      .toPromise();
  }
}
