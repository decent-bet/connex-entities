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
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const bignumber_js_1 = require("bignumber.js");
const Utils_1 = require("./Utils");
const BaseConnexContract_1 = require("./BaseConnexContract");
const ethereumRegex = require('ethereum-regex');
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
/**
 * Annotation that creates a Connex enabled contract
 * @param params contract parameters
 */
function ConnexContract(params) {
    return (constructor) => {
        applyMixins(constructor, [BaseConnexContract_1.OnConnexReady]);
        constructor.prototype.setContractImport(params.import);
        return constructor;
    };
}
exports.ConnexContract = ConnexContract;
function validate(params, values) {
    // Get keys
    const keys = Object.keys(params);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < values.length; i++) {
        // Obtain value and validation type from params
        const val = values[i];
        const validationType = params[keys[i]];
        if (validationType === 'address') {
            if (!ethereumRegex({ exact: true }).test(val)) {
                throw new Error(`Invalid adress type: parameter ${keys[i]}`);
            }
        }
        else if (validationType === 'bignumber') {
            if (!bignumber_js_1.BigNumber.isBigNumber(val)) {
                throw new Error(`Invalid bignumber type: parameter ${keys[i]}`);
            }
        }
        else {
            throw new Error(`Invalid string type: parameter ${keys[i]}`);
        }
    }
    return true;
}
function GetMethodSignature() {
    return (target, propertyKey, descriptor) => {
        descriptor.value = function () {
            const abiMethod = this.getAbiMethod(propertyKey, null);
            let temp = `${propertyKey}()`;
            const types = abiMethod.inputs.map((i) => i.type);
            if (types.length > 0) {
                temp = `${propertyKey}(${types.join(',')})`;
            }
            return Utils_1.AbiUtils.encodeFunctionSignature(temp);
        };
        return descriptor;
    };
}
exports.GetMethodSignature = GetMethodSignature;
function GetEventSignature() {
    return (target, propertyKey, descriptor) => {
        descriptor.value = function () {
            const abiMethod = this.getAbiMethod(propertyKey, null);
            let temp = `${propertyKey}()`;
            const types = abiMethod.inputs.map((i) => i.type);
            if (types.length > 0) {
                temp = `${propertyKey}(${types.join(',')})`;
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
function GetMethod(options = {}) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = function () {
            let addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            return this.getMethod(options.nameOrAbi || propertyKey, addr);
        };
        return descriptor;
    };
}
exports.GetMethod = GetMethod;
/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
function Read(options = {}) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                // Validate
                if (options.validations) {
                    validate(options.validations, args);
                }
                // Get address
                let addr = options.address;
                if (typeof options.address === 'function') {
                    addr = options.address();
                }
                // Get Method
                const call = this.getMethod(options.nameOrAbi || propertyKey, addr).call(...args);
                // Return response
                const view = options.returns || 'decoded';
                if (view && view !== 'all') {
                    const res = yield call;
                    return Object.assign({}, res[view]);
                }
                return call;
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
function Write(options = {}) {
    return (target, propertyKey, descriptor) => {
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                // Validate
                if (options.validations) {
                    validate(options.validations, args);
                }
                // Get address
                let addr = options.address;
                if (typeof options.address === 'function') {
                    addr = options.address();
                }
                const connex = this.connex;
                const signingService = connex.vendor.sign('tx');
                signingService.signer(this.defaultAccount);
                signingService.gas(options.gas || 80000); // Set maximum gas
                const method = this.getMethod(options.nameOrAbi || propertyKey, addr);
                let clause;
                clause = method.asClause(...args);
                return signingService.request([
                    Object.assign({ comment: `${propertyKey} write call` }, clause)
                ]);
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
function MultiClauseWrite(options = {}) {
    return (target, propertyKey, descriptor) => {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                // Validate
                if (options.validations) {
                    validate(options.validations, args);
                }
                // Get address
                let addr = options.address;
                if (typeof options.address === 'function') {
                    addr = options.address();
                }
                const connex = this.connex;
                const signingService = connex.vendor.sign('tx');
                signingService.signer(this.defaultAccount);
                signingService.gas(options.gas || 80000); // Set maximum gas
                const m = this.getMethod(options.nameOrAbi || propertyKey, addr);
                const thunk = original.apply(this, args);
                const signingReq = thunk(m);
                return signingService.request(signingReq);
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
    return (target, propertyKey, descriptor) => {
        descriptor.value = function () {
            let addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            return this.getEvent(options.nameOrAbi || propertyKey, addr);
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
    return (target, propertyKey, descriptor) => {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                let addr = options.address;
                if (typeof options.address === 'function') {
                    addr = options.address();
                }
                const eventInstance = this.getEvent(options.nameOrAbi || propertyKey, addr);
                let filter;
                // Read filter indexed parameters
                //      const opts = args[args.length - 1];
                //      const keys = Object.keys(opts.indexed);
                if (options.skipIndices) {
                    filter = eventInstance.filter([]);
                }
                else {
                    const arr = args[0];
                    // Validate
                    if (options.validations) {
                        validate(options.validations, arr);
                    }
                    // create filter
                    filter = eventInstance.filter(arr);
                }
                // apply filter and get thunk
                const thunk = original.apply(this, args);
                // poll if enabled
                if (options.interval) {
                    return rxjs_1.timer(0, options.interval).pipe(operators_1.switchMap(i => thunk(filter)));
                }
                // run once filter
                return thunk(filter);
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
    return (target, propertyKey, descriptor) => {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const filter = connex.thor.filter(options.kind);
                // apply filter and get thunk
                const thunk = original.apply(this, args);
                // poll if enabled
                if (options.interval) {
                    return rxjs_1.timer(0, options.interval).pipe(operators_1.switchMap(i => thunk(filter)));
                }
                // run once filter
                return thunk(filter);
            });
        };
        return descriptor;
    };
}
exports.BlockchainEventFilter = BlockchainEventFilter;
