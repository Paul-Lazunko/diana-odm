import { EClientActions } from '../constants';

export interface ISubscriberHandlerParams {
  database: string;
  collection: string;
  action: EClientActions;
  affectedId: string[],
}
