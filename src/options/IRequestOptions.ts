import { Connection } from '../connection';
import { EClientActions } from '../constants';
import { IQuery, ISchema } from '../structures/';

export interface IRequestOptions {
  connection: Connection,
  database: string,
  collection: string,
  action: EClientActions,
  requestId: string
  filterQueries?: IQuery[],
  transformQueries?: any[],
  updateQuery?: any,
  sortQuery?: any,
  skip?: number,
  limit?: number,
  schema?: ISchema,
  transactionId?: string
  autoRollbackAfterMS?: number,
  migration?: string
}
