import { abi } from 'thor-devkit';
import { IValidationParams, ConnexCallResponseEnums } from './types';
/**
 * Defines the Connex method and event call parameters
 */
export interface IConnexMethodOrEventCall {
  nameOrAbi?: abi.Event.Definition | abi.Function.Definition | string;
  address?: Function;
  gas?: number;
  returns?: ConnexCallResponseEnums;
  validations?: IValidationParams;
}
