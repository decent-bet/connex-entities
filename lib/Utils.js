"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha3_1 = require("js-sha3");
exports.ETHER = 1 ** 18;
class AbiUtils {
    static toHex(input) {
        // utf8 to latin1
        const s = unescape(encodeURIComponent(input));
        let h = '';
        for (let i = 0; i < s.length; i++) {
            h += s.charCodeAt(i).toString(16);
        }
        return '0x' + h;
    }
    static fromHex(input) {
        const h = input.replace('0x', '');
        let s = '';
        for (let i = 0; i < h.length; i += 2) {
            s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        return decodeURIComponent(escape(s));
    }
    static encodeFunctionSignature(functionName) {
        // if (functionName instanceof Object) {
        //     functionName = this.utils.jsonInterfaceMethodToString(functionName);
        // }
        return `0x${js_sha3_1.sha3_256(functionName).slice(0, 10)}`;
    }
    static encodeEventSignature(functionName) {
        // if (functionName instanceof Object) {
        //     functionName = this.utils.jsonInterfaceMethodToString(functionName);
        // }
        return `0x${js_sha3_1.sha3_256(functionName)}`;
    }
}
exports.AbiUtils = AbiUtils;
