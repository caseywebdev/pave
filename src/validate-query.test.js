import { strict as assert } from 'assert';

import validateQuery from './validate-query.js';

export default () => {
  assert.deepEqual(
    validateQuery({
      schema: {
        Root: {
          fields: {
            sum: {
              args: {
                a: {
                  nonNull: 'Int'
                },
                b: {
                  defaultValue: 1,
                  nonNull: { typeArgs: { min: 1 }, type: 'Int' }
                }
              },
              type: { notNull: 'Int' }
            },
            oneOf: {
              oneOf: ['Foo', 'Bar']
            }
          }
        },
        Foo: {
          name: 'Foo',
          fields: {
            id: {},
            fooField: {}
          }
        },
        Bar: {
          name: 'Bar',
          fields: {
            id: {},
            barField: {}
          }
        },
        Int: {
          args: { min: { defaultValue: 2 }, max: {} },
          resolve: ({ args: { min, max }, value }) => {
            if (!Number.isInteger(value)) {
              throw new Error(`Not an int: ${value}`);
            }

            if (min != null && value < min) throw new Error('Too small');

            if (max != null && value > max) throw new Error('Too big');

            return value;
          }
        },
        String: {
          resolve: ({ value }) => {
            if (typeof value === 'string') return value;

            throw new Error(`Not a string: ${value}`);
          }
        }
      },
      query: {
        sum: {
          _args: { a: 3 }
        },
        oneOf: {
          id: {},
          _onFoo: {
            fooField: {
              _args: {}
            }
          }
        }
      },
      type: 'Root'
    }),
    {
      sum: {
        _args: {
          a: 3,
          b: 1
        }
      },
      oneOf: {
        _onBar: { id: {} },
        _onFoo: { id: {}, fooField: {} }
      }
    }
  );
};
