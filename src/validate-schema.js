import isObject from './is-object.js';
import validateValue from './validate-value.js';

const { Set } = globalThis;

const { isArray } = Array;

export default ({ extra, schema }) => {
  const typeObject = {
    resolve: ({ value, ...rest }) => {
      if (isObject(value)) {
        return validateValue({
          ...rest,
          type: {
            object: Object.fromEntries(
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
      optional: { object: { ...extra?.optional, ...shared, optional: type } },
      nullable: { object: { ...extra?.nullable, ...shared, nullable: type } },
      arrayOf: {
        object: {
          ...extra?.arrayOf,
          ...shared,
          arrayOf: type,
          minLength: { optional: positiveNumber },
          maxLength: { optional: positiveNumber }
        }
      },
      oneOf: {
        object: {
          ...extra?.oneOf,
          ...shared,
          oneOf: typeObject,
          resolveType: fn
        }
      },
      object: { object: { ...extra?.object, ...shared, object: typeObject } },
      type: {
        object: {
          ...extra?.type,
          ...shared,
          arg: { optional: type },
          resolve: { optional: { nullable: {} } },
          type: { optional: type },
          typeArg: {
            optional: {
              resolve: ({ obj, ...rest }) =>
                validateValue({
                  ...rest,
                  type: (typeof obj.type === 'string'
                    ? rest.schema[obj.type]
                    : obj.type
                  )?.arg
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
        : 'object' in value
        ? 'object'
        : 'type';
    }
  });

  return validateValue({ schema, type: typeObject, value: schema });
};
