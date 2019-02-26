/**
 * Defines a importable contract
 */
export interface ContractImport {
    address: any;
    raw: {
      abi: object;
    };
  }
export type ConnexCallResponseEnums = 'data' | 'events' | 'transfers' | 'gasUsed' | 'reverted' | 'vmError' | 'decoded' | 'all';
  
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
