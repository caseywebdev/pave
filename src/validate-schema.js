import isObject from './is-object.js';
import validateValue from './validate-value.js';

const { Set } = globalThis;

const { isArray } = Array;

export default ({ extraFields, schema }) => {
  const typeObject = {
    resolve: ({ value, ...rest }) => {
      if (isObject(value)) {
        return validateValue({
          ...rest,
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

  const seenValues = new Set();
  const type = {};
  const shared = {
    cost: {
      optional: {
        oneOf: { fn, positiveNumber },
        resolveType: value =>
          typeof value === 'function' ? 'fn' : 'positiveNumber'
      }
    },
    defaultValue: { optional: {} },
    validate: { optional: fn }
  };
  Object.assign(type, {
    oneOf: {
      recursive: {},
      string: {
        resolve: ({ schema, value }) => {
          const keys = Object.keys(schema);
          if (typeof value === 'string' && keys.includes(value)) return value;

          throw new Error(
            `Expected ${JSON.stringify(value)} to be one of ${keys.join(', ')}`
          );
        }
      },
      tuple: { arrayOf: type },
      optional: {
        fields: { ...extraFields?.optional, ...shared, optional: type }
      },
      nullable: {
        fields: { ...extraFields?.nullable, ...shared, nullable: type }
      },
      arrayOf: {
        fields: {
          ...extraFields?.arrayOf,
          ...shared,
          arrayOf: type,
          minLength: { optional: positiveNumber },
          maxLength: { optional: positiveNumber }
        }
      },
      oneOf: {
        fields: {
          ...extraFields?.oneOf,
          ...shared,
          oneOf: typeObject,
          resolveType: fn
        }
      },
      fields: {
        fields: { ...extraFields?.fields, ...shared, fields: typeObject }
      },
      resolve: {
        fields: {
          ...extraFields?.type,
          ...shared,
          args: { optional: type },
          resolve: { optional: { nullable: {} } },
          type: { optional: type },
          typeArgs: {
            optional: {
              resolve: ({ parent, ...rest }) =>
                validateValue({
                  ...rest,
                  type: (typeof parent.type === 'string'
                    ? rest.schema[parent.type]
                    : parent.type
                  )?.args
                })
            }
          }
        }
      }
    },
    resolveType: value => {
      if (seenValues.has(value)) return 'recursive';

      if (typeof value === 'string') return 'string';

      if (!isObject(value)) return 'invalid';

      if (isArray(value)) return 'tuple';

      seenValues.add(value);

      return 'optional' in value
        ? 'optional'
        : 'nullable' in value
        ? 'nullable'
        : 'arrayOf' in value
        ? 'arrayOf'
        : 'oneOf' in value
        ? 'oneOf'
        : 'fields' in value
        ? 'fields'
        : 'resolve';
    }
  });

  return validateValue({ schema, type: typeObject, value: schema });
};
