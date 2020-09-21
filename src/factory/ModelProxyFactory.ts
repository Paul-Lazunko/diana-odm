import { Model } from '../model/Model';
import { IModelOptions } from '../options';
import { IModel } from '../structures/IModel';

export class ModelProxyFactory {

  protected static methods: string[] = [
    'find',
    'count',
    'update',
    'remove',
    'insert',
    'init',
    'startTransaction',
    'commitTransaction',
    'rollbackTransaction',
  ];

  protected static models: Map<string, Map<string, Model>> = new Map<string, Map<string, Model>>();

  public static construct(options: IModelOptions) {
    const model = ModelProxyFactory.getModel(options);
    return new Proxy(model, {
      get(target: Model, method: string) {
        if (typeof target[method] === 'function' && ModelProxyFactory.methods.includes(method)) {
          return target[method].bind(model);
        } else {
          return undefined;
        }
      },
    }) as IModel;
  }

  protected static setModel(options: IModelOptions ){
    const { database, collection } = options;
    if ( !ModelProxyFactory.models.has(database) ) {
      ModelProxyFactory.models.set(database, new Map<string, Model>());
    }
    const model: Model = new Model(options);
    ModelProxyFactory.models.get(database).set(collection, model)
  }

  protected static getModel(options: IModelOptions) {
    const { database, collection } = options;
    if ( ! ModelProxyFactory.models.has(database) || ! ModelProxyFactory.models.get(database).has(collection) ) {
      ModelProxyFactory.setModel(options);
    }
    return  ModelProxyFactory.models.get(database).get(collection)
  }
}

