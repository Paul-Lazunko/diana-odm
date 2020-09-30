const joi = require('joi');

import { ErrorFactory } from "../factory";
import {
  numberField,
  numberFieldExtended,
  stringField,
  timeField,
  booleanField,
  arrayOfBooleanField,
  arrayOfNumberField,
  arrayOfStringField,
  arrayOfTimeField,
  stringQuery,
  numberQuery,
  booleanQuery,
  timeQuery,
  schemaItem,
  objectIdField,
  arrayOfObjectIdField,
  objectIdQuery,
  transformQueries,
  geoField,
  arrayOfGeoField,
  geoQuery,
  sortQuery,
  clientOptions,
  modelOptions,
  subscriberOptions,
  migrationOptions
} from './schemas';

import { defaultValidationOptions } from './options';

const filterQueryValidator: any = {
  string(data: any) {
    return stringQuery.validate(data, defaultValidationOptions)
  },
  objectId(data: any) {
    return objectIdQuery.validate(data, defaultValidationOptions)
  },
  boolean(data: any) {
    return  booleanQuery.validate(data, defaultValidationOptions)
  },
  number(data: any) {
    return numberQuery.validate(data, defaultValidationOptions)
  },
  time(data: any) {
    return timeQuery.validate(data, defaultValidationOptions)
  },
  geo(data: any) {
    return geoQuery.validate(data);
  }
};

const setDataValidator: any = {
  boolean(data:any) {
    return booleanField.validate(data, defaultValidationOptions)
  },
  number(data:any) {
    return numberFieldExtended.validate(data, defaultValidationOptions)
  },
  string(data:any) {
    return stringField.validate(data, defaultValidationOptions)
  },
  objectId(data: any) {
    return objectIdField.validate(data, defaultValidationOptions)
  },
  time(data:any) {
    return timeField.validate(data, defaultValidationOptions)
  },
  geo(data: any) {
    return geoField.validate(data, defaultValidationOptions);
  },
  arrayOfBoolean(data:any) {
    return arrayOfBooleanField.validate(data, defaultValidationOptions)
  },
  arrayOfNumber(data:any) {
    return arrayOfNumberField.validate(data, defaultValidationOptions)
  },
  arrayOfString(data:any) {
    return arrayOfStringField.validate(data, defaultValidationOptions)
  },
  arrayOfObjectId(data:any) {
    return arrayOfObjectIdField.validate(data, defaultValidationOptions)
  },
  arrayOfTime(data:any) {
    return arrayOfTimeField.validate(data, defaultValidationOptions)
  },
  arrayOfGeo(data: any) {
    return arrayOfGeoField.validate(data, defaultValidationOptions);
  }
};

const schemaItemValidator = (data: any) => {
  return schemaItem.validate(data, defaultValidationOptions);
};

const transformQueriesValidator = (data: any[]) => {
  return transformQueries.validate(data, defaultValidationOptions);
};

const validateTimeString = (data: any) => {
  return joi.string().isoDate().validate(data);
};

const sortQueryValidator = (data: any) => {
  return sortQuery.validate(data);
};

const validateClientOptions = (data: any) => {
  const validationResult = clientOptions.validate(data, { allowUnknown: false, convert: true });
  if ( validationResult.error ) {
    throw ErrorFactory.configurationError(validationResult.error.message);
  }
};

const validateModelOptions = (options: any) => {
  const validationResult = modelOptions.validate(options, { allowUnknown: false, convert: true });
  if ( validationResult.error ) {
    throw ErrorFactory.optionsError(validationResult.error.message);
  }
};

const validateSubscriberOptions = (options: any) => {
  const validationResult = subscriberOptions.validate(options, { allowUnknown: false, convert: true });
  if ( validationResult.error ) {
    throw ErrorFactory.optionsError(validationResult.error.message);
  }
};

const validateMigrationOptions = (options: any) => {
  const validationResult = migrationOptions.validate(options, { allowUnknown: false, convert: true });
  if ( validationResult.error ) {
    throw ErrorFactory.optionsError(validationResult.error.message);
  }
};

export {
  schemaItemValidator,
  transformQueriesValidator,
  filterQueryValidator,
  setDataValidator,
  sortQueryValidator,
  validateClientOptions,
  validateModelOptions,
  validateSubscriberOptions,
  validateMigrationOptions
}
