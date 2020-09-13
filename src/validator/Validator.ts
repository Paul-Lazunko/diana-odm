import { Types } from '../constants';
import { ErrorFactory } from "../factory";
import { IValidatorOptions } from '../options';
import { IQuery, ISchema } from '../structures';
import {
  filterQueryValidator,
  transformQueriesValidator,
  setDataValidator,
  sortQueryValidator,
  schemaItemValidator
} from './validationHelpers';
import { objectIdQuery } from './schemas';

export class Validator {
  protected schema: ISchema;
  protected collection: string;

  constructor(options: IValidatorOptions) {
    this.schema = options.schema;
    this.collection = options.collection;
  }

  public self() {
    for ( const property in this.schema ) {
      const validationResult = schemaItemValidator(this.schema[property]);
      if ( validationResult.error ) {
        throw new Error(validationResult.error.message);
      }
    }
  }

  public filterQueries(filterQueries: any | any[]) {
    let validationResult: any;
    for ( let i =0; i < filterQueries.length; i = i + 1) {
      const filterQuery: IQuery = filterQueries[i];
      for ( const key in filterQuery ) {
        if ( ! this.schema[key] ) {
          throw ErrorFactory.collectionError(`property '${key}' doesn't exist in the '${this.collection}' collection's Schema`)
        }
        switch ( this.schema[key].type ) {
          case Types.ARRAY:
            switch(this.schema[key].items) {
              case Types.BOOLEAN:
                validationResult = filterQueryValidator.boolean(filterQuery[key])
                break;
              case Types.STRING:
                validationResult = filterQueryValidator.string(filterQuery[key]);
                break;
              case Types.REFERENCE:
              case Types.OBJECT_ID:
                validationResult = objectIdQuery.string(filterQuery[key]);
                break;
              case Types.NUMBER:
                validationResult = filterQueryValidator.number(filterQuery[key])
                break;
              case Types.TIME:
                validationResult = filterQueryValidator.time(filterQuery[key])
                break;
              case Types.POSITION:
                validationResult = filterQueryValidator.geo(filterQuery[key])
                break;
            }
            break;
          case Types.BOOLEAN:
            validationResult = filterQueryValidator.boolean(filterQuery[key])
            break;
          case Types.STRING:
            validationResult = filterQueryValidator.string(filterQuery[key]);
            break;
          case Types.REFERENCE:
          case Types.OBJECT_ID:
            validationResult = filterQueryValidator.objectId(filterQuery[key]);
            break;
          case Types.NUMBER:
            validationResult = filterQueryValidator.number(filterQuery[key])
            break;
          case Types.TIME:
            validationResult = filterQueryValidator.time(filterQuery[key])
            break;
          case Types.POSITION:
            validationResult = filterQueryValidator.geo(filterQuery[key])
            break;
        }
        if ( validationResult && validationResult.error ) {
          throw ErrorFactory.filtrationError(validationResult.error.message);
        }
      }
    }
  }

  public requiredFields(data: any) {
    for ( const key in this.schema ) {
      if ( this.schema[key].isRequired && !data.hasOwnProperty(key) ) {
        throw ErrorFactory.collectionError(`property '${key}' is required in the '${this.collection}' collection's Schema`);
      }
    }
  }

  public mutableFields(data: any) {
    for ( const key in this.schema ) {
      if ( this.schema[key].isMutable === false && data.hasOwnProperty(key) ) {
        throw ErrorFactory.collectionError(`property '${key}' of the '${this.collection}' collection's Schema is not mutable`);
      }
    }
  }

  public data(data: any) {
    for ( const key in data ) {
      let validationResult: any;
      if ( !this.schema[key] ) {
        validationResult = {
          error: ErrorFactory.collectionError(`property '${key}' doesn't exist in Schema of the collection '${this.collection}'`)
        };
      } else {
        switch ( this.schema[key].type ) {
          case Types.ARRAY:
            switch(this.schema[key].items) {
              case Types.BOOLEAN:
                validationResult = setDataValidator.arrayOfBoolean(data[key])
                break;
              case Types.STRING:
                validationResult = setDataValidator.arrayOfString(data[key])
                break;
              case Types.REFERENCE:
              case Types.OBJECT_ID:
                validationResult = setDataValidator.arrayOfObjectId(data[key])
                break;
              case Types.NUMBER:
                validationResult = setDataValidator.arrayOfNumber(data[key])
                break;
              case Types.TIME:
                validationResult = setDataValidator.arrayOfTime(data[key])
                break;
              case Types.POSITION:
                validationResult = setDataValidator.geo(data[key])
                break;
            }
            break;
          case Types.BOOLEAN:
            validationResult = setDataValidator.boolean(data[key])
            break;
          case Types.STRING:
            validationResult = setDataValidator.string(data[key]);
            break;
          case Types.REFERENCE:
          case Types.OBJECT_ID:
            validationResult = setDataValidator.objectId(data[key]);
            break;
          case Types.NUMBER:
            validationResult = setDataValidator.number(data[key])
            break;
          case Types.TIME:
            validationResult = setDataValidator.time(data[key])
            break;
          case Types.POSITION:
            validationResult = setDataValidator.geo(data[key])
            break;
        }
      }

      if ( validationResult && validationResult.error ) {
        throw ErrorFactory.collectionError(validationResult.error.message)
      }
    }
  }

  public transformQueries(transformQueries: any[]) {
    const validationResult: any  = transformQueriesValidator(transformQueries);
    if ( validationResult && validationResult.error ) {
      throw ErrorFactory.transformError(validationResult.error.message)
    }
  }

  public skip(skip: any) {
    if ( !Number.isInteger(skip) || skip < 0 ) {
      throw ErrorFactory.filtrationError(`property 'skip' should be positive integer`)
    }
  }

  public limit(limit: any) {
    if ( !Number.isInteger(limit) || limit < 0 ) {
      throw ErrorFactory.filtrationError(`property 'limit' should be positive integer`)
    }
  }

  public sortQuery(sortQuery: any) {
    const validationResult = sortQueryValidator(sortQuery);
    if ( validationResult && validationResult.error ) {
      throw ErrorFactory.filtrationError(validationResult.error.message)
    }
  }
}
