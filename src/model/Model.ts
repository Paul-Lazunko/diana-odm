import { EClientActions } from '../constants';
import { compareSchemas } from '../helpers';
import { IModelOptions, IRequestOptions } from '../options';
import { IResponse, ISchema, ISortQuery, IModel, IQuery, ISetData, ITransformQuery } from '../structures';
import { Request } from '../request';
import { Validator } from '../validator';

export class Model implements IModel {

  protected _isInitialized: boolean;

  protected options: IModelOptions;
  protected validate: Validator;

  constructor(options: IModelOptions) {
    this.options = options;
    this.validate = new Validator({ collection: this.options.collection, schema: this.options.schema });
    this.validate.self();
  }

  protected get transactionId() {
    return this.options.connection.transactionId;
  }

  protected get isInitialized() {
    return this._isInitialized;
  }

  public async init(): Promise<void> {
    const collectionExists: boolean = await this.checkCollectionExistence();
    if ( collectionExists ) {
      const remoteSchema: ISchema = await this.getRemoteSchema();
      const isDifferent: boolean = this.compareSchemas(remoteSchema);
      if ( isDifferent ) {
        await this.updateSchema();
      }
    } else {
      await this.createCollection();
    }
    this._isInitialized = true;
  }

  protected async checkCollectionExistence(): Promise<boolean> {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    options.action = EClientActions.GET_COLLECTION_NAMES;
    const collections: string[] = await this.request(options);
    return collections.includes(this.options.collection);
  }

  protected async createCollection(): Promise<any> {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    options.action = EClientActions.ADD_COLLECTION;
    options.schema = this.getConvertedSchema();
    return this.request(options);
  }

  protected getConvertedSchema(): ISchema {
    const schema: { [key: string]: { [key: string]: any} } = {};
    for ( const key in this.options.schema) {
      schema[key] = {};
      for ( const option in this.options.schema[key] ) {
        if ( option !== 'default' ) {
          // @ts-ignore
          schema[key][option] = this.options.schema[key][option];
        }
      }
    }
    return schema as ISchema;
  }

  protected async getRemoteSchema(): Promise<ISchema> {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    options.action = EClientActions.GET_COLLECTION_SCHEMA;
    return this.request(options);
  }

  protected compareSchemas(schema: ISchema): boolean {
   return compareSchemas(schema, schema)
  }

  protected updateSchema(): Promise<any> {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    options.action = EClientActions.UPDATE_COLLECTION;
    options.schema = this.getConvertedSchema();
    return this.request(options);
  }

  protected getBaseOptions(): Partial<IRequestOptions> {
    const options: Partial<IRequestOptions> =  {
      database: this.options.database,
      collection: this.options.collection,
      connection: this.options.connection,
    };
    if ( this.transactionId ) {
      options.transactionId = this.transactionId;
    }
    return options;
  }

  protected request(options: Partial<IRequestOptions>): Promise<any|any[]> {
    return new Request(options).execute();
  }

  public insert(data: ISetData): Promise<IResponse> {
    for ( const key in this.options.schema ) {
      if ( this.options.schema[key]?.default  ) {
        if ( typeof this.options.schema[key].default === 'function' ) {
          data[key] = this.options.schema[key].default.apply(data,[]);
        } else {
          data[key] = this.options.schema[key].default;
        }
      }
    }
    this.validate.requiredFields(data);
    this.validate.data(data);
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    options.setData = data;
    options.action = EClientActions.INSERT;
    return this.request(options);
  }

  protected convertFilterQueries(filterQueries: IQuery | IQuery[]): IQuery[] {
    if ( !Array.isArray(filterQueries) ) {
      filterQueries = [ filterQueries ];
    }
    return filterQueries.map((item: IQuery) => {
      for ( const key in item ) {
        if ( Array.isArray(item[key]) ) {
          item[key] = { $in: item[key] };
        } else if ( item[key] && typeof item[key] !== 'object') {
          item[key] = { $eq: item[key] }
        }
      }
      return item;
    });
  }

  public find(filterQueries: IQuery | IQuery[] = [{}], transformQueries?:ITransformQuery[], sortQuery?: ISortQuery, skip?: number, limit?:number): Promise<any[]> {
    filterQueries = this.convertFilterQueries(filterQueries);
    this.validate.filterQueries(filterQueries);
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    options.filterQueries = filterQueries;
    if ( transformQueries ) {
      this.validate.transformQueries(transformQueries);
      options.transformQueries = transformQueries;
    }
    if ( sortQuery ) {
      this.validate.sortQuery(sortQuery);
      options.sortQuery = sortQuery;
    }
    if ( skip ) {
      this.validate.skip(skip)
      options.skip = skip
    }
    if ( limit ) {
      this.validate.limit(limit);
      options.limit = limit
    }
    options.action = EClientActions.FIND;
    return this.request(options);
  }

  public count(filterQueries:  IQuery | IQuery[] = [{}], transformQueries?:any[]) {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    filterQueries = this.convertFilterQueries(filterQueries);
    this.validate.filterQueries(filterQueries);
    options.filterQueries = filterQueries;
    if ( transformQueries ) {
      this.validate.transformQueries(transformQueries);
      options.transformQueries = transformQueries;
    }
    options.action = EClientActions.COUNT;
    return this.request(options);
  }

  public update(filterQueries:  IQuery | IQuery[] = [{}], updateData: ISetData): Promise<any> {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    filterQueries = this.convertFilterQueries(filterQueries);
    this.validate.filterQueries(filterQueries);
    this.validate.mutableFields(updateData);
    this.validate.data(updateData);
    options.filterQueries = filterQueries;
    options.setData = updateData;
    options.action = EClientActions.UPDATE;
    return this.request(options);
  }

  public remove(filterQueries:  IQuery | IQuery[] = [{}]): Promise<any> {
    const options: Partial<IRequestOptions> = this.getBaseOptions();
    filterQueries = this.convertFilterQueries(filterQueries);
    this.validate.filterQueries(filterQueries);
    options.filterQueries = filterQueries;
    options.action = EClientActions.REMOVE;
    return this.request(options);
  }

}
