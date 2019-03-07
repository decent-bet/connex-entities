"use strict";
exports.__esModule = true;
var js_sha3_1 = require("js-sha3");
exports.ETHER = Math.pow(1, 18);
var AbiUtils = /** @class */ (function () {
    function AbiUtils() {
    }
    AbiUtils.toHex = function (input) {
        // utf8 to latin1
        var s = unescape(encodeURIComponent(input));
        var h = '';
        for (var i = 0; i < s.length; i++) {
            h += s.charCodeAt(i).toString(16);
        }
        return '0x' + h;
    };
    AbiUtils.fromHex = function (input) {
        var h = input.replace('0x', '');
        var s = '';
        for (var i = 0; i < h.length; i += 2) {
            s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        return decodeURIComponent(escape(s));
    };
    AbiUtils.encodeFunctionSignature = function (functionName) {
        // if (functionName instanceof Object) {
        //     functionName = this.utils.jsonInterfaceMethodToString(functionName);
        // }
        return "0x" + js_sha3_1.sha3_256(functionName).slice(0, 10);
    };
    AbiUtils.encodeEventSignature = function (functionName) {
        // if (functionName instanceof Object) {
        //     functionName = this.utils.jsonInterfaceMethodToString(functionName);
        // }
        return "0x" + js_sha3_1.sha3_256(functionName);
    };
    return AbiUtils;
}());
exports.AbiUtils = AbiUtils;
