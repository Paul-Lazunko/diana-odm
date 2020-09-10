import { EClientActions } from '../constants';
import { IQuery } from './IQuery';
import { ISchema } from './ISchema';

export interface IRequest {
  database: string,
  collection: string,
  action: EClientActions,
  requestId: string,
  filterQuery?: IQuery[],
  aggregationQuery?: any[],
  updateQuery?: any,
  sortQuery?: any,
  skip?: number,
  limit?: number,
  schema?: ISchema,
  transactionId?: string
  autoRollbackAfterMS?: number
}
