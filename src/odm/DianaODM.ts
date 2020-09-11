import { Connection } from '../connection';
import { EClientActions } from '../constants';
import { ErrorFactory, ModelProxyFactory } from '../factory';
import { Migration } from '../migration/Migration';
import { IClientOptions, IMigrationOptions, IModelOptions, IRequestOptions, ISubscriberOptions } from '../options';
import { Request } from '../request';
import { IMigration, IModel } from '../structures';
import { Subscriber } from '../subscriber';
import {
  validateClientOptions,
  validateMigrationOptions,
  validateModelOptions,
  validateSubscriberOptions
} from "../validator";

export class DianaODM {

  protected connection: Connection;
  protected models: Map<string, IModel>;
  protected migration: Map<string, Migration>;
  protected transactionDb: string;

  constructor(options: IClientOptions) {
    validateClientOptions(options);
    this.connection = new Connection(options);
    this.models = new Map<string, IModel>();
    this.migration = new Map<string, Migration>()
  }

  protected get transactionId() {
    return this.connection.transactionId;
  }

  protected set transactionId(transactionId: string) {
    this.connection.transactionId = transactionId;
  }

  protected async init() {
    const models: IModel[] = Array.from(this.models.values());
    await Promise.all(models.map((model: IModel) => model.init()));
  }


  public async connect() {
    await this.connection.connect();
    await this.init();
  }

  public disconnect() {
    return this.connection.disconnect();
  }

  public setModel(modelName: string, options: Partial<IModelOptions>) {
    if ( !modelName ) {
      throw ErrorFactory.optionsError(`specify modelName to set model`)
    }
    if ( this.models.has(modelName) ) {
      throw ErrorFactory.optionsError(`model name should be unique, '${modelName}' is used already`)
    }
    validateModelOptions(options);
    options.connection = this.connection;
    this.models.set(modelName, ModelProxyFactory.construct(options as IModelOptions))
  }


  public getModel(modelName: string): IModel {
    if ( !modelName ) {
      throw ErrorFactory.optionsError(`specify modelName to get model`)
    }
    if ( !this.models.has(modelName) ) {
      throw ErrorFactory.optionsError(`model '${modelName}' doesn't exist`)
    }
    return this.models.get(modelName)
  }

  public setSubscriber(options: ISubscriberOptions) {
    validateSubscriberOptions(options);
    const subscriber: Subscriber = new Subscriber(options);
    this.connection.setSubscriber(subscriber);
  }

  public setMigration(options: IMigrationOptions) {
    if ( this.migration.has(options.name) ) {
      throw ErrorFactory.optionsError(`migration name should be unique, '${options.name}' is used already`)
    }
    validateMigrationOptions(options);
    this.migration.set(options.name, new Migration((options)));
  }

  public async migrateUp() {
    const request: Request = new Request({
      connection: this.connection,
      action: EClientActions.GET_MIGRATIONS
    });
    const remoteMigrations: string[] = await request.execute();
    const ownMigration = Array.from(this.migration.keys());
    for ( let i = 0; i < ownMigration.length; i++ ) {
      const migrationName: string = ownMigration[i];
      if ( ! remoteMigrations.includes(migrationName) ) {
        const migration: Migration = this.migration.get(migrationName);
        await migration.up();
        const requestUp = new Request({
          migration: migrationName,
          connection: this.connection,
          action: EClientActions.MIGRATE_UP
        });
        await requestUp.execute();
      }
    }
  }

  public async migrateDown() {
    const request: Request = new Request({
      connection: this.connection,
      action: EClientActions.GET_MIGRATIONS
    });
    const remoteMigrations: string[] = await request.execute();
    const ownMigration = Array.from(this.migration.keys());
    for ( let i = 0; i < ownMigration.length; i++ ) {
      const migrationName: string = ownMigration[i];
      if ( remoteMigrations.includes(migrationName) ) {
        const migration: Migration = this.migration.get(migrationName);
        await migration.down();
        const requestDown = new Request({
          migration: migrationName,
          connection: this.connection,
          action: EClientActions.MIGRATE_DOWN
        });
        await requestDown.execute();
      }
    }
  }

  public async startTransaction(databaseName: string, autoRollBackAfterMS: number): Promise<void> {
    if ( !databaseName ) {
      throw ErrorFactory.transactionError('You should specify database to start transaction');
    }
    if ( !autoRollBackAfterMS || typeof autoRollBackAfterMS !== 'number' || autoRollBackAfterMS < 0) {
      throw ErrorFactory.transactionError('autoRollBackAfterMS should be positive integer');
    } else {
      autoRollBackAfterMS = Math.round(autoRollBackAfterMS);
    }
    if ( this.transactionId ) {
      throw ErrorFactory.transactionError('previous transaction should be committed or rolled back');
    }
    this.transactionDb = databaseName;
    const options: Partial<IRequestOptions> = {
      connection: this.connection,
      database: databaseName
    };
    options.action = EClientActions.START_TRANSACTION;
    options.autoRollbackAfterMS = autoRollBackAfterMS;
    const response: any = await new Request(options).execute();
    this.transactionId = response.transactionId;
  }

  public rollbackTransaction() {
    if ( !this.transactionId ) {
      throw ErrorFactory.transactionError('You should start transaction before You roll back it');
    }
    const options: Partial<IRequestOptions> = {
      transactionId: this.transactionId,
      connection: this.connection,
      database: this.transactionDb.toString(),
      action: EClientActions.ROLLBACK_TRANSACTION
    };
    delete this.connection.transactionId;
    return new Request(options).execute();
  }

  public commitTransaction() {
    if ( !this.transactionId ) {
      throw ErrorFactory.transactionError('You should start transaction before You roll back it');
    }
    const options: Partial<IRequestOptions> =  {
      transactionId: this.transactionId,
      connection: this.connection,
      action:  EClientActions.COMMIT_TRANSACTION,
      database: this.transactionDb.toString()
    };
    delete this.connection.transactionId;
    return new Request(options).execute();
  }


}
