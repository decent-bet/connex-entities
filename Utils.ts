import { sha3_256 } from 'js-sha3';

export const ETHER = 1 ** 18;

export class AbiUtils {
    static toHex(input: string) {
        // utf8 to latin1
        const s = unescape(encodeURIComponent(input));
        let h = '';
        for (let i = 0; i < s.length; i++) {
            h += s.charCodeAt(i).toString(16);
        }
        return '0x' + h;
    }

    static fromHex(input: string) {
        const h = input.replace('0x', '');
        let s = '';
        for (let i = 0; i < h.length; i += 2) {
            s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        return decodeURIComponent(escape(s));
    }

    static encodeFunctionSignature(functionName: string) {
        // if (functionName instanceof Object) {
        //     functionName = this.utils.jsonInterfaceMethodToString(functionName);
        // }

        return `0x${sha3_256(functionName).slice(0, 10)}`;
    }

    static encodeEventSignature(functionName: string) {
        // if (functionName instanceof Object) {
        //     functionName = this.utils.jsonInterfaceMethodToString(functionName);
        // }

        return `0x${sha3_256(functionName)}`;
    }
}
