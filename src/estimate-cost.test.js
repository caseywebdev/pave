import { strict as assert } from 'assert';

import estimateCost from './estimate-cost.js';

export default () => {
  assert.equal(
    estimateCost({
      schema: {
        Root: {
          cost: ({ cost }) => cost * 3,
          fields: {
            foo: {
              cost: 5
            },
            bar: { cost: 10 },
            baz: {
              args: { size: {} },
              cost: ({ args: { size }, cost }) => size * cost,
              type: {
                fields: {
                  a: { cost: 1 },
                  b: { cost: 2 },
                  c: { cost: 3 }
                }
              }
            }
          }
        }
      },
      type: 'Root',
      query: {
        foo: {}, // 5
        bar: {}, // 10
        bar2: { _field: 'bar' }, // 10
        baz: { _args: { size: 10 }, a: {}, b: {}, c: {} } // 60
      } // 85 * 3 = 255
    }),
    255
  );
};
