// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />

import { Observable, Observer } from 'rxjs';

export const blockConfirmationUntil = (transactionId: string) =>
    Observable.create(async (observer: Observer<boolean>) => {
        let block: Connex.Thor.Block = await connex.thor.block().get();
        let hasBlock = block.transactions.indexOf(transactionId) > -1;
        while (!hasBlock) {
            await connex.thor.ticker().next();
            block = await connex.thor.block().get();
            hasBlock = block.transactions.indexOf(transactionId) > -1;
        }
        observer.next(hasBlock);
        observer.complete();
    });
