import { Connection } from '../connection';
import { ISchema } from '../structures';

export interface IModelOptions {
  database: string,
  collection: string,
  schema: ISchema,
  connection: Connection
}
