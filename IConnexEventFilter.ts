import { abi } from 'thor-devkit';
import { IValidationParams } from './types';
export interface IConnexEventFilter {
  nameOrAbi: abi.Event.Definition | abi.Function.Definition | string;
  address?: Function;
  interval?: number | null;
  validations?: IValidationParams;
}
