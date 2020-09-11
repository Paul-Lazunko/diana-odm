import {
  TQuery
} from '../constants';

export interface IQuery {
  [key: string]: any | any[] | TQuery
}
