import isArray from './is-array.js';
import isObject from './is-object.js';
import validateValue from './validate-value.js';

const getSchema = ({ schema, typeFields }) => ({
  typeObject: {
    resolve: ({ path, value, schema }) => {
      if (isObject(value) && !isArray(value)) {
        return validateValue({
          value,
          path,
          schema,
          type: {
            fields: Object.fromEntries(
              Object.keys(value).map(key => [key, 'type'])
            )
          }
        });
      }

      throw new Error(`Expected ${JSON.stringify(value)} to be a type object`);
    }
  },

  positiveNumber: {
    resolve: ({ value }) => {
      if (typeof value === 'number' && value >= 0) return value;

      throw new Error(
        `Expected ${JSON.stringify(value)} to be a positive number`
      );
    }
  },

  function: {
    resolve: ({ value }) => {
      if (typeof value === 'function') return value;

      throw new Error(`Expected ${JSON.stringify(value)} to be a function`);
    }
  },

  type: {
    oneOf: {
      string: {
        resolve: ({ value }) => {
          const keys = Object.keys(schema);
          if (typeof value === 'string' && keys.includes(value)) return value;

          throw new Error(
            `Expected ${JSON.stringify(value)} to be one of ${keys.join(', ')}`
          );
        }
      },
      value: {},
      optional: { fields: { ...typeFields, optional: 'type' } },
      nullable: { fields: { ...typeFields, nullable: 'type' } },
      arrayOf: {
        fields: {
          ...typeFields,
          arrayOf: 'type',
          minLength: { optional: 'positiveNumber' },
          maxLength: { optional: 'positiveNumber' }
        }
      },
      oneOf: {
        fields: { ...typeFields, oneOf: 'typeObject', resolveType: 'function' }
      },
      fields: { fields: { ...typeFields, fields: 'typeObject' } },
      resolve: {
        fields: {
          ...typeFields,
          args: { optional: 'typeObject' },
          cost: {
            nullable: {
              oneOf: { function: 'function', positiveNumber: 'positiveNumber' },
              resolveType: value =>
                typeof value === 'function' ? 'function' : 'positiveNumber'
            }
          },
          resolve: { optional: { nullable: {} } },
          type: { optional: 'type' },
          typeArgs: { optional: 'typeObject' },
          validateArgs: { optional: 'function' }
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
  }
});

export default ({ schema, typeFields }) =>
  validateValue({
    value: schema,
    type: 'typeObject',
    schema: getSchema({
      schema,
      typeFields: { ...typeFields, defaultValue: { optional: {} } }
    })
  });
