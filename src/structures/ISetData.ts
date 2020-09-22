import { IPoint } from './IPoint';

export interface ISetData {
  [ key: string ]: string | string[] | number | number [] | boolean | boolean[] | IPoint | IPoint []
}
