/** @import {Schema} from '#src/index.js'; */

import { isObject } from '#src/is-object.js';
import { validateValue } from '#src/validate-value.js';

const { Set } = globalThis;

const { isArray } = Array;

/** @param {{ extensions?: { [K: string]: any }; schema: S }} options */
export const validateSchema = ({ extensions, schema }) => {
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
        resolve: ({ path, schema, value }) => {
          const keys = Object.keys(schema);
          if (typeof value === 'string' && keys.includes(value)) return value;

          throw new Error(
            `Expected ${JSON.stringify(value)} at ${`"${path.join('"."')}"`} to be one of ${keys.join(', ')}`
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
          oneOf: {
            type: typeObject,
            validate: ({ path, value }) => {
              if (!Object.keys(value).length) {
                throw new Error(
                  `Expected ${`"${path.join('"."')}"`} to define at least one type`
                );
              }

              for (const key in value) {
                const type = value[key];

                if (typeof type === 'string') {
                  if (key !== type) {
                    throw new Error(
                      `Expected "${key}" at ${`"${path.join('"."')}" to equal "${type}"`}`
                    );
                  }
                } else if (key in schema) {
                  throw new Error(
                    `Expected "${key}" at ${`"${path.join('"."')}" to either equal "${key}" be renamed or to avoid ambiguity`}`
                  );
                }
              }

              return value;
            }
          },
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
          input: { optional: type },
          resolve: { optional: { nullable: {} } },
          type: { optional: type },
          typeInput: { optional: { nullable: {} } }
        },
        validate: ({ path, value, ...rest }) => {
          validateValue({
            ...rest,
            path: [...path, 'typeInput'],
            type: (typeof value.type === 'string'
              ? rest.schema[value.type]
              : value.type
            )?.input,
            value: value.typeInput
          });
          return value;
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
