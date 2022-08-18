import isArray from './is-array.js';
import isObject from './is-object.js';
import validateValue from './validate-value.js';

export default ({ schema, typeFields }) => {
  const typeObject = {
    resolve: ({ path, value, schema }) => {
      if (isObject(value) && !isArray(value)) {
        return validateValue({
          path,
          schema,
          type: {
            fields: Object.fromEntries(
              Object.keys(value).map(key => [key, type])
            )
          },
          value
        });
      }

      throw new Error(`Expected ${JSON.stringify(value)} to be a type object`);
    }
  };

  const positiveNumber = {
    resolve: ({ value }) => {
      if (typeof value === 'number' && value >= 0) return value;

      throw new Error(
        `Expected ${JSON.stringify(value)} to be a positive number`
      );
    }
  };

  const fn = {
    resolve: ({ value }) => {
      if (typeof value === 'function') return value;

      throw new Error(`Expected ${JSON.stringify(value)} to be a function`);
    }
  };

  const cost = {
    optional: {
      oneOf: { fn, positiveNumber },
      resolveType: value =>
        typeof value === 'function' ? 'fn' : 'positiveNumber'
    }
  };

  typeFields = { ...typeFields, defaultValue: { optional: {} } };
  const type = {};
  Object.assign(type, {
    oneOf: {
      string: {
        resolve: ({ schema, value }) => {
          const keys = Object.keys(schema);
          if (typeof value === 'string' && keys.includes(value)) return value;

          throw new Error(
            `Expected ${JSON.stringify(value)} to be one of ${keys.join(', ')}`
          );
        }
      },
      value: {},
      optional: { fields: { ...typeFields, optional: type } },
      nullable: { fields: { ...typeFields, nullable: type } },
      arrayOf: {
        fields: {
          ...typeFields,
          arrayOf: type,
          minLength: { optional: positiveNumber },
          maxLength: { optional: positiveNumber }
        }
      },
      oneOf: { fields: { ...typeFields, oneOf: typeObject, resolveType: fn } },
      fields: { fields: { ...typeFields, cost, fields: typeObject } },
      resolve: {
        fields: {
          ...typeFields,
          args: { optional: typeObject },
          cost,
          resolve: { optional: { nullable: {} } },
          type: { optional: type },
          typeArgs: { optional: typeObject },
          validateArgs: { optional: fn }
        }
      }
    },
    resolveType: value =>
      typeof value === 'string'
        ? 'string'
        : !isObject(value) || isArray(value)
        ? 'value'
        : 'optional' in value
        ? 'optional'
        : 'nullable' in value
        ? 'nullable'
        : 'arrayOf' in value
        ? 'arrayOf'
        : 'oneOf' in value
        ? 'oneOf'
        : 'fields' in value
        ? 'fields'
        : 'resolve'
  });

  return validateValue({ schema, type: typeObject, value: schema });
};
