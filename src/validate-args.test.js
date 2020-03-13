import { strict as assert } from 'assert';

import validateArgs from './validate-args.js';

export default () => {
  assert.deepEqual(
    validateArgs({
      schema: {
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
      value: {
        a: 1,
        b: 2,
        c: {
          d: 3,
          e: 'foo'
        }
      },
      type: {
        fields: {
          a: { typeArgs: { min: 1 }, type: 'Int' },
          b: 'Int',
          c: {
            fields: {
              d: 'Int',
              e: { nonNull: 'String' },
              f: { defaultValue: 'bar', type: { nonNull: 'String' } }
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
        e: 'foo',
        f: 'bar'
      }
    }
  );
};
