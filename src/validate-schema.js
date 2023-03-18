import isObject from './is-object.js';
import validateValue from './validate-value.js';

const { Set } = globalThis;

const { isArray } = Array;

export default ({ extensions, schema }) => {
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
  const typeObject = { object: {}, defaultType: type };
  const shared = {
    cost: {
      optional: {
        oneOf: { fn, positiveNumber },
        resolveType: value =>
          typeof value === 'function' ? 'fn' : 'positiveNumber'
      }
    },
    defaultValue: { optional: { nullable: {} } },
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
        object: { ...extensions?.optional, ...shared, optional: type }
      },
      nullable: {
        object: { ...extensions?.nullable, ...shared, nullable: type }
      },
      arrayOf: {
        object: {
          ...extensions?.arrayOf,
          ...shared,
          arrayOf: type,
          minLength: { optional: positiveNumber },
          maxLength: { optional: positiveNumber }
        }
      },
      oneOf: {
        object: {
          ...extensions?.oneOf,
          ...shared,
          oneOf: typeObject,
          resolveType: fn
        }
      },
      object: {
        object: {
          ...extensions?.object,
          ...shared,
          object: typeObject,
          defaultType: { optional: type }
        }
      },
      resolve: {
        object: {
          ...extensions?.resolve,
          ...shared,
          args: { optional: type },
          resolve: { optional: { nullable: {} } },
          type: { optional: type },
          typeArgs: {
            optional: {
              resolve: ({ object, ...rest }) =>
                validateValue({
                  ...rest,
                  type: (typeof object.type === 'string'
                    ? rest.schema[object.type]
                    : object.type
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

      return value.optional
        ? 'optional'
        : value.nullable
        ? 'nullable'
        : value.arrayOf
        ? 'arrayOf'
        : value.oneOf
        ? 'oneOf'
        : value.object
        ? 'object'
        : 'resolve';
    }
  });

  return validateValue({ schema, type: typeObject, value: schema });
};
