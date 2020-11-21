import { strict as assert } from 'assert';

import validateArgs from './validate-args.js';

export default {
  'without validate fn': () =>
    assert.deepEqual(
      validateArgs({
        schema: {
          Int: {
            args: { min: { defaultValue: 2 }, max: { optional: {} } },
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
        args: {
          a: 1,
          b: 2,
          c: {
            d: 3,
            e: ['foo', 'buz', null]
          }
        },
        type: {
          args: {
            a: { typeArgs: { min: 1 }, type: 'Int' },
            b: 'Int',
            c: {
              fields: {
                d: 'Int',
                e: {
                  arrayOf: { nullable: 'String' },
                  minLength: 3,
                  maxLength: 3
                },
                f: { defaultValue: 'bar', type: 'String' }
              }
            }
          }
        }
      }),
      {
        a: 1,
        b: 2,
        c: {
          d: 3,
          e: ['foo', 'buz', null],
          f: 'bar'
        }
      }
    ),

  'with validate fn': () => {
    const schema = { int: {} };
    const type = {
      args: { a: 'int', b: 'int' },
      validate: ({ args, args: { a, b } }) => {
        if (a + b > 3) throw new Error('invalid');

        return args;
      }
    };
    assert.deepEqual(validateArgs({ schema, type, args: { a: 1, b: 2 } }), {
      a: 1,
      b: 2
    });

    try {
      validateArgs({ schema, type, args: { a: 2, b: 2 } });
      throw new Error('Expected a validation error to be thrown');
    } catch (er) {
      if (er.message !== 'invalid') {
        throw new Error('Expected validation error to be thrown');
      }
    }
  }
};
