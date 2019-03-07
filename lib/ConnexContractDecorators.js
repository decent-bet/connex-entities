"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var bignumber_js_1 = require("bignumber.js");
var ContractService_1 = require("./ContractService");
var Utils_1 = require("./Utils");
var ethereumRegex = require('ethereum-regex');
/**
 * Annotation that creates a Connex enabled contract
 * @param params contract parameters
 */
function ConnexContract(params) {
    return function (constructor) {
        var c = /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.contractService = new ContractService_1.ContractService(params["import"]);
                return _this;
            }
            return class_1;
        }(constructor));
        return c;
    };
}
exports.ConnexContract = ConnexContract;
function validate(params, values) {
    // Get keys
    var keys = Object.keys(params);
    // eslint-disable-next-line no-plusplus
    for (var i = 0; i < values.length; i++) {
        // Obtain value and validation type from params
        var val = values[i];
        var validationType = params[keys[i]];
        if (validationType === 'address') {
            if (!ethereumRegex({ exact: true }).test(val)) {
                throw new Error("Invalid adress type: parameter " + keys[i]);
            }
        }
        else if (validationType === 'bignumber') {
            if (!bignumber_js_1.BigNumber.isBigNumber(val)) {
                throw new Error("Invalid bignumber type: parameter " + keys[i]);
            }
        }
        else {
            throw new Error("Invalid string type: parameter " + keys[i]);
        }
    }
    return true;
}
function GetMethodSignature() {
    return function (target, propertyKey, descriptor) {
        descriptor.value = function () {
            var abiMethod = this.contractService.getAbiMethod(propertyKey, null);
            var temp = propertyKey + "()";
            var types = abiMethod.inputs.map(function (i) { return i.type; });
            if (types.length > 0) {
                temp = propertyKey + "(" + types.join(',') + ")";
            }
            return Utils_1.AbiUtils.encodeFunctionSignature(temp);
        };
        return descriptor;
    };
}
exports.GetMethodSignature = GetMethodSignature;
function GetEventSignature() {
    return function (target, propertyKey, descriptor) {
        descriptor.value = function () {
            var abiMethod = this.contractService.getAbiMethod(propertyKey, null);
            var temp = propertyKey + "()";
            var types = abiMethod.inputs.map(function (i) { return i.type; });
            if (types.length > 0) {
                temp = propertyKey + "(" + types.join(',') + ")";
            }
            return Utils_1.AbiUtils.encodeEventSignature(temp);
        };
        return descriptor;
    };
}
exports.GetEventSignature = GetEventSignature;
/**
 * Annotates a Connex thor.method call
 * @param options An IConnexMethodOrEventCall props
 */
function GetMethod(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey, descriptor) {
        descriptor.value = function () {
            var addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            return this.contractService.getMethod(options.nameOrAbi || propertyKey, addr);
        };
        return descriptor;
    };
}
exports.GetMethod = GetMethod;
/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
function Read(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey, descriptor) {
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var _a, addr, call, view, res;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // Validate
                            if (options.validations) {
                                validate(options.validations, args);
                            }
                            addr = options.address;
                            if (typeof options.address === 'function') {
                                addr = options.address();
                            }
                            call = (_a = this.contractService
                                .getMethod(options.nameOrAbi || propertyKey, addr)).call.apply(_a, args);
                            view = options.returns || 'decoded';
                            if (!(view && view !== 'all')) return [3 /*break*/, 2];
                            return [4 /*yield*/, call];
                        case 1:
                            res = _b.sent();
                            return [2 /*return*/, __assign({}, res[view])];
                        case 2: return [2 /*return*/, call];
                    }
                });
            });
        };
        return descriptor;
    };
}
exports.Read = Read;
/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
function Write(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey, descriptor) {
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var _a, addr, signingService, clause;
                return __generator(this, function (_b) {
                    // Validate
                    if (options.validations) {
                        validate(options.validations, args);
                    }
                    addr = options.address;
                    if (typeof options.address === 'function') {
                        addr = options.address();
                    }
                    signingService = this.contractService.getSigningService();
                    signingService
                        .gas(options.gas || 80000); // Set maximum gas
                    clause = (_a = this.contractService
                        .getMethod(options.nameOrAbi || propertyKey, addr)).asClause.apply(_a, args);
                    return [2 /*return*/, signingService.request([
                            __assign({ comment: propertyKey + " write call" }, clause)
                        ])];
                });
            });
        };
        return descriptor;
    };
}
exports.Write = Write;
/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
function MultiClauseWrite(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey, descriptor) {
        var original = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var addr, signingService, m, thunk, signingReq;
                return __generator(this, function (_a) {
                    // Validate
                    if (options.validations) {
                        validate(options.validations, args);
                    }
                    addr = options.address;
                    if (typeof options.address === 'function') {
                        addr = options.address();
                    }
                    signingService = this.contractService.getSigningService();
                    signingService
                        .gas(options.gas || 80000); // Set maximum gas
                    m = this.contractService
                        .getMethod(options.nameOrAbi || propertyKey, addr);
                    thunk = original.apply(this, args);
                    signingReq = thunk(m);
                    return [2 /*return*/, signingService.request(signingReq)];
                });
            });
        };
        return descriptor;
    };
}
exports.MultiClauseWrite = MultiClauseWrite;
/**
 * Annotates a Connex thor.event
 * @param options An IConnexMethodOrEventCall props
 */
function GetEvent(options) {
    return function (target, propertyKey, descriptor) {
        descriptor.value = function () {
            var addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            return this.contractService.getEvent(options.nameOrAbi || propertyKey, addr);
        };
        return descriptor;
    };
}
exports.GetEvent = GetEvent;
/**
 * Annotates a Connex thor.event.filter
 * @param options An IConnexMethodOrEventCall props
 */
function AccountEventFilter(options) {
    return function (target, propertyKey, descriptor) {
        var original = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var addr, eventInstance, filter, arr, thunk;
                return __generator(this, function (_a) {
                    addr = options.address;
                    if (typeof options.address === 'function') {
                        addr = options.address();
                    }
                    eventInstance = this.contractService
                        .getEvent(options.nameOrAbi || propertyKey, addr);
                    // Read filter indexed parameters
                    //      const opts = args[args.length - 1];
                    //      const keys = Object.keys(opts.indexed);
                    if (options.skipIndices) {
                        filter = eventInstance.filter([]);
                    }
                    else {
                        arr = args[0];
                        // Validate
                        if (options.validations) {
                            validate(options.validations, arr);
                        }
                        // create filter
                        filter = eventInstance.filter(arr);
                    }
                    thunk = original.apply(this, args);
                    // poll if enabled
                    if (options.interval) {
                        return [2 /*return*/, rxjs_1.timer(0, options.interval).pipe(operators_1.switchMap(function (i) { return thunk(filter); }))];
                    }
                    // run once filter
                    return [2 /*return*/, thunk(filter)];
                });
            });
        };
        return descriptor;
    };
}
exports.AccountEventFilter = AccountEventFilter;
/**
 * Annotates a Connex thor.event.filter
 * @param options An IConnexMethodOrEventCall props
 */
function BlockchainEventFilter(options) {
    return function (target, propertyKey, descriptor) {
        var original = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var filter, thunk;
                return __generator(this, function (_a) {
                    filter = connex.thor.filter(options.kind);
                    thunk = original.apply(this, args);
                    // poll if enabled
                    if (options.interval) {
                        return [2 /*return*/, rxjs_1.timer(0, options.interval).pipe(operators_1.switchMap(function (i) { return thunk(filter); }))];
                    }
                    // run once filter
                    return [2 /*return*/, thunk(filter)];
                });
            });
        };
        return descriptor;
    };
}
exports.BlockchainEventFilter = BlockchainEventFilter;
