import { IResponse } from './IResponse';
import { ISortQuery } from './ISortQuery';

export interface IModel {

  insert: (data: any) => Promise<IResponse>
  find: (
    filterQueries: any | any[],
    transformQueries?:any[],
    sortQuery?: ISortQuery,
    skip?: number,
    limit?:number
  ) => Promise<IResponse>
  count: (filterQueries: any | any[], transformQueries?:any[]) => Promise<IResponse>
  update: (filterQueries: any | any[], updateData: any) => Promise<IResponse>
  remove: (filterQueries: any | any[])  => Promise<IResponse>,
  init: () => Promise<void>

}
