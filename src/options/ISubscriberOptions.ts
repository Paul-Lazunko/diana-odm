import { ISubscriberHandlerParams } from '../params';

export interface ISubscriberOptions {
  handler: (data: ISubscriberHandlerParams) => void | Promise<void>
}
