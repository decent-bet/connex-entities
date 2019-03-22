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
const blockConfirmationUntil_1 = require("./blockConfirmationUntil");
const operators_1 = require("rxjs/operators");
/**
 * waitForLog operators takes a contract write function and an event log function and waits until confirmation to return logs back
 * @param writeFn
 * @param eventLogFn
 */
exports.waitForLog = (writeFn, eventLogFn) => rxjs_1.Observable.create((observer) => __awaiter(this, void 0, void 0, function* () {
    // execute write fn
    const txResponse = yield writeFn;
    const blockConfirmation = blockConfirmationUntil_1.blockConfirmationUntil(txResponse.txid);
    // pipe eventLogFn
    const logs = yield eventLogFn;
    blockConfirmation.pipe(operators_1.switchMap(_ => logs)).subscribe(observer.next, (e) => observer.error, () => {
        observer.complete();
    });
}));
