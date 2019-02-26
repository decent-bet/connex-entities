"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
class CometService {
    /**
     * Allows external wallet access (boot time)
     */
    static requestExternalWalletAccess(comet, connex) {
        return () => rxjs_1.from(comet.enable())
            .pipe(operators_1.map(([publicAddress]) => publicAddress), operators_1.switchMap((publicAddress) => __awaiter(this, void 0, void 0, function* () {
            const _ = yield connex.thor.block(0).get();
            const { id } = connex.thor.genesis;
            const chainTag = `0x${id.substring(id.length - 2, id.length)}`;
            return { publicAddress, chainTag };
        })))
            .toPromise();
    }
}
exports.CometService = CometService;
