/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BigNumber } from 'bignumber.js';
import { ContractService } from './ContractService';
import { IValidationType, INewConnexContract } from './types';
import { IConnexMethodOrEventCall } from './IConnexMethodOrEventCall';
import { IConnexEventFilter } from './IConnexEventFilter';
import { IConnexBlockchainEventFilter } from './IConnexBlockchainEventFilter';

const ethereumRegex = require('ethereum-regex');

/**
 * Annotation that creates a Connex enabled contract
 * @param params contract parameters
 */
export function ConnexContract(params: INewConnexContract) {
  return <T extends { new (...args: any[]): {} }>(constructor: T) => {
    const c = class extends constructor {
      contractService = new ContractService(params.import);
    };
    return c;
  };
}

function validate(params: { [key: string]: IValidationType }, values: any[]): boolean {
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
/**
 * Annotates a Connex thor.method call
 * @param options An IConnexMethodOrEventCall props
 */
export function GetMethod(options: IConnexMethodOrEventCall = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    descriptor.value = function () {
      let addr = options.address;
      if (typeof options.address === 'function') {
        addr = options.address();
      }
      return this.contractService.getMethod(options.nameOrAbi || propertyKey, addr) as Promise<
        Connex.Thor.VMOutput
      >;
    };
    return descriptor;
  };
}

/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
export function Read(options: IConnexMethodOrEventCall = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    descriptor.value = async function (...args: any[]) {
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
      const call = this.contractService
        .getMethod(options.nameOrAbi || propertyKey, addr)
        .call(...args);

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
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    descriptor.value = async function (...args: any[]) {
      // Validate
      if (options.validations) {
        validate(options.validations, args);
      }

      // Get address
      let addr = options.address;
      if (typeof options.address === 'function') {
        addr = options.address();
      }

      const signingService = this.contractService.getSigningService();

      signingService
        .gas(options.gas || 80000); // Set maximum gas

      const clause = this.contractService
        .getMethod(options.nameOrAbi || propertyKey, addr)
        .asClause(...args);
      return signingService.request([
        {
          comment: `${propertyKey} write call`,
          ...clause
        }]);
    };
    return descriptor;
  };
}

/**
 * Annotates a Connex thor.method.call
 * @param options An IConnexMethodOrEventCall props
 */
export function MultiClauseWrite(options: IConnexMethodOrEventCall = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // Validate
      if (options.validations) {
        validate(options.validations, args);
      }

      // Get address
      let addr = options.address;
      if (typeof options.address === 'function') {
        addr = options.address();
      }

      const signingService = this.contractService.getSigningService();

      signingService
        .gas(options.gas || 80000); // Set maximum gas

      const m = this.contractService
        .getMethod(options.nameOrAbi || propertyKey, addr);

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
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    descriptor.value = function () {
      let addr = options.address;
      if (typeof options.address === 'function') {
        addr = options.address();
      }
      return this.contractService.getEvent(options.nameOrAbi || propertyKey, addr) as Promise<
        Connex.Thor.VMOutput
      >;
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
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]): Promise<any> {
      let addr = options.address;
      if (typeof options.address === 'function') {
        addr = options.address();
      }
      const eventInstance = this.contractService
        .getEvent(options.nameOrAbi || propertyKey, addr);

      // Read filter indexed parameters
      //      const opts = args[args.length - 1];
      //      const keys = Object.keys(opts.indexed);
      const arr = args.slice(0, args.length - 2);

      // Validate
      if (options.validations) {
        validate(options.validations, arr);
      }

      // create filter
      const filter = eventInstance.filter(arr);

      // apply filter and get thunk
      const thunk = original.apply(this, args);

      // poll if enabled
      if (options.interval) {
        return timer(0, options.interval).pipe(switchMap(i => thunk(filter)));
      }

      // run once filter
      return thunk(filter);
    };
    return descriptor;
  };
}


/**
 * Annotates a Connex thor.event.filter
 * @param options An IConnexMethodOrEventCall props
 */
export function BlockchainEventFilter(options: IConnexBlockchainEventFilter) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]): Promise<any> {
      const filter = connex.thor.filter(options.kind);

      // apply filter and get thunk
      const thunk = original.apply(this, args);

      // poll if enabled
      if (options.interval) {
        return timer(0, options.interval).pipe(switchMap(i => thunk(filter)));
      }

      // run once filter
      return thunk(filter);
    };
    return descriptor;
  };
}