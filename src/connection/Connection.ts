import { EventEmitter } from 'events';
import { Socket } from 'net';
import { EServerActions } from '../constants';
import { CryptoHelper } from '../helpers';
import { IClientOptions } from '../options';
import { ISubscriberHandlerParams } from '../params';
import { IRequest, IResponse } from '../structures';
import { Subscriber } from '../subscriber/Subscriber';

export class Connection {
  public isConnected: boolean;
  private socket: Socket;
  private eventEmitter: EventEmitter;
  private options: IClientOptions;
  private isStarted: boolean;
  private timeouts: Map<string, NodeJS.Timer>;
  private rawDataString: string;
  private reconnectTimeout: any;
  public transactionId: string;
  protected subscriber: Subscriber;

  constructor(options: IClientOptions) {
    this.options = options;
    this.rawDataString = '';
    this.timeouts = new Map<string, any>();
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.addListener('reconnect', () => {
      // @ts-ignore
      if ( this.isStarted && ! this.reconnectTimeout  ) {
        this.setSocket();
        this.reconnectTimeout = setTimeout(()=> {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = undefined;
          this.socket.connect({ host: options.host, port: options.port  });
        }, options.reconnectInterval)
      }
    });
  }

  protected setSocket() {
    this.socket = new Socket();
    this.socket.addListener('connect', () => {
      this.isConnected = true;
      this.eventEmitter.emit('connect')
    });
    this.socket.on('data',  this.onData.bind(this));
    this.socket.on('error',  (error) => {
      this.eventEmitter.emit('reconnect')
    });
    this.socket.addListener('close', () => {
      this.isConnected = false;
      if ( this.options.doReconnectOnClose ) {
        this.eventEmitter.emit('reconnect')
      }
    });
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.setSocket();
      this.isStarted = true;
      this.socket.connect({ host: this.options.host, port: this.options.port  });
      this.eventEmitter.on('connect', () => {
        resolve();
      });
      this.socket.addListener('error', (error: any) => {
        reject(error);
      });
    })
  }

  public disconnect(): void {
    this.isStarted = false;
    this.socket.destroy();
  }

  private onData(data: string): void {
    let response: any;
    try {
      const decryptedData: string = this.rawDataString.length ? CryptoHelper.decrypt(this.options.secureKey, this.rawDataString + data.toString()) : CryptoHelper.decrypt(this.options.secureKey, data.toString());
      response = JSON.parse(decryptedData);
      const { requestId, action } = response;
      if ( action === EServerActions.RESPONSE ) {
        const hasError: boolean = response.hasOwnProperty('error');
        if ( hasError ) {
          this.eventEmitter.emit(`error-${requestId}`, response.error);
        } else {
          this.eventEmitter.emit(`response-${requestId}`, response.data);
        }
        clearTimeout(this.timeouts.get(requestId));
        this.timeouts.delete(requestId);
        this.rawDataString = '';
      } else if (action === EServerActions.PUBLISH) {
        if ( this.subscriber instanceof Subscriber) {
          this.subscriber.process(response.data as ISubscriberHandlerParams);
        }
      }
    } catch(e) {
      this.rawDataString += data.toString();
    }
  }

  public handleRequest(request: IRequest): Promise<IResponse> {
    const { requestId } = request;
    return new Promise((resolve, reject) => {
      this.timeouts.set(requestId, setTimeout(() => {
        reject(new Error(`000 - Request failed by timeout ${this.options.requestTimeout} ms`));
        this.eventEmitter.removeAllListeners(`response-${requestId}`);
      }, this.options.requestTimeout));
      this.eventEmitter.addListener(`response-${requestId}`, (data: any) => {
        this.eventEmitter.removeAllListeners(`response-${requestId}`);
        this.eventEmitter.removeAllListeners(`error-${requestId}`);
        return resolve(data);
      });
      this.eventEmitter.addListener(`error-${requestId}`, (error: string) => {
        this.eventEmitter.removeAllListeners(`response-${requestId}`);
        this.eventEmitter.removeAllListeners(`error-${requestId}`);
        return reject(new Error(error));
      });
      this.write(request);
    })
  }

  private write(request: IRequest):void {
    const data = CryptoHelper.encrypt(this.options.secureKey, JSON.stringify(request));
    this.socket.write(data);
  }

  setSubscriber(subscriber: Subscriber) {
    this.subscriber = subscriber;
  }

}
