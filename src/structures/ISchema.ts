import { Types } from '../constants';

export interface ISchema {
  [key: string]: {
    type: Types,
    items?: Types
    reference?: string
    isRequired?: boolean,
    isUnique?: true,
    isMutable?: boolean,
    default?: any,
    triggerRemove?: boolean
    ttl?: number,
  }
}
