import { ISchema } from '../structures';

export const compareSchemas = (schemaA: ISchema, schemaB: ISchema): boolean => {
  if ( !subCompareSchemas(schemaA, schemaB) ) {
    return false
  } else {
    return subCompareSchemas(schemaB, schemaA)
  }
};

const subCompareSchemas = (schemaA: ISchema, schemaB: ISchema): boolean => {
  let result: boolean = false;
    for ( const key in schemaA ) {
      if (  key !== '_id' ) {
        if (  !schemaB[key] ) {
          console.log({key}, schemaA[key], schemaB[key])
          result = true;
          break;
        } else {
          let subResult: boolean = false;
          for (const property in schemaA[key] ) {
            // @ts-ignore
            if ( property !=='default' && ( !schemaB[key][property] || schemaB[key][property] !== schemaA[key][property] ) ) {
              // @ts-ignore
              subResult = true;
              break;
            }
          }
          if ( subResult ) {
            result = true;
            break;
          }
        }
      }
    }
    return result;
};
