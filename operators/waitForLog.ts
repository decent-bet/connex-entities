// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />

import { Observable, Observer } from 'rxjs';
import { blockConfirmationUntil } from './blockConfirmationUntil';
import { switchMap } from 'rxjs/operators';

export const waitForLog = (
    writeFn: Promise<Connex.Vendor.SigningService.TxResponse>,
    eventLogFn: Promise<any>
) =>
    Observable.create(async (observer: Observer<boolean>) => {
        // execute write fn
        const txResponse = await writeFn;
        const blockConfirmation = blockConfirmationUntil(txResponse.txid);

        // pipe eventLogFn
        const logs: any = await eventLogFn;
        blockConfirmation
            .pipe(switchMap(_ => logs))
            .subscribe(observer.next, observer.error, observer.complete);
    });
