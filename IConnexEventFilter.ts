import { abi } from 'thor-devkit';
import { IValidationParams } from './IValidationParams';
export interface IConnexEventFilter {
  nameOrAbi: abi.Event.Definition | abi.Function.Definition | string;
  address?: Function;
  interval?: number | null;
  validations?: IValidationParams;
}
