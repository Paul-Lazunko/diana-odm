import { ISubscriberOptions } from '../options';
import { ISubscriberHandlerParams } from '../params';

export class Subscriber {

  protected handler: (data: ISubscriberHandlerParams) => void | Promise<void>;

  constructor(options: ISubscriberOptions) {
    this.handler = options.handler;
  }

  public process(data: ISubscriberHandlerParams) {
    return this.handler(data);
  }

}
