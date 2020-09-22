import { TBooleanQuery } from './TBooleanQuery';
import { TStringQuery } from './TStringQuery';
import { TNumberQuery } from './TNumberQuery';
import { IPointQuery, ITimeQuery } from '../structures';

export type TQuery = TBooleanQuery | TStringQuery | TNumberQuery | ITimeQuery | IPointQuery;
