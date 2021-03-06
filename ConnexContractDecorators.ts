/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
import { timer, Observable, from } from 'rxjs';
import { switchMap, repeat } from 'rxjs/operators';
import { BigNumber } from 'bignumber.js';
import {
    IValidationType,
    INewConnexContract,
    IConnexMethodOrEventCall,
    IConnexEventFilter,
    IConnexBlockchainEventFilter
} from './types';
import { AbiUtils } from './Utils';
import { OnConnexReady } from './BaseConnexContract';

const ethereumRegex = require('ethereum-regex');

function applyMixins(derivedCtor: any, baseCtors: any[]) {
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
export function ConnexContract(params: INewConnexContract) {
    return <T extends { new (...args: any[]): {} }>(constructor: T) => {
        applyMixins(constructor, [OnConnexReady]);
        constructor.prototype.setContractImport(params.import);

        return constructor;
    };
}

function validate(
    params: { [key: string]: IValidationType },
    values: any[]
): boolean {
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
        } else if (validationType === 'bignumber') {
            if (!BigNumber.isBigNumber(val)) {
                throw new Error(`Invalid bignumber type: parameter ${keys[i]}`);
            }
        } else {
            throw new Error(`Invalid string type: parameter ${keys[i]}`);
        }
    }

    return true;
}

export function GetMethodSignature() {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        descriptor.value = function() {
            const abiMethod = this.getAbiMethod(propertyKey, null);

            let temp = `${propertyKey}()`;
            const types = abiMethod.inputs.map((i: any) => i.type);
            if (types.length > 0) {
                temp = `${propertyKey}(${types.join(',')})`;
            }

            return AbiUtils.encodeFunctionSignature(temp);
        };
        return descriptor;
    };
}

export function GetEventSignature() {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        descriptor.value = function() {
            const abiMethod = this.getAbiMethod(propertyKey, null);

            let temp = `${propertyKey}()`;
            const types = abiMethod.inputs.map((i: any) => i.type);
            if (types.length > 0) {
                temp = `${propertyKey}(${types.join(',')})`;
            }

            return AbiUtils.encodeEventSignature(temp);
        };
        return descriptor;
    };
}

/**
 * Annotates a Connex thor.method call
 * @param options An IConnexMethodOrEventCall props
 */
export function GetMethod(options: IConnexMethodOrEventCall = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        descriptor.value = function() {
            let addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            return this.getMethod(
                options.nameOrAbi || propertyKey,
                addr
            ) as Promise<Connex.Thor.VMOutput>;
        };
        return descriptor;
    };
}

/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
export function Read(options: IConnexMethodOrEventCall = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        descriptor.value = async function(...args: any[]) {
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
            const call = this.getMethod(
                options.nameOrAbi || propertyKey,
                addr
            ).call(...args);

            // Return response
            const view = options.returns || 'decoded';
            if (view && view !== 'all') {
                const res = await call;
                return { ...res[view] };
            }
            return call;
        };
        return descriptor;
    };
}

/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
export function Write(options: IConnexMethodOrEventCall = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        descriptor.value = async function(...args: any[]) {
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

            const method = this.getMethod(
                options.nameOrAbi || propertyKey,
                addr
            );

            let clause;
            clause = method.asClause(...args);

            return signingService.request([
                {
                    comment: `${propertyKey} write call`,
                    ...clause
                }
            ]);
        };
        return descriptor;
    };
}

/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
export function MultiClauseWrite(options: IConnexMethodOrEventCall = {}) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        const original = descriptor.value;
        descriptor.value = async function(...args: any[]) {
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

            const signingReq: Connex.Vendor.SigningService.TxMessage = thunk(m);
            return signingService.request(signingReq);
        };
        return descriptor;
    };
}

/**
 * Annotates a Connex thor.event
 * @param options An IConnexMethodOrEventCall props
 */
export function GetEvent(options: IConnexMethodOrEventCall) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        descriptor.value = function() {
            let addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            return this.getEvent(
                options.nameOrAbi || propertyKey,
                addr
            ) as Promise<Connex.Thor.VMOutput>;
        };
        return descriptor;
    };
}

export interface AccountEventFilterOptions {
    from: any;
    to: any;
}
/**
 * Annotates a Connex thor.event.filter
 * @param options An IConnexMethodOrEventCall props
 */
export function AccountEventFilter(options: IConnexEventFilter) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        const original = descriptor.value;
        descriptor.value = async function(
            ...args: any[]
        ): Promise<any | Observable<any>> {
            let blockConfirmationCycles = options.blockConfirmationUntil || 12;
            const blockConfirmation = this.connex.thor.ticker().next();

            let addr = options.address;
            if (typeof options.address === 'function') {
                addr = options.address();
            }
            const eventInstance = this.getEvent(
                options.nameOrAbi || propertyKey,
                addr
            );

            let filter: object;
            // Read filter indexed parameters
            if (options.skipIndices) {
                filter = eventInstance.filter([]);
            } else {
                const arr = args[0] as Array<any>;

                // Validate
                if (options.validations) {
                    validate(options.validations, arr);
                }

                // create filter
                filter = eventInstance.filter(arr);
            }
            // apply filter and get thunk
            const thunk: (arg: any) => Promise<any> = original.apply(
                this,
                args
            );

            // poll if enabled
            if (options.interval && options.blockConfirmationUntil === null) {
                return timer(0, options.interval).pipe(
                    switchMap(i => thunk(filter))
                ) as Observable<any>;
            } else {
                return from(blockConfirmation).pipe(
                    repeat(blockConfirmationCycles),
                    switchMap(_ => thunk(filter))
                );
            }
        };
        return descriptor;
    };
}

/**
 * Annotates a Connex thor.event.filter
 * @param options An IConnexMethodOrEventCall props
 */
export function BlockchainEventFilter(options: IConnexBlockchainEventFilter) {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        const original = descriptor.value;
        descriptor.value = async function(...args: any[]): Promise<any | Observable<any>>  {
            const filter = connex.thor.filter(options.kind);
            let blockConfirmationCycles = options.blockConfirmationUntil || 12;
            const blockConfirmation = connex.thor.ticker().next();

            // apply filter and get thunk
            const thunk: (arg: any) => Promise<any> = original.apply(
                this,
                args
            );
            // poll if enabled
            if (options.interval && options.blockConfirmationUntil === null) {
                return timer(0, options.interval).pipe(
                    switchMap(i => thunk(filter))
                ) as Observable<any>;
            } else {
                return from(blockConfirmation).pipe(
                    repeat(blockConfirmationCycles),
                    switchMap(_ => thunk(filter))
                );
            }
        };
        return descriptor;
    };
}
