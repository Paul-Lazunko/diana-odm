import { randomStringGenerator } from '../helpers';
import { IRequest, IResponse } from '../structures';
import { IRequestOptions } from '../options/IRequestOptions';

export class Request {

  protected options: Partial<IRequestOptions>;

  constructor (requestOptions: Partial<IRequestOptions>) {
    const { connection, ...options} = requestOptions;
    this.options = requestOptions;
    this.options.requestId = randomStringGenerator(32, true);
  }

  public execute(): Promise<any> {
    const { connection, ...data } = this.options;
    return connection.handleRequest(data as IRequest);
  }

}
