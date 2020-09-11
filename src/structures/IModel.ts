import { IQuery } from "./IQuery";
import { ISetData } from "./ISetData";
import { ISortQuery } from './ISortQuery';
import { ITransformQuery } from "./ITransformQuery";

export interface IModel {

  insert: (data: ISetData) => Promise<any>
  find: (
    filterQueries: IQuery | IQuery[],
    transformQueries?:ITransformQuery[],
    sortQuery?: ISortQuery,
    skip?: number,
    limit?:number
  ) => Promise<any[]>
  count: (filterQueries: IQuery | IQuery[], transformQueries?:any[]) => Promise<any>
  update: (filterQueries: IQuery | IQuery[], updateData: ISetData) => Promise<any>
  remove: (filterQueries: IQuery | IQuery[])  => Promise<any>,
  init: () => Promise<void>

}
