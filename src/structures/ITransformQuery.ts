import { IQuery } from "./IQuery";

interface IConcatString {
  delimiter: string,
  localField: string
}

interface IProjectionValue {
  $sum: any[],
  $subtract: any[],
  $divide: any[],
  $multiply: any[],
  $ifNull: any[],
  $push: any[],
  $addToSet: any[],
  $concatArray: any[],
  $first: string,
  $concatString: IConcatString,
  $year: string,
  $month: string,
  $date: string,
  $week: string,
  $hours: string,
  $minutes: string,
  $seconds: string,
  $dayOfWeek: string,
  $dayOfYear: string,
  $timestamp: string,
}


interface IProjection {
  [ key: string ] : string | IProjectionValue
}

interface IGroup extends IProjection {
  _id: string
}

interface ILookUp {
  collection: string,
  database:string,
  as: string,
  localField: string,
  foreignField:string,
  filter: IQuery
}

export interface ITransformQuery {
  $lookUp?: ILookUp,
  $unwind?: string,
  $group?: IGroup,
  $project?: IProjection,
  $replaceRoot?: string
  $match?: IQuery
}
