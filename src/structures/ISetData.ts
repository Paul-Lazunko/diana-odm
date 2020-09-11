import { IGeo } from './IGeo';

export interface ISetData {
  [ key: string ]: string | string[] | number | number [] | boolean | boolean[] | IGeo | IGeo []
}
