import { abi } from 'thor-devkit';
/**
 * Defines a importable contract
 */
export interface ContractImport {
    address: any;
    raw: {
        abi: object;
    };
}
export type ConnexCallResponseEnums =
    | 'data'
    | 'events'
    | 'transfers'
    | 'gasUsed'
    | 'reverted'
    | 'vmError'
    | 'decoded'
    | 'all';

export type IValidationType = 'address' | 'string' | 'bignumber';
export interface IValidationParams {
    [key: string]: IValidationType;
}
/**
 * Defines a new Connex contract constructor parameters
 */
export interface INewConnexContract {
    import: ContractImport;
}

export interface IConnexMethodOrEventCall {
    nameOrAbi?: abi.Event.Definition | abi.Function.Definition | string;
    address?: Function;
    gas?: number;
    returns?: ConnexCallResponseEnums;
    validations?: IValidationParams;
}

export interface IConnexEventFilter {
    nameOrAbi: abi.Event.Definition | abi.Function.Definition | string;
    address?: Function;
    interval?: number | null;
    validations?: IValidationParams;
    skipIndices?: boolean;
    blockConfirmationUntil?: number;
}

/**
 * Defines a Connex contract interface
 */
export interface IConnexContract {
    defaultAccount: string;
    connex: Connex;
    chainTag: string;
}
export interface IConnexOnReady {
    onConnexReady: (
        connex: Connex,
        chainTag: string,
        defaultAccount: string
    ) => void;
}
export interface IConnexBlockchainEventFilter {
    interval?: number | null;
    kind?: 'event' | 'transfer';
    blockConfirmationUntil?: number;
}

export interface ContractSetting {
    name: string;
    contract: any;
}
