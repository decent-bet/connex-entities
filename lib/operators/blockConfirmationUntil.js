"use strict";
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
exports.blockConfirmationUntil = (transactionId) => rxjs_1.Observable.create((observer) => __awaiter(this, void 0, void 0, function* () {
    let block = yield connex.thor.block().get();
    let hasBlock = block.transactions.indexOf(transactionId) > -1;
    while (!hasBlock) {
        yield connex.thor.ticker().next();
        block = yield connex.thor.block().get();
        hasBlock = block.transactions.indexOf(transactionId) > -1;
    }
    observer.next(hasBlock);
    observer.complete();
}));
