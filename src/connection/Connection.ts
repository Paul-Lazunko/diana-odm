import { EventEmitter } from 'events';
import { Socket } from 'net';
import { EClientActions, EServerActions } from '../constants';
import { CryptoHelper } from '../helpers';
import { IClientOptions } from '../options';
import { ISubscriberHandlerParams } from '../params';
import { IRequest, IResponse } from '../structures';
import { Subscriber } from '../subscriber';

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
    let dataString: string = data.toString();
    let dataStringGroup: string[] = [];
    if ( dataString.match('\n') ) {
      dataStringGroup = dataString.split('\n');
    }
    for (let i=0; i < dataStringGroup.length; i = i + 1) {
      try {
        let decryptedData: string = this.rawDataString.length ? CryptoHelper.decrypt(this.options.secureKey, this.rawDataString + dataStringGroup[i]) : CryptoHelper.decrypt(this.options.secureKey, dataStringGroup[i]);
        response = JSON.parse(decryptedData);
        const { requestId, action } = response;
        this.rawDataString = '';
        if ( action === EServerActions.RESPONSE ) {
          const hasError: boolean = response.hasOwnProperty('error');
          if ( hasError ) {
            this.eventEmitter.emit(`error-${requestId}`, response.error);
          } else {
            this.eventEmitter.emit(`response-${requestId}`, response);
          }
          clearTimeout(this.timeouts.get(requestId));
          this.timeouts.delete(requestId);
        } else if (action === EServerActions.PUBLISH) {
          if ( this.subscriber instanceof Subscriber) {
            this.subscriber.process(response.data as ISubscriberHandlerParams);
          }
        }
      } catch(e) {
        this.rawDataString += dataStringGroup[i];
      }
    }

  }

  public handleRequest(request: IRequest): Promise<Partial<IResponse>> {
    const { requestId, action } = request;
    return new Promise((resolve, reject) => {
      this.timeouts.set(requestId, setTimeout(() => {
        reject(new Error(`000 - Request failed by timeout ${this.options.requestTimeout} ms`));
        this.eventEmitter.removeAllListeners(`response-${requestId}`);
      }, this.options.requestTimeout));
      this.eventEmitter.addListener(`response-${requestId}`, (response: IResponse) => {
        this.eventEmitter.removeAllListeners(`response-${requestId}`);
        this.eventEmitter.removeAllListeners(`error-${requestId}`);
        const { data, nFound, nModified, nRemoved } = response;
        switch (action) {
          case EClientActions.UPDATE:
            return resolve({ nFound, nModified });
            break;
          case EClientActions.REMOVE:
            return resolve({ nFound, nRemoved });
            break;
          default:
            return resolve(data);
            break;
        }
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
